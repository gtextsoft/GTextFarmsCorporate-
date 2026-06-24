import { createFileRoute } from "@tanstack/react-router";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

/**
 * Mints short-lived client upload tokens so the browser uploads receipts /
 * documents directly to Vercel Blob (bypassing the serverless body-size limit).
 * Only authenticated co-operative members may obtain a token.
 */
export const Route = createFileRoute("/api/coop/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: HandleUploadBody;
        try {
          body = (await request.json()) as HandleUploadBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Read the session at the handler top-level (same pattern as the server
        // functions); the token callback closes over the resolved userId.
        const { useAppSession } = await import("@/lib/session.server");
        const session = await useAppSession();
        const userId = session.data.userId;

        try {
          const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
              if (!userId) {
                throw new Error("Unauthorized");
              }
              return {
                allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
                maximumSizeInBytes: 8 * 1024 * 1024,
                addRandomSuffix: true,
                tokenPayload: JSON.stringify({ userId }),
              };
            },
            // Called by Blob after upload completes. No-op (does not run on localhost).
            onUploadCompleted: async () => {},
          });
          return Response.json(result);
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Upload failed" },
            { status: 400 },
          );
        }
      },
    },
  },
});
