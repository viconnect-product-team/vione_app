import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";
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
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<MyProduct[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/products", token);
      return (items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        company: p.company || p.category || "",
        category: p.category || "",
        likes: p.likes ?? 0,
        views: p.views ?? 0,
        time: relTime(p.time || p.created_at || p.createdAt),
      }));
    } catch {
      return [];
    }
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
  .handler(async ({ data, context }: any): Promise<{ ok: boolean }> => {
    const token = context?.token;
    return fetchNestApiFromServer<{ ok: boolean }>("/products/quote", token, {
      method: "POST",
      body: data,
    });
  });
