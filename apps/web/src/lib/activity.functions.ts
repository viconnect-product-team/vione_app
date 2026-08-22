import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ActivityLog } from "@/lib/extra-data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listActivityLogFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityLog[]> => {
    const { data, error } = await context.supabase
      .from("activity_log")
      .select("*")
      .order("at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((l) => ({
      id: l.code,
      user: l.user,
      action: l.action,
      target: l.target,
      category: l.category as ActivityLog["category"],
      at: l.at,
      ip: l.ip,
    }));
  });

// Audit log is system-written; only deletion (cleanup) is allowed.
export const deleteActivityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.from("activity_log").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearActivityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.from("activity_log").delete().neq("code", "");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
