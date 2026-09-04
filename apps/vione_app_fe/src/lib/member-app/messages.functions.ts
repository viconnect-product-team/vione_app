import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";
import { relTime } from "./shared";

export type MyConversation = {
  peerCode: string;
  name: string;
  last: string;
  time: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  mine: boolean;
  time: string;
  createdAt: string;
  seen: boolean;
};

// ---------- Messaging ----------
export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<MyConversation[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/dm/member/conversations", token);
      return (items ?? []).map((c: any) => ({
        peerCode: c.peerCode,
        name: c.name,
        last: c.last,
        time: relTime(c.time),
        unread: c.unread ?? 0,
      }));
    } catch {
      return [];
    }
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z.object({ peerCode: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/) }).parse(d),
  )
  .handler(async ({ data, context }: any): Promise<{ peerName: string; messages: ChatMessage[] }> => {
    try {
      const token = context?.token;
      const res = await fetchNestApiFromServer<{ peerName: string; messages: any[] }>(
        "/dm/member/messages?peerCode=" + encodeURIComponent(data.peerCode),
        token,
      );
      return {
        peerName: res?.peerName ?? data.peerCode.toUpperCase(),
        messages: (res?.messages ?? []).map((m: any) => ({
          id: m.id,
          text: m.text,
          mine: Boolean(m.mine),
          time: relTime(m.time || m.createdAt),
          createdAt: m.createdAt,
          seen: Boolean(m.seen),
        })),
      };
    } catch {
      return { peerName: data.peerCode.toUpperCase(), messages: [] };
    }
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ peerCode: z.string().min(1).max(64), text: z.string().trim().min(1).max(2000) })
      .parse(d),
  )
  .handler(async ({ data, context }: any): Promise<{ ok: boolean }> => {
    const token = context?.token;
    return fetchNestApiFromServer<{ ok: boolean }>("/dm/member/messages", token, {
      method: "POST",
      body: data,
    });
  });
