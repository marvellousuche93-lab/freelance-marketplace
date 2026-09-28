import SkeletonBlock from "./SkeletonBlock";
import SkeletonText from "./SkeletonText";

export function PortfolioCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="aspect-video w-full" rounded="sm" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonText lines={2} />
        <div className="flex gap-2">
          <SkeletonBlock className="h-5 w-14" rounded="full" />
          <SkeletonBlock className="h-5 w-14" rounded="full" />
          <SkeletonBlock className="h-5 w-14" rounded="full" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioGridSkeleton({
  count = 6,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PortfolioCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default PortfolioCardSkeleton;