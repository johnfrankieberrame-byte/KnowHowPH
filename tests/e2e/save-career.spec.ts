import { test, expect } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

// Requires a real Supabase project + a pre-created test user (set NEXT_PUBLIC_SUPABASE_URL /
// NEXT_PUBLIC_SUPABASE_ANON_KEY for the app, and E2E_TEST_EMAIL / E2E_TEST_PASSWORD for this
// spec). Skipped by default since this sandbox has no live Supabase project configured.
test.describe("Save a career while authenticated", () => {
  test.skip(!email || !password, "Set E2E_TEST_EMAIL/E2E_TEST_PASSWORD and Supabase env vars to run this spec.");

  test("signs in, saves a career, and sees it under /account/saved", async ({ page }) => {
    await page.goto("/account");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/account/);

    await page.goto("/careers");
    await page.locator("main a[href^='/careers/']").first().click();

    await page.getByRole("button", { name: /save career/i }).click();
    await expect(page.getByRole("button", { name: /^saved$/i })).toBeVisible();

    await page.goto("/account/saved");
    await expect(page.locator("main a[href^='/careers/']").first()).toBeVisible();
  });
});
