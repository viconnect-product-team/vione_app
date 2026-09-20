# HƯỚNG DẪN THAO TÁC & VẬN HÀNH CHI TIẾT HỆ THỐNG WEB CRM QUẢN TRỊ CLB CEO 1983
**Phân hệ:** Web CRM Admin Portal — **Đơn vị quản lý:** Ban Quản Trị & Ban Thư Ký CLB Doanh Nhân CEO 1983  
**Môi trường máy chủ HTTPS:** `https://14.225.217.232:5443`  
**Liên kết hai chiều với App Hiệp Hội:** `https://14.225.217.232:5444/association`  
**Tài khoản Quản trị mẫu:** `admin@connect.vn` — **Mật khẩu:** `123456`

---

## 📑 MỤC LỤC CHI TIẾT CÁC PHÂN HỆ QUẢN TRỊ CRM

1. [QUY CHUẨN PHÂN QUYỀN VAI TRÒ QUẢN TRỊ (RBAC)](#1-quy-chuẩn-phân-quyền-vai-trò-quản-trị-rbac)
2. [ĐĂNG NHẬP HỆ THỐNG CRM QUẢN TRỊ BẢO MẬT](#2-đăng-nhập-hệ-thống-crm-quản-trị-bảo-mật)
3. [BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD) & THEO DÕI CHỈ SỐ KPI](#3-bảng-điều-khiển-tổng-quan-dashboard--theo-dõi-chỉ-số-kpi)
4. [QUẢN TRỊ HỘI VIÊN, XÉT DUYỆT HỒ SƠ & TỰ ĐỘNG CẤP TÀI KHOẢN QUA EMAIL](#4-quản-trị-hội-viên-xét-duyệt-hồ-sơ--tự-động-cấp-tài-khoản-qua-email)
5. [QUẢN TRỊ SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & ĐIỀU PHỐI CHECK-IN QR CỔNG](#5-quản-trị-sự-kiện-sơ-đồ-khán-phòng--điều-phối-check-in-qr-cổng)
6. [QUẢN TRỊ SÀN MARKETPLACE, KIỂM DUYỆT SẢN PHẨM & ĐẨY LÊN APP](#6-quản-trị-sàn-marketplace-kiểm-duyệt-sản-phẩm--đẩy-lên-app)
7. [GIÁM SÁT CƠ HỘI GIAO THƯƠNG B2B, THEO DÕI DEALS & THỐNG KÊ KINH TẾ](#7-giám-sát-cơ-hội-giao-thương-b2b-theo-dõi-deals--thống-kê-kinh-tế)
8. [QUẢN TRỊ DOANH NGHIỆP THÀNH VIÊN & BẢN ĐỒ CHUỖI CUNG ỨNG CLB](#8-quản-trị-doanh-nghiệp-thành-viên--bản-đồ-chuỗi-cung-ứng-clb)
9. [QUẢN LÝ SỔ QUỸ TÀI CHÍNH, ĐỐI SOÁT VIETQR & THU HỘI PHÍ THƯỜNG NIÊN](#9-quản-lý-sổ-quỹ-tài-chính-đối-soát-vietqr--thu-hội-phí-thường-niên)
10. [CẤU HÌNH TÀI KHOẢN QUẢN TRỊ, NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) & 2FA](#10-cấu-hình-tài-khoản-quản-trị-nhật-ký-kiểm-toán-audit-logs--2fa)

---

## 1. QUY CHUẨN PHÂN QUYỀN VAI TRÒ QUẢN TRỊ (RBAC)

Hệ thống Web CRM phân quyền chặt chẽ theo 4 cấp bậc tài khoản, đảm bảo tính bảo mật và đúng phạm vi trách nhiệm:

| STT | Vai Trò Vận Hành | Tài Khoản Email | Mật Khẩu | Quyền Hạn & Phạm Vi Nghiệp Vụ |
|:---:|---|---|:---:|---|
| 1 | **Quản Trị Viên Cấp Cao (Super Admin)** | `admin@connect.vn` | `123456` | Toàn quyền kiểm soát hệ thống: Quản lý người dùng, duyệt hội viên, tài chính sổ quỹ, phân quyền, cấu hình hệ thống và theo dõi audit logs |
| 2 | **Tổng Thư Ký CLB (Executive Admin)** | `ceo.tongthuky@ceo1983.com` | `123456` | Tiếp nhận và thẩm định hồ sơ hội viên mới, xuất bản thông cáo báo chí, điều phối hoạt động chung của các ban |
| 3 | **Trưởng Ban Sự Kiện (Event Manager)** | `events@ceo1983.com` | `123456` | Khởi tạo sự kiện, cấu hình sơ đồ ghế ngồi, quản lý danh sách đăng ký vé, quét QR check-in tại cổng, vận hành Lucky Draw |
| 4 | **Trưởng Ban Tài Chính (Finance Manager)** | `finance@ceo1983.com` | `123456` | Quản lý sổ quỹ, đối soát sao kê ngân hàng VietQR tự động, gạch nợ hội phí thường niên, xuất phiếu thu PDF và báo cáo kế toán |

---

## 2. ĐĂNG NHẬP HỆ THỐNG CRM QUẢN TRỊ BẢO MẬT

1. **Truy cập cổng quản trị:** Mở trình duyệt máy tính, truy cập: `https://14.225.217.232:5443/auth`.
2. **Giao diện nhận diện thương hiệu:** Màn hình đăng nhập hiển thị tông màu Xanh Navy - Trắng ngà sang trọng với huy hiệu bảo mật ShieldCheck.
3. **Thao tác đăng nhập:**
   - **Tài khoản Email:** Nhập địa chỉ email quản trị `admin@connect.vn`.
   - **Mật khẩu:** Nhập mật khẩu bảo mật `123456`.
   - Bấm nút **"Đăng Nhập Hệ Thống"**.
4. **Cơ chế xác thực:** Hệ thống kiểm tra thông tin, cấp phát JWT Bearer Token an toàn, lưu phiên `sb-access-token` và chuyển hướng trực tiếp vào Bảng điều khiển Tổng quan (Dashboard).

![Đăng Nhập Web CRM Quản Trị](images/evidence/step_14_crm_login_screen.png)
*Hình 2.1: Màn hình Đăng nhập Web CRM Quản trị an toàn chuẩn nhận diện Xanh - Trắng sang trọng.*

---

## 3. BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD) & THEO DÕI CHỈ SỐ KPI

Truy cập đường dẫn `/dashboard` để xem toàn cảnh sức khỏe hoạt động của CLB Doanh Nhân CEO 1983:

1. **Chức năng con 1 — Thẻ KPI Hội Viên:**
   - Thống kê tổng số lượng hội viên chính thức đang hoạt động.
   - Thống kê số lượng hồ sơ mới nộp từ Landing Page đang chờ Ban Thư Ký thẩm định.
   - Tỷ lệ tăng trưởng thành viên mới theo tháng và quý.
2. **Chức năng con 2 — Thẻ KPI Sự Kiện & Hội Thảo:**
   - Số lượng sự kiện đang mở đăng ký vé trên App.
   - Tổng số lượt đại biểu đã xác nhận tham dự và số lượng vé phát hành.
3. **Chức năng con 3 — Thẻ KPI Giao Thương B2B:**
   - Tổng số sản phẩm đang niêm yết trên sàn Marketplace.
   - Số lượng cơ hội giao thương đã được các hội viên kết nối thành công (Claimed Deals).
4. **Chức năng con 4 — Biểu đồ Tài Chính & Hội Phí Thường Niên:**
   - Biểu đồ tiến độ hoàn thành hội phí thường niên của toàn bộ hội viên theo năm tài chính.
   - Báo cáo tổng nguồn thu từ vé sự kiện và tài trợ.

![Bảng Điều Khiển Tổng Quan Dashboard KPI](images/evidence/step_15_crm_dashboard_kpi.png)
*Hình 3.1: Trung tâm chỉ huy Dashboard CRM với các chỉ số KPI vận hành thời gian thực.*

---

## 4. QUẢN TRỊ HỘI VIÊN, XÉT DUYỆT HỒ SƠ & TỰ ĐỘNG CẤP TÀI KHOẢN QUA EMAIL

Truy cập menu bên trái: **"Hội viên"** (`https://14.225.217.232:5443/members`):

1. **Chức năng con 1 — Bảng dữ liệu hội viên đa năng:**
   - Hiển thị danh sách đầy đủ: Ảnh đại diện, Họ tên, Tên công ty pháp nhân, Mã số thuế, Ban chuyên môn sinh hoạt, Ngày đăng ký và Trạng thái.
2. **Chức năng con 2 — Bộ lọc & Tìm kiếm thông minh:**
   - Tìm kiếm nhanh bằng cách gõ tên doanh nhân, tên công ty (`MediSocial`), số điện thoại hoặc email (`vumikasa6@gmail.com`).
   - Lọc theo trạng thái: **"Chờ phê duyệt"** (màu vàng), **"Đang hoạt động"** (màu xanh lá), **"Tạm khóa"** (màu đỏ).
   - Lọc theo Ban ngành: Ban Xúc tiến Thương mại, Ban Sự kiện, Ban Truyền thông, Ban Tài chính.
3. **Chức năng con 3 — Mở Drawer Thẩm định chi tiết 360°:**
   - Nhấp chuột vào bất kỳ dòng hội viên nào trên bảng.
   - Drawer thông tin trượt ra từ bên phải màn hình hiển thị toàn bộ giấy tờ pháp lý, giấy phép kinh doanh, số thẻ hội viên dự kiến và người giới thiệu.
4. **Chức năng con 4 — Thao tác Phê duyệt (Approve) & Tự động gửi Email:**
   - Nhấp nút **"Phê duyệt (Approve)"** màu xanh.
   - Hộp thoại xác nhận hiện ra, bấm **"Xác nhận phê duyệt"**.
   - **Tiến trình tự động của hệ thống:**
     - Trạng thái hội viên đổi sang "Đang hoạt động (Active)".
     - Kích hoạt tài khoản đăng nhập trên Mobile App.
     - Sinh mã thẻ hội viên định danh (ví dụ `CEO1983-000002`).
     - Tự động sinh mật khẩu khởi tạo an toàn và **bắn một bức Email HTML chào mừng chứa tài khoản và mật khẩu trực tiếp về hộp thư `vumikasa6@gmail.com`**.
5. **Chức năng con 5 — Phân bổ Ban chuyên môn & Gán vai trò:**
   - Trong Drawer, chọn Ban chuyên môn sinh hoạt cho hội viên và gán chức vụ (Chủ tịch, Phó chủ tịch, Ủy viên BCH, Trưởng ban, Hội viên chính thức) ➔ Bấm **"Lưu phân bổ"**.
6. **Chức năng con 6 — Khóa / Mở khóa tài khoản & Xuất dữ liệu Excel:**
   - Nhấp nút **"Tạm khóa"** khi hội viên cần tạm dừng sinh hoạt.
   - Nhấp nút **"Xuất Excel"** để tải toàn bộ danh bạ hội viên phục vụ lưu trữ nội bộ.

![Danh Sách Quản Trị Hội Viên CRM](images/evidence/step_16_crm_members_approval.png)
*Hình 4.1: Bảng quản trị danh bạ hội viên với các bộ lọc trạng thái và công cụ tìm kiếm nhanh.*

![Drawer Thẩm Định & Phê Duyệt Hồ Sơ Chi Tiết](images/evidence/step_00c_crm_member_approval_drawer.png)
*Hình 4.2: Drawer thẩm định thông tin pháp lý doanh nghiệp và nút bấm Phê duyệt kích hoạt gửi mail.*

---

## 5. QUẢN TRỊ SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & ĐIỀU PHỐI CHECK-IN QR CỔNG

Truy cập menu bên trái: **"Sự kiện"** (`https://14.225.217.232:5443/events`):

1. **Chức năng con 1 — Tạo sự kiện mới (`+ Tạo Sự Kiện`):**
   - Nhấp nút **"+ Tạo sự kiện mới"** trên thanh công cụ.
   - Chọn loại hình sự kiện: Diễn đàn kinh tế (Forum), Hội thảo chuyên đề (Workshop), Dạ tiệc kết nối (Networking Gala), Đào tạo kỹ năng (Training).
   - Hệ thống tự động điền mẫu tiêu đề, gợi ý địa điểm và tạo Live Banner Preview 3D sắc nét.
   - Cấu hình loại vé: Vé Miễn phí (0đ cho hội viên VIP) hoặc Vé Có phí (tự động gắn tài khoản VietQR thụ hưởng).
2. **Chức năng con 2 — Cấu hình Sơ đồ Khán phòng (Cinema Seating Map):**
   - Kéo thả tọa độ các hàng ghế sân khấu (VIP, Kim Cương, Tiêu chuẩn).
   - Đặt tên hàng ghế, số lượng ghế mỗi dãy và giới hạn quyền chọn chỗ cho từng hạng hội viên.
3. **Chức năng con 3 — Quản lý Danh sách Đăng ký & Số may mắn (Lucky Draw Number):**
   - Xem bảng danh sách đại biểu đã đăng ký vé trên App.
   - Mỗi đại biểu tự động được cấp 1 mã số may mắn `#XXXX` (ví dụ `#1983`, `#2026`) để phục vụ quay thưởng.
4. **Chức năng con 4 — Điều phối Điểm danh Check-in QR tại cổng:**
   - Mở công cụ **"Quét mã QR Check-in"** trên CRM (sử dụng webcam laptop hoặc máy quét mã vạch).
   - Khi hội viên xuất trình mã QR Pass trên điện thoại, đưa vào khung ngắm ➔ Hệ thống xác thực vé dưới 1 giây, hiển thị thông tin đại biểu và đổi trạng thái thành "Đã điểm danh".
5. **Chức năng con 5 — Vận hành Biểu quyết (Live Voting) & Vòng quay may mắn (Lucky Draw):**
   - Mở phiên biểu quyết trực tiếp: Đẩy câu hỏi và các phương án bình chọn xuống App của tất cả đại biểu đang có mặt.
   - Khởi động vòng quay số may mắn: Quay ngẫu nhiên theo danh sách mã số vé may mắn `#XXXX` đã check-in, bấm nút **"Bắn thông báo trúng thưởng"** mạ vàng về điện thoại của người trúng giải.

![Quản Trị Sự Kiện & Điều Phối Check-in](images/evidence/step_17_crm_events_management.png)
*Hình 5.1: Màn hình Quản lý Sự kiện Hiệp hội, Sơ đồ khán phòng và Công cụ Check-in QR tức thời.*

---

## 6. QUẢN TRỊ SÀN MARKETPLACE, KIỂM DUYỆT SẢN PHẨM & ĐẨY LÊN APP

Truy cập menu bên trái: **"Marketplace / Sản phẩm"** (`https://14.225.217.232:5443/marketplace`):

1. **Chức năng con 1 — Tiếp nhận sản phẩm đăng từ App hội viên:**
   - Khi hội viên (ví dụ tài khoản `vumikasa6@gmail.com`) đăng bán sản phẩm mới từ App, bài đăng hiển thị ngay tại danh sách kiểm duyệt của CRM.
2. **Chức năng con 2 — Thẩm định thông tin sản phẩm:**
   - Kiểm tra ảnh chụp thực tế sản phẩm, tên mặt hàng, đơn vị cung ứng.
   - Thẩm định 2 mức giá: Giá niêm yết ngoài thị trường và Giá ưu đãi VIP dành cho hội viên CEO 1983.
3. **Chức năng con 3 — Thao tác Phê duyệt xuất bản:**
   - Nhấp nút **"Phê duyệt"**: Sản phẩm lập tức được xuất bản lên kệ hàng Marketplace trên App di động của toàn thể hội viên.
4. **Chức năng con 4 — Gắn nhãn Tiêu biểu (Featured Product):**
   - Nhấp icon ngôi sao hoặc nút **"Tiêu biểu"** để đưa sản phẩm lên vị trí Banner ưu tiên hàng đầu tại Trang chủ App.
5. **Chức năng con 5 — Tạm ẩn / Gỡ bỏ sản phẩm:**
   - Khi sản phẩm hết hàng hoặc phát hiện thông tin không chuẩn xác, quản trị viên nhấp nút **"Tạm ẩn"** để dừng hiển thị trên App.

![Quản Trị Sàn Giao Thương Marketplace](images/evidence/step_18_crm_marketplace_sync.png)
*Hình 6.1: Giao diện Quản trị Sàn Marketplace, Kiểm duyệt sản phẩm và Điều phối hàng hóa nội khối.*

---

## 7. GIÁM SÁT CƠ HỘI GIAO THƯƠNG B2B, THEO DÕI DEALS & THỐNG KÊ KINH TẾ

Truy cập menu bên trái: **"Cơ hội giao thương"** (`https://14.225.217.232:5443/opportunities`):

1. **Chức năng con 1 — Giám sát các luồng nhu cầu Cần Mua & Cần Bán:**
   - Bảng kê toàn bộ các thông điệp trao cơ hội hợp tác do hội viên đăng lên từ App (Nhu cầu tìm nhà cung cấp vật tư y tế, tìm đối tác logistics, hợp tác phần mềm).
2. **Chức năng con 2 — Theo dõi các thương vụ đã kết nối (Claimed Deals):**
   - Xem chi tiết thương vụ nào đã được đối tác nào tiếp nhận (Claim).
   - Theo dõi tiến độ đàm phán hợp đồng giữa 2 bên doanh nghiệp.
3. **Chức năng con 3 — Thống kê giá trị luân chuyển nội khối:**
   - Đo lường tổng giá trị ngân sách dự kiến của các cơ hội (ví dụ: Tổng giá trị giao dịch đạt hàng chục tỷ VNĐ).
   - Báo cáo cho Ban Xúc tiến Thương mại định kỳ để hỗ trợ kết nối các thương vụ có quy mô lớn.

![Quản Trị & Giám Sát Cơ Hội Giao Thương B2B](images/evidence/step_19_crm_opportunities_sync.png)
*Hình 7.1: Màn hình Giám sát Sàn Cơ Hội Giao Thương B2B và Thống kê các Thương vụ Claimed Deals.*

---

## 8. QUẢN TRỊ DOANH NGHIỆP THÀNH VIÊN & BẢN ĐỒ CHUỖI CUNG ỨNG CLB

Truy cập menu bên trái: **"Doanh nghiệp"** (`https://14.225.217.232:5443/companies`):

1. **Chức năng con 1 — Quản lý Danh bạ Pháp nhân Doanh nghiệp:**
   - Danh sách toàn bộ các doanh nghiệp thành viên chính thức của hiệp hội.
   - Quản lý thông tin: Tên doanh nghiệp đầy đủ, Tên viết tắt, Mã số thuế, Vốn điều lệ, Địa chỉ trụ sở, Website.
2. **Chức năng con 2 — Phân loại Ngành nghề & Chuỗi Cung ứng:**
   - Gắn nhãn phân loại ngành: Y tế - Dược phẩm, Xây dựng - Bất động sản, Công nghệ thông tin, F&B, Logistics, Dịch vụ tài chính.
3. **Chức năng con 3 — Bản đồ Chuỗi Cung ứng Khép kín:**
   - Giúp Ban Thư Ký tra cứu nhanh doanh nghiệp nào có thể cung ứng đầu vào cho doanh nghiệp khác trong hiệp hội, ưu tiên sử dụng dịch vụ của nhau để giữ dòng tiền trong nội khối CLB CEO 1983.

![Quản Trị Danh Bạ Doanh Nghiệp Thành Viên](images/evidence/step_21_crm_companies_directory.png)
*Hình 8.1: Danh bạ Quản lý Doanh nghiệp Thành viên và Bản đồ Chuỗi Cung ứng Khép kín.*

---

## 9. QUẢN LÝ SỔ QUỸ TÀI CHÍNH, ĐỐI SOÁT VIETQR & THU HỘI PHÍ THƯỜNG NIÊN

Truy cập menu bên trái: **"Tài chính / Hội phí"** (`https://14.225.217.232:5443/fees`):

1. **Chức năng con 1 — Bảng theo dõi Thu Hội Phí Thường Niên:**
   - Danh sách chi tiết toàn bộ hội viên theo năm tài chính hiện hành.
   - Thể hiện trạng thái rõ ràng: **"Đã hoàn thành"** (màu xanh lá) và **"Chưa hoàn thành"** (màu vàng cam).
2. **Chức năng con 2 — Cơ chế Đối soát Tự động qua VietQR:**
   - Khi hội viên quét mã VietQR đóng hội phí trên App, cổng thanh toán tự động khớp mã giao dịch `FEE-CEO1983-XXXX`.
   - Hệ thống tự động gạch nợ trên CRM, gia hạn ngày hết hạn trên App thêm 365 ngày và ghi nhận tăng quỹ hội.
3. **Chức năng con 3 — Thao tác Gạch nợ Thủ công (Fee Toggle):**
   - Đối với các khoản đóng tiền mặt trực tiếp hoặc chuyển khoản ủy nhiệm chi ngoài, thủ quỹ nhấp công tắc gạch nợ thủ công để xác nhận đã thu tiền.
4. **Chức năng con 4 — Gửi Email Nhắc Phí Tự Động:**
   - Nhấp nút **"Gửi nhắc phí"** đối với những hội viên sắp đến hạn gia hạn để hệ thống gửi thông báo nhắc nhở lịch sự kèm mã VietQR đóng nhanh qua App/Email.
5. **Chức năng con 5 — Xuất Báo Cáo Sổ Quỹ Thu Chi & Phiếu Thu PDF:**
   - Xuất sổ quỹ sang file Excel phục vụ công tác kiểm toán của Ban Kiểm Tra.
   - Tải phiếu thu điện tử PDF có chữ ký số của CLB Doanh Nhân CEO 1983.

![Quản Lý Tài Chính & Thu Hội Phí Thường Niên](images/evidence/step_20_crm_finance_fees.png)
*Hình 9.1: Bảng theo dõi Sổ quỹ Tài chính, Đối soát VietQR và Quản lý Hội phí Thường niên.*

---

## 10. CẤU HÌNH TÀI KHOẢN QUẢN TRỊ, NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) & 2FA

Truy cập Avatar góc trên bên phải ➔ **"Cài đặt tài khoản"** (`https://14.225.217.232:5443/account-settings`):

1. **Chức năng con 1 — Quản lý Thông tin Quản trị viên:**
   - Cập nhật Họ tên người vận hành, Email liên hệ, Số điện thoại hỗ trợ khẩn cấp.
2. **Chức năng con 2 — Đổi mật khẩu an toàn định kỳ:**
   - Thay đổi mật khẩu quản trị theo tiêu chuẩn an toàn cao (chữ hoa, chữ thường, số và ký tự đặc biệt).
3. **Chức năng con 3 — Kích hoạt Xác thực Hai Yếu tố (2FA):**
   - Bật mã xác thực OTP qua Google Authenticator khi đăng nhập CRM để chống xâm nhập trái phép.
4. **Chức năng con 4 — Nhật ký Kiểm toán Hệ thống (Audit Trail / Logs):**
   - Ghi nhận chi tiết thời gian, địa chỉ IP và hành động của mọi tài khoản quản trị: Ai duyệt hội viên nào, ai gạch nợ hội phí, ai tạo sự kiện, đảm bảo tính minh bạch tuyệt đối trong công tác quản trị hội.

![Cấu Hình Tài Khoản Quản Trị & Bảo Mật](images/evidence/step_22_crm_system_settings.png)
*Hình 10.1: Màn hình Cấu hình Tài khoản Quản trị, Nhật ký kiểm toán và Thiết lập Bảo mật Hệ thống.*
