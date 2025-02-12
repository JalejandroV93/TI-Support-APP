export type TipoEquipo = "ESCRITORIO" | "PORTATIL" | "TABLET" | "OTRO";
export type TipoMantenimiento = "CORRECTIVO" | "PREVENTIVO" | "OTRO";

export interface FormState {
  tipoEquipo: TipoEquipo;
  equipo: string;
  marca?: string;
  modelo?: string;
  sistemaOp?: string;
  procesador?: string;
  ram?: string;
  ramCantidad?: number;
  tipoMantenimiento: TipoMantenimiento;
  diagnostico?: string;
  solucion?: string;
  fechaRecibido: string;
  fechaEntrega?: string;
  tecnico: string;
  detallesProceso: string;
  observaciones?: string;
  userId?: string; // Add userId here
}

export interface Technician {
  id: string;
  nombre: string;
}

export interface DatePickerFieldProps {
  name: "fechaRecibido" | "fechaEntrega";
  label: string;
  value: string;
  onChange: (name: "fechaRecibido" | "fechaEntrega", date: Date | undefined) => void;
  required?: boolean;
  error?: string; // Add error prop
}

export const marcasComunes = ["Dell", "Lenovo", "HP", "Apple", "Asus", "Acer", "Microsoft", "MSI", "Samsung", "Otro"];
export const sistemasOperativos = ["Windows 11", "Windows 10", "Windows 7", "macOS", "Linux", "Android", "Otro"];
export const tiposRam = ["DDR3", "DDR4", "DDR5", "Otro"];


export interface MaintenanceReport extends FormState {
    id: number;           // ID único del reporte
    numeroReporte: string; // Número de reporte (generado por el backend)
    fechaRegistro: string; // Fecha de registro *del reporte* (no confundir con fechaRecibido del equipo)
    usuario: { nombre: string }; // Información del usuario que creó el reporte.
  }
  

  export interface ReportResponse {
    reports: MaintenanceReport[];
    totalCount: number;
    page: number;
    pageSize: number;
}