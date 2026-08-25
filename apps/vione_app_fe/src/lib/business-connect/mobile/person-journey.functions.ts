// BC-Mobile-2D — Person Journey RPC boundary (thin adapter).
//
// Read-only GET. All composition lives in person-journey.server.ts, loaded
// inside the handler so the server-only module never enters client bundles.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BcMobilePersonJourneyResult } from "./person-journey.types";

const inputSchema = z.object({
  personId: z
    .string()
    .regex(/^[uc]:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
  cursor: z.string().max(2048).nullable().optional(),
  limit: z.number().int().positive().max(20).optional(),
});

export const bcMobilePersonJourneyFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => inputSchema.parse(i))
  .handler(async ({ data, context }): Promise<BcMobilePersonJourneyResult> => {
    const { getBcMobilePersonJourneyPage } = await import("./person-journey.server");
    return getBcMobilePersonJourneyPage(context.supabase as never, context.userId, {
      personId: data.personId,
      cursor: data.cursor ?? null,
      limit: data.limit,
    });
  });
