import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface TransactionFilters {
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  categories: number[];
  accounts: number[];
  types: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  categories: { id: number; name: string }[];
  accounts: { id: number; name: string }[];
  onUpdateFilters: (updates: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
  onClose: () => void;
  showDatePicker: "start" | "end" | null;
  onShowDatePicker: (type: "start" | "end" | null) => void;
  onDateChange: (event: any, selectedDate?: Date) => void;
}

export const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  categories,
  accounts,
  onUpdateFilters,
  onClearFilters,
  onClose,
  showDatePicker,
  onShowDatePicker,
  onDateChange,
}) => {
  const theme = useTheme();

  const toggleCategoryFilter = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    onUpdateFilters({ categories: newCategories });
  };

  const toggleAccountFilter = (accountId: number) => {
    const newAccounts = filters.accounts.includes(accountId)
      ? filters.accounts.filter((id) => id !== accountId)
      : [...filters.accounts, accountId];
    onUpdateFilters({ accounts: newAccounts });
  };

  const toggleTypeFilter = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onUpdateFilters({ types: newTypes });
  };

  return (
    <Surface style={styles.filterPanel} elevation={1}>
      {/* Date Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Date Range</Text>
        <View style={styles.dateRow}>
          <Button
            mode="outlined"
            onPress={() => onShowDatePicker("start")}
            style={styles.dateButton}
          >
            {filters.dateRange.start
              ? filters.dateRange.start.toLocaleDateString()
              : "Start Date"}
          </Button>
          <Text style={styles.dateRangeSeparator}>to</Text>
          <Button
            mode="outlined"
            onPress={() => onShowDatePicker("end")}
            style={styles.dateButton}
          >
            {filters.dateRange.end
              ? filters.dateRange.end.toLocaleDateString()
              : "End Date"}
          </Button>
        </View>
      </View>

      <Divider style={styles.filterDivider} />

      {/* Transaction Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Transaction Type</Text>
        <View style={styles.chipRow}>
          <Chip
            selected={filters.types.includes("expense")}
            onPress={() => toggleTypeFilter("expense")}
            style={styles.filterChip}
          >
            Expense
          </Chip>
          <Chip
            selected={filters.types.includes("income")}
            onPress={() => toggleTypeFilter("income")}
            style={styles.filterChip}
          >
            Income
          </Chip>
          <Chip
            selected={filters.types.includes("transfer")}
            onPress={() => toggleTypeFilter("transfer")}
            style={styles.filterChip}
          >
            Transfer
          </Chip>
        </View>
      </View>

      <Divider style={styles.filterDivider} />

      {/* Amount Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Amount Range</Text>
        <View style={styles.amountRow}>
          <TextInput
            label="Min Amount"
            value={filters.amountRange.min?.toString() || ""}
            onChangeText={(text) => {
              const value = text ? parseFloat(text) : null;
              onUpdateFilters({
                amountRange: { ...filters.amountRange, min: value },
              });
            }}
            keyboardType="numeric"
            style={styles.amountInput}
            dense
          />
          <TextInput
            label="Max Amount"
            value={filters.amountRange.max?.toString() || ""}
            onChangeText={(text) => {
              const value = text ? parseFloat(text) : null;
              onUpdateFilters({
                amountRange: { ...filters.amountRange, max: value },
              });
            }}
            keyboardType="numeric"
            style={styles.amountInput}
            dense
          />
        </View>
      </View>

      <Divider style={styles.filterDivider} />

      {/* Categories Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Categories</Text>
        <View style={styles.chipRow}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={filters.categories.includes(category.id)}
              onPress={() => toggleCategoryFilter(category.id)}
              style={styles.filterChip}
            >
              {category.name}
            </Chip>
          ))}
        </View>
      </View>

      <Divider style={styles.filterDivider} />

      {/* Accounts Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Accounts</Text>
        <View style={styles.chipRow}>
          {accounts.map((account) => (
            <Chip
              key={account.id}
              selected={filters.accounts.includes(account.id)}
              onPress={() => toggleAccountFilter(account.id)}
              style={styles.filterChip}
            >
              {account.name}
            </Chip>
          ))}
        </View>
      </View>

      {/* Filter Actions */}
      <View style={styles.filterActions}>
        <Button
          mode="outlined"
          onPress={onClearFilters}
          style={styles.filterActionButton}
        >
          Clear All
        </Button>
        <Button
          mode="contained"
          onPress={onClose}
          style={styles.filterActionButton}
        >
          Apply Filters
        </Button>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  filterPanel: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  filterDivider: {
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    fontWeight: "500",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  filterActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
