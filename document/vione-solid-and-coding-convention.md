# QUY ƯỚC VIẾT CODE & THIẾT KẾ SOLID DỰ ÁN VIONE

---

## TRANG BÌA

*   **Tên dự án:** Hệ thống Kết nối và Số hóa Doanh nghiệp Vione (Vione Business Connect Ecosystem)
*   **Tên tài liệu:** Quy ước viết code & Thiết kế SOLID dự án Vione (SOLID & Coding Convention Training SoT)
*   **Mã tài liệu:** `VIONE-SOLID-CONV-02`
*   **Phiên bản:** `1.0.0`
*   **Ngày ban hành:** 28/08/2026
*   **Bộ phận biên soạn:** Phòng Nghiệp vụ & Kiến trúc Hệ thống (Senior BA/SA Team)
*   **Trạng thái:** Đã phê duyệt (Approved)
*   **Mức độ bảo mật:** Nội bộ (Internal Confidential)

### Lịch sử Thay đổi Phiên bản

| Phiên bản | Ngày | Tác giả | Trạng thái | Nội dung thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| **0.1.0** | 22/08/2026 | SA Team | Nháp | Soạn thảo quy ước viết code và định nghĩa ranh giới các thư mục. |
| **1.0.0** | 28/08/2026 | BA/SA Lead | Phê duyệt | Hoàn thiện tài liệu, bổ sung ví dụ SOLID thực tế trong dự án Vione. |

---

