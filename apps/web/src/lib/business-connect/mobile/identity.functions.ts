// BC-Mobile-5A — identity RPC (thin wrappers only).
//
// Auth context, input validation, rate budget, and typed failure mapping
// live here; ALL domain logic lives in identity.service / projection /
// validation. Owner operations derive the actor from requireSupabaseAuth —
// never from client input.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { allowPublicRequest } from "@/lib/public-rate-limit";
import {
  getMyIdentity,
  getOrCreateMyShareLink,
  getPublicIdentityByToken,
  rotateMyShareLink,
  updateMyVisibility,
  upsertMyIdentity,
} from "./identity.service";
import {
  identityUpdateSchema,
  publicTokenSchema,
  visibilityUpdateSchema,
} from "./identity.validation";
import type {
  IdentityShareLinkInfo,
  MyIdentityPayload,
  PublicIdentityResult,
} from "./identity.types";

// ---------------------------------------------------------------------------
// Owner endpoints (authenticated)
// ---------------------------------------------------------------------------

export const bcIdentityGetMineFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<MyIdentityPayload> => getMyIdentity(context.supabase, context.userId),
  );

export const bcIdentityUpsertFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => identityUpdateSchema.parse(data))
  .handler(
    ({ data, context }): Promise<MyIdentityPayload> =>
      upsertMyIdentity(context.supabase, context.userId, data),
  );

export const bcIdentityUpdateVisibilityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => visibilityUpdateSchema.parse(data))
  .handler(
    ({ data, context }): Promise<MyIdentityPayload> =>
      updateMyVisibility(context.supabase, context.userId, data),
  );

export const bcIdentityGetOrCreateShareLinkFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityShareLinkInfo> =>
      getOrCreateMyShareLink(context.supabase, context.userId),
  );

export const bcIdentityRotateShareLinkFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityShareLinkInfo> =>
      rotateMyShareLink(context.supabase, context.userId),
  );

// ---------------------------------------------------------------------------
// Public resolver (anonymous) — the ONLY public surface of the identity.
// Malformed tokens fail in the validator before any DB work. Per-client
// rate budget blunts token enumeration / scraping (best-effort per edge
// instance, same convention as the public .vcf endpoint).
// ---------------------------------------------------------------------------

const PUBLIC_RATE_LIMIT = 60;
const PUBLIC_RATE_WINDOW_MS = 10 * 60 * 1000;

export const bcIdentityPublicByTokenFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => publicTokenSchema.parse(data))
  .handler(async ({ data }): Promise<PublicIdentityResult> => {
    const { getRequestHeader, getRequestIP } = await import("@tanstack/react-start/server");
    const key =
      getRequestHeader("cf-connecting-ip") ||
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!allowPublicRequest(`bc-id-public:${key}`, PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW_MS)) {
      return { state: "unavailable" };
    }
    return getPublicIdentityByToken(data);
  });
