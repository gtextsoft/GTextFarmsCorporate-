import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — GText Farms" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <MarketingLayout>
      <LegalPage title="Privacy Policy" lastUpdated="June 15, 2026">
        <LegalSection title="1. Introduction">
          <p>
            GText Farms Ltd. is committed to protecting your personal data in accordance with
            the Nigeria Data Protection Regulation (NDPR) and applicable laws.
          </p>
        </LegalSection>
        <LegalSection title="2. Data we collect">
          <p>
            We collect identity information (name, address, BVN/NIN hashes, government ID),
            contact details, financial transaction records, device information, and usage data
            necessary to provide investment services.
          </p>
        </LegalSection>
        <LegalSection title="3. How we use your data">
          <p>
            Data is used for identity verification, account management, investment processing,
            regulatory compliance, fraud prevention, and communication about your investments.
          </p>
        </LegalSection>
        <LegalSection title="4. Data sharing">
          <p>
            We share data with regulated payment processors, KYC verification providers, and
            authorities when required by law. We do not sell your personal data.
          </p>
        </LegalSection>
        <LegalSection title="5. Security">
          <p>
            We implement encryption, access controls, and audit logging. Sensitive identifiers
            such as BVN are hashed or tokenized — we do not store raw BVN in application logs.
          </p>
        </LegalSection>
        <LegalSection title="6. Your rights">
          <p>
            You may request access, correction, or deletion of your personal data subject to
            legal retention requirements. Contact invest@gtextfarms.ng to exercise your rights.
          </p>
        </LegalSection>
        <LegalSection title="7. Data retention">
          <p>
            We retain investment and KYC records as required by financial regulations, typically
            for a minimum of six years after account closure.
          </p>
        </LegalSection>
      </LegalPage>
    </MarketingLayout>
  );
}
