import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

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

import { fetchNestApiFromServer } from "@/lib/api-client";

// ---------- Events ----------

export const listMyEvents = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<MyEvent[]> => {
    return fetchNestApiFromServer("/events/my-events", context.token);
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    return fetchNestApiFromServer(`/events/${encodeURIComponent(data.eventId)}/register`, context.token, {
      method: "POST",
    });
  });
