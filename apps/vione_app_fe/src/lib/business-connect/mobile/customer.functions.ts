// BC-Mobile-8A — RPC mỏng cho "Khách hàng của tôi".
//
// - Chủ sở hữu LUÔN lấy từ requireSupabaseAuth, không bao giờ từ client.
// - Quyền gắn nhãn khách hàng dùng lại đúng adapter uỷ quyền của khoảnh khắc:
//   kết nối đã chấp nhận, thẻ đã lưu chưa lưu trữ, hoặc liên hệ khách của
//   chính chủ sở hữu. RLS ở tầng dữ liệu kiểm tra lần nữa theo owner_user_id.
// - Dữ liệu chỉ hiển thị cho chủ sở hữu: không thông báo, không lộ sang người
//   được gắn nhãn, không đẩy sang cộng đồng.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { makeMomentServiceDeps } from "./moment.server";
import {
  CUSTOMER_LOG_KINDS,
  CUSTOMER_MAX_NAME_LEN,
  CUSTOMER_MAX_NOTE_LEN,
  CUSTOMER_MAX_SOURCE_LEN,
  CUSTOMER_MAX_VALUE,
  CUSTOMER_MAX_TAGS_PER_CUSTOMER,
  CUSTOMER_MAX_TAGS_PER_OWNER,
  CUSTOMER_MAX_TAG_NAME_LEN,
  CUSTOMER_STAGES,
  normalizeCustomerTagName,
  nextActionForStage,
  CUSTOMER_NEED_KINDS,
  CUSTOMER_NEED_PRIORITIES,
  CUSTOMER_NEED_MAX_BODY_LEN,
  type BcCustomerNeed,
  personIdFromCustomerRow,
  sanitizeCustomerText,
  type BcCustomer,
  type BcCustomerLog,
  type BcCustomerTag,
  type BcCustomerTagSuggestionRun,
  type BcCustomerTagSuggestionFeedback,
  type BcCustomerResult,
} from "./customer.types";

const TABLE = "bc_customers";
const LOGS_TABLE = "bc_customer_logs";
const TAGS_TABLE = "bc_customer_tags";
const TAG_SUGGESTION_RUNS_TABLE = "bc_customer_tag_suggestion_runs";
const TAG_SUGGESTION_FEEDBACK_TABLE = "bc_customer_tag_suggestion_feedback";
const TAG_LINKS_TABLE = "bc_customer_tag_links";
const TAG_COLUMNS = "id, name, normalized_name, created_at, updated_at";
const COLUMNS =
  "id, target_kind, target_user_id, target_card_id, target_guest_id, display_name, company_name, stage, expected_value, currency, source_label, note, next_action_at, last_contact_at, created_at, updated_at";
const LOG_COLUMNS = "id, customer_id, kind, body, from_stage, to_stage, occurred_at";

type Row = {
  id: string;
  target_kind: string;
  target_user_id: string | null;
  target_card_id: string | null;
  target_guest_id: string | null;
  display_name: string | null;
  company_name: string | null;
  stage: string;
  expected_value: string | number | null;
  currency: string | null;
  source_label: string | null;
  note: string | null;
  next_action_at: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
};

type LogRow = {
  id: string;
  customer_id: string;
  kind: string;
  body: string | null;
  from_stage: string | null;
  to_stage: string | null;
  occurred_at: string;
};

type TagRow = {
  id: string;
  name: string;
  normalized_name: string;
  created_at: string;
  updated_at: string;
};

