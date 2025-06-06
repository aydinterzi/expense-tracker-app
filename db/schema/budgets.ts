import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const budgets = sqliteTable(
  "budgets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    categoryId: integer("category_id").references(
      () => require("./categories").categories.id
    ),
    accountId: integer("account_id").references(
      () => require("./accounts").accounts.id
    ),
    amount: real("amount").notNull(),
    period: text("period", {
      enum: ["daily", "weekly", "monthly", "yearly"],
    }).notNull(),
    startDate: text("start_date").notNull(), // ISO date string
    endDate: text("end_date"), // ISO date string, null for ongoing budgets
    spentAmount: real("spent_amount").default(0).notNull(),
    alertPercentage: integer("alert_percentage").default(80).notNull(), // Alert when X% spent
    alertTriggered: integer("alert_triggered", { mode: "boolean" })
      .default(false)
      .notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    categoryIdIndex: index("budgets_category_id_idx").on(table.categoryId),
    accountIdIndex: index("budgets_account_id_idx").on(table.accountId),
    periodIndex: index("budgets_period_idx").on(table.period),
    isActiveIndex: index("budgets_is_active_idx").on(table.isActive),
    startDateIndex: index("budgets_start_date_idx").on(table.startDate),
  })
);

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// Budget progress tracking table for historical data
export const budgetProgress = sqliteTable(
  "budget_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    budgetId: integer("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // ISO date string
    spentAmount: real("spent_amount").notNull(),
    percentage: real("percentage").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    budgetIdIndex: index("budget_progress_budget_id_idx").on(table.budgetId),
    dateIndex: index("budget_progress_date_idx").on(table.date),
  })
);

export type BudgetProgress = typeof budgetProgress.$inferSelect;
export type InsertBudgetProgress = typeof budgetProgress.$inferInsert;

// Budget alerts table
export const budgetAlerts = sqliteTable(
  "budget_alerts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    budgetId: integer("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    alertType: text("alert_type", {
      enum: ["warning", "exceeded", "reset"],
    }).notNull(),
    message: text("message").notNull(),
    percentage: real("percentage").notNull(),
    amount: real("amount").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    budgetIdIndex: index("budget_alerts_budget_id_idx").on(table.budgetId),
    isReadIndex: index("budget_alerts_is_read_idx").on(table.isRead),
    alertTypeIndex: index("budget_alerts_alert_type_idx").on(table.alertType),
  })
);

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = typeof budgetAlerts.$inferInsert;
