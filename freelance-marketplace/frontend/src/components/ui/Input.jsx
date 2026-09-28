/**
 * Input — text input with label, error, and helper text.
 *
 * Touch-friendly on mobile: 44px tall on small screens, 40px on sm+.
 */

import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
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

      <input
        ref={ref}
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy.length ? describedBy.join(" ") : undefined}
        className={cn(
          "w-full h-11 sm:h-10 px-3 rounded-lg border bg-white text-slate-900 placeholder-slate-400",
          "dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500",
          "focus-ring transition-colors",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 dark:border-slate-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
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

export default Input;