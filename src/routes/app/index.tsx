import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import { AppDashboardContent } from "@/components/app/AppDashboardContent";
import { getDashboardSummaryFn, getMyInvestmentsFn, getMyTransactionsFn } from "@/lib/api/wallet.functions";
import { getInvestorActivityFeedFn } from "@/lib/api/field-reports.functions";
import { getInvestorPerformanceFn } from "@/lib/api/investor.performance.functions";
import { getMyNotificationsFn } from "@/lib/api/notifications.functions";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — GText Farms" }] }),
  loader: async () => {
    const [summary, investments, activity, transactions, notifications, performance] =
      await Promise.all([
        getDashboardSummaryFn(),
        getMyInvestmentsFn(),
        getInvestorActivityFeedFn(),
        getMyTransactionsFn(),
        getMyNotificationsFn(),
        getInvestorPerformanceFn(),
      ]);
    return { summary, investments, activity, transactions, notifications, performance };
  },
  component: AppDashboard,
});

function AppDashboard() {
  const { user } = useRouteContext({ from: "__root__" });
  const { summary, investments, activity, transactions, notifications, performance } =
    Route.useLoaderData();

  const stats =
    "error" in summary
      ? {
          balance: 0,
          availableBalance: 0,
          totalInvested: 0,
          activeInvestments: 0,
          totalReturns: 0,
          projectedMonthly: 0,
        }
      : summary;

  return (
    <AppDashboardContent
      user={user ?? undefined}
      stats={stats}
      investments={"error" in investments ? [] : investments}
      activity={"error" in activity ? [] : activity}
      transactions={"error" in transactions ? [] : transactions}
      notifications={"error" in notifications ? [] : notifications}
      performance={"error" in performance ? { error: performance.error } : performance}
    />
  );
}
