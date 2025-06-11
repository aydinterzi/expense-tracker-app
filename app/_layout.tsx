import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import OnboardingScreen from "../components/onboarding/OnboardingScreen";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { runMigrations } from "../db/client";
import { seedData } from "../db/migrations/seed";
import { useSettingsStore } from "../stores/settingsStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const {
    isDarkMode,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    setIsFirstLaunch,
  } = useSettingsStore();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [databaseReady, setDatabaseReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize budget monitoring and notifications
  const { initializeMonitoring } =
    require("../hooks/useBudgetMonitoring").useBudgetMonitoring();

  useEffect(() => {
    // Initialize database with migrations and seed data
    const initializeDatabase = async () => {
      try {
        console.log("🚀 Starting database initialization...");

        // First run migrations to create all tables
        await runMigrations();
        console.log("✅ Migrations completed");

        // Then seed with initial data
        await seedData();
        console.log("✅ Seed data completed");

        console.log("🎉 Database initialization complete!");

        // Initialize budget monitoring after database is ready
        try {
          await initializeMonitoring();
          console.log("📱 Budget monitoring initialized");
        } catch (error) {
          console.error("❌ Failed to initialize budget monitoring:", error);
        }

        setDatabaseReady(true);
      } catch (error) {
        console.error("❌ Failed to initialize database:", error);
        // Even if there's an error, we should allow the app to continue
        // to avoid blocking the user completely
        setDatabaseReady(true);
      }
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    if (loaded && databaseReady) {
      // Check if user has seen onboarding
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      SplashScreen.hideAsync();
    }
  }, [loaded, databaseReady, hasSeenOnboarding]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setIsFirstLaunch(false);
    setShowOnboarding(false);
  };

  // Don't render the app until both fonts and database are ready
  if (!loaded || !databaseReady) {
    return null;
  }

  // Use user's preference from settings store instead of system color scheme
  const paperTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <ErrorBoundary>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navTheme}>
          {showOnboarding ? (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          ) : (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}
        </ThemeProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}
