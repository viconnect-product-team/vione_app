// BC-Mobile-8A — RPC mỏng cho "Khách hàng của tôi".
// Directs all requests to backend NestJS RESTful API.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import {
  CUSTOMER_MAX_NAME_LEN,
  CUSTOMER_MAX_NOTE_LEN,
  CUSTOMER_MAX_SOURCE_LEN,
  CUSTOMER_MAX_TAG_NAME_LEN,
  CUSTOMER_MAX_TAGS_PER_CUSTOMER,
  CUSTOMER_NEED_MAX_BODY_LEN,
  CUSTOMER_STAGES,
  CUSTOMER_NEED_KINDS,
  CUSTOMER_NEED_PRIORITIES,
  type BcCustomer,
  type BcCustomerLog,
  type BcCustomerTag,
  type BcCustomerTagSuggestionRun,
  type BcCustomerTagSuggestionFeedback,
  type BcCustomerNeed,
  type BcCustomerResult,
} from "./customer.types";

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);
const stageSchema = z.enum(CUSTOMER_STAGES);
const isoSchema = z.string().min(4).max(40);

// ── List ────────────────────────────────────────────────----------------────
export const bcMobileCustomersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcCustomerResult<{ customers: BcCustomer[] }>> => {
    return fetchNestApiFromServer("/connect-app/customer/list", context.token, {
      method: "POST",
    });
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
    return fetchNestApiFromServer("/connect-app/customer/create", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
    return fetchNestApiFromServer("/connect-app/customer/update", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ── Delete ──────────────────────────────────────────────────────────────────
export const bcMobileCustomerDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    return fetchNestApiFromServer("/connect-app/customer/delete", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ── Care log ────────────────────────────────────────────────────────────────
export const bcMobileCustomerLogsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ logs: BcCustomerLog[] }>> => {
    return fetchNestApiFromServer("/connect-app/customer/logs", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
    return fetchNestApiFromServer("/connect-app/customer/log-add", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ── Nhãn / phân nhóm khách hàng ─────────────────────────────────────────────
export const bcMobileCustomerTagsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcCustomerResult<{ tags: BcCustomerTag[] }>> => {
    return fetchNestApiFromServer("/connect-app/customer/tags", context.token, {
      method: "POST",
    });
  });

const tagNameSchema = z.string().min(1).max(CUSTOMER_MAX_TAG_NAME_LEN + 40);

export const bcMobileCustomerTagCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: tagNameSchema }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ tag: BcCustomerTag }>> => {
    return fetchNestApiFromServer("/connect-app/customer/tag-create", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const bcMobileCustomerTagRenameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ tagId: z.string().uuid(), name: tagNameSchema }).parse(data),
  )
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ tag: BcCustomerTag }>> => {
    return fetchNestApiFromServer("/connect-app/customer/tag-rename", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const bcMobileCustomerTagDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ tagId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    return fetchNestApiFromServer("/connect-app/customer/tag-delete", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

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
    return fetchNestApiFromServer("/connect-app/customer/set-tags", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ── Điểm đau & nhu cầu ──────────────────────────────────────────────────────
export const bcMobileCustomerNeedsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<{ needs: BcCustomerNeed[] }>> => {
    return fetchNestApiFromServer("/connect-app/customer/needs", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
    return fetchNestApiFromServer("/connect-app/customer/need-add", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
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
    return fetchNestApiFromServer("/connect-app/customer/need-update", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const bcMobileCustomerNeedDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ needId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BcCustomerResult<Record<string, never>>> => {
    return fetchNestApiFromServer("/connect-app/customer/need-delete", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ── AI Tag Suggestion ──
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
      return fetchNestApiFromServer("/connect-app/customer/tag-suggest", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

export const bcMobileCustomerTagSuggestHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(
    async ({ data, context }): Promise<BcCustomerResult<{ runs: BcCustomerTagSuggestionRun[] }>> => {
      const queryParams = new URLSearchParams();
      queryParams.set("customerId", data.customerId);
      return fetchNestApiFromServer(`/connect-app/customer/tag-suggest-history?${queryParams.toString()}`, context.token);
    },
  );

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
    return fetchNestApiFromServer("/connect-app/customer/tag-suggest-feedback", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const bcMobileCustomerTagSuggestFeedbackListFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ customerId: z.string().uuid() }).parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcCustomerResult<{ feedback: BcCustomerTagSuggestionFeedback[] }>> => {
      const queryParams = new URLSearchParams();
      queryParams.set("customerId", data.customerId);
      return fetchNestApiFromServer(`/connect-app/customer/tag-suggest-feedback-list?${queryParams.toString()}`, context.token);
    },
  );
