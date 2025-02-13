// src/types/user.ts
import { JWTPayload } from 'jose';
import { Rol } from '@prisma/client'; // Import Rol

export interface UserPayload extends JWTPayload {
  id: number;
  username: string;
  rol: Rol;
  nombre: string;
  email: string;
  phonenumber?: string | null;
}