function toTagDto(row: TagRow, count: number): BcCustomerTag {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDto(row: Row, tagIds: string[] = []): BcCustomer {
  return {
    id: row.id,
    personId: personIdFromCustomerRow(row),
    displayName: row.display_name,
    companyName: row.company_name,
    stage: (CUSTOMER_STAGES as readonly string[]).includes(row.stage)
      ? (row.stage as BcCustomer["stage"])
      : "prospect",
    expectedValue: row.expected_value === null ? null : Number(row.expected_value),
    currency: row.currency ?? "VND",
    sourceLabel: row.source_label,
    note: row.note,
    nextActionAt: row.next_action_at,
    lastContactAt: row.last_contact_at,
    tagIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLogDto(row: LogRow): BcCustomerLog {
  return {
    id: row.id,
    customerId: row.customer_id,
    kind: (CUSTOMER_LOG_KINDS as readonly string[]).includes(row.kind)
      ? (row.kind as BcCustomerLog["kind"])
      : "note",
    body: row.body,
    fromStage: (row.from_stage as BcCustomerLog["fromStage"]) ?? null,
    toStage: (row.to_stage as BcCustomerLog["toStage"]) ?? null,
    occurredAt: row.occurred_at,
  };
}

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);
const stageSchema = z.enum(CUSTOMER_STAGES);
const isoSchema = z.string().min(4).max(40);

function normalizeIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function normalizeValue(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.min(value, CUSTOMER_MAX_VALUE);
}

// ── List ────────────────────────────────────────────────────────────────────

export const bcMobileCustomersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcCustomerResult<{ customers: BcCustomer[] }>> => {
    const { data: rows, error } = await context.supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq("owner_user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) return { ok: false, error: "unavailable" };

    const { data: links } = await context.supabase
      .from(TAG_LINKS_TABLE)
      .select("customer_id, tag_id")
      .eq("owner_user_id", context.userId)
      .limit(5000);
    const byCustomer = new Map<string, string[]>();
    for (const l of (links ?? []) as { customer_id: string; tag_id: string }[]) {
      const list = byCustomer.get(l.customer_id) ?? [];
      list.push(l.tag_id);
      byCustomer.set(l.customer_id, list);
    }
    return {
      ok: true,
      customers: ((rows ?? []) as Row[]).map((r) => toDto(r, byCustomer.get(r.id) ?? [])),
    };
  });

// ── Create ──────────────────────────────────────────────────────────────────

const createInput = z.object({
  personId: personIdSchema,
  displayName: z.string().max(CUSTOMER_MAX_NAME_LEN + 40).nullish(),
  companyName: z.string().max(CUSTOMER_MAX_NAME_LEN + 40).nullish(),
  stage: stageSchema.default("prospect"),
  expectedValue: z.number().nullish(),
  currency: z.enum(["VND", "USD"]).default("VND"),
  sourceLabel: z.string().max(CUSTOMER_MAX_SOURCE_LEN + 40).nullish(),
  note: z.string().max(CUSTOMER_MAX_NOTE_LEN + 200).nullish(),
  nextActionAt: isoSchema.nullish(),
});

export const bcMobileCustomerCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createInput.parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ customer: BcCustomer }>> => {
    const deps = makeMomentServiceDeps(context.supabase);
    const authz = await deps.authorizePerson({ viewerId: context.userId, personId: data.personId });
    if (!authz.ok) return { ok: false, error: "relationship_not_authorized" };
    const target = authz.target;

    const { data: row, error } = await context.supabase
      .from(TABLE)
      .insert({
        owner_user_id: context.userId,
        target_kind: target.kind,
        target_user_id: target.kind === "connection" ? target.userId : null,
        target_card_id: target.kind === "saved_card" ? target.cardId : null,
        target_guest_id: target.kind === "guest_contact" ? target.guestContactId : null,
        display_name: sanitizeCustomerText(data.displayName, CUSTOMER_MAX_NAME_LEN),
        company_name: sanitizeCustomerText(data.companyName, CUSTOMER_MAX_NAME_LEN),
        stage: data.stage,
        expected_value: normalizeValue(data.expectedValue),
        currency: data.currency,
        source_label: sanitizeCustomerText(data.sourceLabel, CUSTOMER_MAX_SOURCE_LEN),
        note: sanitizeCustomerText(data.note, CUSTOMER_MAX_NOTE_LEN),
        next_action_at: normalizeIso(data.nextActionAt) ?? nextActionForStage(data.stage),
      })
      .select(COLUMNS)
      .single();
    if (error || !row) {
      if (error?.code === "23505") return { ok: false, error: "already_exists" };
      return { ok: false, error: "unavailable" };
    }
    return { ok: true, customer: toDto(row as Row) };
  });

