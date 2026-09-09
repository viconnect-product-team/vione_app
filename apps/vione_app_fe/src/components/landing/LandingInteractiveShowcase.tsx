import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  IdCard,
  Handshake,
  Calendar,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";

export interface ShowcaseSlide {
  id: string;
  icon: any;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaLink: string;
  accentColor: string;
  previewType: "card" | "b2b" | "event" | "perks";
}

const DEFAULT_SLIDES: ShowcaseSlide[] = [
  {
    id: "nfc-pass",
    icon: IdCard,
    tabLabel: "Thẻ VIP Số & NFC",
    badge: "1-TOUCH DIGITAL PASS",
    title: "Thẻ Định Danh Kim Loại 1-Chạm NFC",
    subtitle: "Đồng bộ Apple Wallet & Google Wallet",
    description: "Đột phá thay thế hoàn toàn danh thiếp giấy truyền thống. Chạm nhẹ vào điện thoại đối tác để mở ngay profile cao cấp, danh mục sản phẩm và hồ sơ năng lực doanh nghiệp.",
    highlights: [
      "Khắc laser kim loại Titanium nguyên khối & chip NFC siêu bền",
      "Cập nhật thông tin thời gian thực không bao giờ hết hạn",
      "Tích hợp QR động chống sao chép và chia sẻ đa nền tảng",
    ],
    ctaLabel: "Trải nghiệm Thẻ Số ngay →",
    ctaLink: "/connect-app/card-scan",
    accentColor: "from-amber-400 via-yellow-500 to-amber-600",
    previewType: "card",
  },
  {
    id: "b2b-trade",
    icon: Handshake,
    tabLabel: "Sàn B2B & AI Match",
    badge: "AI MATCHMAKING ENGINE",
    title: "Sàn Giao Thương B2B & Trợ Lý AI Matchmaking",
    subtitle: "Kết nối chuỗi cung ứng khép kín >5.000 Tỷ VNĐ",
    description: "Hệ thống phân tích nhu cầu mua - bán - gọi vốn tự động đề xuất chính xác các Chủ tịch và CEO phù hợp nhất trong mạng lưới trong 3 giây, kèm phòng đàm phán bảo mật.",
    highlights: [
      "AI thuật toán phân tích nhu cầu cung - cầu theo từng ngành hàng",
      "Cơ chế bảo chứng uy tín hội đồng thẩm định C-Level",
      "Deal Room đàm phán 1-1 riêng tư kèm mẫu hợp đồng pháp lý",
    ],
    ctaLabel: "Khám phá Sàn B2B →",
    ctaLink: "/connect-app/network",
    accentColor: "from-blue-400 via-indigo-500 to-cyan-500",
    previewType: "b2b",
  },
  {
    id: "qr-events",
    icon: Calendar,
    tabLabel: "Sự Kiện & Check-in QR",
    badge: "LIGHTNING CHECK-IN",
    title: "Hội Nghị Thượng Đỉnh & Check-in QR 1 Giây",
    subtitle: "Diễn đàn kết nối, Business Tour & Gala Dinner",
    description: "Đặt chỗ vé VIP, quản lý lịch trình tọa đàm và quét mã QR vé tại cửa trong 1 giây không cần xếp hàng. Tự động kết nối hồ sơ với toàn bộ đại biểu tham gia cùng sự kiện.",
    highlights: [
      "Check-in tức thì qua QR mã hóa bảo mật chống vé giả",
      "Xem danh sách đại biểu tham dự trước sự kiện để hẹn gặp B2B",
      "Tải tài liệu diễn đàn & hình ảnh sự kiện chất lượng cao",
    ],
    ctaLabel: "Xem Lịch Sự Kiện →",
    ctaLink: "/connect-app/calendar",
    accentColor: "from-emerald-400 via-teal-500 to-green-600",
    previewType: "event",
  },
  {
    id: "vip-perks",
    icon: Crown,
    tabLabel: "Đặc Quyền C-Level",
    badge: "EXCLUSIVE PRIVILEGES",
    title: "Kho Đặc Quyền & Ưu Đãi Nội Bộ Độc Quyền",
    subtitle: "Voucher đối tác khách sạn 5 sao, tài chính & logistics",
    description: "Mạng lưới ưu đãi chéo giữa các doanh nghiệp hội viên: giảm giá 15% - 50% các dịch vụ golf, phòng chờ thương gia, khách sạn cao cấp, tư vấn thuế và kiểm toán độc quyền.",
    highlights: [
      "Mở khóa hàng trăm đặc quyền dịch vụ cao cấp toàn quốc",
      "Chương trình giao lưu thể thao Golf & Mastermind kín định kỳ",
      "Bảo hộ bản quyền thương hiệu và xúc tiến truyền thông báo chí",
    ],
    ctaLabel: "Khám phá Đặc Quyền →",
    ctaLink: "/m/perks",
    accentColor: "from-purple-400 via-pink-500 to-rose-500",
    previewType: "perks",
  },
];

