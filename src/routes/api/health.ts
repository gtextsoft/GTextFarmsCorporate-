import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { checkEnvironment } = await import("@/lib/env-check.server");
        const env = checkEnvironment();

        let database: { ok: boolean; detail?: string } = { ok: false };
        try {
          const { connectDB } = await import("@/lib/db.server");
          const mongoose = await import("mongoose");
          await connectDB();
          database = {
            ok: mongoose.default.connection.readyState === 1,
          };
        } catch (err) {
          database = {
            ok: false,
            detail: err instanceof Error ? err.message : "Connection failed",
          };
        }

        const ok = env.ok && database.ok;
        const body = {
          status: ok ? "ok" : "degraded",
          timestamp: new Date().toISOString(),
          database,
          environment: env,
        };

        return Response.json(body, { status: ok ? 200 : 503 });
      },
    },
  },
});
