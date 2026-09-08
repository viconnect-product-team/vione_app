import { createFileRoute } from "@tanstack/react-router";
import { AssociationLandingTemplate } from "@/components/landing/templates/AssociationLandingTemplate";
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
  Handshake,
  Database,
  TrendingDown,
  Contact2,
  BarChart2,
} from "lucide-react";

export const Route = createFileRoute("/landing/")({
  head: () => ({
    meta: [
      { title: "ViOne — Hệ điều hành kết nối kinh doanh | Business Connection OS" },
      {
        name: "description",
        content:
          "Nền tảng hợp nhất quản lý hiệp hội, doanh nghiệp & kết nối giao thương đa chiều bằng AI và NFC.",
      },
      { property: "og:title", content: "ViOne — Business Connection OS" },
    ],
  }),
  component: ViOneLandingPage,
});

function ViOneLandingPage() {
  const t = useT();

  return (
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
        subtitle: t("landing.bc.hero.subtitle") || "Business Connect giúp các hiệp hội, tổ chức và doanh nghiệp quản lý mối quan hệ, kết nối đúng người, đúng thời điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.",
        ctaPrimaryText: t("landing.bc.hero.ctaDemo") || "Đặt demo ngay",
        ctaPrimaryLink: "/auth",
        ctaSecondaryText: "Xem video (2 phút)",
        ctaSecondaryLink: "#solutions",
        stats: [
          { value: "10,000+", label: t("landing.bc.stats.entrepreneurs") || "Doanh nhân & Hội viên" },
          { value: "300+", label: t("landing.bc.stats.associations") || "Hiệp hội & Tổ chức" },
          { value: "50,000+", label: t("landing.bc.stats.opportunities") || "Kết nối được tạo" },
          { value: "20+", label: t("landing.bc.stats.countries") || "Quốc gia & vùng lãnh thổ" },
        ],
      }}
      challenges={{
        tag: t("landing.bc.challenges.tag"),
        title: t("landing.bc.challenges.title"),
        items: [
          {
            id: "c1",
            number: "01",
            title: t("landing.bc.challenges.c1.title"),
            desc: t("landing.bc.challenges.c1.desc"),
            icon: <Database className="w-6 h-6 text-rose-400" />,
          },
          {
            id: "c2",
            number: "02",
            title: t("landing.bc.challenges.c2.title"),
            desc: t("landing.bc.challenges.c2.desc"),
            icon: <Users className="w-6 h-6 text-amber-400" />,
          },
          {
            id: "c3",
            number: "03",
            title: t("landing.bc.challenges.c3.title"),
            desc: t("landing.bc.challenges.c3.desc"),
            icon: <TrendingDown className="w-6 h-6 text-orange-400" />,
          },
          {
            id: "c4",
            number: "04",
            title: t("landing.bc.challenges.c4.title"),
            desc: t("landing.bc.challenges.c4.desc"),
            icon: <Contact2 className="w-6 h-6 text-purple-400" />,
          },
          {
            id: "c5",
            number: "05",
            title: t("landing.bc.challenges.c5.title"),
            desc: t("landing.bc.challenges.c5.desc"),
            icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
          },
        ],
      }}
      solutions={{
        tag: t("landing.bc.solutions.tag"),
        title: t("landing.bc.solutions.title"),
        modules: [
          {
            id: "m1",
            number: "01",
            title: t("landing.bc.solutions.m1.title"),
            desc: t("landing.bc.solutions.m1.desc"),
            icon: <Users2 className="w-6 h-6 text-amber-400" />,
          },
          {
            id: "m2",
            number: "02",
            title: t("landing.bc.solutions.m2.title"),
            desc: t("landing.bc.solutions.m2.desc"),
            icon: <Briefcase className="w-6 h-6 text-blue-400" />,
          },
          {
            id: "m3",
            number: "03",
            title: t("landing.bc.solutions.m3.title"),
            desc: t("landing.bc.solutions.m3.desc"),
            icon: <Layers className="w-6 h-6 text-emerald-400" />,
          },
          {
            id: "m4",
            number: "04",
            title: t("landing.bc.solutions.m4.title"),
            desc: t("landing.bc.solutions.m4.desc"),
            icon: <CalendarCheck className="w-6 h-6 text-purple-400" />,
          },
          {
            id: "m5",
            number: "05",
            title: t("landing.bc.solutions.m5.title"),
            desc: t("landing.bc.solutions.m5.desc"),
            icon: <MessagesSquare className="w-6 h-6 text-cyan-400" />,
          },
          {
            id: "m6",
            number: "06",
            title: t("landing.bc.solutions.m6.title"),
            desc: t("landing.bc.solutions.m6.desc"),
            icon: <BookOpen className="w-6 h-6 text-rose-400" />,
          },
          {
            id: "m7",
            number: "07",
            title: t("landing.bc.solutions.m7.title"),
            desc: t("landing.bc.solutions.m7.desc"),
            icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
          },
          {
            id: "m8",
            number: "08",
            title: t("landing.bc.solutions.m8.title"),
            desc: t("landing.bc.solutions.m8.desc"),
            icon: <Bot className="w-6 h-6 text-yellow-400" />,
          },
          {
            id: "m9",
            number: "09",
            title: t("landing.bc.solutions.m9.title"),
            desc: t("landing.bc.solutions.m9.desc"),
            icon: <PlugZap className="w-6 h-6 text-teal-400" />,
          },
        ],
      }}
      ecosystem={{
        tag: t("landing.bc.ecosystem.tag"),
        title: t("landing.bc.ecosystem.title"),
        subtitle: t("landing.bc.ecosystem.subtitle"),
        nodes: [
          {
            id: "node1",
            name: t("landing.bc.ecosystem.node1"),
            desc: "Quản lý tập trung toàn diện danh bạ, hội phí, ban ngành và tổ chức sự kiện số hoá.",
            count: "300+ Hiệp hội",
            icon: <Building2 className="w-5 h-5 text-amber-400" />,
          },
          {
            id: "node2",
            name: t("landing.bc.ecosystem.node2"),
            desc: "Định danh doanh nhân cao cấp, danh thiếp thông minh NFC và mở rộng quan hệ đối tác.",
            count: "10,000+ Lãnh đạo",
            icon: <Users className="w-5 h-5 text-blue-400" />,
          },
          {
            id: "node3",
            name: t("landing.bc.ecosystem.node3"),
            desc: "Quảng bá năng lực doanh nghiệp, đăng tin cung cầu và tiếp cận mạng lưới khách hàng B2B.",
            count: "15,000+ Doanh nghiệp",
            icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
          },
          {
            id: "node4",
            name: t("landing.bc.ecosystem.node4"),
            desc: "Cung cấp tri thức chuyên sâu, tư vấn tái cấu trúc, pháp lý và chiến lược chuyển đổi số.",
            count: "500+ Chuyên gia",
            icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
          },
          {
            id: "node5",
            name: t("landing.bc.ecosystem.node5"),
            desc: "Tìm kiếm dự án tiềm năng, thẩm định cơ hội đầu tư và rót vốn tăng trưởng nội khối.",
            count: "80+ Quỹ đầu tư",
            icon: <Coins className="w-5 h-5 text-yellow-400" />,
          },
          {
            id: "node6",
            name: t("landing.bc.ecosystem.node6"),
            desc: "Phổ biến chính sách hỗ trợ doanh nghiệp, xúc tiến thương mại và đối thoại công tư.",
            count: "40+ Cơ quan",
            icon: <Landmark className="w-5 h-5 text-rose-400" />,
          },
          {
            id: "node7",
            name: t("landing.bc.ecosystem.node7"),
            desc: "Kết nối giao thương song phương & đa phương với các phòng thương mại quốc tế.",
            count: "20+ Quốc gia",
            icon: <Globe2 className="w-5 h-5 text-cyan-400" />,
          },
          {
            id: "node8",
            name: t("landing.bc.ecosystem.node8"),
            desc: "Cộng hưởng hệ sinh thái ngân hàng, viễn thông, logistics và công nghệ hàng đầu.",
            count: "100+ Đối tác lớn",
            icon: <Handshake className="w-5 h-5 text-teal-400" />,
          },
        ],
      }}
      partners={{
        tag: t("landing.bc.partners.tag"),
        title: t("landing.bc.partners.title"),
      }}
      testimonials={{
        tag: t("landing.bc.testimonials.tag") || "CÂU CHUYỆN THÀNH CÔNG",
        title: t("landing.bc.testimonials.title") || "Kết nối đúng.\nTăng trưởng thật.",
        testimonials: [
          {
            id: "t1",
            quote: t("landing.bc.testimonials.t1.quote") || "Business Connect giúp chúng tôi kết nối tốt hơn với hội viên và mở ra nhiều cơ hội hợp tác mới trong khu vực.",
            author: t("landing.bc.testimonials.t1.author") || "Nguyễn Thị Lan",
            role: t("landing.bc.testimonials.t1.role") || "Chủ tịch Hiệp hội Du lịch Việt Nam",
            avatarText: "NL",
          },
          {
            id: "t2",
            quote: t("landing.bc.testimonials.t2.quote") || "Chúng tôi đã tìm được nhiều đối tác tiềm năng thông qua các sự kiện và gợi ý kết nối của AI.",
            author: t("landing.bc.testimonials.t2.author") || "Trần Minh Quân",
            role: t("landing.bc.testimonials.t2.role") || "CEO, Công ty Sản xuất Việt",
            avatarText: "MQ",
          },
          {
            id: "t3",
            quote: t("landing.bc.testimonials.t3.quote") || "Nền tảng rất dễ sử dụng và thực sự mang lại giá trị cho cộng đồng doanh nhân.",
            author: t("landing.bc.testimonials.t3.author") || "Lê Hoàng Anh",
            role: t("landing.bc.testimonials.t3.role") || "Doanh nhân, Hội viên VIP",
            avatarText: "HA",
          },
        ],
      }}
      ctaBanner={{
        title: t("landing.bc.cta.title") || "Sẵn sàng mở ra nhiều cơ hội hơn?",
        subtitle: t("landing.bc.cta.subtitle") || "Hãy để Business Connect đồng hành cùng hiệp hội hoặc doanh nghiệp của bạn.",
        btnDemoText: t("landing.bc.cta.btnDemo") || "Đặt demo ngay",
        btnDemoLink: "/auth",
        btnAppText: t("landing.bc.cta.btnApp") || "Liên hệ tư vấn",
        btnAppLink: "/contact",
      }}
    />
  );
}
