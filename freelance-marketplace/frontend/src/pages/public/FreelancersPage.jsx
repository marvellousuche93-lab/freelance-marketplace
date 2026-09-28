/**
 * FreelancersPage — browse freelancers with search.
 *
 * URL-driven: /freelancers?search=react
 *
 * SEO: dynamic title based on the search query.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Users, X } from "lucide-react";

import Card, { CardBody } from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import EmptyState from "../../components/dashboard/EmptyState";
import Seo from "../../components/seo/Seo";
import { SITE_NAME } from "../../components/seo/siteDefaults";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import useQueryParams from "../../hooks/useQueryParams";
import { listFreelancers } from "../../api/profiles";

const PAGE_SIZE = 12;

export default function FreelancersPage() {
  const { params, setParam } = useQueryParams();
  const [searchInput, setSearchInput] = useState(params.search || "");
  const debounced = useDebounce(searchInput, 350);

  useEffect(() => {
    if ((params.search || "") === debounced) return;
    setParam("search", debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const page = parseInt(params.page || "1", 10) || 1;

  const freelancers = useFetch(() => listFreelancers({ page }), [page]);

  const raw = freelancers.data?.results ?? [];
  const q = (params.search || "").trim().toLowerCase();
  const filtered = q
    ? raw.filter((u) => {
        const hay = [
          u.username,
          u.first_name,
          u.last_name,
          u.freelancer_profile?.professional_title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : raw;

  const total = freelancers.data?.count ?? 0;

  // ---- SEO ----
  const seoTitle = q
    ? `Freelancers matching "${params.search}" | ${SITE_NAME}`
    : `Browse Freelancers | ${SITE_NAME}`;
  const seoDescription =
    "Discover freelancers by skill, location, and hourly rate. Browse portfolios and message directly.";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/freelancers${window.location.search}`}
      />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Browse freelancers
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {freelancers.loading
            ? "Loading…"
            : `${total} freelancer${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex items-stretch gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-6">
        <div className="flex items-center pl-2 text-slate-400 shrink-0">
          <Search size={16} />
        </div>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, title…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm px-1"
          aria-label="Search freelancers"
        />
        {searchInput ? (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            aria-label="Clear search"
            className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <ContentState
        loading={freelancers.loading}
        error={freelancers.error}
        isEmpty={!freelancers.loading && !freelancers.error && filtered.length === 0}
        onRetry={freelancers.refetch}
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Card key={i} />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={Users}
            title="No freelancers found"
            description="Try a different search."
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <FreelancerCard key={user.id} user={user} />
          ))}
        </div>

        {!q ? (
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

function FreelancerCard({ user }) {
  const p = user.freelancer_profile || {};
  const initial = (
    user.first_name?.[0] ||
    user.username?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <Card className="flex flex-col">
      <CardBody className="space-y-3">
        <div className="flex items-center gap-3">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt=""
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <Link
              to={`/freelancers/${user.username}`}
              className="font-semibold truncate hover:text-brand-600"
            >
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {p.professional_title || "Freelancer"}
            </p>
          </div>
        </div>

        {user.bio ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
            {user.bio}
          </p>
        ) : null}

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          {user.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {user.location}
            </span>
          ) : null}
          {p.hourly_rate ? <span>${p.hourly_rate}/hr</span> : null}
        </div>

        <div className="pt-2">
          <Link
            to={`/freelancers/${user.username}`}
            className="text-sm text-brand-600 hover:underline"
          >
            View profile →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}