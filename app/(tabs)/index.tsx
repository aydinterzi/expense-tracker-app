import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, Title, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function DashboardScreen() {
  const theme = useTheme();
  const { transactions, loadTransactions } = useTransactionStore();
  const { accounts, loadAccounts } = useAccountStore();
  const { categories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadTransactions();
    loadAccounts();
    loadCategories();
  }, []);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + (account.currentBalance || 0),
    0
  );

  const recentTransactions = transactions.slice(0, 5);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={[
          styles.scrollContainer,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
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

          <Card style={[styles.statCard, styles.accountsCard]}>
            <Card.Content style={styles.statCardContent}>
              <Title
                style={[styles.statValue, { color: theme.colors.secondary }]}
              >
                {accounts.length}
              </Title>
              <Paragraph style={styles.statLabel}>Accounts</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Transactions */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Transactions</Title>
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

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                onPress={() => router.push("/transaction/add")}
                style={[styles.actionButton, styles.expenseButton]}
                contentStyle={styles.actionButtonContent}
              >
                Add Expense
              </Button>
              <Button
                mode="contained"
                onPress={() => router.push("/transaction/add")}
                style={[styles.actionButton, styles.incomeButton]}
                contentStyle={styles.actionButtonContent}
              >
                Add Income
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
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
  accountsCard: {
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
  recentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  actionButtonContent: {
    paddingVertical: 8,
  },
});
