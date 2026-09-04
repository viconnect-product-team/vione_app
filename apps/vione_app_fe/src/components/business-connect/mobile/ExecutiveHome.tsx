// BC-Mobile-1A/1B — Business Connect Executive Home.
//
// Home is not a dashboard. It is a quiet executive briefing: who you are,
// what deserves attention today (max 3 items), and the fastest way to
// connect (V). All data flows through useBusinessConnectHome() — a thin
// composition over LIVE backend contracts. No mocks, no KPI tiles, no
// charts, no carousels, no fake badges.
//
// BC-Mobile-1B (visual polish only — 1A runtime/data contracts frozen):
// Executive Minimal Luxury. 80–90% neutral surface, navy typography,
// champagne used only as a micro accent (V marker, unread indicator).
// Today reads as an editorial briefing (hairline dividers), not CRM cards.

import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Handshake,
  MapPin,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { HomeNotificationsMenu } from "./HomeNotificationsMenu";
import { hasTKey, useFmt, useLang, useT, type TKey } from "@/lib/i18n";
import { getVNTimeGreeting } from "@/lib/utils";
import {
  getGreetingDaypart,
  useBusinessConnectHome,
  type BcMobileHomeIdentity,
  type BcMobileTodayItem,
} from "@/hooks/use-business-connect-home";
import { useTodayRelationshipRecommendations } from "@/hooks/use-relationship-intelligence";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { useMyIdentity } from "@/hooks/use-my-identity";
import { useVSheet } from "@/hooks/use-v-sheet";
import { useTodayPreferences } from "@/hooks/use-today-preferences";
import {
  applyTodayPreferences,
  isDefaultTodayPreferences,
} from "@/lib/business-connect/mobile/today-preferences";

import { useQuery } from "@tanstack/react-query";
import { fetchNestApi } from "@/lib/api-client";
import { useMyCommunities } from "@/hooks/use-community";
import { RelationshipSuggestions } from "./RelationshipSuggestions";
import { ViOneLogo } from "./ViOneLogo";
import { QuickMeetIcon, QuickScanIcon, QuickCardIcon } from "./NavIcons";
import { TodayCustomizeSheet } from "./TodayCustomizeSheet";
import { TodayItem } from "./TodayItem";
import { VIconMark } from "./VIconMark";

export type CrmEvent = {
  id: string;
  title?: string | null;
  name?: string | null;
  date?: string | null;
  startDate?: string | null;
  start_date?: string | null;
  location?: string | null;
  venue?: string | null;
  status?: string | null;
  associationId?: string | null;
  associationName?: string | null;
  communityName?: string | null;
  associationLogo?: string | null;
};

export const getEventDate = (ev: CrmEvent): Date | null => {
  const d = ev.date || ev.startDate || ev.start_date;
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
};

export const isEventToday = (ev: CrmEvent): boolean => {
  const dt = getEventDate(ev);
  if (!dt) return false;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return dt >= todayStart && dt <= todayEnd;
};

