# KẾ HOẠCH TIẾN ĐỘ & NHẬT KÝ PHÁT TRIỂN CHI TIẾT ỨNG DỤNG HIỆP HỘI CEO 1983
**Dự án:** VIONE Ecosystem · **Phân hệ:** CLB Doanh Nhân CEO 1983 Mobile App  
**Người thực hiện:** Phạm Văn Vũ · **Cập nhật:** Ngày 16/09/2026

---

## 1. TỔNG QUAN HIỆN TRẠNG & TỶ LỆ HOÀN THIỆN
- **Tổng số tính năng con được khảo sát & triển khai:** 72 tính năng
- **Tính năng đã hoàn thành (Ready for Production):** 68 / 72 tính năng (95%)
- **Tính năng đang thực hiện (Pending Sandbox / Hardware test):** 4 / 72 tính năng (5%)
- **Độ hoàn thiện mã nguồn trung bình:** **99%**

> [!WARNING]
> ### LƯU Ý VỀ CÁC TÍNH NĂNG CHƯA KIỂM THỬ TRÊN MÔI TRƯỜNG DEV:
> 1. **Gọi thoại & Gọi video WebRTC 1-1 / Nhóm (Độ hoàn thiện 65%):** Code Socket.io signaling gateway backend và giao diện phòng gọi UI đã thiết kế hoàn chỉnh. **Chưa thể kiểm thử end-to-end trên mạng thực tế** do cần 2 thiết bị di động vật lý có Camera/Mic và máy chủ TURN/STUN relay trên Internet.
> 2. **Chạm thẻ thông minh NFC (Độ hoàn thiện 70 - 75%):** Logic đọc/ghi Web NFC API (NDEFReader) và popup quét radar đã hoàn chỉnh. **Chưa thể test chạm thực tế thẻ vật lý NTAG213/215** trên máy tính bàn (thiết bị dev không có phần cứng NFC).
> 3. **Gạch nợ tự động VietQR (Độ hoàn thiện 70%):** Logic sinh mã QR chuẩn Napas 247 đã kiểm thử quét thành công trên các app ngân hàng thật. **Luồng webhook gạch nợ tự động và đối soát giao dịch thực tế** cần môi trường Sandbox ngân hàng hoặc tài khoản ngân hàng chính thức của CLB.

---

## 2. BẢNG TỔNG HỢP THEO PHÂN HỆ

| Mã | Phân Hệ Chức Năng | Số Tính Năng | Đã Hoàn Thành | Đang Hoàn Thiện | Độ Hoàn Thiện (%) |
|---|---|:---:|:---:|:---:|:---:|
| **MOD-01** | Xác Thực, Đăng Nhập & Kích Hoạt Thẻ Hội Viên | 5 | 5 | 0 | **99%** |
| **MOD-02** | Thẻ Hội Viên Thông Minh & Danh Thiếp Điện Tử (Digital Card) | 5 | 5 | 0 | **100%** |
| **MOD-03** | Công Nghệ Chạm Thẻ Thông Minh NFC & Wallets | 2 | 0 | 2 | **75%** |
| **MOD-04** | Gắn Kết & Tin Nhắn Doanh Nhân Phong Cách Messenger VIP | 7 | 6 | 1 | **95%** |
| **MOD-05** | Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối | 4 | 4 | 0 | **100%** |
| **MOD-06** | Sàn Cơ Hội Giao Thương B2B & Gian Hàng Sản Phẩm | 3 | 3 | 0 | **100%** |
| **MOD-07** | Sự Kiện Tràn Viền, Check-in QR & Biểu Quyết Bầu Cử | 3 | 3 | 0 | **98%** |
| **MOD-08** | Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 247 | 3 | 2 | 1 | **90%** |
| **MOD-09** | Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Ban Thư Ký | 5 | 5 | 0 | **100%** |
| **MOD-10** | Tách Biệt Độc Lập Luồng Thông Báo & Landing Page Điện Ảnh | 2 | 2 | 0 | **100%** |
| **MOD-11** | Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành | 8 | 8 | 0 | **100%** |
| **MOD-12** | Nâng Cấp Toàn Diện 14 Tính Năng & Tinh Chỉnh Trải Nghiệm Doanh Nhân CEO 1983 | 16 | 16 | 0 | **100%** |
| **MOD-13** | Hoàn Thiện 8 Hạng Mục Tinh Chỉnh Chuyên Sâu & Sửa Lỗi Nghiệp Vụ (17/09) | 9 | 9 | 0 | **100%** |

