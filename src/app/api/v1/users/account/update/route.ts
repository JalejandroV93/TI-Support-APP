// app/api/v1/account/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface ProfileUpdateInput {
  nombre: string;
  email: string;
  phonenumber?: string;
}

export async function PUT(request: Request) {
  // Obtenemos al usuario autenticado
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let data: ProfileUpdateInput;
  try {
    data = await request.json();
  } catch (error) {
    console.error("Error al parsear el body:", error);
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Validaciones básicas (puedes ampliar según tus necesidades)
  if (!data.nombre || !data.email) {
    return NextResponse.json(
      { error: "El nombre y el correo son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.usuario.update({
      where: { id: currentUser.id },
      data: {
        nombre: data.nombre,
        email: data.email,
        phonenumber: data.phonenumber,
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        email: true,
        phonenumber: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json(
      { error: "Error actualizando el perfil" },
      { status: 500 }
    );
  }
}
