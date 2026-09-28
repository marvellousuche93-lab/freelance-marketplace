/**
 * Register and login UI — the only E2E test that exercises these forms.
 */

import { test, expect } from "@playwright/test";
import { makeUser } from "./helpers";

test.describe("Auth UI", () => {
  test("a new freelancer can register and lands on the dashboard", async ({ page }) => {
    const user = makeUser("FREELANCER");

    await page.goto("/register");

    await page.getByRole("button", { name: /i'm a freelancer/i }).click();
    await page.getByLabel(/first name/i).fill(user.first_name);
    await page.getByLabel(/last name/i).fill(user.last_name);
    await page.getByLabel(/^username$/i).fill(user.username);
    await page.getByLabel(/^email$/i).fill(user.email);
    await page.getByLabel(/^password$/i).fill(user.password);
    await page.getByLabel(/confirm password/i).fill(user.password);

    await page.getByRole("button", { name: /create account/i }).click();

    // The dashboard redirect is what we're testing.
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
    await expect(
      page.getByRole("link", { name: /notifications/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("a registered user can log in", async ({ page, request }) => {
    const user = makeUser("FREELANCER");

    // Create the user directly via API so we don't re-test registration.
    const res = await request.post("http://127.0.0.1:8000/api/auth/register/", {
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
        password_confirm: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
    expect(res.ok()).toBeTruthy();

    // Now test the login UI.
    await page.goto("/login");
    await page.getByLabel(/username/i).fill(user.username);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole("button", { name: /log in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  });
});