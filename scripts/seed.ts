/**
 * Seed MongoDB with farms, cycles, and performance data from mock data.
 * Usage: npm run db:seed
 *
 * Re-run after schema changes to sync all content into MongoDB.
 */
import "dotenv/config";

import { connectDB, disconnectDB } from "../src/lib/db.server";
import { CompletedCycleRecord } from "../src/lib/models/completed-cycle.model.server";
import { Cycle } from "../src/lib/models/cycle.model.server";
import { Farm } from "../src/lib/models/farm.model.server";
import { FaqItem } from "../src/lib/models/faq.model.server";
import { Payout } from "../src/lib/models/payout.model.server";
import { PlatformMetrics } from "../src/lib/models/platform-metrics.model.server";
import { TeamMember } from "../src/lib/models/team-member.model.server";
import { Product } from "../src/lib/models/product.model.server";
import { GalleryItem } from "../src/lib/models/gallery-item.model.server";
import {
  catalogGallery,
  catalogProducts,
  completedCycles,
  faqItems,
  farms,
  opportunities,
  payoutHistory,
  performanceSummary,
  platformStats,
  teamMembers,
} from "../src/lib/mock-data";
import { catalogGallery, catalogProducts } from "../src/lib/catalog-data";

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  console.log("Seeding farms...");
  for (const farm of farms) {
    await Farm.findOneAndUpdate(
      { slug: farm.slug },
      { $set: { ...farm, published: true } },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding cycles...");
  for (const cycle of opportunities) {
    await Cycle.findOneAndUpdate(
      { slug: cycle.slug },
      { $set: { ...cycle, published: true } },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding platform metrics...");
  await PlatformMetrics.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        ...performanceSummary,
        platformStats: [...platformStats],
      },
    },
    { upsert: true, new: true },
  );

  console.log("Seeding completed cycles...");
  for (const [index, cycle] of completedCycles.entries()) {
    const { id, ...rest } = cycle;
    await CompletedCycleRecord.findOneAndUpdate(
      { cycleId: id },
      {
        $set: {
          ...rest,
          cycleId: id,
          sortOrder: completedCycles.length - index,
          published: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding payouts...");
  for (const [index, payout] of payoutHistory.entries()) {
    await Payout.findOneAndUpdate(
      { cycleId: payout.cycleId },
      { $set: { ...payout, sortOrder: payoutHistory.length - index, published: true } },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding FAQ...");
  for (const [index, item] of faqItems.entries()) {
    await FaqItem.findOneAndUpdate(
      { question: item.q },
      {
        $set: {
          question: item.q,
          answer: item.a,
          sortOrder: faqItems.length - index,
          published: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding team members...");
  for (const [index, member] of teamMembers.entries()) {
    await TeamMember.findOneAndUpdate(
      { name: member.name },
      {
        $set: {
          ...member,
          credentials: [...member.credentials],
          sortOrder: teamMembers.length - index,
          published: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding products...");
  for (const [index, product] of catalogProducts.entries()) {
    await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          ...product,
          sortOrder: catalogProducts.length - index,
          published: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log("Seeding gallery...");
  for (const [index, item] of catalogGallery.entries()) {
    await GalleryItem.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          ...item,
          sortOrder: catalogGallery.length - index,
          published: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  const [farmCount, cycleCount, completedCount, payoutCount, faqCount, teamCount, productCount, galleryCount] =
    await Promise.all([
    Farm.countDocuments(),
    Cycle.countDocuments(),
    CompletedCycleRecord.countDocuments(),
    Payout.countDocuments(),
    FaqItem.countDocuments(),
    TeamMember.countDocuments(),
    Product.countDocuments(),
    GalleryItem.countDocuments(),
  ]);
  console.log(
    `Done. ${farmCount} farms, ${cycleCount} cycles, ${completedCount} completed records, ${payoutCount} payouts, ${faqCount} FAQ, ${teamCount} team, ${productCount} products, ${galleryCount} gallery items.`,
  );

  await disconnectDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