---

## 3. CHI TIẾT TỪNG TÍNH NĂNG, PHÂN TÁCH GIAO DIỆN & API MAP

### MOD-01: Xác Thực, Đăng Nhập & Kích Hoạt Thẻ Hội Viên

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 1 | **AUTH-01** | Đăng nhập đa kênh (Số điện thoại / Mã hội viên / Email) | Phạm Văn Vũ | **Cao** | Màn hình Đăng nhập (/association/login) | ✅ Hoàn thành | **100%** | `POST /api/auth/login, POST /api/auth/refresh` | ✅ Đã kết nối | **100%** |  |
| 2 | **AUTH-02** | Đăng ký tài khoản hội viên mới & Form hồ sơ pháp nhân | Phạm Văn Vũ | **Cao** | Màn hình Đăng ký (/association/register) | ✅ Hoàn thành | **100%** | `POST /api/auth/register, POST /api/members/apply` | ✅ Đã kết nối | **100%** |  |
| 3 | **AUTH-03** | Popup Quên mật khẩu & Gửi OTP qua SMS | Phạm Văn Vũ | **Trung bình** | Popup Quên mật khẩu (/association/login) | ✅ Hoàn thành | **95%** | `POST /api/auth/forgot-password, POST /api/auth/verify-otp` | ✅ Đã kết nối | **95%** |  |
| 4 | **AUTH-04** | Popup Đổi mật khẩu & Quản lý phiên đăng nhập thiết bị | Phạm Văn Vũ | **Cao** | Popup Đổi mật khẩu (/association/settings) | ✅ Hoàn thành | **100%** | `PUT /api/auth/password, GET /api/auth/sessions` | ✅ Đã kết nối | **100%** |  |
| 5 | **AUTH-05** | Cài đặt PWA lên màn hình chính (iOS Add to Home / Android Install) | Phạm Văn Vũ | **Cao** | Popup / Banner Cài đặt (/install) | ✅ Hoàn thành | **100%** | `Web App Manifest, Service Worker caching` | ✅ Đã kết nối | **100%** |  |

