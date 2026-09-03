// BC-3.1F — Global networking abuse & notification server-function adapters.
// Thin authenticated RPC boundary: requireSupabaseAuth then delegate to the
// AbuseService / NotificationService bound to the request-scoped client + userId.
// No business logic, no direct state machine, no service-role usage.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { AbuseService } from "./global-network/abuse";
import { NotificationService } from "./global-network/notifications";
import { GN_REPORT_CATEGORIES } from "./global-network/abuse.types";
import type { GnNotificationDTO, GnNotificationPrefs } from "./global-network/abuse.types";

const uuid = z.string().uuid();

export const reportUserFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        reportedUserId: uuid,
        category: z.enum(GN_REPORT_CATEGORIES),
        details: z.string().max(2000).optional(),
        connectionId: uuid.nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ reportId: string }> => {
    return AbuseService.reportUser(null as any, context.userId, data);
  });

export const listNetworkNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator(
    (input: unknown) =>
      z
        .object({ limit: z.number().int().min(1).max(100).optional() })
        .optional()
        .parse(input) ?? {},
  )
  .handler(async ({ data, context }): Promise<GnNotificationDTO[]> => {
    return NotificationService.list(null as any, context.userId, data);
  });

export const countUnreadNotificationsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<{ count: number }> => {
    const count = await NotificationService.unreadCount(null as any, context.userId);
    return { count };
  });

export const markNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator(
    (input: unknown) =>
      z
        .object({ ids: z.array(uuid).max(200).optional() })
        .optional()
        .parse(input) ?? {},
  )
  .handler(async ({ data, context }): Promise<{ updated: number }> => {
    const updated = await NotificationService.markRead(null as any, context.userId, data.ids);
    return { updated };
  });

export const getNotificationPrefsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<GnNotificationPrefs> => {
    return NotificationService.getPrefs(null as any, context.userId);
  });

export const setNotificationPrefsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        connectionRequest: z.boolean(),
        connectionAccepted: z.boolean(),
        connectionStatusUpdate: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GnNotificationPrefs> => {
    return NotificationService.setPrefs(null as any, context.userId, data);
  });
