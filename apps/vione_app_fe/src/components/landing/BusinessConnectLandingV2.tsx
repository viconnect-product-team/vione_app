import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  LockKeyhole,
  Layers,
  Clock,
  Landmark,
  Sun,
  Moon,
  Database,
  Unlink,
  BarChart3,
  LineChart,
  LayoutDashboard,
  KeyRound,
  Cpu,
  Globe2,
  Award,
  Crown,
  Network,
  CheckCircle2,
  Workflow,
  X,
  TrendingDown,
  Activity,
  Check,
} from "lucide-react";
import { BusinessConnectPartnersSection } from "./BusinessConnectPartnersSection";
import { toast } from "sonner";
import { useAutoHideHeader } from "./useAutoHideHeader";
import { KineticWords } from "./KineticTypography";

/** Themed Zen / Bamboo Atmosphere Scenery Cut Component (1/2 & 2/3 Asymmetrical Cuts) */
function ZenSectionSceneryCut({
  themeMode,
  side = "right",
  ratio = "2/3",
  id,
}: {
  themeMode: "light" | "dark";
  side?: "left" | "right";
  ratio?: "1/2" | "2/3";
  id: string;
}) {
  const imgSrc = themeMode === "dark" ? "/landing/tutien_dark_bg.jpg" : "/landing/tutien_light_bg.jpg";
  const clipId = `zenClip_${id}`;
  const gradId = `zenGrad_${id}`;

  const clipPathD =
    side === "right"
      ? ratio === "2/3"
        ? "M 0.35,0 C 0.45,0.22 0.52,0.48 0.40,0.72 C 0.32,0.86 0.28,0.94 0.22,1.0 L 1,1 L 1,0 Z"
        : "M 0.50,0 C 0.60,0.22 0.65,0.48 0.52,0.72 C 0.46,0.86 0.42,0.94 0.38,1.0 L 1,1 L 1,0 Z"
      : ratio === "2/3"
      ? "M 0,0 L 0.65,0 C 0.55,0.22 0.48,0.48 0.60,0.72 C 0.68,0.86 0.72,0.94 0.78,1.0 L 0,1 Z"
      : "M 0,0 L 0.50,0 C 0.40,0.22 0.35,0.48 0.48,0.72 C 0.54,0.86 0.58,0.94 0.62,1.0 L 0,1 Z";

  const waveLineD =
    side === "right"
      ? ratio === "2/3"
        ? "M 504,0 C 648,220 748,480 576,720 C 460,860 403,940 316,1000"
        : "M 720,0 C 864,220 936,480 748,720 C 662,860 604,940 547,1000"
      : ratio === "2/3"
      ? "M 936,0 C 792,220 691,480 864,720 C 979,860 1036,940 1123,1000"
      : "M 720,0 C 576,220 504,480 691,720 C 777,860 835,940 892,1000";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={clipPathD} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ clipPath: `url(#${clipId})` }}
      >
        <img
          src={imgSrc}
          alt="Zen Bamboo Nature Scenery"
          className={`w-full h-full object-cover ${
            side === "right" ? "object-right-top" : "object-left-top"
          } transition-all duration-700 ${
            themeMode === "dark"
              ? "opacity-75 filter brightness-100 contrast-110"
              : "opacity-45 filter brightness-105 contrast-95"
          }`}
        />
        {/* Soft edge fade into pure background */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            side === "right"
              ? themeMode === "dark"
                ? "bg-gradient-to-l from-transparent via-[#0B0F0B]/40 to-[#0B0F0B]/95"
                : "bg-gradient-to-l from-transparent via-[#FAF9F6]/40 to-[#FAF9F6]/95"
              : themeMode === "dark"
                ? "bg-gradient-to-r from-transparent via-[#0B0F0B]/40 to-[#0B0F0B]/95"
                : "bg-gradient-to-r from-transparent via-[#FAF9F6]/40 to-[#FAF9F6]/95"
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            themeMode === "dark"
              ? "bg-gradient-to-b from-[#0B0F0B]/50 via-transparent to-[#0B0F0B]/75"
              : "bg-gradient-to-b from-[#FAF9F6]/50 via-transparent to-[#FAF9F6]/75"
          }`}
        />
      </div>

      {/* Boundary Wave Stroke */}
      <svg
        viewBox="0 0 1440 1000"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d={waveLineD}
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          className={themeMode === "dark" ? "opacity-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "opacity-50 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]"}
        />
        <path
          d={waveLineD}
          stroke={themeMode === "dark" ? "#6EE7B7" : "#065F46"}
          strokeWidth="1"
          strokeDasharray="4 8"
          className="opacity-50"
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeMode === "dark" ? "#A7F3D0" : "#10B981"} stopOpacity="0.3" />
            <stop offset="40%" stopColor={themeMode === "dark" ? "#10B981" : "#047857"} stopOpacity="0.95" />
            <stop offset="80%" stopColor={themeMode === "dark" ? "#047857" : "#064E3B"} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function BusinessConnectLandingV2() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const { showHeader, headerStyle, resetTimer } = useAutoHideHeader(3000);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    note: "",
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đăng ký thành công! Chuyên gia Business Connect sẽ liên hệ tư vấn chuyên sâu trong 24h.");
    setDemoModalOpen(false);
    setDemoForm({ name: "", phone: "", email: "", org: "", note: "" });
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative overflow-x-hidden selection:bg-emerald-800 selection:text-emerald-100 ${
        themeMode === "dark" ? "bg-[#0B0F0B] text-stone-100" : "bg-[#FAF9F6] text-[#1C1917]"
      }`}
      style={{
        fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Icon Keyframe Animations */}
      <style>{`
        @keyframes zenPulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(16,185,129,0.3)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(16,185,129,0.7)); }
        }
        @keyframes zenFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes zenBeaconPing {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.25); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.9; }
        }
        @keyframes zenSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .anim-zen-pulse { animation: zenPulseGlow 3.5s ease-in-out infinite; }
        .anim-zen-float { animation: zenFloat 4s ease-in-out infinite; }
        .anim-zen-beacon { animation: zenBeaconPing 2.5s cubic-bezier(0,0,0.2,1) infinite; }
        .anim-zen-spin { animation: zenSpinSlow 16s linear infinite; }
      `}</style>

      {/* =========================================================================
          SECTION 1: HEADER (Tự ẩn sau 3s, di chuột hoặc scroll thì hiện lại)
          Theme Sáng / Tối chuyển đổi linh hoạt
          ========================================================================= */}
      <header
        style={headerStyle}
        onMouseEnter={resetTimer}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${
          themeMode === "dark"
            ? "bg-[#0B0F0B]/90 border-stone-800 shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
            : "bg-[#FAF9F6]/95 border-stone-200 shadow-[0_2px_15px_rgba(28,25,23,0.04)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/business-connect/v2" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform ${
              themeMode === "dark" ? "bg-emerald-950 border-emerald-700 text-emerald-400" : "bg-emerald-100 border-emerald-300 text-emerald-800"
            }`}>
              <Network className="w-5 h-5 anim-zen-pulse text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black tracking-tight block leading-tight ${
                  themeMode === "dark" ? "text-white" : "text-stone-900"
                }`}>
                  BUSINESS <span className="text-emerald-500">CONNECT</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  themeMode === "dark"
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}>
                  V2 ZEN
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-500">
                TẦM NHÌN • ĐỘT PHÁ • BỀN VỮNG
              </span>
            </div>
          </Link>

          <nav className={`hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider ${
            themeMode === "dark" ? "text-stone-300" : "text-stone-700"
          }`}>
            <a href="#challenges" className="hover:text-emerald-500 transition-colors">Thách thức</a>
            <a href="#solutions" className="hover:text-emerald-500 transition-colors">Giải pháp</a>
            <a href="#ecosystem" className="hover:text-emerald-500 transition-colors">Hệ sinh thái</a>
            <a href="#partners" className="hover:text-emerald-500 transition-colors">Đối tác</a>
            <span className={`text-[11px] px-2 py-0.5 rounded border ${
              themeMode === "dark" ? "bg-stone-800 border-stone-700 text-stone-300" : "bg-stone-100 border-stone-200 text-stone-600"
            }`}>
              VI / EN
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                themeMode === "dark"
                  ? "bg-stone-900 border-stone-700 text-amber-300 hover:bg-stone-800"
                  : "bg-white border-stone-300 text-emerald-700 hover:bg-emerald-50"
              }`}
              title={themeMode === "dark" ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
            >
              {themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/connect-app"
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                themeMode === "dark"
                  ? "text-stone-200 bg-stone-900/80 hover:bg-stone-800 border-stone-700"
                  : "text-stone-800 bg-white hover:bg-stone-50 border-stone-300 shadow-sm"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đăng nhập</span>
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white shadow-lg shadow-emerald-700/25 hover:scale-105 transition-all cursor-pointer border border-emerald-400"
            >
              Tư vấn chuyên sâu →
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 2: HERO BANNER (Màn hình chính đầu trang)
          ========================================================================= */}
      <section
        id="hero"
        className={`relative pt-32 pb-20 md:pt-40 md:pb-28 border-b transition-colors duration-500 overflow-hidden ${
          themeMode === "dark"
            ? "bg-[#0B0F0B] border-stone-800 text-stone-100"
            : "bg-[#FAF9F6] border-stone-200 text-[#1C1917]"
        }`}
      >
        <ZenSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v2Hero" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-7 text-left">
            {/* Kinetic Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
              className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-sm ${
                themeMode === "dark"
                  ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
            >
              <Workflow className="w-4 h-4 text-emerald-500 anim-zen-pulse" />
              <span>NỀN TẢNG QUẢN TRỊ LIÊN MINH DOANH NGHIỆP TINH GỌN</span>
            </motion.div>

            {/* H1 Heading */}
            <h1 className={`text-4xl sm:text-6xl font-black leading-[1.12] tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              <KineticWords
                text="Kiến tạo tầm nhìn. Dẫn dắt tăng trưởng."
                highlightIndices={[4, 5]}
                highlightClass="text-emerald-500 font-serif italic"
              />
            </h1>

            {/* Streamlined Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-base sm:text-lg leading-relaxed max-w-2xl font-normal ${
                themeMode === "dark" ? "text-stone-300" : "text-stone-700"
              }`}
            >
              Hợp nhất dữ liệu đa kênh, kiểm soát phân quyền chặt chẽ và tự động hóa kết nối giao thương B2B trong một nền tảng trực quan, minh bạch.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 text-white font-black text-sm shadow-xl shadow-emerald-700/30 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-emerald-400"
              >
                <span>Yêu cầu Demo cấp cao</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/connect-app"
                className={`px-7 py-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  themeMode === "dark"
                    ? "border-stone-700 hover:border-emerald-500 bg-stone-900/80 text-stone-200"
                    : "border-stone-300 hover:border-emerald-600 bg-white text-stone-800"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                <span>Trải nghiệm hệ thống</span>
              </Link>
            </motion.div>

            {/* 3 Metrics with Animated Hover Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-500/20">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/70 border-stone-800" : "bg-white/90 border-stone-200 shadow-sm"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-500 anim-zen-pulse" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>10,000+</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>Lãnh đạo & Hội viên</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/70 border-stone-800" : "bg-white/90 border-stone-200 shadow-sm"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 anim-zen-float" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>ISO/SOC2</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>Bảo mật ngân hàng</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/70 border-stone-800" : "bg-white/90 border-stone-200 shadow-sm"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-emerald-500 anim-zen-beacon" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>Tự động hóa</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>Xử lý luồng tức thì</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PAIN POINTS (4 Điểm Nghẽn Tinh Gọn - Gọn Chữ, Rõ Ý)
          ========================================================================= */}
      <section
        id="challenges"
        className={`py-20 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#080C0A] border-stone-800 text-stone-100" : "bg-[#F5F4EF] border-stone-200 text-[#1C1917]"
        }`}
      >
        <ZenSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v2PainPoints" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-left mb-12 space-y-2.5 max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-red-950/60 border-red-800/60 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <TrendingDown className="w-3.5 h-3.5 anim-zen-beacon" />
              <span>4 ĐIỂM NGHẼN TRONG VẬN HÀNH TRUYỀN THỐNG</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              Rào cản kìm hãm đà mở rộng doanh nghiệp
            </h2>
            <p className={`text-sm ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
              Những lỗ hổng thường gặp làm suy giảm hiệu suất và phân mảnh dữ liệu của tổ chức.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-red-500/50 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-red-400 shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Database className="w-5 h-5 text-red-500 anim-zen-pulse" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-stone-800 text-red-400" : "bg-red-50 text-red-700"
                  }`}>
                    #01 PHÂN MẢNH
                  </span>
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Dữ liệu phân mảnh
                </h3>
                <ul className={`text-xs space-y-1.5 ${themeMode === "dark" ? "text-stone-300" : "text-stone-600"}`}>
                  <li>• Rải rác trên Zalo, Excel, Drive</li>
                  <li>• Mất 3-5 ngày tổng hợp báo cáo</li>
                </ul>
              </div>
              <div className={`pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-stone-800 text-red-400/80" : "border-stone-100 text-red-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Mất tính kịp thời</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-amber-500/50 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-amber-400 shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Unlink className="w-5 h-5 text-amber-500 anim-zen-float" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-stone-800 text-amber-400" : "bg-amber-50 text-amber-700"
                  }`}>
                    #02 ĐỨT GÃY
                  </span>
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Đứt gãy luồng deal
                </h3>
                <ul className={`text-xs space-y-1.5 ${themeMode === "dark" ? "text-stone-300" : "text-stone-600"}`}>
                  <li>• Kết nối thủ công, thiếu cảnh báo</li>
                  <li>• Bỏ lỡ 40% cơ hội chốt hợp đồng</li>
                </ul>
              </div>
              <div className={`pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-stone-800 text-amber-400/80" : "border-stone-100 text-amber-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Lãng phí cơ hội B2B</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-purple-500/50 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-purple-400 shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <LockKeyhole className="w-5 h-5 text-purple-500 anim-zen-beacon" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-stone-800 text-purple-400" : "bg-purple-50 text-purple-700"
                  }`}>
                    #03 BẢO MẬT
                  </span>
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Rủi ro phân quyền
                </h3>
                <ul className={`text-xs space-y-1.5 ${themeMode === "dark" ? "text-stone-300" : "text-stone-600"}`}>
                  <li>• Phân quyền lỏng lẻo khi nhân sự đổi</li>
                  <li>• Dễ rò rỉ tệp khách VIP & bảng giá</li>
                </ul>
              </div>
              <div className={`pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-stone-800 text-purple-400/80" : "border-stone-100 text-purple-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Mất tệp tài sản số</span>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-rose-500/50 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-rose-400 shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-rose-500 anim-zen-pulse" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-stone-800 text-rose-400" : "bg-rose-50 text-rose-700"
                  }`}>
                    #04 MÙ ROI
                  </span>
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Mất dấu vết ROI
                </h3>
                <ul className={`text-xs space-y-1.5 ${themeMode === "dark" ? "text-stone-300" : "text-stone-600"}`}>
                  <li>• Đánh giá hiệu quả theo cảm tính</li>
                  <li>• Thiếu báo cáo chuyển đổi thời gian thực</li>
                </ul>
              </div>
              <div className={`pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-stone-800 text-rose-400/80" : "border-stone-100 text-rose-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Đầu tư thiếu số liệu</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SOLUTIONS (6 Trụ Cột Tinh Gọn - Tự Động Hóa Mạnh Mẽ)
          ========================================================================= */}
      <section
        id="solutions"
        className={`py-20 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#0B0F0B] border-stone-800 text-stone-100" : "bg-[#FAF9F6] border-stone-200 text-[#1C1917]"
        }`}
      >
        <ZenSectionSceneryCut themeMode={themeMode} side="left" ratio="1/2" id="v2Solutions" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14 space-y-3 max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-800"
            }`}>
              <Sparkles className="w-3.5 h-3.5 anim-zen-pulse text-emerald-500" />
              <span>GIẢI PHÁP ĐỘT PHÁ TỪ BUSINESS CONNECT</span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              Làm chủ dữ liệu. Tối ưu vận hành.
            </h2>
            <p className={`text-sm max-w-2xl mx-auto ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
              Kiến trúc 6 phân hệ chuyên sâu loại bỏ hoàn toàn sự rời rạc, hỗ trợ ra quyết định tốc độ cao.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-emerald-500 anim-zen-pulse" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Dữ liệu đối tác 360°
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Hợp nhất danh bạ, hồ sơ năng lực và nhu cầu giao thương của toàn bộ hội viên trên một màn hình trực quan.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Chuẩn hóa đa kênh 100%
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-emerald-500 anim-zen-float" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Bảng điều khiển KPI Live
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Cập nhật tức thời doanh thu, số thương vụ chốt và tỷ lệ tương tác của thành viên theo thời gian thực.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Real-time KPI Dashboard
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-emerald-500 anim-zen-beacon" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Bảo mật & Phân quyền RBAC
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Mã hóa dữ liệu nhạy cảm theo tiêu chuẩn ngân hàng, phân quyền chi tiết theo cấp bậc và chi hội.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Chuẩn ISO/SOC2 & RBAC
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-emerald-500 anim-zen-spin" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Tự động hóa luồng việc
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Tự động gửi thông báo biểu quyết có lựa chọn, nhắc nợ hội phí quá hạn và phân luồng xử lý không độ trễ.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Giảm 70% thao tác thủ công
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-emerald-500 anim-zen-pulse" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Dự báo tăng trưởng B2B
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Phân tích dữ liệu lớn để nắm bắt nhu cầu cung ứng, xu hướng hợp tác và chu kỳ gia hạn hội viên.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Dự báo chuẩn xác bằng AI
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-6 border transition-all space-y-3.5 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/80 backdrop-blur-md border-stone-800 hover:border-emerald-500/60 shadow-lg"
                  : "bg-white/95 backdrop-blur-md border-stone-200 hover:border-emerald-500 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-500 anim-zen-float" />
                </div>
                <h3 className={`text-lg font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                  Trợ lý AI ghép nối cung cầu
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
                  Tự động đề xuất đối tác phù hợp nhất theo ngành nghề, địa bàn và quy mô, tối ưu tỷ lệ thành công.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Ghép cặp thông minh 98%
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INTEGRATION (Hệ Sinh Thái Mở - Tinh Gọn)
          ========================================================================= */}
      <section
        id="ecosystem"
        className={`py-20 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#080C0A] border-stone-800 text-stone-100" : "bg-[#F5F4EF] border-stone-200 text-[#1C1917]"
        }`}
      >
        <ZenSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v2Integration" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-800"
            }`}>
              <Layers className="w-3.5 h-3.5 anim-zen-float text-emerald-500" />
              <span>KIẾN TRÚC MỞ • KẾT NỐI VÔ HẠN</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              Tích hợp sẵn sàng với hạ tầng doanh nghiệp
            </h2>
            <p className={`text-sm max-w-2xl mx-auto ${themeMode === "dark" ? "text-stone-400" : "text-stone-600"}`}>
              Kết nối 2 chiều liền mạch với các hệ thống ERP, Kế toán - Tài chính và Nhân sự mà không làm xáo trộn quy trình đang chạy.
            </p>

            {/* Visual Integration Hub with Interactive Cards */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/80 border-stone-800" : "bg-white/95 border-stone-200 shadow-sm"
                }`}
              >
                <Landmark className="w-7 h-7 mx-auto text-emerald-500 anim-zen-pulse" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>ERP Doanh Nghiệp</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-stone-400" : "text-stone-500"}`}>SAP • Oracle • Odoo</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/80 border-stone-800" : "bg-white/95 border-stone-200 shadow-sm"
                }`}
              >
                <Building2 className="w-7 h-7 mx-auto text-emerald-500 anim-zen-float" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>Tài Chính - Kế Toán</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-stone-400" : "text-stone-500"}`}>MISA • FAST • Bravo</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/80 border-stone-800" : "bg-white/95 border-stone-200 shadow-sm"
                }`}
              >
                <Users className="w-7 h-7 mx-auto text-emerald-500 anim-zen-beacon" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>Quản Trị Nhân Sự</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-stone-400" : "text-stone-500"}`}>HRM & Bảng Lương</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                  themeMode === "dark" ? "bg-stone-900/80 border-stone-800" : "bg-white/95 border-stone-200 shadow-sm"
                }`}
              >
                <Zap className="w-7 h-7 mx-auto text-emerald-500 anim-zen-pulse" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>Open RESTful API</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-stone-400" : "text-stone-500"}`}>Webhook & Token</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: TESTIMONIALS (Lời Chứng Thực Lãnh Đạo)
          ========================================================================= */}
      <section
        id="testimonials"
        className={`py-20 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#0B0F0B] border-stone-800 text-stone-100" : "bg-[#FAF9F6] border-stone-200 text-[#1C1917]"
        }`}
      >
        <ZenSectionSceneryCut themeMode={themeMode} side="left" ratio="1/2" id="v2Testimonials" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 space-y-2.5 max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-800"
            }`}>
              <Award className="w-3.5 h-3.5 text-emerald-500 anim-zen-pulse" />
              <span>SỰ LỰA CHỌN CỦA CÁC TỔ CHỨC TIÊN PHONG</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              Được tin cậy bởi các Lãnh đạo Hiệp hội & Doanh nghiệp
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/85 backdrop-blur-md border-stone-800 shadow-xl"
                  : "bg-white/95 backdrop-blur-md border-stone-200 shadow-sm"
              }`}
            >
              <blockquote className={`text-sm sm:text-base italic leading-relaxed font-serif ${
                themeMode === "dark" ? "text-stone-200" : "text-stone-800"
              }`}>
                "Business Connect giúp chúng tôi chuẩn hóa toàn bộ luồng hội viên, phân quyền nhiều cấp và tự động hóa biểu quyết nhanh gấp 5 lần so với trước đây."
              </blockquote>
              <div className="flex items-center gap-3.5 pt-3 border-t border-stone-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-emerald-500 anim-zen-pulse" />
                </div>
                <div>
                  <h4 className={`text-sm font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                    Đại diện Ban Công Nghệ
                  </h4>
                  <p className="text-xs text-emerald-500 font-bold">Tập đoàn Đầu tư & Thương mại Đa ngành</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
                themeMode === "dark"
                  ? "bg-stone-900/85 backdrop-blur-md border-stone-800 shadow-xl"
                  : "bg-white/95 backdrop-blur-md border-stone-200 shadow-sm"
              }`}
            >
              <blockquote className={`text-sm sm:text-base italic leading-relaxed font-serif ${
                themeMode === "dark" ? "text-stone-200" : "text-stone-800"
              }`}>
                "Báo cáo KPI thời gian thực cho Ban Giám đốc cái nhìn chuẩn xác để điều hướng chiến lược. Tỷ lệ tương tác và thu phí hội viên cải thiện rõ rệt."
              </blockquote>
              <div className="flex items-center gap-3.5 pt-3 border-t border-stone-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-emerald-500 anim-zen-float" />
                </div>
                <div>
                  <h4 className={`text-sm font-black ${themeMode === "dark" ? "text-white" : "text-stone-900"}`}>
                    Chủ Tịch Chi Hội
                  </h4>
                  <p className="text-xs text-emerald-500 font-bold">Liên minh Sản xuất & Xuất khẩu B2B</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners">
        <BusinessConnectPartnersSection themeMode={themeMode} />
      </section>

      {/* =========================================================================
          SECTION 7: FOOTER CTA (Kêu gọi hành động cuối trang)
          ========================================================================= */}
      <footer id="about" className={`py-16 border-t transition-colors duration-500 text-center ${
        themeMode === "dark" ? "bg-[#060A06] border-stone-800 text-stone-300" : "bg-[#F3F2EC] border-stone-200 text-stone-700"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3.5 max-w-2xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-stone-900"
            }`}>
              Sẵn sàng số hóa quản trị liên minh?
            </h2>
            <p className={`text-sm ${themeMode === "dark" ? "text-stone-300" : "text-stone-600"}`}>
              Đồng hành cùng Business Connect để tối ưu hóa nguồn lực và khai phá mạng lưới B2B bền vững ngay hôm nay.
            </p>
            <div className="pt-3 flex justify-center">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-700/30 hover:scale-105 transition-all cursor-pointer border border-emerald-400 flex items-center gap-2"
              >
                <span>Tư vấn chiến lược với chuyên gia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slogan Ticker */}
          <div className={`py-3 px-6 rounded-xl border text-xs font-mono font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-5 ${
            themeMode === "dark"
              ? "bg-stone-900/60 border-stone-800 text-emerald-400"
              : "bg-white/80 border-stone-300 text-emerald-800 shadow-sm"
          }`}>
            <span>TẦM NHÌN TƯƠNG LAI</span>
            <span>•</span>
            <span>DỮ LIỆU ĐỘT PHÁ</span>
            <span>•</span>
            <span>QUẢN TRỊ BỀN VỮNG</span>
          </div>

          <div className="pt-6 border-t border-stone-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
            <p>© 2026 Business Connect V2. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0 font-bold">
              <Link to="/business-connect/v1" className="hover:text-emerald-500">V1 Classic</Link>
              <Link to="/business-connect/v2" className="text-emerald-500 font-extrabold underline">V2 Zen</Link>
              <Link to="/business-connect/v3" className="hover:text-emerald-500">V3 Bento</Link>
              <Link to="/business-connect/v4" className="hover:text-emerald-500">V4 Cyber</Link>
              <Link to="/business-connect/v5" className="hover:text-emerald-500">V5 Sovereign</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md rounded-2xl border p-7 shadow-2xl ${
            themeMode === "dark" ? "bg-stone-900 border-stone-700 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black mb-1">Đặt Lịch Tư Vấn Chuyên Sâu V2</h3>
            <p className="text-xs text-stone-400 mb-5">
              Để lại thông tin, chuyên gia Business Connect sẽ chuẩn bị phương án demo kiến trúc phù hợp với quy mô doanh nghiệp bạn.
            </p>
            <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none ${
                    themeMode === "dark" ? "bg-stone-950 border-stone-700 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                  placeholder="VD: 0912345678"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none ${
                    themeMode === "dark" ? "bg-stone-950 border-stone-700 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tên Doanh nghiệp / Tập đoàn</label>
                <input
                  type="text"
                  value={demoForm.org}
                  onChange={(e) => setDemoForm({ ...demoForm, org: e.target.value })}
                  placeholder="VD: TẬP ĐOÀN VIONE B2B"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none ${
                    themeMode === "dark" ? "bg-stone-950 border-stone-700 text-white" : "bg-stone-50 border-stone-300 text-stone-900"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all mt-4 cursor-pointer shadow-lg shadow-emerald-700/20"
              >
                Xác Nhận Đặt Lịch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
