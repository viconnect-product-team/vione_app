// BC-Mobile-7A/7B — Community screen.
// Trình bày theo ngôn ngữ thiết kế Network (nền tối, vàng gold, thẻ bo góc,
// hàng hành động). Chỉ đổi lớp giao diện: dữ liệu vẫn đến từ các hợp đồng
// 7A/7B đã đóng băng (không feed, không CRUD, không chỉ số ảo).

import { Link } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { getVNTimeGreeting } from "@/lib/utils";
import { useMyCommunities } from "@/hooks/use-community";
import { useCommunityActivityPreview } from "@/hooks/use-community-activity";
import { useBusinessConnectHome } from "@/hooks/use-business-connect-home";
import { reportCommunityMetric } from "@/lib/business-connect/mobile/community.telemetry";
import type { CommunitySummaryDTO } from "@/lib/business-connect/mobile/community.types";
import { BusinessConnectTopBar } from "../BusinessConnectTopBar";
import { ViOneLogo } from "../ViOneLogo";
import { MobileSearchBar } from "../MobileSearchBar";
import icon from "../icon.svg";
import { CommunityJoinSection } from "./CommunityJoinSection";
import { CommunityJoinHistory } from "./CommunityJoinHistory";
import {
  CommunityJoinStatusBadge,
  CommunityJoinStatusCards,
} from "./CommunityJoinStatusCards";
import { useCommunityJoinAdminRequests } from "@/hooks/use-community-join";
import { useCommunityJoinDecisionAlerts, useCommunityJoinLiveSync } from "@/hooks/use-community-join";
import { CommunityUpcomingEvents } from "./CommunityUpcomingEvents";
import { CommunityOpportunitiesSection } from "./CommunityOpportunitiesSection";

type CommunityTab = "all" | "admin" | "joined" | "history";

