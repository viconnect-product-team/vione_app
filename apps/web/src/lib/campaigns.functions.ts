import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  sentAt: string;
  status: "sent" | "scheduled" | "draft";
};

export const listCampaignsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Campaign[]> => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let query = context.supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((c) => ({
      id: c.code,
      name: c.name,
      subject: c.subject,
      audience: c.audience,
      sent: Number(c.sent),
      opened: Number(c.opened),
      clicked: Number(c.clicked),
      sentAt: c.sent_at ?? "—",
      status: c.status as Campaign["status"],
    }));
  });

export const createCampaignFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1).max(200),
        subject: z.string().max(300).default(""),
        audience: z.string().max(200).default(""),
        status: z.enum(["sent", "scheduled", "draft"]).default("draft"),
        time: z.string().max(40).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Campaign> => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    const code = `CMP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data: row, error } = await context.supabase
      .from("email_campaigns")
      .insert({
        code,
        name: data.name,
        subject: data.subject,
        audience: data.audience,
        status: data.status,
        sent_at:
          data.time || (data.status === "sent" ? new Date().toISOString().slice(0, 10) : null),
        ...(activeId ? { association_id: activeId } : {}),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: row.code,
      name: row.name,
      subject: row.subject,
      audience: row.audience,
      sent: Number(row.sent),
      opened: Number(row.opened),
      clicked: Number(row.clicked),
      sentAt: row.sent_at ?? "—",
      status: row.status as Campaign["status"],
    };
  });

export const deleteCampaignFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("email_campaigns").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
