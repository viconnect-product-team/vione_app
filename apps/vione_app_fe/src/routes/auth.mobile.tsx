import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import {
  ConnectAppSignIn,
  type AppPortalType,
} from "@/components/business-connect/mobile/ConnectAppSignIn";
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
} from "@/lib/business-connect/mobile/vione-auth-context";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth/mobile")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; reason?: "expired"; portal?: "connect" | "association" } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
    ...(search.reason === "expired" ? { reason: "expired" as const } : {}),
    ...(search.portal === "association" ? { portal: "association" as const } : {}),
  }),
  head: () => ({
    meta: [{ title: "Đăng nhập Di động — ViOne & Hiệp hội" }],
  }),
  component: MobileAuthPage,
});

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

function MobileAuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect: redirectTo, reason, portal: searchPortal } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [remember, setRemember] = useState(true);
  const { user, setAuthData } = useAuth();

  const destPath = safeRedirect(redirectTo) ?? "";

  const [appPortal, setAppPortal] = useState<AppPortalType>(() => {
    if (searchPortal === "association" || destPath.startsWith("/association") || destPath.startsWith("/m")) {
      return "association";
    }
    return "connect";
  });

  async function goPostLogin() {
    const target = safeRedirect(redirectTo);

    // If user selected Association portal, route to /association
    if (appPortal === "association" || searchPortal === "association") {
      try {
        localStorage.removeItem("bc.vione-app.context");
      } catch {}
      navigate({ to: "/association" as any, replace: true });
      return;
    }

    if (target && !target.startsWith("/auth")) {
      const isVioneTarget = target.startsWith("/connect-app");
      if (isVioneTarget) {
        rememberVioneAppContext();
      }
      navigate({ to: target as any, replace: true });
      return;
    }

    // Default mobile ViOne portal
    rememberVioneAppContext();
    navigate({ to: "/connect-app" as any, replace: true });
  }

  useEffect(() => {
    setRemember(getRememberPreference());
    const remembered = getRememberedEmail();
    if (remembered) setEmail(remembered);
  }, []);

  useEffect(() => {
    if (reason === "expired") {
      setAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, [reason]);

  useEffect(() => {
    if (user) {
      void goPostLogin();
    }
  }, [user]);

  async function submit() {
    if (!email.trim() || !password) {
      setAuthError("Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu");
      return;
    }
    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);

    try {
      const customSession = await fetchNestApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      setAuthData(customSession);
      applyRememberPreference(remember, email.trim());
      await goPostLogin();
    } catch (e: any) {
      const info = classifyAuthError(e, { provider: "password" });
      setAuthErrorInfo(info);
      setAuthError(
        t(info.messageKey as Parameters<typeof t>[0]) || e?.message || "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

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
        onRetry={submit}
        secondaryLabel={null}
        onSecondary={null}
        onDismissError={() => {
          setAuthError(null);
          setAuthErrorInfo(null);
        }}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={submit}
        onGoogle={() => toast.info("Đăng nhập Google trên di động")}
        onApple={() => toast.info("Đăng nhập Apple trên di động")}
        onScanCard={() => setScanOpen(true)}
        remember={remember}
        onRememberChange={setRemember}
        appPortal={appPortal}
        onAppPortalChange={setAppPortal}
      />

      <AuthCardScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResolved={(result) => {
          rememberScannedCard(result);
          if (result.email) setEmail(result.email);
          setScanOpen(false);
          toast.success(t("bc.scan.cardRecognized"));
        }}
      />
    </>
  );
}
