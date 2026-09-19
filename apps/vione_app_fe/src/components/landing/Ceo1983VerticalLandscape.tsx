import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Send, 
  ChevronDown, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Briefcase,
  Sun,
  Moon,
  ShieldCheck,
  Award,
  ArrowRight,
  Globe,
  Users,
  Compass
} from "lucide-react";
import { toast } from "sonner";
import { submitClubApplication } from "@/lib/club-application.functions";

/** 6 Scene Steps for Continuous Vertical Journey */
const SCENE_STEPS = [
  { id: "sky", num: "01", label: "Tầm Nhìn", title: "Khởi Nguyên Bầu Trời" },
  { id: "birds", num: "02", label: "Đồng Hành", title: "Đàn Chim 1983 Bay Cao" },
  { id: "kites", num: "03", label: "Khát Vọng", title: "Cánh Diều Vươn Xa" },
  { id: "villas", num: "04", label: "Thịnh Vượng", title: "Quần Thể Doanh Nghiệp" },
  { id: "water", num: "05", label: "Dòng Chảy", title: "Mặt Nước Vô Cực" },
  { id: "leadership", num: "06", label: "Bản Lĩnh", title: "Đại Dương Sâu Thẳm" },
];

export function Ceo1983VerticalLandscape() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<{ email: string; reference?: string } | null>(null);

  // Dual Sky Theme: "night" (Trời Tối) vs "day" (Trời Sáng)
  const [skyTheme, setSkyTheme] = useState<"night" | "day">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ceo1983_sky_theme");
      if (saved === "night" || saved === "day") return saved;
    }
    return "night";
  });

  const toggleSkyTheme = () => {
    setSkyTheme((prev) => {
      const next = prev === "night" ? "day" : "night";
      if (typeof window !== "undefined") {
        localStorage.setItem("ceo1983_sky_theme", next);
      }
      return next;
    });
  };

  // Form State
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    phone: "",
    email: "",
    title: "Chủ tịch / Tổng Giám Đốc",
    industry: "Sản xuất / Thương mại / Công nghệ",
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
      if (progress < 0.16) setActiveStepIndex(0);
      else if (progress < 0.33) setActiveStepIndex(1);
      else if (progress < 0.50) setActiveStepIndex(2);
      else if (progress < 0.68) setActiveStepIndex(3);
      else if (progress < 0.84) setActiveStepIndex(4);
      else setActiveStepIndex(5);
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
          email: form.email,
          reference: res.reference || `CEO1983-${Date.now().toString().slice(-6)}`,
        });
        toast.success("Hồ sơ đã được gửi thành công! Mật khẩu đăng nhập đã được gửi tới email của bạn.");
      } else {
        toast.error("Gửi hồ sơ thất bại, vui lòng kiểm tra lại thông tin.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const isNight = skyTheme === "night";

  return (
    <div 
      className={`min-h-screen relative w-full overflow-x-hidden font-sans transition-colors duration-700 select-none ${
        isNight ? "bg-[#020617] text-white" : "bg-[#F0F9FF] text-slate-900"
      }`}
    >
      <style>{`
        @keyframes subtleDrift {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes auraGlow {
          0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.4)); }
          50% { opacity: 0.8; filter: drop-shadow(0 0 50px rgba(245, 158, 11, 0.7)); }
        }
        @keyframes floatStar {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* ── TOP NAVIGATION BAR (CỐ ĐỊNH) ── */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 backdrop-blur-xl transition-all duration-300 border-b ${
          isNight 
            ? "bg-slate-950/70 border-amber-500/20 shadow-2xl shadow-black/70" 
            : "bg-white/85 border-sky-200/80 shadow-lg shadow-sky-950/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <img 
            src="/ceo1983-official-logo.png" 
            alt="CLB Doanh Nhân CEO 1983" 
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
          />
          <div className="hidden md:flex flex-col">
            <span className={`text-xs font-black tracking-wider uppercase ${isNight ? "text-amber-300" : "text-[#1E3A8A]"}`}>
              CLB Doanh Nhân CEO 1983
            </span>
            <span className={`text-[10px] font-medium tracking-wide ${isNight ? "text-slate-400" : "text-slate-500"}`}>
              Trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* THEME SWITCHER BUTTON */}
          <button
            type="button"
            onClick={toggleSkyTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              isNight
                ? "bg-slate-900/90 text-amber-300 border-amber-400/30 hover:bg-slate-800 shadow-md shadow-amber-500/10"
                : "bg-sky-50 text-blue-900 border-sky-300 hover:bg-sky-100 shadow-md shadow-sky-500/10"
            }`}
            title={isNight ? "Chuyển sang Theme Trời Sáng" : "Chuyển sang Theme Trời Tối"}
          >
            {isNight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Trời Tối</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Trời Sáng</span>
              </>
            )}
          </button>

          <Link
            to="/association/login"
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition ${
              isNight 
                ? "text-slate-200 hover:text-white hover:bg-white/10" 
                : "text-slate-700 hover:text-blue-900 hover:bg-sky-100"
            }`}
          >
            Đăng Nhập
          </Link>

          <button
            onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
            className="text-xs font-black px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            ✦ Đăng Ký Hội Viên
          </button>
        </div>
      </header>

      {/* ── FLOATING SCENE NAVIGATOR (RIGHT DOCK) ── */}
      <nav 
        aria-label="Scene Navigator"
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2 pointer-events-auto"
      >
        <div className={`flex flex-col items-center gap-2 py-3 px-2 rounded-full backdrop-blur-2xl border shadow-2xl ${
          isNight ? "bg-slate-950/60 border-amber-400/20 text-white" : "bg-white/80 border-sky-200 text-slate-900"
        }`}>
          {SCENE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                onClick={() => scrollToStep(idx)}
                className="group relative flex items-center justify-center p-1.5 focus:outline-none cursor-pointer"
                title={`${step.num} — ${step.title}`}
              >
                {/* Floating tooltip on hover */}
                <div className={`absolute right-9 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl border ${
                  isNight ? "bg-slate-900 text-white border-amber-500/30" : "bg-white text-slate-900 border-sky-200"
                }`}>
                  <span className="text-amber-500 font-bold mr-1">{step.num}</span>
                  {step.title}
                </div>

                {/* Dot */}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-3.5 h-3.5 bg-amber-400 ring-4 ring-amber-400/30 scale-125 shadow-lg shadow-amber-400/80"
                      : isNight 
                        ? "w-2 h-2 bg-white/40 group-hover:bg-white/80" 
                        : "w-2 h-2 bg-slate-400 group-hover:bg-slate-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================================
          SECTION 01: KHỞI NGUYÊN BẦU TRỜI (SKY & VISION)
          - Đường lượn sóng hữu cơ độc đáo, không khối chữ nhật
          - Background Trời Tối (Cosmos Skyline) / Trời Sáng (Daylight Skyline)
      ===================================================================================== */}
      <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden pt-28 pb-16">
        {/* Background Image & Sky Gradients */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: isNight 
              ? "url('/ceo1983_hero_cosmos_skyline.jpg')" 
              : "url('/ceo1983_hero_daylight_skyline.jpg')",
            filter: isNight ? "brightness(0.7) contrast(1.1)" : "brightness(0.95)",
          }}
        />
        <div className={`absolute inset-0 z-0 transition-all duration-700 ${
          isNight 
            ? "bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-[#020617]" 
            : "bg-gradient-to-b from-sky-100/60 via-transparent to-[#F0F9FF]"
        }`} />

        {/* Floating Ambient Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Box with Organic Rounded Borders */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center my-auto">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-xl border shadow-lg ${
            isNight 
              ? "bg-slate-900/70 border-amber-400/30 text-amber-300" 
              : "bg-white/80 border-sky-300 text-blue-900"
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Thế Hệ Doanh Nhân Quý Hợi 1983 · HanoiBA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            BẢN LĨNH TIÊN PHONG <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              VƯƠN TẦM THỊNH VƯỢNG
            </span>
          </h1>

          <p className={`text-base sm:text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow ${
            isNight ? "text-slate-200" : "text-slate-700"
          }`}>
            Hành trình kết nối hơn 500 nhà sáng lập và lãnh đạo doanh nghiệp tuổi 1983 ưu tú. 
            Cùng nhau chia sẻ giá trị, mở rộng cơ hội kinh doanh và kiến tạo di sản bền vững cho cộng đồng.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
              className="px-8 py-3.5 rounded-full font-black text-sm tracking-wide bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              ✦ Gia Nhập CLB CEO 1983
            </button>
            <button
              onClick={() => scrollToStep(1)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs tracking-wider border backdrop-blur-md transition cursor-pointer ${
                isNight 
                  ? "bg-slate-900/60 border-white/20 text-white hover:bg-white/10" 
                  : "bg-white/70 border-sky-300 text-slate-800 hover:bg-white/90"
              }`}
            >
              <span>Khám Phá Hành Trình</span>
              <ChevronDown className="w-4 h-4 text-amber-500 animate-bounce" />
            </button>
          </div>
        </div>

        {/* ── ORGANIC SVG WAVE DIVIDER (UỐN LƯỢN ĐỘC ĐÁO) ── */}
        <div className="relative z-10 w-full overflow-hidden leading-none mt-auto">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-16 sm:h-24 md:h-28 preserve-3d">
            <path
              d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill={isNight ? "#0A1536" : "#E0F2FE"}
              fillOpacity="0.8"
            />
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill={isNight ? "#081026" : "#BAE6FD"}
              fillOpacity="1"
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================================
          SECTION 02: ĐÀN CHIM 1983 (BIRDS & TOGETHERNESS)
          - Không khối chữ nhật: Card uốn lượn bất đối xứng rounded-[48px_16px_48px_16px]
      ===================================================================================== */}
      <section 
        className={`relative py-20 px-6 transition-colors duration-700 ${
          isNight ? "bg-[#081026]" : "bg-[#BAE6FD]"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${
              isNight ? "bg-slate-900/80 text-amber-300 border-amber-500/30" : "bg-white/80 text-blue-900 border-sky-300"
            }`}>
              Trụ Cột 01 · Gắn Kết & Sức Mạnh Bầy Đàn
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-4">
              ĐÀN CHIM 1983 — BAY CAO & BẢN LĨNH
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isNight ? "text-slate-300" : "text-slate-700"}`}>
              Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau. Tại CLB CEO 1983, mỗi doanh nhân là một cánh chim đầu đàn kiên định, sẻ chia luồng gió thị trường để cùng nhau vượt ngàn dặm giông bão.
            </p>
          </div>

          {/* Asymmetrical Curved Organic Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "500+ Doanh Nhân Ưu Tú",
                desc: "Cộng đồng lãnh đạo tuổi 1983 phủ khắp các lĩnh vực then chốt: sản xuất, bất động sản, logistics, công nghệ, tài chính.",
              },
              {
                icon: ShieldCheck,
                title: "Vị Thế Trực Thuộc HanoiBA",
                desc: "Hưởng trọn nguồn lực kết nối kinh doanh, giao thương cấp bộ ngành và tổ chức xúc tiến thương mại quốc tế.",
              },
              {
                icon: Award,
                title: "Chia Sẻ Tri Thức Đỉnh Cao",
                desc: "Các buổi Mastermind chuyên sâu, giải quyết bài toán quản trị thực chiến từ các chủ tịch và chuyên gia đầu ngành.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-8 transition-all duration-300 hover:-translate-y-1.5 border shadow-xl ${
                  isNight
                    ? "bg-slate-900/60 backdrop-blur-xl border-amber-500/20 text-white hover:border-amber-400/50 rounded-[40px_16px_40px_16px]"
                    : "bg-white/85 backdrop-blur-xl border-sky-300/60 text-slate-900 hover:border-blue-400 rounded-[16px_40px_16px_40px]"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold mb-5 shadow-lg shadow-amber-500/20">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black mb-2">{item.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isNight ? "text-slate-300" : "text-slate-600"}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ORGANIC SVG WAVE DIVIDER NỐI SANG SECTION 03 ── */}
        <div className="w-full overflow-hidden leading-none mt-16 -mb-20">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-16 sm:h-24 preserve-3d">
            <path
              d="M0,40 C320,100 420,0 720,50 C1020,100 1120,10 1440,60 L1440,120 L0,120 Z"
              fill={isNight ? "#060D20" : "#E0F2FE"}
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================================
          SECTION 03: CÁNH DIỀU KHÁT VỌNG (KITES & AMBITION)
          - Đường lượn sóng liên tục
      ===================================================================================== */}
      <section 
        className={`relative pt-28 pb-20 px-6 transition-colors duration-700 ${
          isNight ? "bg-[#060D20]" : "bg-[#E0F2FE]"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${
              isNight ? "bg-slate-900/80 text-amber-300 border-amber-500/30" : "bg-white/80 text-blue-900 border-sky-300"
            }`}>
              Trụ Cột 02 · Khát Vọng & Đổi Mới Sáng Tạo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-5 leading-tight">
              NHỮNG CÁNH DIỀU <br />
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                ĐÓN GIÓ VƯƠN XA
              </span>
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isNight ? "text-slate-300" : "text-slate-700"}`}>
              Gió càng ngược, diều càng bay cao. Đối với thế hệ lãnh đạo 1983, thách thức kinh tế và sự biến chuyển công nghệ chính là bệ phóng hoàn hảo để tái cơ cấu mô hình, vươn tầm khẳng định vị thế.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs sm:text-sm">
              {[
                "Chuyển đổi số toàn diện mô hình vận hành và kinh doanh B2B.",
                "Thúc đẩy đổi mới sáng tạo, ứng dụng giải pháp công nghệ tiên phong.",
                "Hỗ trợ các dự án mở rộng thị trường và liên minh đầu tư chiến lược.",
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
              className="px-7 py-3 rounded-full font-bold text-xs tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/25 hover:scale-105 transition-all cursor-pointer"
            >
              ✦ Đăng Ký Tham Gia Diễn Đàn
            </button>
          </div>

          <div className="w-full lg:w-1/2">
            <div 
              className={`p-3 border shadow-2xl relative overflow-hidden ${
                isNight 
                  ? "bg-slate-900/80 border-amber-500/30 rounded-[48px_20px_48px_20px]" 
                  : "bg-white/90 border-sky-300 rounded-[20px_48px_20px_48px]"
              }`}
            >
              <img 
                src="/landing/ceo1983-hero-dark.jpg" 
                alt="Khát vọng CEO 1983" 
                className="w-full h-80 sm:h-96 object-cover rounded-[38px_14px_38px_14px]"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs">
                <p className="font-bold text-amber-300">Tầm Nhìn 2026 - 2030</p>
                <p className="text-slate-300 text-[11px] mt-0.5">Xây dựng liên minh 1.000 doanh nghiệp tăng trưởng bền vững.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ORGANIC SVG WAVE DIVIDER NỐI SANG SECTION 04 ── */}
        <div className="w-full overflow-hidden leading-none mt-20 -mb-20">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-16 sm:h-24 preserve-3d">
            <path
              d="M0,60 C360,0 480,100 840,40 C1200,-20 1320,80 1440,30 L1440,120 L0,120 Z"
              fill={isNight ? "#040A18" : "#F0F9FF"}
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================================
          SECTION 04: QUẦN THỂ THỊNH VƯỢNG (VILLAS & ECOSYSTEM)
          - Không khối chữ nhật: Khung bo tròn hữu cơ mềm mại
      ===================================================================================== */}
      <section 
        className={`relative pt-28 pb-20 px-6 transition-colors duration-700 ${
          isNight ? "bg-[#040A18]" : "bg-[#F0F9FF]"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${
              isNight ? "bg-slate-900/80 text-amber-300 border-amber-500/30" : "bg-white/80 text-blue-900 border-sky-300"
            }`}>
              Trụ Cột 03 · Quần Thể Giao Thương Thịnh Vượng
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-4">
              HỆ SINH THÁI DOANH NGHIỆP TOÀN DIỆN
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isNight ? "text-slate-300" : "text-slate-700"}`}>
              Kết nối chuỗi cung ứng, xúc tiến hợp tác liên ngành và bảo trợ thương mại cho các hội viên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className={`p-8 border shadow-xl ${
                isNight 
                  ? "bg-slate-900/50 backdrop-blur-xl border-amber-500/20 text-white rounded-[44px_16px_44px_16px]" 
                  : "bg-white/80 backdrop-blur-xl border-sky-200 text-slate-900 rounded-[16px_44px_16px_44px]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-bold flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black mb-3">Xúc Tiến Thương Mại B2B Nội Bộ</h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isNight ? "text-slate-300" : "text-slate-600"}`}>
                Ưu tiên sử dụng sản phẩm và dịch vụ của các doanh nghiệp hội viên với cơ chế ưu đãi đặc quyền, tối ưu chi phí và tăng trưởng doanh thu vượt bậc.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <span>Khám phá danh bạ giao thương</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div 
              className={`p-8 border shadow-xl ${
                isNight 
                  ? "bg-slate-900/50 backdrop-blur-xl border-amber-500/20 text-white rounded-[16px_44px_16px_44px]" 
                  : "bg-white/80 backdrop-blur-xl border-sky-200 text-slate-900 rounded-[44px_16px_44px_16px]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-bold flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black mb-3">Quỹ Hợp Tác Đầu Tư & Bảo Trợ</h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isNight ? "text-slate-300" : "text-slate-600"}`}>
                Tập hợp nguồn lực vốn thông minh, liên kết đầu tư dự án bất động sản công nghiệp, sản xuất và các thương vụ M&A quy mô lớn.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <span>Tham gia liên minh đầu tư</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ── ORGANIC SVG WAVE DIVIDER NỐI SANG SECTION 05 ── */}
        <div className="w-full overflow-hidden leading-none mt-20 -mb-20">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-16 sm:h-24 preserve-3d">
            <path
              d="M0,30 C300,90 500,10 800,60 C1100,110 1300,20 1440,50 L1440,120 L0,120 Z"
              fill={isNight ? "#030814" : "#BAE6FD"}
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================================
          SECTION 05 & 06: MẶT NƯỚC VÔ CỰC & BẢN LĨNH ĐẠI DƯƠNG (LEADERSHIP)
          - Bức tranh đại dương và lãnh đạo kiên cường
      ===================================================================================== */}
      <section 
        className={`relative pt-28 pb-28 px-6 transition-colors duration-700 ${
          isNight ? "bg-[#030814]" : "bg-[#BAE6FD]"
        }`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${
            isNight ? "bg-slate-900/80 text-amber-300 border-amber-500/30" : "bg-white/80 text-blue-900 border-sky-300"
          }`}>
            Trụ Cột 04 · Bản Lĩnh Đáy Đại Dương
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-6 leading-tight">
            BẢN LĨNH LÃNH ĐẠO <br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              VƯỢT NGÀN TRÙNG SÓNG GIÓ
            </span>
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed max-w-3xl mx-auto mb-10 ${
            isNight ? "text-slate-300" : "text-slate-700"
          }`}>
            Ở tầng nước sâu thẳm nhất, áp lực lớn nhất lại chính là nơi kết tinh những viên kim cương sáng nhất. 
            Thế hệ CEO 1983 trui rèn bản lĩnh để vững vàng lèo lái con thuyền doanh nghiệp vươn ra biển lớn.
          </p>

          <div className={`p-8 sm:p-12 border shadow-2xl max-w-4xl mx-auto mb-12 ${
            isNight 
              ? "bg-gradient-to-b from-slate-900/80 to-slate-950/90 border-amber-500/30 text-white rounded-[50px_20px_50px_20px]" 
              : "bg-gradient-to-b from-white/90 to-sky-50/90 border-sky-300 text-slate-900 rounded-[20px_50px_20px_50px]"
          }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-amber-500">500+</p>
                <p className="text-xs font-semibold mt-1 opacity-80">Doanh nhân hội viên</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-amber-500">2023</p>
                <p className="text-xs font-semibold mt-1 opacity-80">Năm thành lập</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-amber-500">100%</p>
                <p className="text-xs font-semibold mt-1 opacity-80">Hội viên xác thực KYC</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-amber-500">HanoiBA</p>
                <p className="text-xs font-semibold mt-1 opacity-80">Tổ chức trực thuộc</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }}
            className="px-10 py-4 rounded-full font-black text-sm tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            ✦ ĐĂNG KÝ GIA NHẬP CLB CEO 1983 NGAY
          </button>
        </div>
      </section>

      {/* ── FOOTER ĐỒNG BỘ ── */}
      <footer 
        className={`py-12 px-6 border-t transition-colors duration-700 ${
          isNight ? "bg-slate-950 border-white/10 text-slate-400" : "bg-white border-sky-200 text-slate-600"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <img src="/ceo1983-official-logo.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">CLB Doanh Nhân CEO 1983 — HanoiBA</p>
              <p className="text-[11px] text-slate-500">Hệ sinh thái kết nối & chuyển đổi số doanh nghiệp</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/association" className="hover:text-amber-500 transition">App Hiệp Hội</Link>
            <Link to="/association/login" className="hover:text-amber-500 transition">Đăng Nhập</Link>
            <button 
              onClick={() => { setRegSuccessData(null); setRegModalOpen(true); }} 
              className="text-amber-500 font-bold hover:underline cursor-pointer"
            >
              Gia Nhập CLB
            </button>
          </div>
        </div>
      </footer>

      {/* =====================================================================================
          REGISTRATION MODAL (POPUP ĐĂNG KÝ HỘI VIÊN)
      ===================================================================================== */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl ${
            isNight 
              ? "bg-slate-900 border-amber-500/30 text-white" 
              : "bg-white border-sky-300 text-slate-900"
          }`}>
            <button
              onClick={() => setRegModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {regSuccessData ? (
              <div className="py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black mb-2">Đăng Ký Thành Công!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mb-4">
                  Mã tham chiếu hồ sơ: <span className="font-mono text-amber-500 font-bold">{regSuccessData.reference}</span>
                </p>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-left text-xs space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-amber-500 font-bold">
                    <Mail className="w-4 h-4" />
                    <span>Thông tin tài khoản đăng nhập:</span>
                  </div>
                  <p>Tài khoản: <strong className="text-slate-900 dark:text-white">{form.email || form.phone}</strong></p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Mật khẩu ngẫu nhiên đã được hệ thống tự động gửi tới email của bạn. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
                  </p>
                </div>
                <button
                  onClick={() => setRegModalOpen(false)}
                  className="w-full py-3 rounded-full font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                >
                  Đóng & Trải Nghiệm
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-500 dark:text-amber-300 text-[10.5px] font-bold uppercase tracking-wider mb-2">
                    ✦ Hồ Sơ Gia Nhập CLB CEO 1983
                  </span>
                  <h3 className="text-2xl font-black">Gia Nhập CLB CEO 1983</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Trở thành hội viên chính thức trong mạng lưới doanh nhân tuổi 1983 (HanoiBA).
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Họ và Tên Doanh Nhân *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn Hưng"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Doanh Nghiệp *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Tên công ty..."
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Chức Vụ</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Chủ tịch / CEO"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Số Điện Thoại *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 678"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Email Nhận Mật Khẩu *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="ceo@company.vn"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Lĩnh Vực Hoạt Động</label>
                    <input
                      type="text"
                      placeholder="VD: Bất động sản, Sản xuất, Công nghệ thông tin..."
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-3 py-3.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/30 hover:scale-[1.01] active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Đang xử lý cấp tài khoản...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Hồ Sơ & Cấp Tài Khoản Tức Thì</span>
                      </>
                    )}
                  </button>
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
