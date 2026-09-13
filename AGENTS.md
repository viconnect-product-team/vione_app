# AGENTS RULES & CONSTRAINTS

## 1. Git Push & Commit Rule (STRICT)
- **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY `git push` HAY `git commit`**:
  - Không được tự ý thực thi các lệnh `git push` hoặc `git commit` trong terminal.
  - Mọi thay đổi mã nguồn chỉ được phép chỉnh sửa cục bộ (local).
  - Để người dùng toàn quyền chủ động kiểm tra, commit và push mã nguồn lên Git khi họ mong muốn.

## 2. Đồng Bộ Hóa Bắt Buộc: Memory, Cursor Rules & Tài Liệu Kỹ Thuật (STRICT)
- **Cập nhật MEMORY.md**: Mỗi lần thực hiện bất kỳ thay đổi kiến trúc, tính năng, sửa lỗi hoặc điều chỉnh luồng, BẮT BUỘC phải ghi nhận chi tiết vào `MEMORY.md`.
- **Cập nhật Cursor Rules / Roles (`.cursorrules`)**: Khi có quy chuẩn coding, quy tắc định tuyến, luồng xử lý hoặc vai trò mới, BẮT BUỘC phải bổ sung đồng bộ vào `.cursorrules`.
- **Bổ sung & Hiệu chỉnh Tài liệu Kỹ thuật**: Nếu phát hiện sai luồng, lệch schema/API/route, hoặc có thay đổi technical, BẮT BUỘC phải hiệu chỉnh ngay các tài liệu trong `document/` để code, database và tài liệu luôn khớp 100%.

