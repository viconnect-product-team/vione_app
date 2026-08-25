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
  Briefcase,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Handshake,
  IdCard,
  MapPin,
  MessageSquare,
  RefreshCw,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { HomeNotificationsMenu } from "./HomeNotificationsMenu";
import { hasTKey, useFmt, useLang, useT, type TKey } from "@/lib/i18n";
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

import { RelationshipSuggestions } from "./RelationshipSuggestions";
import { TodayCustomizeSheet } from "./TodayCustomizeSheet";
import { TodayItem } from "./TodayItem";

export function ExecutiveHome() {
  const t = useT();
  const { openV } = useVSheet();
  const home = useBusinessConnectHome();
  const data = home.data;

  // Tuỳ chỉnh thẻ HÔM NAY — chỉ lọc/sắp xếp dữ liệu đã được cấp quyền.
  const { prefs, update, reset } = useTodayPreferences();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const todayPool = data?.today.pool ?? data?.today.items ?? [];
  const todayItems = applyTodayPreferences(todayPool, prefs);
  const customized = !isDefaultTodayPreferences(prefs);

  const unread = data?.unreadNotificationCount ?? null;

  return (
    <>
      <div aria-hidden="true" style={{ paddingTop: "var(--bc-mobile-safe-top-compact)" }} />

      <main id="bc-mobile-home" className="contents">
        {home.isPending ? (
          <HomeSkeleton />
        ) : home.isError || !data ? (
          <HomeCoreError onRetry={() => home.refetch()} />
        ) : (
          <div className="bc-home-enter">
            <Greeting identity={data.identity} unreadCount={unread} />

            <section
              aria-labelledby="bc-home-today"
              className="mt-6 overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] text-[var(--bc-mobile-accent)]"
                >
                  <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    id="bc-home-today"
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]"
                  >
                    {t("bc.mobile.home.today.label")}
                  </h2>
                  <TodayDate />
                </div>
                <button
                  type="button"
                  onClick={() => setCustomizeOpen(true)}
                  aria-label={t("bc.mobile.home.today.customize.open")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--bc-mobile-muted)] transition-colors hover:text-[var(--bc-mobile-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
                >
                  <SlidersHorizontal className="h-[17px] w-[17px]" strokeWidth={1.6} />
                </button>

                <Link
                  to="/connect-app/calendar"
                  className="inline-flex min-h-[38px] shrink-0 items-center gap-1 rounded-full border border-[var(--bc-mobile-border-gold)] px-2.5 text-[12.5px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
                >
                  {t("bc.mobile.home.today.viewCalendar")}
                  <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </Link>
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
    <p className="mt-0.5 truncate text-[15px] font-semibold capitalize text-[var(--bc-mobile-text)]">
      {label}
    </p>
  );
}

/** Thao tác nhanh — chỉ trỏ tới các route đã tồn tại. */
function QuickActions() {
  const t = useT();
  const items = [
    {
      to: "/connect-app/card-scan" as const,
      icon: ScanLine,
      label: t("bc.mobile.home.quick.scan"),
      hint: t("bc.mobile.home.quick.scan.hint"),
    },
    {
      to: "/connect-app/moment" as const,
      icon: Users,
      label: t("bc.mobile.home.quick.meet"),
      hint: t("bc.mobile.home.quick.meet.hint"),
    },
    {
      to: "/connect-app/me/card" as const,
      icon: IdCard,
      label: t("bc.mobile.home.quick.card"),
      hint: t("bc.mobile.home.quick.card.hint"),
    },
  ];
  return (
    <section
      aria-labelledby="bc-home-quick"
      className="mt-6 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4"
    >
      <h2
        id="bc-home-quick"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]"
      >
        {t("bc.mobile.home.quick.title")}
      </h2>
      <ul className="mt-3 grid grid-cols-3 divide-x divide-[var(--bc-mobile-border)] overflow-hidden rounded-xl border border-[var(--bc-mobile-border)]">
        {items.map(({ to, icon: Icon, label, hint }) => (
          <li key={to} className="min-w-0">
            <Link
              to={to}
              className="flex min-h-[92px] flex-col items-start justify-center gap-2 px-2.5 py-3 transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
            >
              <Icon
                aria-hidden="true"
                className="h-[24px] w-[24px] shrink-0 text-[var(--bc-mobile-accent)]"
                strokeWidth={1.4}
              />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-tight text-[var(--bc-mobile-text)]">
                  {label}
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-tight text-[var(--bc-mobile-muted)]">
                  {hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
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
    <>
      <span
        aria-hidden="true"
        className="absolute -left-[21px] top-[6px] h-2.5 w-2.5 rounded-full bg-[var(--bc-mobile-accent)]"
      />
      {time ? (
        <span className="w-[58px] shrink-0 pt-[1px] text-[13.5px] font-semibold leading-tight tabular-nums text-[var(--bc-mobile-accent)]">
          {time}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[13px] text-[var(--bc-mobile-muted)]">
            {subtitle}
          </span>
        ) : null}
        {detail ? (
          <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-[var(--bc-mobile-muted)]">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
            <span className="truncate">{detail}</span>
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <li className="relative">
      {canRoute ? (
        <Link
          to={item.action.targetRoute as any}
          params={(item.action.targetParams ?? {}) as any}
          search={(item.action.targetSearch ?? {}) as any}
          className="flex gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
        >
          {body}
        </Link>
      ) : (
        <div className="flex gap-3">{body}</div>
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
      className="mt-5 flex min-h-[54px] items-center justify-center gap-3 rounded-xl px-4 text-[15px] font-semibold text-[var(--bc-mobile-accent-on)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
      style={{ background: "var(--bc-mobile-accent-grad)" }}
    >
      <Video aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      <span className="flex-1 text-center">{t("bc.mobile.home.today.join")}</span>
      <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
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
  return (
    <section
      aria-labelledby="bc-home-insight"
      className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-5"
    >
      <div className="flex items-center gap-2">
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
      {/* Vòng tròn trang trí bên phải — đúng bố cục thiết kế. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-8 top-16 hidden h-[130px] w-[130px] place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] opacity-70 min-[360px]:grid"
      >
        <span className="grid h-[104px] w-[104px] place-items-center rounded-full border border-[var(--bc-mobile-border-gold)]">
          <Users className="h-9 w-9 text-[var(--bc-mobile-accent)]" strokeWidth={1.2} />
        </span>
        <span className="absolute -right-1 -top-3 grid h-11 w-11 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] bg-[var(--bc-mobile-surface)]">
          <Handshake className="h-5 w-5 text-[var(--bc-mobile-accent)]" strokeWidth={1.3} />
        </span>
        <span className="absolute -bottom-2 -right-2 grid h-11 w-11 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] bg-[var(--bc-mobile-surface)]">
          <Briefcase className="h-5 w-5 text-[var(--bc-mobile-accent)]" strokeWidth={1.3} />
        </span>
      </span>
      <p className="relative mt-4 max-w-[17ch] text-[21px] font-semibold leading-snug text-[var(--bc-mobile-text)]">
        {isEmpty
          ? t("bc.mobile.home.insight.emptyHeadline")
          : t("bc.mobile.home.insight.headline", { count: recommendations.length })}
      </p>
      <p className="relative mt-2 max-w-[22ch] text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
        {isEmpty ? t("bc.mobile.home.insight.emptyBody") : t("bc.mobile.home.insight.body")}
      </p>
      <Link
        to="/connect-app/network"
        className="relative mt-4 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
      >
        {isEmpty ? t("bc.mobile.home.insight.emptyCta") : t("bc.mobile.home.insight.cta")}
        <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
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
  unreadCount,
}: {
  identity: BcMobileHomeIdentity;
  unreadCount: number | null;
}) {
  const t = useT();
  const daypart = getGreetingDaypart();
  const name = identity.displayName ?? identity.email ?? null;
  const initials = initialsOf(identity);
  const viewerUserId = useViewerUserId();
  const mine = useMyIdentity({ enabled: Boolean(viewerUserId) });
  const profileIdentity = mine.data?.identity ?? null;
  // Ảnh đại diện luôn lấy từ danh tính chuẩn (đồng bộ với màn Tôi / V-Sheet).
  const avatarUrl = profileIdentity?.avatarUrl ?? identity.avatarUrl ?? null;
  const role = [profileIdentity?.jobTitle, profileIdentity?.companyName]
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" · ");

  return (
    <div className="relative">
      {/* Ánh sáng vàng trang trí góc phải — thay cho ảnh quả cầu trong thiết kế. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--bc-mobile-accent) 35%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="relative flex items-start gap-4"
        style={{ minHeight: "var(--bc-mobile-header-h)" }}
      >
        <span
          aria-hidden="true"
          className="grid shrink-0 place-items-center rounded-full p-[2px]"
          style={{
            background: "var(--bc-mobile-accent-grad)",
            height: "var(--bc-mobile-header-avatar)",
            width: "var(--bc-mobile-header-avatar)",
          }}
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
        </span>
        <h1 className="min-w-0 flex-1 tracking-tight">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--bc-mobile-accent)]">
            {t("bc.mobile.app.name")}
          </span>
          <span className="mt-1 block text-[14px] font-normal text-[var(--bc-mobile-muted)]">
            {t(`bc.mobile.home.greeting.${daypart}`)}
          </span>

          {name ? (
            <span className="mt-0.5 flex items-center gap-2">
              <span className="truncate text-[length:var(--bc-mobile-header-title)] font-semibold leading-tight text-[var(--bc-mobile-text)]">
                {name}
              </span>
              <span
                aria-hidden="true"
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[var(--bc-mobile-accent-on)]"
                style={{ background: "var(--bc-mobile-accent-grad)" }}
              >
                V
              </span>
            </span>
          ) : null}
          {role ? (
            <span className="mt-1 block truncate text-[14px] text-[var(--bc-mobile-accent)]">
              {role}
            </span>
          ) : null}
          <span className="mt-2 inline-flex min-h-[32px] items-center rounded-lg border border-[var(--bc-mobile-border-gold)] px-3 text-[13px] font-medium text-[var(--bc-mobile-accent)]">
            {t("bc.mobile.home.member.badge")}
          </span>
        </h1>
        <div
          className="flex shrink-0 items-center"
          style={{
            gap: "var(--bc-mobile-header-gap)",
            marginRight: "calc(-1 * var(--bc-mobile-header-gap) / 2)",
            paddingRight: "var(--bc-mobile-safe-right)",
          }}
        >
          {/* BC-Mobile-8A — lối vào hộp thư nội bộ. */}
          <Link
            to="/connect-app/inbox"
            aria-label={t("bc.mobile.inbox.title")}
            style={{
              height: "var(--bc-mobile-header-action)",
              width: "var(--bc-mobile-header-action)",
            }}
            className="grid place-items-center rounded-full text-[var(--bc-mobile-text)]"
          >
            <MessageSquare aria-hidden="true" style={{ height: "var(--bc-mobile-header-icon)", width: "var(--bc-mobile-header-icon)" }} strokeWidth={1.8} />
          </Link>
          <HomeNotificationsMenu unreadCount={unreadCount} />
        </div>
      </div>
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
      className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-3 rounded-xl px-4 text-[15px] font-semibold text-[var(--bc-mobile-accent-on)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
      style={{ background: "var(--bc-mobile-accent-grad)" }}
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-[11px] font-bold leading-none"
      >
        V
      </span>
      <span className="flex-1 text-center">{t("bc.mobile.home.v.open")}</span>
      <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
    </button>
  );
}

/** Small champagne V glyph — the only accent marker on Home. */
function VMarker() {
  return (
    <span
      aria-hidden="true"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-accent)] text-[11px] font-semibold leading-none text-[var(--bc-mobile-accent)]"
    >
      V
    </span>
  );
}

function TodayEmpty({ onOpenV }: { onOpenV: () => void }) {
  const t = useT();
  return (
    <div className="mt-12 flex flex-col items-center px-2 pb-4 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)]"
      >
        <CircleCheck className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-[16px] font-medium text-[var(--bc-mobile-text)]">
        {t("bc.mobile.home.empty.title")}
      </p>
      <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.home.empty.body")}
      </p>
      <button
        type="button"
        onClick={onOpenV}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2.5 rounded-lg px-2 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
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
