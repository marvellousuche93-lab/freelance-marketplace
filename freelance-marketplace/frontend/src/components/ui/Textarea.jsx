/**
 * Textarea — styled multi-line input with label, error, and helper.
 *
 * Mirrors the API of <Input>. Text is a minimum 16px on mobile to
 * prevent iOS Safari from zooming in on focus.
 */

import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helper,
    rows = 4,
    id: idProp,
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = idProp || generatedId;

  const describedBy = [];
  if (error) describedBy.push(`${id}-error`);
  if (helper) describedBy.push(`${id}-helper`);

  return (
    <div className={cn("w-full", containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      ) : null}

      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy.length ? describedBy.join(" ") : undefined}
        className={cn(
          "w-full px-3 py-2.5 sm:py-2 rounded-lg border bg-white text-slate-900 placeholder-slate-400",
          "dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500",
          "focus-ring transition-colors resize-y",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 dark:border-slate-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!error && helper ? (
        <p
          id={`${id}-helper`}
          className="mt-1 text-xs text-slate-500 dark:text-slate-400"
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;