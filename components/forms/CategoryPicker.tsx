import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";
import { Category } from "../../db/schema/categories";

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelectCategory: (category: Category) => void;
  transactionType: "expense" | "income";
  error?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  transactionType,
  error,
}) => {
  const theme = useTheme();

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  const renderCategory = (item: Category) => {
    const isSelected = selectedCategoryId === item.id;

    return (
      <Card
        key={item.id}
        style={[
          styles.categoryCard,
          isSelected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
        onPress={() => onSelectCategory(item)}
      >
        <Card.Content style={styles.categoryContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <Text
            style={[
              styles.categoryName,
              isSelected && { color: theme.colors.primary, fontWeight: "600" },
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  // Split categories into rows of 2
  const rows = [];
  for (let i = 0; i < filteredCategories.length; i += 2) {
    rows.push(filteredCategories.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {selectedCategoryId && (
        <View style={styles.selectedContainer}>
          <Chip
            mode="outlined"
            style={[styles.selectedChip, { borderColor: theme.colors.primary }]}
            textStyle={{ color: theme.colors.primary }}
          >
            {filteredCategories.find((c) => c.id === selectedCategoryId)
              ?.name || "Unknown"}
          </Chip>
        </View>
      )}

      <View style={styles.categoriesContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(renderCategory)}
            {/* Fill remaining space if odd number of items in last row */}
            {row.length === 1 && <View style={styles.categoryCard} />}
          </View>
        ))}
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
  selectedContainer: {
    marginBottom: 12,
  },
  selectedChip: {
    alignSelf: "flex-start",
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryCard: {
    flex: 1,
    margin: 4,
    minHeight: 80,
  },
  categoryContent: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
