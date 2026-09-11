# Hướng Dẫn Build & Xuất Bản Mobile ViOne (Android APK & iOS App Store Connect)

Tài liệu này hướng dẫn chi tiết quy trình xuất file **Android APK** và bản build **iOS (TestFlight / App Store Connect)** cho dự án **ViOne**, đồng bộ chính xác với cấu hình hệ thống của bạn:

- **Tên App trên Apple App Store**: `Vione`
- **Bundle Identifier**: `ViOneBusinessConnect`
- **Apple ID (App Store Connect ID)**: `6810608093`
- **SKU**: `vione-app`
- **Tài khoản Expo**: `unicom-vibe-coding-team`
- **Expo Slug**: `vione`

---

## 1. Cài Đặt & Đăng Nhập EAS CLI

Mở Terminal tại thư mục `apps/mobile`:

```powershell
cd d:\download\VICONNECT\VIONE_PROJECT\vione_app\apps\mobile
```

Đăng nhập tài khoản Expo của bạn (`unicom-vibe-coding-team`):

```bash
npx eas-cli login
```

Kiểm tra trạng thái đăng nhập:

```bash
npx eas-cli whoami
```

---

## 2. Xuất File Android APK

Bạn có **2 lựa chọn** để xuất file `.apk`:

### Cách A: Xuất APK qua Expo EAS Cloud (Tải trực tiếp bằng link / mã QR)
Dùng hạ tầng build của Expo để tạo file APK độc lập cài được ngay cho mọi thiết bị Android:

```bash
npm run build:apk
# Tương đương: npx eas-cli build --profile preview --platform android
```
- Quá trình build chạy trên Cloud của Expo.
- Sau khi hoàn thành, Terminal sẽ trả về **URL tải file `.apk`** và mã QR để quét tải trực tiếp về điện thoại Android.

### Cách B: Xuất APK Cục Bộ Ngay Trên Máy Windows (Không cần chờ Cloud, không lo tài khoản Expo)
Vì máy bạn đã có sẵn Java 21 và Gradle, bạn có thể build APK siêu tốc ngay trên máy:

```bash
npm run build:apk:local
```
- Lệnh này sẽ tự động đóng gói web tĩnh mới nhất và chạy Gradle compile.
- File APK được tạo ra ngay tại:
  `apps/mobile/android/app/build/outputs/apk/debug/ViOne-Connect-v1.0-debug.apk`

---

## 3. Xuất Bản iOS & Đẩy Lên App Store Connect / TestFlight

App của bạn đã có sẵn thông tin trên App Store Connect:
- **Bundle ID**: `ViOneBusinessConnect`
- **Apple ID**: `6810608093`

### Cách A: Build File iOS `.ipa` trên Cloud (Khuyên dùng hiện tại vì đã có chứng chỉ trên Web)

Vì bạn đã cấu hình **Valid** (Màu xanh) cho Distribution Certificate & Provisioning Profile trên Expo Web, bạn chỉ cần chạy:

```bash
npm run build:ios:prod
# Tương đương: npx eas-cli build --profile production --platform ios
```

- EAS CLI sẽ tự động lấy chứng chỉ trên Expo Cloud mà **KHÔNG hỏi mật khẩu Apple ID**.
- Nén và đẩy mã nguồn lên hệ thống macOS Cloud của Expo để biên dịch file `.ipa`.
- Khi xong, bạn sẽ có link tải file `.ipa` chuẩn Production.

### Cách B: Nộp File Lên App Store Connect / TestFlight
Sau khi build xong file IPA hoặc nếu muốn EAS tự động nộp:

```bash
npm run submit:ios
```
*(Nếu muốn tự động hoàn toàn mà không cần nhập mật khẩu, cấu hình thêm App Store Connect API Key trên Expo Web).*

---

## 4. Tóm Tắt Các Lệnh Nhanh

| Mục tiêu | Lệnh chạy (tại `apps/mobile`) | Ghi chú |
| :--- | :--- | :--- |
| **Build iOS Production (.ipa)** | `npm run build:ios:prod` | **Khuyên dùng** - Dùng chứng chỉ xanh trên Expo Cloud |
| **Xuất Android APK (Máy thật)** | `npm run build:apk:local` | **Siêu tốc (~25s)** - Ra file APK cài trực tiếp trên Android |
| **Xuất Android APK (Cloud)** | `npm run build:apk` | Build qua Expo Cloud trả link tải & QR Code |
| **Đồng bộ code web sang mobile** | `npm run build:static` | Đóng gói bản web FE mới nhất và nạp vào Android/iOS |
| **Kiểm tra đăng nhập Expo** | `npx eas-cli whoami` | Kiểm tra tài khoản Expo đang liên kết |
