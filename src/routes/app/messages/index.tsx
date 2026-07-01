import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ChatThread } from "@/components/app/ChatThread";
import type { ChatMessage } from "@/lib/api/messages.functions";
import {
  getMyMessagesFn,
  markMessagesReadFn,
  sendMessageFn,
} from "@/lib/api/messages.functions";

export const Route = createFileRoute("/app/messages/")({
  head: () => ({ meta: [{ title: "Messages — GText Farms" }] }),
  loader: async () => {
    const result = await getMyMessagesFn();
    return { messages: Array.isArray(result) ? result : ([] as ChatMessage[]) };
  },
  component: MessagesPage,
});

function MessagesPage() {
  const { messages: initial } = Route.useLoaderData();
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const result = await getMyMessagesFn();
    if (Array.isArray(result)) setMessages(result);
  }, []);

  useEffect(() => {
    void markMessagesReadFn();
    const interval = setInterval(() => void loadMessages(), 15_000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSend = async (body: string) => {
    setSending(true);
    const optimistic: ChatMessage = {
      id: `temp-${messages.length}`,
      senderRole: "investor",
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const result = await sendMessageFn({ data: { body } });
      if ("error" in result) {
        toast.error(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      } else {
        await loadMessages();
      }
    } catch {
      toast.error("Could not send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-deep">
            Support
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Messages
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chat directly with the GText Farms team about KYC, funding, withdrawals, or your
            investments.
          </p>
        </div>

        <div className="mt-6 flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <ChatThread
            messages={messages}
            viewerRole="investor"
            onSend={handleSend}
            sending={sending}
            otherLabel="GText Farms"
            emptyHint="No messages yet. Send us a question and our team will reply here."
          />
        </div>
      </div>
    </main>
  );
}
