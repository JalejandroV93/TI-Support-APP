// src/types/support.ts
import { SoporteCategoria } from "@prisma/client"; // Import SoporteCategoria

export interface SupportReportFormState {
  categoriaId: number; // Consistent type: number
  descripcion: string;
  fecha?: string; // Optional, as it's often handled by the backend
}

export interface SupportReport extends SupportReportFormState {
  id: number;
  numeroReporte: string;
  fecha: string;
  userId: number;
  usuario: { nombre: string };
  categoria: SoporteCategoria; // Use the imported type
}

// Add this for consistency with other reports
export interface SupportReportResponse {
  reports: SupportReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}