import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { CardKind, CardStatus, PublicMode } from "@/lib/business-card.functions";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

// Business-card admin permission tiers.
//  - full: platform/association admins → all actions incl. archive.
//  - moderator: can approve/reject/hide/suspend/unpublish, NOT archive.
//  - viewer: read-only, no mutating actions.
//  - none: no admin access.
export type BcAdminLevel = "full" | "moderator" | "viewer" | "none";

// Statuses a moderator may set (archive is destructive → full only).
const MODERATOR_STATUSES: CardStatus[] = ["draft", "published", "hidden", "suspended", "rejected"];

async function resolveLevel(supabase: any, userId?: string): Promise<BcAdminLevel> {
  if (!userId) {
    try {
      const { data } = await supabase.rpc("my_bc_admin_level");
      return (data as BcAdminLevel) ?? "none";
    } catch {
      return "none";
    }
  }

  try {
    // 1. Check if user is platform admin or association admin
    const [{ data: globalRoles }, { data: adminMemberships }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("memberships")
        .select("association_id")
        .eq("user_id", userId)
        .eq("role", "admin"),
    ]);

    const roles = (globalRoles ?? []).map((r: any) => r.role);
    if (roles.includes("platform_admin") || (adminMemberships ?? []).length > 0) {
      return "full";
    }

    // 2. Check rpc bc_admin_level with _uid
    const { data: rpcLevel } = await supabase.rpc("bc_admin_level", { _uid: userId });
    if (rpcLevel && rpcLevel !== "none") return rpcLevel as BcAdminLevel;

    // 3. Check bc_admin_grants
    const { data: grant } = await supabase
      .from("bc_admin_grants")
      .select("level")
      .eq("user_id", userId)
      .maybeSingle();
    if (grant?.level) return grant.level as BcAdminLevel;
  } catch (err) {
    console.error("[resolveLevel] error checking level:", err);
  }

  return "none";
}

function assertCanSetStatus(level: BcAdminLevel, status: CardStatus): void {
  if (level === "full") return;
  if (level === "moderator" && MODERATOR_STATUSES.includes(status)) return;
  throw new Error("Không có quyền thực hiện thao tác này.");
}

// Pure authorization/scoping decision for the admin business-card listing.
// Extracted so it can be unit-tested without a live DB: given the caller's
// platform-admin flag and the associations they administer, it decides whether
// the caller may use the admin listing at all and, if so, which associations
// their view is scoped to. Platform admins see every association ("all");
// association admins are pinned to the associations they manage.
export type CardListScope =
  | { authorized: false }
  | { authorized: true; scope: "all" }
  | { authorized: true; scope: "associations"; associationIds: string[] };

export function resolveCardListScope(input: {
  isPlatformAdmin: boolean;
  managedAssociationIds: string[];
}): CardListScope {
  if (input.isPlatformAdmin) return { authorized: true, scope: "all" };
  const ids = Array.from(new Set(input.managedAssociationIds.filter(Boolean)));
  if (ids.length === 0) return { authorized: false };
  return { authorized: true, scope: "associations", associationIds: ids };
}

// Admin/manager view of a business card, enriched with owner + association.
// RLS ("Manager reads assoc cards" / platform admin) scopes what rows return,
// so this function is safe for any signed-in user: non-managers simply get [].
export type AdminBusinessCard = {
  id: string;
  slug: string;
  cardKind: CardKind;
  status: CardStatus;
  publicMode: PublicMode;
  displayName: string | null;
  professionalTitle: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  updatedAt: string;
  createdAt: string;
  memberId: string;
  memberName: string | null;
  memberCode: string | null;
  associationId: string;
  associationName: string | null;
};

