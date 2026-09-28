/**
 * ContentState — the four-state wrapper: loading, error, empty, success.
 *
 * The loading state shows a BrandedLoader by default. If the caller
 * passes `loadingFallback`, that's used instead.
 */

import { AlertTriangle, Inbox } from "lucide-react";

import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import BrandedLoader from "./BrandedLoader";
import { cn } from "../../utils/cn";

export default function ContentState({
  loading,
  error,
  isEmpty,
  loadingFallback,
  loadingLabel,
  loadingSublabel,
  emptyFallback,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  errorFallback,
  onRetry,
  className = "",
  children,
}) {
  if (loading) {
    return (
      <div className={cn(className)} aria-busy="true" aria-live="polite">
        {loadingFallback ?? (
          <BrandedLoader
            label={loadingLabel || "Loading"}
            sublabel={loadingSublabel}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(className)}>
        {errorFallback ?? (
          <Card>
            <CardBody className="text-center py-10 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {typeof error === "string" ? error : "Unexpected error."}
              </p>
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn(className)}>
        {emptyFallback ?? (
          <Card>
            <CardBody className="text-center py-10 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                <Inbox size={22} />
              </div>
              <p className="font-medium">{emptyTitle}</p>
              {emptyDescription ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {emptyDescription}
                </p>
              ) : null}
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  return <div className={cn("animate-fade-in", className)}>{children}</div>;
}