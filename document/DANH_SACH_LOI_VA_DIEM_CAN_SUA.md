# BẢNG THEO DÕI LỖI, ĐIỂM NGHẼN & HẠNG MỤC CẦN HOÀN THIỆN MÃ NGUỒN
**Dự án:** VIONE Ecosystem · **Phân hệ:** CEO 1983 Association Mobile App & Web CRM Platform  
**Ngày ghi nhận:** 17/09/2026 · **Mục đích:** Bảng tổng hợp chi tiết vị trí code, nguyên nhân và giải pháp để lập trình viên đọc và sửa trực tiếp trong ngày tiếp theo.

---

## 1. BẢNG TỔNG HỢP DANH SÁCH LỖI, HẠNG MỤC ĐÃ FIX & ĐIỂM CẦN NÂNG CẤP CODE

| Mã Lỗi / Issue ID | Phân Hệ / Màn Hình | Tên Hạng Mục / Lỗi | Mức Độ | Trạng Thái Xử Lý | File Mã Nguồn / Chi Tiết |
|:---:|---|---|:---:|:---:|---|
| **FIX-NEWS-001** | Web CRM (`/news`) | Bổ sung upload ảnh & link URL cho Tin tức, hiển thị thumbnail thật | **Critical** | **ĐÃ SỬA XONG (RESOLVED)** | Backend `connect-app.service.ts` + Frontend `news.tsx`, `news.functions.ts`. Đã bổ sung ô chọn tệp ảnh & link ảnh, hiển thị ảnh thật trên thẻ tin tức. |
| **FIX-SCAN-002** | Mobile Native (`apps/mobile_ceo1983`) | Gỡ bỏ hoàn toàn thư viện Google Play Code Scanner (`play-services-code-scanner`) | **High** | **ĐÃ SỬA XONG (RESOLVED)** | Đã gỡ `com.google.android.gms:play-services-code-scanner` khỏi `build.gradle` và xóa import MLKit trong `MainActivity.java`, thay bằng chuẩn WebRTC/HTML5 Camera. |
| **FIX-EVENT-003** | App Hiệp Hội (`/association/events`) | Thẻ sự kiện nổi (Floating elevated), chữ trắng toàn bộ banner & Countdown Timer đặt phía trên tiêu đề | **Medium** | **ĐÃ SỬA XONG (RESOLVED)** | Sửa `EventCountdownTimer.tsx` (`whiteText={true}`) và `association.events.tsx` (container `shadow-xl`, chuyển khối đếm ngược lên trên tiêu đề). |
| **FIX-CALL-004** | App Hiệp Hội (`/association/messages`) | Bong bóng lịch sử cuộc gọi chuẩn Facebook Messenger kèm nút "Gọi lại" | **Medium** | **ĐÃ SỬA XONG (RESOLVED)** | `association.messages.tsx`: Tự động ghi nhận `[call:audio\|duration:...\|status:...]` và render bong bóng Call log với thời lượng và nút "Gọi lại" tương tác. |
| **FIX-LAND-005** | Landing Page (`/landing/ceo/v1`) | Chuyển đổi toàn diện sang Trải nghiệm Điện ảnh Siêu Thực (Realistic Cinematic 6 Scenes) | **Critical** | **ĐÃ SỬA XONG (RESOLVED)** | `Ceo1983CinematicInteractiveWorldLanding.tsx`: Loại bỏ triệt để icon/cartoon/CSS shape, dùng 100% asset thực tế: Mây thật, Nắng thật, Chim thật, Diều thật, Biệt thự chân trời (20-25%), Hồ bơi vô cực caustics, Đại dương sâu thẳm & Cá mập thật. |
| **BUG-AUTH-001** | CRM -> App | Tự động tạo bản ghi `auth.users` và `vione_users` khi phê duyệt đơn gia nhập CLB | **Major** | **ĐÃ SỬA XONG (RESOLVED)** | Backend `members.service.ts`: Khi admin duyệt, hệ thống tự sinh `vione_users` với mật khẩu mã hóa bcrypt và gán FK `user_id` ngay lập tức. |
| **BUG-PROD-008** | App Hiệp Hội (`/association/products`) | Tự động định dạng tiền tệ dấu chấm hàng nghìn trong Modal tạo/sửa sản phẩm | **Medium** | **ĐÃ SỬA XONG (RESOLVED)** | Frontend `association.products.tsx`: Đã thêm `formatCurrencyInput` tự động hiển thị `85.000.000` khi nhập liệu. |
| **BUG-PAY-002** | App Hiệp Hội (`/association/events`) | Cổng thanh toán tự động VietQR Napas 247 | **External** | **Chờ bên thứ 3 / Sandbox / Để sau** | Chờ tích hợp Webhook tài khoản ngân hàng thực tế của CLB hoặc Napas Sandbox. Đã bổ sung giao diện VietQR Napas 247 dynamic và hỗ trợ bypass DB. |
| **BUG-CALL-004** | App Hiệp Hội (`/association/messages`) | Máy chủ TURN relay cho cuộc gọi WebRTC ngoài Internet | **External** | **Chờ bên thứ 3 / Sandbox / Để sau** | Cần máy chủ TURN có IP Public khi gọi giữa 2 mạng 4G/Wifi khác NAT. Đã hoàn thiện giao diện Call Popup và Signaling Socket. |
| **BUG-MSG-003** | App Hiệp Hội (`/association/messages`) | Fallback Base64 khi MinIO ngắt kết nối | **Minor** | Đề xuất tối ưu | Fallback lưu trữ blob base64 tạm thời nếu container MinIO bị gián đoạn. |
| **BUG-SEC-006** | App Hiệp Hội (`/association/settings`) | Ràng buộc mật khẩu chữ hoa & số | **Minor** | Đề xuất tối ưu | Bổ sung regex kiểm tra mật khẩu có ít nhất 1 chữ in hoa và 1 số. |

