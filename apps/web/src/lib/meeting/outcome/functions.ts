// BC-7.9 Turn A — Authenticated server-function adapters for outcome domain.
// Every function runs under requireSupabaseAuth (RLS as caller). No admin
// client, no client-supplied recorded_by_user_id.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MeetingOutcomeService } from "./service.server";
import { MEETING_OUTCOME_TYPES } from "./types";

type Ctx = { supabase: unknown; userId: string };

const uuid = z.string().uuid();
const outcomeType = z.enum(MEETING_OUTCOME_TYPES);

const createSchema = z.object({
  meetingId: uuid,
  outcomeType,
  summary: z.string().max(4000).nullish(),
  clientRequestId: z.string().min(1).max(200).nullish(),
});

const updateSchema = z.object({
  meetingId: uuid,
  expectedVersion: z.number().int().min(1),
  outcomeType: outcomeType.nullish(),
  summary: z.string().max(4000).nullish(),
  clearSummary: z.boolean().nullish(),
});

const finalizeSchema = z.object({
  meetingId: uuid,
  expectedVersion: z.number().int().min(1),
});

export const getMeetingOutcomeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ meetingId: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;

    return MeetingOutcomeService.getOutcome(c.supabase as any, c.userId, data.meetingId);
  });

export const createMeetingOutcomeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    return MeetingOutcomeService.createOutcome(c.supabase as any, c.userId, {
      meetingId: data.meetingId,
      outcomeType: data.outcomeType,
      summary: data.summary ?? null,
      clientRequestId: data.clientRequestId ?? null,
    });
  });

export const updateMeetingOutcomeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    return MeetingOutcomeService.updateOutcome(c.supabase as any, c.userId, {
      meetingId: data.meetingId,
      expectedVersion: data.expectedVersion,
      outcomeType: data.outcomeType ?? undefined,
      summary: data.summary ?? undefined,
      clearSummary: data.clearSummary ?? false,
    });
  });

export const finalizeMeetingOutcomeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => finalizeSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    return MeetingOutcomeService.finalizeOutcome(c.supabase as any, c.userId, {
      meetingId: data.meetingId,
      expectedVersion: data.expectedVersion,
    });
  });
