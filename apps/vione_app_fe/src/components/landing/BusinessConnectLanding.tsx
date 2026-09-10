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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Contrast,
  Network,
  ChevronDown,
  Factory,
  Leaf,
  PieChart,
  Disc,
  Target,
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

  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // 3-Step Registration Wizard State
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [modalRegisterStep, setModalRegisterStep] = useState<1 | 2 | 3>(1);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    role: "Chủ tịch / Tổng Giám đốc",
    scale: "50_200",
    industry: "Công nghệ & Chuyển đổi số",
    needs: ["Thẻ Danh Thiếp Thông Minh NFC Titanium", "AI Matchmaking & Ghép Nối Đối Tác"],
    consultType: "online",
    consultTime: "morning",
    vipCode: "VIONE-VIP30",
  });

  const toggleNeed = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((n) => n !== need)
        : [...prev.needs, need],
    }));
  };

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
      toast.success(t.modalSuccessTitle || "Kích hoạt thành công!", {
        description: t.modalSuccessDesc || "Đã gửi thông tin kích hoạt gói dùng thử VIP 30 ngày.",
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
    { name: "Kim Tự Tháp", id: "pyramid" },
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

          @keyframes spinClockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spinCounterClockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes radarSweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-gear-cw {
            animation: spinClockwise 48s linear infinite;
          }
          .animate-gear-ccw {
            animation: spinCounterClockwise 36s linear infinite;
          }
          .animate-radar-sweep {
            animation: radarSweep 7s linear infinite;
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
                  <span className={`font-black text-lg tracking-tight bg-clip-text text-transparent ${themeClass(
                    "bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                    "bg-gradient-to-r from-[#785124] via-[#9E6B30] to-[#5C3D1E]",
                    "bg-yellow-300"
                  )}`}>
                    VIONE
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${themeClass(
                    "bg-[#D8B282]/15 text-[#F6E1C3] border-[#D8B282]/35",
                    "bg-[#F6E1C3]/50 text-[#785124] border-[#D8B282]/60",
                    "bg-yellow-400/20 text-yellow-300 border-yellow-400"
                  )}`}>
                    ENTERPRISE
                  </span>
                </div>
                <p className={`text-[10px] font-mono tracking-wider uppercase ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>
                  BUSINESS CONNECT
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={`hidden xl:flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md border ${themeClass(
              "bg-black/40 border-[#D8B282]/25",
              "bg-white/90 border-[#D8B282]/50 shadow-xs",
              "bg-black border-yellow-400"
            )}`}>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${themeClass(
                    "text-slate-300 hover:text-[#F6E1C3] hover:bg-[#D8B282]/10",
                    "text-[#4A3F35] hover:text-[#785124] hover:bg-[#F6E1C3]/30",
                    "text-yellow-200 hover:text-yellow-400"
                  )}`}
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
        {/* Dedicated Background per Theme (Không gộp chung ảnh) */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
              style={{ backgroundImage: "url('/landing/luxury-gold-grid.gif')" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.4)_0%,#05070E_85%)]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="High-End Daylight Business HQ"
              className="w-full h-full object-cover object-center opacity-40 filter brightness-105 contrast-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.45)_0%,#FAF8F5_85%)]" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: "url('/landing/luxury-gold-grid.gif')" }}
            />
            <div className="absolute inset-0 bg-black/95" />
          </div>
        )}

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
                "border-[#D8B282]/60 bg-[#F6E1C3]/35 text-[#785124] font-black",
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
              <span className={`text-transparent bg-clip-text ${themeClass(
                "bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] drop-shadow-[0_2px_25px_rgba(216,178,130,0.4)]",
                "bg-gradient-to-r from-[#785124] via-[#9E6B30] to-[#5C3D1E] drop-shadow-sm font-black",
                "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-200"
              )}`}>
                {t.heroTitle2}
              </span>{" "}
              <span>{t.heroTitle3}</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl font-medium ${themeClass(
              "text-slate-300",
              "text-[#2D3748]",
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
                  "border-[#D8B282]/60 bg-white text-[#785124] hover:bg-[#FAF8F5] shadow-sm",
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

          {/* 4 Telemetry Metrics Grid with High-Tech Circular Radial Ring Gauges */}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12"
          >
            {[
              { num: t.stat1Num, title: t.stat1Title, desc: t.stat1Desc, icon: UserCheck, tag: "C-LEVEL", pct: 100, color: "#D8B282" },
              { num: t.stat2Num, title: t.stat2Title, desc: t.stat2Desc, icon: Handshake, tag: "CLOSED-LOOP", pct: 94, color: "#F6E1C3" },
              { num: t.stat3Num, title: t.stat3Title, desc: t.stat3Desc, icon: Bot, tag: "AI MATCH", pct: 98, color: "#D8B282" },
              { num: t.stat4Num, title: t.stat4Title, desc: t.stat4Desc, icon: ShieldCheck, tag: "SOC 2 TYPE II", pct: 99.99, color: "#34D399" },
            ].map((stat, sIdx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={sIdx}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
                  }}
                  whileHover={{ y: -6, scale: 1.025, borderColor: "#F6E1C3" }}
                  className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between transition-all group backdrop-blur-xl shadow-xl relative overflow-hidden ${themeClass(
                    "border-[#D8B282]/30 bg-[#080D1A]/90 hover:bg-[#0E152A]",
                    "border-[#D8B282]/60 bg-white/98 shadow-[0_12px_32px_rgba(120,81,36,0.12)] hover:border-[#9E6B30] hover:shadow-[0_16px_40px_rgba(120,81,36,0.18)]",
                    "border-yellow-400 bg-black text-yellow-300"
                  )}`}
                >
                  {/* Top Bar with Tag and Live Pulse Dot */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${themeClass(
                      "bg-black/60 border-[#D8B282]/30 text-[#F6E1C3]",
                      "bg-[#FAF8F5] border-[#D8B282]/50 text-[#785124]",
                      "bg-black border-yellow-400 text-yellow-300"
                    )}`}>
                      {stat.tag}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#D8B282] animate-ping" />
                  </div>

                  {/* Circular Radial Gauge Element */}
                  <div className="flex items-center gap-4 my-2">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        {/* Background Track Circle */}
                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                        {/* Animated Fill Circle */}
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          stroke={stat.color}
                          strokeWidth="4.5"
                          strokeDasharray={201}
                          strokeDashoffset={201 - (201 * (stat.pct > 99 ? 99.99 : stat.pct)) / 100}
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_8px_rgba(216,178,130,0.5)]"
                        />
                      </svg>
                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center text-[#D8B282] group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div>
                      <p className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text ${themeClass(
                        "bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                        "bg-gradient-to-r from-[#785124] via-[#9E6B30] to-[#5C3D1E]",
                        "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-200"
                      )}`}>
                        {stat.num}
                      </p>
                      <p className={`text-xs font-bold leading-tight mt-0.5 ${themeClass("text-slate-100", "text-[#0F172A]", "text-yellow-300")}`}>
                        {stat.title}
                      </p>
                    </div>
                  </div>

                  <p className={`text-[11px] mt-1 leading-snug border-t border-[#D8B282]/15 pt-2 ${themeClass("text-slate-400", "text-[#475569]", "text-yellow-100")}`}>
                    {stat.desc}
                  </p>
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
        {/* Dedicated Background per Theme (Không gộp chung ảnh) */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_matrix_bg.jpg"
              alt="B2B Matrix Background"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-screen brightness-90 contrast-125"
            />
            {/* Pulsing Circuit Laser Wave */}
            <svg viewBox="0 0 1440 220" fill="none" className="absolute bottom-0 inset-x-0 w-full opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: "6s" }}>
              <path d="M0,110 Q360,20 720,110 T1440,110" stroke="#D8B282" strokeWidth="2" strokeDasharray="14 10" opacity="0.8" />
              <path d="M0,140 Q360,210 720,140 T1440,140" stroke="#F6E1C3" strokeWidth="1.5" strokeDasharray="20 14" opacity="0.6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="B2B Light Architecture"
              className="w-full h-full object-cover object-center opacity-25 filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]/95" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/ceo1983-contrast.jpg"
              alt="CAD Contrast Background"
              className="w-full h-full object-cover object-center opacity-20 filter contrast-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          </div>
        )}

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
          SECTION 3.5: KIM TỰ THÁP QUẢN TRỊ & MẠNG LƯỚI GIAO THƯƠNG 3 TẦNG (PYRAMID ARCHITECTURE)
          ========================================================================= */}
      <ScrollSection
        id="pyramid"
        direction="scale"
        className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
          "bg-[#03050B]",
          "bg-[#FAF8F5]",
          "bg-black"
        )}`}
      >
        {/* Sacred Geometry Pyramid Wireframe in Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg className="w-full h-full opacity-15" viewBox="0 0 1000 700" preserveAspectRatio="none">
            <polygon points="500,60 120,640 880,640" fill="none" stroke="#D8B282" strokeWidth="1.5" strokeDasharray="10 8" />
            <line x1="500" y1="60" x2="500" y2="640" stroke="#F6E1C3" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            <line x1="370" y1="250" x2="630" y2="250" stroke="#D8B282" strokeWidth="1.5" opacity="0.8" />
            <line x1="240" y1="440" x2="760" y2="440" stroke="#D8B282" strokeWidth="1.5" opacity="0.8" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,178,130,0.12)_0%,transparent_75%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-12">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#8C653B]",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              PYRAMID 03.5 • CẤU TRÚC KIM TỰ THÁP DOANH NGHIỆP
            </span>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0A0F1D]",
              "text-yellow-300"
            )}`}>
              MÔ HÌNH KIM TỰ THÁP QUẢN TRỊ & GIAO THƯƠNG 3 TẦNG
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Mô hình liên minh vững chãi kết hợp trọn vẹn quyền lực bảo trợ tài chính từ đỉnh tháp đến sức mạnh giao thương thực chiến của hàng chục nghìn doanh nghiệp cơ sở.
            </p>
          </div>

          {/* 3-Tier Visual Pyramid Hierarchy */}
          <div className="flex flex-col items-center gap-5 max-w-5xl mx-auto">
            {/* TẦNG 1: ĐỈNH THÁP (APEX) */}
            <motion.div
              whileHover={{ scale: 1.025, y: -4 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl border backdrop-blur-2xl relative shadow-[0_15px_40px_rgba(216,178,130,0.25)] group cursor-pointer transition-all ${themeClass(
                "border-[#F6E1C3]/60 bg-gradient-to-b from-[#1E170F] via-[#0E1322] to-[#0A0E1A]",
                "border-[#D8B282] bg-gradient-to-b from-[#FFF9F2] to-white shadow-[0_15px_35px_rgba(140,101,59,0.2)]",
                "border-yellow-300 bg-black text-yellow-300"
              )}`}
            >
              {/* Glowing Apex Beacon */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] text-slate-950 font-black text-[10px] uppercase font-mono tracking-widest shadow-[0_0_15px_rgba(246,225,195,0.8)] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>ĐỈNH THÁP • APEX TIER</span>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#D8B282] uppercase tracking-wider">
                    CHIẾN LƯỢC & BẢO TRỢ VỐN
                  </span>
                  <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight ${themeClass(
                    "text-white group-hover:text-[#F6E1C3]",
                    "text-[#1A140E] group-hover:text-[#785124]",
                    "text-yellow-300"
                  )}`}>
                    Hội Đồng Sáng Lập & Deal Room &gt;5.000 Tỷ
                  </h3>
                  <p className={`text-xs leading-relaxed ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                    Chủ tịch HĐQT, CEO các tập đoàn đầu ngành & lãnh đạo hiệp hội. Định hướng chiến lược, kết nối nguồn vốn thể chế và bảo lãnh các siêu thương vụ B2B.
                  </p>
                </div>

                {/* Circular Gold Metric Dial */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-full border border-[#D8B282]/50 bg-black/40 shadow-[0_0_20px_rgba(216,178,130,0.3)]">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#F6E1C3]/60 animate-gear-cw" />
                  <div className="text-center">
                    <p className="text-xs font-black text-[#F6E1C3] leading-none">&gt;5.000</p>
                    <p className="text-[8px] font-mono text-[#D8B282] uppercase font-bold mt-0.5">TỶ VNĐ</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#D8B282]/20">
                {["VIP TITANIUM PASS", "PRIVATE DEAL ROOM 1:1", "TOP 1% C-LEVEL", "BẢO TRỢ TÀI CHÍNH"].map((badge, bIdx) => (
                  <span key={bIdx} className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${themeClass(
                    "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
                    "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#785124]",
                    "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                  )}`}>
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* TẦNG 2: THÂN THÁP (MID-TIER BODY) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-3xl p-6 sm:p-7 rounded-3xl border backdrop-blur-2xl relative shadow-xl group cursor-pointer transition-all ${themeClass(
                "border-[#D8B282]/40 bg-gradient-to-b from-[#121829] via-[#090D1C] to-[#050814]",
                "border-[#D8B282]/60 bg-gradient-to-b from-[#FAF4EC] to-white shadow-[0_12px_30px_rgba(140,101,59,0.15)]",
                "border-yellow-400 bg-black text-yellow-300"
              )}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D8B282] to-[#8C653B] text-slate-950 font-black text-[10px] uppercase font-mono tracking-widest shadow-md flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5" />
                <span>THÂN THÁP • OPERATIONAL TIER</span>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-mono font-bold text-[#D8B282] uppercase tracking-wider">
                    ĐIỀU HÀNH & KIỂM CHỨNG CHẤT LƯỢNG
                  </span>
                  <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight ${themeClass(
                    "text-white group-hover:text-[#F6E1C3]",
                    "text-[#1A140E] group-hover:text-[#785124]",
                    "text-yellow-300"
                  )}`}>
                    Ban Chấp Hành & Hội Đồng Thẩm Định KYC
                  </h3>
                  <p className={`text-xs leading-relaxed ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                    Cơ quan điều hành thường trực của 300+ Hiệp hội. Thẩm định 100% hồ sơ pháp lý, tổ chức đại hội thường niên, đối soát giao thương và vận hành trợ lý AI Matchmaking thời gian thực.
                  </p>
                </div>

                {/* Circular Radar Status Dial */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-full border border-[#D8B282]/40 bg-black/40">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#D8B282]/50 animate-gear-ccw" />
                  <div className="text-center">
                    <p className="text-xs font-black text-[#D8B282] leading-none">300+</p>
                    <p className="text-[8px] font-mono text-slate-300 uppercase font-bold mt-0.5">HIỆP HỘI</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#D8B282]/20">
                {["THẨM ĐỊNH KYC 100%", "ĐIỀU HÀNH 360°", "AI MATCHMAKING <1.2S", "BIỂU QUYẾT BLOCKCHAIN"].map((badge, bIdx) => (
                  <span key={bIdx} className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${themeClass(
                    "bg-black/50 border-[#D8B282]/30 text-slate-200",
                    "bg-[#FAF8F5] border-[#D8B282]/45 text-[#63401A]",
                    "bg-black border-yellow-400 text-yellow-300"
                  )}`}>
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* TẦNG 3: ĐẾ THÁP (FOUNDATION BASE) */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-5xl p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl relative shadow-xl group cursor-pointer transition-all ${themeClass(
                "border-[#D8B282]/35 bg-gradient-to-b from-[#090D1A] via-[#05070E] to-black",
                "border-[#D8B282]/50 bg-gradient-to-b from-white via-[#FAF8F5] to-white shadow-[0_10px_25px_rgba(140,101,59,0.1)]",
                "border-yellow-400 bg-black text-yellow-300"
              )}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8C653B] to-[#5C3D1E] text-[#F6E1C3] font-black text-[10px] uppercase font-mono tracking-widest shadow-md flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>ĐẾ THÁP • FOUNDATION BASE TIER</span>
              </div>

              <div className="mt-2 text-left space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D8B282] uppercase tracking-wider">
                      MẠNG LƯỚI GIAO THƯƠNG THỰC TẾ
                    </span>
                    <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight ${themeClass(
                      "text-white group-hover:text-[#F6E1C3]",
                      "text-[#1A140E] group-hover:text-[#785124]",
                      "text-yellow-300"
                    )}`}>
                      10.000+ Doanh Nghiệp Hội Viên & Chuỗi Cung Ứng
                    </h3>
                  </div>
                  <div className="px-3 py-1 rounded-full border border-[#D8B282]/40 bg-black/40 text-xs font-mono font-bold text-[#F6E1C3] shrink-0 self-start sm:self-auto">
                    10.000+ THÀNH VIÊN ĐỊNH DANH
                  </div>
                </div>

                <p className={`text-xs leading-relaxed max-w-4xl ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                  Cộng đồng doanh nghiệp thực chiến đa lĩnh vực. Tiêu thụ chéo sản phẩm dịch vụ, giao thương không phí trung gian qua Thẻ Titanium NFC, ví điện tử Apple/Google Wallet và sàn trao đổi hợp đồng số ViOne.
                </p>

                {/* 6 Circular Industrial Sector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                  {[
                    { icon: Cpu, label: "Công Nghệ Số" },
                    { icon: Factory, label: "Sản Xuất & Chế Tạo" },
                    { icon: Building2, label: "Bất Động Sản" },
                    { icon: Coins, label: "Tài Chính & Vốn" },
                    { icon: Globe2, label: "Logistics & XNK" },
                    { icon: Leaf, label: "Nông Nghiệp CNC" },
                  ].map((sec, secIdx) => {
                    const SIcon = sec.icon;
                    return (
                      <div
                        key={secIdx}
                        className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105 ${themeClass(
                          "bg-black/50 border-[#D8B282]/25 text-slate-200 hover:border-[#D8B282]",
                          "bg-[#FAF8F5] border-[#D8B282]/40 text-[#475569] hover:border-[#8C653B]",
                          "bg-black border-yellow-400 text-yellow-300"
                        )}`}
                      >
                        <div className="w-8 h-8 rounded-full border border-[#D8B282]/30 flex items-center justify-center text-[#D8B282]">
                          <SIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold leading-tight">{sec.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 4: CHUẨN BẢO MẬT & HẠ TẦNG SLA 99.99% (ENTERS FROM LEFT)
          ========================================================================= */}
      <ScrollSection id="security" direction="left" className="border-t border-[#D8B282]/20 relative">
        {/* Dedicated Background per Theme (Không gộp chung ảnh) */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/ceo1983-network-bg.jpg"
              alt="Security Network Dark"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-screen brightness-90"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.35)_0%,#05070E_85%)]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business-saas-light.jpg"
              alt="Security Architecture Light"
              className="w-full h-full object-cover object-center opacity-25 filter brightness-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.4)_0%,#FAF8F5_85%)]" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-black" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          <div className="mb-10">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-[#F6E1C3]/40 border-[#D8B282]/60 text-[#785124] font-black",
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
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClass("text-[#F6E1C3]", "text-[#785124]", "text-yellow-300")}`}>
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
                  <p className={`text-3xl font-black text-transparent bg-clip-text ${themeClass(
                    "bg-gradient-to-r from-[#D8B282] via-[#8C653B] to-[#D8B282]",
                    "bg-gradient-to-r from-[#785124] via-[#9E6B30] to-[#5C3D1E]",
                    "bg-yellow-300"
                  )} mt-1`}>
                    99.99%
                  </p>
                  <p className={`text-[10px] mt-1 ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>Zero unplanned downtime</p>
                </div>
                <div className={`p-5 rounded-2xl border ${themeClass("bg-black/50 border-[#D8B282]/25", "bg-[#FAF8F5] border-[#D8B282]/40", "bg-black border-yellow-400")}`}>
                  <p className={`text-[11px] font-mono ${themeClass("text-slate-400", "text-[#64748B]", "text-yellow-200")}`}>API LATENCY</p>
                  <p className={`text-3xl font-black ${themeClass("text-[#D8B282]", "text-[#785124]", "text-yellow-300")} mt-1`}>
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
        {/* Dedicated Background per Theme (Không gộp chung ảnh) */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_matrix_bg.jpg"
              alt="Ecosystem Matrix Background"
              className="w-full h-full object-cover object-center opacity-25 mix-blend-screen brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="Ecosystem Daylight HQ"
              className="w-full h-full object-cover object-center opacity-30 filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]/95" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/ceo1983_ecosystem_contrast.jpg"
              alt="CAD Ecosystem"
              className="w-full h-full object-cover object-center opacity-25 filter contrast-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          </div>
        )}

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

          {/* Circular Radar Matchmaking Dial & Industry Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-center">
            {/* Left 7 Cols: High-Tech Circular Radar Matchmaking Dial */}
            <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl relative overflow-hidden shadow-2xl flex flex-col items-center justify-center ${themeClass(
              "border-[#D8B282]/35 bg-[#080E1C]/90",
              "border-[#D8B282]/50 bg-white/95 shadow-[0_15px_35px_rgba(140,101,59,0.12)]",
              "border-yellow-400 bg-black text-yellow-300"
            )}`}>
              <div className="w-full flex items-center justify-between mb-4 border-b border-[#D8B282]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-[#D8B282] animate-spin-gear-cw" />
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClass("text-[#F6E1C3]", "text-[#785124]", "text-yellow-300")}`}>
                    RADAR GIAO THƯƠNG THỜI GIAN THỰC
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AI ACTIVE SCANNING
                </span>
              </div>

              {/* The Circular Radar Screen */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-2 flex items-center justify-center">
                {/* SVG Radar Grids & Sweep */}
                <svg viewBox="0 0 320 320" className="w-full h-full">
                  <defs>
                    <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#D8B282" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Concentric Range Rings */}
                  <circle cx="160" cy="160" r="145" fill="none" stroke="#D8B282" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
                  <circle cx="160" cy="160" r="105" fill="none" stroke="#D8B282" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <circle cx="160" cy="160" r="65" fill="none" stroke="#F6E1C3" strokeWidth="1.2" opacity="0.6" />

                  {/* Crosshair Axes */}
                  <line x1="160" y1="15" x2="160" y2="305" stroke="#D8B282" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
                  <line x1="15" y1="160" x2="305" y2="160" stroke="#D8B282" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

                  {/* Radar Sweeping Laser Wedge */}
                  <g className="animate-radar-sweep" style={{ transformOrigin: "160px 160px" }}>
                    <path d="M160,160 L305,160 A145,145 0 0,0 262.5,57.5 Z" fill="url(#radarSweepGrad)" />
                    <line x1="160" y1="160" x2="305" y2="160" stroke="#F6E1C3" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>

                {/* Central Glowing Core Nucleus */}
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FFF5E6] via-[#D8B282] to-[#8C653B] flex flex-col items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(216,178,130,0.8)] z-10 border-2 border-white">
                  <Crown className="w-5 h-5 text-slate-950 fill-current" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">VIONE</span>
                </div>

                {/* 6 Circular Orbital Nodes on Radar */}
                {[
                  { name: "HanoiBA", x: "82%", y: "25%", icon: Users },
                  { name: "300+ Hiệp Hội", x: "85%", y: "75%", icon: Building2 },
                  { name: "Khối Ngân Hàng", x: "50%", y: "90%", icon: Coins },
                  { name: "Quỹ Đầu Tư", x: "12%", y: "75%", icon: Award },
                  { name: "Sàn Quốc Tế", x: "14%", y: "25%", icon: Globe2 },
                  { name: "Cố Vấn C-Level", x: "50%", y: "10%", icon: UserCheck },
                ].map((node, nIdx) => {
                  const NIcon = node.icon;
                  return (
                    <div
                      key={nIdx}
                      style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                      className="absolute group/node cursor-pointer z-10"
                    >
                      <div className="relative w-9 h-9 rounded-full border border-[#D8B282]/60 bg-[#080D1A] flex items-center justify-center shadow-lg group-hover/node:scale-125 transition-transform">
                        <NIcon className="w-4 h-4 text-[#D8B282]" />
                        <span className="absolute -inset-1 rounded-full border border-dashed border-[#D8B282]/40 animate-ping opacity-30" />
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-black/90 border border-[#D8B282]/40 text-[9px] font-mono text-[#F6E1C3] whitespace-nowrap opacity-80 group-hover/node:opacity-100">
                        {node.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={`text-xs mt-3 text-center font-medium max-w-md ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                Hệ thống quét tự động phân tích nhu cầu mua - bán, gợi ý ghép cặp đối tác chiến lược theo thời gian thực.
              </p>
            </div>

            {/* Right 5 Cols: Donut Industry Distribution Chart */}
            <div className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl relative overflow-hidden shadow-2xl flex flex-col justify-between ${themeClass(
              "border-[#D8B282]/35 bg-[#080E1C]/90",
              "border-[#D8B282]/50 bg-white/95 shadow-[0_15px_35px_rgba(140,101,59,0.12)]",
              "border-yellow-400 bg-black text-yellow-300"
            )}`}>
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#D8B282]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#D8B282]" />
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClass("text-[#F6E1C3]", "text-[#785124]", "text-yellow-300")}`}>
                      CƠ CẤU GIAO THƯƠNG LIÊN NGÀNH
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#D8B282] font-bold">TỔNG &gt;5.000 TỶ</span>
                </div>

                {/* SVG Donut Chart */}
                <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                    {/* Circumference = 2 * PI * 70 = ~440 */}
                    {/* Segment 1: 42% (185) */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#D8B282" strokeWidth="22" strokeDasharray="185 255" strokeDashoffset="0" className="drop-shadow-[0_0_8px_rgba(216,178,130,0.5)]" />
                    {/* Segment 2: 26% (114) */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#F6E1C3" strokeWidth="22" strokeDasharray="114 326" strokeDashoffset="-185" />
                    {/* Segment 3: 18% (79) */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#8C653B" strokeWidth="22" strokeDasharray="79 361" strokeDashoffset="-299" />
                    {/* Segment 4: 14% (62) */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#52391D" strokeWidth="22" strokeDasharray="62 378" strokeDashoffset="-378" />
                  </svg>
                  {/* Inside Donut Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <p className={`text-xl font-black text-transparent bg-clip-text ${themeClass(
                      "bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                      "bg-gradient-to-r from-[#785124] via-[#9E6B30] to-[#5C3D1E]",
                      "bg-yellow-300"
                    )}`}>
                      &gt;5.000
                    </p>
                    <p className={`text-[9px] font-mono font-bold uppercase tracking-wider ${themeClass("text-[#D8B282]", "text-[#785124]", "text-yellow-200")}`}>
                      TỶ GIAO THƯƠNG
                    </p>
                  </div>
                </div>

                {/* Donut Chart Legend List */}
                <div className="space-y-2 pt-2">
                  {[
                    { label: "Chuỗi Cung Ứng & Phụ Trợ", pct: "42%", color: "bg-[#D8B282]" },
                    { label: "Công Nghệ Thông Tin & Số Hóa", pct: "26%", color: "bg-[#F6E1C3]" },
                    { label: "Bất Động Sản & Hạ Tầng", pct: "18%", color: "bg-[#8C653B]" },
                    { label: "Tài Chính, Vốn & Dịch Vụ C-Level", pct: "14%", color: "bg-[#52391D]" },
                  ].map((leg, lIdx) => (
                    <div key={lIdx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${leg.color}`} />
                        <span className={`font-medium ${themeClass("text-slate-300", "text-[#334155]", "text-yellow-100")}`}>{leg.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#D8B282]">{leg.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          SECTION 6: ĐẶT LỊCH TRẢI NGHIỆM (ENTERS WITH 3D SCALE DEPTH & ANCHORED HALF-COGS)
          ========================================================================= */}
      <ScrollSection id="demo" direction="scale" className="border-t border-[#D8B282]/20 relative overflow-hidden py-16">
        {/* Left Half-Cog (Clockwise turning into Section 6) */}
        <div className="hidden lg:block absolute -left-28 sm:-left-36 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none opacity-45 hover:opacity-90 transition-opacity">
          <div className="relative w-80 h-80 animate-gear-cw">
            <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-[0_0_22px_rgba(216,178,130,0.35)]">
              <defs>
                <linearGradient id="gearLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF5E6" />
                  <stop offset="50%" stopColor="#D8B282" />
                  <stop offset="100%" stopColor="#8C653B" />
                </linearGradient>
                <radialGradient id="gearLeftHub" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F6E1C3" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#D8B282" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              {/* Gear Teeth Outer Ring */}
              <circle cx="160" cy="160" r="140" fill="none" stroke="url(#gearLeftGrad)" strokeWidth="22" strokeDasharray="18 18" />
              {/* Pitch Circles */}
              <circle cx="160" cy="160" r="128" fill="none" stroke="#D8B282" strokeWidth="2.5" opacity="0.8" />
              <circle cx="160" cy="160" r="115" fill="none" stroke="#F6E1C3" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.6" />
              {/* 8 Mechanical Spokes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="160"
                  y1="160"
                  x2={160 + 114 * Math.cos((angle * Math.PI) / 180)}
                  y2={160 + 114 * Math.sin((angle * Math.PI) / 180)}
                  stroke="url(#gearLeftGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              ))}
              {/* Center Hub & Axis */}
              <circle cx="160" cy="160" r="58" fill="url(#gearLeftHub)" stroke="#D8B282" strokeWidth="2" />
              <circle cx="160" cy="160" r="28" fill="#060913" stroke="#F6E1C3" strokeWidth="2" />
              <circle cx="160" cy="160" r="10" fill="#D8B282" />
            </svg>
          </div>
          <div className="absolute top-1/2 right-2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-[#D8B282]/40 text-[9px] font-mono text-[#F6E1C3] tracking-widest uppercase shadow-md">
            GEAR 01 • CW
          </div>
        </div>

        {/* Right Half-Cog (Counter-Clockwise turning into Section 6) */}
        <div className="hidden lg:block absolute -right-28 sm:-right-36 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none opacity-45 hover:opacity-90 transition-opacity">
          <div className="relative w-80 h-80 animate-gear-ccw">
            <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-[0_0_22px_rgba(216,178,130,0.35)]">
              <defs>
                <linearGradient id="gearRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F6E1C3" />
                  <stop offset="60%" stopColor="#D8B282" />
                  <stop offset="100%" stopColor="#63401A" />
                </linearGradient>
              </defs>
              {/* Gear Teeth Outer Ring */}
              <circle cx="160" cy="160" r="140" fill="none" stroke="url(#gearRightGrad)" strokeWidth="26" strokeDasharray="22 22" />
              {/* Pitch Circles */}
              <circle cx="160" cy="160" r="125" fill="none" stroke="#D8B282" strokeWidth="2" opacity="0.8" />
              <circle cx="160" cy="160" r="108" fill="none" stroke="#F6E1C3" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.5" />
              {/* 6 Mechanical Spokes */}
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <line
                  key={angle}
                  x1="160"
                  y1="160"
                  x2={160 + 107 * Math.cos((angle * Math.PI) / 180)}
                  y2={160 + 107 * Math.sin((angle * Math.PI) / 180)}
                  stroke="url(#gearRightGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="160" cy="160" r="50" fill="#04060C" stroke="#D8B282" strokeWidth="2" />
              <circle cx="160" cy="160" r="20" fill="#D8B282" opacity="0.85" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-[#D8B282]/40 text-[9px] font-mono text-[#F6E1C3] tracking-widest uppercase shadow-md">
            GEAR 02 • CCW
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-20">
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

          {/* Form Card with 3-Step Wizard Navigation */}
          <div className={`p-6 sm:p-10 rounded-3xl border backdrop-blur-2xl shadow-2xl relative overflow-hidden ${themeClass(
            "border-[#D8B282]/40 bg-[#080E1C]/95",
            "border-[#D8B282]/60 bg-white/95 shadow-[0_20px_50px_rgba(140,101,59,0.18)]",
            "border-yellow-400 bg-black text-yellow-300"
          )}`}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent" />

            {/* 3-Step Stepper Header */}
            {!demoSubmitted && (
              <div className="mb-8 border-b pb-5 border-[#D8B282]/25">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div
                    onClick={() => setRegisterStep(1)}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${
                      registerStep === 1
                        ? "text-[#D8B282] font-bold"
                        : "text-slate-400 hover:text-[#D8B282]"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        registerStep === 1
                          ? "bg-[#D8B282] text-slate-950 shadow-md"
                          : registerStep > 1
                          ? "bg-[#D8B282]/30 text-[#D8B282]"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      1
                    </span>
                    <span className="text-xs hidden sm:inline">Thông Tin</span>
                  </div>

                  <div className="flex-1 h-[2px] mx-3 bg-[#D8B282]/30" />

                  <div
                    onClick={() => {
                      if (formData.name && formData.phone) setRegisterStep(2);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${
                      registerStep === 2
                        ? "text-[#D8B282] font-bold"
                        : "text-slate-400 hover:text-[#D8B282]"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        registerStep === 2
                          ? "bg-[#D8B282] text-slate-950 shadow-md"
                          : registerStep > 2
                          ? "bg-[#D8B282]/30 text-[#D8B282]"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      2
                    </span>
                    <span className="text-xs hidden sm:inline">Quy Mô & Nhu Cầu</span>
                  </div>

                  <div className="flex-1 h-[2px] mx-3 bg-[#D8B282]/30" />

                  <div
                    onClick={() => {
                      if (formData.name && formData.phone) setRegisterStep(3);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${
                      registerStep === 3
                        ? "text-[#D8B282] font-bold"
                        : "text-slate-400 hover:text-[#D8B282]"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        registerStep === 3
                          ? "bg-[#D8B282] text-slate-950 shadow-md"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      3
                    </span>
                    <span className="text-xs hidden sm:inline">Lịch Hẹn VIP</span>
                  </div>
                </div>
              </div>
            )}

            {demoSubmitted ? (
              <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-[#D8B282]/20 border border-[#D8B282] text-[#D8B282] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(216,178,130,0.5)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                    ĐÃ KÍCH HOẠT THÀNH CÔNG GÓI VIP PASS 30 NGÀY
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${themeClass("text-white", "text-[#0F172A]", "text-yellow-300")}`}>
                    Chào Mừng {formData.name || "Doanh Nghiệp"}!
                  </h3>
                  <p className={`text-sm max-w-md mx-auto mt-2 leading-relaxed ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                    Yêu cầu kích hoạt tài khoản tổ chức của <strong>{formData.org || "Tổ chức của bạn"}</strong> đã được ghi nhận. Chuyên viên giải pháp C-Level sẽ liên hệ qua <strong>{formData.phone}</strong> để bàn giao tài khoản.
                  </p>
                </div>

                {/* VIP Card Preview */}
                <div className="max-w-sm mx-auto p-4 rounded-2xl border border-[#D8B282]/50 bg-gradient-to-br from-[#1B1712] via-[#0E0C09] to-[#050403] text-left shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#D8B282]/20 pb-2 mb-3">
                    <span className="text-[10px] font-mono text-[#D8B282] uppercase tracking-wider font-bold">VIONE VIP ACCESS PASS</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE 30 DAYS</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-[#F6E1C3] font-bold text-sm">{formData.name || "Đại diện Doanh nghiệp"}</div>
                    <div className="text-slate-400 text-[11px]">{formData.org || "Tổ chức Doanh nghiệp B2B"}</div>
                    <div className="text-[10px] font-mono text-[#D8B282] pt-2">PASS CODE: <span className="text-white font-bold">{formData.vipCode || "VIONE-VIP30"}</span></div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/auth"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>VÀO TRẢI NGHIỆM NỀN TẢNG NGAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoSubmitted(false);
                      setRegisterStep(1);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#D8B282]/40 text-xs font-bold hover:bg-[#D8B282]/10 transition-colors cursor-pointer"
                  >
                    Đăng ký cho tổ chức khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-5">
                {/* ── STEP 1: THÔNG TIN ĐẠI DIỆN & DOANH NGHIỆP ── */}
                {registerStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-[#D8B282] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D8B282]" />
                      BƯỚC 1: THÔNG TIN NGƯỜI ĐẠI DIỆN & DOANH NGHIỆP
                    </div>

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
                          placeholder="Ví dụ: Nguyễn Văn A"
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
                          placeholder="Tập Đoàn / Hiệp Hội ABC"
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                          EMAIL CÔNG VỤ *
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

                    <div>
                      <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                        VỊ TRÍ / CHỨC VỤ ĐẠI DIỆN
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                          "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                          "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                          "border-yellow-400 bg-black text-yellow-300"
                        )}`}
                      >
                        <option value="Chủ tịch / Tổng Giám đốc">Chủ tịch HĐQT / Tổng Giám đốc (CEO)</option>
                        <option value="Phó Tổng Giám đốc / Giám đốc">Phó Tổng Giám đốc / Giám đốc Điều hành</option>
                        <option value="Trưởng Ban / Giám đốc Chuyển Đổi Số">Trưởng Ban / Giám đốc Chuyển Đổi Số (CDO/CTO)</option>
                        <option value="Chủ tịch / Tổng Thư Ký Hiệp Hội">Chủ tịch / Tổng Thư Ký Hiệp Hội Doanh Nghiệp</option>
                        <option value="Quản lý cấp cao / Khác">Quản lý cấp cao / Khác</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className={`text-xs flex items-center gap-2 ${themeClass("text-slate-300", "text-[#475569]", "text-yellow-100")}`}>
                        <CheckCircle2 className="w-4 h-4 text-[#D8B282]" />
                        <span className="font-medium">Bảo mật thông tin chuẩn mã hóa C-Level.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.name || !formData.phone) {
                            toast.error("Vui lòng điền Họ tên và Số điện thoại");
                            return;
                          }
                          setRegisterStep(2);
                        }}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>TIẾP TỤC BƯỚC 2</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: QUY MÔ & NHU CẦU KẾT NỐI ── */}
                {registerStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-[#D8B282] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D8B282]" />
                      BƯỚC 2: QUY MÔ & NHU CẦU KẾT NỐI HỆ SINH THÁI
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                          QUY MÔ HỘI VIÊN / NHÂN SỰ
                        </label>
                        <select
                          value={formData.scale}
                          onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        >
                          <option value="under_50">Dưới 50 người</option>
                          <option value="50_200">Từ 50 - 200 người</option>
                          <option value="200_1000">Từ 200 - 1.000 người</option>
                          <option value="over_1000">Trên 1.000 người (Tập đoàn / Liên đoàn)</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                          KHỐI NGÀNH KINH DOANH CHỦ LỰC
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        >
                          <option value="Công nghệ & Chuyển đổi số">Công nghệ & Chuyển đổi số</option>
                          <option value="Sản xuất & Chế biến">Sản xuất & Chế biến chế tạo</option>
                          <option value="Bán lẻ & Chuỗi F&B">Bán lẻ & Chuỗi F&B</option>
                          <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                          <option value="Tài chính, Ngân hàng & Đầu tư">Tài chính, Ngân hàng & Đầu tư</option>
                          <option value="Y tế, Giáo dục & Dịch vụ cao cấp">Y tế, Giáo dục & Dịch vụ</option>
                          <option value="Khác">Lĩnh vực khác</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-mono font-bold mb-2 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                        GIẢI PHÁP TRẢI NGHIỆM QUAN TÂM (CHỌN 1 HOẶC NHIỀU)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          "Thẻ Danh Thiếp Thông Minh NFC Titanium",
                          "Sàn Giao Thương B2B & Chuỗi Cung Ứng",
                          "Phần Mềm Quản Trị Hệ Sinh Thái Hội Viên 360°",
                          "AI Matchmaking & Ghép Nối Đối Tác",
                        ].map((need) => (
                          <div
                            key={need}
                            onClick={() => toggleNeed(need)}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                              formData.needs.includes(need)
                                ? "border-[#D8B282] bg-[#D8B282]/15 text-[#F6E1C3] font-bold shadow-xs"
                                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-[#D8B282]/40"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                formData.needs.includes(need)
                                  ? "border-[#D8B282] bg-[#D8B282] text-slate-950"
                                  : "border-slate-500"
                              }`}
                            >
                              {formData.needs.includes(need) && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{need}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="px-5 py-3 rounded-xl border border-white/20 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>QUAY LẠI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>TIẾP TỤC BƯỚC 3</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: LỊCH HẸN CHUYÊN GIA & VIP PASS ── */}
                {registerStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-[#D8B282] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D8B282]" />
                      BƯỚC 3: LỊCH HẸN CHUYÊN GIA 1:1 & KÍCH HOẠT VIP PASS
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                          HÌNH THỨC TƯ VẤN TRIỂN KHAI
                        </label>
                        <select
                          value={formData.consultType}
                          onChange={(e) => setFormData({ ...formData, consultType: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        >
                          <option value="online">Tư vấn trực tuyến 1:1 (Google Meet / Zoom)</option>
                          <option value="office">Trực tiếp tại Trụ sở Doanh nghiệp của bạn</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                          KHUNG GIỜ PHÙ HỢP
                        </label>
                        <select
                          value={formData.consultTime}
                          onChange={(e) => setFormData({ ...formData, consultTime: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        >
                          <option value="morning">Buổi sáng (09h00 - 11h30)</option>
                          <option value="afternoon">Buổi chiều (14h00 - 17h00)</option>
                          <option value="flexible">Linh hoạt theo điều phối</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")}`}>
                        MÃ ƯU ĐÃI VIP PASS (NẾU CÓ)
                      </label>
                      <input
                        type="text"
                        value={formData.vipCode}
                        onChange={(e) => setFormData({ ...formData, vipCode: e.target.value.toUpperCase() })}
                        placeholder="VIONE-VIP30"
                        className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none font-mono uppercase transition-colors ${themeClass(
                          "border-[#D8B282]/30 bg-black/60 text-[#F6E1C3] focus:border-[#F6E1C3]",
                          "border-[#D8B282]/50 bg-[#FAF8F5] text-[#0F172A] focus:border-[#8C653B] focus:bg-white",
                          "border-yellow-400 bg-black text-yellow-300"
                        )}`}
                      />
                      <p className="text-[11px] text-[#D8B282] mt-1 font-medium">
                        * Áp dụng mã đặc quyền trải nghiệm trọn bộ tính năng Enterprise trong 30 ngày hoàn toàn miễn phí.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/20 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>QUAY LẠI</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submittingDemo}
                        className="w-full sm:w-auto px-9 py-3.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(216,178,130,0.5)] hover:brightness-110 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {submittingDemo ? "ĐANG XÁC THỰC..." : "HOÀN TẤT & KÍCH HOẠT 30 NGÀY DÙNG THỬ →"}
                      </button>
                    </div>
                  </div>
                )}
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
          MODALS: VIDEO KYC & MATCHMAKING + 3-STEP REGISTRATION POPUP WIZARD
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

      {/* 3-Step Registration Wizard Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-[#D8B282]/50 bg-[#0A0E1A] p-6 sm:p-8 shadow-2xl text-left text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D8B282]/20 mb-5">
                <div>
                  <div className="text-[10px] font-mono text-[#D8B282] uppercase font-bold tracking-widest">
                    VIONE VIP REGISTRATION WIZARD
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase">
                    ĐĂNG KÝ TRẢI NGHIỆM (3 BƯỚC NHẬN VIP PASS)
                  </h3>
                </div>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="p-1.5 rounded-lg border border-[#D8B282]/30 hover:bg-[#D8B282]/20 text-[#F6E1C3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              {!demoSubmitted && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 text-xs">
                  <div className={`flex items-center gap-1.5 ${modalRegisterStep === 1 ? "text-[#D8B282] font-bold" : "text-slate-400"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${modalRegisterStep === 1 ? "bg-[#D8B282] text-slate-950" : "bg-slate-800"}`}>1</span>
                    <span>Đại diện</span>
                  </div>
                  <div className="flex-1 h-[2px] mx-2 bg-[#D8B282]/30" />
                  <div className={`flex items-center gap-1.5 ${modalRegisterStep === 2 ? "text-[#D8B282] font-bold" : "text-slate-400"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${modalRegisterStep === 2 ? "bg-[#D8B282] text-slate-950" : "bg-slate-800"}`}>2</span>
                    <span>Quy mô & Nhu cầu</span>
                  </div>
                  <div className="flex-1 h-[2px] mx-2 bg-[#D8B282]/30" />
                  <div className={`flex items-center gap-1.5 ${modalRegisterStep === 3 ? "text-[#D8B282] font-bold" : "text-slate-400"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${modalRegisterStep === 3 ? "bg-[#D8B282] text-slate-950" : "bg-slate-800"}`}>3</span>
                    <span>Lịch hẹn VIP</span>
                  </div>
                </div>
              )}

              {demoSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#D8B282]/20 border border-[#D8B282] text-[#D8B282] flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Yêu Cầu Kích Hoạt Đã Tiếp Nhận</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Cảm ơn <strong>{formData.name}</strong> ({formData.org}). Chuyên viên ViOne sẽ liên hệ qua <strong>{formData.phone}</strong> để kích hoạt quyền VIP 30 ngày cho bạn.
                  </p>
                  <button
                    onClick={() => {
                      setDemoModalOpen(false);
                      setDemoSubmitted(false);
                      setModalRegisterStep(1);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Hoàn Tất & Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs">
                  {/* Step 1 */}
                  {modalRegisterStep === 1 && (
                    <div className="space-y-3">
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
                        type="button"
                        onClick={() => {
                          if (!formData.name || !formData.phone) {
                            toast.error("Vui lòng điền Họ tên và Số điện thoại");
                            return;
                          }
                          setModalRegisterStep(2);
                        }}
                        className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>TIẾP TỤC BƯỚC 2</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 2 */}
                  {modalRegisterStep === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-bold">Quy Mô Nhân Sự / Hội Viên</label>
                        <select
                          value={formData.scale}
                          onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                        >
                          <option value="under_50">Dưới 50 người</option>
                          <option value="50_200">Từ 50 - 200 người</option>
                          <option value="200_1000">Từ 200 - 1.000 người</option>
                          <option value="over_1000">Trên 1.000 người</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-bold">Lĩnh Vực Hoạt Động</label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                        >
                          <option value="Công nghệ & Chuyển đổi số">Công nghệ & Chuyển đổi số</option>
                          <option value="Sản xuất & Chế biến">Sản xuất & Chế biến</option>
                          <option value="Bán lẻ & Chuỗi F&B">Bán lẻ & Chuỗi F&B</option>
                          <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                          <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setModalRegisterStep(1)}
                          className="px-4 py-2.5 rounded-xl border border-white/20 text-slate-300 cursor-pointer"
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalRegisterStep(3)}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>TIẾP TỤC BƯỚC 3</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {modalRegisterStep === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-bold">Hình Thức Tư Vấn</label>
                        <select
                          value={formData.consultType}
                          onChange={(e) => setFormData({ ...formData, consultType: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-white"
                        >
                          <option value="online">Tư vấn trực tuyến qua Google Meet / Zoom</option>
                          <option value="office">Trực tiếp tại trụ sở của bạn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-bold">Mã VIP Pass (Dùng thử 30 ngày)</label>
                        <input
                          type="text"
                          value={formData.vipCode}
                          onChange={(e) => setFormData({ ...formData, vipCode: e.target.value.toUpperCase() })}
                          placeholder="VIONE-VIP30"
                          className="w-full p-2.5 rounded-xl border border-[#D8B282]/30 bg-black/60 text-[#F6E1C3] font-mono"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setModalRegisterStep(2)}
                          className="px-4 py-2.5 rounded-xl border border-white/20 text-slate-300 cursor-pointer"
                        >
                          Quay lại
                        </button>
                        <button
                          type="submit"
                          disabled={submittingDemo}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
                        >
                          {submittingDemo ? "ĐANG GỬI..." : "XÁC NHẬN ĐĂNG KÝ →"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
