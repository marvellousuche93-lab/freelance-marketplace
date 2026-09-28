import SkeletonBlock from "./SkeletonBlock";
import SkeletonText from "./SkeletonText";

/**
 * Generic card: optional image, title, some lines, optional footer.
 */
export default function CardSkeleton({
  withImage = false,
  lines = 3,
  withFooter = false,
  className,
}) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 " +
        (className || "")
      }
    >
      {withImage && (
        <SkeletonBlock className="mb-4 aspect-video w-full" rounded="lg" />
      )}
      <SkeletonBlock className="h-4 w-2/3" />
      <div className="mt-3">
        <SkeletonText lines={lines} />
      </div>
      {withFooter && (
        <div className="mt-4 flex justify-end gap-2">
          <SkeletonBlock className="h-8 w-20" rounded="lg" />
          <SkeletonBlock className="h-8 w-24" rounded="lg" />
        </div>
      )}
    </div>
  );
}