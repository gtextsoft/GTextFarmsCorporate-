import { imagePaths } from "@/lib/image-paths";

export type CycleType = "broiler" | "layer" | "feed_mill" | "processing";
export type RiskLevel = "Low" | "Moderate" | "High";

export interface UseOfFundsItem {
  label: string;
  amount: string;
}

export interface UnitEconomics {
  rows: { label: string; value: string }[];
  revenue: string;
  totalCosts: string;
  expectedProfit: string;
}

export interface InvestmentTerms {
  lockPeriod: string;
  earlyWithdrawal: string;
  secondaryMarket: string;
  structure: string;
}

export interface WorstCaseScenario {
  scenario: string;
  impact: string;
  mitigation: string;
}

export interface CycleFinancials {
  feedCost: string;
  vaccinationCost: string;
  laborCost: string;
  logisticsCost: string;
  otherCosts: string;
  expectedRevenue: string;
}

export interface CycleJournalEntry {
  week: string;
  title: string;
  note: string;
}

export interface Opportunity {
  slug: string;
  type: string;
  cycleType: CycleType;
  title: string;
  img: string;
  location: string;
  farmName: string;
  farmSlug: string;
  roi: string;
  roiMin: number;
  roiMax: number;
  duration: string;
  durationMonths: number;
  risk: RiskLevel;
  filled: number;
  raised: string;
  raisedAmount: number;
  target: string;
  targetAmount: number;
  minimumInvestment: string;
  minimumInvestmentAmount: number;
  birdCount?: number;
  status: "funding" | "active" | "draft" | "closed";
  description: string;
  financials: CycleFinancials;
  useOfFunds: UseOfFundsItem[];
  unitEconomics: UnitEconomics;
  investmentTerms: InvestmentTerms;
  worstCaseScenarios: WorstCaseScenario[];
  ownershipModel: string;
  journal: CycleJournalEntry[];
  risks: string[];
  published?: boolean;
}

export interface FarmVerification {
  farmVisited: boolean;
  vetVerified: boolean;
  cacVerified: boolean;
  geoTagged: boolean;
  lastInspection: string;
}

export interface Farm {
  slug: string;
  name: string;
  location: string;
  state: string;
  capacity: string;
  birdCount: string;
  mortality: string;
  fcr: string;
  cyclesPerYear: number;
  heroImage: string;
  description: string;
  activeCycleSlug?: string;
  ownershipModel: string;
  operatorName: string;
  managerName: string;
  verification: FarmVerification;
  published?: boolean;
}

export interface CompletedCycle {
  id: string;
  title: string;
  farmName: string;
  type: string;
  roiProjected: string;
  roiDelivered: string;
  status: "Completed" | "Closed";
  completedDate: string;
  investors: number;
}

export interface PayoutRecord {
  cycleTitle: string;
  cycleId: string;
  investors: number;
  capitalReturned: string;
  profitPaid: string;
  payoutDate: string;
  verified: boolean;
}

export interface PerformanceSummary {
  totalCycles: number;
  completedCycles: number;
  successRate: string;
  totalPaidOut: string;
  avgRoiDelivered: string;
  totalInvestors: number;
}

export const platformStats = [
  { value: "₦450M+", label: "Invested to date" },
  { value: "12,000+", label: "Verified investors" },
  { value: "8", label: "Active farms" },
  { value: "96%", label: "Cycle success rate" },
] as const;

export const performanceSummary: PerformanceSummary = {
  totalCycles: 14,
  completedCycles: 13,
  successRate: "96%",
  totalPaidOut: "₦412M",
  avgRoiDelivered: "14.6%",
  totalInvestors: 12_400,
};

export const completedCycles: CompletedCycle[] = [
  {
    id: "ibadan-broiler-cycle-13",
    title: "Ibadan Broiler Cycle #13",
    farmName: "GText Farm 03",
    type: "Broiler",
    roiProjected: "15%",
    roiDelivered: "14.3%",
    status: "Completed",
    completedDate: "May 2026",
    investors: 342,
  },
  {
    id: "ibadan-broiler-cycle-12",
    title: "Ibadan Broiler Cycle #12",
    farmName: "GText Farm 03",
    type: "Broiler",
    roiProjected: "17%",
    roiDelivered: "16.1%",
    status: "Completed",
    completedDate: "Nov 2025",
    investors: 298,
  },
  {
    id: "ibadan-broiler-cycle-11",
    title: "Ibadan Broiler Cycle #11",
    farmName: "GText Farm 03",
    type: "Broiler",
    roiProjected: "13%",
    roiDelivered: "13.4%",
    status: "Completed",
    completedDate: "May 2025",
    investors: 256,
  },
  {
    id: "layer-abeokuta-cycle-02",
    title: "Layer Cycle · Abeokuta #2",
    farmName: "GText Farm 05",
    type: "Layer",
    roiProjected: "18%",
    roiDelivered: "17.2%",
    status: "Completed",
    completedDate: "Jan 2026",
    investors: 189,
  },
];

