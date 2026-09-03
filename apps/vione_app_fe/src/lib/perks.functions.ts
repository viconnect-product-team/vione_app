import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type AdminPerk = {
  id: string;
  title: string;
  category: string;
  partner: string;
  summary: string;
  description: string;
  discount: string;
  icon: string;
  link: string;
  validUntil: string;
  sortOrder: number;
  status: "active" | "inactive";
};

type Row = Record<string, unknown>;

function mapPerk(p: Row): AdminPerk {
  return {
    id: p.id as string,
    title: (p.title as string) ?? "",
    category: (p.category as string) ?? "",
    partner: (p.partner as string) ?? "",
    summary: (p.summary as string) ?? "",
    description: (p.description as string) ?? "",
    discount: (p.discount as string) ?? "",
    icon: (p.icon as string) ?? "Gift",
    link: (p.link as string) ?? "",
    validUntil: (p.valid_until as string) ?? "",
    sortOrder: (p.sort_order as number) ?? 0,
    status: (p.status as AdminPerk["status"]) ?? "active",
  };
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await (null as any).rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const listPerksAdminFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<AdminPerk[]> => {
    await assertAdmin(context);
    const { data, error } = await (null as any)
      .from("perks")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPerk);
  });

const perkInput = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).default(""),
  partner: z.string().trim().max(150).default(""),
  summary: z.string().trim().max(500).default(""),
  description: z.string().trim().max(4000).default(""),
  discount: z.string().trim().max(80).default(""),
  icon: z.string().trim().max(40).default("Gift"),
  link: z.string().trim().max(500).default(""),
  validUntil: z.string().trim().max(40).default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

function toRow(d: z.infer<typeof perkInput>) {
  return {
    title: d.title,
    category: d.category,
    partner: d.partner,
    summary: d.summary,
    description: d.description,
    discount: d.discount,
    icon: d.icon,
    link: d.link,
    valid_until: d.validUntil || null,
    sort_order: d.sortOrder,
    status: d.status,
  };
}

export const createPerkFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => perkInput.parse(d))
  .handler(async ({ data, context }): Promise<AdminPerk> => {
    await assertAdmin(context);
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await (null as any)
      .from("perks")
      .insert(toRow(data))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Tạo tiện ích",
      target: data.title,
      category: "system",
    });
    return mapPerk(row);
  });

export const updatePerkFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => perkInput.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<AdminPerk> => {
    await assertAdmin(context);
    const { logActivity } = await import("./crud.server");
    const { data: row, error } = await (null as any)
      .from("perks")
      .update(toRow(data))
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Cập nhật tiện ích",
      target: data.title,
      category: "system",
    });
    return mapPerk(row);
  });

export const deletePerkFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await assertAdmin(context);
    const { logActivity } = await import("./crud.server");
    const found = await (null as any)
      .from("perks")
      .select("title")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await (null as any).from("perks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Xóa tiện ích",
      target: (found.data?.title as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });
