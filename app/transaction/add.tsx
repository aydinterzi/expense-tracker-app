import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  IconButton,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountSelector } from "../../components/forms/AccountSelector";
import { AmountInput } from "../../components/forms/AmountInput";
import { CategoryPicker } from "../../components/forms/CategoryPicker";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useTransactionStore } from "../../stores/transactionStore";
import { validateAmount } from "../../utils/currency";
import { formatDisplayDate, getCurrentDate } from "../../utils/date";

interface FormData {
  type: "expense" | "income";
  amount: number;
  categoryId?: number;
  accountId?: number;
  description: string;
  notes: string;
  date: string;
}

interface FormErrors {
  amount?: string;
  categoryId?: string;
  accountId?: string;
  description?: string;
}

export default function AddTransactionScreen() {
  const theme = useTheme();
  const { categories, loadCategories } = useCategoryStore();
  const { accounts, loadAccounts } = useAccountStore();
  const { addTransaction, loading } = useTransactionStore();

  const [formData, setFormData] = useState<FormData>({
    type: "expense",
    amount: 0,
    description: "",
    notes: "",
    date: getCurrentDate(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadCategories();
    loadAccounts();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateAmount(formData.amount)) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.accountId) {
      newErrors.accountId = "Please select an account";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please enter a description";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await addTransaction({
        type: formData.type,
        amount: formData.amount,
        categoryId: formData.categoryId!,
        accountId: formData.accountId!,
        description: formData.description.trim(),
        notes: formData.notes.trim() || null,
        date: formData.date,
        receiptPhoto: null,
        isRecurring: false,
        recurringId: null,
        tags: null,
        location: null,
      });

      setSnackbarMessage("Transaction added successfully!");
      setSnackbarVisible(true);

      // Reset form
      setFormData({
        type: "expense",
        amount: 0,
        categoryId: undefined,
        accountId: undefined,
        description: "",
        notes: "",
        date: getCurrentDate(),
      });
      setErrors({});

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      setSnackbarMessage("Failed to add transaction. Please try again.");
      setSnackbarVisible(true);
      console.error("Error adding transaction:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  const transactionTypeOptions = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Transaction",
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View
          style={[
            styles.innerContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Transaction Type */}
            <View style={styles.section}>
              <SegmentedButtons
                value={formData.type}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: value as "expense" | "income",
                    categoryId: undefined,
                  }));
                  setErrors((prev) => ({ ...prev, categoryId: undefined }));
                }}
                buttons={transactionTypeOptions}
                style={[
                  styles.segmentedButtons,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
            </View>

            {/* Amount */}
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              elevation={0}
            >
              <Card.Content style={styles.cardContent}>
                <AmountInput
                  value={formData.amount}
                  onChangeValue={(amount) => {
                    setFormData((prev) => ({ ...prev, amount }));
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  error={errors.amount}
                />
              </Card.Content>
            </Card>

            {/* Account Selection */}
            {accounts.length > 0 && (
              <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                elevation={0}
              >
                <Card.Content style={styles.cardContent}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Select Account
                  </Text>
                  <AccountSelector
                    accounts={accounts}
                    selectedAccountId={formData.accountId}
                    onSelectAccount={(account) => {
                      setFormData((prev) => ({
                        ...prev,
                        accountId: account.id,
                      }));
                      setErrors((prev) => ({ ...prev, accountId: undefined }));
                    }}
                    error={errors.accountId}
                  />
                </Card.Content>
              </Card>
            )}

            {/* Category Selection */}
            {categories.length > 0 && (
              <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                elevation={0}
              >
                <Card.Content style={styles.cardContent}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formData.type === "expense"
                      ? "Expense Category"
                      : "Income Category"}
                  </Text>
                  <CategoryPicker
                    categories={categories}
                    selectedCategoryId={formData.categoryId}
                    onSelectCategory={(category) => {
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: category.id,
                      }));
                      setErrors((prev) => ({ ...prev, categoryId: undefined }));
                    }}
                    transactionType={formData.type}
                    error={errors.categoryId}
                  />
                </Card.Content>
              </Card>
            )}

            {/* Description and Details */}
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              elevation={0}
            >
              <Card.Content style={styles.cardContent}>
                <TextInput
                  label="Description *"
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, description: text }));
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  mode="outlined"
                  error={!!errors.description}
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  placeholder="What was this transaction for?"
                  outlineStyle={styles.inputOutline}
                />
                {errors.description && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.description}
                  </Text>
                )}

                <TextInput
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, notes: text }))
                  }
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  placeholder="Add any additional notes..."
                  outlineStyle={styles.inputOutline}
                />

                {/* Date Selection */}
                <View style={styles.dateContainer}>
                  <Text
                    style={[
                      styles.dateLabel,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.dateButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    activeOpacity={0.7}
                  >
                    <IconButton icon="calendar" size={20} />
                    <Text
                      style={[
                        styles.dateText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {formatDisplayDate(formData.date)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(formData.date)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </Card.Content>
            </Card>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
              >
                Add Transaction
              </Button>
            </View>
          </ScrollView>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>
        </View>
      </SafeAreaView>
    </>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  segmentedButtons: {
    borderRadius: 12,
    marginVertical: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingRight: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    paddingVertical: 32,
    paddingBottom: 40,
  },
  submitButton: {
    borderRadius: 16,
    elevation: 0,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 12,
  },
});
