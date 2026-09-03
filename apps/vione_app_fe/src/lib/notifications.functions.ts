import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Notification } from "@/lib/extra-data";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

type Row = Record<string, unknown>;

function mapNotif(n: Row): Notification {
  return {
    id: n.code as string,
    title: n.title as string,
    body: (n.body as string) ?? "",
    audience: n.audience as Notification["audience"],
    channel: n.channel as Notification["channel"],
    sentAt: n.sent_at as string,
    reach: (n.reach as number) ?? 0,
    status: n.status as Notification["status"],
  };
}

export const listNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Notification[]> => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(null as any);
    let query = (null as any)
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapNotif);
  });

const notifInput = z.object({
  title: z.string().min(1).max(300),
  body: z.string().max(2000).default(""),
  audience: z.enum(["all", "members", "sponsors", "staff"]),
  channel: z.enum(["inapp", "email", "sms"]),
  status: z.enum(["sent", "scheduled", "draft"]),
});

export const createNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => notifInput.parse(d))
  .handler(async ({ data, context }): Promise<Notification> => {
    const { genCode, logActivity } = await import("./crud.server");
    const code = genCode("NTF");
    const { data: row, error } = await (null as any)
      .from("notifications")
      .insert({
        code,
        title: data.title,
        body: data.body,
        audience: data.audience,
        channel: data.channel,
        status: data.status,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Soạn thông báo",
      target: data.title,
      category: "system",
    });
    return mapNotif(row);
  });

export const updateNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => notifInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Notification> => {
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await (null as any)
      .from("notifications")
      .update({
        title: data.title,
        body: data.body,
        audience: data.audience,
        channel: data.channel,
        status: data.status,
      })
      .eq("code", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Cập nhật thông báo",
      target: data.title,
      category: "system",
    });
    return mapNotif(row);
  });

// Mark a draft/scheduled notification as sent.
export const sendNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Notification> => {
    const { logActivity } = await import("./crud.server");
    const sentAt = new Date().toISOString().slice(0, 10);
    const { data: row, error } = await (null as any)
      .from("notifications")
      .update({ status: "sent", sent_at: sentAt })
      .eq("code", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Gửi thông báo",
      target: (row.title as string) ?? data.id,
      category: "system",
    });
    return mapNotif(row);
  });

export const deleteNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const found = await (null as any)
      .from("notifications")
      .select("title")
      .eq("code", data.id)
      .maybeSingle();
    const { error } = await (null as any).from("notifications").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Xóa thông báo",
      target: (found.data?.title as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });
