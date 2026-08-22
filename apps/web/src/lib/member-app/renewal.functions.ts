import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Membership / Renewal ----------
export type MyMembershipInvoice = {
  id: string;
  invoice: string;
  year: number | null;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string | null;
  paidAt: string | null;
};

export type MyMembership = {
  found: boolean;
  code: string;
  name: string;
  level: string | null;
  status: string | null;
  joinedAt: string | null;
  termEnd: string | null;
  newTermEnd: string | null;
  renewedAt: string | null;
  feeYear: number | null;
  feePaid: boolean;
  daysToExpiry: number | null;
  outstandingAmount: number;
  invoices: MyMembershipInvoice[];
};

/** Returns the signed-in member's membership status, renewal schedule and dues. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyMembership> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select(
        "id, code, name, level, status, joined_at, fee_year, fee_paid, term_end, renewed_at, new_term_end",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (!me) {
      return {
        found: false,
        code: "",
        name: "",
        level: null,
        status: null,
        joinedAt: null,
        termEnd: null,
        newTermEnd: null,
        renewedAt: null,
        feeYear: null,
        feePaid: false,
        daysToExpiry: null,
        outstandingAmount: 0,
        invoices: [],
      };
    }

    const effectiveEnd = (me.new_term_end as string | null) ?? (me.term_end as string | null);
    let daysToExpiry: number | null = null;
    if (effectiveEnd) {
      const end = new Date(effectiveEnd).getTime();
      daysToExpiry = Math.ceil((end - Date.now()) / 86400000);
    }

    const { data: invRows } = await supabase
      .from("invoices")
      .select("invoice_no, year, amount, status, due_date, paid_at")
      .eq("member_id", me.id as string)
      .order("year", { ascending: false })
      .limit(20);

    const today = new Date();
    const invoices: MyMembershipInvoice[] = (invRows ?? []).map((i, idx) => {
      const raw = (i.status as string) ?? "";
      const due = i.due_date as string | null;
      let status: MyMembershipInvoice["status"] = raw === "paid" ? "paid" : "pending";
      if (status === "pending" && due && new Date(due) < today) status = "overdue";
      return {
        id: (i.invoice_no as string) ?? `inv-${idx}`,
        invoice: (i.invoice_no as string) ?? "—",
        year: (i.year as number) ?? null,
        amount: Number(i.amount ?? 0),
        status,
        dueDate: due,
        paidAt: (i.paid_at as string) ?? null,
      };
    });

    const outstandingAmount = invoices
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + i.amount, 0);

    return {
      found: true,
      code: me.code as string,
      name: me.name as string,
      level: (me.level as string) ?? null,
      status: (me.status as string) ?? null,
      joinedAt: (me.joined_at as string) ?? null,
      termEnd: (me.term_end as string) ?? null,
      newTermEnd: (me.new_term_end as string) ?? null,
      renewedAt: (me.renewed_at as string) ?? null,
      feeYear: (me.fee_year as number) ?? null,
      feePaid: Boolean(me.fee_paid),
      daysToExpiry,
      outstandingAmount,
      invoices,
    };
  });

// ---------- Renewal history (detail) ----------
export type RenewalHistoryEntry = {
  id: string;
  invoice: string;
  year: number | null;
  amount: number;
  method: string | null;
  status: "paid" | "pending" | "overdue";
  paidAt: string | null;
  dueDate: string | null;
  /** Effective validity window derived from the invoice year. */
  termStart: string | null;
  termEnd: string | null;
  note: string | null;
};

/** Returns the signed-in member's detailed renewal history (paid & pending). */
export const getMyRenewalHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RenewalHistoryEntry[]> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me) return [];

    const { data: invRows } = await supabase
      .from("invoices")
      .select("invoice_no, year, amount, status, due_date, paid_at, method")

      .eq("member_id", me.id as string)
      .order("year", { ascending: false })
      .order("paid_at", { ascending: false })
      .limit(50);

    const today = new Date();
    return (invRows ?? []).map((i, idx) => {
      const raw = (i.status as string) ?? "";
      const due = (i.due_date as string) ?? null;
      let status: RenewalHistoryEntry["status"] = raw === "paid" ? "paid" : "pending";
      if (status === "pending" && due && new Date(due) < today) status = "overdue";
      const year = (i.year as number) ?? null;
      const termStart = year ? `${year}-01-01` : null;
      const termEnd = year ? `${year}-12-31` : null;
      return {
        id: (i.invoice_no as string) ?? `inv-${idx}`,
        invoice: (i.invoice_no as string) ?? "—",
        year,
        amount: Number(i.amount ?? 0),
        method: (i.method as string) ?? null,
        status,
        paidAt: (i.paid_at as string) ?? null,
        dueDate: due,
        termStart,
        termEnd,
        note: (i.method as string) ?? null,
      };
    });
  });

