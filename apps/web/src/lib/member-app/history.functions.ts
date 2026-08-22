import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- History (transactions + activity) ----------
export type MyHistoryActivity = {
  id: string;
  type: "payment" | "event" | "email" | "call" | "meeting" | "note";
  title: string;
  detail: string | null;
  date: string;
};

export type MyHistoryPayment = {
  id: string;
  invoice: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  date: string;
};

export type MyHistoryEvent = {
  id: string;
  name: string;
  date: string;
  checkedIn: boolean;
};

export type MyHistory = {
  activities: MyHistoryActivity[];
  payments: MyHistoryPayment[];
  events: MyHistoryEvent[];
};

function historyActType(category: string | null, action: string): MyHistoryActivity["type"] {
  const c = (category ?? "").toLowerCase();
  const a = (action ?? "").toLowerCase();
  if (c === "fee" || a.includes("thanh toán") || a.includes("payment")) return "payment";
  if (c === "event" || a.includes("sự kiện") || a.includes("event")) return "event";
  if (a.includes("email") || a.includes("bản tin")) return "email";
  if (a.includes("gọi") || a.includes("call")) return "call";
  if (a.includes("họp") || a.includes("meeting")) return "meeting";
  return "note";
}

/** Returns the signed-in member's own recent transactions, events and activity. */
export const getMyHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyHistory> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("id, code, name")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me) return { activities: [], payments: [], events: [] };

    const code = me.code as string;
    const name = me.name as string;
    const id = me.id as string;

    const targets = [code, name].filter(Boolean);
    let activities: MyHistoryActivity[] = [];
    if (targets.length) {
      const { data: rows } = await supabase
        .from("activity_log")
        .select("code, action, target, category, created_at")
        .in("target", targets)
        .order("created_at", { ascending: false })
        .limit(50);
      activities = (rows ?? []).map((r) => ({
        id: r.code as string,
        type: historyActType(r.category as string | null, r.action as string),
        title: r.action as string,
        detail: (r.target as string) ?? null,
        date: (r.created_at as string) ?? new Date().toISOString(),
      }));
    }

    let events: MyHistoryEvent[] = [];
    if (code) {
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("id, event_id, registered_at, status")
        .eq("member_code", code)
        .order("registered_at", { ascending: false })
        .limit(50);
      const eventIds = [...new Set((regs ?? []).map((r) => r.event_id as string).filter(Boolean))];
      const eventMap = new Map<string, { name: string; date: string }>();
      if (eventIds.length) {
        const { data: evs } = await supabase
          .from("events")
          .select("id, name, date")
          .in("id", eventIds);
        for (const e of evs ?? [])
          eventMap.set(e.id as string, { name: e.name as string, date: e.date as string });
      }
      events = (regs ?? []).map((r) => {
        const ev = eventMap.get(r.event_id as string);
        return {
          id: r.id as string,
          name: ev?.name ?? "—",
          date: ev?.date ?? (r.registered_at as string) ?? new Date().toISOString(),
          checkedIn: (r.status as string) === "checked-in" || (r.status as string) === "attended",
        };
      });
    }

    let payments: MyHistoryPayment[] = [];
    if (id) {
      const { data: rows } = await supabase
        .from("invoices")
        .select("invoice_no, year, amount, due_date, paid_at, status")
        .eq("member_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      payments = (rows ?? []).map((i, idx) => ({
        id: (i.invoice_no as string) ?? `inv-${idx}`,
        invoice: (i.invoice_no as string) ?? "—",
        description: `Hội phí ${i.year ?? ""}`.trim(),
        amount: Number(i.amount ?? 0),
        status:
          (i.status as string) === "paid"
            ? "paid"
            : (i.status as string) === "refunded"
              ? "refunded"
              : "pending",
        date: (i.paid_at as string) ?? (i.due_date as string) ?? new Date().toISOString(),
      }));
    }

    return { activities, payments, events };
  });