export function ExecutiveHome() {
  const t = useT();
  const { openV } = useVSheet();
  const home = useBusinessConnectHome();
  const data = home.data;

  // Tuỳ chỉnh thẻ HÔM NAY — chỉ lọc/sắp xếp dữ liệu đã được cấp quyền.
  const { prefs, update, reset } = useTodayPreferences();
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Kéo cả CRM events để đảm bảo dual-source cho sự kiện hôm nay
  const { data: crmEventsData } = useQuery<any>({
    queryKey: ["crm-events-home"],
    staleTime: 5 * 60_000,
    queryFn: () => fetchNestApi("/events?limit=10"),
  });

  const crmList: CrmEvent[] = Array.isArray(crmEventsData)
    ? crmEventsData
    : ((crmEventsData as any)?.data ?? (crmEventsData as any)?.items ?? []);

  const crmTodayItems: BcMobileTodayItem[] = crmList
    .filter((ev) => isEventToday(ev))
    .map((ev) => {
      const dt = getEventDate(ev);
      return {
        id: `event:${ev.id}`,
        kind: "meeting" as const,
        category: "upcoming" as const,
        urgency: "high" as const,
        titleKey: ev.title || ev.name || "Sự kiện hôm nay",
        descriptionKey: ev.location || ev.venue || "Sự kiện cộng đồng",
        counterpartDisplayName: ev.associationName || ev.communityName || "Cộng đồng",
        startsAt: dt ? dt.toISOString() : null,
        dueAt: null,
        action: {
          labelKey: "bc.workHub.action.view",
          targetRoute: "/events/$eventId",
          targetParams: { eventId: String(ev.id) },
          targetSearch: null,
          canRoute: true,
        },
      };
    });

  const rawPool = data?.today.pool ?? data?.today.items ?? [];
  const mergedPool = [...rawPool];
  for (const crmItem of crmTodayItems) {
    if (!mergedPool.some((p) => p.id === crmItem.id || (p.titleKey && p.titleKey === crmItem.titleKey))) {
      mergedPool.unshift(crmItem);
    }
  }

  const todayPool = mergedPool;
  const todayItems = applyTodayPreferences(todayPool, prefs);
  const customized = !isDefaultTodayPreferences(prefs);

  const unread = data?.unreadNotificationCount ?? null;

  return (
    <>
      {/* Sticky Header thương hiệu chung */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#D8B282]/20 bg-[#050c15]/90 backdrop-blur-md px-5 py-3 -mx-4">
        <div className="relative inline-flex flex-none flex-col items-start gap-1">
          <ViOneLogo className="h-5 w-[77px]" />
          <p className="relative -mt-px flex w-fit items-center whitespace-nowrap font-['Inter-Light',Helvetica] text-xs font-light leading-4 tracking-[0] text-[#D4C3A3]">
            {getVNTimeGreeting()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HomeNotificationsMenu unreadCount={unread} />
        </div>
      </header>

      <div aria-hidden="true" style={{ paddingTop: "var(--bc-mobile-safe-top-compact)" }} />

      <main id="bc-mobile-home" className="contents">
        {home.isPending || (!data && !home.isError) ? (
          <HomeSkeleton />
        ) : home.isError || !data ? (
          <HomeCoreError onRetry={() => home.refetch()} />
        ) : (
          <div className="bc-home-enter">
            <Greeting identity={data.identity} />

            <section
              aria-labelledby="bc-home-today"
              className="relative mt-6 overflow-hidden rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(150deg,rgba(20,32,50,0.3)_0%,rgba(12,21,34,0.15)_50%,rgba(6,13,22,0.3)_100%)] backdrop-blur-md p-4 transition-all hover:border-[#D8B282]/40"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#D8B282]/30 bg-[#0c1522]/60 text-[#D8B282]"
                  >
                    <CalendarDays className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </span>

                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[#94A3B8] leading-[15px]">
                      {t("bc.mobile.home.today.label")}
                    </div>
                    <h2
                      id="bc-home-today"
                      className="mt-0.5 truncate text-[16px] font-bold text-[#f2efe9] leading-6"
                    >
                      <TodayDate />
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomizeOpen(true)}
                    aria-label={t("bc.mobile.home.today.customize.open")}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#94A3B8] transition-colors hover:text-[#f5f7fa] hover:bg-[#ffffff0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                  </button>

                  <Link
                    to="/connect-app/calendar"
                    className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#CBD5E1] transition-colors hover:text-white focus-visible:outline-none"
                  >
                    {t("bc.mobile.home.today.viewCalendar")}
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
                  </Link>
                </div>
              </div>
              {customized ? (
                <p className="mt-2 text-[12px] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.home.today.customize.active")}
                </p>
              ) : null}

              {data.today.status === "error" ? (
                <TodayError onRetry={() => home.refetch()} />
              ) : todayPool.length === 0 ? (
                <TodayEmpty onOpenV={openV} />
              ) : todayItems.length === 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="text-[13px] text-[var(--bc-mobile-muted)]">
                    {t("bc.mobile.home.today.customize.empty")}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex min-h-[44px] items-center rounded-lg px-2 text-[13px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
                  >
                    {t("bc.mobile.home.today.customize.reset")}
                  </button>
                </div>
              ) : (
                <>
                  <ul className="mt-5 space-y-5 border-l border-[var(--bc-mobile-border-gold)] pl-4">
                    {todayItems.map((item) => (
                      <TodayTimelineRow key={item.id} item={item} />
                    ))}
                  </ul>
                  <TodayPrimaryAction items={todayItems} onOpenV={openV} />
                </>
              )}
            </section>

            <InsightCard />

            {/* Sự kiện sắp tới từ CRM — kéo dữ liệu thật từ /api/events */}
            <UpcomingEventsCard />

            <QuickActions />

            {/* BC-Mobile-6A — calm intelligence: own query, never blocks Home. */}
            <RelationshipSuggestions />

            <TodayCustomizeSheet
              open={customizeOpen}
              onOpenChange={setCustomizeOpen}
              prefs={prefs}
              onChange={update}
              onReset={reset}
            />
          </div>
        )}
      </main>
    </>
  );
}

