/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/reportAreaStore.ts
import { create } from "zustand";

interface ReportArea {
  id: number;
  nombre: string;
}

interface ReportAreaState {
  areas: ReportArea[] | null; // Use null
  loading: boolean;
  error: string | null;
  fetchAreas: () => Promise<void>;
  createArea: (area: {
    nombre: string;
    descripcion?: string;
  }) => Promise<boolean>;
  updateArea: (
    id: number,
    area: { nombre?: string; descripcion?: string | null }
  ) => Promise<boolean>;
  deleteArea: (id: number) => Promise<boolean>;
}

export const useReportAreaStore = create<ReportAreaState>((set) => ({
  areas: null, // Initialize as null
  loading: false,
  error: null,

  fetchAreas: async () => {
    set({ loading: true, error: null }); // Set loading to true before fetching
    try {
      const res = await fetch("/api/v1/settings/areas/options"); // Use /options endpoint
      if (!res.ok) {
        const errorData = await res.json(); //Consistent error
        throw new Error(errorData.error || "Failed to fetch areas");
      }
      const data = await res.json();
      set({ areas: data, loading: false }); // Set data, loading to false
    } catch (error: any) {
      set({ error: error.message, loading: false }); // Set error, loading to false
    }
  },

  createArea: async (area) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/v1/settings/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(area),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create area");
      }
      //Optimistic update. You add, update and delete items on front.
      // const newArea = await res.json();
      // set((state) => ({
      //     areas: [...state.areas, newArea],
      //     loading: false,
      // }));
      set({ loading: false }); //Only update loading state
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  updateArea: async (id, area) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/settings/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(area),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update area");
      }
      //   const updatedArea = await res.json();
      //   set((state) => ({
      //       areas: state.areas.map((a) => (a.id === id ? updatedArea : a)),
      //       loading: false,
      //   }));
      set({ loading: false }); // Only update loading state
      return true; // Indicate success
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false; // Indicate failure
    }
  },
  deleteArea: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/v1/settings/areas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete area");
      }
      //Optimistic Update
      // set((state) => ({
      //   areas: state.areas.filter((a) => a.id !== id),
      //   loading: false,
      // }));
      set({ loading: false }); //Only update loading
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));
