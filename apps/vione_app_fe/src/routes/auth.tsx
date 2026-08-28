import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostLoginRouteFn } from "@/lib/landing-route.functions";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { LuxuryLangSwitcher } from "@/components/LuxuryLangSwitcher";
import { toast } from "sonner";
import { ChevronLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectAppSignIn } from "@/components/business-connect/mobile/ConnectAppSignIn";
import { ViOneLogo } from "@/components/business-connect/mobile/ViOneLogo";
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
    // Chỉ ghi nhớ context khi có tín hiệu ViOne thực sự:
    // - mobileParam=1 (link từ QR hoặc PWA prompt)
    // - destPath bắt đầu /connect-app (redirect từ AuthGate sau khi offline)
    // - standalone/remembered đã được xác nhận
    // KHÔNG ghi khi chỉ là reload /auth không có redirect (directAuth=!redirectTo)
    if (detected || mobileParam === "1" || destPath.startsWith("/connect-app")) {
      rememberVioneAppContext();
    }
  }, [destPath, mobileParam]);
  const isMobileAuth = shouldUseVioneAuth({
    mobileParam: mobileParam === "1",
    redirectPath: destPath,
    // directAuth không còn dùng trong shouldUseVioneAuth nhưng giữ lại type để không break interface
    directAuth: false,
    remembered: browserVioneContext,
    standalone: browserVioneContext,
  });

  async function goPostLogin() {
    const currentVioneContext = shouldUseVioneAuth({
      mobileParam: mobileParam === "1",
      redirectPath: safeRedirect(redirectTo) ?? "",
      directAuth: false, // xem comment trên isMobileAuth — không dùng directAuth để tránh false positive
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
        await fetchNestApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username: email, password }),
        });
        toast.success(t("auth.signUpSuccess"));
        setMode("signin");
      } else {
        const res = await fetchNestApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (res.access_token) {
          const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
          document.cookie = `sb-access-token=${res.access_token}; path=/; max-age=3600; SameSite=Lax${secure}`;
          document.cookie = `sb-refresh-token=${res.refresh_token || ''}; path=/; max-age=604800; SameSite=Lax${secure}`;
          setAuthData(res);
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
          
          // Trigger prompt
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback to custom button click or prompt skipped
              // We can render a hidden button to trigger standard popup
              (window as any).google.accounts.id.renderButton(
                document.getElementById("hidden-google-btn"),
                { theme: "outline", size: "large" }
              );
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
            clientId: clientId,
            scope: "name email",
            redirectURI: window.location.origin + "/auth",
            usePopup: true,
          });
          (window as any).AppleID.auth.signIn()
            .then(resolve)
            .catch(reject);
        } catch (err) {
          reject(err);
        }
      };

      if ((window as any).AppleID) {
        initializeApple();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = initializeApple;
      script.onerror = () => reject(new Error("Failed to load Apple Sign-In SDK"));
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
        let idToken = "";
        
        // Capacitor check for mobile native login
        if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform()) {
          const googleAuthPkg = "@codetrix-studio/capacitor-google-auth";
          const { GoogleAuth } = await import(/* @vite-ignore */ googleAuthPkg);
          const googleUser = await GoogleAuth.signIn();
          idToken = googleUser.authentication.idToken;
        } else {
          idToken = await loginGoogleWeb();
        }

        if (!idToken) throw new Error("Google login failed - no token received");

        // Send token to custom backend NestJS
        const customSession = await fetchNestApi("/auth/google", {
          method: "POST",
          body: JSON.stringify({ token: idToken }),
        });

        setAuthData(customSession);
        applyRememberPreference(remember, customSession.user.email);
        await goPostLogin();
      } else {
        let appleResult: any = null;
        
        // Capacitor check for mobile native login
        if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform()) {
          const appleSignInPkg = "@capacitor-community/apple-sign-in";
          const { SignInWithApple } = await import(/* @vite-ignore */ appleSignInPkg);
          const result = await SignInWithApple.authorize({
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID || "your-apple-client-id",
            redirectUri: window.location.origin + "/auth",
            scopes: "email name",
          });
          appleResult = {
            authorization: {
              id_token: result.response.identityToken,
              code: result.response.authorizationCode,
            },
            user: result.response.email ? {
              email: result.response.email,
              name: {
                firstName: result.response.givenName || "",
                lastName: result.response.familyName || "",
              }
            } : null
          };
        } else {
          appleResult = await loginAppleWeb();
        }

        if (!appleResult || !appleResult.authorization?.id_token) {
          throw new Error("Apple login failed - no token received");
        }

        // Send identity token to custom backend NestJS
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
        <div className="absolute right-4 top-4 flex items-center gap-3 md:right-8 md:top-8">
          <Link to="/" className="text-sm font-medium hover:underline text-muted-foreground mr-1">
            {t("auth.backToLanding")}
          </Link>
          <LuxuryLangSwitcher />
        </div>

        {/* Brand crest */}
        <div className="mt-6 flex flex-col items-center text-center">
          <ViOneLogo className="h-8 w-auto text-primary" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-primary">
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
            className="h-11 w-full rounded-xl text-sm font-semibold border border-solid border-[#ea9a41] bg-[#ea9a41]/10 text-[#ffb971] hover:bg-[#ea9a41] hover:text-white transition-all duration-200"
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
          className="h-11 w-full rounded-xl text-sm font-medium border border-solid border-[#ea9a4150] bg-transparent text-[#d8c3b1] hover:border-[#ffb971] hover:text-[#ffb971] hover:bg-[#ffb971]/10 transition-all duration-200"
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