// ---------- Renewal reminder (in-app notification) ----------
export type RenewalReminderResult = {
  created: boolean;
  daysToExpiry: number | null;
  termEnd: string | null;
};

/**
 * Checks the signed-in member's expiry and, when within the reminder window
 * (30 days before → 30 days after expiry), inserts an in-app renewal reminder
 * notification. De-duplicates so at most one reminder is created per 7 days.
 */
export const checkRenewalReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RenewalReminderResult> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("id, name, association_id, term_end, new_term_end")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me) return { created: false, daysToExpiry: null, termEnd: null };

    const effectiveEnd = (me.new_term_end as string | null) ?? (me.term_end as string | null);
    if (!effectiveEnd) return { created: false, daysToExpiry: null, termEnd: null };

    const days = Math.ceil((new Date(effectiveEnd).getTime() - Date.now()) / 86400000);
    // Only remind within the actionable window.
    if (days > 30 || days < -30) {
      return { created: false, daysToExpiry: days, termEnd: effectiveEnd };
    }

    const memberId = me.id as string;
    // De-dupe: skip if a renewal reminder was created in the last 7 days.
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent } = await supabase
      .from("member_notifications")
      .select("id")
      .eq("recipient_id", memberId)
      .eq("type", "renewal")
      .gte("created_at", sevenDaysAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return { created: false, daysToExpiry: days, termEnd: effectiveEnd };
    }

    const endLabel = new Date(effectiveEnd).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const title = days < 0 ? "Thẻ hội viên đã hết hạn" : "Nhắc gia hạn hội viên";
    const body =
      days < 0
        ? `Thẻ hội viên của bạn đã hết hạn ngày ${endLabel} (quá ${Math.abs(days)} ngày). Vui lòng gia hạn để tiếp tục sử dụng quyền lợi.`
        : days === 0
          ? `Thẻ hội viên của bạn hết hạn hôm nay (${endLabel}). Hãy gia hạn ngay để không gián đoạn quyền lợi.`
          : `Thẻ hội viên của bạn sẽ hết hạn sau ${days} ngày (${endLabel}). Gia hạn sớm để duy trì quyền lợi hội viên.`;

    // GUARD: recipient_id + association_id are the session member's own values
    // (resolved from auth), so this only writes a self-scoped notification.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("member_notifications").insert({
      recipient_id: memberId,
      association_id: me.association_id as string,
      type: "renewal",
      title,
      body,
    });
    if (error) {
      return { created: false, daysToExpiry: days, termEnd: effectiveEnd };
    }
    return { created: true, daysToExpiry: days, termEnd: effectiveEnd };
  });

export type RenewalQuote = {
  found: boolean;
  code: string;
  amount: number;
  outstanding: number;
  renewalFee: number;
  currentTermEnd: string | null;
  nextTermEnd: string | null;
  pendingInvoices: string[];
};

const DEFAULT_RENEWAL_FEE = 2_000_000;

function addOneYear(iso: string | null): string {
  const base = iso ? new Date(iso) : new Date();
  const d = Number.isNaN(base.getTime()) ? new Date() : base;
  // Extend from the later of "now" or the current term end.
  const from = d.getTime() > Date.now() ? d : new Date();
  from.setFullYear(from.getFullYear() + 1);
  return from.toISOString().slice(0, 10);
}

async function loadRenewalContext(supabase: any, userId: string) {
  const { data: me } = await supabase
    .from("members")
    .select("id, code, term_end, new_term_end, renewed_at, fee_year")
    .eq("user_id", userId)
    .maybeSingle();
  if (!me) return null;
  const { data: invRows } = await supabase
    .from("invoices")
    .select("id, invoice_no, amount, status, due_date, paid_at, year")
    .eq("member_id", me.id as string)
    .order("year", { ascending: false })
    .limit(50);
  const invoices = (invRows ?? []) as any[];
  // Exclude BOTH paid and cancelled invoices from "pending": cancelled dues
  // are settled/void and must not be reactivated by a renewal call.
  const pending = invoices.filter((i) => {
    const s = (i.status as string) ?? "";
    return s !== "paid" && s !== "cancelled";
  });
  const outstanding = pending.reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const lastAmount = Number(invoices[0]?.amount ?? 0);
  const renewalFee = lastAmount > 0 ? lastAmount : DEFAULT_RENEWAL_FEE;
  const currentTermEnd = (me.new_term_end as string | null) ?? (me.term_end as string | null);
  return { me, invoices, pending, outstanding, renewalFee, currentTermEnd };
}

