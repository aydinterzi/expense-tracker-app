import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { SuccessModal } from "../../components/ui/SuccessModal";
import { useAccountStore } from "../../stores/accountStore";
import { validateAmount } from "../../utils/currency";

interface FormData {
  name: string;
  type: "bank" | "cash" | "credit_card" | "investment";
  initialBalance: number;
  color: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  initialBalance?: string;
  color?: string;
}

const ACCOUNT_TYPES = [
  { value: "bank" as const, label: "Bank Account", icon: "card" },
  { value: "cash" as const, label: "Cash", icon: "cash" },
  { value: "credit_card" as const, label: "Credit Card", icon: "card-outline" },
  { value: "investment" as const, label: "Investment", icon: "trending-up" },
];

const ACCOUNT_COLORS = [
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#F44336", // Red
  "#607D8B", // Blue Grey
  "#795548", // Brown
  "#009688", // Teal
  "#E91E63", // Pink
  "#3F51B5", // Indigo
];

export default function AddAccountScreen() {
  const theme = useTheme();
  const { addAccount, loading } = useAccountStore();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "bank",
    initialBalance: 0,
    color: ACCOUNT_COLORS[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter an account name";
    }

    if (!formData.type) {
      newErrors.type = "Please select an account type";
    }

    if (!validateAmount(formData.initialBalance)) {
      newErrors.initialBalance = "Please enter a valid initial balance";
    }

    if (!formData.color) {
      newErrors.color = "Please select a color";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await addAccount({
        name: formData.name.trim(),
        type: formData.type,
        initialBalance: formData.initialBalance,
        currentBalance: formData.initialBalance,
        color: formData.color,
        isActive: true,
        icon:
          ACCOUNT_TYPES.find((t) => t.value === formData.type)?.icon ||
          "wallet",
        currency: "USD",
      });

      setShowSuccessModal(true);
    } catch (error) {
      setSnackbarMessage("Failed to create account. Please try again.");
      setSnackbarVisible(true);
      console.error("Error creating account:", error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const getAccountTypeSegments = () => {
    return ACCOUNT_TYPES.slice(0, 4).map((type) => ({
      value: type.value,
      label: type.label,
      icon: type.icon,
    }));
  };

  const getSelectedAccountType = () => {
    return ACCOUNT_TYPES.find((type) => type.value === formData.type);
  };

  const getSuccessMessage = () => {
    const accountType = ACCOUNT_TYPES.find(
      (type) => type.value === formData.type
    );
    return `${accountType?.label || "Account"} "${
      formData.name
    }" has been created successfully with initial balance of $${formData.initialBalance.toFixed(
      2
    )}.`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Account",
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
            {/* Account Name */}
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              elevation={0}
            >
              <Card.Content style={styles.cardContent}>
                <TextInput
                  label="Account Name *"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, name: text }));
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  mode="outlined"
                  error={!!errors.name}
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  placeholder="e.g., Main Checking, Cash Wallet"
                  outlineStyle={styles.inputOutline}
                />
                {errors.name && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.name}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Account Type */}
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
                  Account Type *
                </Text>

                <View style={styles.accountTypeGrid}>
                  {ACCOUNT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.accountTypeCard,
                        {
                          backgroundColor:
                            formData.type === type.value
                              ? theme.colors.primaryContainer
                              : theme.colors.surfaceVariant,
                          borderColor:
                            formData.type === type.value
                              ? theme.colors.primary
                              : "transparent",
                        },
                      ]}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, type: type.value }));
                        setErrors((prev) => ({ ...prev, type: undefined }));
                      }}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={28}
                        color={
                          formData.type === type.value
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant
                        }
                      />
                      <Text
                        style={[
                          styles.accountTypeText,
                          {
                            color:
                              formData.type === type.value
                                ? theme.colors.primary
                                : theme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {errors.type && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.type}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Initial Balance */}
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              elevation={0}
            >
              <Card.Content style={styles.cardContent}>
                <TextInput
                  label="Initial Balance *"
                  value={formData.initialBalance.toString()}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      initialBalance: amount,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      initialBalance: undefined,
                    }));
                  }}
                  mode="outlined"
                  error={!!errors.initialBalance}
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  placeholder="0.00"
                  keyboardType="numeric"
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Affix text="$" />}
                />
                {errors.initialBalance && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.initialBalance}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Color Selection */}
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
                  Account Color *
                </Text>
                <View style={styles.colorGrid}>
                  {ACCOUNT_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: color,
                          borderWidth: formData.color === color ? 3 : 1,
                          borderColor:
                            formData.color === color
                              ? theme.colors.onSurface
                              : theme.colors.outline,
                        },
                      ]}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, color }));
                        setErrors((prev) => ({ ...prev, color: undefined }));
                      }}
                    >
                      {formData.color === color && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.color && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.color}
                  </Text>
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
                Create Account
              </Button>
            </View>
          </ScrollView>

          {/* Success Modal */}
          <SuccessModal
            visible={showSuccessModal}
            title="Account Created!"
            message={getSuccessMessage()}
            onClose={handleSuccessModalClose}
            autoClose={true}
            autoCloseDelay={2000}
          />

          {/* Error Snackbar */}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  accountTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
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
  accountTypeCard: {
    width: "48%",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
});
