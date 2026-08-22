import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { relTime } from "./shared";

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
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyProduct[]> => {
    const { data } = await context.supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    return (data ?? []).map((p) => ({
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
  .middleware([requireSupabaseAuth])
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
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("phone")
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await supabase.from("quote_requests").insert({
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
