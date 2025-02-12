// filepath: src/store/maintenanceReportStore.ts
import { create } from 'zustand';
import { MaintenanceReport, ReportResponse, FormState, Technician } from '@/types/maintenance';

interface MaintenanceReportState {
    reports: MaintenanceReport[];
    page: number;
    pageSize: number;
    hasMore: boolean;
    totalCount: number;
    loading: boolean;
    error: string | null;
    technicians: Technician[];
    fetchReports: () => Promise<void>;
    createReport: (report: FormState) => Promise<boolean>;
    updateReport: (id: string, report: FormState) => Promise<boolean>;
    deleteReport: (id: string) => Promise<boolean>;
    fetchTechnicians: () => Promise<void>;
    resetState: () => void;
    addReportToList: (report: MaintenanceReport) => void;
    updateReportInList: (id: string, updatedReport: MaintenanceReport) => void;
    removeReportFromList: (id: string) => void;
}

export const useMaintenanceReportStore = create<MaintenanceReportState>((set, get) => ({
    reports: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    totalCount: 0,
    loading: false,
    error: null,
    technicians: [],

    resetState: () => set({ reports: [], page: 1, hasMore: true, totalCount: 0, loading: false, error: null }),

    fetchTechnicians: async () => {
        try {
            const res = await fetch("/api/v1/users/technicians");
            if (!res.ok) {
                console.error("Error fetching technicians:", res.statusText);
                return;
            }
            const data = await res.json();
            set({ technicians: data });
        } catch (error) {
            console.error("Error fetching technicians:", error);
        }
    },


    fetchReports: async () => {
        if (!get().hasMore || get().loading) return;
        set({ loading: true, error: null });
        const currentPage = get().page;
        const currentReports = get().reports;
        const pageSize = get().pageSize;

        try {
            const res = await fetch(`/api/v1/reports/maintenance?page=${currentPage}&pageSize=${pageSize}`);
            if (!res.ok) {
                console.error("Failed to fetch reports:", await res.text());
                set({ loading: false, error: "Failed to fetch reports" });
                return;
            }
            const data: ReportResponse = await res.json();
            const newReports = data.reports;

            set({
                reports: [...currentReports, ...newReports],
                hasMore: newReports.length > 0 && (currentPage * pageSize) < data.totalCount,
                totalCount: data.totalCount,
                page: currentPage + 1,
                loading: false,
            });
        } catch (error) {
            console.error("Error fetching reports:", error);
            set({ loading: false, error: "Error fetching reports" });
        }
    },

    createReport: async (report: FormState) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch("/api/v1/reports/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });
            if (res.ok) {
                const newReport: MaintenanceReport = await res.json(); // Assuming API returns the created report
                get().addReportToList(newReport); // Optimistically add to list
                set({ loading: false });
                return true;
            } else {
                const errorData = await res.json();
                set({ loading: false, error: errorData.error || "Failed to create report." });
                return false;
            }
        } catch (error) {
            console.error("Error creating report:", error);
            set({ loading: false, error: "Error creating report." });
            return false;
        }
    },

    updateReport: async (id: string, report: FormState) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });
            if (res.ok) {
                const updatedReport: MaintenanceReport = await res.json(); // Assuming API returns the updated report
                get().updateReportInList(id, updatedReport); // Optimistically update in list
                set({ loading: false });
                return true;
            } else {
                const errorData = await res.json();
                set({ loading: false, error: errorData.error || "Failed to update report." });
                return false;
            }
        } catch (error) {
            console.error("Error updating report:", error);
            set({ loading: false, error: "Error updating report." });
            return false;
        }
    },

    deleteReport: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                get().removeReportFromList(id); // Optimistically remove from list
                set({ loading: false });
                return true;
            } else {
                const errorData = await res.json();
                set({ loading: false, error: errorData.message || "Failed to delete report." });
                return false;
            }
        } catch (error) {
            console.error("Error deleting report:", error);
            set({ loading: false, error: "Error deleting report." });
            return false;
        }
    },

    addReportToList: (report: MaintenanceReport) => {
        set((state) => ({ reports: [report, ...state.reports] })); // Add new report to the beginning of the list
    },

    updateReportInList: (id: string, updatedReport: MaintenanceReport) => {
        set((state) => ({
            reports: state.reports.map(report => report.id === id ? updatedReport : report)
        }));
    },

    removeReportFromList: (id: string) => {
        set((state) => ({
            reports: state.reports.filter(report => report.id !== id)
        }));
    },
}));