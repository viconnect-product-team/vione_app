import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  QrCode,
  RefreshCw,
  Shield,
  User,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { LuxuryLangSwitcher } from "@/components/LuxuryLangSwitcher";

interface Props {
  identifier: string;
  password: string;
  loading?: boolean;
  errorMessage?: string | null;
  errorHint?: string | null;
  onRetry?: (() => void) | null;
  secondaryLabel?: string | null;
  onSecondary?: (() => void) | null;
  onDismissError?: () => void;
  onIdentifierChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: () => void;
  onScanCard?: () => void;
  remember?: boolean;
  onRememberChange?: (val: boolean) => void;
}

export function AssociationAppSignIn({
  identifier,
  password,
  loading = false,
  errorMessage = null,
  errorHint = null,
  onRetry = null,
  secondaryLabel = null,
  onSecondary = null,
  onDismissError,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
  onScanCard,
  remember: rememberProp,
  onRememberChange,
}: Props) {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLocal, setRememberLocal] = useState(true);
  const remember = rememberProp ?? rememberLocal;
  const toggleRemember = () => {
    const next = !remember;
    setRememberLocal(next);
    onRememberChange?.(next);
  };

  const fieldClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 shadow-xs";

  return (
    <main className="relative min-h-[100dvh] w-full overflow-y-auto flex flex-col justify-center select-none bg-slate-50 text-slate-900">
      {/* Dynamic Ambient Background with Soft Royal Blue Lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-36 -left-36 h-[500px] w-[500px] rounded-full bg-sky-400/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-36 h-[550px] w-[550px] rounded-full bg-blue-500/12 blur-[140px]" />
        <div className="absolute -bottom-36 left-1/3 h-[500px] w-[500px] rounded-full bg-sky-300/15 blur-[130px]" />
        {/* Subtle grid pattern for modern corporate identity */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(#0284C7 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Bulletproof Autofill CSS Reset for pure white inputs */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #0f172a !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: 0 0 0px 1000px #ffffff inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
          caret-color: #0284c7 !important;
        }
      `}</style>

      <div
        className="relative z-10 mx-auto flex min-h-[100dvh] md:min-h-0 w-full max-w-md flex-col justify-between md:justify-center md:gap-4 px-6 py-6 my-auto md:border md:border-sky-100 md:bg-white/95 md:backdrop-blur-2xl md:rounded-3xl md:p-8 md:shadow-[0_20px_60px_-15px_rgba(2,132,199,0.15),0_0_0_1px_rgba(186,230,253,0.4)]"
        style={{
          paddingTop: "max(16px, env(safe-area-inset-top))",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Top bar: CEO 1983 Badge & Language Switcher */}
        <div className="flex items-center justify-between shrink-0 pt-0.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11.5px] font-semibold text-sky-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Cổng Hội Viên CEO 1983</span>
          </div>
          <LuxuryLangSwitcher />
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center py-2 shrink-0">
          <div className="relative inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-sky-100 shadow-[0_8px_25px_rgba(2,132,199,0.12)] mb-2 transition-transform hover:scale-105 duration-300">
            <img
              src="/ceo1983-logo.png"
              alt="CLB Doanh Nhân CEO 1983"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
          <div className="text-[10.5px] font-extrabold tracking-[0.25em] text-sky-600 uppercase">
            CLB DOANH NHÂN CEO 1983
          </div>
          <h1 className="mt-1 font-serif text-[23px] sm:text-[25px] font-bold tracking-tight text-slate-900">
            Cổng Đăng Nhập Hội Viên
          </h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500 max-w-[20rem]">
            Không gian kết nối & giao thương độc quyền dành cho các nhà lãnh đạo và chủ doanh nghiệp
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="my-1 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-800 leading-snug shrink-0 shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">{errorMessage}</p>
                {errorHint && <p className="mt-0.5 text-[11px] text-red-700">{errorHint}</p>}
              </div>
              {onDismissError && (
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label="Đóng thông báo"
                  className="-mr-1 -mt-1 flex h-5 w-5 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            {(onRetry || (secondaryLabel && onSecondary)) && (
              <div className="mt-2 flex flex-wrap gap-2 pt-1 border-t border-red-200/60">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={loading}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 text-[11.5px] font-medium text-red-800 hover:bg-red-50 disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Thử lại
                  </button>
                )}
                {secondaryLabel && onSecondary && (
                  <button
                    type="button"
                    onClick={onSecondary}
                    className="inline-flex h-7 items-center rounded-lg px-2 text-[11.5px] font-medium text-red-800 underline underline-offset-4 hover:text-red-900 cursor-pointer"
                  >
                    {secondaryLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-3 shrink-0 my-1"
        >
          <div className="space-y-1">
            <label htmlFor="assoc-auth-id" className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">
              Email hoặc Mã hội viên
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600"
                aria-hidden="true"
              />
              <input
                id="assoc-auth-id"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => onIdentifierChange(e.target.value)}
                placeholder="Ví dụ: M1983-002 hoặc email..."
                className={fieldClass}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="assoc-auth-password" className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600"
                aria-hidden="true"
              />
              <input
                id="assoc-auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className={fieldClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={toggleRemember}
              className="flex items-center gap-2 text-[12.5px] cursor-pointer text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-all ${
                  remember
                    ? "bg-sky-600 border-sky-600 text-white"
                    : "bg-white border-slate-300"
                }`}
                aria-hidden="true"
              >
                {remember && (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="font-medium">Ghi nhớ đăng nhập</span>
            </button>
            <Link
              to="/forgot-password"
              className="text-[12.5px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button (Vibrant Royal Blue Gradient) */}
          <button
            type="submit"
            disabled={loading}
            className="relative flex h-11 w-full items-center justify-center rounded-xl text-[14.5px] font-bold text-white transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 mt-1.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Đang xác thực...
              </span>
            ) : (
              "Đăng nhập Cổng Hội Viên"
            )}
            {!loading && (
              <ArrowRight
                className="absolute right-4 h-4 w-4 text-white"
                aria-hidden="true"
              />
            )}
          </button>
        </form>

        {/* Member Activation Button */}
        <div className="shrink-0 my-0.5">
          <Link
            to="/connect-app/activate"
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-[13.5px] font-semibold text-sky-800 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <Shield className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>Kích hoạt tài khoản hội viên mới</span>
            <ChevronRight className="absolute right-4 h-4 w-4 text-sky-600" aria-hidden="true" />
          </Link>
        </div>

        {/* NFC / QR Smart Member Card Scan */}
        {onScanCard && (
          <button
            type="button"
            onClick={onScanCard}
            className="flex w-full items-center justify-center gap-2.5 py-2 px-3 rounded-xl border border-dashed border-sky-200/80 bg-white hover:bg-sky-50/50 transition-colors text-left shrink-0 cursor-pointer active:opacity-80 shadow-2xs"
          >
            <QrCode className="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
            <span>
              <span className="block text-[13px] font-bold text-sky-900">Chạm thẻ NFC hoặc Quét mã QR</span>
              <span className="block text-[11px] leading-tight text-slate-500">
                Đăng nhập nhanh 1 chạm bằng Thẻ Hội Viên Thông Minh
              </span>
            </span>
          </button>
        )}

        {/* Security & Copyright Footer */}
        <div className="text-center pt-2 pb-1 shrink-0 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="h-3.5 w-3.5 text-sky-500" />
            <span>Bảo mật cấp doanh nghiệp theo chuẩn Hiệp hội CEO 1983</span>
          </div>
          <div className="text-[10.5px] text-slate-400">
            © 2026 Hiệp hội Doanh nhân CEO 1983. Mọi quyền được bảo lưu.
          </div>
        </div>
      </div>
    </main>
  );
}
