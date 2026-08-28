# ĐẶC TẢ GIAO DIỆN & BẢN ĐỒ LIÊN KẾT FE-BE DỰ ÁN VIONE

---

## TRANG BÌA

*   **Tên dự án:** Hệ thống Kết nối và Số hóa Doanh nghiệp Vione (Vione Business Connect Ecosystem)
*   **Tên tài liệu:** Đặc tả giao diện & Bản đồ liên kết FE-BE dự án Vione (UI/UX Spec & FE-BE Binding Standard)
*   **Mã tài liệu:** `VIONE-UIUX-BIND-04`
*   **Phiên bản:** `1.0.0`
*   **Ngày ban hành:** 28/08/2026
*   **Bộ phận biên soạn:** Phòng Nghiệp vụ & Kiến trúc Hệ thống (Senior BA/SA Team)
*   **Trạng thái:** Đã phê duyệt (Approved)
*   **Mức độ bảo mật:** Nội bộ (Internal Confidential)

### Lịch sử Thay đổi Phiên bản

| Phiên bản | Ngày | Tác giả | Trạng thái | Nội dung thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| **0.1.0** | 25/08/2026 | BA Team | Nháp | Khởi thảo các quy tắc mô tả UI/UX và ranh giới validation. |
| **1.0.0** | 28/08/2026 | BA/SA Lead | Phê duyệt | Hoàn thiện tài liệu, xây dựng bản đồ mapping API chi tiết và nguyên tắc DRY UI. |

---

