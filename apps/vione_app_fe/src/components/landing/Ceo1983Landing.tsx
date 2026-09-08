import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LangSwitcher } from "@/components/LangSwitcher";
import { submitClubApplication } from "@/lib/club-application.functions";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import {
  ArrowRight,
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
  Network,
  Cpu,
  BadgeCheck,
  FileCheck,
  Award,
  Flame,
} from "lucide-react";

type ThemeMode = "dark" | "light" | "contrast";

/** Comprehensive 8-Language Dictionary for CEO 1983 Landing */
const CEO1983_I18N = {
  vi: {
    navBadge: "HIỆP HỘI DOANH NGHIỆP",
    navVip: "VIP PASS",
    navAbout: "Giới Thiệu",
    navMatrix: "Ma Trận Chiến Lược",
    navEcosystem: "Hệ Sinh Thái",
    navCore: "Giá Trị Cốt Lõi",
    navActivities: "Hoạt Động & Tour",
    navLeadership: "Ban Lãnh Đạo",
    navRoadmap: "Lộ Trình Gia Nhập",
    navJoin: "GIA NHẬP CLB VIP →",
    modeDark: "🌙 Obsidian",
    modeLight: "☀️ Ivory",
    modeContrast: "🌓 Onyx",
    heroHanoiba: "👑 TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)",
    heroTitle1: "KẾT NỐI ĐỒNG NIÊN",
    heroTitle2: "THIẾT LẬP ĐẾ CHẾ",
    heroTitle3: "GIAO THƯƠNG B2B",
    heroDesc: "Cộng đồng tinh hoa quy tụ hơn 200 Chủ tịch, Nhà sáng lập & CEO sinh năm 1983 (Quý Hợi) – liên minh bản lĩnh, giàu kinh nghiệm, nắm giữ chuỗi cung ứng thực chất và cùng nhau bứt phá ở đỉnh cao sự nghiệp.",
    heroJoinBtn: "ĐĂNG KÝ GIA NHẬP CLB VIP →",
    heroOpenApp: "Mở Cổng Hội Viên App",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "DOANH NHÂN QUÝ HỢI",
    cardMemberAlt: "LÊ HOÀNG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "CHẠM ĐỂ XEM MẶT SAU ↺",
    cardPedestalDesc: "Thẻ Hội Viên Kim Loại Định Danh Số 1-Chạm NFC & Apple Wallet Sync",
    stat1Num: "200+",
    stat1Title: "CEO Đồng Niên",
    stat1Desc: "Chủ tịch & Tổng Giám Đốc",
    stat2Num: ">5.000 Tỷ",
    stat2Title: "VND Giao Thương",
    stat2Desc: "Chuỗi cung ứng khép kín",
    stat3Num: "+35%",
    stat3Title: "Tăng Trưởng B2B",
    stat3Desc: "Ưu đãi đặc quyền nội bộ",
    stat4Num: "100%",
    stat4Title: "Thẩm Định Minh Bạch",
    stat4Desc: "Bảo chứng uy tín C-Level",
    matrixTag: "MA TRẬN CHUYỂN HÓA CHIẾN LƯỢC",
    matrixTitle1: "Thách Thức Người Thuyền Trưởng &",
    matrixTitle2: "Lời Giải Độc Bản Từ CEO 1983",
    matrixDesc: "Thương trường không thiếu hội nhóm bề nổi hay danh bạ danh thiếp giấy. Nhưng tìm được một vòng tròn đồng đẳng tin cậy tuyệt đối để giải quyết bài toán dòng tiền, chuỗi cung ứng và rủi ro lại là điều xa xỉ.",
    matrixColBefore: "THỰC TRẠNG THƯỜNG GẶP",
    matrixColAfter: "ĐẶC QUYỀN ĐỘC BẢN CEO 1983",
    mItem1B: "Sự cô đơn trên bàn cờ chiến lược, áp lực tái cấu trúc & rủi ro pháp lý không thể trải lòng cùng cấp dưới hay đối thủ.",
    mItem1A: "Vòng tròn kín Mastermind đàm đạo thực chiến cùng các Shark & Chủ tịch tập đoàn lớn, tháo gỡ điểm nghẽn quản trị.",
    mItem2B: "Bội thực hội nhóm bề nổi, gom hàng trăm danh thiếp giấy rồi bỏ quên, lãng phí thời gian vào những buổi xã giao vô bổ.",
    mItem2A: "Thẻ Titanium NFC 1-chạm & Trợ lý AI Matchmaking tự động đề xuất chính xác đối tác chiến lược trong vài giây.",
    mItem3B: "Rủi ro nợ xấu, thiếu tin cậy và chi phí thẩm định quá cao khi tìm kiếm đối tác cung ứng mới trên thị trường tự do.",
    mItem3A: "Chuỗi cung ứng khép kín >5.000 Tỷ VNĐ với cam kết ưu tiên sản phẩm nội bộ và cơ chế bảo chứng tín nhiệm tuyệt đối.",
    ecoTag: "HỆ SINH THÁI 4 TRỤ CỘT TOÀN DIỆN",
    ecoTitle1: "Liên Minh Đồng Niên 1983:",
    ecoTitle2: "Bento Giao Thương & Trí Tuệ Thực Chiến",
    ecoDesc: "Không dừng lại ở việc kết nối danh bạ, CLB CEO 1983 vận hành hệ sinh thái 4 trụ cột khép kín giúp doanh nghiệp gia tăng doanh số, tối ưu chuỗi cung ứng và nâng tầm vị thế thương hiệu cá nhân.",
    p1Tag: "TRỤ CỘT TRÍ TUỆ",
    p1Title: "Vòng Tròn Mastermind & Executive Business Tours",
    p1Desc: "Tham quan trực tiếp nhà máy công nghệ cao, giải mã mô hình kinh doanh và đối thoại kín cùng các Shark, Chủ tịch tập đoàn lớn (Shark Phú - Sunhouse, Flexfit, AMG...).",
    p1Item1: "Shark Phú • Sunhouse",
    p1Sub1: "Quản trị dòng tiền & tái cấu trúc",
    p1Item2: "Flexfit & AMG Tour",
    p1Sub2: "Khảo sát tự động hóa chuẩn Đức",
    p2Tag: "TRỤ CỘT GIAO THƯƠNG",
    p2Title: "Chuỗi Cung Ứng Khép Kín & B2B Deal Flow",
    p2Desc: "Cam kết ưu tiên sử dụng sản phẩm, dịch vụ của nhau trong mạng lưới đồng niên với chính sách chiết khấu đặc quyền. Hơn 200 doanh nghiệp luân chuyển hàng nghìn tỷ đồng mỗi năm.",
    p2Item1: ">5.000 Tỷ VNĐ",
    p2Sub1: "Doanh số giao thương nội bộ",
    p2Item2: "Zero Fraud Risk",
    p2Sub2: "Thẩm định tín nhiệm đồng niên",
    p3Tag: "TRỤ CỘT CÔNG NGHỆ ĐỊNH DANH",
    p3Title: "Thẻ VIP NFC Titanium & Apple / Google Wallet",
    p3Desc: "Xóa bỏ hoàn toàn danh thiếp giấy lỗi thời. Mỗi hội viên được cấp thẻ kim loại khắc tên Laser tích hợp chip NFC và chuẩn Apple/Google Wallet. 1 chạm vào điện thoại là mở trọn bộ Profile C-Level.",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "TRỤ CỘT KẾT NỐI THÔNG MINH",
    p4Title: "Trợ Lý AI Matchmaking & Deal Room Riêng Tư",
    p4Desc: "Hệ thống AI tự động phân tích nhu cầu gọi vốn, tìm nhà cung ứng, mở rộng thị trường để đề xuất chính xác các CEO phù hợp nhất. Kèm theo Deal Room bảo mật cao cho các phiên đàm phán chiến lược.",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "TÔN CHỈ HOẠT ĐỘNG",
    coreTitle: "4 Giá Trị Cốt Lõi Của CLB",
    core1Title: "Gắn kết bền vững",
    core1Desc: "Tạo dựng môi trường đồng niên chân thành, tin cậy tuyệt đối, nơi các doanh nhân Quý Hợi 1983 cùng chia sẻ và tương trợ không vụ lợi.",
    core2Title: "Học hỏi liên tục",
    core2Desc: "Cung cấp kiến thức quản trị thực chiến từ các Shark & chuyên gia đầu ngành, cập nhật chính sách thuế và xu hướng dòng tiền đầu tư vĩ mô.",
    core3Title: "Tư duy sáng tạo",
    core3Desc: "Khuyến khích tư duy đổi mới, ứng dụng Trí tuệ Nhân tạo (AI), chuyển đổi số toàn diện và định danh công nghệ vào vận hành doanh nghiệp.",
    core4Title: "Phát triển trường tồn",
    core4Desc: "Kiến tạo liên minh doanh nghiệp có quy mô và giá trị thực chất, thúc đẩy trách nhiệm xã hội (CSR) và cùng nhau vươn tầm quốc tế.",
    actTag: "HOẠT ĐỘNG THỰC CHIẾN ĐỘC QUYỀN",
    actTitle: "Hoạt Động & Sự Kiện Nổi Bật",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "Đàm Đạo Quản Trị Cùng Shark Phú",
    act1Desc: "Lắng nghe bài học thực chiến xương máu về dòng tiền, quản trị rủi ro và tái cấu trúc doanh nghiệp từ Chủ tịch Tập đoàn Sunhouse.",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Site Visit Tại Flexfit & AMG",
    act2Desc: "Khảo sát dây chuyền sản xuất công nghệ cao và tối ưu chuỗi cung ứng sản xuất.",
    act3Tag: "CHÍNH SÁCH & TÀI CHÍNH",
    act3Title: "Giải Mã Cuộc Chơi Thuế 2026-2028",
    act3Desc: "Cập nhật chính sách thuế mới và tối ưu cấu trúc tài chính cho doanh nghiệp hội viên.",
    roadmapTag: "QUY TRÌNH KẾT NẠP MINH BẠCH",
    roadmapTitle: "4 Bước Trở Thành Hội Viên VIP",
    roadmap1Title: "Nộp Hồ Sơ Trực Tuyến",
    roadmap1Desc: "Điền thông tin doanh nghiệp, chức vụ và lĩnh vực hoạt động để đăng ký thẩm định ban đầu.",
    roadmap2Title: "Thẩm Định & Phỏng Vấn",
    roadmap2Desc: "Ban Thư Ký CLB đối soát năng lực, uy tín thương trường và tư cách đồng niên 1983.",
    roadmap3Title: "Phê Duyệt & Cấp Thẻ NFC",
    roadmap3Desc: "Ban Thường Trực thông qua quyết định kết nạp và trao thẻ kim loại Titanium cá nhân hóa.",
    roadmap4Title: "Kích Hoạt Hệ Sinh Thái",
    roadmap4Desc: "Mở toàn quyền tham gia Mastermind, kết nối B2B Deal Flow và đồng hành sự kiện độc quyền.",
    leadTag: "BAN CHẤP HÀNH NHIỆM KỲ 2025 - 2028",
    leadTitle: "Đội Ngũ Lãnh Đạo Tiên Phong",
    ctaBoxTag: "ĐẶC QUYỀN HỘI VIÊN ĐỒNG NIÊN",
    ctaBoxTitle1: "Đừng Để Doanh Nghiệp Của Bạn",
    ctaBoxTitle2: "Đơn Độc Trong Biển Lớn",
    ctaBoxDesc: "Hãy trở thành một mắt xích trong chuỗi liên minh hơn 200 Chủ tịch & CEO sinh năm 1983 uy tín hàng đầu, sở hữu Thẻ VIP NFC định danh C-Level và mở ra những Deal hợp tác tiền tỷ.",
    ctaBoxBtn: "NỘP HỒ SƠ GIA NHẬP CLB VIP →",
    footerCopy: "CLB Doanh Nhân CEO 1983. Nền tảng hội viên số phát triển bởi ViOne.",
    modalTitle: "Đăng Ký Gia Nhập CLB CEO 1983",
    modalSubtitle: "Dành riêng cho Doanh nhân, Founder, C-Level sinh năm 1983 (Quý Hợi)",
    formName: "Họ và tên *",
    formNamePlh: "Ví dụ: Nguyễn Văn A",
    formPhone: "Số điện thoại / Zalo *",
    formPhonePlh: "0912 345 678",
    formCompany: "Tên doanh nghiệp & Chức vụ *",
    formCompanyPlh: "Ví dụ: Chủ tịch HĐQT - Tập đoàn ABC",
    formRevenue: "Doanh thu năm gần nhất",
    formRev1: "Dưới 10 tỷ VNĐ",
    formRev2: "10 - 50 tỷ VNĐ",
    formRev3: "50 - 200 tỷ VNĐ",
    formRev4: "Trên 200 tỷ VNĐ",
    formIndustry: "Lĩnh vực kinh doanh chính *",
    formIndustryPlh: "Ví dụ: Công nghệ, Bất động sản, Sản xuất...",
    formSubmit: "GỬI HỒ SƠ XÉT DUYỆT NGAY →",
    formSubmitting: "Đang gửi hồ sơ xét duyệt...",
    formSuccessTitle: "Nộp Hồ Sơ Thành Công!",
    formSuccessDesc: "Ban Thư Ký CLB CEO 1983 sẽ liên hệ thẩm định và phản hồi trong vòng 24 giờ làm việc.",
  },
  en: {
    navBadge: "ENTERPRISE ALLIANCE",
    navVip: "VIP PASS",
    navAbout: "About Us",
    navMatrix: "Strategic Matrix",
    navEcosystem: "Ecosystem",
    navCore: "Core Values",
    navActivities: "Activities & Tours",
    navLeadership: "Executive Board",
    navRoadmap: "Admission Process",
    navJoin: "JOIN VIP ALLIANCE →",
    modeDark: "🌙 Obsidian",
    modeLight: "☀️ Ivory",
    modeContrast: "🌓 Onyx",
    heroHanoiba: "👑 AFFILIATED WITH HANOI YOUNG BUSINESS ASSOCIATION (HANOIBA)",
    heroTitle1: "PEER ALLIANCE",
    heroTitle2: "ESTABLISHING B2B",
    heroTitle3: "TRADE EMPIRES",
    heroDesc: "A premier executive alliance uniting 200+ Chairs, Founders & C-Level Leaders born in 1983 (Year of the Water Boar) — seasoned visionary entrepreneurs at the prime peak of their strategic careers.",
    heroJoinBtn: "APPLY FOR VIP MEMBERSHIP →",
    heroOpenApp: "Open Member App Portal",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "1983 EXECUTIVE LEADER",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "TAP TO FLIP ↺",
    cardPedestalDesc: "1-Tap NFC Titanium Identity Pass & Apple Wallet Integration",
    stat1Num: "200+",
    stat1Title: "Peer CEOs",
    stat1Desc: "Presidents & Managing Directors",
    stat2Num: ">$200M+",
    stat2Title: "Internal Trade",
    stat2Desc: "Closed-loop supply chain",
    stat3Num: "+35%",
    stat3Title: "B2B Growth",
    stat3Desc: "Internal Alliance Advantage",
    stat4Num: "100%",
    stat4Title: "Verified Enterprises",
    stat4Desc: "Rigorous Peer Vetting",
    matrixTag: "STRATEGIC TRANSFORMATION MATRIX",
    matrixTitle1: "The Captain's Dilemma &",
    matrixTitle2: "The Exclusive CEO 1983 Solution",
    matrixDesc: "The commercial arena has no shortage of superficial networking groups or paper business cards. But finding an authentic, trusted inner circle of peers to solve critical governance challenges is a rare luxury.",
    matrixColBefore: "COMMON CHALLENGES",
    matrixColAfter: "CEO 1983 EXCLUSIVE ADVANTAGE",
    mItem1B: "Solitude at the boardroom table with heavy restructuring & legal pressures that cannot be shared with subordinates or competitors.",
    mItem1A: "Private Mastermind circles with industry titans and Shark mentors to unlock critical strategic governance bottlenecks.",
    mItem2B: "Superficial networking fatigue, stacks of forgotten paper business cards, and wasted executive hours on unproductive pleasantries.",
    mItem2A: "1-Touch Titanium NFC Pass & AI Matchmaking Engine that instantly pairs verified C-Level partners in seconds.",
    mItem3B: "High partner search costs, severe fraud risks, and supply chain fragility in open, unverified external markets.",
    mItem3A: "Closed-loop $200M+ supply network with internal procurement commitments and verified peer trust backing.",
    ecoTag: "4-PILLAR COMPREHENSIVE ECOSYSTEM",
    ecoTitle1: "1983 Executive Alliance:",
    ecoTitle2: "Strategic Trade & Mastermind Bento Grid",
    ecoDesc: "Far beyond a contact directory, CEO 1983 Club creates a 4-pillar closed-loop ecosystem empowering member enterprises to accelerate revenue, streamline supply chains, and elevate leadership prominence.",
    p1Tag: "INTELLECTUAL PILLAR",
    p1Title: "Mastermind Circles & Executive Business Tours",
    p1Desc: "Direct factory walkthroughs, business model deconstruction, and private closed-door sessions with prominent business moguls (Shark Phu - Sunhouse, Flexfit, AMG...).",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "Governance & Cash Flow Mastermind",
    p1Item2: "Flexfit & AMG Tour",
    p1Sub2: "German-Standard Supply Chain Visit",
    p2Tag: "TRADE PILLAR",
    p2Title: "Closed-Loop Supply Chain & B2B Deal Flow",
    p2Desc: "Commitment to prioritize peer products and services with exclusive alliance discounts. Over 200 enterprises transacting millions in internal trade annually.",
    p2Item1: "$200M+ USD",
    p2Sub1: "Internal B2B Trade Volume",
    p2Item2: "Zero Fraud Risk",
    p2Sub2: "Rigorous Peer Trust Vetting",
    p3Tag: "IDENTITY TECH PILLAR",
    p3Title: "Titanium NFC VIP Pass & Apple / Google Wallet",
    p3Desc: "Completely eliminate outdated paper cards. Every executive receives a custom laser-engraved titanium card with integrated NFC and Apple/Google Wallet sync.",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "SMART MATCHING PILLAR",
    p4Title: "AI Matchmaking Assistant & Private Deal Rooms",
    p4Desc: "AI engine analyzes fundraising, supplier sourcing, and joint-venture requests to recommend verified peer CEOs within seconds, backed by high-security encrypted Deal Rooms.",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "GUIDING PRINCIPLES",
    coreTitle: "4 Core Values of the Club",
    core1Title: "Enduring Bonding",
    core1Desc: "Fostering an authentic, trustworthy peer environment where 1983 entrepreneurs share insights and support one another wholeheartedly.",
    core2Title: "Continuous Learning",
    core2Desc: "Delivering practical governance insights from top industry leaders, macro tax updates, and investment trend forecasts.",
    core3Title: "Creative Innovation",
    core3Desc: "Encouraging transformative mindsets, Artificial Intelligence (AI) integration, and digital technology identity into enterprise management.",
    core4Title: "Sustainable Growth",
    core4Desc: "Building high-value enterprise alliances, championing Corporate Social Responsibility (CSR), and expanding together onto the global stage.",
    actTag: "EXCLUSIVE EXECUTIVE EVENTS",
    actTitle: "Signature Activities & Tours",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "Executive Mastermind with Shark Phu",
    act1Desc: "Battlefield governance lessons on cash flow resilience and corporate restructuring from Sunhouse Group Chairman.",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Site Visit at Flexfit & AMG",
    act2Desc: "Inspecting high-tech automated manufacturing lines and supply chain optimization.",
    act3Tag: "FINANCE & POLICY",
    act3Title: "Navigating Tax & Finance 2026-2028",
    act3Desc: "Updates on cutting-edge tax policies and optimal capital structuring for member enterprises.",
    roadmapTag: "TRANSPARENT ADMISSION ROADMAP",
    roadmapTitle: "4 Steps to Secure VIP Membership",
    roadmap1Title: "Online Credentials Submission",
    roadmap1Desc: "Submit your executive title, company profile, and primary industry for preliminary vetting.",
    roadmap2Title: "Peer Due Diligence",
    roadmap2Desc: "The Secretariat assesses business reputation, verified revenue, and 1983 peer eligibility.",
    roadmap3Title: "Executive Approval & NFC Pass",
    roadmap3Desc: "Board formalizes admission and presents your personalized Titanium NFC Smart Pass.",
    roadmap4Title: "Ecosystem Activation",
    roadmap4Desc: "Gain immediate access to Masterminds, B2B deal-flow channels, and closed-door conferences.",
    leadTag: "EXECUTIVE BOARD TERM 2025 - 2028",
    leadTitle: "Pioneering Leadership Team",
    ctaBoxTag: "PEER EXECUTIVE PRIVILEGE",
    ctaBoxTitle1: "Never Let Your Enterprise Navigate",
    ctaBoxTitle2: "The Open Ocean Alone",
    ctaBoxDesc: "Join an elite alliance of over 200 reputable Chairs and CEOs born in 1983. Own your Titanium NFC Pass and unlock multimillion-dollar strategic partnerships.",
    ctaBoxBtn: "SUBMIT VIP APPLICATION →",
    footerCopy: "CEO 1983 Business Club. Digital membership ecosystem developed by ViOne.",
    modalTitle: "Apply to Join CEO 1983 Club",
    modalSubtitle: "Exclusively for Founders, Chairs, and C-Level Executives born in 1983",
    formName: "Full Name *",
    formNamePlh: "e.g. John Smith",
    formPhone: "Phone / WhatsApp / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "Enterprise Name & Executive Title *",
    formCompanyPlh: "e.g. Chairman & CEO - ABC Group",
    formRevenue: "Annual Revenue",
    formRev1: "Under $500K USD",
    formRev2: "$500K - $2M USD",
    formRev3: "$2M - $10M USD",
    formRev4: "Above $10M USD",
    formIndustry: "Primary Industry *",
    formIndustryPlh: "e.g. Tech, Manufacturing, Real Estate...",
    formSubmit: "SUBMIT APPLICATION NOW →",
    formSubmitting: "Submitting application...",
    formSuccessTitle: "Application Submitted Successfully!",
    formSuccessDesc: "The CEO 1983 Secretariat will review your credentials and contact you within 24 business hours.",
  },
  ja: {
    navBadge: "企業経営者協会",
    navVip: "VIP PASS",
    navAbout: "概要",
    navMatrix: "戦略マトリクス",
    navEcosystem: "エコシステム",
    navCore: "理念・価値観",
    navActivities: "活動・ツアー",
    navLeadership: "理事会",
    navRoadmap: "入会プロセス",
    navJoin: "VIP入会申請 →",
    modeDark: "🌙 オブシディアン",
    modeLight: "☀️ アイボリー",
    modeContrast: "🌓 オニキス",
    heroHanoiba: "👑 ハノイ青年実業家協会（HANOIBA）直属",
    heroTitle1: "同年代リーダーの結束",
    heroTitle2: "B2B商談帝国の",
    heroTitle3: "共創と確立",
    heroDesc: "1983年（癸亥）生まれの経営者・創業者・最高幹部200名以上が集う最高峰のアライアンス。キャリアの黄金期を迎えたリーダーたちの戦略的共創コミュニティ。",
    heroJoinBtn: "VIPクラブ入会を申請する →",
    heroOpenApp: "会員アプリを開く",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "1983年生まれ 経営者",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "タップして裏返す ↺",
    cardPedestalDesc: "1タップNFCチタン製デジタル会員証＆Apple Wallet連携",
    stat1Num: "200+",
    stat1Title: "同年代CEO",
    stat1Desc: "会長・代表取締役",
    stat2Num: ">300億円",
    stat2Title: "内部取引総額",
    stat2Desc: "閉域サプライチェーン",
    stat3Num: "+35%",
    stat3Title: "B2B成長率",
    stat3Desc: "会員間優先取引の成果",
    stat4Num: "100%",
    stat4Title: "実体企業審査",
    stat4Desc: "厳格な資格審査",
    matrixTag: "戦略的変革マトリクス",
    matrixTitle1: "経営トップの葛藤と",
    matrixTitle2: "CEO 1983の独占的ソリューション",
    matrixDesc: "表面的な交流会や名刺交換会は溢れていますが、重大な経営判断を率直に共有できる「絶対的信頼の仲間」と出会うことは極めて困難です。",
    matrixColBefore: "一般的な経営課題",
    matrixColAfter: "CEO 1983の独占的強み",
    mItem1B: "取締役会における深い孤独感。事業再構築や法的リスクを部下や外部の競合に打ち明けられない。",
    mItem1A: "業界の重鎮やSharkメンターとの非公開マスターマインドで、経営のボトルネックを即座に解決。",
    mItem2B: "形骸化した名刺交換会での時間浪費。引き出しに眠る数百枚の名刺から実質的案件が生まれない。",
    mItem2A: "1タップチタン製NFCカードとAIマッチングエンジンが、数秒で最適な提携先CEOを特定・連携。",
    mItem3B: "外部市場でのパートナー開拓に伴う高い探索コスト、焦げ付きリスク、サプライチェーンの脆弱性。",
    mItem3A: "年間300億円超の閉域サプライチェーンと会員間優先調達コミットメントによる安心の取引。",
    ecoTag: "4大支柱エコシステム",
    ecoTitle1: "1983年経営者連盟:",
    ecoTitle2: "取引促進＆マスターマインド Bento Grid",
    ecoDesc: "単なる名簿管理にとどまらず、会員企業の売上拡大、サプライチェーン最適化、リーダーシップ強化を実現する4本柱のエコシステムです。",
    p1Tag: "知性の柱",
    p1Title: "マスターマインド＆企業視察ツアー",
    p1Desc: "先進工場ラインの視察、ビジネスモデルの徹底解剖、著名企業トップとの対談。危機管理とキャッシュフローに関する実践的な知見を深めます。",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "経営とキャッシュフロー対談",
    p1Item2: "Flexfit & AMG ツアー",
    p1Sub2: "ドイツ規格の生産ライン視察",
    p2Tag: "商談の柱",
    p2Title: "閉域サプライチェーン＆B2B案件創出",
    p2Desc: "同世代ネットワーク内での優先調達と特別優遇条件。200社以上の会員企業が相互に信頼できるサプライチェーンを形成。",
    p2Item1: "300億円以上",
    p2Sub1: "内部取引総額",
    p2Item2: "不正リスクゼロ",
    p2Sub2: "厳格な相互審査",
    p3Tag: "認証技術の柱",
    p3Title: "チタン製NFC VIPカード＆Apple Wallet",
    p3Desc: "紙の名刺を完全撤廃。レーザー刻印のチタンカードにNFCチップを内蔵。スマホに1タップするだけで役員プロフィールを瞬時に共有。",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "AIマッチングの柱",
    p4Title: "AIマッチングアシスタント＆機密商談ルーム",
    p4Desc: "AIが調達・販売・提携ニーズを自動分析し、最適なCEOパートナーを瞬時に提案。高度な暗号化Deal Roomで安全に商談。",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "活動理念",
    coreTitle: "クラブの4つのコアバリュー",
    core1Title: "持続的な絆",
    core1Desc: "1983年生まれの仲間が誠実かつ無私で支え合える絶対的な信頼環境を育みます。",
    core2Title: "継続的な学び",
    core2Desc: "第一線の経営者や専門家から実践的な経営知見、最新の税制・投資動向を学びます。",
    core3Title: "創造的革新",
    core3Desc: "AI活用、包括的なDX推進、最新の技術アイデンティティを企業経営に取り入れます。",
    core4Title: "持続的発展",
    core4Desc: "実質的な価値を生む企業アライアンスを築き、CSRを推進しながら共に世界へ羽ばたきます。",
    actTag: "限定エグゼクティブ活動",
    actTitle: "注目の活動とイベント",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "Shark Phu氏との経営対談",
    act1Desc: "Sunhouseグループ会長から学ぶ、キャッシュフロー管理と企業再生の実践論。",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Flexfit & AMG 現場視察",
    act2Desc: "ハイテク自動化製造ラインの視察とサプライチェーンの最適化検証。",
    act3Tag: "財務と政策",
    act3Title: "2026-2028年 税務・財務戦略フォーラム",
    act3Desc: "最新の税制改正に対応した会員企業の最適な資本構造構築。",
    roadmapTag: "透明な入会ロードマップ",
    roadmapTitle: "VIP会員資格取得の4ステップ",
    roadmap1Title: "オンライン申請",
    roadmap1Desc: "役職、企業概要、主要事業分野を入力して一次審査を申請します。",
    roadmap2Title: "厳格な資格審査",
    roadmap2Desc: "事務局が企業信用、業績、1983年生まれの同世代資格を確認します。",
    roadmap3Title: "理事会承認＆NFCカード発行",
    roadmap3Desc: "入会が正式決定され、パーソナライズされたチタン製NFCカードが授与されます。",
    roadmap4Title: "エコシステム始動",
    roadmap4Desc: "マスターマインド、B2B案件創出、非公開フォーラムへの全アクセスが有効化されます。",
    leadTag: "2025〜2028年 理事会陣",
    leadTitle: "先駆的なリーダーシップ陣",
    ctaBoxTag: "同世代経営者の特権",
    ctaBoxTitle1: "貴方の企業を広大な大海原で",
    ctaBoxTitle2: "決して孤立させない",
    ctaBoxDesc: "1983年生まれの有力CEO 200名以上の強固な連盟に加わり、チタン製NFCカードを手に、巨額の戦略的提携を実現してください。",
    ctaBoxBtn: "VIP入会審査に申し込む →",
    footerCopy: "CLB CEO 1983. ViOneが開発するデジタル会員プラットフォーム。",
    modalTitle: "CLB CEO 1983 入会申請",
    modalSubtitle: "1983年生まれの創業者・役員・経営者限定",
    formName: "氏名 *",
    formNamePlh: "例: 山田 太郎",
    formPhone: "電話番号 / WhatsApp / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "会社名および役職 *",
    formCompanyPlh: "例: 代表取締役会長 - ABCグループ",
    formRevenue: "直近年間売上高",
    formRev1: "5,000万円未満",
    formRev2: "5,000万〜2億円",
    formRev3: "2億〜10億円",
    formRev4: "10億円以上",
    formIndustry: "主な事業分野 *",
    formIndustryPlh: "例: IT、製造、不動産、流通...",
    formSubmit: "申請を送信する →",
    formSubmitting: "送信中...",
    formSuccessTitle: "申請が完了しました！",
    formSuccessDesc: "CEO 1983 事務局が内容を確認し、24営業時間以内にご連絡いたします。",
  },
  ko: {
    navBadge: "기업인 최고위 연맹",
    navVip: "VIP PASS",
    navAbout: "클럽 소개",
    navMatrix: "전략 매트릭스",
    navEcosystem: "생태계",
    navCore: "핵심 가치",
    navActivities: "활동 및 투어",
    navLeadership: "임원진",
    navRoadmap: "가입 로드맵",
    navJoin: "VIP 클럽 가입 →",
    modeDark: "🌙 옵시디언",
    modeLight: "☀️ 아이보리",
    modeContrast: "🌓 오닉스",
    heroHanoiba: "👑 하노이 청년기업가협회(HANOIBA) 산하",
    heroTitle1: "동갑내기 리더의 연대",
    heroTitle2: "B2B 교역 제국의",
    heroTitle3: "구축과 도약",
    heroDesc: "1983년생(계해년) 창업자, 대표이사, 최고경영진 200명 이상이 결집한 최고위 비즈니스 연맹. 커리어의 최정점에서 함께 도약하는 리더들의 강력한 생태계.",
    heroJoinBtn: "VIP 클럽 가입 신청하기 →",
    heroOpenApp: "회원 전용 앱 열기",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "1983년생 최고경영자",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "탭하여 뒤집기 ↺",
    cardPedestalDesc: "원터치 NFC 티타늄 디지털 신분증 & Apple Wallet 연동",
    stat1Num: "200+",
    stat1Title: "동갑내기 CEO",
    stat1Desc: "회장 및 대표이사",
    stat2Num: ">3,000억원",
    stat2Title: "내부 거래 규모",
    stat2Desc: "폐쇄형 공급망 생태계",
    stat3Num: "+35%",
    stat3Title: "B2B 성장률",
    stat3Desc: "회원 간 우선 제휴 성과",
    stat4Num: "100%",
    stat4Title: "실체 기업 검증",
    stat4Desc: "엄격한 회원 자격 심사",
    matrixTag: "전략적 혁신 매트릭스",
    matrixTitle1: "최고경영자의 깊은 고뇌 &",
    matrixTitle2: "CEO 1983만의 독보적 해결책",
    matrixDesc: "피상적인 모임이나 명함 교환회가 아닌, 기업의 생사를 가르는 중대한 결정을 솔직하게 나누고 협력할 신뢰할 수 있는 동급의 리더 집단이 필요합니다.",
    matrixColBefore: "기존의 경영 현실",
    matrixColAfter: "CEO 1983 독점 특권",
    mItem1B: "전략적 결정 앞에서의 깊은 고독. 구조조정이나 법률적 압박을 부하나 경쟁사에 털어놓을 수 없음.",
    mItem1A: "재계 거물 및 Shark 멘토와의 비공개 마스터마인드를 통해 핵심 경영 난제를 즉시 돌파.",
    mItem2B: "형식적 모임 참석으로 인한 피로감. 서랍 속에 쌓여 잊혀지는 명함과 성과 없는 시간 낭비.",
    mItem2A: "1초 태그 티타늄 NFC 카드와 AI 매칭 엔진으로 검증된 파트너 CEO를 수초 내 발굴 및 제휴.",
    mItem3B: "외부 파트너 발굴 시 발생하는 막대한 탐색 비용, 부실채권 위험, 공급망 불안정성.",
    mItem3A: "3,000억원 규모의 폐쇄형 공급망과 회원사 우선 구매 확약을 통한 확실하고 안전한 거래.",
    ecoTag: "4대 핵심 축 생태계",
    ecoTitle1: "1983 리더스 연맹:",
    ecoTitle2: "전략적 거래 및 마스터마인드 Bento Grid",
    ecoDesc: "단순한 연락처 공유를 넘어, 회원사의 매출 증대, 공급망 최적화, 리더십 강화를 이끄는 4대 핵심 축의 폐쇄형 생태계입니다.",
    p1Tag: "지성의 축",
    p1Title: "마스터마인드 서클 & 기업 탐방 투어",
    p1Desc: "선도 기업 생산 라인 현장 시찰, 비즈니스 모델 정밀 분석, 유명 그룹 회장단과의 비공개 심층 대담. 리스크 관리와 현금 흐름의 실전 노하우 습득.",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "경영 및 현금 흐름 대담",
    p1Item2: "Flexfit & AMG 투어",
    p1Sub2: "독일 표준 생산라인 시찰",
    p2Tag: "거래의 축",
    p2Title: "폐쇄형 공급망 & B2B 딜 플로우",
    p2Desc: "동갑내기 네트워크 내 제품·서비스 우선 구매 및 특별 우대 할인. 200개 이상의 회원사가 신뢰할 수 있는 공급망을 이룹니다.",
    p2Item1: "3,000억원 이상",
    p2Sub1: "내부 거래 총액",
    p2Item2: "사기 위험 ZERO",
    p2Sub2: "철저한 상호 신뢰 검증",
    p3Tag: "신원 기술의 축",
    p3Title: "티타늄 NFC VIP 카드 & Apple/Google Wallet",
    p3Desc: "구시대적 종이 명함을 완전히 대체합니다. 레이저 각인 티타늄 카드에 NFC 칩을 탑재해 스마트폰에 1초만 태그하면 임원 프로필이 즉시 연결됩니다.",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "스마트 매칭의 축",
    p4Title: "AI 매칭 비서 & 프라이빗 딜 룸",
    p4Desc: "AI 시스템이 투자 유치, 공급업체 발굴, 제휴 수요를 분석해 최적의 동료 CEO를 즉각 추천하며 고보안 딜 룸을 지원합니다.",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "행동 강령",
    coreTitle: "클럽 4대 핵심 가치",
    core1Title: "지속 가능한 연대",
    core1Desc: "1983년생 리더들이 사심 없이 서로를 지지하고 나눌 수 있는 절대적 신뢰의 터전을 만듭니다.",
    core2Title: "끊임없는 학습",
    core2Desc: "최고 수준의 경영진과 전문가로부터 실전 경영 지식, 최신 세무 및 투자 거시 흐름을 배웁니다.",
    core3Title: "창의적 혁신",
    core3Desc: "AI 활용, 전사적 디지털 전환, 첨단 기술 신원 인증을 기업 운영에 적극 도입합니다.",
    core4Title: "동반 성장",
    core4Desc: "실질적 가치를 창출하는 기업 연맹을 구축하고 사회적 책임(CSR)을 다하며 함께 세계로 나아갑니다.",
    actTag: "독점 최고위 활동",
    actTitle: "주요 활동 및 시그니처 이벤트",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "Shark Phu 회장과의 경영 대담",
    act1Desc: "Sunhouse 그룹 회장에게 직접 듣는 위기 관리, 자금 흐름, 기업 구조조정의 실전 교훈.",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Flexfit & AMG 현장 시찰",
    act2Desc: "첨단 자동화 생산 라인 견학 및 제조업 공급망 최적화 방안 공유.",
    act3Tag: "재무 및 정책",
    act3Title: "2026-2028 세무·재무 전략 포럼",
    act3Desc: "최신 세법 개정 대응 및 회원사를 위한 최적의 자본 구조 설계.",
    roadmapTag: "투명한 가입 로드맵",
    roadmapTitle: "VIP 회원 자격 획득 4단계",
    roadmap1Title: "온라인 신청서 제출",
    roadmap1Desc: "직책, 회사 개요, 주요 사업 분야를 기재하여 1차 심사를 접수합니다.",
    roadmap2Title: "자격 및 기업 심사",
    roadmap2Desc: "사무국에서 기업 신용, 실적, 1983년생 동격 리더 자격을 정밀 검증합니다.",
    roadmap3Title: "이사회 승인 및 NFC 카드 발급",
    roadmap3Desc: "최종 가입 승인과 함께 레이저 각인 티타늄 스마트 카드가 수여됩니다.",
    roadmap4Title: "생태계 권한 활성화",
    roadmap4Desc: "마스터마인드, B2B 교역망, 비공개 전략 회의 참석 권한이 전면 부여됩니다.",
    leadTag: "2025 - 2028 임원진",
    leadTitle: "선도적 리더십 팀",
    ctaBoxTag: "동갑내기 리더만의 특권",
    ctaBoxTitle1: "당신의 기업이 거친 비즈니스 바다에서",
    ctaBoxTitle2: "홀로 표류하지 않도록",
    ctaBoxDesc: "1983년생 검증된 대표 200명 이상의 강력한 연합에 합류하여 티타늄 NFC VIP 카드를 획득하고 수백억 규모의 전략적 기회를 선점하십시오.",
    ctaBoxBtn: "VIP 가입 심사 신청하기 →",
    footerCopy: "CEO 1983 비즈니스 클럽. ViOne이 개발한 디지털 회원제 플랫폼.",
    modalTitle: "CEO 1983 클럽 가입 신청",
    modalSubtitle: "1983년생 창업자, 대표이사, C-Level 경영자 전용",
    formName: "성명 *",
    formNamePlh: "예: 홍길동",
    formPhone: "연락처 / WhatsApp / Zalo *",
    formPhonePlh: "010-1234-5678",
    formCompany: "회사명 및 직책 *",
    formCompanyPlh: "예: 대표이사 회장 - ABC 그룹",
    formRevenue: "최근 연매출",
    formRev1: "5억원 미만",
    formRev2: "5억 ~ 25억원",
    formRev3: "25억 ~ 100억원",
    formRev4: "100억원 이상",
    formIndustry: "주요 사업 분야 *",
    formIndustryPlh: "예: IT/기술, 제조업, 부동산, 유통...",
    formSubmit: "심사 신청서 제출 →",
    formSubmitting: "신청서 제출 중...",
    formSuccessTitle: "신청서가 성공적으로 접수되었습니다!",
    formSuccessDesc: "CEO 1983 사무국에서 확인 후 영업일 기준 24시간 이내에 안내해 드리겠습니다.",
  },
  zh: {
    navBadge: "顶级企业家商会",
    navVip: "VIP PASS",
    navAbout: "关于我们",
    navMatrix: "战略矩阵",
    navEcosystem: "赋能生态",
    navCore: "核心价值",
    navActivities: "活动与考察",
    navLeadership: "理事会",
    navRoadmap: "入会路径",
    navJoin: "申请VIP入会 →",
    modeDark: "🌙 黑曜石",
    modeLight: "☀️ 象牙白",
    modeContrast: "🌓 缟玛瑙",
    heroHanoiba: "👑 隶属于河内青年企业家协会（HANOIBA）",
    heroTitle1: "同龄领袖汇聚",
    heroTitle2: "筑造B2B经贸",
    heroTitle3: "商业帝国",
    heroDesc: "汇聚200余位1983年（癸亥年）出生的杰出董事长、创始人与CEO。他们经验丰富、锐意革新，正处于事业最具突破力的黄金巅峰期。",
    heroJoinBtn: "申请加入VIP俱乐部 →",
    heroOpenApp: "打开会员专属应用",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "1983年出生 领军企业家",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "点击翻转 ↺",
    cardPedestalDesc: "一触即连 NFC 钛金数字身份卡 & Apple Wallet 智能同步",
    stat1Num: "200+",
    stat1Title: "同龄CEO领袖",
    stat1Desc: "董事长与总经理",
    stat2Num: ">15亿元",
    stat2Title: "内部经贸交易额",
    stat2Desc: "闭环供应链联盟",
    stat3Num: "+35%",
    stat3Title: "B2B增长率",
    stat3Desc: "内部优先采购红利",
    stat4Num: "100%",
    stat4Title: "资质合规核验",
    stat4Desc: "严格同行背书",
    matrixTag: "战略破局演化矩阵",
    matrixTitle1: "领军者的现实困局与",
    matrixTitle2: "CEO 1983 的独占解法",
    matrixDesc: "商场不缺泛泛之交的酒局与纸质名片，但能够坦诚推演生死决策、共享供应链与现金流智慧的「绝对信任同侪圈」弥足珍贵。",
    matrixColBefore: "传统社交痛点",
    matrixColAfter: "CEO 1983 专属特权",
    mItem1B: "董事会前深沉的战略孤独。宏观压力、重组与法律风险无法向部属或外部竞品透露。",
    mItem1A: "与知名投资大咖及集团董事长闭门推演，直击企业治理与现金流核心瓶颈。",
    mItem2B: "泛泛社交的巨大消耗。抽屉中堆满遗忘的纸质名片，无法沉淀真正的供应链合作。",
    mItem2A: "一触即达的钛金NFC卡与AI精准匹配引擎，秒级推荐高信誉同龄战略伙伴。",
    mItem3B: "外部拓客存在极高的坏账风险、寻源成本与交付不确定性。",
    mItem3A: "超15亿元闭环内部供应链，优先采购承诺与同侪诚信背书机制保驾护航。",
    ecoTag: "四大支柱全景生态",
    ecoTitle1: "1983领袖联盟:",
    ecoTitle2: "经贸实战与智库 Bento Grid",
    ecoDesc: "不仅是通讯录，更是驱动企业业绩倍增、供应链优化与领袖品牌塑造的4大支柱闭环生态系统。",
    p1Tag: "智库之柱",
    p1Title: "闭门智库 & 标杆企业考察游学",
    p1Desc: "深入高新制造基地现场，深度拆解商业模式，与头部企业掌门人面对面探讨宏观避险与资本布局。",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "现金流与重组实战",
    p1Item2: "Flexfit & AMG 考察",
    p1Sub2: "德国标准自动化工厂参访",
    p2Tag: "经贸之柱",
    p2Title: "闭环供应链与B2B精准商机",
    p2Desc: "同龄网络内优先采购与专属折扣承诺。200多家会员企业构成高信誉闭环供应链，年流转交易额达数亿元。",
    p2Item1: "超15亿元人民币",
    p2Sub1: "内部经贸交易总额",
    p2Item2: "零欺诈违约",
    p2Sub2: "严格同侪信用核验",
    p3Tag: "科技身份之柱",
    p3Title: "钛金NFC VIP身份卡 & Apple Wallet",
    p3Desc: "彻底告别纸质名片。专属激光定制钛金金属卡，内置NFC芯片，一触即可向合作伙伴展示完备的高管档案与业务版图。",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "智能匹配之柱",
    p4Title: "AI智能配对助手 & 绝密商洽室",
    p4Desc: "AI算法解析投融资、供应链寻源及联营需求，精准推荐匹配CEO，并在加密商洽室中安全推进战略谈判。",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "立会宗旨",
    coreTitle: "俱乐部4大核心价值观",
    core1Title: "持久凝聚",
    core1Desc: "营造真诚纯粹、绝对信任的同龄环境，无私共享认知与资源，守望相助。",
    core2Title: "持续精进",
    core2Desc: "汇聚商界导师实战智慧，前瞻把握宏观财税新规与资本流动风向。",
    core3Title: "创新求变",
    core3Desc: "积极拥抱人工智能（AI）、全链路数字化与前沿科技身份体系赋能经营。",
    core4Title: "基业长青",
    core4Desc: "构建高含金量的商业联盟，践行社会责任（CSR），携手跨越周期、走向全球。",
    actTag: "高管专属实战活动",
    actTitle: "重磅活动与高端游学",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "与 Shark Phu 闭门问道",
    act1Desc: "Sunhouse集团董事长倾囊相授危机应对、现金流底线与重组实战心得。",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Flexfit & AMG 现场参访",
    act2Desc: "实地调研高精尖自动化产线与精益供应链管理模式。",
    act3Tag: "政策与财税",
    act3Title: "2026-2028 财税合规与顶层设计",
    act3Desc: "紧扣新政趋势，优化会员企业资本结构与财税合规路径。",
    roadmapTag: "严谨入会流程",
    roadmapTitle: "获颁VIP会员身份的4大步骤",
    roadmap1Title: "提交在线档案",
    roadmap1Desc: "填写高管职务、企业规模及主营行业，进入初审通道。",
    roadmap2Title: "同侪背书与资质核验",
    roadmap2Desc: "秘书处针对企业信用、实际业绩与1983同龄背景进行审查。",
    roadmap3Title: "常务理事会批准授卡",
    roadmap3Desc: "通过决议并定制颁发刻有专属ID的钛金NFC智能会员卡。",
    roadmap4Title: "激活生态特权",
    roadmap4Desc: "即刻开通闭门智库、B2B经贸池及高端闭门峰会全部特权。",
    leadTag: "2025 - 2028 理事会班子",
    leadTitle: "领航管理团队",
    ctaBoxTag: "同龄领袖专属特权",
    ctaBoxTitle1: "莫让您的企业在商海风浪中",
    ctaBoxTitle2: "孤独前行",
    ctaBoxDesc: "加入由200余位1983年实力CEO构筑的战略联盟，执掌专属钛金NFC卡，开启数亿元级经贸合作新篇章。",
    ctaBoxBtn: "立即提交VIP入会申请 →",
    footerCopy: "CEO 1983 商业俱乐部。数字化会员生态由 ViOne 赋能开发。",
    modalTitle: "申请加入 CEO 1983 俱乐部",
    modalSubtitle: "专为1983年出生（癸亥年）的创始人、董事长与C-Level领军人开放",
    formName: "姓名 *",
    formNamePlh: "例如：张三",
    formPhone: "电话 / 微信 / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "企业名称及担任职务 *",
    formCompanyPlh: "例如：董事长兼CEO - ABC集团",
    formRevenue: "近一年营收规模",
    formRev1: "300万元以下",
    formRev2: "300万 - 1500万元",
    formRev3: "1500万 - 6000万元",
    formRev4: "6000万元以上",
    formIndustry: "主营业务领域 *",
    formIndustryPlh: "例如：科技创新、智能制造、地产商业...",
    formSubmit: "提交入会申请档案 →",
    formSubmitting: "正在提交申请...",
    formSuccessTitle: "申请已成功提交！",
    formSuccessDesc: "CEO 1983 秘书处将在24个工作小时内核验并与您取得联系。",
  },
  km: {
    navBadge: "សមាគមសហគ្រាស",
    navVip: "VIP PASS",
    navAbout: "អំពីយើង",
    navMatrix: "ម៉ាទ្រីសយុទ្ធសាស្ត្រ",
    navEcosystem: "ប្រព័ន្ធអេកូឡូស៊ី",
    navCore: "គុណតម្លៃស្នូល",
    navActivities: "សកម្មភាព & ទស្សនកិច្ច",
    navLeadership: "គណៈប្រតិបត្តិ",
    navRoadmap: "ដំណាក់កាលចូលរួម",
    navJoin: "ចូលរួម CLB VIP →",
    modeDark: "🌙 Obsidian",
    modeLight: "☀️ Ivory",
    modeContrast: "🌓 Onyx",
    heroHanoiba: "👑 ចំណុះសមាគមសហគ្រិនវ័យក្មេងហាណូយ (HANOIBA)",
    heroTitle1: "ការតភ្ជាប់សហគ្រិនឆ្នាំ១៩៨៣",
    heroTitle2: "កសាងអាណាចក្រ",
    heroTitle3: "ពាណិជ្ជកម្ម B2B",
    heroDesc: "សហគមន៍ឥស្សរជនប្រមូលផ្តុំប្រធានក្រុមប្រឹក្សាភិបាល ស្ថាបនិក និង CEO ជាង ២០០ នាក់ដែលកើតក្នុងឆ្នាំ ១៩៨៣។",
    heroJoinBtn: "ដាក់ពាក្យចូលរួម CLB VIP →",
    heroOpenApp: "បើកកម្មវិធីសមាជិក",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "សហគ្រិនឆ្នាំ ១៩៨៣",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "ចុចដើម្បីត្រឡប់ ↺",
    cardPedestalDesc: "កាតសមាជិកលោហៈ NFC 1-Touch & Apple Wallet Sync",
    stat1Num: "200+",
    stat1Title: "CEO ជំនាន់១៩៨៣",
    stat1Desc: "ប្រធាន & អគ្គនាយក",
    stat2Num: ">$200M+",
    stat2Title: "ពាណិជ្ជកម្មផ្ទៃក្នុង",
    stat2Desc: "ខ្សែច្រវ៉ាក់ផ្គត់ផ្គង់បិទជិត",
    stat3Num: "+35%",
    stat3Title: "កំណើន B2B",
    stat3Desc: "ការផ្តល់អាទិភាពផ្ទៃក្នុង",
    stat4Num: "100%",
    stat4Title: "សហគ្រាសពិតប្រាកដ",
    stat4Desc: "ការត្រួតពិនិត្យយ៉ាងម៉ត់ចត់",
    matrixTag: "ម៉ាទ្រីសយុទ្ធសាស្ត្រ",
    matrixTitle1: "បញ្ហាប្រឈមនៃអ្នកដឹកនាំ &",
    matrixTitle2: "ដំណោះស្រាយផ្តាច់មុខពី CEO 1983",
    matrixDesc: "ស្វែងរកសម្ព័ន្ធភាពដៃគូដែលគួរឱ្យទុកចិត្តបំផុតដើម្បីដោះស្រាយបញ្ហាសាច់ប្រាក់ និងខ្សែច្រវ៉ាក់ផ្គត់ផ្គង់។",
    matrixColBefore: "បញ្ហាប្រឈមទូទៅ",
    matrixColAfter: "ឯកសិទ្ធិផ្តាច់មុខ CEO 1983",
    mItem1B: "ភាពឯកោក្នុងការសម្រេចចិត្តយុទ្ធសាស្ត្រ និងសម្ពាធរៀបចំរចនាសម្ព័ន្ធឡើងវិញ។",
    mItem1A: "រង្វង់ Mastermind ជាមួយថ្នាក់ដឹកនាំជាន់ខ្ពស់ និង Shark ដើម្បីដោះស្រាយបញ្ហា។",
    mItem2B: "ការខ្ជះខ្ជាយពេលវេលាក្នុងការជួបជុំសង្គមដែលគ្មានប្រសិទ្ធភាព និងនាមប័ណ្ណក្រដាសដែលត្រូវគេបំភ្លេច។",
    mItem2A: "កាត Titanium NFC 1-touch និងប្រព័ន្ធ AI ស្វែងរកដៃគូត្រឹមត្រូវក្នុងរយៈពេលប៉ុន្មានវិនាទី។",
    mItem3B: "ហានិភ័យបំណុលមិនល្អ និងការចំណាយខ្ពស់ក្នុងការស្វែងរកដៃគូផ្គត់ផ្គង់ថ្មី។",
    mItem3A: "ខ្សែច្រវ៉ាក់ផ្គត់ផ្គង់ជាង ២០០លានដុល្លារ ជាមួយនឹងការធានាទំនុកចិត្តផ្ទៃក្នុង។",
    ecoTag: "ប្រព័ន្ធអេកូឡូស៊ី ៤ សសរស្តម្ភ",
    ecoTitle1: "សម្ព័ន្ធភាពសហគ្រិន ១៩៨៣:",
    ecoTitle2: "ពាណិជ្ជកម្ម និងបញ្ញាជាក់ស្តែង",
    ecoDesc: "ជួយសហគ្រាសបង្កើនប្រាក់ចំណូល បង្កើនប្រសិទ្ធភាពខ្សែច្រវ៉ាក់ផ្គត់ផ្គង់ និងលើកកម្ពស់កិត្យានុភាព។",
    p1Tag: "សសរស្តម្ភបញ្ញា",
    p1Title: "Mastermind & ដំណើរកម្សាន្តធុរកិច្ច",
    p1Desc: "ទស្សនកិច្ចរោងចក្របច្ចេកវិទ្យាខ្ពស់ និងជួបពិភាក្សាជាមួយ Shark Phu និងថ្នាក់ដឹកនាំធំៗ។",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "ការគ្រប់គ្រងសាច់ប្រាក់",
    p1Item2: "Flexfit & AMG Tour",
    p1Sub2: "ខ្សែច្រវ៉ាក់ស្តង់ដារអាល្លឺម៉ង់",
    p2Tag: "សសរស្តម្ភពាណិជ្ជកម្ម",
    p2Title: "ខ្សែច្រវ៉ាក់ផ្គត់ផ្គង់បិទជិត B2B",
    p2Desc: "ការប្តេជ្ញាចិត្តផ្តល់អាទិភាពដល់ផលិតផល និងសេវាកម្មក្នុងបណ្តាញសមាជិក។",
    p2Item1: ">$200M+",
    p2Sub1: "ទំហំពាណិជ្ជកម្មផ្ទៃក្នុង",
    p2Item2: "គ្មានហានិភ័យ",
    p2Sub2: "ការត្រួតពិនិត្យទំនុកចិត្ត",
    p3Tag: "សសរស្តម្ភបច្ចេកវិទ្យាអត្តសញ្ញាណ",
    p3Title: "កាត VIP NFC Titanium & Apple Wallet",
    p3Desc: "កាតលោហៈឆ្លាក់ឡាស៊ែរដែលភ្ជាប់មកជាមួយបន្ទះឈីប NFC ទំនើបបំផុត។",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "សសរស្តម្ភការតភ្ជាប់ឆ្លាតវៃ",
    p4Title: "ជំនួយការ AI Matchmaking & Deal Room",
    p4Desc: "AI វិភាគតម្រូវការទុន និងការផ្គត់ផ្គង់ ដើម្បីណែនាំ CEO ដែលស័ក្តិសមបំផុត។",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "គោលការណ៍",
    coreTitle: "គុណតម្លៃស្នូលទាំង ៤ របស់ក្លឹប",
    core1Title: "ការផ្សារភ្ជាប់យូរអង្វែង",
    core1Desc: "បង្កើតបរិយាកាសនៃទំនុកចិត្តដាច់ខាតសម្រាប់សហគ្រិនកើតឆ្នាំ ១៩៨៣។",
    core2Title: "ការរៀនសូត្រជាបន្តបន្ទាប់",
    core2Desc: "ផ្តល់ចំណេះដឹងពីអ្នកជំនាញកំពូល និងគោលនយោបាយពន្ធដារ។",
    core3Title: "ការច្នៃប្រឌិត",
    core3Desc: "ការអនុវត្តបញ្ញាសិប្បនិម្មិត (AI) និងការផ្លាស់ប្តូរឌីជីថល។",
    core4Title: "ការអភិវឌ្ឍន៍ប្រកបដោយនិរន្តរភាព",
    core4Desc: "កសាងសម្ព័ន្ធភាពសហគ្រាសដ៏រឹងមាំ និងពង្រីកទៅកាន់ឆាកអន្តរជាតិ។",
    actTag: "សកម្មភាពផ្តាច់មុខ",
    actTitle: "សកម្មភាព និងព្រឹត្តិការណ៍លេចធ្លោ",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "ការពិភាក្សាជាមួយ Shark Phu",
    act1Desc: "មេរៀនជាក់ស្តែងស្តីពីការគ្រប់គ្រងសាច់ប្រាក់ និងការរៀបចំរចនាសម្ព័ន្ធឡើងវិញ។",
    act2Tag: "BUSINESS TOUR",
    act2Title: "ទស្សនកិច្ច Flexfit & AMG",
    act2Desc: "ការពិនិត្យមើលខ្សែសង្វាក់ផលិតកម្មបច្ចេកវិទ្យាខ្ពស់។",
    act3Tag: "ហិរញ្ញវត្ថុ & គោលនយោបាយ",
    act3Title: "វេទិកាពន្ធដារ និងហិរញ្ញវត្ថុ 2026-2028",
    act3Desc: "ការធ្វើបច្ចុប្បន្នភាពគោលនយោបាយពន្ធថ្មីសម្រាប់សហគ្រាស។",
    roadmapTag: "ដំណើរការចូលរួម",
    roadmapTitle: "៤ ជំហានដើម្បីក្លាយជាសមាជិក VIP",
    roadmap1Title: "ដាក់ពាក្យតាមអ៊ីនធឺណិត",
    roadmap1Desc: "បំពេញព័ត៌មានសហគ្រាស និងតួនាទីដើម្បីចុះឈ្មោះពិនិត្យដំបូង។",
    roadmap2Title: "ការត្រួតពិនិត្យគុណវុឌ្ឍិ",
    roadmap2Desc: "លេខាធិការដ្ឋានផ្ទៀងផ្ទាត់សមត្ថភាព និងភាពជឿជាក់។",
    roadmap3Title: "ការអនុម័ត & ផ្តល់កាត NFC",
    roadmap3Desc: "គណៈអចិន្ត្រៃយ៍អនុម័ត និងផ្តល់កាត Titanium NFC ផ្ទាល់ខ្លួន។",
    roadmap4Title: "ការធ្វើឱ្យសកម្មប្រព័ន្ធ",
    roadmap4Desc: "ចូលរួម Mastermind និងបណ្តាញពាណិជ្ជកម្ម B2B ភ្លាមៗ។",
    leadTag: "គណៈប្រតិបត្តិ អាណត្តិ ២០២៥ - ២០២៨",
    leadTitle: "ក្រុមអ្នកដឹកនាំត្រួសត្រាយ",
    ctaBoxTag: "ឯកសិទ្ធិសហគ្រិន ១៩៨៣",
    ctaBoxTitle1: "កុំទុកឱ្យសហគ្រាសរបស់អ្នក",
    ctaBoxTitle2: "ឯកោក្នុងសមុទ្រធំ",
    ctaBoxDesc: "ចូលរួមជាមួយសម្ព័ន្ធភាពនៃ CEO ជាង ២០០ នាក់កើតឆ្នាំ ១៩៨៣ និងកាន់កាប់កាត Titanium NFC VIP។",
    ctaBoxBtn: "ដាក់ពាក្យចូលរួម VIP →",
    footerCopy: "CLB CEO 1983. បង្កើតឡើងដោយ ViOne។",
    modalTitle: "ចុះឈ្មោះចូលរួម CLB CEO 1983",
    modalSubtitle: "ផ្តាច់មុខសម្រាប់សហគ្រិនកើតឆ្នាំ ១៩៨៣",
    formName: "ឈ្មោះពេញ *",
    formNamePlh: "ឧទាហរណ៍៖ សុខ សាន",
    formPhone: "លេខទូរស័ព្ទ / WhatsApp / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "ឈ្មោះក្រុមហ៊ុន និងតួនាទី *",
    formCompanyPlh: "ឧទាហរណ៍៖ ប្រធានក្រុមប្រឹក្សាភិបាល - ABC Group",
    formRevenue: "ប្រាក់ចំណូលប្រចាំឆ្នាំ",
    formRev1: "ក្រោម 500K USD",
    formRev2: "500K - 2M USD",
    formRev3: "2M - 10M USD",
    formRev4: "លើសពី 10M USD",
    formIndustry: "វិស័យអាជីវកម្មចម្បង *",
    formIndustryPlh: "ឧទាហរណ៍៖ បច្ចេកវិទ្យា, អចលនទ្រព្យ...",
    formSubmit: "ផ្ញើពាក្យស្នើសុំ →",
    formSubmitting: "កំពុងផ្ញើ...",
    formSuccessTitle: "បានដាក់ពាក្យដោយជោគជ័យ!",
    formSuccessDesc: "លេខាធិការដ្ឋាននឹងទាក់ទងមកអ្នកវិញក្នុងរយៈពេល ២៤ ម៉ោងធ្វើការ។",
  },
  lo: {
    navBadge: "ສະມາຄົມວິສາຫະກິດ",
    navVip: "VIP PASS",
    navAbout: "ກ່ຽວກັບພວກເຮົາ",
    navMatrix: "ມາຕຣິກຍຸດທະສາດ",
    navEcosystem: "ລະບົບນິເວດ",
    navCore: "ຄຸນຄ່າຫຼັກ",
    navActivities: "ກິດຈະກຳ & ທົວ",
    navLeadership: "ຄະນະບໍລິຫານ",
    navRoadmap: "ຂັ້ນຕອນການເຂົ້າຮ່ວມ",
    navJoin: "ເຂົ້າຮ່ວມ CLB VIP →",
    modeDark: "🌙 Obsidian",
    modeLight: "☀️ Ivory",
    modeContrast: "🌓 Onyx",
    heroHanoiba: "👑 ຂຶ້ນກັບສະມາຄົມນັກທຸລະກິດໜຸ່ມຮ່າໂນ້ຍ (HANOIBA)",
    heroTitle1: "ການເຊື່ອມໂຍງຜູ້ນໍາປີ 1983",
    heroTitle2: "ສ້າງຕັ້ງອານາຈັກ",
    heroTitle3: "ການຄ້າ B2B",
    heroDesc: "ຊຸມຊົນຊັ້ນສູງທີ່ຮວບຮວມເອົາປະທານ ແລະ CEO ຫຼາຍກວ່າ 200 ທ່ານທີ່ເກີດໃນປີ 1983 (ປີກຸນ).",
    heroJoinBtn: "ສະໝັກເຂົ້າຮ່ວມ CLB VIP →",
    heroOpenApp: "ເປີດແອັບສະມາຊິກ",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "ນັກທຸລະກິດປີ 1983",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "ແຕະເພື່ອປີ້ນ ↺",
    cardPedestalDesc: "ບັດສະມາຊິກໂລຫະ 1-Touch NFC & Apple Wallet Sync",
    stat1Num: "200+",
    stat1Title: "CEO ປີ 1983",
    stat1Desc: "ປະທານ & ຜູ້ອໍານວຍການໃຫຍ່",
    stat2Num: ">$200M+",
    stat2Title: "ການຄ້າພາຍໃນ",
    stat2Desc: "ຕ່ອງໂສ້ອຸປະທານປິດ",
    stat3Num: "+35%",
    stat3Title: "ການເຕີບໂຕ B2B",
    stat3Desc: "ສິດທິພິເສດພາຍໃນ",
    stat4Num: "100%",
    stat4Title: "ວິສາຫະກິດຕົວຈິງ",
    stat4Desc: "ການກວດສອບຢ່າງເຂັ້ມງວດ",
    matrixTag: "ມາຕຣິກຍຸດທະສາດ",
    matrixTitle1: "ສິ່ງທ້າທາຍຂອງຜູ້ນຳ &",
    matrixTitle2: "ທາງອອກສະເພາະຈາກ CEO 1983",
    matrixDesc: "ຊອກຫາພັນທະມິດທີ່ໜ້າເຊື່ອຖືຢ່າງແທ້ຈິງເພື່ອແກ້ໄຂບັນຫາກະແສເງິນສົດ ແລະ ຕ່ອງໂສ້ອຸປະທານ.",
    matrixColBefore: "ສິ່ງທ້າທາຍທົ່ວໄປ",
    matrixColAfter: "ສິດທິພິເສດ CEO 1983",
    mItem1B: "ຄວາມໂດດດ່ຽວໃນການຕັດສິນໃຈຍຸດທະສາດ ແລະ ຄວາມກົດດັນໃນການປັບໂຄງສ້າງ.",
    mItem1A: "ວົງມົນ Mastermind ກັບຜູ້ບໍລິຫານລະດັບສູງ ແລະ Shark ເພື່ອແກ້ໄຂບັນຫາການຄຸ້ມຄອງ.",
    mItem2B: "ການເສຍເວລາໃນການພົບປະສັງສັນທີ່ບໍ່ມີປະສິດທິພາບ ແລະ ນາມບັດເຈ້ຍທີ່ຖືກລືມ.",
    mItem2A: "ບັດ Titanium NFC 1-touch ແລະ ລະບົບ AI ຈັບຄູ່ຄູ່ຮ່ວມທຸລະກິດທີ່ຖືກຕ້ອງໃນບໍ່ເທົ່າໃດວິນາທີ.",
    mItem3B: "ຄວາມສ່ຽງຈາກໜີ້ເສຍ ແລະ ຄ່າໃຊ້ຈ່າຍສູງໃນການຊອກຫາຄູ່ຮ່ວມງານໃໝ່.",
    mItem3A: "ຕ່ອງໂສ້ອຸປະທານຫຼາຍກວ່າ 200 ລ້ານໂດລາ ພ້ອມການຮັບປະກັນຄວາມໜ້າເຊື່ອຖື.",
    ecoTag: "ລະບົບນິເວດ 4 ເສົາຄໍ້າ",
    ecoTitle1: "ພັນທະມິດນັກທຸລະກິດ 1983:",
    ecoTitle2: "ການຄ້າ ແລະ ປັນຍາຕົວຈິງ",
    ecoDesc: "ຊ່ວຍວິສາຫະກິດເພີ່ມລາຍຮັບ, ປັບປຸງຕ່ອງໂສ້ອຸປະທານ ແລະ ຍົກລະດັບຖານະຜູ້ນຳ.",
    p1Tag: "ເສົາຄໍ້າທາງປັນຍា",
    p1Title: "Mastermind & ທົວທຸລະກິດ",
    p1Desc: "ຢ້ຽມຢາມໂຮງງານເຕັກໂນໂລຢີສູງ ແລະ ສົນທະນາກັບ Shark Phu ແລະ ປະທານກຸ່ມໃຫຍ່.",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "ການບໍລິຫານກະແສເງິນສົດ",
    p1Item2: "Flexfit & AMG Tour",
    p1Sub2: "ສາຍການຜະລິດມາດຕະຖານເຢຍລະມັນ",
    p2Tag: "ເສົາຄໍ້າການຄ້າ",
    p2Title: "ຕ່ອງໂສ້ອຸປະທານປິດ B2B",
    p2Desc: "ຄໍາໝັ້ນສັນຍາໃຫ້ບຸລິມະສິດສິນຄ້າ ແລະ ການບໍລິການໃນເຄືອຂ່າຍສະມາຊິກ.",
    p2Item1: ">$200M+",
    p2Sub1: "ຍອດການຄ້າພາຍໃນ",
    p2Item2: "ບໍ່ມີຄວາມສ່ຽງ",
    p2Sub2: "ການກວດສອບຄວາມເຊື່ອຖື",
    p3Tag: "ເສົາຄໍ້າເຕັກໂນໂລຢີເອກະລັກ",
    p3Title: "ບັດ VIP NFC Titanium & Apple Wallet",
    p3Desc: "ບັດໂລຫະແກະສະຫຼັກເລເຊີທີ່ຝັງຊິບ NFC ທັນສະໄໝທີ່ສຸດ.",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "ເສົາຄໍ້າການເຊື່ອມຕໍ່ອັດສະລິຍະ",
    p4Title: "ຜູ້ຊ່ວຍ AI Matchmaking & Deal Room",
    p4Desc: "AI ວິເຄາະຄວາມຕ້ອງການທຶນ ແລະ ການສະໜອງ ເພື່ອແນະນໍາ CEO ທີ່ເໝາະສົມທີ່ສຸດ.",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "ຫຼັກການ",
    coreTitle: "4 ຄຸນຄ່າຫຼັກຂອງສະໂມສອນ",
    core1Title: "ຄວາມຜູກພັນຍາວນານ",
    core1Desc: "ສ້າງສະພາບແວດລ້ອມແຫ່ງຄວາມໄວ້ວາງໃຈຢ່າງແທ້ຈິງສໍາລັບນັກທຸລະກິດປີ 1983.",
    core2Title: "ການຮຽນຮູ້ຢ່າງຕໍ່ເນື່ອງ",
    core2Desc: "ສະໜອງຄວາມຮູ້ຈາກຜູ້ຊ່ຽວຊານຊັ້ນນຳ ແລະ ນະໂຍບາຍພາສີອາກອນ.",
    core3Title: "ຄວາມຄິດສ້າງສັນ",
    core3Desc: "ການນໍາໃຊ້ປັນຍາປະດິດ (AI) ແລະ ການຫັນປ່ຽນດິຈິຕອນ.",
    core4Title: "ການພັດທະນາແບບຍືນຍົງ",
    core4Desc: "ສ້າງພັນທະມິດທຸລະກິດທີ່ເຂັ້ມແຂງ ແລະ ຂະຫຍາຍສູ່ລະດັບສາກົນ.",
    actTag: "ກິດຈະກໍາພິເສດ",
    actTitle: "ກິດຈະກໍາ ແລະ ເຫດການທີ່ໂດດເດັ່ນ",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "ການສົນທະນາກັບ Shark Phu",
    act1Desc: "ບົດຮຽນຕົວຈິງກ່ຽວກັບການຄຸ້ມຄອງກະແສເງິນສົດ ແລະ ການປັບໂຄງສ້າງ.",
    act2Tag: "BUSINESS TOUR",
    act2Title: "ຢ້ຽມຢາມ Flexfit & AMG",
    act2Desc: "ການກວດກາສາຍການຜະລິດເຕັກໂນໂລຢີສູງ.",
    act3Tag: "ການເງິນ & ນະໂຍບາຍ",
    act3Title: "ເວທີປາໄສພາສີ ແລະ ການເງິນ 2026-2028",
    act3Desc: "ອັບເດດນະໂຍບາຍພາສີໃໝ່ສໍາລັບວິສາຫະກິດ.",
    roadmapTag: "ຂັ້ນຕອນການເຂົ້າຮ່ວມ",
    roadmapTitle: "4 ຂັ້ນຕອນສູ່ການເປັນສະມາຊິກ VIP",
    roadmap1Title: "ສະໝັກອອນລາຍ",
    roadmap1Desc: "ຕື່ມຂໍ້ມູນວິສາຫະກິດ ແລະ ຕໍາແໜ່ງເພື່ອລົງທະບຽນກວດສອບເບື້ອງຕົ້ນ.",
    roadmap2Title: "ການກວດສອບຄຸນວຸດທິ",
    roadmap2Desc: "ກອງເລຂາກວດສອບຄວາມສາມາດ ແລະ ຄວາມໜ້າເຊື່ອຖື.",
    roadmap3Title: "ການອະນຸມັດ & ມອບບັດ NFC",
    roadmap3Desc: "ຄະນະປະຈໍາອະນຸມັດ ແລະ ມອບບັດ Titanium NFC ສະເພາະຕົວ.",
    roadmap4Title: "ເປີດໃຊ້ລະບົບນິເວດ",
    roadmap4Desc: "ເຂົ້າຮ່ວມ Mastermind ແລະ ເຄືອຂ່າຍ B2B ທັນທີ.",
    leadTag: "ຄະນະບໍລິຫານ ໄລຍະ 2025 - 2028",
    leadTitle: "ທີມງານຜູ້ນໍາບຸກເບີກ",
    ctaBoxTag: "ສິດທິພິເສດນັກທຸລະກິດ 1983",
    ctaBoxTitle1: "ຢ່າປ່ອຍໃຫ້ວິສາຫະກິດຂອງທ່ານ",
    ctaBoxTitle2: "ໂດດດ່ຽວໃນທະເລກວ້າງ",
    ctaBoxDesc: "ເຂົ້າຮ່ວມກັບພັນທະມິດຂອງ CEO ຫຼາຍກວ່າ 200 ທ່ານທີ່ເກີດໃນປີ 1983 ແລະ ຄອບຄອງບັດ Titanium NFC VIP.",
    ctaBoxBtn: "ສະໝັກເຂົ້າຮ່ວມ VIP →",
    footerCopy: "CLB CEO 1983. ພັດທະນາໂດຍ ViOne.",
    modalTitle: "ລົງທະບຽນເຂົ້າຮ່ວມ CLB CEO 1983",
    modalSubtitle: "ສະເພາະນັກທຸລະກິດທີ່ເກີດໃນປີ 1983 ເທົ່ານັ້ນ",
    formName: "ຊື່ເຕັມ *",
    formNamePlh: "ຕົວຢ່າງ: ສົມສັກ ສີວິໄລ",
    formPhone: "ເບີໂທ / WhatsApp / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "ຊື່ບໍລິສັດ ແລະ ຕໍາແໜ່ງ *",
    formCompanyPlh: "ຕົວຢ່າງ: ປະທານສະພາບໍລິຫານ - ABC Group",
    formRevenue: "ລາຍຮັບປະຈໍາປີ",
    formRev1: "ຫຼຸດ 500K USD",
    formRev2: "500K - 2M USD",
    formRev3: "2M - 10M USD",
    formRev4: "ຫຼາຍກວ່າ 10M USD",
    formIndustry: "ຂະແໜງທຸລະກິດຫຼັກ *",
    formIndustryPlh: "ຕົວຢ່າງ: ເຕັກໂນໂລຢີ, ອະສັງຫາລິມະຊັບ...",
    formSubmit: "ສົ່ງໃບສະໝັກ →",
    formSubmitting: "ກຳລັງສົ່ງ...",
    formSuccessTitle: "ສົ່ງໃບສະໝັກສຳເລັດແລ້ວ!",
    formSuccessDesc: "ກອງເລຂາຈະຕິດຕໍ່ກັບທ່ານພາຍໃນ 24 ຊົ່ວໂມງເຮັດວຽກ.",
  },
  my: {
    navBadge: "စီးပွားရေးလုပ်ငန်းရှင်များအသင်း",
    navVip: "VIP PASS",
    navAbout: "အကြောင်းအရာ",
    navMatrix: "မဟာဗျူဟာ မက်ထရစ်",
    navEcosystem: "ဂေဟစနစ်",
    navCore: "အဓိကတန်ဖိုးများ",
    navActivities: "လှုပ်ရှားမှုများ & ခရီးစဉ်များ",
    navLeadership: "အမှုဆောင်အဖွဲ့",
    navRoadmap: "ဝင်ခွင့်အဆင့်ဆင့်",
    navJoin: "VIP ကလပ်သို့ ဝင်ရောက်ရန် →",
    modeDark: "🌙 Obsidian",
    modeLight: "☀️ Ivory",
    modeContrast: "🌓 Onyx",
    heroHanoiba: "👑 ဟနွိုင်းလူငယ်စီးပွားရေးလုပ်ငန်းရှင်များအသင်း (HANOIBA) လက်အောက်ခံ",
    heroTitle1: "၁၉၈၃ ခေါင်းဆောင်များ မဟာမိတ်",
    heroTitle2: "B2B ကုန်သွယ်ရေး",
    heroTitle3: "အင်ပါယာ တည်ဆောက်ခြင်း",
    heroDesc: "၁၉၈၃ ခုနှစ်ဖွား ဥက္ကဋ္ဌများနှင့် CEO ၂၀၀ ကျော်ပါဝင်သော ထိပ်တန်းစီးပွားရေးမဟာမိတ်အဖွဲ့။",
    heroJoinBtn: "VIP ကလပ်ဝင်ခွင့် လျှောက်ထားရန် →",
    heroOpenApp: "အသင်းဝင်အက်ပ်ကို ဖွင့်ပါ",
    cardVipPass: "VIP PASS",
    cardNfcTouch: "NFC TOUCH",
    cardExecMember: "EXECUTIVE MEMBER",
    cardMemberName: "၁၉၈၃ စီးပွားရေးခေါင်းဆောင်",
    cardMemberAlt: "LE HOANG LONG",
    cardIdLabel: "ID: 1983-HNBA-8888",
    cardWallet: "Apple & Google Wallet",
    cardTapHint: "လှန်ကြည့်ရန် နှိပ်ပါ ↺",
    cardPedestalDesc: "1-Touch NFC တိုက်တေနီယမ် အသင်းဝင်ကတ် & Apple Wallet ချိတ်ဆက်မှု",
    stat1Num: "200+",
    stat1Title: "၁၉၈၃ ဖွား CEO များ",
    stat1Desc: "ဥက္ကဋ္ဌ & မန်နေဂျင်းဒါရိုက်တာများ",
    stat2Num: ">$200M+",
    stat2Title: "အတွင်းပိုင်း ကုန်သွယ်မှု",
    stat2Desc: "သီးသန့် ထောက်ပံ့ရေးကွင်းဆက်",
    stat3Num: "+35%",
    stat3Title: "B2B တိုးတက်မှု",
    stat3Desc: "အတွင်းပိုင်း ဦးစားပေးမှု",
    stat4Num: "100%",
    stat4Title: "စိစစ်ပြီး လုပ်ငန်းများ",
    stat4Desc: "တိကျသော စိစစ်အတည်ပြုမှု",
    matrixTag: "မဟာဗျူဟာ မက်ထရစ်",
    matrixTitle1: "ခေါင်းဆောင်များ၏ စိန်ခေါ်မှု &",
    matrixTitle2: "CEO 1983 ၏ အထူးသီးသန့် ဖြေရှင်းချက်",
    matrixDesc: "ငွေကြေးစီးဆင်းမှုနှင့် ထောက်ပံ့ရေးကွင်းဆက် ပြဿနာများကို ဖြေရှင်းရန် ယုံကြည်စိတ်ချရသော ခေါင်းဆောင်များ အသိုက်အဝန်း။",
    matrixColBefore: "အများရင်ဆိုင်ရသော အခက်အခဲ",
    matrixColAfter: "CEO 1983 သီးသန့် အခွင့်ထူး",
    mItem1B: "မဟာဗျူဟာ ဆုံးဖြတ်ချက်များတွင် တစ်ဦးတည်း အထီးကျန်မှုနှင့် ပြုပြင်ပြောင်းလဲရေး ဖိအားများ။",
    mItem1A: "ထိပ်တန်းခေါင်းဆောင်များနှင့် Shark အကြံပေးပုဂ္ဂိုလ်များပါဝင်သော သီးသန့် Mastermind အဝန်းအဝိုင်း။",
    mItem2B: "အကျိုးမရှိသော လူမှုတွေ့ဆုံပွဲများတွင် အချိန်ကုန်ခြင်းနှင့် မေ့ကျန်နေသော စက္ကူလိပ်စာကတ်များ။",
    mItem2A: "1-touch Titanium NFC ကတ်နှင့် စက္ကန့်ပိုင်းအတွင်း မိတ်ဖက်ရှာဖွေပေးသော AI စနစ်။",
    mItem3B: "မိတ်ဖက်အသစ်ရှာဖွေရာတွင် ဖြစ်ပေါ်တတ်သော ငွေကြေးဆုံးရှုံးမှုအန္တရာယ်နှင့် စရိတ်စကများ။",
    mItem3A: "ဒေါ်လာ သန်း ၂၀၀ ကျော်တန်ဖိုးရှိ ကုန်သွယ်မှုကွင်းဆက်နှင့် အပြန်အလှန် ယုံကြည်မှုအာမခံချက်။",
    ecoTag: "အဓိကမဏ္ဍိုင် ၄ ရပ် ဂေဟစနစ်",
    ecoTitle1: "၁၉၈၃ စီးပွားရေးမဟာမိတ်:",
    ecoTitle2: "မဟာဗျူဟာ ကုန်သွယ်ရေးနှင့် ဉာဏ်ပညာ Bento Grid",
    ecoDesc: "ဝင်ငွေတိုးတက်စေရန်၊ ထောက်ပံ့ရေးကွင်းဆက်ကို မြှင့်တင်ရန်နှင့် ခေါင်းဆောင်မှုဂုဏ်သိက္ခာကို မြှင့်တင်ပေးသော ဂေဟစနစ်။",
    p1Tag: "ဉာဏ်ပညာ မဏ္ဍိုင်",
    p1Title: "Mastermind & စီးပွားရေးလေ့လာရေးခရီးစဉ်များ",
    p1Desc: "အဆင့်မြင့်နည်းပညာစက်ရုံများသို့ သွားရောက်လေ့လာခြင်းနှင့် Shark Phu အပါအဝင် ထိပ်တန်းလုပ်ငန်းရှင်များနှင့် ဆွေးနွေးခြင်း။",
    p1Item1: "Shark Phu • Sunhouse",
    p1Sub1: "ငွေကြေးစီးဆင်းမှု စီမံခန့်ခွဲမှု",
    p1Item2: "Flexfit & AMG Tour",
    p1Sub2: "ဂျာမန်စံချိန်မီ ကုန်ထုတ်လုပ်မှု",
    p2Tag: "ကုန်သွယ်ရေး မဏ္ဍိုင်",
    p2Title: "B2B ထောက်ပံ့ရေးကွင်းဆက်",
    p2Desc: "အသင်းဝင်ကွန်ရက်အတွင်း ထုတ်ကုန်များနှင့် ဝန်ဆောင်မှုများကို ဦးစားပေးအသုံးပြုရန် ကတိကဝတ်။",
    p2Item1: ">$200M+",
    p2Sub1: "အတွင်းပိုင်း ကုန်သွယ်မှုပမာဏ",
    p2Item2: "အန္တရာယ်ကင်းစင်မှု",
    p2Sub2: "အပြန်အလှန် ယုံကြည်မှုစိစစ်ခြင်း",
    p3Tag: "နည်းပညာ မဏ္ဍိုင်",
    p3Title: "Titanium NFC VIP ကတ် & Apple Wallet",
    p3Desc: "NFC ချစ်ပ်ပါဝင်သော လေဆာထွင်း တိုက်တေနီယမ် သတ္တုကတ်ပြား။",
    p3Badge1: "⚡ 1-Touch NFC Metal",
    p3Badge2: "📱 Apple & Google Wallet",
    p3Badge3: "🔒 C-Level Verified ID",
    p4Tag: "စမတ်ချိတ်ဆက်မှု မဏ္ဍိုင်",
    p4Title: "AI Matchmaking & သီးသန့် Deal Room",
    p4Desc: "AI မှ အသင့်တော်ဆုံး CEO များကို အကြံပြုပေးပြီး လျှို့ဝှက်ဆွေးနွေးခန်းများ ပံ့ပိုးပေးခြင်း။",
    p4Badge1: "🧠 AI Matching Engine",
    p4Badge2: "🤝 Confidential Deal Room",
    p4Badge3: "📈 Realtime Business Sync",
    coreTag: "အခြေခံမူများ",
    coreTitle: "ကလပ်၏ အဓိကတန်ဖိုး ၄ ရပ်",
    core1Title: "ခိုင်မြဲသော ချိတ်ဆက်မှု",
    core1Desc: "၁၉၈၃ ဖွား ခေါင်းဆောင်များအကြား ရိုးသားပြီး လုံးဝယုံကြည်စိတ်ချရသော ပတ်ဝန်းကျင်ကို ဖန်တီးပေးခြင်း။",
    core2Title: "စဉ်ဆက်မပြတ် လေ့လာသင်ယူမှု",
    core2Desc: "ထိပ်တန်းကျွမ်းကျင်သူများထံမှ စီမံခန့်ခွဲမှုဗဟုသုတများနှင့် အခွန်ဆိုင်ရာ မူဝါဒများကို မျှဝေပေးခြင်း။",
    core3Title: "တီထွင်ဆန်းသစ်မှု",
    core3Desc: "ဉာဏ်ရည်တု (AI) နှင့် ဒစ်ဂျစ်တယ်နည်းပညာများကို စီးပွားရေးလုပ်ငန်းများတွင် အသုံးချခြင်း။",
    core4Title: "ရေရှည်တည်တံ့သော ဖွံ့ဖြိုးတိုးတက်မှု",
    core4Desc: "ခိုင်မာသော စီးပွားရေးမဟာမိတ်ကို တည်ဆောက်ပြီး နိုင်ငံတကာအဆင့်သို့ အတူတကွ တက်လှမ်းခြင်း။",
    actTag: "အထူးလှုပ်ရှားမှုများ",
    actTitle: "ထူးခြားသော လှုပ်ရှားမှုများနှင့် ပွဲများ",
    act1Tag: "BUSINESS TALKSHOW",
    act1Title: "Shark Phu နှင့် စီမံခန့်ခွဲမှု ဆွေးနွေးပွဲ",
    act1Desc: "ငွေကြေးစီးဆင်းမှုနှင့် စီးပွားရေးပြန်လည်ဖွဲ့စည်းခြင်းဆိုင်ရာ လက်တွေ့သင်ခန်းစာများ။",
    act2Tag: "BUSINESS TOUR",
    act2Title: "Flexfit & AMG စက်ရုံလေ့လာရေး",
    act2Desc: "အဆင့်မြင့် အလိုအလျောက် ထုတ်လုပ်မှုလိုင်းများကို လေ့လာစစ်ဆေးခြင်း။",
    act3Tag: "ဘဏ္ဍာရေး & မူဝါဒ",
    act3Title: "၂၀၂၆-၂၀၂၈ အခွန်နှင့် ဘဏ္ဍာရေး ဖိုရမ်",
    act3Desc: "အဖွဲ့ဝင်လုပ်ငန်းများအတွက် အခွန်မူဝါဒအသစ်များနှင့် အကောင်းဆုံးအရင်းအနှီးဖွဲ့စည်းမှု။",
    roadmapTag: "ဝင်ခွင့်အဆင့်ဆင့်",
    roadmapTitle: "VIP အသင်းဝင်ဖြစ်လာရန် အဆင့် ၄ ဆင့်",
    roadmap1Title: "အွန်လိုင်းလျှောက်လွှာတင်ခြင်း",
    roadmap1Desc: "လုပ်ငန်းအချက်အလက်များနှင့် ရာထူးကို ဖြည့်သွင်း၍ လျှောက်ထားပါ။",
    roadmap2Title: "အရည်အချင်း စိစစ်ခြင်း",
    roadmap2Desc: "အတွင်းရေးမှူးအဖွဲ့မှ လုပ်ငန်းစွမ်းဆောင်ရည်နှင့် ဂုဏ်သတင်းကို စိစစ်ပါမည်။",
    roadmap3Title: "အတည်ပြုခြင်း & NFC ကတ်ပေးအပ်ခြင်း",
    roadmap3Desc: "အလုပ်အမှုဆောင်အဖွဲ့မှ အတည်ပြုပြီး သီးသန့် တိုက်တေနီယမ် NFC ကတ်ကို ပေးအပ်ပါမည်။",
    roadmap4Title: "ဂေဟစနစ် စတင်အသုံးပြုခြင်း",
    roadmap4Desc: "Mastermind နှင့် B2B ကုန်သွယ်ရေးကွန်ရက်များသို့ ချက်ချင်း ဝင်ရောက်ခွင့်ရရှိပါမည်။",
    leadTag: "အမှုဆောင်အဖွဲ့ ၂၀၂၅ - ၂၀၂၈",
    leadTitle: "ရှေ့ဆောင်ခေါင်းဆောင်မှုအဖွဲ့",
    ctaBoxTag: "၁၉၈၃ ခေါင်းဆောင်များ အခွင့်ထူး",
    ctaBoxTitle1: "သင်၏စီးပွားရေးလုပ်ငန်းကို သမုဒ္ဒရာပြင်ကျယ်ကြီးထဲတွင်",
    ctaBoxTitle2: "တစ်ဦးတည်း အထီးကျန်မနေပါစေနှင့်",
    ctaBoxDesc: "၁၉၈၃ ဖွား ထိပ်တန်း CEO ၂၀၀ ကျော်၏ မဟာမိတ်အဖွဲ့သို့ ဝင်ရောက်ပြီး တိုက်တေနီယမ် NFC VIP ကတ်ကို ရယူလိုက်ပါ။",
    ctaBoxBtn: "VIP လျှောက်လွှာတင်ရန် →",
    footerCopy: "CEO 1983 စီးပွားရေးကလပ်။ ViOne မှ ဖန်တီးတီထွင်သည်။",
    modalTitle: "CEO 1983 ကလပ်သို့ ဝင်ရောက်ရန် လျှောက်ထားခြင်း",
    modalSubtitle: "၁၉၈၃ ခုနှစ်ဖွား စီးပွားရေးခေါင်းဆောင်များအတွက်သာ သီးသန့်",
    formName: "အမည်အပြည့်အစုံ *",
    formNamePlh: "ဥပမာ - ဦးအောင်",
    formPhone: "ဖုန်းနံပါတ် / WhatsApp / Zalo *",
    formPhonePlh: "+84 912 345 678",
    formCompany: "ကုမ္ပဏီအမည်နှင့် ရာထူး *",
    formCompanyPlh: "ဥပမာ - ဥက္ကဋ္ဌ & CEO - ABC Group",
    formRevenue: "နှစ်စဉ်ဝင်ငွေ",
    formRev1: "500K USD အောက်",
    formRev2: "500K - 2M USD",
    formRev3: "2M - 10M USD",
    formRev4: "10M USD အထက်",
    formIndustry: "အဓိကလုပ်ငန်းနယ်ပယ် *",
    formIndustryPlh: "ဥပမာ - နည်းပညာ၊ အိမ်ခြံမြေ...",
    formSubmit: "လျှောက်လွှာ ပေးပို့ရန် →",
    formSubmitting: "ပေးပို့နေပါသည်...",
    formSuccessTitle: "လျှောက်လွှာ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။",
    formSuccessDesc: "CEO 1983 အတွင်းရေးမှူးအဖွဲ့မှ ၂၄ နာရီအတွင်း ဆက်သွယ်ပါမည်။",
  },
};

