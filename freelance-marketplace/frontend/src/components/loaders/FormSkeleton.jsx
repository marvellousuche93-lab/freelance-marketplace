import SkeletonBlock from "./SkeletonBlock";
import SkeletonText from "./SkeletonText";

/**
 * Form placeholder: one or more cards, each with a title and a stack of inputs.
 */
export default function FormSkeleton({ cards = 3 }) {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-6 w-40" />
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <SkeletonBlock className="h-4 w-1/4" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}