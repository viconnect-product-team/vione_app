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
  Mail,
  QrCode,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import authBg from "@/assets/connect-auth-bg.jpg";

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
};

const NAVY = "#050c15";
const GOLD = "#f2b45a";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#0d0d0d" aria-hidden="true">
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
    "h-12 w-full rounded-xl border bg-transparent pl-11 pr-11 text-[15px] outline-none transition-colors placeholder:opacity-60 focus-visible:ring-1";

  return (
    <main
      className="relative min-h-[100dvh] w-full overflow-hidden"
      style={{ background: NAVY, color: "#f5f7fa" }}
    >
      <img
        src={authBg}
        alt=""
        aria-hidden="true"
        width={1024}
        height={640}
        className="pointer-events-none absolute inset-x-0 top-[92px] h-[240px] w-full select-none object-cover opacity-70"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 60% at 50% 24%, transparent, ${NAVY} 72%)`,
        }}
      />

      <div
        className="relative mx-auto flex w-full max-w-md flex-col px-6 pb-6"
        style={{ paddingTop: "calc(var(--bc-mobile-safe-top, 0px) + 12px)" }}
      >
        {/* Language switch — keeps the whole flow in the chosen language */}
        <div className="mb-1 flex justify-end">
          <div
            role="group"
            aria-label={t("bc.mobile.auth.language")}
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {(["vi", "en", "lo", "km", "my"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className="h-8 rounded-full px-3 text-[12px] font-semibold uppercase tracking-wide"
                style={lang === code ? { background: GOLD, color: NAVY } : { color: "#a9b6c4" }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <div
            className="text-[28px] font-semibold leading-none tracking-[0.18em]"
            style={{ color: GOLD }}
          >
            VI<span aria-hidden="true">✷</span>NE
          </div>
          <div className="mt-1.5 text-[11px] font-medium tracking-[0.32em]" style={{ color: GOLD }}>
            BUSINESS CONNECT
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-center font-serif text-[28px] font-semibold leading-tight">
          {t("bc.mobile.auth.welcome")}
        </h1>
        <p
          className="mx-auto mt-2 max-w-[19rem] text-center text-[14px] leading-snug"
          style={{ color: "#a9b6c4" }}
        >
          {t("bc.mobile.auth.subtitle")}
        </p>

        {/* Error */}
        {errorMessage ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-xl border px-4 py-3 text-[14px] leading-relaxed"
            style={{ borderColor: "#5c2b2b", background: "#2a1414", color: "#ffd9d4" }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p>{errorMessage}</p>
                {errorHint ? <p className="mt-1 text-[13px] opacity-80">{errorHint}</p> : null}
              </div>
              {onDismissError ? (
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label={t("bc.mobile.auth.dismissError")}
                  className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {onRetry || secondaryLabel ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={busy}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium disabled:opacity-60"
                    style={{ borderColor: "#8a4a4a", color: "#ffd9d4" }}
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    {t("bc.mobile.auth.retry")}
                  </button>
                ) : null}
                {secondaryLabel && onSecondary ? (
                  <button
                    type="button"
                    onClick={onSecondary}
                    className="inline-flex h-10 items-center rounded-lg px-3 text-[14px] font-medium underline underline-offset-4"
                    style={{ color: "#ffd9d4" }}
                  >
                    {secondaryLabel}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Social */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            aria-busy={oauthPending === "google"}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#f5f7fa] text-[16px] font-semibold text-[#101828] transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {oauthPending === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleMark />
            )}
            {oauthPending === "google"
              ? t("bc.mobile.auth.connecting")
              : t("bc.mobile.auth.google")}
          </button>
          <button
            type="button"
            onClick={onApple}
            disabled={busy}
            aria-busy={oauthPending === "apple"}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#f5f7fa] text-[16px] font-semibold text-[#101828] transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {oauthPending === "apple" ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <AppleMark />
            )}
            {oauthPending === "apple" ? t("bc.mobile.auth.connecting") : t("bc.mobile.auth.apple")}
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-4 text-[13px]" style={{ color: "#8fa0b1" }}>
          <span className="h-px flex-1" style={{ background: "#1d3448" }} />
          {t("bc.mobile.auth.or")}
          <span className="h-px flex-1" style={{ background: "#1d3448" }} />
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-3.5"
        >
          <div className="space-y-1.5">
            <label htmlFor="bc-auth-email" className="block text-[14px] font-medium">
              {t("bc.mobile.auth.emailLabel")}
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                style={{ color: "#8fa0b1" }}
                aria-hidden="true"
              />
              <input
                id="bc-auth-email"
                type="text"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder={t("bc.mobile.auth.emailPlaceholder")}
                className={fieldClass}
                style={{ borderColor: "#1d3448", color: "#f5f7fa" }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bc-auth-password" className="block text-[14px] font-medium">
              {t("bc.mobile.auth.passwordLabel")}
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                style={{ color: "#8fa0b1" }}
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
                style={{ borderColor: "#1d3448", color: "#f5f7fa" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t(
                  showPassword ? "bc.mobile.auth.hidePassword" : "bc.mobile.auth.showPassword",
                )}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg"
                style={{ color: "#c3ceda" }}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={toggleRemember}
              className="flex items-center gap-3 text-[15px]"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-[6px] border text-[#050c15]"
                style={{
                  background: remember ? GOLD : "transparent",
                  borderColor: remember ? GOLD : "#3a4a5b",
                }}
                aria-hidden="true"
              >
                {remember ? (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
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
              className="text-[15px] font-medium"
              style={{ color: GOLD }}
            >
              {t("bc.mobile.auth.forgot")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bc-cta-gold relative flex h-12 w-full items-center justify-center rounded-xl text-[17px] font-semibold"
          >
            {loading ? t("bc.mobile.auth.processing") : t("bc.mobile.auth.signIn")}
            {!loading && <ArrowRight className="absolute right-6 h-5 w-5" aria-hidden="true" />}
          </button>
        </form>

        {/* Sign up */}
        <div className="my-4 flex items-center gap-4 text-[14px]" style={{ color: "#8fa0b1" }}>
          <span className="h-px flex-1" style={{ background: "#1d3448" }} />
          {t("bc.mobile.auth.noAccount")}
          <span className="h-px flex-1" style={{ background: "#1d3448" }} />
        </div>

        <Link
          to="/register"
          search={{ email: email.trim() || undefined }}
          className="relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-[16px] font-semibold"
          style={{ borderColor: GOLD, color: GOLD }}
        >
          <Shield className="h-5 w-5" aria-hidden="true" />
          {t("bc.mobile.auth.signup.createAccount")}
          <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
        </Link>

        {/* Scan */}
        <button
          type="button"
          onClick={onScanCard}
          className="mt-5 flex w-full items-center justify-center gap-3 text-left"
        >
          <QrCode className="h-7 w-7 shrink-0" style={{ color: "#e4e9ee" }} aria-hidden="true" />
          <span>
            <span className="block text-[16px] font-semibold">{t("bc.mobile.auth.scanTitle")}</span>
            <span className="block text-[14px]" style={{ color: "#8fa0b1" }}>
              {t("bc.mobile.auth.scanSubtitle")}
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
