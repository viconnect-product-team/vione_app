import { Bell, CheckCheck, Megaphone, Info, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useT } from "@/lib/i18n";
import type { Notification } from "@/lib/extra-data";
import { listNotificationsFn } from "@/lib/notifications.functions";
import { getLastSeen, markNotificationsSeen } from "@/hooks/use-unread-notifications";
import { ListSkeleton, NoNotifications } from "@/components/dashboard/StateKit";

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function useRelativeTime() {
  const t = useT();
  return useCallback(
    (iso: string) => {
      const ts = iso ? new Date(iso).getTime() : 0;
      if (!ts) return "";
      const diff = Date.now() - ts;
      const min = Math.floor(diff / 60000);
      if (min < 1) return t("time.now");
      if (min < 60) return `${min} ${t("time.minute")}`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr} ${t("time.hour")}`;
      const day = Math.floor(hr / 24);
      if (day < 30) return `${day} ${t("time.day")}`;
      return new Date(ts).toLocaleDateString();
    },
    [t],
  );
}

function audienceIcon(a: Notification["audience"]) {
  if (a === "sponsors" || a === "staff") return Info;
  return Megaphone;
}

export function NotificationCenter() {
  const t = useT();
  const rel = useRelativeTime();
  const list = useServerFn(listNotificationsFn);
  const [items, setItems] = useState<Notification[]>([]);
  const [seen, setSeen] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await list({});
      setItems(rows.filter((n) => n.status === "sent"));
      setSeen(getLastSeen());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    void refresh();
    const onSeen = () => setSeen(getLastSeen());
    window.addEventListener("notifications-seen", onSeen);
    return () => window.removeEventListener("notifications-seen", onSeen);
  }, [refresh]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          (b.sentAt ? new Date(b.sentAt).getTime() : 0) -
          (a.sentAt ? new Date(a.sentAt).getTime() : 0),
      ),
    [items],
  );
  const unreadCount = useMemo(
    () => sorted.filter((n) => (n.sentAt ? new Date(n.sentAt).getTime() : 0) > seen).length,
    [sorted, seen],
  );
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const tsOf = (n: Notification) => (n.sentAt ? new Date(n.sentAt).getTime() : 0);
  const today = sorted.filter((n) => tsOf(n) >= todayStart);
  const yesterday = sorted.filter((n) => tsOf(n) >= yesterdayStart && tsOf(n) < todayStart);
  const earlier = sorted.filter((n) => tsOf(n) < yesterdayStart);

  const markAll = () => {
    markNotificationsSeen();
    setSeen(Date.now());
  };

  const renderItem = (n: Notification, i: number) => {
    const ts = n.sentAt ? new Date(n.sentAt).getTime() : 0;
    const unread = ts > seen;
    const Icon = audienceIcon(n.audience);
    return (
      <div
        key={n.id ?? `${n.title}-${i}`}
        className={`flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted ${
          unread ? "bg-accent/40" : ""
        }`}
      >
        <span
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{n.title}</p>
            {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>
          {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
          <p className="mt-1 text-[11px] text-muted-foreground">{rel(n.sentAt)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("notif.title")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="vba-badge-pop absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div className="vba-pop-in absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-elevated)]">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t("notif.title")}</p>
              {unreadCount > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount} {t("notif.unreadCount")}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAll}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("notif.markAll")}
              </button>
            )}
          </div>

          <div className="max-h-[min(26rem,60vh)] overflow-y-auto p-1.5">
            {loading ? (
              <div className="p-2.5">
                <ListSkeleton rows={4} />
              </div>
            ) : sorted.length === 0 ? (
              <NoNotifications />
            ) : (
              <>
                {[
                  { key: "notif.today", rows: today },
                  { key: "notif.yesterday", rows: yesterday },
                  { key: "notif.earlier", rows: earlier },
                ].map(
                  (s) =>
                    s.rows.length > 0 && (
                      <div key={s.key}>
                        <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {t(s.key as Parameters<typeof t>[0])}
                        </div>
                        {s.rows.map(renderItem)}
                      </div>
                    ),
                )}
              </>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-border px-3.5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            {t("notif.viewAll")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
