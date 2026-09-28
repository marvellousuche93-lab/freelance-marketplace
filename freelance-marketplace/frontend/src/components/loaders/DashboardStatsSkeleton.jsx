import SkeletonBlock from "./SkeletonBlock";

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="h-11 w-11" rounded="lg" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function DashboardStatsSkeleton({
  count = 4,
  columns = "sm:grid-cols-2 lg:grid-cols-4",
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}