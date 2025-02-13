// src/types/network.ts
import { RedTipo, RedEstado, Prioridad } from "@prisma/client";

export type TipoEquipo = "ESCRITORIO" | "PORTATIL" | "TABLET" | "OTRO"; //This was wrong, is in maintenance types
export type TipoMantenimiento = "CORRECTIVO" | "PREVENTIVO" | "OTRO";  //This was wrong, is in maintenance types


export interface NetworkReportFormState {
    fechaIncidente: string;
    ubicacion?: string | null;
    tipo: RedTipo;
    descripcion?: string | null;
    dispositivo?: string | null;
    direccionIP?: string | null;
    direccionMAC?: string | null;
    estado: RedEstado;
    prioridad: Prioridad;
    tecnico?: string | null;
    notasTecnicas?: string | null;
    solucion?: string | null;
}


export interface NetworkReport extends NetworkReportFormState {
    id: number;
    numeroReporte: string;
    fechaRegistro: string;
    usuario: { nombre: string };
}

export interface NetworkReportResponse {  //Added this for consistency with maintenance.
    reports: NetworkReport[];
    totalCount: number;
    page: number;
    pageSize: number;
}