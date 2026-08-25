import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  Plus,
  Download,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  CalendarDays,
  ArrowRight,
  LayoutGrid,
  List as ListIcon,
  CheckCircle2,
  Clock,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { useT, type TKey } from "@/lib/i18n";
import { useRole } from "@/hooks/use-role";
import { downloadCsv } from "@/lib/csv";
import { useTableControls, type TableControls } from "@/hooks/use-table-controls";
import { useUrlState } from "@/hooks/use-url-state";
import { Pagination, SortHeader } from "@/components/dashboard/DataTablePagination";
import {
  type IndustryKey,
  type Member,
  type MemberLevelKey,
  type MemberStatus,
  type RegionKey,
} from "@/lib/members-data";
import { createMemberFn, listMembersFn } from "@/lib/members.functions";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Doanh nghiệp — ViOne" },
      { name: "description", content: "Danh bạ doanh nghiệp hội viên và đối tác của hiệp hội." },
      { property: "og:title", content: "Doanh nghiệp — ViOne" },
      { property: "og:description", content: "Quản lý hồ sơ doanh nghiệp hội viên." },
    ],
  }),
  component: CompaniesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

const INDUSTRIES: IndustryKey[] = [
  "ind.trade",
  "ind.it",
  "ind.manufacturing",
  "ind.realestate",
  "ind.finance",
];
const REGIONS: RegionKey[] = ["region.north", "region.central", "region.south"];
const LEVELS: MemberLevelKey[] = ["memberLevel.large", "memberLevel.medium", "memberLevel.small"];

const statusStyle: Record<MemberStatus, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-success", text: "text-success", bg: "bg-success/10" },
  pending: {
    dot: "bg-warning",
    text: "text-[oklch(0.45_0.16_65)]",
    bg: "bg-warning/15",
  },
  expired: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
};

const levelBadge: Record<MemberLevelKey, string> = {
  "memberLevel.large": "bg-primary/10 text-primary border-primary/30",
  "memberLevel.medium": "bg-info/10 text-info border-info/30",
  "memberLevel.small": "bg-muted text-muted-foreground border-border",
  "memberLevel.individual": "bg-secondary text-secondary-foreground border-border",
};

function initials(name: string) {
  const words = name
    .replace(/Công ty|TNHH|CP|TMCP|Cửa hàng|Tập đoàn|Ngân hàng/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "");
}

