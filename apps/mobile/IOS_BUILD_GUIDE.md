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

### Cách A: Build & Tự Động Đẩy Lên App Store Connect (Khuyên Dùng)

Chạy lệnh:

```bash
npm run build:ios:submit
# Tương đương: npx eas-cli build --profile production --platform ios --auto-submit
```

- EAS CLI sẽ hỏi bạn xác thực tài khoản Apple Developer (nếu chưa lưu credentials). Bạn chỉ cần đăng nhập tài khoản Apple Developer của mình.
- EAS sẽ tự động tạo Certificate, Provisioning Profile, biên dịch file `.ipa` và **tự động upload lên TestFlight / App Store Connect**.
- Sau khoảng 10 - 15 phút, bản build sẽ hiển thị trong tab **TestFlight** trên App Store Connect.

### Cách B: Chỉ Build file iOS `.ipa` trên Cloud (Chưa upload)

```bash
npm run build:ios:prod
```

Nếu muốn nộp file đã build lên App Store Connect sau:

```bash
npm run submit:ios
```

---

## 4. Tóm Tắt Các Lệnh Nhanh

| Mục tiêu | Lệnh chạy (tại `apps/mobile`) | Kết quả |
| :--- | :--- | :--- |
| **Đăng nhập Expo** | `npx eas-cli login` | Đăng nhập tài khoản Expo |
| **Xuất Android APK (Cloud)** | `npm run build:apk` | Trả link tải file `.apk` cài trực tiếp |
| **Xuất Android APK (Máy thật)** | `npm run build:apk:local` | Tạo file `.apk` trong thư mục `android/app/build/...` |
| **Build & Upload iOS** | `npm run build:ios:submit` | Đẩy trực tiếp lên App Store Connect / TestFlight |
| **Build iOS Production** | `npm run build:ios:prod` | Xuất bản iOS Production trên EAS Cloud |
| **Đồng bộ code web sang mobile** | `npm run sync` | Cập nhật UI mới nhất từ FE sang Capacitor |
