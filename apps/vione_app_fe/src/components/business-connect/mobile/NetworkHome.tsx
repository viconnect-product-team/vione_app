// BC-Mobile-2B — Network screen (Executive Minimal Luxury, ViOne).
//
// Cấu trúc theo thiết kế đã duyệt: tiêu đề + số liệu quan hệ, ô tìm kiếm luôn
// hiển thị kèm bộ lọc, dải "AI Match" (gợi ý quan hệ 6A), danh sách "Cần giữ
// kết nối", dải tròn "Gặp gần đây" và dòng "Khoảnh khắc gần đây".
// Chỉ thay lớp trình bày — mọi dữ liệu vẫn đi qua các hợp đồng 2A/6A/7E.

import { Link } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Smile,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, useId } from "react";
import { useFmt, useLang, useT } from "@/lib/i18n";
import { getVNTimeGreeting } from "@/lib/utils";
import icon from "./icon.svg";
import { MobileSearchBar } from "./MobileSearchBar";
import image from "./image.svg";
import { ViOneLogo } from "./ViOneLogo";
import {
  useBusinessConnectNetwork,
  type BcMobileNetworkPerson,
} from "@/hooks/use-business-connect-network";
import { useBusinessConnectHome } from "@/hooks/use-business-connect-home";
import { useTodayRelationshipRecommendations } from "@/hooks/use-relationship-intelligence";
import { useIncomingConnectionRequests } from "@/hooks/use-network-requests";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { toast } from "sonner";
import { useVSheet } from "@/hooks/use-v-sheet";
import { useNetworkFeed } from "@/hooks/use-network-feed";
import { useUnreadDmCount } from "@/hooks/use-bc-dm";
import { avatarOrDemo, demoAvatar } from "@/lib/business-connect/mobile/demo-avatars";
import { BusinessConnectTopBar } from "./BusinessConnectTopBar";
import { NetworkFeedCard } from "./NetworkFeedCard";
import { NetworkPersonRow } from "./NetworkPersonRow";
import { AiMatchConnectAction, AiMatchDetailSheet } from "./AiMatchDetailSheet";
import { CustomersPanel } from "./customers/CustomersPanel";
import { HomeNotificationsMenu } from "./HomeNotificationsMenu";

type NetworkSort = "recent" | "name" | "company";
type NetworkFilter = "all" | "connected" | "saved_card" | "card_scanned" | "contact_shared";

const FILTERS: NetworkFilter[] = [
  "all",
  "connected",
  "saved_card",
  "card_scanned",
  "contact_shared",
];

const FILTER_TKEY = {
  all: "bc.mobile.network.filter.all",
  connected: "bc.mobile.network.tag.connected",
  saved_card: "bc.mobile.network.tag.saved",
  card_scanned: "bc.mobile.network.tag.scanned",
  contact_shared: "bc.mobile.network.tag.shared",
} as const;

const tabs = [
  { id: "network", label: "Mạng lưới" },
  { id: "customers", label: "Khách hàng" },
  { id: "suggestions", label: "Gợi ý (AI)" },
];

