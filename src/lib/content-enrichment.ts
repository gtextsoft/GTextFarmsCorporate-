import { imagePaths } from "@/lib/image-paths";
import type {
  CycleFinancials,
  CycleJournalEntry,
  Farm,
  FarmVerification,
  InvestmentTerms,
  Opportunity,
  UnitEconomics,
  UseOfFundsItem,
  WorstCaseScenario,
} from "@/lib/mock-data";

export type FarmRecord = { slug: string } & Record<string, unknown>;
export type OpportunityRecord = { slug: string } & Record<string, unknown>;

const EMPTY_VERIFICATION: FarmVerification = {
  farmVisited: false,
  vetVerified: false,
  cacVerified: false,
  geoTagged: false,
  lastInspection: "—",
};

const EMPTY_FINANCIALS: CycleFinancials = {
  feedCost: "—",
  vaccinationCost: "—",
  laborCost: "—",
  logisticsCost: "—",
  otherCosts: "—",
  expectedRevenue: "—",
};

const EMPTY_UNIT_ECONOMICS: UnitEconomics = {
  rows: [],
  revenue: "—",
  totalCosts: "—",
  expectedProfit: "—",
};

const EMPTY_INVESTMENT_TERMS: InvestmentTerms = {
  lockPeriod: "—",
  earlyWithdrawal: "—",
  secondaryMarket: "—",
  structure: "—",
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function mapVerification(raw: unknown): FarmVerification {
  if (!raw || typeof raw !== "object") return { ...EMPTY_VERIFICATION };
  const v = raw as Record<string, unknown>;
  return {
    farmVisited: bool(v.farmVisited),
    vetVerified: bool(v.vetVerified),
    cacVerified: bool(v.cacVerified),
    geoTagged: bool(v.geoTagged),
    lastInspection: str(v.lastInspection, "—"),
  };
}

function mapFinancials(raw: unknown): CycleFinancials {
  if (!raw || typeof raw !== "object") return { ...EMPTY_FINANCIALS };
  const f = raw as Record<string, unknown>;
  return {
    feedCost: str(f.feedCost, "—"),
    vaccinationCost: str(f.vaccinationCost, "—"),
    laborCost: str(f.laborCost, "—"),
    logisticsCost: str(f.logisticsCost, "—"),
    otherCosts: str(f.otherCosts, "—"),
    expectedRevenue: str(f.expectedRevenue, "—"),
  };
}

function mapUseOfFunds(raw: unknown): UseOfFundsItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return { label: str(row.label), amount: str(row.amount) };
    })
    .filter((item) => item.label || item.amount);
}

function mapUnitEconomics(raw: unknown): UnitEconomics {
  if (!raw || typeof raw !== "object") return { ...EMPTY_UNIT_ECONOMICS };
  const u = raw as Record<string, unknown>;
  const rows = Array.isArray(u.rows)
    ? u.rows
        .filter((row) => row && typeof row === "object")
        .map((row) => {
          const r = row as Record<string, unknown>;
          return { label: str(r.label), value: str(r.value) };
        })
    : [];
  return {
    rows,
    revenue: str(u.revenue, "—"),
    totalCosts: str(u.totalCosts, "—"),
    expectedProfit: str(u.expectedProfit, "—"),
  };
}

function mapInvestmentTerms(raw: unknown): InvestmentTerms {
  if (!raw || typeof raw !== "object") return { ...EMPTY_INVESTMENT_TERMS };
  const t = raw as Record<string, unknown>;
  return {
    lockPeriod: str(t.lockPeriod, "—"),
    earlyWithdrawal: str(t.earlyWithdrawal, "—"),
    secondaryMarket: str(t.secondaryMarket, "—"),
    structure: str(t.structure, "—"),
  };
}

function mapWorstCaseScenarios(raw: unknown): WorstCaseScenario[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        scenario: str(row.scenario),
        impact: str(row.impact),
        mitigation: str(row.mitigation),
      };
    })
    .filter((item) => item.scenario);
}

