import { format, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";
import { BudgetWithDetails } from "../../db/services/budgetService";

interface BudgetCardProps {
  budget: BudgetWithDetails;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onPress,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (budget.progress.status) {
      case "good":
        return theme.colors.primary;
      case "warning":
        return "#ff9500";
      case "exceeded":
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = () => {
    switch (budget.progress.status) {
      case "good":
        return "On Track";
      case "warning":
        return "Warning";
      case "exceeded":
        return "Exceeded";
      default:
        return "Unknown";
    }
  };

  const getStatusTextColor = () => {
    switch (budget.progress.status) {
      case "good":
        return theme.colors.onPrimary;
      case "warning":
        return "#ffffff";
      case "exceeded":
        return theme.colors.onError;
      default:
        return theme.colors.onSurface;
    }
  };

  const getPeriodText = () => {
    switch (budget.period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return budget.period;
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      elevation={2}
      onPress={onPress}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text
              style={[styles.budgetName, { color: theme.colors.onSurface }]}
            >
              {budget.name}
            </Text>
            <Text
              style={[
                styles.categoryName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {budget.categoryName || budget.accountName || "General"}
            </Text>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={onEdit}
                iconColor={theme.colors.onSurfaceVariant}
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                onPress={onDelete}
                iconColor={theme.colors.error}
              />
            )}
          </View>
        </View>

        {/* Amount and Progress */}
        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text style={[styles.spentAmount, { color: getStatusColor() }]}>
              ${budget.progress.spent.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.totalAmount,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              / ${budget.amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={Math.min(budget.progress.percentage / 100, 1)}
                color={getStatusColor()}
                style={styles.progressBar}
              />
            </View>
            <Text style={[styles.percentageText, { color: getStatusColor() }]}>
              {budget.progress.percentage.toFixed(1)}%
            </Text>
          </View>

          <Text
            style={[
              styles.remainingAmount,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {budget.progress.remaining >= 0
              ? `$${budget.progress.remaining.toFixed(2)} remaining`
              : `$${Math.abs(budget.progress.remaining).toFixed(
                  2
                )} over budget`}
          </Text>
        </View>

        {/* Status and Period */}
        <View style={styles.footer}>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text
            style={[
              styles.periodText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {getPeriodText()} • {formatDate(budget.startDate)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    marginTop: -8,
    marginRight: -8,
  },
  progressSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  progressBarContainer: {
    flex: 1,
    marginRight: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
  },
  remainingAmount: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  periodText: {
    fontSize: 12,
  },
});
