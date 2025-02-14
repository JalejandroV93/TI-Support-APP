// src/app/api/v1/settings/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const categoryUpdateSchema = z.object({
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

  const categoryId = parseId(params.id);
  if (categoryId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const category = await prisma.soporteCategoria.findUnique({
    where: { id: categoryId },
      select: {
          id: true,
          nombre: true,
          descripcion: true,
      },
  });

  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const categoryId = parseId(params.id);
  if (categoryId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
        const rawData = await request.json();
        const data = categoryUpdateSchema.parse(rawData); // Validate

      const updatedCategory = await prisma.soporteCategoria.update({
          where: { id: categoryId },
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

      return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
        if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 500 });
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

  const categoryId = parseId(params.id);
  if (categoryId === null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

    try {
      await prisma.soporteCategoria.delete({
        where: { id: categoryId },
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json({ error: "Error al eliminar la categoría.  Asegúrate de que no existan reportes asociados a esta categoría." }, { status: 500 }); // More helpful error
    }
}