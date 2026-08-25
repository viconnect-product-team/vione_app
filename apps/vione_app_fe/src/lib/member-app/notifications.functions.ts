import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { relTime } from "./shared";
import { resolveMemberId } from "@/lib/current-member";

export type LeadWorkflowStatus =
  | "new"
  | "read"
  | "contacting"
  | "responded"
  | "won"
  | "lost"
  | "archived";

export type NotificationPriority = "high" | "medium" | "low";

export type MyNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  createdAt: string;
  type: "event" | "fee" | "opportunity" | "system" | "network" | "lead";
  unread: boolean;
  dismissed: boolean;
  priority: NotificationPriority;
  personal: boolean;
  refType?: string | null;
  refId?: string | null;
  leadStatus?: LeadWorkflowStatus | null;
};

// Higher-value lead states + unread notifications surface first.
const leadPriority = (status: LeadWorkflowStatus | null, unread: boolean): NotificationPriority => {
  if (status === "new" || (unread && status === "read")) return "high";
  if (status === "read" || status === "contacting") return "medium";
  return "low";
};

// ---------- Notifications ----------
export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyNotification[]> => {
    const { data } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("status", "sent")
      .order("sent_at", { ascending: false, nullsFirst: false });
    const typeMap = (audience: string | null): MyNotification["type"] => {
      const a = (audience ?? "").toLowerCase();
      if (a.includes("event") || a.includes("sự kiện")) return "event";
      if (a.includes("fee") || a.includes("phí")) return "fee";
      if (a.includes("opp") || a.includes("cơ hội")) return "opportunity";
      return "system";
    };
    // Per-user broadcast dismissals (synced across devices via backend).
    const { data: dismissedRows } = await context.supabase
      .from("broadcast_notification_dismissals")
      .select("notification_id");
    const dismissedIds = new Set((dismissedRows ?? []).map((r) => r.notification_id));

    const broadcast: MyNotification[] = (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: relTime(n.sent_at ?? n.created_at),
      createdAt: n.sent_at ?? n.created_at,
      type: typeMap(n.audience),
      unread: false,
      dismissed: dismissedIds.has(n.id),
      priority: "low" as NotificationPriority,
      personal: false,
    }));

    // Personal (per-member) notifications, e.g. connection accept/decline, leads.
    // Include dismissed rows so the client can render the "Hidden" filter tab.
    const { data: personal } = await context.supabase
      .from("member_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    // Resolve current status for lead notifications so the workflow buttons
    // reflect the live state of each request.
    const leadIds = Array.from(
      new Set(
        (personal ?? [])
          .filter((n) => n.ref_type === "business_card_lead" && n.ref_id)
          .map((n) => n.ref_id as string),
      ),
    );
    const leadStatusMap = new Map<string, LeadWorkflowStatus>();
    if (leadIds.length > 0) {
      const { data: leads } = await context.supabase
        .from("business_card_leads")
        .select("id, status")
        .in("id", leadIds);
      for (const l of leads ?? []) {
        leadStatusMap.set(l.id, (l.status as LeadWorkflowStatus) ?? "new");
      }
    }

    const personalMapped: MyNotification[] = (personal ?? []).map((n) => {
      const isLead = n.type === "business_card_lead" && !!n.ref_id;
      const isRenewalFailure = n.type === "renewal_failure";
      const leadStatus = isLead ? (leadStatusMap.get(n.ref_id as string) ?? "new") : null;
      const unread = !n.read;
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        time: relTime(n.created_at),
        createdAt: n.created_at,
        type: (isLead
          ? "lead"
          : isRenewalFailure
            ? "fee"
            : n.type === "network"
              ? "network"
              : "system") as MyNotification["type"],
        unread,
        dismissed: n.dismissed ?? false,
        personal: true,
        priority: isLead
          ? leadPriority(leadStatus, unread)
          : isRenewalFailure
            ? ("high" as NotificationPriority)
            : ((unread ? "medium" : "low") as NotificationPriority),

        refType: n.ref_type ?? null,
        refId: n.ref_id ?? null,
        leadStatus,
      };
    });

    return [...personalMapped, ...broadcast];
  });

const bulkIdsSchema = z.object({ ids: z.array(z.string().uuid()).min(1) });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data, error } = await context.supabase
      .from("member_notifications")
      .update({ read: true })
      .eq("recipient_id", memberId)
      .eq("read", false)
      .select("id");
    if (error) throw new Error(error.message);
    return { marked: (data ?? []).length, ids: (data ?? []).map((r) => r.id) };
  });

export const unmarkAllNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => bulkIdsSchema.parse(data))
  .handler(async ({ context, data }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ read: false })
      .eq("recipient_id", memberId)
      .in("id", data.ids)
      .select("id");
    if (error) throw new Error(error.message);
    return { restored: (rows ?? []).length };
  });

const markReadSchema = z.object({ id: z.string().uuid() });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => markReadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ read: true })
      .eq("id", data.id)
      .eq("recipient_id", memberId)
      .eq("read", false)
      .select("id");
    if (error) throw new Error(error.message);
    return { marked: (rows ?? []).length };
  });

export const dismissNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => markReadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ dismissed: true, read: true })
      .eq("id", data.id)
      .eq("recipient_id", memberId)
      .select("id");
    if (error) throw new Error(error.message);
    return { dismissed: (rows ?? []).length };
  });

export const dismissAllNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ dismissed: true, read: true })
      .eq("recipient_id", memberId)
      .eq("dismissed", false)
      .select("id");
    if (error) throw new Error(error.message);
    return { dismissed: (rows ?? []).length, ids: (rows ?? []).map((r) => r.id) };
  });

export const restoreAllPersonalNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => bulkIdsSchema.parse(data))
  .handler(async ({ context, data }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ dismissed: false })
      .eq("recipient_id", memberId)
      .in("id", data.ids)
      .select("id");
    if (error) throw new Error(error.message);
    return { restored: (rows ?? []).length };
  });

// ---------- Broadcast dismissals (synced across devices) ----------
const dismissBroadcastSchema = z.object({ ids: z.array(z.string().uuid()).min(1) });

/**
 * Persist per-user dismissal of association-wide broadcast notifications so the
 * hidden state syncs across all of the user's devices. Identity comes from the
 * JWT (auth.uid()) via RLS — client cannot dismiss on behalf of others.
 */
export const dismissBroadcastNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => dismissBroadcastSchema.parse(data))
  .handler(async ({ context, data }) => {
    const userId = context.userId;
    const rows = data.ids.map((notification_id) => ({ user_id: userId, notification_id }));
    const { error } = await context.supabase
      .from("broadcast_notification_dismissals")
      .upsert(rows, { onConflict: "user_id,notification_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { dismissed: rows.length };
  });

// ---------- Undo dismissal ----------
export const restoreNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => markReadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: rows, error } = await context.supabase
      .from("member_notifications")
      .update({ dismissed: false })
      .eq("id", data.id)
      .eq("recipient_id", memberId)
      .select("id");
    if (error) throw new Error(error.message);
    return { restored: (rows ?? []).length };
  });

export const restoreBroadcastNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => dismissBroadcastSchema.parse(data))
  .handler(async ({ context, data }) => {
    const userId = context.userId;
    const { error } = await context.supabase
      .from("broadcast_notification_dismissals")
      .delete()
      .eq("user_id", userId)
      .in("notification_id", data.ids);
    if (error) throw new Error(error.message);
    return { restored: data.ids.length };
  });
