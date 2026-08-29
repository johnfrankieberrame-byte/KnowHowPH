import { test, expect } from "@playwright/test";

test.describe("Career explorer", () => {
  test("browses careers and applies a filter", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "Career explorer" })).toBeVisible();

    const cardsBefore = page.locator("main a[href^='/careers/']").first();
    await expect(cardsBefore).toBeVisible({ timeout: 15000 });

    // Apply a "Technology" industry filter via the desktop sidebar checkbox (a Radix
    // button-based checkbox, so we click it rather than using the native .check()).
    const techCheckbox = page.locator("#industry-technology");
    if (await techCheckbox.count()) {
      await techCheckbox.click();
      await expect(page).toHaveURL(/industry=technology/);
    }
  });

  test("shows a friendly empty state for a query with no matches", async ({ page }) => {
    await page.goto("/careers?q=zzzznotarealcareerzzzz");
    await expect(page.getByText(/No careers matched your filters/i)).toBeVisible();
  });

  test("searches from the homepage and lands on the explorer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Find career paths/i })).toBeVisible();
    await page.waitForLoadState("networkidle"); // let client hydration finish before interacting
    const searchInput = page.getByLabel("Search careers, industries, or skills");
    await searchInput.fill("Software Developer");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\/careers\?q=/, { timeout: 10000 });
  });
});
