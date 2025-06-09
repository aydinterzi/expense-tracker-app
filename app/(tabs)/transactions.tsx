import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FAB,
  IconButton,
  Paragraph,
  Searchbar,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../../db/schema/transactions";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTransactionStore } from "../../stores/transactionStore";

interface TransactionFilters {
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  categories: number[];
  accounts: number[];
  types: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
}

interface BulkActions {
  selectedItems: Set<number>;
  showBulkActions: boolean;
}

export default function TransactionsScreen() {
  const theme = useTheme();
  const { transactions, loadTransactions, loading, deleteTransaction } =
    useTransactionStore();
  const { categories, loadCategories } = useCategoryStore();
  const { accounts, loadAccounts } = useAccountStore();
  const { formatCurrency, formatDate } = useSettingsStore();

  // Filter and Search State
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    dateRange: { start: null, end: null },
    categories: [],
    accounts: [],
    types: [],
    amountRange: { min: null, max: null },
  });

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Bulk Actions State
  const [bulkActions, setBulkActions] = useState<BulkActions>({
    selectedItems: new Set(),
    showBulkActions: false,
  });

  // Category and Account Menu States
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadCategories();
    loadAccounts();
  }, []);

  // Enhanced filtering and search logic
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.notes?.toLowerCase().includes(searchLower) ||
          getCategoryName(transaction.categoryId)
            .toLowerCase()
            .includes(searchLower) ||
          getAccountName(transaction.accountId)
            .toLowerCase()
            .includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const transactionDate = new Date(transaction.date);
        if (
          filters.dateRange.start &&
          transactionDate < filters.dateRange.start
        )
          return false;
        if (filters.dateRange.end && transactionDate > filters.dateRange.end)
          return false;
      }

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(transaction.categoryId)
      ) {
        return false;
      }

      // Account filter
      if (
        filters.accounts.length > 0 &&
        !filters.accounts.includes(transaction.accountId)
      ) {
        return false;
      }

      // Type filter
      if (
        filters.types.length > 0 &&
        !filters.types.includes(transaction.type)
      ) {
        return false;
      }

      // Amount range filter
      if (
        filters.amountRange.min !== null &&
        transaction.amount < filters.amountRange.min
      ) {
        return false;
      }
      if (
        filters.amountRange.max !== null &&
        transaction.amount > filters.amountRange.max
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          // If dates are the same, sort by createdAt for consistent ordering
          if (comparison === 0 && a.createdAt && b.createdAt) {
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = getCategoryName(a.categoryId).localeCompare(
            getCategoryName(b.categoryId)
          );
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filters, sortBy, sortOrder, categories, accounts]);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown Category";
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  // Filter Actions
  const updateFilters = (updates: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      dateRange: { start: null, end: null },
      categories: [],
      accounts: [],
      types: [],
      amountRange: { min: null, max: null },
    });
  };

  const toggleCategoryFilter = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  const toggleAccountFilter = (accountId: number) => {
    const newAccounts = filters.accounts.includes(accountId)
      ? filters.accounts.filter((id) => id !== accountId)
      : [...filters.accounts, accountId];
    updateFilters({ accounts: newAccounts });
  };

  const toggleTypeFilter = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    updateFilters({ types: newTypes });
  };

  // Bulk Actions
  const toggleSelectTransaction = (transactionId: number) => {
    const newSelected = new Set(bulkActions.selectedItems);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }

    setBulkActions({
      selectedItems: newSelected,
      showBulkActions: newSelected.size > 0,
    });
  };

  const selectAllTransactions = () => {
    const allIds = new Set(filteredAndSortedTransactions.map((t) => t.id));
    setBulkActions({
      selectedItems: allIds,
      showBulkActions: true,
    });
  };

  const clearSelection = () => {
    setBulkActions({
      selectedItems: new Set(),
      showBulkActions: false,
    });
  };

  const handleBulkDelete = async () => {
    try {
      const promises = Array.from(bulkActions.selectedItems).map((id) =>
        deleteTransaction(id)
      );
      await Promise.all(promises);
      clearSelection();
      await loadTransactions();
    } catch (error) {
      console.error("Error deleting transactions:", error);
    }
  };

  // Date picker handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();

    if (showDatePicker === "start") {
      updateFilters({
        dateRange: { ...filters.dateRange, start: currentDate },
      });
    } else if (showDatePicker === "end") {
      updateFilters({
        dateRange: { ...filters.dateRange, end: currentDate },
      });
    }

    setShowDatePicker(null);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.categories.length > 0) count++;
    if (filters.accounts.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.amountRange.min !== null || filters.amountRange.max !== null)
      count++;
    return count;
  }, [filters]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSelected = bulkActions.selectedItems.has(item.id);

    return (
      <Card
        style={[
          styles.transactionCard,
          isSelected && { backgroundColor: theme.colors.primaryContainer },
        ]}
        onPress={() => {
          if (bulkActions.showBulkActions) {
            toggleSelectTransaction(item.id);
          } else {
            router.push(`/transaction/edit?id=${item.id}`);
          }
        }}
        onLongPress={() => {
          if (!bulkActions.showBulkActions) {
            setBulkActions((prev) => ({ ...prev, showBulkActions: true }));
          }
          toggleSelectTransaction(item.id);
        }}
      >
        <Card.Content>
          <View style={styles.transactionHeader}>
            {bulkActions.showBulkActions && (
              <Checkbox
                status={isSelected ? "checked" : "unchecked"}
                onPress={() => toggleSelectTransaction(item.id)}
              />
            )}
            <View style={styles.transactionInfo}>
              <Title style={styles.transactionDescription}>
                {item.description || "No description"}
              </Title>
              <Paragraph style={styles.transactionMeta}>
                {getCategoryName(item.categoryId)} •{" "}
                {getAccountName(item.accountId)}
              </Paragraph>
              <Paragraph style={styles.transactionDate}>
                {formatDate(new Date(item.date))}
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
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </Title>
              <Paragraph style={styles.transactionType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Paragraph>
              {!bulkActions.showBulkActions && (
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => {
                    setBulkActions((prev) => ({
                      ...prev,
                      showBulkActions: true,
                      selectedItems: new Set([item.id]),
                    }));
                  }}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
          {item.notes && (
            <Paragraph style={styles.transactionNotes}>{item.notes}</Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* Header with Search and Filter */}
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <Searchbar
              placeholder="Search transactions..."
              onChangeText={(text) => updateFilters({ search: text })}
              value={filters.search}
              style={[
                styles.searchbar,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            />
            <IconButton
              icon="filter-variant"
              mode={showFilters ? "contained" : "contained-tonal"}
              selected={showFilters}
              onPress={() => setShowFilters(!showFilters)}
            />
            {activeFilterCount > 0 && (
              <View
                style={[
                  styles.filterBadge,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    { color: theme.colors.onError },
                  ]}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </View>

          {/* Sort Options */}
          <View style={styles.sortRow}>
            <Text
              style={[styles.sortLabel, { color: theme.colors.onBackground }]}
            >
              Sort by:
            </Text>
            <Chip
              selected={sortBy === "date"}
              onPress={() => setSortBy("date")}
              style={styles.sortChip}
            >
              Date
            </Chip>
            <Chip
              selected={sortBy === "amount"}
              onPress={() => setSortBy("amount")}
              style={styles.sortChip}
            >
              Amount
            </Chip>
            <Chip
              selected={sortBy === "category"}
              onPress={() => setSortBy("category")}
              style={styles.sortChip}
            >
              Category
            </Chip>
            <IconButton
              icon={sortOrder === "asc" ? "sort-ascending" : "sort-descending"}
              size={20}
              onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            />
          </View>
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <Surface style={styles.filterPanel} elevation={1}>
            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateRow}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker("start")}
                  style={styles.dateButton}
                >
                  {filters.dateRange.start
                    ? filters.dateRange.start.toLocaleDateString()
                    : "Start Date"}
                </Button>
                <Text style={styles.dateRangeSeparator}>to</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker("end")}
                  style={styles.dateButton}
                >
                  {filters.dateRange.end
                    ? filters.dateRange.end.toLocaleDateString()
                    : "End Date"}
                </Button>
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            {/* Transaction Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Transaction Type</Text>
              <View style={styles.chipRow}>
                <Chip
                  selected={filters.types.includes("expense")}
                  onPress={() => toggleTypeFilter("expense")}
                  style={styles.filterChip}
                >
                  Expense
                </Chip>
                <Chip
                  selected={filters.types.includes("income")}
                  onPress={() => toggleTypeFilter("income")}
                  style={styles.filterChip}
                >
                  Income
                </Chip>
                <Chip
                  selected={filters.types.includes("transfer")}
                  onPress={() => toggleTypeFilter("transfer")}
                  style={styles.filterChip}
                >
                  Transfer
                </Chip>
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            {/* Amount Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Amount Range</Text>
              <View style={styles.amountRow}>
                <TextInput
                  label="Min Amount"
                  value={filters.amountRange.min?.toString() || ""}
                  onChangeText={(text) => {
                    const value = text ? parseFloat(text) : null;
                    updateFilters({
                      amountRange: { ...filters.amountRange, min: value },
                    });
                  }}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  dense
                />
                <TextInput
                  label="Max Amount"
                  value={filters.amountRange.max?.toString() || ""}
                  onChangeText={(text) => {
                    const value = text ? parseFloat(text) : null;
                    updateFilters({
                      amountRange: { ...filters.amountRange, max: value },
                    });
                  }}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  dense
                />
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            {/* Categories Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.chipRow}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={filters.categories.includes(category.id)}
                    onPress={() => toggleCategoryFilter(category.id)}
                    style={styles.filterChip}
                  >
                    {category.name}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            {/* Accounts Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Accounts</Text>
              <View style={styles.chipRow}>
                {accounts.map((account) => (
                  <Chip
                    key={account.id}
                    selected={filters.accounts.includes(account.id)}
                    onPress={() => toggleAccountFilter(account.id)}
                    style={styles.filterChip}
                  >
                    {account.name}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.filterActionButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.filterActionButton}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        )}

        {/* Transaction Stats */}
        {filteredAndSortedTransactions.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {filteredAndSortedTransactions.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  $
                  {filteredAndSortedTransactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>
                  Income (
                  {
                    filteredAndSortedTransactions.filter(
                      (t) => t.type === "income"
                    ).length
                  }
                  )
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.error }]}>
                  $
                  {filteredAndSortedTransactions
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>
                  Expenses (
                  {
                    filteredAndSortedTransactions.filter(
                      (t) => t.type === "expense"
                    ).length
                  }
                  )
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        filteredAndSortedTransactions
                          .filter((t) => t.type === "income")
                          .reduce((sum, t) => sum + t.amount, 0) -
                          filteredAndSortedTransactions
                            .filter((t) => t.type === "expense")
                            .reduce((sum, t) => sum + t.amount, 0) >=
                        0
                          ? theme.colors.primary
                          : theme.colors.error,
                    },
                  ]}
                >
                  {filteredAndSortedTransactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0) -
                    filteredAndSortedTransactions
                      .filter((t) => t.type === "expense")
                      .reduce((sum, t) => sum + t.amount, 0) >=
                  0
                    ? "+"
                    : ""}
                  $
                  {(
                    filteredAndSortedTransactions
                      .filter((t) => t.type === "income")
                      .reduce((sum, t) => sum + t.amount, 0) -
                    filteredAndSortedTransactions
                      .filter((t) => t.type === "expense")
                      .reduce((sum, t) => sum + t.amount, 0)
                  ).toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Net</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Bulk Actions Bar */}
        {bulkActions.showBulkActions && (
          <Surface style={styles.bulkActionsBar} elevation={2}>
            <Text style={styles.bulkActionsText}>
              {bulkActions.selectedItems.size} selected
            </Text>
            <View style={styles.bulkActionsButtons}>
              <IconButton icon="select-all" onPress={selectAllTransactions} />
              <IconButton
                icon="delete"
                onPress={handleBulkDelete}
                iconColor={theme.colors.error}
              />
              <IconButton icon="close" onPress={clearSelection} />
            </View>
          </Surface>
        )}

        {/* Transactions List */}
        <FlatList
          data={filteredAndSortedTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadTransactions}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                {filters.search || activeFilterCount > 0
                  ? "No transactions found matching your filters."
                  : "No transactions found. Add your first transaction!"}
              </Paragraph>
            </View>
          }
        />

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* FAB */}
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
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    marginRight: 8,
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sortLabel: {
    marginRight: 8,
    fontWeight: "500",
  },
  sortChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  filterPanel: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  filterDivider: {
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    fontWeight: "500",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  filterActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bulkActionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
    borderRadius: 8,
  },
  bulkActionsText: {
    fontWeight: "600",
  },
  bulkActionsButtons: {
    flexDirection: "row",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
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
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
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
  actionButton: {
    margin: 0,
    marginTop: 4,
  },
});
