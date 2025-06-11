import React, { Component, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Log to crash analytics service here
    // crashlytics().recordError(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.errorCard}>
        <Card.Content style={styles.errorContent}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.error }]}
          >
            Something went wrong
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurface }]}
          >
            The app encountered an unexpected error. Please try again.
          </Text>

          {__DEV__ && error && (
            <Text
              variant="bodySmall"
              style={[styles.errorDetails, { color: theme.colors.outline }]}
            >
              {error.message}
            </Text>
          )}

          <Button mode="contained" onPress={onRetry} style={styles.retryButton}>
            Try Again
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorCard: {
    width: "100%",
    maxWidth: 400,
  },
  errorContent: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
  },
  errorDetails: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 12,
    fontFamily: "monospace",
  },
  retryButton: {
    marginTop: 8,
  },
});

export default ErrorBoundary;
