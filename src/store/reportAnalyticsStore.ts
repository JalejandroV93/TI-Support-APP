/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/reportAnalyticsStore.ts
import { create } from 'zustand';

interface ReportAnalyticsState {
  analyticsData: any[] | null;  // Define a more specific type if you can
  loading: boolean;
  error: string | null;
  fetchAnalytics: (period: 'daily' | 'monthly', months?: number) => Promise<void>;
}

export const useReportAnalyticsStore = create<ReportAnalyticsState>((set) => ({
    analyticsData: null,
    loading: false,
    error: null,
    fetchAnalytics: async (period, months = 3) => {
    set({ loading: true, error: null });
        try {
        const res = await fetch(`/api/v1/reports/analytics/by-type?period=${period}&months=${months}`);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch analytics");
        }
        const data = await res.json();
        set({ analyticsData: data, loading: false });
        } catch (error: any) {
        set({ error: error.message, loading: false });
        }
    },
}));