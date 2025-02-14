/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/reportAreaStore.ts
import { create } from 'zustand';

interface ReportArea {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

interface ReportAreaState {
  areas: ReportArea[];
  loading: boolean;
  error: string | null;
  fetchAreas: () => Promise<void>;
  createArea: (area: { nombre: string; descripcion?: string }) => Promise<boolean>;
  updateArea: (id: number, area: { nombre?: string; descripcion?: string | null }) => Promise<boolean>;
  deleteArea: (id: number) => Promise<boolean>;
}

export const useReportAreaStore = create<ReportAreaState>((set) => ({
    areas: [],
    loading: false,
    error: null,

    fetchAreas: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/v1/settings/areas');
          if (!res.ok) {
            throw new Error("Failed to fetch report areas");
          }
          const data = await res.json();
          set({ areas: data, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      createArea: async (area) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/v1/settings/areas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(area),
          });

          if (!res.ok) {
            throw new Error("Failed to create report area");
          }
          const newArea = await res.json();
            set((state) => ({
                areas: [...state.areas, newArea],
                loading: false,
            }));
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
            throw new Error("Failed to update report area");
        }
        const updatedArea = await res.json();
        set((state) => ({
            areas: state.areas.map((a) => (a.id === id ? updatedArea : a)),
            loading: false,
        }));
        return true; // Indicate success
        } catch (error:any) {
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
        throw new Error("Failed to delete report area");
      }
      set((state) => ({
        areas: state.areas.filter((a) => a.id !== id),
        loading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));