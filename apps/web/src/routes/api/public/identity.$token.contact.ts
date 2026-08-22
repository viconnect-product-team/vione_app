// BC-Mobile-5D — POST /api/public/identity/<token>/contact (ANONYMOUS).
//
// Share Contact back from a Public Digital Card. Mirrors the BC-Mobile-3B
// frozen contract on /api/public/card/<slug>/contact — same response shapes
// (guestShareSuccess/guestShareError), same honeypot semantics, same
// payload-less telemetry — with one difference: the owner is resolved via
// the opaque share token → active share link → active identity, and the row
// carries source_identity_id (XOR with source_card_id, enforced in the DB).
//
// Public/anonymous resolver invariants (platform-wide contract):
// - Privileged writes happen server-side AFTER verification.
// - Per-IP + per-token rate limits; the token bucket key lives in memory
//   only (never logged, never returned).
// - ONE neutral failure shape for token resolution (card_unavailable) — no
//   enumeration oracle: invalid, revoked, rotated-away, and disabled all
//   look identical.
// - Identity content (email/phone duplication) is NEVER disclosed to the
//   guest.

import { createFileRoute } from "@tanstack/react-router";
import {
  GUEST_CONSENT_VERSION,
  GUEST_SOURCE_PUBLIC_CARD_EXCHANGE,
  guestShareError,
  guestShareSuccess,
  normalizeGuestEmail,
  normalizeGuestPhone,
  validateGuestContactSubmission,
  type GuestShareResponse,
} from "@/lib/business-card/guest-contact";
import { isValidPublicToken } from "@/lib/business-connect/mobile/identity.validation";
import { allowPublicRequest, clientKey } from "@/lib/public-rate-limit";
import { reportIdentityMetric } from "@/lib/business-connect/mobile/identity.telemetry";

// Same budget as the 3B member-card exchange.
const CONTACT_RATE_LIMIT_PER_IP = 8;
const CONTACT_RATE_LIMIT_PER_TOKEN = 20;
const RATE_WINDOW_MS = 60_000;

