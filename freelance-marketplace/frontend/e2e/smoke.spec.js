/**
 * Smoke test: does the app load at all?
 *
 * Fast, no auth. Verifies the home page renders, the jobs page
 * renders, and 404s show the not-found page.
 */

import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /find great work/i })
    ).toBeVisible();
  });

  test("jobs page loads", async ({ page }) => {
    await page.goto("/jobs");
    await expect(
      page.getByRole("heading", { name: /browse jobs/i })
    ).toBeVisible();
  });

  test("404 page shows for unknown route", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("User-agent");
  });
});