// src/store/categoryStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface Category {
  id: number;
  nombre: string;
}

interface CategoryState {
  categories: Category[] | null; // Use null for initial state
  loading: boolean; // Added loading state
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: { nombre: string, descripcion?: string }) => Promise<boolean>;
  updateCategory: (id: number, category: { nombre?: string; descripcion?: string | null; }) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: null, // Initialize to null
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null }); // Set loading to true before fetching
    try {
      const res = await fetch('/api/v1/settings/categories/options'); // Use /options endpoint
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error ||"Failed to fetch categories");
      }
      const data = await res.json();
      set({ categories: data, loading: false });  // Set loading to false
    } catch (error: any) {
      set({ error: error.message, loading: false }); // Set error and loading
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
        const errorData = await res.json();
        throw new Error(errorData.error ||"Failed to create category");
      }
    //   const newCategory = await res.json();
    //   set((state) => ({
    //     categories: [...state.categories, newCategory],
    //     loading: false,
    //   }));
      set({ loading: false }) // Only update loading state
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
        const errorData = await res.json();
        throw new Error(errorData.error ||"Failed to update category");
      }
    //   const updatedCategory = await res.json();

    //   set((state) => ({
    //       categories: state.categories.map((c) =>
    //       c.id === id ? updatedCategory : c
    //       ),
    //       loading: false,
    //   }));
      set({ loading: false }) //Only update loading state
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
        const errorData = await res.json();
        throw new Error(errorData.error ||"Failed to delete category");
      }
      //Optimistic Update
      // set((state) => ({
      //   categories: state.categories.filter((c) => c.id !== id),
      //   loading: false,
      // }));
      set({loading: false});
      return true;
    } catch (error:any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));