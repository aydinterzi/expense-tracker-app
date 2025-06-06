import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";
import { Budget } from "../schema/budgets";
import { Category } from "../schema/categories";
import { Transaction } from "../schema/transactions";

export interface SpendingByCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface BudgetAnalysis {
  budgetId: number;
  budgetName: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  status: "good" | "warning" | "exceeded";
  remainingAmount: number;
}

export type TimePeriod = "week" | "month" | "quarter" | "year";

export class AnalyticsService {
  static getSpendingByCategory(
    transactions: Transaction[],
    categories: Category[],
    period: TimePeriod = "month"
  ): SpendingByCategory[] {
    const periodStart = this.getPeriodStart(period);
    const periodEnd = this.getPeriodEnd(period);

    const categorySpending = new Map<number, number>();
    let totalSpending = 0;

    // Filter transactions by period and type
    const filteredTransactions = transactions.filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) <= periodEnd
    );

    // Calculate spending by category
    filteredTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount);
      totalSpending += amount;

      const currentAmount = categorySpending.get(transaction.categoryId) || 0;
      categorySpending.set(transaction.categoryId, currentAmount + amount);
    });

    // Convert to result format
    const result: SpendingByCategory[] = [];
    categorySpending.forEach((amount, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        result.push({
          categoryId,
          categoryName: category.name,
          amount,
          percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
          color: category.color,
        });
      }
    });

    return result.sort((a, b) => b.amount - a.amount);
  }

  static getMonthlyTrends(
    transactions: Transaction[],
    monthsBack: number = 6
  ): MonthlyTrend[] {
    const trends: MonthlyTrend[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const period = format(date, "MMM yyyy");

      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      trends.push({
        period,
        income,
        expense,
        net: income - expense,
      });
    }

    return trends;
  }

  static getBudgetAnalysis(
    budgets: Budget[],
    transactions: Transaction[],
    categories: Category[],
    period: TimePeriod = "month"
  ): BudgetAnalysis[] {
    const periodStart = this.getPeriodStart(period);
    const periodEnd = this.getPeriodEnd(period);

    return budgets
      .filter((budget) => budget.isActive)
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId);

        // Calculate spent amount for this budget in the period
        const budgetTransactions = transactions.filter(
          (t) =>
            t.categoryId === budget.categoryId &&
            t.type === "expense" &&
            new Date(t.date) >= periodStart &&
            new Date(t.date) <= periodEnd
        );

        const spentAmount = budgetTransactions.reduce(
          (sum, t) => sum + Math.abs(t.amount),
          0
        );
        const percentage =
          budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
        const remainingAmount = budget.amount - spentAmount;

        let status: "good" | "warning" | "exceeded" = "good";
        if (percentage >= 100) {
          status = "exceeded";
        } else if (percentage >= (budget.alertPercentage || 80)) {
          status = "warning";
        }

        return {
          budgetId: budget.id!,
          budgetName: budget.name,
          categoryName: category?.name || "Unknown",
          budgetAmount: budget.amount,
          spentAmount,
          percentage,
          status,
          remainingAmount,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }

  static getTopExpenseCategories(
    transactions: Transaction[],
    categories: Category[],
    limit: number = 5,
    period: TimePeriod = "month"
  ): SpendingByCategory[] {
    const spendingByCategory = this.getSpendingByCategory(
      transactions,
      categories,
      period
    );
    return spendingByCategory.slice(0, limit);
  }

  static getTotalSpending(
    transactions: Transaction[],
    period: TimePeriod = "month"
  ): number {
    const periodStart = this.getPeriodStart(period);
    const periodEnd = this.getPeriodEnd(period);

    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date) >= periodStart &&
          new Date(t.date) <= periodEnd
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  static getTotalIncome(
    transactions: Transaction[],
    period: TimePeriod = "month"
  ): number {
    const periodStart = this.getPeriodStart(period);
    const periodEnd = this.getPeriodEnd(period);

    return transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date) >= periodStart &&
          new Date(t.date) <= periodEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  static getNetIncome(
    transactions: Transaction[],
    period: TimePeriod = "month"
  ): number {
    return (
      this.getTotalIncome(transactions, period) -
      this.getTotalSpending(transactions, period)
    );
  }

  private static getPeriodStart(period: TimePeriod): Date {
    const now = new Date();
    switch (period) {
      case "week":
        return startOfWeek(now);
      case "month":
        return startOfMonth(now);
      case "quarter":
        return startOfMonth(subMonths(now, 2));
      case "year":
        return startOfYear(now);
      default:
        return startOfMonth(now);
    }
  }

  private static getPeriodEnd(period: TimePeriod): Date {
    const now = new Date();
    switch (period) {
      case "week":
        return endOfWeek(now);
      case "month":
        return endOfMonth(now);
      case "quarter":
        return endOfMonth(now);
      case "year":
        return endOfYear(now);
      default:
        return endOfMonth(now);
    }
  }
}
