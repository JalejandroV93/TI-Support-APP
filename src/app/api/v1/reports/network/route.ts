// src/app/api/v1/reports/network/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RedTipo, RedEstado, Prioridad } from "@prisma/client";
import { z } from "zod";

// Zod schema for input validation
const networkReportInputSchema = z.object({
  fechaIncidente: z.string().datetime(),
  ubicacion: z.string().optional(),
  tipo: z.nativeEnum(RedTipo),
  descripcion: z.string().optional(),
  dispositivo: z.string().optional(),
  direccionIP: z.string().optional(),
  estado: z.nativeEnum(RedEstado).default("ABIERTO"),
  prioridad: z.nativeEnum(Prioridad),
  tecnico: z.string().optional(),
  notasTecnicas: z.string().optional(),
  solucion: z.string().optional()
});

type NetworkReportInput = z.infer<typeof networkReportInputSchema>;


// GET: List reports (paginated)
export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10) || 10;

  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Número de página inválido" }, { status: 400 });
  }
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    return NextResponse.json({ error: "Tamaño de página inválido (1-100)" }, { status: 400 });
  }

  const skip = (page - 1) * pageSize;
  try {

    const reports = await prisma.redReport.findMany({
      where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
      select: {
        id: true,
        numeroReporte: true,
        fechaRegistro: true,
        fechaIncidente: true,
        ubicacion: true,
        tipo: true,
        estado: true,
        prioridad: true,
        tecnico: true,
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { fechaIncidente: "desc" },
    });

    const totalCount = await prisma.redReport.count({
      where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
    });

    return NextResponse.json({ reports, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching network reports:", error);
    return NextResponse.json({ error: "Error al obtener los reportes de red" }, { status: 500 });
  }
}


// POST: Create a new network report
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let data: NetworkReportInput;
  try {
    const rawData = await request.json();
    data = networkReportInputSchema.parse(rawData);  // Validate with Zod
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const lastReport = await prisma.redReport.findFirst({
      select: { id: true },
      orderBy: { id: "desc" },
    });
    const nextNumber = (lastReport?.id || 0) + 1;
    const numeroReporte = `RR-${nextNumber.toString().padStart(4, "0")}`; // Use RR prefix


    const { fechaIncidente, ...restData } = data;
      const prismaData = {
        numeroReporte,
        userId: currentUser.id,
        fechaIncidente: new Date(fechaIncidente),
        ...restData, // Spread the rest of the validated data
    };


    const newReport = await prisma.redReport.create({
      data: prismaData,
    });
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creating network report:", error);
    return NextResponse.json({ error: "Error al crear el reporte de red" }, { status: 500 });
  }
}