import { formatCompactNaira, formatCount } from "@/lib/format";
import { platformStats } from "@/lib/mock-data";

export interface TrustBarStat {
  value: string;
  label: string;
}

export interface LivePlatformStats {
  totalInvested: number;
  farmCount: number;
  openCycles: number;
  verifiedInvestors: number;
  successRate: string;
}

export function buildTrustBarStats(live: LivePlatformStats | null): TrustBarStat[] {
  if (!live) return [...platformStats];

  return [
    {
      value: live.totalInvested > 0 ? formatCompactNaira(live.totalInvested) : platformStats[0].value,
      label: "Invested to date",
    },
    {
      value:
        live.verifiedInvestors > 0
          ? formatCount(live.verifiedInvestors)
          : platformStats[1].value,
      label: "Verified investors",
    },
    {
      value: String(live.farmCount),
      label: "Active farms",
    },
    {
      value: live.successRate || platformStats[3].value,
      label: "Cycle success rate",
    },
  ];
}
