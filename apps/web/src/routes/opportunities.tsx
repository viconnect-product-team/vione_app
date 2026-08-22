import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { REVIEW_SEARCH_RESET } from "@/lib/review-search";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Eye,
  Lightbulb,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, StatCard, Card, Pill } from "@/components/dashboard/PageKit";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import {
  OPPORTUNITY_TYPES,
  ICON_OPTIONS,
  getPoster,
  type Opportunity,
  type OpportunityInterest,
  type OpportunityStatus,
  type OpportunityTypeKey,
} from "@/lib/opportunities-data";
import {
  listOpportunitiesFn,
  createOpportunityFn,
  deleteOpportunityFn,
  expressInterestFn,
  toggleOpportunityStatusFn,
} from "@/lib/opportunities.functions";
import { CURRENT_USER_ID } from "@/lib/networking-data";
import { useTableControls } from "@/hooks/use-table-controls";
import { useUrlState } from "@/hooks/use-url-state";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { toast } from "sonner";

export const Route = createFileRoute("/opportunities")({
  ssr: false,
  loader: () => listOpportunitiesFn(),
  component: OpportunitiesPage,
});

const STATUS_COLOR: Record<OpportunityStatus, "success" | "neutral"> = {
  open: "success",
  closed: "neutral",
};
const STATUS_KEY: Record<OpportunityStatus, TKey> = {
  open: "opp.status.open",
  closed: "opp.status.closed",
};

