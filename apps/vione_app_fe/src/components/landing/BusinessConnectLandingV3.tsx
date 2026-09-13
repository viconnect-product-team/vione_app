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
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Grid,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type ThemeMode = "light" | "dark" | "contrast";

// =========================================================================
// TECHNICAL GRID BACKGROUND (Vercel / Stripe High-Precision Enterprise)
// =========================================================================
function TechnicalGridBackground({ theme }: { theme: ThemeMode }) {
  if (theme === "contrast") {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-white" />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Precision architectural dot and line grid */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-[#0A0A0A] bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:32px_32px]"
            : "bg-[#FAFAFA] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]"
        }`}
      />
      {/* Subtle top ambient glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-[140px] pointer-events-none ${
          theme === "dark" ? "bg-gradient-to-b from-orange-500/10 via-purple-500/5 to-transparent" : "bg-gradient-to-b from-slate-200/50 to-transparent"
        }`}
      />
    </div>
  );
}

// 5 PROBLEMS - PART 1 EXACT
const PROBLEMS_DATA = [
  {
    num: "01",
    title: "Thông tin phân tán",
    desc: "Khó tìm đúng người trong mạng lưới do dữ liệu lưu trữ rải rác trên danh bạ, Zalo và nhiều file Excel rời rạc.",
  },
  {
    num: "02",
    title: "Khó duy trì quan hệ",
    desc: "Thiếu công cụ nhắc nhở và theo dõi tương tác, khiến sợi dây liên kết giữa các thành viên dần nguội lạnh.",
  },
  {
    num: "03",
    title: "Bỏ lỡ cơ hội",
    desc: "Không kịp nắm bắt cơ hội phù hợp khi hội viên có nhu cầu hợp tác hoặc cung ứng dịch vụ cấp thiết.",
  },
  {
    num: "04",
    title: "Thiếu kết nối thực chất",
    desc: "Nhiều sự kiện nhưng khó tạo giá trị sau sự kiện, giao lưu xã giao bề nổi thiếu cơ chế xúc tiến 1-on-1.",
  },
  {
    num: "05",
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

export function BusinessConnectLandingV3() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoName, setDemoName] = useState("");
  const [demoOrg, setDemoOrg] = useState("");

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

  // Theme styling helpers
  const themeClasses = {
    light: "bg-[#FAFAFA] text-[#0A0A0A]",
    dark: "bg-[#0A0A0A] text-[#EDEDED] dark",
    contrast: "bg-white text-black contrast",
  };

  const cardClasses = {
    light: "bg-white border border-neutral-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition-all",
    dark: "bg-[#141414] border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.1)] hover:border-orange-500/40 hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,0.2)] transition-all",
    contrast: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] transition-all",
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 relative overflow-x-hidden ${themeClasses[theme]}`}>
      <TechnicalGridBackground theme={theme} />

      {/* ========================================================================= */}
      {/* 1. HEADER (PART 1 EXACT) */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        theme === "dark" ? "bg-[#0A0A0A]/90 border-neutral-800" : theme === "contrast" ? "bg-white border-b-2 border-black" : "bg-white/90 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/business-connect/v3" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xl rounded-none border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                V3
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight block">BUSINESS CONNECT</span>
                <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-mono">Premium Editorial</span>
              </div>
            </Link>

            {/* Navigation links - Part 1 exact */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold tracking-wide">
              <a href="#giai-phap" className="hover:text-orange-500 transition-colors">Giải pháp</a>
              <a href="#khach-hang" className="hover:text-orange-500 transition-colors">Khách hàng</a>
              <a href="#cau-chuyen" className="hover:text-orange-500 transition-colors">Câu chuyện</a>
              <a href="#bang-gia" className="hover:text-orange-500 transition-colors">Bảng giá</a>
              <a href="#tai-nguyen" className="hover:text-orange-500 transition-colors">Tài nguyên</a>
              <a href="#ve-chung-toi" className="hover:text-orange-500 transition-colors">Về chúng tôi</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* 3 Themes Switcher */}
            <div className={`flex items-center p-1 border ${
              theme === "dark" ? "border-neutral-800 bg-neutral-900" : "border-neutral-300 bg-neutral-100"
            }`}>
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "light" ? "bg-white text-black shadow-sm" : "text-neutral-500"}`}
                title="Light Mode (Stripe White)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "dark" ? "bg-orange-500 text-black shadow-sm" : "text-neutral-500"}`}
                title="Dark Mode (Vercel Obsidian)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("contrast")}
                className={`p-1.5 text-xs font-bold transition-all ${theme === "contrast" ? "bg-black text-white" : "text-neutral-500"}`}
                title="High Contrast (Corporate Brutalism)"
              >
                <Contrast className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              to="/auth"
              className="text-sm font-bold px-4 py-2 hover:opacity-80 transition-opacity hidden sm:inline-block"
            >
              Đăng nhập
            </Link>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold text-sm tracking-wide border border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(249,115,22,0.8)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(249,115,22,0.8)] transition-all flex items-center gap-2"
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
      <section className="relative z-10 py-24 md:py-32 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-200/70 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold tracking-widest uppercase mb-6"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-none inline-block animate-pulse" />
              NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] uppercase mb-8"
            >
              Hiểu đúng người. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600">
                Mở ra cơ hội thật.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed mb-10 max-w-3xl"
            >
              Business Connect giúp các hiệp hội, tổ chức và doanh nhân quản lý mối quan hệ, kết nối đúng người, đúng thời điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4 mb-16"
            >
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-extrabold text-base tracking-wide border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#f97316] hover:shadow-[2px_2px_0px_0px_#f97316] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-3"
              >
                <span>Đặt demo ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => toast.info("Video giới thiệu 2 phút dành riêng cho Lãnh đạo Doanh nghiệp đang được tải.")}
                className="px-7 py-4 bg-transparent border-2 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white font-bold text-base tracking-wide flex items-center gap-3 transition-colors"
              >
                <Play className="w-4 h-4 fill-current text-orange-500" />
                <span>Xem video (2 phút)</span>
              </button>
            </motion.div>

            {/* 4 Stats - Part 1 exact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-orange-500">10,000+</div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Doanh nhân & Hội viên</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-neutral-900 dark:text-neutral-100">300+</div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Hiệp hội & Tổ chức</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-neutral-900 dark:text-neutral-100">50,000+</div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Kết nối được tạo</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-neutral-900 dark:text-neutral-100">20+</div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Quốc gia & vùng lãnh thổ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM SECTION (PART 1 EXACT - 5 CARDS) */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-24 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase block mb-3">
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
                transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                className={`p-6 flex flex-col justify-between ${cardClasses[theme]}`}
              >
                <div>
                  <div className="font-mono text-2xl font-black text-neutral-400 mb-4">{p.num}</div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-3 text-neutral-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold text-orange-500 flex items-center gap-1">
                  <span>THÁCH THỨC B2B</span>
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
      <section id="giai-phap" className="relative z-10 py-24 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase block mb-3">
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
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400 transition-colors whitespace-nowrap"
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
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
                  className={`p-8 group ${cardClasses[theme]}`}
                >
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-6 text-neutral-900 dark:text-white group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3">
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
      <section className="relative z-10 py-24 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`p-10 md:p-16 border ${
            theme === "dark" ? "bg-[#111111] border-neutral-800" : theme === "contrast" ? "bg-white border-2 border-black" : "bg-neutral-100 border-neutral-300"
          }`}>
            <span className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase block mb-3">
              HỆ SINH THÁI KẾT NỐI KINH DOANH
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase mb-6">
              Cùng nhau tạo ra giá trị lớn hơn
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl leading-relaxed mb-8">
              Business Connect kết nối hội viên, hiệp hội, doanh nghiệp, chuyên gia, đối tác, nhà đầu tư và các tổ chức quốc tế trong một hệ sinh thái mở, để cùng chia sẻ tri thức, nguồn lực và cơ hội kinh doanh.
            </p>

            <div className="p-6 bg-black dark:bg-neutral-900 text-white border border-neutral-800 mb-8 inline-block shadow-[4px_4px_0px_0px_#f97316]">
              <div className="text-sm md:text-base font-black tracking-widest uppercase text-orange-400">
                NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-3 bg-orange-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-orange-600 transition-colors"
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
      <section id="khach-hang" className="relative z-10 py-24 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header 1 & Logos */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase block mb-2">
                ĐƯỢC TIN TƯỞNG BỞI CÁC HIỆP HỘI VÀ DOANH NGHIỆP
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                Những tổ chức tiên phong đã lựa chọn
              </h3>
            </div>
            <a href="#tat-ca-khach-hang" className="text-sm font-bold text-orange-500 hover:underline flex items-center gap-1">
              <span>Xem tất cả khách hàng</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
            {CLIENT_LOGOS.map((name) => (
              <div
                key={name}
                className={`p-6 flex items-center justify-center text-center font-bold text-xs uppercase tracking-wider border ${
                  theme === "dark" ? "border-neutral-800 bg-neutral-900/60 text-neutral-400" : "border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Header 2 & 3 Reviews */}
          <div id="cau-chuyen" className="mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase block mb-2">
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
                className={`p-8 flex flex-col justify-between ${cardClasses[theme]}`}
              >
                <div>
                  <div className="inline-block px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono font-bold tracking-wider uppercase mb-6 text-orange-500">
                    {t.badge}
                  </div>
                  <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed italic mb-8">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-tight">
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
      <footer className="relative z-10 py-24 bg-neutral-950 text-white border-t border-neutral-800">
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
                className="px-8 py-4 bg-orange-500 text-black font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_#ffffff] hover:bg-orange-400 hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-3"
              >
                <span>Đặt demo ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 bg-transparent border-2 border-neutral-700 hover:border-white font-bold text-base uppercase tracking-wider text-white transition-colors"
              >
                Liên hệ tư vấn
              </button>
            </div>

            <div className="pt-10 border-t border-neutral-800 text-xs font-mono text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>© 2026 VIONE B2B PLATFORM. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.</div>
              <div className="flex items-center gap-6">
                <span>ISO 27001 BẢO MẬT</span>
                <span>ENTERPRISE SLA 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* DEMO MODAL */}
      {/* ========================================================================= */}
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
              className="relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-700 p-8 text-white shadow-[8px_8px_0px_0px_#f97316]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Đăng Ký Đặt Lịch Demo</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-1">Dành riêng cho Lãnh đạo Hiệp hội & Doanh nghiệp</p>
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
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 text-sm focus:border-orange-500 focus:outline-none"
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
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 text-sm focus:border-orange-500 focus:outline-none"
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
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-orange-500 text-black font-black uppercase tracking-wider text-sm hover:bg-orange-400 transition-colors shadow-[4px_4px_0px_0px_#ffffff]"
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
