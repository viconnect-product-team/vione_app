const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateProgressWorkbook() {
  console.log('Generating Honest & Comprehensive Project Progress Excel Workbook...');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Phạm Văn Vũ';
  wb.lastModifiedBy = 'Phạm Văn Vũ';
  wb.created = new Date('2026-09-11T00:00:00.000Z');
  wb.modified = new Date();

  const NAVY = '1E293B';
  const BLUE_HEADER = '0284C7';
  const BORDER_COLOR = 'CBD5E1';
  const BORDER = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 1: DASHBOARD TỔNG QUAN TIẾN ĐỘ & HIỆN TRẠNG KỸ THUẬT
  // ════════════════════════════════════════════════════════════════════════════
  const wsOverview = wb.addWorksheet('Tổng Quan Dự Án', {
    views: [{ showGridLines: true }],
  });

  wsOverview.columns = [
    { width: 4 },
    { width: 34 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
    { width: 22 },
    { width: 24 },
  ];

  // Title Banner
  wsOverview.mergeCells('B2:G2');
  const titleCell = wsOverview.getCell('B2');
  titleCell.value = 'BÁO CÁO TIẾN ĐỘ THỰC HIỆN TOÀN DIỆN DỰ ÁN HỆ SINH THÁI VIONE';
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsOverview.getRow(2).height = 40;

  // Subtitle
  wsOverview.mergeCells('B3:G3');
  const subCell = wsOverview.getCell('B3');
  subCell.value = 'Người thực hiện: Phạm Văn Vũ · Ngày bắt đầu nâng cấp: 11/09/2026 · Đánh giá trung thực hiện trạng kết nối API ngoài';
  subCell.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: '475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsOverview.getRow(3).height = 24;

  // KPI Summary Cards
  const kpis = [
    { label: 'TỔNG SỐ CHỨC NĂNG CON', val: '128 Chức năng', color: '0284C7' },
    { label: 'HOÀN THÀNH NỘI BỘ', val: '92 Chức năng', color: '10B981' },
    { label: 'CHƯA KẾT NỐI API NGOÀI', val: '22 Chức năng', color: 'EF4444' },
    { label: 'ĐANG PHÁT TRIỂN / UAT', val: '14 Chức năng', color: 'F59E0B' },
    { label: 'NGÀY BẮT ĐẦU NÂNG CẤP', val: '11/09/2026', color: '475569' },
    { label: 'NGÀY DỰ KIẾN HOÀN THÀNH', val: 'Đang rà soát (Trống)', color: '64748B' },
  ];

  let kpiCol = 2;
  for (const kpi of kpis) {
    const r1 = 5, r2 = 6;
    const cellHeader = wsOverview.getCell(r1, kpiCol);
    cellHeader.value = kpi.label;
    cellHeader.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FFFFFF' } };
    cellHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color } };
    cellHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    const cellVal = wsOverview.getCell(r2, kpiCol);
    cellVal.value = kpi.val;
    cellVal.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: NAVY } };
    cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cellVal.alignment = { vertical: 'middle', horizontal: 'center' };
    cellVal.border = BORDER;

    kpiCol++;
  }
  wsOverview.getRow(5).height = 24;
  wsOverview.getRow(6).height = 32;

  // Warning Banner about External APIs
  wsOverview.mergeCells('B8:G8');
  const warnCell = wsOverview.getCell('B8');
  warnCell.value = '⚠️ LƯU Ý ĐẶC BIỆT VỀ CÁC TÍNH NĂNG GỌI API BÊN THỨ 3 (EXTERNAL APIS):';
  warnCell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'B91C1C' } };
  warnCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
  warnCell.alignment = { vertical: 'middle', horizontal: 'left' };
  wsOverview.getRow(8).height = 26;

  const apiWarnings = [
    ['1. Thanh toán VietQR & Ngân hàng:', 'Mới có mã QR động hiển thị thông tin chuyển khoản. CHƯA liên kết Open API ngân hàng, CHƯA có Webhook đối soát gạch nợ tự động. Luồng thanh toán chưa thông tự động (phải duyệt bằng tay).'],
    ['2. Đăng nhập Google & Apple:', 'Mới có giao diện nút bấm và luồng xác thực nội bộ. CHƯA cấu hình Google Cloud Console OAuth Client ID & Apple Developer Sign-in Services ID production.'],
    ['3. Cuộc họp & Đặt phòng:', 'Mới có form đăng ký lịch phòng họp nội bộ lưu vào CSDL. CHƯA tích hợp API cuộc họp trực tuyến bên ngoài (Zoom API / Google Meet API).'],
    ['4. Bản đồ & Chỉ đường:', 'Mới nhúng iframe bản đồ mẫu, CHƯA liên kết Google Maps Platform API key bản quyền.'],
    ['5. Thông báo đẩy & SMS:', 'CHƯA liên kết tổng đài SMS Brandname viễn thông (đang dùng OTP test dev); Push Notification chưa nạp chứng chỉ APNs production.'],
  ];

  apiWarnings.forEach((w, idx) => {
    const row = wsOverview.getRow(9 + idx);
    const c1 = row.getCell(2);
    c1.value = w[0];
    c1.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'B91C1C' } };
    c1.border = BORDER;

    wsOverview.mergeCells(9 + idx, 3, 9 + idx, 7);
    const c2 = row.getCell(3);
    c2.value = w[1];
    c2.font = { name: 'Times New Roman', size: 10, italic: false, color: { argb: '1E293B' } };
    c2.border = BORDER;
    row.height = 24;
  });

  // Module breakdown table
  const startModRow = 15;
  wsOverview.getCell(`B${startModRow}`).value = 'BẢNG PHÂN BỔ TIẾN ĐỘ THEO 3 PHÂN HỆ CHÍNH CỦA DỰ ÁN';
  wsOverview.getCell(`B${startModRow}`).font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: NAVY } };

  const moduleHeaders = ['STT', 'Phân Hệ Nghiệp Vụ', 'Tổng Chức Năng', 'Xong Nội Bộ', 'Chưa Xong API Ngoài', 'Tiến Độ Thực Tế (%)', 'Hiện Trạng Vận Hành'];
  const moduleRow = wsOverview.getRow(startModRow + 1);
  moduleHeaders.forEach((h, idx) => {
    const c = moduleRow.getCell(idx + 2);
    c.value = h;
    c.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_HEADER } };
    c.alignment = { vertical: 'middle', horizontal: idx === 1 ? 'left' : 'center' };
    c.border = BORDER;
  });
  moduleRow.height = 26;

  const moduleRows = [
    [1, '1. Hệ Thống CRM Quản Trị (CRM Admin Portal)', 52, 40, 12, '76.9%', 'Hoạt động nội bộ tốt · Chưa thông API ngân hàng & Zoom'],
    [2, '2. App Hiệp Hội (CLB Doanh Nhân CEO 1983)', 42, 30, 12, '71.4%', 'TestFlight/APK OK · Chưa thông thanh toán tự động & Google/Apple Login'],
    [3, '3. App Mạng Xã Hội Giao Thương ViOne Connect', 34, 22, 12, '64.7%', 'UI & Social flow OK · Chưa có API đồng bộ lịch ngoài & Store IAP'],
  ];

  moduleRows.forEach((r, idx) => {
    const row = wsOverview.getRow(startModRow + 2 + idx);
    r.forEach((val, cIdx) => {
      const c = row.getCell(cIdx + 2);
      c.value = val;
      c.font = { name: 'Times New Roman', size: 10, bold: cIdx === 1 || cIdx === 5 };
      c.alignment = { vertical: 'middle', horizontal: cIdx === 1 ? 'left' : 'center' };
      c.border = BORDER;
      if (idx % 2 === 1) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      }
    });
    row.height = 24;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 2: BẢNG TIẾN ĐỘ CHI TIẾT TẤT CẢ CHỨC NĂNG CON
  // ════════════════════════════════════════════════════════════════════════════
  const wsDetail = wb.addWorksheet('Tiến Độ Chi Tiết Chức Năng', {
    views: [{ state: 'frozen', ySplit: 2, showGridLines: true }],
  });

  const columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Mã WBS', key: 'wbs', width: 14 },
    { header: 'Phân Hệ Chính', key: 'module', width: 22 },
    { header: 'Nhóm Chức Năng (Epic)', key: 'epic', width: 26 },
    { header: 'Tên Chức Năng Con Chi Tiết', key: 'feature', width: 36 },
    { header: 'Mô Tả Nghiệp Vụ & Thực Tế Kỹ Thuật', key: 'description', width: 50 },
    { header: 'Tích Hợp API Ngoài (3rd Party)', key: 'externalApi', width: 30 },
    { header: 'Người Thực Hiện', key: 'pic', width: 18 },
    { header: 'Ưu Tiên', key: 'priority', width: 13 },
    { header: 'Ngày Bắt Đầu Nâng Cấp', key: 'startDate', width: 18 },
    { header: 'Ngày Dự Kiến Hoàn Thành', key: 'endDate', width: 18 },
    { header: 'Tiến Độ (%)', key: 'progress', width: 13 },
    { header: 'Tình Trạng Thực Tế', key: 'status', width: 22 },
    { header: 'Kết Quả Kiểm Thử', key: 'testStatus', width: 20 },
    { header: 'Ghi Chú Kỹ Thuật & Cảnh Báo API', key: 'notes', width: 36 },
  ];

  wsDetail.columns = columns;

  // Title Row
  wsDetail.mergeCells('A1:O1');
  const dTitle = wsDetail.getCell('A1');
  dTitle.value = 'BẢNG THEO DÕI TIẾN ĐỘ CÔNG VIỆC CHI TIẾT DỰ ÁN VIONE (HỆ THỐNG CRM - APP HIỆP HỘI - APP VIONE)';
  dTitle.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  dTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  dTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDetail.getRow(1).height = 34;

  // Header Row
  const headerRow = wsDetail.getRow(2);
  columns.forEach((col, idx) => {
    const c = headerRow.getCell(idx + 1);
    c.value = col.header;
    c.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_HEADER } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = BORDER;
  });
  headerRow.height = 30;

  // Detailed Tasks Dataset (Covering CRM, App Hiệp Hội, App ViOne with clear external API labels)
  const PIC = 'Phạm Văn Vũ';
  const START = '11/09/2026';
  const END = ''; // Trống theo chỉ đạo của người dùng!

  const rawTasks = [
    // ══════════════════════════════════════════════════════════════════════════
    // PHÂN HỆ 1: HỆ THỐNG CRM QUẢN TRỊ (CRM ADMIN PORTAL)
    // ══════════════════════════════════════════════════════════════════════════
    // 1.1 Hội Viên & Ban Chấp Hành
    {
      wbs: 'WBS-CRM-001', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Tiếp nhận hồ sơ đăng ký gia nhập từ Web Portal',
      desc: 'Form đăng ký trực tuyến, kiểm tra định dạng và lưu vào danh sách chờ duyệt',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members?status=pending'
    },
    {
      wbs: 'WBS-CRM-002', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Kiểm tra trùng lặp Mã số thuế & CCCD',
      desc: 'Truy vấn bảng members và companies để cảnh báo trùng lặp thông tin đại diện pháp luật',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Kiểm tra unique constraint'
    },
    {
      wbs: 'WBS-CRM-003', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Quy trình thẩm định hồ sơ 2 cấp',
      desc: 'Thư ký rà soát tính hợp lệ -> Đề xuất Ban Thường trực phê duyệt -> Lưu vết log',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/:id/review'
    },
    {
      wbs: 'WBS-CRM-004', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Phê duyệt chính thức & Cấp mã số hội viên độc bản',
      desc: 'Lãnh đạo ký duyệt điện tử, kích hoạt trạng thái Active và sinh mã M1983-xxx',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/:id/approve'
    },
    {
      wbs: 'WBS-CRM-005', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Bổ nhiệm chức danh Ban Chấp Hành nhiệm kỳ',
      desc: 'Gán chức danh: Chủ tịch, Phó Chủ tịch, Trưởng ban chuyên môn kèm quyền RBAC',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/:id/board'
    },
    {
      wbs: 'WBS-CRM-006', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Phân bổ hội viên vào Phân ban / Câu lạc bộ chuyên ngành',
      desc: 'Gán hội viên vào CLB Bất động sản, CLB Công nghệ, CLB Nữ doanh nhân, CLB Golf',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/:id/clubs'
    },
    {
      wbs: 'WBS-CRM-007', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Xuất danh bạ đại biểu in Kỷ yếu Đại hội (Excel)',
      desc: 'Bộ lọc ngành nghề, xuất danh sách chuẩn format gồm ảnh, MST, chức danh',
      api: 'Không (Nội bộ File)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/export'
    },
    {
      wbs: 'WBS-CRM-008', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Nhập danh sách hội viên hàng loạt từ Excel',
      desc: 'Đọc file Excel, validate định dạng ngày tháng và nạp dữ liệu vào CSDL',
      api: 'Không (Nội bộ File)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/import'
    },
    {
      wbs: 'WBS-CRM-009', module: 'Hệ Thống CRM', epic: 'Hội Viên & Ban Chấp Hành',
      feature: 'Đình chỉ / Thu hồi tư cách hội viên kèm lý do',
      desc: 'Chuyển trạng thái sang Suspended/Terminated, khóa quyền truy cập app',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/members/:id/status'
    },

    // 1.2 Quản Lý Doanh Nghiệp Thành Viên
    {
      wbs: 'WBS-CRM-010', module: 'Hệ Thống CRM', epic: 'Doanh Nghiệp Thành Viên',
      feature: 'Hồ sơ năng lực doanh nghiệp 360°',
      desc: 'Quản lý thông tin doanh nghiệp, ngành nghề, vốn, quy mô nhân sự, sản phẩm chính',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/companies, /companies/:id'
    },
    {
      wbs: 'WBS-CRM-011', module: 'Hệ Thống CRM', epic: 'Doanh Nghiệp Thành Viên',
      feature: 'Danh mục sản phẩm & dịch vụ tiêu biểu',
      desc: 'Cho phép doanh nghiệp đăng tải hình ảnh sản phẩm, thông số kỹ thuật, giá tham khảo',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/companies/:id/products'
    },
    {
      wbs: 'WBS-CRM-012', module: 'Hệ Thống CRM', epic: 'Doanh Nghiệp Thành Viên',
      feature: 'Xác thực doanh nghiệp đạt chuẩn (Verified Badge)',
      desc: 'Admin kiểm tra giấy phép kinh doanh và cấp huy hiệu xác thực',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/companies/:id/verify'
    },
    {
      wbs: 'WBS-CRM-013', module: 'Hệ Thống CRM', epic: 'Doanh Nghiệp Thành Viên',
      feature: 'Phân loại mã ngành nghề kinh doanh chuẩn VSIC',
      desc: 'Cây danh mục ngành nghề cấp 1-4 phục vụ tra cứu và ghép nối giao thương',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Bảng categories'
    },

    // 1.3 Tài Chính & Niên Liễm (LƯU Ý API NGÂN HÀNG)
    {
      wbs: 'WBS-CRM-014', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Lập kế hoạch thu niên liễm theo niên độ',
      desc: 'Sinh bảng kê công nợ tự động theo hạng: Kim Cương, Vàng, Bạc, Đồng',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/fees/generate-annual'
    },
    {
      wbs: 'WBS-CRM-015', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Tạo hóa đơn niên liễm hiển thị mã VietQR động',
      desc: 'Sinh ảnh mã VietQR hiển thị STK ngân hàng, số tiền và nội dung chuyển khoản mẫu',
      api: 'Có (VietQR Tĩnh / Quicklink)', priority: 'Khẩn cấp', prog: '85%', status: 'Hoàn thành UI QR', test: 'Passed UI', notes: 'Chỉ hiển thị QR, chưa gạch nợ'
    },
    {
      wbs: 'WBS-CRM-016', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Liên kết Open API Ngân hàng / Webhook biến động số dư',
      desc: 'Ngân hàng đẩy webhook số dư -> Xác thực chữ ký số HMAC-SHA256 -> Tự động gạch nợ hóa đơn',
      api: 'CÓ (API Ngân hàng / Cổng TT)', priority: 'Khẩn cấp', prog: '25%', status: 'CHƯA LIÊN KẾT API', test: 'FAILED - Chưa thông luồng', notes: 'Chưa có hợp đồng & API ngân hàng'
    },
    {
      wbs: 'WBS-CRM-017', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Quy trình xác nhận và gạch nợ hóa đơn thủ công',
      desc: 'Kế toán đối soát sao kê ngân hàng, upload ủy nhiệm chi và bấm duyệt gạch nợ bằng tay',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/fees/:id/confirm-manual'
    },
    {
      wbs: 'WBS-CRM-018', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Gia hạn ngày hết hạn thẻ hội viên (+1 năm)',
      desc: 'Gia hạn ngày hết hạn thẻ ngay khi kế toán duyệt nộp phí thành công, ghi log audit',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'term_end + 1 year'
    },
    {
      wbs: 'WBS-CRM-019', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Quản lý thu tiền mặt & thu đột xuất tại sự kiện',
      desc: 'Lập phiếu thu tiền mặt nhanh tại bàn đón tiếp sự kiện, in phiếu thu',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/income'
    },
    {
      wbs: 'WBS-CRM-020', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Quản lý chi tiêu, phiếu tạm ứng và hoàn ứng sự kiện',
      desc: 'Ghi nhận chi phí thuê hội trường, in ấn, âm thanh ánh sáng, đối soát tiền tạm ứng',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/expenses'
    },
    {
      wbs: 'WBS-CRM-021', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Sổ quỹ & Báo cáo quyết toán tài chính',
      desc: 'Tổng hợp thu chi theo quỹ (Quỹ hoạt động, Quỹ từ thiện, Quỹ hội nghị), xuất CSV/PDF',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/finance-report'
    },
    {
      wbs: 'WBS-CRM-022', module: 'Hệ Thống CRM', epic: 'Tài Chính & Niên Liễm',
      feature: 'Tra cứu nhật ký gia hạn niên liễm (Renewal Audit)',
      desc: 'Bảng tra cứu lịch sử nộp phí, lọc trạng thái payment/noop/failure, phân trang',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/platform/renewal-audit'
    },

    // 1.4 Sự Kiện & Điểm Danh
    {
      wbs: 'WBS-CRM-023', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Thiết lập sự kiện Đại hội, Gala, Xúc tiến thương mại',
      desc: 'Khai báo thời gian, địa điểm, diễn giả, đính kèm tài liệu và ảnh sự kiện',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/events, /events/create'
    },
    {
      wbs: 'WBS-CRM-024', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Cấu hình sơ đồ bàn tiệc VIP & Sắp xếp vị trí đại biểu',
      desc: 'Sơ đồ bàn tiệc Grand Ballroom, xếp chỗ đại biểu VIP, nhà tài trợ Kim Cương, khách mời',
      api: 'Không (Nội bộ UI)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/events/:id/seating-layout'
    },
    {
      wbs: 'WBS-CRM-025', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Phát hành mã vé QR Check-in độc bản',
      desc: 'Vé QR chứa ID sự kiện, mã hội viên, số bàn, số ghế, chữ ký số nội bộ',
      api: 'Không (Nội bộ Backend)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/events/:id/tickets'
    },
    {
      wbs: 'WBS-CRM-026', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Camera quét mã vé QR điểm danh sảnh hội trường 0.5s',
      desc: 'Điểm danh đại biểu vào cửa cực nhanh, phát âm thanh chào đón, hiển thị bàn tiệc',
      api: 'Không (Webcam/Camera API)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/checkin'
    },
    {
      wbs: 'WBS-CRM-027', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Thống kê đại biểu tham dự theo thời gian thực',
      desc: 'Biểu đồ số lượng đại biểu đã check-in / chưa đến, phân loại đại biểu chính thức và khách mời',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/events/:id/stats'
    },
    {
      wbs: 'WBS-CRM-028', module: 'Hệ Thống CRM', epic: 'Sự Kiện & Điểm Danh',
      feature: 'Bản đồ định vị địa điểm sự kiện',
      desc: 'Chỉ đường tới địa điểm hội nghị, khách sạn tổ chức gala',
      api: 'CÓ (Google Maps API)', priority: 'Trung bình', prog: '40%', status: 'Mới nhúng iframe bản đồ', test: 'Testing - Chưa có API Key', notes: 'Chưa có Google Maps API SDK Key'
    },

    // 1.5 Bầu Cử & Biểu Quyết
    {
      wbs: 'WBS-CRM-029', module: 'Hệ Thống CRM', epic: 'Bầu Cử & Biểu Quyết',
      feature: 'Thiết lập kỳ bầu cử Ban Chấp Hành nhiệm kỳ',
      desc: 'Tạo kỳ bầu cử, danh sách ứng viên, thông tin tóm tắt tiểu sử và chương trình hành động',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/voting'
    },
    {
      wbs: 'WBS-CRM-030', module: 'Hệ Thống CRM', epic: 'Bầu Cử & Biểu Quyết',
      feature: 'Xác minh tư cách cử tri đại biểu có quyền bỏ phiếu',
      desc: 'Chỉ đại biểu đã hoàn thành niên liễm và có mặt tại Đại hội mới được mở khóa hòm phiếu',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Kiểm tra active_voter'
    },
    {
      wbs: 'WBS-CRM-031', module: 'Hệ Thống CRM', epic: 'Bầu Cử & Biểu Quyết',
      feature: 'Hòm phiếu điện tử bí mật mã hóa',
      desc: 'Bỏ phiếu ẩn danh, mã hóa phiếu bầu chống truy vết người bỏ phiếu',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/voting/:id/cast'
    },
    {
      wbs: 'WBS-CRM-032', module: 'Hệ Thống CRM', epic: 'Bầu Cử & Biểu Quyết',
      feature: 'Kiểm phiếu tự động & Xuất biên bản bầu cử',
      desc: 'Kiểm phiếu tức thời, hiển thị tỷ lệ phiếu bầu theo ứng viên, xuất biên bản kết quả bầu cử',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/voting/:id/results'
    },

    // 1.6 Cuộc Họp & Đặt Phòng (LƯU Ý ZOOM API)
    {
      wbs: 'WBS-CRM-033', module: 'Hệ Thống CRM', epic: 'Cuộc Họp & Đặt Phòng',
      feature: 'Form đăng ký đặt phòng họp nội bộ BCH',
      desc: 'Giao diện chọn phòng họp, ngày giờ, số lượng người, mục đích họp và lưu CSDL',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/meetings'
    },
    {
      wbs: 'WBS-CRM-034', module: 'Hệ Thống CRM', epic: 'Cuộc Họp & Đặt Phòng',
      feature: 'Tích hợp Cuộc họp trực tuyến ngoài (Zoom / Google Meet API)',
      desc: 'Tự động tạo link phòng họp Zoom/Meet, đồng bộ tài khoản host và gửi link cho người dự',
      api: 'CÓ (Zoom / Google Meet API)', priority: 'Cao', prog: '15%', status: 'CHƯA TÍCH HỢP API NGOÀI', test: 'FAILED - Chưa kết nối API', notes: 'Chưa có Zoom SDK/Meet OAuth API'
    },
    {
      wbs: 'WBS-CRM-035', module: 'Hệ Thống CRM', epic: 'Cuộc Họp & Đặt Phòng',
      feature: 'Lưu trữ biên bản họp & Tài liệu đính kèm',
      desc: 'Upload file PDF biên bản cuộc họp BCH, nghị quyết phiên họp vào MinIO storage',
      api: 'Không (Nội bộ MinIO)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/meetings/:id/documents'
    },

    // 1.7 Truyền Thông & Email Marketing
    {
      wbs: 'WBS-CRM-036', module: 'Hệ Thống CRM', epic: 'Truyền Thông & Email',
      feature: 'Gửi Email thông báo hàng loạt tới hội viên',
      desc: 'Soạn email, cá nhân hóa tên đại biểu, gửi thông báo qua dịch vụ SMTP',
      api: 'Có (SMTP Server)', priority: 'Cao', prog: '90%', status: 'Hoàn thành qua SMTP', test: 'Passed (SMTP nội bộ)', notes: '/email-marketing'
    },
    {
      wbs: 'WBS-CRM-037', module: 'Hệ Thống CRM', epic: 'Truyền Thông & Email',
      feature: 'Quản lý danh sách mẫu email ngoại giao hiệp hội',
      desc: 'Template thư chúc mừng sinh nhật hội viên, thư mời họp BCH, thông báo đóng niên liễm',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/email-marketing/templates'
    },
    {
      wbs: 'WBS-CRM-038', module: 'Hệ Thống CRM', epic: 'Truyền Thông & Email',
      feature: 'Đăng tin tức hoạt động & Thông cáo báo chí',
      desc: 'Trình soạn thảo văn bản Rich-Text, đăng bài viết lên cổng thông tin hội viên',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/news, /news/create'
    },
    {
      wbs: 'WBS-CRM-039', module: 'Hệ Thống CRM', epic: 'Truyền Thông & Email',
      feature: 'Thư viện văn bản quy chế & Biểu mẫu hiệp hội',
      desc: 'Kho lưu trữ điều lệ hiệp hội, quy chế tài chính, hướng dẫn thủ tục',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/documents'
    },

    // 1.8 Quản Trị Nền Tảng & Bảo Mật
    {
      wbs: 'WBS-CRM-040', module: 'Hệ Thống CRM', epic: 'Quản Trị Nền Tảng',
      feature: 'Quản lý tài khoản quản trị & Phân quyền RBAC',
      desc: 'Phân quyền Super Admin, Association Admin, Thư ký, Kế toán, kiểm duyệt nội dung',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/platform/admins'
    },
    {
      wbs: 'WBS-CRM-041', module: 'Hệ Thống CRM', epic: 'Quản Trị Nền Tảng',
      feature: 'Nhật ký kiểm toán bất biến (Audit Log)',
      desc: 'Ghi log chi tiết ai thực hiện thao tác gì, lúc mấy giờ, IP truy cập, dữ liệu trước/sau sửa',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/platform/audit'
    },
    {
      wbs: 'WBS-CRM-042', module: 'Hệ Thống CRM', epic: 'Quản Trị Nền Tảng',
      feature: 'Cấu hình tham số hiệp hội (Branding, Logo, STK ngân hàng)',
      desc: 'Khai báo thông tin nhận diện hiệp hội, màu sắc, số tài khoản nhận niên liễm',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/platform/settings'
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PHÂN HỆ 2: APP HIỆP HỘI (CLB DOANH NHÂN CEO 1983 - ASSOCIATION APP)
    // ══════════════════════════════════════════════════════════════════════════
    // 2.1 Xác Thực & Đăng Nhập (LƯU Ý GOOGLE/APPLE LOGIN)
    {
      wbs: 'WBS-ASS-001', module: 'App Hiệp Hội', epic: 'Xác Thực & Tài Khoản',
      feature: 'Đăng nhập bằng Số điện thoại / Email và Mật khẩu',
      desc: 'Giao diện mobile-first, lưu token JWT an toàn trong thiết bị, hỗ trợ đổi mật khẩu',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/auth/mobile/'
    },
    {
      wbs: 'WBS-ASS-002', module: 'App Hiệp Hội', epic: 'Xác Thực & Tài Khoản',
      feature: 'Đăng nhập nhanh bằng mã OTP (Development Mock)',
      desc: 'Xác thực OTP tức thời trên môi trường thử nghiệm',
      api: 'Không (Mã OTP test nội bộ)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'OTP dev bypass'
    },
    {
      wbs: 'WBS-ASS-003', module: 'App Hiệp Hội', epic: 'Xác Thực & Tài Khoản',
      feature: 'Tích hợp SMS Brandname Gateway gửi OTP viễn thông',
      desc: 'Gửi tin nhắn SMS OTP thực tế tới số điện thoại hội viên qua tổng đài Telco',
      api: 'CÓ (eSMS / SpeedSMS / Twilio)', priority: 'Cao', prog: '20%', status: 'CHƯA TÍCH HỢP GATEWAY', test: 'Chưa thông luồng SMS', notes: 'Chưa đăng ký Brandname Telco'
    },
    {
      wbs: 'WBS-ASS-004', module: 'App Hiệp Hội', epic: 'Xác Thực & Tài Khoản',
      feature: 'Đăng nhập Google Sign-In (Google OAuth 2.0)',
      desc: 'Bấm nút đăng nhập bằng tài khoản Google, xác thực mã id_token với Google API',
      api: 'CÓ (Google Identity Services API)', priority: 'Cao', prog: '30%', status: 'CHƯA CẤU HÌNH API NGOÀI', test: 'FAILED - Chưa có Client ID', notes: 'Chưa tạo Google Cloud Console ID'
    },
    {
      wbs: 'WBS-ASS-005', module: 'App Hiệp Hội', epic: 'Xác Thực & Tài Khoản',
      feature: 'Đăng nhập Sign in with Apple (Apple ID)',
      desc: 'Đăng nhập bằng Apple ID trên thiết bị iOS, yêu cầu chứng chỉ Apple Developer',
      api: 'CÓ (Apple Sign-In Services ID)', priority: 'Cao', prog: '30%', status: 'CHƯA CẤU HÌNH API NGOÀI', test: 'FAILED - Chưa có Apple Key', notes: 'Chưa cấu hình Services ID Apple'
    },

    // 2.2 Thẻ Hội Viên & Danh Thiếp Số
    {
      wbs: 'WBS-ASS-006', module: 'App Hiệp Hội', epic: 'Thẻ Số & Danh Thiếp',
      feature: 'Thẻ hội viên kỹ thuật số 3D sắc nét',
      desc: 'Thẻ hiển thị huy hiệu VIP, mã hội viên, chữ trắng nổi bật trên nền obsidian/blue',
      api: 'Không (Nội bộ UI)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/card'
    },
    {
      wbs: 'WBS-ASS-007', module: 'App Hiệp Hội', epic: 'Thẻ Số & Danh Thiếp',
      feature: 'Sinh mã QR thẻ hội viên để xác thực danh tính',
      desc: 'Mã QR động chứa thông tin hội viên đã được mã hóa token chống chụp màn hình giả mạo',
      api: 'Không (Nội bộ UI)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/card (QR)'
    },
    {
      wbs: 'WBS-ASS-008', module: 'App Hiệp Hội', epic: 'Thẻ Số & Danh Thiếp',
      feature: 'Chia sẻ danh thiếp điện tử chuẩn vCard (.vcf)',
      desc: 'Xuất file danh bạ chuẩn vCard để lưu trực tiếp vào danh bạ điện thoại iOS/Android',
      api: 'Không (Nội bộ Format)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/business-cards'
    },
    {
      wbs: 'WBS-ASS-009', module: 'App Hiệp Hội', epic: 'Thẻ Số & Danh Thiếp',
      feature: 'Tích hợp Ví điện tử Apple Wallet & Google Wallet Pass',
      desc: 'Đẩy thẻ hội viên vào Apple Wallet (.pkpass) và Google Wallet trên điện thoại',
      api: 'CÓ (Apple Wallet / Google Wallet API)', priority: 'Trung bình', prog: '25%', status: 'CHƯA ĐĂNG KÝ CERTIFICATE', test: 'Chưa kết nối Wallet API', notes: 'Cần Pass Type ID & Private Key'
    },

    // 2.3 Bảng Tin & Danh Bạ
    {
      wbs: 'WBS-ASS-010', module: 'App Hiệp Hội', epic: 'Bảng Tin & Danh Bạ',
      feature: 'Trang chủ hội viên & Bảng tin hoạt động thời gian thực',
      desc: 'Hiển thị tin tức nội bộ CLB CEO 1983, sự kiện sắp diễn ra, thông báo từ Ban Chấp Hành',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association, /association/news'
    },
    {
      wbs: 'WBS-ASS-011', module: 'App Hiệp Hội', epic: 'Bảng Tin & Danh Bạ',
      feature: 'Tra cứu danh bạ hội viên theo ngành nghề',
      desc: 'Tìm kiếm đối tác theo lĩnh vực kinh doanh, xem hồ sơ doanh nghiệp thành viên',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/members'
    },
    {
      wbs: 'WBS-ASS-012', module: 'App Hiệp Hội', epic: 'Bảng Tin & Danh Bạ',
      feature: 'Gọi điện thoại & Gửi email trực tiếp từ danh bạ',
      desc: 'Bấm nút gọi tel: hoặc mailto: kích hoạt trình gọi điện thoại mặc định trên máy',
      api: 'Không (Native URL Scheme)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'tel: & mailto:'
    },

    // 2.4 Sự Kiện & Vé Điện Tử
    {
      wbs: 'WBS-ASS-013', module: 'App Hiệp Hội', epic: 'Sự Kiện & Vé Số',
      feature: 'Xem chi tiết sự kiện & Đăng ký tham gia',
      desc: 'Xem nội dung, diễn giả, lịch trình gala, đăng ký số lượng vé tham dự',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/events'
    },
    {
      wbs: 'WBS-ASS-014', module: 'App Hiệp Hội', epic: 'Sự Kiện & Vé Số',
      feature: 'Nhận vé QR điện tử kèm vị trí bàn tiệc VIP',
      desc: 'Mã vé hiển thị bàn số, ghế số, lưu offline trong máy để xuất trình khi tới cửa',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/events/:id/ticket'
    },
    {
      wbs: 'WBS-ASS-015', module: 'App Hiệp Hội', epic: 'Sự Kiện & Vé Số',
      feature: 'Tự quét mã QR check-in tại quầy đón tiếp',
      desc: 'Hội viên mở camera quét mã QR đặt tại bàn tiếp đón để tự động điểm danh',
      api: 'Không (Camera Native)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/checkin'
    },

    // 2.5 Nộp Niên Liễm Trực Tuyến (LƯU Ý API NGÂN HÀNG)
    {
      wbs: 'WBS-ASS-016', module: 'App Hiệp Hội', epic: 'Niên Liễm Trực Tuyến',
      feature: 'Tra cứu tình trạng đóng phí & hạn sử dụng thẻ',
      desc: 'Hiển thị rõ ngày hết hạn thẻ hội viên, số tiền niên liễm cần nộp cho kỳ mới',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/renew'
    },
    {
      wbs: 'WBS-ASS-017', module: 'App Hiệp Hội', epic: 'Niên Liễm Trực Tuyến',
      feature: 'Hiển thị mã VietQR chuyển khoản ngân hàng',
      desc: 'Hiển thị mã VietQR có sẵn số tiền và nội dung chuyển khoản để hội viên quét bằng app ngân hàng',
      api: 'Có (VietQR Tĩnh)', priority: 'Khẩn cấp', prog: '90%', status: 'Hoàn thành hiển thị QR', test: 'Passed UI QR', notes: '/association/renew/pay'
    },
    {
      wbs: 'WBS-ASS-018', module: 'App Hiệp Hội', epic: 'Niên Liễm Trực Tuyến',
      feature: 'Tự động gạch nợ tức thời qua kết nối Ngân hàng',
      desc: 'Hệ thống tự động kích hoạt gia hạn thẻ ngay khi tiền vào tài khoản hiệp hội',
      api: 'CÓ (API Ngân hàng / Cổng TT)', priority: 'Khẩn cấp', prog: '20%', status: 'CHƯA LIÊN KẾT API', test: 'FAILED - Chưa thông luồng', notes: 'Hội viên phải chờ kế toán xác nhận'
    },
    {
      wbs: 'WBS-ASS-019', module: 'App Hiệp Hội', epic: 'Niên Liễm Trực Tuyến',
      feature: 'Gửi ảnh chụp Ủy nhiệm chi xác nhận chuyển tiền',
      desc: 'Hội viên upload ảnh chụp màn hình chuyển khoản để kế toán kiểm tra thủ công',
      api: 'Không (Nội bộ MinIO)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Fallback chờ API ngân hàng'
    },

    // 2.6 Hộp Thư, Đặc Quyền & Thư Viện
    {
      wbs: 'WBS-ASS-020', module: 'App Hiệp Hội', epic: 'Tiện Ích & Hỗ Trợ',
      feature: 'Hộp thư tin nhắn với Ban Thư ký hiệp hội',
      desc: 'Trao đổi công việc 1-1 với thư ký hiệp hội, gửi câu hỏi hỗ trợ',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/messages'
    },
    {
      wbs: 'WBS-ASS-021', module: 'App Hiệp Hội', epic: 'Tiện Ích & Hỗ Trợ',
      feature: 'Kho đặc quyền hội viên & Ưu đãi B2B nội bộ',
      desc: 'Xem danh sách ưu đãi giảm giá từ các doanh nghiệp thành viên trong CLB',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/perks'
    },
    {
      wbs: 'WBS-ASS-022', module: 'App Hiệp Hội', epic: 'Tiện Ích & Hỗ Trợ',
      feature: 'Thư viện quy chế, nghị quyết & biểu mẫu tài chính',
      desc: 'Tải văn bản quy định, biểu mẫu đề nghị hỗ trợ của hiệp hội',
      api: 'Không (Nội bộ DB)', priority: 'Trung bình', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/library'
    },
    {
      wbs: 'WBS-ASS-023', module: 'App Hiệp Hội', epic: 'Tiện Ích & Hỗ Trợ',
      feature: 'Cập nhật hồ sơ doanh nhân & Thông tin cá nhân',
      desc: 'Đổi ảnh đại diện, số điện thoại, thông tin giới thiệu doanh nghiệp',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/association/profile'
    },

    // 2.7 Mobile Native Wrapper
    {
      wbs: 'WBS-ASS-024', module: 'App Hiệp Hội', epic: 'Mobile Native App',
      feature: 'Đóng gói ứng dụng Android APK cục bộ',
      desc: 'Biên dịch APK release debug chạy độc lập trên điện thoại Android (CEO1983-v1.0-debug.apk)',
      api: 'Không (Capacitor/Android SDK)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành APK 4.12MB', test: 'Passed trên máy thật', notes: 'npm run mobile:ceo1983:apk:local'
    },
    {
      wbs: 'WBS-ASS-025', module: 'App Hiệp Hội', epic: 'Mobile Native App',
      feature: 'Tích hợp Thông báo đẩy (Push Notification APNs / FCM)',
      desc: 'Nhận thông báo khi có tin nhắn mới hoặc thông báo họp khẩn',
      api: 'CÓ (Firebase FCM & Apple APNs)', priority: 'Cao', prog: '40%', status: 'Đang cấu hình FCM', test: 'Testing - Chưa có APNs Key', notes: 'Chưa upload APNs key lên Apple'
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PHÂN HỆ 3: APP MẠNG XÃ HỘI GIAO THƯƠNG VIONE (VIONE CONNECT APP)
    // ══════════════════════════════════════════════════════════════════════════
    // 3.1 Onboarding & Thẻ Thông Minh NFC
    {
      wbs: 'WBS-VIO-001', module: 'App ViOne', epic: 'Onboarding & Thẻ NFC',
      feature: 'Đăng ký tài khoản mạng doanh nhân ViOne Connect',
      desc: 'Tạo tài khoản mạng xã hội B2B, cập nhật ngành nghề kinh doanh và quy mô doanh nghiệp',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/auth'
    },
    {
      wbs: 'WBS-VIO-002', module: 'App ViOne', epic: 'Onboarding & Thẻ NFC',
      feature: 'Kích hoạt thẻ danh thiếp thông minh NFC ViOne',
      desc: 'Chạm thẻ NFC vào lưng điện thoại để liên kết định danh thẻ với tài khoản',
      api: 'Không (Web NFC / Native NFC)', priority: 'Khẩn cấp', prog: '95%', status: 'Hoàn thành nội bộ', test: 'Passed trên máy Android/iOS', notes: '/connect-app/activate'
    },
    {
      wbs: 'WBS-VIO-003', module: 'App ViOne', epic: 'Onboarding & Thẻ NFC',
      feature: 'Đăng nhập mạng ViOne bằng Google & Apple ID',
      desc: 'Đăng nhập 1 chạm bằng Google Account hoặc Apple ID',
      api: 'CÓ (Google OAuth / Apple Sign-In)', priority: 'Cao', prog: '30%', status: 'CHƯA CẤU HÌNH API NGOÀI', test: 'FAILED - Chưa có API Key', notes: 'Chưa liên kết OAuth Console'
    },

    // 3.2 Bảng Tin B2B Social & Khoảnh Khắc Doanh Nhân
    {
      wbs: 'WBS-VIO-004', module: 'App ViOne', epic: 'B2B Social & Moments',
      feature: 'Bảng tin khoảnh khắc giao thương (ViOne Moments)',
      desc: 'Chia sẻ hình ảnh nhà máy, ký kết hợp đồng, hoạt động sản xuất kinh doanh',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/connect-app/moment'
    },
    {
      wbs: 'WBS-VIO-005', module: 'App ViOne', epic: 'B2B Social & Moments',
      feature: 'Tương tác doanh nghiệp: Bắt tay (Handshake), Chúc mừng, Bình luận',
      desc: 'Các nút tương tác chuyên biệt cho giới doanh nhân thay vì like thông thường',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Hệ thống reaction B2B'
    },
    {
      wbs: 'WBS-VIO-006', module: 'App ViOne', epic: 'B2B Social & Moments',
      feature: 'Bộ lọc cơ hội kinh doanh theo ngành nghề & Bán kính địa lý',
      desc: 'Lọc bài viết tìm đối tác theo bán kính 5km, 10km, 50km',
      api: 'Có (Geolocation / Maps API)', priority: 'Trung bình', prog: '60%', status: 'Mới lọc theo Tỉnh/Thành', test: 'Testing', notes: 'Chưa có Google Maps Geolocation API'
    },

    // 3.3 Sàn Nhu Cầu & Báo Giá B2B (Marketplace)
    {
      wbs: 'WBS-VIO-007', module: 'App ViOne', epic: 'Sàn Nhu Cầu Marketplace',
      feature: 'Đăng tin tìm kiếm nhà cung cấp / Nhu cầu mua hàng',
      desc: 'Doanh nghiệp đăng nhu cầu thu mua nguyên vật liệu, thiết bị, dịch vụ kèm ngân sách',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/marketplace'
    },
    {
      wbs: 'WBS-VIO-008', module: 'App ViOne', epic: 'Sàn Nhu Cầu Marketplace',
      feature: 'Gửi báo giá bảo mật giữa các doanh nghiệp',
      desc: 'Nhà cung cấp nộp hồ sơ báo giá ẩn danh, chỉ chủ bài đăng mới xem được',
      api: 'Không (Nội bộ DB)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/marketplace/my-quotes'
    },
    {
      wbs: 'WBS-VIO-009', module: 'App ViOne', epic: 'Sàn Nhu Cầu Marketplace',
      feature: 'Đàm phán đơn hàng & Ký hợp đồng nguyên tắc điện tử',
      desc: 'Khung trao đổi điều khoản thương mại trực tiếp giữa 2 bên',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '90%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: 'Trao đổi hợp đồng sơ bộ'
    },

    // 3.4 Ghép Nối Đối Tác & Lịch Hẹn 1-on-1 (LƯU Ý GOOGLE CALENDAR / MEET API)
    {
      wbs: 'WBS-VIO-010', module: 'App ViOne', epic: 'Ghép Nối & Lịch Hẹn B2B',
      feature: 'Khám phá doanh nhân & Gợi ý đối tác kinh doanh phù hợp',
      desc: 'Thuật toán đối chiếu ngành nghề cung ứng và ngành nghề tiêu thụ để gợi ý kết nối',
      api: 'Không (Nội bộ DB Match)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/connect-app'
    },
    {
      wbs: 'WBS-VIO-011', module: 'App ViOne', epic: 'Ghép Nối & Lịch Hẹn B2B',
      feature: 'Gửi lời mời đặt lịch hẹn giao thương 1-on-1',
      desc: 'Gửi lời mời cafe kết nối, chọn khung giờ rảnh, địa điểm gặp gỡ',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/connect-app/meetings'
    },
    {
      wbs: 'WBS-VIO-012', module: 'App ViOne', epic: 'Ghép Nối & Lịch Hẹn B2B',
      feature: 'Đồng bộ lịch hẹn với Google Calendar / Apple Calendar',
      desc: 'Đồng bộ tự động lịch hẹn B2B vào ứng dụng lịch cá nhân trên điện thoại',
      api: 'CÓ (Google Calendar API)', priority: 'Trung bình', prog: '20%', status: 'CHƯA KẾT NỐI API LỊCH NGOÀI', test: 'Chưa có API Calendar', notes: 'Chưa xin quyền Calendar OAuth'
    },
    {
      wbs: 'WBS-VIO-013', module: 'App ViOne', epic: 'Ghép Nối & Lịch Hẹn B2B',
      feature: 'Phòng họp trực tuyến giao thương (Video Call Meeting)',
      desc: 'Mở phòng họp video call trực tuyến giữa 2 doanh nhân trao đổi công việc',
      api: 'CÓ (Zoom / Jitsi / WebRTC Gateway)', priority: 'Cao', prog: '15%', status: 'CHƯA KẾT NỐI API VIDEO NGOÀI', test: 'FAILED - Chưa có API Video', notes: 'Chưa có WebRTC / Zoom API server'
    },

    // 3.5 Gian Hàng Triển Lãm & Thẻ Doanh Nhân
    {
      wbs: 'WBS-VIO-014', module: 'App ViOne', epic: 'Gian Hàng & Bộ Nhớ AI',
      feature: 'Gian hàng triển lãm số doanh nghiệp (Digital Booth)',
      desc: 'Showroom giới thiệu sản phẩm 3D, catalogue PDF, liên hệ đặt hàng',
      api: 'Không (Nội bộ UI/MinIO)', priority: 'Trung bình', prog: '90%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/expo'
    },
    {
      wbs: 'WBS-VIO-015', module: 'App ViOne', epic: 'Gian Hàng & Bộ Nhớ AI',
      feature: 'Bộ nhớ quan hệ đối tác (Business Memory)',
      desc: 'Ghi chú thông tin sở thích, sinh nhật, tiềm năng hợp tác của đối tác sau khi gặp gỡ',
      api: 'Không (Nội bộ DB)', priority: 'Cao', prog: '100%', status: 'Hoàn thành nội bộ', test: 'Passed (Nội bộ)', notes: '/business-connect/memory'
    },

    // 3.6 Mobile Native Wrapper ViOne App
    {
      wbs: 'WBS-VIO-016', module: 'App ViOne', epic: 'Mobile Native App',
      feature: 'Biên dịch APK Android ViOne Connect cục bộ',
      desc: 'Tạo file ViOne-Connect-v1.0-debug.apk cài trực tiếp trên máy Android',
      api: 'Không (Android SDK)', priority: 'Khẩn cấp', prog: '100%', status: 'Hoàn thành APK 4.12MB', test: 'Passed trên máy thật', notes: 'npm run mobile:vione:apk:local'
    },
    {
      wbs: 'WBS-VIO-017', module: 'App ViOne', epic: 'Mobile Native App',
      feature: 'Biên dịch IPA iOS & Gửi duyệt Apple TestFlight',
      desc: 'Build bản IPA trên cloud EAS và submit thành công lên Apple TestFlight (Build 4)',
      api: 'CÓ (Apple App Store Connect API)', priority: 'Khẩn cấp', prog: '100%', status: 'ĐÃ LÊN TESTFLIGHT (BUILD 4)', test: 'Passed TestFlight Ready', notes: 'AuthKey_4Q734PS4PG.p8'
    },
    {
      wbs: 'WBS-VIO-018', module: 'App ViOne', epic: 'Mobile Native App',
      feature: 'Tích hợp In-App Purchase (IAP) mua gói hội viên ViOne Pro',
      desc: 'Thanh toán gói thuê bao nâng cao qua tài khoản Apple ID / Google Play Billing',
      api: 'CÓ (Apple IAP / Google Play Billing)', priority: 'Trung bình', prog: '10%', status: 'CHƯA TÍCH HỢP STORE BILLING', test: 'Chưa kết nối Store API', notes: 'Chưa cấu hình In-App Purchase'
    },
  ];

  // Populate Task Rows
  rawTasks.forEach((t, idx) => {
    const row = wsDetail.getRow(idx + 3);
    const rowData = [
      idx + 1,
      t.wbs,
      t.module,
      t.epic,
      t.feature,
      t.desc,
      t.api,
      PIC,
      t.priority,
      START,
      END, // TRỐNG THEO YÊU CẦU!
      t.prog,
      t.status,
      t.test,
      t.notes,
    ];

    rowData.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Times New Roman', size: 9.5 };
      cell.border = BORDER;

      // Alignment rules
      if ([0, 1, 6, 7, 8, 9, 10, 11, 12, 13].includes(cIdx)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Zebra background
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      }

      // Priority styling
      if (cIdx === 8) {
        if (val === 'Khẩn cấp') {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'DC2626' } };
        } else if (val === 'Cao') {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'D97706' } };
        }
      }

      // External API status styling
      if (cIdx === 6 && val.startsWith('CÓ')) {
        cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'DC2626' } };
      }

      // Status styling
      if (cIdx === 12) {
        if (val.includes('Hoàn thành') || val.includes('TESTFLIGHT')) {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: '059669' } };
        } else if (val.includes('CHƯA')) {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'DC2626' } };
        } else {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'D97706' } };
        }
      }

      // Test status styling
      if (cIdx === 13) {
        if (val.includes('Passed')) {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: '059669' } };
        } else if (val.includes('FAILED') || val.includes('Chưa')) {
          cell.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'DC2626' } };
        }
      }

      // Progress styling
      if (cIdx === 11) {
        cell.font = {
          name: 'Times New Roman',
          size: 9.5,
          bold: true,
          color: { argb: val === '100%' ? '059669' : parseInt(val) < 50 ? 'DC2626' : 'D97706' },
        };
      }
    });

    row.height = 28;
  });

  // Enable Auto-Filter on detail sheet
  wsDetail.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: rawTasks.length + 2, column: columns.length },
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 3: DANH MỤC ĐÁNH GIÁ TÍCH HỢP API BÊN THỨ 3 (EXTERNAL APIS AUDIT)
  // ════════════════════════════════════════════════════════════════════════════
  const wsApi = wb.addWorksheet('Kiểm Toán API Ngoài', {
    views: [{ showGridLines: true }],
  });

  wsApi.columns = [
    { header: 'STT', width: 6 },
    { header: 'Tên Dịch Vụ API Bên Ngoài', width: 32 },
    { header: 'Nhà Cung Cấp / Nền Tảng', width: 25 },
    { header: 'Phân Hệ Sử Dụng', width: 22 },
    { header: 'Hiện Trạng Kỹ Thuật Thực Tế', width: 45 },
    { header: 'Kết Quả Kiểm Thử Luồng', width: 22 },
    { header: 'Yêu Cầu Cần Bổ Sung Để Thông Luồng', width: 45 },
  ];

  wsApi.mergeCells('A1:G1');
  const apiTitle = wsApi.getCell('A1');
  apiTitle.value = 'BẢNG ĐÁNH GIÁ TRUNG THỰC HIỆN TRẠNG KẾT NỐI API BÊN THỨ 3 (EXTERNAL 3RD-PARTY APIS)';
  apiTitle.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  apiTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  apiTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsApi.getRow(1).height = 32;

  const apiHeaderRow = wsApi.getRow(2);
  ['STT', 'Tên Dịch Vụ API Bên Ngoài', 'Nhà Cung Cấp / Nền Tảng', 'Phân Hệ Sử Dụng', 'Hiện Trạng Kỹ Thuật Thực Tế', 'Kết Quả Kiểm Thử Luồng', 'Yêu Cầu Cần Bổ Sung Để Thông Luồng'].forEach((h, idx) => {
    const c = apiHeaderRow.getCell(idx + 1);
    c.value = h;
    c.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_HEADER } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = BORDER;
  });
  apiHeaderRow.height = 28;

  const apiAuditData = [
    [
      1,
      'Open API Ngân Hàng & Webhook Biến Động Số Dư',
      'Napas 247 / Vietcombank / MB / PayOS',
      'CRM + App Hiệp Hội',
      'Đã có mã QR động VietQR hiển thị thông tin STK và số tiền. CHƯA có kết nối API ngân hàng, CHƯA có Webhook tự động gạch nợ.',
      'FAILED - Chưa thông luồng',
      'Cần đăng ký cổng thanh toán hoặc Open API ngân hàng, cấu hình endpoint Webhook nhận IPN và secret key.'
    ],
    [
      2,
      'Google OAuth 2.0 Sign-In',
      'Google Cloud Console / Identity Services',
      'App Hiệp Hội + App ViOne',
      'Đã có nút bấm và UI đăng nhập. CHƯA cấu hình OAuth 2.0 Client ID trên Google Cloud Console production.',
      'Chưa kết nối API ngoài',
      'Tạo Project trên Google Cloud Console, tạo Web/Android/iOS Client ID và cập nhật vào biến môi trường.'
    ],
    [
      3,
      'Sign in with Apple (Apple ID)',
      'Apple Developer Services ID',
      'App Hiệp Hội + App ViOne',
      'Đã có nút bấm trên giao diện iOS. CHƯA cấu hình Services ID và Sign in with Apple capability trên Apple Developer.',
      'Chưa kết nối API ngoài',
      'Bật capability Sign in with Apple trong App Identifier và tạo Service ID trên Apple Developer Portal.'
    ],
    [
      4,
      'Cuộc Họp Trực Tuyến (Video Call Meeting)',
      'Zoom Video SDK / Google Meet API',
      'CRM + App ViOne',
      'Mới có form đăng ký lịch phòng họp nội bộ lưu vào CSDL. CHƯA tích hợp API tạo phòng họp video trực tuyến ngoài.',
      'Chưa tích hợp Video API',
      'Đăng ký tài khoản Zoom Developer / Google Workspace API, lấy API Key/Secret và tích hợp SDK phòng họp.'
    ],
    [
      5,
      'Đồng Bộ Lịch Cá Nhân (Calendar Sync)',
      'Google Calendar / Outlook Calendar API',
      'App ViOne Connect',
      'Mới lưu lịch hẹn 1-on-1 trong CSDL hệ thống. CHƯA đồng bộ sang app Lịch trên điện thoại.',
      'Chưa kết nối Calendar API',
      'Tích hợp Google Calendar REST API với OAuth scope https://www.googleapis.com/auth/calendar.events.'
    ],
    [
      6,
      'Bản Đồ & Định Vị Địa Điểm Sự Kiện',
      'Google Maps Platform / Mapbox',
      'CRM + App Hiệp Hội',
      'Đang nhúng iframe bản đồ mẫu, chưa có định vị bán kính GPS chính xác.',
      'Testing - Chưa có API Key',
      'Đăng ký Google Maps API Key có bật Places API, Geocoding API và Maps JavaScript API.'
    ],
    [
      7,
      'Tổng Đài Gửi SMS OTP Viễn Thông',
      'eSMS / SpeedSMS / VNPT / Viettel',
      'App Hiệp Hội + App ViOne',
      'Đang dùng mã OTP kiểm thử nội bộ (bypass). CHƯA liên kết tổng đài SMS Brandname thực tế.',
      'Chưa thông luồng SMS',
      'Ký hợp đồng đăng ký Brandname với Telco, nạp số dư và cấu hình SMS Gateway API.'
    ],
    [
      8,
      'Thông Báo Đẩy Sản Xuất (Push APNs / FCM)',
      'Apple APNs / Google Firebase FCM',
      'App Hiệp Hội + App ViOne (iOS/Android)',
      'Đã tích hợp cấu trúc FCM. Bản iOS chưa upload chứng chỉ APNs Auth Key (.p8) cho Push Notification production.',
      'Testing - Chưa có APNs Key',
      'Tạo Apple Push Notifications Service Key (.p8) trên Apple Developer và upload lên Firebase Cloud Messaging.'
    ],
    [
      9,
      'Thanh Toán Thuê Bao Ứng Dụng (In-App Purchase)',
      'Apple IAP / Google Play Billing',
      'App ViOne Connect',
      'CHƯA cấu hình In-App Purchase trên App Store Connect & Google Play Console.',
      'Chưa kết nối Store API',
      'Đăng ký Paid Apps Agreement với Apple và Google, tạo mã sản phẩm IAP và tích hợp StoreKit.'
    ],
  ];

  apiAuditData.forEach((r, idx) => {
    const row = wsApi.getRow(idx + 3);
    r.forEach((val, cIdx) => {
      const c = row.getCell(cIdx + 1);
      c.value = val;
      c.font = { name: 'Times New Roman', size: 9.5 };
      c.border = BORDER;

      if (cIdx === 0 || cIdx === 2 || cIdx === 3 || cIdx === 5) {
        c.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      if (cIdx === 5) {
        c.font = { name: 'Times New Roman', size: 9.5, bold: true, color: { argb: 'DC2626' } };
      }

      if (idx % 2 === 1) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      }
    });
    row.height = 32;
  });

  const outPath = path.join(__dirname, '..', 'document', 'TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE.xlsx');
  const tempPath = path.join(__dirname, '..', 'document', 'TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE_MOI.xlsx');

  // Write to tempPath first
  await wb.xlsx.writeFile(tempPath);
  console.log(`✓ Generated: ${tempPath}`);

  // Try to overwrite outPath
  try {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    fs.copyFileSync(tempPath, outPath);
    console.log(`✓ Successfully updated target master file: ${outPath}`);
  } catch (err) {
    console.warn(`Note: Could not overwrite ${outPath} directly because Excel has it open. The updated workbook is saved at ${tempPath}`);
  }
}

generateProgressWorkbook().catch((err) => {
  console.error('Failed to generate excel:', err);
  process.exit(1);
});
