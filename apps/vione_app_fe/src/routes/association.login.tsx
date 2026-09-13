import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import { classifyAuthError, type AuthErrorInfo } from "@/lib/business-connect/mobile/auth-error";

export const Route = createFileRoute("/association/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Đăng nhập — Hiệp hội Doanh nhân CEO 1983" }],
  }),
  component: AssociationLoginPage,
});

function AssociationLoginPage() {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [identifier, setIdentifier] = useState(""); // Email or Member Code
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      toast.error("Vui lòng nhập email / mã hội viên và mật khẩu");
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);

    try {
      // Direct Nest API login supporting email or member code
      const res = await fetchNestApi<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanId,
          password,
        }),
      });

      if (res?.access_token && res?.user) {
        setAuthData(res);
        toast.success(`Chào mừng hội viên ${res.user.user_metadata?.full_name || cleanId} trở lại!`);
        navigate({ to: "/association" as any, replace: true });
        return;
      }

      throw new Error("Không nhận được phiên đăng nhập hợp lệ.");
    } catch (err: any) {
      const info = classifyAuthError(err);
      setAuthErrorInfo(info);
      setAuthError(info.raw || err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#0B0F19] text-white selection:bg-[#F5E0A3] selection:text-black overflow-x-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/12 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-sky-400/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-sky-300/10 blur-[140px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/ceo1983-logo.png"
            alt="CEO 1983 Logo"
            className="h-9 w-auto object-contain drop-shadow-md"
          />
          <div>
            <p className="text-[13px] font-bold text-white tracking-wide">CEO 1983</p>
            <p className="text-[9px] font-medium text-sky-300 tracking-wider uppercase">Cổng Hội Viên</p>
          </div>
        </div>

        <Link
          to="/auth/mobile"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-white/20 transition-colors"
        >
          Sang Cổng ViOne
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative z-10 mx-auto w-full max-w-md px-5 py-8 my-auto">
        <div className="rounded-3xl border border-white/10 bg-[#121724]/90 p-7 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-inner mb-1">
              <img
                src="/ceo1983-logo.png"
                alt="CLB Doanh Nhân 1983"
                className="h-14 w-auto object-contain"
              />
            </div>
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">
              CLB Doanh Nhân CEO 1983
            </h1>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Không gian kết nối & giao thương độc quyền dành cho các nhà lãnh đạo và chủ doanh nghiệp
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-[12px] text-red-300 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {authErrorInfo?.kind === "credentials"
                    ? "Sai thông tin đăng nhập"
                    : authErrorInfo?.kind === "network"
                      ? "Lỗi kết nối mạng"
                      : "Lỗi đăng nhập"}
                </p>
                <p className="text-red-300/90 leading-snug">{authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Email hoặc Mã hội viên
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 focus-within:border-sky-400/80 focus-within:ring-1 focus-within:ring-sky-400/30 transition-all">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ví dụ: MEM-1983-001 hoặc email..."
                  required
                  className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-sky-300 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 focus-within:border-sky-400/80 focus-within:ring-1 focus-within:ring-sky-400/30 transition-all">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 py-3.5 text-[14px] font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập Cổng Hội Viên
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-2 border-t border-white/10 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Bạn chưa kích hoạt tài khoản hội viên?{" "}
              <Link to="/connect-app/activate" className="text-sky-300 font-semibold hover:underline">
                Kích hoạt ngay
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
              <Shield className="h-3 w-3 text-sky-400" />
              <span>Bảo mật cấp doanh nghiệp theo chuẩn Hiệp hội</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-[11px] text-slate-500">
        © 2026 Hiệp hội Doanh nhân CEO 1983. Mọi quyền được bảo lưu.
      </div>
    </div>
  );
}
