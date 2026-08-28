// BC-Mobile-8A — RPC mỏng cho hộp thư nội bộ (Inbox).
// Directs all requests to backend NestJS RESTful API.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import {
  DM_MAX_BODY_LEN,
  DM_PAGE_SIZE,
  type BcDmMessage,
  type BcDmResult,
  type BcDmThreadSummary,
} from "./dm.types";

export const bcDmThreadsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({ context }): Promise<BcDmResult<{ threads: BcDmThreadSummary[] }>> => {
      return fetchNestApiFromServer("/connect-app/dm/threads", context.token, {
        method: "POST",
      });
    },
  );

const openInput = z.object({ personId: z.string().regex(/^u:[0-9a-fA-F-]{36}$/) });

export const bcDmOpenThreadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => openInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcDmResult<{ threadId: string }>> => {
      return fetchNestApiFromServer("/connect-app/dm/open-thread", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const threadInput = z.object({
  threadId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(DM_PAGE_SIZE),
});

export const bcDmThreadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => threadInput.parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcDmResult<{ thread: BcDmThreadSummary; messages: BcDmMessage[] }>> => {
      return fetchNestApiFromServer("/connect-app/dm/thread", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const sendInput = z.object({
  threadId: z.string().uuid(),
  body: z.string().max(DM_MAX_BODY_LEN + 200),
  clientToken: z.string().uuid(),
});

export const bcDmSendFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => sendInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcDmResult<{ message: BcDmMessage }>> => {
      return fetchNestApiFromServer("/connect-app/dm/send", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const markReadInput = z.object({ threadId: z.string().uuid() });

export const bcDmMarkReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => markReadInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcDmResult<{ updated: number }>> => {
      return fetchNestApiFromServer("/connect-app/dm/mark-read", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );

const retractInput = z.object({ messageId: z.string().uuid() });

export const bcDmRetractFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => retractInput.parse(data))
  .handler(
    async ({ data, context }): Promise<BcDmResult<{ message: BcDmMessage }>> => {
      return fetchNestApiFromServer("/connect-app/dm/retract", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  );
