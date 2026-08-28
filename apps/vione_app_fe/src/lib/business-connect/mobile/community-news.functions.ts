// BC-Mobile-7B+ — Community news server-fn thin wrappers.
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type { CommunityNewsDetailDTO, CommunityNewsPageDTO } from "./community-news.types";

const listInput = z.object({
  communityId: z.string().uuid(),
  offset: z.number().int().min(0).max(100_000).optional(),
});

export const listCommunityNewsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => listInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityNewsPageDTO | null> => {
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    if (data.offset !== undefined) queryParams.set("offset", String(data.offset));
    return fetchNestApiFromServer(`/connect-app/community/news/list?${queryParams.toString()}`, context.token);
  });

const detailInput = z.object({
  communityId: z.string().uuid(),
  newsRef: z.string().min(1).max(64),
});

export const getCommunityNewsDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => detailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityNewsDetailDTO | null> => {
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    queryParams.set("newsRef", data.newsRef);
    return fetchNestApiFromServer(`/connect-app/community/news/detail?${queryParams.toString()}`, context.token);
  });
