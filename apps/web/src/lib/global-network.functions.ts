// BC-3.1B — Global Business Networking server-function adapters.
// Thin RPC boundary: authenticate via requireSupabaseAuth, then delegate to the
// GlobalConnectionService bound to the request-scoped Supabase client + userId.
// No business logic, no state machine, no direct DB access here — all reads and
// mutations flow through the service → repository / authoritative RPCs.
//
// Client-safe: only handler bodies ship server-side; every import here is
// client-safe (service/SDK statically import no *.server module).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GlobalConnectionService } from "./global-network/service";
import { GlobalNetworkError } from "./global-network/errors";
import type {
  CounterpartSummary,
  GlobalConnectionDTO,
  GlobalConnectionMutationResult,
  PairState,
  StatusCounts,
} from "./global-network/types";

const sourceSchema = z
  .object({
    type: z.string().optional(),
    id: z.string().uuid().nullable().optional(),
  })
  .optional();

const mutationKeySchema = z.string().min(8).max(200).optional();
const reasonSchema = z.string().max(500).optional();
const uuidSchema = z.string().uuid();

const listSchema = z
  .object({
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .optional();

// ── Mutations ────────────────────────────────────────────────────────────────

export const sendConnectionRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        targetUserId: uuidSchema,
        source: sourceSchema,
        mutationKey: mutationKeySchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.sendRequest(context.supabase, context.userId, {
      targetUserId: data.targetUserId,
      source: data.source as never,
      mutationKey: data.mutationKey,
    });
  });

export const acceptConnectionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ connectionId: uuidSchema, mutationKey: mutationKeySchema }).parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.accept(context.supabase, context.userId, data.connectionId, {
      mutationKey: data.mutationKey,
    });
  });

export const declineConnectionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        connectionId: uuidSchema,
        reason: reasonSchema,
        mutationKey: mutationKeySchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.decline(context.supabase, context.userId, data.connectionId, {
      reason: data.reason,
      mutationKey: data.mutationKey,
    });
  });

export const cancelConnectionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ connectionId: uuidSchema, mutationKey: mutationKeySchema }).parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.cancel(context.supabase, context.userId, data.connectionId, {
      mutationKey: data.mutationKey,
    });
  });

export const disconnectConnectionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        connectionId: uuidSchema,
        reason: reasonSchema,
        mutationKey: mutationKeySchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.disconnect(context.supabase, context.userId, data.connectionId, {
      reason: data.reason,
      mutationKey: data.mutationKey,
    });
  });

export const blockUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        targetUserId: uuidSchema,
        reason: reasonSchema,
        mutationKey: mutationKeySchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GlobalConnectionMutationResult> => {
    return GlobalConnectionService.block(context.supabase, context.userId, data.targetUserId, {
      reason: data.reason,
      mutationKey: data.mutationKey,
    });
  });

// ── Reads ────────────────────────────────────────────────────────────────────

export const getConnectionStateFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ targetUserId: uuidSchema }).parse(input))
  .handler(async ({ data, context }): Promise<PairState> => {
    return GlobalConnectionService.getState(context.supabase, context.userId, data.targetUserId);
  });

export const getConnectionByIdFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ connectionId: uuidSchema }).parse(input))
  .handler(async ({ data, context }): Promise<GlobalConnectionDTO> => {
    return GlobalConnectionService.getById(context.supabase, context.userId, data.connectionId);
  });

export const listIncomingRequestsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input) ?? {})
  .handler(async ({ data, context }): Promise<GlobalConnectionDTO[]> => {
    return GlobalConnectionService.listIncomingRequests(context.supabase, context.userId, data);
  });

export const listOutgoingRequestsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input) ?? {})
  .handler(async ({ data, context }): Promise<GlobalConnectionDTO[]> => {
    return GlobalConnectionService.listOutgoingRequests(context.supabase, context.userId, data);
  });

export const listConnectionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input) ?? {})
  .handler(async ({ data, context }): Promise<GlobalConnectionDTO[]> => {
    return GlobalConnectionService.listConnections(context.supabase, context.userId, data);
  });

export const countConnectionsByStatusFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatusCounts> => {
    return GlobalConnectionService.countByStatus(context.supabase, context.userId);
  });

// ── Public counterpart projection ──────────────────────────────────────────────
// Resolve privacy-safe PUBLIC summaries for a set of counterpart user ids. Only
// PUBLISHED + PUBLIC business cards are exposed, projecting a strict allowlist of
// safe fields. Never returns phone/email, private notes, tags, or internal ids.
// A counterpart with no public card simply has no entry (UI shows a fallback).
export const resolvePublicCounterpartsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userIds: z.array(z.string().uuid()).max(200) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<CounterpartSummary[]> => {
    const ids = Array.from(new Set(data.userIds));
    if (ids.length === 0) return [];
    const { data: rows, error } = await context.supabase
      .from("member_business_cards")
      .select(
        "owner_user_id, display_name, headline, professional_title, company_name, avatar_url, slug, card_kind, status, public_mode",
      )
      .in("owner_user_id", ids)
      .eq("status", "published")
      .eq("public_mode", "public");
    if (error) return [];
    // Prefer the primary card per user; fall back to the first published public one.
    const byUser = new Map<string, CounterpartSummary>();
    for (const r of rows ?? []) {
      const row = r as Record<string, unknown>;
      const uid = row.owner_user_id as string | null;
      if (!uid) continue;
      const isPrimary = row.card_kind === "primary";
      const existing = byUser.get(uid);
      if (existing && !isPrimary) continue;
      byUser.set(uid, {
        userId: uid,
        displayName: (row.display_name as string | null) ?? null,
        avatarUrl: (row.avatar_url as string | null) ?? null,
        headline:
          (row.headline as string | null) ?? (row.professional_title as string | null) ?? null,
        companyName: (row.company_name as string | null) ?? null,
        primaryCardSlug: (row.slug as string | null) ?? null,
      });
    }
    return Array.from(byUser.values());
  });

// Re-export the typed domain error so callers can branch on stable codes.
export { GlobalNetworkError };
