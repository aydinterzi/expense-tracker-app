import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { checkBudgetAlerts } from "../db/services/budgetService";
import { notificationService } from "../services/notificationService";

export const useBudgetMonitoring = () => {
  // Check budget alerts
  const checkAlerts = useCallback(async () => {
    try {
      console.log("🔍 Checking budget alerts...");
      const newAlerts = await checkBudgetAlerts();

      if (newAlerts.length > 0) {
        console.log(`📱 Generated ${newAlerts.length} new budget alerts`);

        // Update badge count with unread alerts
        const unreadCount = newAlerts.filter((alert) => !alert.isRead).length;
        await notificationService.setBadgeCount(unreadCount);
      }

      return newAlerts;
    } catch (error) {
      console.error("Error checking budget alerts:", error);
      return [];
    }
  }, []);

  // Initialize monitoring
  const initializeMonitoring = useCallback(async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();

      // Schedule recurring notifications
      await notificationService.scheduleWeeklyReport();
      await notificationService.scheduleMonthlyReport();
      await notificationService.scheduleTransactionReminder();

      // Initial alert check
      await checkAlerts();

      console.log("✅ Budget monitoring initialized");
    } catch (error) {
      console.error("Failed to initialize budget monitoring:", error);
    }
  }, [checkAlerts]);

  // Handle app state changes
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App became active, check for alerts
        await checkAlerts();

        // Clear badge when app is opened
        await notificationService.clearBadgeCount();
      }
    },
    [checkAlerts]
  );

  useEffect(() => {
    // Initialize on mount
    initializeMonitoring();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [initializeMonitoring, handleAppStateChange]);

  return {
    checkAlerts,
    initializeMonitoring,
  };
};

// Utility function to manually trigger budget monitoring
export const triggerBudgetCheck = async () => {
  try {
    const newAlerts = await checkBudgetAlerts();
    console.log(
      `🔍 Manual budget check completed. Found ${newAlerts.length} new alerts.`
    );
    return newAlerts;
  } catch (error) {
    console.error("Error in manual budget check:", error);
    return [];
  }
};
