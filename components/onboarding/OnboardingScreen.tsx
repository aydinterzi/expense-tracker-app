import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "1",
    title: "Track Your Expenses",
    description:
      "Easily record your daily expenses and income with just a few taps. Categorize transactions for better insights.",
    icon: "💰",
    color: "#4CAF50",
  },
  {
    id: "2",
    title: "Set & Monitor Budgets",
    description:
      "Create budgets for different categories and get alerts when you're close to your limits.",
    icon: "📊",
    color: "#2196F3",
  },
  {
    id: "3",
    title: "Analyze Your Spending",
    description:
      "View detailed reports and charts to understand your spending patterns and make better financial decisions.",
    icon: "📈",
    color: "#FF9800",
  },
  {
    id: "4",
    title: "Your Data is Safe",
    description:
      "All your financial data is stored locally on your device. Export your data anytime for backup.",
    icon: "🔒",
    color: "#9C27B0",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      translateX.value = withTiming(-nextStep * screenWidth, { duration: 300 });
      setCurrentStep(nextStep);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      translateX.value = withTiming(-prevStep * screenWidth, { duration: 300 });
      setCurrentStep(prevStep);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="titleSmall" style={{ color: theme.colors.outline }}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={theme.colors.outline}
        >
          Skip
        </Button>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.stepsContainer,
            animatedStyle,
            { width: screenWidth * onboardingSteps.length },
          ]}
        >
          {onboardingSteps.map((step, index) => (
            <View
              key={step.id}
              style={[styles.stepContainer, { width: screenWidth }]}
            >
              <Card
                style={[
                  styles.stepCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Card.Content style={styles.stepContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: step.color + "20" },
                    ]}
                  >
                    <Text style={styles.icon}>{step.icon}</Text>
                  </View>

                  <Text
                    variant="headlineMedium"
                    style={[styles.title, { color: theme.colors.onSurface }]}
                  >
                    {step.title}
                  </Text>

                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.description,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {step.description}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.pagination}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentStep
                    ? theme.colors.primary
                    : theme.colors.outline,
                width: index === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentStep === 0}
          style={styles.button}
        >
          Previous
        </Button>

        <Button mode="contained" onPress={handleNext} style={styles.button}>
          {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  stepsContainer: {
    flexDirection: "row",
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  stepCard: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepContent: {
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  button: {
    flex: 1,
  },
});
