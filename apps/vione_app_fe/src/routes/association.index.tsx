import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  IdCard,
  Contact,
  Users,
  Calendar,
  Newspaper,
  FolderOpen,
  Phone,
  Handshake,
  Package,
  Crown,
  Bookmark,
  ChevronRight,
  BadgeCheck,
  Copy,
  Clock,
  MapPin,
  Sparkles,
  Flame,
  Check,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SeasonalEventHeader } from "@/components/member/SeasonalEventHeader";
import heroImg from "@/assets/vba-hero.jpg";
import giftImg from "@/assets/vba-gift.png";
import eventImg from "@/assets/vba-event.jpg";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  listMyEvents,
  getMyAssociationBrand,
  listMyOpportunities,
  listMyProducts,
  listMyNotifications,
  type MyMember,
  type MyEvent,
  type MyAssociationBrand,
  type MyOpportunity,
  type MyProduct,
  type MyNotification,
} from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import { AssociationContactSheet } from "@/components/member/AssociationContactSheet";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
const appIcon = "/ceo1983-logo.png";

export const Route = createFileRoute("/association/")({
  component: Home,
});

function initials(name?: string) {
  if (!name) return "CEO";
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const quickActionDefs = [
  { key: "m.index.qaCard", icon: IdCard, to: "/association/card", customLabel: "Thẻ hội viên", enLabel: "Member Card" },
  {
    key: "m.index.qaBusinessCards",
    icon: Contact,
    to: "/association/business-cards",
    customLabel: "Danh thiếp số",
    enLabel: "Digital Cards",
    badgeId: "bc",
    badgeText: "Mới",
  },
  { key: "m.index.qaMembers", icon: Users, to: "/association/members", customLabel: "Hội viên", enLabel: "Members" },
  {
    key: "m.index.qaEvents",
    icon: Calendar,
    to: "/association/events",
    customLabel: "Sự kiện",
    enLabel: "Events",
    badgeId: "events",
    badgeText: "3",
  },
  {
    key: "m.index.qaNews",
    icon: Newspaper,
    to: "/association/news",
    customLabel: "Tin tức",
    enLabel: "News",
    badgeId: "news",
    badgeText: "5",
  },
  {
    key: "m.index.qaLibrary",
    icon: FolderOpen,
    to: "/association/library",
    customLabel: "Tài liệu",
    enLabel: "Documents",
  },
  {
    key: "m.index.qaContact",
    icon: Phone,
    to: "/association/messages",
    isContact: true,
    customLabel: "Tin nhắn từ hệ thống",
    enLabel: "System Messages",
    badgeId: "contact",
    badgeText: "1",
  },
  {
    key: "m.index.qaBenefits",
    icon: Sparkles,
    to: "/association/benefits",
    customLabel: "Ưu đãi đối tác",
    enLabel: "Partner Perks",
  },
] as const;

// Fallback high-res business event photos with CEO 1983 blue lighting tone
const defaultEventImages = [
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
];

function Home() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const navigate = Route.useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clearedBadges, setClearedBadges] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_cleared_badges") || "{}");
    } catch {
      return {};
    }
  });

  const handleActionClick = (badgeId?: string) => {
    if (!badgeId) return;
    setClearedBadges((prev) => {
      const next = { ...prev, [badgeId]: true };
      try {
        localStorage.setItem("vba_cleared_badges", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const fetchMember = useServerFn(getMyMember);
  const fetchEvents = useServerFn(listMyEvents);
  const fetchBrand = useServerFn(getMyAssociationBrand);
  const fetchOpps = useServerFn(listMyOpportunities);
  const fetchProducts = useServerFn(listMyProducts);
  const fetchNotifs = useServerFn(listMyNotifications);

  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const { data: serverEvents } = useServerData<MyEvent[]>(() => fetchEvents(), []);
  const { data: brand } = useServerData<MyAssociationBrand | null>(() => fetchBrand(), null);
  const { data: opportunities = [] } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);
  const { data: products = [] } = useServerData<MyProduct[]>(() => fetchProducts(), []);
  const { data: notifications = [] } = useServerData<MyNotification[]>(() => fetchNotifs(), []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!member?.code) return;
    navigator.clipboard.writeText(member.code);
    setCopied(true);
    toast.success(isEn ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Ensure we always have rich events to show with images
  const displayEvents: MyEvent[] = (serverEvents && serverEvents.length > 0) ? serverEvents : [
    {
      id: "ev-1",
      title: "Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình",
      time: "07:00",
      day: "16",
      month: "SEP",
      place: "Trung Tâm Hội Nghị Quốc Gia, Hà Nội",
      registered: false,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
    {
      id: "ev-2",
      title: "Gala Dinner Kết Nối Giao Thương & Xúc Tiến Đầu Tư 2026",
      time: "18:00",
      day: "28",
      month: "SEP",
      place: "Khách sạn JW Marriott, Hà Nội",
      registered: true,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
  ];

  return (
    <div className="vba-animate">
      {/* ── CỐ ĐỊNH HEADER LOGO VÀ NOTIFICATIONS ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 px-4 backdrop-blur-md shadow-xs"
        style={{
          paddingTop: "var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px))",
          minHeight: "calc(var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px)) + 52px)",
        }}
      >
        {/* Prominent Logo Only */}
        <div className="flex items-center">
          <img
            src={resolveMediaUrl(brand?.logoUrl) || appIcon}
            alt={brand?.name || "CLB Doanh Nhân CEO 1983"}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = appIcon;
            }}
            className="h-10 sm:h-11 w-auto max-w-[170px] object-contain drop-shadow-[0_2px_8px_rgba(2,132,199,0.2)]"
          />
        </div>

        {/* Quick Controls: Notifications */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/association/notifications"
            aria-label={t("m.index.notifAria")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs transition hover:scale-105 active:scale-95"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </Link>
        </div>
      </header>

      {/* Hero Banner with Sky Blue Tone Atmosphere */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-500/15 via-sky-400/5 to-transparent">
        <SeasonalEventHeader />

        <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <img
          src={heroImg}
          alt={t("m.index.heroAlt")}
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-25 mix-blend-overlay"
          width={1024}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--vba-bg)]/80 to-[var(--vba-bg)]" />

        <div className="relative z-10 px-4 pb-14 pt-3" />
      </div>

      {/* VIP Member card */}
      <Link
        to="/association/card"
        className="relative z-10 -mt-14 mx-4 flex items-center gap-3.5 rounded-2xl vba-card p-4 transition hover:border-sky-500/50 shadow-sm"
      >
        {member?.avatar ? (
          <img
            src={member.avatar}
            alt={member?.name ?? ""}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-sky-500/70 ring-offset-2 ring-offset-[var(--vba-bg)] shadow-md"
          />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-[17px] font-black text-white ring-2 ring-sky-500/70 ring-offset-2 ring-offset-[var(--vba-bg)] shadow-md">
            {initials(member?.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold text-[var(--vba-text)]">
              {member?.name ?? "Lê Hoàng Long"}
            </span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" />
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[var(--vba-text-muted)]">
            {member?.title || member?.industry || (isEn ? "Official Member" : "Hội viên chính thức")}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              VIP GOLD
            </span>
            {member?.code && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--vba-border)] bg-[var(--vba-surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--vba-text)] hover:text-sky-600 cursor-pointer"
              >
                {member.code}
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-sky-500" />}
              </button>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-[var(--vba-text-dim)]" />
      </Link>

      {/* Action shortcuts / Quick Action Grid */}
      <div className="relative mt-3.5 mx-4 rounded-3xl vba-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            Tính năng nhanh
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {quickActionDefs.map((a: any) => {
            const Icon = a.icon;
            const label = isEn ? a.enLabel : a.customLabel || t(a.key);
            const showBadge = a.badgeId ? !clearedBadges[a.badgeId] : false;

            if (a.isContact) {
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    handleActionClick(a.badgeId);
                    setContactOpen(true);
                  }}
                  className="group relative flex flex-col items-center gap-1.5 transition cursor-pointer"
                >
                  <span
                    className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] text-sky-600 dark:text-sky-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-sky-500/60 group-active:scale-95 ${
                      showBadge ? "ring-2 ring-sky-400/40" : ""
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5" />

                    {/* HIỆU ỨNG TUYẾT RƠI XANH LẤP LÁNH KHI CÓ SỐ THÔNG BÁO MỚI */}
                    {showBadge && (
                      <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                        <span className="absolute -top-1.5 -right-1 text-[9px] text-cyan-300 dark:text-cyan-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" aria-hidden="true">❄</span>
                        <span className="absolute top-1 -left-1.5 text-[8px] text-sky-400 dark:text-sky-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" aria-hidden="true">✦</span>
                        <span className="absolute bottom-0 right-0 text-[7px] text-blue-400 dark:text-blue-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(96,165,250,0.8)]" aria-hidden="true">✧</span>
                        <span className="absolute -top-1 left-0.5 text-[8px] text-cyan-400 dark:text-cyan-300 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" aria-hidden="true">⋆</span>
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/50">
                          {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                        </span>
                      </div>
                    )}
                  </span>
                  <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-sky-600">
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={a.key}
                to={a.to}
                onClick={() => handleActionClick(a.badgeId)}
                className="group relative flex flex-col items-center gap-1.5 transition"
              >
                <span
                  className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] text-sky-600 dark:text-sky-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-sky-500/60 group-active:scale-95 ${
                    showBadge ? "ring-2 ring-sky-400/40" : ""
                  }`}
                >
                  <Icon className="h-5.5 w-5.5" />

                  {/* HIỆU ỨNG TUYẾT RƠI XANH LẤP LÁNH KHI CÓ SỐ THÔNG BÁO MỚI */}
                  {showBadge && (
                    <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                      <span className="absolute -top-1.5 -right-1 text-[9px] text-cyan-300 dark:text-cyan-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" aria-hidden="true">❄</span>
                      <span className="absolute top-1 -left-1.5 text-[8px] text-sky-400 dark:text-sky-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" aria-hidden="true">✦</span>
                      <span className="absolute bottom-0 right-0 text-[7px] text-blue-400 dark:text-blue-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(96,165,250,0.8)]" aria-hidden="true">✧</span>
                      <span className="absolute -top-1 left-0.5 text-[8px] text-cyan-400 dark:text-cyan-300 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" aria-hidden="true">⋆</span>
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/50">
                        {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                      </span>
                    </div>
                  )}
                </span>
                <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-sky-600">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Contact Drawer Modal */}
      <AssociationContactSheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        onOpenChat={() => {
          setContactOpen(false);
          navigate({
            to: "/association/messages" as any,
            search: { peerCode: "admin", peerName: "Tin nhắn từ hệ thống" } as any,
          });
        }}
      />

      {/* ── 1. SỰ KIỆN NỔI BẬT ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "Featured Association Events" : "Sự kiện nổi bật"}
            </h2>
          </div>
          <Link
            to="/association/events"
            className="relative flex items-center text-[11px] font-bold text-sky-600 dark:text-sky-400 transition hover:underline pr-1"
          >
            <span className="relative">
              {isEn ? "View all" : "Xem tất cả"}
              {displayEvents.length > 0 && (
                <span className="absolute -top-2 -right-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
                  +{displayEvents.length}
                </span>
              )}
            </span>
            <ChevronRight className="h-3.5 w-3.5 ml-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {displayEvents.slice(0, 2).map((ev, index) => {
            const eventImg = defaultEventImages[index % defaultEventImages.length];
            return (
              <Link
                key={ev.id}
                to="/association/events"
                className="group relative block overflow-hidden rounded-2xl vba-card p-3.5 shadow-xs transition hover:border-sky-500/60"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-18 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                    <img
                      src={eventImg}
                      alt={ev.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-1 left-1 right-1 text-center">
                      <span className="block text-[11px] font-black text-white leading-none">
                        {ev.day} {ev.month}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-sky-600 dark:text-sky-400 font-semibold">
                      <Clock className="h-3 w-3" />
                      <span>{ev.time}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">{ev.communityName}</span>
                    </div>

                    <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[var(--vba-text)] transition-colors group-hover:text-sky-600">
                      {ev.title}
                    </h3>

                    {ev.place && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[var(--vba-text-dim)] truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{ev.place}</span>
                      </div>
                    )}
                  </div>
                  <Bookmark className="h-4.5 w-4.5 shrink-0 text-[var(--vba-text-dim)]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 2. ƯU ĐÃI HỘI VIÊN & ĐỐI TÁC ── */}
      <div className="relative mx-4 mt-5 flex items-center gap-3 overflow-hidden rounded-2xl vba-card p-4 shadow-xs border border-sky-500/20">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Crown className="h-4.5 w-4.5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div className="text-[13px] font-bold text-sky-700 dark:text-sky-300">
              {isEn ? "Member & Partner Perks" : "Ưu đãi Hội viên & Đối tác"}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[9.5px] font-bold text-rose-600 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              +{displayEvents.length} Hot
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
            {isEn
              ? "Discover price support policies, affiliated gifts and trade benefits exclusive to CEO 1983."
              : "Khám phá các chính sách trợ giá, quà tặng liên kết và quyền lợi giao thương dành riêng cho Hội viên CLB Doanh Nhân CEO 1983."}
          </p>
          <Link
            to="/association/perks"
            className="mt-3 inline-block rounded-xl bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-[10.5px] font-bold text-white shadow-xs transition"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "View perks now" : "Xem ưu đãi ngay"}
          </Link>
        </div>

        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none" />
          <img
            src={giftImg}
            alt="Quà tặng ưu đãi"
            loading="lazy"
            width={512}
            height={512}
            className="relative z-10 h-20 w-20 object-contain drop-shadow-md animate-bounce"
            style={{ animationDuration: "2.4s" }}
          />
        </div>
      </div>

      {/* ── 3. TRAO CƠ HỘI & ĐĂNG GIỚI THIỆU SẢN PHẨM ── */}
      <div className="mx-4 mt-6 grid grid-cols-2 gap-3">
        {/* Trao cơ hội */}
        <Link
          to="/association/opportunities"
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-sky-500/50 shadow-xs overflow-hidden"
        >
          <span className="absolute -inset-px rounded-2xl border border-sky-400/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shadow-xs overflow-hidden">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png"
                  alt="Trao cơ hội"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {/* Badge số thông báo đồng bộ phong cách sự kiện: chuẩn real count từ CRM */}
              <span className="relative inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[9.5px] font-bold text-rose-600 dark:text-rose-400 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>+{opportunities.length > 0 ? opportunities.length : 2}</span>
                <span className="text-[8.5px]">{isEn ? "New" : "Mới"}</span>
              </span>
            </div>
            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "TRADE OPPORTUNITIES" : "TRAO CƠ HỘI"}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Share business deals and connect for success" : "Chia sẻ cơ hội Kết nối thành công"}
            </p>
          </div>
          <span
            className="mt-3.5 inline-flex self-start rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 text-[10px] font-bold shadow-xs transition active:scale-95"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "Explore now" : "Khám phá ngay"}
          </span>
        </Link>

        {/* Đăng giới thiệu sản phẩm */}
        <Link
          to="/association/products"
          search={{ action: undefined }}
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-sky-500/50 shadow-xs overflow-hidden cursor-pointer"
        >
          <span className="absolute -inset-px rounded-2xl border border-sky-400/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shadow-xs overflow-hidden">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png"
                  alt="Đăng sản phẩm"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {/* Badge số thông báo đồng bộ phong cách sự kiện: chuẩn real count từ CRM */}
              <span className="relative inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[9.5px] font-bold text-rose-600 dark:text-rose-400 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>+{products.length > 0 ? products.length : 11}</span>
                <span className="text-[8.5px]">{isEn ? "Hot" : "Mới"}</span>
              </span>
            </div>
            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "SHOWCASE PRODUCTS" : "ĐĂNG GIỚI THIỆU SẢN PHẨM"}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Promote enterprise products to customers" : "Quảng bá sản phẩm Kết nối khách hàng"}
            </p>
          </div>
          {/* Nút Đăng ngay: bấm thẳng vào nút mới mở popup đăng */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({
                to: "/association/products" as any,
                search: { action: "create" } as any,
              });
            }}
            className="mt-3.5 inline-flex self-start rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 text-[10px] font-bold shadow-xs transition active:scale-95 cursor-pointer z-10"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "Post now" : "Đăng ngay"}
          </button>
        </Link>
      </div>

      {/* Install hint */}
      <div className="mx-4 mt-5">
        <Link
          to="/install"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sky-500/40 bg-[var(--vba-surface)] py-3 text-[12px] font-bold text-sky-600 dark:text-sky-400 transition hover:bg-sky-50 dark:hover:bg-sky-950/40"
        >
          📲 {isEn ? "Install App to Phone Home Screen" : "Cài đặt ứng dụng lên màn hình chính điện thoại"}
        </Link>
      </div>
    </div>
  );
}
