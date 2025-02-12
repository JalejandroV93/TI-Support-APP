// lenguaje: TypeScript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Filtramos por los usuarios que pueden ser técnicos. 
    // Por ejemplo, si asumimos que los técnicos tienen rol "COLABORADOR":
    const technicians = await prisma.usuario.findMany({
      where: { rol: 'COLABORADOR' },
      select: { id: true, nombre: true }
    });
    return NextResponse.json(technicians);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return NextResponse.json({ error: "Error al obtener los técnicos" }, { status: 500 });
  }
}