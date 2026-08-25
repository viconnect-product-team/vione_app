import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, MapPin, Pencil, Plus, Trash2, Users2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import {
  createMeetingFn,
  deleteMeetingFn,
  listMeetingsFn,
  updateMeetingFn,
  type Meeting,
} from "@/lib/meetings.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/meetings")({
  ssr: false,
  loader: () => listMeetingsFn(),
  component: MeetingsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

const TYPE_KEY: Record<Meeting["type"], TKey> = {
  board: "meet.type.board",
  committee: "meet.type.committee",
  general: "meet.type.general",
};
const STATUS_KEY: Record<Meeting["status"], TKey> = {
  upcoming: "meet.status.upcoming",
  completed: "meet.status.completed",
  cancelled: "meet.status.cancelled",
};
const STATUS_COLOR: Record<Meeting["status"], "info" | "success" | "danger"> = {
  upcoming: "info",
  completed: "success",
  cancelled: "danger",
};

function MeetingsPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const MEETINGS = Route.useLoaderData() as Meeting[];

  const createFn = useServerFn(createMeetingFn);
  const updateFn = useServerFn(updateMeetingFn);
  const deleteFn = useServerFn(deleteMeetingFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fields: CrudField[] = [
    { name: "title", label: t("notif.col.title"), type: "text", required: true },
    {
      name: "type",
      label: t("inc.col.type"),
      type: "select",
      options: [
        { value: "board", label: t("meet.type.board") },
        { value: "committee", label: t("meet.type.committee") },
        { value: "general", label: t("meet.type.general") },
      ],
    },
    {
      name: "date",
      label: t("inc.col.date"),
      type: "text",
      required: true,
      placeholder: "2026-01-31",
    },
    { name: "time", label: "Time", type: "text", placeholder: "09:00" },
    { name: "location", label: "Location", type: "text" },
    { name: "attendees", label: t("common.attendees"), type: "number" },
    {
      name: "status",
      label: t("inc.col.status"),
      type: "select",
      options: [
        { value: "upcoming", label: t("meet.status.upcoming") },
        { value: "completed", label: t("meet.status.completed") },
        { value: "cancelled", label: t("meet.status.cancelled") },
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
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (m: Meeting) => {
    if (!window.confirm(t("common.confirmDelete", { name: m.title }))) return;
    setDeletingId(m.id);
    try {
      await deleteFn({ data: { id: m.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t("meet.title")}
        subtitle={t("meet.subtitle")}
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
            {t("meet.create")}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("meet.kpi.total")}
          value={MEETINGS.length}
          icon={<Users2 className="h-4 w-4" />}
        />
        <StatCard
          label={t("meet.kpi.upcoming")}
          value={MEETINGS.filter((m) => m.status === "upcoming").length}
          tone="info"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label={t("meet.kpi.completed")}
          value={MEETINGS.filter((m) => m.status === "completed").length}
          tone="success"
          icon={<Users2 className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {MEETINGS.map((m) => (
          <Card key={m.id} className="p-5 transition hover:shadow-[var(--shadow-glow)]">
            <div className="mb-3 flex items-start justify-between gap-2">
              <Pill color={STATUS_COLOR[m.status]}>{t(STATUS_KEY[m.status])}</Pill>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(TYPE_KEY[m.type])}
              </span>
            </div>
            <h3 className="mb-3 text-base font-semibold text-foreground">{m.title}</h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {fmt.date(m.date)} · {m.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {m.location}
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="h-3.5 w-3.5" />
                {m.attendees} {t("common.attendees")}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
              <button
                onClick={() => {
                  setEditing(m);
                  setOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("common.edit")}
              </button>
              {m.status !== "cancelled" && (
                <button
                  onClick={() => onDelete(m)}
                  disabled={deletingId === m.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete")}
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("meet.create")}
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
