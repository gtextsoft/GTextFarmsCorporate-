import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAdminDashboardFn } from "@/lib/api/admin.dashboard.functions";
import { formatNaira } from "@/lib/format";
import { inquiryIntentLabel } from "@/lib/inquiry-intents";

export const Route = createFileRoute("/admin/")({
  loader: () => getAdminDashboardFn(),
  component: AdminOverviewPage,
});

function SectionCard({
  title,
  description,
  actionTo,
  actionLabel,
  children,
}: {
  title: string;
  description?: string;
  actionTo?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actionTo && actionLabel && (
          <Button variant="ghost" size="sm" className="shrink-0" asChild>
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>;
}

function AdminOverviewPage() {
  const data = Route.useLoaderData();

  if (!data || "error" in data) {
    return (
      <AdminPage title="Dashboard" description="Could not load dashboard data.">
        <p className="text-muted-foreground">
          {data && "error" in data ? data.error : "Sign in as admin and ensure MongoDB is running."}
        </p>
      </AdminPage>
    );
  }

  const fundingCycles = data.fundingCycles.slice(0, 3);

  return (
    <AdminPage
      title="Dashboard"
      description="At a glance: funding, KYC, payouts, leads, and field updates."
      stats={[
        {
          label: "Total invested",
          value: formatNaira(data.platform.totalInvested),
          highlight: true,
          description: `${data.platform.investmentCount} confirmed investment${data.platform.investmentCount === 1 ? "" : "s"}`,
        },
        {
          label: "KYC awaiting review",
          value: data.queues.submittedKyc,
          highlight: data.queues.submittedKyc > 0,
          description: "Identity verification submissions",
        },
        {
          label: "Payouts pending",
          value: data.queues.pendingWithdrawals,
          highlight: data.queues.pendingWithdrawals > 0,
          description: formatNaira(data.queues.pendingWithdrawalAmount),
        },
        {
          label: "New leads",
          value: data.queues.newInquiries,
          highlight: data.queues.newInquiries > 0,
          description: "Unread contact form messages",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="KYC review"
          description={
            data.queues.submittedKyc > 0
              ? `${data.queues.submittedKyc} investor(s) waiting for identity verification`
              : "No KYC submissions in the queue."
          }
          actionTo="/admin/investors"
          actionLabel="All investors"
        >
          {data.kycQueue.length === 0 ? (
            <EmptyState message="No KYC submissions awaiting review." />
          ) : (
            <AdminDataTable
              data={data.kycQueue}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "investor",
                  header: "Investor",
                  cell: (row) => (
                    <div>
                      <div className="font-medium">{row.fullName}</div>
                      <div className="text-xs text-muted-foreground">{row.email}</div>
                    </div>
                  ),
                },
                {
                  id: "submitted",
                  header: "Submitted",
                  hideOnMobile: true,
                  cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                  className: "text-muted-foreground",
                },
                {
                  id: "action",
                  header: "",
                  cell: (row) => (
                    <Link
                      to="/admin/investors"
                      search={{ status: "submitted" }}
                      className="text-sm font-medium text-forest-deep hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Review
                    </Link>
                  ),
                  className: "text-right",
                },
              ]}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Leads"
          description={
            data.queues.newInquiries > 0
              ? `${data.queues.newInquiries} new message(s) — all enquiry types`
              : "No new contact form submissions."
          }
          actionTo="/admin/inquiries"
          actionLabel="All inquiries"
        >
          {data.inquiryQueue.length === 0 ? (
            <EmptyState message="No new leads. Messages from /contact will appear here." />
          ) : (
            <AdminDataTable
              data={data.inquiryQueue}
              getRowKey={(row) => row.id}
              caption="General · Quote · Bulk · Investment · Partnership · Careers · Press"
              columns={[
                {
                  id: "type",
                  header: "Type",
                  cell: (row) => (
                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {inquiryIntentLabel(row.intent)}
                    </span>
                  ),
                },
                {
                  id: "from",
                  header: "From",
                  cell: (row) => (
                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="hidden text-xs text-muted-foreground sm:block">{row.subject}</div>
                    </div>
                  ),
                },
                {
                  id: "received",
                  header: "Received",
                  hideOnMobile: true,
                  cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                  className: "text-muted-foreground",
                },
                {
                  id: "action",
                  header: "",
                  cell: () => (
                    <Link
                      to="/admin/inquiries"
                      className="text-sm font-medium text-forest-deep hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open
                    </Link>
                  ),
                  className: "text-right",
                },
              ]}
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Payout requests"
          description={
            data.queues.pendingWithdrawals > 0
              ? `${data.queues.pendingWithdrawals} withdrawal(s) · ${formatNaira(data.queues.pendingWithdrawalAmount)} total`
              : "No bank payout requests waiting."
          }
          actionTo="/admin/withdrawals"
          actionLabel="All payouts"
        >
          {data.withdrawalQueue.length === 0 ? (
            <EmptyState message="No pending withdrawal requests." />
          ) : (
            <AdminDataTable
              data={data.withdrawalQueue}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "investor",
                  header: "Investor",
                  cell: (row) => row.investorName,
                },
                {
                  id: "amount",
                  header: "Amount",
                  cell: (row) => (
                    <span className="font-semibold text-forest-deep">{formatNaira(row.amount)}</span>
                  ),
                },
                {
                  id: "requested",
                  header: "Requested",
                  hideOnMobile: true,
                  cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                  className: "text-muted-foreground",
                },
                {
                  id: "action",
                  header: "",
                  cell: () => (
                    <Link
                      to="/admin/withdrawals"
                      className="text-sm font-medium text-forest-deep hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Review
                    </Link>
                  ),
                  className: "text-right",
                },
              ]}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Field reports"
          description={
            data.queues.pendingReports > 0
              ? `${data.queues.pendingReports} weekly update(s) to publish`
              : "No field reports awaiting review."
          }
          actionTo="/admin/reports"
          actionLabel="All reports"
        >
          {data.reportQueue.length === 0 ? (
            <EmptyState message="No field reports in the review queue." />
          ) : (
            <AdminDataTable
              data={data.reportQueue}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "report",
                  header: "Report",
                  cell: (row) => (
                    <div>
                      <div className="font-medium">{row.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Week {row.weekNumber} · {row.authorName}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "farm",
                  header: "Farm",
                  hideOnMobile: true,
                  cell: (row) => row.farmName,
                  className: "text-muted-foreground",
                },
                {
                  id: "action",
                  header: "",
                  cell: () => (
                    <Link
                      to="/admin/reports"
                      className="text-sm font-medium text-forest-deep hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Review
                    </Link>
                  ),
                  className: "text-right",
                },
              ]}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Live funding"
        description="How open cycles are performing right now"
        actionTo="/admin/cycles"
        actionLabel="All cycles"
      >
        {fundingCycles.length === 0 ? (
          <EmptyState message="No cycles are actively funding." />
        ) : (
          <div className="space-y-5">
            {fundingCycles.map((cycle) => (
              <div key={cycle.slug} className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{cycle.title}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {cycle.fillPct}% · {formatNaira(cycle.raised)}
                    {cycle.target > 0 ? ` / ${formatNaira(cycle.target)}` : ""}
                  </span>
                </div>
                <Progress value={cycle.fillPct} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="flex flex-wrap gap-2 border-t border-border pt-2">
        <span className="w-full text-xs text-muted-foreground sm:w-auto sm:py-2">
          Deeper detail:
        </span>
        {[
          { label: "Analytics", to: "/admin/analytics" },
          { label: "Investors", to: "/admin/investors" },
          { label: "Audit log", to: "/admin/audit" },
        ].map((link) => (
          <Button key={link.to} variant="outline" size="sm" asChild>
            <Link to={link.to}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </AdminPage>
  );
}
