/**
 * Spinner — a minimal circular loading ring.
 *
 * The ring rotates indefinitely and inherits `color` from its parent
 * (use `className="text-brand-500"` or similar to set the color).
 *
 * Sizes: xs | sm | md | lg | xl
 *
 * Accessibility: exposes role="status" with an aria-label and a visually
 * hidden text node, so screen readers announce "Loading" once. The visible
 * ring is decorative.
 */

import { cn } from "@/utils/cn";

const SIZES = {
  xs: "h-3 w-3 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-4",
};

export default function Spinner({
  size = "md",
  className,
  label = "Loading",
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block rounded-full border-current border-t-transparent animate-spin",
          SIZES[size] || SIZES.md
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}