export function CommunityHome({ initialTab }: { initialTab?: CommunityTab } = {}) {
  const t = useT();
  const { communities, initialLoading, coreError, retry } = useMyCommunities();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [tab, setTab] = useState<CommunityTab>(initialTab ?? "all");

  useCommunityJoinDecisionAlerts();
  useCommunityJoinLiveSync();

  useEffect(() => {
    reportCommunityMetric("COMMUNITY_OPENED");
  }, []);

  const query = term.trim().toLowerCase();

  const visible = useMemo(() => {
    return communities.filter((c) => {
      if (tab === "admin" && c.viewerRole !== "admin") return false;
      if (tab === "joined" && c.viewerRole !== "member") return false;
      if (!query) return true;
      return c.name.toLowerCase().includes(query);
    });
  }, [communities, query, tab]);


  const hasAdmin = communities.some((c) => c.viewerRole === "admin");

  return (
    <>
      {/* Sticky Header thương hiệu chung */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-t border-solid border-[#ffffff14] bg-[#1e1c18f2] backdrop-blur-md px-5 py-3 -mx-4">
        <div className="relative inline-flex flex-none flex-col items-start gap-1">
          <ViOneLogo className="h-5 w-[77px]" />
          <p className="relative -mt-px flex w-fit items-center whitespace-nowrap font-['Inter-Light',Helvetica] text-xs font-light leading-4 tracking-[0] text-[#d8c3b1]">
            {getVNTimeGreeting()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CommunityNotificationsButton />
        </div>
      </header>

      <div aria-hidden="true" style={{ paddingTop: "var(--bc-mobile-safe-top-compact)" }} />

      <main id="bc-mobile-community" className="contents">

        {/* A — Header */}
        <div className="mt-1 flex flex-col items-start w-full">
          <div className="min-w-0">
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--bc-mobile-text)]">
              {t("bc.mobile.nav.community")}
            </h1>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
              Thành viên - Sự kiện - Cơ hội
            </p>
          </div>
        </div>

        {initialLoading ? (
          <CommunityListSkeleton />
        ) : coreError ? (
          <CommunityError onRetry={retry} />
        ) : communities.length === 0 ? (
          <section className="mt-14 flex flex-col items-start gap-2">
            <Users
              aria-hidden="true"
              className="h-7 w-7 text-[var(--bc-mobile-muted)]"
              strokeWidth={1.5}
            />
            <p className="max-w-[34ch] text-[15px] leading-relaxed text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.community.empty.title")}
            </p>
            <CommunityJoinStatusCards />
            <CommunityJoinSection />
            <CommunityJoinHistory />
          </section>
        ) : (
          <>
            {/* D — Tabs nằm ngay dưới Header */}
            <div className="mt-5 flex items-center gap-5 border-b border-[#ea9a4115] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: "all", label: "Tất cả" },
                ...(hasAdmin ? [{ id: "admin", label: "Đang quản trị" }] : []),
                { id: "joined", label: "Đã tham gia" },
                { id: "history", label: "Lịch sử yêu cầu" }
              ].map((item) => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id as any)}
                    className={`relative pb-2.5 text-[15px] transition-colors whitespace-nowrap focus-visible:outline-none ${
                      isActive
                        ? "font-semibold text-[#ffb971]"
                        : "text-[#d8c3b180]"
                    }`}
                  >
                    {item.label}
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#ffb971]"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* B — Ô tìm kiếm 100% chiều rộng nằm dưới Tabs */}
            <form
              className="mt-4 flex items-center relative self-stretch w-full flex-[0_0_auto]"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
            <MobileSearchBar
              value={term}
              onChange={setTerm}
              placeholder="Tìm hiệp hội, nhóm, sự kiện..."
            />
            </form>

            {tab === "history" ? (
              <CommunityJoinHistory panel />
            ) : (
              <>
                {/* E — Thẻ cộng đồng */}
                {query ? (
                  <p
                    aria-live="polite"
                    className="mt-4 text-[12.5px] text-[var(--bc-mobile-muted)]"
                  >
                    {t("bc.mobile.community.searchList.results", { count: visible.length })}
                  </p>
                ) : null}
                {visible.length === 0 ? (
                  <section className="mt-10 flex flex-col items-start gap-2">
                    <p className="text-[15px] text-[var(--bc-mobile-text)]">
                      {t("bc.mobile.community.searchList.empty")}
                    </p>
                    <p className="text-[13px] text-[var(--bc-mobile-muted)]">
                      {t("bc.mobile.community.searchList.emptyHint")}
                    </p>
                    {query ? (
                      <button
                        type="button"
                        onClick={() => setTerm("")}
                        className="mt-1 min-h-[44px] text-[14px] font-medium text-[var(--bc-mobile-accent)]"
                      >
                        {t("bc.mobile.community.search.clear")}
                      </button>
                    ) : null}
                  </section>
                ) : (
                  <ul aria-label={t("bc.mobile.community.list.label")} className="mt-4 space-y-3.5">
                    {visible.map((c) => (
                      <CommunityCard key={c.communityId} community={c} />
                    ))}
                  </ul>
                )}
                <CommunityJoinStatusCards term={term} />

                {/* F — Cộng đồng gợi ý (yêu cầu tham gia) */}
                {!query ? (
                  <>
                    <CommunityJoinAdminEntry />
                    <CommunityJoinSection />
                    <CommunityJoinHistory />
                  </>
                ) : null}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

/** Lối vào màn quản trị yêu cầu tham gia (chỉ hiện khi viewer quản trị cộng đồng). */
function CommunityJoinAdminEntry() {
  const t = useT();
  const { items, initialLoading } = useCommunityJoinAdminRequests();
  if (initialLoading || items.length === 0) return null;
  const pending = items.filter((i) => i.status === "pending").length;

  return (
    <Link
      to="/connect-app/community/requests"
      data-testid="bc-community-join-admin-entry"
      className="mt-6 flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 py-3"
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
          {t("bc.mobile.community.join.admin.entry")}
        </span>
        <span className="block text-[12.5px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.join.admin.pendingCount", { count: String(pending) })}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--bc-mobile-muted)]" strokeWidth={1.8} />
    </Link>
  );
}

function CommunityNotificationsButton() {
  const t = useT();
  const { data } = useBusinessConnectHome();
  const unread = data?.unreadNotificationCount ?? null;
  const hasUnread = typeof unread === "number" && unread > 0;
  return (
    <Link
      to="/connect-app/notifications"
      aria-label={
        hasUnread
          ? t("bc.mobile.home.notifications.unread", { count: unread })
          : t("bc.mobile.home.notifications")
      }
      className="relative grid place-items-center rounded-full text-[#d8c3b1] transition-colors hover:bg-[#ffffff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea9a41]"
    >
      <Bell className="h-5 w-5 text-[#d8c3b1]" strokeWidth={1.8} />
      {hasUnread ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-solid border-[#12110f] bg-[#ea9a41] font-['Inter-Bold',Helvetica] text-[9.5px] font-bold leading-none text-[#2c1600]">
          {unread}
        </span>
      ) : null}
    </Link>
  );
}

