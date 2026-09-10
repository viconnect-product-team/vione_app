import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Trash2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useT, hasTKey } from "@/lib/i18n";
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
} from "@/hooks/use-bc-notifications";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";
import type { NotificationDTO } from "@/lib/business-connect/notification-orchestration/types";

function text(
  t: ReturnType<typeof useT>,
  key: string,
  fallback: string,
  vars?: Record<string, any>,
): string {
  return key && hasTKey(key) ? t(key as any, vars) : fallback;
}

function humanizeNotifTitle(kind: string, rawTitle?: string): string {
  if (rawTitle && rawTitle !== kind && !rawTitle.includes("moment_") && !rawTitle.includes("_")) {
    return rawTitle;
  }
  switch (kind) {
    case "moment_new_comment":
      return "Bình luận mới trong khoảnh khắc";
    case "moment_tagged":
      return "Bạn được gắn thẻ trong một khoảnh khắc";
    case "moment_liked":
      return "Có người vừa thích khoảnh khắc của bạn";
    case "club_application_submitted":
      return "Đơn đăng ký gia nhập CLB mới";
    case "club_application_approved":
      return "Hồ sơ hội viên đã được phê duyệt!";
    case "club_application_rejected":
      return "Thông báo về hồ sơ hội viên";
    case "connection_request_received":
      return "Lời mời kết nối mới";
    case "connection_request_accepted":
      return "Đã đồng ý kết nối danh thiếp";
    default:
      return rawTitle || "Thông báo mới";
  }
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
    setActionStates((prev) => ({ ...prev, [notifId]: "accepted", [connectionId]: "accepted" }));
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
    setActionStates((prev) => ({ ...prev, [notifId]: "declined", [connectionId]: "declined" }));
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
      <ul className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--bc-mobile-border)]">
        {items.map((n: any) => {
          const avatarUrl = n.safeDisplayData?.avatarUrl;
          const counterpartName = n.safeDisplayData?.counterpartDisplayName || "ViOne Member";
          const initial = counterpartName[0]?.toUpperCase() || "V";
          const isConnection =
            n.notificationKind === "connection_request_received" || n.sourceDomain === "connection";
          const connectionId = n.sourceRecordId || n.safeDisplayData?.connectionId;
          const resolvedStatus =
            actionStates[n.id] ||
            (connectionId ? actionStates[connectionId] : null) ||
            n.safeDisplayData?.connectionStatus ||
            (n.notificationKind === "connection_request_accepted" ? "accepted" : "pending");

          const rawTitle = text(t, n.titleKey, n.notificationKind, n.safeDisplayData);
          const displayTitle = isConnection
            ? "Lời mời kết nối mới"
            : humanizeNotifTitle(n.notificationKind, rawTitle);
          const displayBody = n.safeDisplayData?.message
            ? `"${n.safeDisplayData.message}"`
            : isConnection
              ? `${counterpartName} muốn kết nối danh thiếp với bạn.`
              : text(t, n.bodyKey, "", n.safeDisplayData);
          const targetRoute = isConnection
            ? "/connect-app/network"
            : n.action?.targetRoute || "/connect-app/notifications";
          const targetSearch = isConnection
            ? { tab: "requests" }
            : n.action?.targetSearch || undefined;

          return (
            <li
              key={n.id}
              className="flex items-start gap-2.5 px-3.5 py-3 hover:bg-white/[0.04] transition-colors relative group"
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
                <p className="truncate text-[13px] font-bold text-[var(--bc-mobile-text,#F8F7F3)]">
                  {displayTitle}
                </p>
                {displayBody ? (
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-[var(--bc-mobile-muted,#94A3B8)]">
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
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
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
                      onClick={() => {
                        markRead.mutate({ id: n.id });
                        onClose();
                      }}
                      className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-[#D8B282] hover:underline ml-auto"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={targetRoute}
                    search={targetSearch}
                    onClick={() => {
                      markRead.mutate({ id: n.id });
                      onClose();
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#D8B282] hover:underline"
                  >
                    {text(
                      t,
                      n.action?.labelKey,
                      t("bc.mobile.home.notifications.panel.open"),
                      n.safeDisplayData,
                    )}{" "}
                    →
                  </Link>
                )}
              </div>

              {/* Action buttons (Delete & Mark Read) with balanced sizes */}
              <div className="flex items-center gap-1.5 shrink-0 self-center">
                <button
                  type="button"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate({ id: n.id })}
                  title="Đánh dấu đã đọc"
                  className="grid size-7.5 place-items-center rounded-lg border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-accent,#D8B282)] hover:bg-[#D8B282]/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] disabled:opacity-50 cursor-pointer"
                >
                  <Check className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  title="Xóa thông báo"
                  className="grid size-7.5 place-items-center rounded-lg border border-white/10 text-white/40 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2 border-t border-[var(--bc-mobile-border)] p-2.5 bg-black/40">
        <button
          type="button"
          disabled={markRead.isPending}
          onClick={async () => {
            for (const n of items) {
              await markRead.mutateAsync({ id: n.id }).catch(() => {});
            }
            void q.refetch();
            toast.success("Đã đánh dấu tất cả là đã đọc");
          }}
          className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D8B282]/50 bg-gradient-to-r from-[#D8B282]/15 to-[#C29B69]/10 text-[12px] font-bold text-[#F7D896] hover:bg-[#D8B282]/20 transition-all cursor-pointer disabled:opacity-60"
        >
          <CheckCheck className="size-3.5" aria-hidden />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
        <Link
          to="/connect-app/notifications"
          onClick={onClose}
          className="inline-flex min-h-9 px-3.5 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[12px] font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
        >
          <span>Xem tất cả</span>
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