export const listAllBusinessCardsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<AdminBusinessCard[]> => {
    const { userId } = context;
    const supabase = getDb(context);

    // Authorize server-side: only platform admins or association admins may use
    // this admin listing. Without this, RLS still hides private rows, but the
    // "Public reads published public cards" policy would leak other
    // associations' published-public cards into the admin table, and any
    // signed-in user could reach the endpoint.
    const [{ data: isPlatformAdmin }, { data: adminMemberships }] = await Promise.all([
      supabase.rpc("is_platform_admin"),
      supabase
        .from("memberships")
        .select("association_id")
        .eq("user_id", userId)
        .eq("role", "admin"),
    ]);
    const managedAssocIds = (adminMemberships ?? []).map((m: any) => m.association_id as string);
    const scope = resolveCardListScope({
      isPlatformAdmin: Boolean(isPlatformAdmin),
      managedAssociationIds: managedAssocIds,
    });
    if (!scope.authorized) return [];

    let query = supabase
      .from("member_business_cards")
      .select(
        "id, slug, card_kind, status, public_mode, display_name, professional_title, company_name, avatar_url, updated_at, created_at, member_id, association_id",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    // Platform admins see everything; association admins are scoped to the
    // associations they manage (RLS also enforces this on the server).
    if (scope.scope === "associations") query = query.in("association_id", scope.associationIds);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    if (rows.length === 0) return [];

    const memberIds = Array.from(new Set(rows.map((r: any) => r.member_id as string).filter(Boolean)));
    const assocIds = Array.from(
      new Set(rows.map((r: any) => r.association_id as string).filter(Boolean)),
    );

    const [{ data: members }, { data: assocs }] = await Promise.all([
      memberIds.length
        ? supabase.from("members").select("id, name, code").in("id", memberIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      assocIds.length
        ? supabase.from("associations").select("id, name").in("id", assocIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    ]);

    const memberMap = new Map(
      (members ?? []).map((m: any) => [m.id as string, m as Record<string, unknown>]),
    );
    const assocMap = new Map(
      (assocs ?? []).map((a: any) => [a.id as string, a as Record<string, unknown>]),
    );

    return rows.map((r: any) => {
      const m = memberMap.get(r.member_id as string) as any;
      const a = assocMap.get(r.association_id as string) as any;
      return {
        id: r.id as string,
        slug: r.slug as string,
        cardKind: (r.card_kind as CardKind) ?? "primary",
        status: (r.status as CardStatus) ?? "draft",
        publicMode: (r.public_mode as PublicMode) ?? "members_only",
        displayName: (r.display_name as string) ?? null,
        professionalTitle: (r.professional_title as string) ?? null,
        companyName: (r.company_name as string) ?? null,
        avatarUrl: (r.avatar_url as string) ?? null,
        updatedAt: r.updated_at as string,
        createdAt: (r.created_at as string) ?? (r.updated_at as string),
        memberId: r.member_id as string,
        memberName: (m?.name as string) ?? null,
        memberCode: (m?.code as string) ?? null,
        associationId: r.association_id as string,
        associationName: (a?.name as string) ?? null,
      };
    });
  });

// Moderate a card as a manager/admin. RLS ("Manager moderates assoc cards")
// enforces that the caller manages the card's association.
export const adminSetCardStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published", "hidden", "suspended", "archived", "rejected"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<void> => {
    const supabase = getDb(context);
    assertCanSetStatus(await resolveLevel(supabase, context.userId), data.status as CardStatus);
    const patch: { status: string; published_at?: string } = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("member_business_cards").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
  });

// Bulk moderate cards. RLS ("Manager moderates assoc cards") enforces the
// caller manages each card's association, so ids outside their scope no-op.
export const adminSetCardsStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        status: z.enum(["draft", "published", "hidden", "suspended", "archived", "rejected"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<number> => {
    const supabase = getDb(context);
    assertCanSetStatus(await resolveLevel(supabase, context.userId), data.status as CardStatus);
    const patch: { status: string; published_at?: string } = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("member_business_cards")
      .update(patch)
      .in("id", data.ids)
      .select("id");
    if (error) throw new Error(error.message);
    return (updated ?? []).length;
  });

// Current user's business-card admin level (drives UI gating).
export const getMyBcAdminLevelFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<BcAdminLevel> => {
    return resolveLevel(getDb(context), context.userId);
  });

// Change history for a single card, read from the moderation audit trail.
// RLS ("Audit owner or manager read") scopes access to managers/owners.
export type CardAuditEntry = {
  id: string;
  eventType: string;
  reason: string | null;
  from: string | null;
  to: string | null;
  actorName: string | null;
  createdAt: string;
};

export const listCardAuditFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ cardId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<CardAuditEntry[]> => {
    const supabase = getDb(context);
    const { data: rows, error } = await supabase
      .from("business_card_audit")
      .select("id, event_type, reason, metadata, actor_user_id, created_at")
      .eq("card_id", data.cardId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    if (list.length === 0) return [];

    const actorIds = Array.from(
      new Set(list.map((r: any) => r.actor_user_id as string).filter(Boolean)),
    );
    const { data: profiles } = actorIds.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", actorIds)
      : { data: [] as Record<string, unknown>[] };
    const nameMap = new Map(
      (profiles ?? []).map((p: any) => [
        p.id as string,
        ((p.full_name as string) || (p.email as string)) ?? null,
      ]),
    );

    return list.map((r: any) => {
      const meta = (r.metadata as Record<string, unknown>) ?? {};
      return {
        id: r.id as string,
        eventType: r.event_type as string,
        reason: (r.reason as string) ?? null,
        from: (meta.from as string) ?? null,
        to: (meta.to as string) ?? null,
        actorName: r.actor_user_id ? (nameMap.get(r.actor_user_id as string) ?? null) : null,
        createdAt: r.created_at as string,
      };
    });
  });

