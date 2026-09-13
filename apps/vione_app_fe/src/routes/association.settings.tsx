import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  User,
  Camera,
  Lock,
  Bell,
  Sun,
  Moon,
  Contrast,
  LogOut,
  ShieldCheck,
  Check,
  Loader2,
  ChevronLeft,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, type MyMember } from "@/lib/member-app.functions";
import { useTheme, type Theme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/association/settings")({
  ssr: false,
  component: AssociationSettingsScreen,
});

function AssociationSettingsScreen() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const { theme, setTheme } = useTheme();
  const fetchMember = useServerFn(getMyMember);
  const { data: member, reload } = useServerData<MyMember | null>(() => fetchMember(), null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp định dạng hình ảnh (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload directly to NestJS MinIO endpoint
      const token = localStorage.getItem("vibe_token");
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Tải lên ảnh thất bại");
      }

      const json = await res.json();
      const uploadedUrl = json.url;

      toast.success("Cập nhật ảnh đại diện thành công!");
      reload();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật ảnh đại diện.");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordLoading(true);
    try {
      await fetchNestApi("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  };

  const currentAvatar = avatarPreview || resolveMediaUrl(member?.avatar) || "/ceo1983-logo.png";

  return (
    <div className="vba-animate pb-28 min-h-screen bg-[var(--vba-bg)] text-[var(--vba-text)]">
      <MemberHeader
        title="Cài đặt Hiệp Hội"
        subtitle="Hiệp hội Doanh nhân CEO 1983"
        back
      />

      <div className="mx-4 mt-4 space-y-4">
        {/* CEO 1983 Association Badge Header */}
        <div className="p-4 rounded-2xl vba-card border border-[var(--vba-gold)]/30 bg-gradient-to-br from-[#131A29] via-[#0E1522] to-[#0A0E18] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-300">
              <img src="/ceo1983-logo.png" alt="CEO 1983" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                CLB DOANH NHÂN 1983
              </div>
              <h2 className="text-[16px] font-black text-white leading-snug truncate">
                {member?.name || "Hội viên Doanh nhân"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="h-3 w-3" /> {member?.code || "M1983-MEMBER"}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {member?.title || "Hội viên chính thức"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Update Profile Avatar Section (MinIO) */}
        <section className="p-4 rounded-2xl vba-card border border-[var(--vba-border)] shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--vba-text-dim)] flex items-center gap-1.5 mb-3">
            <User className="h-3.5 w-3.5 text-[var(--vba-gold)]" /> Ảnh đại diện hội viên
          </h3>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--vba-gold)] shadow-md bg-slate-900"
                onError={(e) => {
                  e.currentTarget.src = "/ceo1983-logo.png";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--vba-gold)]/60 bg-[var(--vba-gold-soft)] px-3.5 py-2 text-xs font-bold text-[var(--vba-gold)] hover:bg-[var(--vba-gold)] hover:text-slate-950 transition-all cursor-pointer shadow-xs"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang lưu MinIO...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" />
                    <span>Tải ảnh đại diện mới</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[var(--vba-text-dim)] mt-1.5 leading-snug">
                Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh được lưu trữ an toàn trên MinIO.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Theme Preferences */}
        <section className="p-4 rounded-2xl vba-card border border-[var(--vba-border)] shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--vba-text-dim)] flex items-center gap-1.5 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[var(--vba-gold)]" /> Giao diện hiển thị
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: "light" as Theme, icon: Sun, label: "Sáng" },
              { mode: "dark" as Theme, icon: Moon, label: "Tối" },
              { mode: "contrast" as Theme, icon: Contrast, label: "Tương phản" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  theme === mode
                    ? "border-[var(--vba-gold)] bg-[var(--vba-gold-soft)] text-[var(--vba-gold)] shadow-xs font-bold"
                    : "border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] text-[var(--vba-text-muted)] hover:text-[var(--vba-text)]"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[12px]">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Change Password */}
        <section className="p-4 rounded-2xl vba-card border border-[var(--vba-border)] shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--vba-text-dim)] flex items-center gap-1.5 mb-3">
            <Lock className="h-3.5 w-3.5 text-[var(--vba-gold)]" /> Đổi mật khẩu
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-[var(--vba-text-muted)] block mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--vba-border)] bg-[var(--vba-surface)] px-3 py-2 text-xs text-[var(--vba-text)] outline-none focus:border-[var(--vba-gold)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--vba-text-muted)] block mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full rounded-xl border border-[var(--vba-border)] bg-[var(--vba-surface)] px-3 py-2 text-xs text-[var(--vba-text)] outline-none focus:border-[var(--vba-gold)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--vba-text-muted)] block mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-[var(--vba-border)] bg-[var(--vba-surface)] px-3 py-2 text-xs text-[var(--vba-text)] outline-none focus:border-[var(--vba-gold)]"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/60 bg-[#141416] dark:bg-[#0A0A0C] py-2.5 text-xs font-bold text-[#F5E0A3] hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] transition-all cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5E0A3]" />
              ) : (
                <KeyRound className="h-3.5 w-3.5 text-[#F5E0A3]" />
              )}
              <span>Cập nhật mật khẩu</span>
            </button>
          </form>
        </section>

        {/* 4. Notification Settings */}
        <section className="p-4 rounded-2xl vba-card border border-[var(--vba-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-[var(--vba-gold)]" />
              <div>
                <div className="text-[13px] font-bold text-[var(--vba-text)]">
                  Thông báo nợ phí & Cuộc họp
                </div>
                <div className="text-[11px] text-[var(--vba-text-muted)]">
                  Nhận tin nhắn kèm mã VietQR và lịch họp trực tiếp
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifEnabled}
              onChange={(e) => {
                setNotifEnabled(e.target.checked);
                toast.success(e.target.checked ? "Đã bật thông báo" : "Đã tắt thông báo");
              }}
              className="h-5 w-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </section>

        {/* 5. Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất khỏi App Hiệp Hội</span>
        </button>
      </div>
    </div>
  );
}
