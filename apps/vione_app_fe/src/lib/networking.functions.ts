import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ChatMessage, ConnectionStatus } from "./networking-data";
import { resolveMemberId } from "./current-member";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Row = Record<string, unknown>;

function mapMessage(r: Row): ChatMessage {
  return {
    id: r.id as string,
    fromId: r.from_id as string,
    toId: r.to_id as string,
    text: r.text as string,
    at: r.created_at as string,
    readAt: (r.read_at as string | null) ?? null,
  };
}

export const getNetworkStateFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      currentMemberId: string | null;
      statuses: Record<string, ConnectionStatus>;
      timestamps: Record<string, string>;
      messages: ChatMessage[];
    }> => {
      // Resolve current member; a non-member (admin) simply has no connections.
      let me: string | null = null;
      try {
        me = await resolveMemberId(context.supabase);
      } catch {
        me = null;
      }

      const [conns, msgs] = await Promise.all([
        context.supabase.from("connections").select("peer_id,status,updated_at,created_at"),
        context.supabase.from("messages").select("*").order("created_at", { ascending: true }),
      ]);
      if (conns.error) throw new Error(conns.error.message);
      if (msgs.error) throw new Error(msgs.error.message);

      const statuses: Record<string, ConnectionStatus> = {};
      const timestamps: Record<string, string> = {};
      for (const r of conns.data ?? []) {
        const row = r as Row;
        const peerId = row.peer_id as string | null;
        if (!peerId) continue;
        statuses[peerId] = row.status as ConnectionStatus;
        // updated_at reflects the last status change (sent/accepted); fall back to created_at.
        timestamps[peerId] =
          (row.updated_at as string | null) ?? (row.created_at as string | null) ?? "";
      }
      // Always return the full schema: empty object/array when there are no
      // connections or messages (never null/undefined fields).
      return {
        currentMemberId: me ?? null,
        statuses,
        timestamps,
        messages: (msgs.data ?? []).map((m) => mapMessage(m as Row)),
      };
    },
  );

// Send a connection request to a peer member.
export const sendRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ peerId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.rpc("net_send_request", {
      _peer: data.peerId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Accept an incoming connection request from a peer member.
export const acceptRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ peerId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.rpc("net_accept_request", {
      _peer: data.peerId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Decline an incoming request and notify the requester.
export const declineRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ peerId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.rpc("net_decline_request", {
      _peer: data.peerId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Remove/cancel/disconnect a connection (both directions).
export const removeConnectionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ peerId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.rpc("net_remove_connection", {
      _peer: data.peerId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendMessageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        toId: z.string().min(1).max(128),
        text: z.string().min(1).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ChatMessage> => {
    const memberId = await resolveMemberId(context.supabase);
    const { data: row, error } = await context.supabase
      .from("messages")
      .insert({ from_id: memberId, to_id: data.toId, text: data.text.trim() })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    // Ensure a connection exists when messaging (both directions, via RPC).
    await context.supabase.rpc("net_accept_request", { _peer: data.toId });
    return mapMessage(row as Row);
  });

// Mark all messages from a given peer (to me) as read.
export const markThreadReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ peerId: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const memberId = await resolveMemberId(context.supabase);
    const { error } = await context.supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("from_id", data.peerId)
      .eq("to_id", memberId)
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMessageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    // Only allow deleting messages sent by the current user.
    const memberId = await resolveMemberId(context.supabase);
    const { error } = await context.supabase
      .from("messages")
      .delete()
      .eq("id", data.id)
      .eq("from_id", memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
