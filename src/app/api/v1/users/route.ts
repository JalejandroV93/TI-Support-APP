// api/v1/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { UserPayload } from "@/types/user";
import { Rol } from '@prisma/client'; // Import Rol
import { z } from "zod";

// Helper para verificar si el usuario es administrador
const isAdmin = (user: UserPayload | null): boolean => user?.rol === 'ADMIN';

// Helper para parsear y validar el parámetro ID
const parseIdParam = (idParam: string | null): number | null => {
  if (!idParam) return null;
  const id = parseInt(idParam, 10);
  return isNaN(id) ? null : id;
};

const createUserSchema = z.object({
  username: z.string().min(2),
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.nativeEnum(Rol),
  phonenumber: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  username: z.string().min(2),
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().nullable(),
  rol: z.nativeEnum(Rol),
  phonenumber: z.string().optional().nullable(),
});

// Obtener todos los usuarios (solo admin)
export async function GET() {
  const user = await getCurrentUser();

  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const users = await prisma.usuario.findMany({
      select: { // Project only the necessary fields
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

  try {
    const rawData = await request.json();
    const data = createUserSchema.parse(rawData);  // Validate with Zod

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {  // Select only necessary fields on creation
        id: true,
        username: true,
        nombre: true,
        rol: true,
      },
    });
    return NextResponse.json(newUser, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating user:", error);
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'El nombre de usuario o correo electrónico ya existe' }, { status: 409 });  // 409 Conflict
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

  try {
    const rawData = await request.json();
    const data = updateUserSchema.parse(rawData); // Validate with Zod!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { // Use a Record for dynamic keys
        ...data,
    };

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    } else {
        delete updateData.password;  // Don't update if password is not provided
    }


    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: updateData,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }
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
