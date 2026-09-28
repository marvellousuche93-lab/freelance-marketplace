/**
 * useDebounce — debounce a value by a delay.
 *
 * Commonly used for search inputs: pass the raw query, get back a value
 * that only changes after the user has stopped typing for `delay` ms.
 */

import { useEffect, useState } from "react";

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;