import SkeletonBlock from "./SkeletonBlock";
import SkeletonCircle from "./SkeletonCircle";

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-4 w-2/3" />
          <div className="mt-3 flex items-center gap-2">
            <SkeletonCircle size="xs" />
            <SkeletonBlock className="h-3 w-1/3" />
          </div>
        </div>
        <SkeletonBlock className="h-6 w-20" rounded="full" />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-16" />
      </div>

      <div className="mt-4 flex gap-2">
        <SkeletonBlock className="h-5 w-16" rounded="full" />
        <SkeletonBlock className="h-5 w-16" rounded="full" />
        <SkeletonBlock className="h-5 w-16" rounded="full" />
      </div>
    </div>
  );
}

export function JobListSkeleton({ count = 6, columns = "md:grid-cols-2" }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default JobCardSkeleton;