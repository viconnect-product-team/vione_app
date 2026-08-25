// BC-Mobile-6D — RPC mỏng cho kế hoạch riêng theo từng người.
//
// - Chủ sở hữu LUÔN lấy từ requireSupabaseAuth, không bao giờ từ client.
// - Quyền gắn kế hoạch cho một người dùng lại đúng adapter uỷ quyền của
//   khoảnh khắc (2E/3B): kết nối đã chấp nhận, thẻ đã lưu chưa lưu trữ, hoặc
//   liên hệ khách thuộc chính chủ sở hữu. Trigger brpp_validate_plan_target
//   kiểm tra lần nữa ở tầng dữ liệu.
// - Không thông báo, không mời họp: dữ liệu chỉ hiển thị cho chủ sở hữu.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { makeMomentServiceDeps } from "./moment.server";
import {
  PERSON_PLAN_MAX_LOCATION_LEN,
  PERSON_PLAN_MAX_NOTE_LEN,
  PERSON_PLAN_MAX_TITLE_LEN,
  personIdFromTarget,
  sanitizePlanText,
  validatePlanDueAt,
  type BcMobilePersonPlan,
  type BcMobilePersonPlanResult,
} from "./person-plan.types";

const TABLE = "business_relationship_person_plans";
const COLUMNS =
  "id, kind, target_kind, target_user_id, target_card_id, target_guest_id, due_at, title, note, location_label, status, completed_at";

type Row = {
  id: string;
  kind: string;
  target_kind: string;
  target_user_id: string | null;
  target_card_id: string | null;
  target_guest_id: string | null;
  due_at: string;
  title: string | null;
  note: string | null;
  location_label: string | null;
  status: string;
  completed_at: string | null;
};

function toDto(row: Row): BcMobilePersonPlan {
  return {
    id: row.id,
    kind: row.kind === "meeting" ? "meeting" : "follow_up",
    personId: personIdFromTarget(row),
    dueAt: row.due_at,
    title: row.title,
    note: row.note,
    locationLabel: row.location_label,
    status:
      row.status === "done" || row.status === "cancelled"
        ? (row.status as BcMobilePersonPlan["status"])
        : "pending",
    completedAt: row.completed_at,
  };
}

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);

const createInput = z.object({
  personId: personIdSchema,
  kind: z.enum(["follow_up", "meeting"]),
  dueAt: z.string().min(4).max(40),
  title: z
    .string()
    .max(PERSON_PLAN_MAX_TITLE_LEN + 20)
    .nullish(),
  note: z
    .string()
    .max(PERSON_PLAN_MAX_NOTE_LEN + 40)
    .nullish(),
  locationLabel: z
    .string()
    .max(PERSON_PLAN_MAX_LOCATION_LEN + 20)
    .nullish(),
});

export const bcMobilePersonPlanCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plan: BcMobilePersonPlan }>> => {
      const when = validatePlanDueAt(data.dueAt);
      if (!when.ok) return { ok: false, error: "invalid_due_at" };

      const deps = makeMomentServiceDeps(context.supabase);
      const authz = await deps.authorizePerson({
        viewerId: context.userId,
        personId: data.personId,
      });
      if (!authz.ok) return { ok: false, error: "relationship_not_authorized" };

      const target = authz.target;
      const { data: row, error } = await context.supabase
        .from(TABLE)
        .insert({
          owner_user_id: context.userId,
          kind: data.kind,
          target_kind: target.kind,
          target_user_id: target.kind === "connection" ? target.userId : null,
          target_card_id: target.kind === "saved_card" ? target.cardId : null,
          target_guest_id: target.kind === "guest_contact" ? target.guestContactId : null,
          due_at: when.dueAt,
          title: sanitizePlanText(data.title, PERSON_PLAN_MAX_TITLE_LEN),
          note: sanitizePlanText(data.note, PERSON_PLAN_MAX_NOTE_LEN),
          location_label:
            data.kind === "meeting"
              ? sanitizePlanText(data.locationLabel, PERSON_PLAN_MAX_LOCATION_LEN)
              : null,
        })
        .select(COLUMNS)
        .single();
      if (error || !row) {
        if (error?.message?.includes("PERSON_PLAN_RELATIONSHIP_NOT_AUTHORIZED")) {
          return { ok: false, error: "relationship_not_authorized" };
        }
        return { ok: false, error: "unavailable" };
      }
      return { ok: true, plan: toDto(row as Row) };
    },
  );

const listInput = z.object({
  personId: personIdSchema.nullish(),
  includeClosed: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
});

export const bcMobilePersonPlansFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => listInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plans: BcMobilePersonPlan[] }>> => {
      let q = context.supabase
        .from(TABLE)
        .select(COLUMNS)
        .eq("owner_user_id", context.userId)
        .order("due_at", { ascending: true })
        .limit(data.limit);
      if (!data.includeClosed) q = q.eq("status", "pending");
      if (data.personId) {
        const deps = makeMomentServiceDeps(context.supabase);
        const authz = await deps.authorizePerson({
          viewerId: context.userId,
          personId: data.personId,
        });
        if (!authz.ok) return { ok: false, error: "relationship_not_authorized" };
        const target = authz.target;
        if (target.kind === "connection") q = q.eq("target_user_id", target.userId);
        else if (target.kind === "saved_card") q = q.eq("target_card_id", target.cardId);
        else q = q.eq("target_guest_id", target.guestContactId);
      }
      const { data: rows, error } = await q;
      if (error) return { ok: false, error: "unavailable" };
      return { ok: true, plans: ((rows ?? []) as Row[]).map(toDto) };
    },
  );

const statusInput = z.object({
  planId: z.string().uuid(),
  status: z.enum(["pending", "done", "cancelled"]),
});

export const bcMobilePersonPlanSetStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => statusInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plan: BcMobilePersonPlan }>> => {
      const { data: row, error } = await context.supabase
        .from(TABLE)
        .update({
          status: data.status,
          completed_at: data.status === "done" ? new Date().toISOString() : null,
        })
        .eq("id", data.planId)
        .eq("owner_user_id", context.userId)
        .select(COLUMNS)
        .maybeSingle();
      if (error) return { ok: false, error: "unavailable" };
      if (!row) return { ok: false, error: "not_found" };
      return { ok: true, plan: toDto(row as Row) };
    },
  );
