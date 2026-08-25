import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve the current authenticated user's member id (text) server-side.
 * Uses the security-definer `current_member_id()` function so identity is
 * derived from the JWT (auth.uid()) — never from client-supplied input.
 */
export async function resolveMemberId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("current_member_id");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tài khoản chưa được liên kết hồ sơ hội viên.");
  return data as unknown as string;
}

/**
 * Like {@link resolveMemberId} but returns null when the signed-in user has no
 * linked member profile, instead of throwing. Use for read paths that should
 * degrade gracefully (e.g. showing an empty interaction history).
 */
export async function resolveMemberIdOrNull(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.rpc("current_member_id");
  if (error) throw new Error(error.message);
  return (data as unknown as string) ?? null;
}

/**
 * Resolve the current authenticated user's active association id (uuid)
 * server-side via the security-definer `current_association_id()` function.
 * Identity comes from the JWT (auth.uid()) — never client input.
 */
export async function resolveAssociationId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("current_association_id");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tài khoản chưa thuộc hiệp hội nào.");
  return data as unknown as string;
}
