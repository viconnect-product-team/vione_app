# BỘ QUY CHUẨN THIẾT KẾ & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX RULES)
## ỨNG DỤNG HIỆP HỘI DOANH NHÂN CEO 1983 (PHƯƠNG ÁN 1: CLASSIC NAVY & GOLD)

> **Trạng thái tài liệu:** Chính thức ban hành & Phê duyệt (Approved)  
> **Phiên bản:** v1.0.0 — Áp dụng toàn diện cho phân hệ `/association/*`  
> **Phong cách nhận diện:** Classic Navy & Warm Amber Gold (Chuẩn Mực Doanh Nhân Lịch Lãm)  
> **Ngày ban hành:** 15/09/2026  

---

## 1. TỔNG QUAN VÀ TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

Ứng dụng Hiệp hội Doanh nhân CEO 1983 được định vị là **Cổng kết nối Giao thương Thượng đỉnh & Thẻ số Định danh VIP** dành riêng cho các Doanh nhân, Nhà sáng lập, Lãnh đạo doanh nghiệp sinh năm 1983 (Quý Hợi). 

### 1.1. 3 Giá Trị Cốt Lõi (Core Principles)
1. **Lịch Lãm & Đẳng Cấp Doanh Nhân (Executive Elegance):**
   - Lấy cảm hứng từ bộ nhận diện thương hiệu logo CEO 1983.
   - Sử dụng gam màu **Deep Cobalt Navy (`#003B95`, `#00224F`)** tượng trưng cho sự uy tín, vững chãi, kết hợp với **Warm Amber Gold (`#F59E0B`, `#D97706`)** tượng trưng cho thịnh vượng và tinh hoa thành công.
2. **Giao Thương Thực Chiến (B2B Commerce & Action-Driven):**
   - Đặt các tính năng kết nối B2B (Trao cơ hội, Đăng sản phẩm, Danh bạ hội viên, Thẻ số NFC/QR) ở vị trí trực quan, dễ thao tác với ngón tay cái (Thumb Zone).
3. **Trung Thực Dữ Liệu & Trải Nghiệm Mượt Mà (Data Integrity & Zero Waste Spacing):**
   - **Tuyệt đối không fake dữ liệu:** Không chèn dữ liệu mẫu giả định gây hiểu lầm cho người dùng. Dữ liệu trống phải được hiển thị bằng **Empty State** trang nhã, lịch sự.
   - **Bố cục liền mạch (Zero Gap down to Footer):** Không để khoảng trắng vô nghĩa giữa nội dung và thanh điều hướng chân trang. Các module nối tiếp tạo nhịp điệu thị giác phong phú.

---

## 2. HỆ THỐNG MÀU SẮC THƯƠNG HIỆU (DESIGN TOKENS & PALETTE)

### 2.1. Bảng Màu Chính (Primary Palette)
| Tên Màu | Mã HEX | Tailwind Class | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Deep Cobalt Navy** | `#003B95` | `bg-[#003B95]`, `text-[#003B95]` | Màu chủ đạo, Header, Nút chính, Huy hiệu |
| **Dark Luxury Navy** | `#00224F` | `bg-[#00224F]` | Nền gradient thẻ VIP, Header mờ |
| **Navy Hover / Active** | `#002B70` | `hover:bg-[#002B70]` | Trạng thái hover/active của các nút chính |
| **Warm Amber Gold** | `#F59E0B` | `text-amber-500`, `bg-amber-500` | Màu nhấn cao cấp, Huy hiệu VIP, Viền nổi bật |
| **Gold Dark / Bronze** | `#B45309` | `text-amber-800`, `text-[#B45309]` | Chữ tiêu đề trên nền sáng, viền badge |
| **Gold Soft Surface** | `#FEF3C7` | `bg-amber-50`, `bg-[#FEF3C7]` | Nền badge VIP, nền icon tính năng nhanh |

### 2.2. Bảng Màu Bổ Trợ & Trạng Thái (Semantic & Accents)
| Tên Màu | Mã HEX | Tailwind Class | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Emerald Online** | `#10B981` | `bg-emerald-500`, `bg-[#10B981]` | Chấm xanh online, Badge "Đã có vé VIP", "Miễn phí" |
| **Flame Orange** | `#EA580C` | `bg-[#EA580C]`, `text-[#EA580C]` | Badge số lượng mới, Khối Đăng sản phẩm, Hot deal |
| **Sky Verified** | `#0284C7` | `text-[#0284C7]`, `bg-sky-50` | Tích xanh tài khoản doanh nhân Verified |
| **Card Background Light** | `#FFFFFF` | `bg-white` | Nền thẻ nội dung sáng |
| **Card Background Dark** | `#0F172A` | `dark:bg-[#0F172A]` | Nền thẻ nội dung chế độ tối |
| **Border Soft** | `#E2E8F0` | `border-slate-200`, `dark:border-slate-800` | Đường kẻ phân tách nhẹ, viền thẻ |

