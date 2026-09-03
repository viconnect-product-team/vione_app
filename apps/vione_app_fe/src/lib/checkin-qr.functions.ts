// Demo/ops helper: liệt kê sự kiện của hiệp hội hiện tại kèm dữ liệu check-in
// (payload QR/NFC = event id — đúng chuẩn mà /m/checkin đang xác thực server-side).
import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type CheckinQrEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  registered: number;
  capacity: number;
  checkedIn: number;
};

export const getCheckinQrEventsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<CheckinQrEvent[]> => {
    const [events, checkins] = await Promise.all([
      (null as any)
        .from("events")
        .select("id, name, date, location, status, registered, capacity")
        .order("date", { ascending: true }),
      (null as any).from("member_checkins").select("event_id").eq("status", "success"),
    ]);
    if (events.error) throw new Error(events.error.message);

    const counts = new Map<string, number>();
    for (const row of checkins.data ?? []) {
      const id = (row as { event_id: string | null }).event_id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return (events.data ?? []).map((e: any) => ({
      id: e.id as string,
      name: e.name as string,
      date: e.date as string,
      location: (e.location as string) ?? "",
      status: (e.status as string) ?? "upcoming",
      registered: Number(e.registered ?? 0),
      capacity: Number(e.capacity ?? 0),
      checkedIn: counts.get(e.id as string) ?? 0,
    }));
  });
