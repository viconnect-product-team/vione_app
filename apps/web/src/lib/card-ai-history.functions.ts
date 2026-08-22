// AI card import history — persist each generated suggestion so users can
// revisit and compare them later. Thumbnails are downscaled data URLs sent
// from the client; the full suggestion JSON is stored as-is.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_THUMB_BYTES = 400 * 1024; // ~400KB thumbnail cap

const SaveInput = z.object({
  thumbnail: z
    .string()
    .refine((s) => s.startsWith("data:image/"), "thumbnail must be data:image/*")
    .refine((s) => s.length <= MAX_THUMB_BYTES, "thumbnail too large"),
  suggestion: z.record(z.string(), z.unknown()),
  templateId: z.string().nullable().optional(),
  qrBackground: z.string().nullable().optional(),
  applied: z.boolean().optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CardAiHistoryEntry = {
  id: string;
  thumbnail: string;

  suggestion: Record<string, any>;
  templateId: string | null;
  qrBackground: string | null;
  appliedAt: string | null;
  note: string | null;
  createdAt: string;
};

function mapRow(r: Record<string, any>): CardAiHistoryEntry {
  return {
    id: r.id as string,
    thumbnail: r.thumbnail as string,
    suggestion: (r.suggestion ?? {}) as Record<string, unknown>,
    templateId: (r.template_id as string | null) ?? null,
    qrBackground: (r.qr_background as string | null) ?? null,
    appliedAt: (r.applied_at as string | null) ?? null,
    note: (r.note as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

export const saveCardAiHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ data, context }): Promise<CardAiHistoryEntry> => {
    const { supabase, userId } = context;
    const row = {
      user_id: userId,
      thumbnail: data.thumbnail,

      suggestion: data.suggestion as any,
      template_id: data.templateId ?? null,
      qr_background: data.qrBackground ?? null,
      applied_at: data.applied ? new Date().toISOString() : null,
      note: data.note ?? null,
    };
    const { data: inserted, error } = await supabase
      .from("card_ai_import_history")
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(inserted as unknown as Record<string, unknown>);
  });

export const listCardAiHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CardAiHistoryEntry[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("card_ai_import_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapRow(r as unknown as Record<string, unknown>));
  });

export const deleteCardAiHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("card_ai_import_history").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
