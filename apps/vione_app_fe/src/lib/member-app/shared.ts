// Shared helpers for the member-app domain: date formatting and the
// canonical association resolver. Server-usable (RLS client passed in), no
// service-role or secrets, so this stays a plain (non-.server) module.

export function relTime(iso: string | null): string {
  // Returns the raw ISO string; the client localizes it via useFmt().rel().
  return iso ?? "";
}

export function fmtDate(d: string | null): string | null {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("vi-VN");
}

export async function resolveAssociationId(supabase: any, userId: string): Promise<string | null> {
  const { data: activeId } = await supabase.rpc("current_association_id");
  let associationId: string | null = (activeId as string | null) ?? null;
  if (!associationId) {
    const { data: mem } = await supabase
      .from("members")
      .select("association_id")
      .eq("user_id", userId)
      .maybeSingle();
    associationId = (mem as any)?.association_id ?? null;
  }
  if (!associationId) {
    const { data: rows } = await supabase
      .from("memberships")
      .select("association_id, is_default, created_at")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);
    associationId = (rows ?? [])[0]?.association_id ?? null;
  }
  return associationId;
}
