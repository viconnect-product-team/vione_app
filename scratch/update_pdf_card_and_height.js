const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('scratch/build_ceo1983_standard_pdf.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Upgrade VIP Card in renderHomeScreen to have Cover Photo (ảnh bìa) & Overlapping Avatar (ảnh đại diện)
const oldVipCardRegex = /<!-- 1\. VIP Member Compact Widget -->[\s\S]*?<!-- 2\. Lưới 8 Tính Năng Nhanh -->/;

const newVipCard = `<!-- 1. VIP Member Executive Card with Cover Photo (Ảnh Bìa) & Avatar (Ảnh Đại Diện) To Rộng Chuẩn Sếp Yêu Cầu -->
        <div style="background:#ffffff; border:1px solid \${p.borderSoft}; border-radius:12px; overflow:hidden; box-shadow:0 3px 10px rgba(0,0,0,0.06); margin:0 7px; flex-shrink:0;">
          <!-- Ảnh Bìa To Rộng (Cover Banner) -->
          <div style="position:relative; height:54px; background:\${p.cardBg}; overflow:hidden;">
            <img src="data:image/jpeg;base64,\${skylineBase64}" style="width:100%; height:100%; object-fit:cover; opacity:0.88;" alt="Cover Skyline">
            <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%);"></div>
            <!-- VIP Badge on cover top right -->
            <div style="position:absolute; top:4px; right:6px; display:flex; align-items:center; gap:3px;">
              <span style="\${p.badgeClass} font-size:6.5px; font-weight:900; padding:1.5px 5.5px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">VIP GOLD</span>
            </div>
          </div>
          <!-- Thân Thẻ với Avatar đè lên Ảnh Bìa -->
          <div style="padding:0 8px 6px 8px; position:relative;">
            <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:-18px; margin-bottom:4px;">
              <!-- Avatar Ảnh đại diện dập viền trắng nổi bật có chấm online xanh -->
              <div style="position:relative; width:36px; height:36px; border-radius:50%; background:#003B95; border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.18); flex-shrink:0;">
                <span style="color:#ffffff; font-size:11px; font-weight:900;">HL</span>
                <span style="position:absolute; bottom:0; right:0; width:8px; height:8px; border-radius:50%; background:#10b981; border:1.5px solid #fff;"></span>
              </div>
              <div style="display:flex; align-items:center; gap:2px; font-size:6.5px; color:\${p.primary}; font-weight:800; padding:2px 6px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:4px;">
                <span>Xem thẻ VIP</span>
                <span>›</span>
              </div>
            </div>
            <!-- Thông tin pháp nhân & Doanh nhân -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:7.2px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  CÔNG TY DU LỊCH QUỐC TẾ Á CHÂU
                </div>
                <div style="display:flex; align-items:center; gap:3px; margin-top:1px;">
                  <span style="font-size:9.5px; font-weight:900; color:#0f172a;">LÊ HOÀNG LONG</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#0284c7"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
                </div>
                <div style="font-size:6.5px; color:#475569; margin-top:1px;">Chủ tịch HĐQT & Tổng Giám Đốc</div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
                <span style="background:#f1f5f9; color:#334155; font-size:6px; font-weight:800; padding:1.5px 5px; border-radius:4px; border:1px solid #e2e8f0;">
                  M1983-002 📋
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Lưới 8 Tính Năng Nhanh -->`;

if (oldVipCardRegex.test(code)) {
  code = code.replace(oldVipCardRegex, newVipCard);
  console.log("Updated VIP Card with Cover Photo & Avatar!");
} else {
  console.warn("Could not find old VIP card regex match");
}

// 2. Adjust CSS: Lower phone height, make height fit-content, remove whitespace to footer!
code = code.replace(
  /\.phone-mockup-large\s*\{[\s\S]*?flex-shrink:\s*0;\s*\}/,
  `.phone-mockup-large {
      width: 100mm;
      height: fit-content;
      max-height: 236mm;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      position: relative;
      flex-shrink: 0;
    }`
);

code = code.replace(
  /\.phone-mockup-medium\s*\{[\s\S]*?flex-shrink:\s*0;\s*\}/,
  `.phone-mockup-medium {
      width: 88mm;
      height: fit-content;
      max-height: 215mm;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 26px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0,0,0,0.10);
      position: relative;
      flex-shrink: 0;
    }`
);

// In .m-screen-flow: remove flex: 1 so it hugs content tightly
code = code.replace(
  /\.m-screen-flow\s*\{[\s\S]*?background:\s*#ffffff;\s*\}/,
  `.m-screen-flow {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }`
);

// In .m-install-hint: ensure margin-bottom is 2px and margin-top 4px
code = code.replace(
  /\.m-install-hint\s*\{[\s\S]*?flex-shrink:\s*0;\s*\}/,
  `.m-install-hint {
      margin: 4px 7px 2px 7px;
      border: 1px dashed #003B95;
      border-radius: 6px;
      padding: 2.5px 0;
      text-align: center;
      font-size: 7px;
      font-weight: 800;
      color: #003B95;
      background: #f0f9ff;
      flex-shrink: 0;
    }`
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Successfully updated build_ceo1983_standard_pdf.js with cover photo & snug zero-gap height!");
