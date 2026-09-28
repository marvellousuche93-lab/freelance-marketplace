/**
 * Spinner — accessible circular loading indicator.
 *
 * Visual pattern:
 *   - Full ring in a faded version of the current text color (border-current/20)
 *   - Bright arc on top in the full current text color (border-t-current)
 *   - Rotates via Tailwind's built-in animate-spin
 *
 * This pattern is guaranteed visible on any background (light, dark, colored)
 * because it inherits `currentColor` from the button's text color.
 */

import { cn } from "../../utils/cn";

const sizes = {
  xs: "w-3 h-3 border-2",
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-7 w-7 border-[3px]",
  xl: "w-10 h-10 border-4",
};

export default function Spinner({
  size = "md",
  className = "",
  label = "Loading",
  ...props
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full",
        "border-solid border-current/20 border-t-current",
        "animate-spin",
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}