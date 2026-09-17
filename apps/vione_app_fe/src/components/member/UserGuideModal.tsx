import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BookOpen,
  FileText,
  CreditCard,
  Nfc,
  MessageSquare,
  Users,
  QrCode,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Hand,
  ShoppingBag,
  Vote,
  Lock,
  Filter,
  Calendar,
  Award,
  Building2,
  Zap,
} from "lucide-react";

export interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: GuideTabKey;
}

export type GuideTabKey =
  | "auth"
  | "onehand"
  | "nfc"
  | "chat"
  | "privacy"
  | "realtime_connect"
  | "directory"
  | "committees"
  | "events"
  | "documents"
  | "meetings"
  | "marketplace"
  | "fee"
  | "voting"
  | "sponsors"
  | "security";

interface GuideTabItem {
  id: GuideTabKey;
  label: string;
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  image: string;
  steps: { title: string; desc: string; tip?: string }[];
  proTip: string;
}

const GUIDE_DATA: GuideTabItem[] = [
  {
    id: "auth",
    label: "Đăng nhập & Thẻ số",
    icon: ShieldCheck,
    title: "1. ĐĂNG NHẬP & KÍCH HOẠT QUYỀN LỢI THẺ HỘI VIÊN",
    subtitle: "Xác thực danh tính doanh nhân chính thức và kích hoạt thẻ điện tử",
    image: "/docs/images/demo_auth_card.svg",
    steps: [
      {
        title: "Bước 1: Truy cập ứng dụng và nhập thông tin định danh",
        desc: "Mở đường dẫn /association/login trên trình duyệt Safari (iOS) hoặc Chrome (Android/PC). Nhập Số điện thoại hoặc Mã hội viên (VD: 098.333.1983 hoặc M1983-007) đã được Ban Thư Ký CLB phê duyệt.",
        tip: "Nếu chưa có mật khẩu, chọn 'Quên mật khẩu' để nhận mã xác thực OTP qua tin nhắn SMS.",
      },
      {
        title: "Bước 2: Xác thực & Kích hoạt Thẻ hội viên số",
        desc: "Hệ thống tự động liên kết dữ liệu CRM của CLB Doanh Nhân CEO 1983, cấp mã QR định danh và huy hiệu 'Hội viên chính thức' bảo mật cao.",
      },
      {
        title: "Bước 3: Cài đặt PWA lên màn hình chính điện thoại",
        desc: "Tại trang cá nhân, bấm 'Cài đặt ứng dụng lên màn hình chính'. Trên iPhone chọn nút Chia sẻ (Share) > 'Thêm vào MH chính (Add to Home Screen)'. Trên Android chọn menu 3 chấm > 'Cài đặt ứng dụng'.",
        tip: "Ứng dụng sẽ hoạt động mượt mà như app tải từ App Store / Google Play mà không tốn dung lượng máy.",
      },
    ],
    proTip: "Bạn có thể đăng nhập đồng thời trên cả điện thoại cá nhân và máy tính để quản trị giao thương 24/7.",
  },
  {
    id: "onehand",
    label: "Thao tác 1 tay",
    icon: Hand,
    title: "2. ĐIỀU HƯỚNG THAO TÁC 1 TAY DYNAMIC & REACHABILITY",
    subtitle: "Tối ưu hóa công thái học kéo nửa màn hình không cần nút ảo rườm rà",
    image: "/docs/images/demo_onehand.svg",
    steps: [
      {
        title: "Bước 1: Kéo nửa màn hình xuống (Chế độ Reachability)",
        desc: "Khi cầm điện thoại bằng 1 tay, vuốt trượt từ đỉnh màn hình xuống: toàn bộ nửa trên màn hình (thanh tìm kiếm, tiêu đề, các nút bộ lọc) sẽ trượt xuống 35vh vừa vặn trong tầm với tự nhiên của ngón tay cái.",
        tip: "Chạm vào vùng trống mờ phía trên để tự động đưa màn hình trở lại bình thường.",
      },
      {
        title: "Bước 2: Vuốt mép trái màn hình để quay lại (Edge Swipe Back)",
        desc: "Dùng ngón tay cái vuốt từ mép trái màn hình sang phải (khoảng cách 40px) để lập tức quay lại trang trước đó mà không cần với tay chạm nút Back ở góc trên cùng.",
      },
      {
        title: "Bước 3: Vuốt ngang chuyển đổi Tab linh hoạt",
        desc: "Vuốt ngang màn hình sang trái hoặc phải để chuyển qua lại giữa các mục Bảng tin ↔ Sự kiện ↔ Danh bạ ↔ Tin nhắn ↔ Trang cá nhân kèm hiệu ứng chỉ báo cử chỉ co giãn động.",
      },
    ],
    proTip: "Hệ thống tích hợp phản hồi rung Haptic nhẹ êm ái khi hoàn tất cử chỉ, giúp bạn tự tin thao tác mà không cần nhìn nút.",
  },
  {
    id: "nfc",
    label: "Danh thiếp & NFC",
    icon: Nfc,
    title: "3. DANH THIẾP ĐIỆN TỬ & CÔNG NGHỆ CHẠM THẺ NFC 1-CHẠM",
    subtitle: "Trao đổi thông tin doanh nghiệp đẳng cấp trong 1 giây không cần chạm",
    image: "/docs/images/demo_nfc_card.svg",
    steps: [
      {
        title: "Bước 1: Chạm mặt lưng thẻ vào điện thoại đối tác",
        desc: "Mỗi hội viên được cấp 01 Thẻ thông minh NFC CEO 1983 kim loại sang trọng. Chỉ cần chạm thẻ vào phần đầu mặt lưng iPhone (gần camera) hoặc giữa lưng máy Android.",
        tip: "Không cần tải bất kỳ ứng dụng nào, màn hình đối tác sẽ tự động bật pop-up thông tin danh thiếp của bạn.",
      },
      {
        title: "Bước 2: Đối tác bấm 'Lưu danh bạ (Save Contact)'",
        desc: "Toàn bộ thông tin Họ tên, Chức vụ, Công ty, Số điện thoại, Email, Website, Địa chỉ văn phòng và Mạng xã hội sẽ được lưu ngay vào danh bạ điện thoại đối tác chuẩn vCard (.vcf).",
      },
      {
        title: "Bước 3: Quét mã QR cá nhân dự phòng",
        desc: "Với các dòng điện thoại đời cũ chưa hỗ trợ NFC, mở tab 'Thẻ hội viên' trên App và đưa mã QR cho đối tác quét bằng Camera hoặc Zalo để xem profile tức thì.",
      },
    ],
    proTip: "Nếu làm thất lạc thẻ vật lý, bạn có thể bấm 'Khóa thẻ từ xa' ngay trong tab Cài đặt để bảo đảm an toàn tuyệt đối.",
  },
  {
    id: "chat",
    label: "Tin nhắn & Chờ",
    icon: MessageSquare,
    title: "4. TIN NHẮN CHUẨN MESSENGER & PHÂN LOẠI TIN NHẮN CHỜ",
    subtitle: "Trò chuyện chuẩn Facebook Messenger, kiểm soát tin người lạ & thu hồi tin nhắn",
    image: "/docs/images/demo_messenger_chat.svg",
    steps: [
      {
        title: "Bước 1: Phân loại Hộp thư chính & Tin nhắn chờ (Message Requests)",
        desc: "Các hội viên đã kết nối chính thức sẽ hiển thị tại tab 'Hộp thư'. Nếu người lạ (chưa kết nối) gửi tin, tin nhắn sẽ tự động chuyển vào mục 'Tin nhắn chờ' để tránh làm phiền.",
        tip: "Mục tin nhắn chờ sẽ thông báo rõ: 'Bạn không có tin nhắn chờ' khi không có yêu cầu nào tồn đọng.",
      },
      {
        title: "Bước 2: Banner cảnh báo kết nối trong phòng chat",
        desc: "Khi mở tin nhắn từ người lạ, hệ thống hiển thị banner rõ ràng: 'Người này chưa nằm trong danh sách kết nối của bạn' kèm nút [Chấp nhận kết nối] hoặc [Gửi lời mời kết nối].",
      },
      {
        title: "Bước 3: Trả lời trích dẫn (Reply) & Chuyển tiếp (Forward)",
        desc: "Dí giữ tin nhắn trên điện thoại hoặc bấm nút Trả lời trên máy tính để trích dẫn tin nhắn gốc. Bấm nút Chuyển tiếp để gửi nội dung cho đối tác khác tức thì.",
      },
      {
        title: "Bước 4: Thu hồi tin nhắn & Thả 6 cảm xúc Emoji",
        desc: "Bấm biểu tượng (...) bên cạnh tin nhắn để thu hồi tức thời trên cả 2 phía. Nhấn giữ để thả 6 cảm xúc: 👍 ❤️ 😂 😮 😢 😡.",
      },
    ],
    proTip: "Nhắn tin cho ai đó không mặc định là đã kết nối. Hai bên phải hoàn tất gửi & chấp nhận lời mời kết nối mới được công nhận là đã kết nối.",
  },
  {
    id: "privacy",
    label: "Cài đặt Riêng tư Thẻ & QR",
    icon: Lock,
    title: "5. CẤU HÌNH QUYỀN RIÊNG TƯ & ẨN/HIỆN TRƯỜNG THÔNG TIN DANH THIẾP",
    subtitle: "Chủ động kiểm soát chính xác những trường thông tin đối tác được phép xem khi quét QR hoặc chạm NFC",
    image: "/docs/images/demo_nfc_card.svg",
    steps: [
      {
        title: "Bước 1: Vào 'Trang cá nhân' > 'Cài đặt thẻ danh thiếp & Riêng tư'",
        desc: "Tại giao diện cá nhân, chọn Cài đặt Thẻ danh thiếp số để mở bảng điều khiển quản lý hiển thị các trường dữ liệu.",
      },
      {
        title: "Bước 2: Bật / Tắt từng trường dữ liệu mong muốn",
        desc: "Bạn có thể chủ động bật hoặc tắt: Ảnh đại diện, Tên hiển thị, Tên doanh nghiệp, Số điện thoại cá nhân, Email và Địa chỉ trụ sở.",
        tip: "Nếu bạn tắt số điện thoại, người khác quét QR sẽ thấy 'Đã ẩn theo cài đặt riêng tư' và không thể xem số của bạn.",
      },
      {
        title: "Bước 3: Hiển thị đồng bộ trên mã QR và thẻ chạm NFC",
        desc: "Mọi thay đổi có hiệu lực ngay lập tức. Khi tài khoản A quét QR hoặc chạm thẻ NFC của tài khoản B, hệ thống chỉ hiển thị đúng các trường tài khoản B cho phép.",
      },
    ],
    proTip: "Bạn nên giữ hiển thị Tên và Doanh nghiệp để đối tác dễ dàng nhận diện khi giao lưu tại các sự kiện B2B.",
  },
  {
    id: "realtime_connect",
    label: "Popup Kết nối Tức thời",
    icon: Zap,
    title: "6. POPUP NHẬN DIỆN & DUYỆT KẾT NỐI REALTIME",
    subtitle: "Tự động hiển thị popup thông tin đối tác ngay khi đối phương quét QR hoặc gửi yêu cầu kết nối",
    image: "/docs/images/demo_messenger_chat.svg",
    steps: [
      {
        title: "Bước 1: Tài khoản A quét QR hoặc gửi lời mời kết nối",
        desc: "Khi tài khoản A quét QR hoặc chạm NFC của tài khoản B và bấm 'Gửi Lời Mời Kết Nối', hệ thống mã hóa và truyền tin theo thời gian thực.",
      },
      {
        title: "Bước 2: Màn hình tài khoản B lập tức bật Popup thông tin đối tác",
        desc: "Ứng dụng của tài khoản B sẽ hiển thị ngay Popup thông báo có Ảnh đại diện, Tên, Chức vụ và Doanh nghiệp của tài khoản A (theo cấu hình riêng tư của A).",
        tip: "Bạn có thể bấm trực tiếp vào số điện thoại hoặc email trên popup để liên hệ nhanh chóng.",
      },
      {
        title: "Bước 3: Bấm 'Chấp nhận' để trở thành đối tác chính thức",
        desc: "Chỉ cần 1 chạm 'Chấp nhận', hai bên chính thức được kết nối trong Danh bạ B2B và có thể trao đổi tin nhắn, gửi báo giá ngay lập tức.",
      },
    ],
    proTip: "Nếu đang bận họp, bạn có thể bấm 'Để sau' để xem lại danh sách yêu cầu trong mục Kết nối chờ duyệt bất kỳ lúc nào.",
  },
  {
    id: "directory",
    label: "Danh bạ & Kết nối",
    icon: Users,
    title: "7. DANH BẠ HỘI VIÊN & QUY TRÌNH KẾT NỐI 2 CHIỀU",
    subtitle: "Tìm kiếm đối tác, gửi yêu cầu kết nối chuẩn mực và quản lý mạng lưới",
    image: "/docs/images/demo_directory_b2b.svg",
    steps: [
      {
        title: "Bước 1: Tra cứu hội viên theo ngành nghề và địa bàn",
        desc: "Sử dụng bộ lọc thông minh theo Ngành nghề (Xây dựng, Bất động sản, Tài chính, Logistics, F&B...), Tỉnh thành hoặc tên doanh nghiệp để tìm đúng đối tác mục tiêu.",
      },
      {
        title: "Bước 2: Gửi yêu cầu Kết nối 2 chiều",
        desc: "Tại trang hồ sơ của hội viên, bấm nút 'KẾT NỐI' màu xanh. Yêu cầu sẽ được gửi tới đối phương kèm thông báo. Chỉ khi đối tác bấm 'Đồng ý', trạng thái mới chuyển sang 'Đã kết nối'.",
        tip: "Nếu không còn nhu cầu giao thương, bạn có thể chọn 'HỦY KẾT NỐI' bất kỳ lúc nào mà không làm mất lịch sử trò chuyện.",
      },
      {
        title: "Bước 3: Xem chi tiết thông tin pháp lý & năng lực hội viên",
        desc: "Hồ sơ hiển thị đầy đủ Mã số thuế, Giấy phép kinh doanh, Quy mô nhân sự, Doanh thu và các chứng chỉ chất lượng đã được Ban Thẩm Định xác thực.",
      },
    ],
    proTip: "Các hội viên đạt danh hiệu 'Hội viên kim cương' hoặc Ban Chấp Hành sẽ có tích xanh xác thực uy tín.",
  },
  {
    id: "committees",
    label: "7 Ban Ngành CLB",
    icon: Building2,
    title: "8. DANH BẠ 7 BAN CHUYÊN MÔN & ĐẦU MỐI LIÊN HỆ CLB",
    subtitle: "Tra cứu lãnh đạo phụ trách, hotline và email của từng ban ngành trong hiệp hội",
    image: "/docs/images/demo_directory_b2b.svg",
    steps: [
      {
        title: "Bước 1: Mở Danh bạ Ban Ngành từ biểu tượng Hỗ trợ",
        desc: "Chạm vào biểu tượng Tai nghe hoặc Danh bạ để mở danh sách 7 Ban Chuyên môn của CLB Doanh Nhân CEO 1983.",
      },
      {
        title: "Bước 2: Tra cứu đúng Ban ngành theo nhu cầu",
        desc: "Bao gồm: Ban Thường Trực, Ban Thư Ký, Ban Xúc Tiến Thương Mại B2B, Ban Phát Triển Hội Viên & Thẩm Định, Ban Truyền Thông & Sự Kiện, Ban Tài Chính & Pháp Chế, Ban Đào Tạo & Chuyển Đổi Số.",
      },
      {
        title: "Bước 3: Bấm gọi hotline hoặc gửi email trực tiếp",
        desc: "Mỗi Ban ngành đều có số điện thoại và email của Chủ tịch, Tổng Thư ký hoặc Trưởng ban phụ trách trực tiếp để hội viên liên hệ 1-chạm.",
        tip: "Hội viên cũng có thể gửi form đóng góp ý kiến hoặc yêu cầu hỗ trợ trực tiếp đến Ban Thư Ký ngay trong cửa sổ này.",
      },
    ],
    proTip: "Các thông báo chính thức và lịch làm việc của từng ban ngành được cập nhật liên tục trên Bảng tin hiệp hội.",
  },
  {
    id: "events",
    label: "Sự kiện & Check-in",
    icon: QrCode,
    title: "9. QUẢN LÝ SỰ KIỆN, CHECK-IN QR & IN THẺ ĐEO",
    subtitle: "Xem lịch trình, đăng ký tham dự, quét mã điểm danh 1 giây tại bàn lễ tân",
    image: "/docs/images/demo_qr_checkin.svg",
    steps: [
      {
        title: "Bước 1: Xem chi tiết sự kiện & Đăng ký tham dự",
        desc: "Mục 'Sự kiện' cung cấp danh sách đầy đủ: Hội nghị xúc tiến thương mại, Cafe Doanh nhân thứ 7, Họp Ban Chấp Hành... kèm địa điểm, diễn giả và sơ đồ chỗ ngồi.",
      },
      {
        title: "Bước 2: Quét mã QR điểm danh tự động tại bàn lễ tân",
        desc: "Mở tính năng 'Quét QR' trên App và hướng camera vào mã QR tại cổng chào lễ tân để điểm danh trong 1 giây.",
        tip: "Hệ thống tự động in thẻ đeo đại biểu và ghi nhận điểm chuyên cần vào hồ sơ hội viên.",
      },
      {
        title: "Bước 3: Xem danh sách đại biểu tham gia",
        desc: "Theo dõi danh sách các chủ doanh nghiệp cùng tham dự phiên họp để chủ động kết nối giao thương trước giờ khai mạc.",
      },
    ],
    proTip: "Các sự kiện có tính phí sẽ hỗ trợ thanh toán trực tiếp qua mã VietQR ngay trên trang chi tiết sự kiện.",
  },
  {
    id: "documents",
    label: "Tài liệu mật",
    icon: FileText,
    title: "10. THƯ VIỆN TÀI LIỆU MẬT & MỞ KHÓA TẢI TÀI LIỆU",
    subtitle: "Xem kỷ yếu, slide diễn giả, nghị quyết CLB định dạng PDF/DOCX mã hóa",
    image: "/docs/images/demo_documents.svg",
    steps: [
      {
        title: "Bước 1: Mở Thư viện tài liệu số",
        desc: "Truy cập mục 'Tài liệu' để tra cứu toàn bộ các văn bản quy chế, điều lệ, biên bản nghị quyết Ban Chấp Hành và kỷ yếu hội nghị.",
      },
      {
        title: "Bước 2: Mở khóa tự động sau khi Check-in",
        desc: "Đối với các tài liệu nội bộ của sự kiện, hệ thống tự động mở khóa quyền truy cập ngay sau khi bạn quét QR điểm danh thành công.",
      },
      {
        title: "Bước 3: Xem trước In-App & Tải file mã hóa",
        desc: "Bạn có thể đọc trực tuyến tài liệu ngay trên ứng dụng hoặc bấm tải về file PDF/Word chất lượng cao lưu vào điện thoại.",
      },
    ],
    proTip: "Toàn bộ tài liệu được đóng dấu thủy vân số (Digital Watermark) định danh mã hội viên để bảo đảm an toàn thông tin.",
  },
  {
    id: "meetings",
    label: "Họp Ban Chấp Hành",
    icon: Calendar,
    title: "11. HỌP BAN CHẤP HÀNH & KÝ SỐ BIÊN BẢN TRỰC TUYẾN",
    subtitle: "Nhận thư mời họp, tham gia phòng họp và ký xác nhận biên bản số",
    image: "/docs/images/demo_meetings.svg",
    steps: [
      {
        title: "Bước 1: Nhận thư mời họp có nút hành động trong Chat",
        desc: "Ban Thư Ký gửi thư mời họp BCH thường kỳ/đột xuất trực tiếp vào tin nhắn kèm thời gian, địa điểm và chương trình nghị sự.",
      },
      {
        title: "Bước 2: Bấm 'Xác nhận tham dự' hoặc 'Vào phòng họp'",
        desc: "Chỉ cần 1 chạm ngay trên bong bóng chat để xác nhận tham gia hoặc bấm mở liên kết phòng họp trực tuyến.",
      },
      {
        title: "Bước 3: Ký số biên bản cuộc họp",
        desc: "Sau phiên họp, mở mục 'Biên bản cuộc họp' để đọc dự thảo và bấm 'Ký xác nhận' bằng chữ ký số cá nhân.",
      },
    ],
    proTip: "Hệ thống tự động tổng hợp tỷ lệ đại biểu biểu quyết đạt chuẩn Điều lệ trước khi phiên họp diễn ra.",
  },
  {
    id: "marketplace",
    label: "Sàn B2B & Chào hàng",
    icon: ShoppingBag,
    title: "12. SÀN CƠ HỘI GIAO THƯƠNG B2B & KẾT NỐI CUNG CẦU",
    subtitle: "Đăng tin Chào mua, Chào bán, tìm đại lý và xúc tiến đầu tư nội bộ",
    image: "/docs/images/demo_marketplace.svg",
    steps: [
      {
        title: "Bước 1: Khám phá các cơ hội Chào mua / Chào bán",
        desc: "Truy cập 'Cơ hội giao thương B2B' để xem các đơn hàng mua sỉ, tìm nhà cung cấp nguyên vật liệu, tìm tổng thầu xây dựng từ chính các doanh nghiệp hội viên.",
      },
      {
        title: "Bước 2: Đăng tin giao thương với mức chiết khấu nội bộ",
        desc: "Bấm 'Đăng cơ hội mới', nhập tiêu đề, hình ảnh sản phẩm, mức giá ưu đãi dành riêng cho hội viên CEO 1983 (cam kết chiết khấu tốt hơn thị trường).",
      },
      {
        title: "Bước 3: Nhận phản hồi & Kết nối đàm phán tức thì",
        desc: "Khi có hội viên quan tâm, hệ thống gửi thông báo đẩy và tự động mở phòng chat thương thảo hợp đồng trực tiếp giữa hai bên.",
      },
    ],
    proTip: "Tin đăng có đầy đủ báo giá và catalog rõ ràng sẽ được Ban Xúc Tiến Thương Mại phê duyệt hiển thị ưu tiên.",
  },
  {
    id: "fee",
    label: "Hội phí VietQR",
    icon: CreditCard,
    title: "13. ĐÓNG HỘI PHÍ NIÊN KIM QUA VIETQR TỰ ĐỘNG",
    subtitle: "Thanh toán hội phí chính xác, tự động gạch nợ 24/7 và xuất hóa đơn VAT",
    image: "/docs/images/demo_vietqr_fee.svg",
    steps: [
      {
        title: "Bước 1: Nhận thông báo hóa đơn niên kim",
        desc: "Hàng năm hoặc khi đến kỳ gia hạn, Ban Thư Ký gửi thông báo nhắc nhở kèm hóa đơn trực quan ngay trên hệ thống.",
      },
      {
        title: "Bước 2: Quét mã VietQR bằng App Ngân Hàng",
        desc: "Mở ứng dụng Mobile Banking của bất kỳ ngân hàng nào (MB, VCB, Techcombank, BIDV...). Quét mã QR hiển thị trên màn hình. Số tài khoản, số tiền và nội dung chuyển khoản định danh (VD: M1983-007 HOI PHI) được điền tự động 100%.",
      },
      {
        title: "Bước 3: Tự động gạch nợ & Nhận biên lai tức thì",
        desc: "Hệ thống liên kết Core Banking tự động gạch nợ sau 3 giây. Trạng thái thẻ hội viên chuyển ngay sang 'Đã gia hạn thành công'. Biên lai điện tử gửi thẳng về email doanh nghiệp.",
      },
    ],
    proTip: "Thanh toán qua VietQR hoàn toàn miễn phí giao dịch và đảm bảo không bao giờ bị nhầm lẫn nội dung chuyển tiền.",
  },
  {
    id: "voting",
    label: "Biểu quyết & Bầu cử",
    icon: Vote,
    title: "14. BIỂU QUYẾT ĐẠI HỘI & BẦU CỬ BAN CHẤP HÀNH",
    subtitle: "Tham gia biểu quyết nghị quyết và bầu cử nhân sự trực tuyến minh bạch",
    image: "/docs/images/demo_voting.svg",
    steps: [
      {
        title: "Bước 1: Nhận thông báo phiên biểu quyết đang diễn ra",
        desc: "Trong các kỳ Đại hội toàn thể hoặc phiên họp thường kỳ, ứng dụng sẽ gửi thông báo khẩn mở cổng biểu quyết trực tuyến.",
      },
      {
        title: "Bước 2: Nghiên cứu tờ trình và lựa chọn phương án",
        desc: "Đọc kỹ nội dung nghị quyết, danh sách ứng viên và thực hiện bỏ phiếu [Tán thành], [Không tán thành] hoặc [Ý kiến khác].",
      },
      {
        title: "Bước 3: Xem kết quả kiểm phiếu thời gian thực",
        desc: "Sau khi gửi phiếu biểu quyết, biểu đồ tỷ lệ phần trăm biểu quyết của toàn thể hội viên sẽ được cập nhật công khai, minh bạch theo thời gian thực.",
      },
    ],
    proTip: "Mỗi hội viên chính thức có 01 quyền biểu quyết duy nhất gắn với mã hội viên đã được mã hóa an toàn.",
  },
  {
    id: "sponsors",
    label: "Nhà tài trợ",
    icon: Award,
    title: "15. QUYỀN LỢI NHÀ TÀI TRỢ & VINH DANH KIM CƯƠNG",
    subtitle: "Đăng ký tài trợ sự kiện, quyền lợi quảng bá thương hiệu & bảng vàng tri ân",
    image: "/docs/images/demo_sponsors.svg",
    steps: [
      {
        title: "Bước 1: Lựa chọn gói tài trợ phù hợp",
        desc: "Xem danh mục các gói tài trợ: Kim Cương, Vàng, Bạc, Đồng cho các sự kiện Gala thường niên, Hội thảo xúc tiến thương mại.",
      },
      {
        title: "Bước 2: Kích hoạt quyền lợi truyền thông đa kênh",
        desc: "Logo doanh nghiệp xuất hiện trên backdrop, kỷ yếu, banner trang chủ ứng dụng và bài viết vinh danh trên mạng xã hội CLB.",
      },
      {
        title: "Bước 3: Vinh danh bảng vàng tại sự kiện",
        desc: "Nhận kỷ niệm chương tri ân trang trọng trên sân khấu sự kiện trước sự chứng kiến của hàng trăm doanh nhân tiêu biểu.",
      },
    ],
    proTip: "Doanh nghiệp tài trợ được ưu tiên bố trí gian hàng triển lãm B2B tại sảnh chính sự kiện.",
  },
  {
    id: "security",
    label: "Bảo mật & Thiết bị",
    icon: Lock,
    title: "16. BẢO MẬT TÀI KHOẢN, KHÓA THẺ & QUẢN LÝ THIẾT BỊ",
    subtitle: "Chủ động bảo vệ thông tin doanh nghiệp, khóa thẻ NFC khi thất lạc",
    image: "/docs/images/demo_security.svg",
    steps: [
      {
        title: "Bước 1: Đổi mật khẩu & Thiết lập xác thực 2 lớp (2FA)",
        desc: "Vào mục Cài đặt tài khoản để cập nhật mật khẩu định kỳ và kích hoạt mã OTP bảo vệ an toàn cho tài khoản cá nhân.",
      },
      {
        title: "Bước 2: Khóa thẻ thông minh NFC từ xa khi thất lạc",
        desc: "Nếu làm mất hoặc để quên thẻ vật lý, bạn chỉ cần bấm 'Khóa thẻ ngay' trên App. Chip NFC sẽ bị vô hiệu hóa tức thời, không ai có thể xem dữ liệu của bạn.",
      },
      {
        title: "Bước 3: Quản trị các phiên đăng nhập trên thiết bị lạ",
        desc: "Kiểm tra danh sách các thiết bị đang đăng nhập (iPhone, iPad, Máy tính văn phòng). Bạn có thể bấm 'Đăng xuất khỏi tất cả thiết bị khác' chỉ với 1 cú click.",
      },
    ],
    proTip: "Khi cấp lại thẻ NFC mới từ Ban Thư Ký, mã định danh cũ sẽ tự động được thu hồi và kích hoạt thẻ mới trong 30 giây.",
  },
];

