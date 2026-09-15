const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Read authentic local assets as Base64 to ensure 100% offline rendering & crystal sharp image quality
const logoPath = path.resolve('apps/vione_app_fe/public/ceo1983-logo.png');
const emblemPath = path.resolve('apps/vione_app_fe/public/ceo1983-emblem-8.png');
const skylinePath = path.resolve('apps/vione_app_fe/public/ceo1983_hero_daylight_skyline.jpg');
const giftPath = path.resolve('apps/vione_app_fe/src/assets/vba-gift.png');
const heroPath = path.resolve('apps/vione_app_fe/src/assets/vba-hero.jpg');
const eventPath = path.resolve('apps/vione_app_fe/src/assets/vba-event.jpg');

const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString('base64') : '';
const emblemBase64 = fs.existsSync(emblemPath) ? fs.readFileSync(emblemPath).toString('base64') : '';
const skylineBase64 = fs.existsSync(skylinePath) ? fs.readFileSync(skylinePath).toString('base64') : '';
const giftBase64 = fs.existsSync(giftPath) ? fs.readFileSync(giftPath).toString('base64') : '';
const heroBase64 = fs.existsSync(heroPath) ? fs.readFileSync(heroPath).toString('base64') : '';
const eventBase64 = fs.existsSync(eventPath) ? fs.readFileSync(eventPath).toString('base64') : '';

