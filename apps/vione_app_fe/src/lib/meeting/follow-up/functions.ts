// BC-7.9 Turn B — Authenticated server-function adapters for follow-up.
// Every function runs under requireSupabaseAuth (RLS as caller). No admin
// client, no client-supplied identity.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { MeetingFollowUpService } from "./service.server";
import { MeetingFollowUpError } from "./errors";
import {
  MEETING_FOLLOW_UP_PRIORITIES,
  MEETING_FOLLOW_UP_TITLE_MAX,
  MEETING_FOLLOW_UP_DESCRIPTION_MAX,
} from "./types";

type Ctx = { supabase: any; userId: string };

const uuid = z.string().uuid();
const priority = z.enum(MEETING_FOLLOW_UP_PRIORITIES);
const isoDate = z.string().refine((v) => Number.isFinite(Date.parse(v)), "invalid date");

const createSchema = z.object({
  meetingId: uuid,
  title: z.string().min(1).max(MEETING_FOLLOW_UP_TITLE_MAX),
  ownerUserId: uuid,
  description: z.string().max(MEETING_FOLLOW_UP_DESCRIPTION_MAX).nullish(),
  priority: priority.nullish(),
  dueAt: isoDate.nullish(),
  outcomeId: uuid.nullish(),
  clientRequestId: z.string().min(1).max(200).nullish(),
});

const updateSchema = z.object({
  followUpId: uuid,
  expectedVersion: z.number().int().min(1),
  title: z.string().min(1).max(MEETING_FOLLOW_UP_TITLE_MAX).optional(),
  description: z.string().max(MEETING_FOLLOW_UP_DESCRIPTION_MAX).nullish(),
  clearDescription: z.boolean().nullish(),
  priority: priority.optional(),
  dueAt: isoDate.nullish(),
  clearDueAt: z.boolean().nullish(),
  ownerUserId: uuid.optional(),
});

const setStatusSchema = z.object({
  followUpId: uuid,
  expectedVersion: z.number().int().min(1),
  targetStatus: z.enum(["in_progress", "completed"]),
});

const cancelSchema = z.object({
  followUpId: uuid,
  expectedVersion: z.number().int().min(1),
});

// Server-side helper: resolve DTO context (organizer + participant flag) for
// the caller against a meeting id. Uses RLS-scoped reads.
async function loadCtx(
  sb: any,
  meetingId: string,
  userId: string,
): Promise<{ viewerUserId: string; organizerUserId: string; isMeetingParticipant: boolean }> {
  const { data: m, error: mErr } = await sb
    .from("business_meetings")
    .select("organizer_user_id")
    .eq("id", meetingId)
    .maybeSingle();
  if (mErr || !m) throw new MeetingFollowUpError("MEETING_FOLLOW_UP_NOT_FOUND");
  const { data: p } = await sb
    .from("business_meeting_participants")
    .select("user_id")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .is("left_at", null)
    .maybeSingle();
  return {
    viewerUserId: userId,
    organizerUserId: m.organizer_user_id as string,
    isMeetingParticipant: !!p,
  };
}

export const listMeetingFollowUpsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ meetingId: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    const ctx = await loadCtx(c.supabase, data.meetingId, c.userId);
    return MeetingFollowUpService.listFollowUps(c.supabase, ctx, data.meetingId);
  });

export const createMeetingFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    const ctx = await loadCtx(c.supabase, data.meetingId, c.userId);
    return MeetingFollowUpService.createFollowUp(c.supabase, ctx, {
      meetingId: data.meetingId,
      title: data.title,
      ownerUserId: data.ownerUserId,
      description: data.description ?? null,
      priority: data.priority ?? undefined,
      dueAt: data.dueAt ?? null,
      outcomeId: data.outcomeId ?? null,
      clientRequestId: data.clientRequestId ?? null,
    });
  });

async function loadCtxByFollowUp(sb: any, followUpId: string, userId: string) {
  const { data: fu, error } = await sb
    .from("business_meeting_follow_ups")
    .select("meeting_id")
    .eq("id", followUpId)
    .maybeSingle();
  if (error || !fu) throw new MeetingFollowUpError("MEETING_FOLLOW_UP_NOT_FOUND");
  return loadCtx(sb, fu.meeting_id as string, userId);
}

export const updateMeetingFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    const ctx = await loadCtxByFollowUp(c.supabase, data.followUpId, c.userId);
    return MeetingFollowUpService.updateFollowUp(c.supabase, ctx, {
      followUpId: data.followUpId,
      expectedVersion: data.expectedVersion,
      title: data.title,
      description: data.description ?? undefined,
      clearDescription: data.clearDescription ?? false,
      priority: data.priority,
      dueAt: data.dueAt ?? undefined,
      clearDueAt: data.clearDueAt ?? false,
      ownerUserId: data.ownerUserId,
    });
  });

export const setMeetingFollowUpStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => setStatusSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    const ctx = await loadCtxByFollowUp(c.supabase, data.followUpId, c.userId);
    return MeetingFollowUpService.setFollowUpStatus(c.supabase, ctx, {
      followUpId: data.followUpId,
      expectedVersion: data.expectedVersion,
      targetStatus: data.targetStatus,
    });
  });

export const cancelMeetingFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => cancelSchema.parse(d))
  .handler(async ({ context, data }) => {
    const c = context as unknown as Ctx;
    const ctx = await loadCtxByFollowUp(c.supabase, data.followUpId, c.userId);
    return MeetingFollowUpService.cancelFollowUp(c.supabase, ctx, {
      followUpId: data.followUpId,
      expectedVersion: data.expectedVersion,
    });
  });
