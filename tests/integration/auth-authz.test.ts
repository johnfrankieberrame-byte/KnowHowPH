import { describe, expect, it } from "vitest";

describe("session auth guards (integration)", () => {
  it("getCurrentUser resolves to null when Supabase isn't configured", async () => {
    const { getCurrentUser } = await import("@/lib/auth/session");
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("requireUser throws UnauthorizedError when there is no session", async () => {
    const { requireUser, UnauthorizedError } = await import("@/lib/auth/session");
    await expect(requireUser()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("requireAdmin throws UnauthorizedError (not silently passing) when there is no session", async () => {
    const { requireAdmin, UnauthorizedError } = await import("@/lib/auth/session");
    await expect(requireAdmin()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