/** Ngày hôm nay theo locale hiện hành — không hardcode chuỗi. */
function TodayDate() {
  const fmt = useFmt();
  const label = new Date().toLocaleDateString(fmt.locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return (
    <span className="capitalize">{label}</span>
  );
}

function QuickActions() {
  const t = useT();
  const items = [
    {
      to: "/connect-app/moment",
      Icon: QuickMeetIcon,
      label: t("bc.mobile.home.quick.meet"),
    },
    {
      to: "/connect-app/card-scan",
      Icon: QuickScanIcon,
      label: t("bc.mobile.home.quick.scan"),
    },
    {
      to: "/connect-app/me/card",
      Icon: QuickCardIcon,
      label: t("bc.mobile.home.quick.card"),
    },
  ];

  return (
    <section aria-label={t("bc.mobile.home.quick.title")} className="mt-5 grid grid-cols-3 gap-2">
      {items.map(({ to, Icon, label }) => (
        <Link
          key={to}
          to={to as any}
          className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(150deg,rgba(20,32,50,0.25)_0%,rgba(12,21,34,0.12)_100%)] backdrop-blur-md py-3 px-1 text-center transition-all hover:border-[#D8B282]/50 active:scale-[0.98]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#D8B282]/10 border border-[#D8B282]/20 text-[#D8B282] group-hover:border-[#D8B282] group-hover:scale-105 transition-all">
            <Icon className="h-5 w-5 text-[#D8B282]" />
          </span>
          <span className="text-[12.5px] font-medium text-[var(--bc-mobile-text)] truncate max-w-full group-hover:text-[#D8B282] transition-colors">
            {label}
          </span>
        </Link>
      ))}
    </section>
  );
}

/** Một dòng lịch trình HÔM NAY — mốc thời gian bên trái, nội dung bên phải. */
function TodayTimelineRow({ item }: { item: BcMobileTodayItem }) {
  const t = useT();
  const fmt = useFmt();
  const title = hasTKey(item.titleKey) ? t(item.titleKey as TKey) : item.titleKey;
  const time = item.startsAt
    ? new Date(item.startsAt).toLocaleTimeString(fmt.locale, {
      hour: "2-digit",
      minute: "2-digit",
    })
    : item.dueAt
      ? new Date(item.dueAt).toLocaleDateString(fmt.locale, { day: "numeric", month: "short" })
      : null;
  const subtitle = item.counterpartDisplayName;
  const detail =
    item.descriptionKey && hasTKey(item.descriptionKey)
      ? t(item.descriptionKey as TKey)
      : (item.descriptionKey ?? null);
  const canRoute = item.action.canRoute && item.action.targetRoute;

  const body = (
    <div className="flex flex-col items-start min-w-0 flex-1">
      <span
        aria-hidden="true"
        className="absolute -left-[21px] top-[6px] h-2.5 w-2.5 rounded-full bg-[var(--bc-mobile-accent)] shadow-[0_0_8px_rgba(234,154,65,0.6)]"
      />
      {time ? (
        <span className="text-[13.5px] font-semibold leading-tight tabular-nums text-[var(--bc-mobile-accent)]">
          {time}
        </span>
      ) : null}
      <span className="mt-1 block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-0.5 block truncate text-[13px] text-[var(--bc-mobile-muted)]">
          {subtitle}
        </span>
      ) : null}
      {detail ? (
        <span className="mt-1.5 flex items-center gap-1 text-[12.5px] text-[var(--bc-mobile-muted)]">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
          <span className="truncate">{detail}</span>
        </span>
      ) : null}
    </div>
  );

  return (
    <li className="relative">
      {canRoute ? (
        <Link
          to={item.action.targetRoute as any}
          params={(item.action.targetParams ?? {}) as any}
          search={(item.action.targetSearch ?? {}) as any}
          className="flex flex-col items-start w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
        >
          {body}
        </Link>
      ) : (
        <div className="flex flex-col items-start w-full">{body}</div>
      )}
    </li>
  );
}

