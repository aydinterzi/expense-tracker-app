import { db } from "../client";
import { accounts, categories } from "../schema";

export const seedData = async () => {
  try {
    // Seed default expense categories
    const expenseCategories = [
      {
        name: "Food & Dining",
        icon: "restaurant",
        color: "#FF6B6B",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Transportation",
        icon: "car",
        color: "#4ECDC4",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Shopping",
        icon: "shopping-bag",
        color: "#45B7D1",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Entertainment",
        icon: "movie",
        color: "#FFA726",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Bills & Utilities",
        icon: "receipt",
        color: "#9575CD",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Healthcare",
        icon: "medical-bag",
        color: "#EF5350",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Education",
        icon: "school",
        color: "#66BB6A",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Travel",
        icon: "airplane",
        color: "#26C6DA",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Personal Care",
        icon: "person",
        color: "#AB47BC",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Other",
        icon: "more-horizontal",
        color: "#78909C",
        type: "expense" as const,
        isDefault: true,
      },
    ];

    // Seed default income categories
    const incomeCategories = [
      {
        name: "Salary",
        icon: "dollar-sign",
        color: "#4CAF50",
        type: "income" as const,
        isDefault: true,
      },
      {
        name: "Freelance",
        icon: "briefcase",
        color: "#8BC34A",
        type: "income" as const,
        isDefault: true,
      },
      {
        name: "Investment",
        icon: "trending-up",
        color: "#CDDC39",
        type: "income" as const,
        isDefault: true,
      },
      {
        name: "Gift",
        icon: "gift",
        color: "#FFC107",
        type: "income" as const,
        isDefault: true,
      },
      {
        name: "Bonus",
        icon: "award",
        color: "#FF9800",
        type: "income" as const,
        isDefault: true,
      },
      {
        name: "Other Income",
        icon: "plus-circle",
        color: "#795548",
        type: "income" as const,
        isDefault: true,
      },
    ];

    // Insert categories
    await db
      .insert(categories)
      .values([...expenseCategories, ...incomeCategories]);

    // Seed default accounts
    const defaultAccounts = [
      {
        name: "Cash",
        type: "cash" as const,
        initialBalance: 0,
        currentBalance: 0,
        currency: "USD",
        icon: "dollar-sign",
        color: "#4CAF50",
        isActive: true,
      },
      {
        name: "Checking Account",
        type: "bank" as const,
        initialBalance: 0,
        currentBalance: 0,
        currency: "USD",
        icon: "credit-card",
        color: "#2196F3",
        isActive: true,
      },
    ];

    await db.insert(accounts).values(defaultAccounts);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
