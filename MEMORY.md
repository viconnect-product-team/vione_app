# System Memory & Architecture

## 1. Current State
- **Frontend**: TanStack React Start, running correctly with React 19, TailwindCSS 4, and Radix UI.
- **Backend**: NestJS API with Prisma ORM. Ported core business card model logic from frontend.
- **Mobile app**: Cấu hình native Capacitor được đặt tại `apps/vione_app_mobile/` và cấu hình ứng dụng web được thiết lập đổi tên định danh thành `vione_app` (appName: `vione_app`, appId: `connect.vn.vione_app`).
- **Deployment**: Quy trình deploy chạy thông qua [fast-deploy.ps1](file:///d:/download/IT_CODE_DATA/vione_app/fast-deploy.ps1) lên server Linux (`14.225.217.232`).
- **Styling System**: Tích hợp phong cách thiết kế màu nâu ấm / ánh vàng (champagne gold) sang trọng từ mẫu UNICOM Dashboard vào hệ thống CSS Token (`.vione-tone` và `.bc-app`) của ứng dụng, bổ sung hiệu ứng kính mờ (glassmorphism), lưới nền mờ và hoạt ảnh nhấp nháy.

## 2. Architectural Decisions (ADR)
- **Monorepo Strategy**: Turborepo is used to orchestrate `@vibe/vione_app_fe`, `@vibe/vione_app_be` (NestJS), `@vibe/vione_app_mobile`, and `@vibe/db`.
- **Backend Replacement**: Moving from direct Supabase calls in the frontend to a dedicated NestJS backend using Prisma for data access.
- **Deployment Strategy**: 
  - To prevent OOM (Out Of Memory) issues on the server during Docker builds, the frontend is built locally on Windows with increased memory limit (`--max-old-space-size=8192`).
  - Docker images are saved as `.tar` archives, transferred via SCP, and loaded on the remote server via SSH.
  - Tên định danh dự án thống nhất dùng `vione_app` cho toàn bộ các khâu biên dịch, đóng gói và chạy Docker.

## 3. Server & Docker Configuration
- **Port Mapping**:
  - **Frontend** (`app_frontend_prod`): Host `5000` -> Container `8080`.
  - **Backend** (`app_backend_prod`): Host `5001` -> Container `4000`.
- **Networking**: Both containers use the `target_network` bridge network.
- **Environment Variables**: No env vars are hardcoded. `.env.production` is SCP'd to the server and renamed to `.env`, which `docker-compose.clean.yml` relies on.

## 4. Caveats & Gotchas
- **Database Permissions**: The production DB (`jdbc:postgresql://113.20.107.184:6432/postgres`) currently has a known permission issue `42501` for the role `app1`.
- **Line Endings (CRLF vs LF)**: Windows `.env` and `docker-compose.yml` files are transferred to a Linux server. The deployment script uses `sed -i 's/\r//g'` to fix line endings remotely. Ensure files are saved with LF line endings if modifying them directly on the server.
- **Prisma Schema vs NestJS**: The users schema in `packages/db/prisma/schema.prisma` is minimal (`id`, `username`, `password`). When generating or migrating code, ensure that legacy fields (like `password_salt` or `email`) are not assumed unless explicitly added to the Prisma schema.
- **Database Types**: BigInt vs String types in DB IDs have caused issues in the past. Standardize on String for IDs.
- **Relative URL for Assets**: Absolute URLs like `window.location.origin/api/...` cause issues when changing domains or ports (CORS/localhost conflicts). Always use relative paths (e.g. `/api/...`) for endpoints like avatar upload and retrieval.

## 5. Troubleshooting & Bug Fixes Log

| Váº¥n Ä‘á» / Lá»—i gáº·p pháº£i (Issue) | NguyĂªn nhĂ¢n gá»‘c rá»… (Root Cause) | Giáº£i phĂ¡p / CĂ¡ch fix triá»‡t Ä‘á»ƒ (Solution) | CĂ¡ch phĂ²ng trĂ¡nh (Prevention) |
| :--- | :--- | :--- | :--- |
| **Backend crash / Máº¥t UI** cĂ¡c trang (Trang chá»§, TĂ´i...) trĂªn Server Dev máº·c dĂ¹ API tráº£ vá» 200. | `Dockerfile.frontend` á»Ÿ root sá»­ dá»¥ng `node:20-alpine`, khĂ´ng há»— trá»£ `WebSocket` toĂ n cá»¥c trĂªn server. CĂ¡c server function hoáº·c middleware Supabase/realtime gá»i `globalThis.WebSocket` bá»‹ lá»—i `undefined`. | NĂ¢ng cáº¥p cáº£ `Dockerfile.frontend` vĂ  `Dockerfile.backend` lĂªn sá»­ dá»¥ng base image `node:22-alpine` (há»— trá»£ native WebSocket máº·c Ä‘á»‹nh). | LuĂ´n Ä‘á»“ng nháº¥t phiĂªn báº£n Node.js (phiĂªn báº£n 22+ LTS) giá»¯a mĂ´i trÆ°á»ng local phĂ¡t triá»ƒn vĂ  container runtime. |
| **Lá»—i kĂ©o áº£nh Node 22 (Internal Server Error 500)** khi cháº¡y script deploy: `failed to fetch oauth token... 500`. | Docker Hub gáº·p sá»± cá»‘ káº¿t ná»‘i táº¡m thá»i hoáº·c cache thĂ´ng tin xĂ¡c thá»±c (session token) cá»§a Docker Desktop bá»‹ lá»—i/háº¿t háº¡n. | Cháº¡y `docker logout` Ä‘á»ƒ xĂ³a cache session lá»—i vĂ  táº£i á»Ÿ cháº¿ Ä‘á»™ náº·c danh, hoáº·c cháº¡y `docker pull node:22-alpine` thá»§ cĂ´ng trÆ°á»›c, hoáº·c restart Docker Desktop. | ÄÄƒng xuáº¥t Docker Hub cá»¥c bá»™ náº¿u khĂ´ng sá»­ dá»¥ng private registry Ä‘á»ƒ trĂ¡nh kiá»ƒm tra token xĂ¡c thá»±c. |
| **KhĂ´ng lÆ°u Ä‘Æ°á»£c Cookie auth trĂªn Server Dev (HTTP)**, ngÆ°á»i dĂ¹ng liĂªn tá»¥c bá»‹ vÄƒng Ä‘Äƒng nháº­p. | Thuá»™c tĂ­nh Cookie `secure` Ä‘Æ°á»£c báº­t cá»©ng (`SameSite=Lax; secure`) trong `AuthContext.tsx` vĂ  `auth.tsx`, khiáº¿n trĂ¬nh duyá»‡t cháº·n khĂ´ng lÆ°u cookie khi cháº¡y qua HTTP (`http://14.225.217.232:5000`). | Äá»•i thĂ nh set thuá»™c tĂ­nh `secure` Ä‘á»™ng: chá»‰ báº­t khi giao thá»©c káº¿t ná»‘i thá»±c táº¿ lĂ  HTTPS (`window.location.protocol === 'https:'`). | KhĂ´ng Ä‘Æ°á»£c báº­t cá»©ng thuá»™c tĂ­nh `secure` cho cookie á»Ÿ cĂ¡c mĂ´i trÆ°á»ng phĂ¡t triá»ƒn/testing cháº¡y qua cá»•ng HTTP thĂ´ng thÆ°á»ng. |
| **KhĂ´ng truy cáº­p Ä‘Æ°á»£c Frontend tá»« ngoĂ i Host** (Connection Refused). | Nitro / Node server máº·c Ä‘á»‹nh chá»‰ bind tá»›i `127.0.0.1` (localhost) bĂªn trong container, khiáº¿n docker daemon khĂ´ng thá»ƒ Ă¡nh xáº¡ cá»•ng. | ThĂªm biáº¿n mĂ´i trÆ°á»ng `HOST=0.0.0.0` vĂ  `NITRO_HOST=0.0.0.0` vĂ o cáº¥u hĂ¬nh service trong `docker-compose.clean.yml`. | LuĂ´n cáº¥u hĂ¬nh Host/Bind Address cho má»i web server cháº¡y trong Docker lĂ  `0.0.0.0`. |
| **Lá»—i biĂªn dá»‹ch / trĂ¹ng láº·p Vite plugins** khi build. | Khai bĂ¡o thá»§ cĂ´ng cĂ¡c plugin Vite (PWA, react, tailwind) trong `apps/vione_app_fe/vite.config.ts` Ä‘Ă¨ lĂªn preset cáº¥u hĂ¬nh trá»n gĂ³i `@lovable.dev/vite-tanstack-config`. | RĂºt gá»n `apps/vione_app_fe/vite.config.ts` vá» dáº¡ng cáº¥u hĂ¬nh trá»‘ng `export default defineConfig({})` Ä‘á»ƒ preset tá»± quáº£n lĂ½ plugin. | KhĂ´ng khai bĂ¡o trĂ¹ng cĂ¡c plugin Ä‘Ă£ Ä‘Æ°á»£c quáº£n lĂ½ bá»Ÿi preset cáº¥u hĂ¬nh chung. |
| **Backend crash / Máº¥t UI** cĂ¡c trang (Trang chá»§, TĂ´i...) trĂªn Server Dev máº·c dĂ¹ API tráº£ vá»  200. | `Dockerfile.frontend` á»Ÿ root sá»­ dá»¥ng `node:20-alpine`, khĂ´ng há»— trá»£ `WebSocket` toĂ n cá»¥c trĂªn server. CĂ¡c server function hoáº·c middleware Supabase/realtime gá» i `globalThis.WebSocket` bá»‹ lá»—i `undefined`. | NĂ¢ng cáº¥p cáº£ `Dockerfile.frontend` vĂ  `Dockerfile.backend` lĂªn sá»­ dá»¥ng base image `node:22-alpine` (há»— trá»£ native WebSocket máº·c Ä‘á»‹nh). | LuĂ´n Ä‘á»“ng nháº¥t phiĂªn báº£n Node.js (phiĂªn báº£n 22+ LTS) giá»¯a mĂ´i trÆ°á» ng local phĂ¡t triá»ƒn vĂ  container runtime. |
| **Lá»—i kĂ©o áº£nh Node 22 (Internal Server Error 500)** khi cháº¡y script deploy: `failed to fetch oauth token... 500`. | Docker Hub gáº·p sá»± cá»‘ káº¿t ná»‘i táº¡m thá» i hoáº·c cache thĂ´ng tin xĂ¡c thá»±c (session token) cá»§a Docker Desktop bá»‹ lá»—i/háº¿t háº¡n. | Cháº¡y `docker logout` Ä‘á»ƒ xĂ³a cache session lá»—i vĂ  táº£i á»Ÿ cháº¿ Ä‘á»™ náº·c danh, hoáº·c cháº¡y `docker pull node:22-alpine` thá»§ cĂ´ng trÆ°á»›c, hoáº·c restart Docker Desktop. | Ä Äƒng xuáº¥t Docker Hub cá»¥c bá»™ náº¿u khĂ´ng sá»­ dá»¥ng private registry Ä‘á»ƒ trĂ¡nh kiá»ƒm tra token xĂ¡c thá»±c. |
| **KhĂ´ng lÆ°u Ä‘Æ°á»£c Cookie auth trĂªn Server Dev (HTTP)**, ngÆ°á» i dĂ¹ng liĂªn tá»ục bá»‹ vÄƒng Ä‘Äƒng nháº­p. | Thuá»™c tĂ­nh Cookie `secure` Ä‘Æ°á» c báº­t cá»©ng (`SameSite=Lax; secure`) trong `AuthContext.tsx` vĂ  `auth.tsx`, khiáº¿n trĂ¬nh duyá»‡t cháº·n khĂ´ng lÆ°u cookie khi cháº¡y qua HTTP (`http://14.225.217.232:5000`). | Ä Ä•i thĂ nh set thuá»™c tĂ­nh `secure` Ä‘á»™ng: chá»‰ báº­t khi giao thá»©c káº¿t ná»‘i thá»±c táº¿ lĂ  HTTPS (`window.location.protocol === 'https:'`). | KhĂ´ng Ä‘Æ°á» c báº­t cá»©ng thuá»™c tĂ­nh `secure` cho cookie á»Ÿ cĂ¡c mĂ´i trÆ°á» ng phĂ¡t triá»ƒn/testing cháº¡y qua cá»•ng HTTP thĂ´ng thÆ°á» ng. |
| **KhĂ´ng truy cáº­p Ä‘Æ°á» c Frontend tá»« ngoĂ i Host** (Connection Refused). | Nitro / Node server máº·c Ä‘á»‹nh chá»‰ bind tá»›i `127.0.0.1` (localhost) bĂªn trong container, khiáº¿n docker daemon khĂ´ng thá»ƒ Ă¡nh xáº¡ cá»•ng. | ThĂªm biáº¿n mĂ´i trÆ°á» ng `HOST=0.0.0.0` vĂ  `NITRO_HOST=0.0.0.0` vĂ o cáº¥u hĂ¬nh service trong `docker-compose.clean.yml`. | LuĂ´n cáº¥u hĂ¬nh Host/Bind Address cho má» i web server cháº¡y trong Docker lĂ  `0.0.0.0`. |
| **Lá»—i biĂªn dá»‹ch / trĂ¹ng láº·p Vite plugins** khi build. | Khai bĂ¡o thá»§ cĂ´ng cĂ¡c plugin Vite (PWA, react, tailwind) trong `apps/vione_app_fe/vite.config.ts` Ä‘Ă¨ lĂªn preset cáº¥u hĂ¬nh trá» n gĂ³i `@lovable.dev/vite-tanstack-config`. | RĂºt gá» n `apps/vione_app_fe/vite.config.ts` vá»  dáº¡ng cáº¥u hĂ¬nh trá»‘ng `export default defineConfig({})` Ä‘á»ƒ preset tá»± quáº£n lĂ½ plugin. | KhĂ´ng khai bĂ¡o trĂ¹ng cĂ¡c plugin Ä‘Ă£ Ä‘Æ°á» c quáº£n lĂ½ bá»Ÿi preset cáº¥u hĂ¬nh chung. |
| **Lá»—i cĂº phĂ¡p Prisma do dbgenerated** trong migrations. | Khai bĂ¡o cĂ¡c giĂ¡ trá»‹ máº·c Ä‘á»‹nh phá»©c táº¡p báº±ng `dbgenerated()` (nhÆ° `CURRENT_DATE`, `regexp_replace`) khĂ´ng tÆ°Æ¡ng thĂ­ch hoĂ n toĂ n á»Ÿ má»™t sá»‘ mĂ´i trÆ°á» ng DB/Prisma. | Thay tháº¿ báº±ng `@default(now())` cho trÆ°á» ng DateTime hoáº·c Ä‘Æ¡n giáº£n hĂ³a schema, bá»  cĂ¡c hĂ m `dbgenerated` phá»©c táº¡p. | Æ¯u tiĂªn dĂ¹ng cĂ¡c hĂ m máº·c Ä‘á»‹nh chuáº©n cá»§a Prisma (`now()`, `uuid()`) thay vĂ¬ cĂ¡c hĂ m raw SQL Ä‘Ă·c thĂ¹ cá»§a DBMS. |
| **Script deploy bĂ¡o lá»—i cĂº phĂ¡p láº¡ trĂªn Linux** sau khi truyá» n file tá»« Windows. | File cáº¥u hĂ¬nh (`.env`, `docker-compose.yml`) lÆ°u trĂªn Windows dĂ¹ng kĂ½ tá»± xuá»‘ng dĂ²ng `\r\n` (CRLF) lĂ m Linux bash/docker lá»—i phĂ¢n tĂ­ch cĂº phĂ¡p. | ThĂªm lá»‡nh `sed -i 's/\r//g' .env docker-compose.yml` vĂ o chuá»—i lá»‡nh SSH thá»±c thi tá»« xa trÆ°á»›c khi cháº¡y docker-compose. | Thiáº¿t láº­p IDE (VSCode, Cursor) máº·c Ä‘á»‹nh lÆ°u tá»‡p dáº¡ng LF (`\n`), Ä‘áº·c biá»‡t vá»›i cĂ¡c tá»‡p cáº¥u hĂ¬nh vĂ  bash script. |
| **Frontend Container Crash Loop (Thoát ngay không log)** khi deploy Docker. | Nitro (của TanStack/Vite) mặc định build ra preset Cloudflare (chỉ export fetch handler). Khi Node chạy index.mjs trong Docker, nó không tạo server HTTP mà thoát luôn (exit 0), dẫn đến loop Restarting. | Thêm cấu hình preset: 'node-server' vào file  apps/vione_app_fe/nitro.config.ts để ép build ra dạng Node.js standalone server chạy độc lập. | Đảm bảo khai báo rõ preset: 'node-server' trong các dự án build SSR cho container chạy Node.js. |
| **Lỗi Prisma P1013 (unsupported startup parameter: search_path)** khi backend chạy. | Kết nối Prisma tới Supabase thông qua pooler (PgBouncer) ở port 6432, yêu cầu phải báo cho Prisma biết đang dùng PgBouncer. | Thêm tham số ?pgbouncer=true (hoặc &pgbouncer=true) vào cuối chuỗi DATABASE_URL. | Luôn thêm pgbouncer=true khi dùng Connection Pooler của Supabase (thường là port 6432). |
| **Lỗi Prisma báo sai port (invalid port number) dù URL đúng** (Error validating datasource). | File .env.production lưu trên Windows bị dính ký tự vô hình BOM (Byte Order Mark), làm hỏng chuỗi biến môi trường khi đọc trên Linux. | Chuyển định dạng mã hóa file .env về "UTF-8" (không BOM) thay vì "UTF-8 with BOM" trong VSCode/Cursor. | Thiết lập IDE (VSCode) luôn lưu tệp UTF-8 thuần ("files.encoding": "utf8"). |
| **Lá»—i chuyá»ƒn Ä‘á»•i Theme khĂ´ng pháº£n há»“i / máº£t Ä‘á»™ tÆ°Æ¡ng pháº£n** á»Ÿ má»™t sá»‘ vĂ¹ng giao diá»‡n. | CĂ¡c lá»›p bá» c .vione-tone vĂ  .bc-app trÆ°á»›c Ä‘Ă¢y Ä‘á»‹nh nghÄ©a cĂ¡c biáº¿n mĂ u CSS tÄ©nh khĂ´ng pháº£n há»“i (unconditional overrides), Ä‘Ă¨ lĂªn cĂ¡c thuá»™c tĂ­nh .dark vĂ  .hc cá»§a tháº» html. | Chuyá»ƒn Ä‘á»•i Ä‘á»‹nh nghÄ©a biáº¿n trong .vione-tone vĂ  .bc-app thĂ nh 3 tráº¡ng thĂ¡i rĂµ rĂ ng: máº·c Ä‘á»‹nh (Light Mode), .dark (Dark Mode), vĂ  .hc (High Contrast Mode). | TrĂ¡nh khai bĂ¡o biáº¿n mĂ u Ä‘Ă¨ tÄ©nh á»Ÿ cáº¥p container; náº¿u cĂ³, pháº£i Ä‘á»‹nh nghÄ©a rĂµ theo cĂ¡c class/selector tráº¡ng thĂ¡i cá»§a theme. |
| **CĂ¡c hiá»‡u á»©ng chuyá»ƒn trang, hoáº¡t áº£nh vĂ²ng xoay orbit vĂ  dot nháº¥p nhĂ¡y khĂ´ng cháº¡y** dĂ¹ Ä‘Ă£ báº­t Visual Effects trĂªn Windows. | File styles.css cĂ³ chá»©a media query @media (prefers-reduced-motion: reduce) Ä‘Ă¨ 	ransition-duration: 0.01ms !important lĂªn má» i pháº£n tá»­ dÆ°á»›i lá»›p .bc-app, khiáº¿n trĂ¬nh duyá»‡t táº¯t hoĂ n toĂ n hoáº¡t áº£nh do nháº­n diá»‡n sai hoáº·c thiáº¿t láº£p giáº£m chuyá»ƒn Ä‘á»™ng Ä‘Æ°á»£c kĂ­ch hoáº·c ngáº§m. | Loáº¡i bá»  hoĂ n toĂ n khá»‘i @media (prefers-reduced-motion: reduce) Ä‘Ă¨ thá» i lÆ°á»£ng chuyá»ƒn Ä‘á»™ng cá»§a Connect App Ä‘á»ƒ cho phĂ©p hoáº¡t áº£nh vĂ  chuyá»ƒn trang cháº¡y mÆ°á»£t mĂ  theo Ä‘Ăºng thiáº¿t káº¿. | Thiáº¿t káº¿ chuyá»ƒn Ä‘á»™ng mÆ°á»£t mĂ  vá»›i thá» i lÆ°á»£ng tá»‘i Æ°u (150ms-250ms) thay vĂ¬ táº¯t cá»©ng hoáº¡t áº£nh qua prefers-reduced-motion á»Ÿ má»©c á»©ng dá»¥ng náº¿u muá»‘n Ä‘áº£m báº£o tĂ­nh tháº©m má»¹ cao nháº¥t. |
| **Lỗi khởi tạo cuộc hẹn demo (Prisma 22P02)** | Lịch hẹn demo sử dụng kiểu `'general'` vốn không tồn tại trong danh sách ENUM `business_meeting_type` của database. | Đổi giá trị chèn sang `'networking'::public.business_meeting_type` (được database chấp nhận). | Luôn kiểm tra các giá trị ENUM thực tế trong database trước khi thực hiện raw query. |

## 6. Supabase & Lovable Integration Status
Dưới đây là chi tiết về mức độ liên quan và các chức năng hiện tại của hệ thống đối với **Supabase** và **Lovable**:

### 6.1. Liên quan đến Supabase
Mặc dù hệ thống đang chuyển dịch sang sử dụng NestJS Backend chuyên biệt và Prisma ORM để quản lý dữ liệu, Supabase vẫn đóng vai trò quan trọng ở các phần sau:
- **Cơ sở dữ liệu (PostgreSQL)**: Cơ sở dữ liệu chính của dự án vẫn chạy trên hạ tầng **Supabase PostgreSQL**. Chuỗi kết nối `DATABASE_URL` kết nối qua cổng Pooler `6432` của Supabase (yêu cầu cấu hình tham số `?pgbouncer=true` để tránh lỗi Prisma `P1013`).
- **Quản lý Schema & Migrations**: Schema cơ sở dữ liệu được định nghĩa và đồng bộ bằng **Supabase CLI**. Thư mục [supabase/migrations](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/supabase/migrations) chứa toàn bộ hơn 170+ tệp SQL Migrations gốc của dự án.
- **Xác thực (Authentication)**: Frontend (`apps/vione_app_fe`) vẫn giữ một số logic xác thực trực tiếp và kiểm tra phiên bản phiên làm việc qua `supabase.auth` (ví dụ: `supabase.auth.getUser()`, `signOut()`, `resetPasswordForEmail()`). Phía NestJS backend đã tự thiết lập cơ chế JWT (`/auth/login`, `/auth/register`) nhưng frontend vẫn đồng bộ lưu trữ token bằng các cookie `sb-access-token` và `sb-refresh-token`.
- **Lưu trữ tệp tin (Storage)**: Frontend trực tiếp gọi client SDK của Supabase qua `supabase.storage` để tải tài liệu (`documents` bucket), hình ảnh khoảnh khắc (Moments), ảnh danh thiếp (AI Card Import), và các tài nguyên đa phương tiện khác.
- **Tính năng Realtime**: Sử dụng các kênh Realtime của Supabase (`supabase.channel`, `supabase.removeChannel`) để đăng ký nhận sự kiện realtime thay đổi dữ liệu (như tin nhắn, Check-in sự kiện, Trạng thái biểu quyết và Marketplace).

### 6.2. Liên quan đến Lovable
**Lovable** chủ yếu đóng vai trò là nền tảng khởi tạo ứng dụng ban đầu, công cụ sinh mã AI, và cổng AI Gateway:
- **Vite Configuration Preset**: Frontend vẫn sử dụng `@lovable.dev/vite-tanstack-config` làm preset cấu hình chính trong `vite.config.ts` để tối ưu hóa và đóng gói ứng dụng TanStack Router.
- **Lovable AI Gateway**: Tính năng nhập danh thiếp bằng AI (AI Card Import) và các gợi ý AI của phần Business Connect gọi trực tiếp tới cổng AI Gateway của Lovable qua endpoint `https://ai.gateway.lovable.dev/v1/chat/completions` (sử dụng biến môi trường bảo mật `LOVABLE_API_KEY` ở server-side).
- **Domain & Webhook cũ**: Các tài liệu thiết lập và kiểm thử vẫn chứa các tham chiếu URL đến môi trường Lovable Cloud (như `qlhh.lovable.app`, `project--*.lovable.app`). Ngoài ra, tệp SQL migration cũ có chứa trigger gọi webhook đồng bộ tiến trình tới domain Lovable app.

## 7. NestJS Migration & Mobile-Only Routing

### 7.1. Chuyển dịch toàn bộ từ Supabase sang NestJS RESTful
- Mọi chức năng thuộc 4 nhóm chính bao gồm Trang chủ, Cộng đồng, Mạng lưới và Trang cá nhân (`/connect-app/`, `/connect-app/community/`, `/connect-app/network/`, `/connect-app/me/`) đã được cấu trúc lại hoàn toàn để gọi trực tiếp các API RESTful trên cổng của NestJS backend (`/api/*`) thay vì gọi trực tiếp Supabase qua SDK hoặc client RPCs.
- Các API SDK của danh thiếp (`business-card.sdk.ts`), liên hệ (`lead.service.ts`), thông báo và dữ liệu cá nhân hoàn toàn độc lập với Supabase Gateway, giúp ngăn ngừa các lỗi phân giải khóa JWT không tương thích chữ ký giữa cổng Supabase và backend NestJS.

### 7.2. Phân tách chuyển hướng theo thiết bị (Mobile vs Desktop)
- Các thiết lập chuyển hướng từ trang chủ `/` sang ứng dụng di động `/connect-app` và cơ chế bảo vệ bảo mật route hiện tại chỉ áp dụng duy nhất đối với các thiết bị di động (kiểm tra `userAgent` và chiều rộng màn hình `window.innerWidth <= 768`).
- Trên máy tính (desktop), khách truy cập chưa đăng nhập sẽ được điều hướng bình thường về trang landing (`/landing`), các trang dashboard quản trị và các hệ thống con khác hoạt động độc lập bình thường.

### 7.3. Hướng dẫn thiết lập & Chạy dự án
- Dự án sử dụng hệ quản lý gói **Bun** thay thế cho npm/yarn để giải quyết hoisting module hiệu quả trong cấu hình Turborepo monorepo.
- Khởi động môi trường dev: `bun run dev` (chạy song song cả frontend và backend).
- Biên dịch sản phẩm frontend: `bun run build` tại thư mục `apps/vione_app_fe`.

### 7.4. Chia sẻ kho lưu trữ MinIO giữa Dev Server và Local
- Cấu hình `MINIO_ENDPOINT` và `MINIO_PORT` trong tệp `.env` cục bộ (local) được cập nhật để kết nối trực tiếp tới máy chủ Dev (`14.225.217.232` cổng `9050`). Điều này cho phép môi trường Windows phát triển local và server chạy dev chia sẻ chung toàn bộ cơ sở hạ tầng lưu trữ tệp tin (ảnh danh thiếp, hình ảnh avatar, v.v.), loại bỏ nhu cầu chạy container MinIO cục bộ trên Windows.


## 8. Landing Pages Architecture, Theme-Bound Backgrounds & Cosmic Orbit Animations

### 8.1. Landing Pages & Routing Configuration
- **Routes & Aliases**:
  - `/landing` -> `src/routes/landing.index.tsx` (Mặc định dẫn đến Business Connect Landing).
  - `/landing/business-connect` & `/landing/bussiness-connect` (hỗ trợ alias lỗi gõ) -> `BusinessConnectLanding.tsx`.
  - `/landing/ceo-1983` -> `Ceo1983Landing.tsx` (Landing page chuẩn hiệp hội CEO 1983).
- **Public Access Bypass**:
  - File `apps/vione_app_fe/src/routes/__root.tsx` sử dụng điều kiện `p.startsWith("/landing")` và `pathname.startsWith("/landing")` để cho phép mọi người dùng chưa đăng nhập truy cập tất cả landing pages mà không bị chuyển hướng về login hay mobile app.
  - Khi thêm route landing mới, phải chạy `node scripts/gen-routes.mjs` để sinh lại file `src/routeTree.gen.ts`.

### 8.2. Quy Tắc Ràng Buộc Background Theo Theme (Theme-Bound Backgrounds)
Tuyệt đối không dùng nút chọn background thủ công (đã gỡ bỏ). Toàn bộ ảnh nền landing page được gắn chặt trực tiếp theo 3 chế độ Theme:
1. **Tương phản (High Contrast / Onyx)**:
   - File: `/landing/ceo1983-contrast.jpg` (Geometric 3D Dark Gold Facets - Ảnh 1).
2. **Sáng (Light Mode / Ivory Pearl)**:
   - File: `/landing/business-hero-light.jpg` (Silky Ivory Pearl Gold Luxury Waves - Ảnh 2).
3. **Tối (Dark Mode / Obsidian Hoàng Kim)**:
   - File: `/landing/ceo1983-hero-bg.jpg` (Obsidian Gold Luxury Facets - Ảnh 3).
- Áp dụng thống nhất cho cả `Ceo1983Landing.tsx` và `BusinessConnectLanding.tsx` / `LandingHero.tsx`.

### 8.3. Hệ Sinh Thái Vũ Trụ Radar (Cosmic Skyline Orbit Radar Ecosystem)
- **Background Section**:
  - File: `/landing/ecosystem-cosmic-skyline.jpg` (Không gian vũ trụ sâu thẳm kết hợp đường chân trời tòa nhà chọc trời phát sáng công nghệ tương lai).
- **Hoạt ảnh quỹ đạo xoay tròn (Dual Orbital Ring System)**:
  - **Vòng trong (Inner Orbit - Radius 125px)**: Xoay thuận chiều kim đồng hồ (`orbitSpinClockwise` / `ceo-orbit-spin-slow` 45s).
  - **Vòng ngoài (Outer Orbit - Radius 195px)**: Xoay ngược chiều kim đồng hồ (`orbitSpinCounter` / `ceo-orbit-spin-reverse-slow` 65s).
  - **Chống lộn ngược icon/chữ (Counter-Rotation)**: Mỗi node con trên quỹ đạo được áp dụng hoạt ảnh xoay ngược chiều tương ứng (`ceo-orbit-counter-slow` và `ceo-orbit-counter-reverse`) để icon và chữ luôn luôn đứng thẳng hàng, dễ đọc.
  - **Tương tác**: Hỗ trợ di chuột vào để tạm dừng (`animation-play-state: paused`) và bấm vào từng node để xem chi tiết liên minh kết nối.

### 8.4. Tích Hợp Video KYC & Showcase 3D
- Video KYC (`/landing/video_vione_kyc.mp4` và `/landing/video_vione_kyc_1.mp4`) được nhúng trong modal player 1080p và video switcher tab trên Business Connect Landing.
- Component `LandingInteractiveShowcase.tsx` tự động chuyển slide 3D với 9 phân hệ giải pháp và API redirect demo.


## 9. Multi-Tenant SaaS Architecture & Realtime Notification Lifecycle

### 9.1. Định Hướng Kiến Trúc Multi-Tenant B2B/B2C SaaS
- **Toàn bộ hệ thống ViOne được định hướng và thiết kế theo mô hình SaaS (Software-as-a-Service) đa tổ chức (Multi-Tenant)**:
  - **Tenant / Association Scope**: Mỗi hiệp hội, liên minh doanh nghiệp hoặc tổ chức (ví dụ: CEO 1983, Hội Doanh Nghiệp Trẻ, v.v.) được định danh bởi `association_id` (Tenant ID). Toàn bộ dữ liệu thành viên, ban điều hành, bài viết nội bộ, phòng ban và tài chính được phân tách và bảo vệ bởi Row Level Security (RLS) và Scoped Middleware ở backend (`requireNestAuth` + `assoc-scope`).
  - **Unified Cross-Tenant Identity**: Người dùng cá nhân (Executive User) sở hữu một danh tính số duy nhất (Digital Business Identity) có thể tham gia nhiều tổ chức, chuyển đổi qua lại nhanh chóng giữa các hiệp hội mà không cần đăng ký lại tài khoản.
  - **B2B Executive CRM + B2C Mobile Networking**: Kết hợp sức mạnh CRM quản trị doanh nghiệp/hiệp hội cho ban lãnh đạo trên Desktop Web với trải nghiệm kết nối chạm thông minh, danh thiếp điện tử NFC và mạng xã hội kết nối riêng tư cho từng cá nhân trên Mobile.

### 9.2. Mối Liên Hệ Giữa Mobile App (`/connect-app/*`) và Web CRM (`/`, `/dashboard`, `/business-connect/*`)
1. **Ứng Dụng Mobile Connect App (`/connect-app/*`)**:
   - **Tập trung vào trải nghiệm cá nhân (Executive Networking)**: Chạm NFC danh thiếp, quét mã QR, quản lý danh bạ cá nhân, xem và xử lý lời mời kết nối tức thì, nhắn tin thời gian thực, bảng tin khoảnh khắc (Moments), lịch hẹn thông minh và trí tuệ quan hệ (Relationship Intelligence).
   - **Giao diện & Trải nghiệm**: Phong cách "Executive Minimal Luxury" tông màu hoàng kim ấm (`.vione-tone`, `.bc-app`), hỗ trợ cử chỉ vuốt chạm, bottom action sheets, chuyển trang mượt mà không giật lag.
2. **Hệ Thống Web CRM / Admin Dashboard (`/`, `/dashboard`, `/business-connect/*`)**:
   - **Tập trung vào vận hành hiệp hội & CRM doanh nghiệp**: Quản lý hội viên, phân hạng hội viên, phân bổ tài chính, quản lý nhà tài trợ, tạo chiến dịch thông báo toàn hiệp hội (`/notifications`), báo cáo phân tích quan hệ kinh doanh, và quản trị tổ chức.
   - **Giao diện & Trải nghiệm**: Bảng điều khiển Desktop chuyên nghiệp với Topbar Notification Popover (`NotificationCenter`), Trung tâm thông báo Business Connect toàn màn hình (`BcNotificationCenter`), Kanban Board cơ hội kinh doanh và công cụ lọc nâng cao.

### 9.3. Vòng Đời Lời Mời Kết Nối & WebSocket Realtime Notification
1. **Luồng Khởi Tạo & Thông Báo**:
   - Khi Người dùng A gửi lời mời kết nối tới Người dùng B (`/api/me/connections/request`):
     - Bản ghi kết nối được tạo trong `public.user_connections` với trạng thái `pending`.
     - Bản ghi thông báo được lưu vào `public.business_notifications` của Người dùng B.
     - Backend Gateway (`ConnectAppGateway`) phát sự kiện WebSocket tới phòng `user:<userIdB>`:
       - `connection:requested` (dữ liệu tóm tắt người gửi).
       - `notification:new` (thông báo mới thời gian thực).
2. **Luồng Chấp Nhận / Từ Chối Lời Mời (Handshake Resolution)**:
   - Khi Người dùng B bấm **"Đồng ý kết nối" (Accept)**:
     - `public.user_connections.status` chuyển thành `'accepted'`, đồng thời tạo luồng chat trực tiếp (Conversation Thread) giữa A và B.
     - Dữ liệu `safe_display_data.connectionStatus` trong bảng `business_notifications` được cập nhật thành `'accepted'` và đánh dấu đã đọc (`status = 'read'`).
     - Backend Gateway phát sự kiện `connection:accepted` và `notification:updated` tới cả hai người dùng.
     - **UI Trạng Thái Hoàn Thiện**: Toàn bộ thẻ thông báo và danh sách lời mời ngay lập tức ẩn 2 nút "Đồng ý / Từ chối", hiển thị huy hiệu cố định **`✓ Đã kết nối`**, đồng thời mở các nút hành động nhanh **"Nhắn tin" (Message)** và **"Trang cá nhân" (Profile)**.
   - Khi Người dùng B bấm **"Từ chối" (Decline)**:
     - `public.user_connections.status` chuyển thành `'declined'`.
     - `safe_display_data.connectionStatus` cập nhật thành `'declined'`.
     - Backend Gateway phát `connection:declined` và `notification:updated`.
     - **UI Trạng Thái Hoàn Thiện**: Ẩn nút xác nhận, hiển thị huy hiệu **`✕ Đã từ chối`**.
3. **Luồng Xóa Thông Báo (Delete Notification)**:
   - Mỗi thông báo trên cả Mobile App (`connect-app.notifications.tsx`, `HomeNotificationsMenu.tsx`) và Web CRM (`NotificationCenter.tsx`, `BcNotificationCenter.tsx`) đều có nút icon thùng rác (`Trash2`).
   - Gọi endpoint `DELETE /api/me/notifications/:id` hoặc `POST /api/me/notifications/delete`.
   - Backend xóa bản ghi và phát WebSocket `notification:deleted` để đồng bộ xóa trên tất cả thiết bị đang mở của người dùng.

## 10. Bảng Tin Khoảnh Khắc Doanh Nhân (Facebook-Grade Moments Stream) & Bình Luận Đính Kèm Ảnh

### 10.1. Luồng Đăng Khoảnh Khắc (Post Moment - Facebook Style Workflow)
- **Vị trí tích hợp**: Trực tiếp tại Tab Network (`/connect-app/network`) và Bảng tin khoảnh khắc (`/connect-app/moment`), hiển thị khung nhập nhanh phong cách Facebook: *"Hôm nay bạn có cơ hội, thành tựu hay cuộc gặp gỡ nào muốn chia sẻ?"*.
- **Các thành phần dữ liệu phong phú**:
  1. **Nội dung bài viết (Text Note)**: Hỗ trợ tự động giãn dòng, gõ ký tự xuống dòng thoải mái.
  2. **Tải lên nhiều hình ảnh (Multi-Photo Upload)**: Đính kèm tối đa 6 hình ảnh với khung xem trước (preview thumbnail), xóa ảnh trực tiếp trước khi đăng, và tải trực tiếp lên kho lưu trữ backend NestJS (`/connect-app/relationship-moments`) hoặc fallback base64 an toàn.
  3. **Gắn thẻ đối tác / Bạn bè (Tag Connections)**: Modal chuyên dụng chọn đối tác từ danh bạ mạng lưới kinh doanh, có thanh tìm kiếm trực tiếp, hiển thị ảnh đại diện và tên công ty. Đồng thời hỗ trợ gõ nhanh ký tự `@` để tìm kiếm và gắn thẻ trực tiếp vào bài.
  4. **Huy hiệu cảm xúc / Hoạt động kinh doanh (Business Emotions & Activities)**:
     - 🤝 *Ký hợp đồng* / ☕ *Gặp gỡ đối tác* / 🚀 *Dự án mới* / 💡 *Cơ hội kinh doanh*
     - 🏆 *Thành tựu* / 📈 *Tăng trưởng* / 🥂 *Tiệc giao lưu* / 🎯 *Mục tiêu mới*
  5. **Check-in vị trí (Location)**: Gợi ý các địa điểm doanh nhân tiêu biểu (Khách sạn JW Marriott, Trung tâm Hội nghị Quốc gia, Landmark 81, TP. HCM, Hà Nội, Đà Nẵng) hoặc nhập tự do.
  6. **Quyền riêng tư (Privacy Scope)**: Công khai (Toàn mạng lưới), Chỉ kết nối (Bạn bè), hoặc Chỉ mình tôi (Riêng tư).
- **Quy trình xử lý backend**:
  - Giai đoạn Chuẩn bị (`POST /connect-app/moment/` -> `bcMobileMomentPrepareFn`): Cấp phát `clientToken` chống trùng lặp, tạo bản ghi `moment` với trạng thái `pending`.
  - Giai đoạn Hoàn tất (`POST /connect-app/moment/:id/finalize` -> `bcMobileMomentFinalizeFn`): Xác nhận ảnh và chuyển trạng thái `active`.
  - Giai đoạn Bắn thông báo (`POST /connect-app/moments/notify-tags`): Gửi thông báo WebSocket tới toàn bộ người dùng được gắn thẻ trong bài đăng.

### 10.2. Bình Luận Kèm Hình Ảnh (Comments with Photo Attachments)
- **Khung nhập bình luận nâng cao (`MomentCommentInput.tsx`)**:
  - Tích hợp nút icon đính kèm hình ảnh (`ImageIcon`).
  - Hỗ trợ chọn ảnh từ thư viện/máy ảnh, hiển thị khung preview thu nhỏ kèm nút hủy (`X`).
  - Tự động tải ảnh lên server khi gửi bình luận (`uploadFileToNest`), liên kết `photoUrl` vào bản ghi bình luận.
- **Hiển thị & Tương tác bình luận (`MomentCommentItem.tsx`)**:
  - Bình luận hiển thị đầy đủ hình ảnh đính kèm bo tròn góc cao cấp.
  - Hỗ trợ bấm vào ảnh để phóng to toàn màn hình (Full-screen Lightbox) với nút đóng tiện lợi.
  - Giữ nguyên đầy đủ cây phản hồi phân cấp (nested replies) và gắn thẻ `@mention`.

### 10.3. Luồng Chỉnh Sửa Khoảnh Khắc Toàn Diện (Full Facebook-Grade Moment Editing)
- **Tương đương 100% chức năng tạo mới (`MomentManageSheet.tsx`)**:
  - Cho phép sửa toàn bộ các trường dữ liệu: Nội dung ghi chú, thời điểm diễn ra (`occurredAt`), check-in vị trí (`placeLabel`), quyền riêng tư (`visibility`), người liên quan/đối tác (`targetPersonId`).
  - **Quản lý đa ảnh nâng cao**: Giữ lại các ảnh cũ đã tải lên, xóa ảnh cũ theo nhu cầu, thêm ảnh mới từ thiết bị (tối đa 6 ảnh), tải trực tiếp lên Nest storage và lưu liên kết `photoUrls`.
  - **Gắn thẻ đối tác & Cảm xúc**: Chọn đối tác liên quan từ danh bạ mạng lưới, cập nhật huy hiệu cảm xúc kinh doanh (Ký hợp đồng, Gặp gỡ đối tác, Dự án mới, v.v.).
  - **Xóa khoảnh khắc**: Tích hợp nút xóa bài kèm dialog xác nhận bảo mật (`AlertDialog`), xóa sạch bản ghi khoảnh khắc, ảnh media, bình luận và lượt thích liên quan trong cơ sở dữ liệu.

### 10.4. Phân Định Thanh Tương Tác Mạng Xã Hội & Menu Quản Lý Bài Đăng
- **Thanh tương tác dưới chân thẻ bài viết (`MomentActionBar.tsx`)**:
  - Chuẩn hoá theo phong cách mạng xã hội hiện đại (Facebook/LinkedIn):
    1. **Thích (Like)**: Thả tim và cập nhật bộ đếm thích thời gian thực.
    2. **Bình luận (Comment)**: Mở cây bình luận 3 tầng có đính kèm ảnh và `@mention`.
    3. **Chia sẻ (Share)**: Hỗ trợ Native Web Share hoặc tự động sao chép link khoảnh khắc kèm thông báo toast.
    4. **Lưu bài viết (Bookmark)**: Lưu khoảnh khắc vào danh sách bài viết đã lưu / ghi nhớ cá nhân.
- **Menu mở rộng (`...` Dropdown)**:
  - Dành riêng cho các hành động quản trị:
    - **Sửa khoảnh khắc**: Chỉ hiển thị cho chính chủ sở hữu bài đăng (`isOwner`), mở `MomentManageSheet`.
    - **Xoá khoảnh khắc**: Chỉ hiển thị cho chính chủ sở hữu, mở `AlertDialog` xác nhận xoá.
    - **Xem hồ sơ** và **Sao chép liên kết** cho tất cả người xem.
  - Loại bỏ hoàn toàn lỗi gắn nhầm nút "Ghi nhớ" ở chân thẻ mở sang modal "Sửa khoảnh khắc".


## 11. Kiến Trúc Thông Báo Realtime Toàn Diện Cho Web CRM & Mobile (WebSocket Notification Pipeline + Interactive Redirect)

### 11.1. Hạ Tầng WebSocket Đa Tầng (Multi-Tier WebSocket Gateway)
- **Tầng 1 - Định tuyến theo Người dùng (`user:<userId>`)**: Dành cho các tương tác cá nhân 1-1 (Lời mời kết nối mới, phản hồi kết nối, tin nhắn trực tiếp, gắn thẻ trong khoảnh khắc).
- **Tầng 2 - Định tuyến theo Tổ chức / Hiệp hội (`assoc:<associationId>`)**: Dành cho ban quản trị và nhân sự vận hành hiệp hội. Khi có sự kiện phát sinh trong hiệp hội (Đăng ký thành viên mới, gia hạn hội phí, đăng ký tài trợ), tất cả quản trị viên trong phòng hiệp hội đều nhận thông báo tức thì.
- **Tầng 3 - Phát sóng CRM Toàn hệ thống (`emitToAll`)**: Đảm bảo các phiên làm việc trên Web CRM Desktop luôn nhận được dữ liệu realtime mà không bị rớt kết nối do thay đổi phòng.

### 11.2. Cơ Chế Chuyển Hướng Tương Tác Hành Động (Actionable Notification Redirection)
Tất cả thông báo từ Web CRM tới Mobile đều được gắn thuộc tính `targetRoute` chuẩn xác theo luồng nghiệp vụ:
- **Đăng ký hội viên mới vào Hiệp hội / CLB (ví dụ: CLB Doanh Nhân CEO 1983)**:
  - Thông báo: *"Đăng ký hội viên mới: [Họ tên] - [Tên doanh nghiệp]"*.
  - `targetRoute`: **`/members?status=pending`** -> Bấm vào thông báo sẽ tự động đánh dấu đã đọc và chuyển hướng ban quản trị thẳng tới màn hình Quản lý hội viên ở bộ lọc **Chờ duyệt**, sẵn sàng bấm phê duyệt.
- **Nộp / Thanh toán hội phí (Fee Payment)**:
  - Thông báo: *"Hội viên [Họ tên] đã thanh toán hội phí [Năm]"*.
  - `targetRoute`: **`/fees`** -> Dẫn thẳng tới sổ theo dõi thu nộp hội phí.
- **Lời mời kết nối đối tác mới**:
  - Thông báo: *"Doanh nhân [Họ tên] vừa gửi cho bạn một lời mời kết nối kinh doanh"*.
  - `targetRoute`: **`/connect-app/network`** -> Dẫn tới màn hình Mạng lưới để xem hồ sơ và phê duyệt.
- **Đăng ký sự kiện / Hội thảo**:
  - `targetRoute`: **`/events`** -> Dẫn tới danh sách người đăng ký sự kiện.
- **Tương tác click thông minh**:
  - Trên Web CRM (`NotificationCenter.tsx`): Bấm vào bất kỳ dòng thông báo nào sẽ đóng popover, đánh dấu đã đọc và điều hướng router TanStack tới đúng trang đích.
  - Trên Mobile App (`BcNotificationCenter.tsx`): Bấm vào thông báo sẽ kích hoạt điều hướng mượt mà tới module tương ứng.

## 12. Tinh Chỉnh Giao Diện Hoàng Kim Sang Trọng (Luxury Gold UI & Navigation)
- **Nút V-Button nổi ở giữa thanh điều hướng đáy (Floating Gold V-Button)**:
  - Thiết kế gradient kim loại vàng đồng sang trọng (`linear-gradient(135deg, #C29B69, #F6E1C3 50%, #D8B282)`), viền bóng hoàng kim quý phái (`box-shadow: 0 4px 20px rgba(194, 155, 105, 0.4)`), đồng bộ tuyệt đối với nhận diện thương hiệu ViOne toàn app.
- **Sửa lỗi viền/focus của thanh điều hướng đáy**:
  - Loại bỏ các viền đen/nâu thô khi chọn tab, thay thế bằng hiệu ứng active glow và chỉ báo tinh tế, hài hòa trên cả 3 theme.

## 13. Mặc Định Theme Tối (Default Dark Mode Standard)
- Toàn bộ ứng dụng ViOne (`/connect-app/*`), ứng dụng các hiệp hội (CLB CEO 1983, Hội Doanh Nghiệp Trẻ), và Web CRM (`/dashboard`, `/notifications`) được thiết lập mặc định ở chế độ **Theme Tối** (`dark`).
- Khởi tạo đồng bộ ngay tại `RootShell` (`routes/__root.tsx`), `ThemeProvider` (`lib/theme.tsx`), và class `dark` của thẻ `<html>`.

## 14. Tính Toán Thời Gian Tương Tác Realtime Cho "Cần Giữ Kết Nối" (Realtime Nurture Intelligence)
- Loại bỏ hoàn toàn các giá trị cố định / hardcoded (`90 + idx * 10`).
- Dữ liệu ngày chưa liên hệ được tính toán chính xác 100% theo thời gian thực từ cơ sở dữ liệu:
  - Lấy thời điểm tương tác gần nhất giữa 2 người dùng qua `last_moment_at` (khoảnh khắc gần nhất), `last_message_at` (tin nhắn gần nhất), hoặc `uc.updated_at` / `uc.created_at` (thời điểm kết nối thành công).
  - Công thức: `const days = Math.max(1, Math.floor((now.getTime() - lastInteractionTime) / (1000 * 60 * 60 * 24)));`.
  - Sinh ra câu nhắc nhở AI chính xác: *"AI nhắc nhở: Đã X ngày chưa tương tác cùng [Tên đối tác]..."*.

## 15. Luồng Đăng Ký Hội Viên CLB & Bắn Thông Báo Hai Chiều (Landing -> Web CRM Bell Icon -> Member App)

### 15.1. Khi Khách / Doanh Nhân Nộp Đơn Gia Nhập CLB trên Landing Page (`/landing/ceo1983` hoặc `/landing/business-connect`)
1. **Frontend Landing (`submitClubApplication`)**:
   - Gửi payload đăng ký lên endpoint backend `POST /api/connect-app/club-application`.
2. **Backend Gateway & Dispatcher (`notifyAssociationAdmins` trong `connect-app.service.ts`)**:
   - Truy vấn toàn bộ danh sách quản trị viên có thẩm quyền:
     - Quản trị viên hiệp hội trong bảng `public.memberships` (vai trò `admin`, `president`, `vice_president`, `secretary`).
     - Quản trị viên cấp nền tảng / tenant trong bảng `public.user_roles` (`platform_admin`, `tenant_admin`, `admin`).
     - Tài khoản quản trị trong `public.vione_users` (có email chứa `%admin%` như `admin2@connect.vn`, `admin@connect.vn`).
   - Lưu thông báo đồng thời vào:
     - `public.notifications` (hệ thống thông báo toàn CRM).
     - `public.business_notifications` (thông báo in-app định danh cho từng `user_id` quản trị).
   - Phát sóng sự kiện WebSocket (`emitToAll` và `emitToRoom` `assoc:<associationId>` / `user:<adminId>`) với `targetRoute: "/members?status=pending"`.
3. **Web CRM Topbar Bell Icon (`NotificationCenter.tsx` + `listNotificationsFn`)**:
   - Khi Admin (`admin2@connect.vn` hoặc bất kỳ tài khoản có quyền duyệt) đăng nhập vào Web CRM (`/members`), icon chuông thông báo lập tức hiển thị badge đỏ và danh sách thông báo:
     *"Đăng ký gia nhập CLB CEO 1983: [Họ Tên] - [Tên Doanh Nghiệp]"*.
   - Bấm vào thông báo sẽ tự động đánh dấu đã đọc và chuyển hướng thẳng đến bảng Quản lý hội viên lọc theo `status=pending` (`/members?status=pending`), sẵn sàng thao tác duyệt.

### 15.2. Khi Admin Phê Duyệt hoặc Từ Chối Hội Viên trên Web CRM (`/members`)
1. **Backend Approval Workflow (`updateMember` trong `members.service.ts`)**:
   - Khi Admin chuyển trạng thái hội viên thành `active` (hoặc `rejected`), backend tự động tìm `user_id` tương ứng của hội viên đó.
   - Bắn thông báo kết quả vào `public.business_notifications` cho tài khoản hội viên:
     - Duyệt thành công: *"Hồ sơ gia nhập CLB của bạn đã được phê duyệt chính thức. Chào mừng bạn gia nhập mạng lưới liên minh C-Level!"*.
     - Gắn `targetRoute: "/m"` hoặc `/connect-app/me`.
   - Phát sóng WebSocket `user:<applicantUserId>` để cập nhật tức thì.
2. **Mobile Member App (`/m` hoặc `/connect-app`)**:
   - Người dùng đăng nhập vào app sẽ nhận được thông báo in-app báo đã được duyệt thành viên chính thức.

---

## 16. Tiêu Chuẩn 3 Chế Độ Giao Diện & Độ Tương Phản Cao Chế Độ Sáng (Landing High-Contrast Light Mode Standards)

### 16.1. Quy Chuẩn Nhãn 3 Theme (Theme Switcher Mode Labels)
Nhãn chuyển đổi theme phải tuân thủ nghiêm ngặt ngôn ngữ hiển thị:
- **Tiếng Việt (`vi`)**:
  - `modeDark`: **Tối**
  - `modeLight`: **Sáng**
  - `modeContrast`: **Tương phản cao**
- **Tiếng Anh (`en`)**:
  - `modeDark`: **Dark**
  - `modeLight`: **Light**
  - `modeContrast`: **High Contrast**
- **Tiếng Trung (`zh`)**:
  - `modeDark`: **暗色**
  - `modeLight`: **亮色**
  - `modeContrast`: **高对比度**
- **Tiếng Nhật (`ja`)**:
  - `modeDark`: **ダーク**
  - `modeLight`: **ライト**
  - `modeContrast`: **高コントラスト**
- **Tiếng Hàn (`ko`)**:
  - `modeDark`: **다크**
  - `modeLight`: **라이트**
  - `modeContrast`: **고대비**

### 16.2. Tiêu Chuẩn Độ Tương Phản Chế Độ Sáng (Light Mode High-Contrast Rule)
- **CẤM** sử dụng gradient chữ màu trắng/vàng kem (`from-white`, `from-[#FFFFFF]`, `via-[#FFF8E7]`, `to-[#FCE19F]`) cố định mà không bọc `themeClass`. Ở chế độ Sáng, chữ màu trắng trên nền sáng sẽ bị mờ/tàng hình.
- **Tiêu chuẩn màu ở Chế độ Sáng (Light Mode / Sáng)**:
  - Tiêu đề chính (H1/H2/H3): Sử dụng màu đen than đậm `#0F172A` (`text-[#0F172A]`) hoặc gradient than chì sâu (`from-[#0F172A] via-[#1E293B] to-[#334155]`).
  - Điểm nhấn vàng đồng / highlight: Chuyển sang màu hổ phách đậm sắc nét (`from-[#B45309] via-[#D97706] to-[#92400E]`).
  - Nội dung mô tả / phụ đề: Sử dụng `text-[#334155]` hoặc `text-[#475569]`.
  - Nền thẻ / Bento cards: Sử dụng nền trắng tinh khiết `#FFFFFF` hoặc ngà sang `#FAF8F5`, viền vi tế `border-amber-900/15`, đổ bóng êm `shadow-[0_8px_30px_rgba(0,0,0,0.06)]`.

---

## 17. Phân Định Background Riêng Biệt Cho Landing CEO 1983 và Business Connect SaaS (Anti-Plagiarism & Brand Exclusivity)

- **Landing CLB CEO 1983 (`/landing/ceo1983`)**:
  - Sở hữu bộ ảnh nền đặc quyền phong cách Hoàng Gia VIP 24K Gold, lụa đen và huy hiệu lãnh đạo:
    - Chế độ Tối (Dark): `/landing/ceo1983-hero-dark.jpg`
    - Chế độ Sáng (Light): `/landing/ceo1983-hero-light.jpg`
    - Chế độ Tương phản (Contrast): `/landing/ceo1983-contrast.jpg`
- **Landing ViOne Business Connect SaaS (`/landing/business-connect`)**:
  - Sở hữu bộ ảnh nền công nghệ Cyber Tech Grid, mạng lưới Blueprint SaaS và giao thương B2B:
    - Chế độ Tối (Dark): `/landing/business-saas-dark.jpg`
    - Chế độ Sáng (Light): `/landing/business-saas-light.jpg`
    - Chế độ Tương phản (Contrast): `/landing/business-cta-bg.jpg`
- **Tuyệt đối không dùng chung background giữa 2 landing page** để đảm bảo tính độc bản thương hiệu và bản quyền thiết kế.

---

## 18. Cẩm Nang Toàn Diện Build & Phát Hành Mobile App (iOS & Android) - Sổ Tay Cho AI & Developer

### 18.1. Nguyên Lý Kiến Trúc Mobile (Live Remote Server Mode)
- **Vị trí source code mobile**: `apps/mobile/` (gói `@vibe/vione_app_mobile`).
- **Nền tảng**: Capacitor 7 + React/Vite/TanStack.
- **Cấu hình máy chủ từ xa ([capacitor.config.ts](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/mobile/capacitor.config.ts))**:
  - `USE_REMOTE_SERVER = true`
  - `REMOTE_URL = 'http://14.225.217.232:5000'`
  - `CLEARTEXT = true`
- **QUY TẮC VÀNG VỀ BUILD APP**:
  - **Sửa giao diện / Logic Frontend**: **KHÔNG CẦN BUILD LẠI APP NATIVE!** Chỉ cần deploy web frontend lên server `14.225.217.232:5000` (dùng `fast-deploy.ps1`), ứng dụng mobile trên máy người dùng sẽ tự động cập nhật ngay khi mở lại app.
  - **Khi nào MỚI CẦN build lại file cài đặt (.ipa / .apk)?**:
    1. Thay đổi App Icon hoặc Splash Screen.
    2. Cài thêm hoặc cập nhật thư viện Native Plugin (Push notifications, Bluetooth, NFC, In-app purchase,...).
    3. Thay đổi URL máy chủ từ xa (ví dụ: chuyển từ IP sang domain chính thức `https://app.vione.vn`).
    4. Nâng số hiệu phiên bản lớn (Version / Build Number) để phát hành chính thức lên App Store / Google Play.

---

### 18.2. Thông Tin Định Danh & Tài Khoản Phát Hành

| Hạng mục | Giá trị cấu hình | Ghi chú |
| :--- | :--- | :--- |
| **App Name** | `ViOne Connect` | Tên nội bộ / hiển thị bundle |
| **Display Name (iOS)** | `Vione Business Connect` | Tên xuất hiện dưới icon trên màn hình iPhone |
| **Bundle Identifier (App ID)** | `ViOneBusinessConnect` | Bắt buộc giữ nguyên cho cả iOS và Android |
| **Apple ID (App Store Connect)** | `6810608093` | Mã định danh app trên App Store Connect |
| **Apple Developer Account** | `tuanna@unicomhub.com` | Tài khoản Developer quản lý |
| **App Store Connect API Key ID** | `4Q734PS4PG` | Đã lưu tại `apps/mobile/credentials/AuthKey_4Q734PS4PG.p8` (được .gitignore bảo vệ) |
| **Issuer ID** | `6c7d5137-21b1-4bae-96d2-3cc761483dbc` | Dùng cho xác thực tự động không cần OTP |
| **Expo / EAS Project** | `@unicom-vibe-coding-team/vione` | Project ID: `3b83c509-f641-4560-a8e5-33dfd5940f89` |

---

### 18.3. Quy Trình Build iOS Production & Đẩy TestFlight (Qua EAS Cloud)

#### A. Yêu Cầu & Lưu Ý Bắt Buộc (Apple 2026 Policy)
1. **Xcode & SDK**: Apple từ chối tất cả bản build dưới **Xcode 26 / iOS 26 SDK**. Trong [eas.json](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/mobile/eas.json) bắt buộc cấu hình:
   ```json
   "image": "macos-sequoia-15.6-xcode-26.2",
   "node": "20.18.0"
   ```
2. **Bỏ qua node-gyp / sharp trên macOS**: File `.npmrc` ở root và `apps/mobile/.npmrc` phải có dòng `ignore-scripts=true` để tránh lỗi biên dịch C++ native của `sharp` trên máy chủ macOS của Expo.
3. **Tự động kích hoạt TestFlight (Không bị hỏi App Encryption)**: Đã cấu hình `<key>ITSAppUsesNonExemptEncryption</key><false/>` trong `Info.plist`. Sau khi Apple xử lý xong, build sẽ chuyển sang trạng thái sẵn sàng kiểm thử mà không cần chọn thủ công.

#### B. Các Lệnh Build & Upload iOS (Chạy tại `apps/mobile`)
- **Lệnh 1: Build file `.ipa` trên Cloud (Khuyên dùng)**:
  ```powershell
  cd apps/mobile
  npx eas-cli build --profile production --platform ios --non-interactive
  ```
- **Lệnh 2: Tự động submit file `.ipa` mới nhất lên Apple TestFlight**:
  ```powershell
  cd apps/mobile
  npx eas-cli submit -p ios --latest --non-interactive
  ```
- **Lệnh 3: Trọn gói Build + Auto-submit lên TestFlight (Chạy 1 lệnh)**:
  ```powershell
  cd apps/mobile
  npx eas-cli build --profile production --platform ios --auto-submit --non-interactive
  ```

#### C. Link Web Quản Lý Sản Phẩm & Tải File iOS
- **Trang theo dõi tiến trình Build & Tải trực tiếp file `.ipa`**:
  👉 [EAS Builds Dashboard](https://expo.dev/accounts/unicom-vibe-coding-team/projects/vione/builds)
- **Trang quản lý TestFlight & App Store Connect**:
  👉 [App Store Connect TestFlight](https://appstoreconnect.apple.com/apps/6810608093/testflight/ios)
- **File IPA Build 3 (Đã phát hành thành công lên TestFlight)**:
  👉 [Download Build 3 .IPA](https://expo.dev/artifacts/eas/-BMmwAUQczehQxzZYWV6fMMSYQH5k5zKy7hTKhLKpzA.ipa)

---

### 18.4. Quy Trình Build Android (Cục Bộ Bằng Gradle)

#### A. Các Lệnh Build Android
- **Đồng bộ code web và cấu hình sang Android**:
  ```powershell
  cd apps/mobile
  npx cap sync android
  ```
- **Build file APK Debug (Cài ngay vào máy Android thử nghiệm)**:
  ```powershell
  cd apps/mobile/android
  .\gradlew assembleDebug
  ```
- **Build file APK / AAB Release (Để phát hành Google Play)**:
  ```powershell
  cd apps/mobile/android
  .\gradlew assembleRelease
  ```

#### B. Thư Mục Lấy File Sản Phẩm Android
- **File APK Debug đã build sẵn**:
  `apps/mobile/android/app/build/outputs/apk/debug/ViOne-Connect-v1.0-debug.apk`
- **Thư mục chứa bản Release**:
  `apps/mobile/android/app/build/outputs/apk/release/`
  `apps/mobile/android/app/build/outputs/bundle/release/` (file `.aab` cho Google Play Console)

---

### 18.5. Tóm Tắt Quy Trình Làm Việc Hàng Ngày Cho AI & Dev

```
[Khi sửa UI/Tính năng Frontend]
         │
         ▼
Sửa code trong apps/vione_app_fe
         │
         ▼
Deploy lên server 14.225.217.232 (chạy fast-deploy.ps1)
         │
         ▼
XONG! Mở app trên điện thoại là thấy giao diện mới ngay lập tức.
(Không cần build lại iOS/Android)


[Khi cần đổi Icon/Splash/Plugin hoặc phát hành bản Store mới]
         │
         ├──> [Android] cd apps/mobile/android ; .\gradlew assembleDebug
         │              => Lấy APK tại: apps/mobile/android/app/build/outputs/apk/debug/
         │
         └──> [iOS]     cd apps/mobile ; npx eas-cli build --profile production --platform ios --auto-submit --non-interactive
                        => Tải IPA tại: https://expo.dev/accounts/unicom-vibe-coding-team/projects/vione/builds
                        => Kiểm tra TestFlight tại: https://appstoreconnect.apple.com/apps/6810608093/testflight/ios
```

---

## 19. Khắc Phục Lỗi Crash Backend NestJS (:5001 ERR_CONNECTION_REFUSED)

### 19.1. Triệu chứng & Log Lỗi
- **Triệu chứng**: Giao diện đăng nhập trên Server Dev (`http://14.225.217.232:5000`) và iOS báo *"Không có kết nối mạng ổn định"*. F12 Console xuất hiện lỗi:
  - `net::ERR_CONNECTION_REFUSED :5001/api/auth/login`
  - `WebSocket connection to 'ws://14.225.217.232:5001/socket.io/...' failed`
- **Log gốc từ container backend**:
  ```text
  Error: Cannot find module '/app/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node'
  Require stack:
  - /app/node_modules/bcrypt/bcrypt.js
  - /app/apps/vione_app_be/dist/src/auth/auth.service.js
  - /app/apps/vione_app_be/dist/src/main.js
  ```

### 19.2. Nguyên nhân
- Khi thêm tệp `.npmrc` (`ignore-scripts=true`) cho quá trình build iOS trên Expo, Docker backend vô tình sao chép tệp này vào container.
- Lệnh `npm ci` trong `Dockerfile.backend` bị áp dụng cờ `ignore-scripts=true`, khiến quá trình biên dịch module C++ của thư viện `bcrypt` bị bỏ qua. Kết quả là container backend sập ngay khi vừa nạp thư viện.

### 19.3. Giải pháp đã xử lý triệt để
1. **Thêm `.npmrc` vào [.dockerignore](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/.dockerignore)**: Không cho Docker sao chép file cấu hình npmrc từ máy chủ phát triển vào container.
2. **Cập nhật [Dockerfile.backend](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/Dockerfile.backend)**:
   ```dockerfile
   RUN npm ci --ignore-scripts=false && npm rebuild bcrypt
   ```
3. **Cập nhật [apps/vione_app_be/src/main.ts](file:///d:/download/VICONNECT/VIONE_PROJECT/vione_app/apps/vione_app_be/src/main.ts)**:
   - `await app.listen(port, '0.0.0.0');` (Đảm bảo bind đúng `0.0.0.0` thay vì loopback `127.0.0.1` trong container).
   - `origin: true` trong CORS để tương thích với `credentials: true`.
4. **Quy trình deploy cập nhật lại**:
   Chạy `.\fast-deploy.ps1` (lưu ý không dùng `-FrontendOnly` khi cần đẩy bản sửa lỗi backend).


