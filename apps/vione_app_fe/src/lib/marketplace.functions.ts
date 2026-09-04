import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product, ProductCategoryKey, QuoteRequest } from "./marketplace-data";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer, NEST_API_URL } from "./api-client";
import { resolveMemberId } from "./current-member";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;
type Row = Record<string, unknown>;

const MEDIA_BUCKET = "product-media";

/** Normalizes a stored value (bucket path or legacy signed URL) to a bucket path. */
function toStoragePath(v: string | null | undefined): string | null {
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return v; // already a path
  const m = v.match(/\/object\/(?:sign|public)\/product-media\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Get signed URL for one media path via NestJS (server-to-server). */
async function getSignedUrl(token: string | null | undefined, path: string): Promise<string | null> {
  if (!path) return null;
  // Non-Supabase URLs (NestJS upload, external) pass through as-is
  if (path.startsWith('/upload/') || path.startsWith('/uploads/') || (path.startsWith('http') && !path.includes('supabase.co/storage'))) {
    return path.startsWith('/upload/') || path.startsWith('/uploads/')
      ? `${NEST_API_URL}/api${path}`
      : path;
  }
  const storagePath = toStoragePath(path);
  if (!storagePath) return path;
  try {
    const res = await fetchNestApiFromServer<{ signedUrl: string | null }>(
      "/connect-app/me/media/signed-url",
      token,
      { method: "POST", body: JSON.stringify({ path: storagePath }) },
    );
    return res?.signedUrl ?? path;
  } catch {
    return path;
  }
}

async function signMediaValues(token: string | null | undefined, values: string[]): Promise<string[]> {
  const results = await Promise.all(values.map((v) => getSignedUrl(token, v)));
  return results.filter((u): u is string => !!u);
}

/** Applies short-lived signed URLs to a product's image/pdf paths for display. */
async function signProduct(token: string | null | undefined, p: Product): Promise<Product> {
  const [imageUrls, pdfSigned] = await Promise.all([
    signMediaValues(token, p.imageUrls ?? []),
    p.pdfUrl ? signMediaValues(token, [p.pdfUrl]) : Promise.resolve([]),
  ]);
  return { ...p, imageUrls, pdfUrl: pdfSigned[0] ?? "" };
}

async function signProducts(token: string | null | undefined, ps: Product[]): Promise<Product[]> {
  return Promise.all(ps.map((p: any) => signProduct(token, p)));
}

const CATEGORY_VALUES = [
  "mk.cat.service",
  "mk.cat.product",
  "mk.cat.tech",
  "mk.cat.consult",
  "mk.cat.realestate",
  "mk.cat.other",
] as const;

function mapProduct(r: Row): Product {
  return {
    id: r.id as string,
    sellerId: r.seller_id as string,
    title: r.title as string,
    description: (r.description as string) ?? "",
    price: Number(r.price),
    category: r.category as ProductCategoryKey,
    status: r.status as Product["status"],
    createdAt: r.created_at as string,
    views: (r.views as number) ?? 0,
    emoji: (r.emoji as string) ?? "🛍️",
    pdfUrl: (r.pdf_url as string) ?? "",
    imageUrls: (r.image_urls as string[]) ?? [],
    websiteUrl: (r.website_url as string) ?? "",
    facebookUrl: (r.facebook_url as string) ?? "",
  };
}

function mapQuote(r: Row): QuoteRequest {
  return {
    id: r.id as string,
    productId: r.product_id as string,
    buyerId: r.buyer_id as string,
    quantity: (r.quantity as number) ?? 1,
    message: (r.message as string) ?? "",
    contact: (r.contact as string) ?? "",
    status: ((r.status as string) ?? "sent") as QuoteRequest["status"],
    reminderCount: (r.reminder_count as number) ?? 0,
    cancelReason: (r.cancel_reason as string) ?? "",
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? (r.created_at as string),
  };
}

export const listProductsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Product[]> => {
    const { data, error } = await getDb(context)
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return signProducts(
      (context as any).token,
      (data ?? []).map((r: any) => mapProduct(r as Row)),
    );
  });

export const getProductFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(
    async ({ data, context }): Promise<{ product: Product; quotes: QuoteRequest[] } | null> => {
      const { data: row, error } = await getDb(context)
        .from("products")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) return null;
      // GUARD: service role only bumps the view counter on a row the caller could
      // already read under RLS; scope by the RLS-visible row's association_id so a
      // stale/colliding id can never touch a cross-tenant resource.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("products")
        .update({ views: (((row as Row).views as number) ?? 0) + 1 })
        .eq("id", data.id)
        .eq("association_id", (row as Row).association_id as string);
      const { data: quotes } = await getDb(context)
        .from("quote_requests")
        .select("*")
        .eq("product_id", data.id)
        .order("created_at", { ascending: false });
      return {
        product: await signProduct((context as any).token, mapProduct(row as Row)),
        quotes: (quotes ?? []).map((q: any) => mapQuote(q as Row)),
      };
    },
  );

