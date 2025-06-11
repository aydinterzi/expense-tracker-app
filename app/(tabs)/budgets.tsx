import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  FAB,
  Searchbar,
  SegmentedButtons,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetCard } from "../../components/budget/BudgetCard";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { useAccountStore } from "../../stores/accountStore";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useSettingsStore } from "../../stores/settingsStore";

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
  const { formatCurrency } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);

  // Optimize data loading - only load once on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when tab is focused - but debounce it
  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        loadData();
      }, 300); // Small delay to prevent rapid re-renders

      return () => clearTimeout(timeoutId);
    }, [])
  );

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
      setSuccessVisible(true);
    } catch (error) {
      setSnackbarMessage("Failed to delete budget");
      setSnackbarVisible(true);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
  };

  const handleEditBudget = (budgetId: number) => {
    router.push(`/budget/edit/${budgetId}`);
  };

  const handleViewBudget = (budgetId: number) => {
    router.push(`/budget/details/${budgetId}`);
  };

  // Memoize filtered budgets for better performance
  const filteredBudgets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return budgets.filter(
      (budget) =>
        budget.name.toLowerCase().includes(query) ||
        budget.categoryName?.toLowerCase().includes(query) ||
        budget.accountName?.toLowerCase().includes(query)
    );
  }, [budgets, searchQuery]);

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
        {/* Compact Summary */}
        {summary && (
          <View style={styles.compactSummary}>
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Budget Overview
            </Text>
            <View style={styles.compactRow}>
              <View style={styles.compactItem}>
                <Text
                  style={[styles.compactValue, { color: theme.colors.primary }]}
                >
                  {summary.totalBudgets}
                </Text>
                <Text
                  style={[
                    styles.compactLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Budgets
                </Text>
              </View>
              <View style={styles.compactItem}>
                <Text
                  style={[
                    styles.compactValue,
                    { color: theme.colors.secondary },
                  ]}
                >
                  {formatCurrency(summary.totalBudgetAmount)}
                </Text>
                <Text
                  style={[
                    styles.compactLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Budget
                </Text>
              </View>
              <View style={styles.compactItem}>
                <Text
                  style={[
                    styles.compactValue,
                    { color: theme.colors.tertiary },
                  ]}
                >
                  {formatCurrency(summary.totalSpent)}
                </Text>
                <Text
                  style={[
                    styles.compactLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Spent
                </Text>
              </View>
            </View>

            <View style={styles.compactStatusRow}>
              <View
                style={[
                  styles.compactStatusItem,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.compactStatusCount,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  {summary.budgetsOnTrack}
                </Text>
                <Text
                  style={[
                    styles.compactStatusLabel,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  On Track
                </Text>
              </View>
              <View
                style={[
                  styles.compactStatusItem,
                  { backgroundColor: "#ff9500" },
                ]}
              >
                <Text style={[styles.compactStatusCount, { color: "#ffffff" }]}>
                  {summary.budgetsInWarning}
                </Text>
                <Text style={[styles.compactStatusLabel, { color: "#ffffff" }]}>
                  Warning
                </Text>
              </View>
              <View
                style={[
                  styles.compactStatusItem,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text
                  style={[
                    styles.compactStatusCount,
                    { color: theme.colors.onError },
                  ]}
                >
                  {summary.budgetsExceeded}
                </Text>
                <Text
                  style={[
                    styles.compactStatusLabel,
                    { color: theme.colors.onError },
                  ]}
                >
                  Exceeded
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <Searchbar
            placeholder="Search budgets..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.compactSearchbar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            inputStyle={{
              color: theme.colors.onSurfaceVariant,
              textAlignVertical: "center",
              paddingVertical: 0,
              includeFontPadding: false,
            }}
          />

          <Text
            style={[styles.filterLabel, { color: theme.colors.onBackground }]}
          >
            Filter by Period
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalFilter}
          >
            <SegmentedButtons
              value={filters.period || "all"}
              onValueChange={handlePeriodFilter}
              buttons={periodFilterOptions}
              style={styles.horizontalSegmentedButtons}
            />
          </ScrollView>

          <Text
            style={[styles.filterLabel, { color: theme.colors.onBackground }]}
          >
            Filter by Status
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalFilter}
          >
            <SegmentedButtons
              value={statusFilter}
              onValueChange={setStatusFilter}
              buttons={statusFilterOptions}
              style={styles.horizontalSegmentedButtons}
            />
          </ScrollView>

          {(filters.period || statusFilter !== "all") && (
            <Button
              mode="outlined"
              onPress={() => {
                clearFilters();
                setStatusFilter("all");
              }}
              style={styles.clearFiltersButton}
              compact
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
          style={styles.fab}
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

        <SuccessModal
          visible={successVisible}
          onClose={handleSuccessClose}
          title="Budget Deleted Successfully!"
          message="The budget has been deleted successfully!"
        />
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
  // Compact Summary Styles
  compactSummary: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  compactItem: {
    alignItems: "center",
    flex: 1,
  },
  compactValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  compactLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  compactStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  compactStatusItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  compactStatusCount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  compactStatusLabel: {
    fontSize: 9,
    marginTop: 1,
  },
  // Filters Styles
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  compactSearchbar: {
    marginBottom: 12,
    borderRadius: 8,
    height: 48,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 4,
  },
  horizontalFilter: {
    marginBottom: 8,
  },
  horizontalSegmentedButtons: {
    marginBottom: 4,
    minWidth: 350,
  },
  clearFiltersButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  budgetList: {
    flex: 1,
    marginTop: 4,
  },
  budgetListContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Reduced space for FAB
    paddingTop: 4,
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
