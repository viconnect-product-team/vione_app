// BC-8.1 Turn B — User-facing notification read + mutation server functions.
//
// Reads and approved mutations (mark_read / mark_unread / archive) only.
// Runtime worker functions (consume/dispatch/reconcile) are NOT here — see
// `./runtime/internal-api.server`.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { NotificationError, toNotificationError } from "./errors";
import { decodeCursor, encodeCursor } from "./cursor";
import {
  NOTIFICATION_LIST_PAGE_SIZE_DEFAULT,
  NOTIFICATION_LIST_PAGE_SIZE_MAX,
  NOTIFICATION_POLICY_VERSION,
  NOTIFICATION_STATUSES,
  type NotificationDTO,
  type NotificationListDTO,
} from "./types";

type Sb = import("@supabase/supabase-js").SupabaseClient<any, "public", any>;

const listSchema = z.object({
  status: z.enum(NOTIFICATION_STATUSES).nullable().optional(),
  unreadOnly: z.boolean().nullable().optional(),
  cursor: z.string().nullable().optional(),
  limit: z.number().int().positive().max(NOTIFICATION_LIST_PAGE_SIZE_MAX).nullable().optional(),
});

type Row = Record<string, unknown>;

function mapNotification(r: Row): NotificationDTO {
  return {
    id: r.id as string,
    recipientUserId: r.recipient_user_id as string,
    sourceDomain: r.source_domain as NotificationDTO["sourceDomain"],
    sourceRecordId: r.source_record_id as string,
    eventKind: r.event_kind as string,
    notificationKind: r.notification_kind as NotificationDTO["notificationKind"],
    titleKey: r.title_key as string,
    bodyKey: r.body_key as string,
    safeDisplayData: (r.safe_display_data as NotificationDTO["safeDisplayData"]) ?? {},
    action: {
      kind: (r.action_kind as NotificationDTO["action"]["kind"]) ?? "none",
      labelKey: (r.action_label_key as string) ?? "bc.notif.action.view",
      targetRoute: (r.action_target as { route?: string } | null)?.route ?? null,
      targetParams: (r.action_target as { params?: Record<string, string> } | null)?.params ?? null,
      targetSearch:
        (r.action_target as { search?: Record<string, string | number | boolean> } | null)
          ?.search ?? null,
      requiresConfirmation: false,
      canonicalCapability: null,
    },
    priority: r.priority as NotificationDTO["priority"],
    status: r.status as NotificationDTO["status"],
    scheduledFor: (r.scheduled_for as string | null) ?? null,
    deliveredAt: (r.delivered_at as string | null) ?? null,
    readAt: (r.read_at as string | null) ?? null,
    archivedAt: (r.archived_at as string | null) ?? null,
    expiredAt: (r.expired_at as string | null) ?? null,
    dedupeKey: r.dedupe_key as string,
    schemaVersion: 1,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export const listNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listSchema.parse(d))
  .handler(async ({ data, context }): Promise<NotificationListDTO> => {
    try {
      const supabase = context.supabase as unknown as Sb;
      const limit = Math.min(
        data.limit ?? NOTIFICATION_LIST_PAGE_SIZE_DEFAULT,
        NOTIFICATION_LIST_PAGE_SIZE_MAX,
      );
      const cursor = decodeCursor(data.cursor ?? null, {
        status: data.status ?? null,
        unreadOnly: data.unreadOnly ?? null,
        limit,
      });
      let q = supabase
        .from("business_notifications")
        .select("*")
        .eq("recipient_user_id", context.userId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit + 1);
      if (data.status) q = q.eq("status", data.status);
      if (data.unreadOnly) q = q.is("read_at", null).is("archived_at", null).is("expired_at", null);
      if (cursor) q = q.lt("created_at", cursor.t);
      const res = await q;
      if (res.error) throw new NotificationError("NOTIFICATION_INTERNAL_ERROR", res.error.message);
      const rows = (res.data ?? []) as Row[];
      const items = rows.slice(0, limit).map(mapNotification);
      const nextCursor =
        rows.length > limit && items.length > 0
          ? encodeCursor({
              referenceTs: items[items.length - 1].createdAt,
              itemId: items[items.length - 1].id,
              filters: { status: data.status ?? null, unreadOnly: data.unreadOnly ?? null, limit },
            })
          : null;
      return { items, nextCursor, policyVersion: NOTIFICATION_POLICY_VERSION };
    } catch (e) {
      throw toNotificationError(e);
    }
  });

export const getUnreadNotificationCountFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ count: number }> => {
    const supabase = context.supabase as unknown as Sb;
    const r = await supabase.rpc("bnotif_unread_count");
    if (r.error) throw new NotificationError("NOTIFICATION_INTERNAL_ERROR", r.error.message);
    return { count: (r.data as number) ?? 0 };
  });

const idSchema = z.object({ id: z.string().uuid() });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }): Promise<NotificationDTO> => {
    const supabase = context.supabase as unknown as Sb;
    const r = await supabase.rpc("bnotif_mark_read", { _id: data.id });
    if (r.error) throw new NotificationError("NOTIFICATION_NOT_FOUND", r.error.message);
    return mapNotification(r.data as Row);
  });

export const markNotificationUnreadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }): Promise<NotificationDTO> => {
    const supabase = context.supabase as unknown as Sb;
    const r = await supabase.rpc("bnotif_mark_unread", { _id: data.id });
    if (r.error) throw new NotificationError("NOTIFICATION_NOT_FOUND", r.error.message);
    return mapNotification(r.data as Row);
  });

export const archiveNotificationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }): Promise<NotificationDTO> => {
    const supabase = context.supabase as unknown as Sb;
    const r = await supabase.rpc("bnotif_archive", { _id: data.id });
    if (r.error) throw new NotificationError("NOTIFICATION_NOT_FOUND", r.error.message);
    return mapNotification(r.data as Row);
  });

export const archiveAllReadNotificationsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ archived: number }> => {
    const supabase = context.supabase as unknown as Sb;
    const r = await supabase.rpc("bnotif_archive_all_read");
    if (r.error) throw new NotificationError("NOTIFICATION_INTERNAL_ERROR", r.error.message);
    return { archived: (r.data as number) ?? 0 };
  });
