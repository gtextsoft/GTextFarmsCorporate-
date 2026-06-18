import { getServerConfig } from "@/lib/config.server";
import type { SessionUser } from "@/lib/types";

import { useSession } from "@tanstack/react-start/server";

export const SESSION_NAME = "henhouse-session";

export function getSessionConfig() {
  const { sessionSecret, nodeEnv } = getServerConfig();
  const password = sessionSecret ?? "dev-only-change-me-32-chars-min!!";

  if (nodeEnv === "production" && !sessionSecret) {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return {
    name: SESSION_NAME,
    password,
    cookie: {
      secure: nodeEnv === "production",
      sameSite: "lax" as const,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    },
  };
}

export async function useAppSession() {
  return useSession<SessionUser>(getSessionConfig());
}
