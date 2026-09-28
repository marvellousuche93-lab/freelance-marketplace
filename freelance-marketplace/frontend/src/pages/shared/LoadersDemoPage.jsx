/**
 * LoadersDemoPage — a visual catalog of every loader shape.
 *
 * Route: /dashboard/loaders (dev-only convenience)
 *
 * Not linked from anywhere. Just useful for confirming the loader
 * system is rendering correctly.
 */

import Skeleton from "../../components/loaders/Skeleton";
import FullPageLoader from "../../components/loaders/FullPageLoader";
import InlineLoader from "../../components/loaders/InlineLoader";
import BrandedLoader from "../../components/loaders/BrandedLoader";
import TopProgressBar from "../../components/loaders/TopProgressBar";

export default function LoadersDemoPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Loader catalog</h1>

      <Section title="Skeleton.Text">
        <Skeleton.Text lines={3} />
      </Section>

      <Section title="Skeleton.Avatar">
        <div className="flex items-center gap-3">
          <Skeleton.Avatar size="xs" />
          <Skeleton.Avatar size="sm" />
          <Skeleton.Avatar size="md" />
          <Skeleton.Avatar size="lg" />
          <Skeleton.Avatar size="xl" />
        </div>
      </Section>

      <Section title="Skeleton.Card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton.Card withHeader withFooter />
          <Skeleton.Card withHeader />
          <Skeleton.Card />
        </div>
      </Section>

      <Section title="Skeleton.Row">
        <div className="space-y-3">
          <Skeleton.Row />
          <Skeleton.Row />
          <Skeleton.Row />
        </div>
      </Section>

      <Section title="Skeleton.Table">
        <Skeleton.Table rows={4} columns={4} />
      </Section>

      <Section title="Skeleton.StatGrid">
        <Skeleton.StatGrid count={4} />
      </Section>

      <Section title="Skeleton.Detail">
        <Skeleton.Detail />
      </Section>

      <Section title="Skeleton.ChatList">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800">
          <Skeleton.ChatList rows={5} />
        </div>
      </Section>

      <Section title="Skeleton.ChatBubbles">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800">
          <Skeleton.ChatBubbles count={6} />
        </div>
      </Section>

      <Section title="InlineLoader">
        <InlineLoader label="Saving changes…" />
      </Section>

      <Section title="BrandedLoader (embedded)">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl">
          <BrandedLoader label="Preparing your dashboard" sublabel="Almost ready." />
        </div>
      </Section>

      <Section title="FullPageLoader (embedded)">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl">
          <FullPageLoader label="Loading" sublabel="Embedded preview" />
        </div>
      </Section>

      <Section title="TopProgressBar (animated)">
        <div className="relative h-12 border border-slate-200 dark:border-slate-800 rounded-xl">
          <TopProgressBar active />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Bar animates from 8% up to 90% while active.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}