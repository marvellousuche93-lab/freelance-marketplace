/**
 * RouteAnnouncer — announces the page title to screen readers on
 * every route change.
 *
 * Renders a visually-hidden <div aria-live="polite"> that updates its
 * text whenever the location changes. Screen readers pick it up and
 * announce "…page loaded".
 *
 * The title comes from document.title, which we set via the <Seo />
 * component on each page.
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Give the SEO hook a tick to set document.title, then announce.
    const t = setTimeout(() => {
      setMessage(document.title || "Page loaded");
    }, 200);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}