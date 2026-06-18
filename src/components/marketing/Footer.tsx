import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/marketing/Logo";
import { brand } from "@/lib/brand";

const footerLinks = {
  Product: [
    { label: "Products", to: "/products" as const },
    { label: "Gallery", to: "/gallery" as const },
    { label: "Opportunities", to: "/opportunities" as const },
    { label: "Track record", to: "/performance" as const },
    { label: "Live farms", to: "/farms" as const },
    { label: "Reports", to: "/" as const, hash: "farms" as const },
    { label: "Dashboard", to: "/auth/sign-in" as const },
  ],
  Company: [
    { label: "About", to: "/about" as const },
    { label: "Team", to: "/about" as const, hash: "team" as const },
    { label: "Contact", to: "/contact" as const },
    { label: "Careers", to: "/contact" as const, hash: "careers" as const },
  ],
  Legal: [
    { label: "Terms", to: "/legal/terms" as const },
    { label: "Risk disclosure", to: "/legal/risk" as const },
    { label: "Privacy", to: "/legal/privacy" as const },
    { label: "Investment agreement", to: "/legal/investment-agreement" as const },
  ],
} as const;

function FootCol({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string; hash?: string }[];
}) {
  return (
    <div className="md:col-span-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} hash={l.hash} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-bone/60 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-base font-semibold">{brand.name}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{brand.footerBlurb}</p>
          <p className="mt-6 text-xs text-muted-foreground">
            {brand.legalName} · {brand.location}
          </p>
        </div>
        <FootCol title="Product" links={footerLinks.Product} />
        <FootCol title="Company" links={footerLinks.Company} />
        <FootCol title="Legal" links={footerLinks.Legal} />
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {brand.legalName} All rights reserved.</span>
        <span className="italic">
          Investments carry risk. Past cycle performance does not guarantee future returns.
        </span>
      </div>
    </footer>
  );
}
