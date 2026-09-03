import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import infographicAsset from "@/assets/vione-overview.jpg.asset.json";
import appHomeAsset from "@/assets/app-home.png.asset.json";
import appNetworkAsset from "@/assets/app-network.png.asset.json";
import appCardAsset from "@/assets/app-card.png.asset.json";
import appIdentityAsset from "@/assets/app-identity.png.asset.json";
import { QrCanvas } from "@/components/member/QrCanvas";

const appScreens: {
  name: LandingImageName;
  src: string;
  alt: { vi: string; en: string };
}[] = [
  {
    name: "app-home",
    src: appHomeAsset.url,
    alt: { vi: "Trang chủ điều hành", en: "Executive home" },
  },
  {
    name: "app-network",
    src: appNetworkAsset.url,
    alt: { vi: "Mạng lưới quan hệ", en: "Relationship network" },
  },
  {
    name: "app-card",
    src: appCardAsset.url,
    alt: { vi: "Cộng đồng & hiệp hội", en: "Communities & associations" },
  },
  {
    name: "app-identity",
    src: appIdentityAsset.url,
    alt: { vi: "Danh thiếp số & chia sẻ", en: "Digital card & sharing" },
  },
];

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Building2,
  CalendarClock,
  CheckCircle2,
  Cloud,
  Contact2,
  Database,
  Fingerprint,
  Github,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MessagesSquare,
  Network,
  Route as RouteIcon,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Workflow,
  Zap,
  Plus,
  Wand2,
  LayoutGrid,
  Palette,
  ImagePlus,
  QrCode,
} from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import {
  ResponsiveImage,
  type LandingImageName,
} from "@/components/landing/ResponsiveImage";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { baseLang, useLang } from "@/lib/i18n";

const SITE_URL = "https://qlhh.lovable.app";
const LANDING_URL = `${SITE_URL}/landing`;
const LANDING_OG_IMAGE = `${SITE_URL}${infographicAsset.url}`;

const LANDING_TITLE =
  "ViOne — Hệ điều hành kết nối kinh doanh | Business Connection OS";
const LANDING_DESC_VI =
  "ViOne hợp nhất định danh doanh nghiệp, danh thiếp số, quan hệ và trí tuệ nhân tạo trong một nền tảng kết nối kinh doanh hiện đại.";
const LANDING_DESC_EN =
  "ViOne unifies business identity, smart digital cards, relationships and AI in one modern business connection platform.";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: LANDING_TITLE },
      { name: "description", content: `${LANDING_DESC_VI} — ${LANDING_DESC_EN}` },
      { property: "og:site_name", content: "ViOne" },
      { property: "og:title", content: LANDING_TITLE },
      { property: "og:description", content: `${LANDING_DESC_VI} ${LANDING_DESC_EN}` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: LANDING_URL },
      { property: "og:locale", content: "vi_VN" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:image", content: LANDING_OG_IMAGE },
      { property: "og:image:alt", content: "ViOne — Business Connect" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: LANDING_TITLE },
      { name: "twitter:description", content: LANDING_DESC_VI },
      { name: "twitter:image", content: LANDING_OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: LANDING_URL },
      { rel: "alternate", hrefLang: "vi", href: LANDING_URL },
      { rel: "alternate", hrefLang: "en", href: LANDING_URL },
      { rel: "alternate", hrefLang: "x-default", href: LANDING_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ViOne",
          url: LANDING_URL,
          inLanguage: ["vi-VN", "en-US"],
          description: LANDING_DESC_VI,
        }),
      },
    ],
  }),
  component: LandingPage,
});

type Bi = { vi: string; en: string };
const t = (lang: "vi" | "en", b: Bi) => b[lang];

// ---------- Copy ----------
const nav: { label: Bi; href: string }[] = [
  { label: { vi: "Nền tảng", en: "Platform" }, href: "#platform" },
  { label: { vi: "Năng lực", en: "Capabilities" }, href: "#capabilities" },
  { label: { vi: "Danh thiếp", en: "Card Studio" }, href: "#card-studio" },
  { label: { vi: "Hiệp hội", en: "Associations" }, href: "#associations" },
  { label: { vi: "Kiến trúc", en: "Architecture" }, href: "#architecture" },
  { label: { vi: "Khách hàng", en: "Customers" }, href: "#customers" },
];

const associationModules: { icon: typeof Users; title: Bi; desc: Bi }[] = [
  {
    icon: Users,
    title: { vi: "Hội viên & hồ sơ", en: "Members & profiles" },
    desc: {
      vi: "Quản lý hội viên tập trung, phân hạng, xác thực và lịch sử tương tác trong một hồ sơ duy nhất.",
      en: "Centralized member management with tiers, verification and full interaction history.",
    },
  },
  {
    icon: BadgeCheck,
    title: { vi: "Hội phí & gia hạn", en: "Dues & renewals" },
    desc: {
      vi: "Tự động hóa hội phí, nhắc gia hạn nhiều kênh, đối soát thanh toán và xuất báo cáo tài chính.",
      en: "Automated dues, multi-channel renewal reminders, reconciliation and finance reports.",
    },
  },
  {
    icon: CalendarClock,
    title: { vi: "Sự kiện & check-in", en: "Events & check-in" },
    desc: {
      vi: "Tạo sự kiện, phát hành vé QR/NFC, check-in realtime và thống kê tham dự tức thời.",
      en: "Create events, issue QR/NFC tickets, realtime check-in and instant attendance analytics.",
    },
  },
  {
    icon: MessagesSquare,
    title: { vi: "Truyền thông hội viên", en: "Member communications" },
    desc: {
      vi: "Bản tin, thông báo đẩy, email và Zalo/SMS phân đoạn theo hạng hội viên và hành vi.",
      en: "Newsletters, push, email and SMS segmented by tier and behavior.",
    },
  },
  {
    icon: Sparkles,
    title: { vi: "Tài trợ & quyền lợi", en: "Sponsors & benefits" },
    desc: {
      vi: "Onboarding nhà tài trợ, gói quyền lợi, báo cáo hiệu quả và marketplace ưu đãi cho hội viên.",
      en: "Sponsor onboarding, benefit packages, effectiveness reports and a member perks marketplace.",
    },
  },
  {
    icon: ShieldCheck,
    title: { vi: "Quản trị & audit", en: "Governance & audit" },
    desc: {
      vi: "Phân quyền RBAC theo vai trò ban chấp hành, nhật ký audit đầy đủ và tuân thủ dữ liệu cá nhân.",
      en: "RBAC by board role, full audit log and personal-data compliance built in.",
    },
  },
];

