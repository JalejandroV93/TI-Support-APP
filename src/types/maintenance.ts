// src/types/maintenance.ts
export type TipoEquipo = "ESCRITORIO" | "PORTATIL" | "TABLET" | "OTRO";
export type TipoMantenimiento = "CORRECTIVO" | "PREVENTIVO" | "OTRO";

export interface FormState {
  tipoEquipo: TipoEquipo;
  equipo: string;
  marca?: string | null; // Correct type
  modelo?: string | null; // Correct type
  sistemaOp?: string | null; // Correct type
  procesador?: string | null; // Correct type
  ram?: string | null; // Correct type
  ramCantidad?: number | null; // Correct type
  tipoMantenimiento: TipoMantenimiento;
  diagnostico?: string | null; // Correct type
  solucion?: string | null; // Correct type
  fechaRecibido: string;
  fechaEntrega?: string | null; // Correct type
  tecnico: string;
  detallesProceso: string | null;  // Correct type
  observaciones?: string | null;    // Correct type
  // REMOVE userId
}


export const marcasComunes = ["Dell", "Lenovo", "HP", "Apple", "Asus", "Acer", "Microsoft", "MSI", "Samsung", "Otro"];
export const sistemasOperativos = ["Windows 11", "Windows 10", "Windows 7", "macOS", "Linux", "Android", "Otro"];
export const tiposRam = ["DDR3", "DDR4", "DDR5", "Otro"];


export interface MaintenanceReport extends FormState {
    id: number;           
    numeroReporte: string; 
    fechaRegistro: string; 
    usuario: { nombre: string }; 
  }
  

  export interface ReportResponse {
    reports: MaintenanceReport[];
    totalCount: number;
    page: number;
    pageSize: number;
}


export interface MaintenanceReportInput {
  equipo: string;
  marca?: string;
  modelo?: string;
  sistemaOp?: string;
  procesador?: string;
  ram?: string;
  ramCantidad?: number;
  diagnostico?: string;
  tipoEquipo?: string;
  tipoMantenimiento: TipoMantenimiento;
  solucion?: string;
  fechaRecibido: string; 
  fechaEntrega?: string;
  tecnico: string;
  observaciones?: string;
  detallesProceso?: string;
}