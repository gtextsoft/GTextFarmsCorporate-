import { imagePaths } from "@/lib/image-paths";

export const newsCategoryLabels = {
  farm_activity: "Farm Activity",
  harvest: "Harvest Report",
  expansion: "Expansion",
  investor_update: "Investor Update",
  general: "News",
} as const;

export type NewsCategory = keyof typeof newsCategoryLabels;

export const seedNewsPosts = [
  {
    slug: "layer-cycle-q2-2026-update",
    title: "Q2 layer cycle hits 94% production target",
    excerpt:
      "Egg production across GText Farm 03 remains above projection with mortality within industry benchmark.",
    body: "Our Q2 layer cycle at GText Farm 03 continues to perform strongly. Weekly field reports show consistent feed conversion ratios and vaccination compliance across all houses. Investors in the active cycle can view detailed operational data on their dashboard.",
    category: "farm_activity" as const,
    categoryLabel: newsCategoryLabels.farm_activity,
    imageUrl: imagePaths.eggLine,
    authorName: "GText Farms Operations",
  },
  {
    slug: "vegetable-blocks-expansion-ibadan",
    title: "Vegetable production blocks expanded in Ibadan",
    excerpt:
      "New irrigated plots added to support tomatoes and pepper supply for wholesale buyers.",
    body: "GText Farms has expanded vegetable production capacity with additional irrigated blocks in Ibadan. The expansion supports our fresh produce sales channel and strengthens supply for bulk buyers requesting tomatoes, habanero, and bell peppers.",
    category: "expansion" as const,
    categoryLabel: newsCategoryLabels.expansion,
    imageUrl: imagePaths.farmAerial,
    authorName: "GText Farms",
  },
  {
    slug: "investor-payout-cycle-12-complete",
    title: "Cycle 12 payout distributed to investors",
    excerpt:
      "Completed broiler cycle returns credited to investor wallets after final reconciliation.",
    body: "Cycle 12 has closed with returns distributed proportionally to all participating investors. Wallet credits are now visible in transaction history. Thank you for your continued trust in GText Farms production cycles.",
    category: "investor_update" as const,
    categoryLabel: newsCategoryLabels.investor_update,
    imageUrl: imagePaths.workerBird,
    authorName: "Investor Relations",
  },
] as const;
