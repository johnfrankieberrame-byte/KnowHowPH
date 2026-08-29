import "server-only";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { generateAnonymousId } from "@/lib/quiz/tokens";
import { ForbiddenError } from "@/lib/auth/session";

const ANON_COOKIE = "kh_anon_id";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface AttemptOwner {
  userId: string | null;
  anonymousId: string | null;
}

/** Resolves (and lazily creates) the current caller's attempt-ownership identity. */
export async function resolveAttemptOwner(): Promise<AttemptOwner> {
  const user = await getCurrentUser().catch(() => null);
  if (user) return { userId: user.id, anonymousId: null };

  const cookieStore = await cookies();
  let anonymousId = cookieStore.get(ANON_COOKIE)?.value ?? null;
  if (!anonymousId) {
    anonymousId = generateAnonymousId();
    cookieStore.set(ANON_COOKIE, anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ANON_COOKIE_MAX_AGE,
      path: "/",
    });
  }
  return { userId: null, anonymousId };
}

export function assertAttemptAccess(
  attempt: { userId: string | null; anonymousId: string | null },
  owner: AttemptOwner
) {
  const matchesUser = attempt.userId && owner.userId && attempt.userId === owner.userId;
  const matchesAnon = attempt.anonymousId && owner.anonymousId && attempt.anonymousId === owner.anonymousId;
  if (!matchesUser && !matchesAnon) {
    throw new ForbiddenError("You don't have access to this quiz attempt.");
  }
}
