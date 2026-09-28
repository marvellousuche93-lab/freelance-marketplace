import SkeletonBlock from "./SkeletonBlock";

/**
 * Table skeleton.
 * Props:
 *   rows:     number of body rows (default 5)
 *   columns:  number of columns (default 5)
 */
export default function TableSkeleton({ rows = 5, columns = 5 }) {
  const gridTemplate = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"
        style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: "1rem" }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 w-2/3" />
        ))}
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-4 py-3"
            style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: "1rem" }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <SkeletonBlock
                key={c}
                className={
                  c === 0
                    ? "h-3 w-3/4"
                    : c === columns - 1
                    ? "h-3 w-12 justify-self-end"
                    : "h-3 w-2/3"
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}