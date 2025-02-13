//api/v1/reports/maintenance/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TipoMantenimiento } from "@prisma/client"; 
import { z } from "zod"; // Import Zod

// Define Zod schema for input validation (more precise and consistent)
const maintenanceReportInputSchema = z.object({
  tipoEquipo: z.enum(["ESCRITORIO", "PORTATIL", "TABLET", "OTRO"]), // Moved up
  equipo: z.string().min(1, "Equipo is required"),
  marca: z.string().optional().nullable(), // Allow null
  modelo: z.string().optional().nullable(), // Allow null
  sistemaOp: z.string().optional().nullable(), // Allow null
  procesador: z.string().optional().nullable(),// Allow null
  ram: z.string().optional().nullable(),       // Allow null
  ramCantidad: z.number().int().optional().nullable(), // Allow null + positive
  diagnostico: z.string().optional().nullable(),  // Allow null
  tipoMantenimiento: z.nativeEnum(TipoMantenimiento),
  solucion: z.string().optional().nullable(),       // Allow null
  fechaRecibido: z.string().datetime(),
  fechaEntrega: z.string().datetime().optional().nullable(), // Allow null
  tecnico: z.string().min(1, "Technician is required"),
  observaciones: z.string().optional().nullable(),    // Allow null
  detallesProceso: z.string().optional().nullable(),  // Allow null
});



type MaintenanceReportInput = z.infer<typeof maintenanceReportInputSchema>;


/**
 * GET: Retorna el listado de reportes paginado.
 */
export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
      const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10) || 10;

      if (isNaN(page) || page < 1) {
        return NextResponse.json(
          { error: "Número de página inválido" },
          { status: 400 }
        );
      }
      if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        return NextResponse.json(
          { error: "Tamaño de página inválido (1-100)" },
          { status: 400 }
        );
      }

      const skip = (page - 1) * pageSize;

  try {
    // Fetch only necessary fields.  Project the data!
    const reports = await prisma.mantenimientoReport.findMany({
      where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
      select: { // SELECT only these fields
        id: true,
        numeroReporte: true,
        fechaRegistro: true,
        equipo: true,
        marca: true,
        modelo: true,
        tipoMantenimiento: true,
        tecnico: true,
        usuario: {
          select: {
            nombre: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { fechaRecibido: "desc" },
    });

    const totalCount = await prisma.mantenimientoReport.count({
      where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
    });

    return NextResponse.json({ reports, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Error al obtener los reportes" },
      { status: 500 }
    );
  }
}

/**
 * POST: Crea un nuevo reporte de mantenimiento.
 */
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let data: MaintenanceReportInput;
  try {
    const rawData = await request.json();
    data = maintenanceReportInputSchema.parse(rawData); // Validate with Zod!
  } catch (error) {
    console.error("Error validating request:", error);
      if (error instanceof z.ZodError) {
      return NextResponse.json(
          { error: "Datos inválidos", details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const lastReport = await prisma.mantenimientoReport.findFirst({
      select: { id: true },
      orderBy: { id: "desc" },
    });
    const nextNumber = (lastReport?.id || 0) + 1;
    const numeroReporte = `LTSM-${nextNumber.toString().padStart(4, "0")}`;

    const { fechaRecibido, fechaEntrega, ...restData } = data;

    // Prepare data for Prisma, handling optional fields and type conversions.
    const prismaData = {
      numeroReporte,
      userId: currentUser.id,
      fechaRecibido: new Date(fechaRecibido),
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      ...restData, // Spread the rest of the data
      ramCantidad: restData.ramCantidad ?? null, // Ensure correct null handling
    };

    const newReport = await prisma.mantenimientoReport.create({
      data: prismaData,
    });
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creando reporte:", error);
    return NextResponse.json(
      { error: "Error del servidor al crear el reporte" },
      { status: 500 }
    );
  }
}
