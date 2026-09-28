import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./LoginPage";
import { AuthProvider } from "../../context/AuthContext";

vi.mock("../../api/auth", () => ({
  fetchMe: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  register: vi.fn(),
  updateMe: vi.fn(),
  logout: vi.fn(),
}));
import * as authApi from "../../api/auth";

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>DASHBOARD</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.login.mockReset();
  });

  it("renders username and password fields", async () => {
    renderLogin();
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    );
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("submits and redirects on success", async () => {
    authApi.login.mockResolvedValueOnce({
      access: "a",
      refresh: "r",
      user: { id: 1, username: "jane", role: "FREELANCER" },
    });
    renderLogin();

    const user = userEvent.setup();
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/password/i), "StrongPass123!");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("DASHBOARD")).toBeInTheDocument());
  });

  it("shows an error message on failure", async () => {
    authApi.login.mockRejectedValueOnce({
      response: { data: { detail: "No active account found." } },
    });
    renderLogin();

    const user = userEvent.setup();
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(screen.getByText(/no active account found/i)).toBeInTheDocument()
    );
  });
});