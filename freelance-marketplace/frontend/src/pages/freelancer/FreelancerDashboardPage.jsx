/**
 * FreelancerDashboardPage — overview for freelancers.
 *
 * Sections:
 *   - Greeting + profile snapshot
 *   - Stats: applications, pending, accepted, saved jobs
 *   - Recent applications (up to 5)
 *   - Unread notifications count
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CheckCircle2,
  Clock,
  FileText,
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
import { listMyApplications } from "../../api/applications";
import { listBookmarks } from "../../api/bookmarks";
import { unreadCount as fetchUnreadCount } from "../../api/notifications";
import { getMyFreelancerProfile } from "../../api/profiles";
import { formatRelativeTime } from "../../utils/format";

export default function FreelancerDashboardPage() {
  const { user } = useAuth();

  const applications = useFetch(() => listMyApplications({ page: 1 }), []);
  const bookmarks = useFetch(() => listBookmarks({ page: 1 }), []);
  const notifications = useFetch(() => fetchUnreadCount(), []);
  const profile = useFetch(() => getMyFreelancerProfile(), []);

  const apps = applications.data?.results ?? [];

  const stats = {
    total: applications.data?.count ?? 0,
    pending: apps.filter((a) => a.status === "PENDING").length,
    accepted: apps.filter((a) => a.status === "ACCEPTED").length,
    saved: bookmarks.data?.count ?? 0,
  };

  const greeting = getGreeting(user?.first_name || user?.username || "there");

  const statsLoading = applications.loading || bookmarks.loading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Here's what's happening with your freelancing."
      />

      {/* Stats */}
      {statsLoading ? (
        <Skeleton.StatGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={FileText}
            label="Total applications"
            value={stats.total}
            tone="brand"
            to="/dashboard/applications"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            tone="warning"
            to="/dashboard/applications?status=PENDING"
          />
          <StatCard
            icon={CheckCircle2}
            label="Accepted"
            value={stats.accepted}
            tone="success"
            to="/dashboard/applications?status=ACCEPTED"
          />
          <StatCard
            icon={Bookmark}
            label="Saved jobs"
            value={stats.saved}
            tone="info"
            to="/dashboard/saved-jobs"
          />
        </div>
      )}

      {/* Profile completion nudge */}
      <ProfileSnapshot profile={profile} />

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
          isEmpty={!applications.loading && !applications.error && apps.length === 0}
          onRetry={applications.refetch}
          emptyTitle="No applications yet"
          emptyDescription="Browse jobs and apply to start your freelancing journey."
          loadingFallback={
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Row key={i} />
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {apps.slice(0, 5).map((app) => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </div>
        </ContentState>
      </section>

      {/* Notifications summary */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Activity</h2>
          <Link
            to="/dashboard/notifications"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            Notifications <ArrowRight size={14} />
          </Link>
        </div>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center">
              <Bell size={18} />
            </div>
            {notifications.loading ? (
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  {notifications.data ?? 0} unread notification
                  {notifications.data === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {notifications.data > 0
                    ? "Tap to see what's new."
                    : "You're all caught up."}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ApplicationRow({ application }) {
  return (
    <Card>
      <CardBody className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{application.job_title}</h3>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Applied {formatRelativeTime(application.created_at)} · Proposed $
            {Number(application.proposed_price).toLocaleString()}
          </p>
        </div>
        <Button
          as={Link}
          to={`/jobs/${application.job_slug}`}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          View job
        </Button>
      </CardBody>
    </Card>
  );
}

function ProfileSnapshot({ profile }) {
  const p = profile.data;
  const loading = profile.loading;

  const completion = computeCompletion(p);

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
                {p?.professional_title || "Add your professional title"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {p?.hourly_rate
                  ? `$${Number(p.hourly_rate).toLocaleString()}/hr`
                  : "Set your hourly rate"}{" "}
                · {completion}% complete
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
          View profile
        </Button>
      </CardBody>
    </Card>
  );
}

function computeCompletion(p) {
  if (!p) return 0;
  const fields = [
    p.professional_title,
    p.hourly_rate,
    p.experience_years,
    p.education,
    p.languages,
    p.linkedin_url || p.github_url || p.twitter_url,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function getGreeting(name) {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}`;
}