// ── Update ──────────────────────────────────────────────────────────────────

const updateInput = z.object({
  customerId: z.string().uuid(),
  stage: stageSchema.optional(),
  expectedValue: z.number().nullish(),
  currency: z.enum(["VND", "USD"]).optional(),
  sourceLabel: z.string().max(CUSTOMER_MAX_SOURCE_LEN + 40).nullish(),
  note: z.string().max(CUSTOMER_MAX_NOTE_LEN + 200).nullish(),
  nextActionAt: isoSchema.nullish(),
});

export const bcMobileCustomerUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateInput.parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ customer: BcCustomer }>> => {
    const { data: current, error: readErr } = await context.supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (readErr) return { ok: false, error: "unavailable" };
    if (!current) return { ok: false, error: "not_found" };
    const before = toDto(current as Row);

    type Patch = {
      stage?: BcCustomer["stage"];
      currency?: string;
      expected_value?: number | null;
      source_label?: string | null;
      note?: string | null;
      next_action_at?: string | null;
    };
    const patch: Patch = {};
    if (data.stage !== undefined) patch.stage = data.stage;
    if (data.currency !== undefined) patch.currency = data.currency;
    if (data.expectedValue !== undefined) patch.expected_value = normalizeValue(data.expectedValue);
    if (data.sourceLabel !== undefined) {
      patch.source_label = sanitizeCustomerText(data.sourceLabel, CUSTOMER_MAX_SOURCE_LEN);
    }
    if (data.note !== undefined) patch.note = sanitizeCustomerText(data.note, CUSTOMER_MAX_NOTE_LEN);
    if (data.nextActionAt !== undefined) patch.next_action_at = normalizeIso(data.nextActionAt);
    // Đổi giai đoạn mà không tự chọn ngày → tự đặt lịch chăm sóc theo nhịp của
    // giai đoạn mới (Ngừng thì xoá lịch nhắc).
    const stageChanged = data.stage !== undefined && data.stage !== before.stage;
    if (stageChanged && (data.nextActionAt === undefined || !normalizeIso(data.nextActionAt))) {
      patch.next_action_at = nextActionForStage(data.stage as BcCustomer["stage"]);
    }

    const { data: row, error } = await context.supabase
      .from(TABLE)
      .update(patch)
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId)
      .select(COLUMNS)
      .maybeSingle();
    if (error) return { ok: false, error: "unavailable" };
    if (!row) return { ok: false, error: "not_found" };

    if (data.stage && data.stage !== before.stage) {
      await context.supabase.from(LOGS_TABLE).insert({
        customer_id: data.customerId,
        owner_user_id: context.userId,
        kind: "stage_change",
        from_stage: before.stage,
        to_stage: data.stage,
      });
    }
    return { ok: true, customer: toDto(row as Row) };
  });

// ── Delete ──────────────────────────────────────────────────────────────────

export const bcMobileCustomerDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    const { error } = await context.supabase
      .from(TABLE)
      .delete()
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId);
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true } as BcCustomerResult<Record<string, never>>;
  });

// ── Care log ────────────────────────────────────────────────────────────────

export const bcMobileCustomerLogsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ logs: BcCustomerLog[] }>> => {
    const { data: rows, error } = await context.supabase
      .from(LOGS_TABLE)
      .select(LOG_COLUMNS)
      .eq("owner_user_id", context.userId)
      .eq("customer_id", data.customerId)
      .order("occurred_at", { ascending: false })
      .limit(100);
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true, logs: ((rows ?? []) as LogRow[]).map(toLogDto) };
  });

const logInput = z.object({
  customerId: z.string().uuid(),
  kind: z.enum(["call", "meeting", "email", "message", "note"]),
  body: z.string().max(CUSTOMER_MAX_NOTE_LEN + 200).nullish(),
  occurredAt: isoSchema.nullish(),
});

export const bcMobileCustomerLogAddFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => logInput.parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ log: BcCustomerLog }>> => {
    const occurredAt = normalizeIso(data.occurredAt) ?? new Date().toISOString();
    const { data: row, error } = await context.supabase
      .from(LOGS_TABLE)
      .insert({
        customer_id: data.customerId,
        owner_user_id: context.userId,
        kind: data.kind,
        body: sanitizeCustomerText(data.body, CUSTOMER_MAX_NOTE_LEN),
        occurred_at: occurredAt,
      })
      .select(LOG_COLUMNS)
      .maybeSingle();
    if (error || !row) return { ok: false, error: "unavailable" };

    await context.supabase
      .from(TABLE)
      .update({ last_contact_at: occurredAt })
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId);

    return { ok: true, log: toLogDto(row as LogRow) };
  });

// ── Nhãn / phân nhóm khách hàng ─────────────────────────────────────────────
// Danh mục nhãn là tài sản riêng của chủ tài khoản: dùng để lọc danh sách và
// chạy chiến dịch chăm sóc. Người được gắn nhãn không bao giờ nhìn thấy.

async function ownerTagCounts(
  supabase: Parameters<typeof makeMomentServiceDeps>[0],
  ownerUserId: string,
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from(TAG_LINKS_TABLE)
    .select("tag_id")
    .eq("owner_user_id", ownerUserId)
    .limit(5000);
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { tag_id: string }[]) {
    counts[r.tag_id] = (counts[r.tag_id] ?? 0) + 1;
  }
  return counts;
}

export const bcMobileCustomerTagsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcCustomerResult<{ tags: BcCustomerTag[] }>> => {
    const { data: rows, error } = await context.supabase
      .from(TAGS_TABLE)
      .select(TAG_COLUMNS)
      .eq("owner_user_id", context.userId)
      .order("normalized_name", { ascending: true })
      .limit(CUSTOMER_MAX_TAGS_PER_OWNER);
    if (error) return { ok: false, error: "unavailable" };
    const counts = await ownerTagCounts(context.supabase, context.userId);
    return {
      ok: true,
      tags: ((rows ?? []) as TagRow[]).map((r) => toTagDto(r, counts[r.id] ?? 0)),
    };
  });

const tagNameSchema = z.string().min(1).max(CUSTOMER_MAX_TAG_NAME_LEN + 40);

export const bcMobileCustomerTagCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: tagNameSchema }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ tag: BcCustomerTag }>> => {
    const normalized = normalizeCustomerTagName(data.name);
    if (!normalized) return { ok: false, error: "invalid_input" };
    const display = data.name.trim().slice(0, CUSTOMER_MAX_TAG_NAME_LEN);

    const { data: existing } = await context.supabase
      .from(TAGS_TABLE)
      .select(TAG_COLUMNS)
      .eq("owner_user_id", context.userId)
      .eq("normalized_name", normalized)
      .maybeSingle();
    if (existing) return { ok: true, tag: toTagDto(existing as TagRow, 0) };

    const { count } = await context.supabase
      .from(TAGS_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", context.userId);
    if ((count ?? 0) >= CUSTOMER_MAX_TAGS_PER_OWNER) return { ok: false, error: "invalid_input" };

    const { data: row, error } = await context.supabase
      .from(TAGS_TABLE)
      .insert({ owner_user_id: context.userId, name: display, normalized_name: normalized })
      .select(TAG_COLUMNS)
      .maybeSingle();
    if (error || !row) return { ok: false, error: "unavailable" };
    return { ok: true, tag: toTagDto(row as TagRow, 0) };
  });

export const bcMobileCustomerTagRenameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ tagId: z.string().uuid(), name: tagNameSchema }).parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ tag: BcCustomerTag }>> => {
    const normalized = normalizeCustomerTagName(data.name);
    if (!normalized) return { ok: false, error: "invalid_input" };
    const display = data.name.trim().slice(0, CUSTOMER_MAX_TAG_NAME_LEN);

    const { data: clash } = await context.supabase
      .from(TAGS_TABLE)
      .select("id")
      .eq("owner_user_id", context.userId)
      .eq("normalized_name", normalized)
      .maybeSingle();
    if (clash && (clash as { id: string }).id !== data.tagId) {
      return { ok: false, error: "duplicate_tag" };
    }

    const { data: row, error } = await context.supabase
      .from(TAGS_TABLE)
      .update({ name: display, normalized_name: normalized })
      .eq("id", data.tagId)
      .eq("owner_user_id", context.userId)
      .select(TAG_COLUMNS)
      .maybeSingle();
    if (error) return { ok: false, error: "unavailable" };
    if (!row) return { ok: false, error: "not_found" };
    const counts = await ownerTagCounts(context.supabase, context.userId);
    return { ok: true, tag: toTagDto(row as TagRow, counts[data.tagId] ?? 0) };
  });

export const bcMobileCustomerTagDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ tagId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    const { error } = await context.supabase
      .from(TAGS_TABLE)
      .delete()
      .eq("id", data.tagId)
      .eq("owner_user_id", context.userId);
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true } as BcCustomerResult<Record<string, never>>;
  });

/** Đặt lại toàn bộ nhãn cho một khách hàng theo danh sách tên (tự tạo nhãn mới). */
export const bcMobileCustomerSetTagsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        customerId: z.string().uuid(),
        names: z.array(tagNameSchema).max(CUSTOMER_MAX_TAGS_PER_CUSTOMER * 3),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ tagIds: string[] }>> => {
    const { data: owned } = await context.supabase
      .from(TABLE)
      .select("id")
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!owned) return { ok: false, error: "not_found" };

    const wanted = new Map<string, string>();
    for (const raw of data.names) {
      const normalized = normalizeCustomerTagName(raw);
      if (!normalized || wanted.has(normalized)) continue;
      if (wanted.size >= CUSTOMER_MAX_TAGS_PER_CUSTOMER) break;
      wanted.set(normalized, raw.trim().slice(0, CUSTOMER_MAX_TAG_NAME_LEN));
    }

    const resolved: string[] = [];
    for (const [normalized, display] of wanted) {
      const { data: existing } = await context.supabase
        .from(TAGS_TABLE)
        .select("id")
        .eq("owner_user_id", context.userId)
        .eq("normalized_name", normalized)
        .maybeSingle();
      if (existing) {
        resolved.push((existing as { id: string }).id);
        continue;
      }
      const { data: created } = await context.supabase
        .from(TAGS_TABLE)
        .insert({ owner_user_id: context.userId, name: display, normalized_name: normalized })
        .select("id")
        .maybeSingle();
      if (created) resolved.push((created as { id: string }).id);
    }

    const { data: current } = await context.supabase
      .from(TAG_LINKS_TABLE)
      .select("tag_id")
      .eq("owner_user_id", context.userId)
      .eq("customer_id", data.customerId);
    const currentIds = ((current ?? []) as { tag_id: string }[]).map((r) => r.tag_id);
    const wantedSet = new Set(resolved);
    const toAdd = resolved.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !wantedSet.has(id));

    if (toAdd.length) {
      const { error } = await context.supabase.from(TAG_LINKS_TABLE).insert(
        toAdd.map((tag_id) => ({
          owner_user_id: context.userId,
          customer_id: data.customerId,
          tag_id,
        })),
      );
      if (error) return { ok: false, error: "unavailable" };
    }
    if (toRemove.length) {
      const { error } = await context.supabase
        .from(TAG_LINKS_TABLE)
        .delete()
        .eq("owner_user_id", context.userId)
        .eq("customer_id", data.customerId)
        .in("tag_id", toRemove);
      if (error) return { ok: false, error: "unavailable" };
    }

    return { ok: true, tagIds: resolved };
  });

// ── Điểm đau & nhu cầu ──────────────────────────────────────────────────────
// Riêng tư tuyệt đối theo chủ sở hữu; luôn kiểm tra khách hàng thuộc về owner
// trước khi ghi.

