import { brand } from "@/lib/brand";
import { getPublicConfig } from "@/lib/config";

export type PageHeadInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

/** Absolute site origin without trailing slash. */
export function getSiteUrl() {
  return getPublicConfig().appUrl.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function defaultOgImage() {
  return absoluteUrl("/og-image.svg");
}

export function defaultFavicon() {
  return absoluteUrl("/favicon.svg");
}

/** Shared geo + locale signals for Nigeria / Lagos HQ. */
export function geoMeta() {
  const { geo } = brand;
  return [
    { name: "geo.region", content: geo.region },
    { name: "geo.placename", content: geo.placename },
    { name: "geo.position", content: geo.position },
    { name: "ICBM", content: geo.icbm },
  ] as const;
}

export function noindexMeta() {
  return [{ name: "robots", content: "noindex, nofollow" }] as const;
}

/** Private/authenticated routes — block indexing. */
export function privatePageHead(path: string, title: string) {
  return buildPageHead({ title, description: "", path, noindex: true });
}

/**
 * Full per-page head payload: title, description, canonical, OG, Twitter, geo.
 * Reuse on every indexable public route.
 */
export function buildPageHead({
  title,
  description,
  path = "/",
  image = defaultOgImage(),
  type = "website",
  noindex = false,
}: PageHeadInput) {
  const url = absoluteUrl(path);
  const pageTitle = title.includes(brand.name) ? title : `${title} — ${brand.name}`;

  const meta = [
    { title: pageTitle },
    { name: "description", content: description },
    { name: "author", content: brand.name },
    ...(noindex ? noindexMeta() : [{ name: "robots", content: "index, follow" }]),
    ...geoMeta(),
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: `${brand.name} — ${brand.tagline}` },
    { property: "og:site_name", content: brand.name },
    { property: "og:locale", content: brand.geo.locale },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: `${brand.name} — ${brand.tagline}` },
  ];

  const links = [{ rel: "canonical", href: url }];

  return { meta, links };
}

/** Root layout defaults — charset, viewport, icons, base social tags. */
export function rootHeadLinks() {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.svg" },
    { rel: "manifest", href: "/site.webmanifest" },
  ] as const;
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: brand.name,
        legalName: brand.legalName,
        url,
        logo: absoluteUrl("/favicon.svg"),
        description: brand.subheadline,
        foundingDate: brand.foundingYear,
        parentOrganization: {
          "@type": "Organization",
          name: brand.parentCompany.name,
          url: brand.parentCompany.url,
        },
        sameAs: [...brand.social],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: brand.contact.salesEmail,
          telephone: brand.contact.phoneE164,
          areaServed: "NG",
          availableLanguage: ["English"],
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: brand.contact.office,
          addressLocality: "Lagos",
          addressRegion: "Lagos",
          addressCountry: "NG",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: brand.name,
        url,
        description: brand.investSubheadline,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en-NG",
      },
      {
        "@type": "LocalBusiness",
        "@id": `${url}/#localbusiness`,
        name: brand.name,
        description: brand.mission,
        url,
        image: defaultOgImage(),
        telephone: brand.contact.phoneE164,
        email: brand.contact.salesEmail,
        address: {
          "@type": "PostalAddress",
          streetAddress: brand.contact.office,
          addressLocality: "Lagos",
          addressRegion: "Lagos",
          postalCode: "101241",
          addressCountry: "NG",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: brand.geo.latitude,
          longitude: brand.geo.longitude,
        },
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
        parentOrganization: { "@id": `${url}/#organization` },
      },
    ],
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.image ?? defaultOgImage(),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { "@type": "Organization", name: brand.name },
    publisher: {
      "@type": "Organization",
      name: brand.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/favicon.svg") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function farmJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  location: string;
  state: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.location,
      addressRegion: input.state,
      addressCountry: "NG",
    },
  };
}
