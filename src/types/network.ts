// src/types/network.ts
import { RedTipo, RedEstado, Prioridad } from "@prisma/client";


export interface NetworkReportFormState {
    fechaIncidente: string;
    ubicacion?: string | null;
    tipo: RedTipo;
    descripcion?: string | null;
    dispositivo?: string | null;
    estado: RedEstado;
    prioridad: Prioridad;
    tecnico?: string | null;
    solucion?: string | null;
    fueSolucionado: boolean; // ADDED
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