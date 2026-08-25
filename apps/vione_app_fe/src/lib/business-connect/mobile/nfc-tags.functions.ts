// BC-Mobile-5C — NFC tag registry RPC (thin wrappers only).
// Actor always from requireSupabaseAuth, never from client input.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  listMyNfcTags,
  registerMyNfcTag,
  renameMyNfcTag,
  revokeMyNfcTag,
} from "./nfc-tags.service";
import {
  nfcTagRegisterSchema,
  nfcTagRenameSchema,
  nfcTagRevokeSchema,
} from "./nfc-tags.validation";
import type { IdentityNfcTagInfo } from "./nfc-tags.types";

export const bcIdentityNfcTagsListFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityNfcTagInfo[]> => listMyNfcTags(context.supabase, context.userId),
  );

export const bcIdentityNfcTagRegisterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRegisterSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      registerMyNfcTag(context.supabase, context.userId, data),
  );

export const bcIdentityNfcTagRevokeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRevokeSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      revokeMyNfcTag(context.supabase, context.userId, data.tagId),
  );

export const bcIdentityNfcTagRenameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRenameSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      renameMyNfcTag(context.supabase, context.userId, data),
  );
