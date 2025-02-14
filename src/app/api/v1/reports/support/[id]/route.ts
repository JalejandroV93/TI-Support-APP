// src/app/api/v1/reports/support/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { SoporteEstado, TipoUsuario, ReporteArea } from '@prisma/client'; // Import enum

// --- Validation Schema (for PUT requests - updates) ---
const supportReportUpdateSchema = z.object({
    categoriaId: z.number().int().positive().optional(),
    descripcion: z.string().min(1, "La descripción es requerida").optional(),
    reporteArea: z.nativeEnum(ReporteArea).optional(),   //NEW
    tipoUsuario: z.nativeEnum(TipoUsuario).optional(),  //NEW
    solucion: z.string().optional().nullable(),          //NEW
    notasTecnicas: z.string().optional().nullable(),   //NEW
    estado: z.nativeEnum(SoporteEstado).optional(),   //NEW
    fueSolucionado: z.boolean().optional(),    //NEW
    fecha: z.string().datetime().optional(),  // Keep fecha
}).strict();

type SupportReportUpdateInput = z.infer<typeof supportReportUpdateSchema>;

// --- Helper function to parse ID ---
const parseId = (idParam: string): number | null => {
    const id = parseInt(idParam, 10);
    return isNaN(id) ? null : id;
};

// --- GET: Retrieve a specific support report ---
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const reportId = parseId(id);
    if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const report = await prisma.soporteReport.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            numeroReporte: true,
            userId: true,
            categoriaId: true,
            fecha: true,
            descripcion: true,
            reporteArea: true,
            tipoUsuario: true,
            solucion: true,
            estado: true,
            fueSolucionado: true,
            notasTecnicas: true,
            fechaSolucion: true,
            usuario: {
                select: {
                    nombre: true,
                },
            },
            categoria: {
                select: {
                    nombre: true,
                },
            },
        },
    });

    if (!report) {
        return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
    }

    if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(report);
}

// --- PUT: Update a specific support report ---
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const reportId = parseId(id);
    if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    let data: SupportReportUpdateInput;
    try {
        const rawData = await request.json();
        data = supportReportUpdateSchema.parse(rawData); // Validate!
    } catch (error) {
        console.error("Validation error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const report = await prisma.soporteReport.findUnique({ where: { id: reportId } });
    if (!report) {
        return NextResponse.json({ error: "Reporte de soporte no encontrado" }, { status: 404 });
    }

    if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    try {
        const updatedReport = await prisma.soporteReport.update({
            where: { id: reportId },
            data: {
                ...data,
                fecha: data.fecha ? new Date(data.fecha) : undefined,
                //THIS IS IMPORTANT FOR NULLABLES
                solucion: data.solucion === null ? null : data.solucion,
                notasTecnicas:
                data.notasTecnicas === null ? null : data.notasTecnicas,
                fechaSolucion: data.estado === 'RESUELTO'? new Date() : undefined,
            },
        });
        return NextResponse.json(updatedReport);
    } catch (error) {
        console.error("Error updating network report:", error);
        return NextResponse.json({ error: "Error al actualizar el reporte de red" }, { status: 500 });
    }
}

// --- DELETE: Delete a specific support report ---
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      const { id } = await params;

    const reportId = parseId(id);

    if (reportId === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      }

      const report = await prisma.soporteReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        return NextResponse.json(
          { error: "Reporte no encontrado" },
          { status: 404 }
        );
      }

      if (currentUser.rol !== "ADMIN" && report.userId !== currentUser.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }

      try {
        await prisma.soporteReport.delete({
          where: { id: reportId },
        });
        return NextResponse.json({ success: true });
      } catch (deleteError) {
        console.error("Error eliminando reporte:", deleteError);
        return NextResponse.json(
          { error: "Error eliminando reporte" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error en DELETE /api/v1/reports/support/[id]:", error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }