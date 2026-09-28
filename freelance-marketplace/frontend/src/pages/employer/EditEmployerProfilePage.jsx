/**
 * EditEmployerProfilePage — edit the employer's own company profile.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import FileInput from "../../components/ui/FileInput";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Skeleton from "../../components/loaders/Skeleton";
import ContentState from "../../components/loaders/ContentState";
import PageHeader from "../../components/dashboard/PageHeader";
import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import { useAuth } from "../../context/AuthContext";
import { updateMe } from "../../api/auth";
import {
  getMyEmployerProfile,
  updateMyEmployerProfile,
} from "../../api/profiles";
import { extractErrorMessage } from "../../api/errors";
import { toFormData } from "../../utils/formData";

const SIZES = [
  { value: "SOLO", label: "1 (solo)" },
  { value: "SMALL", label: "2-10" },
  { value: "MEDIUM", label: "11-50" },
  { value: "LARGE", label: "51-200" },
  { value: "ENTERPRISE", label: "200+" },
];

export default function EditEmployerProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const profile = useFetch(() => getMyEmployerProfile(), []);

  const form = useForm({
    first_name: "",
    last_name: "",
    location: "",
    bio: "",
    website: "",
    profile_picture: null, // account avatar
    company_name: "",
    company_logo: null, // File | null
    company_description: "",
    industry: "",
    company_size: "SMALL",
    company_website: "",
    contact_email: "",
  });

  useEffect(() => {
    if (!user || !profile.data) return;
    form.reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      location: user.location || "",
      bio: user.bio || "",
      website: user.website || "",
      profile_picture: null,
      company_name: profile.data.company_name || "",
      company_logo: null,
      company_description: profile.data.company_description || "",
      industry: profile.data.industry || "",
      company_size: profile.data.company_size || "SMALL",
      company_website: profile.data.company_website || "",
      contact_email: profile.data.contact_email || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile.data]);

  async function onSubmit(e) {
    e.preventDefault();
    form.setFormError("");

    const userPayload = toFormData({
      first_name: form.values.first_name,
      last_name: form.values.last_name,
      location: form.values.location,
      bio: form.values.bio,
      website: form.values.website,
      ...(form.values.profile_picture
        ? { profile_picture: form.values.profile_picture }
        : {}),
    });

    const profilePayload = toFormData({
      company_name: form.values.company_name,
      company_description: form.values.company_description,
      industry: form.values.industry,
      company_size: form.values.company_size,
      company_website: form.values.company_website,
      contact_email: form.values.contact_email,
      ...(form.values.company_logo
        ? { company_logo: form.values.company_logo }
        : {}),
    });

    form.setSubmitting(true);
    try {
      await updateMe(userPayload);
      await updateMyEmployerProfile(profilePayload);
      await refreshUser();
      toast.success("Company profile updated.");
      navigate("/dashboard/profile");
    } catch (err) {
      const msg = extractErrorMessage(err, "Could not save profile.");
      form.setFormError(msg);
      toast.error(msg);
    } finally {
      form.setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit company profile"
        description="Tell freelancers who you are and what you build."
      />

      <ContentState
        loading={profile.loading || !user}
        error={profile.error}
        isEmpty={false}
        onRetry={profile.refetch}
        loadingFallback={<Skeleton.Card withHeader withFooter />}
      >
        <form onSubmit={onSubmit} className="space-y-6">
          {form.formError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {form.formError}
            </div>
          ) : null}

          {/* Company */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Company</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <FileInput
                label="Company logo"
                currentUrl={profile.data?.company_logo || null}
                onChange={(file) => form.setField("company_logo", file)}
                helper="Square logos work best."
              />

              <Input
                label="Company name"
                required
                value={form.values.company_name}
                onChange={form.handleChange("company_name")}
              />

              <Textarea
                label="Company description"
                rows={4}
                value={form.values.company_description}
                onChange={form.handleChange("company_description")}
                placeholder="What does your company do? What's your mission?"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Industry"
                  value={form.values.industry}
                  onChange={form.handleChange("industry")}
                  placeholder="e.g. Software, Design, Marketing"
                />
                <div>
                  <label
                    htmlFor="company_size"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Company size
                  </label>
                  <select
                    id="company_size"
                    value={form.values.company_size}
                    onChange={form.handleChange("company_size")}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
                  >
                    {SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Company website"
                type="url"
                value={form.values.company_website}
                onChange={form.handleChange("company_website")}
                placeholder="https://example.com"
              />

              <Input
                label="Contact email"
                type="email"
                value={form.values.contact_email}
                onChange={form.handleChange("contact_email")}
                placeholder="hiring@example.com"
              />
            </CardBody>
          </Card>

          {/* Personal / avatar */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Your account</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <FileInput
                label="Your avatar"
                currentUrl={user?.profile_picture || null}
                onChange={(file) => form.setField("profile_picture", file)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={form.values.first_name}
                  onChange={form.handleChange("first_name")}
                />
                <Input
                  label="Last name"
                  value={form.values.last_name}
                  onChange={form.handleChange("last_name")}
                />
              </div>
              <Input
                label="Location"
                value={form.values.location}
                onChange={form.handleChange("location")}
              />
              <Textarea
                label="Short bio"
                rows={3}
                value={form.values.bio}
                onChange={form.handleChange("bio")}
              />
              <Input
                label="Personal website"
                type="url"
                value={form.values.website}
                onChange={form.handleChange("website")}
              />
            </CardBody>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/dashboard/profile")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={form.submitting}>
              <Save size={16} /> Save changes
            </Button>
          </div>
        </form>
      </ContentState>
    </div>
  );
}