## MỤC LỤC
1. [Phần 1: Quy định Kiến trúc thư mục dự án (Folder Boundaries)](#phan-1-quy-dinh-kien-truc-thu-muc-du-an-folder-boundaries)
   * 1.1 [Cấu trúc NestJS Backend](#11-cau-truc-nestjs-backend)
   * 1.2 [Cấu trúc React Frontend (TanStack Start)](#12-cau-truc-react-frontend-tanstack-start)
2. [Phần 2: Quy ước viết code (Coding Convention)](#phan-2-quy-uoc-viet-code-coding-convention)
   * 2.1 [Quy định Đặt tên (Naming Rules)](#21-quy-dinh-dat-ten-naming-rules)
   * 2.2 [An toàn kiểu dữ liệu (Type Safety)](#22-an-toan-kieu-du-lieu-type-safety)
   * 2.3 [Xử lý Ngoại lệ (Error Handling Boundary)](#23-xu-ly-ngoai-le-error-handling-boundary)
   * 2.4 [Quản lý Cơ chế Đa ngôn ngữ (i18n Localization)](#24-quan-ly-co-che-da-ngon-ngu-i18n-localization)
3. [Phần 3: Nguyên lý Thiết kế SOLID trong thực tế Vione](#phan-3-nguyen-ly-thiet-ke-solid-trong-thuc-te-vione)
   * 3.1 [S - Single Responsibility Principle (Đơn trách nhiệm)](#31-s---single-responsibility-principle-don-trach-nhiem)
   * 3.2 [O - Open/Closed Principle (Mở rộng/Đóng đổi mới)](#32-o---openclosed-principle-mo-rongdong-doi-moi)
   * 3.3 [L - Liskov Substitution Principle (Thay thế lớp con an toàn)](#33-l---liskov-substitution-principle-thay-the-lop-con-an-toan)
   * 3.4 [I - Interface Segregation Principle (Phân tách Interface)](#34-i---interface-segregation-principle-phan-tach-interface)
   * 3.5 [D - Dependency Inversion Principle (Đảo ngược Phụ thuộc)](#35-d---dependency-inversion-principle-dao-nguoc-phu-thuoc)
4. [Phần 4: Checklist trước khi sẵn sàng cho QA (Ready for QA)](#phan-4-checklist-truoc-khi-san-sang-cho-qa-ready-for-qa)

---

# PHẦN 1: QUY ĐỊNH KIẾN TRÚC THƯ MỤC DỰ ÁN (FOLDER BOUNDARIES)

Để đảm bảo tính độc lập và phân chia rõ ràng các trách nhiệm (Separation of Concerns - SoC), dự án Vione phân định cấu trúc thư mục nghiêm ngặt như sau:

## 1.1 Cấu trúc NestJS Backend (`apps/vione_app_be`)
Mỗi module chức năng (Ví dụ: `connect-app`, `business-card`) phải tuân thủ phân lớp nội bộ:

*   **`*.controller.ts` (Transport Layer):**
    *   *Nhiệm vụ:* Đón nhận HTTP Requests, kiểm tra phân quyền bảo mật cấp API, phân tích dữ liệu đầu vào (DTO) và điều phối công việc cho Service.
    *   *Cấm:* Tuyệt đối không viết logic nghiệp vụ (if/else nghiệp vụ phức tạp) hoặc trực tiếp gọi Database query tại đây.
*   **`*.service.ts` (Application/Domain Layer):**
    *   *Nhiệm vụ:* Thực thi các bước nghiệp vụ, tính toán công thức, đảm bảo các ràng buộc logic của Use Case.
    *   *Cấm:* Không chứa logic giao dịch HTTP, không tự sinh mã HTML/UI gửi về client.
*   **`*.repository.ts` hoặc prisma logic (Infrastructure Layer):**
    *   *Nhiệm vụ:* Tương tác trực tiếp với Database thông qua Prisma Client hoặc Raw SQL. Đọc ghi bản ghi vật lý.

## 1.2 Cấu trúc React Frontend (`apps/vione_app_fe`)
Tận dụng kiến trúc TanStack Start và phân vùng logic:

*   **`src/routes/` (Presentation & Routing Layer):**
    *   *Nhiệm vụ:* Khai báo định tuyến trang, bọc các Auth Gate kiểm tra quyền truy cập nhanh, render Layout chính.
*   **`src/components/` (UI Layer):**
    *   *Nhiệm vụ:* Các Component hiển thị giao diện thuần (SFC). Chỉ nhận dữ liệu từ `props` để render và trả ra sự kiện qua callback (`onAction`).
    *   *Cấm:* Không gọi API trực tiếp trong component con, không viết logic tính toán nghiệp vụ (Ví dụ: công thức tính phí đăng ký sự kiện).
*   **`src/hooks/` (State & Control Layer):**
    *   *Nhiệm vụ:* Quản lý state của UI, kết nối React Query để đồng bộ dữ liệu server, điều phối luồng gọi API Client.
*   **`src/lib/` (Business Rules Client-Side Helper):**
    *   *Nhiệm vụ:* Chứa các hàm validate format đầu vào, format hiển thị ngày tháng/tiền tệ, dịch đa ngôn ngữ.

---

# PHẦN 2: QUY ƯỚC VIẾT CODE (CODING CONVENTION)

## 2.1 Quy định Đặt tên (Naming Rules)
*   **File và Thư mục:** Sử dụng định dạng `kebab-case` cho tên file và thư mục (Ví dụ: `connect-app.service.ts`, `today-item.tsx`).
*   **Class, Interface và Enum:** Sử dụng `PascalCase`. Interface bắt buộc phải mô tả rõ mục đích, không dùng tiền tố `I` vô nghĩa (Ví dụ: `MeetingParticipant` thay vì `IMeetingParticipant`).
*   **Hàm và Biến:** Sử dụng `camelCase` (Ví dụ: `listCommunityEvents`, `scheduledStartAt`).
*   **Constants:** Sử dụng `UPPER_CASE` viết rắn (Ví dụ: `BC_MOBILE_HOME_MAX_TODAY_ITEMS`).

## 2.2 An toàn kiểu dữ liệu (Type Safety)
*   **Cấm dùng `any` vô tội vạ:** Mọi biến, tham số, dữ liệu trả về phải được định nghĩa kiểu cụ thể hoặc dùng `unknown` nếu chưa rõ kiểu ở tầng biên.
*   **Zod validation tại biên:** Mọi dữ liệu đi vào hệ thống (Request Body, Query Parameter) bắt buộc đi qua lớp kiểm tra kiểu của Zod hoặc Class-validator.

## 2.3 Xử lý Ngoại lệ (Error Handling Boundary)
*   **Cấm nuốt lỗi im lặng:** Tuyệt đối không dùng các block `catch (e) {}` mà không ghi log lỗi hoặc ném ra exception tương ứng.
*   **Mã lỗi nghiệp vụ chuẩn hóa:** Khi backend ném ra lỗi nghiệp vụ (Exception), phải trả về đối tượng có cấu trúc chứa `errorCode` rõ ràng thay vì chỉ trả về text thô (Ví dụ: `EVENT_FULL_CAPACITY`, `MEETING_TIME_CONFLICT`).
*   **Frontend Error Boundary:** Sử dụng các component Error Boundary để bọc ngoài màn hình, tránh việc crash một component nhỏ làm trắng toàn bộ màn hình ứng dụng của người dùng.

## 2.4 Quản lý Cơ chế Đa ngôn ngữ (i18n Localization)
*   **Không hardcode tiếng Việt trực tiếp:** Trên giao diện hiển thị, cấm ghi cứng văn bản tiếng Việt. Bắt buộc phải sử dụng mã khóa dịch đa ngôn ngữ qua hàm `t(...)` (Ví dụ: `t('bc.mobile.calendar.title')`).
*   **Tên file ngôn ngữ:** File chứa định nghĩa dịch phải được lưu tập trung trong thư mục locale (`translated_i18n.json`).

---

# PHẦN 3: NGUYÊN LÝ THIẾT KẾ SOLID TRONG THỰC TẾ VIONE

## 3.1 S - Single Responsibility Principle (Đơn trách nhiệm)
*   *Nguyên lý:* Một lớp hay một module chỉ nên có duy nhất một lý do để thay đổi.
*   *Áp dụng trong Vione:*
    *   Hàm `TodayItem.tsx` chỉ làm đúng nhiệm vụ hiển thị giao diện của một dòng danh sách công việc. Nó nhận dữ liệu phẳng đã được map và render giao diện. Nó không tự gọi API để xóa hay cập nhật trạng thái nhiệm vụ.
    *   Mọi logic cập nhật trạng thái sẽ được đưa ra ngoài thông qua callback hoặc gọi thông qua hook quản lý của component cha.

## 3.2 O - Open/Closed Principle (Mở rộng/Đóng đổi mới)
*   *Nguyên lý:* Đối tượng có thể thoải mái mở rộng hành vi nhưng hạn chế sửa đổi cấu trúc cốt lõi bên trong.
*   *Áp dụng trong Vione:*
    *   Khi hiển thị các loại danh mục công việc khác nhau trong thẻ "Hôm nay" (Today), thay vì viết một loạt các câu lệnh `if/else` phân nhánh phức tạp để hiển thị icon và tiêu đề theo từng loại `itemKind` mới xuất hiện:
    *   Hệ thống thiết kế một Registry cấu hình tĩnh `WORK_HUB_KIND_REGISTRY` chứa mô tả đầy đủ của các kind. Khi thêm loại công việc mới, dev chỉ cần khai báo thêm một cấu hình descriptor mới vào Registry này mà không cần động vào logic hiển thị của component `TodayItem.tsx`.

## 3.3 L - Liskov Substitution Principle (Thay thế lớp con an toàn)
*   *Nguyên lý:* Các lớp con phải có khả năng thay thế lớp cha mà không làm thay đổi tính đúng đắn của chương trình.
*   *Áp dụng trong Vione:*
    *   Trong các bài viết Unit Test, hệ thống xây dựng một Mock Repository (lưu tạm dữ liệu trên RAM) để giả lập Database thực tế.
    *   Cả Database Repository thật và Mock Repository đều phải tuân thủ và hiện thực chung một Interface dữ liệu. Mọi thay đổi trong Mock Repository không được ném ra các exception bất ngờ mà Database Repository thật không có, đảm bảo kết quả kiểm thử chính xác.

## 3.4 I - Interface Segregation Principle (Phân tách Interface)
*   *Nguyên lý:* Nên phân tách các interface lớn thành nhiều interface nhỏ, tập trung đúng nhiệm vụ, để client không phải phụ thuộc vào các method không sử dụng.
*   *Áp dụng trong Vione:*
    *   Thay vì tạo ra một interface cấu hình dữ liệu khổng lồ chứa chung các thuộc tính của cả Sự kiện (Event) và Cuộc gặp (Meeting).
    *   Hệ thống tách biệt rõ ràng thành hai interface: `MeetingWorkspaceItemLike` (chứa các thuộc tính liên quan đến cuộc gặp gỡ cá nhân 1-on-1) và các schema dữ liệu sự kiện riêng biệt. Giao diện frontend chỉ bind đúng các trường thông số cần dùng.

## 3.5 D - Dependency Inversion Principle (Đảo ngược Phụ thuộc)
*   *Nguyên lý:* Module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào sự trừu tượng (abstraction).
*   *Áp dụng trong Vione:*
    *   NestJS Backend Service không được import trực tiếp Prisma client ở tầng sâu để viết logic query DB trực tiếp trong hàm nghiệp vụ.
    *   Thay vào đó, NestJS Service phụ thuộc vào một Abstraction (Interface của Repository). Lớp Infrastructure Repository thực tế sẽ implements interface này và được inject vào Service thông qua cơ chế Dependency Injection (DI) của NestJS. Điều này giúp dễ dàng thay đổi thư viện truy vấn DB (hoặc mock data để viết Unit test) mà không cần viết lại logic nghiệp vụ.

---

# PHẦN 4: CHECKLIST TRƯỚC KHI SẴN SÀNG CHO QA (READY FOR QA)

Mỗi nhà phát triển (Dev) hoặc Sub-agent trước khi bàn giao một tính năng kỹ thuật để kiểm thử (QA) bắt buộc phải điền đầy đủ bảng bằng chứng dưới đây vào PR hoặc báo cáo bàn giao:

```markdown
## solid_convention_ack
- [ ] Đã đọc và tuân thủ đặc tả tại `vione-solid-and-coding-convention.md`
- [ ] Toàn bộ logic nghiệp vụ (Business Rules) nằm ở tầng Service/Lib (Không viết trong file giao diện UI hoặc Controller)
- [ ] Mọi file sửa đổi hoặc tạo mới đều được cập nhật block chú thích `@CODE-MEMORY` ở đầu file.
- [ ] Không có file logic nào vượt quá giới hạn 300 dòng code (Nếu có phải giải trình lý do chính đáng).
- [ ] Đã khai báo các Interface trừu tượng (Port) đầy đủ để hỗ trợ viết Unit Test.
- [ ] Các hàm không dùng hoặc code cũ dư thừa đã được dọn sạch, không để dead code.
- [ ] Đặt tên biến, hàm, file đồng nhất theo quy ước camelCase / PascalCase / kebab-case.

### Ranh giới phân tách FE - BE (FE-BE Separation Boundary)
- [ ] fe_boundary: Giao diện UI chỉ làm nhiệm vụ hiển thị và validate định dạng đầu vào (Zod). Không tự tính toán công thức nghiệp vụ, không tự join nhiều response từ các API khác nhau.
- [ ] be_boundary: Backend quản lý toàn bộ logic nghiệp vụ, ghi nhận database và xử lý phân quyền. Trả về dữ liệu dạng **display-ready** (frontend chỉ việc bind trực tiếp vào view, không cần xử lý định dạng thêm).
- [ ] display_ready_ack: Đã liệt kê chi tiết các trường hiển thị của giao diện được lấy từ đường dẫn dữ liệu nào của API response (Không để FE tự suy luận tính toán).
```
