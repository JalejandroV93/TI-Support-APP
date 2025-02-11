// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/tokens';

const protectedRoutes = ["/v1"]; // Rutas protegidas

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  // Se espera la verificación del token
  const isLoggedIn = token ? !!(await verifyToken(token)) : false;
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const absoluteURL = new URL("/", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
