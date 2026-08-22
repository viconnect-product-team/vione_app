import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostLoginRouteFn } from "@/lib/landing-route.functions";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { toast } from "sonner";
import { ChevronLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/auth")({
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

/** Only allow same-origin relative paths to prevent open-redirect abuse. */
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
  const [loading, setLoading] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  // Hành động cuối cùng để nút "Thử lại" lặp đúng luồng người dùng đã chọn.
  const [lastAction, setLastAction] = useState<"password" | "google" | "apple" | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [remember, setRemember] = useState(true);
  const { user, setAuthData } = useAuth();
  const resolveRoute = useServerFn(getPostLoginRouteFn);

  const destPath = safeRedirect(redirectTo) ?? "";
  // Nhận diện ViOne bằng URL + dấu hiệu bền vững, không phụ thuộc manifest cache.
  const [browserVioneContext, setBrowserVioneContext] = useState(false);
  useEffect(() => {
    const detected = hasRememberedVioneAppContext() || isVioneStandaloneContext();
    setBrowserVioneContext(detected);
    if (detected || mobileParam === "1" || destPath.startsWith("/connect-app")) {
      rememberVioneAppContext();
    }
  }, [destPath, mobileParam]);
  const isMobileAuth = shouldUseVioneAuth({
    mobileParam: mobileParam === "1",
    redirectPath: destPath,
    directAuth: !redirectTo,
    remembered: browserVioneContext,
    standalone: browserVioneContext,
  });

  async function goPostLogin() {
    const currentVioneContext = shouldUseVioneAuth({
      mobileParam: mobileParam === "1",
      redirectPath: safeRedirect(redirectTo) ?? "",
      directAuth: !redirectTo,
      remembered: hasRememberedVioneAppContext(),
      standalone: isVioneStandaloneContext(),
    });
    const dest = resolveVionePostLoginPath(safeRedirect(redirectTo), currentVioneContext);
    if (dest) {
      navigate({ to: dest, replace: true });
      return;
    }
    if (currentVioneContext) {
      navigate({ to: "/connect-app", replace: true });
      return;
    }
    try {
      const to = await resolveRoute({});
      navigate({ to, replace: true });
    } catch {
      navigate({ to: "/", replace: true });
    }
  }

  // Phiên hết hạn: báo đúng ngữ cảnh UI (inline trên PWA, toast trên web).
  useEffect(() => {
    if (reason !== "expired") return;
    setAuthErrorInfo(null);
    if (isMobileAuth) setAuthError(t("auth.sessionExpired"));
    else toast.error(t("auth.sessionExpired"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function submit() {
    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);
    setLastAction("password");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success(t("auth.signUpSuccess"));
        // automatically switch to sign in mode or auto login
        setMode("signin");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          setAuthData(data.session);
          applyRememberPreference(remember, email);
          await goPostLogin();
        } else {
          throw new Error("Invalid response from server");
        }
      }
    } catch (e) {
      const info = classifyAuthError(e, { provider: "password" });
      setAuthErrorInfo(info);
      setAuthError(t(info.messageKey as Parameters<typeof t>[0]));
      if (!isMobileAuth) toast.error(t(info.messageKey as Parameters<typeof t>[0]));
    } finally {
      setLoading(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setOauthPending(provider);
    setAuthError(null);
    setAuthErrorInfo(null);
    setLastAction(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${resolveVionePostLoginPath(
            safeRedirect(redirectTo),
            hasRememberedVioneAppContext(),
          ) ?? (hasRememberedVioneAppContext() ? "/connect-app" : "/")}`,
        },
      });
      if (error) throw error;
      // Trình duyệt sẽ chuyển hướng ngay lập tức
    } catch (e) {
      const info = classifyAuthError(e, { provider });
      setAuthErrorInfo(info);
      setAuthError(t(info.messageKey as Parameters<typeof t>[0]));
      if (!isMobileAuth) toast.error(t(info.messageKey as Parameters<typeof t>[0]));
      setOauthPending(null);
    }
  }

  const google = () => oauth("google");

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
              toast.success(t("bc.mobile.auth.scanFilled"));
              return;
            }
            navigate({ to: result.path });
          }}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10">
      {/* Ambient primary glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 8%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-elevated">
        <div className="flex items-center justify-between">
          <Link
            to="/landing"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("auth.backToLanding")}
          </Link>
          <LangSwitcher />
          <ThemeSwitcher />
        </div>

        {/* Brand crest */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-primary/10">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-primary">
            {mode === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <div className="mt-6 space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className="h-11 rounded-xl px-4"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            className="h-11 rounded-xl px-4"
          />
          <Button
            onClick={submit}
            disabled={loading}
            className="h-11 w-full rounded-xl text-sm font-semibold"
          >
            {loading
              ? t("auth.processing")
              : mode === "signin"
                ? t("auth.signInButton")
                : t("auth.signUpButton")}
          </Button>
          {mode === "signin" && (
            <Link
              to="/forgot-password"
              className="block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("auth.forgotPassword")}
            </Link>
          )}
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> {t("auth.divider")}
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          onClick={google}
          variant="outline"
          className="h-11 w-full rounded-xl text-sm font-medium"
        >
          {t("auth.googleButton")}
        </Button>

        <Button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          variant="link"
          className="mt-3 h-auto w-full text-sm font-medium text-primary"
        >
          {mode === "signin" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
        </Button>
      </div>
    </div>
  );
}
