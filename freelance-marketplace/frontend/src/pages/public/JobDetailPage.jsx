/**
 * JobDetailPage — full view of a single job.
 *
 * Route: /jobs/:slug
 *
 * Layout:
 *   Desktop (lg+): main column left, action/employer sidebar right.
 *   Mobile (< lg): sidebar appears FIRST (so Apply is reachable), then
 *   the job description and related jobs below.
 *
 * SEO: sets a page-specific title, description, canonical, and JobPosting
 * structured data (JSON-LD) for rich search results.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import ApplyModal from "../../components/jobs/ApplyModal";
import JobCard from "../../components/jobs/JobCard";
import MessageButton from "../../components/messaging/MessageButton";
import Seo from "../../components/seo/Seo";
import { SITE_NAME } from "../../components/seo/siteDefaults";
import useFetch from "../../hooks/useFetch";
import { getJob, listJobs } from "../../api/jobs";
import {
  addBookmark,
  checkBookmark,
  removeBookmark,
} from "../../api/bookmarks";
import { useAuth } from "../../context/AuthContext";
import {
  formatBudget,
  formatDate,
  formatRelativeTime,
  formatStatus,
  statusVariant,
} from "../../utils/format";

export default function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const job = useFetch(() => getJob(slug), [slug]);

  // Related jobs (same category).
  const [related, setRelated] = useState({ loading: false, jobs: [] });
  useEffect(() => {
    if (!job.data?.category?.slug) return;
    setRelated({ loading: true, jobs: [] });
    listJobs({ category__slug: job.data.category.slug, page: 1 })
      .then((data) => {
        const list = (data.results || []).filter((j) => j.id !== job.data.id);
        setRelated({ loading: false, jobs: list.slice(0, 3) });
      })
      .catch(() => setRelated({ loading: false, jobs: [] }));
  }, [job.data]);

  // Apply modal
  const [applyOpen, setApplyOpen] = useState(false);

  // Bookmark state
  const [bookmark, setBookmark] = useState({
    loading: false,
    bookmarked: false,
    bookmarkId: null,
  });

  useEffect(() => {
    if (!user || !job.data) return;
    let cancelled = false;
    checkBookmark(job.data.id)
      .then((data) => {
        if (!cancelled) {
          setBookmark({
            loading: false,
            bookmarked: data.bookmarked,
            bookmarkId: data.bookmark_id,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, job.data]);

  async function toggleBookmark() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!job.data) return;
    try {
      if (bookmark.bookmarked) {
        await removeBookmark(bookmark.bookmarkId);
        setBookmark({ loading: false, bookmarked: false, bookmarkId: null });
        toast.success("Removed from saved jobs");
      } else {
        const created = await addBookmark(job.data.id);
        setBookmark({
          loading: false,
          bookmarked: true,
          bookmarkId: created.id,
        });
        toast.success("Saved to your jobs");
      }
    } catch {
      toast.error("Could not update bookmark.");
    }
  }

  function onApplyClick() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (user.role !== "FREELANCER") return;
    setApplyOpen(true);
  }

  // Hide the "Message employer" button for the employer themselves.
  const showMessageButton =
    job.data?.employer && job.data.employer.id !== user?.id;

  // ---- SEO ----
  const seoTitle = job.data
    ? `${job.data.title} — ${job.data.category?.name || "Job"} | ${SITE_NAME}`
    : `Job | ${SITE_NAME}`;
  const seoDescription = job.data
    ? truncate(job.data.description, 160)
    : "View job details on the Freelance Marketplace.";

  const jsonLd = job.data
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.data.title,
        description: job.data.description,
        datePosted: job.data.created_at,
        validThrough: job.data.deadline || undefined,
        employmentType: "CONTRACTOR",
        hiringOrganization: job.data.employer
          ? {
              "@type": "Organization",
              name:
                job.data.employer.employer_profile?.company_name ||
                job.data.employer.username,
              sameAs:
                job.data.employer.employer_profile?.company_website || undefined,
            }
          : undefined,
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.data.location || "Remote",
          },
        },
        jobLocationType:
          job.data.remote_status === "REMOTE" ? "TELECOMMUTE" : undefined,
        industry: job.data.category?.name,
        skills: (job.data.skills || []).map((s) => s.name).join(", ") || undefined,
        ...(job.data.min_budget && job.data.max_budget
          ? {
              baseSalary: {
                "@type": "MonetaryAmount",
                currency: "USD",
                value: {
                  "@type": "QuantitativeValue",
                  minValue: Number(job.data.min_budget),
                  maxValue: Number(job.data.max_budget),
                  unitText: job.data.budget_type === "HOURLY" ? "HOUR" : "JOB",
                },
              },
            }
          : {}),
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/jobs/${slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />

      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
      >
        <ArrowLeft size={14} /> Back to jobs
      </Link>

      <ContentState
        loading={job.loading}
        error={job.error}
        isEmpty={false}
        onRetry={job.refetch}
        loadingFallback={<Skeleton.Detail />}
      >
        {job.data ? (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Sidebar — first on mobile, second on desktop */}
            <aside className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
              <Card>
                <CardBody className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={onApplyClick}
                    disabled={
                      user?.role === "EMPLOYER" || job.data.status !== "OPEN"
                    }
                  >
                    {user?.role === "EMPLOYER"
                      ? "Employers can't apply"
                      : job.data.status !== "OPEN"
                      ? "Applications closed"
                      : "Apply now"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={toggleBookmark}
                    disabled={bookmark.loading}
                  >
                    {bookmark.bookmarked ? (
                      <>
                        <BookmarkCheck size={16} /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} /> Save job
                      </>
                    )}
                  </Button>

                  {showMessageButton ? (
                    <MessageButton
                      userId={job.data.employer.id}
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      Message employer
                    </MessageButton>
                  ) : null}

                  {!user ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      <Link to="/login" className="underline">
                        Log in
                      </Link>{" "}
                      to apply, save, or message.
                    </p>
                  ) : null}
                </CardBody>
              </Card>

              {job.data.employer ? (
                <Card>
                  <CardHeader>
                    <h2 className="font-semibold">About the employer</h2>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="flex items-center gap-3">
                      {job.data.employer.profile_picture ? (
                        <img
                          src={job.data.employer.profile_picture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
                          {job.data.employer.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {job.data.employer.employer_profile?.company_name ||
                            job.data.employer.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {job.data.employer.employer_profile?.industry ||
                            "Employer"}
                        </p>
                      </div>
                    </div>

                    {job.data.employer.employer_profile?.company_description ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {job.data.employer.employer_profile.company_description}
                      </p>
                    ) : null}

                    <Button
                      as={Link}
                      to={`/freelancers/${job.data.employer.username}`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      View employer profile
                    </Button>
                  </CardBody>
                </Card>
              ) : null}
            </aside>

            {/* Main column — second on mobile, first on desktop */}
            <div className="space-y-6 order-2 lg:order-1 min-w-0">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                        {job.data.title}
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span>{job.data.category?.name}</span>
                        {job.data.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {job.data.location}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          Posted {formatRelativeTime(job.data.created_at)}
                        </span>
                      </p>
                    </div>
                    <Badge variant={statusVariant(job.data.status)}>
                      {formatStatus(job.data.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Meta
                      icon={DollarSign}
                      label="Budget"
                      value={formatBudget(job.data)}
                    />
                    <Meta
                      icon={Briefcase}
                      label="Type"
                      value={
                        job.data.budget_type === "HOURLY"
                          ? "Hourly"
                          : "Fixed price"
                      }
                    />
                    <Meta
                      icon={Calendar}
                      label="Deadline"
                      value={
                        job.data.deadline ? formatDate(job.data.deadline) : "None"
                      }
                    />
                  </div>

                  {job.data.skills?.length ? (
                    <div>
                      <h2 className="text-sm font-semibold mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {job.data.skills.map((s) => (
                          <Badge key={s.id} variant="info">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h2 className="text-sm font-semibold mb-2">Description</h2>
                    <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {job.data.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoLine
                      label="Experience level"
                      value={formatStatus(job.data.experience_level)}
                    />
                    <InfoLine
                      label="Workplace"
                      value={formatStatus(job.data.remote_status)}
                    />
                  </div>
                </CardBody>
              </Card>

              {related.jobs.length > 0 || related.loading ? (
                <section>
                  <h2 className="text-lg font-semibold mb-3">Similar jobs</h2>
                  {related.loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton.Card key={i} withHeader withFooter />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {related.jobs.map((j) => (
                        <JobCard key={j.id} job={j} />
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
            </div>
          </div>
        ) : null}
      </ContentState>

      {job.data ? (
        <ApplyModal
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          job={job.data}
        />
      ) : null}
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}