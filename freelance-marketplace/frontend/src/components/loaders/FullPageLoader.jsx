/**
 * FullPageLoader — a centered spinner filling the viewport.
 */

import Spinner from "../ui/Spinner";
import { cn } from "../../utils/cn";

export default function FullPageLoader({
  label = "Loading",
  sublabel,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "min-h-[60vh] w-full flex flex-col items-center justify-center gap-4",
        "text-slate-500 dark:text-slate-400",
        className
      )}
    >
      <Spinner size="lg" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {sublabel ? <p className="text-xs opacity-80">{sublabel}</p> : null}
      </div>
    </div>
  );
}