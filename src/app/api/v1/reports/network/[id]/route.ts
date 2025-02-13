// src/app/api/v1/reports/network/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { RedTipo, RedEstado, Prioridad } from "@prisma/client";

// Zod schema for PUT request (partial update)
const networkReportUpdateSchema = z
  .object({
    fechaIncidente: z.string().datetime().optional(),
    ubicacion: z.string().optional().nullable(),
    tipo: z.nativeEnum(RedTipo).optional(),
    descripcion: z.string().optional().nullable(),
    dispositivo: z.string().optional().nullable(),
    direccionIP: z.string().optional().nullable(),
    direccionMAC: z.string().optional().nullable(),
    estado: z.nativeEnum(RedEstado).optional(),
    prioridad: z.nativeEnum(Prioridad).optional(),
    tecnico: z.string().optional().nullable(),
    notasTecnicas: z.string().optional().nullable(),
    solucion: z.string().optional().nullable(),
  })
  .strict();

type NetworkReportInput = z.infer<typeof networkReportUpdateSchema>;

// Helper function to parse the ID parameter
const parseId = (idParam: string): number | null => {
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

// GET: Retrieve a specific network report
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

  const report = await prisma.redReport.findUnique({
    where: { id: reportId },
    select: {
      // Project only necessary data.
      id: true,
      numeroReporte: true,
      userId: true,
      fechaRegistro: true,
      fechaIncidente: true,
      ubicacion: true,
      tipo: true,
      descripcion: true,
      dispositivo: true,
      direccionIP: true,
      direccionMAC: true,
      estado: true,
      prioridad: true,
      tecnico: true,
      notasTecnicas: true,
      solucion: true,
      usuario: {
        select: {
          nombre: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json(
      { error: "Reporte de red no encontrado" },
      { status: 404 }
    );
  }

  if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(report);
}

// PUT: Update a specific network report
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

  let data: NetworkReportInput;
  try {
    const rawData = await request.json();
    data = networkReportUpdateSchema.parse(rawData); // Validate!
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

  const report = await prisma.redReport.findUnique({ where: { id: reportId } });
  if (!report) {
    return NextResponse.json(
      { error: "Reporte de red no encontrado" },
      { status: 404 }
    );
  }

  if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const updatedReport = await prisma.redReport.update({
      where: { id: reportId },
      data: {
        ...data,
        fechaIncidente: data.fechaIncidente
          ? new Date(data.fechaIncidente)
          : undefined,
        //THIS IS IMPORTANT FOR NULLABLES
        ubicacion: data.ubicacion === null ? null : data.ubicacion,
        descripcion: data.descripcion === null ? null : data.descripcion,
        dispositivo: data.dispositivo === null ? null : data.dispositivo,
        direccionIP: data.direccionIP === null ? null : data.direccionIP,
        direccionMAC: data.direccionMAC === null ? null : data.direccionMAC,
        tecnico: data.tecnico === null ? null : data.tecnico,
        notasTecnicas: data.notasTecnicas === null ? null : data.notasTecnicas,
        solucion: data.solucion === null ? null : data.solucion,
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

// DELETE: Delete a specific network report
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

    const report = await prisma.redReport.findUnique({
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
      await prisma.redReport.delete({
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
    console.error("Error en DELETE /api/v1/reports/network/[id]:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