function OpportunityCard({
  opp,
  interestCount,
  onInterest,
  onDelete,
  onToggle,
}: {
  opp: Opportunity;
  interestCount: number;
  onInterest: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const t = useT();
  const fmt = useFmt();
  const poster = getPoster(opp.posterId);
  const isOwner = opp.posterId === CURRENT_USER_ID;

  const budget =
    opp.budgetMin && opp.budgetMax
      ? `${fmt.money(opp.budgetMin)} – ${fmt.money(opp.budgetMax)}`
      : opp.budgetMin
        ? `${t("opp.fromLabel")} ${fmt.money(opp.budgetMin)}`
        : t("opp.budgetOpen");

  return (
    <Card className="flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link
        to="/opportunities/$id"
        params={{ id: opp.id }}
        className="flex h-28 items-center justify-center text-5xl"
        style={{ background: "var(--gradient-primary)" }}
        aria-label={opp.title}
      >
        <span className="drop-shadow-md">{opp.emoji}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Pill color="primary">{t(opp.type)}</Pill>
          <Pill color={STATUS_COLOR[opp.status]}>{t(STATUS_KEY[opp.status])}</Pill>
        </div>
        <Link
          to="/opportunities/$id"
          params={{ id: opp.id }}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground hover:text-primary hover:underline"
        >
          {opp.title}
        </Link>
        <p className="line-clamp-2 text-xs text-muted-foreground">{opp.description}</p>

        <div className="grid grid-cols-1 gap-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>
              {opp.region} · {opp.industry}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3" />
            <span>
              {t("opp.deadline")}: {fmt.date(opp.deadline)}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-secondary/50 p-2 text-[11px]">
          <div className="text-muted-foreground">{t("opp.budget")}</div>
          <div className="font-semibold text-foreground">{budget}</div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <Link
            to="/members/$memberId"
            params={{ memberId: opp.posterId }}
            search={REVIEW_SEARCH_RESET}
            className="truncate font-medium text-primary hover:underline"
          >
            {poster?.name ?? "—"}
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {opp.views}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {interestCount}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwner ? (
            <>
              <button
                onClick={onToggle}
                className="flex-1 rounded-lg border border-border bg-background py-2 text-xs font-medium hover:bg-secondary"
              >
                {opp.status === "open" ? t("opp.action.close") : t("opp.action.reopen")}
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                aria-label={t("opp.action.delete")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onInterest}
              disabled={opp.status === "closed"}
              className="flex-1 rounded-lg py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {t("opp.action.interest")}
              </span>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function NewOpportunityModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const createOpp = useServerFn(createOpportunityFn);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<OpportunityTypeKey>("opp.type.partnership");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [region, setRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  );
  const [emoji, setEmoji] = useState("💡");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !region.trim() || !industry.trim()) return;
    await createOpp({
      data: {
        title,
        description: desc,
        type,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        region,
        industry,
        deadline: new Date(deadline).toISOString(),
        emoji,
      },
    });
    await router.invalidate();
    toast.success(t("opp.toast.created"));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("opp.form.title")}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.titleField")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={t("opp.form.titlePh")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.desc")}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              required
              placeholder={t("opp.form.descPh")}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.type")}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityTypeKey)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {OPPORTUNITY_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.deadline")}</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.region")}</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                placeholder="VD: TP. Hồ Chí Minh"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.industry")}</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                placeholder="VD: Sản xuất"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">
                {t("opp.form.budgetMin")}
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">
                {t("opp.form.budgetMax")}
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.icon")}</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setEmoji(i)}
                  className={`h-9 w-9 rounded-lg border text-lg transition ${
                    emoji === i
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("opp.form.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {t("opp.form.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InterestModal({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const express = useServerFn(expressInterestFn);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !contact.trim()) return;
    await express({ data: { opportunityId: opp.id, message, contact } });
    await router.invalidate();
    toast.success(t("opp.toast.interest"));
    onClose();
    // Open chat with poster
    navigate({ to: "/network", search: { peer: opp.posterId } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Send className="h-5 w-5 text-primary" />
            {t("opp.interest.title")}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="rounded-lg bg-secondary/50 p-3 text-xs">
            <div className="text-muted-foreground">{t("opp.interest.about")}</div>
            <div className="font-semibold text-foreground">{opp.title}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">
              {t("opp.interest.contact")}
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              placeholder="email@congty.vn / 0901..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">
              {t("opp.interest.message")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder={t("opp.interest.messagePh")}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("opp.form.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {t("opp.interest.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type Tab = "browse" | "mine" | "interests";

function OpportunitiesPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const {
    opportunities: all,
    interests,
    interestCounts,
  } = Route.useLoaderData() as {
    opportunities: Opportunity[];
    interests: OpportunityInterest[];
    interestCounts: Record<string, number>;
  };
  const deleteOpp = useServerFn(deleteOpportunityFn);
  const toggleOpp = useServerFn(toggleOpportunityStatusFn);
  const [tab, setTab] = useState<Tab>("browse");
  const [q, setQ] = useUrlState<string>("q", "");
  const [typeFilter, setTypeFilter] = useState<OpportunityTypeKey | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [interestOpp, setInterestOpp] = useState<Opportunity | null>(null);

  const countFor = (id: string) => interestCounts[id] ?? 0;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let base = all;
    if (tab === "mine") base = base.filter((o) => o.posterId === CURRENT_USER_ID);
    if (typeFilter !== "all") base = base.filter((o) => o.type === typeFilter);
    if (ql) {
      base = base.filter(
        (o) =>
          o.title.toLowerCase().includes(ql) ||
          o.description.toLowerCase().includes(ql) ||
          o.industry.toLowerCase().includes(ql) ||
          o.region.toLowerCase().includes(ql),
      );
    }
    return base;
  }, [all, q, tab, typeFilter]);

  const tc = useTableControls<Opportunity>(
    filtered,
    {
      title: (o) => o.title,
      type: (o) => o.type,
      region: (o) => o.region,
      deadline: (o) => o.deadline,
      createdAt: (o) => o.createdAt,
    },
    { initialSortKey: "createdAt", initialSortDir: "desc", initialPageSize: 9 },
  );

  const myOpps = useMemo(() => all.filter((o) => o.posterId === CURRENT_USER_ID), [all]);
  const myInterests = useMemo(
    () =>
      myOpps
        .map((o) => ({
          opp: o,
          items: interests.filter((it) => it.opportunityId === o.id),
        }))
        .filter((x) => x.items.length > 0),
    [myOpps, interests],
  );

  const totalOpen = all.filter((o) => o.status === "open").length;
  const totalInterestsOnMine = myOpps.reduce((s, o) => s + countFor(o.id), 0);

  return (
    <AppShell>
      <PageHeader
        title={t("opp.title")}
        subtitle={t("opp.subtitle")}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            {t("opp.action.new")}
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("opp.kpi.total")}
          value={all.length}
          icon={<Lightbulb className="h-4 w-4" />}
        />
        <StatCard
          label={t("opp.kpi.open")}
          value={totalOpen}
          tone="success"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label={t("opp.kpi.mine")}
          value={myOpps.length}
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label={t("opp.kpi.interests")}
          value={totalInterestsOnMine}
          tone="warning"
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["browse", "mine", "interests"] as Tab[]).map((tk) => (
          <button
            key={tk}
            onClick={() => setTab(tk)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === tk
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "border border-border bg-card hover:bg-secondary"
            }`}
          >
            {t(`opp.tab.${tk}` as TKey)}
          </button>
        ))}
      </div>

      {tab !== "interests" && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("opp.search")}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OpportunityTypeKey | "all")}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="all">{t("opp.filter.all")}</option>
              {OPPORTUNITY_TYPES.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {tab === "interests" ? (
        <div className="space-y-4">
          {myInterests.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              {t("opp.empty.interests")}
            </Card>
          ) : (
            myInterests.map(({ opp, items }) => (
              <Card key={opp.id} className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <Pill color="primary">{t(opp.type)}</Pill>
                    <h4 className="mt-2 text-base font-semibold">{opp.title}</h4>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {items.length} {t("opp.interest.count")}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((it) => {
                    const m = getPoster(it.memberId);
                    return (
                      <div
                        key={it.id}
                        className="rounded-lg border border-border bg-secondary/30 p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <Link
                            to="/members/$memberId"
                            params={{ memberId: it.memberId }}
                            search={REVIEW_SEARCH_RESET}
                            className="font-semibold text-primary hover:underline"
                          >
                            {m?.name ?? it.memberId}
                          </Link>
                          <span className="text-[11px] text-muted-foreground">
                            {fmt.date(it.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{it.contact}</div>
                        <p className="mt-1.5 text-sm text-foreground">{it.message}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : tc.total === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          {tab === "mine" ? t("opp.empty.mine") : t("opp.empty.browse")}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tc.pageRows.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                interestCount={countFor(opp.id)}
                onInterest={() => setInterestOpp(opp)}
                onDelete={async () => {
                  if (confirm(t("opp.confirmDelete"))) {
                    await deleteOpp({ data: { id: opp.id } });
                    await router.invalidate();
                  }
                }}
                onToggle={async () => {
                  await toggleOpp({ data: { id: opp.id } });
                  await router.invalidate();
                }}
              />
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
              pageSizeOptions={[9, 18, 36, 72]}
            />
          </div>
        </>
      )}

      {showCreate && <NewOpportunityModal onClose={() => setShowCreate(false)} />}
      {interestOpp && <InterestModal opp={interestOpp} onClose={() => setInterestOpp(null)} />}
    </AppShell>
  );
}
