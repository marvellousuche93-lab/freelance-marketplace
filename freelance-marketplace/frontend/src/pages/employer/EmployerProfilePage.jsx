/**
 * EmployerProfilePage — a read-only preview of the employer's own profile.
 *
 * Links to /dashboard/profile/edit for the full editor.
 */

import { Link } from "react-router-dom";
import { Building2, ExternalLink, Globe, Mail, MapPin } from "lucide-react";

import Button from "../../components/ui/Button";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { getMyEmployerProfile } from "../../api/profiles";

const SIZE_LABELS = {
  SOLO: "1 (solo)",
  SMALL: "2-10",
  MEDIUM: "11-50",
  LARGE: "51-200",
  ENTERPRISE: "200+",
};

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const profile = useFetch(() => getMyEmployerProfile(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company profile"
        description="How freelancers see your business."
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
                {profile.data.company_logo ? (
                  <img
                    src={profile.data.company_logo}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <Building2 size={26} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {profile.data.company_name || user?.username}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile.data.industry || "Industry not set"}
                    {profile.data.company_size
                      ? ` · ${SIZE_LABELS[profile.data.company_size] || profile.data.company_size}`
                      : ""}
                  </p>
                </div>
              </CardBody>
            </Card>

            {profile.data.company_description ? (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">About the company</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {profile.data.company_description}
                  </p>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Contact</h3>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <InfoRow
                  icon={Mail}
                  label="Contact email"
                  value={profile.data.contact_email || "—"}
                />
                <InfoRow
                  icon={Globe}
                  label="Website"
                  value={
                    profile.data.company_website ? (
                      <a
                        href={profile.data.company_website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline inline-flex items-center gap-1 min-w-0"
                      >
                        <span className="truncate">
                          {profile.data.company_website}
                        </span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={user?.location || "—"}
                />
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