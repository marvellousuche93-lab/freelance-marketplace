/**
 * FreelancerDetailPage — public freelancer profile.
 *
 * Route: /freelancers/:username
 *
 * The public endpoint takes an id, so we look the user up via the list
 * and match on username. Once the backend exposes /freelancers/<username>/
 * directly, we can swap to a single call.
 *
 * SEO: sets a page-specific title, description, canonical, and Person
 * structured data (JSON-LD).
 */

import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AtSign,
  Code2,
  ExternalLink,
  Globe,
  Link2,
  MapPin,
  Users,
} from "lucide-react";

import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import EmptyState from "../../components/dashboard/EmptyState";
import MessageButton from "../../components/messaging/MessageButton";
import Seo from "../../components/seo/Seo";
import { SITE_NAME } from "../../components/seo/siteDefaults";
import useFetch from "../../hooks/useFetch";
import { listFreelancers } from "../../api/profiles";
import { listPortfolios } from "../../api/portfolios";
import { formatDate, formatMoney } from "../../utils/format";

export default function FreelancerDetailPage() {
  const { username } = useParams();

  const freelancers = useFetch(() => listFreelancers({ page: 1 }), []);

  const user = useMemo(() => {
    return (freelancers.data?.results ?? []).find(
      (u) => u.username === username
    );
  }, [freelancers.data, username]);

  const portfolios = useFetch(
    () => (user ? listPortfolios({ freelancer__username: user.username }) : null),
    [user?.id]
  );

  // ---- SEO ----
  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username;

  const seoTitle = user
    ? `${fullName}${
        user.freelancer_profile?.professional_title
          ? ` — ${user.freelancer_profile.professional_title}`
          : ""
      } | ${SITE_NAME}`
    : `Freelancer | ${SITE_NAME}`;

  const seoDescription = user?.bio
    ? user.bio.slice(0, 160)
    : "View this freelancer's portfolio, skills, and contact options on the Freelance Marketplace.";

  const jsonLd = user
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: fullName,
        jobTitle: user.freelancer_profile?.professional_title || undefined,
        description: user.bio || undefined,
        address: user.location
          ? { "@type": "PostalAddress", addressLocality: user.location }
          : undefined,
        url: user.website || undefined,
        sameAs: [
          user.freelancer_profile?.linkedin_url,
          user.freelancer_profile?.github_url,
          user.freelancer_profile?.twitter_url,
        ].filter(Boolean),
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/freelancers/${username}`}
        ogType="profile"
        jsonLd={jsonLd}
      />

      <Link
        to="/freelancers"
        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 inline-block"
      >
        ← Back to freelancers
      </Link>

      <ContentState
        loading={freelancers.loading}
        error={freelancers.error}
        isEmpty={!freelancers.loading && !freelancers.error && !user}
        onRetry={freelancers.refetch}
        emptyFallback={
          <EmptyState
            icon={Users}
            title="Freelancer not found"
            description="This profile doesn't exist or was removed."
            actionLabel="Browse freelancers"
            actionTo="/freelancers"
          />
        }
        loadingFallback={<Skeleton.Detail />}
      >
        {user ? (
          <div className="space-y-6">
            <Card>
              <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                    {(user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold truncate">
                    {fullName}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {user.freelancer_profile?.professional_title || "Freelancer"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {user.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {user.location}
                      </span>
                    ) : null}
                    {user.freelancer_profile?.hourly_rate ? (
                      <span>
                        {formatMoney(user.freelancer_profile.hourly_rate)}/hr
                      </span>
                    ) : null}
                    {user.freelancer_profile?.experience_years ? (
                      <span>
                        {user.freelancer_profile.experience_years} year
                        {user.freelancer_profile.experience_years === 1 ? "" : "s"} of
                        experience
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <MessageButton
                    userId={user.id}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    Message
                  </MessageButton>
                </div>
              </CardBody>
            </Card>

            {user.bio ? (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">About</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </CardBody>
              </Card>
            ) : null}

            {(user.website ||
              user.freelancer_profile?.linkedin_url ||
              user.freelancer_profile?.github_url ||
              user.freelancer_profile?.twitter_url) && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Links</h2>
                </CardHeader>
                <CardBody className="flex flex-wrap gap-3 text-sm">
                  <LinkOut icon={Globe} url={user.website} label="Website" />
                  <LinkOut
                    icon={Link2}
                    url={user.freelancer_profile?.linkedin_url}
                    label="LinkedIn"
                  />
                  <LinkOut
                    icon={Code2}
                    url={user.freelancer_profile?.github_url}
                    label="GitHub"
                  />
                  <LinkOut
                    icon={AtSign}
                    url={user.freelancer_profile?.twitter_url}
                    label="Twitter"
                  />
                </CardBody>
              </Card>
            )}

            <section>
              <h2 className="text-lg font-semibold mb-3">Portfolio</h2>

              <ContentState
                loading={portfolios.loading}
                error={portfolios.error}
                isEmpty={
                  !portfolios.loading &&
                  !portfolios.error &&
                  (portfolios.data?.results?.length ?? 0) === 0
                }
                onRetry={portfolios.refetch}
                loadingFallback={
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton.Card key={i} withHeader />
                    ))}
                  </div>
                }
                emptyTitle="No portfolio projects"
                emptyDescription="This freelancer hasn't added any work yet."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolios.data.results.map((project) => (
                    <Card key={project.id} className="overflow-hidden flex flex-col">
                      {project.featured_image ? (
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800">
                          <img
                            src={project.featured_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                      <CardBody className="flex-1 space-y-2">
                        <h3 className="font-semibold leading-tight">
                          {project.title}
                        </h3>
                        {project.start_date ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(project.start_date)}
                            {project.end_date
                              ? ` – ${formatDate(project.end_date)}`
                              : ""}
                          </p>
                        ) : null}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ContentState>
            </section>
          </div>
        ) : null}
      </ContentState>
    </div>
  );
}

function LinkOut({ icon: Icon, url, label }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-brand-600 hover:underline"
    >
      <Icon size={14} /> {label} <ExternalLink size={10} />
    </a>
  );
}