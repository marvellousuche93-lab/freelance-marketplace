import SkeletonBlock from "./SkeletonBlock";
import SkeletonText from "./SkeletonText";

/**
 * A two-column detail layout: main column with a header + body, plus a sidebar card.
 */
export default function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="h-8 w-2/3" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <SkeletonBlock className="h-4 w-1/4" />
            <div className="mt-4">
              <SkeletonText lines={4} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <SkeletonBlock className="h-4 w-1/4" />
            <div className="mt-4">
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-3 w-2/3" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}