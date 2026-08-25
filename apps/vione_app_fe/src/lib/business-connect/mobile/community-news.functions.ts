// BC-Mobile-7B+ — Community news server-fn thin wrappers.
// Module scope: imports, erased types, exported server functions only.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CommunityNewsDetailDTO, CommunityNewsPageDTO } from "./community-news.types";

const listInput = z.object({
  communityId: z.string().uuid(),
  offset: z.number().int().min(0).max(100_000).optional(),
});

export const listCommunityNewsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => listInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityNewsPageDTO | null> => {
    const { listCommunityNews } = await import("./community-news.server");
    return listCommunityNews({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      offset: data.offset,
    });
  });

const detailInput = z.object({
  communityId: z.string().uuid(),
  newsRef: z.string().min(1).max(64),
});

export const getCommunityNewsDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => detailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityNewsDetailDTO | null> => {
    const { getCommunityNewsDetail } = await import("./community-news.server");
    return getCommunityNewsDetail({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      newsRef: data.newsRef,
    });
  });
