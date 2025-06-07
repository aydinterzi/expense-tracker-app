import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { and, desc, eq, gte, lte, sum } from "drizzle-orm";
import { db } from "../client";
import { accounts } from "../schema/accounts";
import {
  Budget,
  BudgetAlert,
  budgetAlerts,
  budgets,
  InsertBudgetAlert,
} from "../schema/budgets";
import { categories } from "../schema/categories";
import { transactions } from "../schema/transactions";

// Re-export types for convenience
export type { BudgetAlert };

export interface BudgetWithDetails extends Budget {
  categoryName?: string | null;
  accountName?: string | null;
  progress: {
    spent: number;
    remaining: number;
    percentage: number;
    status: "good" | "warning" | "exceeded";
  };
}

export interface CreateBudgetData {
  name: string;
  categoryId?: number;
  accountId?: number;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  alertPercentage?: number;
}

export interface BudgetFilters {
  period?: "daily" | "weekly" | "monthly" | "yearly";
  categoryId?: number;
  accountId?: number;
  isActive?: boolean;
}

// Create a new budget
export const createBudget = async (data: CreateBudgetData): Promise<Budget> => {
  const result = await db
    .insert(budgets)
    .values({
      name: data.name,
      categoryId: data.categoryId,
      accountId: data.accountId,
      amount: data.amount,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      alertPercentage: data.alertPercentage || 80,
      spentAmount: 0,
      alertTriggered: false,
      isActive: true,
    })
    .returning();

  return result[0];
};

