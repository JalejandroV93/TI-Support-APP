import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from './tokens';
import { UserPayload } from "@/types/user";
import { cookies } from 'next/headers';

const FAILED_ATTEMPTS_THRESHOLD = 5;
const SALT_ROUNDS = 10; //  Keep as a constant here

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const validateCredentials = async (username: string, password: string): Promise<UserPayload> => {
  if (!username || !password) {
    throw new Error("Credenciales incompletas");
  }

  const user = await prisma.usuario.findUnique({
    where: { username },
    select: {  // Always use select for security
      id: true,
      username: true,
      password: true, // Needed for comparison
      rol: true,
      isBlocked: true,
      isDisabled: true,
      failedLoginAttempts: true,
      nombre: true,
      email: true,
      phonenumber: true
    }
  });

  if (!user) {
    // Security: Avoid revealing whether the username exists. Hash a dummy string.
    await bcrypt.compare(password, "$2a$10$CwTycUXWue0Thq9StjUM0u"); //  Consistent dummy hash
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
        isBlocked: {
          set: user.failedLoginAttempts + 1 >= FAILED_ATTEMPTS_THRESHOLD,
        }
      },
      select: { isBlocked: true } // Only need to know if it became blocked
    });

    // Immediate block if limit reached
    if (updatedUser.isBlocked) {
      throw new Error("Cuenta bloqueada temporalmente");
    }
    throw new Error("Credenciales inválidas");
  }

  // Reset failed attempts on success
  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      isBlocked: false,
    },
  });

  // Construct user payload *after* all checks.  Don't include the password hash!
  const userPayload: UserPayload = {
    id: user.id,
    username: user.username,
    rol: user.rol,  // Correct usage with UserPayload
    nombre: user.nombre,
    email: user.email,
    phonenumber: user.phonenumber
  };

  return userPayload;
};

// getCurrentUser - only for Server Components/Route Handlers.
export const getCurrentUser = async (): Promise<UserPayload | null> => {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifyToken(token);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);  //  Log the actual error
    return null; // Return null if verification fails (don't throw)
  }
};