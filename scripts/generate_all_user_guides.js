const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = docx;

const DOCS_DIR = path.join(__dirname, '..', 'document');
const EVIDENCE_DIR = path.join(DOCS_DIR, 'images', 'evidence');
const PUBLIC_DOCS_DIR = path.join(__dirname, '..', 'apps', 'vione_app_fe', 'public', 'docs');

if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
  fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
}

function getBase64Image(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  console.warn(`[WARN] Image not found: ${filename}`);
  return '';
}

function getImageBuffer(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p);
  }
  console.warn(`[WARN] Image buffer not found: ${filename}`);
  return null;
}

// ----------------------------------------------------------------------------
// 1. GENERATE APP USER GUIDE MARKDOWN & HTML (HUONG_DAN_SU_DUNG_APP_HIEP_HOI)
// ----------------------------------------------------------------------------
function buildAppGuideMarkdown() {
  return `# HƯỚNG DẪN SỬ DỤNG CHI TIẾT ỨNG DỤNG DI ĐỘNG HIỆP HỘI DOANH NHÂN CEO 1983
**Phân hệ:** Mobile App Hiệp Hội (iOS & Android) — **Đơn vị vận hành:** CLB Doanh Nhân CEO 1983  
**Nền tảng công nghệ:** VIONE Ecosystem Pro — **Phiên bản:** v2.6.0  
**Ngày cập nhật:** 18/09/2026 — **Môi trường:** Live Production Staging  
**Tài liệu kèm ảnh chụp thực tế 100% (Bao gồm các màn hình liên kết CRM Quản Trị tương ứng)**

---

## 📑 MỤC LỤC CHI TIẾT

1. [DANH MỤC TÀI KHOẢN VẬN HÀNH & KIỂM THỬ THỰC TẾ](#1-danh-mục-tài-khoản-vận-hành--kiểm-thử-thực-tế)
2. [QUY TRÌNH GIA NHẬP: LANDING PAGE ➔ CRM PHÊ DUYỆT ➔ KÍCH HOẠT TÀI KHOẢN APP](#2-quy-trình-gia-nhập-landing-page--crm-phê-duyệt--kích-hoạt-tài-khoản-app)
3. [ĐĂNG NHẬP, KHÔI PHỤC THÔNG TIN & TRANG CHỦ (HOME DASHBOARD)](#3-đăng-nhập-khôi-phục-thông-tin--trang-chủ-home-dashboard)
4. [THẺ HỘI VIÊN VIP KỸ THUẬT SỐ, QUÉT RADAR NFC & DANH THIẾP SỐ CÔNG KHAI](#4-thẻ-hội-viên-vip-kỹ-thuật-số-quét-radar-nfc--danh-thiếp-số-công-khai)
5. [QUẢN LÝ SỰ KIỆN: CHI TIẾT SỰ KIỆN, MUA VÉ VIETQR, CHECK-IN & HOẠT ĐỘNG (KÈM ẢNH CRM LIÊN QUAN)](#5-quản-lý-sự-kiện-chi-tiết-sự-kiện-mua-vé-vietqr-check-in--hoạt-động-kèm-ảnh-crm-liên-quan)
6. [SÀN GIAO THƯƠNG MARKETPLACE: DANH MỤC, THÊM MỚI, XÓA & CHỈNH SỬA SẢN PHẨM (KÈM ẢNH CRM LIÊN QUAN)](#6-sàn-giao-thương-marketplace-danh-mục-thêm-mới-xóa--chỉnh-sửa-sản-phẩm-kèm-ảnh-crm-liên-quan)
7. [BẢNG TIN CƠ HỘI KẾT NỐI KINH DOANH: ĐĂNG MỚI, CHỈNH SỬA, ĐÓNG & NHẬN DEAL (KÈM ẢNH CRM LIÊN QUAN)](#7-bảng-tin-cơ-hội-kết-nối-kinh-doanh-đăng-mới-chỉnh-sửa-đóng--nhận-deal-kèm-ảnh-crm-liên-quan)
8. [DANH BẠ HỘI VIÊN, HỒ SƠ DOANH NGHIỆP 360°, KẾT NỐI & MỜI HỘI VIÊN](#8-danh-bạ-hội-viên-hồ-sơ-doanh-nghiệp-360-kết-nối--mời-hội-viên)
9. [HỘP THƯ TIN NHẮN, TẠO NHÓM, CHAT 1-1, GỬI ĐỊNH VỊ GPS & GỌI ĐIỆN MESSENGER](#9-hộp-thư-tin-nhắn-tạo-nhóm-chat-1-1-gửi-định-vị-gps--gọi-điện-messenger)
10. [MENU CÁ NHÂN, DANH THIẾP SỐ, KÊNH TRỢ GIÚP & ĐỌC HƯỚNG DẪN SỬ DỤNG TRỰC TIẾP TRONG APP](#10-menu-cá-nhân-danh-thiếp-số-kênh-trợ-giúp--đọc-hướng-dẫn-sử-dụng-trực-tiếp-trong-app)
11. [QUẢN LÝ HỘI PHÍ THƯỜNG NIÊN (KÈM ẢNH CRM LIÊN QUAN)](#11-quản-lý-hội-phí-thường-niên-kèm-ảnh-crm-liên-quan)

---

## 1. DANH MỤC TÀI KHOẢN VẬN HÀNH & KIỂM THỬ THỰC TẾ

Hệ thống được thiết lập sẵn các tài khoản demo chuẩn để kiểm thử toàn bộ luồng nghiệp vụ giữa CRM và App:

| STT | Vai Trò | Email Đăng Nhập | Mật Khẩu | Pháp Nhân Doanh Nghiệp | Phạm Vi Kiểm Thử |
|:---:|---|---|:---:|---|---|
| 1 | **Quản Trị Viên (Admin CRM)** | \`admin@connect.vn\` | \`123456\` | VIONE Platform Holdings | Quản trị CRM: duyệt hội viên, tạo sự kiện, duyệt bài marketplace, đối soát phí |
| 2 | **Tổng Thư Ký CLB (Executive)** | \`ceo.tongthuky@ceo1983.com\` | \`123456\` | Ban Chấp Hành CEO 1983 | Điều hành hiệp hội, kiểm duyệt bài viết, xuất bản tin tức |
| 3 | **Hội Viên Doanh Nhân Mới (User A)** | \`ceo.namhai@vione.app\` | \`123456\` | Nam Hải Group | Test luồng duyệt hội viên, kích hoạt thẻ VIP, tạo sản phẩm, claim cơ hội |
| 4 | **Hội Viên Doanh Nhân 1 (User B)** | \`ceo.member1@ceo1983.com\` | \`123456\` | CP Xây Dựng 1983 | Test luồng Chat 1-1, gửi định vị công ty, gọi thoại, đăng bài marketplace |
| 5 | **Hội Viên Doanh Nhân 2 (User C)** | \`ceo.member2@ceo1983.com\` | \`123456\` | Logistics 1983 Toàn Cầu | Test nhận thông báo sự kiện, đăng ký vé VietQR, bình chọn trực tiếp |

---

## 2. QUY TRÌNH GIA NHẬP: LANDING PAGE ➔ CRM PHÊ DUYỆT ➔ KÍCH HOẠT TÀI KHOẢN APP

### 2.1. Thao Tác Trên Cổng Thông Tin Landing Page (Dành cho Doanh Nhân Mới)
1. Doanh nhân truy cập cổng thông tin CLB CEO 1983 tại địa chỉ Landing Page.
2. Tìm hiểu tôn chỉ hoạt động, điều lệ hiệp hội và các quyền lợi kết nối B2B.
3. Nhấp chọn nút **"Đăng ký gia nhập CLB CEO 1983"** trên thanh điều hướng hoặc banner chính.
4. Điền đầy đủ thông tin pháp nhân:
   - Tên doanh nghiệp, Mã số thuế (MST), Địa chỉ trụ sở.
   - Họ tên người đại diện pháp luật, Chức vụ, Số điện thoại di động, Email công vụ.
   - Ban chuyên môn mong muốn sinh hoạt (Ban Xúc tiến Thương mại, Ban Sự kiện, Ban Tài chính, v.v.).
5. Nhấn **"Gửi hồ sơ thẩm định"** và nhận mã tra cứu tiến độ tự động.

![Giao diện Cổng thông tin Landing Page CLB CEO 1983](images/evidence/sub_01_landing_header_hero.png)
*Hình 2.1: Giao diện Cổng thông tin Landing Page CLB CEO 1983 với nút Đăng ký tham gia.*

![Modal Tiếp nhận Form Đăng ký Hội viên Mới](images/evidence/sub_03_landing_registration_modal.png)
*Hình 2.2: Form đăng ký trực tuyến tiếp nhận thông tin pháp nhân và hồ sơ doanh nghiệp.*

![Màn hình Tra cứu Tiến độ Thẩm định Hồ sơ](images/evidence/sub_04_landing_status_polling.png)
*Hình 2.3: Màn hình kiểm tra trạng thái phê duyệt hồ sơ dành cho doanh nghiệp đăng ký mới.*

---

### 2.2. Thao Tác Phê Duyệt Của Ban Thư Ký Trên Web CRM (Luồng CRM Liên Quan Trực Tiếp)
1. Ban Thư ký đăng nhập hệ thống Web CRM (\`http://14.225.217.232:5000/auth\`) bằng tài khoản Quản trị.
2. Điều hướng vào menu **"Quản lý Hội viên"** (\`/members\`).
3. Danh sách hồ sơ mới hiển thị với nhãn trạng thái màu vàng: **"Chờ xét duyệt"**.
4. Nhấp vào dòng hội viên để mở **Drawer Hồ sơ Chi tiết 360°**, kiểm tra MST, giấy phép ĐKKD và năng lực doanh nghiệp.
5. Nhấp nút **"Phê duyệt Hội viên (Approve)"**.
6. **Cơ chế đồng bộ tự động:**
   - CSDL cập nhật trạng thái hội viên sang \`Active\` (Hoạt động).
   - Hệ thống tự động khởi tạo Thẻ Hội Viên VIP Kỹ Thuật Số với Mã ID độc bản (\`CEO-1983-xxx\`).
   - Cấp quyền đăng nhập tức thì trên Ứng dụng Di động (Mobile App) cho hội viên.

![CRM: Danh sách Hội viên tiếp nhận hồ sơ chờ duyệt](images/evidence/sub_07_crm_members_list.png)
*Hình 2.4: Màn hình CRM Quản lý Hội viên hiển thị danh sách hồ sơ đăng ký mới cần thẩm định.*

![CRM: Drawer kiểm tra chi tiết hồ sơ doanh nghiệp và tư cách hội viên](images/evidence/sub_08_crm_member_detail_drawer.png)
*Hình 2.5: Drawer chi tiết hồ sơ hội viên trên CRM phục vụ thẩm định năng lực trước khi kích hoạt.*

![CRM: Thao tác bấm nút Phê duyệt (Approve) cấp quyền vào App](images/evidence/sub_09_crm_approve_action.png)
*Hình 2.6: Thao tác bấm nút Phê duyệt trên CRM - Kích hoạt quyền đăng nhập App di động cho hội viên.*

---

## 3. ĐĂNG NHẬP, KHÔI PHỤC THÔNG TIN & TRANG CHỦ (HOME DASHBOARD)

### 3.1. Đăng Nhập Ứng Dụng Mobile App
1. Mở ứng dụng **CEO 1983** trên điện thoại iOS (TestFlight/App Store) hoặc Android (APK/Google Play).
2. Nhập Email hoặc Số điện thoại đã được đăng ký và phê duyệt.
3. Nhập Mật khẩu (mặc định ban đầu do hệ thống cấp: \`123456\` hoặc mật khẩu cá nhân).
4. Nhấn **"Đăng nhập"**.
5. Trường hợp quên mật khẩu: Bấm liên kết **"Quên mật khẩu?"** hoặc bấm nút **"Hỗ trợ Thư ký"** để được cấp lại mật khẩu xác thực qua SMS/Email.

![Màn hình Đăng nhập App Di động Hiệp hội CEO 1983](images/evidence/sub_10_app_login_screen.png)
*Hình 3.1: Màn hình Đăng nhập chuyên biệt cho Hội viên Hiệp hội Doanh nhân CEO 1983.*

![Nhập thông tin xác thực đăng nhập vào hệ thống](images/evidence/sub_11_app_login_credentials.png)
*Hình 3.2: Điền thông tin Email/SĐT và mật khẩu để bắt đầu phiên làm việc an toàn.*

---

### 3.2. Trang Chủ Hội Viên (Home Dashboard)
Trang chủ được thiết kế theo phong cách hiện đại với đầy đủ công cụ điều hướng:
- **Header Định danh Doanh nhân:** Hiển thị Logo hiệp hội, Tên hội viên, Doanh nghiệp và Huy hiệu Ban chấp hành/Hội viên chính thức.
- **Top Carousel Banner:** Hiển thị các sự kiện Đại hội, Hội thảo Xúc tiến thương mại mới nhất có ảnh sắc nét.
- **Thanh Điều hướng Nhanh (Quick Actions):**
  - Quét QR Điểm danh / Kết nối nhanh.
  - Sự kiện sắp tới & Đặt vé.
  - Sàn Marketplace mua bán B2B nội bộ.
  - Bảng tin Cơ hội kết nối giao thương (Matching).
  - Danh bạ Doanh nhân & Ban ngành.
- **Tóm tắt Chỉ số Cá nhân:** Số lượng kết nối thành công, số tin nhắn chưa đọc, sự kiện đã đăng ký.

![Giao diện Trang chủ Hội viên CEO 1983](images/evidence/sub_12_app_home_top_banner.png)
*Hình 3.3: Giao diện Trang chủ App với Banner Sự kiện nổi bật và các lối tắt chức năng.*

---

## 4. THẺ HỘI VIÊN VIP KỸ THUẬT SỐ, QUÉT RADAR NFC & DANH THIẾP SỐ CÔNG KHAI

### 4.1. Thẻ Hội Viên VIP Kỹ Thuật Số (Digital VIP Card)
1. Tại Trang chủ hoặc mục Cá nhân, chạm vào biểu tượng **"Thẻ Hội Viên"**.
2. Thẻ hiển thị thiết kế mạ vàng 3D sang trọng:
   - Logo Hiệp hội Doanh nhân CEO 1983.
   - Họ tên Doanh nhân, Tên Công ty, Chức danh.
   - Hạng thẻ: **VIP Gold / Diamond Member**.
   - Mã định danh hội viên duy nhất: \`CEO-1983-xxx\`.
   - Thời hạn hiệu lực của hội phí (Hạn thẻ).
3. **Mã QR Độc Bản:** Dùng để đối tác quét kết nối trực tiếp hoặc quét điểm danh vào cổng sự kiện của hiệp hội.

![Thẻ Hội Viên VIP Kỹ Thuật Số CLB Doanh Nhân CEO 1983](images/evidence/sub_13_app_vip_card_front.png)
*Hình 4.1: Thẻ Hội Viên VIP 3D với mã QR định danh và thời hạn hiệu lực của thẻ.*

---

### 4.2. Quét Radar NFC & Kết Nối Doanh Nhân Lân Cận
1. Tại màn hình Thẻ hoặc Trang chủ, bấm chọn biểu tượng **"Radar NFC"**.
2. Ứng dụng kích hoạt sóng quét lân cận (Bluetooth BLE / Định vị hội trường sự kiện):
   - Quét và hiển thị avatar các doanh nhân CEO 1983 đang có mặt trong bán kính sự kiện.
   - Cho phép chạm 2 điện thoại có hỗ trợ NFC để trao đổi danh thiếp số tức thì không cần kết bạn thủ công.

![Modal Quét Radar NFC tìm kiếm đối tác lân cận](images/evidence/sub_14_app_nfc_radar_modal.png)
*Hình 4.2: Tính năng Radar NFC quét tìm doanh nhân cùng hiệp hội trong bán kính sự kiện.*

---

### 4.3. Danh Thiếp Số Điện Tử Công Khai (Public Digital Business Card)
1. Bấm nút **"Chia sẻ Danh thiếp số"**.
2. Ứng dụng tạo đường dẫn trang web công khai (vd: \`https://app.ceo1983.vn/card/namhai\`).
3. Đối tác ngoài hiệp hội có thể quét mã QR này để:
   - Lưu danh bạ (vCard) trực tiếp vào điện thoại chỉ với 1 chạm.
   - Xem catalogue sản phẩm và hồ sơ năng lực công ty.
   - Gửi yêu cầu hợp tác kinh doanh.

![Trang Danh thiếp số Doanh nhân công khai](images/evidence/sub_15_app_public_digital_card.png)
*Hình 4.3: Trang Danh thiếp số chia sẻ đa nền tảng giúp mở rộng mạng lưới giao thương.*

---

## 5. QUẢN LÝ SỰ KIỆN: CHI TIẾT SỰ KIỆN, MUA VÉ VIETQR, CHECK-IN & HOẠT ĐỘNG (KÈM ẢNH CRM LIÊN QUAN)

### 5.1. Luồng CRM Cấu Hình & Quản Trị Sự Kiện (Chức năng CRM tương ứng)
Để sự kiện xuất hiện trên App, Ban tổ chức thực hiện các bước trên Web CRM:
1. Truy cập CRM menu **"Quản lý Sự kiện"** (\`/events\`).
2. Bấm nút **"Tạo Sự kiện Mới"**:
   - Nhập Tiêu đề sự kiện, Địa điểm tổ chức, Thời gian bắt đầu/kết thúc.
   - Tải lên Banner sự kiện (tỷ lệ 16:9 chất lượng cao).
   - Nhập danh sách Diễn giả (Speaker) và Lịch trình chi tiết (Agenda).
   - Cấu hình loại vé: Vé Miễn phí dành cho Hội viên chính thức hoặc Vé Thu phí (nhập giá vé VNĐ).
   - Cấu hình Sơ đồ Khán phòng (Cinema Hall Seating Map): Phân hàng ghế VIP, Hạng Thương gia, Tiêu chuẩn.
3. Xuất bản sự kiện: Sự kiện ngay lập tức đồng bộ thời gian thực sang App hội viên.

![CRM: Quản lý danh sách sự kiện và thiết lập tổ chức](images/evidence/sub_27_crm_events_management.png)
*Hình 5.1: Màn hình CRM Quản lý Sự kiện - Nơi tạo và điều phối các sự kiện của CLB.*

![CRM: Thiết lập Sơ đồ Khán phòng Cinema Map và vị trí ghế ngồi](images/evidence/sub_28_crm_seating_cinema_map.png)
*Hình 5.2: Công cụ cấu hình sơ đồ khán phòng và chỗ ngồi sự kiện trên hệ thống Web CRM.*

---

### 5.2. Xem Danh Sách Sự Kiện Trên App Hội Viên
1. Trên thanh điều hướng đáy (Bottom Bar), chọn tab **"Sự kiện"**.
2. Giao diện hiển thị danh sách các sự kiện được phân loại rõ ràng:
   - Tab **Sắp diễn ra:** Các chương trình sắp tổ chức trong tháng.
   - Tab **Đang diễn ra:** Các chương trình đang chạy trong ngày để hội viên vào check-in.
   - Tab **Đã tham gia:** Lịch sử các sự kiện hội viên từng dự.
3. Bộ lọc theo danh mục: Đại hội thường niên, Caravan xúc tiến, Talkshow doanh nhân, Gala kết nối.

![Danh sách Sự kiện trên App Hiệp hội](images/evidence/sub_29_app_events_screen.png)
*Hình 5.3: Màn hình danh sách Sự kiện với thẻ hình ảnh trực quan và trạng thái sự kiện.*

---

### 5.3. Xem Chi Tiết Sự Kiện (Event Detail Modal)
1. Nhấp vào bất kỳ sự kiện nào trong danh sách.
2. Màn hình Chi tiết Sự kiện mở ra cung cấp toàn bộ dữ liệu:
   - **Banner và Tiêu đề:** Hình ảnh chủ đạo sắc nét, thời gian và địa chỉ tổ chức cụ thể kèm bản đồ dẫn đường.
   - **Nội dung chương trình (Agenda):** Lịch trình chi tiết từng khung giờ (Đón khách, Khai mạc, Tọa đàm, Ký kết hợp tác, Tiệc tối).
   - **Danh sách Diễn giả (Keynote Speakers):** Ảnh đại diện, họ tên, chức vụ và chuyên đề thuyết trình.
   - **Quyền lợi đại biểu:** Tài liệu độc quyền, tea-break, quà tặng lưu niệm.
   - **Sơ đồ khán phòng:** Vị trí khán phòng và phân khu chỗ ngồi.
3. Nhấn nút **"Đăng ký tham dự"** ở chân trang.

![Modal Chi tiết Sự kiện trên App Hiệp hội](images/evidence/sub_30_app_event_detail_modal.png)
*Hình 5.4: Chi tiết sự kiện với đầy đủ lịch trình, diễn giả, quyền lợi và sơ đồ chỗ ngồi.*

---

### 5.4. Đăng Ký Vé, Thanh Toán VietQR & Nhận Vé Điện Tử (Ticket Pass)
1. Trường hợp sự kiện có thu phí:
   - Hệ thống mở popup **Thanh toán Chuyển khoản VietQR**.
   - Hiển thị Mã QR động kèm đầy đủ: Số tài khoản ngân hàng thụ hưởng của CLB, Tên ngân hàng, Số tiền vé, Cú pháp chuyển khoản chuẩn tự động (vd: \`VE-1983-NAMHAI\`).
   - Hội viên mở ứng dụng ngân hàng quét mã và xác nhận chuyển khoản.
2. Sau khi xác nhận đăng ký thành công:
   - Hệ thống cấp ngay **Vé Điện Tử Chính Thức (Ticket Pass)** lưu trong mục **"Vé của tôi"**.
   - Vé hiển thị: Tên sự kiện, Mã vé số, Số ghế phân bổ trong khán phòng.
   - **Mã QR Check-in Tốc độ cao:** Khi đến cổng sự kiện, hội viên chỉ cần mở vé này để Ban tổ chức quét mã check-in qua máy quét hoặc điện thoại CRM.

![Modal Thanh toán Vé qua Mã VietQR Ngân hàng](images/evidence/08_app_vietqr_payment_modal.png)
*Hình 5.5: Cổng thanh toán VietQR động tạo mã chuyển khoản tự động kèm cú pháp chuẩn.*

![Vé Điện Tử Ticket Pass có Mã QR Check-in](images/evidence/sub_31_app_event_ticket_pass.png)
*Hình 5.6: Vé điện tử chính thức kèm mã QR định danh phục vụ check-in nhanh tại quầy sự kiện.*

---

### 5.5. Bình Chọn Trực Tiếp (Live Voting) & Bốc Thăm May Mắn (Lucky Draw)
Khi sự kiện đang diễn ra trong hội trường:
1. **Bình chọn Trực tiếp (Live Voting):**
   - Ban tổ chức kích hoạt câu hỏi biểu quyết từ CRM (vd: Bầu cử Ban chấp hành, Bình chọn Doanh nghiệp Xuất sắc).
   - Ứng dụng hội viên lập tức rung và hiển thị màn hình Bình chọn.
   - Hội viên chọn phương án và nhấn **"Bỏ phiếu"**. Kết quả được tổng hợp thời gian thực hiển thị trên màn hình LED sân khấu.
2. **Quay Số Trúng Thưởng (Lucky Draw):**
   - Mã vé sự kiện của hội viên tự động được đưa vào vòng quay may mắn.
   - Hội viên theo dõi vòng quay ngẫu nhiên và nhận thông báo trúng thưởng ngay trên điện thoại.

![Tính năng Bình chọn Trực tiếp Live Voting trong sự kiện](images/evidence/sub_32_app_event_live_voting.png)
*Hình 5.7: Màn hình bỏ phiếu trực tiếp thời gian thực dành cho đại biểu tham dự đại hội.*

![Tính năng Quay số May mắn Lucky Draw sự kiện](images/evidence/sub_33_app_event_lucky_draw.png)
*Hình 5.8: Vòng quay may mắn Lucky Draw trao thưởng cho đại biểu tham dự.*

---

## 6. SÀN GIAO THƯƠNG MARKETPLACE: DANH MỤC, THÊM MỚI, XÓA & CHỈNH SỬA SẢN PHẨM (KÈM ẢNH CRM LIÊN QUAN)

### 6.1. Luồng CRM Kiểm Duyệt & Quản Trị Gian Hàng (Chức năng CRM tương ứng)
1. Ban quản trị truy cập CRM menu **"Sàn Giao thương B2B"** (\`/marketplace\`).
2. Xem toàn bộ sản phẩm/dịch vụ do các doanh nghiệp hội viên đăng tải từ App.
3. Ban quản trị có quyền:
   - **Phê duyệt:** Đưa sản phẩm lên vị trí nổi bật trên App.
   - **Gắn nhãn Khuyến mãi:** Kích hoạt ưu đãi đặc quyền cho hội viên CLB.
   - **Khóa / Ẩn sản phẩm:** Tạm dừng hiển thị các bài đăng không phù hợp quy chế.

![CRM: Kiểm duyệt và đồng bộ danh mục sản phẩm Marketplace](images/evidence/sub_37_crm_marketplace_sync.png)
*Hình 6.1: Giao diện CRM Quản trị Sàn giao thương - Kiểm duyệt và điều phối sản phẩm hội viên.*

---

### 6.2. Xem Lưới Danh Mục Sản Phẩm Trên App Hội Viên
1. Trên thanh điều hướng đáy, chọn tab **"Marketplace"**.
2. Duyệt sản phẩm theo dạng lưới 2 cột bắt mắt kèm ảnh bìa, tên sản phẩm, giá bán niêm yết và mức giá ưu đãi nội bộ.
3. Thanh lọc nhanh theo Danh mục ngành hàng:
   - Xây dựng & Vật liệu
   - Công nghệ thông tin & Viễn thông
   - Dịch vụ Pháp lý, Thuế & Kế toán
   - Bất động sản & Cho thuê văn phòng
   - Quà tặng doanh nghiệp & Tiêu dùng

![Lưới Danh mục Sản phẩm Marketplace trên App](images/evidence/sub_34_app_products_grid.png)
*Hình 6.2: Lưới danh mục sản phẩm/dịch vụ B2B do các doanh nghiệp hội viên cung ứng.*

---

### 6.3. Đăng Thêm Mới Sản Phẩm / Dịch Vụ (Create Product)
1. Tại tab Marketplace, nhấn nút **"+ Đăng Sản Phẩm"** (nút nổi tròn góc dưới phải).
2. Modal **"Đăng Sản Phẩm Mới"** mở ra:
   - **Ảnh sản phẩm:** Nhấp chọn để tải ảnh chất lượng cao từ thư viện điện thoại hoặc chụp ảnh trực tiếp.
   - **Tên sản phẩm / Dịch vụ:** Nhập tiêu đề rõ ràng (tối đa 100 ký tự).
   - **Danh mục ngành hàng:** Chọn danh mục phù hợp trong danh sách thả xuống.
   - **Giá niêm yết:** Nhập đơn giá bán ra thị trường (VNĐ).
   - **Ưu đãi cho Hội viên CEO 1983:** Nhập % chiết khấu hoặc quà tặng dành riêng cho anh chị em trong CLB.
   - **Mô tả chi tiết:** Giới thiệu thông số kỹ thuật, quy cách đóng gói, chính sách bảo hành.
   - **Số điện thoại / Zalo phụ trách:** Hotline kinh doanh tiếp nhận đơn.
3. Nhấn **"Đăng tải ngay"**. Sản phẩm xuất hiện ngay trong gian hàng của doanh nghiệp.

![Modal Đăng Thêm Mới Sản Phẩm Dịch Vụ](images/evidence/sub_35_app_product_create_modal.png)
*Hình 6.3: Form đăng tải sản phẩm mới đầy đủ hình ảnh, giá niêm yết và ưu đãi hội viên.*

---

### 6.4. Xem Chi Tiết Sản Phẩm (Product Detail Modal)
1. Nhấp vào bất kỳ sản phẩm nào trên lưới.
2. Modal Chi tiết Sản phẩm hiển thị:
   - Trình xem ảnh phóng to, thông tin nhà sản xuất (Tên công ty hội viên, Logo, Đánh giá uy tín).
   - Bảng giá ưu đãi độc quyền cho thành viên CLB.
   - Nút **"Gọi điện đặt hàng"** và **"Nhắn tin thương thảo"**: Chạm để mở ngay cuộc trò chuyện trực tiếp với chủ doanh nghiệp.

![Modal Xem Chi Tiết Sản Phẩm](images/evidence/sub_36_app_product_detail_modal.png)
*Hình 6.4: Chi tiết sản phẩm kèm thông tin nhà cung cấp và nút kết nối giao thương.*

---

### 6.5. Thao Tác CHỈNH SỬA & XÓA Sản Phẩm (Thao Tác Menu 3 Chấm)
Đối với các sản phẩm do chính doanh nghiệp của bạn đăng tải:
1. Mở màn hình Chi tiết sản phẩm hoặc vào mục **"Sản phẩm của tôi"**.
2. Trên góc trên bên phải của thẻ sản phẩm, nhấp vào biểu tượng **Menu 3 chấm (\`...\`)**.
3. Menu thao tác trượt lên với 2 tùy chọn:
   - **Chỉnh sửa sản phẩm:** Mở lại form để cập nhật lại giá bán, thay đổi ảnh mô tả hoặc bổ sung chương trình ưu đãi mới ➔ Nhấn **"Lưu thay đổi"**.
   - **Xóa sản phẩm:** Hiển thị hộp thoại cảnh báo: *"Bạn có chắc chắn muốn xóa sản phẩm này khỏi Sàn giao thương?"* ➔ Nhấn **"Xác nhận xóa"** để gỡ hoàn toàn sản phẩm khỏi hệ thống.

![Thao tác Menu 3 chấm: Chỉnh sửa và Xóa sản phẩm](images/evidence/sub_38_app_product_3dots_actions.png)
*Hình 6.5: Menu 3 chấm thao tác Quản trị sản phẩm: Chỉnh sửa nội dung hoặc Xóa bài đăng.*

---

## 7. BẢNG TIN CƠ HỘI KẾT NỐI KINH DOANH: ĐĂNG MỚI, CHỈNH SỬA, ĐÓNG & NHẬN DEAL (KÈM ẢNH CRM LIÊN QUAN)

### 7.1. Luồng CRM Giám Sát & Thống Kê Giao Thương B2B (Chức năng CRM tương ứng)
1. Ban quản trị truy cập CRM menu **"Cơ hội Kinh doanh"** (\`/opportunities\`).
2. Theo dõi lưu lượng nhu cầu mua - bán phát sinh trong nội bộ hiệp hội.
3. Giám sát các thương vụ đã được hội viên kết nối thành công, tổng hợp báo cáo định kỳ về giá trị giao thương đạt được của CLB.

![CRM: Giám sát và đồng bộ cơ hội kết nối giao thương B2B](images/evidence/sub_42_crm_opportunities_sync.png)
*Hình 7.1: Giao diện CRM Giám sát dòng chảy cơ hội giao thương và nhu cầu hợp tác.*

---

### 7.2. Xem Bảng Tin Cơ Hội Kinh Doanh Trên App Hội Viên
1. Trên thanh điều hướng đáy, chọn tab **"Cơ hội"** (Matching Leads).
2. Bảng tin hiển thị danh sách các bài đăng nhu cầu thực tế từ các doanh nghiệp thành viên:
   - **Nhu cầu Cần Mua:** Doanh nghiệp tìm nguồn cung ứng hàng hóa, nhà thầu phụ, vật tư.
   - **Nhu cầu Cần Bán / Cung ứng:** Doanh nghiệp cung ứng năng lực sản xuất, giải pháp độc quyền.
   - **Hợp tác Đầu tư / Đại lý:** Tìm kiếm đối tác nhượng quyền, phân phối vùng miền.
3. Mỗi thẻ cơ hội ghi rõ: Tiêu đề nhu cầu, Ngân sách dự kiến, Thời hạn hoàn thành và Doanh nghiệp đăng bài.

![Bảng tin Cơ hội Kinh doanh Business Matching trên App](images/evidence/sub_39_app_opportunities_feed.png)
*Hình 7.2: Bảng tin cơ hội kinh doanh B2B cập nhật liên tục từ các doanh nghiệp hội viên.*

---

### 7.3. Đăng Mới Cơ Hội Kinh Doanh (Create Opportunity)
1. Tại tab Cơ hội, nhấn nút **"+ Tạo Cơ Hội"**.
2. Điền thông tin vào Modal tạo cơ hội:
   - **Tiêu đề cơ hội:** Tóm tắt ngắn gọn nhu cầu (vd: *"Tìm nhà thầu thi công nội thất văn phòng 500m2 tại Cầu Giấy"*).
   - **Loại cơ hội:** Chọn Cần Mua / Cần Bán / Hợp tác Dự án.
   - **Ngân sách dự kiến (VNĐ):** Nhập khoảng ngân sách (vd: 500.000.000đ - 1.000.000.000đ).
   - **Hạn chót tiếp nhận hồ sơ:** Chọn ngày kết thúc tiếp nhận chào giá.
   - **Mô tả yêu cầu chi tiết:** Tiêu chuẩn chất lượng, hồ sơ năng lực cần nộp, tiến độ mong muốn.
3. Nhấn **"Đăng bài kết nối"**. Bài viết hiển thị ngay lập tức trên Bảng tin cho toàn bộ hội viên thấy.

![Modal Đăng mới Cơ hội Kinh doanh](images/evidence/sub_40_app_opportunity_create_modal.png)
*Hình 7.3: Form đăng tải nhu cầu kết nối kinh doanh với đầy đủ ngân sách và thời hạn.*

---

### 7.4. Xem Chi Tiết Cơ Hội & Nhận Kết Nối (Claim Deal)
1. Nhấp vào thẻ cơ hội bất kỳ trên Bảng tin.
2. Màn hình Chi tiết hiển thị thông tin đầy đủ và tên doanh nghiệp mời thầu/hợp tác.
3. **Thao tác Nhận Cơ Hội (Claim Opportunity):**
   - Nếu doanh nghiệp của bạn có năng lực đáp ứng, nhấn nút **"Nhận Cơ Hội Kết Nối (Claim Deal)"**.
   - Hệ thống tự động xác nhận kết nối và mở ngay kênh chat 1-1 riêng tư giữa 2 doanh nghiệp để gửi hồ sơ báo giá.
   - Trạng thái cơ hội cập nhật số lượt đối tác đã tiếp cận.

![Chi tiết Cơ hội Kinh doanh và Nút Nhận Cơ Hội (Claim Deal)](images/evidence/sub_41_app_opportunity_detail_modal.png)
*Hình 7.4: Chi tiết cơ hội kinh doanh kèm nút nhận kết nối và thương thảo trực tiếp.*

---

### 7.5. Thao Tác CHỈNH SỬA & ĐÓNG / XÓA Cơ Hội Kinh Doanh
Đối với cơ hội do chính doanh nghiệp của bạn đăng:
1. Mở bài đăng cơ hội của bạn.
2. Nhấp vào menu tùy chọn ở góc bài viết:
   - **Chỉnh sửa nội dung:** Bổ sung yêu cầu kỹ thuật, thay đổi mức ngân sách hoặc gia hạn thời gian tiếp nhận chào giá.
   - **Đóng cơ hội (Closed):** Đánh dấu đã tìm được đối tác thành công để ngừng tiếp nhận thêm đề xuất mới.
   - **Xóa bài đăng:** Hủy bỏ bài đăng khi không còn nhu cầu.

---

## 8. DANH BẠ HỘI VIÊN, HỒ SƠ DOANH NGHIỆP 360°, KẾT NỐI & MỜI HỘI VIÊN

### 8.1. Danh Bạ Hội Viên Doanh Nhân
1. Chọn tab **"Hội viên"** trên thanh điều hướng đáy.
2. Danh bạ số hiển thị danh sách toàn thể thành viên CLB CEO 1983:
   - Avatar doanh nhân, Họ và tên, Chức vụ trong ban lãnh đạo hiệp hội.
   - Tên pháp nhân công ty, Ngành nghề kinh doanh chính.
   - Thanh tìm kiếm thông minh: Tìm theo tên doanh nhân, tên công ty, hoặc mã số thuế.
   - Bộ lọc theo Chi hội / Ban chuyên môn (Ban Xây dựng, Ban Tài chính, Ban Thương mại,...).

![Danh bạ Hội viên Doanh nhân Hiệp hội CEO 1983](images/evidence/sub_16_app_members_directory.png)
*Hình 8.1: Danh bạ hội viên với công cụ tìm kiếm và lọc theo ngành nghề chuyên môn.*

---

### 8.2. Xem Hồ Sơ Doanh Nghiệp 360° (Member Profile Modal)
1. Nhấp vào tên hoặc ảnh của bất kỳ hội viên nào trong danh bạ.
2. Modal Hồ sơ Doanh nghiệp 360° mở ra:
   - **Thông tin Doanh nhân:** Ảnh chân dung, tiểu sử tóm tắt, vai trò trong hiệp hội.
   - **Hồ sơ Pháp nhân Công ty:** Giới thiệu quy mô công ty, MST, website chính thức, địa chỉ trụ sở.
   - **Danh mục Sản phẩm cung ứng:** Các sản phẩm tiêu biểu của doanh nghiệp trên Marketplace.
   - **Phương thức liên hệ trực tiếp:** Số điện thoại, Email, mạng xã hội và nút bấm gọi/chat.

![Hồ sơ Doanh nghiệp Chi tiết 360 độ của Hội viên](images/evidence/sub_17_app_member_profile_modal.png)
*Hình 8.2: Hồ sơ chi tiết hội viên với đầy đủ năng lực doanh nghiệp và thông tin liên hệ.*

---

### 8.3. Thao Tác BẬT/TẮT KẾT NỐI (Connect Toggle) & MỜI HỘI VIÊN MỚI
1. **Bật/Tắt Kết nối (Connect Toggle):**
   - Trên hồ sơ hội viên, nhấn nút **"Kết nối"**.
   - Trạng thái chuyển sang **"Đang kết nối"** (Connected), cho phép hai bên xem đầy đủ danh thiếp nội bộ và bắt đầu gửi tin nhắn trực tiếp không giới hạn.
   - Có thể chạm lại để ngắt kết nối khi cần thiết.
2. **Mời Hội Viên Mới Tham Gia CLB (Invite Member):**
   - Tại đầu danh bạ, nhấn nút **"+ Mời Hội Viên Mới"**.
   - Modal hiển thị mã giới thiệu cá nhân và liên kết mời tham gia CLB.
   - Nhấn **"Sao chép liên kết"** hoặc **"Chia sẻ qua Zalo/Facebook"** để giới thiệu các doanh nhân chất lượng gia nhập CLB CEO 1983.

![Thao tác Bật/Tắt Kết nối Hội viên](images/evidence/sub_18_app_connection_toggle.png)
*Hình 8.3: Nút toggle Kết nối đối tác giúp mở rộng mạng lưới giao thương nội bộ.*

![Modal Mời Hội Viên Mới Gia Nhập Hiệp Hội](images/evidence/sub_19_app_invite_member_modal.png)
*Hình 8.4: Tính năng Mời doanh nhân mới gia nhập hiệp hội bằng mã QR và liên kết giới thiệu.*

---

## 9. HỘP THƯ TIN NHẮN, TẠO NHÓM, CHAT 1-1, GỬI ĐỊNH VỊ GPS & GỌI ĐIỆN MESSENGER

### 9.1. Hộp Thư Đến & Tạo Nhóm Đàm Thoại Mới
1. Chọn biểu tượng **Tin nhắn (Messenger)** ở thanh điều hướng.
2. Danh sách các cuộc trò chuyện gần nhất hiển thị:
   - Avatar đối tác, tên công ty, nội dung tin nhắn mới nhất và thời gian gửi.
   - Chấm xanh báo hiệu đối tác đang trực tuyến (Online).
3. **Tạo Nhóm Đàm Thoại (Create Group):**
   - Nhấn biểu tượng dấu **"+"** góc trên phải.
   - Đặt tên nhóm dự án (vd: *"Tổ hợp Thầu Dự Án Xây Dựng 1983"*).
   - Chọn các doanh nhân từ danh bạ để thêm vào nhóm ➔ Nhấn **"Tạo nhóm"**.

![Hộp thư Tin nhắn Messenger trên App](images/evidence/sub_20_app_messages_inbox.png)
*Hình 9.1: Hộp thư đến quản lý toàn bộ các luồng hội thoại cá nhân và hội nhóm dự án.*

![Modal Tạo Nhóm Đàm Thoại Dự Án Mới](images/evidence/sub_21_app_create_group_modal.png)
*Hình 9.2: Form tạo nhóm chat đàm thoại nhiều thành viên theo dự án hoặc ban ngành.*

---

### 9.2. Trò Chuyện Trực Tiếp 1-1 & Khung Công Cụ Mở Rộng
1. Nhấp vào cuộc trò chuyện với một hội viên để mở phòng chat riêng tư.
2. Hệ thống hỗ trợ đầy đủ các tính năng trò chuyện cao cấp:
   - Nhắn tin văn bản thời gian thực kèm trạng thái "Đã gửi", "Đã nhận", "Đã xem".
   - Bấm nút **"+" (Khung công cụ mở rộng)** cạnh ô nhập văn bản để:
     - Gửi tài liệu hợp đồng, hồ sơ năng lực định dạng PDF/Word/Excel.
     - Chụp ảnh trực tiếp công trình, nhà máy hoặc gửi ảnh từ thư viện.

![Trò chuyện Trực tiếp 1-1 với Bong bóng Tin nhắn](images/evidence/sub_22_app_chat_1on1_bubble.png)
*Hình 9.3: Giao diện Chat 1-1 với bố cục tin nhắn chuyên nghiệp và bảo mật cao.*

![Khung công cụ mở rộng gửi hình ảnh và tệp tài liệu](images/evidence/sub_23_app_chat_input_expander.png)
*Hình 9.4: Khung công cụ mở rộng hỗ trợ chia sẻ tệp tài liệu, hình ảnh và định vị GPS.*

---

### 9.3. Gửi Định Vị Trụ Sở Công Ty (Location Pin) & Thu Hồi Tin Nhắn
1. **Gửi Định Vị Trụ Sở (Location Pin):**
   - Trong khung công cụ mở rộng, chọn biểu tượng **"Vị trí"**.
   - Ứng dụng lấy tọa độ GPS chính xác của bạn hoặc cho phép ghim địa chỉ trụ sở công ty.
   - Thẻ vị trí gửi vào đoạn chat với nút bấm **"Mở chỉ đường trên Bản đồ"** giúp đối tác lái xe đến thẳng văn phòng của bạn.
2. **Thu Hồi Tin Nhắn:**
   - Trường hợp gửi nhầm nội dung, nhấn giữ vào tin nhắn đó và chọn **"Thu hồi tin nhắn"**.
   - Hệ thống xóa nội dung ở cả hai phía người gửi và người nhận.

![Chia sẻ Định vị Trụ sở Công ty trong Chat](images/evidence/sub_24_app_chat_location_pin.png)
*Hình 9.5: Tính năng gửi ghim vị trí trụ sở công ty hỗ trợ đối tác đến làm việc.*

![Tính năng Thu hồi Tin nhắn đã gửi](images/evidence/sub_25_app_chat_recalled_msg.png)
*Hình 9.6: Trạng thái tin nhắn đã được thu hồi an toàn.*

---

### 9.4. Cuộc Gọi Thoại / Video Trực Tiếp Trên App (Call Popup)
1. Ở góc trên màn hình chat, nhấp vào biểu tượng **Chiếc điện thoại (Cuộc gọi)**.
2. Popup cuộc gọi hiển thị thông tin doanh nhân đang gọi đến.
3. Hai bên kết nối đàm thoại âm thanh chất lượng cao để trao đổi nhanh công việc mà không tốn cước viễn thông truyền thống.

![Popup Cuộc gọi Thoại Messenger trên App](images/evidence/sub_26_app_chat_call_popup.png)
*Hình 9.7: Giao diện thực hiện cuộc gọi thoại trực tiếp giữa các hội viên doanh nhân.*

---

## 10. MENU CÁ NHÂN, DANH THIẾP SỐ, KÊNH TRỢ GIÚP & ĐỌC HƯỚNG DẪN SỬ DỤNG TRỰC TIẾP TRONG APP

### 10.1. Menu Cá Nhân & Danh Thiếp Số
1. Chọn tab **"Cá nhân"** (Tài khoản) ở góc dưới cùng bên phải.
2. Màn hình quản trị tài khoản cung cấp:
   - Thông tin cá nhân, chức vụ và gói hội viên hiện tại.
   - **Kho Danh thiếp số:** Quản lý danh thiếp cá nhân và danh thiếp doanh nghiệp.
   - Lịch sử tham gia các hoạt động và huy hiệu cống hiến.

![Menu Quản trị Cá nhân và Tài khoản Hội viên](images/evidence/sub_43_app_profile_menu.png)
*Hình 10.1: Menu quản lý tài khoản cá nhân, bảo mật và các tiện ích mở rộng.*

![Kho Quản lý Danh thiếp số Điện tử](images/evidence/sub_44_app_digital_business_cards.png)
*Hình 10.2: Danh sách các danh thiếp số công vụ của doanh nhân trong hệ thống.*

---

### 10.2. Kênh Trợ Giúp & Liên Hệ Ban Thư Ký CLB
1. Trong menu Cá nhân, chọn **"Liên hệ Ban Thư ký"**.
2. Modal hỗ trợ hiển thị:
   - Hotline tiếp nhận hỗ trợ 24/7 của Văn phòng Hiệp hội CEO 1983.
   - Kênh Zalo Official Account chính thức.
   - Form gửi kiến nghị trực tiếp lên Ban Chấp Hành CLB.

![Modal Liên hệ và Tiếp nhận Trợ giúp từ Ban Thư ký](images/evidence/sub_45_app_contact_secretariat_modal.png)
*Hình 10.3: Kênh trợ giúp nhanh kết nối trực tiếp với Ban Thư ký CLB CEO 1983.*

---

### 10.3. Đọc Hướng Dẫn Sử Dụng Trực Tiếp Trong App (In-App PDF Viewer)
1. Trong menu Cá nhân, chọn **"Hướng dẫn sử dụng"**.
2. Hệ thống tích hợp sẵn trình xem tài liệu nội bộ:
   - Đọc trực tiếp cuốn cẩm nang hướng dẫn sử dụng đầy đủ hình ảnh ngay trên điện thoại mà không cần tải thêm ứng dụng ngoài.
   - Hỗ trợ phóng to, thu nhỏ, lật trang mượt mà và nút tải file về máy.

![Trình Xem Tài Liệu Hướng Dẫn Sử Dụng Tích Hợp Trong App](images/evidence/sub_46_app_user_guide_modal.png)
*Hình 10.4: Trình đọc tài liệu cẩm nang hướng dẫn sử dụng tích hợp trực tiếp trên ứng dụng.*

---

### 10.4. Cài Đặt Mật Khẩu, Bảo Mật, Thông Báo & Bảng Tin Hoạt Động
1. **Bảo mật & Đổi mật khẩu:** Cập nhật mật khẩu mới định kỳ để bảo vệ tài khoản doanh nghiệp.
2. **Trung tâm Thông báo:** Lưu trữ các thông báo nhắc nhở lịch sự kiện, thông báo duyệt sản phẩm, thông báo kết nối mới.
3. **Bảng tin CLB (News Screen):** Cập nhật tin tức đại hội, quyết định kết nạp hội viên mới, các chương trình caravan xúc tiến thương mại.

![Cài đặt Mật khẩu và Bảo mật Tài khoản](images/evidence/sub_47_app_settings_password_security.png)
*Hình 10.5: Màn hình thiết lập mật khẩu mới và chính sách an toàn thông tin.*

![Trung tâm Thông báo Đẩy trên App](images/evidence/sub_48_app_notifications_screen.png)
*Hình 10.6: Trung tâm tiếp nhận và lưu trữ thông báo hoạt động của hội viên.*

![Bảng tin Tin tức và Hoạt động của Hiệp hội](images/evidence/sub_49_app_news_screen.png)
*Hình 10.7: Bảng tin tổng hợp các tin tức, phóng sự và văn bản chỉ đạo của CLB.*

---

## 11. QUẢN LÝ HỘI PHÍ THƯỜNG NIÊN (KÈM ẢNH CRM LIÊN QUAN)

### 11.1. Tra Cứu & NỘP HỘI PHÍ Trên App
1. Trong mục Thẻ hội viên hoặc menu Cá nhân, chọn **"Hội phí thường niên"**.
2. Kiểm tra ngày hết hạn hội phí và số tiền phí duy trì tư cách hội viên theo quy chế.
3. Quét mã VietQR của Ban Tài chính CLB để chuyển khoản gia hạn.

---

### 11.2. Luồng CRM Đối Soát & Gạch Nợ Hội Phí (Chức năng CRM tương ứng)
1. Ban Kế toán đăng nhập CRM menu **"Quản lý Hội phí & Hội phí"** (\`/fees\`).
2. Kiểm tra danh sách doanh nghiệp đến kỳ gia hạn và đối chiếu sao kê tài khoản ngân hàng.
3. **Thao tác Gạch nợ (Fee Toggle):**
   - Bật chuyển công tắc trạng thái hội phí sang **"Đã hoàn thành"**.
   - Thời hạn hiệu lực trên Thẻ Hội Viên VIP của hội viên trên App lập tức tự động gia hạn thêm +1 năm tương ứng.

![CRM: Quản lý danh sách ĐÓNG HỘI PHÍ của các doanh nghiệp](images/evidence/sub_50_crm_fees_management.png)
*Hình 11.1: Màn hình CRM Quản lý Hội phí theo dõi tình hình NỘP HỘI PHÍ của các công ty thành viên.*

![CRM: Thao tác Bật/Tắt Gạch nợ Hội phí để gia hạn Thẻ VIP trên App](images/evidence/sub_51_crm_companies_fee_toggle.png)
*Hình 11.2: Công tắc gạch nợ hội phí trên CRM - Tự động đồng bộ gia hạn hiệu lực thẻ trên App di động.*

---
*Tài liệu được biên soạn và chuẩn hóa bởi Ban Công nghệ & Kỹ thuật VIONE - Hiệp hội Doanh nhân CEO 1983.*
`;
}

