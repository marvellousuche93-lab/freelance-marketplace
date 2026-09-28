/**
 * MyApplicationsPage — freelancer's list of applications.
 *
 * URL-driven tab: /dashboard/applications?status=PENDING
 * Also supports ?search= (client-side, on job title).
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, X } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import StatusBadge from "../../components/dashboard/StatusBadge";
import EmptyState from "../../components/dashboard/EmptyState";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import {
  listMyApplications,
  withdrawApplication,
} from "../../api/applications";
import { extractErrorMessage } from "../../api/errors";
import { formatRelativeTime } from "../../utils/format";
import { cn } from "../../utils/cn";

const PAGE_SIZE = 10;

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export default function MyApplicationsPage() {
  const { params, setParam } = useQueryParams();

  const status = params.status || "";
  const page = parseInt(params.page || "1", 10) || 1;
  const search = (params.search || "").trim().toLowerCase();

  const applications = useFetch(
    () => listMyApplications({ page }),
    [page]
  );

  const all = applications.data?.results ?? [];
  const filtered = useMemo(() => {
    let list = all;
    if (status) list = list.filter((a) => a.status === status);
    if (search) {
      list = list.filter((a) =>
        (a.job_title || "").toLowerCase().includes(search)
      );
    }
    return list;
  }, [all, status, search]);

  const total = applications.data?.count ?? 0;

  async function onWithdraw(app) {
    if (!window.confirm(`Withdraw your application to "${app.job_title}"?`)) {
      return;
    }
    try {
      await withdrawApplication(app.id);
      toast.success("Application withdrawn.");
      applications.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not withdraw."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My applications"
        description="Track every job you've applied to."
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
            placeholder="Search by job title…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm px-1"
            aria-label="Search applications"
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
        loading={applications.loading}
        error={applications.error}
        isEmpty={!applications.loading && !applications.error && filtered.length === 0}
        onRetry={applications.refetch}
        loadingFallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton.Row key={i} />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={FileText}
            title={
              status || search
                ? "No applications match"
                : "No applications yet"
            }
            description={
              status || search
                ? "Try clearing the filters above."
                : "Browse jobs and apply to start your freelancing journey."
            }
            actionLabel={!status && !search ? "Browse jobs" : undefined}
            actionTo="/jobs"
          />
        }
      >
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onWithdraw={onWithdraw}
            />
          ))}
        </div>

        {/* Pagination only makes sense when no client-side filtering is active */}
        {!status && !search ? (
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(next) => setParam("page", next, { resetPage: false })}
          />
        ) : null}
      </ContentState>
    </div>
  );
}

function ApplicationCard({ application, onWithdraw }) {
  const canWithdraw = application.status === "PENDING";

  return (
    <Card>
      <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{application.job_title}</h3>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Applied {formatRelativeTime(application.created_at)} · Proposed $
            {Number(application.proposed_price).toLocaleString()}
            {application.estimated_duration
              ? ` · ${application.estimated_duration}`
              : ""}
          </p>
          {application.decided_at ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Decision made {formatRelativeTime(application.decided_at)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            as={Link}
            to={`/jobs/${application.job_slug}`}
            variant="ghost"
            size="sm"
          >
            View job
          </Button>
          {canWithdraw ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWithdraw(application)}
            >
              Withdraw
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}