export function Ceo1983Landing() {
  const { lang } = useLang();
  // Default to Dark/Obsidian luxury mode with user toggle
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [modalOpen, setModalOpen] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    revenue: "10-50",
    industry: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isDark = themeMode === "dark";
  const isContrast = themeMode === "contrast";

  // Active language dictionary with fallback to Vietnamese
  const t = (CEO1983_I18N as any)[lang] || CEO1983_I18N.vi;

  // Helper function to switch classes based on current theme
  const themeClass = (darkClass: string, lightClass: string, contrastClass?: string) => {
    if (isContrast && contrastClass) return contrastClass;
    if (isDark || isContrast) return darkClass;
    return lightClass;
  };

  const handleJoinClick = () => {
    setModalOpen(true);
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
      setTimeout(() => {
        setModalOpen(false);
        setSubmitted(false);
      }, 2500);
    }
  };

  // Real leaders of CLB CEO 1983 (Nhiệm kỳ 2025 - 2028) with localized roles
  const leaders = [
    {
      name: "Lê Dung",
      role: lang === "vi" ? "Chủ Tịch CLB CEO 1983" : lang === "en" ? "President of CEO 1983 Club" : lang === "ja" ? "CEO 1983 クラブ 会長" : lang === "ko" ? "CEO 1983 클럽 회장" : lang === "zh" ? "CEO 1983 俱乐部会长" : lang === "km" ? "ប្រធានក្លឹប CEO 1983" : lang === "lo" ? "ປະທານສະໂມສອນ CEO 1983" : "CEO 1983 ကလပ် ဥက္ကဋ္ဌ",
      company: lang === "vi" ? "Viện Trưởng Viện Doanh Trí / TGĐ DGroup" : "President of Business Intelligence Institute / CEO DGroup",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Lê Hoàng Long",
      role: lang === "vi" ? "Phó Chủ Tịch Chiến Lược & Công Nghệ" : lang === "en" ? "VP of Strategy & Technology" : lang === "ja" ? "戦略・テクノロジー担当副会長" : lang === "ko" ? "전략 및 기술 담당 부회장" : lang === "zh" ? "战略与科技副会长" : lang === "km" ? "អនុប្រធានយុទ្ធសាស្ត្រ និងបច្ចេកវិទ្យា" : lang === "lo" ? "ຮອງປະທານຍຸດທະສາດ & ເຕັກໂນໂລຊີ" : "မဟာဗျူဟာနှင့် နည်းပညာ ဒု-ဥက္ကဋ္ဌ",
      company: lang === "vi" ? "Tổng Giám Đốc ViConnect / Founder Linh Vũ Media" : "CEO ViConnect / Founder Linh Vu Media",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Trần Thị Mai Lan",
      role: lang === "vi" ? "Phó Chủ Tịch Thường Trực" : lang === "en" ? "Standing Vice President" : lang === "ja" ? "常任副会長 兼 事務総長" : lang === "ko" ? "수석 부회장 겸 사무총장" : lang === "zh" ? "常务副会长兼秘书长" : lang === "km" ? "អនុប្រធានអចិន្ត្រៃយ៍" : lang === "lo" ? "ຮອງປະທານປະຈໍາການ" : "အမြဲတမ်း ဒုတိယဥက္ကဋ္ဌ",
      company: lang === "vi" ? "Tổng Thư Ký CLB CEO 1983 / CEO LanDecor Group" : "Secretary General / CEO LanDecor Group",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Phạm Đức Minh",
      role: lang === "vi" ? "Phó Chủ Tịch Xúc Tiến Thương Mại" : lang === "en" ? "VP of Trade Promotion" : lang === "ja" ? "貿易促進担当副会長" : lang === "ko" ? "무역 진흥 담당 부회장" : lang === "zh" ? "贸易促进副会长" : lang === "km" ? "អនុប្រធានជំរុញពាណិជ្ជកម្ម" : lang === "lo" ? "ຮອງປະທານສົ່ງເສີມການຄ້າ" : "ကုန်သွယ်မှုမြှင့်တင်ရေး ဒု-ဥက္ကဋ္ဌ",
      company: lang === "vi" ? "Trưởng Ban B2B / Chủ Tịch Minh Phát Holdings" : "Head of B2B Committee / Chairman Minh Phat Holdings",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Vũ Thu Trang",
      role: lang === "vi" ? "Trưởng Ban Truyền Thông & Sự Kiện" : lang === "en" ? "Head of Media & Events" : lang === "ja" ? "広報・イベント委員長" : lang === "ko" ? "홍보 및 행사 위원장" : lang === "zh" ? "媒体与品牌活动部长" : lang === "km" ? "ប្រធានផ្នែកសារព័ត៌មាន & ព្រឹត្តិការណ៍" : lang === "lo" ? "ຫົວໜ້າຄະນະສື່ມວນຊົນ & ງານກິດຈະກໍາ" : "မီဒီယာနှင့် ပွဲများဆိုင်ရာ အကြီးအကဲ",
      company: lang === "vi" ? "Phụ Trách Đối Ngoại & Mastermind Tour" : "Director of External Relations & Mastermind Tours",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div
      className={`transition-colors duration-500 relative overflow-x-hidden selection:bg-[#B18B44] selection:text-white ${
        themeClass("bg-[#07080B] text-[#F8F7F3]", "bg-[#FAF8F5] text-[#0F172A]", "bg-black text-white")
      }`}
      style={{ fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* 1. EMBEDDED LUXURY FONTS & SHINE ANIMATION */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap');
        
        @keyframes shineSweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
        .shine-sweep {
          position: relative;
          overflow: hidden;
        }
        .shine-sweep::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 60%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-150%) skewX(-25deg);
          animation: shineSweep 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        `}
      </style>

      {/* 2. HIGH-DEPTH LUXURY 3D BACKGROUND IMAGE & RADIAL LIGHTING */}
      <div className="absolute inset-0 top-0 left-0 w-full h-[1350px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/landing/ceo1983-hero-bg.jpg"
          alt="CEO 1983 Luxury Background"
          className={`absolute top-0 right-0 w-full h-[1150px] object-cover object-top transition-opacity duration-700 ${
            isDark ? "opacity-95" : isContrast ? "opacity-45" : "opacity-30 mix-blend-multiply"
          }`}
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Ambient Warm Golden Halo Spotlight on Card Area */}
        <div className={`absolute top-16 right-10 lg:right-32 w-[750px] h-[750px] rounded-full blur-[170px] pointer-events-none transition-opacity duration-700 ${
          isDark ? "bg-gradient-to-br from-amber-500/30 via-yellow-600/20 to-transparent opacity-100" : isContrast ? "bg-white/10 opacity-50" : "bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent opacity-80"
        }`} />
        <div className={`absolute top-60 left-10 w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none transition-opacity duration-700 ${
          isDark ? "bg-gradient-to-tr from-amber-700/25 via-amber-500/15 to-transparent opacity-90" : isContrast ? "opacity-0" : "bg-gradient-to-tr from-amber-600/10 via-amber-400/6 to-transparent opacity-60"
        }`} />

        {/* SVG Perspective Floor Grid */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-[450px] opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ceo-hero-grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.9" />
            </linearGradient>
            <pattern id="ceo-hero-iso" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="url(#ceo-hero-grid-fade)" strokeWidth="0.9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ceo-hero-iso)" />
        </svg>

        {/* Floating golden star dust bokeh */}
        <div className="absolute top-[18%] left-[22%] w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_18px_#FCD34D] animate-pulse" />
        <div className="absolute top-[35%] right-[28%] w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_22px_#FBBF24] animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute top-[52%] left-[15%] w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_12px_#FDE68A] animate-pulse" style={{ animationDuration: "4s" }} />
      </div>

      {/* --- NAVBAR --- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b backdrop-blur-xl ${
          themeClass(
            "border-white/10 bg-[#07080B]/85 shadow-[0_4px_30px_rgba(0,0,0,0.8)]",
            "border-amber-900/10 bg-[#FFFFFF]/90 shadow-sm",
            "border-white/20 bg-black/95"
          )
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 sm:px-10 py-3.5">
          {/* LOGO & CLB NAME */}
          <Link to="/landing/ceo1983" className="flex items-center gap-3.5 group">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-serif font-black text-2xl shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 ${
                themeClass(
                  "border-[#C5A25D]/80 bg-[linear-gradient(145deg,#2A2722,#1A1815)] text-[#E8C986] shadow-[0_0_20px_rgba(232,201,134,0.3)]",
                  "border-[#C5A25D] bg-[linear-gradient(145deg,#FFFFFF,#F7F2EA)] text-[#B18B44] shadow-[0_4px_12px_rgba(177,139,68,0.18)]",
                  "border-white bg-zinc-900 text-white"
                )
              }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              M
            </div>
            <div className="flex flex-col text-left justify-center">
              <span
                className={`text-[10px] sm:text-[10.5px] font-bold tracking-[0.16em] uppercase transition-colors ${
                  themeClass("text-white/70 group-hover:text-white", "text-[#64748B] group-hover:text-[#0F172A]", "text-white/80")
                }`}
              >
                {t.navBadge}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[15px] sm:text-[17px] font-black tracking-tight uppercase leading-none transition-colors ${
                    themeClass(
                      "text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF7] via-[#E8DEC8] to-[#C5A25D]",
                      "text-[#0F172A] group-hover:text-[#B18B44]",
                      "text-white"
                    )
                  }`}
                >
                  CLB CEO 1983
                </span>
                <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border border-[#B18B44]/50 text-[#B18B44] bg-[#B18B44]/10 tracking-widest">
                  {t.navVip}
                </span>
              </div>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav
            className={`hidden xl:flex items-center gap-6 text-sm font-semibold tracking-tight ${
              themeClass("text-white/80", "text-[#334155]", "text-slate-200")
            }`}
          >
            <a href="#about" className="hover:text-[#C5A25D] transition-colors">
              {t.navAbout}
            </a>
            <a href="#matrix" className="hover:text-[#C5A25D] transition-colors">
              {t.navMatrix}
            </a>
            <a href="#ecosystem" className="hover:text-[#C5A25D] transition-colors">
              {t.navEcosystem}
            </a>
            <a href="#core-values" className="hover:text-[#C5A25D] transition-colors">
              {t.navCore}
            </a>
            <a href="#activities" className="hover:text-[#C5A25D] transition-colors">
              {t.navActivities}
            </a>
            <a href="#roadmap" className="hover:text-[#C5A25D] transition-colors">
              {t.navRoadmap}
            </a>
            <a href="#leadership" className="hover:text-[#C5A25D] transition-colors">
              {t.navLeadership}
            </a>
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3 sm:gap-4">
            <LangSwitcher themeMode={themeMode} />

            {/* 3-Mode Theme Switcher Capsule */}
            <div
              className={`flex items-center rounded-full p-1 border transition-colors duration-500 ${
                themeClass("border-white/15 bg-[#1F2026]/90", "border-slate-200 bg-[#E2E8F0]/60", "border-white/30 bg-zinc-900")
              }`}
            >
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  themeMode === "dark" ? "bg-[#353840] text-white shadow-md" : themeClass("text-white/60 hover:text-white", "text-slate-600 hover:text-black", "text-white/60")
                }`}
              >
                {t.modeDark}
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  themeMode === "light" ? "bg-white text-slate-900 shadow-md font-extrabold" : themeClass("text-white/60 hover:text-white", "text-slate-600 hover:text-black", "text-white/60")
                }`}
              >
                {t.modeLight}
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("contrast")}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  themeMode === "contrast"
                    ? "bg-white text-black font-extrabold shadow-md"
                    : themeClass("text-white/60 hover:text-white", "text-slate-600 hover:text-black", "text-slate-300")
                }`}
              >
                {t.modeContrast}
              </button>
            </div>

            <button
              onClick={handleJoinClick}
              className="shine-sweep hidden sm:inline-flex px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#141518] bg-[linear-gradient(135deg,#F7D896_0%,#E2B755_40%,#C49338_80%,#9A742F_100%)] shadow-[0_4px_20px_rgba(226,183,85,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              {t.navJoin}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO CONTENT --- */}
      <main id="about" className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 pt-10 lg:pt-16 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10">
        {/* CỘT TEXT (Bên trái: 55%) */}
        <div className="lg:w-[55%] text-left space-y-6">
          {/* HANOIBA Affiliation Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-colors duration-500 ${
              themeClass(
                "border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_20px_rgba(197,162,93,0.2)]",
                "border-[#C5A25D]/50 text-[#92400E] bg-[#FEF3C7]/80 shadow-xs",
                "border-white/40 text-white bg-white/10"
              )
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#E8C986]" />
            <span>{t.heroHanoiba}</span>
          </div>

          {/* TIÊU ĐỀ HERO MAJESTIC CÂN ĐỐI */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black tracking-tight leading-[1.12] uppercase transition-all duration-500 overflow-visible pb-1 ${
              themeClass(
                "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)]",
                "text-[#0F172A] drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
                "text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]"
              )
            }`}
          >
            <span className="block whitespace-normal sm:whitespace-nowrap">{t.heroTitle1}</span>
            <span className="block mt-1">
              <span className={themeClass("text-transparent bg-clip-text bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338]", "text-transparent bg-clip-text bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#92400E]", "text-white")}>
                {t.heroTitle2} {t.heroTitle3 ? t.heroTitle3 : ""}
              </span>
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg max-w-xl leading-relaxed font-normal transition-colors duration-500 ${
              themeClass("text-white/80", "text-[#475569]", "text-slate-200")
            }`}
          >
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleJoinClick}
              className={`shine-sweep px-8 py-4 rounded-full font-extrabold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl ${
                themeClass(
                  "bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] hover:from-[#FFF0C7] hover:to-[#E2B755] text-[#141518] shadow-[0_4px_25px_rgba(226,183,85,0.4)] hover:shadow-[0_6px_35px_rgba(226,183,85,0.6)]",
                  "bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white shadow-slate-900/20 hover:from-black hover:to-black",
                  "bg-white text-black font-extrabold shadow-lg"
                )
              }`}
            >
              {t.heroJoinBtn}
            </button>
            <Link
              to="/m"
              search={{ slug: "ceo1983" }}
              className={`px-7 py-4 rounded-full font-bold text-sm sm:text-base border transition-all inline-flex items-center gap-2.5 hover:scale-105 ${
                themeClass(
                  "border-[#C5A25D]/50 bg-[#13151D]/80 text-white hover:bg-white/10 backdrop-blur-md shadow-md hover:border-[#E8C986]",
                  "border-slate-300 bg-white text-[#0F172A] hover:bg-slate-50 shadow-xs",
                  "border-white/40 text-white hover:bg-white/10"
                )
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#E8C986]" />
              <span>{t.heroOpenApp}</span>
            </Link>
          </div>
        </div>

        {/* CỘT THẺ VIP 3D (Bên phải: 45% trên bệ Mica kính mờ phát sáng) */}
        <div className="lg:w-[45%] flex flex-col items-center justify-center relative pt-4" style={{ perspective: "1400px" }}>
          <div className="relative w-[440px] max-w-full flex flex-col items-center">
            {/* Bệ đỡ Mica tầng đáy với ánh sáng tỏa ra */}
            <div
              className={`absolute -bottom-10 w-[490px] max-w-[112%] h-[70px] rounded-3xl backdrop-blur-2xl border transition-all duration-500 ${
                themeClass(
                  "bg-gradient-to-b from-white/10 to-white/5 border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(197,162,93,0.25)]",
                  "bg-gradient-to-b from-slate-900/5 to-slate-900/10 border-amber-900/10 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_30px_rgba(180,83,9,0.1)]",
                  "bg-zinc-900 border-white/20"
                )
              }`}
            />
            {/* Bệ đỡ Mica tầng trên */}
            <div
              className={`absolute -bottom-4 w-[450px] max-w-[104%] h-[40px] rounded-t-2xl backdrop-blur-3xl border-t border-x transition-all duration-500 ${
                themeClass(
                  "bg-gradient-to-b from-white/15 to-white/5 border-t-amber-300/40 border-x-white/20 shadow-inner",
                  "bg-gradient-to-b from-white/90 to-white/50 border-t-[#C5A25D]/50 border-x-slate-200 shadow-sm",
                  "bg-zinc-800 border-white/20"
                )
              }`}
            />

            {/* Thẻ Titanium Black & Gold 3D VIP Pass (Tương tác Lật 2 Mặt) */}
            <div
              className="shine-sweep relative z-10 w-[440px] max-w-full h-[270px] rounded-2xl p-6.5 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(232,201,134,0.35)] border border-[#E8C986]/70 cursor-pointer group text-left flex flex-col justify-between transition-all duration-500 select-none hover:scale-[1.02] hover:shadow-[0_35px_80px_rgba(232,201,134,0.45)]"
              style={{
                background: "radial-gradient(ellipse at 20% 20%, #222634 0%, #12141C 55%, #08090C 100%)",
                transformStyle: "preserve-3d",
              }}
              onClick={() => setCardFlipped(!cardFlipped)}
            >
              {/* Vệt xước kim loại chải & viền vát 3D */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(232,201,134,0.18)_0%,transparent_50%)] rounded-2xl pointer-events-none" />

              {!cardFlipped ? (
                /* MẶT TRƯỚC (FRONT - BESPOKE TITANIUM BLACK & GOLD) */
                <>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border border-[#E8C986]/60 flex items-center justify-center text-lg bg-gradient-to-br from-[#3D3528] to-[#1F1B14] shadow-md shadow-amber-900/30">
                        👑
                      </div>
                      <div>
                        <p className="text-[#9DA3AE] text-[10.5px] font-bold tracking-wider uppercase font-mono">CLB CEO 1983</p>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2D6] via-[#E8C986] to-[#C49338] text-xs font-black tracking-widest uppercase">{t.cardVipPass}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 border border-[#E8C986]/50 rounded-full text-[#E8C986] text-[10.5px] font-black flex items-center gap-1.5 bg-[#E8C986]/10 backdrop-blur-md shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-[#E8C986] fill-current animate-pulse" />
                      <span>{t.cardNfcTouch}</span>
                    </div>
                  </div>

                  {/* EMV Chip & Details */}
                  <div className="my-auto relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[#A1A1AA] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                        {t.cardExecMember}
                      </p>
                      <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FFF3D6] to-[#E8C986] text-2xl font-black uppercase tracking-wide drop-shadow-sm">
                        {t.cardMemberName}
                      </h3>
                      <p className="text-[#D4AF37] text-[11px] font-mono mt-1 font-bold tracking-wider">{t.cardIdLabel}</p>
                    </div>

                    {/* 3D Gold Contactless EMV Smart Chip */}
                    <div className="w-12 h-9 rounded-lg border border-[#E8C986] bg-gradient-to-br from-[#FFE7A3] via-[#D8B282] to-[#8C6A28] p-1 flex flex-col justify-between shadow-md shrink-0">
                      <div className="w-full h-1.5 border-b border-black/30 flex justify-between">
                        <div className="w-2 h-full border-r border-black/30" />
                        <div className="w-2 h-full border-l border-black/30" />
                      </div>
                      <div className="w-full h-1.5 border-t border-black/30 flex justify-between">
                        <div className="w-2 h-full border-r border-black/30" />
                        <div className="w-2 h-full border-l border-black/30" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[#9DA3AE] text-[10.5px] font-semibold relative z-10">
                    <span className="flex items-center gap-1.5 text-white/90">
                      <Wallet className="w-3.5 h-3.5 text-[#E8C986]" />
                      <span>{t.cardWallet}</span>
                    </span>
                    <span className="font-mono text-[9.5px] tracking-wider bg-[#E8C986]/15 border border-[#E8C986]/30 px-2.5 py-0.5 rounded-full text-[#E8C986] font-bold">
                      {t.cardTapHint}
                    </span>
                  </div>
                </>
              ) : (
                /* MẶT SAU (BACK - CHIP & SECURITY QR) */
                <>
                  <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#E8C986]" />
                      <span className="text-[#E8C986] font-black text-[11px] tracking-wide uppercase font-mono">
                        HANOIBA AFFILIATION SEAL
                      </span>
                    </div>
                    <span className="text-[#9DA3AE] font-mono text-[9px]">ENCRYPTED NFC SLIX2</span>
                  </div>

                  {/* Magnetic Stripe */}
                  <div className="w-full h-8 bg-gradient-to-r from-[#18181B] via-[#27272A] to-[#18181B] border-y border-white/10 -mx-6.5 my-auto flex items-center px-6">
                    <span className="text-[9px] font-mono text-white/40 tracking-[0.3em]">||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="bg-white p-2 rounded-xl shadow-md border border-[#E8C986]/50 shrink-0">
                      <div className="w-16 h-16 grid grid-cols-4 grid-rows-4 gap-1 p-1 bg-black rounded">
                        <div className="bg-white rounded-xs" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-transparent" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-transparent" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-transparent" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-transparent" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-white rounded-xs" />
                        <div className="bg-transparent" />
                        <div className="bg-white rounded-xs" />
                      </div>
                    </div>
                    <div className="text-left text-white flex-1">
                      <p className="text-[11.5px] font-black uppercase text-[#E8C986]">{t.cardMemberAlt}</p>
                      <p className="text-[10px] text-white/80 font-medium mt-0.5">
                        Phó Chủ Tịch Chiến Lược & Công Nghệ
                      </p>
                      <p className="text-[9px] font-mono text-white/50 mt-1.5">
                        NXP ICODE SLIX2 • 13.56MHz NFC
                      </p>
                      <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full mt-1.5 shadow-sm">
                        ✓ VERIFIED C-LEVEL
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between items-center text-white/60 text-[9.5px] font-bold relative z-10">
                    <span>ViOne Digital Enterprise ID Pass</span>
                    <span className="font-mono text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full text-white font-bold">
                      {t.cardTapHint}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <p
            className={`text-xs mt-12 flex items-center gap-1.5 font-medium ${
              themeClass("text-white/70", "text-slate-500", "text-slate-400")
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8C986]" />
            <span>{t.cardPedestalDesc}</span>
          </p>
        </div>
      </main>

      {/* --- STATS SECTION (BENTO TICKER) --- */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { num: t.stat1Num, text: t.stat1Title, desc: t.stat1Desc, icon: <Users className="w-5 h-5 text-[#C5A25D]" /> },
            { num: t.stat2Num, text: t.stat2Title, desc: t.stat2Desc, icon: <TrendingUp className="w-5 h-5 text-[#C5A25D]" /> },
            { num: t.stat3Num, text: t.stat3Title, desc: t.stat3Desc, icon: <BarChart3 className="w-5 h-5 text-[#C5A25D]" /> },
            { num: t.stat4Num, text: t.stat4Title, desc: t.stat4Desc, icon: <BadgeCheck className="w-5 h-5 text-[#C5A25D]" /> },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 ${
                themeClass(
                  "bg-[#11131B]/90 border-white/10 shadow-xl hover:border-[#C5A25D]/60 hover:shadow-[0_10px_30px_rgba(197,162,93,0.18)]",
                  "bg-white border-amber-900/15 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-amber-700/30 hover:shadow-md",
                  "bg-zinc-900 border-white/20"
                )
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-[#C5A25D]/10 border border-[#C5A25D]/20">
                  {stat.icon}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-[#C5A25D] bg-[#C5A25D]/10 px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] leading-none mb-1.5">
                {stat.num}
              </h3>
              <p className={`text-xs font-bold ${themeClass("text-white/95", "text-[#0F172A]", "text-white")}`}>
                {stat.text}
              </p>
              <p className={`text-[11px] mt-1 ${themeClass("text-white/60", "text-slate-500", "text-slate-400")}`}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================
          SECTION 2: STRATEGIC TRANSFORMATION MATRIX
          ======================================= */}
      <section
        id="matrix"
        className={`py-24 px-6 md:px-16 border-t relative overflow-hidden transition-colors ${
          themeClass("bg-[#0A0B0F] border-white/5", "bg-[#FAF8F5] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A25D]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A25D]/40 to-transparent" />

        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/landing/ceo1983-mastermind-bg.jpg"
            alt="Matrix Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark ? "opacity-35 mix-blend-luminosity" : isContrast ? "opacity-20" : "opacity-15 mix-blend-multiply"
            }`}
          />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[750px] h-[400px] bg-amber-500/15 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[650px] h-[400px] bg-amber-700/10 rounded-full blur-[170px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
              <span>{t.matrixTag}</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-[#0F172A]",
                  "text-white"
                )
              }`}
            >
              {t.matrixTitle1} <br />
              {t.matrixTitle2}
            </h2>
            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed ${
                themeClass("text-white/70", "text-[#475569]", "text-slate-300")
              }`}
            >
              {t.matrixDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Flame className="w-6 h-6 text-[#C5A25D]" />,
                tag: "C-LEVEL SOLITUDE",
                before: t.mItem1B,
                after: t.mItem1A,
              },
              {
                icon: <Cpu className="w-6 h-6 text-[#C5A25D]" />,
                tag: "NETWORKING FATIGUE",
                before: t.mItem2B,
                after: t.mItem2A,
              },
              {
                icon: <Network className="w-6 h-6 text-[#C5A25D]" />,
                tag: "SUPPLY CHAIN RISK",
                before: t.mItem3B,
                after: t.mItem3A,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                  themeClass(
                    "bg-[#13151D]/90 border-white/10 shadow-2xl hover:border-[#C5A25D]/50 backdrop-blur-md",
                    "bg-white border-amber-900/15 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-amber-700/30",
                    "bg-zinc-950 border-white/20"
                  )
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-[#C5A25D]/15 border border-[#C5A25D]/30">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10">
                      {card.tag}
                    </span>
                  </div>

                  {/* Common Problem */}
                  <div className={`p-4 rounded-2xl border mb-4 ${themeClass("bg-rose-950/20 border-rose-500/20 text-slate-300", "bg-rose-50 border-rose-200 text-rose-900", "bg-zinc-900 border-white/10 text-white")}`}>
                    <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase text-rose-400 mb-1">
                      <X className="w-3.5 h-3.5" />
                      <span>{t.matrixColBefore}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{card.before}</p>
                  </div>

                  {/* CEO 1983 Exclusive Advantage */}
                  <div className={`p-4 rounded-2xl border ${themeClass("bg-emerald-950/25 border-emerald-500/30 text-[#F8F7F3]", "bg-amber-50 border-amber-200 text-slate-900", "bg-zinc-900 border-[#C5A25D]/40 text-white")}`}>
                    <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase text-[#E8C986] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.matrixColAfter}</span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">{card.after}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#C5A25D]">
                  <span>Đặc quyền độc bản 1983</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 3: HỆ SINH THÁI 4 TRỤ CỘT (BENTO GRID)
          ======================================= */}
      <section
        id="ecosystem"
        className={`py-24 px-6 md:px-16 border-t relative overflow-hidden transition-colors ${
          themeClass("bg-[#07080B] border-white/5", "bg-[#FFFFFF] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/landing/business-ecosystem-bg.jpg"
            alt="Ecosystem Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark ? "opacity-30 mix-blend-screen" : isContrast ? "opacity-15" : "opacity-12 mix-blend-multiply"
            }`}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-amber-500/12 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
              <span>{t.ecoTag}</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-[#0F172A]",
                  "text-white"
                )
              }`}
            >
              {t.ecoTitle1} <br />
              {t.ecoTitle2}
            </h2>
            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed ${
                themeClass("text-white/70", "text-[#475569]", "text-slate-300")
              }`}
            >
              {t.ecoDesc}
            </p>
          </div>

          {/* BENTO GRID 4 TRỤ CỘT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Pillar 1: Mastermind & Business Tours (Col-Span 7) */}
            <div
              className={`md:col-span-7 p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:border-[#C5A25D]/50 ${
                themeClass(
                  "bg-[#13151D]/90 border-white/10 shadow-2xl backdrop-blur-md",
                  "bg-[#FAF8F5] border-amber-900/15 shadow-xl",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A25D]/20 border border-[#C5A25D] flex items-center justify-center text-[#E8C986] font-bold">
                      01
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E8C986]">
                      {t.p1Tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-[#E8C986] px-2.5 py-1 rounded-full border border-[#C5A25D]/30">
                    C-LEVEL CLOSED-DOOR
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  {t.p1Title}
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-[#475569]", "text-slate-300")
                  }`}
                >
                  {t.p1Desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-white/10">
                <div className={`p-4 rounded-xl border ${themeClass("bg-white/5 border-white/10", "bg-white border-amber-900/10 shadow-xs", "bg-zinc-900 border-white/20")}`}>
                  <p className="text-xs font-bold text-[#E8C986]">{t.p1Item1}</p>
                  <p className={`text-[11px] mt-0.5 ${themeClass("text-slate-400", "text-slate-500", "text-slate-400")}`}>{t.p1Sub1}</p>
                </div>
                <div className={`p-4 rounded-xl border ${themeClass("bg-white/5 border-white/10", "bg-white border-amber-900/10 shadow-xs", "bg-zinc-900 border-white/20")}`}>
                  <p className="text-xs font-bold text-[#E8C986]">{t.p1Item2}</p>
                  <p className={`text-[11px] mt-0.5 ${themeClass("text-slate-400", "text-slate-500", "text-slate-400")}`}>{t.p1Sub2}</p>
                </div>
              </div>
            </div>

            {/* Pillar 2: Closed-Loop B2B Supply Chain (Col-Span 5) */}
            <div
              className={`md:col-span-5 p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:border-[#C5A25D]/50 ${
                themeClass(
                  "bg-[#13151D]/90 border-white/10 shadow-2xl backdrop-blur-md",
                  "bg-[#FAF8F5] border-amber-900/15 shadow-xl",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A25D]/20 border border-[#C5A25D] flex items-center justify-center text-[#E8C986] font-bold">
                      02
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E8C986]">
                      {t.p2Tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  {t.p2Title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-[#475569]", "text-slate-300")
                  }`}
                >
                  {t.p2Desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
                <div className={`p-4 rounded-xl border ${themeClass("bg-white/5 border-white/10", "bg-white border-amber-900/10 shadow-xs", "bg-zinc-900 border-white/20")}`}>
                  <p className="text-xs font-bold text-[#E8C986]">{t.p2Item1}</p>
                  <p className={`text-[11px] mt-0.5 ${themeClass("text-slate-400", "text-slate-500", "text-slate-400")}`}>{t.p2Sub1}</p>
                </div>
                <div className={`p-4 rounded-xl border ${themeClass("bg-white/5 border-white/10", "bg-white border-amber-900/10 shadow-xs", "bg-zinc-900 border-white/20")}`}>
                  <p className="text-xs font-bold text-[#E8C986]">{t.p2Item2}</p>
                  <p className={`text-[11px] mt-0.5 ${themeClass("text-slate-400", "text-slate-500", "text-slate-400")}`}>{t.p2Sub2}</p>
                </div>
              </div>
            </div>

            {/* Pillar 3: Titanium NFC VIP Pass (Col-Span 5) */}
            <div
              className={`md:col-span-5 p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:border-[#C5A25D]/50 ${
                themeClass(
                  "bg-[#13151D]/90 border-white/10 shadow-2xl backdrop-blur-md",
                  "bg-[#FAF8F5] border-amber-900/15 shadow-xl",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A25D]/20 border border-[#C5A25D] flex items-center justify-center text-[#E8C986] font-bold">
                      03
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E8C986]">
                      {t.p3Tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  {t.p3Title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-[#475569]", "text-slate-300")
                  }`}
                >
                  {t.p3Desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p3Badge1}
                </span>
                <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p3Badge2}
                </span>
                <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p3Badge3}
                </span>
              </div>
            </div>

            {/* Pillar 4: AI Matchmaking & Encrypted Deal Room (Col-Span 7) */}
            <div
              className={`md:col-span-7 p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:border-[#C5A25D]/50 ${
                themeClass(
                  "bg-[#13151D]/90 border-white/10 shadow-2xl backdrop-blur-md",
                  "bg-[#FAF8F5] border-amber-900/15 shadow-xl",
                  "bg-zinc-950 border-white/20 text-white"
                )
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A25D]/20 border border-[#C5A25D] flex items-center justify-center text-[#E8C986] font-bold">
                      04
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E8C986]">
                      {t.p4Tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    AI POWERED
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">
                  {t.p4Title}
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    themeClass("text-white/70", "text-[#475569]", "text-slate-300")
                  }`}
                >
                  {t.p4Desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p4Badge1}
                </span>
                <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p4Badge2}
                </span>
                <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${themeClass("border-[#C5A25D]/40 text-[#E8C986] bg-[#C5A25D]/10", "border-[#B18B44]/40 text-[#92400E] bg-[#FEF3C7]/60", "border-white text-white")}`}>
                  {t.p4Badge3}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 4: CORE VALUES
          ======================================= */}
      <section
        id="core-values"
        className={`py-24 px-6 md:px-16 border-t relative overflow-hidden transition-colors ${
          themeClass("bg-[#0A0B0F] border-white/5", "bg-[#FAF8F5] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/landing/ceo1983-values-bg.jpg"
            alt="Core Values Background"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark ? "opacity-25 mix-blend-luminosity" : isContrast ? "opacity-15" : "opacity-10 mix-blend-multiply"
            }`}
          />
          <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
              <span>{t.coreTag}</span>
            </div>
            <h2
              className={`text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-[#0F172A]",
                  "text-white"
                )
              }`}
            >
              {t.coreTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {[
              { num: "01", title: t.core1Title, desc: t.core1Desc },
              { num: "02", title: t.core2Title, desc: t.core2Desc },
              { num: "03", title: t.core3Title, desc: t.core3Desc },
              { num: "04", title: t.core4Title, desc: t.core4Desc },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start border-t border-white/10 pt-6">
                <span className="text-5xl lg:text-6xl font-black text-[#C5A25D]/40 font-mono tracking-tighter shrink-0">
                  {item.num}
                </span>
                <div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      themeClass("text-[#F8F7F3]", "text-[#0F172A]", "text-white")
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`leading-relaxed text-base font-normal ${
                      themeClass("text-[#94A3B8]", "text-[#475569]", "text-slate-300")
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 5: EXECUTIVE ACTIVITIES & TOURS
          ======================================= */}
      <section
        id="activities"
        className={`py-24 px-6 md:px-16 transition-colors border-t relative overflow-hidden ${
          themeClass("bg-[#07080B] border-white/5", "bg-[#FFFFFF] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/landing/business-hero-stage.jpg"
            alt="Activities Backdrop"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark ? "opacity-20 mix-blend-screen" : isContrast ? "opacity-10" : "opacity-8 mix-blend-multiply"
            }`}
          />
          <div className="absolute top-1/3 left-0 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-left mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
              <span>{t.actTag}</span>
            </div>
            <h2
              className={`text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-[#0F172A]",
                  "text-white"
                )
              }`}
            >
              {t.actTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Large Feature */}
            <div className="group relative h-[480px] rounded-3xl overflow-hidden bg-[#13151D] shadow-2xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80"
                alt="Shark Phu Talkshow"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 p-8 sm:p-10 z-20 text-left">
                <span className="px-3 py-1 bg-[#C5A25D] text-black text-xs font-black rounded mb-4 inline-block">
                  {t.act1Tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-snug">
                  {t.act1Title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {t.act1Desc}
                </p>
              </div>
            </div>

            {/* 2 Small Features */}
            <div className="flex flex-col gap-8">
              <div className="group relative h-[224px] rounded-3xl overflow-hidden bg-[#13151D] shadow-xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/50 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80"
                  alt="Flexfit & AMG Site Visit"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 text-left">
                  <span className="text-[11px] font-bold text-[#E8C986] uppercase tracking-wider block mb-1">
                    {t.act2Tag}
                  </span>
                  <h3 className="text-xl font-bold text-white">{t.act2Title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{t.act2Desc}</p>
                </div>
              </div>

              <div className="group relative h-[224px] rounded-3xl overflow-hidden bg-[#13151D] shadow-xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/50 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                  alt="Tax and Finance Forum"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 text-left">
                  <span className="text-[11px] font-bold text-[#E8C986] uppercase tracking-wider block mb-1">
                    {t.act3Tag}
                  </span>
                  <h3 className="text-xl font-bold text-white">{t.act3Title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{t.act3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 6: 4-STEP ADMISSION ROADMAP
          ======================================= */}
      <section
        id="roadmap"
        className={`py-24 px-6 md:px-16 border-t relative overflow-hidden transition-colors ${
          themeClass("bg-[#0A0B0F] border-white/5", "bg-[#FAF8F5] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
              <span>{t.roadmapTag}</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.16] ${
                themeClass(
                  "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                  "text-[#0F172A]",
                  "text-white"
                )
              }`}
            >
              {t.roadmapTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: "01", icon: <FileCheck className="w-6 h-6 text-[#C5A25D]" />, title: t.roadmap1Title, desc: t.roadmap1Desc },
              { step: "02", icon: <ShieldCheck className="w-6 h-6 text-[#C5A25D]" />, title: t.roadmap2Title, desc: t.roadmap2Desc },
              { step: "03", icon: <Award className="w-6 h-6 text-[#C5A25D]" />, title: t.roadmap3Title, desc: t.roadmap3Desc },
              { step: "04", icon: <Network className="w-6 h-6 text-[#C5A25D]" />, title: t.roadmap4Title, desc: t.roadmap4Desc },
            ].map((st, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 relative ${
                  themeClass(
                    "bg-[#13151D]/90 border-white/10 shadow-xl hover:border-[#C5A25D]/50 backdrop-blur-md",
                    "bg-white border-amber-900/15 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-amber-700/30",
                    "bg-zinc-950 border-white/20"
                  )
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black font-mono text-[#C5A25D]/60">{st.step}</span>
                    <div className="p-2.5 rounded-xl bg-[#C5A25D]/10 border border-[#C5A25D]/25">
                      {st.icon}
                    </div>
                  </div>
                  <h3 className={`text-lg font-black mb-2 ${themeClass("text-[#F8F7F3]", "text-[#0F172A]", "text-white")}`}>
                    {st.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${themeClass("text-white/70", "text-[#475569]", "text-slate-300")}`}>
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================
          SECTION 7: LEADERSHIP & BOARD
          ======================================= */}
      <section
        id="leadership"
        className={`py-24 px-6 md:px-16 text-center border-t relative overflow-hidden transition-colors ${
          themeClass("bg-[#07080B] border-white/5", "bg-[#FAF8F5] border-slate-200", "bg-black border-white/20")
        }`}
      >
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/landing/business-cta-bg.jpg"
            alt="Leadership Backdrop"
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark ? "opacity-25 mix-blend-screen" : isContrast ? "opacity-12" : "opacity-10 mix-blend-multiply"
            }`}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-amber-500/10 rounded-full blur-[160px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
            <span>{t.leadTag}</span>
          </div>
          <h2
            className={`text-3xl md:text-5xl font-black mb-16 uppercase tracking-tight leading-[1.16] ${
              themeClass(
                "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                "text-[#0F172A]",
                "text-white"
              )
            }`}
          >
            {t.leadTitle}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-24">
            {leaders.map((person, idx) => (
              <div key={idx} className="flex flex-col items-center group text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-4 border-2 border-white/10 ring-2 ring-[#C5A25D]/40 overflow-hidden group-hover:ring-[#C5A25D] transition-all duration-300 shadow-xl">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h4
                  className={`font-black text-base sm:text-lg group-hover:text-[#C5A25D] transition-colors leading-snug ${
                    themeClass("text-[#F8F7F3]", "text-[#0F172A]", "text-white")
                  }`}
                >
                  {person.name}
                </h4>
                <p className="text-[#C5A25D] text-xs font-bold mt-1 leading-tight">{person.role}</p>
                <p
                  className={`text-[11px] mt-1 max-w-[170px] ${
                    themeClass("text-[#94A3B8]", "text-[#64748B]", "text-slate-400")
                  }`}
                >
                  {person.company}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action Box (Luxury Ingot Card) */}
          <div
            className={`p-10 sm:p-16 rounded-3xl border text-center relative overflow-hidden backdrop-blur-xl ${
              themeClass(
                "bg-gradient-to-b from-[#181A24] to-[#0F1017] border-[#C5A25D]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
                "bg-white border-amber-900/15 shadow-[0_20px_60px_rgba(0,0,0,0.08)]",
                "bg-zinc-950 border-white/30"
              )
            }`}
          >
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase font-mono border border-[#C5A25D]/50 text-[#E8C986] bg-[#C5A25D]/15 backdrop-blur-md shadow-[0_0_15px_rgba(197,162,93,0.15)] mb-3">
                <span>{t.ctaBoxTag}</span>
              </div>
              <h2
                className={`text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight uppercase ${
                  themeClass(
                    "text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F3E8_25%,#E5D4B2_55%,#BCA16B_85%,#876F3E_100%)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
                    "text-[#0F172A]",
                    "text-white"
                  )
                }`}
              >
                {t.ctaBoxTitle1} <br />
                <span className="text-transparent bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] bg-clip-text">
                  {t.ctaBoxTitle2}
                </span>
              </h2>
              <p
                className={`text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed ${
                  themeClass("text-white/70", "text-[#475569]", "text-slate-300")
                }`}
              >
                {t.ctaBoxDesc}
              </p>

              <button
                onClick={handleJoinClick}
                className="shine-sweep px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] hover:from-[#FFF0C7] hover:to-[#E2B755] text-slate-950 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_30px_rgba(226,183,85,0.4)] cursor-pointer inline-flex items-center gap-2"
              >
                <span>{t.ctaBoxBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        className={`py-12 px-6 sm:px-8 border-t text-center text-xs transition-colors ${
          themeClass("bg-[#050608] border-white/5 text-white/50", "bg-[#F1F5F9] border-slate-200 text-slate-600", "bg-black border-white/20 text-slate-400")
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-[#C5A25D] flex items-center justify-center font-serif text-[#C5A25D] font-bold text-xs">
              👑
            </div>
            <span className="font-bold">{t.navBadge} CLB CEO 1983</span>
          </div>
          <div>
            © {new Date().getFullYear()} {t.footerCopy}
          </div>
        </div>
      </footer>

      {/* --- APPLICATION MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl text-left border ${
              themeClass("bg-[#14151C] border-[#C5A25D]/40 text-white", "bg-white border-amber-900/20 text-[#0F172A]", "bg-zinc-950 border-white text-white")
            }`}
          >
            <button
              onClick={() => setModalOpen(false)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
                themeClass("text-slate-400 hover:text-white hover:bg-white/10", "text-slate-500 hover:text-black hover:bg-slate-100", "text-white")
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">{t.formSuccessTitle}</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-xs">{t.formSuccessDesc}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-[#C5A25D]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A25D]">
                    CEO 1983 VIP ADMISSION
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-1">{t.modalTitle}</h3>
                <p className={`text-xs mb-6 ${themeClass("text-slate-400", "text-slate-500", "text-slate-400")}`}>{t.modalSubtitle}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">{t.formName}</label>
                    <input
                      required
                      type="text"
                      placeholder={t.formNamePlh}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        themeClass(
                          "bg-white/5 border-white/15 focus:border-[#C5A25D] text-white",
                          "bg-slate-50 border-slate-200 focus:border-[#B18B44] text-slate-900"
                        )
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">{t.formPhone}</label>
                    <input
                      required
                      type="tel"
                      placeholder={t.formPhonePlh}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        themeClass(
                          "bg-white/5 border-white/15 focus:border-[#C5A25D] text-white",
                          "bg-slate-50 border-slate-200 focus:border-[#B18B44] text-slate-900"
                        )
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">{t.formCompany}</label>
                    <input
                      required
                      type="text"
                      placeholder={t.formCompanyPlh}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        themeClass(
                          "bg-white/5 border-white/15 focus:border-[#C5A25D] text-white",
                          "bg-slate-50 border-slate-200 focus:border-[#B18B44] text-slate-900"
                        )
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{t.formRevenue}</label>
                      <select
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          themeClass(
                            "bg-[#1C1D24] border-white/15 focus:border-[#C5A25D] text-white",
                            "bg-slate-50 border-slate-200 focus:border-[#B18B44] text-slate-900"
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
                      <label className="block text-xs font-bold mb-1">{t.formIndustry}</label>
                      <input
                        required
                        type="text"
                        placeholder={t.formIndustryPlh}
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          themeClass(
                            "bg-white/5 border-white/15 focus:border-[#C5A25D] text-white",
                            "bg-slate-50 border-slate-200 focus:border-[#B18B44] text-slate-900"
                          )
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    disabled={submitting}
                    type="submit"
                    className="shine-sweep w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-4"
                  >
                    {submitting ? t.formSubmitting : t.formSubmit}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