function CommunityCard({ community }: { community: CommunitySummaryDTO }) {
  const t = useT();
  const { preview } = useCommunityActivityPreview(community.communityId);
  const eventCount = preview?.nextEvents.length ?? null;
  const oppCount = preview?.openOpportunities.length ?? null;

  return (
    <li className="overflow-hidden rounded-2xl border border-solid border-[#ea9a4126] bg-[#251e18]/60 p-3.5 flex flex-col gap-3">
      <Link
        to="/connect-app/community/$communityId"
        params={{ communityId: community.communityId }}
        className="flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <CommunityAvatar name={community.name} logoUrl={community.logoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 w-full">
              <p className="truncate text-[16px] font-semibold text-[#f2efe9]">
                {community.name}
              </p>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#d8c3b180] ml-auto"
                strokeWidth={1.8}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="rounded-md border border-solid border-[#ea9a414c] bg-[#ea9a4110] px-2 py-0.5 text-[11px] font-medium text-[#ffb971]">
                {community.viewerRole === "admin" ? "Quản trị viên" : "Thành viên"}
              </span>
              <span className="rounded-md border border-solid border-[#ea9a414c] bg-[#ea9a4110] px-2 py-0.5 text-[11px] font-medium text-[#ffb971]">
                Đã tham gia
              </span>
            </div>
          </div>
        </div>
      </Link>

      <p className="text-[13px] [font-family:'Inter-Light',Helvetica] font-light text-[#d8c3b1b2] leading-relaxed">
        {[
          community.memberCount !== null
            ? `${community.memberCount} thành viên`
            : null,
          eventCount ? `${eventCount} sự kiện` : null,
          oppCount ? `${oppCount} cơ hội` : null,
        ]
          .filter(Boolean)
          .join(" • ") || (community.shortDescription ?? "")}
      </p>

      <div className="w-full h-px bg-[#ea9a411a]" />

      <div className="grid grid-cols-3 divide-x divide-[#ea9a411a] -mx-3.5 -mb-3.5">
        <Link
          to="/connect-app/community/$communityId/members"
          params={{ communityId: community.communityId }}
          className="flex min-h-[40px] items-center justify-center gap-1.5 text-[13px] font-light text-[#d8c3b1] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <Users aria-hidden="true" className="h-4 w-4 text-[#d8c3b1]" strokeWidth={1.8} />
          Thành viên
        </Link>
        <Link
          to="/connect-app/community/$communityId/events"
          params={{ communityId: community.communityId }}
          className="flex min-h-[40px] items-center justify-center gap-1.5 text-[13px] font-light text-[#d8c3b1] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <CalendarDays aria-hidden="true" className="h-4 w-4 text-[#d8c3b1]" strokeWidth={1.8} />
          Sự kiện
        </Link>
        <Link
          to="/connect-app/community/$communityId/opportunities"
          params={{ communityId: community.communityId }}
          className="flex min-h-[40px] items-center justify-center gap-1.5 text-[13px] font-light text-[#d8c3b1] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <Briefcase aria-hidden="true" className="h-4 w-4 text-[#d8c3b1]" strokeWidth={1.8} />
          Cơ hội
        </Link>
      </div>
    </li>
  );
}

export function CommunityAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        loading="lazy"
        className="h-12 w-12 shrink-0 rounded-full border border-solid border-[#ea9a4126] object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-solid border-[#ea9a4126] bg-[#251e18] text-[16px] font-semibold text-[#ffb971]"
    >
      {name.trim().charAt(0).toUpperCase() || "·"}
    </div>
  );
}

export function CommunityListSkeleton() {
  return (
    <div aria-hidden="true" className="mt-4 space-y-3.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-solid border-[#ea9a4126] bg-[#251e18]/60 p-3.5"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[#ea9a4115]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded-full bg-[#ea9a4115]" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-[#ea9a4115]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommunityError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <section className="mt-14 flex flex-col items-start gap-3" role="alert">
      <p className="text-[15px] text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.community.error.title")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--bc-mobile-border)] px-4 text-[14px] font-medium text-[var(--bc-mobile-accent)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
      >
        <RefreshCw aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        {t("bc.mobile.community.retry")}
      </button>
    </section>
  );
}
