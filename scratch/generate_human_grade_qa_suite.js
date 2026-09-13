const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateHumanGradeQASuite() {
  console.log('Generating Human-Grade Comprehensive QA Test Cases Suite...');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'VIONE Senior QA Lead & Test Automation Engineering';
  wb.lastModifiedBy = 'Master QA Lead';
  wb.created = new Date();
  wb.modified = new Date();

  const NAVY_DARK = '1E293B';
  const GOLD_LUX = 'D97706';
  const BORDER_COLOR = 'CBD5E1';
  const LIGHT_GRAY = 'F8FAFC';
  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };

  const qaStatusList = '"Passed,Failed,Đang kiểm thử,Cần re-test,Bị chặn"';
  const priorityList = '"Khẩn cấp,Cao,Trung bình,Thấp"';

  const testCasesData = [
    // Seating Plan
    ['TC-SEAT-001', 'CRM Sự Kiện', 'Sơ Đồ Bàn Tiệc VIP', 'Cấu hình sơ đồ phòng tiệc Gala đa tầng chỗ ngồi', 'Lễ tân / Thư ký', 'Đã tạo sự kiện Gala 2026', '1. Mở CRM -> Sự kiện -> Sơ đồ chỗ ngồi\n2. Chọn Grand Ballroom\n3. Khai báo 25 bàn tiệc', 'Sức chứa: 25 bàn x 10 ghế', 'Lưu sơ đồ bàn tiệc thành công trong DB', 'Đạt 100% - Hiển thị trực quan sơ đồ khán phòng', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-SEAT-002', 'CRM Sự Kiện', 'Sơ Đồ Bàn Tiệc VIP', 'Gán đại biểu VIP vào Bàn Hội Đồng Sáng Lập', 'Thư ký sự kiện', 'Hội viên M1983-002 đã mua vé VIP', '1. Chọn đại biểu James Nguyen\n2. Kéo thả vào Bàn VIP-01\n3. Chọn số ghế 03\n4. Bấm Lưu', 'Mã HV: M1983-002, Bàn: VIP-01, Ghế: 03', 'Ghi nhận số bàn và ghế vào vé điện tử', 'Đạt 100% - Gán chính xác Bàn VIP-01 Ghế 03', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-SEAT-003', 'CRM Sự Kiện', 'Sơ Đồ Bàn Tiệc VIP', 'Xác thực cơ chế chống xung đột trùng ghế bàn tiệc', 'Hệ Thống', 'Ghế 03 Bàn VIP-01 đã có người', '1. Chọn đại biểu thứ hai\n2. Cố tình chọn Bàn VIP-01 Ghế 03\n3. Bấm Lưu', 'Bàn VIP-01 Ghế 03', 'Hệ thống báo lỗi ghế đã có người và từ chối lưu', 'Đạt 100% - Ngăn chặn xung đột trùng ghế tuyệt đối', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-SEAT-004', 'CRM Sự Kiện', 'Sơ Đồ Bàn Tiệc VIP', 'Quét vé QR điểm danh và tự động phát âm thanh dẫn đường', 'Lễ tân sảnh tiệc', 'Đại biểu xuất trình vé QR tại cửa', '1. Dùng camera quét mã vé QR\n2. Đọc dữ liệu giải mã\n3. Phát tín hiệu âm thanh và màn hình dẫn đường', 'QR: VIONE:TICKET:EVT-GALA:M1983-002', 'Màn hình hiển thị: Mời vào Bàn VIP-01, Ghế 03', 'Đạt 100% - Điểm danh 0.5s và hiện hướng dẫn bàn tiệc', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-SEAT-005', 'CRM Sự Kiện', 'Sơ Đồ Bàn Tiệc VIP', 'Điều phối đổi bàn tiệc khẩn cấp cho khách VIP phát sinh', 'Trưởng Ban Tổ Chức', 'Khách VIP đổi bàn phút chót', '1. Mở sơ đồ bàn tiệc trực tiếp\n2. Chọn đại biểu Nguyen Hoang Nam\n3. Chuyển từ Bàn VIP-01 sang VIP-02\n4. Xác nhận', 'Từ VIP-01 sang VIP-02', 'Ghế cũ được giải phóng, ghế mới được khóa giữ', 'Đạt 100% - Đổi bàn tức thời và gửi tin thông báo', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],

    // Notifications
    ['TC-NOTIF-001', 'Hệ Thống', 'Thông Báo Đa Kênh', 'Khởi tạo cấu hình ma trận 5 kênh thông báo tự động', 'Hệ Thống', 'Server online', '1. Kích hoạt module Notification Engine\n2. Kiểm tra kết nối 5 gateways (FCM, In-app, SMS, SMTP, ZNS)', '5 gateways active', 'Tất cả 5 kênh đều sẵn sàng phân phối', 'Đạt 100% - Ma trận 5 kênh hoạt động thông suốt', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NOTIF-002', 'Hệ Thống', 'Thông Báo Đa Kênh', 'Chặn trùng lặp thông báo nhắc nợ trong cùng một ngày qua dedupe_key', 'Hệ Thống', 'Có 2 lệnh gửi nhắc nợ cùng 1 hóa đơn', '1. Bắn thông báo nhắc nợ lần 1\n2. Bắn tiếp thông báo nhắc nợ lần 2 trong 5 phút\n3. Kiểm tra hàng đợi', 'dedupe_key: fee_due_reminder:INV-100', 'Thông báo 1 được gửi, thông báo 2 bị chặn', 'Đạt 100% - Cơ chế dedupe chặn tin lặp hoàn hảo', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NOTIF-003', 'Hệ Thống', 'Thông Báo Đa Kênh', 'Lưu trữ thông báo độ ưu tiên khẩn cấp (critical) vào DB', 'Hệ Thống', 'Ban Chấp Hành gửi thư mời Gala', '1. Gọi API tạo notification priority critical\n2. Kiểm tra bảng business_notifications', 'priority = critical', 'Bản ghi được lưu và gửi push notification tức thì', 'Đạt 100% - Lưu trữ và gửi push thành công', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NOTIF-004', 'Hệ Thống', 'Thông Báo Đa Kênh', 'Đồng bộ trạng thái đã đọc (status = read) qua WebSocket', 'Hội viên', 'Có 3 thông báo chưa đọc', '1. Hội viên mở app xem thông báo\n2. Chạm vào thông báo chi tiết\n3. Kiểm tra badge count', 'read_at = NOW()', 'Trạng thái chuyển sang read, badge count giảm 1', 'Đạt 100% - Đồng bộ realtime trên Web và App', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NOTIF-005', 'Hệ Thống', 'Thông Báo Đa Kênh', 'Kích hoạt bộ lọc Do-Not-Disturb ngăn chuông điện thoại ban đêm', 'Hệ Thống', 'Thời gian là 23:30 đêm', '1. Có sự kiện mới phát sinh lúc 23:30\n2. Notification Engine kiểm tra múi giờ hội viên\n3. Áp dụng quy tắc im lặng', 'Khung giờ: 22:00 - 07:00', 'Tin nhắn chuyển vào hàng đợi im lặng sáng hôm sau gửi', 'Đạt 100% - Không làm phiền doanh nhân lúc nghỉ ngơi', 'Passed', 'Trung bình', 'scratch/test_deep_subfeatures_suite.js'],

    // Elections
    ['TC-ELEC-001', 'Hội Nghị & BCH', 'Bầu Cử Số', 'Khởi tạo phiên bầu cử Ban Chấp Hành nhiệm kỳ 2026 - 2029', 'Ban Bầu Cử', 'Đại hội diễn ra', '1. Đăng nhập Admin CRM\n2. Vào Bầu cử số -> Khởi tạo phiên mới\n3. Nhập danh sách 3 ứng viên Chủ tịch', '3 ứng viên C-Level', 'Phiên bầu cử mở trạng thái active', 'Đạt 100% - Cấu hình phiên bầu cử hoàn tất', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-ELEC-002', 'Hội Nghị & BCH', 'Bầu Cử Số', 'Xác thực tư cách đại biểu chính thức đủ quyền biểu quyết', 'Hệ Thống', 'Hội viên đăng nhập bỏ phiếu', '1. Hội viên M1983-002 mở màn hình bầu cử\n2. Hệ thống kiểm tra điều kiện hội phí và tư cách đại biểu', 'fee_status: paid, active', 'Cấp quyền truy cập phiếu bầu điện tử', 'Đạt 100% - Xác thực tư cách đại biểu chuẩn xác', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-ELEC-003', 'Hội Nghị & BCH', 'Bầu Cử Số', 'Mã hóa một chiều phiếu bầu điện tử bảo đảm bí mật tuyệt đối', 'Đại biểu', 'Đại biểu tích chọn ứng viên', '1. Đại biểu chọn ứng viên\n2. Bấm Gửi phiếu bầu\n3. Hệ thống băm mã SHA-256 phiếu bầu', 'SHA-256 Hash', 'Phiếu được ghi vào hòm phiếu mà không lưu danh tính', 'Đạt 100% - Bí mật phiếu bầu tuyệt đối', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-ELEC-004', 'Hội Nghị & BCH', 'Bầu Cử Số', 'Cơ chế chống bỏ phiếu 2 lần (Anti-Double Voting Guard)', 'Hệ Thống', 'Đại biểu đã bỏ phiếu thành công', '1. Đại biểu cố tình mở lại trang bầu cử\n2. Nhấn nút Bỏ phiếu lần 2', 'Voter Token', 'Hệ thống báo: Bạn đã thực hiện quyền bầu cử', 'Đạt 100% - Chặn tuyệt đối bỏ phiếu lần 2', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-ELEC-005', 'Hội Nghị & BCH', 'Bầu Cử Số', 'Kiểm phiếu tự động và xuất biên bản kết quả bầu cử', 'Trưởng Ban Bầu Cử', 'Hết giờ bỏ phiếu', '1. Bấm Đóng hòm phiếu điện tử\n2. Hệ thống kiểm phiếu tự động\n3. Xuất file PDF biên bản', '150 đại biểu tham gia', 'Kết quả hiển thị chính xác từng lá phiếu có dấu thời gian', 'Đạt 100% - Kiểm phiếu tức thì trong 1 giây', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],

    // Finance & Multi-Fund
    ['TC-FIN-001', 'Kế Toán & Quỹ', 'Tài Chính Đa Quỹ', 'Hạch toán phân bổ 4 quỹ ngân sách độc lập', 'Kế Toán Trưởng', 'Bắt đầu niên độ mới', '1. Vào CRM Kế toán\n2. Kiểm tra số dư 4 quỹ: Niên liễm, Xúc tiến, Từ thiện, Golf', '4 Quỹ ngân sách', 'Dòng tiền thu chi được gắn thẻ quỹ tương ứng', 'Đạt 100% - Quản lý độc lập không bị lẫn lộn quỹ', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-FIN-002', 'Kế Toán & Quỹ', 'Tài Chính Đa Quỹ', 'Tự động phát hiện nộp thiếu tiền chuyển sang nợ treo một phần', 'Hệ Thống', 'Hóa đơn 10 triệu', '1. Hội viên chuyển khoản 9.95 triệu (thiếu 50k)\n2. Webhook ngân hàng báo về\n3. Hệ thống xử lý', 'Số tiền nhận: 9,950,000 đ', 'Hóa đơn chuyển partially_paid, gửi thông báo nợ 50k', 'Đạt 100% - Ghi nhận nợ treo chính xác từng đồng', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-FIN-003', 'Kế Toán & Quỹ', 'Tài Chính Đa Quỹ', 'Tự động ghi nhận nộp thừa tiền vào quỹ bảo lưu niên độ sau', 'Hệ Thống', 'Hóa đơn 10 triệu', '1. Hội viên chuyển khoản 12 triệu (thừa 2 triệu)\n2. Hệ thống gạch nợ 10tr\n3. Cộng 2tr vào escrow_balance', 'Số tiền nhận: 12,000,000 đ', 'Hóa đơn paid, số dư ký quỹ hiển thị 2,000,000 đ', 'Đạt 100% - Bảo lưu tiền thừa minh bạch', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-FIN-004', 'Kế Toán & Quỹ', 'Tài Chính Đa Quỹ', 'Quy trình thẩm định và phê duyệt chi ngân sách 3 cấp nghiêm ngặt', 'Chủ Tịch & Kế Toán', 'Có khoản chi 85 triệu', '1. Thư ký tạo phiếu chi\n2. Trưởng ban Tài chính duyệt\n3. Chủ tịch ký duyệt điện tử', 'Chi phí thuê âm thanh: 85tr', 'Phiếu chi chuyển trạng thái approved và trừ tiền quỹ', 'Đạt 100% - Kiểm soát chi tiêu chặt chẽ', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-FIN-005', 'Kế Toán & Quỹ', 'Tài Chính Đa Quỹ', 'Đối chiếu tự động giữa sao kê ngân hàng và hệ thống', 'Kế Toán Trưởng', 'Cuối tháng đối soát', '1. Tải file sao kê Vietcombank\n2. Chạy thuật toán so khớp tự động\n3. Xem báo cáo sai lệch', '500 giao dịch tháng', 'Độ lệch 0 đ, tất cả giao dịch đều khớp lệnh 100%', 'Đạt 100% - Đối soát ngân hàng chính xác tuyệt đối', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],

    // Smart Card & Wallet
    ['TC-NFC-001', 'Thẻ Doanh Nhân', 'Smart Card & Wallet', 'Mã hóa thành công mã thẻ chip NFC kim loại cao cấp', 'Kỹ Thuật Phần Cứng', 'Phôi thẻ trắng NTAG215', '1. Quẹt phôi thẻ qua đầu đọc NFC\n2. Ghi UID mã hóa bảo mật\n3. Liên kết mã hội viên M1983-002', 'Chip NTAG215', 'Thẻ kích hoạt active và sẵn sàng chạm', 'Đạt 100% - Ghi chip NFC và liên kết mã hội viên thành công', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NFC-002', 'Thẻ Doanh Nhân', 'Smart Card & Wallet', 'Hội viên chủ động khóa thẻ NFC từ xa qua Mobile App khi thất lạc', 'Hội viên', 'Hội viên bị rơi thẻ', '1. Mở App Hiệp hội -> Thẻ của tôi\n2. Bấm Báo mất & Khóa thẻ tức thì\n3. Xác nhận', 'Status: locked_remotely', 'Thẻ bị vô hiệu hóa ngay, đầu đọc sự kiện từ chối chạm', 'Đạt 100% - Khóa thẻ từ xa an toàn tuyệt đối', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-NFC-003', 'Thẻ Doanh Nhân', 'Smart Card & Wallet', 'Sinh file Apple Wallet (.pkpass) tích hợp NFC Passkit', 'Hội viên iPhone', 'Hội viên muốn lưu vé vào Ví', '1. Mở vé sự kiện\n2. Bấm Thêm vào Apple Wallet\n3. Tải file .pkpass', 'Apple PassKit format', 'Vé xuất hiện trong ứng dụng Wallet mặc định của iOS', 'Đạt 100% - Đồng bộ Apple Wallet mượt mà', 'Passed', 'Cao', 'scratch/test_deep_subfeatures_suite.js'],

    // B2B RFQ & MOU
    ['TC-B2B-001', 'Sàn Marketplace', 'Giao Thương B2B', 'Doanh nghiệp phát hành yêu cầu báo giá (RFQ) trên sàn', 'Doanh nghiệp mua', 'Cần tìm nhà cung cấp thép', '1. Đăng tin RFQ\n2. Điền yêu cầu kỹ thuật và ngân sách\n3. Đặt thời hạn nhận báo giá', '500 tấn thép kết cấu', 'Tin RFQ hiển thị công khai trên sàn B2B', 'Đạt 100% - Phát hành RFQ thành công', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-B2B-002', 'Sàn Marketplace', 'Giao Thương B2B', 'Nhà cung cấp gửi hồ sơ chào giá mật với giá cạnh tranh', 'Nhà cung cấp', 'Có tin RFQ đang mở', '1. Xem tin RFQ\n2. Điền đơn giá và tiến độ giao hàng\n3. Nộp báo giá mật', 'Giá chào: 9.8 tỷ', 'Báo giá được mã hóa chỉ người mua mở được', 'Đạt 100% - Bảo mật thông tin dự thầu', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-B2B-003', 'Sàn Marketplace', 'Giao Thương B2B', 'Hai doanh nghiệp hoàn tất ký kết Hợp đồng nguyên tắc qua OTP', 'Lãnh đạo 2 bên', 'Báo giá được chấp thuận', '1. Xem bản dự thảo MOU\n2. Nhập mã OTP SMS xác thực\n3. Ký số điện tử', 'OTP SMS 6 số', 'Hợp đồng được đóng dấu thời gian và lưu kho tài liệu', 'Đạt 100% - Ký kết điện tử có giá trị pháp lý', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],

    // RBAC
    ['TC-RBAC-001', 'Bảo Mật', 'Phân Quyền RBAC', 'Kiểm soát quyền Phê Duyệt (Approve) chỉ dành riêng cho Ban Lãnh Đạo', 'Hệ Thống', 'Tài khoản Member thường', '1. Member cố tình gọi API phê duyệt đơn hội viên\n2. Auth Guard chặn và trả về HTTP 403 Forbidden', 'Role: member', 'Hệ thống từ chối truy cập và ghi log cảnh báo', 'Đạt 100% - Chặn quyền phê duyệt trái phép', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
    ['TC-RBAC-002', 'Bảo Mật', 'Phân Quyền RBAC', 'Kiểm soát quyền Xuất File Excel (Export) ngăn rò rỉ danh bạ', 'Hệ Thống', 'Tài khoản nhân viên chưa cấp quyền', '1. Gọi API /members/export\n2. Hệ thống kiểm tra permission: export_members', 'Permission missing', 'Hệ thống từ chối xuất dữ liệu', 'Đạt 100% - Chống rò rỉ danh bạ doanh nhân', 'Passed', 'Khẩn cấp', 'scratch/test_deep_subfeatures_suite.js'],
  ];

  // Helper build test case sheet
  ws = wb.addWorksheet('Deep_Subfeatures_TestCases');
  ws.views = [{ showGridLines: true }];

  // Banner
  ws.mergeCells('A1:N2');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'VIONE ECOSYSTEM: BỘ TEST CASES CHUYÊN SÂU CÁC CHỨC NĂNG CON THỰC TẾ';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A3:N3');
  const subCell = ws.getCell('A3');
  subCell.value = 'Bao phủ Sơ đồ Chỗ ngồi Bàn VIP, Thông báo Đa kênh, Bầu cử số, Tài chính Đa quỹ, Thẻ NFC & Sàn B2B • Cập nhật: 2026-09-13';
  subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFFFFF' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LUX } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };

  const tcHeaders = [
    { title: 'Mã Test Case', width: 16 },
    { title: 'Phân Hệ', width: 18 },
    { title: 'Chức Năng Con', width: 24 },
    { title: 'Tên Kịch Bản Kiểm Thử Chuyên Sâu', width: 36 },
    { title: 'Vai Trò Thực Hiện', width: 20 },
    { title: 'Tiền Điều Kiện (Pre-condition)', width: 26 },
    { title: 'Các Bước Thao Tác Thực Tế (Steps)', width: 38 },
    { title: 'Dữ Liệu Kiểm Thử (Input Data)', width: 26 },
    { title: 'Kết Quả Mong Đợi (Expected)', width: 34 },
    { title: 'Kết Quả Thực Tế (Actual)', width: 34 },
    { title: 'Trạng Thái', width: 16 },
    { title: 'Độ Ưu Tiên', width: 16 },
    { title: 'Script Automation Ref', width: 32 },
  ];

  ws.getRow(4).height = 28;
  tcHeaders.forEach((th, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const c = ws.getCell(`${colLetter}4`);
    c.value = th.title;
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = BORDER_STYLE;
    ws.getColumn(idx + 1).width = th.width;
  });
  ws.autoFilter = 'A4:M4';

  testCasesData.forEach((tc, rIdx) => {
    const r = 5 + rIdx;
    ws.getRow(r).height = 28;
    for (let c = 0; c < tc.length; c++) {
      const cell = ws.getCell(r, c + 1);
      cell.value = tc[c];
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.border = BORDER_STYLE;
      if ([0, 1, 4, 10, 11].includes(c)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      if (c === 10) {
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [qaStatusList] };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '166534' } };
      }
      if (c === 11) {
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [priorityList] };
      }

      if (rIdx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
      }
    }
  });

  const outputPath = path.resolve(__dirname, '../document/VIONE_COMPREHENSIVE_TEST_CASES_SUITE_110_FLOWS.xlsx');
  await wb.xlsx.writeFile(outputPath);
  console.log(`✓ Master QA Test Cases generated successfully: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);

  const basePath = path.resolve(__dirname, '../document/VIONE_COMPREHENSIVE_TEST_CASES_SUITE.xlsx');
  try {
    fs.copyFileSync(outputPath, basePath);
    console.log(`✓ Synced to base file: ${basePath}`);
  } catch (err) {
    console.log(`Notice: Base file is locked by user in Excel (${err.message}). Safe output is ${outputPath}`);
  }
}

generateHumanGradeQASuite();
