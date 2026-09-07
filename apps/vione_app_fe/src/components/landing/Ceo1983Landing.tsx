import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LangSwitcher } from "@/components/LangSwitcher";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  Wallet,
  Zap,
  Crown,
  CheckCircle2,
  X,
  Brain,
  ShieldCheck,
  Calendar,
  Users,
  Compass,
  TrendingUp,
  Building2,
  Handshake,
  Target,
  Layers,
  Lock,
  Flame,
} from "lucide-react";

type ThemeMode = "dark" | "light" | "contrast";

export function Ceo1983Landing() {
  const navigate = useNavigate();
  // Default to Light mode according to user screenshot
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [modalOpen, setModalOpen] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    revenue: "10-50",
    industry: "Công nghệ / Sản xuất / TM-DV",
  });
  const [submitted, setSubmitted] = useState(false);

  const isDark = themeMode === "dark";
  const isContrast = themeMode === "contrast";

  // Helper function to switch classes based on current theme
  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (isContrast && contrastClass) return contrastClass;
    if (isDark || isContrast) return darkClass;
    return lightClass;
  };

  const handleJoinClick = () => {
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
      navigate({ to: "/m", search: { slug: "ceo1983" } });
    }, 1800);
  };

  // Real leaders of CLB CEO 1983 (Nhiệm kỳ 2025 - 2028)
  const leaders = [
    {
      name: "Lê Dung",
      role: "Chủ Tịch CLB CEO 1983",
      company: "Viện Trưởng Viện Doanh Trí / Tổng Giám Đốc DGroup",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Lê Hoàng Long",
      role: "Phó Chủ Tịch Chiến Lược & Công Nghệ",
      company: "Tổng Giám Đốc ViConnect / Founder Linh Vũ Media",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Trần Thị Mai Lan",
      role: "Phó Chủ Tịch Thường Trực",
      company: "Tổng Thư Ký CLB CEO 1983 / CEO LanDecor Group",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Phạm Đức Minh",
      role: "Phó Chủ Tịch Xúc Tiến Thương Mại",
      company: "Trưởng Ban B2B Deal-Flow / Chủ Tịch Minh Phát Holdings",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Vũ Thu Trang",
      role: "Trưởng Ban Truyền Thông & Sự Kiện",
      company: "Phụ Trách Đối Ngoại & Mastermind Tour",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div
      className={`transition-colors duration-500 relative overflow-x-hidden selection:bg-[#B18B44] selection:text-white ${
        themeClass("bg-[#131418] text-[#F8F7F3]", "bg-[#FAF9F5] text-[#191A1C]", "bg-black text-white")
      }`}
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* 1. GOOGLE FONTS INTER & CINZEL LUXURY TYPOGRAPHY */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');`}
      </style>

      {/* 2. BACKGROUND ART DECO GEOMETRIC CHEVRONS (Gọn gàng ở Hero, không làm vàng các section bên dưới) */}
      <div
        className="absolute top-0 right-0 w-[900px] max-w-full h-[700px] pointer-events-none z-0 transition-opacity duration-500 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)",
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full opacity-40 dark:opacity-30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#E8C986" : isContrast ? "#FFFFFF" : "#C5A25D"} />
              <stop offset="50%" stopColor={isDark ? "#C5A25D" : isContrast ? "#FFFFFF" : "#9A742F"} />
              <stop offset="100%" stopColor={isDark ? "#8A6624" : isContrast ? "#FFFFFF" : "#7A561B"} />
            </linearGradient>
          </defs>

          {/* Stepped Architectural Diamond Bands */}
          {[
            { size: 80, stroke: 1.5, op: 0.7 },
            { size: 140, stroke: 1, op: 0.45 },
            { size: 200, stroke: 2, op: 0.8 },
            { size: 260, stroke: 1, op: 0.4 },
            { size: 320, stroke: 2.5, op: 0.85 },
            { size: 380, stroke: 1, op: 0.45 },
            { size: 450, stroke: 3, op: 0.9 },
            { size: 520, stroke: 1, op: 0.4 },
            { size: 600, stroke: 2, op: 0.65 },
            { size: 680, stroke: 3.5, op: 0.9 },
            { size: 770, stroke: 1.2, op: 0.5 },
            { size: 870, stroke: 2, op: 0.65 },
          ].map((d, idx) => (
            <path
              key={idx}
              d={`M ${750 - d.size} 450 L 750 ${450 - d.size} L ${750 + d.size} 450 L 750 ${450 + d.size} Z`}
              stroke="url(#goldLineGrad)"
              strokeWidth={d.stroke}
              strokeOpacity={d.op * (isDark ? 0.5 : isContrast ? 0.6 : 0.45)}
            />
          ))}

          {/* Corner stepped lines */}
          {[220, 380, 560].map((step, idx) => (
            <g key={`corner-${idx}`} stroke="url(#goldLineGrad)" strokeWidth="1.2" strokeOpacity={isDark ? 0.35 : 0.25}>
              <path d={`M ${750 + step} 450 L ${750 + step + 30} ${450 - 30} L ${750 + step + 30} ${450 + 30} Z`} fill="none" />
              <path d={`M ${750 - step} 450 L ${750 - step - 30} ${450 - 30} L ${750 - step - 30} ${450 + 30} Z`} fill="none" />
            </g>
          ))}

          {/* Clean grid rays */}
          <g stroke="url(#goldLineGrad)" strokeWidth="1" strokeOpacity={isDark ? 0.2 : 0.15}>
            <line x1="750" y1="0" x2="750" y2="1000" />
            <line x1="0" y1="450" x2="1000" y2="450" />
          </g>
        </svg>
      </div>

      {/* --- NAVBAR --- */}
      <nav
        className={`relative z-50 flex items-center justify-between px-6 sm:px-10 py-4.5 border-b transition-colors duration-500 ${
          themeClass(
            "border-white/5 bg-[#18191D]/90 backdrop-blur-md",
            "border-black/5 bg-[#FDFCF7]/90 backdrop-blur-md",
            "border-white/20 bg-black/95 backdrop-blur-md"
          )
        }`}
      >
        {/* LOGO & CLB NAME — THIẾT KẾ LUXURY BESPOKE (KHÔNG CÓ HANOIBA AFFILIATE) */}
        <Link to="/landing/ceo1983" className="flex items-center gap-3.5 group">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center font-serif font-black text-2xl shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 ${
              themeClass(
                "border-[#C5A25D]/80 bg-[linear-gradient(145deg,#2A2722,#1A1815)] text-[#E8C986] shadow-[0_0_20px_rgba(232,201,134,0.25)]",
                "border-[#C5A25D] bg-[linear-gradient(145deg,#FFFFFF,#F7F2EA)] text-[#B18B44] shadow-[0_4px_12px_rgba(177,139,68,0.18)]",
                "border-white bg-zinc-900 text-white"
              )
            }`}
            style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
          >
            M
          </div>
          <div className="flex flex-col text-left justify-center">
            <span
              className={`text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase transition-colors ${
                themeClass("text-white/80 group-hover:text-white", "text-[#4A3F33] group-hover:text-[#111827]", "text-white/80")
              }`}
            >
              HIỆP HỘI DOANH NGHIỆP
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[15px] sm:text-[17px] font-black tracking-tight uppercase leading-none transition-colors ${
                  themeClass(
                    "text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF7] via-[#E8DEC8] to-[#C5A25D]",
                    "text-[#1C1917] group-hover:text-[#B18B44]",
                    "text-white"
                  )
                }`}
              >
                CLB CEO 1983
              </span>
              <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border border-[#B18B44]/50 text-[#B18B44] bg-[#B18B44]/10 tracking-widest">
                VIP
              </span>
            </div>
          </div>
        </Link>

        {/* NAV LINKS */}
        <div
          className={`hidden lg:flex items-center gap-7 text-sm font-semibold tracking-tight ${
            themeClass("text-white/85", "text-[#1F2937]/90", "text-slate-200")
          }`}
        >
          <a href="#about" className="hover:text-[#B18B44] transition-colors">
            Giới Thiệu
          </a>
          <a href="#core-values" className="hover:text-[#B18B44] transition-colors">
            Giá Trị Cốt Lõi
          </a>
          <a href="#ecosystem" className="hover:text-[#B18B44] transition-colors">
            Hệ Sinh Thái
          </a>
          <a href="#activities" className="hover:text-[#B18B44] transition-colors">
            Hoạt Động & Tour
          </a>
          <a href="#leadership" className="hover:text-[#B18B44] transition-colors">
            Ban Điều Hành
          </a>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LangSwitcher themeMode={themeMode} />

          {/* 3-Mode Theme Switcher Capsule */}
          <div
            className={`flex items-center rounded-full p-1 border transition-colors duration-500 ${
              themeClass("border-white/10 bg-[#232528]", "border-black/10 bg-[#EFEFEF]", "border-white/30 bg-zinc-900")
            }`}
          >
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                themeMode === "dark" ? "bg-[#3A3D42] text-white shadow" : "text-white/50 hover:text-white"
              }`}
            >
              🌙 Tối
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                themeMode === "light" ? "bg-white text-black shadow" : "text-black/50 hover:text-black"
              }`}
            >
              ☀️ Sáng
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("contrast")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                themeMode === "contrast"
                  ? "bg-white text-black font-extrabold shadow"
                  : themeClass("text-white/50 hover:text-white", "text-black/50 hover:text-black", "text-slate-300")
              }`}
            >
              🌓 Tương phản
            </button>
          </div>

          <button
            onClick={handleJoinClick}
            className="hidden sm:inline-flex px-6 py-2.5 rounded-full text-sm font-bold text-[#191A1C] bg-[linear-gradient(135deg,#F4D699_0%,#D0A95C_40%,#B18B44_80%,#9A742F_100%)] shadow-[0_4px_15px_rgba(177,139,68,0.3)] hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            GIA NHẬP CLB →
          </button>
        </div>
      </nav>

      {/* --- HERO CONTENT --- */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 pt-12 lg:pt-16 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        {/* CỘT TEXT (Bên trái) */}
        <div className="lg:w-[56%] text-left">
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-bold border mb-8 transition-colors duration-500 ${
              themeClass(
                "border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10",
                "border-[#C5A25D]/50 text-[#8B6B2B] bg-[#C5A25D]/10",
                "border-white/40 text-white bg-white/10"
              )
            }`}
          >
            👑 TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-[54px] xl:text-[64px] font-black tracking-tight leading-[1.08] mb-6 uppercase transition-all duration-500 ${
              themeClass(
                "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F3E9D5_20%,#D5C29D_45%,#988258_75%,#5A4626_100%)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]",
                "text-transparent bg-clip-text bg-[linear-gradient(180deg,#66523F_0%,#4B3B2B_35%,#2A1D13_75%,#120A05_100%)] drop-shadow-[0_2px_10px_rgba(60,40,15,0.15)]",
                "text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]"
              )
            }`}
          >
            <span className="block whitespace-normal sm:whitespace-nowrap">KẾT NỐI ĐỒNG NIÊN</span>
            <span className="block whitespace-normal sm:whitespace-nowrap">NÂNG TẦM DOANH</span>
            <span className="block">NGHIỆP</span>
          </h1>

          <p
            className={`text-base sm:text-lg mb-10 max-w-xl leading-relaxed font-medium transition-colors duration-500 ${
              themeClass("text-white/80", "text-[#2B231B]/85", "text-slate-300")
            }`}
          >
            Cộng đồng quy tụ những <strong>Doanh nhân, Nhà sáng lập & Lãnh đạo sinh năm 1983 (Quý Hợi)</strong> – thế hệ bản lĩnh, giàu kinh nghiệm, tiên phong đổi mới và đang ở giai đoạn bứt phá mạnh mẽ nhất trong sự nghiệp.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleJoinClick}
              className={`px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
                themeClass(
                  "bg-[#D3D3D3] text-[#191A1C] hover:bg-white shadow-black/30",
                  "bg-[#191A1C] text-white shadow-xl hover:bg-black",
                  "bg-white text-black font-extrabold shadow-lg"
                )
              }`}
            >
              ĐĂNG KÝ GIA NHẬP CLB →
            </button>
            <Link
              to="/m"
              search={{ slug: "ceo1983" }}
              className={`px-8 py-4 rounded-full font-bold text-sm border transition-colors inline-flex items-center gap-2 ${
                themeClass(
                  "border-white/20 text-white hover:bg-white/5",
                  "border-[#C5A25D]/40 bg-white/80 text-[#191A1C] hover:bg-white",
                  "border-white/40 text-white hover:bg-white/10"
                )
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#B18B44]" />
              <span>Mở Cổng Hội Viên App</span>
            </Link>
          </div>
        </div>

        {/* CỘT THẺ VIP 3D (Bên phải trên bệ Mica kính mờ) */}
        <div className="lg:w-[44%] flex flex-col items-center justify-center relative" style={{ perspective: "1200px" }}>
          <div className="relative w-[440px] max-w-full flex flex-col items-center">
            {/* Bệ đỡ Mica (Kính mờ) tầng dưới */}
            <div
              className={`absolute -bottom-10 w-[500px] max-w-[108%] h-[70px] rounded-2xl backdrop-blur-xl border ${
                themeClass(
                  "bg-white/5 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
                  "bg-black/5 border-black/10 shadow-[0_30px_60px_rgba(0,0,0,0.1)]",
                  "bg-zinc-900 border-white/20"
                )
              }`}
            />
            {/* Bệ đỡ Mica tầng trên */}
            <div
              className={`absolute -bottom-4 w-[460px] max-w-[100%] h-[40px] rounded-t-2xl backdrop-blur-2xl border-t border-x ${
                themeClass("bg-white/10 border-white/20", "bg-black/10 border-black/10", "bg-zinc-800 border-white/20")
              }`}
            />

            {/* Thẻ Vàng 3D */}
            <div
              className="relative z-10 w-[420px] max-w-full h-[260px] rounded-2xl p-6 shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-[#FFF8DB]/40 cursor-pointer group text-left flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, #F4D699 0%, #D0A95C 40%, #B18B44 80%, #9A742F 100%)",
                transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "rotateY(-15deg) rotateX(5deg) translateY(-10px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) translateY(0deg)")}
              onClick={() => setCardFlipped(!cardFlipped)}
            >
              {/* Vệt lóa sáng (Highlight chéo) */}
              <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_50%,transparent_80%)] rounded-2xl pointer-events-none opacity-50" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-black/60 flex items-center justify-center font-serif text-black font-bold text-sm bg-white/20">
                    👑
                  </div>
                  <div>
                    <p className="text-black text-[10px] font-bold">CLB CEO 1983</p>
                    <p className="text-black text-xs font-black">VIP PASS</p>
                  </div>
                </div>
                <div className="px-3 py-1 border border-black/20 rounded-full text-black text-[10px] font-bold flex items-center gap-1 bg-white/20 backdrop-blur-sm shadow-sm">
                  <Zap className="w-3 h-3 text-black fill-current" />
                  <span>NFC TOUCH</span>
                </div>
              </div>

              <div className="mt-16 relative z-10">
                <p className="text-black/70 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                  Executive Member
                </p>
                <h3 className="text-black text-2xl font-black uppercase tracking-wide">
                  {cardFlipped ? "LÊ HOÀNG LONG" : "DOANH NHÂN QUÝ HỢI"}
                </h3>
                <p className="text-black/60 text-[10px] font-mono mt-1 font-semibold">ID: 1983-HNBA-8888</p>
              </div>

              <div className="border-t border-black/15 pt-3 flex justify-between items-center text-black/75 text-[10px] font-bold relative z-10">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-black" />
                  <span>Apple & Google Wallet</span>
                </span>
                <span className="font-mono text-[9px]">CHẠM ĐỂ XEM ↺</span>
              </div>
            </div>
          </div>

          <p
            className={`text-xs mt-12 flex items-center gap-1.5 ${
              themeClass("text-white/50", "text-black/50", "text-slate-400")
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B18B44]" />
            <span>Thẻ Hội Viên Kim Loại Định Danh Số 1-Chạm NFC</span>
          </p>
        </div>
      </main>

      {/* --- STATS SECTION (Bên dưới Hero) --- */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "200+", text: "CEO Đồng Niên", desc: "Chủ tịch & Tổng Giám Đốc" },
            { num: ">5.000 Tỷ", text: "VND Giao Thương", desc: "Tổng chuỗi giao thương B2B" },
            { num: "+30%", text: "Deal Chất Lượng", desc: "Tăng trưởng nhờ ưu tiên nội bộ" },
            { num: "100%", text: "Doanh Nghiệp Thật", desc: "Thẩm định năng lực chặt chẽ" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border backdrop-blur-sm transition-all ${
                themeClass(
                  "bg-[#24262B]/85 border-white/10 shadow-xl",
                  "bg-[#F4F3ED] border-black/5 shadow-sm",
                  "bg-zinc-900 border-white/20"
                )
              }`}
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8C986] to-[#B18B44] leading-none mb-2">
                {stat.num}
              </h3>
              <p className={`text-xs font-bold ${themeClass("text-white/80", "text-black/80", "text-white")}`}>
                {stat.text}
              </p>
              <p className={`text-[11px] mt-1 ${themeClass("text-white/50", "text-black/50", "text-slate-400")}`}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================
          SECTION 2: EXECUTIVE PAIN POINTS (ĐÁNH MẠNH VÀO Ý CỦA SẾP)
          "Không phải phần mềm quản lý hiệp hội, mà là giải pháp cho nỗi đau cô đơn & kết nối thực chiến của CEO"
          ======================================= */}
      <section
        id="pain-points"
        className={`py-24 px-6 md:px-16 border-t transition-colors ${
          themeClass("bg-[#131418] border-white/5", "bg-[#FAF9F5] border-black/5", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18B44] block mb-2">
              THÁCH THỨC CỦA NGƯỜI THUYỀN TRƯỞNG
            </span>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
              }`}
            >
              Ở Đỉnh Cao Sự Nghiệp, <br />
              Bạn Đang Đối Mặt Với Điều Gì?
            </h2>
            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed ${
                themeClass("text-white/70", "text-black/70", "text-slate-300")
              }`}
            >
              Thương trường khốc liệt không thiếu các hội thảo hay danh bạ danh thiếp giấy. Nhưng tìm được một <strong>vòng tròn đồng đẳng tin cậy tuyệt đối</strong> để cùng tháo gỡ bài toán sinh tử lại là điều xa xỉ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Flame className="w-8 h-8 text-[#B18B44]" />,
                title: "Sự Cô Đơn Trên Bàn Cờ Chiến Lược",
                desc: "Là CEO/Chủ tịch, bạn gánh trên vai hàng trăm nhân sự và các quyết định dòng tiền hàng chục tỷ. Những áp lực vĩ mô, tái cấu trúc hay rủi ro pháp lý không thể trải lòng cùng cấp dưới hay đối thủ ngoài ngành.",
                tag: "NỖI ĐAU C-LEVEL",
              },
              {
                icon: <Layers className="w-8 h-8 text-[#B18B44]" />,
                title: "Bội Thực Hội Nhóm Bề Nổi",
                desc: "Tham gia hàng chục CLB, nhận hàng trăm danh thiếp rồi bỏ quên trong ngăn kéo. Mất nhiều thời gian cho các cuộc gặp xã giao vô bổ mà không tạo ra bất kỳ Deal hợp tác hay chuỗi cung ứng thực chất nào.",
                tag: "LÃNG PHÍ THỜI GIAN",
              },
              {
                icon: <Lock className="w-8 h-8 text-[#B18B44]" />,
                title: "Chi Phí Thăm Dò & Rủi Ro Hợp Tác Quá Lớn",
                desc: "Tìm kiếm đối tác B2B bên ngoài tiềm ẩn rủi ro nợ xấu và đứt gãy tiến độ. Thiếu một cơ chế bảo chứng năng lực uy tín từ cộng đồng để có thể bắt tay hợp tác ngay với mức giá ưu đãi và sự yên tâm tuyệt đối.",
                tag: "THẤT THOÁT CƠ HỘI",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border flex flex-col justify-between transition-all hover:-translate-y-1.5 duration-300 ${
                  themeClass(
                    "bg-[#1B1C22]/90 border-white/10 shadow-xl hover:border-white/25",
                    "bg-white border-black/5 shadow-lg hover:border-black/15",
                    "bg-zinc-950 border-white/20"
                  )
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-[#B18B44]/10 border border-[#B18B44]/30">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#B18B44]/30 text-[#B18B44]">
                      {card.tag}
                    </span>
                  </div>
                  <h3
                    className={`text-xl font-black mb-3 leading-snug ${
                      themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      themeClass("text-white/65", "text-black/65", "text-slate-300")
                    }`}
                  >
                    {card.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/10 flex items-center text-xs font-bold text-[#B18B44]">
                  <span>GIẢI PHÁP ĐỘC BẢN TỪ CEO 1983 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 3: HỆ SINH THÁI TOÀN DIỆN (THE COMPREHENSIVE ECOSYSTEM)
          "Hệ sinh thái đột phá để giải quyết triệt để nỗi đau - Không phải phần mềm quản lý"
          ======================================= */}
      <section
        id="ecosystem"
        className={`py-24 px-6 md:px-16 border-t transition-colors ${
          themeClass("bg-[#131418] border-white/5", "bg-[#FAF9F5] border-black/5", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18B44] block mb-2">
              HỆ SINH THÁI GIẢI QUYẾT TOÀN DIỆN
            </span>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
              }`}
            >
              Liên Minh Đồng Niên 1983: <br />
              Hệ Sinh Thái Giao Thương & Trí Tuệ
            </h2>
            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed ${
                themeClass("text-white/70", "text-black/70", "text-slate-300")
              }`}
            >
              Không dừng lại ở việc kết nối danh bạ, CLB CEO 1983 kiến tạo một <strong>hệ sinh thái khép kín 4 trụ cột</strong> giúp doanh nghiệp hội viên gia tăng doanh số, tối ưu chuỗi cung ứng và nâng tầm vị thế lãnh đạo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Pillar 1: Vòng tròn Mastermind & Company Tours */}
            <div
              className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                themeClass(
                  "bg-[#1B1C22]/90 border-white/10 shadow-2xl hover:border-white/25",
                  "bg-white border-black/5 shadow-xl hover:border-black/15",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#B18B44]/20 border border-[#B18B44] flex items-center justify-center text-[#B18B44] font-bold">
                    01
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44]">
                    TRỤ CỘT TRÍ TUỆ
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  Vòng Tròn Mastermind & Executive Business Tours
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-black/70", "text-slate-300")
                  }`}
                >
                  Tham quan trực tiếp dây chuyền sản xuất, “mổ xẻ” mô hình kinh doanh và đối thoại kín cùng các Shark, Chủ tịch tập đoàn lớn (Shark Phú - Sunhouse, Flexfit, AMG...). Học hỏi những bài học thực chiến xương máu về quản trị rủi ro và dòng tiền vĩ mô.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-black/5 dark:border-white/10">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <p className="text-xs font-bold text-[#B18B44]">Shark Phú • Sunhouse</p>
                  <p className="text-[11px] text-slate-400">Đàm đạo quản trị & dòng tiền</p>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <p className="text-xs font-bold text-[#B18B44]">Flexfit & AMG Tour</p>
                  <p className="text-[11px] text-slate-400">Khảo sát chuỗi cung ứng chuẩn Đức</p>
                </div>
              </div>
            </div>

            {/* Pillar 2: B2B Deal-Flow & Chuỗi Cung Ứng */}
            <div
              className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                themeClass(
                  "bg-[#1B1C22]/90 border-white/10 shadow-2xl hover:border-white/25",
                  "bg-white border-black/5 shadow-xl hover:border-black/15",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#B18B44]/20 border border-[#B18B44] flex items-center justify-center text-[#B18B44] font-bold">
                    02
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44]">
                    TRỤ CỘT GIAO THƯƠNG
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  Chuỗi Cung Ứng Khép Kín & B2B Deal Flow
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-black/70", "text-slate-300")
                  }`}
                >
                  Cam kết ưu tiên sử dụng sản phẩm, dịch vụ của nhau trong mạng lưới đồng niên với chính sách chiết khấu đặc quyền. Hơn 200 doanh nghiệp tạo thành một chuỗi cung ứng khép kín tin cậy, luân chuyển hàng nghìn tỷ đồng doanh thu nội bộ mỗi năm.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-black/5 dark:border-white/10">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <p className="text-xs font-bold text-[#B18B44]">&gt;5.000 Tỷ VNĐ</p>
                  <p className="text-[11px] text-slate-400">Doanh số giao thương nội bộ</p>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <p className="text-xs font-bold text-[#B18B44]">Zero Fraud Risk</p>
                  <p className="text-[11px] text-slate-400">Thẩm định tín nhiệm đồng niên</p>
                </div>
              </div>
            </div>

            {/* Pillar 3: Định Danh Số NFC Titanium & Apple Wallet */}
            <div
              className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                themeClass(
                  "bg-[#1B1C22]/90 border-white/10 shadow-2xl hover:border-white/25",
                  "bg-white border-black/5 shadow-xl hover:border-black/15",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#B18B44]/20 border border-[#B18B44] flex items-center justify-center text-[#B18B44] font-bold">
                    03
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44]">
                    TRỤ CỘT CÔNG NGHỆ ĐỊNH DANH
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  Thẻ VIP NFC Titanium & Apple / Google Wallet
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-black/70", "text-slate-300")
                  }`}
                >
                  Xóa bỏ hoàn toàn danh thiếp giấy lỗi thời. Mỗi hội viên được cấp một thẻ kim loại khắc tên Laser tích hợp chip NFC và chuẩn Apple/Google Wallet. Chỉ 1 chạm vào điện thoại đối tác là mở trọn bộ Profile C-Level, Portfolio doanh nghiệp và tự động lưu danh bạ.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-black/5 dark:border-white/10">
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  ⚡ 1-Touch NFC Metal
                </span>
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  📱 Apple & Google Wallet
                </span>
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  🔒 C-Level Verified ID
                </span>
              </div>
            </div>

            {/* Pillar 4: Trí Tuệ Nhân Tạo AI Deal Matchmaking */}
            <div
              className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                themeClass(
                  "bg-[#1B1C22]/90 border-white/10 shadow-2xl hover:border-white/25",
                  "bg-white border-black/5 shadow-xl hover:border-black/15",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#B18B44]/20 border border-[#B18B44] flex items-center justify-center text-[#B18B44] font-bold">
                    04
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44]">
                    TRỤ CỘT KẾT NỐI THÔNG MINH
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  Trợ Lý AI Matchmaking & Deal Room Riêng Tư
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-black/70", "text-slate-300")
                  }`}
                >
                  Hệ thống AI tự động phân tích nhu cầu gọi vốn, tìm nhà cung ứng, mở rộng thị trường hoặc tìm đối tác liên danh để đề xuất chính xác các CEO phù hợp nhất trong mạng lưới. Kèm theo Deal Room bảo mật cao cho các phiên đàm phán chiến lược.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-black/5 dark:border-white/10">
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  🧠 AI Matching Engine
                </span>
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  🤝 Confidential Deal Room
                </span>
                <span className="px-3.5 py-1.5 rounded-full border border-[#B18B44]/40 text-[#B18B44] text-xs font-bold">
                  📈 Realtime Business Sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 4: 4 GIÁ TRỊ CỐT LÕI (CORE VALUES)
          ======================================= */}
      <section
        id="core-values"
        className={`py-24 px-6 md:px-16 border-t transition-colors ${
          themeClass("bg-[#131418] border-white/5", "bg-[#FAF9F5] border-black/5", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18B44] block mb-2">
              TÔN CHỈ HOẠT ĐỘNG
            </span>
            <h2
              className={`text-3xl md:text-5xl font-black tracking-tight ${
                themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
              }`}
            >
              4 Giá Trị Cốt Lõi Của CLB
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {[
              {
                num: "01",
                title: "Gắn kết bền vững",
                desc: "Tạo dựng môi trường đồng niên chân thành, tin cậy tuyệt đối, nơi các doanh nhân Quý Hợi 1983 cùng chia sẻ và tương trợ không vụ lợi.",
              },
              {
                num: "02",
                title: "Học hỏi liên tục",
                desc: "Cung cấp kiến thức quản trị thực chiến từ các Shark & chuyên gia đầu ngành, cập nhật chính sách thuế và xu hướng dòng tiền đầu tư vĩ mô.",
              },
              {
                num: "03",
                title: "Tư duy sáng tạo",
                desc: "Khuyến khích tư duy đổi mới, ứng dụng Trí tuệ Nhân tạo (AI), chuyển đổi số toàn diện và định danh công nghệ vào vận hành doanh nghiệp.",
              },
              {
                num: "04",
                title: "Phát triển bền vững",
                desc: "Kiến tạo liên minh doanh nghiệp có quy mô và giá trị thực chất, thúc đẩy trách nhiệm xã hội (CSR) và cùng nhau vươn tầm quốc tế.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start border-t border-black/5 dark:border-white/10 pt-6">
                <span className="text-5xl lg:text-6xl font-black text-[#B18B44]/40 font-mono tracking-tighter shrink-0">
                  {item.num}
                </span>
                <div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`leading-relaxed text-base font-normal ${
                      themeClass("text-[#94A3B8]", "text-[#475569]", "text-slate-300")
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 5: HOẠT ĐỘNG THỰC CHIẾN (EXECUTIVE EVENTS & TOURS)
          ======================================= */}
      <section
        id="activities"
        className={`py-24 px-6 md:px-16 transition-colors border-t ${
          themeClass("bg-[#131418] border-white/5", "bg-[#FAF9F5] border-black/5", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18B44] block mb-2">
              HOẠT ĐỘNG THỰC CHIẾN ĐỘC QUYỀN
            </span>
            <h2
              className={`text-3xl md:text-5xl font-black tracking-tight ${
                themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
              }`}
            >
              Hoạt Động & Sự Kiện Nổi Bật
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Large Feature */}
            <div className="group relative h-[480px] rounded-3xl overflow-hidden bg-[#1B1C22] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1C22] via-[#1B1C22]/50 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80"
                alt="Đàm Đạo Quản Trị Cùng Shark Phú"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 p-8 sm:p-10 z-20 text-left">
                <span className="px-3 py-1 bg-[#B18B44] text-black text-xs font-bold rounded mb-4 inline-block">
                  BUSINESS TALKSHOW
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-snug">
                  Đàm Đạo Quản Trị Cùng Shark Phú
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  Lắng nghe bài học thực chiến xương máu về dòng tiền, quản trị rủi ro và tái cấu trúc doanh nghiệp từ Chủ tịch Tập đoàn Sunhouse.
                </p>
              </div>
            </div>

            {/* 2 Small Features */}
            <div className="flex flex-col gap-8">
              <div className="group relative h-[224px] rounded-3xl overflow-hidden bg-[#1B1C22] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1C22] via-[#1B1C22]/40 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80"
                  alt="Site Visit Tại Flexfit & AMG"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 text-left">
                  <span className="text-[11px] font-bold text-[#E8C986] uppercase tracking-wider block mb-1">
                    BUSINESS TOUR
                  </span>
                  <h3 className="text-xl font-bold text-white">Site Visit Tại Flexfit & AMG</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Khảo sát dây chuyền sản xuất công nghệ cao và tối ưu chuỗi cung ứng sản xuất.
                  </p>
                </div>
              </div>

              <div className="group relative h-[224px] rounded-3xl overflow-hidden bg-[#1B1C22] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1C22] via-[#1B1C22]/40 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                  alt="Giải Mã Cuộc Chơi Thuế 2026"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 text-left">
                  <span className="text-[11px] font-bold text-[#E8C986] uppercase tracking-wider block mb-1">
                    CHÍNH SÁCH & TÀI CHÍNH
                  </span>
                  <h3 className="text-xl font-bold text-white">Giải Mã Cuộc Chơi Thuế 2026-2028</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Cập nhật chính sách thuế mới và tối ưu cấu trúc tài chính cho doanh nghiệp hội viên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 6: LEADERSHIP & BOARD
          ======================================= */}
      <section
        id="leadership"
        className={`py-24 px-6 md:px-16 text-center border-t transition-colors ${
          themeClass("bg-[#131418] border-white/5", "bg-[#FAF9F5] border-black/5", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18B44] block mb-2">
            BAN CHẤP HÀNH NHIỆM KỲ 2025 - 2028
          </span>
          <h2
            className={`text-3xl md:text-5xl font-black mb-16 tracking-tight ${
              themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
            }`}
          >
            Đội Ngũ Lãnh Đạo Tiên Phong
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-24">
            {leaders.map((person, idx) => (
              <div key={idx} className="flex flex-col items-center group text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-4 border-2 border-black/10 dark:border-white/10 ring-2 ring-[#B18B44]/40 overflow-hidden group-hover:ring-[#B18B44] transition-all duration-300 shadow-lg">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h4
                  className={`font-black text-base sm:text-lg group-hover:text-[#B18B44] transition-colors leading-snug ${
                    themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
                  }`}
                >
                  {person.name}
                </h4>
                <p className="text-[#B18B44] text-xs font-bold mt-1 leading-tight">{person.role}</p>
                <p
                  className={`text-[11px] mt-1 max-w-[170px] ${
                    themeClass("text-[#94A3B8]", "text-[#64748B]", "text-slate-400")
                  }`}
                >
                  {person.company}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action Box */}
          <div
            className={`p-10 sm:p-16 rounded-3xl border text-center relative overflow-hidden ${
              themeClass(
                "bg-[#1B1C22]/95 border-[#B18B44]/40 shadow-2xl",
                "bg-white border-[#B18B44]/30 shadow-2xl",
                "bg-zinc-950 border-white/30"
              )
            }`}
          >
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44] block mb-3">
                ĐẶC QUYỀN HỘI VIÊN ĐỒNG NIÊN
              </span>
              <h2
                className={`text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight ${
                  themeClass("text-[#F8F7F3]", "text-[#2A2621]", "text-white")
                }`}
              >
                Đừng Để Doanh Nghiệp Của Bạn <br />
                <span className="text-transparent bg-gradient-to-r from-[#E8C986] to-[#B18B44] bg-clip-text">
                  Đơn Độc Trong Biển Lớn
                </span>
              </h2>
              <p
                className={`text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed ${
                  themeClass("text-white/70", "text-black/70", "text-slate-300")
                }`}
              >
                Hãy trở thành một mắt xích trong chuỗi liên minh hơn 200 Chủ tịch & CEO sinh năm 1983 uy tín hàng đầu, sở hữu Thẻ VIP NFC định danh C-Level và mở ra những Deal hợp tác tiền tỷ.
              </p>

              <button
                onClick={handleJoinClick}
                className="px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg bg-[linear-gradient(135deg,#F4D699_0%,#D0A95C_40%,#B18B44_80%,#9A742F_100%)] text-[#191A1C] hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl shadow-[#B18B44]/30 cursor-pointer inline-flex items-center gap-2"
              >
                <span>NỘP HỒ SƠ GIA NHẬP CLB →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        className={`py-12 px-6 sm:px-8 border-t text-center text-xs transition-colors ${
          themeClass("bg-[#0E0F12] border-white/5 text-white/50", "bg-[#F3F0E9] border-black/5 text-black/60", "bg-black border-white/20 text-slate-400")
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-[#B18B44] flex items-center justify-center font-serif text-[#B18B44] font-bold text-xs">
              👑
            </div>
            <span className="font-bold">HIỆP HỘI DOANH NGHIỆP CLB CEO 1983</span>
          </div>
          <div>
            © {new Date().getFullYear()} CLB Doanh Nhân CEO 1983. Nền tảng hội viên số phát triển bởi ViOne.
          </div>
        </div>
      </footer>

      {/* --- APPLICATION MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl text-left border ${
              themeClass("bg-[#191A1C] border-[#B18B44]/40 text-white", "bg-white border-[#B18B44]/30 text-black", "bg-zinc-950 border-white text-white")
            }`}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Nộp Hồ Sơ Thành Công!</h3>
                <p className="text-sm mt-2 max-w-xs text-slate-400">
                  Ban Thư Ký CLB CEO 1983 sẽ liên hệ quý doanh nhân trong vòng 24 giờ làm việc.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B18B44]">
                    HỒ SƠ HỘI VIÊN
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    Đăng Ký Gia Nhập CLB CEO 1983
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dành riêng cho Lãnh đạo, Nhà sáng lập & Doanh nhân sinh năm 1983 (Quý Hợi).
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      Họ và Tên Lãnh đạo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Lê Hoàng Long"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 focus:border-[#B18B44] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">
                        Số điện thoại / Zalo *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0987654321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 focus:border-[#B18B44] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">
                        Doanh nghiệp / Tập đoàn *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Tên công ty"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 focus:border-[#B18B44] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">
                        Quy mô doanh thu (Tỷ VNĐ)
                      </label>
                      <select
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 focus:border-[#B18B44] focus:outline-none"
                      >
                        <option value="5-10">&lt; 10 Tỷ</option>
                        <option value="10-50">10 - 50 Tỷ</option>
                        <option value="50-200">50 - 200 Tỷ</option>
                        <option value="200+">&gt; 200 Tỷ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">
                        Lĩnh vực hoạt động
                      </label>
                      <input
                        type="text"
                        placeholder="Công nghệ, Sản xuất..."
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 focus:border-[#B18B44] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-[linear-gradient(135deg,#F4D699_0%,#D0A95C_40%,#B18B44_80%,#9A742F_100%)] text-[#191A1C] font-bold py-4 rounded-xl shadow-lg shadow-[#B18B44]/25 transition-all cursor-pointer text-center hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Gửi Hồ Sơ Xét Duyệt
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Ceo1983Landing;
