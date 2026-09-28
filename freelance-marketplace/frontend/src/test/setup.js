/**
 * Global test setup. Runs once before every test file.
 *
 * - Imports jest-dom matchers so `toBeInTheDocument`, etc. work.
 * - Silences React Router's future warnings (they're noise in tests).
 * - Cleans up between tests so state doesn't leak.
 * - Fails loudly if a test accidentally hits the network.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

// React Router emits "future flag" warnings that clutter test output.
const origWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("React Router Future Flag")
  ) {
    return;
  }
  origWarn(...args);
};

// Fail loudly if a test accidentally makes a real network call.
vi.stubGlobal(
  "fetch",
  vi.fn(() => Promise.reject(new Error("Real fetch called in test")))
);