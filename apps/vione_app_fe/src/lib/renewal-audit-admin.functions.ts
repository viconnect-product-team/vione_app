// Admin lookup for the renewal audit log.
// Platform admins see every association; association admins are scoped to
// the associations they administer via memberships.role = 'admin'.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

type Ctx = { supabase: any; userId: string };

export type AdminRenewalAuditRow = {
  id: string;
  eventType: "payment" | "idempotent_noop" | "failure";
  memberId: string | null;
  memberName: string | null;
  memberCode: string | null;
  associationId: string | null;
  associationName: string | null;
  reference: string;
  method: string | null;
  amountPaid: number;
  invoiceNo: string | null;
  previousTermEnd: string | null;
  newTermEnd: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  metadata: Record<string, any>;
  createdAt: string;
};

export type AdminRenewalAuditScope = {
  isPlatformAdmin: boolean;
  associations: { id: string; name: string }[];
};

async function resolveScope(context: Ctx): Promise<AdminRenewalAuditScope> {
  const { supabase, userId } = context;
  const { data: isPlatformAdmin } = await supabase.rpc("is_platform_admin");

  if (isPlatformAdmin) {
    const { data } = await supabase.from("associations").select("id, name").order("name");
    return {
      isPlatformAdmin: true,
      associations: (data ?? []).map((a: any) => ({ id: a.id, name: a.name })),
    };
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("association_id, role")
    .eq("user_id", userId);

  const adminAssocIds = (memberships ?? [])
    .filter((m: any) => m.role === "admin" || m.role === "association_admin")
    .map((m: any) => m.association_id)
    .filter(Boolean);

  if (!adminAssocIds.length) return { isPlatformAdmin: false, associations: [] };

  const { data } = await supabase
    .from("associations")
    .select("id, name")
    .in("id", adminAssocIds)
    .order("name");

  return {
    isPlatformAdmin: false,
    associations: (data ?? []).map((a: any) => ({ id: a.id, name: a.name })),
  };
}

/** Associations the caller may inspect. Empty list ⇒ not an admin. */
export const getRenewalAuditScopeFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<AdminRenewalAuditScope> => resolveScope(context as Ctx));

const querySchema = z.object({
  associationId: z.string().uuid().nullish(),
  memberId: z.string().uuid().nullish(),
  search: z.string().max(120).nullish(),
  eventType: z.enum(["payment", "idempotent_noop", "failure"]).nullish(),
  from: z.string().max(40).nullish(),
  to: z.string().max(40).nullish(),
  limit: z.number().int().min(1).max(500).nullish(),
});

export const searchRenewalAuditLogFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((input: unknown) => querySchema.parse(input ?? {}))
  .handler(async ({ context, data }): Promise<AdminRenewalAuditRow[]> => {
    const ctx = context as Ctx;
    const scope = await resolveScope(ctx);
    const allowedIds = scope.associations.map((a: any) => a.id);
    if (!scope.isPlatformAdmin && !allowedIds.length) throw new Error("Forbidden");

    // Privileged read: audit rows belong to other members, so RLS-as-user
    // cannot serve this admin view. Authorisation was verified above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("renewal_audit_log")
      .select(
        "id, event_type, member_id, association_id, reference, method, amount_paid, invoice_no, previous_term_end, new_term_end, error_code, error_message, metadata, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);

    if (data.associationId) {
      if (!scope.isPlatformAdmin && !allowedIds.includes(data.associationId)) {
        throw new Error("Forbidden");
      }
      q = q.eq("association_id", data.associationId);
    } else if (!scope.isPlatformAdmin) {
      q = q.in("association_id", allowedIds);
    }

    if (data.memberId) q = q.eq("member_id", data.memberId);
    if (data.eventType) q = q.eq("event_type", data.eventType);
    if (data.from) q = q.gte("created_at", new Date(data.from).toISOString());
    if (data.to) {
      const end = new Date(data.to);
      end.setHours(23, 59, 59, 999);
      q = q.lte("created_at", end.toISOString());
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const memberIds = Array.from(
      new Set((rows ?? []).map((r: any) => r.member_id).filter(Boolean)),
    );
    const assocIds = Array.from(
      new Set((rows ?? []).map((r: any) => r.association_id).filter(Boolean)),
    );

    const [membersRes, assocRes] = await Promise.all([
      memberIds.length
        ? supabaseAdmin.from("members").select("id, name, code").in("id", memberIds)
        : Promise.resolve({ data: [] as any[] }),
      assocIds.length
        ? supabaseAdmin.from("associations").select("id, name").in("id", assocIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const memberMap = new Map<string, any>(
      ((membersRes as any).data ?? []).map((m: any) => [m.id as string, m]),
    );
    const assocMap = new Map<string, string>(
      ((assocRes as any).data ?? []).map((a: any) => [a.id as string, a.name as string]),
    );

    const needle = (data.search ?? "").trim().toLowerCase();

    return (rows ?? [])
      .map((r: any) => {
        const m: any = memberMap.get(r.member_id);
        return {
          id: r.id as string,
          eventType: r.event_type as AdminRenewalAuditRow["eventType"],
          memberId: r.member_id ?? null,
          memberName: m?.name ?? null,
          memberCode: m?.code ?? null,
          associationId: r.association_id ?? null,
          associationName: assocMap.get(r.association_id) ?? null,
          reference: r.reference as string,
          method: r.method ?? null,
          amountPaid: Number(r.amount_paid ?? 0),
          invoiceNo: r.invoice_no ?? null,
          previousTermEnd: r.previous_term_end ?? null,
          newTermEnd: r.new_term_end ?? null,
          errorCode: r.error_code ?? null,
          errorMessage: r.error_message ?? null,
          metadata: (r.metadata as Record<string, any>) ?? {},
          createdAt: r.created_at as string,
        } satisfies AdminRenewalAuditRow;
      })
      .filter((r: AdminRenewalAuditRow) => {
        if (!needle) return true;
        return [r.memberName, r.memberCode, r.reference, r.invoiceNo]
          .filter(Boolean)
          .some((v: any) => String(v).toLowerCase().includes(needle));
      });
  });
