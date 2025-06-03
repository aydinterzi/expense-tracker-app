import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Card,
  Chip,
  FAB,
  Paragraph,
  Title,
  useTheme,
} from "react-native-paper";
import { Account } from "../../db/schema/accounts";
import { useAccountStore } from "../../stores/accountStore";

export default function AccountsScreen() {
  const theme = useTheme();
  const { accounts, loadAccounts, loading, getTotalBalance } =
    useAccountStore();
  const [totalBalance, setTotalBalance] = React.useState(0);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const updateBalance = async () => {
      const balance = await getTotalBalance();
      setTotalBalance(balance);
    };
    updateBalance();
  }, [accounts]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return "card";
      case "cash":
        return "cash";
      case "credit_card":
        return "card-outline";
      case "investment":
        return "trending-up";
      default:
        return "wallet";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "bank":
        return "Bank Account";
      case "cash":
        return "Cash";
      case "credit_card":
        return "Credit Card";
      case "investment":
        return "Investment";
      default:
        return type;
    }
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <Card
      style={styles.accountCard}
      onPress={() => router.push(`/account/details/${item.id}`)}
    >
      <Card.Content>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <View style={styles.accountTitleRow}>
              <Ionicons
                name={getAccountIcon(item.type)}
                size={24}
                color={item.color}
                style={styles.accountIcon}
              />
              <Title style={styles.accountName}>{item.name}</Title>
            </View>
            <Chip
              mode="outlined"
              style={[styles.accountTypeChip, { borderColor: item.color }]}
              textStyle={{ color: item.color }}
            >
              {getAccountTypeLabel(item.type)}
            </Chip>
          </View>
          <View style={styles.balanceContainer}>
            <Title
              style={[
                styles.accountBalance,
                {
                  color:
                    (item.currentBalance || 0) >= 0
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
            >
              ${(item.currentBalance || 0).toFixed(2)}
            </Title>
            <Paragraph style={styles.balanceLabel}>Current Balance</Paragraph>
          </View>
        </View>

        {item.initialBalance !== item.currentBalance && (
          <View style={styles.balanceChange}>
            <Paragraph style={styles.initialBalance}>
              Initial: ${(item.initialBalance || 0).toFixed(2)}
            </Paragraph>
            <Paragraph
              style={[
                styles.changeAmount,
                {
                  color:
                    (item.currentBalance || 0) - (item.initialBalance || 0) >= 0
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
            >
              {(item.currentBalance || 0) - (item.initialBalance || 0) >= 0
                ? "+"
                : ""}
              $
              {(
                (item.currentBalance || 0) - (item.initialBalance || 0)
              ).toFixed(2)}
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Accounts</Title>
        <Card style={styles.totalBalanceCard}>
          <Card.Content style={styles.totalBalanceContent}>
            <Paragraph style={styles.totalBalanceLabel}>
              Total Balance
            </Paragraph>
            <Title
              style={[
                styles.totalBalance,
                {
                  color:
                    totalBalance >= 0
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
            >
              ${totalBalance.toFixed(2)}
            </Title>
          </Card.Content>
        </Card>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadAccounts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              No accounts found. Add your first account!
            </Paragraph>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/account/add")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  totalBalanceCard: {
    backgroundColor: "#f8f9fa",
  },
  totalBalanceContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  totalBalanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  totalBalance: {
    fontSize: 28,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  accountCard: {
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  accountInfo: {
    flex: 1,
    marginRight: 16,
  },
  accountTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  accountIcon: {
    marginRight: 8,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
  },
  accountTypeChip: {
    alignSelf: "flex-start",
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: "bold",
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  balanceChange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  initialBalance: {
    fontSize: 12,
    opacity: 0.7,
  },
  changeAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
