import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Data fields that can be embedded into an event's ticket QR code.
export const QR_FIELDS = ["registration_code", "verify_url", "ticket_code"] as const;
export type QrField = (typeof QR_FIELDS)[number];

export type EventItem = {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  type: "forum" | "workshop" | "networking" | "training";
  qrFields: QrField[];
};

export type TicketType = {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  sortOrder: number;
};

export type Registration = {
  id: string;
  eventId: string;
  memberCode: string;
  memberName: string;
  email: string;
  registeredAt: string;
  status: "confirmed" | "waitlist" | "cancelled";
  ticketType: "standard" | "vip" | "speaker";
};

type Row = Record<string, unknown>;

function mapEvent(r: Row): EventItem {
  return {
    id: r.id as string,
    name: r.name as string,
    date: r.date as string,
    location: (r.location as string) ?? "",
    capacity: (r.capacity as number) ?? 0,
    registered: (r.registered as number) ?? 0,
    status: r.status as EventItem["status"],
    type: r.type as EventItem["type"],
    qrFields: normalizeQrFields(r.qr_fields),
  };
}

function normalizeQrFields(v: unknown): QrField[] {
  const arr = Array.isArray(v) ? (v as string[]) : [];
  const valid = arr.filter((f): f is QrField => (QR_FIELDS as readonly string[]).includes(f));
  return valid.length ? valid : ["registration_code"];
}

function mapTicket(r: Row): TicketType {
  return {
    id: r.id as string,
    eventId: r.event_id as string,
    name: r.name as string,
    price: Number(r.price ?? 0),
    quantity: Number(r.quantity ?? 0),
    description: (r.description as string) ?? "",
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function mapReg(r: Row): Registration {
  return {
    id: r.id as string,
    eventId: r.event_id as string,
    memberCode: r.member_code as string,
    memberName: (r.member_name as string) ?? "",
    email: (r.email as string) ?? "",
    registeredAt: r.registered_at as string,
    status: r.status as Registration["status"],
    ticketType: r.ticket_type as string as Registration["ticketType"],
  };
}

export const listEventsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let query = context.supabase.from("events").select("*").order("date", { ascending: true });
    if (activeId) query = query.eq("association_id", activeId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEvent);
  });

export const listRegistrationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("event_registrations")
      .select("*")
      .order("registered_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapReg);
  });

export const listEventsWithRegistrationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getActiveAssociationId } = await import("./assoc-scope.server");
    const activeId = await getActiveAssociationId(context.supabase);
    let evQuery = context.supabase.from("events").select("*").order("date", { ascending: true });
    if (activeId) evQuery = evQuery.eq("association_id", activeId);
    const [ev, reg] = await Promise.all([
      evQuery,
      context.supabase
        .from("event_registrations")
        .select("*")
        .order("registered_at", { ascending: false }),
    ]);
    if (ev.error) throw new Error(ev.error.message);
    if (reg.error) throw new Error(reg.error.message);
    return {
      events: (ev.data ?? []).map(mapEvent),
      registrations: (reg.data ?? []).map(mapReg),
    };
  });

const eventInput = z.object({
  name: z.string().min(1).max(200),
  date: z.string().min(1).max(40),
  location: z.string().max(200).default(""),
  capacity: z.number().int().min(0).max(1000000).default(0),
  type: z.enum(["forum", "workshop", "networking", "training"]),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
});

export const createEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => eventInput.parse(d))
  .handler(async ({ data, context }): Promise<EventItem> => {
    const { genCode, logActivity } = await import("./crud.server");
    const id = genCode("EV");
    const { data: row, error } = await context.supabase
      .from("events")
      .insert({ id, ...data, registered: 0 })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Tạo sự kiện",
      target: data.name,
      category: "event",
    });
    return mapEvent(row);
  });

// ---- Event creation wizard: event info + ticket types + QR content ----

const ticketInput = z.object({
  name: z.string().min(1).max(120),
  price: z.number().min(0).max(1_000_000_000).default(0),
  quantity: z.number().int().min(0).max(1_000_000).default(0),
  description: z.string().max(500).default(""),
});

const wizardInput = eventInput.extend({
  qrFields: z.array(z.enum(QR_FIELDS)).min(1).max(QR_FIELDS.length),
  tickets: z.array(ticketInput).max(20).default([]),
});

export const createEventWithConfigFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => wizardInput.parse(d))
  .handler(async ({ data, context }): Promise<{ event: EventItem; tickets: TicketType[] }> => {
    const { genCode, logActivity } = await import("./crud.server");
    const { qrFields, tickets, ...eventData } = data;
    // Dedupe QR fields while preserving order.
    const qr = Array.from(new Set(qrFields));
    const id = genCode("EV");
    const { data: row, error } = await context.supabase
      .from("events")
      .insert({ id, ...eventData, registered: 0, qr_fields: qr })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    let ticketRows: TicketType[] = [];
    if (tickets.length) {
      const payload = tickets.map((tkt, i) => ({
        id: `${genCode("TK")}-${i}`,
        event_id: id,
        name: tkt.name,
        price: tkt.price,
        quantity: tkt.quantity,
        description: tkt.description,
        sort_order: i,
      }));
      const { data: trows, error: terr } = await context.supabase
        .from("event_ticket_types")
        .insert(payload)
        .select("*");
      if (terr) throw new Error(terr.message);
      ticketRows = (trows ?? []).map(mapTicket);
    }

    await logActivity(context.supabase, {
      action: "Tạo sự kiện (wizard)",
      target: data.name,
      category: "event",
    });
    return { event: mapEvent(row), tickets: ticketRows };
  });

export const listEventTicketTypesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<TicketType[]> => {
    const { data: rows, error } = await context.supabase
      .from("event_ticket_types")
      .select("*")
      .eq("event_id", data.eventId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapTicket);
  });

export const updateEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => eventInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<EventItem> => {
    const { logActivity } = await import("./crud.server");
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("events")
      .update(rest)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Cập nhật sự kiện",
      target: data.name,
      category: "event",
    });
    return mapEvent(row);
  });

export const updateEventQrFieldsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        qrFields: z.array(z.enum(QR_FIELDS)).min(1).max(QR_FIELDS.length),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<EventItem> => {
    const { logActivity } = await import("./crud.server");
    const qr = Array.from(new Set(data.qrFields));
    const { data: row, error } = await context.supabase
      .from("events")
      .update({ qr_fields: qr })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, {
      action: "Cập nhật định dạng QR sự kiện",
      target: row.name as string,
      category: "event",
    });
    return mapEvent(row);
  });

export const deleteEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean; cancelledRegistrations: number }> => {
    // Resolve the event (needed for the audit target + to confirm it exists).
    const ev = await context.supabase
      .from("events")
      .select("id, name")
      .eq("id", data.id)
      .maybeSingle();
    if (ev.error) throw new Error(ev.error.message);
    if (!ev.data) throw new Error("Event not found");

    // Business rule: cancelling an event soft-cancels its registrations (tickets)
    // so the history is preserved. Only flip rows that are not already cancelled.
    const reg = await context.supabase
      .from("event_registrations")
      .update({ status: "cancelled" })
      .eq("event_id", data.id)
      .neq("status", "cancelled")
      .select("id");
    if (reg.error) throw new Error(reg.error.message);
    const cancelledRegistrations = (reg.data ?? []).length;

    // Soft-cancel the event itself instead of deleting it.
    const { error } = await context.supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    // Audit log (best-effort: never fail the action because logging failed).
    const now = new Date();
    const at = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const code = `L-${now.getTime().toString(36).toUpperCase()}`;
    const { error: logError } = await context.supabase.from("activity_log").insert({
      code,
      user: "system",
      action: `Hủy sự kiện (${cancelledRegistrations} đăng ký bị hủy)`,
      target: ev.data.name as string,
      category: "event",
      at,
    });
    if (logError) console.error("activity_log insert failed:", logError.message);

    return { ok: true, cancelledRegistrations };
  });
