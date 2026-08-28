// BC-Mobile-7B+ — Server-fn wrappers cho yêu cầu tham gia cộng đồng.
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type {
  CommunityJoinAdminRequestDTO,
  CommunityJoinCandidateDTO,
  CommunityJoinHistoryItemDTO,
  CommunityJoinStatus,
} from "./community-join.types";

export const listJoinableCommunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinCandidateDTO[]> => {
    return fetchNestApiFromServer("/connect-app/community/join/list", context.token);
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
    return fetchNestApiFromServer("/connect-app/community/join/request", context.token, {
      method: "POST",
      body: JSON.stringify(data),
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
    return fetchNestApiFromServer("/connect-app/community/join/cancel", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const listCommunityJoinHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinHistoryItemDTO[]> => {
    return fetchNestApiFromServer("/connect-app/community/join/history", context.token);
  });

export const syncCommunityJoinDecisionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<Array<{ communityId: string; name: string; status: "approved" | "rejected" }>> => {
      return fetchNestApiFromServer("/connect-app/community/join/sync-decisions", context.token, {
        method: "POST",
      });
    },
  );

export const listCommunityJoinAdminRequestsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommunityJoinAdminRequestDTO[]> => {
    return fetchNestApiFromServer("/connect-app/community/join/admin-requests", context.token);
  });
