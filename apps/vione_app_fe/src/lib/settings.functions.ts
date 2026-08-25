import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type VotingOpenPref = "same" | "new";

export type AppSettings = {
  orgName: string;
  orgEmail: string;
  lang: "vi" | "en";
  emailNotif: boolean;
  smsNotif: boolean;
  twoFa: boolean;
};

const DEFAULTS: AppSettings = {
  orgName: "Hiệp hội Doanh nghiệp Việt Nam",
  orgEmail: "contact@vba.vn",
  lang: "vi",
  emailNotif: true,
  smsNotif: false,
  twoFa: true,
};

export const getVotingOpenPrefFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_settings")
      .select("voting_open_pref")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return { pref: (data?.voting_open_pref ?? null) as VotingOpenPref | null };
  });

export const setVotingOpenPrefFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ pref: z.enum(["same", "new"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, voting_open_pref: data.pref }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });

export const clearVotingOpenPrefFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, voting_open_pref: null }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });

export const getSettingsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AppSettings> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_settings")
      .select("org_name, org_email, lang, email_notif, sms_notif, two_fa")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    const r = data as Record<string, unknown> | null;
    return {
      orgName: (r?.org_name as string) ?? DEFAULTS.orgName,
      orgEmail: (r?.org_email as string) ?? DEFAULTS.orgEmail,
      lang: ((r?.lang as string) ?? DEFAULTS.lang) as "vi" | "en",
      emailNotif: r?.email_notif == null ? DEFAULTS.emailNotif : Boolean(r.email_notif),
      smsNotif: r?.sms_notif == null ? DEFAULTS.smsNotif : Boolean(r.sms_notif),
      twoFa: r?.two_fa == null ? DEFAULTS.twoFa : Boolean(r.two_fa),
    };
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        orgName: z.string().max(200),
        orgEmail: z.string().max(200),
        lang: z.enum(["vi", "en"]),
        emailNotif: z.boolean(),
        smsNotif: z.boolean(),
        twoFa: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        org_name: data.orgName,
        org_email: data.orgEmail,
        lang: data.lang,
        email_notif: data.emailNotif,
        sms_notif: data.smsNotif,
        two_fa: data.twoFa,
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
    return { ok: true };
  });
