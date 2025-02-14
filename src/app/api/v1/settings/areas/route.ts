// src/app/api/v1/settings/areas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const areaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
});

type AreaInput = z.infer<typeof areaSchema>;

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.rol !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    try {
        const areas = await prisma.reporteArea.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
            },
        });
        return NextResponse.json(areas);
    } catch (error) {
        console.error("Error fetching areas:", error);
        return NextResponse.json({ error: "Error al obtener las áreas" }, { status: 500 });
    }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data: AreaInput = await request.json();
    const validatedData = areaSchema.parse(data);  // Validate

    const newArea = await prisma.reporteArea.create({
      data: validatedData,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      }
    });

    return NextResponse.json(newArea, { status: 201 });

  } catch (error) {
        console.error("Error creating area:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el área" }, { status: 500 });
  }
}