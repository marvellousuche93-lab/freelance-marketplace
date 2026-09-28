/**
 * useUnreadNotifications — poll the unread count.
 *
 * Returns { count, loading, error, refresh }.
 *
 * Polls every `intervalMs` (default 30 s) while the user is authenticated.
 * Cleans up on unmount and stops on auth:logout.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { unreadCount as fetchUnreadCount } from "../api/notifications";
import { useAuth } from "../context/AuthContext";

const DEFAULT_INTERVAL = 30_000;

export function useUnreadNotifications(intervalMs = DEFAULT_INTERVAL) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(false);

  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }
    try {
      const n = await fetchUnreadCount();
      if (!cancelledRef.current) {
        setCount(n);
        setError(false);
      }
    } catch {
      if (!cancelledRef.current) setError(true);
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cancelledRef.current = false;

    if (!user) {
      setCount(0);
      setLoading(false);
      return () => {
        cancelledRef.current = true;
      };
    }

    refresh();

    timerRef.current = setInterval(refresh, intervalMs);

    const onLogout = () => {
      clearInterval(timerRef.current);
      setCount(0);
    };
    window.addEventListener("auth:logout", onLogout);

    return () => {
      cancelledRef.current = true;
      clearInterval(timerRef.current);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [user, intervalMs, refresh]);

  return { count, loading, error, refresh };
}

export default useUnreadNotifications;