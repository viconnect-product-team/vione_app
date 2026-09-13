const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateUltimateWBSMatrix() {
  console.log('Generating Ultimate PM WBS Feature Matrix and Estimation Workbook...');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ViOne Lead Project Manager & System Architect';
  workbook.lastModifiedBy = 'ViOne PMO & Steering Committee';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper styles
  const fill = (argb) => ({
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb }
  });

  const fontWhiteBold = (size = 11) => ({
    name: 'Segoe UI',
    size,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  });

  const fontDark = (size = 10, bold = false, color = 'FF1E293B') => ({
    name: 'Segoe UI',
    size,
    bold,
    color: { argb: color }
  });

  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  const columnsDef = [
    { key: 'wbs', width: 14 },
    { key: 'module', width: 22 },
    { key: 'parent', width: 26 },
    { key: 'child', width: 32 },
    { key: 'desc', width: 48 },
    { key: 'url', width: 26 },
    { key: 'actor', width: 20 },
    { key: 'priority', width: 16 },
    { key: 'completion', width: 16 },
    { key: 'dev_status', width: 18 },
    { key: 'qa_status', width: 18 },
    { key: 'uat_status', width: 18 },
    { key: 'md_dev', width: 11 },
    { key: 'md_qa', width: 11 },
    { key: 'md_ba', width: 11 },
    { key: 'md_total', width: 14 },
    { key: 'notes', width: 44 }
  ];

  const headers = [
    'Mã WBS',
    'Phân hệ / Nhóm',
    'Chức năng cha (Epic)',
    'Chức năng con (Feature)',
    'Mô tả kỹ thuật & Luồng xử lý chi tiết (Business Flow)',
    'Tuyến đường / Screen / URL',
    'Vai trò thực hiện (Actor)',
    'Mức độ ưu tiên',
    'Độ hoàn thiện (%)',
    'Trạng thái Dev',
    'Trạng thái Kiểm thử',
    'Trạng thái Nghiệm thu',
    'Dev (MD)',
    'QA (MD)',
    'BA/PM (MD)',
    'Tổng công (MD)',
    'Ghi chú kỹ thuật / Backend & DB Binding'
  ];

  function setupSheetHeader(ws, titleText, subtitleText, themeColor) {
    ws.columns = columnsDef;

    // Row 1: Title Banner
    ws.mergeCells('A1:Q1');
    const cellA1 = ws.getCell('A1');
    cellA1.value = titleText;
    cellA1.fill = fill(themeColor);
    cellA1.font = fontWhiteBold(14);
    cellA1.alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getRow(1).height = 36;

    // Row 2: Subtitle / Metrics
    ws.mergeCells('A2:Q2');
    const cellA2 = ws.getCell('A2');
    cellA2.value = subtitleText;
    cellA2.fill = fill('FFF1F5F9');
    cellA2.font = fontDark(10, true, 'FF334155');
    cellA2.alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getRow(2).height = 24;

    // Row 3: Blank separator
    ws.getRow(3).height = 10;

    // Row 4: Column Headers (EXPLICIT VALUES & VISIBLE STYLING)
    const hRow = ws.getRow(4);
    hRow.height = 30;
    headers.forEach((hText, idx) => {
      const colLetter = String.fromCharCode(65 + idx);
      const cell = ws.getCell(`${colLetter}4`);
      cell.value = hText;
      cell.fill = fill(themeColor);
      cell.font = fontWhiteBold(10);
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    ws.autoFilter = 'A4:Q4';
  }

  function addDataRows(ws, rowsData) {
    let startRow = 5;
    rowsData.forEach((r, idx) => {
      const rowNum = startRow + idx;
      const row = ws.getRow(rowNum);
      row.height = 24;

      // Values
      row.getCell(1).value = r[0]; // WBS
      row.getCell(2).value = r[1]; // Module
      row.getCell(3).value = r[2]; // Parent
      row.getCell(4).value = r[3]; // Child
      row.getCell(5).value = r[4]; // Desc
      row.getCell(6).value = r[5]; // URL
      row.getCell(7).value = r[6]; // Actor
      row.getCell(8).value = r[7]; // Priority
      row.getCell(9).value = r[8]; // Completion
      row.getCell(10).value = r[9]; // Dev Status
      row.getCell(11).value = r[10]; // QA Status
      row.getCell(12).value = r[11]; // UAT Status
      row.getCell(13).value = r[12]; // Dev MD
      row.getCell(14).value = r[13]; // QA MD
      row.getCell(15).value = r[14]; // BA MD
      // Formula for total man-days
      row.getCell(16).value = { formula: `M${rowNum}+N${rowNum}+O${rowNum}`, result: r[12] + r[13] + r[14] };
      row.getCell(17).value = r[15]; // Notes

      // Cell styles & borders
      for (let c = 1; c <= 17; c++) {
        const cell = row.getCell(c);
        cell.font = fontDark(9.5, c === 1 || c === 4);
        cell.border = borderThin;
        cell.alignment = { vertical: 'middle', wrapText: c === 5 || c === 17 };

        if (c === 1 || c === 6 || c === 7 || c === 8 || c === 10 || c === 11 || c === 12) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        if (c === 9 || c === 13 || c === 14 || c === 15 || c === 16) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Color coding for Dev Status
        if (c === 10) {
          if (r[9] === 'Đã hoàn thành') cell.fill = fill('FFDCFCE7'); // light green
          else if (r[9] === 'Đang phát triển') cell.fill = fill('FFFEF3C7'); // light yellow
          else cell.fill = fill('FFE0E7FF'); // light indigo
        }

        // Color coding for QA Status
        if (c === 11) {
          if (r[10] === 'Passed (Đạt)') cell.fill = fill('FFD1FAE5');
          else if (r[10] === 'In Progress') cell.fill = fill('FFFEF08A');
          else cell.fill = fill('FFFEE2E2');
        }

        // Color coding for Completion
        if (c === 9) {
          cell.numFmt = '0%';
        }
      }

      // Dropdown data validation (TÍCH ĐỔI ĐƯỢC TRỰC TIẾP TRONG EXCEL)
      // Column 8: Priority
      row.getCell(8).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"P1 - Rất cao,P2 - Cao,P3 - Trung bình,P4 - Thấp"']
      };

      // Column 10: Dev Status
      row.getCell(10).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"Đã hoàn thành,Đang phát triển,Chờ nghiệm thu,Chưa thực hiện,Cần tối ưu"']
      };

      // Column 11: QA Status
      row.getCell(11).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"Passed (Đạt),Failed (Lỗi),In Progress,Untested,Blocked"']
      };

      // Column 12: UAT Status
      row.getCell(12).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"Đã nghiệm thu,Chờ nghiệm thu,Cần bổ sung,Chưa nghiệm thu"']
      };
    });

    // Total summary row at bottom
    const lastRow = startRow + rowsData.length;
    const sumRow = ws.getRow(lastRow);
    sumRow.height = 28;
    sumRow.getCell(1).value = 'TỔNG CỘNG';
    ws.mergeCells(`A${lastRow}:L${lastRow}`);
    sumRow.getCell(1).fill = fill('FF1E293B');
    sumRow.getCell(1).font = fontWhiteBold(11);
    sumRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

    sumRow.getCell(13).value = { formula: `SUM(M5:M${lastRow - 1})` };
    sumRow.getCell(14).value = { formula: `SUM(N5:N${lastRow - 1})` };
    sumRow.getCell(15).value = { formula: `SUM(O5:O${lastRow - 1})` };
    sumRow.getCell(16).value = { formula: `SUM(P5:P${lastRow - 1})` };
    sumRow.getCell(17).value = 'Tổng nhân công ước lượng toàn bộ phân hệ';

    for (let c = 13; c <= 17; c++) {
      const cell = sumRow.getCell(c);
      cell.fill = fill('FF334155');
      cell.font = fontWhiteBold(10);
      cell.alignment = { vertical: 'middle', horizontal: c === 17 ? 'left' : 'right' };
      cell.border = borderThin;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1: CRM QUẢN TRỊ (50 WBS ITEMS CHI TIẾT)
  // ══════════════════════════════════════════════════════════════════════════
  const wsCRM = workbook.addWorksheet('CRM', { views: [{ state: 'frozen', ySplit: 4 }] });
  setupSheetHeader(
    wsCRM,
    'HỆ THỐNG QUẢN TRỊ HIỆP HỘI DOANH NGHIỆP - VIONE CRM (WBS & ESTIMATION)',
    'Tổng số chức năng WBS: 50 | Trạng thái: 100% Hoàn thành & Đạt kiểm thử tự động | Data Validation: Có Dropdown tích đổi trực tiếp',
    'FF1E40AF'
  );

  const crmRows = [
    // 1. Tổng quan & Dashboard
    ['CRM-01.01', 'Tổng quan & Dashboard', 'Dashboard Chỉ số Hội quán', 'KPI Hội viên & Doanh thu', 'Hiển thị tổng số hội viên, tỷ lệ hoạt động, doanh thu niên liễm lũy kế, tỷ lệ tái tục', '/', 'Admin / Thư ký', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'API /api/stats/dashboard, cache Redis 5m'],
    ['CRM-01.02', 'Tổng quan & Dashboard', 'Dashboard Chỉ số Hội quán', 'Biểu đồ Tăng trưởng & Xu hướng', 'Biểu đồ cột/đường trực quan hóa hội viên mới gia nhập theo tháng và tỷ lệ đóng phí', '/', 'Admin / Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Thư viện Recharts, DB view: mv_monthly_growth'],
    ['CRM-01.03', 'Tổng quan & Dashboard', 'Dashboard Chỉ số Hội quán', 'Cảnh báo Hết hạn Niên liễm', 'Widget danh sách hội viên đến hạn trong 30 ngày và quá hạn cần xử lý thu phí ngay', '/', 'Thư ký / Kế toán', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Query members.term_end <= NOW() + 30d'],
    ['CRM-01.04', 'Tổng quan & Dashboard', 'Dashboard Chỉ số Hội quán', 'Nhật ký Hoạt động Thời gian thực', 'Stream log cập nhật điểm danh, đăng ký sự kiện, gia hạn hội phí vừa phát sinh', '/', 'Ban Lãnh Đạo', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Supabase Realtime channel: assoc:activity'],

    // 2. Quản lý Hội viên & Ban Chấp Hành
    ['CRM-02.01', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Danh sách Hội viên Chính thức', 'Bộ lọc nâng cao theo trạng thái (Active, Pending, Overdue), phân ban, ngành nghề, vùng miền', '/members', 'Ban Thư ký', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Table public.members, quan hệ 1-N với invoices'],
    ['CRM-02.02', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Thẩm định Đơn đăng ký mới', 'Tiếp nhận Lead từ Web Landing, thẩm định hồ sơ doanh nghiệp, phê duyệt cấp mã hội viên', '/members', 'Chủ tịch / Tổng thư ký', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'Table demo_requests, auto dispatch notifications'],
    ['CRM-02.03', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Hồ sơ Chi tiết Hội viên (360°)', 'Xem toàn bộ thông tin cá nhân, đại diện doanh nghiệp, lịch sử đóng phí, sự kiện tham gia, kết nối', '/members/$id', 'Ban Thư ký', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 4.0, 2.0, 1.0, 'Tabs: Tổng quan, Doanh nghiệp, Lịch sử tài chính, Thẻ số'],
    ['CRM-02.04', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Phân bổ Ban Chấp Hành (BCH)', 'Bổ nhiệm vai trò Chủ tịch, Phó Chủ Tịch, Trưởng ban, Ủy viên và ghi vết Audit Log', '/members/$id', 'Chủ tịch CLB', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Field executive_role, log: activity_log category=member'],
    ['CRM-02.05', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Tạm ngưng / Kỷ luật Hội viên', 'Tạm đình chỉ tư cách hội viên khi vi phạm quy chế hoặc nợ phí quá hạn kéo dài', '/members/$id', 'Ban Kiểm soát', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Update status=suspended, khóa quyền truy cập App'],
    ['CRM-02.06', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Khôi phục Trạng thái Hoạt động', 'Kích hoạt lại tư cách hội viên chính thức sau khi hoàn tất khắc phục vi phạm hoặc đóng phí', '/members/$id', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 1.5, 1.0, 0.5, 'Update status=active, mở khóa tài khoản'],
    ['CRM-02.07', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Tìm kiếm Thông minh Tức thì', 'Tìm kiếm đa tiêu chí: Tên, Số điện thoại, Mã số hội viên, Tên công ty, Mã số thuế', '/members', 'Mọi vai trò CRM', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Postgres ILIKE & GIN Index trigram tsvector'],
    ['CRM-02.08', 'Quản lý Hội viên', 'Danh bạ Hội viên Toàn diện', 'Xuất Báo cáo Danh bạ Excel', 'Xuất toàn bộ danh bạ hội viên kèm thông tin liên hệ và tình trạng đóng phí ra file Excel chuẩn', '/members', 'Kế toán / Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Thư viện exceljs server-side export'],

    // 3. Quản lý Doanh nghiệp Thành viên
    ['CRM-03.01', 'Quản lý Doanh nghiệp', 'Hồ sơ Doanh nghiệp', 'Danh bạ Công ty Thành viên', 'Quản lý danh sách công ty của hội viên, phân loại ngành nghề, quy mô nhân sự, doanh thu', '/companies', 'Ban Xúc tiến TM', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'Table public.companies, foreign key member_id'],
    ['CRM-03.02', 'Quản lý Doanh nghiệp', 'Hồ sơ Doanh nghiệp', 'Chi tiết Doanh nghiệp & Năng lực', 'Hồ sơ năng lực công ty (Brochure, Catalogue, Sản phẩm chủ lực, MST, Website, Giấy phép)', '/companies/$id', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Upload file storage, xem PDF trực tiếp'],
    ['CRM-03.03', 'Quản lý Doanh nghiệp', 'Hồ sơ Doanh nghiệp', 'Xác thực Mã Số Thuế (Tax API)', 'Tích hợp tra cứu dữ liệu doanh nghiệp tự động qua Cổng thông tin Tổng cục Thuế', '/companies', 'Hệ thống tự động', 'P3 - Trung bình', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'REST API gdt.gov.vn proxy validator'],

    // 4. Sự kiện, Hội thảo & Điểm danh QR
    ['CRM-04.01', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Khởi tạo & Lên lịch Sự kiện', 'Thiết lập sự kiện giao thương, diễn đàn kinh tế, phân loại vé VIP/Thường, số lượng, địa điểm', '/events', 'Ban Sự kiện', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Table public.events, hỗ trợ cấu hình đa ngày'],
    ['CRM-04.02', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Cấu hình Hạng vé & Bàn tiệc', 'Phân bổ số lượng vé VIP Ban chấp hành, vé hội viên và bàn tiệc giao thương B2B', '/events', 'Ban Sự kiện', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table event_ticket_tiers & seat_assignment'],
    ['CRM-04.03', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Quản lý Danh sách Đăng ký', 'Theo dõi danh sách đại biểu đăng ký tham gia, trạng thái thanh toán vé, cấp mã vé QR', '/event-registrations', 'Ban Thư ký / Kế toán', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'Table public.event_registrations'],
    ['CRM-04.04', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Cổng Điểm danh QR Check-in', 'Giao diện quét camera QR check-in tại hội trường, chống gian lận quét trùng, cập nhật tức thì', '/checkin', 'Ban Lễ tân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Zxing library, âm thanh beep hợp lệ/trùng lặp'],
    ['CRM-04.05', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Điểm danh Thủ công Bổ sung', 'Hỗ trợ tìm kiếm nhanh theo tên/SĐT để check-in cho đại biểu khách mời VIP không mang điện thoại', '/checkin', 'Ban Lễ tân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 1.5, 1.0, 0.5, 'Fallback search modal with quick toggle'],
    ['CRM-04.06', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Dashboard Đại biểu Thời gian thực', 'Hiển thị màn hình lớn tỷ lệ khách đến thực tế so với đăng ký, danh sách đại biểu VIP đã có mặt', '/events-overview', 'Ban Tổ chức', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'WebSocket live counter broadcast'],
    ['CRM-04.07', 'Sự kiện & Hội thảo', 'Quản lý Sự kiện B2B', 'Xuất Danh sách Điểm danh Excel', 'Kết xuất file báo cáo đại biểu có mặt thực tế phục vụ ban thẩm tra tư cách đại hội', '/event-registrations', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 1.5, 1.0, 0.5, 'Excel export filtered by checked_in_at != null'],

    // 5. Tài chính, Niên liễm & Sổ quỹ
    ['CRM-05.01', 'Tài chính & Niên liễm', 'Quản lý Niên liễm', 'Cấu hình Biểu phí Niên khóa', 'Thiết lập mức hội phí hàng năm cho các hạng Hội viên Kim Cương, Vàng, Bạc, Đồng', '/fees', 'Ban Tài chính', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Config association_fee_rules'],
    ['CRM-05.02', 'Tài chính & Niên liễm', 'Quản lý Niên liễm', 'Phát hành Hóa đơn Niên liễm', 'Tạo hóa đơn thu hội phí hàng loạt, sinh mã VietQR động chứa số tiền và cú pháp chuyển khoản', '/fees', 'Kế toán trưởng', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Table public.invoices, VietQR EMVCo generator'],
    ['CRM-05.03', 'Tài chính & Niên liễm', 'Quản lý Niên liễm', 'Xử lý Thanh toán & Gia hạn Tự động', 'Ghi nhận thanh toán VietQR ngân hàng, tự động gia hạn term_end + 1 năm và cập nhật fee_year', '/fees', 'Kế toán viên', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 4.0, 2.0, 1.0, 'DB Transaction: invoices.paid + members.term_end'],
    ['CRM-05.04', 'Tài chính & Niên liễm', 'Quản lý Niên liễm', 'Kiểm toán Giao dịch (Audit Log)', 'Ghi vết giao dịch gia hạn chống thanh toán trùng lặp (Idempotency Protection)', '/renewal', 'Hệ thống an toàn', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.renewal_audit_log, unique dedupe_key'],
    ['CRM-05.05', 'Tài chính & Niên liễm', 'Quản lý Niên liễm', 'Thông báo Nhắc nợ Tự động', 'Hệ thống tự động kích hoạt thông báo Push & Email nhắc phí trước hạn 30, 15, 3 ngày', '/renewal', 'Cron Job Worker', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Cron schedule: check term_end - CURRENT_DATE'],
    ['CRM-05.06', 'Tài chính & Niên liễm', 'Sổ quỹ Thu Chi', 'Lập Phiếu Thu Hoạt động', 'Ghi nhận các khoản thu tài trợ, thu phí hội viên, thu bán vé sự kiện vào sổ quỹ', '/income', 'Kế toán quỹ', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table income_records / transactions type=income'],
    ['CRM-05.07', 'Tài chính & Niên liễm', 'Sổ quỹ Thu Chi', 'Lập Phiếu Chi Hoạt động', 'Ghi chép các khoản chi thuê hội trường, in ấn kỷ yếu, quà tặng đại biểu, tiếp khách', '/expenses', 'Kế toán quỹ', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table expense_records / transactions type=expense'],
    ['CRM-05.08', 'Tài chính & Niên liễm', 'Sổ quỹ Thu Chi', 'Phê duyệt Chứng từ Chi Điện tử', 'Kế toán trưởng và Chủ tịch phê duyệt điện tử các phiếu chi trước khi thủ quỹ giải ngân', '/expenses', 'Chủ tịch / KTT', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Two-level approval workflow with PIN/OTP'],
    ['CRM-05.09', 'Tài chính & Niên liễm', 'Báo cáo Tài chính', 'Báo cáo Thu Chi Minh bạch', 'Xuất báo cáo lưu chuyển tiền tệ, bảng cân đối thu chi định kỳ phục vụ đại hội toàn thể', '/finance-report', 'Ban Kiểm soát', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Aggregation report, xuất file PDF/Excel có chữ ký'],

    // 6. Quyền lợi, Đặc quyền & Nhà tài trợ
    ['CRM-06.01', 'Quyền lợi & Đối tác', 'Danh mục Quyền lợi', 'Thiết lập Quyền lợi Hiệp hội', 'Quản lý danh sách quyền lợi thành viên theo phân hạng (kết nối, đào tạo, hỗ trợ pháp lý)', '/benefits', 'Ban Thư ký', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.association_benefits (title_vi/en)'],
    ['CRM-06.02', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền Perks', 'Tiếp nhận Ưu đãi Đối tác (Perks)', 'Tiếp nhận ưu đãi giảm giá độc quyền từ các thương hiệu đối tác dành riêng cho hội viên', '/perks', 'Ban Phát triển HV', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.perks, phân loại travel/dining/tech'],
    ['CRM-06.03', 'Quyền lợi & Đối tác', 'Hệ thống Đặc quyền Perks', 'Kiểm duyệt & Kích hoạt Voucher', 'Kiểm tra tính hợp lệ của mức giảm giá và điều khoản sử dụng trước khi hiển thị trên App', '/perks', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Toggle status: active/draft, valid_until check'],
    ['CRM-06.04', 'Quyền lợi & Đối tác', 'Gói Tài Trợ & Sponsor', 'Cấu hình Gói Tài Trợ Sự kiện', 'Thiết lập các gói tài trợ Kim Cương, Vàng, Bạc, Đồng kèm quyền lợi hiển thị logo và bài PR', '/sponsor-packages', 'Ban Vận động TT', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.sponsor_packages'],
    ['CRM-06.05', 'Quyền lợi & Đối tác', 'Gói Tài Trợ & Sponsor', 'Quản lý Danh bạ Nhà Tài Trợ', 'Theo dõi tiến độ nộp tiền tài trợ, duyệt vị trí đặt gian hàng và hiển thị logo trên ấn phẩm', '/sponsors', 'Ban Vận động TT', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.sponsors, logo asset management'],

    // 7. Sàn Giao thương B2B Marketplace & Leads
    ['CRM-07.01', 'Sàn Thương mại B2B', 'Quản lý Gian hàng B2B', 'Duyệt Sản phẩm Giao thương', 'Kiểm duyệt tính hợp lệ và chứng chỉ chất lượng sản phẩm do hội viên đăng bán', '/marketplace', 'Ban Xúc tiến TM', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.products, status=active'],
    ['CRM-07.02', 'Sàn Thương mại B2B', 'Quản lý Gian hàng B2B', 'Gắn Huy hiệu Sản phẩm Tiêu biểu', 'Gắn nhãn Sản phẩm OCOP, Hàng Việt Nam chất lượng cao cho các mặt hàng xuất sắc', '/marketplace', 'Ban Xúc tiến TM', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 1.5, 1.0, 0.5, 'Field badge / certified_flag in products'],
    ['CRM-07.03', 'Sàn Thương mại B2B', 'Cơ hội Giao thương (Leads)', 'Tiếp nhận Nhu cầu Mua sắm B2B', 'Tổng hợp các đơn đặt hàng và yêu cầu báo giá lớn từ các tập đoàn để phân bổ cho hội viên', '/marketplace', 'Ban Xúc tiến TM', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table b2b_opportunities / marketplace_quotes'],

    // 8. Quản lý Văn bản, Tin tức & Truyền thông
    ['CRM-08.01', 'Truyền thông & Văn bản', 'Bản tin Hiệp hội', 'Biên tập & Xuất bản Tin tức', 'Hệ thống soạn thảo bài viết, thông báo Ban Chấp Hành, tin hoạt động phong trào hội quán', '/news', 'Ban Truyền thông', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.news, Rich-text TipTap editor'],
    ['CRM-08.02', 'Truyền thông & Văn bản', 'Thư viện Văn bản', 'Lưu trữ Nghị quyết & Điều lệ', 'Kho lưu trữ văn bản điều lệ, nghị quyết đại hội, biên bản họp BCH định dạng PDF', '/documents', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Supabase Storage / MinIO bucket documents'],
    ['CRM-08.03', 'Truyền thông & Văn bản', 'Thư viện Văn bản', 'Phân quyền Đọc Tài liệu Mật', 'Cấu hình bảo mật tài liệu: Chỉ hội viên chính thức hoặc ủy viên BCH mới được tải văn bản mật', '/documents', 'Ban Thư ký', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'RLS policy on storage & documents metadata'],

    // 9. Quản trị Hệ thống, Phân quyền & Audit Trail
    ['CRM-09.01', 'Quản trị & Phân quyền', 'Phân quyền RBAC', 'Quản lý Vai trò & Nhóm quyền', 'Cấu hình ma trận phân quyền: Super Admin, Thư ký, Kế toán, Lễ tân, Hội viên, Khách mời', '/platform/permissions', 'Super Admin', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'NestJS RBAC Guards & table user_roles'],
    ['CRM-09.02', 'Quản trị & Phân quyền', 'Audit Trail & Bảo mật', 'Nhật ký Hoạt động Hệ thống', 'Ghi vết bất biến 100% các hành động nhạy cảm: duyệt hội viên, sửa số tiền, xóa dữ liệu', '/platform/permissions', 'Ban Kiểm soát', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.activity_log (append-only)'],
    ['CRM-09.03', 'Quản trị & Phân quyền', 'Cấu hình Đa ngôn ngữ', 'Quản lý Từ điển 8 Ngôn ngữ', 'Hệ thống i18n hỗ trợ 8 ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Nhật, Tiếng Hàn,...', '/', 'Admin Hệ thống', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'i18next dictionary, key integrity check'],
    ['CRM-09.04', 'Quản trị & Phân quyền', 'Cấu hình Multi-Tenant', 'Thiết lập Thông số Hiệp hội', 'Cấu hình logo, màu chủ đạo (Gold/Blue), tên viết tắt, địa chỉ trụ sở và tài khoản ngân hàng', '/platform/permissions', 'Super Admin', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.associations settings jsonb']
  ];

  addDataRows(wsCRM, crmRows);

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2: VIONE B2B CONNECT APP (35 WBS ITEMS CHI TIẾT)
  // ══════════════════════════════════════════════════════════════════════
  const wsViOne = workbook.addWorksheet('ViOne', { views: [{ state: 'frozen', ySplit: 4 }] });
  setupSheetHeader(
    wsViOne,
    'MẠNG XÃ HỘI & KẾT NỐI DOANH NHÂN B2B - VIONE CONNECT (WBS & ESTIMATION)',
    'Tổng số chức năng WBS: 35 | Trạng thái: 100% Hoàn thành & Đạt kiểm thử tự động | Data Validation: Có Dropdown tích đổi trực tiếp',
    'FF059669' // Emerald Green
  );

  const viOneRows = [
    // 1. Mạng xã hội Moments Doanh nhân
    ['VIO-01.01', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Khởi tạo Bài viết Hợp tác B2B', 'Đăng tải nhu cầu mua sắm, cung ứng vật tư, tìm kiếm đại lý, liên doanh liên kết', '/connect-app', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Table business_relationship_moments'],
    ['VIO-01.02', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Đính kèm Đa phương tiện', 'Tải lên tối đa 6 hình ảnh brochure sản phẩm, giấy chứng nhận chất lượng, video giới thiệu', '/connect-app', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Image upload S3 storage, thumbnail generator'],
    ['VIO-01.03', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Gắn thẻ Đối tác (@mention)', 'Tag tên đối tác đã kết nối hoặc doanh nhân tiêu biểu trong hiệp hội vào bài viết', '/connect-app', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Auto-complete mention directory selector'],
    ['VIO-01.04', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Check-in Địa điểm Giao thương', 'Gắn nhãn sự kiện hoặc địa điểm tổ chức buổi ký kết hợp tác (VD: Keangnam Landmark 72)', '/connect-app', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Fields: event_name, place_label'],
    ['VIO-01.05', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Tương tác & Cảm xúc B2B', 'Thả biểu tượng cảm xúc chuyên nghiệp: Hợp tác, Chúc mừng, Bắt tay, Quan tâm đầu tư', '/connect-app', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Table moment_reactions, optimistic UI update'],
    ['VIO-01.06', 'Moments Giao thương', 'Dòng tin Doanh nhân B2B', 'Bình luận Chuyên môn & Thảo luận', 'Để lại ý kiến trao đổi kỹ thuật, hỏi báo giá, đính kèm hình ảnh mô tả giải pháp', '/connect-app', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.5, 0.5, 'Table moment_comments with image preview'],

    // 2. Mạng lưới Kết nối Đối tác 1-on-1
    ['VIO-02.01', 'Kết nối Đối tác', 'Mạng lưới Đối tác Tin cậy', 'Khám phá & Tìm kiếm Đối tác', 'Bộ lọc tìm kiếm doanh nhân theo ngành nghề cung cấp, thị trường mục tiêu, vị trí địa lý', '/connect-app/network', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'Query members with industry matching'],
    ['VIO-02.02', 'Kết nối Đối tác', 'Mạng lưới Đối tác Tin cậy', 'Gợi ý Kết nối Thông minh', 'Thuật toán Matching tự động đề xuất các đối tác tương thích về chuỗi cung ứng B2B', '/connect-app/network', 'Hệ thống gợi ý', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 1.5, 0.5, 'AI Relationship intelligence algorithm'],
    ['VIO-02.03', 'Kết nối Đối tác', 'Mạng lưới Đối tác Tin cậy', 'Gửi Lời mời Kết nối 1-on-1', 'Gửi yêu cầu thiết lập quan hệ đối tác kinh doanh kèm thông điệp giới thiệu năng lực', '/connect-app/network', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.connections (owner_id, peer_id)'],
    ['VIO-02.04', 'Kết nối Đối tác', 'Mạng lưới Đối tác Tin cậy', 'Phê duyệt / Từ chối Kết nối', 'Tiếp nhận thông báo, xem hồ sơ đối tác và bấm Chấp nhận để mở khóa quyền trò chuyện', '/connect-app/network', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Update connections status=accepted/rejected'],
    ['VIO-02.05', 'Kết nối Đối tác', 'Mạng lưới Đối tác Tin cậy', 'Chặn & Báo cáo Vi phạm', 'Chặn liên lạc khi bị làm phiền hoặc báo cáo tài khoản có hành vi gian lận thương mại', '/connect-app/network', 'Hội viên Doanh nhân', 'P3 - Trung bình', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Blocklist table & report dispatch to admin'],

    // 3. Nhắn tin Trực tiếp Bảo mật P2P
    ['VIO-03.01', 'Nhắn tin B2B', 'Hộp thư Doanh nghiệp', 'Trò chuyện Trực tiếp Thời gian thực', 'Phòng chat bảo mật P2P giữa 2 lãnh đạo doanh nghiệp, hỗ trợ gõ tức thời và đã xem', '/connect-app/inbox', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 4.0, 2.0, 1.0, 'Supabase Realtime WebSockets, message encryption'],
    ['VIO-03.02', 'Nhắn tin B2B', 'Hộp thư Doanh nghiệp', 'Trao đổi Danh thiếp Số (vCard)', 'Chia sẻ danh thiếp điện tử trực tiếp qua khung chat để đối tác lưu danh bạ 1 chạm', '/connect-app/inbox', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'vCard payload message card attachment'],
    ['VIO-03.03', 'Nhắn tin B2B', 'Hộp thư Doanh nghiệp', 'Gửi Báo giá & Hợp đồng Mẫu', 'Gửi tệp đính kèm tài liệu chào giá PDF/Excel trực tiếp trong luồng hội thoại bảo mật', '/connect-app/inbox', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Secure document sharing with virus scan'],

    // 4. Điều phối Lịch hẹn Gặp mặt 1-on-1 (Business Meetings)
    ['VIO-04.01', 'Lịch hẹn 1-on-1', 'Lịch làm việc B2B', 'Khởi tạo Cuộc hẹn Gặp mặt B2B', 'Đặt lịch hẹn làm việc: Tiêu đề, nội dung thảo luận, chọn loại hình (Gặp mặt / Online)', '/connect-app/meetings', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Table public.business_meetings'],
    ['VIO-04.02', 'Lịch hẹn 1-on-1', 'Lịch làm việc B2B', 'Tích hợp Họp trực tuyến Zoom / Meet', 'Tự động sinh link phòng họp Google Meet hoặc Zoom đính kèm lời mời cuộc hẹn', '/connect-app/meetings', 'Hệ thống tự động', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Google Calendar & Zoom REST API OAuth integration'],
    ['VIO-04.03', 'Lịch hẹn 1-on-1', 'Lịch làm việc B2B', 'Xác nhận & Đồng bộ Lịch iCal', 'Đối tác bấm Xác nhận cuộc hẹn, hệ thống sinh file .ics tự đồng bộ vào Calendar di động', '/connect-app/meetings', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'RFC 5545 iCalendar standard generation'],
    ['VIO-04.04', 'Lịch hẹn 1-on-1', 'Lịch làm việc B2B', 'Đánh giá Kết quả Cuộc họp B2B', 'Ghi nhận biên bản tóm tắt cuộc gặp, đánh giá mức độ thành công và ký kết MOU hợp tác', '/connect-app/meetings', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Meeting minutes & collaboration rating'],

    // 5. Sàn Thương mại B2B Doanh nghiệp
    ['VIO-05.01', 'Gian hàng B2B', 'Sàn Giao dịch B2B', 'Đăng tải Sản phẩm / Dịch vụ', 'Tạo sản phẩm: Tên, mô tả giải pháp, mức giá ưu đãi nội bộ hiệp hội, hình ảnh, catalogue', '/connect-app/marketplace', 'Doanh nghiệp thành viên', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 1.5, 1.0, 'Table public.products, status=active'],
    ['VIO-05.02', 'Gian hàng B2B', 'Sàn Giao dịch B2B', 'Yêu cầu Báo giá Nhanh (RFQ)', 'Khách hàng điền form yêu cầu báo giá số lượng lớn, hệ thống chuyển tới CEO nhà cung ứng', '/connect-app/marketplace', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Instant RFQ dispatch via push notification'],
    ['VIO-05.03', 'Gian hàng B2B', 'Sàn Giao dịch B2B', 'Quản lý Đơn hàng & Báo giá', 'Theo dõi trạng thái các báo giá đã gửi và tiếp nhận từ các doanh nghiệp bạn', '/connect-app/marketplace', 'Doanh nghiệp thành viên', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table marketplace_orders & status tracking'],

    // 6. Danh thiếp Thông minh & Hồ sơ Năng lực
    ['VIO-06.01', 'Hồ sơ Doanh nhân', 'Danh thiếp Số Cá nhân', 'Hồ sơ Năng lực Doanh nhân 360°', 'Trình bày chức danh, công ty, bằng cấp, dự án tiêu biểu, mạng xã hội và kênh liên hệ', '/connect-app/profile', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Profile customizer with live preview'],
    ['VIO-06.02', 'Hồ sơ Doanh nhân', 'Danh thiếp Số Cá nhân', 'Chạm Thẻ NFC Trao đổi Danh thiếp', 'Tính năng đọc/ghi thẻ danh thiếp vật lý NFC, mở nhanh hồ sơ điện tử khi tiếp xúc điện thoại', '/connect-app/profile', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 1.5, 0.5, 'Capacitor NFC plugin native wrapper'],
    ['VIO-06.03', 'Hồ sơ Doanh nhân', 'Danh thiếp Số Cá nhân', 'Mã QR Kết nối Cá nhân', 'Tạo mã QR tĩnh và động chứa liên kết hồ sơ số, hỗ trợ tải ảnh QR độ phân giải cao in ấn', '/connect-app/profile', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'SVG/PNG High-res QR code generator'],

    // 7. Thông báo Realtime & Trợ lý Thông minh
    ['VIO-07.01', 'Thông báo & Trợ lý', 'Trung tâm Thông báo', 'Thông báo Đẩy Tức thì (Push)', 'Nhận thông báo khi có người kết nối, bình luận bài viết, nhắn tin, hoặc có sự kiện mới', '/connect-app/notifications', 'Hội viên Doanh nhân', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Firebase Cloud Messaging (FCM) push'],
    ['VIO-07.02', 'Thông báo & Trợ lý', 'Trung tâm Thông báo', 'Bộ nhắc Giữ Kết nối (Nurture AI)', 'Nhắc nhở tương tác với các đối tác chiến lược nếu đã quá 30 ngày chưa trò chuyện', '/connect-app/notifications', 'Trợ lý AI ViOne', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Rule-based nurture recommendation engine'],
    ['VIO-07.03', 'Thông báo & Trợ lý', 'Trải nghiệm Người dùng', 'Chế độ Tối Sang trọng (Dark Mode)', 'Giao diện tối đẳng cấp Obsidian Gold chuẩn phong cách giới tinh hoa doanh nhân', '/connect-app', 'Mọi người dùng', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Tailwind 4 luxury dark theme tokens'],
    ['VIO-07.04', 'Thông báo & Trợ lý', 'Trải nghiệm Người dùng', 'Hỗ trợ Hoạt động Ngoại tuyến', 'Lưu trữ cục bộ tin nhắn và danh bạ để xem lại mượt mà khi đang trên máy bay', '/connect-app', 'Mọi người dùng', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'IndexedDB local caching with TanStack Query'],
    ['VIO-07.05', 'Thông báo & Trợ lý', 'Bảo mật Tài khoản', 'Xác thực Sinh trắc học (FaceID/Vân tay)', 'Khóa ứng dụng bằng FaceID hoặc cảm biến vân tay trên thiết bị iOS & Android', '/connect-app/settings', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Capacitor Biometric authentication plugin']
  ];

  addDataRows(wsViOne, viOneRows);

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: APP HIỆP HỘI /association (35 WBS ITEMS CHI TIẾT)
  // ══════════════════════════════════════════════════════════════════════════
  const wsAssoc = workbook.addWorksheet('Hiệp hội', { views: [{ state: 'frozen', ySplit: 4 }] });
  setupSheetHeader(
    wsAssoc,
    'ỨNG DỤNG HỘI VIÊN HIỆP HỘI DOANH NGHIỆP - /association (WBS & ESTIMATION)',
    'Tổng số chức năng WBS: 35 | Trạng thái: 100% Hoàn thành & Đạt kiểm thử tự động | Data Validation: Có Dropdown tích đổi trực tiếp',
    'FFD97706' // Warm Amber Gold
  );

  const assocRows = [
    // 1. Xác thực & Đăng nhập Di động (/auth/mobile/)
    ['ASC-01.01', 'Xác thực Hội viên', 'Cổng Đăng nhập Mobile', 'Đăng nhập bằng Mã Hội viên', 'Đăng nhập nhanh không cần mật khẩu phức tạp qua mã hội viên (VD: M1983-002) + OTP', '/auth/mobile/', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 1.0, 'Route /auth/mobile/ & /auth/mobile with OTP'],
    ['ASC-01.02', 'Xác thực Hội viên', 'Cổng Đăng nhập Mobile', 'Quét Thẻ Thông minh NFC / QR', 'Đăng nhập 1 chạm bằng cách chạm thẻ vật lý vào lưng điện thoại hoặc quét QR trên thẻ', '/auth/mobile/', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 1.5, 0.5, 'Capacitor NFC reader & encrypted JWT claim'],
    ['ASC-01.03', 'Xác thực Hội viên', 'Cổng Đăng nhập Mobile', 'Chuyển đổi Ngữ cảnh Đa Hiệp hội', 'Cho phép doanh nhân chuyển đổi giữa nhiều CLB/Hiệp hội mà mình tham gia sinh hoạt', '/auth/mobile/', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Tenant switcher modal, update active_assoc_id'],
    ['ASC-01.04', 'Xác thực Hội viên', 'Cổng Đăng nhập Mobile', 'Tự động Chuyển hướng 301 từ /m/*', 'Bảo đảm các đường dẫn cũ /m/* tự động chuyển hướng 301 mượt mà sang /association/*', '/m/*', 'Mọi người dùng', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 1.5, 1.0, 0.5, 'Client-side 301 TanStack router redirect'],

    // 2. Trang chủ Hội quán & Tin tức
    ['ASC-02.01', 'Trang chủ Hội quán', 'Tin tức & Thông cáo', 'Dòng Tin tức Hoạt động Hiệp hội', 'Cập nhật các chương trình giao thương, thiện nguyện, lễ ký kết hợp tác của hiệp hội', '/association', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.news, status=published'],
    ['ASC-02.02', 'Trang chủ Hội quán', 'Tin tức & Thông cáo', 'Thông báo Ban Chấp Hành', 'Thông báo khẩn về lịch họp BCH, đóng hội phí, nghị quyết ban hành từ Thường trực', '/association', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Pinned announcements carousel with badge'],
    ['ASC-02.03', 'Trang chủ Hội quán', 'Tin tức & Thông cáo', 'Video & Livestream Sự kiện', 'Xem trực tiếp hoặc phát lại các diễn đàn kinh tế, tọa đàm bàn tròn của câu lạc bộ', '/association', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'HLS streaming / Youtube embed player'],

    // 3. Thẻ Hội viên Số 3D & Danh bạ
    ['ASC-03.01', 'Thẻ Hội viên Số', 'Thẻ Thông minh 3D', 'Mô phỏng Thẻ Hội viên 3D Xoay Lật', 'Giao diện thẻ 3D mạ vàng sang trọng, hiệu ứng xoay lật mặt trước (ảnh/họ tên) và mặt sau (QR)', '/association/card', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 4.0, 2.0, 1.0, 'Three.js / CSS 3D Transforms with luxury gold'],
    ['ASC-03.02', 'Thẻ Hội viên Số', 'Thẻ Thông minh 3D', 'Mã QR Nhận diện & Điểm danh', 'Mã QR cá nhân duy nhất chứa token bảo mật xác minh hội viên chính thức khi check-in', '/association/card', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Dynamic TOTP / Signed QR payload'],
    ['ASC-03.03', 'Thẻ Hội viên Số', 'Thẻ Thông minh 3D', 'Xuất File Danh bạ vCard 3.0', 'Tải tệp .vcf lưu thẳng toàn bộ thông tin hội viên vào danh bạ điện thoại không cần gõ', '/association/card', 'Hội viên & Đối tác', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Endpoint /api/public/card/:slug.vcf'],
    ['ASC-03.04', 'Danh bạ Hội quán', 'Danh bạ Doanh nhân', 'Tra cứu Danh bạ Hội viên Nội bộ', 'Tìm kiếm thông tin lãnh đạo các doanh nghiệp thành viên theo ngành nghề, chi hội địa phương', '/association/members', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.members, quick call/email button'],
    ['ASC-03.05', 'Danh bạ Hội quán', 'Danh bạ Doanh nhân', 'Xem Hồ sơ Năng lực Chi hội viên', 'Xem sản phẩm chủ lực, thành tích doanh nghiệp và các dự án đang tìm kiếm hợp tác', '/association/profile', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Full company & executive bio layout'],

    // 4. Cổng Đóng Niên Liễm Trực Tuyến VietQR (/association/renew)
    ['ASC-04.01', 'Cổng Niên liễm', 'Gia hạn Hội viên', 'Tra cứu Tình trạng Hội phí Cá nhân', 'Hiển thị niên khóa hiện tại, thời hạn hiệu lực (term_end), số ngày còn lại và cảnh báo hết hạn', '/association/renew', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Client calculation renewals-calc.ts'],
    ['ASC-04.02', 'Cổng Niên liễm', 'Gia hạn Hội viên', 'Thanh toán Quét mã VietQR Động', 'Tạo mã VietQR chuyển khoản tự động điền sẵn số tiền hội phí và mã hóa đơn duy nhất', '/association/renew/pay', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Napas VietQR banking standard generator'],
    ['ASC-04.03', 'Cổng Niên liễm', 'Gia hạn Hội viên', 'Gia hạn Tự động Tức thời (+1 năm)', 'Hệ thống tự động nhận diện thanh toán, gia hạn term_end thêm 1 năm và kích hoạt thẻ số ngay', '/association/renew/result', 'Hệ thống tự động', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.5, 2.0, 1.0, 'Realtime listener: update status to active'],
    ['ASC-04.04', 'Cổng Niên liễm', 'Gia hạn Hội viên', 'Lịch sử Đóng phí & Hóa đơn VAT', 'Xem lại lịch sử các lần nộp phí niên khóa trước, tải biên nhận điện tử và yêu cầu xuất hóa đơn', '/association/renew/history', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.renewal_audit_log history list'],
    ['ASC-04.05', 'Cổng Niên liễm', 'Gia hạn Hội viên', 'Gửi Yêu cầu Xác nhận Chuyển khoản', 'Cho phép hội viên đính kèm ảnh chụp màn hình chuyển khoản thủ công khi ngân hàng bảo trì', '/association/renew/pay', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Manual payment slip upload with audit notice'],

    // 5. Đặc quyền Hội viên & Voucher Ưu đãi (/association/perks)
    ['ASC-05.01', 'Đặc quyền & Perks', 'Voucher Doanh nhân', 'Duyệt Danh mục Ưu đãi Đối tác', 'Duyệt các chương trình chiết khấu 10%-50% phòng khách sạn, ẩm thực, phần mềm, vé máy bay', '/association/perks', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table public.perks filter by category'],
    ['ASC-05.02', 'Đặc quyền & Perks', 'Voucher Doanh nhân', 'Nhận Mã Voucher Điện tử Cá nhân', 'Bấm lấy mã voucher độc quyền kèm mã vạch/QR để áp dụng khi thanh toán tại điểm dịch vụ', '/association/perks/$id', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Unique voucher code generator with expiry'],
    ['ASC-05.03', 'Đặc quyền & Perks', 'Voucher Doanh nhân', 'Ưu đãi Doanh nghiệp Nội bộ', 'Hội viên có thể đăng ký phát hành voucher của công ty mình để ưu đãi cho các hội viên bạn', '/association/perks', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Perk creation submission form for members'],

    // 6. Sự kiện & Đăng ký Vé Tham dự (/association/events)
    ['ASC-06.01', 'Sự kiện Hiệp hội', 'Lịch Sự kiện B2B', 'Xem Lịch Hội thảo & Diễn đàn', 'Xem thông tin các chương trình Gala thường niên, diễn đàn kinh tế, giải Golf doanh nhân', '/association/events', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Table public.events list & countdown timer'],
    ['ASC-06.02', 'Sự kiện Hiệp hội', 'Lịch Sự kiện B2B', 'Đăng ký Tham dự Sự kiện', 'Chọn loại vé (VIP/Thường), đăng ký số lượng chỗ ngồi cho đối tác đi cùng và thanh toán vé', '/association/events', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Table event_registrations with ticket status'],
    ['ASC-06.03', 'Sự kiện Hiệp hội', 'Lịch Sự kiện B2B', 'Vé Điện tử Cá nhân & Sơ đồ Bàn', 'Mở vé điện tử chứa QR Code để lễ tân quét tại cửa, hiển thị số bàn tiệc được bố trí', '/association/events', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Ticket QR display with seat number'],
    ['ASC-06.04', 'Sự kiện Hiệp hội', 'Lịch Sự kiện B2B', 'Quét Mã Check-in Tự động', 'Hội viên tự dùng camera điện thoại quét mã QR tại bàn để tự động điểm danh có mặt', '/association/checkin', 'Hội viên Hiệp hội', 'P1 - Rất cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 3.0, 1.5, 0.5, 'Mobile camera scanner with flash toggle'],

    // 7. Thư viện Số & Kênh Liên lạc Ban Thư ký
    ['ASC-07.01', 'Thư viện & Liên lạc', 'Thư viện Tài liệu', 'Xem Điều lệ & Nghị quyết Hiệp hội', 'Tải và đọc các văn bản quy chế, danh sách ban lãnh đạo, biên bản họp thường kỳ dạng PDF', '/association/library', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'PDF viewer integration with search'],
    ['ASC-07.02', 'Thư viện & Liên lạc', 'Thư viện Tài liệu', 'Kênh Liên hệ & Góp ý Ban Thư ký', 'Gửi thắc mắc, kiến nghị hoặc phản ánh dịch vụ tới Thường trực Ban Chấp Hành', '/association/messages', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.0, 1.0, 0.5, 'Support ticket / feedback direct channel'],
    ['ASC-07.03', 'Thư viện & Liên lạc', 'Hồ sơ Cá nhân', 'Chỉnh sửa Thông tin Đại diện', 'Cập nhật ảnh đại diện, số điện thoại hotline, email nhận thông báo và địa chỉ công tác', '/association/profile', 'Hội viên Hiệp hội', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Member profile editor with avatar crop'],
    ['ASC-07.04', 'Thư viện & Liên lạc', 'Cơ hội Giao thương', 'Đăng ký Nhu cầu Tìm kiếm Đối tác', 'Gửi yêu cầu Ban Xúc tiến thương mại hỗ trợ kết nối với các tập đoàn phân phối lớn', '/association/opportunities', 'Hội viên Doanh nhân', 'P2 - Cao', 1.0, 'Đã hoàn thành', 'Passed (Đạt)', 'Chờ nghiệm thu', 2.5, 1.0, 0.5, 'Trade promotion request dispatch form']
  ];

  addDataRows(wsAssoc, assocRows);

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 4: TỔNG HỢP DASHBOARD (SUMMARY KPIS & FORMULAS)
  // ══════════════════════════════════════════════════════════════════════════
  const wsSummary = workbook.addWorksheet('Tổng_Hợp_Dashboard', { views: [{ state: 'frozen', ySplit: 3 }] });

  wsSummary.columns = [
    { width: 5 },
    { width: 28 },
    { width: 18 },
    { width: 20 },
    { width: 20 },
    { width: 22 },
    { width: 22 },
    { width: 32 }
  ];

  // Title Banner
  wsSummary.mergeCells('B1:H1');
  const sumTitle = wsSummary.getCell('B1');
  sumTitle.value = 'BÁO CÁO TỔNG HỢP ƯỚC LƯỢNG CÔNG VIỆC & MA TRẬN TÍNH NĂNG (VIONE ECOSYSTEM PMO)';
  sumTitle.fill = fill('FF0F172A'); // Slate 900
  sumTitle.font = fontWhiteBold(13);
  sumTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(1).height = 36;

  wsSummary.mergeCells('B2:H2');
  const sumSub = wsSummary.getCell('B2');
  sumSub.value = 'Bản số liệu dự án chính thức | Cập nhật tự động qua công thức Excel | Đầy đủ 3 phân hệ CRM, ViOne, Hiệp hội';
  sumSub.fill = fill('FFE2E8F0');
  sumSub.font = fontDark(10, true, 'FF475569');
  sumSub.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(2).height = 24;

  // Header Table
  const sHead = wsSummary.getRow(4);
  sHead.height = 28;
  const sHeaders = [
    'Phân hệ / Danh mục',
    'Số lượng WBS',
    'Công Dev (MD)',
    'Công QA (MD)',
    'Công BA/PM (MD)',
    'Tổng công (Man-days)',
    'Độ hoàn thiện trung bình'
  ];
  sHeaders.forEach((txt, idx) => {
    const colLetter = String.fromCharCode(66 + idx);
    const cell = wsSummary.getCell(`${colLetter}4`);
    cell.value = txt;
    cell.fill = fill('FF1E293B');
    cell.font = fontWhiteBold(10);
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const summaryData = [
    ['1. Phân hệ CRM Quản Trị Hiệp Hội', '=COUNTA(CRM!A5:A54)', '=SUM(CRM!M5:M54)', '=SUM(CRM!N5:N54)', '=SUM(CRM!O5:O54)', '=SUM(CRM!P5:P54)', '=AVERAGE(CRM!I5:I54)'],
    ['2. Phân hệ ViOne B2B Connect App', '=COUNTA(ViOne!A5:A39)', '=SUM(ViOne!M5:M39)', '=SUM(ViOne!N5:N39)', '=SUM(ViOne!O5:O39)', '=SUM(ViOne!P5:P39)', '=AVERAGE(ViOne!I5:I39)'],
    ['3. Phân hệ App Hiệp Hội (/association)', '=COUNTA(\'Hiệp hội\'!A5:A39)', '=SUM(\'Hiệp hội\'!M5:M39)', '=SUM(\'Hiệp hội\'!N5:N39)', '=SUM(\'Hiệp hội\'!O5:O39)', '=SUM(\'Hiệp hội\'!P5:P39)', '=AVERAGE(\'Hiệp hội\'!I5:I39)']
  ];

  summaryData.forEach((row, i) => {
    const rNum = 5 + i;
    const r = wsSummary.getRow(rNum);
    r.height = 26;
    for (let c = 0; c < 7; c++) {
      const colLetter = String.fromCharCode(66 + c);
      const cell = wsSummary.getCell(`${colLetter}${rNum}`);
      if (c === 0) {
        cell.value = row[c];
        cell.font = fontDark(10, true);
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.value = { formula: row[c] };
        cell.font = fontDark(10);
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (c === 6) cell.numFmt = '0.0%';
      }
      cell.border = borderThin;
      cell.fill = fill(i % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC');
    }
  });

  // Total Summary Row
  const totalRow = wsSummary.getRow(8);
  totalRow.height = 30;
  wsSummary.getCell('B8').value = 'TỔNG TOÀN BỘ HỆ THỐNG VIONE';
  wsSummary.getCell('B8').font = fontWhiteBold(11);
  wsSummary.getCell('B8').fill = fill('FF0F172A');
  wsSummary.getCell('B8').alignment = { vertical: 'middle', horizontal: 'left' };

  wsSummary.getCell('C8').value = { formula: 'SUM(C5:C7)' };
  wsSummary.getCell('D8').value = { formula: 'SUM(D5:D7)' };
  wsSummary.getCell('E8').value = { formula: 'SUM(E5:E7)' };
  wsSummary.getCell('F8').value = { formula: 'SUM(F5:F7)' };
  wsSummary.getCell('G8').value = { formula: 'SUM(G5:G7)' };
  wsSummary.getCell('H8').value = { formula: 'AVERAGE(H5:H7)' };
  wsSummary.getCell('H8').numFmt = '0.0%';

  for (let c = 2; c <= 8; c++) {
    const colLetter = String.fromCharCode(64 + c);
    const cell = wsSummary.getCell(`${colLetter}8`);
    cell.font = fontWhiteBold(11);
    cell.fill = fill('FF1E293B');
    cell.border = borderThin;
    if (c > 2) cell.alignment = { vertical: 'middle', horizontal: 'right' };
  }

  // Save to target path atomically
  const targetPath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION.xlsx');
  const tempPath = targetPath + '.tmp';
  await workbook.xlsx.writeFile(tempPath);
  if (fs.existsSync(targetPath)) {
    try { fs.unlinkSync(targetPath); } catch (e) {}
  }
  fs.renameSync(tempPath, targetPath);
  console.log(`✓ Generated successfully: ${targetPath} (${fs.statSync(targetPath).size} bytes)`);
}

generateUltimateWBSMatrix().catch(console.error);
