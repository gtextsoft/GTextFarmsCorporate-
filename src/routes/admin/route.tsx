import { createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminQueueCountsFn } from "@/lib/api/admin.queue.functions";

function isAdminRole(role: string | undefined) {
  return role === "admin" || role === "super_admin";
}

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
    if (!isAdminRole(context.user.role)) {
      throw redirect({ to: "/app" });
    }
  },
  loader: async () => {
    const counts = await getAdminQueueCountsFn();
    return { queue: "error" in counts ? null : counts };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useRouteContext({ from: "__root__" });
  const { queue } = Route.useLoaderData();

  return <AdminShell userName={user?.fullName} queue={queue} />;
}