---

## 3. QUY CHUẨN CÁC MODULE GIAO DIỆN (COMPONENT SPECIFICATIONS)

### 3.1. Cố Định Header Logo & Thông Báo (App Header)
- **Vị trí:** `sticky top-0 z-40`, tính toán tự động khoảng cách Safe Area (`env(safe-area-inset-top)`).
- **Logo:** Đặt Logo chính thức CLB Doanh Nhân CEO 1983 (`/ceo1983-logo.png`) ở bên trái, chiều cao cố định `40px - 44px`.
- **Nút Chuông Thông Báo:** Đặt góc phải, nền `bg-amber-50/70 dark:bg-[#14223E]`, viền `border-amber-500/30`. Badge đỏ/cam hiển thị số thông báo chưa đọc thật từ CRM (`unreadNotifCount`). Nếu bằng `0`, ẩn badge hoàn toàn.

### 3.2. Thẻ Hội Viên VIP Executive (Trang Chủ)
- **Kích thước & Kiểu dáng:** To rộng, bo góc `rounded-2xl`, bóng đổ `shadow-md`, viền `border-slate-200 dark:border-slate-800 hover:border-amber-500/50`.
- **Ảnh bìa (Cover Banner):** Chiều cao `80px - 96px`, nền gradient Navy `#00224F` sang `#003B95` kết hợp hình ảnh skyline doanh nghiệp mờ nhẹ.
- **Badge VIP trên ảnh bìa:** Góc trên bên phải đặt pill `VIP GOLD` nền vàng amber trong suốt với hiệu ứng blur.
- **Avatar dập viền nổi:** Avatar tròn kích thước `h-15 w-15`, đè lên nửa dưới ảnh bìa (`-mt-8`), viền trắng dập nổi `ring-3 ring-white dark:ring-[#0F172A]`, góc dưới có chấm online xanh ngọc `#10B981`.
- **Nút Xem thẻ VIP:** Nằm ngang hàng với avatar ở góc phải, nút bấm `Xem thẻ VIP ›` màu xanh navy liên kết trực tiếp sang `/association/card`.
- **Thông tin Doanh nhân:**
  - *Dòng 1:* Tên Công ty / Pháp nhân (uppercase, font-bold 11px, màu slate-500).
  - *Dòng 2:* Họ và tên Doanh nhân (font-black 16px) kèm icon **BadgeCheck** xanh verified.
  - *Dòng 3:* Chức danh (Chủ tịch HĐQT, Tổng Giám Đốc, Hội viên chính thức...).
  - *Dòng 4:* Mã hội viên dạng `M1983-xxx` kèm nút Copy mã có thông báo toast phản hồi.

### 3.3. Lưới 8 Tính Năng Nhanh (Quick Action Grid)
- **Bố cục:** Lưới 4 cột x 2 hàng, bo góc `rounded-3xl`, viền mềm.
- **Danh sách tính năng chuẩn:**
  1. `Thẻ hội viên` (`/association/card`)
  2. `Danh thiếp số` (`/association/business-cards`) — Badge "Mới"
  3. `Hội viên` (`/association/members`)
  4. `Sự kiện` (`/association/events`) — Badge số đếm sự kiện thực tế
  5. `Tin tức` (`/association/news`) — Badge số đếm tin tức
  6. `Tài liệu` (`/association/library`)
  7. `Liên hệ nhanh` (Mở modal liên hệ trực tiếp BQT & Hotline)
  8. `Ưu đãi hội viên` (`/association/perks`)
- **Hiệu ứng Micro-interaction:** Khi có thông báo mới, icon được bao bọc bởi ánh sáng lấp lánh nhẹ (Golden Snowflakes/Sparkle).

### 3.4. Khối Sự Kiện Nổi Bật (Featured Events)
- **Khối lịch ngày tháng:** Đặt bên trái hình ảnh sự kiện, nền Cobalt Navy `#003B95`, số ngày chữ to đậm màu vàng Amber (`#F59E0B`), tên tháng chữ trắng (`TH9`, `TH10`).
- **Nội dung:** Tên sự kiện, thời gian giờ phút, tên cộng đồng, địa điểm tổ chức.
- **Nút Xem tất cả:** Link sang `/association/events` kèm pill đếm số sự kiện `+N`.

### 3.5. Cặp Khối Giao Thương B2B Thực Chiến (Trade & Products)
- **Bố cục:** 2 cột cân xứng (50% - 50%).
- **Khối Trao Cơ Hội:** Icon bắt tay 🤝 3D, nút bấm Navy "Khám phá ngay", badge `+N Mới` (dữ liệu thật).
- **Khối Đăng Giới Thiệu Sản Phẩm:** Icon kiện hàng 📦 3D, nút bấm Flame Orange "Đăng ngay", badge `+N Mới` (dữ liệu thật).

### 3.6. Khối Doanh Nghiệp Mới Gia Nhập
- Hiển thị 2 doanh nghiệp thành viên mới nhất từ API `listMembers`.
- Hiển thị Avatar/Logo công ty, Tên công ty (đậm) và Người đại diện.
- Nút "Xem danh bạ ›" liên kết sang `/association/members`.

### 3.7. Khối Tiện Ích Thẻ Thông Minh (Smart Card Utilities)
- Gồm 3 thẻ tiện ích:
  - 💳 **Chạm NFC:** Mở màn thẻ sẵn sàng truyền danh thiếp số qua giao tiếp chạm NFC.
  - 📱 **Apple / Google Wallet:** Mở màn thẻ kèm chức năng Add to Wallet.
  - 🔗 **QR Check-in:** Mở màn quét mã QR check-in sự kiện nhanh chóng tại sảnh tiếp đón.

### 3.8. Khối Tin Hoạt Động CLB
- Danh sách 2 tin bài mới nhất từ Ban Truyền thông & BQT.
- Nút "Xem tất cả ›" liên kết sang `/association/news`.

---

## 4. QUY CHUẨN THANH ĐIỀU HƯỚNG CHÂN TRANG (BOTTOM NAVIGATION BAR)

Thanh điều hướng chân trang (Bottom Bar) là thành phần then chốt trong điều hướng ứng dụng di động:

```
┌───────────────────────────────────────────────────────────────────────┐
│  [Trang chủ]    [Sự kiện]    ( 🔳 NÚT QR VIP )   [Gắn kết]   [Cá nhân] │
│      🏠            📅             💳               💬          👤    │
└───────────────────────────────────────────────────────────────────────┘
```

1. **Tab 1: Trang chủ (`/association`)**
   - Icon: `Home` (Lucide)
   - Trạng thái Active: Màu Cobalt Navy `#003B95` / Amber trên Dark mode.
2. **Tab 2: Sự kiện (`/association/events`)**
   - Icon: `Calendar` (Lucide)
   - Trạng thái Active: Màu Cobalt Navy `#003B95`. Thay thế hoàn toàn Tab Notifications cũ.
3. **Tab 3: Nút QR Thẻ VIP — Center Elevated Button (`/association/card`)**
   - Nút nổi tròn bo góc mềm ở chính giữa, nhô cao khỏi thanh bar `-mt-7` hoặc `-top-3.5`.
   - **Màu sắc biến thiên chuẩn mực theo từng phiên bản thiết kế:**
     - **Phương án 1 (Classic Navy & Gold):** Nền Gradient Deep Cobalt Navy `#00224F` sang `#003B95`, viền trắng `#FFFFFF`, icon `QrCode` màu trắng `#FFFFFF` sắc nét tinh tế.
     - **Phương án 2 (Digital Sapphire Tech):** Nền Sapphire `#0284C7`, viền Cyan sáng `#38BDF8`, icon `QrCode` màu trắng `#FFFFFF` sắc nét.
     - **Phương án 3 (B2B Commerce Focus):** Nền Cam B2B `#EA580C` hoặc Slate `#0F172A`, viền Cam `#FDBA74`, icon `QrCode` màu trắng / Cam.
   - Thao tác: Chạm mở ngay Thẻ số định danh & QR Code cá nhân phục vụ Check-in sự kiện và Trao đổi danh thiếp số.
4. **Tab 4: Gắn kết (`/association/messages`)**
   - Icon: `MessageSquare` (Lucide)
   - Quản lý tin nhắn hội thoại, trao đổi riêng tư và thông báo kết nối B2B.
5. **Tab 5: Cá nhân (`/association/profile`)**
   - Icon: `User` (Lucide)
   - Mở màn hồ sơ doanh nhân B2B, quản trị tài khoản, đổi theme và cài đặt.

---

## 5. NGUYÊN TẮC XỬ LÝ DỮ LIỆU THẬT & TRẠNG THÁI RỖNG (EMPTY STATE RULES)

> [!IMPORTANT]
> **QUY TẮC BẤT DI BẤT DỊCH:** Tuyệt đối không tự ý bịa đặt dữ liệu giả (fake dummy data) trong mã nguồn ứng dụng hiệp hội!