const NEEDS_TABLE = "bc_customer_needs";
const NEED_COLUMNS =
  "id, customer_id, kind, body, priority, status, resolved_at, created_at, updated_at";

type NeedRow = {
  id: string;
  customer_id: string;
  kind: string;
  body: string;
  priority: string;
  status: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

function toNeedDto(row: NeedRow): BcCustomerNeed {
  return {
    id: row.id,
    customerId: row.customer_id,
    kind: row.kind === "pain" ? "pain" : "need",
    body: row.body,
    priority: (["low", "medium", "high"].includes(row.priority)
      ? row.priority
      : "medium") as BcCustomerNeed["priority"],
    status: row.status === "resolved" ? "resolved" : "open",
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ownsCustomer(
  supabase: { from: (t: string) => any },
  userId: string,
  customerId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from(TABLE)
    .select("id")
    .eq("id", customerId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export const bcMobileCustomerNeedsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ needs: BcCustomerNeed[] }>> => {
    const { data: rows, error } = await context.supabase
      .from(NEEDS_TABLE)
      .select(NEED_COLUMNS)
      .eq("owner_user_id", context.userId)
      .eq("customer_id", data.customerId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true, needs: ((rows ?? []) as NeedRow[]).map(toNeedDto) };
  });

export const bcMobileCustomerNeedAddFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        customerId: z.string().uuid(),
        kind: z.enum(CUSTOMER_NEED_KINDS),
        body: z.string().min(1).max(CUSTOMER_NEED_MAX_BODY_LEN),
        priority: z.enum(CUSTOMER_NEED_PRIORITIES).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ need: BcCustomerNeed }>> => {
    if (!(await ownsCustomer(context.supabase, context.userId, data.customerId))) {
      return { ok: false, error: "not_found" };
    }
    const body = sanitizeCustomerText(data.body, CUSTOMER_NEED_MAX_BODY_LEN);
    if (!body) return { ok: false, error: "invalid_input" };
    const { data: row, error } = await context.supabase
      .from(NEEDS_TABLE)
      .insert({
        owner_user_id: context.userId,
        customer_id: data.customerId,
        kind: data.kind,
        body,
        priority: data.priority ?? "medium",
      })
      .select(NEED_COLUMNS)
      .maybeSingle();
    if (error || !row) return { ok: false, error: "unavailable" };
    return { ok: true, need: toNeedDto(row as NeedRow) };
  });

export const bcMobileCustomerNeedUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        needId: z.string().uuid(),
        body: z.string().max(CUSTOMER_NEED_MAX_BODY_LEN).optional(),
        priority: z.enum(CUSTOMER_NEED_PRIORITIES).optional(),
        status: z.enum(["open", "resolved"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ need: BcCustomerNeed }>> => {
    const patch: {
      body?: string;
      priority?: string;
      status?: string;
      resolved_at?: string | null;
    } = {};
    if (data.body !== undefined) {
      const body = sanitizeCustomerText(data.body, CUSTOMER_NEED_MAX_BODY_LEN);
      if (!body) return { ok: false, error: "invalid_input" };
      patch.body = body;
    }
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.status !== undefined) {
      patch.status = data.status;
      patch.resolved_at = data.status === "resolved" ? new Date().toISOString() : null;
    }
    const { data: row, error } = await context.supabase
      .from(NEEDS_TABLE)
      .update(patch)
      .eq("id", data.needId)
      .eq("owner_user_id", context.userId)
      .select(NEED_COLUMNS)
      .maybeSingle();
    if (error) return { ok: false, error: "unavailable" };
    if (!row) return { ok: false, error: "not_found" };
    return { ok: true, need: toNeedDto(row as NeedRow) };
  });

export const bcMobileCustomerNeedDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ needId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    const { error } = await context.supabase
      .from(NEEDS_TABLE)
      .delete()
      .eq("id", data.needId)
      .eq("owner_user_id", context.userId);
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true } as BcCustomerResult<Record<string, never>>;
  });

