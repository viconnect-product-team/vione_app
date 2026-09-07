import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import authBg from "@/assets/connect-auth-bg.jpg";
import { ViOneLogo } from "./ViOneLogo";
import { LuxuryLangSwitcher } from "@/components/LuxuryLangSwitcher";

export type AppPortalType = "connect" | "association";

type Props = {
  email: string;
  password: string;
  loading: boolean;
  oauthPending?: "google" | "apple" | null;
  errorMessage?: string | null;
  errorHint?: string | null;
  onRetry?: (() => void) | null;
  secondaryLabel?: string | null;
  onSecondary?: (() => void) | null;
  onDismissError?: () => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onGoogle: () => void;
  onApple: () => void;
  onScanCard: () => void;
  remember?: boolean;
  onRememberChange?: (v: boolean) => void;
  appPortal?: AppPortalType;
  onAppPortalChange?: (portal: AppPortalType) => void;
};

const NAVY = "#050c15";
const GOLD = "#D8B282";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M16.36 12.72c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.44-3.7ZM14.1 5.1c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.28Z" />
    </svg>
  );
}

export function ConnectAppSignIn({
  email,
  password,
  loading,
  oauthPending = null,
  errorMessage = null,
  errorHint = null,
  onRetry = null,
  secondaryLabel = null,
  onSecondary = null,
  onDismissError,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogle,
  onApple,
  onScanCard,
  remember: rememberProp,
  onRememberChange,
  appPortal = "connect",
  onAppPortalChange,
}: Props) {
  const t = useT();
  const { lang, setLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLocal, setRememberLocal] = useState(true);
  const remember = rememberProp ?? rememberLocal;
  const toggleRemember = () => {
    const next = !remember;
    setRememberLocal(next);
    onRememberChange?.(next);
  };
  const busy = loading || oauthPending !== null;

  const fieldClass =
    "h-10 sm:h-11 w-full rounded-xl border border-[#D8B282]/25 bg-transparent pl-10 pr-10 text-[14px] text-[#f5f7fa] outline-none transition-colors placeholder:text-[#D4C3A3]/50 focus:border-[#D8B282] focus:ring-1 focus:ring-[#D8B282]/30";

  const isAssociation = appPortal === "association";

  return (
    <main
      className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none"
      style={{ background: NAVY, color: "#f5f7fa" }}
    >
      <img
        src={authBg}
        alt=""
        aria-hidden="true"
        width={1024}
        height={640}
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] w-full select-none object-cover opacity-65"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(130% 75% at 50% 30%, transparent 20%, ${NAVY} 90%)`,
        }}
      />

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #f5f7fa !important;
          transition: background-color 5000s ease-in-out 0s !important;
          caret-color: #f5f7fa !important;
        }

        @media (max-height: 700px) {
          .vba-auth-container {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          .vba-auth-header-title {
            font-size: 22px !important;
            margin-top: 4px !important;
          }
          .vba-auth-header-sub {
            font-size: 12px !important;
            margin-top: 2px !important;
          }
        }

        @media (max-height: 620px) {
          .vba-auth-wrapper {
            transform: scale(0.92);
            transform-origin: top center;
          }
        }
      `}</style>

      <div
        className="vba-auth-wrapper relative mx-auto flex h-full max-h-full w-full max-w-md flex-col justify-between px-5 py-2.5 sm:px-6 sm:py-4 overflow-hidden"
        style={{
          paddingTop: "max(8px, env(safe-area-inset-top))",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Top bar: App Selector & Language switcher */}
        <div className="flex items-center justify-between shrink-0">
          {/* App Switcher Tabs: ViOne Connect vs Hiệp hội */}
          <div className="flex items-center rounded-xl bg-black/40 border border-[#D8B282]/25 p-0.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => onAppPortalChange?.("connect")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer ${
                !isAssociation
                  ? "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#C29B69] text-[#050c15] shadow-xs"
                  : "text-[#D4C3A3] hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>ViOne Connect</span>
            </button>
            <button
              type="button"
              onClick={() => onAppPortalChange?.("association")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer ${
                isAssociation
                  ? "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#C29B69] text-[#050c15] shadow-xs"
                  : "text-[#D4C3A3] hover:text-white"
              }`}
            >
              <Building2 className="h-3 w-3" />
              <span>Hiệp hội</span>
            </button>
          </div>

          <LuxuryLangSwitcher />
        </div>

        {/* Brand & Welcome Header */}
        <div className="flex flex-col items-center justify-center text-center shrink-0 my-auto">
          <ViOneLogo className="h-8 sm:h-10 w-auto transition-transform hover:scale-105 duration-300" />
          <div className="mt-1 text-[9px] sm:text-[10px] font-medium tracking-[0.3em]" style={{ color: GOLD }}>
            {isAssociation ? "HIỆP HỘI DOANH NGHIỆP" : "BUSINESS CONNECT"}
          </div>
          <h1
            className="vba-auth-header-title mt-2 font-serif text-[24px] sm:text-[28px] font-light tracking-wide leading-tight bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(201,158,74,0.35)]"
          >
            {isAssociation ? "Cổng Hội viên Hiệp hội" : t("bc.mobile.auth.welcome")}
          </h1>
          <p
            className="vba-auth-header-sub mx-auto mt-1 max-w-[18rem] text-center text-[12.5px] sm:text-[13.5px] leading-tight font-light tracking-[0.02em]"
            style={{ color: "#D4C3A3" }}
          >
            {isAssociation
              ? "Thẻ hội viên số, quyền lợi & check-in sự kiện"
              : t("bc.mobile.auth.subtitle")}
          </p>
        </div>

        {/* Error */}
        {errorMessage ? (
          <div
            role="alert"
            aria-live="assertive"
            className="my-1.5 rounded-xl border px-3 py-2 text-[13px] leading-snug shrink-0"
            style={{ borderColor: "#5c2b2b", background: "#2a1414", color: "#ffd9d4" }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p>{errorMessage}</p>
                {errorHint ? <p className="mt-0.5 text-[11px] opacity-80">{errorHint}</p> : null}
              </div>
              {onDismissError ? (
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label={t("bc.mobile.auth.dismissError")}
                  className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-lg"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {onRetry || secondaryLabel ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={busy}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium disabled:opacity-60"
                    style={{ borderColor: "#8a4a4a", color: "#ffd9d4" }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("bc.mobile.auth.retry")}
                  </button>
                ) : null}
                {secondaryLabel && onSecondary ? (
                  <button
                    type="button"
                    onClick={onSecondary}
                    className="inline-flex h-8 items-center rounded-lg px-2 text-[12px] font-medium underline underline-offset-4"
                    style={{ color: "#ffd9d4" }}
                  >
                    {secondaryLabel}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Social - Side-by-side with Google & Apple for max vertical efficiency */}
        <div className="grid grid-cols-2 gap-2 shrink-0 my-1 sm:my-1.5">
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            aria-busy={oauthPending === "google"}
            className="flex h-10 sm:h-11 w-full items-center justify-center gap-2 rounded-xl border border-solid border-[#D8B282]/25 bg-white/[0.02] backdrop-blur-sm text-[13.5px] font-medium transition-all active:opacity-80 disabled:opacity-60 hover:bg-white/[0.08] hover:border-[#D8B282]/60 cursor-pointer"
            style={{ color: "#f5f7fa" }}
          >
            {oauthPending === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleMark />
            )}
            <span className="truncate">Google</span>
          </button>
          <button
            type="button"
            onClick={onApple}
            disabled={busy}
            aria-busy={oauthPending === "apple"}
            className="flex h-10 sm:h-11 w-full items-center justify-center gap-2 rounded-xl border border-solid border-[#D8B282]/25 bg-white/[0.02] backdrop-blur-sm text-[13.5px] font-medium transition-all active:opacity-80 disabled:opacity-60 hover:bg-white/[0.08] hover:border-[#D8B282]/60 cursor-pointer"
            style={{ color: "#f5f7fa" }}
          >
            {oauthPending === "apple" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <AppleMark />
            )}
            <span className="truncate">Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-1 sm:my-2 flex items-center gap-3 text-[12px] shrink-0" style={{ color: "#8fa0b1" }}>
          <span className="h-px flex-1" style={{ background: "rgba(216, 178, 130, 0.15)" }} />
          <span style={{ color: "#D4C3A3" }}>{t("bc.mobile.auth.or")}</span>
          <span className="h-px flex-1" style={{ background: "rgba(216, 178, 130, 0.15)" }} />
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-2 sm:space-y-2.5 shrink-0"
        >
          <div className="space-y-1">
            <label htmlFor="bc-auth-email" className="block text-[12.5px] sm:text-[13px] font-medium" style={{ color: "#D4C3A3" }}>
              {t("bc.mobile.auth.emailLabel")}
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#D4C3A3" }}
                aria-hidden="true"
              />
              <input
                id="bc-auth-email"
                type="text"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder={isAssociation ? "email-hoi-vien@domain.com" : t("bc.mobile.auth.emailPlaceholder")}
                className={fieldClass}
                style={{ color: "#f5f7fa" }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="bc-auth-password" className="block text-[12.5px] sm:text-[13px] font-medium" style={{ color: "#D4C3A3" }}>
              {t("bc.mobile.auth.passwordLabel")}
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#D4C3A3" }}
                aria-hidden="true"
              />
              <input
                id="bc-auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder={t("bc.mobile.auth.passwordPlaceholder")}
                className={fieldClass}
                style={{ color: "#f5f7fa" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t(
                  showPassword ? "bc.mobile.auth.hidePassword" : "bc.mobile.auth.showPassword",
                )}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg cursor-pointer"
                style={{ color: "#D4C3A3" }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={toggleRemember}
              className="flex items-center gap-2 text-[13px] sm:text-[14px] cursor-pointer"
              style={{ color: "#D4C3A3" }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-[5px] border text-[#050c15]"
                style={{
                  background: remember ? GOLD : "transparent",
                  borderColor: remember ? GOLD : "rgba(216, 178, 130, 0.25)",
                }}
                aria-hidden="true"
              >
                {remember ? (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              {t("bc.mobile.auth.remember")}
            </button>
            <Link
              to="/forgot-password"
              search={{ m: "1", email: email.trim() || undefined }}
              className="text-[13px] sm:text-[14px] font-medium"
              style={{ color: "#E2D3B3" }}
            >
              {t("bc.mobile.auth.forgot")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="relative flex h-10 sm:h-11 w-full items-center justify-center rounded-xl text-[15px] sm:text-[16px] font-semibold text-[#050c15] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md"
            style={{
              background: "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
              boxShadow: "0 -1px 0 0 #f6e6c4 inset, 0 6px 20px -4px rgba(201, 163, 91, 0.5)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#050c15]" /> {t("bc.mobile.auth.processing")}
              </span>
            ) : isAssociation ? (
              "Đăng nhập Cổng Hội viên"
            ) : (
              t("bc.mobile.auth.signIn")
            )}
            {!loading && <ArrowRight className="absolute right-4 h-4 w-4 text-[#050c15]" aria-hidden="true" />}
          </button>
        </form>

        {/* Sign up */}
        <div className="shrink-0 my-1 sm:my-1.5">
          <Link
            to="/register"
            search={{ email: email.trim() || undefined }}
            className="relative flex h-9.5 sm:h-10.5 w-full items-center justify-center gap-2 rounded-xl border text-[13.5px] sm:text-[14.5px] font-medium transition-all backdrop-blur-md hover:shadow-[0_0_12px_rgba(253,230,180,0.1)] cursor-pointer"
            style={{
              border: "1px solid transparent",
              backgroundImage: "linear-gradient(rgba(18,17,15,0.45), rgba(18,17,15,0.45)), linear-gradient(135deg, #AB6D3C 0%, #FDE6B4 100%)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              color: "#E2D3B3",
            }}
          >
            <Shield className="h-4 w-4" style={{ color: "#E2D3B3" }} aria-hidden="true" />
            {t("bc.mobile.auth.signup.createAccount")}
            <ChevronRight className="absolute right-4 h-4 w-4" style={{ color: "#E2D3B3" }} aria-hidden="true" />
          </Link>
        </div>

        {/* Scan NFC / QR */}
        <button
          type="button"
          onClick={onScanCard}
          className="flex w-full items-center justify-center gap-2.5 py-1 text-left shrink-0 cursor-pointer active:opacity-80"
        >
          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" style={{ color: "#E2D3B3" }} aria-hidden="true" />
          <span>
            <span className="block text-[13.5px] sm:text-[14.5px] font-semibold" style={{ color: "#E2D3B3" }}>{t("bc.mobile.auth.scanTitle")}</span>
            <span className="block text-[11.5px] sm:text-[12.5px] leading-tight" style={{ color: "#D4C3A3" }}>
              {t("bc.mobile.auth.scanSubtitle")}
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
