import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TKey } from "./i18n";
import type {
  Attendee,
  AttendeeBadge,
  CheckinResult,
  RecentEntry,
  TicketStat,
} from "./checkin-data";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

type Row = Record<string, unknown>;

function mapAttendee(r: Row): Attendee {
  return {
    id: r.id as string,
    name: r.name as string,
    initials: (r.initials as string) ?? "",
    title: (r.title as string) ?? "",
    company: (r.company as string) ?? "",
    phone: (r.phone as string) ?? "",
    badges: ((r.badges as string[]) ?? []) as AttendeeBadge[],
    membership: (r.membership as TKey) ?? "memberLevel.small",
    ticketType: (r.ticket_type as string) ?? undefined,
    checkedIn: Boolean(r.checked_in),
  };
}

function ticketStatsOf(attendees: Attendee[]): TicketStat[] {
  const map = new Map<string, TicketStat>();
  for (const a of attendees) {
    const key = a.ticketType && a.ticketType.trim() !== "" ? a.ticketType : "—";
    const cur = map.get(key) ?? { ticketType: key, registered: 0, checkedIn: 0 };
    cur.registered += 1;
    if (a.checkedIn) cur.checkedIn += 1;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.registered - a.registered);
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export const getCheckinStateFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      attendees: Attendee[];
      recent: RecentEntry[];
      stats: { registered: number; checkedIn: number };
      ticketStats: TicketStat[];
    }> => {
      const [att, logs] = await Promise.all([
        (null as any).from("attendees").select("*").order("name", { ascending: true }),
        (null as any)
          .from("checkin_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      if (att.error) throw new Error(att.error.message);
      if (logs.error) throw new Error(logs.error.message);
      const attendees = (att.data ?? []).map((r: any) => mapAttendee(r as Row));
      const byId = new Map(attendees.map((a: any) => [a.id, a]));
      const recent: RecentEntry[] = (logs.data ?? [])
        .map((r: any) => {
          const a = byId.get((r as Row).attendee_id as string);
          if (!a) return null;
          return {
            attendee: a,
            result: (r as Row).result as CheckinResult,
            time: timeOf((r as Row).created_at as string),
          };
        })
        .filter((e: RecentEntry | null): e is RecentEntry => e !== null);
      return {
        attendees,
        recent,
        stats: {
          registered: attendees.length,
          checkedIn: attendees.filter((a: any) => a.checkedIn).length,
        },
        ticketStats: ticketStatsOf(attendees),
      };
    },
  );

export const checkInFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ attendeeId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ attendee: Attendee; result: CheckinResult }> => {
    const { data: cur, error } = await (null as any)
      .from("attendees")
      .select("*")
      .eq("id", data.attendeeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cur) {
      throw new Error("Attendee not found");
    }
    const already = Boolean((cur as Row).checked_in);
    const result: CheckinResult = already ? "already" : "success";
    if (!already) {
      await (null as any)
        .from("attendees")
        .update({ checked_in: true })
        .eq("id", data.attendeeId);
    }
    await (null as any).from("checkin_logs").insert({
      attendee_id: data.attendeeId,
      result,
    });
    const attendee = mapAttendee({ ...(cur as Row), checked_in: true });
    return { attendee, result };
  });

export const undoCheckInFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ attendeeId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const upd = await (null as any)
      .from("attendees")
      .update({ checked_in: false })
      .eq("id", data.attendeeId);
    if (upd.error) throw new Error(upd.error.message);
    const del = await (null as any)
      .from("checkin_logs")
      .delete()
      .eq("attendee_id", data.attendeeId);
    if (del.error) throw new Error(del.error.message);
    return { ok: true };
  });
