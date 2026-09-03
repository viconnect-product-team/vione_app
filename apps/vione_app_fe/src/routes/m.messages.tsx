import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { supabase } from "@/integrations/supabase/client";
import { useServerData } from "@/hooks/use-server-data";
import {
  listConversations,
  listMessages,
  sendMessage,
  type MyConversation,
} from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";

export const Route = createFileRoute("/m/messages")({
  component: MessagesScreen,
});

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("");
}

function MessagesScreen() {
  const [active, setActive] = useState<MyConversation | null>(null);

  if (active) {
    return <ChatThread peer={active} onBack={() => setActive(null)} />;
  }
  return <ConversationList onOpen={setActive} />;
}

function ConversationList({ onOpen }: { onOpen: (c: MyConversation) => void }) {
  const t = useT();
  const fmt = useFmt();
  const {
    data: conversations,
    loading,
    error,
    reload,
  } = useServerData<MyConversation[]>(() => listConversations(), []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () =>
        reload(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="vba-animate">
      <MemberHeader title={t("m.messages.title")} back />
      <p className="sr-only" role="status" aria-live="polite" data-testid="messages-announcement">
        {loading
          ? t("m.messages.announce.loading")
          : t("m.messages.announce.count", { count: conversations.length })}
      </p>
      <div
        className="mt-2 px-4"
        role="list"
        aria-live="polite"
        aria-busy={loading}
        aria-label={t("m.messages.title")}
      >
        {loading && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.messages.loading")}
          </p>
        )}
        {error && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-danger,#e05656)]">{error}</p>
        )}
        {!loading && !error && conversations.length === 0 && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.messages.empty")}
          </p>
        )}
        {conversations.map((c: any) => (
          <div key={c.peerCode} role="listitem">
            <button
              onClick={() => onOpen(c)}
              className="flex w-full items-center gap-3 border-b border-[var(--vba-border-soft)] py-3.5 text-left"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--vba-surface-2)] text-[14px] font-bold text-[var(--vba-gold)]">
                {initialsOf(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold text-[var(--vba-text)]">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--vba-text-dim)]">
                    {fmt.rel(c.time)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] text-[var(--vba-text-muted)]">
                    {c.last}
                  </span>
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full vba-gold-grad px-1.5 text-[10px] font-bold text-[#1a1206]">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatThread({ peer, onBack }: { peer: MyConversation; onBack: () => void }) {
  const t = useT();
  const fmt = useFmt();
  const { data, loading, error, reload } = useServerData(
    () => listMessages({ data: { peerCode: peer.peerCode } }),
    { peerName: peer.name, messages: [] as Awaited<ReturnType<typeof listMessages>>["messages"] },
  );
  const send = useServerFn(sendMessage);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const peerLc = peer.peerCode.toLowerCase();
    const channel = supabase
      .channel(`messages-thread-${peerLc}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        const row = (payload.new ?? payload.old) as { from_id?: string; to_id?: string };
        const from = String(row.from_id ?? "").toLowerCase();
        const to = String(row.to_id ?? "").toLowerCase();
        if (from === peerLc || to === peerLc) reload();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await send({ data: { peerCode: peer.peerCode, text: value } });
      setText("");
      reload();
    } catch {
      /* keep text so the user can retry */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="vba-animate flex h-[100dvh] flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--vba-border-soft)] px-4 py-3">
        <button onClick={onBack} className="text-[var(--vba-gold)] text-[14px] font-medium">
          ‹ {t("m.messages.back")}
        </button>
        <span className="truncate text-[15px] font-semibold text-[var(--vba-text)]">
          {data.peerName}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {loading && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.messages.loading")}
          </p>
        )}
        {error && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-danger,#e05656)]">{error}</p>
        )}
        {!loading && data.messages.length === 0 && (
          <p className="py-8 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.messages.emptyThread")}
          </p>
        )}
        {(() => {
          const lastSeenId = [...data.messages].reverse().find((m) => m.mine && m.seen)?.id;
          return data.messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] ${
                  m.mine
                    ? "vba-gold-grad text-[#1a1206]"
                    : "bg-[var(--vba-surface-2)] text-[var(--vba-text)]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${m.mine ? "text-[#1a1206]/70" : "text-[var(--vba-text-dim)]"}`}
                >
                  {fmt.rel(m.time)}
                </span>
              </div>
              {m.id === lastSeenId && (
                <span className="mt-0.5 pr-1 text-[10px] text-[var(--vba-gold)]">
                  ✓✓ {t("m.messages.seen")}
                </span>
              )}
            </div>
          ));
        })()}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-[var(--vba-border-soft)] px-3 py-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("m.messages.inputPlaceholder")}
          maxLength={2000}
          className="flex-1 rounded-full bg-[var(--vba-surface-2)] px-4 py-2.5 text-[13px] text-[var(--vba-text)] outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full vba-gold-grad text-[#1a1206] disabled:opacity-50"
          aria-label={t("m.messages.sendAria")}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
