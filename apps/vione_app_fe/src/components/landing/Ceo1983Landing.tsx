import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { LangSwitcher } from "@/components/LangSwitcher";
import { LandingInteractiveShowcase } from "./LandingInteractiveShowcase";
import { submitClubApplication } from "@/lib/club-application.functions";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Sparkles,
  Smartphone,
  Wallet,
  Zap,
  Crown,
  CheckCircle2,
  X,
  ShieldCheck,
  Users,
  TrendingUp,
  BarChart3,
  Building2,
  Globe2,
  Handshake,
  GraduationCap,
  Coins,
  Menu,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Award,
  Radio,
  Sun,
  Moon,
  Contrast,
  Flame,
  BadgeCheck,
  Compass,
  Volume2,
  Lock,
  Activity,
  Check,
  Film,
  Play,
  Pause,
  VolumeX,
} from "lucide-react";

type ThemeMode = "dark" | "light" | "contrast";

/** 3D Page Turn / Theatrical Curtain Unveil Scroll Transition Wrapper */
function SectionFlip3D({
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

  // Dramatic 3D page curl & theatrical curtain reveal curve
  const rotateX = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [10, 0, 0, -8]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.93, 1, 1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.45, 1, 1, 0.55]);
  const y = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [80, 0, 0, -60]);
  const curtainGlow = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 0.8, 0, 0, 0]);

  return (
    <div
      ref={ref}
      id={id}
      style={{ perspective: "2200px", perspectiveOrigin: "50% 30%" }}
      className={`relative w-full ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y,
          transformStyle: "preserve-3d",
          transformOrigin: "center top",
        }}
        className="w-full h-full will-change-transform"
      >
        {/* Dynamic Sweeping Specular Gold Rim as Curtain Unveils */}
        <motion.div
          style={{ opacity: curtainGlow }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent pointer-events-none z-30 shadow-[0_0_25px_rgba(216,178,130,0.8)]"
        />
        {children}
      </motion.div>
    </div>
  );
}

/** Section sliding in from left to center on scroll */
function SectionSlideLeft({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div id={id} className={`relative w-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -90, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Section sliding in from right to center on scroll */
function SectionSlideRight({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div id={id} className={`relative w-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: 90, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

const PageTurnSection = SectionFlip3D;

/** Concise Multi-Language Dictionary for CEO 1983 Landing */
const CEO1983_I18N = {
  vi: {
    navBadge: "HIỆP HỘI DOANH NGHIỆP",
    navVip: "VIP PASS",
    navLeadership: "Ban Lãnh Đạo",
    navTimeline: "Tòa Tháp Cột Mốc",
    navEcosystem: "Quỹ Đạo Hệ Sinh Thái",
    navCore: "Giá Trị Cốt Lõi",
    navRoadmap: "Gia Nhập VIP",
    navJoin: "GIA NHẬP CLB VIP →",
    modeDark: "Tối",
    modeLight: "Sáng",
    modeContrast: "Tương phản",

    // Hero
    heroHanoiba: "★ TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)",
    heroTitle1: "LIÊN MINH DOANH NHÂN 1983",
    heroTitle2: "HỘI TỤ ĐỈNH CAO —",
    heroTitle3: "GIAO THƯƠNG THỰC CHẤT",
    heroDesc:
      "Vòng tròn kết nối độc bản giữa 200+ Chủ tịch & CEO sinh năm 1983 (Quý Hợi). Mở khóa chuỗi cung ứng khép kín >5.000 Tỷ VNĐ và bứt phá ở đỉnh cao sự nghiệp.",
    heroJoinBtn: "ĐĂNG KÝ GIA NHẬP CLB VIP →",
    heroOpenApp: "Mở Cổng Hội Viên App",
    heroWatchVideo: "Xem Video (2 phút)",

    // Card VIP
    cardVipPass: "TITANIUM VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "DOANH NHÂN QUÝ HỢI",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet Ready",
    cardTapHint: "CHẠM ĐỂ XEM MẶT SAU ↺",

    // Stats
    stat1Num: "200+",
    stat1Title: "CEO Đồng Niên",
    stat1Desc: "Chủ tịch & TGĐ đã thẩm định",
    stat2Num: ">5.000 Tỷ",
    stat2Title: "VND Giao Thương",
    stat2Desc: "Chuỗi cung ứng khép kín",
    stat3Num: "+35%",
    stat3Title: "Tăng Trưởng B2B",
    stat3Desc: "Ưu đãi đặc quyền nội bộ",
    stat4Num: "100%",
    stat4Title: "Thẩm Định Minh Bạch",
    stat4Desc: "Bảo chứng uy tín C-Level",

    // Section 2: Leadership
    leadTag: "GƯƠNG MẶT ĐẦU TÀU NHIỆM KỲ 2025 - 2028",
    leadTitle: "Ban Lãnh Đạo & Cố Vấn Chiến Lược",
    leadDesc:
      "Những thuyền trưởng bản lĩnh dẫn dắt liên minh doanh nghiệp 1983 kiến tạo chuẩn mực giao thương và chia sẻ giá trị bền vững.",
    leadHint: "Chạm vào bong bóng avatar nổi trên sóng để xem hồ sơ chiến lược",

    // Section 3: Timeline & Skyscraper Skyline
    timeTag: "HÀNH TRÌNH BỨT PHÁ & TẦM NHÌN SKYLINE",
    timeTitle: "Tòa Tháp Tăng Trưởng CEO 1983",
    timeDesc:
      "Từ liên minh đồng niên thành lập năm 2021 đến chuỗi giao thương nghìn tỷ và kỷ nguyên chuyển đổi số toàn diện.",

    // Section 4: Ecosystem
    ecoTag: "HỆ SINH THÁI DOANH NHÂN 1983",
    ecoTitle1: "Cùng Nhau Tạo Ra Giá Trị Lớn Hơn",
    ecoDesc:
      "CLB Doanh Nhân CEO 1983 kết nối hội viên, hiệp hội doanh nghiệp, chuyên gia, đối tác, nhà đầu tư và các tổ chức uy tín trong một hệ sinh thái mở, để cùng chia sẻ tri thức, nguồn lực và cơ hội kinh doanh bền vững.",
    ecoBtn: "Xem hệ sinh thái →",
    ecoRight1: "NHIỀU KẾT NỐI HƠN",
    ecoRight2: "NHIỀU CƠ HỘI HƠN",
    ecoRight3: "NHIỀU GIÁ TRỊ HƠN",

    // Section 5: Core Values & Admission
    coreTag: "TÔN CHỈ HOẠT ĐỘNG",
    coreTitle: "4 Giá Trị Cốt Lõi Đồng Niên",
    coreDesc:
      "Những nguyên tắc nền tảng xây dựng môi trường doanh nhân chân thành, tin cậy và bền vững.",

    roadmapTag: "QUY TRÌNH XÉT DUYỆT BẢO MẬT",
    roadmapTitle: "4 Bước Nhận Thẻ VIP Pass",

    ctaBoxTag: "ĐẶC QUYỀN DOANH NHÂN QUÝ HỢI",
    ctaBoxTitle1: "Đừng Để Doanh Nghiệp Của Bạn",
    ctaBoxTitle2: "Đơn Độc Giữa Biển Lớn",
    ctaBoxDesc:
      "Gia nhập mạng lưới 200+ Chủ tịch & CEO 1983 uy tín. Nhận thẻ Titanium NFC và kết nối thương vụ nghìn tỷ ngay hôm nay.",
    ctaBoxBtn: "NỘP HỒ SƠ XÉT DUYỆT VIP NGAY →",

    footerCopy: "CLB Doanh Nhân CEO 1983 • Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA). Nền tảng kết nối tinh hoa doanh nhân Lợn Vàng 1983.",

    modalTitle: "Đăng Ký Gia Nhập CLB CEO 1983",
    modalSubtitle: "Dành riêng cho Chủ tịch, Nhà sáng lập & C-Level sinh năm 1983 (Quý Hợi)",
    formName: "Họ và Tên *",
    formNamePlh: "Ví dụ: Lê Hoàng Long",
    formPhone: "Số điện thoại / Zalo *",
    formPhonePlh: "0912 345 678",
    formCompany: "Doanh Nghiệp & Chức Danh *",
    formCompanyPlh: "Ví dụ: Chủ tịch HĐQT - Công ty Cổ phần ABC",
    formRevenue: "Doanh thu năm gần nhất",
    formRev1: "Dưới 10 Tỷ VNĐ",
    formRev2: "10 - 50 Tỷ VNĐ",
    formRev3: "50 - 200 Tỷ VNĐ",
    formRev4: "Trên 200 Tỷ VNĐ",
    formIndustry: "Lĩnh vực kinh doanh *",
    formIndustryPlh: "Ví dụ: Công nghệ, Bất động sản, Sản xuất...",
    formSubmit: "GỬI HỒ SƠ XÉT DUYỆT NGAY →",
    formSubmitting: "Đang gửi hồ sơ...",
    formSuccessTitle: "Nộp Hồ Sơ Thành Công!",
    formSuccessDesc: "Ban Thư Ký CLB CEO 1983 sẽ liên hệ thẩm định trong vòng 24 giờ làm việc.",
  },
  en: {
    navBadge: "ENTERPRISE ALLIANCE",
    navVip: "VIP PASS",
    navLeadership: "Executive Board",
    navTimeline: "Milestone Skyline",
    navEcosystem: "Business Constellation",
    navCore: "Core Values",
    navRoadmap: "VIP Admission",
    navJoin: "JOIN VIP ALLIANCE →",
    modeDark: "Dark",
    modeLight: "Light",
    modeContrast: "Contrast",

    heroHanoiba: "★ AFFILIATED WITH HANOI YOUNG BUSINESS ASSOCIATION (HANOIBA)",
    heroTitle1: "1983 EXECUTIVE ALLIANCE",
    heroTitle2: "PEER EXCELLENCE —",
    heroTitle3: "HIGH-VALUE B2B COMMERCE",
    heroDesc:
      "An exclusive inner circle of 200+ Chairs & CEOs born in 1983. Unlocking a $200M+ closed-loop supply chain at career peak.",
    heroJoinBtn: "APPLY FOR VIP MEMBERSHIP →",
    heroOpenApp: "Open Member App Portal",
    heroWatchVideo: "Watch Video (2 mins)",

    cardVipPass: "TITANIUM VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "1983 EXECUTIVE LEADER",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet Ready",
    cardTapHint: "TAP TO FLIP ↺",

    stat1Num: "200+",
    stat1Title: "Peer CEOs",
    stat1Desc: "Presidents & MDs Vetted",
    stat2Num: ">$200M+",
    stat2Title: "Internal Trade",
    stat2Desc: "Closed-loop supply chain",
    stat3Num: "+35%",
    stat3Title: "B2B Growth",
    stat3Desc: "Exclusive internal deals",
    stat4Num: "100%",
    stat4Title: "Verified Enterprises",
    stat4Desc: "Rigorous Peer Vetting",

    leadTag: "LEADERSHIP TERM 2025 - 2028",
    leadTitle: "Executive Board & Strategic Advisors",
    leadDesc:
      "Proven business captains leading the 1983 alliance toward new benchmarks of commerce and collective growth.",
    leadHint: "Click any floating avatar bubble to view strategic briefing & direct connect",

    timeTag: "BREAKTHROUGH JOURNEY & SKYLINE VISION",
    timeTitle: "CEO 1983 Growth Skyline",
    timeDesc:
      "From our founding in 2021 to multi-million-dollar supply deals and digital transformation.",

    ecoTag: "CEO 1983 EXECUTIVE ECOSYSTEM",
    ecoTitle1: "Creating Greater Value Together",
    ecoDesc:
      "CEO 1983 Club unites founders, members, enterprises, experts, partners, and investors in an executive ecosystem to share knowledge, capital, and trade opportunities.",
    ecoBtn: "Explore Ecosystem →",
    ecoRight1: "MORE CONNECTIONS",
    ecoRight2: "MORE OPPORTUNITIES",
    ecoRight3: "MORE VALUE CREATED",

    coreTag: "GUIDING PRINCIPLES",
    coreTitle: "4 Core Peer Values",
    coreDesc:
      "Foundational values fostering an authentic, trustworthy, and enduring enterprise community.",

    roadmapTag: "CONFIDENTIAL ADMISSION PROCESS",
    roadmapTitle: "4 Steps to Secure VIP Pass",

    ctaBoxTag: "1983 PEER PRIVILEGE",
    ctaBoxTitle1: "Do Not Let Your Enterprise Sail",
    ctaBoxTitle2: "Alone in Stormy Seas",
    ctaBoxDesc:
      "Join 200+ verified 1983 CEOs. Hold your custom titanium NFC pass and unlock high-level B2B deals today.",
    ctaBoxBtn: "SUBMIT VIP APPLICATION NOW →",

    footerCopy: "CEO 1983 Club • Affiliated with HanoiBA. Official executive platform for 1983 Golden Pig entrepreneurs.",

    modalTitle: "Apply for CEO 1983 Club Membership",
    modalSubtitle: "Exclusively for Chairs, Founders & C-Level Leaders born in 1983",
    formName: "Full Name *",
    formNamePlh: "e.g., Le Hoang Long",
    formPhone: "Phone / Zalo / WhatsApp *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "Enterprise Name & Title *",
    formCompanyPlh: "e.g., Chairman & CEO - ABC Group",
    formRevenue: "Annual Revenue Scale",
    formRev1: "Under $500K USD",
    formRev2: "$500K - $2.5M USD",
    formRev3: "$2.5M - $10M USD",
    formRev4: "Above $10M USD",
    formIndustry: "Primary Industry *",
    formIndustryPlh: "e.g., Technology, Manufacturing, Real Estate...",
    formSubmit: "SUBMIT VIP CREDENTIALS →",
    formSubmitting: "Submitting...",
    formSuccessTitle: "Application Submitted Successfully!",
    formSuccessDesc: "The Secretariat will contact you for confidential vetting within 24 business hours.",
  },
};



/** 
 * SECTION 5A: 4 CORE VALUES CARDS WITH STAGGERED SPRING DROP-DOWN ANIMATION (RƠI TỪ TRÊN XUỐNG)
 * Show text tiêu đề trước, sau đó 4 khối giá trị cốt lõi rơi từ trên xuống tuần tự với hiệu ứng lực hút & spring bounce!
 */
function CoreValuesYachtConvoy({ themeMode, t }: { themeMode: ThemeMode; t: any }) {
  const coreValues = [
    { num: "01", title: "Gắn Kết Bền Lâu", desc: "Môi trường đồng niên chân thành, tin cậy tuyệt đối để sẻ chia bài toán quản trị & dòng tiền.", icon: <Users className="w-5 h-5 text-[#D8B282]" /> },
    { num: "02", title: "Học Tập Liên Tục", desc: "Đúc rút bài học quản trị từ các Shark và lãnh đạo đầu ngành, cập nhật chính sách thuế & tài chính.", icon: <GraduationCap className="w-5 h-5 text-[#D8B282]" /> },
    { num: "03", title: "Đổi Mới Sáng Tạo", desc: "Tiên phong ứng dụng AI, công nghệ thẻ định danh số và giải pháp tự động hóa vào vận hành.", icon: <Zap className="w-5 h-5 text-[#D8B282]" /> },
    { num: "04", title: "Phát Triển Bền Vững", desc: "Kiến tạo liên minh kinh tế thực chất, đẩy mạnh trách nhiệm CSR và cùng vươn tầm quốc tế.", icon: <Globe2 className="w-5 h-5 text-[#D8B282]" /> },
  ];

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (themeMode === "contrast" && contrastClass) return contrastClass;
    if (themeMode === "dark" || themeMode === "contrast") return darkClass;
    return lightClass;
  };

  return (
    <div className="relative w-full py-8">
      {/* Ocean Current & Laser Energy Track */}
      <div className="absolute inset-x-0 bottom-8 h-20 pointer-events-none opacity-40 overflow-hidden">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full h-full animate-pulse" style={{ animationDuration: "4s" }}>
          <path d="M0,40 Q360,10 720,40 T1440,40" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="16 10" className="animate-laser-flow" opacity="0.75" />
          <path d="M0,55 Q360,75 720,55 T1440,55" stroke="#D8B282" strokeWidth="2" strokeDasharray="20 12" className="animate-laser-flow-reverse" opacity="0.65" />
        </svg>
      </div>

      {/* 4 Core Value Cards Dropping from Above (Staggered Spring Gravity Drop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative z-10 max-w-[1360px] mx-auto px-4">
        {coreValues.map((cVal, cIdx) => (
          <motion.div
            key={cIdx}
            initial={{ opacity: 0, y: -220, scale: 0.82 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{
              delay: 0.38 + cIdx * 0.18,
              duration: 0.9,
              type: "spring",
              stiffness: 140,
              damping: 13,
            }}
            whileHover={{ y: -12, scale: 1.03 }}
            className={`relative p-6 sm:p-7 rounded-[30px] border-2 backdrop-blur-2xl shadow-2xl transition-all group overflow-hidden flex flex-col justify-between ${
              themeClass(
                "border-[#D8B282]/50 bg-gradient-to-b from-[#0F1B36]/95 via-[#080F22]/98 to-[#040814] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(216,178,130,0.25)] hover:border-[#F6E1C3] hover:shadow-[0_30px_70px_rgba(216,178,130,0.5)]",
                "border-[#D8B282]/60 bg-white/95 shadow-[0_15px_35px_rgba(140,101,59,0.18)] hover:border-[#D8B282]",
                "border-yellow-400 bg-black text-yellow-300"
              )
            }`}
          >
            {/* Top Specular Rim Reflection */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent opacity-80" />

            <div>
              {/* Pontoon Hull Glow & Navigation Lamp */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34D399] animate-ping" />
                  <span className="text-[10px] font-mono font-black tracking-widest text-[#D8B282] uppercase">
                    BARGE #{cVal.num}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#D8B282]/15 border border-[#D8B282]/40 group-hover:scale-115 transition-transform shadow-md">
                  {cVal.icon}
                </div>
              </div>

              {/* Metric Number & Title */}
              <div className="relative z-10 text-left">
                <span className="text-4xl sm:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] drop-shadow-sm">
                  {cVal.num}
                </span>
                <h3 className={`text-xl font-black mt-2 group-hover:text-[#D8B282] transition-colors leading-tight ${themeClass("text-white", "text-[#181512]", "text-white")}`}>
                  {cVal.title}
                </h3>
                <p className={`text-xs sm:text-[13px] mt-2.5 leading-relaxed font-normal ${themeClass("text-slate-300", "text-[#4A3F35]", "text-yellow-100")}`}>
                  {cVal.desc}
                </p>
              </div>
            </div>

            {/* Base Water Displacement & Branding Line */}
            <div className="mt-6 pt-4 border-t border-[#D8B282]/20 flex items-center justify-between text-[10.5px] font-mono text-[#D8B282] relative z-10">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                HẢI TRÌNH ĐỒNG NIÊN
              </span>
              <span className="font-semibold text-slate-400 group-hover:text-[#F6E1C3] transition-colors">CEO 1983</span>
            </div>

            {/* Glowing Stern Foam Underneath */}
            <div className="absolute -bottom-2 left-6 right-6 h-3 bg-gradient-to-r from-cyan-400/40 via-white/50 to-[#D8B282]/40 blur-[6px] rounded-full pointer-events-none opacity-80" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * SECTION 5B: 4 BƯỚC NHẬN THẺ VIP PASS (STEP-BY-STEP PROGRESSIVE ANIMATION MATCHING IMAGE 1)
 */
function VipPass4StepsProgressiveFlow({ themeMode, t }: { themeMode: ThemeMode; t: any }) {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-progression cycle every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      step: "01",
      title: "Nộp Hồ Sơ Online",
      desc: "Cung cấp chức danh lãnh đạo, quy mô công ty và ngành nghề hoạt động.",
      status: "BƯỚC 1 • KHỞI TẠO",
    },
    {
      step: "02",
      title: "Thẩm Định Đồng Niên",
      desc: "Ban Thư Ký thẩm định uy tín, doanh thu thực tế và năm sinh 1983 (Quý Hợi).",
      status: "BƯỚC 2 • THẨM ĐỊNH",
    },
    {
      step: "03",
      title: "Phê Duyệt & Trao Thẻ",
      desc: "Ban Lãnh Đạo phê duyệt chính thức và trao Thẻ NFC Titanium khắc tên riêng.",
      status: "BƯỚC 3 • PHÊ DUYỆT",
    },
    {
      step: "04",
      title: "Kích Hoạt Hệ Sinh Thái",
      desc: "Tham gia các buổi Mastermind, sàn thương vụ B2B và phòng deal kín.",
      status: "BƯỚC 4 • ĐẶC QUYỀN VIP",
    },
  ];

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (themeMode === "contrast" && contrastClass) return contrastClass;
    if (themeMode === "dark" || themeMode === "contrast") return darkClass;
    return lightClass;
  };

  return (
    <div id="roadmap" className="pt-16 relative">
      {/* Header Matching Reference Image 1 */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-mono border mb-3 backdrop-blur-md shadow-md ${
            themeClass(
              "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15 shadow-[0_0_15px_rgba(216,178,130,0.2)]",
              "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30",
              "border-yellow-400 text-yellow-300 bg-yellow-400/20"
            )
          }`}
        >
          <span>QUY TRÌNH XÉT DUYỆT BẢO MẬT</span>
        </div>
        <h3
          className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${themeClass(
            "text-white",
            "text-[#181512]",
            "text-yellow-300"
          )}`}
        >
          4 BƯỚC NHẬN THẺ VIP PASS
        </h3>
      </div>

      {/* Connecting Laser Energy Beam flowing through the 4 steps */}
      <div className="relative max-w-7xl mx-auto">
        <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#D8B282]/40 to-transparent pointer-events-none z-0">
          <motion.div
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 w-12 h-3 bg-gradient-to-r from-transparent via-[#F6E1C3] to-transparent shadow-[0_0_12px_#FFF] rounded-full"
          />
        </div>

        {/* 4 Step Cards Matching Reference Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, sIdx) => {
            const isCurrent = activeStep === sIdx;
            return (
              <motion.div
                key={sIdx}
                onClick={() => setActiveStep(sIdx)}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className={`p-6 sm:p-7 rounded-[28px] border backdrop-blur-2xl shadow-xl flex flex-col justify-between transition-all duration-500 cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? themeClass(
                        "border-2 border-[#D8B282] bg-gradient-to-b from-[#121B30] to-[#070D1A] shadow-[0_20px_50px_rgba(216,178,130,0.4),0_0_30px_rgba(216,178,130,0.2)] ring-2 ring-[#D8B282]/50 scale-[1.03]",
                        "border-2 border-[#D8B282] bg-white shadow-[0_15px_40px_rgba(140,101,59,0.25)] scale-[1.03]",
                        "border-2 border-yellow-400 bg-black text-yellow-300"
                      )
                    : themeClass(
                        "border border-white/12 bg-[#070E20]/80 hover:border-[#D8B282]/60 text-slate-300 opacity-90",
                        "border border-slate-200 bg-white/90 hover:border-[#D8B282] text-slate-700 shadow-sm",
                        "border border-yellow-400/40 bg-zinc-950 text-yellow-200"
                      )
                }`}
              >
                {/* Step Top Badge Circle Matching Image 1 */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-black text-sm transition-all shadow-md ${
                      isCurrent
                        ? "bg-gradient-to-br from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 ring-4 ring-[#D8B282]/30 shadow-[0_0_15px_rgba(216,178,130,0.6)]"
                        : "bg-[#F6E1C3]/80 text-slate-950"
                    }`}
                  >
                    {step.step}
                  </div>

                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ĐANG TIẾN HÀNH
                    </span>
                  )}
                </div>

                {/* Step Content */}
                <div className="text-left space-y-2">
                  <h4
                    className={`text-base sm:text-lg font-black tracking-tight ${
                      isCurrent ? themeClass("text-white", "text-[#181512]", "text-white") : "text-slate-100"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed font-normal ${
                      isCurrent ? themeClass("text-slate-200", "text-[#4A3F35]", "text-yellow-100") : "text-slate-400"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className={isCurrent ? "text-[#D8B282] font-bold" : "text-slate-400"}>{step.status}</span>
                  {isCurrent && (
                    <div className="w-2 h-2 rotate-45 bg-[#D8B282] shadow-[0_0_8px_#D8B282] animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Ceo1983Landing() {
  const { lang } = useLang();
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(3); // 2025 (Centerpiece) by default
  const [heroSlide, setHeroSlide] = useState(0); // 0, 1, 2
  const [slideDirection, setSlideDirection] = useState(1);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Section 2 Leadership States (Waves & Floating Bubbles)
  const [activeLeaderIdx, setActiveLeaderIdx] = useState<number>(0);
  const [autoRotateBubbles, setAutoRotateBubbles] = useState<boolean>(true);

  // Section 4 Constellation Orbit State
  const [orbitPaused, setOrbitPaused] = useState<boolean>(false);
  const [activeSatellite, setActiveSatellite] = useState<number | null>(null);

  // Slide 3 KYC Video Player States
  const [selectedKycVideo, setSelectedKycVideo] = useState<number>(0);
  const [kycVideoPlaying, setKycVideoPlaying] = useState<boolean>(true);
  const [kycVideoMuted, setKycVideoMuted] = useState<boolean>(true);
  const kycVideoRef = useRef<HTMLVideoElement | null>(null);

  const kycVideoSources = [
    {
      id: "kyc-onboarding",
      title: "Bản Tin Thời Sự: Thẩm Định Doanh Nghiệp & KYC 100% C-Level 1983",
      time: "01:25",
      badge: "THỜI SỰ CEO 1983",
      poster: "/landing/ceo1983_news_studio.jpg",
      src: "/landing/video_ceo1983_kyc.mp4",
      desc: "Trực tiếp từ trường quay: Nữ BTV cùng Nam doanh nhân 1983 bình luận và phân tích quy trình thẩm định năng lực, uy tín pháp lý trước khi kết nạp.",
    },
    {
      id: "kyc-deal-flow",
      title: "Tiêu Điểm Kinh Tế: Cấp Thẻ Titanium NFC & Bảo Mật E2E",
      time: "02:10",
      badge: "ĐẶC QUYỀN VIP PASS",
      poster: "/landing/ceo1983_news_studio.jpg",
      src: "/landing/video_ceo1983_kyc.mp4",
      desc: "Phóng sự công nghệ kết nối 1-chạm NFC mã hóa, mở lối trực tiếp vào mạng lưới thương mại kín của các nhà sáng lập 1983.",
    },
    {
      id: "kyc-governance",
      title: "Toạ Đàm Doanh Nghiệp: Mạng Lưới Giao Thương >5.000 Tỷ VNĐ",
      time: "01:45",
      badge: "BẢO CHỨNG HANOIBA",
      poster: "/landing/ceo1983_news_studio.jpg",
      src: "/landing/video_ceo1983_kyc.mp4",
      desc: "Bản tin đối thoại chuyên sâu về hệ sinh thái chuỗi cung ứng khép kín, hiệp lực tài chính và bảo trợ uy tín HanoiBA.",
    },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    revenue: "10-50",
    industry: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { scrollYProgress } = useScroll();

  const isDark = themeMode === "dark";
  const isContrast = themeMode === "contrast";

  const t = (CEO1983_I18N as any)[lang] || CEO1983_I18N.vi;

  // Auto-play hero slider every 7.5s unless paused
  useEffect(() => {
    if (isSlidePaused) return;
    const interval = setInterval(() => {
      setSlideDirection(1);
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 7500);
    return () => clearInterval(interval);
  }, [isSlidePaused]);

  // Auto-rotate leadership bubbles gently every 5.5s
  useEffect(() => {
    if (!autoRotateBubbles) return;
    const interval = setInterval(() => {
      setActiveLeaderIdx((prev) => (prev + 1) % leaders.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [autoRotateBubbles]);

  const changeSlide = (newIndex: number) => {
    setSlideDirection(newIndex > heroSlide ? 1 : -1);
    setHeroSlide(newIndex);
  };

  const selectLeader = (index: number) => {
    setAutoRotateBubbles(false);
    setActiveLeaderIdx(index);
  };

  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (isContrast && contrastClass) return contrastClass;
    if (isDark || isContrast) return darkClass;
    return lightClass;
  };

  const handleJoinClick = () => {
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitClubApplication({
        data: {
          fullName: formData.fullName,
          phone: formData.phone,
          company: formData.company,
          revenue: formData.revenue,
          industry: formData.industry,
          clubSlug: "ceo-1983",
        },
      });
      toast.success(t.formSuccessTitle);
    } catch (err) {
      console.error("[Ceo1983Landing] Submit application error", err);
      toast.success(t.formSuccessTitle);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  // Multi-Slide Hero Data (Dedicated Unique Layouts & Content)
  const heroSlides = [
    {
      id: "vip-card",
      badge: "Thẻ VIP Titanium NFC",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      tag: t.heroHanoiba || "💎 ĐẶC QUYỀN ĐỊNH DANH DOANH NHÂN QUÝ HỢI 1983",
      title1: t.heroTitle1 || "LIÊN MINH DOANH NHÂN",
      title2: t.heroTitle2 || "ĐỒNG NIÊN QUÝ HỢI 1983",
      title3: t.heroTitle3 || "HANOIBA ALLIANCE",
      desc: t.heroDesc || "Thẻ định danh kỹ thuật số cao cấp tích hợp chip NFC & mã QR mã hóa E2E, bảo chứng bởi HanoiBA. Chạm nhẹ vào smartphone đối tác để trao đổi hồ sơ doanh nghiệp đã thẩm định trong 1 giây.",
      type: "card",
      highlights: [
        { icon: <Zap className="w-4 h-4 text-[#D8B282]" />, label: "Chạm NFC 1s", desc: "Không cần cài app" },
        { icon: <ShieldCheck className="w-4 h-4 text-[#D8B282]" />, label: "Bảo chứng HanoiBA", desc: "100% hồ sơ uy tín" },
        { icon: <CheckCircle2 className="w-4 h-4 text-[#D8B282]" />, label: "Mã hóa E2E", desc: "Bảo mật danh bạ" },
      ],
    },
    {
      id: "c-level-directory",
      badge: "Mạng Lưới C-Level 200+",
      icon: <Users className="w-3.5 h-3.5" />,
      tag: "🏛️ 200+ CHỦ TỊCH & TỔNG GIÁM ĐỐC QUÝ HỢI 1983",
      title1: "BẢO CHỨNG UY TÍN",
      title2: "KẾT NỐI TRỰC TIẾP —",
      title3: "200+ THUYỀN TRƯỞNG",
      desc: "Mạng lưới tinh hoa khép kín quy tụ các nhà sáng lập, Chủ tịch & CEO sinh năm 1983. Tất cả thành viên đều trải qua thẩm định minh bạch về năng lực tài chính và đạo đức kinh doanh.",
      type: "network",
      highlights: [
        { icon: <Award className="w-4 h-4 text-[#D8B282]" />, label: "Doanh thu >20 Tỷ/năm", desc: "Tiêu chuẩn gia nhập" },
        { icon: <ShieldCheck className="w-4 h-4 text-[#D8B282]" />, label: "HanoiBA Bảo Chứng", desc: "Thẩm định 3 vòng" },
        { icon: <Handshake className="w-4 h-4 text-[#D8B282]" />, label: "Cam kết Tương Trợ", desc: "Không bán chéo spam" },
      ],
    },
    {
      id: "kyc-video-terminal",
      badge: "Video KYC & Thẻ VIP Pass",
      icon: <Film className="w-3.5 h-3.5" />,
      tag: "📹 XÁC THỰC KYC & ĐỊNH DANH TITANIUM NFC",
      title1: "THẨM ĐỊNH MINH BẠCH",
      title2: "QUY TRÌNH KYC 100% —",
      title3: "CẤP THẺ TITANIUM",
      desc: "Trực quan hóa quy trình thẩm định 3 vòng nghiêm ngặt, đối soát tư cách pháp nhân và trao đặc quyền thẻ Titanium VIP Pass kích hoạt kết nối phòng Deal Kín >5.000 Tỷ VNĐ.",
      type: "video",
      highlights: [
        { icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />, label: "Xác thực KYC 100%", desc: "Thẩm định C-Level" },
        { icon: <Zap className="w-4 h-4 text-[#D8B282]" />, label: "Chip Titanium NFC", desc: "Mã hóa E2E" },
        { icon: <Coins className="w-4 h-4 text-emerald-400" />, label: ">5.000 Tỷ VNĐ", desc: "Sàn thương vụ B2B" },
      ],
    },
  ];

  // Section 2: Real Leaders & Advisors (Waves & Floating Bubbles)
  const leaders = [
    {
      name: "Lê Hoàng Long",
      role: "Chủ tịch CLB CEO 1983 (Nhiệm kỳ 2025 - 2028)",
      company: "Chủ tịch HĐQT kiêm TGĐ Công ty CP Tập đoàn Tinh Hoa",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      highlight: "Đầu tàu liên minh doanh nghiệp 1983",
      quote: "Đồng niên gắn kết — Tiên phong kiến tạo chuỗi cung ứng khép kín vững mạnh.",
      badge: "CHỦ TỊCH CLB",
      floatDelay: 0,
    },
    {
      name: "Trần Anh Quân",
      role: "Phó Chủ tịch Thường Trực",
      company: "Chủ tịch Công ty CP Đầu Tư & Phát Triển Công Nghệ Việt An",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      highlight: "Phụ trách Xúc tiến Giao thương B2B",
      quote: "Biến mỗi cơ hội giao lưu thành hợp đồng thương vụ thực chất.",
      badge: "PHÓ CHỦ TỊCH",
      floatDelay: 1.2,
    },
    {
      name: "Shark Nguyễn Xuân Phú",
      role: "Cố Vấn Chiến Lược Danh Dự",
      company: "Chủ tịch HĐQT Tập đoàn Sunhouse",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
      highlight: "Định hướng Quản trị & M&A Doanh nghiệp",
      quote: "Dòng tiền và quản trị rủi ro là sinh mệnh của doanh nghiệp tăng trưởng nhanh.",
      badge: "CỐ VẤN CHIẾN LƯỢC",
      floatDelay: 0.6,
    },
    {
      name: "Nguyễn Minh Châu",
      role: "Phó Chủ tịch phụ trách Tài Chính",
      company: "Tổng Giám Đốc Công ty Chứng Khoán & Quản Lý Quỹ Alpha",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      highlight: "Quản trị Dòng tiền & Quỹ đầu tư",
      quote: "Tối ưu hóa cấu trúc vốn và bảo lãnh thanh khoản nội bộ.",
      badge: "PHÓ CHỦ TỊCH",
      floatDelay: 1.8,
    },
    {
      name: "Phạm Hải Đăng",
      role: "Phó Chủ tịch Ban Pháp chế & Thẩm định",
      company: "Luật sư Điều hành - Hãng Luật Quốc tế H&D Partners",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
      highlight: "Bảo chứng Pháp lý & Trọng tài kinh tế",
      quote: "Bảo vệ pháp lý minh bạch cho mọi giao dịch giữa các thành viên.",
      badge: "PHÓ CHỦ TỊCH",
      floatDelay: 2.4,
    },
    {
      name: "Vũ Bích Ngọc",
      role: "Tổng Thư Ký CLB CEO 1983",
      company: "Chủ tịch HĐQT Công ty Truyền Thông & Sự Kiện V-Media",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      highlight: "Kết nối Hội viên & Quan hệ đối ngoại",
      quote: "Gắn kết triệu trái tim doanh nhân Quý Hợi bằng sự chân thành và nhiệt huyết.",
      badge: "TỔNG THƯ KÝ",
      floatDelay: 0.9,
    },
  ];

  // Section 3: Futuristic Glass Skyscraper City Skyline Milestones (6 Strategic Towers)
  const skyscrapers = [
    {
      year: "2021",
      tag: "KHỞI NGUYÊN ĐỒNG NIÊN",
      name: "Tháp Khởi Nguyên",
      heightPx: 220,
      floors: 6,
      metric: "50+ CEO",
      subMetric: "Ban Vận Động HanoiBA",
      desc: "Quy tụ 50 Chủ tịch & CEO Quý Hợi đầu tiên trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA). Đặt nền móng cho văn hóa tương trợ, chân thành và minh bạch.",
      icon: <Flame className="w-5 h-5 text-[#D8B282]" />,
    },
    {
      year: "2023",
      tag: "MỞ RỘNG GIAO THƯƠNG",
      name: "Tháp Hội Tụ",
      heightPx: 270,
      floors: 8,
      metric: "1.200 Tỷ VNĐ",
      subMetric: "24 Sự kiện Xúc tiến",
      desc: "Tổng doanh thu hội viên vượt mốc 1.200 Tỷ VNĐ. Triển khai chuỗi Business Tour thực chiến, talkshow quản trị dòng tiền và mở rộng liên minh đối tác chiến lược.",
      icon: <Building2 className="w-5 h-5 text-[#D8B282]" />,
    },
    {
      year: "2024",
      tag: "HÀNH TRÌNH XUYÊN VIỆT",
      name: "Tháp Bắc - Nam",
      heightPx: 320,
      floors: 10,
      metric: "Liên Minh Toàn Quốc",
      subMetric: "CEO 1983 Miền Nam & Site Visit",
      desc: "Thành lập chi hội CEO 1983 Miền Nam, đẩy mạnh các chương trình Site Visit thực địa tại các nhà máy lớn (Flexfit, Cao su An Việt, Thái Bình...), kết nối cung ứng liên vùng.",
      icon: <Handshake className="w-5 h-5 text-[#D8B282]" />,
    },
    {
      year: "2025",
      tag: "CHUYỂN ĐỔI SỐ & ĐỊNH DANH AI",
      name: "Đại Tháp Bứt Phá",
      heightPx: 420,
      floors: 14,
      metric: ">5.000 Tỷ VNĐ",
      subMetric: "Thẻ VIP NFC & Mạng Lưới HanoiBA",
      desc: "Ứng dụng giải pháp số độc quyền CLB, phát hành Thẻ Titanium NFC bảo chứng định danh doanh nhân số. Giao thương nội bộ bứt phá vượt mốc 5.000 Tỷ VNĐ.",
      icon: <Zap className="w-5 h-5 text-[#F6E1C3]" />,
      isCurrent: true,
    },
    {
      year: "2026 — 2028",
      tag: "QUỸ ĐẦU TƯ & CỐ VẤN CHIẾN LƯỢC",
      name: "Tháp Vươn Tầm",
      heightPx: 360,
      floors: 12,
      metric: "500+ Doanh Nghiệp",
      subMetric: "Cố Vấn Shark Phú & Quỹ Mạo Hiểm",
      desc: "Đồng hành cùng Shark Nguyễn Xuân Phú và các chuyên gia đầu ngành; thành lập Quỹ đầu tư mạo hiểm nội bộ, hỗ trợ bảo lãnh tài chính và dòng tiền cho doanh nghiệp SME.",
      icon: <Globe2 className="w-5 h-5 text-[#D8B282]" />,
    },
    {
      year: "2030+",
      tag: "KỲ LÂN DI SẢN & IPO QUỐC TẾ",
      name: "Đại Tháp Tương Lai",
      heightPx: 480,
      floors: 16,
      metric: "10.000+ Tỷ VNĐ",
      subMetric: "Vươn Tầm Đông Nam Á & IPO",
      desc: "Liên minh kinh tế hùng mạnh khu vực Đông Nam Á, bệ phóng nâng tầm thương hiệu quốc gia và hỗ trợ IPO cho các doanh nghiệp thành viên tiêu biểu lên sàn chứng khoán.",
      icon: <Crown className="w-5 h-5 text-[#F6E1C3]" />,
    },
  ];

  // Section 4: 8 Orbiting Satellites
  const constellationSatellites = [
    { id: "hiep-hoi", name: "Hiệp hội", icon: <Users className="w-4 h-4" />, desc: "Kết nối sâu rộng với HanoiBA, VCCI và các tổ chức ngành nghề toàn quốc", angle: 160 },
    { id: "doanh-nhan", name: "Doanh nhân", icon: <UserCheck className="w-4 h-4" />, desc: "Cộng đồng 200+ Chủ tịch & CEO 1983 cùng thế hệ, cùng tư duy dẫn đầu", angle: 195 },
    { id: "doanh-nghiep", name: "Doanh nghiệp", icon: <Building2 className="w-4 h-4" />, desc: "Mạng lưới chuỗi cung ứng khép kín tối ưu dòng tiền và sản lượng B2B", angle: 230 },
    { id: "chuyen-gia", name: "Chuyên gia", icon: <Award className="w-4 h-4" />, desc: "Đội ngũ cố vấn tài chính, thuế, pháp lý và tái cấu trúc doanh nghiệp", angle: 265 },
    { id: "nha-dau-tu", name: "Nhà đầu tư", icon: <Coins className="w-4 h-4" />, desc: "Quỹ đầu tư nội bộ và mạng lưới Angel Investors tìm kiếm deal tăng trưởng", angle: 20 },
    { id: "co-quan-quan-ly", name: "Cơ quan quản lý", icon: <ShieldCheck className="w-4 h-4" />, desc: "Đối thoại chính sách kinh tế và xúc tiến đầu tư chính ngạch", angle: 335 },
    { id: "to-chuc-quoc-te", name: "Tổ chức quốc tế", icon: <Globe2 className="w-4 h-4" />, desc: "Hợp tác thương mại song phương, xuất khẩu và đưa sản phẩm ra toàn cầu", angle: 300 },
    { id: "doi-tac-chien-luoc", name: "Đối tác chiến lược", icon: <Handshake className="w-4 h-4" />, desc: "Các tập đoàn lớn đồng hành cung ứng giải pháp tài chính và công nghệ", angle: 270 },
  ];

  return (
    <div
      className={`transition-colors duration-500 relative overflow-x-hidden ${
        themeClass(
          "bg-[#02040A] text-[#FAF6F0] selection:bg-[#D8B282] selection:text-black",
          "bg-[#FAF8F5] text-[#181512] selection:bg-[#D8B282] selection:text-white",
          "bg-black text-[#FFE57F] selection:bg-yellow-400 selection:text-black"
        )
      }`}
      style={{ fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* 0. STICKY TOP SCROLL PROGRESS BAR */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] origin-left z-50 shadow-[0_0_16px_rgba(216,178,130,0.85)] pointer-events-none"
      />

      {/* 1. EMBEDDED FONTS & KEYFRAME ANIMATIONS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
          
          @keyframes laserStreamFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -160; }
          }
          @keyframes laserStreamFlowReverse {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 160; }
          }
          @keyframes neonGlowPulse {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.6)); opacity: 0.9; }
            50% { filter: drop-shadow(0 0 16px rgba(129, 140, 248, 1)) drop-shadow(0 0 35px rgba(216, 178, 130, 0.9)); opacity: 1; }
          }
          @keyframes goldGlowPulse {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(246, 225, 195, 0.9)) drop-shadow(0 0 22px rgba(216, 178, 130, 0.7)); }
            50% { filter: drop-shadow(0 0 18px rgba(255, 255, 255, 1)) drop-shadow(0 0 38px rgba(216, 178, 130, 1)); }
          }
          
          @keyframes floatingWave {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-14px) rotate(0.8deg); }
          }

          @keyframes waterBobbing {
            0%, 100% { transform: translateY(0px) scale(1); }
            35% { transform: translateY(-16px) scale(1.03); }
            70% { transform: translateY(8px) scale(0.98); }
          }

          @keyframes skyscraperLights {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.95; }
          }

          @keyframes gentleRibbonDrift {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(-10px, 8px, 0) scale(1.015); }
          }

          @keyframes waterWaveFlow1 {
            0% { transform: translate3d(0, 0, 0) scaleY(1); }
            50% { transform: translate3d(-35px, 14px, 0) scaleY(1.06); }
            100% { transform: translate3d(0, 0, 0) scaleY(1); }
          }

          @keyframes waterWaveFlow2 {
            0% { transform: translate3d(0, 0, 0) scaleY(1); }
            50% { transform: translate3d(30px, -12px, 0) scaleY(0.95); }
            100% { transform: translate3d(0, 0, 0) scaleY(1); }
          }

          @keyframes waterCurrentLoop {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -120; }
          }

          @keyframes waterDropletGlide {
            0% { stroke-dashoffset: 200; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { stroke-dashoffset: -200; opacity: 0; }
          }

          .animate-wave-1 {
            animation: waterWaveFlow1 9s ease-in-out infinite;
            will-change: transform;
          }

          .animate-wave-2 {
            animation: waterWaveFlow2 12s ease-in-out infinite;
            will-change: transform;
          }

          .animate-water-current {
            animation: waterCurrentLoop 6s linear infinite;
          }

          @keyframes gentleOrbitSlow {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(2deg) scale(1.02); }
          }

          @keyframes orbitContinuous {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes orbitCounterContinuous {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }

          .animate-ribbon-drift {
            animation: gentleRibbonDrift 12s ease-in-out infinite;
            will-change: transform;
          }

          .animate-orbit-spin {
            animation: orbitContinuous 28s linear infinite;
            transform-origin: center center;
            will-change: transform;
          }

          .animate-orbit-reverse {
            animation: orbitCounterContinuous 28s linear infinite;
            transform-origin: center center;
            will-change: transform;
          }

          .animate-orbit-gentle {
            animation: gentleOrbitSlow 9s ease-in-out infinite;
            will-change: transform;
          }

          .paused-spin {
            animation-play-state: paused !important;
          }
        `}
      </style>

      {/* 2. HERO LUXURY BACKGROUND: ADAPTIVE THEME ATMOSPHERE (SÓNG NƯỚC 3D THEME TỐI • LUỒNG GIÓ KHÍ ĐỘNG THEME SÁNG • CYBER OBSIDIAN THEME TƯƠNG PHẢN) */}
      <div className="absolute inset-0 top-0 left-0 w-full h-[1400px] pointer-events-none z-0 overflow-hidden">
        {/* Dynamic Background Backdrop Image & Atmosphere per Theme */}
        {themeMode === "light" ? (
          <>
            {/* Real Hanoi City Daytime Luxury Skyline & Golden Sunlit Sky */}
            <div className="absolute inset-0 w-full h-full opacity-60 scale-105 transition-opacity duration-700">
              <img
                src="/ceo1983_hero_daylight_skyline.jpg"
                alt="CEO 1983 Hanoi Daytime Luxury Skyline"
                className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
              />
            </div>
            {/* Bright Porcelain Daylight Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/30 via-[#FAF8F5]/75 to-[#FAF8F5] pointer-events-none" />
          </>
        ) : themeMode === "contrast" ? (
          <>
            {/* Dedicated High-Contrast Cyber Obsidian Backdrop */}
            <div className="absolute inset-0 w-full h-full opacity-90 scale-105 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_top,#121826_0%,#040710_60%,#000000_100%)]">
              {/* High Contrast Holographic Matrix Grid */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: "linear-gradient(to right, #FACC15 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black pointer-events-none" />
          </>
        ) : (
          <>
            {/* Real Hanoi City Night Skyline & Cosmic Starfield Image */}
            <div className="absolute inset-0 w-full h-full opacity-65 mix-blend-screen scale-105 animate-pulse transition-opacity duration-700" style={{ animationDuration: "8s" }}>
              <img
                src="/ceo1983_hero_cosmos_skyline.jpg"
                alt="CEO 1983 Cosmos Hanoi Skyline"
                className="w-full h-full object-cover object-center filter brightness-110 contrast-125"
              />
            </div>
            {/* Dynamic Dark Radial Gradient Vignette for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#02040A]/40 via-[#02040A]/85 to-[#02040A] pointer-events-none" />
          </>
        )}

        {/* =========================================================================
            DYNAMIC 3D VECTOR STREAMS:
            - THEME TỐI: SÓNG NƯỚC 3D CUỒN CUỘN CHẢY LIÊN TỤC (THEO TỪNG SLIDE)
            - THEME SÁNG: LUỒNG GIÓ KHÍ ĐỘNG HỌC MỀM MẠI UỐN LƯỢN (AERODYNAMIC SILK WIND)
            - THEME TƯƠNG PHẢN: MA TRẬN NĂNG LƯỢNG CYBER OBSIDIAN & ELECTRIC GOLD
            ========================================================================= */}
        <svg
          className="absolute top-0 inset-x-0 w-full h-[1200px] pointer-events-none"
          viewBox="0 0 1440 1100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="fluidGlow3D" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="specularGleam" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <defs>
            {/* 1. Dark Theme: Surging 3D Liquid Crystal Water Stream */}
            <linearGradient id="liquidWaterStream" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0369A1" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="liquidSpecularSpine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="50%" stopColor="#F0F9FF" stopOpacity="1" />
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="liquidWaterBranch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.25" />
            </linearGradient>

            {/* 2. Light Theme: Delicate Aerodynamic Silk Wind Streamlines (Luồng Gió Khí Động Học Nhẹ Nhàng) */}
            <linearGradient id="silkWindGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D8B282" stopOpacity="0" />
              <stop offset="20%" stopColor="#D8B282" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8C653B" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#F6E1C3" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D8B282" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="silkWindGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#F6E1C3" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="silkWindGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A8824B" stopOpacity="0" />
              <stop offset="40%" stopColor="#D8B282" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#8C653B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D8B282" stopOpacity="0" />
            </linearGradient>

            {/* 3. High Contrast Theme: Electric Neon Gold & Quantum Cyan Stream */}
            <linearGradient id="contrastElectricStream" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FACC15" stopOpacity="1" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0.8" />
            </linearGradient>

            {/* 3D Spherical Droplet Radial Gradient */}
            <radialGradient id="waterBubble3D" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="22%" stopColor="#BAE6FD" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="90%" stopColor="#0369A1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#082F49" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* ─────────────────────────────────────────────────────────────
              RENDER THEME-SPECIFIC DYNAMIC FLOW (SÓNG NƯỚC / LUỒNG GIÓ / CYBER)
              TẤT CẢ ĐƯỢC ĐẶT Ở CHÂN ĐÁY (Y >= 760) ĐỂ KHÔNG BAO GIỜ CHE TEXT
              ───────────────────────────────────────────────────────────── */}
          {themeMode === "light" ? (
            /* THEME SÁNG: CÁC LUỒNG GIÓ KHÍ ĐỘNG HỌC MỀM MẠI, DẢI LỤA THANH THOÁT KHÔNG CHE CHỮ */
            <g className="animate-wave-1">
              {/* Primary Silk Wind Ribbon (Thanh mảnh, uốn lượn tự nhiên) */}
              <path
                d="M -120,810 C 220,770 480,740 780,775 C 1080,810 1320,770 1560,790"
                stroke="url(#silkWindGrad1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Core Fast Breeze Filament (Vệt gió nhanh đứt đoạn) */}
              <path
                d="M -80,808 C 240,768 500,738 800,773 C 1100,808 1340,768 1560,788"
                stroke="url(#silkWindGrad2)"
                strokeWidth="1.5"
                strokeDasharray="24 14 6 14"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Upper Feathered Wind Stream */}
              <path
                d="M 60,750 C 380,710 680,725 980,755 C 1240,780 1420,745 1560,760"
                stroke="url(#silkWindGrad3)"
                strokeWidth="1.8"
                strokeDasharray="32 18"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Secondary Soft Ambient Breeze */}
              <path
                d="M -100,860 C 260,820 600,830 920,800 C 1200,775 1400,825 1560,835"
                stroke="url(#silkWindGrad1)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.45"
              />
              {/* Dynamic Wind Swirl Currents (Xoáy gió nhỏ mềm mại) */}
              <path
                d="M 420,740 C 470,725 510,735 500,755 C 485,770 440,765 460,745"
                stroke="url(#silkWindGrad1)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 1040,765 C 1090,750 1130,760 1120,780 C 1105,795 1060,790 1080,770"
                stroke="url(#silkWindGrad1)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.45"
              />
              {/* Floating Golden Breeze Particles in the Wind Flow */}
              {[
                { cx: 280, cy: 780, r: 2 },
                { cx: 480, cy: 750, r: 2.5 },
                { cx: 720, cy: 765, r: 3 },
                { cx: 960, cy: 785, r: 2.5 },
                { cx: 1220, cy: 770, r: 3 },
                { cx: 1420, cy: 780, r: 2 },
              ].map((dot, dIdx) => (
                <g key={dIdx} className="animate-pulse" style={{ animationDuration: `${1.8 + dIdx * 0.3}s` }}>
                  <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill="#D8B282" opacity="0.7" />
                  <circle cx={dot.cx} cy={dot.cy} r={dot.r * 0.4} fill="#FFFFFF" />
                </g>
              ))}
            </g>
          ) : themeMode === "contrast" ? (
            /* THEME TƯƠNG PHẢN CAO: CYBER OBSIDIAN & QUANTUM ELECTRIC VEINS AT BASE */
            <g className="animate-wave-1">
              <path
                d="M -100,790 C 260,740 580,720 860,760 C 1140,790 1360,750 1560,780"
                stroke="url(#contrastElectricStream)"
                strokeWidth="8"
                strokeLinecap="round"
                filter="url(#fluidGlow3D)"
              />
              <path
                d="M -100,788 C 260,738 580,718 860,758 C 1140,788 1360,748 1560,778"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Quantum nodes */}
              <circle cx="860" cy="760" r="6" fill="#FACC15" filter="url(#fluidGlow3D)" />
              <circle cx="860" cy="760" r="2.5" fill="#FFFFFF" />
              <circle cx="1140" cy="790" r="5" fill="#38BDF8" filter="url(#fluidGlow3D)" />
              <circle cx="1140" cy="790" r="2" fill="#FFFFFF" />
            </g>
          ) : (
            /* THEME TỐI: SÓNG NƯỚC 3D CUỒN CUỘN CHẢY LIÊN TỤC KHÔNG ĐỨT ĐOẠN Ở CHÂN HORIZON (KHÔNG CHE CHỮ) */
            <g>
              <g className="animate-wave-1">
                {/* Volumetric Refraction Aura */}
                <path
                  d={
                    heroSlide === 1
                      ? "M -120,800 C 240,750 580,740 880,780 C 1160,820 1380,780 1560,800"
                      : heroSlide === 2
                      ? "M -120,810 C 260,760 600,730 900,770 C 1180,810 1400,770 1560,790"
                      : "M -120,800 C 250,755 590,735 890,775 C 1170,815 1390,775 1560,795"
                  }
                  stroke="#0284C7"
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity="0.2"
                  filter="url(#fluidGlow3D)"
                />

                {/* Main 3D Liquid Tube */}
                <path
                  d={
                    heroSlide === 1
                      ? "M -120,800 C 240,750 580,740 880,780 C 1160,820 1380,780 1560,800"
                      : heroSlide === 2
                      ? "M -120,810 C 260,760 600,730 900,770 C 1180,810 1400,770 1560,790"
                      : "M -120,800 C 250,755 590,735 890,775 C 1170,815 1390,775 1560,795"
                  }
                  stroke="url(#liquidWaterStream)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  filter="url(#fluidGlow3D)"
                />

                {/* Inner Clear Liquid Channel */}
                <path
                  d={
                    heroSlide === 1
                      ? "M -120,800 C 240,750 580,740 880,780 C 1160,820 1380,780 1560,800"
                      : heroSlide === 2
                      ? "M -120,810 C 260,760 600,730 900,770 C 1180,810 1400,770 1560,790"
                      : "M -120,800 C 250,755 590,735 890,775 C 1170,815 1390,775 1560,795"
                  }
                  stroke="#7DD3FC"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* High-Gloss Specular White Core Spine */}
                <path
                  d={
                    heroSlide === 1
                      ? "M -120,798 C 240,748 580,738 880,778 C 1160,818 1380,778 1560,798"
                      : heroSlide === 2
                      ? "M -120,808 C 260,758 600,728 900,768 C 1180,808 1400,768 1560,788"
                      : "M -120,798 C 250,753 590,733 890,773 C 1170,813 1390,773 1560,793"
                  }
                  stroke="url(#liquidSpecularSpine)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  filter="url(#specularGleam)"
                />
              </g>

              {/* Secondary Branching Tendril at Base */}
              <g className="animate-wave-2">
                <path
                  d="M 480,750 C 720,785 960,825 1240,800 C 1380,785 1480,800 1560,810"
                  stroke="url(#liquidWaterBranch)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.5"
                  filter="url(#fluidGlow3D)"
                />
                <path
                  d="M 480,750 C 720,785 960,825 1240,800 C 1380,785 1480,800 1560,810"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>

              {/* 3D Spherical Water Bubbles & Droplets along the base river */}
              <g className="animate-water-current">
                <g transform="translate(380, 765)">
                  <circle cx="0" cy="0" r="6" fill="url(#waterBubble3D)" stroke="#BAE6FD" strokeWidth="0.8" filter="url(#specularGleam)" />
                  <ellipse cx="-1.8" cy="-1.8" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.95" />
                </g>
                <g transform="translate(620, 745)">
                  <circle cx="0" cy="0" r="7" fill="url(#waterBubble3D)" stroke="#BAE6FD" strokeWidth="0.9" filter="url(#specularGleam)" />
                  <ellipse cx="-2.2" cy="-2.2" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.95" />
                </g>
                <g transform="translate(880, 780)">
                  <circle cx="0" cy="0" r="7.5" fill="url(#waterBubble3D)" stroke="#E0F2FE" strokeWidth="0.9" filter="url(#specularGleam)" />
                  <ellipse cx="-2.5" cy="-2.5" rx="3" ry="1.6" fill="#FFFFFF" opacity="0.95" />
                </g>
                <g transform="translate(1180, 815)">
                  <circle cx="0" cy="0" r="6.5" fill="url(#waterBubble3D)" stroke="#E0F2FE" strokeWidth="0.8" filter="url(#specularGleam)" />
                  <ellipse cx="-2" cy="-2" rx="2.4" ry="1.4" fill="#FFFFFF" opacity="0.95" />
                </g>
                <g transform="translate(1380, 785)">
                  <circle cx="0" cy="0" r="6" fill="url(#waterBubble3D)" stroke="#BAE6FD" strokeWidth="0.8" filter="url(#specularGleam)" />
                  <ellipse cx="-1.8" cy="-1.8" rx="2.2" ry="1.3" fill="#FFFFFF" opacity="0.95" />
                </g>
              </g>
            </g>
          )}
        </svg>

        {/* Ambient Warm Golden & Cyan Halos */}
        <div className="absolute top-24 right-1/3 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none bg-gradient-to-br from-[#38BDF8]/15 via-[#D8B282]/20 to-transparent" />
      </div>

      {/* --- NAVBAR (FIXED TOP NEVER DRIFTING) --- */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b backdrop-blur-2xl ${
          themeClass(
            "border-[#D8B282]/25 bg-[#02040A]/95 shadow-[0_4px_30px_rgba(0,0,0,0.9)]",
            "border-[#D8B282]/30 bg-[#FAF8F5]/98 shadow-[0_4px_20px_rgba(140,101,59,0.08)]",
            "border-yellow-400/80 bg-black/98 shadow-[0_4px_30px_rgba(250,204,21,0.3)]"
          )
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-10 py-3">
          {/* Logo & CLB Title */}
          <Link to="/landing/ceo1983" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-serif font-black text-lg shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 ${
                themeClass(
                  "border-[#F6E1C3] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 shadow-[0_0_20px_rgba(216,178,130,0.4)]",
                  "border-[#D8B282] bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#8C653B_100%)] text-slate-950 shadow-[0_2px_10px_rgba(140,101,59,0.2)]",
                  "border-yellow-400 bg-black text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                )
              }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              1983
            </div>
            <div className="flex flex-col text-left justify-center">
              <span className={`text-[8.5px] font-medium tracking-[0.18em] uppercase transition-colors ${themeClass("text-[#D8B282]", "text-[#8C653B]", "text-yellow-400")}`}>
                {t.navBadge}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm sm:text-[15px] font-bold tracking-tight leading-tight ${
                    themeClass(
                      "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                      "text-[#181512]",
                      "text-yellow-300 font-bold"
                    )
                  }`}
                >
                  CLB CEO 1983
                </span>
                <span
                  className={`text-[8px] font-mono font-medium uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                    themeClass(
                      "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15 shadow-[0_0_8px_rgba(216,178,130,0.2)]",
                      "border-[#D8B282] text-[#8C653B] bg-[#F6E1C3]/30",
                      "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                    )
                  }`}
                >
                  {t.navVip}
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Links - Refined, elegant font weight and airy spacing */}
          <nav
            className={`hidden xl:flex items-center gap-7 2xl:gap-8 text-[12.5px] font-medium tracking-normal ${
              themeClass("text-slate-300", "text-[#5A4F43]", "text-yellow-200")
            }`}
          >
            <a href="#leadership" className="hover:text-[#F6E1C3] hover:font-semibold transition-all py-1">
              {t.navLeadership}
            </a>
            <a href="#timeline" className="hover:text-[#F6E1C3] hover:font-semibold transition-all py-1">
              {t.navTimeline}
            </a>
            <a href="#ecosystem" className="hover:text-[#F6E1C3] hover:font-semibold transition-all py-1">
              {t.navEcosystem}
            </a>
            <a href="#core-values" className="hover:text-[#F6E1C3] hover:font-semibold transition-all py-1">
              {t.navCore}
            </a>
            <a href="#roadmap" className="hover:text-[#F6E1C3] hover:font-semibold transition-all py-1">
              {t.navRoadmap}
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitcher themeMode={themeMode} />

            {/* 3-WAY THEME TOGGLE */}
            <div
              className={`flex items-center rounded-full p-0.5 border transition-colors duration-300 ${
                themeClass("border-[#D8B282]/30 bg-[#0B1224]/90", "border-[#D8B282]/40 bg-[#EDE4D8]", "border-yellow-400/80 bg-zinc-950")
              }`}
            >
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                aria-label="Chế độ Tối"
                title="Giao diện Tối"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  themeMode === "dark"
                    ? "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 font-black shadow-md scale-105"
                    : themeClass("text-slate-300 hover:text-white", "text-slate-600 hover:text-black", "text-yellow-300")
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.modeDark}</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                aria-label="Chế độ Sáng"
                title="Giao diện Sáng"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  themeMode === "light"
                    ? "bg-white text-slate-950 shadow-md font-black scale-105"
                    : themeClass("text-slate-300 hover:text-white", "text-slate-600 hover:text-black", "text-yellow-300")
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.modeLight}</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("contrast")}
                aria-label="Chế độ Tương phản cao"
                title="Tương phản cao"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  themeMode === "contrast"
                    ? "bg-yellow-400 text-black shadow-md font-black scale-105"
                    : themeClass("text-slate-300 hover:text-white", "text-slate-600 hover:text-black", "text-yellow-300")
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.modeContrast}</span>
              </button>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleJoinClick}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                themeClass(
                  "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 hover:shadow-[0_0_30px_rgba(216,178,130,0.6)] hover:brightness-110",
                  "bg-[#181512] text-[#F6E1C3] hover:bg-slate-900 border border-[#D8B282]/40 shadow-sm",
                  "bg-yellow-400 text-black font-black hover:bg-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.6)]"
                )
              }`}
            >
              <span>{t.navJoin}</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className={`xl:hidden p-2 rounded-xl transition-colors ${
                themeClass("text-slate-200 hover:text-white", "text-slate-700 hover:text-black", "text-yellow-300")
              }`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`xl:hidden border-t px-6 py-5 space-y-4 shadow-2xl ${
                themeClass("border-[#D8B282]/20 bg-[#02040A]/98", "border-[#D8B282]/30 bg-[#FAF8F5]/98", "border-yellow-400 bg-black")
              }`}
            >
              <nav className={`flex flex-col space-y-3 font-semibold ${themeClass("text-slate-200", "text-slate-800", "text-yellow-300")}`}>
                <a href="#leadership" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F6E1C3] py-1">
                  {t.navLeadership}
                </a>
                <a href="#timeline" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F6E1C3] py-1">
                  {t.navTimeline}
                </a>
                <a href="#ecosystem" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F6E1C3] py-1">
                  {t.navEcosystem}
                </a>
                <a href="#core-values" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F6E1C3] py-1">
                  {t.navCore}
                </a>
                <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F6E1C3] py-1">
                  {t.navRoadmap}
                </a>
              </nav>
              <button
                type="button"
                onClick={handleJoinClick}
                className="w-full py-3 rounded-full font-black text-xs uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-lg"
              >
                {t.navJoin}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =======================================
          SECTION 1: HERO MULTI-SLIDE SHOWCASE (EXACT MATCH TO REFERENCE MOCKUP)
          ======================================= */}
      <SectionFlip3D id="hero">
        <section className="relative z-10 pt-24 sm:pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 overflow-hidden">
        {/* Slide Selector Capsule Pills (Clean Luxury Tabs without hardcoded SLIDE text) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
          {heroSlides.map((slide, sIdx) => {
            const isActive = heroSlide === sIdx;
            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => changeSlide(sIdx)}
                className={`relative px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 overflow-hidden cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? themeClass(
                        "bg-[#0D162B] text-[#F6E1C3] border border-[#D8B282] shadow-[0_0_25px_rgba(216,178,130,0.4)] scale-105",
                        "bg-white text-[#8C653B] border border-[#D8B282] shadow-[0_4px_20px_rgba(140,101,59,0.18)] scale-105",
                        "bg-yellow-400 text-black border border-yellow-300 scale-105"
                      )
                    : themeClass(
                        "bg-[#060B18]/80 text-slate-400 border border-[#D8B282]/20 hover:border-[#D8B282]/50 hover:text-white",
                        "bg-[#EDE4D8]/70 text-slate-600 border border-[#D8B282]/30 hover:border-[#D8B282] hover:text-black",
                        "bg-zinc-900 text-yellow-200 border border-yellow-400/40"
                      )
                }`}
              >
                <span className={`${isActive ? "text-[#D8B282]" : "text-slate-400"}`}>
                  {slide.icon}
                </span>
                <span className="relative z-10 font-mono tracking-normal">
                  {slide.badge}
                </span>

                {isActive && !isSlidePaused && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6.5, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] z-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Multi-Slide Content Presentation with Distinct Custom Layouts */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          {heroSlide === 0 && (
            /* SLIDE 1: TITANIUM VIP NFC PASS (Layout 7/5 with 3 Highlight Feature Badges & Aquatic Waves) */
            <motion.div
              key="slide-card"
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -50 : 50 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              onMouseEnter={() => setIsSlidePaused(true)}
              onMouseLeave={() => setIsSlidePaused(false)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
            >
              {/* Left Column (7 cols) */}
              <div className="lg:col-span-7 text-left space-y-6">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono border backdrop-blur-md shadow-sm ${
                    themeClass(
                      "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15",
                      "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30",
                      "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                    )
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B282]" />
                  <span>{heroSlides[0].tag}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.12]">
                  <span className={`block font-extrabold ${themeClass("text-white", "text-[#09152B]", "text-white")}`}>
                    {heroSlides[0].title1}
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#09152B] via-[#7C5824] to-[#B8860B]",
                        "text-yellow-300"
                      )
                    }`}
                  >
                    {heroSlides[0].title2}
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#7C5824] via-[#9E6B28] to-[#5C3B0E]",
                        "text-yellow-400"
                      )
                    }`}
                  >
                    {heroSlides[0].title3}
                  </span>
                </h1>

                <p
                  className={`text-base sm:text-lg leading-relaxed font-medium max-w-2xl ${
                    themeClass("text-slate-200", "text-[#1E293B]", "text-yellow-100")
                  }`}
                >
                  {heroSlides[0].desc}
                </p>

                {/* 3 Luxury Highlight Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {heroSlides[0].highlights?.map((hl, hlIdx) => (
                    <div
                      key={hlIdx}
                      className={`p-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 ${
                        themeClass(
                          "bg-[#0D162B]/80 border-[#D8B282]/30 shadow-md",
                          "bg-white/90 border-[#D8B282]/40 shadow-sm",
                          "bg-zinc-900 border-yellow-400/40"
                        )
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-[#D8B282]/20 shrink-0">
                        {hl.icon}
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`text-xs font-bold leading-tight ${themeClass("text-white", "text-slate-900", "text-yellow-300")}`}>
                          {hl.label}
                        </p>
                        <p className={`text-[10px] truncate ${themeClass("text-slate-400", "text-slate-600", "text-yellow-100")}`}>
                          {hl.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleJoinClick}
                    className="px-8 py-4 rounded-full font-black text-sm tracking-wider uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_35px_rgba(216,178,130,0.5)] hover:shadow-[0_0_50px_rgba(216,178,130,0.8)] hover:scale-105 active:scale-98 transition-all cursor-pointer"
                  >
                    {t.heroJoinBtn}
                  </button>

                  <Link
                    to="/connect-app"
                    className={`inline-flex items-center gap-2 px-6 py-4 rounded-full font-bold text-sm border transition-all ${
                      themeClass(
                        "text-slate-100 bg-[#0B1224]/90 border-[#D8B282]/30 hover:border-[#D8B282] hover:text-white hover:bg-[#121B2F]",
                        "text-[#181512] bg-white border-[#D8B282]/40 hover:border-[#D8B282] hover:bg-[#F5EFE6] shadow-sm",
                        "text-yellow-300 bg-black border-yellow-400 hover:bg-yellow-400/20"
                      )
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#D8B282]" />
                    <span>{t.heroOpenApp}</span>
                  </Link>
                </div>

                {/* Slide Nav Arrows */}
                <div className={`flex items-center gap-3 pt-2 text-xs font-mono ${themeClass("text-slate-400", "text-slate-600", "text-yellow-200")}`}>
                  <button
                    type="button"
                    onClick={() => changeSlide(2)}
                    className={`p-2 rounded-full border transition-colors ${
                      themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                    }`}
                    aria-label="Slide trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold">01 / 03</span>
                  <button
                    type="button"
                    onClick={() => changeSlide(1)}
                    className={`p-2 rounded-full border transition-colors ${
                      themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                    }`}
                    aria-label="Slide tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column (5 cols): 3D Card on Fluid Animated Water Ripples */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[460px] group perspective-[1200px] flex items-center justify-center">
                  {/* Floating Halo Under Card */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-16 bg-[#38BDF8]/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Concentric Animated Aquatic Water Ripples under the Card */}
                  <div className="absolute inset-[-75px] sm:inset-[-110px] pointer-events-none z-0 flex items-center justify-center animate-wave-1">
                    <svg viewBox="0 0 500 380" fill="none" className="w-full h-full">
                      {/* Water Wave Ripple 1 (Cyan Glow) */}
                      <ellipse
                        cx="250"
                        cy="190"
                        rx="235"
                        ry="115"
                        transform="rotate(-15 250 190)"
                        stroke="url(#heroWaterRipple1)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        className="opacity-90"
                      />

                      {/* Water Wave Ripple 2 (Gold Wave) */}
                      <ellipse
                        cx="250"
                        cy="190"
                        rx="195"
                        ry="90"
                        transform="rotate(18 250 190)"
                        stroke="url(#heroWaterRipple2)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        className="opacity-85"
                      />

                      {/* Water Wave Ripple 3 (Inner Fluid Aqua Current) */}
                      <ellipse
                        cx="250"
                        cy="190"
                        rx="155"
                        ry="68"
                        transform="rotate(-5 250 190)"
                        stroke="#67E8F9"
                        strokeWidth="1.8"
                        strokeDasharray="8 14"
                        className="animate-water-current opacity-80"
                      />

                      {/* Water Wave Ripple 4 (Soft Shimmer) */}
                      <ellipse
                        cx="250"
                        cy="190"
                        rx="120"
                        ry="50"
                        transform="rotate(10 250 190)"
                        stroke="#F6E1C3"
                        strokeWidth="1.2"
                        strokeOpacity="0.45"
                      />

                      <defs>
                        <linearGradient id="heroWaterRipple1" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
                          <stop offset="35%" stopColor="#818CF8" stopOpacity="0.95" />
                          <stop offset="70%" stopColor="#67E8F9" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="heroWaterRipple2" x1="1" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFF5E6" stopOpacity="1" />
                          <stop offset="40%" stopColor="#F6E1C3" stopOpacity="0.95" />
                          <stop offset="75%" stopColor="#D8B282" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#8C653B" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Orbiting Water Droplets / Beacons */}
                    <div className="absolute top-6 right-10 w-4 h-4 rounded-full bg-cyan-300 blur-[0.5px] shadow-[0_0_20px_#38BDF8] animate-ping" />
                    <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full bg-amber-200 blur-[0.5px] shadow-[0_0_20px_#F6E1C3] animate-pulse" />
                    <div className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-white blur-[0.5px] shadow-[0_0_15px_#FFFFFF] animate-ping" style={{ animationDuration: "1.8s" }} />
                    <div className="absolute bottom-1/4 right-2 w-3.5 h-3.5 rounded-full bg-indigo-400 blur-[0.5px] shadow-[0_0_18px_#818CF8] animate-pulse" />
                  </div>

                  {/* 3D Flip Card */}
                  <motion.div
                    onClick={() => setCardFlipped((p) => !p)}
                    animate={{ rotateY: cardFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                    className="relative z-10 w-full aspect-[1.58/1] rounded-3xl cursor-pointer preserve-3d shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(216,178,130,0.4)] border border-[#F6E1C3]/80 hover:scale-[1.03] transition-transform duration-300"
                  >
                    {/* Front Face — Radial Brushed Champagne Gold Metal Finish */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-3xl p-6 backface-hidden flex flex-col justify-between overflow-hidden border border-[#D8B282] shadow-inner"
                      style={{
                        background:
                          "radial-gradient(circle at 45% 45%, #FFF0DC 0%, #F5D7A9 28%, #D4A767 60%, #9C6F35 100%)",
                      }}
                    >
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                        style={{
                          background:
                            "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.7) 0deg, rgba(0,0,0,0.3) 45deg, rgba(255,255,255,0.8) 90deg, rgba(0,0,0,0.4) 135deg, rgba(255,255,255,0.7) 180deg, rgba(0,0,0,0.3) 225deg, rgba(255,255,255,0.8) 270deg, rgba(0,0,0,0.4) 315deg, rgba(255,255,255,0.7) 360deg)",
                        }}
                      />

                      {/* Giant Watermark Embossed 1983 Globe */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full opacity-35 pointer-events-none flex items-center justify-center border-2 border-slate-950/40">
                        <div className="absolute inset-2 rounded-full border border-slate-950/30" />
                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-950/40" />
                        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-950/40" />
                        <div className="absolute inset-y-0 left-1/4 w-[1px] rounded-full border-l border-slate-950/30" />
                        <div className="absolute inset-y-0 right-1/4 w-[1px] rounded-full border-r border-slate-950/30" />
                        <span className="font-serif font-black text-4xl text-slate-950/60 tracking-tighter" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
                          1983
                        </span>
                      </div>

                      {/* Card Top Row */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full border border-slate-950/70 bg-gradient-to-br from-white/40 to-black/10 flex items-center justify-center font-serif font-black text-slate-950 text-xs shadow-xs">
                            1983
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-mono font-black tracking-widest text-slate-950 uppercase">
                              CEO 1983 CLUB
                            </p>
                            <p className="text-[8px] text-slate-900 uppercase font-bold tracking-wider">
                              HANOIBA ALLIANCE
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono font-bold text-slate-900/80 tracking-wider">
                          505 M7E. TNIK
                        </span>
                      </div>

                      {/* Card Middle: Gold Smart Chip */}
                      <div className="my-auto py-2 relative z-10 text-left">
                        <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-[#FFF7EA] via-[#E9C38E] to-[#976A30] border border-slate-950/50 shadow-sm relative overflow-hidden flex items-center justify-center">
                          <div className="w-7 h-5 rounded-md border border-slate-950/40 grid grid-cols-3 grid-rows-2 divide-x divide-y divide-slate-950/40" />
                        </div>
                      </div>

                      {/* Card Bottom Row */}
                      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-slate-950/20 text-left">
                        <div>
                          <p className="text-[8.5px] font-mono text-slate-950 font-black tracking-widest uppercase">
                            TITANIUM VIP PASS
                          </p>
                          <p className="text-sm sm:text-base font-black text-slate-950 tracking-wider">
                            DOANH NHÂN QUÝ HỢI
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9.5px] font-mono font-black text-slate-950">ID: 1983-MM-8989</span>
                          <p className="text-[7.5px] font-mono font-bold text-slate-900/75 uppercase mt-0.5">
                            CHẠM ĐỂ KẾT NỐI SAU 1S
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl p-6 bg-gradient-to-br from-[#0B1020] via-[#050814] to-[#02050E] rotate-y-180 backface-hidden flex flex-col justify-between overflow-hidden border border-[#D8B282]/50 text-left">
                      <div className="flex items-center justify-between border-b border-[#D8B282]/20 pb-3">
                        <span className="text-[10px] font-mono text-[#F6E1C3] font-bold uppercase">
                          DIGITAL VIP IDENTITY
                        </span>
                        <Wallet className="w-4 h-4 text-[#D8B282]" />
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-white">{t.cardWallet}</p>
                        <p className="text-[10px] text-slate-300 leading-snug">
                          Chạm 1-lần vào điện thoại thông minh để trao đổi hồ sơ doanh nghiệp đã được HanoiBA bảo chứng.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#D8B282]/20 flex items-center justify-between text-[9px] font-mono text-[#D8B282]">
                        <span>ENCRYPTED ID: 8888</span>
                        <span>CLB DOANH NHÂN 1983</span>
                      </div>
                    </div>
                  </motion.div>

                  <p
                    className={`text-center text-[11px] font-mono mt-4 tracking-wider relative z-10 ${themeClass(
                      "text-[#D8B282]",
                      "text-[#8C653B]",
                      "text-yellow-300"
                    )}`}
                  >
                    {t.cardTapHint}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {heroSlide === 1 && (
            /* SLIDE 2: 200+ C-LEVEL DIRECTORY (Organic 3D Constellation of Verified Leaders - Không ô vuông chữ nhật thô) */
            <motion.div
              key="slide-network"
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -50 : 50 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              onMouseEnter={() => setIsSlidePaused(true)}
              onMouseLeave={() => setIsSlidePaused(false)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Left Column (5 cols) - Concise Punchy Text */}
              <div className="lg:col-span-5 text-left space-y-5">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono border backdrop-blur-md shadow-sm ${
                    themeClass(
                      "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15",
                      "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30",
                      "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                    )
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#D8B282]" />
                  <span>{heroSlides[1].tag}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.12]">
                  <span className={`block font-extrabold ${themeClass("text-white", "text-[#09152B]", "text-white")}`}>
                    MẠNG LƯỚI 200+
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#09152B] via-[#7C5824] to-[#B8860B]",
                        "text-yellow-300"
                      )
                    }`}
                  >
                    CHỦ TỊCH & CEO
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#7C5824] via-[#9E6B28] to-[#5C3B0E]",
                        "text-yellow-400"
                      )
                    }`}
                  >
                    QUÝ HỢI 1983
                  </span>
                </h1>

                <p
                  className={`text-sm sm:text-base leading-relaxed font-medium ${
                    themeClass("text-slate-300", "text-[#334155]", "text-yellow-100")
                  }`}
                >
                  Liên minh lãnh đạo doanh nghiệp cùng tuổi, thẩm định nghiêm ngặt và bảo chứng uy tín 100% từ HanoiBA.
                </p>

                {/* 3 Compact Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: "100% C-Level", desc: "Chủ tịch & TGĐ", icon: <Crown className="w-3.5 h-3.5 text-[#F6E1C3]" /> },
                    { label: ">20 Tỷ / Năm", desc: "Doanh thu chuẩn", icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> },
                    { label: "Deal Kín 1:1", desc: "Hợp tác sâu", icon: <Zap className="w-3.5 h-3.5 text-[#D8B282]" /> },
                  ].map((b, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-2.5 rounded-2xl border backdrop-blur-md text-left ${
                        themeClass(
                          "bg-[#0D162B]/80 border-[#D8B282]/30",
                          "bg-white/90 border-[#D8B282]/40 shadow-xs",
                          "bg-zinc-900 border-yellow-400/40"
                        )
                      }`}
                    >
                      <div className="mb-1">{b.icon}</div>
                      <p className={`text-[11px] font-black truncate ${themeClass("text-white", "text-slate-900", "text-yellow-300")}`}>
                        {b.label}
                      </p>
                      <p className={`text-[9.5px] truncate ${themeClass("text-slate-400", "text-slate-600", "text-yellow-100")}`}>
                        {b.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Link & Nav */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#leadership"
                    className="px-6 py-3 rounded-full font-black text-xs tracking-wider uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-md hover:brightness-110 hover:scale-105 active:scale-98 transition-all inline-flex items-center gap-2"
                  >
                    <span>Xem Danh Bạ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleJoinClick}
                    className={`px-5 py-3 rounded-full font-bold text-xs border transition-all ${
                      themeClass(
                        "text-slate-200 bg-[#0B1224]/80 border-[#D8B282]/30 hover:border-[#D8B282]",
                        "text-slate-900 bg-white border-[#D8B282]/40 hover:border-[#D8B282]",
                        "text-yellow-300 bg-black border-yellow-400"
                      )
                    }`}
                  >
                    Ứng Tuyển Gia Nhập
                  </button>
                </div>

                {/* Slide Nav Arrows */}
                <div className={`flex items-center gap-3 pt-1 text-xs font-mono ${themeClass("text-slate-400", "text-slate-600", "text-yellow-200")}`}>
                  <button
                    type="button"
                    onClick={() => changeSlide(0)}
                    className={`p-2 rounded-full border transition-colors ${
                      themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                    }`}
                    aria-label="Slide trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold">02 / 03</span>
                  <button
                    type="button"
                    onClick={() => changeSlide(2)}
                    className={`p-2 rounded-full border transition-colors ${
                      themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                    }`}
                    aria-label="Slide tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column (7 cols): ORGANIC 3D CONSTELLATION OF C-LEVEL LEADERS (THIẾT KẾ VIÊN NHỘNG TINH HOA 3D) */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {leaders.slice(0, 4).map((lead, lIdx) => (
                    <motion.div
                      key={lIdx}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className={`relative p-4 rounded-3xl border backdrop-blur-xl transition-all text-left shadow-lg group overflow-hidden flex items-center gap-3.5 ${
                        themeClass(
                          "bg-gradient-to-r from-[#0E1A33]/90 via-[#091224]/90 to-[#040814]/95 border-[#D8B282]/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:border-[#F6E1C3]",
                          "bg-white/95 border-[#D8B282]/50 shadow-[0_8px_25px_rgba(140,101,59,0.12)] hover:border-[#8C653B]",
                          "bg-black border-yellow-400 text-yellow-300"
                        )
                      }`}
                    >
                      {/* Top Specular Arc */}
                      <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#F6E1C3]/70 to-transparent" />

                      {/* 3D Spherical Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-[0_0_15px_rgba(216,178,130,0.4)]">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        {/* Verified Status Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B1224] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      </div>

                      {/* Info & Badges */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-black truncate ${themeClass("text-white", "text-slate-900", "text-white")}`}>
                            {lead.name}
                          </p>
                          <BadgeCheck className="w-3.5 h-3.5 text-[#D8B282] shrink-0" />
                        </div>
                        <p className="text-[10.5px] text-[#D8B282] font-mono font-bold truncate">
                          {lead.badge}
                        </p>
                        <p className={`text-[9.5px] truncate ${themeClass("text-slate-300", "text-slate-600", "text-yellow-100")}`}>
                          {lead.company}
                        </p>
                        <div className="pt-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-[#D8B282]/15 text-[#F6E1C3] border border-[#D8B282]/30">
                            QUÝ HỢI 1983 • 100% VETTED
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {heroSlide === 2 && (
            /* SLIDE 3: 4K KYC VIDEO BRIEFING TERMINAL & TITANIUM PASS (Chuyển video KYC vào Slide 3 Hero Section) */
            <motion.div
              key="slide-kyc-video"
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -50 : 50 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              onMouseEnter={() => setIsSlidePaused(true)}
              onMouseLeave={() => setIsSlidePaused(false)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
            >
              {/* Left Column (5 cols) - KYC Overview & Navigation */}
              <div className="lg:col-span-5 text-left space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono border backdrop-blur-md shadow-sm ${
                    themeClass(
                      "border-cyan-400/50 text-cyan-300 bg-cyan-950/30",
                      "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30",
                      "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                    )
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{heroSlides[2].tag}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.12]">
                  <span className={`block font-extrabold ${themeClass("text-white", "text-[#09152B]", "text-white")}`}>
                    THẨM ĐỊNH MINH BẠCH
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-[#F6E1C3] to-[#D8B282]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#09152B] via-[#7C5824] to-[#B8860B]",
                        "text-yellow-300"
                      )
                    }`}
                  >
                    QUY TRÌNH KYC 100%
                  </span>
                  <span
                    className={`block mt-1 ${
                      themeClass(
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B]",
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#7C5824] via-[#9E6B28] to-[#5C3B0E]",
                        "text-yellow-400"
                      )
                    }`}
                  >
                    CẤP THẺ TITANIUM
                  </span>
                </h1>

                <p
                  className={`text-sm sm:text-base leading-relaxed font-medium ${
                    themeClass("text-slate-300", "text-[#334155]", "text-yellow-100")
                  }`}
                >
                  Trực quan hóa quy trình thẩm định 3 vòng nghiêm ngặt, đối soát tư cách pháp nhân và cấp thẻ Titanium VIP Pass kích hoạt Deal Room kín &gt;5.000 Tỷ VNĐ.
                </p>

                {/* 3 Interactive Chapter Pills */}
                <div className="space-y-1.5 pt-1">
                  {kycVideoSources.map((chapter, cIdx) => {
                    const isSel = selectedKycVideo === cIdx;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setSelectedKycVideo(cIdx)}
                        className={`w-full p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer ${
                          isSel
                            ? themeClass(
                                "bg-[#0D1E3A] border-[#F6E1C3] shadow-[0_0_15px_rgba(216,178,130,0.3)]",
                                "bg-white border-[#8C653B] shadow-sm",
                                "bg-zinc-900 border-yellow-400"
                              )
                            : themeClass(
                                "bg-[#080E1C]/70 border-[#D8B282]/20 hover:border-[#D8B282]/50",
                                "bg-[#FAF8F5] border-[#D8B282]/30 hover:border-[#D8B282]",
                                "bg-black border-zinc-800"
                              )
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                              isSel
                                ? "bg-[#D8B282] text-slate-950 font-black"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {cIdx + 1}
                          </div>
                          <p
                            className={`text-xs font-bold truncate ${
                              isSel
                                ? themeClass("text-[#F6E1C3]", "text-[#8C653B]", "text-yellow-300")
                                : themeClass("text-slate-300", "text-slate-700", "text-slate-300")
                            }`}
                          >
                            {chapter.title}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-[#D8B282] font-bold shrink-0">
                          {chapter.time}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Actions & Slide Nav */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleJoinClick}
                    className="px-6 py-3 rounded-full font-black text-xs tracking-wider uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-md hover:brightness-110 hover:scale-105 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Đăng Ký Thẩm Định KYC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className={`flex items-center gap-2 text-xs font-mono ${themeClass("text-slate-400", "text-slate-600", "text-yellow-200")}`}>
                    <button
                      type="button"
                      onClick={() => changeSlide(1)}
                      className={`p-2 rounded-full border transition-colors ${
                        themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                      }`}
                      aria-label="Slide trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold">03 / 03</span>
                    <button
                      type="button"
                      onClick={() => changeSlide(0)}
                      className={`p-2 rounded-full border transition-colors ${
                        themeClass("border-[#D8B282]/30 bg-[#0A1020] hover:text-white hover:border-[#D8B282]", "border-[#D8B282]/40 bg-white hover:text-black hover:border-[#D8B282] shadow-xs", "border-yellow-400 bg-black text-yellow-300")
                      }`}
                      aria-label="Slide tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): LUXURY 4K KYC VIDEO PLAYER CONSOLE */}
              <div className="lg:col-span-7">
                <div
                  className={`rounded-3xl border-2 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden ${
                    themeClass(
                      "border-[#D8B282]/50 bg-gradient-to-b from-[#0B152B]/98 via-[#060D1E]/95 to-[#02050E] shadow-[0_20px_60px_rgba(0,0,0,0.85)]",
                      "border-[#D8B282]/60 bg-white/95 shadow-xl",
                      "border-yellow-400 bg-black text-yellow-300"
                    )
                  }`}
                >
                  {/* Player Top Bezel Bar */}
                  <div className="flex items-center justify-between pb-2.5 px-2 border-b border-[#D8B282]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${themeClass("text-white", "text-slate-900", "text-yellow-300")}`}>
                        LIVE KYC BRIEFING • 4K ULTRA HD
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#D8B282]/15 border border-[#D8B282]/35 text-[9.5px] font-mono text-[#F6E1C3] font-bold">
                        {kycVideoSources[selectedKycVideo].badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => setKycVideoMuted((m) => !m)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          themeClass("bg-white/5 border-white/10 text-white hover:bg-white/10", "bg-black/5 border-black/10 text-black", "bg-zinc-800 text-yellow-300")
                        }`}
                        title={kycVideoMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                      >
                        {kycVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D8B282]" />}
                      </button>
                    </div>
                  </div>

                  {/* Video Stage Frame */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black mt-3 border border-[#D8B282]/30 shadow-inner group">
                    <video
                      key={kycVideoSources[selectedKycVideo].src}
                      ref={kycVideoRef}
                      src={kycVideoSources[selectedKycVideo].src}
                      poster={(kycVideoSources[selectedKycVideo] as any).poster || "/landing/ceo1983_news_studio.jpg"}
                      autoPlay
                      loop
                      playsInline
                      muted={kycVideoMuted}
                      className="w-full h-full object-cover"
                      onPlay={() => setKycVideoPlaying(true)}
                      onPause={() => setKycVideoPlaying(false)}
                    />

                    {/* Subtle Gradient Overlay for HUD Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Center Play/Pause Overlay Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (kycVideoRef.current) {
                          if (kycVideoPlaying) {
                            kycVideoRef.current.pause();
                            setKycVideoPlaying(false);
                          } else {
                            kycVideoRef.current.play();
                            setKycVideoPlaying(true);
                          }
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] text-slate-950 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        {kycVideoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </div>
                    </button>

                    {/* Bottom HUD Overlay on Video */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                          {kycVideoSources[selectedKycVideo].title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[9.5px] font-mono text-emerald-300 font-bold backdrop-blur-md">
                        VERIFIED E2E
                      </span>
                    </div>
                  </div>

                  {/* Description Box under Video */}
                  <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-[#D8B282]/20 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className={`text-xs leading-relaxed ${themeClass("text-slate-300", "text-slate-700", "text-yellow-100")}`}>
                      {kycVideoSources[selectedKycVideo].desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =======================================================================
            DYNAMIC HERO BOTTOM SECTION: COMPLETELY TRANSFORMING LAYOUT PER SLIDE
            Slide 1: 4 Hanging Circular Frosted Glow Bulbs (Thẻ VIP Pass & Kết Nối)
            Slide 2: Streamlined 4-Pillar Executive Vetting Strip (Mạng Lưới C-Level)
            Slide 3: 3-Step KYC Onboarding Pathway (Quy trình Thẩm định & Cấp thẻ)
            ======================================================================= */}
        <AnimatePresence mode="wait">
          {heroSlide === 0 && (
            /* SLIDE 1 BOTTOM: 4 LUXURY HANGING CIRCULAR FROSTED GLOW BULBS */
            <motion.div
              key="hero-bottom-bulbs"
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.96 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-20 relative z-20"
            >
              {/* Top Horizontal Ceiling Suspension Rail */}
              <div className="relative w-full max-w-5xl mx-auto flex items-center justify-between px-8 sm:px-16 pointer-events-none mb-[-2px]">
                <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D8B282]/60 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 items-start max-w-7xl mx-auto">
                {/* Sphere 1: 200+ CEO Đồng Niên */}
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.05 }}
                  className="flex flex-col items-center group relative"
                >
                  <div className="w-5 h-2 rounded-full bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-[0_0_10px_rgba(216,178,130,0.8)] z-10 shrink-0" />
                  <div className="relative w-[2px] h-10 sm:h-14 bg-gradient-to-b from-[#F6E1C3] via-[#D8B282]/70 to-[#D8B282] shrink-0">
                    <div className="absolute top-1 left-[-1px] w-[4px] h-[8px] rounded-full bg-white/90 blur-[0.5px] animate-bounce" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="w-10 h-3 rounded-t-lg bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-md border-b border-black/30" />
                    <div className="w-12 h-1 bg-[#F6E1C3] rounded-full blur-[1px] shadow-[0_0_12px_#F6E1C3]" />
                  </div>
                  <div className="absolute top-16 -inset-x-4 h-64 bg-gradient-to-b from-[#D8B282]/25 via-[#D8B282]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
                  
                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-56 h-56 sm:w-60 sm:h-60 rounded-full aspect-square relative p-6 border-2 backdrop-blur-2xl shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center ${
                      themeClass(
                        "border-[#F6E1C3]/60 bg-radial from-[#F6E1C3]/20 via-[#0D182E]/92 to-[#030612]/95 shadow-[0_0_50px_rgba(216,178,130,0.4),inset_0_0_30px_rgba(255,255,255,0.25)] hover:border-[#F6E1C3] hover:shadow-[0_0_75px_rgba(216,178,130,0.75),inset_0_0_40px_rgba(255,255,255,0.4)]",
                        "border-[#D8B282]/70 bg-radial from-white/90 via-[#FDF9F2]/95 to-[#EDE4D8] shadow-[0_10px_35px_rgba(140,101,59,0.25),inset_0_0_20px_rgba(255,255,255,0.8)] hover:border-[#8C653B]",
                        "border-yellow-300 bg-black text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.5)]"
                      )
                    }`}
                  >
                    <div className="absolute inset-3 rounded-full border border-[#D8B282]/30 border-dashed animate-spin-slow pointer-events-none" />
                    <div className="w-8 h-8 rounded-full bg-[#D8B282]/25 border border-[#D8B282]/60 flex items-center justify-center shadow-md mb-1.5 group-hover:scale-110 transition-transform relative z-10">
                      <Users className="w-4 h-4 text-[#F6E1C3]" />
                    </div>
                    <p className={`text-3xl sm:text-4xl font-black font-serif tracking-tight leading-none drop-shadow-[0_0_15px_rgba(216,178,130,0.5)] relative z-10 ${
                      themeClass("text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]", "text-transparent bg-clip-text bg-gradient-to-r from-[#181512] via-[#8C653B] to-[#C29B69]", "text-yellow-300")
                    }`}>
                      {t.stat1Num}
                    </p>
                    <p className={`text-xs sm:text-sm font-black mt-1 uppercase tracking-wider leading-tight relative z-10 ${themeClass("text-white", "text-[#181512]", "text-white")}`}>
                      {t.stat1Title}
                    </p>
                    <p className={`text-[10px] mt-0.5 leading-tight font-normal max-w-[130px] relative z-10 ${themeClass("text-slate-200", "text-[#5A4F43]", "text-yellow-100")}`}>
                      {t.stat1Desc}
                    </p>
                    <span className="mt-2 text-[8px] font-mono font-bold tracking-widest text-[#D8B282] uppercase px-2 py-0.5 rounded-full bg-[#D8B282]/15 border border-[#D8B282]/30 relative z-10">
                      VERIFIED 100%
                    </span>
                  </motion.div>
                  <div className="w-1.5 h-3.5 bg-gradient-to-b from-[#D8B282] via-[#F6E1C3] to-transparent rounded-b-full shadow-[0_0_10px_#D8B282] mt-0.5 opacity-90" />
                </motion.div>

                {/* Sphere 2: >5.000 Tỷ VND Giao Thương */}
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.12 }}
                  className="flex flex-col items-center group relative"
                >
                  <div className="w-5 h-2 rounded-full bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-[0_0_10px_rgba(216,178,130,0.8)] z-10 shrink-0" />
                  <div className="relative w-[2px] h-14 sm:h-18 bg-gradient-to-b from-[#F6E1C3] via-[#D8B282]/70 to-[#D8B282] shrink-0">
                    <div className="absolute top-2 left-[-1px] w-[4px] h-[8px] rounded-full bg-white/90 blur-[0.5px] animate-bounce" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="w-10 h-3 rounded-t-lg bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-md border-b border-black/30" />
                    <div className="w-12 h-1 bg-[#F6E1C3] rounded-full blur-[1px] shadow-[0_0_12px_#F6E1C3]" />
                  </div>
                  <div className="absolute top-20 -inset-x-4 h-64 bg-gradient-to-b from-[#D8B282]/25 via-[#D8B282]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
                  
                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-56 h-56 sm:w-60 sm:h-60 rounded-full aspect-square relative p-6 border-2 backdrop-blur-2xl shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center ${
                      themeClass(
                        "border-[#F6E1C3]/60 bg-radial from-[#F6E1C3]/20 via-[#0D182E]/92 to-[#030612]/95 shadow-[0_0_50px_rgba(216,178,130,0.4),inset_0_0_30px_rgba(255,255,255,0.25)] hover:border-[#F6E1C3] hover:shadow-[0_0_75px_rgba(216,178,130,0.75),inset_0_0_40px_rgba(255,255,255,0.4)]",
                        "border-[#D8B282]/70 bg-radial from-white/90 via-[#FDF9F2]/95 to-[#EDE4D8] shadow-[0_10px_35px_rgba(140,101,59,0.25),inset_0_0_20px_rgba(255,255,255,0.8)] hover:border-[#8C653B]",
                        "border-yellow-300 bg-black text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.5)]"
                      )
                    }`}
                  >
                    <div className="absolute inset-3 rounded-full border border-[#D8B282]/30 border-dashed animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse" }} />
                    <div className="w-8 h-8 rounded-full bg-[#D8B282]/25 border border-[#D8B282]/60 flex items-center justify-center shadow-md mb-1.5 group-hover:scale-110 transition-transform relative z-10">
                      <TrendingUp className="w-4 h-4 text-[#F6E1C3]" />
                    </div>
                    <p className={`text-3xl sm:text-4xl font-black font-serif tracking-tight leading-none drop-shadow-[0_0_15px_rgba(216,178,130,0.5)] relative z-10 ${
                      themeClass("text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]", "text-transparent bg-clip-text bg-gradient-to-r from-[#181512] via-[#8C653B] to-[#C29B69]", "text-yellow-300")
                    }`}>
                      {t.stat2Num}
                    </p>
                    <p className={`text-xs sm:text-sm font-black mt-1 uppercase tracking-wider leading-tight relative z-10 ${themeClass("text-white", "text-[#181512]", "text-white")}`}>
                      {t.stat2Title}
                    </p>
                    <p className={`text-[10px] mt-0.5 leading-tight font-normal max-w-[130px] relative z-10 ${themeClass("text-slate-200", "text-[#5A4F43]", "text-yellow-100")}`}>
                      {t.stat2Desc}
                    </p>
                    <span className="mt-2 text-[8px] font-mono font-bold tracking-widest text-[#D8B282] uppercase px-2 py-0.5 rounded-full bg-[#D8B282]/15 border border-[#D8B282]/30 relative z-10">
                      CLOSED-LOOP
                    </span>
                  </motion.div>
                  <div className="w-1.5 h-3.5 bg-gradient-to-b from-[#D8B282] via-[#F6E1C3] to-transparent rounded-b-full shadow-[0_0_10px_#D8B282] mt-0.5 opacity-90" />
                </motion.div>

                {/* Sphere 3: +35% Tăng Trưởng B2B */}
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.18 }}
                  className="flex flex-col items-center group relative"
                >
                  <div className="w-5 h-2 rounded-full bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-[0_0_10px_rgba(216,178,130,0.8)] z-10 shrink-0" />
                  <div className="relative w-[2px] h-10 sm:h-14 bg-gradient-to-b from-[#F6E1C3] via-[#D8B282]/70 to-[#D8B282] shrink-0">
                    <div className="absolute top-1 left-[-1px] w-[4px] h-[8px] rounded-full bg-white/90 blur-[0.5px] animate-bounce" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="w-10 h-3 rounded-t-lg bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-md border-b border-black/30" />
                    <div className="w-12 h-1 bg-[#F6E1C3] rounded-full blur-[1px] shadow-[0_0_12px_#F6E1C3]" />
                  </div>
                  <div className="absolute top-16 -inset-x-4 h-64 bg-gradient-to-b from-[#D8B282]/25 via-[#D8B282]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
                  
                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-56 h-56 sm:w-60 sm:h-60 rounded-full aspect-square relative p-6 border-2 backdrop-blur-2xl shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center ${
                      themeClass(
                        "border-[#F6E1C3]/60 bg-radial from-[#F6E1C3]/20 via-[#0D182E]/92 to-[#030612]/95 shadow-[0_0_50px_rgba(216,178,130,0.4),inset_0_0_30px_rgba(255,255,255,0.25)] hover:border-[#F6E1C3] hover:shadow-[0_0_75px_rgba(216,178,130,0.75),inset_0_0_40px_rgba(255,255,255,0.4)]",
                        "border-[#D8B282]/70 bg-radial from-white/90 via-[#FDF9F2]/95 to-[#EDE4D8] shadow-[0_10px_35px_rgba(140,101,59,0.25),inset_0_0_20px_rgba(255,255,255,0.8)] hover:border-[#8C653B]",
                        "border-yellow-300 bg-black text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.5)]"
                      )
                    }`}
                  >
                    <div className="absolute inset-3 rounded-full border border-[#D8B282]/30 border-dashed animate-spin-slow pointer-events-none" />
                    <div className="w-8 h-8 rounded-full bg-[#D8B282]/25 border border-[#D8B282]/60 flex items-center justify-center shadow-md mb-1.5 group-hover:scale-110 transition-transform relative z-10">
                      <BarChart3 className="w-4 h-4 text-[#F6E1C3]" />
                    </div>
                    <p className={`text-3xl sm:text-4xl font-black font-serif tracking-tight leading-none drop-shadow-[0_0_15px_rgba(216,178,130,0.5)] relative z-10 ${
                      themeClass("text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]", "text-transparent bg-clip-text bg-gradient-to-r from-[#181512] via-[#8C653B] to-[#C29B69]", "text-yellow-300")
                    }`}>
                      {t.stat3Num}
                    </p>
                    <p className={`text-xs sm:text-sm font-black mt-1 uppercase tracking-wider leading-tight relative z-10 ${themeClass("text-white", "text-[#181512]", "text-white")}`}>
                      {t.stat3Title}
                    </p>
                    <p className={`text-[10px] mt-0.5 leading-tight font-normal max-w-[130px] relative z-10 ${themeClass("text-slate-200", "text-[#5A4F43]", "text-yellow-100")}`}>
                      {t.stat3Desc}
                    </p>
                    <span className="mt-2 text-[8px] font-mono font-bold tracking-widest text-[#D8B282] uppercase px-2 py-0.5 rounded-full bg-[#D8B282]/15 border border-[#D8B282]/30 relative z-10">
                      ANNUAL ROI
                    </span>
                  </motion.div>
                  <div className="w-1.5 h-3.5 bg-gradient-to-b from-[#D8B282] via-[#F6E1C3] to-transparent rounded-b-full shadow-[0_0_10px_#D8B282] mt-0.5 opacity-90" />
                </motion.div>

                {/* Sphere 4: 100% Thẩm Định Minh Bạch */}
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.24 }}
                  className="flex flex-col items-center group relative"
                >
                  <div className="w-5 h-2 rounded-full bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-[0_0_10px_rgba(216,178,130,0.8)] z-10 shrink-0" />
                  <div className="relative w-[2px] h-14 sm:h-18 bg-gradient-to-b from-[#F6E1C3] via-[#D8B282]/70 to-[#D8B282] shrink-0">
                    <div className="absolute top-2 left-[-1px] w-[4px] h-[8px] rounded-full bg-white/90 blur-[0.5px] animate-bounce" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="w-10 h-3 rounded-t-lg bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-md border-b border-black/30" />
                    <div className="w-12 h-1 bg-[#F6E1C3] rounded-full blur-[1px] shadow-[0_0_12px_#F6E1C3]" />
                  </div>
                  <div className="absolute top-20 -inset-x-4 h-64 bg-gradient-to-b from-[#D8B282]/25 via-[#D8B282]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
                  
                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-56 h-56 sm:w-60 sm:h-60 rounded-full aspect-square relative p-6 border-2 backdrop-blur-2xl shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center ${
                      themeClass(
                        "border-[#F6E1C3]/60 bg-radial from-[#F6E1C3]/20 via-[#0D182E]/92 to-[#030612]/95 shadow-[0_0_50px_rgba(216,178,130,0.4),inset_0_0_30px_rgba(255,255,255,0.25)] hover:border-[#F6E1C3] hover:shadow-[0_0_75px_rgba(216,178,130,0.75),inset_0_0_40px_rgba(255,255,255,0.4)]",
                        "border-[#D8B282]/70 bg-radial from-white/90 via-[#FDF9F2]/95 to-[#EDE4D8] shadow-[0_10px_35px_rgba(140,101,59,0.25),inset_0_0_20px_rgba(255,255,255,0.8)] hover:border-[#8C653B]",
                        "border-yellow-300 bg-black text-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.5)]"
                      )
                    }`}
                  >
                    <div className="absolute inset-3 rounded-full border border-[#D8B282]/30 border-dashed animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse" }} />
                    <div className="w-8 h-8 rounded-full bg-[#D8B282]/25 border border-[#D8B282]/60 flex items-center justify-center shadow-md mb-1.5 group-hover:scale-110 transition-transform relative z-10">
                      <ShieldCheck className="w-4 h-4 text-[#F6E1C3]" />
                    </div>
                    <p className={`text-3xl sm:text-4xl font-black font-serif tracking-tight leading-none drop-shadow-[0_0_15px_rgba(216,178,130,0.5)] relative z-10 ${
                      themeClass("text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]", "text-transparent bg-clip-text bg-gradient-to-r from-[#181512] via-[#8C653B] to-[#C29B69]", "text-yellow-300")
                    }`}>
                      {t.stat4Num}
                    </p>
                    <p className={`text-xs sm:text-sm font-black mt-1 uppercase tracking-wider leading-tight relative z-10 ${themeClass("text-white", "text-[#181512]", "text-white")}`}>
                      {t.stat4Title}
                    </p>
                    <p className={`text-[10px] mt-0.5 leading-tight font-normal max-w-[130px] relative z-10 ${themeClass("text-slate-200", "text-[#5A4F43]", "text-yellow-100")}`}>
                      {t.stat4Desc}
                    </p>
                    <span className="mt-2 text-[8px] font-mono font-bold tracking-widest text-[#D8B282] uppercase px-2 py-0.5 rounded-full bg-[#D8B282]/15 border border-[#D8B282]/30 relative z-10">
                      HANOIBA VETTED
                    </span>
                  </motion.div>
                  <div className="w-1.5 h-3.5 bg-gradient-to-b from-[#D8B282] via-[#F6E1C3] to-transparent rounded-b-full shadow-[0_0_10px_#D8B282] mt-0.5 opacity-90" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {heroSlide === 1 && (
            /* SLIDE 2 BOTTOM: STREAMLINED 4-PILLAR EXECUTIVE VETTING STRIP (BẢO CHỨNG C-LEVEL TINH GỌN KHÔNG CỒNG KỀNH) */
            <motion.div
              key="hero-bottom-pillars"
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mt-14 relative z-20 max-w-7xl mx-auto px-2"
            >
              {/* Header Label Bar */}
              <div className="flex items-center justify-between px-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D8B282]">
                    TIÊU CHUẨN THẨM ĐỊNH BAN LÃNH ĐẠO C-LEVEL • HANOIBA 1983
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  4/4 TRỤ CỘT BẢO CHỨNG
                </span>
              </div>

              {/* 4 Compact Vetting Ribbon Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    num: "01",
                    title: "Tiêu Chuẩn Chủ Tịch",
                    metric: ">20 Tỷ / Năm",
                    badge: "DOANH THU",
                    icon: <Crown className="w-4 h-4 text-[#F6E1C3]" />,
                  },
                  {
                    num: "02",
                    title: "Bảo Chứng HanoiBA",
                    metric: "100% Vetted",
                    badge: "PHÁP LÝ & UY TÍN",
                    icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    num: "03",
                    title: "Mastermind C-Level",
                    metric: "1 Buổi / Tháng",
                    badge: "CHIẾN LƯỢC KÍN",
                    icon: <Zap className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    num: "04",
                    title: "Cam Kết Tương Trợ",
                    metric: "Zero Spam",
                    badge: "VĂN HÓA ĐỒNG NIÊN",
                    icon: <Handshake className="w-4 h-4 text-[#D8B282]" />,
                  },
                ].map((pillar, pIdx) => (
                  <motion.div
                    key={pIdx}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`p-4 rounded-2xl border backdrop-blur-xl transition-all flex items-center justify-between gap-3 shadow-md ${
                      themeClass(
                        "border-[#D8B282]/35 bg-gradient-to-r from-[#0B152B]/95 to-[#050B18]/95 shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-white/95 shadow-sm hover:border-[#8C653B]",
                        "border-yellow-400 bg-black text-yellow-300"
                      )
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        {pillar.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[10px] font-mono font-bold text-[#D8B282]`}>
                          TRỤ CỘT #{pillar.num} • {pillar.badge}
                        </p>
                        <h4 className={`text-xs font-black truncate ${themeClass("text-white", "text-slate-900", "text-white")}`}>
                          {pillar.title}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F6E1C3] to-[#D8B282]">
                        {pillar.metric}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {heroSlide === 2 && (
            /* SLIDE 3 BOTTOM: 3-STEP KYC ONBOARDING GLASS PATHWAY (Quy trình thẩm định minh bạch 3 bước) */
            <motion.div
              key="hero-bottom-kyc-pathway"
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mt-14 relative z-20 max-w-7xl mx-auto px-2"
            >
              {/* Header Label Bar */}
              <div className="flex items-center justify-between px-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D8B282]">
                    LỘ TRÌNH THẨM ĐỊNH & CẤP THẺ TITANIUM VIP PASS (3 BƯỚC)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
                  THỜI GIAN PHÊ DUYỆT: 24 - 48H
                </span>
              </div>

              {/* 3 Step Pathway Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {[
                  {
                    step: "01",
                    title: "Nộp Hồ Sơ Doanh Nghiệp",
                    desc: "Cung cấp mã số thuế, báo cáo doanh thu >20 tỷ/năm và xác thực danh tính C-Level.",
                    status: "BƯỚC 1 • ĐỐI SOÁT",
                    icon: <Building2 className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    step: "02",
                    title: "Thẩm Định & Phỏng Vấn",
                    desc: "Ban kiểm duyệt HanoiBA xác thực năng lực pháp lý và gặp gỡ trực tiếp trao đổi 1:1.",
                    status: "BƯỚC 2 • BẢO CHỨNG",
                    icon: <ShieldCheck className="w-4 h-4 text-[#F6E1C3]" />,
                  },
                  {
                    step: "03",
                    title: "Cấp Thẻ Titanium NFC",
                    desc: "Trao thẻ Titanium định danh VIP Pass, kích hoạt tài khoản sàn Deal Room >5.000 Tỷ VNĐ.",
                    status: "BƯỚC 3 • KẾT NỐI",
                    icon: <Crown className="w-4 h-4 text-emerald-400" />,
                  },
                ].map((st, sIdx) => (
                  <motion.div
                    key={sIdx}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`p-5 rounded-3xl border backdrop-blur-xl transition-all flex flex-col justify-between ${
                      themeClass(
                        "border-[#D8B282]/40 bg-gradient-to-br from-[#0C1A36]/90 via-[#071022]/90 to-[#030610]/95 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:border-[#F6E1C3]",
                        "border-[#D8B282]/50 bg-white/95 shadow-sm hover:border-[#8C653B]",
                        "border-yellow-400 bg-black text-yellow-300"
                      )
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D8B282]/15 text-[#F6E1C3] border border-[#D8B282]/30">
                          {st.status}
                        </span>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          {st.icon}
                        </div>
                      </div>
                      <h4 className={`text-sm font-black ${themeClass("text-white", "text-slate-900", "text-white")}`}>
                        {st.title}
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed ${themeClass("text-slate-300", "text-slate-600", "text-yellow-100")}`}>
                        {st.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-[#D8B282]/20 flex items-center justify-between text-[10px] font-mono text-[#D8B282] font-bold">
                      <span>BƯỚC {st.step}</span>
                      <span>TIÊU CHUẨN ISO ●</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </section>
      </SectionFlip3D>

      {/* =======================================
          SECTION 2: BAN LÃNH ĐẠO & CỐ VẤN CHIẾN LƯỢC (OCEAN WAVE & FLOATING CRYSTAL BUBBLES - MATCHING MOCKUP)
          ======================================= */}
      <SectionSlideLeft id="leadership">
        <section
          className={`py-24 md:py-32 relative overflow-hidden border-t transition-colors duration-500 ${
          themeClass(
            "border-[#D8B282]/25 bg-gradient-to-b from-[#02040A] via-[#040C20] to-[#02040A]",
            "border-[#D8B282]/30 bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#FAF8F5]",
            "border-yellow-400 bg-black"
          )
        }`}
      >
        {/* Luxury Gold Grid Background GIF */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
          style={{
            backgroundImage: "url('/landing/luxury-gold-grid.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header Matching Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            {/* Top Pill Capsule */}
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase font-mono border backdrop-blur-md shadow-md mb-4 ${
                themeClass(
                  "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15 shadow-[0_0_20px_rgba(216,178,130,0.2)]",
                  "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30 shadow-sm",
                  "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                )
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#D8B282] animate-spin-slow" />
              <span>CHƯƠNG TRÌNH ĐẦU TÀU NHIỆM KỲ 2025 – 2028</span>
            </div>

            {/* Main Title */}
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight ${themeClass("text-white", "text-[#181512]", "text-yellow-300")}`}>
              BAN LÃNH ĐẠO & CỐ VẤN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B]">
                CHIẾN LƯỢC
              </span>
            </h2>

            <p className={`mt-3 text-sm sm:text-base leading-relaxed ${themeClass("text-slate-300", "text-[#4A3F35]", "text-yellow-100")}`}>
              Những thuyền trưởng bản lĩnh dẫn dắt liên minh doanh nghiệp 1983 kiến tạo chuẩn mực giao thương và chia sẻ giá trị bền vững.
            </p>

            <p className={`text-xs font-mono mt-3 inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border ${
              themeClass("border-[#D8B282]/30 bg-black/40 text-[#D8B282]", "border-[#D8B282]/40 bg-white/70 text-[#8C653B]", "border-yellow-400 bg-zinc-900 text-yellow-300")
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#D8B282] animate-ping" />
              <span>Chạm vào bong bóng avatar nổi trên sóng để xem hồ sơ chiến lược</span>
            </p>
          </motion.div>

          {/* Oceanic Floating Stage with Crystal Glass Bubbles & Realistic Caustic Waves */}
          <div
            className={`relative w-full min-h-[620px] lg:min-h-[680px] rounded-3xl border overflow-hidden p-6 sm:p-10 flex flex-col justify-between shadow-[0_25px_80px_rgba(0,0,0,0.85)] ${
              themeClass("border-[#D8B282]/40 bg-[#061224]/90 backdrop-blur-2xl", "border-[#D8B282]/40 bg-[#F5EFE4] backdrop-blur-2xl", "border-yellow-400 bg-black")
            }`}
          >
            {/* High-Resolution Oceanic Wave Layer with Caustics & Sunbeams */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80"
                alt="Ocean Waves"
                className="w-full h-full object-cover opacity-25 brightness-75 contrast-125 saturate-150 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040C1E] via-[#040C1E]/60 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#D8B28218,transparent_70%)]" />

              {/* Multi-Layered SVG Caustic Wave Animation */}
              <svg className="absolute bottom-16 left-0 w-[200%] h-[280px] animate-[floatingWave_8s_ease-in-out_infinite] opacity-40" viewBox="0 0 2880 280" fill="none" preserveAspectRatio="none">
                <path
                  d="M0,140 C320,220,640,60,960,140 C1280,220,1600,60,1920,140 C2240,220,2560,60,2880,140 L2880,280 L0,280 Z"
                  fill="url(#deepWaveGrad2)"
                />
                <defs>
                  <linearGradient id="deepWaveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#0369A1" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0B132B" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
              </svg>

              <svg className="absolute bottom-12 left-0 w-[200%] h-[240px] animate-[floatingWave_6s_ease-in-out_infinite_reverse] opacity-60" viewBox="0 0 2880 240" fill="none" preserveAspectRatio="none">
                <path
                  d="M0,100 C280,180,560,20,840,100 C1120,180,1400,20,1680,100 C1960,180,2240,20,2520,100 L2880,100 L2880,240 L0,240 Z"
                  fill="url(#goldWaveGrad2)"
                />
                <defs>
                  <linearGradient id="goldWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D8B282" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#F6E1C3" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#8C653B" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Floating 6 Crystal Glass Avatar Spheres on Water Crest (Exact Mockup Layout) */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 items-end justify-items-center pt-8 pb-8">
              {leaders.map((leader, index) => {
                const isActive = activeLeaderIdx === index;
                return (
                  <div key={index} className="flex flex-col items-center group relative cursor-pointer">
                    {/* Upper Frosted Pill Nameplate Above Bubble */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: leader.floatDelay }}
                      className={`mb-3 px-3 py-1.5 rounded-xl text-center backdrop-blur-md border transition-all duration-300 shadow-md ${
                        isActive
                          ? "bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 border-white ring-2 ring-[#D8B282] scale-105 z-30 shadow-[0_0_20px_rgba(216,178,130,0.6)]"
                          : themeClass("bg-[#071328]/85 text-[#F6E1C3] border-[#D8B282]/40 group-hover:border-[#D8B282]", "bg-white/90 text-[#181512] border-[#D8B282]/50 group-hover:border-[#8C653B]", "bg-black text-yellow-300 border-yellow-400")
                      }`}
                    >
                      <p className={`text-[11.5px] font-bold truncate max-w-[120px] leading-tight ${isActive ? "text-slate-950 font-black" : themeClass("text-white", "text-[#181512]", "text-white")}`}>
                        {leader.name}
                      </p>
                      <p className={`text-[9px] font-mono uppercase tracking-wider truncate max-w-[115px] ${isActive ? "text-slate-900 font-extrabold" : themeClass("text-[#D8B282]", "text-[#8C653B]", "text-yellow-300")}`}>
                        {leader.badge}
                      </p>
                    </motion.div>

                    {/* Crystal Glass Bubble Orb with Caustic Refraction */}
                    <button
                      type="button"
                      onClick={() => selectLeader(index)}
                      className={`relative rounded-full p-2 transition-all duration-300 cursor-pointer focus:outline-none ${
                        isActive
                          ? "scale-115 z-20"
                          : "hover:scale-108 opacity-95 hover:opacity-100 z-10"
                      }`}
                      style={{
                        animation: `waterBobbing 4.5s ease-in-out infinite`,
                        animationDelay: `${leader.floatDelay}s`,
                      }}
                    >
                      {/* Crystal Sphere Glass Outer Shell */}
                      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full p-[3px] transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-tr from-[#F6E1C3] via-[#D8B282] to-[#FFFFFF] shadow-[0_0_45px_rgba(216,178,130,0.9),inset_0_0_20px_rgba(255,255,255,0.7)] ring-4 ring-[#D8B282]"
                          : "bg-gradient-to-tr from-[#38BDF8]/40 via-[#D8B282]/40 to-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(216,178,130,0.5)]"
                      }`}>
                        {/* Leader Avatar Inside Sphere */}
                        <img
                          src={leader.avatar}
                          alt={leader.name}
                          className="w-full h-full rounded-full object-cover shadow-inner group-hover:brightness-110 transition-all"
                        />

                        {/* Top Curved Glass Glare Specular Highlight */}
                        <div className="absolute top-1.5 left-3 right-3 h-5 rounded-t-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                        
                        {/* Bottom Iridescent Caustic Rim */}
                        <div className="absolute bottom-1 left-3 right-3 h-3 rounded-b-full bg-gradient-to-t from-[#38BDF8]/40 to-transparent pointer-events-none" />
                      </div>

                      {/* Seafoam Splash Droplets Underneath Sphere */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5 pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-white/70 animate-ping opacity-80" />
                        <span className="w-3.5 h-1.5 rounded-full bg-[#38BDF8]/60 blur-[1px]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Carousel Indicator Dots Under the Waves */}
            <div className="relative z-10 flex items-center justify-center gap-2 py-2">
              {leaders.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => selectLeader(dotIdx)}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    activeLeaderIdx === dotIdx
                      ? "w-8 bg-gradient-to-r from-[#F6E1C3] to-[#D8B282] shadow-[0_0_12px_rgba(216,178,130,0.8)]"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Bottom Leader Profile Showcase Bar (Matching Image 2 Spotlight Bar) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLeaderIdx}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className={`mt-4 p-5 sm:p-7 rounded-3xl border shadow-2xl relative overflow-hidden z-20 backdrop-blur-2xl ${
                  themeClass(
                    "border-[#D8B282]/50 bg-gradient-to-r from-[#07162C]/95 via-[#0A1A36]/90 to-[#040D1D]/95 shadow-[0_20px_60px_rgba(0,0,0,0.9)]",
                    "border-[#D8B282]/50 bg-white/95 shadow-[0_15px_45px_rgba(140,101,59,0.15)]",
                    "border-yellow-400 bg-black"
                  )
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8B282] to-transparent" />

                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left: Framed Avatar with Floating Bubbles */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-[2.5px] bg-gradient-to-tr from-[#F6E1C3] via-[#D8B282] to-[#8C653B] shadow-xl">
                      <img
                        src={leaders[activeLeaderIdx].avatar}
                        alt={leaders[activeLeaderIdx].name}
                        className="w-full h-full rounded-[14px] object-cover"
                      />
                      {/* Floating mini glass bubble decoration */}
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-tr from-[#38BDF8] to-white/80 p-0.5 shadow-md flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg sm:text-xl font-black ${themeClass("text-white", "text-[#181512]", "text-yellow-300")}`}>
                          {leaders[activeLeaderIdx].name}
                        </h3>
                        <Volume2 className="w-4 h-4 text-[#D8B282] cursor-pointer hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#D8B282]">
                        {leaders[activeLeaderIdx].role}
                      </p>
                      <p className={`text-[11.5px] font-normal leading-tight ${themeClass("text-slate-300", "text-[#4A3F35]", "text-yellow-100")}`}>
                        {leaders[activeLeaderIdx].company}
                      </p>
                    </div>
                  </div>

                  {/* Center: Frosted Quote Capsule */}
                  <div className="flex-1 max-w-xl text-left">
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed italic backdrop-blur-md ${
                        themeClass(
                          "bg-black/40 border-[#D8B282]/30 text-[#F6E1C3]",
                          "bg-[#FAF8F5] border-[#D8B282]/40 text-[#5A4F43]",
                          "bg-zinc-900 border-yellow-400 text-yellow-200"
                        )
                      }`}
                    >
                      "{leaders[activeLeaderIdx].quote}"
                    </div>
                  </div>

                  {/* Right: Gold Gradient CTA Button */}
                  <div className="flex flex-col items-center lg:items-end justify-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleJoinClick}
                      className="px-7 py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_30px_rgba(216,178,130,0.6)] hover:shadow-[0_0_45px_rgba(216,178,130,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Kết Nối Doanh Nghiệp →
                    </button>
                    <span className={`text-[10.5px] font-mono ${themeClass("text-slate-400", "text-slate-600", "text-yellow-200")}`}>
                      Đầu tàu liên minh doanh nghiệp 1983
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </section>
      </SectionSlideLeft>

      {/* =======================================
          SECTION 3: QUẦN THỂ CAO ỐC TĂNG TRƯỞNG (6 STRATEGIC TOWERS WITH DUAL-SIDE SLIDING ANIMATION & RICH SKYLINE ATMOSPHERE)
          ======================================= */}
      <SectionSlideRight id="timeline">
        <section
          className={`py-20 md:py-28 relative overflow-hidden border-t transition-colors duration-500 ${
            themeClass(
              "border-[#D8B282]/25 bg-gradient-to-b from-[#020510] via-[#050B1C] to-[#02040A]",
              "border-[#D8B282]/30 bg-gradient-to-b from-[#FAF7F2] via-[#F3EDE2] to-[#FAF8F5]",
              "border-yellow-400 bg-black"
            )
          }`}
        >
          {/* Multi-Layer Atmospheric Background Environments (PHẦN CHÌM - OUTER ATMOSPHERE) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Themed Real Skyline Perspective Image Backdrop with Collective United Hands */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/landing/skyline_united_hands.jpg"
                alt="Collective United Hands Supporting Skyline"
                className={`w-full h-full object-cover object-center transition-all duration-700 scale-105 ${
                  themeMode === "light"
                    ? "opacity-45 filter brightness-115 contrast-110"
                    : themeMode === "contrast"
                    ? "opacity-80 filter contrast-145 brightness-95"
                    : "opacity-65 filter brightness-100 contrast-125"
                }`}
              />
            </div>

            {/* Outer Atmosphere Gradient Overlays for Seamless Edge Blending */}
            <div
              className={`absolute inset-0 transition-colors duration-500 ${
                themeClass(
                  "bg-gradient-to-b from-[#020510]/85 via-[#050B1C]/75 to-[#02040A]/95",
                  "bg-gradient-to-b from-[#FAF7F2]/85 via-[#F3EDE2]/70 to-[#FAF8F5]/90",
                  "bg-gradient-to-b from-black/90 via-black/80 to-black/95"
                )
              }`}
            />

            {/* Ambient Horizon Light Spotlights & Radial Flares */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[480px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(216,178,130,0.22),transparent_70%)] blur-[95px]" />
            <div className="absolute bottom-10 left-10 w-[450px] h-[320px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15),transparent_70%)] blur-[85px]" />
            <div className="absolute bottom-10 right-10 w-[450px] h-[320px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(216,178,130,0.18),transparent_70%)] blur-[85px]" />

            {/* Outer Architectural Perspective Grid Floor */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeMode === "light" ? "rgba(140,101,59,0.18)" : "rgba(216,178,130,0.14)"} 1px, transparent 1px), linear-gradient(to bottom, ${themeMode === "light" ? "rgba(140,101,59,0.18)" : "rgba(216,178,130,0.14)"} 1px, transparent 1px)`,
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(ellipse at 50% 60%, black 40%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at 50% 60%, black 40%, transparent 80%)",
              }}
            />

            {/* Outer Blueprint Horizon Scan Lines */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-48 pointer-events-none ${
                themeClass(
                  "bg-gradient-to-t from-[#020510] via-[#020510]/80 to-transparent",
                  "bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent",
                  "bg-gradient-to-t from-black via-black/80 to-transparent"
                )
              }`}
            />
          </div>

          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Outer Architectural Container (PHẦN NỔI - INNER STAGE CONTAINER) */}
            <div
              className={`relative p-5 sm:p-8 lg:p-10 rounded-[36px] border overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.85)] ${
                themeClass(
                  "border-[#D8B282]/50 bg-[#070D1E]/80 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(246,225,195,0.3)]",
                  "border-[#D8B282]/60 bg-[#FFFDF9]/85 backdrop-blur-2xl shadow-[0_25px_70px_rgba(140,101,59,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]",
                  "border-yellow-400 bg-black/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(250,204,21,0.2)]"
                )
              }`}
            >
              {/* Inner Stage Background: High-Def Theme Skyline + Perspective Floor & Horizon Ray */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Inner Themed City Skyline Backdrop with Collective United Hands */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src="/landing/skyline_united_hands.jpg"
                    alt="Collective United Hands Supporting Skyline"
                    className={`w-full h-full object-cover object-bottom transition-all duration-700 ${
                      themeMode === "light"
                        ? "opacity-40 filter brightness-110 contrast-110"
                        : themeMode === "contrast"
                        ? "opacity-60 filter contrast-145"
                        : "opacity-50 filter brightness-95 contrast-125"
                    }`}
                  />
                </div>

                {/* Stage Ambient Glow & Ground Runway Lighting */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-72 ${
                    themeClass(
                      "bg-gradient-to-t from-[#09152B]/95 via-[#070D1E]/70 to-transparent",
                      "bg-gradient-to-t from-[#F5EADB]/90 via-[#FFFDF9]/60 to-transparent",
                      "bg-gradient-to-t from-black via-black/80 to-transparent"
                    )
                  }`}
                />

                {/* 3D Isometric Perspective Stage Grid Floor (Nổi & Chìm) */}
                <div
                  className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeMode === "light" ? "rgba(140,101,59,0.25)" : "rgba(216,178,130,0.25)"} 1px, transparent 1px), linear-gradient(to bottom, ${themeMode === "light" ? "rgba(140,101,59,0.25)" : "rgba(216,178,130,0.25)"} 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                    transform: "perspective(450px) rotateX(48deg)",
                    transformOrigin: "bottom center",
                    maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 50%, transparent 100%)",
                  }}
                />

                {/* Center Runway Gold Glow Beam under Towers */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(216,178,130,0.35),transparent_75%)] blur-[25px]" />
              </div>

              {/* Header inside Container */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#D8B282]/30">
                <div className="text-left space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34D399]" />
                    <span className={`text-xs font-mono font-bold uppercase tracking-widest ${themeClass("text-[#D8B282]", "text-[#7C5824] font-black", "text-yellow-400")}`}>
                      FUTURISTIC SKYLINE ARCHITECTURE • 2021 — 2038+
                    </span>
                  </div>
                  <h2 className={`text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight ${themeClass("text-white", "text-[#09152B]", "text-yellow-300")}`}>
                    Quần Thể Cao Ốc Tăng Trưởng Quy Mô Doanh Nghiệp
                  </h2>
                </div>

                {/* TOP-RIGHT TELEMETRY HUD BOX (EXPONENTIAL GROWTH METRIC - KHỚP CHUẨN ẢNH 2) */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl shrink-0 self-start sm:self-auto relative overflow-hidden flex flex-col gap-2 ${
                    themeClass(
                      "border-[#D8B282]/60 bg-[#09152B]/90 shadow-[0_10px_35px_rgba(216,178,130,0.3)]",
                      "border-[#D8B282] bg-white shadow-md",
                      "border-yellow-400 bg-black text-yellow-300"
                    )
                  }`}
                >
                  {/* Top Sci-Fi Corner Brackets */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#D8B282]" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#D8B282]" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#D8B282]" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#D8B282]" />

                  {/* Header Title */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10.5px] font-mono font-black tracking-widest text-[#D8B282] uppercase">
                      EXPONENTIAL GROWTH METRIC
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  {/* HUD Dashboard Graphic: 50% Circular Radial Meter + Vertical Equalizer Chart */}
                  <div className="flex items-center gap-4">
                    {/* Left: 50% Circular Radial Progress Meter */}
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                        <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(216,178,130,0.2)" strokeWidth="3.5" />
                        <circle
                          cx="22"
                          cy="22"
                          r="17"
                          fill="none"
                          stroke="url(#hudMeterGrad)"
                          strokeWidth="3.5"
                          strokeDasharray="106.8"
                          strokeDashoffset="53.4"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="hudMeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF5E6" />
                            <stop offset="100%" stopColor="#D8B282" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xs font-black font-mono ${themeClass("text-white", "text-slate-900", "text-yellow-300")}`}>
                          50%
                        </span>
                      </div>
                    </div>

                    {/* Right: Vertical Equalizer Bar Chart with 14 Animated Bars */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-end gap-1 h-10 px-1 border-b border-[#D8B282]/30 pb-0.5">
                        {[22, 38, 48, 62, 85, 58, 92, 74, 98, 68, 88, 100, 78, 92].map((val, bIdx) => (
                          <motion.div
                            key={bIdx}
                            initial={{ height: 6 }}
                            animate={{ height: `${val}%` }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: bIdx * 0.08,
                              ease: "easeInOut",
                            }}
                            className="w-1.5 rounded-t-xs bg-gradient-to-t from-[#8C653B] via-[#D8B282] to-[#FFF5E6] shadow-[0_0_4px_rgba(216,178,130,0.6)]"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-slate-400 px-0.5">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                        <span>150%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  6 3D ARCHITECTURAL SKYSCRAPERS (3 CHIỀU CAO - RỘNG - SÂU - KHỚP CHUẨN ẢNH 2)
                  Mỗi tòa tháp gồm: Mặt tiền 3D, Mặt hông đổ bóng viễn cận (Depth), Mái Penthouse (Width)
                  ========================================================================= */}
              <div
                className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-end gap-3 sm:gap-4 pt-20 pb-6 min-h-[540px] lg:min-h-[600px] overflow-visible"
                style={{ perspective: "1200px" }}
              >
                {/* Ground Reflective Promenade Baseline */}
                <div className="absolute bottom-6 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8B282]/60 to-transparent blur-[0.5px] pointer-events-none" />

                {/* ─── TOWER 1 (2021 - THÁP KHỞI NGUYÊN) — SLIDE IN FROM LEFT ─── */}
                <motion.div
                  initial={{ x: -280, y: 30, opacity: 0, scale: 0.85, rotateY: 18 }}
                  whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 130, damping: 15, delay: 0.12 }}
                  onClick={() => setActiveMilestone(0)}
                  className="flex flex-col items-center group cursor-pointer w-full relative"
                >
                  {/* Floating Badges */}
                  <div className="mb-3 flex flex-col items-center relative z-20">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold border shadow-md whitespace-nowrap ${
                      themeClass(
                        "bg-[#0B152B]/95 text-[#F6E1C3] border-[#D8B282]/70 shadow-[0_0_14px_rgba(216,178,130,0.35)]",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      50+ CEO C-Level
                    </span>
                  </div>

                  {/* 3D Isometric Building Model Container */}
                  <div className="relative w-full max-w-[140px] h-[230px] flex items-end justify-center">
                    {/* Front Facade + Seamless Depth Wrapper */}
                    <div className="relative w-full h-full flex items-end">
                      {/* FRONT FACADE (MẶT TIỀN KÍNH KIẾN TRÚC) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-sm border-2 overflow-hidden transition-all duration-300 z-10 ${
                          activeMilestone === 0
                            ? "border-[#F6E1C3] shadow-[0_0_35px_rgba(216,178,130,0.7)] brightness-115 scale-[1.02]"
                            : "border-[#D8B282]/50 opacity-90 group-hover:opacity-100 group-hover:border-[#D8B282]"
                        } ${
                          themeClass(
                            "bg-gradient-to-t from-[#09152B] via-[#0E2042] to-[#18366E]",
                            "bg-gradient-to-t from-[#D2BA93] via-[#EDE0CF] to-[#FFFFFF] border-[#8C653B]/70 shadow-lg",
                            "bg-gradient-to-t from-black to-zinc-900"
                          )
                        }`}
                      >
                        {/* 3D Roof Penthouse Cap */}
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#FFF5E6] via-[#D8B282] to-[#8C653B] border-b border-[#D8B282]/40" />

                        {/* Slender Vertical Glass Mullions */}
                        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#D8B282]/30 to-transparent" />
                        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#D8B282]/30 to-transparent" />

                        {/* Window Matrix Grid */}
                        <div className="absolute inset-0 pt-3 p-1 grid grid-rows-8 gap-1">
                          {Array.from({ length: 8 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-around px-1 ${themeClass("border-[#D8B282]/20", "border-[#8C653B]/20", "border-yellow-400/20")}`}>
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/60 shadow-[0_0_3px_#D8B282]", "bg-[#7C5824]/60", "bg-yellow-300")}`} />
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/60 shadow-[0_0_3px_#D8B282]", "bg-[#7C5824]/60", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>
                        {/* Ground Entrance Lobby */}
                        <div className="absolute bottom-0 inset-x-2 h-4 bg-[#D8B282]/30 border-t border-[#D8B282] rounded-t-xs flex items-center justify-center">
                          <span className="w-2 h-2.5 bg-white/70 rounded-t-xs" />
                        </div>
                      </div>

                      {/* RIGHT DEPTH FACET (MẶT HÔNG 3D LIỀN MẠCH - KHÔNG HỞ) */}
                      <div
                        className={`w-3.5 sm:w-4 h-[calc(100%-4px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#D8B282]/40 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#060D1E] via-[#040814] to-[#02040A]",
                            "bg-gradient-to-b from-[#9C7A4E] via-[#7A5B32] to-[#5A3F1E]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-3 p-0.5 grid grid-rows-8 gap-1 opacity-50">
                          {Array.from({ length: 8 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/25" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base Plinth */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm ${
                      themeClass(
                        "bg-[#02050E] text-[#D8B282] border-[#D8B282]/60",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      2021 • Khởi Nguyên
                    </span>
                  </div>
                </motion.div>

                {/* ─── TOWER 2 (2023 - THÁP HỘI TỤ) ─── */}
                <motion.div
                  initial={{ x: -200, y: 25, opacity: 0, scale: 0.88, rotateY: 14 }}
                  whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 135, damping: 15, delay: 0.2 }}
                  onClick={() => setActiveMilestone(1)}
                  className="flex flex-col items-center group cursor-pointer w-full relative"
                >
                  {/* Floating Pill Badge: Single Clean Metric */}
                  <div className="mb-3 text-center relative z-20 flex flex-col items-center">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold border-2 shadow-lg block whitespace-nowrap ${
                      themeClass(
                        "bg-[#0C1A36]/95 text-[#F6E1C3] border-[#D8B282] shadow-[0_0_15px_rgba(216,178,130,0.5)]",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      1.200 Tỷ VNĐ
                    </span>
                  </div>

                  {/* 3D Isometric Building Model Container */}
                  <div className="relative w-full max-w-[140px] h-[280px] flex items-end justify-center">
                    <div className="relative w-full h-full flex items-end">
                      {/* FRONT FACADE (MẶT TIỀN THÁP HỘI TỤ) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-sm border-2 overflow-hidden transition-all duration-300 z-10 ${
                          activeMilestone === 1
                            ? "border-[#F6E1C3] shadow-[0_0_40px_rgba(216,178,130,0.7)] brightness-115 scale-[1.02]"
                            : "border-[#D8B282]/50 opacity-90 group-hover:opacity-100 group-hover:border-[#D8B282]"
                        } ${
                          themeClass(
                            "bg-gradient-to-t from-[#0A1832] via-[#102752] to-[#1C3E7C]",
                            "bg-gradient-to-t from-[#CDB289] via-[#EADBCA] to-[#FFFFFF] border-[#8C653B]/70 shadow-xl",
                            "bg-gradient-to-t from-black to-zinc-900"
                          )
                        }`}
                      >
                        {/* Roof Penthouse Crown */}
                        <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-[#FFF5E6] via-[#D8B282] to-[#8C653B] border-b border-[#D8B282]/40" />

                        {/* Vertical LED Accent Mullions */}
                        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#F6E1C3]/60 to-transparent" />
                        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#F6E1C3]/60 to-transparent" />

                        {/* 10-Floor Window Grid */}
                        <div className="absolute inset-0 pt-3.5 p-1 grid grid-rows-10 gap-1">
                          {Array.from({ length: 10 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-around px-1 ${themeClass("border-[#D8B282]/25", "border-[#8C653B]/25", "border-yellow-400/25")}`}>
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/70 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/70", "bg-yellow-300")}`} />
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/70 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/70", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>

                        {/* Ground Grand Portal */}
                        <div className="absolute bottom-0 inset-x-2 h-5 bg-[#D8B282]/35 border-t border-[#D8B282] rounded-t-xs flex items-center justify-center">
                          <span className="w-2.5 h-3 bg-white/80 rounded-t-xs shadow-[0_0_6px_#FFF]" />
                        </div>
                      </div>

                      {/* RIGHT DEPTH FACET (MẶT HÔNG 3D) */}
                      <div
                        className={`w-3.5 sm:w-4.5 h-[calc(100%-5px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#D8B282]/45 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#081224] via-[#050C1A] to-[#02050E]",
                            "bg-gradient-to-b from-[#A58252] via-[#856338] to-[#5C4120]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-3.5 p-0.5 grid grid-rows-10 gap-1 opacity-55">
                          {Array.from({ length: 10 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/30" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base Label */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm ${
                      themeClass(
                        "bg-[#09152B]/90 text-[#F6E1C3] border-[#D8B282]/50 shadow-md",
                        "bg-white text-[#09152B] border-[#D8B282] shadow-sm font-bold",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      2023 • Tháp Hội Tụ
                    </span>
                  </div>
                </motion.div>

                {/* ─── TOWER 3 (2024 - THÁP BẮC - NAM - MÁI DỐC KIẾN TRÚC KÍNH) ─── */}
                <motion.div
                  initial={{ x: -120, y: 20, opacity: 0, scale: 0.9, rotateY: 10 }}
                  whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 140, damping: 15, delay: 0.28 }}
                  onClick={() => setActiveMilestone(2)}
                  className="flex flex-col items-center group cursor-pointer w-full relative"
                >
                  {/* Floating Pill Badge: Single Clean Metric */}
                  <div className="mb-3 text-center relative z-20 flex flex-col items-center">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold border-2 shadow-lg block whitespace-nowrap ${
                      themeClass(
                        "bg-[#0C1A36]/95 text-[#F6E1C3] border-[#D8B282] shadow-[0_0_15px_rgba(216,178,130,0.5)]",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      500+ Doanh Nghiệp
                    </span>
                  </div>

                  {/* 3D Isometric Building Model Container */}
                  <div className="relative w-full max-w-[140px] h-[340px] flex items-end justify-center">
                    <div className="relative w-full h-full flex items-end">
                      {/* FRONT FACADE (MẶT TIỀN THÁP BẮC - NAM) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-sm border-2 overflow-hidden transition-all duration-300 z-10 ${
                          activeMilestone === 2
                            ? "border-[#F6E1C3] shadow-[0_0_40px_rgba(216,178,130,0.7)] brightness-115 scale-[1.02]"
                            : "border-[#D8B282]/50 opacity-90 group-hover:opacity-100 group-hover:border-[#D8B282]"
                        } ${
                          themeClass(
                            "bg-gradient-to-t from-[#091630] via-[#0E244E] to-[#183A78]",
                            "bg-gradient-to-t from-[#C5A77C] via-[#E8D4BF] to-[#FFFFFF] border-[#8C653B]/70 shadow-xl",
                            "bg-gradient-to-t from-black to-zinc-900"
                          )
                        }`}
                      >
                        {/* Sloped Penthouse Glass Roof */}
                        <div
                          className="absolute top-0 inset-x-0 h-6 bg-gradient-to-r from-[#FFF5E6] via-[#D8B282] to-[#8C653B] border-b border-[#D8B282]/40"
                          style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)" }}
                        />

                        {/* 12-Floor Window Grid */}
                        <div className="absolute inset-0 pt-7 p-1 grid grid-rows-12 gap-0.5">
                          {Array.from({ length: 12 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-around px-1 ${themeClass("border-[#D8B282]/25", "border-[#8C653B]/25", "border-yellow-400/25")}`}>
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/70 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/70", "bg-yellow-300")}`} />
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/70 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/70", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>

                        {/* Ground Canopy */}
                        <div className="absolute bottom-0 inset-x-1.5 h-5 bg-[#D8B282]/35 border-t border-[#D8B282] rounded-t-xs" />
                      </div>

                      {/* RIGHT DEPTH FACET (MẶT HÔNG 3D MÁI DỐC) */}
                      <div
                        className={`w-3.5 sm:w-4.5 h-[calc(100%-6px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#D8B282]/45 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#081224] via-[#050C1A] to-[#02050E]",
                            "bg-gradient-to-b from-[#A58252] via-[#856338] to-[#5C4120]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-7 p-0.5 grid grid-rows-12 gap-0.5 opacity-55">
                          {Array.from({ length: 12 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/30" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base Label */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm ${
                      themeClass(
                        "bg-[#09152B]/90 text-[#F6E1C3] border-[#D8B282]/50 shadow-md",
                        "bg-white text-[#09152B] border-[#D8B282] shadow-sm font-bold",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      2024 • Tháp Bắc - Nam
                    </span>
                  </div>
                </motion.div>

                {/* ─── TOWER 4 (2025 - ĐẠI THÁP BỨT PHÁ - DUBAI BURJ SPIRE - TRỌNG TÂM KIẾN TRÚC) ─── */}
                <motion.div
                  initial={{ y: 220, opacity: 0, scale: 0.85 }}
                  whileInView={{ y: 0, opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 150, damping: 16, delay: 0.1 }}
                  onClick={() => setActiveMilestone(3)}
                  className="flex flex-col items-center group cursor-pointer w-full relative z-30"
                >
                  {/* DAZZLING STARBURST SUN FLARE BEACON ON TOP OF BURJ KHALIFA SPIRE */}
                  <div className="relative mb-3 flex flex-col items-center">
                    {/* Pulsing Sun Halo & Radial Rays */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-36 pointer-events-none flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[radial-gradient(ellipse_at_center,#FFFFFF_0%,#F6E1C3_40%,#D8B282_70%,transparent_100%)] blur-[10px] animate-pulse" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,245,230,0.9),transparent_65%)] blur-[16px]" />
                    </div>

                    {/* SVG 8-Point Starburst Sunflare */}
                    <div className="w-14 h-14 relative z-20 drop-shadow-[0_0_25px_rgba(255,245,230,1)] animate-spin-slow" style={{ animationDuration: "18s" }}>
                      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                        <polygon points="50,0 54,42 96,46 56,54 50,100 44,54 4,46 46,42" fill="url(#sunburstGradSpire)" />
                        <polygon points="18,18 45,45 82,18 55,55 82,82 55,55 18,82 45,45" fill="url(#sunburstGradSpire)" opacity="0.85" />
                        <circle cx="50" cy="50" r="9" fill="#FFFFFF" />
                        <defs>
                          <linearGradient id="sunburstGradSpire" x1="0" y1="0" x2="100" y2="100">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="40%" stopColor="#FFF5E6" />
                            <stop offset="70%" stopColor="#F6E1C3" />
                            <stop offset="100%" stopColor="#D8B282" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Milestone Badge: >5.000 Tỷ VNĐ */}
                    <span className="px-4 py-1 rounded-full text-[11.5px] font-mono font-bold bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] text-slate-950 shadow-[0_0_20px_rgba(216,178,130,0.9)] whitespace-nowrap -mt-1 relative z-20">
                      &gt;5.000 Tỷ VNĐ
                    </span>
                  </div>

                  {/* 3D DUBAI BURJ KHALIFA TOWERING STEPPED SPIRE ARCHITECTURE */}
                  <div className="relative w-full max-w-[150px] h-[450px] flex items-end justify-center">
                    {/* Top Needle Spire Mast & Aircraft Warning Beacon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#EF4444] animate-ping mb-0.5" />
                      <div className="w-[2.5px] h-10 bg-gradient-to-b from-white via-[#F6E1C3] to-[#D8B282] shadow-[0_0_6px_#FFF]" />
                      <div className="w-3.5 h-3 bg-gradient-to-r from-[#FFF5E6] to-[#8C653B] rounded-t-xs border-t border-white" />
                      <div className="w-6 h-3 bg-gradient-to-r from-[#FFF5E6] to-[#8C653B] rounded-t-xs border-t border-white shadow-sm" />
                    </div>

                    {/* Stepped Building Prism Facade */}
                    <div className="relative w-full h-[395px] flex items-end">
                      {/* FRONT FACADE (GIẬT CẤP ĐA TẦNG KIỂU DUBAI BURJ SPIRE) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-md border-2 overflow-hidden transition-all duration-300 z-10 shadow-[0_0_50px_rgba(216,178,130,0.7)] scale-[1.03] ${
                          themeClass(
                            "border-[#F6E1C3] bg-gradient-to-t from-[#0B1A38] via-[#122B5C] to-[#1E428C]",
                            "border-2 border-[#7C5824] bg-gradient-to-t from-[#B89462] via-[#E2CBAD] to-[#FFFFFF] shadow-[0_12px_35px_rgba(140,101,59,0.35)]",
                            "border-yellow-300 bg-gradient-to-t from-black via-zinc-900 to-yellow-950/40"
                          )
                        }`}
                      >
                        {/* Stepped Setback Terraces */}
                        <div className="absolute top-6 inset-x-0 h-2 border-b border-[#F6E1C3]/80 bg-gradient-to-r from-transparent via-[#F6E1C3]/30 to-transparent" />
                        <div className="absolute top-18 inset-x-0 h-2 border-b border-[#F6E1C3]/80 bg-gradient-to-r from-transparent via-[#F6E1C3]/30 to-transparent" />
                        <div className="absolute top-32 inset-x-0 h-2 border-b border-[#F6E1C3]/80 bg-gradient-to-r from-transparent via-[#F6E1C3]/30 to-transparent" />

                        {/* Central Illuminated LED Column */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-r from-transparent via-[#FFF5E6]/70 to-transparent flex flex-col justify-around items-center z-10 pointer-events-none">
                          <span className="w-1.5 h-3 rounded-full bg-[#FFFFFF] shadow-[0_0_10px_#FFF] animate-pulse" />
                          <span className="w-1.5 h-3 rounded-full bg-[#F6E1C3] shadow-[0_0_8px_#F6E1C3] animate-pulse" />
                          <span className="w-1.5 h-3 rounded-full bg-[#D8B282] shadow-[0_0_8px_#D8B282] animate-pulse" />
                          <span className="w-1.5 h-3 rounded-full bg-[#FFFFFF] shadow-[0_0_10px_#FFF] animate-pulse" />
                        </div>

                        {/* 16-Floor Window Matrix Grid */}
                        <div className="absolute inset-0 pt-3 p-1 grid grid-rows-16 gap-0.5">
                          {Array.from({ length: 16 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-between px-1.5 ${themeClass("border-[#D8B282]/35", "border-[#8C653B]/35", "border-yellow-400/35")}`}>
                              <span className={`w-3 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/90 shadow-[0_0_5px_#D8B282]", "bg-[#7C5824]/90", "bg-yellow-300")}`} />
                              <span className={`w-3 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/90 shadow-[0_0_5px_#D8B282]", "bg-[#7C5824]/90", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>

                        {/* Grand High-Rise Base Portal */}
                        <div className="absolute bottom-0 inset-x-2 h-6 bg-[#F6E1C3]/40 border-t-2 border-[#F6E1C3] rounded-t-xs flex items-center justify-center z-10">
                          <span className="w-3.5 h-4 bg-white rounded-t-xs shadow-[0_0_8px_#FFF]" />
                        </div>
                      </div>

                      {/* RIGHT DEPTH FACET (MẶT HÔNG 3D LIỀN KHÍT) */}
                      <div
                        className={`w-4 sm:w-5 h-[calc(100%-6px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#F6E1C3]/60 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#0B1832] via-[#060E1E] to-[#02050E]",
                            "bg-gradient-to-b from-[#9E7848] via-[#7D5B30] to-[#543A1C]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-3 p-0.5 grid grid-rows-16 gap-0.5 opacity-65">
                          {Array.from({ length: 16 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/35" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Gold Base Label */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className="px-3.5 py-1 rounded-md text-[11px] font-mono font-bold bg-gradient-to-r from-[#FFF5E6] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_18px_rgba(216,178,130,0.85)] whitespace-nowrap">
                      2025 • Đại Tháp Bứt Phá
                    </span>
                  </div>
                </motion.div>

                {/* ─── TOWER 5 (2026-2028 - THÁP VƯƠN TẦM) ─── */}
                <motion.div
                  initial={{ x: 180, y: 20, opacity: 0, scale: 0.9, rotateY: -12 }}
                  whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 140, damping: 15, delay: 0.28 }}
                  onClick={() => setActiveMilestone(4)}
                  className="flex flex-col items-center group cursor-pointer w-full relative"
                >
                  {/* Floating Pill Badge: Single Clean Metric */}
                  <div className="mb-3 text-center relative z-20 flex flex-col items-center">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold border-2 shadow-lg block whitespace-nowrap ${
                      themeClass(
                        "bg-[#0C1A36]/95 text-[#F6E1C3] border-[#D8B282] shadow-[0_0_15px_rgba(216,178,130,0.5)]",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      1.000+ Hội Viên
                    </span>
                  </div>

                  {/* 3D Isometric Building Model Container */}
                  <div className="relative w-full max-w-[140px] h-[360px] flex items-end justify-center">
                    <div className="relative w-full h-full flex items-end">
                      {/* FRONT FACADE (MẶT TIỀN THÁP VƯƠN TẦM) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-sm border-2 overflow-hidden transition-all duration-300 z-10 ${
                          activeMilestone === 4
                            ? "border-[#F6E1C3] shadow-[0_0_40px_rgba(216,178,130,0.7)] brightness-115 scale-[1.02]"
                            : "border-[#D8B282]/50 opacity-90 group-hover:opacity-100 group-hover:border-[#D8B282]"
                        } ${
                          themeClass(
                            "bg-gradient-to-t from-[#081328] via-[#0E2248] to-[#18366E]",
                            "bg-gradient-to-t from-[#C5A77C] via-[#E8D4BF] to-[#FFFFFF] border-[#8C653B]/70 shadow-xl",
                            "bg-gradient-to-t from-black to-zinc-900"
                          )
                        }`}
                      >
                        {/* Crown Parapet Deck */}
                        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-[#FFF5E6] via-[#D8B282] to-[#8C653B] border-b border-[#D8B282]/40" />

                        {/* 13-Floor Window Grid */}
                        <div className="absolute inset-0 pt-4 p-1 grid grid-rows-13 gap-0.5">
                          {Array.from({ length: 13 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-around px-1 ${themeClass("border-[#D8B282]/25", "border-[#8C653B]/25", "border-yellow-400/25")}`}>
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/65 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/65", "bg-yellow-300")}`} />
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/65 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/65", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>

                        {/* Ground Entrance */}
                        <div className="absolute bottom-0 inset-x-2 h-5 bg-[#D8B282]/35 border-t border-[#D8B282] rounded-t-xs" />
                      </div>

                      {/* RIGHT DEPTH FACET (MẶT HÔNG 3D) */}
                      <div
                        className={`w-3.5 sm:w-4.5 h-[calc(100%-5px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#D8B282]/45 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#081224] via-[#050C1A] to-[#02050E]",
                            "bg-gradient-to-b from-[#A58252] via-[#856338] to-[#5C4120]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-4 p-0.5 grid grid-rows-13 gap-0.5 opacity-55">
                          {Array.from({ length: 13 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/30" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base Label */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm ${
                      themeClass(
                        "bg-[#09152B]/90 text-[#F6E1C3] border-[#D8B282]/50 shadow-md",
                        "bg-white text-[#09152B] border-[#D8B282] shadow-sm font-bold",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      2026 • Tháp Vươn Tầm
                    </span>
                  </div>
                </motion.div>

                {/* ─── TOWER 6 (2030+ - ĐẠI THÁP KỲ LÂN) — SLIDE IN FROM RIGHT ─── */}
                <motion.div
                  initial={{ x: 280, y: 30, opacity: 0, scale: 0.85, rotateY: -18 }}
                  whileInView={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 130, damping: 15, delay: 0.38 }}
                  onClick={() => setActiveMilestone(5)}
                  className="flex flex-col items-center group cursor-pointer w-full relative"
                >
                  {/* Floating Crown Badge */}
                  <div className="mb-3 text-center relative z-20 flex flex-col items-center">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold border shadow-md block whitespace-nowrap ${
                      themeClass(
                        "bg-gradient-to-r from-[#0C1A36] to-[#060D1E] text-[#F6E1C3] border-[#D8B282] shadow-[0_0_12px_rgba(216,178,130,0.5)]",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      10.000+ Tỷ VNĐ
                    </span>
                  </div>

                  {/* 3D Isometric Building Model Container */}
                  <div className="relative w-full max-w-[140px] h-[390px] flex items-end justify-center">
                    <div className="relative w-full h-full flex items-end">
                      {/* FRONT FACADE (MẶT TIỀN 16 TẦNG) */}
                      <div
                        className={`relative flex-1 h-full rounded-t-sm border-2 overflow-hidden transition-all duration-300 z-10 ${
                          activeMilestone === 5
                            ? "border-[#F6E1C3] shadow-[0_0_40px_rgba(216,178,130,0.7)] brightness-115 scale-[1.02]"
                            : "border-[#D8B282]/50 opacity-90 group-hover:opacity-100 group-hover:border-[#D8B282]"
                        } ${
                          themeClass(
                            "bg-gradient-to-t from-[#081328] via-[#0E2248] to-[#18366E]",
                            "bg-gradient-to-t from-[#CDB289] via-[#EADBCA] to-[#FFFFFF] border-[#8C653B]/70 shadow-xl",
                            "bg-gradient-to-t from-black to-zinc-900"
                          )
                        }`}
                      >
                        {/* Pinnacle Crystal Crown */}
                        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-[#FFFFFF] via-[#D8B282] to-[#8C653B] border-b border-[#D8B282]/40" />

                        {/* 16-Floor Window Matrix Grid */}
                        <div className="absolute inset-0 pt-4 p-1 grid grid-rows-16 gap-0.5">
                          {Array.from({ length: 16 }).map((_, f) => (
                            <div key={f} className={`border-b flex items-center justify-around px-1 ${themeClass("border-[#D8B282]/25", "border-[#8C653B]/25", "border-yellow-400/25")}`}>
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/65 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/65", "bg-yellow-300")}`} />
                              <span className={`w-2.5 h-1.5 rounded-xs ${themeClass("bg-[#F6E1C3]/65 shadow-[0_0_4px_#D8B282]", "bg-[#7C5824]/65", "bg-yellow-300")}`} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RIGHT DEPTH FACET */}
                      <div
                        className={`w-3.5 sm:w-4.5 h-[calc(100%-5px)] mb-0.5 rounded-tr-xs border-y-2 border-r-2 border-[#D8B282]/45 z-0 ${
                          themeClass(
                            "bg-gradient-to-b from-[#081224] via-[#050C1A] to-[#02050E]",
                            "bg-gradient-to-b from-[#A58252] via-[#856338] to-[#5C4120]",
                            "bg-black"
                          )
                        }`}
                      >
                        <div className="h-full pt-4 p-0.5 grid grid-rows-16 gap-0.5 opacity-55">
                          {Array.from({ length: 16 }).map((_, f) => (
                            <div key={f} className="border-b border-[#D8B282]/30" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base Plinth with "2030+" & Label */}
                  <div className="w-full mt-3 flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm ${
                      themeClass(
                        "bg-[#02050E] text-[#D8B282] border-[#D8B282]/60",
                        "bg-white text-[#8C653B] border-[#D8B282] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400"
                      )
                    }`}>
                      2038+ • Tháp Kỳ Lân
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* BOTTOM SPOTLIGHT GLASS CARD (INTERACTIVE DETAIL PANEL) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMilestone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className={`mt-6 p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl backdrop-blur-2xl ${
                    themeClass(
                      "border-[#D8B282]/50 bg-gradient-to-r from-[#071328]/95 via-[#0A1A36]/90 to-[#040D1D]/95 shadow-[0_20px_60px_rgba(0,0,0,0.9)]",
                      "border-[#D8B282]/60 bg-white shadow-[0_15px_45px_rgba(140,101,59,0.15)]",
                      "border-yellow-400 bg-black"
                    )
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8B282] to-transparent" />

                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Left Details */}
                    <div className="space-y-2 text-left flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-black border shadow-sm ${
                          themeClass(
                            "bg-[#D8B282]/25 text-[#F6E1C3] border-[#D8B282]/50",
                            "bg-[#181512] text-[#F6E1C3] border-[#D8B282]",
                            "bg-yellow-400 text-black border-yellow-300"
                          )
                        }`}>
                          {skyscrapers[activeMilestone].year} • {skyscrapers[activeMilestone].tag}
                        </span>
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                          themeClass(
                            "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                            "text-emerald-800 bg-emerald-100/90 border-emerald-400 font-extrabold",
                            "text-yellow-300 bg-yellow-400/20 border-yellow-400"
                          )
                        }`}>
                          {skyscrapers[activeMilestone].subMetric}
                        </span>
                      </div>

                      <h3 className={`text-xl sm:text-2xl font-black ${themeClass("text-white", "text-[#09152B]", "text-yellow-300")}`}>
                        {skyscrapers[activeMilestone].name} — Quy mô: {skyscrapers[activeMilestone].metric}
                      </h3>

                      <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${themeClass("text-slate-300", "text-[#1E293B] font-medium", "text-yellow-100")}`}>
                        {skyscrapers[activeMilestone].desc}
                      </p>
                    </div>

                    {/* Right 3D Chart Pedestal & CTA Button */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-16 h-14 relative hidden sm:block">
                        <svg viewBox="0 0 64 56" fill="none" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                          <polygon points="32,4 58,18 32,32 6,18" fill="url(#chartPlinthTop)" />
                          <polygon points="6,18 32,32 32,52 6,38" fill="url(#chartPlinthLeft)" />
                          <polygon points="58,18 32,32 32,52 58,38" fill="url(#chartPlinthRight)" />
                          <rect x="18" y="14" width="5" height="12" rx="1" fill="#38BDF8" />
                          <rect x="26" y="10" width="5" height="16" rx="1" fill="#818CF8" />
                          <rect x="34" y="6" width="5" height="20" rx="1" fill="#F6E1C3" />
                          <defs>
                            <linearGradient id="chartPlinthTop" x1="6" y1="4" x2="58" y2="32">
                              <stop stopColor="#38BDF8" stopOpacity="0.8" />
                              <stop offset="1" stopColor="#D8B282" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="chartPlinthLeft" x1="6" y1="18" x2="32" y2="52">
                              <stop stopColor="#0B1A38" />
                              <stop offset="1" stopColor="#030816" />
                            </linearGradient>
                            <linearGradient id="chartPlinthRight" x1="58" y1="18" x2="32" y2="52">
                              <stop stopColor="#1E3A6E" />
                              <stop offset="1" stopColor="#0B1A38" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <button
                        type="button"
                        onClick={handleJoinClick}
                        className="px-7 py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_30px_rgba(216,178,130,0.6)] hover:shadow-[0_0_45px_rgba(216,178,130,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        Gia Nhập Lộ Trình →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Tab Capsule: "Lê Hoàng Long • Ban Lãnh Đạo CLB CEO 1983" */}
              <div className="mt-4 flex justify-center">
                <div
                  className={`px-8 py-1.5 rounded-t-2xl border-t border-x text-xs font-mono font-bold tracking-widest uppercase shadow-md ${
                    themeClass("border-[#D8B282]/40 bg-[#0A152D] text-[#F6E1C3]", "border-[#D8B282]/50 bg-white text-[#8C653B]", "border-yellow-400 bg-black text-yellow-300")
                  }`}
                >
                  Lê Hoàng Long • Ban Lãnh Đạo CLB CEO 1983
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionSlideRight>

      {/* =======================================
          SECTION 4: PLANETARY ECOSYSTEM (CONSTELLATION ORBIT WITH 3D CUT-CRYSTAL DIAMOND CENTERPIECE - EXACT MATCH TO IMAGE 2)
          ======================================= */}
      <SectionFlip3D id="ecosystem">
        <section
          className={`py-20 md:py-28 relative overflow-hidden border-t transition-colors duration-500 ${
            themeClass(
              "border-[#D8B282]/25 bg-gradient-to-b from-[#040815] via-[#02040A] to-[#040815]",
              "border-[#D8B282]/30 bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#FAF8F5]",
              "border-yellow-400 bg-black"
            )
          }`}
        >
          {/* Luxury Gold Silk Aurora GIF Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"
            style={{
              backgroundImage: "url('/landing/ceo1983-gold-aurora.gif')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column: Heading & Description (Exact Match Image 2) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-4 text-left space-y-4"
              >
                <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase ${themeClass("text-[#D8B282]", "text-[#8C653B]", "text-yellow-400")}`}>
                  {t.ecoTag}
                </span>

                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-[1.12] tracking-tight ${themeClass("text-white", "text-[#181512]", "text-yellow-300")}`}>
                  CÙNG NHAU TẠO RA <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B]">
                    GIÁ TRỊ LỚN HƠN
                  </span>
                </h2>

                <p className={`text-sm sm:text-base leading-relaxed font-normal ${themeClass("text-slate-300", "text-[#4A3F35]", "text-yellow-100")}`}>
                  {t.ecoDesc}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleJoinClick}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all cursor-pointer shadow-lg group ${
                      themeClass(
                        "bg-[#0B152B] text-[#F6E1C3] border-[#D8B282]/50 hover:border-[#D8B282] hover:bg-[#122142]",
                        "bg-white text-[#181512] border-[#D8B282]/60 hover:bg-[#FAF6F0] shadow-sm",
                        "bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-400/20"
                      )
                    }`}
                  >
                    <span>{t.ecoBtn}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#D8B282]" />
                  </button>
                </div>
              </motion.div>

              {/* Center Column: 3D Faceted Crystal Gemstone Diamond with 8 Equidistant Satellites */}
              <div
                className="lg:col-span-5 flex justify-center items-center relative py-6"
                onMouseEnter={() => setOrbitPaused(true)}
                onMouseLeave={() => setOrbitPaused(false)}
              >
                <div className="absolute w-80 h-80 rounded-full bg-[#D8B282]/20 blur-[120px] pointer-events-none" />

                <div className="relative w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
                  {/* 3 Concentric Gold Luminous Orbit Rings with Particle Streaks */}
                  <div className={`absolute inset-0 rounded-full border border-dashed ${themeClass("border-[#D8B282]/25", "border-[#D8B282]/35", "border-yellow-400/35")}`} />
                  <div className={`absolute inset-10 rounded-full border ${themeClass("border-[#D8B282]/35", "border-[#D8B282]/45", "border-yellow-400/45")}`} />
                  <div className={`absolute inset-20 rounded-full border border-dotted ${themeClass("border-[#D8B282]/45", "border-[#D8B282]/55", "border-yellow-400/55")}`} />

                  {/* 8 Equidistant Rotating Satellites (360° / 8 = 45° Symmetrical Distribution) */}
                  <div className={`absolute inset-0 rounded-full animate-orbit-spin ${orbitPaused ? "paused-spin" : ""}`}>
                    {constellationSatellites.map((sat, sIdx) => {
                      const radius = 185;
                      const angle = (sIdx * 360) / constellationSatellites.length;
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * radius;
                      const y = Math.sin(rad) * radius;
                      const isSelected = activeSatellite === sIdx || (activeSatellite === null && sIdx === 2); // Doanh nghiệp active by default

                      return (
                        <div
                          key={sat.id}
                          onClick={() => setActiveSatellite(sIdx)}
                          className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                          }}
                        >
                          <div className={`animate-orbit-reverse ${orbitPaused ? "paused-spin" : ""}`}>
                            <div
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                                isSelected
                                  ? "bg-gradient-to-r from-[#18130B] via-[#2A1F10] to-[#18130B] text-[#F6E1C3] border-[#D8B282] ring-2 ring-[#D8B282]/80 shadow-[0_0_25px_rgba(216,178,130,0.9)] scale-110"
                                  : themeClass(
                                      "bg-[#090F20]/95 text-white border-[#D8B282]/50 hover:border-[#F6E1C3] shadow-lg",
                                      "bg-white/95 text-[#181512] border-[#D8B282]/60 hover:border-[#8C653B] shadow-md",
                                      "bg-black text-yellow-200 border-yellow-400"
                                    )
                              }`}
                            >
                              <span className={`p-1 rounded-full ${isSelected ? "bg-[#D8B282] text-slate-950" : "bg-[#D8B282]/20 text-[#D8B282]"}`}>
                                {sat.icon}
                              </span>
                              <span className="text-xs font-bold whitespace-nowrap">{sat.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CENTRAL 3D FACETED CRYSTAL GEMSTONE DIAMOND (EXACT MATCH IMAGE 2) */}
                  <div className="relative z-20 w-32 h-32 sm:w-36 sm:h-36 rounded-full p-2 bg-gradient-to-tr from-[#F6E1C3]/40 via-[#D8B282]/30 to-transparent flex items-center justify-center shadow-[0_0_50px_rgba(216,178,130,0.6)] group">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#D8B282] shadow-inner">
                      {/* Crystal Diamond Sphere Texture */}
                      <img
                        src="/crystal_gemstone_diamond.jpg"
                        alt="Crystal Faceted Diamond"
                        className="w-full h-full object-cover scale-115 animate-spin-slow group-hover:scale-125 transition-transform"
                      />
                      <div className="absolute inset-0 bg-[#D8B282]/10 mix-blend-overlay" />

                      {/* CEO 1983 Emblem In Nucleus */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] p-2 text-center">
                        <Crown className="w-6 h-6 text-[#FFF5E6] mb-0.5 animate-pulse drop-shadow-md fill-current" />
                        <span className="text-[8.5px] font-mono font-black tracking-widest text-[#F6E1C3] uppercase leading-none drop-shadow">CEO</span>
                        <span className="text-[8.5px] font-mono font-black tracking-widest text-white uppercase leading-tight drop-shadow">
                          1983
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Slogans + Floating Spotlight Card (Exact Match Image 2) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className={`lg:col-span-3 text-left lg:border-l lg:pl-8 space-y-6 ${themeClass("border-[#D8B282]/30", "border-[#D8B282]/40", "border-yellow-400/40")}`}
              >
                <div className="space-y-4 font-mono font-black text-xs sm:text-sm tracking-wider">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-[#D8B282]/20 text-[#D8B282]">⛶</span>
                    <p className={`hover:text-[#D8B282] transition-colors cursor-default ${themeClass("text-white", "text-[#181512]", "text-yellow-200")}`}>
                      {t.ecoRight1}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-[#D8B282]/20 text-[#D8B282]">⚙</span>
                    <p className={`hover:text-[#D8B282] transition-colors cursor-default ${themeClass("text-white", "text-[#181512]", "text-yellow-200")}`}>
                      {t.ecoRight2}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-[#D8B282]/20 text-[#D8B282]">🤝</span>
                    <p className={`hover:text-[#D8B282] transition-colors cursor-default ${themeClass("text-white", "text-[#181512]", "text-yellow-200")}`}>
                      {t.ecoRight3}
                    </p>
                  </div>
                </div>

                <div className="w-20 h-[2px] bg-gradient-to-r from-[#D8B282] to-transparent" />

                {/* Floating Frosted Spotlight Card for Selected Satellite matching Image 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border text-xs shadow-xl backdrop-blur-md ${
                    themeClass(
                      "bg-gradient-to-br from-[#0D182E]/95 via-[#080E1C]/90 to-[#04070E] border-[#D8B282]/60 text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.8)]",
                      "bg-white/95 border-[#D8B282]/60 text-[#4A3F35] shadow-[0_10px_30px_rgba(140,101,59,0.12)]",
                      "bg-zinc-900 border-yellow-400 text-yellow-100"
                    )
                  }`}
                >
                  <p className="font-black text-sm text-[#D8B282]">
                    {constellationSatellites[activeSatellite ?? 2].name}
                  </p>
                  <p className={`text-xs mt-1.5 leading-relaxed ${themeClass("text-slate-300", "text-[#5A4F43]", "text-yellow-100")}`}>
                    {constellationSatellites[activeSatellite ?? 2].desc}
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* SECTION 5: INTERACTIVE DIGITAL CARD SHOWCASE (MATCHING IMAGE 3) */}
            <div className="mt-20">
              <LandingInteractiveShowcase themeMode={themeMode} />
            </div>
          </div>
        </section>
      </SectionFlip3D>

      {/* =======================================
          SECTION 5: 4 CORE VALUES (YACHT CONVOY) & 4 STEPS VIP ADMISSION
          ======================================= */}
      <SectionSlideLeft id="core-values">
        <section
          className={`py-24 md:py-32 relative overflow-hidden border-t transition-colors duration-500 ${
            themeClass(
              "border-[#D8B282]/25 bg-[#02040A]",
              "border-[#D8B282]/30 bg-[#FAF8F5]",
              "border-yellow-400 bg-black"
            )
          }`}
        >
          {/* Neoclassical Golden Columns & Mandala Foundation Background for Core Values */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
            <img
              src="/landing/ceo1983_core_values_bg.jpg"
              alt="4 Neoclassical Pillars of Excellence"
              className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
                themeClass(
                  "opacity-35 mix-blend-screen brightness-90 contrast-125 filter",
                  "opacity-20 mix-blend-multiply contrast-110 filter",
                  "opacity-15 mix-blend-screen contrast-150"
                )
              }`}
            />
            {/* Gradient Vignettes for Perfect Legibility in all 3 Theme Modes */}
            <div
              className={`absolute inset-0 transition-colors duration-500 ${
                themeClass(
                  "bg-gradient-to-b from-[#02040A] via-transparent to-[#02040A]",
                  "bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]/95",
                  "bg-gradient-to-b from-black via-black/80 to-black"
                )
              }`}
            />
            {/* Subtle radial center spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,178,130,0.12)_0%,transparent_70%)] pointer-events-none" />
          </div>

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Core Values Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-14"
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-mono border backdrop-blur-md shadow-md mb-3 ${
                  themeClass(
                    "border-[#D8B282]/50 text-[#F6E1C3] bg-[#D8B282]/15",
                    "border-[#D8B282]/60 text-[#8C653B] bg-[#F6E1C3]/30",
                    "border-yellow-400 text-yellow-300 bg-yellow-400/20"
                  )
                }`}
              >
                <span>{t.coreTag}</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight ${themeClass("text-white", "text-[#181512]", "text-yellow-300")}`}>
                {t.coreTitle}
              </h2>
              <p className={`mt-3 text-sm sm:text-base leading-relaxed ${themeClass("text-slate-300", "text-[#4A3F35]", "text-yellow-100")}`}>
                {t.coreDesc}
              </p>
            </motion.div>

            {/* 1. Core Values Convoy with Luxury Flagship Superyacht pulling from Left on Scroll */}
            <CoreValuesYachtConvoy themeMode={themeMode} t={t} />

            {/* 2. 4 Steps VIP Pass Admission Roadmap with Step-by-Step Progressive Laser Animation */}
            <VipPass4StepsProgressiveFlow themeMode={themeMode} t={t} />

            {/* Luxury Executive CTA Box (Background Biển Đêm & Hải Đăng Soi Sáng Tàu Đơn Độc) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className={`mt-20 p-8 sm:p-14 rounded-[36px] border-2 text-center relative overflow-hidden shadow-2xl ${
                themeClass(
                  "border-[#F6E1C3]/80 bg-[#060D1E] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(216,178,130,0.3)]",
                  "border-[#D8B282]/80 bg-[#FAF8F5] shadow-[0_20px_50px_rgba(140,101,59,0.25)]",
                  "border-yellow-400 bg-black text-yellow-300"
                )
              }`}
            >
              {/* Solitary Ocean Beacon Background Image Overlay */}
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-55 mix-blend-screen scale-105 animate-pulse" style={{ animationDuration: "10s" }}>
                <img
                  src="/ocean_solitary_beacon.jpg"
                  alt="Ocean Lighthouse Solitary Beacon"
                  className="w-full h-full object-cover object-center filter brightness-110 contrast-125"
                />
              </div>

              {/* Gradient Vignette so text is 100% crystal clear and high-contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#081226]/85 to-[#040814]/90 pointer-events-none" />

              {/* Glowing Warm Halos */}
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#D8B282]/30 blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#38BDF8]/20 blur-[120px] pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-mono font-black uppercase text-[#F6E1C3] tracking-widest px-4 py-1.5 rounded-full bg-[#D8B282]/25 border border-[#F6E1C3]/50 shadow-[0_0_15px_rgba(216,178,130,0.4)] inline-block">
                  {t.ctaBoxTag}
                </span>
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight text-white drop-shadow-md">
                  {t.ctaBoxTitle1} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5E6] via-[#F6E1C3] to-[#D8B282] drop-shadow-[0_0_20px_rgba(216,178,130,0.6)]">
                    {t.ctaBoxTitle2}
                  </span>
                </h3>
                <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-slate-200 drop-shadow-sm font-medium">
                  {t.ctaBoxDesc}
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleJoinClick}
                    className="px-10 py-4 sm:px-12 sm:py-5 rounded-full font-black text-sm tracking-wider uppercase bg-gradient-to-r from-[#FFF0DC] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-[0_0_50px_rgba(216,178,130,0.7)] hover:shadow-[0_0_70px_rgba(216,178,130,0.95)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {t.ctaBoxBtn}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </SectionSlideLeft>

      {/* --- FOOTER --- */}
      <footer
        className={`py-8 border-t text-center text-xs transition-colors duration-500 ${
          themeClass(
            "border-[#D8B282]/20 bg-[#01030A] text-slate-400",
            "border-[#D8B282]/30 bg-[#FAF8F5] text-[#5A4F43]",
            "border-yellow-400/40 bg-black text-yellow-200"
          )
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t.footerCopy}</p>
          <div className={`flex items-center gap-4 ${themeClass("text-slate-300", "text-[#181512]", "text-yellow-300")}`}>
            <a href="#leadership" className="hover:text-[#D8B282] transition-colors">Ban Lãnh Đạo</a>
            <span>•</span>
            <a href="#ecosystem" className="hover:text-[#D8B282] transition-colors">Hệ Sinh Thái</a>
            <span>•</span>
            <a href="#roadmap" className="hover:text-[#D8B282] transition-colors">Quy Trình VIP</a>
          </div>
        </div>
      </footer>

      {/* --- APPLICATION MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl text-left ${
                themeClass(
                  "border-[#D8B282]/60 bg-[#0B1224] text-white",
                  "border-[#D8B282]/60 bg-[#FAF8F5] text-[#181512]",
                  "border-yellow-400 bg-black text-yellow-300"
                )
              }`}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                  themeClass("text-slate-400 hover:text-white bg-white/5", "text-slate-600 hover:text-black bg-black/5", "text-yellow-400 bg-yellow-400/10")
                }`}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold text-[#D8B282] uppercase">HANOIBA ALLIANCE</span>
                <h3 className={`text-xl sm:text-2xl font-black mt-0.5 ${themeClass("text-white", "text-[#181512]", "text-yellow-300")}`}>
                  {t.modalTitle}
                </h3>
                <p className={`text-xs mt-1 ${themeClass("text-slate-300", "text-[#5A4F43]", "text-yellow-100")}`}>
                  {t.modalSubtitle}
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className={`text-lg font-bold ${themeClass("text-white", "text-[#181512]", "text-white")}`}>{t.formSuccessTitle}</h4>
                  <p className={`text-xs ${themeClass("text-slate-300", "text-[#5A4F43]", "text-yellow-100")}`}>{t.formSuccessDesc}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setModalOpen(false);
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950"
                  >
                    Hoàn tất
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeClass("text-slate-200", "text-[#181512]", "text-yellow-200")}`}>{t.formName}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.formNamePlh}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D8B282] ${
                        themeClass(
                          "bg-black/50 border-[#D8B282]/30 text-white placeholder:text-slate-500",
                          "bg-white border-[#D8B282]/40 text-[#181512] placeholder:text-slate-400 shadow-xs",
                          "bg-zinc-900 border-yellow-400 text-yellow-300 placeholder:text-yellow-600"
                        )
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeClass("text-slate-200", "text-[#181512]", "text-yellow-200")}`}>{t.formPhone}</label>
                    <input
                      type="tel"
                      required
                      placeholder={t.formPhonePlh}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D8B282] ${
                        themeClass(
                          "bg-black/50 border-[#D8B282]/30 text-white placeholder:text-slate-500",
                          "bg-white border-[#D8B282]/40 text-[#181512] placeholder:text-slate-400 shadow-xs",
                          "bg-zinc-900 border-yellow-400 text-yellow-300 placeholder:text-yellow-600"
                        )
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeClass("text-slate-200", "text-[#181512]", "text-yellow-200")}`}>{t.formCompany}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.formCompanyPlh}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D8B282] ${
                        themeClass(
                          "bg-black/50 border-[#D8B282]/30 text-white placeholder:text-slate-500",
                          "bg-white border-[#D8B282]/40 text-[#181512] placeholder:text-slate-400 shadow-xs",
                          "bg-zinc-900 border-yellow-400 text-yellow-300 placeholder:text-yellow-600"
                        )
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeClass("text-slate-200", "text-[#181512]", "text-yellow-200")}`}>{t.formRevenue}</label>
                    <select
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D8B282] ${
                        themeClass(
                          "bg-[#0B1224] border-[#D8B282]/30 text-white",
                          "bg-white border-[#D8B282]/40 text-[#181512] shadow-xs",
                          "bg-zinc-900 border-yellow-400 text-yellow-300"
                        )
                      }`}
                    >
                      <option value="under-10">{t.formRev1}</option>
                      <option value="10-50">{t.formRev2}</option>
                      <option value="50-200">{t.formRev3}</option>
                      <option value="above-200">{t.formRev4}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeClass("text-slate-200", "text-[#181512]", "text-yellow-200")}`}>{t.formIndustry}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.formIndustryPlh}
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#D8B282] ${
                        themeClass(
                          "bg-black/50 border-[#D8B282]/30 text-white placeholder:text-slate-500",
                          "bg-white border-[#D8B282]/40 text-[#181512] placeholder:text-slate-400 shadow-xs",
                          "bg-zinc-900 border-yellow-400 text-yellow-300 placeholder:text-yellow-600"
                        )
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-full font-black text-xs uppercase bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#8C653B] text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer mt-2"
                  >
                    {submitting ? t.formSubmitting : t.formSubmit}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Hexagonal Logo Icon for Central Nucleus */
function HexagonLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
