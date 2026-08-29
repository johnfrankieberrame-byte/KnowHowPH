import "server-only";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/auth/supabase-server";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

/**
 * Comma-separated emails that are auto-promoted to ADMIN on first sync.
 * MVP bootstrap mechanism — replace with a proper admin invite flow post-MVP.
 */
function bootstrapAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolves the current authenticated user from the Supabase session and
 * mirrors it into our own `User` table (created lazily on first sight).
 * Returns null when signed out or Supabase isn't configured.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) return null;

  const email = authUser.email.toLowerCase();
  const shouldBeAdmin = bootstrapAdminEmails().includes(email);

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: shouldBeAdmin ? { email, role: "ADMIN" } : { email },
    create: {
      id: authUser.id,
      email,
      role: shouldBeAdmin ? "ADMIN" : "USER",
    },
  });

  return { id: user.id, email: user.email, role: user.role };
}

export class UnauthorizedError extends Error {
  constructor(message = "Sign in required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws UnauthorizedError if not signed in. Use in route handlers/server actions. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Throws UnauthorizedError/ForbiddenError unless the current user has the ADMIN role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ForbiddenError("Admin access required.");
  return user;
}
