const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Authentic assets
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

// Function to render Screen 1: Home Dashboard (FULL 100% APP FEATURES)
function renderFullHomeScreen(optionType) {
  let cardBg = '';
  let cardCover = '';
  let avatarBorder = '#f59e0b';
  let badgeClass = 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';
  let btnColor = '#003B95';
  let accentColor = '#ea580c';

  if (optionType === 'option1') {
    cardBg = 'linear-gradient(145deg, #0a192f 0%, #1e3a8a 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.35;`;
    btnColor = '#003B95';
    accentColor = '#ea580c';
    avatarBorder = '#f59e0b';
    badgeClass = 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';
  } else if (optionType === 'option2') {
    cardBg = 'linear-gradient(145deg, #031525 0%, #0369a1 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${sapphireBase64}'); background-size: cover; background-position: center; opacity: 0.4;`;
    avatarBorder = '#38bdf8';
    badgeClass = 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
    btnColor = '#0284c7';
    accentColor = '#38bdf8';
  } else {
    // option3
    cardBg = 'linear-gradient(145deg, #0f172a 0%, #334155 100%)';
    cardCover = `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.22;`;
    avatarBorder = '#ea580c';
    badgeClass = 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]';
    btnColor = '#0f172a';
    accentColor = '#ea580c';
  }

  // 8 Quick Actions (Full labels matching quickActionDefs)
  const iconsData = [
    { name: 'Thẻ hội viên', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>', color: optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#e0f2fe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Danh thiếp số', iconSvg: '<path d="M16 2v4"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="11" r="3"/>', color: '#ea580c', bg: '#ffedd5', badge: 'Mới' },
    { name: 'Hội viên', iconSvg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', color: optionType === 'option2' ? '#10b981' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#d1fae5' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Sự kiện', iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>', color: optionType === 'option2' ? '#f59e0b' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#fef3c7' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa', badge: '3' },
    { name: 'Tin tức', iconSvg: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/>', color: optionType === 'option2' ? '#8b5cf6' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#ede9fe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa', badge: '5' },
    { name: 'Tài liệu', iconSvg: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13Z"/>', color: optionType === 'option2' ? '#06b6d4' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#cffafe' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
    { name: 'Liên hệ nhanh', iconSvg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', color: '#ea580c', bg: '#ffedd5', badge: '1' },
    { name: 'Ưu đãi hội viên', iconSvg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', color: optionType === 'option2' ? '#ec4899' : optionType === 'option3' ? '#334155' : '#003B95', bg: optionType === 'option2' ? '#fce7f3' : optionType === 'option3' ? '#f1f5f9' : '#f0f4fa' },
  ];

  return `
    <div class="phone-frame-large">
      <!-- Status bar -->
      <div class="p-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:9px;font-weight:800;">5G</span>
          <span style="font-size:10px;font-weight:800;">100%</span>
        </div>
      </div>

      <!-- App Header -->
      <div class="p-app-header">
        <img class="p-header-logo" src="data:image/png;base64,${logoBase64}" alt="CEO 1983 Logo">
        <div class="p-notif-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${btnColor}" stroke-width="2.2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="p-notif-badge">3</span>
        </div>
      </div>

      <!-- Hero Stripe -->
      <div class="p-hero-stripe"></div>

      <!-- VIP Member Card Widget (-mt-14) -->
      <div class="p-member-widget" style="background:${cardBg};">
        <div class="p-widget-cover" style="${cardCover}"></div>
        <div class="p-widget-body">
          <div class="p-widget-avatar" style="border-color:${avatarBorder};">
            <span>MT</span>
          </div>
          <div class="p-widget-info">
            <div class="p-widget-company">Du Lịch Quốc Tế Á Châu</div>
            <div class="p-widget-name">
              <span>Đỗ Thị Mai</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
            </div>
            <div class="p-widget-tags">
              <span class="p-tag ${badgeClass}">VIP GOLD</span>
              <span class="p-tag p-copy-btn">M1983-012 📋</span>
            </div>
          </div>
          <div style="color:rgba(255,255,255,0.7);font-size:16px;">›</div>
        </div>
      </div>

      <!-- 8 Quick Actions Grid -->
      <div class="p-section-box" style="margin-top:10px;">
        <div class="p-section-title">
          <span style="width:7px;height:7px;border-radius:50%;background:${btnColor};display:inline-block;margin-right:6px;"></span>
          TÍNH NĂNG NHANH
        </div>
        <div class="p-grid-8">
          ${iconsData.map(item => `
            <div class="p-grid-item">
              <div class="p-icon-wrap" style="background:${item.bg};color:${item.color};">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${item.iconSvg}
                </svg>
                ${item.badge ? `<span class="p-icon-badge">${item.badge}</span>` : ''}
              </div>
              <span class="p-icon-label">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Featured Association Event -->
      <div class="p-section-box" style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="p-section-title" style="margin-bottom:0;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${btnColor}" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            SỰ KIỆN NỔI BẬT
          </div>
          <span style="font-size:9px;font-weight:700;color:${btnColor};">Xem tất cả +2 ›</span>
        </div>
        <div class="p-event-card">
          <div class="p-event-date" style="background:${btnColor};">
            <span style="font-size:13px;font-weight:900;color:#fff;line-height:1;">16</span>
            <span style="font-size:7px;font-weight:800;color:rgba(255,255,255,0.9);text-transform:uppercase;">SEP</span>
          </div>
          <div class="p-event-info">
            <div style="font-size:8px;color:#64748b;font-weight:600;">07:00 • CLB Doanh Nhân CEO 1983</div>
            <div style="font-size:9.5px;font-weight:800;color:#0f172a;line-height:1.25;margin:2px 0;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
            <div style="font-size:8px;color:#94a3b8;">📍 TT Hội Nghị Quốc Gia, Hà Nội</div>
          </div>
        </div>
      </div>

      <!-- Perks & Rewards Banner -->
      <div class="p-perks-box">
        <div style="flex:1;">
          <div style="font-size:10px;font-weight:800;color:${btnColor};display:flex;align-items:center;gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Ưu đãi Hội viên & Đối tác
            <span style="font-size:7.5px;color:#ef4444;background:#fee2e2;padding:1px 4px;border-radius:999px;">+Hot</span>
          </div>
          <div style="font-size:8px;color:#64748b;margin:2px 0 5px 0;">Chính sách trợ giá, quà tặng liên kết & quyền lợi giao thương.</div>
          <button style="background:${btnColor};color:#fff;border:none;padding:3px 8px;border-radius:5px;font-size:8px;font-weight:700;">Xem ưu đãi ngay →</button>
        </div>
        <div style="width:40px;height:40px;flex-shrink:0;">
          <img src="data:image/png;base64,${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
        </div>
      </div>

      <!-- 2 Core B2B Business Action Cards (Trao cơ hội & Đăng sản phẩm) -->
      <div style="margin:8px 8px 0 8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div class="p-b2b-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:14px;">🤝</span>
            <span style="font-size:7px;font-weight:800;color:#ef4444;background:#fee2e2;padding:1px 4px;border-radius:999px;">+2 Mới</span>
          </div>
          <div style="font-size:9px;font-weight:900;color:#0f172a;">TRAO CƠ HỘI</div>
          <div style="font-size:7px;color:#64748b;line-height:1.2;margin:2px 0 4px 0;">Chia sẻ cơ hội Kết nối thành công</div>
          <button style="background:#e0f2fe;color:#0284c7;border:none;border-radius:4px;font-size:7.5px;font-weight:700;padding:2px 6px;">Khám phá ngay</button>
        </div>

        <div class="p-b2b-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:14px;">📦</span>
            <span style="font-size:7px;font-weight:800;color:#ef4444;background:#fee2e2;padding:1px 4px;border-radius:999px;">+11 Mới</span>
          </div>
          <div style="font-size:9px;font-weight:900;color:#0f172a;">ĐĂNG SẢN PHẨM</div>
          <div style="font-size:7px;color:#64748b;line-height:1.2;margin:2px 0 4px 0;">Quảng bá sản phẩm Kết nối khách hàng</div>
          <button style="background:${btnColor};color:#ffffff;border:none;border-radius:4px;font-size:7.5px;font-weight:700;padding:2px 6px;">Đăng ngay</button>
        </div>
      </div>

      <!-- Bottom Nav -->
      <div class="p-bottom-nav">
        <div class="p-nav-item active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${btnColor}"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span style="color:${btnColor};font-weight:900;">Trang chủ</span>
        </div>
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="p-nav-center">
          <img src="data:image/png;base64,${emblemBase64}" style="width:20px;height:20px;object-fit:contain;" alt="83">
        </div>
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
          <span>Thông báo</span>
        </div>
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Function to render Screen 2: Member Digital Card (QR, NFC, Wallets, 4 Actions)
function renderCardScreenMedium(optionType) {
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
    <div class="phone-frame-medium">
      <!-- Status bar -->
      <div class="p-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:9px;font-weight:800;">5G</span>
          <span style="font-size:10px;font-weight:800;">100%</span>
        </div>
      </div>

      <!-- Header -->
      <div class="p-inner-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:11px;font-weight:900;color:#0f172a;">Thẻ Hội Viên Điện Tử</span>
        <div style="width:16px;"></div>
      </div>

      <!-- Tab Switcher -->
      <div class="p-tab-bar">
        <div class="p-tab-item active" style="background:${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#0f172a' : '#003B95'};">
          <span>Thẻ của tôi</span>
        </div>
        <div class="p-tab-item">
          <span>Quét mã QR</span>
        </div>
      </div>

      <!-- Full Membership Card Pass -->
      <div class="p-pass-card" style="background:${cardSurface};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:6px;">
            <img src="data:image/png;base64,${emblemBase64}" style="width:24px;height:24px;object-fit:contain;" alt="83">
            <div>
              <div style="font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.3px;">CLB DOANH NHÂN CEO 1983</div>
              <div style="font-size:6.5px;color:rgba(255,255,255,0.75);letter-spacing:0.2px;">NÂNG TẦM GIÁ TRỊ • TIÊN PHONG KẾT NỐI</div>
            </div>
          </div>
          <span style="font-size:8px;font-weight:900;color:${cardAccent};padding:2px 6px;background:rgba(255,255,255,0.12);border-radius:4px;">VIP PASS</span>
        </div>

        <div style="margin:12px 0 10px 0;display:flex;gap:8px;align-items:center;">
          <div style="width:38px;height:38px;border-radius:50%;border:2px solid ${cardAccent};background:#1e3a8a;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0;">
            MT
          </div>
          <div>
            <div style="font-size:12px;font-weight:900;color:#ffffff;line-height:1.2;">ĐỖ THỊ MAI</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.85);margin-top:1px;">CÔNG TY TNHH DU LỊCH Á CHÂU</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px;margin-top:6px;">
          <div>
            <div style="font-size:6.5px;color:rgba(255,255,255,0.6);">MÃ HỘI VIÊN</div>
            <div style="font-size:10px;font-weight:900;color:#ffffff;">M1983-012</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:6.5px;color:rgba(255,255,255,0.6);">HẠN DÙNG</div>
            <div style="font-size:10px;font-weight:900;color:#ffffff;">31/12/2026</div>
          </div>
        </div>
      </div>

      <!-- 2 Main Connectivity Buttons (QR & NFC) -->
      <div style="margin:10px 10px 0 10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <button style="${btnStyle}border:none;border-radius:8px;padding:8px 0;font-size:9.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Mã QR Xác Thực
        </button>
        <button style="background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0;border-radius:8px;padding:8px 0;font-size:9.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/></svg>
          Chạm Thẻ NFC
        </button>
      </div>

      <!-- 4 Quick Actions (from association.card.tsx) -->
      <div style="margin:8px 10px 0 10px;display:grid;grid-template-columns:repeat(4, 1fr);gap:4px;">
        <div class="p-sub-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Quyền lợi</span>
        </div>
        <div class="p-sub-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>
          <span>Lịch sử</span>
        </div>
        <div class="p-sub-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
          <span>Gia hạn</span>
        </div>
        <div class="p-sub-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${optionType === 'option2' ? '#0284c7' : optionType === 'option3' ? '#475569' : '#003B95'}" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Hồ sơ</span>
        </div>
      </div>

      <!-- Sync Status -->
      <div style="margin-top:auto;padding-bottom:10px;text-align:center;">
        <span style="font-size:8px;color:#64748b;display:inline-flex;align-items:center;gap:4px;">
          <span style="width:5px;height:5px;border-radius:50%;background:#16a34a;display:inline-block;"></span>
          Đã đồng bộ trực tuyến thời gian thực
        </span>
      </div>
    </div>
  `;
}

// Function to render Screen 3: B2B Events Screen
function renderEventsScreenMedium(optionType) {
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
    <div class="phone-frame-medium">
      <!-- Status bar -->
      <div class="p-status-bar">
        <span>9:41</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:9px;font-weight:800;">5G</span>
          <span style="font-size:10px;font-weight:800;">100%</span>
        </div>
      </div>

      <!-- Header -->
      <div class="p-inner-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:11px;font-weight:900;color:#0f172a;">Sự Kiện & Diễn Đàn</span>
        <div style="width:16px;"></div>
      </div>

      <!-- Category Filter Bar -->
      <div style="margin:8px 10px;display:flex;gap:4px;overflow:hidden;">
        <span style="background:${activeTagBg};color:#ffffff;font-size:8px;font-weight:800;padding:3px 8px;border-radius:999px;">Tất cả (4)</span>
        <span style="background:#f1f5f9;color:#64748b;font-size:8px;font-weight:700;padding:3px 8px;border-radius:999px;">Đại hội</span>
        <span style="background:#f1f5f9;color:#64748b;font-size:8px;font-weight:700;padding:3px 8px;border-radius:999px;">Gala B2B</span>
        <span style="background:#f1f5f9;color:#64748b;font-size:8px;font-weight:700;padding:3px 8px;border-radius:999px;">Tọa đàm</span>
      </div>

      <!-- Event 1 (Major Showcase) -->
      <div class="p-event-block">
        <div style="height:44px;background:linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%);position:relative;padding:6px;">
          <span style="position:absolute;top:4px;right:6px;background:#ea580c;color:#fff;font-size:6.5px;font-weight:900;padding:1px 5px;border-radius:3px;">SẮP DIỄN RA</span>
          <div style="position:absolute;bottom:4px;left:6px;right:6px;display:flex;justify-content:space-between;align-items:flex-end;color:#fff;">
            <div>
              <span style="font-size:15px;font-weight:900;line-height:1;display:block;">16</span>
              <span style="font-size:7px;font-weight:800;letter-spacing:0.5px;">THÁNG 9</span>
            </div>
            <span style="font-size:8px;background:rgba(0,0,0,0.4);padding:1px 5px;border-radius:3px;">07:00 SÁNG</span>
          </div>
        </div>
        <div style="padding:6px 8px;">
          <div style="font-size:9.5px;font-weight:900;color:#0f172a;line-height:1.25;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
          <div style="font-size:7.5px;color:#64748b;margin-top:2px;">📍 TT Hội Nghị Quốc Gia, Hà Nội</div>
          <div style="margin-top:5px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:7.5px;color:#16a34a;font-weight:800;">● Hội viên miễn phí vé</span>
            <button style="background:${activeTagBg};color:#ffffff;border:none;border-radius:4px;font-size:8px;font-weight:800;padding:3px 8px;">Đăng ký tham dự</button>
          </div>
        </div>
      </div>

      <!-- Event 2 -->
      <div class="p-event-row">
        <div style="width:30px;height:32px;border-radius:6px;background:${dateBadgeBg};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
          <span style="font-size:11px;font-weight:900;line-height:1;">28</span>
          <span style="font-size:6.5px;font-weight:800;">SEP</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:8.5px;font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Gala Dinner Kết Nối Giao Thương 2026</div>
          <div style="font-size:7px;color:#64748b;">18:00 • KS JW Marriott Hà Nội</div>
        </div>
        <span style="font-size:7px;font-weight:800;color:#16a34a;background:#dcfce7;padding:2px 5px;border-radius:4px;">Đã đ/k</span>
      </div>

      <!-- Event 3 -->
      <div class="p-event-row" style="margin-top:3px;">
        <div style="width:30px;height:32px;border-radius:6px;background:${dateBadgeBg};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
          <span style="font-size:11px;font-weight:900;line-height:1;">15</span>
          <span style="font-size:6.5px;font-weight:800;">OCT</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:8.5px;font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Tọa Đàm: Quản Trị Tinh Gọn & AI 2026</div>
          <div style="font-size:7px;color:#64748b;">14:00 • TT Đổi Mới Sáng Tạo NIC</div>
        </div>
        <span style="font-size:7px;font-weight:800;color:#0284c7;background:#e0f2fe;padding:2px 5px;border-radius:4px;">Mở đ/k</span>
      </div>

      <!-- Bottom Nav -->
      <div class="p-bottom-nav">
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="p-nav-item active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${activeTagBg}"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span style="color:${activeTagBg};font-weight:900;">Sự kiện</span>
        </div>
        <div class="p-nav-center">
          <img src="data:image/png;base64,${emblemBase64}" style="width:20px;height:20px;object-fit:contain;" alt="83">
        </div>
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
          <span>Thông báo</span>
        </div>
        <div class="p-nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Master HTML generation (9 Pages A4 Portrait, Sharp, Professional)
const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Đề Xuất Chuẩn Hóa Giao Diện App CLB Doanh Nhân CEO 1983</title>
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
      color: #0f172a;
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
      height: 26px;
      width: auto;
      object-fit: contain;
    }

    .header-category-tag {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: #f0f9ff;
      color: #003B95;
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

    /* Cover Page */
    .cover-page {
      background: radial-gradient(circle at 85% 15%, #0c2340 0%, #031426 50%, #010710 100%);
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
      background: rgba(2, 132, 199, 0.2);
      border: 1px solid rgba(56, 189, 248, 0.4);
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
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

    /* Page Typography */
    h2.doc-title {
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-bottom: 3px;
    }
    p.doc-subtitle {
      font-size: 10.5px;
      color: #64748b;
      margin-bottom: 10px;
    }

    /* ==================== PHONE FRAMES (SHARP & CRISP) ==================== */
    /* Large Frame for Home Screen (Width: 96mm, Height: 216mm) */
    .phone-frame-large {
      width: 96mm;
      height: 216mm;
      background: #ffffff;
      border: 2.5px solid #0f172a;
      border-radius: 30px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.14);
      position: relative;
      flex-shrink: 0;
    }

    /* Medium Frame for Dual Screen Pages (Width: 86mm, Height: 188mm) */
    .phone-frame-medium {
      width: 86mm;
      height: 188mm;
      background: #ffffff;
      border: 2.5px solid #0f172a;
      border-radius: 26px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      position: relative;
      flex-shrink: 0;
    }

    /* Mockup internal components */
    .p-status-bar {
      height: 16px;
      padding: 2px 14px 0 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      font-weight: 700;
      color: #0f172a;
      background: #ffffff;
      flex-shrink: 0;
    }

    .p-app-header {
      height: 36px;
      padding: 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }
    .p-header-logo {
      height: 24px;
      width: auto;
      object-fit: contain;
    }
    .p-notif-box {
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: #f0f4fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .p-notif-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 7px;
      font-weight: 900;
      padding: 1px 3.5px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }

    .p-hero-stripe {
      height: 16px;
      background: linear-gradient(180deg, rgba(2,132,199,0.15) 0%, rgba(2,132,199,0.01) 100%);
      flex-shrink: 0;
    }

    /* VIP Widget */
    .p-member-widget {
      margin: -12px 8px 0 8px;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .p-widget-cover {
      height: 28px;
      width: 100%;
    }
    .p-widget-body {
      padding: 5px 8px 8px 8px;
      display: flex;
      align-items: center;
      gap: 7px;
      position: relative;
    }
    .p-widget-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #f59e0b;
      background: linear-gradient(135deg, #003B95, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 13px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .p-widget-info {
      flex: 1;
      min-width: 0;
    }
    .p-widget-company {
      font-size: 7.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .p-widget-name {
      font-size: 11px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .p-widget-tags {
      display: flex;
      gap: 3px;
      margin-top: 2px;
      align-items: center;
    }
    .p-tag {
      font-size: 7px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid transparent;
    }
    .p-copy-btn {
      background: rgba(255,255,255,0.15);
      color: #ffffff;
    }

    /* Section Boxes */
    .p-section-box {
      margin: 6px 8px 0 8px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 6px 8px;
      flex-shrink: 0;
    }
    .p-section-title {
      font-size: 9px;
      font-weight: 900;
      color: #0f172a;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      letter-spacing: 0.2px;
    }

    /* Grid 8 */
    .p-grid-8 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px 2px;
    }
    .p-grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .p-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .p-icon-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 6px;
      font-weight: 900;
      padding: 0.5px 3px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }
    .p-icon-label {
      font-size: 7.5px;
      font-weight: 700;
      color: #334155;
      text-align: center;
      max-width: 38px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.1;
    }

    /* Event Card */
    .p-event-card {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 5px 6px;
    }
    .p-event-date {
      width: 28px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .p-event-info {
      flex: 1;
      min-width: 0;
    }

    /* Perks Box */
    .p-perks-box {
      margin: 6px 8px 0 8px;
      border: 1px solid #e0f2fe;
      background: #f8fafc;
      border-radius: 10px;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* B2B Card */
    .p-b2b-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 5px 6px;
    }

    /* Inner Screen Components */
    .p-inner-header {
      height: 30px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }
    .p-tab-bar {
      margin: 8px 10px 6px 10px;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 2.5px;
      display: flex;
      flex-shrink: 0;
    }
    .p-tab-item {
      flex: 1;
      text-align: center;
      font-size: 8px;
      font-weight: 700;
      padding: 4px 0;
      border-radius: 6px;
      color: #64748b;
    }
    .p-tab-item.active {
      color: #ffffff;
      font-weight: 800;
    }

    .p-pass-card {
      margin: 2px 10px 0 10px;
      border-radius: 12px;
      padding: 10px;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(0,0,0,0.18);
      flex-shrink: 0;
    }
    .p-sub-action {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 5px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 7px;
      font-weight: 800;
      color: #334155;
    }

    .p-event-block {
      margin: 0 10px 6px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background: #ffffff;
      flex-shrink: 0;
    }
    .p-event-row {
      margin: 0 10px 4px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Bottom Nav */
    .p-bottom-nav {
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
    .p-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5px;
      font-size: 7px;
      font-weight: 700;
      color: #94a3b8;
    }
    .p-nav-center {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #f0f4fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Two-column layout for Screen 1 pages */
    .layout-split {
      display: grid;
      grid-template-columns: 98mm 1fr;
      gap: 16px;
      flex: 1;
      align-items: start;
    }
    .feature-breakdown {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .feature-item-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 9px 12px;
    }
    .feature-item-box h4 {
      font-size: 11px;
      font-weight: 800;
      color: #003B95;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .feature-item-box p {
      font-size: 9.5px;
      color: #475569;
      line-height: 1.5;
    }

    /* Dual phone layout for Screen 2 & 3 pages */
    .dual-phones-row {
      display: flex;
      justify-content: center;
      gap: 14mm;
      margin-top: 6px;
      margin-bottom: 12px;
    }
    .dual-phone-column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .dual-phone-title {
      font-size: 10px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    /* Comparison Table on Page 9 */
    .table-compare {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 10px;
    }
    .table-compare th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 900;
      text-align: left;
      padding: 9px 10px;
      border: 1px solid #cbd5e1;
    }
    .table-compare td {
      padding: 9px 10px;
      border: 1px solid #cbd5e1;
      color: #334155;
      line-height: 1.5;
      vertical-align: top;
    }
    .table-compare tr:nth-child(even) {
      background: #f8fafc;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1: BÌA BÁO CÁO THIẾT KẾ ==================== -->
  <div class="page cover-page">
    <div class="brand-top-stripe"></div>
    <div>
      <div class="cover-top-tag">
        ✦ HỒ SƠ ĐỀ XUẤT THIẾT KẾ GIAO DIỆN • UI/UX DESIGN CONCEPT
      </div>
      <div style="margin-bottom: 18px;">
        <img src="data:image/png;base64,${logoBase64}" style="height: 52px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" alt="CEO 1983">
      </div>
      <h1 class="cover-main-title">
        ĐỀ XUẤT CHUẨN HÓA GIAO DIỆN<br>
        <span>ỨNG DỤNG CLB DOANH NHÂN CEO 1983</span>
      </h1>
      <p class="cover-lead">
        Chuẩn hóa toàn diện ngôn ngữ thị giác theo nhận diện thương hiệu chính thức (Cobalt Navy & Warm Amber/Orange). 
        Bảo toàn 100% các tính năng hiện có của ứng dụng hiệp hội và cung cấp 3 phương án thẩm mỹ để Ban Lãnh đạo lựa chọn.
      </p>

      <div class="cover-concepts-grid">
        <div class="cover-concept-card">
          <h4>Phương Án 1 • Classic Navy & Gold</h4>
          <p>Chuẩn mực Doanh nhân lịch lãm. Cân bằng tuyệt đối giữa sắc xanh Cobalt đĩnh đạc và ánh kim Amber quyền quý.</p>
        </div>
        <div class="cover-concept-card">
          <h4>Phương Án 2 • Digital Sapphire</h4>
          <p>Kỷ nguyên chuyển đổi số. Đồ họa tinh thể 3D đa diện, ánh sáng viền Cyan công nghệ và biểu tượng đa sắc hiện đại.</p>
        </div>
        <div class="cover-concept-card">
          <h4>Phương Án 3 • B2B Commerce Focus</h4>
          <p>Giao thương thực chiến tối giản. Ngôn ngữ thiết kế phẳng, đẩy thông tin pháp nhân doanh nghiệp lên trung tâm.</p>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-metadata-footer">
        <div><strong>Dự án:</strong> Hệ Sinh Thái Số CLB Doanh Nhân CEO 1983</div>
        <div><strong>Quy chuẩn:</strong> Nhận diện thương hiệu chính thức • Bảo toàn đầy đủ tính năng</div>
        <div><strong>Thời gian:</strong> 09/2026</div>
      </div>
    </div>
  </div>

  <!-- ==================== TRANG 2: BẢN SẮC THƯƠNG HIỆU & HỆ TÍNH NĂNG ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag">Quy Chuẩn Nhận Diện & Hệ Thống Tính Năng</div>
    </div>

    <h2 class="doc-title">Bản Sắc Thương Hiệu CEO 1983 & Hệ Thống Tính Năng Ứng Dụng</h2>
    <p class="doc-subtitle">Đồng bộ tuyệt đối giữa bộ nhận diện thương hiệu chính thức và trải nghiệm người dùng mobile.</p>

    <!-- Brand Color Palette -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:12px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
        <div style="font-size:10px;font-weight:900;color:#003B95;margin-bottom:3px;">DEEP COBALT NAVY (#003B95 / #24338A)</div>
        <div style="height:12px;background:#003B95;border-radius:4px;margin-bottom:5px;"></div>
        <p style="font-size:9px;color:#64748b;line-height:1.4;">Màu chữ CEO & nền thẻ chủ đạo: Đại diện cho trí tuệ, bản lĩnh lãnh đạo, sự đĩnh đạc và phát triển bền vững.</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
        <div style="font-size:10px;font-weight:900;color:#EA580C;margin-bottom:3px;">WARM AMBER / ORANGE (#EA580C / #F97316)</div>
        <div style="height:12px;background:#EA580C;border-radius:4px;margin-bottom:5px;"></div>
        <p style="font-size:9px;color:#64748b;line-height:1.4;">Màu số 1983 & viền VIP: Đại diện cho nhiệt huyết tiên phong, thịnh vượng và dòng chảy giao thương phồn vinh.</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;">
        <div style="font-size:10px;font-weight:900;color:#0284C7;margin-bottom:3px;">DIGITAL SAPPHIRE GLASS</div>
        <div style="height:12px;background:linear-gradient(90deg, #0284c7, #38bdf8);border-radius:4px;margin-bottom:5px;"></div>
        <p style="font-size:9px;color:#64748b;line-height:1.4;">Dải màu chuyển đổi số: Biểu trưng cho sự đổi mới sáng tạo, năng lực công nghệ và tinh thần hội nhập.</p>
      </div>
    </div>

    <!-- Complete Feature Table -->
    <table class="table-compare">
      <thead>
        <tr>
          <th style="width: 25%;">Hạng Mục Ứng Dụng</th>
          <th style="width: 35%;">Tính Năng Thực Tế Của Hiệp Hội</th>
          <th style="width: 40%;">Chuẩn Mực Thiết Kế CEO 1983 Mới</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Thanh Header & Logo</strong></td>
          <td>Nhận diện thương hiệu & Chuông thông báo (kèm số lượng thông báo chưa đọc).</td>
          <td>Logo CEO 1983 chính thức sắc nét; Biểu tượng 83 cách điệu dải màu Navy - Cam chuẩn xác trên mọi màn hình.</td>
        </tr>
        <tr>
          <td><strong>2. Thẻ Hội Viên VIP</strong></td>
          <td>Avatar, họ tên hội viên, đơn vị doanh nghiệp, danh vị VIP GOLD, mã hội viên (nút sao chép).</td>
          <td>Tỷ lệ thẻ bề thế, dải ảnh nền kiến trúc hiện đại, avatar viền vàng VIP, thông tin pháp nhân rõ ràng.</td>
        </tr>
        <tr>
          <td><strong>3. Lưới 8 Tính Năng Nhanh</strong></td>
          <td>Thẻ hội viên, Danh thiếp số (Mới), Hội viên, Sự kiện (3), Tin tức (5), Tài liệu, Liên hệ (1), Ưu đãi.</td>
          <td>Typography to rõ, icon thiết kế chuẩn thị giác, badge thông báo đỏ đồng bộ theo từng phân hệ.</td>
        </tr>
        <tr>
          <td><strong>4. Sự Kiện & Ưu Đãi</strong></td>
          <td>Sự kiện tiêu điểm với dải ngày giờ, Khối ưu đãi đối tác với quà tặng liên kết.</td>
          <td>Thẻ sự kiện bố cục mạch lạc; Nút hành động đồng bộ màu xanh thương hiệu #003B95.</td>
        </tr>
        <tr>
          <td><strong>5. Giao Thương B2B</strong></td>
          <td>Khối Trao Cơ Hội (+2 Mới) & Khối Đăng Giới Thiệu Sản Phẩm (+11 Mới).</td>
          <td>Hai khối hành động nổi bật kích thích giao lưu kinh doanh, tìm kiếm đối tác và xúc tiến thương mại.</td>
        </tr>
        <tr>
          <td><strong>6. Thẻ Số & NFC/QR</strong></td>
          <td>Thẻ điện tử toàn cảnh, mã QR xác thực hội viên, chạm thẻ NFC, Apple/Google Wallet.</td>
          <td>Tích hợp công nghệ một chạm hiện đại, đầy đủ 4 tiện ích: Quyền lợi, Lịch sử, Gia hạn, Hồ sơ.</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Đề Xuất Chuẩn Hóa Giao Diện</div>
      <div>Trang 2 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 3: PHƯƠNG ÁN 1 - MÀN 1 TRANG CHỦ ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#fef3c7;color:#b45309;border-color:#fde68a;">Phương Án 1 (Khuyên Dùng)</div>
    </div>

    <h2 class="doc-title">Phương Án 1: Classic Navy & Gold • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Bảo toàn 100% đầy đủ các tính năng hiện có của app, nâng tầm thẩm mỹ sang trọng theo chuẩn thương hiệu.</p>

    <div class="layout-split">
      ${renderFullHomeScreen('option1')}

      <div class="feature-breakdown">
        <div class="feature-item-box">
          <h4>1. Header Nhận Diện CEO 1983</h4>
          <p>Logo thương hiệu đặt trang trọng ở góc trái, đối xứng với chuông thông báo có badge số lượng tin tức mới chưa đọc.</p>
        </div>

        <div class="feature-item-box">
          <h4>2. Thẻ Hội Viên VIP Bề Thế</h4>
          <p>Dải ảnh bìa skyline thành phố hiện đại; Avatar lớn viền vàng VIP; Họ tên <code>Đỗ Thị Mai</code> đi kèm tích xanh xác thực, tên doanh nghiệp và mã hội viên <code>M1983-012</code> kèm nút sao chép nhanh.</p>
        </div>

        <div class="feature-item-box">
          <h4>3. Lưới 8 Tính Năng Nhanh Tinh Gọn</h4>
          <p>Đồng bộ 2 tone màu nhận diện Navy (#003B95) và Cam (#EA580C). Font chữ to rõ ràng, tích hợp đầy đủ các badge thông báo nổi bật (Mới, 3, 5, 1).</p>
        </div>

        <div class="feature-item-box">
          <h4>4. Khối Sự Kiện & Ưu Đãi Đối Tác</h4>
          <p>Sự kiện tâm điểm có ngày 16 SEP rõ nét. Khối ưu đãi hội viên bố trí hộp quà và nút bấm Navy sắc sảo.</p>
        </div>

        <div class="feature-item-box">
          <h4>5. Cặp Khối Giao Thương B2B Thực Chiến</h4>
          <p>Khối <strong>Trao Cơ Hội</strong> (+2 Mới) và <strong>Đăng Giới Thiệu Sản Phẩm</strong> (+11 Mới) được giữ nguyên vẹn vị trí, tối ưu nút bấm cho giao dịch kết nối.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 1: Classic Navy & Gold</div>
      <div>Trang 3 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 4: PHƯƠNG ÁN 1 - MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#fef3c7;color:#b45309;border-color:#fde68a;">Phương Án 1: Thẻ VIP & Sự Kiện</div>
    </div>

    <h2 class="doc-title">Phương Án 1: Thẻ Hội Viên VIP Pass & Cổng Sự Kiện Giao Thương</h2>
    <p class="doc-subtitle">Hiển thị sắc nét, tỷ lệ chuẩn xác từng nút bấm, phục vụ hoàn hảo cho việc kết nối danh thiếp và tham gia sự kiện.</p>

    <div class="dual-phones-row">
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderCardScreenMedium('option1')}
      </div>
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 3: SỰ KIỆN GIAO THƯƠNG B2B</div>
        ${renderEventsScreenMedium('option1')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;">
      <div class="feature-item-box">
        <h4>Chi Tiết Màn Thẻ Hội Viên (Màn 2)</h4>
        <p>• Switcher tab: [Thẻ của tôi] & [Quét mã QR].<br>
        • Thẻ toàn cảnh dập nổi biểu tượng 83 và slogan CLB.<br>
        • Nút bấm: [Mã QR xác thực] & [Chạm thẻ NFC].<br>
        • 4 Tiện ích: Quyền lợi, Lịch sử, Gia hạn, Hồ sơ cá nhân.</p>
      </div>
      <div class="feature-item-box">
        <h4>Chi Tiết Màn Sự Kiện B2B (Màn 3)</h4>
        <p>• Thanh lọc danh mục: Tất cả, Đại hội, Gala, Tọa đàm.<br>
        • Thẻ sự kiện chính: Banner ngày 16 THÁNG 9, giờ, địa điểm, nút Đăng ký tham dự.<br>
        • Danh sách sự kiện tiếp nối: Gala 28/09, Tọa đàm 15/10.</p>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 1: Classic Navy & Gold</div>
      <div>Trang 4 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 5: PHƯƠNG ÁN 2 - MÀN 1 TRANG CHỦ ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd;">Phương Án 2: Digital Sapphire</div>
    </div>

    <h2 class="doc-title">Phương Án 2: Digital Sapphire Tech • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Phong cách chuyển đổi số hiện đại, ứng dụng đồ họa tinh thể 3D đa diện và biểu tượng đa sắc.</p>

    <div class="layout-split">
      ${renderFullHomeScreen('option2')}

      <div class="feature-breakdown">
        <div class="feature-item-box">
          <h4>1. Đồ Họa Tinh Thể Số 3D Sapphire</h4>
          <p>Nền thẻ hội viên kết hợp khối tinh thể số 3D đa chiều, tạo chiều sâu công nghệ và sự đột phá mới lạ.</p>
        </div>

        <div class="feature-item-box">
          <h4>2. Avatar Viền Xanh Cyan Phát Sáng</h4>
          <p>Khung avatar được bao quanh bởi dải sáng Neon Cyan (#38BDF8), thể hiện hình tượng các nhà lãnh đạo tiên phong công nghệ số.</p>
        </div>

        <div class="feature-item-box">
          <h4>3. Lưới Icon Đa Sắc Sinh Động (VisionOS Style)</h4>
          <p>Mỗi nhóm tính năng được gán một tone màu pastel riêng (Xanh ngọc, Tím, Cam, Hồng) giúp nhận diện cực nhanh trên màn hình cảm ứng.</p>
        </div>

        <div class="feature-item-box">
          <h4>4. Nút Hành Động Màu Cyber Blue</h4>
          <p>Các nút "Xem ưu đãi ngay", "Đăng ký" và "Đăng ngay" sử dụng sắc xanh Cyber Blue (#0284C7) trẻ trung, hiện đại.</p>
        </div>

        <div class="feature-item-box">
          <h4>5. Đầy Đủ Khối Giao Thương Hiệp Hội</h4>
          <p>Giữ nguyên 100% công năng của khối Trao Cơ Hội và Đăng Giới Thiệu Sản Phẩm với giao diện được làm mới sắc nét.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 2: Digital Sapphire Tech</div>
      <div>Trang 5 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 6: PHƯƠNG ÁN 2 - MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd;">Phương Án 2: Thẻ VIP & Sự Kiện</div>
    </div>

    <h2 class="doc-title">Phương Án 2: Thẻ Hội Viên Sapphire & Cổng Sự Kiện Số</h2>
    <p class="doc-subtitle">Trải nghiệm tương tác số hiện đại, phong cách quốc tế năng động và giàu năng lượng bứt phá.</p>

    <div class="dual-phones-row">
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderCardScreenMedium('option2')}
      </div>
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 3: SỰ KIỆN GIAO THƯƠNG B2B</div>
        ${renderEventsScreenMedium('option2')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;">
      <div class="feature-item-box">
        <h4>Đặc Điểm Thẻ Hội Viên Sapphire</h4>
        <p>• Mặt thẻ chuyển màu Sapphire Blue đa sắc.<br>
        • Điểm nhấn viền sáng Cyan trên họ tên và mã hội viên.<br>
        • Nút quét mã QR và chạm NFC thiết kế công nghệ cao.<br>
        • Tích hợp đầy đủ quyền lợi và lịch sử đồng bộ trực tuyến.</p>
      </div>
      <div class="feature-item-box">
        <h4>Đặc Điểm Sự Kiện Chuyển Đổi Số</h4>
        <p>• Bộ lọc danh mục tone màu xanh Cyber Blue.<br>
        • Badge trạng thái sự kiện nổi bật, bắt mắt.<br>
        • Thao tác đăng ký vé điện tử và check-in QR nhanh chóng.</p>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 2: Digital Sapphire Tech</div>
      <div>Trang 6 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 7: PHƯƠNG ÁN 3 - MÀN 1 TRANG CHỦ ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#f1f5f9;color:#334155;border-color:#cbd5e1;">Phương Án 3: B2B Commerce</div>
    </div>

    <h2 class="doc-title">Phương Án 3: B2B Commerce Focus • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Phong cách tối giản phẳng (Flat Minimalist), tập trung cao độ vào tính pháp nhân doanh nghiệp và hiệu quả giao dịch.</p>

    <div class="layout-split">
      ${renderFullHomeScreen('option3')}

      <div class="feature-breakdown">
        <div class="feature-item-box">
          <h4>1. Tôn Vinh Tên Doanh Nghiệp</h4>
          <p>Thẻ hội viên đẩy tên công ty và ngành nghề lên vị trí nổi bật nhất, biến thẻ thành hồ sơ năng lực thu nhỏ của doanh nghiệp.</p>
        </div>

        <div class="feature-item-box">
          <h4>2. Biểu Tượng Phẳng Tối Giản (Flat Minimalist)</h4>
          <p>Lưới 8 tính năng sử dụng gam màu Slate (#334155) trung tính, tinh giản mọi hiệu ứng rườm rà, tập trung vào công năng sử dụng.</p>
        </div>

        <div class="feature-item-box">
          <h4>3. Độ Tương Phản Mạnh Mẽ</h4>
          <p>Các nút hành động chính sử dụng màu đen than (#0F172A), tạo sự chắc chắn, vững chãi chuẩn các tập đoàn lớn.</p>
        </div>

        <div class="feature-item-box">
          <h4>4. Tối Ưu Hóa Giao Thương Thực Chiến</h4>
          <p>Khối Trao Cơ Hội và Đăng Giới Thiệu Sản Phẩm được làm nổi bật với thông số rõ ràng, phục vụ đắc lực cho hội viên xúc tiến thương mại.</p>
        </div>

        <div class="feature-item-box">
          <h4>5. Dễ Dàng Thao Tác</h4>
          <p>Giao diện thoáng đãng, các vùng bấm lớn, mang lại trải nghiệm nhanh gọn cho các doanh nhân bận rộn.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 3: B2B Commerce Focus</div>
      <div>Trang 7 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 8: PHƯƠNG ÁN 3 - MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag" style="background:#f1f5f9;color:#334155;border-color:#cbd5e1;">Phương Án 3: Thẻ VIP & Sự Kiện</div>
    </div>

    <h2 class="doc-title">Phương Án 3: Thẻ Doanh Nghiệp & Sự Kiện Xúc Tiến Thương Mại</h2>
    <p class="doc-subtitle">Định hướng thực dụng tối đa, cung cấp đầy đủ thông tin pháp nhân và giao dịch kết nối kinh doanh.</p>

    <div class="dual-phones-row">
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 2: THẺ VIP & DANH THIẾP SỐ</div>
        ${renderCardScreenMedium('option3')}
      </div>
      <div class="dual-phone-column">
        <div class="dual-phone-title">MÀN 3: SỰ KIỆN GIAO THƯƠNG B2B</div>
        ${renderEventsScreenMedium('option3')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;">
      <div class="feature-item-box">
        <h4>Đặc Điểm Thẻ Doanh Nghiệp B2B</h4>
        <p>• Mặt thẻ tone Charcoal Slate vững chắc.<br>
        • Nổi bật tên công ty và mã định danh doanh nghiệp.<br>
        • Nút QR và NFC thiết kế phẳng, tương phản cao.<br>
        • Tối ưu hóa việc trao đổi thông tin đối tác.</p>
      </div>
      <div class="feature-item-box">
        <h4>Đặc Điểm Sự Kiện Thương Mại</h4>
        <p>• Bố cục tập trung vào thông tin thời gian, địa điểm.<br>
        • Nút bấm đăng ký nhanh gọn, tiết kiệm thao tác.<br>
        • Phù hợp với các buổi hội thảo xúc tiến đầu tư.</p>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 3: B2B Commerce Focus</div>
      <div>Trang 8 / 9</div>
    </div>
  </div>

  <!-- ==================== TRANG 9: MA TRẬN SO SÁNH TỔNG HỢP ==================== -->
  <div class="page">
    <div class="brand-top-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <div class="header-category-tag">Tổng Kết & So Sánh Phương Án</div>
    </div>

    <h2 class="doc-title">Bảng So Sánh Chi Tiết 3 Phương Án Thiết Kế</h2>
    <p class="doc-subtitle">Tổng hợp các thông số thị giác và đặc tính trải nghiệm để Ban Lãnh đạo đưa ra quyết định lựa chọn.</p>

    <table class="table-compare" style="margin-top:8px;">
      <thead>
        <tr>
          <th style="width: 22%;">Tiêu Chí Thiết Kế</th>
          <th style="width: 26%;">Phương Án 1 (Classic Navy)</th>
          <th style="width: 26%;">Phương Án 2 (Digital Sapphire)</th>
          <th style="width: 26%;">Phương Án 3 (B2B Commerce)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tone Màu Chủ Đạo</strong></td>
          <td>Cobalt Navy (#003B95) & Warm Gold/Amber.</td>
          <td>Sapphire Blue (#0284C7) & Neon Cyan.</td>
          <td>Charcoal Slate (#0F172A) & Deep Orange.</td>
        </tr>
        <tr>
          <td><strong>Phong Cách Thẻ Hội Viên</strong></td>
          <td>Dải ảnh kiến trúc skyline, avatar viền vàng VIP.</td>
          <td>Khối đồ họa tinh thể 3D, avatar viền Cyan phát sáng.</td>
          <td>Định danh doanh nghiệp và ngành nghề trung tâm.</td>
        </tr>
        <tr>
          <td><strong>Bộ Biểu Tượng (Icon)</strong></td>
          <td>2 Tone màu chuẩn nhận diện thương hiệu.</td>
          <td>Đa sắc sinh động (VisionOS / modern iOS).</td>
          <td>Phẳng tối giản (Flat Minimalist) màu Slate.</td>
        </tr>
        <tr>
          <td><strong>Định Vị Cảm Xúc</strong></td>
          <td>Sang trọng, đĩnh đạc, uy tín của nhà lãnh đạo.</td>
          <td>Hiện đại, trẻ trung, năng động, giàu tính công nghệ.</td>
          <td>Vững chãi, thực dụng, tập trung vào giao thương.</td>
        </tr>
        <tr>
          <td><strong>Hệ Thống Tính Năng</strong></td>
          <td>Đầy đủ 100% các tính năng hiện có của app.</td>
          <td>Đầy đủ 100% các tính năng hiện có của app.</td>
          <td>Đầy đủ 100% các tính năng hiện có của app.</td>
        </tr>
        <tr>
          <td><strong>Điểm Chạm B2B</strong></td>
          <td>Trao cơ hội, Đăng sản phẩm, Chạm thẻ NFC, Sự kiện.</td>
          <td>Trao cơ hội, Đăng sản phẩm, Chạm thẻ NFC, Sự kiện.</td>
          <td>Trao cơ hội, Đăng sản phẩm, Chạm thẻ NFC, Sự kiện.</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:auto;padding:14px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:10px;font-weight:900;color:#0f172a;">ĐẠI DIỆN ĐỘI NGŨ THIẾT KẾ SẢN PHẨM</div>
        <div style="font-size:9px;color:#64748b;margin-top:2px;">Phòng Thiết Kế UI/UX • VIONE Studio</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;font-weight:900;color:#003B95;">PHÊ DUYỆT CỦA BAN LÃNH ĐẠO</div>
        <div style="font-size:9px;color:#64748b;margin-top:2px;">CLB Doanh Nhân CEO 1983</div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Đề Xuất Chuẩn Hóa Giao Diện</div>
      <div>Trang 9 / 9</div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.resolve('scratch/de_xuat_giao_dien_sac_net.html');
fs.writeFileSync(htmlPath, fullHtml, 'utf8');

const pdfPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Rendering 9-page Ultra-Sharp Brand Presentation with Edge Headless...');
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
