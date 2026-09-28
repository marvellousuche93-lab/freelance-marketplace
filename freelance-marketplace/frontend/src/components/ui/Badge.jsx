/**
 * Badge — small status pill.
 *
 * Variants: default | brand | success | warning | danger | info
 */

import { cn } from "../../utils/cn";

const variants = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand:
    "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  info:
    "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
};

export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}