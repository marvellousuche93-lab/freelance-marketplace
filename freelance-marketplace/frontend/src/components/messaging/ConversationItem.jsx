/**
 * ConversationItem — a single row in the conversation list.
 *
 * Shows the other participant, the last message preview, the relative
 * time, and an unread count badge.
 */

import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/format";

export default function ConversationItem({ conversation, active, onClick }) {
  const other = conversation.other_participant;
  const last = conversation.last_message;
  const unread = conversation.unread_count || 0;

  const preview = last
    ? last.body.length > 60
      ? last.body.slice(0, 60) + "…"
      : last.body
    : "No messages yet";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors rounded-lg",
        active
          ? "bg-brand-50 dark:bg-brand-950/50"
          : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
      )}
    >
      <Avatar user={other} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              unread > 0 ? "font-semibold" : "font-medium"
            )}
          >
            {displayName(other)}
          </p>
          {conversation.last_message_at ? (
            <span className="text-[10px] text-slate-400 shrink-0">
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              unread > 0
                ? "text-slate-700 dark:text-slate-200"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {preview}
          </p>
          {unread > 0 ? (
            <Badge variant="brand" className="shrink-0 px-1.5 py-0">
              {unread}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function displayName(user) {
  if (!user) return "Unknown";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || "Unknown";
}