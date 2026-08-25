// BC-1.0 — Platform Identity server functions (client-callable RPCs).
// Backward-compatible: does NOT touch current_member_id / current_association_id.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildGlobalIdentityContext,
  getAssociationContexts,
  requirePlatformUser,
  resolveUserProfile,
} from "./platform-identity.server";
import type {
  GlobalIdentityContext,
  PlatformIdentity,
  UserProfile,
  AssociationIdentity,
} from "./identity.types";

/** Global identity context for the signed in user (no member required). */
export const getCurrentUserFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GlobalIdentityContext> => {
    const { supabase, userId, user } = context as unknown as any;
    await requirePlatformUser(supabase, userId);
    return buildGlobalIdentityContext(supabase, userId, user?.email ?? null);
  });

/** Read the current user's global profile (null if not created yet). */
export const getProfileFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UserProfile | null> => {
    const { supabase, userId } = context;
    return resolveUserProfile(supabase, userId);
  });

const profileUpdateSchema = z.object({
  displayName: z.string().max(200).nullish(),
  avatarUrl: z.string().url().max(1000).nullish(),
  professionalTitle: z.string().max(200).nullish(),
  companyName: z.string().max(200).nullish(),
  industry: z.string().max(120).nullish(),
  region: z.string().max(120).nullish(),
  bio: z.string().max(2000).nullish(),
  locale: z.string().max(20).optional(),
  timezone: z.string().max(60).optional(),
  onboardingStatus: z.enum(["new", "in_progress", "completed"]).optional(),
});

/** Create or update the current user's global profile (owner-scoped by RLS). */
export const upsertProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileUpdateSchema.parse(d))
  .handler(async ({ data, context }): Promise<UserProfile> => {
    const { supabase, userId } = context;
    type ProfileInsert =
      import("@/integrations/supabase/types").Database["public"]["Tables"]["user_profiles"]["Insert"];
    const payload: ProfileInsert = { user_id: userId };
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
    if (data.professionalTitle !== undefined) payload.professional_title = data.professionalTitle;
    if (data.companyName !== undefined) payload.company_name = data.companyName;
    if (data.industry !== undefined) payload.industry = data.industry;
    if (data.region !== undefined) payload.region = data.region;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.locale !== undefined) payload.locale = data.locale;
    if (data.timezone !== undefined) payload.timezone = data.timezone;
    if (data.onboardingStatus !== undefined) payload.onboarding_status = data.onboardingStatus;

    const { error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    const profile = await resolveUserProfile(supabase, userId);
    if (!profile) throw new Error("Failed to load profile after upsert");
    return profile;
  });

/** Association contexts for the current user (compatibility layer; [] is valid). */
export const getAssociationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AssociationIdentity[]> => {
    const { supabase, userId } = context;
    return getAssociationContexts(supabase, userId);
  });

/**
 * Full identity resolver. Never throws because a member/association is missing.
 * Communities are empty at BC-1.0 (reserved for BC-2+).
 */
export const resolvePlatformIdentityFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlatformIdentity> => {
    const { supabase, userId, user } = context as unknown as any;
    await requirePlatformUser(supabase, userId);
    const [global, associations] = await Promise.all([
      buildGlobalIdentityContext(supabase, userId, user?.email ?? null),
      getAssociationContexts(supabase, userId),
    ]);
    return { global, associations, communities: [] };
  });
