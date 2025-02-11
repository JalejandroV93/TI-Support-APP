import { JWTPayload } from "jose";

export interface UserPayload extends JWTPayload {
  id: number;
  username: string;
  rol: "ADMIN" | "COLABORADOR";
  nombre: string;
  email: string;
  phonenumber?: string | null;
}
