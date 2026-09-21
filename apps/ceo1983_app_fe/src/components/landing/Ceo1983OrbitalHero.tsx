import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
  Award,
  Users,
  Building2,
  Calendar,
  Gift,
  Coins,
  GraduationCap,
  CreditCard,
  TrendingUp,
} from "lucide-react";

export interface OrbitalMenuItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  href: string;
}

const ORBITAL_ITEMS: OrbitalMenuItem[] = [
  {
    id: "vip-card",
    title: "Thẻ Titanium NFC",
    subtitle: "Chạm 1 giây kết nối thông minh",
    badge: "VIP Pass",
    icon: <CreditCard className="w-4 h-4 text-amber-300" />,
    href: "/association/card",
  },
  {
    id: "deal-flow",
    title: "Deal Flow B2B",
    subtitle: "Sàn thương vụ khép kín >5.000 Tỷ",
    badge: "Thương Vụ",
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    href: "/association/opportunities",
  },
  {
    id: "clevel-members",
    title: "Hội Viên C-Level",
    subtitle: "200+ Chủ tịch & CEO Quý Hợi",
    badge: "Mạng Lưới",
    icon: <Users className="w-4 h-4 text-sky-400" />,
    href: "/association/members",
  },
  {
    id: "events-summit",
    title: "Sự Kiện Thượng Đỉnh",
    subtitle: "Diễn đàn kinh tế & Gala Dinner",
    badge: "Hội Nghị",
    icon: <Calendar className="w-4 h-4 text-amber-300" />,
    href: "/association/events",
  },
  {
    id: "governance-academy",
    title: "Học Viện Quản Trị",
    subtitle: "Tri thức điều hành đa thế hệ",
    badge: "Đào Tạo",
    icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
    href: "/association/library",
  },
  {
    id: "member-perks",
    title: "Đặc Quyền Hội Viên",
    subtitle: "Hệ thống ưu đãi 5 sao toàn quốc",
    badge: "Đặc Quyền",
    icon: <Gift className="w-4 h-4 text-rose-400" />,
    href: "/association/perks",
  },
  {
    id: "strategic-advisors",
    title: "Cố Vấn Chiến Lược",
    subtitle: "Đồng hành vượt bão kinh tế",
    badge: "Cố Vấn",
    icon: <Crown className="w-4 h-4 text-amber-300" />,
    href: "/association/members",
  },
  {
    id: "investment-fund",
    title: "Quỹ Đầu Tư 1983",
    subtitle: "Đồng hành kiến tạo kỳ lân",
    badge: "Đầu Tư",
    icon: <Coins className="w-4 h-4 text-yellow-300" />,
    href: "/association/opportunities",
  },
];

interface ExecutiveSlide {
  id: "male" | "female";
  gender: "nam" | "nu";
  name: string;
  title: string;
  role: string;
  company: string;
  tagline: string;
  quote: string;
  image: string;
  accentColor: string;
  badgeText: string;
  rotationDir: "counter-clockwise" | "clockwise";
  stats: { val: string; label: string }[];
}

