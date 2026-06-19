/**
 * Demo operational data for admin dashboard, queues, analytics, and client walkthroughs.
 * Idempotent — safe to re-run with npm run db:seed
 */
import bcrypt from "bcryptjs";
import type { Model } from "mongoose";

import type { CycleDocument } from "../src/lib/models/cycle.model.server";
import type { FarmDocument } from "../src/lib/models/farm.model.server";
import type { UserDocument } from "../src/lib/models/user.model.server";

const DEMO_PASSWORD = "ChangeMeDemo123!";

type UserModel = Model<UserDocument>;
type CycleModel = Model<CycleDocument>;
type FarmModel = Model<FarmDocument>;

const DEMO_INVESTORS = [
  {
    email: "investor@gtextfarms.ng",
    fullName: "Adaeze Okonkwo",
    kycStatus: "verified" as const,
    phone: "+2348012345678",
    city: "Lekki",
    state: "Lagos",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Adaeze Okonkwo",
    walletBalance: 850_000,
  },
  {
    email: "chioma.okafor@gtextfarms.demo",
    fullName: "Chioma Okafor",
    kycStatus: "submitted" as const,
    phone: "+2348023456789",
    city: "Enugu",
    state: "Enugu",
    bankName: "Access Bank",
    accountNumber: "0234567890",
    accountName: "Chioma Okafor",
    walletBalance: 120_000,
  },
  {
    email: "emeka.nwankwo@gtextfarms.demo",
    fullName: "Emeka Nwankwo",
    kycStatus: "submitted" as const,
    phone: "+2348034567890",
    city: "Port Harcourt",
    state: "Rivers",
    bankName: "UBA",
    accountNumber: "0345678901",
    accountName: "Emeka Nwankwo",
    walletBalance: 0,
  },
  {
    email: "fatima.bello@gtextfarms.demo",
    fullName: "Fatima Bello",
    kycStatus: "submitted" as const,
    phone: "+2348045678901",
    city: "Kano",
    state: "Kano",
    bankName: "Zenith Bank",
    accountNumber: "0456789012",
    accountName: "Fatima Bello",
    walletBalance: 50_000,
  },
  {
    email: "yusuf.ibrahim@gtextfarms.demo",
    fullName: "Yusuf Ibrahim",
    kycStatus: "pending" as const,
    phone: "+2348056789012",
    city: "Abuja",
    state: "FCT",
    walletBalance: 0,
  },
  {
    email: "grace.adeyemi@gtextfarms.demo",
    fullName: "Grace Adeyemi",
    kycStatus: "rejected" as const,
    kycRejectionReason: "BVN details could not be verified. Please resubmit with a clear ID photo.",
    phone: "+2348067890123",
    city: "Ibadan",
    state: "Oyo",
    walletBalance: 0,
  },
  {
    email: "samuel.adeyinka@gtextfarms.demo",
    fullName: "Samuel Adeyinka",
    kycStatus: "verified" as const,
    phone: "+2348078901234",
    city: "Abeokuta",
    state: "Ogun",
    bankName: "First Bank",
    accountNumber: "0567890123",
    accountName: "Samuel Adeyinka",
    walletBalance: 1_200_000,
  },
  {
    email: "blessing.eteo@gtextfarms.demo",
    fullName: "Blessing Eteo",
    kycStatus: "verified" as const,
    phone: "+2348089012345",
    city: "Benin City",
    state: "Edo",
    bankName: "Stanbic IBTC",
    accountNumber: "0678901234",
    accountName: "Blessing Eteo",
    walletBalance: 450_000,
  },
] as const;

