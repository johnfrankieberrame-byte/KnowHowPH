import { test, expect, type Page } from "@playwright/test";

async function answerCurrentSection(page: Page) {
  // The design system's RadioGroup/Checkbox are Radix primitives rendered as
  // <button role="radio"|"checkbox">, not native <input> elements — so we must
  // select them by ARIA role, not by input type.
  const fieldsets = page.locator("main fieldset");
  const count = await fieldsets.count();
  for (let i = 0; i < count; i++) {
    const fieldset = fieldsets.nth(i);
    const radios = fieldset.getByRole("radio");
    const checkboxes = fieldset.getByRole("checkbox");
    const radioCount = await radios.count();
    if (radioCount > 0) {
      // Pick a middle-ish option so Likert questions aren't all-extreme.
      await radios.nth(Math.floor(radioCount / 2)).click();
    } else if (await checkboxes.count()) {
      await checkboxes.first().click();
    }
  }
}

test.describe("Career quiz", () => {
  test("completes the quiz end-to-end and reaches deterministic results", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/quiz");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle"); // let client hydration finish before interacting
    await page.getByRole("button", { name: /start the quiz/i }).click();

    await expect(page).toHaveURL(/\/quiz\/take\?attempt=/, { timeout: 10000 });

    // Walk through every section, answering all required questions, until we reach the results page.
    for (let step = 0; step < 10; step++) {
      await expect(page.locator("fieldset").first()).toBeVisible({ timeout: 15000 });
      await answerCurrentSection(page);

      // Scoped to <main> to avoid matching the Next.js dev-tools overlay button in dev mode.
      const nextButton = page.locator("main").getByRole("button", { name: /next|see my results/i });
      const isFinal = (await nextButton.textContent())?.toLowerCase().includes("results");
      await nextButton.click();

      if (isFinal) {
        await expect(page).toHaveURL(/\/quiz\/results\//, { timeout: 20000 });
        break;
      }
    }

    await expect(page.getByRole("heading", { name: /Your top career matches/i })).toBeVisible();
    await expect(page.getByText(/informational estimates, not guarantees/i)).toBeVisible();
    await expect(page.getByText(/#1 match/i).first()).toBeVisible();

    // Trigger the (unconfigured-in-this-env) AI insight — exercises the deterministic fallback UX
    // without calling the live Gemini API, since GEMINI_API_KEY is intentionally unset for tests.
    const insightButton = page.getByRole("button", { name: /get personalized insight/i });
    if (await insightButton.count()) {
      await insightButton.click();
      await expect(
        page.getByText(/couldn't generate a personalized explanation|personalized summary/i)
      ).toBeVisible({ timeout: 30000 });
    }
  });
});
