// LeadService — the single home for Business Card lead + analytics business
// logic (BC-2.1D): lead projection, status-history / reply-metadata
// composition, and stats aggregation. Server functions are thin adapters that
// call this service. All persistence goes through LeadRepository and
// BusinessCardRepository; this module never queries tables directly.
//
// Statically imports NO *.server file, so it is safe to import from
// *.functions.ts.

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveMemberId } from "@/lib/current-member";
import { BusinessCardRepository } from "./business-card.repository";
import { LeadRepository } from "./lead.repository";
import {
  LEAD_STATUSES,
  type BusinessCardLead,
  type BusinessCardStats,
  type DailyPoint,
  type LeadHistoryEntry,
  type LeadReplyEntry,
  type LeadStatus,
  type ReplyChannel,
} from "./lead.types";

function readHistory(meta: Record<string, unknown> | null): LeadHistoryEntry[] {
  const raw = Array.isArray(meta?.history) ? (meta!.history as unknown[]) : [];
  return raw
    .map((h) => h as Record<string, unknown>)
    .filter((h) => typeof h.to === "string" && typeof h.at === "string")
    .map((h) => ({
      at: h.at as string,
      from: (h.from as LeadStatus | null) ?? null,
      to: h.to as LeadStatus,
      note: (h.note as string | null) ?? null,
    }));
}

function readReplies(meta: Record<string, unknown> | null): LeadReplyEntry[] {
  const raw = Array.isArray(meta?.replies) ? (meta!.replies as unknown[]) : [];
  return raw
    .map((h) => h as Record<string, unknown>)
    .filter((h) => typeof h.body === "string" && typeof h.at === "string")
    .map((h) => ({
      at: h.at as string,
      channel: ((h.channel as ReplyChannel) ?? "note") as ReplyChannel,
      templateId: (h.templateId as string | null) ?? null,
      subject: (h.subject as string | null) ?? null,
      body: h.body as string,
    }));
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const getHeaders = (token?: string): Record<string, string> => {
  const defaultToken = typeof window !== 'undefined' ? localStorage.getItem('vibe_token') : null;
  const t = token || defaultToken;
  return t ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` } : { "Content-Type": "application/json" };
};

export const LeadService = {
  /** List and project all leads owned by the current member. */
  async listMyLeads(token: string): Promise<BusinessCardLead[]> {
    const res = await fetch(`${API_URL}/business-cards/leads/me`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to list leads");
    return res.json();
  },

  /** Change lead status and append a status-history entry. */
  async updateStatus(
    token: string,
    id: string,
    status: LeadStatus,
    note?: string,
  ): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_URL}/business-cards/leads/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ status, note })
    });
    return res.json();
  },

  /** Append a reply entry and optionally mark the lead as responded. */
  async sendReply(
    token: string,
    input: {
      id: string;
      channel: ReplyChannel;
      templateId?: string | null;
      subject?: string | null;
      body: string;
      markResponded?: boolean;
    },
  ): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_URL}/business-cards/leads/${input.id}/reply`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(input)
    });
    return res.json();
  },

  /** Notification-center workflow: change status AND append history + reply. */
  async processWorkflow(
    token: string,
    id: string,
    status: "read" | "contacting" | "won" | "lost",
    note?: string,
  ): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_URL}/business-cards/leads/${id}/workflow`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ status, note })
    });
    return res.json();
  },

  /** Aggregate lead + interaction analytics for the current member. */
  async getStats(token: string, days?: number): Promise<BusinessCardStats> {
    const res = await fetch(`${API_URL}/business-cards/leads/stats?days=${days || 30}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
};
