import SkeletonBlock from "./SkeletonBlock";

export function NotificationSkeleton({ compact = false }) {
  return (
    <div
      className={`flex items-start gap-3 ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      }`}
    >
      <SkeletonBlock className="h-9 w-9 shrink-0" rounded="lg" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3 w-2/3" />
        {!compact && <SkeletonBlock className="h-3 w-full" />}
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 6, compact = false }) {
  return (
    <div className={compact ? "" : "space-y-3"}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}