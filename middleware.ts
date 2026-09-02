
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = ["/dashboard", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ============================================================
  // 1. Redirect authenticated users away from login
  // ============================================================
  if (token && pathname === "/login") {
    const role = String(token.role || "USER").toUpperCase();

    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  // ============================================================
  // 2. Protect dashboard/admin routes
  // ============================================================
  const isProtectedRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Not authenticated
    if (!token) {
      const loginUrl = new URL("/login", request.url);

      // Preserve the page the user originally wanted
      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }

    const role = String(token.role || "USER").toUpperCase();

    // ==========================================================
    // ADMIN AREA
    // ==========================================================
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      }

      return NextResponse.next();
    }

    // ==========================================================
    // USER DASHBOARD
    // ==========================================================
    if (pathname.startsWith("/dashboard")) {
      if (role === "ADMIN") {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }

      return NextResponse.next();
    }
  }

  // ============================================================
  // 3. Redirect "/" to the correct dashboard
  // ============================================================
  if (pathname === "/" && token) {
    const role = String(token.role || "USER").toUpperCase();

    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  // ============================================================
  // 4. Continue normally
  // ============================================================
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

