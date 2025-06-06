import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { BarChart as RNBarChart } from "react-native-chart-kit";
import { Card, Text, useTheme } from "react-native-paper";

interface BarChartData {
  x: string; // category/period name
  y: number; // amount
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  width?: number;
  yAxisSuffix?: string;
  showValues?: boolean;
  horizontal?: boolean;
  barColor?: string;
}

const screenWidth = Dimensions.get("window").width;

export default function BarChart({
  data,
  title,
  height = 220,
  width,
  yAxisSuffix = "",
  showValues = false,
  horizontal = false,
  barColor = "#3498db",
}: BarChartProps) {
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
  const chartData = {
    labels: data.map((item) => item.x),
    datasets: [
      {
        data: data.map((item) => item.y),
        color: (opacity = 1) => barColor,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(68, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.colors.outline,
      strokeWidth: 1,
    },
    barPercentage: 0.7,
    fillShadowGradient: barColor,
    fillShadowGradientOpacity: 0.8,
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
          <RNBarChart
            data={chartData}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisSuffix={yAxisSuffix}
            yAxisLabel=""
            yAxisInterval={1}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={true}
            showValuesOnTopOfBars={showValues}
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
