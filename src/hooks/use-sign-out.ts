import { useLocation, useRouter } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";

import { signOutFn } from "@/lib/api/auth.functions";
import { handleClientRedirect } from "@/lib/client-redirect";

export function getSignOutRedirect(pathname: string): string {
  if (pathname.startsWith("/co-operative")) {
    return "/co-operative/login";
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/field") ||
    pathname.startsWith("/auth")
  ) {
    return "/auth/sign-in";
  }
  return "/";
}

export function useSignOut() {
  const router = useRouter();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  const signOut = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    try {
      await signOutFn({ data: { redirectTo: getSignOutRedirect(pathname) } });
    } catch (err) {
      if (await handleClientRedirect(router, err)) return;
      console.error(err);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [pathname, router]);

  return { signOut, pending };
}
