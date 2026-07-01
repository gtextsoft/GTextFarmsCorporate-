import { createFileRoute } from "@tanstack/react-router";

import { FarmUpdatesFeed } from "@/components/app/FarmUpdatesFeed";
import { getInvestorActivityFeedFn } from "@/lib/api/field-reports.functions";

export const Route = createFileRoute("/app/activity/")({
  head: () => ({ meta: [{ title: "Farm Updates — GText Farms" }] }),
  loader: () => getInvestorActivityFeedFn(),
  component: ActivityPage,
});

function ActivityPage() {
  const feed = Route.useLoaderData();

  if ("error" in feed) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-destructive">{feed.error}</p>
        </div>
      </main>
    );
  }

  return <FarmUpdatesFeed reports={feed} />;
}