const heroStats: { value: string; label: Bi }[] = [
  { value: "500+", label: { vi: "Tổ chức triển khai", en: "Organizations" } },
  { value: "1.2M", label: { vi: "Kết nối kích hoạt", en: "Connections" } },
  { value: "98%", label: { vi: "Tỉ lệ duy trì", en: "Retention" } },
  { value: "99.99%", label: { vi: "Uptime SLA", en: "Uptime SLA" } },
];

const pillars: {
  icon: typeof Fingerprint;
  tag: Bi;
  title: Bi;
  desc: Bi;
  meta: Bi[];
}[] = [
  {
    icon: Fingerprint,
    tag: { vi: "01 · Identity", en: "01 · Identity" },
    title: { vi: "Định danh doanh nghiệp", en: "Business Identity" },
    desc: {
      vi: "Hồ sơ doanh nghiệp & cá nhân được xác thực, đồng bộ trên toàn hệ sinh thái ViOne.",
      en: "Verified business & personal profiles synchronized across the ViOne ecosystem.",
    },
    meta: [
      { vi: "Xác thực đa cấp", en: "Multi-tier verification" },
      { vi: "SSO · OAuth · SAML", en: "SSO · OAuth · SAML" },
    ],
  },
  {
    icon: Contact2,
    tag: { vi: "02 · Card", en: "02 · Card" },
    title: { vi: "Thẻ doanh nghiệp thông minh", en: "Smart Business Card" },
    desc: {
      vi: "Kết nối tức thì qua QR & NFC, lưu vào danh bạ và mở rộng thành mối quan hệ có ngữ cảnh.",
      en: "Instant QR & NFC handshake, saved to contacts and enriched into contextual relationships.",
    },
    meta: [
      { vi: "QR động · NFC · vCard", en: "Dynamic QR · NFC · vCard" },
      { vi: "Tùy biến trường mã hóa", en: "Custom-encoded fields" },
    ],
  },
  {
    icon: Sparkles,
    tag: { vi: "03 · Smart Intro", en: "03 · Smart Intro" },
    title: { vi: "Giới thiệu thông minh", en: "Smart Introduction" },
    desc: {
      vi: "AI khám phá đường dẫn giới thiệu tối ưu qua đồ thị quan hệ có trọng số tin cậy.",
      en: "AI discovers optimal introduction paths across a trust-weighted relationship graph.",
    },
    meta: [
      { vi: "12 tín hiệu đề xuất", en: "12 recommendation signals" },
      { vi: "Trạng thái vòng đời đầy đủ", en: "Full lifecycle states" },
    ],
  },
  {
    icon: CalendarClock,
    tag: { vi: "04 · Meetings", en: "04 · Meetings" },
    title: { vi: "Cuộc họp & lịch đồng bộ", en: "Meetings & Calendar" },
    desc: {
      vi: "Đề xuất khung giờ, xác nhận N-bên, agenda, note chia sẻ và kết quả có trách nhiệm.",
      en: "Slot proposals, N-party confirmations, agendas, shared notes and accountable outcomes.",
    },
    meta: [
      { vi: "Google · Microsoft 365", en: "Google · Microsoft 365" },
      { vi: "DST-safe availability", en: "DST-safe availability" },
    ],
  },
  {
    icon: Brain,
    tag: { vi: "05 · Memory", en: "05 · Memory" },
    title: { vi: "Bộ nhớ mối quan hệ", en: "Relationship Memory" },
    desc: {
      vi: "Trích xuất, chuẩn hóa và truy hồi lai (semantic + graph) — loại trừ private notes theo cấu trúc.",
      en: "Extracts, normalizes and retrieves hybrid memory — private notes structurally excluded.",
    },
    meta: [
      { vi: "pgvector · HNSW · 1536d", en: "pgvector · HNSW · 1536d" },
      { vi: "Provenance & supersession", en: "Provenance & supersession" },
    ],
  },
  {
    icon: BarChart3,
    tag: { vi: "06 · Analytics", en: "06 · Analytics" },
    title: { vi: "Phân tích & vận hành", en: "Analytics & Operations" },
    desc: {
      vi: "Chỉ số sức khỏe mạng lưới, hiệu quả giới thiệu, cảnh báo vận hành thời gian thực.",
      en: "Network health, introduction efficacy and real-time operational alerts.",
    },
    meta: [
      { vi: "Realtime aggregates", en: "Realtime aggregates" },
      { vi: "Alerting & SLO", en: "Alerting & SLO" },
    ],
  },
];

const platformLayers: { icon: typeof Layers; b: Bi }[] = [
  { icon: Users, b: { vi: "Membership · CRM", en: "Membership · CRM" } },
  { icon: Workflow, b: { vi: "Workflow no-code", en: "No-code Workflow" } },
  { icon: MessagesSquare, b: { vi: "Truyền thông & Thông báo", en: "Comms & Notifications" } },
  { icon: Database, b: { vi: "Knowledge & Search", en: "Knowledge & Search" } },
  { icon: Zap, b: { vi: "Automation", en: "Automation" } },
  { icon: GitBranch, b: { vi: "REST · GraphQL · Webhook", en: "REST · GraphQL · Webhook" } },
];

const architecture: { icon: typeof Cloud; b: Bi }[] = [
  { icon: Cloud, b: { vi: "Cloud Native", en: "Cloud Native" } },
  { icon: Layers, b: { vi: "Multi Tenant", en: "Multi Tenant" } },
  { icon: KeyRound, b: { vi: "SSO · OAuth · Azure AD", en: "SSO · OAuth · Azure AD" } },
  { icon: Server, b: { vi: "High Availability", en: "High Availability" } },
  { icon: ShieldCheck, b: { vi: "Disaster Recovery", en: "Disaster Recovery" } },
  {
    icon: Lock,
    b: { vi: "Encryption at rest & in transit", en: "Encryption at rest & in transit" },
  },
  { icon: BadgeCheck, b: { vi: "Audit Log · RBAC", en: "Audit Log · RBAC" } },
  { icon: Database, b: { vi: "Row-Level Security", en: "Row-Level Security" } },
  { icon: Globe, b: { vi: "Private · Hybrid Cloud", en: "Private · Hybrid Cloud" } },
];

const customers: Bi[] = [
  { vi: "TECHCOMBANK", en: "TECHCOMBANK" },
  { vi: "VINAMILK", en: "VINAMILK" },
  { vi: "VIETTEL", en: "VIETTEL" },
  { vi: "FPT", en: "FPT" },
  { vi: "MOMO", en: "MOMO" },
];

