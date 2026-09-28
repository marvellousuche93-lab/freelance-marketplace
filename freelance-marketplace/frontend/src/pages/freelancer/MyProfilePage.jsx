/**
 * MyProfilePage — a read-only preview of the freelancer's own profile.
 *
 * Links to /dashboard/profile/edit for the full editor.
 */

import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, Globe, Languages, MapPin } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { getMyFreelancerProfile } from "../../api/profiles";
import { formatMoney } from "../../utils/format";

export default function MyProfilePage() {
  const { user } = useAuth();
  const profile = useFetch(() => getMyFreelancerProfile(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="How employers see you on the marketplace."
        actions={
          <Button as={Link} to="/dashboard/profile/edit" variant="outline">
            Edit profile
          </Button>
        }
      />

      <ContentState
        loading={profile.loading}
        error={profile.error}
        isEmpty={false}
        onRetry={profile.refetch}
        loadingFallback={
          <div className="space-y-4">
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        }
      >
        {profile.data ? (
          <>
            <Card>
              <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                    {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile.data.professional_title || "No title yet"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {user?.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {user.location}
                      </span>
                    ) : null}
                    {profile.data.hourly_rate ? (
                      <span>
                        {formatMoney(profile.data.hourly_rate)}/hr
                      </span>
                    ) : null}
                    <span>
                      Experience: {profile.data.experience_years} year
                      {profile.data.experience_years === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {user?.bio ? (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">About</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Professional details</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <InfoRow
                  icon={BookOpen}
                  label="Education"
                  value={profile.data.education || "—"}
                />
                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={profile.data.languages || "—"}
                />
                <InfoRow
                  icon={Globe}
                  label="Website"
                  value={
                    user?.website ? (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline inline-flex items-center gap-1 break-anywhere"
                      >
                        <span className="truncate">{user.website}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Social links</h3>
              </CardHeader>
              <CardBody className="space-y-2 text-sm">
                <SocialRow label="LinkedIn" url={profile.data.linkedin_url} />
                <SocialRow label="GitHub" url={profile.data.github_url} />
                <SocialRow label="Twitter / X" url={profile.data.twitter_url} />
              </CardBody>
            </Card>
          </>
        ) : null}
      </ContentState>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-slate-400 mt-1 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="text-sm min-w-0">{value}</div>
      </div>
    </div>
  );
}

function SocialRow({ label, url }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-brand-600 hover:underline inline-flex items-center gap-1 min-w-0"
        >
          <span className="truncate">{url}</span>{" "}
          <ExternalLink size={12} className="shrink-0" />
        </a>
      ) : (
        <span className="text-slate-400">—</span>
      )}
    </div>
  );
}