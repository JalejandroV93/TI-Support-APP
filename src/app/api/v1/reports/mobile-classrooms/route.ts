// src/app/api/v1/reports/mobile-classrooms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TipoNovedad } from "@prisma/client";
import { z } from "zod";

const mobileClassroomsReportInputSchema = z.object({
  fechaIncidente: z.string().datetime(),
  tabletId: z.string().optional().nullable(),
  novedades: z.string().min(1, "La descripción de la novedad es requerida"),
  tipoNovedad: z.nativeEnum(TipoNovedad),
  estudiante: z.string().optional().nullable(),
  gradoEstudiante: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  docente: z.string().optional().nullable(),    // ADDED
  salon: z.string().optional().nullable(),
});

type MobileClassroomsReportInput = z.infer<
  typeof mobileClassroomsReportInputSchema
>;

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
        const reports = await prisma.aulaMovilReport.findMany({
            where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
            select: {
                id: true,
                numeroReporte: true,
                fechaRegistro: true,
                fechaIncidente: true,
                tabletId: true,
                tipoNovedad: true,
                docente: true, // ADDED
                salon: true, // ADDED
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

        const totalCount = await prisma.aulaMovilReport.count({
            where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
        });

        return NextResponse.json({ reports, totalCount, page, pageSize });
    } catch (error) {
        console.error("Error fetching mobile classroom reports:", error);
        return NextResponse.json({ error: "Error al obtener los reportes de aulas móviles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let data: MobileClassroomsReportInput;
  try {
    const rawData = await request.json();
    data = mobileClassroomsReportInputSchema.parse(rawData);
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

  try {
    const lastReport = await prisma.aulaMovilReport.findFirst({
      select: { id: true },
      orderBy: { id: "desc" },
    });
    const nextNumber = (lastReport?.id || 0) + 1;
    const numeroReporte = `AM-${nextNumber.toString().padStart(4, "0")}`;

    const { fechaIncidente, ...restData } = data;
    const prismaData = {
      numeroReporte,
      userId: currentUser.id,
      fechaIncidente: new Date(fechaIncidente),
      ...restData,
    };

    const newReport = await prisma.aulaMovilReport.create({
      data: prismaData,
    });
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creating mobile classroom report:", error);
    return NextResponse.json(
      { error: "Error al crear el reporte de aula móvil" },
      { status: 500 }
    );
  }
}