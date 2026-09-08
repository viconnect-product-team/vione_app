# TÀI LIỆU KỸ THUẬT, DANH MỤC API & QUY TRÌNH BUILD TRIỂN KHAI VIONE
## VIONE PLATFORM — TECHNICAL SPECIFICATION & API CATALOG

---

## 📌 MỤC LỤC
1. [KIẾN TRÚC TỔNG THỂ HỆ THỐNG (SYSTEM ARCHITECTURE)](#1-kiến-trúc-tổng-thể-hệ-thống)
2. [DANH MỤC API BACKEND CHI TIẾT (API REFERENCE CATALOG)](#2-danh-mục-api-backend-chi-tiết)
   - 2.1. Phân hệ Xác thực & Quản lý Phiên (Auth & Session APIs)
   - 2.2. Phân hệ Quản lý & Xét duyệt Hội viên (Members & Vetting APIs)
   - 2.3. Phân hệ Danh tính số & Kết nối NFC (Identity & NFC APIs)
   - 2.4. Phân hệ Quét danh thiếp AI & OCR (Card Scan & OCR APIs)
   - 2.5. Phân hệ Giao thương B2B & Cơ hội (B2B Opportunities APIs)
   - 2.6. Phân hệ Lịch hẹn 1-on-1 (Business Meetings APIs)
   - 2.7. Phân hệ Sự kiện & Điểm danh Check-in (Events & Check-in APIs)
   - 2.8. Phân hệ Tin nhắn Thời gian thực & WebSocket (Realtime Messaging)
   - 2.9. Phân hệ Quản trị Nền tảng & Leads (Platform Admin & Demo Leads)
3. [QUY TRÌNH BIÊN DỊCH & ĐÓNG GÓI ỨNG DỤNG (BUILD & DEPLOYMENT)](#3-quy-trình-biên-dịch--đóng-gói-ứng-dụng)
   - 3.1. Quy trình Build Android APK (Capacitor & Gradle)
   - 3.2. Cấu hình Native NFC ForegroundDispatch trên Android
   - 3.3. Quy trình Build & Triển khai Frontend Web
   - 3.4. Quy trình Khởi chạy & Triển khai Backend NestJS
4. [KIẾN TRÚC ĐA NGÔN NGỮ (I18N ARCHITECTURE)](#4-kiến-trúc-đa-ngôn-ngữ)
5. [HƯỚNG DẪN TẠO TEMPLATE LANDING CHO KHÁCH HÀNG MỚI](#5-hướng-dẫn-tạo-template-landing-cho-khách-hàng-mới)

---

# 1. KIẾN TRÚC TỔNG THỂ HỆ THỐNG

ViOne được xây dựng theo mô hình **Monorepo** hiện đại, tối ưu hiệu năng và khả năng mở rộng đa nền tảng:

```
vione_app/
├── apps/
│   ├── vione_app_fe/        # Frontend: TanStack Start / React / Vite / TailwindCSS / Nitro SSR
│   ├── vione_app_be/        # Backend: NestJS / Prisma ORM / WebSockets / JWT / Passport
│   └── mobile/              # Mobile App: Capacitor Android & iOS Native Wrapper
├── packages/
│   ├── db/                  # Database Schema, Seed scripts & Migrations
│   └── shared/              # Shared Types, DTOs & Locales (vi, en, ja, ko, zh, lo, km, my)
└── document/                # Tài liệu kỹ thuật, BRD, SRS, API Spec & User Manual
```

---

# 2. DANH MỤC API BACKEND CHI TIẾT

Toàn bộ API yêu cầu Header chuẩn:
```http
Content-Type: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>
x-tenant-id: <TENANT_SLUG_OR_UUID>  (Tùy chọn cho môi trường Multi-tenant)
```

---

## 2.1. Phân hệ Xác thực & Quản lý Phiên (Auth & Session APIs)

### `POST /auth/login`
- **Mô tả**: Đăng nhập bằng email/số điện thoại và mật khẩu.
- **Request Body**:
  ```json
  {
    "username": "ceo@company.vn",
    "password": "SecurePassword123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr_98a72b1c",
      "email": "ceo@company.vn",
      "fullName": "Nguyễn Văn A",
      "role": "MEMBER",
      "memberCode": "CEO83-088"
    }
  }
  ```

### `POST /auth/register`
- **Mô tả**: Đăng ký tài khoản doanh nhân mới.
- **Request Body**:
  ```json
  {
    "name": "Nguyễn Văn A",
    "username": "ceo@company.vn",
    "password": "SecurePassword123"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Đăng ký thành công",
    "userId": "usr_98a72b1c"
  }
  ```

### `POST /auth/google` & `POST /auth/apple`
- **Mô tả**: Xác thực Single Sign-On (SSO) qua Google Id Token hoặc Apple Authorization Code.

---

## 2.2. Phân hệ Quản lý & Xét duyệt Hội viên (Members & Vetting APIs)

### `GET /members`
- **Mô tả**: Lấy danh sách hội viên (hỗ trợ phân trang, lọc theo chi hội, trạng thái).
- **Query Params**: `page=1&limit=20&status=PENDING&industry=TECH&search=Nguyen`
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "mem_01",
        "code": "CEO83-088",
        "name": "Nguyễn Văn A",
        "company": "Tập đoàn Công nghệ ABC",
        "title": "Chủ tịch HĐQT",
        "status": "PENDING",
        "revenueScale": "50-200",
        "industry": "Công nghệ & Chuyển đổi số",
        "createdAt": "2026-09-08T10:00:00Z"
      }
    ],
    "total": 128
  }
  ```

### `POST /members/:id/approve`
- **Mô tả**: Ban Điều Hành phê duyệt đơn gia nhập của hội viên.
- **Request Body**:
  ```json
  {
    "memberCode": "CEO83-088",
    "branchId": "branch_north",
    "tier": "OFFICIAL",
    "notifyEmail": true
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "memberId": "mem_01",
    "status": "ACTIVE",
    "approvedAt": "2026-09-08T14:30:00Z"
  }
  ```

---

## 2.3. Phân hệ Danh tính số & Kết nối NFC (Identity & NFC APIs)

### `GET /connect-app/me/identity`
- **Mô tả**: Lấy toàn bộ dữ liệu danh tính số của chính chủ sở hữu.
- **Response `200 OK`**:
  ```json
  {
    "personId": "psn_7718",
    "displayName": "Đặng Văn Thành",
    "title": "Chủ tịch HĐQT",
    "companyName": "TTC Group",
    "bio": "Hội đồng Doanh nhân Việt Nam",
    "primaryPhone": "0912345678",
    "primaryEmail": "thanh.dang@ttc.vn",
    "avatarUrl": "https://cdn.vione.vn/avatars/thanh.jpg",
    "nfcActive": true,
    "shareLink": "https://vione.vn/c/t-881a29f"
  }
  ```

### `POST /connect-app/identity/tap`
- **Mô tả**: Xử lý chạm kết nối NFC / Quét mã QR danh thiếp giữa 2 thiết bị.
- **Request Body**:
  ```json
  {
    "token": "t-881a29f"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "ok": true,
    "reason": "created",
    "profile": {
      "personId": "psn_7718",
      "displayName": "Đặng Văn Thành",
      "title": "Chủ tịch HĐQT",
      "companyName": "TTC Group",
      "connectedAt": "2026-09-08T14:35:10Z"
    }
  }
  ```

---

## 2.4. Phân hệ Quét danh thiếp AI & OCR (Card Scan & OCR APIs)

### `POST /connect-app/card-scan`
- **Mô tả**: Tải ảnh danh thiếp giấy lên để AI trích xuất thông tin.
- **Request Body**: Form Data chứa `image` (JPEG/PNG) hoặc Base64 Payload.
- **Response `200 OK`**:
  ```json
  {
    "scanId": "scan_44910",
    "candidate": {
      "fullName": "Trần Minh Trang",
      "title": "Phó Chủ tịch",
      "company": "CEO 1983 Club",
      "phone": "0987654321",
      "email": "trang.tran@ceo1983.vn",
      "website": "https://ceo1983.vn",
      "overallConfidence": 0.96
    }
  }
  ```

### `POST /connect-app/card-scan/save`
- **Mô tả**: Xác nhận lưu danh thiếp đã OCR vào Danh bạ đối tác.

---

## 2.5. Phân hệ Giao thương B2B & Cơ hội (B2B Opportunities APIs)

### `POST /connect-app/opportunities`
- **Mô tả**: Đăng tin nhu cầu Mua / Bán mới.
- **Request Body**:
  ```json
  {
    "type": "DEMAND",
    "title": "Tìm nhà cung cấp bao bì carton xuất khẩu",
    "description": "Cần cung ứng 50,000 thùng carton 5 lớp đạt tiêu chuẩn EU",
    "budget": "500,000,000 VND",
    "deadline": "2026-10-15T00:00:00Z",
    "region": "Miền Bắc"
  }
  ```

---

## 2.6. Phân hệ Lịch hẹn 1-on-1 (Business Meetings APIs)

### `POST /connect-app/meetings`
- **Mô tả**: Đề xuất cuộc hẹn 1-on-1 với đối tác.
- **Request Body**:
  ```json
  {
    "targetPersonId": "psn_9921",
    "title": "Trao đổi hợp tác phân phối độc quyền",
    "description": "Gặp mặt tại trụ sở hoặc qua Google Meet",
    "timeSlots": [
      { "start": "2026-09-10T09:00:00Z", "end": "2026-09-10T10:00:00Z" }
    ]
  }
  ```

---

## 2.7. Phân hệ Sự kiện & Điểm danh (Events & Check-in APIs)

### `POST /checkin/scan`
- **Mô tả**: Ban lễ tân quét QR/NFC đại biểu tại cổng sự kiện.
- **Request Body**:
  ```json
  {
    "eventId": "evt_gala_2026",
    "qrCode": "TICKET-HV83-9912"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "attendee": {
      "name": "Lê Hoàng Nam",
      "company": "Young Entrepreneurs Group",
      "seatNumber": "VIP-A08",
      "checkinTime": "2026-09-08T18:15:00Z"
    }
  }
  ```

---

# 3. QUY TRÌNH BIÊN DỊCH & ĐÓNG GÓI ỨNG DỤNG (BUILD & DEPLOYMENT)

## 3.1. Quy trình Build Android APK (Capacitor & Gradle)

Để đóng gói file APK Android hoàn chỉnh, thực hiện tuần tự các lệnh sau tại thư mục gốc của dự án:

```powershell
# Bước 1: Build gói web tĩnh cho Frontend
npm --prefix apps/vione_app_fe run build

# Bước 2: Đồng bộ web assets vào dự án Android của Capacitor
npm --prefix apps/mobile run sync:android

# Bước 3: Biên dịch file APK bằng Gradle Wrapper
cmd /c "cd /d apps\mobile\android && gradlew.bat assembleDebug"
```

File APK kết quả nằm tại:
`apps/mobile/android/app/build/outputs/apk/debug/ViOne-Connect-v1.0-debug.apk`

---

## 3.2. Cấu hình Native NFC ForegroundDispatch trên Android
Để ứng dụng đọc thẻ NFC nhạy trên 100% các dòng điện thoại Android:
1. File [MainActivity.java](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/mobile/android/app/src/main/java/com/vione/app/MainActivity.java) đã được lập trình sẵn `NfcAdapter.enableForegroundDispatch` để bắt tín hiệu NDEF khi thẻ NFC áp sát.
2. File [AndroidManifest.xml](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/mobile/android/app/src/main/AndroidManifest.xml) đã khai báo quyền:
   ```xml
   <uses-permission android:name="android.permission.NFC" />
   <uses-feature android:name="android.hardware.nfc" android:required="false" />
   ```
3. File [nfc_tech_filter.xml](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/mobile/android/app/src/main/res/xml/nfc_tech_filter.xml) hỗ trợ toàn bộ các định dạng thẻ: `Ndef`, `NdefFormatable`, `NfcA`, `NfcB`, `IsoDep`.

---

# 4. KIẾN TRÚC ĐA NGÔN NGỮ (I18N ARCHITECTURE)

Hệ thống lưu trữ từ điển bản địa hóa tại `packages/shared/locales/`:
- `vi.json` (Tiếng Việt - Ngôn ngữ gốc)
- `en.json` (English)
- `ja.json` (日本語 - Tiếng Nhật)
- `ko.json` (한국어 - Tiếng Hàn)
- `zh.json` (中文 - Tiếng Trung)
- `lo.json` (ພາສາລາວ - Tiếng Lào)
- `km.json` (ភាសាខ្មែរ - Tiếng Khmer)
- `my.json` (မြန်မာဘာသာ - Tiếng Myanmar)

Sử dụng hook chuẩn trong React:
```tsx
import { useT, useLang } from "@/lib/i18n";

function MyComponent() {
  const t = useT();
  const { lang, setLang } = useLang();
  return <h1>{t("landing.bc.hero.title")}</h1>;
}
```

---

# 5. HƯỚNG DẪN TẠO TEMPLATE LANDING CHO KHÁCH HÀNG MỚI

Khi cần tạo thêm một Landing Page cho một Hiệp hội Doanh nghiệp mới:

1. Import [AssociationLandingTemplate.tsx](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/vione_app_fe/src/components/landing/templates/AssociationLandingTemplate.tsx).
2. Khởi tạo route mới tại `apps/vione_app_fe/src/routes/landing.<tenant>.tsx`.
3. Điền các thông số:
   - `brand`: Tên hiệp hội, Logo, Tagline.
   - `themeVariant`: `"cyber"` (công nghệ hiện đại) hoặc `"luxury"` (sang trọng ánh kim).
   - `hero`: Tiêu đề, số liệu thống kê.
   - `challenges`: 5 nỗi đau thực trạng.
   - `solutions`: 9 module giải pháp.
   - `ecosystem`: Các node liên kết trong mạng lưới.
   - `partners`: Các đối tác bảo trợ.
   - `testimonials`: Đánh giá của Ban lãnh đạo.
   - `ctaBanner`: Kêu gọi hành động và tải ứng dụng.
