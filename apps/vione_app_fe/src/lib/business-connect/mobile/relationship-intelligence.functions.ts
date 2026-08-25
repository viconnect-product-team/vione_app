// BC-Mobile-6A — Relationship Intelligence RPC (thin wrappers only).
//
// Auth from requireSupabaseAuth; input validation here; ALL domain logic in
// relationship-intelligence.service (+ .server adapter). Reads collapse to
// neutral empty results on failure — recommendations never block surfaces
// and never leak internals.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  dismissRecommendation,
  getPersonRecommendation,
  getTodayRecommendations,
} from "./relationship-intelligence.server";
import type {
  BcMobileDismissRecommendationResult,
  BcMobilePersonRecommendationResult,
  BcMobileTodayRecommendationsResult,
} from "./relationship-intelligence.types";

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);
const localeSchema = z.enum(["vi", "en"]).optional();

export const bcRelationshipTodayRecommendationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: localeSchema }).parse(input ?? {}))
  .handler(async ({ data, context }): Promise<BcMobileTodayRecommendationsResult> => {
    try {
      return await getTodayRecommendations(context.supabase, context.userId, data.locale ?? "vi");
    } catch {
      return { recommendations: [] };
    }
  });

export const bcRelationshipPersonRecommendationFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ personId: personIdSchema, locale: localeSchema }).parse(input),
  )
  .handler(async ({ data, context }): Promise<BcMobilePersonRecommendationResult> => {
    try {
      return await getPersonRecommendation(
        context.supabase,
        context.userId,
        data.personId,
        data.locale ?? "vi",
      );
    } catch {
      return { recommendation: null };
    }
  });

export const bcRelationshipDismissRecommendationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        personId: personIdSchema,
        recommendationType: z.literal("reconnect"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<BcMobileDismissRecommendationResult> => {
    return dismissRecommendation(
      context.supabase,
      context.userId,
      data.personId,
      data.recommendationType,
    );
  });
