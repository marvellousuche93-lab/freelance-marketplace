/**
 * Avatar — round user avatar with initial-letter fallback.
 */

import { cn } from "../../utils/cn";

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export default function Avatar({
  user,
  size = "md",
  className = "",
  ring = false,
}) {
  const initial = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    "U"
  ).toUpperCase();

  return user?.profile_picture ? (
    <img
      src={user.profile_picture}
      alt=""
      className={cn(
        "rounded-full object-cover shrink-0",
        SIZES[size] || SIZES.md,
        ring && "ring-2 ring-white dark:ring-slate-900",
        className
      )}
    />
  ) : (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold shrink-0",
        SIZES[size] || SIZES.md,
        ring && "ring-2 ring-white dark:ring-slate-900",
        className
      )}
    >
      {initial}
    </div>
  );
}