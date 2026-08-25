// BC-Mobile-7F — Nhắc nhở của khoảnh khắc (RPC mỏng).
//
// Chủ sở hữu luôn lấy từ requireSupabaseAuth, không bao giờ từ client.
// RLS + trigger brmr_validate_reminder chặn mọi truy cập chéo người dùng.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MOMENT_REMINDER_MAX_LABEL_LEN,
  MOMENT_REMINDER_MAX_PER_MOMENT,
  sanitizeReminderLabel,
  validateRemindAt,
  type BcMobileMomentReminder,
  type BcMobileMomentReminderResult,
} from "./moment-reminder.types";

const TABLE = "business_relationship_moment_reminders";
const COLUMNS = "id, moment_id, remind_at, label, status, completed_at";

type Row = {
  id: string;
  moment_id: string;
  remind_at: string;
  label: string | null;
  status: string;
  completed_at: string | null;
};

function toDto(row: Row): BcMobileMomentReminder {
  return {
    id: row.id,
    momentId: row.moment_id,
    remindAt: row.remind_at,
    label: row.label,
    status: (row.status === "done" || row.status === "cancelled"
      ? row.status
      : "pending") as BcMobileMomentReminder["status"],
    completedAt: row.completed_at,
  };
}

const listInput = z.object({
  momentId: z.string().uuid().nullish(),
  includeDone: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
});

export const bcMobileMomentRemindersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => listInput.parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcMobileMomentReminderResult<{ reminders: BcMobileMomentReminder[] }>> => {
      let q = context.supabase
        .from(TABLE)
        .select(COLUMNS)
        .eq("owner_user_id", context.userId)
        .order("remind_at", { ascending: true })
        .limit(data.limit);
      if (data.momentId) q = q.eq("moment_id", data.momentId);
      if (!data.includeDone) q = q.eq("status", "pending");
      const { data: rows, error } = await q;
      if (error) return { ok: false, error: "unavailable" };
      return { ok: true, reminders: ((rows ?? []) as Row[]).map(toDto) };
    },
  );

const createInput = z.object({
  momentId: z.string().uuid(),
  remindAt: z.string().min(4).max(40),
  label: z
    .string()
    .max(MOMENT_REMINDER_MAX_LABEL_LEN + 20)
    .nullish(),
});

export const bcMobileMomentReminderCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createInput.parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcMobileMomentReminderResult<{ reminder: BcMobileMomentReminder }>> => {
      const when = validateRemindAt(data.remindAt);
      if (!when.ok) return { ok: false, error: "invalid_remind_at" };

      const { count, error: countError } = await context.supabase
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("owner_user_id", context.userId)
        .eq("moment_id", data.momentId)
        .eq("status", "pending");
      if (countError) return { ok: false, error: "unavailable" };
      if ((count ?? 0) >= MOMENT_REMINDER_MAX_PER_MOMENT) {
        return { ok: false, error: "limit_reached" };
      }

      const { data: row, error } = await context.supabase
        .from(TABLE)
        .insert({
          moment_id: data.momentId,
          owner_user_id: context.userId,
          remind_at: when.remindAt,
          label: sanitizeReminderLabel(data.label),
        })
        .select(COLUMNS)
        .single();
      if (error || !row) {
        return { ok: false, error: error?.message?.includes("moment_not_owned") ? "not_found" : "unavailable" };
      }
      return { ok: true, reminder: toDto(row as Row) };
    },
  );

const statusInput = z.object({
  reminderId: z.string().uuid(),
  status: z.enum(["pending", "done", "cancelled"]),
});

export const bcMobileMomentReminderSetStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => statusInput.parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcMobileMomentReminderResult<{ reminder: BcMobileMomentReminder }>> => {
      const { data: row, error } = await context.supabase
        .from(TABLE)
        .update({
          status: data.status,
          completed_at: data.status === "done" ? new Date().toISOString() : null,
        })
        .eq("id", data.reminderId)
        .eq("owner_user_id", context.userId)
        .select(COLUMNS)
        .maybeSingle();
      if (error) return { ok: false, error: "unavailable" };
      if (!row) return { ok: false, error: "not_found" };
      return { ok: true, reminder: toDto(row as Row) };
    },
  );

const deleteInput = z.object({ reminderId: z.string().uuid() });

export const bcMobileMomentReminderDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => deleteInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobileMomentReminderResult<{ reminderId: string }>> => {
      const { error } = await context.supabase
        .from(TABLE)
        .delete()
        .eq("id", data.reminderId)
        .eq("owner_user_id", context.userId);
      if (error) return { ok: false, error: "unavailable" };
      return { ok: true, reminderId: data.reminderId };
    },
  );