export const createProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        sellerId: z.string().min(1).max(128).optional(),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        price: z.number().min(0).max(1e15),
        category: z.enum(CATEGORY_VALUES),
        emoji: z.string().min(1).max(16).optional(),
        pdfUrl: z.string().max(2000).optional(),
        imageUrls: z.array(z.string().max(2000)).max(10).optional(),
        websiteUrl: z.string().max(500).optional(),
        facebookUrl: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Product> => {
    const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Auto-provision a minimal member profile so first-time sellers don't
    // hit the products RLS membership check with no member row.
    const { data: memberId, error: mErr } = await getDb(context).rpc("ensure_my_member_profile");
    if (mErr || !memberId) throw new Error("Không thể khởi tạo hồ sơ hội viên của bạn.");
    const { data: row, error } = await getDb(context)
      .from("products")
      .insert({
        id,
        seller_id: memberId,
        title: data.title.trim(),
        description: data.description.trim(),
        price: Math.round(data.price),
        category: data.category,
        status: "active",
        views: 0,
        emoji: data.emoji ?? "🛍️",
        pdf_url: toStoragePath(data.pdfUrl),
        image_urls: (data.imageUrls ?? []).map(toStoragePath).filter(Boolean),
        website_url: data.websiteUrl ?? null,
        facebook_url: data.facebookUrl ?? null,
      } as never)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return signProduct((context as any).token, mapProduct(row as Row));
  });

export const updateProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        sellerId: z.string().min(1).max(128).optional(),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        price: z.number().min(0).max(1e15),
        category: z.enum(CATEGORY_VALUES),
        emoji: z.string().min(1).max(16).optional(),
        pdfUrl: z.string().max(2000).optional(),
        imageUrls: z.array(z.string().max(2000)).max(10).optional(),
        websiteUrl: z.string().max(500).optional(),
        facebookUrl: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Product | null> => {
    const memberId = await resolveMemberId((context as any)?.token);
    const { data: row, error } = await getDb(context)
      .from("products")
      .update({
        title: data.title.trim(),
        description: data.description.trim(),
        price: Math.round(data.price),
        category: data.category,
        emoji: data.emoji ?? "🛍️",
        pdf_url: toStoragePath(data.pdfUrl),
        image_urls: (data.imageUrls ?? []).map(toStoragePath).filter(Boolean),
        website_url: data.websiteUrl ?? null,
        facebook_url: data.facebookUrl ?? null,
      } as never)
      .eq("id", data.id)
      .eq("seller_id", memberId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row
      ? signProduct((context as any).token, mapProduct(row as Row))
      : null;
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), sellerId: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const memberId = await resolveMemberId((context as any)?.token);
    const { error } = await getDb(context)
      .from("products")
      .delete()
      .eq("id", data.id)
      .eq("seller_id", memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        ids: z.array(z.string().min(1).max(128)).min(1).max(200),
        sellerId: z.string().min(1).max(128).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean; count: number }> => {
    const memberId = await resolveMemberId((context as any)?.token);
    const { error, count } = await getDb(context)
      .from("products")
      .delete({ count: "exact" })
      .in("id", data.ids)
      .eq("seller_id", memberId);
    if (error) throw new Error(error.message);
    return { ok: true, count: count ?? 0 };
  });

export const toggleSoldFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), sellerId: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Product | null> => {
    const memberId = await resolveMemberId((context as any)?.token);
    const { data: cur } = await getDb(context)
      .from("products")
      .select("status")
      .eq("id", data.id)
      .eq("seller_id", memberId)
      .maybeSingle();
    if (!cur) return null;
    const next = (cur as Row).status === "sold" ? "active" : "sold";
    const { data: row, error } = await getDb(context)
      .from("products")
      .update({ status: next })
      .eq("id", data.id)
      .eq("seller_id", memberId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row
      ? signProduct((context as any).token, mapProduct(row as Row))
      : null;
  });

