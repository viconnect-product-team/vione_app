// BC-Mobile-6D — RPC mỏng cho kế hoạch riêng theo từng người.
// Directs all requests to backend NestJS RESTful API.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import {
  PERSON_PLAN_MAX_LOCATION_LEN,
  PERSON_PLAN_MAX_NOTE_LEN,
  PERSON_PLAN_MAX_TITLE_LEN,
  type BcMobilePersonPlan,
  type BcMobilePersonPlanResult,
} from "./person-plan.types";

const personIdSchema = z.string().regex(/^[ucg]:[0-9a-fA-F-]{36}$/);

const createInput = z.object({
  personId: personIdSchema,
  kind: z.enum(["follow_up", "meeting"]),
  dueAt: z.string().min(4).max(40),
  title: z
    .string()
    .max(PERSON_PLAN_MAX_TITLE_LEN + 20)
    .nullish(),
  note: z
    .string()
    .max(PERSON_PLAN_MAX_NOTE_LEN + 40)
    .nullish(),
  locationLabel: z
    .string()
    .max(PERSON_PLAN_MAX_LOCATION_LEN + 20)
    .nullish(),
});

export const bcMobilePersonPlanCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plan: BcMobilePersonPlan }>> => {
      return fetchNestApiFromServer("/connect-app/network/person-plan/create", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const listInput = z.object({
  personId: personIdSchema.nullish(),
  includeClosed: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
});

export const bcMobilePersonPlansFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => listInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plans: BcMobilePersonPlan[] }>> => {
      return fetchNestApiFromServer("/connect-app/network/person-plan/list", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const statusInput = z.object({
  planId: z.string().uuid(),
  status: z.enum(["pending", "done", "cancelled"]),
});

export const bcMobilePersonPlanSetStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => statusInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcMobilePersonPlanResult<{ plan: BcMobilePersonPlan }>> => {
      return fetchNestApiFromServer("/connect-app/network/person-plan/set-status", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );
