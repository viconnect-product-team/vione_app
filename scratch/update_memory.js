const fs = require('fs');
const path = require('path');

const memPath = path.join(__dirname, '..', 'MEMORY.md');
let mem = fs.readFileSync(memPath, 'utf8');
const target = '### 15.12 Chuẩn Hóa Tài Liệu Đề Xuất Giao Diện App CLB Doanh Nhân CEO 1983';
const idx = mem.indexOf(target);

if (idx !== -1) {
  const newSection = `### 15.12 Chuẩn Hóa Hồ Sơ Thiết Kế App CLB Doanh Nhân CEO 1983: 3 Màn Hình Cốt Lõi (Trang Chủ, Gắn Kết, Cá Nhân) (15/09/2026)
- **Tập tin xuất bản chính thức**:
  - Đường dẫn tài liệu: \`scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf\` (3.63 MB, 8 trang A4 chuẩn).
  - Bản sao lưu trữ Artifacts: \`C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\74644533-8bb8-4b29-a589-3d8714601888\\DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf\`.
  - Mã nguồn dựng tài liệu siêu nét: \`scratch/build_ultimate_sharp_pdf.js\`.
- **Cấu trúc 8 trang A4 chuẩn mực**:
  - **Trang 1**: Trang bìa chính thức chuẩn nhận diện thương hiệu CEO 1983.
  - **Trang 2**: Bản sắc thương hiệu CEO 1983 & Bảng ánh xạ hệ thống tính năng ứng dụng (Header, Trang chủ, Giao thương B2B, Gắn kết, Cá nhân, Menu đáy).
  - **Trang 3**: Phương án 1 (Classic Navy & Gold) - Màn 1: Trang chủ hội viên (khung mockup lớn 100x234mm, thuyết minh 5 điểm đặc trưng).
  - **Trang 4**: Phương án 1 (Classic Navy & Gold) - Màn 2: Gắn kết (Tin nhắn & Hội thoại) & Màn 3: Cá nhân (Hồ sơ Doanh nhân B2B).
  - **Trang 5**: Phương án 2 (Digital Sapphire Tech) - Màn 1: Trang chủ hội viên (tinh thể 3D đa diện, viền cyan công nghệ).
  - **Trang 6**: Phương án 2 (Digital Sapphire Tech) - Màn 2: Gắn kết Sapphire & Màn 3: Cá nhân Kỹ thuật số.
  - **Trang 7**: Phương án 3 (B2B Commerce Focus) - Màn 1: Trang chủ hội viên (thiết kế phẳng tối giản, nút cam nhiệt huyết).
  - **Trang 8**: Phương án 3 (B2B Commerce Focus) - Màn 2: Gắn kết B2B & Màn 3: Cá nhân Thực chiến + Khối ký duyệt nghiệm thu trang trọng ở chân trang.
- **Bảo toàn 100% bố cục và tính năng thực tế của app hiệp hội**:
  1. **Màn 1: Trang chủ**: Logo CEO 1983 & chuông thông báo (badge đếm), Thẻ VIP Đỗ Thị Mai (ảnh skyline, mã M1983-012 kèm copy), Lưới 8 tính năng nhanh (badge Mới, 3, 5, 1), Sự kiện nổi bật (16 SEP Đại Hội Doanh Nhân CEO 1983), Khối Ưu đãi quà tặng 3D, Cặp khối giao thương thực chiến then chốt (Trao Cơ Hội +2 Mới & Đăng Sản Phẩm +11 Mới), Nút cài đặt ứng dụng lên màn hình chính, Bottom Bar 5 tab.
  2. **Màn 2: Gắn kết (Tin nhắn & Hội thoại)**: Tiêu đề "Gắn Kết & Tin Nhắn", ô tìm kiếm phẳng không viền, hàng avatar đối tác online thời gian thực (Messenger style kèm nút [+] Nhắn mới và chấm xanh online), 4 tab phân loại (Tất cả (8), Chưa đọc (3), Tin chờ, Hệ thống), danh sách hội thoại Ban Thư Ký CLB CEO 1983 (ghim đầu, tích xanh), các đối tác doanh nhân (kèm badge tin chưa đọc), Bottom Bar có tab Gắn kết active.
  3. **Màn 3: Cá nhân (Hồ sơ Doanh nhân Facebook Executive Profile)**: Ảnh bìa cover toàn cảnh kèm nút [Đổi ảnh bìa], avatar Đỗ Thị Mai nổi bật đè lên ảnh bìa viền vàng VIP kèm chấm xanh online, tích xanh xác thực, chức danh Tổng Giám Đốc • CÔNG TY DU LỊCH QUỐC TẾ Á CHÂU, badge VIP MEMBER CEO 1983, bio sứ mệnh kết nối, hàng 3 nút hành động [+ Thêm vào tin], [Chỉnh sửa], [Chia sẻ], khối thông tin ngành nghề & địa bàn trụ sở, khối BẠN BÈ & ĐỐI TÁC (128) hiển thị lưới 6 avatar kèm số lượng đối tác mở rộng (+122), ô đăng bài chia sẻ cơ hội giao thương, Bottom Bar có tab Cá nhân active.
  4. **Thanh Menu Đáy (Bottom Navigation) đồng bộ 5 Tab**: \`Trang chủ\` • \`Sự kiện\` • \`[83 - Thẻ]\` • \`Gắn kết\` • \`Cá nhân\` trên cả 3 màn hình.
- **Độ sắc nét và tiêu chuẩn thị giác**:
  - Vector SVG siêu nét, typography chuẩn Google Fonts Plus Jakarta Sans từ 8.5px đến 14px, tương phản cao, tối ưu tuyệt đối cho in ấn và trình chiếu màn hình lớn.
  - Phân hóa rõ rệt 3 trường phái thẩm mỹ: Classic Navy & Gold (sang trọng lịch lãm), Digital Sapphire (công nghệ chuyển đổi số 3D), B2B Commerce Focus (thực chiến phẳng tối giản).
  - Hoàn toàn khách quan, không chứa bất kỳ nhận xét chủ quan nào của Giám đốc thiết kế, sẵn sàng để gửi cho đối tác và Ban Lãnh đạo.
`;
  mem = mem.slice(0, idx) + newSection;
  fs.writeFileSync(memPath, mem, 'utf8');
  console.log('Updated MEMORY.md successfully!');
} else {
  console.log('Target not found in MEMORY.md');
}