// ---------- Small primitives ----------
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      {children}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </div>
      <h2
        className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        style={{ fontFamily: "Sora, sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-base leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// ---------- Smooth scroll ----------
function smoothScrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  const id = href.slice(1);
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return;
  e.preventDefault();
  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 64) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  if (window.history.replaceState) window.history.replaceState(null, "", href);
}

// ---------- Page ----------
function LandingPage() {
  const { lang } = useLang();
  const tx = (b: Bi) => t(baseLang(lang), b);

  return (
    <div
      className="vione-tone min-h-screen w-full overflow-hidden bg-background text-muted-foreground antialiased selection:bg-primary/30"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/landing" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-sm font-bold text-foreground">
              U
            </div>
            <span
              className="text-base font-bold tracking-tight text-foreground"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              ViOne
            </span>
          </Link>
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label={tx({ vi: "Điều hướng trang", en: "Page navigation" })}
          >
            {nav.map((n: any) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => smoothScrollTo(e, n.href)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {tx(n.label)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LangSwitcher showFullLabel />
            <ThemeSwitcher />
            <Link
              to="/demo"
              search={{ source: "header", intent: "schedule" as const }}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              {tx({ vi: "Đặt lịch demo", en: "Book a demo" })}
            </Link>
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              {tx({ vi: "Bắt đầu", en: "Get started" })}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-border/30 px-6 pb-24 pt-24 md:pt-32">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <Eyebrow>ViOne Enterprise · v2.0</Eyebrow>
          <h1
            className="mb-8 mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-7xl"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {tx({ vi: "Hệ điều hành", en: "The operating system for" })}{" "}
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              {tx({ vi: "kết nối kinh doanh", en: "business connection" })}
            </span>{" "}
            {tx({ vi: "toàn diện", en: "at scale" })}
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {tx({
              vi: "Hợp nhất định danh, quan hệ, cuộc họp, workflow và trí tuệ nhân tạo trên một nền tảng duy nhất. ViOne tăng tốc giới thiệu, ghi nhớ mọi tương tác và tối ưu hóa hiệu suất networking cho tổ chức của bạn.",
              en: "Unify identity, relationships, meetings, workflow and AI on a single platform. ViOne accelerates introductions, remembers every interaction and optimizes networking performance for your organization.",
            })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              {tx({ vi: "Bắt đầu miễn phí", en: "Start for free" })}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/demo"
              search={{ source: "hero", intent: "schedule" as const }}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/60 bg-primary/10 px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
            >
              {tx({ vi: "Đặt lịch demo", en: "Book a demo" })}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              {tx({ vi: "Xem nền tảng", en: "Explore platform" })}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Hero visual: system diagnostic panel */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card/80 to-background/80 shadow-2xl shadow-foreground/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                  vione.platform → live
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                ● operational
              </span>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border/40 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  label: { vi: "Introductions / 24h", en: "Introductions / 24h" },
                  value: "12,847",
                  delta: "+18.2%",
                  bars: [40, 55, 42, 60, 78, 66, 82, 74, 90],
                },
                {
                  label: { vi: "Meeting acceptance", en: "Meeting acceptance" },
                  value: "94.6%",
                  delta: "+2.1%",
                  bars: [60, 65, 70, 68, 74, 78, 82, 85, 94],
                },
                {
                  label: { vi: "Relationship strength", en: "Relationship strength" },
                  value: "8.42 / 10",
                  delta: "+0.31",
                  bars: [50, 55, 58, 62, 66, 70, 74, 80, 84],
                },
              ].map((s, i) => (
                <div key={i} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {tx(s.label)}
                    </div>
                    <span className="rounded-md bg-success/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-success">
                      {s.delta}
                    </span>
                  </div>
                  <div
                    className="mt-3 text-3xl font-bold text-foreground"
                    style={{ fontFamily: "Sora, sans-serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-4 flex items-end gap-1.5">
                    {s.bars.map((h, j) => (
                      <div
                        key={j}
                        className="w-full rounded-sm bg-gradient-to-t from-primary/20 to-primary"
                        style={{ height: `${h * 0.4 + 8}px`, opacity: 0.4 + j * 0.07 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border/30 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {heroStats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div
                  className="text-2xl font-bold text-foreground md:text-3xl"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  {s.value}
                </div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {tx(s.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infographic overview */}
      <section id="overview" className="scroll-mt-24 border-b border-border/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHead
            eyebrow={tx({ vi: "Tổng quan", en: "Overview" })}
            title={tx({
              vi: "Business Connect trong một bức tranh",
              en: "Business Connect at a glance",
            })}
            subtitle={tx({
              vi: "Hệ sinh thái, AI trợ lý quan hệ và hiệu quả đã được ghi nhận.",
              en: "Ecosystem, AI relationship assistant and proven outcomes.",
            })}
          />
          <div className="mt-10 overflow-hidden rounded-2xl border border-border/40 bg-card/5 p-2 shadow-2xl">
            <ResponsiveImage
              name="vione-overview"
              fallbackSrc={infographicAsset.url}
              alt={tx({
                vi: "Infographic tổng quan nền tảng Business Connect của ViOne",
                en: "ViOne Business Connect platform overview infographic",
              })}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1120px"
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Capabilities */}

      <section id="capabilities" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow={tx({ vi: "Năng lực cốt lõi", en: "Core capabilities" })}
            title={tx({
              vi: "Sáu trụ cột vận hành một mạng lưới kinh doanh",
              en: "Six pillars to run a business network",
            })}
            subtitle={tx({
              vi: "Được thiết kế cho quy mô doanh nghiệp với tiêu chuẩn bảo mật quốc tế và trải nghiệm dành cho người vận hành.",
              en: "Built for enterprise scale with international security standards and an operator-first experience.",
            })}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <article
                  key={i}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/60"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {tx(p.tag)}
                    </span>
                  </div>
                  <h3
                    className="mb-2 text-lg font-bold text-foreground"
                    style={{ fontFamily: "Sora, sans-serif" }}
                  >
                    {tx(p.title)}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{tx(p.desc)}</p>
                  <ul className="mt-auto space-y-1.5 border-t border-border/60 pt-4">
                    {p.meta.map((m, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {tx(m)}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Association Management */}
      <section id="associations" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow={tx({ vi: "Quản lý hiệp hội", en: "Association management" })}
            title={tx({
              vi: "Hệ điều hành dành riêng cho hiệp hội, câu lạc bộ và cộng đồng doanh nghiệp",
              en: "An operating system purpose-built for associations, clubs and business communities",
            })}
            subtitle={tx({
              vi: "Hợp nhất hội viên, hội phí, sự kiện, tài trợ và truyền thông trên một nền tảng — tăng gắn kết, giảm chi phí vận hành, minh bạch tài chính.",
              en: "Unify members, dues, events, sponsors and comms on one platform — deepen engagement, cut ops cost, keep finance transparent.",
            })}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {associationModules.map((m, i) => {
              const Icon = m.icon;
              return (
                <article
                  key={i}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/60"
                >
                  <ModuleMockup index={i} />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </div>
                    <h3
                      className="mb-2 text-lg font-bold text-foreground"
                      style={{ fontFamily: "Sora, sans-serif" }}
                    >
                      {tx(m.title)}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{tx(m.desc)}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ROI / Before-After */}
          <div className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-6 border-b border-border/60 pb-4">
              <div>
                <div
                  className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ROI · 12 months
                </div>
                <h3
                  className="text-2xl font-bold text-foreground sm:text-3xl"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  {tx({
                    vi: "Lợi ích định lượng — trước & sau khi triển khai",
                    en: "Quantified impact — before & after deployment",
                  })}
                </h3>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                {tx({
                  vi: "Trung bình từ 40+ hiệp hội, khảo sát 2025",
                  en: "Average across 40+ associations, 2025 survey",
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  {
                    metric: { vi: "Tỉ lệ giữ hội viên", en: "Member retention" },
                    before: "68%",
                    after: "94%",
                    delta: "+26pp",
                    unit: { vi: "hội viên", en: "members" },
                  },
                  {
                    metric: { vi: "Thu hội phí đúng hạn", en: "On-time dues collection" },
                    before: "54%",
                    after: "91%",
                    delta: "+37pp",
                    unit: { vi: "hội phí", en: "dues" },
                  },
                  {
                    metric: { vi: "Thời gian check-in / khách", en: "Check-in time / guest" },
                    before: "45s",
                    after: "3s",
                    delta: "-93%",
                    unit: { vi: "sự kiện", en: "events" },
                  },
                  {
                    metric: { vi: "Doanh thu tài trợ", en: "Sponsorship revenue" },
                    before: "₫1.8B",
                    after: "₫4.8B",
                    delta: "×2.7",
                    unit: { vi: "tài trợ", en: "sponsors" },
                  },
                ] as const
              ).map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {tx(r.unit)}
                    </span>
                    <span className="rounded border border-success/40 bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
                      {r.delta}
                    </span>
                  </div>
                  <div className="mb-4 text-sm font-medium text-foreground">{tx(r.metric)}</div>
                  <div className="flex items-end gap-3">
                    <div>
                      <div className="mb-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                        {tx({ vi: "Trước", en: "Before" })}
                      </div>
                      <div
                        className="text-lg font-semibold text-muted-foreground line-through decoration-destructive/50"
                        style={{ fontFamily: "Sora, sans-serif" }}
                      >
                        {r.before}
                      </div>
                    </div>
                    <ArrowRight className="mb-2 h-4 w-4 text-primary" />
                    <div>
                      <div className="mb-0.5 text-[9px] uppercase tracking-wider text-primary">
                        {tx({ vi: "Sau", en: "After" })}
                      </div>
                      <div
                        className="text-2xl font-bold text-foreground"
                        style={{ fontFamily: "Sora, sans-serif" }}
                      >
                        {r.after}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Composite ROI band */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {(
                [
                  {
                    v: "−62%",
                    l: {
                      vi: "Chi phí vận hành văn phòng hiệp hội",
                      en: "Association back-office cost",
                    },
                  },
                  {
                    v: "×3.4",
                    l: {
                      vi: "Số sự kiện tổ chức mỗi năm",
                      en: "Events organized per year",
                    },
                  },
                  {
                    v: "8.2×",
                    l: { vi: "ROI năm đầu tiên", en: "First-year ROI" },
                  },
                ] as const
              ).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5"
                >
                  <div
                    className="text-3xl font-bold text-foreground"
                    style={{ fontFamily: "Sora, sans-serif" }}
                  >
                    {s.v}
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground">{tx(s.l)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Case studies */}
          <div className="mt-16">
            <div className="mb-6 border-b border-border/60 pb-4">
              <div
                className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Case studies · 2024–2026
              </div>
              <h3
                className="text-2xl font-bold text-foreground sm:text-3xl"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx({
                  vi: "Câu chuyện triển khai thực tế",
                  en: "Real-world deployment stories",
                })}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(
                [
                  {
                    tag: "VYEA · Hiệp hội doanh nhân trẻ",
                    region: { vi: "TP.HCM · 1,240 hội viên", en: "HCMC · 1,240 members" },
                    quote: {
                      vi: "Chuẩn hóa hội phí và tự động nhắc gia hạn giúp bộ phận văn phòng tiết kiệm 3 nhân sự.",
                      en: "Standardized dues and auto-renewal reminders cut 3 back-office headcount.",
                    },
                    metrics: [
                      { k: { vi: "Thu hội phí", en: "Dues collected" }, v: "+68%" },
                      { k: { vi: "Thời gian đối soát", en: "Reconciliation" }, v: "−82%" },
                      { k: { vi: "Hội viên hoạt động", en: "Active members" }, v: "94%" },
                    ],
                  },
                  {
                    tag: "SaigonTech Founders Club",
                    region: { vi: "Cộng đồng · 620 thành viên", en: "Community · 620 members" },
                    quote: {
                      vi: "Check-in QR/NFC rút thời gian đón khách từ 45s xuống 3s cho sự kiện 800 người.",
                      en: "QR/NFC check-in cut guest onboarding from 45s to 3s at an 800-person event.",
                    },
                    metrics: [
                      { k: { vi: "Sự kiện/năm", en: "Events / year" }, v: "×3.4" },
                      { k: { vi: "NPS sự kiện", en: "Event NPS" }, v: "72" },
                      { k: { vi: "Chi phí/khách", en: "Cost per guest" }, v: "−47%" },
                    ],
                  },
                  {
                    tag: "Vietnam Coffee Association",
                    region: {
                      vi: "Ngành hàng · 210 doanh nghiệp",
                      en: "Industry body · 210 firms",
                    },
                    quote: {
                      vi: "Cổng tài trợ và báo cáo minh bạch giúp gọi tài trợ vượt kế hoạch 2.1×.",
                      en: "Sponsor portal and transparent reporting drove sponsorships 2.1× above plan.",
                    },
                    metrics: [
                      { k: { vi: "Doanh thu tài trợ", en: "Sponsor revenue" }, v: "×2.1" },
                      { k: { vi: "Gói tài trợ đầy", en: "Packages sold out" }, v: "9/10" },
                      { k: { vi: "ROI năm 1", en: "Year-1 ROI" }, v: "8.2×" },
                    ],
                  },
                ] as const
              ).map((c, i) => (
                <article
                  key={i}
                  className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/50"
                >
                  <header>
                    <div
                      className="text-[10px] uppercase tracking-[0.18em] text-primary"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {c.tag}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx(c.region)}</div>
                  </header>
                  <blockquote className="text-sm leading-relaxed text-foreground">
                    “{tx(c.quote)}”
                  </blockquote>
                  <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border/60 pt-4">
                    {c.metrics.map((m, j) => (
                      <div key={j}>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {tx(m.k)}
                        </dt>
                        <dd
                          className="mt-1 text-lg font-bold text-foreground"
                          style={{ fontFamily: "Sora, sans-serif" }}
                        >
                          {m.v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              {tx({
                vi: "* Tên hiệp hội minh họa cho mục đích trình bày. Số liệu tổng hợp từ triển khai thực tế 2024–2026.",
                en: "* Association names are illustrative. Metrics aggregated from 2024–2026 deployments.",
              })}
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <div className="mb-6 border-b border-border/60 pb-4">
              <div
                className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                FAQ · Association
              </div>
              <h3
                className="text-2xl font-bold text-foreground sm:text-3xl"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx({
                  vi: "Câu hỏi thường gặp về quản lý hiệp hội",
                  en: "Frequently asked questions about association management",
                })}
              </h3>
            </div>
            <FaqList tx={tx} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/demo"
              search={{ source: "association" }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              {tx({ vi: "Yêu cầu demo", en: "Request a demo" })}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              {tx({ vi: "Dùng thử cho hiệp hội", en: "Try for your association" })}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              {tx({ vi: "Xem tích hợp nền tảng", en: "See platform integration" })}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Card Studio — kho mẫu + AI */}
      <section id="card-studio" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow={tx({ vi: "Danh thiếp số", en: "Digital Card Studio" })}
            title={tx({
              vi: "Kho mẫu danh thiếp cao cấp & xưởng thiết kế bằng AI",
              en: "Premium template library & AI-powered card studio",
            })}
            subtitle={tx({
              vi: "Chọn từ 12 mẫu danh thiếp số được thiết kế theo từng ngành nghề, hoặc tải ảnh danh thiếp mẫu lên để AI tự dựng lại theo phong cách của bạn — kèm QR động, NFC và xuất PNG/PDF độ phân giải cao.",
              en: "Pick from 12 industry-mapped premium templates, or upload a reference card image and let AI recreate it in your style — with dynamic QR, NFC and high-res PNG/PDF export.",
            })}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Kho mẫu */}
            <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/60">
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
                  <LayoutGrid className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tx({ vi: "Kho mẫu", en: "Template gallery" })}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  12 templates · 8 industries
                </span>
              </div>

              <h3
                className="mb-3 text-xl font-bold text-foreground"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx({
                  vi: "Chọn mẫu theo ngành — dùng ngay",
                  en: "Industry-mapped, ready to use",
                })}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {tx({
                  vi: "Bộ 12 mẫu sang trọng theo phong cách Executive, Legal, Finance, Tech, Creative, Healthcare, Hospitality và Consulting — bo góc, typography và cặp màu đã tối ưu để quét QR.",
                  en: "12 luxurious presets for Executive, Legal, Finance, Tech, Creative, Healthcare, Hospitality and Consulting — radii, typography and color pairs tuned for QR scannability.",
                })}
              </p>

              {/* Mini template preview grid */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { name: "Executive", grad: "from-foreground to-foreground" },
                  { name: "Legal", grad: "from-primary-glow to-background" },
                  { name: "Finance", grad: "from-success to-foreground" },
                  { name: "Tech", grad: "from-primary to-primary" },
                  { name: "Creative", grad: "from-destructive to-foreground" },
                  { name: "Consulting", grad: "from-warning to-foreground" },
                ].map((tpl) => (
                  <div
                    key={tpl.name}
                    className={`relative flex aspect-[16/10] items-end rounded-md border border-border bg-gradient-to-br ${tpl.grad} p-2`}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/70">
                      {tpl.name}
                    </span>
                    <QrCode className="absolute right-1.5 top-1.5 h-3 w-3 text-foreground/60" />
                  </div>
                ))}
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { vi: "12 mẫu premium · 8 ngành nghề", en: "12 premium presets · 8 industries" },
                  {
                    vi: "QR có logo & khung bo góc theo màu mẫu",
                    en: "Logo-embedded QR with themed rounded frames",
                  },
                  {
                    vi: "Kiểm tra contrast WCAG & auto-optimize",
                    en: "WCAG contrast check & auto-optimize",
                  },
                ].map((li, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                      strokeWidth={2}
                    />
                    <span>{tx(li)}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* AI Studio */}
            <article className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-primary-glow/40 p-6 transition-colors hover:border-primary/60">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-background px-3 py-1.5">
                    <Wand2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {tx({ vi: "AI Studio", en: "AI Studio" })}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Gemini Vision
                  </span>
                </div>

                <h3
                  className="mb-3 text-xl font-bold text-foreground"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  {tx({
                    vi: "Tải ảnh mẫu — AI dựng danh thiếp trong vài giây",
                    en: "Upload a reference — AI recreates your card in seconds",
                  })}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {tx({
                    vi: "Kéo thả một hoặc nhiều ảnh danh thiếp, AI bóc tách trường thông tin, đề xuất mẫu phù hợp, chấm mức độ tự tin từng trường và cho phép chỉnh nhanh, hoàn tác, khôi phục theo AI.",
                    en: "Drop one or many card photos. AI extracts fields, suggests the best template, scores per-field confidence, and enables quick-fix, undo/redo and restore-to-AI.",
                  })}
                </p>

                {/* Flow chips */}
                <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  {[
                    { icon: ImagePlus, label: { vi: "Tải ảnh", en: "Upload" } },
                    { icon: Sparkles, label: { vi: "AI bóc tách", en: "AI extract" } },
                    { icon: Palette, label: { vi: "Chọn mẫu", en: "Pick template" } },
                    { icon: QrCode, label: { vi: "Xuất QR/PDF", en: "Export QR/PDF" } },
                  ].map((step, i, arr) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-foreground">
                          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                          {tx(step.label)}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    {
                      vi: "Batch nhiều ảnh · thumbnail navigation",
                      en: "Multi-image batch · thumbnail navigation",
                    },
                    {
                      vi: "Chấm điểm tự tin từng trường & lọc low-conf",
                      en: "Per-field confidence scoring & low-conf filter",
                    },
                    {
                      vi: "Undo/Redo, lịch sử theo trường, xuất CSV/PDF audit",
                      en: "Undo/Redo, per-field history, CSV/PDF audit export",
                    },
                  ].map((li, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                        strokeWidth={2}
                      />
                      <span>{tx(li)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>

          {/* CTA row */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              {tx({ vi: "Thử tạo danh thiếp", en: "Try the card studio" })}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#capabilities"
              onClick={(e) => smoothScrollTo(e, "#capabilities")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              {tx({ vi: "Xem toàn bộ năng lực", en: "See all capabilities" })}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHead
              eyebrow={tx({ vi: "Nền tảng", en: "The platform" })}
              title={tx({
                vi: "Một hệ điều hành, mọi tầng vận hành",
                en: "One operating system, every operating layer",
              })}
              subtitle={tx({
                vi: "Membership, CRM, workflow no-code, truyền thông, tri thức và tự động hóa — chia sẻ chung một mô hình dữ liệu, một quyền hạn, một audit trail.",
                en: "Membership, CRM, no-code workflow, comms, knowledge and automation — sharing one data model, one authorization, one audit trail.",
              })}
            />
            <div className="grid grid-cols-2 gap-3">
              {platformLayers.map((l, i) => {
                const Icon = l.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3"
                  >
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    <span className="text-sm font-medium text-foreground">{tx(l.b)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagram card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <span
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx({ vi: "Sơ đồ kiến trúc", en: "Architecture map" })}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                vione.core
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  label: { vi: "Product surfaces", en: "Product surfaces" },
                  items: ["Web", "Mobile PWA", "Admin", "Embed SDK"],
                  tone: "text-primary",
                },
                {
                  label: { vi: "Business Connect", en: "Business Connect" },
                  items: ["Identity", "Card", "Intro", "Meeting", "Memory"],
                  tone: "text-primary",
                },
                {
                  label: { vi: "Platform services", en: "Platform services" },
                  items: ["Workflow", "CRM", "Comms", "Search", "AI"],
                  tone: "text-primary",
                },
                {
                  label: { vi: "Data & security", en: "Data & security" },
                  items: ["RLS", "Audit", "Vault", "Backup", "SSO"],
                  tone: "text-muted-foreground",
                },
              ].map((row, i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-background px-3 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${row.tone}`}>
                      {tx(row.label)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">L{4 - i}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {row.items.map((it) => (
                      <span
                        key={it}
                        className="rounded border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-primary/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* App showcase */}
      <section id="app-showcase" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow={tx({ vi: "Ứng dụng di động", en: "Mobile app" })}
            title={tx({
              vi: "Trải nghiệm Business Connect trên điện thoại",
              en: "Business Connect on mobile",
            })}
            subtitle={tx({
              vi: "Trang chủ điều hành, mạng lưới quan hệ, danh thiếp số và chia sẻ danh tính bằng NFC/QR.",
              en: "Executive home, relationship network, digital card and NFC/QR identity sharing.",
            })}
          />
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {appScreens.map((s) => (
              <figure key={s.src} className="group">
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/5 p-1.5 shadow-2xl">
                  <ResponsiveImage
                    name={s.name}
                    fallbackSrc={s.src}
                    alt={tx(s.alt)}
                    sizes="(max-width: 768px) 45vw, (max-width: 1200px) 24vw, 280px"
                    className="h-auto w-full rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="mt-3 text-center text-xs text-muted-foreground">
                  {tx(s.alt)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Vione App QR */}
      <section id="vione-app" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-background p-8 text-center md:p-14">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                <Smartphone className="h-3.5 w-3.5" />
                {tx({ vi: "Ứng dụng di động", en: "Mobile app" })}
              </div>
              <h2
                className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-4xl"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx({ vi: "Vione App", en: "Vione App" })}
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground md:text-base">
                {tx({
                  vi: "Quét mã QR để mở ứng dụng Business Connect trên điện thoại của bạn.",
                  en: "Scan the QR code to open the Business Connect app on your phone.",
                })}
              </p>
              <VioneAppQr />
              <div className="mt-8">
                <Link
                  to="/connect-app"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
                >
                  {tx({ vi: "Mở Vione App", en: "Open Vione App" })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}

      <section id="architecture" className="scroll-mt-24 border-b border-border/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow={tx({ vi: "Kiến trúc & bảo mật", en: "Architecture & security" })}
            title={tx({
              vi: "Chuẩn enterprise từ mọi cấp độ",
              en: "Enterprise-grade at every layer",
            })}
            subtitle={tx({
              vi: "Multi-tenant, cloud-native, RLS toàn diện — sẵn sàng cho triển khai private, hybrid hoặc on-premise.",
              en: "Multi-tenant, cloud-native, RLS end-to-end — ready for private, hybrid or on-premise deployments.",
            })}
          />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-secondary md:grid-cols-3">
            {architecture.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-background px-5 py-5 transition-colors hover:bg-card"
                >
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-foreground">{tx(a.b)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customers */}
      <section id="customers" className="scroll-mt-24 border-b border-border/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {tx({
              vi: "Được tin dùng bởi hơn 500 tổ chức hàng đầu",
              en: "Trusted by 500+ leading organizations",
            })}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-40 md:grid-cols-5">
            {customers.map((c, i) => (
              <div
                key={i}
                className="text-center text-lg font-bold tracking-wider text-muted-foreground"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx(c)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-background p-12 text-center md:p-16">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <h2
            className="relative mb-6 text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {tx({
              vi: "Bắt đầu kỷ nguyên kết nối kinh doanh",
              en: "Start the business connection era",
            })}
          </h2>
          <p className="relative mx-auto mb-10 max-w-lg text-base text-muted-foreground">
            {tx({
              vi: "Triển khai trong 5 phút. Không cần thẻ tín dụng. Hỗ trợ tiếng Việt & English.",
              en: "Deploy in 5 minutes. No credit card required. Full VI & EN support.",
            })}
          </p>
          <CtaDemoForm tx={tx} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-foreground">
              U
            </div>
            <span
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              ViOne
            </span>
            <span className="ml-3 text-xs text-muted-foreground">
              © {new Date().getFullYear()} ViOne Platform
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              {tx({ vi: "Chính sách", en: "Privacy" })}
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              {tx({ vi: "Điều khoản", en: "Terms" })}
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              {tx({ vi: "Bảo mật", en: "Security" })}
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- Vione App QR ----------
function VioneAppQr() {
  const [appUrl, setAppUrl] = useState("/connect-app");
  useEffect(() => {
    setAppUrl(`${window.location.origin}/connect-app`);
  }, []);

  return (
    <div className="flex justify-center">
      <QrCanvas
        value={appUrl}
        size={200}
        dark="#c9a227"
        light="#F5F3EE"
        frameColor="#F5F3EE"
        accent="rgba(201,162,39,0.18)"
      />
    </div>
  );
}

// ---------- Association module mockups ----------
function MockChrome({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative h-40 overflow-hidden border-b border-border bg-gradient-to-br from-secondary via-background to-card">
      <div className="flex items-center gap-1.5 border-b border-border/70 bg-background/80 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-warning/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-success/70" />
        <span
          className="ml-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>
      </div>
      <div className="relative h-[calc(100%-1.75rem)] p-3">{children}</div>
    </div>
  );
}

function ModuleMockup({ index }: { index: number }) {
  // 0 Members, 1 Dues, 2 Events, 3 Communications, 4 Sponsors, 5 Governance
  if (index === 0) {
    return (
      <MockChrome label="members / list">
        <div className="space-y-1.5">
          {[
            { n: "Nguyễn Minh A.", t: "Gold", c: "var(--warning)" },
            { n: "Trần Thu B.", t: "Silver", c: "var(--muted-foreground)" },
            { n: "Lê Quốc C.", t: "Platinum", c: "var(--primary-glow)" },
            { n: "Phạm Hải D.", t: "Gold", c: "var(--warning)" },
          ].map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded border border-border/60 bg-card/60 px-2 py-1.5"
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: `linear-gradient(135deg, ${r.c}, var(--primary))` }}
              />
              <span className="flex-1 truncate text-[10px] text-muted-foreground">{r.n}</span>
              <span
                className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                style={{ color: r.c, background: `${r.c}20` }}
              >
                {r.t}
              </span>
            </div>
          ))}
        </div>
      </MockChrome>
    );
  }
  if (index === 1) {
    return (
      <MockChrome label="dues / 2026">
        <div className="flex h-full items-end gap-1.5">
          {[45, 68, 82, 55, 90, 74, 88, 96, 62, 78, 84, 92].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary to-primary-glow"
                style={{ height: `${h}%` }}
              />
              <span
                className="text-[7px] text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {i + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute right-3 top-3 rounded border border-success/40 bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success">
          +18% YoY
        </div>
      </MockChrome>
    );
  }
  if (index === 2) {
    return (
      <MockChrome label="event / check-in">
        <div className="flex h-full gap-3">
          <div className="flex flex-col items-center justify-center rounded border border-border bg-background p-2">
            <div className="grid h-16 w-16 grid-cols-6 gap-[1px]">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    [
                      0, 2, 5, 7, 8, 11, 13, 16, 18, 21, 24, 27, 29, 30, 33, 35, 1, 9, 14, 22, 26,
                    ].includes(i)
                      ? "bg-card"
                      : "bg-transparent"
                  }
                />
              ))}
            </div>
            <span
              className="mt-1 text-[7px] uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              QR · NFC
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Live</div>
            <div
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              247<span className="text-sm text-muted-foreground">/320</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[77%] bg-gradient-to-r from-primary to-success" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              12 check-ins/min
            </div>
          </div>
        </div>
      </MockChrome>
    );
  }
  if (index === 3) {
    return (
      <MockChrome label="broadcast">
        <div className="space-y-2">
          {[
            { ch: "Email", pct: 92, c: "var(--primary)" },
            { ch: "Push", pct: 76, c: "var(--primary-glow)" },
            { ch: "Zalo", pct: 84, c: "var(--success)" },
            { ch: "SMS", pct: 58, c: "var(--warning)" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-10 text-[9px] uppercase tracking-wider text-muted-foreground">
                {r.ch}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${r.pct}%`, background: r.c }}
                />
              </div>
              <span
                className="w-8 text-right text-[9px] text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {r.pct}%
              </span>
            </div>
          ))}
          <div className="mt-2 rounded border border-border bg-background px-2 py-1.5 text-[9px] text-muted-foreground">
            "Thư mời AGM 2026" · 3,240 recipients
          </div>
        </div>
      </MockChrome>
    );
  }
  if (index === 4) {
    return (
      <MockChrome label="sponsors / packages">
        <div className="grid grid-cols-3 gap-2">
          {[
            { t: "Diamond", c: "var(--primary-glow)", n: 3 },
            { t: "Gold", c: "var(--warning)", n: 8 },
            { t: "Silver", c: "var(--muted-foreground)", n: 14 },
          ].map((r, i) => (
            <div
              key={i}
              className="rounded border border-border bg-background p-2"
              style={{ boxShadow: `inset 0 -2px 0 ${r.c}` }}
            >
              <div className="text-[8px] uppercase tracking-wider" style={{ color: r.c }}>
                {r.t}
              </div>
              <div
                className="mt-1 text-lg font-bold text-foreground"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {r.n}
              </div>
              <div className="text-[8px] text-muted-foreground">active</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between rounded border border-primary/30 bg-primary/5 px-2 py-1.5">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Revenue</span>
          <span
            className="text-[11px] font-bold text-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ₫ 4.82B
          </span>
        </div>
      </MockChrome>
    );
  }
  return (
    <MockChrome label="audit / rbac">
      <div className="space-y-1">
        {[
          { r: "President", a: "approved bylaws v3.2", t: "2m", c: "var(--success)" },
          { r: "Treasurer", a: "signed Q1 report", t: "14m", c: "var(--primary)" },
          { r: "Secretary", a: "added 3 members", t: "1h", c: "var(--primary-glow)" },
          { r: "Auditor", a: "reviewed logs", t: "3h", c: "var(--warning)" },
        ].map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-l-2 py-1 pl-2"
            style={{ borderColor: r.c }}
          >
            <span
              className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
              style={{ color: r.c, background: `${r.c}15` }}
            >
              {r.r}
            </span>
            <span className="flex-1 truncate text-[9px] text-muted-foreground">{r.a}</span>
            <span
              className="text-[8px] text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {r.t}
            </span>
          </div>
        ))}
      </div>
    </MockChrome>
  );
}

function CtaDemoForm({ tx }: { tx: (b: Bi) => string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  return (
    <form
      className="relative flex flex-col items-center justify-center gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({
          to: "/demo",
          search: { source: "landing-cta", email: email.trim() || undefined },
        });
      }}
    >
      <label htmlFor="cta-email" className="sr-only">
        Email
      </label>
      <input
        id="cta-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={tx({ vi: "Email doanh nghiệp", en: "Business email" })}
        className="w-full rounded-lg border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-80"
      />
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 sm:w-auto"
      >
        {tx({ vi: "Yêu cầu demo", en: "Request a demo" })}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function FaqList({ tx }: { tx: (b: Bi) => string }) {
  const items: { q: Bi; a: Bi; tag: Bi }[] = [
    {
      tag: { vi: "Đa ngôn ngữ", en: "i18n" },
      q: {
        vi: "Nền tảng hỗ trợ những ngôn ngữ nào cho hội viên và ban điều hành?",
        en: "Which languages are supported for members and the executive board?",
      },
      a: {
        vi: "Mặc định song ngữ Việt–Anh trên toàn bộ giao diện hội viên, quản trị, email, thông báo đẩy và Zalo/SMS. Kiến trúc i18n cho phép mở rộng sang Nhật, Hàn, Trung, Pháp… mà không đổi mã nguồn — chỉ cần bổ sung bộ dịch. Nội dung do hiệp hội tạo (bài viết, sự kiện, quyền lợi) hỗ trợ đa bản dịch song song và tự động rơi về ngôn ngữ chính khi thiếu bản dịch.",
        en: "Vietnamese and English are enabled out of the box across member, admin, email, push and Zalo/SMS surfaces. The i18n layer scales to Japanese, Korean, Chinese, French and more with translation packs — no code changes. Association-authored content (news, events, benefits) supports parallel translations and falls back to the primary locale when a translation is missing.",
      },
    },
    {
      tag: { vi: "Check-in", en: "Check-in" },
      q: {
        vi: "Check-in sự kiện hoạt động thế nào và có chạy được offline không?",
        en: "How does event check-in work — and does it work offline?",
      },
      a: {
        vi: "Mỗi vé phát hành mã QR ký số và có thể ghi vào thẻ NFC. Ứng dụng check-in trên điện thoại quét QR hoặc chạm NFC dưới 3 giây/khách, hỗ trợ nhiều cửa cùng lúc, tự đồng bộ realtime. Khi mất mạng, thiết bị vẫn quét, xác thực chữ ký cục bộ và đẩy dữ liệu lên khi có kết nối trở lại — không trùng, không sót.",
        en: "Every ticket carries a signed QR code and can be written to an NFC card. The mobile check-in app scans QR or taps NFC in under 3 seconds per guest, supports multiple gates in parallel and syncs in real time. Offline, devices keep scanning, verify signatures locally and reconcile on reconnect — no duplicates, no misses.",
      },
    },
    {
      tag: { vi: "Bảo mật", en: "Security" },
      q: {
        vi: "Dữ liệu hội viên được bảo vệ như thế nào?",
        en: "How is member data protected?",
      },
      a: {
        vi: "Mọi bảng dữ liệu bật Row-Level Security theo vai trò (chủ tịch, thủ quỹ, thư ký, hội viên) — không thể truy cập chéo. Mật khẩu và khoá bí mật lưu trong vault, mã hoá AES-256 khi lưu và TLS 1.3 khi truyền. Nhật ký audit ghi mọi hành động nhạy cảm kèm IP và người thực hiện. Hệ thống thiết kế theo GDPR và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, hỗ trợ yêu cầu xoá và xuất dữ liệu.",
        en: "Every table has role-based Row-Level Security (president, treasurer, secretary, member) — no cross-tenant reads. Passwords and secrets sit in a vault, encrypted at rest with AES-256 and in transit over TLS 1.3. An audit log records every sensitive action with actor and IP. The system is designed against GDPR and Vietnam's Decree 13/2023 on personal data protection, with export and erasure workflows.",
      },
    },
    {
      tag: { vi: "Bảo mật", en: "Security" },
      q: {
        vi: "Ai được xem hồ sơ hội viên, giao dịch hội phí và quyền lợi tài trợ?",
        en: "Who can see member profiles, dues transactions and sponsor benefits?",
      },
      a: {
        vi: "Phân quyền RBAC theo vai trò ban chấp hành: thủ quỹ thấy hội phí nhưng không sửa hồ sơ; thư ký sửa hồ sơ nhưng không xem tài chính; chủ tịch có toàn quyền đọc kèm audit. Hội viên chỉ thấy dữ liệu của chính mình và những gì hiệp hội chủ động công khai. Mọi thay đổi vai trò đều được ghi log bất biến.",
        en: "Executive-board RBAC: the treasurer sees dues but cannot edit profiles; the secretary edits profiles but cannot view finance; the president has full read with audit. Members only see their own data plus what the association publishes. Every role change is written to an immutable audit log.",
      },
    },
    {
      tag: { vi: "Check-in", en: "Check-in" },
      q: {
        vi: "Có thể phát hành vé kèm mã QR/PDF cho khách ngoài hội viên không?",
        en: "Can we issue tickets with QR/PDF to non-member guests?",
      },
      a: {
        vi: "Có. Sự kiện hỗ trợ nhiều loại vé (VIP, đối tác, khách mời, hội viên), phát hành PNG hoặc PDF kèm QR có chữ ký. Có thể tuỳ chỉnh trường nào được mã hoá trong QR để phù hợp quy định bảo mật của hiệp hội — ví dụ chỉ mã hoá ID vé thay vì thông tin cá nhân.",
        en: "Yes. Events support multiple ticket types (VIP, partner, guest, member) and issue PNG or PDF assets with signed QR codes. You choose exactly which fields are encoded — for example only the ticket ID rather than PII — to match your security policy.",
      },
    },
    {
      tag: { vi: "Triển khai", en: "Onboarding" },
      q: {
        vi: "Thời gian triển khai cho một hiệp hội trung bình là bao lâu?",
        en: "How long does onboarding take for a typical association?",
      },
      a: {
        vi: "Từ 2 đến 6 tuần tuỳ quy mô. Chúng tôi nhập khẩu hội viên từ Excel/CSV/Google Sheets, cấu hình phân quyền ban chấp hành, chạy sự kiện pilot và đào tạo trong 2 buổi. Không cần đội IT nội bộ.",
        en: "Between 2 and 6 weeks depending on scale. We import members from Excel/CSV/Google Sheets, configure board roles, run a pilot event and train your team across two sessions. No in-house IT required.",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {items.map((it, i) => (
        <details
          key={i}
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/60 open:border-primary/60"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
            <div className="flex-1">
              <div
                className="mb-2 inline-block rounded border border-border bg-secondary/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {tx(it.tag)}
              </div>
              <div
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {tx(it.q)}
              </div>
            </div>
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45 group-open:border-primary group-open:text-primary">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </summary>
          <p className="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
            {tx(it.a)}
          </p>
        </details>
      ))}
    </div>
  );
}
