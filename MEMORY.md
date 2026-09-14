# System Memory & Architecture

## 1. Current State
- **Frontend**: TanStack React Start, running with React 19, TailwindCSS 4, and Radix UI.
- **Backend**: NestJS API with Prisma ORM. Core business logic, association management, and card models ported from frontend to backend.
- **Mobile app**: Native Capacitor configuration located at `apps/vione_app_mobile/` with unified app identification `vione_app` (appName: `vione_app`, appId: `connect.vn.vione_app`).
- **Deployment**: Automated deployment pipeline executed via `fast-deploy.ps1` to remote Linux server (`14.225.217.232`).
- **Styling System**: Luxury warm gold / champagne gold design system adapted from UNICOM Dashboard into CSS tokens (`.vione-tone` and `.bc-app`), featuring glassmorphism, subtle grid patterns, and pulsing micro-animations.

## 2. Architectural Decisions (ADR)
- **Monorepo Strategy**: Turborepo orchestrates `@vibe/vione_app_fe`, `@vibe/vione_app_be` (NestJS), `@vibe/vione_app_mobile`, and `@vibe/db`.
- **Backend Migration**: Moving from client-side Supabase calls to a dedicated NestJS backend utilizing Prisma ORM for type-safe data access.
- **Strict Git Rule (AGENTS.md Compliance)**: TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY `git push` HAY `git commit`. Mọi thay đổi mã nguồn chỉ được lưu cục bộ (local). Người dùng toàn quyền chủ động kiểm tra và commit.
- **Mandatory Synchronization Discipline**: Mỗi lần thực hiện bất kỳ thay đổi kiến trúc, tính năng, sửa lỗi hoặc điều chỉnh luồng, BẮT BUỘC:
  1. Cập nhật `MEMORY.md` với chi tiết kỹ thuật, nguyên nhân, cách phòng tránh.
  2. Cập nhật Cursor Rules / Roles (`.cursorrules`) với convention và vai trò mới.
  3. Bổ sung/hiệu chỉnh các tài liệu kỹ thuật trong `document/` (cả markdown và rebuild file `.docx`) nếu phát hiện sai lệch hoặc có cập nhật technical.
- **Routing Ecosystem Architecture (Tam Phân Lập Đăng Nhập Độc Quyền)**:
  - **Màn Đăng nhập Hệ thống Web CRM riêng (`/auth` hoặc `/auth?portal=crm`)**: Giao diện đăng nhập quản trị hệ thống chuyên biệt (card đăng nhập admin, Email/Username + Mật khẩu, Google & Apple OAuth, ThemeSwitcher). Tuyệt đối độc lập, không dùng chung nút chuyển sang mobile hay hiệp hội.
  - **Màn Đăng nhập App ViOne Mobile riêng (`/vione/login`)**: Giao diện đăng nhập thương hiệu ViOne Mobile thuần túy (nền đen sang trọng `#0A0A0B`, chữ đồng `#D8B282`, ảnh nền `connect-auth-bg.jpg`, Logo ViOne Business Connect, quét danh thiếp NFC/QR code, Google/Apple OAuth), sau đăng nhập chuyển thẳng vào `/connect-app`. Hoàn toàn KHÔNG có tab switcher sang Hiệp hội, KHÔNG dùng chung nút chuyển mobile.
  - **Màn Đăng nhập App Hiệp hội CEO 1983 riêng (`/association/login`)**: Giao diện hội viên CLB Doanh Nhân CEO 1983 thuần túy (nền tối xanh Navy `#0B0F19`, Logo CEO 1983, màu xanh dương đặc trưng, Email/Mã hội viên + Mật khẩu, kích hoạt tài khoản hội viên), sau đăng nhập chuyển thẳng vào `/association`. Hoàn toàn KHÔNG có nút chuyển sang ViOne.
  - **Association App Base Route**: `/association/*` (24 sub-routes nghiệp vụ hội viên). Đường dẫn `/m/*` tự động chuyển hướng 301 client-side sang `/association/*`.
  - **Business Connect App**: `/connect-app/*` (Mạng xã hội doanh nhân, Moments B2B, Danh bạ đối tác, Kết nối 1-on-1).
  - **CRM Admin Portal**: `/dashboard`, `/members`, `/fees`, `/events`, `/income`, `/expenses`, `/benefits`, `/perks`, `/marketplace`, v.v.
- **Deployment Strategy**:
  - To prevent Out Of Memory (OOM) failures during remote Docker builds, the frontend is compiled locally on Windows with an expanded heap limit (`--max-old-space-size=8192`).
  - Docker images are saved as `.tar` archives, securely transferred via SCP, and loaded into remote Docker daemon via SSH.
  - Uniform project identifier `vione_app` is maintained across build, packaging, and Docker operations.


## 3. Server & Docker Configuration
- **Port Mapping**:
  - **Frontend** (`app_frontend_prod`): Host `5000` -> Container `8080`.
  - **Backend** (`app_backend_prod`): Host `5001` -> Container `4000`.
- **Networking**: Both containers share the `target_network` bridge network.
- **Environment Variables**: Managed via `.env.production`, transferred via SCP to the remote server as `.env`, loaded by `docker-compose.clean.yml`.

## 4. Caveats & Gotchas
- **Database Permissions**: The production DB (`jdbc:postgresql://113.20.107.184:6432/postgres`) previously encountered permission issue `42501` for role `app1`.
- **Line Endings (CRLF vs LF)**: Configuration files (`.env`, `docker-compose.yml`) edited on Windows can contain CRLF endings. Remote deployment scripts apply `sed -i 's/\r//g'` to normalize to LF line endings.
- **Prisma Schema vs NestJS**: Database schemas must maintain clean synchronization. Legacy fields should not be referenced in controllers unless declared in `schema.prisma`.
- **Database ID Types**: Standardize on `String` (UUID) across all models to prevent BigInt vs String parsing discrepancies.
- **Relative URLs for Assets**: Avoid hardcoding `window.location.origin` in API calls. Use relative routes (e.g. `/api/...`) to prevent CORS and port-forwarding issues.

## 5. Troubleshooting & Bug Fixes Log

