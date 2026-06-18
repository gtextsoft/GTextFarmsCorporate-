import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/legal/risk")({
  head: () => ({ meta: [{ title: "Risk Disclosure — GText Farms" }] }),
  component: RiskPage,
});

function RiskPage() {
  return (
    <MarketingLayout>
      <LegalPage title="Risk Disclosure" lastUpdated="June 15, 2026">
        <LegalSection title="Important notice">
          <p>
            Investing in agricultural production cycles involves significant risk. You may lose
            part or all of your invested capital. Only invest funds you can afford to lock for the
            full cycle duration.
          </p>
        </LegalSection>
        <LegalSection title="Operational risks">
          <p>
            Poultry farming is subject to disease outbreaks (avian influenza, Newcastle disease,
            etc.), mortality events, feed quality issues, equipment failure, and adverse weather.
            Mortality above projected levels reduces returns.
          </p>
        </LegalSection>
        <LegalSection title="Market risks">
          <p>
            Broiler and egg prices fluctuate with supply, demand, imports, and seasonal factors.
            Revenue projections are estimates based on current market conditions and may not
            materialize.
          </p>
        </LegalSection>
        <LegalSection title="Input cost risks">
          <p>
            Feed typically represents the largest operational cost. Maize, soy, and other input
            price increases during a cycle can reduce profit margins below projections.
          </p>
        </LegalSection>
        <LegalSection title="Liquidity risks">
          <p>
            Capital is locked for the cycle duration. Early withdrawal is not guaranteed. Secondary
            market listing, where available, depends on finding a willing buyer.
          </p>
        </LegalSection>
        <LegalSection title="Platform risks">
          <p>
            While GText Farms implements custodial safeguards and operational audits, platform,
            technology, and counterparty risks exist. No investment is insured by NDIC.
          </p>
        </LegalSection>
        <LegalSection title="No guarantee">
          <p>
            ROI figures shown on opportunities are estimates expressed as ranges, not promises.
            Actual returns may be lower than projected or zero. GText Farms does not guarantee any
            return on investment.
          </p>
        </LegalSection>
      </LegalPage>
    </MarketingLayout>
  );
}
