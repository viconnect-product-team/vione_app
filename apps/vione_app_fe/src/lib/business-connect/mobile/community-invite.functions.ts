// BC — Community email invite server fns (thin wrappers only).
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type { CommunityInviteDTO } from "./community-invite.server";
import type { CommunityInviteTemplateDTO } from "./community-invite-template";

const communityIdSchema = z.string().uuid();
const localeSchema = z.enum(["vi", "en"]);

export const listCommunityInvitesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(async ({ data, context }): Promise<CommunityInviteDTO[]> => {
    return fetchNestApiFromServer(`/connect-app/community/invite/list?communityId=${data.communityId}`, context.token);
  });

const createInviteInput = z.object({
  communityId: communityIdSchema,
  email: z.string().trim().email().max(255),
  note: z.string().trim().max(240).optional(),
  inviteUrl: z.string().trim().max(500).optional(),
  locale: z.enum(["vi", "en"]).optional(),
  invitedRole: z.enum(["admin", "member"]).optional(),
});

export const createCommunityInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => createInviteInput.parse(i))
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/create", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const listCommunityInviteTemplatesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ templates: CommunityInviteTemplateDTO[]; canEdit: boolean }> => {
      return fetchNestApiFromServer(`/connect-app/community/invite/templates?communityId=${data.communityId}`, context.token);
    },
  );

export const saveCommunityInviteTemplateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        communityId: communityIdSchema,
        locale: localeSchema,
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(4000),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/save-template", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const resetCommunityInviteTemplateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ communityId: communityIdSchema, locale: localeSchema }).parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/reset-template", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const cancelCommunityInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ inviteRef: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    return fetchNestApiFromServer("/connect-app/community/invite/cancel", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const resendCommunityInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({ inviteRef: z.string().uuid(), locale: z.enum(["vi", "en"]).optional() })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/resend", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const getCommunityInviteByTokenFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().trim().min(8).max(120) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer(`/connect-app/community/invite/by-token?token=${encodeURIComponent(data.token)}`, context.token);
  });

export const acceptCommunityInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().trim().min(8).max(120),
        email: z.string().trim().email().max(255),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/accept", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateAcceptedInviteRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({ inviteRef: z.string().uuid(), role: z.enum(["admin", "member"]) })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer("/connect-app/community/invite/update-role", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const listInviteRoleHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ inviteRef: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer(`/connect-app/community/invite/role-history?inviteRef=${data.inviteRef}`, context.token);
  });
