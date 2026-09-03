// Admin overview: danh sách sự kiện kèm lượt đăng ký và số người tham dự
// (check-in thành công) — dữ liệu lấy từ domain sự kiện chuẩn, không tạo backend song song.
import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type EventOverviewRow = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  capacity: number;
  registrations: number;
  confirmed: number;
  cancelled: number;
  attended: number;
};

export const getEventsOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<EventOverviewRow[]> => {
    const [events, regs, checkins] = await Promise.all([
      (null as any)
        .from("events")
        .select("id, name, date, location, status, capacity")
        .order("date", { ascending: false }),
      (null as any).from("event_registrations").select("event_id, status"),
      (null as any).from("member_checkins").select("event_id").eq("status", "success"),
    ]);
    if (events.error) throw new Error(events.error.message);

    const total = new Map<string, number>();
    const confirmed = new Map<string, number>();
    const cancelled = new Map<string, number>();
    for (const row of regs.data ?? []) {
      const id = (row as { event_id: string | null }).event_id;
      if (!id) continue;
      const status = String((row as { status: string | null }).status ?? "");
      total.set(id, (total.get(id) ?? 0) + 1);
      if (status === "cancelled") cancelled.set(id, (cancelled.get(id) ?? 0) + 1);
      else if (status === "confirmed" || status === "registered")
        confirmed.set(id, (confirmed.get(id) ?? 0) + 1);
    }

    const attended = new Map<string, number>();
    for (const row of checkins.data ?? []) {
      const id = (row as { event_id: string | null }).event_id;
      if (!id) continue;
      attended.set(id, (attended.get(id) ?? 0) + 1);
    }

    return (events.data ?? []).map((e: any) => ({
      id: e.id as string,
      name: e.name as string,
      date: e.date as string,
      location: (e.location as string) ?? "",
      status: (e.status as string) ?? "upcoming",
      capacity: Number(e.capacity ?? 0),
      registrations: total.get(e.id as string) ?? 0,
      confirmed: confirmed.get(e.id as string) ?? 0,
      cancelled: cancelled.get(e.id as string) ?? 0,
      attended: attended.get(e.id as string) ?? 0,
    }));
  });
