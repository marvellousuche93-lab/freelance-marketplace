import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { AuthProvider, useAuth } from "./AuthContext";

// Mock the auth API module. Since AuthContext does not itself write
// tokens, the mocked login must also write to localStorage when the
// real one would. That keeps the test honest about the boundary.
vi.mock("../api/auth", async () => {
  const { setTokens } = await import("../api/client");
  return {
    login: vi.fn(async (creds) => {
      // Simulate a successful real login writing tokens.
      const data = {
        access: "a",
        refresh: "r",
        user: { id: 1, username: creds?.username || "jane", role: "FREELANCER" },
      };
      setTokens({ access: data.access, refresh: data.refresh });
      return data;
    }),
    register: vi.fn(),
    fetchMe: vi.fn(),
    updateMe: vi.fn(),
    logout: vi.fn(),
  };
});

import * as authApi from "../api/auth";
import { setTokens } from "../api/client";

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts anonymous if no token", async () => {
    authApi.fetchMe.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("hydrates user from /me when a token exists", async () => {
    setTokens({ access: "tkn" });
    authApi.fetchMe.mockResolvedValueOnce({
      id: 1,
      username: "jane",
      role: "FREELANCER",
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user.username).toBe("jane");
  });

  it("login() sets the user and the API writes tokens", async () => {
    authApi.fetchMe.mockResolvedValueOnce(null); // no existing session

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login({ username: "jane", password: "x" });
    });

    expect(result.current.user.username).toBe("jane");
    // The mocked authApi.login wrote these via setTokens.
    expect(localStorage.getItem("fm_access")).toBe("a");
    expect(localStorage.getItem("fm_refresh")).toBe("r");
  });

  it("logout() clears user and tokens", async () => {
    setTokens({ access: "a", refresh: "r" });
    authApi.fetchMe.mockResolvedValueOnce({
      id: 1,
      username: "jane",
      role: "FREELANCER",
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("fm_access")).toBeNull();
    expect(localStorage.getItem("fm_refresh")).toBeNull();
  });

  it("clears user on auth:logout event", async () => {
    setTokens({ access: "a" });
    authApi.fetchMe.mockResolvedValueOnce({
      id: 1,
      username: "jane",
      role: "FREELANCER",
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    });

    expect(result.current.user).toBeNull();
  });
});