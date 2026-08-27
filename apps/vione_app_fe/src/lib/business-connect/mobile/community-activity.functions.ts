// BC-Mobile-7B — Community activity server-fn thin wrappers (module scope:
// imports, erased types, exported server functions only). All logic lives in
// community-activity.server.ts; actors always come from requireSupabaseAuth.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type {
  CommunityActivityPreviewDTO,
  CommunityEventDetailDTO,
  CommunityEventPageDTO,
  CommunityOpportunityDetailDTO,
  CommunityOpportunityPageDTO,
} from "./community-activity.types";

const communityIdSchema = z.string().uuid();
const refSchema = z.string().min(1).max(64);

const eventsInput = z.object({
  communityId: communityIdSchema,
  tab: z.enum(["upcoming", "registered"]).default("upcoming"),
  offset: z.number().int().min(0).max(100_000).optional(),
});

export const listCommunityEventsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventsInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityEventPageDTO | null> => {
    const { listCommunityEvents } = await import("./community-activity.server");
    return listCommunityEvents({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      tab: data.tab,
      offset: data.offset,
    });
  });

const eventDetailInput = z.object({
  communityId: communityIdSchema,
  eventRef: refSchema,
});

export const getCommunityEventDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityEventDetailDTO | null> => {
    const { getCommunityEventDetail } = await import("./community-activity.server");
    return getCommunityEventDetail({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      eventRef: data.eventRef,
    });
  });

export const registerCommunityEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { registerCommunityEvent } = await import("./community-activity.server");
    return registerCommunityEvent({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      eventRef: data.eventRef,
    });
  });

export const cancelCommunityEventRegistrationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { cancelCommunityEventRegistration } = await import("./community-activity.server");
    return cancelCommunityEventRegistration({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      eventRef: data.eventRef,
    });
  });

const opportunitiesInput = z.object({
  communityId: communityIdSchema,
  query: z.string().max(120).optional(),
  offset: z.number().int().min(0).max(100_000).optional(),
});

export const listCommunityOpportunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunitiesInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityOpportunityPageDTO | null> => {
    const { listCommunityOpportunities } = await import("./community-activity.server");
    return listCommunityOpportunities({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      query: data.query,
      offset: data.offset,
    });
  });

const opportunityDetailInput = z.object({
  communityId: communityIdSchema,
  opportunityRef: refSchema,
});

export const getCommunityOpportunityDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityOpportunityDetailDTO | null> => {
    const { getCommunityOpportunityDetail } = await import("./community-activity.server");
    return getCommunityOpportunityDetail({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
    });
  });

const opportunityInterestInput = opportunityDetailInput.extend({
  interestLevel: z.enum(["high", "low"]).optional(),
});

export const expressCommunityOpportunityInterestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityInterestInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { expressCommunityOpportunityInterest } = await import("./community-activity.server");
    return expressCommunityOpportunityInterest({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
      interestLevel: data.interestLevel,
    });
  });

export const withdrawCommunityOpportunityInterestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { withdrawCommunityOpportunityInterest } = await import("./community-activity.server");
    return withdrawCommunityOpportunityInterest({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
    });
  });

const followUpScheduleInput = opportunityDetailInput.extend({
  inDays: z.number().int().min(1).max(180),
});

export const scheduleCommunityOpportunityFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => followUpScheduleInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { scheduleCommunityOpportunityFollowUp } = await import("./community-activity.server");
    return scheduleCommunityOpportunityFollowUp({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
      inDays: data.inDays,
    });
  });

const followUpUpdateInput = opportunityDetailInput.extend({
  action: z.enum(["done", "cancel"]),
});

export const updateCommunityOpportunityFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => followUpUpdateInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { updateCommunityOpportunityFollowUp } = await import("./community-activity.server");
    return updateCommunityOpportunityFollowUp({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
      action: data.action,
    });
  });

const progressInput = opportunityDetailInput.extend({
  progress: z.enum(["planned", "messaged", "replied", "closed"]),
  note: z.string().trim().max(1000).optional(),
});

export const saveCommunityOpportunityProgressFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => progressInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { saveCommunityOpportunityProgress } = await import("./community-activity.server");
    return saveCommunityOpportunityProgress({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
      progress: data.progress,
      note: data.note ?? null,
    });
  });

const attachmentAddInput = opportunityDetailInput.extend({
  kind: z.enum(["link", "file"]),
  title: z.string().trim().max(160).optional(),
  url: z.string().trim().max(2000).optional(),
  storagePath: z.string().trim().max(400).optional(),
  mimeType: z.string().trim().max(120).optional(),
  sizeBytes: z.number().int().nonnegative().max(20_000_000).optional(),
});

export const addCommunityOpportunityAttachmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => attachmentAddInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { addCommunityOpportunityAttachment } = await import("./community-activity.server");
    return addCommunityOpportunityAttachment({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      opportunityRef: data.opportunityRef,
      kind: data.kind,
      title: data.title ?? null,
      url: data.url ?? null,
      storagePath: data.storagePath ?? null,
      mimeType: data.mimeType ?? null,
      sizeBytes: data.sizeBytes ?? null,
    });
  });

const attachmentRemoveInput = z.object({ attachmentId: z.string().uuid() });

export const removeCommunityOpportunityAttachmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => attachmentRemoveInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { removeCommunityOpportunityAttachment } = await import("./community-activity.server");
    return removeCommunityOpportunityAttachment({
      user: context.supabase as never,
      viewerId: context.userId,
      attachmentId: data.attachmentId,
    });
  });

const previewInput = z.object({ communityId: communityIdSchema });

export const getCommunityActivityPreviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => previewInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityActivityPreviewDTO | null> => {
    try {
      const { token } = context as any;
      return await fetchNestApiFromServer(`/connect-app/community/${data.communityId}/activity-preview`, token);
    } catch (e) {
      console.error("Failed to get community activity preview from NestJS:", e);
      return { nextEvents: [], openOpportunities: [] };
    }
  });
