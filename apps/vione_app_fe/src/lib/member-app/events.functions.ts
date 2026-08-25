import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MyEvent = {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  place: string;
  registered: boolean;
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// ---------- Events ----------

export const listMyEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyEvent[]> => {
    const { supabase, userId } = context;
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    const { data: me } = await supabase
      .from("members")
      .select("code")
      .eq("user_id", userId)
      .maybeSingle();
    const myCode = me?.code;
    let regIds = new Set<string>();
    if (myCode) {
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("member_code", myCode);
      regIds = new Set((regs ?? []).map((r) => r.event_id));
    }
    return (events ?? []).map((e) => {
      const dt = new Date(e.date);
      const valid = !isNaN(dt.getTime());
      return {
        id: e.id,
        day: valid ? String(dt.getDate()).padStart(2, "0") : "--",
        month: valid ? MONTHS[dt.getMonth()] : "",
        title: e.name,
        time: valid ? dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
        place: e.location,
        registered: regIds.has(e.id),
      };
    });
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("code, name, email")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me) throw new Error("ERR_NO_MEMBER_PROFILE");
    const { error } = await supabase.from("event_registrations").insert({
      id: crypto.randomUUID(),
      event_id: data.eventId,
      member_code: me.code,
      member_name: me.name,
      email: me.email,
      status: "registered",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
