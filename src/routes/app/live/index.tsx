import { createFileRoute } from "@tanstack/react-router";

import { FarmLive } from "@/components/app/FarmLive";
import { getInvestorPerformanceFn } from "@/lib/api/investor.performance.functions";

export const Route = createFileRoute("/app/live/")({
  head: () => ({ meta: [{ title: "View Farm Live — GText Farms" }] }),
  loader: () => getInvestorPerformanceFn(),
  component: FarmLivePage,
});

function FarmLivePage() {
  const performance = Route.useLoaderData();
  const cycles = "error" in performance ? [] : performance.cycles;

  return <FarmLive cycles={cycles} />;
}
