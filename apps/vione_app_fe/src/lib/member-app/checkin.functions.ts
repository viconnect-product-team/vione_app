// P0-A2A · Member PWA check-in — server-authoritative.
// P0-A2B hardening applied:
//   Finding A: rejected scans are NEVER written to `member_checkins`. They go
//              to a separate audit table `member_checkin_rejections` with a
//              scrubbed payload_hash. The canonical attendance ledger stays
//              clean and only contains real successful check-ins.
//   Finding B: idempotency key is a server-side SHA-256 over
//              (association_id | member_code | event_id | "v2") — the raw
//              scope identifiers never travel to the browser, and cross-
//              association collision is impossible because association_id is
//              part of the hash. `member_code` is unique within an
//              association; adding association_id makes the key globally
//              collision-free even if two associations happened to share a
//              member_code.
//   Finding C: replay reads the existing successful row and returns its
//              original checked_at / method / event / status verbatim — no
//              UPDATE, no re-write, no mutation.
//
// Offline policy for P0-A2A/B: OPTION A — online-required.
// The route no longer treats localStorage as canonical state.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CheckinStatus = "success" | "already" | "invalid";

/** Stable, safe error codes surfaced to the client. */
export type CheckinErrorCode =
  | "invalid_payload"
  | "member_not_found"
  | "membership_inactive"
  | "event_not_found"
  | "association_mismatch"
  | "backend_unavailable";

export class CheckinError extends Error {
  code: CheckinErrorCode;
  constructor(code: CheckinErrorCode) {
    super(code);
    this.code = code;
    this.name = "CheckinError";
  }
}

export type MyCheckinRecord = {
  id: string;
  eventId: string | null;
  eventTitle: string;
  status: CheckinStatus;
  method: "qr" | "nfc";
  at: string; // ISO
};

type MemberRow = { code: string; association_id: string; status: string };

/**
 * A user can hold member profiles in several associations. Return them all
 * (active first) so the caller can pick the profile that matches the scanned
 * event instead of failing on a multi-row single().
 */
async function resolveMembers(supabase: any, userId: string): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from("members")
    .select("code, association_id, status")
    .eq("user_id", userId)
    .limit(50);
  if (error) throw new CheckinError("backend_unavailable");
  const rows = (data ?? []) as MemberRow[];
  return [...rows].sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));
}

async function resolveMember(supabase: any, userId: string) {
  const rows = await resolveMembers(supabase, userId);
  return rows[0] ?? null;
}


/**
 * Server-generated idempotency key. Never expose raw scope to the client.
 * Version prefix ("v2") allows future rotations without collision on the
 * unique index `member_checkins_client_id_key`.
 */
function makeClientId(associationId: string, memberCode: string, eventId: string) {
  const h = createHash("sha256")
    .update(`v2|${associationId}|${memberCode}|${eventId}`)
    .digest("hex");
  return `chk:v2:${h}`;
}

function hashPayload(payload: string) {
  return createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

async function recordRejection(params: {
  userId: string;
  associationId: string | null;
  attemptedEventId: string | null;
  reasonCode: CheckinErrorCode;
  payload: string;
  method: "qr" | "nfc";
}) {
  // Rejections use service-role because RLS on `member_checkin_rejections`
  // deliberately forbids client INSERT (audit integrity). This is invoked
  // only AFTER `requireSupabaseAuth` established the caller's identity, so
  // the actor_user_id is not client-controllable.
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("member_checkin_rejections").insert({
      actor_user_id: params.userId,
      association_id: params.associationId,
      attempted_event_id: params.attemptedEventId,
      reason_code: params.reasonCode,
      payload_hash: hashPayload(params.payload),
      method: params.method,
    });
  } catch {
    // Audit logging must never break the primary flow.
  }
}

export const getMyCheckinState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyCheckinRecord[]> => {
    const { supabase, userId } = context;
    const mine = await resolveMembers(supabase, userId);
    if (mine.length === 0) return [];
    const { data, error } = await supabase
      .from("member_checkins")
      .select("id, event_id, event_title, status, method, checked_at")
      .in("member_code", [...new Set(mine.map((m) => m.code))])
      .in("association_id", [...new Set(mine.map((m) => m.association_id))])
      .order("checked_at", { ascending: false })
      .limit(50);

    if (error) throw new CheckinError("backend_unavailable");
    return (data ?? []).map((r: any) => ({
      id: r.id as string,
      eventId: (r.event_id as string | null) ?? null,
      eventTitle: r.event_title as string,
      status: r.status as CheckinStatus,
      method: (r.method as "qr" | "nfc") ?? "qr",
      at: r.checked_at as string,
    }));
  });

