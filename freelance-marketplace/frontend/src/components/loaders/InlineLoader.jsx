/**
 * InlineLoader — a small spinner + label, sized for list rows and cards.
 */

import Spinner from "../ui/Spinner";
import { cn } from "../../utils/cn";

export default function InlineLoader({ label = "Loading…", className = "" }) {
  return (
    <div
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400",
        className
      )}
    >
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}