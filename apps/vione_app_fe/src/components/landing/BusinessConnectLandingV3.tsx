import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Coins,
  Wallet,
  Clock,
  Landmark,
  PieChart,
  LineChart,
  LayoutDashboard,
  KeyRound,
  Layers,
  Award,
  Crown,
  TrendingDown,
  TrendingUp,
  X,
  Check,
  Percent,
  Banknote,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { BusinessConnectPartnersSection } from "./BusinessConnectPartnersSection";
import { toast } from "sonner";
import { useAutoHideHeader } from "./useAutoHideHeader";
import { KineticWords, KineticTitleBox } from "./KineticTypography";

export function BusinessConnectLandingV3() {
  // STRICTLY FIXED LIGHT THEME
  const themeMode = "light";
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
    toast.success("Đăng ký thành công! Đội ngũ tư vấn ROI của Business Connect sẽ liên hệ trong 24h.");
    setDemoModalOpen(false);
    setDemoForm({ name: "", phone: "", email: "", org: "", note: "" });
  };

  return (
    <div
      className="min-h-screen font-sans bg-[#F4F9F5] text-slate-900 relative overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-950"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Luxury Architectural & Financial Atmosphere Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690d_1px,transparent_1px),linear-gradient(to_bottom,#0596690d_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_60%,transparent_100%)] opacity-80" />
      </div>

      {/* =========================================================================
          SECTION 1: HEADER (Tự ẩn sau 3s, di chuột hoặc scroll thì hiện lại)
          Theme Sang Trọng Emerald & Gold, Chữ Đen Tuyền Sắc Nét
          ========================================================================= */}
      <header
        style={headerStyle}
        onMouseEnter={resetTimer}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/95 border-b border-emerald-100 shadow-[0_2px_15px_rgba(5,150,105,0.06)] transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/business-connect/v3" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight block leading-tight text-slate-950">
                  BUSINESS <span className="text-emerald-600">CONNECT</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  V3 ROI BENTO
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-700">
                TỐI ƯU CHI PHÍ • GIA TĂNG LỢI NHUẬN • BỀN VỮNG
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-700">
            <a href="#challenges" className="hover:text-emerald-600 transition-colors">Thách thức ROI</a>
            <a href="#solutions" className="hover:text-emerald-600 transition-colors">Giải pháp Bento</a>
            <a href="#performance" className="hover:text-emerald-600 transition-colors">Báo cáo Hiệu suất</a>
            <a href="#partners" className="hover:text-emerald-600 transition-colors">Đối tác chiến lược</a>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans">
              VI / EN
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {/* Emerald Luxury Badge */}
            <div
              className="px-3 py-1.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center gap-1.5 text-xs font-bold select-none"
              title="Theme Emerald Gold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider">EMERALD BENTO</span>
            </div>

            <Link
              to="/connect-app"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border text-slate-800 bg-white hover:bg-emerald-50 border-emerald-200 shadow-sm transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đăng nhập</span>
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 text-white shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all cursor-pointer border border-emerald-400"
            >
              Nhận tư vấn tối ưu ROI →
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: HERO SECTION (Cố định làm nền - Sticky Section)
          Khi người dùng cuộn xuống, Section 2 sẽ từ dưới đáy trượt lên đè lên Hero!
          ========================================================================= */}
      <section
        id="hero"
        className="sticky top-0 z-10 min-h-[95vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center"
      >
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Kinetic Badge */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border-2 text-xs font-mono font-bold tracking-wider uppercase shadow-sm bg-white/90 border-emerald-200 text-emerald-800"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>ĐỘT PHÁ QUẢN TRỊ ROI • TỐI ƯU HÓA CHI PHÍ DOANH NGHIỆP</span>
          </motion.div>

          {/* Kinetic Headline with Word-by-Word Emergence */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight font-serif text-slate-950">
            <KineticWords
              text="Cắt giảm 70% lãng phí. Gia tăng 300% hiệu suất liên kết thương mại."
              highlightIndices={[0, 1, 2, 7, 8]}
              highlightClass="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 font-extrabold"
            />
          </h1>

          {/* Kinetic Subtitle */}
          <motion.p
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-xl leading-relaxed max-w-3xl mx-auto text-slate-700 font-normal"
          >
            Mô hình Bento ROI của Business Connect tái định nghĩa cách các Hiệp hội và Doanh nghiệp vận hành: loại bỏ triệt để điểm mù chi phí, số hóa mạng lưới giao thương và tạo ra lợi nhuận đo lường được từng ngày.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all cursor-pointer border-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-emerald-400 flex items-center gap-2"
            >
              <span>Tính toán ROI Doanh Nghiệp Bạn</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#challenges"
              className="px-7 py-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-2 border-emerald-200 bg-white/80 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm"
            >
              <LineChart className="w-4 h-4 text-emerald-600" />
              <span>Xem Báo Cáo Đo Lường</span>
            </a>
          </motion.div>

          {/* Scroll Down Hint indicating bottom-up stacking section */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="pt-8 text-xs font-mono font-bold text-emerald-600 flex items-center justify-center gap-2"
          >
            <span>CUỘN ĐỂ KÉO PHÂN HỆ TIẾP THEO TỪ DƯỚI LÊN</span>
            <span className="text-base">↓</span>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THÁCH THỨC & LÃNG PHÍ ROI (Kéo từ dưới lên đè lên Section 1)
          Stacking Card: relative z-20 rounded-t-[40px] shadow-2xl bg-white
          ========================================================================= */}
      <section
        id="challenges"
        className="relative z-20 rounded-t-[40px] sm:rounded-t-[50px] shadow-[0_-25px_60px_rgba(5,150,105,0.08)] bg-white border-t border-emerald-100 py-24 sm:py-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <KineticTitleBox
            badge="NHẬN DIỆN LỖ HỔNG LỢI NHUẬN"
            title="Doanh nghiệp bạn đang thất thoát bao nhiêu phần trăm ngân sách mỗi năm?"
            subtitle="Phần lớn các tổ chức và hiệp hội đang duy trì các công cụ rời rạc, gây lãng phí hàng tỷ đồng chi phí nhân sự và bỏ lỡ những thương vụ B2B giá trị cao."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-amber-50/30 via-emerald-50/20 to-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  <KineticWords text="Chi phí vận hành thủ công phình to" />
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nhân sự mất 45% thời gian nhập liệu, đối soát danh bạ và gửi email thủ công thay vì tập trung tạo ra doanh thu.
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-mono font-bold text-amber-800">
                <span>LÃNG PHÍ:</span>
                <span>~45% Giờ công</span>
              </div>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-amber-50/30 via-emerald-50/20 to-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  <KineticWords text="Bỏ lỡ cơ hội chốt deal nội khối" />
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thiếu sàn ghép cung cầu AI khiến các hội viên mua ngoài với chi phí đắt đỏ thay vì trao đổi giá ưu đãi trong liên minh.
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-mono font-bold text-emerald-800">
                <span>THẤT THOÁT:</span>
                <span>Hàng tỷ VNĐ/năm</span>
              </div>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-amber-50/30 via-emerald-50/20 to-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  <KineticWords text="Độ trễ thông tin tiếp cận đối tác" />
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mất 5-7 ngày để tìm được thông tin người đại diện có thẩm quyền ký kết, giảm 60% xác suất thắng thầu.
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-mono font-bold text-amber-800">
                <span>ĐỘ TRỄ:</span>
                <span>+5 đến 7 ngày</span>
              </div>
            </motion.div>

            {/* Bento Card 4 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-amber-50/30 via-emerald-50/20 to-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-950">
                  <KineticWords text="Rủi ro phân mảnh dữ liệu CRM" />
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dữ liệu nằm rải rác trên Zalo, Excel, không kiểm soát được dòng tương tác khi nhân viên kinh doanh nghỉ việc.
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-mono font-bold text-emerald-800">
                <span>RỦI RO:</span>
                <span>Mất tệp khách VIP</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: GIẢI PHÁP BENTO ROI (Chạy từ TRÁI VÀO - Slide in from Left)
          ========================================================================= */}
      <section id="solutions" className="relative py-24 bg-[#F0FDF4] border-t border-emerald-100 overflow-hidden">
        <motion.div
          initial={{ x: -140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
        >
          <KineticTitleBox
            badge="PHÂN HỆ BENTO ĐỘT PHÁ"
            title="Hệ thống 6 trụ cột tối ưu hóa dòng tiền và lợi nhuận B2B"
            subtitle="Tích hợp liền mạch toàn bộ các công cụ xúc tiến thương mại, CRM và tự động hóa trong một kiến trúc trực quan, dễ dùng."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Col 1 */}
            <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4 hover:border-emerald-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-950">
                <KineticWords text="Sàn Deal Flow AI Nội Khối" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động bắt cặp cung - cầu với tỷ lệ chính xác 98%, gửi thông báo tức thì khi có thành viên trong liên minh cần mua sản phẩm/dịch vụ bạn cung cấp.
              </p>
              <div className="pt-4 border-t border-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Tăng gấp 3 lần tỷ lệ chốt hợp đồng
              </div>
            </div>

            {/* Bento Col 2 */}
            <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4 hover:border-emerald-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-950">
                <KineticWords text="CRM Đối Tác B2B Chuyên Biệt" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quản lý lịch sử gặp gỡ, nhật ký hợp tác, chấm điểm mức độ tin cậy và tự động nhắc nhở thời điểm vàng để tái ký hợp đồng kinh doanh.
              </p>
              <div className="pt-4 border-t border-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> 100% dữ liệu đối tác thuộc về tổ chức
              </div>
            </div>

            {/* Bento Col 3 */}
            <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4 hover:border-emerald-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-950">
                <KineticWords text="Đo Lường ROI Thời Gian Thực" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bảng phân tích trực quan tính toán chính xác số tiền tiết kiệm được, số lượng kết nối mới và tổng doanh số phát sinh từ liên minh.
              </p>
              <div className="pt-4 border-t border-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Minh bạch tài chính từng thương vụ
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 4: BÁO CÁO HIỆU SUẤT & ROI (Chạy từ PHẢI VÀO - Slide in from Right)
          ========================================================================= */}
      <section id="performance" className="relative py-24 bg-white border-t border-emerald-100 overflow-hidden">
        <motion.div
          initial={{ x: 140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
        >
          <KineticTitleBox
            badge="BẢNG ĐIỀU HÀNH HIỆU SUẤT"
            title="Dữ liệu kiểm chứng thực tế từ hơn 300 Hiệp hội và Doanh nghiệp"
            subtitle="Kết quả định lượng cụ thể sau 6 tháng chuyển đổi sang nền tảng Business Connect."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100 text-center space-y-2 hover:border-emerald-300 transition-colors">
              <span className="text-5xl font-black font-mono text-emerald-700 block">70%</span>
              <p className="text-sm font-bold text-slate-900 font-serif">Giảm chi phí vận hành</p>
              <p className="text-xs text-slate-600">Tự động hóa 100% hồ sơ hội viên</p>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100 text-center space-y-2 hover:border-emerald-300 transition-colors">
              <span className="text-5xl font-black font-mono text-emerald-700 block">300%</span>
              <p className="text-sm font-bold text-slate-900 font-serif">Tăng hiệu quả kết nối</p>
              <p className="text-xs text-slate-600">Nhờ thuật toán AI gợi ý đối tác</p>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100 text-center space-y-2 hover:border-emerald-300 transition-colors">
              <span className="text-5xl font-black font-mono text-emerald-700 block">&lt;1s</span>
              <p className="text-sm font-bold text-slate-900 font-serif">Tốc độ Check-in NFC</p>
              <p className="text-xs text-slate-600">Đón tiếp lễ tân hội nghị nghìn người</p>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100 text-center space-y-2 hover:border-emerald-300 transition-colors">
              <span className="text-5xl font-black font-mono text-emerald-700 block">98%</span>
              <p className="text-sm font-bold text-slate-900 font-serif">Hài lòng từ lãnh đạo</p>
              <p className="text-xs text-slate-600">Minh bạch chỉ số và bảo mật cao</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 5: ĐỐI TÁC CHIẾN LƯỢC (Chạy từ TRÁI VÀO - Slide in from Left)
          ========================================================================= */}
      <section id="partners" className="relative py-24 bg-[#F0FDF4] border-t border-emerald-100 overflow-hidden">
        <motion.div
          initial={{ x: -140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
        >
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              ĐỐI TÁC HỆ SINH THÁI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-slate-950">
              Đồng hành cùng các tập đoàn và hiệp hội hàng đầu
            </h2>
          </div>
          <BusinessConnectPartnersSection themeMode="light" />
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 6: VỀ CHÚNG TÔI & ĐĂNG KÝ (Chạy từ PHẢI VÀO - Slide in from Right)
          ========================================================================= */}
      <section id="about" className="relative py-24 bg-white border-t border-emerald-100 overflow-hidden">
        <motion.div
          initial={{ x: 140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8"
        >
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-emerald-50 via-white to-amber-50/40 border-2 border-emerald-200 shadow-xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-950">
              <KineticWords text="Sẵn sàng tối ưu hóa dòng tiền và doanh số B2B?" />
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để nhận báo cáo phân tích ROI chuyên sâu và lộ trình triển khai chi tiết cho tổ chức của bạn.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-9 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 text-white shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all cursor-pointer border border-emerald-400"
              >
                Nhận Báo Cáo Tư Vấn ROI Miễn Phí →
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          FOOTER (Chân trang)
          ========================================================================= */}
      <footer className="py-16 bg-[#F0FDF4] border-t border-emerald-100 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-lg font-black font-serif text-slate-950">Business Connect V3 Bento</span>
            </div>
            <p className="text-slate-500">Kiến trúc Bento ROI tối ưu hóa lợi nhuận và kết nối B2B bền vững.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500">
            <p>© 2026 Business Connect V3. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0 font-bold">
              <Link to="/business-connect/v1" className="hover:text-emerald-700">V1 Classic</Link>
              <Link to="/business-connect/v2" className="hover:text-emerald-700">V2 Zen</Link>
              <Link to="/business-connect/v3" className="text-emerald-700 underline font-extrabold">V3 Bento</Link>
              <Link to="/business-connect/v4" className="hover:text-emerald-700">V4 Cyber</Link>
              <Link to="/business-connect/v5" className="hover:text-emerald-700">V5 Sovereign</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md rounded-3xl border-2 p-7 shadow-2xl bg-white border-emerald-200 text-slate-900">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black mb-1 font-serif text-slate-950">
              Tư Vấn Tối Ưu ROI V3
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Điền thông tin để chuyên gia Business Connect liên hệ gửi bảng tính toán ROI chi tiết cho tổ chức.
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
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-200 text-sm outline-none focus:border-emerald-500 bg-emerald-50/40 text-slate-900"
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
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-200 text-sm outline-none focus:border-emerald-500 bg-emerald-50/40 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tên Tổ Chức / Doanh Nghiệp</label>
                <input
                  type="text"
                  value={demoForm.org}
                  onChange={(e) => setDemoForm({ ...demoForm, org: e.target.value })}
                  placeholder="VD: CÔNG TY TNHH ABC"
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-200 text-sm outline-none focus:border-emerald-500 bg-emerald-50/40 text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all mt-4 cursor-pointer shadow-xl border bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 text-white border-emerald-400"
              >
                Nhận Báo Cáo Tính Toán ROI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
