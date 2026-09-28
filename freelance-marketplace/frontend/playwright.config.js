/**
 * Playwright configuration.
 *
 * Runs end-to-end tests in Chromium against:
 *   - Django backend at http://127.0.0.1:8000
 *   - Vite frontend at http://localhost:5173
 *
 * Timeout: 90s. Multi-user journeys do a lot of API + UI work and can
 * legitimately take 30-60s under load. 90s gives slack without hiding
 * real hangs.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "node e2e/bootstrap.cjs",
      cwd: ".",
      port: 8000,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "npm run dev -- --port 5173",
      cwd: ".",
      port: 5173,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});