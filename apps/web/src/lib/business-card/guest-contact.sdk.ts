// BC-Mobile-3B — Guest Contact browser SDK (owner-side reads).
//
// Every query runs on the viewer's session against RLS: the owner can only
// ever see their OWN guest contacts (owner_user_id = auth.uid()). There are
// no client writes — submissions go through the anonymous endpoint + RPC.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { mapGuestContactRow, type GuestContact, type GuestContactRow } from "./guest-contact";

const TABLE = "guest_contacts";
const COLUMNS =
  "id, display_name, phone, email, company_name, title, consent_version, source, website, address, first_shared_at, last_shared_at, first_captured_at, owner_label, owner_note";

/** Owner-side list is bounded — newest shares first. */
export const GUEST_CONTACTS_LIST_LIMIT = 200;

function db(): SupabaseClient {
  // The generated Database types lag this new table; the base client keeps
  // the query untyped and rows are mapped through the canonical mapper.
  return supabase as unknown as SupabaseClient;
}

export const GuestContactSDK = {
  /** Owner-scoped (RLS) newest-first list, bounded. */
  async listMine(): Promise<GuestContact[]> {
    const { data, error } = await db()
      .from(TABLE)
      .select(COLUMNS)
      .order("last_shared_at", { ascending: false })
      .limit(GUEST_CONTACTS_LIST_LIMIT);
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as GuestContactRow[]).map(mapGuestContactRow);
  },

  /** Owner-scoped single fetch — the row existing for THIS viewer IS the
   * authorization (same posture as the saved-card edge in 2C). */
  async getMine(id: string): Promise<GuestContact | null> {
    const { data, error } = await db().from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapGuestContactRow(data as unknown as GuestContactRow) : null;
  },

  /**
   * Cập nhật nhãn/ghi chú RIÊNG TƯ của chủ sở hữu. Quyền cột ở CSDL chỉ cho
   * phép ghi hai trường này — dữ liệu gốc do khách chia sẻ luôn bất biến.
   */
  async updateOwnerFields(
    id: string,
    patch: { ownerLabel?: string | null; ownerNote?: string | null },
  ): Promise<GuestContact | null> {
    const payload: Record<string, string | null> = {};
    if (patch.ownerLabel !== undefined) payload.owner_label = patch.ownerLabel;
    if (patch.ownerNote !== undefined) payload.owner_note = patch.ownerNote;
    if (Object.keys(payload).length === 0) return GuestContactSDK.getMine(id);
    const { data, error } = await db()
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapGuestContactRow(data as unknown as GuestContactRow) : null;
  },

  /** Xoá hồ sơ liên hệ khách của chính chủ sở hữu (RLS chặn mọi chủ thể khác). */
  async deleteMine(id: string): Promise<{ removed: boolean }> {
    const { error } = await db().from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { removed: true };
  },
};
