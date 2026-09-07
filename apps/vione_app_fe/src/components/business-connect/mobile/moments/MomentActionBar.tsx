// BC-Mobile — Thanh tương tác Moment (Ghi nhớ · Bình luận · Thích).
// Thiết kế chuẩn dark luxury ViOne (#121824, #1c2333, #2f3542, #D8B282).

import { Bookmark, Heart, MessageCircle, NotebookPen } from "lucide-react";

export type MomentActionBarProps = {
  momentId: string;
  onOpenRemember?: () => void;
  commentsCount: number;
  isCommentsOpen: boolean;
  onToggleComments: () => void;
  likesCount: number;
  userLiked: boolean;
  onToggleLike: () => void;
  isLikeBusy?: boolean;
};

export function MomentActionBar({
  onOpenRemember,
  commentsCount,
  isCommentsOpen,
  onToggleComments,
  likesCount,
  userLiked,
  onToggleLike,
  isLikeBusy = false,
}: MomentActionBarProps) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--bc-mobile-border)] pt-2.5 mt-2.5">
      {/* Nút Ghi nhớ */}
      {onOpenRemember ? (
        <button
          type="button"
          onClick={onOpenRemember}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] hover:bg-[var(--bc-mobile-surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bc-mobile-accent)]"
        >
          <NotebookPen className="w-4 h-4 text-[var(--bc-mobile-muted)]" strokeWidth={1.8} />
          <span>Ghi nhớ</span>
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1">
        {/* Nút Bình luận */}
        <button
          type="button"
          onClick={onToggleComments}
          aria-expanded={isCommentsOpen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bc-mobile-accent)] ${
            isCommentsOpen
              ? "bg-[var(--bc-mobile-accent)]/15 text-[var(--bc-mobile-accent)]"
              : "text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] hover:bg-[var(--bc-mobile-surface-2)]"
          }`}
        >
          <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
          <span>Bình luận</span>
          {commentsCount > 0 && (
            <span className="font-semibold">({commentsCount})</span>
          )}
        </button>

        {/* Nút Thích */}
        <button
          type="button"
          onClick={onToggleLike}
          disabled={isLikeBusy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bc-mobile-accent)] ${
            userLiked
              ? "bg-[#e0245e]/15 text-[#e0245e]"
              : "text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] hover:bg-[var(--bc-mobile-surface-2)]"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${userLiked ? "fill-[#e0245e] text-[#e0245e]" : ""}`}
            strokeWidth={1.8}
          />
          <span>Thích</span>
          {likesCount > 0 && (
            <span className="font-semibold">({likesCount})</span>
          )}
        </button>
      </div>
    </div>
  );
}
