// BC-9.0 Turn B2 — Server functions for the AI SDK's generation, accept,
// reject, and read paths. Every generation function is authenticated, viewer
// scope is derived from `context.supabase` inside the handler, and the
// server-only execution service is loaded dynamically so client bundles stay
// clean.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BusinessConnectAICapability } from "@/lib/business-connect/intelligence/registry";
import type { IntelligenceScope, ViewerContext } from "@/lib/business-connect/intelligence/types";
import { fnv1a64Hex } from "@/lib/business-connect/intelligence/persistence-hash";

// ── Basic non-generation actions ────────────────────────────────────────────

const ResultIdInput = z.object({ resultId: z.string().uuid() });
const RejectInput = z.object({
  resultId: z.string().uuid(),
  reason: z.string().max(500).nullish(),
});

export const bcAiAcceptResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResultIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { acceptResult } =
      await import("@/lib/business-connect/intelligence/runtime/persistence.server");
    await acceptResult(context.supabase, data.resultId);
    return { resultId: data.resultId, status: "accepted" as const };
  });

export const bcAiRejectResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RejectInput.parse(input))
  .handler(async ({ data, context }) => {
    const { rejectResult } =
      await import("@/lib/business-connect/intelligence/runtime/persistence.server");
    await rejectResult(context.supabase, data.resultId, data.reason ?? null);
    return { resultId: data.resultId, status: "rejected" as const };
  });

export const bcAiGetResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResultIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getOwnedResult } =
      await import("@/lib/business-connect/intelligence/runtime/persistence.server");
    const row = await getOwnedResult(context.supabase, data.resultId);
    if (!row) throw new Error("BUSINESS_CONNECT_AI_FORBIDDEN");
    return row;
  });

// ── Generation path (shared) ────────────────────────────────────────────────

const SafeRefSchema = z.object({
  id: z.string(),
  label: z.string(),
  route: z.string().optional(),
});

const ScopeSchema: z.ZodType<IntelligenceScope> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("global_business_connect") }),
  z.object({ type: z.literal("person"), personRef: SafeRefSchema }),
  z.object({ type: z.literal("organization"), organizationRef: SafeRefSchema }),
  z.object({ type: z.literal("meeting"), meetingRef: SafeRefSchema }),
  z.object({ type: z.literal("introduction"), introductionRef: SafeRefSchema }),
  z.object({ type: z.literal("work_hub") }),
]);

const GenerateInput = z.object({
  capability: z.string(),
  scope: ScopeSchema,
  query: z.string().max(2000).nullish(),
  idempotencyKey: z.string().max(200).nullish(),
  locale: z.enum(["vi", "en"]).nullish(),
});

function deriveViewer(userId: string, locale: "vi" | "en"): ViewerContext {
  // Opaque, viewer-scoped ref. Never a raw auth uid downstream — we hash it.
  const opaque = fnv1a64Hex(`viewer:${userId}`);
  return {
    viewerRef: { id: opaque, label: "Bạn" },
    locale,
    tenantScopeOpaque: fnv1a64Hex(`tenant:${userId}`),
  };
}

export const bcAiGenerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { executeBusinessConnectAI } =
      await import("@/lib/business-connect/intelligence/runtime/execution-service.server");
    const viewer = deriveViewer(context.userId, data.locale ?? "vi");
    const result = await executeBusinessConnectAI({
      supabase: context.supabase,
      viewer,
      capability: data.capability as BusinessConnectAICapability,
      scope: data.scope,
      query: data.query ?? null,
      idempotencyKey: data.idempotencyKey ?? null,
    });

    const payload = (result.payload ?? null) as any;
    return {
      resultId: result.resultId,
      status: result.status,
      capability: result.capability,
      payload,
      meta: result.meta,
    };
  });