export const lastPayout: PayoutRecord = {
  cycleTitle: "Ibadan Broiler Cycle #13",
  cycleId: "ibadan-broiler-cycle-13",
  investors: 342,
  capitalReturned: "₦38.5M",
  profitPaid: "₦5.8M",
  payoutDate: "May 12, 2026",
  verified: true,
};

export const payoutHistory: PayoutRecord[] = [
  lastPayout,
  {
    cycleTitle: "Ibadan Broiler Cycle #12",
    cycleId: "ibadan-broiler-cycle-12",
    investors: 298,
    capitalReturned: "₦36.2M",
    profitPaid: "₦5.1M",
    payoutDate: "Nov 18, 2025",
    verified: true,
  },
  {
    cycleTitle: "Ibadan Broiler Cycle #11",
    cycleId: "ibadan-broiler-cycle-11",
    investors: 256,
    capitalReturned: "₦32.8M",
    profitPaid: "₦4.2M",
    payoutDate: "May 8, 2025",
    verified: true,
  },
  {
    cycleTitle: "Layer Cycle · Abeokuta #2",
    cycleId: "layer-abeokuta-cycle-02",
    investors: 189,
    capitalReturned: "₦28.4M",
    profitPaid: "₦4.9M",
    payoutDate: "Jan 22, 2026",
    verified: true,
  },
];

const broilerUseOfFunds: UseOfFundsItem[] = [
  { label: "Day-old chicks", amount: "₦9M" },
  { label: "Feed", amount: "₦22M" },
  { label: "Vaccines", amount: "₦2M" },
  { label: "Labour", amount: "₦3M" },
  { label: "Logistics", amount: "₦4M" },
  { label: "Contingency", amount: "₦5M" },
];

const broilerUnitEconomics: UnitEconomics = {
  rows: [
    { label: "Birds stocked", value: "12,000" },
    { label: "Expected survivors", value: "11,820" },
    { label: "Avg weight at harvest", value: "2.5 kg" },
    { label: "Selling price / kg", value: "₦3,500" },
  ],
  revenue: "₦103.4M",
  totalCosts: "₦88M",
  expectedProfit: "₦15.4M",
};

const broilerWorstCase: WorstCaseScenario[] = [
  {
    scenario: "Disease outbreak",
    impact: "Mortality may exceed 1.5% benchmark, reducing bird sales.",
    mitigation: "Vaccination protocol, vet on-site, contingency fund (₦5M) per cycle.",
  },
  {
    scenario: "Feed price increase",
    impact: "Margins compress if maize/soy costs rise mid-cycle.",
    mitigation: "Forward contracts on 60% of feed; price adjustment clause in offtake.",
  },
  {
    scenario: "Market price crash",
    impact: "Lower broiler selling price reduces revenue at harvest.",
    mitigation: "Pre-negotiated wholesale offtake with 2 anchor buyers.",
  },
  {
    scenario: "Flooding / infrastructure damage",
    impact: "Operational disruption, potential bird loss.",
    mitigation: "Elevated housing, drainage systems, insurance on facilities.",
  },
  {
    scenario: "Theft / security breach",
    impact: "Loss of birds or equipment.",
    mitigation: "24/7 security, geo-fenced farm, inventory audits weekly.",
  },
];

const defaultInvestmentTerms = (duration: string): InvestmentTerms => ({
  lockPeriod: duration,
  earlyWithdrawal: "No",
  secondaryMarket: "Coming soon",
  structure: "Profit-sharing in a named production cycle",
});

