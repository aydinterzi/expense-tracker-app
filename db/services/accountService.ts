import { eq } from "drizzle-orm";
import { db } from "../client";
import { Account, accounts, NewAccount } from "../schema/accounts";

export const accountService = {
  async getAllAccounts(): Promise<Account[]> {
    return await db.select().from(accounts);
  },

  async getActiveAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.isActive, true));
  },

  async getAccountById(id: number): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id));
    return result[0];
  },

  async createAccount(
    account: Omit<NewAccount, "id" | "createdAt" | "updatedAt">
  ): Promise<Account> {
    const newAccount = {
      ...account,
      currentBalance: account.initialBalance || 0,
    };
    const result = await db.insert(accounts).values(newAccount).returning();
    return result[0];
  },

  async updateAccount(
    id: number,
    updates: Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>
  ): Promise<Account | undefined> {
    const result = await db
      .update(accounts)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(accounts.id, id))
      .returning();
    return result[0];
  },

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return result.changes > 0;
  },

  async updateAccountBalance(
    id: number,
    newBalance: number
  ): Promise<Account | undefined> {
    const result = await db
      .update(accounts)
      .set({
        currentBalance: newBalance,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accounts.id, id))
      .returning();
    return result[0];
  },

  async getTotalBalance(): Promise<number> {
    const activeAccounts = await this.getActiveAccounts();
    return activeAccounts.reduce(
      (total, account) => total + (account.currentBalance || 0),
      0
    );
  },
};
