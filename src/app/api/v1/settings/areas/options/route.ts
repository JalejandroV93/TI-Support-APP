// src/app/api/v1/settings/areas/options/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
            },
             orderBy: {  // Add this for consistent ordering
              nombre: 'asc'
            }
        });
        return NextResponse.json(areas);
    } catch (error) {
        console.error("Error fetching area options:", error);
        return NextResponse.json(
            { error: "Error al obtener las áreas" },
            { status: 500 }
        );
    }
}