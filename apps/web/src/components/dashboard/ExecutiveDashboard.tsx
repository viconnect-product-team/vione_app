import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserCheck,
  UserPlus,
  RefreshCw,
  FileWarning,
  CalendarClock,
  Handshake,
  Bell,
  ArrowUpRight,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  CalendarPlus,
  Send,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { getDashboardStatsFn, type DashboardStats } from "@/lib/dashboard.functions";
import { listEventsFn, type EventItem } from "@/lib/events.functions";
import { listOpportunitiesFn } from "@/lib/opportunities.functions";
import { listActivityLogFn } from "@/lib/activity.functions";
import type { Opportunity } from "@/lib/opportunities-data";
import type { ActivityLog } from "@/lib/extra-data";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from "@/components/dashboard/StateKit";

/* ----------------------------- helpers ----------------------------- */

function fmtMoney(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  return n.toLocaleString("vi-VN");
}

function relTime(iso: string, t: ReturnType<typeof useT>) {
  const d = new Date(iso).getTime();
  if (!d) return "";
  const diff = Date.now() - d;
  const m = Math.round(diff / 60000);
  if (m < 1) return t("m.rel.justNow");
  if (m < 60) return t("m.rel.minAgo").replace("{n}", String(m));
  const h = Math.round(m / 60);
  if (h < 24) return t("m.rel.hourAgo").replace("{n}", String(h));
  const day = Math.round(h / 24);
  return t("m.rel.dayAgo").replace("{n}", String(day));
}

type Tone = "navy" | "gold" | "green" | "amber" | "rose" | "blue";

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  navy: { bg: "oklch(0.93 0.04 260)", fg: "oklch(0.42 0.14 262)" },
  gold: { bg: "oklch(0.94 0.07 85)", fg: "oklch(0.55 0.13 75)" },
  green: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.50 0.15 155)" },
  amber: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.56 0.15 65)" },
  rose: { bg: "oklch(0.93 0.06 15)", fg: "oklch(0.56 0.19 15)" },
  blue: { bg: "oklch(0.93 0.05 240)", fg: "oklch(0.50 0.17 240)" },
};

/* ----------------------------- KPI card ----------------------------- */

function ExecKpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone: Tone;
  to?: string;
}) {
  const s = toneStyles[tone];
  const inner = (
    <div className="vba-pop-in group h-full rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-1.5 text-[28px] font-bold leading-none tracking-tight text-foreground">
            {value}
          </div>
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-[var(--motion-base)] group-hover:scale-105"
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {hint && (
        <div className="mt-3 flex items-center gap-1 text-[11.5px] text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ----------------------------- panel shell ----------------------------- */

function Panel({
  title,
  sub,
  action,
  children,
  className = "",
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`vba-pop-in rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewAll({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-primary transition-colors hover:opacity-80"
    >
      {label} <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}

/* ----------------------------- growth chart ----------------------------- */

function GrowthArea({ data }: { data: DashboardStats["growth"] }) {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="exec-growth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "var(--shadow-elevated)",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            fill="url(#exec-growth)"
            dot={{ r: 3, fill: "var(--color-chart-1)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ----------------------------- main ----------------------------- */

export function ExecutiveDashboard({ authReady }: { authReady: boolean }) {
  const t = useT();
  const getStats = useServerFn(getDashboardStatsFn);
  const getEvents = useServerFn(listEventsFn);
  const getOpps = useServerFn(listOpportunitiesFn);
  const getActivity = useServerFn(listActivityLogFn);
  const unread = useUnreadNotifications();

  const statsQ = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getStats(),
    enabled: authReady,
  });
  const eventsQ = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: () => getEvents({}),
    enabled: authReady,
  });
  const oppsQ = useQuery({
    queryKey: ["dashboard-opps"],
    queryFn: () => getOpps({}),
    enabled: authReady,
  });
  const activityQ = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => getActivity({}),
    enabled: authReady,
  });

  const s = statsQ.data;

  const upcoming = useMemo<EventItem[]>(() => {
    const list = eventsQ.data ?? [];
    return list
      .filter((e) => e.status === "upcoming" || e.status === "ongoing")
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 4);
  }, [eventsQ.data]);

  const topOpps = useMemo<{ opp: Opportunity; interests: number }[]>(() => {
    const d = oppsQ.data;
    if (!d) return [];
    return d.opportunities
      .filter((o) => o.status === "open")
      .map((opp) => ({ opp, interests: d.interestCounts[opp.id] ?? 0 }))
      .sort((a, b) => b.interests - a.interests || b.opp.views - a.opp.views)
      .slice(0, 4);
  }, [oppsQ.data]);

  const recent = useMemo<ActivityLog[]>(() => (activityQ.data ?? []).slice(0, 6), [activityQ.data]);

  /* ---- loading / error for the KPI + chart core (stats) ---- */
  if (!authReady || statsQ.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-[300px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }
  if (statsQ.error || !s) {
    return (
      <ErrorState onRetry={() => statsQ.refetch()} description={(statsQ.error as Error)?.message} />
    );
  }

  const feeTotal = s.paidInvoices + s.unpaidInvoices;
  const feeRate = feeTotal > 0 ? Math.round((s.paidInvoices / feeTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight text-foreground">
            {t("dash.greeting")} <span aria-hidden>👋</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("dash.subtitle")}</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ExecKpi
          label={t("exec.kpi.totalMembers")}
          value={s.totalMembers.toLocaleString("vi-VN")}
          icon={Users}
          tone="navy"
          to="/members"
          hint={`${s.companies} DN · ${s.individuals} CN`}
        />
        <ExecKpi
          label={t("exec.kpi.activeMembers")}
          value={s.activeMembers.toLocaleString("vi-VN")}
          icon={UserCheck}
          tone="green"
          to="/members"
        />
        <ExecKpi
          label={t("exec.kpi.newThisMonth")}
          value={s.newMembers30d.toLocaleString("vi-VN")}
          icon={UserPlus}
          tone="blue"
          to="/members"
          hint={
            <span className="inline-flex items-center gap-0.5 font-semibold text-success">
              <ArrowUpRight className="h-3.5 w-3.5" />
              30d
            </span>
          }
        />
        <ExecKpi
          label={t("exec.kpi.pendingRenewals")}
          value={s.pendingRenewals.toLocaleString("vi-VN")}
          icon={RefreshCw}
          tone="amber"
          to="/renewal"
        />
        <ExecKpi
          label={t("exec.kpi.overdueFees")}
          value={s.unpaidInvoices.toLocaleString("vi-VN")}
          icon={FileWarning}
          tone="rose"
          to="/fees"
        />
        <ExecKpi
          label={t("exec.kpi.upcomingEvents")}
          value={s.upcomingEvents.toLocaleString("vi-VN")}
          icon={CalendarClock}
          tone="navy"
          to="/events"
        />
        <ExecKpi
          label={t("exec.kpi.openOpportunities")}
          value={s.openOpportunities.toLocaleString("vi-VN")}
          icon={Handshake}
          tone="gold"
          to="/opportunities"
        />
        <ExecKpi
          label={t("exec.kpi.unreadNotifs")}
          value={unread.toLocaleString("vi-VN")}
          icon={Bell}
          tone="rose"
          to="/notifications"
        />
      </div>

      {/* Growth + Fee collection */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title={t("exec.growth.title")} sub={t("exec.growth.sub")} className="lg:col-span-2">
          <GrowthArea data={s.growth} />
        </Panel>

        <Panel title={t("exec.fees.title")}>
          <div className="text-[30px] font-bold leading-none tracking-tight text-foreground">
            {fmtMoney(s.revenue)}
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">{t("exec.fees.collected")}</p>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="font-medium text-foreground">{t("exec.fees.rate")}</span>
              <span className="font-semibold text-foreground">{feeRate}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${feeRate}%`, background: "var(--gradient-primary)" }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[11px] text-muted-foreground">{t("exec.fees.paid")}</div>
              <div className="mt-0.5 text-[18px] font-bold text-success">{s.paidInvoices}</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[11px] text-muted-foreground">{t("exec.fees.unpaid")}</div>
              <div className="mt-0.5 text-[18px] font-bold text-destructive">
                {s.unpaidInvoices}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Events + Activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title={t("exec.events.title")}
          action={<ViewAll to="/events" label={t("exec.viewAll")} />}
        >
          {eventsQ.isLoading ? (
            <ListSkeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-2.5">
              {upcoming.map((e) => {
                const d = new Date(e.date);
                return (
                  <li key={e.id}>
                    <Link
                      to="/events"
                      className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-center">
                        <span className="text-[16px] font-bold leading-none text-foreground">
                          {d.getDate()}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Th{d.getMonth() + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-semibold text-foreground">
                          {e.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {e.location && (
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{e.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[13px] font-bold text-primary">{e.registered}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {t("exec.events.registered")}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("exec.activity.title")}
          action={<ViewAll to="/activity" label={t("exec.viewAll")} />}
        >
          {activityQ.isLoading ? (
            <ListSkeleton rows={4} />
          ) : recent.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3.5">
              {recent.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                    {(a.user || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-foreground">
                      <span className="font-semibold">{a.user}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{relTime(a.at, t)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Opportunities + Action queue */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title={t("exec.opps.title")}
          action={<ViewAll to="/opportunities" label={t("exec.viewAll")} />}
          className="lg:col-span-2"
        >
          {oppsQ.isLoading ? (
            <ListSkeleton rows={3} />
          ) : topOpps.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {topOpps.map(({ opp, interests }) => (
                <li key={opp.id}>
                  <Link
                    to="/opportunities/$id"
                    params={{ id: opp.id }}
                    className="flex h-full items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span className="text-[22px] leading-none">{opp.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[13px] font-semibold text-foreground">
                        {opp.title}
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Handshake className="h-3.5 w-3.5" />
                          {interests} {t("exec.opps.interests")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {opp.views}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("exec.queue.title")}>
          <ul className="space-y-2">
            <QueueRow
              to="/renewal"
              icon={RefreshCw}
              tone="amber"
              label={t("exec.queue.renewals")}
              count={s.pendingRenewals}
            />
            <QueueRow
              to="/fees"
              icon={FileWarning}
              tone="rose"
              label={t("exec.queue.unpaid")}
              count={s.unpaidInvoices}
            />
            <QueueRow
              to="/marketplace/my-quotes"
              icon={DollarSign}
              tone="blue"
              label={t("exec.queue.quotes")}
              count={s.pendingQuotes}
            />
            <QueueRow
              to="/opportunities"
              icon={Handshake}
              tone="gold"
              label={t("exec.queue.opps")}
              count={s.openOpportunities}
            />
          </ul>
        </Panel>
      </div>

      {/* Quick actions */}
      <Panel title={t("exec.quick.title")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction to="/members" icon={Plus} label={t("exec.quick.addMember")} />
          <QuickAction to="/events" icon={CalendarPlus} label={t("exec.quick.newEvent")} />
          <QuickAction to="/fees" icon={DollarSign} label={t("exec.quick.collectFee")} />
          <QuickAction to="/notifications" icon={Send} label={t("exec.quick.sendNotif")} />
        </div>
      </Panel>
    </div>
  );
}

function QueueRow({
  to,
  icon: Icon,
  tone,
  label,
  count,
}: {
  to: string;
  icon: LucideIcon;
  tone: Tone;
  label: string;
  count: number;
}) {
  const st = toneStyles[tone];
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5 transition-colors hover:bg-muted/40"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: st.bg, color: st.fg }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
          {label}
        </span>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-bold text-foreground">
          {count}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-[var(--motion-base)] group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[12.5px] font-medium text-foreground">{label}</span>
    </Link>
  );
}

// satisfy TKey usage type import
export type { TKey };
