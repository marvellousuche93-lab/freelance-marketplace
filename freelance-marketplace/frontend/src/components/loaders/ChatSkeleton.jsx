import SkeletonBlock from "./SkeletonBlock";

export function MessageBubbleSkeleton({ own = false }) {
  return (
    <div className={own ? "flex justify-end" : "flex justify-start"}>
      <SkeletonBlock
        className={own ? "h-12 w-48" : "h-12 w-56"}
        rounded="lg"
      />
    </div>
  );
}

export function ChatSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <MessageBubbleSkeleton key={i} own={i % 2 === 1} />
      ))}
    </div>
  );
}