// BC-Mobile-4B — duplicate resolve + canonical save RPCs (thin).
// Directs all requests to backend NestJS RESTful API.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type {
  ScanDuplicateResolution,
  ScanSaveResponse,
} from "./card-scan.review";

const resolveInput = z.object({
  email: z.string().max(320).nullable(),
  phone: z.string().max(80).nullable(),
  displayName: z.string().max(240).nullish(),
  companyName: z.string().max(280).nullish(),
});

export const bcMobileCardScanResolveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => resolveInput.parse(data))
  .handler(async ({ data, context }): Promise<ScanDuplicateResolution> => {
    return fetchNestApiFromServer("/connect-app/card-scan/resolve", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

const FIELD_KEYS = [
  "displayName",
  "phone",
  "email",
  "companyName",
  "title",
  "website",
  "address",
] as const;

const saveInput = z.object({
  clientToken: z.string().uuid(),
  scanId: z.string().uuid(),
  displayName: z.string().max(240),
  phone: z.string().max(80).nullable(),
  email: z.string().max(320).nullable(),
  companyName: z.string().max(280).nullable(),
  title: z.string().max(240).nullable(),
  website: z.string().max(280).nullable(),
  address: z.string().max(320).nullable(),
  resolution: z.enum(["new", "update"]),
  targetPersonId: z.string().max(64).nullable(),
  confirmedNew: z.boolean().optional(),
  fieldChoices: z.record(z.enum(FIELD_KEYS), z.enum(["current", "card"])).nullish(),
});

export const bcMobileCardScanSaveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveInput.parse(data))
  .handler(async ({ data, context }): Promise<ScanSaveResponse> => {
    return fetchNestApiFromServer("/connect-app/card-scan/save", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
