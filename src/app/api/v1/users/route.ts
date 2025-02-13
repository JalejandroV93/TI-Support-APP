// api/v1/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { UserPayload } from "@/types/user";

// Definición de la interfaz para la entrada de datos al crear o actualizar un usuario
interface UserInput {
  username: string;
  password?: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'COLABORADOR';
  phonenumber?: string;
}

// Helper para verificar si el usuario es administrador
const isAdmin = (user: UserPayload | null): boolean => user?.rol === 'ADMIN';

// Helper para parsear y validar el parámetro ID
const parseIdParam = (idParam: string | null): number | null => {
  if (!idParam) return null;
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

// Obtener todos los usuarios (solo admin)
export async function GET() {
  const user = await getCurrentUser();
  //console.log("endpoint usuarios GET", user);

  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        isBlocked: true,
        isDisabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Crear usuario (solo admin)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  let data: UserInput;
  try {
    data = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  if (!data.password) {
    return NextResponse.json({ error: 'La contraseña es obligatoria' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Actualizar usuario (solo admin)
export async function PUT(request: Request) {
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

  let data: UserInput;
  try {
    data = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: {
        ...data,
        password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        isBlocked: true,
        isDisabled: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Error actualizando usuario' }, { status: 500 });
  }
}

// Desactivar (eliminar) usuario (solo admin)
export async function DELETE(request: Request) {
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
      data: { isDisabled: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disabling user:", error);
    return NextResponse.json({ error: 'Error desactivando usuario' }, { status: 500 });
  }
}

//Activar usuario (solo admin)


// Desbloquear usuario (solo admin)
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
      data: {
        isBlocked: false,
        failedLoginAttempts: 0,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlocking user:", error);
    return NextResponse.json({ error: 'Error desbloqueando usuario' }, { status: 500 });
  }
}
