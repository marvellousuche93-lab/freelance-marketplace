/**
 * apiClient — a preconfigured axios instance for the Django API.
 *
 * Base URL is /api. In development, Vite proxies /api to Django on :8000;
 * in production, Django serves both the app and the API from the same
 * origin.
 *
 * Authentication:
 *   - Access token attached from localStorage on each request.
 *   - On 401 with an expired access token: try one refresh, then retry.
 *   - On refresh failure: clear tokens and emit "auth:logout".
 *
 * Development-only feature:
 *   When VITE_FAKE_LATENCY_MS is set, every request gets an artificial
 *   delay. Useful for seeing loading states during development.
 */

import axios from "axios";

const ACCESS_KEY = "fm_access";
const REFRESH_KEY = "fm_refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// ------------------------------------------------------------------
// Dev-only artificial latency
// ------------------------------------------------------------------
// Set VITE_FAKE_LATENCY_MS=600 in frontend/.env to make loaders visible
// while developing. Set to 0 or remove to disable.
const FAKE_LATENCY_MS = Number(import.meta.env.VITE_FAKE_LATENCY_MS || 0);
const IS_DEV = import.meta.env.DEV;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------------------------------------
// Request interceptor: delay (dev only) + attach Bearer token
// ------------------------------------------------------------------
apiClient.interceptors.request.use(async (config) => {
  if (IS_DEV && FAKE_LATENCY_MS > 0) {
    await delay(FAKE_LATENCY_MS);
  }
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------------
// Response interceptor: refresh-on-401 (single flight)
// ------------------------------------------------------------------
let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const url = original?.url || "";
    const isRefreshCall = url.includes("/auth/token/refresh");
    const isAuthCall =
      url.includes("/auth/login") || url.includes("/auth/register");

    if (status !== 401 || original._retry || isRefreshCall || isAuthCall) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) return Promise.reject(error);

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${import.meta.env.VITE_API_URL || "/api"}/auth/token/refresh/`,
            { refresh }
          )
          .then((r) => {
            setTokens({ access: r.data.access });
            return r.data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccess = await refreshPromise;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (refreshErr) {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(refreshErr);
    }
  }
);

export default apiClient;