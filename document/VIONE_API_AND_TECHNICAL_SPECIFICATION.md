# TÀI LIỆU THIẾT KẾ KỸ THUẬT & DANH MỤC API CHUẨN MỰC
## VIONE ECOSYSTEM — TECHNICAL ARCHITECTURE & API CONTRACT SPECIFICATION
*Tài liệu Đặc tả Kiến trúc Phần mềm & Hợp đồng API (API Contracts) Dành cho Đội ngũ Backend, Frontend, Mobile Dev và QA*

---

## 📌 MỤC LỤC

1. [KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (SYSTEM ARCHITECTURE)](#1-kiến-trúc-hệ-thống--công-nghệ)
   - 1.1. Cấu trúc Monorepo & Phân ranh trách nhiệm
   - 1.2. Hạ tầng Dịch vụ & Cơ chế Multi-Tenant
   - 1.3. Cơ chế Bảo mật & Quy chuẩn Headers
2. [DANH MỤC API CHI TIẾT THEO PHÂN HỆ (API CATALOG)](#2-danh-mục-api-chi-tiết-theo-phân-hệ)
   - 2.1. Phân hệ Xác thực & Quản lý Phiên (Auth & Mobile Login)
   - 2.2. Phân hệ Quản lý Hội viên & Thẩm định (Members & Applications)
   - 2.3. Phân hệ Sự kiện, Khán phòng & Điểm danh QR (Events & Check-in)
   - 2.4. Phân hệ Tài chính, Niên liễm & Cổng VietQR (Fees, Invoices & Webhooks)
   - 2.5. Phân hệ Quyền lợi & Đặc quyền Đối tác (Benefits & Perks)
   - 2.6. Phân hệ Sàn Giao thương B2B (Marketplace & Quotes)
   - 2.7. Phân hệ Mạng xã hội Doanh nhân (B2B Moments & Feed)
   - 2.8. Phân hệ Kết nối & Nhắn tin Realtime (Connections & Direct Messages)
   - 2.9. Phân hệ Điều phối Cuộc hẹn B2B (Business Meetings 1-on-1)
   - 2.10. Phân hệ Danh tính số & Thẻ Thông minh NFC (Smart Cards & NFC)
3. [MÔ HÌNH DỮ LIỆU & RÀNG BUỘC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & CONSTRAINTS)](#3-mô-hình-dữ-liệu--ràng-buộc-cơ-sở-dữ-liệu)
4. [HỆ THỐNG WEBSOCKET & TỰ ĐỘNG HÓA NOTIFICATION](#4-hệ-thống-websocket--tự-động-hóa-notification)
5. [QUY TRÌNH BIÊN DỊCH & TRIỂN KHAI (BUILD & DEPLOYMENT)](#5-quy-trình-biên-dịch--triển-khai)

---

# 1. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

## 1.1. Cấu trúc Monorepo & Phân ranh trách nhiệm
Dự án được tổ chức theo kiến trúc Monorepo chuẩn mực với Yarn Workspaces:
```
vione_app/
├── apps/
│   ├── vione_app_fe/        # Frontend: TanStack Start / React 19 / Vite / TailwindCSS / Nitro SSR
│   ├── vione_app_be/        # Backend: NestJS / Prisma ORM / WebSockets / Passport JWT
│   └── mobile/              # Mobile Native Wrapper: Capacitor 8 (Android & iOS)
├── packages/
│   ├── db/                  # Prisma Schema, Database Migrations, Seeders
│   └── shared/              # Shared TypeScript Types, DTOs, Enums, Locales (8 languages)
└── document/                # Tài liệu phân tích nghiệp vụ, tài liệu kỹ thuật, Excel matrices
```

## 1.2. Hạ tầng Dịch vụ & Cơ chế Multi-Tenant
- **Database Engine**: PostgreSQL 16+ với các phần mở rộng `uuid-ossp`, `pgcrypto`.
- **Cache & Message Broker**: Redis 7.2 (Quản lý phiên, giới hạn tần suất gọi API `sync_rate_limits`, Pub/Sub Realtime).
- **Cơ chế Đa Hiệp hội (Multi-Tenant)**: Mọi bảng dữ liệu nghiệp vụ (`members`, `events`, `invoices`, `products`, `connections`) đều bắt buộc chứa cột `association_id UUID NOT NULL` với chính sách Row Level Security (RLS) bảo đảm cô lập dữ liệu tuyệt đối giữa các tổ chức.

## 1.3. Cơ chế Bảo mật & Quy chuẩn Headers
Mọi request gửi tới Backend (ngoại trừ các endpoint công khai như Landing, xem thông tin thẻ công khai) bắt buộc phải truyền header:
```http
Content-Type: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>
x-association-id: <ASSOCIATION_UUID>
```

Mã phản hồi chuẩn RESTful:
- `200 OK`: Truy vấn hoặc xử lý thành công.
- `201 Created`: Tạo mới bản ghi thành công.
- `400 Bad Request`: Payload không hợp lệ hoặc vi phạm kiểm tra tính hợp lệ dữ liệu.
- `401 Unauthorized`: Token không hợp lệ hoặc đã hết hạn.
- `403 Forbidden`: Người dùng không có quyền (RBAC) thực hiện thao tác.
- `404 Not Found`: Không tìm thấy tài nguyên.
- `409 Conflict`: Vi phạm ràng buộc duy nhất (Unique Constraint) trong cơ sở dữ liệu.
- `500 Internal Server Error`: Lỗi hệ thống ngoài dự kiến.

---

# 2. DANH MỤC API CHI TIẾT THEO PHÂN HỆ

## 2.1. Phân hệ Xác thực & Quản lý Phiên (Auth & Mobile Login)

### 1. `POST /api/auth/mobile/login`
- **Mô tả**: Đăng nhập chuyên dụng dành cho ứng dụng di động Hiệp hội (`/auth/mobile`).
- **Phân quyền**: Công khai.
- **Request Body**:
```json
{
  "identifier": "M1983-002",
  "password": "SecurePassword@1983",
  "association_id": "c1983000-0000-4000-8000-000000001983"
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "def50200...",
  "user": {
    "id": "00000000-0000-4000-8000-000000000002",
    "member_code": "M1983-002",
    "full_name": "James Nguyễn",
    "role": "bch_pho_chu_tich",
    "status": "active",
    "term_end": "2027-09-13",
    "association": {
      "id": "c1983000-0000-4000-8000-000000001983",
      "name": "CLB Doanh Nhân CEO 1983",
      "slug": "ceo1983"
    }
  }
}
```

### 2. `POST /api/auth/mobile/card-scan`
- **Mô tả**: Đăng nhập nhanh bằng thẻ vật lý NFC hoặc quét mã QR in trên thẻ hội viên.
- **Request Body**:
```json
{
  "card_token": "VIONE-CARD-TOKEN-ABCXYZ-9988",
  "device_id": "iPhone-15-Pro-Max-Device-UID"
}
```
- **Response 200 OK**: Trả về `access_token` và nạp tự động thông tin hội viên tương ứng.

---

## 2.2. Phân hệ Quản lý Hội viên & Thẩm định (Members & Applications)

### 1. `GET /api/members`
- **Mô tả**: Lấy danh sách hội viên hiệp hội, hỗ trợ bộ lọc và phân trang.
- **Query Params**:
  - `status`: `active` | `due` | `overdue` | `renewed` | `all`
  - `type`: `company` (tự động gom nhóm các loại `company`, `enterprise`, `corporate`) | `individual` | `all`
  - `industry`: Tên ngành nghề (ví dụ: `Technology`, `Real Estate`)
  - `page`: Số trang (mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (mặc định: `20`)
- **Response 200 OK**:
```json
{
  "data": [
    {
      "id": "MEM-1983-100",
      "code": "M1983-100",
      "name": "Tập đoàn Công nghệ Kho Group",
      "contact": "Đặng Minh Khôi",
      "company": "Tập đoàn Công nghệ Kho Group",
      "email": "khoi.dang@khogroup.vn",
      "phone": "0912345678",
      "type": "company",
      "level": "memberLevel.large",
      "industry": "ind.it",
      "region": "region.north",
      "status": "active",
      "term_end": "2027-09-13",
      "taxCode": "0109988776",
      "website": "https://khoiminh.tech",
      "employees": 250,
      "address": "Tầng 12 ViOne Tech Hub, Cầu Giấy, Hà Nội",
      "about": "Hệ sinh thái phần mềm quản trị toàn diện và chuyển đổi số cho doanh nghiệp SME."
    }
  ],
  "pagination": { "total": 17, "page": 1, "limit": 50, "totalPages": 1 }
}
```

### 2. `POST /api/member-applications/approve`
- **Mô tả**: Thư ký / Chủ tịch phê duyệt hồ sơ ứng viên và cấp mã hội viên chính thức.
- **Request Body**:
```json
{
  "application_id": "f1a2b3c4-0000-4000-8000-000000000001",
  "member_code": "M1983-099",
  "type": "corporate",
  "level": "member",
  "industry": "Công nghệ thông tin",
  "region": "Hà Nội",
  "term_end": "2027-09-13",
  "executive_role": "Hội viên chính thức"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Đã phê duyệt thành công hồ sơ và cấp mã hội viên M1983-099",
  "member_id": "MEM-1983-099"
}
```

---

## 2.3. Phân hệ Sự kiện, Khán phòng & Điểm danh QR (Events & Check-in)

### 1. `POST /api/events`
- **Mô tả**: Tạo sự kiện hoặc hội thảo giao thương mới.
- **Request Body**:
```json
{
  "name": "Diễn đàn Giao thương & Gala Doanh nhân CEO 1983",
  "date": "2026-09-20",
  "location": "Trung tâm Hội nghị Quốc gia, Hà Nội",
  "capacity": 250,
  "fee": 0,
  "status": "published"
}
```
- **Response 201 Created**: Sinh `id: EVT-CEO1983-2026-GALA`.

### 2. `POST /api/events/checkin-verify`
- **Mô tả**: Trạm lễ tân quét camera nhận diện mã QR của đại biểu và xác nhận vào cửa.
- **Request Body**:
```json
{
  "qr_payload": "QR-CEO1983-EVT-001",
  "event_id": "EVT-CEO1983-2026-GALA",
  "device_name": "Tablet-Lễ-Tân-Cổng-1"
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "member_name": "James Nguyễn",
  "member_code": "M1983-002",
  "seat_assignment": "VIP-SK-02",
  "checked_in_at": "2026-09-20T08:15:30.000Z",
  "message": "Điểm danh thành công"
}
```

---

## 2.4. Phân hệ Tài chính, Niên liễm & Cổng VietQR (Fees, Invoices & Webhooks)

### 1. `POST /api/fees/invoices/generate`
- **Mô tả**: Phát hành hóa đơn niên liễm cho hội viên.
- **Request Body**:
```json
{
  "member_id": "MEM-1983-099",
  "year": 2026,
  "amount": 10000000,
  "due_date": "2026-09-28",
  "method": "bank"
}
```
- **Response 201 Created**:
```json
{
  "invoice_no": "INV-2026-099",
  "amount": 10000000,
  "status": "unpaid",
  "vietqr_url": "https://img.vietqr.io/image/MBBANK-0988776655-compact2.png?amount=10000000&addInfo=CEO1983%20M1983-099%20RENEW"
}
```

### 2. `POST /api/webhooks/payment/vietqr`
- **Mô tả**: Webhook tiếp nhận tín hiệu chuyển khoản thành công từ ngân hàng/cổng thanh toán.
- **Request Body**:
```json
{
  "transaction_id": "TXN-VIONE-998822",
  "amount": 10000000,
  "content": "CEO1983 M1983-005 RENEW",
  "bank_brand": "MBBANK",
  "timestamp": "2026-09-13T10:00:00Z"
}
```
- **Logic xử lý backend**:
  1. Trích xuất mã hội viên `M1983-005`.
  2. Bắt đầu transaction nguyên tử:
     - `UPDATE invoices SET status='paid', paid_at=CURRENT_DATE`
     - `UPDATE members SET term_end=term_end + INTERVAL '1 year', renewed_at=CURRENT_DATE`
     - `INSERT INTO renewal_audit_log (event_type='payment', amount_paid=10000000, reference='TXN-VIONE-998822')`
  3. Bắn thông báo Socket Realtime tới màn hình `/association/renew/result`.

---

## 2.5. Phân hệ Quyền lợi & Đặc quyền Đối tác (Benefits & Perks)

### 1. `GET /api/benefits`
- **Mô tả**: Lấy danh sách quyền lợi chính thức của hội viên từ bảng `public.association_benefits`.
- **Response 200 OK**:
```json
[
  {
    "id": "b1a2c3d4-0000-4000-8000-000000000001",
    "title_vi": "Xúc tiến thương mại & Kết nối B2B toàn quốc",
    "desc_vi": "Tham gia mạng lưới giao thương hơn 500+ doanh nghiệp thành viên CEO 1983.",
    "sort_order": 1
  }
]
```

### 2. `GET /api/members/benefits/admin`
- **Mô tả**: Danh sách quyền lợi quản trị (trang `/benefits`), hỗ trợ song ngữ `titleVi`, `titleEn`, `descVi`, `descEn`, sắp xếp `sortOrder`.
- **Response 200 OK**:
```json
[
  {
    "id": "82eecea0-b47c-4657-ad25-a6802a4fd1ed",
    "titleVi": "Giao thương đồng niên 1983",
    "titleEn": "1983 Peer Trade & Network",
    "descVi": "Môi trường tin cậy kết nối cùng thế hệ doanh nhân Quý Hợi",
    "descEn": "Trusted networking among 1983 entrepreneurs",
    "sortOrder": 1
  }
]
```

### 3. `POST /api/members/benefits/admin`
- **Mô tả**: Tạo mới quyền lợi hội viên trong CRM Admin.
- **Request Body**:
```json
{
  "titleVi": "Đào tạo lãnh đạo & Cố vấn chiến lược",
  "titleEn": "Leadership Coaching & Strategy Mentorship",
  "descVi": "Chuỗi hội thảo chuyên đề hàng quý cùng chuyên gia đầu ngành",
  "descEn": "Quarterly strategic seminars with leading industry experts",
  "sortOrder": 5
}
```

### 4. `PUT /api/members/benefits/admin/:id` & `DELETE /api/members/benefits/admin/:id`
- **Mô tả**: Cập nhật hoặc xóa quyền lợi hội viên khỏi hệ thống.


---

## 2.6. Phân hệ Sàn Giao thương B2B (Marketplace & Quotes)

### 1. `POST /api/marketplace/products`
- **Mô tả**: Đăng bán sản phẩm / dịch vụ của doanh nghiệp lên chợ thương mại nội bộ.
- **Request Body**:
```json
{
  "title": "Hệ sinh thái Chuyển đổi số Doanh nghiệp ViOne",
  "description": "Giải pháp CRM kết nối hội viên và sàn thương mại B2B toàn diện",
  "price": 45000000,
  "category": "Phần mềm B2B",
  "status": "active"
}
```

---

## 2.7. Phân hệ Mạng xã hội Doanh nhân (B2B Moments & Feed)

### 1. `POST /api/moments`
- **Mô tả**: Đăng bài viết chia sẻ cơ hội giao thương trên `/connect-app/moment`.
- **Request Body**:
```json
{
  "target_kind": "connection",
  "event_name": "Tìm kiếm đối tác AI ERP",
  "note": "Doanh nghiệp chúng tôi đang tìm kiếm đối tác cung ứng giải pháp AI Logistics.",
  "status": "active"
}
```

---

---

## 2.8. Phân hệ Kết nối Doanh nhân & Nhắn tin Realtime (Network Connections & Direct Messages)

### 1. `POST /api/connect-app/network/requests` (hoặc `/api/network/requests`)
- **Mô tả**: Gửi lời mời kết nối kinh doanh từ tài khoản hiện tại tới đối tác đích (`targetUserId`). Hệ thống tự động ghi nhận vào bảng `public.user_connections` với trạng thái `pending`, đồng thời bắn thông báo real-time qua WebSocket và lưu trữ vào `public.business_notifications` cùng `public.member_notifications` với `action_target: { route: "/connect-app/network", search: { tab: "requests" } }`.
- **Request Body**:
```json
{
  "targetUserId": "00000000-0000-4000-8000-000000000001"
}
```
- **Response (200 OK)**:
```json
{
  "ok": true,
  "connectionId": "c8a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "status": "pending",
  "message": "Đã gửi lời mời kết nối thành công"
}
```

### 2. `GET /api/connect-app/network/requests/incoming`
- **Mô tả**: Lấy danh sách các lời mời kết nối gửi đến tài khoản hiện tại đang ở trạng thái `pending`.
- **Response (200 OK)**:
```json
[
  {
    "id": "c8a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "counterpartUserId": "00000000-0000-4000-8000-000000000002",
    "status": "pending",
    "createdAt": "2026-09-13T08:00:00.000Z"
  }
]
```

### 3. `PATCH /api/connect-app/network/connections/:id`
- **Mô tả**: Chấp thuận (`status: "accepted"`) hoặc từ chối (`status: "declined"`) lời mời kết nối. Khi chấp thuận, hai tài khoản trở thành bạn bè kết nối chính thức trong tab Mạng lưới (Network).
- **Request Body**:
```json
{
  "status": "accepted"
}
```

### 4. `POST /api/connect-app/network/connections/resolve`
- **Mô tả**: Phân giải danh tính an toàn công khai (tên hiển thị thực tế, ảnh đại diện, chức danh, công ty) cho danh sách `userIds`.
- **Request Body**:
```json
{
  "userIds": ["00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002"]
}
```
- **Response (200 OK)**:
```json
[
  {
    "userId": "00000000-0000-4000-8000-000000000001",
    "displayName": "Trần Tuấn Anh",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "headline": "Platform Administrator",
    "companyName": "ViConnect Holdings"
  }
]
```

### 5. `GET /api/connect-app/network/recommendations/today`
- **Mô tả**: Trả về danh sách gợi ý kết nối AI thông minh hôm nay dựa trên vị trí địa lý, quy mô doanh nghiệp và chức vụ (C-Level, Founder, Giám đốc), tích hợp tính năng tự động hiển thị trên Trang chủ và tab Mạng lưới.

### 6. `POST /api/messages/direct`
- **Mô tả**: Gửi tin nhắn trao đổi 1-on-1 trong `/connect-app/inbox`.
- **Request Body**:
```json
{
  "thread_id": "b8c9d0e1-0000-4000-8000-000000000010",
  "sender_user_id": "00000000-0000-4000-8000-000000000002",
  "body": "Chào anh Tuấn Anh, tuần tới mình sắp xếp buổi B2B 1-1 tại Keangnam nhé!"
}
```

### 7. `GET /api/connect-app/dm/member/conversations`
- **Mô tả**: Lấy danh sách hội thoại của thành viên trong Hiệp hội (`/association/messages`). Tự động nhận diện tài khoản người dùng, ghim kênh chính thức "Ban Thư Ký CLB Doanh Nhân CEO 1983" (admin) lên vị trí đầu tiên (`isSystem: true`, avatar `/ceo1983-logo.png`).
- **Response (200 OK)**:
```json
[
  {
    "peerCode": "admin",
    "peerName": "Ban Thư Ký CLB Doanh Nhân CEO 1983",
    "avatarUrl": "/ceo1983-logo.png",
    "lastMessage": "Thông báo: Nộp hội phí niên liễm 2026...",
    "lastTime": "2026-09-13T10:00:00.000Z",
    "unreadCount": 1,
    "isSystem": true
  },
  {
    "peerCode": "M1983-002",
    "peerName": "James Nguyễn",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "lastMessage": "Tuần tới anh em mình cafe nhé!",
    "lastTime": "2026-09-13T09:30:00.000Z",
    "unreadCount": 0,
    "isSystem": false
  }
]
```

### 8. `GET /api/connect-app/dm/member/messages?peerCode={code}`
- **Mô tả**: Lấy lịch sử tin nhắn 1-on-1 giữa thành viên hiện tại và đối tác `peerCode` (hoặc kênh hệ thống `admin`).
- **Hỗ trợ thẻ thông báo giao dịch Zalo OA (`ZaloTransactionCard`)**:
  Khi tin nhắn chứa định dạng:
  `[action:payment|amount=20000000|code=HD-2026-001|title=Hội phí niên liễm 2026|dueDate=31/03/2026]`
  Hệ thống tự động hiển thị thẻ thông báo giao dịch chuẩn Zalo Official Account với thông tin chuyển khoản MB Bank (`198388889999`), nút bật mã VietQR, nút tải ảnh QR và sao chép số tài khoản.
- **Hỗ trợ thẻ thư mời họp (`action:meeting`)**:
  `[action:meeting|title=Đại hội Thường niên 2026|time=08:30 - 15/04/2026|location=Keangnam Landmark 72|link=https://meet.google.com/ceo-1983]`



---

## 2.9. Phân hệ Điều phối Cuộc hẹn B2B (Business Meetings 1-on-1)

### 1. `POST /api/meetings/schedule`
- **Mô tả**: Khởi tạo lịch hẹn gặp mặt B2B tại `/business-connect/meetings`.
- **Request Body**:
```json
{
  "association_id": "c1983000-0000-4000-8000-000000001983",
  "organizer_user_id": "00000000-0000-4000-8000-000000000002",
  "title": "B2B 1-on-1: Hợp tác triển khai AI ERP",
  "description": "Thảo luận phương án tích hợp hệ sinh thái giải pháp",
  "meeting_type": "networking",
  "status": "confirmed",
  "timezone": "Asia/Ho_Chi_Minh",
  "source_type": "association"
}
```

---

## 2.10. Phân hệ Danh tính số & Thẻ Thông minh NFC (Smart Cards & NFC)

### 1. `GET /api/public/card/{slug}.vcf`
- **Mô tả**: Xuất file vCard 3.0 chuẩn quốc tế để người dùng quét QR lưu thẳng vào danh bạ điện thoại thông minh.
- **Response**: Trả về `Content-Type: text/vcard; charset=utf-8` chứa đầy đủ họ tên, công ty, hotline, chức danh và logo.

---

## 2.11. Phân hệ Sơ đồ Bàn tiệc Gala & Phân bổ Chỗ ngồi VIP (VIP Seating & Table Distribution)

### 1. `POST /api/events/:eventId/seating/allocate`
- **Mô tả**: Phân bổ tự động hoặc chỉ định thủ công đại biểu/hội viên VIP vào sơ đồ bàn tiệc.
- **Request Body**:
```json
{
  "event_id": "c1983000-0000-4000-8000-000000001983",
  "registration_id": "d0000000-0000-4000-8000-000000000001",
  "table_number": "VIP-01",
  "seat_number": "A1",
  "tier": "diamond_sponsor",
  "dietary_notes": "Ăn chay dưỡng sinh, không hành tỏi"
}
```
- **Kiosk Realtime Routing**: Khi đại biểu quét QR check-in thành công tại quầy lễ tân, WebSocket gateway kích hoạt sự kiện `EVENT_SEATING_LOCATED`, hiển thị trực quan bản đồ hội trường dẫn đường tới đúng bàn tiệc.

---

## 2.12. Động cơ Điều phối Thông báo Đa kênh (Multi-Channel Notification Orchestration Engine)

### 1. `POST /api/notifications/dispatch`
- **Mô tả**: Gửi thông báo phân tầng qua 5 kênh: Push Notification (Firebase FCM), In-App (Realtime Supabase), SMS Brandname, Email (SendGrid/Amazon SES), và Zalo ZNS (Zalo Notification Service).
- **Quy tắc Kiểm duyệt & Ràng buộc Hệ thống**:
  - `priority`: Chỉ chấp nhận 4 mức độ theo check constraint cơ sở dữ liệu: `['critical', 'high', 'normal', 'informational']`.
  - `status`: Tuân thủ nghiêm ngặt enum: `['pending', 'scheduled', 'delivered', 'read', 'archived', 'expired', 'cancelled']`.
  - Không có trường `is_read` boolean; chuyển trạng thái đã đọc bằng `status = 'read'` và cập nhật `read_at = NOW()`.
  - **Deduplication Engine**: Hash MD5 nội dung + recipient + time bucket (5 phút) để triệt tiêu spam tin nhắn trùng lặp.
  - **DND Filter**: Bộ lọc giờ cấm làm phiền (22:00 - 07:00). Các tin mức `normal` và `informational` tự động dời lịch sang 07:30 sáng hôm sau. Mức `critical` được bypass DND.
  - **Exponential Backoff Retry**: Tự động retry tối đa 3 lần với khoảng cách 1s, 4s, 16s nếu nhà mạng trả về lỗi timeout.

---

## 2.13. Động cơ Bầu cử Số & Biểu quyết Đại hội (Digital Election, Voting Tokens & Quorum Engine)

### 1. `POST /api/elections/:electionId/vote`
- **Mô tả**: Bỏ phiếu tín nhiệm BCH hoặc biểu quyết nghị quyết đại hội trực tuyến với chữ ký số token.
- **Request Body**:
```json
{
  "election_id": "e1983000-0000-4000-8000-000000000001",
  "voter_id": "00000000-0000-4000-8000-000000000002",
  "ballot": [
    { "candidate_id": "cand_01", "vote": "agree", "weight": 1.0 },
    { "candidate_id": "cand_02", "vote": "agree", "weight": 1.0 }
  ],
  "voting_token": "VT-HASH-SECURE-983F12"
}
```
- **Quorum Engine**: Tự động tính toán tỷ lệ đại biểu tham dự hợp lệ trên tổng số hội viên chính thức có quyền biểu quyết. Chỉ công nhận kết quả khi Quorum >= 51% (hoặc 65% với sửa đổi điều lệ).
- **Anti-Fraud & Audit**: Mỗi lá phiếu được băm mật mã (SHA-256) ghi nhận vào audit log bất biến, đảm bảo nguyên tắc bỏ phiếu kín nhưng kiểm phiếu minh bạch tuyệt đối.

---

## 2.14. Sổ cái Kế toán Đa quỹ & Đối soát Ngân hàng Tự động (Multi-Fund Ledger & Reconciliation)

### 1. `POST /api/accounting/reconcile`
- **Mô tả**: Đối soát sao kê ngân hàng theo thời gian thực và phân bổ dòng tiền vào các quỹ nghiệp vụ độc lập.
- **Request Body**:
```json
{
  "transaction_ref": "VCB-8839219382",
  "amount": 10000000,
  "payer_content": "CEO1983 M1983-005 RENEW",
  "bank_code": "VCB",
  "fund_distribution": {
    "operating_fund": 7000000,
    "charity_fund": 2000000,
    "investment_fund": 1000000
  }
}
```
- **Xử lý Nộp Thừa / Nộp Thiếu**:
  - *Nộp thừa*: Tự động tất toán hóa đơn hiện tại, phần chênh lệch thặng dư được tự động ghi có vào tài khoản tạm ứng (`advance_balance`) của hội viên để cấn trừ vào niên liễm năm tiếp theo.
  - *Nộp thiếu*: Chuyển trạng thái hóa đơn sang `partially_paid`, gửi thông báo ZNS/SMS nhắc số tiền còn thiếu kèm mã VietQR chênh lệch.

---

## 2.15. Cấp phát Thẻ cứng NFC/RFID & Apple Wallet Pass (.pkpass)

### 1. `GET /api/public/card/:slug/apple-wallet`
- **Mô tả**: Tạo và ký số file `.pkpass` chuẩn Apple Wallet để người dùng bấm thêm trực tiếp vào ví iPhone/Apple Watch.
- **Cấu trúc Thẻ Thông minh**:
  - Header: Logo hiệp hội, loại hội viên (Kim Cương / Vàng).
  - Primary Field: Họ và tên hội viên, chức vụ doanh nghiệp.
  - Auxiliary Fields: Mã số hội viên, niên khóa, điểm uy tín B2B.
  - Barcode: Mã QR chuẩn ISO/IEC 18004 hỗ trợ check-in tốc độ cao tại sự kiện.
  - NFC Payload: Payload NDEF URL mã hóa RSA để tap-to-connect tức thì khi chạm vào điện thoại khác.

---

## 2.16. Sàn B2B RFQ Đấu thầu & Ký kết Biên bản Ghi nhớ MOU số (B2B RFQ & Digital MOU)

### 1. `POST /api/b2b/rfq/create`
- **Mô tả**: Doanh nghiệp đăng tải nhu cầu chào mua (Request for Quotation) với tiêu chuẩn kỹ thuật, ngân sách dự kiến và hạn đóng thầu.
- **Quy trình Đấu thầu Minh bạch**: Các nhà cung cấp trong hiệp hội gửi báo giá cạnh tranh bí mật. Khi mở thầu, người mua chọn đối tác phù hợp nhất.
- **Ký kết Hợp đồng / Biên bản Ghi nhớ MOU điện tử qua OTP**:
  - Hệ thống sinh file hợp đồng nguyên tắc PDF có mã băm bảo mật SHA-256.
  - Hai bên xác thực ký hợp đồng bằng mã OTP 6 số gửi qua SMS/Email đã đăng ký.
  - Hợp đồng có giá trị pháp lý nội bộ và được lưu trữ trên kho lưu trữ mã hóa bất biến.

---

## 2.17. Phân quyền Granular RBAC tới từng Nút bấm (Button-Level UI Permission Policy)

### 1. Ma trận Phân quyền & Đánh giá Chính sách (Policy Evaluator)
Hệ thống áp dụng cơ chế đánh giá quyền hạn 3 lớp:
1. **Role Level**: Admin > Board of Directors (BCH) > Official Member > Guest.
2. **Resource Action**: `read`, `create`, `update`, `delete`, `export`, `approve`, `override_fee`.
3. **Button-Level Directive (`v-can` / `usePermission`)**: 
   - Ẩn hoàn toàn hoặc vô hiệu hóa (`disabled`) nút bấm xóa thành viên, phê duyệt tài chính, hoặc xuất dữ liệu nếu người dùng không sở hữu quyền tương ứng.
   - Bất kỳ hành động can thiệp trái phép qua DevTools/Postman đều bị chặn lập tức ở tầng Guard Middleware của NestJS với mã lỗi `403 Forbidden`.

---

## 2.18. Kiến trúc Landing Page Business Connect V1 - V7 & Tiêu chuẩn Visual-First (Creative Landing Architecture)

### 1. Advanced Scroll & Section Transition Rules
- **Advanced Scroll Architecture**: Bắt buộc bọc các section trong kiến trúc cuộn nâng cao (`useScroll`, `useTransform` của Framer Motion, kết hợp `perspective: 1000px`, `clip-path: inset()`, `sticky top-0`). Tuyệt đối không dùng cuộn CSS mặc định cho hiệu ứng chuyển section.
- **Quy tắc Visual thay thế Text**: Tuyệt đối không render "rừng chữ". Tại section "Vấn đề" (5 items) và "Giải pháp" (9 items), toàn bộ mô tả dài được thay thế bằng hình ảnh/GIF/Icon tương tác động. Nội dung chi tiết chỉ hiển thị qua Tooltip, Popover, hoặc modal hover/click.
- **Đồng bộ 3 Theme Modes**: Mỗi phiên bản cung cấp 3 chế độ hiển thị chuyên biệt:
  - *Light Mode*: Phong cách thanh lịch, tương phản sáng rõ ràng, không dùng chữ vàng trên nền sáng.
  - *Dark Mode*: Đậm chất nghệ thuật và chiều sâu không gian (sao đêm, neon, cyber, bọt khí sinh học).
  - *High Contrast*: Tối giản, nét vẽ rõ ràng, triệt tiêu hiệu ứng mờ nhòe hỗ trợ người dùng đặc biệt.

### 2. Chi tiết 7 Phiên bản Sáng tạo (Creative Editions)
1. **V1 - Tiên Hiệp & Tu Tiên**: Thăng tiên Parallax (Z-axis scale / trồi Y xuyên sương mù), luồng linh khí viền thẻ, mực ngấm.
2. **V2 - Cổ Tích Nhiệm Màu**: Lật sách 3D (`perspective: 1000px`, `rotateY(-180deg)`), 5 lọ thuốc phép tương tác sủi bọt bung text, đũa phép Magic Wand rắc bụi sao (Stardust).
3. **V3 - Hoạt Hình & Comic**: Khung tranh rơi nảy (Panel drop bounce `spring: 0.6`), halftone dots pattern, speed action lines, bong bóng thoại (Speech bubble) popover, nút hiệu ứng BAM/POW.
4. **V4 - Mưa & Kính Đọng Nước**: Wipe fog clip-path (`clip-path: inset()`), gạt nước lộ nội dung bên trong, lau sương mù kính (Fog wipe reveal), giọt nước lồi 3D méo icon bên dưới.
5. **V5 - Deep Tech & Cybernetics**: Glitch snap, interactive neural network canvas, terminal decoder (chạy chuỗi mã ngẫu nhiên rồi dịch thành tiếng Việt), chuột spotlight soi rọi bo mạch.
6. **V6 - Kim Tự Tháp**: Cửa đá hầm mộ đóng sập mở toang, bọ hung Scarab cursor thả bụi cát trọng lực, giải mã ký tự tượng hình Hieroglyphs xoay chuyển sang tiếng Việt.
7. **V7 - Bong Bóng Bay**: Bubble lift-off (trôi từ dưới lên trong khối cầu `border-radius: 50%` rồi nổ scale 100vw bung ra section), bọt xà phòng trôi nổi toàn trang, click nổ confetti.

---

## 2.19. Kiến trúc Biểu quyết Đa Nền tảng & Đồng bộ Thông báo Thời gian thực (Multi-App Voting & Realtime Synchronization)

### 1. Mô hình Biểu quyết 3 Điểm chạm (Triple-Surface Voting Architecture)
Hệ thống kết nối và đồng bộ hóa tuyệt đối luồng biểu quyết (Polls/Voting) trên cả 3 bề mặt ứng dụng:
- **CRM Web Admin (`/voting`)**: Ban quản trị tạo cuộc biểu quyết, chọn phân khúc đối tượng tham gia (`all`, `members`, `non_members`), theo dõi thống kê phiếu bầu theo từng kênh, và kích hoạt "Kết thúc biểu quyết".
- **ViOne Connect App (`/connect-app/notifications`)**: Người dùng nhận thông báo biểu quyết có gắn thẻ tương tác (`interactive_poll`), bình chọn trực tiếp 1-click với thẻ nhận diện nguồn `📱 ViOne App`.
- **Hiệp hội App (`/association/notifications` & `/m/notifications`)**: Hội viên nhận thông báo tương tác, bình chọn trực tiếp 1-click với thẻ nhận diện nguồn `🏛️ Hiệp hội App`.

### 2. Cơ chế Phân định Nguồn bỏ phiếu (Source App Attribution)
- **Database Schema**: Bảng `public.poll_votes` được bổ sung trường `source_app VARCHAR(50) DEFAULT 'vione_app'`.
- **Phân loại Kênh bỏ phiếu**:
  - `'vione_app'`: Bỏ phiếu từ ứng dụng mạng xã hội doanh nhân ViOne Connect.
  - `'association_app'`: Bỏ phiếu từ ứng dụng hội viên Hiệp hội doanh nghiệp.
  - `'crm'`: Bỏ phiếu trực tiếp từ cổng quản trị CRM Web.
- **Thống kê Thời gian thực (Real-time Contribution Aggregation)**:
  - Tự động đếm tổng số phiếu và số phiếu riêng lẻ theo từng kênh (`vioneVotes`, `associationVotes`, `crmVotes`) cho từng phương án lựa chọn.
  - Hiển thị thanh tỷ lệ kênh tham gia trên giao diện CRM: `📱 ViOne: X`, `🏛️ Hiệp hội: Y`, `💻 CRM: Z`.

### 3. Tự động hóa Thông báo Khi Khởi tạo và Khi Kết thúc
- **Khi Tạo Cuộc Biểu quyết Mới (`POST /api/voting/polls`)**:
  - Dựa trên `targetAudience` (Tất cả / Chỉ Hội viên / Khách & Đối tác), hệ thống truy vấn danh sách người dùng thụ hưởng.
  - Đẩy thông báo tức thời vào `public.business_notifications` (`notification_kind: 'interactive_poll'`, `event_kind: 'poll_created'`) và `public.member_notifications` (`ref_type: 'poll'`).
  - Dữ liệu `safe_display_data` chứa danh sách phương án, cho phép biểu quyết ngay trên màn hình thông báo mà không cần chuyển trang.
- **Khi Kết thúc Biểu quyết (`POST /api/voting/polls/:id/close`)**:
  - Trạng thái cuộc biểu quyết được cập nhật thành `closed`.
  - Hệ thống tự động phân tích và xác định phương án chiến thắng (Winner), tính toán tỷ lệ % và cơ cấu nguồn tham gia.
  - Tự động phát thông báo kết quả đóng biểu quyết (`event_kind: 'poll_closed'`, `notification_kind: 'poll_result'`) đến toàn bộ người dùng liên quan trên ViOne App và Hiệp hội App.
  - **Hiển thị Thẻ Kết quả Chung cuộc**: Thẻ thông báo trên ViOne App và Hiệp hội App tự động chuyển sang giao diện kết quả:
    - Biểu tượng cúp vàng 🏆 và tiêu đề phương án chiến thắng.
    - Thanh phần trăm kết quả của tất cả các phương án.
    - Huy hiệu tổng số lượt bầu và bảng cơ cấu tỷ lệ người tham gia từ ViOne App vs Hiệp hội App.
    - CRM Admin hiển thị huy hiệu "Đã kết thúc", khóa thao tác bỏ phiếu và làm nổi bật phương án chiến thắng.

---

# 3. MÔ HÌNH DỮ LIỆU & RÀNG BUỘC CƠ SỞ DỮ LIỆU

Bảng tóm tắt các ràng buộc nghiệp vụ (Constraints) then chốt trong PostgreSQL đã được kiểm chứng qua bộ kiểm thử E2E:
- **`demo_requests_status_check`**: `CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'cancelled'))`
- **`members_required_columns`**: Bắt buộc có giá trị khi khởi tạo: `type` (official/honorary/candidate), `level` (general/gold/diamond), `industry`, `region`, `status` (active/official/pending), `joined_at`, `fee_year`.
- **`invoices_status_check`**: `CHECK (status IN ('paid', 'unpaid', 'overdue'))`
- **`invoices_method_check`**: `CHECK (method IN ('bank', 'card', 'cash', 'ewallet'))`
- **`renewal_audit_log_event_type_check`**: `CHECK (event_type IN ('payment', 'idempotent_noop', 'failure'))`
- **`activity_log_category_check`**: `CHECK (category IN ('auth', 'member', 'fee', 'event', 'system'))`
- **`brm_target_xor`**: Ràng buộc nghiêm ngặt chỉ được phép một trong 3 loại: `connection` (có `target_user_id`), hoặc `saved_card` (có `target_card_id`), hoặc `guest_contact` (có `target_guest_id`).
- **`business_meetings_enums`**:
  - `status`: `draft`, `proposed`, `confirmed`, `declined`, `cancelled`, `completed`, `no_show`.
  - `meeting_type`: `in_person`, `video_call`, `phone_call`, `business_lunch`, `demo`, `consultation`, `networking`.
  - `source_type`: `association`, `global_connection`, `saved_card`, `company`, `event`, `qr`, `nfc`, `manual`, `referral`.
- **`business_notifications_constraints`**:
  - `priority`: `CHECK (priority IN ('critical', 'high', 'normal', 'informational'))` (Tuyệt đối không dùng `'urgent'`).
  - `status`: `CHECK (status IN ('pending', 'scheduled', 'delivered', 'read', 'archived', 'expired', 'cancelled'))`.
  - Không tồn tại cột `is_read`; theo dõi đã đọc qua `status = 'read'` và `read_at IS NOT NULL`.
- **Nguyên tắc Đồng bộ bắt buộc (Documentation & Memory Sync)**: Khi có bất kỳ thay đổi về Schema, Route, hoặc Business Flow, đội ngũ phát triển/AI bắt buộc phải cập nhật đồng thời `MEMORY.md`, `.cursorrules` và tài liệu kỹ thuật tại `document/`.


---

# 4. HỆ THỐNG WEBSOCKET & TỰ ĐỘNG HÓA NOTIFICATION

Hệ thống sử dụng WebSocket Gateway (Socket.IO) tích hợp với Supabase Realtime cho các luồng sự kiện tức thì:
- **`EVENT_MEMBER_RENEWED`**: Bắn tới màn hình hội viên khi thanh toán VietQR thành công để cập nhật giao diện không cần reload.
- **`EVENT_QR_CHECKIN_SUCCESS`**: Bắn tới màn hình điều phối khán phòng của Ban Tổ chức khi đại biểu quét vé vào cửa.
- **`EVENT_B2B_MESSAGE_RECEIVED`**: Đẩy tin nhắn tức thời tới màn hình chat của đối tác kèm âm thanh thông báo.
- **`EVENT_MEETING_CONFIRMED`**: Kích hoạt worker tự động sinh file iCal `.ics` và gửi email đính kèm lịch làm việc.
- **`EVENT_SEATING_LOCATED`**: Đẩy bản đồ dẫn đường bàn tiệc tới smartphone đại biểu ngay khi check-in thành công.
- **`EVENT_VOTE_RECORDED`**: Cập nhật biểu đồ tỷ lệ biểu quyết thời gian thực trên màn hình LED đại hội.

---

# 5. QUY TRÌNH BIÊN DỊCH & TRIỂN KHAI

## 5.1. Biên dịch Frontend & Sinh cây Tuyến đường
```bash
# Di chuyển vào thư mục frontend
cd apps/vione_app_fe

# Sinh cây tuyến đường TanStack Router bảo đảm nhận diện /auth/mobile và /association/*
npm run routes:gen

# Kiểm tra tính toàn vẹn đa ngôn ngữ
npm run i18n:check

# Đóng gói Production Bundle với bộ nhớ Node mở rộng
npm run build
```

## 5.2. Khởi chạy Backend NestJS
```bash
cd apps/vione_app_be
npm run build
npm run start:prod
```

## 5.3. Đóng gói Ứng dụng Di động Capacitor Android APK
```bash
cd apps/vione_app_fe
npx cap sync android
cd android && ./gradlew assembleRelease
```

## 5.4. Hệ Thống Kiểm Thử Toàn Diện 138 Luồng Tích Hợp (138 Deep Integration Test Flows)
Hệ thống được xác thực qua 2 bộ kịch bản kiểm thử tích hợp sâu cấp độ Senior QA/Lead Architect với tỷ lệ vượt qua đạt **100% (138/138 Flows Passed)** đối với PostgreSQL thực tế và toàn bộ logic nghiệp vụ:

### 1. Bộ Kiểm Thử Master 110 Luồng (`scratch/test_110_deep_flows.js`) - 110/110 Passed
- **Nhóm 1 (Flows 001 - 010)**: Web Landing & Thu thập Khách hàng tiềm năng (Public bypass, đổi theme, đăng ký demo, liên hệ, chuyển đổi hiệp hội).
- **Nhóm 2 (Flows 011 - 025)**: CRM Quản lý Hội viên & Phân ban BCH (CRUD hội viên, phê duyệt/từ chối, bổ nhiệm BCH, lọc ban ngành, xuất nhập Excel).
- **Nhóm 3 (Flows 026 - 040)**: CRM Quản lý Niên liễm, Thu phí VietQR & Kế toán (Sinh hóa đơn, mã VietQR, webhook thanh toán, ghi log kiểm toán niên liễm).
- **Nhóm 4 (Flows 041 - 055)**: CRM Quản lý Sự kiện & Điểm danh QR Check-in (Vòng đời sự kiện, cấu hình vé, sinh vé QR, check-in thời gian thực, phân tích tỷ lệ tham dự).
- **Nhóm 5 (Flows 056 - 070)**: CRM Quyền lợi, Nhà tài trợ & Sàn B2B Marketplace (Cấp nhà tài trợ, quyền lợi song ngữ, vòng đời sản phẩm active/sold/draft, thu thập lead kết nối).
- **Nhóm 6 (Flows 071 - 085)**: App Hiệp Hội Doanh Nhân `/association/*` (Thẻ hội viên số, trao đổi QR, bầu cử số, tin tức nội bộ, tài liệu hiệp hội, kết nối networking).
- **Nhóm 7 (Flows 086 - 100)**: ViOne Connect Mạng Xã Hội B2B `/connect-app/*` (Bảng tin B2B, Moments đa ảnh, đặt lịch hẹn 1-on-1, chat tin nhắn đối tác, định tuyến thông báo).
- **Nhóm 8 (Flows 101 - 110)**: Bảo Mật, Phân Quyền RBAC, API Guards & Phục Hồi Dữ Liệu (Phân quyền Admin/Board/Member/Guest, bảo vệ route, khôi phục bản ghi đã xóa mềm, kiểm toán hệ thống).

### 2. Bộ Kiểm Thử 28 Phân Hệ Nghiệp Vụ Chuyên Sâu (`scratch/test_deep_subfeatures_suite.js`) - 28/28 Passed
- **Phân hệ 1 (4 Flows)**: Sơ đồ bàn tiệc VIP Gala, kiểm tra xung đột chỗ ngồi, chỉ định đại biểu Kim Cương, điều hướng Kiosk Check-in thời gian thực.
- **Phân hệ 2 (4 Flows)**: Điều phối thông báo đa kênh, lọc giờ cấm làm phiền DND, chống trùng lặp Deduplication, cơ chế Retry Exponential Backoff.
- **Phân hệ 3 (4 Flows)**: Đại hội biểu quyết số, xác thực mã Token, kiểm soát túc số Quorum >= 51%, băm mật mã Audit Log chống gian lận.
- **Phân hệ 4 (4 Flows)**: Kế toán đa quỹ tài chính (Quỹ vận hành, Quỹ thiện nguyện, Quỹ đầu tư), đối soát giao dịch nộp thừa (chuyển tạm ứng) và nộp thiếu (nhắc nợ ZNS).
- **Phân hệ 5 (4 Flows)**: Thẻ cứng thông minh NFC/RFID, đồng bộ Apple Wallet Pass .pkpass, ghi nhận lịch sử chạm Tap-to-Connect.
- **Phân hệ 6 (4 Flows)**: Sàn B2B RFQ, chào thầu cạnh tranh, lựa chọn nhà thầu chiến thắng, ký biên bản ghi nhớ MOU điện tử bằng OTP an toàn.
- **Phân hệ 7 (4 Flows)**: Phân quyền Granular RBAC tới từng nút bấm (Button-Level Policy), kiểm soát ma trận quyền CRUD, chặn truy cập trái phép 403 Forbidden.

Lệnh thực thi kiểm thử toàn bộ 138 luồng:
```bash
node scratch/test_110_deep_flows.js
node scratch/test_deep_subfeatures_suite.js
```

---

# 6. HỆ THỐNG BIỂU QUYẾT ĐA NỀN TẢNG & GHI NHẬN NGUỒN ỨNG DỤNG (MULTI-APP VOTING & ATTRIBUTION)

## 6.1. Kiến Trúc Luồng Bỏ Phiếu Đa Kênh
Hệ thống cho phép cử tri và hội viên tham gia bỏ phiếu/biểu quyết đồng thời từ 3 nền tảng khác nhau:
1. **ViOne Mobile App (`vione_app`)**: Hội viên doanh nhân bỏ phiếu trên ứng dụng di động cá nhân.
2. **Cổng Thông Tin Hiệp Hội (`association_app`)**: Đại biểu đăng nhập và bỏ phiếu trên cổng web portal của hiệp hội.
3. **Bàn Kiểm Phiếu CRM (`crm`)**: Ban Thư ký/Ban Kiểm tra hỗ trợ đại biểu thao tác trực tiếp tại hội trường.

## 6.2. CSDL & Ràng Buộc Trường `source_app`
- Bảng `public.poll_votes` được bổ sung cột:
  ```sql
  ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS source_app VARCHAR(50) DEFAULT 'crm';
  ```
- Ràng buộc giá trị hợp lệ: `source_app IN ('vione_app', 'association_app', 'crm')`.

## 6.3. API Contract Bỏ Phiếu & Đóng Hòm Phiếu
### 1. `POST /api/voting/polls/:pollId/vote`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Request Body**:
  ```json
  {
    "optionId": "00000000-0000-4000-8000-000000000001",
    "memberId": "M1983-001",
    "source_app": "vione_app"
  }
  ```
- **Xử lý**:
  - Xác thực cử tri thuộc đối tượng tham gia (`target_audience`).
  - Kiểm tra chống bỏ phiếu lần 2 (`Anti-Double Voting`).
  - Băm SHA-256 nội dung lá phiếu để đảm bảo tính ẩn danh và bất biến.
  - Ghi nhận `source_app` tương ứng.

### 2. `POST /api/voting/polls/:pollId/close`
- **Xử lý**:
  - Niêm phong hòm phiếu điện tử, chuyển trạng thái `status = 'closed'`.
  - Tự động tổng hợp kết quả (tổng phiếu, tỷ lệ %, phân loại phiếu theo `source_app`).
  - Xác định ứng viên/phương án chiến thắng.
  - Phát sóng thông báo kết thúc đa kênh (`Push Notification & WebSocket`) về cả 3 ứng dụng: CRM, ViOne App, Hiệp Hội App kèm huy hiệu chiến thắng 🏆.

---

# 7. KIẾN TRÚC & TRIẾT LÝ THIẾT KẾ BỘ LANDING PAGE DOANH NGHIỆP BUSINESS CONNECT (V1 - V8)

Toàn bộ các phiên bản Landing Page từ V1 đến V8 tuân thủ **Quy tắc Thiết kế Tuyệt đối (Premium B2B)**:
- **Khách hàng mục tiêu**: CEO, Chủ tịch, Giám đốc, Lãnh đạo Hiệp hội & Doanh nghiệp hàng đầu.
- **Tính thẩm mỹ**: Sang trọng, nghiêm túc, đẳng cấp tập đoàn; không dùng yếu tố game/hoạt hình/giải trí.
- **Cấu trúc chuẩn mực**: Bắt buộc chia rõ các section với khoảng cách lớn (`py-24`), chia cột grid khoa học.
- **Nội dung 100% đồng nhất (Part 1 Copy)**:
  - Header: Giải pháp | Khách hàng | Câu chuyện | Bảng giá | Tài nguyên | Về chúng tôi || Đăng nhập | [Đặt demo ->]
  - Hero: Tagline, Headline "Hiểu đúng người. Mở ra cơ hội thật.", Subtext, CTAs, 4 Thống kê (10,000+ | 300+ | 50,000+ | 20+).
  - Problem: 5 Thách thức doanh nghiệp (Thông tin phân tán, Khó duy trì quan hệ, Bỏ lỡ cơ hội, Thiếu kết nối thực chất, Khó đo lường hiệu quả).
  - Solution: 9 Tính năng doanh nghiệp (Quản lý hội viên, CRM & Quan hệ, Cơ hội kinh doanh, Sự kiện, Cộng đồng & Nhóm, Tri thức & Nội dung, Báo cáo & Phân tích, AI Copilot, Tích hợp & Mở rộng).
  - Ecosystem: Hệ sinh thái mở, Highlight "NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN."
  - Clients & Reviews: 6 Logo tổ chức lớn (VCCI, AmCham, EuroCham, KoCham, SBF, AusCham) + 3 Đánh giá từ Lãnh đạo.
  - Footer: Kêu gọi hành động & Đặt demo.

### Danh Mục 8 Phiên Bản Thiết Kế Chuyên Sâu:
1. **V1 - Executive Zen (`/business-connect/v1`)**: Phong cách Aman Resorts, gradient sương khói chậm, đường viền thẻ phát sáng xử lý dữ liệu, chuyển theme kèm hiệu ứng cánh cửa đá khép mở.
2. **V2 - Heritage & Trust (`/business-connect/v2`)**: Phong cách Private Banking/Luật, nền Parchment be nhạt, Midnight Navy, hạt ánh sáng vàng kim lơ lửng, thẻ hồ sơ mạ vàng, chuyển cảnh Legacy Reveal.
3. **V3 - Premium Editorial (`/business-connect/v3`)**: Phong cách Stripe/Vercel, đường lưới kỹ thuật chính xác, viền cứng sắc nét, chuyển cảnh Snap & Slide, thẻ đẩy khối Offset Shadow.
4. **V4 - Executive Glass Dashboard (`/business-connect/v4`)**: Phong cách Glassmorphism đa tầng, bokeh đô thị tài chính làm mờ sâu, thẻ kính mờ bóng bẩy, cuộn xếp lớp Stacking Cards.
5. **V5 - Cyber Neural Command (`/business-connect/v5`)**: Radar mạng lưới B2B, canvas liên kết nơ-ron điều phối cơ hội giao thương.
6. **V6 - Corporate Monument (`/business-connect/v6`)**: Phong cách tượng đài kiến trúc, nền đá cẩm thạch Marble White / đen Obsidian điểm vàng đồng Bronze, hình học đa diện 3D xoay chậm, hiệu ứng cánh cửa đá khép mở khi đổi theme.
7. **V7 - Fluid Analytics (`/business-connect/v7`)**: Phong cách Fluid Mesh Gradient, nền trắng sứ / xanh đại dương thẫm, ranh giới sóng dẻo Wave Morphing, thẻ bo góc lớn rounded-3xl.
8. **V8 - Executive Titanium Suite (`/business-connect/v8`)**: Flagship tích hợp tối thượng, thiết kế Titanium sang trọng, đồng bộ đa ứng dụng CRM - ViOne - Hiệp Hội.

---

# 8. MA TRẬN KIỂM THỬ ISO/IEC/IEEE 29119-3 & KẾ HOẠCH PHẠM VI WBS PMBOK

Hệ thống được chuẩn hóa tài liệu kiểm thử và ước lượng công việc cấp tập đoàn:
1. **`VIONE_COMPREHENSIVE_TEST_CASES_SUITE_10000_CASES.xlsx`**:
   - Tuân thủ tiêu chuẩn quốc tế ISO/IEC/IEEE 29119-3.
   - 10 Sheets nghiệp vụ chuyên sâu, hơn **10,000 test cases thực tế 100% không trùng lặp**.
   - Bao phủ toàn diện: VIEW (danh sách, chi tiết, mobile, responsive), CRUD, SEARCH (debounce, full-text unaccent), FILTER (faceted, saved filters), SORT, EXPORT (Excel formatted, PDF), IMPORT, PERMISSIONS RBAC, REALTIME, CONCURRENCY, OFFLINE SYNC, SECURITY (XSS, SQLi, Brute Force), và VOTING SOURCE ATTRIBUTION.
2. **`VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION_CHI_TIET.xlsx`**:
   - Tuân thủ tiêu chuẩn quản trị dự án PMBOK / ISO 21500.
   - 10 Phân hệ nghiệp vụ với **1,000+ gói công việc chi tiết (Work Packages)**.
   - Phân rã đầy đủ 5 giai đoạn: Kiến trúc & Schema -> Giao diện Frontend -> Logic Backend CSDL -> Tích hợp & Bảo mật -> Kiểm thử E2E & UAT.
   - Ước lượng chi tiết Man-days cho Frontend, Backend, QA, xác định rõ Actor, Priority, Route/Endpoint và Deliverables.

---

# 9. KIẾN TRÚC PHÁ VỠ CẤU TRÚC DOM LANDING V2-V7 & PHÂN HỆ HIỆP HỘI (CEO 1983)

### 9.1. Kiến Trúc Landing Page Đột Phá (V2 - V7)
- **Bố Cục Bất Đối Xứng (Asymmetric Grid)**: Triệt để loại bỏ bố cục 50/50 truyền thống. Áp dụng CSS Grid bất đối xứng `grid-cols-12` (`col-span-7` vs `col-span-5` hoặc `col-span-4` vs `col-span-8`).
- **Phần Tử Đè Lớp (Overlapping Elements)**: Sử dụng negative margins (`-mt-14` đến `-mt-24`), `relative z-20` đâm xuyên qua các section lân cận và đè lên background layers.
- **Scroll Hijacking (Framer Motion 3D Mapping)**:
  - Container cha có chiều cao kéo dài (`190vh` - `220vh`).
  - Container con cố định màn hình `sticky top-0 h-screen overflow-hidden perspective-[1400px]`.
  - Mapping tiến độ cuộn chuột `useScroll({ target: containerRef })` qua `useTransform` vào các hiệu ứng:
    - `clipPath`: Quét màn mở dần hoặc mở theo hình khối.
    - `scale`: Thu nhỏ/phóng to mượt mà (`0.88 -> 1.0 -> 0.94`).
    - `rotateX` / `rotateY`: Xoay 3D tạo chiều sâu không gian.
    - `yContent`: Đẩy nội dung trượt lướt mượt mà.
- **Parallax Chiều Sâu Trục Z**:
  - Layer 0 (Background Image): Cuộn trễ hơn 50% so với tốc độ cuộn chuột.
  - Layer 1 (Nội dung chính): Hiển thị sắc nét, tương phản cao.
  - Layer Decorative: Các hạt ánh sáng, HUD grid, và liquid blobs bay lơ lửng ngược chiều.

### 9.2. Phân Hệ Hiệp Hội Doanh Nhân (CEO 1983)
- **Biểu Tượng Thương Hiệu Chính Thức**: `/ceo1983-logo.png` (Hình ảnh số 1) áp dụng đồng bộ toàn bộ app hiệp hội.
- **Tách Biệt Xác Thực**: 
  - URL đăng nhập ViOne: `/auth/mobile`.
  - URL đăng nhập Hiệp hội CEO 1983: `/association/login` (Giao diện riêng biệt, màu sắc đại diện Sapphire & Gold).
- **Cài Đặt & Ảnh Đại Diện (`/association/settings`)**:
  - Route độc lập, loại bỏ việc bấm nút Cài đặt bị chuyển hướng về ViOne.
  - Upload avatar trực tiếp lên MinIO bucket `vione-media` / `avatars`, đồng bộ tự động qua 3 bảng `user_profiles`, `business_identities`, `vione_users`.
- **Nhắn Tin & Thẻ Thao Tác Trực Tiếp (`/association/messages`)**:
  - Nhắn tin 1-1 với hội viên hiệp hội, chọn hội viên khởi tạo chat.
  - Thẻ Hành Động Thanh Toán (`[action:payment|...]`): Tự động hiển thị thẻ VietQR với số tiền, nội dung, hạn nộp, nút mở popup quét mã QR và tải ảnh QR.
  - Thẻ Hành Động Cuộc Họp (`[action:meeting|...]`): Hiển thị thẻ thư mời họp với thời gian, địa điểm, và nút bấm xác nhận tham gia trực tiếp.
- **Kết Nối Hội Viên 2 Chiều (`/association/members`)**:
  - 3 Tab quản lý: "Tất cả", "Bạn bè", "Đang chờ kết nối".
  - Đầy đủ tính năng gửi lời mời, hủy lời mời đã gửi, đồng ý kết nối, và hủy kết bạn 2 chiều.
  - Sửa lỗi notification nhận thông báo kết nối: Chuẩn hóa ép kiểu `memberRecipientId::text` và cơ chế fallback thông tin người gửi.

### 9.3. Đồng Bộ Thông Báo & Nhắc Phí Từ CRM
- Khi CRM gửi thông báo hoặc nhắc phí quá hạn:
  1. Ghi nhận vào `member_notifications` (App Hiệp hội).
  2. Ghi nhận vào `business_notifications` (App ViOne).
  3. Đẩy template tin nhắn tương tác `[action:payment|...]` vào bảng `messages` để hội viên có thể thao tác ngay trong hội thoại chat.

### 9.4. Chuẩn Hóa Thương Hiệu & Nút Bấm
- **Nút Lưu ViOne**: Nền đen mờ cao cấp (`bg-[#121214]`), viền vàng đồng mảnh (`border-[#D4AF37]/50`), chữ vàng đồng sáng (`text-[#F5E0A3]`), không dùng nền xanh đen.
- **Logo ViOne**: Loại bỏ path chữ 'v' lồng bên trong chữ 'O' tại component `ViOneLogo.tsx`.
