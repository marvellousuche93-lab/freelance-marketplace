/**
 * BrandedLoader — logo mark + circular spinner + message.
 *
 * Location:  frontend/src/components/loaders/BrandedLoader.jsx
 *
 * Usage:
 *   <BrandedLoader />                                  // inline section loader
 *   <BrandedLoader size="lg" label="Loading jobs…" />  // larger, custom label
 *   <BrandedLoader fullPage />                         // centers in viewport
 *
 * The circular ring is rendered inline (not via Spinner) so it stays
 * visible in every theme and on every background. Spinner is still used
 * for small inline button states elsewhere.
 *
 * Accessibility:
 *   - role="status" + aria-live="polite" announces loading to screen readers
 *   - The visible label is the accessible name
 */

import LogoMark from "../brand/LogoMark";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: {
    logo: 36,
    ring: "w-10 h-10 border-2",
    label: "text-xs",
    gap: "gap-3",
    pad: "py-8",
  },
  md: {
    logo: 56,
    ring: "w-14 h-14 border-[3px]",
    label: "text-sm",
    gap: "gap-5",
    pad: "py-16 sm:py-20",
  },
  lg: {
    logo: 80,
    ring: "w-20 h-20 border-4",
    label: "text-base",
    gap: "gap-6",
    pad: "py-20 sm:py-28",
  },
};

export default function BrandedLoader({
  label = "Loading",
  sublabel,
  size = "md",
  logoSize,
  fullPage = false,
  className = "",
}) {
  const s = SIZES[size] || SIZES.md;
  const resolvedLogoSize = logoSize ?? s.logo;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "w-full flex flex-col items-center justify-center px-6",
        s.gap,
        s.pad,
        fullPage && "min-h-[60vh]",
        "text-slate-500 dark:text-slate-400",
        className
      )}
    >
      {/* Logo mark with soft brand glow + breathing animation */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-brand-500/25 blur-2xl animate-pulse"
        />
        <div className="relative animate-[breathe_2.4s_ease-in-out_infinite]">
          <LogoMark size={resolvedLogoSize} />
        </div>
      </div>

      {/* Circular spinner — visible ring, brand colored, bright top arc */}
      <div
        aria-hidden="true"
        className={cn(
          "inline-block rounded-full",
          "border-solid border-brand-500/25 border-t-brand-500",
          "animate-spin",
          s.ring
        )}
      />

      {/* Message */}
      <div className="text-center space-y-1 max-w-xs">
        <p
          className={cn(
            "font-medium text-slate-700 dark:text-slate-300",
            s.label
          )}
        >
          {label}
        </p>
        {sublabel ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {sublabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}