// ----------------------------------------------------------------------------
// 2. GENERATE CRM USER GUIDE MARKDOWN & HTML (HUONG_DAN_SU_DUNG_CRM)
// ----------------------------------------------------------------------------
function buildCrmGuideMarkdown() {
  return `# HƯỚNG DẪN SỬ DỤNG CHI TIẾT HỆ THỐNG WEB CRM QUẢN TRỊ HIỆP HỘI CLB CEO 1983
**Phân hệ:** Web CRM Admin Portal — **Đơn vị vận hành:** Ban Quản Trị & Ban Thư Ký CLB Doanh Nhân CEO 1983  
**Nền tảng công nghệ:** VIONE Ecosystem Pro — **Phiên bản:** v2.6.0 Pro  
**Ngày cập nhật:** 18/09/2026 — **Môi trường:** Live Production Staging (\`http://14.225.217.232:5000/auth\`)  
**Tài liệu kèm ảnh chụp thực tế 100% mọi chức năng đang vận hành trong hệ thống**

---

## 📑 MỤC LỤC CHI TIẾT

1. [DANH MỤC TÀI KHOẢN VẬN HÀNH & PHÂN QUYỀN QUẢN TRỊ (RBAC)](#1-danh-mục-tài-khoản-vận-hành--phân-quyền-quản-trị-rbac)
2. [ĐĂNG NHẬP HỆ THỐNG & GIAO DIỆN CHUẨN XANH - TRẮNG SANG TRỌNG](#2-đăng-nhập-hệ-thống--giao-diện-chuẩn-xanh---trắng-sang-trọng)
3. [BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD) & THEO DÕI CHỈ SỐ KPI](#3-bảng-điều-khiển-tổng-quan-dashboard--theo-dõi-chỉ-số-kpi)
4. [QUẢN TRỊ DANH BẠ HỘI VIÊN & HỒ SƠ DOANH NGHIỆP 360°](#4-quản-trị-danh-bạ-hội-viên--hồ-sơ-doanh-nghiệp-360)
   - 4.1. Tiếp nhận hồ sơ đăng ký mới từ Landing Page & App
   - 4.2. Xem Drawer chi tiết hồ sơ hội viên
   - 4.3. Thao tác Phê duyệt (Approve) & Từ chối (Reject)
   - 4.4. Phân bổ Ban chuyên môn, Gán vai trò & Phân quyền
   - 4.5. Khóa, Mở khóa tài khoản & Xuất dữ liệu Excel
5. [QUẢN TRỊ SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & QUÉT MÃ QR CHECK-IN CỔNG](#5-quản-trị-sự-kiện-sơ-đồ-khán-phòng--quét-mã-qr-check-in-cổng)
   - 5.1. Danh sách sự kiện & Bộ lọc trạng thái
   - 5.2. Tạo Mới Sự Kiện (Banner, Lịch trình, Diễn giả, Cấu hình vé VietQR)
   - 5.3. Cấu hình Sơ đồ Khán phòng (Cinema Seating Map)
   - 5.4. Quản lý Danh sách Đăng ký & Quét mã QR Điểm danh tốc độ cao
6. [QUẢN TRỊ SÀN GIAO THƯƠNG MARKETPLACE (KIỂM DUYỆT & ĐỒNG BỘ APP)](#6-quản-trị-sàn-giao-thương-marketplace-kiểm-duyệt--đồng-bộ-app)
   - 6.1. Kiểm duyệt sản phẩm đăng tải từ App hội viên
   - 6.2. Ẩn / Khóa / Mở sản phẩm & Gắn nhãn sản phẩm tiêu biểu
7. [QUẢN TRỊ CƠ HỘI KẾT NỐI GIAO THƯƠNG B2B (BUSINESS MATCHING SYNC)](#7-quản-trị-cơ-hội-kết-nối-giao-thương-b2b-business-matching-sync)
   - 7.1. Giám sát các luồng nhu cầu Cần Mua - Cần Bán
   - 7.2. Theo dõi các thương vụ Claim thành công & Thống kê giá trị giao dịch
8. [QUẢN LÝ HOẠT ĐỘNG SỰ KIỆN: BÌNH CHỌN TRỰC TIẾP & BỐC THĂM MAY MẮN](#8-quản-lý-hoạt-động-sự-kiện-bình-chọn-trực-tiếp--bốc-thăm-may-mắn)
   - 8.1. Thiết lập phiên biểu quyết Live Voting thời gian thực
   - 8.2. Cấu hình vòng quay may mắn Lucky Draw
9. [QUẢN TRỊ DOANH NGHIỆP THÀNH VIÊN (COMPANIES MANAGEMENT)](#9-quản-trị-doanh-nghiệp-thành-viên-companies-management)
10. [QUẢN LÝ TÀI CHÍNH & HỘI PHÍ THƯỜNG NIÊN & THU CHI (FINANCE & DUES)](#10-quản-lý-tài-chính--hội-phí-thường-niên--thu-chi-finance--dues)
    - 10.1. Theo dõi BẢNG HỘI PHÍ hội viên theo niên độ
    - 10.2. Bật / Tắt Gạch nợ Hội phí (Fee Toggle) sau khi đối soát sao kê
11. [QUẢN LÝ TIN TỨC, NGHỊ QUYẾT & TRUYỀN THÔNG (NEWS & MEDIA)](#11-quản-lý-tin-tức-nghị-quyết--truyền-thông-news--media)
12. [CẤU HÌNH HỆ THỐNG, TÀI KHOẢN VIETQR THỤ HƯỞNG & NHẬT KÝ KIỂM TOÁN](#12-cấu-hình-hệ-thống-tài-khoản-vietqr-thụ-hưởng--nhật-ký-kiểm-toán)

---

## 1. DANH MỤC TÀI KHOẢN VẬN HÀNH & PHÂN QUYỀN QUẢN TRỊ (RBAC)

Hệ thống Web CRM Quản trị áp dụng mô hình phân quyền chặt chẽ Role-Based Access Control:

| STT | Vai Trò Quản Trị | Tài Khoản Email | Mật Khẩu | Quyền Hạn Nghiệp Vụ |
|:---:|---|---|:---:|---|
| 1 | **Quản Trị Viên Cấp Cao (Super Admin)** | \`admin@connect.vn\` | \`123456\` | Toàn quyền kiểm soát hệ thống: Cấu hình hệ thống, duyệt hội viên, tài chính, kiểm toán logs |
| 2 | **Tổng Thư Ký CLB (Executive Admin)** | \`ceo.tongthuky@ceo1983.com\` | \`123456\` | Điều phối hoạt động, thẩm định hồ sơ hội viên mới, xuất bản tin tức, tạo sự kiện |
| 3 | **Trưởng Ban Sự Kiện (Event Manager)** | \`events@ceo1983.com\` | \`123456\` | Tạo và quản lý sự kiện, cấu hình khán phòng, quét mã QR check-in, vận hành Voting & Lucky Draw |
| 4 | **Trưởng Ban Tài Chính (Finance Manager)** | \`finance@ceo1983.com\` | \`123456\` | QUẢN LÝ HỘI PHÍ, đối soát sao kê ngân hàng VietQR, gạch nợ hội phí, báo cáo thu chi |

![CRM: Phân quyền vai trò và phân bổ ban ngành](images/evidence/02_crm_members_roles_permission.png)
*Hình 1.1: Giao diện quản lý vai trò và phân quyền hạn người dùng trên hệ thống CRM.*

---

## 2. ĐĂNG NHẬP HỆ THỐNG & GIAO DIỆN CHUẨN XANH - TRẮNG SANG TRỌNG

1. Truy cập cổng Web CRM tại địa chỉ: \`http://14.225.217.232:5000/auth\`.
2. Giao diện Đăng nhập được thiết kế chuẩn **Xanh Navy - Trắng ngà**, loại bỏ hoàn toàn các thương hiệu không liên quan, làm nổi bật nhận diện Hiệp hội Doanh nghiệp & VIONE Platform:
   - Biểu tượng huy hiệu hiệp hội trang trọng.
   - Trường nhập Email quản trị viên.
   - Trường nhập Mật khẩu bảo mật.
   - Nút bấm **"Đăng Nhập Quản Trị"** với hiệu ứng chuyển động mượt mà.
3. Sau khi xác thực thành công, hệ thống điều hướng trực tiếp vào Bảng điều khiển Tổng quan (Dashboard).

![Màn hình Đăng nhập Web CRM Xanh - Trắng sang trọng](images/evidence/01_crm_login_blue_white.png)
*Hình 2.1: Màn hình Đăng nhập CRM quản trị chuẩn nhận diện Xanh - Trắng sang trọng.*

---

## 3. BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD) & THEO DÕI CHỈ SỐ KPI

Bảng điều khiển Tổng quan (\`/\`) cung cấp cho Ban Lãnh đạo CLB cái nhìn toàn cảnh về tình hình vận hành:
- **Thẻ KPI Hội Viên:** Tổng số hội viên chính thức, số lượng hồ sơ mới chờ thẩm định trong tuần, tỷ lệ tăng trưởng thành viên.
- **Thẻ KPI Sự Kiện:** Số sự kiện đang mở đăng ký, tổng số lượng vé đã phát hành, doanh thu vé sự kiện thu qua VietQR.
- **Thẻ KPI Kết Nối Giao Thương (B2B):** Số lượng cơ hội kinh doanh đang mở, số thương vụ đã được kết nối (Claimed), ước tính tổng giá trị giao dịch nội khối.
- **Biểu đồ Tài chính & Hội phí:** Tỷ lệ hội viên đã hoàn thành hội phí năm hiện tại so với cùng kỳ.

![Bảng điều khiển Tổng quan Dashboard KPI CRM](images/evidence/sub_06_crm_dashboard_kpi.png)
*Hình 3.1: Bảng điều khiển CRM Dashboard với các chỉ số KPI thời gian thực về Hội viên, Sự kiện và Giao thương.*

---

## 4. QUẢN TRỊ DANH BẠ HỘI VIÊN & HỒ SƠ DOANH NGHIỆP 360°

### 4.1. Tiếp Nhận Hồ Sơ Đăng Ký Mới Từ Landing Page & App
1. Truy cập menu bên trái: **"Hội viên" ➔ "Danh sách Hội viên"** (\`/members\`).
2. Bảng danh sách hội viên hiển thị đầy đủ các cột thông tin:
   - Họ và tên, Avatar doanh nhân.
   - Tên công ty pháp nhân, Mã số thuế.
   - Ban chuyên môn sinh hoạt.
   - Ngày nộp hồ sơ đăng ký.
   - Trạng thái: **"Chờ phê duyệt"** (màu vàng), **"Đang hoạt động"** (màu xanh), **"Tạm khóa"** (màu đỏ).

![CRM: Danh sách Quản lý Hội viên](images/evidence/sub_07_crm_members_list.png)
*Hình 4.1: Màn hình CRM Quản lý Danh bạ Hội viên và danh sách hồ sơ mới tiếp nhận.*

---

### 4.2. Xem Drawer Chi Tiết Hồ Sơ Hội Viên 360°
1. Nhấp chuột vào bất kỳ dòng hội viên nào trong danh sách.
2. Drawer thông tin chi tiết trượt ra từ bên phải màn hình:
   - **Hồ sơ cá nhân:** CCCD/Hộ chiếu, ngày sinh, số điện thoại, email.
   - **Hồ sơ pháp nhân:** Giấy phép ĐKKD, vốn điều lệ, lĩnh vực kinh doanh, website.
   - **Tư cách hội viên:** Số thẻ hội viên dự kiến, người giới thiệu gia nhập CLB.

![CRM: Drawer Chi Tiết Hồ Sơ Hội Viên 360 độ](images/evidence/sub_08_crm_member_detail_drawer.png)
*Hình 4.2: Drawer xem chi tiết hồ sơ hội viên phục vụ thẩm định tư cách doanh nghiệp.*

---

### 4.3. Thao Tác Phê Duyệt (Approve) & Từ Chối (Reject)
1. Trong Drawer chi tiết hoặc tại cột thao tác nhanh trên danh sách:
   - Nhấp nút **"Phê duyệt (Approve)"**:
     - Hệ thống hiển thị hộp thoại xác nhận.
     - Sau khi bấm xác nhận: Trạng thái chuyển sang **"Hoạt động (Active)"**.
     - CSDL tự động kích hoạt tài khoản đăng nhập trên Mobile App cho hội viên.
     - Sinh Thẻ Hội Viên VIP Kỹ Thuật Số kèm mã định danh độc bản.
   - Nhấp nút **"Từ chối (Reject)"**:
     - Nhập lý do từ chối (vd: Không đúng đối tượng quy chế, thông tin pháp nhân chưa hợp lệ).
     - Hệ thống lưu vết lý do và thông báo cho doanh nghiệp.

![CRM: Thao tác Bấm nút Phê duyệt (Approve) Hội viên](images/evidence/sub_09_crm_approve_action.png)
*Hình 4.3: Thao tác phê duyệt hội viên chính thức trên Web CRM.*

![CRM: Trạng thái Hội viên đã được Phê duyệt Thành công](images/evidence/sub_09_crm_approve_action.png)
*Hình 4.4: Thông báo xác nhận phê duyệt thành công - Hội viên được cấp quyền truy cập Mobile App ngay lập tức.*

---

### 4.4. Phân Bổ Ban Chuyên Môn & Gán Vai Trò
1. Trong form chỉnh sửa hội viên, chọn tab **"Tổ chức & Ban ngành"**.
2. Chọn Ban chuyên môn trực thuộc: Ban Xúc tiến Thương mại, Ban Sự kiện, Ban Truyền thông, Ban Tài chính - Kiểm tra.
3. Gán chức danh trong hiệp hội: Chủ tịch, Phó chủ tịch, Ủy viên BCH, Trưởng ban, Hội viên chính thức.
4. Nhấn **"Lưu thông tin"**. Chức danh và phù hiệu này lập tức hiển thị trên Thẻ VIP và App điện thoại của hội viên.

---

### 4.5. Khóa, Mở Khóa Tài Khoản & Xuất Dữ Liệu Excel
1. **Khóa / Tạm dừng tài khoản:**
   - Đối với các hội viên vi phạm quy chế hoặc NỢ HỘI PHÍ quá hạn, chọn thao tác **"Khóa tài khoản"**.
   - Hội viên sẽ không thể đăng nhập vào App cho đến khi được mở khóa.
2. **Xuất Danh sách Hội viên ra Excel:**
   - Nhấn nút **"Xuất Excel"** ở góc trên bảng.
   - Hệ thống kết xuất file \`.xlsx\` chuẩn hóa chứa đầy đủ danh bạ phục vụ in ấn hoặc lưu trữ hành chính.

---

## 5. QUẢN TRỊ SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & QUÉT MÃ QR CHECK-IN CỔNG

### 5.1. Danh Sách Sự Kiện & Bộ Lọc Trạng Thái
1. Truy cập menu bên trái: **"Sự kiện" ➔ "Danh sách Sự kiện"** (\`/events\`).
2. Giao diện hiển thị danh sách các sự kiện lớn nhỏ của hiệp hội:
   - Tên chương trình, Ngày giờ tổ chức, Địa điểm tổ chức.
   - Số lượng đại biểu đăng ký / Tổng sức chứa khán phòng.
   - Trạng thái: Nháp, Đang mở đăng ký, Đang diễn ra, Đã kết thúc.

![CRM: Danh sách Quản lý Sự kiện Hiệp hội](images/evidence/sub_27_crm_events_management.png)
*Hình 5.1: Màn hình CRM Quản lý Sự kiện tổng hợp toàn bộ các chương trình hội thảo và đại hội.*

---

### 5.2. Tạo Mới Sự Kiện (Banner, Lịch Trình, Diễn Giả & Cấu Hình Vé VietQR)
1. Nhấn nút **"+ Tạo Sự Kiện Mới"**.
2. Modal Tạo sự kiện mở ra với các tab thiết lập:
   - **Thông tin chung:** Tiêu đề sự kiện, thời gian bắt đầu, thời gian kết thúc, địa chỉ trung tâm hội nghị.
   - **Hình ảnh truyền thông:** Tải lên Banner sự kiện (chuẩn 1920x1080) và ảnh đại diện.
   - **Lịch trình (Agenda):** Thêm các khung giờ hoạt động (Đón khách, Khai mạc, Tọa đàm, Trao kỷ niệm chương, Tiệc giao lưu).
   - **Diễn giả (Keynote Speakers):** Tải ảnh chân dung, nhập họ tên và chức danh các chuyên gia.
   - **Cấu hình Vé & VietQR:**
     - Tùy chọn Vé Miễn Phí (dành riêng hội viên CLB) hoặc Vé Có Phí (nhập đơn giá vé).
     - Thiết lập số lượng vé tối đa được phép phát hành.
3. Nhấn **"Xuất bản Sự kiện"**: Dữ liệu đồng bộ sang App di động của tất cả hội viên trong vòng 1 giây.

![CRM: Modal Tạo Sự Kiện Mới](images/evidence/03_crm_event_create_modal.png)
*Hình 5.2: Modal tạo sự kiện với đầy đủ cấu hình thời gian, địa điểm, diễn giả và giá vé VietQR.*

---

### 5.3. Cấu Hình Sơ Đồ Khán Phòng (Cinema Seating Map)
1. Trong màn hình quản lý sự kiện, chọn tab **"Sơ đồ Chỗ Ngồi (Seating Map)"**.
2. Công cụ đồ họa trực quan cho phép ban tổ chức:
   - Phân chia các hàng ghế: Hàng A, B (Khu vực VIP - Ban Lãnh đạo), Hàng C, D (Khu vực Khách mời danh dự), Hàng E trở đi (Hội viên tiêu chuẩn).
   - Đặt màu sắc phân biệt từng hạng ghế.
   - Khi hội viên đăng ký trên App, số ghế đã chọn sẽ chuyển sang màu xám để tránh trùng lặp.

![CRM: Cấu hình Sơ đồ Khán phòng Cinema Map](images/evidence/sub_28_crm_seating_cinema_map.png)
*Hình 5.3: Công cụ thiết lập sơ đồ khán phòng và gán vị trí ghế ngồi trực quan.*

---

### 5.4. Quản Lý Danh Sách Đăng Ký & Quét Mã QR Điểm Danh Tốc Độ Cao
1. **Danh sách Đăng ký:** Xem chi tiết từng đại biểu đã nhận vé, thời gian chuyển khoản VietQR và số ghế.
2. **Quét Mã QR Điểm Danh (Check-in):**
   - Ban tổ chức tại cổng đón tiếp mở màn hình **"Điểm danh QR"** trên điện thoại hoặc máy tính bảng kết nối CRM.
   - Hướng camera vào Mã QR trên Vé Điện Tử (Ticket Pass) của đại biểu.
   - Hệ thống phát âm thanh "Bíp" xác nhận thành công, màn hình hiển thị ngay: Tên doanh nhân, Công ty, Số ghế và đổi trạng thái sang **"Đã điểm danh"**.
   - Ngăn chặn hoàn toàn tình trạng vé giả hoặc quét trùng lặp 2 lần.

---

## 6. QUẢN TRỊ SÀN GIAO THƯƠNG MARKETPLACE (KIỂM DUYỆT & ĐỒNG BỘ APP)

### 6.1. Kiểm Duyệt Sản Phẩm Đăng Tải Từ App Hội Viên
1. Truy cập CRM menu **"Sàn Giao thương B2B" ➔ "Sản phẩm"** (\`/marketplace\`).
2. Danh sách sản phẩm do các doanh nghiệp tự đăng từ App hiển thị chi tiết:
   - Ảnh sản phẩm, Tên mặt hàng, Tên công ty cung ứng.
   - Đơn giá thị trường và Mức giá ưu đãi riêng cho hội viên CEO 1983.
3. Ban Thư ký duyệt nội dung:
   - Kiểm tra tính phù hợp của hình ảnh và quy chuẩn thông tin.
   - Bấm **"Phê duyệt"** để sản phẩm xuất hiện trên trang nhất của chợ App.

![CRM: Kiểm duyệt và Quản trị Sàn giao thương Marketplace](images/evidence/sub_37_crm_marketplace_sync.png)
*Hình 6.1: Giao diện CRM Quản trị Marketplace - Kiểm soát chất lượng sản phẩm hội viên.*

---

### 6.2. Ẩn / Khóa / Mở Sản Phẩm & Gắn Nhãn Tiêu Biểu
- **Gắn nhãn Sản phẩm Nổi bật:** Ghim các sản phẩm tiêu biểu lên đầu danh mục Marketplace trên App.
- **Tạm dừng / Khóa sản phẩm:** Khi sản phẩm hết hàng hoặc nhận phản ánh chất lượng từ các hội viên khác, quản trị viên có thể bấm **"Tạm dừng hiển thị"**.

---

## 7. QUẢN TRỊ CƠ HỘI KẾT NỐI GIAO THƯƠNG B2B (BUSINESS MATCHING SYNC)

### 7.1. Giám Sát Các Luồng Nhu Cầu Cần Mua - Cần Bán
1. Truy cập CRM menu **"Kết nối Kinh doanh"** (\`/opportunities\`).
2. Theo dõi các bài đăng nhu cầu của doanh nghiệp thành viên:
   - Thống kê các ngành nghề đang có nhu cầu tìm thầu phụ nhiều nhất.
   - Kiểm soát tính xác thực của các bài đăng có ngân sách lớn.

![CRM: Giám sát Cơ hội Kết nối Giao thương B2B](images/evidence/sub_42_crm_opportunities_sync.png)
*Hình 7.1: Màn hình CRM Quản lý Bảng tin Cơ hội Kinh doanh và nhu cầu kết nối.*

---

### 7.2. Theo Dõi Thương Vụ Claim Thành Công & Thống Kê Giao Dịch
- Theo dõi các cơ hội đã được hội viên khác nhấn **"Claim Deal"** để hỗ trợ xúc tiến khi cần.
- Tổng hợp báo cáo giá trị hợp đồng ký kết nội khối định kỳ để báo cáo Đại hội Hiệp hội.

---

## 8. QUẢN LÝ HOẠT ĐỘNG SỰ KIỆN: BÌNH CHỌN TRỰC TIẾP & BỐC THĂM MAY MẮN

### 8.1. Thiết Lập Phiên Biểu Quyết Live Voting Thời Gian Thực
1. Truy cập CRM menu **"Hoạt động Sự kiện" ➔ "Biểu quyết & Bầu cử"** (\`/voting\`).
2. Nhấn **"+ Tạo Phiên Biểu Quyết"**:
   - Nhập nội dung câu hỏi biểu quyết (vd: *"Thông qua Nghị quyết Phương hướng Hoạt động Nhiệm kỳ 2026-2031"*).
   - Nhập các phương án lựa chọn: Đồng ý / Không đồng ý / Ý kiến khác.
3. Khi MC tuyên bố bắt đầu biểu quyết, quản trị viên bấm **"Kích hoạt Phiên bỏ phiếu"**:
   - App của toàn thể hội viên có mặt tại hội trường tự động mở màn hình bỏ phiếu.
   - Màn hình CRM hiển thị biểu đồ tròn kết quả nhảy số thời gian thực để trình chiếu trực tiếp lên màn hình LED sân khấu.

![CRM: Quản lý Phiên Biểu Quyết Live Voting và Quay số Lucky Draw](images/evidence/crm_12_voting_luckydraw.png)
*Hình 8.1: Màn hình điều phối phiên biểu quyết trực tiếp và vòng quay may mắn trên CRM.*

---

### 8.2. Cấu Hình Vòng Quay May Mắn Lucky Draw
1. Chọn tab **"Lucky Draw (Quay số trúng thưởng)"**.
2. Nhập danh sách các giải thưởng: Giải Đặc biệt, Giải Nhất, Giải Nhì, Giải Khuyến khích.
3. Đồng bộ danh sách mã vé của các đại biểu đã check-in thành công qua cổng.
4. Nhấn **"Bắt đầu quay số"** để hiển thị hiệu ứng quay thưởng kịch tính trên sân khấu.

---

## 9. QUẢN TRỊ DOANH NGHIỆP THÀNH VIÊN (COMPANIES MANAGEMENT)

1. Truy cập CRM menu **"Doanh nghiệp"** (\`/companies\`).
2. Quản lý toàn bộ hồ sơ pháp nhân của các công ty hội viên trong hiệp hội:
   - Tên công ty đầy đủ theo giấy phép, Tên viết tắt, Tên thương mại.
   - Mã số thuế, Ngày thành lập, Địa chỉ đăng ký kinh doanh.
   - Quy mô nhân sự, Vốn điều lệ, Xếp hạng quy mô (SME / Tập đoàn).
   - Danh sách các hội viên trực thuộc công ty này.

![CRM: Quản lý Doanh nghiệp Thành viên](images/evidence/crm_09_companies_management.png)
*Hình 9.1: Màn hình CRM Quản lý Hồ sơ Pháp nhân các Doanh nghiệp thành viên.*

---

## 10. QUẢN LÝ TÀI CHÍNH & HỘI PHÍ THƯỜNG NIÊN & THU CHI (FINANCE & DUES)

### 10.1. Theo Dõi BẢNG HỘI PHÍ Hội Viên Theo Niên Độ
1. Truy cập CRM menu **"Tài chính & Hội phí" ➔ "QUẢN LÝ HỘI PHÍ"** (\`/fees\`).
2. Bảng theo dõi hiển thị tình trạng đóng hội phí của từng doanh nghiệp:
   - Kỳ đóng phí: Niên độ 2026 - 2027.
   - Mức phí hội phí quy định (vd: 10.000.000 VNĐ / năm).
   - Ngày đóng gần nhất, Ngày hết hạn hiệu lực thẻ.
   - Trạng thái: **"Đã hoàn thành"** (màu xanh), **"Sắp đến hạn"** (màu cam), **"Quá hạn"** (màu đỏ).

![CRM: QUẢN LÝ HỘI PHÍ THƯỜNG NIÊN](images/evidence/sub_50_crm_fees_management.png)
*Hình 10.1: Bảng theo dõi tình hình ĐÓNG HỘI PHÍ và thực hiện nghĩa vụ hội phí của các doanh nghiệp.*

---

### 10.2. Bật / Tắt Gạch Nợ Hội Phí (Fee Toggle) Sau Khi Đối Soát Sao Kê
1. Khi doanh nghiệp chuyển khoản hội phí qua VietQR hoặc tài khoản ngân hàng của CLB:
   - Ban Kế toán kiểm tra sao kê ngân hàng khớp số tiền và cú pháp.
2. Tìm đến dòng của doanh nghiệp trên bảng \`/fees\`.
3. **Thao tác Gạch nợ (Fee Toggle):**
   - Bật chuyển công tắc gạch nợ sang trạng thái **"BẬT (Đã nộp)"**.
   - Hệ thống tự động ghi nhận biên lai thu phí vào sổ quỹ kế toán.
   - **Đồng bộ tức thì sang App:** Thời hạn trên Thẻ Hội Viên VIP của doanh nhân được cộng thêm +1 năm hiệu lực.

![CRM: Thao tác Bật/Tắt Gạch nợ Hội phí](images/evidence/sub_51_crm_companies_fee_toggle.png)
*Hình 10.2: Công tắc gạch nợ hội phí trên CRM - Cập nhật tự động quyền lợi và hạn thẻ VIP trên App.*

---

## 11. QUẢN LÝ TIN TỨC, NGHỊ QUYẾT & TRUYỀN THÔNG (NEWS & MEDIA)

1. Truy cập CRM menu **"Truyền thông & Tin tức"** (\`/news\`).
2. Nhấn nút **"+ Soạn Tin Mới"**:
   - Nhập Tiêu đề bản tin hoạt động hiệp hội.
   - Chọn Chuyên mục: Tin Đại hội, Bản tin Xúc tiến Thương mại, Quyết định Ban Chấp Hành, Tin Doanh nghiệp Hội viên.
   - Tải lên ảnh bìa và các hình ảnh phóng sự chất lượng cao.
   - Soạn thảo nội dung bài viết với trình soạn thảo phong phú (Rich Text Editor).
3. Tùy chọn **"Gửi Thông Báo Đẩy (Push Notification) Tới App"**:
   - Khi tích chọn mục này và nhấn **"Xuất bản"**, toàn bộ điện thoại của hội viên sẽ nhận được thông báo về tin tức mới.

![CRM: Quản lý Tin tức, Bài viết và Truyền thông](images/evidence/crm_13_news_management.png)
*Hình 11.1: Trình quản lý và xuất bản tin tức, nghị quyết hiệp hội đến ứng dụng di động.*

---

## 12. CẤU HÌNH HỆ THỐNG, TÀI KHOẢN VIETQR THỤ HƯỞNG & NHẬT KÝ KIỂM TOÁN

### 12.1. Cấu Hình Tài Khoản VietQR Thụ Hưởng
1. Truy cập CRM menu **"Cài đặt Hệ thống" ➔ "Tài chính & Thanh toán"**.
2. Thiết lập thông tin tài khoản ngân hàng chính thức của CLB Doanh nhân CEO 1983:
   - Tên ngân hàng thụ hưởng (vd: Vietcombank, MB Bank, Techcombank).
   - Số tài khoản ngân hàng.
   - Tên chủ tài khoản: \`CLB DOANH NHAN CEO 1983\` hoặc đại diện được ủy quyền.
   - Cú pháp quy định thanh toán tự động cho Vé sự kiện và Hội phí.
3. Nhấn **"Lưu cấu hình"**: Toàn bộ mã QR động sinh ra trên App và Web sẽ tự động trỏ về tài khoản này.

---

### 12.2. Quản Lý Danh Sách Quản Trị Viên & Nhật Ký Kiểm Toán (Audit Logs)
1. **Quản lý Tài khoản Quản trị:** Cấp phát tài khoản mới cho cán bộ thư ký, khóa tài khoản nhân sự nghỉ việc.
2. **Nhật ký Kiểm toán (Audit Logs):**
   - Hệ thống tự động ghi lại mọi thao tác quan trọng: Ai duyệt hội viên, ai gạch nợ hội phí, ai tạo sự kiện, vào thời gian nào kèm địa chỉ IP truy cập.
   - Đảm bảo tính minh bạch và an toàn tuyệt đối cho cơ sở dữ liệu hiệp hội.

---
*Tài liệu được biên soạn và chuẩn hóa bởi Ban Công nghệ & Kỹ thuật VIONE - Hiệp hội Doanh nhân CEO 1983.*
`;
}

