import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, ShieldCheck, Users, Briefcase, Save, RefreshCw } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { Card, PageHeader, Pill } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { baseLang, useLang, useT } from "@/lib/i18n";
import { useServerData } from "@/hooks/use-server-data";
import { listMembersFn, updateMemberRoleAndDeptFn } from "@/lib/members.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/permissions")({
  component: PlatformPermissionsPage,
});

type Access = "full" | "scoped" | "own" | "none";

type Row = {
  feature: { vi: string; en: string };
  platform_admin: Access;
  admin: Access;
  tong_thu_ky: Access;
  truong_ban_thanh_vien: Access;
  truong_ban_tai_chinh: Access;
  truong_ban_truyen_thong: Access;
  truong_ban_xuc_tien: Access;
  member: Access;
};

const ROWS: Row[] = [
  {
    feature: { vi: "Quản trị hệ thống & Cấu hình nền tảng", en: "Platform & system management" },
    platform_admin: "full",
    admin: "scoped",
    tong_thu_ky: "none",
    truong_ban_thanh_vien: "none",
    truong_ban_tai_chinh: "none",
    truong_ban_truyen_thong: "none",
    truong_ban_xuc_tien: "none",
    member: "none",
  },
  {
    feature: { vi: "Họp phòng ban & Lịch Zoom", en: "Department meetings & Zoom" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "full",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Quản lý hội viên & Phân ban", en: "Members & committee assignment" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "full",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Thu chi, Tạm ứng & Hóa đơn", en: "Finance, advances & invoices" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "full",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sự kiện, Điểm danh QR & Xếp chỗ VIP", en: "Events, check-in QR & VIP seating" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "full",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sàn cơ hội kinh doanh & Matching", en: "Opportunities marketplace & matching" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "full",
    member: "own",
  },
  {
    feature: { vi: "Biểu quyết & Bốc thăm trúng thưởng", en: "Voting & Lucky draw" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "full",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
];

const ROLE_OPTIONS = [
  { value: "platform_admin", label: "Platform Admin" },
  { value: "admin", label: "Quản trị (Admin)" },
  { value: "tong_thu_ky", label: "Tổng thư ký" },
  { value: "truong_ban_thanh_vien", label: "Trưởng ban thành viên" },
  { value: "truong_ban_tai_chinh", label: "Trưởng ban tài chính" },
  { value: "truong_ban_truyen_thong", label: "Trưởng ban truyền thông" },
  { value: "truong_ban_xuc_tien", label: "Trưởng ban xúc tiến" },
  { value: "member", label: "Hội viên" },
];

const DEPARTMENT_OPTIONS = [
  "Ban Điều Hành",
  "Ban Quản Trị",
  "Ban Thư ký",
  "Ban Thành viên",
  "Ban Tài chính",
  "Ban Truyền thông",
  "Ban Xúc tiến thương mại",
  "Hội viên VIONE",
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
    <td className="px-3 py-2.5 text-center">
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
        style={{ background: s.bg, color: s.fg }}
      >
        {access === "none" ? <Minus className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
        {label}
      </span>
    </td>
  );
}

function PlatformPermissionsPage() {
  const t = useT();
  const { lang } = useLang();
  const { isPlatformAdmin, loading } = useRole();

  const fetchMembers = useServerFn(listMembersFn);
  const { data: members, loading: loadingMembers, reload } = useServerData<any[]>(() => fetchMembers(), []);
  const updateRoleDept = useServerFn(updateMemberRoleAndDeptFn);

  const [edits, setEdits] = useState<Record<string, { role: string; department: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleRoleChange = (memberId: string, currentRole: string, currentDept: string, newRole: string) => {
    setEdits(prev => ({
      ...prev,
      [memberId]: {
        role: newRole,
        department: prev[memberId]?.department || currentDept || "Hội viên VIONE",
      }
    }));
  };

  const handleDeptChange = (memberId: string, currentRole: string, currentDept: string, newDept: string) => {
    setEdits(prev => ({
      ...prev,
      [memberId]: {
        role: prev[memberId]?.role || currentRole || "member",
        department: newDept,
      }
    }));
  };

  const handleSave = async (member: any) => {
    const edit = edits[member.id];
    const roleToSave = edit?.role || member.executiveRole || member.role || "member";
    const deptToSave = edit?.department || member.department || "Hội viên VIONE";

    try {
      setSavingId(member.id);
      await updateRoleDept({
        data: {
          memberId: member.id,
          executiveRole: roleToSave,
          department: deptToSave,
        }
      });
      toast.success(`Đã cập nhật phân quyền cho [${member.name}] thành công!`);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi cập nhật phân quyền.");
    } finally {
      setSavingId(null);
    }
  };

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
    { key: "full", label: "Toàn quyền" },
    { key: "scoped", label: "Theo ban ngành" },
    { key: "own", label: "Cá nhân / Riêng" },
    { key: "none", label: "Không có quyền" },
  ];

  return (
    <PlatformShell>
      <PageHeader
        title="Ma Trận Phân Quyền & Quản Lý Ban Ngành"
        subtitle="Thiết lập 8 cấp bậc phân quyền và gán tài khoản vào các ban chức năng của Hiệp hội"
      />

      {/* Section 1: Interactive Member Role & Department Assignment */}
      <Card className="mb-8 p-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Phân Quyền Thao Tác Trực Tiếp Cho Tài Khoản
            </h2>
          </div>
          <button
            type="button"
            onClick={() => reload()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới danh sách
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Hội viên / Doanh nghiệp</th>
                <th className="px-4 py-3 text-left">Email / Liên hệ</th>
                <th className="px-4 py-3 text-left">Chức danh / Vai trò Type</th>
                <th className="px-4 py-3 text-left">Phòng ban phụ trách</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingMembers ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : (members || []).map((m: any) => {
                const currentRole = edits[m.id]?.role ?? m.executiveRole ?? m.role ?? "member";
                const currentDept = edits[m.id]?.department ?? m.department ?? "Hội viên VIONE";
                const isChanged = edits[m.id] !== undefined;
                const isSaving = savingId === m.id;

                return (
                  <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-xs">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.code || m.id}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>{m.email || "—"}</div>
                      <div className="text-[11px]">{m.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(m.id, m.executiveRole, m.department, e.target.value)}
                        className="w-full text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1.5 focus:border-primary outline-none"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentDept}
                        onChange={(e) => handleDeptChange(m.id, m.executiveRole, m.department, e.target.value)}
                        className="w-full text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1.5 focus:border-primary outline-none"
                      >
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSave(m)}
                        disabled={isSaving || !isChanged}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isChanged
                            ? "bg-primary text-primary-foreground shadow-sm hover:brightness-110 cursor-pointer"
                            : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? "Đang lưu..." : "Lưu quyền"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Full 8-Role Permission Matrix */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">
          Ma Trận Chi Tiết Phân Quyền 8 Cấp Bậc
        </h3>
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <Card className="overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Chức năng hệ thống</th>
                <th className="px-3 py-3 text-center">Platform Admin</th>
                <th className="px-3 py-3 text-center">Quản trị</th>
                <th className="px-3 py-3 text-center">Tổng thư ký</th>
                <th className="px-3 py-3 text-center">TB Thành viên</th>
                <th className="px-3 py-3 text-center">TB Tài chính</th>
                <th className="px-3 py-3 text-center">TB T.Thông</th>
                <th className="px-3 py-3 text-center">TB Xúc tiến</th>
                <th className="px-3 py-3 text-center">Hội viên</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium text-foreground text-xs">
                    {r.feature[baseLang(lang)]}
                  </td>
                  <Cell access={r.platform_admin} label="Toàn quyền" />
                  <Cell access={r.admin} label="Quản trị" />
                  <Cell access={r.tong_thu_ky} label={legend.find((l) => l.key === r.tong_thu_ky)!.label} />
                  <Cell access={r.truong_ban_thanh_vien} label={legend.find((l) => l.key === r.truong_ban_thanh_vien)!.label} />
                  <Cell access={r.truong_ban_tai_chinh} label={legend.find((l) => l.key === r.truong_ban_tai_chinh)!.label} />
                  <Cell access={r.truong_ban_truyen_thong} label={legend.find((l) => l.key === r.truong_ban_truyen_thong)!.label} />
                  <Cell access={r.truong_ban_xuc_tien} label={legend.find((l) => l.key === r.truong_ban_xuc_tien)!.label} />
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
