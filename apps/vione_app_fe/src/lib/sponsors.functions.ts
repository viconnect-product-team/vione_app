import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type Sponsor = {
  id: string;
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  contact: string;
  email: string;
  phone: string;
  amount: number;
  events: number;
  since: string;
  status: "active" | "expired";
};

export type SponsorPackage = {
  id: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  price: number;
  benefits: string[];
  available: number;
  sold: number;
};

type Row = Record<string, unknown>;

function mapSponsor(r: Row): Sponsor {
  return {
    id: r.id as string,
    name: r.name as string,
    tier: r.tier as Sponsor["tier"],
    contact: (r.contact as string) ?? "",
    email: (r.email as string) ?? "",
    phone: (r.phone as string) ?? "",
    amount: Number(r.amount ?? 0),
    events: (r.events as number) ?? 0,
    since: r.since as string,
    status: r.status as Sponsor["status"],
  };
}

function mapPackage(r: Row): SponsorPackage {
  return {
    id: r.id as string,
    tier: r.tier as SponsorPackage["tier"],
    price: Number(r.price ?? 0),
    benefits: (r.benefits as string[]) ?? [],
    available: (r.available as number) ?? 0,
    sold: (r.sold as number) ?? 0,
  };
}

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

export const listSponsorsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (null as any)
      .from("sponsors")
      .select("*")
      .order("amount", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSponsor);
  });

export const listSponsorPackagesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (null as any).from("sponsor_packages").select("*");
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map(mapPackage)
      .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  });

const sponsorInput = z.object({
  name: z.string().min(1).max(200),
  tier: z.enum(["platinum", "gold", "silver", "bronze"]),
  contact: z.string().max(120).default(""),
  email: z.string().max(160).default(""),
  phone: z.string().max(40).default(""),
  amount: z.number().min(0).max(1e12).default(0),
  events: z.number().int().min(0).max(100000).default(0),
  since: z.string().min(1).max(40),
  status: z.enum(["active", "expired"]),
});

export const createSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => sponsorInput.parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    const { genCode, logActivity } = await import("./crud.server");
    const id = genCode("SP");
    const { data: row, error } = await (null as any)
      .from("sponsors")
      .insert({ id, ...data })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Tạo nhà tài trợ",
      target: data.name,
      category: "system",
    });
    return mapSponsor(row);
  });

export const updateSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => sponsorInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    const { logActivity } = await import("./crud.server");
    const { id, ...rest } = data;
    const { data: row, error } = await (null as any)
      .from("sponsors")
      .update(rest)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Cập nhật nhà tài trợ",
      target: data.name,
      category: "system",
    });
    return mapSponsor(row);
  });

export const deleteSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const found = await (null as any)
      .from("sponsors")
      .select("name")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await (null as any).from("sponsors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Xóa nhà tài trợ",
      target: (found.data?.name as string) ?? data.id,
      category: "system",
    });
    return { ok: true };
  });

// ---------------- Sponsor packages CRUD ----------------

const packageInput = z.object({
  tier: z.enum(["platinum", "gold", "silver", "bronze"]),
  price: z.number().min(0).max(1e12).default(0),
  benefits: z.array(z.string().min(1).max(200)).max(30).default([]),
  available: z.number().int().min(0).max(100000).default(0),
  sold: z.number().int().min(0).max(100000).default(0),
});

export const createSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => packageInput.parse(d))
  .handler(async ({ data, context }): Promise<SponsorPackage> => {
    const { genCode, logActivity } = await import("./crud.server");
    const id = genCode("PKG");
    const { data: row, error } = await (null as any)
      .from("sponsor_packages")
      .insert({ id, ...data })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Tạo gói tài trợ",
      target: data.tier,
      category: "system",
    });
    return mapPackage(row);
  });

export const updateSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => packageInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<SponsorPackage> => {
    const { logActivity } = await import("./crud.server");
    const { id, ...rest } = data;
    const { data: row, error } = await (null as any)
      .from("sponsor_packages")
      .update(rest)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Cập nhật gói tài trợ",
      target: data.tier,
      category: "system",
    });
    return mapPackage(row);
  });

export const deleteSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const { error } = await (null as any).from("sponsor_packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logActivity(null as any, {
      action: "Xóa gói tài trợ",
      target: data.id,
      category: "system",
    });
    return { ok: true };
  });

// ---------------- Sponsor onboarding ----------------

const onboardInput = z.object({
  packageId: z.string().min(1).max(128),
  name: z.string().min(1).max(200),
  contact: z.string().max(120).default(""),
  email: z.string().max(160).default(""),
  phone: z.string().max(40).default(""),
});

export const onboardSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => onboardInput.parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    const { genCode, logActivity } = await import("./crud.server");

    // Load selected package for tier + price
    const { data: pkg, error: pkgErr } = await (null as any)
      .from("sponsor_packages")
      .select("*")
      .eq("id", data.packageId)
      .maybeSingle();
    if (pkgErr) throw new Error(pkgErr.message);
    if (!pkg) throw new Error("PACKAGE_NOT_FOUND");
    const mappedPkg = mapPackage(pkg);
    if (mappedPkg.sold >= mappedPkg.available) throw new Error("PACKAGE_SOLD_OUT");

    // Create sponsor from package
    const id = genCode("SP");
    const today = new Date().toISOString().slice(0, 10);
    const { data: row, error } = await (null as any)
      .from("sponsors")
      .insert({
        id,
        name: data.name,
        tier: mappedPkg.tier,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        amount: mappedPkg.price,
        events: 0,
        since: today,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // Increment sold count on the package
    await (null as any)
      .from("sponsor_packages")
      .update({ sold: mappedPkg.sold + 1 })
      .eq("id", data.packageId);

    await logActivity(null as any, {
      action: "Onboard nhà tài trợ",
      target: data.name,
      category: "system",
    });
    return mapSponsor(row);
  });
