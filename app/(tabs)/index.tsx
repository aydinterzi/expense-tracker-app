import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  FAB,
  Paragraph,
  ProgressBar,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccountStore } from "../../stores/accountStore";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function DashboardScreen() {
  const theme = useTheme();
  const [fabOpen, setFabOpen] = useState(false);
  const { transactions, loadTransactions } = useTransactionStore();
  const { accounts, loadAccounts } = useAccountStore();
  const { categories, loadCategories } = useCategoryStore();
  const {
    activeBudgets,
    alerts,
    summary,
    loadActiveBudgets,
    loadAlerts,
    loadSummary,
  } = useBudgetStore();

  useEffect(() => {
    loadTransactions();
    loadAccounts();
    loadCategories();
    loadActiveBudgets();
    loadAlerts(false); // Load unread alerts
    loadSummary();
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  // Helper function to safely handle calculations that might produce NaN
  const safeNumber = (value: number, fallback: number = 0): number => {
    return isNaN(value) || !isFinite(value) ? fallback : value;
  };

  const totalBalance = safeNumber(
    accounts.reduce((sum, account) => sum + (account.currentBalance || 0), 0),
    0
  );

  // Calculate current month spending
  const currentMonth = new Date();
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth.getMonth() &&
      transactionDate.getFullYear() === currentMonth.getFullYear() &&
      transaction.type === "expense"
    );
  });

  const currentMonthSpending = currentMonthTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  // Calculate previous month spending for comparison
  const previousMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );
  const previousMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === previousMonth.getMonth() &&
      transactionDate.getFullYear() === previousMonth.getFullYear() &&
      transaction.type === "expense"
    );
  });

  const previousMonthSpending = previousMonthTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const spendingChange =
    previousMonthSpending > 0
      ? ((currentMonthSpending - previousMonthSpending) /
          previousMonthSpending) *
        100
      : 0;

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown";
  };

  // Get top spending categories this month
  const categorySpending = useMemo(() => {
    const spending: { [key: number]: number } = {};
    currentMonthTransactions.forEach((transaction) => {
      spending[transaction.categoryId] =
        (spending[transaction.categoryId] || 0) + transaction.amount;
    });

    return Object.entries(spending)
      .map(([categoryId, amount]) => ({
        categoryId: parseInt(categoryId),
        amount,
        name: getCategoryName(parseInt(categoryId)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [currentMonthTransactions, categories]);

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return theme.colors.primary;
      case "warning":
        return "#ff9800";
      case "exceeded":
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const unreadAlerts = alerts.filter((alert) => !alert.isRead);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={[
          styles.scrollContainer,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards Row 1 */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.balanceCard]}>
            <Card.Content style={styles.statCardContent}>
              <Title
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                ${totalBalance.toFixed(2)}
              </Title>
              <Paragraph style={styles.statLabel}>Total Balance</Paragraph>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.spendingCard]}>
            <Card.Content style={styles.statCardContent}>
              <Title
                style={[styles.statValue, { color: theme.colors.secondary }]}
              >
                ${currentMonthSpending.toFixed(2)}
              </Title>
              <Paragraph style={styles.statLabel}>This Month</Paragraph>
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      safeNumber(spendingChange, 0) >= 0
                        ? theme.colors.error
                        : theme.colors.primary,
                  },
                ]}
              >
                {safeNumber(spendingChange, 0) >= 0 ? "+" : ""}
                {safeNumber(spendingChange, 0).toFixed(1)}%
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Budget Overview */}
        {summary && (
          <Card style={styles.budgetOverviewCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.sectionTitle}>Budget Overview</Title>
                {unreadAlerts.length > 0 && (
                  <Chip
                    icon="alert"
                    textStyle={styles.alertChipText}
                    style={[
                      styles.alertChip,
                      { backgroundColor: theme.colors.errorContainer },
                    ]}
                  >
                    {unreadAlerts.length} Alert
                    {unreadAlerts.length > 1 ? "s" : ""}
                  </Chip>
                )}
              </View>

              <View style={styles.budgetStatsRow}>
                <View style={styles.budgetStat}>
                  <Text
                    style={[
                      styles.budgetStatValue,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {summary.totalBudgets}
                  </Text>
                  <Text style={styles.budgetStatLabel}>Active Budgets</Text>
                </View>

                <View style={styles.budgetStat}>
                  <Text
                    style={[
                      styles.budgetStatValue,
                      { color: getBudgetStatusColor("good") },
                    ]}
                  >
                    {summary.budgetsOnTrack}
                  </Text>
                  <Text style={styles.budgetStatLabel}>On Track</Text>
                </View>

                <View style={styles.budgetStat}>
                  <Text
                    style={[
                      styles.budgetStatValue,
                      { color: getBudgetStatusColor("warning") },
                    ]}
                  >
                    {summary.budgetsInWarning}
                  </Text>
                  <Text style={styles.budgetStatLabel}>Warning</Text>
                </View>

                <View style={styles.budgetStat}>
                  <Text
                    style={[
                      styles.budgetStatValue,
                      { color: getBudgetStatusColor("exceeded") },
                    ]}
                  >
                    {summary.budgetsExceeded}
                  </Text>
                  <Text style={styles.budgetStatLabel}>Exceeded</Text>
                </View>
              </View>

              <View style={styles.budgetProgressSection}>
                <Text style={styles.budgetProgressLabel}>
                  Overall Budget Usage: ${summary.totalSpent.toFixed(2)} / $
                  {summary.totalBudgetAmount.toFixed(2)}
                </Text>
                <ProgressBar
                  progress={Math.min(
                    safeNumber(
                      summary.totalSpent / summary.totalBudgetAmount,
                      0
                    ),
                    1
                  )}
                  color={
                    safeNumber(summary.averageSpentPercentage, 0) > 80
                      ? theme.colors.error
                      : theme.colors.primary
                  }
                  style={styles.budgetProgressBar}
                />
                <Text style={styles.budgetPercentageText}>
                  {safeNumber(summary.averageSpentPercentage, 0).toFixed(1)}%
                  used
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Top Budgets Quick View */}
        {activeBudgets.length > 0 && (
          <Card style={styles.topBudgetsCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.sectionTitle}>Top Budgets</Title>
                <Button
                  mode="text"
                  onPress={() => router.push("/(tabs)/budgets")}
                  compact
                >
                  View All
                </Button>
              </View>

              {activeBudgets.slice(0, 3).map((budget) => (
                <View key={budget.id} style={styles.budgetQuickItem}>
                  <View style={styles.budgetQuickInfo}>
                    <Text style={styles.budgetQuickName}>{budget.name}</Text>
                    <Text style={styles.budgetQuickAmount}>
                      ${budget.spentAmount?.toFixed(2) || "0.00"} / $
                      {budget.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.budgetQuickProgress}>
                    <ProgressBar
                      progress={Math.min(
                        safeNumber(
                          (budget.spentAmount || 0) / budget.amount,
                          0
                        ),
                        1
                      )}
                      color={getBudgetStatusColor(
                        budget.progress?.status || "good"
                      )}
                      style={styles.budgetQuickProgressBar}
                    />
                    <Text
                      style={[
                        styles.budgetQuickPercentage,
                        {
                          color: getBudgetStatusColor(
                            budget.progress?.status || "good"
                          ),
                        },
                      ]}
                    >
                      {safeNumber(
                        ((budget.spentAmount || 0) / budget.amount) * 100,
                        0
                      ).toFixed(0)}
                      %
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Spending Insights */}
        <Card style={styles.insightsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Spending Insights</Title>

            {categorySpending.length > 0 ? (
              <View>
                <Text style={styles.insightsSubtitle}>
                  Top Categories This Month
                </Text>
                {categorySpending.map((category, index) => (
                  <View
                    key={category.categoryId}
                    style={styles.categoryInsightItem}
                  >
                    <View style={styles.categoryInsightInfo}>
                      <Text style={styles.categoryInsightName}>
                        {index + 1}. {category.name}
                      </Text>
                      <Text style={styles.categoryInsightAmount}>
                        ${category.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.categoryInsightPercentage}>
                      {safeNumber(
                        currentMonthSpending > 0
                          ? (category.amount / currentMonthSpending) * 100
                          : 0,
                        0
                      ).toFixed(1)}
                      %
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyInsights}>
                No spending data for this month yet.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.sectionTitle}>Recent Transactions</Title>
              <Button
                mode="text"
                onPress={() => router.push("/(tabs)/transactions")}
                compact
              >
                View All
              </Button>
            </View>

            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Paragraph style={styles.transactionDescription}>
                      {transaction.description || "No description"}
                    </Paragraph>
                    <Paragraph style={styles.transactionMeta}>
                      {getCategoryName(transaction.categoryId)} •{" "}
                      {getAccountName(transaction.accountId)}
                    </Paragraph>
                  </View>
                  <Paragraph
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "income"
                            ? theme.colors.primary
                            : theme.colors.error,
                      },
                    ]}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </Paragraph>
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                No transactions yet. Add your first transaction!
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Menu */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "plus"}
        actions={[
          {
            icon: "chart-line",
            label: "Analytics",
            onPress: () => router.push("/(tabs)/analytics"),
          },
          {
            icon: "budget",
            label: "Create Budget",
            onPress: () => router.push("/budget/add"),
          },
          {
            icon: "plus",
            label: "Add Income",
            onPress: () => router.push("/transaction/add"),
            color: "#4CAF50",
          },
          {
            icon: "minus",
            label: "Add Expense",
            onPress: () => router.push("/transaction/add"),
            color: "#f44336",
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          if (fabOpen) {
            // do something if the speed dial is open
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  balanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#6200ea",
  },
  spendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#03dac6",
  },
  statCardContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  budgetOverviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  topBudgetsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  insightsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  recentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  alertChip: {
    height: 28,
  },
  alertChipText: {
    fontSize: 12,
  },
  budgetStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  budgetStat: {
    alignItems: "center",
  },
  budgetStatValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  budgetStatLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  budgetProgressSection: {
    marginTop: 8,
  },
  budgetProgressLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  budgetProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  budgetPercentageText: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
    opacity: 0.7,
  },
  budgetQuickItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  budgetQuickInfo: {
    flex: 1,
  },
  budgetQuickName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  budgetQuickAmount: {
    fontSize: 12,
    opacity: 0.7,
  },
  budgetQuickProgress: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  budgetQuickProgressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  budgetQuickPercentage: {
    fontSize: 11,
    fontWeight: "600",
  },
  insightsSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    opacity: 0.8,
  },
  categoryInsightItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  categoryInsightInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 16,
  },
  categoryInsightName: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryInsightAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoryInsightPercentage: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  emptyInsights: {
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.6,
    paddingVertical: 20,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.6,
    paddingVertical: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  expenseButton: {
    backgroundColor: "#f44336",
  },
  incomeButton: {
    backgroundColor: "#4caf50",
  },
  budgetButton: {
    borderColor: "#6200ea",
  },
  analyticsButton: {
    borderColor: "#03dac6",
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
});
