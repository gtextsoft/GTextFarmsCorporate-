import type { ReactNode } from "react";

import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
