// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that are strictly protected
const AUTH_ROUTES = ["/dashboard", "/admin"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 1. Redirect logged-in users away from auth pages (like /signin)
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL(`/${token.role}`, request.url));
  }

  // 2. Protect defined dashboard routes
  const isProtectedRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to signin if no session
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = token.role as string;

    // Redirect to correct dashboard if trying to access another role's area
    if (pathname.startsWith(`/${userRole}`) === false) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
  }

  // 3. Optional: Redirect root "/" to user's dashboard if logged in
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL(`/${token.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // We match everything except static files and API routes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

