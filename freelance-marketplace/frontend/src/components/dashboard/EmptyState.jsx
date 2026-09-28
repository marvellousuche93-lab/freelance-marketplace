/**
 * EmptyState — an icon + title + description + optional CTA.
 *
 * Used when a list has zero items. The CTA can be a route (Link) or a
 * function (button).
 */

import { Link } from "react-router-dom";

import Button from "../ui/Button";
import Card, { CardBody } from "../ui/Card";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <Card>
      <CardBody className="text-center py-12 space-y-3">
        {Icon ? (
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <Icon size={24} />
          </div>
        ) : null}
        <p className="font-medium text-lg">{title}</p>
        {description ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {description}
          </p>
        ) : null}
        {actionLabel ? (
          <div className="pt-2">
            {actionTo ? (
              <Button as={Link} to={actionTo} variant="outline">
                {actionLabel}
              </Button>
            ) : (
              <Button variant="outline" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}