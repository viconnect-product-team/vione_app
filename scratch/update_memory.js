const fs = require('fs');
const path = require('path');

const memoryPath = path.resolve(__dirname, '../MEMORY.md');
let content = fs.readFileSync(memoryPath, 'utf8');

const section15_19 = `
### 15.19 Khắc Phục Lỗi Runtime Màn Hình Sản Phẩm & Sự Kiện, Chuẩn Hóa 100% Popup Căn Giữa Màn Hình Mobile, Đơn Giản Hóa UI Sự Kiện & Sản Phẩm Vuông Trang Chủ (17/09/2026)
- **Bối cảnh & Yêu cầu Người Dùng**:
  1. *Lỗi Runtime Screenshot 1*: \`ReferenceError: categoriesList is not defined at ProductsScreen\` tại \`association.products.tsx\`.
  2. *Lỗi Runtime Screenshot 2*: \`ReferenceError: pad is not defined at EventCountdownBanner\` tại \`EventCountdownTimer.tsx\`.
  3. *Quy chuẩn 100% Popup Căn Giữa Màn Hình Điện Thoại*: Lỗi popup tạo nhóm chat không hiển thị chính giữa màn hình điện thoại. Yêu cầu bắt buộc: TẤT CẢ popup/modal trong hệ thống phải nằm chính giữa màn hình điện thoại.
  4. *UI Sự kiện trang chủ*: Chỉ để mỗi tên sự kiện với thời gian đếm ngược, gỡ bỏ thông tin ngày giờ, địa điểm phụ thừa.
  5. *UI Sản phẩm trang chủ*: Chuyển thành dạng thẻ hình vuông hoàn toàn (\`aspect-square\`), bỏ lớp mờ trắng, bỏ chữ "CRN 1983" / "CEO 1983".
- **Giải Pháp & Triển Khai Kỹ Thuật**:
  1. **Khắc phục \`categoriesList is not defined\` (\`association.products.tsx\`)**: Khai báo danh mục \`categoriesList\` hoàn chỉnh (\`all\`, \`my_products\`, \`interested\`, cùng 6 ngành nghề kinh doanh) kèm số lượng bản ghi thực tế từ cơ sở dữ liệu.
  2. **Khắc phục \`pad is not defined\` (\`EventCountdownTimer.tsx\`)**: Đưa hàm \`pad = (n: number) => String(n).padStart(2, "0")\` ra cấp module ngoài để cả \`EventCountdownBanner\` và \`EventCountdownMiniBadge\` đều truy cập an toàn.
  3. **Chuẩn Hóa 100% Modal Căn Giữa Màn Hình Điện Thoại Qua React Portal**:
     - Cập nhật \`CreateGroupChatModal.tsx\`: Sử dụng \`createPortal(..., document.body)\`, khóa cuộn nền \`overflow = "hidden"\`, căn giữa tuyệt đối \`fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md\`, hộp thoại card \`w-full max-w-[400px] sm:max-w-lg max-h-[86dvh] rounded-3xl\` không bị che khuất hay tràn màn hình mobile.
     - Cập nhật \`GroupMembersModal.tsx\`: Sử dụng \`createPortal(..., document.body)\`, căn giữa \`max-w-[390px] rounded-3xl\`.
     - Cập nhật \`association.messages.tsx\`: Chuyển \`filterModalOpen\` từ dạng bottom sheet (\`justify-end\`) sang hộp thoại nổi chính giữa màn hình (\`flex items-center justify-center p-3.5 rounded-3xl\`) qua \`createPortal\`. Đồng thời bọc \`paymentModalData\` và \`ForwardMessageModal\` bằng \`createPortal\` để đảm bảo 100% căn giữa.
  4. **UI Sự Kiện Trang Chủ Tối Giản (\`association.index.tsx\`)**: Loại bỏ \`dateStr\` và địa điểm thừa. Khối chân ảnh chỉ hiển thị duy nhất: Huy hiệu thời gian đếm ngược \`<EventCountdownMiniBadge />\` và Tiêu đề sự kiện in đậm rõ nét.
  5. **UI Sản Phẩm Trang Chủ Hình Vuông (\`association.index.tsx\`)**:
     - Chuyển sang lưới 2 cột các thẻ vuông (\`grid grid-cols-2 gap-2.5 sm:gap-3\`), khung ảnh tỷ lệ \`aspect-square\`.
     - Xóa bỏ hoàn toàn lớp vệt mờ trắng (\`bg-gradient-to-r from-transparent to-white\`).
     - Xóa bỏ hoàn toàn chữ "CRN 1983" / "CEO 1983" fallback. Chân ảnh chỉ hiển thị tên sản phẩm và giá bán hội viên.
`;

if (!content.includes('15.19 Khắc Phục Lỗi Runtime')) {
  content = content.trimEnd() + '\n' + section15_19;
  fs.writeFileSync(memoryPath, content, 'utf8');
  console.log('Successfully appended section 15.19 to MEMORY.md');
} else {
  console.log('Section 15.19 already exists in MEMORY.md');
}
