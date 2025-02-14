// src/store/supportReportStore.ts
import { create } from "zustand";
import { SupportReport, SupportReportFormState } from "@/types/support";

interface SupportReportState {
  reports: SupportReport[];
  totalCount: number;
  error: string | null;
  createReport: (reportData: SupportReportFormState) => Promise<boolean>;
  updateReport: (id: string, reportData: SupportReportFormState) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
    fetchReports: (page: number, pageSize: number) => Promise<void>;
  resetState: () => void;  // Method to reset to initial state
  addReportToList: (report: SupportReport) => void;  //NEW
  updateReportInList: (id: string, updatedReport: SupportReport) => void; //NEW
  removeReportFromList: (id: string) => void; //NEW
}

export const useSupportReportStore = create<SupportReportState>((set, get) => ({
  reports: [],
  totalCount: 0,
  error: null,

    resetState: () =>
    set({
      reports: [],
      totalCount: 0,
      error: null,
    }),
    createReport: async (reportData) => {
      try {
        const res = await fetch("/api/v1/reports/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        });

        if (res.ok) {
            const newReport: SupportReport = await res.json(); // Assuming API returns the created report
            get().addReportToList(newReport); // Optimistically add to list
            return true;
        } else {
          const errorData = await res.json();
          set({ error: errorData.error || "Failed to create report." });
          return false;
        }
      } catch (error) {
        console.error("Error creating support report:", error);
        set({ error: "Error creating report." });
        return false;
      }
    },

  updateReport: async (id, reportData) => {
    try {
      const res = await fetch(`/api/v1/reports/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
          const updatedReport: SupportReport = await res.json(); // Assuming API returns the updated report

          get().updateReportInList(id, updatedReport);

        return true;
      } else {
        const errorData = await res.json();
        set({ error: errorData.error || "Failed to update report." });
        return false;
      }
    } catch (error) {
      console.error("Error updating support report:", error);
      set({ error: "Error updating report." });
      return false;
    }
  },

  deleteReport: async (id) => {
    try {
      const res = await fetch(`/api/v1/reports/support/${id}`, {
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
      console.error("Error deleting support report:", error);
      set({ error: "Error deleting report." });
      return false;
    }
    },

    fetchReports: async (page, pageSize) => {
      try {
        const res = await fetch(
          `/api/v1/reports/support?page=${page}&pageSize=${pageSize}`
        );
        if (res.ok) {
          const data = await res.json(); // Expecting { reports: [], totalCount: number }
          set({ reports: data.reports, totalCount: data.totalCount }); // Update totalCount
  
        } else {
          const errorData = await res.json();
          set({
            error: errorData.error || "Failed to fetch support reports.",
          });
        }
      } catch (error) {
        console.error("Error fetching support reports:", error);
        set({ error: "Error fetching reports." });
      }
    },

    addReportToList: (report: SupportReport) => {
        set((state) => ({ reports: [report, ...state.reports] })); // Add new report to the beginning of the list
    },
    
    updateReportInList: (id: string, updatedReport: SupportReport) => {
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