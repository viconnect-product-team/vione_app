import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { NewsArticle } from "@/lib/extra-data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Row = Record<string, unknown>;

function mapNews(n: Row): NewsArticle {
  return {
    id: n.code as string,
    title: n.title as string,
    category: n.category as string,
    author: n.author as string,
    publishedAt: n.published_at as string,
    views: (n.views as number) ?? 0,
    status: n.status as NewsArticle["status"],
    excerpt: (n.excerpt as string) ?? "",
  };
}

export const listNewsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsArticle[]> => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let query = context.supabase.from("news").select("*").order("created_at", { ascending: true });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapNews);
  });

const newsInput = z.object({
  title: z.string().min(1).max(300),
  category: z.string().min(1).max(100),
  author: z.string().min(1).max(120),
  publishedAt: z.string().max(40).default("—"),
  status: z.enum(["published", "draft", "scheduled"]),
  excerpt: z.string().max(2000).default(""),
});

export const createNewsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => newsInput.parse(d))
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const { genCode, logActivity } = await import("./crud.server");
    const code = genCode("NEWS");
    const { data: row, error } = await context.supabase
      .from("news")
      .insert({
        code,
        title: data.title,
        category: data.category,
        author: data.author,
        published_at: data.publishedAt,
        status: data.status,
        excerpt: data.excerpt,
        views: 0,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Tạo tin tức",
      target: data.title,
      category: "system",
    });
    return mapNews(row);
  });

export const updateNewsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => newsInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await context.supabase
      .from("news")
      .update({
        title: data.title,
        category: data.category,
        author: data.author,
        published_at: data.publishedAt,
        status: data.status,
        excerpt: data.excerpt,
      })
      .eq("code", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Cập nhật tin tức",
      target: data.title,
      category: "system",
    });
    return mapNews(row);
  });

export const deleteNewsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const found = await context.supabase
      .from("news")
      .select("title")
      .eq("code", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("news").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Xóa tin tức",
      target: (found.data?.title as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });
