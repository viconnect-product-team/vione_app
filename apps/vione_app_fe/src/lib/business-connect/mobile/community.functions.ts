// BC-Mobile-7A — Community server-fn thin wrappers (module scope: imports,
// erased types, exported server functions only). All logic lives in
// community.server.ts; actors always come from requireSupabaseAuth.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  CommunityDetailDTO,
  CommunityMemberPageDTO,
  CommunityMemberProfileDTO,
  CommunitySummaryDTO,
} from "./community.types";

const communityIdSchema = z.string().uuid();

export const listMyCommunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunitySummaryDTO[]> => {
    const { listMyCommunities } = await import("./community.server");
    return listMyCommunities(context.supabase as never, context.userId);
  });

export const getCommunityDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(async ({ data, context }): Promise<CommunityDetailDTO | null> => {
    const { getCommunityDetail } = await import("./community.server");
    return getCommunityDetail(context.supabase as never, context.userId, data.communityId);
  });

const membersInput = z.object({
  communityId: communityIdSchema,
  query: z.string().max(120).optional(),
  offset: z.number().int().min(0).max(100_000).optional(),
  roleFilter: z.enum(["all", "admin", "member"]).optional(),
});

export const listCommunityMembersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => membersInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityMemberPageDTO | null> => {
    const { listCommunityMembers } = await import("./community.server");
    return listCommunityMembers({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      query: data.query,
      offset: data.offset,
      roleFilter: data.roleFilter,
    });
  });

const profileInput = z.object({
  communityId: communityIdSchema,
  memberRef: z.string().min(1).max(64),
});

export const getCommunityMemberProfileFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => profileInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityMemberProfileDTO | null> => {
    const { getCommunityMemberProfile } = await import("./community.server");
    return getCommunityMemberProfile({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      memberRef: data.memberRef,
    });
  });

const connectInput = z.object({
  communityId: communityIdSchema,
  memberRef: z.string().min(1).max(64),
  mutationKey: z.string().max(64).optional(),
});

export const connectCommunityMemberFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => connectInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { connectCommunityMember } = await import("./community.server");
    return connectCommunityMember({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      memberRef: data.memberRef,
      mutationKey: data.mutationKey,
    });
  });

const roleUpdateInput = z.object({
  communityId: communityIdSchema,
  memberRef: z.string().min(1).max(64),
  role: z.enum(["admin", "member"]),
});

export const updateCommunityMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => roleUpdateInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { updateCommunityMemberRole } = await import("./community.server");
    return updateCommunityMemberRole({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      memberRef: data.memberRef,
      role: data.role,
    });
  });
