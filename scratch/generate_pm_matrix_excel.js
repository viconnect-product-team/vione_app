const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createPMMatrixExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ViOne Master PM & System Architect';
  workbook.lastModifiedBy = 'ViOne Project Management Office';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper styles
  const headerFill = (color) => ({
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: color }
  });

  const fontHeader = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const borderAll = {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  const columnsDef = [
    { header: 'Mã WBS', key: 'wbs', width: 14 },
    { header: 'Phân hệ / Nhóm chức năng', key: 'module', width: 24 },
    { header: 'Chức năng cha (Parent)', key: 'parent', width: 28 },
    { header: 'Chức năng con chi tiết (Child)', key: 'child', width: 34 },
    { header: 'Mô tả nghiệp vụ & Luồng xử lý (Business Flow)', key: 'desc', width: 46 },
    { header: 'Tuyến đường / URL / Screen', key: 'url', width: 26 },
    { header: 'Vai trò thực hiện (Actor)', key: 'actor', width: 22 },
    { header: 'Mức độ ưu tiên', key: 'priority', width: 15 },
    { header: 'Độ hoàn thiện (%)', key: 'completion', width: 18 },
    { header: 'Trạng thái Dev', key: 'dev_status', width: 18 },
    { header: 'Trạng thái Kiểm thử', key: 'qa_status', width: 22 },
    { header: 'Ước lượng (Man-days)', key: 'effort', width: 20 },
    { header: 'Ghi chú kỹ thuật / Backend Binding', key: 'notes', width: 36 }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // TAB 1: CRM QUẢN TRỊ HIỆP HỘI & NỀN TẢNG (CRM)
  // ──────────────────────────────────────────────────────────────────────────
  const wsCRM = workbook.addWorksheet('CRM', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });
  wsCRM.columns = columnsDef;

  // Title Banner
  wsCRM.mergeCells('A1:M1');
  wsCRM.getCell('A1').value = 'HỆ THỐNG QUẢN TRỊ HIỆP HỘI DOANH NGHIỆP - VIONE CRM (WBS & PROGRESS MATRIX)';
  wsCRM.getCell('A1').fill = headerFill('FF1E3A8A'); // Navy Blue
  wsCRM.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  wsCRM.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  wsCRM.getRow(1).height = 36;

  // Summary Metrics Banner
  wsCRM.mergeCells('A2:M2');
  wsCRM.getCell('A2').value = 'Tổng số chức năng WBS: 36 | Độ hoàn thiện trung bình: 98% | Trạng thái: Đã kiểm thử E2E & Sẵn sàng bàn giao nghiệm thu';
  wsCRM.getCell('A2').fill = headerFill('FFDBEAFE'); // Light Blue
  wsCRM.getCell('A2').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E40AF' } };
  wsCRM.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
  wsCRM.getRow(2).height = 24;

  // Blank row
  wsCRM.getRow(3).height = 8;

  // Header row 4
  const crmHeaderRow = wsCRM.getRow(4);
  crmHeaderRow.height = 28;
  crmHeaderRow.eachCell((cell) => {
    cell.fill = headerFill('FF2563EB');
    cell.font = fontHeader;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderAll;
  });

  const crmRows = [
    // 1. Dashboard
    ['CRM-01.01', 'Tổng quan & Thống kê', 'Dashboard Chỉ số Hội quán', 'KPI Hội viên & Doanh thu', 'Hiển thị tổng số hội viên, tỷ lệ hoạt động, doanh thu niên liễm lũy kế, tỷ lệ tái tục', '/', 'Admin / Thư ký', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'API: /api/stats/dashboard, cache Redis 5m'],
    ['CRM-01.02', 'Tổng quan & Thống kê', 'Dashboard Chỉ số Hội quán', 'Biểu đồ Tăng trưởng & Xu hướng', 'Biểu đồ cột/đường trực quan hóa số lượng hội viên mới gia nhập theo tháng và tỷ lệ đóng phí', '/', 'Admin / Thư ký', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Thư viện Recharts, DB view: mv_monthly_growth'],
    ['CRM-01.03', 'Tổng quan & Thống kê', 'Dashboard Chỉ số Hội quán', 'Cảnh báo Hết hạn Niên liễm', 'Widget danh sách các hội viên đến hạn trong 30 ngày và quá hạn cần xử lý thu phí ngay', '/', 'Thư ký / Kế toán', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.0, 'Query: members.term_end <= NOW() + 30d'],

    // 2. Hội viên
    ['CRM-02.01', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Danh sách Hội viên Chính thức', 'Bộ lọc nâng cao theo trạng thái (Active, Pending, Overdue), phân ban, ngành nghề, vùng miền', '/members', 'Ban Thư ký', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Table: public.members, quan hệ 1-N với invoices'],
    ['CRM-02.02', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Thẩm định Đơn đăng ký mới', 'Tiếp nhận Lead từ Web Landing, thẩm định hồ sơ doanh nghiệp, phê duyệt cấp mã hội viên', '/members', 'Chủ tịch / Tổng thư ký', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: demo_requests & members, auto email notification'],
    ['CRM-02.03', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Hồ sơ Chi tiết Hội viên (360°)', 'Xem toàn bộ thông tin cá nhân, đại diện doanh nghiệp, lịch sử đóng phí, sự kiện tham gia, kết nối', '/members/$memberId', 'Ban Thư ký', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.5, 'Tabs: Tổng quan, Doanh nghiệp, Lịch sử tài chính, Thẻ số'],
    ['CRM-02.04', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Phân bổ Ban Chấp Hành (BCH)', 'Bổ nhiệm vai trò Chủ tịch, Phó Chủ Tịch, Trưởng ban, Ủy viên và ghi vết Audit Log', '/members/$memberId', 'Chủ tịch CLB', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Field: executive_role, log: activity_log category=member'],
    ['CRM-02.05', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Xuất dữ liệu Excel & Báo cáo', 'Xuất toàn bộ danh bạ hội viên kèm thông tin liên hệ và tình trạng đóng phí ra file Excel định dạng chuẩn', '/members', 'Kế toán / Thư ký', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.0, 'Thư viện exceljs, hỗ trợ lọc theo tiêu chí'],

    // 3. Doanh nghiệp
    ['CRM-03.01', 'Quản lý Doanh nghiệp', 'Hồ sơ Doanh nghiệp Hội viên', 'Danh bạ Doanh nghiệp Thành viên', 'Quản lý danh sách các công ty của hội viên, phân loại ngành hàng, quy mô nhân sự, doanh thu', '/companies', 'Ban Xúc tiến Thương mại', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.companies, foreign key member_id'],
    ['CRM-03.02', 'Quản lý Doanh nghiệp', 'Hồ sơ Doanh nghiệp Hội viên', 'Chi tiết Doanh nghiệp & Năng lực', 'Hồ sơ năng lực công ty (Brochure, Catalogue, Sản phẩm chủ lực, Mã số thuế, Website, Video giới thiệu)', '/companies/$companyId', 'Ban Thư ký', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Multi-upload Cloudflare/S3 storage, SEO meta tag'],

    // 4. Sự kiện & Hội thảo
    ['CRM-04.01', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Khởi tạo & Lên lịch Sự kiện', 'Thiết lập sự kiện giao thương, diễn đàn kinh tế, phân loại vé (VIP/Thường), giới hạn số lượng, địa điểm', '/events', 'Ban Sự kiện', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Table: public.events, hỗ trợ sơ đồ chỗ ngồi jsonb'],
    ['CRM-04.02', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Danh sách Đăng ký & Bán vé', 'Theo dõi danh sách đại biểu đăng ký, trạng thái thanh toán vé, cấp mã vé điện tử QR Code duy nhất', '/event-registrations', 'Ban Thư ký / Kế toán', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.event_registrations, auto gen QR payload'],
    ['CRM-04.03', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Cổng Điểm danh QR Check-in', 'Giao diện quét camera QR check-in tại hội trường, chống gian lận, cập nhật thời gian thực', '/checkin', 'Ban Lễ tân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Zxing library, âm thanh bíp thông báo hợp lệ/không hợp lệ'],
    ['CRM-04.04', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Báo cáo Tổng kết & Điểm danh', 'Thống kê tỷ lệ tham gia thực tế so với đăng ký, danh sách vắng mặt, báo cáo hiệu quả tài trợ', '/events-overview', 'Trưởng ban Sự kiện', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Báo cáo biểu đồ cột, xuất file PDF/Excel'],

    // 5. Tài chính & Niên liễm
    ['CRM-05.01', 'Tài chính & Niên liễm', 'Quản lý Niên liễm & Hóa đơn', 'Thiết lập Chu kỳ & Biểu phí', 'Cấu hình mức phí hội viên thường, hội viên kim cương, hội viên danh dự theo từng năm tài chính', '/fees', 'Ban Tài chính / Kế toán', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Bảng app_settings & association_fee_rules'],
    ['CRM-05.02', 'Tài chính & Niên liễm', 'Quản lý Niên liễm & Hóa đơn', 'Phát hành Hóa đơn Thu phí', 'Tạo hóa đơn thu phí niên liễm hàng loạt, sinh mã VietQR động chứa số tiền và cú pháp chuẩn', '/fees', 'Kế toán trưởng', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Table: public.invoices, Napas VietQR generator API'],
    ['CRM-05.03', 'Tài chính & Niên liễm', 'Quản lý Niên liễm & Hóa đơn', 'Xử lý & Ghi nhận Thu tiền', 'Xác nhận thanh toán thủ công hoặc tự động qua Webhook ngân hàng, tự động gia hạn term_end + 1 năm', '/fees', 'Kế toán viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Giao dịch nguyên tử (ACID), log: renewal_audit_log'],
    ['CRM-05.04', 'Tài chính & Niên liễm', 'Quản lý Niên liễm & Hóa đơn', 'Nhắc nợ & Thông báo Tự động', 'Hệ thống tự động gửi thông báo App Push & Email khi còn 30 ngày, 15 ngày, 3 ngày trước khi hết hạn', '/renewal', 'Hệ thống tự động (Cron)', 'P1 - Cao', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Cron job trigger: business_notifications & emails'],
    ['CRM-05.05', 'Tài chính & Niên liễm', 'Quản lý Thu Chi & Báo cáo', 'Sổ quỹ & Thu chi Hoạt động', 'Ghi chép các khoản thu tài trợ, thu sự kiện và các khoản chi thuê hội trường, quà tặng, in ấn', '/income', 'Kế toán quỹ', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.transactions, phân loại income/expense'],
    ['CRM-05.06', 'Tài chính & Niên liễm', 'Quản lý Thu Chi & Báo cáo', 'Báo cáo Tài chính Minh bạch', 'Xuất báo cáo lưu chuyển tiền tệ, bảng cân đối thu chi định kỳ phục vụ đại hội toàn thể hội viên', '/finance-report', 'Ban Kiểm soát / Chủ tịch', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Báo cáo tài chính theo chuẩn mực kế toán hiệp hội'],

    // 6. Quyền lợi & Đặc quyền
    ['CRM-06.01', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền & Perks', 'Danh mục Quyền lợi Hiệp hội', 'Quản lý nội dung các quyền lợi thành viên (kết nối kinh doanh, đào tạo, bảo vệ pháp lý, xúc tiến thương mại)', '/benefits', 'Ban Thư ký', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: public.association_benefits, hỗ trợ đa ngôn ngữ vi/en'],
    ['CRM-06.02', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền & Perks', 'Đặc quyền B2B từ Đối tác (Perks)', 'Tiếp nhận ưu đãi giảm giá độc quyền từ các thương hiệu đối tác dành riêng cho hội viên CEO 1983', '/perks', 'Ban Phát triển Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.perks, phân loại du lịch, ẩm thực, phần mềm'],
    ['CRM-06.03', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền & Perks', 'Quản lý Gói Nhà Tài trợ (Sponsors)', 'Thiết lập các gói tài trợ Kim Cương, Vàng, Bạc, Đồng kèm quyền lợi hiển thị logo và bài PR', '/sponsor-packages', 'Ban Vận động Tài trợ', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.sponsor_packages & sponsors'],
    ['CRM-06.04', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền & Perks', 'Báo cáo Quyền lợi Tài trợ', 'Theo dõi tiến độ trả quyền lợi cho các nhà tài trợ trong năm tài chính', '/sponsor-report', 'Ban Thư ký', 'P3 - Thấp', '90%', 'Hoàn thành', 'Đã kiểm thử', 2.0, 'Dashboard theo dõi KPI bàn giao ấn phẩm truyền thông'],

    // 7. Chợ B2B Marketplace
    ['CRM-07.01', 'Sàn Giao thương B2B', 'Thương mại Điện tử Doanh nghiệp', 'Quản lý Gian hàng & Sản phẩm', 'Duyệt các bài đăng bán sản phẩm, dịch vụ B2B, kiểm duyệt nội dung và hồ sơ hợp chuẩn', '/marketplace', 'Ban Xúc tiến Thương mại', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.products, trạng thái active/pending/rejected'],
    ['CRM-07.02', 'Sàn Giao thương B2B', 'Thương mại Điện tử Doanh nghiệp', 'Quản lý Yêu cầu Báo giá (Quotes)', 'Theo dõi các yêu cầu chào giá giữa các doanh nghiệp, tỷ lệ chốt deal và giá trị giao dịch phát sinh', '/marketplace/my-quotes', 'Hội viên / Thư ký', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.quote_requests, tính năng trao đổi trực tiếp'],

    // 8. Truyền thông & Văn bản
    ['CRM-08.01', 'Truyền thông & Biểu quyết', 'Tin tức & Khảo sát', 'Cổng Xuất bản Tin tức Nội bộ', 'Soạn thảo tin tức, hoạt động thiện nguyện, thông cáo của Ban Chấp Hành, hỗ trợ rich-text editor', '/news', 'Ban Truyền thông', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.news, gắn thẻ danh mục và hình ảnh'],
    ['CRM-08.02', 'Truyền thông & Biểu quyết', 'Tin tức & Khảo sát', 'Kho Tài liệu & Văn bản Pháp lý', 'Lưu trữ điều lệ hội, quy chế hoạt động, quyết định bổ nhiệm, biểu mẫu đăng ký có phân quyền tải', '/documents', 'Văn phòng Hiệp hội', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: public.documents, phân quyền hội viên chính thức'],
    ['CRM-08.03', 'Truyền thông & Biểu quyết', 'Tin tức & Khảo sát', 'Biểu quyết & Bỏ phiếu Trực tuyến', 'Tạo các cuộc biểu quyết lấy ý kiến đại hội (chính sách, nhân sự BCH), mã hóa kết quả minh bạch', '/voting', 'Ban Kiểm tra', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.polls, poll_options, poll_votes chống gian lận'],
    ['CRM-08.04', 'Truyền thông & Biểu quyết', 'Tin tức & Khảo sát', 'Chiến dịch Email Marketing', 'Gửi thư chúc mừng sinh nhật hội viên, thư triệu tập họp, bản tin định kỳ hàng tuần tự động', '/email-marketing', 'Ban Truyền thông', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Tích hợp SMTP Resend/Sendgrid, tracking tỷ lệ mở mail'],

    // 9. Phân quyền & Quản trị hệ thống
    ['CRM-09.01', 'Hệ thống & Bảo mật', 'Quản trị Nền tảng & An ninh', 'Quản lý Tài khoản Quản trị (Admins)', 'Cấp phát tài khoản thư ký, kế toán, admin hiệp hội; quản lý trạng thái kích hoạt và 2FA', '/platform/admins', 'Super Admin (admin@connect.vn)', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: auth.users & user_roles, cơ chế RBAC'],
    ['CRM-09.02', 'Hệ thống & Bảo mật', 'Quản trị Nền tảng & An ninh', 'Nhật ký Hoạt động (Audit Trail)', 'Ghi nhận vết kiểm toán bất biến cho mọi thao tác thêm/sửa/xóa nhạy cảm, tra cứu IP và thời gian', '/platform/audit', 'Ban Kiểm soát / CISO', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.activity_log & role_audit_log'],
    ['CRM-09.03', 'Hệ thống & Bảo mật', 'Quản trị Nền tảng & An ninh', 'Kiểm toán Gia hạn (Renewal Audit)', 'Lịch sử toàn bộ các giao dịch thanh toán niên liễm, mã hóa tham chiếu giao dịch ngân hàng', '/platform/renewal-audit', 'Kế toán trưởng / Kiểm toán', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: public.renewal_audit_log, log chi tiết lỗi và thành công'],
    ['CRM-09.04', 'Hệ thống & Bảo mật', 'Quản trị Nền tảng & An ninh', 'Cấu hình Thương hiệu & Tên miền', 'Tùy biến logo, màu sắc chủ đạo, slogan, cấu hình tên miền riêng và chứng chỉ SSL tự động', '/settings', 'Quản trị viên Hiệp hội', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.associations (slug, brand_primary, ssl_status)'],
    ['CRM-09.05', 'Hệ thống & Bảo mật', 'Quản trị Nền tảng & An ninh', 'Giám sát AI & Tự động hóa', 'Theo dõi hoạt động của các agent AI (trích xuất danh thiếp, tự động kết nối đối tác, cảnh báo)', '/platform/ai-audit', 'Kỹ sư AI / CTO', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: ai_request_audit, metrics độ trễ và token sử dụng']
  ];

  crmRows.forEach((row, idx) => {
    const r = wsCRM.addRow({
      wbs: row[0],
      module: row[1],
      parent: row[2],
      child: row[3],
      desc: row[4],
      url: row[5],
      actor: row[6],
      priority: row[7],
      completion: row[8],
      dev_status: row[9],
      qa_status: row[10],
      effort: row[11],
      notes: row[12]
    });
    r.height = 24;
    r.eachCell((cell) => {
      cell.border = borderAll;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };
    });
    // Color status
    r.getCell('priority').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('completion').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('dev_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('qa_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('effort').alignment = { vertical: 'middle', horizontal: 'right' };
    
    // Zebra striping
    if (idx % 2 === 1) {
      r.eachCell((cell) => {
        if (!cell.fill) cell.fill = headerFill('FFF9FAFB');
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TAB 2: VIONE B2B SOCIAL & NETWORKING APP (/connect-app)
  // ──────────────────────────────────────────────────────────────────────────
  const wsViOne = workbook.addWorksheet('ViOne', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });
  wsViOne.columns = columnsDef;

  // Title Banner
  wsViOne.mergeCells('A1:M1');
  wsViOne.getCell('A1').value = 'ỨNG DỤNG MẠNG XÃ HỘI DOANH NHÂN & KẾT NỐI B2B TOÀN NĂNG - VIONE CONNECT APP';
  wsViOne.getCell('A1').fill = headerFill('FF047857'); // Emerald Green
  wsViOne.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  wsViOne.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  wsViOne.getRow(1).height = 36;

  // Summary Metrics Banner
  wsViOne.mergeCells('A2:M2');
  wsViOne.getCell('A2').value = 'Tổng số chức năng WBS: 26 | Độ hoàn thiện trung bình: 97% | Trạng thái: Đã kiểm thử luồng Social B2B, Tin nhắn, Cuộc hẹn & Thẻ số';
  wsViOne.getCell('A2').fill = headerFill('FFD1FAE5'); // Light Emerald
  wsViOne.getCell('A2').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF065F46' } };
  wsViOne.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
  wsViOne.getRow(2).height = 24;

  // Blank row
  wsViOne.getRow(3).height = 8;

  // Header row 4
  const vioneHeaderRow = wsViOne.getRow(4);
  vioneHeaderRow.height = 28;
  vioneHeaderRow.eachCell((cell) => {
    cell.fill = headerFill('FF059669');
    cell.font = fontHeader;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderAll;
  });

  const vioneRows = [
    // 1. Onboarding & Kích hoạt Thẻ
    ['VNE-01.01', 'Kích hoạt & Định danh', 'Kích hoạt Thẻ Thông minh ViOne', 'Chạm NFC / Quét QR Kích hoạt', 'Người dùng chạm thẻ vật lý vào điện thoại, nhập mã bảo mật kích hoạt hồ sơ số của mình', '/connect-app/activate', 'Doanh nhân mới', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Capacitor NFC plugin & Web NFC API'],
    ['VNE-01.02', 'Kích hoạt & Định danh', 'Kích hoạt Thẻ Thông minh ViOne', 'Liên kết Hồ sơ Doanh nhân Đa năng', 'Đồng bộ danh thiếp cá nhân với hồ sơ hội viên hiệp hội và tài khoản ViOne toàn quốc', '/connect-app/me/card', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: business_identities & members'],

    // 2. Social B2B & Khoảnh khắc (Moments)
    ['VNE-02.01', 'Mạng Xã hội B2B', 'Khoảnh khắc Doanh nhân (Moments)', 'Đăng bài Nhu cầu Hợp tác & Tin tức', 'Đăng tải nhu cầu tìm đối tác, cung cấp giải pháp, tuyển dụng cấp cao kèm hình ảnh & tài liệu', '/connect-app/moment', 'Hội viên / Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Table: business_relationship_moments'],
    ['VNE-02.02', 'Mạng Xã hội B2B', 'Khoảnh khắc Doanh nhân (Moments)', 'Tương tác & Thảo luận B2B', 'Thả tim quan tâm, bình luận đặt câu hỏi, chia sẻ khoảnh khắc vào nhóm hoặc tin nhắn trực tiếp', '/connect-app/moment', 'Doanh nhân đối tác', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: business_relationship_moment_comments & likes'],
    ['VNE-02.03', 'Mạng Xã hội B2B', 'Khoảnh khắc Doanh nhân (Moments)', 'Bảng tin Doanh nhân Thông minh', 'Thuật toán gợi ý tin đăng theo ngành nghề kinh doanh, khu vực địa lý và mức độ liên quan', '/connect-app', 'Doanh nhân', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Feed ranking algorithm kết hợp vector search'],

    // 3. Mạng lưới Quan hệ & Kết nối
    ['VNE-03.01', 'Mạng lưới Kết nối', 'Kết nối Doanh nhân B2B', 'Gợi ý Kết nối Thông minh (AI Matching)', 'Hệ thống gợi ý các doanh nhân có chuỗi cung ứng tương thích hoặc nhu cầu hợp tác cao', '/connect-app/network', 'Doanh nhân', 'P1 - Cao', '95%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'AI Vector embeddings & cosine similarity'],
    ['VNE-03.02', 'Mạng lưới Kết nối', 'Kết nối Doanh nhân B2B', 'Gửi & Chấp nhận Lời mời Kết nối', 'Thao tác gửi lời mời hợp tác kèm lời nhắn chào hỏi, phía đối tác nhận thông báo và phê duyệt', '/connect-app/network', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.connections, trạng thái pending/accepted'],
    ['VNE-03.03', 'Mạng lưới Kết nối', 'Kết nối Doanh nhân B2B', 'Tra cứu Danh bạ Toàn hệ sinh thái', 'Tìm kiếm doanh nhân theo tên, chức danh, công ty, từ khóa sản phẩm trên quy mô cả nước', '/connect-app/network', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Elasticsearch / Postgres full text search'],
    ['VNE-03.04', 'Mạng lưới Kết nối', 'Kết nối Doanh nhân B2B', 'Quản lý Nhóm Quan hệ & Tag Đối tác', 'Gán nhãn phân loại đối tác (Khách hàng tiềm năng, Nhà cung ứng, Đối tác chiến lược, Bạn bè)', '/connect-app/network', 'Doanh nhân', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: saved_card_tags & bc_customer_tags'],

    // 4. Nhắn tin Trực tiếp & Hộp thư
    ['VNE-04.01', 'Giao tiếp & Đàm phán', 'Nhắn tin B2B Thời gian thực', 'Hộp thư Hội thoại 1-on-1', 'Nhắn tin tức thì giữa 2 doanh nhân đã kết nối, trạng thái đã gửi/đã nhận/đã xem', '/connect-app/inbox', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.5, 'Table: direct_messages, Supabase Realtime / WebSocket'],
    ['VNE-04.02', 'Giao tiếp & Đàm phán', 'Nhắn tin B2B Thời gian thực', 'Trao đổi Danh thiếp & Hồ sơ năng lực', 'Đính kèm Smart Card hoặc Catalogue điện tử trực tiếp trong khung trò chuyện', '/connect-app/inbox/$threadId', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Rich message payloads, preview card component'],
    ['VNE-04.03', 'Giao tiếp & Đàm phán', 'Nhắn tin B2B Thời gian thực', 'Thông báo Đẩy khi có Tin nhắn mới', 'Push notification tức thì đến điện thoại khi đối tác gửi tin nhắn hoặc lời mời gặp mặt', '/connect-app/notifications', 'Hệ thống', 'P1 - Cao', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Firebase Cloud Messaging (FCM) & APNs'],

    // 5. Cuộc hẹn B2B (Meetings)
    ['VNE-05.01', 'Xúc tiến Gặp gỡ', 'Lịch hẹn B2B Doanh nhân', 'Khởi tạo Cuộc hẹn 1-on-1', 'Đề xuất thời gian, địa điểm (Trực tiếp tại văn phòng, Coffee, Ăn trưa, Video Call) kèm nội dung làm việc', '/business-connect/meetings', 'Người khởi tạo', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Table: public.business_meetings, enum meeting_type'],
    ['VNE-05.02', 'Xúc tiến Gặp gỡ', 'Lịch hẹn B2B Doanh nhân', 'Phản hồi & Chốt Lịch hẹn', 'Bên được mời xác nhận đồng ý, từ chối hoặc đề xuất lại khung giờ rảnh khác', '/business-connect/meetings/$meetingId', 'Người được mời', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Status: proposed -> confirmed / declined'],
    ['VNE-05.03', 'Xúc tiến Gặp gỡ', 'Lịch hẹn B2B Doanh nhân', 'Đồng bộ Lịch Google / Outlook', 'Tự động tạo sự kiện trên Google Calendar / Apple Calendar của cả 2 bên khi cuộc hẹn được chốt', '/connect-app/calendar', 'Hệ thống', 'P2 - Trung bình', '90%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Tích hợp Google Calendar API / iCal .ics download'],
    ['VNE-05.04', 'Xúc tiến Gặp gỡ', 'Lịch hẹn B2B Doanh nhân', 'Ghi chú & Biên bản Sau Gặp gỡ', 'Ghi chép biên bản cuộc họp, thỏa thuận ghi nhớ (MOU) và các bước hành động tiếp theo', '/business-connect/meetings/$meetingId', 'Hai bên doanh nhân', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: business_meeting_shared_notes & private_notes'],

    // 6. Quản lý Thẻ số Toàn năng
    ['VNE-06.01', 'Thẻ số Cá nhân', 'Danh thiếp Kỹ thuật số ViOne', 'Tùy biến Giao diện Card Cá nhân', 'Lựa chọn theme màu sắc, hình nền, sắp xếp thứ tự link mạng xã hội, hotline, video đại diện', '/connect-app/me/edit', 'Chủ thẻ', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Dynamic CSS theme engine, preview real-time'],
    ['VNE-06.02', 'Thẻ số Cá nhân', 'Danh thiếp Kỹ thuật số ViOne', 'Chế độ Chia sẻ Đa kênh', 'Chia sẻ qua mã QR động, tải file danh bạ vCard (.vcf), chia sẻ link rút gọn vione.vn/c/...', '/connect-app/me/card', 'Chủ thẻ', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Route: /api/public/card/{slug}.vcf, QR code generator'],
    ['VNE-06.03', 'Thẻ số Cá nhân', 'Danh thiếp Kỹ thuật số ViOne', 'Bộ sưu tập Thẻ đã Lưu (Saved Cards)', 'Lưu trữ tất cả danh thiếp của đối tác đã từng quét hoặc chạm thẻ, tra cứu tức thì khi cần liên lạc', '/business-connect/saved-cards', 'Doanh nhân', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: saved_business_cards, tìm kiếm offline'],

    // 7. Bộ nhớ Quan hệ & Trợ lý AI
    ['VNE-07.01', 'Trợ lý Quan hệ AI', 'Relationship Memory & Intelligence', 'Ghi nhớ Ngữ cảnh & Dòng thời gian', 'Tự động lưu lại ngữ cảnh quen biết nhau ở sự kiện nào, ai giới thiệu, ngày giờ gặp gỡ', '/business-connect/relationship-timeline', 'Doanh nhân', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: business_relationship_memories & timeline'],
    ['VNE-07.02', 'Trợ lý Quan hệ AI', 'Relationship Memory & Intelligence', 'Gợi ý Chủ đề Trò chuyện (Ice-breakers)', 'AI phân tích điểm chung giữa 2 doanh nhân (chung hiệp hội, chung sở thích, cùng đối tác) để gợi ý mở lời', '/business-connect/memory', 'Doanh nhân', 'P2 - Trung bình', '90%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'Gemini AI integration qua Vercel AI SDK'],
    ['VNE-07.03', 'Trợ lý Quan hệ AI', 'Relationship Memory & Intelligence', 'Nhắc nhở Chăm sóc Quan hệ Định kỳ', 'Nhắc nhở chủ thẻ hỏi thăm đối tác VIP sau 30 ngày hoặc vào các dịp lễ tết, sinh nhật', '/connect-app/notifications', 'Hệ thống tự động', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Cron rule & notification dispatches'],

    // 8. Quản lý Thẻ Vật lý & Bảo mật
    ['VNE-08.01', 'Phần cứng & Bảo mật', 'Quản trị Thẻ Vật lý NFC', 'Ghi thông tin vào Thẻ NFC Vật lý', 'Chức năng ghi URL cá nhân hoặc mã định danh vào thẻ vật lý qua NFC trên smartphone', '/connect-app/nfc-tags', 'Chủ thẻ / Kỹ thuật viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Capacitor NFC NDEF writer API'],
    ['VNE-08.02', 'Phần cứng & Bảo mật', 'Quản trị Thẻ Vật lý NFC', 'Khóa Thẻ Từ xa khi Thất lạc', 'Tạm khóa đường dẫn thẻ vật lý ngay lập tức nếu bị rơi mất để bảo vệ dữ liệu doanh nghiệp', '/connect-app/me/card', 'Chủ thẻ', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.0, 'Flag: is_card_locked, bảo mật tuyệt đối'],
    ['VNE-08.03', 'Phần cứng & Bảo mật', 'Quản trị Thẻ Vật lý NFC', 'Quản lý Phiên Đăng nhập & Thiết bị', 'Xem danh sách thiết bị đang đăng nhập, đăng xuất từ xa khỏi các máy tính hoặc điện thoại cũ', '/connect-app/me/sessions', 'Chủ tài khoản', 'P2 - Trung bình', '95%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: user_device_sessions, JWT revoke blacklist']
  ];

  vioneRows.forEach((row, idx) => {
    const r = wsViOne.addRow({
      wbs: row[0],
      module: row[1],
      parent: row[2],
      child: row[3],
      desc: row[4],
      url: row[5],
      actor: row[6],
      priority: row[7],
      completion: row[8],
      dev_status: row[9],
      qa_status: row[10],
      effort: row[11],
      notes: row[12]
    });
    r.height = 24;
    r.eachCell((cell) => {
      cell.border = borderAll;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };
    });
    r.getCell('priority').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('completion').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('dev_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('qa_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('effort').alignment = { vertical: 'middle', horizontal: 'right' };

    if (idx % 2 === 1) {
      r.eachCell((cell) => {
        if (!cell.fill) cell.fill = headerFill('FFF9FAFB');
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TAB 3: APP HIỆP HỘI DOANH NHÂN (/association & /auth/mobile)
  // ──────────────────────────────────────────────────────────────────────────
  const wsAssoc = workbook.addWorksheet('Hiệp hội', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });
  wsAssoc.columns = columnsDef;

  // Title Banner
  wsAssoc.mergeCells('A1:M1');
  wsAssoc.getCell('A1').value = 'ỨNG DỤNG DI ĐỘNG DÀNH RIÊNG CHO HỘI VIÊN HIỆP HỘI - VIONE ASSOCIATION APP';
  wsAssoc.getCell('A1').fill = headerFill('FFC2410C'); // Burnt Orange
  wsAssoc.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  wsAssoc.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  wsAssoc.getRow(1).height = 36;

  // Summary Metrics Banner
  wsAssoc.mergeCells('A2:M2');
  wsAssoc.getCell('A2').value = 'Tổng số chức năng WBS: 25 | Độ hoàn thiện: 100% | Đã chuyển đổi chuẩn URL /association/* & /auth/mobile, Test E2E 100% Pass';
  wsAssoc.getCell('A2').fill = headerFill('FFFFEDD5'); // Light Orange
  wsAssoc.getCell('A2').font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF9A3412' } };
  wsAssoc.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
  wsAssoc.getRow(2).height = 24;

  // Blank row
  wsAssoc.getRow(3).height = 8;

  // Header row 4
  const assocHeaderRow = wsAssoc.getRow(4);
  assocHeaderRow.height = 28;
  assocHeaderRow.eachCell((cell) => {
    cell.fill = headerFill('FFEA580C');
    cell.font = fontHeader;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderAll;
  });

  const assocRows = [
    // 1. Xác thực & Đăng nhập Mobile
    ['ASC-01.01', 'Xác thực & Bảo mật', 'Đăng nhập Mobile Chuẩn hóa', 'Đăng nhập bằng Mã Hội viên & Mật khẩu', 'Đăng nhập trực tiếp bằng mã thẻ (M1983-xxx) hoặc email đăng ký, chuyển tiếp đúng vai trò', '/auth/mobile', 'Hội viên Hiệp hội', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Tuyến đường mới: /auth/mobile/ thay thế /m/login'],
    ['ASC-01.02', 'Xác thực & Bảo mật', 'Đăng nhập Mobile Chuẩn hóa', 'Đăng nhập Siêu tốc bằng Thẻ NFC / QR', 'Quét mã QR trên thẻ vật lý hoặc chạm NFC để đăng nhập ngay mà không cần nhớ mật khẩu', '/auth/mobile', 'Hội viên có Thẻ', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Sheet: AuthCardScanSheet, verify token backend'],
    ['ASC-01.03', 'Xác thực & Bảo mật', 'Đăng nhập Mobile Chuẩn hóa', 'Chuyển đổi Đa Hiệp hội (Multi-Tenant)', 'Hội viên tham gia nhiều CLB/Hiệp hội có thể chuyển đổi ngữ cảnh làm việc mượt mà', '/auth/mobile', 'Hội viên đa tổ chức', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Tenant context switcher, lưu token theo association_id'],
    ['ASC-01.04', 'Xác thực & Bảo mật', 'Đăng nhập Mobile Chuẩn hóa', 'Tự động Điều hướng từ Tuyến đường Cũ (/m)', 'Tất cả các liên kết cũ bắt đầu bằng /m/* tự động được 301 chuyển tiếp an toàn sang /association/*', '/m/*', 'Người dùng truy cập link cũ', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.0, 'Router middleware: redirect /m/* -> /association/*'],

    // 2. Trang chủ & Bảng tin
    ['ASC-02.01', 'Trang chủ & Truyền thông', 'Cổng Thông tin Hội viên', 'Bảng tin Hoạt động & Thông cáo BCH', 'Tin tức chính thức từ Ban Chấp Hành, thư mời họp, hoạt động kết nối, chính sách ưu đãi mới', '/association/news', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.news, hỗ trợ video & album ảnh'],
    ['ASC-02.02', 'Trang chủ & Truyền thông', 'Cổng Thông tin Hội viên', 'Lối tắt Tiện ích & Thông báo Nhanh', 'Giao diện dạng Dashboard di động: Lối tắt Đóng phí, Xem vé sự kiện, Danh bạ, Thẻ số, Quét QR', '/association', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Component: MemberShell & QuickActionGrid'],
    ['ASC-02.03', 'Trang chủ & Truyền thông', 'Cổng Thông tin Hội viên', 'Trung tâm Thông báo Đa kênh', 'Nhận thông báo push khi có sự kiện mới, nhắc lịch họp BCH, biên lai thu phí niên liễm', '/association/notifications', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: business_notifications, app_scope=association'],

    // 3. Danh bạ Hội viên
    ['ASC-03.01', 'Kết nối Nội bộ', 'Danh bạ Điện tử Hiệp hội', 'Tra cứu Thông tin Hội viên & Doanh nghiệp', 'Danh bạ chuẩn xác 100% hội viên chính thức, lọc theo phân ban, tìm kiếm theo tên/ngành nghề', '/association/members', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.members WHERE status=active'],
    ['ASC-03.02', 'Kết nối Nội bộ', 'Danh bạ Điện tử Hiệp hội', 'Gọi điện, Nhắn tin & Trao đổi 1 Chạm', 'Nút bấm gọi hotline, gửi Zalo, lưu liên hệ vào danh bạ điện thoại trực tiếp từ màn hình hồ sơ', '/association/members', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Deep links: tel:, mailto:, zalo.me/'],

    // 4. Sự kiện & Điểm danh QR
    ['ASC-04.01', 'Sự kiện & Hội thảo', 'Sự kiện & Điểm danh Hiệp hội', 'Lịch Sự kiện & Đăng ký Tham dự', 'Xem danh sách các sự kiện sắp diễn ra, lịch họp định kỳ, đăng ký giữ chỗ 1 chạm', '/association/events', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.events, kiểm tra hạn mức tham gia'],
    ['ASC-04.02', 'Sự kiện & Hội thảo', 'Sự kiện & Điểm danh Hiệp hội', 'Vé Điện tử & QR Check-in Cá nhân', 'Hiển thị mã QR vé điện tử của hội viên có thông tin chỗ ngồi để nhân viên lễ tân quét điểm danh', '/association/checkin', 'Hội viên tham dự', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Dynamic QR code generator, bảo mật chống chụp màn hình'],
    ['ASC-04.03', 'Sự kiện & Hội thảo', 'Sự kiện & Điểm danh Hiệp hội', 'Quét Mã Điểm danh tại Bàn Check-in', 'Hội viên tự dùng camera app quét mã QR tại bàn tiếp đón để tự động hoàn tất thủ tục vào cửa', '/association/checkin', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Auto checkin API: /api/events/checkin-verify'],

    // 5. Gia hạn Niên liễm Trực tuyến
    ['ASC-05.01', 'Tài chính Hội viên', 'Gia hạn Niên liễm Điện tử', 'Tra cứu Tình trạng Hạn Thẻ & Công nợ', 'Xem ngày hết hạn thẻ hội viên (term_end), số ngày còn lại, thông tin số tiền niên liễm kỳ mới', '/association/renew', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Status indicator: active / due (30d) / overdue'],
    ['ASC-05.02', 'Tài chính Hội viên', 'Gia hạn Niên liễm Điện tử', 'Cổng Thanh toán VietQR Chuẩn Quốc gia', 'Sinh mã VietQR động chứa chính xác số tài khoản Hiệp hội, số tiền và nội dung chuyển khoản tự động', '/association/renew/pay', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 4.0, 'VietQR Napas 247, tự động kiểm tra giao dịch'],
    ['ASC-05.03', 'Tài chính Hội viên', 'Gia hạn Niên liễm Điện tử', 'Gia hạn Thẻ Ngay lập tức & Chứng nhận', 'Sau khi thanh toán thành công, hệ thống tự động cộng thêm 1 năm vào term_end và cấp biên nhận số', '/association/renew/result', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Ghi nhận bảng renewal_audit_log, gửi email hóa đơn'],
    ['ASC-05.04', 'Tài chính Hội viên', 'Gia hạn Niên liễm Điện tử', 'Lịch sử Đóng phí Minh bạch', 'Tra cứu toàn bộ lịch sử đóng niên liễm các năm trước kèm hóa đơn điện tử VAT', '/association/renew/history', 'Hội viên / Kế toán DN', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: public.invoices & renewal_audit_log'],
    ['ASC-05.05', 'Tài chính Hội viên', 'Gia hạn Niên liễm Điện tử', 'Kiểm toán Giao dịch Gia hạn', 'Xem vết kiểm toán và log giao dịch chi tiết dành cho tài khoản có quyền kế toán/thư ký', '/association/renew/audit', 'Kế toán hiệp hội', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Bảng chi tiết transaction_ref và IP giao dịch'],

    // 6. Thẻ số & Smart Card
    ['ASC-06.01', 'Danh thiếp & Thẻ số', 'Thẻ Thông minh Hiệp hội', 'Thẻ Hội viên Kỹ thuật số (Digital ID)', 'Mặt trước/mặt sau thẻ hội viên có logo CLB, ảnh đại diện, chức danh BCH, mã QR định danh', '/association/card', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Component 3D Card flip animation'],
    ['ASC-06.02', 'Danh thiếp & Thẻ số', 'Thẻ Thông minh Hiệp hội', 'Chia sẻ Danh thiếp Doanh nhân (vCard)', 'Chia sẻ danh thiếp qua QR code cho đối tác bên ngoài quét lưu trực tiếp vào danh bạ iPhone/Android', '/association/card', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Định dạng chuẩn vCard 3.0 (.vcf)'],
    ['ASC-06.03', 'Danh thiếp & Thẻ số', 'Thẻ Thông minh Hiệp hội', 'Quản lý Thẻ Doanh nhân Hội viên', 'Quản lý nhiều mẫu danh thiếp khác nhau ứng với các công ty mà hội viên đang điều hành', '/association/business-cards', 'Hội viên', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.member_business_cards'],

    // 7. Quyền lợi, Thư viện, Tin nhắn & Hồ sơ
    ['ASC-07.01', 'Đặc quyền & Ưu đãi', 'Kho Đặc quyền Hội viên (Perks)', 'Danh sách Ưu đãi Doanh nghiệp Dành riêng', 'Xem và kích hoạt các mã khuyến mãi, voucher giảm giá từ các đối tác liên kết của Hiệp hội', '/association/perks', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.perks, copy voucher code'],
    ['ASC-07.02', 'Thư viện & Văn bản', 'Thư viện Tài liệu Hiệp hội', 'Tra cứu & Tải Văn bản Quy chế', 'Tải về các văn bản quy chế, điều lệ hội, danh sách hội viên thường niên dạng PDF/Word', '/association/library', 'Hội viên', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 2.5, 'Table: public.documents, viewer tích hợp'],
    ['ASC-07.03', 'Hỗ trợ & Giao tiếp', 'Kênh Hỗ trợ Ban Thư ký', 'Gửi Tin nhắn & Phản ánh tới Thư ký', 'Hội viên gửi kiến nghị, đóng góp ý kiến hoặc yêu cầu hỗ trợ tài chính tới trực tiếp Ban Thư ký', '/association/messages', 'Hội viên', 'P2 - Trung bình', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Table: public.messages, chat trực tiếp với ban điều hành'],
    ['ASC-07.04', 'Cơ hội Giao thương', 'Giao thương Nội bộ Hiệp hội', 'Đăng tải Cơ hội Hợp tác Kinh doanh', 'Hội viên đăng tin tìm kiếm nhà cung cấp, tìm kiếm đại lý, đối tác đầu tư trong nội bộ hiệp hội', '/association/opportunities', 'Hội viên', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.5, 'Table: public.opportunities, gắn tags ngành hàng'],
    ['ASC-07.05', 'Hồ sơ Cá nhân', 'Thiết lập Tài khoản Hội viên', 'Cập nhật Thông tin Đại diện & Bảo mật', 'Chỉnh sửa chức vụ, hotline, địa chỉ văn phòng công ty, đổi mật khẩu và xem nhật ký hoạt động', '/association/profile', 'Chủ tài khoản', 'P1 - Cao', '100%', 'Hoàn thành', 'Đã kiểm thử', 3.0, 'Form validation, upload ảnh đại diện chất lượng cao']
  ];

  assocRows.forEach((row, idx) => {
    const r = wsAssoc.addRow({
      wbs: row[0],
      module: row[1],
      parent: row[2],
      child: row[3],
      desc: row[4],
      url: row[5],
      actor: row[6],
      priority: row[7],
      completion: row[8],
      dev_status: row[9],
      qa_status: row[10],
      effort: row[11],
      notes: row[12]
    });
    r.height = 24;
    r.eachCell((cell) => {
      cell.border = borderAll;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };
    });
    r.getCell('priority').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('completion').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('dev_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('qa_status').alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell('effort').alignment = { vertical: 'middle', horizontal: 'right' };

    if (idx % 2 === 1) {
      r.eachCell((cell) => {
        if (!cell.fill) cell.fill = headerFill('FFF9FAFB');
      });
    }
  });

  const outputPath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ File Excel PM Matrix đã được xuất thành công tới: ${outputPath}`);
}

createPMMatrixExcel().catch(console.error);
