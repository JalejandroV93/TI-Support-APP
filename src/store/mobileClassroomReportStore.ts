// src/store/mobileClassroomReportStore.ts
import { create } from "zustand";
import {
    MobileClassroomsReport,
    MobileClassroomsReportFormState,
} from "@/types/mobile-classrooms"; //IMPORT

interface MobileClassroomsReportState {
    reports: MobileClassroomsReport[];
    totalCount: number;
    error: string | null;
    createReport: (report: MobileClassroomsReportFormState) => Promise<boolean>;
    updateReport: (id: string, report: MobileClassroomsReportFormState) => Promise<boolean>;
    deleteReport: (id: string) => Promise<boolean>;
    resetState: () => void;
    addReportToList: (report: MobileClassroomsReport) => void;
    updateReportInList: (id: string, updatedReport: MobileClassroomsReport) => void;
    removeReportFromList: (id: string) => void;
}

export const useMobileClassroomsReportStore = create<MobileClassroomsReportState>((set, get) => ({
    reports: [],
    totalCount: 0,
    error: null,

    resetState: () =>
        set({
            reports: [],
            totalCount: 0,
            error: null,
        }),

    createReport: async (report: MobileClassroomsReportFormState) => {
        try {
            const res = await fetch("/api/v1/reports/mobile-classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });
            if (res.ok) {
                const newReport: MobileClassroomsReport = await res.json(); // Assuming API returns the created report
                get().addReportToList(newReport); // Optimistically add to list
                return true;
            } else {
                const errorData = await res.json();
                set({ error: errorData.error || "Failed to create report." });
                return false;
            }
        } catch (error) {
            console.error("Error creating report:", error);
            set({ error: "Error creating report." });
            return false;
        }
    },

    updateReport: async (id: string, report: MobileClassroomsReportFormState) => {
        try {
            const res = await fetch(`/api/v1/reports/mobile-classrooms/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(report),
            });
            if (res.ok) {
                const updatedReport: MobileClassroomsReport = await res.json();
                get().updateReportInList(id, updatedReport);
                return true;
            } else {
                const errorData = await res.json();
                set({ error: errorData.error || "Failed to update report." });
                return false;
            }
        } catch (error) {
            console.error("Error updating report:", error);
            set({ error: "Error updating report." });
            return false;
        }
    },

    deleteReport: async (id: string) => {
        try {
            const res = await fetch(`/api/v1/reports/mobile-classrooms/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                get().removeReportFromList(id);
                return true;
            } else {
                const errorData = await res.json();
                set({ error: errorData.error || "Failed to delete report." });
                return false;
            }
        } catch (error) {
            console.error("Error deleting report:", error);
            set({ error: "Error deleting report." });
            return false;
        }
    },

    addReportToList: (report: MobileClassroomsReport) => {
        set((state) => ({ reports: [report, ...state.reports] })); // Add new report to the beginning of the list
    },

    updateReportInList: (id: string, updatedReport: MobileClassroomsReport) => {
        set((state) => ({
            reports: state.reports.map((report) =>
                report.id === parseInt(id) ? updatedReport : report
            ),
        }));
    },

    removeReportFromList: (id: string) => {
        set((state) => ({
            reports: state.reports.filter((report) => report.id !== parseInt(id)),
        }));
    },
}));