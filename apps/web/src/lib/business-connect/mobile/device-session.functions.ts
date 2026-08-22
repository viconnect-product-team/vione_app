// Phiên & thiết bị — RPC mỏng (thin wrappers only).
// Chủ thể luôn từ requireSupabaseAuth, không bao giờ nhận từ client.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  listMyDeviceSessions,
  revokeMyDeviceSession,
  touchMyDeviceSession,
} from "./device-session.service";
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
      listMyDeviceSessions(context.supabase, context.userId, data.deviceKey ?? null),
  );

export const bcDeviceSessionTouchFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => heartbeatSchema.parse(data))
  .handler(
    ({ data, context }): Promise<{ revoked: boolean }> =>
      touchMyDeviceSession(context.supabase, context.userId, data),
  );

export const bcDeviceSessionRevokeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => revokeSchema.parse(data))
  .handler(
    ({ data, context }): Promise<DeviceSessionInfo> =>
      revokeMyDeviceSession(
        context.supabase,
        context.userId,
        data.sessionId,
        data.deviceKey ?? null,
      ),
  );
