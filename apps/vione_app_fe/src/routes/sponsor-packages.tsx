import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useServerData } from "@/hooks/use-server-data";
import { SponsorPackageModal, type PackageDraft } from "@/components/dashboard/SponsorPackageModal";
import {
  createSponsorPackageFn,
  deleteSponsorPackageFn,
  listSponsorPackagesFn,
  updateSponsorPackageFn,
  type SponsorPackage,
} from "@/lib/sponsors.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/sponsor-packages")({
  component: PackagesPage,
});

const TIER_KEY: Record<SponsorPackage["tier"], TKey> = {
  platinum: "sponsors.tier.platinum",
  gold: "sponsors.tier.gold",
  silver: "sponsors.tier.silver",
  bronze: "sponsors.tier.bronze",
};
const TIER_GRADIENT: Record<SponsorPackage["tier"], string> = {
  platinum: "linear-gradient(135deg, oklch(0.55 0.05 280), oklch(0.72 0.08 280))",
  gold: "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.85 0.13 85))",
  silver: "linear-gradient(135deg, oklch(0.65 0.02 250), oklch(0.82 0.02 250))",
  bronze: "linear-gradient(135deg, oklch(0.55 0.12 50), oklch(0.72 0.10 50))",
};

function PackagesPage() {
  const t = useT();
  const fmt = useFmt();
  const { data: packages, reload } = useServerData<SponsorPackage[]>(
    () => listSponsorPackagesFn(),
    [],
  );

  const createFn = useServerFn(createSponsorPackageFn);
  const updateFn = useServerFn(updateSponsorPackageFn);
  const deleteFn = useServerFn(deleteSponsorPackageFn);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorPackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onSubmit = async (draft: PackageDraft) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...draft } });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: draft });
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      reload();
    } catch (err: any) {
      console.error("[SponsorPackages] Save error:", err);
      toast.error(err?.message || t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (p: SponsorPackage) => {
    if (!window.confirm(t("pkg.confirmDelete"))) return;
    setDeletingId(p.id);
    try {
      await deleteFn({ data: { id: p.id } });
      toast.success(t("common.deletedToast"));
      reload();
    } catch (err: any) {
      console.error("[SponsorPackages] Delete error:", err);
      toast.error(err?.message || t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t("pkg.title")}
        subtitle={t("pkg.subtitle")}
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            {t("pkg.create")}
          </button>
        }
      />

      {packages.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("pkg.empty")}</p>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            {t("pkg.create")}
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => {
            const remain = p.available - p.sold;
            const soldPct =
              p.available > 0 ? Math.min(100, Math.round((p.sold / p.available) * 100)) : 0;
            return (
              <Card key={p.id} className="overflow-hidden">
                <div
                  className="relative p-6 text-primary-foreground"
                  style={{ background: TIER_GRADIENT[p.tier] }}
                >
                  <div className="absolute right-3 top-3 flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      aria-label={t("pkg.edit")}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-card/15 text-primary-foreground backdrop-blur hover:bg-card/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      disabled={deletingId === p.id}
                      aria-label={t("pkg.delete")}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-card/15 text-primary-foreground backdrop-blur hover:bg-card/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <Package className="mb-2 h-6 w-6" aria-hidden="true" />
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                    {t("pkg.tierPrefix", { tier: t(TIER_KEY[p.tier]) })}
                  </div>
                  <div className="mt-2 text-2xl font-bold">{fmt.money(p.price)}</div>
                </div>
                <div className="p-5">
                  <ul className="mb-4 space-y-2">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-foreground">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("pkg.sold")}</span>
                    <span className="font-semibold text-foreground">
                      {p.sold}/{p.available} · {t("pkg.remaining", { n: remain })}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${soldPct}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SponsorPackageModal
        open={open}
        initial={editing}
        submitting={submitting}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />
    </AppShell>
  );
}