function mapJournal(raw: unknown): CycleJournalEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return { week: str(row.week), title: str(row.title), note: str(row.note) };
    })
    .filter((item) => item.week || item.title);
}

function mapRisks(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export function mapFarmDoc(doc: FarmRecord): Farm {
  return {
    slug: doc.slug,
    name: str(doc.name, "Unnamed farm"),
    location: str(doc.location),
    state: str(doc.state),
    capacity: str(doc.capacity, "—"),
    birdCount: str(doc.birdCount, "—"),
    mortality: str(doc.mortality, "—"),
    fcr: str(doc.fcr, "—"),
    cyclesPerYear: num(doc.cyclesPerYear, 1),
    heroImage: str(doc.heroImage, imagePaths.farmAerial),
    description: str(doc.description, ""),
    activeCycleSlug: str(doc.activeCycleSlug) || undefined,
    ownershipModel: str(doc.ownershipModel, "—"),
    operatorName: str(doc.operatorName, "—"),
    managerName: str(doc.managerName, "—"),
    verification: mapVerification(doc.verification),
    published: doc.published !== false,
  };
}

export function mapCycleDoc(doc: OpportunityRecord): Opportunity {
  const raisedAmount = num(doc.raisedAmount);
  const targetAmount = num(doc.targetAmount);
  const minimumInvestmentAmount = num(doc.minimumInvestmentAmount, 50_000);
  const status = str(doc.status, "funding") as Opportunity["status"];

  return {
    slug: doc.slug,
    type: str(doc.type, "Poultry cycle"),
    cycleType: (str(doc.cycleType, "broiler") || "broiler") as Opportunity["cycleType"],
    title: str(doc.title, "Untitled cycle"),
    img: str(doc.img, imagePaths.heroFarm),
    location: str(doc.location),
    farmName: str(doc.farmName),
    farmSlug: str(doc.farmSlug),
    roi: str(doc.roi, "—"),
    roiMin: num(doc.roiMin),
    roiMax: num(doc.roiMax),
    duration: str(doc.duration, "—"),
    durationMonths: num(doc.durationMonths, 6),
    risk: (str(doc.risk, "Moderate") || "Moderate") as Opportunity["risk"],
    filled: num(doc.filled),
    raised: str(doc.raised, raisedAmount > 0 ? `₦${(raisedAmount / 1_000_000).toFixed(1)}M` : "₦0"),
    raisedAmount,
    target: str(doc.target, targetAmount > 0 ? `₦${(targetAmount / 1_000_000).toFixed(0)}M` : "₦0"),
    targetAmount,
    minimumInvestment: str(
      doc.minimumInvestment,
      `₦${minimumInvestmentAmount.toLocaleString()}`,
    ),
    minimumInvestmentAmount,
    birdCount: typeof doc.birdCount === "number" ? doc.birdCount : undefined,
    status: ["funding", "active", "draft", "closed"].includes(status) ? status : "funding",
    description: str(doc.description, ""),
    ownershipModel: str(doc.ownershipModel, "—"),
    financials: mapFinancials(doc.financials),
    useOfFunds: mapUseOfFunds(doc.useOfFunds),
    unitEconomics: mapUnitEconomics(doc.unitEconomics),
    investmentTerms: mapInvestmentTerms(doc.investmentTerms),
    worstCaseScenarios: mapWorstCaseScenarios(doc.worstCaseScenarios),
    journal: mapJournal(doc.journal),
    risks: mapRisks(doc.risks),
    published: doc.published !== false,
  };
}

/** @deprecated Use mapFarmDoc — kept for call-site compatibility */
export const enrichFarm = mapFarmDoc;

/** @deprecated Use mapCycleDoc — kept for call-site compatibility */
export const enrichOpportunity = mapCycleDoc;
