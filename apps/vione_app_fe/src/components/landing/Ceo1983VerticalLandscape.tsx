import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Send, 
  Compass, 
  ChevronDown, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Briefcase,
  Layers,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { submitClubApplication } from "@/lib/club-application.functions";

/** 6 Scene Steps for the Indicator */
const SCENE_STEPS = [
  { id: "sky", num: "01", label: "Sky", title: "Khởi Nguyên Bầu Trời" },
  { id: "birds", num: "02", label: "Birds", title: "Đàn Chim 1983" },
  { id: "kites", num: "03", label: "Kites", title: "Những Cánh Diều" },
  { id: "villas", num: "04", label: "Villas", title: "Quần Thể Thịnh Vượng" },
  { id: "water", num: "05", label: "Water", title: "Mặt Nước Vô Cực" },
  { id: "leadership", num: "06", label: "Leadership", title: "Bản Lĩnh Đáy Đại Dương" },
];

export function Ceo1983VerticalLandscape() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<{ email: string; reference?: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    phone: "",
    email: "",
    title: "Chủ tịch / CEO",
    industry: "Công nghệ / B2B",
  });

  // Track global scroll
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalDocHeight > 0 ? Math.min(1, Math.max(0, current / totalDocHeight)) : 0;
      
      setScrollY(current);
      setScrollProgress(progress);

      // Determine active scene based on continuous percentage
      if (progress < 0.16) setActiveStepIndex(0); // 01 Sky
      else if (progress < 0.33) setActiveStepIndex(1); // 02 Birds
      else if (progress < 0.50) setActiveStepIndex(2); // 03 Kites
      else if (progress < 0.68) setActiveStepIndex(3); // 04 Villas
      else if (progress < 0.84) setActiveStepIndex(4); // 05 Water
      else setActiveStepIndex(5); // 06 Leadership / Underwater
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStep = (index: number) => {
    const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (index / (SCENE_STEPS.length - 1)) * totalDocHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.company || !form.phone) {
      toast.error("Vui lòng điền đầy đủ họ tên, doanh nghiệp và số điện thoại.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitClubApplication({
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          company: form.company.trim(),
          title: form.title,
          industry: form.industry,
          clubSlug: "ceo-1983",
        },
      });

      if (res?.ok) {
        setRegSuccessData({
          email: form.email || "Gmail đăng ký",
          reference: res.reference,
        });
        toast.success("Đăng ký thành công! Mật khẩu truy cập đã được gửi qua email.");
      } else {
        toast.error("Có lỗi xảy ra khi nộp hồ sơ, vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full text-white selection:bg-amber-400 selection:text-slate-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Cinzel:wght@600;700;800;900&display=swap');
        
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1) translate(-50%, -50%); filter: drop-shadow(0 0 50px rgba(255, 215, 0, 0.6)); }
          50% { transform: scale(1.06) translate(-47%, -47%); filter: drop-shadow(0 0 90px rgba(255, 170, 0, 0.9)); }
        }

        @keyframes cloudFloat1 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(25px) translateY(-8px); }
        }

        @keyframes cloudFloat2 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-35px) translateY(10px); }
        }

        @keyframes birdFlySlow {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }

        @keyframes kiteHover1 {
          0%, 100% { transform: translate(0, 0) rotate(4deg); }
          50% { transform: translate(-14px, -24px) rotate(-3deg); }
        }

        @keyframes kiteHover2 {
          0%, 100% { transform: translate(0, 0) rotate(-6deg); }
          50% { transform: translate(16px, -20px) rotate(2deg); }
        }

        @keyframes waterCaustics {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.04); }
        }

        @keyframes fishGlide1 {
          0% { transform: translateX(-10vw) translateY(0px) scaleX(1); }
          48% { transform: translateX(110vw) translateY(-20px) scaleX(1); }
          50% { transform: translateX(110vw) translateY(-20px) scaleX(-1); }
          98% { transform: translateX(-10vw) translateY(10px) scaleX(-1); }
          100% { transform: translateX(-10vw) translateY(0px) scaleX(1); }
        }

        @keyframes sharkPatrol {
          0% { transform: translateX(105vw) translateY(0px) scaleX(-1); }
          48% { transform: translateX(-15vw) translateY(30px) scaleX(-1); }
          50% { transform: translateX(-15vw) translateY(30px) scaleX(1); }
          98% { transform: translateX(105vw) translateY(-10px) scaleX(1); }
          100% { transform: translateX(105vw) translateY(0px) scaleX(-1); }
        }

        @keyframes godRaySway {
          0%, 100% { transform: rotate(-14deg) scaleY(1); opacity: 0.35; }
          50% { transform: rotate(-10deg) scaleY(1.1); opacity: 0.55; }
        }

        @keyframes bubbleRise {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-380px) scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* ── MINIMAL TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-slate-950/30 border-b border-white/10 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/40">
            <span className="font-cinzel text-slate-950 font-black text-xs tracking-wider">1983</span>
          </div>
          <div>
            <span className="font-cinzel text-sm font-black tracking-widest text-amber-300 drop-shadow">CLB CEO 1983</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-white/60 tracking-wider uppercase font-medium">HanoiBA · Vertical 3D World</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/association/login"
            className="text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition"
          >
            Đăng Nhập
          </Link>
          <button
            onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
            className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-lg shadow-amber-400/25 hover:shadow-amber-300/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            ✦ Đăng Ký Hội Viên
          </button>
        </div>
      </header>

      {/* ── MINIMAL VERTICAL NAVIGATION INDICATOR ── */}
      <nav 
        aria-label="Scene Navigator"
        className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3 pointer-events-auto"
      >
        <div className="flex flex-col items-center gap-2 py-3 px-2 rounded-full backdrop-blur-xl bg-slate-950/40 border border-white/15 shadow-2xl shadow-black/50">
          {SCENE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                onClick={() => scrollToStep(idx)}
                className="group relative flex items-center justify-center p-1.5 focus:outline-none"
                title={`${step.num} — ${step.label}`}
              >
                {/* Floating tooltip on hover */}
                <div className="absolute right-8 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-lg border border-white/10">
                  <span className="text-amber-400 font-bold mr-1.5">{step.num}</span>
                  {step.title}
                </div>

                {/* Dot */}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-3 h-3 bg-amber-400 ring-4 ring-amber-400/30 scale-125 shadow-lg shadow-amber-400/80"
                      : "w-2 h-2 bg-white/40 group-hover:bg-white/80 group-hover:scale-110"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="text-[9px] font-mono uppercase tracking-widest text-amber-400/80 bg-slate-950/50 px-2 py-0.5 rounded border border-white/10">
          {SCENE_STEPS[activeStepIndex].num} {SCENE_STEPS[activeStepIndex].label}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════
          THE CONTINUOUS 3D ILLUSTRATED LANDSCAPE (600vh TOTAL HEIGHT)
          NO INDEPENDENT SECTION BLOCKS. NO CARDS. PURE ARTWORK + TYPOGRAPHY.
      ══════════════════════════════════════════════════════════════════════════════════════════ */}
      <div 
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "600vh",
          background: "linear-gradient(180deg, #020719 0%, #06183e 10%, #0d3875 22%, #19589d 35%, #2b7ebb 46%, #3fa0d4 53%, #4da2be 59%, #2f7a93 63%, #14506c 68%, #0b3755 74%, #06243d 82%, #021223 92%, #010813 100%)",
        }}
      >
        {/* =====================================================================================
            01 — SKY (0vh - 110vh)
            - 3D Luminous Sun
            - Volumetric drifting clouds at multiple depths
            - Broad soft lighting
            - Hero typography set directly in the sky
        ===================================================================================== */}
        <div className="relative w-full h-[110vh]">
          {/* Subtle Ambient Stars at Top Atmosphere */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  top: `${(i * 17) % 35}%`,
                  left: `${(i * 29) % 100}%`,
                  width: i % 4 === 0 ? "3px" : "1.5px",
                  height: i % 4 === 0 ? "3px" : "1.5px",
                  opacity: 0.3 + (i % 5) * 0.15,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>

          {/* 3D Sun with Soft Radiant Corona */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: "26%",
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${scrollY * 0.12}px)`,
            }}
          >
            {/* Outermost Sun Glow */}
            <div 
              className="absolute w-[420px] h-[420px] rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                background: "radial-gradient(circle, rgba(255, 220, 100, 0.35) 0%, rgba(255, 180, 50, 0.15) 45%, transparent 70%)",
                filter: "blur(35px)",
              }}
            />
            {/* Core 3D Sun Sphere */}
            <div 
              className="w-36 h-36 rounded-full shadow-2xl relative"
              style={{
                background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FFF4B8 20%, #FFD000 50%, #FF8C00 85%, #E65100 100%)",
                boxShadow: "0 0 80px 25px rgba(255, 200, 0, 0.65), 0 0 160px 60px rgba(255, 140, 0, 0.35)",
                animation: "sunPulse 6s ease-in-out infinite",
              }}
            />
          </div>

          {/* Deep Cloud Layer (Background) */}
          <div 
            className="absolute pointer-events-none w-full opacity-60"
            style={{
              top: "38%",
              transform: `translateY(${scrollY * -0.05}px)`,
              animation: "cloudFloat2 12s ease-in-out infinite",
            }}
          >
            <svg viewBox="0 0 1440 320" className="w-full h-auto text-sky-100/40" fill="currentColor">
              <path d="M0,160 C120,130 200,180 320,150 C440,120 520,70 640,90 C760,110 880,160 1000,140 C1120,120 1280,70 1440,110 L1440,320 L0,320 Z" />
            </svg>
          </div>

          {/* Midground 3D Volumetric Clouds */}
          <div 
            className="absolute pointer-events-none w-[120%] -left-[10%] opacity-85"
            style={{
              top: "48%",
              transform: `translateY(${scrollY * -0.09}px)`,
              animation: "cloudFloat1 9s ease-in-out infinite",
            }}
          >
            <svg viewBox="0 0 1440 280" className="w-full h-auto text-white/50" fill="currentColor">
              <path d="M0,190 C180,120 300,160 480,130 C660,100 780,140 960,110 C1140,80 1300,140 1440,120 L1440,280 L0,280 Z" />
            </svg>
          </div>

          {/* Foreground Fluffy Cloud Bank */}
          <div 
            className="absolute pointer-events-none w-full opacity-95"
            style={{
              top: "62%",
              transform: `translateY(${scrollY * -0.14}px)`,
            }}
          >
            <svg viewBox="0 0 1440 260" className="w-full h-auto text-white/70" fill="currentColor">
              <path d="M0,210 C160,170 320,200 480,180 C640,160 800,190 960,170 C1120,150 1280,180 1440,160 L1440,260 L0,260 Z" />
            </svg>
          </div>

          {/* Hero Typography Set Directly Inside Sky Artwork */}
          <div 
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 max-w-4xl mx-auto"
            style={{
              transform: `translateY(${scrollY * 0.22}px)`,
              opacity: Math.max(0, 1 - scrollY / 650),
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-amber-200 text-xs font-semibold uppercase tracking-widest mb-6 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Thế Hệ Doanh Nhân 1983 · HanoiBA</span>
            </div>

            <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)] mb-6">
              BỨC TRANH <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                CEO 1983
              </span>
            </h1>

            <p className="font-jakarta text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl leading-relaxed drop-shadow mb-10">
              Một thế giới liên tục từ tầng không vô tận đến đáy đại dương sâu thẳm. Nơi hội tụ hơn 500 nhà lãnh đạo bản lĩnh kiến tạo vị thế thịnh vượng.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
                className="px-8 py-3.5 rounded-full font-bold text-sm tracking-wide bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-2xl shadow-amber-400/50 hover:scale-105 active:scale-95 transition-all"
              >
                ✦ Gia Nhập CLB CEO 1983
              </button>
              <button
                onClick={() => scrollToStep(1)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-medium text-xs tracking-wider text-white/80 border border-white/25 backdrop-blur-md hover:bg-white/10 transition"
              >
                <span>Cuộn xuống khám phá</span>
                <ChevronDown className="w-4 h-4 text-amber-300 animate-bounce" />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================================
            02 — BIRDS (110vh - 200vh)
            - Seamless continuous sky blending from Layer 01
            - Flocks of 3D birds flying at diverse altitudes and depths
            - Upper clouds from scene 01 still gently visible above
            - No dividing borders or card boxes
        ===================================================================================== */}
        <div className="relative w-full h-[90vh]">
          {/* Continuous Drifting Sky Clouds from Layer 01 */}
          <div className="absolute top-0 left-0 w-full opacity-45 pointer-events-none">
            <svg viewBox="0 0 1440 220" className="w-full h-auto text-white/40" fill="currentColor">
              <path d="M0,90 C220,50 440,110 660,70 C880,30 1100,90 1440,60 L1440,220 L0,220 Z" />
            </svg>
          </div>

          {/* 3D Flock 1: Distant Birds (Deep Background, small scale, high altitude) */}
          <div 
            className="absolute pointer-events-none w-full"
            style={{
              top: "14%",
              transform: `translateY(${(scrollY - 700) * 0.08}px)`,
              animation: "birdFlySlow 8s ease-in-out infinite",
            }}
          >
            {[
              { left: "18%", top: "10px", scale: 0.35, opacity: 0.5 },
              { left: "21%", top: "24px", scale: 0.3, opacity: 0.45 },
              { left: "24%", top: "8px", scale: 0.38, opacity: 0.55 },
              { left: "27%", top: "28px", scale: 0.28, opacity: 0.4 },
              { left: "72%", top: "16px", scale: 0.4, opacity: 0.6 },
              { left: "76%", top: "32px", scale: 0.32, opacity: 0.48 },
              { left: "80%", top: "12px", scale: 0.36, opacity: 0.52 },
            ].map((b, i) => (
              <div 
                key={`dbird-${i}`}
                className="absolute"
                style={{ left: b.left, top: b.top, transform: `scale(${b.scale})`, opacity: b.opacity }}
              >
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  {/* Left Wing */}
                  <path d="M30 14 C20 4 8 2 0 8 C10 10 22 18 30 14 Z" fill="#0A2A54" />
                  {/* Right Wing */}
                  <path d="M30 14 C40 4 52 2 60 8 C50 10 38 18 30 14 Z" fill="#154278" />
                  {/* Body */}
                  <ellipse cx="30" cy="14" rx="4" ry="2" fill="#061B36" />
                </svg>
              </div>
            ))}
          </div>

          {/* 3D Flock 2: Midground Flight (Prominent V-formation) */}
          <div 
            className="absolute pointer-events-none w-full"
            style={{
              top: "32%",
              transform: `translateY(${(scrollY - 900) * 0.16}px)`,
              animation: "birdFlySlow 6s ease-in-out 1s infinite",
            }}
          >
            {[
              { left: "38%", top: "0px", scale: 0.8, opacity: 0.85 }, // Lead Bird
              { left: "33%", top: "28px", scale: 0.7, opacity: 0.75 },
              { left: "43%", top: "32px", scale: 0.72, opacity: 0.78 },
              { left: "28%", top: "58px", scale: 0.62, opacity: 0.68 },
              { left: "48%", top: "64px", scale: 0.65, opacity: 0.7 },
            ].map((b, i) => (
              <div 
                key={`mbird-${i}`}
                className="absolute"
                style={{ left: b.left, top: b.top, transform: `scale(${b.scale})`, opacity: b.opacity }}
              >
                <svg width="84" height="40" viewBox="0 0 84 40" fill="none">
                  {/* Volumetric Shaded Wings */}
                  <path d="M42 20 C28 6 12 4 0 12 C14 14 32 26 42 20 Z" fill="url(#birdGradLeft)" />
                  <path d="M42 20 C56 6 72 4 84 12 C70 14 52 26 42 20 Z" fill="url(#birdGradRight)" />
                  <ellipse cx="42" cy="20" rx="6" ry="2.5" fill="#0A2244" />
                  <defs>
                    <linearGradient id="birdGradLeft" x1="0" y1="0" x2="42" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FDE68A" />
                      <stop offset="0.6" stopColor="#0E3D75" />
                      <stop offset="1" stopColor="#051833" />
                    </linearGradient>
                    <linearGradient id="birdGradRight" x1="84" y1="0" x2="42" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFBEB" />
                      <stop offset="0.6" stopColor="#1A539B" />
                      <stop offset="1" stopColor="#072247" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ))}
          </div>

          {/* Foreground Large Solo Soaring Bird */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: "56%",
              left: "14%",
              transform: `translateY(${(scrollY - 1100) * 0.24}px) scale(1.15)`,
            }}
          >
            <svg width="120" height="54" viewBox="0 0 120 54" fill="none" className="drop-shadow-2xl">
              <path d="M60 27 C40 8 18 5 0 16 C20 19 46 35 60 27 Z" fill="#082348" />
              <path d="M60 27 C80 8 102 5 120 16 C100 19 74 35 60 27 Z" fill="#164A85" />
              <ellipse cx="60" cy="27" rx="8" ry="3.5" fill="#041226" />
            </svg>
          </div>

          {/* Typography Direct In Landscape (No Cards) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 max-w-2xl mx-auto pointer-events-none">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase mb-3">
              02 — BIRDS IN FLIGHT
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight mb-4 drop-shadow-lg">
              Tụ Hội Đàn Chim Đầu Đàn
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-white/80 leading-relaxed font-light">
              Chim không bay đơn độc. Doanh nhân thế hệ Quý Hợi 1983 nương tựa sức gió của nhau, kết thành đội hình vươn cao, bứt phá mọi tầng mây định kiến.
            </p>
          </div>
        </div>

        {/* =====================================================================================
            03 — KITES (200vh - 290vh)
            - 3D Stylized Kites floating at diverse depths (foreground & background)
            - Long elegant vertical strings trailing down continuously
            - Birds from scene 02 still visible floating above
            - Smooth continuous sky transition
        ===================================================================================== */}
        <div className="relative w-full h-[90vh]">
          {/* Distant Kites (Far Background) */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: "8%",
              left: "78%",
              transform: `translateY(${(scrollY - 1500) * 0.09}px)`,
              animation: "kiteHover2 8s ease-in-out infinite",
            }}
          >
            {/* Small 3D Kite */}
            <svg width="44" height="56" viewBox="0 0 44 56" fill="none">
              <polygon points="22,0 44,24 22,56 0,24" fill="#E65100" opacity="0.75" />
              <polygon points="22,0 44,24 22,24" fill="#FFB74D" opacity="0.85" />
              <polygon points="22,24 44,24 22,56" fill="#F57C00" opacity="0.8" />
              <polygon points="0,24 22,24 22,56" fill="#BF360C" opacity="0.75" />
              {/* Vertical string */}
              <path d="M22 56 Q20 180 26 320" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Prominent Midground 3D Diamond Kite */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: "18%",
              left: "22%",
              transform: `translateY(${(scrollY - 1700) * 0.16}px)`,
              animation: "kiteHover1 7s ease-in-out infinite",
            }}
          >
            <svg width="84" height="110" viewBox="0 0 84 110" fill="none" className="drop-shadow-2xl">
              {/* Facet Top-Left */}
              <polygon points="42,0 42,48 0,48" fill="url(#kiteFacetTL)" />
              {/* Facet Top-Right */}
              <polygon points="42,0 84,48 42,48" fill="url(#kiteFacetTR)" />
              {/* Facet Bottom-Left */}
              <polygon points="0,48 42,48 42,110" fill="url(#kiteFacetBL)" />
              {/* Facet Bottom-Right */}
              <polygon points="42,48 84,48 42,110" fill="url(#kiteFacetBR)" />
              {/* Trailing Vertical Ribbon / String */}
              <path d="M42 110 Q35 240 48 380 Q32 520 44 650" stroke="rgba(255, 235, 170, 0.7)" strokeWidth="1.5" fill="none" />
              <defs>
                <linearGradient id="kiteFacetTL" x1="0" y1="0" x2="42" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="kiteFacetTR" x1="84" y1="0" x2="42" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE68A" />
                  <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="kiteFacetBL" x1="0" y1="48" x2="42" y2="110" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#B45309" />
                  <stop offset="1" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="kiteFacetBR" x1="84" y1="48" x2="42" y2="110" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D97706" />
                  <stop offset="1" stopColor="#92400E" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Foreground Stylized Modern Kite */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: "28%",
              right: "18%",
              transform: `translateY(${(scrollY - 1900) * 0.22}px)`,
              animation: "kiteHover2 9s ease-in-out 1.5s infinite",
            }}
          >
            <svg width="70" height="92" viewBox="0 0 70 92" fill="none" className="drop-shadow-xl">
              <polygon points="35,0 70,40 35,40" fill="#38BDF8" />
              <polygon points="35,0 35,40 0,40" fill="#0284C7" />
              <polygon points="0,40 35,40 35,92" fill="#0369A1" />
              <polygon points="35,40 70,40 35,92" fill="#0EA5E9" />
              {/* Vertical string descending into next layer */}
              <path d="M35 92 Q45 220 28 360 Q40 500 32 620" stroke="rgba(186, 230, 253, 0.6)" strokeWidth="1.2" fill="none" />
            </svg>
          </div>

          {/* Typography Direct In Landscape */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 max-w-2xl mx-auto pointer-events-none">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase mb-3">
              03 — KITES & ASPIRATIONS
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight mb-4 drop-shadow-lg">
              Cánh Diều Đón Ngọn Gió Lớn
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-white/80 leading-relaxed font-light">
              Gió càng lớn, diều càng no gió vươn cao. Sợi dây kết nối doanh nghiệp như cội nguồn vững chắc, giữ vững phương hướng trên hành trình mở rộng quy mô.
            </p>
          </div>
        </div>

        {/* =====================================================================================
            04 — VILLAS (290vh - 390vh)
            - Horizon appears
            - Luxurious 3D architectural villas resting on terraced green topography (~1/4 height)
            - Sky, drifting clouds, and kites strings still visible above
            - NO building cards or icons — A true 3D continuous landscape
        ===================================================================================== */}
        <div className="relative w-full h-[100vh] flex flex-col justify-end">
          {/* Upper Atmosphere of this layer (Sky and strings still traversing) */}
          <div className="absolute top-12 left-0 right-0 z-10 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto pointer-events-none">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase mb-3">
              04 — HORIZON & VILLAS
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight mb-4 drop-shadow-lg">
              Quần Thể Cơ Đồ & Thịnh Vượng
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-white/85 leading-relaxed font-light">
              Tọa lạc trên đường chân trời vững chãi. Những công trình kiến trúc biểu trưng cho sự nghiệp, doanh nghiệp bề thế và di sản trường tồn của thế hệ 1983.
            </p>
          </div>

          {/* Rolling Terraced Horizon Hills (Background) */}
          <div className="absolute bottom-[22%] left-0 w-full pointer-events-none opacity-90">
            <svg viewBox="0 0 1440 280" className="w-full h-auto text-[#1b5e20]/60" fill="currentColor">
              <path d="M0,140 Q360,60 720,110 T1440,70 L1440,280 L0,280 Z" />
            </svg>
          </div>

          {/* Forefront Horizon Ridge with 3D Modern Villas (~1/4 height of this region) */}
          <div className="relative z-20 w-full h-[32vh] flex items-end">
            <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="w-full h-full">
              {/* Lush Ground Surface */}
              <path d="M0,180 Q320,120 740,150 T1440,110 L1440,420 L0,420 Z" fill="#144d28" />

              {/* 3D Villa Cluster 1 (Left Wing - Modern Cantilevered Villa) */}
              <g transform="translate(180, 70)" className="drop-shadow-2xl">
                {/* Ground platform / terrace shadow */}
                <ellipse cx="140" cy="150" rx="150" ry="18" fill="rgba(0,0,0,0.35)" />
                {/* Main Lower Villa Structure */}
                <polygon points="40,140 180,110 240,130 100,160" fill="#E2E8F0" />
                <polygon points="100,160 240,130 240,148 100,178" fill="#94A3B8" />
                <polygon points="40,140 100,160 100,178 40,158" fill="#CBD5E1" />
                {/* Warm Illuminated Glass Floor */}
                <polygon points="60,135 170,112 210,126 100,148" fill="#FEF08A" opacity="0.9" />
                {/* Cantilevered 2nd Floor (3D Modern Luxury Villa Roof) */}
                <polygon points="30,105 190,75 250,95 90,125" fill="#FFFFFF" />
                <polygon points="90,125 250,95 250,105 90,135" fill="#475569" />
                {/* Infinity Balcony Railing Glass */}
                <polygon points="95,120 235,92 235,98 95,126" fill="#38BDF8" opacity="0.6" />
                {/* Ambient Interior Lights */}
                <rect x="110" y="105" width="22" height="15" fill="#FDE047" opacity="0.85" rx="2" />
                <rect x="145" y="100" width="30" height="15" fill="#FDE047" opacity="0.8" rx="2" />
              </g>

              {/* 3D Villa Cluster 2 (Center - Master CEO Manor) */}
              <g transform="translate(560, 40)" className="drop-shadow-2xl">
                <ellipse cx="180" cy="180" rx="190" ry="24" fill="rgba(0,0,0,0.4)" />
                {/* Stone Podium */}
                <polygon points="50,170 240,130 330,155 140,195" fill="#64748B" />
                {/* Glass Facade Main Hall */}
                <polygon points="70,160 220,128 290,148 140,180" fill="#FDE047" opacity="0.95" />
                {/* Geometric Minimalist Roof Floating */}
                <polygon points="40,120 250,85 340,110 130,145" fill="#F8FAFC" />
                <polygon points="130,145 340,110 340,120 130,155" fill="#334155" />
                {/* Rooftop Garden Accent */}
                <ellipse cx="200" cy="105" rx="22" ry="7" fill="#15803D" />
                {/* Slender Palm Silhouettes Beside Villa */}
                <path d="M350 170 Q358 120 365 75" stroke="#451A03" strokeWidth="4" fill="none" />
                <path d="M365 75 Q340 60 325 70" stroke="#166534" strokeWidth="3" fill="none" />
                <path d="M365 75 Q385 55 405 68" stroke="#166534" strokeWidth="3" fill="none" />
                <path d="M365 75 Q365 50 365 40" stroke="#15803D" strokeWidth="3.5" fill="none" />
              </g>

              {/* 3D Villa Cluster 3 (Right Wing - Terraced Waterfront Villa) */}
              <g transform="translate(1020, 55)" className="drop-shadow-2xl">
                <ellipse cx="140" cy="160" rx="160" ry="20" fill="rgba(0,0,0,0.35)" />
                <polygon points="30,150 180,120 250,140 100,170" fill="#E2E8F0" />
                <polygon points="100,170 250,140 250,150 100,180" fill="#94A3B8" />
                <polygon points="20,110 190,80 260,102 90,132" fill="#FFFFFF" />
                <polygon points="90,132 260,102 260,112 90,142" fill="#1E293B" />
                <polygon points="40,122 170,98 230,115 100,138" fill="#FDE047" opacity="0.85" />
              </g>
            </svg>
          </div>
        </div>

        {/* =====================================================================================
            05 — WATER & INFINITY POOL (390vh - 480vh)
            - Seamless crystal water surface appears directly below the landscape
            - Giant infinity pool / water volume with depth, reflections, caustics, and ripples
            - Gradual transition as you scroll down: above surface -> waterline -> submerged
        ===================================================================================== */}
        <div className="relative w-full h-[90vh] overflow-hidden">
          {/* Water Surface Horizon & Shimmering Waves */}
          <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none overflow-hidden">
            {/* Luminous Surface Highlight */}
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(56, 189, 248, 0.7) 0%, rgba(14, 116, 144, 0.85) 50%, rgba(8, 47, 73, 0.95) 100%)",
              }}
            />

            {/* Ripple Waves & Caustic Light Patterns */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`ripple-${i}`}
                className="absolute w-[120%] -left-[10%] h-[2px] rounded-full"
                style={{
                  top: `${12 + i * 11}%`,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 40%, rgba(186, 230, 253, 0.9) 60%, transparent 100%)",
                  animation: `waterCaustics ${3 + (i % 3) * 1.2}s ease-in-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Deep Water Mass Gradient */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(8, 51, 88, 0.8) 0%, rgba(5, 34, 64, 0.95) 40%, #03182E 100%)",
            }}
          />

          {/* Subsurface Light Reflections & Refraction */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg viewBox="0 0 1440 600" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,0 Q360,180 720,50 T1440,120 L1440,600 L0,600 Z" fill="rgba(56, 189, 248, 0.15)" />
              <path d="M0,80 Q480,240 960,120 T1440,200 L1440,600 L0,600 Z" fill="rgba(14, 165, 233, 0.1)" />
            </svg>
          </div>

          {/* Typography Direct in Water Layer */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 max-w-2xl mx-auto pointer-events-none">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase mb-3">
              05 — INFINITY WATER
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight mb-4 drop-shadow-lg">
              Mặt Nước Vô Cực & Tĩnh Lặng
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-cyan-100/80 leading-relaxed font-light">
              Mặt nước phẳng lặng phản chiếu bầu trời cao rộng. Nhưng bên dưới bề mặt êm ả là nguồn năng lượng đại dương vô tận, sự thích ứng linh hoạt và chiều sâu tích lũy.
            </p>
          </div>
        </div>

        {/* =====================================================================================
            06 — UNDERWATER WORLD & LEADERSHIP (480vh - 600vh)
            - Deep blue oceanic abyss
            - Volumetric godrays piercing through deep water
            - Translucent rising bubbles & bioluminescent particles
            - Stylized 3D schools of tropical fish and slow gliding oceanic shark
            - Stylized leadership figures seamlessly integrated into the underwater world (NO CARDS)
        ===================================================================================== */}
        <div className="relative w-full h-[120vh] overflow-hidden">
          {/* Volumetric Angled Sun Godrays */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { left: "15%", width: "120px", delay: "0s" },
              { left: "35%", width: "160px", delay: "1.5s" },
              { left: "55%", width: "200px", delay: "0.8s" },
              { left: "75%", width: "140px", delay: "2.2s" },
            ].map((ray, i) => (
              <div
                key={`godray-${i}`}
                className="absolute top-0 h-full origin-top"
                style={{
                  left: ray.left,
                  width: ray.width,
                  background: "linear-gradient(180deg, rgba(125, 211, 252, 0.45) 0%, rgba(56, 189, 248, 0.15) 60%, transparent 100%)",
                  filter: "blur(20px)",
                  animation: `godRaySway 8s ease-in-out ${ray.delay} infinite`,
                }}
              />
            ))}
          </div>

          {/* Drifting Ocean Particles & Rising Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={`bubble-${i}`}
                className="absolute rounded-full bg-cyan-200/40 border border-cyan-100/60 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                style={{
                  bottom: `${(i * 13) % 85}%`,
                  left: `${(i * 23) % 96}%`,
                  width: `${4 + (i % 5) * 3}px`,
                  height: `${4 + (i % 5) * 3}px`,
                  animation: `bubbleRise ${4 + (i % 4) * 2}s ease-in infinite`,
                  animationDelay: `${(i * 0.35) % 4}s`,
                }}
              />
            ))}
          </div>

          {/* 3D Fish School Swimming Horizontally Across Landscape */}
          <div 
            className="absolute pointer-events-none top-[26%] w-full"
            style={{ animation: "fishGlide1 24s linear infinite" }}
          >
            {[
              { x: 0, y: 0, scale: 0.8 },
              { x: 35, y: 15, scale: 0.7 },
              { x: 65, y: -10, scale: 0.85 },
              { x: 95, y: 18, scale: 0.65 },
              { x: 130, y: 5, scale: 0.75 },
            ].map((f, i) => (
              <div 
                key={`fish-${i}`}
                className="absolute"
                style={{ transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})` }}
              >
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                  {/* Fish Body */}
                  <ellipse cx="22" cy="12" rx="16" ry="8" fill="url(#fishGrad)" />
                  {/* Fish Tail Fin */}
                  <polygon points="36,12 48,3 45,12 48,21" fill="#F59E0B" />
                  {/* Fin */}
                  <polygon points="20,4 26,0 24,5" fill="#FBBF24" />
                  {/* Eye */}
                  <circle cx="10" cy="10" r="1.8" fill="#020617" />
                  <defs>
                    <linearGradient id="fishGrad" x1="0" y1="12" x2="36" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.6" stopColor="#0284C7" />
                      <stop offset="1" stopColor="#0369A1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ))}
          </div>

          {/* Majestic 3D Oceanic Shark Gliding Slowly in Deep Depth */}
          <div 
            className="absolute pointer-events-none top-[48%] w-full"
            style={{ animation: "sharkPatrol 38s linear infinite" }}
          >
            <svg width="180" height="70" viewBox="0 0 180 70" fill="none" className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
              {/* Shark Torpedo Body */}
              <path d="M0 35 Q45 15 130 25 Q155 30 180 20 L170 35 L180 50 Q155 40 130 45 Q45 55 0 35 Z" fill="url(#sharkGrad)" />
              {/* Dorsal Fin */}
              <polygon points="85,24 105,2 115,23" fill="#1E293B" />
              {/* Pectoral Fin */}
              <polygon points="55,42 70,68 85,43" fill="#334155" />
              {/* Gill Slits */}
              <line x1="45" y1="30" x2="45" y2="40" stroke="#0F172A" strokeWidth="1.5" />
              <line x1="49" y1="31" x2="49" y2="39" stroke="#0F172A" strokeWidth="1.5" />
              <line x1="53" y1="32" x2="53" y2="38" stroke="#0F172A" strokeWidth="1.5" />
              <defs>
                <linearGradient id="sharkGrad" x1="0" y1="20" x2="0" y2="55" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#475569" />
                  <stop offset="0.5" stopColor="#1E293B" />
                  <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Underwater Typography Direct in Artwork */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-28 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase mb-3">
              06 — UNDERWATER LEADERSHIP
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-wide leading-tight mb-4 drop-shadow-2xl">
              Bản Lĩnh Người Thuyền Trưởng
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-white/80 leading-relaxed font-light max-w-xl mb-14">
              Càng xuống tầng sâu, áp lực càng lớn. Chỉ những nhà lãnh đạo sở hữu nội lực thâm sâu, ý chí sắt đá và tầm nhìn vượt thời gian mới có thể dẫn dắt con thuyền doanh nghiệp vượt sóng dữ.
            </p>

            {/* Stylized Leadership Figures Immersed in Underwater Realm (NO PROFILE CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl mb-16 text-left">
              {[
                {
                  name: "Lê Xuân Tùng",
                  title: "Chủ tịch CLB CEO 1983",
                  company: "Chủ tịch HĐQT Tập đoàn V-Group",
                  quote: "Đoàn kết thế hệ 1983 để cùng nhau bứt phá vươn tầm quốc tế.",
                  symbol: "01",
                },
                {
                  name: "Nguyễn Mạnh Thắng",
                  title: "Phó Chủ tịch Thường trực",
                  company: "Tổng Giám đốc TN Tech",
                  quote: "Giao thương thực chất trên nền tảng công nghệ số tiên phong.",
                  symbol: "02",
                },
                {
                  name: "Hoàng Thị Mai Phương",
                  title: "Phó Chủ tịch Đối ngoại",
                  company: "Phó Tổng Giám đốc Alphanam Group",
                  quote: "Mở rộng mạng lưới hợp tác đa phương, lan tỏa vị thế doanh nhân.",
                  symbol: "03",
                },
                {
                  name: "Vũ Tuấn Dũng",
                  title: "Tổng Thư Ký CLB",
                  company: "Chủ tịch HĐQT Dũng Việt Holdings",
                  quote: "Kỷ cương, chuẩn mực và phụng sự vì sự phát triển bền vững.",
                  symbol: "04",
                },
              ].map((leader, i) => (
                <div 
                  key={leader.name}
                  className="relative group border-l-2 border-amber-400/40 pl-4 py-2 hover:border-amber-300 transition-all duration-300"
                >
                  <div className="text-[10px] font-mono text-amber-300/80 mb-1">{leader.symbol} · LEADERSHIP</div>
                  <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-300 transition">
                    {leader.name}
                  </h3>
                  <div className="text-xs font-semibold text-cyan-300 mb-0.5">{leader.title}</div>
                  <div className="text-[11px] text-white/60 mb-3">{leader.company}</div>
                  <p className="font-jakarta text-xs text-white/75 italic leading-relaxed">
                    "{leader.quote}"
                  </p>
                </div>
              ))}
            </div>

            {/* Giant Final Direct Call to Action */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
                className="px-10 py-4 rounded-full font-bold text-base tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-[0_10px_40px_rgba(251,191,36,0.4)] hover:shadow-[0_15px_60px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                ✦ ĐĂNG KÝ GIA NHẬP CLB CEO 1983
              </button>
              <p className="text-xs text-white/50 tracking-wide">
                Hệ thống tự động xét duyệt và gửi thông tin tài khoản qua email cá nhân
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── REGISTRATION MODAL CONNECTED TO CRM & EMAIL ── */}
      {regModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setRegModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/30 p-6 sm:p-8 shadow-2xl shadow-black/80 text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

            <button
              onClick={() => setRegModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {regSuccessData ? (
              /* Success State with Email Notice */
              <div className="py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-cinzel text-2xl font-bold text-white mb-2">
                  Đăng Ký Thành Công!
                </h3>
                <p className="font-jakarta text-sm text-white/80 leading-relaxed mb-4">
                  Hệ thống CRM đã tiếp nhận hồ sơ của bạn với mã tham chiếu:{" "}
                  <span className="font-mono text-amber-300 font-bold">{regSuccessData.reference}</span>
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2 mb-6 text-white/85">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Mail className="w-4 h-4" />
                    <span>Thông tin tài khoản đã được gửi:</span>
                  </div>
                  <p>
                    Tên đăng nhập: <strong className="text-white">{form.email || form.phone}</strong>
                  </p>
                  <p>
                    Mật khẩu ngẫu nhiên tạm thời đã được hệ thống tự động gửi tới hòm thư Gmail của bạn. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).
                  </p>
                </div>
                <button
                  onClick={() => setRegModalOpen(false)}
                  className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                >
                  Đóng & Khám Phá
                </button>
              </div>
            ) : (
              /* Registration Input Form */
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                    ✦ Hồ Sơ Gia Nhập
                  </div>
                  <h3 className="font-cinzel text-2xl font-black text-white">
                    Gia Nhập CLB CEO 1983
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Nhập thông tin bên dưới để được cấp tài khoản & gia nhập cộng đồng.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Họ và Tên Doanh Nhân *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn Hưng"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Doanh Nghiệp *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          required
                          placeholder="Công ty CP..."
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Chức Vụ
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Chủ tịch / CEO"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Số Điện Thoại *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 678"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Email Nhận Mật Khẩu *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          placeholder="ceo@gmail.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Lĩnh Vực Hoạt Động
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Bất động sản, Sản xuất, Công nghệ thông tin..."
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-lg shadow-amber-400/30 hover:scale-[1.01] active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Đang nộp hồ sơ & cấp tài khoản...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Hồ Sơ & Nhận Mật Khẩu Đăng Nhập</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-white/50">
                    Bằng việc đăng ký, bạn đồng ý với Điều lệ CLB Doanh Nhân CEO 1983.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Ceo1983VerticalLandscape;
