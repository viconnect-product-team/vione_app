import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { relTime, fmtDate } from "./shared";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

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
  .handler(async ({ context }): Promise<NewsItem[]> => {
    const { data } = await getDb(context)
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return (data ?? []).map((n: any) => ({
      id: n.id,
      title: n.title,
      category: n.category ?? "",
      author: n.author ?? "",
      excerpt: n.excerpt ?? "",
      time: relTime(n.created_at),
      views: n.views ?? 0,
    }));
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
  .handler(async ({ context }): Promise<LibraryDoc[]> => {
    const { data } = await getDb(context)
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false, nullsFirst: false });
    return (data ?? []).map((d: any) => ({
      id: d.id,
      name: d.name,
      category: d.category ?? "",
      size: d.size ?? "",
      type: d.type ?? "",
      time: fmtDate(d.uploaded_at) ?? "",
    }));
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
    validUntil: fmtDate(p.valid_until),
  };
}

export const listPerks = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Perk[]> => {
    const { data } = await getDb(context)
      .from("perks")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true });
    return (data ?? []).map((r: any) => mapPerk(r));
  });

export const getPerk = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }): Promise<Perk | null> => {
    const { data: row } = await getDb(context)
      .from("perks")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    return row ? mapPerk(row) : null;
  });
