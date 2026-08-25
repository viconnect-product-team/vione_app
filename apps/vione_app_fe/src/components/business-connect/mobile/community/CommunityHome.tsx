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
import { useMyCommunities } from "@/hooks/use-community";
import { useCommunityActivityPreview } from "@/hooks/use-community-activity";
import { useBusinessConnectHome } from "@/hooks/use-business-connect-home";
import { reportCommunityMetric } from "@/lib/business-connect/mobile/community.telemetry";
import type { CommunitySummaryDTO } from "@/lib/business-connect/mobile/community.types";
import { BusinessConnectTopBar } from "../BusinessConnectTopBar";
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

type CommunityTab = "all" | "admin" | "history";

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
      if (!query) return true;
      return c.name.toLowerCase().includes(query);
    });
  }, [communities, query, tab]);


  const hasAdmin = communities.some((c) => c.viewerRole === "admin");

  return (
    <>
      <BusinessConnectTopBar />
      <main id="bc-mobile-community" className="contents">
        {/* A — Header */}
        <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          {searchOpen ? (
            <div
              role="search"
              className="flex h-12 items-center gap-2.5 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3 focus-within:ring-2 focus-within:ring-[var(--bc-mobile-navy)]"
            >
              <label htmlFor="bc-community-search" className="sr-only">
                {t("bc.mobile.community.searchList.label")}
              </label>
              <Search
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 text-[var(--bc-mobile-muted)]"
                strokeWidth={1.8}
              />
              <input
                id="bc-community-search"
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t("bc.mobile.community.searchList.placeholder")}
                autoComplete="off"

                autoFocus
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[var(--bc-mobile-text)] outline-none placeholder:text-[var(--bc-mobile-muted)] [&::-webkit-search-cancel-button]:hidden"
              />
              {term ? (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  aria-label={t("bc.mobile.community.search.clear")}
                  className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-muted)] hover:bg-[var(--bc-mobile-border)] hover:text-[var(--bc-mobile-text)]"
                >
                  <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--bc-mobile-text)]">
                {t("bc.mobile.nav.community")}
              </h1>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.community.subtitle")}
              </p>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) setTerm("");
              }}
              aria-label={t("bc.mobile.community.search.toggle")}
              aria-expanded={searchOpen}
              className="grid h-11 w-11 place-items-center rounded-full text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
            >
              {searchOpen ? (
                <X className="h-[21px] w-[21px]" strokeWidth={1.8} />
              ) : (
                <Search className="h-[21px] w-[21px]" strokeWidth={1.8} />
              )}
            </button>
            <CommunityNotificationsButton />
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
            {/* C — Sắp diễn ra */}
            {!term ? (
              <>
                <CommunityUpcomingEvents communities={communities} />
                <CommunityOpportunitiesSection communities={communities} />
              </>
            ) : null}

            {/* D — Tabs */}
            <div className="mt-5 flex items-center gap-4 border-b border-[var(--bc-mobile-border)]">
              {(["all", ...(hasAdmin ? (["admin"] as const) : []), "history"] as CommunityTab[]).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    aria-current={tab === key}
                    data-testid={`bc-community-tab-${key}`}
                    className={`relative min-h-[44px] text-[15px] transition-colors ${
                      tab === key
                        ? "font-semibold text-[var(--bc-mobile-accent)]"
                        : "text-[var(--bc-mobile-muted)]"
                    }`}
                  >
                    {t(
                      key === "all"
                        ? "bc.mobile.community.tabs.all"
                        : key === "admin"
                          ? "bc.mobile.community.tabs.admin"
                          : "bc.mobile.community.tabs.history",
                    )}
                    {tab === key ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--bc-mobile-accent)]"
                      />
                    ) : null}
                  </button>
                ),
              )}
            </div>

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
      className="relative grid h-11 w-11 place-items-center rounded-full border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
    >
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
      {hasUnread ? (
        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--bc-mobile-accent)]" />
      ) : null}
    </Link>
  );
}

/** E — thẻ cộng đồng: nhận diện, số liệu thật, hàng hành động. */
function CommunityCard({ community }: { community: CommunitySummaryDTO }) {
  const t = useT();
  const { preview } = useCommunityActivityPreview(community.communityId);
  const eventCount = preview?.nextEvents.length ?? null;
  const oppCount = preview?.openOpportunities.length ?? null;

  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)]">
      <Link
        to="/connect-app/community/$communityId"
        params={{ communityId: community.communityId }}
        className="flex items-center gap-3.5 p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <CommunityAvatar name={community.name} logoUrl={community.logoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[16px] font-semibold text-[var(--bc-mobile-text)]">
              {community.name}
            </p>
            <span className="shrink-0 rounded-full border border-[var(--bc-mobile-accent)]/40 px-2 py-0.5 text-[11px] font-medium text-[var(--bc-mobile-accent)]">
              {community.viewerRole === "admin"
                ? t("bc.mobile.community.role.admin")
                : t("bc.mobile.community.role.member")}
            </span>
            <CommunityJoinStatusBadge status="approved" />
          </div>
          <p className="mt-1 truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
            {[
              community.memberCount !== null
                ? t("bc.mobile.community.memberCount", { count: community.memberCount })
                : null,
              eventCount ? t("bc.mobile.community.stats.events", { count: eventCount }) : null,
              oppCount ? t("bc.mobile.community.stats.opportunities", { count: oppCount }) : null,
            ]
              .filter(Boolean)
              .join(" • ") || (community.shortDescription ?? "")}
          </p>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
          strokeWidth={1.8}
        />
      </Link>
      <div className="grid grid-cols-3 border-t border-[var(--bc-mobile-border)] divide-x divide-[var(--bc-mobile-border)]">
        <Link
          to="/connect-app/community/$communityId/members"
          params={{ communityId: community.communityId }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 text-[13px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <Users aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.community.members")}
        </Link>
        <Link
          to="/connect-app/community/$communityId/events"
          params={{ communityId: community.communityId }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 text-[13px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <CalendarDays aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.community.events")}
        </Link>
        <Link
          to="/connect-app/community/$communityId/opportunities"
          params={{ communityId: community.communityId }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 text-[13px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
        >
          <Briefcase aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.community.opportunities")}
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
        className="h-12 w-12 shrink-0 rounded-2xl border border-[var(--bc-mobile-border)] object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--bc-mobile-accent)]/40 bg-[var(--bc-mobile-surface-2)] text-[16px] font-semibold text-[var(--bc-mobile-accent)]"
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
          className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3.5"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--bc-mobile-surface-2)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
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
