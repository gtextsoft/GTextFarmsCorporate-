import { imagePaths } from "@/lib/image-paths";

export type ProductCategory = "poultry" | "vegetables" | "processed";
export type GalleryCategory =
  | "poultry_farm"
  | "vegetable_farm"
  | "cassava_farm"
  | "palm_processing"
  | "harvest";

export const productCategoryLabels: Record<ProductCategory, string> = {
  poultry: "Poultry",
  vegetables: "Vegetables",
  processed: "Processed Products",
};

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  poultry_farm: "Poultry Farm",
  vegetable_farm: "Vegetable Farm",
  cassava_farm: "Cassava Farm",
  palm_processing: "Palm Oil Processing",
  harvest: "Harvest Activities",
};

export const catalogProducts = [
  {
    slug: "fresh-eggs",
    name: "Fresh Eggs",
    category: "poultry" as const,
    categoryLabel: productCategoryLabels.poultry,
    description:
      "Farm-fresh layer eggs from GText Farms poultry units. Available for retail packs and wholesale crates.",
    image: imagePaths.eggLine,
    unit: "per crate",
  },
  {
    slug: "broilers",
    name: "Broilers",
    category: "poultry" as const,
    categoryLabel: productCategoryLabels.poultry,
    description:
      "Market-weight broilers raised with veterinary oversight. Live bird and dressed options for distributors.",
    image: imagePaths.workerBird,
    unit: "per bird / bulk",
  },
  {
    slug: "tomatoes",
    name: "Tomatoes",
    category: "vegetables" as const,
    categoryLabel: productCategoryLabels.vegetables,
    description: "Fresh greenhouse and open-field tomatoes for markets, restaurants, and processors.",
    image: imagePaths.farmAerial,
    unit: "per basket",
  },
  {
    slug: "habanero-pepper",
    name: "Habanero Pepper",
    category: "vegetables" as const,
    categoryLabel: productCategoryLabels.vegetables,
    description: "Hot pepper harvests from GText vegetable farms — bulk supply for local and export buyers.",
    image: imagePaths.farmAerial,
    unit: "per bag",
  },
  {
    slug: "bell-pepper",
    name: "Bell Pepper",
    category: "vegetables" as const,
    categoryLabel: productCategoryLabels.vegetables,
    description: "Colour-grade bell peppers for supermarkets, caterers, and fresh produce distributors.",
    image: imagePaths.farmAerial,
    unit: "per carton",
  },
  {
    slug: "palm-oil",
    name: "Palm Oil",
    category: "processed" as const,
    categoryLabel: productCategoryLabels.processed,
    description: "Refined palm oil from GText processing operations. Food-grade quality for domestic and industrial use.",
    image: imagePaths.feed,
    unit: "per litre / drum",
  },
  {
    slug: "palm-kernel-oil",
    name: "Palm Kernel Oil",
    category: "processed" as const,
    categoryLabel: productCategoryLabels.processed,
    description: "Palm kernel oil extracted alongside our palm oil production line. Bulk orders welcome.",
    image: imagePaths.feed,
    unit: "per litre / drum",
  },
  {
    slug: "garri",
    name: "Garri",
    category: "processed" as const,
    categoryLabel: productCategoryLabels.processed,
    description: "Premium garri processed from GText cassava farms — retail packs and wholesale sacks.",
    image: imagePaths.feed,
    unit: "per bag",
  },
  {
    slug: "cassava-flour",
    name: "Cassava Flour",
    category: "processed" as const,
    categoryLabel: productCategoryLabels.processed,
    description: "Fine cassava flour for bakeries, food manufacturers, and export markets.",
    image: imagePaths.feed,
    unit: "per bag",
  },
  {
    slug: "fufu-flour",
    name: "Fufu Flour",
    category: "processed" as const,
    categoryLabel: productCategoryLabels.processed,
    description: "Processed fufu flour for households and food service — consistent quality from farm to mill.",
    image: imagePaths.feed,
    unit: "per bag",
  },
] as const;

export const catalogGallery = [
  {
    slug: "poultry-house-interior",
    title: "Poultry house interior",
    category: "poultry_farm" as const,
    categoryLabel: galleryCategoryLabels.poultry_farm,
    imageUrl: imagePaths.heroFarm,
    caption: "Broiler unit with climate-controlled housing and daily health checks.",
  },
  {
    slug: "egg-collection",
    title: "Egg collection line",
    category: "poultry_farm" as const,
    categoryLabel: galleryCategoryLabels.poultry_farm,
    imageUrl: imagePaths.eggLine,
    caption: "Layer production — graded and packed for wholesale distribution.",
  },
  {
    slug: "field-officer-inspection",
    title: "Field officer inspection",
    category: "poultry_farm" as const,
    categoryLabel: galleryCategoryLabels.poultry_farm,
    imageUrl: imagePaths.workerBird,
    caption: "Weekly audits with mortality logs and vaccination records.",
  },
  {
    slug: "vegetable-blocks",
    title: "Vegetable production blocks",
    category: "vegetable_farm" as const,
    categoryLabel: galleryCategoryLabels.vegetable_farm,
    imageUrl: imagePaths.farmAerial,
    caption: "Aerial view of irrigated vegetable plots and access roads.",
  },
  {
    slug: "vet-rounds",
    title: "Veterinary rounds",
    category: "poultry_farm" as const,
    categoryLabel: galleryCategoryLabels.poultry_farm,
    imageUrl: imagePaths.vet,
    caption: "Licensed veterinarian overseeing flock health programs.",
  },
  {
    slug: "cassava-field",
    title: "Cassava cultivation",
    category: "cassava_farm" as const,
    categoryLabel: galleryCategoryLabels.cassava_farm,
    imageUrl: imagePaths.farmAerial,
    caption: "Commercial cassava blocks feeding our processing mill.",
  },
  {
    slug: "feed-mill",
    title: "Compound feed mill",
    category: "cassava_farm" as const,
    categoryLabel: galleryCategoryLabels.cassava_farm,
    imageUrl: imagePaths.feed,
    caption: "Quality-controlled feed production for the GText farm network.",
  },
  {
    slug: "palm-processing",
    title: "Palm oil processing",
    category: "palm_processing" as const,
    categoryLabel: galleryCategoryLabels.palm_processing,
    imageUrl: imagePaths.feed,
    caption: "Processing line for palm oil and palm kernel products.",
  },
  {
    slug: "harvest-sorting",
    title: "Harvest sorting",
    category: "harvest" as const,
    categoryLabel: galleryCategoryLabels.harvest,
    imageUrl: imagePaths.eggLine,
    caption: "Post-harvest grading before dispatch to buyers.",
  },
  {
    slug: "farm-aerial",
    title: "Integrated farm estate",
    category: "harvest" as const,
    categoryLabel: galleryCategoryLabels.harvest,
    imageUrl: imagePaths.farmAerial,
    caption: "GText Farms operations across poultry, vegetables, and processing.",
  },
] as const;
