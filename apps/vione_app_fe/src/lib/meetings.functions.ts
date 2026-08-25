import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Meeting = {
  id: string;
  title: string;
  type: "board" | "committee" | "general";
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: "upcoming" | "completed" | "cancelled";
};

type Row = Record<string, unknown>;

function mapMeeting(m: Row): Meeting {
  return {
    id: m.code as string,
    title: m.title as string,
    type: m.type as Meeting["type"],
    date: m.date as string,
    time: (m.time as string) ?? "",
    location: (m.location as string) ?? "",
    attendees: Number(m.attendees ?? 0),
    status: m.status as Meeting["status"],
  };
}

export const listMeetingsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Meeting[]> => {
    const { data, error } = await context.supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapMeeting);
  });

const meetingInput = z.object({
  title: z.string().min(1).max(300),
  type: z.enum(["board", "committee", "general"]),
  date: z.string().min(1).max(40),
  time: z.string().max(40).default(""),
  location: z.string().max(200).default(""),
  attendees: z.number().int().min(0).max(100000).default(0),
  status: z.enum(["upcoming", "completed", "cancelled"]),
});

export const createMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { genCode, logActivity } = await import("./crud.server");
    const code = genCode("MT");
    const { data: row, error } = await context.supabase
      .from("meetings")
      .insert({ code, ...data })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Tạo cuộc họp",
      target: data.title,
      category: "system",
    });
    return mapMeeting(row);
  });

export const updateMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => meetingInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { logActivity } = await import("./crud.server");
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("meetings")
      .update(rest)
      .eq("code", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Cập nhật cuộc họp",
      target: data.title,
      category: "system",
    });
    return mapMeeting(row);
  });

// Business rule: deleting a meeting soft-cancels it to preserve history.
export const deleteMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await context.supabase
      .from("meetings")
      .update({ status: "cancelled" })
      .eq("code", data.id)
      .select("title")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Hủy cuộc họp",
      target: (row?.title as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });
