import { test, expect } from "@playwright/test";

test.describe("Admin access control", () => {
  test("a signed-out visitor cannot reach admin content", async ({ page }) => {
    await page.goto("/admin");
    // Signed-out users get redirected to /account (sign-in) rather than seeing admin content.
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("admin API routes reject unauthenticated requests", async ({ request }) => {
    const res = await request.get("/api/admin/careers");
    expect([401, 403]).toContain(res.status());
  });
});
