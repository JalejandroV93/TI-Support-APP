// src/types/support.ts
import { SoporteCategoria, SoporteEstado, TipoUsuario, ReporteArea } from "@prisma/client"; // Import SoporteCategoria

export interface SupportReportFormState {
  categoriaId: number; // Consistent type: number
  descripcion: string;
  fecha?: string; // Optional, as it's often handled by the backend
  reporteArea: ReporteArea;  //NEW
  tipoUsuario: TipoUsuario; //NEW
  solucion?: string | null;   //NEW
  notasTecnicas?: string | null;  //NEW
  estado: SoporteEstado;
  fueSolucionado: boolean;
}

export interface SupportReport extends SupportReportFormState {
  id: number;
  numeroReporte: string;
  fecha: string;
  userId: number;
  usuario: { nombre: string };
  categoria: SoporteCategoria; // Use the imported type
  fechaSolucion?: string | null;  //NEW
}

// Add this for consistency with other reports
export interface SupportReportResponse {
  reports: SupportReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}