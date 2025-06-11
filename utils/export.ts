import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { db } from "../db/client";
import { accounts, budgets, categories, transactions } from "../db/schema";

export interface ExportData {
  transactions: any[];
  budgets: any[];
  accounts: any[];
  categories: any[];
  exportDate: string;
  appVersion: string;
}

// Export all data to JSON
export const exportDataToJSON = async (): Promise<string> => {
  try {
    const [transactionsData, budgetsData, accountsData, categoriesData] =
      await Promise.all([
        db.select().from(transactions),
        db.select().from(budgets),
        db.select().from(accounts),
        db.select().from(categories),
      ]);

    const exportData: ExportData = {
      transactions: transactionsData,
      budgets: budgetsData,
      accounts: accountsData,
      categories: categoriesData,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
    };

    const fileName = `expense_tracker_backup_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(exportData, null, 2)
    );

    return filePath;
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export data");
  }
};

// Export transactions to CSV
export const exportTransactionsToCSV = async (): Promise<string> => {
  try {
    const transactionsData = await db.select().from(transactions);

    const csvHeader = "Date,Amount,Type,Category,Account,Description,Notes\n";
    const csvRows = transactionsData
      .map((t) => {
        return `${t.date},${t.amount},${t.type},"${t.categoryId}","${
          t.accountId
        }","${t.description || ""}","${t.notes || ""}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    const fileName = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    return filePath;
  } catch (error) {
    console.error("CSV export error:", error);
    throw new Error("Failed to export transactions to CSV");
  }
};

// Share exported file
export const shareExportedFile = async (filePath: string) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Share error:", error);
    throw new Error("Failed to share file");
  }
};

// Import data from JSON backup
export const importDataFromJSON = async (filePath: string): Promise<void> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const importData: ExportData = JSON.parse(fileContent);

    // Validate data structure
    if (
      !importData.transactions ||
      !importData.accounts ||
      !importData.categories
    ) {
      throw new Error("Invalid backup file format");
    }

    // Clear existing data (with user confirmation)
    await db.delete(transactions);
    await db.delete(budgets);
    await db.delete(accounts);
    await db.delete(categories);

    // Import data
    if (importData.categories.length > 0) {
      await db.insert(categories).values(importData.categories);
    }

    if (importData.accounts.length > 0) {
      await db.insert(accounts).values(importData.accounts);
    }

    if (importData.budgets.length > 0) {
      await db.insert(budgets).values(importData.budgets);
    }

    if (importData.transactions.length > 0) {
      await db.insert(transactions).values(importData.transactions);
    }
  } catch (error) {
    console.error("Import error:", error);
    throw new Error("Failed to import data");
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await db.delete(transactions);
    await db.delete(budgets);
    await db.delete(accounts);
    await db.delete(categories);
  } catch (error) {
    console.error("Clear data error:", error);
    throw new Error("Failed to clear data");
  }
};
