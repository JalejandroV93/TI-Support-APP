// api/v1/users/enable/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { UserPayload } from '@/types/user';

// Helper para verificar si el usuario es administrador
const isAdmin = (user: UserPayload | null): boolean => user?.rol === 'ADMIN';

// Helper para parsear y validar el parámetro ID
const parseIdParam = (idParam: string | null): number | null => {
  if (!idParam) return null;
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get('id');
  const id = parseIdParam(idParam);
  if (id === null) {
    return NextResponse.json({ error: 'ID no proporcionado o inválido' }, { status: 400 });
  }

  try {
    await prisma.usuario.update({
      where: { id },
      data: { isDisabled: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error habilitando usuario:", error);
    return NextResponse.json({ error: 'Error habilitando usuario' }, { status: 500 });
  }
}
