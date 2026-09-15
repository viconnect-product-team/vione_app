const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('scratch/build_ceo1983_standard_pdf.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Replace center button in renderProfileScreen with unified CEO 1983 emblem button
const oldNavRegex = /<!-- Bottom Nav Bar \(Exact Match User Photo[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*`;\s*}/;
const newNav = `<!-- Bottom Nav Bar (Đồng nhất nút giữa logo CEO 1983) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab" style="position:relative;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span style="position:absolute;top:-1px;right:0;width:4px;height:4px;border-radius:50%;background:#ef4444;"></span>
          <span>Thông báo</span>
        </div>
        <div class="m-nav-center" style="border-color:\${p.navCenterBorder};">
          <img src="data:image/png;base64,\${emblemBase64}" style="width:20px;height:20px;object-fit:contain;" alt="83">
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Kết nối</span>
        </div>
        <div class="m-nav-tab active" style="color:\${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  \`;
}`;

if (oldNavRegex.test(code)) {
  code = code.replace(oldNavRegex, newNav);
  console.log("Successfully replaced bottom nav with unified CEO 1983 logo in renderProfileScreen!");
} else {
  console.warn("Could not find oldNavRegex match in script!");
}

// 2. Remove the approval / representative block on Page 8
const approvalBlockRegex = /<!-- Khối Phê Duyệt Tinh Gọn Kết Thúc Tài Liệu -->[\s\S]*?<\/div>\s*<\/div>/;
if (approvalBlockRegex.test(code)) {
  code = code.replace(approvalBlockRegex, '');
  console.log("Successfully removed approval and representative block!");
} else {
  console.warn("Could not find approvalBlockRegex match in script!");
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Script updated successfully!");
