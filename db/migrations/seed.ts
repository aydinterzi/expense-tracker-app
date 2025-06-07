import { eq } from "drizzle-orm";
import { db, rawDb } from "../client";
import { accounts, categories } from "../schema";

// SQL to create tables
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'investment')),
  initial_balance REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount REAL NOT NULL,
  description TEXT,
  notes TEXT,
  receipt_photo TEXT,
  date TEXT NOT NULL,
  is_recurring INTEGER DEFAULT 0,
  recurring_id INTEGER,
  tags TEXT,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER,
  account_id INTEGER,
  amount REAL NOT NULL,
  period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  spent_amount REAL DEFAULT 0,
  alert_percentage INTEGER DEFAULT 80,
  alert_triggered INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS budget_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  percentage REAL NOT NULL,
  amount REAL NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  spent_amount REAL NOT NULL,
  percentage REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON budgets(category_id);
CREATE INDEX IF NOT EXISTS budgets_account_id_idx ON budgets(account_id);
CREATE INDEX IF NOT EXISTS budgets_period_idx ON budgets(period);
CREATE INDEX IF NOT EXISTS budgets_is_active_idx ON budgets(is_active);
CREATE INDEX IF NOT EXISTS budgets_start_date_idx ON budgets(start_date);

CREATE INDEX IF NOT EXISTS budget_alerts_budget_id_idx ON budget_alerts(budget_id);
CREATE INDEX IF NOT EXISTS budget_alerts_is_read_idx ON budget_alerts(is_read);
CREATE INDEX IF NOT EXISTS budget_alerts_alert_type_idx ON budget_alerts(alert_type);

CREATE INDEX IF NOT EXISTS budget_progress_budget_id_idx ON budget_progress(budget_id);
CREATE INDEX IF NOT EXISTS budget_progress_date_idx ON budget_progress(date);
`;

const updateCategoryIcons = async () => {
  console.log("🔄 Updating category icons to valid Ionicons...");

  const iconUpdates = [
    { name: "Shopping", icon: "storefront" },
    { name: "Entertainment", icon: "videocam" },
    { name: "Healthcare", icon: "medical" },
    { name: "Other", icon: "ellipsis-horizontal" },
  ];

  for (const update of iconUpdates) {
    try {
      await db
        .update(categories)
        .set({ icon: update.icon })
        .where(eq(categories.name, update.name));
      console.log(`✅ Updated ${update.name} icon to ${update.icon}`);
    } catch (error) {
      console.log(`⚠️ Could not update ${update.name}: ${error}`);
    }
  }
};

export const seedData = async () => {
  try {
    console.log("🔧 Creating database tables...");

    // Create tables first using raw SQL
    rawDb.execSync(createTablesSQL);

    console.log("✅ Database tables created successfully!");

    // Check if data already exists
    try {
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) {
        console.log("📊 Database already has data, updating icons...");
        await updateCategoryIcons();
        return;
      }
    } catch (error) {
      console.log("📊 No existing data found, proceeding with seeding...");
    }

    console.log("🌱 Seeding database with initial data...");

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
        icon: "storefront",
        color: "#45B7D1",
        type: "expense" as const,
        isDefault: true,
      },
      {
        name: "Entertainment",
        icon: "videocam",
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
        icon: "medical",
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
        icon: "ellipsis-horizontal",
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
    console.log(
      `📊 Created ${
        expenseCategories.length + incomeCategories.length
      } categories`
    );
    console.log(`🏦 Created ${defaultAccounts.length} accounts`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
