import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Document = {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  type: "pdf" | "docx" | "xlsx" | "pptx";
};

type Row = Record<string, unknown>;

const BUCKET = "documents";
const VIEW_TTL = 300; // 5 minutes, re-issued on each download

function mapDoc(d: Row): Document {
  return {
    id: d.code as string,
    name: d.name as string,
    category: d.category as string,
    size: (d.size as string) ?? "",
    uploadedAt: d.uploaded_at as string,
    uploadedBy: (d.uploaded_by as string) ?? "",
    type: d.type as Document["type"],
  };
}

export const listDocumentsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Document[]> => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let query = context.supabase
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapDoc);
  });

const docInput = z.object({
  name: z.string().min(1).max(300),
  category: z.string().min(1).max(100),
  size: z.string().max(40).default(""),
  uploadedBy: z.string().max(120).default(""),
  type: z.enum(["pdf", "docx", "xlsx", "pptx"]),
  filePath: z.string().max(500).default(""),
});

export const createDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => docInput.parse(d))
  .handler(async ({ data, context }): Promise<Document> => {
    const { genCode, logActivity } = await import("./crud.server");
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    const code = genCode("DOC");
    const { data: row, error } = await context.supabase
      .from("documents")
      .insert({
        code,
        name: data.name,
        category: data.category,
        size: data.size,
        uploaded_by: data.uploadedBy,
        type: data.type,
        file_path: data.filePath || null,
        ...(activeId ? { association_id: activeId } : {}),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Thêm tài liệu",
      target: data.name,
      category: "system",
    });
    return mapDoc(row);
  });

export const updateDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => docInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Document> => {
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await context.supabase
      .from("documents")
      .update({
        name: data.name,
        category: data.category,
        size: data.size,
        uploaded_by: data.uploadedBy,
        type: data.type,
        ...(data.filePath ? { file_path: data.filePath } : {}),
      })
      .eq("code", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Cập nhật tài liệu",
      target: data.name,
      category: "system",
    });
    return mapDoc(row);
  });

/** Issues a short-lived signed URL for the document's attached file. */
export const getDocumentUrlFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<string | null> => {
    const { data: row, error } = await context.supabase
      .from("documents")
      .select("file_path")
      .eq("code", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const path = (row?.file_path as string | null) ?? null;
    if (!path) return null;
    const { data: signed, error: sErr } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, VIEW_TTL);
    if (sErr) throw new Error(sErr.message);
    return signed?.signedUrl ?? null;
  });

export const deleteDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const found = await context.supabase
      .from("documents")
      .select("name, file_path")
      .eq("code", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("documents").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    const path = (found.data?.file_path as string | null) ?? null;
    if (path) {
      // Best-effort storage cleanup; the row is already gone.
      await context.supabase.storage.from(BUCKET).remove([path]);
    }
    await logActivity(context.supabase, {
      action: "Xóa tài liệu",
      target: (found.data?.name as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });
