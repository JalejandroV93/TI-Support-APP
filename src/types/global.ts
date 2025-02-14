// src/types/global.ts
export interface Technician {
    id: number;  // Use number, consistent with your Prisma schema
    nombre: string;
  }

  // Add this interface to define the structure
export interface ReportCardDetail {
  label: string;
  value: React.ReactNode;
}


// Improved UnifiedReport
export interface UnifiedReport {
  id: number;
  fecha: string; // Date as ISO string
  reportType: "Mantenimiento" | "Red" | "Aula Movil" | "Soporte";
  numeroReporte: string;
  usuario: string; // User's name
  estado?: string;      // Optional status
  descripcion?: string;  // Unified description
  ubicacion?: string; // ubicacion from RedReport, ubicacionDetalle from SoporteReport
}

// Added This for consistency with other pages
export interface UnifiedReportResponse {
  reports: UnifiedReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}