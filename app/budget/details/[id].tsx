import { format, parseISO } from "date-fns";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetWithDetails } from "../../../db/services/budgetService";
import { useBudgetStore } from "../../../stores/budgetStore";

export default function BudgetDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = parseInt(id!);

  const { getBudget, removeBudget, loading } = useBudgetStore();
  const [budget, setBudget] = useState<BudgetWithDetails | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    loadBudget();
  }, [budgetId]);

  const loadBudget = async () => {
    try {
      setLoadingBudget(true);
      const budgetData = await getBudget(budgetId);
      setBudget(budgetData);
    } catch (error) {
      Alert.alert("Error", "Failed to load budget details.");
      router.back();
    } finally {
      setLoadingBudget(false);
    }
  };

  const handleEdit = () => {
    router.push(`/budget/edit/${budgetId}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeBudget(budgetId);
              Alert.alert("Success", "Budget deleted successfully!");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete budget.");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return theme.colors.primary;
      case "warning":
        return "#ff9500";
      case "exceeded":
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "On Track";
      case "warning":
        return "Warning";
      case "exceeded":
        return "Exceeded";
      default:
        return "Unknown";
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return period;
    }
  };

  if (loadingBudget) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budget Details",
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: "600",
            },
          }}
        />
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          edges={["bottom"]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" animating={true} />
            <Text
              style={[styles.loadingText, { color: theme.colors.onBackground }]}
            >
              Loading budget details...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!budget) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budget Details",
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: "600",
            },
          }}
        />
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          edges={["bottom"]}
        >
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Budget not found
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: budget.name,
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerRight: () => (
            <View style={styles.headerActions}>
              <IconButton icon="pencil" size={24} onPress={handleEdit} />
              <IconButton icon="delete" size={24} onPress={handleDelete} />
            </View>
          ),
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Budget Overview Card */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <Card.Content>
              <View style={styles.budgetHeader}>
                <View>
                  <Text
                    style={[
                      styles.budgetName,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {budget.name}
                  </Text>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {budget.categoryName ||
                      budget.accountName ||
                      "General Budget"}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        getStatusColor(budget.progress.status) + "20",
                    },
                  ]}
                  textStyle={{ color: getStatusColor(budget.progress.status) }}
                >
                  {getStatusText(budget.progress.status)}
                </Chip>
              </View>

              <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                  <Text
                    style={[
                      styles.spentAmount,
                      { color: getStatusColor(budget.progress.status) },
                    ]}
                  >
                    ${budget.progress.spent.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.totalAmount,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    / ${budget.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={Math.min(budget.progress.percentage / 100, 1)}
                    color={getStatusColor(budget.progress.status)}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.percentageText,
                      { color: getStatusColor(budget.progress.status) },
                    ]}
                  >
                    {budget.progress.percentage.toFixed(1)}%
                  </Text>
                </View>

                <Text
                  style={[
                    styles.remainingText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {budget.progress.remaining >= 0
                    ? `$${budget.progress.remaining.toFixed(2)} remaining`
                    : `$${Math.abs(budget.progress.remaining).toFixed(
                        2
                      )} over budget`}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Budget Info Card */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <Card.Content>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Budget Information
              </Text>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Period
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {getPeriodText(budget.period)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Start Date
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {format(parseISO(budget.startDate), "MMM dd, yyyy")}
                </Text>
              </View>

              {budget.endDate && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    End Date
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {format(parseISO(budget.endDate), "MMM dd, yyyy")}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Alert Threshold
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {budget.alertPercentage}%
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Status
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {budget.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Progress Stats Card */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <Card.Content>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Progress Statistics
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: theme.colors.primary }]}
                  >
                    ${budget.amount.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Budget Amount
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: getStatusColor(budget.progress.status) },
                    ]}
                  >
                    ${budget.progress.spent.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Amount Spent
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          budget.progress.remaining >= 0
                            ? theme.colors.primary
                            : theme.colors.error,
                      },
                    ]}
                  >
                    ${Math.abs(budget.progress.remaining).toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {budget.progress.remaining >= 0
                      ? "Remaining"
                      : "Over Budget"}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.colors.secondary },
                    ]}
                  >
                    {budget.progress.percentage.toFixed(1)}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Used
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Budget
            </Button>
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={styles.deleteButton}
              buttonColor={theme.colors.errorContainer}
              textColor={theme.colors.error}
              icon="delete"
            >
              Delete Budget
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  budgetName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    opacity: 0.7,
  },
  statusChip: {
    borderRadius: 12,
  },
  amountSection: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  spentAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 20,
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  remainingText: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  editButton: {
    paddingVertical: 8,
  },
  deleteButton: {
    paddingVertical: 8,
  },
});
