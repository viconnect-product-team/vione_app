import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Clock,
  Landmark,
  Sun,
  Moon,
  Database,
  LineChart,
  LayoutDashboard,
  Cpu,
  Award,
  Crown,
  TrendingDown,
  X,
  Check,
  Activity,
  Gauge,
  GitPullRequest,
  EyeOff,
  Flame,
  Rocket,
  Bot,
  UserCheck,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { BusinessConnectPartnersSection } from "./BusinessConnectPartnersSection";
import { useAutoHideHeader } from "./useAutoHideHeader";
import { toast } from "sonner";

/** Themed Cyberpunk / Command HUD Scenery Cut Component (45° Chamfered Angular Cuts) */
function CyberSectionSceneryCut({
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
  const imgSrc = themeMode === "dark" ? "/landing/cyberpunk_dark_bg.jpg" : "/landing/cyberpunk_light_bg.jpg";
  const clipId = `cyberClip_${id}`;
  const gradId = `cyberGrad_${id}`;

  const clipPathD =
    side === "right"
      ? ratio === "2/3"
        ? "M 0.35,0 L 0.50,0.25 L 0.38,0.55 L 0.48,0.75 L 0.28,1.0 L 1,1 L 1,0 Z"
        : "M 0.50,0 L 0.62,0.25 L 0.52,0.55 L 0.60,0.75 L 0.42,1.0 L 1,1 L 1,0 Z"
      : ratio === "2/3"
      ? "M 0,0 L 0.65,0 L 0.50,0.25 L 0.62,0.55 L 0.52,0.75 L 0.72,1.0 L 0,1 Z"
      : "M 0,0 L 0.50,0 L 0.38,0.25 L 0.48,0.55 L 0.40,0.75 L 0.58,1.0 L 0,1 Z";

  const boundaryLineD =
    side === "right"
      ? ratio === "2/3"
        ? "M 504,0 L 720,250 L 547,550 L 691,750 L 403,1000"
        : "M 720,0 L 892,250 L 748,550 L 864,750 L 604,1000"
      : ratio === "2/3"
      ? "M 936,0 L 720,250 L 892,550 L 748,750 L 1036,1000"
      : "M 720,0 L 547,250 L 691,550 L 576,750 L 835,1000";

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
          alt="Cyberpunk Command Atmosphere"
          className={`w-full h-full object-cover ${
            side === "right" ? "object-right-top" : "object-left-top"
          } transition-all duration-700 ${
            themeMode === "dark"
              ? "opacity-75 filter brightness-100 contrast-120 saturate-110"
              : "opacity-55 filter brightness-105 contrast-105"
          }`}
        />
        {/* Soft edge fade into pure background */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            side === "right"
              ? themeMode === "dark"
                ? "bg-gradient-to-l from-transparent via-[#040810]/40 to-[#040810]/95"
                : "bg-gradient-to-l from-transparent via-[#F8FAFC]/40 to-[#F8FAFC]/95"
              : themeMode === "dark"
                ? "bg-gradient-to-r from-transparent via-[#040810]/40 to-[#040810]/95"
                : "bg-gradient-to-r from-transparent via-[#F8FAFC]/40 to-[#F8FAFC]/95"
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            themeMode === "dark"
              ? "bg-gradient-to-b from-[#040810]/50 via-transparent to-[#040810]/75"
              : "bg-gradient-to-b from-[#F8FAFC]/50 via-transparent to-[#F8FAFC]/75"
          }`}
        />
      </div>

      {/* Laser Cyan / Emerald Neon 45° Chamfered Boundary Line */}
      <svg
        viewBox="0 0 1440 1000"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d={boundaryLineD}
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          className="opacity-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
        />
        <path
          d={boundaryLineD}
          stroke={themeMode === "dark" ? "#67E8F9" : "#0891B2"}
          strokeWidth="1"
          strokeDasharray="6 6"
          className="opacity-50"
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeMode === "dark" ? "#A7F3D0" : "#10B981"} stopOpacity="0.3" />
            <stop offset="35%" stopColor={themeMode === "dark" ? "#06B6D4" : "#0891B2"} stopOpacity="0.95" />
            <stop offset="75%" stopColor={themeMode === "dark" ? "#10B981" : "#059669"} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function BusinessConnectLandingV4() {
  // Support Dark / Light Theme (defaulting to Dark Cyberpunk HUD)
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
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
    toast.success("Đăng ký thành công! Đội ngũ kỹ sư Business Connect sẽ hỗ trợ lên lịch Demo Bứt phá trong 24h.");
    setDemoModalOpen(false);
    setDemoForm({ name: "", phone: "", email: "", org: "", note: "" });
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 ${
        themeMode === "dark" ? "bg-[#030712] text-slate-100" : "bg-[#F8FAFC] text-[#020617]"
      }`}
      style={{
        fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Cyberpunk HUD Grid Overlay */}
      {themeMode === "dark" && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#06b6d412_1px,transparent_1px),linear-gradient(to_bottom,#06b6d412_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,#000_70%,transparent_100%)]" />
      )}

      {/* Cyber Keyframe Animations */}
      <style>{`
        @keyframes cyberPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(6,182,212,0.4)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(6,182,212,0.8)); }
        }
        @keyframes cyberFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes cyberScan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cyberPing {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.3); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.9; }
        }
        .anim-cyber-pulse { animation: cyberPulse 3s ease-in-out infinite; }
        .anim-cyber-float { animation: cyberFloat 4s ease-in-out infinite; }
        .anim-cyber-scan { animation: cyberScan 12s linear infinite; }
        .anim-cyber-ping { animation: cyberPing 2s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>

      {/* =========================================================================
          SECTION 1: HEADER (Tự ẩn sau 3s, di chuột hoặc scroll thì hiện lại)
          BUSINESS CONNECT | Nhạy bén - Bứt tốc - Dẫn đầu (Theme Sáng / Tối Linh Hoạt)
          ========================================================================= */}
      <header
        style={headerStyle}
        onMouseEnter={resetTimer}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${
          themeMode === "dark"
            ? "bg-[#030712]/90 border-cyan-950/80 shadow-[0_2px_25px_rgba(6,182,212,0.15)]"
            : "bg-[#F8FAFC]/95 border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.04)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/business-connect/v4" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black shadow-lg transition-transform group-hover:scale-105 border ${
              themeMode === "dark"
                ? "bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-cyan-500/30"
                : "bg-cyan-100 border-cyan-300 text-cyan-800 shadow-cyan-500/10"
            }`}>
              <Activity className="w-5 h-5 anim-cyber-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black tracking-tight block leading-tight ${
                  themeMode === "dark" ? "text-white" : "text-slate-950"
                }`}>
                  BUSINESS <span className="text-cyan-500">CONNECT</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  themeMode === "dark"
                    ? "bg-cyan-950/80 text-cyan-300 border-cyan-700/60"
                    : "bg-cyan-100 text-cyan-800 border-cyan-300"
                }`}>
                  V4 CYBER HUD
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-cyan-500">
                NHẠY BÉN • BỨT TỐC • DẪN ĐẦU
              </span>
            </div>
          </Link>

          <nav className={`hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider ${
            themeMode === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            <a href="#solutions" className="hover:text-cyan-400 transition-colors">Giải pháp</a>
            <a href="#ecosystem" className="hover:text-cyan-400 transition-colors">Hệ sinh thái Mở</a>
            <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Khách hàng Tiên phong</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">Về chúng tôi</a>
            <span className={`text-[11px] px-2 py-0.5 rounded border ${
              themeMode === "dark"
                ? "bg-cyan-950/60 border-cyan-800 text-cyan-400"
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-700"
            }`}>
              VI / EN
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button (Sáng / Tối) */}
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                themeMode === "dark"
                  ? "bg-slate-900 border-cyan-500/50 text-cyan-300 hover:bg-slate-800 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100 shadow-sm"
              }`}
              title="Chuyển đổi theme Sáng / Tối"
            >
              {themeMode === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">THEME TỐI</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-700" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">THEME SÁNG</span>
                </>
              )}
            </button>

            <Link
              to="/connect-app"
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                themeMode === "dark"
                  ? "text-slate-200 bg-slate-900/80 hover:bg-slate-800 border-slate-700"
                  : "text-slate-800 bg-white hover:bg-slate-50 border-slate-300 shadow-sm"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-500" />
              <span>Đăng nhập</span>
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer border border-cyan-300"
            >
              Lên lịch Demo Bứt phá →
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 2: HERO BANNER (Màn hình chính đầu trang)
          ========================================================================= */}
      <section
        id="hero"
        className={`relative pt-32 pb-24 md:pt-40 md:pb-32 border-b transition-colors duration-500 overflow-hidden ${
          themeMode === "dark"
            ? "bg-[#040810] border-slate-800 text-slate-100"
            : "bg-[#F8FAFC] border-slate-200 text-[#020617]"
        }`}
      >
        <CyberSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v4Hero" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-8 text-left">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-sm ${
              themeMode === "dark"
                ? "bg-cyan-950/70 border-cyan-700/50 text-cyan-300"
                : "bg-cyan-50 border-cyan-300 text-cyan-800"
            }`}>
              <Gauge className="w-4 h-4 text-cyan-500 anim-cyber-pulse" />
              <span>NỀN TẢNG QUẢN TRỊ QUAN HỆ KHÁCH HÀNG TỐC ĐỘ CAO</span>
            </div>

            {/* H1 Heading */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.12] tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Nắm bắt thời cơ. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 font-mono">
                Bứt phá giới hạn.
              </span>
            </h1>

            {/* Description */}
            <p className={`text-base sm:text-lg leading-relaxed max-w-2xl font-normal ${
              themeMode === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              Business Connect mang đến bộ máy vận hành linh hoạt, giúp Ban Giám đốc xóa bỏ mọi độ trễ trong luồng dữ liệu, phản ứng tức thời với thị trường và đẩy nhanh tốc độ triển khai chiến lược kinh doanh.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-cyan-300"
              >
                <span>Yêu cầu Demo cấp cao</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/connect-app"
                className={`px-7 py-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  themeMode === "dark"
                    ? "border-slate-800 hover:border-cyan-500 bg-slate-900/80 text-slate-200"
                    : "border-slate-300 hover:border-cyan-600 bg-white text-slate-900"
                }`}
              >
                <Cpu className="w-4 h-4 text-cyan-500" />
                <span>Khám phá Tốc độ hệ thống</span>
              </Link>
            </div>

            {/* 3 Metrics with Animated Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-cyan-500/20">
              <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                themeMode === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/90 border-slate-200 shadow-sm"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-cyan-400 anim-cyber-pulse" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>10,000+</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>Nhà lãnh đạo cấp tiến</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                themeMode === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/90 border-slate-200 shadow-sm"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Cpu className="w-6 h-6 text-cyan-400 anim-cyber-scan" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>&lt; 50ms</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>Truy vấn siêu hiệu suất</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                themeMode === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/90 border-slate-200 shadow-sm"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-cyan-400 anim-cyber-ping" />
                </div>
                <div>
                  <p className={`text-xl font-black font-mono ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>Hàng triệu</p>
                  <p className={`text-xs ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>Cơ hội kết nối tức thì</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PAIN POINTS (Nêu vấn đề/Thách thức)
          ========================================================================= */}
      <section
        id="challenges"
        className={`py-24 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#02050A] border-slate-800 text-slate-100" : "bg-[#F1F5F9] border-slate-200 text-[#020617]"
        }`}
      >
        <CyberSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v4PainPoints" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-left mb-14 space-y-3 max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-red-950/60 border-red-800/60 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <TrendingDown className="w-3.5 h-3.5 anim-cyber-ping" />
              <span>NHỮNG THÁCH THỨC TRONG QUẢN TRỊ VẬN HÀNH DOANH NGHIỆP QUY MÔ LỚN</span>
            </div>
            {/* GUARANTEED HIGH CONTRAST HEADING */}
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Nút thắt cổ chai nào đang làm chậm nhịp độ mở rộng?
            </h2>
            <p className={`text-base font-normal ${themeMode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Nhận diện 4 điểm nghẽn nghiêm trọng làm tê liệt tốc độ phản hồi và đánh mất lợi thế dẫn đầu thị trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className={`rounded-2xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-red-500/50 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-red-400 shadow-md"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-red-400 anim-cyber-pulse" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-slate-800 text-red-400" : "bg-red-50 text-red-700"
                  }`}>
                    NÚT THẮT #01
                  </span>
                </div>
                <h3 className={`text-lg font-black leading-snug ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Phản ứng dữ liệu chậm chạp
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Việc tra cứu thông tin phân tán khiến đội ngũ mất đi sự nhạy bén, để vuột mất những tệp khách hàng tiềm năng vào tay đối thủ.
                </p>
              </div>
              <div className={`pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-slate-800 text-red-400/80" : "border-slate-100 text-red-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Mất khách vào đối thủ</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className={`rounded-2xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-amber-500/50 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-amber-400 shadow-md"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-400 anim-cyber-float" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-slate-800 text-amber-400" : "bg-amber-50 text-amber-700"
                  }`}>
                    NÚT THẮT #02
                  </span>
                </div>
                <h3 className={`text-lg font-black leading-snug ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Chuỗi quy trình trì trệ
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Các điểm chạm khách hàng bị gián đoạn do sự phối hợp thủ công, làm kéo dài chu kỳ bán hàng một cách không cần thiết.
                </p>
              </div>
              <div className={`pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-slate-800 text-amber-400/80" : "border-slate-100 text-amber-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Kéo dài chu kỳ chốt</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className={`rounded-2xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-purple-500/50 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-purple-400 shadow-md"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <GitPullRequest className="w-6 h-6 text-purple-400 anim-cyber-pulse" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-slate-800 text-purple-400" : "bg-purple-50 text-purple-700"
                  }`}>
                    NÚT THẮT #03
                  </span>
                </div>
                <h3 className={`text-lg font-black leading-snug ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Mở rộng quy mô vướng mắc
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Khi nhân sự tăng lên, việc thiếu một cơ chế quản trị và phân quyền chuẩn xác làm hệ thống vận hành trở nên ì ạch và rối ren.
                </p>
              </div>
              <div className={`pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-slate-800 text-purple-400/80" : "border-slate-100 text-purple-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Vận hành ì ạch</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className={`rounded-2xl p-6 border transition-all space-y-5 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/50 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-400 shadow-md"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-cyan-400 anim-cyber-ping" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === "dark" ? "bg-slate-800 text-cyan-400" : "bg-cyan-50 text-cyan-700"
                  }`}>
                    NÚT THẮT #04
                  </span>
                </div>
                <h3 className={`text-lg font-black leading-snug ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Điểm mù điều hành tức thời
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Sự thiếu vắng của các chỉ số thời gian thực khiến Lãnh đạo không thể can thiệp kịp thời vào các chiến dịch đang chạy chệch hướng.
                </p>
              </div>
              <div className={`pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                themeMode === "dark" ? "border-slate-800 text-cyan-400/80" : "border-slate-100 text-cyan-700"
              }`}>
                <span>HẬU QUẢ:</span>
                <span className="font-bold">Can thiệp trễ hạn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURES & SOLUTIONS (Tính năng & Giải pháp)
          ========================================================================= */}
      <section
        id="solutions"
        className={`py-24 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#040810] border-slate-800 text-slate-100" : "bg-[#F8FAFC] border-slate-200 text-[#020617]"
        }`}
      >
        <CyberSectionSceneryCut themeMode={themeMode} side="left" ratio="1/2" id="v4Solutions" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-cyan-950/70 border-cyan-700/50 text-cyan-300"
                : "bg-cyan-50 border-cyan-300 text-cyan-800"
            }`}>
              <Sparkles className="w-3.5 h-3.5 anim-cyber-pulse text-cyan-400" />
              <span>LỢI THẾ CẠNH TRANH TỪ BUSINESS CONNECT</span>
            </div>
            {/* GUARANTEED HIGH CONTRAST HEADING */}
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Giải phóng tốc độ. Dẫn dắt thị trường.
            </h2>
            <p className={`text-base font-normal ${themeMode === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Một giải pháp SaaS kiến trúc mở, được tinh chỉnh để mang lại hiệu suất truy xuất tối đa, giúp doanh nghiệp luôn đi trước một bước.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-cyan-400 anim-cyber-pulse" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Hồ sơ Khách hàng Tức thời
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Hợp nhất dữ liệu đa kênh ngay lập tức, cung cấp bức tranh toàn cảnh không độ trễ để ra quyết định ngay tại điểm chạm.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> 0ms Latency Profile
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400 anim-cyber-scan" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Trung tâm Điều hành Live
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Hệ thống chỉ số trực quan cập nhật theo từng giây, giúp Ban Giám đốc bám sát nhịp đập kinh doanh của toàn hệ thống.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Live Second-by-Second Telemetry
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 anim-cyber-ping" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Phân quyền Cấu trúc Động
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Quản lý quyền truy cập linh hoạt nhưng chặt chẽ, cho phép triển khai nhân sự mới và mở rộng quy mô một cách thần tốc, an toàn.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Dynamic Scale & Safety
              </div>
            </div>

            {/* Feature 4 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-cyan-400 anim-cyber-float" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Luồng Công việc Agile
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Tự động hóa các khâu phối hợp liên phòng ban, xóa bỏ thời gian chờ đợi và tăng tốc độ phản hồi khách hàng lên mức tối đa.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Zero-Delay Cross-Department Flow
              </div>
            </div>

            {/* Feature 5 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-cyan-400 anim-cyber-pulse" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Đường ống Bán hàng Tốc độ cao
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Theo dõi sát sao tiến độ chốt deal với khả năng xử lý lượng dữ liệu khổng lồ mượt mà, giúp dự báo và thúc đẩy doanh thu nhanh chóng.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> High-Throughput Sales Funnel
              </div>
            </div>

            {/* Feature 6 */}
            <div className={`rounded-2xl p-7 border transition-all space-y-4 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/80 backdrop-blur-md border-slate-800 hover:border-cyan-500/60 shadow-lg"
                : "bg-white/95 backdrop-blur-md border-slate-200 hover:border-cyan-500 shadow-md"
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-400 anim-cyber-pulse" />
                </div>
                <h3 className={`text-xl font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                  Trợ lý AI Đi trước Đón đầu
                </h3>
                <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Khai thác sức mạnh máy học để nhận diện sớm các xu hướng và rủi ro, hỗ trợ Lãnh đạo chủ động tung đòn bẩy chiến lược.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-bold">
                <Check className="w-3.5 h-3.5" /> Predictive Machine Learning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INTEGRATION (Khả năng Tích hợp hệ thống)
          ========================================================================= */}
      <section
        id="ecosystem"
        className={`py-24 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#02050A] border-slate-800 text-slate-100" : "bg-[#F1F5F9] border-slate-200 text-[#020617]"
        }`}
      >
        <CyberSectionSceneryCut themeMode={themeMode} side="right" ratio="2/3" id="v4Integration" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-cyan-950/70 border-cyan-700/50 text-cyan-300"
                : "bg-cyan-50 border-cyan-300 text-cyan-800"
            }`}>
              <Radio className="w-3.5 h-3.5 anim-cyber-ping text-cyan-400" />
              <span>KIẾN TRÚC MỞ - SẴN SÀNG MỞ RỘNG CÙNG DOANH NGHIỆP</span>
            </div>
            {/* GUARANTEED HIGH CONTRAST HEADING */}
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Tăng tốc độ tích hợp, loại bỏ gián đoạn
            </h2>
            <p className={`text-base sm:text-lg leading-relaxed font-normal ${
              themeMode === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              Sở hữu hệ thống API hiện đại, Business Connect cho phép cắm-và-chạy (plug-and-play) với mọi nền tảng quản trị lõi của doanh nghiệp. Đảm bảo tính liên tục của hệ sinh thái số và rút ngắn thời gian triển khai (time-to-market).
            </p>

            {/* Visual Integration Nodes */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                themeMode === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/95 border-slate-200 shadow-sm"
              }`}>
                <Landmark className="w-8 h-8 mx-auto text-cyan-400 anim-cyber-pulse" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>Hệ thống ERP</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Plug & Play Connector</p>
              </div>

              <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                themeMode === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/95 border-slate-200 shadow-sm"
              }`}>
                <Building2 className="w-8 h-8 mx-auto text-cyan-400 anim-cyber-float" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>Tài Chính & Kế Toán</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Auto Sync Giao Dịch</p>
              </div>

              <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                themeMode === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/95 border-slate-200 shadow-sm"
              }`}>
                <Users className="w-8 h-8 mx-auto text-cyan-400 anim-cyber-ping" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>Quản Trị Nhân Sự</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>HRM & KPI Stream</p>
              </div>

              <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                themeMode === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/95 border-slate-200 shadow-sm"
              }`}>
                <Zap className="w-8 h-8 mx-auto text-cyan-400 anim-cyber-scan" />
                <h4 className={`text-sm font-bold ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>High-Speed API</h4>
                <p className={`text-[11px] ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Webhook Event Mesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: TESTIMONIALS (Lời chứng thực & Khách hàng tiêu biểu)
          ========================================================================= */}
      <section
        id="testimonials"
        className={`py-24 border-b transition-colors duration-500 relative overflow-hidden ${
          themeMode === "dark" ? "bg-[#040810] border-slate-800 text-slate-100" : "bg-[#F8FAFC] border-slate-200 text-[#020617]"
        }`}
      >
        <CyberSectionSceneryCut themeMode={themeMode} side="left" ratio="1/2" id="v4Testimonials" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3 max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              themeMode === "dark"
                ? "bg-cyan-950/70 border-cyan-700/50 text-cyan-300"
                : "bg-cyan-50 border-cyan-300 text-cyan-800"
            }`}>
              <Award className="w-3.5 h-3.5 text-cyan-400 anim-cyber-pulse" />
              <span>SỰ LỰA CHỌN CỦA CÁC TỔ CHỨC TIÊN PHONG</span>
            </div>
            {/* GUARANTEED HIGH CONTRAST HEADING */}
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Chất xúc tác cho sự bứt phá
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className={`rounded-3xl p-8 sm:p-10 border transition-all space-y-6 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/85 backdrop-blur-md border-slate-800 shadow-xl"
                : "bg-white/95 backdrop-blur-md border-slate-200 shadow-md"
            }`}>
              <blockquote className={`text-base sm:text-lg italic leading-relaxed font-mono ${
                themeMode === "dark" ? "text-slate-200" : "text-slate-800"
              }`}>
                "Tốc độ xử lý dữ liệu và khả năng mở rộng kiến trúc của nền tảng này thật đáng kinh ngạc. Chúng tôi đã có thể đáp ứng khối lượng giao dịch tăng gấp ba lần mà hệ thống vẫn vận hành mượt mà."
              </blockquote>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-500/20">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Cpu className="w-6 h-6 text-cyan-400 anim-cyber-pulse" />
                </div>
                <div>
                  <h4 className={`text-base font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                    Giám đốc Công nghệ (CTO)
                  </h4>
                  <p className="text-xs text-cyan-500 font-mono font-bold">Fintech & High-Volume Platform</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className={`rounded-3xl p-8 sm:p-10 border transition-all space-y-6 flex flex-col justify-between ${
              themeMode === "dark"
                ? "bg-slate-900/85 backdrop-blur-md border-slate-800 shadow-xl"
                : "bg-white/95 backdrop-blur-md border-slate-200 shadow-md"
            }`}>
              <blockquote className={`text-base sm:text-lg italic leading-relaxed font-mono ${
                themeMode === "dark" ? "text-slate-200" : "text-slate-800"
              }`}>
                "Khả năng nhìn thấy các chỉ số kinh doanh real-time đã thay đổi hoàn toàn cách chúng tôi điều hành. Tốc độ ra quyết định nay chỉ tính bằng phút thay vì bằng tuần."
              </blockquote>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-500/20">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-cyan-400 anim-cyber-float" />
                </div>
                <div>
                  <h4 className={`text-base font-black ${themeMode === "dark" ? "text-white" : "text-slate-950"}`}>
                    Chủ tịch HĐQT
                  </h4>
                  <p className="text-xs text-cyan-500 font-mono font-bold">Tập đoàn Phân phối & Bán lẻ Công nghệ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners">
        <BusinessConnectPartnersSection />
      </section>

      {/* =========================================================================
          SECTION 7: FOOTER CTA (Kêu gọi hành động cuối trang)
          ========================================================================= */}
      <footer id="about" className={`py-20 border-t transition-colors duration-500 text-center ${
        themeMode === "dark" ? "bg-[#02050A] border-slate-800 text-slate-300" : "bg-[#F1F5F9] border-slate-200 text-slate-700"
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* GUARANTEED HIGH CONTRAST HEADING */}
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              themeMode === "dark" ? "text-white" : "text-slate-950"
            }`}>
              Sẵn sàng đưa tổ chức bứt tốc dẫn đầu?
            </h2>
            <p className={`text-base leading-relaxed ${themeMode === "dark" ? "text-slate-300" : "text-slate-600"}`}>
              Trang bị ngay cho doanh nghiệp của bạn một nền tảng quản trị tinh gọn, linh hoạt và không có độ trễ.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-9 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer border border-cyan-300 flex items-center gap-2"
              >
                <span>Khởi động tư vấn chiến lược</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slogan Ticker */}
          <div className={`py-4 px-6 rounded-2xl border text-xs font-mono font-bold tracking-widest uppercase flex flex-wrap items-center justify-center gap-6 ${
            themeMode === "dark"
              ? "bg-slate-900/60 border-slate-800 text-cyan-400"
              : "bg-white/80 border-slate-300 text-cyan-900 shadow-sm"
          }`}>
            <span>TỐC ĐỘ BỨT PHÁ</span>
            <span>•</span>
            <span>LINH HOẠT VẬN HÀNH</span>
            <span>•</span>
            <span>DẪN ĐẦU THỊ TRƯỜNG</span>
          </div>

          <div className="pt-8 border-t border-slate-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 Business Connect V4. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to="/business-connect/v1" className="hover:text-cyan-400">V1 Classic</Link>
              <Link to="/business-connect/v2" className="hover:text-cyan-400">V2 Zen</Link>
              <Link to="/business-connect/v3" className="hover:text-cyan-400">V3 Bento</Link>
              <Link to="/business-connect/v4" className="text-cyan-400 font-bold">V4 Cyber</Link>
              <Link to="/business-connect/v5" className="hover:text-cyan-400">V5 Sovereign</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className={`relative w-full max-w-md rounded-2xl border p-7 shadow-2xl ${
            themeMode === "dark" ? "bg-slate-900 border-cyan-800 text-white" : "bg-white border-slate-200 text-slate-950"
          }`}>
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black mb-1">Khởi Động Demo Bứt Phá V4</h3>
            <p className="text-xs text-slate-400 mb-5 font-sans">
              Điền thông tin để đội ngũ kỹ sư giải pháp thiết lập môi trường Sandbox tốc độ cao dành riêng cho tổ chức bạn.
            </p>
            <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-left font-sans">
              <div>
                <label className="block text-xs font-bold mb-1">Họ và tên Lãnh Đạo *</label>
                <input
                  type="text"
                  required
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none ${
                    themeMode === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
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
                    themeMode === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tên Tổ Chức / Tập Đoàn</label>
                <input
                  type="text"
                  value={demoForm.org}
                  onChange={(e) => setDemoForm({ ...demoForm, org: e.target.value })}
                  placeholder="VD: TẬP ĐOÀN CÔNG NGHỆ B2B"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none ${
                    themeMode === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all mt-4 cursor-pointer shadow-lg shadow-cyan-500/25"
              >
                Kích Hoạt Sandbox & Gửi Lịch Hẹn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
