import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { relTime } from "./shared";
import { resolveMemberCode } from "@/lib/member-identity";

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
const resolveMyCode = resolveMemberCode;

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyConversation[]> => {
    const { supabase, userId } = context;
    const myCode = await resolveMyCode(supabase, userId);
    if (!myCode) return [];
    const mine = myCode.toLowerCase();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`from_id.ilike.${myCode},to_id.ilike.${myCode}`)
      .order("created_at", { ascending: false });
    const rows = msgs ?? [];
    // group by peer code (lowercased)
    const byPeer = new Map<string, any[]>();
    for (const m of rows) {
      const from = String(m.from_id).toLowerCase();
      const to = String(m.to_id).toLowerCase();
      const peer = from === mine ? to : from;
      if (!byPeer.has(peer)) byPeer.set(peer, []);
      byPeer.get(peer)!.push(m);
    }
    const peers = [...byPeer.keys()];
    // fetch member names for peers
    const { data: members } = await supabase.from("members").select("code, name");
    const nameByCode = new Map<string, string>();
    for (const mem of members ?? []) nameByCode.set(String(mem.code).toLowerCase(), mem.name);
    const result: MyConversation[] = peers.map((peer) => {
      const list = byPeer.get(peer)!; // already desc
      const latest = list[0];
      // Unread = messages this peer sent to me that I haven't read yet.
      const unread = list.filter(
        (m) => String(m.to_id).toLowerCase() === mine && m.read_at == null,
      ).length;
      return {
        peerCode: peer,
        name: nameByCode.get(peer) ?? peer.toUpperCase(),
        last: latest.text,
        time: relTime(latest.created_at),
        unread,
      };
    });
    // Sort: most recent conversation first.
    result.sort((a, b) => {
      const la = byPeer.get(a.peerCode)![0].created_at;
      const lb = byPeer.get(b.peerCode)![0].created_at;
      return lb < la ? -1 : lb > la ? 1 : 0;
    });
    return result;
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ peerCode: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ peerName: string; messages: ChatMessage[] }> => {
    const { supabase, userId } = context;
    const myCode = await resolveMyCode(supabase, userId);
    if (!myCode) return { peerName: data.peerCode, messages: [] };
    const mine = myCode.toLowerCase();
    const peer = data.peerCode.toLowerCase();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_id.ilike.${myCode},to_id.ilike.${data.peerCode}),and(from_id.ilike.${data.peerCode},to_id.ilike.${myCode})`,
      )
      .order("created_at", { ascending: true });
    const { data: mem } = await supabase
      .from("members")
      .select("name")
      .ilike("code", data.peerCode)
      .maybeSingle();
    // Mark messages sent to me by this peer as read.
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .ilike("from_id", data.peerCode)
      .ilike("to_id", myCode)
      .is("read_at", null);
    return {
      peerName: mem?.name ?? data.peerCode.toUpperCase(),
      messages: (msgs ?? []).map((m: any) => ({
        id: m.id,
        text: m.text,
        mine: String(m.from_id).toLowerCase() === mine,
        time: relTime(m.created_at),
        createdAt: m.created_at,
        seen: m.read_at != null,
      })),
    };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ peerCode: z.string().min(1).max(64), text: z.string().trim().min(1).max(2000) })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { supabase, userId } = context;
    const myCode = await resolveMyCode(supabase, userId);
    if (!myCode) throw new Error("ERR_NO_MEMBER_PROFILE");
    const { error } = await supabase.from("messages").insert({
      id: crypto.randomUUID(),
      from_id: myCode.toLowerCase(),
      to_id: data.peerCode.toLowerCase(),
      text: data.text,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
