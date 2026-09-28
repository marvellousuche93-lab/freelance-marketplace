/**
 * ReceivedApplicationsPage — employer reviews applications on their jobs.
 *
 * URL-driven status filter: /dashboard/applications?status=PENDING
 * Actions: accept, reject, view job.
 *
 * Uses GET /api/applications/received/ — the employer-scoped list
 * (applications on jobs the current user owns).
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Inbox, Search, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import StatusBadge from "../../components/dashboard/StatusBadge";
import EmptyState from "../../components/dashboard/EmptyState";
import useFetch from "../../hooks/useFetch";
import useQueryParams from "../../hooks/useQueryParams";
import {
  acceptApplication,
  listReceivedApplications,
  rejectApplication,
} from "../../api/applications";
import { extractErrorMessage } from "../../api/errors";
import { formatRelativeTime, formatMoney } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const PAGE_SIZE = 10;

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

export default function ReceivedApplicationsPage() {
  const { user } = useAuth();
  const { params, setParam } = useQueryParams();
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10) || 1;
  const search = (params.search || "").trim().toLowerCase();

  // Guard: only employers should see this page.
  const isEmployer = user?.role === "EMPLOYER";

  const applications = useFetch(
    () =>
      isEmployer
        ? listReceivedApplications({ page })
        : Promise.resolve({ results: [], count: 0 }),
    [page, isEmployer]
  );

  const all = applications.data?.results ?? [];
  const filtered = all.filter((a) => {
    if (status && a.status !== status) return false;
    if (
      search &&
      !(
        (a.freelancer_username || "").toLowerCase().includes(search) ||
        (a.job_title || "").toLowerCase().includes(search)
      )
    ) {
      return false;
    }
    return true;
  });

  const total = applications.data?.count ?? 0;

  // Confirmation dialog state
  const [action, setAction] = useState(null); // { type: "accept"|"reject", application }

  async function confirmAction() {
    if (!action) return;
    const { type, application } = action;
    try {
      if (type === "accept") await acceptApplication(application.id);
      else await rejectApplication(application.id);
      toast.success(
        type === "accept" ? "Application accepted." : "Application rejected."
      );
      setAction(null);
      applications.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update."));
    }
  }

  // If a freelancer lands here, show a friendly redirect-style message.
  if (!isEmployer) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Applications"
          description="This page shows applications received on your jobs."
        />
        <EmptyState
          icon={Inbox}
          title="Employers only"
          description="You are signed in as a freelancer. To see the applications you've submitted, go to My Applications."
          actionLabel="My Applications"
          actionTo="/dashboard/applications"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review candidates for your jobs."
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
            placeholder="Search by freelancer or job title…"
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
        isEmpty={
          !applications.loading &&
          !applications.error &&
          filtered.length === 0
        }
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
            icon={Inbox}
            title={
              status || search
                ? "No applications match"
                : "No applications yet"
            }
            description={
              status || search
                ? "Try clearing the filters above."
                : "Once freelancers apply to your jobs, they'll appear here."
            }
          />
        }
      >
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onAccept={() => setAction({ type: "accept", application: app })}
              onReject={() => setAction({ type: "reject", application: app })}
            />
          ))}
        </div>

        {!status && !search ? (
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(next) => setParam("page", next, { resetPage: false })}
          />
        ) : null}
      </ContentState>

      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={
          action?.type === "accept"
            ? "Accept application?"
            : "Reject application?"
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action?.type === "accept" ? "primary" : "danger"}
              onClick={confirmAction}
            >
              {action?.type === "accept" ? "Accept" : "Reject"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {action?.type === "accept" ? (
            <>
              You are about to accept{" "}
              <strong>{action?.application?.freelancer_username}</strong>
              's application for{" "}
              <strong>{action?.application?.job_title}</strong>. The job will
              move to <em>In Progress</em>.
            </>
          ) : (
            <>
              You are about to reject{" "}
              <strong>{action?.application?.freelancer_username}</strong>
              's application for{" "}
              <strong>{action?.application?.job_title}</strong>.
            </>
          )}
        </p>
      </Modal>
    </div>
  );
}

function ApplicationCard({ application, onAccept, onReject }) {
  const isPending = application.status === "PENDING";

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium truncate">
                {application.freelancer_username}
              </h3>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Applied to{" "}
              <span className="font-medium">{application.job_title}</span> ·{" "}
              {formatRelativeTime(application.created_at)}
            </p>
          </div>
          <span className="text-sm font-semibold shrink-0">
            {formatMoney(application.proposed_price)}
            {application.estimated_duration
              ? ` · ${application.estimated_duration}`
              : ""}
          </span>
        </div>

        {application.cover_letter ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Show cover letter
            </summary>
            <p className="mt-2 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {application.cover_letter}
            </p>
          </details>
        ) : null}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Button
            as={Link}
            to={`/jobs/${application.job_slug}`}
            variant="ghost"
            size="sm"
          >
            View job
          </Button>
          {isPending ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
              >
                <XCircle size={14} /> Reject
              </Button>
              <Button size="sm" onClick={onAccept}>
                <CheckCircle2 size={14} /> Accept
              </Button>
            </>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}