const SLIDES: ExecutiveSlide[] = [
  {
    id: "male",
    gender: "nam",
    name: "Lê Hoàng Long",
    title: "Chủ tịch Hội đồng Quản trị",
    role: "Chủ tịch CLB Doanh Nhân CEO 1983",
    company: "Tập Đoàn Đầu Tư & Công Nghệ Tinh Hoa",
    tagline: "TIÊN PHONG BỨT PHÁ • VỊ THẾ DẪN ĐẦU",
    quote: "Đồng niên gắn kết — Tiên phong kiến tạo chuỗi cung ứng khép kín và mở rộng đế chế kinh doanh vững mạnh.",
    image: "/landing/executive_male_1983.jpg",
    accentColor: "from-amber-400 via-amber-500 to-amber-600",
    badgeText: "CHỦ TỊCH CLB CEO 1983",
    rotationDir: "counter-clockwise",
    stats: [
      { val: "200+", label: "Chủ tịch & CEO" },
      { val: ">5.000 Tỷ", label: "Deal Flow B2B" },
      { val: "100%", label: "Thẩm định HanoiBA" },
    ],
  },
  {
    id: "female",
    gender: "nu",
    name: "Trần Thị Mai Lan",
    title: "Chủ tịch kiêm Tổng Thư Ký",
    role: "Phó Chủ tịch Thường trực CLB CEO 1983",
    company: "Hệ Thống Logistics & Thương Mại Quốc Tế Mai Lan",
    tagline: "BẢN LĨNH THÔNG TUỆ • KẾT NỐI ĐỈNH CAO",
    quote: "Nữ lãnh đạo Quý Hợi 1983: Quyết đoán trong chiến lược, tinh tế trong quản trị và bền bỉ trong hành trình kiến tạo giá trị.",
    image: "/landing/executive_female_1983.jpg",
    accentColor: "from-amber-300 via-rose-400 to-amber-500",
    badgeText: "PHÓ CHỦ TỊCH THƯỜNG TRỰC",
    rotationDir: "counter-clockwise",
    stats: [
      { val: "35%", label: "Tăng trưởng liên minh" },
      { val: "50+ Nữ CEO", label: "Lãnh đạo xuất sắc" },
      { val: "Top 1%", label: "Doanh nhân tiêu biểu" },
    ],
  },
];

