// Server-only CRUD helpers (audit logging + code generation).
// Imported only inside createServerFn .handler() bodies via await import().

type Admin = any;

export function genCode(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function logActivity(
  admin: Admin,
  opts: { action: string; target: string; category: string; user?: string },
): Promise<void> {
  const now = new Date();
  const at = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  const code = `L-${now.getTime().toString(36).toUpperCase()}`;
  const { error } = await admin.from("activity_log").insert({
    code,
    user: opts.user ?? "system",
    action: opts.action,
    target: opts.target,
    category: opts.category,
    at,
  });
  if (error) console.error("activity_log insert failed:", error.message);
}
