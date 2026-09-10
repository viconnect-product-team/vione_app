import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LangSwitcher } from "@/components/LangSwitcher";
import { TitaniumExecutive3DHeroCard } from "./TitaniumExecutive3DHeroCard";
import { RobotEcosystemOrbitalHub } from "./RobotEcosystemOrbitalHub";
import { Pyramid3DGovernance } from "./Pyramid3DGovernance";
import { CyberRadarCommandHub } from "./CyberRadarCommandHub";
import { CyberSecurityShieldHub } from "./CyberSecurityShieldHub";
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

    heroBadge: "★ ROBOT VŨ TRỤ AI • LIÊN MINH DOANH NGHIỆP B2B",
    heroTitle1: "HỆ ĐIỀU HÀNH & KẾT NỐI",
    heroTitle2: "GIAO THƯƠNG DOANH NGHIỆP B2B",
    heroTitle3: "CHUẨN MỰC THƯƠNG GIA",
    heroSubtitle:
      "🚀 ROBOT AI MATCHMAKING • 🛰️ TRẠM VŨ TRỤ 300+ HIỆP HỘI • 💎 THẺ TITANIUM NFC • 🛡️ BẢO MẬT AES-256 E2E",
    heroCtaDemo: "KÍCH HOẠT ROBOT AI (MIỄN PHÍ) →",
    heroCtaVideo: "Video Robot AI & Matchmaking (15s)",

    stat1Num: "10.000+",
    stat1Title: "Doanh Nhân & C-Level",
    stat1Desc: "Định danh Thẻ Titanium NFC",
    stat2Num: ">5.000 Tỷ",
    stat2Title: "Doanh Số Giao Thương",
    stat2Desc: "Chuỗi cung ứng khép kín",
    stat3Num: "<0.5s",
    stat3Title: "Khớp Lệnh Robot AI",
    stat3Desc: "Tự động gợi ý đối tác theo ngành",
    stat4Num: "99.99%",
    stat4Title: "SLA Uptime & An Toàn",
    stat4Desc: "Chuẩn SOC 2 Type II • AES-256",

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
    <section id={id} className={`relative w-full py-8 md:py-12 overflow-hidden ${className}`}>
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

/**
 * COSMIC CYBER ROBOT VIONE COPILOT — ROBOT VŨ TRỤ AI B2B
 * Robot Vũ Trụ AI thông minh siêu cấp với mũ phi hành gia cyber, visor quét laser,
 * hạt nhân lượng tử phát sáng, 2 vệ tinh mini trinh sát quỹ đạo, HUD viễn thám và hiệu ứng năng lượng táo bạo!
 */
