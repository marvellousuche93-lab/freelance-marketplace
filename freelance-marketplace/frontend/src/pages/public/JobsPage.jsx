/**
 * JobsPage — browse, search, filter, and paginate jobs.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import JobCard from "../../components/jobs/JobCard";
import JobFilters from "../../components/jobs/JobFilters";
import Seo from "../../components/seo/Seo";
import { SITE_NAME } from "../../components/seo/siteDefaults";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import useQueryParams from "../../hooks/useQueryParams";
import { listJobs } from "../../api/jobs";
import { listCategories } from "../../api/categories";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "-min_budget", label: "Highest budget" },
  { value: "min_budget", label: "Lowest budget" },
  { value: "deadline", label: "Deadline (soonest)" },
];

export default function JobsPage() {
  const { params, setParam, setParams, clearAll } = useQueryParams();

  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    if ((params.search || "") === debouncedSearch) return;
    setParam("search", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const fromUrl = params.search || "";
    if (fromUrl !== searchInput) setSearchInput(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search]);

  const page = parseInt(params.page || "1", 10) || 1;

  const apiParams = useMemo(() => {
    const p = { page };
    if (params.search) p.search = params.search;
    if (params.category__slug) p.category__slug = params.category__slug;
    if (params.budget_type) p.budget_type = params.budget_type;
    if (params.experience_level) p.experience_level = params.experience_level;
    if (params.remote_status) p.remote_status = params.remote_status;
    if (params.location) p.location = params.location;
    if (params.ordering) p.ordering = params.ordering;
    return p;
  }, [params, page]);

  const jobs = useFetch(() => listJobs(apiParams), [JSON.stringify(apiParams)]);
  const categories = useFetch(() => listCategories(), []);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const mobileFiltersRef = useRef(null);

  useEffect(() => {
    if (mobileFiltersOpen && mobileFiltersRef.current) {
      mobileFiltersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mobileFiltersOpen]);

  const results = jobs.data?.results ?? [];
  const total = jobs.data?.count ?? 0;

  const seoParts = [];
  if (params.search) seoParts.push(`"${params.search}"`);
  if (params.category__slug) {
    const cat = (categories.data?.results || []).find(
      (c) => c.slug === params.category__slug
    );
    if (cat) seoParts.push(cat.name);
  }
  const seoTitle = seoParts.length
    ? `${seoParts.join(" · ")} — Jobs | ${SITE_NAME}`
    : `Browse Jobs | ${SITE_NAME}`;

  const seoDescription =
    "Search open freelance jobs by keyword, category, budget, experience, and workplace. Apply directly and start working.";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/jobs${window.location.search}`}
      />

      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Browse jobs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {jobs.loading ? "Loading…" : `${total} ${total === 1 ? "job" : "jobs"} found`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-5 sm:mb-6">
        <div className="flex-1 flex items-stretch gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0">
          <div className="flex items-center pl-2 text-slate-400 shrink-0">
            <Search size={16} />
          </div>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search jobs…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm px-1"
            aria-label="Search jobs"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <select
          value={params.ordering || "-created_at"}
          onChange={(e) => setParam("ordering", e.target.value)}
          className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus-ring w-full lg:w-auto"
          aria-label="Sort jobs"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          className="lg:hidden h-11 w-full sm:w-auto"
          onClick={() => setMobileFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal size={16} />
          Filters
        </Button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden lg:block">
          <Card>
            <CardBody>
              <JobFilters
                categories={categories.data?.results || []}
                values={params}
                onChange={(patch) => setParams(patch)}
                onClear={clearAll}
              />
            </CardBody>
          </Card>
        </aside>

        {mobileFiltersOpen ? (
          <div className="lg:hidden" ref={mobileFiltersRef}>
            <Card>
              <CardBody>
                <JobFilters
                  categories={categories.data?.results || []}
                  values={params}
                  onChange={(patch) => setParams(patch)}
                  onClear={clearAll}
                />
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Show results
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}

        <div className="min-w-0">
          <ContentState
            loading={jobs.loading}
            error={jobs.error}
            isEmpty={!jobs.loading && !jobs.error && results.length === 0}
            onRetry={jobs.refetch}
            emptyTitle="No jobs match your filters"
            emptyDescription="Try clearing some filters or searching for something broader."
            loadingFallback={
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton.Card key={i} withHeader withFooter />
                ))}
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
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
      </div>
    </div>
  );
}