### 5.1. Quy Chuẩn Hiển Thị Empty State
Khi API backend trả về mảng dữ liệu rỗng (`length === 0`), giao diện BẮT BUỘC phải hiển thị một khối **Empty State** trang nhã theo mẫu sau:
1. **Icon đại diện:** Màu mờ nhạt (`text-slate-300 dark:text-slate-600`), kích thước vừa phải (`28px - 36px`).
2. **Khung bao:** Card bo tròn `rounded-2xl`, viền nét đứt `border border-dashed border-slate-200 dark:border-slate-800`, padding `p-5` hoặc `p-6`.
3. **Thông điệp ngắn gọn:** Font font-semibold 12px, nêu rõ hiện trạng (Ví dụ: *"Hiện chưa có sự kiện mới sắp diễn ra"*, *"Chưa có doanh nghiệp mới tuần này"*).
4. **Gợi ý hành động:** Dòng chữ phụ 11px hướng dẫn người dùng quay lại sau hoặc liên hệ ban tổ chức.

---

## 6. QUY TẮC HIỂN THỊ DARK MODE & CONTRAST

- **Light Mode (Mặc định):**
  - Nền trang: `#F8FAFC` hoặc `#F1F5F9`.
  - Nền thẻ: `#FFFFFF`, viền `#E2E8F0`.
  - Chữ chính: `#0F172A`, chữ phụ: `#64748B`.
- **Dark Mode (Doanh Nhân Thượng Đỉnh):**
  - Nền trang: `#070D1A` hoặc `#0B1329`.
  - Nền thẻ: `#0F172A`, viền `#1E293B`.
  - Chữ chính: `#FFFFFF`, chữ phụ: `#94A3B8`.
- **Contrast Mode:**
  - Nền đen tuyền `#000000`, viền sáng nét cao `#38BDF8` hoặc `#F59E0B`, tối ưu cho người dùng cần độ tương phản mạnh dưới ánh sáng mặt trời ngoài trời.

### 6.1. QUY CHUẨN ĐỘ TƯƠNG PHẢN & MÀU CHỮ TRÊN NỀN (STRICT RULEUI HIỆP HỘI CEO 1983)
> [!CRITICAL]
> **QUY TẮC BẤT KHẢ XÂM PHẠM VỀ NHẬN DIỆN THƯƠNG HIỆU & KHẢ NĂNG TRUY CẬP (A11Y):**
> 1. **NỀN XANH (Navy / Primary `#2E3192`, `#003B95`, `#19194D`, `bg-blue-*`):**
>    - Khi nền màu xanh thì TOÀN BỘ chữ (text), icon, nhãn tab, số đếm (counter badge) BẮT BUỘC là màu TRẮNG (`#FFFFFF` / `text-white font-bold`).
>    - **TUYỆT ĐỐI CẤM** chữ màu đen (`#000000` / `#0F172A`) trên nền xanh!
> 2. **NỀN ĐỎ (Alert / Notification Badges `bg-red-600`, `bg-red-500`, `#DC2626`):**
>    - Khi nền màu đỏ thì TOÀN BỘ chữ và số đếm BẮT BUỘC là màu TRẮNG (`#FFFFFF` / `text-white font-black`).
>    - **TUYỆT ĐỐI CẤM** chữ màu đen trên nền đỏ!
> 3. **MÀN HÌNH QUÉT QR CHECK-IN (`/association/checkin`):**
>    - Tab chuyển đổi active (Quét QR / Chạm NFC) và nút "Bật camera quét QR" BẮT BUỘC dùng nền xanh CEO `#2E3192` hover `#19194D`, chữ và icon màu TRẮNG (`#FFFFFF`).
>    - Khung viền góc và laser quét đồng bộ xanh CEO `#2E3192`.
>    - **TUYỆT ĐỐI CẤM** dùng nền vàng cam đi cùng chữ đen!
> 4. **NÚT BẤM CÓ SỰ KIỆN CLICK:**
>    - Toàn bộ nút có tương tác click đồng bộ nền xanh CEO `#2E3192` hover `#19194D`, chữ TRẮNG (`text-white font-bold`), trừ các nút đặc thù thanh toán.
> 5. **CẤM CSS GHI ĐÈ:**
>    - Tuyệt đối không viết CSS ép biến `.text-white` thành màu đen trong light mode. Mọi element có class `.text-white` hoặc nằm trên nền xanh/đỏ phải được đảm bảo hiển thị màu trắng tinh khôi `#FFFFFF !important`.

---

## 7. CHECKLIST KIỂM THỬ GIAO DIỆN (UI/UX QUALITY CHECKLIST)

