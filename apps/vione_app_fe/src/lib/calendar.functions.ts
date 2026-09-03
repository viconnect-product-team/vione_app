// BC-7.7 Turn B1 — Calendar authenticated server-function adapters.
// Every function runs under requireSupabaseAuth. RLS + SECURITY DEFINER RPCs
// enforce authority; this layer validates input and shapes the response.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { CalendarError } from "@/lib/meeting/calendar/errors";
import type {
  AvailabilityPreferencesDTO,
  AvailabilitySlotDTO,
  MeetingTimeProposalDTO,
  MeetingTimeProposalResponseDTO,
} from "@/lib/meeting/calendar/types";
import { validateUpdatePreferences } from "@/lib/meeting/calendar/preferences.service";
import { findCommonAvailability } from "@/lib/meeting/calendar/availability.service";
import { createCalendarRepository } from "@/lib/meeting/calendar/calendar.repository.server";

type Ctx = { supabase: unknown; userId: string };

const iso = z.string().min(1).max(40);
const uuid = z.string().uuid();
const tz = z.string().min(1).max(64);

// ── Preferences ─────────────────────────────────────────────────────────────

export const getMyAvailabilityPreferencesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<AvailabilityPreferencesDTO | null> => {
    const c = context as unknown as Ctx;

    const repo = createCalendarRepository(c.supabase as any);
    return repo.getPreferences(c.userId);
  });

const updatePrefsInput = z.object({
  timezone: tz,
  workingDays: z.array(z.number().int().min(1).max(7)).min(1),
  workingHours: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .min(1),
  minimumNoticeMinutes: z.number().int().min(0).max(10080),
  defaultMeetingDurationMinutes: z.number().int().min(15).max(480),
  bufferBeforeMinutes: z.number().int().min(0).max(240),
  bufferAfterMinutes: z.number().int().min(0).max(240),
  expectedVersion: z.number().int().min(1).nullish(),
});

export const updateAvailabilityPreferencesFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => updatePrefsInput.parse(d))
  .handler(async ({ data, context }): Promise<AvailabilityPreferencesDTO> => {
    const c = context as unknown as Ctx;

    validateUpdatePreferences(data as any);

    const supabase = c.supabase as any;
    const { data: row, error } = await supabase.rpc("business_availability_preferences_update", {
      _timezone: data.timezone,
      _working_days: data.workingDays,
      _working_hours: data.workingHours,
      _minimum_notice_minutes: data.minimumNoticeMinutes,
      _default_meeting_duration_minutes: data.defaultMeetingDurationMinutes,
      _buffer_before_minutes: data.bufferBeforeMinutes,
      _buffer_after_minutes: data.bufferAfterMinutes,
      _expected_version: data.expectedVersion ?? null,
    });
    if (error) throw new CalendarError("CALENDAR_INTERNAL_ERROR", error.message);
    return {
      id: String(row.id),
      userId: String(row.user_id),
      timezone: String(row.timezone),
      workingDays: row.working_days ?? [],
      workingHours: row.working_hours ?? [],
      minimumNoticeMinutes: Number(row.minimum_notice_minutes),
      defaultMeetingDurationMinutes: Number(row.default_meeting_duration_minutes),
      bufferBeforeMinutes: Number(row.buffer_before_minutes),
      bufferAfterMinutes: Number(row.buffer_after_minutes),
      version: Number(row.version),
    };
  });

// ── Availability ────────────────────────────────────────────────────────────

const findAvailabilityInput = z.object({
  meetingId: uuid.optional(),
  participantUserIds: z.array(uuid).min(1).max(10),
  fromDate: iso,
  toDate: iso,
  durationMinutes: z.number().int().min(15).max(480),
  organizerTimezone: tz,
});

export const findCommonAvailabilityFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => findAvailabilityInput.parse(d))
  .handler(async ({ data, context }): Promise<AvailabilitySlotDTO[]> => {
    const c = context as unknown as Ctx;

    return findCommonAvailability(c.supabase as any, c.userId, data);
  });

// ── Proposals ───────────────────────────────────────────────────────────────

const createProposalsInput = z.object({
  meetingId: uuid,
  proposals: z
    .array(z.object({ startAt: iso, endAt: iso, timezone: tz }))
    .min(1)
    .max(5),
  clientRequestId: z.string().min(8).max(80).optional(),
});

export const createTimeProposalsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => createProposalsInput.parse(d))
  .handler(async ({ data, context }): Promise<MeetingTimeProposalDTO[]> => {
    const c = context as unknown as Ctx;

    const supabase = c.supabase as any;
    const { data: rows, error } = await supabase.rpc("business_meeting_time_proposals_create", {
      _meeting_id: data.meetingId,
      _proposals: data.proposals.map((p) => ({
        start_at: p.startAt,
        end_at: p.endAt,
        timezone: p.timezone,
      })),
      _client_request_id: data.clientRequestId ?? null,
    });
    if (error) throw new CalendarError("MEETING_TIME_PROPOSAL_INVALID", error.message);
    return (rows ?? []).map(mapProposalRow);
  });

// ── List proposals / projections (UI read helpers) ─────────────────────────

const listProposalsInput = z.object({ meetingId: uuid });

export const listMeetingTimeProposalsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => listProposalsInput.parse(d))
  .handler(async ({ data, context }): Promise<MeetingTimeProposalDTO[]> => {
    const c = context as unknown as Ctx;

    const repo = createCalendarRepository(c.supabase as any);
    return repo.listProposals(data.meetingId);
  });

export const listMeetingProjectionsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => listProposalsInput.parse(d))
  .handler(async ({ data, context }) => {
    const c = context as unknown as Ctx;

    const repo = createCalendarRepository(c.supabase as any);
    return repo.listProjections(data.meetingId);
  });

const respondInput = z.object({
  proposalId: uuid,
  response: z.enum(["available", "unavailable", "tentative"]),
});

export const respondToTimeProposalFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => respondInput.parse(d))
  .handler(async ({ data, context }): Promise<MeetingTimeProposalResponseDTO> => {
    const c = context as unknown as Ctx;

    const supabase = c.supabase as any;
    const { data: row, error } = await supabase.rpc("business_meeting_time_proposal_respond", {
      _proposal_id: data.proposalId,
      _response: data.response,
    });
    if (error) throw new CalendarError("MEETING_TIME_PROPOSAL_INVALID", error.message);
    return {
      id: String(row.id),
      proposalId: String(row.proposal_id),
      participantId: String(row.participant_id),
      response: row.response,
      respondedAt: String(row.responded_at),
    };
  });

const selectInput = z.object({
  proposalId: uuid,
  expectedMeetingVersion: z.number().int().min(0).nullish(),
});

export const selectTimeProposalFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => selectInput.parse(d))
  .handler(async ({ data, context }): Promise<MeetingTimeProposalDTO> => {
    const c = context as unknown as Ctx;

    const supabase = c.supabase as any;
    const { data: row, error } = await supabase.rpc("business_meeting_time_proposal_select", {
      _proposal_id: data.proposalId,
      _expected_meeting_version: data.expectedMeetingVersion ?? null,
    });
    if (error) throw new CalendarError("MEETING_TIME_PROPOSAL_NOT_SELECTABLE", error.message);
    return mapProposalRow(row);
  });

function mapProposalRow(row: Record<string, unknown>): MeetingTimeProposalDTO {
  return {
    id: String(row.id),
    meetingId: String(row.meeting_id),
    proposedByUserId: String(row.proposed_by_user_id),
    startAt: String(row.start_at),
    endAt: String(row.end_at),
    timezone: String(row.timezone),
    status: row.status as MeetingTimeProposalDTO["status"],
    version: Number(row.version ?? 1),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
