// BC-Mobile-4B — duplicate resolve + canonical save RPCs (thin).
//
// Both functions are authenticated (requireSupabaseAuth) and delegate ALL
// domain decisions to the SECURITY DEFINER SQL RPCs:
//   resolve_card_scan_duplicates — read-only, owner-scoped, deterministic.
//   save_scanned_guest_contact   — server authority: re-normalizes,
//     re-computes duplicate state in-transaction (TOCTOU), enforces the
//     explicit human resolution, idempotent on (owner, client_token).
//
// The browser can never force a match state, pick another owner's guest, or
// skip the human decision: the SQL recomputes everything. These wrappers add
// only input shape validation, rate budgets, telemetry, and DTO mapping.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { allowPublicRequest } from "@/lib/public-rate-limit";
import { parseBcMobilePersonId } from "./person-journey.types";
import { reportCardScanMetric } from "./card-scan.telemetry";
import type {
  ScanDuplicateCandidate,
  ScanDuplicateResolution,
  ScanDuplicateState,
  ScanSaveResponse,
} from "./card-scan.review";

const RESOLVE_RATE_LIMIT = 60;
const SAVE_RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// ── Resolve duplicates (read-only) ───────────────────────────────────────────

const resolveInput = z.object({
  email: z.string().max(320).nullable(),
  phone: z.string().max(80).nullable(),
  // Tiered matching (name + organization) — null/omitted → exact-tier only.
  displayName: z.string().max(240).nullish(),
  companyName: z.string().max(280).nullish(),
});

const STATES: readonly ScanDuplicateState[] = ["none", "exact", "ambiguous"];
const KINDS = ["guest", "saved_card", "connection"] as const;
const LEVELS = ["exact", "strong", "possible"] as const;
const REASONS = [
  "phone",
  "email",
  "phone_email",
  "name_company",
  "name_domain",
  "name",
  "company",
] as const;

/** Defensive mapping of the RPC jsonb — anything unexpected becomes `none`. */
export function mapResolveResponse(raw: unknown): ScanDuplicateResolution {
  if (typeof raw !== "object" || raw === null) return { state: "none", candidates: [] };
  const body = raw as Record<string, unknown>;
  const state = STATES.includes(body.state as ScanDuplicateState)
    ? (body.state as ScanDuplicateState)
    : "none";
  const list = Array.isArray(body.candidates) ? body.candidates : [];
  const candidates: ScanDuplicateCandidate[] = [];
  for (const c of list.slice(0, 12)) {
    if (typeof c !== "object" || c === null) continue;
    const r = c as Record<string, unknown>;
    if (typeof r.personId !== "string") continue;
    if (!parseBcMobilePersonId(r.personId)) continue;
    if (!KINDS.includes(r.kind as (typeof KINDS)[number])) continue;
    if (!LEVELS.includes(r.matchLevel as (typeof LEVELS)[number])) continue;
    if (!REASONS.includes(r.reason as (typeof REASONS)[number])) continue;
    candidates.push({
      personId: r.personId,
      kind: r.kind as ScanDuplicateCandidate["kind"],
      displayName: typeof r.displayName === "string" ? r.displayName : null,
      title: typeof r.title === "string" ? r.title : null,
      companyName: typeof r.companyName === "string" ? r.companyName : null,
      matchLevel: r.matchLevel as ScanDuplicateCandidate["matchLevel"],
      reason: r.reason as ScanDuplicateCandidate["reason"],
    });
  }
  if (state === "exact" && (candidates.length !== 1 || candidates[0]?.matchLevel !== "exact")) {
    return { state: "none", candidates: [] };
  }
  if (state === "none") return { state: "none", candidates: [] };
  return { state, candidates };
}

export const bcMobileCardScanResolveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => resolveInput.parse(data))
  .handler(async ({ data, context }): Promise<ScanDuplicateResolution> => {
    if (
      !allowPublicRequest(`bc-ocr-resolve:${context.userId}`, RESOLVE_RATE_LIMIT, RATE_WINDOW_MS)
    ) {
      return { state: "none", candidates: [] };
    }
    const sb = context.supabase as unknown as SupabaseClient;
    const { data: raw, error } = await sb.rpc("resolve_card_scan_duplicates", {
      p_email: data.email,
      p_phone: data.phone,
      p_display_name: data.displayName ?? null,
      p_company_name: data.companyName ?? null,
    });
    if (error) return { state: "none", candidates: [] };
    const resolution = mapResolveResponse(raw);
    if (resolution.state === "ambiguous") reportCardScanMetric("OCR_REVIEW_AMBIGUOUS");
    return resolution;
  });

