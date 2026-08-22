import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Member directory ----------
export type DirectoryMember = {
  code: string;
  name: string;
  industry: string;
  region: string;
  type: "company" | "individual";
  verified: boolean;
};

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DirectoryMember[]> => {
    const { data } = await context.supabase
      .from("members")
      .select("code, name, industry, region, type, status")
      .eq("status", "active")
      .order("name", { ascending: true });
    return (data ?? []).map((m) => ({
      code: m.code,
      name: m.name,
      industry: m.industry ?? "",
      region: m.region ?? "",
      type: m.type === "individual" ? "individual" : "company",
      verified: m.status === "active",
    }));
  });
