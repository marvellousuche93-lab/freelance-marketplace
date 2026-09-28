/**
 * StatCard — a small numeric stat with an icon and a label.
 *
 * Used on both freelancer and employer dashboards.
 */

import { Link } from "react-router-dom";

import Card, { CardBody } from "../ui/Card";
import { cn } from "../../utils/cn";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  to,
  tone = "brand",
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    info: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    neutral:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  const inner = (
    <CardBody className="flex items-center gap-4">
      {Icon ? (
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            tones[tone] || tones.brand
          )}
        >
          <Icon size={20} />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-semibold leading-tight">
          {value == null ? "—" : value}
        </p>
        {sublabel ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {sublabel}
          </p>
        ) : null}
      </div>
    </CardBody>
  );

  return (
    <Card
      as={to ? Link : "div"}
      to={to}
      className={cn(to && "transition-colors hover:border-brand-400")}
    >
      {inner}
    </Card>
  );
}