// BC-Mobile-2B — Network screen (Executive Minimal Luxury, ViOne).
//
// Cấu trúc theo thiết kế đã duyệt: tiêu đề + số liệu quan hệ, ô tìm kiếm luôn
// hiển thị kèm bộ lọc, dải "AI Match" (gợi ý quan hệ 6A), danh sách "Cần giữ
// kết nối", dải tròn "Gặp gần đây" và dòng "Khoảnh khắc gần đây".
// Chỉ thay lớp trình bày — mọi dữ liệu vẫn đi qua các hợp đồng 2A/6A/7E.

import { Link } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFmt, useLang, useT } from "@/lib/i18n";
import {
  useBusinessConnectNetwork,
  type BcMobileNetworkPerson,
} from "@/hooks/use-business-connect-network";
import { useBusinessConnectHome } from "@/hooks/use-business-connect-home";
import { useTodayRelationshipRecommendations } from "@/hooks/use-relationship-intelligence";
import { useVSheet } from "@/hooks/use-v-sheet";
import { useNetworkFeed } from "@/hooks/use-network-feed";
import { avatarOrDemo } from "@/lib/business-connect/mobile/demo-avatars";
import { BusinessConnectTopBar } from "./BusinessConnectTopBar";
import { NetworkFeedCard } from "./NetworkFeedCard";
import { NetworkPersonRow } from "./NetworkPersonRow";
import { AiMatchConnectAction, AiMatchDetailSheet } from "./AiMatchDetailSheet";
import { CustomersPanel } from "./customers/CustomersPanel";

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

