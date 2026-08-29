import { randomBytes } from "crypto";

/** Opaque, unguessable identifier for public quiz-result URLs (not the DB id). */
export function generateResultToken(): string {
  return randomBytes(24).toString("base64url");
}

/** Opaque anonymous-attempt identifier stored in a browser cookie/local storage. */
export function generateAnonymousId(): string {
  return randomBytes(16).toString("base64url");
}

export const QUIZ_RESULT_EXPIRY_DAYS = 180;
