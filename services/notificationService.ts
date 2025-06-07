import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  budgetAlerts: boolean;
  budgetExceeded: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  transactionReminders: boolean;
  goalMilestones: boolean;
}

export interface BudgetNotificationData {
  budgetId: number;
  budgetName: string;
  percentage: number;
  amount: number;
  budgetAmount: number;
  alertType: "warning" | "exceeded";
}

const NOTIFICATION_SETTINGS_KEY = "notification_settings";
const NOTIFICATION_PERMISSIONS_KEY = "notification_permissions";

class NotificationService {
  private settings: NotificationSettings = {
    budgetAlerts: true,
    budgetExceeded: true,
    weeklyReports: true,
    monthlyReports: true,
    transactionReminders: false,
    goalMilestones: true,
  };

  private permissionsGranted = false;

  async initialize(): Promise<void> {
    try {
      // Load settings from storage
      await this.loadSettings();

      // Request permissions
      await this.requestPermissions();

      // Set up notification categories
      await this.setupNotificationCategories();

      console.log("📱 Notification service initialized");
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionsGranted = finalStatus === "granted";

      // Store permission status
      await AsyncStorage.setItem(
        NOTIFICATION_PERMISSIONS_KEY,
        JSON.stringify(this.permissionsGranted)
      );

      if (!this.permissionsGranted) {
        console.warn("Notification permissions not granted");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("budget-alerts", {
          name: "Budget Alerts",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("reports", {
          name: "Reports & Summaries",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "default",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync("budget-alert", [
        {
          identifier: "view-budget",
          buttonTitle: "View Budget",
          options: { opensAppToForeground: true },
        },
        {
          identifier: "dismiss",
          buttonTitle: "Dismiss",
          options: { isDestructive: true },
        },
      ]);

      await Notifications.setNotificationCategoryAsync("budget-exceeded", [
        {
          identifier: "view-budget",
          buttonTitle: "View Budget",
          options: { opensAppToForeground: true },
        },
        {
          identifier: "add-transaction",
          buttonTitle: "Add Transaction",
          options: { opensAppToForeground: true },
        },
      ]);
    } catch (error) {
      console.error("Error setting up notification categories:", error);
    }
  }

  async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(
        NOTIFICATION_SETTINGS_KEY
      );
      if (settingsJson) {
        this.settings = { ...this.settings, ...JSON.parse(settingsJson) };
      }

      const permissionsJson = await AsyncStorage.getItem(
        NOTIFICATION_PERMISSIONS_KEY
      );
      if (permissionsJson) {
        this.permissionsGranted = JSON.parse(permissionsJson);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }

  async updateSettings(
    newSettings: Partial<NotificationSettings>
  ): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  isPermissionGranted(): boolean {
    return this.permissionsGranted;
  }

  // Budget Alert Notifications
  async sendBudgetWarningNotification(
    data: BudgetNotificationData
  ): Promise<void> {
    if (!this.permissionsGranted || !this.settings.budgetAlerts) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Budget Alert",
          body: `${data.budgetName} is ${data.percentage.toFixed(
            1
          )}% spent ($${data.amount.toFixed(2)} of $${data.budgetAmount.toFixed(
            2
          )})`,
          data: {
            type: "budget-warning",
            budgetId: data.budgetId,
            budgetName: data.budgetName,
          },
          categoryIdentifier: "budget-alert",
          sound: "default",
        },
        trigger: null, // Send immediately
      });

      console.log(
        `📱 Budget warning notification sent for: ${data.budgetName}`
      );
    } catch (error) {
      console.error("Error sending budget warning notification:", error);
    }
  }

  async sendBudgetExceededNotification(
    data: BudgetNotificationData
  ): Promise<void> {
    if (!this.permissionsGranted || !this.settings.budgetExceeded) {
      return;
    }

    try {
      const overspent = data.amount - data.budgetAmount;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 Budget Exceeded!",
          body: `${data.budgetName} exceeded by $${overspent.toFixed(
            2
          )}. Total spent: $${data.amount.toFixed(2)}`,
          data: {
            type: "budget-exceeded",
            budgetId: data.budgetId,
            budgetName: data.budgetName,
            overspent,
          },
          categoryIdentifier: "budget-exceeded",
          sound: "default",
        },
        trigger: null,
      });

