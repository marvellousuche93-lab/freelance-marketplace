/**
 * JobCard — a compact card summarizing a job.
 *
 * Used on the homepage, on the jobs browse page, and in the employer's
 * dashboard (as "view as freelancer").
 */

import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card, { CardBody, CardFooter, CardHeader } from "../ui/Card";
import { formatRelativeTime } from "../../utils/format";

export default function JobCard({ job }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {job.title}
          </h3>
          <Badge
            variant={
              job.budget_type === "HOURLY" ? "info" : "brand"
            }
            className="shrink-0"
          >
            {job.budget_type === "HOURLY" ? "Hourly" : "Fixed"}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
          <span>{job.category?.name || "Uncategorized"}</span>
          {job.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {job.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {formatRelativeTime(job.created_at)}
          </span>
        </p>
      </CardHeader>

      <CardBody className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {(job.skills || []).slice(0, 4).map((s) => (
            <Badge key={s.id} variant="info">
              {s.name}
            </Badge>
          ))}
          {(job.skills?.length || 0) > 4 ? (
            <Badge>+{job.skills.length - 4}</Badge>
          ) : null}
        </div>
      </CardBody>

      <CardFooter className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          {formatBudget(job)}
        </span>
        <Button as={Link} to={`/jobs/${job.slug}`} variant="ghost" size="sm">
          View →
        </Button>
      </CardFooter>
    </Card>
  );
}

function formatBudget(job) {
  if (job.min_budget == null) return "Budget TBD";
  if (job.budget_type === "FIXED_PRICE") {
    return `$${Number(job.min_budget).toLocaleString()}`;
  }
  return `$${Number(job.min_budget).toLocaleString()}–$${Number(job.max_budget).toLocaleString()}/hr`;
}