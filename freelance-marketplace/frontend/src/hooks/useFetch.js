/**
 * useFetch — data-fetching hook with a guaranteed minimum loading time.
 *
 * Why the minimum loading time: on a local server an API call can
 * resolve in 20 ms, faster than the eye can see. Without a floor, the
 * loader appears and disappears before anyone notices. This hook holds
 * the loading state on for at least `minLoadingMs` once it starts.
 *
 * The `data` still arrives as soon as the request finishes — only the
 * `loading` flag is delayed.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(
 *     () => listJobs({ page }),
 *     [page]
 *   );
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { extractErrorMessage } from "../api/errors";
import { useMinimumDelay } from "./useMinimumDelay";

export function useFetch(fetcher, deps = [], { minLoadingMs = 500 } = {}) {
  const [data, setData] = useState(null);
  const [rawLoading, setRawLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track the latest request so stale responses don't overwrite fresh data.
  const requestId = useRef(0);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setRawLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (id === requestId.current && mounted.current) {
        setData(result);
      }
    } catch (err) {
      if (id === requestId.current && mounted.current) {
        setError(extractErrorMessage(err, "Something went wrong."));
      }
    } finally {
      if (id === requestId.current && mounted.current) {
        setRawLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
      requestId.current++;
    };
  }, [run]);

  // Hold the loader visible for at least minLoadingMs.
  const loading = useMinimumDelay(rawLoading, minLoadingMs);

  return { data, loading, error, refetch: run };
}

export default useFetch;