const DEMO_INQUIRIES = [
  {
    key: "lead-general",
    name: "Kunle Ajayi",
    email: "kunle.ajayi@email.demo",
    phone: "+2348019988776",
    subject: "How does GText Farms investor onboarding work?",
    message:
      "I found your site through a friend. Can you explain how farm visits, KYC, and wallet funding work before I commit capital?",
    intent: "general" as const,
    status: "new" as const,
    daysAgo: 0,
  },
  {
    key: "lead-quote",
    name: "City Mart Superstores",
    email: "buying@citymart.demo",
    phone: "+2348183344556",
    subject: "Wholesale quote — dressed broilers",
    message: "Please send price list and MOQ for dressed broilers delivered to Lagos mainland.",
    intent: "quote" as const,
    status: "new" as const,
    daysAgo: 0,
  },
  {
    key: "lead-bulk",
    name: "Mama Chika Foods",
    email: "orders@mamachika.demo",
    phone: "+2348182233445",
    subject: "Bulk crate eggs — 500 crates/week",
    message:
      "Looking for a farm partner in the South-West for consistent weekly egg supply to Ibadan.",
    intent: "bulk" as const,
    status: "new" as const,
    daysAgo: 1,
  },
  {
    key: "lead-investment",
    name: "Tunde Bakare",
    email: "tunde.bakare@email.demo",
    phone: "+2348073344556",
    subject: "Investing ₦2M — which cycle is open?",
    message:
      "I have ₦2M ready and prefer broiler cycles under 6 months. What is the minimum and expected ROI?",
    intent: "investment" as const,
    status: "new" as const,
    daysAgo: 1,
  },
  {
    key: "lead-partnership",
    name: "Victoria Hotels Group",
    email: "procurement@victoriahotels.demo",
    phone: "+2348091122334",
    subject: "Weekly poultry supply for 3 Lagos hotels",
    message:
      "We need a reliable supplier for dressed broilers and eggs across VI and Lekki properties.",
    intent: "partnership" as const,
    status: "new" as const,
    daysAgo: 2,
  },
  {
    key: "lead-careers",
    name: "Amina Lawal",
    email: "amina.lawal@email.demo",
    subject: "Field operations role — CV submission",
    message: "I have 4 years in poultry farm management in Ogun State and would like to join your team.",
    intent: "careers" as const,
    status: "new" as const,
    daysAgo: 2,
  },
  {
    key: "lead-press",
    name: "AgriBusiness Nigeria",
    email: "editor@agribusinessng.demo",
    phone: "+2349098877665",
    subject: "Press feature — transparent farm investing",
    message:
      "We are writing on agritech investing in Nigeria. Available for an interview on your model and farm transparency?",
    intent: "press" as const,
    status: "new" as const,
    daysAgo: 3,
  },
  {
    key: "lead-invest-visit",
    name: "Ngozi Eze",
    email: "ngozi.eze@email.demo",
    subject: "Farm visit request before investing",
    message: "Can we schedule a visit to the Ibadan broiler facility next month?",
    intent: "investment" as const,
    status: "read" as const,
    daysAgo: 5,
  },
  {
    key: "lead-quote-replied",
    name: "GreenBridge Exports Ltd",
    email: "trade@greenbridge.demo",
    subject: "Vegetable export — habanero pricing",
    message: "Please share export-grade habanero pricing and harvest windows.",
    intent: "quote" as const,
    status: "replied" as const,
    adminNote: "Quote sent by sales team.",
    daysAgo: 7,
  },
  {
    key: "lead-general-archived",
    name: "Old enquiry — spam filter test",
    email: "spam@example.demo",
    subject: "Unrelated marketing email",
    message: "Archived test record.",
    intent: "general" as const,
    status: "archived" as const,
    daysAgo: 30,
  },
] as const;

const PENDING_REPORTS = [
  {
    cycleSlug: "ibadan-broiler-cycle-14",
    weekNumber: 5,
    title: "Pre-harvest weight sampling",
    body: "Average live weight 2.1kg across sample pens. Mortality remains within benchmark. Harvest window opens in 10 days.",
    mortalityRate: 1.1,
    birdCount: 11640,
    fcr: 1.52,
    feedConsumptionKg: 9200,
  },
  {
    cycleSlug: "layer-expansion-abeokuta",
    weekNumber: 5,
    title: "Egg grading & crate dispatch",
    body: "88% laying rate. 31,200 eggs collected this week. First major wholesale dispatch to Lagos completed.",
    mortalityRate: 0.7,
    birdCount: 7800,
    fcr: 1.78,
    eggCount: 31200,
  },
  {
    cycleSlug: "feed-mill-expansion",
    weekNumber: 2,
    title: "Pelletizer commissioning",
    body: "New pelletizer installed and test batch completed. Output quality meets internal farm specifications.",
    mortalityRate: undefined,
    birdCount: undefined,
    fcr: undefined,
  },
] as const;

