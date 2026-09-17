# HƯỚNG DẪN SỬ DỤNG CHI TIẾT ỨNG DỤNG DOANH NHÂN CLB CEO 1983
**Phiên bản:** v2.6.0 · **Cơ quan chủ quản:** CLB Doanh Nhân CEO 1983 · **Nền tảng:** VIONE Connect Suite

---

## MỤC LỤC
1. [Đăng Nhập, Định Danh & Thẻ Hội Viên Số](#1-đăng-nhập-định-danh--thẻ-hội-viên-số)
2. [Công Nghệ Chạm Thẻ Thông Minh NFC](#2-công-nghệ-chạm-thẻ-thông-minh-nfc)
3. [Nhắn Tin Thời Gian Thực Phong Cách Messenger](#3-nhắn-tin-thời-gian-thực-phong-cách-messenger)
4. [Danh Bạ Hội Viên & Nút Kết Nối / Hủy Kết Nối Thông Minh](#4-danh-bạ-hội-viên--nút-kết-nối--hủy-kết-nối-thông-minh)
5. [Sự Kiện CLB, Check-in QR, Thẻ Poster 2:3 & Biểu Quyết Trực Tiếp](#5-sự-kiện-clb-check-in-qr-thẻ-poster-23--biểu-quyết-trực-tiếp)
6. [Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 247](#6-thu--đóng-hội-phí-tự-động-qua-vietqr-napas-247)
7. [Sàn Cơ Hội Giao Thương B2B & Gian Hàng Sản Phẩm 2 Cột E-Commerce](#7-sàn-cơ-hội-giao-thương-b2b--gian-hàng-sản-phẩm-2-cột-e-commerce)
8. [Menu Cá Nhân Image 3, Phím Tắt (+) Danh Thiếp Số & Cài Đặt Bảo Mật](#8-menu-cá-nhân-image-3-phím-tắt--danh-thiếp-số--cài-đặt-bảo-mật)
9. [Sơ Đồ Hội Nghị Rạp Chiếu Cinema Seating Map & Tùy Biến Ghế Sân Khấu](#9-sơ-đồ-hội-nghị-rạp-chiếu-cinema-seating-map--tùy-biến-ghế-sân-khấu)
10. [Liên Hệ Ban Thư Ký & Hỗ Trợ Kỹ Thuật](#10-liên-hệ-ban-thư-ký--hỗ-trợ-kỹ-thuật)

---

## 1. ĐĂNG NHẬP, ĐỊNH DANH & THẺ HỘI VIÊN SỐ
Mỗi hội viên khi gia nhập CLB Doanh Nhân CEO 1983 được cấp một mã số định danh duy nhất (định dạng `M1983-xxx`) gắn liền với số điện thoại và hồ sơ pháp nhân doanh nghiệp.

![Đăng nhập & Thẻ Hội viên số VIP](/docs/images/demo_auth_card.svg)

### Các bước thao tác:
- **Bước 1: Truy cập và nhập thông tin định danh**
  Mở đường dẫn `https://vione.vn/association/login` trên trình duyệt Safari (iOS), Chrome (Android/PC) hoặc mở từ ứng dụng màn hình chính. Nhập Số điện thoại hoặc Mã hội viên cùng mật khẩu được cấp.
  *Lưu ý:* Nếu vừa được phê duyệt từ Landing Page, hệ thống tự động điền sẵn Tên đăng nhập / Số điện thoại và yêu cầu nhập mật khẩu bảo mật (tuyệt đối không bypass đăng nhập để đảm bảo an toàn danh tính).
- **Bước 2: Kích hoạt Thẻ hội viên điện tử VIP**
  Hệ thống tự động liên kết dữ liệu CRM của CLB CEO 1983, cấp thẻ số doanh nhân với dải màu Navy & Gold sang trọng, huy hiệu *"Hội viên chính thức"* có dấu tích xanh xác thực và mã QR động chứa liên hệ vCard.
- **Bước 3: Cài đặt ứng dụng PWA lên màn hình chính**
  - **Trên iPhone / iPad (Safari):** Bấm nút Chia sẻ (Share) -> chọn *"Thêm vào màn hình chính"* (Add to Home Screen).
  - **Trên Android (Chrome):** Bấm biểu tượng menu (3 chấm) -> chọn *"Cài đặt ứng dụng"* (Install App).
  Ứng dụng khởi động toàn màn hình, tốc độ phản hồi nhanh như app native mà không cần thông qua chợ ứng dụng.

---

## 2. CÔNG NGHỆ CHẠM THẺ THÔNG MINH NFC
Ứng dụng tích hợp công nghệ chạm thẻ trường gần NFC (Near Field Communication) chuẩn NTAG213/NTAG215, trao đổi danh thiếp số 1 chạm trong vòng 1 giây.

![Chạm thẻ thông minh NFC](/docs/images/demo_nfc_card.svg)

### Các bước thao tác:
- **Bước 1: Bật tính năng Chạm thẻ NFC trên ứng dụng**
  Tại tab Trang cá nhân hoặc Thẻ hội viên, bấm nút *"Chạm Thẻ NFC"*. Cửa sổ radar quét NFC sẽ kích hoạt.
- **Bước 2: Chạm mặt lưng điện thoại vào thẻ hoặc thiết bị đối tác**
  Đặt mặt lưng điện thoại sát vào chip NFC của thẻ doanh nhân CEO 1983. Hệ thống sẽ lập tức truyền tải đường dẫn định danh bảo mật vCard sang thiết bị đối tác mà đối tác không cần cài đặt bất kỳ ứng dụng nào.
- **Bước 3: Ghi thông tin danh thiếp vào thẻ NFC vật lý**
  Hội viên có thể bấm *"Ghi thẻ NFC"* trong phần Quản lý danh thiếp để nạp mã URL danh thiếp số cá nhân vào các loại thẻ card visit thông minh bằng kim loại hoặc gỗ ép cao cấp của CLB.

---

## 3. NHẮN TIN THỜI GIAN THỰC PHONG CÁCH MESSENGER
Hệ thống tin nhắn Doanh nhân được thiết kế chuẩn mực 100% phong cách Facebook Messenger, tối ưu cho trao đổi công việc cấp cao.

![Nhắn tin Messenger VIP & Thu hồi tin nhắn](/docs/images/demo_messenger_chat.svg)

### Các đặc điểm nổi bật:
- **Bong bóng chat người gửi:** Màu xanh Messenger chuẩn (`#0084FF`), bo tròn 16px, chữ trắng sắc nét.
- **Bong bóng chat đối tác:** Màu xám nhẹ thanh lịch (`#F0F2F5` nền sáng, `#303030` nền tối), có avatar nhỏ 28px bên trái.
- **Khử trùng lặp tin nhắn (Deduplication):** Cơ chế tự động loại bỏ duplicate tin nhắn theo chữ ký nội dung và timestamp 15 giây; tự động xóa huy hiệu tin chưa đọc ngay khi mở cuộc trò chuyện.
- **Thanh nhập tin nhắn Mobile tối ưu:** Thay thế 3 nút inline bằng nút mở rộng `(+)` tiện lợi bên trái, chống vỡ layout trên màn hình hẹp; bấm vào mở popup đính kèm ảnh, tài liệu và chia sẻ vị trí.
- **Thu hồi tin nhắn (Recall) & Nhảy top:** Khi chọn *"Thu hồi tin nhắn"*, bong bóng chuyển thành viền mỏng nét đứt *"Bạn đã thu hồi một tin nhắn"*, đồng thời cuộc trò chuyện lập tức nhảy lên vị trí đầu tiên của danh sách tin nhắn.

---

## 4. DANH BẠ HỘI VIÊN & NÚT KẾT NỐI / HỦY KẾT NỐI THÔNG MINH
Tra cứu hơn 500+ chủ tịch HĐQT, CEO và doanh nhân hàng đầu. Quản lý trạng thái quan hệ kinh doanh linh hoạt.

![Danh bạ hội viên & Kết nối / Hủy kết nối](/docs/images/demo_directory_b2b.svg)

### Các bước thao tác:
- **Bước 1: Tra cứu hội viên theo ngành nghề**
  Dùng thanh tìm kiếm lọc theo Ngành hàng (Bất động sản, Xây dựng, Tài chính, Logistics, F&B...) hoặc tỉnh thành.
- **Bước 2: Xem hồ sơ năng lực chi tiết**
  Bấm vào Avatar của hội viên để mở Modal Profile xem Chức vụ, Pháp nhân công ty, Lĩnh vực thế mạnh và Nhu cầu kết nối.
- **Bước 3: Chuyển đổi trạng thái Kết nối / Hủy kết nối (1 Chạm)**
  - Nếu **chưa kết nối**: Hiển thị nút **"KẾT NỐI NGAY"** màu xanh. Bấm vào để gửi yêu cầu kết nối giao thương.
  - Nếu **đã kết nối**: Hiển thị nút **"HỦY KẾT NỐI"** viền đỏ. Bấm vào để hủy kết nối an toàn và loại khỏi danh bạ đối tác thân thiết.

---

## 5. SỰ KIỆN CLB, CHECK-IN QR, THẺ POSTER 2:3 & BIỂU QUYẾT TRỰC TIẾP
Số hóa toàn bộ khâu tham dự sự kiện, hội nghị và biểu quyết định hướng phát triển CLB.

![Check-in QR sự kiện và Biểu quyết trực tiếp](/docs/images/demo_qr_checkin.svg)

### Các bước thao tác:
- **Bước 1: Đăng ký tham dự sự kiện**
  Xem danh sách sự kiện trên Trang chủ (dạng thẻ poster dọc tỉ lệ 2:3 với nhãn độ tuổi `16+`, `18+`, `13+`) hoặc tại màn hình Sự kiện có backdrop sân khấu sang trọng. Bấm đăng ký để nhận vé mời điện tử có mã QR bảo mật.
- **Bước 2: Check-in tự động tại hội trường**
  Mở mã QR trên điện thoại để lễ tân quét mã điểm danh, hệ thống tự động xuất vị trí bàn tiệc VIP và chào mừng lên màn hình LED.
- **Bước 3: Biểu quyết & Bầu cử trực tiếp**
  Trong các phiên họp biểu quyết, mở mục *"Biểu quyết trực tiếp"*, chọn phương án và bấm gửi. Kết quả cập nhật lên biểu đồ trực tiếp sau 30 giây.

---

## 6. THU & ĐÓNG HỘI PHÍ TỰ ĐỘNG QUA VIETQR NAPAS 247
Tích hợp cổng Napas 247 thanh toán niên liễm an toàn, nhanh chóng và tự động gạch nợ.

![Thanh toán hội phí niên khóa qua VietQR Napas 247](/docs/images/demo_vietqr_fee.svg)

### Các bước thao tác:
- **Bước 1: Nhận thông báo nhắc hội phí**
  Bấm vào hóa đơn niên khóa trong hòm thư để xem chi tiết nghĩa vụ hội phí.
- **Bước 2: Quét mã VietQR bằng App Ngân hàng bất kỳ**
  Hệ thống tự sinh mã QR chuẩn VietQR chứa đầy đủ: Số tài khoản CLB, Số tiền chính xác và Cú pháp chuyển khoản tự động (`CLB1983 [MÃ HỘI VIÊN]`). Quét và xác nhận thanh toán trong 3 giây.
- **Bước 3: Gạch nợ tự động trong 5 giây**
  Sau khi ngân hàng báo chuyển khoản thành công, hệ thống tự động gạch nợ trong vòng 5 giây, gia hạn thời hạn hội viên thêm 12 tháng và phát hành hóa đơn điện tử.

---

## 7. SÀN CƠ HỘI GIAO THƯƠNG B2B & GIAN HÀNG SẢN PHẨM 2 CỘT E-COMMERCE
- **Sàn Cơ hội B2B (/association/opportunities):**
  - Hiển thị hình ảnh người dùng tự tải lên sắc nét.
  - Bổ sung tab *"Cơ hội của tôi"* quản lý riêng các tin do chính mình đăng.
  - Sắp xếp tin mới nhất lên đầu (newest-first) kèm nhãn ngày đăng chi tiết.
- **Gian hàng sản phẩm 2 cột (/association/products):**
  - Đồng bộ sản phẩm 2 chiều với Web CRM.
  - Cách ly danh sách *"Đã quan tâm"* theo từng tài khoản (tài khoản mới khởi tạo 0 sản phẩm, không bị trùng lặp).
  - Bổ sung tab *"Sản phẩm tôi đăng"*.
  - Redesign lưới 2 cột phong cách sàn thương mại điện tử hiện đại, phân cấp giá niêm yết và giá VIP hội viên rõ nét.

---

## 8. MENU CÁ NHÂN IMAGE 3, PHÍM TẮT (+) DANH THIẾP SỐ & CÀI ĐẶT BẢO MẬT
- **Menu Trang cá nhân (/association/profile):**
  - Căn chỉnh thứ tự và giao diện chuẩn xác theo bản vẽ tham chiếu Image 3.
  - Dòng *"Quản lý Danh thiếp số"* tích hợp nút phím tắt `(+)` màu xanh: Bấm vào dòng mở danh sách thẻ, bấm vào nút `(+)` mở trực tiếp form tạo mới danh thiếp.
- **Cài đặt Bảo mật (/association/settings):**
  - Kết nối API chuẩn `/users/change-password`.
  - Nút *"Đăng xuất"* bị vô hiệu hóa cho đến khi người dùng hoàn tất đổi mật khẩu trong phiên làm việc.
  - Bổ sung tính năng *"Vô hiệu hóa tài khoản"* an toàn kèm modal xác nhận mật khẩu.
  - Form tải ảnh đại diện được đưa về đúng vị trí Trang cá nhân, không để trùng lặp trong tab bảo mật.

---

## 9. SƠ ĐỒ HỘI NGHỊ RẠP CHIẾU CINEMA SEATING MAP & TÙY BIẾN GHẾ SÂN KHẤU
- **Phân quyền vai trò trên Sidebar CRM:** Menu sidebar tự động ẩn/hiện theo đúng ma trận phân quyền (Platform Admin vs Association Admin vs các Trưởng ban chuyên môn); loại bỏ hoàn toàn mục *"Quyền của tôi"*.
- **Tùy biến ghế sân khấu Cinema Seating Map:** Ban tổ chức có thể kéo thả tự do tọa độ các ghế trên sân khấu bằng chuột hoặc cảm ứng mà không làm xô lệch các hàng ghế khán phòng; cung cấp các nút *"+ Thêm ghế"*, *"- Bớt ghế"* và *"Căn đều"* để định hình vòng cung sân khấu hoàn hảo.

---

## 10. LIÊN HỆ BAN THƯ KÝ & HỖ TRỢ KỸ THUẬT
- **Hotline thường trực 24/7:** 098.333.1983
- **Tổng đài hỗ trợ hội viên:** 1900.6883
- **Zalo Official Account:** CLB Doanh Nhân CEO 1983 (https://zalo.me/ceo1983)
- **Email Ban Thư Ký:** banthuky@ceo1983.vn | kythuat@vione.vn
- **Văn phòng đại diện:** Tầng 6, Tháp Doanh Nhân, Đường Phạm Hùng, Nam Từ Liêm, Hà Nội.
- **Gửi yêu cầu trực tiếp:** Vào tab *Trang cá nhân* -> Bấm *"Liên Hệ Ban Thư Ký CLB CEO 1983"* để gửi nội dung cần hỗ trợ. Ban Thư Ký sẽ phản hồi trong vòng 15 phút.

---
*Tài liệu ban hành lưu hành nội bộ - Bản quyền thuộc về CLB Doanh Nhân CEO 1983.*
