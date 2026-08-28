# NGUYÊN TẮC & KỸ NĂNG THIẾT KẾ SA/BA DỰ ÁN VIONE

---

## TRANG BÌA

*   **Tên dự án:** Hệ thống Kết nối và Số hóa Doanh nghiệp Vione (Vione Business Connect Ecosystem)
*   **Tên tài liệu:** Nguyên tắc & Kỹ năng thiết kế SA/BA dự án Vione (SA & BA Rules & Skills Guidelines)
*   **Mã tài liệu:** `VIONE-SA-BA-03`
*   **Phiên bản:** `1.0.0`
*   **Ngày ban hành:** 28/08/2026
*   **Bộ phận biên soạn:** Phòng Nghiệp vụ & Kiến trúc Hệ thống (Senior BA/SA Team)
*   **Trạng thái:** Đã phê duyệt (Approved)
*   **Mức độ bảo mật:** Nội bộ (Internal Confidential)

### Lịch sử Thay đổi Phiên bản

| Phiên bản | Ngày | Tác giả | Trạng thái | Nội dung thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| **0.1.0** | 24/08/2026 | BA/SA Team | Nháp | Định hình vai trò BA/SA và phương pháp ánh xạ truy vết code. |
| **1.0.0** | 28/08/2026 | BA/SA Lead | Phê duyệt | Bổ sung quy định quản lý transaction, phân trang cursor, và checklist bàn giao. |

---

