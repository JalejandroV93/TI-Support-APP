// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST() {
  (await cookies()).delete('auth_token');
  return NextResponse.json({ message: "Sesión cerrada exitosamente" });

}

// No uses redirect dentro de una API route.  El redirect
// debe ocurrir en el cliente (ver auth-client.ts).