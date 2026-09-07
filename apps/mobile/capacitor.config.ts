import type { CapacitorConfig } from '@capacitor/cli';

/**
 * =========================================================================
 * VIONE MOBILE - CẤU HÌNH CAPACITOR THEO MÔI TRƯỜNG
 * =========================================================================
 *
 * [CHẾ ĐỘ HIỆN TẠI] DEV LIVE SERVER:
 * - Đang bật `server.url` trỏ về IP Dev (14.225.217.232:5000).
 * - Sửa giao diện/logic FE chỉ cần deploy lên server dev là APK tự đổi, không cần build lại.
 *
 * [HƯỚNG A] ĐÓNG GÓI TĨNH STANDALONE / OFFLINE (Ý ANH QUẢN LÝ):
 * - Đổi `USE_REMOTE_SERVER = false` bên dưới (hoặc comment khối server).
 * - Chạy: `npm run build:static` (hoặc build FE rồi chạy `npx cap sync android`).
 * - Mở Android Studio build lại file APK. Toàn bộ code sẽ nằm cố định trong APK.
 *
 * [HƯỚNG B] PRODUCTION QUA DOMAIN HTTPS CHÍNH THỨC:
 * - Đổi `USE_REMOTE_SERVER = true`.
 * - Đổi `REMOTE_URL` thành domain production chính thức có SSL (ví dụ: 'https://app.vione.vn').
 * - Đổi `CLEARTEXT = false`.
 * =========================================================================
 */

// BẬT / TẮT CHẾ ĐỘ REMOTE SERVER:
// - true: App load từ server web (Dev Live / Production Domain)
// - false: App chạy offline hoàn toàn từ bundle đóng gói trong APK (Hướng A)
const USE_REMOTE_SERVER = true;

// Cấu hình URL khi dùng Remote Server:
const REMOTE_URL = 'http://14.225.217.232:5000'; // Server Dev hiện tại
// const REMOTE_URL = 'https://app.vione.vn';    // Mở dòng này khi dùng domain Production (Hướng B)

const CLEARTEXT = true; // Đổi thành false nếu dùng HTTPS domain

const config: CapacitorConfig = {
  appId: 'com.vione.app',
  appName: 'Vione Business Connect',

  // Khi đóng gói tĩnh (Hướng A), Capacitor sẽ lấy toàn bộ static assets từ thư mục này
  webDir: USE_REMOTE_SERVER ? 'www' : '../vione_app_fe/.output/public',

  ...(USE_REMOTE_SERVER
    ? {
        server: {
          url: REMOTE_URL,
          cleartext: CLEARTEXT
        }
      }
    : {})
};

export default config;

