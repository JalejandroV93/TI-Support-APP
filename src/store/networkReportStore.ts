// src/store/networkReportStore.ts
import { create } from "zustand";
import { NetworkReport, NetworkReportFormState } from "@/types/network";
import { Technician } from "@/types/global";

interface NetworkReportStore {
  reports: NetworkReport[];
  totalCount: number;
  error: string | null;
  technicians: Technician[];
  createReport: (report: NetworkReportFormState) => Promise<boolean>;
  updateReport: (id: string, report: NetworkReportFormState) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  fetchTechnicians: () => Promise<void>;
  resetState: () => void;
  addReportToList: (report: NetworkReport) => void;
  updateReportInList: (id: string, updatedReport: NetworkReport) => void;
  removeReportFromList: (id: string) => void;
}

export const useNetworkReportStore = create<NetworkReportStore>((set, get) => ({
  reports: [],
  totalCount: 0,
  error: null,
  technicians: [],  // You might want to share technicians across stores

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

  createReport: async (report: NetworkReportFormState) => {
    try {
      const res = await fetch("/api/v1/reports/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (res.ok) {
          const newReport: NetworkReport = await res.json(); // Assuming API returns the created report
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

  updateReport: async (id: string, report: NetworkReportFormState) => {
    try {
      const res = await fetch(`/api/v1/reports/network/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (res.ok){
        const updatedReport: NetworkReport = await res.json(); // Assuming API returns the updated report
          get().updateReportInList(id, updatedReport); // Optimistically update in list
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
            const res = await fetch(`/api/v1/reports/network/${id}`, {
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
    
        addReportToList: (report: NetworkReport) => {
          set((state) => ({
            reports: [...state.reports, report],
            totalCount: state.totalCount + 1,
          }));
        },
    
        updateReportInList: (id: string, updatedReport: NetworkReport) => {
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
        
