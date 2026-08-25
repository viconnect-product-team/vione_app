import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { PLATFORM_APP_HOSTS } from "@/lib/tenant";

// Resolve Supabase env at runtime, falling back to build-time inlined VITE vars.
// Some runtimes don't expose process.env to server fns, which made createClient
// throw "supabaseUrl is required.".
function publicSupabase() {
  const url = (
    process.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  ).trim();
  const key = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  // Validate presence (catches empty/whitespace-only values too).
  if (!url || !key) {
    throw new Error("Missing Supabase environment variable(s). Connect Supabase in Lovable Cloud.");
  }

  // Validate the URL is a well-formed http(s) URL before handing it to
  // createClient, which otherwise throws an opaque "supabaseUrl is required.".
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid SUPABASE_URL value: "${url}" is not a valid URL.`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Invalid SUPABASE_URL protocol: "${parsed.protocol}" (expected http/https).`);
  }

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type PublicAssociation = {
  name: string;
  slug: string | null;
  logoUrl: string | null;
  brandPrimary: string | null;
  tagline: string | null;
  about: string | null;
  contactEmail: string | null;
};

/** Public, unauthenticated read of an association's published landing branding. */
export const getPublicAssociationFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }): Promise<PublicAssociation | null> => {
    const supabasePublic = publicSupabase();
    const { data: row, error } = await supabasePublic
      .from("associations")
      .select(
        "name, slug, logo_url, brand_primary, tagline, about, contact_email, landing_published",
      )
      .eq("slug", data.slug)
      .eq("landing_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const r: any = row;
    return {
      name: r.name,
      slug: r.slug,
      logoUrl: r.logo_url,
      brandPrimary: r.brand_primary,
      tagline: r.tagline,
      about: r.about,
      contactEmail: r.contact_email,
    };
  });

/** Resolve a published association by request hostname (custom domain or subdomain). */
export const resolveAssociationByHostFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ host: z.string().max(255).optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<PublicAssociation | null> => {
    let host = data.host;
    if (!host) {
      try {
        const { getRequestHost } = await import("@tanstack/react-start/server");
        host = getRequestHost();
      } catch {
        /* no request context */
      }
    }
    if (!host) return null;
    host = host.split(":")[0].toLowerCase();
    // Ignore platform app/preview hosts and bad input.
    if (
      host === "localhost" ||
      host.endsWith(".lovable.app") ||
      host === "lovable.app" ||
      PLATFORM_APP_HOSTS.includes(host) ||
      /^[\d.]+$/.test(host) ||
      !/^[a-z0-9.-]+$/.test(host)
    ) {
      return null;
    }
    const sub = host.split(".")[0];

    const supabasePublic = publicSupabase();
    const { data: rows, error } = await supabasePublic
      .from("associations")
      .select(
        "name, slug, logo_url, brand_primary, tagline, about, contact_email, custom_domain, subdomain, landing_published",
      )
      .eq("landing_published", true)
      .or(`custom_domain.eq.${host},subdomain.eq.${sub}`);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return null;

    // Prefer an exact custom-domain match over a subdomain match.
    const list = rows as any[];
    const match =
      list.find((r) => (r.custom_domain ?? "").toLowerCase() === host) ??
      list.find((r) => (r.subdomain ?? "").toLowerCase() === sub) ??
      null;
    if (!match) return null;
    return {
      name: match.name,
      slug: match.slug,
      logoUrl: match.logo_url,
      brandPrimary: match.brand_primary,
      tagline: match.tagline,
      about: match.about,
      contactEmail: match.contact_email,
    };
  });
