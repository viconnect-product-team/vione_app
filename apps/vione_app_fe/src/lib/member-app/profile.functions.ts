import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fmtDate, resolveAssociationId } from "./shared";
import { buildNonMemberIdentity } from "@/lib/member-identity";

// ---------- Types returned to the PWA ----------
export type MyMember = {
  code: string;
  name: string;
  status: string;
  validUntil: string | null;
  verified: boolean;
  type: "company" | "individual";
  title: string;
  email: string;
  phone: string;
  taxCode: string | null;
  industry: string;
  region: string;
  address: string;
  website: string | null;
  joinedAt: string | null;
  avatar: string | null;
};

// ---------- Current member ----------
// ---------- Association branding for the PWA header ----------
export type MyAssociationBrand = {
  name: string;
  logoUrl: string | null;
  brandPrimary: string | null;
};

export type MemberBenefit = {
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
};

const DEFAULT_BENEFITS: MemberBenefit[] = [
  {
    titleVi: "Tham dự sự kiện",
    titleEn: "Event access",
    descVi: "miễn phí & ưu đãi",
    descEn: "free & discounted",
  },
  {
    titleVi: "Kết nối hơn",
    titleEn: "Networking",
    descVi: "1000+ doanh nghiệp",
    descEn: "1000+ businesses",
  },
  {
    titleVi: "Quảng bá thương hiệu",
    titleEn: "Brand promotion",
    descVi: "trên kênh Hiệp hội",
    descEn: "on association channels",
  },
];

export const getActiveAssociationId = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<string | null> => {
    const { supabase, userId } = context;
    return resolveAssociationId(supabase, userId);
  });

export const getMyBenefits = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MemberBenefit[]> => {
    const { supabase, userId } = context;
    const associationId = await resolveAssociationId(supabase, userId);
    if (!associationId) return DEFAULT_BENEFITS;
    const { data } = await supabase
      .from("association_benefits")
      .select("title_vi, title_en, desc_vi, desc_en")
      .eq("association_id", associationId)
      .order("sort_order", { ascending: true });
    const rows = (data ?? []) as any[];
    if (rows.length === 0) return DEFAULT_BENEFITS;
    return rows.map((r: any) => ({
      titleVi: r.title_vi ?? "",
      titleEn: r.title_en ?? "",
      descVi: r.desc_vi ?? "",
      descEn: r.desc_en ?? "",
    }));
  });

export const getMyAssociationBrand = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyAssociationBrand | null> => {
    const { supabase, userId } = context;
    let associationId: string | null = null;

    // 1) Active association for this session — matches the AssociationSwitcher
    //    and every RLS policy (current_association_id() = default membership).
    //    This is the source of truth for accounts belonging to several
    //    associations, so the header always reflects the switched context.
    const { data: activeId } = await supabase.rpc("current_association_id");
    associationId = (activeId as string | null) ?? null;

    // 2) Member profile linked to this user → its association.
    if (!associationId) {
      const { data: mem } = await supabase
        .from("members")
        .select("association_id")
        .eq("user_id", userId)
        .maybeSingle();
      associationId = (mem as any)?.association_id ?? null;
    }

    // 3) Fallback to membership (association admins / non-member accounts).
    if (!associationId) {
      const { data: rows } = await supabase
        .from("memberships")
        .select("association_id, is_default, created_at")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1);
      associationId = (rows ?? [])[0]?.association_id ?? null;
    }
    if (!associationId) return null;

    const { data: a } = await supabase
      .from("associations")
      .select("name, logo_url, brand_primary")
      .eq("id", associationId)
      .maybeSingle();
    if (!a) return null;
    return {
      name: (a as any).name ?? "",
      logoUrl: (a as any).logo_url ?? null,
      brandPrimary: (a as any).brand_primary ?? null,
    };
  });

import { fetchNestApiFromServer } from "@/lib/api-client";

export const getMyMember = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyMember | null> => {
    return fetchNestApiFromServer("/members/me", context.token);
  });
