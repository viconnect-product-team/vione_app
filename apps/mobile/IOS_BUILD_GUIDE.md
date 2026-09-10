# Hướng Dẫn Build & Xuất Bản Ứng Dụng iOS ViOne (TestFlight & App Store Connect)

Tài liệu này hướng dẫn chi tiết từng bước để tạo bản build **iOS (Development / TestFlight / App Store Connect)** cho ứng dụng **Vione**:
- **Tên App trên Apple Store**: `Vione`
- **Bundle Identifier (Apple Developer)**: `ViOneBusinessConnect`
- **Apple ID (App Store Connect ID)**: `6810608093`
- **SKU**: `vione-app`
- **Tài khoản Expo**: `unicom-vibe-coding-team`
- **Slug**: `vione`

> [!IMPORTANT]
> **Điền thông tin trên giao diện Expo (Hình 4)**:
> Khi Expo hỏi **"Choose bundle identifier"** tại đường link `expo.dev/accounts/unicom-vibe-coding-team/projects/vione/credentials/ios/new`:
> 👉 Bạn hãy nhập chính xác: **`ViOneBusinessConnect`** rồi nhấn **Save / Continue**.

---

## 1. Chuẩn Bị & Cài Đặt Công Cụ

Cài đặt công cụ dòng lệnh EAS CLI (Expo Application Services) nếu máy bạn chưa có:

```bash
npm install -g eas-cli
```

Đăng nhập vào tài khoản Expo của bạn:

```bash
eas login
```

---

## 2. Các Lệnh Build iOS

Di chuyển vào thư mục `apps/mobile`:

```bash
cd d:\download\VICONNECT\VIONE_PROJECT\vione_app\apps\mobile
```

### Cách A: Build Bản Test Nội Bộ / Máy Thật (Expo Dev Client)
Dùng để kiểm thử chức năng trực tiếp trên iPhone của lập trình viên mà không cần đẩy lên Apple Store:

```bash
npm run build:ios:dev
# hoặc: eas build --profile development --platform ios
```

- Hệ thống EAS sẽ tự động tạo provisioning profile nội bộ và biên dịch file `.ipa`.
- Sau khi build hoàn tất trên cloud, EAS sẽ cung cấp **mã QR** và đường link để bạn cài đặt trực tiếp lên iPhone test.

---

### Cách B: Build Bản Production & Nộp Lên App Store Connect / TestFlight

#### Bước 1: Khởi tạo ứng dụng trên App Store Connect
1. Truy cập [App Store Connect](https://appstoreconnect.apple.com).
2. Tạo App mới với Bundle ID là: `com.vione.app`.
3. Tên ứng dụng: `ViOne Connect` (hoặc `Vione Business Connect`).
4. Lấy Apple Team ID và App Store Connect App ID (Apple ID số).

#### Bước 2: Điền thông tin vào `eas.json` (phần submit)
Mở file `apps/mobile/eas.json` và cập nhật các trường:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "email-apple-id-cua-ban@gmail.com",
      "ascAppId": "1234567890",
      "appleTeamId": "XXXXXXXXXX"
    }
  }
}
```

#### Bước 3: Chạy lệnh Build và Tự động Submit
Chạy lệnh sau để EAS build trên Cloud và tự động upload lên TestFlight:

```bash
eas build --profile production --platform ios --auto-submit
```

- Hoặc nếu đã có sẵn file build trên EAS và chỉ muốn nộp lên Store:
```bash
npm run submit:ios
# hoặc: eas submit --platform ios
```

---

## 3. Cách Phụ: Build Trực Tiếp Qua Xcode Trên Máy Mac

Nếu bạn đang ngồi máy Mac và muốn build bằng Xcode nội bộ:

1. Đồng bộ web assets sang iOS:
```bash
npm run sync:ios
```
2. Mở dự án iOS trong Xcode:
```bash
npm run open:ios
```
3. Trong Xcode:
   - Chọn Signing & Capabilities -> Chọn Team Apple Developer của bạn.
   - Chọn mục tiêu thiết bị: `Any iOS Device (arm64)`.
   - Vào menu **Product -> Archive**.
   - Sau khi Archive xong, Organizer sẽ hiện lên -> Bấm **Distribute App -> App Store Connect -> Upload**.
   - Sau 10-15 phút, bản build sẽ sẵn sàng trên **TestFlight** để mời người dùng trải nghiệm!