export const opportunities: Opportunity[] = [
  {
    slug: "ibadan-broiler-cycle-14",
    type: "Broiler farming",
    cycleType: "broiler",
    title: "Ibadan Broiler Cycle #14",
    img: imagePaths.heroFarm,
    location: "Oyo State",
    farmName: "GText Farm 03",
    farmSlug: "henhouse-farm-03",
    roi: "12 – 18%",
    roiMin: 12,
    roiMax: 18,
    duration: "6 months",
    durationMonths: 6,
    risk: "Moderate",
    filled: 76,
    raised: "₦34.2M",
    raisedAmount: 34_200_000,
    target: "₦45M",
    targetAmount: 45_000_000,
    minimumInvestment: "₦50,000",
    minimumInvestmentAmount: 50_000,
    birdCount: 12_000,
    status: "funding",
    ownershipModel: "GText-operated · CAC-registered entity",
    description:
      "A 6-month broiler production cycle on GText Farm 03 in Ibadan. 12,000 birds raised to market weight with full veterinary oversight and weekly field reporting.",
    useOfFunds: broilerUseOfFunds,
    unitEconomics: broilerUnitEconomics,
    investmentTerms: defaultInvestmentTerms("6 months"),
    worstCaseScenarios: broilerWorstCase,
    financials: {
      feedCost: "₦22M",
      vaccinationCost: "₦2M",
      laborCost: "₦3M",
      logisticsCost: "₦4M",
      otherCosts: "₦14M",
      expectedRevenue: "₦103.4M",
    },
    journal: [
      { week: "Week 1", title: "Day-old chicks arrived", note: "12,000 birds received from verified hatchery." },
      { week: "Week 2", title: "Vaccination phase 1", note: "Newcastle + Gumboro administered. 100% coverage." },
      { week: "Week 3", title: "Feed conversion check", note: "FCR 1.42 — tracking ahead of benchmark." },
      { week: "Week 4", title: "Mid-cycle weigh-in", note: "Avg weight 1.65kg. Mortality 0.9%." },
    ],
    risks: [
      "Disease outbreaks (avian influenza, Newcastle disease) may increase mortality beyond projections.",
      "Feed price volatility can reduce margins if grain costs rise mid-cycle.",
      "Broiler market prices fluctuate with supply and seasonal demand.",
    ],
  },
  {
    slug: "layer-expansion-abeokuta",
    type: "Egg production",
    cycleType: "layer",
    title: "Layer Expansion · Abeokuta",
    img: imagePaths.eggLine,
    location: "Ogun State",
    farmName: "GText Farm 05",
    farmSlug: "henhouse-farm-05",
    roi: "16 – 22%",
    roiMin: 16,
    roiMax: 22,
    duration: "12 months",
    durationMonths: 12,
    risk: "Moderate",
    filled: 42,
    raised: "₦18.9M",
    raisedAmount: 18_900_000,
    target: "₦45M",
    targetAmount: 45_000_000,
    minimumInvestment: "₦100,000",
    minimumInvestmentAmount: 100_000,
    birdCount: 8_000,
    status: "funding",
    ownershipModel: "GText-operated · Partner farm agreement",
    description:
      "Expand layer capacity at Abeokuta with 8,000 birds for sustained egg production over 12 months. Revenue from daily egg sales to wholesale buyers.",
    useOfFunds: [
      { label: "Point-of-lay pullets", amount: "₦12M" },
      { label: "Feed (12 months)", amount: "₦18M" },
      { label: "Vaccines & health", amount: "₦2.5M" },
      { label: "Labour", amount: "₦5M" },
      { label: "Cage & equipment", amount: "₦4M" },
      { label: "Contingency", amount: "₦3.5M" },
    ],
    unitEconomics: {
      rows: [
        { label: "Layers stocked", value: "8,000" },
        { label: "Peak laying rate", value: "85%" },
        { label: "Eggs / bird / year", value: "280" },
        { label: "Wholesale price / crate", value: "₦2,800" },
      ],
      revenue: "₦58.4M",
      totalCosts: "₦45M",
      expectedProfit: "₦13.4M",
    },
    investmentTerms: defaultInvestmentTerms("12 months"),
    worstCaseScenarios: [
      {
        scenario: "Egg price decline",
        impact: "Wholesale egg prices may fall with oversupply.",
        mitigation: "Contracts with 3 wholesale buyers at floor price.",
      },
      {
        scenario: "Layer health issues",
        impact: "Laying rate drops below 80%, reducing revenue.",
        mitigation: "Weekly vet checks, vaccination schedule, mortality buffer.",
      },
      {
        scenario: "Feed cost spike",
        impact: "12-month exposure to grain price volatility.",
        mitigation: "Quarterly feed contracts; cost pass-through in offtake.",
      },
    ],
    financials: {
      feedCost: "₦18M",
      vaccinationCost: "₦2.5M",
      laborCost: "₦5M",
      logisticsCost: "₦2M",
      otherCosts: "₦17.5M",
      expectedRevenue: "₦58.4M",
    },
    journal: [
      { week: "Week 1", title: "Facility preparation", note: "Cages sanitized and ventilation systems checked." },
      { week: "Week 2", title: "Pullet arrival", note: "8,000 point-of-lay birds received." },
    ],
    risks: [
      "Egg prices vary with supply from competing farms and import policies.",
      "Layer health issues can reduce laying rates below 85% peak production.",
      "Extended cycle duration increases exposure to feed cost changes.",
    ],
  },
  {
    slug: "feed-mill-expansion",
    type: "Feed milling",
    cycleType: "feed_mill",
    title: "Feed Mill Expansion",
    img: imagePaths.feed,
    location: "Kaduna State",
    farmName: "GText Feed Mill 01",
    farmSlug: "henhouse-feed-mill-01",
    roi: "10 – 14%",
    roiMin: 10,
    roiMax: 14,
    duration: "9 months",
    durationMonths: 9,
    risk: "Low",
    filled: 91,
    raised: "₦27.3M",
    raisedAmount: 27_300_000,
    target: "₦30M",
    targetAmount: 30_000_000,
    minimumInvestment: "₦75,000",
    minimumInvestmentAmount: 75_000,
    status: "funding",
    ownershipModel: "GText-owned · Internal offtake guaranteed",
    description:
      "Capacity expansion for compound feed production serving GText Farms farm network. Lower risk profile with contracted offtake from internal farms.",
    useOfFunds: [
      { label: "Equipment (mixer, pelletizer)", amount: "₦14M" },
      { label: "Raw material stock", amount: "₦8M" },
      { label: "Labour & operations", amount: "₦4.5M" },
      { label: "Logistics", amount: "₦2M" },
      { label: "Contingency", amount: "₦1.5M" },
    ],
    unitEconomics: {
      rows: [
        { label: "Capacity increase", value: "20 tons/day" },
        { label: "Internal offtake", value: "85% guaranteed" },
        { label: "Margin per ton", value: "₦12,000" },
        { label: "Operating months", value: "9" },
      ],
      revenue: "₦38.6M",
      totalCosts: "₦30M",
      expectedProfit: "₦8.6M",
    },
    investmentTerms: defaultInvestmentTerms("9 months"),
    worstCaseScenarios: [
      {
        scenario: "Raw material price spike",
        impact: "Maize/soy costs reduce feed margin.",
        mitigation: "Internal offtake at cost-plus pricing; 90-day stock buffer.",
      },
      {
        scenario: "Equipment delay",
        impact: "Revenue recognition pushed later in cycle.",
        mitigation: "Penalty clauses with supplier; phased commissioning plan.",
      },
    ],
    financials: {
      feedCost: "₦0",
      vaccinationCost: "₦0",
      laborCost: "₦4.5M",
      logisticsCost: "₦2M",
      otherCosts: "₦23.5M",
      expectedRevenue: "₦38.6M",
    },
    journal: [
      { week: "Week 1", title: "Equipment procurement", note: "Mixer and pelletizer delivery scheduled." },
      { week: "Week 2", title: "Site preparation", note: "Foundation work 60% complete." },
    ],
    risks: [
      "Raw material (maize, soy) price spikes affect margin on feed sales.",
      "Equipment delays could push revenue recognition later in the cycle.",
      "Dependent on continued demand from GText Farms farm network.",
    ],
  },
];

