import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { categories } from "./categories";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  type: text("type", { enum: ["expense", "income", "transfer"] }).notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  notes: text("notes"),
  receiptPhoto: text("receipt_photo"),
  date: text("date").notNull(),
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false),
  recurringId: integer("recurring_id"),
  tags: text("tags"), // JSON array of tags
  location: text("location"), // JSON with lat/lng
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
