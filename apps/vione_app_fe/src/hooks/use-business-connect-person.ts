// BC-Mobile-2C — Person Detail resolution hook (read-only).
//
// Contract: docs/business-connect/mobile/BC_MOBILE_2C_PERSON_DATA_CONTRACT.md
//
// Resolves the opaque `$personId` (`u:<userId>` | `c:<targetCardId>`) into ONE
// normalized, whitelist-only DTO for the Person Detail surface. Fail-closed:
// any authorization or existence failure collapses into a single "unavailable"
// status — the page never reveals which check failed.
//
// Sources (all FROZEN, no new server functions):
// - Authorization (u:): GlobalNetworkSDK.connections.getState → must be
//   accepted (and not blocked). Relationship edge: getById(connectionId).
// - Identity (u:): resolvePublic (privacy-safe public counterpart summary).
// - Authorization + identity (c:): SavedCardSDK.search (owner-scoped;
//   the saved edge existing for THIS viewer IS the authorization).
// - Contact channels (both): BusinessCardSDK.getPublic(slug) — published +
//   public cards only (anon-key RLS), additionally gated by the card's own
//   visibilitySettings (showContact / showSocial), mirroring /b/{slug}.
//
// Frozen OUT: saved notes/tags/reminders/metAt, connection/card internal ids,
// timeline preview, next-meeting context (see contract §3). No mutations, no
// analytics side effects.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";
import { SavedCardSDK } from "@/lib/business-card/saved-card.sdk";
import { BusinessCardSDK } from "@/lib/business-card/business-card.sdk";
import { GuestContactSDK } from "@/lib/business-card/guest-contact.sdk";
import type { PublicBusinessCard } from "@/lib/business-card/public-card";
import type { GuestContact } from "@/lib/business-card/guest-contact";

// ── DTO (whitelist — contract §4) ───────────────────────────────────────────

export type BcMobilePersonRelationship =
  | { kind: "connected"; connectedAt: string | null; requestedByViewer: boolean | null }
  | { kind: "saved"; savedAt: string | null; favorite: boolean }
  // BC-Mobile-4B — `source` distinguishes a consent-based exchange from a
  // paper-card scan so the UI states provenance truthfully.
  | { kind: "guest"; sharedAt: string | null; source: string | null };

export type BcMobilePersonContact = {
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  emailHref: string | null;
  websiteLabel: string | null;
  websiteHref: string | null;
  social: { type: string; href: string }[];
};

export type BcMobilePersonDetail = {
  personId: string;
  kind: "connection" | "saved_card" | "guest_contact";
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  companyName: string | null;
  primaryCardSlug: string | null;
  relationship: BcMobilePersonRelationship;
  contact: BcMobilePersonContact | null;
};

export type BcMobilePersonResult =
  | { status: "ok"; person: BcMobilePersonDetail }
  | { status: "unavailable" };

// ── Person id parsing (contract §1) ─────────────────────────────────────────

const PERSON_ID_RE =
  /^([ucg]):([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

export type ParsedPersonId = { kind: "connection" | "saved_card" | "guest_contact"; id: string };

export function parseBcMobilePersonId(raw: string): ParsedPersonId | null {
  const m = PERSON_ID_RE.exec(raw);
  if (!m) return null;
  const kind = m[1] === "u" ? "connection" : m[1] === "c" ? "saved_card" : "guest_contact";
  return { kind, id: m[2]!.toLowerCase() };
}

// ── URL & channel sanitization (contract §5) ────────────────────────────────

/** tel: href with a strict character allowlist; null when nothing survives. */
export function sanitizePhoneHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+()\-.\s]/g, "").trim();
  return cleaned.length >= 3 ? `tel:${cleaned}` : null;
}

/** mailto: href for a single recipient; rejects headers/commas/whitespace. */
export function sanitizeEmailHref(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  if (!/^[^\s@?,;]+@[^\s@?,;]+\.[^\s@?,;]+$/.test(trimmed)) return null;
  return `mailto:${trimmed}`;
}

