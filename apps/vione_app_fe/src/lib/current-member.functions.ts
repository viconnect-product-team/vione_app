import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

export type LinkableMember = {
  id: string;
  code: string;
  name: string;
  email: string;
  associationId: string;
  associationName: string;
  alreadyLinked: boolean;
};

/** Members matching the signed-in account's email that can be linked. */
export const listLinkableMembersFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<LinkableMember[]> => {
    const supabase: any = null as any;
    const { data, error } = await supabase.rpc("list_my_linkable_members");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      code: r.code as string,
      name: r.name as string,
      email: r.email as string,
      associationId: r.association_id as string,
      associationName: r.association_name as string,
      alreadyLinked: Boolean(r.already_linked),
    }));
  });

/** Link the current account to a member profile (email must match). */
export const linkMyMemberProfileFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ memberId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<{ memberId: string }> => {
    const supabase: any = null as any;
    const { data: res, error } = await supabase.rpc("link_my_member_profile", {
      _member_id: data.memberId,
    });
    if (error) throw new Error(error.message);
    return { memberId: res as unknown as string };
  });

/** Unlink a member profile from the current account. */
export const unlinkMyMemberProfileFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ memberId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<void> => {
    const supabase: any = null as any;
    const { error } = await supabase.rpc("unlink_my_member_profile", {
      _member_id: data.memberId,
    });
    if (error) throw new Error(error.message);
  });
