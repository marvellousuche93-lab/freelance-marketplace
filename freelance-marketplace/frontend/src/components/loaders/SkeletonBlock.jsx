import { cn } from "@/utils/cn";

/**
 * Low-level skeleton primitive. Everything else in this folder composes it.
 *
 * Props:
 *   as:       element type (default "div")
 *   rounded:  "sm" | "md" | "lg" | "full" (default "md")
 *   className: extra classes — control width/height via Tailwind
 */
export default function SkeletonBlock({
  as: As = "div",
  rounded = "md",
  className,
  ...props
}) {
  const radius = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  return (
    <As
      aria-hidden="true"
      className={cn("skeleton", radius, className)}
      {...props}
    />
  );
}