// lib/auth.ts - Auth utilities (requires auth from root)a
import { auth } from "@/auth";

/**
 * Server-side utility: Get authenticated user or throw 401
 * Use in route handlers and server components
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized: No session found");
  }

  return session.user;
}

/**
 * Server-side utility: Get authenticated admin or throw 403
 * Use in route handlers and server components that require admin role
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin role required");
  }

  return user;
}

export function authErrorStatus(error: unknown): number | null {
  if (!(error instanceof Error)) return null;
  if (error.message.startsWith("Unauthorized:")) return 401;
  if (error.message.startsWith("Forbidden:")) return 403;
  return null;
}
