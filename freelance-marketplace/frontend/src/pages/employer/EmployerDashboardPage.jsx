/**
 * EmployerDashboardPage — overview for employers.
 *
 * Sections:
 *   - Greeting
 *   - Stats: posted jobs, open, applications received, pending
 *   - Company profile snapshot
 *   - Recent applications on your jobs
 *   - Quick actions: Post a Job, View all jobs
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  PlusCircle,
  Users,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import StatCard from "../../components/dashboard/StatCard";
import PageHeader from "../../components/dashboard/PageHeader";
import StatusBadge from "../../components/dashboard/StatusBadge";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { listMyJobs } from "../../api/jobs";
import { listReceivedApplications } from "../../api/applications";
import { getMyEmployerProfile } from "../../api/profiles";
import { formatRelativeTime } from "../../utils/format";

export default function EmployerDashboardPage() {
  const { user } = useAuth();

  const jobs = useFetch(() => listMyJobs(), []);
  const applications = useFetch(
    () => listReceivedApplications({ page: 1 }),
    []
  );
  const profile = useFetch(() => getMyEmployerProfile(), []);

  const jobList = jobs.data?.results ?? [];
  const appList = applications.data?.results ?? [];

  const stats = {
    totalJobs: jobs.data?.count ?? 0,
    open: jobList.filter((j) => j.status === "OPEN").length,
    inProgress: jobList.filter((j) => j.status === "IN_PROGRESS").length,
    totalApps: applications.data?.count ?? 0,
    pending: appList.filter((a) => a.status === "PENDING").length,
  };

  const greeting = getGreeting(user?.first_name || user?.username || "there");

  const statsLoading = jobs.loading || applications.loading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Manage your jobs and applications."
        actions={
          <Button as={Link} to="/dashboard/jobs/new">
            <PlusCircle size={16} /> Post a Job
          </Button>
        }
      />

      {/* Stats */}
      {statsLoading ? (
        <Skeleton.StatGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Briefcase}
            label="Posted jobs"
            value={stats.totalJobs}
            tone="brand"
            to="/dashboard/jobs"
          />
          <StatCard
            icon={CheckCircle2}
            label="Open jobs"
            value={stats.open}
            tone="success"
            to="/dashboard/jobs?status=OPEN"
          />
          <StatCard
            icon={Users}
            label="Applications"
            value={stats.totalApps}
            tone="info"
            to="/dashboard/applications"
          />
          <StatCard
            icon={Clock}
            label="Pending review"
            value={stats.pending}
            tone="warning"
            to="/dashboard/applications?status=PENDING"
          />
        </div>
      )}

      {/* Company profile nudge */}
      <CompanySnapshot profile={profile} />

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent applications</h2>
          <Link
            to="/dashboard/applications"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <ContentState
          loading={applications.loading}
          error={applications.error}
          isEmpty={
            !applications.loading &&
            !applications.error &&
            appList.length === 0
          }
          onRetry={applications.refetch}
          emptyTitle="No applications yet"
          emptyDescription="Once freelancers apply to your jobs, they'll appear here."
          loadingFallback={
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Row key={i} />
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {appList.slice(0, 5).map((app) => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </div>
        </ContentState>
      </section>
    </div>
  );
}

function ApplicationRow({ application }) {
  return (
    <Card>
      <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
        <Button
          as={Link}
          to="/dashboard/applications"
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          Review
        </Button>
      </CardBody>
    </Card>
  );
}

function CompanySnapshot({ profile }) {
  const p = profile.data;
  const loading = profile.loading;

  return (
    <Card>
      <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          ) : (
            <>
              <p className="font-medium">
                {p?.company_name || "Add your company name"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {p?.industry || "Set your industry"}
                {p?.company_size ? ` · ${formatCompanySize(p.company_size)}` : ""}
              </p>
            </>
          )}
        </div>
        <Button
          as={Link}
          to="/dashboard/profile"
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          View company profile
        </Button>
      </CardBody>
    </Card>
  );
}

function formatCompanySize(s) {
  const map = {
    SOLO: "1 (solo)",
    SMALL: "2-10",
    MEDIUM: "11-50",
    LARGE: "51-200",
    ENTERPRISE: "200+",
  };
  return map[s] || s;
}

function getGreeting(name) {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}`;
}