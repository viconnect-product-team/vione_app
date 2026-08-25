// Unified server-side Member Context resolver for the Member PWA (/m/*).
//
// P0-A1 foundation. Consolidates the identity/tenant lookups already scattered
// across member-app/*.functions.ts (resolveAssociationId + resolveMemberCode)
// behind a single server function that returns ONLY a member-safe DTO.
//
// Rules:
//   - Identity is derived server-side from the authenticated Supabase user.
//   - Nothing on the client may override memberId / associationId / role.
//   - Fails closed (returns null / throws) when unauthenticated, no member
//     row, or membership is not active for the current association.
//   - Never returns service-role data, provider secrets, audit fields, or
//     raw tenant ownership beyond the safe DTO below.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAssociationId } from "./member-app/shared";
import { resolveMemberCode } from "./member-identity";

export type MemberContextDTO = {
  /** Stable member code used across the app (never the raw auth user id). */
  memberCode: string | null;
  /** Active association slug/id resolved server-side. */
  associationId: string | null;
  /** Display fields safe to render in the shell (no PII beyond name/email). */
  displayName: string;
  email: string;
  avatarUrl: string | null;
  /** Membership lifecycle state, as reported by the members table. */
  membershipStatus: "active" | "pending" | "suspended" | "expired" | "unknown";
  /** True when the member is allowed to perform authoring actions
   *  (renew, register, check-in, express interest, update profile). */
  canAct: boolean;
  /** Preferred locale from the profile row, if any. */
  locale: string | null;
};

export const getCurrentMemberContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MemberContextDTO> => {
    const { supabase, userId, user } = context;

    const associationId = await resolveAssociationId(supabase, userId);
    const memberCode = await resolveMemberCode(supabase, userId);

    let name = "";
    let email = user?.email ?? "";
    let avatarUrl: string | null = null;
    let status: MemberContextDTO["membershipStatus"] = "unknown";
    let locale: string | null = null;

    if (memberCode) {
      const { data: m } = await supabase
        .from("members")
        .select("name, email, avatar, status")
        .eq("user_id", userId)
        .maybeSingle();
      if (m) {
        name = (m as any).name ?? "";
        email = (m as any).email ?? email;
        avatarUrl = (m as any).avatar ?? null;
        const raw = String((m as any).status ?? "").toLowerCase();
        status =
          raw === "active" || raw === "pending" || raw === "suspended" || raw === "expired"
            ? (raw as MemberContextDTO["membershipStatus"])
            : "unknown";
      }
    }

    if (!name) {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, locale")
        .eq("id", userId)
        .maybeSingle();
      name = (p as any)?.full_name ?? name;
      locale = (p as any)?.locale ?? null;
    }

    const canAct = Boolean(memberCode) && status === "active";

    return {
      memberCode,
      associationId,
      displayName: name || email || "",
      email,
      avatarUrl,
      membershipStatus: status,
      canAct,
      locale,
    };
  });
