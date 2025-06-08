import { format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Card,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import { LineChart, PieChart } from "../../components/charts";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

type TimePeriod = "3m" | "6m" | "12m";

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { transactions, loadTransactions } = useTransactionStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { categories, loadCategories } = useCategoryStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("6m");
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

  const getMonthsToShow = () => {
    switch (selectedPeriod) {
      case "3m":
        return 3;
      case "6m":
        return 6;
      case "12m":
        return 12;
      default:
        return 6;
    }
  };

  // Get spending by category data for pie chart
  const getSpendingByCategory = () => {
    const categorySpending = new Map();
    const now = new Date();
    const monthsBack = getMonthsToShow();
    const cutoffDate = subMonths(now, monthsBack);

    const filteredTransactions = transactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const date = new Date(t.date);
        return date <= now && date >= cutoffDate;
      });

    if (filteredTransactions.length === 0) {
      return [];
    }

    filteredTransactions.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId);
      const categoryName = category?.name || "Other";
      const currentAmount = categorySpending.get(categoryName) || 0;
      categorySpending.set(
        categoryName,
        currentAmount + Math.abs(transaction.amount)
      );
    });

    return Array.from(categorySpending.entries())
      .map(([name, amount]) => ({ x: name, y: amount }))
      .filter((item) => item.y > 0)
      .sort((a, b) => b.y - a.y)
      .slice(0, 6); // Top 6 categories
  };

  // Get monthly spending trends for line chart
  const getMonthlyTrends = () => {
    const monthlyData = new Map();
    const now = new Date();
    const monthsToShow = getMonthsToShow();

    // Initialize months with short format
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, "MMM");
      monthlyData.set(monthKey, 0);
    }

    // Add transaction data
    transactions
      .filter((t) => t.type === "expense")
      .filter((t) => new Date(t.date) <= now)
      .forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        const monthKey = format(transactionDate, "MMM");
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

  // Get income vs expense comparison
  const getIncomeVsExpense = () => {
    const monthlyData = new Map();
    const now = new Date();
    const monthsToShow = getMonthsToShow();

    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, "MMM");
      monthlyData.set(monthKey, { income: 0, expense: 0 });
    }

    // Add transaction data
    transactions
      .filter((t) => new Date(t.date) <= now)
      .forEach((transaction) => {
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

  // Get summary stats
  const getSummaryStats = () => {
    const now = new Date();
    const monthsBack = getMonthsToShow();
    const cutoffDate = subMonths(now, monthsBack);

    const periodTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date <= now && date >= cutoffDate;
    });

    const totalIncome = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgMonthlyExpense = totalExpense / monthsBack;
    const avgMonthlyIncome = totalIncome / monthsBack;

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      avgMonthlyExpense,
      avgMonthlyIncome,
      transactionCount: periodTransactions.length,
    };
  };

  const spendingByCategory = getSpendingByCategory();
  const monthlyTrends = getMonthlyTrends();
  const incomeVsExpense = getIncomeVsExpense();
  const summaryStats = getSummaryStats();

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "3m":
        return "Last 3 Months";
      case "6m":
        return "Last 6 Months";
      case "12m":
        return "Last 12 Months";
      default:
        return "Last 6 Months";
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Appbar.Header>
        <Appbar.Content title="Analytics" />
        <Appbar.Action icon="refresh" onPress={loadData} />
      </Appbar.Header>

      {/* Time Period Selector */}
      <Card style={styles.periodCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Time Period
          </Text>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}
            buttons={[
              { value: "3m", label: "3M" },
              { value: "6m", label: "6M" },
              { value: "12m", label: "1Y" },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Summary Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {getPeriodLabel()} Summary
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Income
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                ${summaryStats.totalIncome.toFixed(0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Expenses
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.statValue, { color: theme.colors.error }]}
              >
                ${summaryStats.totalExpense.toFixed(0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Net Amount
              </Text>
              <Text
                variant="titleMedium"
                style={[
                  styles.statValue,
                  {
                    color:
                      summaryStats.netAmount >= 0
                        ? theme.colors.primary
                        : theme.colors.error,
                  },
                ]}
              >
                ${summaryStats.netAmount.toFixed(0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Avg Monthly
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                ${summaryStats.avgMonthlyExpense.toFixed(0)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <PieChart
          key={`pie-${selectedPeriod}`}
          data={spendingByCategory}
          title="Spending by Category"
          height={300}
        />
      )}

      {/* Monthly Spending Trends */}
      {monthlyTrends.length > 0 && (
        <LineChart
          key={`trends-${selectedPeriod}`}
          data={monthlyTrends}
          title="Monthly Spending Trends"
          height={240}
          yAxisSuffix="$"
          bezier={true}
        />
      )}

      {/* Income vs Expense */}
      {incomeVsExpense.length > 0 && (
        <LineChart
          key={`income-${selectedPeriod}`}
          data={incomeVsExpense}
          title="Net Income vs Expenses"
          height={240}
          yAxisSuffix="$"
          bezier={false}
          showDots={true}
        />
      )}

      {loading && (
        <Card style={styles.loadingCard}>
          <Card.Content style={styles.centerContent}>
            <Text>Loading analytics...</Text>
          </Card.Content>
        </Card>
      )}

      {!loading &&
        spendingByCategory.length === 0 &&
        transactions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.centerContent}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Data Yet
              </Text>
              <Text variant="bodyLarge" style={styles.emptyText}>
                Start adding transactions to see your financial insights
              </Text>
            </Card.Content>
          </Card>
        )}

      {!loading &&
        spendingByCategory.length === 0 &&
        transactions.length > 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.centerContent}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Expense Data
              </Text>
              <Text variant="bodyLarge" style={styles.emptyText}>
                You have {transactions.length} transactions, but no expenses in
                the selected period.
              </Text>
            </Card.Content>
          </Card>
        )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodCard: {
    margin: 16,
    elevation: 2,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 2,
    fontSize: 12,
  },
  statValue: {
    fontWeight: "600",
    fontSize: 16,
  },
  loadingCard: {
    margin: 16,
    elevation: 2,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  centerContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 32,
  },
});
