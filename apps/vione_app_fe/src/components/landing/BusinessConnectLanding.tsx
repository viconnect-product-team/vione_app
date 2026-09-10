import React, { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LangSwitcher } from "@/components/LangSwitcher";
import { LandingInteractiveShowcase } from "./LandingInteractiveShowcase";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Sparkles,
  Users2,
  Briefcase,
  Layers,
  CalendarCheck,
  MessagesSquare,
  BookOpen,
  BarChart3,
  Bot,
  PlugZap,
  Building2,
  Users,
  Coins,
  Globe2,
  Database,
  Contact2,
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Server,
  Activity,
  Award,
  Crown,
  Smartphone,
  Wallet,
  Play,
  Cpu,
  BadgeCheck,
  Check,
  Menu,
  Volume2,
  VolumeX,
  UserCheck,
  Handshake,
  Sun,
  Moon,
  Contrast,
  Network,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type ThemeMode = "dark" | "light" | "contrast";

/** Comprehensive Multi-Language Dictionary for ViOne Business Connect */
const BC_SAAS_I18N = {
  vi: {
    navBadge: "B2B ENTERPRISE",
    navHero: "Khởi Đầu",
    navShowcase: "Trải Nghiệm",
    navPillars: "9 Trụ Cột",
    navSecurity: "Bảo Mật SLA",
    navEcosystem: "Hệ Sinh Thái",
    navBookDemo: "ĐẶT LỊCH TRẢI NGHIỆM →",
    navOpenApp: "Mở App Hội Viên",
    modeDark: "Tối",
    modeLight: "Sáng",
    modeContrast: "Tương phản",

    heroBadge: "★ NỀN TẢNG DOANH NGHIỆP & HIỆP HỘI B2B THẾ HỆ MỚI",
    heroTitle1: "NỀN TẢNG ĐIỀU HÀNH & KẾT NỐI",
    heroTitle2: "GIAO THƯƠNG DOANH NGHIỆP B2B",
    heroTitle3: "CHUẨN MỰC THƯƠNG GIA",
    heroSubtitle:
      "Hợp nhất quản trị hội viên 360°, định danh số Titanium NFC 1-chạm và Trợ lý AI Matchmaking thời gian thực. Đột phá doanh số giao thương nội bộ cho 300+ Hiệp hội và hơn 10.000 Doanh nghiệp hàng đầu.",
    heroCtaDemo: "ĐẶT LỊCH TRẢI NGHIỆM (30 NGÀY MIỄN PHÍ) →",
    heroCtaVideo: "Xem Video KYC & Matchmaking (15s)",

    stat1Num: "10.000+",
    stat1Title: "Doanh Nhân & C-Level",
    stat1Desc: "Đã định danh thẻ số Titanium NFC bảo mật",
    stat2Num: ">5.000 Tỷ",
    stat2Title: "Doanh Số Giao Thương",
    stat2Desc: "Khớp lệnh cung ứng chuỗi nội bộ khép kín",
    stat3Num: "<1.2s",
    stat3Title: "Khớp Lệnh AI Match",
    stat3Desc: "Đề xuất chính xác đối tác chiến lược theo ngành",
    stat4Num: "99.99%",
    stat4Title: "SLA Uptime & An Toàn",
    stat4Desc: "Mã hóa E2E cấp ngân hàng, chuẩn SOC 2 Type II",

    modalSuccessTitle: "Đăng Ký Trải Nghiệm Thành Công!",
    modalSuccessDesc: "Chuyên viên tư vấn cao cấp ViOne sẽ liên hệ trong vòng 15 phút.",
  },
  en: {
    navBadge: "B2B ENTERPRISE",
    navHero: "Overview",
    navShowcase: "Experience",
    navPillars: "9 Pillars",
    navSecurity: "Security SLA",
    navEcosystem: "Ecosystem",
    navBookDemo: "BOOK DEMO (30 DAYS FREE) →",
    navOpenApp: "Open Member App",
    modeDark: "Dark",
    modeLight: "Light",
    modeContrast: "High Contrast",

    heroBadge: "★ NEXT-GEN B2B ASSOCIATION & ENTERPRISE PLATFORM",
    heroTitle1: "NEXT-GENERATION",
    heroTitle2: "B2B COMMERCE & OPERATIONS",
    heroTitle3: "ENTERPRISE PLATFORM",
    heroSubtitle:
      "Unifying 360° member management, 1-touch Titanium NFC smart identity, and real-time AI Matchmaking. Accelerating trade volume for 300+ Associations and 10,000+ industry-leading enterprises.",
    heroCtaDemo: "BOOK DEMO (30 DAYS FREE) →",
    heroCtaVideo: "Watch KYC & Matchmaking Video (15s)",

    stat1Num: "10,000+",
    stat1Title: "Verified C-Level Leaders",
    stat1Desc: "Holding Titanium NFC hardware smart passes",
    stat2Num: ">$200M+",
    stat2Title: "Internal Trade Volume",
    stat2Desc: "Executed through closed-loop supply chains",
    stat3Num: "<1.2s",
    stat3Title: "AI Match Speed",
    stat3Desc: "Instant algorithm matching qualified trade partners",
    stat4Num: "99.99%",
    stat4Title: "Enterprise SLA",
    stat4Desc: "Bank-grade E2E encryption & SOC 2 Type II",

    modalSuccessTitle: "Demo Request Submitted!",
    modalSuccessDesc: "A ViOne enterprise specialist will reach out within 15 minutes.",
  },
};