export function NetworkHome() {
  const t = useT();
  const { lang } = useLang();
  const { openV } = useVSheet();
  const [tab, setTab] = useState<"network" | "customers">("network");
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



  return (
    <>
      <BusinessConnectTopBar />

      <main id="bc-mobile-network" className="contents">
        {/* A — Header: tiêu đề + số liệu quan hệ + thêm người */}
        <div
          className="flex items-start justify-between gap-3"
          style={{ minHeight: "var(--bc-mobile-header-h)" }}
        >
          <div className="min-w-0">
            <h1 className="text-[length:var(--bc-mobile-header-title)] font-semibold leading-tight tracking-tight text-[var(--bc-mobile-text)]">
              {t("bc.mobile.network.title")}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13.5px] text-[var(--bc-mobile-muted)]">
              <span>
                {t("bc.mobile.network.stats.connections", { count: network.people.length })}
              </span>
              {recommendations.length > 0 ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="text-[var(--bc-mobile-accent)]">
                    {t("bc.mobile.network.stats.nurture", { count: recommendations.length })}
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <div
            className="flex shrink-0 items-center"
            style={{
              gap: "var(--bc-mobile-header-gap)",
              paddingRight: "var(--bc-mobile-safe-right)",
            }}
          >
            <NetworkNotificationsButton />
            <Link
              to="/connect-app/card-scan"
              aria-label={t("bc.mobile.network.addPerson")}
              style={{ height: "var(--bc-mobile-header-action)", width: "var(--bc-mobile-header-action)" }}
              className="bc-cta-gold grid shrink-0 place-items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
            >
              <UserPlus style={{ height: "var(--bc-mobile-header-icon)", width: "var(--bc-mobile-header-icon)" }} strokeWidth={1.9} />
            </Link>
          </div>
        </div>

        {/* A2 — Tab: Mạng lưới · Khách hàng của tôi (nhóm riêng, khác Cộng đồng) */}
        <div
          role="tablist"
          aria-label={t("bc.mobile.network.title")}
          className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] p-1"
        >
          {(["network", "customers"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`min-h-10 rounded-xl text-[14px] font-semibold transition-colors ${
                tab === key
                  ? "bg-[var(--bc-mobile-surface)] text-[var(--bc-mobile-accent)]"
                  : "text-[var(--bc-mobile-muted)]"
              }`}
            >
              {t(`bc.mobile.network.tab.${key}` as const)}
            </button>
          ))}
        </div>

        {tab === "customers" ? (
          <CustomersPanel />
        ) : (
        <>

        {/* B — Ô tìm kiếm + bộ lọc */}
        <div className="mt-4 flex items-center gap-2.5">

          <div
            role="search"
            className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
          >
            <label htmlFor="bc-network-search" className="sr-only">
              {t("bc.mobile.network.search.label")}
            </label>
            <Search
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-[var(--bc-mobile-muted)]"
              strokeWidth={1.8}
            />
            <input
              id="bc-network-search"
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t("bc.mobile.network.search.placeholder")}
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[var(--bc-mobile-text)] outline-none placeholder:text-[var(--bc-mobile-muted)] [&::-webkit-search-cancel-button]:hidden"
            />
            {term ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t("bc.mobile.network.search.clear")}
                className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-muted)] transition-colors duration-150 hover:bg-[var(--bc-mobile-border)] hover:text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
              >
                <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              </button>
            ) : null}
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              aria-label={t("bc.mobile.network.filter")}
              className={`relative grid h-12 w-12 place-items-center rounded-2xl border bg-[var(--bc-mobile-surface-2)] transition-colors hover:border-[var(--bc-mobile-accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] ${
                filtering
                  ? "border-[var(--bc-mobile-accent)] text-[var(--bc-mobile-accent)]"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-text)]"
              }`}
            >
              <SlidersHorizontal className="h-[19px] w-[19px]" strokeWidth={1.8} />
              {filtering ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--bc-mobile-accent)]" />
              ) : null}
            </button>
            {sortOpen ? (
              <div className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] py-1 shadow-lg">
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
        </div>

        {network.initialLoading ? (
          <NetworkSkeleton />
        ) : network.coreError ? (
          <NetworkError onRetry={network.retry} />
        ) : network.people.length === 0 ? (
          network.searching ? (
            <NetworkSearchEmpty onClear={clearSearch} />
          ) : (
            <NetworkEmpty onOpenV={openV} />
          )
        ) : (
          <>
            <NetworkAiMatchStrip peopleById={peopleById} allowedIds={allowedIds} />
            <NetworkNurtureList allowedIds={allowedIds} />
            {!narrowed && recent.length > 0 ? <NetworkRecentStrip people={recent} /> : null}


            {/* Ghi khoảnh khắc nhanh */}
            {!narrowed ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--bc-mobile-accent)]/30 bg-[var(--bc-mobile-surface)] p-3.5">
                <Link
                  to="/connect-app/moment"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-accent)]/60 text-[var(--bc-mobile-accent)]"
                  >
                    <Sparkles className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[16px] font-semibold text-[var(--bc-mobile-accent)]">
                      {t("bc.mobile.network.compose.title")}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-[var(--bc-mobile-muted)]">
                      {t("bc.mobile.network.compose.subtitle")}
                    </span>
                  </span>
                </Link>
                <Link
                  to="/connect-app/card-scan"
                  aria-label={t("bc.mobile.network.compose.scan")}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
                >
                  <Camera className="h-[21px] w-[21px]" strokeWidth={1.7} />
                </Link>
              </div>
            ) : null}

            {/* Khoảnh khắc gần đây / danh sách người */}
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--bc-mobile-text)]">
                  {showFeed ? t("bc.mobile.network.moments.title") : t("bc.mobile.network.people")}
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

              {showFeed ? (
                <ul
                  aria-label={t("bc.mobile.network.list.label")}
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
              ) : people.length === 0 ? (
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


            {showFeed && feed.hasMore ? (
              <div className="mt-2 flex min-h-[52px] items-center justify-center">
                <button
                  type="button"
                  onClick={feed.loadMore}
                  disabled={feed.isLoadingMore}
                  className="inline-flex min-h-[44px] items-center rounded-lg px-4 text-[14px] font-medium text-[var(--bc-mobile-muted)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] disabled:opacity-60 motion-reduce:transition-none"
                >
                  {feed.isLoadingMore
                    ? t("bc.mobile.network.loadingMore")
                    : t("bc.mobile.network.loadMore")}
                </button>
              </div>
            ) : null}

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

/**
 * "AI Match – Nên kết nối hôm nay" — dải ngang gợi ý quan hệ (6A).
 * Chỉ hiển thị dữ liệu xác định: số ngày từ lần gặp gần nhất + gợi ý của V.
 */
function NetworkAiMatchStrip({
  peopleById,
  allowedIds,
}: {
  peopleById: Map<string, BcMobileNetworkPerson>;
  allowedIds: Set<string> | null;
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold text-[var(--bc-mobile-text)]">
          <Sparkles
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[var(--bc-mobile-accent)]"
            strokeWidth={1.8}
          />
          <span className="truncate">{t("bc.mobile.network.aimatch.title")}</span>
        </h2>
        <Link
          to="/connect-app"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--bc-mobile-muted)]"
        >
          {t("bc.mobile.network.recent.viewAll")}
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </div>

      <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recommendations.map((rec) => {
          const name = rec.person.displayName ?? t("bc.mobile.network.unknownPerson");
          const roleLine = [rec.person.headline, rec.person.companyName]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={rec.id} className="w-[264px] shrink-0 snap-start">
              <div className="flex h-full flex-col rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(rec.id)}
                  aria-label={`${t("bc.mobile.network.aimatch.open")} — ${name}`}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] rounded-xl"
                >
                  <span className="flex items-center gap-3">
                    <img
                      src={avatarOrDemo(rec.person.avatarUrl, rec.person.personId)}
                      alt=""
                      loading="lazy"
                      width={512}
                      height={640}
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[var(--bc-mobile-accent)]/70"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
                        {name}
                      </span>
                      {roleLine ? (
                        <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
                          {roleLine}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-accent)]">
                        {rec.reason.days > 0
                          ? t("bc.mobile.network.suggest.days", { count: rec.reason.days })
                          : t("bc.mobile.network.suggest.recent")}
                      </span>
                    </span>
                  </span>

                  {rec.aiSuggestion ? (
                    <span className="mt-3 line-clamp-3 block text-[13px] leading-relaxed text-[var(--bc-mobile-text)]">
                      {rec.aiSuggestion}
                    </span>
                  ) : null}
                </button>

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <AiMatchConnectAction
                    personName={rec.person.displayName}
                    target={targetFor(rec.person.personId)}
                    compact
                  />
                  <button
                    type="button"
                    onClick={() => setOpenId(rec.id)}
                    className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-xl border border-[var(--bc-mobile-accent)]/60 px-3 text-[14px] font-semibold text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
                  >
                    {t("bc.mobile.network.aimatch.reason")}
                  </button>
                </div>
              </div>
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
function NetworkNurtureList({ allowedIds }: { allowedIds: Set<string> | null }) {
  const t = useT();
  const { lang } = useLang();
  const all = useTodayRelationshipRecommendations(lang).recommendations;
  const recommendations = allowedIds
    ? all.filter((r) => allowedIds.has(r.person.personId))
    : all;
  const items = recommendations.filter((r) => r.reason.days > 0).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-label={t("bc.mobile.network.nurture.title")} className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold text-[var(--bc-mobile-text)]">
          <Bell
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[var(--bc-mobile-accent)]"
            strokeWidth={1.8}
          />
          <span className="truncate">
            {t("bc.mobile.network.nurture.title")} ({recommendations.length})
          </span>
        </h2>
        <Link
          to="/connect-app"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--bc-mobile-muted)]"
        >
          {t("bc.mobile.network.recent.viewAll")}
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </div>

      <ul className="mt-3 divide-y divide-[var(--bc-mobile-border)] overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)]">
        {items.map((rec) => {
          const name = rec.person.displayName ?? t("bc.mobile.network.unknownPerson");
          const roleLine = [rec.person.headline, rec.person.companyName]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={rec.id}>
              <Link
                to="/connect-app/network/$personId"
                params={{ personId: rec.person.personId }}
                className="flex min-h-[72px] items-center gap-3 px-3.5 py-3 transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
              >
                <img
                  src={avatarOrDemo(rec.person.avatarUrl, rec.person.personId)}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={640}
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[var(--bc-mobile-border)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
                    {name}
                  </span>
                  {roleLine ? (
                    <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
                      {roleLine}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-accent)]">
                    {t("bc.mobile.network.nurture.days", { count: rec.reason.days })}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4.5 w-4.5 shrink-0 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * "GẶP GẦN ĐÂY" — dải ngang ảnh tròn theo thứ tự thời gian gặp gần nhất.
 * Cùng nguồn dữ liệu chuẩn, không có nguồn song song, không suy đoán hiện diện.
 */
function NetworkRecentStrip({ people }: { people: BcMobileNetworkPerson[] }) {
  const t = useT();
  const fmt = useFmt();
  return (
    <section aria-label={t("bc.mobile.network.recent.title")} className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[var(--bc-mobile-text)]">
          {t("bc.mobile.network.recent.title")}
        </h2>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.network.recent.viewAll")}
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
      <ul className="-mx-4 mt-3 flex snap-x gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {people.map((person) => {
          const name = person.displayName ?? t("bc.mobile.network.unknownPerson");
          return (
            <li key={person.personId} className="w-[86px] shrink-0 snap-start text-center">
              <Link
                to="/connect-app/network/$personId"
                params={{ personId: person.personId }}
                className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
              >
                <img
                  src={avatarOrDemo(person.avatarUrl, person.personId)}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={640}
                  className="mx-auto h-[76px] w-[76px] rounded-full object-cover ring-2 ring-[var(--bc-mobile-accent)]/70"
                />
                <span className="mt-2 block truncate text-[12.5px] font-semibold text-[var(--bc-mobile-text)]">
                  {name}
                </span>
                {person.context?.at ? (
                  <span className="mt-0.5 block truncate text-[11.5px] text-[var(--bc-mobile-muted)]">
                    {fmt.rel(person.context.at)}
                  </span>
                ) : null}
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
          ? t("bc.mobile.home.notifications.unread", { count: unread })
          : t("bc.mobile.home.notifications")
      }
      style={{ height: "var(--bc-mobile-header-action)", width: "var(--bc-mobile-header-action)" }}
      className="relative grid place-items-center rounded-full border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
    >
      <Bell style={{ height: "var(--bc-mobile-header-icon)", width: "var(--bc-mobile-header-icon)" }} strokeWidth={1.7} />
      {hasUnread ? (
        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--bc-mobile-accent)]" />
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
