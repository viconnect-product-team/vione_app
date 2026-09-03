import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Wallet,
  Sparkles,
  Info,
  Users,
  BriefcaseBusiness,
  Eye,
  PhoneCall,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Search,
  X,
  ExternalLink,
  Loader2,
  Check,
  EyeOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listMyNotifications,
  markAllNotificationsReadFn,
  unmarkAllNotificationsReadFn,
  markNotificationReadFn,
  dismissNotificationFn,
  dismissAllNotificationsFn,
  dismissBroadcastNotificationsFn,
  restoreNotificationFn,
  restoreBroadcastNotificationsFn,
  restoreAllPersonalNotificationsFn,
  type MyNotification,
  type LeadWorkflowStatus,
  type NotificationPriority,
} from "@/lib/member-app.functions";
import { processLeadWorkflowFn } from "@/lib/business-card.functions";
import { useT, useFmt, type TKey } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NOTIFICATIONS_PREFS_KEY = "vba-notifications-preferences";

const notificationsSearchSchema = z.object({
  filter: fallback(z.enum(["all", "lead", "unread", "read", "dismissed"]), "all").default("all"),
  sort: fallback(z.enum(["priority", "newest"]), "priority").default("priority"),
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/m/notifications")({
  component: NotificationsScreen,
  validateSearch: zodValidator(notificationsSearchSchema),
});

const iconFor = (t: MyNotification["type"]) =>
  t === "event"
    ? Calendar
    : t === "fee"
      ? Wallet
      : t === "opportunity"
        ? Sparkles
        : t === "network"
          ? Users
          : t === "lead"
            ? BriefcaseBusiness
            : Info;

const LEAD_STATUS_LABEL: Record<LeadWorkflowStatus, TKey> = {
  new: "m.notifications.lead.markRead",
  read: "m.notifications.lead.markRead",
  contacting: "m.notifications.lead.contacting",
  responded: "m.notifications.lead.contacting",
  won: "m.notifications.lead.won",
  lost: "m.notifications.lead.lost",
  archived: "m.notifications.lead.lost",
};

const WORKFLOW_ACTIONS: {
  status: "read" | "contacting" | "won" | "lost";
  key: TKey;
  Icon: typeof Eye;
}[] = [
  { status: "read", key: "m.notifications.lead.markRead", Icon: Eye },
  { status: "contacting", key: "m.notifications.lead.contacting", Icon: PhoneCall },
  { status: "won", key: "m.notifications.lead.won", Icon: CheckCircle2 },
  { status: "lost", key: "m.notifications.lead.lost", Icon: XCircle },
];

