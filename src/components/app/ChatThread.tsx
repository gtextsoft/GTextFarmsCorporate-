import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/lib/api/messages.functions";
import { cn } from "@/lib/utils";

function messageTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

function messageDay(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ChatThread({
  messages,
  viewerRole,
  onSend,
  sending = false,
  emptyHint = "No messages yet. Say hello 👋",
  className,
  otherLabel = "GText Farms",
}: {
  messages: ChatMessage[];
  viewerRole: "investor" | "admin";
  onSend: (body: string) => void | Promise<void>;
  sending?: boolean;
  emptyHint?: string;
  className?: string;
  otherLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    await onSend(body);
  };

  let lastDay = "";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderRole === viewerRole;
            const day = messageDay(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
                      {day}
                    </span>
                  </div>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      mine
                        ? "rounded-br-sm bg-forest-deep text-primary-foreground"
                        : "rounded-bl-sm border border-border bg-card text-foreground",
                    )}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest-deep/80">
                        {otherLabel}
                      </p>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-right text-[10px]",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {messageTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || draft.trim().length === 0}
          className="size-10 shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </div>
  );
}
