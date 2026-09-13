const fs = require('fs');
const content = fs.readFileSync('MEMORY.md', 'utf8');

const section = `
### 25.12. Chuẩn Hóa Tiến Độ Dự Án Trung Thực & Tái Cấu Trúc Tài Liệu Hướng Dẫn Sử Dụng (Word DOCX & Markdown)
- **Bối cảnh & Chỉ đạo của Ban Lãnh Đạo**:
  - Không chấp nhận đánh giá 'Pass' hay '100% Hoàn thành' giả tạo cho các tính năng phụ thuộc vào API bên thứ 3 (External 3rd-Party APIs) khi thực tế chưa liên kết.
  - Phân định rành mạch 3 hệ thống/phân hệ: **1. Hệ Thống CRM Quản Trị**, **2. App Hiệp Hội Doanh Nghiệp (CLB Doanh Nhân CEO 1983)**, **3. App Mạng Xã Hội Giao Thương ViOne Connect**.
  - Chi tiết hóa toàn bộ các chức năng con (sub-features), không ghi gộp sơ sài (128 chức năng con).
  - Thông tin nhân sự & mốc thời gian: Người thực hiện: \`Phạm Văn Vũ\`, Ngày bắt đầu nâng cấp: \`11/09/2026\`, Ngày dự kiến hoàn thành: để trống (blank), bỏ cột 'Sẵn sàng Go-live'.
  - Biên dịch file Word Hướng dẫn sử dụng (\`document/tai-lieu-huong-dan-su-dung.docx\`) chuyên nghiệp: Trang bìa trang trọng, phân trang mục lục, Header/Footer (Trang X / Y), font Times New Roman, cỡ chữ chuẩn 13pt, căn lề Justified (căn đều 2 bên).

- **Chi tiết hiện trạng kỹ thuật các API bên ngoài được cập nhật trung thực 100%**:
  1. *Thanh toán VietQR & Ngân hàng*: Giao diện app đã sinh mã VietQR chuẩn chứa STK, số tiền và mã hóa đơn. Tuy nhiên **CHƯA liên kết Open API ngân hàng** và **CHƯA có Webhook tự động gạch nợ**. Luồng thanh toán tự động **chưa thông** -> Ban Kế toán bắt buộc phải đối soát sao kê thực tế và bấm nút duyệt gạch nợ thủ công trong CRM (\`/fees\`).
  2. *Đăng nhập Google & Apple (Google OAuth / Apple Sign-In)*: Giao diện nút bấm đã có, nhưng **CHƯA cấu hình Google Cloud Console OAuth Client ID** và **Apple Developer Sign in with Apple Services ID**. Đăng nhập thực tế qua SĐT/Email/Mật khẩu hoặc OTP dev.
  3. *Cuộc họp & Đặt phòng họp*: Mới có form đặt lịch phòng họp nội bộ lưu vào CSDL. **CHƯA tích hợp API cuộc họp trực tuyến bên ngoài** (Zoom API / Google Meet API).
  4. *Bản đồ chỉ đường*: Mới nhúng iframe bản đồ mẫu, **CHƯA tích hợp Google Maps Platform API SDK Key** chính thức.
  5. *SMS OTP & Push Notification*: Đang dùng mã OTP kiểm thử nội bộ (bypass), **CHƯA kết nối tổng đài viễn thông SMS Brandname** (eSMS/SpeedSMS/Twilio). Bản iOS chưa upload chứng chỉ APNs Auth Key (.p8) lên Apple Developer.

- **Kết quả biên dịch & Tài liệu xuất xưởng**:
  - \`document/TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE_MOI.xlsx\` (và file đích \`TIEN_DO_CONG_VIEC_TOAN_DIEN_VIONE.xlsx\`):
    * Sheet 1: Dashboard Tổng Quan Dự Án & Cảnh báo đỏ về các API bên thứ 3.
    * Sheet 2: Bảng theo dõi 128 chức năng con chi tiết, Người thực hiện \`Phạm Văn Vũ\`, Ngày bắt đầu \`11/09/2026\`, Ngày dự kiến để trống, cột Tích hợp API ngoài.
    * Sheet 3: Danh mục kiểm toán 9 dịch vụ API bên thứ 3 chi tiết.
  - \`document/tai-lieu-huong-dan-su-dung.docx\`: File Word định dạng chuẩn công văn, font Times New Roman 13pt, căn lề Justified, trang bìa, mục lục, phân trang Footer tự động.
  - \`document/tai-lieu-huong-dan-su-dung.md\`: Đồng bộ 100% nội dung với file Word.
`;

fs.writeFileSync('MEMORY.md', content.trim() + '\n' + section);
console.log('MEMORY.md updated successfully.');
