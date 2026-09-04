// BC-Mobile-0B — Business Connect mobile application shell.
// Presentation boundary ONLY: no providers (QueryClient / auth / theme / i18n
// all live in src/routes/__root.tsx). 480px-constrained mobile viewport,
// offline banner, frozen 5-position bottom nav, V action sheet state.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";
import { VSheetContext } from "@/hooks/use-v-sheet";
import authBg from "@/assets/connect-auth-bg.jpg";
import { BusinessConnectBottomNav } from "./BusinessConnectBottomNav";
import { VActionSheet } from "./VActionSheet";

/**
 * Connect-app is a dark-first surface: enforce the "dark" class on <html>
 * even when the OS/site theme is light, and restore the previous mode when
 * /connect-app screen is unmounted.
 */
function useForcedDarkTone() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const prevScheme = root.style.colorScheme;
    root.classList.add("dark");
    root.dataset["bcForcedDark"] = "true";
    root.style.colorScheme = "dark";
    return () => {
      if (!hadDark) root.classList.remove("dark");
      delete root.dataset["bcForcedDark"];
      root.style.colorScheme = prevScheme;
    };
  }, []);
}

const NAVY = "#050c15";

export function BusinessConnectMobileShell({ children }: { children: ReactNode }) {
  useForcedDarkTone();
  const [vOpen, setVOpen] = useState(false);
  const openV = useCallback(() => setVOpen(true), []);
  const vControls = useMemo(() => ({ openV }), [openV]);
  return (
    <VSheetContext.Provider value={vControls}>
      {/* Background chấm bi vàng đồng nhạt y hệt trang Đăng nhập */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: NAVY }}
        aria-hidden="true"
      >
        <img
          src={authBg}
          alt=""
          width={1024}
          height={640}
          className="pointer-events-none absolute inset-x-0 top-0 h-[640px] w-full select-none object-cover opacity-60"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(130% 75% at 50% 30%, transparent 20%, ${NAVY} 90%)`,
          }}
        />
      </div>

      {/* data-motion="forced" explicitly overrides reduced-motion inside the BC shell */}
      <div className="bc-app bc-app-viewport relative z-10" data-motion="forced">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col">
          <BcMobileOfflineBanner />
          {children}
          <BusinessConnectBottomNav onVPress={openV} />
          <VActionSheet open={vOpen} onOpenChange={setVOpen} />
        </div>
      </div>
    </VSheetContext.Provider>
  );
}


/** Thin banner shown when the device loses its network connection. */
function BcMobileOfflineBanner() {
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
    <div
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--bc-mobile-accent-soft)] px-4 py-1.5 text-[11px] font-semibold text-[var(--bc-mobile-navy)]"
      role="status"
    >
      <WifiOff className="h-3.5 w-3.5" />
      {t("bc.mobile.shell.offline")}
    </div>
  );
}