const defaultVerification: FarmVerification = {
  farmVisited: true,
  vetVerified: true,
  cacVerified: true,
  geoTagged: true,
  lastInspection: "June 2026",
};

export const farms: Farm[] = [
  {
    slug: "henhouse-farm-03",
    name: "GText Farm 03",
    location: "Ibadan",
    state: "Oyo State",
    capacity: "18,500 bird capacity",
    birdCount: "12,000",
    mortality: "0.9%",
    fcr: "1.42",
    cyclesPerYear: 4,
    heroImage: imagePaths.farmAerial,
    description:
      "Our flagship broiler facility in Ibadan with modern ventilation, automated feeding, and on-site veterinary lab. Hosts 4 production cycles per year.",
    activeCycleSlug: "ibadan-broiler-cycle-14",
    ownershipModel: "GText-operated",
    operatorName: "GText Farms Agritech Ltd.",
    managerName: "Adaeze Okafor",
    verification: defaultVerification,
  },
  {
    slug: "henhouse-farm-05",
    name: "GText Farm 05",
    location: "Abeokuta",
    state: "Ogun State",
    capacity: "10,000 layer capacity",
    birdCount: "8,000",
    mortality: "0.6%",
    fcr: "1.85",
    cyclesPerYear: 2,
    heroImage: imagePaths.eggLine,
    description:
      "Layer farm focused on table egg production for South-West wholesale markets. Automated egg collection and grading systems.",
    activeCycleSlug: "layer-expansion-abeokuta",
    ownershipModel: "GText-operated · Partner agreement",
    operatorName: "GText Farms Agritech Ltd.",
    managerName: "Adaeze Okafor",
    verification: { ...defaultVerification, lastInspection: "May 2026" },
  },
  {
    slug: "henhouse-feed-mill-01",
    name: "GText Feed Mill 01",
    location: "Kaduna",
    state: "Kaduna State",
    capacity: "50 tons/day",
    birdCount: "—",
    mortality: "—",
    fcr: "—",
    cyclesPerYear: 1,
    heroImage: imagePaths.feed,
    description:
      "Compound feed mill supplying the GText Farms farm network with quality-controlled poultry feed.",
    activeCycleSlug: "feed-mill-expansion",
    ownershipModel: "GText-owned facility",
    operatorName: "GText Farms Agritech Ltd.",
    managerName: "Samuel Eze",
    verification: { ...defaultVerification, lastInspection: "April 2026" },
  },
];

