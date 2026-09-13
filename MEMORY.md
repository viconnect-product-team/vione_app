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
- **Routing Ecosystem Architecture**:
  - **Mobile Login**: `/auth/mobile/` (hỗ trợ cả `/auth/mobile`) cung cấp giao diện đăng nhập tối ưu cho mobile, thẻ NFC/QR, chuyển đổi đa hiệp hội.
  - **Association App**: Đổi toàn bộ đường dẫn từ `/m/*` sang `/association/*` (24 sub-routes). Đường dẫn `/m/*` tự động chuyển hướng 301 client-side sang `/association/*`.
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






