// src/app/api/v1/reports/support/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const supportReportUpdateSchema = z
  .object({
    categoriaId: z.number().int().positive().optional(), // Ensure positive
    descripcion: z.string().min(1, "La descripción es requerida").optional(),
    fecha: z.string().datetime().optional(),
  })
  .strict();

type SupportReportUpdateInput = z.infer<typeof supportReportUpdateSchema>;

const parseId = (idParam: string): number | null => {
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const reportId = parseId(id);
  if (reportId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const report = await prisma.soporteReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      numeroReporte: true,
      userId: true,
      categoriaId: true, // Clave foránea a SoporteCategoria
      fecha: true, // Fecha del reporte,
      descripcion: true,
      usuario: {
        select: {
          nombre: true,
        },
      },
      categoria: {
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

  if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(report);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const reportId = parseId(id);
  if (reportId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let data: SupportReportUpdateInput;
  try {
    const rawData = await request.json();
    data = supportReportUpdateSchema.parse(rawData);
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const report = await prisma.soporteReport.findUnique({
    where: { id: reportId },
  });
  if (!report) {
    return NextResponse.json(
      { error: "Reporte de soporte no encontrado" },
      { status: 404 }
    );
  }

  if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const updatedReport = await prisma.soporteReport.update({
      where: { id: reportId },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating network report:", error);
    return NextResponse.json(
      { error: "Error al actualizar el reporte de red" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const report = await prisma.soporteReport.findUnique({
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
      await prisma.soporteReport.delete({
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
    console.error("Error en DELETE /api/v1/reports/support/[id]:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
