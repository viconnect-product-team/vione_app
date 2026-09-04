import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Download, Search, Ticket, XCircle } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import {
  listEventsWithRegistrationsFn,
  type EventItem,
  type Registration,
} from "@/lib/events.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/event-registrations")({
  ssr: false,
  loader: () => listEventsWithRegistrationsFn(),
  component: RegPage,
});

const STATUS_KEY: Record<Registration["status"], TKey> = {
  confirmed: "reg.status.confirmed",
  waitlist: "reg.status.waitlist",
  cancelled: "reg.status.cancelled",
};
const STATUS_COLOR: Record<Registration["status"], "success" | "warning" | "danger"> = {
  confirmed: "success",
  waitlist: "warning",
  cancelled: "danger",
};
const TICKET_KEY: Record<Registration["ticketType"], TKey> = {
  standard: "reg.ticket.standard",
  vip: "reg.ticket.vip",
  speaker: "reg.ticket.speaker",
};

function RegPage() {
  const t = useT();
  const fmt = useFmt();
  const { events: EVENTS, registrations: REGISTRATIONS } = Route.useLoaderData() as {
    events: EventItem[];
    registrations: Registration[];
  };
  const [q, setQ] = useState("");
  const [eventId, setEventId] = useState("all");
  const [status, setStatus] = useState<Registration["status"] | "all">("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return REGISTRATIONS.filter((r) => (eventId === "all" ? true : r.eventId === eventId))
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter(
        (r) =>
          !ql ||
          r.memberName.toLowerCase().includes(ql) ||
          r.memberCode.toLowerCase().includes(ql) ||
          r.email.toLowerCase().includes(ql),
      );
  }, [q, eventId, status, REGISTRATIONS]);

  const tc = useTableControls<Registration>(
    filtered,
    {
      code: (r) => r.id,
      member: (r) => r.memberName,
      ticket: (r) => r.ticketType,
      regDate: (r) => r.registeredAt,
      status: (r) => r.status,
    },
    { initialSortKey: "regDate", initialSortDir: "desc", initialPageSize: 20 },
  );

  const confirmed = REGISTRATIONS.filter((r) => r.status === "confirmed").length;
  const waitlist = REGISTRATIONS.filter((r) => r.status === "waitlist").length;
  const cancelled = REGISTRATIONS.filter((r) => r.status === "cancelled").length;

  return (
    <AppShell>
      <PageHeader
        title={t("reg.title")}
        subtitle={t("reg.subtitle")}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted">
            <Download className="h-4 w-4 text-muted-foreground" />
            {t("common.exportExcel")}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("reg.kpi.total")}
          value={REGISTRATIONS.length}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          label={t("reg.kpi.confirmed")}
          value={confirmed}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label={t("reg.kpi.waitlist")}
          value={waitlist}
          tone="warning"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label={t("reg.kpi.cancelled")}
          value={cancelled}
          tone="danger"
          icon={<XCircle className="h-4 w-4" />}
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("reg.searchPh")}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">{t("reg.allEvents")}</option>
          {EVENTS.map((e: any) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Registration["status"] | "all")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">{t("common.allStatuses")}</option>
          <option value="confirmed">{t("reg.status.confirmed")}</option>
          <option value="waitlist">{t("reg.status.waitlist")}</option>
          <option value="cancelled">{t("reg.status.cancelled")}</option>
        </select>
      </div>

      <TableShell
        columns={[
          { label: t("reg.col.code"), key: "code" },
          { label: t("reg.col.member"), key: "member" },
          t("reg.col.event"),
          { label: t("reg.col.ticket"), key: "ticket" },
          { label: t("reg.col.regDate"), key: "regDate" },
          { label: t("reg.col.status"), key: "status" },
        ]}
        sort={{ sortKey: tc.sortKey, sortDir: tc.sortDir, onSort: tc.toggleSort }}
        footer={
          <Pagination
            page={tc.page}
            pageCount={tc.pageCount}
            pageSize={tc.pageSize}
            total={tc.total}
            from={tc.from}
            to={tc.to}
            onPage={tc.setPage}
            onPageSize={tc.setPageSize}
          />
        }
      >
        {tc.pageRows.map((r: any) => {
          const ev = EVENTS.find((e: any) => e.id === r.eventId);
          return (
            <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-primary">{r.id}</td>
              <td className="px-4 py-3">
                <div className="font-semibold text-foreground">{r.memberName}</div>
                <div className="text-[11px] text-muted-foreground">{r.email}</div>
              </td>
              <td className="px-4 py-3 text-foreground">{ev?.name ?? r.eventId}</td>
              <td className="px-4 py-3">
                <Pill
                  color={
                    r.ticketType === "vip"
                      ? "primary"
                      : r.ticketType === "speaker"
                        ? "info"
                        : "neutral"
                  }
                >
                  {t(TICKET_KEY[r.ticketType as Registration["ticketType"]])}
                </Pill>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{fmt.date(r.registeredAt)}</td>
              <td className="px-4 py-3">
                <Pill color={STATUS_COLOR[r.status as Registration["status"]]}>{t(STATUS_KEY[r.status as Registration["status"]])}</Pill>
              </td>
            </tr>
          );
        })}
        {tc.total === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t("reg.empty")}
            </td>
          </tr>
        )}
      </TableShell>
    </AppShell>
  );
}
