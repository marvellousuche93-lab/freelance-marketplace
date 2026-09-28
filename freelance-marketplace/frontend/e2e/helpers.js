/**
 * Shared helpers for E2E tests.
 *
 * Design note: users are created via the API, not via the UI. The
 * registration form has its own UX (loading state, redirect, toast), and
 * testing it end-to-end for every test setup would multiply timing
 * issues. We test the registration UI *once* (in its own test), and
 * every other test bootstraps users via the API. This is the standard
 * approach for E2E suites: use the UI for what you're testing, use the
 * API for everything else.
 */

/**
 * Generate a unique test user each run.
 */
export function makeUser(role = "FREELANCER") {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    username: `e2e_${role.toLowerCase()}_${id}`,
    email: `e2e_${id}@example.com`,
    password: "StrongPass123!",
    first_name: "E2E",
    last_name: role === "EMPLOYER" ? "Employer" : "Freelancer",
    role,
  };
}

const API_URL = "http://127.0.0.1:8000/api";

/**
 * Register a user directly against the API. Returns the user object.
 */
export async function registerUserViaApi(request, user) {
  const res = await request.post(`${API_URL}/auth/register/`, {
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
  if (!res.ok()) {
    throw new Error(
      `API register failed (${res.status()}): ${await res.text()}`
    );
  }
  return res.json();
}

/**
 * Get JWT tokens for an existing user via the API.
 * Returns { access, refresh, user }.
 */
export async function loginViaApi(request, user) {
  const res = await request.post(`${API_URL}/auth/login/`, {
    data: { username: user.username, password: user.password },
  });
  if (!res.ok()) {
    throw new Error(`API login failed (${res.status()}): ${await res.text()}`);
  }
  return res.json();
}

/**
 * Log a user into the browser by seeding tokens into localStorage,
 * then navigating to a page. This is the fastest way to "log in" a
 * browser session for E2E: no form, no redirect race, no timing issues.
 *
 * Must be called while the browser is on a same-origin page, because
 * localStorage is origin-scoped.
 */
export async function loginViaLocalStorage(page, request, user) {
  const { access, refresh } = await loginViaApi(request, user);
  await page.goto("/");
  await page.evaluate(
    ([access, refresh]) => {
      window.localStorage.setItem("fm_access", access);
      window.localStorage.setItem("fm_refresh", refresh);
    },
    [access, refresh]
  );
  // Reload so AuthProvider reads the tokens on mount.
  await page.reload();
}

/**
 * Log out by clearing tokens and reloading. Purely client-side, no UI
 * race.
 */
export async function logoutViaLocalStorage(page) {
  await page.evaluate(() => {
    window.localStorage.removeItem("fm_access");
    window.localStorage.removeItem("fm_refresh");
  });
  await page.goto("/");
  await page.reload();
}

/**
 * Select the first real option in an async-populated <select>.
 */
export async function selectFirstOption(page, labelRegex, friendlyName) {
  const select = page.getByLabel(labelRegex);
  await select.waitFor({ state: "visible", timeout: 10_000 });

  try {
    await page.waitForFunction(
      (el) => el && el.options && el.options.length > 1,
      await select.elementHandle(),
      { timeout: 15_000 }
    );
  } catch {
    throw new Error(
      `No ${friendlyName} appeared in the select within 15s. ` +
        `Check that the backend has been seeded (e.g. run ` +
        `\`python manage.py seed_if_empty\` in backend/).`
    );
  }

  const options = await select.locator("option").all();
  const value = await options[1].getAttribute("value");
  await select.selectOption(value);
  return value;
}