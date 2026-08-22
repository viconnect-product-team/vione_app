// BC-Mobile-8A — RPC mỏng cho hộp thư nội bộ (Inbox).
//
// Bất biến:
// - Người gửi = context.userId, không bao giờ từ client.
// - Chỉ mở/gửi được khi hai bên là kết nối ĐÃ CHẤP NHẬN; trigger cơ sở dữ liệu
//   kiểm tra lần hai (defense in depth).
// - clientToken chống trùng lặp khi bấm hai lần / mất mạng gửi lại.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAcceptedPair, pairOf, resolveCounterpartCards } from "./dm.server";
import {
  DM_MAX_BODY_LEN,
  DM_PAGE_SIZE,
  dmPersonIdToUserId,
  sanitizeDmBody,
  type BcDmMessage,
  type BcDmResult,
  type BcDmThreadSummary,
} from "./dm.types";

const THREADS = "bc_dm_threads";
const MESSAGES = "bc_dm_messages";
const THREAD_COLUMNS =
  "id, pair_user_low, pair_user_high, last_message_at, last_message_preview, last_message_sender_id";

type ThreadRow = {
  id: string;
  pair_user_low: string;
  pair_user_high: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  retracted_at: string | null;
};

function toMessage(row: MessageRow, viewerId: string): BcDmMessage {
  const retracted = row.retracted_at !== null;
  return {
    id: row.id,
    threadId: row.thread_id,
    fromMe: row.sender_user_id === viewerId,
    body: retracted ? "" : row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
    retractedAt: row.retracted_at,
  };
}

// ── Danh sách hộp thư ───────────────────────────────────────────────────────