Mọi lập trình viên và AI Agent khi thao tác trên app Hiệp hội phải đối chiếu checklist trước khi hoàn thành:
- [x] Logo CEO 1983 hiển thị sắc nét ở Header, không bị méo tỷ lệ.
- [x] Thẻ hội viên VIP có đủ Ảnh bìa Cover + Avatar tròn đè ảnh bìa + Tên công ty + Tên hội viên + Chức danh + Mã sao chép.
- [x] Không còn khoảng trắng trống rỗng thừa thãi ở chân trang (Zero whitespace gap).
- [x] Thanh Bottom Bar đủ 5 tab, nút giữa là nút QR Code Thẻ VIP (màu sắc theo từng phiên bản).
- [x] Tab thứ 2 trên Bottom Bar là Sự kiện (`/association/events`).
- [x] Mọi mục không có dữ liệu đều hiển thị Empty State lịch sự, không lỗi vỡ layout.
- [x] Nút bấm có hiệu ứng phản hồi `active:scale-95` mượt mà.
- [x] Không tự động chạy `git push` hay `git commit` vi phạm AGENTS.md.

---

## 8. QUY CHUẨN TƯƠNG THÍCH ĐA THIẾT BỊ, THAO TÁC 1 TAY & ĐIỀU KHIỂN BÀN PHÍM ẢO (MANDATORY MOBILE RULES)

> [!IMPORTANT]
> **4 QUY TẮC BẮT BUỘC TRÊN TẤT CẢ CÁC MÀN HÌNH MOBILE:**

### 8.1. Tương Thích Safe Area Insets & Z-Index Đa Dòng Điện Thoại
- **Header:** Bắt buộc có `z-index: 40` hoặc `z-index: 50` và đệm trên `padding-top: max(env(safe-area-inset-top, 0px), 16px)`. Đảm bảo thanh tiêu đề, nút Back và avatar không bao giờ bị che khuất bởi Status Bar (đồng hồ, biểu tượng pin, sóng mạng, tai thỏ hay Dynamic Island).
- **Footer / Khung Chat / Action Bar:** Bắt buộc có đệm dưới `padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px)`. Đảm bảo các nút tương tác, thanh nhập tin nhắn và nút gửi không bao giờ bị che khuất bởi 3 phím điều hướng Android (Vuông, Tròn, Tam giác) hoặc thanh gạt Home Indicator của iOS.

### 8.2. Thiết Kế Thao Tác 1 Tay Thuận Tiện (One-Handed Usability / Thumb Zone)
- Bố trí toàn bộ các nút bấm tương tác quan trọng, thanh điều hướng 5 tabs, các bộ lọc pills, nút Gửi tin nhắn và các nút xác nhận CTA ở nửa dưới màn hình (vùng hoạt động tự nhiên của ngón tay cái).
- Hạn chế tối đa việc bắt người dùng phải với ngón tay lên góc trên màn hình để thực hiện tác vụ chính.

### 8.3. Chuẩn Hóa Card Sự Kiện, Biểu Tượng Người & Nút Hành Động Icon-Only
- **Biểu tượng số người đăng ký:** BẮT BUỘC dùng biểu tượng Người (`Users`), TUYỆT ĐỐI KHÔNG dùng biểu tượng ngọn lửa (`Flame`) gây hiểu nhầm về tính chất sự kiện.
- **Nút Xem chi tiết:** Chuyển thành nút Icon-Only vuông gọn `h-7 w-7` với icon con mắt `Eye` sắc nét, tooltip `title="Xem chi tiết"`, nền xanh CEO `#2E3192` icon trắng.
- **Nút Đăng ký tham gia:** Chuyển thành nút Icon-Only vuông gọn `h-7 w-7` với icon vé `Ticket`, tooltip `title="Đăng ký tham gia"`, nền xanh CEO `#2E3192` icon trắng.
- **Nút Hủy đăng ký:** BẮT BUỘC chỉ sử dụng 1 ICON DUY NHẤT (icon `X`), kích thước `h-7 w-7`, TUYỆT ĐỐI KHÔNG ĐỂ CHỮ "HỦY" hay "ĐANG HỦY" gây thô kệch và làm lệch tỷ lệ giao diện.
- **Đồng bộ chiều cao hàng nút:** Toàn bộ cụm hành động bên phải thẻ sự kiện (nút Chi tiết, nút Đăng ký, badge Đã đăng ký, nút Hủy) đạt chuẩn chiều cao đồng nhất `h-7` (28px).

