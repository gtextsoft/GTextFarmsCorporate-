import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy public URL — opportunities are investor-only. */
export const Route = createFileRoute("/opportunities/")({
  beforeLoad: ({ context }) => {
    throw redirect({ to: context.user ? "/app/invest" : "/auth/sign-in" });
  },
});
