/**
 * useLocalStorage — state that persists to localStorage.
 *
 * Usage:
 *   const [value, setValue] = useLocalStorage("key", initialValue);
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / disabled storage
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove];
}

export default useLocalStorage;