// BC-Mobile-7E — One Network feed card (Executive Minimal Luxury, ViOne).
//
// Presentation only over the canonical Moment domain: avatar ảnh, huy hiệu V,
// "chức danh · công ty", "ngày · địa điểm", ảnh lớn / lưới ảnh kèm "+N", và
// câu mô tả cuộc gặp. Thân thẻ điều hướng tới Person Detail; hàng hành động
// (Ghi nhớ · Kết nối · "…") nằm ngoài liên kết để giữ ngữ nghĩa đúng.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  MoreHorizontal,
  NotebookPen,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import { useNetworkRowConnect } from "@/hooks/use-network-row-connect";
import { ConnectConfirmDialog } from "./ConnectConfirmDialog";
import { networkFeedKeys } from "@/hooks/use-network-feed";
import { MomentManageSheet } from "./MomentManageSheet";
import type { BcNetworkFeedItem } from "@/lib/business-connect/mobile/network-feed.types";
import type { BcMobileNetworkPerson } from "@/hooks/use-business-connect-network";

function initialsOf(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function PhotoGrid({ urls, alt }: { urls: string[]; alt: string }) {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <img
        src={urls[0]}
        alt={alt}
        loading="lazy"
        className="mt-3 aspect-[16/10] w-full rounded-xl object-cover ring-1 ring-[var(--bc-mobile-border)]"
      />
    );
  }

  const shown = urls.slice(0, 3);
  const extra = urls.length - shown.length;
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {shown.map((url, i) => (
        <div key={url} className="relative">
          <img
            src={url}
            alt={alt}
            loading="lazy"
            className="aspect-square w-full rounded-lg object-cover ring-1 ring-[var(--bc-mobile-border)]"
          />
          {i === shown.length - 1 && extra > 0 ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center rounded-lg bg-[#04111F]/62 text-[18px] font-semibold text-[var(--bc-mobile-text)]"
            >
              +{extra}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function NetworkFeedCard({
  item,
  person,
}: {
  item: BcNetworkFeedItem;
  person: BcMobileNetworkPerson | null;
}) {
  const t = useT();
  const fmt = useFmt();
  const name = person?.displayName ?? t("bc.mobile.network.unknownPerson");
  const roleLine = [person?.headline, person?.companyName].filter(Boolean).join(" • ");
  const place = item.placeLabel ?? item.eventName;

  return (
    <li className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3.5 transition-colors duration-150 ease-out hover:border-[var(--bc-mobile-accent)]/40 motion-reduce:transition-none">
      <Link
        to="/connect-app/network/$personId"
        params={{ personId: item.personId }}
        aria-label={name}
        className="block rounded-xl transition-transform duration-150 ease-out active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {/* Hàng nhận diện: ảnh đại diện · tên + huy hiệu V · chức danh • công ty */}
        <div className="flex items-start gap-3">
          {person?.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt=""
              loading="lazy"
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[var(--bc-mobile-border)]"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[14px] font-semibold text-[var(--bc-mobile-text)] ring-1 ring-[var(--bc-mobile-border)]"
            >
              {initialsOf(person?.displayName ?? null)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[16px] font-semibold text-[var(--bc-mobile-text)]">
                {name}
              </span>
              {person?.relationshipKind === "connection" ? (
                <span
                  title={t("bc.mobile.network.feed.verified")}
                  aria-label={t("bc.mobile.network.feed.verified")}
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-accent)] text-[10px] font-bold leading-none text-[var(--bc-mobile-accent)]"
                >
                  V
                </span>
              ) : null}
            </div>
            {roleLine ? (
              <p className="mt-0.5 truncate text-[13px] text-[var(--bc-mobile-muted)]">
                {roleLine}
              </p>
            ) : null}
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[var(--bc-mobile-muted)]">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.7} />
              <span className="truncate">{fmt.rel(item.occurredAt)}</span>
              {place ? (
                <>
                  <span aria-hidden="true">·</span>
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.7} />
                  <span className="truncate">{place}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        {/* Ảnh lớn hoặc lưới ảnh kèm "+N" */}
        <PhotoGrid urls={item.photoUrls} alt={t("bc.mobile.network.feed.photoAlt")} />

        {/* Câu mô tả cuộc gặp */}
        {item.note ? (
          <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-[var(--bc-mobile-text)]">
            {item.note}
          </p>
        ) : null}
      </Link>

      <FeedActionRow item={item} person={person} />
    </li>
  );
}

/**
 * Hàng hành động của thẻ feed: "Ghi nhớ" (sửa ghi chú cuộc gặp),
 * "Kết nối" (chỉ hiện khi thật sự có thể kết nối) và "…" (thêm hành động).
 * Không nút giả: trạng thái nào không khả dụng thì không hiển thị.
 */
function FeedActionRow({
  item,
  person,
}: {
  item: BcNetworkFeedItem;
  person: BcMobileNetworkPerson | null;
}) {
  const t = useT();
  const queryClient = useQueryClient();
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const eligible = Boolean(person && person.relationshipKind !== "connection" && person.cardSlug);
  const { state, connect, accept, decline, cancel, busy } = useNetworkRowConnect(
    person?.cardSlug ?? null,
    eligible,
  );

  const run = (mutation: { mutateAsync: () => Promise<unknown> }, successKey: TKey) => {
    void mutation
      .mutateAsync()
      .then(() => toast.success(t(successKey)))
      .catch(() => toast.error(t("bc.mobile.connection.error")));
  };

  const pill =
    "inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] disabled:opacity-60 motion-reduce:transition-none";
  const quiet = `${pill} bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-text)] active:bg-[var(--bc-mobile-border)]`;
  const gold = `${pill} bc-cta-gold`;
  const spinner = busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null;

  return (
    <>
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--bc-mobile-border)] pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={() => setManageOpen(true)} className={quiet}>
            <NotebookPen aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            {t("bc.mobile.network.feed.remember")}
          </button>

          {eligible && (state === "none" || state === "saved") ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmOpen(true)}
                className={gold}
              >
                {spinner ?? <UserPlus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />}
                {t("bc.mobile.connection.connect")}
              </button>
              <ConnectConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                personLabel={person?.displayName ?? null}
                busy={busy}
                onConfirm={() => {
                  run(connect, "bc.mobile.connection.toast.sent");
                  setConfirmOpen(false);
                }}
              />
            </>
          ) : null}

          {eligible && state === "pending_sent" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(cancel, "bc.mobile.connection.toast.withdrawn")}
              className={quiet}
            >
              {spinner ?? <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />}
              {t("bc.mobile.connection.withdraw")}
            </button>
          ) : null}

          {eligible && state === "pending_sent" ? (
            <span aria-live="polite" className="text-[12.5px] text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.connection.pending")}
            </span>
          ) : null}

          {eligible && state === "pending_received" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(accept, "bc.mobile.connection.toast.accepted")}
                className={gold}
              >
                {spinner ?? <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
                {t("bc.mobile.connection.accept")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(decline, "bc.mobile.connection.toast.declined")}
                className={quiet}
              >
                {t("bc.mobile.connection.decline")}
              </button>
            </>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("bc.mobile.network.feed.more")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-muted)] transition-colors duration-150 active:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[184px]">
            <DropdownMenuItem asChild>
              <Link to="/connect-app/network/$personId" params={{ personId: item.personId }}>
                {t("bc.mobile.network.feed.viewProfile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setManageOpen(true)}>
              {t("bc.mobile.network.feed.editMoment")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <MomentManageSheet
        open={manageOpen}
        onOpenChange={setManageOpen}
        momentId={item.momentId}
        occurredAt={item.occurredAt}
        title={item.eventName}
        placeLabel={item.placeLabel}
        note={item.note}
        onChanged={() => {
          void queryClient.invalidateQueries({ queryKey: networkFeedKeys.root });
        }}
      />
    </>
  );
}
