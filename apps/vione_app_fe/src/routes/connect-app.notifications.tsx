// Trung tâm thông báo riêng cho Connect-app (/connect-app/notifications).
// Giao diện tối "Executive Minimal Luxury", đọc/ghi qua SDK thông báo sẵn có
// (không kho dữ liệu song song, không badge ảo).

import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Loader2, Undo2 } from "lucide-react";
import { hasTKey, useLang, useT } from "@/lib/i18n";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import { BusinessConnectTopBar } from "@/components/business-connect/mobile/BusinessConnectTopBar";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkNotificationUnread,
} from "@/hooks/use-bc-notifications";
import type { NotificationDTO } from "@/lib/business-connect/notification-orchestration/types";

export const Route = createFileRoute("/connect-app/notifications")({
  head: () => ({
    meta: [
      { title: "Thông báo — ViOne Connect" },
      {
        name: "description",
        content:
          "Trung tâm thông báo ViOne Connect: lời mời kết nối, cộng đồng, cuộc gặp và nhắc việc.",
      },
      { property: "og:title", content: "Thông báo — ViOne Connect" },
      {
        property: "og:description",
        content: "Theo dõi lời mời kết nối, hoạt động cộng đồng và nhắc việc trong ViOne Connect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectAppNotificationsPage,
});

type Tab = "unread" | "all";

function label(t: ReturnType<typeof useT>, key: string, fallback: string): string {
  return key && hasTKey(key) ? t(key) : fallback;
}

/** Chèn dữ liệu hiển thị an toàn ({communityName}, ...) vào chuỗi đã dịch. */
function fill(text: string, data: unknown): string {
  if (!text || !data || typeof data !== "object") return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => {
    const v = (data as Record<string, unknown>)[k];
    return typeof v === "string" || typeof v === "number" ? String(v) : m;
  });
}

function timeLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConnectAppNotificationsPage() {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const [tab, setTab] = useState<Tab>("unread");

  const query = useNotifications({ unreadOnly: tab === "unread", limit: 30 });
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();

  const items: NotificationDTO[] = useMemo(() => query.data?.items ?? [], [query.data]);
  const unreadItems = items.filter((n) => n.readAt === null);
  const busy = markRead.isPending || markUnread.isPending;

  const tabs: Array<{ value: Tab; text: string }> = [
    { value: "unread", text: t("bc.mobile.notifications.page.tab.unread") },
    { value: "all", text: t("bc.mobile.notifications.page.tab.all") },
  ];

  return (
    <MobilePage>
      <BusinessConnectTopBar title={t("bc.mobile.notifications.page.title")} back />
      <div className="grid gap-4 pt-5">
        <p className="text-[12.5px] leading-snug text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.notifications.page.desc")}
        </p>

        <div
          role="tablist"
          aria-label={t("bc.mobile.notifications.page.title")}
          className="flex gap-2"
        >
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className={`min-h-9 flex-1 rounded-full border px-3 text-[13px] font-medium transition-colors ${
                tab === item.value
                  ? "border-transparent bg-[var(--bc-mobile-text)] text-[var(--bc-mobile-surface)]"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)]"
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>

        {unreadItems.length > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              for (const n of unreadItems) markRead.mutate({ id: n.id });
            }}
            data-testid="bc-notifications-mark-all"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--bc-mobile-border-gold)] text-[13px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="size-4" aria-hidden />
            )}
            {t("bc.mobile.notifications.page.markAll")}
          </button>
        ) : null}

        {query.isPending ? (
          <ul className="grid gap-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-[86px] animate-pulse rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)]"
              />
            ))}
          </ul>
        ) : query.isError ? (
          <section className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-6 text-center">
            <p role="alert" className="text-[14px] text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.notifications.page.error")}
            </p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-3 min-h-11 rounded-full bg-[var(--bc-mobile-text)] px-6 text-[14px] font-semibold text-[var(--bc-mobile-surface)]"
            >
              {t("bc.mobile.notifications.page.retry")}
            </button>
          </section>
        ) : items.length === 0 ? (
          <section className="flex flex-col items-center gap-2 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-6 py-10 text-center">
            <Bell className="size-6 text-[var(--bc-mobile-muted)]" strokeWidth={1.5} aria-hidden />
            <p className="text-[14px] text-[var(--bc-mobile-text)]">
              {tab === "unread"
                ? t("bc.mobile.notifications.page.empty.unread")
                : t("bc.mobile.notifications.page.empty.all")}
            </p>
            <p className="max-w-[32ch] text-[12.5px] text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.notifications.page.empty.hint")}
            </p>
          </section>
        ) : (
          <ul
            aria-label={t("bc.mobile.notifications.page.title")}
            className="grid gap-3"
            data-testid="bc-notifications-list"
          >
            {items.map((n: any) => {
              const unread = n.readAt === null;
              return (
                <li
                  key={n.id}
                  className={`rounded-3xl border bg-[var(--bc-mobile-surface)] p-4 ${
                    unread
                      ? "border-[var(--bc-mobile-border-gold)]"
                      : "border-[var(--bc-mobile-border)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        unread ? "bg-[var(--bc-mobile-accent)]" : "bg-[var(--bc-mobile-border)]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold leading-snug text-[var(--bc-mobile-text)]">
                        {fill(label(t, n.titleKey, n.notificationKind), n.safeDisplayData)}
                      </p>
                      {label(t, n.bodyKey, "") ? (
                        <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
                          {fill(label(t, n.bodyKey, ""), n.safeDisplayData)}
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-[11.5px] text-[var(--bc-mobile-muted)]">
                        {timeLabel(n.createdAt, locale)}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {n.action.targetRoute ? (
                          <Link
                            to={n.action.targetRoute}
                            search={(n.action.targetSearch ?? undefined) as never}
                            className="inline-flex min-h-9 items-center rounded-full border border-[var(--bc-mobile-border-gold)] px-3.5 text-[12.5px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
                          >
                            {label(t, n.action.labelKey, t("bc.mobile.notifications.page.open"))}
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            unread
                              ? markRead.mutate({ id: n.id })
                              : markUnread.mutate({ id: n.id })
                          }
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--bc-mobile-border)] px-3.5 text-[12.5px] font-medium text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:opacity-60"
                        >
                          {unread ? (
                            <Check className="size-3.5" aria-hidden />
                          ) : (
                            <Undo2 className="size-3.5" aria-hidden />
                          )}
                          {unread
                            ? t("bc.mobile.notifications.page.markRead")
                            : t("bc.mobile.notifications.page.markUnread")}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MobilePage>
  );
}