/** CTA vàng của thẻ HÔM NAY — chỉ hiện khi có mục thật để mở. */
function TodayPrimaryAction({
  items,
  onOpenV,
}: {
  items: BcMobileTodayItem[];
  onOpenV: () => void;
}) {
  const t = useT();
  const target = items.find(
    (i) => i.kind === "meeting" && i.action.canRoute && i.action.targetRoute,
  );
  if (!target) return <VPrimaryAction onOpenV={onOpenV} />;
  return (
    <Link
      to={target.action.targetRoute as any}
      params={(target.action.targetParams ?? {}) as any}
      search={(target.action.targetSearch ?? {}) as any}
      className="mt-5 flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 py-3 border border-[#D8B282]/30 bg-white/[0.03] backdrop-blur-md transition-all hover:bg-white/[0.06] hover:border-[#D8B282]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8B282] active:scale-98"
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] p-1 shadow-[0_2px_8px_rgba(201,158,74,0.3)]"
      >
        <VIconMark size={18} />
      </span>
      <span className="font-semibold text-sm bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent text-center">
        {t("bc.mobile.home.today.join")}
      </span>
      <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#D8B282]" strokeWidth={2} />
    </Link>
  );
}

/** Insight — số cơ hội kết nối tiềm năng, lấy từ chính nguồn gợi ý 6A. */
function InsightCard() {
  const t = useT();
  const { lang } = useLang();
  const { recommendations, initialLoading, error } = useTodayRelationshipRecommendations(lang);
  if (initialLoading) return null;
  const isEmpty = Boolean(error) || recommendations.length === 0;

  const headline = isEmpty
    ? t("bc.mobile.home.insight.emptyHeadline")
    : t("bc.mobile.home.insight.headline", { count: recommendations.length });

  const parts = headline.split(/(\d+)/);

  return (
    <section
      aria-labelledby="bc-home-insight"
      className="relative mt-5 overflow-hidden rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(150deg,rgba(20,32,50,0.3)_0%,rgba(12,21,34,0.15)_50%,rgba(6,13,22,0.3)_100%)] backdrop-blur-md p-5 transition-all hover:border-[#D8B282]/40"
    >

      {/* Concentric circles SVG background at bottom right */}
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-50 z-0 translate-x-[20px] translate-y-[20px]">
        <svg width="161" height="158" viewBox="0 0 161 158" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.5">
            <rect x="0.5" y="0.5" width="232" height="232" rx="116" stroke="#D8B282" strokeOpacity="0.2" />
            <rect x="26.5" y="26.5" width="180" height="180" rx="90" stroke="#D8B282" strokeOpacity="0.4" />
            <rect x="52.5" y="52.5" width="128" height="128" rx="64" stroke="#D8B282" strokeOpacity="0.6" strokeDasharray="3 2" />
            <foreignObject x="72.5" y="72.5" width="88" height="88">
              <div
                style={{
                  backdropFilter: "blur(6px)",
                  height: "100%",
                  width: "100%",
                }}
              />
            </foreignObject>
            <g data-figma-bg-blur-radius="12">
              <rect x="84.5" y="84.5" width="64" height="64" rx="32" fill="#3C332C" fillOpacity="0.8" />
              <rect x="85" y="85" width="63" height="63" rx="31.5" stroke="#D8B282" strokeOpacity="0.3" />
              {/* Users icon inside center circle */}
              <path d="M108.25 104.5C109.656 104.531 110.734 105.156 111.484 106.375C112.172 107.625 112.172 108.875 111.484 110.125C110.734 111.344 109.656 111.969 108.25 112C106.844 111.969 105.766 111.344 105.016 110.125C104.328 108.875 104.328 107.625 105.016 106.375C105.766 105.156 106.844 104.531 108.25 104.5ZM125.5 104.5C126.906 104.531 127.984 105.156 128.734 106.375C129.422 107.625 129.422 108.875 128.734 110.125C127.984 111.344 126.906 111.969 125.5 112C124.094 111.969 123.016 111.344 122.266 110.125C121.578 108.875 121.578 107.625 122.266 106.375C123.016 105.156 124.094 104.531 125.5 104.5ZM101.5 118.516C101.531 117.078 102.016 115.891 102.953 114.953C103.891 114.016 105.078 113.531 106.516 113.5H108.484C109.234 113.5 109.938 113.656 110.594 113.969C110.531 114.312 110.5 114.656 110.5 115C110.562 116.844 111.234 118.344 112.516 119.5H102.484C101.891 119.438 101.562 119.109 101.5 118.516ZM120.484 119.5C121.766 118.344 122.438 116.844 122.5 115C122.5 114.656 122.469 114.312 122.406 113.969C123.062 113.656 123.766 113.5 124.516 113.5H126.484C127.922 113.531 129.109 114.016 130.047 114.953C130.984 115.891 131.469 117.078 131.5 118.516C131.438 119.109 131.109 119.438 130.516 119.5H120.484ZM112 115C112 114.188 112.203 113.438 112.609 112.75C113.016 112.062 113.562 111.516 114.25 111.109C114.969 110.703 115.719 110.5 116.5 110.5C117.281 110.5 118.031 110.703 118.75 111.109C119.438 111.516 119.984 112.062 120.391 112.75C120.797 113.438 121 114.188 121 115C121 115.812 120.797 116.562 120.391 117.25C119.984 117.938 119.438 118.484 118.75 118.891C118.031 119.297 117.281 119.5 116.5 119.5C115.719 119.5 114.969 119.297 114.25 118.891C113.562 118.484 113.016 117.938 112.609 117.25C112.203 116.562 112 115.812 112 115ZM107.5 127.234C107.531 125.484 108.141 124.016 109.328 122.828C110.516 121.641 111.984 121.031 113.734 121H119.266C121.016 121.031 122.484 121.641 123.672 122.828C124.859 124.016 125.469 125.484 125.5 127.234C125.438 128.016 125.016 128.438 124.234 128.5H108.766C107.984 128.438 107.562 128.016 107.5 127.234Z" fill="#D8B282" />
            </g>
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <Sparkles
          aria-hidden="true"
          className="h-4 w-4 text-[var(--bc-mobile-accent)]"
          strokeWidth={1.6}
        />
        <h2
          id="bc-home-insight"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]"
        >
          {t("bc.mobile.home.insight.label")}
        </h2>
      </div>
      <p className="relative z-10 mt-4 max-w-[17ch] text-[21px] font-bold leading-[1.3] text-[var(--bc-mobile-text)] uppercase">
        {isEmpty ? (
          t("bc.mobile.home.insight.emptyHeadline")
        ) : (
          parts.map((part, index) => 
            /^\d+$/.test(part) ? (
              <span key={index} className="text-[var(--bc-mobile-accent)] font-extrabold">{part}</span>
            ) : (
              part
            )
          )
        )}
      </p>
      <p className="relative z-10 mt-2 max-w-[22ch] text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
        {isEmpty ? t("bc.mobile.home.insight.emptyBody") : t("bc.mobile.home.insight.body")}
      </p>
      <Link
        to="/connect-app/network"
        className="relative z-10 mt-4 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-semibold text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
      >
        {isEmpty ? t("bc.mobile.home.insight.emptyCta") : t("bc.mobile.home.insight.cta")}
        <ArrowRight aria-hidden="true" className="h-4 w-4 text-[var(--bc-mobile-accent)]" strokeWidth={2} />
      </Link>
    </section>
  );
}

