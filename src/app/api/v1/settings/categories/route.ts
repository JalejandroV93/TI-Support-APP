// src/app/api/v1/settings/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.rol !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    try {
        const categories = await prisma.soporteCategoria.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Error al obtener las categorías" }, { status: 500 });
    }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data: CategoryInput = await request.json();
    const validatedData = categorySchema.parse(data);  // Validate

    const newCategory = await prisma.soporteCategoria.create({
      data: validatedData,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
        console.error("Error creating category:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 });
  }
}