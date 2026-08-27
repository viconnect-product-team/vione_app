import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  Users,
  Calendar,
  Briefcase,
  Edit3,
  Building2,
  CheckCircle2,
  XCircle,
  Wallet,
  Activity,
  CalendarCheck2,
  Receipt,
  TrendingUp,
  PhoneCall,
  Mail as MailIcon,
  StickyNote,
  Users2,
  CreditCard,
  Download,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useT, type TKey } from "@/lib/i18n";
import { type Member, type MemberStatus } from "@/lib/members-data";
import { getMemberFn, updateMemberContactFn } from "@/lib/members.functions";
import {
  ACTIVITY_LABEL,
  EVENT_ROLE_LABEL,
  PAY_KIND_LABEL,
  PAY_METHOD_LABEL,
  PAY_STATUS_LABEL,
  formatVND,
  type ActivityType,
  type EventRole,
  type PayStatus,
} from "@/lib/companies-history";
import { getCompanyHistoryFn, type CompanyHistory } from "@/lib/companies.functions";

export const Route = createFileRoute("/companies/$companyId")({
  ssr: false,
  loader: async ({ params }) => {
    const company = await getMemberFn({ data: { id: params.companyId } });
    if (!company || company.type !== "company") throw notFound();
    const history = await getCompanyHistoryFn({
      data: { id: company.id, code: company.code, name: company.name },
    });
    return { company, history };
  },
  component: CompanyDetailPage,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error.message}
      </div>
    </AppShell>
  ),
});

function NotFound() {
  const t = useT();
  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <h2 className="mb-2 text-xl font-bold text-foreground">404</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t("cdetail.notFound")}</p>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("cdetail.back")}
        </Link>
      </div>
    </AppShell>
  );
}

const statusStyle: Record<MemberStatus, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-success", text: "text-success", bg: "bg-success/15" },
  pending: {
    dot: "bg-warning",
    text: "text-[oklch(0.45_0.16_65)]",
    bg: "bg-warning/20",
  },
  expired: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/15" },
};

const ACT_STYLE: Record<ActivityType, { Icon: typeof MailIcon; bg: string; text: string }> = {
  email: { Icon: MailIcon, bg: "bg-info/10", text: "text-info" },
  call: { Icon: PhoneCall, bg: "bg-primary/10", text: "text-primary" },
  meeting: { Icon: Users2, bg: "bg-warning/15", text: "text-[oklch(0.55_0.16_65)]" },
  event: { Icon: CalendarCheck2, bg: "bg-success/10", text: "text-success" },
  payment: { Icon: CreditCard, bg: "bg-primary/15", text: "text-primary" },
  note: { Icon: StickyNote, bg: "bg-muted", text: "text-muted-foreground" },
};

const ROLE_STYLE: Record<EventRole, string> = {
  attendee: "bg-muted text-muted-foreground border-border",
  sponsor: "bg-primary/10 text-primary border-primary/30",
  speaker: "bg-info/10 text-info border-info/30",
  partner: "bg-warning/15 text-[oklch(0.45_0.16_65)] border-warning/40",
};

const PAY_STATUS_STYLE: Record<PayStatus, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/15 text-[oklch(0.45_0.16_65)]",
  refunded: "bg-muted text-muted-foreground",
};

