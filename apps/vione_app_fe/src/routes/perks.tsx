import { createFileRoute } from "@tanstack/react-router";
import { Gift, Pencil, Plus, Trash2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { useServerData } from "@/hooks/use-server-data";
import { useRole } from "@/hooks/use-role";
import {
  createPerkFn,
  deletePerkFn,
  listPerksAdminFn,
  updatePerkFn,
  type AdminPerk,
} from "@/lib/perks.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/perks")({
  component: PerksAdminPage,
});

const ICON_OPTIONS = ["Gift", "Briefcase", "Scale", "Calculator", "Hotel"];

function PerksAdminPage() {
  const t = useT();
  const { isAdmin, loading: roleLoading } = useRole();
  const fetchPerks = useServerFn(listPerksAdminFn);
  const {
    data: perks,
    loading,
    reload,
  } = useServerData<AdminPerk[]>(
    () => (isAdmin ? fetchPerks() : Promise.resolve([] as AdminPerk[])),
    [],
  );

  const createFn = useServerFn(createPerkFn);
  const updateFn = useServerFn(updatePerkFn);
  const deleteFn = useServerFn(deletePerkFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPerk | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const active = perks.filter((p) => p.status === "active");

  useEffect(() => {
    if (isAdmin) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fields: CrudField[] = [
    { name: "title", label: t("perks.col.title"), type: "text", required: true },
    { name: "category", label: t("perks.col.category"), type: "text" },
    { name: "partner", label: t("perks.col.partner"), type: "text" },
    { name: "discount", label: t("perks.col.discount"), type: "text", placeholder: "-20%" },
    { name: "summary", label: t("perks.col.summary"), type: "textarea" },
    { name: "description", label: t("perks.col.description"), type: "textarea" },
    { name: "link", label: t("perks.col.link"), type: "text", placeholder: "https://" },
    {
      name: "validUntil",
      label: t("perks.col.validUntil"),
      type: "text",
      placeholder: "2026-12-31",
    },
    {
      name: "icon",
      label: t("perks.col.icon"),
      type: "select",
      options: ICON_OPTIONS.map((i) => ({ value: i, label: i })),
    },
    { name: "sortOrder", label: t("perks.col.sortOrder"), type: "number" },
    {
      name: "status",
      label: t("perks.col.status"),
      type: "select",
      options: [
        { value: "active", label: t("perks.status.active") },
        { value: "inactive", label: t("perks.status.inactive") },
      ],
    },
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
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (p: AdminPerk) => {
    if (!window.confirm(t("common.confirmDelete", { name: p.title }))) return;
    setDeletingId(p.id);
    try {
      await deleteFn({ data: { id: p.id } });
      toast.success(t("common.deletedToast"));
      reload();
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
          <Gift className="mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t("perks.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("common.forbidden")}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={t("perks.title")}
        subtitle={t("perks.subtitle")}
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
            {t("perks.create")}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t("perks.kpi.total")}
          value={perks.length}
          icon={<Gift className="h-4 w-4" />}
        />
        <StatCard
          label={t("perks.kpi.active")}
          value={active.length}
          tone="success"
          icon={<Gift className="h-4 w-4" />}
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
      ) : perks.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("perks.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {perks.map((p) => (
            <Card key={p.id} className="p-5 transition hover:shadow-[var(--shadow-glow)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {p.category || "—"}
                </span>
                <Pill color={p.status === "active" ? "success" : "neutral"}>
                  {p.status === "active" ? t("perks.status.active") : t("perks.status.inactive")}
                </Pill>
              </div>
              <h3 className="mb-1 line-clamp-2 text-base font-semibold text-foreground">
                {p.title}
              </h3>
              {p.discount && (
                <span className="text-xs font-semibold text-primary">{p.discount}</span>
              )}
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.summary}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{p.partner || "—"}</span>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> Link
                  </a>
                )}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <button
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => onDelete(p)}
                  disabled={deletingId === p.id}
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
        title={editing ? t("perks.edit") : t("perks.create")}
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