/** Computes the amount due to renew and the resulting term end. */
export const getRenewalQuote = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RenewalQuote> => {
    const { supabase, userId } = context;
    const ctx = await loadRenewalContext(supabase, userId);
    if (!ctx) {
      return {
        found: false,
        code: "",
        amount: 0,
        outstanding: 0,
        renewalFee: 0,
        currentTermEnd: null,
        nextTermEnd: null,
        pendingInvoices: [],
      };
    }
    const amount = ctx.outstanding > 0 ? ctx.outstanding : ctx.renewalFee;
    return {
      found: true,
      code: ctx.me.code as string,
      amount,
      outstanding: ctx.outstanding,
      renewalFee: ctx.renewalFee,
      currentTermEnd: ctx.currentTermEnd,
      nextTermEnd: addOneYear(ctx.currentTermEnd),
      pendingInvoices: ctx.pending.map((i) => i.invoice_no as string),
    };
  });

export type RenewalPaymentResult = {
  success: boolean;
  reference: string;
  amountPaid: number;
  method: string;
  newTermEnd: string | null;
  error?: string;
};

const renewMethodSchema = z.enum(["bank", "card", "ewallet"]);

/**
 * Processes a membership renewal payment (mock gateway), then — on success —
 * marks outstanding invoices paid, records a renewal invoice, and extends the
 * membership term by one year. Uses the service-role client for the privileged
 * writes after verifying the caller owns the member record.
 */
