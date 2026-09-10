// BC-Mobile — Facebook-style Bottom Sheet for Moment Comments.
// Slide-up drawer with drag handle, header, post preview box, scrollable thread, and sticky bottom input.

import React, { useState, useEffect } from "react";
import { X, Loader2, MessageSquareOff, MessageSquare, Heart, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { useMomentComments } from "@/hooks/use-moment-comments";
import { MomentCommentItem } from "./MomentCommentItem";
import { MomentCommentInput } from "./MomentCommentInput";
import type { MomentComment } from "@/lib/business-connect/mobile/moment-comments.types";

export type MomentPostPreview = {
  authorName?: string | null;
  authorAvatar?: string | null;
  authorRoleLine?: string | null;
  timeDisplay?: string | null;
  place?: string | null;
  content?: string | null;
  photos?: string[];
  likeCount?: number;
  isLiked?: boolean;
  onToggleLike?: () => void;
};

export type MomentCommentSheetProps = {
  momentId: string;
  open: boolean;
  onClose: () => void;
  authorName?: string | null;
  postPreview?: MomentPostPreview | null;
};

function initialsOf(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  const first = words[0]?.[0] ?? "";
  const last = words[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export function MomentCommentSheet({
  momentId,
  open,
  onClose,
  authorName,
  postPreview,
}: MomentCommentSheetProps) {
  const {
    comments,
    totalComments,
    isLoadingComments,
    addComment,
    deleteComment,
    toggleCommentLike,
    isAddingComment,
  } = useMomentComments(momentId);

  const [replyTarget, setReplyTarget] = useState<MomentComment | null>(null);
  const [isPostCollapsed, setIsPostCollapsed] = useState(false);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setReplyTarget(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleReply = (comment: MomentComment) => {
    setReplyTarget(comment);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
  };

  const handleSubmit = async (data: {
    content: string;
    parentId?: string | null;
    mentions?: { userId: string; displayName: string }[];
  }) => {
    await addComment(data);
    setReplyTarget(null);
  };

  const nameToDisplay = postPreview?.authorName || authorName || "Hội viên";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`comment-modal-${momentId}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6"
    >
      {/* Dimmed backdrop (click to close like Facebook) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Facebook-style Popup Container */}
      <div className="relative z-10 flex max-h-[92vh] sm:max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#D8B282]/35 bg-white dark:bg-[#080E1B] text-slate-900 dark:text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Modal Header: Facebook Style Centered Title + Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/95 dark:bg-[#0A1224]/90 backdrop-blur-md relative">
          <div className="w-8 shrink-0" />

          <div className="flex items-center gap-2 text-center">
            <h3 id={`comment-modal-${momentId}`} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide truncate max-w-[220px] sm:max-w-md">
              Bài viết của {nameToDisplay}
            </h3>
            {totalComments > 0 && (
              <span className="rounded-full bg-amber-500/15 dark:bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 shrink-0">
                {totalComments}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-200/80 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-[#334155] transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Modal Scrollable Body: Facebook-Style Post Header + Comments Thread */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-4 space-y-4 divide-y divide-slate-200 dark:divide-[#1E293B]/70 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/50">
          
          {/* A — Facebook-style Original Post Preview */}
          {postPreview ? (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-50/50 dark:bg-[#0C1529]/80 p-3.5 shadow-xs dark:shadow-md space-y-2.5">
              
              {/* Author Row */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {postPreview.authorAvatar ? (
                    <img
                      src={postPreview.authorAvatar}
                      alt={nameToDisplay}
                      className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#D8B282]/50 shadow-sm"
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 border border-[#D8B282]/40">
                      {initialsOf(nameToDisplay)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      {nameToDisplay}
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                        Tác giả
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {postPreview.authorRoleLine && <span className="truncate">{postPreview.authorRoleLine}</span>}
                      {postPreview.timeDisplay && (
                        <>
                          <span>•</span>
                          <span className="shrink-0">{postPreview.timeDisplay}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional collapse toggle */}
                <button
                  type="button"
                  onClick={() => setIsPostCollapsed((p) => !p)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md cursor-pointer text-[11px] flex items-center gap-0.5"
                  aria-label="Thu gọn bài viết"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPostCollapsed ? "-rotate-90" : ""}`} />
                </button>
              </div>

              {/* Post Content & Photos (Collapsible) */}
              {!isPostCollapsed && (
                <div className="space-y-2.5 pt-1">
                  {postPreview.content && (
                    <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                      {postPreview.content}
                    </p>
                  )}

                  {postPreview.place && (
                    <div className="flex items-center gap-1 text-[11.5px] text-amber-700 dark:text-amber-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{postPreview.place}</span>
                    </div>
                  )}

                  {/* Thumbnail previews if any */}
                  {postPreview.photos && postPreview.photos.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {postPreview.photos.slice(0, 3).map((imgUrl, i) => (
                        <img
                          key={i}
                          src={imgUrl}
                          alt="Ảnh đính kèm"
                          className="h-20 w-24 rounded-lg object-cover border border-slate-300 dark:border-slate-700/60 shrink-0"
                        />
                      ))}
                      {postPreview.photos.length > 3 && (
                        <div className="grid h-20 w-20 place-items-center rounded-lg bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0">
                          +{postPreview.photos.length - 3} ảnh
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Reactions Bar */}
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={postPreview.onToggleLike}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          postPreview.isLiked
                            ? "bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40"
                            : "bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${postPreview.isLiked ? "fill-current text-rose-500 dark:text-rose-400" : ""}`} />
                        <span>{postPreview.likeCount && postPreview.likeCount > 0 ? postPreview.likeCount : "Thích"}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {totalComments} lượt bình luận
                    </span>
                  </div>
                </div>
              )}

            </div>
          ) : null}

          {/* B — Comment Section with Scrollable Thread */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Thảo luận ({totalComments})
              </span>
              {totalComments > 5 && (
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Cuộn để xem thêm ({totalComments})
                </span>
              )}
            </div>

            {/* Scrollable thread */}
            <div
              className={`space-y-4 pb-2 ${
                totalComments > 5 ? "max-h-[48vh] overflow-y-auto pr-1" : ""
              }`}
            >
              {isLoadingComments ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D8B282] mb-2" />
                  <span className="text-xs font-medium">Đang tải bình luận...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-[#1E293B]/70 mb-2">
                    <MessageSquareOff className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Chưa có bình luận nào</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hãy là người đầu tiên chia sẻ góc nhìn!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <MomentCommentItem
                      key={comment.id}
                      comment={comment}
                      level={1}
                      onReply={handleReply}
                      onToggleLike={toggleCommentLike}
                      onDelete={deleteComment}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sticky Bottom Input Bar */}
        <div className="border-t border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#050914] px-3.5 py-2.5 pb-4 sm:pb-3 shadow-2xl">
          <MomentCommentInput
            momentId={momentId}
            replyTo={replyTarget}
            onCancelReply={handleCancelReply}
            onSubmit={handleSubmit}
            isSubmitting={isAddingComment}
          />
        </div>

      </div>
    </div>
  );
}