// ── Header affordances ───────────────────────────────────────────────────────

function initialsOf(identity: BcMobileHomeIdentity | null): string | null {
  const name = identity?.displayName ?? identity?.email ?? null;
  if (!name) return null;
  const words = name
    .trim()
    .split(/[\s@]+/)
    .filter(Boolean);
  if (words.length === 0) return null;
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || null;
}

// ── Sections ─────────────────────────────────────────────────────────────────

function Greeting({
  identity,
}: {
  identity: BcMobileHomeIdentity;
}) {
  const name = identity.displayName ?? identity.email ?? null;
  const initials = initialsOf(identity);
  const viewerUserId = useViewerUserId();
  const mine = useMyIdentity({ enabled: Boolean(viewerUserId) });
  const profileIdentity = mine.data?.identity ?? null;
  const avatarUrl = profileIdentity?.avatarUrl ?? identity.avatarUrl ?? null;
  const role = [profileIdentity?.jobTitle, profileIdentity?.companyName]
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" · ");
  const t = useT();

  return (
    <div className="relative mt-4">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--bc-mobile-accent) 35%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Row 3: User profile summary horizontally aligned */}
      <section
        className="flex w-full flex-col items-start px-0 pt-0 pb-2"
        aria-label="User profile summary"
      >
        <div className="relative flex w-full items-center gap-4 self-stretch">
          <div
            className="relative flex h-14 w-14 shrink-0 justify-center overflow-hidden rounded-full border-2 border-solid p-0.5 bg-[var(--bc-mobile-bg)]"
            style={{ borderColor: "rgba(171, 109, 60, 0.5)" }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center rounded-full bg-[var(--bc-mobile-surface)] text-[18px] font-semibold text-[var(--bc-mobile-accent)]">
                {initials ?? <User className="h-5 w-5" strokeWidth={1.6} />}
              </span>
            )}
          </div>
          <div className="relative inline-flex flex-[0_0_auto] flex-col items-start justify-center min-w-0 flex-1">
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start pb-0.5">
              <div className="relative flex w-full flex-[0_0_auto] items-center gap-2">
                <h2 className="relative flex w-fit items-center whitespace-nowrap text-lg font-semibold leading-7 tracking-[0] text-[#f2efe9]">
                  {name}
                </h2>
                <span
                  className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)" }}
                  aria-label="Verified member"
                >
                  <VIconMark size={14} />
                </span>
              </div>
            </div>
            {role ? (
              <div className="relative flex w-full flex-[0_0_auto] flex-col items-start">
                <p className="relative mt-[-1px] flex w-fit items-center whitespace-nowrap text-xs font-normal leading-4 tracking-[0] text-[#94A3B8]">
                  {role}
                </p>
              </div>
            ) : null}
            <div className="mt-2 inline-flex items-start">
              <span className="relative inline-flex flex-[0_0_auto] flex-col items-start self-stretch rounded-full border border-solid border-[#D8B282]/30 bg-[#D8B282]/10 px-3 py-0.5">
                <span className="relative flex w-fit items-center whitespace-nowrap text-[10px] font-semibold leading-[15px] tracking-[0.5px] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent">
                  EXECUTIVE MEMBER
                </span>
              </span>
            </div>
          </div>
          <div className="ml-auto shrink-0 flex items-center">
            <Link
              to="/connect-app/inbox"
              aria-label={t("bc.mobile.inbox.title")}
              className="grid h-10 w-10 place-items-center rounded-full text-[#D4C3A3] hover:bg-[#ffffff14] transition-colors border border-solid border-[#D8B282]/20 bg-[#0c1522] hover:border-[#D8B282]/60"
            >
              <MessageSquare aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * CTA chính của thẻ HÔM NAY khi chưa có cuộc họp có thể mở — giữ đúng khối
 * nút vàng full-width của thiết kế, nhưng nội dung trung thực (mở V).
 */
