import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useT } from "@/lib/i18n";
import { ICON_OPTIONS, OPPORTUNITY_TYPES, type OpportunityTypeKey } from "@/lib/opportunities-data";
import { getOpportunityFn, updateOpportunityFn } from "@/lib/opportunities.functions";
import { CURRENT_USER_ID } from "@/lib/networking-data";
import { toast } from "sonner";

export const Route = createFileRoute("/opportunities/$id/edit")({
  ssr: false,
  loader: async ({ params }) => {
    const res = await getOpportunityFn({ data: { id: params.id } });
    if (!res) throw notFound();
    return res;
  },
  component: EditOpportunityPage,
});

function EditOpportunityPage() {
  const t = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const { opportunity: opp } = Route.useLoaderData();
  const saveOpp = useServerFn(updateOpportunityFn);

  const [title, setTitle] = useState(opp.title);
  const [desc, setDesc] = useState(opp.description);
  const [type, setType] = useState<OpportunityTypeKey>(opp.type);
  const [budgetMin, setBudgetMin] = useState(opp.budgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(opp.budgetMax?.toString() ?? "");
  const [region, setRegion] = useState(opp.region);
  const [industry, setIndustry] = useState(opp.industry);
  const [deadline, setDeadline] = useState(opp.deadline.slice(0, 10));
  const [emoji, setEmoji] = useState(opp.emoji);
  const [status, setStatus] = useState<"open" | "closed">(opp.status);

  const isOwner = opp.posterId === CURRENT_USER_ID;
  if (!isOwner) {
    return (
      <AppShell>
        <Card className="p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{t("opp.edit.notOwner")}</p>
          <Link
            to="/opportunities/$id"
            params={{ id: opp.id }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("opp.detail.back")}
          </Link>
        </Card>
      </AppShell>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !region.trim() || !industry.trim()) return;
    await saveOpp({
      data: {
        id: opp.id,
        title: title.trim(),
        description: desc.trim(),
        type,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        region: region.trim(),
        industry: industry.trim(),
        deadline: new Date(deadline).toISOString(),
        emoji,
        status,
      },
    });
    await router.invalidate();
    toast.success(t("opp.toast.updated"));
    navigate({ to: "/opportunities/$id", params: { id: opp.id } });
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/opportunities/$id"
          params={{ id: opp.id }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("opp.detail.back")}
        </Link>
      </div>

      <PageHeader title={t("opp.edit.title")} subtitle={opp.title} />

      <Card className="mx-auto max-w-2xl">
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> {t("opp.edit.subtitle")}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.titleField")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.desc")}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              required
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t("opp.form.industry")}</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
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
            <label className="mb-1.5 block text-xs font-semibold">{t("opp.edit.status")}</label>
            <div className="flex gap-2">
              {(["open", "closed"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    status === s
                      ? s === "open"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-foreground/40 bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                    style={{ background: s === "open" ? "rgb(34 197 94)" : "rgb(148 163 184)" }}
                  />
                  {t(`opp.status.${s}` as "opp.status.open" | "opp.status.closed")}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t("opp.edit.statusHint")}</p>
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
            <Link
              to="/opportunities/$id"
              params={{ id: opp.id }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("opp.form.cancel")}
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Save className="h-4 w-4" /> {t("opp.edit.save")}
            </button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