// ----------------------------------------------------------------------------
// 3. GENERATE BEAUTIFUL HTML FOR PDF EXPORT
// ----------------------------------------------------------------------------
function generateHtmlPage(title, mdContent) {
  // Convert markdown to rich styled HTML
  let html = mdContent
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="sub-title">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="minor-title">$1</h4>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code class="inline-code">$1</code>')
    // Images
    .replace(/!\[(.*?)\]\(images\/evidence\/(.*?)\)/gim, (match, alt, filename) => {
      const b64 = getBase64Image(filename);
      if (b64) {
        return `<div class="img-container"><img src="${b64}" alt="${alt}" /><div class="img-caption">${alt}</div></div>`;
      }
      return `<div class="img-missing">[Hình ảnh: ${alt}]</div>`;
    })
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<span class="doc-link">$1</span>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="divider"/>');

  // Convert tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table class="data-table"><tbody>';
      }
      if (line.includes('---')) {
        continue; // skip separator line
      }
      const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isHeader = i > 0 && lines[i + 1] && lines[i + 1].includes('---');
      tableHtml += '<tr>';
      cells.forEach(cell => {
        if (isHeader) {
          tableHtml += `<th>${cell.trim()}</th>`;
        } else {
          tableHtml += `<td>${cell.trim()}</td>`;
        }
      });
      tableHtml += '</tr>';
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        processedLines.push(tableHtml);
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    processedLines.push(tableHtml);
  }

  const finalBody = processedLines.join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8pt;
        color: #718096;
      }
      @bottom-left {
        content: "Hiệp Hội Doanh Nhân CEO 1983 · Hệ Thống VIONE Pro";
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8pt;
        color: #718096;
      }
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #1a202c;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .header-banner {
      background: linear-gradient(135deg, #0a2540 0%, #0052cc 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 82, 204, 0.15);
    }
    .header-banner h1 {
      color: #ffffff !important;
      margin: 0 0 8px 0 !important;
      font-size: 20pt !important;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header-banner p {
      margin: 0;
      font-size: 10.5pt;
      color: #e2e8f0;
    }
    .doc-title {
      color: #0a2540;
      font-size: 18pt;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 2px solid #0052cc;
      padding-bottom: 8px;
    }
    .section-title {
      color: #0052cc;
      font-size: 13pt;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 4px solid #0052cc;
      page-break-after: avoid;
    }
    .sub-title {
      color: #2d3748;
      font-size: 11.5pt;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    .minor-title {
      color: #4a5568;
      font-size: 10.5pt;
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 22px;
    }
    li {
      margin-bottom: 5px;
    }
    .inline-code {
      background: #edf2f7;
      color: #b83280;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 9.5pt;
    }
    .divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }
    .img-container {
      margin: 16px 0;
      text-align: center;
      page-break-inside: avoid;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
    }
    .img-container img {
      max-width: 92%;
      max-height: 480px;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: inline-block;
    }
    .img-caption {
      font-size: 9pt;
      font-style: italic;
      color: #4a5568;
      margin-top: 8px;
      font-weight: 500;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    .data-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 600;
    }
    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 600;
    }
    .badge-success { background: #c6f6d5; color: #22543d; }
    .badge-info { background: #bee3f8; color: #2a4365; }
    .badge-warning { background: #feebc8; color: #744210; }
  </style>
</head>
<body>
  <div class="header-banner">
    <h1>HỆ THỐNG QUẢN TRỊ & MẠNG LƯỚI DOANH NHÂN CEO 1983</h1>
    <p>VIONE Ecosystem Pro · Live Production Staging · Bản cập nhật chính thức ngày 18/09/2026</p>
  </div>
  ${finalBody}
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// 4. GENERATE DOCX FILE (Using 'docx' package)
// ----------------------------------------------------------------------------
async function generateDocx(outputPath, title, mdContent) {
  console.log(`Generating DOCX: ${outputPath}`);
  const lines = mdContent.split('\n');
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Hệ thống: VIONE Ecosystem · Hiệp hội Doanh nhân CEO 1983", italics: true, color: "0052cc" })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    if (l.startsWith('# ')) {
      children.push(new Paragraph({
        text: l.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 }
      }));
    } else if (l.startsWith('## ')) {
      children.push(new Paragraph({
        text: l.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 }
      }));
    } else if (l.startsWith('### ')) {
      children.push(new Paragraph({
        text: l.substring(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 80 }
      }));
    } else if (l.startsWith('![') && l.includes('images/evidence/')) {
      const match = l.match(/!\[(.*?)\]\(images\/evidence\/(.*?)\)/);
      if (match) {
        const alt = match[1];
        const filename = match[2];
        const imgBuffer = getImageBuffer(filename);
        if (imgBuffer) {
          try {
            children.push(new Paragraph({
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: { width: 500, height: 280 }
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 140, after: 60 }
            }));
            children.push(new Paragraph({
              children: [
                new TextRun({ text: `Hình minh họa: ${alt}`, italics: true, size: 18, color: "555555" })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 140 }
            }));
          } catch(e) {
            console.warn(`Docx image insert failed for ${filename}:`, e.message);
          }
        }
      }
    } else if (l.startsWith('|') && l.includes('---')) {
      // separator, skip
    } else if (l.startsWith('|')) {
      // simple table cell representation in text
      children.push(new Paragraph({
        children: [new TextRun({ text: l, size: 19 })],
        spacing: { after: 40 }
      }));
    } else if (l.startsWith('- ') || l.startsWith('* ')) {
      children.push(new Paragraph({
        text: l.substring(2),
        bullet: { level: 0 },
        spacing: { after: 60 }
      }));
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: l, size: 21 })],
        spacing: { after: 100 }
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved DOCX successfully: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ----------------------------------------------------------------------------
// 5. MAIN EXECUTION ROUTINE
// ----------------------------------------------------------------------------
async function main() {
  console.log('=== STARTING USER GUIDE GENERATION ===');

  // 1. Build Markdown contents
  const appMd = buildAppGuideMarkdown();
  const crmMd = buildCrmGuideMarkdown();

  // 2. Save Markdown files
  const appMdPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.md');
  const crmMdPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.md');
  fs.writeFileSync(appMdPath, appMd, 'utf8');
  fs.writeFileSync(crmMdPath, crmMd, 'utf8');
  console.log(`Saved Markdown: ${appMdPath} (${(appMd.length / 1024).toFixed(1)} KB)`);
  console.log(`Saved Markdown: ${crmMdPath} (${(crmMd.length / 1024).toFixed(1)} KB)`);

  // Also save copy to public/docs for web/app preview
  fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.md'), appMd, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.md'), crmMd, 'utf8');

  // 3. Build HTML pages
  const appHtml = generateHtmlPage("HƯỚNG DẪN SỬ DỤNG APP HIỆP HỘI DOANH NHÂN CEO 1983", appMd);
  const crmHtml = generateHtmlPage("HƯỚNG DẪN SỬ DỤNG HỆ THỐNG WEB CRM QUẢN TRỊ CLB CEO 1983", crmMd);

  const appHtmlPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.html');
  const crmHtmlPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.html');
  fs.writeFileSync(appHtmlPath, appHtml, 'utf8');
  fs.writeFileSync(crmHtmlPath, crmHtml, 'utf8');

  // 4. Generate PDFs using Playwright Chromium
  console.log('Launching Playwright browser with Google Chrome for high-resolution PDF printing...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    channel: !fs.existsSync(chromePath) ? 'msedge' : undefined,
    headless: true
  });
  
  // App PDF
  console.log('Rendering App Guide PDF...');
  const appPage = await browser.newPage();
  await appPage.setContent(appHtml, { waitUntil: 'load' });
  const appPdfPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.pdf');
  await appPage.pdf({
    path: appPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '18mm', left: '15mm', right: '15mm' }
  });
  await appPage.close();
  console.log(`Rendered PDF: ${appPdfPath}`);

  // Copy to public/docs/HUONG_DAN_SU_DUNG_APP_HIEP_HOI.pdf and also default CEO1983 name
  fs.copyFileSync(appPdfPath, path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.pdf'));
  fs.copyFileSync(appPdfPath, path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf'));
  fs.copyFileSync(appPdfPath, path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf'));

  // CRM PDF
  console.log('Rendering CRM Guide PDF...');
  const crmPage = await browser.newPage();
  await crmPage.setContent(crmHtml, { waitUntil: 'load' });
  const crmPdfPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.pdf');
  await crmPage.pdf({
    path: crmPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '18mm', left: '15mm', right: '15mm' }
  });
  await crmPage.close();
  console.log(`Rendered PDF: ${crmPdfPath}`);

  // Copy to public/docs/HUONG_DAN_SU_DUNG_CRM.pdf
  fs.copyFileSync(crmPdfPath, path.join(PUBLIC_DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.pdf'));

  await browser.close();

  // 5. Generate Word DOCX files
  const appDocxPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI.docx');
  const crmDocxPath = path.join(DOCS_DIR, 'HUONG_DAN_SU_DUNG_CRM.docx');
  await generateDocx(appDocxPath, "HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HIỆP HỘI DOANH NHÂN CEO 1983", appMd);
  await generateDocx(crmDocxPath, "HƯỚNG DẪN SỬ DỤNG HỆ THỐNG WEB CRM QUẢN TRỊ CLB CEO 1983", crmMd);

  console.log('=== ALL USER GUIDES GENERATED SUCCESSFULLY ===');
  console.log('Summary of generated files:');
  console.log('1. document/HUONG_DAN_SU_DUNG_APP_HIEP_HOI.md');
  console.log('2. document/HUONG_DAN_SU_DUNG_APP_HIEP_HOI.pdf');
  console.log('3. document/HUONG_DAN_SU_DUNG_APP_HIEP_HOI.docx');
  console.log('4. document/HUONG_DAN_SU_DUNG_CRM.md');
  console.log('5. document/HUONG_DAN_SU_DUNG_CRM.pdf');
  console.log('6. document/HUONG_DAN_SU_DUNG_CRM.docx');
  console.log('7. apps/vione_app_fe/public/docs/ (PDF & MD synced for App In-App Viewer)');
}

main().catch(err => {
  console.error('Fatal error during guide generation:', err);
  process.exit(1);
});
