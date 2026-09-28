/**
 * PortfolioForm — create/edit a portfolio project.
 *
 * Props:
 *   initial     existing project (edit) or undefined (create)
 *   onSubmit    async (payload) => void
 *   submitting  boolean
 *   error       string
 *   submitLabel "Add project" | "Save changes"
 *   onCancel    () => void
 */

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import FileInput from "../ui/FileInput";
import Card, { CardBody, CardHeader } from "../ui/Card";
import useFetch from "../../hooks/useFetch";
import { listSkills } from "../../api/categories";
import { cn } from "../../utils/cn";

export default function PortfolioForm({
  initial,
  onSubmit,
  submitting = false,
  error,
  submitLabel = "Add project",
  onCancel,
}) {
  const skills = useFetch(() => listSkills(), []);

  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    description: initial?.description || "",
    skills: initial?.skills?.map((s) => s.id) || [],
    project_url: initial?.project_url || "",
    github_url: initial?.github_url || "",
    start_date: initial?.start_date || "",
    end_date: initial?.end_date || "",
    is_featured: !!initial?.is_featured,
    featured_image: null, // File | null
  }));

  const [skillSearch, setSkillSearch] = useState("");

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const skillOptions = useMemo(() => {
    const list = skills.data?.results ?? [];
    if (!skillSearch.trim()) return list.slice(0, 20);
    const q = skillSearch.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [skills.data, skillSearch]);

  const selectedSkills = useMemo(() => {
    const map = new Map((skills.data?.results ?? []).map((s) => [s.id, s]));
    return form.skills.map((id) => map.get(id)).filter(Boolean);
  }, [form.skills, skills.data]);

  function toggleSkill(id) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      skills: form.skills,
      project_url: form.project_url.trim(),
      github_url: form.github_url.trim(),
      start_date: form.start_date || "",
      end_date: form.end_date || "",
      is_featured: !!form.is_featured,
      ...(form.featured_image ? { featured_image: form.featured_image } : {}),
    };
    onSubmit(payload);
  }

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

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Project</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <FileInput
            label="Cover image"
            currentUrl={initial?.featured_image || null}
            onChange={(file) => setField("featured_image", file)}
            helper="A 16:9 screenshot or mockup works best."
          />

          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. E-commerce platform for a local retailer"
          />

          <Textarea
            label="Description"
            required
            rows={6}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="What did you build, for whom, and what was the outcome?"
          />

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setField("is_featured", e.target.checked)}
              className="text-brand-600 focus:ring-brand-500"
            />
            Feature this project (pinned to the top)
          </label>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Skills used</h2>
        </CardHeader>
        <CardBody className="space-y-3">
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
                    onClick={() => toggleSkill(s.id)}
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

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Links & timeline</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Live project URL"
              type="url"
              value={form.project_url}
              onChange={(e) => setField("project_url", e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              label="Source code URL"
              type="url"
              value={form.github_url}
              onChange={(e) => setField("github_url", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              value={form.start_date}
              onChange={(e) => setField("start_date", e.target.value)}
            />
            <Input
              label="End date"
              type="date"
              value={form.end_date}
              onChange={(e) => setField("end_date", e.target.value)}
              helper="Leave empty if the project is ongoing."
            />
          </div>
        </CardBody>
      </Card>

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