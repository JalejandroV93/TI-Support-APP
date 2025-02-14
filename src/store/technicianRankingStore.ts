/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/technicianRankingStore.ts
import { create } from 'zustand';

interface TechnicianRanking {
  name: string;
  value: number;
}

interface TechnicianRankingState {
  rankingData: TechnicianRanking[] | null;  // Define a more specific type if you can
  loading: boolean;
  error: string | null;
  fetchRanking: (months?: number) => Promise<void>;
}

export const useTechnicianRankingStore = create<TechnicianRankingState>((set) => ({
    rankingData: null,
    loading: false,
    error: null,
    fetchRanking: async (months = 3) => {
    set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/v1/reports/analytics/technician-ranking?months=${months}`);
            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to fetch ranking");
            }
            const data = await res.json();
            set({ rankingData: data, loading: false });
        } catch (error: any) {
        set({ error: error.message, loading: false });
        }
    },
}));