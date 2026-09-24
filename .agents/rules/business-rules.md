# QUY CHUẨN NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES) - APP HIỆP HỘI CLB DOANH NHÂN CEO 1983

Tài liệu này định nghĩa toàn bộ quy tắc nghiệp vụ, luồng xử lý dữ liệu và logic vận hành của ứng dụng Hiệp hội Doanh nhân CEO 1983 (trực thuộc HanoiBA). Mọi nhà phát triển và module code phải tuân thủ nghiêm ngặt 100%.

---

## 1. ĐỐI TƯỢNG VÀ BẢN CHẤT CỦA ỨNG DỤNG
- **Đối tượng người dùng:** Giới chủ doanh nghiệp, Chủ tịch HĐQT, Tổng Giám đốc (CEO), Thành viên Ban Điều Hành và Hội viên chính thức sinh năm 1983 hoặc doanh nghiệp tham gia Hiệp hội.
- **Bản chất nghiệp vụ:** Ứng dụng là nền tảng số hóa quản trị và xúc tiến thương mại B2B toàn diện của Hiệp hội, bao gồm: Quản lý danh bạ thành viên, Thẻ danh thiếp số độc bản, Khớp nối cung cầu và cơ hội hợp tác, Sàn giao thương Marketplace nội bộ, Tổ chức sự kiện & đại hội, Biểu quyết nghị quyết trực tuyến và Tương tác điều hành với Ban Thư Ký.

---

## 2. QUY CHUẨN MÀN HÌNH CHÍNH & HỒ SƠ NHANH (HOME QUICK ACTIONS)
- **Cập nhật nhanh như mạng xã hội (Facebook-style Quick Edit):**
  - Cho phép Hội viên thay đổi ảnh đại diện (avatar), ảnh bìa (cover photo), logo công ty, họ tên và số điện thoại liên hệ trực tiếp ngay tại trang chủ (`/association`).
  - Mọi thay đổi phải đồng bộ tức thì vào bộ nhớ đệm cục bộ và phát sự kiện `vba_member_company_logo_updated`, `vba_member_avatar_updated`, `vba_member_cover_updated`.
- **Thanh tác vụ nhanh (Quick Action Pills):**
  - Loại bỏ các mục không phù hợp: Bỏ "Ưu đãi", Bỏ "Mã QR" thừa thãi, Bỏ "Quét NFC" và "Apple Wallet".
  - Bổ sung nút thao tác nhanh: **"Biểu quyết"** (`/association/voting`) để hội viên tham gia các cuộc họp và sự kiện đang diễn ra.

---

## 3. THẺ HỘI VIÊN, DANH THIẾP SỐ QR & QUYỀN RIÊNG TƯ
- **Nhận diện thương hiệu trên thẻ:**
  - Góc trên bên phải của Thẻ Hội Viên là **Logo công ty của chính Hội viên** (tải lên linh hoạt), không cố định logo hiệp hội.
  - Bỏ hiệu ứng lật mặt sau thẻ (3D flip) gây phân tâm trên thiết bị di động.
  - Mã QR cá nhân nằm ngay dưới Logo công ty; bấm vào mã QR sẽ mở Popup phóng to giữa màn hình.
- **Bố cục dưới thẻ:**
  - Đặt chức năng Quét QR trực tiếp ngay dưới thẻ để quét thẻ của đối tác tại hội nghị.
  - Hiển thị song song Hồ sơ năng lực (Profile) và Hợp đồng hội viên (Contract) bên dưới thẻ. Bỏ phần ảnh bìa lặp lại ở tab này.
- **Quyền riêng tư (Privacy Toggles):**
  - Tích hợp công tắc bật/tắt (Toggle) cho từng trường dữ liệu: Số điện thoại, Email, Zalo, Liên kết mạng xã hội.
  - Khi đối tác quét mã QR từ bên ngoài (`/card/:code`), chỉ những trường dữ liệu được bật công khai mới được hiển thị.
  - Giao diện trang xem ngoài (`/card/:code`) phải đồng bộ 100% về kích thước, màu sắc và kiểu dáng thẻ với Thẻ hội viên nội bộ.

---

## 4. B2B MEETING & KẾT NỐI HẸN GẶP CHIẾN LƯỢC (B2B CONNECTIVITY)
- **Không phải kết bạn mạng xã hội đơn thuần:**
  - Kết nối giữa các CEO là hành động đề xuất **Hẹn gặp trực tiếp hoặc Bàn chiến lược kinh doanh**.
  - Khi gửi kết nối, mở Popup từ dưới lên (`BusinessConnectBottomSheet`) yêu cầu nhập:
    1. Họ tên người gửi
    2. Số điện thoại liên hệ
    3. Tên doanh nghiệp
    4. Nội dung đề xuất kết nối / lịch hẹn
    5. Đính kèm liên kết tin đăng Cơ hội giao thương (nếu có).
- **Luồng xử lý phía người nhận (Receiver Flow):**
  - Tin nhắn gửi đến hiển thị dưới dạng Thẻ Thư Mời Hẹn Gặp (`[B2B_CONNECT_INVITE]`) trang trọng.
  - Phía người nhận có nút: **"Đồng ý kết nối"** (ghi nhận lịch hẹn và chuyển trạng thái bạn bè) và **"Hủy"** (hiển thị ô nhập lý do từ chối nhưng không bắt buộc nhập).

