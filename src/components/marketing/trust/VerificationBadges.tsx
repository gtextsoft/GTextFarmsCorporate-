import { BadgeCheck, MapPin, ShieldCheck, Stethoscope } from "lucide-react";

import type { FarmVerification } from "@/lib/mock-data";

const badges = [
  { key: "farmVisited" as const, label: "Farm visited", icon: MapPin },
  { key: "vetVerified" as const, label: "Vet verified", icon: Stethoscope },
  { key: "cacVerified" as const, label: "CAC verified", icon: ShieldCheck },
  { key: "geoTagged" as const, label: "Geo-tagged", icon: BadgeCheck },
];

export function VerificationBadges({
  verification,
  compact,
}: {
  verification: FarmVerification;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-3"}>
      {!compact && (
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Verification
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {badges.map(({ key, label, icon: Icon }) =>
          verification[key] ? (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/5 px-2.5 py-1 text-xs font-medium text-forest-deep"
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ) : null,
        )}
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground">
          Last inspection: {verification.lastInspection}
        </p>
      )}
    </div>
  );
}
