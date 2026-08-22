// BC-8.1 Turn C §A §B §K §V — Business Connect Notification Center product surface.
//
// Renders the recipient-scoped Business Connect notification stream via the
// public SDK hooks. No direct SDK/runtime imports; no PII in query keys.

import { useMemo, useState } from "react";
import { useT, type TKey, hasTKey } from "@/lib/i18n";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useArchiveNotification,
  useArchiveAllRead,
} from "@/hooks/use-bc-notifications";
import type {
  NotificationDTO,
  NotificationStatus,
} from "@/lib/business-connect/notification-orchestration/types";
import { Bell, Check, CheckCheck, Archive, RefreshCw } from "lucide-react";

const STATUS_TABS: Array<{ key: NotificationStatus | "all"; labelKey: TKey }> = [
  { key: "all", labelKey: "bc.notif.filter.status.all" },
  { key: "delivered", labelKey: "bc.notif.filter.status.delivered" },
  { key: "read", labelKey: "bc.notif.filter.status.read" },
  { key: "archived", labelKey: "bc.notif.filter.status.archived" },
];

function fallbackText(t: ReturnType<typeof useT>, key: string, fallback: string): string {
  return hasTKey(key) ? t(key) : fallback;
}

function NotificationRow({ n }: { n: NotificationDTO }) {
  const t = useT();
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const archive = useArchiveNotification();
  const isUnread = n.status === "delivered" || n.status === "pending" || n.status === "scheduled";
  const priorityKey = `bc.notif.priority.${n.priority}`;

  return (
    <li
      className={[
        "flex flex-col gap-2 rounded-lg border p-4 transition-colors",
        isUnread ? "border-primary/40 bg-primary/5" : "border-border bg-card",
      ].join(" ")}
      aria-labelledby={`notif-title-${n.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                n.priority === "critical"
                  ? "bg-destructive/10 text-destructive"
                  : n.priority === "high"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
              aria-label={fallbackText(t, priorityKey, n.priority)}
            >
              {fallbackText(t, priorityKey, n.priority)}
            </span>
            <time className="text-muted-foreground" dateTime={n.createdAt}>
              {new Date(n.createdAt).toLocaleString()}
            </time>
          </div>
          <h3
            id={`notif-title-${n.id}`}
            className="mt-1 truncate text-sm font-semibold text-foreground"
          >
            {fallbackText(t, n.titleKey, n.notificationKind)}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
            {fallbackText(t, n.bodyKey, "")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isUnread ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("bc.notif.markRead")}
              disabled={markRead.isPending}
              onClick={() => markRead.mutate({ id: n.id })}
            >
              <Check className="h-4 w-4" aria-hidden />
            </button>
          ) : n.status === "read" ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("bc.notif.markUnread")}
              disabled={markUnread.isPending}
              onClick={() => markUnread.mutate({ id: n.id })}
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          {n.status !== "archived" ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("bc.notif.archive")}
              disabled={archive.isPending}
              onClick={() => archive.mutate({ id: n.id })}
            >
              <Archive className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {n.action.targetRoute ? (
        <a
          href={n.action.targetRoute}
          className="inline-flex w-fit items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {fallbackText(t, n.action.labelKey, t("bc.notif.openAction"))}
        </a>
      ) : null}
    </li>
  );
}

export function BcNotificationCenter() {
  const t = useT();
  const [status, setStatus] = useState<NotificationStatus | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const filters = useMemo(
    () => ({ status: status === "all" ? null : status, unreadOnly, limit: 25 }),
    [status, unreadOnly],
  );
  const q = useNotifications(filters);
  const unread = useUnreadNotificationCount();
  const archiveAllRead = useArchiveAllRead();

  return (
    <section aria-labelledby="bc-notif-heading" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            id="bc-notif-heading"
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground"
          >
            <Bell className="h-6 w-6" aria-hidden />
            {t("bc.notif.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("bc.notif.subtitle")} ·{" "}
            <span aria-live="polite">
              {t("bc.notif.unreadCount", { count: unread.data?.count ?? 0 })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              void q.refetch();
              void unread.refetch();
            }}
            aria-label={t("bc.notif.refresh")}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t("bc.notif.refresh")}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={archiveAllRead.isPending}
            onClick={() => archiveAllRead.mutate()}
          >
            <Archive className="h-4 w-4" aria-hidden />
            {t("bc.notif.archiveAllRead")}
          </button>
        </div>
      </header>

      <div
        role="tablist"
        aria-label={t("bc.notif.title")}
        className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
      >
        {STATUS_TABS.map((tab) => {
          const selected = status === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={selected}
              className={[
                "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
              onClick={() => setStatus(tab.key)}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
        <label className="ml-auto inline-flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-border"
          />
          {t("bc.notif.unreadOnly")}
        </label>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("bc.notif.loading")}
        </p>
      ) : q.isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">{t("bc.notif.error")}</p>
          <button
            type="button"
            className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => void q.refetch()}
          >
            {t("bc.notif.retry")}
          </button>
        </div>
      ) : (q.data?.items.length ?? 0) === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("bc.notif.empty")}
        </p>
      ) : (
        <ul role="list" className="space-y-2" aria-busy={q.isFetching}>
          {q.data!.items.map((n) => (
            <NotificationRow key={n.id} n={n} />
          ))}
        </ul>
      )}
    </section>
  );
}
