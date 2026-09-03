import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, QrCode, Ticket, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  QR_FIELDS,
  type EventItem,
  type QrField,
} from "@/lib/events.functions";
import { fetchNestApi } from "@/lib/api-client";
import { QrCanvas } from "@/components/member/QrCanvas";
import { useT } from "@/lib/i18n";

type EventType = EventItem["type"];
type EventStatus = EventItem["status"];

type TicketDraft = {
  name: string;
  price: string;
  quantity: string;
  description: string;
};

type Info = {
  name: string;
  date: string;
  location: string;
  capacity: string;
  type: EventType;
  status: EventStatus;
};

const emptyTicket = (): TicketDraft => ({ name: "", price: "", quantity: "", description: "" });

const TYPE_OPTS: EventType[] = ["forum", "workshop", "networking", "training"];
const STATUS_OPTS: EventStatus[] = ["upcoming", "ongoing", "completed", "cancelled"];

export function EventWizard({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (event: EventItem) => void;
}) {
  const t = useT();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<Info>({
    name: "",
    date: "",
    location: "",
    capacity: "",
    type: "forum",
    status: "upcoming",
  });
  const [tickets, setTickets] = useState<TicketDraft[]>([]);
  const [qrFields, setQrFields] = useState<QrField[]>(["registration_code"]);

  const reset = () => {
    setStep(0);
    setInfo({ name: "", date: "", location: "", capacity: "", type: "forum", status: "upcoming" });
    setTickets([]);
    setQrFields(["registration_code"]);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const qrSample = useMemo(() => {
    const parts: string[] = [];
    if (qrFields.includes("registration_code")) parts.push("REG-XXXXXX");
    if (qrFields.includes("verify_url")) parts.push(`${originSafe()}/verify?c=REG-XXXXXX`);
    if (qrFields.includes("ticket_code")) parts.push(tickets[0]?.name.trim() || "TK-STANDARD");
    return parts.join("|") || "REG-XXXXXX";
  }, [qrFields, tickets]);

  if (!open) return null;

  const validateInfo = () => {
    if (!info.name.trim()) {
      toast.error(t("ewz.err.name"));
      return false;
    }
    if (!info.date.trim()) {
      toast.error(t("ewz.err.date"));
      return false;
    }
    return true;
  };

  const validateTickets = () => {
    if (tickets.some((tk) => !tk.name.trim())) {
      toast.error(t("ewz.err.ticketName"));
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 0 && !validateInfo()) return;
    if (step === 1 && !validateTickets()) return;
    setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const back = () => setStep((s) => (s - 1) as 0 | 1 | 2);

  const toggleQr = (f: QrField) => {
    setQrFields((prev) => (prev.includes(f) ? prev.filter((x: any) => x !== f) : [...prev, f]));
  };

  const submit = async () => {
    if (!validateInfo() || !validateTickets()) return;
    if (qrFields.length === 0) {
      toast.error(t("ewz.err.qr"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchNestApi<{ event: EventItem }>("/events", {
        method: "POST",
        body: JSON.stringify({
          name: info.name.trim(),
          date: info.date,
          location: info.location.trim(),
          capacity: Number(info.capacity) || 0,
          type: info.type,
          status: info.status,
          qrFields,
          tickets: tickets.map((tk) => ({
            name: tk.name.trim(),
            price: Number(tk.price) || 0,
            quantity: Number(tk.quantity) || 0,
            description: tk.description.trim(),
          })),
        }),
      });
      toast.success(t("ewz.created"));
      reset();
      onCreated(res?.event || (res as unknown as EventItem));
    } catch (err: any) {
      console.error("[EventWizard] Create error:", err);
      toast.error(err?.message || t("ewz.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [t("ewz.step.info"), t("ewz.step.tickets"), t("ewz.step.qr")];
  const announcement = submitting
    ? t("ewz.announce.submitting")
    : t("ewz.announce.step", { n: step + 1, total: 3, label: steps[step] });

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("ewz.title")}
      aria-busy={submitting}
      onClick={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
    >
      <p className="sr-only" role="status" aria-live="polite" data-testid="ewz-announcement">
        {announcement}
      </p>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + stepper */}
        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{t("ewz.title")}</h2>
            <button
              type="button"
              onClick={close}
              aria-label={t("ewz.cancel")}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <ol
            className="flex items-center gap-2"
            aria-label={t("ewz.step.of", { n: step + 1, total: 3 })}
          >
            {steps.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary/15 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={`truncate text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 0 && <InfoStep info={info} setInfo={setInfo} />}
          {step === 1 && <TicketStep tickets={tickets} setTickets={setTickets} />}
          {step === 2 && <QrStep qrFields={qrFields} toggleQr={toggleQr} sample={qrSample} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={step === 0 ? close : back}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {step === 0 ? (
              t("ewz.cancel")
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {t("ewz.back")}
              </>
            )}
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              style={{ background: "var(--gradient-primary)" }}
            >
              {t("ewz.next")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {submitting ? t("ewz.creating") : t("ewz.create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function originSafe() {
  return typeof window !== "undefined" ? window.location.origin : "https://app";
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";
const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

function InfoStep({ info, setInfo }: { info: Info; setInfo: (v: Info) => void }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("ewz.info.heading")}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.info.hint")}</p>
      </div>
      <div>
        <label className={labelCls} htmlFor="ewz-name">
          {t("ewz.field.name")}
        </label>
        <input
          id="ewz-name"
          className={inputCls}
          value={info.name}
          onChange={(e) => setInfo({ ...info, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ewz-date">
            {t("ewz.field.date")}
          </label>
          <input
            id="ewz-date"
            type="date"
            className={inputCls}
            value={info.date}
            onChange={(e) => setInfo({ ...info, date: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ewz-capacity">
            {t("ewz.field.capacity")}
          </label>
          <input
            id="ewz-capacity"
            type="number"
            min={0}
            className={inputCls}
            value={info.capacity}
            onChange={(e) => setInfo({ ...info, capacity: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="ewz-location">
          {t("ewz.field.location")}
        </label>
        <input
          id="ewz-location"
          className={inputCls}
          value={info.location}
          onChange={(e) => setInfo({ ...info, location: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ewz-type">
            {t("ewz.field.type")}
          </label>
          <select
            id="ewz-type"
            className={inputCls}
            value={info.type}
            onChange={(e) => setInfo({ ...info, type: e.target.value as EventType })}
          >
            {TYPE_OPTS.map((o) => (
              <option key={o} value={o}>
                {t(`events.type.${o}` as never)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ewz-status">
            {t("ewz.field.status")}
          </label>
          <select
            id="ewz-status"
            className={inputCls}
            value={info.status}
            onChange={(e) => setInfo({ ...info, status: e.target.value as EventStatus })}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o} value={o}>
                {t(`events.status.${o}` as never)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function TicketStep({
  tickets,
  setTickets,
}: {
  tickets: TicketDraft[];
  setTickets: (v: TicketDraft[]) => void;
}) {
  const t = useT();
  const update = (i: number, patch: Partial<TicketDraft>) =>
    setTickets(tickets.map((tk, idx) => (idx === i ? { ...tk, ...patch } : tk)));
  const remove = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Ticket className="h-4 w-4 text-primary" aria-hidden="true" /> {t("ewz.tickets.heading")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.tickets.hint")}</p>
      </div>

      {tickets.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          {t("ewz.tickets.empty")}
        </p>
      )}

      <div className="space-y-3">
        {tickets.map((tk, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input
                className={`${inputCls} font-medium`}
                placeholder={t("ewz.tickets.namePh")}
                aria-label={t("ewz.tickets.name")}
                value={tk.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={t("ewz.tickets.remove")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>{t("ewz.tickets.price")}</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={tk.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{t("ewz.tickets.qty")}</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={tk.quantity}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-2">
              <label className={labelCls}>{t("ewz.tickets.desc")}</label>
              <input
                className={inputCls}
                value={tk.description}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTickets([...tickets, emptyTicket()])}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-background py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> {t("ewz.tickets.add")}
      </button>
    </div>
  );
}

function QrStep({
  qrFields,
  toggleQr,
  sample,
}: {
  qrFields: QrField[];
  toggleQr: (f: QrField) => void;
  sample: string;
}) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <QrCode className="h-4 w-4 text-primary" aria-hidden="true" /> {t("ewz.qr.heading")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.qr.hint")}</p>
      </div>

      <fieldset className="space-y-2">
        {QR_FIELDS.map((f) => {
          const checked = qrFields.includes(f);
          return (
            <label
              key={f}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                checked={checked}
                onChange={() => toggleQr(f)}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {t(`ewz.qr.${f}` as never)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`ewz.qr.${f}.desc` as never)}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">{t("ewz.qr.preview")}</p>
        <div className="flex items-center gap-4">
          <QrCanvas value={sample} size={120} />
          <div className="min-w-0">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("ewz.qr.previewHint")}
            </p>
            <code className="block break-all rounded-md bg-background px-2 py-1.5 text-[11px] text-foreground">
              {sample}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