### 8.4. Input Tìm Kiếm & Kiểm Soát Bàn Phím Ảo (Search & Virtual Keyboard)
- **Input Tìm kiếm:** TUYỆT ĐỐI KHÔNG ĐƯỢC CÓ BORDER HOVER (`border-none hover:border-transparent focus:ring-0 outline-none`). Loại bỏ mọi hiệu ứng đổi màu viền khi hover/focus gây chớp nháy viền trên thiết bị di động.
- **Bắt buộc ẩn Footer khi nhập liệu:** Khi người dùng chạm/focus vào bất kỳ ô nhập liệu nào (`input`, `textarea`, `contenteditable`) hoặc khi bàn phím ảo hiển thị, thanh Footer / Bottom Tab Bar BẮT BUỘC PHẢI ẨN ĐI NGAY LẬP TỨC (`display: none !important`). Tuyệt đối không để footer của app bị bàn phím ảo đẩy trồi lên trên bàn phím gây che khuất nội dung.

### 8.5. Quy Chuẩn Favicon & Nhận Diện Tab Trình Duyệt CEO 1983
- Mọi trang của phân hệ Hiệp hội (`/association/*`, `/association/login`, `/verify`, `landing/ceo1983`) BẮT BUỘC sử dụng Favicon riêng của CLB Doanh Nhân CEO 1983 ([`/ceo1983-favicon.png`](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/vione_app_fe/public/ceo1983-favicon.png)) trên nền trắng bo góc sang trọng.
- TUYỆT ĐỐI KHÔNG để biểu tượng chữ V của ViOne hiển thị ở góc tab trình duyệt khi người dùng đang ở trong không gian Hiệp hội CEO 1983.

---

## 9. QUY CHUẨN MODAL QR, TRANG XÁC THỰC CÔNG KHAI & ICON MOBILE NATIVE

### 9.1. Căn Giữa Modal QR Thẻ Hội Viên (Strict Modal Viewport Centering)
- **Cơ chế Portal:** Modal xem mã QR trên thẻ hội viên (`association.card.tsx`) và modal chỉnh sửa thông tin thẻ (`EditCardModal`) BẮT BUỘC phải được đưa vào React Portal (`createPortal(..., document.body)`).
- **Lý do kỹ thuật:** Khi modal render trong cây DOM con của `MemberScreen`, thuộc tính `backdrop-filter` và `max-w-[480px]` cùng vị trí cuộn của `<main>` tạo ra containing block cục bộ, khiến `position: fixed` bị kẹt và lệch tâm màn hình điện thoại.
- **Quy chuẩn hiển thị:**
  + Lớp phủ nền: `fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in`.
  + Khung thẻ QR: `mx-auto w-full max-w-[320px] rounded-3xl border border-slate-700/60 bg-slate-900/95 p-6 text-center shadow-2xl animate-in zoom-in-95`.
  + Vùng canvas QR: Nền trắng `bg-white p-3.5 rounded-2xl shadow-lg` để camera điện thoại của người đối diện quét nhạy và nhận diện mã tức thì.
  + Nhãn thông tin: Tên hội viên chữ trắng `text-white font-bold`, mã hội viên chữ xanh `text-blue-400 font-semibold`, trạng thái màu xanh ngọc `text-emerald-400`, nút đóng `X` bo tròn nổi bật.

### 9.2. Cô Lập Trang Xác Thực Công Khai (`/verify`) - Tách Biệt Tuyệt Đối ViOne
- **Nguyên tắc phân lập hệ sinh thái:** App Hiệp hội CLB Doanh Nhân CEO 1983 là thực thể độc lập. TUYỆT ĐỐI KHÔNG ĐƯỢC có bất kỳ liên kết, nút bấm hoặc điều hướng nào dẫn sang App ViOne Connect (`/` hoặc `/connect-app`).
- **Logo nhận diện:** Trang `/verify` BẮT BUỘC hiển thị Logo chính thức CLB Doanh Nhân CEO 1983 (`/ceo1983-official-logo.png`). CẤM sử dụng logo hoặc biểu tượng ViOne (`/app-icon.png`).
- **Nút "Về trang chủ":** BẮT BUỘC điều hướng về `/association` với nhãn `Về trang chủ Hiệp hội CEO 1983` (áp dụng cho cả màn hình xác thực hợp lệ, màn hình chưa có mã, và màn hình thẻ không hợp lệ/hết hạn).
- **Thiết kế thương hiệu:** Nền đen doanh nhân `#0A0A0B`, thẻ kính mờ `bg-white/[0.04] border-white/10`, chữ vàng hổ phách `#E6C687` và xanh CEO `#2E3192`, chữ trắng độ tương phản cao, badge trạng thái hợp lệ màu ngọc lục bảo `emerald-400`.

### 9.3. Bộ Biểu Tượng Ứng Dụng (App Icon) Native Cho Android & iOS
- **Mã nguồn Mobile tách biệt:**
  + `apps/mobile_ceo1983/`: Dành riêng cho Hiệp hội CLB Doanh Nhân CEO 1983 (`vn.ceo1983.app`).
  + `apps/mobile_vione/`: Dành riêng cho Mạng xã hội ViOne Connect (`com.vione.app`).
