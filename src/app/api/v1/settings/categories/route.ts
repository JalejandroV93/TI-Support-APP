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

export async function GET(request: Request) { // Add request parameter
  const currentUser = await getCurrentUser();  // Check user
  if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  if (currentUser.rol !== 'ADMIN' && currentUser.rol !== 'COLABORADOR') {  
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1; // Get page, default 1
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10) || 10; // Get pageSize, default 10
  const skip = (page - 1) * pageSize;

  try {
      const categories = await prisma.soporteCategoria.findMany({
          select: {
              id: true,
              nombre: true,
              descripcion: true, // Include description
          },
          skip, // Use skip for pagination
          take: pageSize, // Use take for pagination
      });

      const totalCount = await prisma.soporteCategoria.count();  // Add count

      return NextResponse.json({ categories, totalCount, page, pageSize }); // Return totalCount
  } catch (error) {
      console.error("Error fetching support categories:", error);
      return NextResponse.json({ error: "Error al obtener las categorías de soporte" }, { status: 500 });
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