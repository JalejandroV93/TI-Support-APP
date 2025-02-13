// lib/auth.ts
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from './tokens';
//import { Usuario } from '@prisma/client';
import { UserPayload } from "@/types/user";
import { cookies } from 'next/headers';

const FAILED_ATTEMPTS_THRESHOLD = 5;
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};


// Esta función ahora solo *valida* las credenciales y *crea* el token.
// La gestión de cookies se hace en route.ts.
export const validateCredentials = async (username: string, password: string): Promise<UserPayload> => {
  if (!username || !password) {
    throw new Error("Credenciales incompletas");
  }

  const user = await prisma.usuario.findUnique({
    where: { username },
  });

  if (!user) {
    await bcrypt.compare(password, "$2a$10$CwTycUXWue0Thq9StjUM0u"); // Dummy hash
    throw new Error("Credenciales inválidas");
  }

  if (user.isDisabled) {
    throw new Error("Cuenta deshabilitada");
  }
  if (user.isBlocked) {
    throw new Error("Cuenta bloqueada temporalmente");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        isBlocked: user.failedLoginAttempts + 1 >= FAILED_ATTEMPTS_THRESHOLD,
      },
    });

    // Bloqueo inmediato si se alcanza el límite
    if (updatedUser.isBlocked) {
      throw new Error("Cuenta bloqueada temporalmente");
    }
    throw new Error("Credenciales inválidas");
  }

  // Reiniciar intentos fallidos
  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      isBlocked: false,
    },
  });

  const userPayload: UserPayload = {
    id: user.id,
    username: user.username,
    rol: user.rol,
    nombre: user.nombre,
    email: user.email,
    phonenumber: user.phonenumber,
  };

  return userPayload;
};


// getCurrentUser *solo* debe usarse en Server Components o Route Handlers.
export const getCurrentUser = async (): Promise<UserPayload | null> => {
  const token = (await cookies()).get('auth_token')?.value;
  //console.log(token);
  if (!token) {
    return null;
  }
  return verifyToken(token);
};

