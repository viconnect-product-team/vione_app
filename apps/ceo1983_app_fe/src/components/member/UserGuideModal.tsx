import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Upload,
  Trash2,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Home,
  CreditCard,
  ShoppingBag,
  Handshake,
  Vote,
  Compass,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/api-client";
import { useRole } from "@/hooks/use-role";

export interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_PDF_URL = "/docs/HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf";

interface GuideStep {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: typeof Home;
  color: string;
  bgLight: string;
  screenName: string;
  description: string;
  highlights: string[];
  actionHint: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 1,
    title: "Trang Chủ & Cập Nhật Hồ Sơ Nhanh",
    subtitle: "Thao tác tiện lợi như Facebook ngay tại màn hình chính",
    badge: "Màn hình 1/6",
    icon: Home,
    color: "#003B95",
    bgLight: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    screenName: "Trang chủ (/association)",
    description:
      "Màn hình trung tâm quản trị toàn bộ hoạt động của CLB. Cho phép hội viên cập nhật thông tin nhận diện doanh nghiệp ngay lập tức mà không cần qua nhiều bước phức tạp.",
    highlights: [
      "Thay đổi ảnh đại diện (Avatar), ảnh bìa và tải lên Logo công ty chính hãng.",
      "Cập nhật số điện thoại và tên doanh nghiệp trực tiếp chỉ với 1 chạm.",
      "Nút thao tác nhanh Biểu quyết sự kiện và mã QR Check-in đại hội.",
      "Thông báo hoạt động và danh bạ hỗ trợ trực tuyến của các Ban Chuyên Môn.",
    ],
    actionHint: "Bấm vào ảnh đại diện hoặc icon cây bút chì ở góc thẻ để mở Chỉnh sửa nhanh.",
  },
  {
    id: 2,
    title: "Thẻ Hội Viên & Danh Thiếp Số Độc Bản",
    subtitle: "Nhận diện thương hiệu doanh nhân và kết nối không chạm",
    badge: "Màn hình 2/6",
    icon: CreditCard,
    color: "#F59E0B",
    bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    screenName: "Thẻ hội viên (/association/card)",
    description:
      "Tấm danh thiếp số sang trọng chuẩn CEO 1983. Tích hợp mã QR công khai để đối tác bên ngoài quét nhận diện thông tin ngay trên điện thoại.",
    highlights: [
      "Logo công ty của bạn xuất hiện trang trọng tại góc trên bên phải thẻ.",
      "Mã QR số hóa cá nhân bên dưới logo, bấm vào để phóng to toàn màn hình.",
      "Chức năng quét mã QR trực tiếp ngay dưới thẻ để kết nối đối tác tại sự kiện.",
      "Bật/Tắt quyền riêng tư (Privacy Toggle) tùy chọn hiển thị số điện thoại, Zalo, Email.",
      "Xem thông tin hợp đồng hội viên và hồ sơ năng lực chi tiết ngay dưới thẻ.",
    ],
    actionHint: "Bấm nút 'Chỉnh sửa thẻ & Quyền riêng tư' để kiểm soát dữ liệu bạn muốn đối tác thấy.",
  },
  {
    id: 3,
    title: "Sàn Giao Thương Marketplace & Nhắn Tin Nhà Bán",
    subtitle: "Quảng bá sản phẩm và thương thảo mua bán chéo B2B",
    badge: "Màn hình 3/6",
    icon: ShoppingBag,
    color: "#059669",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    screenName: "Marketplace (/association/products)",
    description:
      "Sàn thương mại điện tử B2B nội bộ dành riêng cho doanh nghiệp hội viên CEO 1983 với chính sách ưu đãi thành viên đặc quyền.",
    highlights: [
      "Khu vực Banner Tài Trợ Doanh Nghiệp màu Đen Titan & Vàng Gold sang trọng.",
      "Đăng bán sản phẩm, dịch vụ và giải pháp công nghiệp của doanh nghiệp.",
      "Nút nhắn tin trực tiếp tới người bán để hỏi đáp thông tin sản phẩm và đàm phán giá.",
      "Lọc theo ngành nghề: Công nghệ, Xây dựng, F&B, Logistics, Dịch vụ doanh nghiệp.",
    ],
    actionHint: "Bấm biểu tượng tin nhắn trên từng sản phẩm để kết nối trực tiếp với chủ doanh nghiệp.",
  },
  {
    id: 4,
    title: "Chia Sẻ Cơ Hội & Khớp Nối Cung Cầu Realtime",
    subtitle: "Thống kê thời gian thực tổng cơ hội và giá trị giao dịch",
    badge: "Màn hình 4/6",
    icon: Sparkles,
    color: "#7C3AED",
    bgLight: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
    screenName: "Cơ hội giao thương (/association/opportunities)",
    description:
      "Kênh chia sẻ nhu cầu mua sắm, nguồn hàng và cơ hội đầu tư kinh doanh. Mọi đề xuất đều được hỗ trợ kết nối từ Ban Xúc Tiến Thương Mại.",
    highlights: [
      "Thanh thống kê Realtime: Tổng số cơ hội, sản phẩm và tổng giá trị giao dịch (VNĐ).",
      "Đăng tin Cung cấp (Supply), Tìm mua (Demand) hoặc Hợp tác liên kết (Joint Venture).",
      "Gắn tag giá trị dự án và thông tin liên hệ trực tiếp của người phụ trách.",
    ],
    actionHint: "Đăng cơ hội mới để các doanh nghiệp trong hiệp hội chủ động liên hệ hợp tác.",
  },
  {
    id: 5,
    title: "Hẹn Gặp Kết Nối & Bàn Chiến Lược Kinh Doanh",
    subtitle: "Kết nối có mục đích, không phải kết bạn thông thường",
    badge: "Màn hình 5/6",
    icon: Handshake,
    color: "#EA580C",
    bgLight: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50",
    screenName: "Danh bạ & Tin nhắn (/association/members & /association/messages)",
    description:
      "Cơ chế kết nối thực chất dành cho giới chủ doanh nghiệp: Gửi thông điệp đề xuất hẹn gặp, thảo luận chiến lược hoặc đính kèm cơ hội giao thương cụ thể.",
    highlights: [
      "Popup trượt từ dưới lên nhập nhanh: Họ tên, Số điện thoại, Tên công ty và Mục đích gặp.",
      "Tùy chọn đính kèm tin đăng cơ hội giao thương để hai bên trao đổi hiệu quả.",
      "Tin nhắn nhận được hiển thị thẻ Thư Mời Gặp Mặt trang trọng.",
      "Đối tác có nút 'Đồng ý kết nối' hoặc 'Hủy' (kèm lý do không bắt buộc).",
    ],
    actionHint: "Tìm hội viên trong danh bạ và bấm icon Bắt tay 'Hẹn gặp kết nối'.",
  },
  {
    id: 6,
    title: "Biểu Quyết Sự Kiện & Đại Hội CLB",
    subtitle: "Biểu quyết gắn liền với từng cuộc họp và sự kiện thực tế",
    badge: "Màn hình 6/6",
    icon: Vote,
    color: "#0284C7",
    bgLight: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50",
    screenName: "Biểu quyết (/association/voting)",
    description:
      "Thực hiện quyền hội viên dân chủ, biểu quyết trực tuyến minh bạch cho các quyết sách, nhân sự Ban Điều Hành và nghị quyết đại hội CLB.",
    highlights: [
      "Tab 'Đang diễn ra': Các phiên biểu quyết đang mở theo từng sự kiện và cuộc họp cụ thể.",
      "Tab 'Lịch sử biểu quyết': Lưu trữ kết quả và tỷ lệ đồng thuận của các kỳ họp trước.",
      "Thống kê realtime tỷ lệ % phiếu Đồng ý, Không đồng ý và Ý kiến khác.",
    ],
    actionHint: "Bấm 'Biểu quyết' tại màn hình chính hoặc chọn mục Biểu quyết trong thanh menu.",
  },
];

