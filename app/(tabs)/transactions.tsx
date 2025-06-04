import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Card,
  FAB,
  Paragraph,
  Searchbar,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../../db/schema/transactions";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";

export default function TransactionsScreen() {
  const theme = useTheme();
  const { transactions, loadTransactions, loading } = useTransactionStore();
  const { categories, loadCategories } = useCategoryStore();
  const { accounts, loadAccounts } = useAccountStore();
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    loadTransactions();
    loadCategories();
    loadAccounts();
  }, []);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown Category";
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card
      style={styles.transactionCard}
      onPress={() => router.push("/transaction/add")}
    >
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Title style={styles.transactionDescription}>
              {item.description || "No description"}
            </Title>
            <Paragraph style={styles.transactionMeta}>
              {getCategoryName(item.categoryId)} •{" "}
              {getAccountName(item.accountId)}
            </Paragraph>
            <Paragraph style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString()}
            </Paragraph>
          </View>
          <View style={styles.amountContainer}>
            <Title
              style={[
                styles.transactionAmount,
                {
                  color:
                    item.type === "income"
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
            >
              {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
            </Title>
            <Paragraph style={styles.transactionType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Paragraph>
          </View>
        </View>
        {item.notes && (
          <Paragraph style={styles.transactionNotes}>{item.notes}</Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Searchbar
            placeholder="Search transactions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </View>

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadTransactions}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                No transactions found. Add your first transaction!
              </Paragraph>
            </View>
          }
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push("/transaction/add")}
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
    paddingTop: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionType: {
    fontSize: 10,
    opacity: 0.7,
    textTransform: "uppercase",
  },
  transactionNotes: {
    marginTop: 8,
    fontStyle: "italic",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
