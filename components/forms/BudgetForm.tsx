import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  RadioButton,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import * as yup from "yup";
import { Account } from "../../db/schema/accounts";
import { Category } from "../../db/schema/categories";
import {
  BudgetWithDetails,
  CreateBudgetData,
} from "../../db/services/budgetService";
import { AmountInput } from "./AmountInput";

// Validation schema
const budgetSchema = yup.object().shape({
  name: yup
    .string()
    .required("Budget name is required")
    .min(2, "Name must be at least 2 characters"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  period: yup
    .string()
    .oneOf(["daily", "weekly", "monthly", "yearly"])
    .required("Period is required"),
  budgetType: yup
    .string()
    .oneOf(["category", "account", "general"])
    .required("Budget type is required"),
  categoryId: yup.number().when("budgetType", {
    is: "category",
    then: (schema) => schema.required("Category is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  accountId: yup.number().when("budgetType", {
    is: "account",
    then: (schema) => schema.required("Account is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  alertPercentage: yup
    .number()
    .min(10, "Alert percentage must be at least 10%")
    .max(100, "Alert percentage cannot exceed 100%"),
});

interface BudgetFormData {
  name: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  budgetType: "category" | "account" | "general";
  categoryId?: number;
  accountId?: number;
  alertPercentage: number;
}

interface BudgetFormProps {
  categories: Category[];
  accounts: Account[];
  onSubmit: (data: CreateBudgetData) => Promise<void>;
  onCancel?: () => void;
  initialData?: BudgetWithDetails;
  loading?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  categories,
  accounts,
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    initialData?.categoryId || undefined
  );
  const [selectedAccount, setSelectedAccount] = useState<number | undefined>(
    initialData?.accountId || undefined
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: yupResolver(budgetSchema),
    defaultValues: {
      name: initialData?.name || "",
      amount: initialData?.amount || 0,
      period: initialData?.period || "monthly",
      budgetType: initialData?.categoryId
        ? "category"
        : initialData?.accountId
        ? "account"
        : "general",
      categoryId: initialData?.categoryId || undefined,
      accountId: initialData?.accountId || undefined,
      alertPercentage: initialData?.alertPercentage || 80,
    },
  });

  const budgetType = watch("budgetType");
  const period = watch("period");

  useEffect(() => {
    if (budgetType === "category") {
      setValue("accountId", undefined);
      setSelectedAccount(undefined);
    } else if (budgetType === "account") {
      setValue("categoryId", undefined);
      setSelectedCategory(undefined);
    } else {
      setValue("categoryId", undefined);
      setValue("accountId", undefined);
      setSelectedCategory(undefined);
      setSelectedAccount(undefined);
    }
  }, [budgetType, setValue]);

  const handleFormSubmit = async (data: BudgetFormData) => {
    const submitData: CreateBudgetData = {
      name: data.name,
      amount: data.amount,
      period: data.period,
      startDate: format(new Date(), "yyyy-MM-dd"),
      alertPercentage: data.alertPercentage,
    };

    if (data.budgetType === "category" && data.categoryId) {
      submitData.categoryId = data.categoryId;
    } else if (data.budgetType === "account" && data.accountId) {
      submitData.accountId = data.accountId;
    }

    await onSubmit(submitData);
  };

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const budgetTypeOptions = [
    { value: "general", label: "General" },
    { value: "category", label: "Category" },
    { value: "account", label: "Account" },
  ];

  const getCategoryIcon = (category: Category) => {
    return category.icon || "tag";
  };

  const getAccountIcon = (account: Account) => {
    return account.icon || "wallet";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <Card.Content>
          {/* Budget Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Budget Name *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
                placeholder="e.g., Groceries, Entertainment"
              />
            )}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.name.message}
            </Text>
          )}

          {/* Budget Amount */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <AmountInput
                value={value}
                onChangeValue={onChange}
                label="Budget Amount *"
                error={errors.amount?.message}
              />
            )}
          />

          {/* Period Selection */}
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Budget Period *
          </Text>
          <Controller
            control={control}
            name="period"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={periodOptions}
                style={styles.segmentedButtons}
              />
            )}
          />

          <Divider style={styles.divider} />

          {/* Budget Type Selection */}
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Budget Type *
          </Text>
          <Controller
            control={control}
            name="budgetType"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={budgetTypeOptions}
                style={styles.segmentedButtons}
              />
            )}
          />

          {/* Category Selection */}
          {budgetType === "category" && (
            <View style={styles.selectionSection}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Select Category *
              </Text>
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange } }) => (
                  <RadioButton.Group
                    onValueChange={(value) => {
                      const categoryId = parseInt(value);
                      setSelectedCategory(categoryId);
                      onChange(categoryId);
                    }}
                    value={selectedCategory?.toString() || ""}
                  >
                    {categories.map((category) => (
                      <View key={category.id} style={styles.radioItem}>
                        <View style={styles.radioContent}>
                          <View
                            style={[
                              styles.categoryIcon,
                              { backgroundColor: category.color },
                            ]}
                          >
                            <Ionicons
                              name={getCategoryIcon(category) as any}
                              size={24}
                              color="#fff"
                            />
                          </View>
                          <Text
                            style={[
                              styles.radioLabel,
                              { color: theme.colors.onSurface },
                            ]}
                          >
                            {category.name}
                          </Text>
                        </View>
                        <RadioButton value={category.id.toString()} />
                      </View>
                    ))}
                  </RadioButton.Group>
                )}
              />
              {errors.categoryId && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.categoryId.message}
                </Text>
              )}
            </View>
          )}

          {/* Account Selection */}
          {budgetType === "account" && (
            <View style={styles.selectionSection}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Select Account *
              </Text>
              <Controller
                control={control}
                name="accountId"
                render={({ field: { onChange } }) => (
                  <RadioButton.Group
                    onValueChange={(value) => {
                      const accountId = parseInt(value);
                      setSelectedAccount(accountId);
                      onChange(accountId);
                    }}
                    value={selectedAccount?.toString() || ""}
                  >
                    {accounts.map((account) => (
                      <View key={account.id} style={styles.radioItem}>
                        <View style={styles.radioContent}>
                          <View
                            style={[
                              styles.accountIcon,
                              { backgroundColor: account.color },
                            ]}
                          >
                            <Ionicons
                              name={getAccountIcon(account) as any}
                              size={24}
                              color="#fff"
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.radioLabel,
                                { color: theme.colors.onSurface },
                              ]}
                            >
                              {account.name}
                            </Text>
                            <Text
                              style={[
                                styles.accountBalance,
                                { color: theme.colors.onSurfaceVariant },
                              ]}
                            >
                              ${account.currentBalance?.toFixed(2) || "0.00"}
                            </Text>
                          </View>
                        </View>
                        <RadioButton value={account.id.toString()} />
                      </View>
                    ))}
                  </RadioButton.Group>
                )}
              />
              {errors.accountId && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.accountId.message}
                </Text>
              )}
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Alert Percentage */}
          <Controller
            control={control}
            name="alertPercentage"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Alert at % spent"
                value={value.toString()}
                onChangeText={(text) => onChange(parseInt(text) || 80)}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.alertPercentage}
                style={styles.input}
                placeholder="80"
                right={<TextInput.Affix text="%" />}
              />
            )}
          />
          {errors.alertPercentage && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.alertPercentage.message}
            </Text>
          )}
          <Text
            style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
          >
            You&apos;ll be alerted when you&apos;ve spent this percentage of
            your budget
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit(handleFormSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
        >
          {initialData ? "Update Budget" : "Create Budget"}
        </Button>
        {onCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            disabled={loading}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
          >
            Cancel
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  selectionSection: {
    marginTop: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  radioContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    color: "#fff",
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  accountBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  helpText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  buttonContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  submitButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
