// src/app/api/v1/reports/support-categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    const currentUser = await getCurrentUser();  // Check user
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
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching support categories:", error);
        return NextResponse.json({ error: "Error al obtener las categorías de soporte" }, { status: 500 });
    }
}