/** http(s) URL via the URL parser — javascript:/data:/protocol-relative die here. */
export function sanitizeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Host-only label for a sanitized http(s) href (never the raw string). */
export function hostLabelOf(href: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href).host || null;
  } catch {
    return null;
  }
}

// ── Contact builder (visibility-gated; contract §2/§4) ─────────────────────

type ContactCardFields = Pick<
  PublicBusinessCard,
  | "workPhone"
  | "workEmail"
  | "website"
  | "linkedinUrl"
  | "facebookUrl"
  | "zaloUrl"
  | "youtubeUrl"
  | "tiktokUrl"
>;

const SOCIAL_FIELDS = [
  ["linkedin", "linkedinUrl"],
  ["facebook", "facebookUrl"],
  ["zalo", "zaloUrl"],
  ["youtube", "youtubeUrl"],
  ["tiktok", "tiktokUrl"],
] as const;

/**
 * Builds the whitelist contact DTO from the PUBLIC card projection
 * (`PublicBusinessCard`). BC-Mobile-3A: visibility flags are hard gates
 * applied SERVER-SIDE in `toPublicBusinessCard` — hidden fields arrive as
 * null — so this builder only sanitizes what survives.
 */
export function buildPersonContact(card: ContactCardFields): BcMobilePersonContact {
  const phone = card.workPhone ?? null;
  const email = card.workEmail ?? null;
  const websiteHref = sanitizeHttpUrl(card.website);

  const social: { type: string; href: string }[] = [];
  for (const [type, field] of SOCIAL_FIELDS) {
    const href = sanitizeHttpUrl(card[field]);
    if (href) social.push({ type, href });
  }

  return {
    phone,
    phoneHref: sanitizePhoneHref(phone),
    email,
    emailHref: sanitizeEmailHref(email),
    websiteLabel: hostLabelOf(websiteHref),
    websiteHref,
    social,
  };
}

// ── Resolution (fail-closed; contract §2) ───────────────────────────────────

const UNAVAILABLE: BcMobilePersonResult = { status: "unavailable" };

async function resolveConnectionPerson(
  personId: string,
  userId: string,
): Promise<BcMobilePersonResult> {
  // 1. Authorization: the pair must be ACCEPTED (and not blocked).
  const state = await GlobalNetworkSDK.connections.getState(userId);
  if (state.status !== "accepted" || state.blocked || state.direction === "self") {
    return UNAVAILABLE;
  }
  if (!state.connectionId) return UNAVAILABLE;

  // 2. Authoritative relationship edge (participant-scoped).
  const connection = await GlobalNetworkSDK.connections
    .getById(state.connectionId)
    .catch(() => null);
  if (!connection || connection.status !== "accepted") return UNAVAILABLE;

  // 3. Identity: privacy-safe public counterpart summary (may be absent →
  //    private-member fallback, same as the 2A list).
  const summaries = await GlobalNetworkSDK.counterparts.resolvePublic([userId]).catch(() => []);
  const s = summaries.find((x) => x.userId === userId) ?? null;

  return {
    status: "ok",
    person: {
      personId,
      kind: "connection",
      displayName: s?.displayName ?? null,
      avatarUrl: s?.avatarUrl ?? null,
      headline: s?.headline ?? null,
      companyName: s?.companyName ?? null,
      primaryCardSlug: s?.primaryCardSlug ?? null,
      relationship: {
        kind: "connected",
        connectedAt: connection.respondedAt ?? null,
        requestedByViewer: connection.requestedByCurrentUser ?? null,
      },
      contact: null, // filled by the caller when a slug exists
    },
  };
}

