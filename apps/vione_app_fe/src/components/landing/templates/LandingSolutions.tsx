import React from "react";
import {
  Users2,
  Briefcase,
  Layers,
  CalendarCheck,
  MessagesSquare,
  BookOpen,
  BarChart3,
  Bot,
  PlugZap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { ThemeMode } from "./LandingHero";

export interface SolutionModule {
  id: string;
  number: string;
  title: string;
  desc: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface LandingSolutionsProps {
  tag: string;
  title: string;
  subtitle?: string;
  modules: SolutionModule[];
  ctaText?: string;
  onCtaClick?: () => void;
  themeMode?: ThemeMode;
}

export function LandingSolutions({
  tag,
  title,
  subtitle,
  modules,
  ctaText = "Khám phá tính năng",
  onCtaClick,
  themeMode = "dark",
}: LandingSolutionsProps) {
  const isDark = themeMode === "dark";
  const isContrast = themeMode === "contrast";

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (isContrast && contrastClass) return contrastClass;
    if (isDark || isContrast) return darkClass;
    return lightClass;
  };

  const defaultIcons = [
    <Users2 className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <Briefcase className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <Layers className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <CalendarCheck className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <MessagesSquare className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <BookOpen className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <BarChart3 className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <Bot className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
    <PlugZap className={`w-5 h-5 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} />,
  ];

  return (
    <section
      id="solutions"
      className={`py-24 md:py-32 relative overflow-hidden transition-colors duration-500 ${
        themeClass("bg-[#04060C]", "bg-[#FFFFFF]", "bg-black")
      }`}
    >
      {/* Top & Bottom Golden Laser Dividers */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] ${
          themeClass(
            "bg-gradient-to-r from-transparent via-[#C5A25D]/40 to-transparent",
            "bg-gradient-to-r from-transparent via-amber-600/25 to-transparent",
            "bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          )
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] ${
          themeClass(
            "bg-gradient-to-r from-transparent via-[#C5A25D]/40 to-transparent",
            "bg-gradient-to-r from-transparent via-amber-600/25 to-transparent",
            "bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          )
        }`}
      />

      {/* Background Graphic Texture: Image layer, Hexagonal Matrix & Light Cone */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Luxury Solutions background image */}
        <img
          src="/landing/business-solutions-bg.jpg"
          alt="Solutions Background"
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
            isDark
              ? "opacity-50 mix-blend-screen"
              : isContrast
              ? "opacity-25 mix-blend-screen"
              : "opacity-20 mix-blend-multiply"
          }`}
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
          }}
        />

        {/* Top Centered Golden Light Cone */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] blur-[140px] ${
            isDark
              ? "bg-gradient-to-b from-amber-400/25 via-yellow-600/10 to-transparent"
              : isContrast
              ? "bg-gradient-to-b from-amber-400/30 to-transparent"
              : "bg-gradient-to-b from-amber-400/15 via-yellow-500/8 to-transparent"
          }`}
        />
        <div
          className={`absolute top-1/2 right-10 w-[600px] h-[600px] rounded-full blur-[170px] ${
            isDark ? "bg-amber-500/15" : isContrast ? "bg-amber-500/20" : "bg-amber-500/8"
          }`}
        />
        <div
          className={`absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] ${
            isDark ? "bg-indigo-950/30" : isContrast ? "opacity-0" : "bg-indigo-950/8"
          }`}
        />

        {/* SVG Hexagonal Matrix Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="solutions-hex-pattern" width="56" height="96" patternUnits="userSpaceOnUse">
              <path
                d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 96 L56 80 L56 48 L28 64 L0 48 L0 80 Z"
                fill="none"
                stroke="rgba(245, 158, 11, 0.5)"
                strokeWidth="0.9"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#solutions-hex-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Sticky/Intro (4 cols) */}
          <div className="lg:col-span-4 text-left space-y-6 lg:sticky lg:top-28">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border backdrop-blur-md shadow-sm ${
                themeClass(
                  "border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 shadow-[0_0_15px_rgba(197,162,93,0.15)]",
                  "border-amber-700/30 text-amber-900 bg-amber-50/80",
                  "border-amber-400 text-amber-300 bg-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                )
              }`}
            >
              <span>{tag || "GIẢI PHÁP BUSINESS CONNECT"}</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-slate-900",
                  "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                )
              }`}
              style={{ fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              {title || "Quản lý kết nối.\nTạo ra cơ hội."}
            </h2>

            <p
              className={`text-sm sm:text-base leading-relaxed font-normal ${
                themeClass("text-slate-300", "text-slate-600", "text-slate-300")
              }`}
            >
              {subtitle || "Một nền tảng toàn diện giúp hiệp hội, tổ chức và doanh nhân thấu hiểu khách hàng, kết nối đúng người, xây dựng quan hệ bền vững và biến mọi quan hệ thành cơ hội kinh doanh thực chất."}
            </p>

            <div className="pt-2">
              <button
                onClick={onCtaClick}
                className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-extrabold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg ${
                  themeClass(
                    "text-slate-950 bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] hover:from-[#FFF0C7] hover:to-[#E2B755] shadow-[0_4px_25px_rgba(226,183,85,0.35)]",
                    "text-white bg-slate-900 hover:bg-black shadow-md",
                    "text-black bg-white font-extrabold shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                  )
                }`}
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: 3x3 Grid of 9 Cards (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {modules.map((mod, idx) => (
              <div
                key={mod.id || idx}
                className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between backdrop-blur-md shadow-lg ${
                  themeClass(
                    "bg-gradient-to-b from-[#0F1422]/95 to-[#080B14]/95 border-white/[0.09] hover:border-[#C5A25D]/60 hover:shadow-[0_15px_35px_rgba(197,162,93,0.15)]",
                    "bg-slate-50/90 border-slate-200/90 hover:border-amber-500/50 hover:bg-white hover:shadow-xl",
                    "bg-zinc-950 border-white/20 hover:border-amber-400 hover:bg-zinc-900 shadow-2xl hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]"
                  )
                }`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-all shadow-inner ${
                      themeClass(
                        "bg-[#141B2D] border-white/10 group-hover:border-[#C5A25D]/60",
                        "bg-amber-50 border-amber-200 group-hover:border-amber-500",
                        "bg-zinc-900 border-white/20 group-hover:border-amber-400"
                      )
                    }`}
                  >
                    {mod.icon || defaultIcons[idx % defaultIcons.length]}
                  </div>

                  <h3
                    className={`text-base font-bold mb-2 transition-colors leading-snug ${
                      themeClass(
                        "text-white group-hover:text-[#E8C986]",
                        "text-slate-900 group-hover:text-amber-800",
                        "text-white group-hover:text-amber-300"
                      )
                    }`}
                  >
                    {mod.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed font-normal ${
                      themeClass("text-slate-300/90", "text-slate-600", "text-slate-300")
                    }`}
                  >
                    {mod.desc}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-3.5 border-t flex items-center justify-between text-[11px] font-medium ${
                    themeClass(
                      "border-white/[0.08] text-slate-400",
                      "border-slate-200/80 text-slate-500",
                      "border-white/10 text-slate-400"
                    )
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                  <span
                    className={`transition-colors font-bold flex items-center gap-1 ${
                      themeClass(
                        "text-[#E8C986] group-hover:text-amber-200",
                        "text-amber-700 group-hover:text-amber-900",
                        "text-amber-300 group-hover:text-white"
                      )
                    }`}
                  >
                    Chi tiết →
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}


