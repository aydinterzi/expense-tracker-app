import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { runMigrations } from "../db/client";
import { seedData } from "../db/migrations/seed";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [databaseReady, setDatabaseReady] = useState(false);

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
      SplashScreen.hideAsync();
    }
  }, [loaded, databaseReady]);

  // Don't render the app until both fonts and database are ready
  if (!loaded || !databaseReady) {
    return null;
  }

  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
