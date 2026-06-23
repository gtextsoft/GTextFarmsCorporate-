import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { verifyCoopEmailFn } from "@/lib/api/coop.functions";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/co-operative/verify")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    if (!deps.token) {
      return { error: "Missing verification token." as const };
    }
    const result = await verifyCoopEmailFn({ data: { token: deps.token } });
    if (result && "error" in result && result.error) {
      return { error: result.error };
    }
    return { error: null };
  },
  head: () => ({ meta: [{ title: "Verify Email — GText Co-operative" }] }),
  component: VerifyTokenPage,
});

function VerifyTokenPage() {
  const { error } = Route.useLoaderData();

  if (error) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-2xl">Verification failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            to="/co-operative/verify-email"
            className="mt-6 inline-block text-sm font-medium text-forest-deep hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
