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

export async function GET(request: Request) {  // Added request parameter
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.rol !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url); // Get search params
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1; // Default page 1
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10) || 10; // Default pageSize 10

    const skip = (page - 1) * pageSize;

    try {
        const areas = await prisma.reporteArea.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
            },
            skip,  // Skip records
            take: pageSize, // Take records
        });

        const totalCount = await prisma.reporteArea.count(); // Get total count for pagination

        return NextResponse.json({ areas, totalCount, page, pageSize }); // Return totalCount
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