export const createQuoteRequestFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        productId: z.string().min(1).max(128),
        buyerId: z.string().min(1).max(128).optional(),
        quantity: z.number().int().min(1).max(100000),
        message: z.string().min(1).max(4000),
        contact: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest> => {
    const id = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const memberId = await resolveMemberId((context as any)?.token);
    const { data: row, error } = await getDb(context)
      .from("quote_requests")
      .insert({
        id,
        product_id: data.productId,
        buyer_id: memberId,
        quantity: data.quantity,
        message: data.message,
        contact: data.contact,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapQuote(row as Row);
  });

const STATUS_VALUES = ["sent", "viewing", "confirmed", "rejected", "cancelled"] as const;
const PENDING = ["sent", "viewing"];

// Buyer cancels their own pending quote request.
export const cancelQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        buyerId: z.string().min(1).max(128).optional(),
        reason: z.string().trim().min(10).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const memberId = await resolveMemberId((context as any)?.token);
    const { data: cur } = await getDb(context)
      .from("quote_requests")
      .select("status")
      .eq("id", data.id)
      .eq("buyer_id", memberId)
      .maybeSingle();
    if (!cur || !PENDING.includes((cur as Row).status as string)) return null;
    const { data: row, error } = await getDb(context)
      .from("quote_requests")
      .update({ status: "cancelled", cancel_reason: data.reason } as never)
      .eq("id", data.id)
      .eq("buyer_id", memberId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapQuote(row as Row) : null;
  });

// Seller sends a reminder / follow-up while the request is still pending.
export const remindQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const { data: cur } = await getDb(context)
      .from("quote_requests")
      .select("status, reminder_count")
      .eq("id", data.id)
      .maybeSingle();
    if (!cur || !PENDING.includes((cur as Row).status as string)) return null;
    const next = (((cur as Row).reminder_count as number) ?? 0) + 1;
    const { data: row, error } = await getDb(context)
      .from("quote_requests")
      .update({ reminder_count: next, updated_at: new Date().toISOString() } as never)
      .eq("id", data.id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapQuote(row as Row) : null;
  });

export const updateQuoteStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        status: z.enum(STATUS_VALUES),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const memberId = await resolveMemberId((context as any)?.token);

    // Load the quote and its product's seller to authorize the transition.
    const { data: quote, error: qErr } = await getDb(context)
      .from("quote_requests")
      .select("*, products(seller_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (qErr) throw new Error(qErr.message);
    if (!quote) return null;

    const q = quote as Row;
    const buyerId = q.buyer_id as string;
    const sellerId = ((q.products as Row | null)?.seller_id as string) ?? null;
    const associationId = q.association_id as string | undefined;

    const isAdmin = associationId
      ? Boolean(
          (
            await getDb(context).rpc("has_assoc_role", {
              _association_id: associationId,
              _role: "admin",
            })
          ).data,
        )
      : false;
    const isBuyer = memberId != null && memberId === buyerId;
    const isSeller = memberId != null && sellerId != null && memberId === sellerId;

    // State-machine: buyers may only cancel; sellers may progress/close; admins anything.
    const allowed =
      isAdmin ||
      (isBuyer && data.status === "cancelled") ||
      (isSeller && ["viewing", "confirmed", "rejected"].includes(data.status));
    if (!allowed) throw new Error("Không có quyền thay đổi trạng thái báo giá này.");

    const { data: row, error } = await getDb(context)
      .from("quote_requests")
      .update({ status: data.status } as never)
      .eq("id", data.id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapQuote(row as Row) : null;
  });

export const deleteQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await getDb(context).from("quote_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyQuotesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(
    async ({
      context,
    }): Promise<Array<QuoteRequest & { productTitle: string; productEmoji: string }>> => {
      const memberId = await resolveMemberId((context as any)?.token);
      const { data: rows, error } = await getDb(context)
        .from("quote_requests")
        .select("*")
        .eq("buyer_id", memberId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      const quotes = (rows ?? []).map((r: any) => mapQuote(r as Row));
      const ids = [...new Set(quotes.map((q: any) => q.productId))];
      let titles: Record<string, { title: string; emoji: string }> = {};
      if (ids.length) {
        const { data: prods } = await getDb(context)
          .from("products")
          .select("id,title,emoji")
          .in("id", ids);
        titles = Object.fromEntries(
          (prods ?? []).map((p: any) => [
            (p as Row).id as string,
            {
              title: ((p as Row).title as string) ?? "",
              emoji: ((p as Row).emoji as string) ?? "🛍️",
            },
          ]),
        );
      }
      return quotes.map((q: any) => ({
        ...q,
        productTitle: titles[q.productId]?.title ?? "—",
        productEmoji: titles[q.productId]?.emoji ?? "🛍️",
      }));
    },
  );
