import { eq } from "drizzle-orm";
import { db } from "../client";
import { categories, Category, NewCategory } from "../schema/categories";

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  },

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return result[0];
  },

  async getCategoriesByType(type: "expense" | "income"): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.type, type));
  },

  async createCategory(
    category: Omit<NewCategory, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  },

  async updateCategory(
    id: number,
    updates: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>
  ): Promise<Category | undefined> {
    const result = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  },

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.changes > 0;
  },

  async getDefaultCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isDefault, true));
  },
};