function initials(name: string) {
  const w = name
    .replace(/Công ty|TNHH|CP|TMCP|Cửa hàng|Tập đoàn|Ngân hàng/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return ((w[0]?.[0] ?? "") + (w[w.length - 1]?.[0] ?? "")).toUpperCase();
}

function fmtDate(iso: string, withTime = false) {
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString("vi-VN");
}

function relativeDate(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (diff < 1) return "Hôm nay";
  if (diff < 2) return "Hôm qua";
  if (diff < 7) return `${Math.floor(diff)} ngày trước`;
  if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
  return `${Math.floor(diff / 30)} tháng trước`;
}

function CompanyDetailPage() {
  const t = useT();
  const saveContact = useServerFn(updateMemberContactFn);
  const { company: loaded, history } = Route.useLoaderData() as {
    company: Member;
    history: CompanyHistory;
  };

  const [contact, setContact] = useState({
    email: loaded.email,
    phone: loaded.phone,
    address: loaded.address,
  });
  const company: Member = { ...loaded, ...contact };

  const [tab, setTab] = useState<"overview" | "activity" | "events" | "payments">("overview");

  const handleSaveContact = (next: typeof contact) => {
    setContact(next);
    void saveContact({ data: { id: loaded.id, ...next } });
  };

  const totalPaid = useMemo(
    () => history.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    [history.payments],
  );
  const tenure = Math.max(
    0,
    Math.floor((Date.now() - new Date(company.joinedAt).getTime()) / (365 * 86400000)),
  );
  const s = statusStyle[company.status];

  const tabs: { key: typeof tab; label: TKey; Icon: typeof Activity; count?: number }[] = [
    { key: "overview", label: "cdetail.tab.overview", Icon: Building2 },
    {
      key: "activity",
      label: "cdetail.tab.activity",
      Icon: Activity,
      count: history.activities.length,
    },
    {
      key: "events",
      label: "cdetail.tab.events",
      Icon: CalendarCheck2,
      count: history.events.length,
    },
    {
      key: "payments",
      label: "cdetail.tab.payments",
      Icon: Receipt,
      count: history.payments.length,
    },
  ];

  return (
    <AppShell>
      <Link
        to="/companies"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("cdetail.back")}
      </Link>

      {/* Hero */}
      <div
        className="relative mb-5 overflow-hidden rounded-2xl border border-border p-6 shadow-[var(--shadow-elevated)]"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-card/15 text-2xl font-bold text-primary-foreground backdrop-blur">
            {initials(company.name)}
          </div>
          <div className="min-w-0 flex-1 text-primary-foreground">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-card/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold backdrop-blur">
              {company.code}
            </div>
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{company.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-primary-foreground/85">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> {t(company.industry)}
              </span>
              <span className="opacity-50">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> {t(company.level)}
              </span>
              <span className="opacity-50">•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {t(company.region)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {t(`status.${company.status}` as TKey)}
            </span>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-card/15 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur hover:bg-card/25">
                <Mail className="h-3.5 w-3.5" /> {t("detail.sendEmail")}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-card/90">
                <Edit3 className="h-3.5 w-3.5" /> {t("detail.edit")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          Icon={CalendarCheck2}
          label={t("cdetail.kpi.events")}
          value={history.events.length.toString()}
          tone="primary"
        />
        <Kpi
          Icon={TrendingUp}
          label={t("cdetail.kpi.paid")}
          value={formatVND(totalPaid)}
          tone="success"
        />
        <Kpi
          Icon={Activity}
          label={t("cdetail.kpi.touchpoints")}
          value={history.activities.length.toString()}
          tone="info"
        />
        <Kpi
          Icon={Clock}
          label={t("cdetail.kpi.tenure")}
          value={`${tenure} ${t("cdetail.years")}`}
          tone="warning"
        />
      </div>

      {/* Tabs */}
      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex min-w-full items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-card)]">
          {tabs.map((tb) => {
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition lg:text-sm ${
                  active
                    ? "text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={active ? { background: "var(--gradient-primary)" } : undefined}
              >
                <tb.Icon className="h-4 w-4" />
                {t(tb.label)}
                {tb.count != null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-card/20" : "bg-muted"
                    }`}
                  >
                    {tb.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview" && <Overview company={company} onSaveContact={handleSaveContact} />}
      {tab === "activity" && <ActivityTab entries={history.activities} />}
      {tab === "events" && <EventsTab entries={history.events} />}
      {tab === "payments" && <PaymentsTab entries={history.payments} />}
    </AppShell>
  );
}

function Kpi({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: typeof Activity;
  label: string;
  value: string;
  tone: "primary" | "success" | "info" | "warning";
}) {
  const map = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    success: { bg: "bg-success/10", text: "text-success" },
    info: { bg: "bg-info/10", text: "text-info" },
    warning: { bg: "bg-warning/15", text: "text-[oklch(0.55_0.16_65)]" },
  } as const;
  const c = map[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
          <div className="truncate text-lg font-bold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Overview({
  company,
  onSaveContact,
}: {
  company: Member;
  onSaveContact: (next: { email: string; phone: string; address: string }) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Section title={t("detail.about")}>
          <p className="py-2 text-sm leading-relaxed text-foreground">{company.about}</p>
        </Section>
        <Section title={t("detail.companyInfo")}>
          <InfoRow icon={Briefcase} label={t("detail.industry")} value={t(company.industry)} />
          <InfoRow icon={ShieldCheck} label={t("detail.level")} value={t(company.level)} />
          {company.taxCode && (
            <InfoRow icon={Hash} label={t("detail.taxCode")} value={company.taxCode} />
          )}
          {company.website && (
            <InfoRow
              icon={Globe}
              label={t("detail.website")}
              value={
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {company.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}
          {company.employees != null && (
            <InfoRow
              icon={Users}
              label={t("detail.employees")}
              value={company.employees.toLocaleString("vi-VN")}
            />
          )}
          <InfoRow icon={Calendar} label={t("detail.joined")} value={fmtDate(company.joinedAt)} />
        </Section>
      </div>
      <div className="space-y-5">
        <ContactSection company={company} onSave={onSaveContact} />

        <Section title={t("detail.fee")}>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  company.feePaid
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {company.feePaid ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("detail.feeYear")} {company.feeYear}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {company.feePaid ? t("detail.feePaid") : t("detail.feeUnpaid")}
                </div>
              </div>
            </div>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-base font-semibold text-foreground">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 break-words text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

const contactSchema = z.object({
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(32),
  address: z.string().trim().min(3).max(255),
});

function ContactSection({
  company,
  onSave,
}: {
  company: Member;
  onSave: (next: { email: string; phone: string; address: string }) => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    email: company.email,
    phone: company.phone,
    address: company.address,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const start = () => {
    setForm({ email: company.email, phone: company.phone, address: company.address });
    setErrors({});
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setErrors({});
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    onSave(parsed.data);
    setEditing(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{t("detail.contactInfo")}</h3>
        {!editing && (
          <button
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {t("cdetail.editContact")}
          </button>
        )}
      </div>
      {!editing ? (
        <div className="divide-y divide-border">
          <InfoRow icon={Users} label={t("detail.contactPerson")} value={company.contact} />
          <InfoRow
            icon={Mail}
            label={t("detail.email")}
            value={
              <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                {company.email}
              </a>
            }
          />
          <InfoRow icon={Phone} label={t("detail.phone")} value={company.phone} />
          <InfoRow icon={MapPin} label={t("detail.address")} value={company.address} />
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field
            icon={Mail}
            label={t("detail.email")}
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            type="email"
            error={errors.email}
            maxLength={255}
            placeholder="company@example.com"
          />
          <Field
            icon={Phone}
            label={t("detail.phone")}
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            error={errors.phone}
            maxLength={32}
            placeholder="Ví dụ: +84 901 234 567"
          />
          <Field
            icon={MapPin}
            label={t("detail.address")}
            value={form.address}
            onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            error={errors.address}
            maxLength={255}
            multiline
            placeholder="Nhập địa chỉ đầy đủ của doanh nghiệp..."
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t("cdetail.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {t("cdetail.save")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  error,
  maxLength,
  multiline,
  placeholder,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={2}
          className={`w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-border"
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-border"
          }`}
        />
      )}
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}

function ActivityTab({ entries }: { entries: CompanyHistory["activities"] }) {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        {t("cdetail.activity.title")}
      </h3>
      <ol className="relative space-y-5 border-l-2 border-border pl-6">
        {entries.map((a) => {
          const st = ACT_STYLE[a.type];
          return (
            <li key={a.id} className="relative">
              <span
                className={`absolute -left-[34px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card ${st.bg} ${st.text}`}
              >
                <st.Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.bg} ${st.text}`}
                >
                  {t(ACTIVITY_LABEL[a.type])}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {fmtDate(a.date, true)} · {relativeDate(a.date)}
                </span>
              </div>
              <h4 className="mt-1 text-sm font-semibold text-foreground">{a.title}</h4>
              {a.detail && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
              )}
              <div className="mt-1 text-[11px] text-muted-foreground">— {a.by}</div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function EventsTab({ entries }: { entries: CompanyHistory["events"] }) {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b border-border p-5">
        <h3 className="text-base font-semibold text-foreground">{t("cdetail.events.title")}</h3>
      </div>
      <div className="divide-y divide-border">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="text-[10px] font-semibold uppercase">
                  {new Date(e.date).toLocaleDateString("vi-VN", { month: "short" })}
                </span>
                <span className="text-base font-bold leading-none">
                  {new Date(e.date).getDate()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{e.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {fmtDate(e.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {e.attendees.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLE[e.role]}`}
              >
                {t(EVENT_ROLE_LABEL[e.role])}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  e.checkedIn ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {e.checkedIn ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {t("cdetail.checkin")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentsTab({ entries }: { entries: CompanyHistory["payments"] }) {
  const t = useT();
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h3 className="text-base font-semibold text-foreground">{t("cdetail.payments.title")}</h3>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> {t("members.export")}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">{t("cdetail.invoice")}</th>
              <th className="px-4 py-3 font-semibold">{t("cdetail.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("detail.about")}</th>
              <th className="px-4 py-3 font-semibold">{t("cdetail.method")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("cdetail.amount")}</th>
              <th className="px-4 py-3 font-semibold">{t("cdetail.status")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((p) => (
              <tr key={p.id} className="border-t border-border transition hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                  {p.invoice}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {fmtDate(p.date)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.description}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t(PAY_KIND_LABEL[p.kind])}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-foreground">
                  {t(PAY_METHOD_LABEL[p.method])}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                  {formatVND(p.amount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAY_STATUS_STYLE[p.status]}`}
                  >
                    {t(PAY_STATUS_LABEL[p.status])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
