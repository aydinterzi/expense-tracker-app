import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetForm } from "../../components/forms/BudgetForm";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { CreateBudgetData } from "../../db/services/budgetService";
import { useAccountStore } from "../../stores/accountStore";
import { useBudgetStore } from "../../stores/budgetStore";
import { useCategoryStore } from "../../stores/categoryStore";

export default function AddBudgetScreen() {
  const theme = useTheme();
  const { addBudget, loading } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const [successVisible, setSuccessVisible] = useState(false);

  const handleSubmit = async (data: CreateBudgetData) => {
    try {
      await addBudget(data);
      setSuccessVisible(true);
    } catch (error) {
      // You can add error handling here if needed
      console.error("Failed to create budget:", error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.back();
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
      <SuccessModal
        visible={successVisible}
        onClose={handleSuccessClose}
        title="Budget Created Successfully!"
        message="Your budget has been created successfully!"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
