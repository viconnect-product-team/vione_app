import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";

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
    return fetchNestApiFromServer("/members/active-association-id", context.token);
  });

export const getMyBenefits = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MemberBenefit[]> => {
    return fetchNestApiFromServer("/members/benefits", context.token);
  });

export const getMyAssociationBrand = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyAssociationBrand | null> => {
    return fetchNestApiFromServer("/members/brand", context.token);
  });

export const getMyMember = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyMember | null> => {
    return fetchNestApiFromServer("/members/me", context.token);
  });
