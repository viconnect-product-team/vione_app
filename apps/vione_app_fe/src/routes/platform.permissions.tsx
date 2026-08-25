import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { baseLang, useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/platform/permissions")({
  component: PlatformPermissionsPage,
});

type Access = "full" | "scoped" | "own" | "none";

type Row = {
  feature: { vi: string; en: string };
  platform_admin: Access;
  admin: Access;
  member: Access;
};

// Quick-reference access matrix. Mirrors the RLS policies enforced in the DB.
const ROWS: Row[] = [
  {
    feature: { vi: "Quản lý hiệp hội", en: "Manage associations" },
    platform_admin: "full",
    admin: "none",
    member: "none",
  },
  {
    feature: { vi: "Chỉ định quản trị viên hiệp hội", en: "Assign association admins" },
    platform_admin: "full",
    admin: "none",
    member: "none",
  },
  {
    feature: { vi: "Cài đặt & logo hiệp hội", en: "Association settings & logo" },
    platform_admin: "full",
    admin: "scoped",
    member: "none",
  },
  {
    feature: { vi: "Hội viên", en: "Members" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sự kiện & đăng ký", en: "Events & registrations" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Tài chính & hoá đơn", en: "Finance & invoices" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Nhà tài trợ", en: "Sponsors" },
    platform_admin: "full",
    admin: "scoped",
    member: "none",
  },
  {
    feature: { vi: "Truyền thông & email", en: "Communication & email" },
    platform_admin: "full",
    admin: "scoped",
    member: "none",
  },
  {
    feature: { vi: "Tin tức & tài liệu", en: "News & documents" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Biểu quyết & quản trị", en: "Voting & governance" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sàn cơ hội & sản phẩm", en: "Marketplace & opportunities" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Thẻ hội viên & check-in", en: "Member card & check-in" },
    platform_admin: "full",
    admin: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Hồ sơ cá nhân", en: "Personal profile" },
    platform_admin: "full",
    admin: "own",
    member: "own",
  },
];

const TONE: Record<Access, { bg: string; fg: string }> = {
  full: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.40 0.16 155)" },
  scoped: { bg: "oklch(0.94 0.05 220)", fg: "oklch(0.42 0.15 220)" },
  own: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.45 0.14 65)" },
  none: { bg: "oklch(0.94 0.01 250)", fg: "oklch(0.55 0.02 250)" },
};

function Cell({ access, label }: { access: Access; label: string }) {
  const s = TONE[access];
  return (
    <td className="px-4 py-3 text-center">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: s.bg, color: s.fg }}
      >
        {access === "none" ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        {label}
      </span>
    </td>
  );
}

function PlatformPermissionsPage() {
  const t = useT();
  const { lang } = useLang();
  const { isPlatformAdmin, loading } = useRole();

  if (!loading && !isPlatformAdmin) {
    return (
      <PlatformShell>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          {t("platform.forbidden")}
        </Card>
      </PlatformShell>
    );
  }

  const legend: { key: Access; label: string }[] = [
    { key: "full", label: t("perm.legend.full") },
    { key: "scoped", label: t("perm.legend.scoped") },
    { key: "own", label: t("perm.legend.own") },
    { key: "none", label: t("perm.legend.none") },
  ];

  return (
    <PlatformShell>
      <PageHeader title={t("perm.title")} subtitle={t("perm.subtitle")} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {legend.map((l) => {
          const s = TONE[l.key];
          return (
            <span
              key={l.key}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: s.bg, color: s.fg }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
              {l.label}
            </span>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">{t("perm.col.feature")}</th>
                <th className="px-4 py-3 text-center">{t("perm.role.platform_admin")}</th>
                <th className="px-4 py-3 text-center">{t("perm.role.admin")}</th>
                <th className="px-4 py-3 text-center">{t("perm.role.member")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium text-foreground">{r.feature[baseLang(lang)]}</td>
                  <Cell
                    access={r.platform_admin}
                    label={legend.find((l) => l.key === r.platform_admin)!.label}
                  />
                  <Cell access={r.admin} label={legend.find((l) => l.key === r.admin)!.label} />
                  <Cell access={r.member} label={legend.find((l) => l.key === r.member)!.label} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PlatformShell>
  );
}
