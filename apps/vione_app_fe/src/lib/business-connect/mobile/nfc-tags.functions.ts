// BC-Mobile-5C — NFC tag registry RPC (thin wrappers only).
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import {
  nfcTagRegisterSchema,
  nfcTagRenameSchema,
  nfcTagRevokeSchema,
} from "./nfc-tags.validation";
import type { IdentityNfcTagInfo } from "./nfc-tags.types";

export const bcIdentityNfcTagsListFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<IdentityNfcTagInfo[]> =>
      fetchNestApiFromServer("/connect-app/me/nfc-tags", context.token),
  );

export const bcIdentityNfcTagRegisterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRegisterSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      fetchNestApiFromServer("/connect-app/me/nfc-tags", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcIdentityNfcTagRevokeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRevokeSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      fetchNestApiFromServer(`/connect-app/me/nfc-tags/${data.tagId}`, context.token, {
        method: "DELETE",
      }),
  );

export const bcIdentityNfcTagRenameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => nfcTagRenameSchema.parse(data))
  .handler(
    ({ data, context }): Promise<IdentityNfcTagInfo> =>
      fetchNestApiFromServer(`/connect-app/me/nfc-tags/${data.tagId}`, context.token, {
        method: "PATCH",
        body: JSON.stringify({ label: data.label }),
      }),
  );
