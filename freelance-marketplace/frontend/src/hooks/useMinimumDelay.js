/**
 * useMinimumDelay — keep a boolean true for at least `minMs` once set.
 *
 * When a value goes from false → true, we flip immediately.
 * When it goes from true → false, we hold it true for at least minMs.
 *
 * Both a named export and a default export are provided so the hook
 * can be imported either way:
 *   import { useMinimumDelay } from "./useMinimumDelay";
 *   import useMinimumDelay from "./useMinimumDelay";
 */

import { useEffect, useRef, useState } from "react";

export function useMinimumDelay(value, minMs = 500) {
  const [shown, setShown] = useState(value);
  const startedAt = useRef(value ? Date.now() : null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (value) {
      startedAt.current = Date.now();
      setShown(true);
      return;
    }

    if (startedAt.current == null) {
      setShown(false);
      return;
    }

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, minMs - elapsed);

    if (remaining === 0) {
      setShown(false);
    } else {
      timerRef.current = setTimeout(() => setShown(false), remaining);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, minMs]);

  return shown;
}

export default useMinimumDelay;