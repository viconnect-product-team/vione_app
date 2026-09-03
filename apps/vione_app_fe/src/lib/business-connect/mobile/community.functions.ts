import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  CommunityDetailDTO,
  CommunityMemberPageDTO,
  CommunityMemberProfileDTO,
  CommunitySummaryDTO,
} from "./community.types";
import { fetchNestApiFromServer } from "../../api-client";

const communityIdSchema = z.string().uuid();

export const listMyCommunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunitySummaryDTO[]> => {
    const { token } = context as any;
    return fetchNestApiFromServer("/connect-app/community", token);
  });

export const getCommunityDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(async ({ data, context }): Promise<CommunityDetailDTO | null> => {
    const { token } = context as any;
    return fetchNestApiFromServer(`/connect-app/community/${data.communityId}`, token);
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
    const { token } = context as any;
    const queryParams = new URLSearchParams();
    if (data.query) queryParams.set("query", data.query);
    if (data.offset !== undefined) queryParams.set("offset", String(data.offset));
    if (data.roleFilter) queryParams.set("roleFilter", data.roleFilter);
    const queryString = queryParams.toString();
    const endpoint = `/connect-app/community/${data.communityId}/members${queryString ? `?${queryString}` : ""}`;
    return fetchNestApiFromServer(endpoint, token);
  });

const profileInput = z.object({
  communityId: communityIdSchema,
  memberRef: z.string().min(1).max(64),
});

export const getCommunityMemberProfileFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => profileInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityMemberProfileDTO | null> => {
    const { token } = context as any;
    return fetchNestApiFromServer(`/connect-app/community/${data.communityId}/members/${data.memberRef}`, token);
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
    const { token } = context as any;
    return fetchNestApiFromServer(`/connect-app/community/${data.communityId}/members/${data.memberRef}/connect`, token, {
      method: "POST",
      body: JSON.stringify({ mutationKey: data.mutationKey }),
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
    const { token } = context as any;
    return fetchNestApiFromServer(`/connect-app/community/${data.communityId}/members/${data.memberRef}/role`, token, {
      method: "PATCH",
      body: JSON.stringify({ role: data.role }),
    });
  });