## MỤC LỤC
1. [Phần 1: Phân định Ranh giới Trách nhiệm (BA vs SA Boundary)](#phan-1-phan-dinh-ranh-gioi-trach-nhiem-ba-vs-sa-boundary)
   * 1.1 [Bảng so sánh vai trò và nhiệm vụ](#11-bang-so-sanh-vai-tro-va-nhiem-vu)
   * 1.2 [Các hành vi cấm kỵ (Anti-patterns)](#12-cac-hanh-vi-cam-ky-anti-patterns)
2. [Phần 2: Phương pháp Truy vết (Traceability Method & Code Annotation)](#phan-2-phuong-phap-truy-vet-traceability-method-and-code-annotation)
   * 2.1 [Chuỗi khóa ánh xạ liên tục](#21-chuoi-khoa-anh-xa-lien-tuc)
   * 2.2 [Cấu trúc chú thích @CODE-MEMORY trong mã nguồn](#22-cau-truc-cho-thich-code-memory-trong-ma-nguon)
3. [Phần 3: Tiêu chuẩn Thiết kế Hệ thống (Design Standards)](#phan-3-tieu-chuan-thiet-ke-he-thong-design-standards)
   * 3.1 [Quản lý Giao dịch Cơ sở Dữ liệu (Database Transactions)](#31-quan-ly-giao-dich-co-so-du-lieu-database-transactions)
   * 3.2 [Quy chuẩn Phân trang Danh sách (Cursor-based Pagination)](#32-quy-chuan-phan-trang-danh-sach-cursor-based-pagination)
   * 3.3 [Tiêu chuẩn Mã lỗi nghiệp vụ thống nhất (Error Codes Standard)](#33-tieu-chuan-ma-loi-nghiep-vu-thong-nhat-error-codes-standard)
4. [Phần 4: Các cổng Kiểm soát Chất lượng & Checklist bàn giao (Reject Gates)](#phan-4-cac-cong-kiem-soat-chat-luong-and-checklist-ban-giao-reject-gates)

---

# PHẦN 1: PHÂN ĐỊNH RANH GIỚI TRÁCH NHIỆM (BA VS SA BOUNDARY)

Để tối ưu hóa chất lượng bàn giao và tránh chồng chéo công việc, ranh giới trách nhiệm giữa BA và SA trong dự án Vione được quy định rõ:

## 1.1 Bảng so sánh vai trò và nhiệm vụ

| Tiêu chí | Business Analyst (BA) | Solution Architect (SA) |
| :--- | :--- | :--- |
| **Trọng tâm** | Nghiệp vụ ứng dụng (Business Domain) | Kiến trúc hệ thống và Kỹ thuật (System Architecture) |
| **Câu hỏi cốt lõi** | Hệ thống cần giải quyết nghiệp vụ **GÌ** để thỏa mãn người dùng? | Hệ thống triển khai thế **NÀO** để chạy mượt, an toàn, ổn định? |
| **Đầu ra (Output)** | Tài liệu đặc tả yêu cầu SRS (Use Case, Business Rules, Flow tiếng Việt). | Tài liệu thiết kế kỹ thuật TechSpec (DB Schema, API Contract, Class Diagram). |
| **Giao tiếp chính** | Người dùng, Khách hàng, Sponsor, Product Owner. | Dev-BE, Dev-FE, QA/QC, DevOps. |

## 1.2 Các hành vi cấm kỵ (Anti-patterns)
*   **BA can thiệp sâu kỹ thuật:** BA tự ý thiết kế cấu trúc JSON của API, hoặc yêu cầu cụ thể "khi bấm nút hệ thống phải gọi tuần tự 3 API `/api/v1/...`". Đây là việc thiết kế của SA. BA chỉ được mô tả luồng logic nghiệp vụ.
*   **SA bỏ qua nghiệp vụ hoặc đẩy logic cho FE:** SA thiết kế API thô sơ, bắt FE tự tính toán công thức hoặc tự join dữ liệu. Điều này vi phạm nghiêm trọng tính đóng gói của Backend và tạo ra rủi ro sai lệch dữ liệu.

---

# PHẦN 2: PHƯƠNG PHÁP TRUY VẾT (TRACEABILITY METHOD & CODE ANNOTATION)

Mục đích tối cao của truy vết là giúp bất kỳ thành viên nào (hoặc các AI sub-agent) khi đọc code đều hiểu được dòng code đó phục vụ Use Case và luật nghiệp vụ nào.

## 2.1 Chuỗi khóa ánh xạ liên tục
Mọi thiết kế phải bám sát chuỗi khóa liên kết:
`SRS (UC-...) ──► TechSpec (API/DB Schema ref_srs) ──► Code (@CODE-MEMORY)`

*   BA bắt buộc phải đánh mã định danh duy nhất cho từng Use Case (Ví dụ: `UC-BC-01`) và từng luật nghiệp vụ (Ví dụ: `BR-BC-01`).
*   SA bắt buộc phải gắn thẻ `ref_srs: UC-BC-01` vào phần mô tả của các API endpoint hoặc sơ đồ bảng cơ sở dữ liệu tương ứng trong tài liệu TechSpec.
*   Dev bắt buộc phải ghi chú mã Use Case vào đầu file code thực thi tính năng đó.

## 2.2 Cấu trúc chú thích `@CODE-MEMORY` trong mã nguồn
Mọi file mã nguồn chứa logic nghiệp vụ cốt lõi bắt buộc phải có khối chú thích định dạng chuẩn ở đầu file:

```typescript
// @CODE-MEMORY
// UseCase: UC-BC-01 (Đề xuất & Xác nhận Lịch hẹn 1-on-1)
// BusinessRule: BR-BC-01 (Thời lượng cuộc hẹn từ 15 phút đến 8 giờ), BR-BC-02 (Quy tắc chấp nhận)
// TechSpecRef: API_DESIGN  (POST /meetings/propose)
// Author: Senior BA/SA Team
// Updated: 2026-08-28
```

---

# PHẦN 3: TIÊU CHUẨN THIẾT KẾ HỆ THỐNG (DESIGN STANDARDS)

## 3.1 Quản lý Giao dịch Cơ sở Dữ liệu (Database Transactions)
*   Mọi thao tác ghi dữ liệu (Write operations) tác động đến nhiều bảng cơ sở dữ liệu có quan hệ phụ thuộc bắt buộc phải được bọc trong một **Database Transaction** (Sử dụng `$transaction` của Prisma).
*   *Ví dụ:* Khi tạo đề xuất cuộc hẹn, việc chèn bản ghi vào bảng `business_meetings` và bảng `business_meeting_proposals` phải nằm trong cùng một giao dịch. Nếu một trong hai thao tác lỗi, toàn bộ giao dịch phải được rollback để tránh sinh ra dữ liệu mồ côi (orphan records).

## 3.2 Quy chuẩn Phân trang Danh sách (Cursor-based Pagination)
*   Để tối ưu hóa hiệu năng truy vấn cho ứng dụng di động di chuyển trên hạ tầng mạng yếu, các API lấy danh sách (List APIs - ví dụ: danh sách cuộc hẹn, lịch sử hoạt động) bắt buộc sử dụng cơ chế phân trang **Cursor-based Pagination** thay vì Offset-based (`LIMIT/OFFSET`).
*   Cursor phải được mã hóa dạng base64 chứa các thông số định danh duy nhất (id, thời gian tạo, độ ưu tiên) nhằm đảo bảo dữ liệu tải mượt mà, không bị trùng lặp khi có dữ liệu mới chèn vào đầu trang.

## 3.3 Tiêu chuẩn Mã lỗi nghiệp vụ thống nhất (Error Codes Standard)
*   Hệ thống không sử dụng các chuỗi text thông báo lỗi tự do từ Database ném thẳng lên Client.
*   Mọi lỗi nghiệp vụ (Exception) phải được định nghĩa bằng các mã lỗi dạng UPPER_CASE cụ thể và lưu trữ trong Enum dùng chung.
*   *Bảng mã lỗi nghiệp vụ cốt lõi:*

| Mã lỗi | HTTP Status | Mô tả chi tiết |
| :--- | :--- | :--- |
| `MEETING_TIME_CONFLICT` | 409 Conflict | Khung giờ cuộc họp đề xuất bị trùng lặp với lịch hẹn đã chốt của đối tác. |
| `MEETING_PROPOSAL_EXPIRED` | 400 Bad Request | Lời đề xuất cuộc gặp đã quá thời gian chấp nhận (thời điểm hẹn nằm trong quá khứ). |
| `EVENT_FULL_CAPACITY` | 403 Forbidden | Sự kiện cộng đồng đã nhận đủ số lượng đăng ký tối đa, không thể nhận thêm ghế. |
| `EVENT_ALREADY_REGISTERED` | 409 Conflict | Thành viên đã đăng ký tham gia sự kiện này trước đó, không được gửi trùng lặp. |
| `DEVICE_SESSION_REVOKED` | 401 Unauthorized | Phiên thiết bị di động đã bị thu hồi quyền truy cập từ xa, bắt buộc logout. |

---

# PHẦN 4: CÁC CỔNG KIỂM SOÁT CHẤT LƯỢNG & CHECKLIST BÀN GIAO (REJECT GATES)

Tài liệu thiết kế hoặc yêu cầu sẽ bị bộ phận kỹ thuật / QA từ chối nghiệm thu chuyển tiếp (Reject) nếu phát hiện các lỗi nghiêm trọng sau:

| Mã Reject | Vi phạm tiêu chuẩn | Mức độ | Biện pháp khắc phục |
| :--- | :--- | :--- | :--- |
| **R-BA-01** | Use Case mô tả hời hợt, không định nghĩa rõ các nhánh Exception nghiệp vụ sâu (thiếu xử lý lỗi). | **NO-GO** | BA phải bổ sung tối thiểu 30% kịch bản xử lý lỗi nghiệp vụ sâu vào Use Case. |
| **R-SA-01** | Thiết kế API ném thực thể database thô (raw entity dump) và ép Frontend tự tính toán logic/join dữ liệu. | **NO-GO** | SA thiết kế lại API response định dạng display-ready (View model chuẩn hóa). |
| **R-SA-02** | TechSpec thiếu mã liên kết `ref_srs` trỏ về tài liệu nghiệp vụ của BA. | **P0 Residual** | SA kiểm tra và điền bổ sung đầy đủ mã tham chiếu `ref_srs` vào các bảng và API contract. |

### Checklist Bàn giao Nghiệp vụ & Thiết kế (SA/BA Handoff Checklist)
Trước khi bàn giao bất kỳ task phát triển nào cho Dev, SA và BA phải tự xác nhận bảng kiểm tra dưới đây:

```markdown
## sa_ba_handoff_ack
### Business Analyst (BA)
- [ ] SRS đã phân rã đầy đủ các Functional Requirement và đánh mã định danh UC/BR.
- [ ] Mục "Kết quả trả về khi thành công" đã được ghi nhận chi tiết bằng ngôn ngữ nghiệp vụ.
- [ ] Luồng Alternate và Exception nghiệp vụ đã được mô tả kỹ càng, không chỉ vẽ luồng chính Happy Path.

### Solution Architect (SA)
- [ ] Sơ đồ Database ERD và bảng catalog đã cập nhật khớp các kiểu dữ liệu thực tế.
- [ ] API Contract đã được định nghĩa display-ready, có đầy đủ query params và status codes.
- [ ] Mọi thành phần thiết kế trong TechSpec đều có chú thích mã `ref_srs` tương ứng.
```
