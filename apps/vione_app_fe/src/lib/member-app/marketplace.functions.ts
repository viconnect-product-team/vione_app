import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { relTime } from "./shared";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

export type MyProduct = {
  id: string;
  name: string;
  company: string;
  category: string;
  likes: number;
  views: number;
  time: string;
};

// ---------- Products ----------
export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyProduct[]> => {
    const { data } = await getDb(context)
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    return (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.title,
      company: p.category,
      category: p.category,
      likes: 0,
      views: p.views ?? 0,
      time: relTime(p.created_at),
    }));
  });

export const requestQuote = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        productId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(1000000).optional(),
        message: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const db = getDb(context);
    const userId = (context as any).userId;
    const { data: me } = await db
      .from("members")
      .select("phone")
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await db.from("quote_requests").insert({
      id: crypto.randomUUID(),
      product_id: data.productId,
      buyer_id: userId,
      quantity: data.quantity ?? 1,
      message: data.message ?? "Tôi muốn nhận báo giá sản phẩm này.",
      contact: me?.phone ?? "",
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