function CosmicCyberRobotCopilot({
  themeMode,
  onActivate,
}: {
  themeMode: ThemeMode;
  onActivate?: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 22;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  const triggerCosmicScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2600);
    if (onActivate) onActivate();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto py-8 flex flex-col items-center justify-center select-none"
    >
      {/* Cosmic Deep Space Starfield & Expanding Gold Nebula Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(216,178,130,0.25)_0%,rgba(246,225,195,0.12)_40%,transparent_70%)] blur-[75px]" />
        <div className="absolute -top-12 left-1/4 w-88 h-88 rounded-full bg-[#D8B282]/15 blur-[95px] animate-pulse" style={{ animationDuration: "3.5s" }} />
        <div className="absolute -bottom-12 right-1/4 w-[400px] h-[400px] rounded-full bg-[#F6E1C3]/10 blur-[100px] animate-pulse" style={{ animationDuration: "4.5s" }} />

        {/* Twinkling Cosmic Energy Stars in Pure Gold & White */}
        <div className="absolute top-6 left-12 w-2 h-2 rounded-full bg-white animate-ping" style={{ animationDuration: "1.8s" }} />
        <div className="absolute top-16 right-16 w-2.5 h-2.5 rounded-full bg-[#F6E1C3] animate-ping" style={{ animationDuration: "2.6s" }} />
        <div className="absolute bottom-8 left-1/3 w-2 h-2 rounded-full bg-[#D8B282] animate-ping" style={{ animationDuration: "2.2s" }} />
        <div className="absolute bottom-14 right-1/3 w-2.5 h-2.5 rounded-full bg-white animate-ping" style={{ animationDuration: "3.2s" }} />
      </div>

      {/* Floating Holographic Left & Right Telemetry Wings */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-20">
        {/* Left Telemetry Wing - 100% Keywords & Live Telemetry */}
        <motion.div
          animate={{ x: [0, -6, 0], y: [0, -5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="md:col-span-3 space-y-3 text-left"
        >
          {/* Card 1: AI Copilot v5.0 */}
          <div className="p-4 rounded-3xl border-2 border-[#D8B282]/40 bg-[#080E1C]/95 backdrop-blur-2xl shadow-[0_0_25px_rgba(216,178,130,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D8B282] animate-ping" />
                <span className="text-[10px] font-mono font-bold text-[#F6E1C3] uppercase tracking-widest">
                  AI MATCHMAKING • ONLINE
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#D8B282] bg-[#D8B282]/10 px-1.5 py-0.5 rounded border border-[#D8B282]/30">
                HOẠT ĐỘNG
              </span>
            </div>
            <p className="text-xl font-black text-white tracking-tight">
              10.000+ DOANH NGHIỆP
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-[#D8B282]/15 border border-[#D8B282]/35 text-[#F6E1C3]">
                🎯 RADAR 360°
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-white/10 border border-white/20 text-white">
                ⚡ KHỚP &lt;0.5S
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-[#D8B282]/15 border border-[#D8B282]/35 text-[#F6E1C3]">
                👑 C-LEVEL 100%
              </span>
            </div>
          </div>

          {/* Card 2: Neural Match Precision */}
          <div className="p-4 rounded-3xl border-2 border-[#D8B282]/40 bg-[#080E1C]/95 backdrop-blur-2xl shadow-[0_0_25px_rgba(216,178,130,0.2)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#D8B282] font-bold">
              <span>ĐỘ CHÍNH XÁC THUẬT TOÁN</span>
              <span className="text-[#F6E1C3] font-bold">99.8% FIT</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#D8B282] via-[#F6E1C3] to-white h-full rounded-full w-[99.8%] animate-pulse" />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1 text-[9.5px] font-mono text-slate-200">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">🤖 2 CHIỀU TỰ ĐỘNG</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">🛡️ 0% SPAM</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">🤝 HỢP TẮC B2B</span>
            </div>
          </div>
        </motion.div>

        {/* Center: 3D Zero-G Cosmic Cyber Robot Sphere with Recon Drones & Targeting HUD */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative">
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
            }}
            className="relative w-80 h-80 sm:w-92 sm:h-92 flex items-center justify-center cursor-pointer group"
            onClick={triggerCosmicScan}
          >
            {/* 4 Corner Target HUD Reticle Brackets */}
            <div className="absolute -inset-2 pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D8B282]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D8B282]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D8B282]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D8B282]" />
            </div>

            {/* Orbiting Recon Drone 1 (Clockwise) */}
            <div className="absolute -inset-6 rounded-full animate-spin-slow pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-[#D8B282] border-2 border-white shadow-md flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
                <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#D8B282] to-transparent" />
              </div>
            </div>

            {/* Orbiting Recon Drone 2 (Counter-Clockwise) */}
            <div className="absolute -inset-10 rounded-full animate-spin-reverse pointer-events-none">
              <div className="absolute bottom-0 right-1/4 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#F6E1C3] border-2 border-white shadow-md flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-slate-950 animate-ping" />
                </div>
                <div className="w-[1px] h-6 bg-gradient-to-t from-[#D8B282] to-transparent" />
              </div>
            </div>

            {/* 3D Gyroscopic Orbit Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D8B282]/50 animate-spin-slow pointer-events-none" />
            <div className="absolute inset-4 rounded-full border-2 border-dotted border-[#F6E1C3]/60 animate-spin-reverse pointer-events-none" />
            <div className="absolute inset-9 rounded-full border border-white/20 animate-pulse pointer-events-none" />

            {/* Interactive Shockwave Ping on Scan Click */}
            {isScanning && (
              <>
                <div className="absolute -inset-12 rounded-full border-2 border-[#D8B282] animate-ping pointer-events-none" />
                <div className="absolute -inset-20 rounded-full border border-[#F6E1C3] animate-ping pointer-events-none" style={{ animationDelay: "0.2s" }} />
              </>
            )}

            {/* Jet Propulsion Plasma Thrusters underneath */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
              <div className="w-20 h-10 bg-gradient-to-b from-[#D8B282]/40 to-transparent blur-[8px] rounded-full animate-pulse" />
              <div className="w-10 h-14 bg-gradient-to-b from-white via-[#F6E1C3] to-transparent blur-[3.5px] rounded-full" />
            </div>

            {/* Main Cyber Android Robot SVG Illustration */}
            <div className={`relative z-20 w-52 h-52 sm:w-56 sm:h-56 rounded-full p-2.5 bg-gradient-to-tr from-[#0F1D38] via-[#081226] to-[#040814] border-2 border-[#D8B282] shadow-[0_0_40px_rgba(216,178,130,0.4),inset_0_0_35px_rgba(216,178,130,0.4)] flex items-center justify-center overflow-hidden transition-all duration-300 ${isScanning ? "ring-4 ring-[#D8B282] scale-108" : "group-hover:scale-105"
              }`}>
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="robotArmorGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFF9EE" />
                    <stop offset="35%" stopColor="#F6E1C3" />
                    <stop offset="70%" stopColor="#D8B282" />
                    <stop offset="100%" stopColor="#0B132B" />
                  </linearGradient>
                  <linearGradient id="cyberVisorGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8C653B" />
                    <stop offset="50%" stopColor="#D8B282" />
                    <stop offset="100%" stopColor="#FFF5E6" />
                  </linearGradient>
                  <linearGradient id="chestCoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFF5E6" />
                    <stop offset="40%" stopColor="#F6E1C3" />
                    <stop offset="70%" stopColor="#D8B282" />
                    <stop offset="100%" stopColor="#C29B69" />
                  </linearGradient>
                </defs>

                {/* Robotic Shoulders & Armor Plating */}
                <path d="M38,165 Q100,138 162,165 L172,195 Q100,182 28,195 Z" fill="url(#robotArmorGrad)" stroke="#FFF5E6" strokeWidth="2.4" />
                <circle cx="48" cy="170" r="9" fill="#D8B282" opacity="0.9" />
                <circle cx="152" cy="170" r="9" fill="#D8B282" opacity="0.9" />

                {/* Cyber Astronaut Helmet Shell */}
                <ellipse cx="100" cy="94" rx="57" ry="54" fill="url(#robotArmorGrad)" stroke="#FFF5E6" strokeWidth="3" />

                {/* Antennas / Radar Sensor Pods */}
                <line x1="44" y1="94" x2="30" y2="80" stroke="#D8B282" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="28" cy="78" r="4.5" fill="#F6E1C3" className="animate-ping" />
                <line x1="156" y1="94" x2="170" y2="80" stroke="#D8B282" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="172" cy="78" r="4.5" fill="#F6E1C3" className="animate-ping" />

                {/* Cyber Visor Scanning Shield Frame */}
                <rect x="54" y="72" width="92" height="40" rx="19" fill="#030A17" stroke="#D8B282" strokeWidth="2.5" />
                <path d="M58,86 Q100,72 142,86 Q100,100 58,86 Z" fill="url(#cyberVisorGrad)" opacity="0.95" />

                {/* Dynamic Visor Laser Sweep Bar */}
                <g className="animate-pulse">
                  <line x1="68" y1="92" x2="132" y2="92" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" />
                  <circle cx="100" cy="92" r="4.5" fill="#FFF" className="animate-ping" />
                </g>

                {/* Chest Quantum Core Reactor */}
                <polygon points="100,136 120,152 112,174 88,174 80,152" fill="url(#chestCoreGrad)" stroke="#FFF" strokeWidth="2" className="animate-pulse" />
                <circle cx="100" cy="156" r="7" fill="#FFF" />
              </svg>

              {/* Floating Holographic Badge on Chest */}
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold tracking-widest bg-black/85 border border-[#D8B282] text-[#F6E1C3] shadow-md uppercase">
                  VIONE ROBOT AI
                </span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Trigger Button Under Robot */}
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={triggerCosmicScan}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#C29B69] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>KÍCH HOẠT ROBOT AI (MIỄN PHÍ) →</span>
            </button>
            <p className="text-[10px] font-mono text-[#F6E1C3] tracking-wider">
              ✦ CHẠM ROBOT ĐỂ PHÁT XUNG NĂNG LƯỢNG QUÉT RADAR B2B ✦
            </p>
          </div>
        </div>

        {/* Right Telemetry Wing - 100% Keywords & Live Telemetry */}
        <motion.div
          animate={{ x: [0, 6, 0], y: [0, 5, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="md:col-span-3 space-y-3 text-left"
        >
          {/* Card 1: Deal Flow */}
          <div className="p-4 rounded-3xl border-2 border-[#D8B282]/40 bg-[#080E1C]/95 backdrop-blur-2xl shadow-[0_0_25px_rgba(216,178,130,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D8B282] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#F6E1C3] uppercase tracking-widest">
                  GIAO THƯƠNG B2B
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#D8B282] bg-[#D8B282]/10 px-1.5 py-0.5 rounded border border-[#D8B282]/30">
                B2B FLOW
              </span>
            </div>
            <p className="text-xl font-black text-white tracking-tight">
              &gt;5.000 TỶ VNĐ
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-[#D8B282]/15 border border-[#D8B282]/35 text-[#F6E1C3]">
                💰 CHUYỂN GIAO 1:1
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-white/10 border border-white/20 text-white">
                🚀 0% TRUNG GIAN
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-[#D8B282]/15 border border-[#D8B282]/35 text-[#F6E1C3]">
                🔒 BẢO MẬT 100%
              </span>
            </div>
          </div>

          {/* Card 2: Hardware Security */}
          <div className="p-4 rounded-3xl border-2 border-[#D8B282]/40 bg-[#080E1C]/95 backdrop-blur-2xl shadow-[0_0_25px_rgba(216,178,130,0.2)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#D8B282] font-bold">
              <span>BẢO MẬT PHẦN CỨNG TIÊU CHUẨN</span>
              <span className="text-[#F6E1C3] font-bold">AES-256 E2E</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#D8B282] via-[#F6E1C3] to-white h-full rounded-full w-full animate-pulse" />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1 text-[9.5px] font-mono text-slate-200">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">💎 TITANIUM NFC</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">🛡️ SOC 2 TYPE II</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">📜 ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



export function BusinessConnectLanding() {
  const { lang } = useLang();
  const t = BC_SAAS_I18N[lang as "vi" | "en"] || BC_SAAS_I18N.vi;

  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // 3-Step Registration Wizard State
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [modalRegisterStep, setModalRegisterStep] = useState<1 | 2 | 3>(1);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);

  // Interactive 3D Pyramid Exploded View State
  const [selectedPyramidTier, setSelectedPyramidTier] = useState<"all" | "apex" | "mid" | "base">("all");

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
    { name: t.navPillars, id: "pillars" },
    { name: "Kim Tự Tháp", id: "pyramid" },
    { name: t.navSecurity, id: "security" },
    { name: t.navEcosystem, id: "ecosystem" },
    { name: "Đặt Lịch", id: "demo" },
  ];

  return (
    <div
      data-theme={themeMode}
      className={`bc-landing relative min-h-screen w-full overflow-x-hidden selection:bg-[#F97316]/30 selection:text-[#EA580C] transition-colors duration-500 ${themeClass(
        "bg-[#05070E] text-[#F8FAFC]",
        "bg-[#FAF7F2] text-[#0F172A]",
        "bg-black text-[#F6E1C3]"
      )}`}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* 0. LUXURY GOLD & ORANGE STYLING & KEYFRAMES */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
          
          .luxury-gold-glow {
            box-shadow: 0 0 35px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(249, 115, 22, 0.2);
          }

          .gold-border-gradient {
            border-image: linear-gradient(135deg, #FDBA74, #F59E0B, #EA580C) 1;
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
            background: linear-gradient(60deg, transparent 30%, rgba(249, 115, 22, 0.25) 50%, transparent 70%);
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
          @keyframes laserConduitPulse {
            0% { stroke-dashoffset: 0; opacity: 0.85; }
            50% { opacity: 1; stroke-width: 3.5; }
            100% { stroke-dashoffset: -40; opacity: 0.85; }
          }
          @keyframes targetLockPing {
            0% { transform: scale(0.95); opacity: 0.95; }
            50% { transform: scale(1.6); opacity: 0.4; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes radarEchoWave {
            0% { transform: scale(0.8); opacity: 0.9; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes amberPulseGlow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.08); }
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
          .animate-laser-conduit {
            animation: laserConduitPulse 1.2s linear infinite;
          }
          .animate-lock-ping {
            animation: targetLockPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .animate-echo-wave {
            animation: radarEchoWave 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          }
          .animate-amber-pulse {
            animation: amberPulseGlow 6s ease-in-out infinite;
          }
        `}
      </style>

      {/* PERSISTENT LUXURY EXECUTIVE BACKGROUND LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {themeMode === "light" ? (
          <>
            {/* Luminous Warm Amber & Radiant Golden Sunburst Halos */}
            <div className="absolute -top-28 -left-24 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(249,115,22,0.12)_35%,transparent_70%)] blur-[120px] animate-amber-pulse" />
            <div className="absolute top-1/4 -right-28 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.25)_0%,rgba(234,88,12,0.14)_40%,transparent_70%)] blur-[140px] animate-amber-pulse" style={{ animationDelay: "3s" }} />
            <div className="absolute bottom-1/4 -left-32 w-[850px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,rgba(251,146,60,0.10)_45%,transparent_70%)] blur-[130px]" />
            <div className="absolute -bottom-32 right-1/4 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0%,rgba(245,158,11,0.12)_40%,transparent_70%)] blur-[140px]" />

            {/* Glowing Golden Cyber Grid (High-Contrast Amber/Gold against Ivory) */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(217, 119, 6, 0.18) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(217, 119, 6, 0.18) 1px, transparent 1px)
                `,
                backgroundSize: '54px 54px'
              }}
            />

            {/* Rotating Sacred Astrolabe & Geometric Rings in Warm Vivid Gold */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20%" cy="25%" r="320" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="8 10" className="animate-spin" style={{ animationDuration: "140s" }} />
              <circle cx="20%" cy="25%" r="280" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 6" />
              <circle cx="85%" cy="65%" r="380" fill="none" stroke="#EA580C" strokeWidth="0.8" strokeDasharray="12 14" className="animate-spin" style={{ animationDuration: "180s", animationDirection: "reverse" }} />
              <circle cx="85%" cy="65%" r="340" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="6 8" />
              <line x1="8%" y1="12%" x2="28%" y2="38%" stroke="#D97706" strokeWidth="1" strokeDasharray="6 6" />
              <line x1="75%" y1="55%" x2="95%" y2="78%" stroke="#EA580C" strokeWidth="1" strokeDasharray="6 6" />
            </svg>
          </>
        ) : (
          <>
            {/* Ambient Gold Nebula Glow Orbs for Dark/Contrast */}
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D8B282]/12 via-[#F6E1C3]/6 to-transparent blur-[140px] animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-[#C29B69]/12 via-[#D8B282]/6 to-transparent blur-[160px] animate-pulse" style={{ animationDuration: "12s" }} />
            <div className="absolute -bottom-40 left-1/4 w-[800px] h-[600px] rounded-full bg-gradient-to-tr from-[#8C653B]/10 via-[#D8B282]/5 to-transparent blur-[150px]" />

            {/* Subtle Cyber Matrix Grid (Gold) */}
            <div 
              className="absolute inset-0 opacity-[0.05] mix-blend-screen"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(216, 178, 130, 0.6) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(216, 178, 130, 0.6) 1px, transparent 1px)
                `,
                backgroundSize: '54px 54px'
              }}
            />

            {/* Subtle Golden Constellation Lines & Rotating Geometries */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20%" cy="25%" r="280" fill="none" stroke="#D8B282" strokeWidth="0.75" strokeDasharray="6 8" className="animate-spin" style={{ animationDuration: "160s" }} />
              <circle cx="85%" cy="65%" r="350" fill="none" stroke="#F6E1C3" strokeWidth="0.5" strokeDasharray="10 14" className="animate-spin" style={{ animationDuration: "200s", animationDirection: "reverse" }} />
              <line x1="10%" y1="15%" x2="25%" y2="35%" stroke="#D8B282" strokeWidth="0.5" strokeDasharray="4 6" />
              <line x1="80%" y1="60%" x2="95%" y2="80%" stroke="#D8B282" strokeWidth="0.5" strokeDasharray="4 6" />
            </svg>
          </>
        )}
      </div>

      {/* 1. FIXED ULTRA-LUXURY EXECUTIVE HEADER */}
      <header
        className={`sticky top-0 inset-x-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${themeClass(
          "bg-[#05070E]/90 border-[#D8B282]/25 text-white shadow-[0_4px_30px_rgba(0,0,0,0.9)]",
          "bg-[#FAF7F2]/95 border-[#F59E0B]/35 text-[#0F172A] shadow-[0_4px_25px_rgba(245,158,11,0.12)]",
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
                    "bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706] drop-shadow-sm font-black",
                    "bg-yellow-300"
                  )}`}>
                    VIONE
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${themeClass(
                    "bg-[#D8B282]/15 text-[#F6E1C3] border-[#D8B282]/35",
                    "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#EA580C] border-[#F97316]/50 shadow-xs font-black",
                    "bg-yellow-400/20 text-yellow-300 border-yellow-400"
                  )}`}>
                    ENTERPRISE
                  </span>
                </div>
                <p className={`text-[10px] font-mono tracking-wider uppercase font-bold ${themeClass("text-slate-400", "text-[#475569]", "text-yellow-200")}`}>
                  BUSINESS CONNECT
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={`hidden xl:flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md border ${themeClass(
              "bg-black/40 border-[#D8B282]/25",
              "bg-white/95 border-[#F59E0B]/40 shadow-xs",
              "bg-black border-yellow-400"
            )}`}>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${themeClass(
                    "text-slate-300 hover:text-[#F6E1C3] hover:bg-[#D8B282]/10",
                    "text-[#334155] hover:text-[#EA580C] hover:bg-[#FFF7ED]",
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
              <div className={`flex items-center rounded-xl p-1 gap-1 border ${themeClass(
                "bg-black/30 border-[#D8B282]/25",
                "bg-white/95 border-[#F59E0B]/40 shadow-xs",
                "bg-black border-yellow-400"
              )}`}>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === "dark"
                      ? "bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                    }`}
                  title={t.modeDark}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === "light"
                      ? "bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white shadow-md shadow-orange-500/25"
                      : "text-slate-400 hover:text-[#EA580C]"
                    }`}
                  title={t.modeLight}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode("contrast")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${themeMode === "contrast"
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
                  "border-[#F59E0B]/50 bg-white text-[#EA580C] hover:bg-[#FFF7ED] shadow-xs font-black",
                  "border-yellow-400 bg-black text-yellow-300"
                )}`}
              >
                {t.navOpenApp}
              </Link>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white shadow-[0_4px_20px_rgba(249,115,22,0.45)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
            {/* Robot GIF animation background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-screen"
              style={{ backgroundImage: "url('/landing/luxury-gold-grid.gif')" }}
            />
            {/* Overlay robot tech pattern */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen"
              style={{ backgroundImage: "url('/landing/tech-grid-motion.gif')" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.4)_0%,#05070E_85%)]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="High-End Daylight Business HQ"
              className="w-full h-full object-cover object-center opacity-30 filter brightness-105 saturate-125"
            />
            {/* Luminous Ivory & Warm Gold Radiant Sunburst */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.32)_0%,rgba(250,247,242,0.65)_45%,#FAF7F2_85%)]" />
            <div className="absolute -top-32 left-1/4 w-[750px] h-[550px] bg-gradient-to-br from-[#F59E0B]/25 via-[#FB923C]/15 to-transparent blur-[110px] rounded-full animate-amber-pulse" />
            <div className="absolute top-1/3 -right-20 w-[650px] h-[650px] bg-gradient-to-bl from-[#EA580C]/20 via-[#F59E0B]/20 to-transparent blur-[130px] rounded-full animate-amber-pulse" style={{ animationDelay: "3s" }} />
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
            {/* Eyebrow Pill in Vivid Amber-Orange */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono shadow-md ${themeClass(
                "border-[#D8B282]/45 bg-[#D8B282]/10 text-[#F6E1C3]",
                "border-[#F97316]/50 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#EA580C] font-black shadow-[0_2px_12px_rgba(249,115,22,0.2)]",
                "border-yellow-400 bg-yellow-400/20 text-yellow-300"
              )}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C] sm:text-[#D8B282]" />
              <span>{t.heroBadge}</span>
            </motion.div>

            {/* Hero H1 Headline with Vivid Gold Specular Text */}
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] uppercase ${themeClass(
              "text-white",
              "text-[#0F172A]",
              "text-yellow-300"
            )}`}>
              <span>{t.heroTitle1} </span>
              <span className={`text-transparent bg-clip-text ${themeClass(
                "bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] drop-shadow-[0_2px_25px_rgba(216,178,130,0.4)]",
                "bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706] drop-shadow-sm font-black",
                "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-200"
              )}`}>
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
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white font-black text-xs sm:text-sm shadow-[0_10px_35px_rgba(249,115,22,0.45)] hover:shadow-[0_12px_45px_rgba(249,115,22,0.65)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.heroCtaDemo}</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className={`px-6 py-4 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-md group ${themeClass(
                  "border-[#D8B282]/45 bg-black/50 text-[#F6E1C3] hover:bg-[#D8B282]/15",
                  "border-2 border-[#EA580C]/50 bg-white/95 text-[#EA580C] hover:bg-[#FFF7ED] shadow-sm font-black",
                  "border-yellow-400 bg-black text-yellow-300"
                )}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#F97316] to-[#D97706] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>{t.heroCtaVideo}</span>
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
              </button>
            </div>
          </motion.div>

          {/* 3D TITANIUM EXECUTIVE NFC PASS & B2B QUANTUM NEXUS HERO CENTERPIECE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full my-6 sm:my-10"
          >
            <TitaniumExecutive3DHeroCard
              themeMode={themeMode}
              onActivate={() => setDemoModalOpen(true)}
            />
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
              { num: t.stat1Num, title: t.stat1Title, desc: t.stat1Desc, icon: UserCheck, tag: "C-LEVEL", pct: 100, color: "#EA580C" },
              { num: t.stat2Num, title: t.stat2Title, desc: t.stat2Desc, icon: Handshake, tag: "CLOSED-LOOP", pct: 94, color: "#F59E0B" },
              { num: t.stat3Num, title: t.stat3Title, desc: t.stat3Desc, icon: Bot, tag: "AI MATCH", pct: 98, color: "#EA580C" },
              { num: t.stat4Num, title: t.stat4Title, desc: t.stat4Desc, icon: ShieldCheck, tag: "SOC 2 TYPE II", pct: 99.99, color: "#F59E0B" },
            ].map((stat, sIdx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={sIdx}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
                  }}
                  whileHover={{ y: -6, scale: 1.025, borderColor: "#EA580C" }}
                  className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between transition-all group backdrop-blur-xl shadow-xl relative overflow-hidden ${themeClass(
                    "border-[#D8B282]/30 bg-[#080D1A]/90 hover:bg-[#0E152A]",
                    "border-2 border-[#F59E0B]/50 bg-white/98 shadow-[0_12px_32px_rgba(245,158,11,0.15)] hover:border-[#EA580C] hover:shadow-[0_16px_40px_rgba(234,88,12,0.22)]",
                    "border-yellow-400 bg-black text-yellow-300"
                  )}`}
                >
                  {/* Top Bar with Tag and Live Pulse Dot */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${themeClass(
                      "bg-black/60 border-[#D8B282]/30 text-[#F6E1C3]",
                      "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] border-[#F97316]/40 text-[#EA580C] font-black shadow-xs",
                      "bg-black border-yellow-400 text-yellow-300"
                    )}`}>
                      {stat.tag}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
                  </div>

                  {/* Circular Radial Gauge Element */}
                  <div className="flex items-center gap-4 my-2">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        {/* Background Track Circle */}
                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="4" className={themeClass("text-white/10", "text-[#F59E0B]/20", "text-yellow-400/20")} />
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
                          className="drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]"
                        />
                      </svg>
                      {/* Center Icon */}
                      <div className={`absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div>
                      <p className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text ${themeClass(
                        "bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                        "bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706]",
                        "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-200"
                      )}`}>
                        {stat.num}
                      </p>
                      <p className={`text-xs font-bold leading-tight mt-0.5 ${themeClass("text-slate-100", "text-[#0F172A]", "text-yellow-300")}`}>
                        {stat.title}
                      </p>
                    </div>
                  </div>

                  <p className={`text-[11px] mt-1 leading-snug border-t pt-2 ${themeClass("border-[#D8B282]/15 text-slate-400", "border-[#F59E0B]/20 text-[#475569]", "border-yellow-400/20 text-yellow-100")}`}>
                    {stat.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HỆ ĐIỀU HÀNH SỐ HÓA 3D (3D VIONE OS DIGITAL ECOSYSTEM)
          ========================================================================= */}
      <ScrollSection
        id="pillars"
        direction="scale"
        className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
          "bg-[#04060C]",
          "bg-[#FAF7F2]",
          "bg-black"
        )}`}
      >
        {/* Dedicated Background per Theme */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Robot Matrix background animation */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-screen brightness-90 contrast-125"
              style={{ backgroundImage: "url('/landing/business_connect_matrix_bg.jpg')" }}
            />
            {/* Robot GIF overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen"
              style={{ backgroundImage: "url('/landing/luxury-gold-grid.gif')" }}
            />
            {/* Pulsing Circuit Laser Wave */}
            <svg viewBox="0 0 1440 220" fill="none" className="absolute bottom-0 inset-x-0 w-full opacity-35 animate-pulse pointer-events-none" style={{ animationDuration: "6s" }}>
              <path d="M0,110 Q360,20 720,110 T1440,110" stroke="#D8B282" strokeWidth="2" strokeDasharray="14 10" opacity="0.8" />
              <path d="M0,140 Q360,210 720,140 T1440,140" stroke="#F6E1C3" strokeWidth="1.5" strokeDasharray="20 14" opacity="0.6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Radiant Ivory & Golden Sunburst Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(249,115,22,0.12)_35%,transparent_70%)] blur-[120px] animate-amber-pulse" />
            <div className="absolute -top-20 right-10 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.25)_0%,rgba(234,88,12,0.10)_45%,transparent_70%)] blur-[110px]" />
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="B2B Light Architecture"
              className="w-full h-full object-cover object-center opacity-20 filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/95 via-[#FAF7F2]/65 to-[#FAF7F2]/95" />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-mono font-black uppercase tracking-wider ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/40 text-[#F6E1C3]",
              "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] border-[#F97316]/50 text-[#EA580C] font-black shadow-sm",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              <Cpu className={`w-3.5 h-3.5 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`} />
              <span>VIONE OS • HỆ ĐIỀU HÀNH 3D SỐ HÓA</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0F172A]",
              "text-yellow-300"
            )}`}>
              9 KHỐI HỆ SINH THÁI DOANH NGHIỆP SỐ HOÁ
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed font-medium ${themeClass(
              "text-slate-300",
              "text-[#334155]",
              "text-yellow-100"
            )}`}>
              Hệ thống vận hành liên hoàn kết nối hội viên, đối tác và dòng tiền trong một kiến trúc số duy nhất.
            </p>
          </div>

          {/* CENTRAL COSMIC ROBOT AI HUB ORBITING 9 ECOSYSTEM MODULES */}
          <RobotEcosystemOrbitalHub
            themeMode={themeMode}
            onActivateDemo={() => setDemoModalOpen(true)}
          />
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 3.5: KIM TỰ THÁP QUẢN TRỊ 3 TẦNG TRỰC QUAN (SACRED 3D GOVERNANCE PYRAMID)
          ========================================================================= */}
      <ScrollSection
        id="pyramid"
        direction="scale"
        className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
          "bg-[#03050B]",
          "bg-[#FAF7F2]",
          "bg-black"
        )}`}
      >
        {/* Dedicated Background per Theme */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/robot_pyramid_3d_cyber.jpg"
              alt="Pyramid Governance Dark"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-screen brightness-95"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,6,12,0.35)_0%,#04060C_85%)]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Radiant Amber Sunburst & Sacred Halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(234,88,12,0.12)_40%,transparent_70%)] blur-[130px] animate-amber-pulse" />
            <img
              src="/landing/pyramids_3d_zerog.jpg"
              alt="Pyramid Governance Light"
              className="w-full h-full object-cover object-center opacity-20 filter brightness-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,247,242,0.35)_0%,#FAF7F2_85%)]" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-black" />
          </div>
        )}

        {/* Background Sacred Geometry Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg className="w-full h-full opacity-10" viewBox="0 0 1000 700" preserveAspectRatio="none">
            <polygon points="500,60 120,640 880,640" fill="none" stroke="#D8B282" strokeWidth="1.5" strokeDasharray="10 8" />
            <line x1="500" y1="60" x2="500" y2="640" stroke="#F6E1C3" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            <line x1="370" y1="250" x2="630" y2="250" stroke="#D8B282" strokeWidth="1.5" opacity="0.8" />
            <line x1="240" y1="440" x2="760" y2="440" stroke="#D8B282" strokeWidth="1.5" opacity="0.8" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-10">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-mono font-black uppercase tracking-wider ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/40 text-[#F6E1C3]",
              "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] border-[#F97316]/50 text-[#EA580C] font-black shadow-sm",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              <Crown className={`w-3.5 h-3.5 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`} />
              <span>CẤU TRÚC QUẢN TRỊ LIÊN MINH B2B</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0F172A]",
              "text-yellow-300"
            )}`}>
              MÔ HÌNH KIM TỰ THÁP QUẢN TRỊ 3 TẦNG
            </h2>
            <div className="mt-3 flex flex-wrap justify-center items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border shadow-sm ${themeClass(
                "border-[#D8B282]/50 bg-[#D8B282]/20 text-[#F6E1C3]",
                "border-[#F97316]/50 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#EA580C] shadow-sm font-black"
              )}`}>
                👑 ĐỈNH: VỐN & CỐ VẤN
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border shadow-sm ${themeClass(
                "border-white/40 bg-white/10 text-white",
                "border-[#F59E0B]/50 bg-white text-[#D97706] shadow-sm font-black"
              )}`}>
                🏛️ THÂN: 300+ HIỆP HỘI
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border shadow-sm ${themeClass(
                "border-[#D8B282]/50 bg-[#D8B282]/20 text-[#F6E1C3]",
                "border-[#EA580C]/50 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#C2410C] shadow-sm font-black"
              )}`}>
                🌐 ĐÁY: 10.000+ DOANH NGHIỆP
              </span>
            </div>
          </div>

          {/* =========================================================================
              TRUE 3D GOVERNANCE PYRAMID WITH 3 TIERS & SATELLITE SECTORS
              ========================================================================= */}
          <Pyramid3DGovernance themeMode={themeMode} />
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 4: CHUẨN BẢO MẬT & HẠ TẦNG SLA 99.99% (ENTERS FROM LEFT)
          ========================================================================= */}
      <ScrollSection id="security" direction="left" className={`border-t border-[#D8B282]/20 relative overflow-hidden transition-colors duration-500 ${themeClass(
        "bg-[#05070E]",
        "bg-[#FAF7F2]",
        "bg-black"
      )}`}>
        {/* Dedicated Background per Theme */}
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
            {/* Luminous Warm Amber Sunburst */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.20)_0%,rgba(249,115,22,0.10)_40%,transparent_70%)] blur-[120px] animate-amber-pulse" />
            <img
              src="/landing/business-saas-light.jpg"
              alt="Security Architecture Light"
              className="w-full h-full object-cover object-center opacity-20 filter brightness-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,247,242,0.35)_0%,#FAF7F2_85%)]" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-black" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
          <CyberSecurityShieldHub themeMode={themeMode} />
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
          "bg-[#FAF7F2]",
          "bg-black"
        )}`}
      >
        {/* Dedicated Background per Theme */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/smart_city_40_skyline.jpg"
              alt="Ecosystem Skyline Dark"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-screen brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#04060C] via-transparent to-[#04060C]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Luminous Golden Skyline Sunburst */}
            <div className="absolute top-1/2 left-10 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22)_0%,rgba(234,88,12,0.12)_40%,transparent_70%)] blur-[120px] animate-amber-pulse" />
            <img
              src="/landing/smart_city_towers_growth.jpg"
              alt="Ecosystem Skyline Light"
              className="w-full h-full object-cover object-center opacity-20 filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/95 via-[#FAF7F2]/65 to-[#FAF7F2]/95" />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
          <CyberRadarCommandHub
            themeMode={themeMode}
            onOpenDemoModal={() => setDemoModalOpen(true)}
          />
        </div>
      </ScrollSection>

      {/* =========================================================================
          SECTION 6: ĐẶT LỊCH TRẢI NGHIỆM (ENTERS WITH 3D SCALE DEPTH & ANCHORED HALF-COGS)
          ========================================================================= */}
      <ScrollSection id="demo" direction="scale" className={`border-t border-[#D8B282]/20 relative overflow-hidden py-16 transition-colors duration-500 ${themeClass(
        "bg-[#05070E]",
        "bg-[#FAF7F2]",
        "bg-black"
      )}`}>
        {/* Dedicated Background per Theme */}
        {themeMode === "dark" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/business-cta-bg.jpg"
              alt="CTA Background Dark"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-screen brightness-90"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0.35)_0%,#05070E_85%)]" />
          </div>
        )}

        {themeMode === "light" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Luminous Warm Amber Sunbursts */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(234,88,12,0.12)_40%,transparent_70%)] blur-[130px] animate-amber-pulse" />
            <img
              src="/landing/business_connect_light_hq.jpg"
              alt="CTA Background Light"
              className="w-full h-full object-cover object-center opacity-15 filter brightness-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,247,242,0.4)_0%,#FAF7F2_85%)]" />
          </div>
        )}

        {themeMode === "contrast" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-black" />
          </div>
        )}
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
            <span className={`text-xs font-mono font-black px-3 py-1 rounded-full border uppercase ${themeClass(
              "bg-[#D8B282]/15 border-[#D8B282]/35 text-[#F6E1C3]",
              "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] border-[#F97316]/50 text-[#EA580C] shadow-sm",
              "bg-yellow-400/20 border-yellow-400 text-yellow-300"
            )}`}>
              VIP ACCESS 06 • BẮT ĐẦU NGAY HÔM NAY
            </span>
            <h2 className={`text-3xl sm:text-5xl font-black mt-3 uppercase tracking-tight ${themeClass(
              "text-white",
              "text-[#0F172A]",
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
            "border-2 border-[#F59E0B]/60 bg-white/98 shadow-[0_20px_60px_rgba(245,158,11,0.18)]",
            "border-yellow-400 bg-black text-yellow-300"
          )}`}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent" />

            {/* 3-Step Stepper Header */}
            {!demoSubmitted && (
              <div className={`mb-8 border-b pb-5 ${themeClass("border-[#D8B282]/25", "border-[#F59E0B]/30", "border-yellow-400/30")}`}>
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div
                    onClick={() => setRegisterStep(1)}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${registerStep === 1
                        ? themeClass("text-[#D8B282] font-bold", "text-[#EA580C] font-black", "text-yellow-300 font-bold")
                        : "text-slate-400 hover:text-[#EA580C]"
                      }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${registerStep === 1
                          ? themeClass("bg-[#D8B282] text-slate-950 shadow-md", "bg-gradient-to-r from-[#F97316] to-[#D97706] text-white shadow-md", "bg-yellow-400 text-black")
                          : registerStep > 1
                            ? themeClass("bg-[#D8B282]/30 text-[#D8B282]", "bg-[#FFF7ED] text-[#EA580C] border border-[#F97316]/40", "bg-yellow-400/30 text-yellow-300")
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                    >
                      1
                    </span>
                    <span className="text-xs hidden sm:inline font-bold">Thông Tin</span>
                  </div>

                  <div className={`flex-1 h-[2px] mx-3 ${themeClass("bg-[#D8B282]/30", "bg-[#F59E0B]/30", "bg-yellow-400/30")}`} />

                  <div
                    onClick={() => {
                      if (formData.name && formData.phone) setRegisterStep(2);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${registerStep === 2
                        ? themeClass("text-[#D8B282] font-bold", "text-[#EA580C] font-black", "text-yellow-300 font-bold")
                        : "text-slate-400 hover:text-[#EA580C]"
                      }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${registerStep === 2
                          ? themeClass("bg-[#D8B282] text-slate-950 shadow-md", "bg-gradient-to-r from-[#F97316] to-[#D97706] text-white shadow-md", "bg-yellow-400 text-black")
                          : registerStep > 2
                            ? themeClass("bg-[#D8B282]/30 text-[#D8B282]", "bg-[#FFF7ED] text-[#EA580C] border border-[#F97316]/40", "bg-yellow-400/30 text-yellow-300")
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                    >
                      2
                    </span>
                    <span className="text-xs hidden sm:inline font-bold">Quy Mô & Nhu Cầu</span>
                  </div>

                  <div className={`flex-1 h-[2px] mx-3 ${themeClass("bg-[#D8B282]/30", "bg-[#F59E0B]/30", "bg-yellow-400/30")}`} />

                  <div
                    onClick={() => {
                      if (formData.name && formData.phone) setRegisterStep(3);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-all ${registerStep === 3
                        ? themeClass("text-[#D8B282] font-bold", "text-[#EA580C] font-black", "text-yellow-300 font-bold")
                        : "text-slate-400 hover:text-[#EA580C]"
                      }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${registerStep === 3
                          ? themeClass("bg-[#D8B282] text-slate-950 shadow-md", "bg-gradient-to-r from-[#F97316] to-[#D97706] text-white shadow-md", "bg-yellow-400 text-black")
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                    >
                      3
                    </span>
                    <span className="text-xs hidden sm:inline font-bold">Lịch Hẹn VIP</span>
                  </div>
                </div>
              </div>
            )}

            {demoSubmitted ? (
              <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${themeClass(
                  "bg-[#D8B282]/20 border border-[#D8B282] text-[#D8B282] shadow-[0_0_30px_rgba(216,178,130,0.5)]",
                  "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] border-2 border-[#EA580C] text-[#EA580C] shadow-[0_0_30px_rgba(249,115,22,0.3)]",
                  "bg-yellow-400/20 border border-yellow-400 text-yellow-300"
                )}`}>
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${themeClass(
                    "bg-[#D8B282]/20 text-[#F6E1C3] border-[#D8B282]/40",
                    "bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#EA580C] border-[#F97316]/50 shadow-xs",
                    "bg-yellow-400/20 text-yellow-300 border-yellow-400"
                  )}`}>
                    ĐÃ KÍCH HOẠT THÀNH CÔNG GÓI VIP PASS 30 NGÀY
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${themeClass("text-white", "text-[#0F172A]", "text-yellow-300")}`}>
                    Chào Mừng {formData.name || "Doanh Nghiệp"}!
                  </h3>
                  <p className={`text-sm max-w-md mx-auto mt-2 leading-relaxed ${themeClass("text-slate-300", "text-[#334155]", "text-yellow-100")}`}>
                    Yêu cầu kích hoạt tài khoản tổ chức của <strong>{formData.org || "Tổ chức của bạn"}</strong> đã được ghi nhận. Chuyên viên giải pháp C-Level sẽ liên hệ qua <strong>{formData.phone}</strong> để bàn giao tài khoản.
                  </p>
                </div>

                {/* VIP Card Preview */}
                <div className="max-w-sm mx-auto p-4 rounded-2xl border border-[#F59E0B]/50 bg-gradient-to-br from-[#1B1712] via-[#0E0C09] to-[#050403] text-left shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#F59E0B]/20 pb-2 mb-3">
                    <span className="text-[10px] font-mono text-[#F59E0B] uppercase tracking-wider font-bold">VIONE VIP ACCESS PASS</span>
                    <span className="text-[10px] font-mono text-[#FEF3C7] font-bold">ACTIVE 30 DAYS</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-[#FEF3C7] font-bold text-sm">{formData.name || "Đại diện Doanh nghiệp"}</div>
                    <div className="text-slate-400 text-[11px]">{formData.org || "Tổ chức Doanh nghiệp B2B"}</div>
                    <div className="text-[10px] font-mono text-[#F59E0B] pt-2">PASS CODE: <span className="text-white font-bold">{formData.vipCode || "VIONE-VIP30"}</span></div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/auth"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
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
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${themeClass(
                      "border-[#D8B282]/40 text-[#F6E1C3] hover:bg-[#D8B282]/10",
                      "border-[#EA580C]/40 text-[#EA580C] hover:bg-[#FFF7ED]",
                      "border-yellow-400 text-yellow-300"
                    )}`}
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
                    <div className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`}>
                      <span className={`w-2 h-2 rounded-full ${themeClass("bg-[#D8B282]", "bg-[#EA580C]", "bg-yellow-400")}`} />
                      BƯỚC 1: THÔNG TIN NGƯỜI ĐẠI DIỆN & DOANH NGHIỆP
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
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
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
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
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
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
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
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
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                        VỊ TRÍ / CHỨC VỤ ĐẠI DIỆN
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                          "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                          "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
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
                      <div className={`text-xs flex items-center gap-2 ${themeClass("text-slate-300", "text-[#334155]", "text-yellow-100")}`}>
                        <CheckCircle2 className={`w-4 h-4 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-400")}`} />
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
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
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
                    <div className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`}>
                      <span className={`w-2 h-2 rounded-full ${themeClass("bg-[#D8B282]", "bg-[#EA580C]", "bg-yellow-400")}`} />
                      BƯỚC 2: QUY MÔ & NHU CẦU KẾT NỐI HỆ SINH THÁI
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                          QUY MÔ HỘI VIÊN / NHÂN SỰ
                        </label>
                        <select
                          value={formData.scale}
                          onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
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
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                          KHỐI NGÀNH KINH DOANH CHỦ LỰC
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
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
                      <label className={`block text-xs font-mono font-bold mb-2 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
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
                            className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${formData.needs.includes(need)
                                ? themeClass(
                                    "border-[#D8B282] bg-[#D8B282]/15 text-[#F6E1C3] font-bold shadow-xs",
                                    "border-2 border-[#EA580C] bg-[#FFF7ED] text-[#EA580C] font-black shadow-xs",
                                    "border-yellow-400 bg-yellow-400/20 text-yellow-300"
                                  )
                                : themeClass(
                                    "border-white/10 bg-white/[0.03] text-slate-400 hover:border-[#D8B282]/40",
                                    "border-slate-200 bg-white text-slate-700 hover:border-[#F59E0B]",
                                    "border-yellow-400/40 bg-zinc-900 text-yellow-100"
                                  )
                              }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.needs.includes(need)
                                  ? themeClass("border-[#D8B282] bg-[#D8B282] text-slate-950", "border-[#EA580C] bg-[#EA580C] text-white", "border-yellow-400 bg-yellow-400 text-black")
                                  : "border-slate-400"
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
                        className={`px-5 py-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${themeClass(
                          "border-white/20 text-slate-300 hover:bg-white/10",
                          "border-slate-300 text-slate-700 hover:bg-slate-100",
                          "border-yellow-400 text-yellow-300"
                        )}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>QUAY LẠI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
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
                    <div className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${themeClass("text-[#D8B282]", "text-[#EA580C]", "text-yellow-300")}`}>
                      <span className={`w-2 h-2 rounded-full ${themeClass("bg-[#D8B282]", "bg-[#EA580C]", "bg-yellow-400")}`} />
                      BƯỚC 3: LỊCH HẸN CHUYÊN GIA 1:1 & KÍCH HOẠT VIP PASS
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                          HÌNH THỨC TƯ VẤN TRIỂN KHAI
                        </label>
                        <select
                          value={formData.consultType}
                          onChange={(e) => setFormData({ ...formData, consultType: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                            "border-yellow-400 bg-black text-yellow-300"
                          )}`}
                        >
                          <option value="online">Tư vấn trực tuyến 1:1 (Google Meet / Zoom)</option>
                          <option value="office">Trực tiếp tại Trụ sở Doanh nghiệp của bạn</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                          KHUNG GIỜ PHÙ HỢP
                        </label>
                        <select
                          value={formData.consultTime}
                          onChange={(e) => setFormData({ ...formData, consultTime: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${themeClass(
                            "border-[#D8B282]/30 bg-black/60 text-white focus:border-[#F6E1C3]",
                            "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
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
                      <label className={`block text-xs font-mono font-bold mb-1 ${themeClass("text-[#F6E1C3]", "text-[#C2410C] font-black", "text-yellow-300")}`}>
                        MÃ ƯU ĐÃI VIP PASS (NẾU CÓ)
                      </label>
                      <input
                        type="text"
                        value={formData.vipCode}
                        onChange={(e) => setFormData({ ...formData, vipCode: e.target.value.toUpperCase() })}
                        placeholder="VIONE-VIP30"
                        className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none font-mono uppercase transition-colors ${themeClass(
                          "border-[#D8B282]/30 bg-black/60 text-[#F6E1C3] focus:border-[#F6E1C3]",
                          "border-[#F59E0B]/50 bg-[#FAF7F2] text-[#0F172A] focus:border-[#EA580C] focus:bg-white font-medium",
                          "border-yellow-400 bg-black text-yellow-300"
                        )}`}
                      />
                      <p className={`text-[11px] mt-1 font-medium ${themeClass("text-[#D8B282]", "text-[#EA580C] font-bold", "text-yellow-300")}`}>
                        * Áp dụng mã đặc quyền trải nghiệm trọn bộ tính năng Enterprise trong 30 ngày hoàn toàn miễn phí.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${themeClass(
                          "border-white/20 text-slate-300 hover:bg-white/10",
                          "border-slate-300 text-slate-700 hover:bg-slate-100",
                          "border-yellow-400 text-yellow-300"
                        )}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>QUAY LẠI</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submittingDemo}
                        className="w-full sm:w-auto px-9 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#D97706] text-white font-black text-xs uppercase tracking-wider shadow-[0_8px_30px_rgba(249,115,22,0.45)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.65)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
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
        "border-[#F59E0B]/30 bg-[#FAF7F2] text-[#475569]",
        "border-yellow-400 bg-black text-yellow-300"
      )}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 ViOne Business Connect Platform. Tiêu chuẩn điều hành doanh nghiệp B2B.</p>
          <div className={`flex items-center gap-4 font-mono text-[11px] ${themeClass("text-[#D8B282]", "text-[#EA580C] font-bold", "text-yellow-300")}`}>
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
