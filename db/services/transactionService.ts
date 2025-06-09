import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../client";
import {
  NewTransaction,
  Transaction,
  transactions,
} from "../schema/transactions";
import { accountService } from "./accountService";

export interface TransactionFilters {
  accountId?: number;
  categoryId?: number;
  type?: "expense" | "income" | "transfer";
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export const transactionService = {
  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  },

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result[0];
  },

  async getTransactionsByFilters(
    filters: TransactionFilters
  ): Promise<Transaction[]> {
    const conditions = [];

    if (filters.accountId) {
      conditions.push(eq(transactions.accountId, filters.accountId));
    }
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.dateFrom) {
      conditions.push(gte(transactions.date, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(transactions.date, filters.dateTo));
    }
    if (filters.amountMin) {
      conditions.push(gte(transactions.amount, filters.amountMin));
    }
    if (filters.amountMax) {
      conditions.push(lte(transactions.amount, filters.amountMax));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.date), desc(transactions.createdAt));
    }

    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  },

  async createTransaction(
    transaction: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    // Create transaction
    const result = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    const newTransaction = result[0];

    // Update account balance
    await this.updateAccountBalance(newTransaction);

    return newTransaction;
  },

  async updateTransaction(
    id: number,
    updates: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>
  ): Promise<Transaction | undefined> {
    // Get original transaction to reverse balance change
    const originalTransaction = await this.getTransactionById(id);
    if (!originalTransaction) return undefined;

    // Update transaction
    const result = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(transactions.id, id))
      .returning();

    const updatedTransaction = result[0];

    // Reverse original balance change
    await this.reverseAccountBalance(originalTransaction);

    // Apply new balance change
    await this.updateAccountBalance(updatedTransaction);

    return updatedTransaction;
  },

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) return false;

    // Reverse balance change
    await this.reverseAccountBalance(transaction);

    // Delete transaction
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.changes > 0;
  },

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  },

  async getTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(gte(transactions.date, startDate), lte(transactions.date, endDate))
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  },

  async updateAccountBalance(transaction: Transaction): Promise<void> {
    const account = await accountService.getAccountById(transaction.accountId);
    if (!account) return;

    let newBalance = account.currentBalance || 0;

    if (transaction.type === "income") {
      newBalance += transaction.amount;
    } else if (transaction.type === "expense") {
      newBalance -= transaction.amount;
    }

    await accountService.updateAccountBalance(
      transaction.accountId,
      newBalance
    );
  },

  async reverseAccountBalance(transaction: Transaction): Promise<void> {
    const account = await accountService.getAccountById(transaction.accountId);
    if (!account) return;

    let newBalance = account.currentBalance || 0;

    if (transaction.type === "income") {
      newBalance -= transaction.amount;
    } else if (transaction.type === "expense") {
      newBalance += transaction.amount;
    }

    await accountService.updateAccountBalance(
      transaction.accountId,
      newBalance
    );
  },
};
