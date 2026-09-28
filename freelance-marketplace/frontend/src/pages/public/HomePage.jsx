/**
 * HomePage — public landing page.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Code2,
  Palette,
  PenTool,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card, { CardBody, CardFooter, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import JobCard from "../../components/jobs/JobCard";
import Seo from "../../components/seo/Seo";
import useFetch from "../../hooks/useFetch";
import { listJobs } from "../../api/jobs";
import { listCategories } from "../../api/categories";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "../../components/seo/siteDefaults";

const CATEGORY_ICONS = {
  code: Code2,
  palette: Palette,
  "pen-tool": PenTool,
  smartphone: Sparkles,
  terminal: Code2,
  search: Search,
  "bar-chart-3": Sparkles,
  shield: Shield,
  briefcase: Briefcase,
  video: Sparkles,
};

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const jobs = useFetch(() => listJobs({ page: 1 }), []);
  const categories = useFetch(() => listCategories(), []);

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/jobs?search=${encodeURIComponent(q)}` : "/jobs");
  }

  return (
    <div>
      <Seo
        title={`${SITE_NAME} — ${SITE_TAGLINE}`}
        description={SITE_DESCRIPTION}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          url: import.meta.env.VITE_SITE_URL || undefined,
          potentialAction: {
            "@type": "SearchAction",
            target: `${import.meta.env.VITE_SITE_URL || ""}/jobs?search={query}`,
            "query-input": "required name=query",
          },
        }}
      />

      {/* -------- Hero -------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-950/40 dark:to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 pt-12 sm:pt-16 lg:pt-24 pb-10 sm:pb-12 lg:pb-16 text-center">
          <Badge variant="brand" className="mb-5">
            <Sparkles size={12} className="mr-1" /> Freelance & Job Marketplace
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Find great work.
            <br className="hidden sm:inline" /> Hire great people.
          </h1>

          <p className="mt-4 sm:mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Post a job, browse talent, apply, chat, review — everything you
            need to run projects, in one place.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-6 sm:mt-8 max-w-xl mx-auto flex items-stretch gap-1.5 sm:gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center pl-2 sm:pl-3 text-slate-400 shrink-0">
              <Search size={18} />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs…"
              aria-label="Search jobs"
              className="flex-1 min-w-0 bg-transparent outline-none px-2 text-sm sm:text-base placeholder-slate-400"
            />
            <Button type="submit" className="shrink-0 px-3 sm:px-4">
              <Search size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </form>

          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3">
            <Link
              to="/freelancers"
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline-offset-4 hover:underline"
            >
              Or browse freelancers →
            </Link>
          </div>
        </div>
      </section>

      {/* -------- Categories -------- */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12">
        <SectionHeader
          title="Popular categories"
          subtitle="Explore work by field."
          link={{ to: "/jobs", label: "All jobs" }}
        />

        {categories.loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardBody className="flex items-center gap-3">
                  <Skeleton.Avatar size="md" />
                  <Skeleton className="h-4 flex-1" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : categories.error ? (
          <ErrorInline message={categories.error} onRetry={categories.refetch} />
        ) : (categories.data?.results?.length ?? 0) === 0 ? (
          <EmptyInline message="No categories yet. Admins can seed them from Django admin." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.data.results.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Briefcase;
              return (
                <Link
                  key={cat.id}
                  to={`/jobs?category__slug=${cat.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all group-hover:border-brand-400 group-hover:shadow-md">
                    <CardBody className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <span className="font-medium text-sm truncate">
                        {cat.name}
                      </span>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* -------- Latest jobs -------- */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12">
        <SectionHeader
          title="Latest jobs"
          subtitle="Fresh opportunities from employers."
          link={{ to: "/jobs", label: "View all →" }}
        />

        {jobs.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Card key={i} withHeader withFooter />
            ))}
          </div>
        ) : jobs.error ? (
          <ErrorInline message={jobs.error} onRetry={jobs.refetch} />
        ) : (jobs.data?.results?.length ?? 0) === 0 ? (
          <EmptyJobs />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.data.results.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* -------- How it works -------- */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12">
        <SectionHeader
          title="How it works"
          subtitle="Two ways to use the marketplace."
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-brand-600" />
                <h3 className="font-semibold">For freelancers</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Step n={1} text="Create your profile and portfolio." />
              <Step n={2} text="Browse jobs and save the ones you like." />
              <Step
                n={3}
                text="Apply with a cover letter and a proposed price."
              />
              <Step n={4} text="Chat, deliver work, and collect reviews." />
            </CardBody>
            <CardFooter>
              <Button as={Link} to="/register" variant="outline" size="sm">
                Start freelancing
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-brand-600" />
                <h3 className="font-semibold">For employers</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Step n={1} text="Set up your company profile." />
              <Step
                n={2}
                text="Post a job with a budget and required skills."
              />
              <Step
                n={3}
                text="Review applications and message candidates."
              />
              <Step n={4} text="Accept, collaborate, and leave a review." />
            </CardBody>
            <CardFooter>
              <Button as={Link} to="/register" variant="outline" size="sm">
                Post a job
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* -------- Final CTA -------- */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 pb-16 sm:pb-20">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-none">
          <CardBody className="py-8 sm:py-10 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to get started?
            </h2>
            <p className="text-brand-50/90 max-w-xl mx-auto text-sm sm:text-base">
              Sign up in seconds. Post a job or apply to one — it's free.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                as={Link}
                to="/register"
                variant="secondary"
                size="lg"
                className="bg-white text-brand-700 hover:bg-slate-100"
              >
                Create an account <ArrowRight size={16} />
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, link }) {
  return (
    <div className="flex items-end justify-between mb-5 gap-3">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        ) : null}
      </div>
      {link ? (
        <Link
          to={link.to}
          className="text-sm text-brand-600 hover:underline shrink-0"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}

function Step({ n, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-semibold shrink-0">
        {n}
      </span>
      <span>{text}</span>
    </div>
  );
}

function ErrorInline({ message, onRetry }) {
  return (
    <Card>
      <CardBody className="text-center py-8 space-y-3">
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

function EmptyInline({ message }) {
  return (
    <Card>
      <CardBody className="text-center py-8 text-slate-500 dark:text-slate-400">
        {message}
      </CardBody>
    </Card>
  );
}

function EmptyJobs() {
  return (
    <Card>
      <CardBody className="text-center py-10 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
          <Briefcase size={20} />
        </div>
        <p className="font-medium">No open jobs yet.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Employers can post the first job after signing up.
        </p>
      </CardBody>
    </Card>
  );
}