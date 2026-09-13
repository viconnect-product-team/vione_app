import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  X,
  Sun,
  Moon,
  Contrast,
  Users,
  Building2,
  TrendingUp,
  Globe2,
  Calendar,
  Layers,
  BookOpen,
  BarChart3,
  Bot,
  Share2,
  ChevronRight,
  Shield,
  Award,
} from "lucide-react";
import { toast } from "sonner";

type ThemeMode = "light" | "dark" | "contrast";

// =========================================================================
// MONUMENT 3D GEOMETRIC BACKGROUND (Architectural Monument Structure)
// =========================================================================
function CorporateMonumentBackground({ theme }: { theme: ThemeMode }) {
  if (theme === "contrast") {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-white" />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Background tone: Marble/Sand Light or Obsidian Dark */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-[#0C0D0E] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0C0D0E] to-black"
            : "bg-[#F7F5F0] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/30 via-[#F7F5F0] to-[#EFECE6]"
        }`}
      />

      {/* Subtle slow rotating geometric polyhedral wireframe */}
      <svg
        className={`absolute -top-32 -right-32 w-[600px] h-[600px] ${
          theme === "dark" ? "text-amber-600/10" : "text-amber-800/10"
        } animate-[spin_120s_linear_infinite]`}
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      >
        <polygon points="100,10 190,60 190,140 100,190 10,140 10,60" />
        <polygon points="100,30 170,70 170,130 100,170 30,130 30,70" />
        <line x1="100" y1="10" x2="100" y2="190" />
        <line x1="10" y1="60" x2="190" y2="140" />
        <line x1="10" y1="140" x2="190" y2="60" />
      </svg>
    </div>
  );
}

// 5 PROBLEMS - PART 1 EXACT
const PROBLEMS_DATA = [
  {
    num: "I",
    title: "Thông tin phân tán",
    desc: "Khó tìm đúng người trong mạng lưới do dữ liệu lưu trữ rải rác trên danh bạ, Zalo và nhiều file Excel rời rạc.",
  },
  {
    num: "II",
    title: "Khó duy trì quan hệ",
    desc: "Thiếu công cụ nhắc nhở và theo dõi tương tác, khiến sợi dây liên kết giữa các thành viên dần nguội lạnh.",
  },
  {
    num: "III",
    title: "Bỏ lỡ cơ hội",
    desc: "Không kịp nắm bắt cơ hội phù hợp khi hội viên có nhu cầu hợp tác hoặc cung ứng dịch vụ cấp thiết.",
  },
  {
    num: "IV",
    title: "Thiếu kết nối thực chất",
    desc: "Nhiều sự kiện nhưng khó tạo giá trị sau sự kiện, giao lưu xã giao bề nổi thiếu cơ chế xúc tiến 1-on-1.",
  },
  {
    num: "V",
    title: "Khó đo lường hiệu quả",
    desc: "Không biết mối quan hệ mang lại giá trị gì, thiếu hệ thống số hóa ghi nhận doanh thu và cơ hội giao thương.",
  },
];

// 9 SOLUTIONS - PART 1 EXACT
const SOLUTIONS_DATA = [
  {
    icon: Users,
    title: "Quản lý hội viên",
    desc: "Hồ sơ 360°, phân nhóm thông minh, tra cứu nhanh năng lực doanh nghiệp và ban điều hành.",
  },
  {
    icon: Layers,
    title: "CRM & Quan hệ",
    desc: "Theo dõi lịch sử, ghi chú, nhắc nhở tương tác và quản lý mức độ gắn kết bền chặt.",
  },
  {
    icon: TrendingUp,
    title: "Cơ hội kinh doanh",
    desc: "Quản lý pipeline, matching thông minh, ghi nhận lời cảm ơn doanh thu và đo lường thành công.",
  },
  {
    icon: Calendar,
    title: "Sự kiện",
    desc: "Tổ chức, quản lý, kết nối trước - trong - sau sự kiện, check-in QR siêu tốc và sơ đồ chỗ ngồi VIP.",
  },
  {
    icon: Building2,
    title: "Cộng đồng & Nhóm",
    desc: "Không gian kết nối theo ngành, chủ đề chuyên sâu, phân ban chuyên môn và câu lạc bộ trực thuộc.",
  },
  {
    icon: BookOpen,
    title: "Tri thức & Nội dung",
    desc: "Chia sẻ chuyên gia, tài liệu hội thảo, thư viện biểu mẫu pháp lý và bản tin kinh tế độc quyền.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & Phân tích",
    desc: "Đo lường hiệu quả kết nối và ROI mạng lưới, bảng điều khiển KPI giao thương hiệp hội minh bạch.",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Tìm kiếm thông minh, gợi ý kết nối chuẩn xác theo ngành nghề và tóm tắt biên bản họp tự động.",
  },
  {
    icon: Share2,
    title: "Tích hợp & Mở rộng",
    desc: "Kết nối liền mạch với hệ thống khác CRM, email marketing, calendar và hóa đơn điện tử VAT.",
  },
];

const CLIENT_LOGOS = [
  "VCCI",
  "AmCham",
  "EuroCham",
  "KoCham",
  "Singapore Business Federation",
  "AusCham",
];

const TESTIMONIALS_DATA = [
  {
    quote: "Business Connect giúp Hiệp hội Du lịch chuyển đổi số toàn diện. Việc kết nối giữa hơn 1,200 doanh nghiệp hội viên diễn ra chuẩn xác và tạo ra doanh thu thực tế rõ rệt.",
    author: "Nguyễn Thị Lan",
    role: "Chủ tịch Hiệp hội Du lịch VN",
    badge: "1,200+ Hội viên",
  },
  {
    quote: "Hệ thống CRM và matching cơ hội kinh doanh giúp công ty tôi tìm được đúng các đối tác cung ứng tin cậy trong các hiệp hội công nghiệp lớn chỉ trong vài tuần.",
    author: "Trần Minh Quân",
    role: "CEO, Công ty Sản xuất Việt",
    badge: "Doanh nghiệp Tiêu biểu",
  },
  {
    quote: "Tôi tiết kiệm được 80% thời gian mở rộng quan hệ. Thay vì phát danh thiếp giấy tràn lan, Business Connect trao đúng giá trị cho đúng người lãnh đạo cần gặp.",
    author: "Lê Hoàng Anh",
    role: "Doanh nhân, Hội viên VIP",
    badge: "Hội viên VIP",
  },
];

export function BusinessConnectLandingV6() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isDoorClosing, setIsDoorClosing] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoName, setDemoName] = useState("");
  const [demoOrg, setDemoOrg] = useState("");

  const handleSetThemeWithDoor = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    setIsDoorClosing(true);
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => {
        setIsDoorClosing(false);
      }, 600);
    }, 600);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail) {
      toast.error("Vui lòng nhập email doanh nghiệp!");
      return;
    }
    toast.success("Đặt lịch demo thành công! Ban tư vấn cấp cao ViOne sẽ liên hệ trong 15 phút.");
    setIsDemoModalOpen(false);
    setDemoEmail("");
    setDemoName("");
    setDemoOrg("");
  };

  const stoneCardClasses = {
    light: "bg-[#FFFFFF] border border-[#E2DDD5] shadow-[0_12px_24px_-8px_rgba(180,140,80,0.12)] hover:shadow-[0_20px_35px_-8px_rgba(180,140,80,0.2)] transition-all duration-300",
    dark: "bg-[#141618] border border-amber-900/30 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)] hover:border-amber-600/50 hover:shadow-[0_20px_35px_-8px_rgba(217,119,6,0.15)] transition-all duration-300",
    contrast: "bg-white border-2 border-black shadow-none",
  };

  const accentColor = {
    light: "text-amber-800",
    dark: "text-amber-400",
    contrast: "text-black",
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative ${
      theme === "dark" ? "bg-[#0C0D0E] text-[#EDEDED]" : theme === "contrast" ? "bg-white text-black" : "bg-[#F7F5F0] text-[#1C1D1F]"
    }`}>
      {/* Stone Monument Door Sliding Transition */}
      <AnimatePresence>
        {isDoorClosing && (
          <div className="fixed inset-0 z-[999999] pointer-events-none flex">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
              className="w-1/2 h-full bg-[#1A1816] border-r-2 border-amber-600/40 shadow-2xl flex items-center justify-end pr-8"
            >
              <div className="w-1 h-32 bg-amber-600/60 rounded-full" />
            </motion.div>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
              className="w-1/2 h-full bg-[#1A1816] border-l-2 border-amber-600/40 shadow-2xl flex items-center justify-start pl-8"
            >
              <div className="w-1 h-32 bg-amber-600/60 rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CorporateMonumentBackground theme={theme} />

      {/* ========================================================================= */}
      {/* 1. HEADER (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        theme === "dark" ? "bg-[#0C0D0E]/90 border-amber-900/30" : theme === "contrast" ? "bg-white border-b-2 border-black" : "bg-[#F7F5F0]/90 border-[#E2DDD5]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/business-connect/v6" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 text-black flex items-center justify-center font-black text-lg tracking-tighter shadow-md">
                V6
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight block">BUSINESS CONNECT</span>
                <span className={`text-[10px] tracking-widest uppercase font-semibold ${accentColor[theme]}`}>Corporate Monument</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold tracking-wide">
              <a href="#giai-phap" className="hover:text-amber-500 transition-colors">Giải pháp</a>
              <a href="#khach-hang" className="hover:text-amber-500 transition-colors">Khách hàng</a>
              <a href="#cau-chuyen" className="hover:text-amber-500 transition-colors">Câu chuyện</a>
              <a href="#bang-gia" className="hover:text-amber-500 transition-colors">Bảng giá</a>
              <a href="#tai-nguyen" className="hover:text-amber-500 transition-colors">Tài nguyên</a>
              <a href="#ve-chung-toi" className="hover:text-amber-500 transition-colors">Về chúng tôi</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher with signature door trigger */}
            <div className={`flex items-center p-1 border ${
              theme === "dark" ? "border-amber-900/40 bg-[#16181A]" : "border-[#E2DDD5] bg-[#EFECE6]"
            }`}>
              <button
                onClick={() => handleSetThemeWithDoor("light")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "light" ? "bg-[#FFFFFF] text-black shadow-sm" : "text-neutral-500"}`}
                title="Marble White / Sand Warm"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSetThemeWithDoor("dark")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "dark" ? "bg-amber-600 text-black shadow-sm" : "text-neutral-500"}`}
                title="Obsidian Dark / Bronze"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSetThemeWithDoor("contrast")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "contrast" ? "bg-black text-white" : "text-neutral-500"}`}
                title="High Contrast Brutalism"
              >
                <Contrast className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/auth"
              className="text-sm font-bold px-3 py-2 hover:opacity-80 transition-opacity hidden sm:inline-block"
            >
              Đăng nhập
            </Link>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-2.5 bg-amber-600 text-black font-extrabold text-sm tracking-wide uppercase hover:bg-amber-500 transition-colors flex items-center gap-2"
            >
              <span>Đặt demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-24 md:py-32 border-b border-amber-900/20 dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1 border text-xs font-mono font-bold tracking-widest uppercase mb-6 ${
                theme === "dark" ? "border-amber-700/40 bg-amber-950/20 text-amber-400" : "border-amber-800/20 bg-amber-100/40 text-amber-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] uppercase mb-8"
            >
              Hiểu đúng người. <br />
              <span className="text-amber-500">
                Mở ra cơ hội thật.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed mb-10 max-w-3xl"
            >
              Business Connect giúp các hiệp hội, tổ chức và doanh nhân quản lý mối quan hệ, kết nối đúng người, đúng thời điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-16"
            >
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-amber-600 text-black font-extrabold text-base tracking-wide uppercase hover:bg-amber-500 transition-colors flex items-center gap-3 shadow-lg shadow-amber-600/20"
              >
                <span>Đặt demo ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => toast.info("Video giới thiệu 2 phút đang được khởi chiếu.")}
                className="px-7 py-4 border border-neutral-400 dark:border-neutral-700 hover:border-amber-500 font-bold text-base tracking-wide uppercase flex items-center gap-3 transition-colors"
              >
                <Play className="w-4 h-4 fill-current text-amber-500" />
                <span>Xem video (2 phút)</span>
              </button>
            </motion.div>

            {/* 4 Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-amber-900/20 dark:border-amber-900/30">
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-500">10,000+</div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500 font-bold mt-1">Doanh nhân & Hội viên</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">300+</div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500 font-bold mt-1">Hiệp hội & Tổ chức</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">50,000+</div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500 font-bold mt-1">Kết nối được tạo</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">20+</div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500 font-bold mt-1">Quốc gia & vùng lãnh thổ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM SECTION (PART 1 EXACT - 5 CARDS) */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-24 border-b border-amber-900/20 dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase block mb-3">
              NHIỀU TỔ CHỨC VẪN ĐANG GẶP NHỮNG VẤN ĐỀ NÀY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase max-w-2xl">
              Quản lý quan hệ kinh doanh vẫn còn nhiều thách thức
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PROBLEMS_DATA.map((p, idx) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-6 flex flex-col justify-between ${stoneCardClasses[theme]}`}
              >
                <div>
                  <div className="font-mono text-xl font-black text-amber-500 mb-3">{p.num}</div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                  <span>THÁCH THỨC VẬN HÀNH</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SOLUTION SECTION (PART 1 EXACT - 9 CARDS) */}
      {/* ========================================================================= */}
      <section id="giai-phap" className="relative z-10 py-24 border-b border-amber-900/20 dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase block mb-3">
                GIẢI PHÁP BUSINESS CONNECT
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
                Quản lý kết nối. Tạo ra cơ hội.
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mt-4 max-w-3xl leading-relaxed">
                Một nền tảng toàn diện giúp hiệp hội, tổ chức và doanh nhân hiểu khách hàng, kết nối đúng người, xây dựng quan hệ bền vững và biến mối quan hệ thành cơ hội kinh doanh thực chất.
              </p>
            </div>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase text-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <span>Khám phá tính năng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS_DATA.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <motion.div
                  key={sol.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`p-8 group ${stoneCardClasses[theme]}`}
                >
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-500 group-hover:bg-amber-600 group-hover:text-black transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-3">
                    {sol.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {sol.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ECOSYSTEM SECTION (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-24 border-b border-amber-900/20 dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`p-10 md:p-16 border ${
            theme === "dark" ? "bg-[#141618] border-amber-900/40" : theme === "contrast" ? "bg-white border-2 border-black" : "bg-white border-[#E2DDD5]"
          }`}>
            <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase block mb-3">
              HỆ SINH THÁI KẾT NỐI KINH DOANH
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase mb-6">
              Cùng nhau tạo ra giá trị lớn hơn
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl leading-relaxed mb-8">
              Business Connect kết nối hội viên, hiệp hội, doanh nghiệp, chuyên gia, đối tác, nhà đầu tư và các tổ chức quốc tế trong một hệ sinh thái mở, để cùng chia sẻ tri thức, nguồn lực và cơ hội kinh doanh.
            </p>

            <div className="p-6 bg-amber-950/40 border border-amber-700/50 mb-8 inline-block">
              <div className="text-sm md:text-base font-black tracking-widest uppercase text-amber-400">
                NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-3.5 bg-amber-600 text-black font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-amber-500 transition-colors"
              >
                <span>Xem hệ sinh thái</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLIENT & TESTIMONIAL SECTION (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <section id="khach-hang" className="relative z-10 py-24 border-b border-amber-900/20 dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase block mb-2">
                ĐƯỢC TIN TƯỞNG BỞI CÁC HIỆP HỘI VÀ DOANH NGHIỆP
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                Những tổ chức tiên phong đã lựa chọn
              </h3>
            </div>
            <a href="#tat-ca-khach-hang" className="text-sm font-bold text-amber-500 hover:underline flex items-center gap-1">
              <span>Xem tất cả khách hàng</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
            {CLIENT_LOGOS.map((name) => (
              <div
                key={name}
                className={`p-6 flex items-center justify-center text-center font-bold text-xs uppercase tracking-wider border ${
                  theme === "dark" ? "border-amber-900/30 bg-[#16181A] text-neutral-300" : "border-[#E2DDD5] bg-white text-neutral-800"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Header 2 & 3 Reviews */}
          <div id="cau-chuyen" className="mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase block mb-2">
              CÂU CHUYỆN THÀNH CÔNG
            </span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Kết nối đúng. Tăng trưởng thật.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.map((t) => (
              <div
                key={t.author}
                className={`p-8 flex flex-col justify-between ${stoneCardClasses[theme]}`}
              >
                <div>
                  <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-mono font-bold uppercase mb-6">
                    {t.badge}
                  </div>
                  <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed italic mb-8">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="font-extrabold text-base uppercase tracking-tight">
                    {t.author}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <footer className="relative z-10 py-24 bg-[#080809] text-white border-t border-amber-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase mb-6">
              Sẵn sàng mở ra nhiều cơ hội hơn?
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hãy để Business Connect đồng hành cùng hiệp hội hoặc doanh nghiệp của bạn.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-amber-600 text-black font-black text-base uppercase tracking-wider hover:bg-amber-500 transition-colors flex items-center gap-3 shadow-lg shadow-amber-600/30"
              >
                <span>Đặt demo ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-transparent border border-neutral-700 hover:border-amber-500 font-bold text-base uppercase tracking-wider text-white transition-colors"
              >
                Liên hệ tư vấn
              </button>
            </div>

            <div className="pt-10 border-t border-neutral-800 text-xs font-mono text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>© 2026 VIONE B2B PLATFORM. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.</div>
              <div className="flex items-center gap-6">
                <span>KIẾN TRÚC BẢO MẬT ĐẲNG CẤP</span>
                <span>ENTERPRISE SLA 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDemoModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-[#141618] border border-amber-800/50 p-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-amber-900/30 pb-4">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Đăng Ký Đặt Lịch Demo</h3>
                  <p className="text-xs text-amber-500/80 font-mono mt-1">Dành riêng cho Lãnh đạo Hiệp hội & Doanh nghiệp</p>
                </div>
                <button
                  onClick={() => setIsDemoModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-[#0C0D0E] border border-amber-900/40 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">Email doanh nghiệp</label>
                  <input
                    type="email"
                    required
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="ceo@enterprise.com"
                    className="w-full px-4 py-3 bg-[#0C0D0E] border border-amber-900/40 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">Tên Hiệp hội / Doanh nghiệp</label>
                  <input
                    type="text"
                    required
                    value={demoOrg}
                    onChange={(e) => setDemoOrg(e.target.value)}
                    placeholder="Hiệp hội Doanh nghiệp TP.HCM"
                    className="w-full px-4 py-3 bg-[#0C0D0E] border border-amber-900/40 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-600 text-black font-black uppercase tracking-wider text-sm hover:bg-amber-500 transition-colors shadow-md"
                  >
                    Xác nhận đặt demo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
