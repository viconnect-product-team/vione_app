import { createFileRoute } from "@tanstack/react-router";
import { Award, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { useServerData } from "@/hooks/use-server-data";
import { useRole } from "@/hooks/use-role";
import {
  createBenefitFn,
  deleteBenefitFn,
  listBenefitsAdminFn,
  updateBenefitFn,
  type AdminBenefit,
} from "@/lib/benefits.functions";
import { useT } from "@/lib/i18n";
import { getActiveAssociationId } from "@/lib/member-app.functions";

export const Route = createFileRoute("/benefits")({
  component: BenefitsAdminPage,
});

function BenefitsAdminPage() {
  const t = useT();
  const { isAdmin, loading: roleLoading } = useRole();
  const fetchBenefits = useServerFn(listBenefitsAdminFn);
  const fetchAssocId = useServerFn(getActiveAssociationId);
  const { data: activeAssocId } = useServerData<string | null>(() => fetchAssocId(), null);
  const notifyBenefitsUpdated = () =>
    window.dispatchEvent(
      new CustomEvent("benefits-updated", { detail: { associationId: activeAssocId } }),
    );
  const {
    data: benefits,
    loading,
    reload,
  } = useServerData<AdminBenefit[]>(
    () => (isAdmin ? fetchBenefits() : Promise.resolve([] as AdminBenefit[])),
    [],
  );

  const createFn = useServerFn(createBenefitFn);
  const updateFn = useServerFn(updateBenefitFn);
  const deleteFn = useServerFn(deleteBenefitFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBenefit | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fields: CrudField[] = [
    { name: "titleVi", label: t("benefits.col.titleVi"), type: "text", required: true },
    { name: "titleEn", label: t("benefits.col.titleEn"), type: "text" },
    { name: "descVi", label: t("benefits.col.descVi"), type: "text" },
    { name: "descEn", label: t("benefits.col.descEn"), type: "text" },
    { name: "sortOrder", label: t("benefits.col.sortOrder"), type: "number" },
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
      reload();
      notifyBenefitsUpdated();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (b: AdminBenefit) => {
    if (!window.confirm(t("common.confirmDelete", { name: b.titleVi }))) return;
    setDeletingId(b.id);
    try {
      await deleteFn({ data: { id: b.id } });
      toast.success(t("common.deletedToast"));
      reload();
      notifyBenefitsUpdated();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!roleLoading && !isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Award className="mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t("benefits.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("common.forbidden")}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={t("benefits.title")}
        subtitle={t("benefits.subtitle")}
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
            {t("benefits.create")}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t("benefits.kpi.total")}
          value={benefits.length}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
      ) : benefits.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("benefits.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b.id} className="p-5 transition hover:shadow-[var(--shadow-glow)]">
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Award className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  #{b.sortOrder}
                </span>
              </div>
              <h3 className="mb-0.5 text-base font-semibold text-foreground">{b.titleVi}</h3>
              <p className="text-xs text-muted-foreground">{b.descVi}</p>
              {(b.titleEn || b.descEn) && (
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {b.titleEn}
                  {b.descEn ? ` — ${b.descEn}` : ""}
                </p>
              )}
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <button
                  onClick={() => {
                    setEditing(b);
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => onDelete(b)}
                  disabled={deletingId === b.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete")}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CrudModal
        open={open}
        title={editing ? t("benefits.edit") : t("benefits.create")}
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
