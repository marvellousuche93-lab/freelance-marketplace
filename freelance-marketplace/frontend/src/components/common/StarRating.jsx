import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Renders 5 stars with the given average filled proportionally.
 * `value` is 0–5 (may be fractional). `count` is optional.
 * If `interactive` is true, `onChange` receives the clicked 1–5 value.
 */
export default function StarRating({
  value = 0,
  count,
  size = "sm",
  interactive = false,
  onChange,
  className,
}) {
  const stars = [1, 2, 3, 4, 5];
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const cls = sizes[size] || sizes.sm;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex" role={interactive ? "radiogroup" : undefined}>
        {stars.map((n) => {
          const filled = value >= n - 0.25;
          const Comp = interactive ? "button" : "span";
          return (
            <Comp
              key={n}
              type={interactive ? "button" : undefined}
              onClick={interactive ? () => onChange?.(n) : undefined}
              aria-label={interactive ? `${n} star${n > 1 ? "s" : ""}` : undefined}
              className={cn(
                interactive &&
                  "rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              )}
            >
              <Star
                className={cn(
                  cls,
                  filled ? "text-amber-500" : "text-slate-300 dark:text-slate-600"
                )}
                fill={filled ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </Comp>
          );
        })}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-slate-500 dark:text-slate-400">({count})</span>
      )}
    </span>
  );
}