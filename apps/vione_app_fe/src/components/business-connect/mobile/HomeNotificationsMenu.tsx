// Chuông thông báo trên Trang chủ Connect-app: mở dropdown liệt kê thông báo
// chưa đọc (dữ liệu canonical qua SDK hooks) và cho phép đánh dấu đã đọc ngay.
// Không tạo kho thông báo song song, không hiển thị badge giả.

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useT, hasTKey } from "@/lib/i18n";
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-bc-notifications";
import type { NotificationDTO } from "@/lib/business-connect/notification-orchestration/types";

function text(t: ReturnType<typeof useT>, key: string, fallback: string): string {
  return key && hasTKey(key) ? t(key) : fallback;
}

function UnreadList({ onClose }: { onClose: () => void }) {
  const t = useT();
  const q = useNotifications({ unreadOnly: true, limit: 6 });
  const markRead = useMarkNotificationRead();
  const items: NotificationDTO[] = q.data?.items ?? [];

  if (q.isPending) {
    return (
      <p className="px-4 py-6 text-center text-[13px] text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.home.notifications.panel.loading")}
      </p>
    );
  }
  if (q.isError) {
    return (
      <div className="px-4 py-5 text-center">
        <p className="text-[13px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.home.notifications.panel.error")}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="mt-2 min-h-9 rounded-full border border-[var(--bc-mobile-border)] px-4 text-[13px] text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
        >
          {t("bc.mobile.home.notifications.panel.retry")}
        </button>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-[13px] text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.home.notifications.panel.empty")}
      </p>
    );
  }

  return (
    <>
      <ul className="max-h-[60vh] overflow-y-auto">
        {items.map((n) => (
          <li
            key={n.id}
            className="flex items-start gap-2 border-b border-[var(--bc-mobile-border)] px-3 py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-[var(--bc-mobile-text)]">
                {text(t, n.titleKey, n.notificationKind)}
              </p>
              {text(t, n.bodyKey, "") ? (
                <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
                  {text(t, n.bodyKey, "")}
                </p>
              ) : null}
              {n.action.targetRoute ? (
                <Link
                  to={n.action.targetRoute}
                  onClick={onClose}
                  className="mt-1 inline-block text-[12.5px] font-medium text-[var(--bc-mobile-accent)]"
                >
                  {text(t, n.action.labelKey, t("bc.mobile.home.notifications.panel.open"))}
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              disabled={markRead.isPending}
              onClick={() => markRead.mutate({ id: n.id })}
              aria-label={t("bc.mobile.home.notifications.panel.markRead")}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] disabled:opacity-60"
            >
              <Check className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-[var(--bc-mobile-border)] p-2">
        <button
          type="button"
          disabled={markRead.isPending}
          onClick={() => {
            for (const n of items) markRead.mutate({ id: n.id });
          }}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--bc-mobile-border-gold)] text-[13px] font-medium text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] disabled:opacity-60"
        >
          <CheckCheck className="size-4" aria-hidden />
          {t("bc.mobile.home.notifications.panel.markAll")}
        </button>
        <Link
          to="/connect-app/notifications"
          onClick={onClose}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full text-[13px] font-medium text-[var(--bc-mobile-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
        >
          {t("bc.mobile.home.notifications.panel.viewAll")}
        </Link>
      </div>
    </>
  );
}

export function HomeNotificationsMenu({ unreadCount }: { unreadCount: number | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hasUnread = typeof unreadCount === "number" && unreadCount > 0;
  const label = hasUnread
    ? t("bc.mobile.home.notifications.unread", { count: unreadCount })
    : t("bc.mobile.home.notifications");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="relative grid place-items-center rounded-full text-[#d8c3b1] transition-colors hover:bg-[#ffffff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea9a41]"
      >
        <Bell className="h-5 w-5 text-[#d8c3b1]" strokeWidth={1.8} />
        {hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-solid border-[#12110f] bg-[#ea9a41] font-['Inter-Bold',Helvetica] text-[9.5px] font-bold leading-none text-[#2c1600]">
            {unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t("bc.mobile.home.notifications.panel.title")}
          className="absolute right-0 z-50 mt-2 w-[min(88vw,340px)] overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]"
        >
          <p className="border-b border-[var(--bc-mobile-border)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.home.notifications.panel.title")}
          </p>
          <UnreadList onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
