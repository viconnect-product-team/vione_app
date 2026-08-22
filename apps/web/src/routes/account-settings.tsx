import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { supabase } from "@/integrations/supabase/client";
import { useT, type TKey } from "@/lib/i18n";
import {
  getVotingOpenPrefFn,
  setVotingOpenPrefFn,
  clearVotingOpenPrefFn,
  type VotingOpenPref,
} from "@/lib/settings.functions";

export const Route = createFileRoute("/account-settings")({
  head: () => ({ meta: [{ title: "Cài đặt tài khoản — ViOne" }] }),
  component: AccountSettingsPage,
});

type Choice = VotingOpenPref | "ask";

const OPTIONS: { value: Choice; labelKey: TKey; descKey: TKey }[] = [
  { value: "ask", labelKey: "acct.openBehavior.ask", descKey: "acct.openBehavior.askDesc" },
  { value: "new", labelKey: "acct.openBehavior.new", descKey: "acct.openBehavior.newDesc" },
  { value: "same", labelKey: "acct.openBehavior.same", descKey: "acct.openBehavior.sameDesc" },
];

function AccountSettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [choice, setChoice] = useState<Choice>("ask");

  const loadPref = useServerFn(getVotingOpenPrefFn);
  const savePref = useServerFn(setVotingOpenPrefFn);
  const clearPref = useServerFn(clearVotingOpenPrefFn);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(data.user.email ?? null);
      try {
        const res = await loadPref({});
        if (active) setChoice(res.pref ?? "ask");
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [navigate, loadPref]);

  async function update(next: Choice) {
    const prev = choice;
    setChoice(next);
    setSaving(true);
    try {
      if (next === "ask") await clearPref({});
      else await savePref({ data: { pref: next } });
      toast.success(t("acct.toast.saved"));
    } catch {
      setChoice(prev);
      toast.error(t("acct.toast.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={t("acct.title")}
        subtitle={email ? t("acct.signedInAs", { email }) : t("acct.subtitle")}
        actions={
          <button
            onClick={() => navigate({ to: "/voting", search: { tab: "all", page: 1, size: 10 } })}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("acct.back")}
          </button>
        }
      />

      <Card className="p-5">
        <h2 className="text-base font-semibold text-foreground">{t("acct.openBehavior.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("acct.openBehavior.desc")}</p>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">{t("acct.loading")}</div>
        ) : (
          <div className="mt-4 space-y-2">
            {OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  choice === o.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  name="openPref"
                  checked={choice === o.value}
                  disabled={saving}
                  onChange={() => update(o.value)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{t(o.labelKey)}</div>
                  <div className="text-xs text-muted-foreground">{t(o.descKey)}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