export function Ceo1983OrbitalHero({
  onOpenJoinModal,
}: {
  onOpenJoinModal?: () => void;
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<OrbitalMenuItem | null>(null);

  const activeSlide = SLIDES[currentSlideIdx];

  // Auto switch slide every 9 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#030712] text-white pt-24 pb-20 select-none">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-br from-amber-600/15 via-[#003B95]/20 to-transparent blur-[140px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-20 right-10 w-[460px] h-[460px] rounded-full bg-blue-700/15 blur-[130px]" />
        {/* Subtle Luxury Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        {/* Top Badges & HanoiBA affiliation */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 backdrop-blur-md shadow-[0_0_20px_rgba(216,178,130,0.15)] mb-4"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-300 uppercase">
              Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)
            </span>
          </motion.div>

          {/* Kinetic Text Reveal Headline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + "-headline"}
              initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -25, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 max-w-4xl"
            >
              <span className="block text-xs sm:text-sm font-extrabold tracking-[0.25em] text-amber-400/90 uppercase">
                {activeSlide.tagline}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CLB DOANH NHÂN{" "}
                </span>
                <span className="relative inline-block bg-gradient-to-r from-[#FFE6A5] via-[#D8B282] to-[#B8860B] bg-clip-text text-transparent drop-shadow-[0_2px_25px_rgba(216,178,130,0.4)]">
                  CEO 1983
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mx-auto pt-2 leading-relaxed">
                Cộng đồng lãnh đạo C-Level sinh năm 1983 (Quý Hợi). Kết nối chuỗi cung ứng khép kín, bảo chứng tín nhiệm và xúc tiến giao thương thực chất.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Stage: Interactive Orbital System */}
        <div
          className="relative w-full max-w-4xl mx-auto h-[460px] sm:h-[520px] flex items-center justify-center my-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Outer Orbital Glowing Track */}
          <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-amber-400/20 shadow-[0_0_50px_rgba(216,178,130,0.1)] pointer-events-none" />
          <div className="absolute w-[290px] h-[290px] sm:w-[390px] sm:h-[390px] rounded-full border border-blue-500/15 border-dashed pointer-events-none" />

          {/* Central Portrait Card */}
          <div className="relative z-20 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="relative group cursor-pointer"
                onClick={() => setCurrentSlideIdx((prev) => (prev + 1) % SLIDES.length)}
              >
                {/* Glowing border ring around avatar */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-500/40 via-blue-500/30 to-amber-300/40 blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />

                {/* Main Frame */}
                <div className="relative w-52 h-64 sm:w-64 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-400/50 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.name}
                    className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                  {/* Leader Badge on Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-300 uppercase shadow-lg">
                      {activeSlide.badgeText}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Sparkles className="w-3 h-3" /> 1983
                    </span>
                  </div>

                  {/* Leader Info Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md">
                      {activeSlide.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-amber-300/95 truncate">
                      {activeSlide.title}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5 font-medium">
                      {activeSlide.company}
                    </p>
                  </div>
                </div>

                {/* Floating Flip Hint */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-400/40 text-[10px] font-bold text-amber-300 shadow-md backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
                  <span>Chạm để đổi slide</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Orbital Container (Rotating Counter-Clockwise) */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              isPaused ? "orbital-paused" : ""
            }`}
          >
            <div
              className={`relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] animate-orbit-counter`}
              style={{
                animationDuration: "36s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >
              {ORBITAL_ITEMS.map((item, idx) => {
                const total = ORBITAL_ITEMS.length;
                const angle = (idx / total) * 2 * Math.PI;
                // Calculate position on the circle
                const radius = typeof window !== "undefined" && window.innerWidth < 640 ? 170 : 230;
                const left = 50 + (radius / 230) * 44 * Math.cos(angle);
                const top = 50 + (radius / 230) * 44 * Math.sin(angle);

                return (
                  <div
                    key={item.id}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                    onMouseEnter={() => setHoveredNode(item)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Counter-rotate the badge so text stays horizontal and readable */}
                    <div
                      className="animate-orbit-clockwise cursor-pointer group"
                      style={{
                        animationDuration: "36s",
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                      }}
                    >
                      <a
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 hover:border-amber-400 shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(216,178,130,0.5)] backdrop-blur-md transition-all duration-300 group-hover:scale-110"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
                          {item.title}
                        </span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hovered Node Preview Tooltip / Detail */}
        <div className="min-h-[42px] flex items-center justify-center text-center mt-2">
          {hoveredNode ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs font-medium backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{hoveredNode.title}:</span>
              <span>{hoveredNode.subtitle}</span>
              <a href={hoveredNode.href} className="underline text-amber-300 font-bold ml-1">
                Khám phá →
              </a>
            </motion.div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              ✦ Rê chuột vào các danh mục quỹ đạo để xem quyền lợi & tiện ích hội viên
            </div>
          )}
        </div>

        {/* Slide Controls & Quote */}
        <div className="max-w-2xl mx-auto mt-6 text-center space-y-4">
          {/* Quote */}
          <div className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
              "{activeSlide.quote}"
            </p>
          </div>

          {/* Slide Switcher Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentSlideIdx(0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                currentSlideIdx === 0
                  ? "bg-gradient-to-r from-[#D8B282] to-[#B8860B] text-black shadow-[0_0_20px_rgba(216,178,130,0.4)] scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              <span>👔 Doanh Nhân Nam</span>
              {currentSlideIdx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
            </button>

            <button
              onClick={() => setCurrentSlideIdx(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                currentSlideIdx === 1
                  ? "bg-gradient-to-r from-[#FFE6A5] to-[#D8B282] text-black shadow-[0_0_20px_rgba(216,178,130,0.4)] scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              <span>👗 Doanh Nhân Nữ</span>
              {currentSlideIdx === 1 && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenJoinModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#B8860B] text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_10px_30px_rgba(216,178,130,0.35)] hover:shadow-[0_12px_40px_rgba(216,178,130,0.55)] hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>Đăng Ký Gia Nhập VIP 1983</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="/association"
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-amber-400/30 hover:border-amber-400 transition-all flex items-center gap-2"
            >
              <span>Vào Cổng Hội Viên App</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 max-w-lg mx-auto">
            {activeSlide.stats.map((s, idx) => (
              <div key={idx} className="text-center p-2 rounded-xl bg-white/[0.02]">
                <div className="text-sm sm:text-base font-black bg-gradient-to-r from-[#FFE6A5] to-[#D8B282] bg-clip-text text-transparent">
                  {s.val}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
