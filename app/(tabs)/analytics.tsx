import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Appbar,
  Button,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { BarChart, LineChart, PieChart } from "../../components/charts";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

type TimePeriod = "week" | "month" | "quarter" | "year";

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { transactions, loadTransactions } = useTransactionStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { categories, loadCategories } = useCategoryStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTransactions(), loadBudgets(), loadCategories()]);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get spending by category data for pie chart
  const getSpendingByCategory = () => {
    const categorySpending = new Map();

    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const category = categories.find(
          (c) => c.id === transaction.category_id
        );
        const categoryName = category?.name || "Unknown";
        const currentAmount = categorySpending.get(categoryName) || 0;
        categorySpending.set(categoryName, currentAmount + transaction.amount);
      });

    return Array.from(categorySpending.entries())
      .map(([name, amount]) => ({ x: name, y: Math.abs(amount) }))
      .sort((a, b) => b.y - a.y)
      .slice(0, 8); // Top 8 categories
  };

  // Get monthly spending trends for line chart
  const getMonthlyTrends = () => {
    const monthlyData = new Map();
    const monthsToShow = 6;

    // Initialize past 6 months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "MMM yyyy");
      monthlyData.set(monthKey, 0);
    }

    // Add transaction data
    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        const monthKey = format(transactionDate, "MMM yyyy");
        if (monthlyData.has(monthKey)) {
          const currentAmount = monthlyData.get(monthKey) || 0;
          monthlyData.set(
            monthKey,
            currentAmount + Math.abs(transaction.amount)
          );
        }
      });

    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      x: month,
      y: amount,
    }));
  };

  // Get budget progress data for bar chart
  const getBudgetProgress = () => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return budgets
      .filter((budget) => budget.is_active)
      .map((budget) => {
        const budgetTransactions = transactions.filter(
          (t) =>
            t.category_id === budget.category_id &&
            t.type === "expense" &&
            new Date(t.date) >= monthStart &&
            new Date(t.date) <= monthEnd
        );

        const spent = budgetTransactions.reduce(
          (sum, t) => sum + Math.abs(t.amount),
          0
        );
        const category = categories.find((c) => c.id === budget.category_id);

        return {
          x: category?.name || "Budget",
          y: (spent / budget.amount) * 100, // Percentage spent
        };
      })
      .slice(0, 6); // Top 6 budgets
  };

  // Get income vs expense comparison
  const getIncomeVsExpense = () => {
    const monthlyData = new Map();
    const monthsToShow = 6;

    // Initialize past 6 months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "MMM");
      monthlyData.set(monthKey, { income: 0, expense: 0 });
    }

    // Add transaction data
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthKey = format(transactionDate, "MMM");
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expense += Math.abs(transaction.amount);
        }
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      x: month,
      y: data.income - data.expense,
    }));
  };

  const spendingByCategory = getSpendingByCategory();
  const monthlyTrends = getMonthlyTrends();
  const budgetProgress = getBudgetProgress();
  const incomeVsExpense = getIncomeVsExpense();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Analytics" />
        <Appbar.Action icon="refresh" onPress={loadData} />
      </Appbar.Header>

      <Surface style={styles.periodSelector}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          Time Period
        </Text>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}
          buttons={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "quarter", label: "Quarter" },
            { value: "year", label: "Year" },
          ]}
        />
      </Surface>

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <PieChart
          data={spendingByCategory}
          title="Spending by Category"
          height={280}
        />
      )}

      {/* Monthly Spending Trends */}
      {monthlyTrends.length > 0 && (
        <LineChart
          data={monthlyTrends}
          title="Monthly Spending Trends"
          height={220}
          yAxisSuffix="$"
          bezier={true}
        />
      )}

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <BarChart
          data={budgetProgress}
          title="Budget Progress (%)"
          height={220}
          yAxisSuffix="%"
          showValues={true}
          barColor="#e74c3c"
        />
      )}

      {/* Income vs Expense */}
      {incomeVsExpense.length > 0 && (
        <LineChart
          data={incomeVsExpense}
          title="Net Income vs Expenses"
          height={220}
          yAxisSuffix="$"
          bezier={false}
          showDots={true}
        />
      )}

      {loading && (
        <Surface style={styles.loadingContainer}>
          <Text>Loading analytics...</Text>
        </Surface>
      )}

      {!loading && spendingByCategory.length === 0 && (
        <Surface style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No data available yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Start adding transactions to see analytics
          </Text>
          <Button mode="contained" onPress={() => {}}>
            Add Transaction
          </Button>
        </Surface>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelector: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  emptyContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  emptyText: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.7,
  },
});
