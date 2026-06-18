import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const cycleFinancialsSchema = new Schema(
  {
    feedCost: String,
    vaccinationCost: String,
    laborCost: String,
    logisticsCost: String,
    otherCosts: String,
    expectedRevenue: String,
  },
  { _id: false },
);

const journalEntrySchema = new Schema(
  {
    week: String,
    title: String,
    note: String,
  },
  { _id: false },
);

const useOfFundsItemSchema = new Schema(
  {
    label: String,
    amount: String,
  },
  { _id: false },
);

const unitEconomicsSchema = new Schema(
  {
    rows: [{ label: String, value: String }],
    revenue: String,
    totalCosts: String,
    expectedProfit: String,
  },
  { _id: false },
);

const investmentTermsSchema = new Schema(
  {
    lockPeriod: String,
    earlyWithdrawal: String,
    secondaryMarket: String,
    structure: String,
  },
  { _id: false },
);

const worstCaseScenarioSchema = new Schema(
  {
    scenario: String,
    impact: String,
    mitigation: String,
  },
  { _id: false },
);

const cycleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    cycleType: {
      type: String,
      enum: ["broiler", "layer", "feed_mill", "processing"],
      required: true,
    },
    title: { type: String, required: true },
    img: { type: String, required: true },
    location: { type: String, required: true },
    farmName: { type: String, required: true },
    farmSlug: { type: String, required: true },
    roi: { type: String, required: true },
    roiMin: Number,
    roiMax: Number,
    duration: { type: String, required: true },
    durationMonths: Number,
    risk: { type: String, enum: ["Low", "Moderate", "High"], required: true },
    filled: { type: Number, default: 0 },
    raised: String,
    raisedAmount: Number,
    target: String,
    targetAmount: Number,
    minimumInvestment: String,
    minimumInvestmentAmount: Number,
    birdCount: Number,
    status: { type: String, enum: ["funding", "active", "draft", "closed"], default: "funding" },
    description: String,
    ownershipModel: String,
    financials: cycleFinancialsSchema,
    useOfFunds: [useOfFundsItemSchema],
    unitEconomics: unitEconomicsSchema,
    investmentTerms: investmentTermsSchema,
    worstCaseScenarios: [worstCaseScenarioSchema],
    journal: [journalEntrySchema],
    risks: [String],
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CycleDocument = InferSchemaType<typeof cycleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Cycle: Model<CycleDocument> =
  (mongoose.models.Cycle as Model<CycleDocument> | undefined) ??
  mongoose.model<CycleDocument>("Cycle", cycleSchema);
