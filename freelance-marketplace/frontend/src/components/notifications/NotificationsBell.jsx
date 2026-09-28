/**
 * NotificationsBell — bell icon + unread badge + dropdown peek.
 *
 * - Click the bell to toggle the dropdown.
 * - Dropdown shows the 5 most recent notifications.
 * - Clicking a notification navigates to its target and marks it read.
 * - "Mark all as read" is available in the dropdown footer.
 * - Clicking outside closes the dropdown.
 *
 * Polls the unread count via useUnreadNotifications.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatRelativeTime } from "../../utils/format";
import {
  getNotificationMeta,
} from "./notificationMeta";
import { notificationTarget } from "../../utils/notificationTarget";
import useUnreadNotifications from "../../hooks/useUnreadNotifications";
import {
  listNotifications,
  markAllRead,
  markRead,
} from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../api/errors";

export default function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { count, refresh } = useUnreadNotifications();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const ref = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Load the peek when opening.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    listNotifications({ page: 1 })
      .then((data) => {
        if (cancelled) return;
        setItems((data.results || []).slice(0, 5));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err, "Could not load notifications."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function onClickNotification(n) {
    setOpen(false);

    // Mark read (fire and forget; refresh on success).
    if (!n.is_read) {
      markRead(n.id).then(() => {
        refresh();
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
        );
      }).catch(() => {});
    }

    // Navigate if we have a target.
    const target = notificationTarget(n, user);
    if (target) {
      const url = target.query
        ? `${target.to}?${new URLSearchParams(target.query).toString()}`
        : target.to;
      navigate(url);
    }
  }

  async function onMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllRead();
      refresh();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not mark all as read."));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          count > 0 ? `${count} unread notifications` : "Notifications"
        }
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus-ring"
      >
        <Bell size={18} />
        {count > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden animate-fade-in z-40"
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="font-semibold text-sm">Notifications</p>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={markingAll || count === 0}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAll ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCheck size={12} />
              )}
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                <Loader2 size={16} className="animate-spin mr-2" /> Loading…
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet.
              </div>
            ) : (
              items.map((n) => (
                <PeekRow
                  key={n.id}
                  notification={n}
                  onClick={() => onClickNotification(n)}
                />
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-sm text-brand-600 hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PeekRow({ notification, onClick }) {
  const meta = getNotificationMeta(notification.notif_type);
  const Icon = meta.icon;

  const toneClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300",
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
    info: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-b-0",
        notification.is_read
          ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          : "bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/40"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          toneClasses[meta.tone] || toneClasses.neutral
        )}
      >
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm truncate",
            notification.is_read ? "font-medium" : "font-semibold"
          )}
        >
          {notification.title}
        </p>
        {notification.message ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        ) : null}
        <p className="text-[10px] text-slate-400 mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {!notification.is_read ? (
        <span
          aria-label="Unread"
          className="mt-2 w-2 h-2 rounded-full bg-brand-500 shrink-0"
        />
      ) : null}
    </button>
  );
}