      console.log(
        `📱 Budget exceeded notification sent for: ${data.budgetName}`
      );
    } catch (error) {
      console.error("Error sending budget exceeded notification:", error);
    }
  }

  // Weekly/Monthly Report Notifications
  async scheduleWeeklyReport(): Promise<void> {
    if (!this.permissionsGranted || !this.settings.weeklyReports) {
      return;
    }

    try {
      // Cancel existing weekly reports
      await this.cancelScheduledNotifications("weekly-report");

      // Schedule for every Sunday at 9 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📊 Weekly Spending Report",
          body: "Your weekly spending summary is ready. Tap to view insights.",
          data: {
            type: "weekly-report",
          },
          sound: "default",
        },
        trigger: {
          weekday: 1, // Sunday
          hour: 9,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      console.log("📱 Weekly report notifications scheduled");
    } catch (error) {
      console.error("Error scheduling weekly report:", error);
    }
  }

  async scheduleMonthlyReport(): Promise<void> {
    if (!this.permissionsGranted || !this.settings.monthlyReports) {
      return;
    }

    try {
      // Cancel existing monthly reports
      await this.cancelScheduledNotifications("monthly-report");

      // Schedule for 1st of every month at 10 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📈 Monthly Financial Report",
          body: "Your monthly financial summary is ready. Review your progress!",
          data: {
            type: "monthly-report",
          },
          sound: "default",
        },
        trigger: {
          day: 1,
          hour: 10,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      console.log("📱 Monthly report notifications scheduled");
    } catch (error) {
      console.error("Error scheduling monthly report:", error);
    }
  }

  // Transaction Reminder Notifications
  async scheduleTransactionReminder(): Promise<void> {
    if (!this.permissionsGranted || !this.settings.transactionReminders) {
      return;
    }

    try {
      // Cancel existing reminders
      await this.cancelScheduledNotifications("transaction-reminder");

      // Schedule daily reminder at 8 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💰 Transaction Reminder",
          body: "Don't forget to log today's expenses!",
          data: {
            type: "transaction-reminder",
          },
          sound: "default",
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      console.log("📱 Transaction reminder notifications scheduled");
    } catch (error) {
      console.error("Error scheduling transaction reminder:", error);
    }
  }

  // Goal Milestone Notifications
  async sendGoalMilestoneNotification(
    goalName: string,
    percentage: number
  ): Promise<void> {
    if (!this.permissionsGranted || !this.settings.goalMilestones) {
      return;
    }

    try {
      let title = "🎯 Goal Progress";
      let body = `${goalName} is ${percentage.toFixed(1)}% complete!`;

      if (percentage >= 100) {
        title = "🎉 Goal Achieved!";
        body = `Congratulations! You've reached your goal: ${goalName}`;
      } else if (percentage >= 75) {
        title = "🔥 Almost There!";
        body = `${goalName} is ${percentage.toFixed(1)}% complete. Keep going!`;
      } else if (percentage >= 50) {
        title = "💪 Halfway There!";
        body = `${goalName} is ${percentage.toFixed(
          1
        )}% complete. Great progress!`;
      } else if (percentage >= 25) {
        title = "🌟 Good Progress!";
        body = `${goalName} is ${percentage.toFixed(1)}% complete. Keep it up!`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: "goal-milestone",
            goalName,
            percentage,
          },
          sound: "default",
        },
        trigger: null,
      });

      console.log(
        `📱 Goal milestone notification sent: ${goalName} - ${percentage}%`
      );
    } catch (error) {
      console.error("Error sending goal milestone notification:", error);
    }
  }

  // Utility Methods
  async cancelScheduledNotifications(type?: string): Promise<void> {
    try {
      if (type) {
        const scheduledNotifications =
          await Notifications.getAllScheduledNotificationsAsync();
        const notificationsToCancel = scheduledNotifications.filter(
          (notification) => notification.content.data?.type === type
        );

        for (const notification of notificationsToCancel) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  }

  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Error clearing badge count:", error);
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  }

  // Handle notification responses
  handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): void {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data;

    console.log("📱 Notification response:", { actionIdentifier, data });

    switch (data?.type) {
      case "budget-warning":
      case "budget-exceeded":
        if (actionIdentifier === "view-budget") {
          // Navigate to budget details
          // This would be handled by the app's navigation system
        }
        break;
      case "weekly-report":
      case "monthly-report":
        // Navigate to analytics/reports screen
        break;
      case "transaction-reminder":
        // Navigate to add transaction screen
        break;
      case "goal-milestone":
        // Navigate to goals screen
        break;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
