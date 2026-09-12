import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Clock,
  Landmark,
  Database,
  LockKeyhole,
  CheckCircle2,
  LayoutDashboard,
  Cpu,
  Award,
  Crown,
  TrendingDown,
  X,
  Check,
  Shield,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Layers,
  Search,
  BookOpen,
  Droplets,
  ChevronDown,
  RotateCw,
} from "lucide-react";
import { BusinessConnectPartnersSection } from "./BusinessConnectPartnersSection";
import { toast } from "sonner";
import { useAutoHideHeader } from "./useAutoHideHeader";
import {
  SectionHeaderDroplets,
  SectionEdgeWildlifePin,
  WaterDroplet3D,
  V5HeroNatureGarden,
} from "./V5PlayfulDecorations";

export function BusinessConnectLandingV5() {
  // STRICTLY FIXED LIGHT THEME
  const [themeMode] = useState<"light" | "dark">("light");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    note: "",
  });

  // Auto-hiding header after 3s
  const { showHeader, headerStyle, resetTimer } = useAutoHideHeader(3000);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đăng ký thành công! Chuyên gia Business Connect sẽ liên hệ thẩm định kiến trúc nền tảng trong 24h.");
    setDemoModalOpen(false);
    setDemoForm({ name: "", phone: "", email: "", org: "", note: "" });
  };

  return (
    <div
      className="min-h-screen font-sans bg-[#F0F8FF] text-slate-900 relative overflow-x-hidden selection:bg-sky-200 selection:text-sky-950"
      style={{
        fontFamily: "'Playfair Display', 'Plus Jakarta Sans', system-ui, -apple-system, serif",
      }}
    >
      {/* Keyframe Animations for V5 Sovereign & Playful Nature Elements */}
      <style>{`
        @keyframes crownGleam {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(14,165,233,0.3)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 16px rgba(14,165,233,0.6)); }
        }
        @keyframes royalFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes royalBeacon {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.25); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.9; }
        }
        @keyframes v5DropletWobble {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08, 0.94) translateY(-1.5px); }
        }
        @keyframes crabScuttle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-3deg); }
          75% { transform: translateY(-1.5px) rotate(3deg); }
        }
        @keyframes crabClawLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-14deg); }
        }
        @keyframes crabClawRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes crabEyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.15); }
        }
        @keyframes flowerSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes grassBreeze {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(-6deg); }
        }
        @keyframes bubbleRise1 {
          0% { transform: translateY(0) scale(0.6); opacity: 0.9; }
          100% { transform: translateY(-16px) scale(1.1); opacity: 0; }
        }
        @keyframes bubbleRise2 {
          0% { transform: translateY(0) scale(0.5); opacity: 0.8; }
          100% { transform: translateY(-22px) scale(1); opacity: 0; }
        }

        .anim-royal-gleam { animation: crownGleam 3.5s ease-in-out infinite; }
        .anim-royal-float { animation: royalFloat 4s ease-in-out infinite; }
        .anim-royal-beacon { animation: royalBeacon 2.5s cubic-bezier(0,0,0.2,1) infinite; }
        .anim-v5-droplet-wobble { animation: v5DropletWobble 3.5s ease-in-out infinite; }
        .anim-v5-crab-scuttle { animation: crabScuttle 3s ease-in-out infinite; }
        .anim-v5-crab-claw-left { animation: crabClawLeft 2.2s ease-in-out infinite; }
        .anim-v5-crab-claw-right { animation: crabClawRight 2.2s ease-in-out infinite; }
        .anim-v5-crab-eye { animation: crabEyeBlink 4s ease-in-out infinite; }
        .anim-v5-flower-sway { animation: flowerSway 4s ease-in-out infinite; transform-origin: bottom center; }
        .anim-v5-grass-breeze { animation: grassBreeze 3.2s ease-in-out infinite; transform-origin: bottom center; }
        .anim-v5-bubble-1 { animation: bubbleRise1 2s ease-out infinite; }
        .anim-v5-bubble-2 { animation: bubbleRise2 2.6s ease-out infinite 0.8s; }
      `}</style>

      {/* =========================================================================
          SECTION 1: HEADER (Tự ẩn sau 3s, di chuột hoặc scroll thì hiện lại)
          BUSINESS CONNECT | An toàn - Chuẩn mực - Toàn vẹn (Theme Sáng Cố Định)
          ========================================================================= */}
      <header
        style={headerStyle}
        onMouseEnter={resetTimer}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/95 border-b border-sky-100 shadow-[0_2px_15px_rgba(14,165,233,0.08)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/business-connect/v5" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black shadow-md border bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 text-white border-sky-300 shadow-sky-400/20 group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 fill-current anim-royal-gleam" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider block leading-tight font-serif text-slate-900">
                  BUSINESS <span className="text-sky-600">CONNECT</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  V5 SOVEREIGN
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-sky-700">
                AN TOÀN • CHUẨN MỰC • TOÀN VẸN
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-serif font-bold tracking-wider uppercase text-slate-700">
            <a href="#challenges" className="hover:text-sky-600 transition-colors">Thách thức</a>
            <a href="#solutions" className="hover:text-sky-600 transition-colors">Giải pháp Lõi</a>
            <a href="#architecture" className="hover:text-sky-600 transition-colors">Kiến trúc Hệ thống</a>
            <a href="#security" className="hover:text-sky-600 transition-colors">Bảo mật</a>
            <a href="#partners" className="hover:text-sky-600 transition-colors">Đối tác</a>
            <span className="text-[11px] px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-sans">
              VI / EN
            </span>
          </nav>

          <div className="flex items-center gap-3 font-sans">
            {/* Locked Light Theme Badge Indicator */}
            <div
              className="px-3 py-1.5 rounded-lg border bg-sky-50 border-sky-200 text-sky-800 flex items-center gap-1.5 text-xs font-serif font-bold select-none"
              title="Theme sáng cố định"
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider">THEME SÁNG</span>
            </div>

            <Link
              to="/connect-app"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border text-slate-900 bg-white hover:bg-sky-50 border-sky-200 shadow-sm transition-all"
            >
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Đăng nhập</span>
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-5 py-2.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer border shadow-lg hover:scale-105 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 hover:brightness-105 text-white border-sky-400 shadow-sky-500/20"
            >
              Thẩm định Nền tảng →
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 2: HERO BANNER (Cố định Sticky - Khi scroll thì section bên dưới trượt lên che dần đi)
          Kèm V5 Hero Nature Garden: Con cua, cây hoa, mầm cỏ với kích thước lớn sinh động!
          ========================================================================= */}
      <section
        id="hero"
        className="sticky top-0 z-0 min-h-screen flex flex-col justify-center pt-24 pb-14 overflow-hidden text-center bg-gradient-to-b from-sky-100/70 via-sky-50/50 to-[#F0F8FF]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          {/* Main Hero Card */}
          <div className="relative rounded-3xl p-8 sm:p-12 bg-white/95 border-2 border-sky-200/90 shadow-[0_20px_60px_rgba(14,165,233,0.12)] space-y-7 backdrop-blur-md">
            {/* 3D Water Droplets on Top Corners of Hero Card */}
            <SectionHeaderDroplets />

            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border-2 text-xs font-serif font-black tracking-widest uppercase shadow-sm bg-sky-50/80 border-sky-200 text-sky-800">
              <Shield className="w-4 h-4 anim-royal-gleam text-sky-600" />
              <span>NỀN TẢNG QUẢN TRỊ DOANH NGHIỆP THỜI KỲ MỚI</span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight font-serif text-slate-950">
              Xây dựng nền móng vững chắc. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600">
                Vận hành không rủi ro.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-sans text-slate-700 font-normal">
              Business Connect cung cấp giải pháp kiến trúc hệ thống chuẩn mực, giúp Ban Lãnh đạo kiểm soát chặt chẽ mọi luồng thông tin, đảm bảo tính toàn vẹn dữ liệu và thiết lập khung quản trị rủi ro ở cấp độ cao nhất.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2 font-sans">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-9 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition-all cursor-pointer border-2 flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 hover:brightness-105 text-white border-sky-400 shadow-sky-500/20"
              >
                <span>Yêu cầu Demo cấp cao</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#challenges"
                className="px-7 py-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-2 border-sky-200 hover:border-sky-500 bg-sky-50/60 text-sky-800 shadow-sm hover:bg-sky-100 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-sky-600 animate-bounce" />
                <span>Cuộn xuống xem hệ thống</span>
              </a>
            </div>

            {/* 3 Metrics with Clinging Water Droplets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-sky-100 max-w-4xl mx-auto font-sans relative">
              <div className="relative p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all bg-sky-50/50 border-sky-100 shadow-sm hover:border-sky-300">
                <WaterDroplet3D size={15} right={-6} top={-6} wobble />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-white border-sky-200 text-sky-600 shadow-sm">
                  <ShieldCheck className="w-6 h-6 anim-royal-gleam" />
                </div>
                <div>
                  <p className="text-xl font-black font-mono text-slate-900">10,000+</p>
                  <p className="text-xs text-slate-600 font-medium">Nhà quản trị tin cậy</p>
                </div>
              </div>

              <div className="relative p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all bg-sky-50/50 border-sky-100 shadow-sm hover:border-sky-300">
                <WaterDroplet3D size={18} right={-7} top={-7} delay="0.5s" wobble />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-white border-sky-200 text-sky-600 shadow-sm">
                  <KeyRound className="w-6 h-6 anim-royal-float" />
                </div>
                <div>
                  <p className="text-xl font-black font-mono text-slate-900">RBAC Multi-tier</p>
                  <p className="text-xs text-slate-600 font-medium">Kiểm soát Role-Based chặt chẽ</p>
                </div>
              </div>

              <div className="relative p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all bg-sky-50/50 border-sky-100 shadow-sm hover:border-sky-300">
                <WaterDroplet3D size={14} right={-5} top={-5} delay="1.0s" />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-white border-sky-200 text-sky-600 shadow-sm">
                  <LockKeyhole className="w-6 h-6 anim-royal-beacon" />
                </div>
                <div>
                  <p className="text-xl font-black font-mono text-slate-900">Hàng triệu</p>
                  <p className="text-xs text-slate-600 font-medium">Giao dịch mã hóa an toàn</p>
                </div>
              </div>
            </div>

            {/* V5 Hero Nature Garden: Cây hoa lớn, mầm cỏ đung đưa & Chú cua biển kích thước to */}
            <V5HeroNatureGarden />
          </div>
        </div>
      </section>

      {/* =========================================================================
          CURTAIN REVEAL WRAPPER (Hiệu ứng màn cuộn trượt lên che dần Hero khi cuộn chuột)
          ========================================================================= */}
      <main className="relative z-10 bg-[#F0F8FF] rounded-t-[3.5rem] shadow-[0_-30px_70px_rgba(15,23,42,0.15)] border-t-2 border-sky-200/90 overflow-hidden">
        {/* =========================================================================
            SECTION 3: PAIN POINTS (Thách thức & Rủi ro trong quản trị)
            Nền Trắng Xanh Đơn Giản + Con Cua / Cây Cỏ + Giọt Nước 3D 2 Góc Trên
            ========================================================================= */}
        <section
          id="challenges"
          className="relative py-24 border-b border-sky-100 bg-gradient-to-b from-[#F0F8FF] via-white to-[#E8F4FD] text-center overflow-visible"
        >
          {/* Animated Nature / Crab pinned on Left and Right Edges */}
          <SectionEdgeWildlifePin side="left" type="crab" />
          <SectionEdgeWildlifePin side="right" type="flower" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          {/* Header Card with 3D Water Droplets on Left & Right Corners */}
          <div className="relative inline-block max-w-3xl mx-auto p-6 rounded-3xl bg-white/90 border border-sky-100 shadow-[0_8px_30px_rgba(14,165,233,0.06)] space-y-3">
            <SectionHeaderDroplets />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-sky-50 border border-sky-200 text-sky-800">
              <AlertTriangle className="w-3.5 h-3.5 anim-royal-beacon text-amber-500" />
              <span>NHỮNG THÁCH THỨC TRONG QUẢN TRỊ VẬN HÀNH QUY MÔ LỚN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif text-slate-950">
              Lỗ hổng nào đang đe dọa tính bền vững của tổ chức?
            </h2>
            <p className="text-base font-sans text-slate-600">
              Nhận diện 4 rủi ro trọng yếu về phân tán dữ liệu và kiểm soát tuân thủ trong quản trị doanh nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left font-sans">
            {/* Card 1 */}
            <div className="relative rounded-2xl p-6 border space-y-4 flex flex-col justify-between transition-all bg-white border-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] hover:border-sky-300 hover:shadow-lg">
              <WaterDroplet3D size={16} right={-7} top={-7} wobble />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <Database className="w-6 h-6 anim-royal-gleam" />
                </div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Rủi ro từ dữ liệu phân tán
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Thông tin cốt lõi không được lưu trữ tập trung, dẫn đến sai lệch trong các báo cáo định kỳ và nguy cơ thất thoát tài sản số.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 text-[11px] font-mono flex items-center justify-between font-bold text-sky-700">
                <span>RỦI RO:</span>
                <span>Thất thoát tài sản số</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-2xl p-6 border space-y-4 flex flex-col justify-between transition-all bg-white border-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] hover:border-sky-300 hover:shadow-lg">
              <WaterDroplet3D size={14} right={-6} top={-6} delay="0.4s" />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <AlertTriangle className="w-6 h-6 anim-royal-float text-amber-500" />
                </div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Đứt gãy trong tuân thủ quy trình
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Tương tác khách hàng không được kiểm soát bằng luồng quy trình chuẩn, tạo ra các rủi ro vận hành và sai sót cá nhân.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 text-[11px] font-mono flex items-center justify-between font-bold text-sky-700">
                <span>RỦI RO:</span>
                <span>Sai sót vận hành</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-2xl p-6 border space-y-4 flex flex-col justify-between transition-all bg-white border-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] hover:border-sky-300 hover:shadow-lg">
              <WaterDroplet3D size={20} right={-8} top={-8} delay="0.8s" wobble />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <LockKeyhole className="w-6 h-6 anim-royal-beacon" />
                </div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Lỗ hổng kiểm soát truy cập
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Hệ thống phân quyền lỏng lẻo khiến dữ liệu nhạy cảm dễ bị xâm phạm khi nhân sự thay đổi hoặc tổ chức phình to quy mô.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 text-[11px] font-mono flex items-center justify-between font-bold text-sky-700">
                <span>RỦI RO:</span>
                <span>Xâm phạm dữ liệu nhạy cảm</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative rounded-2xl p-6 border space-y-4 flex flex-col justify-between transition-all bg-white border-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] hover:border-sky-300 hover:shadow-lg">
              <WaterDroplet3D size={15} right={-6} top={-6} delay="1.2s" />
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <ShieldCheck className="w-6 h-6 anim-royal-gleam" />
                </div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Thiếu minh bạch trong giám sát
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Thiếu vắng các công cụ đo lường khách quan realtime khiến Lãnh đạo không thể tầm soát sớm các rủi ro tiềm ẩn trong kinh doanh.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 text-[11px] font-mono flex items-center justify-between font-bold text-sky-700">
                <span>RỦI RO:</span>
                <span>Điểm mù giám sát</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURES & SOLUTIONS (Tính năng & Giải pháp Lõi)
          Nền Trắng Xanh Đơn Giản + Mầm Cỏ / Cây Hoa + Giọt Nước 3D 2 Góc Trên
          ========================================================================= */}
      <section
        id="solutions"
        className="relative py-24 border-b border-sky-100 bg-gradient-to-b from-[#E8F4FD] via-white to-[#F0F8FF] overflow-visible"
      >
        {/* Animated Nature pinned on Margins */}
        <SectionEdgeWildlifePin side="left" type="grass" />
        <SectionEdgeWildlifePin side="right" type="crab" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-14 relative z-10">
          {/* Header Card with 3D Water Droplets on Left & Right Corners */}
          <div className="relative inline-block max-w-3xl mx-auto p-6 rounded-3xl bg-white/90 border border-sky-100 shadow-[0_8px_30px_rgba(14,165,233,0.06)] space-y-3">
            <SectionHeaderDroplets />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-sky-50 border border-sky-200 text-sky-800">
              <Landmark className="w-3.5 h-3.5 anim-royal-gleam text-sky-600" />
              <span>LỢI THẾ CẠNH TRANH TỪ BUSINESS CONNECT</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif text-slate-950">
              Thiết lập chuẩn mực. Vận hành toàn vẹn.
            </h2>
            <p className="text-base font-sans text-slate-600 font-medium">
              Một giải pháp SaaS được kiến tạo từ những tiêu chuẩn phần mềm Enterprise khắt khe nhất, đặt tính an toàn và minh bạch lên hàng đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={15} right={-6} top={-6} wobble />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <Database className="w-6 h-6 anim-royal-gleam" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Trung tâm Dữ liệu Toàn vẹn
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Hội tụ và làm sạch dữ liệu từ mọi nguồn, tạo ra một cơ sở thông tin duy nhất, chính xác tuyệt đối phục vụ cho kiểm toán và phân tích.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Chuẩn hóa dữ liệu kiểm toán
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={22} right={-8} top={-8} delay="0.5s" wobble />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <LayoutDashboard className="w-6 h-6 anim-royal-float" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Bảng điều khiển Giám sát Cấp cao
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Cung cấp cho Ban Lãnh đạo tầm nhìn toàn diện, minh bạch về mọi chỉ số vận hành cốt lõi, loại bỏ hoàn toàn yếu tố cảm tính.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Giám sát số liệu khách quan
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={14} right={-6} top={-6} delay="0.9s" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <KeyRound className="w-6 h-6 anim-royal-beacon" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Quản trị Phân quyền Role-Based
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Ứng dụng mô hình bảo mật nhiều lớp, kiểm soát định danh và phân quyền truy cập nghiêm ngặt tới từng trường dữ liệu.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Phân quyền sâu từng trường
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={18} right={-7} top={-7} delay="0.3s" wobble />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <FileCheck className="w-6 h-6 anim-royal-gleam" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Tự động hóa Quy trình Chuẩn (SOP)
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Chuyển hóa các quy trình vận hành phức tạp thành các luồng công việc số tự động, giảm thiểu tối đa sự can thiệp thủ công.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Chuẩn hóa 100% quy trình SOP
              </div>
            </div>

            {/* Feature 5 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={15} right={-6} top={-6} delay="0.7s" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <Search className="w-6 h-6 anim-royal-float" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Nhật ký Kiểm toán Bất biến
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Mọi thao tác thay đổi dữ liệu đều được ghi nhận tự động vào chuỗi nhật ký không thể sửa xóa, phục vụ công tác thanh tra.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Ghi nhận bất biến 24/7
              </div>
            </div>

            {/* Feature 6 */}
            <div className="relative rounded-2xl p-7 border-2 transition-all space-y-5 flex flex-col justify-between bg-white border-sky-100 shadow-sm hover:border-sky-400 hover:shadow-md">
              <WaterDroplet3D size={20} right={-8} top={-8} delay="1.1s" wobble />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-sky-50 border-sky-200 text-sky-600">
                  <Cpu className="w-6 h-6 anim-royal-beacon" />
                </div>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Kiến trúc Sẵn sàng Mở rộng
                </h3>
                <p className="text-xs leading-relaxed font-sans text-slate-600">
                  Nền tảng hạ tầng Microservices chịu tải cao, sẵn sàng đồng hành cùng sự phát triển quy mô của doanh nghiệp qua nhiều thập kỷ.
                </p>
              </div>
              <div className="pt-4 border-t border-sky-100 font-sans flex items-center gap-2 text-xs font-bold text-sky-700">
                <Check className="w-3.5 h-3.5" /> Khả năng chịu tải hàng triệu user
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ARCHITECTURE FRAMEWORK (Khung Kiến Trúc Hệ Thống)
          ========================================================================= */}
      <section
        id="architecture"
        className="relative py-24 border-b border-sky-100 bg-gradient-to-b from-[#F0F8FF] via-white to-[#E8F4FD] text-center overflow-visible"
      >
        <SectionEdgeWildlifePin side="left" type="flower" />
        <SectionEdgeWildlifePin side="right" type="grass" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          <div className="relative inline-block max-w-3xl mx-auto p-6 rounded-3xl bg-white/90 border border-sky-100 shadow-[0_8px_30px_rgba(14,165,233,0.06)] space-y-3">
            <SectionHeaderDroplets />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-sky-50 border border-sky-200 text-sky-800">
              <Layers className="w-3.5 h-3.5 anim-royal-gleam text-sky-600" />
              <span>CẤU TRÚC ĐA TẦNG PHÂN TÁCH TRÁCH NHIỆM</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif text-slate-950">
              Kiến trúc hệ thống chuẩn mực
            </h2>
            <p className="text-base font-sans text-slate-600">
              Minh bạch hóa 3 lớp vận hành công nghệ cốt lõi giúp loại bỏ các điểm nghẽn và duy trì tính ổn định vĩnh cửu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-sans">
            <div className="relative rounded-3xl p-8 border-2 transition-all space-y-6 bg-white border-sky-100 shadow-sm hover:border-sky-300">
              <WaterDroplet3D size={18} right={-7} top={-7} wobble />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-sky-50 border-sky-200 text-sky-700">
                  TẦNG 01
                </span>
                <span className="text-xs font-mono text-slate-500">CORE_SECURITY</span>
              </div>
              <h3 className="text-2xl font-black font-serif text-slate-900">
                Lớp Dữ liệu & Bảo mật Cốt lõi
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Mã hóa đa điểm AES-256 từ cơ sở dữ liệu đến đường truyền. Thiết lập hệ thống sao lưu tự động và phục hồi sau thảm họa (Disaster Recovery).
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 border-t border-sky-100 pt-4 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Zero Trust Architecture</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Mã hóa bất đối xứng RSA-4096</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Sao lưu đa vùng địa lý</li>
              </ul>
            </div>

            <div className="relative rounded-3xl p-8 border-2 transition-all space-y-6 bg-white border-sky-100 shadow-sm hover:border-sky-300">
              <WaterDroplet3D size={18} right={-7} top={-7} delay="0.5s" wobble />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-sky-50 border-sky-200 text-sky-700">
                  TẦNG 02
                </span>
                <span className="text-xs font-mono text-slate-500">SERVICE_BUS</span>
              </div>
              <h3 className="text-2xl font-black font-serif text-slate-900">
                Lớp Nghiệp vụ & Điều phối Luồng
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Engine xử lý nghiệp vụ tự động điều phối hàng nghìn quy trình song song, phân tích ngữ cảnh và kiểm soát tuân thủ thời gian thực.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 border-t border-sky-100 pt-4 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Workflow Engine độc lập</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> API Gateway hiệu năng cao</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Kiểm toán giao dịch tự động</li>
              </ul>
            </div>

            <div className="relative rounded-3xl p-8 border-2 transition-all space-y-6 bg-white border-sky-100 shadow-sm hover:border-sky-300">
              <WaterDroplet3D size={18} right={-7} top={-7} delay="1.0s" wobble />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-sky-50 border-sky-200 text-sky-700">
                  TẦNG 03
                </span>
                <span className="text-xs font-mono text-slate-500">EXECUTIVE_UI</span>
              </div>
              <h3 className="text-2xl font-black font-serif text-slate-900">
                Lớp Trải nghiệm & Báo cáo Lãnh đạo
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Giao diện tối giản, trực quan hóa dữ liệu đa chiều, phục vụ các quyết sách điều hành nhanh chóng, chính xác và bảo mật tuyệt đối.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 border-t border-sky-100 pt-4 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Realtime Dashboard chỉ số C-Level</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Trải nghiệm mượt mà đa thiết bị</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-600" /> Cảnh báo rủi ro sớm qua AI</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: SECURITY & COMPLIANCE (Bảo Mật & Tuân Thủ)
          ========================================================================= */}
      <section
        id="security"
        className="relative py-24 border-b border-sky-100 bg-gradient-to-b from-[#E8F4FD] via-white to-[#F0F8FF] text-center overflow-visible"
      >
        <SectionEdgeWildlifePin side="left" type="crab" />
        <SectionEdgeWildlifePin side="right" type="flower" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          <div className="relative inline-block max-w-3xl mx-auto p-6 rounded-3xl bg-white/90 border border-sky-100 shadow-[0_8px_30px_rgba(14,165,233,0.06)] space-y-3">
            <SectionHeaderDroplets />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-sky-50 border border-sky-200 text-sky-800">
              <ShieldCheck className="w-3.5 h-3.5 anim-royal-gleam text-sky-600" />
              <span>TIÊU CHUẨN AN TOÀN THÔNG TIN QUỐC TẾ</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif text-slate-950">
              Cam kết bảo vệ dữ liệu tối thượng
            </h2>
            <p className="text-base font-sans text-slate-600">
              Mọi giải pháp của Business Connect đều tuân thủ các khung quy chuẩn an toàn dữ liệu khắt khe nhất thế giới.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left font-sans">
            <div className="p-7 rounded-2xl border transition-all bg-white border-sky-100 shadow-sm space-y-4 hover:border-sky-300">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600 border border-sky-200">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold font-serif text-slate-900">ISO/IEC 27001:2022</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống Quản lý An toàn Thông tin đạt chứng chỉ toàn diện, đảm bảo bảo mật và khả năng phục hồi dữ liệu trước mọi sự cố.
              </p>
            </div>

            <div className="p-7 rounded-2xl border transition-all bg-white border-sky-100 shadow-sm space-y-4 hover:border-sky-300">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600 border border-sky-200">
                <LockKeyhole className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold font-serif text-slate-900">SOC 2 Type II Certified</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kiểm toán độc lập định kỳ về tính bảo mật, tính sẵn sàng và tính toàn vẹn của dữ liệu trong quá trình xử lý.
              </p>
            </div>

            <div className="p-7 rounded-2xl border transition-all bg-white border-sky-100 shadow-sm space-y-4 hover:border-sky-300">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600 border border-sky-200">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold font-serif text-slate-900">GDPR & Nghị định 13/2023</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tuân thủ tuyệt đối các quy định về bảo vệ dữ liệu cá nhân của Liên minh Châu Âu và pháp luật Việt Nam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: STRATEGIC PARTNERS (Đối Tác Chiến Lược)
          ========================================================================= */}
      <section id="partners" className="relative py-20 border-b border-sky-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BusinessConnectPartnersSection themeMode="light" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FOOTER (Chân trang)
          ========================================================================= */}
      <footer className="py-16 bg-white border-t border-sky-100 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-slate-900">Business Connect V5</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md text-center md:text-right">
              Giải pháp kiến trúc phần mềm quản trị quan hệ đối tác B2B cấp cao, bảo mật và toàn vẹn tuyệt đối.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs border-t border-sky-100 pt-6">
            <p>© 2026 Business Connect V5. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0 font-bold">
              <Link to="/business-connect/v1" className="hover:text-sky-600">V1 Classic</Link>
              <Link to="/business-connect/v2" className="hover:text-sky-600">V2 Zen</Link>
              <Link to="/business-connect/v3" className="hover:text-sky-600">V3 Bento</Link>
              <Link to="/business-connect/v4" className="hover:text-sky-600">V4 Cyber</Link>
              <Link to="/business-connect/v5" className="text-sky-600 underline">V5 Sovereign</Link>
            </div>
          </div>
        </div>
      </footer>
      </main>

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md rounded-3xl border-2 p-7 shadow-2xl bg-white border-sky-200 text-slate-900">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black mb-1 font-serif text-slate-950">
              Thẩm Định Hệ Thống V5
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Điền thông tin để ban kiến trúc giải pháp Enterprise chuẩn bị hồ sơ thẩm định bảo mật & an toàn dữ liệu cho tổ chức.
            </p>
            <form onSubmit={handleDemoSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold mb-1">Họ và tên Lãnh Đạo *</label>
                <input
                  type="text"
                  required
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full h-11 px-3.5 rounded-xl border border-sky-200 text-sm outline-none focus:border-sky-500 bg-sky-50/40 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                  placeholder="VD: 0912345678"
                  className="w-full h-11 px-3.5 rounded-xl border border-sky-200 text-sm outline-none focus:border-sky-500 bg-sky-50/40 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tên Tổ Chức / Tập Đoàn</label>
                <input
                  type="text"
                  value={demoForm.org}
                  onChange={(e) => setDemoForm({ ...demoForm, org: e.target.value })}
                  placeholder="VD: TẬP ĐOÀN TÀI CHÍNH VIONE"
                  className="w-full h-11 px-3.5 rounded-xl border border-sky-200 text-sm outline-none focus:border-sky-500 bg-sky-50/40 text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all mt-4 cursor-pointer shadow-xl border bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 hover:brightness-105 text-white border-sky-400"
              >
                Gửi Yêu Cầu Thẩm Định
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
