import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveMemberId } from "./current-member";
import type { Opportunity, OpportunityInterest, OpportunityTypeKey } from "./opportunities-data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Row = Record<string, unknown>;

const TYPE_VALUES = [
  "opp.type.partnership",
  "opp.type.investment",
  "opp.type.supply",
  "opp.type.demand",
  "opp.type.distribution",
  "opp.type.other",
] as const;

function mapOpportunity(r: Row): Opportunity {
  return {
    id: r.id as string,
    posterId: r.poster_id as string,
    title: r.title as string,
    description: (r.description as string) ?? "",
    type: r.type as OpportunityTypeKey,
    budgetMin: r.budget_min != null ? Number(r.budget_min) : undefined,
    budgetMax: r.budget_max != null ? Number(r.budget_max) : undefined,
    region: (r.region as string) ?? "",
    industry: (r.industry as string) ?? "",
    deadline: r.deadline as string,
    status: r.status as Opportunity["status"],
    createdAt: r.created_at as string,
    views: (r.views as number) ?? 0,
    emoji: (r.emoji as string) ?? "💡",
  };
}

function mapInterest(r: Row): OpportunityInterest {
  return {
    id: r.id as string,
    opportunityId: r.opportunity_id as string,
    memberId: r.member_id as string,
    message: (r.message as string) ?? "",
    contact: (r.contact as string) ?? "",
    createdAt: r.created_at as string,
  };
}

export const listOpportunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      opportunities: Opportunity[];
      interests: OpportunityInterest[];
      interestCounts: Record<string, number>;
    }> => {
      const [opps, interests] = await Promise.all([
        context.supabase
          .from("opportunities")
          .select("*")
          .order("created_at", { ascending: false }),
        context.supabase
          .from("opportunity_interests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (opps.error) throw new Error(opps.error.message);
      if (interests.error) throw new Error(interests.error.message);
      const mappedInterests = (interests.data ?? []).map((r) => mapInterest(r as Row));
      const interestCounts: Record<string, number> = {};
      for (const it of mappedInterests) {
        interestCounts[it.opportunityId] = (interestCounts[it.opportunityId] ?? 0) + 1;
      }
      return {
        opportunities: (opps.data ?? []).map((r) => mapOpportunity(r as Row)),
        interests: mappedInterests,
        interestCounts,
      };
    },
  );

export const getOpportunityFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ opportunity: Opportunity; interests: OpportunityInterest[] } | null> => {
      const { data: row, error } = await context.supabase
        .from("opportunities")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) return null;
      // GUARD: service role only bumps the view counter on a row the caller could
      // already read under RLS; scope by the RLS-visible row's association_id so a
      // stale/colliding id can never touch a cross-tenant resource.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("opportunities")
        .update({ views: (((row as Row).views as number) ?? 0) + 1 })
        .eq("id", data.id)
        .eq("association_id", (row as Row).association_id as string);
      const { data: interests } = await context.supabase
        .from("opportunity_interests")
        .select("*")
        .eq("opportunity_id", data.id)
        .order("created_at", { ascending: false });
      return {
        opportunity: mapOpportunity(row as Row),
        interests: (interests ?? []).map((i) => mapInterest(i as Row)),
      };
    },
  );

export const createOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        type: z.enum(TYPE_VALUES),
        budgetMin: z.number().min(0).max(1e15).optional(),
        budgetMax: z.number().min(0).max(1e15).optional(),
        region: z.string().min(1).max(200),
        industry: z.string().min(1).max(200),
        deadline: z.string().min(1).max(64),
        emoji: z.string().min(1).max(16).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Opportunity> => {
    const id = `o-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const memberId = await resolveMemberId(context.supabase);
    const { data: row, error } = await context.supabase
      .from("opportunities")
      .insert({
        id,
        poster_id: memberId,
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        budget_min: data.budgetMin ?? null,
        budget_max: data.budgetMax ?? null,
        region: data.region.trim(),
        industry: data.industry.trim(),
        deadline: data.deadline,
        status: "open",
        views: 0,
        emoji: data.emoji ?? "💡",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapOpportunity(row as Row);
  });

export const updateOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        type: z.enum(TYPE_VALUES),
        budgetMin: z.number().min(0).max(1e15).optional(),
        budgetMax: z.number().min(0).max(1e15).optional(),
        region: z.string().min(1).max(200),
        industry: z.string().min(1).max(200),
        deadline: z.string().min(1).max(64),
        emoji: z.string().min(1).max(16),
        status: z.enum(["open", "closed"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Opportunity | null> => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: row, error } = await context.supabase
      .from("opportunities")
      .update({
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        budget_min: data.budgetMin ?? null,
        budget_max: data.budgetMax ?? null,
        region: data.region.trim(),
        industry: data.industry.trim(),
        deadline: data.deadline,
        emoji: data.emoji,
        status: data.status,
      })
      .eq("id", data.id)
      .eq("poster_id", memberId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapOpportunity(row as Row) : null;
  });

export const deleteOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const memberId = await resolveMemberId(context.supabase);
    const { error } = await context.supabase
      .from("opportunities")
      .delete()
      .eq("id", data.id)
      .eq("poster_id", memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleOpportunityStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Opportunity | null> => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: cur } = await context.supabase
      .from("opportunities")
      .select("status")
      .eq("id", data.id)
      .eq("poster_id", memberId)
      .maybeSingle();
    if (!cur) return null;
    const next = (cur as Row).status === "open" ? "closed" : "open";
    const { data: row, error } = await context.supabase
      .from("opportunities")
      .update({ status: next })
      .eq("id", data.id)
      .eq("poster_id", memberId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapOpportunity(row as Row) : null;
  });

export const expressInterestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        opportunityId: z.string().min(1).max(128),
        message: z.string().min(1).max(4000),
        contact: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<OpportunityInterest> => {
    const id = `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const memberId = await resolveMemberId(context.supabase);
    const { data: row, error } = await context.supabase
      .from("opportunity_interests")
      .insert({
        id,
        opportunity_id: data.opportunityId,
        member_id: memberId,
        message: data.message.trim(),
        contact: data.contact.trim(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapInterest(row as Row);
  });
