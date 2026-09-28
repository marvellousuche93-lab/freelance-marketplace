/**
 * JobForm — create/edit a job.
 *
 * Props:
 *   initial   (optional) an existing job object for editing
 *   onSubmit  async (payload) => void
 *   submitting boolean
 *   error     string
 *   submitLabel string  ("Post Job" or "Save Changes")
 *   onCancel  () => void
 */

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardBody, CardHeader } from "../ui/Card";
import useFetch from "../../hooks/useFetch";
import { listCategories, listSkills } from "../../api/categories";
import { cn } from "../../utils/cn";

const JOB_TYPES = [
  { value: "FIXED_PRICE", label: "Fixed price" },
  { value: "HOURLY", label: "Hourly" },
];

const EXPERIENCE = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

const REMOTE = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const STATUSES = [
  { value: "DRAFT", label: "Draft (not visible to the public)" },
  { value: "OPEN", label: "Open (accepting applications)" },
  { value: "CLOSED", label: "Closed" },
];

export default function JobForm({
  initial,
  onSubmit,
  submitting = false,
  error,
  submitLabel = "Post Job",
  onCancel,
}) {
  const categories = useFetch(() => listCategories(), []);
  const skills = useFetch(() => listSkills(), []);

  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category?.id || "",
    skills: initial?.skills?.map((s) => s.id) || [],
    budget_type: initial?.budget_type || "FIXED_PRICE",
    min_budget: initial?.min_budget ?? "",
    max_budget: initial?.max_budget ?? "",
    experience_level: initial?.experience_level || "INTERMEDIATE",
    location: initial?.location || "",
    remote_status: initial?.remote_status || "REMOTE",
    deadline: initial?.deadline || "",
    status: initial?.status || "DRAFT",
  }));

  const [skillSearch, setSkillSearch] = useState("");

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // When budget type is FIXED_PRICE, keep max = min.
  useEffect(() => {
    if (form.budget_type === "FIXED_PRICE" && form.min_budget) {
      setForm((prev) => ({ ...prev, max_budget: prev.min_budget }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.budget_type, form.min_budget]);

  const skillOptions = useMemo(() => {
    const list = skills.data?.results ?? [];
    if (!skillSearch.trim()) return list.slice(0, 20);
    const q = skillSearch.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [skills.data, skillSearch]);

  function toggleSkill(id) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }));
  }

  function removeSkill(id) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== id) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: Number(form.category),
      skills: form.skills,
      budget_type: form.budget_type,
      experience_level: form.experience_level,
      location: form.location.trim(),
      remote_status: form.remote_status,
      status: form.status,
    };

    if (form.min_budget !== "" && form.min_budget !== null) {
      payload.min_budget = String(form.min_budget);
      payload.max_budget = String(
        form.budget_type === "FIXED_PRICE"
          ? form.min_budget
          : form.max_budget || form.min_budget
      );
    }

    if (form.deadline) payload.deadline = form.deadline;

    onSubmit(payload);
  }

  const selectedSkills = useMemo(() => {
    const map = new Map((skills.data?.results ?? []).map((s) => [s.id, s]));
    return form.skills.map((id) => map.get(id)).filter(Boolean);
  }, [form.skills, skills.data]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Job details</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={update("title")}
            placeholder="e.g. Build a Django REST API"
          />

          <div>
            <label
              htmlFor="job-description"
              className="block text-sm font-medium mb-1.5"
            >
              Description
            </label>
            <textarea
              id="job-description"
              rows={8}
              required
              value={form.description}
              onChange={update("description")}
              placeholder="Describe the project, deliverables, and expectations…"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring resize-y"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="job-category"
                className="block text-sm font-medium mb-1.5"
              >
                Category
              </label>
              <select
                id="job-category"
                required
                value={form.category}
                onChange={update("category")}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
              >
                <option value="">Select a category…</option>
                {(categories.data?.results ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="job-status"
                className="block text-sm font-medium mb-1.5"
              >
                Status
              </label>
              <select
                id="job-status"
                value={form.status}
                onChange={update("status")}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Required skills</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {/* Selected chips */}
          {selectedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-2.5 py-0.5 text-xs font-medium"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => removeSkill(s.id)}
                    aria-label={`Remove ${s.name}`}
                    className="hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <Input
            label="Search skills"
            placeholder="Type to filter…"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
          />

          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 p-2 flex flex-wrap gap-1.5">
            {skillOptions.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-1">No matches.</p>
            ) : (
              skillOptions.map((s) => {
                const active = form.skills.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSkill(s.id)}
                    aria-pressed={active}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                      active
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400"
                    )}
                  >
                    {s.name}
                  </button>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Budget</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="job-budget-type"
                className="block text-sm font-medium mb-1.5"
              >
                Type
              </label>
              <select
                id="job-budget-type"
                value={form.budget_type}
                onChange={update("budget_type")}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={form.budget_type === "FIXED_PRICE" ? "Price" : "Min ($/hr)"}
              type="number"
              min={0}
              step="0.01"
              value={form.min_budget}
              onChange={update("min_budget")}
            />

            {form.budget_type === "HOURLY" ? (
              <Input
                label="Max ($/hr)"
                type="number"
                min={0}
                step="0.01"
                value={form.max_budget}
                onChange={update("max_budget")}
              />
            ) : null}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            An <strong>Open</strong> job requires a budget. Fixed-price jobs
            use a single price.
          </p>
        </CardBody>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Requirements & logistics</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="job-exp"
                className="block text-sm font-medium mb-1.5"
              >
                Experience level
              </label>
              <select
                id="job-exp"
                value={form.experience_level}
                onChange={update("experience_level")}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
              >
                {EXPERIENCE.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="job-remote"
                className="block text-sm font-medium mb-1.5"
              >
                Workplace
              </label>
              <select
                id="job-remote"
                value={form.remote_status}
                onChange={update("remote_status")}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
              >
                {REMOTE.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location"
              placeholder="e.g. Lagos, Nigeria"
              value={form.location}
              onChange={update("location")}
            />

            <Input
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={update("deadline")}
            />
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}