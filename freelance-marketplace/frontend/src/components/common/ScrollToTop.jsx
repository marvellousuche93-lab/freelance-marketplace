import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * On every route change:
 * - scrolls the window to the top
 * - moves focus to the first heading inside <main>, or the main element itself,
 *   so screen readers begin reading the new page
 *
 * Renders nothing.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    const main = document.getElementById("main-content");
    if (!main) return;

    const timer = setTimeout(() => {
      const heading = main.querySelector("h1, h2, [role='heading']");
      if (heading && typeof heading.focus === "function") {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      } else {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}