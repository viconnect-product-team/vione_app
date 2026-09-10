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

      <div className="mt-3 space-y-3 px-4">
        {/* Segmented Filter Control */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--vba-border)] overflow-x-auto no-scrollbar"
          role="group"
          aria-label={t("m.notifications.filter.group")}
        >
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            const count =
              tab.key === "unread"
                ? notifications.filter((n) => n.unread && !n.dismissed).length
                : tab.key === "all"
                  ? notifications.filter((n) => !n.dismissed).length
                  : null;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-[var(--vba-gold)] text-[#0B0C10] shadow-sm font-bold"
                    : "text-[var(--vba-text-muted)] hover:text-[var(--vba-text)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span>{t(tab.label)}</span>
                {count != null && count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums ${
                      active
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[var(--vba-gold-soft)] text-[var(--vba-gold)] border border-[var(--vba-border)]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
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
              className="w-full rounded-2xl border border-[var(--vba-border)] bg-[var(--vba-surface,#fff)] py-2 pl-9 pr-8 text-[13px] text-[var(--vba-text)] placeholder:text-[var(--vba-text-dim)] shadow-xs focus:border-[var(--vba-gold)] focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--vba-text-dim)] hover:text-[var(--vba-text)] cursor-pointer"
                aria-label={t("action.close")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSort(sort === "priority" ? "newest" : "priority")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[var(--vba-border)] bg-[var(--vba-surface,#fff)] text-xs font-semibold text-[var(--vba-text-muted)] hover:text-[var(--vba-gold)] shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>{sort === "priority" ? "⚡ Ưu tiên" : "🕒 Mới nhất"}</span>
          </button>
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

      <div className="mt-3.5 space-y-3 px-4" role="list" aria-live="polite" aria-busy={loading}>
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.notifications.loading")}
          </p>
        )}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-[var(--vba-border)] bg-[var(--vba-surface,#fff)] px-6 py-12 text-center shadow-xs">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--vba-gold-soft)] text-[var(--vba-gold)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-[14.5px] font-bold text-[var(--vba-text)]">
              {t("m.notifications.empty")}
            </p>
            <p className="text-[12.5px] text-[var(--vba-text-muted)] max-w-[28ch]">
              Không có thông báo nào trong danh mục này.
            </p>
          </div>
        )}
        {visible.map((n: any) => {
          const Icon = iconFor(n.type);
          const isLead = n.type === "lead" && !!n.refId;
          return (
            <div
              key={n.id}
              role="listitem"
              className={`relative flex gap-3.5 p-4 rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                n.unread
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-500/40"
                  : "bg-[var(--vba-surface,#fff)] border-[var(--vba-border)] hover:border-[var(--vba-gold)]/40"
              }`}
            >
              {/* Vertical Gold Highlight on Unread */}
              {n.unread && (
                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[var(--vba-gold)]" />
              )}

              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--vba-gold-soft)] to-transparent text-[var(--vba-gold)] border border-[var(--vba-border)] shadow-xs">
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-bold text-[var(--vba-text)]">
                    {n.title}
                  </span>
                  {n.priority !== "low" && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                      style={{
                        color: priorityColor(n.priority),
                        background: "var(--vba-gold-soft)",
                      }}
                      aria-label={`${t("m.notifications.status.priority")}: ${t(PRIORITY_KEY[n.priority as NotificationPriority])}`}
                    >
                      {t(PRIORITY_KEY[n.priority as NotificationPriority])}
                    </span>
                  )}
                  {n.unread && (
                    <span
                      role="status"
                      aria-label={t("m.notifications.status.unread")}
                      className="h-2 w-2 shrink-0 rounded-full bg-[var(--vba-gold)] shadow-[0_0_8px_var(--vba-gold)]"
                    />
                  )}
                  {isLead && (
                    <button
                      type="button"
                      disabled={openingLeadId === n.id}
                      onClick={async () => {
                        setOpeningLeadId(n.id);
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
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50 cursor-pointer"
                    >
                      {openingLeadId === n.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--vba-text-muted)]">
                  {n.body}
                </p>

                {n.refType === "renewal_audit" && n.refId && (
                  <button
                    type="button"
                    onClick={() => {
                      void markRead({ data: { id: n.id } }).catch(() => {});
                      void navigate({ to: "/m/renew/audit", search: { ref: n.refId as string } });
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-xl border border-[var(--vba-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)] cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("m.notifications.renewal.openAudit")}
                  </button>
                )}

                <span className="mt-1.5 block text-[10.5px] font-medium text-[var(--vba-text-dim)]">
                  {fmt.rel(n.time)}
                </span>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[var(--vba-border)]/60">
                  {n.dismissed ? (
                    <button
                      type="button"
                      disabled={rowBusy === n.id}
                      onClick={() => onUndoDismiss(n)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--vba-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--vba-text-muted)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50 cursor-pointer"
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
                          className="inline-flex items-center gap-1 rounded-xl border border-[var(--vba-border)] bg-[var(--vba-surface,#fff)] px-2.5 py-1 text-[11px] font-semibold text-[var(--vba-gold)] transition hover:bg-[var(--vba-gold-soft)] disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
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
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--vba-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--vba-text-muted)] transition hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 cursor-pointer"
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