function CompaniesPage() {
  const t = useT();
  const listFn = useServerFn(listMembersFn);
  const [MEMBERS, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    let active = true;
    listFn().then((data) => {
      if (active) setMembers(data as Member[]);
    });
    return () => {
      active = false;
    };
  }, [listFn]);
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const [q, setQ] = useUrlState<string>("q", "");
  const [industry, setIndustry] = useState<"" | IndustryKey>("");
  const [region, setRegion] = useState<"" | RegionKey>("");
  const [level, setLevel] = useState<"" | MemberLevelKey>("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const createFn = useServerFn(createMemberFn);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fields: CrudField[] = [
    { name: "name", label: t("members.f.name"), type: "text", required: true },
    { name: "contact", label: t("members.f.contact"), type: "text" },
    { name: "email", label: t("members.f.email"), type: "text" },
    { name: "phone", label: t("members.f.phone"), type: "text" },
    {
      name: "level",
      label: t("members.f.level"),
      type: "select",
      options: [
        { value: "memberLevel.large", label: t("memberLevel.large") },
        { value: "memberLevel.medium", label: t("memberLevel.medium") },
        { value: "memberLevel.small", label: t("memberLevel.small") },
      ],
    },
    {
      name: "industry",
      label: t("members.f.industry"),
      type: "select",
      options: [
        { value: "ind.trade", label: t("ind.trade") },
        { value: "ind.it", label: t("ind.it") },
        { value: "ind.manufacturing", label: t("ind.manufacturing") },
        { value: "ind.realestate", label: t("ind.realestate") },
        { value: "ind.finance", label: t("ind.finance") },
      ],
    },
    {
      name: "region",
      label: t("members.f.region"),
      type: "select",
      options: [
        { value: "region.north", label: t("region.north") },
        { value: "region.central", label: t("region.central") },
        { value: "region.south", label: t("region.south") },
      ],
    },
    {
      name: "status",
      label: t("members.f.status"),
      type: "select",
      options: [
        { value: "pending", label: t("status.pending") },
        { value: "active", label: t("status.active") },
        { value: "expired", label: t("status.expired") },
      ],
    },
    { name: "address", label: t("members.f.address"), type: "text" },
    { name: "website", label: t("members.f.website"), type: "text" },
    { name: "taxCode", label: t("members.f.taxCode"), type: "text" },
    { name: "employees", label: t("members.f.employees"), type: "number" },
    { name: "about", label: t("members.f.about"), type: "textarea" },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      await createFn({ data: { ...(v as object), type: "company" } as never });
      setMembers((await listFn()) as Member[]);
      toast.success(t("companies.created"));
      setOpen(false);
      await router.invalidate({ sync: true });
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Only companies on this page
  const base = useMemo(() => MEMBERS.filter((m) => m.type === "company"), [MEMBERS]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return base.filter((m) => {
      if (industry && m.industry !== industry) return false;
      if (region && m.region !== region) return false;
      if (level && m.level !== level) return false;
      if (
        ql &&
        ![m.name, m.code, m.email, m.taxCode ?? "", m.website ?? ""].some((f) =>
          f.toLowerCase().includes(ql),
        )
      )
        return false;
      return true;
    });
  }, [base, q, industry, region, level]);

  const tc = useTableControls<Member>(
    filtered,
    {
      name: (m) => m.name,
      industry: (m) => t(m.industry),
      region: (m) => t(m.region),
      employees: (m) => m.employees ?? 0,
      status: (m) => m.status,
    },
    { initialSortKey: "name", initialPageSize: 12 },
  );

  const totalEmployees = base.reduce((sum, m) => sum + (m.employees ?? 0), 0);
  const activeCount = base.filter((m) => m.status === "active").length;
  const pendingCount = base.filter((m) => m.status === "pending").length;

  const handleExport = () => {
    downloadCsv("companies", filtered, [
      { header: "Code", value: (m) => m.code },
      { header: "Name", value: (m) => m.name },
      { header: "Email", value: (m) => m.email },
      { header: "Phone", value: (m) => m.phone },
      { header: "TaxCode", value: (m) => m.taxCode ?? "" },
      { header: "Website", value: (m) => m.website ?? "" },
      { header: "Industry", value: (m) => m.industry },
      { header: "Region", value: (m) => m.region },
      { header: "Level", value: (m) => m.level },
      { header: "Employees", value: (m) => m.employees ?? "" },
      { header: "Status", value: (m) => m.status },
    ]);
  };

  function reset() {
    setQ("");
    setIndustry("");
    setRegion("");
    setLevel("");
  }

  const kpis: Array<{
    label: TKey;
    value: string;
    Icon: typeof Building2;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      label: "companies.kpi.total",
      value: base.length.toString(),
      Icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "companies.kpi.active",
      value: activeCount.toString(),
      Icon: CheckCircle2,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "companies.kpi.pending",
      value: pendingCount.toString(),
      Icon: Clock,
      iconBg: "bg-warning/15",
      iconColor: "text-[oklch(0.55_0.16_65)]",
    },
    {
      label: "companies.kpi.employees",
      value: totalEmployees.toLocaleString("vi-VN"),
      Icon: Users,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div
          className="overflow-hidden rounded-2xl p-5 text-primary-foreground shadow-[var(--shadow-elevated)]"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                <Briefcase className="h-3.5 w-3.5" />
                {t("nav.companies")}
              </div>
              <h1 className="mt-1 text-2xl font-bold lg:text-3xl">{t("companies.title")}</h1>
              <p className="mt-1 text-sm text-primary-foreground/85">{t("companies.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex h-10 items-center gap-2 rounded-xl border border-border/20 bg-card/10 px-4 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-card/20"
              >
                <Download className="h-4 w-4" /> {t("members.export")}
              </button>
              <button
                onClick={() =>
                  isAdmin
                    ? setOpen(true)
                    : toast.error(t("perm.denied.title"), {
                        description: t("perm.denied.adminOnly"),
                      })
                }
                aria-disabled={!isAdmin}
                title={!isAdmin && !roleLoading ? t("perm.denied.title") : undefined}
                className={`flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-semibold text-primary shadow transition hover:bg-card/90 ${
                  !isAdmin ? "opacity-60" : ""
                }`}
              >
                <Plus className="h-4 w-4" /> {t("companies.add")}
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.iconBg}`}
                >
                  <k.Icon className={`h-5 w-5 ${k.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-muted-foreground">{t(k.label)}</div>
                  <div className="text-xl font-bold text-foreground">{k.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("companies.search")}
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <FilterSelect
              value={industry}
              onChange={(v) => setIndustry(v as IndustryKey | "")}
              placeholder={t("members.filter.industry")}
              options={INDUSTRIES.map((k) => ({ value: k, label: t(k) }))}
            />
            <FilterSelect
              value={region}
              onChange={(v) => setRegion(v as RegionKey | "")}
              placeholder={t("members.filter.region")}
              options={REGIONS.map((k) => ({ value: k, label: t(k) }))}
            />
            <FilterSelect
              value={level}
              onChange={(v) => setLevel(v as MemberLevelKey | "")}
              placeholder={t("members.filter.type")}
              options={LEVELS.map((k) => ({ value: k, label: t(k) }))}
            />
            <button
              onClick={reset}
              className="h-10 whitespace-nowrap rounded-xl border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {t("members.filter.reset")}
            </button>
          </div>
        </div>

        {/* Toolbar: count + view toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {t("companies.count")}
          </p>
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
            {[
              { k: "grid" as const, Icon: LayoutGrid, label: t("companies.view.grid") },
              { k: "list" as const, Icon: ListIcon, label: t("companies.view.list") },
            ].map((v) => {
              const active = view === v.k;
              return (
                <button
                  key={v.k}
                  onClick={() => setView(v.k)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { background: "var(--gradient-primary)" } : undefined}
                >
                  <v.Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        {tc.total === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {t("companies.empty")}
          </div>
        ) : view === "grid" ? (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tc.pageRows.map((m) => (
                <CompanyCard key={m.id} m={m} />
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              <Pagination
                page={tc.page}
                pageCount={tc.pageCount}
                pageSize={tc.pageSize}
                total={tc.total}
                from={tc.from}
                to={tc.to}
                onPage={tc.setPage}
                onPageSize={tc.setPageSize}
                pageSizeOptions={[12, 24, 48, 96]}
              />
            </div>
          </div>
        ) : (
          <CompanyTable rows={tc.pageRows} tc={tc} />
        )}
      </div>

      <CrudModal
        open={open}
        title={t("companies.add")}
        fields={fields}
        submitting={submitting}
        submitLabel={t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => setOpen(false)}
      />
    </AppShell>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 min-w-[150px] rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CompanyCard({ m }: { m: Member }) {
  const t = useT();
  const s = statusStyle[m.status];
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      {/* Header band */}
      <div className="h-16" style={{ background: "var(--gradient-card)" }} />
      <div className="-mt-8 px-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card text-base font-bold text-primary-foreground shadow"
          style={{ background: "var(--gradient-primary)" }}
        >
          {initials(m.name).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-bold text-foreground">{m.name}</h3>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {t(`status.${m.status}` as TKey)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${levelBadge[m.level]}`}
          >
            {t(m.level)}
          </span>
          <span className="text-[11px] text-muted-foreground">{m.code}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{m.about}</p>

        <div className="mt-4 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs">
          <Row Icon={Briefcase} text={t(m.industry)} />
          <Row Icon={MapPin} text={`${m.address} · ${t(m.region)}`} />
          {m.website && <Row Icon={Globe} text={m.website.replace(/^https?:\/\//, "")} />}
          <Row Icon={Mail} text={m.email} />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {(m.employees ?? 0).toLocaleString("vi-VN")} {t("companies.employees")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t("companies.joined")}: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <Link
          to="/companies/$companyId"
          params={{ companyId: m.id }}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          {t("companies.viewProfile")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Row({ Icon, text }: { Icon: typeof Briefcase; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-foreground">{text}</span>
    </div>
  );
}

function CompanyTable({ rows, tc }: { rows: Member[]; tc: TableControls<Member> }) {
  const t = useT();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <SortHeader
                label={t("tbl.name")}
                columnKey="name"
                sortKey={tc.sortKey}
                sortDir={tc.sortDir}
                onSort={tc.toggleSort}
              />
              <SortHeader
                label={t("tbl.industry")}
                columnKey="industry"
                sortKey={tc.sortKey}
                sortDir={tc.sortDir}
                onSort={tc.toggleSort}
              />
              <SortHeader
                label={t("tbl.region")}
                columnKey="region"
                sortKey={tc.sortKey}
                sortDir={tc.sortDir}
                onSort={tc.toggleSort}
              />
              <SortHeader
                label={t("companies.kpi.employees")}
                columnKey="employees"
                sortKey={tc.sortKey}
                sortDir={tc.sortDir}
                onSort={tc.toggleSort}
              />
              <SortHeader
                label={t("tbl.status")}
                columnKey="status"
                sortKey={tc.sortKey}
                sortDir={tc.sortDir}
                onSort={tc.toggleSort}
              />
              <th className="px-4 py-3 text-right font-semibold">{t("tbl.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const s = statusStyle[m.status];
              return (
                <tr key={m.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {initials(m.name).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{m.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {m.code} · {m.taxCode ?? "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{t(m.industry)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t(m.region)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {(m.employees ?? 0).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {t(`status.${m.status}` as TKey)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: m.id }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      {t("tbl.view")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={tc.page}
        pageCount={tc.pageCount}
        pageSize={tc.pageSize}
        total={tc.total}
        from={tc.from}
        to={tc.to}
        onPage={tc.setPage}
        onPageSize={tc.setPageSize}
        pageSizeOptions={[12, 24, 48, 96]}
      />
    </div>
  );
}
