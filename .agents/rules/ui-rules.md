# QUY CHUẨN THIẾT KẾ GIAO DIỆN (UI RULES) - APP HIỆP HỘI CLB DOANH NHÂN CEO 1983

Tài liệu này quy định các tiêu chuẩn bắt buộc về mặt thị giác, thẩm mỹ, bố cục và tương tác giao diện người dùng (UI/UX) cho toàn bộ hệ thống ứng dụng Hiệp hội Doanh nhân CEO 1983.

---

## 1. BẢNG MÀU ĐẶC QUYỀN DOANH NHÂN (EXECUTIVE COLOR PALETTE)
Ứng dụng dành riêng cho giới chủ doanh nghiệp, tuyệt đối không sử dụng các màu sắc đơn điệu, chói gắt hoặc màu mặc định của trình duyệt.

- **Màu chủ đạo (Primary - Cobalt Navy):**
  - `#003B95` (Cobalt Navy hoàng gia - Nhận diện thương hiệu chính thức)
  - `#00224F` (Deep Navy - Thanh điều hướng, header, nền card cao cấp)
  - `#001633` (Midnight Navy - Nền dark mode sang trọng)
- **Màu điểm nhấn (Accent - Warm Amber Gold):**
  - `#F59E0B` (Amber Gold ấm áp - Huy hiệu hội viên, viền thẻ VIP, nút hành động vàng kim)
  - `#D97706` (Deep Gold - Trạng thái hover, cấp bậc ban điều hành)
  - `#FEF3C7` (Champagne Cream - Nền icon, badge nhẹ nhàng)
- **Màu nền chiều sâu (Obsidian & Slate):**
  - `#0B132B` & `#0F172A` (Obsidian Dark - Banner tài trợ Marketplace, footer, modal container)
  - `#F8FAFC` & `#F1F5F9` (Executive Light Surface - Nền sáng sạch sẽ, tinh gọn)
- **Màu trạng thái nghiệp vụ (Semantic Indicators):**
  - `#059669` / `#10B981` (Emerald - Xác thực hội viên, đã biểu quyết, thanh toán thành công)
  - `#E11D48` / `#F43F5E` (Ruby Rose - Chỉ báo cảnh báo, từ chối kết nối, hủy vé)

---

## 2. NGUYÊN TẮC TỐI GIẢN NÚT BẤM (BUTTON-TO-ICON MINIMIZATION)
- **Hạn chế tối đa các nút bấm chữ cồng kềnh:**
  - Toàn bộ danh sách hội viên, danh bạ, tin nhắn, thẻ sản phẩm phải chuyển đổi các nút bấm dài dòng thành các **Icon đơn sắc thanh lịch** từ thư viện `lucide-react` (kèm tooltip hoặc nhãn nhỏ tinh tế).
  - Ví dụ:
    - Nút "Nhắn tin" -> Icon `<MessageSquare className="h-4 w-4" />`
    - Nút "Gọi điện" -> Icon `<Phone className="h-4 w-4" />`
    - Nút "Xem hồ sơ" -> Icon `<User className="h-4 w-4" />`
- **Nút bấm (Solid Button) chỉ được phép xuất hiện ở các hành động trọng yếu:**
  1. *Chỉnh sửa hồ sơ / Chỉnh sửa thẻ* (`EditCardModal`, `QuickProfileEditModal`).
  2. *Đồng ý kết nối / Hẹn gặp chiến lược* trong tin nhắn hoặc lời mời B2B.
  3. *Xác nhận biểu quyết* trong phiên biểu quyết sự kiện.
  4. *Đăng tin cơ hội / Đăng sản phẩm mới*.

---

## 3. NGUYÊN TẮC HẠN CHẾ CHỮ & TRÁNH LẠM DỤNG VĂN BẢN (TYPOGRAPHY & CONTENT DENSITY)
- **Không viết văn bản dạng khối dài (No Walls of Text):**
  - Mọi nội dung mô tả doanh nghiệp, sản phẩm, cơ hội phải được chia tách thành các thẻ thông tin (Info Pills), gạch đầu dòng ngắn gọn hoặc huy hiệu (Badges).
