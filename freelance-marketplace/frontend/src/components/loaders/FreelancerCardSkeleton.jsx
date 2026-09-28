import SkeletonBlock from "./SkeletonBlock";
import SkeletonCircle from "./SkeletonCircle";

export function FreelancerCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <SkeletonCircle size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <SkeletonBlock className="h-5 w-16" rounded="full" />
        <SkeletonBlock className="h-5 w-16" rounded="full" />
        <SkeletonBlock className="h-5 w-16" rounded="full" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-20" rounded="full" />
      </div>
    </div>
  );
}

export function FreelancerGridSkeleton({
  count = 6,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <FreelancerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default FreelancerCardSkeleton;