/**
 * Skeleton — shimmering placeholder shapes.
 *
 * Behaviour:
 *   - On /dashboard/* routes  → renders <BrandedLoader /> (logo + spinner)
 *   - On all other routes     → renders shimmering skeleton blocks
 *   - Outside a <Router>      → falls back to skeleton (safe in tests)
 *
 * Uses React Router's PUBLIC `useLocation` hook (stable in all v6 releases),
 * wrapped in a try/catch so it does not throw when rendered in tests or
 * outside a Router.
 */

import { useLocation } from "react-router-dom";

import { cn } from "../../utils/cn";
import BrandedLoader from "./BrandedLoader";

/**
 * Returns true if we are currently on a /dashboard/* route.
 * Returns false when there is no Router context (e.g. in tests).
 */
function useIsDashboard() {
  try {
    const { pathname } = useLocation();
    return pathname.startsWith("/dashboard");
  } catch {
    // No <Router> in the tree (tests, Storybook, etc.)
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Base block                                                          */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = "", circle = false, ...props }) {
  if (useIsDashboard()) return <BrandedLoader />;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-slate-200 dark:bg-slate-800",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "before:animate-shimmer",
        "dark:before:via-white/5",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

function Text({ lines = 3, className = "", lineClassName = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn(
            "h-3",
            i === lines - 1 ? "w-2/3" : "w-full",
            lineClassName
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const AVATAR_SIZES = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

function Avatar({ size = "md", className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <SkeletonBlock
      circle
      className={cn(AVATAR_SIZES[size] || AVATAR_SIZES.md, className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function Card({ className = "", withHeader = false, withFooter = false }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden",
        className
      )}
    >
      {withHeader ? (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      ) : null}
      <div className="p-5 space-y-3">
        <Text lines={3} />
        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>
      </div>
      {withFooter ? (
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

function Row({ className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
        className
      )}
    >
      <Avatar size="md" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
      <SkeletonBlock className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function Table({ rows = 5, columns = 4, className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden",
        className
      )}
    >
      <div
        className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <SkeletonBlock key={c} className="h-3 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat grid                                                           */
/* ------------------------------------------------------------------ */

function StatGrid({ count = 4, className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div
      aria-hidden="true"
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-4"
        >
          <SkeletonBlock className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-1/2" />
            <SkeletonBlock className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

function Detail({ className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div aria-hidden="true" className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="h-3 w-1/3" />
          </div>
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-2.5 w-1/2" />
                <SkeletonBlock className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <SkeletonBlock className="h-4 w-1/4" />
        <Text lines={5} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

function ChatList({ rows = 5, className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  return (
    <div aria-hidden="true" className={cn("space-y-1 p-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Avatar size="md" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBlock className="h-3.5 w-1/2" />
              <SkeletonBlock className="h-2.5 w-10 shrink-0" />
            </div>
            <SkeletonBlock className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatBubbles({ count = 6, className = "" }) {
  if (useIsDashboard()) return <BrandedLoader />;
  const widths = ["w-1/2", "w-2/5", "w-3/5", "w-1/3", "w-1/2", "w-2/5"];
  return (
    <div aria-hidden="true" className={cn("p-4 space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const mine = i % 2 === 1;
        return (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              mine ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar size="sm" />
            <SkeletonBlock
              className={cn(
                "h-10 rounded-2xl",
                mine ? "rounded-br-md" : "rounded-bl-md",
                widths[i % widths.length]
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function Skeleton(props) {
  return <SkeletonBlock {...props} />;
}

Skeleton.Text = Text;
Skeleton.Avatar = Avatar;
Skeleton.Card = Card;
Skeleton.Row = Row;
Skeleton.Table = Table;
Skeleton.StatGrid = StatGrid;
Skeleton.Detail = Detail;
Skeleton.ChatList = ChatList;
Skeleton.ChatBubbles = ChatBubbles;

export default Skeleton;