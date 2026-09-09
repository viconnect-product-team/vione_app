import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Trash2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useT, hasTKey } from "@/lib/i18n";
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from "@/hooks/use-bc-notifications";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";
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
  const deleteNotif = useDeleteNotification();
  const [actionStates, setActionStates] = useState<Record<string, "accepted" | "declined">>({});
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

  const handleAccept = async (notifId: string, connectionId: string) => {
    setActionStates(prev => ({ ...prev, [notifId]: "accepted", [connectionId]: "accepted" }));
    try {
      await GlobalNetworkSDK.mutations.accept(connectionId);
      markRead.mutate({ id: notifId });
      void q.refetch();
      toast.success("Đã đồng ý kết nối!");
    } catch {
      toast.error("Không thể hoàn tất kết nối");
    }
  };

  const handleDecline = async (notifId: string, connectionId: string) => {
    setActionStates(prev => ({ ...prev, [notifId]: "declined", [connectionId]: "declined" }));
    try {
      await GlobalNetworkSDK.mutations.decline(connectionId);
      markRead.mutate({ id: notifId });
      void q.refetch();
      toast.info("Đã từ chối lời mời");
    } catch {
      // ignore
    }
  };

  const handleDelete = async (notifId: string) => {
    try {
      await deleteNotif.mutateAsync({ id: notifId });
      void q.refetch();
      toast.success("Đã xóa thông báo");
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  return (
    <>
      <ul className="max-h-[60vh] overflow-y-auto">
        {items.map((n: any) => {
          const avatarUrl = n.safeDisplayData?.avatarUrl;
          const counterpartName = n.safeDisplayData?.counterpartDisplayName || "ViOne Member";
          const initial = counterpartName[0]?.toUpperCase() || "V";
          const isConnection = n.notificationKind === "connection_request_received" || n.sourceDomain === "connection";
          const connectionId = n.sourceRecordId || n.safeDisplayData?.connectionId;
          const resolvedStatus = actionStates[n.id] || (connectionId ? actionStates[connectionId] : null) || n.safeDisplayData?.connectionStatus || (n.notificationKind === "connection_request_accepted" ? "accepted" : "pending");

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
              className="flex items-start gap-2.5 border-b border-[var(--bc-mobile-border)] px-3.5 py-3 last:border-b-0 hover:bg-white/[0.04] transition-colors relative group"
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
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[13.5px] font-medium text-[var(--bc-mobile-text)]">
                    {displayTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    aria-label="Xóa thông báo"
                    className="p-1 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {displayBody ? (
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--bc-mobile-muted)]">
                    {displayBody}
                  </p>
                ) : null}

                {isConnection && connectionId ? (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {resolvedStatus === "accepted" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="size-3" />
                        <span>Đã kết nối</span>
                      </span>
                    ) : resolvedStatus === "declined" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
                        <X className="size-3" />
                        <span>Đã từ chối</span>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(n.id, connectionId)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                          Đồng ý
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecline(n.id, connectionId)}
                          className="px-2 py-1 rounded-full text-[11px] font-medium border border-white/20 text-white/70 hover:text-white transition-colors"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    <Link
                      to={targetRoute}
                      search={targetSearch}
                      onClick={onClose}
                      className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-[#D8B282] hover:underline ml-auto"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={targetRoute}
                    search={targetSearch}
                    onClick={onClose}
                    className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#D8B282] hover:underline"
                  >
                    {text(t, n.action?.labelKey, t("bc.mobile.home.notifications.panel.open"), n.safeDisplayData)} →
                  </Link>
                )}
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
