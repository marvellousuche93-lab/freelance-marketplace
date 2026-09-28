import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../api/auth", () => ({
  fetchMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  updateMe: vi.fn(),
  logout: vi.fn(),
}));
import * as authApi from "../api/auth";
import { setTokens } from "../api/client";

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<div>SECRET</div>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="EMPLOYER" />}>
              <Route path="/employer-only" element={<div>EMPLOYER ONLY</div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("guards", () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.fetchMe.mockReset();
  });

  it("anonymous user hitting /secret is sent to /login", async () => {
    renderApp("/secret");
    await waitFor(() => expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument());
  });

  it("authenticated freelancer can reach /secret", async () => {
    setTokens({ access: "a" });
    authApi.fetchMe.mockResolvedValueOnce({
      id: 1, username: "jane", role: "FREELANCER",
    });
    renderApp("/secret");
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });

  it("freelancer is blocked from /employer-only", async () => {
    setTokens({ access: "a" });
    authApi.fetchMe.mockResolvedValueOnce({
      id: 1, username: "jane", role: "FREELANCER",
    });
    renderApp("/employer-only");
    await waitFor(() => {
      expect(screen.queryByText("EMPLOYER ONLY")).not.toBeInTheDocument();
    });
  });
});