/**
 * NotificationsPage — full notification feed.
 *
 * URL-driven filters:
 *   /dashboard/notifications?filter=unread
 *   /dashboard/notifications?type=NEW_MESSAGE
 *
 * Actions:
 *   - Click a row: mark read + navigate to its target.
 *   - Row action: mark read, dismiss.
 *   - Header: mark all read, clear read (deletes read notifications).
 *
 * Mobile:
 *   - Header buttons wrap and go full-width below the title.
 *   - Tabs and the type dropdown stack vertically on phones.
 *   - Card content truncates cleanly; action buttons move below the
 *     content on narrow screens instead of squeezing beside it.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Eraser, Filter } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import EmptyState from "../../components/dashboard/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { cn } from "../../utils/cn";
import { getNotificationMeta } from "../../components/notifications/notificationMeta";
import { notificationTarget } from "../../utils/notificationTarget";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import useUnreadNotifications from "../../hooks/useUnreadNotifications";
import { useAuth } from "../../context/AuthContext";
import {
  clearRead,
  deleteNotification,
  listNotifications,
  markAllRead,
  markRead,
} from "../../api/notifications";
import { extractErrorMessage } from "../../api/errors";
import { formatRelativeTime } from "../../utils/format";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "", label: "All" },
  { value: "unread", label: "Unread" },
];

const TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "NEW_APPLICATION", label: "Applications" },
  { value: "NEW_MESSAGE", label: "Messages" },
  { value: "NEW_REVIEW", label: "Reviews" },
];

export default function NotificationsPage() {
  const { params, setParam } = useQueryParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCount } = useUnreadNotifications();

  const page = parseInt(params.page || "1", 10) || 1;
  const filter = params.filter || "";
  const type = params.type || "";

  const apiParams = { page };
  if (filter === "unread") apiParams.is_read = false;
  if (type) apiParams.notif_type = type;

  const notifications = useFetch(
    () => listNotifications(apiParams),
    [JSON.stringify(apiParams)]
  );

  const items = notifications.data?.results ?? [];
  const total = notifications.data?.count ?? 0;

  const [busy, setBusy] = useState(false);

  async function handleClick(n) {
    if (!n.is_read) {
      markRead(n.id)
        .then(() => {
          refreshCount();
          notifications.refetch();
        })
        .catch(() => {});
    }
    const target = notificationTarget(n, user);
    if (target) {
      const url = target.query
        ? `${target.to}?${new URLSearchParams(target.query).toString()}`
        : target.to;
      navigate(url);
    }
  }

  async function handleMarkRead(n, e) {
    e.stopPropagation();
    try {
      await markRead(n.id);
      refreshCount();
      notifications.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not mark as read."));
    }
  }

  async function handleDismiss(n, e) {
    e.stopPropagation();
    if (!window.confirm("Dismiss this notification?")) return;
    try {
      await deleteNotification(n.id);
      refreshCount();
      notifications.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not dismiss."));
    }
  }

  async function handleMarkAllRead() {
    setBusy(true);
    try {
      await markAllRead();
      refreshCount();
      notifications.refetch();
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not mark all as read."));
    } finally {
      setBusy(false);
    }
  }

  async function handleClearRead() {
    if (
      !window.confirm(
        "Delete all read notifications? Unread ones will be kept."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await clearRead();
      refreshCount();
      notifications.refetch();
      toast.success(`Deleted ${res.deleted || 0} notification(s).`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not clear."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header — stacks vertically on phones, splits on tablet+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {notifications.loading
              ? "Loading…"
              : `${total} notification${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            <CheckCheck size={14} /> Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearRead}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            <Eraser size={14} /> Clear read
          </Button>
        </div>
      </div>

      {/* Filters — stack on phones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full sm:w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => setParam("filter", f.value)}
              aria-pressed={(filter || "") === f.value}
              className={cn(
                "flex-1 sm:flex-none px-3 h-9 text-sm rounded-lg transition-colors",
                (filter || "") === f.value
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={type}
            onChange={(e) => setParam("type", e.target.value)}
            className="h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus-ring w-full sm:w-auto"
            aria-label="Filter by type"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.value || "all"} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <ContentState
        loading={notifications.loading}
        error={notifications.error}
        isEmpty={
          !notifications.loading &&
          !notifications.error &&
          items.length === 0
        }
        onRetry={notifications.refetch}
        loadingLabel="Loading notifications"
        loadingFallback={
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Row key={i} />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={Bell}
            title={
              filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"
            }
            description={
              filter === "unread"
                ? "You're all caught up."
                : "When something happens — an application, a message, a review — it'll show up here."
            }
          />
        }
      >
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onClick={() => handleClick(n)}
              onMarkRead={(e) => handleMarkRead(n, e)}
              onDismiss={(e) => handleDismiss(n, e)}
            />
          ))}
        </div>

        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={(next) => setParam("page", next, { resetPage: false })}
        />
      </ContentState>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NotificationRow({ notification, onClick, onMarkRead, onDismiss }) {
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
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        !notification.is_read && "border-brand-300 dark:border-brand-800"
      )}
      onClick={onClick}
    >
      <CardBody className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            toneClasses[meta.tone] || toneClasses.neutral
          )}
        >
          <Icon size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={cn(
                    "text-sm truncate",
                    notification.is_read ? "font-medium" : "font-semibold"
                  )}
                >
                  {notification.title}
                </p>
                {!notification.is_read ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                ) : null}
              </div>
              {notification.message ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3 sm:line-clamp-none break-anywhere">
                  {notification.message}
                </p>
              ) : null}
              <p className="text-xs text-slate-400 mt-1">
                {formatRelativeTime(notification.created_at)} · {meta.label}
              </p>
            </div>
          </div>

          {/* Actions — row on tablet+, stacked on phone */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            {!notification.is_read ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkRead}
                aria-label="Mark as read"
                title="Mark as read"
              >
                <CheckCheck size={14} /> Mark read
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              aria-label="Dismiss"
              title="Dismiss"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}