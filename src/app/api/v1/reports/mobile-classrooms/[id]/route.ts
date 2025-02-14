// src/app/api/v1/reports/mobile-classrooms/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { TipoNovedad } from "@prisma/client";

const mobileClassroomsReportUpdateSchema = z.object({
    fechaIncidente: z.string().datetime().optional(),
    tabletId: z.string().optional().nullable(),
    novedades: z.string().min(1, "La descripción de la novedad es requerida").optional(),
    tipoNovedad: z.nativeEnum(TipoNovedad).optional(),
    estudiante: z.string().optional().nullable(),
    gradoEstudiante: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    docente: z.string().optional().nullable(), 
    salon: z.string().optional().nullable(), 
}).strict();

type MobileClassroomsReportInput = z.infer<typeof mobileClassroomsReportUpdateSchema>;

const parseId = (idParam: string): number | null => {
    const id = parseInt(idParam, 10);
    return isNaN(id) ? null : id;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const reportId = parseId(id);
    if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const report = await prisma.aulaMovilReport.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            numeroReporte: true,
            userId: true,
            fechaRegistro: true,
            fechaIncidente: true,
            tabletId: true,
            novedades: true,
            tipoNovedad: true,
            estudiante: true,
            gradoEstudiante: true,
            observaciones: true,
            docente: true, // ADDED
            salon: true, 
            usuario: {
                select: {
                    nombre: true,
                },
            },
        },
    });

    if (!report) {
        return NextResponse.json({ error: "Reporte de aula móvil no encontrado" }, { status: 404 });
    }

    if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(report);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
     const { id } = await params;
    const reportId = parseId(id);
    if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    let data: MobileClassroomsReportInput;
    try {
        const rawData = await request.json();
        data = mobileClassroomsReportUpdateSchema.parse(rawData);
    } catch (error) {
        console.error("Validation error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const report = await prisma.aulaMovilReport.findUnique({ where: { id: reportId } });
    if (!report) {
        return NextResponse.json({ error: "Reporte de aula móvil no encontrado" }, { status: 404 });
    }

    if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    try {
        const updatedReport = await prisma.aulaMovilReport.update({
            where: { id: reportId },
            data: {
                ...data,
                fechaIncidente: data.fechaIncidente ? new Date(data.fechaIncidente) : undefined,
                //THIS IS IMPORTANT FOR NULLABLES
                tabletId: data.tabletId === null ? null : data.tabletId,
                estudiante: data.estudiante === null ? null : data.estudiante,
                gradoEstudiante: data.gradoEstudiante === null ? null : data.gradoEstudiante,
                observaciones: data.observaciones === null ? null : data.observaciones,
                docente: data.docente === null ? null : data.docente, // ADDED
                salon: data.salon === null ? null : data.salon, // ADDED
            },
        });
        return NextResponse.json(updatedReport);
    } catch (error) {
        console.error("Error updating mobile classroom report:", error);
        return NextResponse.json({ error: "Error al actualizar el reporte de aula móvil" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
        const { id } = await params;
      const reportId = parseId(id);
      if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      }
  
      const report = await prisma.aulaMovilReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        return NextResponse.json(
          { error: "Reporte no encontrado" },
          { status: 404 }
        );
      }
  
      if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
  
      try {
        await prisma.aulaMovilReport.delete({
          where: { id: reportId },
        });
        return NextResponse.json({ success: true });
      } catch (deleteError) {
        console.error("Error eliminando reporte:", deleteError);
        return NextResponse.json(
          { error: "Error eliminando reporte" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error en DELETE /api/v1/reports/maintenance/[id]:", error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }