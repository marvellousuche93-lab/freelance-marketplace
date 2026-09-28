/**
 * End-to-end: employer journey.
 *
 * Setup via API (freelancer + application), then test the employer's
 * UI flow: post a job, review applications, accept one, verify the
 * job moves to IN_PROGRESS.
 */

import { test, expect } from "@playwright/test";
import {
  makeUser,
  registerUserViaApi,
  loginViaApi,
  loginViaLocalStorage,
  selectFirstOption,
} from "./helpers";

test.describe("Employer journey", () => {
  test("employer posts a job, receives an application, accepts it", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);

    const jobTitle = `E2E Employer Flow ${Date.now()}`;

    // ---- Employer signs up via API and logs into browser ----
    const employer = makeUser("EMPLOYER");
    await registerUserViaApi(request, employer);
    await loginViaLocalStorage(page, request, employer);

    // ---- Employer posts a job via the UI ----
    await page.goto("/dashboard/jobs/new");
    await page.getByLabel(/^title$/i).fill(jobTitle);
    await page
      .getByLabel(/description/i)
      .fill("A test job for the employer flow.");
    await selectFirstOption(page, /^category$/i, "categories");
    await page.getByLabel(/^status$/i).selectOption("OPEN");
    await page.getByLabel(/price/i).fill("1000.00");
    await page.getByRole("button", { name: /post job/i }).click();

    // Wait for the URL to be a job DETAIL page. The negative lookahead
    // (?!new$) prevents matching /dashboard/jobs/new — which is where
    // we currently are, and which would otherwise satisfy a naive
    // /\/jobs\/[^/]+$/ regex.
    await page.waitForURL(/\/jobs\/(?!new$)[^/]+$/, { timeout: 20_000 });

    // ---- Look up the job by slug to get its ID ----
    const slug = page.url().split("/jobs/")[1].replace(/\/$/, "");
    const employerLogin = await loginViaApi(request, employer);
    const jobRes = await request.get(
      `http://127.0.0.1:8000/api/jobs/${slug}/`,
      { headers: { Authorization: `Bearer ${employerLogin.access}` } }
    );
    if (!jobRes.ok()) {
      throw new Error(
        `Failed to fetch job "${slug}" (${jobRes.status()}): ${await jobRes.text()}`
      );
    }
    const job = await jobRes.json();

    // ---- Freelancer applies via the API ----
    const freelancer = makeUser("FREELANCER");
    await registerUserViaApi(request, freelancer);
    const freelancerLogin = await loginViaApi(request, freelancer);
    const applyRes = await request.post(
      "http://127.0.0.1:8000/api/applications/",
      {
        headers: { Authorization: `Bearer ${freelancerLogin.access}` },
        data: {
          job: job.id,
          cover_letter:
            "I would love to work on this project. I have relevant experience.",
          proposed_price: "950.00",
        },
      }
    );
    if (!applyRes.ok()) {
      throw new Error(
        `Failed to apply to job ${job.id}: ${applyRes.status()} ${await applyRes.text()}`
      );
    }

    // ---- Employer reviews and accepts via the UI ----
    await page.goto("/dashboard/applications");
    await expect(page.getByText(freelancer.username)).toBeVisible({
      timeout: 15_000,
    });

    const card = page.locator("div", { hasText: freelancer.username }).first();
    await card.getByRole("button", { name: /^accept$/i }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: /^accept$/i }).click();

    await expect(page.getByText(/accepted/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // ---- Verify the job moved to IN_PROGRESS ----
    await page.goto("/dashboard/jobs");
    const jobRow = page.locator("div", { hasText: jobTitle }).first();
    await expect(jobRow.getByText(/in progress/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});