function json(body: GuestShareResponse, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

type GuestRow = {
  id: string;
  email: string | null;
  phone: string | null;
  display_name?: string | null;
  company_name?: string | null;
  title?: string | null;
  share_count?: number | null;
};

export const Route = createFileRoute("/api/public/identity/$token/contact")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!allowPublicRequest(clientKey(request), CONTACT_RATE_LIMIT_PER_IP, RATE_WINDOW_MS)) {
          return json(guestShareError("rate_limited"), 429);
        }

        // Token shape gate before ANY lookup.
        const token = params.token ?? "";
        if (!isValidPublicToken(token)) {
          return json(guestShareError("card_unavailable"), 404);
        }
        if (
          !allowPublicRequest(
            `identity-contact:${token}`,
            CONTACT_RATE_LIMIT_PER_TOKEN,
            RATE_WINDOW_MS,
          )
        ) {
          return json(guestShareError("rate_limited"), 429);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(guestShareError("invalid_payload"), 400);
        }

        // Silent-drop honeypot: the real form has no "website" field — a bot
        // that fills it gets a plausible success and nothing is persisted.
        if (typeof body === "object" && body !== null) {
          const hp = (body as Record<string, unknown>).website;
          if (typeof hp === "string" && hp.trim() !== "") {
            return json(guestShareSuccess("created"), 200);
          }
        }

        // ONE validator for the whole app (mirrored client-side).
        const validated = validateGuestContactSubmission(body);
        if (!validated.ok) {
          return json(guestShareError("invalid_payload", validated.detail), 400);
        }
        const d = validated.data;

        try {
          // Privileged work — the route handler verified the request first.
          // An untyped client is required because source_identity_id predates
          // the generated Database types; every value below is validated.
          const { createClient } = await import("@supabase/supabase-js");
          const admin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );

          // ── Resolve owner (token → active link → active identity) ──
          const { data: linkRaw } = await admin
            .from("identity_share_links")
            .select("id, identity_id")
            .eq("public_token", token)
            .eq("status", "active")
            .maybeSingle();
          const link = linkRaw as { id: string; identity_id: string } | null;
          if (!link?.identity_id) {
            return json(guestShareError("card_unavailable"), 404);
          }
          const { data: identityRaw } = await admin
            .from("business_identities")
            .select("id, owner_user_id, status")
            .eq("id", link.identity_id)
            .maybeSingle();
          const identity = identityRaw as {
            id: string;
            owner_user_id: string;
            status: string;
          } | null;
          if (!identity || identity.status !== "active") {
            return json(guestShareError("card_unavailable"), 404);
          }
          const ownerId = identity.owner_user_id;

          // ── Idempotent replay (one row per identity + session token) ──
          const { data: replayRaw } = await admin
            .from("guest_contacts")
            .select("id")
            .eq("source_identity_id", identity.id)
            .eq("client_token", d.clientToken)
            .limit(1)
            .maybeSingle();
          if (replayRaw) {
            return json(guestShareSuccess("replay"), 200);
          }

          // ── Contact-level dedupe (owner-scoped, content NEVER disclosed) ──
          const emailNorm = normalizeGuestEmail(d.email ?? "");
          const phoneNorm = normalizeGuestPhone(d.phone ?? "");
          let existing: GuestRow | null = null;
          let ambiguous = false;
          if (emailNorm) {
            const { data: emailRows } = await admin
              .from("guest_contacts")
              .select("id, email, phone")
              .eq("owner_user_id", ownerId)
              .ilike("email", emailNorm)
              .order("first_shared_at", { ascending: true })
              .limit(1);
            const row = (emailRows?.[0] ?? null) as GuestRow | null;
            if (row) {
              existing = row;
              if (phoneNorm) {
                const rowPhone = (row.phone ?? "").replace(/[^0-9+]/g, "");
                if (rowPhone && rowPhone !== phoneNorm) ambiguous = true;
              }
            }
          }
          if (!existing && !ambiguous && phoneNorm) {
            const { data: phoneRows } = await admin
              .from("guest_contacts")
              .select("id, email, phone")
              .eq("owner_user_id", ownerId)
              .not("phone", "is", null)
              .order("first_shared_at", { ascending: true })
              .limit(200);
            const match = ((phoneRows ?? []) as GuestRow[]).find(
              (row) => (row.phone ?? "").replace(/[^0-9+]/g, "") === phoneNorm,
            );
            if (match) {
              if (emailNorm && match.email && normalizeGuestEmail(match.email) !== emailNorm) {
                ambiguous = true;
              } else {
                existing = match;
              }
            }
          }

          if (existing && !ambiguous) {
            // Merge-update the existing contact, preserving the ORIGINAL
            // provenance (first touch wins).
            const { data: freshRaw } = await admin
              .from("guest_contacts")
              .select("display_name, phone, email, company_name, title, share_count")
              .eq("id", existing.id)
              .single();
            const fresh = freshRaw as GuestRow | null;
            const merged: Record<string, unknown> = {
              last_shared_at: new Date().toISOString(),
              share_count: (fresh?.share_count ?? 1) + 1,
            };
            if (!fresh?.display_name && d.displayName) merged["display_name"] = d.displayName;
            if (!fresh?.phone && d.phone) merged["phone"] = d.phone;
            if (!fresh?.email && d.email) merged["email"] = d.email;
            if (!fresh?.company_name && d.companyName) merged["company_name"] = d.companyName;
            if (!fresh?.title && d.title) merged["title"] = d.title;
            await admin.from("guest_contacts").update(merged).eq("id", existing.id);
            reportIdentityMetric("PUBLIC_CARD_SHARE_CONTACT_SUBMITTED");
            return json(guestShareSuccess("merged"), 200);
          }

          const { error: insertErr } = await admin.from("guest_contacts").insert({
            source_card_id: null,
            source_identity_id: identity.id,
            owner_user_id: ownerId,
            display_name: d.displayName,
            company_name: d.companyName,
            title: d.title,
            phone: d.phone,
            email: d.email,
            source: GUEST_SOURCE_PUBLIC_CARD_EXCHANGE,
            consent_version: GUEST_CONSENT_VERSION,
            client_token: d.clientToken,
          });
          if (insertErr) {
            reportIdentityMetric("PUBLIC_CARD_SHARE_CONTACT_FAILED");
            // Unique-violation → a concurrent request already replayed this
            // session token; return the neutral replay state.
            if ((insertErr as { code?: string }).code === "23505") {
              return json(guestShareSuccess("replay"), 200);
            }
            console.error("[identity-contact] insert failed");
            return json(guestShareError("submission_failed"), 500);
          }
          reportIdentityMetric("PUBLIC_CARD_SHARE_CONTACT_SUBMITTED");
          return json(guestShareSuccess("created"), 200);
        } catch (e) {
          console.error("[identity-contact] unexpected failure:", e);
          return json(guestShareError("submission_failed"), 500);
        }
      },
    },
  },
});
