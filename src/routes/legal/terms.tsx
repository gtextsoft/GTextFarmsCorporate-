import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — GText Farms" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <MarketingLayout>
      <LegalPage title="Terms of Service" lastUpdated="June 15, 2026">
        <LegalSection title="1. Agreement">
          <p>
            By accessing or using GText Farms Ltd. ("GText Farms", "we", "us") services, you
            agree to these Terms of Service. If you do not agree, do not use our platform.
          </p>
        </LegalSection>
        <LegalSection title="2. Eligibility">
          <p>
            You must be at least 18 years old and legally capable of entering binding contracts
            under Nigerian law. You must complete identity verification (KYC) before investing.
          </p>
        </LegalSection>
        <LegalSection title="3. Investment services">
          <p>
            GText Farms facilitates investment in poultry production cycles. Investments carry risk,
            including potential loss of capital. Returns are not guaranteed. Past performance does
            not indicate future results.
          </p>
        </LegalSection>
        <LegalSection title="4. Account responsibilities">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity under your account. Notify us immediately of unauthorized access.
          </p>
        </LegalSection>
        <LegalSection title="5. Fees">
          <p>
            Platform fees, if applicable, are disclosed before you confirm each investment.
            Withdrawal fees may apply as stated in your investor agreement.
          </p>
        </LegalSection>
        <LegalSection title="6. Limitation of liability">
          <p>
            To the maximum extent permitted by law, GText Farms is not liable for indirect, incidental,
            or consequential damages arising from use of the platform or investment performance.
          </p>
        </LegalSection>
        <LegalSection title="7. Governing law">
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall
            be subject to the exclusive jurisdiction of courts in Lagos State.
          </p>
        </LegalSection>
      </LegalPage>
    </MarketingLayout>
  );
}
