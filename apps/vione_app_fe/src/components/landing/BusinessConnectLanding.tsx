import React, { useState, useRef, useEffect } from "react";
import { AssociationLandingTemplate } from "@/components/landing/templates/AssociationLandingTemplate";
import { LandingInteractiveShowcase } from "@/components/landing/LandingInteractiveShowcase";
import { useT } from "@/lib/i18n";
import {
  Users2,
  Briefcase,
  Layers,
  CalendarCheck,
  MessagesSquare,
  BookOpen,
  BarChart3,
  Bot,
  PlugZap,
  Building2,
  Users,
  GraduationCap,
  Coins,
  Landmark,
  Globe2,
  Database,
  TrendingDown,
  Contact2,
  BarChart2,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Film,
} from "lucide-react";

export function BusinessConnectLanding() {
  const t = useT();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<"kyc" | "kyc_1">("kyc");
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSources = {
    kyc: {
      title: "Video KYC & Định Danh Số Doanh Nhân 1-Chạm",
      desc: "Quy trình quét NFC, xác thực hồ sơ 360° & AI Matchmaking tự động trong 15s",
      src: "/landing/video_vione_kyc.mp4",
      duration: "00:15",
      badge: "VIONE KYC • 1080P",
    },
    kyc_1: {
      title: "Hệ Sinh Thái ViOne & Điều Hành Giao Thương B2B",
      desc: "Trải nghiệm kết nối hiệp hội, cơ hội hợp tác và sàn giao dịch B2B",
      src: "/landing/video_vione_kyc_1.mp4",
      duration: "00:15",
      badge: "VIONE ECOSYSTEM • 1080P",
    },
  };

  useEffect(() => {
    if (videoModalOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [videoModalOpen, selectedVideo]);

  return (
    <>
      <AssociationLandingTemplate
        brand={{
          name: "BUSINESS CONNECT",
          tagline: "PEOPLE • OPPORTUNITIES • GROWTH",
          initials: "BC",
        }}
        themeVariant="luxury"
        hero={{
          badge: t("landing.bc.hero.badge") || "NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI",
          title: t("landing.bc.hero.title") || "Hiểu đúng người.",
          titleGradientText: "Mở ra cơ hội thật.",
          subtitle:
            t("landing.bc.hero.subtitle") ||
            "Business Connect giúp các hiệp hội, tổ chức và doanh nghiệp quản lý mối quan hệ, kết nối đúng người, đúng thời điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.",
          ctaPrimaryText: t("landing.bc.hero.ctaDemo") || "Đặt demo ngay",
          ctaPrimaryLink: "/auth",
          ctaSecondaryText: "Xem video demo (15s)",
          onCtaSecondaryClick: () => setVideoModalOpen(true),
          stats: [
            { value: "10,000+", label: t("landing.bc.stats.entrepreneurs") || "Doanh nhân & Hội viên" },
            { value: "300+", label: t("landing.bc.stats.associations") || "Hiệp hội & Tổ chức" },
            { value: "50,000+", label: t("landing.bc.stats.opportunities") || "Kết nối được tạo" },
            { value: "20+", label: t("landing.bc.stats.countries") || "Quốc gia & vùng lãnh thổ" },
          ],
        }}
        challenges={{
          tag: t("landing.bc.challenges.tag") || "THÁCH THỨC",
          title: t("landing.bc.challenges.title") || "Những rào cản lớn trong quản trị & giao thương truyền thống",
          items: [
            {
              id: "c1",
              number: "01",
              title: t("landing.bc.challenges.c1.title") || "Dữ liệu phân tán",
              desc: t("landing.bc.challenges.c1.desc") || "Thông tin hội viên nằm rải rác trên nhiều file Excel, Zalo, khó tra cứu và đồng bộ.",
              icon: <Database className="w-6 h-6 text-rose-400" />,
            },
            {
              id: "c2",
              number: "02",
              title: t("landing.bc.challenges.c2.title") || "Tương tác một chiều",
              desc: t("landing.bc.challenges.c2.desc") || "Hội viên ít tham gia, không có động lực đóng góp hay chia sẻ cơ hội hợp tác.",
              icon: <Users className="w-6 h-6 text-amber-400" />,
            },
            {
              id: "c3",
              number: "03",
              title: t("landing.bc.challenges.c3.title") || "Tỷ lệ chuyển đổi thấp",
              desc: t("landing.bc.challenges.c3.desc") || "Nhiều sự kiện networking nhưng ít cơ hội kinh doanh thực sự được chuyển hóa.",
              icon: <TrendingDown className="w-6 h-6 text-orange-400" />,
            },
            {
              id: "c4",
              number: "04",
              title: t("landing.bc.challenges.c4.title") || "Quản lý thủ công",
              desc: t("landing.bc.challenges.c4.desc") || "Điểm danh, thu hội phí, gửi thông báo tốn nhiều thời gian và dễ sai sót.",
              icon: <Contact2 className="w-6 h-6 text-purple-400" />,
            },
            {
              id: "c5",
              number: "05",
              title: t("landing.bc.challenges.c5.title") || "Thiếu đo lường",
              desc: t("landing.bc.challenges.c5.desc") || "Không có báo cáo trực quan về hiệu quả hoạt động, giá trị giao thương tạo ra.",
              icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
            },
          ],
        }}
        solutions={{
          tag: t("landing.bc.solutions.tag") || "GIẢI PHÁP",
          title: t("landing.bc.solutions.title") || "9 Phân Hệ Đột Phá — Hợp Nhất Trong Một Nền Tảng",
          modules: [
            {
              id: "m1",
              number: "01",
              title: t("landing.bc.solutions.m1.title") || "Quản lý hội viên",
              desc: t("landing.bc.solutions.m1.desc") || "Hồ sơ 360°, phân nhóm thông minh, tương tác và chăm sóc tự động",
              icon: <Users2 className="w-6 h-6 text-amber-400" />,
              link: "/connect-app/network",
            },
            {
              id: "m2",
              number: "02",
              title: t("landing.bc.solutions.m2.title") || "CRM & Quan hệ",
              desc: t("landing.bc.solutions.m2.desc") || "Theo dõi lịch sử, ghi chú, nhắc nhở và gợi ý kết nối bằng AI",
              icon: <Briefcase className="w-6 h-6 text-blue-400" />,
              link: "/connect-app/inbox",
            },
            {
              id: "m3",
              number: "03",
              title: t("landing.bc.solutions.m3.title") || "Cơ hội kinh doanh",
              desc: t("landing.bc.solutions.m3.desc") || "Quản lý pipeline, matching cơ hội phù hợp, theo dõi doanh số",
              icon: <Layers className="w-6 h-6 text-emerald-400" />,
              link: "/connect-app/network",
            },
            {
              id: "m4",
              number: "04",
              title: t("landing.bc.solutions.m4.title") || "Sự kiện & Hội thảo",
              desc: t("landing.bc.solutions.m4.desc") || "Check-in QR/NFC, quản lý đăng ký, tương tác trực tiếp",
              icon: <CalendarCheck className="w-6 h-6 text-purple-400" />,
              link: "/events",
            },
            {
              id: "m5",
              number: "05",
              title: t("landing.bc.solutions.m5.title") || "Giao tiếp nội bộ",
              desc: t("landing.bc.solutions.m5.desc") || "Chat nhóm, tin nhắn trực tiếp, thông báo đẩy, chia sẻ tài liệu",
              icon: <MessagesSquare className="w-6 h-6 text-cyan-400" />,
              link: "/connect-app/inbox",
            },
            {
              id: "m6",
              number: "06",
              title: t("landing.bc.solutions.m6.title") || "Thư viện & Đào tạo",
              desc: t("landing.bc.solutions.m6.desc") || "Tài liệu chia sẻ, khóa học online, chứng chỉ số blockchain",
              icon: <BookOpen className="w-6 h-6 text-rose-400" />,
              link: "/m/library",
            },
            {
              id: "m7",
              number: "07",
              title: t("landing.bc.solutions.m7.title") || "Báo cáo & Phân tích",
              desc: t("landing.bc.solutions.m7.desc") || "Dashboard trực quan, phân tích xu hướng, dự báo cơ hội bằng AI",
              icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
              link: "/platform",
            },
            {
              id: "m8",
              number: "08",
              title: t("landing.bc.solutions.m8.title") || "AI Trợ lý ảo ViOne",
              desc: t("landing.bc.solutions.m8.desc") || "Gợi ý đối tác, tóm tắt cuộc họp, tự động hóa tác vụ hàng ngày",
              icon: <Bot className="w-6 h-6 text-amber-300" />,
              link: "/ai",
            },
            {
              id: "m9",
              number: "09",
              title: t("landing.bc.solutions.m9.title") || "Tích hợp & Mở rộng",
              desc: t("landing.bc.solutions.m9.desc") || "Kết nối ERP, CRM, ngân hàng, cổng thanh toán qua Open API",
              icon: <PlugZap className="w-6 h-6 text-teal-400" />,
              link: "/settings",
            },
          ],
        }}
        customSections={<LandingInteractiveShowcase />}
        ecosystem={{
          tag: "HỆ SINH THÁI",
          title: "Giải Pháp May Đo Cho Từng Mô Hình Tổ Chức",
          subtitle: "Linh hoạt tùy biến theo quy mô từ CLB doanh nhân đến tổng hội toàn quốc",
          nodes: [
            {
              id: "e1",
              name: "Hiệp hội Doanh nghiệp",
              desc: "Quản lý hàng ngàn hội viên, tổ chức sự kiện quy mô lớn, kết nối B2B đa ngành nghề và báo cáo chuyên sâu.",
              icon: <Building2 className="w-6 h-6 text-amber-400" />,
              count: "300+ Hiệp hội",
            },
            {
              id: "e2",
              name: "Câu lạc bộ Doanh nhân",
              desc: "Không gian kết nối tinh hoa, chia sẻ cơ hội độc quyền, bảo mật thông tin và nâng tầm vị thế thành viên.",
              icon: <Users className="w-6 h-6 text-blue-400" />,
              count: "10,000+ CEO",
            },
            {
              id: "e3",
              name: "Hội Cựu sinh viên & Trường",
              desc: "Mạng lưới cựu học viên, kết nối việc làm, tài trợ học bổng và duy trì gắn kết với nhà trường.",
              icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
              count: "50+ Trường ĐH",
            },
            {
              id: "e4",
              name: "Quỹ Đầu tư & Vườn ươm",
              desc: "Quản lý danh mục đầu tư, matching startup với nhà đầu tư, theo dõi tiến độ và hiệu quả thoái vốn.",
              icon: <Coins className="w-6 h-6 text-purple-400" />,
              count: "40+ Vườn ươm",
            },
            {
              id: "e5",
              name: "Tổ chức Xúc tiến Thương mại",
              desc: "Kết nối giao thương quốc tế, tổ chức đoàn khảo sát, hội chợ trực tuyến và hỗ trợ xuất nhập khẩu.",
              icon: <Landmark className="w-6 h-6 text-orange-400" />,
              count: "20+ Quốc gia",
            },
            {
              id: "e6",
              name: "Mạng lưới Chuyên gia Toàn cầu",
              desc: "Tập hợp chuyên gia đa lĩnh vực, chia sẻ tri thức, tư vấn dự án và cố vấn phát triển.",
              icon: <Globe2 className="w-6 h-6 text-cyan-400" />,
              count: "5,000+ Cố vấn",
            },
          ],
        }}
        partners={{
          tag: "ĐỐI TÁC TIN CẬY",
          title: "Được Tin Tưởng Bởi 300+ Hiệp Hội & Tổ Chức Hàng Đầu",
          partners: [
            { id: "ceo1983", name: "CLB Doanh Nhân CEO 1983", category: "CLB Doanh nhân tinh hoa", badge: "VIP Club" },
            { id: "yba", name: "Hội Doanh Nhân Trẻ TP.HCM", category: "Hơn 5,000 doanh nghiệp hội viên", badge: "Hiệp hội" },
            { id: "vcci", name: "Liên đoàn Thương mại & Công nghiệp VCCI", category: "Đại diện cộng đồng DN Việt Nam", badge: "Liên đoàn" },
            { id: "vla", name: "Hiệp Hội Logistics Việt Nam (VLA)", category: "Chuỗi cung ứng & xuất nhập khẩu", badge: "Quốc tế" },
            { id: "hanoiba", name: "Hội Doanh Nghiệp Trẻ Hà Nội", category: "Cộng đồng tiên phong thủ đô", badge: "Hiệp hội" },
            { id: "techlead", name: "CLB Doanh Nghiệp Công Nghệ", category: "Đổi mới sáng tạo & Chuyển đổi số", badge: "Công nghệ" },
          ],
        }}
        testimonials={{
          tag: "CÂU CHUYỆN THÀNH CÔNG",
          title: "Lãnh Đạo Nói Gì Về Business Connect",
          testimonials: [
            {
              id: "t1",
              author: "Nguyễn Văn Tuấn",
              role: "Chủ tịch CLB Doanh Nhân CEO 1983 • CTCP VinaTech",
              quote:
                "Business Connect đã thay đổi hoàn toàn cách chúng tôi vận hành CLB. Tỷ lệ tương tác giữa các thành viên tăng 300%, và giá trị giao thương nội bộ đạt hơn 120 tỷ trong năm qua.",
              avatarText: "NT",
            },
            {
              id: "t2",
              author: "Trần Thị Mai Phương",
              role: "Tổng Thư ký Hội Doanh Nhân Trẻ",
              quote:
                "Tính năng quản lý hội viên 360° và AI matching giúp chúng tôi kết nối đúng người chỉ trong vài giây. Quản trị viên tiết kiệm 80% thời gian so với cách làm cũ.",
              avatarText: "MP",
            },
            {
              id: "t3",
              author: "Lê Hoàng Long",
              role: "Giám đốc Vườn ươm Khởi nghiệp TechHub",
              quote:
                "Nền tảng giúp các startup trong mạng lưới dễ dàng tiếp cận nhà đầu tư và đối tác chiến lược. Báo cáo trực quan giúp chúng tôi nắm bắt sức khỏe hệ sinh thái mỗi ngày.",
              avatarText: "HL",
            },
          ],
        }}
        ctaBanner={{
          title: "Sẵn Sàng Nâng Tầm Tổ Chức Của Bạn?",
          subtitle:
            "Đăng ký nhận tư vấn và trải nghiệm miễn phí hệ thống Business Connect trong 30 ngày. Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn.",
          btnDemoText: "Đặt demo ngay",
          btnDemoLink: "/auth",
          btnAppText: "Liên hệ tư vấn",
          btnAppLink: "/auth",
        }}
      />

      {/* Video Demo High-Tech Modal with HTML5 Video Player */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVideoModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#161B29] to-[#080B12] p-4 sm:p-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(245,158,11,0.3)] overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-30 shadow-md"
              title="Đóng video"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Video Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
                  <Film className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                      VIDEO DEMO TRẢI NGHIỆM VIONE
                    </p>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      1080P FULL HD
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    {videoSources[selectedVideo].title}
                  </h3>
                </div>
              </div>

              {/* Video Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedVideo("kyc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedVideo === "kyc"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Video 1 (KYC)</span>
                </button>
                <button
                  onClick={() => setSelectedVideo("kyc_1")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedVideo === "kyc_1"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Video 2 (Hệ Sinh Thái)</span>
                </button>
              </div>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-amber-400/30 bg-black my-2 sm:my-3 shadow-2xl flex items-center justify-center group">
              <video
                ref={videoRef}
                key={videoSources[selectedVideo].src}
                src={videoSources[selectedVideo].src}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-2xl bg-black"
                poster="/landing/business-hero-bg.jpg"
              >
                <source src={videoSources[selectedVideo].src} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video HTML5.
              </video>

              {/* Overlay HUD Overlay Bar (Top) */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {videoSources[selectedVideo].badge}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/90 font-mono text-[11px] font-bold">
                  {videoSources[selectedVideo].duration}
                </span>
              </div>
            </div>

            {/* Video Description & Feature Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Định danh NFC 1-chạm & Nhận diện VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">AI Matchmaking ghép nối đúng nhu cầu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Bảo mật mã hóa đa tầng chuẩn C-Level</span>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                💡 Trải nghiệm thực tế hệ thống với dữ liệu demo trực quan dành riêng cho hiệp hội bạn.
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng lại
                </button>
                <a
                  href="/auth"
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] hover:from-[#FFF0C7] hover:to-[#E2B755] text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <span>Đặt lịch demo ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
