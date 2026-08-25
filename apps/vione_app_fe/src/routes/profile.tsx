import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { supabase } from "@/integrations/supabase/client";
import { useT, type TKey } from "@/lib/i18n";
import { AvatarUploadField } from "@/components/business-connect/mobile/me/AvatarUploadField";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ cá nhân — ViOne" }] }),
  component: ProfilePage,
});

type Form = {
  full_name: string;
  phone: string;
  title: string;
  location: string;
  bio: string;
  avatar_url: string;
};

const FIELDS: { key: keyof Form; labelKey: TKey; type?: "textarea" }[] = [
  { key: "full_name", labelKey: "profile.fullName" },
  { key: "phone", labelKey: "profile.phone" },
  { key: "title", labelKey: "profile.titleField" },
  { key: "location", labelKey: "profile.location" },
  { key: "bio", labelKey: "profile.bio", type: "textarea" },
];

function ProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<Form>({
    full_name: "",
    phone: "",
    title: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, phone, title, location, bio")
        .eq("id", data.user.id)
        .maybeSingle();
      if (active) {
        const p = (prof ?? {}) as Partial<Form>;
        setForm({
          full_name: p.full_name ?? (data.user.user_metadata?.full_name as string) ?? "",
          phone: p.phone ?? "",
          title: p.title ?? "",
          location: p.location ?? "",
          bio: p.bio ?? "",
          avatar_url: (data.user.user_metadata?.avatar_url as string) ?? "",
        });
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    // Save avatar_url into user_metadata (profiles table has no avatar column)
    const avatarMeta = form.avatar_url.trim();
    const [profileResult, metaResult] = await Promise.all([
      supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          title: form.title.trim() || null,
          location: form.location.trim() || null,
          bio: form.bio.trim() || null,
        },
        { onConflict: "id" },
      ),
      supabase.auth.updateUser({
        data: { avatar_url: avatarMeta || null },
      }),
    ]);
    setSaving(false);
    const error = profileResult.error ?? metaResult.error;
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("profile.saved"));
  }

  return (
    <AppShell>
      <PageHeader
        title={t("profile.page.title")}
        subtitle={t("profile.page.subtitle")}
        actions={
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("profile.back")}
          </button>
        }
      />

      <Card className="max-w-2xl p-5">
        <h2 className="text-base font-semibold text-foreground">{t("profile.section.basic")}</h2>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">{t("profile.loading")}</div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Avatar upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("profile.avatar")}
              </label>
              <AvatarUploadField
                value={form.avatar_url}
                onChange={(url) => set("avatar_url", url)}
                disabled={saving}
              />
            </div>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t(f.labelKey)}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:border-ring focus:outline-none"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {t("profile.email")}
              </label>
              <input
                value={email}
                disabled
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("profile.emailHint")}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
