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
  QrCode,
  CreditCard,
  Smartphone,
  Building2,
  ExternalLink,
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
  listMembers,
  listNews,
  type MyMember,
  type MyEvent,
  type MyAssociationBrand,
  type MyOpportunity,
  type MyProduct,
  type MyNotification,
  type DirectoryMember,
  type NewsItem,
} from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import { AssociationContactSheet } from "@/components/member/AssociationContactSheet";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
const appIcon = "/ceo1983-official-logo.png";

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
    customLabel: "Liên hệ nhanh",
    enLabel: "Quick Contact",
    badgeId: "contact",
    badgeText: "1",
  },
  {
    key: "m.index.qaBenefits",
    icon: Sparkles,
    to: "/association/perks",
    customLabel: "Ưu đãi hội viên",
    enLabel: "Member Perks",
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
  const fetchDirectory = useServerFn(listMembers);
  const fetchNews = useServerFn(listNews);

  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const { data: serverEvents = [] } = useServerData<MyEvent[]>(() => fetchEvents(), []);
  const { data: brand } = useServerData<MyAssociationBrand | null>(() => fetchBrand(), null);
  const { data: opportunities = [] } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);
  const { data: products = [] } = useServerData<MyProduct[]>(() => fetchProducts(), []);
  const { data: notifications = [], reload: reloadNotifs } = useServerData<MyNotification[]>(() => fetchNotifs(), []);
  const { data: directoryMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), []);
  const { data: newsItems = [] } = useServerData<NewsItem[]>(() => fetchNews(), []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const [customProfile, setCustomProfile] = useState<{ name?: string; title?: string; avatar?: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
    } catch {
      return null;
    }
  });

  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vba_member_cover_photo");
  });

  useEffect(() => {
    const handleUpdate = () => {
      reloadNotifs();
    };
    const handleProfileUpdate = () => {
      try {
        setCustomProfile(JSON.parse(localStorage.getItem("vba_custom_profile") || "null"));
      } catch {}
    };
    const handleCoverUpdate = () => {
      try {
        setCoverPhoto(localStorage.getItem("vba_member_cover_photo"));
      } catch {}
    };
    window.addEventListener("notifications-updated", handleUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("notifications-updated", handleUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [reloadNotifs]);

  const displayName = customProfile?.name || member?.name || "Hội viên CEO 1983";
  const displayTitle = customProfile?.title || member?.title || member?.industry || (isEn ? "Official Member" : "Hội viên chính thức");
  const displayCompany = (member as any)?.companyName || (member as any)?.company || (member as any)?.contact || member?.name || "CLB Doanh Nhân CEO 1983";
  const displayAvatar = customProfile?.avatar || (member?.avatar ? resolveMediaUrl(member.avatar) || member.avatar : null);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!member?.code) return;
    navigator.clipboard.writeText(member.code);
    setCopied(true);
    toast.success(isEn ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Real events from server
  const displayEvents: MyEvent[] = serverEvents || [];

  return (
    <div className="vba-animate">
      {/* ── CỐ ĐỊNH HEADER LOGO VÀ NOTIFICATIONS ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-[var(--vba-border)] bg-white/95 dark:bg-[#070D1A]/95 px-4 backdrop-blur-md shadow-xs"
        style={{
          paddingTop: "var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px))",
          minHeight: "calc(var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px)) + 52px)",
        }}
      >
        {/* Prominent Logo CEO 1983 Official */}
        <div className="flex items-center">
          <img
            src={resolveMediaUrl(brand?.logoUrl) || appIcon}
            alt={brand?.name || "CLB Doanh Nhân CEO 1983"}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = appIcon;
            }}
            className="h-10 sm:h-11 w-auto max-w-[170px] object-contain drop-shadow-[0_2px_8px_rgba(0,59,149,0.25)]"
          />
        </div>

        {/* Quick Controls: Notifications with Navy & Gold Accent */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/association/notifications"
            aria-label={t("m.index.notifAria")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#14223E] text-[#2E3192] dark:text-blue-400 shadow-xs transition hover:scale-105 active:scale-95 hover:border-[#2E3192]/50"
          >
            <Bell className="h-4.5 w-4.5 stroke-[2]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-xs animate-pulse">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero Banner with Classic Cobalt Navy & Warm Amber Atmosphere */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#2E3192]/20 via-amber-500/10 to-transparent">
        <SeasonalEventHeader />

        <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-[#2E3192]/30 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

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

      {/* ── 1. THẺ HỘI VIÊN VIP EXECUTIVE VỚI ẢNH BÌA & AVATAR ĐÈ LÊN ẢNH BÌA (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="relative z-10 -mt-14 mx-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-md transition hover:border-amber-500/50">
        {/* Ảnh bìa to rộng (Cover Banner) */}
        <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-gradient-to-r from-[#19194D] via-[#2E3192] to-[#0f4c9c]">
          <img
            src={coverPhoto || heroImg}
            alt="Cover Banner"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

          {/* Badge VIP GOLD góc trên phải */}
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-xs">
              <Crown className="h-3 w-3 text-amber-400" />
              VIP GOLD
            </span>
          </div>
        </div>

        {/* Thân thẻ với Avatar dập viền trắng đè lên ảnh bìa */}
        <div className="px-4 pb-3.5 pt-0 relative">
          <div className="flex items-end justify-between -mt-8 mb-2">
            {/* Avatar tròn to dập viền trắng nổi bật có chấm xanh online */}
            <div className="relative">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="h-15 w-15 shrink-0 rounded-full object-cover ring-3 ring-white dark:ring-[#0F172A] shadow-md bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <span className="grid h-15 w-15 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-[#2E3192] to-[#19194D] text-[18px] font-black text-white ring-3 ring-white dark:ring-[#0F172A] shadow-md">
                  {initials(displayName)}
                </span>
              )}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
            </div>

            {/* Nút Xem thẻ VIP liên kết sang /association/card - Xanh chuẩn CEO chữ trắng */}
            <Link
              to="/association/card"
              className="inline-flex items-center gap-1 rounded-lg bg-[#2E3192] hover:bg-[#19194D] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition cursor-pointer active:scale-95 border border-transparent"
              style={{ color: "#ffffff" }}
            >
              <span className="text-white font-bold">{isEn ? "View VIP Card" : "Xem thẻ VIP"}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </Link>
          </div>

          {/* Thông tin hội viên & doanh nghiệp */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {displayCompany}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="truncate text-[16px] font-black text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-[#0284c7] dark:text-sky-400" />
              </div>
              <div className="mt-0.5 truncate text-[11.5px] text-slate-600 dark:text-slate-400">
                {displayTitle}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {member?.code && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#2E3192] dark:hover:text-amber-400 cursor-pointer transition"
                  title={isEn ? "Copy Member Code" : "Sao chép mã hội viên"}
                >
                  <span>{member.code}</span>
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action shortcuts / Quick Action Grid */}
      <div className="relative mt-3.5 mx-4 rounded-3xl vba-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2E3192]"></span>
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
                    className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#2E3192]/15 text-[#2E3192] dark:text-blue-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-[#2E3192]/60 group-active:scale-95 ${
                      showBadge ? "ring-2 ring-red-500/40" : ""
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5 stroke-[2]" />

                    {/* HIỆU ỨNG TUYẾT RƠI KHI CÓ SỐ THÔNG BÁO MỚI */}
                    {showBadge && (
                      <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                        <span className="absolute -top-1.5 -right-1 text-[9px] text-amber-300 dark:text-amber-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" aria-hidden="true">❄</span>
                        <span className="absolute top-1 -left-1.5 text-[8px] text-yellow-400 dark:text-yellow-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" aria-hidden="true">✦</span>
                        <span className="absolute bottom-0 right-0 text-[7px] text-amber-400 dark:text-amber-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(217,119,6,0.8)]" aria-hidden="true">✧</span>
                        <span className="absolute -top-1 left-0.5 text-[8px] text-amber-300 dark:text-amber-200 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" aria-hidden="true">⋆</span>
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/70">
                          {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                        </span>
                      </div>
                    )}
                  </span>
                  <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-[#2E3192]">
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
                  className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#2E3192]/15 text-[#2E3192] dark:text-blue-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-[#2E3192]/60 group-active:scale-95 ${
                    showBadge ? "ring-2 ring-red-500/40" : ""
                  }`}
                >
                  <Icon className="h-5.5 w-5.5 stroke-[2]" />

                  {/* HIỆU ỨNG TUYẾT RƠI KHI CÓ SỐ THÔNG BÁO MỚI */}
                  {showBadge && (
                    <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                      <span className="absolute -top-1.5 -right-1 text-[9px] text-amber-300 dark:text-amber-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" aria-hidden="true">❄</span>
                      <span className="absolute top-1 -left-1.5 text-[8px] text-yellow-400 dark:text-yellow-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" aria-hidden="true">✦</span>
                      <span className="absolute bottom-0 right-0 text-[7px] text-amber-400 dark:text-amber-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(217,119,6,0.8)]" aria-hidden="true">✧</span>
                      <span className="absolute -top-1 left-0.5 text-[8px] text-amber-300 dark:text-amber-200 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" aria-hidden="true">⋆</span>
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/70">
                        {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                      </span>
                    </div>
                  )}
                </span>
                <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-[#2E3192]">
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
            <Calendar className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "Featured Association Events" : "Sự kiện nổi bật"}
            </h2>
          </div>
          <Link
            to="/association/events"
            className="relative flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline pr-1"
          >
            <span className="relative">
              {isEn ? "View all" : "Xem tất cả"}
              {displayEvents.length > 0 && (
                <span className="absolute -top-2 -right-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
                  +{displayEvents.length}
                </span>
              )}
            </span>
            <ChevronRight className="h-3.5 w-3.5 ml-3.5" />
          </Link>
        </div>

        {displayEvents.length === 0 ? (
          <div className="rounded-2xl vba-card p-6 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No upcoming events scheduled at this moment" : "Hiện chưa có sự kiện mới sắp diễn ra"}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isEn ? "Check back later for newly announced club activities" : "Ban sự kiện sẽ cập nhật lịch trình sớm nhất"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.slice(0, 2).map((ev, index) => {
              const eventImg = defaultEventImages[index % defaultEventImages.length];
              return (
                <Link
                  key={ev.id}
                  to="/association/events"
                  className="group relative block overflow-hidden rounded-2xl vba-card p-3.5 shadow-xs transition hover:border-amber-500/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-18 w-20 shrink-0 overflow-hidden rounded-xl bg-[#2E3192]">
                      <img
                        src={eventImg}
                        alt={ev.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-1 left-1 right-1 text-center">
                        <span className="block text-[11px] font-black text-amber-300 leading-none">
                          {ev.day} {ev.month}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10.5px] text-[#2E3192] dark:text-amber-400 font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{ev.time}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">{ev.communityName}</span>
                      </div>

                      <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[var(--vba-text)] transition-colors group-hover:text-amber-500">
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
        )}
      </div>

      {/* ── 2. ƯU ĐÃI HỘI VIÊN & ĐỐI TÁC ── */}
      <div className="relative mx-4 mt-5 flex items-center gap-3 overflow-hidden rounded-2xl vba-card p-4 shadow-xs border border-amber-500/30">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-1.5">
            <Crown className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" />
            <div className="min-w-0 flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] font-bold text-amber-800 dark:text-amber-300 leading-tight">
                {isEn ? "Member & Partner Perks" : "Ưu đãi Hội viên & Đối tác"}
              </span>
              <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs whitespace-nowrap leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping shrink-0" />
                +Hot
              </span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
            {isEn
              ? "Discover price support policies, affiliated gifts and trade benefits exclusive to CEO 1983."
              : "Khám phá các chính sách trợ giá, quà tặng liên kết và quyền lợi giao thương dành riêng cho Hội viên CLB Doanh Nhân CEO 1983."}
          </p>
          <Link
            to="/association/perks"
            className="mt-3 inline-block rounded-xl bg-[#2E3192] hover:bg-[#19194D] px-3.5 py-1.5 text-[10.5px] font-bold text-white shadow-xs transition active:scale-95"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "View perks now" : "Xem ưu đãi ngay"}
          </Link>
        </div>

        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-full bg-blue-400/20 blur-md animate-pulse pointer-events-none" />
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
        {/* Trao cơ hội - Nút bấm Cobalt Navy */}
        <Link
          to="/association/opportunities"
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-[#2E3192]/50 shadow-xs overflow-hidden"
        >
          <span className="absolute -inset-px rounded-2xl border border-[#2E3192]/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-blue-400 shadow-xs overflow-hidden border border-[#2E3192]/20">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png"
                  alt="Trao cơ hội"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {opportunities.length > 0 && (
                <span className="relative inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>+{opportunities.length}</span>
                  <span className="text-[8.5px]">{isEn ? "New" : "Mới"}</span>
                </span>
              )}
            </div>
            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "TRADE OPPORTUNITIES" : "TRAO CƠ HỘI"}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Share business deals and connect for success" : "Chia sẻ cơ hội Kết nối thành công"}
            </p>
          </div>
          <span
            className="mt-3.5 inline-flex self-start rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white px-3.5 py-1 text-[10px] font-bold shadow-xs transition active:scale-95"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "Explore now" : "Khám phá ngay"}
          </span>
        </Link>

        {/* Đăng giới thiệu sản phẩm - Nút bấm Cobalt Navy chuẩn CEO */}
        <Link
          to="/association/products"
          search={{ action: undefined }}
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-[#2E3192]/50 shadow-xs overflow-hidden cursor-pointer"
        >
          <span className="absolute -inset-px rounded-2xl border border-[#2E3192]/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-blue-400 shadow-xs overflow-hidden border border-[#2E3192]/20">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png"
                  alt="Đăng sản phẩm"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {products.length > 0 && (
                <span className="relative inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>+{products.length}</span>
                  <span className="text-[8.5px]">{isEn ? "Hot" : "Mới"}</span>
                </span>
              )}
            </div>
            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "SHOWCASE PRODUCTS" : "ĐĂNG GIỚI THIỆU SẢN PHẨM"}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Promote enterprise products to customers" : "Quảng bá sản phẩm Kết nối khách hàng"}
            </p>
          </div>
          {/* Nút Đăng ngay - Chuẩn màu xanh CEO chữ trắng */}
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
            className="mt-3.5 inline-flex self-start rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white px-3.5 py-1 text-[10px] font-bold shadow-xs transition active:scale-95 cursor-pointer z-10"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "Post now" : "Đăng ngay"}
          </button>
        </Link>
      </div>

      {/* ── 4. DOANH NGHIỆP MỚI GIA NHẬP (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "New Member Enterprises" : "Doanh nghiệp mới gia nhập"}
            </h2>
          </div>
          <Link
            to="/association/members"
            className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
          >
            <span>{isEn ? "Directory" : "Xem danh bạ"}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        {directoryMembers.length === 0 ? (
          <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No new enterprise members recorded this week" : "Chưa có doanh nghiệp mới tuần này"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {directoryMembers.slice(0, 2).map((m) => (
              <Link
                key={m.code}
                to="/association/members"
                className="vba-card flex items-center gap-2.5 rounded-xl p-2.5 shadow-xs transition hover:border-amber-500/50"
              >
                {m.avatar ? (
                  <img
                    src={resolveMediaUrl(m.avatar) || m.avatar}
                    alt={m.name}
                    className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#2E3192] text-[12px] font-black text-white shadow-xs">
                    {initials(m.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-[var(--vba-text)]">
                    {m.name}
                  </div>
                  <div className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">
                    {m.personName || m.industry || (isEn ? "Member" : "Hội viên")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. TIỆN ÍCH THẺ THÔNG MINH (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "Smart Card Utilities" : "Tiện ích thẻ thông minh"}
            </h2>
          </div>
          <Link
            to="/association/card"
            className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
          >
            <span>{isEn ? "Digital Card" : "Xem thẻ số"}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Link
            to="/association/card"
            className="vba-card flex flex-col items-center rounded-2xl p-3 text-center transition hover:border-amber-500/50 shadow-xs active:scale-95"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 dark:bg-sky-950/70 text-[#2E3192] dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 shadow-2xs mb-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-[11.5px] font-extrabold text-[var(--vba-text)]">Chạm NFC</span>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Một chạm kết nối</span>
          </Link>

          <Link
            to="/association/card"
            className="vba-card flex flex-col items-center rounded-2xl p-3 text-center transition hover:border-amber-500/50 shadow-xs active:scale-95"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 shadow-2xs mb-2">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="text-[11.5px] font-extrabold text-[var(--vba-text)]">Apple Wallet</span>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Lưu trữ thẻ số</span>
          </Link>

          <Link
            to="/association/checkin"
            className="vba-card flex flex-col items-center rounded-2xl p-3 text-center transition hover:border-amber-500/50 shadow-xs active:scale-95"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs mb-2">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-[11.5px] font-extrabold text-[var(--vba-text)]">QR Check-in</span>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Vào cửa sự kiện</span>
          </Link>
        </div>
      </div>

      {/* ── 6. TIN HOẠT ĐỘNG CLB (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "Club Activities & News" : "Tin hoạt động CLB"}
            </h2>
          </div>
          <Link
            to="/association/news"
            className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
          >
            <span>{isEn ? "View all" : "Xem tất cả"}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        {newsItems.length === 0 ? (
          <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Newspaper className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No newly published club news" : "Chưa có bản tin mới trong tuần"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {newsItems.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                to="/association/news"
                className="vba-card flex items-center gap-3 rounded-xl p-3 shadow-xs transition hover:border-amber-500/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[12.5px] font-bold text-[var(--vba-text)] leading-snug">
                    {item.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-400 dark:text-slate-500">
                    <span>{item.time || "Gần đây"}</span>
                    <span>•</span>
                    <span className="truncate">{item.author || "Ban Truyền Thông"}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Install hint */}
      <div className="mx-4 mt-5">
        <Link
          to="/install"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-[var(--vba-surface)] py-3 text-[12px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:bg-amber-500/10"
        >
          📲 {isEn ? "Install App to Phone Home Screen" : "Cài đặt ứng dụng lên màn hình chính điện thoại"}
        </Link>
      </div>
    </div>
  );
}
