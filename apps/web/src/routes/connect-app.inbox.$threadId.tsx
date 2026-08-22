// BC-Mobile-8A — Cuộc trò chuyện 1-1.
// Không có "đang gõ", không nhóm, không đính kèm. Tin đã gửi là bất biến;
// người gửi chỉ có thể thu hồi (hiển thị rõ "Tin đã thu hồi").

import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Loader2, Send } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import { BusinessConnectTopBar } from "@/components/business-connect/mobile/BusinessConnectTopBar";
import { useDmMarkRead, useDmRetract, useDmSend, useDmThread } from "@/hooks/use-bc-dm";
import {
  DM_MAX_BODY_LEN,
  sanitizeDmBody,
  type BcDmErrorCode,
} from "@/lib/business-connect/mobile/dm.types";

export const Route = createFileRoute("/connect-app/inbox/$threadId")({
  head: () => ({
    meta: [
      { title: "Cuộc trò chuyện — ViOne Connect" },
      {
        name: "description",
        content: "Trao đổi trực tiếp trong ứng dụng với kết nối đã chấp nhận trên ViOne Connect.",
      },
      { property: "og:title", content: "Cuộc trò chuyện — ViOne Connect" },
      {
        property: "og:description",
        content: "Tin nhắn nội bộ giữa hai kết nối đã chấp nhận trong ViOne Connect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThreadPage,
});

function newToken(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ThreadPage() {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const { threadId } = useParams({ from: "/connect-app/inbox/$threadId" });

  const query = useDmThread(threadId);
  const send = useDmSend(threadId);
  const retract = useDmRetract(threadId);
  const markRead = useDmMarkRead();

  const [draft, setDraft] = useState("");
  const [errorCode, setErrorCode] = useState<BcDmErrorCode | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const markedRef = useRef<string | null>(null);

  const result = query.data;
  const thread = result?.ok ? result.thread : null;
  const messages = useMemo(() => (result?.ok ? result.messages : []), [result]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!thread || thread.unreadCount === 0) return;
    if (markedRef.current === threadId) return;
    markedRef.current = threadId;
    markRead.mutate(threadId);
  }, [thread, threadId, markRead]);

  const submit = async () => {
    const body = sanitizeDmBody(draft);
    if (!body || send.isPending) return;
    setErrorCode(null);
    const res = await send.mutateAsync({ body, clientToken: newToken() });
    if (res.ok) setDraft("");
    else setErrorCode(res.error);
  };

  const errorText =
    errorCode === "not_connected"
      ? t("bc.mobile.inbox.error.not_connected")
      : errorCode === "empty_message"
        ? t("bc.mobile.inbox.error.empty_message")
        : errorCode
          ? t("bc.mobile.inbox.error.generic")
          : null;

  return (
    <MobilePage>
      <BusinessConnectTopBar title={thread?.displayName ?? t("bc.mobile.inbox.title")} back />
      <div className="flex flex-1 flex-col pt-4">
        {query.isLoading ? (
          <div className="flex items-center gap-2 py-10 text-[13px] text-[var(--bc-mobile-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("bc.mobile.inbox.thread.loading")}
          </div>
        ) : !thread ? (
          <p className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4 text-[13px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.inbox.thread.notFound")}
          </p>
        ) : (
          <>
            {thread.headline || thread.companyName ? (
              <p className="pb-3 text-[12px] text-[var(--bc-mobile-muted)]">
                {[thread.headline, thread.companyName].filter(Boolean).join(" · ")}
              </p>
            ) : null}

            <ul className="grid flex-1 content-start gap-2" aria-live="polite">
              {messages.length === 0 ? (
                <li className="py-8 text-center text-[12.5px] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.inbox.thread.empty")}
                </li>
              ) : (
                messages.map((m) => (
                  <li
                    key={m.id}
                    className={m.fromMe ? "flex justify-end" : "flex justify-start"}
                  >
                    <div className="max-w-[80%]">
                      <div
                        className={
                          m.retractedAt
                            ? "rounded-2xl border border-dashed border-[var(--bc-mobile-border)] px-3.5 py-2 text-[13px] italic text-[var(--bc-mobile-muted)]"
                            : m.fromMe
                              ? "rounded-2xl bg-[var(--bc-mobile-accent)] px-3.5 py-2 text-[13.5px] leading-snug text-[var(--bc-mobile-on-accent,#04111F)]"
                              : "rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-3.5 py-2 text-[13.5px] leading-snug text-[var(--bc-mobile-text)]"
                        }
                      >
                        {m.retractedAt ? t("bc.mobile.inbox.thread.retracted") : m.body}
                      </div>
                      <div
                        className={`mt-1 flex items-center gap-2 text-[10.5px] text-[var(--bc-mobile-muted)] ${
                          m.fromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {m.fromMe && m.readAt && !m.retractedAt ? (
                          <span>{t("bc.mobile.inbox.thread.read")}</span>
                        ) : null}
                        {m.fromMe && !m.retractedAt ? (
                          <button
                            type="button"
                            onClick={() => retract.mutate(m.id)}
                            disabled={retract.isPending}
                            className="underline underline-offset-2 disabled:opacity-50"
                          >
                            {t("bc.mobile.inbox.thread.retract")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))
              )}
              <div ref={bottomRef} />
            </ul>

            {errorText ? (
              <p role="alert" className="pb-2 text-[12px] text-[var(--bc-mobile-danger,#e5484d)]">
                {errorText}
              </p>
            ) : null}

            <form
              className="sticky bottom-0 flex items-end gap-2 border-t border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-bg,var(--bc-mobile-surface))] py-3"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <label className="sr-only" htmlFor="bc-dm-input">
                {t("bc.mobile.inbox.thread.placeholder")}
              </label>
              <textarea
                id="bc-dm-input"
                rows={1}
                value={draft}
                maxLength={DM_MAX_BODY_LEN}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("bc.mobile.inbox.thread.placeholder")}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-3.5 py-2.5 text-[13.5px] text-[var(--bc-mobile-text)] outline-none"
              />
              <button
                type="submit"
                disabled={send.isPending || sanitizeDmBody(draft).length === 0}
                aria-label={t("bc.mobile.inbox.thread.send")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--bc-mobile-accent)] text-[var(--bc-mobile-on-accent,#04111F)] disabled:opacity-40"
              >
                {send.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </MobilePage>
  );
}
