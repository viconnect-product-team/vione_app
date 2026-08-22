import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { BusinessCardService } from "@/lib/business-card/business-card.service";

// ── Domain type + constant re-exports ──────────────────────────────────────
// Canonical home is @/lib/business-card/business-card.types. Re-exported here so
// existing importers of "@/lib/business-card.functions" keep working unchanged.
export {
  DEFAULT_VISIBILITY,
  normalizeVisibility,
  BC_ERR,
} from "@/lib/business-card/business-card.types";
export type {
  CardKind,
  CardStatus,
  PublicMode,
  VisibilitySettings,
  CardSkill,
  CardService,
  CardNeed,
  BusinessCard,
  BusinessCardSummary,
  PublicBusinessCardResult,
} from "@/lib/business-card/business-card.types";

import type {
  BusinessCard,
  BusinessCardSummary,
  PublicBusinessCardResult,
} from "@/lib/business-card/business-card.types";

// ── Validation ───────────────────────────────────────────────────────────
const nullableStr = (max: number) => z.string().trim().max(max).nullable().optional();

const cardInput = z.object({
  id: z.string().uuid().nullable().optional(),
  // BC-2.1C: additive create scope. "association" (default) = existing member
  // builder flow. "global" = platform-user-owned card with no member/association
  // link. Client NEVER supplies owner_user_id — it is always auth.uid().
  scope: z.enum(["association", "global"]).optional(),
  slug: z.string().trim().min(2).max(60),
  cardKind: z.enum(["primary", "secondary"]),
  publicMode: z.enum(["public", "members_only", "private"]),
  visibilitySettings: z
    .object({
      showContact: z.boolean(),
      showSocial: z.boolean(),
      showServices: z.boolean(),
      showNeeds: z.boolean(),
    })
    .optional(),
  displayName: nullableStr(120),
  professionalTitle: nullableStr(160),
  companyName: nullableStr(200),
  companyLogoUrl: nullableStr(600),
  avatarUrl: nullableStr(600),
  coverUrl: nullableStr(600),
  headline: nullableStr(200),
  bio: nullableStr(2000),
  // EN overrides for two-sided VI/EN business cards. Optional; empty side is
  // hidden at render time so old cards keep working unchanged.
  displayNameEn: nullableStr(120),
  professionalTitleEn: nullableStr(160),
  companyNameEn: nullableStr(200),
  headlineEn: nullableStr(200),
  bioEn: nullableStr(2000),
  website: nullableStr(300),
  workEmail: nullableStr(200),
  workPhone: nullableStr(60),
  zaloUrl: nullableStr(300),
  linkedinUrl: nullableStr(300),
  facebookUrl: nullableStr(300),
  youtubeUrl: nullableStr(300),
  tiktokUrl: nullableStr(300),
  address: nullableStr(400),
  mapUrl: nullableStr(600),
  themeId: nullableStr(60),
  customBrandColor: nullableStr(20),
  qrOptions: z
    .object({
      background: z.enum(["white", "template", "transparent"]),
      logoScale: z.number().min(0.14).max(0.3),
      logoOffsetX: z.number().min(-0.25).max(0.25),
      logoOffsetY: z.number().min(-0.25).max(0.25),
    })
    .nullable()
    .optional(),
  skills: z.array(z.object({ label: z.string().trim().min(1).max(60) })).max(30),
  services: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        description: nullableStr(600),
        category: nullableStr(80),
      }),
    )
    .max(30),
  needs: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        description: nullableStr(600),
        category: nullableStr(80),
      }),
    )
    .max(30),
});

// ── Server functions (thin adapters over BusinessCardService) ──────────────
// All Business Card domain logic lives in BusinessCardService / Repository.
// These functions only bind auth context + input validation to the service.

export const listMyBusinessCardsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    ({ context }): Promise<BusinessCardSummary[]> =>
      BusinessCardService.listMyCards(context.supabase),
  );

export const getMyBusinessCardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(
    ({ data, context }): Promise<BusinessCard> =>
      BusinessCardService.getMyCard(context.supabase, data.id),
  );

