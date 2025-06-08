import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  FAB,
  IconButton,
  Searchbar,
  SegmentedButtons,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetCard } from "../../components/budget/BudgetCard";
import { useAccountStore } from "../../stores/accountStore";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";

export default function BudgetsScreen() {
  const theme = useTheme();
  const {
    budgets,
    activeBudgets,
    summary,
    loading,
    error,
    filters,
    loadBudgets,
    loadActiveBudgets,
    loadSummary,
    removeBudget,
    setFilters,
    clearFilters,
    clearError,
    refreshBudgetProgress,
  } = useBudgetStore();

  const { categories, loadCategories } = useCategoryStore();
  const { accounts, loadAccounts } = useAccountStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      clearError();
    }
  }, [error]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadActiveBudgets(),
        loadBudgets(),
        loadSummary(),
        loadCategories(),
        loadAccounts(),
      ]);
    } catch (error) {
      console.error("Error loading budget data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBudgetProgress();
      await loadData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      await removeBudget(budgetId);
      setSnackbarMessage("Budget deleted successfully");
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Failed to delete budget");
      setSnackbarVisible(true);
    }
  };

  const handleEditBudget = (budgetId: number) => {
    router.push(`/budget/edit/${budgetId}`);
  };

  const handleViewBudget = (budgetId: number) => {
    router.push(`/budget/details/${budgetId}`);
  };

  // Filter budgets based on search query
  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter options
  const periodFilterOptions = [
    { value: "all", label: "All" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "All" },
    { value: "good", label: "On Track" },
    { value: "warning", label: "Warning" },
    { value: "exceeded", label: "Exceeded" },
  ];

  const handlePeriodFilter = (value: string) => {
    if (value === "all") {
      setFilters({ period: undefined });
    } else {
      setFilters({
        period: value as "daily" | "weekly" | "monthly" | "yearly",
      });
    }
  };

  const getStatusFilteredBudgets = (status: string) => {
    if (status === "all") return filteredBudgets;
    return filteredBudgets.filter(
      (budget) => budget.progress.status === status
    );
  };

  const [statusFilter, setStatusFilter] = useState("all");
  const finalFilteredBudgets = getStatusFilteredBudgets(statusFilter);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Budgets
          </Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={handleRefresh}
            iconColor={theme.colors.onBackground}
          />
        </View>

        {/* Summary Card */}
        {summary && (
          <Card
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.surface },
            ]}
            elevation={2}
          >
            <Card.Content>
              <Text
                style={[styles.summaryTitle, { color: theme.colors.onSurface }]}
              >
                Budget Overview
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {summary.totalBudgets}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Total Budgets
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.secondary },
                    ]}
                  >
                    ${summary.totalBudgetAmount.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Total Budget
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.tertiary },
                    ]}
                  >
                    ${summary.totalSpent.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Total Spent
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusItem,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusCount,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    {summary.budgetsOnTrack}
                  </Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    On Track
                  </Text>
                </View>
                <View
                  style={[styles.statusItem, { backgroundColor: "#ff9500" }]}
                >
                  <Text style={[styles.statusCount, { color: "#ffffff" }]}>
                    {summary.budgetsInWarning}
                  </Text>
                  <Text style={[styles.statusLabel, { color: "#ffffff" }]}>
                    Warning
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusItem,
                    { backgroundColor: theme.colors.error },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusCount,
                      { color: theme.colors.onError },
                    ]}
                  >
                    {summary.budgetsExceeded}
                  </Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: theme.colors.onError },
                    ]}
                  >
                    Exceeded
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <Searchbar
            placeholder="Search budgets..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchbar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            inputStyle={{ color: theme.colors.onSurfaceVariant }}
          />

          <Text
            style={[styles.filterLabel, { color: theme.colors.onBackground }]}
          >
            Filter by Period
          </Text>
          <SegmentedButtons
            value={filters.period || "all"}
            onValueChange={handlePeriodFilter}
            buttons={periodFilterOptions}
            style={styles.segmentedButtons}
          />

          <Text
            style={[styles.filterLabel, { color: theme.colors.onBackground }]}
          >
            Filter by Status
          </Text>
          <SegmentedButtons
            value={statusFilter}
            onValueChange={setStatusFilter}
            buttons={statusFilterOptions}
            style={styles.segmentedButtons}
          />

          {(filters.period || statusFilter !== "all") && (
            <Button
              mode="outlined"
              onPress={() => {
                clearFilters();
                setStatusFilter("all");
              }}
              style={styles.clearFiltersButton}
            >
              Clear Filters
            </Button>
          )}
        </View>

        {/* Budget List */}
        <ScrollView
          style={styles.budgetList}
          contentContainerStyle={styles.budgetListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {finalFilteredBudgets.length === 0 ? (
            <Card
              style={[
                styles.emptyCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content style={styles.emptyContent}>
                <Text
                  style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
                >
                  {searchQuery ? "No budgets found" : "No budgets yet"}
                </Text>
                <Text
                  style={[
                    styles.emptyMessage,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first budget to start tracking your spending"}
                </Text>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    onPress={() => router.push("/budget/add")}
                    style={styles.emptyActionButton}
                  >
                    Create Budget
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            finalFilteredBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onPress={() => handleViewBudget(budget.id)}
                onEdit={() => handleEditBudget(budget.id)}
                onDelete={() => handleDeleteBudget(budget.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
          onPress={() => router.push("/budget/add")}
        />

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  clearFiltersButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  budgetList: {
    flex: 1,
  },
  budgetListContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyCard: {
    marginTop: 40,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
