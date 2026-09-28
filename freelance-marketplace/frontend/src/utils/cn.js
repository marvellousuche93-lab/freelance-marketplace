/**
 * cn — combine class names safely.
 *
 * Combines `clsx` (conditionals, arrays, objects) with `tailwind-merge`
 * (resolves conflicting utilities like `px-2 px-4` -> `px-4`).
 *
 * Usage:
 *   cn("base", isActive && "active", props.className)
 *   cn("px-2", "px-4")  // -> "px-4"
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}