import { isRedirect, type RegisteredRouter, type Router } from "@tanstack/react-router";

/**
 * Handle redirects thrown by server functions from client event handlers.
 * Re-throwing those redirects causes uncaught promise rejections; navigate instead.
 */
export async function handleClientRedirect(
  router: Router<RegisteredRouter["routeTree"]>,
  err: unknown,
): Promise<boolean> {
  if (!isRedirect(err)) return false;
  await router.invalidate();
  await router.navigate({ ...err.options, replace: true, ignoreBlocker: true });
  return true;
}
