import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetForm } from "../../../components/forms/BudgetForm";
import { SuccessModal } from "../../../components/ui/SuccessModal";
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
  const [successVisible, setSuccessVisible] = useState(false);

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
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.back();
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
        <SuccessModal
          visible={successVisible}
          onClose={handleSuccessClose}
          title="Budget Updated Successfully!"
          message="Your budget changes have been saved successfully!"
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