export const payMyRenewal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        method: renewMethodSchema,
        // Client-generated correlation id so toast / response / audit log all
        // show the exact same Ref, even if the response never reaches the UI.
        correlationId: z
          .string()
          .regex(/^PAY-[A-Z0-9-]{4,40}$/)
          .optional(),
        // Test hook so the UI can exercise the failure path deterministically.
        simulateFailure: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<RenewalPaymentResult> => {
    const { supabase, userId } = context;
    const reference = data.correlationId ?? `PAY-${Date.now().toString(36).toUpperCase()}`;
    const ctx = await loadRenewalContext(supabase, userId);
    if (!ctx) {
      return {
        success: false,
        reference,
        amountPaid: 0,
        method: data.method,
        newTermEnd: null,
        error: "no-member",
      };
    }

    const amount = ctx.outstanding > 0 ? ctx.outstanding : ctx.renewalFee;
    const memberId = ctx.me.id as string;
    const assocId = (ctx.me as { association_id?: string | null }).association_id ?? null;
    const previousRenewedAt = (ctx.me as { renewed_at?: string | null }).renewed_at ?? null;
    const previousTermEnd = ctx.currentTermEnd;

    // Audit sink — never throws (auditing must NEVER block a real payment).
    async function audit(
      admin: any,
      eventType: "payment" | "idempotent_noop" | "failure",
      overrides: Record<string, unknown> = {},
    ) {
      try {
        await admin.from("renewal_audit_log").insert({
          member_id: memberId,
          user_id: userId,
          association_id: assocId,
          event_type: eventType,
          reference,
          method: data.method,
          amount_paid: 0,
          previous_term_end: previousTermEnd,
          previous_renewed_at: previousRenewedAt,
          ...overrides,
        });
      } catch {
        /* swallow */
      }

      // Persist failure alerts in the notification centre so the member can
      // review them later and jump straight to the matching audit record.
      if (eventType === "failure" && assocId) {
        try {
          const code = (overrides.error_code as string | undefined) ?? "unknown";
          const message = (overrides.error_message as string | undefined) ?? "";
          await admin.from("member_notifications").insert({
            recipient_id: memberId,
            association_id: assocId,
            type: "renewal_failure",
            title: "Thanh toán gia hạn thất bại",
            body: `Mã tham chiếu ${reference} · Lỗi: ${code}${message ? ` — ${message}` : ""}`,
            ref_type: "renewal_audit",
            ref_id: reference,
          });
        } catch {
          /* swallow — notifications must never block payment */
        }
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Simulated gateway failure — record and return.
    if (data.simulateFailure) {
      await audit(supabaseAdmin, "failure", {
        error_code: "gateway-declined",
        error_message: "Simulated gateway decline",
      });
      return {
        success: false,
        reference,
        amountPaid: 0,
        method: data.method,
        newTermEnd: null,
        error: "gateway-declined",
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const newTermEnd = addOneYear(ctx.currentTermEnd);

    // Idempotency (1): already renewed today with no dues.
    if (previousRenewedAt === today && !ctx.pending.length) {
      await audit(supabaseAdmin, "idempotent_noop", {
        new_term_end: ctx.currentTermEnd,
        metadata: { reason: "renewed_today" },
      });
      return {
        success: true,
        reference,
        amountPaid: 0,
        method: data.method,
        newTermEnd: ctx.currentTermEnd,
      };
    }

    // Idempotency (2): target year already covered by a paid invoice.
    const targetYear = new Date(newTermEnd).getFullYear();
    const alreadyPaidForYear = ctx.invoices.some(
      (i: any) => (i.status as string) === "paid" && Number(i.year) === targetYear,
    );
    if (!ctx.pending.length && alreadyPaidForYear) {
      await audit(supabaseAdmin, "idempotent_noop", {
        new_term_end: ctx.currentTermEnd,
        metadata: { reason: "already_paid_for_year", target_year: targetYear },
      });
      return {
        success: true,
        reference,
        amountPaid: 0,
        method: data.method,
        newTermEnd: ctx.currentTermEnd,
      };
    }

    let settledInvoiceNo: string | null = null;
    try {
      if (ctx.pending.length) {
        settledInvoiceNo = (ctx.pending[0].invoice_no as string) ?? null;
        const { error } = await supabaseAdmin
          .from("invoices")
          .update({ status: "paid", paid_at: today, method: data.method })
          .in(
            "id",
            ctx.pending.map((i) => i.id as string),
          );
        if (error) throw new Error(error.message);
      } else {
        const year = new Date(newTermEnd).getFullYear();
        const invoiceNo = `HD-RENEW-${memberId}-${today}`;
        settledInvoiceNo = invoiceNo;
        const invId = `INV-${today}-${memberId}`;
        const { error } = await supabaseAdmin.from("invoices").insert({
          id: invId,
          invoice_no: invoiceNo,
          member_id: memberId,
          year,
          amount,
          due_date: today,
          paid_at: today,
          status: "paid",
          method: data.method,
        });
        if (error && (error as { code?: string }).code !== "23505") {
          throw new Error(error.message);
        }
      }

      const { error: mErr } = await supabaseAdmin
        .from("members")
        .update({ new_term_end: newTermEnd, renewed_at: today, fee_paid: true })
        .eq("id", memberId);
      if (mErr) throw new Error(mErr.message);
    } catch (e) {
      await audit(supabaseAdmin, "failure", {
        invoice_no: settledInvoiceNo,
        error_code: "write-failed",
        error_message: e instanceof Error ? e.message : "unknown",
      });
      return {
        success: false,
        reference,
        amountPaid: 0,
        method: data.method,
        newTermEnd: null,
        error: e instanceof Error ? e.message : "unknown",
      };
    }

    await audit(supabaseAdmin, "payment", {
      amount_paid: amount,
      invoice_no: settledInvoiceNo,
      new_term_end: newTermEnd,
    });

    return {
      success: true,
      reference,
      amountPaid: amount,
      method: data.method,
      newTermEnd,
    };
  });

// ---------- Renewal audit log ----------
export type RenewalAuditEntry = {
  id: string;
  eventType: "payment" | "idempotent_noop" | "failure";
  reference: string;
  method: string | null;
  amountPaid: number;
  invoiceNo: string | null;
  previousTermEnd: string | null;
  newTermEnd: string | null;
  previousRenewedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  metadata: Record<string, any>;
  createdAt: string;
};

/** Returns the signed-in member's renewal audit log (payments + no-ops + failures). */
export const getMyRenewalAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RenewalAuditEntry[]> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me) return [];

    const { data: rows } = await supabase
      .from("renewal_audit_log")
      .select(
        "id, event_type, reference, method, amount_paid, invoice_no, previous_term_end, new_term_end, previous_renewed_at, error_code, error_message, metadata, created_at",
      )
      .eq("member_id", me.id as string)
      .order("created_at", { ascending: false })
      .limit(100);

    return (rows ?? []).map((r: any) => ({
      id: r.id as string,
      eventType: r.event_type as RenewalAuditEntry["eventType"],
      reference: r.reference as string,
      method: (r.method as string) ?? null,
      amountPaid: Number(r.amount_paid ?? 0),
      invoiceNo: (r.invoice_no as string) ?? null,
      previousTermEnd: (r.previous_term_end as string) ?? null,
      newTermEnd: (r.new_term_end as string) ?? null,
      previousRenewedAt: (r.previous_renewed_at as string) ?? null,
      errorCode: (r.error_code as string) ?? null,
      errorMessage: (r.error_message as string) ?? null,
      metadata: (r.metadata as Record<string, any>) ?? {},
      createdAt: r.created_at as string,
    }));
  });
