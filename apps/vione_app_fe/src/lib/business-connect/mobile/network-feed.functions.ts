// BC-Mobile-7E — Network feed RPC (thin wrapper).

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { listNetworkFeedPage } from "./network-feed.server";

const feedInput = z.object({
  cursor: z.string().min(4).max(40).nullish(),
  limit: z.number().int().min(1).max(30).optional(),
});

export const bcMobileNetworkFeedFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => feedInput.parse(data ?? {}))
  .handler(async ({ data, context }) =>
    listNetworkFeedPage(context.supabase, {
      viewerId: context.userId,
      cursor: data.cursor ?? null,
      limit: data.limit,
    }),
  );
