import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Transaction } from "../../db/schema/transactions";

interface TransactionStatsProps {
  transactions: Transaction[];
}

export const TransactionStats: React.FC<TransactionStatsProps> = ({
  transactions,
}) => {
  const theme = useTheme();

  const stats = React.useMemo(() => {
    const totalCount = transactions.length;
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalExpenses = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const netAmount = totalIncome - totalExpenses;

    return {
      totalCount,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      totalIncome,
      totalExpenses,
      netAmount,
    };
  }, [transactions]);

  if (stats.totalCount === 0) {
    return null;
  }

  return (
    <Card style={styles.statsCard}>
      <Card.Content style={styles.statsContent}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            ${stats.totalIncome.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Income ({stats.incomeCount})</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            ${stats.totalExpenses.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Expenses ({stats.expenseCount})</Text>
        </View>

        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.netAmount >= 0
                    ? theme.colors.primary
                    : theme.colors.error,
              },
            ]}
          >
            {stats.netAmount >= 0 ? "+" : ""}${stats.netAmount.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Net</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});