/** BC-Mobile-8A — Gợi ý nhãn từ lịch sử chăm sóc + ghi chú (chỉ chủ tài khoản). */
export const bcMobileCustomerTagSuggestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        customerId: z.string().uuid(),
        sources: z
          .object({ note: z.boolean(), logs: z.boolean(), needs: z.boolean() })
          .partial()
          .optional(),
      })
      .parse(data),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<
      BcCustomerResult<{
        runId: string | null;
        suggestions: { name: string; reason: string; existing: boolean; confidence: number }[];
      }>
    > => {
      const { data: row } = await context.supabase
        .from(TABLE)
        .select("id, display_name, company_name, stage, note")
        .eq("id", data.customerId)
        .eq("owner_user_id", context.userId)
        .maybeSingle();
      if (!row) return { ok: false, error: "not_found" };
      const customer = row as {
        display_name: string | null;
        company_name: string | null;
        stage: string;
        note: string | null;
      };

      const [
        { data: logRows },
        { data: needRows },
        { data: tagRows },
        { data: linkRows },
        { data: feedbackRows },
      ] =
        await Promise.all([
          context.supabase
            .from(LOGS_TABLE)
            .select("kind, body, occurred_at")
            .eq("owner_user_id", context.userId)
            .eq("customer_id", data.customerId)
            .order("occurred_at", { ascending: false })
            .limit(30),
          context.supabase
            .from(NEEDS_TABLE)
            .select("kind, body, priority, status")
            .eq("owner_user_id", context.userId)
            .eq("customer_id", data.customerId)
            .limit(30),
          context.supabase
            .from(TAGS_TABLE)
            .select("id, name")
            .eq("owner_user_id", context.userId)
            .limit(CUSTOMER_MAX_TAGS_PER_OWNER),
          context.supabase
            .from(TAG_LINKS_TABLE)
            .select("tag_id")
            .eq("owner_user_id", context.userId)
            .eq("customer_id", data.customerId),
          context.supabase
            .from(TAG_SUGGESTION_FEEDBACK_TABLE)
            .select("tag_name, verdict")
            .eq("owner_user_id", context.userId)
            .eq("customer_id", data.customerId)
            .limit(100),
        ]);

      const feedback = (feedbackRows ?? []) as { tag_name: string; verdict: string }[];

      const tags = (tagRows ?? []) as { id: string; name: string }[];
      const linkedIds = new Set(((linkRows ?? []) as { tag_id: string }[]).map((l) => l.tag_id));

      const useNote = data.sources?.note ?? true;
      const useLogs = data.sources?.logs ?? true;
      const useNeeds = data.sources?.needs ?? true;

      const { suggestCustomerTags } = await import("./customer-tag-suggest.server");
      const result = await suggestCustomerTags({
        stageLabel: customer.stage,
        displayName: customer.display_name ?? "",
        companyName: customer.company_name ?? "",
        note: useNote ? (customer.note ?? "") : "",
        logs: ((logRows ?? []) as { kind: string; body: string | null; occurred_at: string }[])
          .map((l) => `${l.occurred_at?.slice(0, 10) ?? ""} ${l.kind}: ${l.body ?? ""}`.trim())
          .slice(0, useLogs ? 30 : 0),
        needs: (
          (needRows ?? []) as {
            kind: string;
            body: string;
            priority: string;
            status: string;
          }[]
        )
          .map((n) => `${n.kind} (${n.priority}, ${n.status}): ${n.body}`)
          .slice(0, useNeeds ? 30 : 0),
        existingTagNames: tags.map((tg) => tg.name),
        currentTagNames: tags.filter((tg) => linkedIds.has(tg.id)).map((tg) => tg.name),
        approvedTagNames: feedback.filter((f) => f.verdict === "good").map((f) => f.tag_name),
        rejectedTagNames: feedback.filter((f) => f.verdict === "bad").map((f) => f.tag_name),
      });

      if (!result.ok) {
        return {
          ok: false,
          error: result.error === "no_context" ? "invalid_input" : "unavailable",
        };
      }

      // Lưu lịch sử gợi ý (chỉ chủ tài khoản xem lại được).
      const rejected = new Set(
        feedback.filter((f) => f.verdict === "bad").map((f) => f.tag_name.toLowerCase()),
      );
      const suggestions = result.suggestions.filter((s) => !rejected.has(s.name.toLowerCase()));

      const { data: runRow } = await context.supabase
        .from(TAG_SUGGESTION_RUNS_TABLE)
        .insert({
          owner_user_id: context.userId,
          customer_id: data.customerId,
          suggestions,
        })
        .select("id")
        .maybeSingle();

      return {
        ok: true,
        runId: (runRow as { id?: string } | null)?.id ?? null,
        suggestions,
      };
    },
  );

