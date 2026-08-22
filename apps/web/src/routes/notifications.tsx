// ============= Full file contents =============

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Info,
  Mail,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { EmptyState, NoNotifications, NoSearchResult } from "@/components/dashboard/StateKit";
import type { Notification } from "@/lib/extra-data";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { getLastSeen, markNotificationsSeen } from "@/hooks/use-unread-notifications";
import {
  createNotificationFn,
  deleteNotificationFn,
  listNotificationsFn,
  sendNotificationFn,
  updateNotificationFn,
} from "@/lib/notifications.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/notifications")({
  ssr: false,
  loader: () => listNotificationsFn(),
  component: NotifyPage,
});

const STATUS_KEY: Record<Notification["status"], TKey> = {
  sent: "notif.status.sent",
  scheduled: "notif.status.scheduled",
  draft: "notif.status.draft",
};
const STATUS_COLOR: Record<Notification["status"], "success" | "info" | "neutral"> = {
  sent: "success",
  scheduled: "info",
  draft: "neutral",
};
const AUDIENCE_KEY: Record<Notification["audience"], TKey> = {
  all: "notif.aud.all",
  members: "notif.aud.members",
  sponsors: "notif.aud.sponsors",
  staff: "notif.aud.staff",
};

function audienceIcon(a: Notification["audience"]) {
  if (a === "sponsors" || a === "staff") return Info;
  return Megaphone;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

type Tab = "all" | "unread" | "read";

function NotifyPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const items = Route.useLoaderData() as Notification[];
  const sent = items.filter((n) => n.status === "sent");
  const totalReach = sent.reduce((s, n) => s + n.reach, 0);

  const rel = useCallback(
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
      return fmt.date(iso);
    },
    [t, fmt],
  );

  // lastSeenAt: captured after mount to avoid SSR/localStorage hydration mismatch.
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    setSeen(getLastSeen());
    const onSeen = () => setSeen(getLastSeen());
    window.addEventListener("notifications-seen", onSeen);
    return () => window.removeEventListener("notifications-seen", onSeen);
  }, []);

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<"all" | Notification["audience"]>("all");

  const createFn = useServerFn(createNotificationFn);
  const updateFn = useServerFn(updateNotificationFn);
  const deleteFn = useServerFn(deleteNotificationFn);
  const sendFn = useServerFn(sendNotificationFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const tsOf = (n: Notification) => (n.sentAt ? new Date(n.sentAt).getTime() : 0);
  const isUnread = useCallback((n: Notification) => n.status === "sent" && tsOf(n) > seen, [seen]);

  const unreadCount = useMemo(() => items.filter(isUnread).length, [items, isUnread]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((n) => {
        if (tab === "unread" && !isUnread(n)) return false;
        if (tab === "read" && isUnread(n)) return false;
        if (audience !== "all" && n.audience !== audience) return false;
        if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => tsOf(b) - tsOf(a));
  }, [items, tab, audience, query, isUnread]);

  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const groups = useMemo(
    () => [
      { key: "notif.today" as TKey, rows: filtered.filter((n) => tsOf(n) >= todayStart) },
      {
        key: "notif.yesterday" as TKey,
        rows: filtered.filter((n) => tsOf(n) >= yesterdayStart && tsOf(n) < todayStart),
      },
      { key: "notif.earlier" as TKey, rows: filtered.filter((n) => tsOf(n) < yesterdayStart) },
    ],
    [filtered, todayStart, yesterdayStart],
  );

  const fields: CrudField[] = [
    { name: "title", label: t("notif.col.title"), type: "text", required: true },
    { name: "body", label: t("notif.col.title"), type: "textarea" },
    {
      name: "audience",
      label: t("notif.col.audience"),
      type: "select",
      options: [
        { value: "all", label: t("notif.aud.all") },
        { value: "members", label: t("notif.aud.members") },
        { value: "sponsors", label: t("notif.aud.sponsors") },
        { value: "staff", label: t("notif.aud.staff") },
      ],
    },
    {
      name: "channel",
      label: t("notif.col.channel"),
      type: "select",
      options: [
        { value: "inapp", label: t("notif.channel.inapp") },
        { value: "email", label: t("notif.channel.email") },
        { value: "sms", label: t("notif.channel.sms") },
      ],
    },
    {
      name: "status",
      label: t("notif.col.status"),
      type: "select",
      options: [
        { value: "draft", label: t("notif.status.draft") },
        { value: "scheduled", label: t("notif.status.scheduled") },
        { value: "sent", label: t("notif.status.sent") },
      ],
    },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...(v as object) } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: v as never });
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSend = async (n: Notification) => {
    setBusyId(n.id);
    try {
      await sendFn({ data: { id: n.id } });
      toast.success(t("notif.sentToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (n: Notification) => {
    if (!window.confirm(t("common.confirmDelete", { name: n.title }))) return;
    setBusyId(n.id);
    try {
      await deleteFn({ data: { id: n.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setBusyId(null);
    }
  };

  const markAll = () => {
    markNotificationsSeen();
    setSeen(Date.now());
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: t("notif.tab.all"), count: items.length },
    { key: "unread", label: t("notif.tab.unread"), count: unreadCount },
    { key: "read", label: t("notif.tab.read") },
  ];

  const renderCard = (n: Notification) => {
    const unread = isUnread(n);
    const Icon = audienceIcon(n.audience);
    return (
      <div
        key={n.id}
        className={`group flex gap-3 rounded-xl border p-3.5 transition-colors sm:p-4 ${
          unread ? "border-primary/30 bg-accent/40" : "border-border bg-card hover:bg-secondary/40"
        }`}
      >
        <span
          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{n.title}</p>
            {unread && (
              <span className="mt-0.5 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {t("notif.unreadPill")}
              </span>
            )}
          </div>
          {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>{t(AUDIENCE_KEY[n.audience])}</span>
            <span className="uppercase font-semibold">{n.channel}</span>
            <Pill color={STATUS_COLOR[n.status]}>{t(STATUS_KEY[n.status])}</Pill>
            {n.status === "sent" && <span>{rel(n.sentAt)}</span>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {n.status !== "sent" && (
            <button
              onClick={() => onSend(n)}
              disabled={busyId === n.id}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              {t("notif.send")}
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditing(n);
                setOpen(true);
              }}
              aria-label={t("common.editTitle")}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onDelete(n)}
              disabled={busyId === n.id}
              aria-label={t("common.delete")}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const emptyView =
    tab === "unread" ? (
      <NoNotifications title={t("notif.inbox.empty.unread")} />
    ) : tab === "read" ? (
      <EmptyState title={t("notif.inbox.empty.read")} />
    ) : query.trim() || audience !== "all" ? (
      <NoSearchResult />
    ) : (
      <NoNotifications />
    );

  return (
    <AppShell>
      <PageHeader
        title={t("notif.title")}
        subtitle={t("notif.inbox.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAll}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                {t("notif.markAll")}
              </button>
            )}
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("notif.create")}
            </button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("notif.kpi.total")}
          value={items.length}
          icon={<Bell className="h-4 w-4" />}
        />
        <StatCard
          label={t("notif.kpi.sent")}
          value={sent.length}
          tone="success"
          icon={<Send className="h-4 w-4" />}
        />
        <StatCard
          label={t("notif.kpi.scheduled")}
          value={items.filter((n) => n.status === "scheduled").length}
          tone="info"
          icon={<Bell className="h-4 w-4" />}
        />
        <StatCard
          label={t("notif.kpi.reach")}
          value={fmt.num(totalReach)}
          tone="primary"
          icon={<Mail className="h-4 w-4" />}
        />
      </div>

      {/* Sticky tabs + search/filter */}
      <div className="sticky top-0 z-10 -mx-1 mb-4 rounded-xl border border-border bg-background/85 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label={t("notif.title")}
            className="flex items-center gap-1 rounded-lg bg-muted p-1"
          >
            {tabs.map((tb) => {
              const active = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  role="tab"
                  aria-selected={active}
                  aria-pressed={active}
                  onClick={() => setTab(tb.key)}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tb.label}
                  {typeof tb.count === "number" && tb.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-bold ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {tb.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("notif.search")}
                aria-label={t("notif.search")}
                className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              aria-label={t("notif.col.audience")}
              className="h-11 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">{t("notif.filter.audience")}</option>
              <option value="members">{t("notif.aud.members")}</option>
              <option value="sponsors">{t("notif.aud.sponsors")}</option>
              <option value="staff">{t("notif.aud.staff")}</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        emptyView
      ) : (
        <div className="space-y-5">
          {groups.map(
            (g) =>
              g.rows.length > 0 && (
                <div key={g.key}>
                  <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t(g.key)}
                  </div>
                  <div className="space-y-2.5">{g.rows.map(renderCard)}</div>
                </div>
              ),
          )}
        </div>
      )}

      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("notif.create")}
        fields={fields}
        initial={editing ? (editing as unknown as CrudValues) : undefined}
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </AppShell>
  );
}
