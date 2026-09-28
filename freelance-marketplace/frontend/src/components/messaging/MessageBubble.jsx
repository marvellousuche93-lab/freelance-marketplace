/**
 * MessageBubble — a single message in a thread.
 *
 * `mine` controls alignment and color. `pending` shows a subtle
 * "sending" state for optimistic messages.
 */

import Avatar from "../ui/Avatar";
import { cn } from "../../utils/cn";
import { formatTime } from "../../utils/format";

export default function MessageBubble({ message, mine, pending = false }) {
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        mine ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar user={message.sender} size="sm" />
      <div className={cn("max-w-[75%] flex flex-col", mine && "items-end")}>
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words",
            mine
              ? "bg-brand-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-bl-md",
            pending && "opacity-70"
          )}
        >
          {message.body}
        </div>
        <span className="text-[10px] text-slate-400 mt-0.5 px-1">
          {pending ? "Sending…" : formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}