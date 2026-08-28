// BC-Mobile-7F — Nhắc nhở của khoảnh khắc (RPC mỏng).
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type {
  BcMobileMomentReminder,
  BcMobileMomentReminderResult,
} from "./moment-reminder.types";

export const bcMobileMomentRemindersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentReminderResult<{ reminders: BcMobileMomentReminder[] }>> =>
      fetchNestApiFromServer("/connect-app/moment/reminders/list", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentReminderCreateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentReminderResult<{ reminder: BcMobileMomentReminder }>> =>
      fetchNestApiFromServer("/connect-app/moment/reminders/create", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentReminderSetStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentReminderResult<{ reminder: BcMobileMomentReminder }>> =>
      fetchNestApiFromServer("/connect-app/moment/reminders/status", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentReminderDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentReminderResult<{ reminderId: string }>> =>
      fetchNestApiFromServer("/connect-app/moment/reminders/delete", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );
