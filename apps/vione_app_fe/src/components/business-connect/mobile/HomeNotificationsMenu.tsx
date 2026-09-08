// Chuông thông báo trên Trang chủ Connect-app: mở dropdown liệt kê thông báo
// chưa đọc (dữ liệu canonical qua SDK hooks) và cho phép đánh dấu đã đọc ngay.
// Không tạo kho thông báo song song, không hiển thị badge giả.

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useT, hasTKey } from "@/lib/i18n";
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-bc-notifications";
import type { NotificationDTO } from "@/lib/business-connect/notification-orchestration/types";

function text(
  t: ReturnType<typeof useT>,
  key: string,
  fallback: string,
  vars?: Record<string, any>
): string {
  return key && hasTKey(key) ? t(key as any, vars) : fallback;
}

function UnreadList({ onClose }: { onClose: () => void }) {
  const t = useT();
  const q = useNotifications({ unreadOnly: true, limit: 10 });
  const markRead = useMarkNotificationRead();
  const items: NotificationDTO[] = q.data?.items ?? [];

  useEffect(() => {
    void q.refetch();
  }, []);

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
        {items.map((n: any) => {
          const avatarUrl = n.safeDisplayData?.avatarUrl;
          const counterpartName = n.safeDisplayData?.counterpartDisplayName || "ViOne Member";
          const initial = counterpartName[0]?.toUpperCase() || "V";
          const isConnection = n.notificationKind === "connection_request_received" || n.sourceDomain === "connection";
          const displayTitle = isConnection
            ? "Lời mời kết nối mới"
            : text(t, n.titleKey, n.notificationKind, n.safeDisplayData);
          const displayBody = n.safeDisplayData?.message
            ? `"${n.safeDisplayData.message}"`
            : isConnection
              ? `${counterpartName} muốn kết nối danh thiếp với bạn.`
              : text(t, n.bodyKey, "", n.safeDisplayData);
          const targetRoute = isConnection ? "/connect-app/network" : (n.action?.targetRoute || "/connect-app/notifications");
          const targetSearch = isConnection ? { tab: "requests" } : (n.action?.targetSearch || undefined);

          return (
            <li
              key={n.id}
              className="flex items-start gap-2.5 border-b border-[var(--bc-mobile-border)] px-3.5 py-3 last:border-b-0 hover:bg-white/[0.04] transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-[var(--bc-mobile-border-gold)] object-cover shadow-sm"
                />
              ) : (
                <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] bg-[linear-gradient(135deg,rgba(216,178,130,0.2)_0%,rgba(194,155,105,0.1)_100%)] text-[12px] font-bold text-[#D8B282]">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-[var(--bc-mobile-text)]">
                  {displayTitle}
                </p>
                {displayBody ? (
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--bc-mobile-muted)]">
                    {displayBody}
                  </p>
                ) : null}
                <Link
                  to={targetRoute}
                  search={targetSearch}
                  onClick={onClose}
                  className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#D8B282] hover:underline"
                >
                  {isConnection ? "Xem lời mời kết nối" : text(t, n.action?.labelKey, t("bc.mobile.home.notifications.panel.open"), n.safeDisplayData)} →
                </Link>
              </div>
              <button
                type="button"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate({ id: n.id })}
                aria-label={t("bc.mobile.home.notifications.panel.markRead")}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-accent)] hover:bg-[#D8B282]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] disabled:opacity-60"
              >
                <Check className="size-4" aria-hidden />
              </button>
            </li>
          );
        })}
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
        className="relative grid place-items-center rounded-full text-[#d8c3b1] transition-colors hover:bg-[#ffffff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B282]"
      >
        <Bell className="h-5 w-5 text-[#d8c3b1]" strokeWidth={1.8} />
        {hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-solid border-[#12110f] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] font-['Inter-Bold',Helvetica] text-[9.5px] font-bold leading-none text-[#050c15]">
            {unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t("bc.mobile.home.notifications.panel.title")}
          className="absolute right-0 z-50 mt-2 w-[min(88vw,340px)] overflow-hidden rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(165deg,rgba(10,16,25,0.98)_0%,rgba(7,12,19,0.98)_50%,rgba(4,8,14,0.99)_100%)] backdrop-blur-xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)]"
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
