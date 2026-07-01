import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ChatThread } from "@/components/app/ChatThread";
import type { AdminConversation } from "@/lib/api/admin.messages.functions";
import {
  adminSendMessageFn,
  getAdminConversationsFn,
  getAdminThreadFn,
  markAdminThreadReadFn,
} from "@/lib/api/admin.messages.functions";
import type { ChatMessage } from "@/lib/api/messages.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/messages/")({
  head: () => ({ meta: [{ title: "Messages — Admin" }] }),
  loader: async () => {
    const result = await getAdminConversationsFn();
    return { conversations: "error" in result ? [] : result };
  },
  component: AdminMessagesPage,
});

function relativeTime(value: string) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "IN"
  );
}

function AdminMessagesPage() {
  const { conversations: initialConversations } = Route.useLoaderData();
  const [conversations, setConversations] = useState<AdminConversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<{ name: string; messages: ChatMessage[] } | null>(null);
  const [sending, setSending] = useState(false);

  const refreshConversations = useCallback(async () => {
    const result = await getAdminConversationsFn();
    if (!("error" in result)) setConversations(result);
  }, []);

  const loadThread = useCallback(async (investorId: string) => {
    const result = await getAdminThreadFn({ data: { investorId } });
    if (!("error" in result)) {
      setThread({ name: result.investor.name, messages: result.messages });
    }
  }, []);

  const selectConversation = useCallback(
    async (investorId: string) => {
      setSelectedId(investorId);
      setThread(null);
      await loadThread(investorId);
      await markAdminThreadReadFn({ data: { investorId } });
      setConversations((prev) =>
        prev.map((c) => (c.investorId === investorId ? { ...c, unread: 0 } : c)),
      );
    },
    [loadThread],
  );

  // Poll the open thread and the conversation list for new messages.
  useEffect(() => {
    const interval = setInterval(() => {
      void refreshConversations();
      if (selectedId) void loadThread(selectedId);
    }, 15_000);
    return () => clearInterval(interval);
  }, [selectedId, refreshConversations, loadThread]);

  const handleSend = async (body: string) => {
    if (!selectedId) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `temp-${thread?.messages.length ?? 0}`,
      senderRole: "admin",
      body,
      createdAt: new Date().toISOString(),
    };
    setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev));
    try {
      const result = await adminSendMessageFn({ data: { investorId: selectedId, body } });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        await loadThread(selectedId);
        await refreshConversations();
      }
    } catch {
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Reply to investor questions. {totalUnread > 0 ? `${totalUnread} unread.` : "All caught up."}
          </p>
        </div>

        <div className="mt-6 grid h-[calc(100vh-13rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:grid-cols-[320px_1fr]">
          {/* Conversation list */}
          <aside
            className={cn(
              "flex flex-col border-border lg:border-r",
              selectedId ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Conversations</p>
              <p className="text-xs text-muted-foreground">{conversations.length} total</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {conversations.map((c) => (
                    <li key={c.investorId}>
                      <button
                        type="button"
                        onClick={() => void selectConversation(c.investorId)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
                          selectedId === c.investorId && "bg-forest/5",
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/10 text-xs font-semibold text-forest-deep">
                          {initials(c.investorName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium">{c.investorName}</span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {relativeTime(c.lastAt)}
                            </span>
                          </span>
                          <span className="mt-0.5 flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-muted-foreground">
                              {c.lastSenderRole === "admin" ? "You: " : ""}
                              {c.lastBody}
                            </span>
                            {c.unread > 0 && (
                              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                {c.unread > 9 ? "9+" : c.unread}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Thread pane */}
          <section
            className={cn(
              "flex min-h-0 flex-col",
              selectedId ? "flex" : "hidden lg:flex",
            )}
          >
            {selectedId ? (
              <>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="grid size-8 place-items-center rounded-lg hover:bg-muted lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <span className="grid size-9 place-items-center rounded-full bg-forest/10 text-xs font-semibold text-forest-deep">
                    {initials(thread?.name ?? "Investor")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{thread?.name ?? "Investor"}</p>
                    <p className="text-xs text-muted-foreground">Investor</p>
                  </div>
                </div>
                <ChatThread
                  messages={thread?.messages ?? []}
                  viewerRole="admin"
                  onSend={handleSend}
                  sending={sending}
                  otherLabel={thread?.name ?? "Investor"}
                  emptyHint={thread ? "No messages yet. Start the conversation." : "Loading…"}
                />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
                  <MessageSquare className="size-7" />
                </span>
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Choose an investor from the list to view and reply to their messages.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