// Helper: Render SCREEN 1 (Home Screen - 100% Features of Association App)
function renderHomeScreen(option) {
  let cfg = {};

  if (option === 'pa1') {
    // Phương Án 1: Classic Navy & Gold (Doanh Nhân Lịch Lãm)
    cfg = {
      cardBg: 'linear-gradient(135deg, #00224f 0%, #003B95 55%, #0f4c9c 100%)',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.30;`,
      cardBorder: '1.5px solid #f59e0b',
      avatarBorder: '#f59e0b',
      badgeClass: 'background:#fef3c7; color:#b45309; border: 1px solid #fde68a;',
      accentColor: '#f59e0b',
      btnPrimary: '#003B95',
      btnText: '#ffffff',
      btnSecondary: '#f0f4fa',
      btnSecText: '#003B95',
      borderSoft: '#e2e8f0',
      tagColor: '#003B95',
      iconStyle: 'classic'
    };
  } else if (option === 'pa2') {
    // Phương Án 2: Digital Sapphire Tech (Kỷ Nguyên Chuyển Đổi Số)
    cfg = {
      cardBg: 'linear-gradient(135deg, #021a30 0%, #0284c7 65%, #38bdf8 100%)',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${heroBase64}'); background-size: cover; background-position: center; opacity: 0.40;`,
      cardBorder: '1.5px solid #38bdf8; box-shadow: 0 0 12px rgba(56,189,248,0.3);',
      avatarBorder: '#38bdf8',
      badgeClass: 'background:#e0f2fe; color:#0369a1; border: 1px solid #7dd3fc;',
      accentColor: '#38bdf8',
      btnPrimary: '#0284c7',
      btnText: '#ffffff',
      btnSecondary: '#e0f2fe',
      btnSecText: '#0284c7',
      borderSoft: '#bae6fd',
      tagColor: '#0284c7',
      iconStyle: 'visionos'
    };
  } else {
    // Phương Án 3: B2B Commerce Focus (Giao Thương Thực Chiến Tối Giản)
    cfg = {
      cardBg: 'linear-gradient(135deg, #080c14 0%, #0f172a 65%, #1e293b 100%)',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.22;`,
      cardBorder: '1.5px solid #ea580c',
      avatarBorder: '#ea580c',
      badgeClass: 'background:#ffedd5; color:#c2410c; border: 1px solid #fdba74;',
      accentColor: '#ea580c',
      btnPrimary: '#ea580c',
      btnText: '#ffffff',
      btnSecondary: '#0f172a',
      btnSecText: '#ffffff',
      borderSoft: '#cbd5e1',
      tagColor: '#0f172a',
      iconStyle: 'flat'
    };
  }

  // 8 Quick Actions with clear styling per option
  const icons = [
    { label: 'Thẻ hội viên', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>', bg: cfg.iconStyle === 'visionos' ? '#e0f2fe' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#0284c7' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95' },
    { label: 'Danh thiếp số', iconSvg: '<path d="M16 2v4"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="11" r="3"/>', bg: '#ffedd5', color: '#ea580c', badge: 'Mới' },
    { label: 'Hội viên', iconSvg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', bg: cfg.iconStyle === 'visionos' ? '#d1fae5' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#059669' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95' },
    { label: 'Sự kiện', iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>', bg: cfg.iconStyle === 'visionos' ? '#fef3c7' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#d97706' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95', badge: '3' },
    { label: 'Tin tức', iconSvg: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/>', bg: cfg.iconStyle === 'visionos' ? '#ede9fe' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#7c3aed' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95', badge: '5' },
    { label: 'Tài liệu', iconSvg: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13Z"/>', bg: cfg.iconStyle === 'visionos' ? '#cffafe' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#0891b2' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95' },
    { label: 'Liên hệ nhanh', iconSvg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', bg: '#ffedd5', color: '#ea580c', badge: '1' },
    { label: 'Ưu đãi hội viên', iconSvg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', bg: cfg.iconStyle === 'visionos' ? '#fce7f3' : cfg.iconStyle === 'flat' ? '#f1f5f9' : '#f0f4fa', color: cfg.iconStyle === 'visionos' ? '#db2777' : cfg.iconStyle === 'flat' ? '#334155' : '#003B95' },
  ];

  return `
    <div class="phone-mockup-large">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>09:41</span>
        <div class="m-status-icons">
          <span>5G</span>
          <span style="font-weight:900;">100%</span>
        </div>
      </div>

      <!-- 1. App Header -->
      <div class="m-header">
        <img class="m-logo" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
        <div class="m-header-right">
          <div class="m-bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${option === 'pa3' ? '#0f172a' : cfg.btnPrimary}" stroke-width="2.3"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="m-bell-badge">3</span>
          </div>
        </div>
      </div>

      <!-- Hero Glow Stripe -->
      <div class="m-hero-glow"></div>

      <!-- 2. VIP Member Compact Widget (-mt-14) -->
      <div class="m-vip-card" style="background:${cfg.cardBg}; border:${cfg.cardBorder};">
        <div class="m-vip-overlay" style="${cfg.cardOverlay}"></div>
        <div class="m-vip-body">
          <div class="m-vip-avatar" style="border-color:${cfg.avatarBorder};">
            <span>MT</span>
          </div>
          <div class="m-vip-content">
            <div class="m-vip-company">CÔNG TY DU LỊCH QUỐC TẾ Á CHÂU</div>
            <div class="m-vip-name">
              <span>ĐỖ THỊ MAI</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
            </div>
            <div class="m-vip-tags">
              <span class="m-badge-gold" style="${cfg.badgeClass}">VIP GOLD</span>
              <span class="m-badge-code">M1983-012 📋</span>
            </div>
          </div>
          <div style="color:rgba(255,255,255,0.75);font-size:17px;font-weight:900;">›</div>
        </div>
      </div>

      <!-- 3. Lưới 8 Tính Năng Nhanh (Full Labels, No Ellipsis) -->
      <div class="m-box" style="margin-top:8px;">
        <div class="m-box-title" style="color:${cfg.tagColor};">
          <span class="m-dot" style="background:${cfg.btnPrimary};"></span>
          TÍNH NĂNG NHANH
        </div>
        <div class="m-grid-8">
          ${icons.map(ic => `
            <div class="m-grid-col">
              <div class="m-icon-box" style="background:${ic.bg};color:${ic.color};">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  ${ic.iconSvg}
                </svg>
                ${ic.badge ? `<span class="m-icon-badge">${ic.badge}</span>` : ''}
              </div>
              <div class="m-icon-text">${ic.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. Khối Sự Kiện Nổi Bật -->
      <div class="m-box" style="margin-top:7px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="m-box-title" style="margin-bottom:0;color:${cfg.tagColor};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${cfg.btnPrimary}" stroke-width="2.4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            SỰ KIỆN NỔI BẬT
          </div>
          <span style="font-size:9px;font-weight:800;color:${cfg.btnPrimary};">Xem tất cả +2 ›</span>
        </div>
        <div class="m-event-item">
          <div class="m-event-calendar" style="background:${cfg.btnPrimary};">
            <span class="m-cal-day">16</span>
            <span class="m-cal-month">SEP</span>
          </div>
          <div class="m-event-text">
            <div class="m-event-meta">07:00 • CLB Doanh Nhân CEO 1983</div>
            <div class="m-event-name">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
            <div class="m-event-location">📍 TT Hội Nghị Quốc Gia, Hà Nội</div>
          </div>
        </div>
      </div>

      <!-- 5. Khối Ưu Đãi Hội Viên & Đối Tác -->
      <div class="m-perks-item" style="border-color:${cfg.borderSoft};">
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:900;color:${option === 'pa3' ? '#ea580c' : cfg.btnPrimary};">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Ưu đãi Hội viên & Đối tác
            <span class="m-hot-pill">+Hot</span>
          </div>
          <div style="font-size:8px;color:#64748b;line-height:1.3;margin:3px 0 5px 0;">
            Chính sách trợ giá, quà tặng liên kết & quyền lợi giao thương.
          </div>
          <button style="background:${cfg.btnPrimary};color:${cfg.btnText};" class="m-action-pill">
            Xem ưu đãi ngay →
          </button>
        </div>
        <div style="width:44px;height:44px;flex-shrink:0;">
          <img src="data:image/png;base64,${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
        </div>
      </div>

      <!-- 6. Cặp Khối Giao Thương B2B Thực Chiến (Trao cơ hội & Đăng sản phẩm) -->
      <div class="m-b2b-grid">
        <div class="m-b2b-box" style="border-color:${cfg.borderSoft};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:16px;">🤝</span>
            <span class="m-hot-pill">+2 Mới</span>
          </div>
          <div class="m-b2b-title">TRAO CƠ HỘI</div>
          <div class="m-b2b-desc">Chia sẻ cơ hội Kết nối thành công</div>
          <button class="m-b2b-btn" style="background:${cfg.btnSecondary};color:${cfg.btnSecText};">Khám phá ngay</button>
        </div>

        <div class="m-b2b-box" style="border-color:${cfg.borderSoft};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:16px;">📦</span>
            <span class="m-hot-pill">+11 Mới</span>
          </div>
          <div class="m-b2b-title">ĐĂNG SẢN PHẨM</div>
          <div class="m-b2b-desc">Quảng bá sản phẩm Kết nối khách hàng</div>
          <button class="m-b2b-btn" style="background:${cfg.btnPrimary};color:${cfg.btnText};">Đăng ngay</button>
        </div>
      </div>

      <!-- 7. Install to Home Screen Hint -->
      <div class="m-install-hint" style="border-color:${option === 'pa3' ? '#ea580c' : cfg.btnPrimary}; color:${option === 'pa3' ? '#ea580c' : cfg.btnPrimary};">
        📲 Cài đặt ứng dụng lên màn hình chính điện thoại
      </div>

      <!-- 8. Bottom Navigation Bar -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab active" style="color:${option === 'pa3' ? '#ea580c' : cfg.btnPrimary};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="border-color:${option === 'pa3' ? '#ea580c' : cfg.btnPrimary};">
          <img src="data:image/png;base64,${emblemBase64}" style="width:22px;height:22px;object-fit:contain;" alt="83">
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Gắn kết</span>
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Helper: Render SCREEN 2 (Gắn Kết & Tin Nhắn Hội Viên Screen)
function renderMessagesScreen(option) {
  let cfg = {};
  if (option === 'pa1') {
    cfg = {
      primary: '#003B95',
      accent: '#f59e0b',
      badgeClass: 'background:#fef3c7; color:#b45309; border: 1px solid #fde68a;',
      tabActive: '#003B95',
      avatarRing: '#003B95',
      borderSoft: '#e2e8f0',
      pillBg: '#f0f4fa',
      pillText: '#003B95'
    };
  } else if (option === 'pa2') {
    cfg = {
      primary: '#0284c7',
      accent: '#38bdf8',
      badgeClass: 'background:#e0f2fe; color:#0369a1; border: 1px solid #7dd3fc;',
      tabActive: '#0284c7',
      avatarRing: '#38bdf8',
      borderSoft: '#bae6fd',
      pillBg: '#e0f2fe',
      pillText: '#0284c7'
    };
  } else {
    cfg = {
      primary: '#ea580c',
      accent: '#ea580c',
      badgeClass: 'background:#ffedd5; color:#c2410c; border: 1px solid #fdba74;',
      tabActive: '#0f172a',
      avatarRing: '#ea580c',
      borderSoft: '#cbd5e1',
      pillBg: '#ffedd5',
      pillText: '#ea580c'
    };
  }

  return `
    <div class="phone-mockup-medium">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>09:41</span>
        <div class="m-status-icons"><span>5G</span><span style="font-weight:900;">100%</span></div>
      </div>

      <!-- Header Gắn Kết -->
      <div class="m-inner-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.6"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:12px;font-weight:900;color:#0f172a;">Gắn Kết & Tin Nhắn</span>
        <div style="display:flex;gap:6px;align-items:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${cfg.primary}" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
      </div>

      <!-- Search Bar -->
      <div style="padding:4px 10px 6px 10px;">
        <div style="display:flex;align-items:center;gap:6px;background:#f1f5f9;border-radius:12px;padding:6px 10px;font-size:8.5px;color:#64748b;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Tìm kiếm đối tác, nội dung trao đổi...</span>
        </div>
      </div>

      <!-- Online Active Row (Messenger style) -->
      <div style="padding:2px 10px 6px 10px;border-bottom:1px solid #f1f5f9;display:flex;gap:8px;overflow:hidden;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:38px;flex-shrink:0;">
          <div style="width:34px;height:34px;border-radius:50%;border:1.5px dashed ${cfg.primary};background:${cfg.pillBg};display:flex;align-items:center;justify-content:center;color:${cfg.primary};font-size:16px;font-weight:900;">
            +
          </div>
          <span style="font-size:7px;font-weight:700;color:#64748b;">Nhắn mới</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:38px;flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;">
            <div style="width:100%;height:100%;border-radius:50%;border:2px solid ${cfg.avatarRing};background:#003B95;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">
              LÂ
            </div>
            <span style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#10b981;border:1.5px solid #fff;"></span>
          </div>
          <span style="font-size:7px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38px;">Lâm Đ.</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:38px;flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;">
            <div style="width:100%;height:100%;border-radius:50%;border:2px solid ${cfg.avatarRing};background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">
              TG
            </div>
            <span style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#10b981;border:1.5px solid #fff;"></span>
          </div>
          <span style="font-size:7px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38px;">Trang T.</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:38px;flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;">
            <div style="width:100%;height:100%;border-radius:50%;border:2px solid ${cfg.avatarRing};background:#ea580c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">
              NL
            </div>
            <span style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#10b981;border:1.5px solid #fff;"></span>
          </div>
          <span style="font-size:7px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38px;">Long N.</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:38px;flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;">
            <div style="width:100%;height:100%;border-radius:50%;border:2px solid ${cfg.avatarRing};background:#7c3aed;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">
              TH
            </div>
            <span style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#10b981;border:1.5px solid #fff;"></span>
          </div>
          <span style="font-size:7px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38px;">Hằng P.</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div style="padding:5px 10px 4px 10px;display:flex;gap:4px;">
        <span style="background:${cfg.tabActive};color:#fff;font-size:7.5px;font-weight:800;padding:3px 7px;border-radius:999px;">Tất cả (8)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:7.5px;font-weight:700;padding:3px 7px;border-radius:999px;">Chưa đọc (3)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:7.5px;font-weight:700;padding:3px 7px;border-radius:999px;">Tin chờ</span>
        <span style="background:#f1f5f9;color:#475569;font-size:7.5px;font-weight:700;padding:3px 7px;border-radius:999px;">Hệ thống</span>
      </div>

      <!-- Conversations List -->
      <div style="padding:2px 10px;display:flex;flex-direction:column;gap:5px;">
        <!-- Chat Item 1: Ban Thư Ký CLB CEO 1983 (Pinned/System) -->
        <div style="display:flex;gap:7px;align-items:center;padding:5px 6px;background:${cfg.pillBg};border-radius:8px;border:1px solid ${cfg.borderSoft};">
          <div style="position:relative;width:32px;height:32px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#ffffff;border:1.5px solid ${cfg.primary};display:flex;align-items:center;justify-content:center;">
              <img src="data:image/png;base64,${emblemBase64}" style="width:18px;height:18px;object-fit:contain;" alt="83">
            </div>
            <span style="position:absolute;bottom:-1px;right:-1px;width:7px;height:7px;border-radius:50%;background:#10b981;border:1px solid #fff;"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:3px;">
                <span style="font-size:8.5px;font-weight:900;color:#0f172a;">Ban Thư Ký CLB CEO 1983</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#0284c7"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
              </div>
              <span style="font-size:6.5px;color:#64748b;font-weight:700;">09:30</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1px;">
              <span style="font-size:7.5px;color:${cfg.primary};font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;">
                Thư mời họp Ban Điều Hành & xác nhận lịch Đại hội...
              </span>
              <span style="background:#ef4444;color:#fff;font-size:6px;font-weight:900;padding:1px 4px;border-radius:999px;">1</span>
            </div>
          </div>
        </div>

        <!-- Chat Item 2: Nguyễn Văn An -->
        <div style="display:flex;gap:7px;align-items:center;padding:5px 6px;background:#ffffff;border-radius:8px;border:1px solid #f1f5f9;">
          <div style="position:relative;width:32px;height:32px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:900;">
              NA
            </div>
            <span style="position:absolute;bottom:-1px;right:-1px;width:7px;height:7px;border-radius:50%;background:#10b981;border:1px solid #fff;"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:8.5px;font-weight:800;color:#0f172a;">Nguyễn Văn An • Cơ Khí Toàn Cầu</span>
              <span style="font-size:6.5px;color:#64748b;">08:45</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1px;">
              <span style="font-size:7.5px;color:#475569;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;">
                Chào chị Mai, bên em đã gửi báo giá gói linh kiện B2B...
              </span>
              <span style="background:#ef4444;color:#fff;font-size:6px;font-weight:900;padding:1px 4px;border-radius:999px;">2</span>
            </div>
          </div>
        </div>

        <!-- Chat Item 3: Trần Thị Kim Thoa -->
        <div style="display:flex;gap:7px;align-items:center;padding:5px 6px;background:#ffffff;border-radius:8px;border:1px solid #f1f5f9;">
          <div style="position:relative;width:32px;height:32px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:900;">
              KT
            </div>
            <span style="position:absolute;bottom:-1px;right:-1px;width:7px;height:7px;border-radius:50%;background:#cbd5e1;border:1px solid #fff;"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:8.5px;font-weight:800;color:#0f172a;">Kim Thoa • BĐS Á Châu</span>
              <span style="font-size:6.5px;color:#64748b;">Hôm qua</span>
            </div>
            <div style="font-size:7.5px;color:#64748b;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              Hẹn gặp chị tại Gala Dinner 28/9 tới nhé chị ơi! 🤝
            </div>
          </div>
        </div>

        <!-- Chat Item 4: Lê Hoàng Nam -->
        <div style="display:flex;gap:7px;align-items:center;padding:5px 6px;background:#ffffff;border-radius:8px;border:1px solid #f1f5f9;">
          <div style="position:relative;width:32px;height:32px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#ea580c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:900;">
              HN
            </div>
            <span style="position:absolute;bottom:-1px;right:-1px;width:7px;height:7px;border-radius:50%;background:#cbd5e1;border:1px solid #fff;"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:8.5px;font-weight:800;color:#0f172a;">Hoàng Nam • ViOne Tech</span>
              <span style="font-size:6.5px;color:#64748b;">14/09</span>
            </div>
            <div style="font-size:7.5px;color:#64748b;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              Đã xác nhận kết nối trao cơ hội xúc tiến số...
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Nav Bar (Tab Gắn kết Active) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="border-color:${option === 'pa3' ? '#ea580c' : cfg.primary};">
          <img src="data:image/png;base64,${emblemBase64}" style="width:22px;height:22px;object-fit:contain;" alt="83">
        </div>
        <div class="m-nav-tab active" style="color:${option === 'pa3' ? '#ea580c' : cfg.primary};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Gắn kết</span>
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

// Helper: Render SCREEN 3 (Cá Nhân - Facebook Executive Profile Screen)
function renderProfileScreen(option) {
  let cfg = {};
  if (option === 'pa1') {
    cfg = {
      primary: '#003B95',
      accent: '#f59e0b',
      badgeClass: 'background:#fef3c7; color:#b45309; border: 1px solid #fde68a;',
      coverBg: 'linear-gradient(135deg, #07192f 0%, #003B95 60%, #0d386d 100%)',
      avatarRing: '#f59e0b',
      borderSoft: '#e2e8f0',
      pillBg: '#f0f4fa',
      pillText: '#003B95'
    };
  } else if (option === 'pa2') {
    cfg = {
      primary: '#0284c7',
      accent: '#38bdf8',
      badgeClass: 'background:#e0f2fe; color:#0369a1; border: 1px solid #7dd3fc;',
      coverBg: 'linear-gradient(135deg, #021a30 0%, #0284c7 65%, #38bdf8 100%)',
      avatarRing: '#38bdf8',
      borderSoft: '#bae6fd',
      pillBg: '#e0f2fe',
      pillText: '#0284c7'
    };
  } else {
    cfg = {
      primary: '#ea580c',
      accent: '#ea580c',
      badgeClass: 'background:#ffedd5; color:#c2410c; border: 1px solid #fdba74;',
      coverBg: 'linear-gradient(135deg, #090d16 0%, #0f172a 65%, #1e293b 100%)',
      avatarRing: '#ea580c',
      borderSoft: '#cbd5e1',
      pillBg: '#ffedd5',
      pillText: '#ea580c'
    };
  }

  return `
    <div class="phone-mockup-medium">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>09:41</span>
        <div class="m-status-icons"><span>5G</span><span style="font-weight:900;">100%</span></div>
      </div>

      <!-- Header -->
      <div class="m-inner-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.6"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:12px;font-weight:900;color:#0f172a;">Trang Cá Nhân Doanh Nhân</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>

      <!-- 1. Cover Photo & Avatar (Facebook Profile Style) -->
      <div style="position:relative;height:58px;background:${cfg.coverBg};overflow:hidden;">
        <img src="data:image/jpeg;base64,${heroBase64}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" alt="Cover">
        <div style="position:absolute;top:5px;right:7px;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);color:#fff;border-radius:4px;padding:2px 5px;font-size:6.5px;font-weight:700;display:flex;align-items:center;gap:3px;border:1px solid rgba(255,255,255,0.3);">
          📷 Đổi ảnh bìa
        </div>
      </div>

      <!-- Avatar & VIP Tag -->
      <div style="padding:0 10px;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:-22px;margin-bottom:4px;">
          <div style="position:relative;">
            <div style="width:48px;height:48px;border-radius:14px;border:2.5px solid ${cfg.avatarRing};background:#003B95;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
              MT
            </div>
            <span style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid #fff;"></span>
          </div>
          <span class="m-badge-gold" style="${cfg.badgeClass};font-size:7.5px;padding:2px 6px;">
            VIP MEMBER CEO 1983
          </span>
        </div>

        <!-- Name & Title -->
        <div style="margin-top:2px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:12.5px;font-weight:900;color:#0f172a;">ĐỖ THỊ MAI</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
          </div>
          <div style="font-size:8px;font-weight:700;color:${cfg.primary};margin-top:1px;">
            Tổng Giám Đốc • CÔNG TY DU LỊCH QUỐC TẾ Á CHÂU
          </div>
          <div style="font-size:7px;color:#64748b;margin-top:2px;font-style:italic;">
            "Tiên phong kết nối • Nâng tầm giá trị doanh nghiệp Việt"
          </div>
        </div>

        <!-- 3 Action Buttons: Facebook style -->
        <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:4px;margin-top:6px;">
          <button style="background:${cfg.primary};color:#fff;border:none;border-radius:6px;padding:5px 0;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;">
            + Thêm vào tin
          </button>
          <button style="background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0;border-radius:6px;padding:5px 0;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;">
            Chỉnh sửa
          </button>
          <button style="background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0;border-radius:6px;padding:5px 0;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;">
            Chia sẻ
          </button>
        </div>

        <!-- Profile Details Box -->
        <div style="margin-top:6px;background:#f8fafc;border:1px solid ${cfg.borderSoft};border-radius:8px;padding:5px 8px;font-size:7.5px;color:#475569;display:flex;flex-direction:column;gap:3px;">
          <div style="display:flex;align-items:center;gap:5px;">
            <span>🏢</span>
            <span>Ngành nghề: <strong>Du lịch, Khách sạn & Sự kiện B2B</strong></span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <span>📍</span>
            <span>Địa bàn: <strong>Hà Nội</strong> • Trụ sở: <strong>Quận Hoàn Kiếm</strong></span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <span>🤝</span>
            <span>Mạng lưới: <strong style="color:${cfg.primary};">128 Doanh nhân liên kết</strong></span>
          </div>
        </div>

        <!-- Friends / Network Grid 6 Thumbnails -->
        <div style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:8px;font-weight:900;color:#0f172a;">BẠN BÈ & ĐỐI TÁC (128)</span>
            <span style="font-size:7px;color:${cfg.primary};font-weight:700;">Xem tất cả ›</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:3px;text-align:center;">
            <div style="background:#003B95;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">NL</div>
            <div style="background:#0284c7;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">VA</div>
            <div style="background:#ea580c;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">KT</div>
            <div style="background:#7c3aed;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">TH</div>
            <div style="background:#059669;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">DL</div>
            <div style="background:#475569;color:#fff;border-radius:6px;height:24px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">+122</div>
          </div>
        </div>

        <!-- "What's on your mind?" Composer Box -->
        <div style="margin-top:6px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:5px 8px;display:flex;align-items:center;gap:6px;">
          <div style="width:20px;height:20px;border-radius:50%;background:#003B95;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:900;">MT</div>
          <span style="font-size:7.5px;color:#94a3b8;flex:1;">Bạn đang tìm kiếm cơ hội hợp tác gì hôm nay?</span>
          <span>📷</span>
        </div>
      </div>

      <!-- Bottom Nav Bar (Tab Cá nhân Active) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="border-color:${option === 'pa3' ? '#ea580c' : cfg.primary};">
          <img src="data:image/png;base64,${emblemBase64}" style="width:22px;height:22px;object-fit:contain;" alt="83">
        </div>
        <div class="m-nav-tab">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Gắn kết</span>
        </div>
        <div class="m-nav-tab active" style="color:${option === 'pa3' ? '#ea580c' : cfg.primary};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}
// 5. Generate Master HTML Document (8 Pages A4, Crystal Sharp)
const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Đề Xuất Chuẩn Hóa Giao Diện App CLB Doanh Nhân CEO 1983</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
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
      padding: 10mm 12mm 8mm 12mm;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    .brand-stripe {
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
      padding-bottom: 7px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .brand-logo-header {
      height: 26px;
      width: auto;
      object-fit: contain;
    }

    .header-pill {
      font-size: 9px;
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
      font-size: 8.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 5px;
      flex-shrink: 0;
    }

    /* Cover Page */
    .cover-page {
      background: radial-gradient(circle at 85% 15%, #0c2340 0%, #031426 50%, #010710 100%);
      color: #ffffff;
      padding: 24mm 16mm 14mm 16mm;
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
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .cover-main-title {
      font-size: 30px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .cover-main-title span {
      background: linear-gradient(90deg, #38bdf8 0%, #f97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-lead {
      font-size: 11.5px;
      line-height: 1.65;
      color: #94a3b8;
      max-width: 580px;
      margin-bottom: 22px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px;
    }
    .cover-card h4 {
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .cover-card p {
      font-size: 9.5px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    /* Page Typography */
    h2.doc-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    p.doc-subtitle {
      font-size: 10px;
      color: #64748b;
      margin-bottom: 8px;
    }

    /* ==================== CRISP PHONE MOCKUP STYLING ==================== */
    /* Large Phone Mockup for Single Home Screen Pages (100mm width x 234mm height) */
    .phone-mockup-large {
      width: 100mm;
      height: 234mm;
      background: #ffffff;
      border: 2.5px solid #0f172a;
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 12px 36px rgba(0,0,0,0.15);
      position: relative;
      flex-shrink: 0;
    }

    /* Medium Phone Mockup for Dual Screen Pages (88mm width x 205mm height) */
    .phone-mockup-medium {
      width: 88mm;
      height: 205mm;
      background: #ffffff;
      border: 2.5px solid #0f172a;
      border-radius: 26px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.13);
      position: relative;
      flex-shrink: 0;
    }

    /* Status Bar */
    .m-status-bar {
      height: 16px;
      padding: 2px 12px 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      font-weight: 800;
      color: #0f172a;
      background: #ffffff;
      flex-shrink: 0;
    }
    .m-status-icons {
      display: flex;
      gap: 4px;
      align-items: center;
      font-size: 8.5px;
    }

    /* App Header */
    .m-header {
      height: 38px;
      padding: 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      flex-shrink: 0;
    }
    .m-logo {
      height: 26px;
      width: auto;
      object-fit: contain;
    }
    .m-bell-btn {
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #f0f4fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .m-bell-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 7.5px;
      font-weight: 900;
      padding: 1px 3.5px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }

    .m-hero-glow {
      height: 14px;
      background: linear-gradient(180deg, rgba(2,132,199,0.15) 0%, rgba(2,132,199,0.01) 100%);
      flex-shrink: 0;
    }

    /* VIP Member Widget */
    .m-vip-card {
      margin: -10px 8px 0 8px;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      flex-shrink: 0;
    }
    .m-vip-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .m-vip-body {
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      z-index: 2;
    }
    .m-vip-avatar {
      width: 38px;
      height: 38px;
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
    .m-vip-content {
      flex: 1;
      min-width: 0;
    }
    .m-vip-company {
      font-size: 7.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }
    .m-vip-name {
      font-size: 12px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .m-vip-tags {
      display: flex;
      gap: 4px;
      margin-top: 3px;
      align-items: center;
    }
    .m-badge-gold {
      font-size: 7.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .m-badge-code {
      font-size: 7.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(255,255,255,0.16);
      color: #ffffff;
    }

    /* Box Container */
    .m-box {
      margin: 6px 8px 0 8px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 6px 8px;
      flex-shrink: 0;
    }
    .m-box-title {
      font-size: 9px;
      font-weight: 900;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      letter-spacing: 0.2px;
    }
    .m-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
    }

    /* 8 Grid (No Truncation) */
    .m-grid-8 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px 2px;
    }
    .m-grid-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .m-icon-box {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .m-icon-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 6.5px;
      font-weight: 900;
      padding: 0.5px 3.5px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }
    .m-icon-text {
      font-size: 7.5px;
      font-weight: 700;
      color: #1e293b;
      text-align: center;
      line-height: 1.15;
      width: 100%;
      word-break: break-word;
      white-space: normal;
    }

    /* Event Item */
    .m-event-item {
      display: flex;
      gap: 8px;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 9px;
      padding: 5px 7px;
    }
    .m-event-calendar {
      width: 28px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .m-cal-day {
      font-size: 13px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
    }
    .m-cal-month {
      font-size: 6.5px;
      font-weight: 800;
      color: rgba(255,255,255,0.9);
      text-transform: uppercase;
    }
    .m-event-text {
      flex: 1;
      min-width: 0;
    }
    .m-event-meta {
      font-size: 7.5px;
      color: #64748b;
      font-weight: 700;
    }
    .m-event-name {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin: 1px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .m-event-location {
      font-size: 7.5px;
      color: #94a3b8;
    }

    /* Perks Item */
    .m-perks-item {
      margin: 6px 8px 0 8px;
      background: #ffffff;
      border: 1px solid #bae6fd;
      border-radius: 11px;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .m-hot-pill {
      font-size: 7px;
      font-weight: 800;
      color: #ef4444;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 0.5px 4px;
      border-radius: 999px;
    }
    .m-action-pill {
      border: none;
      padding: 2.5px 7px;
      border-radius: 5px;
      font-size: 7.5px;
      font-weight: 800;
      cursor: pointer;
    }

    /* B2B Grid */
    .m-b2b-grid {
      margin: 6px 8px 0 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      flex-shrink: 0;
    }
    .m-b2b-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .m-b2b-title {
      font-size: 9px;
      font-weight: 900;
      color: #0f172a;
    }
    .m-b2b-desc {
      font-size: 7px;
      color: #64748b;
      line-height: 1.2;
      margin: 1px 0 4px 0;
    }
    .m-b2b-btn {
      border: none;
      border-radius: 4px;
      font-size: 7.5px;
      font-weight: 800;
      padding: 2.5px 6px;
      cursor: pointer;
      align-self: flex-start;
    }

    /* Install Hint */
    .m-install-hint {
      margin: 6px 8px 0 8px;
      border: 1px dashed #0284c7;
      border-radius: 8px;
      padding: 4px 0;
      text-align: center;
      font-size: 8px;
      font-weight: 800;
      color: #0284c7;
      background: #f0f9ff;
      flex-shrink: 0;
    }

    /* Bottom Navigation Bar */
    .m-bottom-nav {
      margin-top: auto;
      height: 38px;
      border-top: 1px solid #f1f5f9;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 4px;
      flex-shrink: 0;
    }
    .m-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 7px;
      font-weight: 700;
      color: #94a3b8;
    }
    .m-nav-center {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #ffffff;
      border: 1.5px solid #003B95;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,59,149,0.25);
      margin-top: -10px;
    }

    /* Medium Phone Inner Header */
    .m-inner-header {
      height: 34px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
    }

    /* Tab Switcher in Card Screen */
    .m-tab-switcher {
      margin: 6px 10px 0 10px;
      display: flex;
      border-radius: 8px;
      background: #f1f5f9;
      padding: 2px;
      flex-shrink: 0;
    }
    .m-tab-switch {
      flex: 1;
      text-align: center;
      padding: 4px 0;
      font-size: 8.5px;
      font-weight: 800;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #64748b;
    }

    /* Pass Card */
    .m-pass-card {
      margin: 6px 10px 0 10px;
      border-radius: 14px;
      padding: 10px 10px 8px 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.22);
      flex-shrink: 0;
    }

    .m-sub-action {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 4px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .m-sub-action span {
      font-size: 7.5px;
      font-weight: 700;
      color: #475569;
    }

    /* Event Screen Elements */
    .m-cat-pills {
      margin: 6px 10px 0 10px;
      display: flex;
      gap: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .m-pill {
      font-size: 7.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
      white-space: nowrap;
    }
    .m-hero-event {
      margin: 6px 10px 0 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .m-hero-event-img {
      height: 48px;
      position: relative;
      background: #0f172a;
    }
    .m-hero-event-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
    }
    .m-hero-event-tag {
      position: absolute;
      top: 4px;
      left: 6px;
      background: #ef4444;
      color: #fff;
      font-size: 6.5px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .m-hero-event-date-box {
      position: absolute;
      bottom: 4px;
      right: 6px;
      border-radius: 5px;
      padding: 2px 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
    }
    .m-list-event {
      margin: 4px 10px 0 10px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 4px 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .m-cal-badge {
      width: 24px;
      height: 26px;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Comparison Table Styling */
    .compare-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9.5px;
    }
    .compare-table th {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      font-weight: 900;
      color: #0f172a;
      text-align: left;
    }
    .compare-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      color: #334155;
      line-height: 1.4;
      vertical-align: top;
    }
    .compare-table tr:nth-child(even) td {
      background: #fafafa;
    }

    /* 2-Column Presentation Layout */
    .screen-layout-single {
      display: grid;
      grid-template-columns: 100mm 1fr;
      gap: 12mm;
      align-items: start;
      margin-top: 4px;
      flex: 1;
    }
    .spec-sidebar {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .spec-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .spec-box h4 {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .spec-box p {
      font-size: 9.5px;
      color: #475569;
      line-height: 1.45;
    }

    /* Dual Screen Layout (2 phones side-by-side) */
    .screen-layout-dual {
      display: grid;
      grid-template-columns: 88mm 88mm;
      gap: 10mm;
      justify-content: center;
      margin-top: 4px;
      flex: 1;
    }
    .dual-screen-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .screen-tag {
      font-size: 10px;
      font-weight: 900;
      color: #003B95;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1: BÌA HỒ SƠ ĐỀ XUẤT THIẾT KẾ ==================== -->
  <div class="page cover-page">
    <div class="brand-stripe"></div>

    <div>
      <div class="cover-top-tag">
        <span>✦</span>
        <span>HỒ SƠ ĐỀ XUẤT THIẾT KẾ GIAO DIỆN • UI/UX CONCEPT</span>
      </div>

      <div style="margin-bottom: 24px;">
        <img src="data:image/png;base64,${logoBase64}" style="height: 54px; width: auto; filter: drop-shadow(0 4px 16px rgba(56,189,248,0.4));" alt="CEO 1983">
      </div>

      <h1 class="cover-main-title">
        ĐỀ XUẤT CHUẨN HÓA GIAO DIỆN<br>
        <span>ỨNG DỤNG CLB DOANH NHÂN CEO 1983</span>
      </h1>

      <p class="cover-lead">
        Chuẩn hóa toàn diện ngôn ngữ thị giác theo nhận diện thương hiệu chính thức (Cobalt Navy & Warm Amber/Orange). Bảo toàn 100% các tính năng hiện có của ứng dụng hiệp hội và cung cấp 3 phương án thẩm mỹ để Ban Lãnh đạo lựa chọn.
      </p>

      <div class="cover-grid">
        <div class="cover-card">
          <h4>Phương Án 1 • Classic Navy & Gold</h4>
          <p>Chuẩn mực Doanh nhân lịch lãm. Cân bằng tuyệt đối giữa sắc xanh Cobalt đĩnh đạc và ánh kim Amber quyền quý.</p>
        </div>
        <div class="cover-card">
          <h4>Phương Án 2 • Digital Sapphire</h4>
          <p>Kỷ nguyên chuyển đổi số. Đồ họa tinh thể 3D đa diện, ánh sáng viền Cyan công nghệ và biểu tượng đa sắc hiện đại.</p>
        </div>
        <div class="cover-card">
          <h4>Phương Án 3 • B2B Commerce Focus</h4>
          <p>Giao thương thực chiến tối giản. Ngôn ngữ thiết kế phẳng, đẩy thông tin pháp nhân doanh nghiệp lên trung tâm.</p>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; display: flex; justify-content: space-between; font-size: 9.5px; color: #94a3b8;">
      <div>Dự án: Hệ Sinh Thái Số CLB Doanh Nhân CEO 1983</div>
      <div>Quy chuẩn: Nhận diện thương hiệu chính thức • Bảo toàn đầy đủ tính năng</div>
      <div>Thời gian: 09/2026</div>
    </div>
  </div>

  <!-- ==================== TRANG 2: QUY CHUẨN THƯƠNG HIỆU & HỆ THỐNG TÍNH NĂNG ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill">QUY CHUẨN NHẬN DIỆN & HỆ THỐNG TÍNH NĂNG</span>
    </div>

    <h2 class="doc-title">Bản Sắc Thương Hiệu CEO 1983 & Hệ Thống Tính Năng Ứng Dụng</h2>
    <p class="doc-subtitle">Đồng bộ tuyệt đối giữa bộ nhận diện thương hiệu chính thức và trải nghiệm người dùng mobile.</p>

    <!-- 3 Core Colors -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:12px;">
      <div style="padding:10px;border-radius:10px;background:#f0f4fa;border-left:4px solid #003B95;">
        <div style="font-size:10px;font-weight:900;color:#003B95;">DEEP COBALT NAVY (#003B95 / #24338A)</div>
        <div style="font-size:8.5px;color:#475569;margin-top:3px;line-height:1.4;">
          Màu chữ CEO & nền thẻ chủ đạo: Đại diện cho trí tuệ, bản lĩnh lãnh đạo, sự đĩnh đạc và phát triển bền vững.
        </div>
      </div>
      <div style="padding:10px;border-radius:10px;background:#fff7ed;border-left:4px solid #ea580c;">
        <div style="font-size:10px;font-weight:900;color:#ea580c;">WARM AMBER / ORANGE (#EA580C / #F97316)</div>
        <div style="font-size:8.5px;color:#475569;margin-top:3px;line-height:1.4;">
          Màu số 1983 & viền VIP: Đại diện cho nhiệt huyết tiên phong, thịnh vượng và dòng chảy giao thương phồn vinh.
        </div>
      </div>
      <div style="padding:10px;border-radius:10px;background:#f0f9ff;border-left:4px solid #0284c7;">
        <div style="font-size:10px;font-weight:900;color:#0284c7;">DIGITAL SAPPHIRE GLASS</div>
        <div style="font-size:8.5px;color:#475569;margin-top:3px;line-height:1.4;">
          Dải màu chuyển đổi số: Biểu trưng cho sự đổi mới sáng tạo, năng lực công nghệ và tinh thần hội nhập.
        </div>
      </div>
    </div>

    <!-- Feature Table: Real Association App Feature Mapping -->
    <table class="compare-table">
      <thead>
        <tr>
          <th style="width:25%;">Hạng Mục Ứng Dụng</th>
          <th style="width:37%;">Tính Năng Thực Tế Của Hiệp Hội</th>
          <th style="width:38%;">Chuẩn Mực Thiết Kế CEO 1983 Mới</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Header & Nhận Diện</strong></td>
          <td>Logo CEO 1983 & Chuông thông báo (kèm số lượng tin tức chưa đọc).</td>
          <td>Logo chính thức sắc nét; Chuông thông báo dập nổi viền thương hiệu, badge số đếm rõ ràng.</td>
        </tr>
        <tr>
          <td><strong>2. Màn 1: Trang Chủ Hội Viên</strong></td>
          <td>Thẻ VIP thu gọn, Lưới 8 tính năng nhanh, Sự kiện nổi bật (16 SEP) & Ưu đãi.</td>
          <td>Typography to rõ ràng, icon vector sắc sảo, dải ảnh kiến trúc skyline, bảo toàn 100% tính năng.</td>
        </tr>
        <tr>
          <td><strong>3. Giao Thương B2B Thực Chiến</strong></td>
          <td>Khối Trao Cơ Hội (+2 Mới) & Khối Đăng Giới Thiệu Sản Phẩm (+11 Mới).</td>
          <td>Hai khối hành động then chốt kích thích kết nối kinh doanh, mở rộng đối tác và xúc tiến thương mại.</td>
        </tr>
        <tr>
          <td><strong>4. Màn 2: Gắn Kết (Tin Nhắn)</strong></td>
          <td>Hàng doanh nhân online, 4 bộ lọc tab, hội thoại Ban Thư Ký & Đối tác.</td>
          <td>Giao diện chat thời gian thực, ô tìm kiếm phẳng không viền, badge thông báo tin nhắn chưa đọc nổi bật.</td>
        </tr>
        <tr>
          <td><strong>5. Màn 3: Cá Nhân (Hồ Sơ)</strong></td>
          <td>Hồ sơ doanh nhân chuẩn Facebook: Ảnh bìa, avatar nổi viền VIP, bio, mạng lưới bạn bè.</td>
          <td>Tôn vinh tên tuổi và pháp nhân công ty; Hàng nút [Thêm vào tin], [Chỉnh sửa], mạng lưới 128 đối tác.</td>
        </tr>
        <tr>
          <td><strong>6. Menu Đáy (Bottom Bar)</strong></td>
          <td>5 Tab điều hướng cốt lõi: Trang chủ • Sự kiện • Thẻ 83 • Gắn kết • Cá nhân.</td>
          <td>Nút Thẻ 83 trung tâm dập nổi ấn tượng, tab Gắn kết chuyên biệt phục vụ trao đổi kết nối tức thì.</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Đề Xuất Chuẩn Hóa Giao Diện</div>
      <div>Trang 2 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 3: PHƯƠNG ÁN 1 • MÀN 1 (HOME) ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#fffbeb;color:#b45309;border-color:#fde68a;">PHƯƠNG ÁN 1 (KHUYÊN DÙNG)</span>
    </div>

    <h2 class="doc-title">Phương Án 1: Classic Navy & Gold • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Bảo toàn 100% đầy đủ các tính năng hiện có của app, nâng tầm thẩm mỹ sang trọng theo chuẩn thương hiệu.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa1')}

      <div class="spec-sidebar">
        <div class="spec-box">
          <h4>1. Header Nhận Diện CEO 1983</h4>
          <p>Logo thương hiệu đặt trang trọng ở góc trái, đối xứng với chuông thông báo có badge số lượng tin tức mới chưa đọc.</p>
        </div>
        <div class="spec-box">
          <h4>2. Thẻ Hội Viên VIP Bề Thế</h4>
          <p>Dải ảnh bìa skyline thành phố hiện đại; Avatar lớn viền vàng VIP; Họ tên Đỗ Thị Mai đi kèm tích xanh xác thực, tên doanh nghiệp và mã hội viên M1983-012 kèm nút sao chép nhanh.</p>
        </div>
        <div class="spec-box">
          <h4>3. Lưới 8 Tính Năng Nhanh Tinh Gọn</h4>
          <p>Đồng bộ 2 tone màu nhận diện Navy (#003B95) và Cam (#EA580C). Font chữ to rõ ràng, tích hợp đầy đủ các badge thông báo nổi bật (Mới, 3, 5, 1).</p>
        </div>
        <div class="spec-box">
          <h4>4. Khối Sự Kiện & Ưu Đãi Đối Tác</h4>
          <p>Sự kiện tâm điểm có ngày 16 SEP rõ nét. Khối ưu đãi hội viên bố trí hộp quà và nút bấm Navy sắc sảo.</p>
        </div>
        <div class="spec-box">
          <h4>5. Cặp Khối Giao Thương B2B Thực Chiến</h4>
          <p>Khối Trao Cơ Hội (+2 Mới) và Đăng Giới Thiệu Sản Phẩm (+11 Mới) được giữ nguyên vẹn vị trí, tối ưu nút bấm cho giao dịch kết nối.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 1: Classic Navy & Gold</div>
      <div>Trang 3 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 4: PHƯƠNG ÁN 1 • MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#fffbeb;color:#b45309;border-color:#fde68a;">PHƯƠNG ÁN 1: GẮN KẾT & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 1: Kênh Gắn Kết Hội Viên & Hồ Sơ Doanh Nhân</h2>
    <p class="doc-subtitle">Kết nối trao đổi thời gian thực, danh bạ đối tác online và hồ sơ năng lực doanh nhân chuẩn mực.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag">MÀN 2: GẮN KẾT (TIN NHẮN & HỘI THOẠI)</div>
        ${renderMessagesScreen('pa1')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag">MÀN 3: CÁ NHÂN (HỒ SƠ DOANH NHÂN B2B)</div>
        ${renderProfileScreen('pa1')}
      </div>
    </div>

    <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:8.5px;color:#475569;">
      <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
        <strong style="color:#0f172a;">Đặc Điểm Màn Gắn Kết (Màn 2):</strong> Giao diện chat thời gian thực, hàng avatar đối tác online (Messenger style), phân loại 4 tab tiện lợi, kênh Ban Thư Ký ghim nổi bật kèm badge tin chưa đọc.
      </div>
      <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
        <strong style="color:#0f172a;">Đặc Điểm Màn Cá Nhân (Màn 3):</strong> Bố cục phong cách Facebook Profile sang trọng, ảnh bìa toàn cảnh, avatar dập nổi viền vàng VIP, thông tin pháp nhân đầy đủ và mạng lưới 128 đối tác liên kết.
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 1: Classic Navy & Gold</div>
      <div>Trang 4 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 5: PHƯƠNG ÁN 2 • MÀN 1 (HOME) ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#f0f9ff;color:#0284c7;border-color:#bae6fd;">PHƯƠNG ÁN 2: DIGITAL SAPPHIRE</span>
    </div>

    <h2 class="doc-title">Phương Án 2: Digital Sapphire Tech • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Phong cách chuyển đổi số hiện đại, ứng dụng đồ họa tinh thể 3D đa diện và biểu tượng đa sắc.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa2')}

      <div class="spec-sidebar">
        <div class="spec-box">
          <h4>1. Đồ Họa Tinh Thể Số 3D Sapphire</h4>
          <p>Nền thẻ hội viên kết hợp khối tinh thể số 3D đa chiều, tạo chiều sâu công nghệ và sự đột phá mới lạ.</p>
        </div>
        <div class="spec-box">
          <h4>2. Avatar Viền Xanh Cyan Phát Sáng</h4>
          <p>Khung avatar được bao quanh bởi dải sáng Neon Cyan (#38BDF8), thể hiện hình tượng các nhà lãnh đạo tiên phong công nghệ số.</p>
        </div>
        <div class="spec-box">
          <h4>3. Lưới Icon Đa Sắc Sinh Động (VisionOS Style)</h4>
          <p>Mỗi nhóm tính năng được gán một tone màu pastel riêng (Xanh ngọc, Tím, Cam, Hồng) giúp nhận diện cực nhanh trên màn hình cảm ứng.</p>
        </div>
        <div class="spec-box">
          <h4>4. Nút Hành Động Màu Cyber Blue</h4>
          <p>Các nút "Xem ưu đãi ngay", "Đăng ký" và "Đăng ngay" sử dụng sắc xanh Cyber Blue (#0284C7) trẻ trung, hiện đại.</p>
        </div>
        <div class="spec-box">
          <h4>5. Đầy Đủ Khối Giao Thương Hiệp Hội</h4>
          <p>Giữ nguyên 100% công năng của khối Trao Cơ Hội và Đăng Giới Thiệu Sản Phẩm với giao diện được làm mới sắc nét.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 2: Digital Sapphire Tech</div>
      <div>Trang 5 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 6: PHƯƠNG ÁN 2 • MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#f0f9ff;color:#0284c7;border-color:#bae6fd;">PHƯƠNG ÁN 2: GẮN KẾT & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 2: Gắn Kết Sapphire & Hồ Sơ Doanh Nhân Kỹ Thuật Số</h2>
    <p class="doc-subtitle">Giao diện tương tác số sinh động, ánh sáng viền Neon Cyan và trải nghiệm kết nối doanh nhân bứt phá.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#0284c7;">MÀN 2: GẮN KẾT (TIN NHẮN & HỘI THOẠI)</div>
        ${renderMessagesScreen('pa2')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#0284c7;">MÀN 3: CÁ NHÂN (HỒ SƠ DOANH NHÂN B2B)</div>
        ${renderProfileScreen('pa2')}
      </div>
    </div>

    <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:8.5px;color:#475569;">
      <div style="padding:6px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
        <strong style="color:#0284c7;">Đặc Điểm Màn Gắn Kết Sapphire:</strong> Dải màu Sapphire Blue công nghệ, avatar viền sáng Cyan rực rỡ, bộ lọc tab trẻ trung, thao tác tìm kiếm và gửi tin nhắn đối tác tức thời.
      </div>
      <div style="padding:6px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
        <strong style="color:#0284c7;">Đặc Điểm Màn Cá Nhân Kỹ Thuật Số:</strong> Ảnh bìa hiệu ứng kính chuyển đổi số, avatar phát sáng hiện đại, mạng lưới liên kết số đa chiều kích thích kết nối công nghệ.
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 2: Digital Sapphire Tech</div>
      <div>Trang 6 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 7: PHƯƠNG ÁN 3 • MÀN 1 (HOME) ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#ffedd5;color:#c2410c;border-color:#fdba74;">PHƯƠNG ÁN 3: B2B COMMERCE</span>
    </div>

    <h2 class="doc-title">Phương Án 3: B2B Commerce Focus • Màn 1: Trang Chủ Hội Viên</h2>
    <p class="doc-subtitle">Phong cách tối giản phẳng (Flat Minimalist), tập trung cao độ vào tính pháp nhân doanh nghiệp và hiệu quả giao dịch.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa3')}

      <div class="spec-sidebar">
        <div class="spec-box">
          <h4>1. Tôn Vinh Tên Doanh Nghiệp</h4>
          <p>Thẻ hội viên đẩy tên công ty và ngành nghề lên vị trí nổi bật nhất, biến thẻ thành hồ sơ năng lực thu nhỏ của doanh nghiệp.</p>
        </div>
        <div class="spec-box">
          <h4>2. Biểu Tượng Phẳng Tối Giản (Flat Minimalist)</h4>
          <p>Lưới 8 tính năng sử dụng gam màu Slate (#334155) trung tính, tinh giản mọi hiệu ứng rườm rà, tập trung vào công năng sử dụng.</p>
        </div>
        <div class="spec-box">
          <h4>3. Nút Giao Thương Cam Nhiệt Huyết</h4>
          <p>Các nút "Đăng ngay", "Khám phá ngay" và "Xem ưu đãi ngay" sử dụng sắc cam (#EA580C) mạnh mẽ, mang tinh thần xúc tiến thương mại B2B.</p>
        </div>
        <div class="spec-box">
          <h4>4. Tối Ưu Hóa Giao Thương Thực Chiến</h4>
          <p>Khối Trao Cơ Hội và Đăng Giới Thiệu Sản Phẩm được làm nổi bật với thông số rõ ràng, phục vụ đắc lực cho hội viên xúc tiến thương mại.</p>
        </div>
        <div class="spec-box">
          <h4>5. Dễ Dàng Thao Tác</h4>
          <p>Giao diện thoáng đãng, các vùng bấm lớn, mang lại trải nghiệm nhanh gọn cho các doanh nhân bận rộn.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 3: B2B Commerce Focus</div>
      <div>Trang 7 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 8: PHƯƠNG ÁN 3 • MÀN 2 & MÀN 3 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#ffedd5;color:#c2410c;border-color:#fdba74;">PHƯƠNG ÁN 3: GẮN KẾT & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 3: Gắn Kết B2B & Hồ Sơ Pháp Nhân Thực Chiến</h2>
    <p class="doc-subtitle">Định hướng thực dụng tối đa, cung cấp đầy đủ thông tin pháp nhân và giao dịch kết nối kinh doanh.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#ea580c;">MÀN 2: GẮN KẾT (TIN NHẮN & HỘI THOẠI)</div>
        ${renderMessagesScreen('pa3')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#ea580c;">MÀN 3: CÁ NHÂN (HỒ SƠ DOANH NHÂN B2B)</div>
        ${renderProfileScreen('pa3')}
      </div>
    </div>

    <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:8.5px;color:#475569;">
      <div style="padding:6px 10px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;">
        <strong style="color:#c2410c;">Đặc Điểm Màn Gắn Kết B2B:</strong> Bố cục tối giản gam màu than chì Slate viền cam B2B nhiệt huyết, nút gửi tin cam nổi bật, tối đa hóa tốc độ trao đổi kinh doanh.
      </div>
      <div style="padding:6px 10px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;">
        <strong style="color:#c2410c;">Đặc Điểm Màn Cá Nhân Thực Dụng:</strong> Tôn vinh tên pháp nhân công ty và ngành nghề cốt lõi, nút hành động cam sắc nét, tối ưu cho giao lưu thương mại.
      </div>
    </div>

    <!-- Khối Phê Duyệt Tinh Gọn Kết Thúc Tài Liệu -->
    <div style="margin-top:auto;padding:7px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;">
      <div>
        <span style="font-weight:900;color:#0f172a;">ĐẠI DIỆN ĐỘI NGŨ THIẾT KẾ:</span>
        <span style="color:#64748b;margin-left:4px;">Phòng Thiết Kế UI/UX • VIONE Studio</span>
      </div>
      <div style="text-align:right;">
        <span style="font-weight:900;color:#003B95;">PHÊ DUYỆT CỦA BAN LÃNH ĐẠO:</span>
        <span style="color:#64748b;margin-left:4px;">CLB Doanh Nhân CEO 1983</span>
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 3: B2B Commerce Focus</div>
      <div>Trang 8 / 8</div>
    </div>
  </div>

</body>
</html>
`;

// Write HTML
const htmlPath = path.resolve('scratch/de_xuat_giao_dien_ultimate.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// Generate PDF with Edge Headless
const pdfPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Rendering 8-Page Ultimate Sharp Brand PDF...');
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfPath);
  console.log('SUCCESS! PDF generated at:', pdfPath, 'Size:', stats.size, 'bytes');

  // Copy to Artifact Directory
  const artifactPdf = 'C:\\Users\\vumik\\.gemini\\antigravity-ide\\brain\\74644533-8bb8-4b29-a589-3d8714601888\\DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf';
  fs.copyFileSync(pdfPath, artifactPdf);
  console.log('Synchronized to artifacts:', artifactPdf);
} catch (err) {
  console.error('Error generating PDF:', err);
}