---

## 5. THỐNG KÊ REALTIME CƠ HỘI GIAO THƯƠNG B2B
- Màn hình Cơ hội (`/association/opportunities`) bắt buộc hiển thị thanh chỉ số thời gian thực:
  - **Tổng số cơ hội:** Đếm tự động từ danh sách cơ hội đang hoạt động.
  - **Tổng số sản phẩm:** Đếm từ kho hàng hóa liên kết.
  - **Tổng giá trị giao dịch (VNĐ):** Tính toán tổng giá trị các deal/cơ hội giao thương đã được khai báo.

---

## 6. SÀN GIAO THƯƠNG MARKETPLACE & QUẢNG CÁO TÀI TRỢ
- **Khu vực tài trợ dưới thanh tìm kiếm:**
  - Dành riêng cho các gói truyền thông, tài trợ thương hiệu của doanh nghiệp thành viên.
  - Giao diện bắt buộc dùng phong cách sang trọng: Nền Obsidian Dark (`#0B132B`), Viền ánh vàng Gold (`#F59E0B`), slider chuyển động mượt mà.
- **Nhắn tin trực tiếp cho chủ shop / người bán:**
  - Mỗi sản phẩm có icon tin nhắn dẫn trực tiếp tới luồng chat với người đại diện bán hàng để đàm phán hợp đồng cung ứng.

---

## 7. BIỂU QUYẾT ĐI KÈM SỰ KIỆN & CUỘC HỌP (EVENT-TIED VOTING)
- **Không đẩy biểu quyết vô căn cứ từ hệ thống:**
  - Mọi phiên biểu quyết đều phải gắn liền với một Sự kiện hoặc Cuộc họp cụ thể (Ví dụ: Đại hội Hội viên thường niên, Họp Ban Chấp Hành, Diễn đàn Doanh nhân).
- **Cấu trúc màn hình biểu quyết:**
  - **Tab 1 - Biểu quyết đang diễn ra:** Các phiên đang mở cho đại biểu tham dự cuộc họp, hiển thị lựa chọn (Tán thành, Không tán thành, Ý kiến khác) và tỷ lệ % phiếu bầu realtime.
  - **Tab 2 - Lịch sử biểu quyết:** Lưu trữ các nghị quyết đã thông qua, tỷ lệ tán thành và ngày ban hành.

---

## 8. PHÂN QUYỀN HỘI VIÊN DÀNH CHO ADMIN & BAN QUẢN TRỊ (RBAC)
- Khi tài khoản có quyền Quản trị viên (`isAdmin` / `isPlatformAdmin`) đăng nhập vào ứng dụng:
  - Hiển thị mục **"Phân quyền Hội viên (BQT)"** tại trang cá nhân và điều hướng tới `/association/permissions`.
  - Cho phép Admin chỉ định Hội viên vào 7 Ban Chuyên Môn, bổ nhiệm chức vụ (Trưởng Ban, Phó Ban, Ủy viên) và phân quyền chi tiết:
    - Quản lý Sự kiện / Cuộc họp
    - Đăng & Duyệt Bản tin CLB
    - Kiểm duyệt Sản phẩm Marketplace
    - Khởi tạo Biểu quyết
    - Thẩm định Hồ sơ Hội viên.

---

## 9. HƯỚNG DẪN SỬ DỤNG 2 CHẾ ĐỘ & BẢO VỆ TẢI TỆP
- **Chế độ 1 - Chỉ dẫn từng bước (Step-by-step Tour):**
  - Hướng dẫn cụ thể từng màn hình chính kèm hình ảnh, mô tả và mẹo thao tác.
  - Có nút **"Bỏ qua" (Skip)** nổi bật ở mọi bước để hội viên không bị làm phiền.
- **Chế độ 2 - Sổ tay PDF:**
  - Xem và tải file PDF hướng dẫn sử dụng chính thức.
  - Nút tải lên / cập nhật file PDF mới **chỉ hiển thị duy nhất cho Admin / Ban Quản Trị**. Hội viên thông thường không có quyền tải file lên hệ thống.

---

## 10. DANH BẠ LIÊN HỆ ĐẦY ĐỦ 7 BAN CHUYÊN MÔN
- Màn hình Liên hệ (`ContactSupportModal`) không chỉ liên hệ Ban Thư Ký mà phải công khai đầy đủ thông tin lãnh đạo, số điện thoại, email, địa chỉ văn phòng của:
  1. Ban Thường Trực CLB
  2. Ban Thư Ký & Điều Phối
  3. Ban Xúc Tiến Thương Mại & Đầu Tư B2B
  4. Ban Phát Triển Hội Viên & Thẩm Định
  5. Ban Truyền Thông & Sự Kiện
  6. Ban Tài Chính & Pháp Chế
  7. Ban Đào Tạo & Chuyển Đổi Số
  + Tổng đài Hỗ trợ Kỹ thuật & Tiếp nhận phản ánh 24/7.
