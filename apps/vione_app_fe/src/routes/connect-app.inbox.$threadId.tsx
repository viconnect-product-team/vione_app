// BC-Mobile-8A — Cuộc trò chuyện 1-1 (Messenger Layout).
// Tin nhắn đối tác bên trái (kèm Avatar thật & chấm xanh Online), tin nhắn của tôi bên phải (Gold accent).
// Hỗ trợ Menu ..., Thu hồi, Trả lời (Reply quote), Thả cảm xúc (Reactions) và Real-time Sync.

import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Copy,
  CornerUpLeft,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import {
  useDmMarkRead,
  useDmReact,
  useDmRetract,
  useDmSend,
  useDmThread,
} from "@/hooks/use-bc-dm";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import {
  DM_MAX_BODY_LEN,
  sanitizeDmBody,
  type BcDmErrorCode,
  type BcDmMessage,
} from "@/lib/business-connect/mobile/dm.types";
import { safeRandomUUID } from "@/lib/utils";

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

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function newToken(): string {
  return safeRandomUUID();
}

function formatDateSeparator(dateStr: string, locale: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Hôm nay";
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return "Hôm qua";
  }
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

type ReplyingState = {
  id: string;
  senderName: string;
  preview: string;
};

function ThreadPage() {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const { threadId } = useParams({ from: "/connect-app/inbox/$threadId" });
  const viewerUserId = useViewerUserId();

  const query = useDmThread(threadId);
  const send = useDmSend(threadId);
  const retract = useDmRetract(threadId);
  const react = useDmReact(threadId);
  const markRead = useDmMarkRead();

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingState | null>(null);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<BcDmErrorCode | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const markedRef = useRef<string | null>(null);

  const result = query.data;
  const thread = result?.ok ? result.thread : null;
  const messages = useMemo(() => (result?.ok ? result.messages : []), [result]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!thread) return;
    if (markedRef.current === threadId && thread.unreadCount === 0) return;
    markedRef.current = threadId;
    markRead.mutate(threadId);
  }, [thread, threadId, markRead]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuMsgId(null);
      setActiveReactionPickerMsgId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleCopyText = (text: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
    setCopyToast("Đã sao chép tin nhắn");
    setTimeout(() => setCopyToast(null), 2000);
    setActiveMenuMsgId(null);
  };

  const handleSelectReply = (m: BcDmMessage) => {
    const senderName = m.fromMe ? "Chính bạn" : thread?.displayName ?? "Đối tác";
    const preview = m.body.length > 80 ? `${m.body.substring(0, 80)}...` : m.body;
    setReplyingTo({ id: m.id, senderName, preview });
    setActiveMenuMsgId(null);
    textareaRef.current?.focus();
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    react.mutate({ messageId, emoji });
    setActiveReactionPickerMsgId(null);
    setActiveMenuMsgId(null);
  };

  const submit = async () => {
    const body = sanitizeDmBody(draft);
    if (!body || send.isPending) return;
    setErrorCode(null);

    const res = await send.mutateAsync({
      body,
      clientToken: newToken(),
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            preview: replyingTo.preview,
          }
        : null,
    });

    if (res.ok) {
      setDraft("");
      setReplyingTo(null);
    } else {
      setErrorCode(res.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
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
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D8B282]/20 bg-[#050c15]/95 px-3 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label={t("bc.mobile.topbar.back")}
            className="grid h-9 w-9 place-items-center rounded-full text-[#D4C3A3] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {thread ? (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                {thread.avatarUrl ? (
                  <img
                    src={thread.avatarUrl}
                    alt={thread.displayName}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-[#D8B282]/35"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c2433] text-[13px] font-bold text-[#D8B282] ring-1 ring-[#D8B282]/30">
                    {thread.displayName.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                {thread.isOnline ? (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#050c15]"
                    title="Đang hoạt động"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[15px] font-bold text-[#f2efe9] leading-tight">
                  {thread.displayName}
                </h1>
                <p className="truncate text-[11px] text-[#94a3b8] leading-tight mt-0.5">
                  {thread.isOnline ? (
                    <span className="text-[#22c55e] font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      Đang hoạt động
                    </span>
                  ) : (
                    thread.companyName || thread.headline || "Hội viên ViOne Connect"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <h1 className="text-[15px] font-semibold text-[#f2efe9]">{t("bc.mobile.inbox.title")}</h1>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col h-[calc(100dvh-130px)] max-w-full relative">
        {copyToast ? (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#1e293b]/95 border border-[#D8B282]/40 px-4 py-1.5 text-[12px] font-medium text-[#f1f5f9] shadow-lg backdrop-blur-md animate-fade-in">
            {copyToast}
          </div>
        ) : null}

        {query.isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-10 text-[13px] text-[#8a8d91]">
            <Loader2 className="h-5 w-5 animate-spin text-[#D8B282]" aria-hidden="true" />
            {t("bc.mobile.inbox.thread.loading")}
          </div>
        ) : !thread ? (
          <div className="p-6 text-center">
            <p className="rounded-2xl border border-[#232d3f] bg-[#121824] p-4 text-[13px] text-[#8a8d91]">
              {t("bc.mobile.inbox.thread.notFound")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#162030] text-[#D8B282] mb-3 ring-1 ring-[#D8B282]/20">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <p className="text-[14px] font-semibold text-[#e2e8f0]">
                    Bắt đầu cuộc trò chuyện với {thread.displayName}
                  </p>
                  <p className="text-[12px] text-[#8a8d91] max-w-[280px] mt-1">
                    Gửi tin nhắn đầu tiên để chào hỏi và trao đổi cơ hội hợp tác kinh doanh.
                  </p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const isNewDay =
                    !prevMsg ||
                    new Date(m.createdAt).toDateString() !==
                      new Date(prevMsg.createdAt).toDateString();
                  const timeFormatted = new Date(m.createdAt).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const reactionsGrouped = (m.reactions || []).reduce(
                    (acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  );

                  const myReaction = (m.reactions || []).find((r) => r.userId === viewerUserId);

                  return (
                    <div key={m.id} className="space-y-1.5">
                      {isNewDay ? (
                        <div className="flex items-center justify-center my-3">
                          <span className="rounded-full bg-[#17202e] border border-[#2a374a] px-3 py-1 text-[10.5px] font-medium text-[#94a3b8]">
                            {formatDateSeparator(m.createdAt, locale)}
                          </span>
                        </div>
                      ) : null}

                      <div
                        className={`flex items-start gap-2.5 group relative ${
                          m.fromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!m.fromMe ? (
                          <div className="relative shrink-0 mt-0.5">
                            {thread.avatarUrl ? (
                              <img
                                src={thread.avatarUrl}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-[#D8B282]/30 shadow-sm"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2433] text-[12px] font-bold text-[#D8B282] ring-1 ring-[#D8B282]/30 shadow-sm">
                                {thread.displayName.trim().charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                            {thread.isOnline ? (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-1.5 ring-[#050c15]"
                                title="Đang hoạt động"
                              />
                            ) : null}
                          </div>
                        ) : null}

                        <div
                          className={`flex flex-col max-w-[76%] min-w-0 ${
                            m.fromMe ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 w-full ${
                              m.fromMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            {m.fromMe && !m.retractedAt ? (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                  <button
                                    type="button"
                                    title="Thêm hành động"
                                    onClick={() =>
                                      setActiveMenuMsgId(activeMenuMsgId === m.id ? null : m.id)
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>

                                  {activeMenuMsgId === m.id ? (
                                    <div className="absolute bottom-8 right-0 z-30 min-w-[140px] rounded-xl border border-[#2a364a] bg-[#0f172a]/95 py-1 shadow-2xl backdrop-blur-md">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectReply(m)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-[#D8B282] cursor-pointer"
                                      >
                                        <CornerUpLeft className="h-3.5 w-3.5" />
                                        <span>Trả lời</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(m.body)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-[#D8B282] cursor-pointer"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Sao chép</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={retract.isPending}
                                        onClick={() => {
                                          retract.mutate(m.id);
                                          setActiveMenuMsgId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#f87171] hover:bg-[#ef4444]/15 cursor-pointer"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Thu hồi tin nhắn</span>
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  title="Trả lời"
                                  onClick={() => handleSelectReply(m)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors"
                                >
                                  <CornerUpLeft className="h-3.5 w-3.5" />
                                </button>
                                <div className="relative">
                                  <button
                                    type="button"
                                    title="Thả cảm xúc"
                                    onClick={() =>
                                      setActiveReactionPickerMsgId(
                                        activeReactionPickerMsgId === m.id ? null : m.id,
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors text-[13px]"
                                  >
                                    {myReaction ? myReaction.emoji : "👍"}
                                  </button>

                                  {activeReactionPickerMsgId === m.id ? (
                                    <div className="absolute bottom-8 right-0 z-30 flex items-center gap-1 rounded-full border border-[#D8B282]/30 bg-[#0f172a]/95 p-1.5 shadow-xl backdrop-blur-md animate-fade-in">
                                      {QUICK_REACTIONS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          type="button"
                                          onClick={() => handleToggleReaction(m.id, emoji)}
                                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[15px] hover:scale-125 transition-transform cursor-pointer ${
                                            myReaction?.emoji === emoji
                                              ? "bg-[#D8B282]/25 ring-1 ring-[#D8B282]"
                                              : "hover:bg-[#1e293b]"
                                          }`}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}

                            {m.retractedAt ? (
                              <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0c131f]/60 px-3.5 py-2 text-[12.5px] italic text-[#64748b]">
                                {t("bc.mobile.inbox.thread.retracted")}
                              </div>
                            ) : (
                              <div className="relative min-w-0">
                                {m.replyTo ? (
                                  <div
                                    className={`mb-1 rounded-xl px-3 py-1.5 text-[11.5px] border-l-2 ${
                                      m.fromMe
                                        ? "bg-[#0b0f19]/30 border-[#0b0f19] text-[#0b0f19]"
                                        : "bg-[#0f172a]/70 border-[#D8B282] text-[#94a3b8]"
                                    }`}
                                  >
                                    <p className="font-semibold text-[10.5px]">
                                      {m.replyTo.senderName || "Trả lời"}
                                    </p>
                                    <p className="truncate opacity-90">{m.replyTo.preview}</p>
                                  </div>
                                ) : null}

                                <div
                                  className={`relative break-words px-4 py-2.5 text-[14px] leading-relaxed transition-all shadow-sm ${
                                    m.fromMe
                                      ? "rounded-2xl rounded-tr-xs bg-[linear-gradient(135deg,#D8B282_0%,#C29B69_100%)] text-[#0b0f19] font-medium shadow-[#D8B282]/10"
                                      : "rounded-2xl rounded-tl-xs border border-[#2a364a] bg-[#162030] text-[#f1f5f9]"
                                  }`}
                                >
                                  {m.body}
                                </div>

                                {Object.keys(reactionsGrouped).length > 0 ? (
                                  <div
                                    className={`absolute -bottom-2.5 flex items-center gap-1 rounded-full border border-[#2a364a] bg-[#0f172a] px-1.5 py-0.5 shadow-md ${
                                      m.fromMe ? "right-2" : "left-2"
                                    }`}
                                  >
                                    {Object.entries(reactionsGrouped).map(([emoji, count]) => (
                                      <span
                                        key={emoji}
                                        className="flex items-center gap-0.5 text-[11px]"
                                      >
                                        <span>{emoji}</span>
                                        {count > 1 ? (
                                          <span className="font-semibold text-[10px] text-[#cbd5e1]">
                                            {count}
                                          </span>
                                        ) : null}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {!m.fromMe && !m.retractedAt ? (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                  <button
                                    type="button"
                                    title="Thả cảm xúc"
                                    onClick={() =>
                                      setActiveReactionPickerMsgId(
                                        activeReactionPickerMsgId === m.id ? null : m.id,
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors text-[13px]"
                                  >
                                    {myReaction ? myReaction.emoji : "👍"}
                                  </button>

                                  {activeReactionPickerMsgId === m.id ? (
                                    <div className="absolute bottom-8 left-0 z-30 flex items-center gap-1 rounded-full border border-[#D8B282]/30 bg-[#0f172a]/95 p-1.5 shadow-xl backdrop-blur-md animate-fade-in">
                                      {QUICK_REACTIONS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          type="button"
                                          onClick={() => handleToggleReaction(m.id, emoji)}
                                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[15px] hover:scale-125 transition-transform cursor-pointer ${
                                            myReaction?.emoji === emoji
                                              ? "bg-[#D8B282]/25 ring-1 ring-[#D8B282]"
                                              : "hover:bg-[#1e293b]"
                                          }`}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  title="Trả lời"
                                  onClick={() => handleSelectReply(m)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors"
                                >
                                  <CornerUpLeft className="h-3.5 w-3.5" />
                                </button>
                                <div className="relative">
                                  <button
                                    type="button"
                                    title="Thêm hành động"
                                    onClick={() =>
                                      setActiveMenuMsgId(activeMenuMsgId === m.id ? null : m.id)
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#162030] text-[#94a3b8] hover:text-[#D8B282] hover:bg-[#1f2c42] border border-[#2a364a] shadow-sm cursor-pointer transition-colors"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>

                                  {activeMenuMsgId === m.id ? (
                                    <div className="absolute bottom-8 left-0 z-30 min-w-[140px] rounded-xl border border-[#2a364a] bg-[#0f172a]/95 py-1 shadow-2xl backdrop-blur-md">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectReply(m)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-[#D8B282] cursor-pointer"
                                      >
                                        <CornerUpLeft className="h-3.5 w-3.5" />
                                        <span>Trả lời</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(m.body)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-[#D8B282] cursor-pointer"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Sao chép</span>
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div
                            className={`mt-1 flex items-center gap-1.5 px-1 text-[10.5px] text-[#64748b] ${
                              m.fromMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{timeFormatted}</span>
                            {m.fromMe && !m.retractedAt ? (
                              m.readAt ? (
                                <span className="flex items-center gap-0.5 text-[#D8B282] font-semibold">
                                  <CheckCheck className="h-3.5 w-3.5" />
                                  <span>Đã xem</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[#64748b]">
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Đã gửi</span>
                                </span>
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {errorText ? (
              <div className="px-4 pb-1">
                <p
                  role="alert"
                  className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1.5 text-[12px] text-[#f87171]"
                >
                  {errorText}
                </p>
              </div>
            ) : null}

            {replyingTo ? (
              <div className="flex items-center justify-between border-t border-[#D8B282]/20 bg-[#0f172a] px-4 py-2 text-[12px] text-[#e2e8f0] animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <CornerUpLeft className="h-4 w-4 text-[#D8B282] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#D8B282] truncate">
                      Đang trả lời {replyingTo.senderName}
                    </p>
                    <p className="text-[11px] text-[#94a3b8] truncate">{replyingTo.preview}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] cursor-pointer"
                  title="Hủy trả lời"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <form
              className="border-t border-[#D8B282]/15 bg-[#0a1019]/95 p-3 backdrop-blur-md"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="flex items-center gap-2 rounded-full border border-[#D8B282]/30 bg-[#121824] px-4 py-1.5 focus-within:border-[#D8B282] focus-within:ring-1 focus-within:ring-[#D8B282]/30 transition-all shadow-sm">
                <label className="sr-only" htmlFor="bc-dm-input">
                  {t("bc.mobile.inbox.thread.placeholder")}
                </label>
                <textarea
                  id="bc-dm-input"
                  ref={textareaRef}
                  rows={1}
                  value={draft}
                  maxLength={DM_MAX_BODY_LEN}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("bc.mobile.inbox.thread.placeholder")}
                  className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[13.5px] text-[#f1f5f9] placeholder-[#64748b] border-none border-0 outline-none focus:outline-none focus:ring-0 shadow-none focus:border-none ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  style={{ border: "none", outline: "none", boxShadow: "none" }}
                />
                <button
                  type="submit"
                  disabled={send.isPending || sanitizeDmBody(draft).length === 0}
                  aria-label={t("bc.mobile.inbox.thread.send")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#D8B282_0%,#C29B69_100%)] text-[#0b0f19] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-md shadow-[#D8B282]/20"
                >
                  {send.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </MobilePage>
  );
}