// Get all budgets with optional filters
export const getBudgets = async (
  filters?: BudgetFilters
): Promise<BudgetWithDetails[]> => {
  let query = db
    .select({
      budget: budgets,
      categoryName: categories.name,
      accountName: accounts.name,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .leftJoin(accounts, eq(budgets.accountId, accounts.id));

  // Apply filters
  const conditions = [];
  if (filters?.period) {
    conditions.push(eq(budgets.period, filters.period));
  }
  if (filters?.categoryId) {
    conditions.push(eq(budgets.categoryId, filters.categoryId));
  }
  if (filters?.accountId) {
    conditions.push(eq(budgets.accountId, filters.accountId));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(budgets.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const result = await query.orderBy(desc(budgets.createdAt));

  // Calculate progress for each budget
  const budgetsWithProgress = await Promise.all(
    result.map(async (row) => {
      const progress = await calculateBudgetProgress(row.budget);
      return {
        ...row.budget,
        categoryName: row.categoryName,
        accountName: row.accountName,
        progress,
      };
    })
  );

  return budgetsWithProgress;
};

// Get active budgets only
export const getActiveBudgets = async (): Promise<BudgetWithDetails[]> => {
  return getBudgets({ isActive: true });
};

// Get budget by ID
export const getBudgetById = async (
  id: number
): Promise<BudgetWithDetails | null> => {
  const result = await db
    .select({
      budget: budgets,
      categoryName: categories.name,
      accountName: accounts.name,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .leftJoin(accounts, eq(budgets.accountId, accounts.id))
    .where(eq(budgets.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const progress = await calculateBudgetProgress(result[0].budget);

  return {
    ...result[0].budget,
    categoryName: result[0].categoryName,
    accountName: result[0].accountName,
    progress,
  };
};

// Update budget
export const updateBudget = async (
  id: number,
  updates: Partial<Budget>
): Promise<Budget | null> => {
  const result = await db
    .update(budgets)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(budgets.id, id))
    .returning();

  return result[0] || null;
};

// Delete budget
export const deleteBudget = async (id: number): Promise<boolean> => {
  const result = await db.delete(budgets).where(eq(budgets.id, id));
  return result.changes > 0;
};

// Calculate budget progress
export const calculateBudgetProgress = async (budget: Budget) => {
  const { startDate, endDate } = getBudgetDateRange(budget);

  // Build query conditions
  const queryConditions = [
    eq(transactions.type, "expense"),
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
  ];

  // Add category filter if specified
  if (budget.categoryId) {
    queryConditions.push(eq(transactions.categoryId, budget.categoryId));
  }

  // Add account filter if specified
  if (budget.accountId) {
    queryConditions.push(eq(transactions.accountId, budget.accountId));
  }

  // Execute query with all conditions
  const transactionQuery = db
    .select({ amount: sum(transactions.amount) })
    .from(transactions)
    .where(and(...queryConditions));

  const result = await transactionQuery;
  const spent = Number(result[0]?.amount || 0);
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  let status: "good" | "warning" | "exceeded" = "good";
  if (percentage >= 100) {
    status = "exceeded";
  } else if (percentage >= budget.alertPercentage) {
    status = "warning";
  }

  // Update the budget's spent amount
  await db
    .update(budgets)
    .set({ spentAmount: spent })
    .where(eq(budgets.id, budget.id));

  return {
    spent,
    remaining,
    percentage,
    status,
  };
};

// Get budget date range based on period
export const getBudgetDateRange = (budget: Budget) => {
  const startDate = parseISO(budget.startDate);
  const now = new Date();

  let periodStart: Date;
  let periodEnd: Date;

  switch (budget.period) {
    case "daily":
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
      break;
    case "weekly":
      periodStart = startOfWeek(now);
      periodEnd = endOfWeek(now);
      break;
    case "monthly":
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
      break;
    case "yearly":
      periodStart = startOfYear(now);
      periodEnd = endOfYear(now);
      break;
    default:
      periodStart = startDate;
      periodEnd = budget.endDate ? parseISO(budget.endDate) : now;
  }

  return {
    startDate: format(periodStart, "yyyy-MM-dd"),
    endDate: format(periodEnd, "yyyy-MM-dd"),
  };
};

// Check and create budget alerts with notifications
export const checkBudgetAlerts = async (): Promise<BudgetAlert[]> => {
  const activeBudgets = await getActiveBudgets();
  const newAlerts: BudgetAlert[] = [];

  for (const budget of activeBudgets) {
    const { percentage } = budget.progress;

    // Check if alert should be triggered
    if (percentage >= budget.alertPercentage && !budget.alertTriggered) {
      let alertType: "warning" | "exceeded" = "warning";
      let message = `Budget "${budget.name}" is ${percentage.toFixed(
        1
      )}% spent`;

      if (percentage >= 100) {
        alertType = "exceeded";
        message = `Budget "${budget.name}" has been exceeded by $${(
          budget.progress.spent - budget.amount
        ).toFixed(2)}`;
      }

      const alert = await createBudgetAlert({
        budgetId: budget.id,
        alertType,
        message,
        percentage,
        amount: budget.progress.spent,
        isRead: false,
      });

      newAlerts.push(alert);

      // Send push notification
      try {
        // Dynamic import to avoid circular dependency
        const { notificationService } = await import(
          "../../services/notificationService"
        );

        const notificationData = {
          budgetId: budget.id,
          budgetName: budget.name,
          percentage,
          amount: budget.progress.spent,
          budgetAmount: budget.amount,
          alertType,
        };

        if (alertType === "exceeded") {
          await notificationService.sendBudgetExceededNotification(
            notificationData
          );
        } else {
          await notificationService.sendBudgetWarningNotification(
            notificationData
          );
        }
      } catch (error) {
        console.error("Failed to send budget notification:", error);
      }

      // Mark budget as alert triggered
      await db
        .update(budgets)
        .set({ alertTriggered: true })
        .where(eq(budgets.id, budget.id));
    }

    // Reset alert if spending goes below threshold
    if (percentage < budget.alertPercentage && budget.alertTriggered) {
      await db
        .update(budgets)
        .set({ alertTriggered: false })
        .where(eq(budgets.id, budget.id));
    }
  }

  return newAlerts;
};

// Create budget alert
export const createBudgetAlert = async (
  data: InsertBudgetAlert
): Promise<BudgetAlert> => {
  const result = await db.insert(budgetAlerts).values(data).returning();
  return result[0];
};

// Get budget alerts
export const getBudgetAlerts = async (
  isRead?: boolean
): Promise<BudgetAlert[]> => {
  if (isRead !== undefined) {
    return db
      .select()
      .from(budgetAlerts)
      .where(eq(budgetAlerts.isRead, isRead))
      .orderBy(desc(budgetAlerts.createdAt));
  }

  return db.select().from(budgetAlerts).orderBy(desc(budgetAlerts.createdAt));
};

// Mark alert as read
export const markAlertAsRead = async (alertId: number): Promise<boolean> => {
  const result = await db
    .update(budgetAlerts)
    .set({ isRead: true })
    .where(eq(budgetAlerts.id, alertId));

  return result.changes > 0;
};

// Get budget summary statistics
export const getBudgetSummary = async () => {
  const activeBudgets = await getActiveBudgets();

  const totalBudgets = activeBudgets.length;
  const totalBudgetAmount = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = activeBudgets.reduce(
    (sum, b) => sum + b.progress.spent,
    0
  );
  const totalRemaining = totalBudgetAmount - totalSpent;

  const budgetsOnTrack = activeBudgets.filter(
    (b) => b.progress.status === "good"
  ).length;
  const budgetsInWarning = activeBudgets.filter(
    (b) => b.progress.status === "warning"
  ).length;
  const budgetsExceeded = activeBudgets.filter(
    (b) => b.progress.status === "exceeded"
  ).length;

  return {
    totalBudgets,
    totalBudgetAmount,
    totalSpent,
    totalRemaining,
    averageSpentPercentage:
      totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0,
    budgetsOnTrack,
    budgetsInWarning,
    budgetsExceeded,
  };
};
