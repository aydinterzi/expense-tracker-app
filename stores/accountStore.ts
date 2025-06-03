import { create } from "zustand";
import { Account } from "../db/schema/accounts";
import { accountService } from "../db/services/accountService";

interface AccountStore {
  accounts: Account[];
  loading: boolean;
  error: string | null;

  // Actions
  loadAccounts: () => Promise<void>;
  addAccount: (
    account: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateAccount: (id: number, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccountBalance: (id: number, newBalance: number) => Promise<void>;
  getTotalBalance: () => Promise<number>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  loadAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await accountService.getAllAccounts();
      set({ accounts, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load accounts",
        loading: false,
      });
    }
  },

  addAccount: async (accountData) => {
    set({ loading: true, error: null });
    try {
      const newAccount = await accountService.createAccount(accountData);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add account",
        loading: false,
      });
    }
  },

  updateAccount: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedAccount = await accountService.updateAccount(id, updates);
      if (updatedAccount) {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? updatedAccount : a
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update account",
        loading: false,
      });
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      const success = await accountService.deleteAccount(id);
      if (success) {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete account",
        loading: false,
      });
    }
  },

  updateAccountBalance: async (id, newBalance) => {
    try {
      const updatedAccount = await accountService.updateAccountBalance(
        id,
        newBalance
      );
      if (updatedAccount) {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? updatedAccount : a
          ),
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update account balance",
      });
    }
  },

  getTotalBalance: async () => {
    try {
      return await accountService.getTotalBalance();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get total balance",
      });
      return 0;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
