import { create } from "zustand";
import {
  BudgetAlert,
  BudgetFilters,
  BudgetWithDetails,
  checkBudgetAlerts,
  createBudget,
  CreateBudgetData,
  deleteBudget,
  getActiveBudgets,
  getBudgetAlerts,
  getBudgetById,
  getBudgets,
  getBudgetSummary,
  markAlertAsRead,
  updateBudget,
} from "../db/services/budgetService";

interface BudgetSummary {
  totalBudgets: number;
  totalBudgetAmount: number;
  totalSpent: number;
  totalRemaining: number;
  averageSpentPercentage: number;
  budgetsOnTrack: number;
  budgetsInWarning: number;
  budgetsExceeded: number;
}

interface BudgetStore {
  // State
  budgets: BudgetWithDetails[];
  activeBudgets: BudgetWithDetails[];
  alerts: BudgetAlert[];
  summary: BudgetSummary | null;
  loading: boolean;
  error: string | null;

  // Filters
  filters: BudgetFilters;

  // Actions
  loadBudgets: (filters?: BudgetFilters) => Promise<void>;
  loadActiveBudgets: () => Promise<void>;
  getBudget: (id: number) => Promise<BudgetWithDetails | null>;
  addBudget: (data: CreateBudgetData) => Promise<void>;
  editBudget: (
    id: number,
    updates: Partial<BudgetWithDetails>
  ) => Promise<void>;
  removeBudget: (id: number) => Promise<void>;

  // Progress & Alerts
  refreshBudgetProgress: () => Promise<void>;
  checkAlerts: () => Promise<BudgetAlert[]>;
  loadAlerts: (isRead?: boolean) => Promise<void>;
  markAlertRead: (alertId: number) => Promise<void>;

  // Summary & Analytics
  loadSummary: () => Promise<void>;

  // Filters
  setFilters: (filters: Partial<BudgetFilters>) => void;
  clearFilters: () => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // Initial state
  budgets: [],
  activeBudgets: [],
  alerts: [],
  summary: null,
  loading: false,
  error: null,
  filters: {},

  // Load all budgets
  loadBudgets: async (filters?: BudgetFilters) => {
    try {
      set({ loading: true, error: null });
      const budgets = await getBudgets(filters || get().filters);
      set({ budgets, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load budgets",
        loading: false,
      });
    }
  },

  // Load active budgets only
  loadActiveBudgets: async () => {
    try {
      set({ loading: true, error: null });
      const activeBudgets = await getActiveBudgets();
      set({ activeBudgets, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load active budgets",
        loading: false,
      });
    }
  },

  // Get specific budget
  getBudget: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const budget = await getBudgetById(id);
      set({ loading: false });
      return budget;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load budget",
        loading: false,
      });
      return null;
    }
  },

  // Add new budget
  addBudget: async (data: CreateBudgetData) => {
    try {
      set({ loading: true, error: null });
      await createBudget(data);

      // Reload budgets and active budgets
      await Promise.all([
        get().loadBudgets(),
        get().loadActiveBudgets(),
        get().loadSummary(),
      ]);

      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create budget",
        loading: false,
      });
    }
  },

  // Edit existing budget
  editBudget: async (id: number, updates: Partial<BudgetWithDetails>) => {
    try {
      set({ loading: true, error: null });
      await updateBudget(id, updates);

      // Update local state
      const { budgets, activeBudgets } = get();
      const updatedBudgets = budgets.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget
      );
      const updatedActiveBudgets = activeBudgets.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget
      );

      set({
        budgets: updatedBudgets,
        activeBudgets: updatedActiveBudgets,
        loading: false,
      });

      // Reload summary to reflect changes
      await get().loadSummary();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update budget",
        loading: false,
      });
    }
  },

  // Remove budget
  removeBudget: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await deleteBudget(id);

      // Remove from local state
      const { budgets, activeBudgets } = get();
      const filteredBudgets = budgets.filter((budget) => budget.id !== id);
      const filteredActiveBudgets = activeBudgets.filter(
        (budget) => budget.id !== id
      );

      set({
        budgets: filteredBudgets,
        activeBudgets: filteredActiveBudgets,
        loading: false,
      });

      // Reload summary
      await get().loadSummary();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete budget",
        loading: false,
      });
    }
  },

  // Refresh budget progress for all budgets
  refreshBudgetProgress: async () => {
    try {
      set({ loading: true, error: null });

      // Reload budgets to get updated progress
      await Promise.all([
        get().loadBudgets(),
        get().loadActiveBudgets(),
        get().loadSummary(),
      ]);

      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh budget progress",
        loading: false,
      });
    }
  },

  // Check for new budget alerts
  checkAlerts: async () => {
    try {
      const newAlerts = await checkBudgetAlerts();

      // Update alerts in store
      const currentAlerts = get().alerts;
      const updatedAlerts = [...newAlerts, ...currentAlerts];
      set({ alerts: updatedAlerts });

      return newAlerts;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to check budget alerts",
      });
      return [];
    }
  },

  // Load budget alerts
  loadAlerts: async (isRead?: boolean) => {
    try {
      const alerts = await getBudgetAlerts(isRead);
      set({ alerts });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load alerts",
      });
    }
  },

  // Mark alert as read
  markAlertRead: async (alertId: number) => {
    try {
      await markAlertAsRead(alertId);

      // Update local state
      const alerts = get().alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );
      set({ alerts });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark alert as read",
      });
    }
  },

  // Load budget summary
  loadSummary: async () => {
    try {
      const summary = await getBudgetSummary();
      set({ summary });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load budget summary",
      });
    }
  },

  // Set filters
  setFilters: (filters: Partial<BudgetFilters>) => {
    const currentFilters = get().filters;
    const newFilters = { ...currentFilters, ...filters };
    set({ filters: newFilters });

    // Reload budgets with new filters
    get().loadBudgets(newFilters);
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: {} });
    get().loadBudgets({});
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      budgets: [],
      activeBudgets: [],
      alerts: [],
      summary: null,
      loading: false,
      error: null,
      filters: {},
    });
  },
}));
