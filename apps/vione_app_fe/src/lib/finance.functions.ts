import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

export type Transaction = {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  method: "bank" | "card" | "cash";
  status: "completed" | "pending";
};

type Row = Record<string, unknown>;

function mapTx(tx: Row): Transaction {
  return {
    id: tx.code as string,
    date: tx.date as string,
    type: tx.type as Transaction["type"],
    category: tx.category as string,
    description: (tx.description as string) ?? "",
    amount: Number(tx.amount ?? 0),
    method: tx.method as Transaction["method"],
    status: tx.status as Transaction["status"],
  };
}

export const listTransactionsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Transaction[]> => {
    const { data, error } = await getDb(context)
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => mapTx(r as Row));
  });

const txInput = z.object({
  date: z.string().min(1).max(40),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  amount: z.number().min(0).max(1e12).default(0),
  method: z.enum(["bank", "card", "cash"]),
  status: z.enum(["completed", "pending"]),
});

export const createTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => txInput.parse(d))
  .handler(async ({ data, context }): Promise<Transaction> => {
    const { genCode, logActivity } = await import("./crud.server");
    const code = genCode("TX");
    const { data: row, error } = await getDb(context)
      .from("transactions")
      .insert({ code, ...data })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(getDb(context), { action: "Tạo giao dịch", target: code, category: "fee" });
    return mapTx(row);
  });

export const updateTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => txInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Transaction> => {
    const { logActivity } = await import("./crud.server");
    const { id, ...rest } = data;
    const { data: row, error } = await getDb(context)
      .from("transactions")
      .update(rest)
      .eq("code", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(getDb(context), {
      action: "Cập nhật giao dịch",
      target: id,
      category: "fee",
    });
    return mapTx(row);
  });

export const deleteTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const { error } = await getDb(context).from("transactions").delete().eq("code", data.id);
    if (error) throw new Error(error.message);
    await logActivity(getDb(context), {
      action: "Xóa giao dịch",
      target: data.id,
      category: "fee",
    });
    return { ok: true };
  });