export function UserGuideModal({ open, onClose, defaultTab = "auth" }: UserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTabKey>(defaultTab);

  if (!open || typeof document === "undefined") return null;

  const current = GUIDE_DATA.find((g) => g.id === activeTab) || GUIDE_DATA[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-[#0c1427] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[15px] sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DOANH NHÂN</span>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                  CEO 1983
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tài liệu chuẩn hóa quy trình thao tác &amp; khai thác toàn diện tính năng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Word Download Button Only */}
            <a
              href="/docs/HDSD_App_Hiep_Hoi_CEO1983.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-xs"
              title="Tải tài liệu hướng dẫn định dạng Word (.DOCX)"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Tải Word (.docx)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#0c1427] shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GUIDE_DATA.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/20"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content (Scrollable, Constrained Width in Center) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 [scrollbar-width:thin]">
          <div className="w-full max-w-xl mx-auto space-y-4">
            {/* Section Banner */}
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                CHUYÊN ĐỀ HƯỚNG DẪN THỰC CHIẾN
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {current.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {current.subtitle}
              </p>
            </div>

            {/* Demo Image Illustration Frame - Khung ảnh chụp màn hình thực tế */}
            <div className="overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-100/50 dark:bg-white/[0.02] p-3 text-center transition-all hover:border-[#003B95]/50">
              {current.image ? (
                <div className="relative group">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-auto max-h-[300px] object-contain rounded-xl mx-auto shadow-xs"
                    loading="lazy"
                  />
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>[Khung ảnh chụp màn hình thực tế từ thiết bị]</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Sparkles className="h-8 w-8 text-amber-500/50" />
                  <p className="text-xs font-semibold">Khung ảnh chụp màn hình thực tế</p>
                  <p className="text-[11px] text-slate-500">Ảnh chụp sẽ được đưa vào đây</p>
                </div>
              )}
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>CÁC BƯỚC THỰC HIỆN CHI TIẾT</span>
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {current.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3.5 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-5.5 w-5.5 place-items-center rounded-lg bg-[#003B95] text-[11px] font-bold text-white shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 pl-7.5 leading-relaxed">
                      {step.desc}
                    </p>
                    {step.tip && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 pl-7.5 font-medium flex items-center gap-1 pt-0.5">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>{step.tip}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-200">
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  Mẹo Doanh Nhân (Pro-Tip):
                </p>
                <p className="leading-relaxed text-[11.5px]">{current.proTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <a
              href="/docs/HDSD_App_Hiep_Hoi_CEO1983.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 text-[11.5px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-xs"
              title="Tải tài liệu hướng dẫn sử dụng dạng Word (.DOCX)"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Tải tài liệu Word (.docx)</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
