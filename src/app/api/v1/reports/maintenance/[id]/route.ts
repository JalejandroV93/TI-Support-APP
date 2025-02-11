//api/v1/reports/maintenance/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface MaintenanceReportInput {
  equipo: string;
  marca?: string;
  modelo?: string;
  sistemaOp?: string;
  procesador?: string;
  ram?: string;
  ramCantidad?: number;
  diagnostico: string;
  falla?: string;
  causa?: string;
  solucion?: string;
  fechaRecibido: string; // ISO string
  fechaEntrega?: string;
  tecnico: string;
  observaciones?: string;
  detallesProceso?: string;
}

// Helper para parsear el parámetro ID de la ruta dinámica
const parseId = (idParam: string): number | null => {
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

/**
 * GET: Retorna el reporte específico.
 * - Admin: puede acceder a cualquier reporte.
 * - Colaborador: solo puede acceder a sus propios reportes.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const report = await prisma.mantenimientoReport.findUnique({
    where: { id },
    include: { usuario: true }
  });
  
  if (!report) {
    return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
  }
  
  // Validación de permisos
  if (currentUser.rol !== 'ADMIN' && report.userId !== currentUser.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  return NextResponse.json(report);
}

/**
 * PUT: Actualiza el reporte específico.
 * Se permite la actualización si el usuario es admin o el propietario del reporte.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  let data: MaintenanceReportInput;
  try {
    data = await request.json();
  } catch (error) {
    console.error('Error parseando request:', error);
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const report = await prisma.mantenimientoReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
  }

  if (currentUser.rol !== 'ADMIN' && report.userId !== currentUser.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const updatedReport = await prisma.mantenimientoReport.update({
      where: { id },
      data
    });
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    return NextResponse.json({ error: 'Error actualizando reporte' }, { status: 500 });
  }
}

/**
 * DELETE: Elimina el reporte específico.
 * Se permite la eliminación si el usuario es admin o el propietario del reporte.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const report = await prisma.mantenimientoReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
  }

  if (currentUser.rol !== 'ADMIN' && report.userId !== currentUser.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    await prisma.mantenimientoReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando reporte:', error);
    return NextResponse.json({ error: 'Error eliminando reporte' }, { status: 500 });
  }
}
