import React, { useState } from "react";
import {
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Coins,
  Landmark,
  Globe2,
  Handshake,
  ArrowRight,
  Hexagon,
} from "lucide-react";
import type { ThemeMode } from "./LandingHero";

export interface EcosystemNode {
  id: string;
  name: string;
  desc?: string;
  count?: string;
  icon?: React.ReactNode;
}

export interface LandingEcosystemProps {
  tag: string;
  title: string;
  subtitle: string;
  nodes: EcosystemNode[];
  ctaLinkText?: string;
  themeMode?: ThemeMode;
}

export function LandingEcosystem({
  tag,
  title,
  subtitle,
  nodes,
  ctaLinkText = "Xem hệ sinh thái",
  themeMode = "dark",
}: LandingEcosystemProps) {
  const [activeNode, setActiveNode] = useState<number>(0);
  const isDark = themeMode === "dark";
  const isContrast = themeMode === "contrast";

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (isContrast && contrastClass) return contrastClass;
    if (isDark || isContrast) return darkClass;
    return lightClass;
  };

  const defaultNodes = [
    { name: "Hiệp hội", icon: <Landmark className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Doanh nhân", icon: <Users className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Doanh nghiệp", icon: <Building2 className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Chuyên gia", icon: <GraduationCap className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Nhà đầu tư", icon: <Coins className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Cơ quan quản lý", icon: <Briefcase className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Tổ chức quốc tế", icon: <Globe2 className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
    { name: "Đối tác chiến lược", icon: <Handshake className={`w-4 h-4 ${themeClass("text-[#E8C986]", "text-amber-700", "text-amber-300")}`} /> },
  ];

  return (
    <section
      id="ecosystem"
      className={`py-24 md:py-32 relative overflow-hidden transition-colors duration-500 ${
        themeClass("bg-[#05070E]", "bg-[#F8FAFC]", "bg-black")
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

      {/* High-Resolution Luxury Global Network Asset & Radar Concentric Rings */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Luxury Background Digital Sphere Asset */}
        <img
          src="/landing/business-ecosystem-bg.jpg"
          alt="Ecosystem Background"
          className={`absolute w-[950px] h-[950px] object-contain transition-opacity duration-700 ${
            isDark
              ? "opacity-55 mix-blend-screen"
              : isContrast
              ? "opacity-30 mix-blend-screen"
              : "opacity-25 mix-blend-multiply"
          }`}
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)",
            maskImage:
              "radial-gradient(circle at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)",
          }}
        />

        {/* Core Solar Glow */}
        <div
          className={`w-[850px] h-[600px] rounded-full blur-[180px] ${
            isDark
              ? "bg-gradient-to-r from-amber-500/20 via-yellow-600/15 to-amber-700/20"
              : isContrast
              ? "bg-amber-500/25"
              : "bg-amber-400/15"
          }`}
        />
        
        {/* SVG Concentric Radar Orbital Rings */}
        <svg className="absolute w-[950px] h-[950px] opacity-[0.25]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="140" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="400" cy="400" r="230" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
          <circle cx="400" cy="400" r="320" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.2" strokeDasharray="8 8" />
          <circle cx="400" cy="400" r="390" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
          
          {/* Radial Crosshair Axis */}
          <line x1="0" y1="400" x2="800" y2="400" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
          <line x1="400" y1="0" x2="400" y2="800" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
          
          {/* Constellation Focal Dots */}
          <circle cx="400" cy="170" r="3.5" fill="#FBBF24" />
          <circle cx="630" cy="400" r="4.5" fill="#F59E0B" />
          <circle cx="230" cy="570" r="3.5" fill="#FCD34D" />
          <circle cx="570" cy="570" r="4" fill="#FBBF24" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Description (4 cols) */}
          <div className="lg:col-span-4 text-left space-y-6">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border backdrop-blur-md shadow-sm ${
                themeClass(
                  "border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 shadow-[0_0_15px_rgba(197,162,93,0.15)]",
                  "border-amber-700/30 text-amber-900 bg-amber-50/80",
                  "border-amber-400 text-amber-300 bg-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                )
              }`}
            >
              <span>{tag || "HỆ SINH THÁI KẾT NỐI KINH DOANH"}</span>
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
              {title || "Cùng nhau tạo ra giá trị lớn hơn"}
            </h2>

            <p
              className={`text-sm sm:text-base leading-relaxed font-normal ${
                themeClass("text-slate-300", "text-slate-600", "text-slate-300")
              }`}
            >
              {subtitle || "Business Connect kết nối hội viên, hiệp hội, doanh nghiệp, chuyên gia, đối tác, nhà đầu tư và các tổ chức quốc tế trong một hệ sinh thái mở, để cùng chia sẻ tri thức, nguồn lực và cơ hội kinh doanh."}
            </p>

            <div className="pt-2">
              <a
                href="#ecosystem-details"
                className={`inline-flex items-center gap-2 text-sm font-extrabold transition-colors group cursor-pointer ${
                  themeClass("text-[#E8C986] hover:text-amber-200", "text-amber-800 hover:text-amber-950", "text-amber-300 hover:text-white")
                }`}
              >
                <span>{ctaLinkText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Center Column: Planetary Orbital Connected Diagram (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
            {/* Orbital Rings Background */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-amber-400/20 pointer-events-none animate-[spin_160s_linear_infinite]" />
            <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full border border-amber-400/25 border-dashed pointer-events-none animate-[spin_100s_linear_infinite_reverse]" />
            <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amber-400/30 pointer-events-none" />

            {/* Central Hexagon Hub */}
            <div
              className={`relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 group hover:scale-105 transition-transform ${
                themeClass(
                  "bg-gradient-to-br from-[#F7D896] via-[#E2B755] to-[#C49338] shadow-[0_0_40px_rgba(226,183,85,0.5)] border-amber-200 text-slate-950",
                  "bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl border-amber-300 text-slate-950",
                  "bg-white border-amber-400 shadow-[0_0_30px_rgba(255,255,255,0.4)] text-black"
                )
              }`}
            >
              <Hexagon className="w-6 h-6 fill-current mb-0.5" />
              <span className="text-[10px] sm:text-[11px] font-black leading-tight tracking-tight uppercase">
                BUSINESS<br />CONNECT
              </span>
            </div>

            {/* Orbiting Satellite Node Badges (8 Nodes) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              {defaultNodes.map((node, i) => {
                const total = defaultNodes.length;
                const rad = (i * (360 / total) - 90) * (Math.PI / 180);
                const radiusSm = 165; // px distance from center on desktop
                const x = Math.cos(rad);
                const y = Math.sin(rad);

                return (
                  <div
                    key={i}
                    onClick={() => setActiveNode(i)}
                    className={`absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold hover:scale-110 transition-all cursor-pointer backdrop-blur-md ${
                      themeClass(
                        "bg-[#0B0F19]/95 border-white/[0.12] hover:border-[#C5A25D] text-white hover:bg-[#141B2D] shadow-[0_6px_20px_rgba(0,0,0,0.8)]",
                        "bg-white/95 border-slate-200 hover:border-amber-500 text-slate-800 hover:bg-amber-50 shadow-md",
                        "bg-zinc-900 border-white/30 hover:border-amber-400 text-white hover:bg-black shadow-2xl"
                      )
                    }`}
                    style={{
                      transform: `translate(${x * radiusSm}px, ${y * radiusSm}px)`,
                    }}
                  >
                    <span
                      className={`p-1 rounded-full ${
                        themeClass("bg-[#141B2D]", "bg-amber-50", "bg-zinc-800")
                      }`}
                    >
                      {node.icon}
                    </span>
                    <span className="whitespace-nowrap">{node.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3-Tier Bold Gold Slogan (3 cols) */}
          <div
            className={`lg:col-span-3 lg:border-l lg:pl-8 text-left space-y-4 ${
              themeClass("lg:border-white/[0.08]", "lg:border-slate-200", "lg:border-white/20")
            }`}
          >
            <div
              className={`space-y-3 font-mono font-black text-lg sm:text-xl tracking-wider uppercase leading-tight ${
                themeClass(
                  "text-transparent bg-clip-text bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338]",
                  "text-amber-800",
                  "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                )
              }`}
            >
              <p className={`border-b pb-2 ${themeClass("border-white/[0.08]", "border-slate-200", "border-white/20")}`}>
                NHIỀU KẾT NỐI HƠN
              </p>
              <p className={`border-b pb-2 ${themeClass("border-white/[0.08]", "border-slate-200", "border-white/20")}`}>
                NHIỀU CƠ HỘI HƠN
              </p>
              <p>NHIỀU GIÁ TRỊ HƠN</p>
            </div>
            <p
              className={`text-xs sm:text-sm leading-relaxed font-normal pt-2 ${
                themeClass("text-slate-300/90", "text-slate-600", "text-slate-300")
              }`}
            >
              Xây dựng mạng lưới quan hệ chiến lược đa tầng, biến mỗi lần chạm danh thiếp thành hợp đồng giao thương thực tế.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

