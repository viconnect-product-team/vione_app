import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CardSettings = {
  displayName: string | null;
  displayCompany: string | null;
  photoUrl: string | null;
  showName: boolean;
  showCompany: boolean;
  showPhoto: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
};

const DEFAULTS: CardSettings = {
  displayName: null,
  displayCompany: null,
  photoUrl: null,
  showName: true,
  showCompany: true,
  showPhoto: true,
  showEmail: false,
  showPhone: false,
  showAddress: false,
};

export const getCardSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CardSettings> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("card_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return DEFAULTS;
    return {
      displayName: data.display_name,
      displayCompany: data.display_company,
      photoUrl: data.photo_url,
      showName: data.show_name,
      showCompany: data.show_company,
      showPhoto: data.show_photo,
      showEmail: ((data as Record<string, unknown>).show_email as boolean) ?? false,
      showPhone: ((data as Record<string, unknown>).show_phone as boolean) ?? false,
      showAddress: ((data as Record<string, unknown>).show_address as boolean) ?? false,
    };
  });

export const saveCardSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        displayName: z.string().max(120).nullable().optional(),
        displayCompany: z.string().max(160).nullable().optional(),
        // data URL (downscaled thumbnail) or null to clear
        photoUrl: z.string().max(400000).nullable().optional(),
        showName: z.boolean(),
        showCompany: z.boolean(),
        showPhoto: z.boolean(),
        showEmail: z.boolean().optional(),
        showPhone: z.boolean().optional(),
        showAddress: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("card_settings").upsert(
      {
        user_id: userId,
        display_name: data.displayName ?? null,
        display_company: data.displayCompany ?? null,
        photo_url: data.photoUrl ?? null,
        show_name: data.showName,
        show_company: data.showCompany,
        show_photo: data.showPhoto,
        show_email: data.showEmail ?? false,
        show_phone: data.showPhone ?? false,
        show_address: data.showAddress ?? false,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type PublicCard = {
  found: boolean;
  code: string;
  name: string;
  company: string;
  type: "company" | "individual";
  status: string;
  verified: boolean;
  validUntil: string | null;
  joinedAt: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  taxCode: string | null;
  industry: string | null;
  region: string | null;
  address: string | null;
  website: string | null;
  photoUrl: string | null;
};

// Public endpoint: verify & display a member card by its code (QR target).
export const getPublicCard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }): Promise<PublicCard> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m } = await supabaseAdmin
      .from("members")
      .select(
        "id, user_id, code, name, contact, email, phone, type, status, industry, region, address, website, tax_code, joined_at, term_end, association_id",
      )
      .eq("code", data.code)
      .maybeSingle();

    const notFound = (): PublicCard => ({
      found: false,
      code: data.code,
      name: "",
      company: "",
      type: "company",
      status: "",
      verified: false,
      validUntil: null,
      joinedAt: null,
      title: null,
      email: null,
      phone: null,
      taxCode: null,
      industry: null,
      region: null,
      address: null,
      website: null,
      photoUrl: null,
    });

    if (!m) return notFound();

    // GUARD: association-level public card policy. The card is only shown when
    // the owning association enables public cards, and (optionally) only for
    // active members. Disabled/suspended cases are indistinguishable from a
    // missing card so we never leak member existence or status metadata.
    const { data: assoc } = await supabaseAdmin
      .from("associations")
      .select("public_card_enabled, public_card_requires_active_member")
      .eq("id", m.association_id as string)
      .maybeSingle();

    const cardEnabled = assoc
      ? (assoc as Record<string, unknown>).public_card_enabled !== false
      : true;
    if (!cardEnabled) return notFound();

    const isActive =
      (m.status as string) === "active" || (m.status as string) === "memberStatus.active";
    const requiresActive = assoc
      ? (assoc as Record<string, unknown>).public_card_requires_active_member !== false
      : true;
    if (requiresActive && !isActive) return notFound();

    // Owner card display preferences (optional overrides)
    let settings: Record<string, unknown> | null = null;
    if (m.user_id) {
      const { data: cs } = await supabaseAdmin
        .from("card_settings")
        .select("*")
        .eq("user_id", m.user_id)
        .maybeSingle();
      settings = cs ?? null;
    }

    const showName = settings ? (settings.show_name as boolean) : true;
    const showCompany = settings ? (settings.show_company as boolean) : true;
    const showPhoto = settings ? (settings.show_photo as boolean) : true;
    // Contact PII is opt-in only (default false) and never returned otherwise.
    const showEmail = settings ? Boolean(settings.show_email) : false;
    const showPhone = settings ? Boolean(settings.show_phone) : false;
    const showAddress = settings ? Boolean(settings.show_address) : false;

    const memberName =
      (settings?.display_name as string) || (m.contact as string) || (m.name as string);
    const companyName = (settings?.display_company as string) || (m.name as string);

    return {
      found: true,
      code: m.code as string,
      name: showName ? memberName : "",
      company: showCompany ? companyName : "",
      type: (m.type as "company" | "individual") ?? "company",
      status: (m.status as string) ?? "",
      verified: (m.status as string) === "active" || (m.status as string) === "memberStatus.active",
      validUntil: (m.term_end as string) ?? null,
      joinedAt: (m.joined_at as string) ?? null,
      // title maps to the contact person's name — only expose when name display is on.
      title: showName ? ((m.contact as string) ?? null) : null,
      email: showEmail ? ((m.email as string) ?? null) : null,
      phone: showPhone ? ((m.phone as string) ?? null) : null,
      // Tax code is never exposed on the public card endpoint.
      taxCode: null,
      industry: showCompany ? ((m.industry as string) ?? null) : null,
      region: showCompany ? ((m.region as string) ?? null) : null,
      address: showAddress ? ((m.address as string) ?? null) : null,
      website: showCompany ? ((m.website as string) ?? null) : null,
      photoUrl: showPhoto ? ((settings?.photo_url as string) ?? null) : null,
    };
  });
