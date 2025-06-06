import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { PieChart as RNPieChart } from "react-native-chart-kit";
import { Card, Text, useTheme } from "react-native-paper";

interface PieChartData {
  x: string; // category name
  y: number; // amount
  label?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  colorScheme?: string[];
}

const defaultColors = [
  "#3498db",
  "#e74c3c",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#34495e",
  "#e67e22",
  "#95a5a6",
  "#f1c40f",
  "#d35400",
  "#27ae60",
];

const screenWidth = Dimensions.get("window").width;

export default function PieChart({
  data,
  title,
  height = 250,
  width,
  showLegend = true,
  colorScheme = defaultColors,
}: PieChartProps) {
  const theme = useTheme();
  const chartWidth = width || screenWidth - 32;

  if (!data || data.length === 0) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          {title && (
            <Text
              variant="titleMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {title}
            </Text>
          )}
          <View style={[styles.emptyContainer, { height }]}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No data available
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Transform data for react-native-chart-kit
  const chartData = data.map((item, index) => ({
    name: item.x,
    population: item.y,
    color: colorScheme[index % colorScheme.length],
    legendFontColor: theme.colors.onSurface,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(68, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        {title && (
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
        )}

        <View style={styles.chartContainer}>
          <RNPieChart
            data={chartData}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute={false}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
