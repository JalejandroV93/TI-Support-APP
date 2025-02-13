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
      // More specific error message for validation failures.
      return NextResponse.json({ error: 'Credenciales inválidas', details: result.error.format() }, { status: 400 });
    }
    const { username, password } = result.data;

    const userPayload = await validateCredentials(username, password);
    const token = await createToken(userPayload);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Return user data (without sensitive information).
    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: { // Return basic user info for client-side use.
        username: userPayload.username,
        rol: userPayload.rol,
        // ... any other non-sensitive data you need on the client ...
      }
    }, { status: 200 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle specific errors, e.g., blocked account.
    if (error.message === "Cuenta bloqueada temporalmente") {
      return NextResponse.json({ error: error.message }, { status: 403 }); // 403 Forbidden
    }
    // Generic error for other cases
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 }); // 401 Unauthorized for general auth failures
  }
}