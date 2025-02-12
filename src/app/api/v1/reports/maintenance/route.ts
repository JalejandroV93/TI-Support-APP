//api/v1/reports/maintenance/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
type TipoMantenimiento = "PREVENTIVO" | "CORRECTIVO" | "OTRO";

interface MaintenanceReportInput {
  equipo: string;
  marca?: string;
  modelo?: string;
  sistemaOp?: string;
  procesador?: string;
  ram?: string;
  ramCantidad?: number;
  diagnostico?: string;
  tipoMantenimiento: TipoMantenimiento;
  solucion?: string;
  fechaRecibido: string; // ISO string
  fechaEntrega?: string;
  tecnico: string;
  observaciones?: string;
  detallesProceso?: string;
}

/**
 * GET: Retorna el listado de reportes paginado.
 * - Admin: obtiene todos los reportes.
 * - Colaborador: solo sus reportes.
 * - Recibe `page` y `pageSize` como query parameters.
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
    const reports = await prisma.mantenimientoReport.findMany({
      where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
      include: { usuario: true },
      skip,
      take: pageSize,
      orderBy: { fechaRecibido: "desc" }, // Or any other suitable ordering
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
    data = await request.json();
  } catch (error) {
    console.error("Error parseando request:", error);
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Validate required fields on the server-side as well.
  if (
    !data.equipo ||
    !data.fechaRecibido ||
    !data.tecnico ||
    !data.tipoMantenimiento
  ) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  try {
    const lastReport = await prisma.mantenimientoReport.findFirst({
      select: { id: true },
      orderBy: { id: "desc" },
    });
    const nextNumber = (lastReport?.id || 0) + 1;
    const numeroReporte = `RM-${nextNumber.toString().padStart(4, "0")}`;

    const { fechaRecibido, fechaEntrega, ...restData } = data;

    // Explicitly handle potentially undefined/null optional values,
    // and convert ramCantidad to a number ONLY if it's defined and not empty
    const prismaData = {
      numeroReporte,
      userId: currentUser.id,
      fechaRecibido: new Date(fechaRecibido),
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      equipo: restData.equipo,
      marca: restData.marca ?? null,
      modelo: restData.modelo ?? null,
      sistemaOp: restData.sistemaOp ?? null,
      procesador: restData.procesador ?? null,
      ram: restData.ram ?? null,
      ramCantidad: restData.ramCantidad ? Number(restData.ramCantidad) : null,
      diagnostico: restData.diagnostico ?? null,
      tipoMantenimiento: (restData.tipoMantenimiento &&
      ["PREVENTIVO", "CORRECTIVO", "OTRO"].includes(
        restData.tipoMantenimiento.toUpperCase()
      )
        ? restData.tipoMantenimiento.toUpperCase()
        : "OTRO") as TipoMantenimiento,
      solucion: restData.solucion ?? null,
      tecnico: restData.tecnico,
      observaciones: restData.observaciones ?? null,
      detallesProceso: restData.detallesProceso ?? null,
    };

    const newReport = await prisma.mantenimientoReport.create({
      data: prismaData, // Use the prepared data
    });
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creando reporte:", error);
    // Return a proper JSON error response.  This is VERY important.
    return NextResponse.json(
      { error: "Error del servidor al crear el reporte" },
      { status: 500 }
    );
  }
}
