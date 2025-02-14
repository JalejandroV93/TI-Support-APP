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