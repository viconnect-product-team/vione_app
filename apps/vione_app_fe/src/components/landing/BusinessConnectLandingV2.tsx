import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  X,
  Check,
  Sun,
  Moon,
  Contrast,
  Users,
  Building2,
  Globe2,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  CalendarCheck,
  MessagesSquare,
  BookOpen,
  BarChart3,
  Bot,
  PlugZap,
  Briefcase,
  Layers,
  HeartHandshake,
  Star,
  Network,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useAutoHideHeader } from "./useAutoHideHeader";

export type ThemeMode = "light" | "dark" | "contrast";

// =========================================================================
// SLOW GOLDEN LIGHT PARTICLES (Heritage & Trust Atmosphere)
// =========================================================================
function GoldenHeritageParticles({ theme }: { theme: ThemeMode }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    // Generate static initial particles for background floating ambient
    const list = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 15 + Math.random() * 20,
    }));
    setParticles(list);
  }, []);

  if (theme === "contrast") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: theme === "dark" ? "#D4AF37" : "#C5A059",
            boxShadow: theme === "dark" ? "0 0 10px rgba(212,175,55,0.7)" : "0 0 6px rgba(197,160,89,0.5)",
          }}
          animate={{
            y: ["0px", "-60px", "0px"],
            opacity: [0.2, 0.85, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// =========================================================================
// SECTION TRANSITION: LEGACY REVEAL (Slide Up & Smooth Opacity Reveal)
// =========================================================================
function LegacyRevealSection({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [60, 0, 0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.5]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ y, opacity }}
      className={`relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </motion.section>
  );
}

// =========================================================================
// 5 PROBLEM CARDS (Dossier Folios)
// =========================================================================
const PROBLEMS = [
  {
    id: 1,
    num: "01",
    title: "Thông tin phân tán",
    tagline: "Khó tìm đúng người",
    desc: "Dữ liệu đối tác lưu rải rác trên danh bạ cá nhân, Zalo, danh thiếp giấy và nhiều file Excel rời rạc khiến việc tra cứu mất nhiều giờ.",
    highlight: "PHÂN TÁN",
  },
  {
    id: 2,
    num: "02",
    title: "Khó duy trì quan hệ",
    tagline: "Thiếu công cụ nhắc nhở và theo dõi tương tác",
    desc: "Không có lịch sử gặp gỡ liên tục, dễ lãng quên đối tác tiềm năng sau sự kiện và đánh mất sợi dây gắn kết chiến lược.",
    highlight: "GIÁN ĐOẠN",
  },
  {
    id: 3,
    num: "03",
    title: "Bỏ lỡ cơ hội",
    tagline: "Không kịp nắm bắt cơ hội phù hợp",
    desc: "Các nhu cầu mua bán, chuyển giao công nghệ và hợp tác đầu tư xuất hiện mỗi ngày nhưng không được matching kịp thời.",
    highlight: "CHẬM TRỄ",
  },
  {
    id: 4,
    num: "04",
    title: "Thiếu kết nối thực chất",
    tagline: "Nhiều sự kiện nhưng khó tạo giá trị sau sự kiện",
    desc: "Giao lưu bề nổi, trao đổi danh thiếp hình thức mà thiếu cơ chế thiết lập cuộc hẹn 1-on-1 theo đúng năng lực cung ứng.",
    highlight: "HÌNH THỨC",
  },
  {
    id: 5,
    num: "05",
    title: "Khó đo lường hiệu quả",
    tagline: "Không biết mối quan hệ mang lại giá trị gì",
    desc: "Ban lãnh đạo và doanh nhân không đo lường được ROI, doanh số giao thương và giá trị thực tế do các mối quan hệ tạo ra.",
    highlight: "VÔ HÌNH",
  },
];

// =========================================================================
// 9 ENTERPRISE SOLUTIONS (Gold Framed Executive Cards)
// =========================================================================
const SOLUTIONS = [
  {
    id: 1,
    num: "01",
    title: "Quản lý hội viên",
    desc: "Hồ sơ 360°, phân nhóm thông minh, phân quyền đa cấp bậc và tự động hóa kỳ hội phí.",
    icon: Users,
  },
  {
    id: 2,
    num: "02",
    title: "CRM & Quan hệ",
    desc: "Theo dõi lịch sử gặp gỡ, ghi chú chi tiết, nhắc nhở định kỳ và chấm điểm gắn kết đối tác.",
    icon: HeartHandshake,
  },
  {
    id: 3,
    num: "03",
    title: "Cơ hội kinh doanh",
    desc: "Quản lý pipeline, matching nhu cầu cung - cầu, xúc tiến thương mại và tìm kiếm đối tác B2B.",
    icon: Briefcase,
  },
  {
    id: 4,
    num: "04",
    title: "Sự kiện",
    desc: "Tổ chức, quản lý đại biểu, check-in QR/NFC một chạm, kết nối trước - trong - sau sự kiện.",
    icon: CalendarCheck,
  },
  {
    id: 5,
    num: "05",
    title: "Cộng đồng & Nhóm",
    desc: "Không gian kết nối theo ngành nghề, phân ban chuyên môn và câu lạc bộ doanh nhân chiến lược.",
    icon: MessagesSquare,
  },
  {
    id: 6,
    num: "06",
    title: "Tri thức & Nội dung",
    desc: "Chia sẻ kinh nghiệm chuyên gia, tài liệu pháp lý, chuẩn mực quản trị và báo cáo ngành độc quyền.",
    icon: BookOpen,
  },
  {
    id: 7,
    num: "07",
    title: "Báo cáo & Phân tích",
    desc: "Đo lường hiệu quả kết nối, lưu lượng giao thương, tần suất tương tác và tỷ suất hoàn vốn ROI.",
    icon: BarChart3,
  },
  {
    id: 8,
    num: "08",
    title: "AI Copilot",
    desc: "Tìm kiếm ngữ nghĩa, gợi ý kết nối chuẩn xác, tóm tắt hồ sơ năng lực và trợ lý kinh doanh AI.",
    icon: Bot,
  },
  {
    id: 9,
    num: "09",
    title: "Tích hợp & Mở rộng",
    desc: "Kết nối liền mạch với hệ sinh thái CRM, email, calendar và API mở tiêu chuẩn quốc tế.",
    icon: PlugZap,
  },
];

// =========================================================================
// 6 PARTNER LOGOS
// =========================================================================
const CLIENT_LOGOS = [
  { name: "VCCI", label: "Liên đoàn Thương mại & Công nghiệp VN", icon: Building2 },
  { name: "AmCham", label: "Hiệp hội Doanh nghiệp Hoa Kỳ", icon: Globe2 },
  { name: "EuroCham", label: "Hiệp hội Doanh nghiệp Châu Âu", icon: Award },
  { name: "KoCham", label: "Hiệp hội Doanh nghiệp Hàn Quốc", icon: Building2 },
  { name: "SBF", label: "Singapore Business Federation", icon: Globe2 },
  { name: "AusCham", label: "Hiệp hội Doanh nghiệp Úc", icon: Award },
];

// =========================================================================
// 3 CLIENT SUCCESS STORIES
// =========================================================================
const TESTIMONIALS = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    role: "Chủ tịch Hiệp hội Du lịch Việt Nam",
    quote:
      "Business Connect đã cách mạng hóa phương thức gắn kết hơn 600 hội viên của chúng tôi. Việc kết nối doanh nghiệp B2B và nhắc nhở gia hạn diễn ra tự động, nâng cao uy tín hiệp hội rõ rệt.",
    stat: "+180% Tương tác hội viên",
  },
  {
    id: 2,
    name: "Trần Minh Quân",
    role: "CEO, Công ty Sản xuất Việt",
    quote:
      "Tính năng AI Matching và hồ sơ số 360° đã giúp công ty tôi tìm được 4 nhà phân phối lớn chỉ trong 2 tháng đầu tham gia. Một nền tảng không thể thiếu cho lãnh đạo doanh nghiệp.",
    stat: "4 Hợp đồng phân phối lớn",
  },
  {
    id: 3,
    name: "Lê Hoàng Anh",
    role: "Doanh nhân, Hội viên VIP",
    quote:
      "Tôi tiết kiệm hàng chục giờ mỗi tháng nhờ hệ thống ghi chú lịch sử gặp gỡ và nhắc nhở thông minh. Mọi mối quan hệ kinh doanh giờ đây được chăm sóc bài bản và chuẩn mực.",
    stat: "Tiết kiệm 40h/tháng",
  },
];

// =========================================================================
// MAIN V2 COMPONENT: HERITAGE & TRUST
// =========================================================================
export function BusinessConnectLandingV2() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { showHeader, headerStyle, resetTimer } = useAutoHideHeader(3000);

  // Form State
  const [demoForm, setDemoForm] = useState({ name: "", phone: "", email: "", org: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowDemoModal(false);
      setDemoForm({ name: "", phone: "", email: "", org: "" });
      toast.success("Đã ghi nhận yêu cầu Demo! Đội ngũ Business Connect sẽ liên hệ bạn trong 15 phút.");
    }, 700);
  };

  // Theme Styling Palettes
  // Light: Private Banking / Law (Parchment beige background, charcoal text, champagne gold border)
  // Dark: Midnight Navy Blue, metallic gold accents
  // Contrast: Clean newspaper black & white
  const themeContainerClasses = {
    light: "bg-[#F9F6F0] text-[#1C1917]",
    dark: "bg-[#060C1B] text-[#F3E5AB]",
    contrast: "bg-white text-black",
  };

  const cardBorderClasses = {
    light: "border-[#D9CDB8] bg-white/95 shadow-[0_10px_30px_rgba(197,160,89,0.12)] hover:border-[#C5A059]",
    dark: "border-[#D4AF37]/35 bg-[#0D1830]/90 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]",
    contrast: "border-2 border-black bg-white shadow-none hover:bg-zinc-50",
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen font-serif transition-colors duration-500 overflow-x-hidden ${themeContainerClasses[theme]}`}
      style={{
        fontFamily:
          theme === "contrast"
            ? "system-ui, -apple-system, sans-serif"
            : "'Playfair Display', 'Merriweather', 'Be Vietnam Pro', Georgia, serif",
      }}
    >
      {/* Background Particles */}
      <GoldenHeritageParticles theme={theme} />

      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 px-4 sm:px-6 lg:px-8 ${
          theme === "dark"
            ? "border-[#D4AF37]/25 bg-[#060C1B]/85"
            : theme === "contrast"
            ? "border-black bg-white"
            : "border-[#E5DAC8] bg-[#F9F6F0]/90"
        }`}
      >
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 ${
                theme === "dark"
                  ? "border-[#D4AF37] bg-gradient-to-br from-[#D4AF37] to-[#8C653B] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  : theme === "contrast"
                  ? "border-2 border-black bg-black text-white"
                  : "border-[#C5A059] bg-gradient-to-br from-[#C5A059] to-[#8C653B] text-white shadow-md"
              }`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div
                className={`text-lg font-bold tracking-wider uppercase font-serif ${
                  theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
                }`}
              >
                BUSINESS CONNECT
              </div>
              <div
                className={`text-[10px] tracking-widest uppercase font-sans ${
                  theme === "dark" ? "text-[#D4AF37]/70" : theme === "contrast" ? "text-zinc-600" : "text-[#8C653B]"
                }`}
              >
                HERITAGE & TRUST • V2
              </div>
            </div>
          </Link>

          {/* Nav Links: Chính xác theo ảnh gốc */}
          <nav className="hidden xl:flex items-center gap-8 text-sm font-medium font-sans">
            <a href="#giai-phap" className="hover:opacity-75 transition">
              Giải pháp
            </a>
            <a href="#khach-hang" className="hover:opacity-75 transition">
              Khách hàng
            </a>
            <a href="#cau-chuyen" className="hover:opacity-75 transition">
              Câu chuyện
            </a>
            <a href="#bang-gia" className="hover:opacity-75 transition">
              Bảng giá
            </a>
            <a href="#tai-nguyen" className="hover:opacity-75 transition">
              Tài nguyên
            </a>
            <a href="#ve-chung-toi" className="hover:opacity-75 transition">
              Về chúng tôi
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div
              className={`flex items-center rounded-full border p-1 ${
                theme === "dark"
                  ? "border-[#D4AF37]/40 bg-[#0A1128]"
                  : theme === "contrast"
                  ? "border-black bg-white"
                  : "border-[#D9CDB8] bg-[#EFE9DD]"
              }`}
            >
              <button
                onClick={() => setTheme("light")}
                title="Private Banking (Sáng)"
                className={`rounded-full p-1.5 transition ${
                  theme === "light" ? "bg-[#C5A059] text-white shadow" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                title="Midnight Navy (Tối)"
                className={`rounded-full p-1.5 transition ${
                  theme === "dark" ? "bg-[#D4AF37] text-black shadow" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("contrast")}
                title="Báo chí (Tương phản cao)"
                className={`rounded-full p-1.5 transition ${
                  theme === "contrast" ? "bg-black text-white shadow" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Contrast className="h-3.5 w-3.5" />
              </button>
            </div>

            <Link
              to="/auth"
              className="hidden sm:inline-flex rounded-xl px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider hover:opacity-75 transition"
            >
              Đăng nhập
            </Link>
            <button
              onClick={() => setShowDemoModal(true)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold font-sans tracking-wide uppercase transition-all duration-300 transform hover:-translate-y-0.5 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                  : theme === "contrast"
                  ? "border-2 border-black bg-black text-white hover:bg-zinc-800"
                  : "bg-gradient-to-r from-[#C5A059] to-[#8C653B] text-white shadow-lg"
              }`}
            >
              <span>Đặt demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI
          ========================================================================= */}
      <LegacyRevealSection id="hero" className="text-center pt-28 pb-20">
        {/* Tagline */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold tracking-widest uppercase font-sans mb-8 ${
            theme === "dark"
              ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
              : theme === "contrast"
              ? "border-black bg-black text-white"
              : "border-[#C5A059]/60 bg-[#C5A059]/15 text-[#8C653B]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI</span>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] max-w-5xl mx-auto ${
            theme === "dark"
              ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E5AB] to-[#D4AF37]"
              : theme === "contrast"
              ? "text-black"
              : "text-[#1C1917]"
          }`}
        >
          Hiểu đúng người. Mở ra cơ hội thật.
        </h1>

        {/* Subtext */}
        <p
          className={`mt-6 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto font-sans ${
            theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
          }`}
        >
          Business Connect giúp các hiệp hội, tổ chức và doanh nhân quản lý mối quan hệ, kết nối đúng người, đúng thời
          điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setShowDemoModal(true)}
            className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold font-sans uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl ${
              theme === "dark"
                ? "bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                : theme === "contrast"
                ? "border-2 border-black bg-black text-white"
                : "bg-gradient-to-r from-[#C5A059] to-[#8C653B] text-white"
            }`}
          >
            <span>Đặt demo ngay</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowVideoModal(true)}
            className={`inline-flex items-center gap-2.5 rounded-xl border px-7 py-4 text-sm font-bold font-sans transition-all duration-300 hover:opacity-80 ${
              theme === "dark"
                ? "border-[#D4AF37]/40 bg-[#0A1128]/80 text-[#D4AF37]"
                : theme === "contrast"
                ? "border-2 border-black bg-white text-black"
                : "border-[#D9CDB8] bg-white text-[#1C1917]"
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Xem video (2 phút)</span>
          </button>
        </div>

        {/* 4 Stats Grid */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-[#D4AF37]/20">
          {[
            { value: "10,000+", label: "Doanh nhân & Hội viên" },
            { value: "300+", label: "Hiệp hội & Tổ chức" },
            { value: "50,000+", label: "Kết nối được tạo" },
            { value: "20+", label: "Quốc gia & vùng lãnh thổ" },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${cardBorderClasses[theme]}`}
            >
              <div
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-serif ${
                  theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
                }`}
              >
                {s.value}
              </div>
              <div
                className={`mt-2 text-xs sm:text-sm font-sans font-medium ${
                  theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-700" : "text-[#57534E]"
                }`}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </LegacyRevealSection>

      {/* =========================================================================
          PROBLEM SECTION: NHIỀU TỔ CHỨC VẪN ĐANG GẶP NHỮNG VẤN ĐỀ NÀY
          ========================================================================= */}
      <LegacyRevealSection id="van-de">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-sans mb-4 ${
              theme === "dark"
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                : theme === "contrast"
                ? "border-black bg-black text-white"
                : "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#8C653B]"
            }`}
          >
            <span>NHIỀU TỔ CHỨC VẪN ĐANG GẶP NHỮNG VẤN ĐỀ NÀY</span>
          </div>
          <h2
            className={`text-3xl sm:text-5xl font-bold tracking-tight ${
              theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
            }`}
          >
            Quản lý quan hệ kinh doanh vẫn còn nhiều thách thức
          </h2>
        </div>

        {/* 5 Dossier Folio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map((p, idx) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                cardBorderClasses[theme]
              } ${idx === 3 || idx === 4 ? "md:col-span-1 lg:col-span-1" : ""}`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-8 right-8 h-0.5 ${
                  theme === "dark" ? "bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" : "bg-[#C5A059]"
                }`}
              />

              <div className="flex items-center justify-between mb-5">
                <span
                  className={`text-2xl font-bold font-serif ${
                    theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
                  }`}
                >
                  ({p.num})
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${
                    theme === "dark"
                      ? "border-[#D4AF37]/40 text-[#D4AF37]"
                      : theme === "contrast"
                      ? "border-black text-black"
                      : "border-[#C5A059]/50 text-[#8C653B]"
                  }`}
                >
                  {p.highlight}
                </span>
              </div>

              <h3
                className={`text-xl font-bold mb-2 font-serif ${
                  theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
                }`}
              >
                {p.title}
              </h3>

              <div
                className={`text-xs font-bold font-sans uppercase tracking-wider mb-3 ${
                  theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-zinc-600" : "text-[#8C653B]"
                }`}
              >
                {p.tagline}
              </div>

              <p
                className={`text-sm leading-relaxed font-sans ${
                  theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
                }`}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </LegacyRevealSection>

      {/* =========================================================================
          SOLUTION SECTION: GIẢI PHÁP BUSINESS CONNECT (9 ENTERPRISE MODULES)
          ========================================================================= */}
      <LegacyRevealSection id="giai-phap">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-sans mb-4 ${
              theme === "dark"
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                : theme === "contrast"
                ? "border-black bg-black text-white"
                : "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#8C653B]"
            }`}
          >
            <span>GIẢI PHÁP BUSINESS CONNECT</span>
          </div>
          <h2
            className={`text-3xl sm:text-5xl font-bold tracking-tight ${
              theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
            }`}
          >
            Quản lý kết nối. Tạo ra cơ hội.
          </h2>
          <p
            className={`mt-4 text-base sm:text-lg leading-relaxed font-sans ${
              theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
            }`}
          >
            Một nền tảng toàn diện giúp hiệp hội, tổ chức và doanh nhân hiểu khách hàng, kết nối đúng người, xây dựng
            quan hệ bền vững và biến mối quan hệ thành cơ hội kinh doanh thực chất.
          </p>
          <div className="mt-6">
            <a
              href="#tinh-nang"
              className={`inline-flex items-center gap-2 text-sm font-bold font-sans uppercase tracking-wider hover:underline ${
                theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
              }`}
            >
              <span>Khám phá tính năng</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* 9 Enterprise SaaS Solution Cards */}
        <div id="tinh-nang" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s) => {
            const IconComponent = s.icon;
            return (
              <div
                key={s.id}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${cardBorderClasses[theme]}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                      theme === "dark"
                        ? "border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37]"
                        : theme === "contrast"
                        ? "border-2 border-black bg-black text-white"
                        : "border-[#C5A059] bg-[#C5A059]/20 text-[#8C653B]"
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold tracking-widest ${
                      theme === "dark" ? "text-[#D4AF37]/60" : "opacity-40"
                    }`}
                  >
                    {s.num}
                  </span>
                </div>

                <h3
                  className={`text-xl font-bold mb-3 font-serif ${
                    theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
                  }`}
                >
                  {s.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed font-sans ${
                    theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
                  }`}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </LegacyRevealSection>

      {/* =========================================================================
          ECOSYSTEM SECTION: HỆ SINH THÁI KẾT NỐI KINH DOANH (CONSTELLATION NETWORK)
          ========================================================================= */}
      <LegacyRevealSection id="he-sinh-thai">
        <div
          className={`rounded-3xl border p-10 sm:p-14 relative overflow-hidden ${
            theme === "dark"
              ? "border-[#D4AF37]/40 bg-gradient-to-b from-[#0D1830] to-[#060C1B] shadow-2xl"
              : theme === "contrast"
              ? "border-2 border-black bg-white"
              : "border-[#D9CDB8] bg-white shadow-xl"
          }`}
        >
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-sans mb-4 ${
                theme === "dark"
                  ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                  : theme === "contrast"
                  ? "border-black bg-black text-white"
                  : "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#8C653B]"
              }`}
            >
              <span>HỆ SINH THÁI KẾT NỐI KINH DOANH</span>
            </div>

            <h2
              className={`text-3xl sm:text-5xl font-bold tracking-tight ${
                theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
              }`}
            >
              Cùng nhau tạo ra giá trị lớn hơn
            </h2>

            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed font-sans ${
                theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
              }`}
            >
              Business Connect kết nối hội viên, hiệp hội, doanh nghiệp, chuyên gia, đối tác, nhà đầu tư và các tổ chức
              quốc tế trong một hệ sinh thái mở, để cùng chia sẻ tri thức, nguồn lực và cơ hội kinh doanh.
            </p>

            <div className="mt-8">
              <a
                href="#he-sinh-thai"
                className={`inline-flex items-center gap-2 text-sm font-bold font-sans uppercase tracking-wider hover:underline ${
                  theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
                }`}
              >
                <span>Xem hệ sinh thái</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Constellation Network Nodes */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-8 border-t border-[#D4AF37]/20">
              {[
                { name: "Hội viên", icon: Users },
                { name: "Hiệp hội", icon: Building2 },
                { name: "Doanh nghiệp", icon: Briefcase },
                { name: "Chuyên gia", icon: BookOpen },
                { name: "Nhà đầu tư", icon: TrendingUp },
                { name: "Tổ chức QT", icon: Globe2 },
              ].map((node, i) => {
                const NodeIcon = node.icon;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-center transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "border-[#D4AF37]/30 bg-[#0A1128] text-[#D4AF37]"
                        : theme === "contrast"
                        ? "border border-black bg-white text-black"
                        : "border-[#E5DAC8] bg-[#F9F6F0] text-[#8C653B]"
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <NodeIcon className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="text-xs font-bold font-sans">{node.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Highlight Banner */}
            <div
              className={`mt-10 p-4 rounded-2xl border text-center font-sans text-xs sm:text-sm font-black tracking-widest uppercase ${
                theme === "dark"
                  ? "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]"
                  : theme === "contrast"
                  ? "border-2 border-black bg-black text-white"
                  : "border-[#C5A059]/40 bg-[#C5A059]/15 text-[#8C653B]"
              }`}
            >
              NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.
            </div>
          </div>
        </div>
      </LegacyRevealSection>

      {/* =========================================================================
          CLIENT & TESTIMONIAL SECTION: ĐƯỢC TIN TƯỞNG & CÂU CHUYỆN THÀNH CÔNG
          ========================================================================= */}
      <LegacyRevealSection id="khach-hang">
        {/* Header 1: Khách hàng tổ chức */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-sans mb-4 ${
              theme === "dark"
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                : theme === "contrast"
                ? "border-black bg-black text-white"
                : "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#8C653B]"
            }`}
          >
            <span>ĐƯỢC TIN TƯỞNG BỞI CÁC HIỆP HỘI VÀ DOANH NGHIỆP</span>
          </div>
          <h2
            className={`text-2xl sm:text-4xl font-bold tracking-tight ${
              theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
            }`}
          >
            Những tổ chức tiên phong đã lựa chọn
          </h2>
          <div className="mt-3">
            <a
              href="#khach-hang"
              className={`inline-flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider hover:underline ${
                theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
              }`}
            >
              <span>Xem tất cả khách hàng</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 6 Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
          {CLIENT_LOGOS.map((org, i) => {
            const OrgIcon = org.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 ${cardBorderClasses[theme]}`}
              >
                <OrgIcon
                  className={`h-7 w-7 mb-2 ${
                    theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#8C653B]"
                  }`}
                />
                <div
                  className={`text-base font-bold font-serif ${
                    theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
                  }`}
                >
                  {org.name}
                </div>
                <div
                  className={`text-[11px] mt-1 font-sans line-clamp-2 ${
                    theme === "dark" ? "text-slate-400" : "text-[#78716C]"
                  }`}
                >
                  {org.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Header 2: Câu chuyện thành công */}
        <div id="cau-chuyen" className="text-center max-w-3xl mx-auto mb-14">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-sans mb-4 ${
              theme === "dark"
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                : theme === "contrast"
                ? "border-black bg-black text-white"
                : "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#8C653B]"
            }`}
          >
            <span>CÂU CHUYỆN THÀNH CÔNG</span>
          </div>
          <h2
            className={`text-3xl sm:text-5xl font-bold tracking-tight ${
              theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
            }`}
          >
            Kết nối đúng. Tăng trưởng thật.
          </h2>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl border p-8 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 ${cardBorderClasses[theme]}`}
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 fill-current ${
                        theme === "dark" ? "text-[#D4AF37]" : "text-[#C5A059]"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-sm italic leading-relaxed font-sans mb-6 ${
                    theme === "dark" ? "text-slate-200" : theme === "contrast" ? "text-zinc-800" : "text-[#44403C]"
                  }`}
                >
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20">
                <div
                  className={`text-base font-bold font-serif ${
                    theme === "dark" ? "text-[#D4AF37]" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
                  }`}
                >
                  {t.name}
                </div>
                <div
                  className={`text-xs font-sans mt-0.5 ${
                    theme === "dark" ? "text-slate-400" : "text-[#78716C]"
                  }`}
                >
                  {t.role}
                </div>
                <div
                  className={`inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-bold font-sans ${
                    theme === "dark"
                      ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                      : theme === "contrast"
                      ? "bg-black text-white"
                      : "bg-[#C5A059]/15 text-[#8C653B]"
                  }`}
                >
                  {t.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </LegacyRevealSection>

      {/* =========================================================================
          FOOTER SECTION: SẴN SÀNG MỞ RA NHIỀU CƠ HỘI HƠN?
          ========================================================================= */}
      <footer
        className={`border-t pt-20 pb-16 px-4 sm:px-6 lg:px-8 ${
          theme === "dark"
            ? "border-[#D4AF37]/30 bg-[#040813]"
            : theme === "contrast"
            ? "border-black bg-zinc-100"
            : "border-[#E5DAC8] bg-[#F4EFE6]"
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2
            className={`text-3xl sm:text-5xl font-bold tracking-tight font-serif ${
              theme === "dark" ? "text-white" : theme === "contrast" ? "text-black" : "text-[#1C1917]"
            }`}
          >
            Sẵn sàng mở ra nhiều cơ hội hơn?
          </h2>
          <p
            className={`mt-4 text-base sm:text-lg max-w-2xl mx-auto font-sans ${
              theme === "dark" ? "text-slate-300" : theme === "contrast" ? "text-zinc-800" : "text-[#57534E]"
            }`}
          >
            Hãy để Business Connect đồng hành cùng hiệp hội hoặc doanh nghiệp của bạn.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowDemoModal(true)}
              className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold font-sans uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl ${
                theme === "dark"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  : theme === "contrast"
                  ? "border-2 border-black bg-black text-white"
                  : "bg-gradient-to-r from-[#C5A059] to-[#8C653B] text-white"
              }`}
            >
              <span>Đặt demo ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowDemoModal(true)}
              className={`inline-flex items-center gap-2 rounded-xl border px-7 py-4 text-sm font-bold font-sans transition-all duration-300 hover:opacity-80 ${
                theme === "dark"
                  ? "border-[#D4AF37]/40 bg-[#0A1128] text-[#D4AF37]"
                  : theme === "contrast"
                  ? "border-2 border-black bg-white text-black"
                  : "border-[#D9CDB8] bg-white text-[#1C1917]"
              }`}
            >
              <span>Liên hệ tư vấn</span>
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-sans opacity-70">
            <div>© 2026 VI-ONE Business Connect. All rights reserved.</div>
            <div className="mt-3 sm:mt-0 flex gap-6">
              <a href="#dieu-khoan" className="hover:underline">
                Điều khoản dịch vụ
              </a>
              <a href="#chinh-sach" className="hover:underline">
                Chính sách bảo mật
              </a>
              <a href="#tieu-chuan" className="hover:underline">
                Tiêu chuẩn ISO 27001
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl border p-8 shadow-2xl ${
                theme === "dark" ? "border-[#D4AF37] bg-[#0A1128] text-white" : "border-[#D9CDB8] bg-white text-black"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-serif">Đăng Ký Trải Nghiệm Demo</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Đội ngũ chuyên gia sẽ kết nối và thiết lập kịch bản trong 15 phút
                  </p>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-1.5 rounded-lg border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs font-bold mb-1">Họ và tên *</label>
                  <input
                    required
                    type="text"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full px-4 py-2.5 rounded-xl border bg-black/10 dark:bg-white/5 border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Số điện thoại *</label>
                  <input
                    required
                    type="tel"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    placeholder="VD: 0912 345 678"
                    className="w-full px-4 py-2.5 rounded-xl border bg-black/10 dark:bg-white/5 border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Email doanh nghiệp *</label>
                  <input
                    required
                    type="email"
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    placeholder="VD: ceo@doanhnghiep.vn"
                    className="w-full px-4 py-2.5 rounded-xl border bg-black/10 dark:bg-white/5 border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Hiệp hội / Doanh nghiệp</label>
                  <input
                    type="text"
                    value={demoForm.org}
                    onChange={(e) => setDemoForm({ ...demoForm, org: e.target.value })}
                    placeholder="VD: Hội Doanh nhân Trẻ Hà Nội"
                    className="w-full px-4 py-2.5 rounded-xl border bg-black/10 dark:bg-white/5 border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 mt-4 rounded-xl font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#8C653B] text-black shadow-lg hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Đang gửi thông tin..." : "Xác nhận đăng ký demo"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-2xl border border-[#D4AF37]/50 bg-[#060C1B] p-4 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4AF37]/30 text-[#D4AF37]">
                <span className="font-bold text-sm uppercase tracking-wider">
                  Video Giới Thiệu Nền Tảng Business Connect (2 Phút)
                </span>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  src="/videos/vione-kyc-guide.mp4"
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
