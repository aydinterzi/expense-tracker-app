import { create } from "zustand";
import { Transaction } from "../db/schema/transactions";
import {
  TransactionFilters,
  transactionService,
} from "../db/services/transactionService";

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;

  // Actions
  loadTransactions: () => Promise<void>;
  loadTransactionsByFilters: (filters: TransactionFilters) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTransaction: (
    id: number,
    updates: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  filters: {},

  loadTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await transactionService.getAllTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load transactions",
        loading: false,
      });
    }
  },

  loadTransactionsByFilters: async (filters: TransactionFilters) => {
    set({ loading: true, error: null, filters });
    try {
      const transactions = await transactionService.getTransactionsByFilters(
        filters
      );
      set({ transactions, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load transactions",
        loading: false,
      });
    }
  },

  addTransaction: async (transactionData) => {
    set({ loading: true, error: null });
    try {
      const newTransaction = await transactionService.createTransaction(
        transactionData
      );
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add transaction",
        loading: false,
      });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedTransaction = await transactionService.updateTransaction(
        id,
        updates
      );
      if (updatedTransaction) {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? updatedTransaction : t
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update transaction",
        loading: false,
      });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const success = await transactionService.deleteTransaction(id);
      if (success) {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete transaction",
        loading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
