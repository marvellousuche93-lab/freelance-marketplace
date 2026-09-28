/**
 * JobFilters — the filter controls for the jobs browse page.
 *
 * Touch-friendly on mobile: 44px tap rows on the checklist, larger
 * selects and inputs.
 */

import { Filter, X } from "lucide-react";

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const EXPERIENCE = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

const BUDGET_TYPES = [
  { value: "FIXED_PRICE", label: "Fixed price" },
  { value: "HOURLY", label: "Hourly" },
];

const REMOTE = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

export default function JobFilters({
  categories = [],
  values = {},
  onChange,
  onClear,
}) {
  const active = Object.keys(values).filter(
    (k) => values[k] !== undefined && values[k] !== null && values[k] !== ""
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 font-semibold">
          <Filter size={16} /> Filters
        </div>
        {active.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        ) : null}
      </div>

      <FilterGroup title="Category">
        <select
          value={values.category__slug || ""}
          onChange={(e) => onChange({ category__slug: e.target.value })}
          className="w-full h-11 sm:h-9 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Budget type">
        <RadioGroup
          name="budget_type"
          value={values.budget_type || ""}
          options={BUDGET_TYPES}
          onChange={(v) => onChange({ budget_type: v })}
        />
      </FilterGroup>

      <FilterGroup title="Experience level">
        <RadioGroup
          name="experience_level"
          value={values.experience_level || ""}
          options={EXPERIENCE}
          onChange={(v) => onChange({ experience_level: v })}
        />
      </FilterGroup>

      <FilterGroup title="Workplace">
        <RadioGroup
          name="remote_status"
          value={values.remote_status || ""}
          options={REMOTE}
          onChange={(v) => onChange({ remote_status: v })}
        />
      </FilterGroup>

      <FilterGroup title="Location">
        <input
          type="text"
          placeholder="Any location"
          value={values.location || ""}
          onChange={(e) => onChange({ location: e.target.value })}
          className="w-full h-11 sm:h-9 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
        />
      </FilterGroup>

      <FilterGroup title="Minimum budget">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={values.min_budget__gte || ""}
            onChange={(e) => onChange({ min_budget__gte: e.target.value })}
            className="w-full h-11 sm:h-9 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-ring"
          />
          <span className="text-sm text-slate-500">+</span>
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function RadioGroup({ name, value, options, onChange }) {
  return (
    <div className="space-y-0.5">
      <label className="flex items-center gap-2 text-sm cursor-pointer py-2 min-h-[40px]">
        <input
          type="radio"
          name={name}
          checked={value === ""}
          onChange={() => onChange("")}
          className="text-brand-600 focus:ring-brand-500"
        />
        <span className={cn(value === "" && "font-medium")}>Any</span>
      </label>
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 text-sm cursor-pointer py-2 min-h-[40px]"
        >
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="text-brand-600 focus:ring-brand-500"
          />
          <span className={cn(value === opt.value && "font-medium")}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}