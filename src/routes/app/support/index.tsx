import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import { InvestorSupportDashboard } from "@/components/app/InvestorSupportDashboard";
import { getPublicFaqFn } from "@/lib/api/content.functions";
import { faqItems as fallbackFaq } from "@/lib/mock-data";

export const Route = createFileRoute("/app/support/")({
  head: () => ({ meta: [{ title: "Support — GText Farms" }] }),
  loader: async () => {
    const faq = await getPublicFaqFn();
    return { faq: faq.length > 0 ? faq : [...fallbackFaq] };
  },
  component: SupportPage,
});

function SupportPage() {
  const { faq } = Route.useLoaderData();
  const { user } = useRouteContext({ from: "__root__" });

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">Support</p>
          <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Get help with KYC, wallet funding, investments, withdrawals, and farm performance —
            or send our investor support team a message.
          </p>
        </div>

        <InvestorSupportDashboard faq={faq} user={user} />
      </div>
    </main>
  );
}