function LeadActions({
  leadId,
  current,
  onDone,
}: {
  leadId: string;
  current: LeadWorkflowStatus | null;
  onDone: () => void;
}) {
  const t = useT();
  const process = useServerFn(processLeadWorkflowFn);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (status: "read" | "contacting" | "won" | "lost") => {
    setBusy(status);
    try {
      await process({ data: { id: leadId, status } });
      toast.success(t("m.notifications.lead.updated"));
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2.5">
      {current && (
        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--vba-gold-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--vba-gold)]">
          {t("m.notifications.lead.current")}: {t(LEAD_STATUS_LABEL[current])}
        </span>
      )}
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={t("m.notifications.lead.workflow")}
        aria-describedby={`lead-wf-hint-${leadId}`}
      >
        <span id={`lead-wf-hint-${leadId}`} className="sr-only">
          {t("m.notifications.lead.workflowHint")}
        </span>
        {WORKFLOW_ACTIONS.map(({ status, key, Icon }) => {
          const active = current === status;
          return (
            <button
              key={status}
              type="button"
              disabled={busy !== null}
              onClick={() => run(status)}
              aria-pressed={active}
              aria-label={t(key)}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vba-gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--vba-bg)] disabled:opacity-50"
              style={{
                borderColor: active ? "var(--vba-gold)" : "var(--vba-border)",
                color: active ? "var(--vba-gold)" : "var(--vba-text-muted)",
                background: active ? "var(--vba-gold-soft)" : "transparent",
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const t = useT();
  const fmt = useFmt();
  const fetchNotis = useServerFn(listMyNotifications);
  const markAllRead = useServerFn(markAllNotificationsReadFn);
  const unmarkAllRead = useServerFn(unmarkAllNotificationsReadFn);
  const markRead = useServerFn(markNotificationReadFn);
  const dismiss = useServerFn(dismissNotificationFn);
  const dismissAll = useServerFn(dismissAllNotificationsFn);
  const dismissBroadcast = useServerFn(dismissBroadcastNotificationsFn);
  const restoreOne = useServerFn(restoreNotificationFn);
  const restoreBroadcast = useServerFn(restoreBroadcastNotificationsFn);
  const restoreAllPersonal = useServerFn(restoreAllPersonalNotificationsFn);
  const navigate = useNavigate({ from: "/m/notifications" });
  const {
    data: notifications,
    loading,
    reload,
  } = useServerData<MyNotification[]>(() => fetchNotis(), []);
  const [marking, setMarking] = useState(false);
  const [dismissingAll, setDismissingAll] = useState(false);
  const [openingLeadId, setOpeningLeadId] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [confirmDismiss, setConfirmDismiss] = useState<MyNotification | null>(null);
  const [confirmDismissAll, setConfirmDismissAll] = useState(false);
  const dismissTriggerRef = useRef<HTMLElement | null>(null);
  const restoreDialogFocus = () => {
    const el = dismissTriggerRef.current;
    dismissTriggerRef.current = null;
    if (el && document.contains(el)) {
      requestAnimationFrame(() => el.focus());
    }
  };
  const [lastBulkAction, setLastBulkAction] = useState<
    | null
    | { type: "markRead"; ids: string[] }
    | { type: "dismiss"; personalIds: string[]; broadcastIds: string[] }
  >(null);

  const onMarkOneRead = async (n: MyNotification) => {
    if (rowBusy) return;
    setRowBusy(n.id);
    try {
      await markRead({ data: { id: n.id } });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("m.notifications.markOne.error"));
    } finally {
      setRowBusy(null);
    }
  };

  const onUndoDismiss = async (n: MyNotification) => {
    try {
      if (n.personal) {
        await restoreOne({ data: { id: n.id } });
      } else {
        await restoreBroadcast({ data: { ids: [n.id] } });
      }
      reload();
      toast.success(t("m.notifications.undo.done"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("m.notifications.dismiss.error"));
    }
  };

  const onDismiss = async (n: MyNotification) => {
    if (rowBusy) return;
    setRowBusy(n.id);
    try {
      if (n.personal) {
        await dismiss({ data: { id: n.id } });
      } else {
        await dismissBroadcast({ data: { ids: [n.id] } });
      }
      reload();
      toast.success(t("m.notifications.dismiss.done"), {
        duration: 6000,
        action: {
          label: t("m.notifications.undo.action"),
          onClick: () => onUndoDismiss(n),
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("m.notifications.dismiss.error"));
    } finally {
      setRowBusy(null);
    }
  };

  const hasUnread = notifications.some((n) => n.unread);

  const onUndoBulkAction = async () => {
    if (!lastBulkAction) return;
    const action = lastBulkAction;
    setLastBulkAction(null);
    try {
      if (action.type === "markRead" && action.ids.length > 0) {
        await unmarkAllRead({ data: { ids: action.ids } });
      } else if (action.type === "dismiss") {
        if (action.personalIds.length > 0) {
          await restoreAllPersonal({ data: { ids: action.personalIds } });
        }
        if (action.broadcastIds.length > 0) {
          await restoreBroadcast({ data: { ids: action.broadcastIds } });
        }
      }
      reload();
      toast.success(t("m.notifications.undoAll.done"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("m.notifications.undoAll.error"));
    }
  };

  const onMarkAllRead = async () => {
    if (marking || !hasUnread) return;
    setMarking(true);
    try {
      const result = await markAllRead();
      setLastBulkAction({ type: "markRead", ids: result.ids ?? [] });
      toast.success(t("m.notifications.markAllRead.done"), {
        duration: 6000,
        action: {
          label: t("m.notifications.undo.action"),
          onClick: onUndoBulkAction,
        },
      });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setMarking(false);
    }
  };

  const search = Route.useSearch();

  const [filter, setFilter] = useState<"all" | "lead" | "unread" | "read" | "dismissed">(
    search.filter,
  );
  const [sort, setSort] = useState<"priority" | "newest">(search.sort);
  const [query, setQuery] = useState(search.q ?? "");
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!prefsLoaded) {
      setPrefsLoaded(true);
      const isDefaultUrl =
        search.filter === "all" &&
        search.sort === "priority" &&
        (search.q === "" || search.q == null);
      if (!isDefaultUrl) return;
      const saved = localStorage.getItem(NOTIFICATIONS_PREFS_KEY);
      if (!saved) return;
      try {
        const p = JSON.parse(saved) as {
          filter?: string;
          sort?: string;
          q?: string;
        };
        const validFilters: (typeof filter)[] = ["all", "lead", "unread", "read", "dismissed"];
        if (validFilters.includes(p.filter as typeof filter)) setFilter(p.filter as typeof filter);
        if (p.sort === "priority" || p.sort === "newest") setSort(p.sort);
        if (typeof p.q === "string") setQuery(p.q);
      } catch {
        // ignore corrupt storage
      }
      return;
    }

    localStorage.setItem(NOTIFICATIONS_PREFS_KEY, JSON.stringify({ filter, sort, q: query }));
    const t = setTimeout(() => {
      navigate({ search: { filter, sort, q: query }, replace: true });
    }, 150);
    return () => clearTimeout(t);
  }, [filter, sort, query, search.filter, search.sort, search.q, navigate, prefsLoaded]);

  const filterTabs: { key: typeof filter; label: TKey }[] = [
    { key: "all", label: "m.notifications.filter.all" },
    { key: "unread", label: "m.notifications.filter.unread" },
    { key: "read", label: "m.notifications.filter.read" },
    { key: "dismissed", label: "m.notifications.filter.dismissed" },
    { key: "lead", label: "m.notifications.filter.lead" },
  ];

  const PRIORITY_RANK: Record<NotificationPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  const PRIORITY_KEY: Record<NotificationPriority, TKey> = {
    high: "m.notifications.priority.high",
    medium: "m.notifications.priority.medium",
    low: "m.notifications.priority.low",
  };
  const priorityColor = (p: NotificationPriority) =>
    p === "high" ? "var(--vba-danger)" : p === "medium" ? "var(--vba-gold)" : "var(--vba-text-dim)";

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const q = normalize((query ?? "").trim());

  const visible = notifications
    .filter((n) => {
      if (filter === "dismissed") return n.dismissed;
      if (n.dismissed) return false;
      if (filter === "lead") return n.type === "lead";
      if (filter === "unread") return n.unread;
      if (filter === "read") return !n.unread;
      return true;
    })
    .filter((n) => (q ? normalize(n.title).includes(q) || normalize(n.body).includes(q) : true))
    .slice()
    .sort((a, b) => {
      if (sort === "priority") {
        const d = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        if (d !== 0) return d;
      }
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return tb - ta;
    });

  const hasVisible = visible.length > 0;

  const executeDismissAll = async () => {
    if (dismissingAll || !hasVisible) return;
    setConfirmDismissAll(false);
    setDismissingAll(true);
    try {
      const result = await dismissAll();
      // Also persist dismissal of broadcast notifications so it syncs across devices.
      const broadcastIds = visible.filter((n) => !n.personal).map((n: any) => n.id);
      if (broadcastIds.length > 0) {
        await dismissBroadcast({ data: { ids: broadcastIds } });
      }
      setLastBulkAction({
        type: "dismiss",
        personalIds: result.ids ?? [],
        broadcastIds,
      });
      toast.success(t("m.notifications.dismissAll.done"), {
        duration: 6000,
        action: {
          label: t("m.notifications.undo.action"),
          onClick: onUndoBulkAction,
        },
      });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("m.notifications.dismissAll.error"));
    } finally {
      setDismissingAll(false);
    }
  };

  return (
    <div className="vba-animate">
      <MemberHeader
        title={t("m.notifications.title")}
        back
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={onMarkAllRead}
              disabled={marking || !hasUnread || filter === "dismissed"}
              aria-label={t("m.notifications.markAllRead")}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-40"
            >
              {marking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              {t("m.notifications.markAllRead")}
            </button>
            <button
              onClick={(e) => {
                dismissTriggerRef.current = e.currentTarget;
                setConfirmDismissAll(true);
              }}
              disabled={dismissingAll || !hasVisible || filter === "dismissed"}
              aria-label={t("m.notifications.dismissAll")}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--vba-text-muted)] transition hover:bg-card/5 disabled:opacity-40"
            >
              {dismissingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {t("m.notifications.dismissAll")}
            </button>
          </div>
        }
      />

      <div className="mt-3 space-y-2 px-4">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("m.notifications.filter.group")}
          aria-describedby="noti-filter-hint"
        >
          <span id="noti-filter-hint" className="sr-only">
            {t("m.notifications.filter.hint")}
          </span>
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                aria-pressed={active}
                className="rounded-full border px-3 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vba-gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--vba-bg)]"
                style={{
                  borderColor: active ? "var(--vba-gold)" : "var(--vba-border)",
                  color: active ? "var(--vba-gold)" : "var(--vba-text-muted)",
                  background: active ? "var(--vba-gold-soft)" : "transparent",
                }}
              >
                {t(tab.label)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span id="noti-sort-label" className="text-[11px] text-[var(--vba-text-dim)]">
            {t("m.notifications.sort.label")}:
          </span>
          <div
            className="inline-flex rounded-full border border-[var(--vba-border)] p-0.5"
            role="group"
            aria-labelledby="noti-sort-label"
          >
            <button
              type="button"
              onClick={() => setSort("priority")}
              aria-pressed={sort === "priority"}
              className="rounded-full px-3 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vba-gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--vba-bg)]"
              style={{
                background: sort === "priority" ? "var(--vba-gold-soft)" : "transparent",
                color: sort === "priority" ? "var(--vba-gold)" : "var(--vba-text-muted)",
              }}
            >
              {t("m.notifications.sort.priorityFirst")}
            </button>
            <button
              type="button"
              onClick={() => setSort("newest")}
              aria-pressed={sort === "newest"}
              className="rounded-full px-3 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vba-gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--vba-bg)]"
              style={{
                background: sort === "newest" ? "var(--vba-gold-soft)" : "transparent",
                color: sort === "newest" ? "var(--vba-gold)" : "var(--vba-text-muted)",
              }}
            >
              {t("m.notifications.sort.timeFirst")}
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vba-text-dim)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder={t("m.notifications.search.placeholder")}
            aria-label={t("m.notifications.search.placeholder")}
            aria-describedby="noti-search-hint"
            className="w-full rounded-xl border border-[var(--vba-border)] bg-transparent py-2 pl-9 pr-8 text-[13px] text-[var(--vba-text)] placeholder:text-[var(--vba-text-dim)] focus:border-[var(--vba-gold)] focus:outline-none"
          />
          <span id="noti-search-hint" className="sr-only">
            {t("m.notifications.search.clearHint")}
          </span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--vba-text-dim)] hover:text-[var(--vba-text)]"
              aria-label={t("action.close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <p data-testid="noti-announcement" role="status" aria-live="polite" className="sr-only">
        {loading
          ? t("m.notifications.loading")
          : visible.some((n) => n.unread)
            ? t("m.notifications.announce.summary", {
                count: visible.length,
                unread: visible.filter((n) => n.unread).length,
              })
            : t("m.notifications.announce.allRead")}
      </p>

      <div className="mt-3 space-y-2.5 px-4" role="list" aria-live="polite" aria-busy={loading}>
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.notifications.loading")}
          </p>
        )}
        {!loading && visible.length === 0 && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.notifications.empty")}
          </p>
        )}
        {visible.map((n: any) => {
          const Icon = iconFor(n.type);
          const isLead = n.type === "lead" && !!n.refId;
          return (
            <div
              key={n.id}
              role="listitem"
              className="vba-card flex gap-3 p-3.5"
              style={n.unread ? { borderColor: "var(--vba-border)" } : undefined}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--vba-gold-soft)] text-[var(--vba-gold)]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                    {n.title}
                  </span>
                  {n.priority !== "low" && (
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        color: priorityColor(n.priority),
                        background: "var(--vba-gold-soft)",
                      }}
                      aria-label={`${t("m.notifications.status.priority")}: ${t(PRIORITY_KEY[n.priority])}`}
                    >
                      {t(PRIORITY_KEY[n.priority])}
                    </span>
                  )}
                  {n.unread && (
                    <span
                      role="status"
                      aria-label={t("m.notifications.status.unread")}
                      className="h-2 w-2 shrink-0 rounded-full bg-[var(--vba-danger)]"
                    />
                  )}
                  {isLead && (
                    <button
                      type="button"
                      disabled={openingLeadId === n.id}
                      onClick={async () => {
                        setOpeningLeadId(n.id);
                        // Mark read FIRST and with retry so it is guaranteed to
                        // persist even if navigation is slow or interrupted.
                        let marked = false;
                        for (let attempt = 0; attempt < 3 && !marked; attempt++) {
                          try {
                            await markRead({ data: { id: n.id } });
                            marked = true;
                          } catch {
                            if (attempt < 2) {
                              await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
                            }
                          }
                        }
                        try {
                          await navigate({
                            to: "/m/business-cards",
                            search: { tab: "leads", leadId: n.refId as string },
                          });
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : t("m.notifications.lead.openError"),
                          );
                        } finally {
                          setOpeningLeadId(null);
                          if (!marked) reload();
                        }
                      }}
                      aria-label={t("m.notifications.lead.openDetail")}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50"
                    >
                      {openingLeadId === n.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-[var(--vba-text-muted)]">
                  {n.body}
                </p>
                {n.refType === "renewal_audit" && n.refId && (
                  <button
                    type="button"
                    onClick={() => {
                      void markRead({ data: { id: n.id } }).catch(() => {});
                      void navigate({ to: "/m/renew/audit", search: { ref: n.refId as string } });
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2 py-1 text-[10px] font-medium text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("m.notifications.renewal.openAudit")}
                  </button>
                )}
                <span className="mt-1 block text-[10px] text-[var(--vba-text-dim)]">
                  {fmt.rel(n.time)}
                </span>

                <div className="mt-2 flex items-center gap-2">
                  {n.dismissed ? (
                    <button
                      type="button"
                      disabled={rowBusy === n.id}
                      onClick={() => onUndoDismiss(n)}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2 py-1 text-[10px] font-medium text-[var(--vba-text-muted)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50"
                    >
                      {rowBusy === n.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      {t("m.notifications.undo.action")}
                    </button>
                  ) : (
                    <>
                      {n.unread && n.personal && (
                        <button
                          type="button"
                          disabled={rowBusy === n.id}
                          onClick={() => onMarkOneRead(n)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2 py-1 text-[10px] font-medium text-[var(--vba-text-muted)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50"
                        >
                          {rowBusy === n.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          {t("m.notifications.markOne")}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={rowBusy === n.id}
                        onClick={(e) => {
                          dismissTriggerRef.current = e.currentTarget;
                          setConfirmDismiss(n);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--vba-border)] px-2 py-1 text-[10px] font-medium text-[var(--vba-text-muted)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50"
                      >
                        <EyeOff className="h-3 w-3" />
                        {t("m.notifications.dismiss")}
                      </button>
                    </>
                  )}
                </div>
                {isLead && !n.dismissed && (
                  <LeadActions
                    leadId={n.refId as string}
                    current={n.leadStatus ?? null}
                    onDone={reload}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!confirmDismiss}
        onOpenChange={(open) => !open && setConfirmDismiss(null)}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            restoreDialogFocus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("m.notifications.dismissConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("m.notifications.dismissConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDismiss(null)}>
              {t("m.notifications.dismissConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDismiss) onDismiss(confirmDismiss);
                setConfirmDismiss(null);
              }}
            >
              {t("m.notifications.dismissConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDismissAll}
        onOpenChange={(open) => !open && setConfirmDismissAll(false)}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            restoreDialogFocus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("m.notifications.dismissAllConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("m.notifications.dismissAllConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDismissAll(false)}>
              {t("m.notifications.dismissAllConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeDismissAll}>
              {t("m.notifications.dismissAllConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
