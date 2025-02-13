//api/v1/reports/maintenance/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod"; // Import Zod
import { TipoMantenimiento } from "@prisma/client";

// Zod schema for PUT request (partial update)
const maintenanceReportUpdateSchema = z.object({
  tipoEquipo: z.enum(["ESCRITORIO", "PORTATIL", "TABLET", "OTRO"]).optional(),
  equipo: z.string().min(1, "Equipo is required").optional(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  sistemaOp: z.string().optional().nullable(),
  procesador: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  ramCantidad: z.number().int().positive().optional().nullable(),
  diagnostico: z.string().optional().nullable(),
  tipoMantenimiento: z.nativeEnum(TipoMantenimiento).optional(),
  solucion: z.string().optional().nullable(),
  fechaRecibido: z.string().datetime().optional(),
  fechaEntrega: z.string().datetime().optional().nullable(),
  tecnico: z.string().min(1, "Technician is required").optional(),
  observaciones: z.string().optional().nullable(),
  detallesProceso: z.string().optional().nullable(),
}).strict();

type MaintenanceReportInput = z.infer<typeof maintenanceReportUpdateSchema>;

// Helper para parsear el parámetro ID de la ruta dinámica
const parseId = (idParam: string): number | null => {
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

/**
 * GET: Retorna el reporte específico.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  //Use select to retrieve only necessary data.
  const report = await prisma.mantenimientoReport.findUnique({
    where: { id },
    select: {
      id: true,
      numeroReporte: true,
      userId: true,
      fechaRecibido: true,
      fechaEntrega: true,
      fechaRegistro: true,
      equipo: true,
      marca: true,
      modelo: true,
      sistemaOp: true,
      procesador: true,
      ram: true,
      ramCantidad: true,
      tipoMantenimiento: true,
      diagnostico: true,
      solucion: true,
      observaciones: true,
      tecnico: true,
      detallesProceso: true,
      usuario: {
        select: {
          nombre: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json(
      { error: "Reporte no encontrado" },
      { status: 404 }
    );
  }

  // Validación de permisos
  if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(report);
}

/**
 * PUT: Actualiza el reporte específico.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let data: MaintenanceReportInput;
  try {
    const rawData = await request.json();
    data = maintenanceReportUpdateSchema.parse(rawData); // Validate!
  } catch (error) {
    console.error("Error validating request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors }, // Detailed Zod errors
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const report = await prisma.mantenimientoReport.findUnique({ where: { id } });
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
    const updatedReport = await prisma.mantenimientoReport.update({
      where: { id },
      data: {
        ...data, // Use spread for updates
        fechaRecibido: data.fechaRecibido
          ? new Date(data.fechaRecibido)
          : undefined,
        fechaEntrega: data.fechaEntrega
          ? new Date(data.fechaEntrega)
          : undefined,
          //THIS IS IMPORTANT
          marca: data.marca === null ? null: data.marca,
          modelo: data.modelo === null ? null: data.modelo,
          sistemaOp: data.sistemaOp === null ? null : data.sistemaOp,
          procesador: data.procesador === null ? null : data.procesador,
          ram: data.ram === null ? null : data.ram,
          ramCantidad: data.ramCantidad === null ? null : data.ramCantidad,
          diagnostico: data.diagnostico === null ? null : data.diagnostico,
          solucion: data.solucion === null ? null: data.solucion,
          observaciones: data.observaciones === null ? null : data.observaciones,
          detallesProceso: data.detallesProceso === null ? null : data.detallesProceso,
      },
    });
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error actualizando reporte:", error);
    return NextResponse.json(
      { error: "Error actualizando reporte" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Elimina el reporte específico.
 * Se permite la eliminación si el usuario es admin o el propietario del reporte.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const report = await prisma.mantenimientoReport.findUnique({
      where: { id },
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
      await prisma.mantenimientoReport.delete({
        where: { id },
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
