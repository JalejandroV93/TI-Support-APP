// lib/tokens.ts
import { SignJWT, jwtVerify } from 'jose';
import { UserPayload } from '@/types/user';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error("AUTH_SECRET is not defined in .env");
}

// Convertir la clave secreta a un Uint8Array
const secret = new TextEncoder().encode(secretKey);

// Función para crear el token
export const createToken = async (user: UserPayload): Promise<string> => {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d') // Expira en 1 día (ajusta según necesidad)
    .sign(secret);
};

// Función para verificar el token
export const verifyToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Si el token se firmó con el objeto `user`, el payload contendrá las propiedades de UserPayload
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};
