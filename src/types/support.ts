// src/types/support.ts
import { SoporteCategoria, SoporteEstado, TipoUsuario } from "@prisma/client";

export interface SupportReportFormState {
  categoriaId: number;
  reporteAreaId: number; // Now expects an ID
  tipoUsuario: TipoUsuario;
  nombrePersona?: string | null; // Added: Name of person
  ubicacionDetalle?: string | null; // Added: Detailed location
  descripcion: string;
  solucion?: string | null;
  notas?: string | null; // Renamed
  estado: SoporteEstado;
  fueSolucionado: boolean;
  fecha?: string; // Keep fecha
  fechaSolucion?: string | null; // Kepp
}

export interface SupportReport extends SupportReportFormState {
  id: number;
  numeroReporte: string;
  fecha: string;
  userId: number;
  usuario: { nombre: string };
  categoria: SoporteCategoria;
  area: { nombre: string }; // Added: Include area information
}

// Add this for consistency with other reports
export interface SupportReportResponse {
  reports: SupportReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}