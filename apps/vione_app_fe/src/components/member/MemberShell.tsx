import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Bell, MessageSquare, User, QrCode, ChevronLeft, WifiOff } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import authBg from "@/assets/connect-auth-bg.jpg";

const NAVY = "#050c15";

/** Mobile-constrained container for the member app. */
export function MemberScreen({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isContrast = theme === "contrast";
  const isLight = theme === "light";

  return (
    <div className="vba-app relative min-h-[100dvh] w-full bg-[var(--vba-bg)] text-[var(--vba-text)] transition-colors duration-200">
      {/* Dynamic Background Mesh Overlay — only in dark luxury mode */}
      {!isContrast && !isLight && (
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={authBg}
            alt=""
            width={1024}
            height={640}
            className="pointer-events-none absolute inset-x-0 top-0 h-[640px] w-full select-none object-cover opacity-35"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--vba-bg)]/80 to-[var(--vba-bg)]"
          />
        </div>
      )}

      <div className={`relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col border-x border-[var(--vba-border-soft)]/30 ${isContrast ? 'bg-black' : isLight ? 'bg-white' : 'bg-[var(--vba-bg)]/80'} shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm`}>
        <OfflineBanner />
        <div className="flex-1 pb-28">{children}</div>
        <MemberTabBar />
      </div>
    </div>
  );
}

/** Shows a thin banner when the device loses its network connection. */
function OfflineBanner() {
  const t = useT();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--vba-gold)] px-4 py-1.5 text-[11px] font-semibold text-[#1a1206]">
      <WifiOff className="h-3.5 w-3.5" />
      {t("m.shell.offline")}
    </div>
  );
}

/** Simple top bar with optional back button. */
export function MemberHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const t = useT();
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--vba-border-soft)] bg-[var(--vba-bg-2)]/85 px-4 py-3.5 backdrop-blur-md">
      <div className="flex w-9 items-center">
        {back ? (
          <button
            onClick={() => window.history.back()}
            aria-label={t("m.shell.back")}
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--vba-gold)] transition hover:bg-card/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 text-center">
        <h1 className="truncate text-[15px] font-semibold text-[var(--vba-text)]">{title}</h1>
        {subtitle ? (
          <p className="truncate text-[11px] text-[var(--vba-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex w-9 items-center justify-end">{right}</div>
    </header>
  );
}

const tabs = [
  { to: "/m", label: "m.shell.tab_home", icon: Home, exact: true },
  { to: "/m/notifications", label: "m.shell.tab_notifications", icon: Bell },
  { to: "/m/card", label: "m.shell.tab_qr", icon: QrCode, center: true },
  { to: "/m/messages", label: "m.shell.tab_messages", icon: MessageSquare },
  { to: "/m/profile", label: "m.shell.tab_profile", icon: User },
] satisfies { to: string; label: TKey; icon: typeof Home; exact?: boolean; center?: boolean }[];

function MemberTabBar() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px]">
      <div className="relative flex items-end justify-around border-t border-[var(--vba-border-soft)] bg-[var(--vba-bg-2)]/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.to, tab.exact);
          if (tab.center) {
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-label={t(tab.label)}
                className="-mt-7 flex flex-col items-center"
              >
                <span className="vba-gold-grad grid h-14 w-14 place-items-center rounded-2xl text-[#1a1206] shadow-[0_8px_24px_-6px_rgba(232,196,106,0.6)]">
                  <Icon className="h-6 w-6" />
                </span>
              </Link>
            );
          }
          return (
            <Link key={tab.to} to={tab.to} className="flex flex-1 flex-col items-center gap-1 py-1">
              <Icon
                className="h-5 w-5"
                style={{ color: active ? "var(--vba-gold)" : "var(--vba-text-dim)" }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "var(--vba-gold)" : "var(--vba-text-dim)" }}
              >
                {t(tab.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Reusable section heading with optional "see all" link. */
export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-[var(--vba-text)]">{title}</h2>
      {action}
    </div>
  );
}
