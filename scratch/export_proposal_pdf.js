const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The refined mockup that matches 1:1 existing layout
const refinedHomeImgPath = 'C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\74644533-8bb8-4b29-a589-3d8714601888\\ceo1983_current_ui_refined_1789438287150.jpg';
const refinedHomeImgBase64 = fs.existsSync(refinedHomeImgPath) ? fs.readFileSync(refinedHomeImgPath).toString('base64') : '';

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phương Án Tinh Chỉnh Giao Diện App CLB Doanh Nhân CEO 1983</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 210mm;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 12mm 15mm 10mm 15mm;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    .top-brand-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #003B95 0%, #0284C7 60%, #EA580C 100%);
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 12px;
      flex-shrink: 0;
    }

    .brand-logo-text {
      font-size: 18px;
      font-weight: 800;
      color: #003B95;
    }
    .brand-logo-text span {
      color: #EA580C;
    }

    .doc-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: #f0f9ff;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    .page-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      flex-shrink: 0;
    }

    /* Cover Page */
    .cover-page {
      background: radial-gradient(circle at 80% 20%, #0c2340 0%, #001f3f 50%, #060e1a 100%);
      color: #ffffff;
      padding: 24mm 18mm 16mm 18mm;
      justify-content: space-between;
    }

    .cover-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      background: rgba(2, 132, 199, 0.2);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .cover-title {
      font-size: 30px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 14px;
      color: #ffffff;
    }
    .cover-title span {
      color: #38bdf8;
    }

    .cover-desc {
      font-size: 13px;
      line-height: 1.6;
      color: #94a3b8;
      max-width: 580px;
      margin-bottom: 24px;
    }

    .cover-box-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .cover-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px;
    }
    .cover-box h4 {
      font-size: 11.5px;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .cover-box p {
      font-size: 10px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }

    /* Content Typography */
    h2.section-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }

    p.section-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .callout {
      border-radius: 10px;
      padding: 9px 12px;
      margin-bottom: 12px;
      font-size: 11px;
      line-height: 1.5;
    }
    .callout-blue {
      background: #f0f9ff;
      border-left: 3.5px solid #0284c7;
      color: #0369a1;
    }
    .callout-green {
      background: #f0fdf4;
      border-left: 3.5px solid #16a34a;
      color: #15803d;
    }

    .table-spec {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10.5px;
    }
    .table-spec th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
    }
    .table-spec td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      color: #334155;
      line-height: 1.45;
      vertical-align: top;
    }
    .table-spec tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Showcase 2 cols */
    .showcase-grid {
      display: grid;
      grid-template-columns: 82mm 1fr;
      gap: 14px;
      flex: 1;
      align-items: start;
      overflow: hidden;
    }

    .mockup-container {
      background: #f8fafc;
      border-radius: 16px;
      border: 1.5px solid #cbd5e1;
      padding: 6px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .mockup-container img {
      width: 100%;
      height: 202mm;
      max-height: 202mm;
      object-fit: contain;
      border-radius: 12px;
      display: block;
    }

    .detail-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .detail-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .detail-card h4 {
      font-size: 11.5px;
      font-weight: 700;
      color: #003B95;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-card p, .detail-card ul {
      font-size: 10px;
      color: #475569;
      line-height: 1.5;
    }

    .tag-pill {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
    .tag-blue { background: #e0f2fe; color: #0284c7; }
    .tag-orange { background: #ffedd5; color: #c2410c; }
    .tag-green { background: #dcfce7; color: #15803d; }
  </style>
</head>
<body>

  <!-- TRANG 1: BÌA BÁO CÁO -->
  <div class="page cover-page">
    <div class="top-brand-stripe"></div>
    <div>
      <div class="cover-tag">
        ⚡ BÁO CÁO TINH CHỈNH UI/UX • BÁM SÁT 100% APP HIỆN TẠI
      </div>
      <h1 class="cover-title">
        PHƯƠNG ÁN TINH CHỈNH GIAO DIỆN<br>
        <span>CLB DOANH NHÂN CEO 1983</span>
      </h1>
      <p class="cover-desc">
        Giữ nguyên 100% bố cục, vị trí và cấu trúc mã nguồn sẵn có của ứng dụng. 
        Chỉ tập trung tinh chỉnh màu sắc theo chuẩn nhận diện thương hiệu từ Google Drive 
        (Deep Cobalt Navy & Warm Gold) và giải quyết đúng 3 điểm góp ý của Ban Lãnh đạo mà không làm ảnh hưởng kiến trúc app.
      </p>

      <div class="cover-box-grid">
        <div class="cover-box">
          <h4>✓ Giữ Nguyên Bố Cục</h4>
          <p>Không đập đi xây lại. Giữ nguyên toàn bộ vị trí các khối: Header, Thẻ, 8 Tính năng nhanh, Sự kiện, Ưu đãi.</p>
        </div>
        <div class="cover-box">
          <h4>✓ Tối Ưu Thẻ Hội Viên</h4>
          <p>Nâng cấp chiều cao thẻ để thêm dải ảnh bìa (cover) + avatar lớn viền vàng VIP theo đúng mong muốn của Sếp.</p>
        </div>
        <div class="cover-box">
          <h4>✓ Nâng Tầm UX 8 Icon</h4>
          <p>Tăng font chữ to rõ nét 13px, bỏ hiệu ứng sao/tuyết quê mùa, icon chuẩn 2 màu xanh - cam CEO 1983.</p>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-meta">
        <div><strong>Dự án:</strong> VIONE Super-App • CLB Doanh Nhân CEO 1983</div>
        <div><strong>Mục tiêu:</strong> Tinh chỉnh trực tiếp trên React Code (15-20 phút thực thi)</div>
        <div><strong>Thời gian:</strong> 09/2026</div>
      </div>
    </div>
  </div>

  <!-- TRANG 2: ĐỐI CHIẾU TRỰC TIẾP & NÂNG CẤP MÃ NGUỒN -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <div class="brand-logo-text">CEO <span>1983</span></div>
      <div class="doc-badge">Bảng Đối Chiếu Hiện Trạng & Giải Pháp</div>
    </div>

    <h2 class="section-title">Đối Chiếu 3 Điểm Góp Ý Trực Tiếp Trên App Hiện Tại</h2>
    <p class="section-subtitle">Phương án tinh chỉnh từng dòng code tại file association.index.tsx mà không phá vỡ layout hiện hữu.</p>

    <div class="callout callout-green">
      <strong>Nguyên tắc vàng:</strong> Tôn trọng toàn bộ component sẵn có trong dự án. Nhà phát triển chỉ cần 
      cập nhật class TailwindCSS và thêm dải ảnh bìa nhẹ nhàng vào thẻ hội viên, hoàn thành trong 15-20 phút.
    </div>

    <table class="table-spec">
      <thead>
        <tr>
          <th style="width: 26%;">Khu vực & Ý kiến của Sếp</th>
          <th style="width: 34%;">Hiện trạng code hiện tại</th>
          <th style="width: 40%;">Phương án tinh chỉnh chuẩn xác</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>1. Thẻ hội viên</strong><br>
            <em>"Phần này thẻ hội viên hơi bé vì có thể add ảnh đại diện và ảnh bìa nữa"</em>
          </td>
          <td>
            Đang là 1 hàng ngang đơn điệu (<code>-mt-14 mx-4 flex items-center gap-3.5</code>), 
            chỉ có avatar nhỏ MT và 2 dòng chữ, không có không gian ảnh bìa.
          </td>
          <td>
            <strong>Giữ nguyên vị trí đó, mở rộng chiều cao thẻ:</strong><br>
            • Thêm dải ảnh bìa họa tiết thương hiệu CEO 1983 nhẹ ở nửa trên.<br>
            • Avatar to <code>h-16 w-16</code> bo tròn viền vàng VIP nổi bật ở giữa.<br>
            • Đầy đủ: Họ tên, Chức vụ, Công ty, Mã M1983-012 và nút mũi tên.
          </td>
        </tr>
        <tr>
          <td>
            <strong>2. Tính năng nhanh (8 icon)</strong><br>
            <em>"Sz font chữ vẫn bé em nhé và phần UI/UX nhìn quê lắm"</em>
          </td>
          <td>
            Lưới 4x2 gồm 8 nút, icon viền mỏng màu xanh nhạt trơ trọi, chữ bé <code>text-[10.5px]</code>, 
            kèm các hạt tuyết rơi <code>❄ ✦ ✧ ⋆</code> khiến giao diện bị "quê".
          </td>
          <td>
            <strong>Giữ nguyên đúng 8 vị trí icon:</strong><br>
            • <strong>Bỏ hoàn toàn</strong> các icon tuyết rơi lấp lánh sến súa.<br>
            • Tăng kích thước font chữ lên <strong>13px font-bold</strong> sắc nét.<br>
            • Icon dùng chuẩn 2 màu nhận diện CEO 1983 (Navy #003B95 & Cam #EA580C) với nền mềm mại hiện đại.
          </td>
        </tr>
        <tr>
          <td>
            <strong>3. Khối Ưu đãi hội viên</strong><br>
            <em>"Thông tin thì được nhưng phần UI/UX sửa lại đồng bộ nhé"</em>
          </td>
          <td>
            Khung viền mỏng xanh nhạt <code>border-sky-500/20</code>, hình hộp quà nảy nảy <code>animate-bounce</code>, 
            nút bấm xanh lợt lệch tông thương hiệu.
          </td>
          <td>
            <strong>Giữ nguyên cấu trúc:</strong><br>
            • Bỏ hiệu ứng bounce rung lắc của hộp quà, đổi sang đồ họa 3D tĩnh sang trọng.<br>
            • Nút "Xem ưu đãi ngay" chuyển sang màu xanh Navy đậm <code>bg-[#003B95]</code>.<br>
            • Viền thẻ và icon Crown đồng bộ tone màu nhận diện.
          </td>
        </tr>
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 4px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #003B95; margin-bottom: 3px;">NAVY BLUE #003B95</div>
        <div style="height: 14px; background: #003B95; border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Màu chủ đạo logo CEO 1983: dùng cho Header, Title, Nút hành động.</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #EA580C; margin-bottom: 3px;">ORANGE GOLD #EA580C</div>
        <div style="height: 14px; background: #EA580C; border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Màu điểm nhấn số 3: dùng cho viền VIP, badge nóng, icon Danh thiếp.</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #0284C7; margin-bottom: 3px;">CLEAN BACKGROUND</div>
        <div style="height: 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Nền trắng sáng chuẩn app di động hiện đại, tương phản rõ rệt.</p>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương án Tinh chỉnh Giao diện Hiện tại</div>
      <div>Trang 2 / 3</div>
    </div>
  </div>

  <!-- TRANG 3: MOCKUP THỰC TẾ KHỚP 100% LAYOUT HIỆN TẠI -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <div class="brand-logo-text">CEO <span>1983</span></div>
      <div class="doc-badge">Giao diện Trang chủ Đã Tinh Chỉnh</div>
    </div>

    <h2 class="section-title">Giao Diện Trang Chủ Sau Khi Tinh Chỉnh</h2>
    <p class="section-subtitle">Minh họa thực tế 1:1 theo đúng các thành phần sẵn có trên màn hình di động.</p>

    <div class="showcase-grid">
      <div class="mockup-container">
        <img src="data:image/jpeg;base64,${refinedHomeImgBase64}" alt="Màn hình Trang chủ Tinh Chỉnh">
      </div>

      <div class="detail-cards">
        <div class="detail-card">
          <h4>
            <span class="tag-pill tag-blue">Vị trí 1</span>
            Header & Thẻ Hội Viên Đã Nới Rộng
          </h4>
          <p>
            • <strong>Logo CEO 1983 & Chuông:</strong> Giữ nguyên 100% vị trí góc trái và phải.<br>
            • <strong>Thẻ hội viên nới rộng bề thế:</strong> Có dải họa tiết ảnh bìa sang trọng bên trên, avatar to viền vàng VIP ở giữa, họ tên Đỗ Thị Mai kèm tick xanh xác thực.<br>
            • <strong>Badge VIP GOLD & Mã M1983-012:</strong> Đặt ngay dưới tên, người dùng bấm vào là sao chép hoặc chuyển sang trang thẻ dễ dàng.
          </p>
        </div>

        <div class="detail-card">
          <h4>
            <span class="tag-pill tag-orange">Vị trí 2</span>
            Lưới 8 Tính Năng Nhanh Đã Nâng Cấp UX
          </h4>
          <p>
            • <strong>Giữ nguyên đúng 8 nút chức năng:</strong> Thẻ hội viên, Danh thiếp số, Hội viên, Sự kiện, Tin tức, Tài liệu, Liên hệ nhanh, Ưu đãi.<br>
            • <strong>Tăng font chữ lên 13px bold:</strong> Đọc rõ ràng tức thì khi cầm điện thoại, giải quyết triệt để lỗi "chữ bé".<br>
            • <strong>Bỏ hạt tuyết rơi sến súa:</strong> Thay bằng icon sắc nét, nền bo tròn mềm mại chuẩn phong cách app doanh nghiệp.
          </p>
        </div>

        <div class="detail-card">
          <h4>
            <span class="tag-pill tag-green">Vị trí 3</span>
            Khối Ưu Đãi Hội Viên & Đối Tác Đồng Bộ
          </h4>
          <p>
            • <strong>Đồng bộ màu thương hiệu:</strong> Nút "Xem ưu đãi ngay" màu xanh Navy đậm sắc sảo thay cho màu xanh nhạt cũ.<br>
            • <strong>Bố cục hài hòa:</strong> Hộp quà tĩnh cao cấp bên phải, văn bản trình bày rõ ràng, không làm xáo trộn bố cục trang.
          </p>
        </div>

        <div class="callout callout-blue" style="margin-bottom: 0;">
          <strong>⚡ Triển khai code siêu tốc:</strong> Dev chỉ cần sửa trực tiếp trên file 
          <code>association.index.tsx</code> có sẵn, không phải dựng lại trang hay đổi cấu trúc routing.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương án Tinh chỉnh Giao diện Hiện tại</div>
      <div>Trang 3 / 3</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.resolve('scratch/de_xuat_giao_dien_ceo1983.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

const pdfOutputPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Generating refined PDF via MS Edge...');
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "file:///${htmlFilePath.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfOutputPath);
  console.log('SUCCESS! PDF regenerated at:', pdfOutputPath, 'Size:', stats.size, 'bytes');
} catch (err) {
  console.error('Error generating PDF:', err);
}
