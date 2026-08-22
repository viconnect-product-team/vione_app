// BC-Mobile-7B+ — Server-fn wrappers cho yêu cầu tham gia cộng đồng.
// Module scope: chỉ import, kiểu, và server functions.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  CommunityJoinAdminRequestDTO,
  CommunityJoinCandidateDTO,
  CommunityJoinHistoryItemDTO,
  CommunityJoinStatus,
} from "./community-join.types";

export const listJoinableCommunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinCandidateDTO[]> => {
    const { listJoinableCommunities } = await import("./community-join.server");
    return listJoinableCommunities(context.supabase as never, context.userId);
  });

export const requestCommunityJoinFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        communityId: z.string().uuid(),
        note: z.string().trim().max(500).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }): Promise<{ status: CommunityJoinStatus }> => {
    const { requestCommunityJoin } = await import("./community-join.server");
    return requestCommunityJoin({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      note: data.note ?? null,
    });
  });

export const cancelCommunityJoinFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        communityId: z.string().uuid(),
        cancelReason: z.string().trim().max(500).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }): Promise<{ status: CommunityJoinStatus }> => {
    const { cancelCommunityJoinRequest } = await import("./community-join.server");
    return cancelCommunityJoinRequest({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      cancelReason: data.cancelReason ?? null,
    });
  });

export const listCommunityJoinHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinHistoryItemDTO[]> => {
    const { listCommunityJoinHistory } = await import("./community-join.server");
    return listCommunityJoinHistory(context.supabase as never, context.userId);
  });

export const syncCommunityJoinDecisionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<Array<{ communityId: string; name: string; status: "approved" | "rejected" }>> => {
      const { syncCommunityJoinDecisionNotifications } = await import("./community-join.server");
      return syncCommunityJoinDecisionNotifications(context.supabase as never, context.userId);
    },
  );

export const listCommunityJoinAdminRequestsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinAdminRequestDTO[]> => {
    const { listCommunityJoinAdminRequests } = await import("./community-join.server");
    return listCommunityJoinAdminRequests(context.supabase as never, context.userId);
  });
