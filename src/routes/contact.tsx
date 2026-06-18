import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { brand, brandTitle } from "@/lib/brand";
import { catalogProducts } from "@/lib/catalog-data";

const contactSearchSchema = z.object({
  product: z.string().optional(),
  intent: z.enum(["quote", "bulk"]).optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: contactSearchSchema,
  head: () => ({
    meta: [
      { title: brandTitle("Contact") },
      {
        name: "description",
        content: `Contact ${brand.name} for product quotes, bulk orders, investments, and partnerships.`,
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { product: productSlug, intent } = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);

  const product = useMemo(
    () => catalogProducts.find((p) => p.slug === productSlug),
    [productSlug],
  );

  const defaultSubject = product
    ? `Product quote — ${product.name}`
    : intent === "bulk"
      ? "Bulk order inquiry"
      : "General inquiry";

  const defaultMessage = product
    ? `Hello ${brand.name} team,\n\nI would like a quote for ${product.name} (${product.unit}).\n\nQuantity needed:\nDelivery location:\nPreferred contact method:`
    : intent === "bulk"
      ? `Hello ${brand.name} team,\n\nI am interested in placing a bulk order. Products of interest:\nEstimated volume:\nDelivery schedule:\n`
      : "";

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Contact"
                title="Talk to our team."
                sub="Product quotes, bulk orders, investments, farm transparency, or partnerships — we respond within one business day."
              />

              {product && (
                <div className="mt-8 rounded-2xl border border-forest/30 bg-forest/5 p-5 text-sm">
                  <p className="font-medium">Requesting a quote for</p>
                  <p className="mt-1 text-muted-foreground">{product.name}</p>
                  <Link to="/products" className="mt-3 inline-block text-forest-deep hover:underline">
                    Browse all products
                  </Link>
                </div>
              )}

              <div id="careers" className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h3 className="font-semibold">Careers</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We're hiring farm operations managers, field officers, and engineers. Send your CV
                  to{" "}
                  <a
                    href={`mailto:${brand.contact.careersEmail}`}
                    className="text-forest-deep hover:underline"
                  >
                    {brand.contact.careersEmail}
                  </a>
                </p>
              </div>

              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="font-medium">Sales & bulk orders</dt>
                  <dd className="text-muted-foreground">
                    <a href={`mailto:${brand.contact.salesEmail}`} className="hover:text-foreground">
                      {brand.contact.salesEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Investor relations</dt>
                  <dd className="text-muted-foreground">
                    <a href={`mailto:${brand.contact.investEmail}`} className="hover:text-foreground">
                      {brand.contact.investEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd className="text-muted-foreground">{brand.contact.phone}</dd>
                </div>
                <div>
                  <dt className="font-medium">Office</dt>
                  <dd className="text-muted-foreground">{brand.contact.office}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              {submitted ? (
                <div className="py-8 text-center">
                  <h3 className="font-display text-2xl">Message received</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks for reaching out. Our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form
                  key={`${productSlug ?? ""}-${intent ?? ""}`}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      defaultValue={defaultSubject}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      defaultValue={defaultMessage}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