function VPrimaryAction({ onOpenV }: { onOpenV: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onOpenV}
      className="mt-5 flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 py-3 border border-[#D8B282]/30 bg-white/[0.03] backdrop-blur-md transition-all hover:bg-white/[0.06] hover:border-[#D8B282]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8B282] active:scale-98 cursor-pointer"
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] p-1 shadow-[0_2px_8px_rgba(201,158,74,0.3)]"
      >
        <VIconMark size={18} />
      </span>
      <span className="font-semibold text-sm bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent text-center">
        {t("bc.mobile.home.v.open")}
      </span>
      <ArrowRight className="h-4 w-4 text-[#D8B282]" strokeWidth={2} />
    </button>
  );
}

/** Small champagne V glyph — the only accent marker on Home. */
function VMarker() {
  return (
    <span
      aria-hidden="true"
      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] p-0.5 shadow-[0_1px_4px_rgba(201,158,74,0.3)]"
    >
      <VIconMark size={14} />
    </span>
  );
}

function TodayEmpty({ onOpenV }: { onOpenV: () => void }) {
  const t = useT();
  return (
    <div className="mt-8 flex flex-col items-center px-2 pb-2 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full border border-[#D8B282]/30 bg-[#0c1522] text-[#D8B282]"
      >
        <CircleCheck className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-[16px] font-semibold text-[#f5f7fa]">
        {t("bc.mobile.home.empty.title")}
      </p>
      <p className="mx-auto mt-1.5 max-w-[32ch] text-[13.5px] leading-relaxed text-[#D4C3A3]/80">
        {t("bc.mobile.home.empty.body")}
      </p>
      <button
        type="button"
        onClick={onOpenV}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2.5 rounded-xl border border-[#D8B282]/30 bg-white/[0.03] backdrop-blur-sm px-5 text-[14px] font-medium text-[#D8B282] transition-all hover:bg-white/[0.06] hover:border-[#D8B282]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D8B282] active:scale-98 cursor-pointer"
      >
        <VMarker />
        {t("bc.mobile.home.empty.cta")}
      </button>
    </div>
  );
}


function TodayError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div role="alert" className="mt-4 flex items-center justify-between gap-3 py-1">
      <p className="text-[13px] text-[var(--bc-mobile-muted)]">{t("bc.mobile.home.error.today")}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
        {t("bc.mobile.home.error.retry")}
      </button>
    </div>
  );
}