- **Bảo lưu đường dẫn Live Testapp:** Cấu hình `REMOTE_URL` trong `capacitor.config.ts` của `apps/mobile_ceo1983` giữ nguyên `http://14.225.217.232:5000/association` để phục vụ link testapp như cũ.
- **Quy chuẩn đồ họa App Icon:**
  + Sử dụng chính Logo chính thức CEO 1983 đặt trang trọng trên nền trắng thuần khiết `#FFFFFF` (tỉ lệ 1:1, căn giữa an toàn trong vòng tròn safe-zone 66% để không bị cắt xén khi các launcher Android bo tròn hoặc iOS bo squircle).
  + Android mipmaps: Đồng bộ đầy đủ 5 mật độ (`mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`) với 3 biến thể: `ic_launcher.png` (icon vuông), `ic_launcher_round.png` (icon tròn bo viền tròn dest-in), `ic_launcher_foreground.png` (icon adaptive lớp trên trong suốt).
  + iOS Assets: `AppIcon-512@2x.png` (1024x1024) trong `AppIcon.appiconset`.
  + Root Assets: `icon.png` (1024x1024), `adaptive-icon.png` (1024x1024), `favicon.png` (192x192).

---

## 10. QUY CHUẨN KHỬ TRÙNG LẶP THÔNG BÁO, INPUT PLACEHOLDER, THOÁT MODAL & PRESENCE TIN NHẮN THỜI GIAN THỰC

### 10.1. Khử Trùng LẶp Thông Báo Đa Bảng (Notification Deduplication)
- **Nguyên nhân cốt lõi:** Hệ thống có 2 bảng lưu thông báo (`public.business_notifications` và `public.member_notifications`), ngoài ra còn có bản ghi thông báo động từ `events` và `opportunities`. Khi query gộp dễ bị nhân đôi một thông báo nếu không có deduplication.
- **Quy chuẩn Backend:** Bắt buộc áp dụng cơ chế Composite Key Deduplication trong `connect-app.service.ts`:
  + Khóa định danh: `id:${item.id}`, `ref:${item.refType}:${item.refId}`, `src:${item.sourceRecordId}`.
  + Khóa nội dung chuẩn hóa: `text:${normTitle}|${normBody}|${dayKey}` để loại bỏ hoàn toàn các thông báo gửi trùng cùng nội dung trong cùng ngày.
- **Quy chuẩn Frontend:** Sử dụng client-side deduplication memo trong `association.notifications.tsx` làm chốt chặn an toàn thứ hai.

### 10.2. Thu Gọn Chiều Cao Thẻ Thông Báo & Sự Kiện (Compact Mobile Cards)
- **Thẻ thông báo:** Giảm padding từ `p-4` xuống `p-2.5 sm:p-3`, icon box giảm còn 34px (`h-8.5 w-8.5`), chữ tóm tắt nội dung gọn gàng, giảm tổng chiều cao ~35% để màn hình hiển thị được nhiều thông báo hơn mà không cần cuộn nhiều.
- **Thẻ sự kiện:** Giảm padding xuống `p-2.5 sm:p-3`, ảnh thu nhỏ về `h-16 w-16` (64x64px), hàng nút tác vụ chuẩn `h-7`, tối ưu hoá tỷ lệ hiển thị trên màn hình di động nhỏ gọn.

### 10.3. Ô Nhập Liệu Không Giật Viền Hover & Placeholder Rõ Nét
- **Xóa viền hover:** Toàn bộ ô `input`, `textarea`, `select` trong modal chỉnh sửa tài khoản/hồ sơ (`association.profile.tsx`) và danh thiếp (`association.business-cards.tsx`) tuyệt đối không đổi màu viền khi hover (`hover:border-slate-200 dark:hover:border-slate-700`), chỉ đổi màu viền xanh CEO `#003B95` khi `focus`.
- **Placeholder rõ nét:** Mọi ô nhập liệu bắt buộc có placeholder hướng dẫn cụ thể với màu tương phản cao `placeholder:text-slate-500 dark:placeholder:text-slate-400`, tuyệt đối không để placeholder bị mờ tịt không thấy chữ.

### 10.4. Cơ Chế Thoát Modal Chỉnh Sửa App Hiệp Hội (Action Param Clearance)
- **Nguyên tắc đóng modal:** Khi modal chỉnh sửa được kích hoạt bởi URL query parameter (ví dụ `?tab=cards&action=edit`), khi người dùng bấm nút Đóng (X), nút Hủy ("Hủy"), hoặc sau khi lưu thành công, component BẮT BUỘC phải thực hiện xóa tham số `action` khỏi URL:
  ```ts
  navigate({ search: (prev: any) => { const { action, ...rest } = prev; return rest; } });
  ```
