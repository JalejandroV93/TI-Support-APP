// src/types/mobile-classrooms.ts
import { TipoNovedad } from "@prisma/client";

export interface MobileClassroomsReportFormState {
    fechaIncidente: string;
    tabletId?: string | null;
    novedades: string;
    tipoNovedad: TipoNovedad;
    estudiante?: string | null;
    gradoEstudiante?: string | null;
    observaciones?: string | null;
    docente?: string | null;   // ADDED
    salon?: string | null;    // ADDED
}

export interface MobileClassroomsReport extends MobileClassroomsReportFormState {
    id: number;
    numeroReporte: string;
    fechaRegistro: string;
    usuario: { nombre: string };
}


export interface MobileClassroomsReportResponse {
    reports: MobileClassroomsReport[];
    totalCount: number;
    page: number;
    pageSize: number;
}