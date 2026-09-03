import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  BcMobileDismissRecommendationResult,
  BcMobilePersonRecommendationResult,
  BcMobileTodayRecommendationsResult,
} from "./relationship-intelligence.types";
import { fetchNestApiFromServer } from "../../api-client";

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);
const localeSchema = z.enum(["vi", "en"]).optional();

export const bcRelationshipTodayRecommendationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: localeSchema }).parse(input ?? {}))
  .handler(async ({ data, context }): Promise<BcMobileTodayRecommendationsResult> => {
    try {
      const { token } = context as any;
      return await fetchNestApiFromServer("/connect-app/network/recommendations/today", token);
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
      const { token } = context as any;
      return await fetchNestApiFromServer(`/connect-app/network/recommendations/person/${data.personId}`, token);
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
    const { token } = context as any;
    return fetchNestApiFromServer(`/connect-app/network/recommendations/person/${data.personId}`, token, {
      method: "DELETE",
    });
  });

