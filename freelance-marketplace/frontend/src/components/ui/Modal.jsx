/**
 * Modal — a controlled dialog overlay.
 *
 * - Escape closes.
 * - Backdrop click closes.
 * - Traps focus inside the panel while open.
 * - Restores focus to the previously focused element on close.
 * - Locks body scroll while open.
 *
 * Mobile:
 *   - Panel opens near the top on phones so tall content scrolls
 *     naturally instead of being cut off by the keyboard.
 *   - Content area scrolls independently of the header/footer.
 *   - Footer buttons wrap if they don't fit on one line.
 */

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "../../utils/cn";
import Button from "./Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  useFocusTrap(panelRef, open);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const titleId = typeof title === "string" ? "modal-title" : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={cn(
          "relative w-full max-h-[92dvh] flex flex-col rounded-2xl bg-white shadow-xl outline-none my-2 sm:my-0",
          "dark:bg-slate-900 dark:border dark:border-slate-800",
          sizes[size],
          className
        )}
      >
        {title ? (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h2
              id={titleId}
              className="text-base sm:text-lg font-semibold truncate"
            >
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </Button>
          </div>
        ) : null}

        <div className="px-4 sm:px-5 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}