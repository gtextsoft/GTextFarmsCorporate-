/**
 * GText Farms — client brand identity (from GText_Farms_PRD.docx).
 * Single source of truth for company name, positioning, and public copy.
 */
export const brand = {
  name: "GText Farms",
  legalName: "GText Farms Ltd.",
  tagline: "Growing Healthy Food. Creating Sustainable Wealth.",
  foundingYear: "2018",

  /** Parent company — agricultural arm of GText Holdings (Dr Stephen Akintayo). */
  parentCompany: {
    name: "GText Holdings",
    url: "https://gtextholdings.com",
    description:
      "Diversified Nigerian holding group spanning agriculture, renewable energy, and technology.",
  },

  headline: "Feeding Africa Through Smart Agriculture",
  subheadline:
    "GText Farms combines modern farming, food processing, and agricultural investment opportunities to create sustainable food systems and profitable investments.",

  /** Investment-led hero copy for the landing page — leads with returns + trust. */
  investHeadline: "Real returns from real Nigerian farms.",
  investSubheadline:
    "Fund verified poultry cycles, follow them with weekly field reports, and get your principal plus ROI paid to your wallet at harvest.",

  mission:
    "To provide healthy agricultural products while creating wealth opportunities through sustainable farming.",
  vision: "To become Africa's most trusted agricultural ecosystem.",
  values: ["Integrity", "Excellence", "Innovation", "Sustainability", "Transparency"] as const,

  /** Integrated operations per PRD — poultry investment is the live product surface today. */
  businessLines: [
    {
      title: "Vegetable Farming",
      description: "Fresh tomatoes, peppers, and seasonal produce for local and wholesale markets.",
    },
    {
      title: "Poultry Farming",
      description: "Broiler and layer production with veterinary oversight and transparent investor cycles.",
    },
    {
      title: "Cassava Farming",
      description: "Commercial cassava cultivation supporting processing and food security goals.",
    },
    {
      title: "Cassava Processing",
      description: "Garri, cassava flour, and fufu flour for retail and bulk distribution.",
    },
    {
      title: "Palm Oil Production",
      description: "Plantation operations and crude palm oil supply for processors and buyers.",
    },
    {
      title: "Palm Oil Processing",
      description: "Refined palm oil and palm kernel oil products for domestic and export markets.",
    },
    {
      title: "Agricultural Consulting",
      description: "Advisory services for farm setup, operations, and sustainable agribusiness growth.",
    },
    {
      title: "Agricultural Investments",
      description: "Structured investment programs — including the Layer Poultry Investment Scheme.",
    },
  ] as const,

  investmentProgram: "Layer Poultry Investment Scheme",
  investmentProgramSummary:
    "Investors fund verified poultry production cycles. GText Farms manages birds, feeding, vaccination, production, and sales — with transparent monitoring and realistic returns.",

  footerBlurb:
    "A leading integrated agricultural company in Nigeria - farming, processing, consulting, and investment opportunities across poultry, vegetables, cassava, and palm oil.",
  location: "Nigeria",

  /** Geographic SEO — Victoria Island HQ, nationwide operations. */
  geo: {
    region: "NG-LA",
    placename: "Lagos, Nigeria",
    locale: "en_NG",
    latitude: 6.4281,
    longitude: 3.4219,
    position: "6.4281;3.4219",
    icbm: "6.4281, 3.4219",
  },

  social: [
    "https://gtextfarms.com",
    "https://gtextholdings.com",
  ] as const,

  seoKeywords:
    "GText Farms, GText Holdings, Nigerian agriculture, poultry investment, farm investment Nigeria, agricultural investment, broiler farming, layer poultry, farm fresh produce Nigeria, Lagos agribusiness, sustainable farming Africa",

  contact: {
    salesEmail: "sales@gtextfarms.ng",
    investEmail: "invest@gtextfarms.ng",
    careersEmail: "careers@gtextfarms.ng",
    phone: "+234 800 GTEXT FARMS",
    phoneE164: "+2347063649172",
    office: "Victoria Island, Lagos, Nigeria",
  },
} as const;

export function brandTitle(page: string) {
  return `${page} — ${brand.name}`;
}
