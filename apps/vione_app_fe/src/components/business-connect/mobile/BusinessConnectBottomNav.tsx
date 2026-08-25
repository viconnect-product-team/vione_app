// BC-Mobile-0B — frozen bottom navigation contract.
// Exactly five visual positions: Home · Network · V · Community · Me.
// V is NOT a route — it triggers the VActionSheet via onVPress.
// Notifications / Messages / AI / QR / NFC are intentionally NOT tabs.

import { Link } from "@tanstack/react-router";
import { Home, Network, Users, CircleUserRound, type LucideIcon } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { VButton } from "./VButton";

type NavTab = { to: string; key: TKey; icon: LucideIcon; exact?: boolean };

const HOME_TAB: NavTab = { to: "/connect-app", key: "bc.mobile.nav.home", icon: Home, exact: true };
const NETWORK_TAB: NavTab = {
  to: "/connect-app/network",
  key: "bc.mobile.nav.network",
  icon: Network,
};
const COMMUNITY_TAB: NavTab = {
  to: "/connect-app/community",
  key: "bc.mobile.nav.community",
  icon: Users,
};
const ME_TAB: NavTab = { to: "/connect-app/me", key: "bc.mobile.nav.me", icon: CircleUserRound };

export function BusinessConnectBottomNav({ onVPress }: { onVPress: () => void }) {
  const t = useT();

  const renderTab = (tab: NavTab) => {
    const Icon = tab.icon;
    return (
      <Link
        key={tab.to}
        to={tab.to}
        activeOptions={{ exact: tab.exact ?? false }}
        className="group relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 motion-reduce:transition-none"
        activeProps={{ className: "text-[var(--bc-mobile-accent)]" }}
        inactiveProps={{
          className: "text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]",
        }}
      >
        {/* Chỉ báo tab đang chọn */}
        <span
          aria-hidden="true"
          className="absolute -top-[7px] h-[3px] w-6 rounded-full bg-[var(--bc-mobile-accent)] opacity-0 transition-opacity duration-150 group-data-[status=active]:opacity-100 motion-reduce:transition-none"
        />
        <span className="grid place-items-center rounded-xl px-3 py-1 transition-colors duration-150 group-data-[status=active]:bg-[color-mix(in_oklab,var(--bc-mobile-accent)_14%,transparent)] motion-reduce:transition-none">
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.9} />
        </span>
        <span className="text-[10.5px] font-medium leading-none group-data-[status=active]:font-semibold">
          {t(tab.key)}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label={t("bc.mobile.nav.label")}
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px]"
    >
      <div
        className="relative grid grid-cols-5 items-end border-t border-[color-mix(in_oklab,var(--bc-mobile-accent)_18%,var(--bc-mobile-border))] bg-[var(--bc-mobile-surface)]/95 px-2 pt-2.5 backdrop-blur-xl"
        style={{
          minHeight: "calc(var(--bc-mobile-nav-h) + var(--bc-mobile-safe-bottom))",
          paddingBottom: "max(var(--bc-mobile-safe-bottom), 8px)",
          boxShadow: "var(--bc-mobile-shadow-nav)",
        }}
      >
        {/* Dải sáng vàng mảnh chạy dọc mép trên thanh nav */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--bc-mobile-accent)_55%,transparent),transparent)]"
        />
        {renderTab(HOME_TAB)}
        {renderTab(NETWORK_TAB)}
        <div className="relative flex items-start justify-center">
          {/* Elevated signature control; overlaps the nav bar vertically. */}
          <VButton onClick={onVPress} className="-mt-[34px]" />
        </div>
        {renderTab(COMMUNITY_TAB)}
        {renderTab(ME_TAB)}
      </div>
    </nav>
  );
}
