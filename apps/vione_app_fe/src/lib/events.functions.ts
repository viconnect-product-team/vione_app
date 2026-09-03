import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

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

import { fetchNestApiFromServer } from "./api-client";

export const listEventsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }) => {
    return fetchNestApiFromServer("/events", context.token);
  });

export const listRegistrationsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }) => {
    return fetchNestApiFromServer("/events/registrations", context.token);
  });

export const listEventsWithRegistrationsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }) => {
    return fetchNestApiFromServer("/events/with-registrations", context.token);
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
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => eventInput.parse(d))
  .handler(async ({ data, context }): Promise<EventItem> => {
    const res = await fetchNestApiFromServer("/events", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.event ?? res;
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
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => wizardInput.parse(d))
  .handler(async ({ data, context }): Promise<{ event: EventItem; tickets: TicketType[] }> => {
    return fetchNestApiFromServer("/events", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const listEventTicketTypesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<TicketType[]> => {
    return fetchNestApiFromServer(`/events/${encodeURIComponent(data.eventId)}/tickets`, context.token);
  });

export const updateEventFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => eventInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<EventItem> => {
    const { id, ...rest } = data;
    return fetchNestApiFromServer(`/events/${encodeURIComponent(id)}`, context.token, {
      method: "PUT",
      body: JSON.stringify(rest),
    });
  });

export const updateEventQrFieldsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        qrFields: z.array(z.enum(QR_FIELDS)).min(1).max(QR_FIELDS.length),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<EventItem> => {
    return fetchNestApiFromServer(`/events/${encodeURIComponent(data.id)}/qr-fields`, context.token, {
      method: "PUT",
      body: JSON.stringify({ qrFields: data.qrFields }),
    });
  });

export const deleteEventFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean; cancelledRegistrations: number }> => {
    return fetchNestApiFromServer(`/events/${encodeURIComponent(data.id)}`, context.token, {
      method: "DELETE",
    });
  });
