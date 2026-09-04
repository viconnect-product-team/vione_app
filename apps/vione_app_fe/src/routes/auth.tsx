import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostLoginRouteFn } from "@/lib/landing-route.functions";
import { useT } from "@/lib/i18n";
import { LuxuryLangSwitcher } from "@/components/LuxuryLangSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  QrCode,
  Shield,
  X,
} from "lucide-react";
import { ViOneLogo } from "@/components/business-connect/mobile/ViOneLogo";
import { ConnectAppSignIn } from "@/components/business-connect/mobile/ConnectAppSignIn";
import { AuthCardScanSheet } from "@/components/business-connect/mobile/AuthCardScanSheet";
import { rememberScannedCard } from "@/lib/business-connect/mobile/auth-scan";
import { classifyAuthError, type AuthErrorInfo } from "@/lib/business-connect/mobile/auth-error";
import {
  applyRememberPreference,
  getRememberPreference,
  getRememberedEmail,
} from "@/lib/business-connect/mobile/auth-session";
import {
  hasRememberedVioneAppContext,
  isVioneStandaloneContext,
  rememberVioneAppContext,
  resolveVionePostLoginPath,
  shouldUseVioneAuth,
} from "@/lib/business-connect/mobile/vione-auth-context";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; m?: "1"; reason?: "expired" } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
    ...(search.m === "1" ? { m: "1" as const } : {}),
    ...(search.reason === "expired" ? { reason: "expired" as const } : {}),
  }),
  head: () => ({
    meta: [{ title: "Đăng nhập — ViOne" }],
  }),
  component: AuthPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M16.36 12.72c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.44-3.7ZM14.1 5.1c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.28Z" />
    </svg>
  );
}

function safeRedirect(target?: string): string | null {
  if (!target) return null;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const path = url.pathname + url.search + url.hash;
    return path.startsWith("/") && !path.startsWith("//") ? path : null;
  } catch {
    return null;
  }
}

function AuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect: redirectTo, m: mobileParam, reason } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [lastAction, setLastAction] = useState<"password" | "google" | "apple" | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [remember, setRemember] = useState(true);
  const { user, setAuthData } = useAuth();
  const resolveRoute = useServerFn(getPostLoginRouteFn);

  const destPath = safeRedirect(redirectTo) ?? "";

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
      );
    };
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isMobileAuth =
    mobileParam === "1" ||
    isMobileScreen ||
    shouldUseVioneAuth({
      mobileParam: mobileParam === "1",
      redirectPath: destPath,
      directAuth: false,
      remembered: hasRememberedVioneAppContext(),
      standalone: isVioneStandaloneContext(),
    });

  useEffect(() => {
    const detected = hasRememberedVioneAppContext() || isVioneStandaloneContext() || isMobileScreen;
    if (detected || mobileParam === "1" || destPath.startsWith("/connect-app")) {
      rememberVioneAppContext();
    }
  }, [destPath, mobileParam, isMobileScreen]);

  async function goPostLogin() {
    if (isMobileAuth) {
      const dest = resolveVionePostLoginPath(safeRedirect(redirectTo), true);
      navigate({ to: dest || "/connect-app", replace: true });
      return;
    }
    const target = safeRedirect(redirectTo);
    // If user arrived from an explicit redirect to a specific CRM or web route (e.g. /companies, /account-settings, /members, /events)
    if (target && target !== "/auth" && target !== "/login" && target !== "/m" && target !== "/connect-app") {
      navigate({ to: target, replace: true });
      return;
    }
    // Navigate directly to the main CRM system (Quản lý doanh nghiệp, hiệp hội)
    navigate({ to: "/", replace: true });
  }

  useEffect(() => {
    if (reason !== "expired") return;
    setAuthErrorInfo(null);
    if (isMobileAuth) {
      setAuthError(t("auth.sessionExpired"));
    } else {
      toast.error(t("auth.sessionExpired"));
    }
  }, [reason, isMobileAuth]);

  useEffect(() => {
    setRemember(getRememberPreference());
    const saved = getRememberedEmail();
    if (saved) setEmail((v) => v || saved);
  }, []);

  useEffect(() => {
    if (user) {
      void goPostLogin();
    }
  }, [user]);

  async function submit() {
    if (!email.trim()) {
      setAuthError("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }
    if (!password) {
      setAuthError("Vui lòng nhập mật khẩu");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setAuthError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);
    setLastAction("password");

    try {
      if (mode === "signup") {
        await fetchNestApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username: email.trim(), password }),
        });
        toast.success(t("auth.signUpSuccess") || "Đăng ký thành công! Hãy đăng nhập");
        setMode("signin");
      } else {
        // Đăng nhập chỉ qua NestJS backend
        const res = await fetchNestApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (!res?.access_token) {
          throw new Error("Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
        }
        setAuthData(res);
        applyRememberPreference(remember, email.trim());
        await goPostLogin();
      }

    } catch (e: any) {
      const info = classifyAuthError(e, { provider: "password" });
      setAuthErrorInfo(info);
      setAuthError(t(info.messageKey as Parameters<typeof t>[0]) || e?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  // Google Sign-In helper using GIS (Google Identity Services)
  const loginGoogleWeb = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

      const initializeGis = () => {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            ux_mode: "popup",
            callback: (res: any) => {
              if (res.credential) {
                resolve(res.credential);
              } else {
                reject(new Error("No credential returned from Google"));
              }
            },
          });

          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              const btn = document.getElementById("hidden-google-btn")?.querySelector("div");
              if (btn) btn.click();
            }
          });
        } catch (err) {
          reject(err);
        }
      };

      if ((window as any).google?.accounts?.id) {
        initializeGis();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGis;
      script.onerror = () => reject(new Error("Failed to load Google GIS SDK"));
      document.head.appendChild(script);
    });
  };

  // Sign In with Apple helper using Apple Sign-In JS
  const loginAppleWeb = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_APPLE_CLIENT_ID || "your-apple-client-id";

      const initializeApple = () => {
        try {
          (window as any).AppleID.auth.init({
            clientId,
            scope: "name email",
            redirectURI: window.location.origin + "/auth",
            usePopup: true,
          });

          (window as any).AppleID.auth
            .signIn()
            .then((res: any) => resolve(res))
            .catch((err: any) => reject(err));
        } catch (err) {
          reject(err);
        }
      };

      if ((window as any).AppleID?.auth) {
        initializeApple();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth.js";
      script.async = true;
      script.defer = true;
      script.onload = initializeApple;
      script.onerror = () => reject(new Error("Failed to load Apple Sign In SDK"));
      document.head.appendChild(script);
    });
  };

  async function oauth(provider: "google" | "apple") {
    setOauthPending(provider);
    setAuthError(null);
    setAuthErrorInfo(null);
    setLastAction(provider);

    try {
      if (provider === "google") {
        const idToken = await loginGoogleWeb();
        const customSession = await fetchNestApi("/auth/google", {
          method: "POST",
          body: JSON.stringify({ token: idToken }),
        });

        setAuthData(customSession);
        applyRememberPreference(remember, customSession.user.email);
        await goPostLogin();
      } else if (provider === "apple") {
        const appleResult = await loginAppleWeb();
        if (!appleResult || !appleResult.authorization?.id_token) {
          throw new Error("Apple login failed - no token received");
        }

        const customSession = await fetchNestApi("/auth/apple", {
          method: "POST",
          body: JSON.stringify({
            identityToken: appleResult.authorization.id_token,
            authorizationCode: appleResult.authorization.code,
            fullName: appleResult.user?.name,
            email: appleResult.user?.email,
          }),
        });

        setAuthData(customSession);
        applyRememberPreference(remember, customSession.user.email);
        await goPostLogin();
      }
    } catch (e: any) {
      const info = classifyAuthError(e, { provider });
      setAuthErrorInfo(info);
      setAuthError(t(info.messageKey as Parameters<typeof t>[0]) || e?.message || "Đăng nhập OAuth thất bại");
    } finally {
      setOauthPending(null);
    }
  }

  const busy = loading || oauthPending !== null;

  const fieldClass =
    "h-12 w-full rounded-xl border border-input bg-background/85 px-11 text-[15px] text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (isMobileAuth) {
    return (
      <>
        <ConnectAppSignIn
          email={email}
          password={password}
          loading={loading}
          oauthPending={oauthPending}
          errorMessage={authError}
          errorHint={
            authErrorInfo?.hintKey ? t(authErrorInfo.hintKey as Parameters<typeof t>[0]) : null
          }
          onRetry={
            authErrorInfo?.retryable && lastAction
              ? () => {
                  setAuthError(null);
                  setAuthErrorInfo(null);
                  if (lastAction === "password") void submit();
                  else void oauth(lastAction);
                }
              : null
          }
          secondaryLabel={
            authErrorInfo?.secondaryAction === "forgotPassword" ? t("bc.mobile.auth.forgot") : null
          }
          onSecondary={
            authErrorInfo?.secondaryAction === "forgotPassword"
              ? () => navigate({ to: "/forgot-password", search: { m: "1" } })
              : null
          }
          onDismissError={() => {
            setAuthError(null);
            setAuthErrorInfo(null);
          }}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={submit}
          onGoogle={() => void oauth("google")}
          onApple={() => void oauth("apple")}
          remember={remember}
          onRememberChange={setRemember}
          onScanCard={() => {
            setAuthError(null);
            setScanOpen(true);
          }}
        />
        <AuthCardScanSheet
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onResult={(result) => {
            setScanOpen(false);
            if (result.kind === "email") {
              setEmail(result.email);
              rememberScannedCard(result.card);
              toast.success(t("bc.mobile.auth.scanFilled") || "Đã nhận diện danh thiếp!");
              return;
            }
            navigate({ to: result.path });
          }}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden flex items-center justify-center p-4 sm:p-6 bg-background text-foreground transition-colors duration-200">
      {/* Ambient Radial Depth Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 dark:opacity-60"
        style={{
          background:
            "radial-gradient(75% 55% at 50% 10%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 70%)",
        }}
      />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card/95 p-6 sm:p-8 backdrop-blur-xl shadow-elevated text-card-foreground transition-colors duration-200">
        {/* Top bar: Back to Landing & Theme/Lang Switchers */}
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("auth.backToLanding")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LuxuryLangSwitcher />
          </div>
        </div>

        {/* Brand Crest & Headers */}
        <div className="mt-6 flex flex-col items-center justify-center text-center">
          <ViOneLogo className="h-11 sm:h-13 w-auto transition-transform hover:scale-105 duration-300" />
          <div className="mt-2 text-[10px] font-semibold tracking-[0.32em] uppercase bg-clip-text text-transparent bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)]">
            BUSINESS CONNECT
          </div>
          <h1 className="mt-4 font-serif text-[28px] sm:text-[32px] font-light tracking-wide leading-tight bg-[linear-gradient(135deg,#8C653B_0%,#C29B69_45%,#D8B282_100%)] dark:bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(201,158,74,0.25)]">
            {mode === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
          </h1>
          <p className="mt-2 max-w-[20rem] text-center text-[13px] sm:text-[14px] leading-snug font-light tracking-[0.02em] text-muted-foreground dark:text-[#D4C3A3]">
            {mode === "signin" ? t("auth.subtitle") : "Gia nhập mạng lưới doanh nhân tinh hoa ViOne"}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive leading-relaxed"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-destructive/20"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Scoped CSS to eliminate browser autofill and hover background shifts */}
        <style>{`
          .auth-field:-webkit-autofill,
          .auth-field:-webkit-autofill:hover, 
          .auth-field:-webkit-autofill:focus, 
          .auth-field:-webkit-autofill:active {
            -webkit-text-fill-color: currentColor !important;
            transition: background-color 5000s ease-in-out 0s !important;
            caret-color: currentColor !important;
            -webkit-box-shadow: 0 0 0px 1000px var(--card) inset !important;
          }
          .auth-field:hover {
            border-color: var(--input) !important;
            background-color: var(--card) !important;
          }
          .auth-field:focus {
            border-color: #D8B282 !important;
            background-color: var(--card) !important;
          }
        `}</style>

        {/* Credentials Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="mt-5 space-y-3.5"
        >
          <div>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@connect.vn"
              className="auth-field h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#D8B282] focus:ring-1 focus:ring-[#D8B282]/30 shadow-xs"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              className="auth-field h-12 w-full rounded-2xl border border-input bg-card px-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#D8B282] focus:ring-1 focus:ring-[#D8B282]/30 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors focus:outline-none"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "signup" && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="auth-field h-12 w-full rounded-2xl border border-input bg-card px-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#D8B282] focus:ring-1 focus:ring-[#D8B282]/30 shadow-xs"
              />
            </div>
          )}

          {/* Primary Submit Button (Solid Luxury Gold matching mobile) */}
          <button
            type="submit"
            disabled={busy}
            className="relative mt-2 flex h-12 w-full items-center justify-center rounded-xl text-[16px] sm:text-[17px] font-semibold text-[#1b1206] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #AB6D3C 0%, #FDE6B4 100%)",
              boxShadow: "0 -1px 0 0 #f6e6c4 inset, 0 8px 24px -6px rgba(201, 163, 91, 0.6)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#1b1206]" /> {t("auth.processing")}
              </span>
            ) : mode === "signin" ? (
              t("auth.signInButton")
            ) : (
              t("auth.signUpButton")
            )}
            {!loading && (
              <ArrowRight
                className="absolute right-5 sm:right-6 h-5 w-5 text-[#1b1206]"
                aria-hidden="true"
              />
            )}
          </button>

          {/* Quên mật khẩu? (centered link) */}
          {mode === "signin" && (
            <div className="pt-0.5 text-center">
              <Link
                to="/forgot-password"
                search={{ email: email.trim() || undefined }}
                className="text-xs sm:text-[13px] font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground/60">
          <span className="h-px flex-1 bg-border/60" />
          <span>{t("auth.divider")}</span>
          <span className="h-px flex-1 bg-border/60" />
        </div>

        {/* Google OAuth Button */}
        {mode === "signin" && (
          <button
            type="button"
            onClick={() => void oauth("google")}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card/60 hover:bg-muted/40 text-foreground text-sm sm:text-[15px] font-medium transition-all active:scale-[0.99] disabled:opacity-50 shadow-xs"
          >
            {oauthPending === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleMark />
            )}
            <span>{oauthPending === "google" ? t("auth.processing") : t("auth.googleButton")}</span>
          </button>
        )}

        {/* Bottom Toggle Link: Chưa có tài khoản? Đăng ký */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setAuthError(null);
            }}
            className="text-xs sm:text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {(() => {
              const fullText = mode === "signin" ? t("auth.switchToSignUp") : t("auth.switchToSignIn");
              const delimiter = fullText.includes("?") ? "?" : fullText.includes("။") ? "။" : null;
              if (delimiter) {
                const [question, action] = fullText.split(delimiter);
                return (
                  <>
                    <span>{question}{delimiter} </span>
                    <span className="font-semibold text-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground">
                      {action.trim()}
                    </span>
                  </>
                );
              }
              return <span className="font-medium hover:underline">{fullText}</span>;
            })()}
          </button>
        </div>
      </div>

      {/* Hidden container for Google Identity popup fallback */}
      <div id="hidden-google-btn" className="hidden" />

      {/* NFC / QR Card Scan Sheet */}
      <AuthCardScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={(result) => {
          setScanOpen(false);
          if (result.kind === "email") {
            setEmail(result.email);
            rememberScannedCard(result.card);
            toast.success("Đã nhận diện danh thiếp!");
            return;
          }
          navigate({ to: result.path });
        }}
      />
    </main>
  );
}
