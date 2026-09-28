/**
 * Auth endpoints.
 */

import apiClient, { clearTokens, setTokens } from "./client";

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register/", payload);
  return data;
}

export async function login({ username, password }) {
  const { data } = await apiClient.post("/auth/login/", { username, password });
  setTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get("/auth/me/");
  return data;
}

export async function updateMe(payload) {
  const { data } = await apiClient.patch("/auth/me/", payload);
  return data;
}

export function logout() {
  clearTokens();
}