import SkeletonBlock from "./SkeletonBlock";
import { cn } from "@/utils/cn";

/**
 * A stack of text lines. The last line is shorter by default for a natural look.
 */
export default function SkeletonText({ lines = 3, widths, className }) {
  const defaultWidths = ["w-full", "w-11/12", "w-10/12", "w-3/4", "w-2/3"];
  const list =
    widths ||
    Array.from({ length: lines }, (_, i) => defaultWidths[i % defaultWidths.length]);

  return (
    <div className={cn("space-y-2", className)}>
      {list.map((w, i) => (
        <SkeletonBlock key={i} className={cn("h-3", w)} />
      ))}
    </div>
  );
}