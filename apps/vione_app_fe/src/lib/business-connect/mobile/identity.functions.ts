// BC-Mobile-5A — identity RPC (thin wrappers only).
//
// Auth context, input validation, rate budget, and typed failure mapping
// live here; ALL domain logic lives in identity.service / projection /
// validation. Owner operations derive the actor from requireSupabaseAuth —
// never from client input.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
import { fetchNestApi, fetchNestApiFromServer } from "../../api-client";

// ---------------------------------------------------------------------------
// Owner endpoints (authenticated)
// ---------------------------------------------------------------------------

export const bcIdentityGetMineFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<MyIdentityPayload> =>
      fetchNestApiFromServer("/connect-app/me/identity", context.token),
  );

export const bcIdentityUpsertFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => identityUpdateSchema.parse(data))
  .handler(
    ({ data, context }): Promise<MyIdentityPayload> =>
      fetchNestApiFromServer("/connect-app/me/identity", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcIdentityUpdateVisibilityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => visibilityUpdateSchema.parse(data))
  .handler(
    ({ data, context }): Promise<MyIdentityPayload> =>
      fetchNestApiFromServer("/connect-app/me/identity/visibility", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcIdentityGetOrCreateShareLinkFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityShareLinkInfo> =>
      fetchNestApiFromServer("/connect-app/me/identity/share-link", context.token, {
        method: "POST",
      }),
  );

export const bcIdentityRotateShareLinkFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityShareLinkInfo> =>
      fetchNestApiFromServer("/connect-app/me/identity/share-link/rotate", context.token, {
        method: "POST",
      }),
  );

// ---------------------------------------------------------------------------
// Public resolver (anonymous) — the ONLY public surface of the identity.
// ---------------------------------------------------------------------------

export const bcIdentityPublicByTokenFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => publicTokenSchema.parse(data))
  .handler(async ({ data }): Promise<PublicIdentityResult> => {
    return fetchNestApi(`/connect-app/public/identity/${data}`);
  });
