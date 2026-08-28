// BC-Mobile-7B — Community activity server-fn thin wrappers.
// Directs all requests to backend NestJS RESTful API.

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
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    queryParams.set("tab", data.tab);
    if (data.offset !== undefined) queryParams.set("offset", String(data.offset));
    return fetchNestApiFromServer(`/connect-app/community/activity/events/list?${queryParams.toString()}`, context.token);
  });

const eventDetailInput = z.object({
  communityId: communityIdSchema,
  eventRef: refSchema,
});

export const getCommunityEventDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityEventDetailDTO | null> => {
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    queryParams.set("eventRef", data.eventRef);
    return fetchNestApiFromServer(`/connect-app/community/activity/events/detail?${queryParams.toString()}`, context.token);
  });

export const registerCommunityEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/events/register", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const cancelCommunityEventRegistrationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/events/cancel-registration", context.token, {
      method: "POST",
      body: JSON.stringify(data),
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
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    if (data.query) queryParams.set("query", data.query);
    if (data.offset !== undefined) queryParams.set("offset", String(data.offset));
    return fetchNestApiFromServer(`/connect-app/community/activity/opportunities/list?${queryParams.toString()}`, context.token);
  });

const opportunityDetailInput = z.object({
  communityId: communityIdSchema,
  opportunityRef: refSchema,
});

export const getCommunityOpportunityDetailFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<CommunityOpportunityDetailDTO | null> => {
    const queryParams = new URLSearchParams();
    queryParams.set("communityId", data.communityId);
    queryParams.set("opportunityRef", data.opportunityRef);
    return fetchNestApiFromServer(`/connect-app/community/activity/opportunities/detail?${queryParams.toString()}`, context.token);
  });

const opportunityInterestInput = opportunityDetailInput.extend({
  interestLevel: z.enum(["high", "low"]).optional(),
});

export const expressCommunityOpportunityInterestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityInterestInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/express-interest", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const withdrawCommunityOpportunityInterestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => opportunityDetailInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/withdraw-interest", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

const followUpScheduleInput = opportunityDetailInput.extend({
  inDays: z.number().int().min(1).max(180),
});

export const scheduleCommunityOpportunityFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => followUpScheduleInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/schedule-followup", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

const followUpUpdateInput = opportunityDetailInput.extend({
  action: z.enum(["done", "cancel"]),
});

export const updateCommunityOpportunityFollowUpFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => followUpUpdateInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/update-followup", context.token, {
      method: "POST",
      body: JSON.stringify(data),
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
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/save-progress", context.token, {
      method: "POST",
      body: JSON.stringify(data),
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
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/add-attachment", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

const attachmentRemoveInput = z.object({ attachmentId: z.string().uuid() });

export const removeCommunityOpportunityAttachmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => attachmentRemoveInput.parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/activity/opportunities/remove-attachment", context.token, {
      method: "POST",
      body: JSON.stringify(data),
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
