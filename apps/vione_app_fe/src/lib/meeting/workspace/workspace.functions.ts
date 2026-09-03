// BC-7.8 Turn B — Meeting Workspace authenticated server-function adapters.
// Every function runs under requireSupabaseAuth (RLS as caller, no admin
// client, no target/tenant IDs accepted from the client).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { MeetingWorkspaceService } from "./service.server";
import { MeetingWorkspaceError } from "./errors";
import {
  MEETING_WORKSPACE_BUCKETS,
  MEETING_WORKSPACE_PAGE_SIZE_DEFAULT,
  MEETING_WORKSPACE_PAGE_SIZE_MAX,
  type MeetingWorkspaceItemDTO,
  type MeetingWorkspaceListDTO,
  type MeetingWorkspaceSummaryDTO,
  type MeetingWorkspaceTimelineEventDTO,
} from "./types";
import {
  BUSINESS_MEETING_PARTICIPANT_ROLES,
  BUSINESS_MEETING_SOURCE_TYPES,
  BUSINESS_MEETING_STATUSES,
  BUSINESS_MEETING_TYPES,
} from "@/lib/business-meetings/types";

type Ctx = { supabase: unknown; userId: string };

const uuid = z.string().uuid();

const filtersSchema = z.object({
  bucket: z.enum(MEETING_WORKSPACE_BUCKETS),
  meetingType: z.enum(BUSINESS_MEETING_TYPES).nullish(),
  viewerRole: z.enum(BUSINESS_MEETING_PARTICIPANT_ROLES).nullish(),
  sourceType: z.enum(BUSINESS_MEETING_SOURCE_TYPES).nullish(),
  status: z.enum(BUSINESS_MEETING_STATUSES).nullish(),
  fromDate: z.string().min(1).max(40).nullish(),
  toDate: z.string().min(1).max(40).nullish(),
  cursor: z.string().min(1).max(200).nullish(),
  limit: z.number().int().min(1).max(MEETING_WORKSPACE_PAGE_SIZE_MAX).nullish(),
});

// ── getWorkspaceSummaryFn ────────────────────────────────────────────────────

export const getWorkspaceSummaryFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MeetingWorkspaceSummaryDTO> => {
    const c = context as unknown as Ctx;

    return MeetingWorkspaceService.getSummary(c.supabase as any);
  });

// ── listWorkspaceMeetingsFn ─────────────────────────────────────────────────

export const listWorkspaceMeetingsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => filtersSchema.parse(d))
  .handler(async ({ context, data }): Promise<MeetingWorkspaceListDTO> => {
    const c = context as unknown as Ctx;
    return MeetingWorkspaceService.listMeetings(c.supabase as any, {
      bucket: data.bucket,
      meetingType: data.meetingType ?? null,
      viewerRole: data.viewerRole ?? null,
      sourceType: data.sourceType ?? null,
      status: data.status ?? null,
      fromDate: data.fromDate ?? null,
      toDate: data.toDate ?? null,
      cursor: data.cursor ?? null,
      limit: data.limit ?? MEETING_WORKSPACE_PAGE_SIZE_DEFAULT,
    });
  });

// ── getMeetingWorkspaceDetailFn ─────────────────────────────────────────────
// A workspace-shaped single meeting view. Filters the frozen list function
// down to one meeting so we reuse a single code path.

export const getMeetingWorkspaceDetailFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ meetingId: uuid }).parse(d))
  .handler(async ({ context, data }): Promise<MeetingWorkspaceItemDTO> => {
    const c = context as unknown as Ctx;

    const supabase = c.supabase as any;
    // Pull a small unscheduled + upcoming + history window; find matching id.
    // For canonical detail, we defer to the existing business_meeting SDK for
    // deep detail (participants/proposals) — this handler returns only the
    // frozen workspace-shaped composition; the detail *page* also fetches
    // getBusinessMeetingDetail for the sensitive slice.
    const buckets = [
      "overview_upcoming",
      "overview_history",
      "unscheduled",
      "needs_action",
    ] as const;
    for (const b of buckets) {
      const { data: rpc, error } = await supabase.rpc("business_meeting_workspace_list_v1", {
        p_bucket: b,
        p_limit: 100,
        p_cursor_sort_at: null,
        p_cursor_meeting_id: null,
        p_meeting_type: null,
        p_source_type: null,
      });
      if (error) {
        throw new MeetingWorkspaceError("MEETING_WORKSPACE_INTERNAL_ERROR", error.message);
      }
      const items: unknown[] = Array.isArray(rpc?.items) ? rpc.items : [];

      const hit = items.find((r: any) => String(r?.id) === data.meetingId);
      if (hit) {
        const list = await MeetingWorkspaceService.listMeetings(supabase, {
          bucket:
            b === "overview_history"
              ? "history"
              : b === "overview_upcoming"
                ? "upcoming"
                : (b as never),
          limit: 100,
        } as never);
        const dto = list.items.find((i) => i.meeting.id === data.meetingId);
        if (dto) return dto;
      }
    }
    throw new MeetingWorkspaceError("MEETING_WORKSPACE_FORBIDDEN");
  });

// ── getMeetingWorkspaceTimelineFn (BC-7.8 Turn C) ───────────────────────────
// Meeting-scoped read of business_meeting_events under caller RLS. Never
// accepts tenant/user IDs from the client; viewer identity comes from the
// auth middleware.

const timelineInputSchema = z.object({
  meetingId: uuid,
  cursor: z.string().min(1).max(400).nullish(),
  limit: z.number().int().min(1).max(100).nullish(),
});

export interface MeetingWorkspaceTimelinePageDTO {
  items: MeetingWorkspaceTimelineEventDTO[];
  nextCursor: string | null;
}

export const getMeetingWorkspaceTimelineFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => timelineInputSchema.parse(d))
  .handler(async ({ context, data }): Promise<MeetingWorkspaceTimelinePageDTO> => {
    const c = context as unknown as Ctx;
    return MeetingWorkspaceService.getMeetingTimeline(c.supabase as any, c.userId, data.meetingId, {
      cursor: data.cursor ?? null,
      limit: data.limit ?? 30,
    });
  });
