import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { relTime, fmtDate } from "./shared";
import { fetchNestApiFromServer } from "@/lib/api-client";

// ---------- News ----------
export type NewsItem = {
  id: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  time: string;
  views: number;
};

export const listNews = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<NewsItem[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/content/news", token);
      return (items ?? []).map((n: any) => ({
        id: n.id,
        title: n.title,
        category: n.category ?? "",
        author: n.author ?? "",
        excerpt: n.excerpt ?? "",
        time: relTime(n.time || n.created_at || n.createdAt),
        views: n.views ?? 0,
      }));
    } catch {
      return [];
    }
  });

// ---------- Documents / Library ----------
export type LibraryDoc = {
  id: string;
  name: string;
  category: string;
  size: string;
  type: string;
  time: string;
};

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<LibraryDoc[]> => {
    try {
      const token = context?.token;
      const res = await fetchNestApiFromServer<any[]>("/documents", token);
      if (Array.isArray(res)) {
        return res.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category ?? "",
          size: d.size ?? "",
          type: d.type ?? "",
          time: fmtDate(d.uploadedAt || d.uploaded_at) ?? "",
        }));
      }
    } catch {
      // ignore
    }
    return [];
  });

// ---------- Perks / Tiện ích ----------
export type Perk = {
  id: string;
  title: string;
  category: string;
  partner: string;
  summary: string;
  description: string;
  discount: string;
  icon: string;
  link: string;
  validUntil: string | null;
};

function mapPerk(p: any): Perk {
  return {
    id: p.id,
    title: p.title,
    category: p.category ?? "",
    partner: p.partner ?? "",
    summary: p.summary ?? "",
    description: p.description ?? "",
    discount: p.discount ?? "",
    icon: p.icon ?? "Gift",
    link: p.link ?? "",
    validUntil: fmtDate(p.validUntil || p.valid_until),
  };
}

export const listPerks = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<Perk[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/content/perks", token);
      return (items ?? []).map((r: any) => mapPerk(r));
    } catch {
      return [];
    }
  });

export const getPerk = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }: any): Promise<Perk | null> => {
    try {
      const token = context?.token;
      const row = await fetchNestApiFromServer<any>("/content/perks/" + data.id, token);
      return row ? mapPerk(row) : null;
    } catch {
      return null;
    }
  });
