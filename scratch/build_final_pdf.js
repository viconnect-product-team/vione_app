const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base paths
const logoPath = path.resolve('apps/vione_app_fe/public/ceo1983-logo.png');
const emblemPath = path.resolve('apps/vione_app_fe/public/ceo1983-emblem-8.png');
const skylinePath = path.resolve('apps/vione_app_fe/public/ceo1983_hero_daylight_skyline.jpg');
const giftPath = path.resolve('apps/vione_app_fe/src/assets/vba-gift.png');
const sapphirePath = path.resolve('scratch/screen-0.jpg');

const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString('base64') : '';
const emblemBase64 = fs.existsSync(emblemPath) ? fs.readFileSync(emblemPath).toString('base64') : '';
const skylineBase64 = fs.existsSync(skylinePath) ? fs.readFileSync(skylinePath).toString('base64') : '';
const giftBase64 = fs.existsSync(giftPath) ? fs.readFileSync(giftPath).toString('base64') : '';
const sapphireBase64 = fs.existsSync(sapphirePath) ? fs.readFileSync(sapphirePath).toString('base64') : '';

// Function to generate the phone mockup HTML for a specific theme option
function renderPhoneMockup(optionType) {
  // Option 1: Classic Navy & Gold
  // Option 2: Digital Sapphire Modern
  // Option 3: Enterprise B2B Commerce

  let cardBg = '';
  let cardCover = '';
  let avatarBorder = '#f59e0b';
  let badgeClass = 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';
  let iconTheme = 'classic';
  let bannerBg = 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)';
  let btnColor = '#003B95';

  if (optionType === 'option1') {
    cardBg = 'linear-gradient(145deg, #0a192f 0%, #1e3a8a 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.35;`;
    btnColor = '#003B95';
  } else if (optionType === 'option2') {
    cardBg = 'linear-gradient(145deg, #031525 0%, #0369a1 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${sapphireBase64}'); background-size: cover; background-position: center; opacity: 0.4;`;
    avatarBorder = '#38bdf8';
    badgeClass = 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
    iconTheme = 'colorful';
    btnColor = '#0284c7';
  } else {
    // option3
    cardBg = 'linear-gradient(145deg, #0f172a 0%, #334155 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.25;`;
    avatarBorder = '#ea580c';
    badgeClass = 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]';
    iconTheme = 'minimal';
    btnColor = '#0f172a';
  }

  // Icons definition
  const iconsData = [
    { name: 'Thẻ hội viên', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>', color: optionType === 'option2' ? '#0284c7' : '#003B95', bg: optionType === 'option2' ? '#e0f2fe' : '#f0f4fa' },
    { name: 'Danh thiếp số', iconSvg: '<path d="M16 2v4"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="11" r="3"/>', color: '#ea580c', bg: '#ffedd5', badge: 'Mới' },
    { name: 'Hội viên', iconSvg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', color: optionType === 'option2' ? '#10b981' : '#003B95', bg: optionType === 'option2' ? '#d1fae5' : '#f0f4fa' },
    { name: 'Sự kiện', iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', color: optionType === 'option2' ? '#f59e0b' : '#003B95', bg: optionType === 'option2' ? '#fef3c7' : '#f0f4fa', badge: '2' },
    { name: 'Tin tức', iconSvg: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>', color: optionType === 'option2' ? '#8b5cf6' : '#003B95', bg: optionType === 'option2' ? '#ede9fe' : '#f0f4fa', badge: '5' },
    { name: 'Tài liệu', iconSvg: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>', color: optionType === 'option2' ? '#06b6d4' : '#003B95', bg: optionType === 'option2' ? '#cffafe' : '#f0f4fa' },
    { name: 'Liên hệ nhanh', iconSvg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', color: '#ea580c', bg: '#ffedd5', badge: '1' },
    { name: 'Ưu đãi', iconSvg: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>', color: optionType === 'option2' ? '#ec4899' : '#003B95', bg: optionType === 'option2' ? '#fce7f3' : '#f0f4fa' },
  ];

  return `
    <div class="phone-frame">
      <!-- Status bar -->
      <div class="status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:9px;">5G</span>
          <span style="font-size:10px;">100%</span>
        </div>
      </div>

      <!-- App Header -->
      <div class="app-header">
        <img class="header-logo" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
        <div class="header-notif">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003B95" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="notif-badge">3</span>
        </div>
      </div>

      <!-- Hero Festive Atmosphere -->
      <div class="hero-stripe"></div>

      <!-- Member Card (Refined Height with Cover Photo) -->
      <div class="member-card" style="background: ${cardBg};">
        <div class="member-card-cover" style="${cardCover}"></div>
        <div class="member-card-body">
          <div class="member-avatar" style="border-color: ${avatarBorder};">
            <span style="font-size: 15px; font-weight: 800; color: #ffffff;">MT</span>
          </div>
          <div class="member-info">
            <div class="member-company">
              <span>Công ty TNHH Du lịch Quốc tế</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
            </div>
            <div class="member-name">Đỗ Thị Mai</div>
            <div class="member-tags">
              <span class="vip-tag ${badgeClass}">VIP GOLD</span>
              <span class="code-tag">M1983-012</span>
            </div>
          </div>
          <div class="member-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="qa-container">
        <div class="qa-title">
          <span style="width:7px;height:7px;background:${btnColor};border-radius:50%;display:inline-block;margin-right:6px;"></span>
          TÍNH NĂNG NHANH
        </div>
        <div class="qa-grid">
          ${iconsData.map(item => `
            <div class="qa-item">
              <div class="qa-icon-wrap" style="background:${item.bg};color:${item.color};">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${item.iconSvg}
                </svg>
                ${item.badge ? `<span class="qa-badge">${item.badge}</span>` : ''}
              </div>
              <span class="qa-label">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Featured Event Section (100% khớp association.index.tsx) -->
      <div class="fe-container">
        <div class="fe-header">
          <div class="fe-title">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${btnColor}" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            SỰ KIỆN NỔI BẬT
          </div>
          <span style="font-size: 7.5px; font-weight: 700; color: ${btnColor};">Xem tất cả +2 →</span>
        </div>
        <div class="fe-card">
          <div class="fe-date-badge" style="background: ${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#1e293b' : '#003B95'};">
            <span style="font-size: 11px; font-weight: 900; color: #fff; line-height: 1;">16</span>
            <span style="font-size: 6.5px; font-weight: 700; color: rgba(255,255,255,0.85); text-transform: uppercase;">SEP</span>
          </div>
          <div class="fe-details">
            <div style="font-size: 7px; color: #64748b; font-weight: 600; display:flex; gap:4px; align-items:center;">
              <span>07:00</span>
              <span>•</span>
              <span style="color:#0284c7;font-weight:700;">CEO 1983</span>
            </div>
            <div style="font-size: 8.5px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 2px 0;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
            <div style="font-size: 7px; color: #94a3b8;">📍 TT Hội Nghị Quốc Gia, Hà Nội</div>
          </div>
        </div>
      </div>

      <!-- Perks & Rewards Box -->
      <div class="perks-box">
        <div style="flex:1;">
          <div class="perks-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Ưu đãi Hội viên & Đối tác
          </div>
          <div class="perks-desc">Chính sách trợ giá, quà tặng liên kết & quyền lợi giao thương CEO 1983.</div>
          <button class="perks-btn" style="background:${btnColor};">Xem ưu đãi ngay →</button>
        </div>
        <div style="width:42px;height:42px;margin-left:8px;flex-shrink:0;">
          <img src="data:image/png;base64,${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
        </div>
      </div>

      <!-- Bottom Nav -->
      <div class="bottom-nav">
        <div class="nav-item active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#003B95"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="nav-center-item">
          <img src="data:image/png;base64,${emblemBase64}" style="width:24px;height:24px;object-fit:contain;" alt="CEO">
        </div>
        <div class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
          <span>Thông báo</span>
        </div>
        <div class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Chuẩn Hóa Giao Diện App CLB Doanh Nhân CEO 1983</title>
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

    .brand-logo-img {
      height: 26px;
      width: auto;
      object-fit: contain;
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
      background: radial-gradient(circle at 85% 20%, #0c2340 0%, #001f3f 50%, #060e1a 100%);
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
      margin-bottom: 18px;
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

    /* Comparison Table */
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

    /* 2 Columns Showcase */
    .showcase-grid {
      display: grid;
      grid-template-columns: 82mm 1fr;
      gap: 14px;
      flex: 1;
      align-items: start;
      overflow: hidden;
    }

    .specs-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .spec-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .spec-card h4 {
      font-size: 11.5px;
      font-weight: 700;
      color: #003B95;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .spec-card p, .spec-card ul {
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

    /* ==================== PHONE MOCKUP STYLING ==================== */
    .phone-frame {
      width: 82mm;
      height: 175mm;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .status-bar {
      height: 16px;
      padding: 2px 14px 0 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      font-weight: 700;
      color: #1e293b;
      background: #ffffff;
      flex-shrink: 0;
    }

    .app-header {
      height: 38px;
      padding: 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }
    .header-logo {
      height: 24px;
      width: auto;
      object-fit: contain;
    }
    .header-notif {
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .notif-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 7px;
      font-weight: 800;
      padding: 1px 3.5px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }

    .hero-stripe {
      height: 20px;
      background: linear-gradient(180deg, rgba(2,132,199,0.15) 0%, rgba(2,132,199,0.02) 100%);
      flex-shrink: 0;
    }

    .member-card {
      margin: -14px 10px 0 10px;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 14px rgba(0,0,0,0.14);
      flex-shrink: 0;
    }
    .member-card-cover {
      height: 38px;
      width: 100%;
    }
    .member-card-body {
      padding: 6px 10px 10px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #f59e0b;
      background: linear-gradient(135deg, #003B95 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .member-info {
      flex: 1;
      min-width: 0;
    }
    .member-company {
      font-size: 8.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .member-name {
      font-size: 11.5px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }
    .member-tags {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-top: 3px;
    }
    .vip-tag {
      font-size: 7.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid;
    }
    .code-tag {
      font-size: 7.5px;
      font-weight: 600;
      color: #e2e8f0;
      background: rgba(255,255,255,0.12);
      padding: 1px 4px;
      border-radius: 4px;
    }
    .member-arrow {
      margin-left: auto;
      flex-shrink: 0;
      opacity: 0.7;
    }

    /* Quick Actions */
    .qa-container {
      margin: 10px 10px 0 10px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 14px;
      padding: 8px 8px 6px 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      flex-shrink: 0;
    }
    .qa-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    .qa-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 2px;
    }
    .qa-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }
    .qa-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .qa-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 6.5px;
      font-weight: 800;
      padding: 0.5px 3px;
      border-radius: 999px;
    }
    .qa-label {
      font-size: 8px;
      font-weight: 700;
      color: #334155;
      text-align: center;
      line-height: 1.1;
      max-width: 44px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Featured Event Section */
    .fe-container {
      margin: 8px 10px 0 10px;
      flex-shrink: 0;
    }
    .fe-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .fe-title {
      font-size: 9px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fe-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 6px 8px;
      display: flex;
      gap: 8px;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .fe-date-badge {
      width: 32px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .fe-details {
      flex: 1;
      min-width: 0;
    }

    /* Perks Box */
    .perks-box {
      margin: 8px 10px 0 10px;
      border: 1px solid #e0f2fe;
      background: #f8fafc;
      border-radius: 12px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .perks-title {
      font-size: 9px;
      font-weight: 800;
      color: #003B95;
      display: flex;
      align-items: center;
      gap: 3px;
      margin-bottom: 2px;
    }
    .perks-desc {
      font-size: 7.5px;
      color: #64748b;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .perks-btn {
      color: #ffffff;
      border: none;
      font-size: 7.5px;
      font-weight: 700;
      padding: 2.5px 7px;
      border-radius: 5px;
      cursor: pointer;
    }

    /* Bottom Nav */
    .bottom-nav {
      margin-top: auto;
      height: 36px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 4px;
      flex-shrink: 0;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5px;
      font-size: 7px;
      font-weight: 600;
      color: #94a3b8;
    }
    .nav-item.active {
      color: #003B95;
      font-weight: 800;
    }
    .nav-center-item {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #f0f4fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1: BÌA BÁO CÁO ==================== -->
  <div class="page cover-page">
    <div class="top-brand-stripe"></div>
    <div>
      <div class="cover-tag">
        ⚡ BÁO CÁO CHIẾN LƯỢC • CHUẨN HÓA BRAND IDENTITY
      </div>
      <div style="margin-bottom: 16px;">
        <img src="data:image/png;base64,${logoBase64}" style="height: 46px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" alt="CEO 1983 Logo">
      </div>
      <h1 class="cover-title">
        ĐỀ XUẤT CHUẨN HÓA GIAO DIỆN<br>
        <span>APP CLB DOANH NHÂN CEO 1983</span>
      </h1>
      <p class="cover-desc">
        Chuẩn hóa toàn diện nhận diện thương hiệu theo logo và bảng màu chính thức (Deep Cobalt Navy & Warm Orange/Gold). 
        Giữ nguyên 100% bố cục và kiến trúc mã nguồn hiện tại, cung cấp 3 phương án tinh chỉnh trực tiếp để Ban Lãnh đạo và Khách hàng lựa chọn.
      </p>

      <div class="cover-box-grid">
        <div class="cover-box">
          <h4>Phương Án 1: Classic Navy & Gold</h4>
          <p>Chuẩn mực phong cách Doanh nhân sang trọng, thẻ hội viên ảnh bìa skyline, 8 icon tối giản 2 tone màu nhận diện.</p>
        </div>
        <div class="cover-box">
          <h4>Phương Án 2: Digital Sapphire Tech</h4>
          <p>Ứng dụng cấu trúc đồ họa số 3D Sapphire (từ Google Drive), thẻ hội viên công nghệ, 8 icon đa sắc chuẩn iOS 18.</p>
        </div>
        <div class="cover-box">
          <h4>Phương Án 3: B2B Commerce Focus</h4>
          <p>Tối ưu giao thương B2B thực chiến, thẻ hội viên nổi bật tên doanh nghiệp & ngành nghề, icon phẳng hiện đại.</p>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-meta">
        <div><strong>Dự án:</strong> VIONE Super-App • CLB Doanh Nhân CEO 1983</div>
        <div><strong>Tiêu chí:</strong> Chuẩn hóa thương hiệu • Khớp mã nguồn 100%</div>
        <div><strong>Thời gian:</strong> 09/2026</div>
      </div>
    </div>
  </div>

  <!-- ==================== TRANG 2: TỔNG QUAN BRAND & TIÊU CHÍ ==================== -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-img" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
      <div class="doc-badge">Chuẩn hóa nhận diện & Kiến trúc app</div>
    </div>

    <h2 class="section-title">Quy Chuẩn Nhận Diện & Định Hướng Tinh Chỉnh</h2>
    <p class="section-subtitle">Khai thác giá trị thương hiệu cốt lõi và tối ưu hóa trải nghiệm người dùng mobile.</p>

    <div class="callout callout-blue">
      <strong>Nguyên tắc triển khai:</strong> Bảo toàn 100% cấu trúc logic và luồng dữ liệu hiện tại của hệ sinh thái ViOne. 
      Đội ngũ kỹ thuật chỉ tinh chỉnh trực tiếp các class hiển thị và layout thẻ trong <code>association.index.tsx</code>, 
      hoàn thành nhanh chóng trong 15-20 phút mà không làm gián đoạn hệ thống.
    </div>

    <table class="table-spec">
      <thead>
        <tr>
          <th style="width: 28%;">Khu vực chuẩn hóa</th>
          <th style="width: 32%;">Mục tiêu nâng cấp UX/UI</th>
          <th style="width: 40%;">Giải pháp kỹ thuật chi tiết</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Logo Thương Hiệu</strong></td>
          <td>Đồng bộ tuyệt đối biểu tượng số 83 cách điệu và chữ CEO 1983 chuẩn dải màu.</td>
          <td>Sử dụng file vector/PNG gốc (<code>ceo1983-logo.png</code>). Màu xanh Navy (#24338a) ở chữ CEO và màu Cam (#f97316) ở số 1983 sắc nét trên mọi độ phân giải.</td>
        </tr>
        <tr>
          <td><strong>2. Thẻ Hội Viên VIP</strong></td>
          <td>Mở rộng không gian hiển thị, tăng tính bề thế và cá nhân hóa danh vị doanh nhân.</td>
          <td>Tăng chiều cao thẻ (từ 72px lên 110px), bổ sung dải ảnh bìa (cover) tòa nhà/họa tiết CLB, avatar kích thước lớn viền vàng VIP, đầy đủ họ tên, công ty và mã hội viên.</td>
        </tr>
        <tr>
          <td><strong>3. Lưới Tính Năng Nhanh (8 icon)</strong></td>
          <td>Tăng độ rõ nét của chữ, bố cục mạch lạc, tối ưu khả năng nhận diện chức năng.</td>
          <td>Tăng kích thước font chữ lên <strong>13px font-bold</strong>, bỏ các chi tiết tuyết rơi phụ để giao diện thanh thoát, icon đổ bóng mềm mại theo 2 màu chủ đạo.</td>
        </tr>
        <tr>
          <td><strong>4. Khối Ưu Đãi & Quyền Lợi</strong></td>
          <td>Đồng bộ màu sắc nút bấm và khung viền với tổng thể ứng dụng.</td>
          <td>Chuyển nút CTA "Xem ưu đãi ngay" sang tone xanh Navy thương hiệu (#003B95), giữ nguyên box quà và nội dung xúc tiến giao thương.</td>
        </tr>
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 6px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #003B95; margin-bottom: 3px;">DEEP NAVY (#003B95 / #24338A)</div>
        <div style="height: 14px; background: #003B95; border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Màu chữ CEO & nền thẻ: Uy tín, trí tuệ và sự phát triển bền vững.</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #EA580C; margin-bottom: 3px;">WARM ORANGE / GOLD (#EA580C)</div>
        <div style="height: 14px; background: #EA580C; border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Màu số 1983 & viền VIP: Năng lượng, thịnh vượng và kết nối giao thương.</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
        <div style="font-size: 10px; font-weight: 800; color: #0284C7; margin-bottom: 3px;">CYBER SAPPHIRE GLASS</div>
        <div style="height: 14px; background: linear-gradient(90deg, #0284c7, #38bdf8); border-radius: 5px; margin-bottom: 5px;"></div>
        <p style="font-size: 9.5px; color: #64748b;">Cấu trúc đồ họa chuyển đổi số 3D lấy cảm hứng từ thư mục nhận diện thương hiệu.</p>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Báo cáo Chuẩn hóa Giao diện</div>
      <div>Trang 2 / 5</div>
    </div>
  </div>

  <!-- ==================== TRANG 3: PHƯƠNG ÁN 1 ==================== -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-img" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
      <div class="doc-badge">Phương án 1 (Khuyên dùng)</div>
    </div>

    <h2 class="section-title">Phương Án 1: Classic Navy & Gold (Chuẩn Mực Doanh Nhân)</h2>
    <p class="section-subtitle">Phương án cân bằng tối ưu giữa tính nhận diện thương hiệu và sự sang trọng, tinh tế.</p>

    <div class="showcase-grid">
      ${renderPhoneMockup('option1')}

      <div class="specs-column">
        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-blue">Đặc trưng 1</span>
            Thẻ Hội Viên Skyline Bề Thế
          </h4>
          <p>
            • <strong>Dải ảnh bìa Skyline sang trọng:</strong> Nửa trên thẻ là hình ảnh tòa nhà kiến trúc hiện đại, tạo chiều sâu thị giác.<br>
            • <strong>Avatar lớn viền vàng VIP:</strong> Nổi bật vị thế doanh nhân, đi kèm họ tên <code>Đỗ Thị Mai</code> và tên doanh nghiệp.<br>
            • <strong>Badge VIP GOLD & Mã M1983-012:</strong> Đặt ngay dưới tên, người dùng bấm vào là sao chép hoặc chuyển sang trang thẻ dễ dàng.
          </p>
        </div>

        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-orange">Đặc trưng 2</span>
            8 Icon Tính Năng Tối Giản 2 Tone Màu
          </h4>
          <p>
            • <strong>Đồng bộ màu thương hiệu:</strong> Icon sử dụng 2 màu chủ đạo Navy (#003B95) và Cam (#EA580C) với nền bo tròn mềm mại.<br>
            • <strong>Typography chuẩn Mobile UX:</strong> Font chữ tăng lên <strong>13px font-bold</strong>, sắc nét, không còn hiện tượng chữ bé khó đọc.<br>
            • <strong>Giao diện sạch sẽ:</strong> Loại bỏ các chi tiết phụ rườm rà, tập trung vào công năng sử dụng.
          </p>
        </div>

        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-green">Đặc trưng 3</span>
            Khối Ưu Đãi Đồng Bộ
          </h4>
          <p>
            • <strong>Nút CTA sắc sảo:</strong> Nút "Xem ưu đãi ngay" chuyển sang màu xanh Navy đậm #003B95 đồng bộ hoàn toàn với logo và thẻ.<br>
            • <strong>Box quà tặng 3D tĩnh:</strong> Sang trọng, trang nhã, không gây xao nhãng.
          </p>
        </div>

        <div class="callout callout-blue" style="margin-bottom: 0;">
          <strong>Đánh giá phương án 1:</strong> Thích hợp nhất cho nhóm đối tượng Doanh nhân & Lãnh đạo cấp cao. Dễ áp dụng ngay vào mã nguồn hiện tại.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Báo cáo Chuẩn hóa Giao diện</div>
      <div>Trang 3 / 5</div>
    </div>
  </div>

  <!-- ==================== TRANG 4: PHƯƠNG ÁN 2 ==================== -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-img" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
      <div class="doc-badge">Phương án 2: Digital Sapphire</div>
    </div>

    <h2 class="section-title">Phương Án 2: Digital Sapphire Tech (Kỷ Nguyên Số B2B)</h2>
    <p class="section-subtitle">Lấy cảm hứng từ cấu trúc đồ họa 3D Sapphire trong thư mục nhận diện thương hiệu Google Drive.</p>

    <div class="showcase-grid">
      ${renderPhoneMockup('option2')}

      <div class="specs-column">
        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-blue">Đặc trưng 1</span>
            Thẻ Hội Viên 3D Sapphire Glass
          </h4>
          <p>
            • <strong>Ảnh bìa tinh thể số đa chiều:</strong> Sử dụng trực tiếp cấu trúc đồ họa 3D trong Drive làm nền thẻ hội viên.<br>
            • <strong>Avatar viền xanh Cyan phát sáng:</strong> Tạo cảm giác hiện đại, trẻ trung, đại diện cho doanh nghiệp tiên phong công nghệ.<br>
            • <strong>Tích hợp QR & NFC trực quan:</strong> Sẵn sàng chạm kết nối trao đổi danh thiếp số.
          </p>
        </div>

        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-orange">Đặc trưng 2</span>
            Lưới 8 Icon Đa Sắc (VisionOS Style)
          </h4>
          <p>
            • <strong>Icon đa màu sinh động:</strong> Mỗi chức năng có một tone màu pastel riêng biệt (Xanh ngọc, Tím, Cam, Hồng) giúp nhận diện cực nhanh.<br>
            • <strong>Micro-badges nổi bật:</strong> Hiển thị số lượng thông báo mới kích thích hội viên truy cập tin tức và sự kiện giao thương.<br>
            • <strong>Font chữ to rõ ràng:</strong> Giữ vững tiêu chuẩn 13px bold dễ thao tác.
          </p>
        </div>

        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-green">Đặc trưng 3</span>
            Khối Ưu Đãi Trẻ Trung & Năng Động
          </h4>
          <p>
            • <strong>Nút bấm màu Cyber Blue (#0284C7):</strong> Hiện đại, nổi bật trên nền trắng ngọc trai của ứng dụng.<br>
            • <strong>Bố cục thông thoáng:</strong> Khoảng cách các khối được tối ưu hóa cho màn hình cảm ứng di động.
          </p>
        </div>

        <div class="callout callout-green" style="margin-bottom: 0;">
          <strong>Đánh giá phương án 2:</strong> Phù hợp với định hướng Chuyển đổi số toàn diện của CLB CEO 1983. Mang phong cách quốc tế hiện đại.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Báo cáo Chuẩn hóa Giao diện</div>
      <div>Trang 4 / 5</div>
    </div>
  </div>

  <!-- ==================== TRANG 5: PHƯƠNG ÁN 3 & BẢNG SO SÁNH ==================== -->
  <div class="page">
    <div class="top-brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-img" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
      <div class="doc-badge">Phương án 3 & So sánh tổng kết</div>
    </div>

    <h2 class="section-title">Phương Án 3: B2B Commerce Focus & Tổng Kết</h2>
    <p class="section-subtitle">Phương án tập trung vào tính thực chiến giao thương kết nối doanh nghiệp.</p>

    <div class="showcase-grid">
      ${renderPhoneMockup('option3')}

      <div class="specs-column">
        <div class="spec-card">
          <h4>
            <span class="tag-pill tag-blue">Đặc trưng Phương án 3</span>
            Thẻ Toàn Cảnh Tập Trung Doanh Nghiệp
          </h4>
          <p>
            • <strong>Tôn vinh thương hiệu doanh nghiệp:</strong> Tên công ty được đẩy lên vị trí trung tâm nổi bật nhất trên thẻ.<br>
            • <strong>Icon Flat Minimalist:</strong> 8 biểu tượng chức năng thiết kế phẳng tối giản, màu xám đậm chuyên nghiệp.<br>
            • <strong>Nút hành động tối màu (#0F172A):</strong> Tạo cảm giác chắc chắn, quyền uy của các tập đoàn lớn.
          </p>
        </div>

        <div class="spec-card">
          <h4>Bảng So Sánh 3 Phương Án Thiết Kế</h4>
          <table style="width:100%;font-size:9.5px;border-collapse:collapse;margin-top:4px;">
            <tr style="background:#f1f5f9;">
              <th style="padding:4px 6px;border:1px solid #cbd5e1;text-align:left;">Tiêu chí</th>
              <th style="padding:4px 6px;border:1px solid #cbd5e1;">PA 1 (Classic)</th>
              <th style="padding:4px 6px;border:1px solid #cbd5e1;">PA 2 (Digital)</th>
              <th style="padding:4px 6px;border:1px solid #cbd5e1;">PA 3 (Commerce)</th>
            </tr>
            <tr>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;font-weight:700;">Tone màu chủ đạo</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Navy & Gold</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Sapphire & Multi</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Slate & Orange</td>
            </tr>
            <tr>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;font-weight:700;">Phong cách thẻ VIP</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Doanh nhân lịch lãm</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Công nghệ số 3D</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;">Hồ sơ doanh nghiệp</td>
            </tr>
            <tr>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;font-weight:700;">Thời gian triển khai</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;color:#16a34a;font-weight:700;">15 phút</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;color:#16a34a;font-weight:700;">20 phút</td>
              <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;color:#16a34a;font-weight:700;">15 phút</td>
            </tr>
          </table>
        </div>

        <div class="callout callout-blue" style="margin-bottom: 0;">
          <strong>🎯 Khuyến nghị:</strong> Đề xuất chọn <strong>Phương án 1 (Classic Navy & Gold)</strong> vì khớp 100% với nhận diện thương hiệu logo CEO 1983 và văn hóa doanh nhân Việt Nam!
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Báo cáo Chuẩn hóa Giao diện</div>
      <div>Trang 5 / 5</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.resolve('scratch/de_xuat_chuan_hoa_ceo1983.html');
fs.writeFileSync(htmlFilePath, fullHtml, 'utf8');

const pdfOutputPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Generating 5-page PDF with authentic CEO 1983 logo and 3 layout options...');
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "file:///${htmlFilePath.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfOutputPath);
  console.log('SUCCESS! PDF generated at:', pdfOutputPath, 'Size:', stats.size, 'bytes');

  // Copy to artifact directory for easy download
  const artifactPdf = 'C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\74644533-8bb8-4b29-a589-3d8714601888\\DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf';
  fs.copyFileSync(pdfOutputPath, artifactPdf);
  console.log('Copied to artifacts:', artifactPdf);
} catch (err) {
  console.error('Error generating PDF:', err);
}
