import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { LineChart as RNLineChart } from "react-native-chart-kit";
import { Card, Text, useTheme } from "react-native-paper";

interface LineChartData {
  x: string; // month/period name
  y: number; // amount
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  height?: number;
  width?: number;
  yAxisSuffix?: string;
  yAxisPrefix?: string;
  showDots?: boolean;
  bezier?: boolean;
}

const screenWidth = Dimensions.get("window").width;

export default function LineChart({
  data,
  title,
  height = 220,
  width,
  yAxisSuffix = "",
  yAxisPrefix = "",
  showDots = true,
  bezier = true,
}: LineChartProps) {
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
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`, // Blue color
        strokeWidth: 3,
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
    propsForDots: {
      r: showDots ? "4" : "0",
      strokeWidth: "2",
      stroke: "#3498db",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.colors.outline,
      strokeWidth: 1,
    },
    fillShadowGradient: "#3498db",
    fillShadowGradientOpacity: 0.1,
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
          <RNLineChart
            data={chartData}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            bezier={bezier}
            style={styles.chart}
            yAxisSuffix={yAxisSuffix}
            yAxisInterval={1}
            transparent={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withDots={showDots}
            withShadow={false}
            withScrollableDot={false}
            withInnerLines={true}
            withOuterLines={false}
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