// ── Canonical save ───────────────────────────────────────────────────────────

const FIELD_KEYS = [
  "displayName",
  "phone",
  "email",
  "companyName",
  "title",
  "website",
  "address",
] as const;

const saveInput = z.object({
  clientToken: z.string().uuid(),
  scanId: z.string().uuid(),
  displayName: z.string().max(240),
  phone: z.string().max(80).nullable(),
  email: z.string().max(320).nullable(),
  companyName: z.string().max(280).nullable(),
  title: z.string().max(240).nullable(),
  website: z.string().max(280).nullable(),
  address: z.string().max(320).nullable(),
  resolution: z.enum(["new", "update"]),
  /** Required when resolution = "update"; must be a `g:<uuid>` person ref. */
  targetPersonId: z.string().max(64).nullable(),
  /** Human-decision proof: the duplicate sheet's explicit "save as new". */
  confirmedNew: z.boolean().optional(),
  /** Per-field merge choices on update ('card' overwrites; default keeps). */
  fieldChoices: z.record(z.enum(FIELD_KEYS), z.enum(["current", "card"])).nullish(),
});

const SAVE_RESULTS = ["created", "updated", "replay"] as const;
const SAVE_ERRORS = [
  "unauthorized",
  "invalid_payload",
  "match_conflict",
  "not_found",
  "submission_failed",
] as const;

export const bcMobileCardScanSaveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveInput.parse(data))
  .handler(async ({ data, context }): Promise<ScanSaveResponse> => {
    if (!allowPublicRequest(`bc-ocr-save:${context.userId}`, SAVE_RATE_LIMIT, RATE_WINDOW_MS)) {
      return { ok: false, code: "rate_limited" };
    }

    // The update target must be a guest person ref — never a raw uuid, never
    // a u:/c: ref (another user's canonical identity is immutable from OCR).
    let targetGuestId: string | null = null;
    if (data.resolution === "update") {
      const parsed = data.targetPersonId ? parseBcMobilePersonId(data.targetPersonId) : null;
      if (!parsed || parsed.kind !== "guest_contact") {
        return { ok: false, code: "invalid_payload", detail: "target_required" };
      }
      targetGuestId = parsed.id;
    }

    const sb = context.supabase as unknown as SupabaseClient;
    const { data: raw, error } = await sb.rpc("save_scanned_guest_contact", {
      p_client_token: data.clientToken,
      p_scan_id: data.scanId,
      p_display_name: data.displayName,
      p_phone: data.phone,
      p_email: data.email,
      p_company_name: data.companyName,
      p_title: data.title,
      p_website: data.website,
      p_address: data.address,
      p_resolution: data.resolution,
      p_target_guest_id: targetGuestId,
      p_confirmed_new: data.confirmedNew === true,
      p_field_choices: data.fieldChoices ?? null,
    });
    if (error) return { ok: false, code: "failed" };

    const body = (raw ?? {}) as Record<string, unknown>;
    if (body.ok === true && SAVE_RESULTS.includes(body.result as (typeof SAVE_RESULTS)[number])) {
      const personId = typeof body.personId === "string" ? body.personId : "";
      if (!parseBcMobilePersonId(personId)) return { ok: false, code: "failed" };
      if (body.result === "created") reportCardScanMetric("OCR_REVIEW_SAVED_NEW");
      else if (body.result === "updated") reportCardScanMetric("OCR_REVIEW_MATCHED_EXISTING");
      return {
        ok: true,
        result: body.result as (typeof SAVE_RESULTS)[number],
        personId,
        displayName: typeof body.displayName === "string" ? body.displayName : "",
        title: typeof body.title === "string" ? body.title : null,
        companyName: typeof body.companyName === "string" ? body.companyName : null,
      };
    }
    const err = SAVE_ERRORS.includes(body.error as (typeof SAVE_ERRORS)[number])
      ? (body.error as string)
      : "failed";
    const mapped =
      err === "unauthorized"
        ? "unauthorized"
        : err === "match_conflict"
          ? "match_conflict"
          : err === "not_found"
            ? "not_found"
            : err === "invalid_payload"
              ? "invalid_payload"
              : "failed";
    return {
      ok: false,
      code: mapped,
      ...(typeof body.detail === "string" ? { detail: body.detail } : {}),
    };
  });
