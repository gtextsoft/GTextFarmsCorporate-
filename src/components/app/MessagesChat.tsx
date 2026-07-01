import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatThread } from "@/components/app/ChatThread";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ChatMessage } from "@/lib/api/messages.functions";
import {
  getMyMessagesFn,
  getUnreadMessageCountFn,
  markMessagesReadFn,
  sendMessageFn,
} from "@/lib/api/messages.functions";

const OPEN_POLL_MS = 15_000;
const IDLE_POLL_MS = 30_000;

export function MessagesChat({
  unreadCount: initialUnread,
  viewAllTo,
}: {
  unreadCount: number;
  viewAllTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  const loadMessages = useCallback(async () => {
    const result = await getMyMessagesFn();
    if (Array.isArray(result)) {
      setMessages(result);
      setLoaded(true);
    }
  }, []);

  const loadUnread = useCallback(async () => {
    const result = await getUnreadMessageCountFn();
    if (!("error" in result)) setUnread(result.count);
  }, []);

  // When the drawer opens: load the thread and clear the unread badge.
  useEffect(() => {
    if (!open) return;
    void loadMessages();
    setUnread(0);
    void markMessagesReadFn();
  }, [open, loadMessages]);

  // Poll: faster while the drawer is open (new replies), slower for the badge otherwise.
  useEffect(() => {
    const tick = () => {
      if (open) void loadMessages();
      else void loadUnread();
    };
    const interval = setInterval(tick, open ? OPEN_POLL_MS : IDLE_POLL_MS);
    return () => clearInterval(interval);
  }, [open, loadMessages, loadUnread]);

  const handleSend = async (body: string) => {
    setSending(true);
    // Optimistic append so the message shows immediately.
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
          aria-label={`Messages${unread ? `, ${unread} unread` : ""}`}
        >
          <Mail className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-[oklch(0.975_0.012_150)] p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-1 border-b border-border bg-card px-4 py-4 text-left">
          <SheetTitle>Messages</SheetTitle>
          <SheetDescription>
            Chat directly with the GText Farms support team. We typically reply within a business
            day.
          </SheetDescription>
        </SheetHeader>

        <ChatThread
          messages={messages}
          viewerRole="investor"
          onSend={handleSend}
          sending={sending}
          otherLabel="GText Farms"
          emptyHint={
            loaded
              ? "No messages yet. Send us a question about KYC, funding, or your investments."
              : "Loading your conversation…"
          }
        />

        <div className="border-t border-border bg-card p-2 text-center">
          <Link
            to={viewAllTo}
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-forest-deep hover:underline"
          >
            Open full messages page
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