(BC_SAAS_I18N as any).zh = (BC_SAAS_I18N as any).en;
(BC_SAAS_I18N as any).ja = (BC_SAAS_I18N as any).en;

/**
 * ScrollSection: Alternating Entrance Animation Wrapper
 * direction: "left" -> enters from left to center
 * direction: "right" -> enters from right to center
 * direction: "scale" -> enters with 3D scale up & depth
 */
function ScrollSection({
  children,
  id,
  className = "",
  direction = "left",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  direction?: "left" | "right" | "scale";
}) {
  const initialVariants = {
    left: { opacity: 0, x: -90 },
    right: { opacity: 0, x: 90 },
    scale: { opacity: 0, y: 60, scale: 0.92 },
  };

  return (
    <section id={id} className={`relative w-full py-20 md:py-28 overflow-hidden ${className}`}>
      <motion.div
        initial={initialVariants[direction]}
        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

export function BusinessConnectLanding() {
  const { lang } = useLang();
  const t = BC_SAAS_I18N[lang as "vi" | "en"] || BC_SAAS_I18N.vi;

  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    role: "",
    scale: "100_500",
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (themeMode === "contrast" && contrastClass) return contrastClass;
    if (themeMode === "dark" || themeMode === "contrast") return darkClass;
    return lightClass;
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDemo(true);
    setTimeout(() => {
      setSubmittingDemo(false);
      setDemoSubmitted(true);
      toast.success(t.modalSuccessTitle, {
        description: t.modalSuccessDesc,
      });
    }, 900);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileNavOpen(false);
  };

  const navLinks = [
    { name: t.navHero, id: "hero" },
    { name: t.navShowcase, id: "showcase" },
    { name: t.navPillars, id: "pillars" },
    { name: t.navSecurity, id: "security" },
    { name: t.navEcosystem, id: "ecosystem" },
    { name: "Đặt Lịch", id: "demo" },
  ];

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden selection:bg-[#D8B282]/30 selection:text-[#F6E1C3] transition-colors duration-500 ${themeClass(
        "bg-[#05070E] text-[#F8FAFC]",
        "bg-[#FAF8F5] text-[#181512]",
        "bg-black text-[#F6E1C3]"
      )}`}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* 0. LUXURY GOLD STYLING & KEYFRAMES */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
          
          .luxury-gold-glow {
            box-shadow: 0 0 35px rgba(216, 178, 130, 0.25), inset 0 0 15px rgba(246, 225, 195, 0.15);
          }

          .gold-border-gradient {
            border-image: linear-gradient(135deg, #F6E1C3, #D8B282, #8C653B) 1;
          }

          @keyframes goldSweep {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }

          .gold-sweep-effect::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(60deg, transparent 30%, rgba(246, 225, 195, 0.18) 50%, transparent 70%);
            animation: goldSweep 6s infinite linear;
            pointer-events: none;
          }
        `}
      </style>

      {/* 1. FIXED ULTRA-LUXURY EXECUTIVE HEADER */}
      <header
        className={`sticky top-0 inset-x-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${themeClass(
          "bg-[#05070E]/90 border-[#D8B282]/25 text-white shadow-[0_4px_30px_rgba(0,0,0,0.9)]",
          "bg-[#FAF8F5]/90 border-[#D8B282]/40 text-[#181512] shadow-sm",
          "bg-black/95 border-[#D8B282] text-white"
        )}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Brand Cluster: ViOne in Gold Bronze */}
            <Link to="/business-connect" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#F6E1C3] via-[#D8B282] to-[#8C653B] flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(216,178,130,0.5)] group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282] bg-clip-text text-transparent">
                    VIONE
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#D8B282]/15 text-[#F6E1C3] border border-[#D8B282]/35">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  BUSINESS CONNECT
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 bg-black/40 border border-[#D8B282]/25 rounded-full px-3 py-1.5 backdrop-blur-md">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-3.5 py-1 rounded-full text-xs font-bold text-slate-300 hover:text-[#F6E1C3] hover:bg-[#D8B282]/10 transition-all cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Right Action Bar */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Selector */}
              <div className="flex items-center bg-black/30 border border-[#D8B282]/25 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    themeMode === "dark"
                      ? "bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={t.modeDark}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    themeMode === "light"
                      ? "bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={t.modeLight}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode("contrast")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    themeMode === "contrast"
                      ? "bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={t.modeContrast}
                >
                  <Contrast className="w-3.5 h-3.5" />
                </button>
              </div>

              <LangSwitcher themeMode={themeMode} />

              <Link
                to="/m"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${themeClass(
                  "border-[#D8B282]/30 bg-black/40 hover:bg-[#D8B282]/10 text-[#F6E1C3]",
                  "border-[#D8B282]/50 bg-white text-[#181512] hover:bg-slate-50",
                  "border-yellow-400 bg-black text-yellow-300"
                )}`}
              >
                {t.navOpenApp}
              </Link>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_20px_rgba(216,178,130,0.5)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {t.navBookDemo}
              </button>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 rounded-xl border border-[#D8B282]/30 bg-black/40 text-[#F6E1C3] cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="xl:hidden border-t border-[#D8B282]/20 bg-[#070A14]/98 px-4 py-4 space-y-3 text-white backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="p-2.5 rounded-lg text-center bg-white/5 text-slate-200 hover:text-[#F6E1C3] hover:bg-[#D8B282]/10 border border-[#D8B282]/20"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setDemoModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs text-center shadow-lg"
              >
                {t.navBookDemo}
              </button>
              <Link
                to="/m"
                onClick={() => setMobileNavOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#D8B282]/35 text-center text-xs font-bold text-[#F6E1C3]"
              >
                {t.navOpenApp}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 1: HERO & VALUE PROPOSITION (TOP-TO-BOTTOM FADE UP + LUXURY GRID GIF)
          ========================================================================= */}
      <section id="hero" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Luxury Gold Grid Background GIF with Adaptive Vignette */}
        <div
          className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500 ${themeClass("opacity-30 mix-blend-screen", "opacity-15 mix-blend-multiply", "opacity-20")}`}
          style={{ backgroundImage: "url('/landing/luxury-gold-grid.gif')" }}
        />
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${themeClass(
          "bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.4)_0%,#05070E_85%)]",
          "bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.4)_0%,#FAF8F5_85%)]",
          "bg-black/90"
        )}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Hero Content Entrance */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-4xl"
          >
            {/* Eyebrow Pill in Gold Bronze */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono shadow-md ${themeClass(
                "border-[#D8B282]/45 bg-[#D8B282]/10 text-[#F6E1C3]",
                "border-[#D8B282]/60 bg-[#F6E1C3]/35 text-[#8C653B]",
                "border-yellow-400 bg-yellow-400/20 text-yellow-300"
              )}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8B282]" />
              <span>{t.heroBadge}</span>
            </motion.div>

            {/* Hero H1 Headline with Gold Specular Text */}
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] uppercase ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              <span>{t.heroTitle1} </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] drop-shadow-[0_2px_25px_rgba(216,178,130,0.4)]">
                {t.heroTitle2}
              </span>{" "}
              <span>{t.heroTitle3}</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs sm:text-sm shadow-[0_10px_35px_rgba(216,178,130,0.4)] hover:brightness-110 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.heroCtaDemo}</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className={`px-6 py-4 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-md group ${themeClass(
                  "border-[#D8B282]/45 bg-black/50 text-[#F6E1C3] hover:bg-[#D8B282]/15",
                  "border-[#D8B282]/60 bg-white text-[#8C653B] hover:bg-[#FAF8F5] shadow-sm",
                  "border-yellow-400 bg-black text-yellow-300"
                )}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>{t.heroCtaVideo}</span>
                <span className="w-2 h-2 rounded-full bg-[#D8B282] animate-ping" />
              </button>
            </div>
          </motion.div>

          {/* 4 Telemetry Metrics Grid (Staggered Entrance) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-12"
          >
            {[
              { num: t.stat1Num, title: t.stat1Title, desc: t.stat1Desc, icon: UserCheck, tag: "C-LEVEL" },
              { num: t.stat2Num, title: t.stat2Title, desc: t.stat2Desc, icon: Handshake, tag: "CLOSED-LOOP" },
              { num: t.stat3Num, title: t.stat3Title, desc: t.stat3Desc, icon: Bot, tag: "AI MATCH" },
              { num: t.stat4Num, title: t.stat4Title, desc: t.stat4Desc, icon: ShieldCheck, tag: "SOC 2 TYPE II" },
            ].map((stat, sIdx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={sIdx}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
                  }}
                  whileHover={{ y: -6, scale: 1.02, borderColor: "#F6E1C3" }}
                  className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between transition-all group backdrop-blur-xl shadow-xl ${themeClass(
                    "border-[#D8B282]/30 bg-[#080D1A]/90 hover:bg-[#0E152A]",
                    "border-[#D8B282]/40 bg-white/95 hover:bg-white shadow-md",
                    "border-yellow-400 bg-black text-yellow-300"
                  )}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${themeClass(
                      "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#D8B282]",
                      "bg-[#F6E1C3]/35 border-[#D8B282]/50 text-[#8C653B]",
                      "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                    )}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${themeClass(
                      "bg-black/60 border-[#D8B282]/30 text-[#F6E1C3]",
                      "bg-[#FAF8F5] border-[#D8B282]/50 text-[#8C653B]",
                      "bg-black border-yellow-400 text-yellow-300"
                    )}`}>
                      {stat.tag}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]">
                      {stat.num}
                    </p>
                    <p className={`text-xs sm:text-sm font-bold mt-1 ${themeClass("text-slate-100", "text-[#0F172A]", "text-yellow-300")}`}>{stat.title}</p>
                    <p className={`text-[11px] mt-0.5 leading-snug ${themeClass("text-slate-400", "text-[#475569]", "text-yellow-100")}`}>{stat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE SHOWCASE (ENTERS FROM LEFT)
          ========================================================================= */}
      <ScrollSection id="showcase" direction="left" className="border-t border-[#D8B282]/20 relative">
        {/* Subtle Luxury Matrix Hologram Accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15 mix-blend-screen select-none">
          <img src="/landing/business_connect_matrix_bg.jpg" alt="B2B Matrix Network" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-10">
          <div className="mb-8">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              SHOWCASE 02 • TRẢI NGHIỆM TƯƠNG TÁC
            </span>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              ĐỊNH DANH SỐ NFC & SÀN GIAO THƯƠNG THỜI GIAN THỰC
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Chạm thẻ danh thiếp thông minh Titanium NFC để giải phóng 100% tiềm năng kết nối thương vụ và hội viên cấp cao.
            </p>
          </div>

          <div className={`p-2 sm:p-4 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all ${themeClass(
            "border-[#D8B282]/30 bg-[#070C1A]/85",
            "border-[#D8B282]/50 bg-white/95 shadow-xl",
            "border-yellow-400 bg-black"
          )}`}>
            <LandingInteractiveShowcase />
          </div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 3: 9 TRỤ CỘT NỀN TẢNG (ENTERS FROM RIGHT)
          ========================================================================= */}
      <ScrollSection
        id="pillars"
        direction="right"
        className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
          "bg-[#04060C]",
          "bg-[#FAF8F5]",
          "bg-black"
        )}`}
      >
        {/* High-Tech B2B Matrix Hologram Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/landing/business_connect_matrix_bg.jpg"
            alt="B2B Matrix Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${themeClass(
              "opacity-30 mix-blend-screen brightness-90 contrast-125",
              "opacity-15 mix-blend-multiply contrast-110",
              "opacity-15 mix-blend-screen contrast-150"
            )}`}
          />
          {/* Pulsing Circuit Laser Wave */}
          <svg viewBox="0 0 1440 220" fill="none" className="absolute bottom-0 inset-x-0 w-full opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: "6s" }}>
            <path d="M0,110 Q360,20 720,110 T1440,110" stroke="#D8B282" strokeWidth="2" strokeDasharray="14 10" opacity="0.8" />
            <path d="M0,140 Q360,210 720,140 T1440,140" stroke="#F6E1C3" strokeWidth="1.5" strokeDasharray="20 14" opacity="0.6" />
          </svg>
          {/* Vignette Gradients for Perfect Legibility */}
          <div
            className={`absolute inset-0 ${themeClass(
              "bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]",
              "bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]/95",
              "bg-gradient-to-b from-black via-black/80 to-black"
            )}`}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-10">
          <div className="mb-10">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              MATRIX 03 • 9 TRỤ CỘT NỀN TẢNG
            </span>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              HỆ ĐIỀU HÀNH TOÀN DIỆN CHO HIỆP HỘI & DOANH NGHIỆP
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Số hóa toàn trình vòng đời hội viên, tự động hóa quy trình giao thương và bảo mật dữ liệu tối đa.
            </p>
          </div>

          {/* 3x3 Pillars Grid with Stagger & 3D Depth */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { icon: Users, title: "1. Quản Trị Hội Viên 360°", desc: "Quản lý cơ cấu ban chấp hành, phân quyền đa chi hội và tự động hóa chu kỳ gia hạn." },
              { icon: Smartphone, title: "2. Thẻ Titanium NFC 1-Chạm", desc: "Đồng bộ Apple Wallet & Google Wallet, định danh VIP Pass chuẩn quốc tế." },
              { icon: Handshake, title: "3. Sàn Giao Thương Nội Bộ", desc: "Khớp lệnh chuỗi cung ứng khép kín >5.000 Tỷ VNĐ, loại bỏ chi phí trung gian." },
              { icon: Bot, title: "4. Trợ Lý AI Matchmaking", desc: "Khuyến nghị đối tác chiến lược trong 1.2s dựa trên dữ liệu nhu cầu mua - bán thực tế." },
              { icon: CalendarCheck, title: "5. Sự Kiện & Điểm Danh QR", desc: "Check-in sự kiện 1s, biểu quyết đại hội điện tử thời gian thực chống gian lận." },
              { icon: MessagesSquare, title: "6. Kênh Trao Đổi Mã Hóa E2E", desc: "Phòng Deal kín đàm phán thương vụ 1:1, bảo vệ tuyệt đối bí mật kinh doanh." },
              { icon: BookOpen, title: "7. Cổng Tri Thức Doanh Nghiệp", desc: "Thư viện pháp lý, tiêu chuẩn ngành và đào tạo kỹ năng lãnh đạo thực chiến." },
              { icon: BarChart3, title: "8. Quyết Toán & Dòng Tiền Tự Động", desc: "Tích hợp cổng thanh toán trực tuyến, minh bạch tài chính niên khóa hiệp hội." },
              { icon: PlugZap, title: "9. Open API & Hệ Thống Mở", desc: "Tương thích linh hoạt với phần mềm ERP, CRM và hệ thống ngân hàng đối tác." },
            ].map((p, pIdx) => {
              const PIcon = p.icon;
              return (
                <motion.div
                  key={pIdx}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  whileHover={{ y: -7, scale: 1.025, borderColor: "#F6E1C3" }}
                  className={`p-5 rounded-2xl border backdrop-blur-md transition-all shadow-md flex items-start gap-4 group cursor-pointer ${themeClass(
                    "border-[#D8B282]/30 bg-[#070B18]/90 hover:bg-[#0D152A] shadow-[0_8px_25px_rgba(0,0,0,0.5)]",
                    "border-[#D8B282]/45 bg-white/95 hover:bg-white shadow-[0_8px_20px_rgba(140,101,59,0.12)] hover:shadow-[0_15px_35px_rgba(140,101,59,0.2)]",
                    "border-yellow-400 bg-black text-yellow-300"
                  )}`}
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-all ${themeClass(
                    "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#D8B282] group-hover:bg-[#D8B282] group-hover:text-slate-950",
                    "bg-[#F6E1C3]/35 border-[#D8B282]/50 text-[#8C653B] group-hover:bg-[#8C653B] group-hover:text-white",
                    "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                  )}`}>
                    <PIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors leading-tight ${themeClass(
                      "text-white group-hover:text-[#F6E1C3]",
                      "text-[#0F172A] group-hover:text-[#8C653B]",
                      "text-yellow-300"
                    )}`}>
                      {p.title}
                    </p>
                    <p className={`text-xs mt-1.5 leading-relaxed ${themeClass(
                      "text-slate-300",
                      "text-[#475569]",
                      "text-yellow-100"
                    )}`}>{p.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 4: CHUẨN BẢO MẬT & HẠ TẦNG SLA 99.99% (ENTERS FROM LEFT)
          ========================================================================= */}
      <ScrollSection id="security" direction="left" className="border-t border-[#D8B282]/20 relative">
        {/* Luxury Aurora Flowing Ribbon GIF in Background */}
        <div
          className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500 ${themeClass("opacity-20 mix-blend-screen", "opacity-10 mix-blend-multiply", "opacity-15")}`}
          style={{ backgroundImage: "url('/landing/ceo1983-gold-aurora.gif')" }}
        />
        <div className={`absolute inset-0 pointer-events-none ${themeClass(
          "bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.35)_0%,#05070E_85%)]",
          "bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.4)_0%,#FAF8F5_85%)]",
          "bg-black"
        )}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          <div className="mb-10">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              SECURITY 04 • TIÊU CHUẨN DOANH NGHIỆP
            </span>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              BẢO MẬT CẤP NGÂN HÀNG & CAM KẾT SLA 99.99%
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Kiến trúc hạ tầng Multi-cloud dự phòng địa lý, mã hóa E2E bảo vệ dữ liệu bí mật kinh doanh tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Security Specifications */}
            <div className="space-y-3.5">
              {[
                {
                  title: "Mã Hóa Đầu Cuối AES-256 & RSA-4096",
                  desc: "Dữ liệu đàm phán thương vụ và thông tin tài chính được mã hóa ngay tại thiết bị người dùng.",
                  badge: "E2E ENCRYPTION",
                },
                {
                  title: "Hạ Tầng Multi-Cloud Dự Phòng Địa Lý",
                  desc: "Cụm máy chủ phân tán với khả năng tự động chuyển đổi dự phòng (failover) dưới 3 giây.",
                  badge: "HIGH AVAILABILITY",
                },
                {
                  title: "Tuân Thủ Tiêu Chuẩn ISO 27001 & SOC 2 Type II",
                  desc: "Quy trình kiểm toán bảo mật độc lập định kỳ bảo chứng độ an toàn theo tiêu chuẩn quốc tế.",
                  badge: "AUDITED CERT",
                },
                {
                  title: "Kiểm Soát Truy Cập RBAC & Audit Log 100%",
                  desc: "Ghi nhận nhật ký truy vết chi tiết mọi thao tác phê duyệt hồ sơ và giao dịch trên nền tảng.",
                  badge: "ZERO TRUST",
                },
              ].map((sec, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border backdrop-blur-md flex items-start justify-between gap-4 transition-all ${themeClass(
                    "border-[#D8B282]/30 bg-[#080D1A]/90 hover:border-[#F6E1C3]",
                    "border-[#D8B282]/40 bg-white/95 hover:border-[#8C653B] shadow-sm",
                    "border-yellow-400 bg-black text-yellow-300"
                  )}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#D8B282] shrink-0" />
                      <p className={`text-sm font-bold ${themeClass("text-white", "text-[#0F172A]", "text-yellow-300")}`}>{sec.title}</p>
                    </div>
                    <p className={`text-xs leading-relaxed ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>{sec.desc}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 ${themeClass(
                    "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
                    "bg-[#F6E1C3]/30 border-[#D8B282]/50 text-[#8C653B]",
                    "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                  )}`}>
                    {sec.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Telemetry Dashboard Box */}
            <div className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl flex flex-col justify-between ${themeClass(
              "border-[#D8B282]/40 bg-[#080E1E]/95",
              "border-[#D8B282]/60 bg-white/95 shadow-[0_15px_40px_rgba(140,101,59,0.15)]",
              "border-yellow-400 bg-black text-yellow-300"
            )}`}>
              <div className="flex items-center justify-between border-b border-[#D8B282]/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34D399]" />
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                    LIVE SYSTEM TELEMETRY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#D8B282] font-semibold">
                  REGION: AP-SOUTHEAST (HA DUO)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className={`p-5 rounded-2xl border ${themeClass("bg-black/50 border-[#D8B282]/25", "bg-[#FAF8F5] border-[#D8B282]/40", "bg-black border-yellow-400")}`}>
                  <p className={`text-[11px] font-mono ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>UPTIME RECORD</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D8B282] via-[#8C653B] to-[#D8B282] mt-1">
                    99.99%
                  </p>
                  <p className={`text-[10px] mt-1 ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>Zero unplanned downtime</p>
                </div>
                <div className={`p-5 rounded-2xl border ${themeClass("bg-black/50 border-[#D8B282]/25", "bg-[#FAF8F5] border-[#D8B282]/40", "bg-black border-yellow-400")}`}>
                  <p className={`text-[11px] font-mono ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>API LATENCY</p>
                  <p className="text-3xl font-black text-[#D8B282] mt-1">
                    38ms
                  </p>
                  <p className={`text-[10px] mt-1 ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>Edge response latency</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${themeClass(
                "bg-[#D8B282]/10 border-[#D8B282]/30 text-[#F6E1C3]",
                "bg-[#F6E1C3]/30 border-[#D8B282]/50 text-[#6B4B28]",
                "bg-yellow-400/20 border-yellow-400 text-yellow-300"
              )}`}>
                <CheckCircle2 className="w-5 h-5 text-[#D8B282] shrink-0" />
                <span className="font-medium">Hạ tầng sẵn sàng chịu tải 100.000+ hội viên đồng thời trong các sự kiện đại hội & gala quy mô quốc gia.</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 5: HỆ SINH THÁI & ĐỐI TÁC (ENTERS FROM RIGHT)
          ========================================================================= */}
      <ScrollSection
        id="ecosystem"
        direction="right"
        className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
          "bg-[#04060C]",
          "bg-[#FAF8F5]",
          "bg-black"
        )}`}
      >
        {/* Matrix Network Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/landing/business_connect_matrix_bg.jpg"
            alt="Ecosystem Matrix Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${themeClass(
              "opacity-25 mix-blend-screen brightness-90",
              "opacity-12 mix-blend-multiply",
              "opacity-15"
            )}`}
          />
          <div
            className={`absolute inset-0 ${themeClass(
              "bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]",
              "bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]/95",
              "bg-gradient-to-b from-black via-black/80 to-black"
            )}`}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-10">
          <div className="mb-10">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              ECOSYSTEM 05 • LIÊN MINH DOANH NGHIỆP
            </span>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              KẾT NỐI 300+ HIỆP HỘI & MẠNG LƯỚI ĐỐI TÁC TOÀN QUỐC
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Liên kết sức mạnh của hàng chục nghìn doanh nghiệp thuộc các hiệp hội đầu ngành, tạo lập chuỗi giá trị bền vững.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)",
                role: "ĐỐI TÁC ĐỒNG HÀNH CHIẾN LƯỢC",
                desc: "Mạng lưới lãnh đạo trẻ năng động với hàng nghìn doanh nghiệp hội viên hàng đầu miền Bắc.",
                tag: "HANOIBA",
              },
              {
                name: "Liên Minh Hiệp Hội Doanh Nghiệp Tỉnh Thành",
                role: "300+ HIỆP HỘI TOÀN QUỐC",
                desc: "Kết nối giao thương song phương giữa các tỉnh thành phố, kích cầu tiêu thụ sản phẩm công nghiệp.",
                tag: "PROVINCIAL NETWORK",
              },
              {
                name: "Khối Ngân Hàng & Định Chế Tài Chính",
                role: "BẢO LÃNH TÀI CHÍNH & VỐN",
                desc: "Hỗ trợ hạn mức tín dụng ưu đãi, thanh toán B2B nội bộ và giải pháp tài trợ chuỗi cung ứng.",
                tag: "BANKING PARTNERS",
              },
              {
                name: "Hội Đồng Chuyên Gia & Cố Vấn C-Level",
                role: "QUẢN TRỊ CHIẾN LƯỢC",
                desc: "Đội ngũ chuyên gia pháp lý, thuế và tái cấu trúc doanh nghiệp đồng hành cùng hội viên.",
                tag: "EXECUTIVE ADVISORS",
              },
              {
                name: "Sàn Xúc Tiến Thương Mại Quốc Tế",
                role: "XUẤT KHẨU TOÀN CẦU",
                desc: "Mở rộng kênh thương mại song phương với hơn 20 quốc gia và vùng lãnh thổ đối tác.",
                tag: "GLOBAL TRADE",
              },
              {
                name: "Mạng Lưới Quỹ Đầu Tư & Angel Network",
                role: "ĐẦU TƯ TĂNG TRƯỞNG",
                desc: "Khớp lệnh đầu tư thiên thần và quỹ mạo hiểm cho các dự án tiềm năng trong khối hội viên.",
                tag: "VENTURE CAPITAL",
              },
            ].map((eco, eIdx) => (
              <div
                key={eIdx}
                className={`p-6 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between group ${themeClass(
                  "border-[#D8B282]/30 bg-[#080D1A]/90 hover:border-[#F6E1C3] hover:bg-[#0E162B] shadow-md",
                  "border-[#D8B282]/40 bg-white/95 hover:border-[#8C653B] hover:bg-white shadow-[0_8px_20px_rgba(140,101,59,0.1)] hover:shadow-[0_15px_35px_rgba(140,101,59,0.18)]",
                  "border-yellow-400 bg-black text-yellow-300"
                )}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-[#D8B282] uppercase">
                      {eco.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${themeClass(
                      "bg-black/50 border-[#D8B282]/30 text-slate-300",
                      "bg-[#FAF8F5] border-[#D8B282]/40 text-[#64748B]",
                      "bg-black border-yellow-400 text-yellow-300"
                    )}`}>
                      {eco.tag}
                    </span>
                  </div>
                  <p className={`text-base font-bold transition-colors ${themeClass(
                    "text-white group-hover:text-[#F6E1C3]",
                    "text-[#0F172A] group-hover:text-[#8C653B]",
                    "text-yellow-300"
                  )}`}>{eco.name}</p>
                  <p className={`text-xs mt-2 leading-relaxed ${themeClass(
                    "text-slate-300",
                    "text-[#475569]",
                    "text-yellow-100"
                  )}`}>{eco.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#D8B282]/20 flex items-center gap-1.5 text-xs font-bold text-[#D8B282] group-hover:translate-x-1 transition-transform">
                  <span>Khám phá mạng lưới</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 6: ĐẶT LỊCH TRẢI NGHIỆM (ENTERS WITH 3D SCALE DEPTH)
          ========================================================================= */}
      <ScrollSection id="demo" direction="scale" className="border-t border-[#D8B282]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center mb-8">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              VIP ACCESS 06 • BẮT ĐẦU NGAY HÔM NAY
            </span>
            <h2 className={`text-3xl sm:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              KÍCH HOẠT HỆ SINH THÁI DOANH NGHIỆP
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Đăng ký tư vấn giải pháp chuyển đổi số và nhận trọn quyền trải nghiệm nền tảng trong 30 ngày hoàn toàn miễn phí.
            </p>
          </div>

          {/* Form Card in Theme Adaptive Luxury Glass */}
          <div className={`p-6 sm:p-10 rounded-3xl border backdrop-blur-2xl shadow-2xl relative overflow-hidden ${themeClass(
            "border-[#D8B282]/40 bg-[#080E1C]/95",
            "border-[#D8B282]/60 bg-white/95 shadow-[0_20px_50px_rgba(140,101,59,0.18)]",
            "border-yellow-400 bg-black text-yellow-300"
          )}`}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent" />

            {demoSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#D8B282]/20 border border-[#D8B282] text-[#D8B282] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(216,178,130,0.5)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-black ${themeClass("text-white", "text-[#0F172A]", "text-yellow-300")}`}>Yêu Cầu Đã Được Tiếp Nhận!</h3>
                <p className={`text-sm max-w-md mx-auto ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                  Chuyên viên giải pháp ViOne B2B sẽ liên hệ trực tiếp qua số điện thoại để hỗ trợ kích hoạt tài khoản tổ chức cho bạn.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                      HỌ VÀ TÊN *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                        "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                        "border-yellow-400 bg-black text-yellow-300"
                      )}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                      SỐ ĐIỆN THOẠI / ZALO *
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                        "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                        "border-yellow-400 bg-black text-yellow-300"
                      )}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                      TỔ CHỨC / DOANH NGHIỆP *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.org}
                      onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                      placeholder="Hiệp Hội / Tập Đoàn ABC"
                      className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                        "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                        "border-yellow-400 bg-black text-yellow-300"
                      )}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                      EMAIL DOANH NGHIỆP *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ceo@enterprise.com"
                      className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                        "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                        "border-yellow-400 bg-black text-yellow-300"
                      )}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                  <div className={`text-xs flex items-center gap-2 ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                    <CheckCircle2 className="w-4 h-4 text-[#D8B282]" />
                    <span className="font-medium">Cam kết bảo mật thông tin & Hỗ trợ kỹ thuật 24/7.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingDemo}
                    className="w-full sm:w-auto px-9 py-3.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(216,178,130,0.5)] hover:brightness-110 hover:scale-105 transition-all cursor-pointer"
                  >
                    {submittingDemo ? "Đang gửi..." : "KÍCH HOẠT 30 NGÀY DÙNG THỬ →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          EXECUTIVE FOOTER
          ========================================================================= */}
      <footer className={`border-t py-8 transition-colors duration-500 ${themeClass(
        "border-[#D8B282]/25 bg-[#03050A] text-slate-400",
        "border-[#D8B282]/35 bg-[#FAF8F5] text-[#64748B]",
        "border-yellow-400 bg-black text-yellow-300"
      )}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 ViOne Business Connect Platform. Tiêu chuẩn điều hành doanh nghiệp B2B.</p>
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#D8B282]">
            <span className="hover:text-[#F6E1C3] cursor-pointer">BẢO MẬT E2E</span>
            <span>•</span>
            <span className="hover:text-[#F6E1C3] cursor-pointer">ĐIỀU KHOẢN SLA</span>
            <span>•</span>
            <span className="hover:text-[#F6E1C3] cursor-pointer">HOTLINE: 1900 8888</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS: VIDEO KYC & MATCHMAKING + DEMO SCHEDULER
          ========================================================================= */}
      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-3xl border border-[#D8B282]/50 bg-[#080E1C] overflow-hidden shadow-2xl p-4 sm:p-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8B282]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D8B282] animate-ping" />
                  <span className="text-xs font-mono font-bold text-[#F6E1C3] uppercase">
                    VIDEO BRIEFING • VIONE B2B PLATFORM
                  </span>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1.5 rounded-lg border border-[#D8B282]/30 hover:bg-[#D8B282]/20 text-[#F6E1C3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black mt-3 border border-[#D8B282]/30 shadow-inner">
                <video
                  ref={videoRef}
                  src="/landing/video_vione_kyc.mp4"
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border border-[#D8B282]/50 bg-[#080E1C] p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8B282]/20 mb-4">
                <h3 className="text-base font-bold text-white uppercase">
                  ĐẶT LỊCH TRẢI NGHIỆM NỀN TẢNG (30 NGÀY MIỄN PHÍ)
                </h3>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="p-1.5 rounded-lg border border-[#D8B282]/30 hover:bg-[#D8B282]/20 text-[#F6E1C3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {demoSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#D8B282] mx-auto" />
                  <p className="text-sm text-white font-bold">{t.modalSuccessTitle}</p>
                  <p className="text-xs text-slate-300">{t.modalSuccessDesc}</p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Họ và Tên *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Số điện thoại / Zalo *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Tên Hiệp Hội / Doanh Nghiệp *</label>
                    <input
                      required
                      type="text"
                      value={formData.org}
                      onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                      placeholder="Tập đoàn XYZ"
                      className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingDemo}
                    className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    {submittingDemo ? "Đang gửi..." : "XÁC NHẬN ĐĂNG KÝ →"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
