// filepath: src/store/maintenanceReportStore.ts
import { create } from "zustand";
import {
  MaintenanceReport,
  FormState,
  Technician,
} from "@/types/maintenance";

interface MaintenanceReportState {
  reports: MaintenanceReport[];
  totalCount: number;
  error: string | null;
  technicians: Technician[];
  createReport: (report: FormState) => Promise<boolean>;
  updateReport: (id: string, report: FormState) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  fetchTechnicians: () => Promise<void>;
  resetState: () => void;
  addReportToList: (report: MaintenanceReport) => void;
  updateReportInList: (id: string, updatedReport: MaintenanceReport) => void;
  removeReportFromList: (id: string) => void;
}

export const useMaintenanceReportStore = create<MaintenanceReportState>(
  (set, get) => ({
    reports: [],
    totalCount: 0,
    error: null,
    technicians: [],

    resetState: () =>
      set({
        reports: [],
        totalCount: 0,
        error: null,
      }),

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

    createReport: async (report: FormState) => {
      try {
        const res = await fetch("/api/v1/reports/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        });
        if (res.ok) {
          const newReport: MaintenanceReport = await res.json(); // Assuming API returns the created report
          get().addReportToList(newReport); // Optimistically add to list
          return true;
        } else {
          const errorData = await res.json();
          set({
            error: errorData.error || "Failed to create report.",
          });
          return false;
        }
      } catch (error) {
        console.error("Error creating report:", error);
        set({
          error: "Error creating report.",
        }); 
        return false;
      }
    },

    updateReport: async (id: string, report: FormState) => {
      try {
        const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        });
        if (res.ok) {
          const updatedReport: MaintenanceReport = await res.json(); // Assuming API returns the updated report

          get().updateReportInList(id, updatedReport);

          return true;
        } else {
          const errorData = await res.json();
          set({
            error: errorData.error || "Failed to update report.",
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating report:", error);
        set({
          error: "Error updating report.",
        }); 
        return false;
      }
    },

    deleteReport: async (id: string) => {
      try {
        const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          get().removeReportFromList(id); 
          
          return true;
        } else {
          const errorData = await res.json();
          set({
            error: errorData.message || "Failed to delete report.",
          });
          return false;
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        set({
          error: "Error deleting report.",
        }); 
        return false;
      }
    },

    addReportToList: (report: MaintenanceReport) => {
      set((state) => ({ reports: [report, ...state.reports] })); // Add new report to the beginning of the list
    },

    updateReportInList: (id: string, updatedReport: MaintenanceReport) => {
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
  })
);
