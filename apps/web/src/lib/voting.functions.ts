import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Vote = {
  id: string;
  title: string;
  type: "policy" | "election" | "amendment";
  startsAt: string;
  endsAt: string;
  eligible: number;
  voted: number;
  status: "open" | "scheduled" | "closed";
  options: string[];
};

type Row = Record<string, unknown>;

function mapVote(r: Row): Vote {
  return {
    id: r.id as string,
    title: r.title as string,
    type: r.type as Vote["type"],
    startsAt: r.starts_at as string,
    endsAt: r.ends_at as string,
    eligible: (r.eligible as number) ?? 0,
    voted: (r.voted as number) ?? 0,
    status: r.status as Vote["status"],
    options: Array.isArray(r.options) ? (r.options as string[]) : [],
  };
}

export const listVotesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let query = context.supabase.from("votes").select("*").order("starts_at", { ascending: false });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapVote);
  });

export const createVoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as Record<string, unknown>;
    const title = String(d.title ?? "").trim();
    const type = String(d.type ?? "policy");
    const startsAt = String(d.startsAt ?? "").trim();
    const endsAt = String(d.endsAt ?? "").trim();
    const options = Array.isArray(d.options)
      ? (d.options as unknown[]).map((o) => String(o).trim()).filter(Boolean)
      : [];
    if (!title) throw new Error("Vui lòng nhập câu hỏi bình chọn");
    if (title.length > 300) throw new Error("Câu hỏi quá dài");
    if (!startsAt || !endsAt) throw new Error("Vui lòng chọn thời gian");
    if (endsAt < startsAt) throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
    if (options.length < 2) throw new Error("Cần ít nhất 2 lựa chọn");
    if (options.length > 20) throw new Error("Tối đa 20 lựa chọn");
    if (!["policy", "election", "amendment"].includes(type)) throw new Error("Loại không hợp lệ");
    return { title, type, startsAt, endsAt, options };
  })
  .handler(async ({ data, context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const status: Vote["status"] =
      data.startsAt > today ? "scheduled" : data.endsAt < today ? "closed" : "open";
    const { data: row, error } = await context.supabase
      .from("votes")
      .insert({
        id: crypto.randomUUID(),
        title: data.title,
        type: data.type,
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        options: data.options,
        status,
        eligible: 0,
        voted: 0,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapVote(row as Row);
  });

export const updateVoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = data as Record<string, unknown>;
    const id = String(d.id ?? "").trim();
    const title = String(d.title ?? "").trim();
    const type = String(d.type ?? "policy");
    const startsAt = String(d.startsAt ?? "").trim();
    const endsAt = String(d.endsAt ?? "").trim();
    const options = Array.isArray(d.options)
      ? (d.options as unknown[]).map((o) => String(o).trim()).filter(Boolean)
      : [];
    if (!id) throw new Error("Thiếu mã bình chọn");
    if (!title) throw new Error("Vui lòng nhập câu hỏi bình chọn");
    if (title.length > 300) throw new Error("Câu hỏi quá dài");
    if (!startsAt || !endsAt) throw new Error("Vui lòng chọn thời gian");
    if (endsAt < startsAt) throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
    if (options.length < 2) throw new Error("Cần ít nhất 2 lựa chọn");
    if (options.length > 20) throw new Error("Tối đa 20 lựa chọn");
    if (!["policy", "election", "amendment"].includes(type)) throw new Error("Loại không hợp lệ");
    return { id, title, type, startsAt, endsAt, options };
  })
  .handler(async ({ data, context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const status: Vote["status"] =
      data.startsAt > today ? "scheduled" : data.endsAt < today ? "closed" : "open";
    const { data: row, error } = await context.supabase
      .from("votes")
      .update({
        title: data.title,
        type: data.type,
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        options: data.options,
        status,
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapVote(row as Row);
  });

export const deleteVoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const id = String((data as Record<string, unknown>).id ?? "").trim();
    if (!id) throw new Error("Thiếu mã bình chọn");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("votes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
