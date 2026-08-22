import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FeeRecord, ReminderEntry } from "./fees-data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapInvoice, mapReminder, type Row } from "./fees-calc";

export const listInvoicesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FeeRecord[]> => {
    const { data, error } = await context.supabase
      .from("invoices")
      .select("*, member:members(*)")
      .order("invoice_no", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapInvoice(r as Row));
  });

export const getInvoiceFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ invoice: FeeRecord; reminders: ReminderEntry[] } | null> => {
      const { data: row, error } = await context.supabase
        .from("invoices")
        .select("*, member:members(*)")
        .eq("id", data.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) return null;
      const { data: rem, error: rErr } = await context.supabase
        .from("invoice_reminders")
        .select("*")
        .eq("invoice_id", data.id)
        .order("sent_at", { ascending: false });
      if (rErr) throw new Error(rErr.message);
      return {
        invoice: mapInvoice(row as Row),
        reminders: (rem ?? []).map((x) => mapReminder(x as Row)),
      };
    },
  );

const methodSchema = z.enum(["bank", "card", "cash", "ewallet"]);

export const markInvoicePaidFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), method: methodSchema }).parse(d),
  )
  .handler(async ({ data, context }): Promise<FeeRecord | null> => {
    const { data: row, error } = await context.supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString().slice(0, 10),
        method: data.method,
      })
      .eq("id", data.id)
      .select("*, member:members(*)")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    await context.supabase
      .from("members")
      .update({ fee_paid: true })
      .eq("id", (row as Row).member_id as string);
    return mapInvoice(row as Row);
  });

export const updateInvoiceMethodFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), method: methodSchema }).parse(d),
  )
  .handler(async ({ data, context }): Promise<FeeRecord | null> => {
    const { data: row, error } = await context.supabase
      .from("invoices")
      .update({ method: data.method })
      .eq("id", data.id)
      .select("*, member:members(*)")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapInvoice(row as Row) : null;
  });

export const addReminderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        invoiceId: z.string().min(1).max(128),
        channel: z.enum(["email", "sms", "call", "zalo"]),
        by: z.string().min(1).max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ReminderEntry> => {
    const { data: row, error } = await context.supabase
      .from("invoice_reminders")
      .insert({
        invoice_id: data.invoiceId,
        channel: data.channel,
        by_name: data.by ?? "Bạn",
        note: "Nhắc thủ công",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapReminder(row as Row);
  });

export const createInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        memberId: z.string().min(1).max(128),
        year: z.number().int().min(2000).max(2100),
        amount: z.number().int().min(0),
        dueDate: z.string().min(1).max(32),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<FeeRecord> => {
    const id = `INV-${Date.now().toString(36).toUpperCase()}`;
    const invoiceNo = `HD-${data.year}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const { data: row, error } = await context.supabase
      .from("invoices")
      .insert({
        id,
        invoice_no: invoiceNo,
        member_id: data.memberId,
        year: data.year,
        amount: data.amount,
        due_date: data.dueDate,
        status: "unpaid",
      })
      .select("*, member:members(*)")
      .single();
    if (error) throw new Error(error.message);
    return mapInvoice(row as Row);
  });

export const deleteInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { error } = await context.supabase.from("invoices").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
