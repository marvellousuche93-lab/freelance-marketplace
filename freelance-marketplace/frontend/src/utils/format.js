/**
 * Formatting helpers used across the app.
 */

export function formatRelativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((then - now) / 1000); // negative

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), "month");
  return rtf.format(Math.round(diffSec / 31536000), "year");
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Human-friendly date label for message separators.
 * Today / Yesterday / "Mar 5, 2025".
 */
export function formatDayLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    year: now.getFullYear() === d.getFullYear() ? undefined : "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Is two ISO timestamps on the same calendar day?
 */
export function sameDay(aIso, bIso) {
  if (!aIso || !bIso) return false;
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMoney(value) {
  if (value == null) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export function formatBudget(job) {
  if (!job) return "—";
  if (job.min_budget == null) return "Budget TBD";
  if (job.budget_type === "FIXED_PRICE") {
    return formatMoney(job.min_budget);
  }
  return `${formatMoney(job.min_budget)}–${formatMoney(job.max_budget)}/hr`;
}

export function formatStatus(status) {
  const map = {
    DRAFT: "Draft",
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CLOSED: "Closed",
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
    FULL_TIME: "Full time",
    PART_TIME: "Part time",
    NOT_AVAILABLE: "Not available",
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    EXPERT: "Expert",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
    FIXED_PRICE: "Fixed price",
    HOURLY: "Hourly",
  };
  return map[status] || status;
}

export function statusVariant(status) {
  const map = {
    OPEN: "success",
    IN_PROGRESS: "warning",
    COMPLETED: "info",
    CLOSED: "default",
    DRAFT: "default",
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "danger",
    WITHDRAWN: "default",
  };
  return map[status] || "default";
}