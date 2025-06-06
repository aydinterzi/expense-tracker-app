import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetForm } from "../../../components/forms/BudgetForm";
import {
  BudgetWithDetails,
  CreateBudgetData,
} from "../../../db/services/budgetService";
import { useAccountStore } from "../../../stores/accountStore";
import { useBudgetStore } from "../../../stores/budgetStore";
import { useCategoryStore } from "../../../stores/categoryStore";

export default function EditBudgetScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = parseInt(id!);

  const { editBudget, getBudget, loading } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();

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

  const handleSubmit = async (data: CreateBudgetData) => {
    try {
      await editBudget(budgetId, data);
      Alert.alert("Success", "Budget updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingBudget) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Edit Budget",
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
              Loading budget...
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
            title: "Edit Budget",
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
          title: "Edit Budget",
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
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <BudgetForm
          categories={categories}
          accounts={accounts}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={budget}
          loading={loading}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
