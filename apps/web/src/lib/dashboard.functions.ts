import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  newMembers30d: number;
  companies: number;
  individuals: number;
  events: number;
  upcomingEvents: number;
  registrations: number;
  sponsors: number;
  documents: number;
  revenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  pendingRenewals: number;
  openOpportunities: number;
  pendingQuotes: number;
  industries: { key: string; count: number }[];
  regions: { key: string; count: number }[];
  growth: { month: string; count: number }[];
};

export const getDashboardStatsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardStats> => {
    const db = context.supabase;
    const nowIso = new Date().toISOString();
    const days30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

    const count = async (table: string, build?: (q: any) => any) => {
      let q = (db.from(table as never) as any).select("*", {
        count: "exact",
        head: true,
      });
      if (build) q = build(q);
      const { count: c } = await q;
      return c ?? 0;
    };

    const [
      totalMembers,
      activeMembers,
      newMembers30d,
      companies,
      individuals,
      events,
      upcomingEvents,
      registrations,
      sponsors,
      documents,
      paidInvoices,
      unpaidInvoices,
      pendingRenewals,
      openOpportunities,
      pendingQuotes,
    ] = await Promise.all([
      count("members"),
      count("members", (q) => q.eq("status", "active")),
      count("members", (q) => q.gte("joined_at", days30)),
      count("members", (q) => q.eq("type", "company")),
      count("members", (q) => q.eq("type", "individual")),
      count("events"),
      count("events", (q) => q.gte("date", nowIso)),
      count("event_registrations"),
      count("sponsors"),
      count("documents"),
      count("invoices", (q) => q.eq("status", "paid")),
      count("invoices", (q) => q.neq("status", "paid")),
      count("members", (q) => q.eq("status", "expired")),
      count("opportunities", (q) => q.eq("status", "open")),
      count("quote_requests", (q) => q.eq("status", "pending")),
    ]);

    // Revenue from paid invoices
    const { data: invRows } = await db.from("invoices").select("amount,status");
    const revenue = (invRows ?? [])
      .filter((r: any) => r.status === "paid")
      .reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);

    // Industry / region breakdown + growth
    const { data: memberRows } = await db.from("members").select("industry,region,joined_at");

    const tally = (rows: any[], key: string) => {
      const m = new Map<string, number>();
      for (const r of rows) {
        const v = r[key];
        if (!v) continue;
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      return [...m.entries()]
        .map(([k, c]) => ({ key: k, count: c }))
        .sort((a, b) => b.count - a.count);
    };

    const rows = memberRows ?? [];
    const industries = tally(rows, "industry").slice(0, 6);
    const regions = tally(rows, "region");

    // Growth: last 6 months cumulative new members
    const growth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const c = rows.filter((r: any) => {
        const j = r.joined_at ? new Date(r.joined_at) : null;
        return j && j >= start && j < end;
      }).length;
      growth.push({ month: `${d.getMonth() + 1}/${d.getFullYear()}`, count: c });
    }

    return {
      totalMembers,
      activeMembers,
      newMembers30d,
      companies,
      individuals,
      events,
      upcomingEvents,
      registrations,
      sponsors,
      documents,
      revenue,
      paidInvoices,
      unpaidInvoices,
      pendingRenewals,
      openOpportunities,
      pendingQuotes,
      industries,
      regions,
      growth,
    };
  });
