import { router, Stack } from "expo-router";
import React from "react";
import { Alert, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetForm } from "../../components/forms/BudgetForm";
import { CreateBudgetData } from "../../db/services/budgetService";
import { useAccountStore } from "../../stores/accountStore";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";

export default function AddBudgetScreen() {
  const theme = useTheme();
  const { addBudget, loading } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();

  const handleSubmit = async (data: CreateBudgetData) => {
    try {
      await addBudget(data);
      Alert.alert("Success", "Budget created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create budget. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Budget",
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
});