export const bcDmThreadsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BcDmResult<{ threads: BcDmThreadSummary[] }>> => {
    const viewerId = context.userId;
    const { data, error } = await context.supabase
      .from(THREADS)
      .select(THREAD_COLUMNS)
      .or(`pair_user_low.eq.${viewerId},pair_user_high.eq.${viewerId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);
    if (error) return { ok: false, error: "unavailable" };

    const rows = (data ?? []) as ThreadRow[];
    const others = rows.map((r) => (r.pair_user_low === viewerId ? r.pair_user_high : r.pair_user_low));
    const cards = await resolveCounterpartCards(context.supabase, others);

    // Đếm chưa đọc theo từng cuộc trò chuyện (tin của người kia, chưa đọc).
    const unread = new Map<string, number>();
    if (rows.length > 0) {
      const { data: unreadRows } = await context.supabase
        .from(MESSAGES)
        .select("thread_id, sender_user_id, read_at, retracted_at")
        .in(
          "thread_id",
          rows.map((r) => r.id),
        )
        .is("read_at", null)
        .is("retracted_at", null)
        .neq("sender_user_id", viewerId)
        .limit(500);
      for (const r of (unreadRows ?? []) as { thread_id: string }[]) {
        unread.set(r.thread_id, (unread.get(r.thread_id) ?? 0) + 1);
      }
    }

    const threads: BcDmThreadSummary[] = rows.map((r) => {
      const otherId = r.pair_user_low === viewerId ? r.pair_user_high : r.pair_user_low;
      const card = cards.get(otherId);
      return {
        threadId: r.id,
        personId: `u:${otherId}`,
        displayName: card?.displayName ?? "—",
        avatarUrl: card?.avatarUrl ?? null,
        headline: card?.headline ?? null,
        companyName: card?.companyName ?? null,
        lastMessageAt: r.last_message_at,
        lastMessagePreview: r.last_message_preview,
        lastMessageFromMe: r.last_message_sender_id === viewerId,
        unreadCount: unread.get(r.id) ?? 0,
      };
    });
    return { ok: true, threads };
  });

// ── Mở (hoặc tạo) cuộc trò chuyện với một người đã kết nối ─────────────────

const openInput = z.object({ personId: z.string().regex(/^u:[0-9a-fA-F-]{36}$/) });

export const bcDmOpenThreadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => openInput.parse(data))
  .handler(async ({ data, context }): Promise<BcDmResult<{ threadId: string }>> => {
    const viewerId = context.userId;
    const otherId = dmPersonIdToUserId(data.personId);
    if (!otherId || otherId === viewerId) return { ok: false, error: "invalid_input" };
    if (!(await isAcceptedPair(context.supabase, viewerId, otherId))) {
      return { ok: false, error: "not_connected" };
    }
    const { low, high } = pairOf(viewerId, otherId);

    const existing = await context.supabase
      .from(THREADS)
      .select("id")
      .eq("pair_user_low", low)
      .eq("pair_user_high", high)
      .limit(1)
      .maybeSingle();
    if (existing.data?.id) return { ok: true, threadId: existing.data.id as string };

    const { data: created, error } = await context.supabase
      .from(THREADS)
      .insert({ pair_user_low: low, pair_user_high: high, created_by: viewerId })
      .select("id")
      .single();
    if (error || !created) {
      // Chạy song song hai thiết bị → unique constraint; đọc lại là đủ.
      const retry = await context.supabase
        .from(THREADS)
        .select("id")
        .eq("pair_user_low", low)
        .eq("pair_user_high", high)
        .limit(1)
        .maybeSingle();
      if (retry.data?.id) return { ok: true, threadId: retry.data.id as string };
      return { ok: false, error: "unavailable" };
    }
    return { ok: true, threadId: created.id as string };
  });

// ── Đọc một cuộc trò chuyện ────────────────────────────────────────────────

const threadInput = z.object({
  threadId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(DM_PAGE_SIZE),
});

export const bcDmThreadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => threadInput.parse(data))
  .handler(
    async ({
      data,
      context,
    }): Promise<BcDmResult<{ thread: BcDmThreadSummary; messages: BcDmMessage[] }>> => {
      const viewerId = context.userId;
      const { data: row, error } = await context.supabase
        .from(THREADS)
        .select(THREAD_COLUMNS)
        .eq("id", data.threadId)
        .maybeSingle();
      if (error) return { ok: false, error: "unavailable" };
      if (!row) return { ok: false, error: "not_found" };

      const thread = row as ThreadRow;
      const otherId = thread.pair_user_low === viewerId ? thread.pair_user_high : thread.pair_user_low;
      const cards = await resolveCounterpartCards(context.supabase, [otherId]);
      const card = cards.get(otherId);

      const { data: msgRows, error: msgError } = await context.supabase
        .from(MESSAGES)
        .select("id, thread_id, sender_user_id, body, created_at, read_at, retracted_at")
        .eq("thread_id", data.threadId)
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (msgError) return { ok: false, error: "unavailable" };

      const messages = ((msgRows ?? []) as MessageRow[])
        .map((m) => toMessage(m, viewerId))
        .reverse();

      return {
        ok: true,
        thread: {
          threadId: thread.id,
          personId: `u:${otherId}`,
          displayName: card?.displayName ?? "—",
          avatarUrl: card?.avatarUrl ?? null,
          headline: card?.headline ?? null,
          companyName: card?.companyName ?? null,
          lastMessageAt: thread.last_message_at,
          lastMessagePreview: thread.last_message_preview,
          lastMessageFromMe: thread.last_message_sender_id === viewerId,
          unreadCount: messages.filter((m) => !m.fromMe && m.readAt === null && !m.retractedAt)
            .length,
        },
        messages,
      };
    },
  );

// ── Gửi tin ────────────────────────────────────────────────────────────────

const sendInput = z.object({
  threadId: z.string().uuid(),
  body: z.string().max(DM_MAX_BODY_LEN + 200),
  clientToken: z.string().uuid(),
});

export const bcDmSendFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => sendInput.parse(data))
  .handler(async ({ data, context }): Promise<BcDmResult<{ message: BcDmMessage }>> => {
    const body = sanitizeDmBody(data.body);
    if (!body) return { ok: false, error: "empty_message" };

    const { data: row, error } = await context.supabase
      .from(MESSAGES)
      .insert({
        thread_id: data.threadId,
        sender_user_id: context.userId,
        body,
        client_token: data.clientToken,
      })
      .select("id, thread_id, sender_user_id, body, created_at, read_at, retracted_at")
      .single();

    if (error || !row) {
      if (error?.message?.includes("DM_PAIR_NOT_AUTHORIZED")) {
        return { ok: false, error: "not_connected" };
      }
      if (error?.code === "23505") {
        // Gửi lại cùng token → trả về tin đã tồn tại (idempotent).
        const dup = await context.supabase
          .from(MESSAGES)
          .select("id, thread_id, sender_user_id, body, created_at, read_at, retracted_at")
          .eq("thread_id", data.threadId)
          .eq("sender_user_id", context.userId)
          .eq("client_token", data.clientToken)
          .maybeSingle();
        if (dup.data) {
          return { ok: true, message: toMessage(dup.data as MessageRow, context.userId) };
        }
      }
      return { ok: false, error: "unavailable" };
    }
    return { ok: true, message: toMessage(row as MessageRow, context.userId) };
  });

// ── Đánh dấu đã đọc ────────────────────────────────────────────────────────

const markReadInput = z.object({ threadId: z.string().uuid() });

export const bcDmMarkReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => markReadInput.parse(data))
  .handler(async ({ data, context }): Promise<BcDmResult<{ updated: number }>> => {
    const { data: rows, error } = await context.supabase
      .from(MESSAGES)
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", data.threadId)
      .neq("sender_user_id", context.userId)
      .is("read_at", null)
      .select("id");
    if (error) return { ok: false, error: "unavailable" };
    return { ok: true, updated: (rows ?? []).length };
  });

// ── Thu hồi tin của chính mình ─────────────────────────────────────────────

const retractInput = z.object({ messageId: z.string().uuid() });

export const bcDmRetractFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => retractInput.parse(data))
  .handler(async ({ data, context }): Promise<BcDmResult<{ message: BcDmMessage }>> => {
    const { data: row, error } = await context.supabase
      .from(MESSAGES)
      .update({ retracted_at: new Date().toISOString() })
      .eq("id", data.messageId)
      .eq("sender_user_id", context.userId)
      .is("retracted_at", null)
      .select("id, thread_id, sender_user_id, body, created_at, read_at, retracted_at")
      .maybeSingle();
    if (error) return { ok: false, error: "unavailable" };
    if (!row) return { ok: false, error: "not_found" };
    return { ok: true, message: toMessage(row as MessageRow, context.userId) };
  });
