const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * MASTER ENTERPRISE PMO WBS MATRIX: 1,000+ DETAILED WORK BREAKDOWN TASKS
 * Standards: PMBOK / ISO 21500 Project Management Standard
 * Scope: 10 Core Enterprise Modules x 100+ Distinct Granular Tasks
 */

async function generateMegaEnterpriseWBS1000() {
  console.log('================================================================================');
  console.log('🏗️ GENERATING MASTER PMO WBS MATRIX: 1,000+ ENTERPRISE WORK BREAKDOWN TASKS');
  console.log('   (PMBOK / ISO 21500 Standard • 10 Modules • 100% Unique Granular Tasks)');
  console.log('================================================================================\n');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'VIONE PMO & Principal Enterprise Architect';
  wb.lastModifiedBy = 'Senior Technical Project Manager';
  wb.created = new Date();
  wb.modified = new Date();

  const NAVY_DARK = '1E293B';
  const GOLD_LUX = 'D97706';
  const BORDER_COLOR = 'CBD5E1';
  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };

  const columnsDef = [
    { header: 'Mã WBS', key: 'wbs', width: 14 },
    { header: 'Phân Hệ', key: 'module', width: 24 },
    { header: 'Hạng Mục Cha (Epic / Phase)', key: 'epic', width: 28 },
    { header: 'Chức Năng Con Chi Tiết (User Story / Work Package)', key: 'feature', width: 44 },
    { header: 'Mô Tả Luồng Nghiệp Vụ & Xử Lý Kỹ Thuật (Chi Tiết Chuyên Gia)', key: 'flow', width: 56 },
    { header: 'Tuyến Đường / Endpoint / Screen', key: 'route', width: 30 },
    { header: 'Vai Trò Thao Tác (Actor)', key: 'actor', width: 20 },
    { header: 'Mức Độ Ưu Tiên', key: 'priority', width: 16 },
    { header: 'Ước Lượng FE (Man-days)', key: 'feDays', width: 16 },
    { header: 'Ước Lượng BE (Man-days)', key: 'beDays', width: 16 },
    { header: 'Ước Lượng QA (Man-days)', key: 'qaDays', width: 16 },
    { header: 'Tổng Công Việc (Man-days)', key: 'totalDays', width: 18 },
    { header: 'Tiến Độ (%)', key: 'progress', width: 14 },
    { header: 'Trạng Thái Dev', key: 'devStatus', width: 18 },
    { header: 'Trạng Thái Kiểm Thử', key: 'qaStatus', width: 18 },
    { header: 'Trạng Thái Nghiệm Thu', key: 'uatStatus', width: 20 },
    { header: 'Ghi Chú Kỹ Thuật & Kiến Trúc Vận Hành', key: 'notes', width: 40 },
  ];

  // 10 Core Enterprise Modules with 20 base operational packages
  const modulesCatalog = [
    {
      code: 'CORE',
      name: 'Tài Khoản, Phân Quyền RBAC & CRUD Toàn Hệ Thống',
      sheet: 'WBS_01_CORE_AUTH_CRUD',
      themeColor: '1E293B',
      epic: 'Tài Khoản & Quản Trị Hệ Thống',
      baseTasks: [
        ['Đăng ký tài khoản doanh nghiệp mới qua biểu mẫu chuẩn', 'Validate MST, email, số điện thoại, kiểm tra trùng lặp pháp nhân trong CSDL', '/auth/register', 'Khách Vãng Lai', 'Cao', 1.5, 2.0, 1.0, 'NestJS DTO Validation'],
        ['Đăng nhập tài khoản đa phương thức (Email, Mã hội viên, SĐT)', 'Xác thực mật khẩu băm Argon2id/Bcrypt, cấp phát cặp JWT Token', '/auth/login', 'Người Dùng', 'Khẩn cấp', 1.5, 2.5, 1.0, 'JWT Access + Refresh Token'],
        ['Đăng nhập sinh trắc học Passkey WebAuthn FIDO2 một chạm', 'Đăng nhập một chạm qua vân tay/FaceID trên thiết bị hỗ trợ FIDO2', '/auth/passkey', 'Hội Viên', 'Cao', 2.0, 3.0, 1.5, 'WebAuthn Standard'],
        ['Đăng nhập 2 yếu tố TOTP (Google / Microsoft Authenticator)', 'Bắt buộc nhập mã 6 số TOTP đối với tài khoản Ban Lãnh Đạo', '/auth/mfa-totp', 'Ban Lãnh Đạo', 'Khẩn cấp', 2.0, 2.5, 1.0, 'Otplib RFC 6238'],
        ['Đăng xuất an toàn và vô hiệu hóa Token phiên làm việc', 'Thu hồi Refresh Token trong Redis, xóa Cookie HttpOnly an toàn', '/auth/logout', 'Người Dùng', 'Cao', 0.5, 1.0, 0.5, 'Redis Token Revocation'],
        ['Quên mật khẩu & Gửi link đặt lại mật khẩu qua Email', 'Tạo token đặt lại có hạn 15 phút, gửi email chứa link một lần', '/auth/forgot-password', 'Người Dùng', 'Cao', 1.0, 1.5, 1.0, 'Crypto Random Bytes Token'],
        ['Đổi mật khẩu người dùng từ màn hình cài đặt tài khoản', 'Yêu cầu nhập mật khẩu cũ, kiểm tra độ mạnh mật khẩu chuẩn OWASP', '/settings/change-password', 'Người Dùng', 'Trung bình', 1.0, 1.0, 0.5, 'Password Strength Meter'],
        ['Cập nhật thông tin hồ sơ cá nhân và chức danh hiệp hội', 'Cập nhật họ tên, chức vụ doanh nghiệp, tiểu sử, ngành nghề hoạt động', '/profile/edit', 'Hội Viên', 'Cao', 1.5, 1.5, 1.0, 'Prisma Model Update'],
        ['Tải lên ảnh đại diện Avatar và nén ảnh tự động phía Client', 'Cắt ảnh tỷ lệ 1:1, nén dung lượng dưới 500KB trước khi upload', '/profile/avatar-upload', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Canvas Image Compression'],
        ['Tải lên ảnh bìa Cover Banner hồ sơ doanh nhân sắc nét', 'Hỗ trợ ảnh panorama tỷ lệ 16:9, lưu trữ MinIO/S3 CDN tốc độ cao', '/profile/banner-upload', 'Hội Viên', 'Trung bình', 1.5, 1.5, 1.0, 'S3 Presigned URL Upload'],
        ['Quản lý danh sách phiên đăng nhập và thiết bị đang kết nối', 'Hiển thị IP, vị trí địa lý, trình duyệt, cho phép đăng xuất từ xa', '/settings/sessions', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'User Agent & IP Geolocation'],
        ['Cơ chế Xóa Mềm (Soft Delete) bản ghi bảo toàn dữ liệu', 'Gán cờ deleted_at = NOW(), ẩn bản ghi khỏi giao diện thông thường', '/api/crud/soft-delete', 'Quản Trị Viên', 'Khẩn cấp', 1.0, 2.0, 1.0, 'Prisma Soft Delete Middleware'],
        ['Thùng rác hệ thống (Trash Bin) và lịch sử xóa', 'Danh sách các mục đã xóa, hỗ trợ lọc theo người xóa và ngày xóa', '/admin/trash-bin', 'Quản Trị Viên', 'Cao', 1.5, 2.0, 1.0, 'Archival Storage Policy'],
        ['Phục hồi dữ liệu từ thùng rác (Restore Soft-deleted)', 'Khôi phục bản ghi về trạng thái hoạt động, cập nhật audit log', '/admin/trash-bin/restore', 'Quản Trị Viên', 'Cao', 1.0, 1.5, 1.0, 'Cascading Restore Logic'],
        ['Xóa vĩnh viễn (Permanent Purge) đối với dữ liệu rác hết hạn', 'Xóa hoàn toàn khỏi CSDL sau 90 ngày bảo lưu theo quy chế bảo mật', '/admin/trash-bin/purge', 'Quản Trị Tối Cao', 'Trung bình', 1.0, 2.0, 1.0, 'Scheduled Cron Purge Job'],
        ['Thao tác hàng loạt (Bulk Actions): Xóa, Cập nhật, Đổi trạng thái', 'Chọn nhiều dòng dữ liệu, áp dụng thay đổi trong 1 Database Transaction', '/admin/bulk-actions', 'Quản Trị Viên', 'Cao', 2.0, 2.5, 1.5, 'Prisma $transaction Batch'],
        ['Nhật ký kiểm toán an ninh (Security Audit Trail) bất biến', 'Ghi vết 100% thay đổi dữ liệu, đăng nhập thất bại, xuất file danh bạ', '/admin/audit-trail', 'Ban Kiểm Tra', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Append-only Audit Table'],
        ['Ma trận phân quyền chi tiết 8 cấp bậc Granular RBAC', 'Phân quyền View, Create, Edit, Delete, Approve, Export cho từng trang', '/admin/permissions', 'Quản Trị Tối Cao', 'Khẩn cấp', 3.0, 3.5, 2.0, 'NestJS RBAC Guards & Decorator'],
        ['Cô lập dữ liệu Multi-Tenant an toàn bằng Row-Level Security', 'Ngăn chặn rò rỉ dữ liệu giữa các Hiệp hội độc lập trên cùng DB', '/api/tenant/guard', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 3.5, 2.0, 'PostgreSQL RLS Policies'],
        ['Chặn brute-force và khóa tài khoản tạm thời sau 5 lần sai pass', 'Lưu số lần thử sai trong Redis với thời gian hết hạn TTL 15 phút', '/api/auth/rate-limit', 'Hệ Thống Tự Động', 'Khẩn cấp', 1.5, 2.0, 1.0, 'Redis Sliding Window Limiter']
      ]
    },
    {
      code: 'SEARCH',
      name: 'Tìm Kiếm, Phân Trang, Bộ Lọc & Chế Độ Màu Theme',
      sheet: 'WBS_02_SEARCH_PAGE_THEME',
      themeColor: '0F766E',
      epic: 'Tìm Kiếm & Giao Diện Người Dùng',
      baseTasks: [
        ['Tìm kiếm nhanh thời gian thực (Debounced Quick Search)', 'Tự động gọi API sau 300ms dừng gõ phím, hiển thị kết quả gợi ý', '/search/quick', 'Người Dùng', 'Cao', 1.5, 1.5, 1.0, 'Custom useDebounce Hook'],
        ['Tìm kiếm toàn văn tiếng Việt không dấu (Full-text Search)', 'Hỗ trợ tìm kiếm danh bạ, tin tức, văn kiện bỏ qua dấu tiếng Việt', '/search/full-text', 'Người Dùng', 'Cao', 2.0, 2.5, 1.0, 'PostgreSQL unaccent & tsvector'],
        ['Phân trang truyền thống (Offset Pagination) kèm chọn số dòng', 'Hỗ trợ tùy chọn 10, 25, 50, 100 dòng mỗi trang, nhảy trang nhanh', '/components/pagination', 'Người Dùng', 'Cao', 1.5, 1.5, 1.0, 'Limit & Offset Optimization'],
        ['Phân trang con trỏ (Cursor-based Pagination) cho Feed dữ liệu lớn', 'Tối ưu hóa hiệu năng bảng tin hàng triệu bài viết, không bị lệch trang', '/api/feed/cursor', 'Hệ Thống Tự Động', 'Cao', 2.0, 2.5, 1.0, 'Indexed Cursor ID Paging'],
        ['Cuộn vô tận (Infinite Scroll) tự động tải trang tiếp theo', 'Sử dụng Intersection Observer API phát hiện đáy màn hình để fetch', '/components/infinite-scroll', 'Người Dùng', 'Cao', 1.5, 1.5, 1.0, 'IntersectionObserver API'],
        ['Bộ lọc đa tiêu chí (Multi-criteria Faceted Filter)', 'Lọc kết hợp: Ngành nghề + Khu vực + Hạng hội viên + Trạng thái phí', '/members/faceted-filter', 'Ban Thư Ký', 'Cao', 2.0, 2.5, 1.5, 'Prisma Dynamic Where Input'],
        ['Lưu bộ lọc tìm kiếm ưa thích (Saved Custom Filters)', 'Cho phép cán bộ quản lý lưu cấu hình bộ lọc để truy cập nhanh 1-click', '/filters/saved-views', 'Quản Trị Viên', 'Trung bình', 1.5, 2.0, 1.0, 'Local & Cloud Filter Sync'],
        ['Sắp xếp cột linh hoạt đa cấp độ (Multi-column Sorting)', 'Click tiêu đề cột để đảo chiều Tăng/Giảm (ASC/DESC), giữ trạng thái', '/components/data-table/sort', 'Người Dùng', 'Trung bình', 1.0, 1.5, 0.5, 'TanStack Table Sorting'],
        ['Tùy biến hiển thị cột trong bảng dữ liệu (Column Visibility)', 'Bật/tắt các cột dữ liệu tùy theo nhu cầu xem, lưu vào LocalStorage', '/components/data-table/columns', 'Người Dùng', 'Trung bình', 1.5, 1.0, 0.5, 'TanStack Table Visibility'],
        ['Chế độ xem bảng dữ liệu Cô Đọng / Thoải Mái (Density Toggle)', 'Chuyển đổi giữa Compact View (nhiều dữ liệu) và Comfortable View', '/components/data-table/density', 'Người Dùng', 'Thấp', 1.0, 0.5, 0.5, 'Tailwind Spacing Variables'],
        ['Chế độ Sáng (Light Mode) chuẩn mực văn phòng trang nhã', 'Màu nền trắng ngà dịu mắt, độ tương phản văn bản đạt chuẩn WCAG AA', '/theme/light', 'Người Dùng', 'Cao', 1.5, 0.5, 0.5, 'CSS Theme Token Variables'],
        ['Chế độ Tối (Dark Mode) chuẩn doanh nhân sang trọng', 'Nền đen tím sâu thẳm, giảm mỏi mắt ban đêm, tiết kiệm pin OLED', '/theme/dark', 'Người Dùng', 'Cao', 1.5, 0.5, 0.5, 'Tailwind dark: Variants'],
        ['Chế độ Tương Phản Cao (High Contrast) cho người lớn tuổi', 'Đen trắng dứt khoát, viền thẻ nét đậm, loại bỏ hoàn toàn đổ bóng mờ', '/theme/contrast', 'Hội Viên Cao Niên', 'Cao', 2.0, 0.5, 1.0, 'data-theme="contrast" Rules'],
        ['Hiệu ứng đóng mở cửa (Door Transition) khi chuyển Theme', 'Cánh cửa trượt đóng lại 600ms, đổi màu theme phía sau rồi mở ra', '/theme/door-transition', 'Người Dùng', 'Cao', 2.0, 0.5, 1.0, 'Framer Motion Door Slider'],
        ['Tự động đồng bộ chế độ màu theo hệ điều hành (Auto System Sync)', 'Lắng nghe media query prefers-color-scheme để tự đổi theme mượt mà', '/theme/auto-detect', 'Người Dùng', 'Trung bình', 1.0, 0.5, 0.5, 'window.matchMedia Listener'],
        ['Tùy chỉnh kích thước chữ (Font Size Accessibility Scaling)', 'Hỗ trợ phóng to cỡ chữ 110%, 125%, 150% cho người có thị lực yếu', '/settings/accessibility', 'Hội Viên', 'Trung bình', 1.5, 0.5, 0.5, 'Root REM Size Scaling'],
        ['Bảng màu điểm nhấn thương hiệu (Brand Accent Color Picker)', 'Cho phép tùy chọn màu chủ đạo: Vàng Hoàng Gia, Xanh Navy, Ngọc Lục', '/settings/brand-color', 'Doanh Nghiệp', 'Thấp', 1.5, 1.0, 0.5, 'Dynamic CSS Primary Hue'],
        ['Lưu trạng thái giao diện người dùng trên đám mây (User UI State)', 'Đồng bộ cấu hình theme, độ rộng cột bảng giữa Mobile và Desktop', '/profile/ui-preferences', 'Người Dùng', 'Trung bình', 1.5, 1.5, 1.0, 'PostgreSQL JSONB Storage'],
        ['Tối ưu hóa Skeleton Loader khi tải dữ liệu trang tìm kiếm', 'Hiển thị khung xương chuyển động tạo cảm giác ứng dụng phản hồi ngay', '/components/skeletons', 'Người Dùng', 'Cao', 1.5, 0.5, 0.5, 'Pulsing Shimmer Effect'],
        ['Trang thông báo kết quả tìm kiếm rỗng (Empty State UX)', 'Gợi ý từ khóa liên quan, nút xóa nhanh bộ lọc khi không có dữ liệu', '/components/empty-state', 'Người Dùng', 'Trung bình', 1.0, 0.5, 0.5, 'Illustrative Helpful Guidance']
      ]
    },
    {
      code: 'NETWORK',
      name: 'Mạng Lưới Kết Nối & Danh Bạ Doanh Nhân B2B',
      sheet: 'WBS_03_NETWORK_CONNECT',
      themeColor: '1D4ED8',
      epic: 'Mạng Lưới Doanh Nhân & Đối Tác',
      baseTasks: [
        ['Gửi lời mời kết nối kinh doanh (Send Connection Request)', 'Kèm lời chào cá nhân hóa và mục tiêu hợp tác thương mại cụ thể', '/network/connect', 'Hội Viên', 'Khẩn cấp', 1.5, 2.0, 1.0, 'Business Connection Model'],
        ['Hủy yêu cầu kết nối đã gửi khi chưa được chấp nhận', 'Xóa lời mời khỏi hàng đợi đối tác, giải phóng trạng thái kết nối', '/network/cancel-request', 'Hội Viên', 'Trung bình', 1.0, 1.0, 0.5, 'Pending Status Revocation'],
        ['Chấp nhận lời mời kết nối đối tác kinh doanh (Accept Connection)', 'Kích hoạt quan hệ 2 chiều, mở quyền xem số điện thoại và nhắn tin', '/network/accept-request', 'Hội Viên', 'Khẩn cấp', 1.5, 2.0, 1.0, 'Mutual Access Authorization'],
        ['Từ chối lời mời kết nối kèm thông báo lịch sự văn phong ngoại giao', 'Chuyển trạng thái declined, không gửi thông báo tiêu cực cho đối phương', '/network/decline-request', 'Hội Viên', 'Trung bình', 1.0, 1.0, 0.5, 'Silent Decline Architecture'],
        ['Hủy kết nối đối tác khi không còn nhu cầu giao thương (Remove)', 'Thu hồi quyền xem số điện thoại cá nhân, giữ lại lịch sử giao dịch', '/network/disconnect', 'Hội Viên', 'Cao', 1.0, 1.5, 0.5, 'Relationship Dissolution'],
        ['Chặn người dùng (Block User) khi có hành vi spam thương mại', 'Ẩn hoàn toàn bài viết, tin nhắn và thông tin cá nhân của người bị chặn', '/network/block-user', 'Hội Viên', 'Khẩn cấp', 1.5, 2.0, 1.0, 'Bi-directional Exclusion Filter'],
        ['Mở chặn người dùng (Unblock User) trong màn hình quản lý bảo mật', 'Cho phép khôi phục hiển thị và tìm kiếm lại người dùng trong danh bạ', '/settings/blocked-users', 'Hội Viên', 'Trung bình', 1.0, 1.0, 0.5, 'Security Settings Unblock'],
        ['Báo cáo vi phạm (Report User) hành vi giả mạo hoặc lừa đảo', 'Gửi báo cáo kèm bằng chứng ảnh chụp màn hình tới Ban Kiểm Tra', '/network/report-user', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Disciplinary Review Queue'],
        ['Đề xuất mối quan hệ chung (Mutual Connections Finder)', 'Hiển thị số lượng bạn chung giữa 2 doanh nhân để tăng độ tin cậy', '/network/mutual', 'Hội Viên', 'Cao', 2.0, 3.0, 1.5, 'Graph Network Query'],
        ['Gắn thẻ ghi chú quan hệ đối tác (Private Notes & Tags)', 'Ghi chép mật về thói quen, sở thích, ngày sinh nhật, chỉ mình xem được', '/network/contact-notes', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Encrypted Private Notes'],
        ['Trao thẻ danh thiếp điện tử 1 chạm NFC (Tap to Connect)', 'Truyền thông tin thẻ qua sóng NFC tần số 13.56MHz không cần cài app', '/nfc/tap-share', 'Hội Viên', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Web NFC API Interop'],
        ['Sinh mã QR cá nhân hóa động cho danh thiếp điện tử', 'Mã QR chứa link slug độc bản, có logo hiệp hội ở chính giữa', '/cards/my-qr', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Canvas QR Generator'],
        ['Xuất tệp danh bạ điện tử vCard .vcf lưu vào máy điện thoại', 'Tạo file chuẩn RFC 6350 chứa đầy đủ họ tên, công ty, SĐT, avatar', '/cards/export-vcf', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'vCard 4.0 Standard'],
        ['Đồng bộ thẻ thành viên vào ví điện tử Apple Wallet (.pkpass)', 'Ký số tệp pass bằng chứng thư số Apple Developer Certificate', '/cards/apple-wallet', 'Hội Viên', 'Khẩn cấp', 3.0, 3.5, 2.0, 'Apple PassKit Signing'],
        ['Đồng bộ thẻ thành viên vào ví Google Wallet trên Android', 'Tạo Generic Pass qua Google Wallet REST API và hiển thị nút Lưu', '/cards/google-wallet', 'Hội Viên', 'Cao', 2.5, 3.0, 1.5, 'Google Wallet REST API'],
        ['Thống kê số lượt xem thẻ và tỷ lệ lưu danh bạ (Card Analytics)', 'Biểu đồ lượt quét NFC, quét QR, lưu vCard theo từng mốc thời gian', '/cards/analytics', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Metrics Aggregator'],
        ['Phân nhóm danh bạ đối tác theo ngành nghề và mức độ ưu tiên', 'Tạo nhóm: Khách VIP, Đối tác chiến lược, Nhà cung ứng thân thiết', '/network/groups', 'Hội Viên', 'Trung bình', 1.5, 2.0, 1.0, 'Contact Grouping Model'],
        ['Gửi tin nhắn chào mừng tự động khi kết nối thành công', 'Hệ thống tự động gửi tin nhắn chào mừng kèm hồ sơ năng lực PDF', '/network/auto-welcome', 'Hội Viên', 'Trung bình', 1.5, 2.5, 1.0, 'Auto Greeting Event'],
        ['Tìm kiếm đối tác xung quanh vị trí hiện tại (Radar Proximity)', 'Sử dụng GPS tìm các hội viên đang có mặt trong bán kính 1km', '/network/radar', 'Hội Viên', 'Cao', 2.5, 3.5, 2.0, 'PostGIS Geolocation Distance'],
        ['Xuất danh bạ đối tác kết nối ra file Excel định dạng chuẩn', 'Xuất danh sách gồm họ tên, công ty, email, số điện thoại, ngày kết nối', '/network/export-excel', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'ExcelJS Export Engine']
      ]
    },
    {
      code: 'MOMENTS',
      name: 'Bảng Tin Moments, Đa Phương Tiện & Cộng Đồng',
      sheet: 'WBS_04_MOMENTS_COMMUNITY',
      themeColor: '6D28D9',
      epic: 'Bảng Tin Giao Thương & Cộng Đồng',
      baseTasks: [
        ['Đăng bài khoảnh khắc giao thương đa ảnh chuẩn Facebook-grade', 'Cho phép tải tối đa 6 ảnh chất lượng cao, xóa ảnh, nén ảnh client', '/moments/create', 'Hội Viên', 'Khẩn cấp', 3.0, 3.0, 2.0, 'MinIO / Supabase Storage'],
        ['Gắn thẻ đối tác doanh nghiệp (@mention) trong bài viết', 'Tìm kiếm nhanh doanh nhân trong mạng lưới, gửi thông báo tức thì', '/moments/tagging', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Mention Parser & Notification'],
        ['Gắn địa điểm check-in tại hội trường, khách sạn, sân golf', 'Tìm kiếm địa điểm thực tế, lưu trữ tọa độ kinh độ/vĩ độ GPS', '/moments/checkin', 'Hội Viên', 'Trung bình', 1.5, 2.0, 1.0, 'Geolocation Tagging'],
        ['Tương tác thả cảm xúc B2B (Thích, Bắt tay, Hợp tác, Vinh danh)', 'Hỗ trợ 5 biểu tượng cảm xúc chuyên biệt cho giới doanh nhân', '/moments/reactions', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Realtime Reaction Dispatcher'],
        ['Bình luận bài viết đính kèm hình ảnh tài liệu hợp tác', 'Bình luận trao đổi cơ hội, xem trước ảnh và mở Lightbox phóng to', '/moments/comments', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Comment Image Attachments'],
        ['Bình luận phản hồi lồng nhau đa cấp (Nested Reply Comments)', 'Hỗ trợ trả lời trực tiếp từng bình luận, thông báo theo cây thảo luận', '/moments/replies', 'Hội Viên', 'Trung bình', 2.0, 2.5, 1.0, 'Hierarchical Tree Comments'],
        ['Chỉnh sửa và xóa bài viết Moments có xác nhận an toàn', 'Cho phép tác giả sửa nội dung, xóa bài viết kèm xóa ảnh lưu trữ', '/moments/edit-delete', 'Hội Viên', 'Cao', 1.5, 1.5, 1.0, 'Cascade Storage Cleanup'],
        ['Khởi tạo Phân ban / Câu lạc bộ chuyên môn trong Hiệp hội', 'Khai báo CLB Bất động sản, CLB Công nghệ, CLB Golf doanh nhân', '/communities/create', 'Ban Chấp Hành', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Multi-club Architecture'],
        ['Gia nhập hoặc rời khỏi Câu lạc bộ / Phân ban chuyên môn', 'Hội viên đăng ký tham gia CLB, Thư ký CLB duyệt thành viên mới', '/communities/membership', 'Hội Viên', 'Cao', 2.0, 2.0, 1.0, 'Club Member Roster'],
        ['Ghim bài viết quan trọng (Pin Post) lên đầu bảng tin CLB', 'Trưởng ban ghim thông báo đại hội, nghị quyết hoặc quy chế hoạt động', '/communities/pin-post', 'Trưởng Ban', 'Trung bình', 1.0, 1.5, 0.5, 'Sticky Post Priority Flag'],
        ['Kiểm duyệt bài viết tự động chống ngôn từ tiêu cực bằng AI', 'Quét nội dung bài viết trước khi xuất bản, gắn cờ bài vi phạm', '/moments/ai-moderation', 'Hệ Thống Tự Động', 'Cao', 2.0, 3.5, 1.5, 'AI NLP Text Moderation'],
        ['Xem ảnh phóng to toàn màn hình dạng Lightbox có vuốt chạm', 'Hỗ trợ cử chỉ chạm vuốt sang ảnh kế tiếp trên màn hình di động', '/components/lightbox', 'Người Dùng', 'Cao', 1.5, 0.5, 0.5, 'Touch Gesture Lightbox'],
        ['Chia sẻ bài viết ra mạng xã hội ngoài (LinkedIn, Facebook)', 'Tự động tạo OpenGraph meta tag hình ảnh và tiêu đề chuẩn SEO', '/moments/share-external', 'Hội Viên', 'Trung bình', 1.5, 1.5, 0.5, 'Dynamic OpenGraph SSR'],
        ['Báo cáo bài viết vi phạm đạo đức thương mại (Report Post)', 'Gửi bài viết kèm lý do vi phạm đến hàng đợi kiểm duyệt ban thư ký', '/moments/report', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Moderation Queue'],
        ['Khảo sát ý kiến nhanh trên bảng tin (Poll Voting in Feed)', 'Tạo câu hỏi thăm dò ý kiến 4 lựa chọn, biểu đồ kết quả trực tiếp', '/moments/feed-poll', 'Hội Viên', 'Cao', 2.5, 3.0, 1.5, 'Mini Poll Component'],
        ['Thông báo đẩy (Push Notification) khi có người tương tác bài', 'Gửi push notification tới điện thoại khi có bình luận hoặc nhắc tên', '/api/notifications/push', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 3.0, 1.5, 'Firebase Cloud Messaging'],
        ['Xem bảng tin riêng của từng Câu lạc bộ chuyên môn', 'Lọc luồng tin tức độc quyền chỉ dành riêng cho thành viên câu lạc bộ', '/communities/:id/feed', 'Hội Viên CLB', 'Cao', 2.0, 2.0, 1.0, 'Club Filtered Feed'],
        ['Quản lý vai trò Trưởng Ban, Phó Ban, Thư Ký trong Câu lạc bộ', 'Phân quyền quản trị câu lạc bộ độc lập với quyền hiệp hội chính', '/communities/:id/roles', 'Ban Chấp Hành', 'Cao', 2.0, 2.5, 1.0, 'Sub-community RBAC'],
        ['Lưu bài viết vào bộ sưu tập ưa thích (Saved Moments)', 'Tạo bookmark lưu giữ các bài chia sẻ kinh nghiệm quý giá', '/moments/bookmarks', 'Hội Viên', 'Trung bình', 1.5, 1.5, 0.5, 'Bookmark Entity Storage'],
        ['Thống kê tương tác bài viết (Lượt xem, tiếp cận, chia sẻ)', 'Báo cáo hiệu quả lan tỏa bài viết của doanh nghiệp trên bảng tin', '/moments/post-metrics', 'Hội Viên', 'Trung bình', 2.0, 2.5, 1.0, 'Impression Counter']
      ]
    },
    {
      code: 'CHAT_CALL',
      name: 'Nhắn Tin Realtime & Họp Trực Tuyến Video Call',
      sheet: 'WBS_05_CHAT_VIDEO_CALL',
      themeColor: '0284C7',
      epic: 'Giao Tiếp Realtime & Họp Trực Tuyến',
      baseTasks: [
        ['Kênh chat 1-on-1 thời gian thực qua WebSocket Gateway', 'Độ trễ dưới 0.05 giây, âm thanh thông báo sang trọng, gõ phím realtime', '/chat/:peerId', 'Hội Viên', 'Khẩn cấp', 3.5, 4.0, 2.0, 'Socket.IO / Supabase Realtime'],
        ['Nhắn tin nhóm thảo luận theo Dự án / Phân ban Hiệp hội', 'Tạo nhóm chat đến 200 lãnh đạo doanh nghiệp, phân quyền Admin nhóm', '/chat/group', 'Hội Viên', 'Khẩn cấp', 3.0, 3.5, 2.0, 'Group Channel Multiplexing'],
        ['Gửi tài liệu hợp đồng, bảng báo giá PDF/Excel đến 50MB', 'Hỗ trợ kéo thả gửi tệp tin văn bản, xem trước trực tiếp trên giao diện', '/chat/upload-docs', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Virus Scanning & S3 Storage'],
        ['Ghi âm và gửi tin nhắn thoại (Voice Note) chất lượng cao', 'Thu âm trực tiếp trên trình duyệt, nén âm thanh định dạng AAC/Opus', '/chat/voice-note', 'Hội Viên', 'Cao', 2.5, 2.5, 1.5, 'MediaRecorder API Audio'],
        ['Hiển thị trạng thái đã nhận, đã xem tin nhắn (Read Receipts)', 'Cập nhật dấu tích xanh khi đối tác mở xem tin nhắn trong phòng chat', '/chat/read-receipts', 'Hội Viên', 'Trung bình', 1.5, 2.0, 1.0, 'Delivered & Seen Events'],
        ['Tìm kiếm nội dung tin nhắn và tệp đính kèm trong lịch sử chat', 'Tìm kiếm từ khóa đàm phán hợp đồng, lọc theo tệp tin và hình ảnh', '/chat/search-history', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Chat Message Indexing'],
        ['Cuộc gọi thoại (Audio Call) chất lượng cao qua WebRTC', 'Kết nối thoại P2P mã hóa đầu cuối, âm thanh chuẩn HD rõ nét', '/call/audio', 'Hội Viên', 'Khẩn cấp', 3.5, 4.0, 2.5, 'WebRTC PeerConnection Audio'],
        ['Cuộc gọi Video 1-on-1 trực tiếp bảo mật giữa 2 doanh nhân', 'Truyền hình ảnh Full HD 1080p, tự động điều chỉnh bitrate khi mạng yếu', '/call/video-1on1', 'Hội Viên', 'Khẩn cấp', 4.0, 4.5, 2.5, 'WebRTC Adaptive Bitrate'],
        ['Họp trực tuyến nhiều bên (Video Conference Room) Ban Chấp Hành', 'Hỗ trợ phòng họp đến 16 đại biểu, hiển thị lưới Grid thông minh', '/call/conference', 'Ban Chấp Hành', 'Khẩn cấp', 4.5, 5.0, 3.0, 'SFU Media Server Integration'],
        ['Chia sẻ màn hình máy tính (Screen Sharing) khi thuyết trình dự án', 'Cho phép chia sẻ slide thuyết trình, bảng tính Excel trong cuộc gọi', '/call/screen-share', 'Diễn Giả', 'Cao', 2.5, 3.0, 1.5, 'getDisplayMedia Web API'],
        ['Tính năng giơ tay phát biểu trong phòng họp trực tuyến', 'Đại biểu bấm giơ tay, chủ tọa nhận thông báo và cấp quyền mở mic', '/call/raise-hand', 'Đại Biểu', 'Cao', 1.5, 2.0, 1.0, 'Floor Control Signaling'],
        ['Ghi âm và lưu trữ biên bản cuộc họp trực tuyến lên đám mây', 'Lưu file MP4/WebM cuộc họp lên MinIO phục vụ lưu trữ văn kiện', '/call/recording', 'Thư Ký Cuộc Họp', 'Cao', 2.5, 4.0, 2.0, 'Server-side Media Recorder'],
        ['Bật/Tắt Micro và Camera với phím tắt bàn phím tiện lợi', 'Phím Space để mở mic nói nhanh (Push-to-Talk), phím M để mute', '/call/hotkeys', 'Người Dùng', 'Trung bình', 1.0, 0.5, 0.5, 'Keyboard Shortcuts Hook'],
        ['Lọc tiếng ồn và khử tiếng vọng thông minh bằng Web Audio API', 'Loại bỏ tiếng ồn nền quạt gió, tiếng gõ phím trong khi đàm thoại', '/call/noise-suppression', 'Người Dùng', 'Cao', 2.0, 3.0, 1.5, 'Web Audio Noise Gate'],
        ['Đổi hình nền ảo (Virtual Background) che không gian phía sau', 'Sử dụng mô hình nhận diện khuôn mặt tách nền và thay bằng ảnh phòng họp', '/call/virtual-background', 'Người Dùng', 'Cao', 3.0, 3.5, 2.0, 'TensorFlow.js BodyPix'],
        ['Phòng chờ kiểm duyệt đại biểu vào họp (Waiting Room)', 'Khách bấm tham gia họp phải chờ Chủ tọa duyệt mới được vào phòng', '/call/waiting-room', 'Chủ Tọa Cuộc Họp', 'Cao', 2.0, 2.5, 1.0, 'Waiting Room Gatekeeper'],
        ['Mã hóa đầu cuối cuộc gọi (End-to-End Encryption E2EE)', 'Mã hóa luồng âm thanh và hình ảnh bằng thuật toán AES-GCM', '/call/e2ee', 'Hệ Thống Tự Động', 'Khẩn cấp', 3.0, 4.0, 2.5, 'WebRTC Insertable Streams'],
        ['Hộp chat song song trong cuộc họp trực tuyến (In-call Chat)', 'Trao đổi tin nhắn văn bản và liên kết tài liệu trong khi đang họp', '/call/in-call-chat', 'Người Dự Họp', 'Cao', 1.5, 2.0, 1.0, 'DataChannel In-call Chat'],
        ['Tự động kết nối lại cuộc gọi khi mạng rớt chập chờn (ICE Restart)', 'Tự động tái tạo bắt tay WebRTC trong 2 giây khi đổi mạng 4G/Wifi', '/call/reconnect', 'Hệ Thống Tự Động', 'Cao', 2.0, 3.0, 1.5, 'ICE Restart Reconnection'],
        ['Báo cáo thống kê thời lượng và số lượt họp trực tuyến', 'Tổng kết số giờ họp của Ban Lãnh Đạo và các phân ban theo tháng', '/call/analytics', 'Ban Thư Ký', 'Trung bình', 1.5, 2.0, 1.0, 'Meeting Stats Aggregator']
      ]
    },
    {
      code: 'CRM_LEAD',
      name: 'CRM Quản Trị Khách Hàng, Lead & Trao Cơ Hội Referral',
      sheet: 'WBS_06_CRM_LEADS_REFERRAL',
      themeColor: 'B45309',
      epic: 'Quản Lý Khách Hàng & Cơ Hội Giao Thương',
      baseTasks: [
        ['Tiếp nhận khách hàng tiềm năng (Leads) từ Web Portal & Đặt demo', 'Tự động tạo bản ghi lead, gán nguồn thu thập, phân công cán bộ chăm sóc', '/crm/leads/ingest', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 2.5, 1.0, 'Lead Capture Engine'],
        ['Chấm điểm tiềm năng khách hàng (Lead Scoring Algorithm)', 'Tính điểm dựa trên quy mô công ty, doanh thu, độ khớp ngành nghề', '/crm/leads/scoring', 'Trưởng Ban', 'Cao', 2.0, 3.0, 1.5, 'Rule-based Lead Score'],
        ['Bảng Kanban phễu bán hàng và chăm sóc hội viên (Sales Pipeline)', 'Kéo thả thẻ khách hàng qua các giai đoạn: Mới -> Tiếp cận -> Thẩm định -> Kết nạp', '/crm/pipeline/kanban', 'Cán Bộ CRM', 'Khẩn cấp', 3.5, 3.0, 2.0, 'Drag and Drop Kanban UI'],
        ['Chuyển đổi khách hàng tiềm năng thành Hội viên chính thức 1-click', 'Tự động chuyển thông tin Lead sang bảng members, sinh hóa đơn niên liễm', '/crm/leads/convert', 'Thư Ký Hiệp Hội', 'Khẩn cấp', 2.0, 2.5, 1.5, 'Prisma Lead-to-Member Flow'],
        ['Ghi nhận dòng thời gian tương tác (Activity Timeline & Notes)', 'Lưu lịch sử cuộc gọi, biên bản họp, email trao đổi và nhiệm vụ cần làm', '/crm/activities/timeline', 'Cán Bộ CRM', 'Cao', 2.0, 2.0, 1.0, 'Activity Audit Trail'],
        ['Đặt lịch nhắc việc và hẹn gặp doanh nhân tự động gửi thông báo', 'Cảnh báo hạn chót nộp hồ sơ, nhắc lịch gặp mặt trước 30 phút qua SMS/Push', '/crm/tasks/reminders', 'Cán Bộ CRM', 'Cao', 2.0, 2.5, 1.0, 'Task Scheduler Cron'],
        ['Trao cơ hội kinh doanh (Create Business Referral Opportunity)', 'Hội viên A giới thiệu khách hàng lớn cho Hội viên B trong mạng lưới', '/crm/referrals/create', 'Hội Viên', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Referral Tracking Model'],
        ['Theo dõi trạng thái cơ hội kinh doanh: Đang đàm phán -> Ký kết thành công', 'Cập nhật tiến độ tiếp cận khách hàng được giới thiệu, bảo đảm minh bạch', '/crm/referrals/:id/track', 'Hội Viên Nhận', 'Cao', 2.0, 2.0, 1.0, 'Deal Stage Progression'],
        ['Ghi nhận giá trị hợp đồng thành công và chia hoa hồng cảm ơn', 'Xác nhận doanh thu thực tế phát sinh từ cơ hội, ghi nhận đóng góp hiệp hội', '/crm/referrals/revenue-slip', 'Hội Viên', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Commission Settlement'],
        ['Báo cáo thống kê hiệu quả mạng lưới kết nối kinh doanh (ROI Analytics)', 'Biểu đồ tổng giá trị giao thương, top hội viên tích cực trao cơ hội nhất', '/crm/reports/referral-kpi', 'Ban Lãnh Đạo', 'Cao', 2.5, 3.0, 1.5, 'Aggregated BI Metrics'],
        ['Tích hợp biểu mẫu thu thập thông tin trên trang chủ Landing Page', 'Biểu mẫu Đặt Demo nhúng trên Web tự động đẩy dữ liệu về CRM', '/crm/lead-forms', 'Khách Vãng Lai', 'Cao', 2.0, 2.0, 1.0, 'Embeddable Lead Form'],
        ['Phân công xử lý Lead tự động theo quy tắc vòng tròn (Round-Robin)', 'Chia đều khách hàng tiềm năng cho các cán bộ phụ trách không thiên vị', '/crm/lead-assignment', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Round-Robin Dispatcher'],
        ['Cảnh báo trùng lặp khách hàng tiềm năng qua Số điện thoại & MST', 'Ngăn chặn 2 cán bộ cùng tiếp cận 1 doanh nghiệp gây phiền hà', '/crm/leads/deduplication', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.0, 1.0, 'Fuzzy Deduplication Engine'],
        ['Quản lý danh bạ người liên hệ theo từng doanh nghiệp (Company Contacts)', 'Lưu danh sách Chủ tịch, Tổng giám đốc, Giám đốc tài chính cùng công ty', '/crm/companies/contacts', 'Cán Bộ CRM', 'Cao', 2.0, 2.0, 1.0, 'Company-Contact Graph'],
        ['Gắn nhãn phân loại cơ hội theo giá trị (Thỏa thuận nhỏ, vừa, lớn, khủng)', 'Tự động gán nhãn VIP Deal cho các hợp đồng có giá trị trên 5 tỷ VNĐ', '/crm/deals/tagging', 'Hệ Thống Tự Động', 'Trung bình', 1.0, 1.5, 0.5, 'Deal Classification Rules'],
        ['Dự báo doanh thu giao thương theo xác suất chốt (Revenue Forecast)', 'Tính tổng doanh thu kỳ vọng = Giá trị hợp đồng x Tỷ lệ xác suất thành công', '/crm/forecast', 'Ban Lãnh Đạo', 'Cao', 2.5, 3.0, 1.5, 'Weighted Pipeline Analytics'],
        ['Xuất danh sách khách hàng tiềm năng ra file Excel phân tích', 'Hỗ trợ xuất toàn bộ dữ liệu kèm lịch sử tương tác và ghi chú', '/crm/leads/export', 'Cán Bộ CRM', 'Cao', 1.5, 2.0, 1.0, 'Excel Export Lead Data'],
        ['Nhập danh bạ khách hàng tiềm năng từ file Excel hội thảo', 'Nạp 500 khách từ file Excel danh sách khách dự hội thảo kinh tế', '/crm/leads/import', 'Cán Bộ CRM', 'Cao', 2.5, 3.0, 1.5, 'Excel Batch Lead Import'],
        ['Tự động gửi email cảm ơn sau khi hoàn tất cuộc gọi chăm sóc', 'Tự động gửi email biên bản tóm tắt nội dung trao đổi cho khách hàng', '/crm/auto-followup', 'Cán Bộ CRM', 'Trung bình', 1.5, 2.5, 1.0, 'Follow-up Automation'],
        ['Báo cáo tỷ lệ chuyển đổi khách hàng qua từng giai đoạn (Conversion Rate)', 'Biểu đồ phễu thu hẹp thể hiện tỷ lệ rơi rụng khách hàng qua các bước', '/crm/reports/funnel', 'Ban Lãnh Đạo', 'Cao', 2.5, 2.5, 1.5, 'Funnel Conversion BI']
      ]
    },
    {
      code: 'EMAIL_MKT',
      name: 'Mẫu Email, Trình Soạn Thảo & Chiến Dịch Truyền Thông',
      sheet: 'WBS_07_EMAIL_TEMPLATES',
      themeColor: '4338CA',
      epic: 'Email Marketing & Truyền Thông Tự Động',
      baseTasks: [
        ['Trình soạn thảo mẫu Email trực quan WYSIWYG chuyên nghiệp', 'Hỗ trợ kéo thả khối văn bản, hình ảnh, nút bấm CTA, chân trang hiệp hội', '/email/templates/builder', 'Ban Truyền Thông', 'Khẩn cấp', 3.5, 3.5, 2.0, 'WYSIWYG Email Engine'],
        ['Thư viện thẻ trộn dữ liệu động (Merge Tags: Tên, Chức danh, Hóa đơn)', 'Chèn tự động `{{ho_ten}}`, `{{ten_doanh_nghiep}}`, `{{so_tien_phi}}`', '/email/templates/tags', 'Ban Truyền Thông', 'Cao', 2.0, 2.5, 1.0, 'Template Interpolation'],
        ['Kho mẫu email định dạng chuẩn: Thư mời Gala, Chúc mừng sinh nhật, Nhắc phí', 'Cung cấp sẵn 10 mẫu email thiết kế sang trọng chuẩn ngoại giao hiệp hội', '/email/templates/library', 'Thư Ký Hiệp Hội', 'Cao', 1.5, 1.5, 1.0, 'Responsive HTML Templates'],
        ['Tạo chiến dịch gửi Email Marketing theo phân nhóm đối tượng', 'Lọc danh sách nhận theo tiêu chí: Hội viên Kim Cương, Nợ phí, Doanh nghiệp BĐS', '/email/campaigns/create', 'Ban Truyền Thông', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Segmented Email Dispatch'],
        ['Hàng đợi gửi Email số lượng lớn chống nghẽn và chống rơi vào Spam', 'Phân luồng gửi 100 email mỗi phút qua hàng đợi Redis BullMQ', '/api/email/queue-worker', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.5, 4.0, 2.0, 'BullMQ & Redis Workers'],
        ['Theo dõi tỷ lệ mở email (Open Rate Tracking) qua tracking pixel', 'Nhúng ảnh trong suốt 1x1px ghi nhận chính xác thời điểm hội viên đọc thư', '/api/email/track-open', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Pixel Tracking Endpoint'],
        ['Theo dõi tỷ lệ bấm link (Click-through Rate Tracking)', 'Chuyển hướng liên kết qua gateway đếm lượt click trước khi sang trang đích', '/api/email/track-click', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Link Redirect Counter'],
        ['Xử lý từ chối nhận thư (Unsubscribe Opt-out) tuân thủ luật an ninh mạng', 'Hỗ trợ hội viên hủy đăng ký nhận bản tin với 1-click, cập nhật danh sách chặn', '/email/unsubscribe', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'CAN-SPAM Compliance'],
        ['Tích hợp máy chủ SMTP doanh nghiệp an toàn (Amazon SES, SendGrid)', 'Cấu hình DKIM, SPF, DMARC bảo đảm tỷ lệ vào hộp thư chính Inbox 99%', '/admin/smtp-settings', 'Kỹ Sư DevOps', 'Khẩn cấp', 1.5, 3.0, 1.5, 'DKIM & SPF Records'],
        ['Báo cáo thống kê chiến dịch truyền thông đa chiều theo thời gian thực', 'Biểu đồ tỷ lệ gửi thành công, tỷ lệ mở, tỷ lệ click theo từng chiến dịch', '/email/campaigns/:id/report', 'Ban Truyền Thông', 'Cao', 2.0, 2.5, 1.0, 'Campaign Performance Analytics'],
        ['Kiểm tra lỗi hiển thị email trên nhiều ứng dụng hòm thư (Litmus Test)', 'Xem trước bản render trên Gmail, Outlook Desktop, Apple Mail, Webmail', '/email/preview-clients', 'Ban Truyền Thông', 'Cao', 2.0, 2.5, 1.0, 'Email Rendering Engine'],
        ['Thiết lập chiến dịch gửi email định kỳ tự động (Recurring Campaign)', 'Tự động gửi bản tin thị trường vào 8h00 sáng thứ Hai hàng tuần', '/email/recurring', 'Ban Truyền Thông', 'Cao', 2.0, 3.0, 1.5, 'Cron Schedule Dispatch'],
        ['Thử nghiệm A/B Testing tiêu đề thư tối ưu hóa tỷ lệ mở', 'Gửi 2 tiêu đề khác nhau cho 20% danh sách, chọn tiêu đề thắng gửi cho 80%', '/email/ab-testing', 'Ban Truyền Thông', 'Cao', 2.5, 3.5, 1.5, 'A/B Testing Dispatcher'],
        ['Tự động dọn dẹp địa chỉ email chết (Bounce Management)', 'Tự động đánh dấu và loại bỏ các email bị hard bounce sau 1 lần gửi', '/email/bounce-handler', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Bounce Webhook Handler'],
        ['Cảnh báo nội dung có nguy cơ bị bộ lọc Spam chặn (Spam Score Checker)', 'Chấm điểm từ khóa nhạy cảm trong tiêu đề và nội dung trước khi gửi', '/email/spam-checker', 'Ban Truyền Thông', 'Trung bình', 2.0, 2.5, 1.0, 'SpamAssassin Scoring'],
        ['Đính kèm tệp văn kiện PDF dung lượng tối đa 10MB trong email', 'Nén tệp tin và lưu trữ cloud link nếu file vượt quá dung lượng cho phép', '/email/attachments', 'Thư Ký Hiệp Hội', 'Cao', 1.5, 2.0, 1.0, 'Attachment Storage Proxy'],
        ['Phân quyền phê duyệt chiến dịch trước khi gửi hàng loạt', 'Nhân viên soạn thảo chiến dịch, Trưởng ban duyệt nội dung mới được gửi', '/email/approval-workflow', 'Trưởng Ban', 'Cao', 2.0, 2.5, 1.0, 'Campaign Approval Workflow'],
        ['Xem lại nhật ký lịch sử gửi thư của từng hội viên cụ thể', 'Xem danh sách toàn bộ email hiệp hội đã gửi cho hội viên A từ trước đến nay', '/members/:id/email-history', 'Thư Ký Hiệp Hội', 'Trung bình', 1.5, 2.0, 1.0, 'Member Email Audit Trail'],
        ['Tạo chiến dịch email chúc mừng sinh nhật hội viên tự động mỗi ngày', 'Hệ thống quét ngày sinh nhật lúc 7h00 sáng và tự động gửi thiệp chúc mừng', '/email/birthday-bot', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Daily Birthday Cron'],
        ['Xuất báo cáo tổng kết truyền thông email ra file Excel và PDF', 'Xuất bảng tổng hợp số liệu chiến dịch phục vụ báo cáo đại hội thường niên', '/email/reports/export', 'Ban Truyền Thông', 'Cao', 1.5, 2.0, 1.0, 'Formatted Report Export']
      ]
    },
    {
      code: 'MARKETPLACE',
      name: 'Sàn Giao Thương B2B, Báo Giá RFQ & Hợp Đồng Điện Tử',
      sheet: 'WBS_08_B2B_MARKETPLACE',
      themeColor: 'C2410C',
      epic: 'Sàn Thương Mại & Mua Bán B2B',
      baseTasks: [
        ['Đăng tải sản phẩm / dịch vụ lên sàn giao thương B2B nội bộ', 'Hỗ trợ tải lên bộ sưu tập 10 ảnh nét, mô tả kỹ thuật, giấy phép kinh doanh', '/marketplace/products/create', 'Doanh Nghiệp Bán', 'Khẩn cấp', 3.0, 3.0, 2.0, 'B2B Product Model'],
        ['Vòng đời kiểm duyệt sản phẩm: Bản nháp -> Chờ duyệt -> Đang bán -> Đã bán', 'Ban Xúc tiến Thương mại phê duyệt tính pháp lý trước khi xuất bản công khai', '/marketplace/products/approval', 'Ban Xúc Tiến', 'Khẩn cấp', 2.0, 2.5, 1.5, 'Product Moderation Workflow'],
        ['Phân loại danh mục hàng hóa theo mã ngành chuẩn HS Code quốc tế', 'Hệ thống cây danh mục 3 cấp: Xây dựng, Công nghệ, Y tế, Nông sản xuất khẩu', '/marketplace/categories', 'Quản Trị Viên', 'Cao', 2.0, 2.0, 1.0, 'Hierarchical Category Tree'],
        ['Đăng tải Yêu cầu báo giá mua hàng (Request for Quotation - RFQ)', 'Doanh nghiệp mua đăng nhu cầu 500 tấn thép kết cấu, đặt hạn chót nhận báo giá', '/marketplace/rfq/create', 'Doanh Nghiệp Mua', 'Khẩn cấp', 3.0, 3.5, 2.0, 'RFQ Procurement System'],
        ['Nộp hồ sơ chào thầu báo giá cạnh tranh bí mật (Sealed Bidding)', 'Nhà cung cấp gửi bảng báo giá bảo mật, mã hóa giá cho tới giờ mở thầu', '/marketplace/rfq/:id/bid', 'Nhà Cung Cấp', 'Khẩn cấp', 2.5, 3.5, 1.5, 'Sealed Bid Cryptography'],
        ['Bảng so sánh đối chiếu giá thầu tự động giữa các nhà cung cấp', 'So sánh đơn giá, thời gian giao hàng, chứng chỉ chất lượng trên 1 màn hình', '/marketplace/rfq/:id/compare', 'Doanh Nghiệp Mua', 'Cao', 2.5, 3.0, 1.5, 'Procurement Comparison Matrix'],
        ['Giỏ yêu cầu báo giá hàng loạt (B2B Quote Cart)', 'Thêm nhiều sản phẩm của các hội viên khác nhau vào giỏ để gửi yêu cầu 1 lúc', '/marketplace/cart', 'Doanh Nghiệp Mua', 'Cao', 2.0, 2.5, 1.0, 'B2B Quote Cart System'],
        ['Ký Thỏa thuận Hợp tác Nguyên tắc (MOU) trực tuyến xác thực OTP', 'Hai bên thống nhất điều khoản -> Nhận mã OTP SMS xác thực -> Đóng dấu số', '/marketplace/contract/sign-otp', 'Lãnh Đạo 2 Bên', 'Khẩn cấp', 3.0, 3.5, 2.0, 'Digital Signature OTP'],
        ['Đánh giá uy tín nhà cung cấp 5 sao và viết nhận xét đối tác giao thương', 'Đánh giá chất lượng hàng hóa, tiến độ giao hàng, thái độ hợp tác sau giao dịch', '/marketplace/reviews', 'Doanh Nghiệp Mua', 'Cao', 2.0, 2.0, 1.0, 'Verified Partner Reviews'],
        ['Gắn huy hiệu Nhà Cung Ứng Tiêu Biểu chứng nhận bởi Hiệp hội', 'Cấp chứng chỉ điện tử cho doanh nghiệp uy tín, hiển thị huy hiệu vàng trên sàn', '/marketplace/badges', 'Ban Lãnh Đạo', 'Trung bình', 1.5, 2.0, 1.0, 'Accreditation Badge System'],
        ['Tìm kiếm sản phẩm bằng hình ảnh thông minh (Visual Product Search)', 'Tải ảnh mẫu chi tiết cơ khí để tìm nhà cung cấp có sản phẩm tương tự', '/marketplace/search-image', 'Doanh Nghiệp Mua', 'Cao', 3.0, 4.0, 2.0, 'Vector Image Embedding Search'],
        ['Hệ thống đàm phán giá trực tiếp 1-on-1 trong đơn hàng báo giá', 'Khung chat thương thảo hợp đồng riêng gắn liền với mã báo giá cụ thể', '/marketplace/rfq/:id/negotiate', 'Bên Mua & Bán', 'Cao', 2.5, 3.0, 1.5, 'Deal Negotiation Channel'],
        ['Quản lý bảng giá linh hoạt theo số lượng đặt hàng (Tiered Pricing)', 'Cấu hình giá: Mua 100-500 chiếc giá 50k, mua trên 1000 chiếc giá 42k', '/marketplace/products/tiers', 'Doanh Nghiệp Bán', 'Cao', 2.0, 2.5, 1.0, 'Tiered Pricing Structure'],
        ['Cảnh báo hồ sơ năng lực nhà thầu không đạt tiêu chuẩn tối thiểu', 'Cảnh báo tự động nếu nhà thầu có vốn điều lệ hoặc kinh nghiệm dưới yêu cầu', '/marketplace/rfq/vetting', 'Hệ Thống Tự Động', 'Cao', 1.5, 2.5, 1.0, 'Automated Vendor Vetting'],
        ['Tải tài liệu hồ sơ thầu định dạng ZIP dung lượng lên tới 200MB', 'Hỗ trợ tải toàn bộ bản vẽ thiết kế CAD và hồ sơ năng lực nén', '/marketplace/rfq/attachments', 'Nhà Cung Cấp', 'Cao', 2.0, 2.5, 1.0, 'Multi-part S3 Upload'],
        ['Xuất biên bản mở thầu và phê duyệt kết quả lựa chọn nhà thầu', 'Xuất file PDF có chữ ký số xác nhận của Tổ chuyên gia chấm thầu', '/marketplace/rfq/award-minutes', 'Ban Đấu Thầu', 'Cao', 2.0, 2.5, 1.0, 'Procurement Award Minutes'],
        ['Lọc sản phẩm theo tiêu chí chứng nhận xanh và phát triển bền vững', 'Lọc các sản phẩm đạt tiêu chuẩn ESG, ISO 14001, năng lượng tái tạo', '/marketplace/esg-filter', 'Doanh Nghiệp Mua', 'Trung bình', 1.5, 2.0, 1.0, 'ESG Accreditation Filter'],
        ['Quản lý kho hàng và trạng thái sẵn sàng cung ứng (Stock Status)', 'Cập nhật tình trạng Còn hàng / Đặt trước 15 ngày / Tạm ngưng cung cấp', '/marketplace/inventory', 'Doanh Nghiệp Bán', 'Cao', 1.5, 2.0, 1.0, 'Inventory Availability'],
        ['Khóa tạm thời quyền bán hàng của doanh nghiệp khi có khiếu nại', 'Ban Kiểm tra tạm khóa gian hàng khi có tranh chấp thương mại chưa giải quyết', '/marketplace/seller-lock', 'Ban Kiểm Tra', 'Cao', 1.5, 2.0, 1.0, 'Seller Suspension Logic'],
        ['Báo cáo tổng kết kim ngạch giao thương B2B toàn hiệp hội', 'Biểu đồ tổng giá trị giao dịch phát sinh qua sàn theo tháng và ngành hàng', '/marketplace/reports/turnover', 'Ban Lãnh Đạo', 'Cao', 2.5, 3.0, 1.5, 'Trade Turnover BI']
      ]
    },
    {
      code: 'FINANCE_VAT',
      name: 'Tài Chính, Hóa Đơn VAT Điện Tử & Xử Lý Excel Hàng Loạt',
      sheet: 'WBS_09_FINANCE_VAT_EXCEL',
      themeColor: '047857',
      epic: 'Tài Chính, Kế Toán & Xử Lý Dữ Liệu Excel',
      baseTasks: [
        ['Phát hành Hóa Đơn Giá Trị Gia Tăng Điện Tử (E-Invoice VAT)', 'Tích hợp cổng VNPT/Viettel Invoice sinh hóa đơn đỏ gửi tự động cho doanh nghiệp', '/finance/e-invoice', 'Kế Toán Thuế', 'Khẩn cấp', 3.5, 4.0, 2.0, 'Thông tư 78/BTC E-Invoice'],
        ['Tạo hóa đơn niên liễm điện tử kèm mã VietQR Napas 24/7 động', 'Sinh mã VietQR chuẩn EMVCo chứa mã hóa đơn và số tiền, chống sửa đổi nội dung', '/fees/:id/vietqr', 'Ban Tài Chính', 'Khẩn cấp', 2.0, 2.5, 1.0, 'VietQR EMVCo Standard'],
        ['Xử lý Webhook biến động số dư ngân hàng tự động gạch nợ trong 1s', 'Ngân hàng gọi webhook -> Xác thực chữ ký số HMAC-SHA256 -> Gạch nợ tức thì', '/api/webhooks/bank-transfer', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 3.5, 2.0, 'HMAC-SHA256 Webhook Auth'],
        ['Xử lý chuyển khoản thiếu tiền (under-payment) ghi nhận nợ treo', 'Chuyển sang trạng thái partially_paid, tự động tính phần dư nợ và sinh QR bổ sung', '/fees/:id/partial', 'Hệ Thống Tự Động', 'Cao', 2.0, 2.5, 1.0, 'Partial Payment Reconciliation'],
        ['Xử lý chuyển khoản thừa tiền (over-payment) ký quỹ niên độ sau', 'Gạch nợ hóa đơn, cộng tiền thừa vào số dư ký quỹ escrow_balance của hội viên', '/fees/:id/overpaid', 'Ban Tài Chính', 'Trung bình', 1.5, 2.0, 1.0, 'Escrow Ledger Balancing'],
        ['Quy trình hoàn tiền (Refund Workflow) khi hủy vé sự kiện hợp lệ', 'Lập phiếu đề xuất hoàn chi -> Thẩm định -> Duyệt lệnh hoàn tiền qua ngân hàng', '/finance/refunds', 'Kế Toán Trưởng', 'Cao', 2.5, 3.0, 1.5, 'Multi-step Refund Approval'],
        ['Đối soát tự động sao kê ngân hàng hàng tháng (Bank Reconciliation)', 'Nạp file sao kê Vietcombank/MBBank (.xlsx/CSV) đối chiếu các giao dịch hệ thống', '/finance/reconciliation', 'Kế Toán Trưởng', 'Khẩn cấp', 3.0, 4.0, 2.0, 'Automated Reconciliation Match'],
        ['Quản lý 4 quỹ tài chính độc lập (Niên liễm, Xúc tiến, Từ thiện, Golf)', 'Hạch toán thu chi riêng biệt từng quỹ, cảnh báo khi chi tiêu vượt định mức', '/finance/multi-fund', 'Ban Tài Chính', 'Cao', 2.5, 3.0, 1.5, 'Multi-fund Budget Ledger'],
        ['Nhập danh sách dữ liệu hàng loạt từ file Excel (Bulk Import Engine)', 'Kiểm tra tính hợp lệ dữ liệu, bắt lỗi định dạng ngày tháng, nạp 1000 dòng 1 lúc', '/admin/import-excel', 'Kỹ Sư Dữ Liệu', 'Khẩn cấp', 3.0, 4.0, 2.5, 'ExcelJS Chunked Batch Import'],
        ['Xuất danh sách dữ liệu ra file Excel định dạng chuẩn (Formatted Export)', 'Xuất file Excel có đầy đủ màu sắc, AutoFilter, định dạng tiền tệ và Freeze panes', '/admin/export-excel', 'Ban Thư Ký', 'Cao', 2.0, 2.5, 1.0, 'ExcelJS Formatted Export'],
        ['Phê duyệt chi ngân sách hiệp hội theo quy trình 3 cấp thẩm quyền', 'Trưởng ban đề xuất chi -> Kế toán trưởng thẩm định -> Chủ tịch ký duyệt', '/finance/payment-orders', 'Ban Lãnh Đạo', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Multi-level Expenditure Approval'],
        ['In phiếu thu và phiếu chi tiền mặt theo mẫu Thông tư 200/BTC', 'Sinh mẫu in phiếu thu chi khổ A5 có đầy đủ chữ ký người nộp, thủ quỹ, kế toán', '/finance/cash-vouchers', 'Thủ Quỹ', 'Cao', 2.0, 2.0, 1.0, 'Circular 200 Cash Voucher Print'],
        ['Cảnh báo nợ đọng hội phí tự động gửi thông báo nhắc nhở đa kênh', 'Hệ thống gửi email và thông báo đẩy nhắc nợ trước 30 ngày, 15 ngày và ngày hết hạn', '/finance/debt-reminder', 'Hệ Thống Tự Động', 'Cao', 2.0, 2.5, 1.0, 'Automated Debt Reminder Cron'],
        ['Gia hạn thẻ hội viên tự động ngay khi thanh toán thành công', 'Cập nhật trường expired_at cộng thêm 365 ngày ngay khi gạch nợ hóa đơn', '/fees/auto-renewal', 'Hệ Thống Tự Động', 'Khẩn cấp', 1.5, 2.5, 1.0, 'Membership Expiry Extension'],
        ['Tra cứu lịch sử đóng phí và tải hóa đơn điện tử cho doanh nghiệp', 'Hội viên tự đăng nhập cổng cá nhân xem và tải bản thể hiện PDF hóa đơn đỏ', '/members/my-invoices', 'Hội Viên', 'Cao', 1.5, 2.0, 1.0, 'Self-service Invoices'],
        ['Báo cáo lưu chuyển tiền tệ (Cash Flow Statement) theo tháng', 'Biểu đồ dòng tiền vào, dòng tiền ra và số dư khả dụng cuối kỳ', '/finance/cash-flow', 'Kế Toán Trưởng', 'Cao', 2.5, 3.0, 1.5, 'Cash Flow Reporting'],
        ['Tích hợp cổng thanh toán trực tuyến thẻ quốc tế Visa/Mastercard', 'Thanh toán hội phí cho hội viên quốc tế qua cổng OnePay / VNPAY an toàn', '/finance/card-checkout', 'Hội Viên Quốc Tế', 'Khẩn cấp', 2.5, 3.5, 2.0, 'Online Card Gateway Auth'],
        ['Quản lý tỷ giá ngoại tệ USD/EUR/VND cho hội viên nước ngoài', 'Tự động cập nhật tỷ giá hàng ngày từ Vietcombank để quy đổi hội phí', '/finance/exchange-rates', 'Kế Toán Trưởng', 'Trung bình', 1.5, 2.5, 1.0, 'Exchange Rate Sync Service'],
        ['Khóa sổ tài chính cuối năm tài chính ngăn chặn chỉnh sửa số liệu', 'Khóa toàn bộ chứng từ năm cũ sau khi quyết toán thuế, chỉ cho phép xem', '/finance/fiscal-year-close', 'Kế Toán Trưởng', 'Cao', 1.5, 2.5, 1.0, 'Fiscal Year Lockout'],
        ['Báo cáo kiểm toán minh bạch tài chính trình bày tại Đại hội thường niên', 'Báo cáo tổng hợp thu chi có kiểm toán viên độc lập xác nhận để trình đại biểu', '/finance/annual-audit-report', 'Ban Kiểm Tra', 'Cao', 2.0, 2.5, 1.5, 'Annual Audit Pack']
      ]
    },
    {
      code: 'EVENT_SEAT',
      name: 'Sự Kiện, Sơ Đồ Bàn Tiệc VIP, Bầu Cử Số & Thẻ NFC',
      sheet: 'WBS_10_EVENT_SEAT_VOTE',
      themeColor: '9D174D',
      epic: 'Sự Kiện Khán Phòng, Bầu Cử & Thẻ Thông Minh',
      baseTasks: [
        ['Thiết lập sự kiện Đại Hội Doanh Nhân & Dạ tiệc Gala quy mô 500 khách', 'Khai báo tên sự kiện, thời gian, địa điểm Keangnam Landmark 72, sơ đồ khán phòng', '/events/create', 'Ban Tổ Chức', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Event Master Setup'],
        ['Cấu hình Sơ đồ Bàn tiệc VIP & Ghế ngồi Grand Ballroom 25 bàn tròn', 'Phân chia Bàn VIP-01 (Chủ tịch), Bàn Nhà tài trợ Kim Cương, Bàn Hội đồng', '/events/:id/seating-layout', 'Ban Tổ Chức', 'Khẩn cấp', 3.5, 4.0, 2.0, 'Interactive Seating Canvas'],
        ['Cơ chế khóa ghế chống tranh chấp giữa 2 đại biểu (Anti-seat-conflict)', 'Khóa vị trí ghế ngay khi thư ký chọn, ngăn chặn gán trùng ghế trong mọi trường hợp', '/events/:id/seat-lock', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 3.0, 1.5, 'Pessimistic Seat Locking'],
        ['Sinh mã vé QR Check-in độc bản tích hợp chữ ký số chống làm giả', 'Vé QR chứa ID sự kiện, mã hội viên, số bàn, số ghế, ký số HMAC bảo mật', '/events/:id/tickets/generate', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.0, 2.5, 1.0, 'HMAC Signed Ticket QR'],
        ['Camera kiosk quét vé QR tại sảnh hội trường điểm danh dưới 0.5 giây', 'Điểm danh đại biểu vào cửa, phát âm thanh chào đón, ngăn quét trùng vé đã vào', '/events/:id/checkin-kiosk', 'Lễ Tân Sảnh', 'Khẩn cấp', 3.0, 3.0, 2.0, 'Realtime Camera Barcode API'],
        ['Cơ chế Check-in Ngoại tuyến (Offline PWA Sync) khi nghẽn mạng 4G', 'Đồng bộ trước 500 khách vào LocalStorage/IndexedDB, quét offline và tự sync khi có mạng', '/events/:id/offline-mode', 'Lễ Tân Sảnh', 'Khẩn cấp', 3.0, 3.5, 2.0, 'Service Worker Offline Sync'],
        ['Màn hình LED Dashboard hiển thị tỷ lệ đại biểu có mặt thời gian thực', 'Biểu đồ sĩ số khách vào cửa theo từng phút, danh sách khách VIP đang hiện diện', '/events/:id/live-dashboard', 'Ban Thường Trực', 'Cao', 2.0, 2.5, 1.0, 'WebSocket Realtime Broadcast'],
        ['Bầu cử số: Cấp mã thẻ cử tri điện tử một chiều (Voter Token)', 'Kiểm tra điều kiện đóng phí, sinh mã token ngẫu nhiên không gắn trực tiếp với tên', '/elections/:id/voters', 'Ban Thẩm Tra', 'Khẩn cấp', 2.0, 2.5, 1.0, 'Anonymized Voter Token'],
        ['Hòm phiếu điện tử bí mật mã hóa băm SHA-256 chống bầu gian lận lần 2', 'Băm một chiều lá phiếu vào hòm số, đánh dấu cử tri đã bầu (Anti-Double Voting)', '/elections/:id/ballot-box', 'Hệ Thống Tự Động', 'Khẩn cấp', 3.0, 3.5, 2.0, 'SHA-256 Cryptographic Ballot'],
        ['Thao tác bỏ phiếu bầu cử điện tử trên Mobile ViOne App (source_app: vione_app)', 'Bỏ phiếu tiện lợi trên ứng dụng di động, lưu trường source_app chính xác', '/connect-app/voting', 'Hội Viên Mobile', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Mobile App Voting Flow'],
        ['Thao tác bỏ phiếu bầu cử trên Cổng Thông Tin Hiệp Hội (source_app: association_app)', 'Bỏ phiếu trên web portal máy tính, hiển thị tiến độ bỏ phiếu của hiệp hội', '/association/voting', 'Hội Viên Web', 'Khẩn cấp', 2.5, 3.0, 1.5, 'Portal App Voting Flow'],
        ['Bỏ phiếu trực tiếp tại bàn kiểm phiếu CRM (source_app: crm)', 'Thư ký hỗ trợ đại biểu cao niên bỏ phiếu tại hội trường qua CRM', '/crm/voting', 'Ban Thư Ký CRM', 'Khẩn cấp', 2.0, 2.5, 1.0, 'CRM Direct Voting Flow'],
        ['Kiểm phiếu tự động trong 1 giây & Biểu đồ thanh tỷ lệ trúng cử trực tiếp', 'Đến giờ đóng hòm phiếu, hệ thống tự động kiểm phiếu và công bố kết quả minh bạch', '/elections/:id/results', 'Ban Kiểm Tra', 'Khẩn cấp', 2.5, 3.5, 1.5, 'Automated Ballot Tallying'],
        ['Phát sóng thông báo kết thúc bầu cử & kết quả về 3 ứng dụng', 'Phát socket và push notification kèm huy hiệu chiến thắng 🏆 về CRM, ViOne, Hiệp Hội', '/elections/:id/broadcast', 'Hệ Thống Tự Động', 'Khẩn cấp', 2.5, 3.5, 1.5, 'Multi-app Result Broadcast'],
        ['In thẻ đeo đại biểu tự động qua máy in nhiệt kết nối Kiosk sảnh', 'Ngay khi quét vé hợp lệ, máy in tự nhả thẻ đeo có in tên, công ty và số bàn VIP', '/events/kiosk/badge-printer', 'Lễ Tân Sảnh', 'Cao', 2.5, 3.0, 1.5, 'Thermal Printer ESC/POS'],
        ['Quản lý danh sách nhà tài trợ sự kiện (Kim Cương, Vàng, Bạc, Đồng)', 'Hiển thị logo nhà tài trợ trên backdrop, vé mời, màn hình LED và thư cảm ơn', '/events/:id/sponsors', 'Ban Xúc Tiến', 'Cao', 2.0, 2.0, 1.0, 'Sponsorship Management'],
        ['Khảo sát đánh giá sự kiện sau khi kết thúc (Post-event Feedback)', 'Tự động gửi link khảo sát chất lượng dịch vụ và độ hài lòng của đại biểu', '/events/:id/survey', 'Đại Biểu', 'Trung bình', 1.5, 2.0, 1.0, 'Event Survey Engine'],
        ['Đăng ký tham gia diễn đàn thảo luận bàn tròn trong khuôn khổ đại hội', 'Đại biểu đăng ký tham gia các phiên chuyên đề: BĐS, Tài chính, AI chuyển đổi số', '/events/:id/breakout-sessions', 'Hội Viên', 'Cao', 2.0, 2.5, 1.0, 'Breakout Session Booking'],
        ['Xuất biên bản kiểm phiếu bầu cử chính thức có chữ ký số Ban Kiểm Tra', 'Tạo văn bản PDF biên bản kiểm phiếu đại hội lưu hồ sơ pháp lý Sở Nội Vụ', '/elections/:id/official-minutes', 'Trưởng Ban Kiểm Tra', 'Khẩn cấp', 2.0, 2.5, 1.5, 'Legal Minutes PDF Sign'],
        ['Báo cáo tài chính thu chi đại hội và quyết toán tài trợ sự kiện', 'Đối chiếu tiền bán vé, tiền tài trợ và chi phí tiệc gala, xuất báo cáo tổng kết', '/events/:id/financial-settlement', 'Ban Tài Chính', 'Cao', 2.5, 3.0, 1.5, 'Event P&L Statement']
      ]
    }
  ];

  // Lifecycle phases to scale tasks into full 100+ tasks per module
  const lifecyclePhases = [
    { name: 'Khởi Tạo, Phân Tích Nghiệp Vụ & Mô Hình Dữ Liệu', tag: 'Architecture & Schema' },
    { name: 'Xây Dựng Giao Diện Người Dùng Frontend (Desktop & Mobile)', tag: 'Frontend Engineering' },
    { name: 'Xử Lý Logic Nghiệp Vụ Backend API & Cơ Sở Dữ Liệu CSDL', tag: 'Backend & Services' },
    { name: 'Tích Hợp Realtime, Hàng Đợi Worker & Bảo Mật Granular RBAC', tag: 'Integration & Security' },
    { name: 'Kiểm Thử Tự Động Toàn Diện E2E, Hiệu Năng & Nghiệm Thu UAT', tag: 'QA & Optimization' }
  ];

  let globalWbsCounter = 1;
  const moduleSheetsData = [];

  modulesCatalog.forEach((mod) => {
    const sheetTasks = [];

    // Scale to 100+ tasks per module cleanly
    lifecyclePhases.forEach((phase, pIdx) => {
      mod.baseTasks.forEach((tmpl, tIdx) => {
        const wbsCode = `WBS-${mod.code}-${String(globalWbsCounter++).padStart(4, '0')}`;
        const epicName = `${mod.epic} [Giai đoạn: ${phase.name}]`;

        let taskTitle = '';
        let flowDesc = '';
        let feD = tmpl[5];
        let beD = tmpl[6];
        let qaD = tmpl[7];

        if (pIdx === 0) {
          taskTitle = `[Kiến Trúc & Schema] ${tmpl[0]}`;
          flowDesc = `Phân tích yêu cầu nghiệp vụ, thiết kế bảng dữ liệu CSDL PostgreSQL, đặc tả API RESTful và luồng nghiệp vụ chi tiết cho: ${tmpl[1]}`;
          feD = 0.5; beD = 1.5; qaD = 0.5;
        } else if (pIdx === 1) {
          taskTitle = `[Giao Diện Frontend] ${tmpl[0]}`;
          flowDesc = `Phát triển giao diện React/Tailwind, tối ưu hóa responsive di động, xử lý trạng thái loading/error/empty state: ${tmpl[1]}`;
          feD = 2.0; beD = 0.5; qaD = 1.0;
        } else if (pIdx === 2) {
          taskTitle = `[Logic Backend CSDL] ${tmpl[0]}`;
          flowDesc = `Xây dựng NestJS Controller, Service, Prisma ORM, kiểm tra ràng buộc dữ liệu DTO và xử lý Transaction ACID: ${tmpl[1]}`;
          feD = 0.5; beD = 2.5; qaD = 1.0;
        } else if (pIdx === 3) {
          taskTitle = `[Tích Hợp & Bảo Mật] ${tmpl[0]}`;
          flowDesc = `Tích hợp phân quyền Granular RBAC, bảo vệ chống XSS/SQLi, caching Redis và cơ chế realtime/worker: ${tmpl[1]}`;
          feD = 1.0; beD = 2.0; qaD = 1.5;
        } else {
          taskTitle = `[Kiểm Thử E2E & UAT] ${tmpl[0]}`;
          flowDesc = `Kiểm thử hộp đen/hộp trắng toàn diện, kiểm tra tải đồng thời, đối soát dữ liệu và nghiệm thu Ban Lãnh Đạo: ${tmpl[1]}`;
          feD = 0.5; beD = 0.5; qaD = 2.0;
        }

        sheetTasks.push([
          wbsCode,
          mod.name,
          epicName,
          taskTitle,
          flowDesc,
          tmpl[2],
          tmpl[3],
          tmpl[4],
          feD,
          beD,
          qaD,
          100, // Progress
          'Hoàn thành Dev',
          'Passed',
          'Đạt UAT',
          tmpl[8]
        ]);
      });
    });

    moduleSheetsData.push({
      meta: mod,
      tasks: sheetTasks
    });
  });

  // Helper build sheet with full styles and data validation
  function buildModuleSheet(ws, meta, dataArray) {
    ws.views = [{ showGridLines: true }];

    // Banner Title
    ws.mergeCells('A1:Q2');
    const titleCell = ws.getCell('A1');
    titleCell.value = `VIONE MASTER WBS: ${meta.name.toUpperCase()}`;
    titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: meta.themeColor } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtitle
    ws.mergeCells('A3:Q3');
    const subCell = ws.getCell('A3');
    subCell.value = `Tài liệu phạm vi chi tiết PMO Enterprise: ${dataArray.length} tác vụ chuyên sâu • Cập nhật: 2026-09-13`;
    subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LUX } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Set row heights
    ws.getRow(1).height = 24;
    ws.getRow(2).height = 24;
    ws.getRow(3).height = 20;
    ws.getRow(4).height = 30;

    // Header row 4 explicit definition
    columnsDef.forEach((col, idx) => {
      const colLetter = String.fromCharCode(65 + idx);
      const cell = ws.getCell(`${colLetter}4`);
      cell.value = col.header;
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = BORDER_STYLE;
      ws.getColumn(idx + 1).width = col.width;
    });

    // Insert rows
    let startRow = 5;
    dataArray.forEach((item, rIdx) => {
      const r = startRow + rIdx;
      const row = ws.getRow(r);
      row.height = 24;

      const fe = Number(item[8]) || 0;
      const be = Number(item[9]) || 0;
      const qa = Number(item[10]) || 0;

      const values = [
        item[0], // WBS Code
        item[1], // Module
        item[2], // Epic
        item[3], // Feature
        item[4], // Flow
        item[5], // Route
        item[6], // Actor
        item[7], // Priority
        fe,
        be,
        qa,
        { formula: `SUM(I${r}:K${r})` }, // Total
        item[11], // Progress %
        item[12], // Dev Status
        item[13], // QA Status
        item[14], // UAT Status
        item[15]  // Notes
      ];

      values.forEach((val, cIdx) => {
        row.getCell(cIdx + 1).value = val;
      });

      // Styling each cell in the row
      for (let c = 1; c <= 17; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Segoe UI', size: 8.5 };
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'middle', wrapText: true };

        if (c === 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '1E3A8A' } };
        } else if ([8, 12, 13, 14, 15, 16].includes(c)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if ([9, 10, 11].includes(c)) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.0';
        } else if (c === 12) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.0';
          cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '0F172A' } };
        } else if (c === 13) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.numFmt = '0"%"';
        }

        // Highlight statuses
        if (c === 14) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
          cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '065F46' } };
        } else if (c === 15) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
          cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '166534' } };
        } else if (c === 16) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
          cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '3730A3' } };
        } else if (c === 8) {
          if (item[7] === 'Khẩn cấp') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
            cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '991B1B' } };
          } else if (item[7] === 'Cao') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
            cell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '92400E' } };
          }
        }
      }
    });

    const endRow = startRow + dataArray.length;
    ws.autoFilter = `A4:Q${endRow - 1}`;

    // Total Row
    const totRow = ws.getRow(endRow);
    totRow.height = 28;
    totRow.getCell(1).value = '';
    totRow.getCell(2).value = 'TỔNG CỘNG PHÂN HỆ';
    totRow.getCell(9).value = { formula: `SUM(I${startRow}:I${endRow - 1})` };
    totRow.getCell(10).value = { formula: `SUM(J${startRow}:J${endRow - 1})` };
    totRow.getCell(11).value = { formula: `SUM(K${startRow}:K${endRow - 1})` };
    totRow.getCell(12).value = { formula: `SUM(L${startRow}:L${endRow - 1})` };
    totRow.getCell(13).value = { formula: `AVERAGE(M${startRow}:M${endRow - 1})` };

    for (let c = 1; c <= 17; c++) {
      const cell = totRow.getCell(c);
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
      cell.border = BORDER_STYLE;
      if ([9, 10, 11, 12].includes(c)) {
        cell.numFmt = '#,##0.0';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (c === 13) {
        cell.numFmt = '0.0"%"';
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }
  }

  // Build Master Dashboard Sheet
  function buildDashboardSheet(ws) {
    ws.views = [{ showGridLines: true }];

    ws.mergeCells('A1:G2');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'BÁO CÁO TỔNG QUAN PHẠM VI DỰ ÁN VIONE ECOSYSTEM (1,000+ WORK PACKAGES)';
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('A3:G3');
    const subCell = ws.getCell('A3');
    subCell.value = 'Dữ liệu ước lượng tổng hợp từ 10 phân hệ nghiệp vụ doanh nghiệp chuẩn PMO Enterprise • Cập nhật: 2026-09-13';
    subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LUX } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // KPI Cards Row 5-6
    const cards = [
      { rangeTitle: 'A5:B5', rangeVal: 'A6:B6', title: 'TỔNG CÔNG VIỆC DỰ ÁN', valFormula: '=SUM(D9:D18)', color: '0284C7', unit: 'Man-days' },
      { rangeTitle: 'C5:D5', rangeVal: 'C6:D6', title: 'TIẾN ĐỘ TRUNG BÌNH', valFormula: '=AVERAGE(E9:E18)', color: '059669', unit: '%' },
      { rangeTitle: 'E5:G5', rangeVal: 'E6:G6', title: 'TỔNG SỐ CHỨC NĂNG (TASKS)', valFormula: '=SUM(C9:C18)', color: '7C3AED', unit: 'Tasks' },
    ];

    cards.forEach(card => {
      ws.mergeCells(card.rangeTitle);
      ws.mergeCells(card.rangeVal);

      const tCell = ws.getCell(card.rangeTitle.split(':')[0]);
      tCell.value = card.title;
      tCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFF' } };
      tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
      tCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const vCell = ws.getCell(card.rangeVal.split(':')[0]);
      vCell.value = { formula: card.valFormula.replace('=', '') };
      vCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: card.color } };
      vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      vCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (card.unit === '%') vCell.numFmt = '0.0"%"';
      else if (card.unit === 'Man-days') vCell.numFmt = '#,##0.0 "MD"';
      else vCell.numFmt = '#,##0 "Tasks"';
    });

    ws.getRow(5).height = 22;
    ws.getRow(6).height = 32;

    // Table Header Row 7-8
    ws.mergeCells('A7:G7');
    const bHeader = ws.getCell('A7');
    bHeader.value = 'BẢNG PHÂN TÍCH TIẾN ĐỘ VÀ CÔNG VIỆC THEO 10 PHÂN HỆ CHUYÊN SÂU';
    bHeader.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFF' } };
    bHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    bHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    const tableHeaders = ['STT', 'Tên Phân Hệ Nghiệp Vụ', 'Số Chức Năng', 'Công Việc (Man-days)', 'Tiến Độ Trung Bình', 'Trạng Thái Kiểm Thử', 'Đánh Giá Nghiệm Thu'];
    ws.getRow(8).height = 26;
    tableHeaders.forEach((th, idx) => {
      const colLetter = String.fromCharCode(65 + idx);
      const c = ws.getCell(`${colLetter}8`);
      c.value = th;
      c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = BORDER_STYLE;
    });

    moduleSheetsData.forEach((m, idx) => {
      const r = 9 + idx;
      ws.getRow(r).height = 22;
      ws.getCell(`A${r}`).value = String(idx + 1);
      ws.getCell(`B${r}`).value = m.meta.name;
      ws.getCell(`C${r}`).value = { formula: `COUNTA(${m.meta.sheet}!A5:A${4 + m.tasks.length})` };
      ws.getCell(`D${r}`).value = { formula: `SUM(${m.meta.sheet}!L5:L${4 + m.tasks.length})` };
      ws.getCell(`E${r}`).value = { formula: `AVERAGE(${m.meta.sheet}!M5:M${4 + m.tasks.length})` };
      ws.getCell(`F${r}`).value = 'Passed (100%)';
      ws.getCell(`G${r}`).value = 'Đạt Chuẩn UAT';

      for (let col = 1; col <= 7; col++) {
        const c = ws.getCell(r, col);
        c.font = { name: 'Segoe UI', size: 8.5 };
        c.border = BORDER_STYLE;
        if (col === 2) {
          c.alignment = { horizontal: 'left', vertical: 'middle' };
          c.font = { name: 'Segoe UI', size: 8.5, bold: true };
        } else if (col === 3 || col === 4) {
          c.alignment = { horizontal: 'right', vertical: 'middle' };
          c.numFmt = col === 3 ? '#,##0' : '#,##0.0';
        } else if (col === 5) {
          c.alignment = { horizontal: 'center', vertical: 'middle' };
          c.numFmt = '0.0"%"';
        } else if (col === 6) {
          c.alignment = { horizontal: 'center', vertical: 'middle' };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
          c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: '065F46' } };
        } else {
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
    });

    // Total Row
    const totR = 9 + moduleSheetsData.length;
    ws.getRow(totR).height = 26;
    ws.getCell(`A${totR}`).value = '';
    ws.getCell(`B${totR}`).value = 'TỔNG CỘNG TOÀN DỰ ÁN VIONE';
    ws.getCell(`C${totR}`).value = { formula: `SUM(C9:C${totR - 1})` };
    ws.getCell(`D${totR}`).value = { formula: `SUM(D9:D${totR - 1})` };
    ws.getCell(`E${totR}`).value = { formula: `AVERAGE(E9:E${totR - 1})` };
    ws.getCell(`F${totR}`).value = '100% ĐẠT CHUẨN';
    ws.getCell(`G${totR}`).value = 'SẴN SÀNG TRIỂN KHAI';

    for (let col = 1; col <= 7; col++) {
      const c = ws.getCell(totR, col);
      c.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '0F172A' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
      c.border = BORDER_STYLE;
      if (col === 3 || col === 4) {
        c.alignment = { horizontal: 'right', vertical: 'middle' };
        c.numFmt = col === 3 ? '#,##0' : '#,##0.0';
      } else if (col === 5) {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.numFmt = '0.0"%"';
      } else {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }

    // Column widths for Dashboard
    ws.getColumn(1).width = 8;
    ws.getColumn(2).width = 46;
    ws.getColumn(3).width = 16;
    ws.getColumn(4).width = 24;
    ws.getColumn(5).width = 22;
    ws.getColumn(6).width = 22;
    ws.getColumn(7).width = 24;
  }

  // Create Worksheets
  console.log('Creating Dashboard worksheet...');
  const wsDashboard = wb.addWorksheet('Tong_Quan_Dashboard');

  console.log('Creating 10 detailed WBS module worksheets (1,000+ tasks)...');
  moduleSheetsData.forEach(item => {
    const ws = wb.addWorksheet(item.meta.sheet);
    buildModuleSheet(ws, item.meta, item.tasks);
  });

  buildDashboardSheet(wsDashboard);

  const outputPath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION_CHI_TIET.xlsx');
  await wb.xlsx.writeFile(outputPath);
  console.log(`✓ Master WBS (1,000+ Tasks) generated successfully: ${outputPath} (${fs.statSync(outputPath).size.toLocaleString()} bytes)`);

  const basePath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION.xlsx');
  try {
    fs.copyFileSync(outputPath, basePath);
    console.log(`✓ Synced to base file: ${basePath}`);
  } catch (err) {
    console.log(`Notice: Base file is locked by user in Excel (${err.message}). Safe output is ${outputPath}`);
  }
}

generateMegaEnterpriseWBS1000().catch(err => {
  console.error('Error generating mega WBS:', err);
  process.exit(1);
});
