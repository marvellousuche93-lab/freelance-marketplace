/**
 * SavedJobsPage — freelancer's bookmarked jobs.
 */

import { useState } from "react";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";

import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import JobCard from "../../components/jobs/JobCard";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import { listBookmarks, removeBookmark } from "../../api/bookmarks";
import { extractErrorMessage } from "../../api/errors";

const PAGE_SIZE = 12;

export default function SavedJobsPage() {
  const { params, setParam } = useQueryParams();
  const page = parseInt(params.page || "1", 10) || 1;

  const bookmarks = useFetch(() => listBookmarks({ page }), [page]);
  const items = bookmarks.data?.results ?? [];
  const total = bookmarks.data?.count ?? 0;

  async function onRemove(bookmark) {
    if (
      !window.confirm(
        `Remove "${bookmark.job?.title}" from your saved jobs?`
      )
    ) {
      return;
    }
    try {
      await removeBookmark(bookmark.id);
      toast.success("Removed from saved jobs");
      bookmarks.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved jobs"
        description="Jobs you've bookmarked for later."
      />

      <ContentState
        loading={bookmarks.loading}
        error={bookmarks.error}
        isEmpty={!bookmarks.loading && !bookmarks.error && items.length === 0}
        onRetry={bookmarks.refetch}
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Card key={i} withHeader withFooter />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Bookmark jobs you're interested in, and they'll appear here."
            actionLabel="Browse jobs"
            actionTo="/jobs"
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((bm) => (
            <div key={bm.id} className="relative group">
              <JobCard job={bm.job} />
              <button
                type="button"
                onClick={() => onRemove(bm)}
                aria-label={`Remove ${bm.job?.title} from saved jobs`}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus-ring"
                title="Remove"
              >
                ×
              </button>
            </div>
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