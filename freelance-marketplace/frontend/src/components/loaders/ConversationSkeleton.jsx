import SkeletonBlock from "./SkeletonBlock";
import SkeletonCircle from "./SkeletonCircle";

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2.5">
      <SkeletonCircle size="md" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3 w-2/3" />
        <SkeletonBlock className="h-3 w-full" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
}