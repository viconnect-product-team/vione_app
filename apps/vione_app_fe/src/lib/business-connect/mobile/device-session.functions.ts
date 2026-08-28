// Phiên & thiết bị — RPC mỏng (thin wrappers only).
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type { DeviceSessionInfo } from "./device-session.types";

const deviceKeySchema = z.string().min(6).max(120);

const listSchema = z.object({ deviceKey: deviceKeySchema.nullable().optional() });

const heartbeatSchema = z.object({
  deviceKey: deviceKeySchema,
  label: z.string().max(120).nullable().optional(),
  platform: z.string().max(60).nullable().optional(),
  browser: z.string().max(60).nullable().optional(),
  isStandalone: z.boolean().optional(),
});

const revokeSchema = z.object({
  sessionId: z.string().uuid(),
  deviceKey: deviceKeySchema.nullable().optional(),
});

export const bcDeviceSessionsListFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(
    ({ data, context }): Promise<DeviceSessionInfo[]> =>
      fetchNestApiFromServer("/connect-app/me/device-session/list", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcDeviceSessionTouchFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => heartbeatSchema.parse(data))
  .handler(
    ({ data, context }): Promise<{ revoked: boolean }> =>
      fetchNestApiFromServer("/connect-app/me/device-session/touch", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcDeviceSessionRevokeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => revokeSchema.parse(data))
  .handler(
    ({ data, context }): Promise<DeviceSessionInfo> =>
      fetchNestApiFromServer("/connect-app/me/device-session/revoke", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );
