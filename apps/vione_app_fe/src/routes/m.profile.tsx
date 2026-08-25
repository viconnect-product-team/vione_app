import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  ChevronRight,
  BadgeCheck,
  User,
  Building2,
  Users,
  History,
  FileText,
  Package,
  Sparkles,
  Bell,
  Settings as Cog,
  LogOut,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, type MyMember } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/m/profile")({
  component: ProfileScreen,
});

function initials(name?: string) {
  if (!name) return "ViOne";
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ProfileScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);

  const menu = [
    { label: t("m.profile.menu_personal_info"), icon: User },
    { label: t("m.profile.menu_business_info"), icon: Building2 },
    { label: t("m.profile.menu_members"), icon: Users },
    { label: t("m.profile.menu_history"), icon: History },
    { label: t("m.profile.menu_posts"), icon: FileText },
    { label: t("m.profile.menu_products"), icon: Package },
    { label: t("m.profile.menu_opportunities"), icon: Sparkles },
    { label: t("m.profile.menu_notifications"), icon: Bell },
    { label: t("m.profile.menu_settings"), icon: Cog },
  ];

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="vba-animate">
      <MemberHeader
        title={t("m.profile.title")}
        back
        right={
          <button aria-label={t("m.profile.settings_label")} className="text-[var(--vba-gold)]">
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      {/* Identity */}
      <div className="flex items-center gap-3 px-4 pt-4">
        {member?.avatar ? (
          <img
            src={member.avatar}
            alt={member?.name ?? ""}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full vba-gold-grad text-[20px] font-bold text-[#1a1206]">
            {initials(member?.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[16px] font-bold text-[var(--vba-text)]">
              {member?.name ?? "..."}
            </span>
            {member?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--vba-gold)]" />}
          </div>
          <div className="truncate text-[12px] text-[var(--vba-text-muted)]">
            {member?.title || member?.industry || member?.email}
          </div>
          {member?.code && (
            <span className="mt-1 inline-block rounded-md border border-[var(--vba-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--vba-gold)]">
              {t("m.profile.member_code", { code: member.code })}
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="mt-5 px-4">
        <div className="vba-card divide-y divide-[var(--vba-border-soft)] overflow-hidden">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-card/[0.03]"
              >
                <Icon className="h-5 w-5 shrink-0 text-[var(--vba-gold)]" />
                <span className="flex-1 text-[13px] text-[var(--vba-text)]">{m.label}</span>
                <ChevronRight className="h-4 w-4 text-[var(--vba-text-dim)]" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        <Link
          to="/install"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--vba-border)] py-3 text-[13px] font-semibold text-[var(--vba-gold)]"
        >
          📲 {t("m.profile.install_app")}
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold text-[var(--vba-danger)]"
        >
          <LogOut className="h-4 w-4" /> {t("m.profile.logout")}
        </button>
      </div>
    </div>
  );
}
