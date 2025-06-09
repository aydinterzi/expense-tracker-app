import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, RadioButton, Text, useTheme } from "react-native-paper";
import { Account } from "../../db/schema/accounts";
import { formatCurrency } from "../../utils/currency";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId?: number;
  onSelectAccount: (account: Account) => void;
  error?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  error,
}) => {
  const theme = useTheme();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return "card";
      case "cash":
        return "cash";
      case "credit_card":
        return "card-outline";
      case "investment":
        return "trending-up";
      default:
        return "wallet";
    }
  };

  const renderAccount = (account: Account) => {
    const isSelected = selectedAccountId === account.id;

    return (
      <Card
        key={account.id}
        style={[
          styles.accountCard,
          isSelected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
        ]}
        onPress={() => onSelectAccount(account)}
      >
        <Card.Content style={styles.accountContent}>
          <View style={styles.accountInfo}>
            <View style={styles.accountHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: account.color + "20" },
                ]}
              >
                <Ionicons
                  name={getAccountIcon(account.type)}
                  size={20}
                  color={account.color}
                />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountBalance}>
                  {formatCurrency(account.currentBalance || 0)}
                </Text>
              </View>
            </View>
          </View>
          <RadioButton
            value={account.id.toString()}
            status={isSelected ? "checked" : "unchecked"}
            onPress={() => onSelectAccount(account)}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.accountsContainer}>
        {accounts.filter((account) => account.isActive).map(renderAccount)}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  accountsContainer: {
    gap: 8,
  },
  accountCard: {
    marginBottom: 4,
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
