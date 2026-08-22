// BC-4.3 — Relationship Strength — Authenticated server-fn adapter.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { RelationshipStrengthResult } from "./types";

const input = z.object({
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  scoringVersion: z.string().max(16).optional(),
});

export const graphRelationshipStrengthFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => input.parse(i))
  .handler(async ({ data, context }): Promise<RelationshipStrengthResult> => {
    const { RelationshipStrengthService } = await import("./strength.service.server");
    const svc = new RelationshipStrengthService(context.supabase as never, context.userId);
    return svc.relationshipStrength(data);
  });