- Tuyệt đối không để sót `action=edit` trên URL gây kích hoạt lại `useEffect` và kẹt trong modal không thoát được.

### 10.5. Lọc Danh Sách Tin Nhắn & Chấm Xanh Online Realtime
- **Lọc hội viên trong danh sách trò chuyện:** Chỉ hiển thị những người đã kết nối thành công (`user_connections.status = 'accepted'`) VÀ đã có tin nhắn trao đổi (`latest.text.trim().length > 0`).
- **Dải hội viên hoạt động trên đỉnh:** Chỉ hiển thị những người đã có tin nhắn, không đổ toàn bộ danh bạ hội viên.
- **Chấm xanh trạng thái trực tuyến:**
  + CHỈ HIỂN THỊ khi tài khoản đó ĐANG ONLINE THỰC SỰ thông qua WebSocket presence (`presence:user_online` / `presence:user_offline` từ `ConnectAppGateway`) và kiểm tra `isUserOnline(userId)`.
  + Khi người dùng offline: Không hiển thị chấm xanh trên avatar, trạng thái hiển thị chấm xám kèm text "Không trực tuyến".
  + TUYỆT ĐỐI CẤM gán cứng chấm xanh "Đang hoạt động" cho tất cả người dùng.

---

## 11. QUY CHUẨN GIAO DIỆN TIN NHẮN CHUẨN MESSENGER (MESSAGING UI/UX STANDARDS)

### 11.1. Bong Bóng Tin Nhắn Đã Gửi (Sent Message Bubble)
- **Chiều cao thấp chuẩn Messenger (Compact Height):**
  + Giảm padding từ `px-3.5 py-2` xuống `px-3 py-1.5`, chữ `leading-snug`, tối ưu hoá diện tích hiển thị bong bóng tin nhắn.
  + Khối thời gian và trạng thái "✓✓ Đã xem" được lồng gọn gàng ngay dưới nội dung với cỡ chữ siêu gọn `text-[9.5px]`, `pt-0.5`, loại bỏ hoàn toàn thẻ div padding dày cộp tách rời làm phình to bong bóng tin nhắn.
- **Bỏ màu nền & Chữ đen sắc nét (No Background Tint & Pure Black Text):**
  + Bong bóng tin nhắn BỎ HOÀN TOÀN MÀU NỀN (`bg-transparent`), giữ viền xanh thương hiệu `border border-[#003B95]` tinh tế và rõ nét.
  + Chữ tin nhắn BẮT BUỘC có màu ĐEN thuần túy (`color: #000000 !important`, `text-black`), không bị chuyển thành màu trắng hay xám nhạt khi ở các chế độ hiển thị khác nhau.
  + Thời gian gửi hiển thị xám đậm `color: #64748b`, trạng thái `✓✓ Đã xem` màu xanh thương hiệu `color: #003B95 font-bold`.

### 11.2. Ô Nhập Tin Nhắn Không Viền (Borderless Chat Input)
- **Thiết kế tối giản hiện đại:**
  + Ô nhập tin nhắn tại thanh nhập đáy (`association.messages.tsx`) loại bỏ hoàn toàn viền: `border-0 border-none outline-none ring-0 focus:ring-0 shadow-none`.
  + Nền bo tròn dạng viên thuốc `bg-slate-100 dark:bg-white/[0.06] rounded-2xl px-4 py-2`, đem lại cảm giác thanh thoát, hiện đại như Messenger / Telegram.

### 11.3. Trích Xuất Tên Người Thật Trên Dải Avatar Hội Viên (Real Person Name Extraction)
- **Loại bỏ hậu tố công ty / nền tảng:**
  + Đối với các tài khoản có tên kèm công ty hoặc hệ thống (như `"Phạm Văn Vũ - ViOne Platform"` hoặc `"Nguyễn Văn A - CEO1983"`), hàm `cleanPersonName` tự động cắt bỏ phần hậu tố sau dấu gạch ngang (`-`).
  + Hàm `getShortName` lấy tên người thật (ví dụ: `"Văn Vũ"` thay vì lấy chữ `"Platform"` ở cuối cùng).

### 11.4. Sắp Xếp Cuộc Trò Chuyện Theo Thời Gian Mới Nhất Lên Đầu (Strict Latest-First Sorting)
- **Ưu tiên thời gian thực:**
  + Danh sách cuộc trò chuyện sắp xếp giảm dần theo thời gian tin nhắn mới nhất `timeB - timeA`.
  + Tin nhắn mới nhất (ví dụ: 2 phút trước) luôn lập tức nổi lên vị trí đầu tiên, không bị các thông báo hệ thống cũ hơn (19 giờ trước) chèn lên trên.