function HomeCoreError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div role="alert" className="mt-16 flex flex-col items-center px-2 text-center">
      <p className="text-[15px] font-medium text-[var(--bc-mobile-text)]">
        {t("bc.mobile.home.error.title")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <RefreshCw aria-hidden="true" className="h-4 w-4" />
        {t("bc.mobile.home.error.retry")}
      </button>
    </div>
  );
}

/** Quiet skeleton matching the final layout; shell + nav stay interactive. */
function HomeSkeleton() {
  const t = useT();
  const bar = "animate-pulse rounded bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none";
  return (
    <div role="status" aria-label={t("bc.mobile.home.loading")} aria-busy="true" className="mt-5">
      <div className={`h-3.5 w-24 ${bar}`} />
      <div className={`mt-2 h-7 w-44 ${bar}`} />
      <div className={`mt-8 h-3 w-14 ${bar}`} />
      <div className="mt-1 divide-y divide-[var(--bc-mobile-border)]">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3.5 py-4">
            <div className={`h-10 w-10 shrink-0 rounded-full ${bar}`} />
            <div className="flex-1">
              <div className={`h-4 w-3/5 ${bar}`} />
              <div className={`mt-1.5 h-3 w-2/5 ${bar}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sự kiện hôm nay & sắp tới từ CRM / Cộng đồng ──────────────────────────────────
// Kéo dữ liệu thật từ /api/events (NestJS backend).
// Hiển thị sự kiện hôm nay và sắp diễn ra, cùng thông tin cộng đồng.

function UpcomingEventsCard() {
  const { communities } = useMyCommunities();
  const activeCommunity = communities[0];

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["crm-events-home"],
    staleTime: 5 * 60_000,
    queryFn: () => fetchNestApi("/events?limit=5"),
  });

  // Chuẩn hoá: backend trả về { data: [...] } hoặc [...]
  const rawList: CrmEvent[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? (data as any)?.items ?? []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Sự kiện hôm nay hoặc tương lai
  const upcoming = rawList.filter((ev) => {
    const dt = getEventDate(ev);
    if (!dt) return true;
    return dt >= todayStart;
  });

  // Fallback hiển thị sự kiện gần nhất nếu không có sự kiện tương lai (thay vì ẩn thẻ)
  const displayList = (upcoming.length > 0 ? upcoming : rawList).slice(0, 3);
  const hasToday = displayList.some(isEventToday);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        className="mt-4 animate-pulse rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4 motion-reduce:animate-none"
      >
        <div className="h-4 w-32 rounded bg-[var(--bc-mobile-surface-2)]" />
        <div className="mt-3 space-y-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-[var(--bc-mobile-surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || displayList.length === 0) return null;

  return (
    <section
      aria-labelledby="bc-crm-events-heading"
      className="mt-5 overflow-hidden rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(150deg,rgba(20,32,50,0.3)_0%,rgba(12,21,34,0.15)_50%,rgba(6,13,22,0.3)_100%)] backdrop-blur-md transition-all hover:border-[#D8B282]/40"
    >
      <div className="flex items-center justify-between border-b border-[#D8B282]/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2
            id="bc-crm-events-heading"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#D4C3A3]"
          >
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#D8B282]" strokeWidth={2} />
            {hasToday ? "Sự kiện hôm nay & sắp tới" : "Sự kiện cộng đồng"}
          </h2>
          {hasToday && (
            <span className="inline-flex items-center rounded-md bg-[#D8B282]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D8B282] border border-[#D8B282]/30">
              Hôm nay
            </span>
          )}
        </div>
        <Link
          to="/connect-app/community"
          className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[#D8B282] bg-[#D8B282]/10 border border-[#D8B282]/20 hover:bg-[#D8B282]/20 hover:border-[#D8B282]/40 transition-all cursor-pointer"
          aria-label="Xem tất cả sự kiện"
        >
          Cộng đồng
          <ChevronRight aria-hidden="true" className="h-3 w-3 text-[#D8B282]" strokeWidth={2} />
        </Link>
      </div>

      <ul className="divide-y divide-[#D8B282]/10">

        {displayList.map((ev) => {
          const dateStr = ev.date || ev.startDate || ev.start_date;
          const dt = getEventDate(ev);
          const isToday = isEventToday(ev);
          const formattedDate = dt
            ? new Intl.DateTimeFormat("vi-VN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(dt)
            : dateStr ?? null;
          const location = ev.location || ev.venue || null;
          const title = ev.title || ev.name || "Sự kiện";
          const community = ev.communityName || ev.associationName || activeCommunity?.name || null;

          return (
            <li key={ev.id} className="group relative px-4 py-3 hover:bg-white/[0.02] transition-colors">
              <Link
                to="/events/$eventId"
                params={{ eventId: ev.id }}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold leading-snug text-[var(--bc-mobile-text)] group-hover:text-[#D8B282] transition-colors">
                    {title}
                  </p>
                  {isToday && (
                    <span className="shrink-0 rounded-md bg-[#D8B282]/20 border border-[#D8B282]/40 px-1.5 py-0.5 text-[10px] font-bold text-[#D8B282]">
                      Hôm nay
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--bc-mobile-muted)]">
                  {formattedDate && (
                    <span className={`flex items-center gap-1 ${isToday ? 'text-[#D8B282] font-medium' : ''}`}>
                      <CalendarDays aria-hidden="true" className="h-3 w-3 shrink-0 text-[#D8B282]" strokeWidth={1.8} />
                      {formattedDate}
                    </span>
                  )}
                  {location && (
                    <span className="flex min-w-0 items-center gap-1">
                      <MapPin aria-hidden="true" className="h-3 w-3 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
                      <span className="truncate">{location}</span>
                    </span>
                  )}
                  {community && (
                    <span className="flex min-w-0 items-center gap-1 rounded bg-white/[0.04] border border-white/10 px-1.5 py-0.5 text-[11px] text-[#CBD5E1]">
                      <Users aria-hidden="true" className="h-3 w-3 shrink-0 text-[#D8B282]" strokeWidth={1.8} />
                      <span className="truncate">{community}</span>
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
