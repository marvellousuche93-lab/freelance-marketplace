/**
 * End-to-end: freelancer journey.
 *
 * Setup via API (employer + job), then test the freelancer's UI flow:
 * search, view, apply, verify application.
 */

import { test, expect } from "@playwright/test";
import {
  makeUser,
  registerUserViaApi,
  loginViaApi,
  loginViaLocalStorage,
} from "./helpers";

test.describe("Freelancer journey", () => {
  test("freelancer applies to a job and sees it in their dashboard", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);

    // ---- Setup: employer + open job via API ----
    const employer = makeUser("EMPLOYER");
    await registerUserViaApi(request, employer);
    const employerLogin = await loginViaApi(request, employer);

    const catsRes = await request.get(
      "http://127.0.0.1:8000/api/categories/"
    );
    const cats = await catsRes.json();
    const categoryId = cats.results[0].id;

    const uniqueJobTitle = `E2E Job ${Date.now()}`;
    const jobRes = await request.post("http://127.0.0.1:8000/api/jobs/", {
      headers: { Authorization: `Bearer ${employerLogin.access}` },
      data: {
        title: uniqueJobTitle,
        description:
          "A test job created by the E2E suite. It should be visible and applyable.",
        category: categoryId,
        budget_type: "FIXED_PRICE",
        min_budget: "500.00",
        max_budget: "500.00",
        status: "OPEN",
      },
    });
    expect(jobRes.ok()).toBeTruthy();

    // ---- Freelancer logs in via localStorage ----
    const freelancer = makeUser("FREELANCER");
    await registerUserViaApi(request, freelancer);
    await loginViaLocalStorage(page, request, freelancer);

    // ---- Browse jobs and find ours ----
    await page.goto(`/jobs?search=${encodeURIComponent(uniqueJobTitle)}`);
    await expect(page.getByText(uniqueJobTitle).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("link", { name: /view/i }).first().click();
    await page.waitForURL(/\/jobs\/[^/]+$/);

    // Wait for the job heading. The page shows a skeleton for ~500ms
    // first, so we give this a generous timeout.
    await expect(
      page.getByRole("heading", { name: uniqueJobTitle })
    ).toBeVisible({ timeout: 15_000 });

    // ---- Apply ----
    await page.getByRole("button", { name: /apply now/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await modal
      .getByLabel(/cover letter/i)
      .fill(
        "I am a passionate full-stack developer with four years of Django experience."
      );
    await modal.getByLabel(/proposed price/i).fill("450.00");
    await modal.getByLabel(/estimated duration/i).fill("2 weeks");
    await modal.getByRole("button", { name: /submit application/i }).click();
    await expect(modal).not.toBeVisible({ timeout: 15_000 });

    // ---- Verify in the dashboard ----
    await page.goto("/dashboard/applications");
    await expect(page.getByText(uniqueJobTitle).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/pending/i).first()).toBeVisible();
  });
});