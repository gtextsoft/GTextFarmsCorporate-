import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/legal/cooperative-bylaws")({
  head: () => ({ meta: [{ title: "Co-operative Bylaws — GText Farms" }] }),
  component: CooperativeBylawsPage,
});

function CooperativeBylawsPage() {
  return (
    <MarketingLayout>
      <LegalPage title="GText Farms Co-operative Society — Bylaws" lastUpdated="June 2026">
        <LegalSection title="1. Name and registration">
          <p>
            The society shall be known as <strong>GText Farms Co-operative Society</strong>, duly
            registered under the laws of the Federal Republic of Nigeria.
          </p>
        </LegalSection>
        <LegalSection title="2. Objects">
          <p>
            The co-operative exists to organise members for participation in commercial poultry and
            agricultural investment programmes operated with transparency, shared governance, and fair
            returns.
          </p>
        </LegalSection>
        <LegalSection title="3. Membership">
          <p>
            Any person who completes registration, verifies their email, receives a membership
            number, and submits a complete membership profile may be admitted as a member subject to
            these bylaws.
          </p>
        </LegalSection>
        <LegalSection title="4. Rights and obligations">
          <p>
            Members may participate in approved investment programmes, receive communications about
            farm operations, and request withdrawals in accordance with programme rules. Members must
            provide accurate information, comply with investment agreements, and act in the best
            interest of the society.
          </p>
        </LegalSection>
        <LegalSection title="5. Governance">
          <p>
            The affairs of the society shall be managed by elected officers and overseen in line with
            applicable cooperative regulations. Detailed governance provisions will be published by the
            board and updated here.
          </p>
        </LegalSection>
        <LegalSection title="6. Amendments">
          <p>
            These bylaws may be amended by resolution of the general meeting in accordance with
            applicable law. Members will be notified of material changes.
          </p>
        </LegalSection>
        <LegalSection title="Note">
          <p className="text-muted-foreground">
            This is a placeholder summary for the platform. Replace with the client&apos;s official
            bylaws document (PDF or full legal text) before go-live.
          </p>
        </LegalSection>
      </LegalPage>
    </MarketingLayout>
  );
}
