import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../drizzle/migrations.js";
import * as schema from "./schema";

const expo = openDatabaseSync("expense_tracker.db");

export const db = drizzle(expo, { schema });

// Run migrations to ensure all tables are created
export const runMigrations = async () => {
  try {
    console.log("Running database migrations...");

    // Run the migration (this should be synchronous but we'll wrap it)
    await new Promise<void>((resolve, reject) => {
      try {
        migrate(db, migrations);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    // Verify that budget tables were created
    console.log("Verifying budget tables exist...");
    try {
      const budgetTablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'budget%';";
      const budgetTables = expo.getAllSync(budgetTablesQuery);
      console.log(
        "Budget tables found:",
        budgetTables.map((row: any) => row.name)
      );

      // Also check if the main tables exist
      const allTablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table';";
      const allTables = expo.getAllSync(allTablesQuery);
      console.log(
        "All tables:",
        allTables.map((row: any) => row.name)
      );
    } catch (error) {
      console.warn("Could not verify tables:", error);
    }

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Export the raw database for running custom SQL
export const rawDb = expo;