export async function seedDemoOpsData(params: {
  User: UserModel;
  Cycle: CycleModel;
  Farm: FarmModel;
  Investment: Model<unknown>;
  Withdrawal: Model<unknown>;
  ContactInquiry: Model<unknown>;
  FieldReport: Model<unknown>;
  AuditLog: Model<unknown>;
  Wallet: Model<unknown>;
}) {
  const { User, Cycle, Farm, Investment, Withdrawal, ContactInquiry, FieldReport, AuditLog, Wallet } =
    params;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const userByEmail = new Map<string, UserDocument>();

  console.log("Seeding demo investors...");
  for (const investor of DEMO_INVESTORS) {
    const doc = await User.findOneAndUpdate(
      { email: investor.email },
      {
        $set: {
          fullName: investor.fullName,
          role: "investor",
          kycStatus: investor.kycStatus,
          phone: investor.phone,
          city: "city" in investor ? investor.city : undefined,
          state: "state" in investor ? investor.state : undefined,
          bankName: "bankName" in investor ? investor.bankName : undefined,
          accountNumber: "accountNumber" in investor ? investor.accountNumber : undefined,
          accountName: "accountName" in investor ? investor.accountName : undefined,
          kycRejectionReason:
            "kycRejectionReason" in investor ? investor.kycRejectionReason : undefined,
          passwordHash,
        },
      },
      { upsert: true, new: true },
    );
    userByEmail.set(investor.email, doc);

    if (investor.walletBalance > 0) {
      await Wallet.findOneAndUpdate(
        { userId: doc._id },
        { $set: { balance: investor.walletBalance, lockedBalance: 0, currency: "NGN" } },
        { upsert: true, new: true },
      );
    }
  }

  const admin =
    (await User.findOne({ role: { $in: ["admin", "super_admin"] } })) ??
    (await User.findOne({ email: "admin@gtextfarms.ng" }));
  const fieldOfficer = await User.findOne({ role: "field_officer" });

  const author = fieldOfficer ?? admin;
  if (!author) {
    console.log("Skipping demo ops queues — run db:create-admin first.");
    return;
  }

  console.log("Seeding demo investments...");
  const investmentSeeds = [
    {
      email: "investor@gtextfarms.ng",
      cycleSlug: "ibadan-broiler-cycle-14",
      amount: 250_000,
      certificate: "GTEXT-INV-2026-001",
    },
    {
      email: "investor@gtextfarms.ng",
      cycleSlug: "layer-expansion-abeokuta",
      amount: 150_000,
      certificate: "GTEXT-INV-2026-002",
    },
    {
      email: "samuel.adeyinka@gtextfarms.demo",
      cycleSlug: "layer-expansion-abeokuta",
      amount: 500_000,
      certificate: "GTEXT-INV-2026-003",
    },
    {
      email: "samuel.adeyinka@gtextfarms.demo",
      cycleSlug: "feed-mill-expansion",
      amount: 300_000,
      certificate: "GTEXT-INV-2026-004",
    },
    {
      email: "blessing.eteo@gtextfarms.demo",
      cycleSlug: "ibadan-broiler-cycle-14",
      amount: 180_000,
      certificate: "GTEXT-INV-2026-005",
    },
    {
      email: "blessing.eteo@gtextfarms.demo",
      cycleSlug: "feed-mill-expansion",
      amount: 220_000,
      certificate: "GTEXT-INV-2026-006",
    },
  ] as const;

  for (const inv of investmentSeeds) {
    const user = userByEmail.get(inv.email);
    const cycle = await Cycle.findOne({ slug: inv.cycleSlug });
    if (!user || !cycle) continue;

    await Investment.findOneAndUpdate(
      { userId: user._id, cycleSlug: cycle.slug },
      {
        $set: {
          cycleId: cycle._id,
          cycleSlug: cycle.slug,
          cycleTitle: cycle.title,
          amount: inv.amount,
          status: "confirmed",
          certificateNumber: inv.certificate,
          expectedReturnMin: cycle.roiMin ?? 12,
          expectedReturnMax: cycle.roiMax ?? 18,
          investedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding pending withdrawals...");
  const withdrawalSeeds = [
    {
      email: "investor@gtextfarms.ng",
      amount: 150_000,
      reference: "WTH-DEMO-001",
      daysAgo: 1,
    },
    {
      email: "samuel.adeyinka@gtextfarms.demo",
      amount: 320_000,
      reference: "WTH-DEMO-002",
      daysAgo: 2,
    },
    {
      email: "blessing.eteo@gtextfarms.demo",
      amount: 75_000,
      reference: "WTH-DEMO-003",
      daysAgo: 0,
    },
  ] as const;

  for (const w of withdrawalSeeds) {
    const user = userByEmail.get(w.email);
    if (!user || !user.bankName || !user.accountNumber || !user.accountName) continue;

    const createdAt = new Date(Date.now() - w.daysAgo * 24 * 60 * 60 * 1000);
    await Withdrawal.findOneAndUpdate(
      { reference: w.reference },
      {
        $set: {
          userId: user._id,
          amount: w.amount,
          bankName: user.bankName,
          accountNumber: user.accountNumber,
          accountName: user.accountName,
          status: "pending",
          createdAt,
        },
      },
      { upsert: true, new: true },
    );

    await Wallet.findOneAndUpdate(
      { userId: user._id },
      { $set: { lockedBalance: w.amount } },
      { upsert: true },
    );
  }

  console.log("Seeding contact inquiries (leads)...");
  for (const inquiry of DEMO_INQUIRIES) {
    const createdAt = new Date(Date.now() - inquiry.daysAgo * 24 * 60 * 60 * 1000);
    await ContactInquiry.findOneAndUpdate(
      { subject: inquiry.subject, email: inquiry.email },
      {
        $set: {
          name: inquiry.name,
          email: inquiry.email,
          phone: "phone" in inquiry ? inquiry.phone : undefined,
          subject: inquiry.subject,
          message: inquiry.message,
          intent: inquiry.intent,
          status: inquiry.status,
          adminNote: "adminNote" in inquiry ? inquiry.adminNote : undefined,
          createdAt,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding field reports awaiting review...");
  for (const report of PENDING_REPORTS) {
    const cycle = await Cycle.findOne({ slug: report.cycleSlug });
    if (!cycle) continue;
    const farm = await Farm.findOne({ slug: cycle.farmSlug });
    if (!farm) continue;

    await FieldReport.findOneAndUpdate(
      { cycleSlug: cycle.slug, weekNumber: report.weekNumber, status: "submitted" },
      {
        $set: {
          cycleId: cycle._id,
          cycleSlug: cycle.slug,
          cycleTitle: cycle.title,
          farmId: farm._id,
          farmSlug: farm.slug,
          farmName: cycle.farmName,
          authorId: author._id,
          authorName: author.fullName ?? "Field Officer",
          weekNumber: report.weekNumber,
          title: report.title,
          body: report.body,
          mortalityRate: report.mortalityRate,
          birdCount: report.birdCount,
          fcr: report.fcr,
          feedConsumptionKg: "feedConsumptionKg" in report ? report.feedConsumptionKg : undefined,
          eggCount: "eggCount" in report ? report.eggCount : undefined,
          vaccinationStatus: report.mortalityRate != null ? "On schedule" : undefined,
          status: "submitted",
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding audit log samples...");
  const auditEntries = [
    {
      action: "kyc.approve",
      entityType: "user",
      email: "samuel.adeyinka@gtextfarms.demo",
      daysAgo: 2,
      details: { kycStatus: "verified" },
    },
    {
      action: "withdrawal.approve",
      entityType: "withdrawal",
      daysAgo: 4,
      details: { amount: 200_000, reference: "WTH-HIST-001" },
    },
    {
      action: "field_report.publish",
      entityType: "field_report",
      daysAgo: 5,
      details: { cycleTitle: "Ibadan Broiler Cycle 14", weekNumber: 4 },
    },
    {
      action: "kyc.reject",
      entityType: "user",
      email: "grace.adeyemi@gtextfarms.demo",
      daysAgo: 6,
      details: { reason: "BVN could not be verified" },
    },
    {
      action: "investment.confirm",
      entityType: "investment",
      daysAgo: 7,
      details: { amount: 500_000, cycle: "Layer Expansion Abeokuta" },
    },
    {
      action: "inquiry.update",
      entityType: "contact_inquiry",
      daysAgo: 8,
      details: { status: "replied" },
    },
  ] as const;

  for (const [index, entry] of auditEntries.entries()) {
    const user = "email" in entry ? userByEmail.get(entry.email) : undefined;
    const entityId = user?._id?.toString() ?? `demo-audit-${entry.action}`;
    const createdAt = new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000);
    await AuditLog.findOneAndUpdate(
      { action: entry.action, entityId },
      {
        $set: {
          actorId: admin?._id,
          actorEmail: admin?.email ?? "admin@gtextfarms.ng",
          action: entry.action,
          entityType: entry.entityType,
          entityId,
          details: entry.details,
          createdAt,
        },
      },
      { upsert: true, new: true },
    );
  }

  const [kycQueue, withdrawals, reports, leads, invested] = await Promise.all([
    User.countDocuments({ role: "investor", kycStatus: "submitted" }),
    Withdrawal.countDocuments({ status: "pending" }),
    FieldReport.countDocuments({ status: "submitted" }),
    ContactInquiry.countDocuments({ status: "new" }),
    Investment.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalInvested = invested[0]?.total ?? 0;
  console.log(
    `Demo ops ready — ₦${totalInvested.toLocaleString()} invested · ${kycQueue} KYC · ${withdrawals} withdrawals · ${reports} reports · ${leads} leads.`,
  );
  console.log(`Demo investor password (all @gtextfarms.demo accounts): ${DEMO_PASSWORD}`);
}
