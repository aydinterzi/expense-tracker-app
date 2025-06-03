import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, FAB, Paragraph, Title, useTheme } from "react-native-paper";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function DashboardScreen() {
  const theme = useTheme();
  const { accounts, loadAccounts, getTotalBalance } = useAccountStore();
  const { loadCategories } = useCategoryStore();
  const { transactions, loadTransactions } = useTransactionStore();

  const [totalBalance, setTotalBalance] = React.useState(0);

  useEffect(() => {
    // Load initial data
    loadAccounts();
    loadCategories();
    loadTransactions();
  }, []);

  useEffect(() => {
    // Update total balance when accounts change
    const updateBalance = async () => {
      const balance = await getTotalBalance();
      setTotalBalance(balance);
    };
    updateBalance();
  }, [accounts]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title
                style={[styles.statTitle, { color: theme.colors.primary }]}
              >
                ${totalBalance.toFixed(2)}
              </Title>
              <Paragraph>Total Balance</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title
                style={[styles.statTitle, { color: theme.colors.secondary }]}
              >
                {accounts.length}
              </Title>
              <Paragraph>Accounts</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Transactions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Recent Transactions</Title>
            {recentTransactions.length === 0 ? (
              <Paragraph style={styles.emptyText}>
                No transactions yet. Add your first transaction!
              </Paragraph>
            ) : (
              recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Paragraph style={styles.transactionDescription}>
                      {transaction.description || "No description"}
                    </Paragraph>
                    <Paragraph style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
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
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Card
                style={styles.actionCard}
                onPress={() => router.push("/transaction/add")}
              >
                <Card.Content style={styles.actionContent}>
                  <Paragraph>Add Expense</Paragraph>
                </Card.Content>
              </Card>

              <Card
                style={styles.actionCard}
                onPress={() => router.push("/transaction/add")}
              >
                <Card.Content style={styles.actionContent}>
                  <Paragraph>Add Income</Paragraph>
                </Card.Content>
              </Card>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/transaction/add")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionAmount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
