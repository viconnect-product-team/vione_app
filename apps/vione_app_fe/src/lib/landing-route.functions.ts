import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

/**
 * Resolve where a user should land after sign-in.
 * - Platform admins and association admins → "/" (admin dashboard)
 * - Plain members → "/m" (member PWA)
 * Identity is derived server-side from the JWT, never client input.
 *
 * Emits structured telemetry on every decision so wrong-route or
 * data-fetch failures are discoverable in server-function logs.
 */
export const getPostLoginRouteFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<"/" | "/m"> => {
    const { userId } = context;
    const supabase = getDb(context);
    const t0 = Date.now();

    const { data: isPlatform, error: platformErr } = await supabase.rpc("is_platform_admin");
    if (platformErr) {
      console.warn(
        "[post-login-route] is_platform_admin failed",
        JSON.stringify({ userId, error: platformErr.message }),
      );
    }
    if (isPlatform) {
      console.info(
        "[post-login-route] decided",
        JSON.stringify({ userId, to: "/", reason: "platform_admin", ms: Date.now() - t0 }),
      );
      return "/";
    }

    const { data: memberships, error: membershipErr } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", userId);

    if (membershipErr) {
      // Fail safe: route to member PWA but flag the lookup failure loudly.
      console.error(
        "[post-login-route] memberships lookup failed — defaulting to /m",
        JSON.stringify({ userId, error: membershipErr.message }),
      );
      return "/m";
    }

    const roles = (memberships ?? []).map((m: any) => m.role);
    const isAdmin = roles.some((r: any) => r === "admin" || r === "association_admin");
    const to = isAdmin ? "/" : "/m";

    console.info(
      "[post-login-route] decided",
      JSON.stringify({
        userId,
        to,
        reason: isAdmin ? "association_admin" : "member",
        membershipCount: roles.length,
        ms: Date.now() - t0,
      }),
    );

    return to;
  });