### MOD-02: Thẻ Hội Viên Thông Minh & Danh Thiếp Điện Tử (Digital Card)

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 6 | **CARD-01** | Hiển thị Thẻ Hội Viên VIP (Dấu tích xanh, Mã M1983, Avatar, Pháp nhân) | Phạm Văn Vũ | **Cao** | Màn hình Thẻ Hội Viên (/association/card) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/me, GET /api/members/me` | ✅ Đã kết nối | **100%** |  |
| 7 | **CARD-02** | Cấu trúc Hồ sơ Doanh nhân ngay bên dưới Thẻ hội viên | Phạm Văn Vũ | **Cao** | Màn hình Thẻ Hội Viên (/association/card) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/me, GET /api/members/me` | ✅ Đã kết nối | **100%** |  |
| 8 | **CARD-03** | Tích hợp Mạng xã hội & Ví điện tử (Facebook, Zalo, LinkedIn, Apple/Google Wallet) | Phạm Văn Vũ | **Cao** | Màn hình Thẻ Hội Viên (/association/card) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/me, PUT /api/connect-app/me/socials` | ✅ Đã kết nối | **100%** |  |
| 9 | **CARD-04** | Nâng cấp Danh thiếp số công khai chuẩn nhận diện CLB CEO 1983 | Phạm Văn Vũ | **Cao** | Trang Public Card (/card/$code) | ✅ Hoàn thành | **100%** | `GET /api/business-cards/code/:code` | ✅ Đã kết nối | **100%** |  |
| 10 | **CARD-05** | Nút "Xem danh thiếp số" trong Hồ sơ hội viên | Phạm Văn Vũ | **Cao** | Modal MemberProfileModal (/association/members, /messages) | ✅ Hoàn thành | **100%** | `GET /api/members/:id` | ✅ Đã kết nối | **100%** |  |

### MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC & Wallets

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 11 | **NFC-01** | Popup Radar quét và Chạm kết nối NFC một chạm | Phạm Văn Vũ | **Cao** | Popup Chạm Thẻ NFC (/association/card, /profile) | ⏳ Đang làm | **75%** | `Web NFC API (NDEFReader / NDEFWriter)` | ⏳ Đang kết nối | **75%** |  |
| 12 | **NFC-02** | Ghi URL Danh thiếp doanh nhân vào phôi thẻ NFC kim loại / gỗ | Phạm Văn Vũ | **Trung bình** | Popup Quản lý Thẻ NFC (/association/card) | ⏳ Đang làm | **75%** | `POST /api/connect-app/nfc/write-url` | ⏳ Đang kết nối | **75%** |  |

### MOD-04: Gắn Kết & Tin Nhắn Doanh Nhân Phong Cách Messenger VIP

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 13 | **MSG-01** | Danh sách cuộc trò chuyện, hiển thị snippet tin nhắn mới nhất & tab "Chưa đọc" | Phạm Văn Vũ | **Cao** | Màn hình Hộp thư (/association/messages) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/dm/threads` | ✅ Đã kết nối | **100%** |  |
| 14 | **MSG-02** | Giao diện Chat 1-1 phong cách Messenger (Bong bóng #0084FF, Avatar đối tác, Timestamps) | Phạm Văn Vũ | **Cao** | Màn hình Chat chi tiết (/association/messages?thread=xxx) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/dm/threads/:id/messages, POST /api/connect-app/dm/threads/:id/messages` | ✅ Đã kết nối | **100%** |  |
| 15 | **MSG-03** | Thu hồi tin nhắn đã gửi (Recall Message) & Cơ chế nhảy top luồng chat | Phạm Văn Vũ | **Cao** | Màn hình Chat chi tiết & Hộp thư | ✅ Hoàn thành | **100%** | `DELETE /api/connect-app/dm/member/messages/:messageId` | ✅ Đã kết nối | **100%** |  |
| 16 | **MSG-04** | Thanh tương tác nhanh nằm ngang (Thả 6 emoji cảm xúc 😊 & Menu ⋯) | Phạm Văn Vũ | **Trung bình** | Bong bóng chat (/association/messages) | ✅ Hoàn thành | **100%** | `POST /api/connect-app/dm/messages/:id/reaction` | ✅ Đã kết nối | **100%** |  |
| 17 | **MSG-05** | Gọi thoại & Gọi video doanh nhân WebRTC 1-1 và phòng họp nhóm | Phạm Văn Vũ | **Trung bình** | Popup Call WebRTC (/association/messages) | ⏳ Đang làm | **65%** | `WebRTC Signaling Gateway, Socket.io (webrtc:offer, webrtc:answer, webrtc:candidate)` | ⏳ Đang kết nối | **65%** |  |
| 18 | **MSG-06** | Tạo nhóm chat phong cách Messenger (CreateGroupChatModal: gợi ý tên, icon, carousel chip thành viên) | Phạm Văn Vũ | **Cao** | Màn hình Hộp thư & Popup Tạo nhóm (/association/messages) | ✅ Hoàn thành | **100%** | `POST /api/connect-app/dm/messages, LocalStorage group sync` | ✅ Đã kết nối | **100%** |  |
| 19 | **MSG-07** | Xem thành viên nhóm (GroupMembersModal) & Tin nhắn hệ thống [system] căn giữa | Phạm Văn Vũ | **Cao** | Màn hình Chat nhóm (/association/messages?thread=group_xxx) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/dm/messages, Member Directory sync` | ✅ Đã kết nối | **100%** |  |

### MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 20 | **DIR-01** | Danh bạ 500+ Doanh nhân, tìm kiếm theo tên, công ty và lọc theo ngành nghề | Phạm Văn Vũ | **Cao** | Màn hình Danh bạ (/association/members) | ✅ Hoàn thành | **100%** | `GET /api/members, GET /api/members/industries` | ✅ Đã kết nối | **100%** |  |
| 21 | **DIR-02** | Tính năng Mời Hội Viên Mới vào CLB CEO 1983 (Invite Modal) | Phạm Văn Vũ | **Cao** | Modal Mời Hội Viên (/association/members) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/referral, POST /api/connect-app/invite` | ✅ Đã kết nối | **100%** |  |
| 22 | **DIR-03** | Popup Hồ sơ năng lực hội viên chi tiết khi bấm vào Avatar | Phạm Văn Vũ | **Cao** | Modal MemberProfileModal (/association/members, /messages) | ✅ Hoàn thành | **100%** | `GET /api/members/:id, GET /api/members/:id/profile` | ✅ Đã kết nối | **100%** |  |
| 23 | **DIR-04** | Nút chuyển đổi trạng thái Kết nối <-> Hủy kết nối thông minh (1 Chạm) | Phạm Văn Vũ | **Cao** | Modal MemberProfileModal & Danh sách hội viên | ✅ Hoàn thành | **100%** | `POST /api/connect-app/network/connect, POST /api/connect-app/network/disconnect` | ✅ Đã kết nối | **100%** |  |

### MOD-06: Sàn Cơ Hội Giao Thương B2B & Gian Hàng Sản Phẩm

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 24 | **B2B-01** | Sàn đăng tin Cơ hội Giao thương B2B (Chào mua, Chào bán, Đầu tư) | Phạm Văn Vũ | **Cao** | Màn hình Cơ hội B2B (/association/opportunities) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/opportunities, POST /api/connect-app/opportunities` | ✅ Đã kết nối | **100%** |  |
| 25 | **B2B-02** | Popup Đăng tin giao thương & Đính kèm hồ sơ năng lực / hình ảnh | Phạm Văn Vũ | **Trung bình** | Popup Tạo bài viết B2B (/association/opportunities) | ✅ Hoàn thành | **100%** | `POST /api/connect-app/opportunities, POST /api/upload/file` | ✅ Đã kết nối | **100%** |  |
| 26 | **B2B-03** | Gian hàng sản phẩm & Bố cục nút "Đăng sản phẩm" tối ưu | Phạm Văn Vũ | **Cao** | Màn hình Sản phẩm (/association/products) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/products, POST /api/connect-app/products` | ✅ Đã kết nối | **100%** |  |

### MOD-07: Sự Kiện Tràn Viền, Check-in QR & Biểu Quyết Bầu Cử

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 27 | **EVT-01** | Giao diện Sự kiện Full-Image chuẩn điện ảnh (Text nằm trọn trong ảnh) | Phạm Văn Vũ | **Cao** | Màn hình Sự kiện (/association/events & /association/index) | ✅ Hoàn thành | **100%** | `GET /api/events, POST /api/events/:id/register` | ✅ Đã kết nối | **100%** |  |
| 28 | **EVT-02** | Check-in bằng mã QR tại cửa hội trường & Quét mã điểm danh | Phạm Văn Vũ | **Cao** | Popup QR Check-in (/association/card, /history) | ✅ Hoàn thành | **95%** | `POST /api/events/:id/checkin, GET /api/events/:id/attendees` | ✅ Đã kết nối | **95%** |  |
| 29 | **EVT-03** | Biểu quyết & Bầu cử trực tiếp đại hội (Thời gian thực) | Phạm Văn Vũ | **Cao** | Màn hình Biểu quyết (/association/voting) | ✅ Hoàn thành | **100%** | `GET /api/voting/sessions, POST /api/voting/:id/vote, GET /api/voting/:id/results` | ✅ Đã kết nối | **100%** |  |

### MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 247

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 30 | **FEE-01** | Thông báo nhắc nợ hội phí niên khóa & Hóa đơn điện tử trong tin nhắn | Phạm Văn Vũ | **Cao** | Tin nhắn hệ thống Ban Thư Ký (/association/messages) | ✅ Hoàn thành | **100%** | `GET /api/members/me/fee` | ✅ Đã kết nối | **100%** |  |
| 31 | **FEE-02** | Sinh mã VietQR Napas 247 chuẩn quốc gia (Số tiền + Cú pháp tự động) | Phạm Văn Vũ | **Cao** | Popup Thanh toán Hội phí VietQR (/association/card, /profile) | ✅ Hoàn thành | **100%** | `POST /api/members/me/fee/vietqr` | ✅ Đã kết nối | **100%** |  |
| 32 | **FEE-03** | Webhook gạch nợ tự động & Xuất hóa đơn VAT điện tử | Phạm Văn Vũ | **Cao** | Lịch sử thanh toán & Trạng thái hội viên | ⏳ Đang làm | **70%** | `POST /api/webhooks/vietqr/payment, GET /api/members/me/invoices` | ⏳ Đang kết nối | **70%** |  |

### MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Ban Thư Ký

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 33 | **PRF-01** | Quản lý thông tin cá nhân, cập nhật avatar, ảnh bìa & quyền riêng tư | Phạm Văn Vũ | **Cao** | Màn hình Trang cá nhân (/association/profile) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/me, PUT /api/connect-app/me, POST /api/upload/file` | ✅ Đã kết nối | **100%** |  |
| 34 | **NEWS-01** | Thiết kế Bố cục Tin tức Tỷ lệ 50% Ảnh & 50% Nội dung | Phạm Văn Vũ | **Cao** | Màn hình Tin tức Hiệp Hội (/association/news) | ✅ Hoàn thành | **100%** | `GET /api/content/news` | ✅ Đã kết nối | **100%** |  |
| 35 | **PRF-02** | Tính năng Hướng dẫn sử dụng App Doanh nhân (Có ảnh demo & tải Word/PDF) | Phạm Văn Vũ | **Cao** | Modal UserGuideModal (/association/profile) | ✅ Hoàn thành | **100%** | `Tích hợp trực tiếp trên Frontend, liên kết tải file DOCX và PDF` | ✅ Đã kết nối | **100%** |  |
| 36 | **PRF-03** | Tính năng Liên hệ Ban Thư Ký CLB CEO 1983 (Hotline, Zalo OA & Gửi Form) | Phạm Văn Vũ | **Trung bình** | Modal ContactSupportModal (/association/profile) | ✅ Hoàn thành | **100%** | `POST /api/connect-app/support/inquiry` | ✅ Đã kết nối | **100%** |  |
| 37 | **PRF-04** | Bộ chuyển đổi Chế độ giao diện (Sáng / Tối / Tương phản) & 8 Ngôn ngữ | Phạm Văn Vũ | **Cao** | Trang cá nhân & Cài đặt (/association/profile, /settings) | ✅ Hoàn thành | **100%** | `Theme Context & i18n Engine (8 Ngôn ngữ: VI, EN, JA, KO, ZH, FR, DE, ES)` | ✅ Đã kết nối | **100%** |  |

### MOD-10: Tách Biệt Độc Lập Luồng Thông Báo & Landing Page Điện Ảnh

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 38 | **NOTIF-01** | Tách biệt độc lập 100% luồng Thông báo giữa ViOne và Hiệp hội CEO 1983 | Phạm Văn Vũ | **Cao** | Màn hình Thông báo (/association/notifications & /notifications) | ✅ Hoàn thành | **100%** | `GET /api/connect-app/notifications, GET /api/connect-app/member/notifications` | ✅ Đã kết nối | **100%** |  |
| 39 | **LAND-01** | Landing Page Điện Ảnh Siêu Thực 6 Cảnh Cuộn Mượt Mà (Cinematic Scroll Journey) | Phạm Văn Vũ | **Cao** | Trang chủ Landing (/landing/ceo1983/cinematic & /landing?theme=ceo1983-cinematic) | ✅ Hoàn thành | **100%** | `TanStack Router, CSS Parallax, Organic SVG Mask & Caustics Shaders` | ✅ Đã kết nối | **100%** |  |

### MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 40 | **LAND-02** | Popup Đăng ký hội viên mới không bị đóng & Tra cứu 3 trạng thái (Chờ duyệt / Đã duyệt / Cần bổ sung) | Phạm Văn Vũ | **Cao** | Modal Đăng ký (/landing/ceo/v1) | ✅ Hoàn thành | **100%** | `GET/POST /api/connect-app/club-registration/status` | ✅ Đã kết nối | **100%** |  |
| 41 | **ONB-01** | Onboarding tạo tài khoản hội viên mới & Tự động đăng nhập vào App Hiệp hội sau khi CRM duyệt | Phạm Văn Vũ | **Cao** | Modal Kích hoạt tài khoản (/landing/ceo/v1) | ✅ Hoàn thành | **100%** | `POST /api/auth/register, POST /api/auth/login` | ✅ Đã kết nối | **100%** |  |
| 42 | **PRIV-01** | Quét mã QR & Chạm thẻ NFC hiển thị Avatar và các trường theo Cài đặt riêng tư đối tác | Phạm Văn Vũ | **Cao** | Modal Quét QR/NFC (AssociationQrScanModal) | ✅ Hoàn thành | **100%** | `GET /api/business-cards/code/:code` | ✅ Đã kết nối | **100%** |  |
| 43 | **CONN-01** | Popup Nhận yêu cầu kết nối tức thời (Realtime Incoming Connection) hiển thị theo quyền riêng tư | Phạm Văn Vũ | **Cao** | Modal Toàn cục IncomingConnectionModal (/association/*) | ✅ Hoàn thành | **100%** | `Socket.io connection:requested, POST /api/connect-app/connections/:id/accept` | ✅ Đã kết nối | **100%** |  |
| 44 | **SUPP-01** | Danh mục Liên hệ & Hỗ trợ đầy đủ 7 Ban Ngành Chuyên Trách CLB Doanh Nhân CEO 1983 | Phạm Văn Vũ | **Cao** | Modal Liên hệ (ContactSupportModal) | ✅ Hoàn thành | **100%** | `POST /api/connect-app/support/inquiry` | ✅ Đã kết nối | **100%** |  |
| 45 | **GUIDE-01** | Sổ tay Hướng dẫn sử dụng chuẩn hóa: Gỡ bỏ lọc tin nhắn, thêm Quyền riêng tư, Kết nối tức thời & 7 Ban ngành | Phạm Văn Vũ | **Trung bình** | Modal HDSD (UserGuideModal) | ✅ Hoàn thành | **100%** | `Frontend Component UserGuideModal (16 mục hướng dẫn)` | ✅ Đã kết nối | **100%** |  |
| 46 | **QR-01** | Quét mã QR Hội viên phần cứng Native (Google Code Scanner Integration) | Phạm Văn Vũ | **Cao** | Modal Quét QR Hội Viên (AssociationMemberQrModal) | ✅ Hoàn thành | **100%** | `com.google.android.gms:play-services-code-scanner, AndroidNative.scanQr()` | ✅ Đã kết nối | **100%** |  |
| 47 | **QR-02** | Căn giữa tuyệt đối Modal Quét QR & Mã QR Thẻ trên màn hình điện thoại (CSS Grid Safe-Area) | Phạm Văn Vũ | **Cao** | Modal AssociationQrScanModal & AssociationMemberQrModal | ✅ Hoàn thành | **100%** | `CSS Grid place-items-center, 100dvh & env(safe-area-inset)` | ✅ Đã kết nối | **100%** |  |

### MOD-12: Nâng Cấp Toàn Diện 14 Tính Năng & Tinh Chỉnh Trải Nghiệm Doanh Nhân CEO 1983

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 48 | **AUTO-01** | Landing Page Polling 4s tự động nhận diện phê duyệt & Điều hướng đăng nhập | Phạm Văn Vũ | **Cao** | Modal Trạng thái & Kích hoạt (/landing/ceo1983/cinematic) | ✅ Hoàn thành | **100%** | `GET /connect-app/club-registration/status, Polling Interval 4000ms` | ✅ Đã kết nối | **100%** |  |
| 49 | **AUTH-06** | Bắt buộc đăng nhập sau khi duyệt hồ sơ (Prefill username, Không bypass login) | Phạm Văn Vũ | **Cao** | Màn hình Đăng nhập (/association/login) | ✅ Hoàn thành | **100%** | `POST /auth/login` | ✅ Đã kết nối | **100%** |  |
| 50 | **PROF-05** | Đồng bộ dữ liệu Profile thời gian thực giữa Home & Profile (Loại bỏ "Lê Hoàng Long") | Phạm Văn Vũ | **Cao** | Trang chủ (/association) & Trang cá nhân (/association/profile) | ✅ Hoàn thành | **100%** | `GET /connect-app/me, LocalStorage vba.profile` | ✅ Đã kết nối | **100%** |  |
| 51 | **QR-03** | Khung ngắm Camera in-modal & Gỡ bỏ hook native text scanner trên Trang chủ | Phạm Văn Vũ | **Cao** | AssociationMemberQrModal.tsx & MainActivity.java | ✅ Hoàn thành | **100%** | `HTML5 MediaDevices, NativeBridge cleanup` | ✅ Đã kết nối | **100%** |  |
| 52 | **CONN-02** | Handshake kết nối 2 chiều: Tự đóng QR modal người quét & Bật IncomingConnectionModal đối tác | Phạm Văn Vũ | **Cao** | AssociationMemberQrModal & IncomingConnectionModal | ✅ Hoàn thành | **100%** | `Socket.io connection:requested` | ✅ Đã kết nối | **100%** |  |
| 53 | **OPP-02** | Sàn Cơ hội B2B hiển thị ảnh tải lên, tab "Cơ hội của tôi", sort mới nhất & Ngày đăng | Phạm Văn Vũ | **Cao** | Màn hình Cơ hội B2B (/association/opportunities) | ✅ Hoàn thành | **100%** | `GET/POST /opportunities, connect-app.service.ts` | ✅ Đã kết nối | **100%** |  |
| 54 | **PROD-02** | Gian hàng sản phẩm 2 cột chuẩn e-commerce, cách ly bookmark theo User & Tab tôi đăng | Phạm Văn Vũ | **Cao** | Màn hình Sản phẩm (/association/products) | ✅ Hoàn thành | **100%** | `GET /marketplace/products, LocalStorage vba_interested_products_${userId}` | ✅ Đã kết nối | **100%** |  |
| 55 | **EVT-04** | Thẻ sự kiện Poster 2:3 có nhãn độ tuổi (16+, 18+, 13+) & Backdrop sân khấu /events | Phạm Văn Vũ | **Cao** | Trang chủ (/association) & Màn hình Sự kiện (/association/events) | ✅ Hoàn thành | **100%** | `Frontend Component & CSS Styling` | ✅ Đã kết nối | **100%** |  |
| 56 | **HOME-02** | Cấu trúc thứ tự khối Trang chủ chuẩn: Sự kiện -> Cơ hội -> Sản phẩm | Phạm Văn Vũ | **Cao** | Trang chủ (/association) | ✅ Hoàn thành | **100%** | `association.index.tsx layout` | ✅ Đã kết nối | **100%** |  |
| 57 | **NOTIF-02** | Cách ly thông báo theo User, lọc bỏ dữ liệu sự kiện rác cũ & Lời chào mừng chính thức | Phạm Văn Vũ | **Cao** | Hộp thông báo (/association/messages) | ✅ Hoàn thành | **100%** | `connect-app.service.ts getNotifications` | ✅ Đã kết nối | **100%** |  |
| 58 | **MSG-08** | Khử trùng lặp tin nhắn (Deduplication), Socket realtime & Xóa badge unread khi mở thread | Phạm Văn Vũ | **Cao** | Màn hình Chat (/association/messages) | ✅ Hoàn thành | **100%** | `Socket.io member:message_received, mergedMessages deduplication` | ✅ Đã kết nối | **100%** |  |
| 59 | **MSG-09** | Thanh nhập tin nhắn Mobile với nút (+) mở rộng & Popup Cuộc gọi tương tác | Phạm Văn Vũ | **Cao** | Màn hình Chat (/association/messages) | ✅ Hoàn thành | **100%** | `Mobile Chat Input Expander & Call Modal interactive controls` | ✅ Đã kết nối | **100%** |  |
| 60 | **PROF-06** | Đồng bộ Menu cá nhân chuẩn Image 3 & Phím tắt (+) tạo nhanh Danh thiếp số | Phạm Văn Vũ | **Cao** | Trang cá nhân (/association/profile) & /association/business-cards | ✅ Hoàn thành | **100%** | `Navigation & query params action=create` | ✅ Đã kết nối | **100%** |  |
| 61 | **NEWS-02** | Tab kép Tin tức CLB & Sự kiện Hiệp Hội trong /association/news | Phạm Văn Vũ | **Cao** | Màn hình Tin tức (/association/news) | ✅ Hoàn thành | **100%** | `GET /api/content/news, listMyEvents` | ✅ Đã kết nối | **100%** |  |
| 62 | **SEC-02** | Đổi mật khẩu (/users/change-password), khóa nút Đăng xuất & Vô hiệu hóa tài khoản | Phạm Văn Vũ | **Cao** | Màn hình Cài đặt Bảo mật (/association/settings) | ✅ Hoàn thành | **100%** | `POST /users/change-password, POST /users/deactivate` | ✅ Đã kết nối | **100%** |  |
| 63 | **CRM-01** | Phân quyền Sidebar CRM theo vai trò, ẩn "Quyền của tôi" & Sơ đồ rạp chiếu kéo thả ghế sân khấu | Phạm Văn Vũ | **Cao** | Sidebar CRM & CinemaSeatingMap (/events/seating) | ✅ Hoàn thành | **100%** | `Sidebar role-based permission matrix, Pointer drag coordinates` | ✅ Đã kết nối | **100%** |  |

### MOD-13: Hoàn Thiện 8 Hạng Mục Tinh Chỉnh Chuyên Sâu & Sửa Lỗi Nghiệp Vụ (17/09/2026)

| STT | Mã Task | Tên Chức Năng / Task | Người Thực Hiện | Mức Độ | Giao Diện (Màn Hình) | Tình Trạng GD | Hoàn Thiện GD | API Mapped | Tình Trạng API | Hoàn Thiện API | Ghi Chú |
|:---:|---|---|:---:|:---:|---|:---:|:---:|---|:---:|:---:|:---:|
| 64 | **MSG-10** | Loại bỏ chính mình khỏi danh sách chat & bong bóng chat hoạt động | Phạm Văn Vũ | **Cao** | Hộp thư Doanh nhân (/association/messages) | ✅ Hoàn thành | **100%** | `isSelfUser exclusion filter` | ✅ Đã kết nối | **100%** |  |
| 65 | **MSG-11** | Vuốt / Nhấn giữ (Long-press) xóa cuộc trò chuyện & Xóa tin nhắn ở phía tôi | Phạm Văn Vũ | **Cao** | Hộp thư Doanh nhân (/association/messages) | ✅ Hoàn thành | **100%** | `Swipe actions, 450ms long-press, deletedForMeMsgIds` | ✅ Đã kết nối | **100%** |  |
| 66 | **QR-04** | Xử lý triệt để rò rỉ camera khi đóng modal quét QR (Dừng tracks, null srcObject) | Phạm Văn Vũ | **Cao** | AssociationMemberQrModal & use-qr-scanner hook | ✅ Hoàn thành | **100%** | `WebRTC tracks termination, stopped guard` | ✅ Đã kết nối | **100%** |  |
| 67 | **QR-05** | Gỡ bỏ Toast popup dư thừa khi quét QR, định tuyến âm thầm vào chuông thông báo | Phạm Văn Vũ | **Trung bình** | Modal AssociationMemberQrModal | ✅ Hoàn thành | **100%** | `vba_notifications, dispatch notifications-updated` | ✅ Đã kết nối | **100%** |  |
| 68 | **PROF-07** | Khắc phục lệch Profile & Xác thực (Đồng bộ tên "Phạm Văn Vũ", chức danh "Phó Chủ tịch Thường trực") | Phạm Văn Vũ | **Cao** | Trang chủ (/association) & Trang cá nhân (/association/profile) | ✅ Hoàn thành | **100%** | `PostgreSQL users/members sync, connect-app.service.ts` | ✅ Đã kết nối | **100%** |  |
| 69 | **CONN-03** | Bắn thông báo 2 chiều khi đối tác chấp nhận kết nối (Push notification + chuông) | Phạm Văn Vũ | **Cao** | IncomingConnectionModal & MemberShell | ✅ Hoàn thành | **100%** | `Socket connection:accept -> connection:accepted` | ✅ Đã kết nối | **100%** |  |
| 70 | **LAND-01** | Redesign Landing Page CEO 1983 Trắng & Vàng Champagne, sửa dấu tiếng Việt, Polling 4s | Phạm Văn Vũ | **Cao** | Trang Landing CLB CEO 1983 (/landing/ceo1983) | ✅ Hoàn thành | **100%** | `Ceo1983BlueWhiteGoldLanding, club-registration/status` | ✅ Đã kết nối | **100%** |  |
| 71 | **EVT-05** | Redesign Backdrop sân khấu sự kiện Grand Gala 3D (Spotlight cone, hạt bụi vàng kim) | Phạm Văn Vũ | **Cao** | Màn hình Sự kiện (/association/events) | ✅ Hoàn thành | **100%** | `CSS 3D perspective, spotlight cone gradients` | ✅ Đã kết nối | **100%** |  |
| 72 | **GRP-01** | Lọc thành viên tạo nhóm chat chỉ hiển thị người đã kết nối / bạn bè, loại trừ chính mình | Phạm Văn Vũ | **Cao** | Modal CreateGroupChatModal (/association/messages) | ✅ Hoàn thành | **100%** | `isMemberConnected filter, localStorage connected set` | ✅ Đã kết nối | **100%** |  |