async function resolveSavedCardPerson(
  personId: string,
  targetCardId: string,
): Promise<BcMobilePersonResult> {
  // Owner-scoped search IS the authorization: the edge must exist for THIS
  // viewer. Same call as the 2A list — the service defaults to non-archived
  // and returns the viewer's bounded set.
  const cards = await SavedCardSDK.search({});
  const hit = cards.find((c) => c.targetCardId === targetCardId);
  if (!hit) return UNAVAILABLE;
  return {
    status: "ok",
    person: {
      personId,
      kind: "saved_card",
      displayName: hit.target?.displayName ?? null,
      avatarUrl: hit.target?.avatarUrl ?? null,
      headline: hit.target?.professionalTitle ?? null,
      companyName: hit.target?.companyName ?? null,
      primaryCardSlug: hit.target?.slug ?? null,
      relationship: {
        kind: "saved",
        savedAt: hit.savedAt ?? null,
        favorite: !!hit.favorite,
      },
      contact: null,
    },
  };
}

async function loadContact(slug: string | null): Promise<BcMobilePersonContact | null> {
  if (!slug) return null;
  try {
    const pub = await BusinessCardSDK.getPublic(slug);
    // members_only / not_found → channels are omitted, NOT an error.
    if (pub.state !== "public") return null;
    return buildPersonContact(pub.card);
  } catch {
    return null;
  }
}

/** BC-Mobile-3B — contact channels come from the GUEST row itself: exactly
 * the phone/email the guest explicitly shared with the owner. No social
 * links (the guest never provided a card).
 * BC-Mobile-4B — scanned cards MAY carry a website (OCR-confirmed); it is
 * sanitized through the same http(s)-only gate as public cards. */
export function buildGuestContact(g: GuestContact): BcMobilePersonContact {
  const websiteHref = sanitizeHttpUrl(g.website);
  return {
    phone: g.phone,
    phoneHref: sanitizePhoneHref(g.phone),
    email: g.email,
    emailHref: sanitizeEmailHref(g.email),
    websiteLabel: hostLabelOf(websiteHref),
    websiteHref,
    social: [],
  };
}

/** BC-Mobile-3B — resolves `g:<guestId>`. The owner-scoped guest_contacts
 * read (RLS) IS the authorization — same fail-closed posture as 2C. */
async function resolveGuestPerson(
  personId: string,
  guestId: string,
): Promise<BcMobilePersonResult> {
  const g = await GuestContactSDK.getMine(guestId).catch(() => null);
  if (!g) return UNAVAILABLE;
  return {
    status: "ok",
    person: {
      personId,
      kind: "guest_contact",
      displayName: g.displayName,
      avatarUrl: null,
      headline: g.title,
      companyName: g.companyName,
      primaryCardSlug: null,
      relationship: { kind: "guest", sharedAt: g.firstSharedAt, source: g.source },
      contact: buildGuestContact(g),
    },
  };
}

// ── Hook ────────────────────────────────────────────────────────────────────

export type UseBusinessConnectPersonResult = {
  status: "loading" | "error" | "unavailable" | "ok";
  person: BcMobilePersonDetail | null;
  retry: () => void;
};

export function useBusinessConnectPerson(personId: string): UseBusinessConnectPersonResult {
  const viewerId = useViewerUserId();
  const queryClient = useQueryClient();
  const queryKey = ["bc-mobile", "person", viewerId ?? "anonymous", personId] as const;

  const query = useQuery({
    queryKey,
    enabled: viewerId != null,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    queryFn: async (): Promise<BcMobilePersonResult> => {
      const parsed = parseBcMobilePersonId(personId);
      if (!parsed) return UNAVAILABLE;

      // Guest contacts carry their own contact channels — no card lookup.
      if (parsed.kind === "guest_contact") {
        return resolveGuestPerson(personId, parsed.id);
      }

      const base =
        parsed.kind === "connection"
          ? await resolveConnectionPerson(personId, parsed.id)
          : await resolveSavedCardPerson(personId, parsed.id);
      if (base.status !== "ok") return base;

      const contact = await loadContact(base.person.primaryCardSlug);
      return { status: "ok", person: { ...base.person, contact } };
    },
  });

  const retry = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  if (viewerId == null || query.isPending) {
    return { status: "loading", person: null, retry };
  }
  if (query.isError) {
    return { status: "error", person: null, retry };
  }
  const data = query.data;
  if (!data || data.status !== "ok") {
    return { status: "unavailable", person: null, retry };
  }
  return { status: "ok", person: data.person, retry };
}
