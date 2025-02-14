// src/app/api/v1/reports/support/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const supportReportInputSchema = z.object({
  categoriaId: z.number().int().positive(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  fecha: z.string().datetime().optional()  //Make optional to use default value.
});

type SupportReportInput = z.infer<typeof supportReportInputSchema>;


export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  let data: SupportReportInput;
  try {
    const rawData = await request.json();
    data = supportReportInputSchema.parse(rawData);
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
    const lastReport = await prisma.soporteReport.findFirst({
      select: { id: true },
      orderBy: { id: 'desc' },
    });
    const nextNumber = (lastReport?.id || 0) + 1;
    const numeroReporte = `SS-${nextNumber.toString().padStart(4, '0')}`; // Use SS prefix

    //NOTE: userId and fecha is setted by default in the prisma schema.
    const newReport = await prisma.soporteReport.create({
      data: {
        numeroReporte,
        userId: currentUser.id,
        categoriaId: data.categoriaId,
        descripcion: data.descripcion,
      },
    });
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Error creating support report:', error);
    return NextResponse.json(
      { error: 'Error al crear el reporte de soporte' },
      { status: 500 }
    );
  }
}
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
      const reports = await prisma.soporteReport.findMany({
          where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
          select: {
              id: true,
              numeroReporte: true,
              fecha: true, // Change to fecha
              categoria: {
                  select: {
                      nombre: true,
                  },
              },
              usuario: {
                  select: {
                      nombre: true,
                  },
              },
          },
          skip,
          take: pageSize,
          orderBy: { fecha: "desc" },  // Change to fecha
      });

      const totalCount = await prisma.soporteReport.count({
          where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
      });

      return NextResponse.json({ reports, totalCount, page, pageSize });
  } catch (error) {
      console.error("Error fetching support reports:", error);
      return NextResponse.json({ error: "Error al obtener los reportes de soporte" }, { status: 500 });
  }
}