import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  Switch,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import {
  notificationService,
  NotificationSettings,
} from "../../services/notificationService";

export const NotificationSettingsComponent: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetAlerts: true,
    budgetExceeded: true,
    weeklyReports: true,
    monthlyReports: true,
    transactionReminders: false,
    goalMilestones: true,
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = notificationService.getSettings();
      const hasPermissions = notificationService.isPermissionGranted();

      setSettings(currentSettings);
      setPermissionsGranted(hasPermissions);
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      await notificationService.updateSettings({ [key]: value });

      // Re-schedule notifications based on new settings
      if (key === "weeklyReports") {
        if (value) {
          await notificationService.scheduleWeeklyReport();
        } else {
          await notificationService.cancelScheduledNotifications(
            "weekly-report"
          );
        }
      }

      if (key === "monthlyReports") {
        if (value) {
          await notificationService.scheduleMonthlyReport();
        } else {
          await notificationService.cancelScheduledNotifications(
            "monthly-report"
          );
        }
      }

      if (key === "transactionReminders") {
        if (value) {
          await notificationService.scheduleTransactionReminder();
        } else {
          await notificationService.cancelScheduledNotifications(
            "transaction-reminder"
          );
        }
      }

      showSnackbar("Settings updated successfully");
    } catch (error) {
      console.error("Error updating notification setting:", error);
      showSnackbar("Failed to update settings");
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionsGranted(granted);

      if (granted) {
        showSnackbar("Notification permissions granted");
        // Re-initialize to set up channels and categories
        await notificationService.initialize();
      } else {
        showSnackbar("Notification permissions denied");
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      showSnackbar("Failed to request permissions");
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendBudgetWarningNotification({
        budgetId: 1,
        budgetName: "Test Budget",
        percentage: 85,
        amount: 850,
        budgetAmount: 1000,
        alertType: "warning",
      });
      showSnackbar("Test notification sent");
    } catch (error) {
      console.error("Error sending test notification:", error);
      showSnackbar("Failed to send test notification");
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    key: keyof NotificationSettings,
    icon: string
  ) => (
    <List.Item
      title={title}
      description={subtitle}
      left={(props) => <List.Icon {...props} icon={icon} />}
      right={() => (
        <Switch
          value={settings[key]}
          onValueChange={(value) => updateSetting(key, value)}
          disabled={!permissionsGranted}
        />
      )}
      style={styles.listItem}
    />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Permissions Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Notification Permissions</Title>
          <Text style={styles.description}>
            {permissionsGranted
              ? "Notifications are enabled for this app."
              : "Enable notifications to receive budget alerts and reminders."}
          </Text>

          {!permissionsGranted && (
            <Button
              mode="contained"
              onPress={requestPermissions}
              style={styles.permissionButton}
              icon="bell"
            >
              Enable Notifications
            </Button>
          )}

          {permissionsGranted && (
            <Button
              mode="outlined"
              onPress={testNotification}
              style={styles.testButton}
              icon="bell-ring"
            >
              Send Test Notification
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Budget Alerts Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Budget Alerts</Title>
          <Text style={styles.description}>
            Get notified when your spending approaches or exceeds budget limits.
          </Text>
        </Card.Content>

        {renderSettingItem(
          "Budget Warnings",
          "Alert when spending reaches threshold (default 80%)",
          "budgetAlerts",
          "alert-circle"
        )}

        <Divider />

        {renderSettingItem(
          "Budget Exceeded",
          "Alert when budget is completely exceeded",
          "budgetExceeded",
          "alert"
        )}
      </Card>

      {/* Reports Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Reports & Summaries</Title>
          <Text style={styles.description}>
            Receive periodic summaries of your spending and financial progress.
          </Text>
        </Card.Content>

        {renderSettingItem(
          "Weekly Reports",
          "Sunday morning spending summary",
          "weeklyReports",
          "chart-line"
        )}

        <Divider />

        {renderSettingItem(
          "Monthly Reports",
          "Monthly financial overview on the 1st",
          "monthlyReports",
          "calendar-month"
        )}
      </Card>

      {/* Reminders Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Reminders</Title>
          <Text style={styles.description}>
            Helpful reminders to keep you on track with your financial goals.
          </Text>
        </Card.Content>

        {renderSettingItem(
          "Transaction Reminders",
          "Daily reminder to log expenses (8:00 PM)",
          "transactionReminders",
          "clock-alert"
        )}

        <Divider />

        {renderSettingItem(
          "Goal Milestones",
          "Celebrate progress on savings goals",
          "goalMilestones",
          "trophy"
        )}
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  listItem: {
    paddingVertical: 8,
  },
  permissionButton: {
    marginTop: 8,
  },
  testButton: {
    marginTop: 8,
  },
});
