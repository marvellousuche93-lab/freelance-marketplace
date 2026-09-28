/**
 * EditProfilePage (freelancer) — edit every field of the freelancer's
 * own profile.
 *
 * Two PATCH calls on submit:
 *   1. /auth/me/                    (name, bio, location, avatar, website)
 *   2. /auth/me/freelancer-profile/ (professional details)
 *
 * If either fails, we surface the error and don't navigate away.
 */

import { useEffect, useState } from "react";
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
  getMyFreelancerProfile,
  updateMyFreelancerProfile,
} from "../../api/profiles";
import { extractErrorMessage } from "../../api/errors";
import { toFormData } from "../../utils/formData";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const profile = useFetch(() => getMyFreelancerProfile(), []);

  const form = useForm({
    // User fields
    first_name: "",
    last_name: "",
    bio: "",
    location: "",
    phone_number: "",
    website: "",
    profile_picture: null, // File | null
    // FreelancerProfile fields
    professional_title: "",
    hourly_rate: "",
    availability: "FULL_TIME",
    experience_years: 0,
    education: "",
    languages: "",
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
  });

  // Hydrate form when user + profile arrive.
  useEffect(() => {
    if (!user || !profile.data) return;
    form.reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      bio: user.bio || "",
      location: user.location || "",
      phone_number: user.phone_number || "",
      website: user.website || "",
      profile_picture: null,
      professional_title: profile.data.professional_title || "",
      hourly_rate: profile.data.hourly_rate ?? "",
      availability: profile.data.availability || "FULL_TIME",
      experience_years: profile.data.experience_years ?? 0,
      education: profile.data.education || "",
      languages: profile.data.languages || "",
      linkedin_url: profile.data.linkedin_url || "",
      github_url: profile.data.github_url || "",
      twitter_url: profile.data.twitter_url || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile.data]);

  async function onSubmit(e) {
    e.preventDefault();
    form.setFormError("");

    // User update (multipart because of the avatar).
    const userPayload = toFormData({
      first_name: form.values.first_name,
      last_name: form.values.last_name,
      bio: form.values.bio,
      location: form.values.location,
      phone_number: form.values.phone_number,
      website: form.values.website,
      ...(form.values.profile_picture
        ? { profile_picture: form.values.profile_picture }
        : {}),
    });

    const profilePayload = {
      professional_title: form.values.professional_title,
      hourly_rate: form.values.hourly_rate === "" ? null : form.values.hourly_rate,
      availability: form.values.availability,
      experience_years: Number(form.values.experience_years) || 0,
      education: form.values.education,
      languages: form.values.languages,
      linkedin_url: form.values.linkedin_url,
      github_url: form.values.github_url,
      twitter_url: form.values.twitter_url,
    };

    form.setSubmitting(true);
    try {
      await updateMe(userPayload);
      await updateMyFreelancerProfile(profilePayload);
      await refreshUser();
      toast.success("Profile updated.");
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
        title="Edit profile"
        description="Keep your details up to date to attract the right work."
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

          {/* Personal */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Personal information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <FileInput
                label="Profile picture"
                currentUrl={user?.profile_picture || null}
                onChange={(file) => form.setField("profile_picture", file)}
                helper="Square images work best. PNG, JPG, or WebP."
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

              <Textarea
                label="Bio"
                rows={4}
                value={form.values.bio}
                onChange={form.handleChange("bio")}
                helper="A short introduction. What do you do, and what are you good at?"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={form.values.location}
                  onChange={form.handleChange("location")}
                  placeholder="City, Country"
                />
                <Input
                  label="Phone number"
                  value={form.values.phone_number}
                  onChange={form.handleChange("phone_number")}
                  helper="Only visible to employers after you accept a job."
                />
              </div>

              <Input
                label="Website"
                type="url"
                value={form.values.website}
                onChange={form.handleChange("website")}
                placeholder="https://example.com"
              />
            </CardBody>
          </Card>

          {/* Professional */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Professional details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Professional title"
                value={form.values.professional_title}
                onChange={form.handleChange("professional_title")}
                placeholder="e.g. Full-stack Django developer"
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Hourly rate ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.values.hourly_rate}
                  onChange={form.handleChange("hourly_rate")}
                />
                <Input
                  label="Experience (years)"
                  type="number"
                  min={0}
                  value={form.values.experience_years}
                  onChange={form.handleChange("experience_years")}
                />
                <div>
                  <label
                    htmlFor="availability"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Availability
                  </label>
                  <select
                    id="availability"
                    value={form.values.availability}
                    onChange={form.handleChange("availability")}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
                  >
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="NOT_AVAILABLE">Not available</option>
                  </select>
                </div>
              </div>

              <Input
                label="Languages"
                value={form.values.languages}
                onChange={form.handleChange("languages")}
                placeholder="English, Yoruba, French"
                helper="Comma-separated list."
              />

              <Textarea
                label="Education"
                rows={3}
                value={form.values.education}
                onChange={form.handleChange("education")}
                placeholder="Degrees, certifications, or self-taught background."
              />
            </CardBody>
          </Card>

          {/* Social links */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Social links</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="LinkedIn"
                type="url"
                value={form.values.linkedin_url}
                onChange={form.handleChange("linkedin_url")}
                placeholder="https://linkedin.com/in/..."
              />
              <Input
                label="GitHub"
                type="url"
                value={form.values.github_url}
                onChange={form.handleChange("github_url")}
                placeholder="https://github.com/..."
              />
              <Input
                label="Twitter / X"
                type="url"
                value={form.values.twitter_url}
                onChange={form.handleChange("twitter_url")}
                placeholder="https://x.com/..."
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