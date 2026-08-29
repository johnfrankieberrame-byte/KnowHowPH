import { test, expect } from "@playwright/test";

test.describe("Career detail page", () => {
  test("shows the full career profile with provenance and disclaimers", async ({ page }) => {
    await page.goto("/careers/software-developer");

    // If the seed uses a different slug in a given environment, fall back to the first explorer result.
    if ((await page.locator("h1").count()) === 0 || page.url().includes("404")) {
      await page.goto("/careers");
      await page.locator("main a[href^='/careers/']").first().click();
    }

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("heading", { name: "At a glance" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What you do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Skills", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data & sources" })).toBeVisible();
    await expect(page.getByText(/informational estimates/i).first()).toBeVisible();
  });

  test("returns a 404-style not-found page for an unknown slug", async ({ page }) => {
    const response = await page.goto("/careers/this-career-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