- **Phân cấp thị giác rõ ràng:**
  - Tiêu đề chính: `font-black`, `uppercase`, kích cỡ `13px - 15px` trên mobile.
  - Phụ đề & nhãn mô tả: `text-[11px]`, màu `text-slate-500` / `text-slate-400`.
  - Con số thống kê: `font-mono`, `font-extrabold`, kích cỡ nổi bật với màu Gold hoặc Emerald.

---

## 4. QUY CHUẨN THẺ HỘI VIÊN & DANH THIẾP SỐ QR (MEMBER CARD UI)
- **Góc trên bên phải thẻ:**
  - Không để logo mặc định của hiệp hội; bắt buộc dành vị trí này cho **Logo công ty của chính Hội viên** để tôn vinh thương hiệu doanh nghiệp họ.
- **Mã QR danh thiếp:**
  - Đặt ngay bên dưới logo công ty trên mặt thẻ.
  - Bấm vào mã QR sẽ mở Popup phóng to chính giữa màn hình với nền mờ cao cấp (`backdrop-blur-md`).
- **Tuyệt đối không lật mặt sau thẻ (No 3D Flip):**
  - Toàn bộ nội dung bổ trợ: *Hồ sơ năng lực (Profile)*, *Hợp đồng hội viên (Contract)* và *Nút quét mã QR* được đặt trực tiếp ngay bên dưới thẻ theo chiều cuộn tự nhiên của người dùng.
- **Màn hình quét ngoài ứng dụng (`/card/:code`):**
  - Bắt buộc đồng bộ giao diện 1:1 với thẻ hội viên nội bộ, hiển thị thẻ danh thiếp chuẩn CEO 1983 kèm đầy đủ: Họ tên, Số điện thoại, Tên công ty, Link Facebook, Zalo, Website theo đúng cài đặt riêng tư (Privacy Toggles) của hội viên.

---

## 5. MODAL & BOTTOM SHEET TƯƠNG TÁC (INTERACTION CONTAINERS)
- **Modal căn giữa màn hình (Center Viewport Modals):**
  - Phải có nền tối mờ `bg-black/80 backdrop-blur-sm`, bo góc tròn mềm mại `rounded-3xl`, viền sáng tinh tế `border border-white/10`.
  - Luôn có nút đóng `X` ở góc trên bên phải và cho phép đóng khi bấm ra ngoài nền mờ.
- **Popup trượt từ dưới lên (Bottom Sheets):**
  - Dành cho các tác vụ nhanh: Gửi lời mời Hẹn gặp & Kết nối giao thương (`BusinessConnectBottomSheet`), Bật/Tắt bộ lọc nhanh.
  - Bo góc trên `rounded-t-3xl`, thanh kéo vuốt (drag handle) mờ ở trên cùng.

---

## 6. SÀN GIAO THƯƠNG MARKETPLACE & QUẢNG CÁO TÀI TRỢ
- **Khu vực Banner Quảng Cáo dưới thanh tìm kiếm:**
  - Tuyệt đối không dùng màu xanh đơn điệu hiện tại.
  - Bắt buộc sử dụng tông màu sang trọng: **Nền Obsidian Dark (`#0B132B`)** phối **Viền & Ánh kim Amber Gold (`#F59E0B`)**, hiệu ứng trượt tự động (Carousel 4s) kèm nút điều hướng chấm tròn và nhãn tài trợ doanh nghiệp đẳng cấp.
- **Nút nhắn tin cho nhà bán:**
  - Tích hợp biểu tượng `<MessageSquare />` trực tiếp trên từng thẻ sản phẩm, mở ngay luồng chat P2P với người đăng sản phẩm để thương thảo đơn hàng.
