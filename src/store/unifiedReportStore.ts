// --- src/store/unifiedReportStore.ts (NEW FILE) ---
import { create } from 'zustand';
import { UnifiedReport } from '@/types/global';

interface UnifiedReportState {
  reports: UnifiedReport[];
  totalCount: number; // Add totalCount to the store
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  fetchReports: (page: number, pageSize: number) => Promise<void>;
  resetState: () => void;
}

export const useUnifiedReportStore = create<UnifiedReportState>((set) => ({
  reports: [],
  totalCount: 0, // Initialize totalCount
  page: 1,
  pageSize: 10,
  isLoading: false,
  error: null,

  resetState: () =>
    set({
      reports: [],
      totalCount: 0, // Reset totalCount on reset
      error: null,
    }),

  fetchReports: async (page, pageSize) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/v1/reports/unified?page=${page}&pageSize=${pageSize}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch unified reports");
      }
      const data = await res.json();
      set({ reports: data.reports, totalCount: data.totalCount, page, pageSize, isLoading: false }); // Update totalCount
    } catch (error) {
      console.error("Error fetching unified reports:", error);
      set({
        error: "Error fetching unified reports.",
        isLoading: false,
      });
    }
  },
}));