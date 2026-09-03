import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { z } from "zod";

export const DEMO_LEAD_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "completed",
  "cancelled",
] as const;

export type DemoLeadStatus = (typeof DEMO_LEAD_STATUSES)[number];

export type DemoLead = {
  id: string;
  name: string;
  email: string;
  organization: string;
  phone: string | null;
  jobTitle: string | null;
  preferredDate: string | null;
  preferredSlot: string | null;
  timezone: string | null;
  notes: string | null;
  locale: string | null;
  status: DemoLeadStatus;
  adminNotes: string | null;
  statusChangedAt: string | null;
  createdAt: string;
};

const listInput = z.object({
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const updateInput = z.object({
  id: z.string().uuid(),
  status: z.enum(DEMO_LEAD_STATUSES).optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
});

type Row = {
  id: string;
  name: string;
  email: string;
  organization: string;
  phone: string | null;
  job_title: string | null;
  preferred_date: string | null;
  preferred_slot: string | null;
  timezone: string | null;
  notes: string | null;
  locale: string | null;
  status: string;
  admin_notes: string | null;
  status_changed_at: string | null;
  created_at: string;
};

function toDto(r: Row): DemoLead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    organization: r.organization,
    phone: r.phone,
    jobTitle: r.job_title,
    preferredDate: r.preferred_date,
    preferredSlot: r.preferred_slot ? String(r.preferred_slot).slice(0, 5) : null,
    timezone: r.timezone,
    notes: r.notes,
    locale: r.locale,
    status: (DEMO_LEAD_STATUSES as readonly string[]).includes(r.status)
      ? (r.status as DemoLeadStatus)
      : "new",
    adminNotes: r.admin_notes,
    statusChangedAt: r.status_changed_at,
    createdAt: r.created_at,
  };
}

const SELECT =
  "id, name, email, organization, phone, job_title, preferred_date, preferred_slot, timezone, notes, locale, status, admin_notes, status_changed_at, created_at";

/** Admin-only: list demo booking leads (RLS restricts reads to admins). */
export const listDemoLeads = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => listInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = (null as any)
      .from("demo_requests")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    if (data.from) q = q.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) q = q.lte("created_at", `${data.to}T23:59:59Z`);
    if (data.search?.trim()) {
      const s = data.search.trim().replace(/[%,]/g, "");
      q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,organization.ilike.%${s}%`);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const leads = ((rows ?? []) as Row[]).map(toDto);
    const counts: Record<string, number> = { all: leads.length };
    for (const s of DEMO_LEAD_STATUSES) counts[s] = 0;
    for (const l of leads) counts[l.status] = (counts[l.status] ?? 0) + 1;

    return { leads, counts };
  });

/** Admin-only: update a lead's status and/or internal notes. */
export const updateDemoLead = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data, context }) => {
    const patch: {
      status?: string;
      status_changed_at?: string;
      status_changed_by?: string;
      admin_notes?: string | null;
    } = {};
    if (data.status) {
      patch.status = data.status;
      patch.status_changed_at = new Date().toISOString();
      patch.status_changed_by = context.userId;
    }
    if (data.adminNotes !== undefined) patch.admin_notes = data.adminNotes;
    if (Object.keys(patch).length === 0) throw new Error("Nothing to update");

    const { data: row, error } = await (null as any)
      .from("demo_requests")
      .update(patch)
      .eq("id", data.id)
      .select(SELECT)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found or not permitted");
    return toDto(row as Row);
  });

/* ------------------------------------------------------------------ */
/* CTA attribution analytics                                           */
/* ------------------------------------------------------------------ */

export type CtaBucket = {
  key: string;
  total: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  /** completed / total */
  conversionRate: number;
  /** (contacted+scheduled+completed) / total */
  engagementRate: number;
  lastAt: string | null;
};

export type CtaFunnel = {
  totals: {
    total: number;
    contacted: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    conversionRate: number;
  };
  bySource: CtaBucket[];
  byIntent: CtaBucket[];
  matrix: { source: string; intent: string; total: number; completed: number }[];
  daily: { date: string; total: number; completed: number }[];
};

const funnelInput = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

/** Admin-only: CTA source/intent attribution funnel for landing page leads. */
export const getCtaFunnel = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => funnelInput.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<CtaFunnel> => {
    let q = (null as any)
      .from("demo_requests")
      .select("status, cta_source, cta_intent, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (data.from) q = q.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) q = q.lte("created_at", `${data.to}T23:59:59Z`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    type R = {
      status: string | null;
      cta_source: string | null;
      cta_intent: string | null;
      created_at: string;
    };
    const list = (rows ?? []) as R[];

    const blank = () => ({
      total: 0,
      contacted: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      lastAt: null as string | null,
    });
    type Acc = ReturnType<typeof blank>;

    const bump = (a: Acc, r: R) => {
      a.total += 1;
      if (r.status === "contacted") a.contacted += 1;
      if (r.status === "scheduled") a.scheduled += 1;
      if (r.status === "completed") a.completed += 1;
      if (r.status === "cancelled") a.cancelled += 1;
      if (!a.lastAt || r.created_at > a.lastAt) a.lastAt = r.created_at;
    };

    const rate = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);
    const toBucket = ([key, a]: [string, Acc]): CtaBucket => ({
      key,
      total: a.total,
      contacted: a.contacted,
      scheduled: a.scheduled,
      completed: a.completed,
      cancelled: a.cancelled,
      conversionRate: rate(a.completed, a.total),
      engagementRate: rate(a.contacted + a.scheduled + a.completed, a.total),
      lastAt: a.lastAt,
    });

    const sources = new Map<string, Acc>();
    const intents = new Map<string, Acc>();
    const matrix = new Map<
      string,
      { source: string; intent: string; total: number; completed: number }
    >();
    const daily = new Map<string, { date: string; total: number; completed: number }>();
    const totals = blank();

    for (const r of list) {
      const src = (r.cta_source || "direct").slice(0, 64);
      const intent = (r.cta_intent || "unknown").slice(0, 64);
      if (!sources.has(src)) sources.set(src, blank());
      if (!intents.has(intent)) intents.set(intent, blank());
      bump(sources.get(src)!, r);
      bump(intents.get(intent)!, r);
      bump(totals, r);

      const mk = `${src}|${intent}`;
      const m = matrix.get(mk) ?? { source: src, intent, total: 0, completed: 0 };
      m.total += 1;
      if (r.status === "completed") m.completed += 1;
      matrix.set(mk, m);

      const day = r.created_at.slice(0, 10);
      const d = daily.get(day) ?? { date: day, total: 0, completed: 0 };
      d.total += 1;
      if (r.status === "completed") d.completed += 1;
      daily.set(day, d);
    }

    return {
      totals: {
        total: totals.total,
        contacted: totals.contacted,
        scheduled: totals.scheduled,
        completed: totals.completed,
        cancelled: totals.cancelled,
        conversionRate: rate(totals.completed, totals.total),
      },
      bySource: Array.from(sources.entries())
        .map(toBucket)
        .sort((a, b) => b.total - a.total),
      byIntent: Array.from(intents.entries())
        .map(toBucket)
        .sort((a, b) => b.total - a.total),
      matrix: Array.from(matrix.values()).sort((a, b) => b.total - a.total),
      daily: Array.from(daily.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30),
    };
  });
