import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = process.env.E2E_PORT || "3100";
const baseURL = `http://localhost:${PORT}`;

// Some sandboxed CI/dev environments pre-install Chromium outside Playwright's usual
// cache (see PLAYWRIGHT_BROWSERS_PATH) and block downloading a second copy. Use it when
// present; otherwise fall back to Playwright's normal managed browser resolution.
const sandboxChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: executablePath ? { executablePath } : {} },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