export function NetworkHome() {
  const t = useT();
  const searchId = useId();
  const { lang } = useLang();
  const { openV } = useVSheet();
  const viewerUserId = useViewerUserId();
  const [tab, setTab] = useState<"network" | "customers" | "suggestions">("network");
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<NetworkSort>("recent");
  const [filter, setFilter] = useState<NetworkFilter>("all");
  const [sortOpen, setSortOpen] = useState(false);
  const network = useBusinessConnectNetwork(term);
  const { recommendations } = useTodayRelationshipRecommendations(lang);
  const clearSearch = () => setTerm("");
  const filtering = filter !== "all";
  const narrowed = network.searching || filtering;

  const people = useMemo(() => {
    const list = network.people.filter((p) => filter === "all" || p.context?.kind === filter);
    if (sort === "name") {
      return list.sort((a, b) => (a.displayName ?? "").localeCompare(b.displayName ?? "", "vi"));
    }
    if (sort === "company") {
      return list.sort((a, b) => (a.companyName ?? "").localeCompare(b.companyName ?? "", "vi"));
    }
    return list.sort((a, b) => {
      const av = a.context?.at ? new Date(a.context.at).getTime() : 0;
      const bv = b.context?.at ? new Date(b.context.at).getTime() : 0;
      return bv - av;
    });
  }, [network.people, sort, filter]);

  const recent = useMemo(
    () =>
      [...network.people]
        .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
        .slice(0, 8),
    [network.people],
  );

  // BC-Mobile-7E — dòng cuộc gặp (khoảnh khắc chính chủ) làm nội dung feed.
  const feed = useNetworkFeed();
  const peopleById = useMemo(
    () => new Map(network.people.map((p) => [p.personId, p])),
    [network.people],
  );
  const showFeed = !narrowed && feed.items.length > 0;
  // Khi tìm kiếm/lọc: hai panel gợi ý chỉ hiển thị người thuộc kết quả hiện tại.
  const allowedIds = useMemo(
    () => (narrowed ? new Set(people.map((p) => p.personId)) : null),
    [narrowed, people],
  );



  const home = useBusinessConnectHome();
  const unread = home.data?.unreadNotificationCount ?? null;
  const unreadDmCount = useUnreadDmCount();

  return (
    <>
      {/* Sticky Header thương hiệu chung */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)]/95 backdrop-blur-md px-5 -mx-4"
        style={{
          paddingTop: "var(--bc-mobile-safe-top-compact)",
          minHeight: "calc(var(--bc-mobile-safe-top-compact) + var(--bc-mobile-header-h))",
        }}
      >
        <div className="relative inline-flex flex-none flex-col items-start gap-0.5 py-1.5">
          <ViOneLogo className="h-5 w-[77px]" />
          <p className="relative -mt-px flex w-fit items-center whitespace-nowrap font-['Inter-Light',Helvetica] text-xs font-medium leading-4 tracking-[0] text-[var(--bc-mobile-muted)]">
            {getVNTimeGreeting()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/connect-app/inbox"
            aria-label="Tin nhắn"
            className="relative grid place-items-center rounded-full p-1 text-[var(--bc-mobile-muted)] transition-colors hover:bg-black/5 dark:hover:bg-[#ffffff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B282]"
          >
            <MessageSquare className="h-5 w-5 text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]" strokeWidth={1.8} />
            {unreadDmCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-solid border-[var(--bc-mobile-surface)] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] font-['Inter-Bold',Helvetica] text-[9.5px] font-bold leading-none text-[#050c15]">
                {unreadDmCount}
              </span>
            ) : null}
          </Link>
          <HomeNotificationsMenu unreadCount={unread} />
        </div>
      </header>

      <main id="bc-mobile-network" className="contents">

        <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <h1
              id="network-heading"
              className="relative flex items-center mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-bold text-[var(--bc-mobile-text,#0F172A)] text-2xl tracking-[0] leading-8"
            >
              Network
            </h1>
            <Link
              to="/connect-app/card-scan"
              aria-label={t("bc.mobile.network.addPerson")}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--bc-mobile-accent)] hover:bg-[var(--bc-mobile-surface-2)] transition-colors border border-solid border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] hover:border-[var(--bc-mobile-accent)]"
            >
              <UserPlus className="h-4.5 w-4.5" strokeWidth={1.8} />
            </Link>
          </div>
          <p className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto] mt-[-0.5px]">
            <span className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-medium text-[var(--bc-mobile-muted,#64748B)] text-xs tracking-[0] leading-4 whitespace-nowrap">
              {network.people.length} kết nối
            </span>
            <span
              className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-medium text-[var(--bc-mobile-muted,#64748B)] text-xs tracking-[0] leading-4 whitespace-nowrap"
              aria-hidden="true"
            >
              •
            </span>
            <span className="mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-semibold bg-[linear-gradient(135deg,#DFB876_0%,#B8860B_45%,#966A06_70%,#6E4D00_100%)] dark:bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] bg-clip-text text-transparent text-xs leading-4 relative flex items-center w-fit tracking-[0] whitespace-nowrap">
              {recommendations.length} cần chăm sóc
            </span>
          </p>
        </header>

        {/* A2 — Tab categories cuộn ngang */}
        <nav
          className="mt-4 flex items-start gap-2 px-0 py-1 relative self-stretch w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Network categories"
        >
          {tabs.map((tabItem) => {
            const isActive = tab === tabItem.id;

            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setTab(tabItem.id as any)}
                aria-pressed={isActive}
                className={`all-unset box-border inline-flex h-[34px] px-4 rounded-full border items-center justify-center relative border-solid transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15] border-transparent shadow-[0_2px_10px_rgba(201,158,74,0.35)]"
                    : "bg-[var(--bc-mobile-surface-2)] border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted,#64748B)] hover:border-[var(--bc-mobile-accent)] hover:text-[var(--bc-mobile-text)]"
                }`}
              >
                <span
                  className={`[font-family:'Inter-Medium',Helvetica] text-xs text-center leading-4 relative flex items-center w-fit tracking-[0] whitespace-nowrap font-medium ${
                    isActive ? "text-[#050c15] font-bold" : "text-[var(--bc-mobile-muted,#64748B)]"
                  }`}
                >
                  {tabItem.label}
                </span>
              </button>
            );
          })}
        </nav>

        {tab === "customers" ? (
          <CustomersPanel />
        ) : (
        <>

        {/* B — Ô tìm kiếm + bộ lọc */}
        <form
          className="mt-4 flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <MobileSearchBar
            id="bc-network-search"
            value={term}
            onChange={setTerm}
            placeholder={t("bc.mobile.network.search.placeholder")}
          />
          <div className="relative shrink-0">
            <button
              className="flex w-[42px] h-[42px] items-center justify-center p-2.5 relative bg-[var(--bc-mobile-surface-2)] backdrop-blur-md rounded-lg border border-solid border-[var(--bc-mobile-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bc-mobile-accent)] hover:border-[var(--bc-mobile-accent)] transition-colors"
              type="button"
              aria-label={t("bc.mobile.network.filter")}
              aria-pressed={sortOpen}
              onClick={() => setSortOpen((active) => !active)}
            >
              <SlidersHorizontal className="h-4 w-4 text-[var(--bc-mobile-muted)]" aria-hidden="true" strokeWidth={1.8} />
            </button>
            {sortOpen ? (
              <div className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] backdrop-blur-xl py-1 shadow-2xl">
                <p className="px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.network.sort.label")}
                </p>
                <ul>
                  {(["recent", "name", "company"] as const).map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => setSort(option)}
                        aria-current={sort === option}
                        className={`flex min-h-[44px] w-full items-center px-3.5 text-left text-[14px] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${
                          sort === option
                            ? "text-[var(--bc-mobile-accent)]"
                            : "text-[var(--bc-mobile-text)]"
                        }`}
                      >
                        {t(`bc.mobile.network.sort.${option}` as const)}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-[var(--bc-mobile-border)] px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.network.filter")}
                </p>
                <ul>
                  {FILTERS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => {
                          setFilter(option);
                          setSortOpen(false);
                        }}
                        aria-current={filter === option}
                        className={`flex min-h-[44px] w-full items-center px-3.5 text-left text-[14px] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${
                          filter === option
                            ? "text-[var(--bc-mobile-accent)]"
                            : "text-[var(--bc-mobile-text)]"
                        }`}
                      >
                        {t(FILTER_TKEY[option])}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </form>

        {network.initialLoading ? (
          <NetworkSkeleton />
        ) : network.coreError ? (
          <NetworkError onRetry={network.retry} />
        ) : people.length === 0 ? (
          network.searching ? (
            <NetworkSearchEmpty onClear={clearSearch} />
          ) : filtering ? (
            <NetworkFilterEmpty onReset={() => setFilter("all")} />
          ) : (
            <NetworkEmpty onOpenV={openV} />
          )
        ) : (
          <>
            {/* Lời mời kết bạn đang chờ phản hồi */}
            {!narrowed && tab === "network" && <NetworkIncomingRequestsSection />}

            {/* AI Match và Nurture List - Chỉ hiển thị khi tab là network hoặc suggestions */}
            {(tab === "network" || tab === "suggestions") && (
              <>
                <NetworkAiMatchStrip
                  peopleById={peopleById}
                  allowedIds={allowedIds}
                  onViewAll={() => setTab("suggestions")}
                />
                <NetworkNurtureList
                  allowedIds={allowedIds}
                  onViewAll={() => setTab("suggestions")}
                />
              </>
            )}

            {/* Gặp gần đây và Feed cuộc gặp - Chỉ hiển thị khi tab là network */}
            {tab === "network" && (
              <>
                {!narrowed && recent.length > 0 ? (
                  <NetworkRecentStrip
                    people={recent}
                    onViewAll={() => {
                      setTab("network");
                      setFilter("all");
                    }}
                  />
                ) : null}

                {/* Ghi khoảnh khắc nhanh: Bạn vừa gặp ai? */}
                {!narrowed ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3.5 shadow-md">
                    <Link
                      to="/connect-app/moment"
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)] shadow-sm"
                      >
                        <Sparkles className="h-5 w-5 text-[var(--bc-mobile-accent)]" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15.5px] font-semibold text-[var(--bc-mobile-accent)]">
                          {t("bc.mobile.network.compose.title")}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
                          {t("bc.mobile.network.compose.subtitle")}
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/connect-app/card-scan"
                      aria-label={t("bc.mobile.network.compose.scan")}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
                    >
                      <Camera className="h-[21px] w-[21px]" strokeWidth={1.7} />
                    </Link>
                  </div>
                ) : null}

                {/* Danh sách người trong Network */}
                <section className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="min-w-0 truncate text-[10px] font-medium tracking-[1px] uppercase text-[var(--bc-mobile-muted)]">
                      {t("bc.mobile.network.people")}
                    </h2>
                    {narrowed ? (
                      <p
                        aria-live="polite"
                        className="shrink-0 text-[12.5px] text-[var(--bc-mobile-muted)]"
                      >
                        {t("bc.mobile.network.results", { count: people.length })}
                        {filtering ? ` · ${t(FILTER_TKEY[filter])}` : ""}
                      </p>
                    ) : null}
                  </div>

                  {people.length === 0 ? (
                    <NetworkFilterEmpty onReset={() => setFilter("all")} />
                  ) : (
                    <ul
                      aria-label={t("bc.mobile.network.list.label")}
                      aria-busy={network.isLoadingMore}
                      className="space-y-2.5"
                    >
                      {people.map((person) => (
                        <NetworkPersonRow key={person.personId} person={person} />
                      ))}
                    </ul>
                  )}
                </section>

                {/* Khoảnh khắc mạng lưới khi không tìm kiếm */}
                {!narrowed && feed.items.length > 0 ? (
                  <section className="mt-8">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="min-w-0 truncate text-[10px] font-medium tracking-[1px] uppercase text-[var(--bc-mobile-muted)]">
                        {t("bc.mobile.network.moments.title")}
                      </h2>
                    </div>
                    <ul
                      aria-label={t("bc.mobile.network.moments.title")}
                      aria-busy={feed.isLoadingMore}
                      className="space-y-3"
                    >
                      {feed.items.map((item) => (
                        <NetworkFeedCard
                          key={item.momentId}
                          item={item}
                          person={peopleById.get(item.personId) ?? null}
                        />
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            )}

            {network.hasMore ? (
              <div className="mt-2 flex min-h-[52px] items-center justify-center">
                <button
                  type="button"
                  onClick={network.loadMore}
                  disabled={network.isLoadingMore}
                  className="inline-flex min-h-[44px] items-center rounded-lg px-4 text-[14px] font-medium text-[var(--bc-mobile-muted)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] disabled:opacity-60 motion-reduce:transition-none"
                >
                  {network.isLoadingMore
                    ? t("bc.mobile.network.loadingMore")
                    : t("bc.mobile.network.loadMore")}
                </button>
              </div>
            ) : null}
          </>
        )}
        </>
        )}
      </main>

    </>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

/** Dải ngang gợi ý quan hệ 6A ("AI Match"). */
function NetworkAiMatchStrip({
  peopleById,
  allowedIds,
  onViewAll,
}: {
  peopleById: Map<string, BcMobileNetworkPerson>;
  allowedIds: Set<string> | null;
  onViewAll?: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const all = useTodayRelationshipRecommendations(lang).recommendations;
  const recommendations = allowedIds
    ? all.filter((r) => allowedIds.has(r.person.personId))
    : all;

  const [openId, setOpenId] = useState<string | null>(null);
  const active = recommendations.find((r) => r.id === openId) ?? null;

  const targetFor = (personId: string) => {
    const person = peopleById.get(personId);
    return {
      cardSlug: person?.cardSlug ?? null,
      alreadyConnected: person?.relationshipKind === "connection",
    };
  };
  if (recommendations.length === 0) return null;

  return (
    <section aria-label={t("bc.mobile.network.aimatch.title")} className="mt-5">
      <div className="flex items-center justify-between w-full gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--bc-mobile-accent,#B8860B)]">
          <Sparkles
            aria-hidden="true"
            className="h-[13px] w-[13px] shrink-0 text-[var(--bc-mobile-accent)] fill-current"
          />
          <span className="truncate leading-5 text-[var(--bc-mobile-text,#0F172A)]">{t("bc.mobile.network.aimatch.title")}</span>
        </h2>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)] hover:border-[var(--bc-mobile-accent)] transition-all cursor-pointer shrink-0"
          >
            {t("bc.mobile.network.recent.viewAll")}
            <ChevronRight aria-hidden="true" className="h-3 w-3 text-[var(--bc-mobile-accent)]" />
          </button>
        ) : null}
      </div>

      <ul className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recommendations.map((rec) => {
          const name = rec.person.displayName ?? t("bc.mobile.network.unknownPerson");
          const roleLine = [rec.person.headline, rec.person.companyName]
            .filter(Boolean)
            .join(" · ");
          const daysText = rec.reason.days > 0 
            ? `${rec.reason.days} ngày từ lần gặp...`
            : "Gặp gần đây...";

          return (
            <li key={rec.id} className="w-[169px] h-[93px] shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setOpenId(rec.id)}
                className="relative flex flex-col items-start justify-between w-[169px] h-[93px] bg-[var(--bc-mobile-surface,#FFFFFF)] dark:bg-[var(--bc-mobile-surface,#070b14)] backdrop-blur-md rounded-xl p-3 border border-solid border-[var(--bc-mobile-border)] hover:border-[var(--bc-mobile-accent)] text-left transition-colors box-border shadow-xs"
              >
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={avatarOrDemo(rec.person.avatarUrl, rec.person.personId)}
                    alt={name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover border border-solid border-[var(--bc-mobile-border)] shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1 gap-0">
                    <span className="font-semibold text-sm text-[var(--bc-mobile-text,#0F172A)] leading-5 truncate">
                      {name}
                    </span>
                    <span className="font-normal text-[10px] text-[var(--bc-mobile-muted,#64748B)] leading-[15px] truncate">
                      {roleLine}
                    </span>
                  </div>
                </div>
                <div className="pt-1 w-full">
                  <span className="font-medium text-[10px] text-[var(--bc-mobile-accent)] leading-[15px] block truncate">
                    {daysText}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <AiMatchDetailSheet
        open={active !== null}
        onOpenChange={(next: boolean) => setOpenId(next ? openId : null)}
        rec={active}
        target={active ? targetFor(active.person.personId) : { cardSlug: null, alreadyConnected: false }}
      />
    </section>
  );
}


/** "Cần giữ kết nối" — danh sách quan hệ đã lâu chưa liên hệ (6A). */
function NetworkNurtureList({
  allowedIds,
  onViewAll,
}: {
  allowedIds: Set<string> | null;
  onViewAll?: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const all = useTodayRelationshipRecommendations(lang).recommendations;
  const recommendations = allowedIds
    ? all.filter((r) => allowedIds.has(r.person.personId))
    : all;

  // Lọc trùng theo personId để đảm bảo danh sách hiển thị đa dạng, chất lượng hơn
  const uniqueItems: typeof recommendations = [];
  const seenIds = new Set<string>();
  for (const rec of recommendations) {
    if (rec.reason.days > 0 && !seenIds.has(rec.person.personId)) {
      seenIds.add(rec.person.personId);
      uniqueItems.push(rec);
    }
  }
  const items = uniqueItems.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-label={t("bc.mobile.network.nurture.title")} className="mt-5">
      <div className="flex items-center justify-between w-full gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--bc-mobile-text,#0F172A)]">
          <Bell aria-hidden="true" className="h-[12px] w-[10px] shrink-0 text-[var(--bc-mobile-accent)]" />
          <span className="truncate leading-5">
            {t("bc.mobile.network.nurture.title")} ({recommendations.length})
          </span>
        </h2>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)] hover:border-[var(--bc-mobile-accent)] transition-all cursor-pointer shrink-0"
          >
            {t("bc.mobile.network.recent.viewAll")}
            <ChevronRight aria-hidden="true" className="h-3 w-3 text-[var(--bc-mobile-accent)]" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col w-full bg-[var(--bc-mobile-surface)] backdrop-blur-md rounded-xl border border-solid border-[var(--bc-mobile-border)] overflow-hidden box-border shadow-xs">
        {items.map((rec, index) => {
          const name = rec.person.displayName ?? t("bc.mobile.network.unknownPerson");
          const roleLine = [rec.person.headline, rec.person.companyName]
            .filter(Boolean)
            .join(" · ");
          const daysText = rec.reason.days > 0 
            ? `${rec.reason.days} ngày chưa liên hệ`
            : "Chưa liên hệ...";

          return (
            <Link
              key={rec.id}
              to="/connect-app/network/$personId"
              params={{ personId: rec.person.personId }}
              aria-label={`${t("bc.mobile.network.nurture.title")}: ${name}`}
              className={`flex items-center justify-between gap-3 p-3 hover:bg-[var(--bc-mobile-surface-2)] transition-colors ${
                index !== items.length - 1 ? "border-b border-solid border-[var(--bc-mobile-border)]" : ""
              }`}
            >
              <img
                src={avatarOrDemo(rec.person.avatarUrl, rec.person.personId)}
                alt={name}
                loading="lazy"
                className="w-9 h-9 rounded-full object-cover border border-solid border-[var(--bc-mobile-border)] shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <span className="font-semibold text-sm text-[var(--bc-mobile-text,#0F172A)] truncate">
                  {name}
                </span>
                <span className="font-normal text-[11px] text-[var(--bc-mobile-muted,#64748B)] truncate">
                  {roleLine}
                </span>
                <span className="font-medium text-[10px] text-[var(--bc-mobile-accent)] mt-0.5 block truncate">
                  {daysText}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--bc-mobile-muted)] shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * "GẶP GẦN ĐÂY" — dải ngang ảnh tròn theo thứ tự thời gian gặp gần nhất.
 * Cùng nguồn dữ liệu chuẩn, không có nguồn song song, không suy đoán hiện diện.
 */
function NetworkRecentStrip({
  people,
  onViewAll,
}: {
  people: BcMobileNetworkPerson[];
  onViewAll?: () => void;
}) {
  const t = useT();
  return (
    <section aria-label={t("bc.mobile.network.recent.title")} className="mt-5">
      <div className="flex items-center justify-between w-full gap-2">
        <h2 className="text-[10px] font-medium tracking-[1px] uppercase text-[var(--bc-mobile-muted,#64748B)]">
          {t("bc.mobile.network.recent.title")}
        </h2>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)] hover:border-[var(--bc-mobile-accent)] transition-all cursor-pointer shrink-0"
          >
            {t("bc.mobile.network.recent.viewAll")}
            <ChevronRight aria-hidden="true" className="h-3 w-3 text-[var(--bc-mobile-accent)]" />
          </button>
        ) : null}
      </div>
      <ul className="mt-3 flex snap-x gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {people.map((person, index) => {
          const name = person.displayName ?? t("bc.mobile.network.unknownPerson");
          const isFirst = index === 0;

          return (
            <li key={person.personId} className="min-w-[86px] max-w-[100px] shrink-0 snap-start flex flex-col items-center">
              <Link
                to="/connect-app/network/$personId"
                params={{ personId: person.personId }}
                aria-label={`${t("bc.mobile.network.recent.title")}: ${name}`}
                className="w-full flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] rounded-xl"
              >
                <div
                  className={`w-12 h-12 rounded-full p-[2px] flex items-center justify-center box-border ${
                    isFirst
                      ? "border border-solid border-[var(--bc-mobile-accent)]"
                      : "border border-solid border-[var(--bc-mobile-border)]"
                  }`}
                >
                  <img
                    src={avatarOrDemo(person.avatarUrl, person.personId)}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = demoAvatar(person.personId);
                    }}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="font-medium text-xs text-[var(--bc-mobile-text,#0F172A)] mt-2 block truncate max-w-full text-center">
                  {name}
                </span>
                <span className="font-light text-[10px] text-[var(--bc-mobile-muted,#64748B)] block truncate max-w-full text-center">
                  {person.headline ?? person.companyName ?? ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Notifications entry — badge appears only from a real unread count. */
function NetworkNotificationsButton() {
  const t = useT();
  const { data } = useBusinessConnectHome();
  const unread = data?.unreadNotificationCount ?? null;
  const hasUnread = typeof unread === "number" && unread > 0;
  return (
    <Link
      to="/connect-app/notifications"
      aria-label={
        hasUnread
          ? t("bc.mobile.network.notif.unreadLabel", { count: String(unread) })
          : t("bc.mobile.network.notif.label")
      }
      className="relative grid place-items-center rounded-full text-[var(--bc-mobile-muted)] transition-colors hover:bg-black/5 dark:hover:bg-[#ffffff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
    >
      <Bell aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      {hasUnread ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-solid border-[var(--bc-mobile-surface)] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] font-['Inter-Bold',Helvetica] text-[9.5px] font-bold leading-none text-[#2c1600]">
          {unread}
        </span>
      ) : null}
    </Link>
  );
}

/** Quiet skeleton mirroring the final row layout; shell + search stay put. */
function NetworkSkeleton() {
  const t = useT();
  const bar = "animate-pulse rounded bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none";
  return (
    <div
      role="status"
      aria-label={t("bc.mobile.network.loading")}
      aria-busy="true"
      className="mt-6"
    >
      <div className="space-y-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex min-h-[84px] items-center gap-3.5 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-3.5 py-3.5"
          >
            <div className={`h-12 w-12 shrink-0 rounded-full ${bar}`} />
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

function NetworkError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div role="alert" className="mt-16 flex flex-col items-center px-2 text-center">
      <p className="text-[15px] font-medium text-[var(--bc-mobile-text)]">
        {t("bc.mobile.network.error")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <RefreshCw aria-hidden="true" className="h-4 w-4" />
        {t("bc.mobile.network.retry")}
      </button>
    </div>
  );
}

function NetworkEmpty({ onOpenV }: { onOpenV: () => void }) {
  const t = useT();
  return (
    <div className="mt-16 flex flex-col items-center px-2 pb-4 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)]"
      >
        <Users className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-[16px] font-medium text-[var(--bc-mobile-text)]">
        {t("bc.mobile.network.empty.title")}
      </p>
      <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.network.empty.body")}
      </p>
      <button
        type="button"
        onClick={onOpenV}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2.5 rounded-lg px-2 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-accent)] text-[11px] font-semibold leading-none text-[var(--bc-mobile-accent)]"
        >
          V
        </span>
        {t("bc.mobile.network.empty.cta")}
      </button>
    </div>
  );
}

function NetworkSearchEmpty({ onClear }: { onClear: () => void }) {
  const t = useT();
  return (
    <div className="mt-16 flex flex-col items-center px-2 pb-4 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)]"
      >
        <CircleCheck className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-[15px] font-medium text-[var(--bc-mobile-text)]">
        {t("bc.mobile.network.searchEmpty")}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex min-h-[44px] items-center rounded-lg px-3 text-[14px] font-medium text-[var(--bc-mobile-muted)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
      >
        {t("bc.mobile.network.search.clear")}
      </button>
    </div>
  );
}

/** Bộ lọc không còn ai khớp — một trạng thái trung tính + lối thoát. */
function NetworkFilterEmpty({ onReset }: { onReset: () => void }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 py-10 text-center">
      <p className="text-[14.5px] text-[var(--bc-mobile-text)]">
        {t("bc.mobile.network.filterEmpty")}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-3 inline-flex min-h-[44px] items-center rounded-lg px-3 text-[14px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        {t("bc.mobile.network.filterReset")}
      </button>
    </div>
  );
}

/** Lời mời kết bạn đang chờ phản hồi trên màn hình Network */
function NetworkIncomingRequestsSection() {
  const t = useT();
  const { requests, accept, decline, busy } = useIncomingConnectionRequests();

  if (requests.length === 0) return null;

  return (
    <section aria-label="Lời mời kết bạn" className="mt-4">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--bc-mobile-accent,#E2B755)] animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--bc-mobile-text,#0F172A)]">
            Lời mời kết bạn ({requests.length})
          </h2>
        </div>
        <Link
          to="/connect-app/network/requests"
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--bc-mobile-accent,#B8860B)] hover:underline"
        >
          Xem tất cả ({requests.length})
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[var(--bc-mobile-border)] rounded-2xl border border-[var(--bc-mobile-border-gold,#D8B282)]/60 bg-[var(--bc-mobile-surface)] p-3 shadow-md">
        {requests.slice(0, 3).map((req) => {
          const name = req.counterpart?.displayName ?? "Hội viên ViOne";
          const subtitle = [req.counterpart?.headline, req.counterpart?.companyName].filter(Boolean).join(" · ");
          const userId = req.counterpart?.userId;

          return (
            <div key={req.connectionId} className="py-2.5 first:pt-1 last:pb-1">
              <div className="flex items-center gap-3">
                {userId ? (
                  <Link
                    to="/connect-app/network/$personId"
                    params={{ personId: `u:${userId}` }}
                    className="shrink-0"
                  >
                    {req.counterpart?.avatarUrl ? (
                      <img
                        src={req.counterpart.avatarUrl}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--bc-mobile-border)]"
                      />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[14px] font-bold text-[var(--bc-mobile-accent)]">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[14px] font-bold text-[var(--bc-mobile-accent)]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {userId ? (
                    <Link
                      to="/connect-app/network/$personId"
                      params={{ personId: `u:${userId}` }}
                      className="truncate text-[14px] font-bold text-[var(--bc-mobile-text)] hover:text-[var(--bc-mobile-accent)] block"
                    >
                      {name}
                    </Link>
                  ) : (
                    <p className="truncate text-[14px] font-bold text-[var(--bc-mobile-text)]">{name}</p>
                  )}
                  {subtitle && (
                    <p className="truncate text-[12px] text-[var(--bc-mobile-muted)] mt-0.5">{subtitle}</p>
                  )}
                  <p className="text-[11px] text-[var(--bc-mobile-accent)] font-medium mt-0.5">
                    Đã gửi lời mời kết bạn
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2 pl-14">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    accept.mutate(req.connectionId, {
                      onSuccess: () => toast.success(`Đã kết nối thành công với ${name}!`),
                      onError: () => toast.error("Không thể hoàn tất kết nối. Vui lòng thử lại."),
                    })
                  }
                  className="flex-1 py-1.5 px-3 rounded-full font-bold text-[12.5px] bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 shadow hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ✓ Đồng ý
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    decline.mutate(req.connectionId, {
                      onSuccess: () => toast.info("Đã từ chối lời mời kết bạn."),
                      onError: () => toast.error("Có lỗi xảy ra."),
                    })
                  }
                  className="py-1.5 px-3 rounded-full font-semibold text-[12px] border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] hover:bg-[var(--bc-mobile-surface)] text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] active:scale-95 transition-all cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
