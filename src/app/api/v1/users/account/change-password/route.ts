// app/api/v1/account/change-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

export async function PUT(request: Request) {
  // Obtenemos al usuario autenticado
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let data: PasswordChangeInput;
  try {
    data = await request.json();
  } catch (error) {
    console.error("Error al parsear el body:", error);
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { currentPassword, newPassword } = data;
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Ambos campos de contraseña son obligatorios" },
      { status: 400 }
    );
  }

  // Validación: comprobamos que la contraseña actual sea correcta
  const userInDb = await prisma.usuario.findUnique({
    where: { id: currentUser.id },
  });
  if (!userInDb) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, userInDb.password);
  if (!isPasswordCorrect) {
    return NextResponse.json(
      { error: "La contraseña actual es incorrecta" },
      { status: 400 }
    );
  }

  try {
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id: currentUser.id },
      data: { password: hashedNewPassword },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando la contraseña:", error);
    return NextResponse.json(
      { error: "Error actualizando la contraseña" },
      { status: 500 }
    );
  }
}
