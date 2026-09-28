/**
 * DelayedLoader — render a loader only if `loading` lasts longer than `delay`.
 *
 * Prevents the "flash of spinner" for sub-300ms responses. Most of the
 * time, showing nothing is better UX than showing a spinner for 80ms.
 *
 * Usage:
 *   <DelayedLoader loading={isLoading} delay={250}>
 *     <FullPageLoader />
 *   </DelayedLoader>
 */

import { useEffect, useState } from "react";

export default function DelayedLoader({ loading, delay = 250, children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShow(true), delay);
    } else {
      setShow(false);
    }
    return () => clearTimeout(timer);
  }, [loading, delay]);

  if (!loading) return null;
  if (!show) return null;
  return children;
}