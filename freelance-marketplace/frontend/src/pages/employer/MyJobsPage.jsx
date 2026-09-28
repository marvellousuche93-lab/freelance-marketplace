/**
 * MyJobsPage — the employer's posted jobs.
 *
 * URL-driven status filter: /dashboard/jobs?status=OPEN
 * Search on title via URL: /dashboard/jobs?search=react
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Edit3,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import StatusBadge from "../../components/dashboard/StatusBadge";
import EmptyState from "../../components/dashboard/EmptyState";
import Modal from "../../components/ui/Modal";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import { listMyJobs, deleteJob } from "../../api/jobs";
import { extractErrorMessage } from "../../api/errors";
import { formatBudget, formatRelativeTime } from "../../utils/format";
import { cn } from "../../utils/cn";

const TABS = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CLOSED", label: "Closed" },
];

export default function MyJobsPage() {
  const { params, setParam } = useQueryParams();
  const status = params.status || "";
  const search = (params.search || "").trim().toLowerCase();

  const jobs = useFetch(() => listMyJobs(), []);
  const all = jobs.data?.results ?? [];

  const filtered = useMemo(() => {
    let list = all;
    if (status) list = list.filter((j) => j.status === status);
    if (search) list = list.filter((j) => j.title.toLowerCase().includes(search));
    return list;
  }, [all, status, search]);

  const [toDelete, setToDelete] = useState(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteJob(toDelete.slug);
      toast.success("Job deleted.");
      setToDelete(null);
      jobs.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete job."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My jobs"
        description="Manage every job you've posted."
        actions={
          <Button as={Link} to="/dashboard/jobs/new">
            <PlusCircle size={16} /> Post a Job
          </Button>
        }
      />

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {TABS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              onClick={() => setParam("status", t.value)}
              aria-pressed={(status || "") === t.value}
              className={cn(
                "px-3 h-8 text-sm rounded-lg transition-colors",
                (status || "") === t.value
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-stretch gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0">
          <div className="flex items-center pl-2 text-slate-400 shrink-0">
            <Search size={16} />
          </div>
          <input
            type="search"
            value={params.search || ""}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="Search by title…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm px-1"
            aria-label="Search jobs"
          />
          {params.search ? (
            <button
              type="button"
              onClick={() => setParam("search", "")}
              aria-label="Clear search"
              className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <ContentState
        loading={jobs.loading}
        error={jobs.error}
        isEmpty={!jobs.loading && !jobs.error && filtered.length === 0}
        onRetry={jobs.refetch}
        loadingFallback={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.Row key={i} />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={Briefcase}
            title={
              status || search ? "No jobs match" : "You haven't posted any jobs yet"
            }
            description={
              status || search
                ? "Try clearing the filters above."
                : "Post your first job and start receiving applications."
            }
            actionLabel={!status && !search ? "Post a Job" : undefined}
            actionTo="/dashboard/jobs/new"
          />
        }
      >
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobRow key={job.id} job={job} onDelete={() => setToDelete(job)} />
          ))}
        </div>
      </ContentState>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this job?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Deleting <span className="font-semibold">{toDelete?.title}</span> is
          permanent. Applications on it will also be removed.
        </p>
      </Modal>
    </div>
  );
}

function JobRow({ job, onDelete }) {
  const canEdit = job.status !== "COMPLETED" && job.status !== "CLOSED";

  return (
    <Card>
      <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/jobs/${job.slug}`}
              className="font-medium truncate hover:text-brand-600"
            >
              {job.title}
            </Link>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatBudget(job)} · Posted{" "}
            {formatRelativeTime(job.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            as={Link}
            to={`/jobs/${job.slug}`}
            variant="ghost"
            size="sm"
          >
            View
          </Button>
          {canEdit ? (
            <Button
              as={Link}
              to={`/dashboard/jobs/${job.slug}/edit`}
              variant="outline"
              size="sm"
            >
              <Edit3 size={14} /> Edit
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label={`Delete ${job.title}`}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}