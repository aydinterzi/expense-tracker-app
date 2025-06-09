import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Card,
  Chip,
  FAB,
  Menu,
  Paragraph,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account } from "../../db/schema/accounts";
import { transactionService } from "../../db/services/transactionService";
import { useAccountStore } from "../../stores/accountStore";

export default function AccountsScreen() {
  const theme = useTheme();
  const { accounts, loadAccounts, loading, getTotalBalance, deleteAccount } =
    useAccountStore();
  const [totalBalance, setTotalBalance] = React.useState(0);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(
    null
  );

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

  const handleDeleteAccount = async (account: Account) => {
    try {
      // Check if account has transactions
      const accountTransactions =
        await transactionService.getTransactionsByFilters({
          accountId: account.id,
        });

      if (accountTransactions.length > 0) {
        Alert.alert(
          "Cannot Delete Account",
          `This account has ${accountTransactions.length} transaction(s). Please delete or move all transactions before deleting the account.`,
          [{ text: "OK" }]
        );
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        "Delete Account",
        `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteAccount(account.id);
              setMenuVisible(false);
              setSelectedAccount(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to check account transactions. Please try again."
      );
    }
  };

  const handleLongPress = (account: Account) => {
    setSelectedAccount(account);
    setMenuVisible(true);
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <Card
      style={styles.accountCard}
      onPress={() => console.log("Navigate to account details:", item.id)}
      onLongPress={() => handleLongPress(item)}
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
            <View style={styles.balanceRow}>
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
              <Menu
                visible={menuVisible && selectedAccount?.id === item.id}
                onDismiss={() => {
                  setMenuVisible(false);
                  setSelectedAccount(null);
                }}
                anchor={
                  <TouchableOpacity
                    onPress={() => handleLongPress(item)}
                    style={styles.menuButton}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => handleDeleteAccount(item)}
                  title="Delete Account"
                  leadingIcon="trash-can-outline"
                  titleStyle={{ color: theme.colors.error }}
                />
              </Menu>
            </View>
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

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <View style={styles.totalBalanceWrapper}>
        <Card style={styles.totalBalanceCard} elevation={0}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.innerContainer}>
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadAccounts}
          ListHeaderComponent={ListHeaderComponent}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
  totalBalanceWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalBalanceCard: {
    backgroundColor: "transparent",
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
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 8,
  },
});
