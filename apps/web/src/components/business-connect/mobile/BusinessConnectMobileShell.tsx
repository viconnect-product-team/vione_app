// BC-Mobile-0B — Business Connect mobile application shell.
// Presentation boundary ONLY: no providers (QueryClient / auth / theme / i18n
// all live in src/routes/__root.tsx). 480px-constrained mobile viewport,
// offline banner, frozen 5-position bottom nav, V action sheet state.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";
import { VSheetContext } from "@/hooks/use-v-sheet";
import { BusinessConnectBottomNav } from "./BusinessConnectBottomNav";
import { VActionSheet } from "./VActionSheet";

/**
 * Connect-app is a dark-first surface: the navy/gold design tone must apply
 * even when the OS/site theme is light. Force `dark` on <html> while any
 * /connect-app screen is mounted, then restore the previous state on exit.
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

export function BusinessConnectMobileShell({ children }: { children: ReactNode }) {
  useForcedDarkTone();
  const [vOpen, setVOpen] = useState(false);
  const openV = useCallback(() => setVOpen(true), []);
  const vControls = useMemo(() => ({ openV }), [openV]);
  return (
    <VSheetContext.Provider value={vControls}>
      <div className="bc-app bc-app-viewport">
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
