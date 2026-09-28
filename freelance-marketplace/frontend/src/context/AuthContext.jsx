/**
 * AuthContext — global authentication state.
 *
 * Exposes: user, loading, login, register, logout, refreshUser.
 *
 * On mount, if a token exists in localStorage, it calls /auth/me/ to
 * hydrate the user object. Otherwise the app stays anonymous.
 *
 * Listens for the "auth:logout" event dispatched by apiClient when a
 * refresh fails, and clears state accordingly.
 *
 * Design note: `logout` clears tokens itself rather than delegating to
 * the API module. The auth state and its tokens are owned by this
 * context, so it clears everything it owns — even if the API module is
 * replaced, stubbed, or removed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as authApi from "../api/auth";
import { clearTokens, getAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track mount state so late async results don't try to update an
  // unmounted provider (a common source of subtle bugs).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------- Hydrate on mount --------
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();

      // No token → anonymous, done. Flip loading immediately so
      // ProtectedRoute doesn't flash the branded loader for nothing.
      if (!token) {
        if (!cancelled && mountedRef.current) setLoading(false);
        return;
      }

      try {
        const me = await authApi.fetchMe();
        if (cancelled || !mountedRef.current) return;
        setUser(me);
      } catch {
        // The apiClient interceptor already tried a refresh. If we're
        // here, the token is unusable. Clear and stay anonymous.
        clearTokens();
        if (cancelled || !mountedRef.current) return;
        setUser(null);
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------- React to forced logout from apiClient --------
  useEffect(() => {
    function onForcedLogout() {
      clearTokens();
      setUser(null);
    }
    window.addEventListener("auth:logout", onForcedLogout);
    return () => window.removeEventListener("auth:logout", onForcedLogout);
  }, []);

  // -------- Actions --------
  const login = useCallback(async (credentials) => {
    // authApi.login writes tokens on success.
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    // Register does not return tokens; log in the newly created user
    // immediately afterward so they land on their dashboard.
    await authApi.register(payload);
    const data = await authApi.login({
      username: payload.username,
      password: payload.password,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    // Clear tokens here, not in the API module. This makes logout work
    // even if the API module is stubbed or replaced.
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}