---

## 2. CHI TIẾT TỪNG LỖI & HƯỚNG DẪN SỬA MÃ NGUỒN CỤ THỂ

### 1. BUG-AUTH-001: Tự động khởi tạo `auth.users` khi Admin duyệt hồ sơ trên CRM
- **Màn hình:** `CRM Quản lý Hội viên (/members)` -> Drawer xem chi tiết hồ sơ -> Bấm nút "Phê duyệt".
- **Triệu chứng:** Khi admin phê duyệt hồ sơ ứng viên mới từ landing, bảng `public.members` chuyển sang `active`, nhưng cột `user_id` bị `NULL` nếu user chưa từng đăng ký qua `/auth/register`. Dẫn đến tân hội viên không thể đăng nhập vào App bằng mật khẩu ban đầu.
- **Vị trí file mã nguồn cần sửa:** `apps/vione_app_be/src/members/members.service.ts`
- **Đoạn code cần bổ sung:** Trong hàm `approveMember(memberId: string)`:
  ```typescript
  // Kiểm tra nếu member.userId chưa có:
  if (!member.userId && member.phone) {
    // 1. Tìm hoặc tạo user trong auth.users
    // 2. Hash mật khẩu mặc định (SĐT hoặc mật khẩu lúc nộp đơn)
    // 3. Tạo vione_users và gán member.userId = newUserId
  }
  ```

---

### 2. BUG-PAY-002: Endpoint Giả Lập Gạch Nợ Webhook (VietQR Mock Sandbox)
- **Màn hình:** `App Hiệp Hội -> Sự Kiện (/association/events)`
- **Triệu chứng:** Khi test luồng thanh toán vé sự kiện hoặc hội phí, không thể tự động kích hoạt trạng thái `paid` nếu không can thiệp thủ công vào SQL.
- **Vị trí file mã nguồn cần sửa:** `apps/vione_app_be/src/payments/payments.controller.ts`
- **Đoạn code cần bổ sung:**
  ```typescript
  @Post('webhook/simulate')
  async simulatePayment(@Body() body: { registrationId?: string; invoiceId?: string }) {
    // Cập nhật payment_status = 'paid' và status = 'confirmed'
    // Bắn socket thông báo thanh toán thành công về cho client
  }
  ```

---

### 3. BUG-MSG-003: Cơ Chế Fallback Base64 Khi Upload Ảnh/File Chat
- **Màn hình:** `Hộp thư Doanh nhân (/association/messages)`
- **Triệu chứng:** Khi bấm nút `(+)` -> Chọn ảnh gửi đi, nếu kết nối MinIO gặp sự cố, ảnh bị treo ở trạng thái gửi thất bại.
- **Vị trí file mã nguồn cần sửa:** `apps/vione_app_fe/src/routes/association.messages.tsx`
- **Đoạn code cần bổ sung:** Bổ sung khối `try/catch` trong hàm `handleSendAttachment`: nếu `uploadFile` thất bại, tự động chuyển ảnh thành data URL Base64 với thumbnail nén nhỏ và lưu vào `localMessages`.

---

### 4. BUG-SEC-006: Ràng Buộc Mật Khẩu Chữ Hoa & Số Tại Cài Đặt Bảo Mật
- **Màn hình:** `Cài đặt Tài khoản (/association/settings)`
- **Triệu chứng:** Người dùng có thể đặt mật khẩu đơn giản (ví dụ: `123456`), chưa đáp ứng chuẩn bảo mật ngân hàng / C-Level.
- **Vị trí file mã nguồn cần sửa:** `apps/vione_app_fe/src/routes/association.settings.tsx`
- **Đoạn code cần bổ sung:**
  ```typescript
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ in hoa và 1 chữ số");
    return;
  }
  ```

---

### 5. BUG-PROD-008: Tự Động Định Dạng Tiền Tệ Hàng Nghìn Trong Modal Đăng Sản Phẩm
- **Màn hình:** `Gian hàng Sản phẩm (/association/products)` -> Modal Đăng sản phẩm mới.
- **Triệu chứng:** Người dùng phải tự đếm số không (0) khi nhập `85000000`, dễ gây nhầm lẫn giá trị.
- **Vị trí file mã nguồn cần sửa:** `apps/vione_app_fe/src/routes/association.products.tsx`
- **Đoạn code cần bổ sung:** Sử dụng hàm helper `formatCurrencyInput(value: string)` để chuyển `85000000` thành hiển thị `85.000.000` trên input, và parse lại dạng số thuần khi gửi API.

---
*Tài liệu nhật ký lỗi được tạo tự động từ phiên kiểm thử thực tế ngày 17/09/2026. Lập trình viên có thể mở trực tiếp các tệp tin nêu trên để xử lý nhanh chóng.*