const checkinInput = z
  .object({
    payload: z.string().trim().min(1).max(200),
    method: z.enum(["qr", "nfc"]),
  })
  .strict();

export const checkInMyself = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => {
    const parsed = checkinInput.safeParse(raw);
    if (!parsed.success) throw new CheckinError("invalid_payload");
    return parsed.data;
  })
  .handler(async ({ data, context }): Promise<MyCheckinRecord> => {
    const { supabase, userId } = context;

    const mine = await resolveMembers(supabase, userId);
    if (mine.length === 0) {
      await recordRejection({
        userId,
        associationId: null,
        attemptedEventId: null,
        reasonCode: "member_not_found",
        payload: data.payload,
        method: data.method,
      });
      throw new CheckinError("member_not_found");
    }

    // Only the scanned event id is trusted from the client — the title and
    // association scope are re-derived from the DB.
    const eventId = data.payload;
    const { data: ev, error: eErr } = await supabase
      .from("events")
      .select("id, name, association_id")
      .eq("id", eventId)
      .maybeSingle();
    if (eErr) throw new CheckinError("backend_unavailable");

    if (!ev) {
      await recordRejection({
        userId,
        associationId: mine[0].association_id,
        attemptedEventId: null,
        reasonCode: "event_not_found",
        payload: data.payload,
        method: data.method,
      });
      throw new CheckinError("event_not_found");
    }

    // Pick the member profile that belongs to the scanned event's association.
    const eventAssociationId = (ev as any).association_id as string;
    const scoped = mine.filter((m) => m.association_id === eventAssociationId);
    if (scoped.length === 0) {
      await recordRejection({
        userId,
        associationId: mine[0].association_id,
        attemptedEventId: eventId,
        reasonCode: "association_mismatch",
        payload: data.payload,
        method: data.method,
      });
      throw new CheckinError("association_mismatch");
    }
    const me = scoped[0];
    if (me.status !== "active") {
      await recordRejection({
        userId,
        associationId: me.association_id,
        attemptedEventId: eventId,
        reasonCode: "membership_inactive",
        payload: data.payload,
        method: data.method,
      });
      throw new CheckinError("membership_inactive");
    }


    // Finding C — replay: return the original authoritative record without
    // touching it. Reads only; RLS enforces self-scope.
    const { data: prior, error: pErr } = await supabase
      .from("member_checkins")
      .select("id, event_id, event_title, method, checked_at")
      .eq("member_code", me.code)
      .eq("event_id", ev.id)
      .eq("association_id", me.association_id)
      .eq("status", "success")
      .maybeSingle();
    if (pErr) throw new CheckinError("backend_unavailable");

    if (prior) {
      const r = prior as any;
      return {
        id: r.id,
        eventId: r.event_id,
        eventTitle: r.event_title,
        status: "already",
        method: r.method as "qr" | "nfc",
        at: r.checked_at,
      };
    }

    // Finding B — server-generated, association-scoped idempotency key.
    const clientId = makeClientId(me.association_id, me.code, ev.id);
    const now = new Date().toISOString();

    const { data: upserted, error } = await supabase
      .from("member_checkins")
      .upsert(
        {
          client_id: clientId,
          member_code: me.code,
          event_id: ev.id,
          event_title: ev.name,
          status: "success",
          method: data.method,
          checked_at: now,
          association_id: me.association_id,
        },
        { onConflict: "client_id", ignoreDuplicates: false },
      )
      .select("id, event_id, event_title, method, checked_at")
      .maybeSingle();
    if (error) throw new CheckinError("backend_unavailable");

    const r = upserted as any;
    return {
      id: r.id,
      eventId: r.event_id,
      eventTitle: r.event_title,
      status: "success",
      method: (r.method as "qr" | "nfc") ?? data.method,
      at: r.checked_at,
    };
  });
