// src/types/support.ts
export interface SupportReportFormState {
    categoriaId: number | string;
    descripcion: string;
    fecha?: string;
  }
  
  export interface SupportReport extends SupportReportFormState {
    id: number;
    numeroReporte: string;
    fecha: string;
    usuario: { nombre: string };
    categoria: { nombre: string }; // Include the category
  }