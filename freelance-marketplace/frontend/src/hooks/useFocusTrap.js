/**
 * useFocusTrap — trap focus inside a container while it's active.
 *
 * Behavior:
 *   - On activation: moves focus to the first focusable element inside
 *     the container (or the container itself if none).
 *   - On Tab/Shift+Tab: cycles through focusable elements inside.
 *   - On deactivation: restores focus to whatever had focus before.
 *
 * Pass a ref to the container and a boolean `active`.
 *
 * This is intentionally a small, self-contained implementation. If you
 * ever need advanced cases (nested modals, portals, dynamic content),
 * swap in `focus-trap-react`.
 */

import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "details > summary",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    const previouslyFocused = document.activeElement;

    function focusFirst() {
      const focusable = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        node.setAttribute("tabindex", "-1");
        node.focus();
      }
    }

    function onKeyDown(e) {
      if (e.key !== "Tab") return;
      const focusable = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Move focus into the trap on activation.
    focusFirst();
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, active]);
}

export default useFocusTrap;