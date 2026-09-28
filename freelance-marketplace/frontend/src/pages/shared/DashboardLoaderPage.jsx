/**
 * DashboardLoaderPage — a visual preview of the branded loader.
 *
 * Visit /dashboard/loaders to see the loader in isolation, without
 * needing a slow API. Useful for checking its appearance and animation
 * on different devices.
 */

import BrandedLoader from "../../components/loaders/BrandedLoader";

export default function DashboardLoaderPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <BrandedLoader
        label="Loading your dashboard"
        sublabel="Fetching your applications, saved jobs, and notifications…"
      />
    </div>
  );
}