import { create } from "zustand";
import { Category } from "../db/schema/categories";
import { categoryService } from "../db/services/categoryService";

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateCategory: (id: number, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoriesByType: (type: "expense" | "income") => Category[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  loadCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await categoryService.getAllCategories();
      set({ categories, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load categories",
        loading: false,
      });
    }
  },

  addCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add category",
        loading: false,
      });
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedCategory = await categoryService.updateCategory(id, updates);
      if (updatedCategory) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? updatedCategory : c
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update category",
        loading: false,
      });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const success = await categoryService.deleteCategory(id);
      if (success) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete category",
        loading: false,
      });
    }
  },

  getCategoriesByType: (type) => {
    const { categories } = get();
    return categories.filter((category) => category.type === type);
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
