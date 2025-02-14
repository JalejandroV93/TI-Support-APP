// src/app/api/v1/settings/areas/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const areaUpdateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255).optional(),
  descripcion: z.string().optional().nullable(), // Allow null
});


const parseId = (idParam: string): number | null => {
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const areaId = parseId(params.id);
  if (areaId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const area = await prisma.reporteArea.findUnique({
    where: { id: areaId },
      select: {
          id: true,
          nombre: true,
          descripcion: true,
      },
  });

  if (!area) {
    return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
  }

  return NextResponse.json(area);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const areaId = parseId(params.id);
  if (areaId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
        const rawData = await request.json();
        const data = areaUpdateSchema.parse(rawData); // Validate

      const updatedArea = await prisma.reporteArea.update({
          where: { id: areaId },
          data: {
            ...data,
            descripcion: data.descripcion === null ? null : data.descripcion,
          },
        select: {
            id: true,
            nombre: true,
            descripcion: true
        }
      });

      return NextResponse.json(updatedArea);
  } catch (error) {
    console.error("Error updating area:", error);
        if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al actualizar el área" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const areaId = parseId(params.id);
  if (areaId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

    try {
      await prisma.reporteArea.delete({
        where: { id: areaId },
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting area:", error);
      return NextResponse.json({ error: "Error al eliminar el área. Asegúrate de que no existan reportes asociados a este área." }, { status: 500 }); // More helpful error
    }
}