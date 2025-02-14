// src/app/api/v1/settings/categories/options/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

     if (currentUser.rol !== 'ADMIN' && currentUser.rol !== 'COLABORADOR') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
     }

    try {
        const categories = await prisma.soporteCategoria.findMany({
            select: {
                id: true,
                nombre: true,
            },
            orderBy: {  // Add this for consistent ordering
              nombre: 'asc'
            }
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching category options:", error);
        return NextResponse.json(
            { error: "Error al obtener las categorías" },
            { status: 500 }
        );
    }
}