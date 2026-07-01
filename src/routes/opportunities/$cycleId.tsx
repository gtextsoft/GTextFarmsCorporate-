import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy public URL — opportunity details are investor-only. */
export const Route = createFileRoute("/opportunities/$cycleId")({
  beforeLoad: ({ context, params }) => {
    if (context.user) {
      throw redirect({
        to: "/app/invest/opportunity/$cycleSlug",
        params: { cycleSlug: params.cycleId },
      });
    }
    throw redirect({ to: "/auth/sign-in" });
  },
});
