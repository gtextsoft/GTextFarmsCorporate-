import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/legal/investment-agreement")({
  head: () => ({ meta: [{ title: "Investment Agreement — GText Farms" }] }),
  component: InvestmentAgreementPage,
});

function InvestmentAgreementPage() {
  return (
    <MarketingLayout>
      <LegalPage title="Investment Agreement" lastUpdated="June 15, 2026">
        <LegalSection title="Summary">
          <p>
            This agreement governs your participation in a GText Farms poultry production cycle. By
            confirming an investment, you agree to the terms below and acknowledge the risk
            disclosure.
          </p>
        </LegalSection>
        <LegalSection title="1. Investment structure">
          <p>
            Your funds are allocated to a specific production cycle on a named farm. You receive a
            proportional share of net profits after operational costs, platform fees, and applicable
            taxes.
          </p>
        </LegalSection>
        <LegalSection title="2. Profit calculation">
          <p>
            Net profit = Gross revenue (sale of birds/eggs/products) minus documented operational
            costs (feed, vaccination, labor, logistics, financing). Your share = (your investment ÷
            total cycle funding) × net profit.
          </p>
        </LegalSection>
        <LegalSection title="3. Cycle duration">
          <p>
            Capital is locked from investment confirmation until cycle completion and payout
            processing. Duration is stated on each opportunity and typically ranges from 6 to 12
            months.
          </p>
        </LegalSection>
        <LegalSection title="4. Mortality buffer">
          <p>
            Projections assume mortality up to 1.5% for broiler cycles. Events exceeding benchmarks
            may be partially offset by an operational risk buffer as disclosed per cycle.
          </p>
        </LegalSection>
        <LegalSection title="5. Payout">
          <p>
            Principal and returns are credited to your GText Farms wallet upon cycle completion and
            admin verification. Payout timing depends on harvest, sales, and settlement - typically
            within 14 business days of cycle close.
          </p>
        </LegalSection>
        <LegalSection title="6. Representations">
          <p>
            You represent that investment funds are legally obtained, you have read the risk
            disclosure, and you understand returns are not guaranteed.
          </p>
        </LegalSection>
      </LegalPage>
    </MarketingLayout>
  );
}
