import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { formatCurrency, parseCurrencyInput } from "../../utils/currency";

interface AmountInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  label?: string;
  error?: string;
  currency?: string;
  style?: any;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeValue,
  label = "Amount",
  error,
  currency = "USD",
  style,
}) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = React.useState(
    value > 0 ? value.toString() : ""
  );

  const handleTextChange = (text: string) => {
    // Allow only numbers and decimal point
    const sanitized = text.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }

    const finalValue = parts.join(".");
    setDisplayValue(finalValue);

    const numericValue = parseCurrencyInput(finalValue);
    onChangeValue(numericValue);
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplayValue(value.toFixed(2));
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={displayValue}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        keyboardType="numeric"
        mode="outlined"
        error={!!error}
        style={styles.input}
        contentStyle={styles.inputContent}
        left={<TextInput.Icon icon="currency-usd" />}
        placeholder="0.00"
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      {value > 0 && (
        <Text style={[styles.previewText, { color: theme.colors.primary }]}>
          {formatCurrency(value, currency)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  inputContent: {
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 12,
    opacity: 0.8,
  },
});
