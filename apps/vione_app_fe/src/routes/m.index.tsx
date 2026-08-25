import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  IdCard,
  Contact,
  Users,
  Calendar,
  Newspaper,
  FolderOpen,
  LayoutGrid,
  Gift,
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
  QrCode,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SectionTitle } from "@/components/member/MemberShell";
import { QrCanvas } from "@/components/member/QrCanvas";
import heroImg from "@/assets/vba-hero.jpg";
import giftImg from "@/assets/vba-gift.png";
import eventImg from "@/assets/vba-event.jpg";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  listMyEvents,
  getMyAssociationBrand,
  type MyMember,
  type MyEvent,
  type MyAssociationBrand,
} from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
const appIcon = "/app-icon.png";

export const Route = createFileRoute("/m/")({
  component: Home,
});

function initials(name?: string) {
  if (!name) return "ViOne";
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const quickActionDefs = [
  { key: "m.index.qaCard", icon: IdCard, to: "/m/card" },
  { key: "m.index.qaBusinessCards", icon: Contact, to: "/m/business-cards" },
  { key: "m.index.qaMembers", icon: Users, to: "/m/members" },
  { key: "m.index.qaEvents", icon: Calendar, to: "/m/events" },
  { key: "m.index.qaNews", icon: Newspaper, to: "/m/news" },
  { key: "m.index.qaLibrary", icon: FolderOpen, to: "/m/library" },
  { key: "m.index.qaPerks", icon: LayoutGrid, to: "/m/perks" },
  { key: "m.index.qaOffers", icon: Gift, to: "/m" },
  { key: "m.index.qaContact", icon: Phone, to: "/m" },
] as const;

function Home() {
  const t = useT();
  const fetchMember = useServerFn(getMyMember);
  const fetchEvents = useServerFn(listMyEvents);
  const fetchBrand = useServerFn(getMyAssociationBrand);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const { data: events } = useServerData<MyEvent[]>(() => fetchEvents(), []);
  const { data: brand } = useServerData<MyAssociationBrand | null>(() => fetchBrand(), null);
  const code = member?.code ?? "";
  const firstEvent = events[0];
  return (
    <div className="vba-animate">
      {/* Hero with overlaid header */}
      <div className="relative">
        <img
          src={heroImg}
          alt={t("m.index.heroAlt")}
          className="absolute inset-0 h-full w-full object-cover"
          width={1024}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/70 to-background" />

        <div className="relative">
          {/* Brand header */}
          <header className="flex items-center justify-between px-4 pt-5">
            <div className="flex items-center gap-2.5">
              <img
                src={brand?.logoUrl || appIcon}
                alt={brand?.name || "ViOne"}
                className="h-10 w-10 rounded-lg object-contain"
                width={40}
                height={40}
              />
              <div className="leading-tight">
                {brand?.name ? (
                  <div className="max-w-[190px] text-[13px] font-extrabold leading-snug tracking-tight vba-gold-text">
                    {brand.name}
                  </div>
                ) : (
                  <>
                    <div className="text-[13px] font-extrabold tracking-tight vba-gold-text">
                      {t("m.index.brandLine1")}
                    </div>
                    <div className="text-[11px] font-semibold tracking-[0.25em] text-[var(--vba-text-muted)]">
                      {t("m.index.brandLine2")}
                    </div>
                  </>
                )}
              </div>
            </div>
            <Link to="/m/notifications" aria-label={t("m.index.notifAria")} className="relative">
              <Bell className="h-6 w-6 text-[var(--vba-gold)]" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--vba-danger)]" />
            </Link>
          </header>

          {/* Hero title + QR */}
          <div className="flex items-start justify-between gap-3 px-4 pb-28 pt-6">
            <div>
              <h2 className="text-[30px] font-extrabold leading-[1.12] vba-gold-text">
                {t("m.index.heroTitle")}
              </h2>
              <div className="mt-3 h-px w-16 bg-[var(--vba-gold)]/60" />
              <p className="mt-3 text-[12px] leading-relaxed text-[var(--vba-text-muted)]">
                {t("m.index.heroSlogan")}
              </p>
            </div>

            {/* Gold metallic QR — quét để mở thẻ hội viên */}
            <Link
              to="/card/$code"
              params={{ code }}
              aria-label={t("m.index.qrAria")}
              className="mt-1 flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-[var(--vba-gold)]/50 vba-gold-grad p-2 shadow-elevated"
            >
              <QrCanvas
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/card/${code}`
                    : `/card/${code}`
                }
                size={104}
                light="#f7e3a3"
                dark="#1a1206"
              />
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary-foreground">
                <QrCode className="h-3 w-3" /> {t("m.index.qrScan")}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Member card */}
      <Link to="/m/card" className="relative z-10 -mt-16 mx-4 flex items-start gap-4 vba-card p-4">
        {member?.avatar ? (
          <img
            src={member.avatar}
            alt={member?.name ?? ""}
            className="h-[60px] w-[60px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full vba-gold-grad text-[22px] font-bold text-primary-foreground">
            {initials(member?.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[17px] font-bold text-[var(--vba-text)]">
              {member?.name ?? "..."}
            </span>
            {member?.verified && (
              <BadgeCheck className="h-[18px] w-[18px] shrink-0 text-[var(--vba-gold)]" />
            )}
          </div>
          <div className="mt-0.5 truncate text-[13px] text-[var(--vba-text-muted)]">
            {member?.title || member?.industry}
          </div>
          <div className="truncate text-[13px] text-[var(--vba-text-muted)]">
            {member?.status === "active" ? t("m.status.active") : member?.status}
          </div>
          {member?.code && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[var(--vba-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--vba-gold)]">
              {t("m.index.memberCode")}: {member.code}
              <Copy className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <ChevronRight className="mt-5 h-5 w-5 shrink-0 text-[var(--vba-text-dim)]" />
      </Link>

      {/* Quick actions */}
      <div className="mx-4 mt-5 grid grid-cols-4 gap-3">
        {quickActionDefs.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.key} to={a.to} className="flex flex-col items-center gap-2">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] text-[var(--vba-gold)]">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-center text-[11px] font-medium text-[var(--vba-text-muted)]">
                {t(a.key)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Promo pair */}
      <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
        <Link to="/m/opportunities" className="vba-card flex flex-col p-4">
          <Handshake className="mb-2 h-8 w-8 text-[var(--vba-gold)]" />
          <div className="text-[13px] font-bold text-[var(--vba-text)]">
            {t("m.index.promoOppTitle")}
          </div>
          <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--vba-text-muted)]">
            {t("m.index.promoOppDesc")}
          </p>
          <span className="mt-3 self-start rounded-lg vba-gold-grad px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            {t("m.index.exploreNow")}
          </span>
        </Link>
        <Link to="/m/products" className="vba-card flex flex-col p-4">
          <Package className="mb-2 h-8 w-8 text-[var(--vba-gold)]" />
          <div className="text-[13px] font-bold leading-tight text-[var(--vba-text)]">
            {t("m.index.promoProductTitle")}
          </div>
          <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--vba-text-muted)]">
            {t("m.index.promoProductDesc")}
          </p>
          <span className="mt-3 self-start rounded-lg vba-gold-grad px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            {t("m.index.postNow")}
          </span>
        </Link>
      </div>

      {/* Privilege banner */}
      <div className="relative mx-4 mt-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-[var(--vba-border)] bg-gradient-to-r from-primary/25 to-primary/10 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <Crown className="h-5 w-5 shrink-0 text-[var(--vba-gold)]" />
            <div className="text-[13px] font-bold vba-gold-text">{t("m.index.privilegeTitle")}</div>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
            {t("m.index.privilegeDesc")}
          </p>
          <span className="mt-3 inline-block rounded-lg vba-gold-grad px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            {t("m.index.viewNow")}
          </span>
        </div>
        <img
          src={giftImg}
          alt={t("m.index.giftAlt")}
          loading="lazy"
          width={512}
          height={512}
          className="h-28 w-28 shrink-0 object-contain"
        />
      </div>

      {/* Featured events */}
      <div className="mx-4 mt-6">
        <SectionTitle
          title={t("m.index.featuredEvents")}
          action={
            <Link
              to="/m/events"
              className="flex items-center gap-0.5 text-[12px] font-medium text-[var(--vba-gold)]"
            >
              {t("m.index.viewAll")} <ChevronRight className="h-4 w-4" />
            </Link>
          }
        />
        {firstEvent && (
          <div className="vba-card flex gap-3 p-3">
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl">
              <img
                src={eventImg}
                alt={firstEvent.title}
                loading="lazy"
                width={512}
                height={512}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-lg bg-foreground/80 backdrop-blur-sm">
                <span className="text-[18px] font-extrabold leading-none text-[var(--vba-gold)]">
                  {firstEvent.day}
                </span>
                <span className="text-[9px] font-bold text-[var(--vba-gold)]">
                  {firstEvent.month}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[13px] font-semibold text-[var(--vba-text)]">
                {firstEvent.title}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--vba-text-muted)]">
                <Clock className="h-3.5 w-3.5 text-[var(--vba-gold)]" /> {firstEvent.time}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--vba-text-muted)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--vba-gold)]" /> {firstEvent.place}
              </div>
            </div>
            <Bookmark className="h-5 w-5 shrink-0 text-[var(--vba-text-dim)]" />
          </div>
        )}
      </div>

      {/* Install hint */}
      <div className="mx-4 mt-5">
        <Link
          to="/install"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--vba-border)] py-3 text-[12px] font-medium text-[var(--vba-gold)]"
        >
          📲 {t("m.index.installHint")}
        </Link>
      </div>
    </div>
  );
}