export const teamMembers = [
  {
    name: "Adaeze Okafor",
    role: "Head of Farm Operations",
    img: imagePaths.team1,
    yearsExperience: 11,
    bio: "11 years managing commercial poultry operations across South-West Nigeria. Oversees 3 GText Farms farms and 48,000+ birds in active production.",
    credentials: ["B.Agric. Animal Science, UNILAG", "Former ops lead, Zartech Farms"],
  },
  {
    name: "Dr. Tunde Bello",
    role: "Lead Veterinarian",
    img: imagePaths.team2,
    yearsExperience: 14,
    bio: "14 years in poultry veterinary medicine. Managed health programs for over 3 million birds across commercial farms in Nigeria.",
    credentials: ["DVM, University of Ibadan", "NVMA Licensed", "WOAH-certified avian health specialist"],
  },
  {
    name: "Samuel Eze",
    role: "Field Reporting Officer",
    img: imagePaths.team3,
    yearsExperience: 7,
    bio: "7 years in agricultural field operations and data reporting. Publishes weekly farm audits with photo evidence and mortality logs.",
    credentials: ["B.Sc. Agricultural Extension", "Certified field auditor, NIRSAL"],
  },
] as const;

export const faqItems = [
  {
    q: "What happens if birds die during the cycle?",
    a: "Mortality up to industry benchmark (1.5%) is built into our projections. Catastrophic events above that are covered through an operational risk buffer funded from platform fees - disclosed in every investment agreement.",
  },
  {
    q: "How are profits calculated?",
    a: "Revenue (birds sold × market price) minus operational costs (feed, vaccination, labor, logistics, financing) divided proportionally by investor contribution. Full breakdown shown before you fund.",
  },
  {
    q: "How secure is my investment?",
    a: "GText Farms is CAC registered and NDPR compliant. Funds are held in a regulated custodian account, separate from operating capital. Every farm is independently audited.",
  },
  {
    q: "Can I withdraw early?",
    a: "Capital is locked for the cycle duration - birds don't grow on demand. You can list your position on the secondary market after day 30, subject to a buyer.",
  },
  {
    q: "Who manages the farms?",
    a: "Each farm has a named operations manager and licensed veterinarian on payroll. Field officers publish weekly photo and data reports.",
  },
] as const;

export function getOpportunityBySlug(slug: string): Opportunity | undefined {
  return opportunities.find((o) => o.slug === slug);
}

export function getFarmBySlug(slug: string): Farm | undefined {
  return farms.find((f) => f.slug === slug);
}
