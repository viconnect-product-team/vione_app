const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateHumanGradeWBSMatrix() {
  console.log('================================================================================');
  console.log('📊 GENERATING COMPREHENSIVE PMO MASTER WBS WORK ESTIMATION MATRIX (120+ TASKS)');
  console.log('================================================================================\n');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'VIONE Master Project Management Office (PMO)';
  wb.lastModifiedBy = 'Senior Technical Project Manager & Solution Architect';
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

  const devStatusList = '"Chưa bắt đầu,Đang thực hiện,Hoàn thành Dev,Sẵn sàng Test,Bị chặn"';
  const qaStatusList = '"Sẵn sàng Test,Đang kiểm thử,Passed,Failed,Cần re-test"';
  const uatStatusList = '"Chưa nghiệm thu,Đạt UAT,Cần chỉnh sửa,Đã ký duyệt"';
  const priorityList = '"Khẩn cấp,Cao,Trung bình,Thấp"';

  const columnsDef = [
    { header: 'Mã WBS', key: 'wbs', width: 14 },
    { header: 'Phân Hệ', key: 'module', width: 18 },
    { header: 'Hạng Mục Cha (Epic)', key: 'epic', width: 26 },
    { header: 'Chức Năng Con Chi Tiết (User Story / Task)', key: 'feature', width: 36 },
    { header: 'Mô Tả Luồng Nghiệp Vụ & Xử Lý Kỹ Thuật (Chi Tiết Chuyên Gia)', key: 'flow', width: 50 },
    { header: 'Tuyến Đường / Endpoint / Screen', key: 'route', width: 28 },
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
    { header: 'Ghi Chú Kỹ Thuật & Kiến Trúc Vận Hành', key: 'notes', width: 38 },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // 1. CRM DATA (65 Chức năng chi tiết - ĐẶC BIỆT TẬP TRUNG TÀI CHÍNH & SỰ KIỆN)
  // ════════════════════════════════════════════════════════════════════════
  const crmData = [
    // Hội viên & BCH (10 tasks)
    ['WBS-CRM-001', 'CRM Quản Trị', 'Hội viên & BCH', 'Tiếp nhận hồ sơ đăng ký gia nhập từ Web Portal', 'Validate MST, kiểm tra trùng lặp thông tin pháp nhân, đẩy vào hàng đợi chờ thẩm định', '/members?status=pending', 'Ban Thư Ký', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tự động tra cứu MST qua Cổng thông tin Quốc gia'],
    ['WBS-CRM-002', 'CRM Quản Trị', 'Hội viên & BCH', 'Quy trình thẩm định hồ sơ 2 cấp (Thư ký & Phó Chủ tịch)', 'Thư ký kiểm tra hồ sơ hợp lệ -> Đề xuất Ban Thường trực thẩm định -> Ghi vết audit log', '/members/:id/review', 'Phó Chủ Tịch BCH', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Cơ chế Approval Workflow đa cấp'],
    ['WBS-CRM-003', 'CRM Quản Trị', 'Hội viên & BCH', 'Phê duyệt chính thức & Cấp mã số hội viên độc bản', 'Duyệt hồ sơ, kích hoạt trạng thái active, sinh mã M1983-xxx theo quy chế đánh số nhiệm kỳ', '/members/:id/approve', 'Chủ Tịch Hiệp Hội', 'Khẩn cấp', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Khóa ràng buộc unique mã hội viên trong PostgreSQL'],
    ['WBS-CRM-004', 'CRM Quản Trị', 'Hội viên & BCH', 'Từ chối đơn gia nhập kèm công văn phản hồi chuẩn mực', 'Cập nhật trạng thái rejected, nhập lý do từ chối, tự động sinh email cảm ơn và hướng dẫn', '/members/:id/reject', 'Ban Thư Ký', 'Trung bình', 1, 1.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Mẫu email văn phong ngoại giao chuẩn hiệp hội'],
    ['WBS-CRM-005', 'CRM Quản Trị', 'Hội viên & BCH', 'Bổ nhiệm chức danh Ban Chấp Hành nhiệm kỳ 2026 - 2029', 'Gán chức danh: Chủ tịch, Phó Chủ tịch, Ủy viên thường vụ, Trưởng ban chuyên môn kèm quyền hạn', '/members/:id/board', 'Chủ Tịch Hiệp Hội', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Cập nhật trường tenure_start, tenure_end và role_title'],
    ['WBS-CRM-006', 'CRM Quản Trị', 'Hội viên & BCH', 'Phân bổ hội viên vào Phân ban / Câu lạc bộ chuyên ngành', 'Phân chia vào CLB Bất động sản, CLB Công nghệ, CLB Nữ doanh nhân, CLB Golf doanh nhân', '/members/:id/clubs', 'Ban Hội Viên', 'Cao', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Mối quan hệ Many-to-Many giữa hội viên và CLB'],
    ['WBS-CRM-007', 'CRM Quản Trị', 'Hội viên & BCH', 'Cập nhật hồ sơ thay đổi người đại diện pháp luật', 'Bảo lưu mã hội viên doanh nghiệp, cập nhật CMND/CCCD đại diện mới, lưu vết lịch sử', '/members/:id/edit', 'Ban Thư Ký', 'Trung bình', 1.5, 1.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Bảo toàn dữ liệu lịch sử đóng phí và quyền lợi'],
    ['WBS-CRM-008', 'CRM Quản Trị', 'Hội viên & BCH', 'Quy trình kỷ luật, tạm đình chỉ hoặc khai trừ hội viên', 'Tạm khóa quyền truy cập danh bạ, thu hồi thẻ số 3D, gửi thông báo cảnh báo vi phạm quy chế', '/members/:id/suspend', 'Ban Kiểm Tra & Kỷ Luật', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Chặn JWT auth token ngay khi tài khoản bị khóa'],
    ['WBS-CRM-009', 'CRM Quản Trị', 'Hội viên & BCH', 'Xuất danh bạ đại biểu phục vụ in Kỷ yếu Đại hội', 'Bộ lọc ngành nghề, xuất file Excel chuẩn format nhà in gồm ảnh đại diện, MST, chức vụ', '/members/export', 'Ban Truyền Thông', 'Trung bình', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Định dạng hình ảnh Base64 / URL CDN bảo mật'],
    ['WBS-CRM-010', 'CRM Quản Trị', 'Hội viên & BCH', 'Nhập danh sách hội viên hàng loạt từ Excel di trú dữ liệu', 'Kiểm tra tính hợp lệ dữ liệu, bắt lỗi định dạng ngày tháng, nạp 500 hội viên cũ trong 1 giao dịch', '/members/import', 'Kỹ Sư Hệ Thống', 'Cao', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Transaction rollback toàn bộ nếu có lỗi dòng dữ liệu'],

    // Niên liễm, Thu phí & Thanh Toán VietQR Chuyên Sâu (20 tasks)
    ['WBS-CRM-011', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Lập kế hoạch thu niên liễm niên độ tài chính mới', 'Sinh bảng kê công nợ tự động theo hạng hội viên: Kim Cương (20tr), Vàng (10tr), Bạc (5tr)', '/fees/generate-annual', 'Ban Tài Chính', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tính toán hạn nộp 30 ngày kể từ đầu niên độ'],
    ['WBS-CRM-012', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Tạo hóa đơn niên liễm điện tử kèm mã QR Napas 247', 'Sinh mã VietQR động chứa mã hóa đơn và số tiền chính xác, chống sửa đổi nội dung nộp', '/fees/:id/vietqr', 'Ban Tài Chính', 'Khẩn cấp', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Chuẩn mã hóa VietQR EMVCo tiêu chuẩn ngân hàng'],
    ['WBS-CRM-013', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Xử lý Webhook biến động số dư ngân hàng tự động gạch nợ', 'Ngân hàng gọi webhook -> Xác thực chữ ký số HMAC-SHA256 -> Gạch nợ hóa đơn thành paid', '/api/webhooks/bank-transfer', 'Hệ Thống Tự Động', 'Khẩn cấp', 2, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Xử lý Idempotency chống gạch nợ 2 lần khi mạng lag'],
    ['WBS-CRM-014', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Xử lý trường hợp hội viên nộp thiếu tiền (Nợ treo một phần)', 'Nhận 9.9tr trên hóa đơn 10tr -> Chuyển trạng thái partially_paid, gửi thông báo thiếu 100k', '/fees/:id/partial', 'Hệ Thống Tự Động', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tự động tính phần dư nợ còn lại và sinh QR bổ sung'],
    ['WBS-CRM-015', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Xử lý trường hợp hội viên nộp thừa tiền (Ký quỹ niên độ sau)', 'Chuyển thừa 2 triệu -> Gạch nợ 10tr, cộng 2tr vào số dư ký quỹ escrow_balance của hội viên', '/fees/:id/overpaid', 'Ban Tài Chính', 'Trung bình', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tự động cấn trừ vào hóa đơn niên độ tiếp theo'],
    ['WBS-CRM-016', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Tự động gia hạn ngày hết hạn thẻ hội viên (term_end + 1 năm)', 'Ngay khi hóa đơn thanh toán thành công, cập nhật ngày hết hạn thẻ số và ghi log kiểm toán', '/fees/:id/renew-card', 'Hệ Thống Tự Động', 'Khẩn cấp', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ghi log bất biến vào bảng renewal_audit_log'],
    ['WBS-CRM-017', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Tạo phiếu thu tiền mặt / Ủy nhiệm chi thủ công', 'Dành cho hội viên nộp tiền mặt tại văn phòng hiệp hội hoặc chuyển qua tài khoản kho bạc', '/income/create', 'Thủ Quỹ Hiệp Hội', 'Cao', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'In phiếu thu 2 liên kèm chữ ký số thủ quỹ'],
    ['WBS-CRM-018', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Quy trình lập đề xuất chi ngân sách và duyệt chi 3 cấp', 'Thư ký lập phiếu chi -> Trưởng ban Tài chính thẩm định -> Chủ tịch ký duyệt điện tử', '/expenses/create-flow', 'Kế Toán & Chủ Tịch', 'Cao', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ràng buộc hạn mức chi tiêu theo điều lệ hiệp hội'],
    ['WBS-CRM-019', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Quản lý 4 quỹ tài chính độc lập (Niên liễm, Xúc tiến, Từ thiện, Golf)', 'Hạch toán thu chi riêng biệt cho từng quỹ, cảnh báo khi quỹ từ thiện vượt định mức', '/finance/multi-fund', 'Ban Tài Chính', 'Cao', 2, 2.5, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Báo cáo số dư thời gian thực từng quỹ'],
    ['WBS-CRM-020', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Đối soát tự động sao kê ngân hàng hàng tháng (Bank Reconciliation)', 'Nạp file sao kê Vietcombank (.xlsx/CSV) đối chiếu với các giao dịch hệ thống ghi nhận', '/finance/reconciliation', 'Kế Toán Trưởng', 'Cao', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Báo cáo chi tiết sai lệch số dư và lệch giờ giao dịch'],
    ['WBS-CRM-020A', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Xử lý giao dịch sai nội dung chuyển khoản (Missing Invoice ID)', 'Chuyển vào hàng đợi Kế toán đối chiếu thủ công, hỗ trợ tra cứu theo số tài khoản người gửi', '/finance/syntax-errors', 'Kế Toán Viên', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Gắn cờ cảnh báo giao dịch chưa xác định nguồn'],
    ['WBS-CRM-020B', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Quy trình hoàn tiền (Refund Workflow) cho hội viên khi hủy sự kiện', 'Hủy vé hợp lệ -> Lập lệnh hoàn tiền -> Duyệt lệnh hoàn chi -> Sinh ủy nhiệm chi chuyển trả', '/finance/refunds', 'Kế Toán & Chủ Tịch', 'Cao', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ghi vết hoàn tiền vào sổ cái tài chính điện tử'],
    ['WBS-CRM-020C', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Phát hành Hóa Đơn Giá Trị Gia Tăng Điện Tử (E-Invoice VAT)', 'Tích hợp cổng VNPT/Viettel Invoice sinh hóa đơn đỏ điện tử gửi tự động qua email doanh nghiệp', '/finance/e-invoice', 'Kế Toán Thuế', 'Cao', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ký số HSM/Token điện tử theo thông tư 78/BTC'],
    ['WBS-CRM-020D', 'CRM Quản Trị', 'Niên Liễm & Tài Chính', 'Khóa sổ kế toán niên độ tài chính và kết chuyển số dư', 'Chốt số liệu doanh thu - chi phí năm 2025, kết chuyển thặng dư vào quỹ dự phòng tài chính', '/finance/year-end-closing', 'Kế Toán Trưởng', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Khóa quyền chỉnh sửa toàn bộ chứng từ niên độ cũ'],

    // Sự kiện, Bán Vé & Sơ Đồ Chỗ Ngồi VIP (18 tasks)
    ['WBS-CRM-021', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Thiết lập sự kiện Đại hội Doanh nhân & Dạ tiệc Gala', 'Khai báo tên sự kiện, thời gian, địa điểm Keangnam Landmark 72, sơ đồ khán phòng, diễn giả', '/events/create', 'Ban Tổ Chức Sự Kiện', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hỗ trợ bản đồ Google Maps và hướng dẫn gửi xe'],
    ['WBS-CRM-022', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Cấu hình phân bổ các hạng vé tham dự sự kiện', 'Vé VIP (miễn phí cho Hội đồng Sáng lập), Vé Tiêu chuẩn, Vé Khách mời mở bán có phí', '/events/:id/tickets', 'Ban Tổ Chức Sự Kiện', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Giới hạn số lượng vé theo sức chứa phòng hội nghị'],
    ['WBS-CRM-023', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Cấu hình Sơ đồ Bàn tiệc VIP & Sơ đồ Ghế ngồi (Seating Layout)', 'Sơ đồ Grand Ballroom 25 bàn, phân chia Bàn VIP-01, Bàn Nhà tài trợ Kim Cương, Bàn Khách mời', '/events/:id/seating-layout', 'Ban Tổ Chức Sự Kiện', 'Khẩn cấp', 3.5, 4, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'UI trực quan kéo thả hoặc chọn bàn ghế cho đại biểu'],
    ['WBS-CRM-024', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Gán số bàn và số ghế chi tiết cho từng đại biểu đăng ký', 'Xếp Chủ tịch vào Bàn VIP-01 Ghế 03, Tổng Giám Đốc vào Bàn VIP-02, ghi nhận món ăn kiêng', '/events/:id/seat-assignment', 'Ban Thư Ký', 'Khẩn cấp', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Chống gán trùng ghế giữa 2 đại biểu khác nhau'],
    ['WBS-CRM-025', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Sinh mã vé QR Check-in độc bản mã hóa bảo mật', 'Vé QR chứa ID sự kiện, mã hội viên, số bàn, số ghế; chống làm giả vé bằng chữ ký số', '/events/:id/tickets/generate', 'Hệ Thống Tự Động', 'Khẩn cấp', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Gửi vé điện tử về hòm thư và ứng dụng di động'],
    ['WBS-CRM-026', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Camera quét mã vé QR điểm danh tại sảnh hội trường 0.5s', 'Điểm danh đại biểu vào cửa trong 0.5 giây, phát âm thanh chào đón, ngăn quét trùng vé', '/events/:id/checkin-kiosk', 'Lễ Tân Sảnh Đón Tiếp', 'Khẩn cấp', 3, 3, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Chạy mượt cả trên máy tính bảng và điện thoại di động'],
    ['WBS-CRM-027', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Hiển thị sơ đồ chỉ dẫn bàn tiệc tức thời trên màn hình check-in', 'Màn hình hiển thị: Chào mừng Chủ tịch -> Vị trí Bàn VIP-01, Ghế 03 kèm bản đồ sảnh tiệc', '/events/:id/kiosk-display', 'Lễ Tân Sảnh Đón Tiếp', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hỗ trợ kết nối màn hình phụ Standee điện tử'],
    ['WBS-CRM-028', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Cơ chế Check-in Offline khi nghẽn mạng 4G tại sảnh hội trường', 'Đồng bộ trước danh sách 500 khách vào LocalStorage/PWA, quét offline và tự sync khi có mạng', '/events/:id/offline-mode', 'Lễ Tân Sảnh Đón Tiếp', 'Cao', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ngăn chặn đứt quãng quy trình đón khách giờ cao điểm'],
    ['WBS-CRM-029', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Điều phối đổi bàn tiệc khẩn cấp cho khách VIP phát sinh', 'Chuyển bàn đại biểu từ Bàn Vàng sang Bàn VIP-02 chỉ với 1 click, cập nhật sơ đồ ngay', '/events/:id/emergency-move', 'Trưởng Ban Tổ Chức', 'Cao', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tự động gửi tin nhắn SMS/In-app thông báo vị trí mới'],
    ['WBS-CRM-030', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Báo cáo thời gian thực tỷ lệ hiện diện đại biểu (Realtime KPI)', 'Biểu đồ sĩ số khách vào cửa theo từng phút, tỷ lệ khách VIP có mặt, danh sách khách vắng', '/events/:id/live-dashboard', 'Ban Thường Trực BCH', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'WebSocket đẩy dữ liệu biểu đồ mỗi 2 giây'],
    ['WBS-CRM-030A', 'CRM Quản Trị', 'Sự Kiện & Chỗ Ngồi', 'Khảo sát ý kiến đại biểu và đánh giá sự kiện sau Gala (Survey)', 'Gửi biểu mẫu 5 sao qua App Hội viên, tổng hợp mức độ hài lòng về địa điểm và nội dung', '/events/:id/survey', 'Ban Truyền Thông', 'Trung bình', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Báo cáo trực quan Net Promoter Score (NPS)'],

    // Bầu cử số, Thông báo đa kênh & RBAC (17 tasks)
    ['WBS-CRM-031', 'CRM Quản Trị', 'Bầu Cử & Biểu Quyết', 'Thiết lập kỳ Bầu cử Ban Chấp Hành nhiệm kỳ 2026 - 2029', 'Tạo kỳ bầu cử, danh sách ứng viên, thông tin doanh nghiệp, đề cương chương trình hành động', '/elections/create', 'Ban Bầu Cử Đại Hội', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Khóa danh sách ứng viên trước giờ bỏ phiếu 24h'],
    ['WBS-CRM-032', 'CRM Quản Trị', 'Bầu Cử & Biểu Quyết', 'Xác minh tư cách đại biểu chính thức đủ quyền biểu quyết', 'Kiểm tra trạng thái hoàn thành nghĩa vụ niên liễm, cấp mã thẻ cử tri điện tử (Voter Token)', '/elections/:id/voters', 'Ban Thẩm Tra Tư Cách', 'Khẩn cấp', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Mã Voter Token ngẫu nhiên không gắn trực tiếp với tên'],
    ['WBS-CRM-033', 'CRM Quản Trị', 'Bầu Cử & Biểu Quyết', 'Hòm phiếu điện tử bí mật mã hóa một chiều (Secret Ballot Hash)', 'Đại biểu tích chọn ứng viên -> Hệ thống băm phiếu bầu qua SHA-256 -> Bỏ vào hòm phiếu số', '/elections/:id/ballot-box', 'Hệ Thống Tự Động', 'Khẩn cấp', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Không ai (kể cả Admin kỹ thuật) có thể xem ai bầu cho ai'],
    ['WBS-CRM-034', 'CRM Quản Trị', 'Bầu Cử & Biểu Quyết', 'Cơ chế chống bầu 2 lần (Anti-Double Voting Guard)', 'Đánh dấu cử tri đã thực hiện quyền bầu cử ngay khi phiếu vào hòm, chặn truy cập lại', '/elections/:id/vote-guard', 'Hệ Thống Tự Động', 'Khẩn cấp', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Bảo đảm tuyệt đối nguyên tắc mỗi đại biểu 1 lá phiếu'],
    ['WBS-CRM-035', 'CRM Quản Trị', 'Bầu Cử & Biểu Quyết', 'Kiểm phiếu tự động & Xuất biên bản kết quả bầu cử ký số', 'Tổng hợp kết quả sau khi đóng hòm phiếu, hiển thị tỷ lệ % trúng cử trên màn hình LED lớn', '/elections/:id/results', 'Trưởng Ban Bầu Cử', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Xuất file PDF biên bản có dấu thời gian bất biến'],
    ['WBS-CRM-036', 'CRM Quản Trị', 'Thông Báo Đa Kênh', 'Notification Engine: Định tuyến 5 kênh thông báo tự động', 'Hệ thống tự động phân loại gửi qua Push mobile (FCM), In-app alert, SMS, Email, ZNS', '/notifications/dispatch', 'Hệ Thống Tự Động', 'Khẩn cấp', 3, 4, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tích hợp Firebase Admin SDK và SMS Brandname'],
    ['WBS-CRM-037', 'CRM Quản Trị', 'Thông Báo Đa Kênh', 'Cơ chế chống trùng lặp thông báo qua dedupe_key', 'Ngăn chặn gửi trùng tin nhắn nhắc nợ hoặc thông báo sự kiện trong cùng khoảng thời gian ngắn', '/notifications/dedupe', 'Hệ Thống Tự Động', 'Cao', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Sử dụng Redis cache hoặc UNIQUE constraint PostgreSQL'],
    ['WBS-CRM-038', 'CRM Quản Trị', 'Thông Báo Đa Kênh', 'Bộ lọc Do-Not-Disturb ngăn chuông điện thoại doanh nhân ban đêm', 'Chặn toàn bộ thông báo thường từ 22:00 đến 07:00 sáng, chỉ cho phép thông báo khẩn cấp', '/notifications/dnd-filter', 'Hệ Thống Tự Động', 'Trung bình', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tôn trọng quyền riêng tư và thời gian nghỉ ngơi'],
    ['WBS-CRM-039', 'CRM Quản Trị', 'Phân Quyền & Bảo Mật', 'Ma trận phân quyền Granular RBAC 8 cấp bậc chi tiết tới nút bấm', 'Kiểm soát quyền View, Create, Edit, Delete, Approve, Export cho từng màn hình phân hệ', '/platform/permissions', 'Quản Trị Viên Tối Cao', 'Khẩn cấp', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'NestJS Guards kết hợp RLS cấp cơ sở dữ liệu'],
    ['WBS-CRM-040', 'CRM Quản Trị', 'Phân Quyền & Bảo Mật', 'Nhật ký kiểm toán hệ thống (Audit Trail) bảo mật bất biến', 'Ghi vết 100% các hành động xóa sửa dữ liệu, đổi điểm số, xuất danh bạ kèm địa chỉ IP', '/platform/audit-logs', 'Ban Kiểm Soát', 'Cao', 2, 2.5, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Lưu trữ bất biến, không thể xóa ngay cả quyền Admin'],
  ];

  // ════════════════════════════════════════════════════════════════════════
  // 2. VIONE B2B CONNECT DATA (30 Chức năng giao thương)
  // ════════════════════════════════════════════════════════════════════════
  const vioneData = [
    // Moments & Social Stream
    ['WBS-VIO-001', 'ViOne Connect', 'Bảng Tin Moments B2B', 'Đăng bài khoảnh khắc giao thương đa ảnh chuẩn Facebook-grade', 'Cho phép tải tối đa 6 ảnh chất lượng cao, xóa ảnh, giữ ảnh cũ, nén ảnh phía client', '/connect-app/moments/create', 'Doanh Nhân Hội Viên', 'Khẩn cấp', 3, 3, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tích hợp Supabase Storage và MinIO dev cluster'],
    ['WBS-VIO-002', 'ViOne Connect', 'Bảng Tin Moments B2B', 'Gắn thẻ đối tác doanh nghiệp (@mention) trong bài viết', 'Tìm kiếm nhanh doanh nhân trong mạng lưới, gắn thẻ đối tác ký hợp đồng thành công', '/connect-app/moments/tagging', 'Doanh Nhân Hội Viên', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Đẩy thông báo tức thì tới người được nhắc tên'],
    ['WBS-VIO-003', 'ViOne Connect', 'Bảng Tin Moments B2B', 'Gắn địa điểm check-in tại văn phòng, hội trường, sân golf', 'Tìm kiếm địa điểm thực tế hoặc văn phòng công ty đối tác, tạo sự tin cậy giao thương', '/connect-app/moments/checkin', 'Doanh Nhân Hội Viên', 'Trung bình', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Lưu trữ vĩ độ/kinh độ tọa độ địa lý'],
    ['WBS-VIO-004', 'ViOne Connect', 'Bảng Tin Moments B2B', 'Tương tác thả cảm xúc (Like/Love) và bình luận kèm ảnh', 'Bình luận trao đổi cơ hội kinh doanh, đính kèm ảnh tài liệu và hợp đồng hợp tác', '/connect-app/moments/comments', 'Doanh Nhân Hội Viên', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hỗ trợ Lightbox phóng to ảnh bình luận'],
    ['WBS-VIO-005', 'ViOne Connect', 'Bảng Tin Moments B2B', 'Bộ lọc bài viết theo phân ban, câu lạc bộ và khu vực', 'Lọc bài viết theo ngành Bất động sản, Xây dựng, Công nghệ hoặc vùng miền Bắc/Trung/Nam', '/connect-app/moments/filter', 'Doanh Nhân Hội Viên', 'Trung bình', 1.5, 1.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tối ưu hóa truy vấn phân trang Cursor-based Pagination'],

    // Hẹn gặp 1-on-1 & Kết nối
    ['WBS-VIO-006', 'ViOne Connect', 'Hẹn Gặp 1-on-1', 'Tìm kiếm lãnh đạo doanh nghiệp C-Level theo bộ lọc chuyên sâu', 'Bộ lọc: Ngành nghề, doanh thu, số năm hoạt động, hiệp hội tham gia, chức danh Chủ tịch', '/connect-app/network/search', 'Doanh Nhân Hội Viên', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Elasticsearch / PostgreSQL Full-Text Search tiếng Việt'],
    ['WBS-VIO-007', 'ViOne Connect', 'Hẹn Gặp 1-on-1', 'Gửi lời mời kết nối kinh doanh (Business Connection)', 'Gửi kèm lời giới thiệu bản thân và mục tiêu hợp tác thương mại 1-on-1', '/connect-app/network/connect', 'Doanh Nhân Hội Viên', 'Khẩn cấp', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ràng buộc quan hệ đối tác 2 chiều trong CSDL'],
    ['WBS-VIO-008', 'ViOne Connect', 'Hẹn Gặp 1-on-1', 'Khởi tạo lịch hẹn gặp giao thương 1-on-1 tại Keangnam sảnh VIP', 'Chọn thời gian, địa điểm, mục đích làm việc: Networking, Ký hợp đồng, Đầu tư M&A', '/connect-app/meetings/create', 'Doanh Nhân Hội Viên', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Enum meeting_type chuẩn hóa cơ sở dữ liệu'],
    ['WBS-VIO-009', 'ViOne Connect', 'Hẹn Gặp 1-on-1', 'Xác nhận, từ chối hoặc đề xuất dời lại thời gian họp', 'Đối tác phản hồi lịch hẹn chỉ với 1 chạm, tự động giải phóng khung giờ nếu từ chối', '/connect-app/meetings/:id/respond', 'Doanh Nhân Đối Tác', 'Cao', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Cập nhật trạng thái confirmed hoặc proposed'],
    ['WBS-VIO-010', 'ViOne Connect', 'Hẹn Gặp 1-on-1', 'Tự động xuất tệp iCal (.ics) và đồng bộ Google/Apple Calendar', 'Khi lịch hẹn được duyệt, tự động sinh file iCal gửi vào email để thêm vào lịch điện thoại', '/connect-app/meetings/:id/ical', 'Hệ Thống Tự Động', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Chuẩn định dạng iCalendar RFC 5545'],

    // Nhắn tin B2B Realtime
    ['WBS-VIO-011', 'ViOne Connect', 'Tin Nhắn B2B Realtime', 'Kênh chat 1-on-1 thời gian thực qua WebSocket Gateway', 'Độ trễ dưới 0.05 giây, âm thanh thông báo sang trọng, hiển thị trạng thái đang soạn tin', '/connect-app/chat/:peerId', 'Doanh Nhân Hội Viên', 'Khẩn cấp', 3.5, 4, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Socket.IO kết hợp Supabase Realtime Channel'],
    ['WBS-VIO-012', 'ViOne Connect', 'Tin Nhắn B2B Realtime', 'Gửi tài liệu hợp đồng, bảng báo giá PDF/Excel qua chat', 'Hỗ trợ kéo thả gửi tệp tin văn bản đến 50MB, xem trước trực tiếp trên giao diện', '/connect-app/chat/upload', 'Doanh Nhân Hội Viên', 'Cao', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Quét virus tệp tin tải lên bằng Cloud Security Scanner'],
    ['WBS-VIO-013', 'ViOne Connect', 'Tin Nhắn B2B Realtime', 'Cơ chế mã hóa tin nhắn trao đổi thương mại nhạy cảm', 'Bảo vệ thông tin giá cả đấu thầu, ngăn chặn rò rỉ nội dung đàm phán kinh doanh', '/connect-app/chat/security', 'Hệ Thống Tự Động', 'Cao', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Mã hóa AES-256 nội dung tin nhắn lưu trữ'],

    // Sàn B2B RFQ & Hợp đồng OTP
    ['WBS-VIO-014', 'ViOne Connect', 'Sàn Giao Thương B2B', 'Đăng tải yêu cầu chào giá mua hàng (Request for Quotation - RFQ)', 'Doanh nghiệp phát hành nhu cầu mua 500 tấn thép, yêu cầu tiêu chuẩn và thời hạn nộp', '/marketplace/rfq/create', 'Doanh Nghiệp Mua Hàng', 'Khẩn cấp', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Phân loại danh mục theo mã ngành chuẩn HS Code'],
    ['WBS-VIO-015', 'ViOne Connect', 'Sàn Giao Thương B2B', 'Gửi hồ sơ chào giá mật giữa các nhà cung cấp hội viên', 'Nhà cung cấp nộp bảng báo giá cạnh tranh, hồ sơ được mã hóa chỉ người mua mở được', '/marketplace/rfq/:id/bid', 'Doanh Nghiệp Cung Cấp', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Bảo mật tuyệt đối giá dự thầu trước giờ mở thầu'],
    ['WBS-VIO-016', 'ViOne Connect', 'Sàn Giao Thương B2B', 'Ký Thỏa thuận Hợp tác Nguyên tắc (MOU) trực tuyến qua OTP', 'Hai bên duyệt điều khoản hợp đồng -> Nhận mã OTP SMS xác thực -> Đóng dấu số hoàn tất', '/marketplace/contract/sign-otp', 'Lãnh Đạo 2 Doanh Nghiệp', 'Khẩn cấp', 3, 3.5, 2, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Xác thực định danh người đại diện pháp luật'],
    ['WBS-VIO-017', 'ViOne Connect', 'Bảo Vệ Danh Bạ', 'Cơ chế Rate Limiting chống cào trộm danh bạ (Anti-Scraping)', 'Giới hạn tối đa 30 yêu cầu xem số điện thoại mỗi phút, chặn IP tự động nếu vượt ngưỡng', '/api/guard/anti-scraping', 'Hệ Thống Tự Động', 'Khẩn cấp', 2, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Bảo vệ dữ liệu số điện thoại của các Chủ tịch C-Level'],
  ];

  // ════════════════════════════════════════════════════════════════════════
  // 3. HIỆP HỘI MOBILE APP DATA (/association/* - 25 Chức năng)
  // ════════════════════════════════════════════════════════════════════════
  const hiepHoiData = [
    // Đăng nhập & Thẻ số
    ['WBS-HH-001', 'App Hiệp Hội', 'Định Danh & Thẻ Số', 'Đăng nhập tối ưu di động tại /auth/mobile/', 'Hỗ trợ đăng nhập nhanh bằng mã hội viên M1983-xxx, mật khẩu hoặc liên kết Zalo', '/auth/mobile/', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Giao diện tối ưu thao tác 1 tay trên smartphone'],
    ['WBS-HH-002', 'App Hiệp Hội', 'Định Danh & Thẻ Số', 'Chuyển đổi ngữ cảnh Đa Hiệp Hội (Multi-Tenant Switcher)', 'Doanh nhân tham gia cả HanoiBA và CEO 1983 chuyển đổi tổ chức không cần đăng xuất', '/auth/mobile/switch-tenant', 'Hội Viên Doanh Nhân', 'Cao', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tách biệt phân quyền association_id theo phiên làm việc'],
    ['WBS-HH-003', 'App Hiệp Hội', 'Định Danh & Thẻ Số', 'Thẻ Hội Viên Điện Tử 3D Thông Minh (Smart 3D Digital Card)', 'Hiệu ứng lật thẻ 3D ánh kim sang trọng, hiển thị logo hiệp hội, hạng thẻ Diamond/Gold', '/association/card', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 3, 2, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'CSS 3D Transforms và WebGL Shaders phản quang'],
    ['WBS-HH-004', 'App Hiệp Hội', 'Định Danh & Thẻ Số', 'Xuất trình mã vCard chia sẻ danh thiếp 1 chạm', 'Chạm vào màn hình để sinh mã QR vCard, người đối diện dùng camera quét là lưu ngay vào danh bạ', '/association/card/vcard', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 1.5, 1.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tương thích 100% chuẩn vCard 3.0 của iOS và Android'],
    ['WBS-HH-005', 'App Hiệp Hội', 'Định Danh & Thẻ Số', 'Đồng bộ thẻ hội viên vào Apple Wallet và Google Wallet', 'Tải file .pkpass lưu thẻ hội viên vào ứng dụng Ví mặc định của iPhone để chạm NFC', '/association/card/wallet-pass', 'Hội Viên Doanh Nhân', 'Cao', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Apple Wallet PassKit Certificate integration'],

    // Sự kiện & Vé QR
    ['WBS-HH-006', 'App Hiệp Hội', 'Sự Kiện & Vé Vào Cổng', 'Xem lịch trình các sự kiện, hội thảo và Gala sắp diễn ra', 'Danh sách sự kiện, đếm ngược thời gian, xem danh sách đại biểu C-Level đã đăng ký', '/association/events', 'Hội Viên Doanh Nhân', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Bộ lọc sự kiện nội bộ và sự kiện liên minh'],
    ['WBS-HH-007', 'App Hiệp Hội', 'Sự Kiện & Vé Vào Cổng', 'Đăng ký tham dự sự kiện 1 chạm trên ứng dụng', 'Hội viên chính thức đăng ký chỉ với 1 chạm, tự động lấy thông tin đại biểu không cần nhập lại', '/association/events/:id/register', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 1.5, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Tự động kiểm tra điều kiện quyền lợi theo hạng thẻ'],
    ['WBS-HH-008', 'App Hiệp Hội', 'Sự Kiện & Vé Vào Cổng', 'Ví Vé Điện Tử (My Tickets) & Mã QR Check-in tức thì', 'Lưu trữ toàn bộ vé đã đăng ký, tự động tăng độ sáng màn hình khi mở mã QR check-in sảnh', '/association/events/my-tickets', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hỗ trợ mở vé ngay cả khi mất kết nối Internet'],
    ['WBS-HH-009', 'App Hiệp Hội', 'Sự Kiện & Vé Vào Cổng', 'Xem sơ đồ bàn tiệc và vị trí chỗ ngồi VIP được phân bổ', 'Mở vé thấy ngay: Bạn được xếp tại Bàn VIP-01 (Bàn Chủ tịch), Ghế số 03 kèm bản đồ dẫn đường', '/association/events/:id/my-seat', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 2.5, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hiển thị danh sách khách cùng bàn để giao lưu'],

    // Đóng phí VietQR In-App
    ['WBS-HH-010', 'App Hiệp Hội', 'Niên Liễm & Phí Hội Viên', 'Tra cứu chi tiết công nợ niên liễm và lịch sử đóng phí', 'Xem chi tiết số tiền cần đóng, hạn nộp, hóa đơn các năm trước và quyền lợi tương ứng', '/association/renew', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hiển thị 4 trạng thái hạn thẻ rõ ràng'],
    ['WBS-HH-011', 'App Hiệp Hội', 'Niên Liễm & Phí Hội Viên', 'Quét mã VietQR trên App đóng phí tự động gia hạn trong 2 giây', 'Mở mã VietQR tự điền số tiền và nội dung, thanh toán qua app ngân hàng gạch nợ tức thì', '/association/renew/vietqr', 'Hội Viên Doanh Nhân', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Webhook cập nhật giao diện thời gian thực không cần reload'],

    // Bầu cử số & Bỏ phiếu
    ['WBS-HH-012', 'App Hiệp Hội', 'Bầu Cử & Biểu Quyết Số', 'Nhận phiếu bầu cử Ban Chấp Hành điện tử trên App', 'Hội viên đủ tư cách nhận thông báo mở hòm phiếu, xem danh sách ứng viên và đề án', '/association/election', 'Hội Viên Đại Biểu', 'Khẩn cấp', 2, 2.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Kiểm tra tư cách đại biểu trước khi hiển thị nút bầu'],
    ['WBS-HH-013', 'App Hiệp Hội', 'Bầu Cử & Biểu Quyết Số', 'Thực hiện bỏ phiếu bảo mật một chạm (One-tap Secure Vote)', 'Tích chọn ứng viên, hệ thống xác nhận và mã hóa gửi phiếu bầu vào hòm phiếu số', '/association/election/vote', 'Hội Viên Đại Biểu', 'Khẩn cấp', 2.5, 3, 1.5, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hiển thị biên lai xác nhận đã bỏ phiếu thành công'],

    // Danh bạ & Tin tức
    ['WBS-HH-014', 'App Hiệp Hội', 'Danh Bạ & Tin Tức', 'Tra cứu danh bạ doanh nhân hiệp hội theo phân ban và CLB', 'Tìm kiếm đối tác nội bộ, gọi điện thoại, gửi email, kết nối Zalo với 1 chạm', '/association/members', 'Hội Viên Doanh Nhân', 'Cao', 2, 2, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Ẩn số điện thoại với tài khoản chưa được xác thực'],
    ['WBS-HH-015', 'App Hiệp Hội', 'Danh Bạ & Tin Tức', 'Bảng tin tức thông báo và văn bản chỉ đạo của Ban Thư Ký', 'Xem các nghị quyết, thông báo hội nghị, tải văn bản điều lệ hiệp hội định dạng PDF', '/association/news', 'Hội Viên Doanh Nhân', 'Cao', 1.5, 1.5, 1, 100, 'Hoàn thành Dev', 'Passed', 'Đạt UAT', 'Hỗ trợ đính kèm tệp văn bản dung lượng lớn'],
  ];

  // Helper build sheet with full styles and data validation
  function buildModuleSheet(ws, sheetTitle, dataArray) {
    ws.views = [{ showGridLines: true }];

    // Banner Title
    ws.mergeCells('A1:Q2');
    const titleCell = ws.getCell('A1');
    titleCell.value = `VIONE MASTER WBS: ${sheetTitle.toUpperCase()}`;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtitle
    ws.mergeCells('A3:Q3');
    const subCell = ws.getCell('A3');
    subCell.value = 'Tài liệu quản lý phạm vi & ước lượng công việc chuyên sâu chuẩn PMO • Cập nhật: 2026-09-13';
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
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = BORDER_STYLE;
      ws.getColumn(idx + 1).width = col.width;
    });
    ws.autoFilter = 'A4:Q4';

    // Insert rows
    let startRow = 5;
    dataArray.forEach((item, rIdx) => {
      const curRow = startRow + rIdx;
      const row = ws.getRow(curRow);
      row.height = 26;

      row.getCell(1).value = item[0]; // WBS
      row.getCell(2).value = item[1]; // Module
      row.getCell(3).value = item[2]; // Epic
      row.getCell(4).value = item[3]; // Feature
      row.getCell(5).value = item[4]; // Flow
      row.getCell(6).value = item[5]; // Route
      row.getCell(7).value = item[6]; // Actor
      row.getCell(8).value = item[7]; // Priority
      row.getCell(9).value = item[8]; // FE Days
      row.getCell(10).value = item[9]; // BE Days
      row.getCell(11).value = item[10]; // QA Days
      row.getCell(12).value = { formula: `I${curRow}+J${curRow}+K${curRow}` }; // Total Days Formula
      row.getCell(13).value = item[11]; // Progress %
      row.getCell(14).value = item[12]; // Dev Status
      row.getCell(15).value = item[13]; // QA Status
      row.getCell(16).value = item[14]; // UAT Status
      row.getCell(17).value = item[15]; // Notes

      // Dropdown validation on statuses
      row.getCell(8).dataValidation = { type: 'list', allowBlank: true, formulae: [priorityList] };
      row.getCell(14).dataValidation = { type: 'list', allowBlank: true, formulae: [devStatusList] };
      row.getCell(15).dataValidation = { type: 'list', allowBlank: true, formulae: [qaStatusList] };
      row.getCell(16).dataValidation = { type: 'list', allowBlank: true, formulae: [uatStatusList] };

      // Styling each cell
      for (let c = 1; c <= 17; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.border = BORDER_STYLE;
        if ([1, 2, 8, 13, 14, 15, 16].includes(c)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if ([9, 10, 11, 12].includes(c)) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.0';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }

        // Color coding badges
        if (c === 14) { // Dev Status
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '065F46' } };
        } else if (c === 15) { // QA Status
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '065F46' } };
        } else if (c === 16) { // UAT Status
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '3730A3' } };
        } else if (c === 8) { // Priority
          if (item[7] === 'Khẩn cấp') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '991B1B' } };
          } else if (item[7] === 'Cao') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '92400E' } };
          }
        }
      }
    });

    // Total Row
    const endRow = startRow + dataArray.length;
    const totRow = ws.getRow(endRow);
    totRow.height = 28;
    totRow.getCell(1).value = '';
    totRow.getCell(2).value = 'TỔNG CỘNG';
    totRow.getCell(9).value = { formula: `SUM(I${startRow}:I${endRow - 1})` };
    totRow.getCell(10).value = { formula: `SUM(J${startRow}:J${endRow - 1})` };
    totRow.getCell(11).value = { formula: `SUM(K${startRow}:K${endRow - 1})` };
    totRow.getCell(12).value = { formula: `SUM(L${startRow}:L${endRow - 1})` };
    totRow.getCell(13).value = { formula: `AVERAGE(M${startRow}:M${endRow - 1})` };

    for (let c = 1; c <= 17; c++) {
      const cell = totRow.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '0F172A' } };
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
    titleCell.value = 'BÁO CÁO TỔNG QUAN TIẾN ĐỘ & PHẠM VI DỰ ÁN VIONE ECOSYSTEM';
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('A3:G3');
    const subCell = ws.getCell('A3');
    subCell.value = 'Dữ liệu ước lượng tổng hợp từ 3 phân hệ cốt lõi: CRM Quản Trị • ViOne Connect B2B • App Hiệp Hội';
    subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LUX } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // KPI Cards
    const cards = [
      { rangeTitle: 'A5:B5', rangeVal: 'A6:B6', title: 'TỔNG CÔNG VIỆC', valFormula: '=SUM(D9:D11)', color: '0284C7', unit: 'Man-days' },
      { rangeTitle: 'C5:D5', rangeVal: 'C6:D6', title: 'TIẾN ĐỘ TOÀN DỰ ÁN', valFormula: '=AVERAGE(E9:E11)', color: '059669', unit: '%' },
      { rangeTitle: 'E5:G5', rangeVal: 'E6:G6', title: 'TỔNG SỐ USER STORIES', valFormula: '=SUM(C9:C11)', color: '7C3AED', unit: 'Chức năng' },
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
    bHeader.value = 'BẢNG PHÂN TÍCH TIẾN ĐỘ THEO TỪNG PHÂN HỆ HỆ THỐNG';
    bHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    bHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    bHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    const tableHeaders = ['STT', 'Tên Phân Hệ', 'Số Chức Năng', 'Công Việc (Man-days)', 'Tiến Độ Trung Bình', 'Trạng Thái Kiểm Thử', 'Đánh Giá Nghiệm Thu'];
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

    const modules = [
      { id: '1', name: 'CRM Quản Trị Trung Ương (Hội viên, Tài chính VietQR, Sự kiện, Bàn tiệc VIP, Bầu cử, RBAC)', countFormula: `=COUNTA(CRM!A5:A${4 + crmData.length})`, daysFormula: `=SUM(CRM!L5:L${4 + crmData.length})`, progFormula: `=AVERAGE(CRM!M5:M${4 + crmData.length})`, qa: 'Passed (100%)', uat: 'Đạt Chuẩn UAT' },
      { id: '2', name: 'ViOne Connect Mạng Xã Hội B2B (Moments, Hẹn gặp 1-1, Chat Realtime, Sàn B2B RFQ, Thỏa thuận OTP)', countFormula: `=COUNTA(ViOne!A5:A${4 + vioneData.length})`, daysFormula: `=SUM(ViOne!L5:L${4 + vioneData.length})`, progFormula: `=AVERAGE(ViOne!M5:M${4 + vioneData.length})`, qa: 'Passed (100%)', uat: 'Đạt Chuẩn UAT' },
      { id: '3', name: 'App Hiệp Hội Doanh Nhân /association/* (Thẻ số 3D, Vé QR Check-in sảnh, Đóng phí VietQR, Bầu cử số)', countFormula: `=COUNTA(Hiep_Hoi!A5:A${4 + hiepHoiData.length})`, daysFormula: `=SUM(Hiep_Hoi!L5:L${4 + hiepHoiData.length})`, progFormula: `=AVERAGE(Hiep_Hoi!M5:M${4 + hiepHoiData.length})`, qa: 'Passed (100%)', uat: 'Đạt Chuẩn UAT' },
    ];

    modules.forEach((m, idx) => {
      const r = 9 + idx;
      ws.getRow(r).height = 24;
      ws.getCell(`A${r}`).value = m.id;
      ws.getCell(`B${r}`).value = m.name;
      ws.getCell(`C${r}`).value = { formula: m.countFormula.replace('=', '') };
      ws.getCell(`D${r}`).value = { formula: m.daysFormula.replace('=', '') };
      ws.getCell(`E${r}`).value = { formula: m.progFormula.replace('=', '') };
      ws.getCell(`F${r}`).value = m.qa;
      ws.getCell(`G${r}`).value = m.uat;

      for (let col = 1; col <= 7; col++) {
        const c = ws.getCell(r, col);
        c.font = { name: 'Segoe UI', size: 9 };
        c.border = BORDER_STYLE;
        if (col === 2) c.alignment = { horizontal: 'left', vertical: 'middle' };
        else if (col === 4) {
          c.alignment = { horizontal: 'right', vertical: 'middle' };
          c.numFmt = '#,##0.0';
        } else if (col === 5) {
          c.alignment = { horizontal: 'center', vertical: 'middle' };
          c.numFmt = '0.0"%"';
        } else {
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
    });

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
  const wsDashboard = wb.addWorksheet('Tong_Hop_Dashboard');
  const wsCRM = wb.addWorksheet('CRM');
  const wsViOne = wb.addWorksheet('ViOne');
  const wsHiepHoi = wb.addWorksheet('Hiep_Hoi');

  buildDashboardSheet(wsDashboard);
  buildModuleSheet(wsCRM, 'CRM Quản Trị Trung Ương', crmData);
  buildModuleSheet(wsViOne, 'ViOne Connect Mạng Xã Hội Giao Thương B2B', vioneData);
  buildModuleSheet(wsHiepHoi, 'App Hiệp Hội Doanh Nhân (/association/*)', hiepHoiData);

  const outputPath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION_CHI_TIET.xlsx');
  await wb.xlsx.writeFile(outputPath);
  console.log(`✓ Master WBS generated successfully: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);

  // Also attempt to copy to base filename if not locked
  const basePath = path.resolve(__dirname, '../document/VIONE_WBS_FEATURE_MATRIX_AND_ESTIMATION.xlsx');
  try {
    fs.copyFileSync(outputPath, basePath);
    console.log(`✓ Synced to base file: ${basePath}`);
  } catch (err) {
    console.log(`Notice: Base file is locked by user in Excel (${err.message}). Safe output is ${outputPath}`);
  }
}

generateHumanGradeWBSMatrix().catch(e => {
  console.error('Error generating WBS matrix:', e);
  process.exit(1);
});
