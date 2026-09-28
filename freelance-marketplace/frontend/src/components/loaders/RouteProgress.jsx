/**
 * RouteProgress — shows TopProgressBar briefly on every route change.
 *
 * Mounted once near the app root (see src/App.jsx).
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import TopProgressBar from "./TopProgressBar";

export default function RouteProgress() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), 400);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  return <TopProgressBar active={active} />;
}