// Association-wide audit log across every business card the admin can manage.
// Powers the dedicated "Lịch sử / Audit Log" page so admins can trace changes
// over time. Scoped identically to listAllBusinessCardsFn: platform admins see
// all associations; association admins are pinned to the ones they manage.
export type AuditLogEntry = {
  id: string;
  cardId: string;
  eventType: string;
  reason: string | null;
  from: string | null;
  to: string | null;
  changes: Array<{ field: string; from: string | null; to: string | null }>;
  actorName: string | null;
  createdAt: string;
  cardName: string | null;
  cardSlug: string | null;
  memberName: string | null;
  memberCode: string | null;
  associationId: string;
  associationName: string | null;
};

export const listBusinessCardAuditLogFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        eventType: z.string().optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }): Promise<AuditLogEntry[]> => {
    const { userId } = context;
    const supabase = getDb(context);

    // Authorize + scope server-side (mirrors listAllBusinessCardsFn).
    const [{ data: isPlatformAdmin }, { data: adminMemberships }] = await Promise.all([
      supabase.rpc("is_platform_admin"),
      supabase
        .from("memberships")
        .select("association_id")
        .eq("user_id", userId)
        .eq("role", "admin"),
    ]);
    const managedAssocIds = (adminMemberships ?? []).map((m: any) => m.association_id as string);
    const scope = resolveCardListScope({
      isPlatformAdmin: Boolean(isPlatformAdmin),
      managedAssociationIds: managedAssocIds,
    });
    if (!scope.authorized) return [];

    let query = supabase
      .from("business_card_audit")
      .select(
        "id, card_id, event_type, reason, metadata, actor_user_id, association_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 500);
    if (scope.scope === "associations") query = query.in("association_id", scope.associationIds);
    if (data.eventType) query = query.eq("event_type", data.eventType);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    if (list.length === 0) return [];

    const actorIds = Array.from(
      new Set(list.map((r: any) => r.actor_user_id as string).filter(Boolean)),
    );
    const cardIds = Array.from(new Set(list.map((r: any) => r.card_id as string).filter(Boolean)));
    const assocIds = Array.from(
      new Set(list.map((r: any) => r.association_id as string).filter(Boolean)),
    );

    const [{ data: profiles }, { data: cards }, { data: assocs }] = await Promise.all([
      actorIds.length
        ? supabase.from("profiles").select("id, full_name, email").in("id", actorIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      cardIds.length
        ? supabase
            .from("member_business_cards")
            .select("id, display_name, slug, member_id")
            .in("id", cardIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      assocIds.length
        ? supabase.from("associations").select("id, name").in("id", assocIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    ]);

    const memberIds = Array.from(
      new Set((cards ?? []).map((c: any) => c.member_id as string).filter(Boolean)),
    );
    const { data: members } = memberIds.length
      ? await supabase.from("members").select("id, name, code").in("id", memberIds)
      : { data: [] as Record<string, unknown>[] };

    const nameMap = new Map(
      (profiles ?? []).map((p: any) => [
        p.id as string,
        ((p.full_name as string) || (p.email as string)) ?? null,
      ]),
    );
    const cardMap = new Map(
      (cards ?? []).map((c: any) => [c.id as string, c as Record<string, unknown>]),
    );
    const memberMap = new Map(
      (members ?? []).map((m: any) => [m.id as string, m as Record<string, unknown>]),
    );
    const assocMap = new Map(
      (assocs ?? []).map((a: any) => [a.id as string, a as Record<string, unknown>]),
    );

    return list.map((r: any) => {
      const meta = (r.metadata as Record<string, unknown>) ?? {};
      const card = cardMap.get(r.card_id as string) as any;
      const member = card ? memberMap.get((card as any).member_id as string) as any : undefined;
      const assoc = assocMap.get(r.association_id as string) as any;
      return {
        id: r.id as string,
        cardId: r.card_id as string,
        eventType: r.event_type as string,
        reason: (r.reason as string) ?? null,
        from: (meta.from as string) ?? null,
        to: (meta.to as string) ?? null,
        changes: (() => {
          const raw = meta.changes as Record<string, { from: unknown; to: unknown }> | undefined;
          if (!raw || typeof raw !== "object") return [];
          const fmt = (v: unknown): string | null =>
            v === null || v === undefined
              ? null
              : typeof v === "object"
                ? JSON.stringify(v)
                : String(v);
          return Object.entries(raw).map(([field, c]) => ({
            field,
            from: fmt(c?.from),
            to: fmt(c?.to),
          }));
        })(),
        actorName: r.actor_user_id ? (nameMap.get(r.actor_user_id as string) ?? null) : null,
        createdAt: r.created_at as string,
        cardName: (card?.display_name as string) ?? null,
        cardSlug: (card?.slug as string) ?? null,
        memberName: (member?.name as string) ?? null,
        memberCode: (member?.code as string) ?? null,
        associationId: r.association_id as string,
        associationName: (assoc?.name as string) ?? null,
      };
    });
  });