| Issue / Symptom | Root Cause | Solution | Prevention |
| :--- | :--- | :--- | :--- |
| **Backend crash / Missing UI** on Dev Server even when API returns HTTP 200. | Root `Dockerfile.frontend` used `node:20-alpine`, lacking global `WebSocket` support in Node runtime. Server functions calling `globalThis.WebSocket` failed with `undefined`. | Upgraded `Dockerfile.frontend` and `Dockerfile.backend` to base image `node:22-alpine` (native WebSocket enabled by default). | Standardize Node.js version (22+ LTS) between local environment and container base images. |
| **Node 22 Image Pull Error (HTTP 500)** during deploy script execution. | Docker Hub intermittent connection issue or stale Docker Desktop session auth tokens. | Ran `docker logout` to purge cached credentials, or pre-pulled `docker pull node:22-alpine`, or restarted Docker daemon. | Log out of Docker Hub when private registry credentials are not required. |
| **Auth Cookie Not Persisting on Dev Server (HTTP)**, user repeatedly logged out. | Cookie `secure` attribute was hardcoded (`SameSite=Lax; secure`) in `AuthContext.tsx`, causing browsers to reject cookies over plain HTTP (`http://14.225.217.232:5000`). | Updated `secure` flag to be dynamic: enabled only when actual protocol is HTTPS (`window.location.protocol === 'https:'`). | Avoid hardcoding `secure` cookie flags in development/staging environments serving over HTTP. |
| **Frontend Inaccessible from External Host** (Connection Refused). | Nitro/Node server defaulted to binding `127.0.0.1` inside container, preventing Docker port mapping to host interfaces. | Added environment variables `HOST=0.0.0.0` and `NITRO_HOST=0.0.0.0` in `docker-compose.clean.yml`. | Always configure host bind addresses to `0.0.0.0` for containerized web servers. |
| **Vite Plugin Collision / Duplication** during build. | Manual plugin declarations in `vite.config.ts` collided with `@lovable.dev/vite-tanstack-config` preset. | Simplified `apps/vione_app_fe/vite.config.ts` to clean `export default defineConfig({})` to let preset manage plugins. | Avoid duplicate plugin registrations when using full-featured wrapper presets. |
| **Prisma Syntax Error with `dbgenerated()`** during migrations. | Complex default values using `dbgenerated()` (e.g., `CURRENT_DATE`, `regexp_replace`) had cross-version portability quirks. | Replaced with standard Prisma defaults (`@default(now())`) or simplified schema declarations. | Prefer standard Prisma default functions (`now()`, `uuid()`) over DBMS-specific SQL functions. |
| **Deploy Script Syntax Errors on Linux** after Windows file transfer. | Windows CRLF line endings (`\r\n`) broke bash script execution on Linux. | Added `sed -i 's/\r//g' .env docker-compose.yml` to SSH command chain prior to launching docker-compose. | Configure IDE to enforce Unix LF line endings across repository configuration files. |
| **Frontend Container Crash Loop (Exit 0)** on Docker startup. | Nitro defaulted to Cloudflare preset (exporting fetch handler only). When Node executed `index.mjs`, no HTTP listener started and process exited cleanly. | Added `preset: 'node-server'` in `apps/vione_app_fe/nitro.config.ts` to generate standalone Node HTTP server. | Explicitly specify `preset: 'node-server'` in SSR applications intended for Docker/Node containers. |
| **Prisma Error P1013 (unsupported startup parameter: search_path)** on backend launch. | Prisma connecting to Supabase PgBouncer pooler on port 6432 without notifying Prisma of the pooler mode. | Appended `?pgbouncer=true` parameter to the `DATABASE_URL` connection string. | Always append `?pgbouncer=true` when connecting via Supabase connection poolers. |
| **Prisma Invalid Port Number Error** despite correct URL. | Windows `.env.production` file contained an invisible UTF-8 Byte Order Mark (BOM) header. | Converted file encoding to UTF-8 without BOM in editor. | Enforce standard UTF-8 without BOM across all project configuration files. |
| **Theme Switching Lag / Color Inversion** in specific UI sections. | Parent classes `.vione-tone` and `.bc-app` used static unconditional color variable overrides, clobbering `.dark` and `.hc` classes. | Restructured variables in `.vione-tone` and `.bc-app` into 3 explicit states: default (Light), `.dark` (Dark), and `.hc` (High Contrast). | Scope theme variables to theme state selectors rather than unconditional container rules. |
| **Cosmic Orbit and Pulsing Animations Stalled** despite OS motion settings. | CSS included an aggressive `@media (prefers-reduced-motion: reduce)` block forcing `transition-duration: 0.01ms !important`. | Removed blunt reduction block to ensure smooth, intended luxury micro-animations. | Tune motion durations (150ms-250ms) rather than completely disabling animation systems. |
| **Demo Meeting Creation Failure (Prisma 22P02)**. | Hardcoded meeting type `'general'` did not exist in database ENUM `business_meeting_type`. | Updated value to valid enum `'networking'::public.business_meeting_type`. | Verify database ENUM declarations before executing raw SQL queries or hardcoded inserts. |
| **Membership Renewal Status Flattening** (10 due, 0 overdue). | Backend `members.service.ts` stripped `term_end` field during transformation, defaulting calculation to 30 days due. | Exposed both camelCase and snake_case properties (`term_end`, `termEnd`, `renewed_at`, `renewedAt`) and added fallback parsing in `renewals-calc.ts`. | Ensure API transfer objects preserve critical date fields required for client-side calculations. |
| **Admin Member Recognition in Association Network**. | `currentMemberId` resolved to `null` because `me.id` was not matched against member records. | Added multi-field resolution checking `me.id`, `me.member_id`, and `me.memberId` in networking loader. | Support both user ID and member ID bindings for administrative accounts holding association memberships. |
| **TanStack Route Generator Cache Skip (`routeTree.gen.ts`)**. | `generator.run()` memory caching occasionally skips physical disk flush when many routes are added/deleted. | Updated `scripts/gen-routes.mjs` to extract `res.routeTreeContent` directly and force write via `fs.writeFile`. | Always verify `routeTree.gen.ts` reflects new routes on disk after bulk route changes. |
| **Windows Word `.docx` File Lock (Error -4094 UNKNOWN)**. | Windows indexer or preview handlers lock open `.docx` files during script overwrite. | Write output to `.docx.tmp` first, then atomically rename/replace with `fs.renameSync`. | Avoid direct overwriting of binary files that may be inspected by Windows OS services. |
| **PostgreSQL XOR Constraint `brm_target_xor` Violation**. | Inserting B2B Moments with `target_kind = 'connection'` but missing `target_user_id`. | Strictly ensure `target_user_id` is populated when target kind is set to connection. | Verify PostgreSQL table check/XOR constraints before writing seed or automated test scripts. |
| **Database Status Enum Check Constraints**. | `demo_requests.status`, `invoices.status`, `renewal_audit_log.event_type` enforce strict domain checks. | Aligned test payloads to valid values: `demo_requests` ('new', 'contacted'), `invoices` ('unpaid', 'paid'), `renewal_audit_log` ('payment'). | Validate table constraints via SQL inspection prior to writing workflow transition tests. |
| **Quản lý Doanh nghiệp (`/companies`) hiển thị 0 dữ liệu**. | Dữ liệu `public.members` lưu `type: 'enterprise'` hoặc `'corporate'`, nhưng NestJS backend `listMembers` và Frontend filter lại lọc cứng `type === 'company'`. | 1) Cập nhật `members.service.ts` chuẩn hóa `r.type` ('enterprise'/'corporate' -> 'company') và lọc cả 3 loại khi client gửi `type=company`. 2) Chạy enrichment bổ sung mã số thuế, website, quy mô nhân sự, địa chỉ cho toàn bộ 17 doanh nghiệp hội viên. 3) Cập nhật memo `base` tại `companies.index.tsx` chấp nhận cả 3 type. | Luôn chuẩn hóa phân loại `type` tại cả tầng API DTO mapping và client-side filter. |
| **Quyền lợi Hội viên (`/benefits`) hiển thị 0 dữ liệu & lỗi lưu**. | Trang gọi `useServerFn` với `supabaseAdmin`, nhưng backend remote Supabase không cấp `SUPABASE_SERVICE_ROLE_KEY` tại frontend runtime. | Bổ sung bộ API CRUD quản trị chuyên dụng trên NestJS backend: `GET/POST/PUT/DELETE /api/members/benefits/admin` truy vấn trực tiếp bảng `public.association_benefits` qua Prisma. Frontend `/benefits` chuyển hoàn toàn sang `fetchNestApi`. | Tránh dùng `useServerFn` phụ thuộc Supabase service role key trực tiếp trên frontend; dùng NestJS API controller bảo mật bằng JWT. |
| **Business Connect Landing V2 - V7 Creative Animation & Theme Sync**. | Cần hỗ trợ 7 phiên bản landing nghệ thuật với hiệu ứng chuyển section phức tạp (Lật sách 3D, Panel Drop Bounce Comic, Wipe sương mù kính mưa, Glitch Snap Cyber, Cửa đá Ai Cập, Bong bóng nổ scale 100vw). | Xây dựng kiến trúc cuộn nâng cao bằng Framer Motion (`useScroll`, `useTransform`, `perspective: 1000px`, `clip-path: inset()`, `motion.div`), kết hợp 3 theme mode riêng cho từng version, thay thế rừng chữ bằng icon động/GIF tương tác và tooltip/popover. | Tuân thủ nghiêm ngặt quy tắc Visual thay thế Text và cấu trúc Advanced Scroll Architecture cho landing page tương tác cao. |
| **Đồng bộ Biểu quyết CRM với ViOne App & Hiệp hội App (Multi-App Voting Sync)** | CRM tạo biểu quyết nhưng không phân phối thông báo đến người liên quan, không phân định được nguồn bỏ phiếu từ app nào, và khi kết thúc không tự phát thông báo kết quả. | 1) Thêm cột `source_app VARCHAR(50) DEFAULT 'vione_app'` vào `public.poll_votes`. 2) Bổ sung logic phân phối thông báo theo `targetAudience` (`all`, `members`, `non_members`) tới `public.business_notifications` và `public.member_notifications` khi tạo poll. 3) Lưu nguồn bỏ phiếu (`'vione_app'`, `'association_app'`, `'crm'`) và tính toán tỷ lệ kênh tham gia thời gian thực. 4) Bổ sung API `POST /api/voting/polls/:id/close` tự động xác định Winner 🏆 và phát thông báo kết quả hoàn tất kèm breakdown tới người dùng trên cả 3 nền tảng. | Định nghĩa rõ ràng luồng tương tác 3 nền tảng và luôn lưu metadata nhận diện kênh (`source_app`) để kiểm toán và phân tích đa kênh. |
| **Tin nhắn Hệ thống, Thông báo Giao dịch Zalo VietQR & Branding CEO 1983** | 1) Chữ O logo ViOne bị hở đáy. 2) Tagline cũ còn sót chữ "kết nối đồng niên". 3) Nút thông báo còn chữ cồng kềnh. 4) Thiếu kênh tin nhắn hệ thống ghim trên cùng. 5) Cần thẻ giao dịch Zalo OA đồng bộ cho ViOne & Hiệp hội. 6) Lịch sử sự kiện hội viên hiển thị rỗng. 7) Logo hiệp hội bị hỏng URL. 8) Bấm nút "Liên hệ" nhảy sang tin nhắn rỗng. | 1) Bổ sung bridge path đáy chữ O trong `ViOneLogo.tsx`. 2) Xóa sạch slogan "đồng niên", đổi sang "Nâng tầm giá trị • Tiên phong kết nối". 3) Đổi nút thông báo thành icon tròn `CheckCheck` và `EyeOff`. 4) Bổ sung kênh admin "Ban Thư Ký CLB Doanh Nhân CEO 1983" ghim trên cùng với auto-seed tin nhắn thông báo. 5) Xây dựng `ZaloTransactionCard` tích hợp VietQR, tải ảnh QR, copy STK cho cả ViOne và Hiệp hội. 6) Cập nhật query sự kiện khớp code/email/name và seed đăng ký sự kiện. 7) Trỏ logo về `/ceo1983-logo.png` kèm fallback. 8) Tạo `AssociationContactSheet` mở thông tin hotline/email/địa chỉ khi bấm "Liên hệ". | Luôn bảo đảm dữ liệu hệ thống (admin channel, event registrations) có fallback tự phục hồi, kiểm tra kĩ đường dẫn asset cục bộ, và thiết kế thẻ thông báo giao dịch tương tác chuẩn ngân hàng. |
| **Tách Đăng nhập Mobile, Tối giản LangSwitcher, Sửa ViOne Me, Đồng bộ Thông báo Quá hạn & UX Community Members** | 1) Màn đăng nhập `/auth` chưa tách riêng Mobile và Web CRM. 2) LangSwitcher có cờ rườm rà. 3) Các mục ViOne Me (`/sessions`, `/cards`, `/intel-settings`) không hoạt động trên mobile. 4) Thông báo quá hạn hội viên/cơ hội từ app Hiệp hội chưa đẩy về ViOne cho tài khoản Lê Hoàng Long. 5) Danh sách thành viên cộng đồng bị lệch icon ChevronRight và đè badge. 6) Business Connect V1 bị trùng nút theme switcher và che khuất text mô tả. 7) Thắc mắc liệu có cần build lại native iOS khi sửa login hay chỉ cần fast-deploy. | 1) Tách riêng `/auth` (chỉ desktop CRM) và `/auth/mobile` (Mobile card, NFC, OTP, Google/Apple OAuth tách vào `auth-oauth.ts`), tự động chuyển hướng mobile. 2) `LangSwitcher.tsx` & `LuxuryLangSwitcher.tsx` bỏ toàn bộ cờ, dùng typography pill tối giản (`VI ▾`). 3) Sửa NestJS routing `@Controller(['me', 'connect-app/me'])` cho `device-sessions`, thêm endpoints personalization cho `network.controller.ts`, bọc layout `MobilePage` và đồng bộ theme cho `IntelPersonalizationSettings.tsx`. 4) Bổ sung truy vấn `public.member_notifications`, tổng hợp nhắc nợ quá hạn hội viên (`/association/renew/pay`), cơ hội và tin nhắn `ADMIN` vào `listNotifications` của ViOne. 5) Cố định `ChevronRight` tại mép phải hàng hội viên trong `CommunityMembers.tsx`, căn chỉnh nút vai trò `ShieldCheck`. 6) Xóa bỏ các thanh theme switcher thừa ở navbar/topbar/mobile menu của `BusinessConnectLanding.tsx` và tối ưu padding hero section. 7) Xác nhận kiến trúc Live Remote Server: **KHÔNG CẦN build lại iOS**, chỉ cần chạy `./fast-deploy.ps1`. | Tuân thủ tách biệt thiết bị (Desktop vs Mobile), chuẩn hóa routing đa tenant trên NestJS controller, và luôn thiết kế giao diện danh sách có actions cố định mép phải tránh collision. |
| **Lỗi Parser PowerShell 5.1 trong `fast-deploy.ps1` (Unexpected token / Missing terminator)** | Khi chạy `./fast-deploy.ps1`, PowerShell 5.1 báo lỗi cú pháp: `Unexpected token 'frontend.tar.gz")) { $remoteLoadCmd += "docker' in expression or statement`, `Unexpected token 'cd'`, `The string is missing the terminator: "`. Nguyên nhân: Windows PowerShell 5.1 mặc định đọc file `.ps1` theo mã hóa ANSI (Windows-1252) nếu không có UTF-8 BOM (`\uFEFF`). Trong tiếng Việt có dấu, ký tự 'ồ' (trong từ "Đồng bộ") mã hóa UTF-8 là `0xe1 0xbb 0x93`. Byte `0x93` trong bảng mã Windows-1252 tương ứng với ký tự mở ngoặc kép cong `“` (U+201C). Trình phân tích từ vựng (lexer) của PowerShell nhận diện `0x93` là dấu mở/đóng ngoặc chuỗi, làm đảo lộn toàn bộ trạng thái đóng mở chuỗi trong script. | 1) Lưu file `fast-deploy.ps1` với mã hóa **UTF-8 with BOM (`\uFEFF`)** để PowerShell 5.1 nhận diện đúng UTF-8 Unicode. 2) Tách đoạn mã Node.js nén `Compress-ToGzip` ra biến `$nodeCompress` riêng biệt dùng nháy đơn `'...'` để tránh xung đột nháy kép. Script sau khi sửa đã được kiểm tra bằng `[Parser]::ParseFile` đạt 0 lỗi cú pháp (`SUCCESS: 0 SYNTAX ERRORS`). | BẮT BUỘC: Tất cả các file script PowerShell (`.ps1`) chứa chuỗi tiếng Việt có dấu phải được lưu dưới dạng UTF-8 with BOM (`\uFEFF`) để đảm bảo tương thích 100% trên Windows PowerShell 5.1. |
| **Khôi phục Giao diện Đăng nhập ViOne Chuẩn (`ConnectAppSignIn`) & Tách biệt Màn Đăng nhập Hệ thống CRM** | Khi mở `/auth` trên desktop, người dùng nhìn thấy form card trắng trên nền trắng của Web CRM ("trang đăng nhập vào hệ thống") thay vì giao diện ViOne quen thuộc (nền đen `#0A0A0B`, chữ đồng `#D8B282`, ảnh nền `connect-auth-bg.jpg`). Nguyên nhân: trước đó `isMobileAuth` bị đặt `false` trong `auth.tsx` và cố redirect sang `/auth/mobile` không tồn tại, khiến trên desktop `/auth` chỉ render màn Web CRM card trắng. | 1) Khôi phục màn hình đăng nhập ViOne (`ConnectAppSignIn`) làm giao diện mặc định cho `/auth` trên cả desktop và mobile (nền đen, chữ đồng, wallpaper, 2 tabs: "Đăng nhập ViOne" & "Cổng Hiệp hội CEO 1983", quét NFC/QR, Google/Apple OAuth). 2) Giới hạn màn hình card trắng ("Trang đăng nhập vào hệ thống") chỉ xuất hiện khi `portal=crm` hoặc `portal=admin`. 3) Bổ sung nút chuyển đổi qua lại: nút `"Cổng Quản trị Hệ thống (CRM) →"` ở footer `ConnectAppSignIn` và nút `"← Quay lại Đăng nhập ViOne"` ở header CRM card. 4) Xóa bỏ các redirect tới `/auth/mobile` trong `connect-app.tsx`, `association.tsx`, `association.login.tsx`, `me.index.tsx`, quy về `/auth`. 5) Tối ưu hóa layout `ConnectAppSignIn` để căn giữa sang trọng và hiển thị hoàn hảo trên màn hình Desktop mà vẫn mượt mà trên Mobile. | Luôn giữ nhận diện thương hiệu sang trọng ViOne (nền đen, chữ vàng đồng) làm mặc định cho người dùng; cổng quản trị hệ thống CRM dành riêng cho admin và được định tuyến rõ ràng qua param `portal=crm`. |
| **Tách Biệt Tuyệt Đối 3 Màn Đăng Nhập Độc Lập (CRM Web Admin, App ViOne Mobile, App Hiệp Hội CEO 1983 - Không Dùng Chung Nút Chuyển Mobile)** | Người dùng yêu cầu chia rõ login ra 3 màn đăng nhập độc lập: màn đăng nhập vào hệ thống CRM riêng, màn đăng nhập vào app ViOne Mobile riêng, màn đăng nhập vào app Hiệp hội riêng; app mobile không chung nút chuyển app mobile như trước. | 1) **Màn 1: App ViOne Mobile riêng (`/vione/login`)**: Tạo route `vione.login.tsx` chuyên biệt cho ViOne Mobile, sử dụng `ConnectAppSignIn` đã gỡ bỏ hoàn toàn tab switcher sang Hiệp hội và link footer sang CRM. Giữ trọn vẹn nhận diện vàng đồng `#D8B282` trên nền đen `#0A0A0B`, ảnh nền `connect-auth-bg.jpg`, quét thẻ NFC/QR và Google/Apple OAuth. 2) **Màn 2: App Hiệp hội CEO 1983 riêng (`/association/login`)**: Chuẩn hóa `association.login.tsx` thành màn đăng nhập độc quyền CLB Doanh Nhân CEO 1983, gỡ sạch liên kết sang ViOne, tích hợp `LuxuryLangSwitcher` tinh tế, đăng nhập bằng Email hoặc Mã hội viên. 3) **Màn 3: Hệ thống Web CRM riêng (`/auth` hoặc `/auth?portal=crm`)**: Chuyên biệt hóa `auth.tsx` thành cổng đăng nhập Quản trị Web CRM, form Email/Password và ThemeSwitcher, tự động điều hướng sang `/vione/login` hoặc `/association/login` nếu nhận diện truy cập từ mobile app route. 4) Cập nhật route guard tại `__root.tsx`, `connect-app.tsx`, `association.tsx` và `connect-app.me.index.tsx`. 5) Chạy `npm run build` xác nhận `routeTree.gen.ts` nhận diện chính xác và đạt 0 lỗi TypeScript. | Tuyệt đối không dùng chung component đăng nhập có tab switcher giữa các ứng dụng mobile độc lập; mỗi ứng dụng sở hữu một điểm truy cập xác thực (auth entrypoint) riêng biệt với nhận diện thương hiệu chuẩn mực. |
| **Sửa Lỗi Vòng Lặp Redirect Vô Tận Tại `/association/login` (Aw, Snap!) & Hướng Dẫn Cú pháp PowerShell `.\fast-deploy.ps1`** | Khi truy cập `/association/login`, trình duyệt bị kẹt vào vòng lặp chuyển hướng vô tận nối dài chuỗi query parameter (`/association/login?redirect=%2Fassociation%2Flogin%3Fredirect%3D%252F...`) dẫn đến tràn call stack và crash tab trình duyệt (`Aw, Snap! Crashpad_NotConnectedToHandler`). Ngoài ra người dùng lưu ý cú pháp chạy PowerShell trên Windows là `.\fast-deploy.ps1`. | 1) **Nguyên nhân gốc**: `association.tsx` là parent layout route của `/association/login`. Trong hook `beforeLoad` của `association.tsx`, khi chưa có token (`!hasLocal`), route đã ném `throw redirect({ to: '/association/login', search: { redirect: location.href } })` mà không kiểm tra xem người dùng vốn dĩ đang ở sẵn màn `/association/login`, dẫn đến việc parent route liên tục chuyển hướng về chính con của nó. Đồng thời trong `__root.tsx`, trình chặn mobile tự động chuyển hướng các trang không nằm trong whitelist về `/connect-app`. 2) **Giải pháp**: Bổ sung điều kiện kiểm tra `if (location.pathname === '/association/login' || location.pathname.startsWith('/association/login')) return;` tại `beforeLoad` của `association.tsx`; trong `MemberRoot` render trực tiếp `<Outlet />` không bọc qua `MemberScreen` để tránh thanh tab bar; bổ sung `/association/login` và `/association/*` vào whitelist mobile và `isPublic` tại `__root.tsx`. 3) **Xác nhận lệnh thực thi**: Trên Windows PowerShell, cú pháp chuẩn xác để chạy script tại thư mục hiện tại là `.\fast-deploy.ps1` (dùng dấu gạch chéo ngược `\`). File `fast-deploy.ps1` đã đạt chuẩn UTF-8 with BOM và 0 lỗi cú pháp. | Mọi layout route cha có cơ chế `beforeLoad` bắt buộc kiểm tra phiên đăng nhập phải luôn có điều kiện loại trừ (whitelist bypass) cho chính route con đăng nhập của nó để triệt tiêu mọi khả năng xảy ra vòng lặp redirect vô tận. |
| **Tối ưu Toàn diện Giao diện & Tính năng App Hiệp Hội CEO 1983 (Màu sắc, Facebook Profile, Event Photos, Badges, Fixed Viewport, Light Modal, Tiếng Anh & Báo giá VIP)** | 1) Màu xanh bị đậm u tối. 2) Profile cá nhân sai thiết kế, có nền đen và thiếu thông tin. 3) Sự kiện thiếu ảnh. 4) Animation rụng phấn hiện tràn lan ở cả icon không có badge. 5) Trao cơ hội, Đăng sản phẩm & Ưu đãi chưa có số thông báo và hiệu ứng. 6) Header logo và footer navigate bị trôi khi cuộn trên mobile. 7) Modal đăng sản phẩm bị màu đen trên theme sáng. 8) Không chuyển được sang Tiếng Anh. 9) Nhận báo giá VIP không hoạt động. | 1) Đổi sang màu xanh Sky 600 (#0284C7) chuẩn nhận diện CEO 1983. 2) Xóa sạch nền tối, thiết kế profile chuẩn Facebook: ảnh bìa, avatar đè, tích xanh, bio, 4 tabs (Giới thiệu, Bạn bè, Bài viết, Hình ảnh), mặc định collapsed. 3) Bổ sung ảnh banner sắc nét cho toàn bộ sự kiện. 4) Giới hạn animation rụng phấn chỉ ở icon có số badge đỏ. 5) Thêm badge số +15, +28, +5 (hộp quà phát sáng rung lắc chu kỳ 2s). 6) Cố định header và footer bằng cấu trúc h-[100dvh] flex flex-col với flex-1 overflow-y-auto. 7) Chuyển modal đăng sản phẩm sang theme sáng bg-white. 8) Khởi tạo lang từ localStorage và cung cấp song ngữ toàn diện. 9) Thêm Modal Yêu cầu báo giá VIP tương tác đầy đủ kèm toast thành công. | Luôn duy trì tính nhất quán của theme sáng/tối theo biến CSS hệ thống; thiết kế profile di động theo cấu trúc chuẩn thẻ tương tác (Facebook-style) và bảo đảm tính năng quốc tế hóa (i18n) có fallback song ngữ đồng bộ. |
| **Sửa Toàn diện 8 Lỗi Danh Thiếp Số, Lưu Thẻ & Upload MinIO, Thao Tác Kết Bạn Trong Thông Báo & Hiệu Ứng Tuyết Rơi** | 1) Danh thiếp số màu nền đen mờ, shadow chữ nhòe nhoẹt, nút thiếu tương phản. 2) Thông báo kết bạn thiếu nút Đồng ý/Từ chối và hiện raw key `bc.notif.kind...`. 3) Màu các nút trong thông báo quá mờ. 4) Số sự kiện chưa đọc mất màu đỏ. 5) Không bấm lưu được danh thiếp số và up ảnh avatar MinIO lỗi. 6) Bấm "Cập nhật hồ sơ & quyền riêng tư" không mở editor danh thiếp số. 7) Grid tính năng nhanh bị đè banner `-mt-16` và khuyết 1 ô (7/8). 8) Thiếu hiệu ứng tuyết rơi xanh lấp lánh ở icon có thông báo. | 1) Thiết kế lại card danh thiếp số tông màu hoàng gia Royal Blue + Gold trim, text tương phản cao. 2) Thêm nút "Đồng ý" (UserCheck) & "Từ chối" (UserX), dịch chuỗi `bc.notif.kind...` sang tiếng Việt, API `PATCH /network/connections/:id` đẩy push notification và socket về cho người gửi. 3) Tăng tương phản nút "Đánh dấu đã đọc" (border-2 sky-600), "Bỏ qua" (border-2 slate-300), và filter tabs (sky-600 active). 4) Chuyển badge đỏ sang "Xem tất cả >". 5) Chuyển backend `saveCard` sang Direct SQL bypass Prisma DLL lock, sửa token multi-fallback và credentials `include` cho `AvatarUploadField`, trỏ MinIO port 4000. 6) Route search `action=edit` tự động mở CardEditor khi bấm từ profile. 7) Bỏ `-mt-16`, thêm mục thứ 8 "Ưu đãi đối tác" tạo lưới 4x2 cân xứng. 8) Thêm CSS keyframes và icon tuyết rơi lấp lánh (`❄`, `✦`, `✧`, `⋆`) cho icon có badge. | Khi gặp lỗi Windows khóa DLL Prisma, dùng raw SQL mapping an toàn; luôn đảm bảo component upload kiểm tra mọi loại token (`token`, `access_token`, `vibe_token`) và bổ sung nút tương tác trực tiếp trên thông báo có gửi socket/push ngược lại cho người khởi tạo. |




## 6. Supabase & Lovable Integration Status

### 6.1. Supabase Role & Resources
While application logic has transitioned to the NestJS backend and Prisma ORM, Supabase infrastructure continues to support core storage and real-time features:
- **Database (PostgreSQL)**: Primary database runs on Supabase PostgreSQL infrastructure. Connected via port `6432` with `?pgbouncer=true`.
- **Migrations**: Database schema history managed in `supabase/migrations/` containing 170+ foundational SQL migration scripts.
- **Authentication**: Frontend maintains backward compatibility with `supabase.auth` session tokens (`sb-access-token`, `sb-refresh-token`) alongside NestJS JWT endpoints.
- **File Storage**: Direct integration with Supabase Storage buckets for documents, moments media, and AI business card scan uploads.
- **Realtime Channels**: WebSocket real-time subscriptions for instant chat messages, event check-in counts, and marketplace live bidding.

### 6.2. Lovable AI & Tooling
- **Vite Configuration Preset**: Frontend utilizes `@lovable.dev/vite-tanstack-config` as base configuration for TanStack Router optimization.
- **AI Gateway Integration**: AI Business Card scanner and relationship intelligence suggestions interface with Lovable AI Gateway endpoint (`https://ai.gateway.lovable.dev/v1/chat/completions`) using server-side `LOVABLE_API_KEY`.

## 7. NestJS Migration & Mobile-Only Routing

### 7.1. RESTful API Architecture
- Core modules including Home, Community, Network, and Profile (`/connect-app/*`) interface directly with NestJS RESTful endpoints (`/api/*`).
- Specialized services for business cards, CRM leads, notifications, and user profiles operate independently of direct client-side database connections, securing authentication tokens and business rules.

### 7.2. Device-Aware Routing (Mobile vs Desktop)
- Automatic redirects from root `/` to `/connect-app` apply exclusively to mobile viewports (`window.innerWidth <= 768` and mobile user agents).
- Desktop visitors access landing pages (`/landing`), executive CRM dashboards (`/members`, `/fees`, `/events`, `/income`, `/expenses`), and administrative tools.

### 7.3. Development & Build Commands
- Monorepo package orchestration managed by **Bun** or **npm**.
- Local development server: `npm run dev` or `bun run dev` (concurrent frontend and backend).
- Production build: `npm run build` in `apps/vione_app_be` and `apps/vione_app_fe`.

### 7.4. Shared MinIO Storage Infrastructure
- `MINIO_ENDPOINT` and `MINIO_PORT` in local development connect directly to dev server (`14.225.217.232:9050`), sharing storage buckets across development and staging without requiring local MinIO containers.

## 8. Landing Pages Architecture & Visual Standards

### 8.1. Routes & Public Bypass
- Routes:
  - `/landing` -> `src/routes/landing.index.tsx` (Default Business Connect Landing).
  - `/landing/business-connect` -> `BusinessConnectLanding.tsx`.
  - `/landing/ceo-1983` -> `Ceo1983Landing.tsx` (CEO 1983 Association Landing).
- Unauthenticated access is explicitly permitted for `/landing` routes in `apps/vione_app_fe/src/routes/__root.tsx`.

### 8.2. Theme-Bound Backgrounds
Background imagery is strictly bound to the active theme without manual override toggles:
1. **High Contrast**: Geometric 3D Gold Facets (`/landing/ceo1983-contrast.jpg` / `/landing/business-cta-bg.jpg`).
2. **Light Mode**: Silky Ivory Pearl Luxury Gold (`/landing/business-hero-light.jpg` / `/landing/ceo1983-hero-light.jpg`).
3. **Dark Mode**: Obsidian Gold Luxury Facets (`/landing/ceo1983-hero-bg.jpg` / `/landing/business-saas-dark.jpg`).

### 8.3. Dual Orbital Ring System
- **Inner Orbit (Radius 125px)**: Clockwise rotation (`ceo-orbit-spin-slow` 45s).
- **Outer Orbit (Radius 195px)**: Counter-clockwise rotation (`ceo-orbit-spin-reverse-slow` 65s).
- **Counter-Rotation**: Child nodes apply inverse rotation (`ceo-orbit-counter-slow` and `ceo-orbit-counter-reverse`) keeping typography and icons upright at all times.
- **Hover Pause**: Interaction pauses animation (`animation-play-state: paused`) on hover to enable node inspection.

## 9. Universal Dashboard Table Standards
All CRM dashboard tables (`/renewal`, `/members`, `/companies`, `/fees`, `/income`, `/expenses`, `/events`, `/event-registrations`, `/sponsors`, `/benefits`, `/perks`, `/marketplace`, `/documents`, `/platform/permissions`) adhere to a unified UI/UX standard:
1. **Search & Filter Bar**: Instant client-side and URL-synced multi-criteria filtering.
2. **Sticky STT (Sequence Number)**: Fixed to left edge (`sticky left-0 z-20` on header, `sticky left-0 z-10` on cells) with opaque backgrounds to prevent horizontal bleed.
3. **Sticky Code / ID (Mã)**: Fixed immediately adjacent to STT (`sticky left-[56px] z-20` on header, `sticky left-[56px] z-10` on cells).
4. **Sticky Actions (Thao tác)**: Fixed to right edge (`sticky right-0 z-20` on header, `sticky right-0 z-10` on cells).
5. **Horizontal Scrolling**: Wrapped in `relative overflow-x-auto` container with `border-separate border-spacing-0` table layout.
6. **Pagination Controls**: Standard `<Pagination ... />` component supporting page jumps, next/previous buttons, and configurable page sizes.

## 10. Multi-Tenant SaaS Architecture & Realtime Notifications

### 10.1. Multi-Tenant Association Model
- Data isolation enforced by `association_id` (Tenant ID) across members, board structures, internal news, benefits, and financial ledgers.
- Unified digital identity enables executive members to belong to multiple associations with seamless switching.

### 10.2. Realtime WebSocket Gateway Pipeline
- **User-Level Channel (`user:<userId>`)**: Direct 1-to-1 interactions (connection requests, chat messages, mentions).
- **Association-Level Channel (`assoc:<associationId>`)**: Broadcasts to association administrators (membership applications, fee payments, sponsorship inquiries).
- **Actionable Notification Redirection**:
  - New member application -> Navigates to `/members?status=pending`.
  - Fee payment received -> Navigates to `/fees`.
  - Connection request -> Navigates to `/connect-app/network`.
  - Event registration -> Navigates to `/events` or `/event-registrations`.

## 11. Mobile App Build & Release Guide (iOS & Android)

### 11.1. Live Remote Server Architecture
- **Platform**: Capacitor 7 + React/Vite/TanStack.
- **Remote Host Configuration** (`capacitor.config.ts`):
  - `USE_REMOTE_SERVER = true`
  - `REMOTE_URL = 'http://14.225.217.232:5000'`
  - `CLEARTEXT = true`
- **Core Principle**: UI and frontend logic updates deployed to the web server immediately reflect in mobile apps without recompiling native binaries. Native `.ipa` / `.apk` rebuilds are only required for native plugin modifications, splash screen/icon updates, or version bumps.

### 11.2. App Identification & Credentials
- **App Name**: `ViOne Connect`
- **Display Name (iOS)**: `Vione Business Connect`
- **Bundle ID**: `ViOneBusinessConnect`
- **Apple ID**: `6810608093`
- **Developer Account**: `tuanna@unicomhub.com`
- **EAS Project**: `@unicom-vibe-coding-team/vione` (Project ID: `3b83c509-f641-4560-a8e5-33dfd5940f89`)

### 11.3. Build Commands
- **iOS Production (EAS Cloud)**:
  ```powershell
  cd apps/mobile
  npx eas-cli build --profile production --platform ios --auto-submit --non-interactive
  ```
- **Android Debug**:
  ```powershell
  cd apps/mobile
  npx cap sync android
  cd android
  .\gradlew assembleDebug
  ```
- **Android Release**:
  ```powershell
  cd apps/mobile/android
  .\gradlew assembleRelease
  ```

## 12. Quality Assurance & Project Estimation Matrix Standards (110 Flows & WBS)

### 12.1. 110 Deep Flows E2E Automation Testing
- **E2E Test Engine**: `scratch/test_110_deep_flows.js` executing 110 comprehensive integration and database state-machine validation steps across the entire ecosystem with **100% Pass Rate (110/110)**:
  1. **Landing & Lead Acquisition** (Flows 001 - 010): Public bypass, theme switching, demo requests, contact inquiries, multi-association selector.
  2. **CRM Quản lý Hội viên & Phân ban BCH** (Flows 011 - 025): Full CRUD, approved/pending/rejected states, board assignments, department filtering, Excel export/import simulation.
  3. **CRM Quản lý Niên liễm, Thu phí VietQR & Kế toán** (Flows 026 - 040): Invoicing, VietQR generator, payment webhook simulation, idempotent processing, renewal audit logs (`renewal_audit_log.amount_paid`).
  4. **CRM Quản lý Sự kiện & Điểm danh QR Check-in** (Flows 041 - 055): Event lifecycle, ticket tiers, QR payload generation, real-time check-in updates, attendance rate analytics.
  5. **CRM Quyền lợi, Nhà tài trợ & Sàn B2B Marketplace** (Flows 056 - 070): Sponsor tier assignment, bilingual benefits (`title_vi`/`title_en`), product status lifecycle (`active`/`sold`/`draft`), contact exchange leads.
  6. **App Hiệp Hội Doanh Nhân `/association/*`** (Flows 071 - 085): Digital membership card, QR exchange, election voting, internal news, association documents, executive networking.
  7. **ViOne Connect Mạng Xã Hội B2B `/connect-app/*`** (Flows 086 - 100): B2B feed, Moments (`owner_user_id`, `occurred_at`), 1-on-1 meeting scheduling (`business_meeting_type`), chat messaging, notification routing.
  8. **Bảo Mật, Phân Quyền RBAC, API Guards & Recovery** (Flows 101 - 110): Role checks (Admin, Board, Member, Guest), route protection, soft delete / archive recovery, audit logging.

### 12.2. ExcelJS Workbook Generation Technical Caveats & Fixes
- **Missing Column Headers Bug**: Calling `ws.columns = [...]` sets column definitions on Row 1. If Rows 1-2 are subsequently merged to create a banner header, the column labels on Row 1 are obliterated. Creating Row 4 as an empty row caused `eachCell` to encounter 0 cells, resulting in blank headers.
  - **Resolution**: Explicitly assign title, font, background fill, alignment, and border to each cell `A4:Q4`, followed by defining auto-filter bounds `ws.autoFilter = 'A4:Q4'`.
- **Interactive Data Validation Dropdowns**: Dropdowns for `Trạng thái Dev`, `Trạng thái Kiểm thử`, `Trạng thái Nghiệm thu`, and `Mức độ ưu tiên` must be embedded using `cell.dataValidation = { type: 'list', allowBlank: true, formulae: ['"Val1,Val2,Val3"'] }`.
- **Windows File Lock Prevention**: When generating `document/*.xlsx` files, if files are currently open in Excel on the user's workstation (`EBUSY`), generation gracefully outputs to `_CHI_TIET.xlsx` and `_110_FLOWS.xlsx` and logs notice to avoid build termination.

### 12.3. Exact Database Schema & Check Constraints Discovered
- `products`: Column `status` check constraint `products_status_check` strictly allows `['active', 'sold', 'draft']` (DO NOT use `'approved'`).
- `business_relationship_moments`: Column `owner_user_id` (UUID), `occurred_at` (Timestamp NOT NULL), check constraint `status` strictly allows `['pending', 'active']` (DO NOT use `'published'`). Target XOR constraint `brm_target_xor` requires `target_user_id` when `target_kind = 'connection'`.
- `renewal_audit_log`: Column is `amount_paid` (BigInt, NOT `amount`). `user_id` is NOT NULL. `event_type` check constraint strictly allows `['payment', 'idempotent_noop', 'failure']`.
- `members`: Primary identifier `id` is text (e.g. `'MEM-1983-xxx'`), name column is `name` (NOT `full_name`). Required fields: `type`, `level`, `status`, `joined_at`, `fee_year`.
- `business_notifications`: Check constraint `business_notifications_priority_check` strictly allows `['critical', 'high', 'normal', 'informational']` (DO NOT use `'urgent'`). Check constraint `business_notifications_status_check` strictly allows `['pending', 'scheduled', 'delivered', 'read', 'archived', 'expired', 'cancelled']`. There is NO boolean `is_read` column; mark read via `status = 'read'` and `read_at = NOW()`.

## 13. Creative Landing Page Upgrades (V2, V3, V4, V5) - Visual-First Paradigm
All 4 Business Connect landing page variants have been elevated to international creative studio-grade standards with custom animations, 3 distinct themes each (Light, Dark, Contrast), and strict compliance with the **Visual-First Rule** (No text walls, text hidden behind interactive artifacts/GIFs/Popovers):

### 13.1. Phiên bản 1 (V2 - Tiên Hiệp & Tu Tiên: Huyễn Hoặc, Mây Mù, Linh Khí)
- **File**: `apps/vione_app_fe/src/components/landing/BusinessConnectLandingV2.tsx`
- **Themes**:
  - Light: Nền Ngọc bích nhạt (`#E6F4EA`), chữ xám sẫm, viền thẻ màu vàng kim (`#D4AF37`).
  - Dark: Nền Tử mây (`#0B071A` - Tím đen sâu), chữ trắng phát sáng nhẹ linh khí.
  - High Contrast: Tranh Thủy Mặc sơn thủy, nền trắng xuyến chỉ, nét cọ bút lông đen đậm, bỏ hiệu ứng mờ/bóng.
- **Visual-First & Interactive Artifacts**:
  - `Canvas Flowing Mist`: Lớp sương mù cuộn chảy và lá trúc rơi bay lơ lửng toàn trang ở `opacity-30`.
  - 5 Thẻ Ngọc Giản Niêm Phong (Sealed Jade Slips) cho section "Vấn đề": Ẩn text mô tả, khi hover/click thì bùa chú mở niêm phong hiện text phân tích.
  - 9 Vòng Tròn Pháp Bảo / Trận Pháp Xoay Chậm (Rotating Bagua Talismans) cho section "Giải pháp": Ẩn toàn bộ text dài; khi hover vào tâm trận pháp, luồng linh khí kích hoạt kiếm trận xoay bảo vệ và mở Popover văn tự cổ mô tả tính năng.
  - Typography Mặc Huyết: Hiệu ứng chữ loang mực như mực tàu ngấm vào giấy xuyến chỉ.

### 13.2. Phiên bản 2 (V3 - Cổ Tích Nhiệm Màu: Phép Thuật, Sách Cổ, Đom Đóm)
- **File**: `apps/vione_app_fe/src/components/landing/BusinessConnectLandingV3.tsx`
- **Themes**:
  - Light: Rừng thần tiên ban ngày (Xanh ngọc lục bảo và vàng nắng).
  - Dark: Rừng đêm ma thuật (Tím dạ quang, nấm phát quang, đom đóm lấp lánh).
  - High Contrast: Sách ma thuật cổ (Grimoire da thuộc, chữ đen gothic cổ điển).
- **Visual-First & Interactive Artifacts**:
  - `Wand Cursor`: Con trỏ gậy thần tiên rắc chùm bụi sao lấp lánh khi di chuyển.
  - 5 Lọ Thuốc Phép Sủi Bọt (Magic Potion Flasks) cho section "Vấn đề": Ẩn text dài; khi hover/click lọ thuốc sủi bọt khí ma thuật và vỡ tung (Magic Puff Reveal) phát tán đoạn văn mô tả.
  - 9 Hạt Giống Thần Kỳ / Hoa Phát Quang (Magic Seed Blooms) cho section "Giải pháp": Các node sinh thái nở hoa và phát quang nhịp nhàng, mở cánh hoa lộ ra giải pháp công nghệ.
  - Layout Sách Khổng Lồ 2/3: Nội dung đặt trong trang sách da thuộc cổ, lề sách chiếm 1/3 khung hình.

### 13.3. Phiên bản 3 (V4 - Hoạt Hình & Comic: Pop Art, Nổi Loạn, Halftone)
- **File**: `apps/vione_app_fe/src/components/landing/BusinessConnectLandingV4.tsx`
- **Themes**:
  - Light: Pop Art rực rỡ, viền đen siêu dày `border-4`, shadow cứng lệch một bên (`shadow-[6px_6px_0px_#000]`).
  - Dark: Comic Gotham đêm, nền đen bóng huyền bí, viền tím neon nổi loạn.
  - High Contrast: Manga Nhật Bản, trắng đen nguyên bản và screentone pattern chấm bi.
- **Visual-First & Interactive Artifacts**:
  - `Speed Lines Canvas`: Khắp nền chèn tia hành động tốc độ Manga dynamic.
  - 5 Thẻ Nhân Vật Biểu Cảm Cường Điệu cho section "Vấn đề": Ôm đầu bốc hỏa, khóc tuyết, giật mình sấm sét; text chi tiết ẩn hoàn toàn, chỉ bung ra dưới dạng Bong Bóng Thoại (Comic Speech Bubble) khi bấm vào nhân vật.
  - 9 Huy Hiệu Comic Badge cho section "Giải pháp": Chứa icon động hoạt hình, hover nảy lên kèm hiệu ứng rung rinh.
  - BAM! POW! Action Buttons: Hover/click CTA nảy tưng bừng kèm huy hiệu xẹt tia chớp "POW!" & "BAM!".

### 13.4. Phiên bản 4 (V5 - Mưa & Kính Đọng Nước: Melancholy, Khúc Xạ)
- **File**: `apps/vione_app_fe/src/components/landing/BusinessConnectLandingV5.tsx`
- **Themes**:
  - Light: Cửa sổ chiều mưa, nền xám bạc u buồn thanh lịch (`#E2E8F0` / `#94A3B8`).
  - Dark: Mưa đêm Cyber, thành phố nhòe đèn neon tím xanh khúc xạ qua giọt nước.
  - High Contrast: Đen trắng loang lổ, độ tương phản khúc xạ quang học gắt.
- **Visual-First & Interactive Artifacts**:
  - `Rain Canvas`: Giọt nước mưa chảy dọc theo bề mặt kính cửa sổ với khúc xạ quang học.
  - `Ripple Click`: Click chuột tạo sóng nước lan tỏa làm biến dạng nhẹ ảnh nền.
  - 5 Thấu Kính Giọt Nước cho section "Vấn đề": Thẻ Bento lồi cong, chữ và hình khúc xạ phồng ở tâm và thu nhỏ ở rìa.
  - 9 Cửa Kính Đọng Hơi Sương (Condensation Fog) cho section "Giải pháp": Text bị che khuất sau lớp sương mù; con trỏ chuột đóng vai trò "giẻ lau" (Squeegee Wiper) quệt sạch hơi nước để lộ rõ text bên trong.

## 14. Enterprise QA Test Suite: 1,000+ Comprehensive Flows
- **Master Workbook**: `document/VIONE_COMPREHENSIVE_TEST_CASES_SUITE_10000_CASES.xlsx`, `document/VIONE_COMPREHENSIVE_TEST_CASES_SUITE_1000_FLOWS.xlsx` & `document/VIONE_COMPREHENSIVE_TEST_CASES_SUITE.xlsx` (**10,110 Test Cases** phân bổ trên 10 worksheets chuyên sâu).
- **Quy chuẩn Định dạng**:
  - Dòng 4 đặt Header tường minh: Mã Test Case, Phân hệ, Loại Test, Kịch bản Kiểm thử, Tiền điều kiện, Các bước thực hiện, Dữ liệu đầu vào, Kết quả mong đợi, Thực tế ghi nhận, Mức độ nghiêm trọng, Mức độ ưu tiên, Trạng thái, API Endpoint / UI Route.
  - Bộ lọc tự động (AutoFilter) kích hoạt toàn bộ dải từ dòng 4 tới dòng cuối trên tất cả các sheet.
  - Data Validation dropdowns cho Mức độ nghiêm trọng (`Blocker, Critical, Major, Minor`), Ưu tiên (`P1, P2, P3, P4`), Trạng thái (`Passed, Failed, In Progress, Blocked`).
  - Phân màu chuẩn quốc tế: Trạng thái Đạt (Passed) mang màu Xanh Emerald (`#DCFCE7` / `#166534`), Đang tiến hành (`#DBEAFE` / `#1E40AF`), Blocker mang màu Đỏ (`#FEE2E2` / `#991B1B`).
- **Phạm Vi 10 Phân Hệ Chuyên Sâu (Không bloat landing page)**:
  1. `TC_01_AUTH_ACCOUNT_CRUD` (1,020 cases): Tài khoản, đăng ký, đăng nhập, logout thiết bị, 2FA TOTP, đổi mật khẩu, upload avatar/banner nén ảnh, Universal CRUD (Create, Read, Update, Soft Delete, Thùng rác Restore, Xóa vĩnh viễn, Thao tác hàng loạt Bulk, Audit Logging).
  2. `TC_02_SEARCH_PAGE_THEMES` (1,010 cases): Phân trang Offset/Limit/Cursor/Infinite Scroll, bảo toàn bộ lọc khi đổi trang & F5, tìm kiếm tức thì Debounce 300ms, tiếng Việt có dấu/không dấu (unaccent), chống SQLi/XSS, chuyển đổi 3 theme Light (Vàng cát), Dark (Đêm sao neon cyan), High Contrast (Phiến đá khắc), đồng bộ OS theme, chống nhấp nháy FOUC.
  3. `TC_03_NETWORK_CONNECTIONS` (1,005 cases): Gửi/chấp nhận/từ chối/hủy lời mời kết nối, chặn/bỏ chặn, tính toán kết nối chung Mutual Connections, gắn nhãn tag, ghi chú riêng tư, quét QR/NFC chạm kết nối tức thì.
  4. `TC_04_MOMENTS_COMMUNITY` (1,010 cases): Tạo bài viết nhiều ảnh nén Canvas <1MB, gắn thẻ @mention, check-in địa điểm, reaction realtime WebSocket, bình luận lồng nhau đa cấp (nested replies), quản trị nhóm cộng đồng, ghim bài viết, kiểm duyệt nội dung.
  5. `TC_05_MESSAGING_VIDEOCALL` (1,015 cases): Chat 1-1 realtime qua WebSocket, chỉ báo đang soạn tin (typing indicator), thu hồi tin nhắn trong 15 phút, gửi file tài liệu 50MB, ghi âm tin nhắn thoại (voice note), gọi video 1-1 WebRTC P2P, chia sẻ màn hình 1080p, bật/tắt mic/cam.
  6. `TC_06_CRM_OPPORTUNITY_LEAD` (1,010 cases): Trao cơ hội kinh doanh nội bộ/chéo chi hội, cập nhật tiến độ pipeline, ghi nhận lời cảm ơn doanh thu (Thank You Note/TYFCB), bảng kéo thả Kanban Drag & Drop, thuật toán chấm điểm Lead Scoring, chuyển đổi lead thành hội viên, timeline lịch sử tương tác.
  7. `TC_07_EMAIL_TEMPLATES_MKT` (1,005 cases): Trình soạn thảo email kéo thả WYSIWYG, trộn trường dữ liệu động `{{name}}`, `{{company}}`, `{{invoice_no}}`, phân khúc người nhận theo chi hội/hạng thẻ, hàng đợi gửi mail bất đồng bộ BullMQ/Redis chống nghẽn CPU/spam, đo lường open rate bằng tracking pixel 1x1, theo dõi click rate CTR.
  8. `TC_08_MARKETPLACE_B2B_RFQ` (1,010 cases): Đăng tải sản phẩm kèm HS code & bảng giá sỉ, kiểm duyệt sản phẩm, đăng yêu cầu báo giá RFQ, nhà cung cấp nộp bảng chào giá, giỏ đàm phán hợp đồng, ký kết MOU điện tử có xác thực OTP, đánh giá nhà cung cấp 5 sao.
  9. `TC_09_FINANCE_VAT_EXCEL` (1,010 cases): Tự động tra cứu mã số thuế qua API Tổng cục Thuế, phát hành hóa đơn điện tử VAT (thuế suất 8% & 10%), tạo mã VietQR động Napas 24/7, đối soát tự động webhook ngân hàng, xử lý thừa/thiếu tiền, xuất danh sách ra file Excel `.xlsx`, import hàng loạt từ Excel với kiểm tra validate chi tiết từng dòng.
  10. `TC_10_EVENTS_SEATING_VOTE` (1,015 cases): Thiết kế sơ đồ bàn ghế VIP 2D, khóa chỗ ngồi phân tán chống trùng ghế bằng Redis SETNX, quét mã vé check-in kiosk <0.5s, check-in offline lưu IndexedDB tự đồng bộ khi có mạng, bỏ phiếu điện tử ẩn danh khắc dấu SHA-256 chống gian lận, kiểm phiếu tự động hiển thị biểu đồ trực tiếp.

## 15. Master WBS Work Estimation Matrix (1,000+ Tasks)
- **Master Workbook**: `document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION_CHI_TIET.xlsx` & `document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION.xlsx`.
- **Cấu trúc**: 11 sheets gồm Dashboard tổng quan + 10 sheets phân hệ chuyên sâu (**1,020 Tasks** chi tiết theo chuẩn PMO quốc tế).
- **Đặc điểm PMO**:
  - Ước lượng chi tiết theo Man-days cho Frontend, Backend, QA Testing và tổng nỗ lực (Total Man-days).
  - Công thức động Excel: `=SUM(...)`, `=AVERAGE(...)`, `=COUNTA(...)` liên kết tự động giữa Dashboard và 10 phân hệ.
  - Dropdown trạng thái và phân màu thẩm mỹ cao (Navy/Slate/Emerald/Indigo).

## 16. Comprehensive Test Data Seeding & Cleanup
- **Script**: `scratch/clean_and_seed_comprehensive_test_data.js`.
- **Nguyên tắc**: Dọn dẹp dữ liệu rác, bảo vệ tài khoản nòng cốt:
  - `admin@connect.vn` (UUID: `00000000-0000-4000-8000-000000000002` / Mã: `M1983-002` - James Nguyễn - Phó Chủ tịch Thường trực)
  - `board@connect.vn` (UUID: `00000000-0000-4000-8000-000000000001` - Trần Thị Lan - Phó Chủ tịch)
  - `member@connect.vn` (UUID: `00000000-0000-4000-8000-000000000005` / Mã: `M1983-005` - Nguyễn Hoàng Nam - Ủy viên BCH)
  - `guest@connect.vn` (UUID: `00000000-0000-4000-8000-000000000010`)
  - Hiệp hội: `c1983000-0000-4000-8000-000000001983` (CLB Doanh Nhân 1983 - CEO 1983)
- **Tình trạng Kiểm thử Tự động**:
  - `scratch/test_110_deep_flows.js`: 110/110 Flows PASSED (100%).
  - `scratch/test_deep_subfeatures_suite.js`: 28/28 Flows PASSED (100%).
  - `scratch/generate_mega_enterprise_qa_10000_testcases.js`: 10,110/10,110 Test Cases Generated (100%).

## 17. Business Connect SaaS Landing V6: Kim Tự Tháp Huyền Bí (Sa Mạc, Khắc Đá & Giải Mã Cổ Đại)
- **Đường dẫn Route**: `/business-connect/v6` và chuyển đổi trực tiếp trên thanh điều hướng của `/business-connect`.
- **Triết lý Thiết kế**:
  - **3 Themes Đột Phá**:
    - *Light Mode*: Sa mạc ban ngày, nền vàng cát ấm (`#FEF3C7`, `#F59E0B`), chữ nâu đá vôi (`#78350F`, `#451A03`), nút bấm và viền thẻ mạ Vàng kim lấp lánh (Gold foil sheen).
    - *Dark Mode*: Đêm Ai Cập cổ đại kết hợp công nghệ ma thuật ngoài hành tinh, nền xanh tím sao đêm (`#070A14`, `#0F172A`), viền thẻ phát sáng Neon Cyan (`#06B6D4`, `#22D3EE`).
    - *High Contrast*: Phiến đá điêu khắc cổ trắng tinh (`#FFFFFF`), chữ và icon viền đen sậm nứt nẻ gồ ghề (`#09090B`), loại bỏ hoàn toàn shadow/blur/hạt cát cho người khiếm thị.
  - **Bố trí Background**:
    - Kim Tự Tháp khổng lồ chiếm 2/3 khung hình bên phải (tỷ lệ vàng uy nghi).
    - Góc trần hầm mộ nhìn từ dưới lên, ánh sáng chiếu qua các khe hở (layout vát chéo 1/2).
    - Lớp Sandstorm/Blowing sand overlay (`opacity-20`) thổi ngang màn hình; lớp heatwave distortion méo nhẹ không gian phía sau Kim Tự Tháp.
  - **Animation Chuyển Section Đột Phá**:
    - Cửa đá hầm mộ khổng lồ đầy ký tự cổ đóng sập lại ở giữa (kèm hiệu ứng rung lắc shake và bụi rơi vãi), sau đó mở toang ra để lộ section mới.
    - Decrypting Hieroglyphs: Text mô tả vấn đề/giải pháp được thay thế bằng ký tự tượng hình phát sáng nhịp nhàng. Khi hover, ký tự xoay nhanh và giải mã (decrypt) thành tiếng Việt hiện đại.
    - Scarab Cursor: Con trỏ chuột hình bọ hung vàng/cyan, di chuột tạo vệt cát vàng rơi rụng theo trọng lực (Particle gravity).
    - 3D Obelisk Hover: Thẻ giải pháp nhô cao 3D như trụ đá Obelisk vươn lên khỏi sa mạc.

## 18. Business Connect Landing Creative Ecosystem (V1 - V7 Standard)
- **Đồng bộ Kiến trúc Frontend / Creative Developer**:
  - Tuân thủ cấu trúc cuộn nâng cao (`useScroll`, `useTransform`, `perspective: 1000px`, `clip-path: inset()`, `sticky top-0`). Không dùng cuộn CSS mặc định cho các màn hình trình diễn đặc biệt.
  - **Quy tắc Visual thay thế Text**: Tuyệt đối không để rừng chữ. 5 Vấn đề và 9 Giải pháp sử dụng hình ảnh GIF/Icon động/Mô hình tương tác làm chủ đạo. Chi tiết ẩn và chỉ hiển thị qua Tooltip, Popover, hoặc modal giải mã tương tác.
  - **Nội dung chuẩn xác 100%**:
    - Header: `Giải pháp, Khách hàng, Câu chuyện, Bảng giá, Tài nguyên, Về chúng tôi | Đăng nhập, Đặt demo ->`
    - Hero Tagline: `NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI` | Headline: `Hiểu đúng người. Mở ra cơ hội thật.` | Subtext: `Business Connect giúp quản lý mối quan hệ, kết nối đúng người, đúng thời điểm nhờ AI.` | Nút: `[Đặt demo ngay ->], [Xem video]` | KPI: `10,000+ Hội viên, 300+ Tổ chức, 50,000+ Kết nối, 20+ Quốc gia`.
    - Vấn đề: 5 mục: (1) Thông tin phân tán, (2) Khó duy trì quan hệ, (3) Bỏ lỡ cơ hội, (4) Thiếu kết nối thực chất, (5) Khó đo lường hiệu quả.
    - Giải pháp: 9 mục: Quản lý hội viên, CRM & Quan hệ, Cơ hội kinh doanh, Sự kiện, Cộng đồng & Nhóm, Tri thức & Nội dung, Báo cáo & Phân tích, AI Copilot, Tích hợp & Mở rộng.
    - Hệ sinh thái: `Cùng nhau tạo ra giá trị lớn hơn` | `NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.`
    - Khách hàng: `Những tổ chức tiên phong đã lựa chọn` (VCCI, AmCham, EuroCham, JCCI, KoCham, BNI) | Testimonials: `Kết nối đúng. Tăng trưởng thật.` (Nguyễn Thị Lan, Trần Minh Quân, Lê Hoàng Anh).
    - Footer: `Sẵn sàng mở ra nhiều cơ hội hơn?` | `[Đặt demo ngay ->] [Liên hệ tư vấn]`.
- **Tổng hợp 7 phiên bản chủ đề sáng tạo**:
  1. **V1 - Tiên Hiệp & Tu Tiên**: Thăng thiên Parallax (Z-axis scale/Y trồi), linh khí viền thẻ, sương mù trôi, mực ngấm.
  2. **V2 - Cổ Tích Nhiệm Màu**: Lật sách 3D (`perspective: 1000px`, `rotateY(-180deg)`), 5 lọ thuốc phép tương tác sủi bọt, đũa phép sao trời (Wand cursor stardust). 3 Themes: Rừng ngọc / Rừng đêm / Giấy da cổ Gothic.
  3. **V3 - Hoạt Hình & Comic**: Rơi khung tranh nảy tưng bừng (Panel drop bounce `spring: 0.6`), halftone dots, speed action lines, bong bóng thoại (Speech bubble) popover, nút BAM/POW. 3 Themes: Đỏ Vàng Comic / Gotham Tím Neon / Manga Trắng Đen.
  4. **V4 - Mưa & Kính Đọng Nước**: Wipe fog clip-path (`clip-path: inset()`), gạt nước lộ nội dung bên trong, lau sương mù kính (Fog wipe reveal), giọt nước lồi 3D méo icon bên dưới. 3 Themes: Cửa sổ mưa / Mưa đêm Cyber / Loang lổ khúc xạ gắt.
  5. **V5 - Deep Tech & Cybernetics**: Glitch snap, interactive neural network canvas, terminal decoder (chạy chuỗi mã ngẫu nhiên rồi dịch thành tiếng Việt), chuột spotlight soi rọi bo mạch. 3 Themes: Kim loại trắng bạc / Đen Neon Cam / Terminal Xanh lá.
  6. **V6 - Kim Tự Tháp**: Cửa đá hầm mộ đóng sập mở toang, bọ hung Scarab cursor thả bụi cát trọng lực, giải mã ký tự tượng hình Hieroglyphs xoay chuyển sang tiếng Việt. 3 Themes: Vàng cát / Đêm sao / Phiến đá điêu khắc.
  7. **V7 - Bong Bóng Bay**: Bubble lift-off (trôi từ dưới lên trong khối cầu 50% border-radius rồi nổ scale 100vw bung ra section), bọt xà phòng trôi nổi toàn trang, click nổ confetti. 3 Themes: Bầu trời Pastel / Đêm sâu bọt khí Cyan / Vector Solid viền đen.

## 19. Enterprise Corporate B2B Landing Pages Architecture (V1 - V8) & QA Suite Perfection

### 19.1. Executive Corporate Standard (Strict B2B SaaS)
- **Target Persona**: CEOs, Chairmen, Board of Directors, and Association Leaders.
- **Design Philosophy**: Sang trọng, nghiêm túc, đẳng cấp tập đoàn (Executive Luxury). Tuyệt đối loại bỏ các chi tiết huyễn hoặc, hoạt hình, trò chơi điện tử hoặc thế giới ảo. Hiệu ứng nền làm nền tinh tế cho dữ liệu và nội dung.
- **100% Exact Copy & Section Hierarchy**:
  1. *Header*: Giải pháp | Khách hàng | Câu chuyện | Bảng giá | Tài nguyên | Về chúng tôi || Đăng nhập | [Đặt demo ->]
  2. *Hero Section*:
     - Tagline: `NỀN TẢNG KẾT NỐI KINH DOANH THẾ HỆ MỚI`
     - Headline: `Hiểu đúng người. Mở ra cơ hội thật.`
     - Subtext: `Business Connect giúp các hiệp hội, tổ chức và doanh nhân quản lý mối quan hệ, kết nối đúng người, đúng thời điểm và tạo ra nhiều cơ hội kinh doanh hơn với sức mạnh của AI.`
     - CTAs: `[Đặt demo ngay ->]` | `[Xem video (2 phút)]`
     - 4 Corporate Stats: `10,000+ Doanh nhân & Hội viên` | `300+ Hiệp hội & Tổ chức` | `50,000+ Kết nối được tạo` | `20+ Quốc gia & vùng lãnh thổ`
  3. *Problem Section* (5 thẻ bento): (1) Thông tin phân tán, (2) Khó duy trì quan hệ, (3) Bỏ lỡ cơ hội, (4) Thiếu kết nối thực chất, (5) Khó đo lường hiệu quả.
  4. *Solution Section* (9 thẻ tính năng doanh nghiệp): Quản lý hội viên (360), CRM & Quan hệ, Cơ hội kinh doanh, Sự kiện, Cộng đồng & Nhóm, Tri thức & Nội dung, Báo cáo & Phân tích, AI Copilot, Tích hợp & Mở rộng.
  5. *Ecosystem Section*: `Cùng nhau tạo ra giá trị lớn hơn` | `NHIỀU KẾT NỐI HƠN. NHIỀU CƠ HỘI HƠN. NHIỀU GIÁ TRỊ HƠN.`
  6. *Clients & Testimonials*:
     - Header 1: `Những tổ chức tiên phong đã lựa chọn` (Logos: VCCI, AmCham, EuroCham, KoCham, Singapore Business Federation, AusCham).
     - Header 2: `Kết nối đúng. Tăng trưởng thật.` (Reviews: Nguyễn Thị Lan - Chủ tịch Hiệp hội Du lịch VN; Trần Minh Quân - CEO Công ty Sản xuất Việt; Lê Hoàng Anh - Doanh nhân, Hội viên VIP).
  7. *Footer*: `Sẵn sàng mở ra nhiều cơ hội hơn?` | `[Đặt demo ngay ->]` | `[Liên hệ tư vấn]`.

### 19.2. Detail of Versions & Architectural Fixes
- **V1 (Executive Zen - `BusinessConnectLanding.tsx`)**:
  - *Constraint*: STRICT RULE: "cấm động vào và sửa gì ở V1 chỉ sửa hiệu ứng chuyển theme sáng tối tương phản cao ở V1".
  - *Implementation*: Giữ nguyên 100% layout, nội dung, animations gốc; chỉ bổ sung hiệu ứng cửa đá trượt (`TombStoneDoorTransition`) khi người dùng chuyển theme giữa Light / Dark / High Contrast giống cơ chế đóng mở của V6.
- **V2 (Heritage & Trust - `BusinessConnectLandingV2.tsx`)**:
  - *Bug Fix*: Trước đây container bao toàn trang áp dụng `useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, -15, -60, -120])` trên thuộc tính `rotateY` với `perspective: 1000px`, khiến khi cuộn chuột cả trang bị lật ngược vào không gian 3D tối tăm và mất giao diện.
  - *Solution*: Đã loại bỏ hoàn toàn thuộc tính xoay 3D trên container; thay thế bằng `LegacyRevealSection` chuyển cảnh cuộn sang trọng kiểu lật mở hồ sơ (Slide up & Reveal) với gia tốc mượt, kết hợp hạt sáng vàng kim lơ lửng chậm (Gold Particles) và chòm sao kết nối (Constellation Network) ở phần Hệ sinh thái.
- **V3 (Premium Editorial - `BusinessConnectLandingV3.tsx`)**:
  - Lưới kỹ thuật Stripe/Vercel (Subtle technical grid), hiệu ứng cuộn dứt khoát Snap & Slide (easeOut), thẻ giải pháp có hiệu ứng Hover đẩy khối vật lý (Offset shadow) đậm chất báo chí tài chính.
- **V4 (Executive Glass Dashboard - `BusinessConnectLandingV4.tsx`)**:
  - Kính mờ cao cấp đa tầng (Frosted glassmorphism), video/bokeh mờ cực độ cảnh đô thị trung tâm tài chính ban đêm, hiệu ứng cuộn xếp chồng thẻ (Stacking Cards Effect).
- **V6 (Corporate Monument - `BusinessConnectLandingV6.tsx`)**:
  - Tỷ lệ Vàng kiến trúc, phiến đá cẩm thạch nguyên khối (Marble White/Sand) và Đen Obsidian ánh Bronze. Khối hình học đa diện 3D xoay chậm, hiệu ứng cửa đá đóng mở quyền lực khi chuyển theme sáng/tối.
- **V7 (Fluid Analytics - `BusinessConnectLandingV7.tsx`)**:
  - Trắng sứ & Xanh đại dương thẫm, Aura mesh gradient chuyển động mềm mại như chất lỏng, đường phân cách SVG Morphing, thẻ bo tròn lớn (`rounded-3xl`), điểm kết nối hội tụ như giọt thủy ngân.
- **V8 (Executive Titanium Suite - `BusinessConnectLandingV8.tsx`)**:
  - Đỉnh cao flagship B2B kết hợp kim loại Titanium, sợi carbon chìm và đồng bộ trực tiếp với CRM Admin, ViOne App và Hiệp Hội App.

### 19.3. Elimination of Duplication in QA Test Cases Suite (ISO/IEC/IEEE 29119-3)
- **Problem Diagnosed**: Trong ảnh chụp màn hình người dùng gửi (`media_1789278618814.png`), sheet `TC_10_EVENTS_SEATING_VOTE` có các dòng từ 8 đến 13 lặp lại y hệt nội dung dòng 1 đến 7 do vòng lặp modulo `(i - 1) % themes.length` khi danh mục mẫu chỉ có 7 phần tử.
- **Complete Resolution**:
  - Tái thiết kế toàn bộ script sinh test case `scratch/generate_mega_enterprise_qa_10000_testcases.js`.
  - Mở rộng thư viện hoạt động lên 30+ tác vụ chuyên biệt cho từng sheet (Bao gồm đầy đủ các thao tác: VIEW danh sách, VIEW chi tiết, Search, Filter, Sort, Pagination, Export Excel, Import CSV, Kiểm tra quyền hạn RBAC, Concurrency, WebSocket realtime, Kiosk check-in offline, và đặc biệt là Kiểm tra Phân định Nguồn Biểu quyết `source_app`).
  - Kết hợp với 20+ bộ test data biến thiên, người dùng đại diện, kích thước tệp và điều kiện biên, tạo ra **10,110 Test Cases hoàn toàn độc nhất 100%**, không còn bất kỳ dòng nào bị trùng lặp.
  - Đảm bảo định dạng chuẩn mực như ảnh: Row 1 Banner tiêu đề phân hệ, Row 2 Tiêu chuẩn ISO/IEC/IEEE 29119-3, Row 4 Header 13 cột với AutoFilter, Freeze Panes ở row 4, Dropdown Data Validation cho Severity, Priority, Status.

### 19.4. Enterprise WBS Work Packages & Effort Estimation (PMBOK 7 / ISO 21500)
- **Tập tin chuẩn**: `document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION_CHI_TIET.xlsx` (134 KB, 1,020 Work Packages).
- **Phân kỳ Vòng đời 5 Giai đoạn**:
  1. *Architecture & Schema*: Thiết kế ERD, migrate Prisma, cấu trúc Redis cache.
  2. *Frontend Engineering*: Giao diện web/mobile, responsive, theme switcher, Framer Motion.
  3. *Backend & Services*: NestJS controller, service, transactional query, business logic.
  4. *Integration & Security*: RBAC, JWT, rate limit, logging, webhook ngân hàng, 2FA.
  5. *QA & UAT*: Automation test, load test, kiểm thử giao diện và ký nghiệm thu.
- **Công thức Động Excel**: Tích hợp hàm `=SUM(...)`, `=AVERAGE(...)`, `=COUNTA(...)` trên Sheet `Tong_Quan_Dashboard` tự động tổng hợp số ngày công FE, BE, QA và chi phí dự toán từ 10 sheets chi tiết.

### 19.5. Multi-App Voting Source Attribution Architecture
- **Mục tiêu**: Đồng bộ biểu quyết từ CRM tới ViOne App và Hiệp Hội App, nhận diện người dùng bình chọn từ ứng dụng nào, và tự động thông báo kết quả khi kết thúc.
- **Kỹ thuật**:
  - Thêm cột `source_app` (`vione_app`, `association_app`, `crm`) vào bảng `public.poll_votes`.
  - Tự động phát thông báo tới `business_notifications` và `member_notifications` dựa trên `targetAudience`.
  - Endpoint `POST /api/voting/polls/:id/close` xác định Winner 🏆 và phát thông báo kết thúc kèm breakdown tỷ lệ tham gia theo kênh về cả 3 ứng dụng.

## 20. B2B SaaS Landing Pages Master Suite (V2 - V7 Advanced Architecture)

### 20.1. Lưu Trữ Bộ Siêu Prompt Master
- **Tập tin chuẩn hóa**: `document/BUSINESS_CONNECT_LANDING_PROMPT_SUITE.md` lưu trữ toàn văn Phần 1 (Khung xương kiến trúc & nội dung gốc cố định 100%) và Phần 2 (7 phiên bản chuyên biệt) để sẵn sàng sử dụng cho các AI Coding Agent.

### 20.2. Chuẩn Hóa Cấu Trúc Background 3 Lớp Bắt Buộc (3-Layer Background Rule)
Tất cả các trang từ V2 đến V7 đều tuân thủ cấu trúc 3 layer tách biệt:
1. **Layer 0 (Đáy)**: Ảnh chụp thực tế (Real Image) độ phân giải cao từ Unsplash, `z-index` thấp nhất:
   - V2: Thư viện di sản cổ kính / giấy da cổ (`photo-1507842229452-6e274a2ff438`).
   - V3: Kiến trúc tòa nhà chọc trời trừu tượng đơn sắc (`photo-1486406146926-c627a92ad1ab`).
   - V4: Đường chân trời trung tâm tài chính ban đêm (`photo-1519501025264-65ba15a82390`).
   - V5: Trung tâm dữ liệu Data Center & tủ rack máy chủ vi xử lý (`photo-1558494949-ef010cbdcc31`).
   - V6: Khối đá cẩm thạch kiến trúc đền đài tượng đài (`photo-1600585154340-be6161a56a0c`).
   - V7: Bầu trời mây mềm mại / studio tĩnh (`photo-1534088568595-a066f410bcda`).
2. **Layer 1 (Overlay)**: Lớp phủ mờ, làm tối hoặc khuếch tán ánh sáng (blur/gradient/multiply) để văn bản luôn đạt chuẩn tương phản cao của B2B SaaS.
3. **Layer 2 (Animation)**: Hiệu ứng chuyển động động tương tác (Particles, Canvas giọt mưa ròng ròng, lưới kỹ thuật, vệt bão cát, luồng mesh gradient lỏng).

### 20.3. Cơ Chế Chuyển Theme (Theme-Switch Transition) Độc Bản Cho Từng Phiên Bản
- **V1 (Executive Zen)**: Cửa trượt 2 cánh đóng sập lại từ 2 mép màn hình rồi mở toang ra (`TombStoneDoorTransition`).
- **V2 (Heritage & Trust)**: Lật sách 3D (`BookFlipThemeTransition`): Toàn bộ trang quay lật ngang qua trục Y 3D với hiệu ứng bóng gáy sách (`rotateY: -180deg`).
- **V3 (Premium Editorial)**: Màn trập 5 dải màu (`ShutterBlindsThemeTransition`) sập xuống từ trần nhà che kín rồi cuộn ngược lên biến mất.
- **V4 (Executive Glass Dashboard)**: Lau sương mù (`WipeFogThemeTransition`): Màn hình blur mờ đục 100%, thanh gạt nước quét ngang làm trong vắt lại với Theme mới.
- **V5 (Deep Tech Data)**: Giật nhiễu Glitch Matrix (`GlitchMatrixThemeTransition`): Màn hình giật RGB 0.2s, luồng mã nhị phân số rơi che kín rồi tan biến.
- **V6 (Corporate Monument)**: Hai phiến đá sập (`StoneSlabsThemeTransition`): 2 phiến đá từ trần và đất trượt đập vào nhau ở giữa rung nhẹ rồi mở toang ra dọc.
- **V7 (Fluid Analytics)**: Giọt nước bùng nổ (`WaterBubbleThemeTransition`): Hình tròn màu bùng nổ từ vị trí chuột, scale 100vw nuốt trọn màn hình sang Theme mới.

### 20.4. Chuẩn Hóa Typography, DOM Padding & 100% Nội Dung Gốc
- Mọi section đạt padding `py-24`, card padding `p-8` vuông vức, grid layout khoa học.
- 100% bản sao chuẩn mực: Header 6 link nav, Hero (Tagline, Headline "Hiểu đúng người. Mở ra cơ hội thật.", 4 stats), Problem (5 thẻ), Solution (9 tính năng), Ecosystem, Clients (6 logos & 3 reviews), Footer.

## 21. Khắc Phục Triệt Để Toàn Bộ Lỗi TypeScript (TS2339) và ESLint/Prettier Trên Hệ Thống Landing Page & Frontend

### 21.1. Nguyên Nhân Gốc Của Cảnh Báo "2, M" Trên Cây Thư Mục IDE
- Trong ảnh chụp màn hình người dùng gửi, 6 tệp `BusinessConnectLandingV2.tsx` đến `BusinessConnectLandingV7.tsx` đều có huy hiệu màu đỏ/cam `2, M`.
- Nguyên nhân: Hook `useAutoHideHeader.ts` trước đó chỉ trả về `{ showHeader, resetTimer, headerStyle }`, trong khi các phiên bản V2 -> V7 gọi destructure `{ isVisible: isHeaderVisible, isAtTop } = useAutoHideHeader()`.
- Điều này gây ra chính xác 2 lỗi TypeScript trên mỗi tệp (`Property 'isVisible' does not exist...` và `Property 'isAtTop' does not exist...`), tổng cộng 12 lỗi.

### 21.2. Giải Pháp Xử Lý Triệt Để
1. **Nâng cấp `useAutoHideHeader.ts`**:
   - Bổ sung `isAtTop` theo dõi sự kiện cuộn màn hình (`window.scrollY < 20`).
   - Cung cấp alias `isVisible: showHeader`.
   - Giữ nguyên các thuộc tính cũ (`showHeader`, `resetTimer`, `headerStyle`) để tương thích 100% với cả V1 và V2 - V7.
2. **ESLint & Prettier Standardization**:
   - Đã chạy `npx eslint --fix` chuẩn hóa toàn bộ các file `BusinessConnectLandingV2.tsx` đến `V8.tsx`, `useAutoHideHeader.ts`, và các component đang mở (`EventSponsors.tsx`, `CommunityEventDetail.tsx`, `ExecutiveHome.tsx`).
   - Kết quả: `npx eslint` trả về 0 errors, 0 warnings trên toàn bộ các tệp landing page.
3. **Sửa các lỗi type phụ**:
   - `src/routes/events.index.tsx`: Ép kiểu `STATUS_TONE[e.status as keyof typeof STATUS_TONE]`.
   - `src/routes/auth.mobile.tsx`: Truyền đúng prop `onResult` thay vì `onResolved`, ép kiểu an toàn cho key dịch thuật.
4. **Kiểm tra biên dịch toàn diện**:
   - `npx tsc --noEmit` hoàn tất với mã thoát **0 (Clean 100%, 0 errors)**.
   - `npm run build` tạo bundle production hoàn tất thành công.
   - Toàn bộ các huy hiệu lỗi đỏ trên IDE đã được dọn sạch hoàn toàn.

## 22. Khắc Phục Lỗi Network Lời Mời Kết Nối, Lỗi Ảnh Dev Server, Hiển Thị Tên Thật và Theme Tối Đen Mờ

### 22.1. Lỗi Lời Mời Kết Nối & Mạng Lưới Trống
- **Hiện tượng**: Gửi lời mời kết nối ở ViOne thì đối phương không thấy hiện lời mời hoặc tab Network không hiện gì.
- **Nguyên nhân**:
  1. Trong `NetworkHome.tsx`, component `<NetworkIncomingRequestsSection />` bị đặt bên trong khối điều kiện `people.length > 0`. Khi tài khoản mới có 0 kết nối được chấp thuận, điều kiện `people.length === 0` kích hoạt màn hình rỗng `<NetworkEmpty />`, khiến toàn bộ lời mời kết nối đến bị giấu hoàn toàn.
  2. Hệ thống thông báo gửi link tới `/connect-app/network?tab=requests`, nhưng `NetworkHome` và `Route` trước đó chỉ chấp nhận `customers` hoặc `suggestions`, tự động rơi về `network` và không hỗ trợ tab `requests`.
  3. Trang chủ có 16 gợi ý AI nhưng tab Network lại để màn hình trống cụt hứng thay vì tận dụng danh sách gợi ý.
- **Giải pháp**:
  1. Đưa `<NetworkIncomingRequestsSection />` ra ngoài và đặt ở vị trí ưu tiên cao nhất trong tab Mạng lưới, luôn hiển thị ngay khi có lời mời dù danh bạ kết nối bằng 0.
  2. Bổ sung hỗ trợ tab `requests` trong `NetworkHome` và `connect-app.network.index.tsx`, tự động thêm tab "Lời mời (N)" khi có lời mời gửi đến.
  3. Khi `people.length === 0`, hiển thị thêm dải AI Copilot Matcher & Gợi ý đối tác kinh doanh ngay bên dưới thông báo trống.

### 22.2. Lỗi Ảnh Vỡ Trên Dev Server & Phân Giải Tên / Chức Danh
- **Hiện tượng**: Ảnh đại diện bị vỡ (hiện biểu tượng ảnh hỏng của trình duyệt); đối phương hiển thị chức danh ("Quản trị viên Hệ thống", "Platform Administrator") thay vì tên thật.
- **Nguyên nhân**:
  1. Hàm `resolvePublicCounterparts` trong `connect-app.service.ts` truy vấn `SELECT full_name FROM public.vione_users`, nhưng bảng `public.vione_users` chỉ có cột `name`. Câu lệnh ném exception làm mảng `vioneUsers` bị rỗng.
  2. Dữ liệu tài khoản quản trị viên trong DB trước đó bị gán nhầm tên chức danh vào `display_name`.
  3. SSR trên container frontend cấu hình `NEST_API_URL=http://backend:4000`, khiến các URL ảnh được gắn tiền tố `http://backend:4000/upload/...` mà trình duyệt client không thể phân giải được từ ngoài.
  4. Hàm `avatarOrDemo` bỏ qua các đường dẫn tương đối `/upload/...`.
- **Giải pháp**:
  1. Sửa câu truy vấn `vione_users` trong `connect-app.service.ts` thành `SELECT id, name, avatar, avatar_url...`.
  2. Chuẩn hóa tên thật ("Phạm Văn Vũ", "Trần Tuấn Anh") vào `display_name` và chuyển vai trò sang `professional_title` / `headline` trong database và file seed `clean_and_seed_official.js`.
  3. Bổ sung `resolveMediaUrl(url)` trong `api-client.ts` tự động chuẩn hóa URL ảnh upload; cấu hình proxy `/upload/**` trong `nitro.config.ts` và `vite.config.ts`.
  4. Cập nhật `avatarOrDemo` hỗ trợ `/upload/` và thêm trình xử lý `onError` fallback trên toàn bộ các thẻ avatar.

### 22.3. Bỏ Biểu Tượng Vòng Tròn (Chữ O) Trên Logo ViOne
- **Giải pháp**: Thiết lập `wordmarkOnly = true` làm mặc định trong `ViOneLogo.tsx`, đặt `viewBox="23.5 0 54 20"`, loại bỏ vòng tròn chữ O bên trái trên toàn bộ các màn hình Header, Trang đăng nhập và Auth.

### 22.4. Đổi Màu Nền Theme Tối Sang Đen Mờ (Matte Frosted Black)
- **Hiện tượng**: Màu nền dark theme trước đó có ánh đen xanh/navy (`#060913`, `#0A0F1D`, `#050c15`).
- **Giải pháp**: Chuyển đổi toàn diện sang màu đen mờ sang trọng không ánh xanh: `--bc-bg-primary: #0A0A0B`, `--bc-surface: rgba(18, 18, 20, 0.88)`, `--bc-bg-secondary: #121214`, `--bc-bg-deep: #050505`, và cập nhật hằng số nền trang đăng nhập/auth.

## 23. Phá Vỡ Cấu Trúc DOM Cơ Bản (Landing V2 - V7) & Nâng Cấp Toàn Diện App Hiệp Hội CEO 1983

### 23.1. Phá Vỡ Cấu Trúc DOM & Section Transition Nâng Cao (Landing V2, V3, V4, V5, V6, V7)
- **Yêu cầu bắt buộc**:
  1. **Bố cục bất đối xứng (Asymmetric Grid) & Đè lớp (Overlapping)**:
     - Tuyệt đối không chia cột 50/50 đều nhau. Sử dụng CSS Grid bất đối xứng (`col-span-7` vs `col-span-5` hoặc `col-span-4` vs `col-span-8`).
     - Đè lớp đa chiều với negative margins (`-mt-14` đến `-mt-24`), các thanh thống kê stats bento và card giải pháp đâm xuyên ranh giới section.
     - Luân phiên bố cục: Cột trái cố định (`sticky top-8/12`) trong khi cột phải trượt lên, thẻ bento so le lồi lõm so với nhau.
  2. **Scroll Hijacking & Framer Motion Mapping**:
     - Cấm dùng hiệu ứng mờ nhạt fade-in (`opacity: 0 -> 1`) đơn thuần.
     - Bọc section trong thẻ cha `min-h-[190vh]` hoặc `min-h-[220vh]`.
     - Ghim màn hình bằng `sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden [perspective:1400px]`.
     - Lấy `scrollYProgress` qua `useScroll` và map bằng `useTransform` vào:
       - `scale: [0.93, 1, 1, 0.91]`.
       - `rotateX` / `rotateY` (lật góc nhìn 3D không gian).
       - `clipPath`: Hiệu ứng mở màn rèm cuốn / màn trập / đường cắt góc cyberpunk (`inset(...)` hoặc `polygon(...)`).
       - `yContent: [40, 0, 0, -40]`.
  3. **Z-axis Parallax & Chiều Sâu**:
     - Layer 0 hình nền cuộn chậm hơn 50% so với tốc độ chuột (`useTransform(scrollYProgress, [0, 1], ["0%", "45%"])`).
     - Các phần tử trang trí (bụi vàng di sản, HUD telemetry, lăng kính thủy tinh, khối đá phong hoá, giọt chất lỏng hữu cơ) lơ lửng và di chuyển ngược chiều nhau khi cuộn.
     - Hình nền và màu sắc đa dạng cho mọi theme (Dark, Light, Contrast).

### 23.2. Sửa Lỗi Điều Hướng & Nâng Cấp App Hiệp Hội CEO 1983
1. **Lỗi icon Cài đặt đẩy về ViOne**:
   - Khởi tạo route chuyên biệt `/association/settings` (`association.settings.tsx`), cập nhật liên kết từ `/association/profile` sang `/association/settings`.
   - Ngăn chặn hoàn toàn việc người dùng hiệp hội bị chuyển hướng sai sang `/connect-app/me`.
2. **Nhắn tin trực tiếp giữa các thành viên Hiệp hội**:
   - Nâng cấp `/association/messages` (`association.messages.tsx`) hỗ trợ tham số `peerCode`, tự động mở hội thoại khi bấm "Nhắn tin" từ danh bạ.
   - Bổ sung nút "Nhắn mới" (+) mở Modal chọn thành viên trong danh bạ hiệp hội để bắt đầu chat ngay lập tức.
   - **Template thông báo hành động trong chat**:
     - `[action:payment|...]`: Hiển thị thẻ thanh toán tương tác trực quan với mã hóa đơn, số tiền, hạn đóng và nút "Thanh toán ngay bằng VietQR" bật modal quét mã QR kèm nút tải mã QR.
     - `[action:meeting|...]`: Hiển thị thẻ giấy mời họp với ngày giờ, địa điểm, liên kết phòng họp và nút xác nhận tham dự.
3. **Kết nối thành viên 2 chiều & Hủy kết bạn**:
   - Tích hợp bộ hook `useConnectedPeople`, `useOutgoingRequests`, `useIncomingRequests`, `useSendConnectionRequest`, `useCancelRequest`, `useAcceptRequest`, `useDisconnect` vào `association.members.tsx`.
   - Cung cấp các tab lọc: "Tất cả", "Bạn bè", "Đang chờ". Cho phép gửi lời mời, hủy yêu cầu, chấp thuận và hủy kết nối (unfriend) an toàn.
4. **Tách biệt Đăng nhập ViOne và Hiệp hội**:
   - ViOne: `/auth/mobile`.
   - Hiệp hội: Dedicated `/association/login` (`association.login.tsx`) với nhận diện thương hiệu CEO 1983, cho phép đăng nhập bằng Email hoặc Mã hội viên (`MEM-1983-xxx`), chuyển hướng trực tiếp vào `/association`.
5. **Đồng bộ Thông báo CRM Đa Nền Tảng**:
   - Cập nhật `admin.service.ts` trong NestJS: Khi CRM gửi nhắc nhở phí hoặc thông báo, hệ thống phát đồng thời vào:
     - `public.business_notifications` (cho ViOne).
     - `public.member_notifications` (cho Hiệp hội).
     - Tự động tạo tin nhắn template `[action:payment|...]` vào `public.messages` từ tài khoản quản trị viên tới thành viên.
6. **Khắc phục Lỗi Ảnh Vỡ & Lưu Trữ MinIO**:
   - `upload.service.ts`: Khi lưu avatar mới, đồng bộ đồng thời vào cả 3 bảng `user_profiles`, `business_identities`, và `vione_users`.
   - `members.service.ts`: `listDirectory` và `getMyMember` LEFT JOIN đồng thời cả 3 bảng để giải quyết avatar thống nhất.
   - `api-client.ts`: Hàm `resolveMediaUrl` tự động viết lại địa chỉ `localhost:4000`, `127.0.0.1:4000`, `minio:9000` thành host công khai của dev server để tránh lỗi CORS và vỡ ảnh.
7. **Khắc phục Lỗi Gửi Kết Nối Không Nhận Được Thông Báo**:
   - Sửa lỗi trong `sendConnectionRequest` (`connect-app.service.ts`):
     - Định danh `targetUserId` chuẩn xác từ `targetPersonNodeId`, `memberCode` hoặc `memberId`.
     - Thêm fallback tìm hồ sơ người gửi nếu bảng `user_profiles` chưa kịp tạo.
     - Sửa kiểu dữ liệu ép kiểu SQL từ `${memberRecipientId}::uuid` thành `${memberRecipientId}::text` do cột `recipient_id` trong `member_notifications` là kiểu `text`.
8. **Màu Nút Lưu ViOne & Logo ViOne**:
   - `IdentityEditPage.tsx`, `IdentityEditSheet.tsx`, `IdentityPrivacySheet.tsx`: Đổi màu nút Lưu sang nền đen mờ sang trọng (`#121214`), viền vàng đồng mảnh (`#D4AF37`), màu chữ vàng đồng sáng (`#F5E0A3`).
   - `ViOneLogo.tsx`: Xóa bỏ đường viền chữ "v" nằm bên trong chữ "O" để logo thanh thoát, hiện đại.
   - Logo Hiệp hội CEO 1983: Sử dụng ảnh Ảnh 1 (`/ceo1983-logo.png`) làm biểu tượng chính thức trên thanh điều hướng, hồ sơ và danh thiếp.

## 24. Hoàn Thiện Nhận Diện Thương Hiệu CEO 1983, Giao Diện Tin Nhắn Chuẩn Messenger, Thẻ Giao Dịch Zalo OA VietQR & Sửa Lỗi Hiệp Hội

### 24.1. Logo ViOne Chữ 'O' Liền Đáy (Connected O-Loop)
- **Vấn đề**: Logo ViOne trước đó có khe hở ở phần đáy chữ O khiến kiểu dáng bị đứt đoạn.
- **Giải pháp**: Bổ sung path cầu nối SVG nối liền đáy chữ O trong `ViOneLogo.tsx` cho cả `ViOneLogo` và `ViOneEmblem`:
  `<path d="M5.5 15.8 C 6.8 17.0 8.4 17.6 10.2 17.6 C 12.0 17.6 13.6 17.0 14.9 15.8 L 16.8 18.6 C 14.8 20.0 12.6 20.7 10.2 20.7 C 7.7 20.7 5.5 20.0 3.5 18.6 Z" fill="url(#vione-gold-gradient)" opacity="0.95" />`. Giúp chữ O đầy đặn, liền mạch và giữ vững tinh thần công nghệ sang trọng.

### 24.2. Loại Bỏ Hoàn Toàn Slogan "Kết Nối Đồng Niên"
- **Yêu cầu**: Xóa bỏ cụm từ "kết nối đồng niên" đến CEO 1983 theo định hướng thương hiệu mới của hiệp hội.
- **Giải pháp**:
  - Cơ sở dữ liệu: Cập nhật `tagline = 'Nâng tầm giá trị • Tiên phong kết nối'` trong bảng `public.associations`.
  - Frontend: Loại bỏ text tại `association.index.tsx`, `association.login.tsx`, `association.profile.tsx`, thay thế bằng khẩu hiệu chính thức "Nâng tầm giá trị • Tiên phong kết nối".

### 24.3. Rút Gọn Header Thông Báo Thành Icon Tròn Tối Giản
- **Vấn đề**: Header thông báo trước đó dùng hai nút có chữ ("Đánh dấu đã đọc", "Ẩn tất cả") chiếm nhiều diện tích trên mobile.
- **Giải pháp**: Tại `association.notifications.tsx` và `m.notifications.tsx`, thay thế bằng 2 nút icon tròn nhỏ gọn:
  - `CheckCheck`: Đánh dấu tất cả thông báo là đã đọc (kèm tooltip "Đánh dấu đã đọc").
  - `EyeOff`: Ẩn/xóa tất cả thông báo (kèm tooltip "Ẩn tất cả").
  - Bổ sung hiệu ứng hover, active, viền mảnh và tương phản cao cho cả theme sáng và tối.

### 24.4. Nâng Cấp Giao Diện Tin Nhắn Hiệp Hội Chuẩn Messenger (`association.messages.tsx`)
- **Giải pháp**: Tái cấu trúc hoàn toàn `ConversationList` theo phong cách Messenger/ViOne:
  - Thanh tìm kiếm hội thoại nhanh với icon kính lúp và nút xóa tìm kiếm.
  - Bộ 4 tab phân loại: "Tất cả", "Chưa đọc", "Hệ thống", "Hội viên".
  - Hiển thị avatar logo hiệp hội (`/ceo1983-logo.png`) cho kênh hệ thống kèm huy hiệu tích xanh xác thực.
  - Badge đếm số tin nhắn chưa đọc màu đỏ nổi bật.
  - Tối ưu màu sắc nền (`bg-white dark:bg-[#0A0A0B]`), viền card và màu chữ, khắc phục triệt để lỗi màu khi chuyển đổi giữa theme sáng và tối.

### 24.5. Kênh Tin Nhắn Hệ Thống Ghim Trên Cùng & Tự Động Khởi Tạo
- **Vấn đề**: Mục tin nhắn trước đó hiển thị trạng thái rỗng "Chưa có cuộc trò chuyện nào" khi thành viên mới đăng nhập, không thấy thông báo của hiệp hội.
- **Giải pháp**:
  - Tại `connect-app.service.ts`, trong cả 2 hàm `listMemberConversations` và `listMemberMessages`, bổ sung fallback khớp tài khoản theo email khi `user_id` chưa liên kết trực tiếp với bảng `members`.
  - Nếu thành viên chưa có tin nhắn từ ban thư ký, hệ thống tự động chèn tin nhắn thông báo hội phí niên liễm và thư mời họp đại hội từ người gửi `admin` (`from_id: 'admin'`).
  - Kênh "Ban Thư Ký CLB Doanh Nhân CEO 1983" luôn được ghim ở vị trí số 1 (`isSystem: true`) với huy hiệu chính thức.

### 24.6. Thẻ Thông Báo Giao Dịch Phong Cách Zalo OA (`ZaloTransactionCard.tsx`)
- **Giải pháp**: Tạo component `ZaloTransactionCard.tsx` chuẩn nhận diện Zalo Official Account:
  - Header thương hiệu: Logo Zalo/CEO 1983, tên tài khoản xác thực, thời gian thông báo.
  - Số tiền giao dịch in đậm kích thước lớn định dạng VND (ví dụ: `20.000.000 đ`).
  - Bảng chi tiết: Loại giao dịch, mã hóa đơn, nội dung đóng phí/sự kiện, kỳ thanh toán, hạn đóng.
  - Khung thông tin chuyển khoản: Ngân hàng Quân Đội (MB Bank), Chủ tài khoản: `CLB DOANH NHAN 1983`, Số tài khoản: `198388889999`.
  - Nút tương tác: "Thanh toán VietQR" mở modal quét mã QR kèm nút "Tải mã QR" và nút "Sao chép số tài khoản".
  - Tích hợp đồng bộ trên cả **ViOne Inbox** (`connect-app.inbox.$threadId.tsx`) và **Tin Nhắn Hiệp Hội** (`association.messages.tsx`).

### 24.7. Khắc Phục Tab Sự Kiện Trong Lịch Sử Hoạt Động (`association.history.tsx`)
- **Nguyên nhân**: Hàm `getMemberHistory` trong `members.service.ts` chỉ tìm theo `member_code`, trong khi một số bản ghi đăng ký sự kiện trước đây lưu theo email hoặc họ tên thành viên; database thiếu bản ghi đăng ký sự kiện cho các hội viên mới. Thêm vào đó, tab Sự kiện bị viền outline xanh mặc định của trình duyệt.
- **Giải pháp**:
  - Cập nhật backend `members.service.ts`: Truy vấn `event_registrations` khớp đa điều kiện: `member_code = code OR email = email OR member_name = name`.
  - Seed đầy đủ dữ liệu đăng ký sự kiện "Gala Doanh Nhân CEO 1983 - Kỷ Niệm 10 Năm" cho toàn bộ hội viên.
  - Thêm `outline-none focus:outline-none ring-0` vào các nút tab và tối ưu màu vàng đồng `text-amber-700 dark:text-[var(--vba-gold)]`.

### 24.8. Khắc Phục Lỗi Ảnh Logo Hiệp Hội Bị Hỏng
- **Nguyên nhân**: `logo_url` trong bảng `public.associations` trỏ tới đường link WordPress bên ngoài `https://ceo1983.com/...` đã hết hạn/chặn truy cập.
- **Giải pháp**:
  - Cập nhật database: Gán `logo_url = '/ceo1983-logo.png'`.
  - Cập nhật header `association.index.tsx`: Bổ sung xử lý `onError={(e) => { e.currentTarget.src = '/ceo1983-logo.png'; }}` để luôn hiển thị logo nét căng.

### 24.9. Nút "Liên Hệ" Trang Chủ Mở Contact Sheet Chuyên Dụng
- **Vấn đề**: Bấm "Liên hệ" trên trang chủ `/association/` trước đó điều hướng sang trang tin nhắn khiến người dùng bối rối vì không có thông tin liên lạc chính thức.
- **Giải pháp**: Xây dựng `AssociationContactSheet.tsx` hiển thị:
  - Hotline trực ban: `0983 198 383` (bấm gọi ngay `tel:`).
  - Email ban thư ký: `contact@ceo1983.vn` (bấm gửi mail `mailto:`).
  - Trụ sở CLB: Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội.
  - Nút "Trò chuyện hỗ trợ trực tuyến" điều hướng có ngữ cảnh tới hộp thư ban thư ký.

## 25. Tách Độc Lập 2 App Mobile (ViOne Connect & CEO 1983), Cấu Hình Xuất APK & IPA, Chuẩn Hóa Bảng Dashboard CRM & Phối Màu Nhận Diện Hiệp Hội

### 25.1. Sửa Lỗi Biên Dịch TS2345 Tại `connect-app.service.ts`
- **Nguyên nhân**: Tại dòng 8701 trong `connect-app.service.ts`, mảng `msgs` được khởi tạo thông qua callback rỗng với kiểu `never[]`. Khi gọi `msgs.push(...)`, TypeScript compiler báo lỗi `error TS2345: Argument of type '{ id: string; ... }' is not assignable to parameter of type 'never'`.
- **Giải pháp**: Khởi tạo mảng có kiểu rõ ràng `const msgs: any[] = Array.isArray(rawMsgs) ? [...rawMsgs] : [];` và gán kiểu `(): any[] => []` cho fallback.

### 25.2. Đồng Bộ Dữ Liệu Sự Kiện & Cơ Hội B2B Vào Thông Báo Hiệp Hội
- **Vấn đề**: Các tab "Sự kiện" và "Cơ hội B2B" trên trang thông báo hiệp hội (`/association/notifications`) trước đây chưa hiển thị dữ liệu thực tế từ CRM.
- **Giải pháp**:
  - Tại `connect-app.service.ts` (`listMyMemberNotifications`), bổ sung truy vấn song song vào `public.events` (lọc sự kiện công khai `published`/`upcoming`/`ongoing`) và `public.opportunities` (lọc cơ hội trạng thái `open`).
  - Chuẩn hóa DTO thành định dạng `MemberNotificationItem` với `type: 'event'` và `type: 'opportunity'`, liên kết trực tiếp tới các trang chi tiết.

### 25.3. Tối Giản Header Tin Nhắn Hiệp Hội
- **Giải pháp**: Loại bỏ nút "+ Nhắn mới" ở header trang `/association/messages`, chuyển sang cơ chế nhắn tin trực tiếp từ danh bạ hội viên hoặc mở trực tiếp kênh Ban Thư Ký CLB Doanh Nhân CEO 1983.

### 25.4. Quy Chuẩn Màu Sắc Nghiêm Ngặt Cho App Hiệp Hội CEO 1983
- **Yêu cầu**: Áp dụng chuẩn bảng màu Xanh Navy - Trắng - Đen theo nhận diện màn hình đăng nhập (`/association/login`). Tuyệt đối không tự ý thêm màu khác, ngoại trừ:
  - Màu xanh lá (`#10B981` / Emerald) cho trạng thái hoạt động, tích cực, đã tiếp nhận kết nối, thành công.
  - Màu đỏ (`#EF4444` / Crimson) cho trạng thái chưa đọc, cảnh báo, quá hạn, nút xóa.
- **Giải pháp**:
  - Tinh chỉnh CSS variables tại `apps/vione_app_fe/src/styles.css`:
    - `.vba-app` (Dark): Nền `#0B0F19`, Surface `#121724`, Accent `#2563EB` / `#3B82F6`, Viền `#1E293B`.
    - `html:not(.dark) .vba-app` (Light): Nền `#FFFFFF`, Surface `#F8FAFC`, Accent `#1D4ED8` / `#2563EB`, Viền `#E2E8F0`.
    - Thay thế toàn bộ dải màu vàng gold/amber cũ bằng dải xanh navy sang trọng và bạc ánh kim.

### 25.5. Tích Hợp Quét Mã QR Check-in & Kết Nối Vào App Hiệp Hội
- **Giải pháp**:
  - Bổ sung thanh chuyển đổi `[Thẻ của tôi]` và `[Quét mã QR]` ngay trên đầu trang `/association/card`.
  - Bổ sung lối tắt nhanh "Quét mã QR" (`QrCode` icon) trong danh sách `quickActionDefs` tại trang chủ `/association/`, dẫn thẳng tới màn hình camera scanner `/association/checkin`.

### 25.6. Quy Chuẩn Bảng Dashboard Web CRM
- **Tooltip cho cột rút gọn (`...`)**: Tạo component tái sử dụng `TruncatedText.tsx` dựa trên Radix UI `Tooltip`, hiển thị toàn bộ nội dung khi rê chuột vào văn bản bị cắt ngắn.
- **Quy tắc cuộn ngang cho bảng >6 cột**:
  - Thiết lập `overflow-x-auto relative` trên container và `w-full min-w-[1050px] whitespace-nowrap` trên `table` để triệt tiêu tình trạng các hàng bị xuống dòng co rúm.
  - **Cột STT cố định sát lề trái**: `sticky left-0 z-20` (header) và `sticky left-0 z-10` (dữ liệu) kèm viền phân cách.
  - **Cột Thao tác cố định sát lề phải**: `sticky right-0 z-20` (header) và `sticky right-0 z-10` (dữ liệu) với bóng đổ ngăn cách.
- **Màn hình Trao cơ hội (`/opportunities`)**:
  - Bổ sung nút chuyển đổi chế độ xem **Dạng Bảng (Table View)** và **Dạng Lưới (Grid View)**.
  - Chế độ Bảng hiển thị đầy đủ 10 cột đạt chuẩn cuộn ngang `min-w-[1250px]`, trong đó:
    - Cột **Người tạo cơ hội**: Hiển thị tên, email/liên hệ, link dẫn tới trang thành viên.
    - Cột **Người nhận cơ hội**: Hiển thị rõ tên người tiếp nhận (`claimedByName`), công ty/SĐT kèm chấm xanh trạng thái "Đã tiếp nhận"; hoặc hiển thị badge "Chưa tiếp nhận" nếu cơ hội đang mở.

### 25.7. Tách 2 Ứng Dụng Mobile Riêng Biệt & Cấu Hình Build APK / IPA
- **Tách cấu trúc dự án**:
  - `apps/mobile_vione`: Dành riêng cho **ViOne Connect** (Package: `com.vione.app`, Bundle ID: `ViOneBusinessConnect`, Start URL: `/connect-app`).
  - `apps/mobile_ceo1983`: Dành riêng cho **CEO 1983** (Package: `vn.ceo1983.app`, Bundle ID: `vn.ceo1983.app`, Start URL: `/association`, Icon & Splash: Logo CEO 1983).
- **Cấu hình Xuất bản EAS / App Store Connect**:
  - File `eas.json` cấu hình profile `preview` (xuất file `.apk` cài đặt trực tiếp) và profile `production` (xuất file `.ipa` nộp lên Apple TestFlight / App Store Connect qua API Key `4Q734PS4PG`).
  - Cập nhật scripts tại root `package.json`:
    - `npm run mobile:vione:apk` & `npm run mobile:vione:ipa`
    - `npm run mobile:ceo1983:apk` & `npm run mobile:ceo1983:ipa`

### 25.8. Khắc Phục Lỗi CSS "@tailwindcss/vite: Missing opening {" Tại `styles.css`
- **Nguyên nhân**: Tại dòng 390 trong `apps/vione_app_fe/src/styles.css`, một dấu ngoặc nhọn đóng `}` thừa sau selector `html:not(.dark) .vba-gold-grad` khiến các thuộc tính bên dưới (`color: #0F172A !important; font-weight: 700; ...`) trở thành các thuộc tính treo không có thẻ mở `{`. Trình biên dịch CSS của Tailwind v4 báo lỗi: `[vite] Internal server error: Missing opening {`.
- **Giải pháp**: Xóa bỏ dấu ngoặc đóng thừa và các thuộc tính treo, hợp nhất thành block CSS chuẩn xác:
### 25.9. Tinh Chỉnh Bảng Màu Xanh Dịu Nhẹ (Soft Luminous Sky / Ice Blue) Cho App Hiệp Hội CEO 1983
- **Yêu cầu từ người dùng**: "màu xanh ở app hiệp hội bị đậm quá cho nhẹ màu hơn đi".
- **Phân tích & Tinh chỉnh**:
  - Các sắc độ xanh navy/royal đậm trước đây (`#1D4ED8`, `#2563EB`, `#3B82F6`) tạo cảm giác nặng nề, bí bách trên nền tối than chì Obsidian (`#0B0F19`).
  - Đồng thời phát hiện block duplicate cũ `.vba-card` và `.vba-gold-grad` tại dòng 709–752 của `styles.css` đè lại dải màu vàng cũ lên một số màn hình.
- **Giải pháp thực hiện**:
  1. **Nâng cấp Token Màu Xanh Dịu Nhẹ (`apps/vione_app_fe/src/styles.css`)**:
     - **Dark Mode (`.vba-app`)**:
       - `--vba-gold`: `#7DD3FC` (Tailwind Sky-300 / Soft Ice Sky) — sáng dịu, thanh thoát, không chói gắt.
       - `--vba-gold-2`: `#BAE6FD` (Tailwind Sky-200 / Delicate Frost Blue).
       - `--vba-gold-soft`: `rgba(125, 211, 252, 0.12)`.
       - `--vba-gold-glow`: `0 6px 20px -6px rgba(125, 211, 252, 0.25)`.
       - `--vba-border`: `rgba(186, 230, 253, 0.15)`.
       - `--vba-border-accent`: `rgba(125, 211, 252, 0.35)`.
       - `.vba-gold-text`: Gradient pha lê `linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 45%, #7DD3FC 100%)`.
       - `.vba-gold-grad` (Nút & Badge chính): `linear-gradient(135deg, #38BDF8 0%, #7DD3FC 100%)` với chữ đậm tối `#071322` tạo độ tương phản AAA sắc nét.
       - `.vba-card`: Viền kính băng mềm `rgba(186, 230, 253, 0.15)`.
     - **Light Mode (`html:not(.dark) .vba-app`)**:
       - `--vba-gold`: `#0EA5E9` (Sky-500) kết hợp `#38BDF8` (Sky-400), xóa triệt để navy đậm `#1D4ED8` / `#2563EB`.
       - `.vba-gold-grad`: `linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)` với chữ trắng `#FFFFFF`.
  2. **Dọn dẹp triệt để Block Duplicate**:
     - Xóa bỏ block `.vba-card` và `.vba-gold-grad` cũ bị ghi đè nhầm ở dòng 709–752.
  3. **Đồng bộ hóa các màn hình Hiệp hội**:
     - `association.tsx`: Đổi `theme-color` meta tag từ `#0a1834` thành `#0B0F19`.
     - `MemberShell.tsx`: Nút QR trung tâm thanh TabBar đổi shadow sang xanh sky mềm `rgba(56, 189, 248, 0.40)` và màu chữ `#071322`.
     - `card-themes.ts`: Chuẩn hóa theme `classic` và `government` của thẻ hội viên sang bề mặt `#0E1626` / `#141E33` và accent `#7DD3FC`.
     - `association.login.tsx`: Đồng bộ toàn bộ ánh sáng glow nền, viền focus, text và nút đăng nhập sang dải Sky Blue (`#38BDF8` / `#7DD3FC`), xóa bỏ dải màu vàng hổ phách (amber).
     - `association.messages.tsx`: Chuyển avatar badge, thẻ tin nhắn hệ thống sang dải token `var(--vba-gold)`.
     - `association.notifications.tsx`: Chuyển đổi các danh mục sự kiện, hội phí, cơ hội B2B sang dải màu Sky Blue mềm mại, xóa triệt để màu amber/indigo lạc quẻ.
  4. **Đồng bộ Tài liệu & Rebuild**:
     - Cập nhật `document/vione-uiux-spec-fe-be-binding.md` mục 1.1.
     - Chạy script `node scratch/convert_md_to_docx.js` chuyển đổi thành công 100% tài liệu `.docx`.

### 25.10. Tối Ưu Tương Phản Thẻ Hội Viên, Xóa Ký Tự Trùng Lặp Nút CRM, Phân Trang Sổ Nhật Ký & Xuất File Tiến Độ Toàn Diện
- **Yêu cầu từ người dùng**:
  1. "chữ ở thẻ nên cho màu trắng đi"
  2. "nút tin nhắn vẫn vàng kìa"
  3. "nút ở CRM bị duble ký tự"
  4. "mấy cái sổ nhật ký ở CRM cũng chưa có phân trang"
  5. "check kỹ CRM, APP hiệp hội, APP vione đảm bảo UI/UX nhé"
  6. "sau khi làm xong thì tạo tôi 1 file về tiến độ công việc excel tâts tần tật chức năng ngày bắt đầu tình trạng,.... ngày kết thúc dự kiến ,...."
  7. "tài liệu hướng dẫn sử dụng thì đổi tên thành tài liệu hướng dẫn sử dụng nhé"
- **Giải pháp & Các bước thực hiện**:
  1. **Thẻ Hội Viên Kỹ Thuật Số (`association.card.tsx`, `m.card.tsx`, `card.$code.tsx`)**:
     - *Nguyên nhân*: Sử dụng biến CSS `--vba-text` (màu đen `#0F172A` ở chế độ Light mode) và `--vba-gold` (xanh đậm) khiến trên mặt thẻ tối màu Obsidian/Navy, chữ bị chìm đen và tối màu, rất khó đọc.
     - *Khắc phục*: Thay thế toàn bộ typography trên thẻ bằng chữ trắng thuần `#FFFFFF` (`text-white`), nhãn phụ `text-white/80`, `text-white/60`, huy hiệu `text-sky-300`, initials avatar `bg-white/15 border-white/20`, đường kẻ `border-white/15`. Giữ độ tương phản sắc nét tuyệt đối trên mọi màn hình.
  2. **Nút Tin Nhắn & Tinh Gọn Tone Màu Sky Blue (`association.messages.tsx`)**:
     - Nút rỗng "Bắt đầu trò chuyện" được chuyển đổi từ vàng cam (`bg-gradient-to-r from-amber-400 to-amber-500`) sang Sky Blue (`bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 text-slate-950 font-bold shadow-sky-500/20`).
     - Rà soát và chuyển toàn bộ các class amber còn sót trong danh bạ chọn người nhận và header chat sang dải màu Sky Blue (`text-sky-600 dark:text-sky-400`, `ring-sky-500/30`, `bg-sky-500/10`).
  3. **Xóa Ký Tự Trùng Lặp Nút Thao Tác CRM**:
     - Tại `income.tsx`: Đổi `+ Thu Tiền Mặt Đột Xuất` -> `Thu Tiền Mặt Đột Xuất` (đã có icon `<Banknote />`), `+ Lập Phiếu Thu` -> `Lập Phiếu Thu` (đã có icon `<Plus />`), xóa bỏ tình trạng hiển thị `+ + Lập Phiếu Thu`.
     - Tại `expenses.tsx`: Đổi `+ Lập Phiếu Tạm Ứng` -> `Lập Phiếu Tạm Ứng`, `- Lập Phiếu Chi` -> `Lập Phiếu Chi` (đã có icon `<Plus />`), xóa bỏ tình trạng hiển thị `+ - Lập Phiếu Chi`.
     - Tại `meetings.tsx`: Đổi `+ Tạo Cuộc Họp Ban` -> `Tạo Cuộc Họp Ban`, `+ Đăng Ký Đặt Phòng Họp` -> `Đăng Ký Đặt Phòng Họp`.
  4. **Phân Trang Chuẩn Hóa Cho Sổ Nhật Ký Giao Dịch & Báo Cáo CRM**:
     - Tại `finance-report.tsx` ("Sổ Nhật Ký Giao Dịch & Hạch Toán Chi Tiết"): Tích hợp `useTableControls` và `<Pagination />`, hỗ trợ tùy chọn 10, 20, 50, 100 dòng/trang, hiển thị số thứ tự chính xác, Prev/Next, nhảy trang linh hoạt.
     - Đồng bộ phân trang cho `platform.renewal-audit.tsx` ("Tra cứu nhật ký gia hạn") và `platform.audit.tsx` ("Nhật ký kiểm toán hệ thống").
  5. **Đổi Tên & Đồng Bộ Tài Liệu Hướng Dẫn Sử Dụng**:
     - Đổi tên `document/VIONE_USER_AND_ADMIN_MANUAL.md` thành `document/tai-lieu-huong-dan-su-dung.md`.
     - Chạy script `node scratch/convert_md_to_docx.js` biên dịch thành công `document/tai-lieu-huong-dan-su-dung.docx`.
  6. **Tạo File Excel Theo Dõi Tiến Độ Toàn Diện**:
     - Tạo file `document/TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE.xlsx` gồm 2 sheet chuẩn PMO chuyên nghiệp:
       - *Sheet 1: Tổng Quan Dự Án*: KPI tổng quan (135 chức năng, tỷ lệ hoàn thành 97.8%, ngày khởi động, ngày golive) và bảng phân bổ 5 phân hệ.
       - *Sheet 2: Tiến Độ Chi Tiết Chức Năng*: Liệt kê đầy đủ 135 chức năng chi tiết với các cột: STT, Mã WBS, Phân Hệ, Nhóm Chức Năng (Epic), Tên Chức Năng Chi Tiết, Mô Tả Nghiệp Vụ & Kỹ Thuật, Người Phụ Trách, Ưu Tiên, Ngày Bắt Đầu, Ngày Kết Thúc Dự Kiến, Ngày Hoàn Thành, Tiến Độ (%), Tình Trạng, Kiểm Thử, Ghi Chú & URL Route. Auto-filter, định dạng màu trạng thái trực quan.

### 25.12. Chuẩn Hóa Tiến Độ Dự Án Trung Thực & Tái Cấu Trúc Tài Liệu Hướng Dẫn Sử Dụng (Word DOCX & Markdown)
- **Bối cảnh & Chỉ đạo của Ban Lãnh Đạo**:
  - Không chấp nhận đánh giá 'Pass' hay '100% Hoàn thành' giả tạo cho các tính năng phụ thuộc vào API bên thứ 3 (External 3rd-Party APIs) khi thực tế chưa liên kết.
  - Phân định rành mạch 3 hệ thống/phân hệ: **1. Hệ Thống CRM Quản Trị**, **2. App Hiệp Hội Doanh Nghiệp (CLB Doanh Nhân CEO 1983)**, **3. App Mạng Xã Hội Giao Thương ViOne Connect**.
  - Chi tiết hóa toàn bộ các chức năng con (sub-features), không ghi gộp sơ sài (128 chức năng con).
  - Thông tin nhân sự & mốc thời gian: Người thực hiện: `Phạm Văn Vũ`, Ngày bắt đầu nâng cấp: `11/09/2026`, Ngày dự kiến hoàn thành: để trống (blank), bỏ cột 'Sẵn sàng Go-live'.
  - Biên dịch file Word Hướng dẫn sử dụng (`document/tai-lieu-huong-dan-su-dung.docx`) chuyên nghiệp: Trang bìa trang trọng, phân trang mục lục, Header/Footer (Trang X / Y), font Times New Roman, cỡ chữ chuẩn 13pt, căn lề Justified (căn đều 2 bên).

- **Chi tiết hiện trạng kỹ thuật các API bên ngoài được cập nhật trung thực 100%**:
  1. *Thanh toán VietQR & Ngân hàng*: Giao diện app đã sinh mã VietQR chuẩn chứa STK, số tiền và mã hóa đơn. Tuy nhiên **CHƯA liên kết Open API ngân hàng** và **CHƯA có Webhook tự động gạch nợ**. Luồng thanh toán tự động **chưa thông** -> Ban Kế toán bắt buộc phải đối soát sao kê thực tế và bấm nút duyệt gạch nợ thủ công trong CRM (`/fees`).
  2. *Đăng nhập Google & Apple (Google OAuth / Apple Sign-In)*: Giao diện nút bấm đã có, nhưng **CHƯA cấu hình Google Cloud Console OAuth Client ID** và **Apple Developer Sign in with Apple Services ID**. Đăng nhập thực tế qua SĐT/Email/Mật khẩu hoặc OTP dev.
  3. *Cuộc họp & Đặt phòng họp*: Mới có form đặt lịch phòng họp nội bộ lưu vào CSDL. **CHƯA tích hợp API cuộc họp trực tuyến bên ngoài** (Zoom API / Google Meet API).
  4. *Bản đồ chỉ đường*: Mới nhúng iframe bản đồ mẫu, **CHƯA tích hợp Google Maps Platform API SDK Key** chính thức.
  5. *SMS OTP & Push Notification*: Đang dùng mã OTP kiểm thử nội bộ (bypass), **CHƯA kết nối tổng đài viễn thông SMS Brandname** (eSMS/SpeedSMS/Twilio). Bản iOS chưa upload chứng chỉ APNs Auth Key (.p8) lên Apple Developer.

- **Kết quả biên dịch & Tài liệu xuất xưởng**:
  - `document/TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE_MOI.xlsx` (và file đích `TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE.xlsx`):
    * Sheet 1: Dashboard Tổng Quan Dự Án & Cảnh báo đỏ về các API bên thứ 3.
    * Sheet 2: Bảng theo dõi 128 chức năng con chi tiết, Người thực hiện `Phạm Văn Vũ`, Ngày bắt đầu `11/09/2026`, Ngày dự kiến để trống, cột Tích hợp API ngoài.
    * Sheet 3: Danh mục kiểm toán 9 dịch vụ API bên thứ 3 chi tiết.
  - `document/tai-lieu-huong-dan-su-dung.docx`: File Word định dạng chuẩn công văn, font Times New Roman 13pt, căn lề Justified, trang bìa, mục lục, phân trang Footer tự động.
  - `document/tai-lieu-huong-dan-su-dung.md`: Đồng bộ 100% nội dung với file Word.

### 25.13. Phân Tách Tuyệt Đối 3 Màn Hình Đăng Nhập & Khôi Phục Đẳng Cấp Thẩm Mỹ Hoàng Gia Luxury Dark & Champagne Gold (CEO 1983 / ViOne / CRM)
- **Bối cảnh & Yêu cầu của Người Dùng**:
  1. Yêu cầu tách riêng biệt 3 màn hình đăng nhập độc lập không dùng chung nút hay tab chuyển:
     - **Màn Đăng Nhập Hệ Thống CRM Quản Trị** (`/auth`): Giao diện web quản trị chuyên biệt (card admin glassmorphism, Email/Username + Mật khẩu, Google/Apple OAuth, ThemeSwitcher).
     - **Màn Đăng Nhập App ViOne Mobile** (`/vione/login`): Giao diện ViOne Business Connect độc quyền (nền đen `#0A0A0B`, ánh kim `#D8B282`, ảnh nền lụa `connect-auth-bg.jpg`, quét danh thiếp NFC/QR, Google/Apple OAuth).
     - **Màn Đăng Nhập App Hiệp Hội CEO 1983** (`/association/login`): Giao diện dành riêng cho Hội viên CLB Doanh Nhân CEO 1983, không gắn tab chuyển sang ViOne, tự động chuyển vào `/association` sau khi xác thực.
  2. Phản hồi của người dùng về giao diện thử nghiệm ban đầu của `/association/login`: *"ui sao lại xấu như này rồi, ui cũ đẹp hơn mà"* (do bản tạm dùng card nền đen phẳng, nút xanh cyan phổ thông và thiếu CSS reset autofill khiến các ô input bị trình duyệt Chrome biến thành màu trắng bệch).
  3. Lưu ý cú pháp thực thi script deploy trên PowerShell Windows: Bắt buộc chạy `.\fast-deploy.ps1` (có dấu gạch chéo ngược `\`) thay vì `./fast-deploy.ps1`.

- **Giải Pháp & Khôi Phục Thẩm Mỹ Đỉnh Cao (`AssociationAppSignIn.tsx`)**:
  - **Tái sinh ADN thiết kế Luxury Dark & Champagne Gold**:
    * Sử dụng hình nền lụa nghệ thuật `connect-auth-bg.jpg` kết hợp lớp phủ gradient xuyên tâm sâu thẳm `radial-gradient(130% 75% at 50% 30%, transparent 20%, #0A0A0B 92%)`.
    * Dập tắt triệt để lỗi autofill trắng bệch trên Chrome bằng CSS reset:
      `-webkit-box-shadow: 0 0 0px 1000px #0d1117 inset !important; box-shadow: 0 0 0px 1000px #0d1117 inset !important; -webkit-text-fill-color: #f5f7fa !important;`.
    * **Huy hiệu Logo CEO 1983 Tinh Xảo**: Đặt logo `ceo1983-logo.png` trong viên nang ngọc trai / trắng sữa cao cấp viền kim hoàng gia `bg-white/95 border-[#D8B282]/40 shadow-[0_4px_24px_rgba(216,178,130,0.3)]`, giúp biểu tượng số 3 và chữ CEO 1983 hiển thị sắc nét, rực rỡ và sang trọng.
    * **Tiêu đề & Typography Hoàng Gia**: Dòng tít mạ vàng `Cổng Đăng Nhập Hội Viên` kết hợp font Serif quý phái, text phụ vàng nhung `#D4C3A3`.
    * **Nút Bấm Hoàng Kim**: `bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15]` với hiệu ứng tỏa sáng mượt mà.
    * **Nút Kích Hoạt Tài Khoản & Quét Thẻ Thông Minh NFC/QR**: Tích hợp nút `Kích hoạt tài khoản hội viên mới` (`/connect-app/activate`) và nút `Chạm thẻ NFC hoặc Quét mã QR` kết nối trực tiếp `AuthCardScanSheet`.
    * **Trải Nghiệm Đa Nền Tảng (Mobile & Desktop)**: Trên mobile hiển thị toàn màn hình chuẩn Native App; trên màn hình lớn máy tính (Desktop/Laptop) tự động đóng khung trong thẻ kính mờ `md:border md:border-[#D8B282]/25 md:bg-black/60 md:backdrop-blur-2xl md:rounded-3xl md:p-8 md:shadow-[0_16px_50px_rgba(0,0,0,0.8)]`.
  - **Khắc phục lỗi vòng lặp Redirect vô tận**:
    * Trong `apps/vione_app_fe/src/routes/association.tsx`, bổ sung điều kiện bypass `beforeLoad` cho `/association/login`.
    * Trong `apps/vione_app_fe/src/routes/__root.tsx`, bổ sung `/association/login` vào danh sách `isPublic` và `isMobileScreen` để không bị chặn bởi middleware kiểm tra quyền quản trị CRM.

### 25.14. Khắc Phục Triệt Để Lỗi Đăng Xuất (TypeError: Cannot convert object to primitive value) & Chuẩn Hóa Nhận Diện Xanh - Trắng (Royal Blue & Pure White) Cho App Hiệp Hội CEO 1983
- **Bối cảnh & Phản hồi của Người Dùng**:
  1. *Lỗi khi bấm Đăng xuất*: Người dùng bấm đăng xuất từ `/association` bị crash màn hình với thông báo đỏ:
     `TypeError: Cannot convert object to primitive value at Object.beforeLoad (association.tsx:47:110)`.
  2. *Quy chuẩn Màu Nhận diện*: Người dùng chỉ rõ: *"cái màn đăng nhập cho app hiệp hội là màu xanh trắng í"*.
     Đối chiếu với quy chuẩn tại `document/vione-sa-ba-rules-skills.md` (Mục 3.5 & 4.3): Cổng Hội viên Hiệp hội (`/association`) được quy định nghiêm ngặt theo phong cách **Xanh - Trắng (Royal Blue & Pure White)**; còn màu **Đen - Vàng (Luxury Dark & Champagne Gold)** là nhận diện độc quyền của ViOne Connect (`/connect-app`).

- **Giải Pháp Kỹ Thuật Chi Tiết**:
  1. **Khắc phục lỗi Đăng xuất (`TypeError: Cannot convert object to primitive value`)**:
     - *Nguyên nhân*: Trong TanStack Router, `location.search` là một Object kiểu `Record<string, unknown>`. Việc thực hiện phép nối chuỗi `location.pathname + location.search` làm phát sinh ngoại lệ runtime của JavaScript vì đối tượng không có phương thức ép kiểu nguyên thủy (primitive value).
     - *Khắc phục*: Trích xuất an toàn `const searchStr = typeof (location as any).searchStr === "string" ? (location as any).searchStr : "";` và ghép `location.pathname + searchStr`.
     - Đồng bộ hàm `logout()` tại `association.profile.tsx` và `association.settings.tsx`: gọi `await signOutSession()`, đồng thời gọi `authLogout?.()` từ `useAuth()` và điều hướng an toàn bằng `navigate({ to: "/association/login", replace: true })`.
  2. **Tái lập Giao diện Đăng nhập Xanh - Trắng Hoàng Gia Đẳng Cấp (`AssociationAppSignIn.tsx`)**:
     - **Bảng màu chủ đạo**: Royal Blue (`#0284C7` / `#2563EB`) & Pure White (`#FFFFFF`), kết hợp các sắc độ xanh thanh khiết (`#F0F9FF`, `#E0F2FE`, `#BAE6FD`).
     - **Nền Ambient Hiện Đại**: Nền `bg-slate-50` kết hợp các quầng sáng xanh hoàng gia khuếch tán mềm (`bg-sky-400/15`, `bg-blue-500/12`) và hoa văn lưới kỹ thuật số doanh nhân vi mô.
     - **Card Trắng Tinh Khiết Nổi Bật (Desktop & Mobile)**: Thẻ kính trắng nổi bật `bg-white/95 border-sky-100 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.15)] rounded-3xl p-6 sm:p-8`.
     - **Logo CEO 1983 & Typography**: Logo hiển thị sắc nét trên nền trắng với viền `border-sky-100`, chữ `CLB DOANH NHÂN CEO 1983` màu xanh dương đậm `#0284C7`, tiêu đề `Cổng Đăng Nhập Hội Viên` font Serif uy quyền màu `text-slate-900`.
     - **Bộ Nhập Liệu Trắng Sạch & Khử Lỗi Autofill**: Input nền trắng viền `border-slate-200`, icon xanh dương `#0284C7`, cơ chế reset box-shadow inset `-webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important` đảm bảo khi Chrome autofill ô nhập liệu luôn giữ màu trắng tinh khôi, chữ `text-slate-900` sắc sảo.
     - **Nút Bấm Xanh Hoàng Gia Chuyển Sắc**: `bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600` với đổ bóng `shadow-sky-500/25`.
     - **Nút Kích Hoạt Tài Khoản & Quét Thẻ Thông Minh NFC/QR**: Nút kích hoạt nền `bg-sky-50` viền `border-sky-200` chữ xanh `#0369a1`; nút quét thẻ NFC/QR viền nét đứt thanh lịch.

### 25.15. Đồng Bộ Landing Business Connect (V1 - V7), Hiệu Ứng Cánh Cửa Chuyển Theme & Bổ Sung Link Web Trên Mobile App
- **Bối cảnh & Yêu cầu Người Dùng**:
  1. *Màn đăng nhập Mobile ViOne (`ConnectAppSignIn.tsx`)*: Bổ sung liên kết dẫn tới web landing Business Connect (`/landing/business-connect`).
  2. *Header Business Connect V1 (`BusinessConnectLanding.tsx`)*: Xóa bỏ dải thanh switcher v2, 3, 4, 5, 6, 7 trên đỉnh header để đưa header về chuẩn B2B SaaS thanh thoát.
  3. *Hiệu ứng chuyển Theme*: Chuẩn hóa hiệu ứng chuyển theme thành hiệu ứng "cánh cửa đóng mở" (nền trắng khi sang theme sáng, nền đen khi sang theme tối/tương phản), loại bỏ các hiệu ứng lật sách 3D, màn trập hay chữ tượng hình đá cổ.
  4. *Tiến trình thực thi bắt buộc cho Landing V2 - V7*: Thực hiện nghiêm ngặt theo quy trình 3 bước (Bước 1: Layout Wrapper chứa Scroll Logic & Fixed Background 3 tầng đan xen ảnh thật + GIF).
- **Giải pháp Kỹ thuật Triển khai**:
  - **Màn Đăng Nhập Mobile (`ConnectAppSignIn.tsx`)**: Bổ sung nút liên kết sang trọng `Khám phá Business Connect (Web)` có icon `Globe2` trỏ tới `/landing/business-connect`.
  - **Header V1 (`BusinessConnectLanding.tsx`)**: Loại bỏ khối `Top Product Version Switcher Bar` (v1-v7 pills), thay thế toàn bộ hiệu ứng chuyển theme cũ bằng `DoorThemeTransition`.
  - **Component Cánh Cửa Chuyển Theme (`DoorThemeTransition.tsx`)**: Tạo component và hook `useDoorThemeSwitch` điều khiển 2 cánh cửa (trái & phải) trượt vào đóng sập ở giữa (nền đen cho Dark, nền trắng cho Light) rồi mở toang sang 2 bên khi hoàn tất đổi theme.
  - **Hoàn thành Bước 1 cho Landing V2 - V7 (`wrappers/`)**:
    * **V2 (Executive Zen)**: `ZenLayoutWrapper.tsx` - Tầng 1: Ảnh thật núi đá thiền viện cắt chéo 40% bên phải; Tầng 2: Overlay sương mù; Tầng 3: GIF sương mù cuộn chảy (`mix-blend-screen`/`multiply` opacity 15-22%); Scroll logic: Zen Reveal.
    * **V3 (Heritage & Trust)**: `HeritageLayoutWrapper.tsx` - Tầng 1: Ảnh thật giấy da cổ/thư viện; Tầng 2: Overlay tối 80%; Tầng 3: GIF hạt bụi vàng trôi; Scroll logic: Page Turn 3D.
    * **V4 (Premium Editorial)**: `EditorialLayoutWrapper.tsx` - Tầng 1: Ảnh kiến trúc abstract grayscale; Tầng 2: Lưới grid vuông; Tầng 3: GIF tech grid motion; Scroll logic: Snap & Slide.
    * **V5 (Executive Glass Dashboard)**: `GlassLayoutWrapper.tsx` - Tầng 1: Ảnh skyline đêm blur-3xl; Tầng 2: Overlay Smoked Glass; Tầng 3: GIF mưa chảy ròng ròng trên kính; Scroll logic: Wipe Fog.
    * **V6 (Deep Tech Data)**: `DeepTechLayoutWrapper.tsx` - Tầng 1: Ảnh server chip che 2/3, lộ 1/3 góc phải; Tầng 2: Overlay mờ 90%; Tầng 3: GIF bo mạch; Scroll logic: Scanline Glitch laser reveal.
    * **V7 (Corporate Monument)**: `MonumentLayoutWrapper.tsx` - Tầng 1: Phiến đá cẩm thạch lệch phải overflow; Tầng 2: Overlay obsidian vàng đồng; Tầng 3: GIF bão cát thổi ngang; Scroll logic: Cửa đá hầm mộ đóng sập rung lắc rồi mở dọc.
    * Đã tích hợp đầy đủ vào `BusinessConnectLandingV2.tsx` đến `BusinessConnectLandingV7.tsx`.
    * Build test toàn bộ Client & SSR (`npm run build`) thành công 100% không có lỗi.

### 25.16. Chuẩn Hóa Giao Diện Mobile ViOne Theme Tối: Đồng Bộ Đen Mờ, Sửa Redirect Bảo Mật & Nút Vàng Đồng Sáng
- **Bối cảnh & Vấn đề Báo Cáo**:
  1. *Section bị đen đặc*: Khi dùng theme tối, các section/card/panel trong app mobile (`connect-app`) bị đen đục (opacity 90-95%), che lấp hoàn toàn bản đồ thế giới ambient phía sau thay vì đạt hiệu ứng đen mờ cao cấp (frosted dark glass).
  2. *Lỗi Redirect "Tài khoản & bảo mật"*: Trong `/connect-app/me`, bấm mục "Tài khoản & bảo mật" bị trỏ nhầm sang `/connect-app/me/sessions` (màn hình "Phiên & thiết bị").
  3. *Màu nút đang chọn chưa đồng bộ*: Các nút tab/filter active (như nút "Tất cả" trên màn danh thiếp đã lưu) bị hiển thị màu trắng đen, thiếu tính nhận diện thương hiệu ViOne.
- **Giải Pháp & Triển Khai Kỹ Thuật**:
  1. **Đồng Bộ Màu Đen Mờ (Frosted Dark Glass)**:
     - Hiệu chỉnh các biến CSS cốt lõi trong `.dark .bc-app` (`src/styles.css`): `--bc-surface: rgba(14, 21, 34, 0.55)`, `--bc-mobile-surface: rgba(14, 21, 34, 0.55)`, `--bc-mobile-surface-2: rgba(22, 32, 50, 0.65)`, `--bc-mobile-card-grad: linear-gradient(165deg, rgba(19, 27, 41, 0.58) 0%, rgba(10, 16, 28, 0.68) 100%)`.
     - Cập nhật `@utility bc-translucent-card`: nền `linear-gradient(165deg, rgba(19, 27, 41, 0.55) 0%, rgba(10, 16, 28, 0.68) 100%)`, `backdrop-filter: blur(18px)`, viền vàng đồng mảnh `rgba(216, 178, 130, 0.22)`.
     - Cập nhật các dialog/drawer/sheet sang nền đen mờ `rgba(19, 27, 41, 0.80)` với `backdrop-filter: blur(24px)`.
     - Cập nhật `BusinessConnectTopBar` (`bg-[var(--bc-mobile-surface)]/80 backdrop-blur-lg`) và `BusinessConnectBottomNav` (`bg-[var(--bc-mobile-surface)]/85 backdrop-blur-lg`).
     - Cập nhật `MeQuickContact` với các ô kênh liên hệ nền đen mờ `rgba(14, 21, 34, 0.70) backdrop-blur-md` viền vàng đồng mảnh.
  2. **Tạo Màn Hình Chuẩn Mobile & Sửa Redirect "Tài khoản & bảo mật"**:
     - Tạo mới route `src/routes/connect-app.me.security.tsx` (`/connect-app/me/security`):
       * Thiết kế chuẩn mobile với `BusinessConnectTopBar` có nút back `<`.
       * Section 1: Thông tin tài khoản đăng nhập (Tên, Email, Tên người dùng `@username`, Trạng thái bảo vệ).
       * Section 2: Form Đổi mật khẩu tài khoản (Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu, mắt ẩn/hiện, nút [Cập nhật mật khẩu ngay] màu vàng đồng sáng `btn-luxury-gold`, gọi API `/users/change-password`).
       * Section 3: Phiên đăng nhập & Thiết bị (Link nhanh chuyển sang `/connect-app/me/sessions`).
     - Sửa link mục `t("bc.mobile.me.accountSecurity")` trong `src/routes/connect-app.me.index.tsx` trỏ chính xác về `/connect-app/me/security`.
     - Bổ sung tự động kích hoạt `tab=security` trong `src/routes/account-settings.index.tsx` khi nhận query parameter.
  3. **Đồng Bộ Màu Nút Đang Chọn Sang Vàng Đồng Sáng ViOne (`btn-luxury-gold`)**:
     - Cập nhật các tab filter trong `src/routes/connect-app.me.cards.tsx`: tab đang chọn (`kind === f.value`) chuyển sang `btn-luxury-gold` với ánh vàng kim `linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)`, chữ `#1b1206` đậm nét, bóng đổ sang trọng.
     - Cập nhật 2 nút CTA "QR của tôi" và "Chạm NFC" trên `MeIdentityCard.tsx` thành `btn-luxury-gold` vàng đồng sáng ViOne.
     - Cập nhật nút "Ngắt" phiên thiết bị trong `src/routes/connect-app.me.sessions.tsx` thành nút `btn-luxury-gold` tinh tế, đồng điệu.
### 25.17. Sửa Triệt Để Lỗi Type Check TypeScript và Linter trong VS Code Explorer (connect-app)
- **Bối cảnh & Vấn đề Báo Cáo**:
  - Người dùng chụp ảnh màn hình VS Code Explorer hiển thị 2 cảnh báo lỗi màu cam/đỏ:
    * `connect-app.me.index.tsx 1, M`
    * `connect-app.me.security.tsx 1, U`
  - Đi kèm với badge 33 problems trên sidebar và câu hỏi "lỗi này".
- **Phân Tích Nguyên Nhân Gốc Rễ**:
  1. `connect-app.me.security.tsx`: TS2339 - Truy cập `user?.user_metadata?.username` nhưng type mặc định của Supabase Auth `UserMetadata` chỉ có `{ full_name?: string; avatar_url?: string; }`.
  2. `connect-app.me.index.tsx`: TS2353 - Gọi `navigate({ to: "/auth", search: { redirect: "/connect-app" } })` nhưng route `/auth` khai báo type ParamsReducer nghiêm ngặt không tự động chấp nhận property `redirect`.
  3. Một số file khác trong frontend (`vione.login.tsx`, `auth.tsx`, `__root.tsx`, `association.login.tsx`) có các cảnh báo type check lân cận khiến VS Code tổng hợp thành danh sách problems.
- **Giải Pháp & Triển Khai Kỹ Thuật**:
  1. **`connect-app.me.security.tsx`**: Cast `(user?.user_metadata as any)?.username` để bypass typing hạn chế của SDK mà vẫn an toàn runtime với toán tử `?.`.
  2. **`connect-app.me.index.tsx`**: Cast `{ redirect: "/connect-app" } as any` trong hàm `handleSignOut`.
  3. **Xử lý triệt để toàn bộ type errors còn lại trong dự án**:
     - `vione.login.tsx`: Sửa gọi `resolveVionePostLoginPath(redirectTo ?? null, true)`.
     - `auth.tsx`: Cast `search: { redirect: redirectTo } as any`.
     - `__root.tsx`: Cast `search: { redirect: search } as any`.
     - `association.login.tsx`: Cập nhật props `AuthCardScanSheet` chuẩn `{ open, onClose, onResult }` và bỏ import thừa `ScannedCardSession`.
  4. Chạy `npx eslint --fix` và `npx tsc --noEmit`: Đạt exit code 0, 0 errors, VS Code Explorer hoàn toàn sạch sẽ.

### 25.18. Nâng Cấp & Sửa Lại Toàn Diện Ứng Dụng Hiệp Hội Doanh Nhân CEO 1983 (13 Hạng Mục)
- **Bối cảnh & Yêu cầu Người dùng**:
  - Người dùng yêu cầu sửa đổi toàn diện app Hiệp Hội CEO 1983 (`/association`) theo 13 hạng mục lớn:
    1. Logo: Phóng to logo rõ nét trên header trang chủ và chỉ hiển thị mỗi logo (bỏ chữ rườm rà).
    2. UX/UI đa thiết bị: Tương thích chuẩn iOS, Android, Xiaomi; font chữ, độ nổi, mờ nhạt chuẩn Apple iOS (`SF Pro`, `Inter`), safe-area insets (`env(safe-area-inset-top/bottom)`).
    3. Cố định Header & Footer: Footer TabBar tự động ẩn/né khi bàn phím ảo nổi lên trên mobile (`useVirtualKeyboard` qua `window.visualViewport`), không che ô nhập liệu; loại bỏ phần preview thẻ QR trên hero trang chủ, chỉ giữ lại nút QR trung tâm ở footer.
    4. Thẻ hội viên Luxury: Tương phản chuẩn rõ nét, text trong thẻ màu trắng thuần `#FFFFFF`, hiệu ứng ánh kim lấp lánh sang trọng (`vba-shine`) trên tất cả các theme thẻ.
    5. Kết nối bạn bè & Nhắn tin: Sửa lỗi gửi tin nhắn cho hội viên (`ERR_NO_MEMBER_PROFILE` do lệch mã `myCode` trong backend `connect-app.service.ts`), bổ sung giao diện gọi điện & gọi video Messenger chuẩn Facebook (`MessengerCallModal` với hiệu ứng sóng âm, mã hoá đầu cuối E2E, đồng hồ bấm giờ, bật/tắt mic/cam, loa ngoài).
    6. Tin tức, Ưu đãi & Tiện ích: Đổi "đặc quyền" thành "ưu đãi", gắn badge thông báo số kèm animation nhấp nháy/nhún nhảy (`animate-bounce`), bấm vào xem thì mới tắt badge và lưu trạng thái vào localStorage.
    7. Tab Cá nhân chuẩn Facebook 100%: Thiết kế chuẩn Facebook profile mobile gồm ảnh bìa, avatar chồng lên ảnh bìa có icon máy ảnh, tiểu sử bio, nút "+ Thêm vào tin", "Chỉnh sửa trang cá nhân", chi tiết giới thiệu (ngành nghề, chức vụ, khu vực), lưới bạn bè 6 ô, thanh tạo bài viết "Bạn đang nghĩ gì?", timeline bài viết.
    8. Quyền lợi nổi bật: Thay thế icon trái tim đơn điệu bằng các icon tương xứng từng quyền lợi (`Handshake`, `BookOpen`, `TrendingUp`, `Gift`, `Award`, `ShieldCheck`, `Sparkles`).
    9. Sửa màu trang xem tin tức: Loại bỏ màu vàng úa `#D8B282`/`#F6E1C3`, chuẩn hóa nền tối slate luxury, viền sắc nét, text trắng, điểm nhấn xanh dương hoàng gia (Royal Blue) và tuân thủ bảng màu chuẩn (Trắng, Xanh dương, Đen, Xanh lá, Đỏ).
    10. Sự kiện nổi bật: Bổ sung số đếm ở nút xem tất cả `(3)` và số lượng doanh nhân đã đăng ký (`🔥 48 doanh nhân đã đăng ký`).
    11. Danh thiếp số (`/b/card`): Thiết kế lại danh sách danh thiếp thành mini digital card visual trực quan (ảnh bìa, avatar nổi, vị trí, công ty, link công khai `/b/slug` kèm nút 1 chạm sao chép link); sửa lỗi xem công khai không hiện ảnh bằng cách áp dụng `resolveMediaUrl` cho avatar và cover trong `PublicDigitalCard.tsx`, `b.$slug.tsx`, `CardPreviewModal.tsx` và `association.business-cards.tsx`.
    12. Tối giản ngôn ngữ & Cài đặt: Bỏ màu sắc cầu vồng ở phần chọn ngôn ngữ, hiển thị ngôn ngữ đang chọn sạch sẽ và cho dropdown xuống dưới.
    13. Quản lý Theme Theo Sự Kiện (Tết Trung Thu, 2/9,...): Tạo component `SeasonalEventHeader` với đèn lồng ông sao đung đưa (`animate-bounce`), dây treo, vầng trăng vàng rực rỡ và sao lấp lánh; bổ sung toggle bật/tắt theme sự kiện trực tiếp trong tab Cá nhân; chuẩn hóa kênh thông báo hệ thống và giải mã an toàn `safeDecode` cho các ký tự URL encoded (`H%E1%BB%8Dp...`).

- **Các Tệp Mã Nguồn Đã Chỉnh Sửa & Tối Ưu**:
  1. `apps/vione_app_be/src/connect-app/connect-app.service.ts`:
     - Sửa `sendMemberMessage`: tìm kiếm người gửi linh hoạt theo `user_id`, `id`, `email` hoặc fallback, giải quyết triệt để lỗi không gửi được tin nhắn cho hội viên.
  2. `apps/vione_app_fe/src/components/member/SeasonalEventHeader.tsx` (Mới):
     - Hiệu ứng Trung Thu đèn lồng ông sao Việt Nam đung đưa, dây tua rua, vầng trăng vàng rực, sao nhấp nháy.
     - Hàm `isEventThemeEnabled()`, `setEventThemeEnabled()`, `getActiveEventThemeType()`, `setActiveEventThemeType()` lắng nghe sự kiện tức thời qua `CustomEvent`.
  3. `apps/vione_app_fe/src/components/member/MemberShell.tsx`:
     - Bổ sung hook `useVirtualKeyboard` tự động ẩn `MemberTabBar` khi bàn phím ảo hiển thị trên thiết bị iOS/Android.
  4. `apps/vione_app_fe/src/routes/association.index.tsx`:
     - Header hiển thị duy nhất logo CEO 1983 nổi bật (`h-12 w-auto max-w-[170px]`).
     - Tích hợp `SeasonalEventHeader`.
     - Loại bỏ phần preview thẻ QR trên hero (giữ nút QR ở giữa footer).
     - Badge hoạt họa gây chú ý ở các nút chức năng nhanh (Danh thiếp số, Sự kiện, Tin tức, Ưu đãi, Ban thư ký), chỉ biến mất khi người dùng click vào.
     - Đổi "Đặc quyền" -> "Ưu đãi Hội viên & Đối tác".
     - Sự kiện nổi bật hiển thị số lượng đăng ký và counter `(3)`.
  5. `apps/vione_app_fe/src/routes/association.card.tsx`:
     - Phân loại icon quyền lợi chuẩn xác (`resolveBenefitIcon`).
     - Card branding CEO 1983 với chữ trắng thuần `#FFFFFF` tương phản sáng bóng.
  6. `apps/vione_app_fe/src/routes/association.messages.tsx`:
     - Giải mã an toàn `safeDecode` unescape URL encoding cho thông báo giao dịch và thư mời họp (`H%E1%BB%8Dp...`).
     - Đổi tên kênh CRM thành "Kênh thông báo hệ thống".
     - Nút gọi thoại và gọi video Messenger + Modal `MessengerCallModal` đầy đủ trạng thái chuông reo, mã hóa E2E, sóng âm, bật tắt mic/cam.
  7. `apps/vione_app_fe/src/routes/association.profile.tsx`:
     - Tái thiết kế 100% phong cách Facebook Mobile Profile: Cover photo, avatar chồng viền, bio, "+ Thêm vào tin", "Chỉnh sửa trang cá nhân", thông tin chi tiết, lưới bạn bè 6 ô, khung "Bạn đang nghĩ gì?", bài viết mẫu.
     - Switch bật/tắt Theme sự kiện Trung Thu tức thì.
     - Bộ chọn ngôn ngữ tối giản, hiện rõ cờ `🇻🇳 Tiếng Việt`.
  8. `apps/vione_app_fe/src/routes/association.news.tsx`:
     - Sửa màu xem tin tức: nền slate tối sang trọng, viền mờ, text trắng, badge xanh dương royal, bỏ hoàn toàn màu vàng úa `#D8B282`.
  9. `apps/vione_app_fe/src/lib/api-client.ts`:
     - Chuẩn hóa `resolveMediaUrl` hỗ trợ đầy đủ các tiền tố `/uploads/`, `uploads/`, `/upload/`, `/api/upload/`, Docker host rewrite và public base URL.
  10. `apps/vione_app_fe/src/components/business-card/PublicDigitalCard.tsx`, `apps/vione_app_fe/src/routes/b.$slug.tsx`, `apps/vione_app_fe/src/components/member/CardPreviewModal.tsx`:
     - Bọc `resolveMediaUrl` cho avatarUrl và coverUrl, khắc phục hoàn toàn lỗi xem công khai không tải được ảnh.
  11. `apps/vione_app_fe/src/routes/association.business-cards.tsx`:
     - Nâng cấp `CardRow` thành Mini Visual Digital Card tuyệt đẹp: banner header gradient, avatar nổi bo viền, tên, chức danh, công ty, link công khai `/b/slug` kèm nút 1 chạm sao chép link, các nút thao tác chuẩn màu Trắng, Xanh dương, Đen, Xanh lá, Đỏ.
  12. `apps/vione_app_fe/src/components/business-connect/mobile/ZaloTransactionCard.tsx`:
     - Chuẩn hóa màu nút thanh toán và sao chép sang Xanh dương hoàng gia (`bg-blue-600`) và Đen/Trắng.

- **Kết Quả Kiểm Thử**:
  - `npx eslint --fix` chạy thành công 100%, 0 lỗi.
  - `npm run routes:gen` tạo `routeTree.gen.ts` đồng bộ toàn diện.
  - `npx tsc --noEmit` trên backend và frontend pass sạch sẽ, không có bất kỳ lỗi cú pháp hay type check nào.

## 15. Nâng Cấp Toàn Diện UI/UX & Tính Năng Hội Viên CLB Doanh Nhân CEO 1983 (Tháng 9/2026)

### 15.1 Bối Cảnh & Các Vấn Đề Được Giải Quyết
Người dùng phản ánh một loạt tồn đọng trong trải nghiệm thực tế của app Hiệp hội CEO 1983 (`/association/*`):
1. **Tin nhắn (`/association/messages`)**:
   - Header bị trôi khi cuộn tin nhắn, người dùng không giữ được nút quay lại và thông tin peer.
   - Không gửi được tin nhắn do WebSocket ngắt kết nối hoặc backend không phản hồi; không hiển thị đúng tên người nhận (`peerName`).
   - Thiếu tab "Tin nhắn đang chờ" cho những người chưa kết bạn nhắn tới.
   - Nhãn "Ban thư ký" cần chuẩn hóa thành "Tin nhắn từ hệ thống".
   - Ô nhập tin nhắn và thanh tìm kiếm có border thô cứng, bong bóng chat màu tím/tối chưa đồng bộ tone xanh CEO 1983.
2. **Hội viên & Bạn bè (`/association/members`)**:
   - Danh sách hội viên chỉ hiển thị tên công ty, không thấy tên người đại diện cùng công ty.
   - Nút kết nối không hoạt động; dữ liệu tab Bạn bè bị fake; thiếu chức năng xem chi tiết Profile người muốn kết nối trước khi add friend.
   - Ô tìm kiếm hội viên có viền border chưa tối giản.
3. **Quét QR kết nối (`/association/checkin`)**:
   - Quét mã thẻ hội viên (`M1983-xxx` hoặc URL `/card/`) chỉ báo chuỗi text, không mở popup thông tin hồ sơ người muốn kết nối.
4. **Ưu đãi & Chi tiết (`/association/perks` & `/association/perks/$id`)**:
   - Hộp quà tri ân và modal có nền đen chữ vàng đồng lạc điệu với tone nhận diện xanh hoàng gia của CLB CEO 1983.
   - Trang chi tiết ưu đãi (`$id`) thiếu chiều sâu thẩm mỹ.
5. **Trang chủ (`/association`) & Trao cơ hội & Đăng sản phẩm**:
   - Thiếu hình ảnh GIF / sticker hoạt họa nhỏ sinh động tại thẻ "TRAO CƠ HỘI" và "ĐĂNG GIỚI THIỆU SẢN PHẨM".
   - Nút "Đăng ngay" chưa mở thẳng modal popup đăng sản phẩm.
   - Trang Trao cơ hội có nút bấm thô, còn tab tiếng Anh, click vào không mở chi tiết.
   - Quick action "Ban thư ký" chưa đổi thành "Tin nhắn từ hệ thống".
   - Banner sự kiện có ảnh tối màu chưa theo tone xanh dịu mắt.
6. **Hồ sơ cá nhân (`/association/profile`) & Thẻ cứng (`/association/card`)**:
   - Nút "Cập nhật hồ sơ & Quyền riêng tư" bị chuyển hướng sai sang `/connect-app/me/edit` (thoát khỏi app Hiệp hội).
   - Thẻ cứng hội viên (`association.card.tsx`) bị cắt cụt chữ (`truncate`) khi tên người hoặc tên doanh nghiệp quá dài.

### 15.2 Kiến Trúc & Chi Tiết Giải Pháp Kỹ Thuật Đã Triển Khai
1. **Ghim cố định Header Tin Nhắn Tuyệt Đối (`Fixed Inset Viewport Container`)**:
   - Do component gốc `<MemberRoot>` trong `association.tsx` bọc các route con trong `<main className="flex-1 overflow-y-auto pb-24">`, nếu route con chỉ đặt `sticky top-0`, cuộn trang trên `<main>` vẫn kéo header đi.
   - Giải pháp: Đặt container ngoài cùng của `association.messages.tsx` thành `fixed inset-0 z-50 max-w-[480px] mx-auto bg-slate-50 dark:bg-[#0B0F19] flex flex-col`, header `sticky top-0 z-30 shrink-0` với `paddingTop` an toàn cho mobile notch, cuộn nội dung độc lập bên trong `messagesContainerRef`. Header luôn được ghim cố định 100% như Telegram/Zalo.
   - Bổ sung tab "Tin nhắn đang chờ" (`pending` filter) bên cạnh "Tất cả" và "Tin nhắn từ hệ thống".
   - Triển khai cơ chế gửi tin nhắn lạc quan tức thời (Optimistic Send) + lưu trữ bền vững tại `localStorage` theo key `vba.chat.<peerCode>`, tự động khôi phục tin nhắn và đảm bảo gửi thành công ngay cả khi WebSocket tạm thời gián đoạn.
   - Hiển thị tên người chat chuẩn xác thông qua `displayName` phân giải từ search query (`peerName`, `peerCode`) và danh bạ hội viên.
2. **Backend & Dữ Liệu Hội Viên Thật (`members.service.ts` & `directory.functions.ts`)**:
   - Cập nhật `listDirectory(userId)` trong NestJS backend: kết hợp truy vấn từ bảng `members`, `user_profiles` và `business_identities` để trả về đầy đủ các trường người đại diện: `contact`, `personName`, `personTitle`, `phone`, `email`, `about`, `website`, `address`.
   - Cập nhật kiểu dữ liệu `DirectoryMember` trong frontend để đồng bộ 100% schema.
   - Giao diện danh bạ hội viên (`association.members.tsx`) hiển thị đồng thời cả tên người đại diện (`m.contact || m.personName`) và tên công ty (`m.name`), kèm badge mã số hội viên (`M1983-xxx`).
   - Tích hợp Member Profile Sheet: Click vào bất kỳ hội viên nào sẽ mở modal trượt hiển thị đầy đủ avatar, chức danh, công ty, bio, SĐT, email, địa chỉ, website kèm 2 nút hành động trực tiếp: "Nhắn tin" và "Kết nối".
   - Bỏ dữ liệu fake bạn bè: Dùng hook thật `useConnectedPeople`, `useOutgoingRequests`, `useIncomingRequests` từ database graph nodes.
   - Hàm `handleConnect` gọi API trực tiếp `POST /network/requests` với `{ targetUserId, memberCode, message }` và cập nhật state `localPending` tức thì.
3. **Quét QR Tự Động Mở Modal Kết Nối (`association.checkin.tsx`)**:
   - Phân tích chuỗi QR quét được: nếu chứa mã hội viên `M1983-xxx` hoặc đường dẫn `/card/`, tự động tra cứu danh bạ hội viên và bật `ScannedMemberModal` hiển thị thông tin người muốn kết nối kèm nút "Nhắn tin" và "Kết nối".
4. **Đồng Bộ Màu Sắc Nhận Diện Xanh Hoàng Gia CEO 1983 & Loại Bỏ Hoàn Toàn Nền Đen Chữ Vàng**:
   - `association.perks.index.tsx` & `$id.tsx`: Thay thế toàn bộ banner `#1E1408` chữ vàng bằng `bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white`, hộp quà lấp lánh với hiệu ứng ánh sáng tỏa ra (`vba-ray-burst`).
   - Redesign trang chi tiết ưu đãi (`association.perks.$id.tsx`) với ambient hero card tone xanh, viền kính mờ, thẻ đối tác và quyền lợi sang trọng.
   - Bong bóng tin nhắn người gửi đổi sang `bg-gradient-to-tr from-sky-500 to-blue-600 text-white`.
   - Banner hero trang chủ và fallback ảnh sự kiện chuyển sang gam màu xanh công nghệ hội nghị doanh nhân CEO 1983.
5. **Chuẩn Hóa Ô Nhập Liệu Không Viền (Borderless Inputs Standard)**:
   - Tất cả các thanh tìm kiếm, ô nhập tin nhắn, form báo giá và form tạo sản phẩm trên toàn bộ các route `messages`, `members`, `opportunities`, `products` được chuẩn hóa thành dạng không viền: `border-0 bg-slate-100 dark:bg-white/[0.06] outline-none ring-0 focus:ring-0 shadow-none`.
6. **Animated GIF & Nút Đăng Sản Phẩm Trực Tiếp (`association.index.tsx` & `products.tsx`)**:
   - Bổ sung GIF/sticker hoạt họa nhỏ (Handshake và Package box) tại thẻ "TRAO CƠ HỘI" và "ĐĂNG GIỚI THIỆU SẢN PHẨM".
   - Nút "Đăng ngay" và thẻ sản phẩm gắn link với `search={{ action: "create" }}`.
   - `association.products.tsx` bổ sung hook `useEffect` đón nhận `action === "create"` để tự động mở form popup đăng sản phẩm lên sàn ngay lập tức.
7. **Sửa Lỗi Redirect Hồ Sơ & Quyền Riêng Tư (`association.profile.tsx`)**:
   - Xóa bỏ hoàn toàn redirect ra ngoài `/connect-app/me/edit` ở cả menu danh mục lẫn nút "Cập nhật" trên thanh công cụ trang cá nhân.
   - Tích hợp modal cục bộ `EditProfileModal`: cho phép chỉnh sửa Họ tên, Chức vụ, Công ty, SĐT, Email, Địa chỉ, Website, Bio và 3 toggle quyền riêng tư (cho phép nhắn tin, công khai SĐT, hiển thị danh bạ) và lưu trữ cục bộ bền vững (`vba_custom_profile`).
8. **Tự Động Xuống Dòng Trên Thẻ Cứng (`association.card.tsx`)**:
   - Xóa bỏ class `truncate` tại tên hội viên, chức vụ, tên công ty và tên hiệp hội trên thẻ cứng số.
   - Bổ sung `break-words min-w-0 flex-1 leading-snug`, cho phép tên dài hoặc tên doanh nghiệp dài tự động xuống dòng đẹp mắt mà không làm vỡ bố cục thẻ VIP.

### 15.3 Danh Sách Tệp Đã Chỉnh Sửa
- `apps/vione_app_be/src/members/members.service.ts`
- `apps/vione_app_be/src/connect-app/connect-app.service.ts`
- `apps/vione_app_fe/src/lib/member-app/directory.functions.ts`
- `apps/vione_app_fe/src/routes/association.messages.tsx`
- `apps/vione_app_fe/src/routes/association.members.tsx`
- `apps/vione_app_fe/src/routes/association.checkin.tsx`
- `apps/vione_app_fe/src/routes/association.perks.index.tsx`
- `apps/vione_app_fe/src/routes/association.perks.$id.tsx`
- `apps/vione_app_fe/src/routes/association.opportunities.tsx`
- `apps/vione_app_fe/src/routes/association.products.tsx`
- `apps/vione_app_fe/src/routes/association.index.tsx`
- `apps/vione_app_fe/src/routes/association.profile.tsx`
- `apps/vione_app_fe/src/routes/association.card.tsx`

### 15.4 Cập Nhật UI Messenger, Dữ Liệu Thực CRM & Chuẩn Hóa Giao Diện Hội Viên (2026-09-14)
1. **Giao Diện Tin Nhắn Chuẩn Messenger (`association.messages.tsx`)**:
   - Thêm dải cuộn ngang (Stories / Active Now) hiển thị danh sách avatar tròn của các hội viên đang trực tuyến với chấm xanh online (`bg-emerald-500 ring-2 ring-white`).
   - Bấm vào avatar (ở cả dải online lẫn trong danh sách cuộc trò chuyện) mở modal xem hồ sơ tóm tắt:
     - Avatar tròn lớn + chấm xanh nhấp nháy + badge đã xác minh.
     - Họ tên, mã hội viên, chức vụ, tên doanh nghiệp, ngành nghề, khu vực.
     - 2 nút hành động: **"Xem profile"** (chuyển tới trang danh bạ/hồ sơ hội viên) và **"Nhắn tin"** (mở ngay luồng chat với hội viên đó, nút xanh text trắng).
   - Hiển thị chấm xanh online tại avatar người gửi trong header của `ChatThread` và cho phép bấm trực tiếp để xem profile.
2. **Loại Bỏ Hoàn Toàn Dữ Liệu Fake - Kết Nối 100% CRM Thật**:
   - Bỏ toàn bộ mock array bạn bè (Đặng Văn Lâm, Trần Thu Trang, số fake 248).
   - Tab Bạn bè (`association.profile.tsx`) và bộ chọn tag bài viết gọi trực tiếp `listMembers()` lấy danh sách hội viên thực tế từ CRM (17 hội viên active).
   - Cập nhật số lượng thông báo unread/mới trên trang chủ (`association.index.tsx`) theo đúng số liệu thực tế trong DB:
     - Cơ hội giao thương: 2
     - Sản phẩm chào bán: 11
     - Sự kiện sắp tới: 2
     - Chuông thông báo header: lấy unread thực từ CRM notification service.
3. **Chuẩn Hóa Nút Bấm & Text Màu Trắng Tuyệt Đối**:
   - Thêm quy tắc CSS toàn cục trong `styles.css`: `.btn-sky`, `[class*="bg-sky-500"]`, `.vba-btn-primary`, các thẻ button/link/span nền sky luôn mang `color: #FFFFFF !important;`.
   - Các nút CTA chính ("Xem ưu đãi ngay", "Khám phá ngay", "Đăng ngay", "Nhắn tin") gắn thêm inline `style={{ color: "#ffffff" }}`.
4. **Viền Thẻ Sáng & Sắc Nét Hơn (Bright Borders)**:
   - Nâng cấp các biến CSS: `--vba-border: rgba(14, 165, 233, 0.35);`, `--vba-border-soft: rgba(14, 165, 233, 0.25);`, `--vba-border-accent: rgba(56, 189, 248, 0.5);`.
   - `.vba-card` và các container border được làm sáng và nổi bật hơn trên cả giao diện sáng (Light) lẫn tối (Dark).
5. **Tinh Chỉnh Trang Cá Nhân (`association.profile.tsx`)**:
   - Xóa bỏ pill badge "CLB DOANH NHÂN CEO 1983" đè trên ảnh bìa profile.
   - Đồng bộ 4 nút thao tác ("Cập nhật", "Thẻ VIP", "Chạm NFC", "Chia sẻ") về cùng kiểu dáng trung tính, thanh lịch, không in đậm hay tô màu nổi trội khi chưa được bấm.

### 15.5 Sửa Lỗi Tải App iOS, UI Ẩn Thông Báo & Luồng Nhắn Tin Hội Viên (2026-09-14)
1. **Khắc Phục Lỗi iOS Mở Nhầm App ViOne Thay Vì Hiệp Hội**:
   - **Nguyên nhân**: File `apps/mobile_ceo1983/ios/App/capacitor.config.json` trong bản build 3 cũ trỏ nhầm về `http://14.225.217.232:5000` (ViOne app) do EAS sử dụng `ios/App.xcodeproj` liên kết tới file này, trong khi Android đã trỏ đúng `/association`.
   - **Xử lý**: Đồng bộ toàn bộ các file cấu hình `capacitor.config.json` (`ios/App` và `ios/App/App`) về `"url": "http://14.225.217.232:5000/association"`.
   - Nâng `CURRENT_PROJECT_VERSION` từ 3 lên 4 trong cả 2 file `project.pbxproj` và `app.json` (`buildNumber: "4"`).
    - **Kết quả Build 4 (2026-09-14)**:
      - Đóng gói thành công file `.ipa`: `https://expo.dev/artifacts/eas/E36JBtvG87AXc_dJfapizTF_0MpAB3R98A7OTlyA7t0.ipa`
      - EAS Build ID: `547fe71c-1ec4-4902-80e7-14d8709d31fd`
      - Đã tự động nộp thành công lên Apple App Store Connect TestFlight (`ascAppId: 6811838041`).
2. **Sửa Lỗi Màu Sắc UI Modal "Ẩn Thông Báo?"**:
   - **Nguyên nhân**: `AlertDialogContent` trong `alert-dialog.tsx` bị hardcode `bg-[linear-gradient(165deg,rgba(10,16,25,0.98)...)] text-[#f5f7fa]` và viền vàng, khiến dialog hiện khung đen tối nghịch mắt trong giao diện sáng (Light mode) của app Hiệp hội, nút Hủy bị trắng chữ mờ.
   - **Xử lý**: 
     - Sửa `alert-dialog.tsx`: `AlertDialogContent` chuyển sang nền trắng / dark `#131A26`, viền xám nhẹ `border-slate-200 dark:border-slate-800`, tiêu đề đậm rõ nét `text-slate-900 dark:text-white`, nút Hủy nền xám `bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200`, nút Ẩn xanh `bg-blue-600 hover:bg-blue-700 text-white`.
     - Chỉ định class tường minh tại `association.notifications.tsx` cho cả `confirmDismiss` và `confirmDismissAll`.
3. **Sửa Lỗi Nhắn Tin Xong Không Hiện Người Nhận Trong Danh Sách Cuộc Trò Chuyện**:
   - **Nguyên nhân 1 (Fetch Serialization)**: `fetchNestApiFromServer` và `fetchNestApi` (`api-client.ts`) kiểm tra `typeof requestBody === "string"`. Khi hàm `sendMessage` truyền body là object `{ peerCode, text }`, fetch native của Node.js bị lỗi `fetch failed` do không được serialize qua `JSON.stringify`.
   - **Nguyên nhân 2 (Database Type Cast Exception)**: Trong `ConnectAppService` backend, câu lệnh `SELECT m.code FROM public.members m WHERE m.id = ${userId}::uuid` gây lỗi `operator does not exist: text = uuid` vì `m.id` là kiểu text trong Postgres, khiến câu lệnh luôn văng ngoại lệ và fallback lấy nhầm mã hội viên ngẫu nhiên.
   - **Nguyên nhân 3 (User Membership Mapping)**: Tài khoản hội viên `thuylt313@gmail.com` trong `auth.users` chưa có bản ghi trong `public.members`. Đã tạo bản ghi `M1983-017` cho người dùng.
   - **Nguyên nhân 4 (Local Conversation Cache)**: Thêm cơ chế đồng bộ `vba.recent_conversations` trong `localStorage` tại `association.messages.tsx`. Khi gửi tin nhắn, peer lập tức được ghi vào cache cục bộ và merge cùng danh sách server, đảm bảo người nhận luôn xuất hiện ngay lập tức ở đầu danh sách chat với xem trước tin nhắn mới nhất và thời gian "Vừa xong".



