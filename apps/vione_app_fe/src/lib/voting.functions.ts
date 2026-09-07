import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

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

export const listVotesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Vote[]> => {
    const res: any = await fetchNestApiFromServer("/voting/polls", context.token);
    if (!Array.isArray(res)) return [];
    return res.map((r: any) => ({
      id: r.id,
      title: r.title,
      type: r.type || "policy",
      startsAt: r.startsAt || r.startDate || r.createdAt || new Date().toISOString(),
      endsAt: r.endsAt || r.endDate || new Date().toISOString(),
      eligible: Number(r.eligible || 0),
      voted: Number(r.totalVotes || r.voted || 0),
      status: r.status || "open",
      options: Array.isArray(r.options)
        ? r.options.map((o: any) => (typeof o === "string" ? o : o.title))
        : [],
    }));
  });

export const createVoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((data: unknown) => {
    const d = data as Record<string, unknown>;
    const title = String(d.title ?? "").trim();
    const type = String(d.type ?? "policy");
    const startsAt = String(d.startsAt ?? "").trim();
    const endsAt = String(d.endsAt ?? "").trim();
    const options = Array.isArray(d.options)
      ? (d.options as unknown[]).map((o: any) => String(o).trim()).filter(Boolean)
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
    return fetchNestApiFromServer("/voting/polls", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateVoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((data: unknown) => {
    const d = data as Record<string, unknown>;
    const id = String(d.id ?? "").trim();
    const title = String(d.title ?? "").trim();
    const type = String(d.type ?? "policy");
    const startsAt = String(d.startsAt ?? "").trim();
    const endsAt = String(d.endsAt ?? "").trim();
    const options = Array.isArray(d.options)
      ? (d.options as unknown[]).map((o: any) => String(o).trim()).filter(Boolean)
      : [];
    if (!id) throw new Error("Thiếu mã bình chọn");
    return { id, title, type, startsAt, endsAt, options };
  })
  .handler(async ({ data, context }) => {
    const { id, ...body } = data;
    return fetchNestApiFromServer(`/voting/polls/${id}`, context.token, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  });

export const deleteVoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((data: unknown) => {
    const id = String((data as Record<string, unknown>).id ?? "").trim();
    if (!id) throw new Error("Thiếu mã bình chọn");
    return { id };
  })
  .handler(async ({ data, context }) => {
    return fetchNestApiFromServer(`/voting/polls/${data.id}`, context.token, {
      method: "DELETE",
    });
  });
