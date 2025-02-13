// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/tokens';

const protectedRoutes = ["/v1"]; // Rutas protegidas

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  let isLoggedIn = false; // Initialize to false

  if (token) {
    try {
      // Await verifyToken, and handle potential errors gracefully
      const user = await verifyToken(token);
      isLoggedIn = !!user; // Check if verification was successful
    } catch (error) {
      console.error("Error verifying token in middleware:", error);
      isLoggedIn = false; // Treat verification errors as not logged in
    }
  }

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