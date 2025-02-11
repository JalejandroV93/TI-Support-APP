// app/api/auth/login/route.ts
import { validateCredentials } from '@/lib/auth';
import { createToken } from '@/lib/tokens';
import { NextResponse } from 'next/server';
import { z } from "zod";
import { cookies } from 'next/headers';

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Credenciales incompletas' }, { status: 400 });
    }
    const { username, password } = result.data;

    const userPayload = await validateCredentials(username, password);
    // Esperamos a que se genere el token
    const token = await createToken(userPayload);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return NextResponse.json({ message: "Inicio de sesión exitoso" }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
