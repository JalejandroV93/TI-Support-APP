/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/categoryStore.ts
import { create } from 'zustand';

interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: { nombre: string, descripcion?: string }) => Promise<boolean>;
  updateCategory: (id: number, category: { nombre?: string, descripcion?: string | null }) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/settings/categories');
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await res.json();
      set({ categories: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/v1/settings/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!res.ok) {
        throw new Error("Failed to create category");
      }
      const newCategory = await res.json();
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

    updateCategory: async (id, category) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/settings/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (!res.ok) {
          throw new Error("Failed to update category");
      }
      const updatedCategory = await res.json();

      set((state) => ({
          categories: state.categories.map((c) =>
          c.id === id ? updatedCategory : c
          ),
          loading: false,
      }));
      return true;
    } catch (error: any) {
        set({ error: error.message, loading: false });
        return false;
    }
    },

    deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/settings/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete category");
      }
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
      }));
      return true;
    } catch (error:any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));