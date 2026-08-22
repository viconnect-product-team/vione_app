import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { relTime } from "./shared";

export type MyOpportunity = {
  id: string;
  tag: string;
  title: string;
  company: string;
  time: string;
  color: string;
  interested: boolean;
};

const OPP_COLORS = ["#7c6cff", "#3fbf7f", "#4a9eff", "#e8a04c"];

// ---------- Opportunities ----------
export const listMyOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyOpportunity[]> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    const { data: ints } = await supabase
      .from("opportunity_interests")
      .select("opportunity_id")
      .eq("member_id", userId);
    const mine = new Set((ints ?? []).map((i) => i.opportunity_id));
    return (data ?? []).map((o, i) => ({
      id: o.id,
      tag: o.type,
      title: o.title,
      company: o.region ?? o.industry ?? "",
      time: relTime(o.created_at),
      color: OPP_COLORS[i % OPP_COLORS.length],
      interested: mine.has(o.id),
    }));
  });

export const expressInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        opportunityId: z.string().min(1).max(64),
        message: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("contact, phone")
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await supabase.from("opportunity_interests").insert({
      id: crypto.randomUUID(),
      opportunity_id: data.opportunityId,
      member_id: userId,
      message: data.message ?? "Tôi quan tâm cơ hội này.",
      contact: me?.phone ?? "",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
