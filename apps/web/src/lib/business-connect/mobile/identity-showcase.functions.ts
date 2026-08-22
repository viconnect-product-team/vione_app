// BC-Mobile — RPC mỏng cho showcase của chủ sở hữu (actor lấy từ auth).

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getMyIdentityShowcase } from "./identity-showcase.service";
import type { IdentityShowcasePayload } from "./identity-showcase.service";

export const bcIdentityShowcaseGetMineFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityShowcasePayload> =>
      getMyIdentityShowcase(context.supabase, context.userId),
  );
