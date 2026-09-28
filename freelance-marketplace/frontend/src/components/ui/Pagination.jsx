/**
 * Pagination — page navigation with prev/next and numbered pages.
 *
 * Wraps on small screens. Uses a small window of page numbers around
 * the current page, with ellipses for gaps.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../utils/cn";

export default function Pagination({ page, total, pageSize, onChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const pages = buildPageList(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-6 flex-wrap"
    >
      <PageButton
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            active={p === page}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </PageButton>
    </nav>
  );
}

function PageButton({ active = false, disabled = false, className = "", ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-brand-600 text-white"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

function buildPageList(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) pages.add(2);
  if (current >= total - 2) pages.add(total - 1);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}