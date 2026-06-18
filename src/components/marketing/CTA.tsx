import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground sm:p-16">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <h2 className="text-balance font-display text-5xl leading-[1.02] md:text-6xl">
                Real farms. Real birds.
                <br />
                <span className="italic text-accent">Real returns.</span>
              </h2>
              <p className="mt-4 max-w-md text-primary-foreground/75">
                Open your investor account in under 5 minutes. Fund a cycle today and watch the first
                report drop next week.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Create my account <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/"
                hash="how"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3.5 text-sm font-medium hover:bg-primary-foreground/10"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
