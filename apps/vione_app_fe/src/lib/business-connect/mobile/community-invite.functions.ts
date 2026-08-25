// BC — Community email invite server fns (thin wrappers only).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CommunityInviteDTO } from "./community-invite.server";
import type { CommunityInviteTemplateDTO } from "./community-invite-template";

const communityIdSchema = z.string().uuid();

export const listCommunityInvitesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(async ({ data, context }): Promise<CommunityInviteDTO[]> => {
    const { listCommunityInvites } = await import("./community-invite.server");
    return listCommunityInvites({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
    });
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
    const { createCommunityInvite } = await import("./community-invite.server");
    return createCommunityInvite({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      email: data.email,
      note: data.note ?? null,
      inviteUrl: data.inviteUrl ?? null,
      locale: data.locale ?? "vi",
      invitedRole: data.invitedRole ?? "member",
    });
  });

const localeSchema = z.enum(["vi", "en"]);

export const listCommunityInviteTemplatesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ communityId: communityIdSchema }).parse(i))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ templates: CommunityInviteTemplateDTO[]; canEdit: boolean }> => {
      const { listCommunityInviteTemplates } = await import("./community-invite.server");
      return listCommunityInviteTemplates({
        user: context.supabase as never,
        viewerId: context.userId,
        communityId: data.communityId,
      });
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
    const { saveCommunityInviteTemplate } = await import("./community-invite.server");
    return saveCommunityInviteTemplate({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      locale: data.locale,
      subject: data.subject,
      body: data.body,
    });
  });

export const resetCommunityInviteTemplateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ communityId: communityIdSchema, locale: localeSchema }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { resetCommunityInviteTemplate } = await import("./community-invite.server");
    return resetCommunityInviteTemplate({
      user: context.supabase as never,
      viewerId: context.userId,
      communityId: data.communityId,
      locale: data.locale,
    });
  });

export const cancelCommunityInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ inviteRef: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { cancelCommunityInvite } = await import("./community-invite.server");
    return cancelCommunityInvite({
      user: context.supabase as never,
      viewerId: context.userId,
      inviteRef: data.inviteRef,
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
    const { resendCommunityInvite } = await import("./community-invite.server");
    return resendCommunityInvite({
      user: context.supabase as never,
      viewerId: context.userId,
      inviteRef: data.inviteRef,
      locale: data.locale,
    });
  });

export const getCommunityInviteByTokenFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().trim().min(8).max(120) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { getCommunityInviteByToken } = await import("./community-invite.server");
    return getCommunityInviteByToken({ viewerId: context.userId, token: data.token });
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
    const { acceptCommunityInviteByToken } = await import("./community-invite.server");
    return acceptCommunityInviteByToken({
      viewerId: context.userId,
      token: data.token,
      email: data.email,
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
    const { updateAcceptedInviteRole } = await import("./community-invite.server");
    return updateAcceptedInviteRole({
      user: context.supabase as never,
      viewerId: context.userId,
      inviteRef: data.inviteRef,
      role: data.role,
    });
  });

export const listInviteRoleHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ inviteRef: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { listInviteRoleHistory } = await import("./community-invite.server");
    return listInviteRoleHistory({
      user: context.supabase as never,
      viewerId: context.userId,
      inviteRef: data.inviteRef,
    });
  });
