// --- src/app/api/v1/reports/unified/route.ts (Modified) ---

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UnifiedReport } from "@/types/global";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10) || 10;
  const skip = (page - 1) * pageSize;

  try {
    // Fetch all report types concurrently
    const [mantenimientoReports, redReports, aulaMovilReports, soporteReports] =
      await Promise.all([
        prisma.mantenimientoReport.findMany({
          where:
            currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
          select: {
            id: true,
            numeroReporte: true,
            fechaRegistro: true, // Use this for 'fecha'
            tecnico: true, // Could be common for some reports
            equipo: true,
            usuario: { select: { nombre: true } },
          },
          skip,
          take: pageSize,
          orderBy: { fechaRegistro: "desc" },
        }),
        prisma.redReport.findMany({
          where:
            currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
          select: {
            id: true,
            numeroReporte: true,
            fechaIncidente: true, // Use this for 'fecha'
            estado: true,
            descripcion: true,
            ubicacion: true,
            usuario: { select: { nombre: true } },
          },
          skip,
          take: pageSize,
          orderBy: { fechaIncidente: "desc" },
        }),
        prisma.aulaMovilReport.findMany({
          where:
            currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
          select: {
            id: true,
            numeroReporte: true,
            fechaIncidente: true, // Use this for 'fecha'
            novedades: true,  // Use this for description
            usuario: { select: { nombre: true } },
            salon: true
          },
          skip,
          take: pageSize,
          orderBy: { fechaIncidente: "desc" },
        }),
        prisma.soporteReport.findMany({
          where:
            currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },
          select: {
            id: true,
            numeroReporte: true,
            fecha: true, // This is already named 'fecha'
            estado: true,
            descripcion: true,
            ubicacionDetalle: true,
            usuario: { select: { nombre: true } },
          },
          skip,
          take: pageSize,
          orderBy: { fecha: "desc" },
        }),
      ]);

    // Transform and combine into a unified format
    const unifiedReports: UnifiedReport[] = [
      ...mantenimientoReports.map((r): UnifiedReport => ({
        id: r.id,
        reportType: "Mantenimiento",  // Explicitly set the type
        numeroReporte: r.numeroReporte,
        fecha: r.fechaRegistro.toISOString(),
        usuario: r.usuario.nombre,
        descripcion: `Mantenimiento de ${r.equipo}`, // Create a description
      })),
      ...redReports.map((r): UnifiedReport => ({
        id: r.id,
        reportType: "Red",   // Explicitly set the type
        numeroReporte: r.numeroReporte,
        fecha: r.fechaIncidente.toISOString(),
        usuario: r.usuario.nombre,
        estado: r.estado,
        descripcion: r.descripcion ?? undefined,
        ubicacion: r.ubicacion ?? undefined,
      })),
      ...aulaMovilReports.map((r): UnifiedReport => ({
        id: r.id,
        reportType: "Aula Movil",   // Explicitly set the type
        numeroReporte: r.numeroReporte,
        fecha: r.fechaIncidente.toISOString(),
        usuario: r.usuario.nombre,
        descripcion: r.novedades,
        ubicacion: r.salon ?? undefined,
      })),
      ...soporteReports.map((r): UnifiedReport => ({
        id: r.id,
        reportType: "Soporte",   // Explicitly set the type
        numeroReporte: r.numeroReporte,
        fecha: r.fecha.toISOString(),
        usuario: r.usuario.nombre,
        estado: r.estado,
        descripcion: r.descripcion,
        ubicacion: r.ubicacionDetalle ?? undefined,
      })),
    ];
        // Sort combined reports by date, most recent first.
        unifiedReports.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        // Count reports
        const totalCount = await prisma.mantenimientoReport.count({ where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },}) + 
        await prisma.redReport.count({ where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },}) +
        await prisma.aulaMovilReport.count({ where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },}) +
        await prisma.soporteReport.count({ where: currentUser.rol === "ADMIN" ? {} : { userId: currentUser.id },});

        return NextResponse.json({ reports: unifiedReports, totalCount, page, pageSize });
      } catch (error) {
        console.error("Error fetching unified reports:", error);
        return NextResponse.json(
          { error: "Error al obtener los reportes unificados" },
          { status: 500 }
        );
      }
    }