export function LandingInteractiveShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardFlip, setCardFlip] = useState(false);

  // Auto slide every 6s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const current = DEFAULT_SLIDES[activeIndex];
  const Icon = current.icon;

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);

  return (
    <div
      className="relative w-full rounded-3xl border border-[#D8B282]/30 bg-gradient-to-b from-[#131926]/90 via-[#0E131E]/95 to-[#080B12]/98 p-5 sm:p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Animated Neon Mesh Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#D8B282]/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8C986]">
            <Sparkles className="h-4 w-4 text-[#E8C986] animate-pulse" />
            <span>ĐỘT PHÁ CÔNG NGHỆ 2026</span>
          </div>
          <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Trải Nghiệm Hệ Sinh Thái Số Hóa Phá Cách
          </h3>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide trước"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#D8B282]/60 text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#D8B282]/60 text-white transition-all cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Interactive Tabs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        {DEFAULT_SLIDES.map((slide, idx) => {
          const TabIcon = slide.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`group relative flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border border-[#D8B282] bg-gradient-to-r from-[#D8B282]/25 to-[#D8B282]/10 shadow-[0_4px_20px_rgba(216,178,130,0.25)] text-white"
                  : "border border-white/10 bg-white/5 hover:bg-white/10 text-[#9DA3AE] hover:text-white"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-gradient-to-br from-[#F7D896] to-[#C49338] text-slate-950 font-bold shadow-md" : "bg-white/10 text-white/70 group-hover:text-white"
                }`}
              >
                <TabIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{slide.tabLabel}</p>
                <p className="text-[10px] text-white/50 truncate">0{idx + 1} / 04</p>
              </div>

              {isActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#E8C986] shadow-[0_0_8px_#E8C986]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Slide Content Arena (Grid 2 Cols) */}
      <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[380px]">
        {/* Left Column: Deep Feature Content */}
        <div className="lg:col-span-6 space-y-5 animate-in fade-in duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D8B282]/50 bg-[#D8B282]/15 text-[11px] font-bold tracking-wider uppercase text-[#F0D59D]">
            <Icon className="h-3.5 w-3.5 text-[#F0D59D]" />
            <span>{current.badge}</span>
          </div>

          <h4 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {current.title}
          </h4>

          <p className="text-sm font-semibold text-[#E8C986]">
            {current.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-2.5 pt-2">
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link
              to={current.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 shadow-[0_8px_25px_rgba(216,178,130,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {current.ctaLabel}
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Interactive Mockup Showcase */}
        <div className="lg:col-span-6 flex items-center justify-center">
          {current.previewType === "card" && (
            <div
              onClick={() => setCardFlip(!cardFlip)}
              className="group relative w-full max-w-sm h-60 rounded-2xl cursor-pointer perspective-1000 select-none transition-transform duration-500 hover:scale-105"
            >
              <div className="relative w-full h-full rounded-2xl p-6 border border-[#D8B282]/80 bg-gradient-to-br from-[#282118] via-[#1A1510] to-[#0A0806] text-white shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(216,178,130,0.25)] flex flex-col justify-between overflow-hidden">
                {/* Gold Foil Metallic Accent Lines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F7D896]/20 to-transparent rounded-full blur-2xl" />

                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#F0D59D]" />
                    <span className="text-xs font-bold tracking-widest text-[#F0D59D]">EXECUTIVE TITANIUM</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0D59D]/20 border border-[#F0D59D]/50 text-[#F0D59D]">
                    <Zap className="w-3 h-3" /> NFC ACTIVE
                  </span>
                </div>

                <div className="z-10">
                  <p className="text-[11px] text-[#9DA3AE] uppercase tracking-wider">Doanh Nhân Hội Viên</p>
                  <p className="text-xl font-black text-white tracking-wide mt-0.5">NGUYỄN VĂN AN</p>
                  <p className="text-xs text-[#D8B282] font-semibold">Chủ Tịch HĐQT · VIONE GROUP</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#9DA3AE] z-10 border-t border-white/10 pt-2.5">
                  <span>ID: 1983-VIP-8888</span>
                  <span className="text-[#F0D59D] font-medium animate-pulse">Chạm để xoay thẻ ↺</span>
                </div>
              </div>
            </div>
          )}

          {current.previewType === "b2b" && (
            <div className="w-full max-w-sm rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-5 text-white shadow-2xl space-y-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> AI MATCHMAKING 98%
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  Đang diễn ra
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#9DA3AE]">Cơ hội giao thương B2B</p>
                <p className="text-sm font-bold text-white leading-snug">
                  Cung ứng hệ thống ERP & Hạ tầng Cloud Server cho tập đoàn bán lẻ 50 chi nhánh
                </p>
              </div>
              <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[#9DA3AE]">Ngân sách dự kiến:</span>
                <span className="font-bold text-[#F7D896]">2.500.000.000 đ</span>
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Vào Deal Room Đàm Phán Ngay <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {current.previewType === "event" && (
            <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 text-white shadow-2xl space-y-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> VÉ VIP SUMMIT 2026
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e] text-slate-950 font-bold">
                  ĐÃ XÁC NHẬN
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Diễn Đàn Doanh Nghiệp Trẻ Thủ Đô & Gala Dinner</p>
                <p className="text-xs text-[#9DA3AE] mt-1">18:00 · 28/09/2026 · JW Marriott Hotel</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-slate-950 text-center leading-none">QR PASS [1s]</span>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Mã vé: HN-VIP-2026-99</p>
                  <p className="text-[#22c55e] text-[11px]">Sẵn sàng quét Check-in tại cổng</p>
                </div>
              </div>
            </div>
          )}

          {current.previewType === "perks" && (
            <div className="w-full max-w-sm rounded-2xl border border-purple-500/40 bg-slate-900/90 p-5 text-white shadow-2xl space-y-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" /> ĐẶC QUYỀN HỘI VIÊN VIP
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                  Mở Khóa 100%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Gói Ưu Đãi Golf & Nghỉ Dưỡng 5 Sao Toàn Quốc</p>
                <p className="text-xs text-[#9DA3AE]">Giảm 35% chi phí dịch vụ & tặng 1 giờ phòng chờ VIP</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 text-xs flex items-center justify-between">
                <span>Mã kích hoạt:</span>
                <span className="font-mono font-bold text-[#F7D896]">VIONE-VIP-PERK</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
