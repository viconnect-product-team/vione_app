// BC-Mobile-0B — frozen bottom navigation contract.
// Exactly five visual positions: Home · Network · V · Community · Me.
// V is NOT a route — it triggers the VActionSheet via onVPress.
// Notifications / Messages / AI / QR / NFC are intentionally NOT tabs.

import { Link } from "@tanstack/react-router";
import { useT, type TKey } from "@/lib/i18n";
import { VButton } from "./VButton";
import {
  NavHomeIcon,
  NavNetworkIcon,
  NavCommunityIcon,
  NavMeIcon,
} from "./NavIcons";
import type { ComponentType } from "react";

type NavTab = {
  to: string;
  key: TKey;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

const HOME_TAB: NavTab = {
  to: "/connect-app",
  key: "bc.mobile.nav.home",
  icon: NavHomeIcon,
  exact: true,
};
const NETWORK_TAB: NavTab = {
  to: "/connect-app/network",
  key: "bc.mobile.nav.network",
  icon: NavNetworkIcon,
};
const COMMUNITY_TAB: NavTab = {
  to: "/connect-app/community",
  key: "bc.mobile.nav.community",
  icon: NavCommunityIcon,
};
const ME_TAB: NavTab = {
  to: "/connect-app/me",
  key: "bc.mobile.nav.me",
  icon: NavMeIcon,
};

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
          className="absolute -top-[7px] h-[3px] w-6 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] opacity-0 transition-opacity duration-150 group-data-[status=active]:opacity-100 motion-reduce:transition-none"
        />
        <span className="grid place-items-center rounded-xl px-3 py-1 transition-colors duration-150 group-data-[status=active]:bg-[color-mix(in_oklab,var(--bc-mobile-accent)_14%,transparent)] motion-reduce:transition-none">
          <Icon className="h-[20px] w-[20px]" />
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
        className="relative grid grid-cols-5 items-center border-t border-[#D8B282]/20 bg-[#050c15]/95 px-2 pt-1.5 backdrop-blur-md"
        style={{
          minHeight: "calc(var(--bc-mobile-nav-h) + var(--bc-mobile-safe-bottom))",
          paddingBottom: "max(var(--bc-mobile-safe-bottom), 6px)",
        }}
      >
        {renderTab(HOME_TAB)}
        {renderTab(NETWORK_TAB)}
        <div className="relative flex items-center justify-center">
          <VButton onClick={onVPress} className="-mt-[20px]" />
        </div>
        {renderTab(COMMUNITY_TAB)}
        {renderTab(ME_TAB)}
      </div>
    </nav>
  );
}