/** BC-Mobile-8A — Lịch sử các lần hệ thống gợi ý nhãn cho một khách hàng. */
export const bcMobileCustomerTagSuggestHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(
    async ({ data, context }): Promise<BcCustomerResult<{ runs: BcCustomerTagSuggestionRun[] }>> => {
      const { data: rows, error } = await context.supabase
        .from(TAG_SUGGESTION_RUNS_TABLE)
        .select("id, customer_id, suggestions, created_at")
        .eq("owner_user_id", context.userId)
        .eq("customer_id", data.customerId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return { ok: false, error: "unavailable" };
      const runs: BcCustomerTagSuggestionRun[] = (
        (rows ?? []) as {
          id: string;
          customer_id: string;
          suggestions: unknown;
          created_at: string;
        }[]
      ).map((r) => ({
        id: r.id,
        customerId: r.customer_id,
        createdAt: r.created_at,
        suggestions: Array.isArray(r.suggestions)
          ? (r.suggestions as { name?: unknown; reason?: unknown; confidence?: unknown }[])
              .map((s) => ({
                name: typeof s.name === "string" ? s.name : "",
                reason: typeof s.reason === "string" ? s.reason : "",
                confidence: typeof s.confidence === "number" ? s.confidence : undefined,
              }))
              .filter((s) => s.name.length > 0)
          : [],
      }));
      return { ok: true, runs };
    },
  );

/** BC-Mobile-8A — Phản hồi Đúng/Sai cho một nhãn được gợi ý (riêng tư). */
export const bcMobileCustomerTagSuggestFeedbackFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        customerId: z.string().uuid(),
        runId: z.string().uuid().nullish(),
        tagName: z.string().trim().min(1).max(48),
        verdict: z.enum(["good", "bad"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    const { data: owned } = await context.supabase
      .from(TABLE)
      .select("id")
      .eq("id", data.customerId)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!owned) return { ok: false, error: "not_found" };

    const { error } = await context.supabase.from(TAG_SUGGESTION_FEEDBACK_TABLE).upsert(
      {
        owner_user_id: context.userId,
        customer_id: data.customerId,
        run_id: data.runId ?? null,
        tag_name: data.tagName,
        verdict: data.verdict,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_user_id,customer_id,tag_name" },
    );
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true } as BcCustomerResult<Record<string, never>>;
  });

/** BC-Mobile-8A — Danh sách phản hồi nhãn đã ghi nhận của một khách hàng. */
export const bcMobileCustomerTagSuggestFeedbackListFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcCustomerResult<{ feedback: BcCustomerTagSuggestionFeedback[] }>> => {
      const { data: rows, error } = await context.supabase
        .from(TAG_SUGGESTION_FEEDBACK_TABLE)
        .select("tag_name, verdict")
        .eq("owner_user_id", context.userId)
        .eq("customer_id", data.customerId)
        .limit(200);
      if (error) return { ok: false, error: "unavailable" };
      const feedback = ((rows ?? []) as { tag_name: string; verdict: string }[]).map((r) => ({
        tagName: r.tag_name,
        verdict: r.verdict === "good" ? ("good" as const) : ("bad" as const),
      }));
      return { ok: true, feedback };
    },
  );
