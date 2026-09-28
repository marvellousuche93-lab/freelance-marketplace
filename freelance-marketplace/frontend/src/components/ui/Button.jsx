/**
 * Button — the primary interactive element.
 *
 * Variants: primary | secondary | ghost | outline | danger
 * Sizes:    sm | md | lg | icon
 */

import { forwardRef } from "react";

import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors " +
  "focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 " +
    "dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 " +
    "dark:text-slate-200 dark:hover:bg-slate-800",
  outline:
    "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 " +
    "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizes = {
  sm: "h-11 sm:h-8 px-3 text-sm",
  md: "h-11 sm:h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 sm:h-10 sm:w-10",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    as: Tag = "button",
    className = "",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <Tag
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </Tag>
  );
});

export default Button;