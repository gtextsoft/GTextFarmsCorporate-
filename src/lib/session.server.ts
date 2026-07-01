import { getServerConfig, getSessionSecret } from "@/lib/config.server";
import type { SessionUser } from "@/lib/types";

import { useSession } from "@tanstack/react-start/server";

export const SESSION_NAME = "henhouse-session";

export function getSessionConfig() {
  const { nodeEnv } = getServerConfig();
  const password = getSessionSecret();

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
