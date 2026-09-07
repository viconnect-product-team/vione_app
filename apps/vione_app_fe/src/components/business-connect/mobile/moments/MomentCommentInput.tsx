// BC-Mobile — Khung nhập bình luận kèm gợi ý Tag tên (@mention) và chế độ Phản hồi.

import { useEffect, useRef, useState } from "react";
import { Send, X, AtSign, Loader2 } from "lucide-react";
import type { MentionableUser, MomentComment } from "@/lib/business-connect/mobile/moment-comments.types";
import { searchMentionableUsers } from "@/lib/business-connect/mobile/moment-comments.functions";

export type MomentCommentInputProps = {
  replyingTo?: MomentComment | null;
  replyTo?: MomentComment | null;
  onCancelReply: () => void;
  onSubmit: (data: { content: string; parentId?: string | null; mentions?: any[] }) => Promise<void>;
  disabled?: boolean;
  isSubmitting?: boolean;
  momentId?: string;
};

export function MomentCommentInput({
  replyingTo,
  replyTo,
  onCancelReply,
  onSubmit,
  disabled,
  isSubmitting,
}: MomentCommentInputProps) {
  const activeReply = replyingTo ?? replyTo ?? null;
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionableUser[]>([]);
  const [chosenMentions, setChosenMentions] = useState<{ userId: string; displayName: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // When activeReply changes, auto-fill @Name into input and focus
  useEffect(() => {
    if (activeReply) {
      const mentionText = `@${activeReply.author.displayName} `;
      setText(mentionText);
      setChosenMentions((prev) => [
        ...prev.filter((m) => m.userId !== activeReply.userId),
        { userId: activeReply.userId, displayName: activeReply.author.displayName },
      ]);
      inputRef.current?.focus();
    }
  }, [activeReply]);

  // Handle @ detection
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1 && (lastAtIdx === 0 || /\s/.test(textBeforeCursor[lastAtIdx - 1]))) {
      const query = textBeforeCursor.slice(lastAtIdx + 1);
      if (query.length <= 30 && !query.includes("\n")) {
        setMentionQuery(query);
        return;
      }
    }
    setMentionQuery(null);
  };

  // Fetch mention suggestions
  useEffect(() => {
    if (mentionQuery === null) {
      setMentionSuggestions([]);
      return;
    }

    let active = true;
    setLoadingSuggestions(true);
    searchMentionableUsers(mentionQuery).then((res) => {
      if (active) {
        setMentionSuggestions(res);
        setLoadingSuggestions(false);
      }
    });

    return () => {
      active = false;
    };
  }, [mentionQuery]);

  const selectMention = (user: MentionableUser) => {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    const newBefore = textBeforeCursor.slice(0, lastAtIdx) + `@${user.displayName} `;
    setText(newBefore + textAfterCursor);
    setMentionQuery(null);
    setChosenMentions((prev) => [
      ...prev.filter((m) => m.userId !== user.userId),
      { userId: user.userId, displayName: user.displayName },
    ]);
    inputRef.current.focus();
  };

  const handleSend = async () => {
    const clean = text.trim();
    if (!clean || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        content: clean,
        parentId: activeReply?.id || null,
        mentions: chosenMentions,
      });
      setText("");
      setChosenMentions([]);
      onCancelReply();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="relative border-t border-[#2f3542] pt-3 mt-3">
      {/* Banner đang phản hồi */}
      {activeReply && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[#1c2333] px-3 py-1.5 text-xs text-[#D8B282]">
          <span className="truncate">
            Đang phản hồi <strong>@{activeReply.author.displayName}</strong>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-[#8a8d91] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mention suggestion popover */}
      {mentionQuery !== null && (
        <div className="absolute bottom-full left-0 right-0 mb-2 max-h-48 overflow-y-auto rounded-xl border border-[#2f3542] bg-[#121824] shadow-2xl p-1 z-30">
          <div className="px-2 py-1 text-[11px] font-semibold text-[#8a8d91] uppercase tracking-wider">
            Nhắc đến hội viên
          </div>
          {loadingSuggestions ? (
            <div className="flex items-center justify-center p-3 text-xs text-[#8a8d91]">
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Đang tìm kiếm…
            </div>
          ) : mentionSuggestions.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8a8d91]">
              Không tìm thấy người phù hợp
            </div>
          ) : (
            mentionSuggestions.map((u) => (
              <button
                key={u.userId}
                type="button"
                onClick={() => selectMention(u)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#1c2333] transition-colors text-left cursor-pointer"
              >
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-[#2f3542]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#1c2333] text-[10px] font-bold text-[#D8B282] grid place-items-center">
                    {u.initials || "HV"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-[#e4e6eb] truncate">
                    {u.displayName}
                  </div>
                  {u.jobTitle && (
                    <div className="text-[11px] text-[#8a8d91] truncate">
                      {u.jobTitle} {u.companyName ? `· ${u.companyName}` : ""}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Ô nhập bình luận */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#1c2333] border border-[#2f3542] text-[#D8B282] font-bold text-xs flex items-center justify-center shrink-0">
          HV
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || submitting || isSubmitting}
            placeholder={activeReply ? `Phản hồi @${activeReply.author.displayName}…` : "Viết bình luận… (gõ @ để tag tên)"}
            className="w-full bg-[#1c2333] border border-[#2f3542] rounded-full px-4 py-2 pr-9 text-[13px] text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none transition-colors focus:border-[#D8B282]"
          />
          <button
            type="button"
            onClick={() => {
              setText((prev) => `${prev}@`);
              setMentionQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-[#8a8d91] hover:text-[#D8B282] transition-colors"
            title="Gắn thẻ người dùng"
          >
            <AtSign className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || submitting || disabled}
          className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-[#D8B282] text-[#0b0f19] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Gửi bình luận"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
