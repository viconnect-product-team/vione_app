import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type ReviewType = "service" | "event" | "networking";

export type ReviewRow = {
  id: string;
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewType: ReviewType;
  createdAt: string;
};

type Row = Record<string, unknown>;

function mapRow(r: Row): ReviewRow {
  return {
    id: r.id as string,
    sellerId: r.seller_id as string,
    reviewerId: r.reviewer_id as string,
    reviewerName: (r.reviewer_name as string) ?? "",
    rating: r.rating as number,
    comment: (r.comment as string) ?? "",
    reviewType: ((r.review_type as string) ?? "service") as ReviewType,
    createdAt: r.created_at as string,
  };
}

export const listReviewsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ sellerId: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (null as any)
      .from("reviews")
      .select("*")
      .eq("seller_id", data.sellerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const reviews = (rows ?? []).map(mapRow);
    const count = reviews.length;
    const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    return { reviews, stats: { count, avg } };
  });

export const addReviewFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        sellerId: z.string().min(1).max(64),
        reviewerId: z.string().min(1).max(64),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1).max(1000),
        reviewType: z.enum(["service", "event", "networking"]).default("service"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: reviewer, error: e1 } = await (null as any)
      .from("members")
      .select("name")
      .eq("id", data.reviewerId)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    const { data: row, error } = await (null as any)
      .from("reviews")
      .insert({
        seller_id: data.sellerId,
        reviewer_id: data.reviewerId,
        reviewer_name: (reviewer?.name as string) ?? "",
        rating: data.rating,
        comment: data.comment,
        review_type: data.reviewType,
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapRow(row) : null;
  });

export const updateReviewFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(64),
        reviewerId: z.string().min(1).max(64),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1).max(1000),
        reviewType: z.enum(["service", "event", "networking"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ReviewRow | null> => {
    const { data: row, error } = await (null as any)
      .from("reviews")
      .update({
        rating: data.rating,
        comment: data.comment,
        review_type: data.reviewType,
      })
      .eq("id", data.id)
      .eq("reviewer_id", data.reviewerId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapRow(row) : null;
  });

export const deleteReviewFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(64),
        reviewerId: z.string().min(1).max(64),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await (null as any)
      .from("reviews")
      .delete()
      .eq("id", data.id)
      .eq("reviewer_id", data.reviewerId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
