// BC-Mobile-6C — Personalization RPC (thin wrappers only).
//
// Auth from requireSupabaseAuth; Zod-allowlisted input; ALL domain logic in
// relationship-personalization.service (+ .server adapter). Settings reads
// fail open to defaults; the settings UI shows its own error/retry state.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createSupabasePersonalizationService } from "./relationship-personalization.server";
import type {
  BcMobileGetPersonalizationResult,
  BcMobileRecordInteractionResult,
  BcMobileResetPersonalizationResult,
  BcMobileUpdateRelationshipIntelPreferencesResult,
} from "./relationship-personalization.types";

const updateSchema = z
  .object({
    recommendationsEnabled: z.boolean().optional(),
    reconnectEnabled: z.boolean().optional(),
    reconnectCadence: z.enum(["auto", "more_often", "normal", "less_often"]).optional(),
    preferredContactAction: z.enum(["auto", "call", "email"]).optional(),
    behavioralAdaptationEnabled: z.boolean().optional(),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    message: "At least one preference field is required",
  });

const recordSchema = z.object({
  kind: z.enum([
    "recommendation_opened",
    "recommendation_dismissed",
    "action_call_selected",
    "action_email_selected",
    "action_person_opened",
    "action_moment_selected",
  ]),
  recommendationType: z.literal("reconnect").nullish(),
});

export const bcRelPersonalizationGetFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcMobileGetPersonalizationResult> => {
    return createSupabasePersonalizationService(context.supabase).getPersonalization(
      context.userId,
    );
  });

export const bcRelPersonalizationUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }): Promise<BcMobileUpdateRelationshipIntelPreferencesResult> => {
    return createSupabasePersonalizationService(context.supabase).updatePreferences(
      context.userId,
      data,
    );
  });

export const bcRelPersonalizationRecordInteractionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => recordSchema.parse(input))
  .handler(async ({ data, context }): Promise<BcMobileRecordInteractionResult> => {
    return createSupabasePersonalizationService(context.supabase).recordInteraction(
      context.userId,
      data.kind,
      data.recommendationType ?? null,
    );
  });

export const bcRelPersonalizationResetFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcMobileResetPersonalizationResult> => {
    return createSupabasePersonalizationService(context.supabase).reset(context.userId);
  });
