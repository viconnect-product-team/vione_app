// BC-2.2 — Global Business Card Builder server functions.
//
// Thin adapters that enable an authenticated Platform User WITHOUT an
// association member row to create/list/edit/manage a Digital Business Card.
// All domain logic lives in BusinessCardService. Create/update/publish/hide/
// archive/setPrimary/delete are handled by the shared BusinessCard server
// functions (scope: "global"); this file adds the enablement + eligibility
// entry points that are specific to the global builder.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BusinessCardService } from "@/lib/business-card/business-card.service";
import type { BusinessCard, BusinessCardSummary } from "@/lib/business-card/business-card.types";

export type GlobalBuilderEligibility = {
  eligible: boolean;
  hasProfile: boolean;
  reason: "ok" | "account_inactive";
};

/**
 * Resolve whether the caller may use the global builder. An authenticated user
 * WITHOUT a member row is eligible. A suspended/deactivated account is not.
 * Never creates a member or profile row as a side effect.
 */
export const getGlobalBuilderEligibilityFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GlobalBuilderEligibility> => {
    const { requirePlatformUser } = await import("@/lib/identity/platform-identity.server");
    try {
      const profile = await requirePlatformUser(context.supabase, context.userId);
      return { eligible: true, hasProfile: profile !== null, reason: "ok" };
    } catch {
      return { eligible: false, hasProfile: false, reason: "account_inactive" };
    }
  });

/** List the authenticated user's owner-scoped (global) cards. */
export const listMyGlobalCardsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<BusinessCardSummary[]> =>
      BusinessCardService.listMyGlobalCards(context.supabase, context.userId),
  );

/** Get one global card owned by the authenticated user (works on drafts). */
export const getMyGlobalCardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(
    ({ data, context }): Promise<BusinessCard> =>
      BusinessCardService.getMyGlobalCard(context.supabase, context.userId, data.id),
  );

/**
 * Create a draft global card owned by auth.uid(). Prefills public profile fields
 * from the user's global profile; never auto-publishes; never creates a member.
 */
export const createGlobalCardDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<{ id: string }> =>
      BusinessCardService.createGlobalDraft(context.supabase, context.userId),
  );