## MỤC LỤC
1. [Phần 1: Tiêu chuẩn BA Mô tả UI/UX trên SRS](#phan-1-tieu-chuan-ba-mo-ta-uiux-tren-srs)
   * 1.1 [Các quy chuẩn bắt buộc cho cấu phần giao diện](#11-cac-quy-chuan-bat-buoc-cho-cau-phan-giao-dien)
2. [Phần 2: Bản đồ Liên kết (Binding Map): Form/Nút bấm ↔ API](#phan-2-ban-do-lien-ket-binding-map-formnut-bam--api)
   * 2.1 [Bảng ánh xạ liên kết chi tiết](#21-bang-anh-xa-lien-ket-chi-tiet)
3. [Phần 3: Quyền tự chủ Tối ưu UX (UX Refactoring Autonomy)](#phan-3-quyen-tu-chu-toi-uu-ux-ux-refactoring-autonomy)
   * 3.1 [Quy tắc mở rộng và căn chỉnh lưới (Grid layout)](#31-quyen-tu-chu-cua-dev-fe-va-agent)
4. [Phần 4: Phân định ranh giới Validation (FE vs BE vs Cả hai)](#phan-4-phan-dinh-ranh-gioi-validation-fe-vs-be-vs-ca-hai)
   * 4.1 [Bảng phân định trách nhiệm validation](#41-bang-phan-dinh-trach-nhiem-validation)
5. [Phần 5: Kỷ luật SOLID & Chống trùng lặp giao diện (DRY UI Components)](#phan-5-ky-luat-solid-and-chong-trung-lap-giao-dien-dry-ui-components)

---

# PHẦN 1: TIÊU CHUẨN BA MÔ TẢ UI/UX TRÊN SRS

BA không cần vẽ các mockup chi tiết đến từng pixel, nhưng để hỗ trợ các nhà phát triển (Dev-FE) và các AI sub-agent code chính xác giao diện, BA **bắt buộc** phải mô tả chi tiết trạng thái hoạt động và nguồn dữ liệu của các cấu phần UI:

## 1.1 Các quy chuẩn bắt buộc cho cấu phần giao diện

| Thành phần UI | Mô tả sơ sài (Bị Reject) | Mô tả Chuẩn mực (Chấp nhận) |
| :--- | :--- | :--- |
| **Select / Dropdown** | "Người dùng chọn Hiệp hội." | "Dropdown 'Hiệp hội': Load danh sách hiệp hội mà user đang tham gia thông qua API `GET /connect-app/my-communities`. Mặc định chọn hiệp hội mặc định (`isDefault`). Hỗ trợ gõ để tìm kiếm (searchable)." |
| **Bảng danh sách (Table)** | "Hiển thị lịch sử hoạt động." | "Bảng lịch sử hoạt động gồm 4 cột: Ngày tương tác, Loại thiết bị, IP, Vị trí. Sử dụng cơ chế kéo để tải thêm (infinite scroll / cursor pagination). Click dòng mở Modal chi tiết phiên đăng nhập." |
| **Nút hành động (Button)** | "Nút Lưu." | "Nút 'Lưu đề xuất': Trạng thái bình thường hiển thị màu gold vàng. Bị mờ (disabled) nếu các trường thông tin bắt buộc chưa điền hợp lệ. Click gọi API `POST /meetings/propose`." |

---

# PHẦN 2: BẢN ĐỒ LIÊN KẾT (BINDING MAP): FORM/NÚT BẤM ↔ API

Để loại bỏ hoàn toàn việc Dev-FE hoặc AI Agent tự suy diễn endpoint gây lỗi kết nối hệ thống, mọi hành động trên UI của Vione phải tuân thủ bản đồ ánh xạ API dưới đây:

## 2.1 Bảng ánh xạ liên kết chi tiết

### 2.1.1 Khu vực: Trang chủ di động (Briefing Dashboard)
*   **Sự kiện Trigger:** Mount màn hình (Mở ứng dụng).
*   **REST API Endpoint:** `GET /connect-app/briefing`
*   **Dữ liệu binding hiển thị:**
    *   Hòm thư công việc (Work Hub) -> lấy từ `meetingWorkspaceItems`.
    *   Số lượng thông báo chưa đọc -> lấy từ `unreadNotificationCount`.
*   **Trạng thái xử lý (On Success):** Render danh sách dạng thẻ phẳng theo thứ tự ưu tiên thời gian. Hiện badge đỏ ở icon quả chuông thông báo nếu count > 0.

### 2.1.2 Khu vực: Màn hình chi tiết sự kiện cộng đồng (Event Details Modal)
*   **Nút Trigger hành động:** "Đăng ký tham gia"
*   **REST API Endpoint:** `POST /connect-app/community/register-event`
*   **Payload gửi đi:**
    ```json
    {
      "eventId": "event.id",
      "memberCode": "current_user.member_code"
    }
    ```
*   **Trạng thái xử lý (On Success):** Đóng modal đăng ký, thay đổi nhãn nút thành "Đã đăng ký" (màu xanh lá), hiện Toast thông báo "Đăng ký thành công ghế số...". Invalidate cache trang chủ để cập nhật sự kiện vào lịch trình hoạt động.

### 2.1.3 Khu vực: Popup Đề xuất cuộc họp 1-on-1 (Propose Meeting Modal)
*   **Nút Trigger hành động:** "Gửi đề xuất"
*   **REST API Endpoint:** `POST /connect-app/meetings/propose`
*   **Payload gửi đi:**
    ```json
    {
      "title": "form.title",
      "description": "form.description",
      "targetUserId": "partner.userId",
      "timezone": "local_timezone",
      "proposals": [
        { "startAt": "date_1", "endAt": "date_2" }
      ]
    }
    ```
*   **Trạng thái xử lý (On Success):** Đóng form, hiển thị thông báo gửi đề xuất thành công, chuyển hướng người dùng về hòm thư cuộc họp.

### 2.1.4 Khu vực: Danh sách thiết bị (Active Sessions List)
*   **Nút Trigger hành động:** "Đăng xuất từ xa" (icon Logout cạnh dòng thiết bị).
*   **REST API Endpoint:** `POST /connect-app/devices/revoke/:sessionId`
*   **Trạng thái xử lý (On Success):** Loại bỏ thiết bị vừa bị xóa ra khỏi danh sách hiển thị trên UI ngay lập tức với hiệu ứng mờ dần.

---

# PHẦN 3: QUYỀN TỰ CHỦ TỐI ƯU UX (UX REFACTORING AUTONOMY)

Dev-FE và các AI Agent có quyền tự ý thay đổi và tái cấu trúc bố cục giao diện của các component cũ để tối ưu hóa trải nghiệm người dùng (UX) mà không cần chờ chỉ thị từ BA/PM, miễn là giữ nguyên logic nghiệp vụ:

*   **Quy tắc mở rộng Modal/Popup:** Nếu một form nhập liệu có trên 8 trường thông tin (Ví dụ: Form tạo thông tin danh thiếp số hóa) đang bị nhét trong modal nhỏ chật hẹp phải cuộn nhiều:
    1.  Chủ động tăng kích thước modal từ mặc định lên tối thiểu `max-w-3xl` hoặc sử dụng full-screen sheet trên thiết bị di động.
    2.  Tự động chia lưới nhập liệu từ 1 cột dọc thành dạng 2 cột song song đối xứng.
    3.  Thêm các thanh phân vùng (Divider) và tiêu đề nhóm (Section Header) để phân định rõ ràng các khối thông tin (Ví dụ: Thông tin liên hệ, Thông tin doanh nghiệp).

---

# PHẦN 4: PHÂN ĐỊNH RANH GIỚI VALIDATION (FE VS BE VS CẢ HAI)

Để tối ưu hóa hiệu năng, giảm tải server và đảm bảo tính toàn vẹn bảo mật hệ thống, ranh giới kiểm tra dữ liệu (Validation) được phân định rõ:

## 4.1 Bảng phân định trách nhiệm validation

| Loại Validation | Vai trò xử lý | Cách thức hiện thực thực tế |
| :--- | :--- | :--- |
| **UX Phản hồi sớm (UX Fast Feedback)** | **Chỉ FE làm** | Kiểm tra trường bắt buộc nhập (Required), kiểm tra định dạng email, độ dài chuỗi tối thiểu/tối đa. FE sử dụng Zod schema bọc form. Disable nút Submit nếu form không hợp lệ. |
| **Logic Nghiệp vụ Đơn giản (Simple Business Logic)** | **CẢ FE VÀ BE** | Ví dụ: Thời gian kết thúc cuộc họp phải lớn hơn thời gian bắt đầu. FE kiểm tra để hiển thị cảnh báo đỏ trực tiếp trên ô chọn giờ. BE **bắt buộc** phải validate lại ở Controller trước khi chuyển dữ liệu vào Service. |
| **Logic Nghiệp vụ Sâu (Deep Business Logic)** | **Chỉ BE làm** | Ví dụ: Check xem phòng họp có bị trùng lịch không, tài khoản của user có đủ quyền duyệt đăng ký sự kiện không, sự kiện đã hết chỗ chưa. FE chỉ gọi API gửi đi và đợi backend trả về mã lỗi để hiển thị Toast thông báo. |

---

# PHẦN 5: KỶ LUẬT SOLID & CHỐNG TRÙNG LẶP GIAO DIỆN (DRY UI COMPONENTS)

Để tránh tình trạng duplicate code (một tính năng hiển thị bị viết thành nhiều file giao diện tương đương nhưng đặt tên khác nhau):

*   **Nguyên tắc DRY UI:** Trước khi code bất kỳ cấu phần giao diện nào (Ví dụ: Card hiển thị thông tin danh thiếp của thành viên), Dev và Agent bắt buộc phải thực hiện tìm kiếm trong thư mục `@/components/` và `@/features/`.
*   **Ví dụ thực thi:**
    *   Thẻ hiển thị thông tin danh thiếp đối tác xuất hiện ở 3 màn hình: Trang chủ di động, Bộ sưu tập thẻ, và Danh bạ hiệp hội.
    *   **Cấm:** Tạo ra 3 file `HomeCard.tsx`, `SavedCard.tsx`, `CommunityCard.tsx`.
    *   **Bắt buộc:** Tạo một component dùng chung duy nhất: `@/components/business-connect/mobile/MemberCard.tsx`. Component này nhận thông tin hiển thị thông qua `props` dữ liệu phẳng. Khi các màn hình khác cần hiển thị chỉ việc import component này vào sử dụng.
*   **Reject Gate:** Nếu phát hiện mã nguồn tạo ra một file giao diện mới trùng lặp tới 80% tính năng hiển thị với component đã có sẵn, PR đó sẽ bị **từ chối (Reject)** bắt buộc refactor.
