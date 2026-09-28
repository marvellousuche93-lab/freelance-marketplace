/**
 * Toggle — an accessible switch.
 */

import { cn } from "../../utils/cn";

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) {
  function toggle() {
    if (!disabled && onChange) onChange(!checked);
  }

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        {label ? (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium text-slate-900 dark:text-slate-100",
              disabled && "opacity-60"
            )}
          >
            {label}
          </label>
        ) : null}
        {description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label || "Toggle"}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-ring",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}