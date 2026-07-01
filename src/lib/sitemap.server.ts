import { getSiteUrl } from "@/lib/seo";
import { withDatabase } from "@/lib/with-database";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/farms",
  "/products",
  "/gallery",
  "/news",
  "/performance",
  "/co-operative",
  "/legal/privacy",
  "/legal/terms",
  "/legal/risk",
  "/legal/investment-agreement",
  "/legal/cooperative-bylaws",
] as const;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(loc: string, lastmod?: string) {
  const lastmodTag = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "";
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${lastmodTag}\n  </url>`;
}

export async function buildSitemapXml() {
  const base = getSiteUrl();
  const today = new Date().toISOString().slice(0, 10);
  const urls = new Set<string>(STATIC_PATHS.map((path) => `${base}${path}`));

  try {
    await withDatabase(async () => {
      const [{ Farm }, { NewsPost }] = await Promise.all([
        import("@/lib/models/farm.model.server"),
        import("@/lib/models/news-post.model.server"),
      ]);

      const [farms, news] = await Promise.all([
        Farm.find({ published: true }).select("slug updatedAt").lean(),
        NewsPost.find({ published: true }).select("slug updatedAt").lean(),
      ]);

      for (const farm of farms) urls.add(`${base}/farms/${farm.slug}`);
      for (const post of news) urls.add(`${base}/news/${post.slug}`);
    });
  } catch {
    // Static sitemap still useful when DB is unavailable (local dev).
  }

  const body = [...urls].sort().map((loc) => urlEntry(loc, today)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