export function UserGuideModal({ open, onClose }: UserGuideModalProps) {
  const { isAdmin, isPlatformAdmin } = useRole();
  const hasAdminPrivilege = Boolean(isAdmin || isPlatformAdmin);

  const [activeTab, setActiveTab] = useState<"interactive" | "pdf">("interactive");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>(DEFAULT_PDF_URL);
  const [uploading, setUploading] = useState(false);
  const [adminBarOpen, setAdminBarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vba_active_guide_pdf");
      if (saved) {
        setPdfUrl(saved);
      }
    }
  }, []);

  if (!open || typeof document === "undefined") return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      toast.success("Quý CEO đã xem xong toàn bộ chỉ dẫn tính năng của App Hiệp Hội!");
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkipTour = () => {
    toast.info("Đã bỏ qua hướng dẫn. Quý CEO có thể mở lại bất kỳ lúc nào tại menu cá nhân.");
    onClose();
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Vui lòng chọn tệp tin có định dạng PDF (.pdf)");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file, `HDSD_${Date.now()}.pdf`);
      if (uploadedUrl) {
        setPdfUrl(uploadedUrl);
        localStorage.setItem("vba_active_guide_pdf", uploadedUrl);
        toast.success("Ban Quản Trị đã cập nhật file PDF hướng dẫn sử dụng mới!");
      }
    } catch {
      toast.error("Tải file lên thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleResetDefault = () => {
    setPdfUrl(DEFAULT_PDF_URL);
    localStorage.removeItem("vba_active_guide_pdf");
    toast.info("Đã khôi phục file PDF hướng dẫn sử dụng mặc định của CLB.");
  };

  const StepIcon = currentStep.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#071228] shadow-2xl">
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 backdrop-blur-md shadow-xs border border-amber-400/30 text-amber-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                  HƯỚNG DẪN SỬ DỤNG APP HIỆP HỘI
                </h3>
                <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-200 border border-amber-400/30 uppercase">
                  CEO 1983
                </span>
              </div>
              <p className="text-[11px] text-sky-200/80">
                Chỉ dẫn chi tiết từng tính năng & Sổ tay tài liệu chính thức
              </p>
            </div>
          </div>

          {/* Quick Close & Skip */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipTour}
              className="text-[11px] font-bold text-sky-200 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl bg-black/30 hover:bg-black/50 text-white transition cursor-pointer"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("interactive")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "interactive"
                ? "border-[#003B95] text-[#003B95] dark:border-amber-400 dark:text-amber-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Chỉ dẫn từng bước ({GUIDE_STEPS.length} bước)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pdf"
                ? "border-[#003B95] text-[#003B95] dark:border-amber-400 dark:text-amber-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Sổ tay tài liệu PDF</span>
          </button>
        </div>

        {/* Tab 1: Interactive Step-by-Step Tour */}
        {activeTab === "interactive" && (
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-[#0B132B]/50">
            {/* Step Progress Pills */}
            <div className="space-y-2 mb-4 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Bước {currentStepIndex + 1} / {GUIDE_STEPS.length}: {currentStep.screenName}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {Math.round(((currentStepIndex + 1) / GUIDE_STEPS.length) * 100)}% hoàn thành
                </span>
              </div>

              {/* Progress bar line */}
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#003B95] to-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / GUIDE_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Step indicator buttons */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                {GUIDE_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition shrink-0 cursor-pointer ${
                      currentStepIndex === idx
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {idx + 1}. {step.title.split("&")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Card */}
            <div className="flex-1 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0F172A] p-5 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl shrink-0 text-white shadow-md"
                    style={{ backgroundColor: currentStep.color }}
                  >
                    <StepIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <span className="inline-block text-[10.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-1">
                      {currentStep.badge}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {currentStep.title}
                    </h2>
                    <p className="text-xs sm:text-[13px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      {currentStep.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Điểm nổi bật của tính năng:
                  </p>
                  <ul className="space-y-1.5">
                    {currentStep.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action hint banner & Live Tour Launcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>Mẹo: {currentStep.actionHint}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem("ceo1983_trigger_tour_on_mount", "1");
                        onClose();
                        if (typeof window !== "undefined") {
                          window.location.href = "/association";
                        }
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] shadow-xs hover:opacity-95 transition cursor-pointer shrink-0 self-start sm:self-auto"
                    title="Chuyển về Trang chủ và bật Tour chỉ dẫn từng bước tương tác kiểu ngân hàng"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Chỉ dẫn trực tiếp trên màn hình</span>
                  </button>
                </div>
              </div>

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 gap-3">
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Bước trước</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSkipTour}
                    className="px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                  >
                    Bỏ qua
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-95 transition cursor-pointer"
                  >
                    <span>{currentStepIndex === GUIDE_STEPS.length - 1 ? "Đã hiểu & Bắt đầu" : "Bước tiếp theo"}</span>
                    {currentStepIndex === GUIDE_STEPS.length - 1 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PDF Document Viewer */}
        {activeTab === "pdf" && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-white/[0.02] text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <FileText className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                <span className="font-semibold truncate max-w-xs sm:max-w-md">
                  Tài liệu Hướng dẫn sử dụng chính thức CLB CEO 1983 (.PDF)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Admin-only Upload File Trigger (Requirement 15) */}
                {hasAdminPrivilege ? (
                  <button
                    type="button"
                    onClick={() => setAdminBarOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/25 transition cursor-pointer text-xs"
                    title="Chức năng chỉ dành cho Ban Quản Trị / Admin"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Cập nhật file (BQT)</span>
                  </button>
                ) : (
                  <span className="hidden sm:inline text-[11px] text-slate-400 italic">
                    Tài liệu BQT phát hành
                  </span>
                )}

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mở tab mới</span>
                </a>

                <a
                  href={pdfUrl}
                  download="HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold transition shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải về</span>
                </a>
              </div>
            </div>

            {/* Admin-Only Upload Drawer (Requirement 15) */}
            {hasAdminPrivilege && adminBarOpen && (
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-4 sm:px-6 py-2.5 text-xs animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2 text-slate-800 dark:text-amber-200 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Quyền Quản Trị: Tải file PDF hướng dẫn sử dụng mới lên máy chủ</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer transition">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{uploading ? "Đang tải lên..." : "Chọn file PDF từ máy tính"}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={uploading}
                      onChange={handleUploadPdf}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                    title="Khôi phục file ban đầu"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    <span>Khôi phục mặc định</span>
                  </button>
                </div>
              </div>
            )}

            {/* Iframe View */}
            <div className="flex-1 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="h-full w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-inner"
                title="Tài liệu Hướng dẫn sử dụng App Hiệp Hội CEO 1983"
              />

              {/* Mobile Fallback Overlay */}
              <div className="sm:hidden absolute bottom-4 inset-x-4 pointer-events-none flex justify-center">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl bg-[#003B95] px-5 py-2.5 text-xs font-bold text-white shadow-lg border border-white/20 active:scale-95 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Xem toàn màn hình & Tải về</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