// Preview by slug (owner / manager, works on drafts). RLS restricts reads to the
// owner (or an association manager), so drafts are only visible to their owner.
export const getBusinessCardPreviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().trim().min(1).max(60) }).parse(d))
  .handler(
    ({ data, context }): Promise<BusinessCard | null> =>
      BusinessCardService.getPreviewBySlug(context.supabase, data.slug),
  );

// Public profile by slug (no auth; respects public_mode). ownerUserId is never
// exposed on the public projection (BC-2.1A rule).
export const getPublicBusinessCardFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().trim().min(1).max(60) }).parse(d))
  .handler(
    ({ data }): Promise<PublicBusinessCardResult> => BusinessCardService.getPublicBySlug(data.slug),
  );

// Public: published + fully-public profile slugs for the sitemap (BC-2.3 SEO).
export const listPublicProfileSlugsFn = createServerFn({ method: "GET" }).handler(
  (): Promise<{ slug: string; updatedAt: string | null }[]> =>
    BusinessCardService.listPublicProfileSlugs(),
);

// Create / update (with child replace).
export const saveBusinessCardFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cardInput.parse(d))
  .handler(
    ({ data, context }): Promise<{ id: string }> =>
      BusinessCardService.saveCard(context.supabase, context.userId, data),
  );

// Set status (publish / unpublish / archive).
export const setBusinessCardStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published", "hidden", "archived"]),
      })
      .parse(d),
  )
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> =>
      BusinessCardService.setStatus(context.supabase, context.userId, data.id, data.status),
  );

// Set Primary (demote current primary, promote target).
export const setPrimaryBusinessCardFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> =>
      BusinessCardService.setPrimary(context.supabase, context.userId, data.id),
  );

// Delete.
export const deleteBusinessCardFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> =>
      BusinessCardService.deleteCard(context.supabase, context.userId, data.id),
  );

// ── Leads + analytics (thin adapters over LeadService) ─────────────────────
// All lead/stats domain logic lives in LeadService / LeadRepository. Types and
// constants are re-exported so existing importers of this module are unchanged.
export { REPLY_TEMPLATES, LEAD_STATUSES } from "@/lib/business-card/lead.types";
export type {
  LeadStatus,
  ReplyChannel,
  LeadReplyEntry,
  ReplyTemplate,
  LeadHistoryEntry,
  BusinessCardLead,
  DailyPoint,
  StatusBreakdown,
  BusinessCardStats,
} from "@/lib/business-card/lead.types";

import { LeadService } from "@/lib/business-card/lead.service";
import type { BusinessCardLead, BusinessCardStats } from "@/lib/business-card/lead.types";

export const listMyBusinessCardLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }): Promise<BusinessCardLead[]> => LeadService.listMyLeads(context.token));

export const updateBusinessCardLeadStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "read", "contacting", "responded", "won", "lost", "archived"]),
        note: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> =>
      LeadService.updateStatus(context.token, data.id, data.status, data.note),
  );

export const sendBusinessCardLeadReplyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        channel: z.enum(["email", "phone", "note"]),
        templateId: z.string().max(60).nullable().optional(),
        subject: z.string().trim().max(200).nullable().optional(),
        body: z.string().trim().min(1).max(5000),
        markResponded: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> => LeadService.sendReply(context.token, data),
  );

// Workflow action from the notification center: change status AND auto-append
// an entry to the response history so the timeline reflects the action.
export const processLeadWorkflowFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["read", "contacting", "won", "lost"]),
        note: z.string().trim().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(
    ({ data, context }): Promise<{ ok: boolean }> =>
      LeadService.processWorkflow(context.token, data.id, data.status, data.note),
  );

// ── Analytics / Stats ─────────────────────────────────────────────────────
export const getBusinessCardStatsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(7).max(90).optional() }).parse(d ?? {}),
  )
  .handler(
    ({ data, context }): Promise<BusinessCardStats> =>
      LeadService.getStats(context.token, data.days),
  );
