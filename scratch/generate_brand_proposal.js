const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load authentic brand assets
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

// Function to render Phone Screen 1: Home Dashboard
function renderScreenHome(optionType) {
  let cardBg = '';
  let cardCover = '';
  let avatarBorder = '#f59e0b';
  let badgeClass = 'bg-[#fef3c7] text-[#b45309]';
  let btnColor = '#003B95';

  if (optionType === 'option1') {
    cardBg = 'linear-gradient(145deg, #0a192f 0%, #1e3a8a 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.35;`;
    btnColor = '#003B95';
    avatarBorder = '#f59e0b';
    badgeClass = 'bg-[#fef3c7] text-[#b45309]';
  } else if (optionType === 'option2') {
    cardBg = 'linear-gradient(145deg, #031525 0%, #0369a1 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${sapphireBase64}'); background-size: cover; background-position: center; opacity: 0.4;`;
    avatarBorder = '#38bdf8';
    badgeClass = 'bg-[#e0f2fe] text-[#0369a1]';
    btnColor = '#0284c7';
  } else {
    // option3
    cardBg = 'linear-gradient(145deg, #0f172a 0%, #334155 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.22;`;
    avatarBorder = '#ea580c';
    badgeClass = 'bg-[#ffedd5] text-[#c2410c]';
    btnColor = '#0f172a';
  }

  const iconsData = [
    { name: 'Thẻ VIP', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>', color: optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#e0f2fe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Danh thiếp', iconSvg: '<path d="M16 2v4"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="11" r="3"/>', color: '#ea580c', bg: '#ffedd5', badge: 'Mới' },
    { name: 'Hội viên', iconSvg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', color: optionType === 'option2' ? '#10b981' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#d1fae5' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Sự kiện', iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>', color: optionType === 'option2' ? '#f59e0b' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#fef3c7' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa', badge: '2' },
    { name: 'Tin tức', iconSvg: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/>', color: optionType === 'option2' ? '#8b5cf6' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#ede9fe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa', badge: '5' },
    { name: 'Tài liệu', iconSvg: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13Z"/>', color: optionType === 'option2' ? '#06b6d4' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#cffafe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Liên hệ', iconSvg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', color: '#ea580c', bg: '#ffedd5', badge: '1' },
    { name: 'Ưu đãi', iconSvg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', color: optionType === 'option2' ? '#ec4899' : optionType === 'option3' ? '#475569' : '#003B95', bg: optionType === 'option2' ? '#fce7f3' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
  ];

  return `
    <div class="device-screen">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:3px;align-items:center;">
          <span style="font-size:7px;">5G</span>
          <span style="font-size:8px;">100%</span>
        </div>
      </div>

      <!-- App Header -->
      <div class="m-app-header">
        <img class="m-header-logo" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
        <div class="m-notif-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${btnColor}" stroke-width="2.2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="m-notif-dot">3</span>
        </div>
      </div>

      <!-- Hero Stripe -->
      <div class="m-hero-stripe"></div>

      <!-- Member Card Widget -->
      <div class="m-member-widget" style="background:${cardBg};">
        <div class="m-widget-cover" style="${cardCover}"></div>
        <div class="m-widget-body">
          <div class="m-widget-avatar" style="border-color:${avatarBorder};">
            <span>MT</span>
          </div>
          <div class="m-widget-info">
            <div class="m-widget-company">Du Lịch Quốc Tế Á Châu</div>
            <div class="m-widget-name">Đỗ Thị Mai</div>
            <div class="m-widget-tags">
              <span class="m-tag ${badgeClass}">VIP GOLD</span>
              <span class="m-tag bg-white/10 text-white/90">M1983-012</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="m-section-wrap">
        <div class="m-section-header">TÍNH NĂNG NHANH</div>
        <div class="m-grid-8">
          ${iconsData.map(item => `
            <div class="m-grid-item">
              <div class="m-icon-box" style="background:${item.bg};color:${item.color};">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${item.iconSvg}
                </svg>
                ${item.badge ? `<span class="m-item-badge">${item.badge}</span>` : ''}
              </div>
              <span class="m-item-label">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Featured Event -->
      <div class="m-section-wrap" style="margin-top:4px;">
        <div class="m-section-header">SỰ KIỆN NỔI BẬT</div>
        <div class="m-event-card">
          <div class="m-event-date" style="background:${btnColor};">
            <span style="font-size:9px;font-weight:900;color:#fff;line-height:1;">16</span>
            <span style="font-size:5.5px;font-weight:700;color:rgba(255,255,255,0.85);">SEP</span>
          </div>
          <div class="m-event-content">
            <div style="font-size:6px;color:#64748b;font-weight:600;">07:00 • CLB CEO 1983</div>
            <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;margin:1px 0;">Đại Hội Doanh Nhân CEO 1983</div>
            <div style="font-size:6px;color:#94a3b8;">TT Hội Nghị Quốc Gia</div>
          </div>
        </div>
      </div>

      <!-- Perks & Rewards Box (from association.index.tsx) -->
      <div class="m-perks-wrap">
        <div style="flex:1;">
          <div style="font-size:6.5px;font-weight:800;color:${btnColor};display:flex;align-items:center;gap:2px;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Ưu đãi Đối tác
          </div>
          <div style="font-size:5px;color:#64748b;line-height:1.2;">Chính sách trợ giá & quà tặng liên kết</div>
        </div>
        <div style="width:18px;height:18px;flex-shrink:0;">
          <img src="data:image/png;base64,${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
        </div>
      </div>

      <!-- Bottom Nav -->
      <div class="m-bottom-nav">
        <div class="m-nav-item active">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="${btnColor}"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span style="color:${btnColor};font-weight:800;">Trang chủ</span>
        </div>
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center">
          <img src="data:image/png;base64,${emblemBase64}" style="width:16px;height:16px;object-fit:contain;" alt="CEO">
        </div>
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
          <span>Thông báo</span>
        </div>
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Function to render Phone Screen 2: Member Digital Card (NFC & QR)
function renderScreenCard(optionType) {
  let cardSurface = '';
  let cardAccent = '#f59e0b';
  let btnStyle = 'background:#003B95;color:#ffffff;';

  if (optionType === 'option1') {
    cardSurface = 'linear-gradient(135deg, #091a32 0%, #173263 50%, #0c2040 100%)';
    cardAccent = '#f59e0b';
    btnStyle = 'background:#003B95;color:#ffffff;';
  } else if (optionType === 'option2') {
    cardSurface = 'linear-gradient(135deg, #02182b 0%, #0369a1 60%, #0284c7 100%)';
    cardAccent = '#38bdf8';
    btnStyle = 'background:#0284c7;color:#ffffff;';
  } else {
    cardSurface = 'linear-gradient(135deg, #0f172a 0%, #334155 70%, #1e293b 100%)';
    cardAccent = '#ea580c';
    btnStyle = 'background:#0f172a;color:#ffffff;';
  }

  return `
    <div class="device-screen">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:3px;align-items:center;">
          <span style="font-size:7px;">5G</span>
          <span style="font-size:8px;">100%</span>
        </div>
      </div>

      <!-- Inner Header -->
      <div class="m-inner-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        <span class="m-inner-title">Thẻ Hội Viên Điện Tử</span>
        <div style="width:14px;"></div>
      </div>

      <!-- Tab Switcher -->
      <div class="m-tab-switcher">
        <div class="m-tab-btn active" style="background:${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#0f172a' : '#003B95'};">
          <span>Thẻ của tôi</span>
        </div>
        <div class="m-tab-btn">
          <span>Quét mã QR</span>
        </div>
      </div>

      <!-- Full Digital Pass Card -->
      <div class="m-pass-card" style="background:${cardSurface};">
        <div class="m-pass-header">
          <div style="display:flex;align-items:center;gap:4px;">
            <img src="data:image/png;base64,${emblemBase64}" style="width:16px;height:16px;object-fit:contain;" alt="83">
            <div>
              <div style="font-size:7.5px;font-weight:900;color:#ffffff;letter-spacing:0.3px;">CLB DOANH NHÂN CEO 1983</div>
              <div style="font-size:5px;color:rgba(255,255,255,0.7);letter-spacing:0.2px;">NÂNG TẦM GIÁ TRỊ • TIÊN PHONG KẾT NỐI</div>
            </div>
          </div>
          <span style="font-size:6.5px;font-weight:800;color:${cardAccent};padding:1px 4px;background:rgba(255,255,255,0.1);border-radius:3px;">VIP PASS</span>
        </div>

        <div style="margin:8px 0 6px 0;display:flex;gap:6px;align-items:center;">
          <div style="width:28px;height:28px;border-radius:50%;border:1.5px solid ${cardAccent};background:#1e3a8a;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800;flex-shrink:0;">
            MT
          </div>
          <div>
            <div style="font-size:9px;font-weight:900;color:#ffffff;line-height:1.2;">ĐỖ THỊ MAI</div>
            <div style="font-size:6.5px;color:rgba(255,255,255,0.85);">CÔNG TY TNHH DU LỊCH Á CHÂU</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.15);padding-top:4px;margin-top:4px;">
          <div>
            <div style="font-size:5px;color:rgba(255,255,255,0.6);">MÃ HỘI VIÊN</div>
            <div style="font-size:7.5px;font-weight:800;color:#ffffff;">M1983-012</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:5px;color:rgba(255,255,255,0.6);">HẠN DÙNG</div>
            <div style="font-size:7.5px;font-weight:800;color:#ffffff;">31/12/2026</div>
          </div>
        </div>
      </div>

      <!-- Connectivity Action Buttons -->
      <div class="m-card-actions">
        <button class="m-action-btn" style="${btnStyle}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Mã QR Xác Thực
        </button>
        <button class="m-action-btn" style="background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/></svg>
          Chạm Thẻ NFC
        </button>
      </div>

      <!-- 4 Quick Actions (from association.card.tsx) -->
      <div class="m-card-subgrid">
        <div class="m-subgrid-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Quyền lợi</span>
        </div>
        <div class="m-subgrid-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>
          <span>Lịch sử</span>
        </div>
        <div class="m-subgrid-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
          <span>Gia hạn</span>
        </div>
        <div class="m-subgrid-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Hồ sơ</span>
        </div>
      </div>

      <!-- Sync Status -->
      <div style="margin-top:auto;padding-bottom:5px;text-align:center;">
        <span style="font-size:5.5px;color:#64748b;display:inline-flex;align-items:center;gap:3px;">
          <span style="width:4px;height:4px;border-radius:50%;background:#16a34a;display:inline-block;"></span>
          Đã đồng bộ trực tuyến
        </span>
      </div>
    </div>
  `;
}

// Function to render Phone Screen 3: B2B Events Screen
function renderScreenEvents(optionType) {
  let activeTagBg = '#003B95';
  let dateBadgeBg = '#003B95';

  if (optionType === 'option2') {
    activeTagBg = '#0284c7';
    dateBadgeBg = '#0284c7';
  } else if (optionType === 'option3') {
    activeTagBg = '#0f172a';
    dateBadgeBg = '#0f172a';
  }

  return `
    <div class="device-screen">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:3px;align-items:center;">
          <span style="font-size:7px;">5G</span>
          <span style="font-size:8px;">100%</span>
        </div>
      </div>

      <!-- Inner Header -->
      <div class="m-inner-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        <span class="m-inner-title">Sự Kiện & Diễn Đàn</span>
        <div style="width:14px;"></div>
      </div>

      <!-- Filter Tags -->
      <div class="m-filter-bar">
        <span class="m-filter-pill active" style="background:${activeTagBg};color:#ffffff;">Tất cả (4)</span>
        <span class="m-filter-pill">Đại hội</span>
        <span class="m-filter-pill">Gala B2B</span>
        <span class="m-filter-pill">Tọa đàm</span>
      </div>

      <!-- Event 1 Card (Highlight) -->
      <div class="m-event-full-card">
        <div class="m-event-banner" style="background:linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%);">
          <span class="m-banner-tag">SẮP DIỄN RA</span>
          <div style="position:absolute;bottom:4px;left:6px;right:6px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="color:#ffffff;">
              <span style="font-size:12px;font-weight:900;line-height:1;display:block;">16</span>
              <span style="font-size:6px;font-weight:700;letter-spacing:0.5px;">THÁNG 9</span>
            </div>
            <span style="font-size:6.5px;color:rgba(255,255,255,0.9);background:rgba(0,0,0,0.4);padding:1px 4px;border-radius:3px;">07:00 SÁNG</span>
          </div>
        </div>
        <div style="padding:4px 6px;">
          <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
          <div style="font-size:5.5px;color:#64748b;margin-top:1.5px;">📍 TT Hội Nghị Quốc Gia, Hà Nội</div>
          <div style="margin-top:3px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:5.5px;color:#16a34a;font-weight:700;">● Hội viên miễn phí vé</span>
            <button style="background:${activeTagBg};color:#ffffff;border:none;border-radius:3px;font-size:6px;font-weight:700;padding:2px 6px;">Đăng ký</button>
          </div>
        </div>
      </div>

      <!-- Event 2 Card -->
      <div class="m-event-mini-card">
        <div style="width:24px;height:26px;border-radius:5px;background:${dateBadgeBg};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
          <span style="font-size:8.5px;font-weight:900;line-height:1;">28</span>
          <span style="font-size:5px;font-weight:700;">SEP</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:6.5px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Gala Dinner Kết Nối Giao Thương 2026</div>
          <div style="font-size:5px;color:#64748b;">18:00 • KS JW Marriott Hà Nội</div>
        </div>
        <span style="font-size:5px;font-weight:700;color:#16a34a;background:#dcfce7;padding:1px 3px;border-radius:3px;flex-shrink:0;">Đã đ/k</span>
      </div>

      <!-- Event 3 Card -->
      <div class="m-event-mini-card" style="margin-top:2px;">
        <div style="width:24px;height:26px;border-radius:5px;background:${dateBadgeBg};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
          <span style="font-size:8.5px;font-weight:900;line-height:1;">15</span>
          <span style="font-size:5px;font-weight:700;">OCT</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:6.5px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Tọa Đàm: Quản Trị Tinh Gọn & AI 2026</div>
          <div style="font-size:5px;color:#64748b;">14:00 • Trung Tâm Đổi Mới Sáng Tạo</div>
        </div>
        <span style="font-size:5px;font-weight:700;color:#0284c7;background:#e0f2fe;padding:1px 3px;border-radius:3px;flex-shrink:0;">Mở đ/k</span>
      </div>

      <!-- Bottom Nav -->
      <div class="m-bottom-nav">
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-item active">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="${activeTagBg}"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span style="color:${activeTagBg};font-weight:800;">Sự kiện</span>
        </div>
        <div class="m-nav-center">
          <img src="data:image/png;base64,${emblemBase64}" style="width:16px;height:16px;object-fit:contain;" alt="CEO">
        </div>
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
          <span>Thông báo</span>
        </div>
        <div class="m-nav-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Master HTML generation for 6 pages
const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hồ Sơ Đề Xuất Thiết Kế Giao Diện App CLB Doanh Nhân CEO 1983</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

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
      padding: 12mm 14mm 10mm 14mm;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    .brand-top-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #003B95 0%, #0284C7 50%, #EA580C 100%);
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 10px;
      flex-shrink: 0;
    }

    .brand-logo-header {
      height: 25px;
      width: auto;
      object-fit: contain;
    }

    .header-category-tag {
      font-size: 9.5px;
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
      font-size: 9px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      flex-shrink: 0;
    }

    /* ==================== COVER PAGE ==================== */
    .cover-page {
      background: radial-gradient(circle at 85% 15%, #0d2847 0%, #041426 50%, #020813 100%);
      color: #ffffff;
      padding: 26mm 18mm 16mm 18mm;
      justify-content: space-between;
    }

    .cover-top-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      background: rgba(2, 132, 199, 0.18);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cover-main-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }
    .cover-main-title span {
      background: linear-gradient(90deg, #38bdf8 0%, #f97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-lead {
      font-size: 12.5px;
      line-height: 1.65;
      color: #94a3b8;
      max-width: 580px;
      margin-bottom: 26px;
    }

    .cover-concepts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .cover-concept-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px;
    }
    .cover-concept-card h4 {
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .cover-concept-card p {
      font-size: 9.5px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .cover-metadata-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }

    /* ==================== PAGE 2: BRAND SYSTEM ==================== */
    h2.doc-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-bottom: 3px;
    }
    p.doc-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .brand-manifesto-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 3.5px solid #0284c7;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: 11px;
      line-height: 1.55;
      color: #0369a1;
    }

    .color-system-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .color-token-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      background: #f8fafc;
    }
    .color-token-name {
      font-size: 9.5px;
      font-weight: 800;
      margin-bottom: 3px;
    }
    .color-swatch-bar {
      height: 14px;
      border-radius: 5px;
      margin-bottom: 6px;
    }
    .color-token-meaning {
      font-size: 9px;
      color: #64748b;
      line-height: 1.4;
    }

    .touchpoints-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 12px;
    }
    .touchpoints-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
    }
    .touchpoints-table td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      color: #334155;
      line-height: 1.45;
      vertical-align: top;
    }
    .touchpoints-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* ==================== 3-PHONE SHOWCASE GRID ==================== */
    .concept-showcase-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
      justify-items: center;
    }

    .phone-column-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    .phone-column-label {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Device Screen Mockup (Width: 56mm, Height: 120mm) */
    .device-screen {
      width: 56mm;
      height: 122mm;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      position: relative;
    }

    /* Mockup internal components */
    .m-status-bar {
      height: 12px;
      padding: 1px 10px 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 6.5px;
      font-weight: 700;
      color: #1e293b;
      background: #ffffff;
      flex-shrink: 0;
    }

    .m-app-header {
      height: 24px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }
    .m-header-logo {
      height: 16px;
      width: auto;
      object-fit: contain;
    }
    .m-notif-btn {
      position: relative;
      width: 18px;
      height: 18px;
      border-radius: 5px;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .m-notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 5px;
      font-weight: 900;
      padding: 0.5px 2.5px;
      border-radius: 999px;
    }

    .m-hero-stripe {
      height: 12px;
      background: linear-gradient(180deg, rgba(2,132,199,0.12) 0%, rgba(2,132,199,0.01) 100%);
      flex-shrink: 0;
    }

    .m-member-widget {
      margin: -8px 6px 0 6px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      flex-shrink: 0;
    }
    .m-widget-cover {
      height: 20px;
      width: 100%;
    }
    .m-widget-body {
      padding: 4px 6px 6px 6px;
      display: flex;
      align-items: center;
      gap: 5px;
      position: relative;
    }
    .m-widget-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid #f59e0b;
      background: linear-gradient(135deg, #003B95, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 8px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .m-widget-info {
      flex: 1;
      min-width: 0;
    }
    .m-widget-company {
      font-size: 5.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .m-widget-name {
      font-size: 7.5px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
    }
    .m-widget-tags {
      display: flex;
      gap: 2.5px;
      margin-top: 1.5px;
    }
    .m-tag {
      font-size: 5px;
      font-weight: 800;
      padding: 0.5px 3.5px;
      border-radius: 2px;
    }

    /* Grid 8 */
    .m-section-wrap {
      margin: 5px 6px 0 6px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 4px;
      flex-shrink: 0;
    }
    .m-section-header {
      font-size: 6.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .m-grid-8 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px 1px;
    }
    .m-grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5px;
    }
    .m-icon-box {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .m-item-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 5px;
      font-weight: 900;
      padding: 0.5px 2px;
      border-radius: 999px;
    }
    .m-item-label {
      font-size: 5.5px;
      font-weight: 700;
      color: #334155;
      text-align: center;
      max-width: 26px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Event card in home */
    .m-event-card {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 3px 4px;
    }
    .m-event-date {
      width: 20px;
      height: 22px;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .m-event-content {
      flex: 1;
      min-width: 0;
    }

    .m-perks-wrap {
      margin: 4px 6px 0 6px;
      background: #f8fafc;
      border: 1px solid #e0f2fe;
      border-radius: 6px;
      padding: 3px 5px;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .m-card-subgrid {
      margin: 5px 6px 0 6px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3px;
      flex-shrink: 0;
    }
    .m-subgrid-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 3px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5px;
      font-size: 5px;
      font-weight: 700;
      color: #334155;
    }

    /* Inner Screen Header */
    .m-inner-header {
      height: 22px;
      padding: 0 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }
    .m-inner-title {
      font-size: 7.5px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Tab switcher */
    .m-tab-switcher {
      margin: 5px 6px;
      background: #f1f5f9;
      border-radius: 6px;
      padding: 2px;
      display: flex;
      flex-shrink: 0;
    }
    .m-tab-btn {
      flex: 1;
      text-align: center;
      font-size: 6px;
      font-weight: 700;
      padding: 2.5px 0;
      border-radius: 4px;
      color: #64748b;
    }
    .m-tab-btn.active {
      color: #ffffff;
      font-weight: 800;
    }

    /* Pass card in screen 2 */
    .m-pass-card {
      margin: 2px 6px;
      border-radius: 10px;
      padding: 7px;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .m-pass-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .m-card-actions {
      margin: 6px 6px 0 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
    }
    .m-action-btn {
      width: 100%;
      height: 20px;
      border-radius: 6px;
      font-size: 6.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border: none;
      cursor: pointer;
    }

    /* Filter bar in screen 3 */
    .m-filter-bar {
      margin: 5px 6px;
      display: flex;
      gap: 3px;
      flex-shrink: 0;
    }
    .m-filter-pill {
      font-size: 5.5px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
    }
    .m-filter-pill.active {
      color: #ffffff;
    }

    .m-event-full-card {
      margin: 2px 6px 4px 6px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      background: #ffffff;
      flex-shrink: 0;
    }
    .m-event-banner {
      height: 32px;
      position: relative;
    }
    .m-banner-tag {
      position: absolute;
      top: 3px;
      right: 4px;
      background: #ea580c;
      color: #ffffff;
      font-size: 4.5px;
      font-weight: 800;
      padding: 0.5px 3px;
      border-radius: 2px;
    }
    .m-event-mini-card {
      margin: 2px 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    /* Bottom Nav */
    .m-bottom-nav {
      margin-top: auto;
      height: 24px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 2px;
      flex-shrink: 0;
    }
    .m-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      font-size: 5px;
      font-weight: 600;
      color: #94a3b8;
    }
    .m-nav-center {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #f0f4fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Concept Highlights Box */
    .concept-notes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: auto;
      flex-shrink: 0;
    }
    .concept-note-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 10px;
    }
    .concept-note-title {
      font-size: 10px;
      font-weight: 800;
      color: #003B95;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .concept-note-desc {
      font-size: 9px;
      color: #475569;
      line-height: 1.45;
    }

    .recommendation-banner {
      background: #f0fdf4;
      border-left: 3.5px solid #16a34a;
      border-radius: 8px;
      padding: 7px 10px;
      font-size: 9.5px;
      color: #15803d;
      margin-top: 8px;
      line-height: 1.45;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1: BÌA CONCEPT DESIGN ==================== -->
  <div class="page cover-page">
    <div class="brand-top-stripe"></div>
    <div>
      <div class="cover-top-tag">
        ✦ HỒ SƠ THIẾT KẾ TRẢI NGHIỆM NGƯỜI DÙNG • UI/UX DESIGN CONCEPT
      </div>
      <div style="margin-bottom: 18px;">
        <img src="data:image/png;base64,${logoBase64}" style="height: 52px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" alt="CEO 1983">
      </div>
      <h1 class="cover-main-title">
        ĐỀ XUẤT ĐỊNH HƯỚNG GIAO DIỆN<br>
        <span>HỆ SINH THÁI SỐ CEO 1983</span>
      </h1>
      <p class="cover-lead">
        Chuẩn hóa toàn diện ngôn ngữ thị giác và hệ thống nhận diện thương hiệu cho Ứng dụng Di động CLB Doanh Nhân CEO 1983. 
        Tối ưu hóa hành trình trải nghiệm hội viên, bảo toàn nguyên vẹn tính năng nghiệp vụ và cung cấp 3 phương án thẩm mỹ để Ban Lãnh đạo lựa chọn.
      </p>

      <div class="cover-concepts-grid">
        <div class="cover-concept-card">
          <h4>Phương Án 1 • Classic Navy & Gold</h4>
          <p>Chuẩn mực Doanh nhân lịch lãm. Cân bằng tuyệt đối giữa sắc xanh trí tuệ Cobalt và ánh kim thịnh vượng.</p>
        </div>
        <div class="cover-concept-card">
          <h4>Phương Án 2 • Digital Sapphire</h4>
          <p>Kỷ nguyên chuyển đổi số. Đồ họa tinh thể số 3D đa diện, hơi thở công nghệ cao và biểu tượng đa sắc sinh động.</p>
        </div>
        <div class="cover-concept-card">
          <h4>Phương Án 3 • B2B Commerce Focus</h4>
          <p>Giao thương thực chiến tối giản. Tôn vinh danh vị doanh nghiệp, tinh giản thị giác, tối đa hóa hiệu suất kết nối.</p>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-metadata-footer">
        <div><strong>Đơn vị thực hiện:</strong> Phòng Thiết Kế Sản Phẩm Số • VIONE Studio</div>
        <div><strong>Đối tác:</strong> CLB Doanh Nhân CEO 1983</div>
        <div><strong>Phiên bản:</strong> Design Concept Release • 09/2026</div>
      </div>
    </div>
  </div>

  <!-- ==================== TRANG 2: HỆ THỐNG NHẬN DIỆN & ĐIỂM CHẠM ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag">Quy Chuẩn Nhận Diện & Điểm Chạm Thị Giác</div>
    </div>

    <h2 class="doc-title">Triết Lý Thiết Kế & Bản Sắc Thương Hiệu CEO 1983</h2>
    <p class="doc-subtitle">Định hình bản sắc thương hiệu số đẳng cấp, uy tín và giàu năng lượng kết nối của giới doanh nhân.</p>

    <div class="brand-manifesto-box">
      <strong>Triết lý thiết kế cốt lõi:</strong> "Kết Nối Bản Lĩnh • Tiên Phong Định Hình Tương Lai". 
      Mỗi chi tiết giao diện trên ứng dụng di động được xem như một điểm chạm đại diện cho sự bề thế của tổ chức. 
      Thiết kế tôn vinh biểu tượng vô cực số <strong>83</strong> cách điệu, kết hợp hài hòa giữa bản lĩnh kiên định và năng lượng bứt phá vươn mình.
    </div>

    <div class="color-system-grid">
      <div class="color-token-box">
        <div class="color-token-name" style="color:#003B95;">DEEP COBALT NAVY (#003B95 / #24338A)</div>
        <div class="color-swatch-bar" style="background:#003B95;"></div>
        <p class="color-token-meaning">Màu thương hiệu chủ đạo (chữ CEO): Đại diện cho trí tuệ, sự đĩnh đạc, tính bảo mật và uy tín vững chắc của các nhà lãnh đạo.</p>
      </div>
      <div class="color-token-box">
        <div class="color-token-name" style="color:#EA580C;">WARM AMBER / GOLD (#EA580C / #F97316)</div>
        <div class="color-swatch-bar" style="background:#EA580C;"></div>
        <p class="color-token-meaning">Màu thương hiệu nhấn (số 1983): Đại diện cho năng lượng tiên phong, sự thịnh vượng, lòng nhiệt huyết và dòng chảy giao thương phồn vinh.</p>
      </div>
      <div class="color-token-box">
        <div class="color-token-name" style="color:#0284C7;">DIGITAL SAPPHIRE GLASS</div>
        <div class="color-swatch-bar" style="background:linear-gradient(90deg, #0284c7, #38bdf8);"></div>
        <p class="color-token-meaning">Dải màu chuyển đổi số: Biểu trưng cho sự đổi mới sáng tạo, năng lực làm chủ công nghệ và khát vọng hội nhập toàn cầu.</p>
      </div>
    </div>

    <table class="touchpoints-table">
      <thead>
        <tr>
          <th style="width: 25%;">Điểm Chạm Trải Nghiệm</th>
          <th style="width: 35%;">Mục Tiêu Thị Giác & Tâm Lý Học Thiết Kế</th>
          <th style="width: 40%;">Chuẩn Mực Tinh Chỉnh Giao Diện</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Màn Hình Trang Chủ (Home Hub)</strong></td>
          <td>Tạo ấn tượng đầu tiên bề thế, mạch lạc; hội viên nắm bắt ngay thông tin danh vị và các tiện ích trọng tâm.</td>
          <td>Header logo CEO 1983 nổi bật; Thẻ hội viên thu gọn với ảnh nền đô thị; Lưới 8 icon tính năng rõ ràng; Khối sự kiện tâm điểm và ưu đãi đối tác.</td>
        </tr>
        <tr>
          <td><strong>2. Thẻ Hội Viên Số (Digital Member Pass)</strong></td>
          <td>Khẳng định danh vị VIP danh giá của doanh nhân; sẵn sàng trao đổi danh thiếp 1 chạm trong các sự kiện.</td>
          <td>Thẻ toàn cảnh tỷ lệ vàng sang trọng; Tích hợp mã QR xác thực hội viên chính thức; Hỗ trợ một chạm NFC và lưu trữ thẻ vào Apple/Google Wallet.</td>
        </tr>
        <tr>
          <td><strong>3. Diễn Đàn & Sự Kiện (B2B Business Events)</strong></td>
          <td>Kích thích tinh thần tham gia hoạt động cộng đồng, kết nối cơ hội hợp tác kinh doanh và xúc tiến đầu tư.</td>
          <td>Phân loại sự kiện theo chủ đề; Banner ngày giờ nổi bật; Hiển thị danh tính đơn vị tổ chức và nút hành động Đăng ký / Check-in QR tiện lợi.</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <div>Hồ Sơ Thiết Kế Giao Diện • CLB Doanh Nhân CEO 1983</div>
      <div>Trang 2 / 6</div>
    </div>
  </div>

  <!-- ==================== TRANG 3: PHƯƠNG ÁN 1 (KHUYÊN DÙNG) ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#fef3c7;color:#b45309;border-color:#fde68a;">Phương Án 1 (Khuyên Dùng)</div>
    </div>

    <h2 class="doc-title">Phương Án 1: Classic Navy & Gold (Chuẩn Mực Doanh Nhân Lịch Lãm)</h2>
    <p class="doc-subtitle">Ngôn ngữ thiết kế kinh điển, đề cao vẻ đẹp sang trọng, uy tín và sự chuẩn mực của thương hiệu CEO 1983.</p>

    <!-- 3 Phone Screens Row -->
    <div class="concept-showcase-row">
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 1: TRANG CHỦ HỘI VIÊN</div>
        ${renderScreenHome('option1')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderScreenCard('option1')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 3: SỰ KIỆN GIAO THƯƠNG</div>
        ${renderScreenEvents('option1')}
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="concept-notes-grid">
      <div class="concept-note-box">
        <div class="concept-note-title">1. Tinh Thần Doanh Nhân</div>
        <p class="concept-note-desc">Nền thẻ hội viên kết hợp dải skyline đô thị hiện đại và viền vàng VIP tạo nên cảm giác quyền uy, lịch thiệp và tin cậy.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">2. Biểu Tượng 2 Tone Nhận Diện</div>
        <p class="concept-note-desc">Lưới 8 tính năng được đồng bộ bằng 2 tone màu chuẩn nhận diện: Xanh Navy (#003B95) và Cam (#EA580C), loại bỏ mọi xao nhãng.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">3. Điểm Chạm Giao Thương Sang Trọng</div>
        <p class="concept-note-desc">Thẻ danh thiếp số và danh sách sự kiện sử dụng typography dày dặn, nút bấm Navy vững chãi, tạo sự trang nhã tuyệt đối.</p>
      </div>
    </div>

    <div class="recommendation-banner">
      <strong>🎯 Đánh giá của Giám đốc Thiết kế:</strong> Đây là phương án hoàn hảo nhất cho CLB CEO 1983. Sự hòa quyện giữa sắc xanh Navy và ánh kim Amber mang đến vẻ ngoài sang trọng, đĩnh đạc và phù hợp nhất với vị thế của các nhà lãnh đạo doanh nghiệp.
    </div>

    <div class="page-footer">
      <div>Hồ Sơ Thiết Kế Giao Diện • CLB Doanh Nhân CEO 1983</div>
      <div>Trang 3 / 6</div>
    </div>
  </div>

  <!-- ==================== TRANG 4: PHƯƠNG ÁN 2 ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd;">Phương Án 2: Digital Sapphire</div>
    </div>

    <h2 class="doc-title">Phương Án 2: Digital Sapphire Tech (Kỷ Nguyên Chuyển Đổi Số)</h2>
    <p class="doc-subtitle">Định hình hình ảnh câu lạc bộ tiên phong dẫn dắt làn sóng số hóa với phong cách đồ họa tinh thể 3D hiện đại.</p>

    <!-- 3 Phone Screens Row -->
    <div class="concept-showcase-row">
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 1: TRANG CHỦ HỘI VIÊN</div>
        ${renderScreenHome('option2')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderScreenCard('option2')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 3: SỰ KIỆN GIAO THƯƠNG</div>
        ${renderScreenEvents('option2')}
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="concept-notes-grid">
      <div class="concept-note-box">
        <div class="concept-note-title">1. Đồ Họa Khối Tinh Thể Số</div>
        <p class="concept-note-desc">Nền thẻ hội viên và các thành phần thị giác sử dụng cấu trúc đa diện Sapphire 3D, kết hợp hiệu ứng viền Cyan phát sáng công nghệ.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">2. Lưới Icon Đa Sắc Sinh Động</div>
        <p class="concept-note-desc">Lấy cảm hứng từ ngôn ngữ giao diện Apple VisionOS / iOS mới, mỗi nhóm tính năng có một màu nhận diện riêng giúp tìm kiếm cực nhanh.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">3. Tương Tác Số Hiện Đại</div>
        <p class="concept-note-desc">Thẻ điện tử và giao diện sự kiện mang tone xanh Cyber Blue (#0284C7), trẻ trung, năng động và giàu năng lượng bứt phá.</p>
      </div>
    </div>

    <div class="recommendation-banner" style="background:#f0f9ff;border-color:#0284c7;color:#0369a1;">
      <strong>💡 Đánh giá của Giám đốc Thiết kế:</strong> Phương án tôn vinh tinh thần Chuyển Đổi Số. Thích hợp nếu Ban Lãnh đạo muốn định vị CLB Doanh Nhân CEO 1983 là một tổ chức trẻ trung, hiện đại, luôn đi đầu trong việc ứng dụng công nghệ mới.
    </div>

    <div class="page-footer">
      <div>Hồ Sơ Thiết Kế Giao Diện • CLB Doanh Nhân CEO 1983</div>
      <div>Trang 4 / 6</div>
    </div>
  </div>

  <!-- ==================== TRANG 5: PHƯƠNG ÁN 3 ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#f1f5f9;color:#334155;border-color:#cbd5e1;">Phương Án 3: B2B Commerce</div>
    </div>

    <h2 class="doc-title">Phương Án 3: B2B Commerce Focus (Giao Thương Thực Chiến Tối Giản)</h2>
    <p class="doc-subtitle">Ngôn ngữ thiết kế phẳng tối giản (Flat Minimalist), tập trung tối đa vào thông tin pháp nhân và giao dịch kết nối.</p>

    <!-- 3 Phone Screens Row -->
    <div class="concept-showcase-row">
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 1: TRANG CHỦ HỘI VIÊN</div>
        ${renderScreenHome('option3')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderScreenCard('option3')}
      </div>
      <div class="phone-column-card">
        <div class="phone-column-label">MÀN 3: SỰ KIỆN GIAO THƯƠNG</div>
        ${renderScreenEvents('option3')}
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="concept-notes-grid">
      <div class="concept-note-box">
        <div class="concept-note-title">1. Tôn Vinh Tên Doanh Nghiệp</div>
        <p class="concept-note-desc">Thẻ hội viên đẩy thông tin công ty và ngành nghề kinh doanh lên vị trí nổi bật nhất, biến chiếc thẻ thành hồ sơ năng lực thu nhỏ.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">2. Icon Phẳng Tối Giản</div>
        <p class="concept-note-desc">Bộ biểu tượng sử dụng tone màu trung tính Slate (#475569) với phong cách thiết kế phẳng chuyên nghiệp của các tập đoàn đa quốc gia.</p>
      </div>
      <div class="concept-note-box">
        <div class="concept-note-title">3. Tối Đa Hóa Tính Thực Dụng</div>
        <p class="concept-note-desc">Mọi nút hành động sử dụng sắc màu tối trầm (#0F172A), tạo độ tương phản mạnh mẽ, dễ thao tác và phục vụ hiệu quả cho giao thương.</p>
      </div>
    </div>

    <div class="recommendation-banner" style="background:#f8fafc;border-color:#475569;color:#334155;">
      <strong>📌 Đánh giá của Giám đốc Thiết kế:</strong> Phương án dành riêng cho môi trường giao thương thuần chất B2B. Thiết kế vững chãi, thực dụng, phù hợp với các hội viên ưa chuộng sự tối giản và tập trung vào hiệu quả thương mại.
    </div>

    <div class="page-footer">
      <div>Hồ Sơ Thiết Kế Giao Diện • CLB Doanh Nhân CEO 1983</div>
      <div>Trang 5 / 6</div>
    </div>
  </div>

  <!-- ==================== TRANG 6: MA TRẬN SO SÁNH & KHUYẾN NGHỊ ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag">Tổng Kết & Đề Xuất Lựa Chọn</div>
    </div>

    <h2 class="doc-title">Ma Trận So Sánh & Khuyến Nghị Chuyên Môn</h2>
    <p class="doc-subtitle">Đánh giá toàn diện 3 phương án thiết kế để Ban Lãnh đạo đưa ra quyết định tối ưu nhất.</p>

    <table class="touchpoints-table" style="margin-bottom: 16px;">
      <thead>
        <tr>
          <th style="width: 22%;">Tiêu Chí Đánh Giá</th>
          <th style="width: 26%;">Phương Án 1 (Classic Navy)</th>
          <th style="width: 26%;">Phương Án 2 (Digital Sapphire)</th>
          <th style="width: 26%;">Phương Án 3 (B2B Commerce)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Bản Sắc Thương Hiệu</strong></td>
          <td>Khớp 100% với Logo & Màu nhận diện truyền thống của CLB.</td>
          <td>Hiện đại hóa thương hiệu theo phong cách chuyển đổi số.</td>
          <td>Tập trung vào tính pháp nhân và hồ sơ doanh nghiệp.</td>
        </tr>
        <tr>
          <td><strong>Phong Cách Thẩm Mỹ</strong></td>
          <td>Sang trọng, lịch lãm, quyền uy của lãnh đạo doanh nghiệp.</td>
          <td>Trẻ trung, công nghệ cao, hiệu ứng ánh sáng số đa chiều.</td>
          <td>Tối giản, thực tế, vững chãi chuẩn doanh nghiệp B2B.</td>
        </tr>
        <tr>
          <td><strong>Trải Nghiệm Thao Tác (UX)</strong></td>
          <td>Cực kỳ thân thiện, trực quan và dễ tiếp cận với mọi độ tuổi.</td>
          <td>Sinh động, phân loại màu sắc giúp nhận diện chức năng tức thì.</td>
          <td>Tập trung cao độ vào hành động kết nối và giao dịch.</td>
        </tr>
        <tr>
          <td><strong>Khả Năng Ứng Dụng</strong></td>
          <td>Hoàn hảo cho sự kiện trang trọng, thảm đỏ, đại hội CLB.</td>
          <td>Phù hợp diễn đàn công nghệ, vườn ươm khởi nghiệp đổi mới.</td>
          <td>Thích hợp các buổi xúc tiến thương mại, ký kết giao thương.</td>
        </tr>
        <tr>
          <td><strong>Tính Khả Thi Triển Khai</strong></td>
          <td>Tương thích ngay với toàn bộ cấu trúc ứng dụng hiện có.</td>
          <td>Tương thích ngay với toàn bộ cấu trúc ứng dụng hiện có.</td>
          <td>Tương thích ngay với toàn bộ cấu trúc ứng dụng hiện có.</td>
        </tr>
      </tbody>
    </table>

    <div style="background: linear-gradient(135deg, #091a32 0%, #173263 100%); border-radius: 12px; padding: 14px 16px; color: #ffffff; margin-bottom: 14px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:16px;">🏆</span>
        <h3 style="font-size:12.5px;font-weight:900;color:#f59e0b;letter-spacing:0.3px;text-transform:uppercase;">
          Khuyến Nghị Lựa Chọn Của Đội Ngũ Thiết Kế
        </h3>
      </div>
      <p style="font-size:10px;line-height:1.6;color:#e2e8f0;">
        Đội ngũ Thiết kế trân trọng đề xuất Ban Lãnh đạo phê duyệt <strong>Phương Án 1 (Classic Navy & Gold)</strong> làm giao diện chính thức cho ứng dụng CLB Doanh Nhân CEO 1983. 
        Phương án này không chỉ tôn vinh trọn vẹn bản sắc văn hóa doanh nhân Việt Nam mà còn tạo nên dấu ấn nhận diện độc bản, sang trọng và trường tồn cùng sự lớn mạnh của câu lạc bộ.
      </p>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
      <div>
        <div style="font-size:9.5px;font-weight:800;color:#0f172a;">ĐẠI DIỆN ĐỘI NGŨ THIẾT KẾ SẢN PHẨM</div>
        <div style="font-size:8.5px;color:#64748b;margin-top:2px;">Phòng Thiết Kế UI/UX • VIONE Product Studio</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:9.5px;font-weight:800;color:#003B95;">PHÊ DUYỆT CỦA BAN LÃNH ĐẠO</div>
        <div style="font-size:8.5px;color:#64748b;margin-top:2px;">CLB Doanh Nhân CEO 1983</div>
      </div>
    </div>

    <div class="page-footer">
      <div>Hồ Sơ Thiết Kế Giao Diện • CLB Doanh Nhân CEO 1983</div>
      <div>Trang 6 / 6</div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.resolve('scratch/ho_so_thiet_ke_ceo1983.html');
fs.writeFileSync(htmlPath, fullHtml, 'utf8');

const pdfPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Rendering 6-page Professional Agency Design Proposal with Edge Headless...');
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfPath);
  console.log('SUCCESS! PDF generated at:', pdfPath, 'Size:', stats.size, 'bytes');

  // Copy to artifact directory
  const artifactPdf = 'C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\74644533-8bb8-4b29-a589-3d8714601888\\DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf';
  fs.copyFileSync(pdfPath, artifactPdf);
  console.log('Copied to artifacts:', artifactPdf);
} catch (err) {
  console.error('Error rendering PDF:', err);
}
