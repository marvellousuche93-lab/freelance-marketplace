import SkeletonBlock from "./SkeletonBlock";

/**
 * Full-page fallback for React.lazy route transitions.
 * Renders a neutral page header and a placeholder grid.
 */
export default function SuspenseFallback() {
  return (
    <div className="container-page space-y-6 py-8">
      <SkeletonBlock className="h-8 w-1/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-40 w-full" rounded="lg" />
        ))}
      </div>
    </div>
  );
}