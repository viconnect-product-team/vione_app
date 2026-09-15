const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Read authentic local assets as Base64 for offline & crystal sharp rendering
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

// Helper: Configure Palette for Options
function getPalette(option) {
  if (option === 'pa1') {
    return {
      name: 'Phương Án 1: Classic Navy & Gold',
      primary: '#003B95',
      primaryHover: '#002B70',
      accent: '#f59e0b',
      accentAlt: '#ea580c',
      cardBg: 'linear-gradient(135deg, #001f47 0%, #003B95 60%, #0a4fa3 100%)',
      cardBorder: '1.5px solid #f59e0b',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.32;`,
      avatarBorder: '#f59e0b',
      badgeClass: 'background:#fef3c7; color:#b45309; border: 1px solid #fde68a;',
      btnPrimary: '#003B95',
      btnText: '#ffffff',
      btnSecondary: '#f0f4fa',
      btnSecText: '#003B95',
      borderSoft: '#e2e8f0',
      tagColor: '#003B95',
      iconBoxBg: '#f0f4fa',
      iconColor: '#003B95',
      pillBg: '#f0f4fa',
      pillText: '#003B95',
      tabActive: '#003B95',
      navCenterBg: '#003B95',
      navCenterBorder: '#ffffff',
      navCenterIconColor: '#ffffff'
    };
  } else if (option === 'pa2') {
    return {
      name: 'Phương Án 2: Digital Sapphire Tech',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      accent: '#38bdf8',
      accentAlt: '#0ea5e9',
      cardBg: 'linear-gradient(135deg, #021a30 0%, #0284c7 65%, #38bdf8 100%)',
      cardBorder: '1.5px solid #38bdf8; box-shadow: 0 0 12px rgba(56,189,248,0.3);',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${heroBase64}'); background-size: cover; background-position: center; opacity: 0.40;`,
      avatarBorder: '#38bdf8',
      badgeClass: 'background:#e0f2fe; color:#0369a1; border: 1px solid #7dd3fc;',
      btnPrimary: '#0284c7',
      btnText: '#ffffff',
      btnSecondary: '#e0f2fe',
      btnSecText: '#0284c7',
      borderSoft: '#bae6fd',
      tagColor: '#0284c7',
      iconBoxBg: '#e0f2fe',
      iconColor: '#0284c7',
      pillBg: '#e0f2fe',
      pillText: '#0284c7',
      tabActive: '#0284c7',
      navCenterBg: '#0284c7',
      navCenterBorder: '#38bdf8',
      navCenterIconColor: '#ffffff'
    };
  } else {
    return {
      name: 'Phương Án 3: B2B Commerce Focus',
      primary: '#ea580c',
      primaryHover: '#c2410c',
      accent: '#ea580c',
      accentAlt: '#f97316',
      cardBg: 'linear-gradient(135deg, #080c14 0%, #0f172a 65%, #1e293b 100%)',
      cardBorder: '1.5px solid #ea580c',
      cardOverlay: `background-image: url('data:image/jpeg;base64,${skylineBase64}'); background-size: cover; background-position: center; opacity: 0.22;`,
      avatarBorder: '#ea580c',
      badgeClass: 'background:#ffedd5; color:#c2410c; border: 1px solid #fdba74;',
      btnPrimary: '#ea580c',
      btnText: '#ffffff',
      btnSecondary: '#0f172a',
      btnSecText: '#ffffff',
      borderSoft: '#cbd5e1',
      tagColor: '#0f172a',
      iconBoxBg: '#ffedd5',
      iconColor: '#ea580c',
      pillBg: '#ffedd5',
      pillText: '#ea580c',
      tabActive: '#0f172a',
      navCenterBg: '#ea580c',
      navCenterBorder: '#fdba74',
      navCenterIconColor: '#ffffff'
    };
  }
}

// =========================================================================
// SCREEN 1: TRANG CHỦ (HOME SCREEN) - Full Flow Touching Footer Seamlessly
// =========================================================================
function renderHomeScreen(option) {
  const p = getPalette(option);

  const icons = [
    { label: 'Thẻ hội viên', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>', bg: p.iconBoxBg, color: p.iconColor },
    { label: 'Danh thiếp số', iconSvg: '<path d="M16 2v4"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="11" r="3"/>', bg: '#ffedd5', color: '#ea580c', badge: 'Mới' },
    { label: 'Hội viên', iconSvg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', bg: p.iconBoxBg, color: p.iconColor },
    { label: 'Sự kiện', iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>', bg: p.iconBoxBg, color: p.iconColor, badge: '3' },
    { label: 'Tin tức', iconSvg: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/>', bg: p.iconBoxBg, color: p.iconColor, badge: '5' },
    { label: 'Tài liệu', iconSvg: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13Z"/>', bg: p.iconBoxBg, color: p.iconColor },
    { label: 'Liên hệ nhanh', iconSvg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', bg: '#ffedd5', color: '#ea580c', badge: '1' },
    { label: 'Ưu đãi hội viên', iconSvg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', bg: p.iconBoxBg, color: p.iconColor },
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

      <!-- App Header -->
      <div class="m-header">
        <img class="m-logo" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
        <div class="m-header-right">
          <div class="m-bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="2.3"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="m-bell-badge">3</span>
          </div>
        </div>
      </div>

      <!-- Scrollable Flow Container that touches footer seamlessly without gap -->
      <div class="m-screen-flow" style="padding-bottom:2px;">
        <!-- Hero Glow Stripe -->
        <div class="m-hero-glow"></div>

        <!-- 1. VIP Member Executive Card with Cover Photo (Ảnh Bìa) & Avatar (Ảnh Đại Diện) To Rộng Chuẩn Sếp Yêu Cầu -->
        <div style="background:#ffffff; border:1px solid ${p.borderSoft}; border-radius:12px; overflow:hidden; box-shadow:0 3px 10px rgba(0,0,0,0.06); margin:0 7px; flex-shrink:0;">
          <!-- Ảnh Bìa To Rộng (Cover Banner) -->
          <div style="position:relative; height:54px; background:${p.cardBg}; overflow:hidden;">
            <img src="data:image/jpeg;base64,${skylineBase64}" style="width:100%; height:100%; object-fit:cover; opacity:0.88;" alt="Cover Skyline">
            <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%);"></div>
            <!-- VIP Badge on cover top right -->
            <div style="position:absolute; top:4px; right:6px; display:flex; align-items:center; gap:3px;">
              <span style="${p.badgeClass} font-size:6.5px; font-weight:900; padding:1.5px 5.5px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">VIP GOLD</span>
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
              <div style="display:flex; align-items:center; gap:2px; font-size:6.5px; color:${p.primary}; font-weight:800; padding:2px 6px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:4px;">
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

        <!-- 2. Lưới 8 Tính Năng Nhanh -->
        <div class="m-box" style="margin-top:5px;">
          <div class="m-box-title" style="color:${p.tagColor};">
            <span class="m-dot" style="background:${p.primary};"></span>
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

        <!-- 3. Khối Sự Kiện Nổi Bật -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:${p.tagColor};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="2.4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              SỰ KIỆN NỔI BẬT
            </div>
            <span style="font-size:8px;font-weight:800;color:${p.primary};">Xem tất cả +5 ›</span>
          </div>
          <div class="m-event-item">
            <div class="m-event-calendar" style="background:${p.primary};">
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

        <!-- 4. Khối Ưu Đãi Hội Viên & Đối Tác -->
        <div class="m-perks-item" style="border-color:${p.borderSoft};margin-top:5px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:900;color:${p.primary};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Ưu đãi Hội viên & Đối tác
              <span class="m-hot-pill">+Hot</span>
            </div>
            <div style="font-size:7px;color:#64748b;line-height:1.3;margin:2px 0 4px 0;">
              Chính sách trợ giá, quà tặng liên kết & quyền lợi giao thương.
            </div>
            <button style="background:${p.primary};color:${p.btnText};" class="m-action-pill">
              Xem ưu đãi ngay →
            </button>
          </div>
          <div style="width:38px;height:38px;flex-shrink:0;">
            <img src="data:image/png;base64,${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
          </div>
        </div>

        <!-- 5. Cặp Khối Giao Thương B2B Thực Chiến -->
        <div class="m-b2b-grid" style="margin-top:5px;">
          <div class="m-b2b-box" style="border-color:${p.borderSoft};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
              <span style="font-size:15px;">🤝</span>
              <span class="m-hot-pill">+2 Mới</span>
            </div>
            <div class="m-b2b-title">TRAO CƠ HỘI</div>
            <div class="m-b2b-desc">Chia sẻ cơ hội Kết nối thành công</div>
            <button class="m-b2b-btn" style="background:${p.btnSecondary};color:${p.btnSecText};">Khám phá ngay</button>
          </div>

          <div class="m-b2b-box" style="border-color:${p.borderSoft};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
              <span style="font-size:15px;">📦</span>
              <span class="m-hot-pill">+11 Mới</span>
            </div>
            <div class="m-b2b-title">ĐĂNG SẢN PHẨM</div>
            <div class="m-b2b-desc">Quảng bá sản phẩm Kết nối khách hàng</div>
            <button class="m-b2b-btn" style="background:${p.btnPrimary};color:${p.btnText};">Đăng ngay</button>
          </div>
        </div>

        <!-- 6. Khối Doanh Nghiệp Mới Gia Nhập -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:${p.tagColor};">
              <span class="m-dot" style="background:${p.primary};"></span>
              DOANH NGHIỆP MỚI GIA NHẬP
            </div>
            <span style="font-size:7.5px;font-weight:700;color:${p.primary};">Xem danh bạ ›</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:4px 6px;display:flex;align-items:center;gap:5px;">
              <div style="width:22px;height:22px;border-radius:6px;background:${p.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">KT</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.5px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">BĐS Á Châu</div>
                <div style="font-size:6.5px;color:#64748b;">Trần Thị Thoa</div>
              </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:4px 6px;display:flex;align-items:center;gap:5px;">
              <div style="width:22px;height:22px;border-radius:6px;background:#ea580c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">CK</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.5px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Cơ Khí Toàn Cầu</div>
                <div style="font-size:6.5px;color:#64748b;">Nguyễn Văn An</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Khối Tiện Ích Thẻ Thông Minh -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:${p.tagColor};">
              <span class="m-dot" style="background:${p.primary};"></span>
              TIỆN ÍCH THẺ THÔNG MINH
            </div>
            <span style="font-size:7.5px;font-weight:700;color:${p.primary};">Xem thẻ số ›</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;text-align:center;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:7px;padding:4px 2px;">
              <span style="font-size:11px;">💳</span>
              <div style="font-size:6.5px;font-weight:800;color:#0369a1;margin-top:1px;">Chạm NFC</div>
            </div>
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:7px;padding:4px 2px;">
              <span style="font-size:11px;">📱</span>
              <div style="font-size:6.5px;font-weight:800;color:#b45309;margin-top:1px;">Apple Wallet</div>
            </div>
            <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:7px;padding:4px 2px;">
              <span style="font-size:11px;">🔗</span>
              <div style="font-size:6.5px;font-weight:800;color:#334155;margin-top:1px;">QR Check-in</div>
            </div>
          </div>
        </div>

        <!-- 8. Khối Tin Hoạt Động & Bản Tin CLB CEO 1983 (Zero Gap Filler) -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:${p.tagColor};">
              <span class="m-dot" style="background:${p.primary};"></span>
              TIN HOẠT ĐỘNG CLB
            </div>
            <span style="font-size:7.5px;font-weight:700;color:${p.primary};">Xem tất cả ›</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:3.5px;">
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:7px;padding:3.5px 5px;display:flex;gap:5px;align-items:center;">
              <div style="width:26px;height:24px;border-radius:4px;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
                <img src="data:image/jpeg;base64,${heroBase64}" style="width:100%;height:100%;object-fit:cover;" alt="News 1">
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Xúc tiến thương mại liên minh Doanh nhân 1983</div>
                <div style="font-size:6px;color:#94a3b8;margin-top:1px;">Hôm nay • Ban Truyền Thông</div>
              </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:7px;padding:3.5px 5px;display:flex;gap:5px;align-items:center;">
              <div style="width:26px;height:24px;border-radius:4px;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
                <img src="data:image/jpeg;base64,${skylineBase64}" style="width:100%;height:100%;object-fit:cover;" alt="News 2">
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Ký kết hợp tác chiến lược mạng lưới cung ứng toàn quốc</div>
                <div style="font-size:6px;color:#94a3b8;margin-top:1px;">Hôm qua • Ban Xúc Tiến Đầu Tư</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 9. Install Hint Touch Down -->
        <div class="m-install-hint" style="border-color:${p.primary}; color:${p.primary};margin-top:5px;margin-bottom:2px;">
          📲 Cài đặt ứng dụng lên màn hình chính điện thoại
        </div>
      </div>

      <!-- 10. Bottom Navigation Bar (Tab Trang chủ active, sits flush at bottom) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab active" style="color:${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="background:${p.navCenterBg}; border-color:${p.navCenterBorder}; box-shadow: 0 2px 7px rgba(0,0,0,0.25);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${p.navCenterIconColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5"/>
            <path d="M14 20h3a1 1 0 0 0 1-1v-2"/>
            <path d="M20 20v.01"/>
          </svg>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Gắn kết</span>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

function renderEventsScreen(option) {
  const p = getPalette(option);

  // 12 Dense Real Events of CEO 1983 flowing seamlessly down to footer
  const eventsList = [
    { day: '28', month: 'TH9', bg: '#0f172a', title: 'Gala Dinner Kết Nối Giao Thương & Xúc Tiến Đầu Tư 2026', meta: '⏰ 18:00 - 21:30 • 📍 Khách sạn JW Marriott, Hà Nội', tag: 'Vé tham dự: 500.000đ', tagColor: '#ea580c', btn: 'Đăng ký vé →' },
    { day: '05', month: 'TH10', bg: p.primary, title: 'Diễn Đàn Kinh Tế & Ứng Dụng AI Cho Doanh Nghiệp SME', meta: '⏰ 14:00 - 17:00 • 📍 Lotte Hotel Hà Nội', tag: 'Miễn phí Hội viên', tagColor: '#059669', btn: 'Đăng ký ngay →' },
    { day: '15', month: 'TH10', bg: '#059669', title: 'Giải Golf Doanh Nhân CEO 1983 Mở Rộng Lần Thứ IV', meta: '⏰ 06:00 - 16:00 • 📍 Sân Golf Long Biên, Hà Nội', tag: 'Hạn mức: 72 Golfer', tagColor: '#64748b', btn: 'Chi tiết →' },
    { day: '22', month: 'TH10', bg: '#7c3aed', title: 'Bàn Tròn Giao Thương B2B Doanh Nghiệp Quốc Tế', meta: '⏰ 09:00 - 12:00 • 📍 Trụ sở CLB CEO 1983', tag: '30 Doanh nghiệp', tagColor: p.primary, btn: 'Đăng ký tham gia →' },
    { day: '02', month: 'TH11', bg: '#d97706', title: 'Tọa Đàm Quản Trị Dòng Tiền & Tái Cấu Trúc Doanh Nghiệp', meta: '⏰ 14:00 - 17:30 • 📍 Pullman Hotel, Hà Nội', tag: 'Miễn phí Hội viên', tagColor: '#059669', btn: 'Đăng ký vé →' },
    { day: '10', month: 'TH11', bg: '#0284c7', title: 'Workshop Chiến Lược Xây Dựng Thương Hiệu Lãnh Đạo', meta: '⏰ 08:30 - 11:30 • 📍 Grand Plaza Hà Nội', tag: '50 CEO VIP', tagColor: '#0284c7', btn: 'Đăng ký ngay →' },
    { day: '18', month: 'TH11', bg: '#be185d', title: 'Đêm Nhạc Kết Nối Tình Thân Đồng Niên CEO 1983', meta: '⏰ 19:30 - 22:00 • 📍 Nhà Hát Lớn Hà Nội', tag: 'VIP Lounge', tagColor: '#be185d', btn: 'Xem chi tiết →' },
    { day: '26', month: 'TH11', bg: '#2563eb', title: 'Diễn Đàn Gọi Vốn Đầu Tư & Khởi Nghiệp Đổi Mới', meta: '⏰ 13:30 - 17:30 • 📍 Landmark72 Hà Nội', tag: '10 Quỹ đầu tư', tagColor: '#2563eb', btn: 'Đăng ký pitching →' },
    { day: '08', month: 'TH12', bg: '#ea580c', title: 'Business Matching: Chuỗi Cung Ứng & Phân Phối B2B', meta: '⏰ 09:00 - 16:30 • 📍 Triển Lãm I.C.E Hà Nội', tag: '100 Gian hàng', tagColor: '#ea580c', btn: 'Đặt gian hàng →' },
    { day: '16', month: 'TH12', bg: '#0d9488', title: 'Caravan Kết Nối Doanh Nhân Xuyên Việt 2026', meta: '⏰ 3 Ngày 2 Đêm • 📍 Hà Nội - Hạ Long - Móng Cái', tag: '45 Xe Caravan', tagColor: '#0d9488', btn: 'Đăng ký đoàn →' },
    { day: '22', month: 'TH12', bg: '#b45309', title: 'Lễ Vinh Danh Doanh Nhân Xuất Sắc & Year End Party', meta: '⏰ 18:00 - 22:00 • 📍 TT Hội Nghị Quốc Gia', tag: 'Black Tie Gala', tagColor: '#b45309', btn: 'Nhận vé mời →' },
  ];

  return `
    <div class="phone-mockup-medium">
      <!-- Status bar -->
      <div class="m-status-bar">
        <span>09:41</span>
        <div class="m-status-icons"><span>5G</span><span style="font-weight:900;">100%</span></div>
      </div>

      <!-- Header Sự Kiện -->
      <div class="m-inner-header">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.6"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:11px;font-weight:900;color:#0f172a;">Sự Kiện & Lễ Hội CLB CEO 1983</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>

      <!-- Filter Tabs -->
      <div style="padding:3.5px 7px;display:flex;gap:3.5px;background:#ffffff;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
        <span style="background:${p.tabActive};color:#fff;font-size:6.5px;font-weight:800;padding:2.5px 6px;border-radius:999px;">Tất cả (12)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Sắp diễn ra (5)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Đã đăng ký (2)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Của tôi</span>
      </div>

      <!-- Scrollable Flow: 12 Dense Events Stacked Continuously Touching Footer Without Gap -->
      <div class="m-screen-flow" style="padding:4px 6px;gap:3.5px;">
        <!-- Event 1: Hero Featured Banner Event -->
        <div style="background:#ffffff;border:1px solid ${p.borderSoft};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);flex-shrink:0;">
          <div style="position:relative;height:44px;background:#0f172a;">
            <img src="data:image/jpeg;base64,${eventBase64}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" alt="Event 1">
            <div style="position:absolute;top:3px;left:5px;display:flex;gap:3px;">
              <span style="background:#ef4444;color:#fff;font-size:6px;font-weight:900;padding:1px 4.5px;border-radius:999px;">🔥 Sắp diễn ra</span>
              <span style="background:rgba(0,0,0,0.6);color:#fff;font-size:6px;font-weight:700;padding:1px 4.5px;border-radius:999px;backdrop-filter:blur(2px);">Check-in QR</span>
            </div>
          </div>
          <div style="padding:4px 6px;">
            <div style="display:flex;gap:5px;align-items:flex-start;">
              <div class="m-event-calendar" style="background:${p.primary};width:26px;height:27px;flex-shrink:0;">
                <span class="m-cal-day" style="font-size:11px;">16</span>
                <span class="m-cal-month" style="font-size:5.5px;">TH9</span>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.5px;font-weight:900;color:#0f172a;line-height:1.2;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
                <div style="font-size:6px;color:#64748b;margin-top:1px;">⏰ 07:30 - 13:00 • 📍 TT Hội Nghị Quốc Gia</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;padding-top:3px;border-top:1px dashed #e2e8f0;">
              <div style="font-size:6px;color:${p.primary};font-weight:800;">👥 250+ CEO Đã đăng ký</div>
              <span style="background:#dcfce7;color:#15803d;font-size:6px;font-weight:800;padding:1.5px 5px;border-radius:3px;border:1px solid #bbf7d0;">Đã có vé VIP ✓</span>
            </div>
          </div>
        </div>

        <!-- Events 2 to 12: Continuous Stream filling all way down to footer -->
        ${eventsList.map(ev => `
          <div style="background:#ffffff;border:1px solid ${p.borderSoft};border-radius:7px;padding:3.5px 5px;box-shadow:0 1px 3px rgba(0,0,0,0.02);flex-shrink:0;">
            <div style="display:flex;gap:5px;align-items:flex-start;">
              <div class="m-event-calendar" style="background:${ev.bg};width:25px;height:26px;flex-shrink:0;">
                <span class="m-cal-day" style="font-size:10.5px;">${ev.day}</span>
                <span class="m-cal-month" style="font-size:5.5px;">${ev.month}</span>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.2px;font-weight:900;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ev.title}</div>
                <div style="font-size:5.8px;color:#64748b;margin-top:1px;">${ev.meta}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2.5px;padding-top:2.5px;border-top:1px dashed #f1f5f9;">
              <span style="font-size:6.2px;font-weight:800;color:${ev.tagColor};">${ev.tag}</span>
              <button style="background:${p.primary};color:#fff;border:none;border-radius:3.5px;padding:1.5px 5.5px;font-size:6px;font-weight:800;cursor:pointer;">${ev.btn}</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Nav Bar (Tab Sự kiện Active, sits flush at bottom) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab active" style="color:${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="background:${p.navCenterBg}; border-color:${p.navCenterBorder}; box-shadow: 0 2px 7px rgba(0,0,0,0.25);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${p.navCenterIconColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5"/>
            <path d="M14 20h3a1 1 0 0 0 1-1v-2"/>
            <path d="M20 20v.01"/>
          </svg>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Gắn kết</span>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}

function renderProfileScreen(option) {
  const p = getPalette(option);

  // 10 Functional modules identical to user's photo
  const functionalItems = [
    { label: 'Cập nhật hồ sơ & Quyền riêng tư', desc: 'Chỉnh sửa tên, chức danh, liên hệ & quyền riêng tư', iconSvg: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { label: 'Thẻ Hội Viên Thông Minh', desc: 'Xem và đổi giao diện Thẻ số VIP', iconSvg: '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/>' },
    { label: 'Quản lý Danh thiếp số', desc: 'Thiết kế & chia sẻ danh thiếp số cá nhân', iconSvg: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M7 16h10"/>' },
    { label: 'Danh bạ hội viên CLB', desc: 'Tìm kiếm & kết nối hội viên CEO 1983', iconSvg: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { label: 'Cơ hội giao thương B2B', desc: 'Nhu cầu mua, bán & hợp tác đầu tư', iconSvg: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>' },
    { label: 'Gian hàng sản phẩm', desc: 'Showcase sản phẩm & dịch vụ doanh nghiệp', iconSvg: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' },
    { label: 'Tin tức & Sự kiện CLB', desc: 'Hoạt động giao thương & sự kiện kết nối', iconSvg: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
    { label: 'Lịch sử kết nối & Check-in', desc: 'Nhật ký giao thương & tham gia sự kiện', iconSvg: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>' },
    { label: 'Thông báo & Lời mời', desc: 'Cập nhật tin nhắn & phê duyệt kết nối', iconSvg: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' },
    { label: 'Bảo mật & Cài đặt tài khoản', desc: 'Đổi mật khẩu, phiên đăng nhập & bảo mật', iconSvg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  ];

  return `
    <div class="phone-mockup-medium" style="position:relative;">
      <!-- Native Mobile Scrollbar Thumb as shown in photo -->
      <div style="position:absolute;right:2px;top:40px;width:3px;height:75px;border-radius:999px;background:rgba(100,116,139,0.5);z-index:20;"></div>

      <!-- Status bar -->
      <div class="m-status-bar">
        <span>09:41</span>
        <div class="m-status-icons"><span>5G</span><span style="font-weight:900;">100%</span></div>
      </div>

      <!-- Header exact as user photo -->
      <div class="m-inner-header" style="border-bottom:1px solid #f1f5f9;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="2.6"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:11px;font-weight:900;color:#0f172a;">Trang Cá Nhân & Quản Trị</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>

      <!-- Scrollable Flow: Exact Photo Structure, Sized Proportionately to Touch Footer Seamlessly -->
      <div class="m-screen-flow" style="background:#f8fafc;padding:5px 6.5px;gap:5px;">
        <!-- Member Summary Card as shown in photo -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:6px 8px;display:flex;align-items:center;gap:7px;box-shadow:0 1px 3px rgba(0,0,0,0.02);flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#003B95;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;border:1.5px solid ${p.primary};">
              HL
            </div>
            <span style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#10b981;border:1.5px solid #fff;"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:3px;">
              <span style="font-size:9.5px;font-weight:900;color:#0f172a;">Lê Hoàng Long</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#0284c7"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
            </div>
            <div style="font-size:6.5px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Chủ tịch HĐQT & Tổng Giá...</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
            <span style="background:#e0f2fe;color:#0369a1;font-size:6.2px;font-weight:800;padding:1px 5px;border-radius:4px;border:1px solid #bae6fd;">M1983-002</span>
            <div style="display:flex;align-items:center;gap:1.5px;font-size:6.2px;color:#0284c7;font-weight:700;">
              <span>Xem profile</span>
              <span>⌵</span>
            </div>
          </div>
        </div>

        <!-- Section 1: PHÂN HỆ CHỨC NĂNG (10 Items as in photo) -->
        <div style="flex-shrink:0;">
          <div style="font-size:7px;font-weight:900;color:#64748b;text-transform:uppercase;margin-bottom:2.5px;letter-spacing:0.3px;">
            PHÂN HỆ CHỨC NĂNG
          </div>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:11px;overflow:hidden;">
            ${functionalItems.map((item, idx) => `
              <div style="display:flex;align-items:center;gap:6px;padding:4.2px 7px;border-bottom:${idx === functionalItems.length - 1 ? 'none' : '1px solid #f1f5f9'};">
                <div style="width:19px;height:19px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    ${item.iconSvg}
                  </svg>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:7.5px;font-weight:800;color:#0f172a;line-height:1.2;">${item.label}</div>
                  <div style="font-size:6px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.desc}</div>
                </div>
                <span style="color:#cbd5e1;font-size:8.5px;font-weight:700;">›</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 2: GIAO DIỆN & CHẾ ĐỘ MÀU (3 Cards as in photo) -->
        <div style="flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2.5px;">
            <span style="font-size:7px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.3px;">GIAO DIỆN & CHẾ ĐỘ MÀU</span>
            <span style="font-size:6.5px;font-weight:800;color:${p.primary};">Sáng</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;">
            <!-- Sáng (Active) -->
            <div style="background:#ffffff;border:1.5px solid ${p.primary};border-radius:7px;padding:4px 3px;display:flex;flex-direction:column;align-items:center;text-align:center;">
              <div style="width:17px;height:17px;border-radius:50%;background:${p.primary};color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:1.5px;">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </div>
              <span style="font-size:7px;font-weight:900;color:#0f172a;">Sáng</span>
              <span style="font-size:5.5px;color:#64748b;">Tươi sáng, tinh tế</span>
            </div>

            <!-- Tối -->
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:7px;padding:4px 3px;display:flex;flex-direction:column;align-items:center;text-align:center;">
              <div style="width:17px;height:17px;border-radius:50%;background:#f1f5f9;color:#64748b;display:flex;align-items:center;justify-content:center;margin-bottom:1.5px;">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              </div>
              <span style="font-size:7px;font-weight:800;color:#475569;">Tối</span>
              <span style="font-size:5.5px;color:#94a3b8;">Sang trọng, dịu mát</span>
            </div>

            <!-- Tương phản -->
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:7px;padding:4px 3px;display:flex;flex-direction:column;align-items:center;text-align:center;">
              <div style="width:17px;height:17px;border-radius:50%;background:#f1f5f9;color:#64748b;display:flex;align-items:center;justify-content:center;margin-bottom:1.5px;">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/></svg>
              </div>
              <span style="font-size:7px;font-weight:800;color:#475569;">Tương phản</span>
              <span style="font-size:5.5px;color:#94a3b8;">Độ tương phản cao</span>
            </div>
          </div>
        </div>

        <!-- Section 3: NGÔN NGỮ ỨNG DỤNG as in photo -->
        <div style="flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2.5px;">
            <span style="font-size:7px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.3px;">NGÔN NGỮ ỨNG DỤNG (8 NGÔN NGỮ)</span>
            <span style="font-size:6.5px;font-weight:800;color:${p.primary};">Tiếng Việt</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            <div style="background:#ffffff;border:1.5px solid ${p.primary};border-radius:6px;padding:3.5px 5px;display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:3px;">
                <span style="font-size:7px;font-weight:900;color:#ea580c;">🇻🇳 VN</span>
                <span style="font-size:6.5px;font-weight:800;color:#0f172a;">Tiếng Việt</span>
              </div>
              <span style="color:${p.primary};font-size:7.5px;font-weight:900;">✓</span>
            </div>

            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:3.5px 5px;display:flex;align-items:center;gap:3px;">
              <span style="font-size:7px;font-weight:900;color:#0284c7;">🇬🇧 GB</span>
              <span style="font-size:6.5px;font-weight:700;color:#64748b;">English</span>
            </div>
          </div>
        </div>

        <!-- Section 4: HỖ TRỢ & BẢO MẬT (Fills Flush Right Down to Footer) -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;flex-shrink:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:3.5px 6px;border-bottom:1px solid #f1f5f9;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:8px;">📞</span>
              <span style="font-size:6.8px;font-weight:800;color:#0f172a;">Hotline hỗ trợ VIP Hội viên: 1900 1983 (24/7)</span>
            </div>
            <span style="font-size:6.5px;color:#0284c7;font-weight:700;">Gọi ngay</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:3.5px 6px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:8px;">📜</span>
              <span style="font-size:6.8px;font-weight:800;color:#0f172a;">Quy chế hoạt động & Điều khoản CLB CEO 1983</span>
            </div>
            <span style="font-size:6.5px;color:#64748b;font-weight:700;">Xem ›</span>
          </div>
        </div>

        <!-- Section 5: ĐĂNG XUẤT TÀI KHOẢN -->
        <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:7px;padding:3.5px 6px;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;flex-shrink:0;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span style="font-size:6.8px;font-weight:900;color:#e11d48;">Đăng xuất tài khoản</span>
        </div>

        <!-- Section 6: THÔNG TIN PHIÊN BẢN (Touch Down) -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 4px;margin-bottom:1px;flex-shrink:0;">
          <span style="font-size:5.8px;color:#94a3b8;">Phiên bản v1.8.3 (CEO 1983 Build 2026)</span>
          <span style="font-size:5.8px;font-weight:800;color:#059669;">Bản quyền Hội viên ✓</span>
        </div>
      </div>

      <!-- Bottom Nav Bar (Đồng nhất nút giữa logo CEO 1983) -->
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
        <div class="m-nav-center" style="background:${p.navCenterBg}; border-color:${p.navCenterBorder}; box-shadow: 0 2px 7px rgba(0,0,0,0.25);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${p.navCenterIconColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5"/>
            <path d="M14 20h3a1 1 0 0 0 1-1v-2"/>
            <path d="M20 20v.01"/>
          </svg>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Kết nối</span>
        </div>
        <div class="m-nav-tab active" style="color:${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  `;
}



// =========================================================================
// 2. MASTER HTML TEMPLATE - 8 Pages A4, Vector Crisp, Zero Whitespace
// =========================================================================
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
      padding: 8mm 12mm 6mm 12mm;
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
      padding-bottom: 5px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 6px;
      flex-shrink: 0;
    }

    .brand-logo-header {
      height: 24px;
      width: auto;
      object-fit: contain;
    }

    .header-pill {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2.5px 8px;
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
      font-size: 8px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 4px;
      flex-shrink: 0;
    }

    /* Cover Page */
    .cover-page {
      background: radial-gradient(circle at 85% 15%, #0c2340 0%, #031426 50%, #010710 100%);
      color: #ffffff;
      padding: 22mm 16mm 12mm 16mm;
      justify-content: space-between;
    }
    .cover-top-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(2, 132, 199, 0.2);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .cover-main-title {
      font-size: 28px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .cover-main-title span {
      background: linear-gradient(90deg, #38bdf8 0%, #f97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-lead {
      font-size: 11px;
      line-height: 1.6;
      color: #94a3b8;
      max-width: 580px;
      margin-bottom: 18px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 11px;
    }
    .cover-card h4 {
      font-size: 10.5px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .cover-card p {
      font-size: 9px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    /* Page Typography */
    h2.doc-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    p.doc-subtitle {
      font-size: 9.5px;
      color: #64748b;
      margin-bottom: 5px;
    }

    /* ==================== CRISP PHONE MOCKUP STYLING ==================== */
    /* Large Phone Mockup for Single Home Screen Pages */
    .phone-mockup-large {
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
    }

    /* Medium Phone Mockup for Dual Screen Pages */
    .phone-mockup-medium {
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
    }

    /* Scrollable Flow Container: Content Fills Seamlessly Right Down To Footer Without Gaps */
    .m-screen-flow {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    /* Status Bar */
    .m-status-bar {
      height: 14px;
      padding: 2px 10px 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      font-weight: 800;
      color: #0f172a;
      background: #ffffff;
      flex-shrink: 0;
    }
    .m-status-icons {
      display: flex;
      gap: 3px;
      align-items: center;
      font-size: 8px;
    }

    /* App Header */
    .m-header {
      height: 34px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      flex-shrink: 0;
    }
    .m-logo {
      height: 23px;
      width: auto;
      object-fit: contain;
    }
    .m-bell-btn {
      position: relative;
      width: 25px;
      height: 25px;
      border-radius: 7px;
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
      font-size: 6.5px;
      font-weight: 900;
      padding: 0.5px 3px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }

    .m-hero-glow {
      height: 10px;
      background: linear-gradient(180deg, rgba(0,59,149,0.12) 0%, rgba(0,59,149,0.01) 100%);
      flex-shrink: 0;
    }

    /* VIP Member Widget */
    .m-vip-card {
      margin: -6px 7px 0 7px;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 3px 10px rgba(0,0,0,0.14);
      flex-shrink: 0;
    }
    .m-vip-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .m-vip-body {
      padding: 6px 7px;
      display: flex;
      align-items: center;
      gap: 7px;
      position: relative;
      z-index: 2;
    }
    .m-vip-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid #f59e0b;
      background: linear-gradient(135deg, #003B95, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .m-vip-content {
      flex: 1;
      min-width: 0;
    }
    .m-vip-company {
      font-size: 6.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }
    .m-vip-name {
      font-size: 10.5px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .m-vip-tags {
      display: flex;
      gap: 3px;
      margin-top: 2px;
      align-items: center;
    }
    .m-badge-gold {
      font-size: 6.5px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .m-badge-code {
      font-size: 6.5px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(255,255,255,0.16);
      color: #ffffff;
    }

    /* Box Container */
    .m-box {
      margin: 4px 7px 0 7px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 5px 6px;
      flex-shrink: 0;
    }
    .m-box-title {
      font-size: 8px;
      font-weight: 900;
      display: flex;
      align-items: center;
      margin-bottom: 3.5px;
      letter-spacing: 0.2px;
    }
    .m-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 4px;
    }

    /* 8 Grid */
    .m-grid-8 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3.5px 2px;
    }
    .m-grid-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .m-icon-box {
      width: 26px;
      height: 26px;
      border-radius: 7.5px;
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
      font-size: 5.5px;
      font-weight: 900;
      padding: 0.5px 2.5px;
      border-radius: 999px;
      border: 1px solid #ffffff;
    }
    .m-icon-text {
      font-size: 6.5px;
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
      gap: 6px;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 7.5px;
      padding: 4px 5px;
    }
    .m-event-calendar {
      width: 25px;
      height: 28px;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .m-cal-day {
      font-size: 11px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
    }
    .m-cal-month {
      font-size: 5.5px;
      font-weight: 800;
      color: rgba(255,255,255,0.9);
      text-transform: uppercase;
    }
    .m-event-text {
      flex: 1;
      min-width: 0;
    }
    .m-event-meta {
      font-size: 6.5px;
      color: #64748b;
      font-weight: 700;
    }
    .m-event-name {
      font-size: 8px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin: 1px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .m-event-location {
      font-size: 6.5px;
      color: #94a3b8;
    }

    /* Perks Item */
    .m-perks-item {
      margin: 4px 7px 0 7px;
      background: #ffffff;
      border: 1px solid #bae6fd;
      border-radius: 9px;
      padding: 4px 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .m-hot-pill {
      font-size: 6px;
      font-weight: 800;
      color: #ef4444;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 0.5px 3px;
      border-radius: 999px;
    }
    .m-action-pill {
      border: none;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 6.5px;
      font-weight: 800;
      cursor: pointer;
    }

    /* B2B Grid */
    .m-b2b-grid {
      margin: 4px 7px 0 7px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      flex-shrink: 0;
    }
    .m-b2b-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 4.5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .m-b2b-title {
      font-size: 8px;
      font-weight: 900;
      color: #0f172a;
    }
    .m-b2b-desc {
      font-size: 6px;
      color: #64748b;
      line-height: 1.2;
      margin: 1px 0 2.5px 0;
    }
    .m-b2b-btn {
      border: none;
      border-radius: 4px;
      font-size: 6.5px;
      font-weight: 800;
      padding: 2px 5px;
      cursor: pointer;
      align-self: flex-start;
    }

    /* Install Hint */
    .m-install-hint {
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
    }

    /* Bottom Navigation Bar - Sits Flush At Bottom, 0 Gap */
    .m-bottom-nav {
      height: 35px;
      border-top: 1.5px solid #f1f5f9;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 3px;
      flex-shrink: 0;
      margin-top: 0;
    }
    .m-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      font-size: 6.5px;
      font-weight: 700;
      color: #94a3b8;
    }
    .m-nav-center {
      width: 27px;
      height: 27px;
      border-radius: 50%;
      background: #ffffff;
      border: 1.5px solid #003B95;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,59,149,0.18);
      margin-top: -7px;
    }

    /* Medium Phone Inner Header */
    .m-inner-header {
      height: 30px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      flex-shrink: 0;
    }

    /* Layout Components */
    .screen-layout-single {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      margin-top: 3px;
      flex: 1;
    }
    .screen-layout-dual {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 3px;
      flex: 1;
    }
    .dual-screen-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .screen-tag {
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    .points-column {
      width: 78mm;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .point-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 7px 9px;
    }
    .point-card h4 {
      font-size: 9.5px;
      font-weight: 900;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 2.5px;
    }
    .point-card p {
      font-size: 8px;
      color: #475569;
      line-height: 1.4;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1: BÌA HỒ SƠ ==================== -->
  <div class="page cover-page">
    <div class="brand-stripe"></div>

    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div class="cover-top-tag">
        <span>★ HỒ SƠ ĐỀ XUẤT THIẾT KẾ GIAO DIỆN CHUẨN CEO 1983 ★</span>
      </div>
      <img src="data:image/png;base64,${logoBase64}" style="height:38px;filter:brightness(0) invert(1);" alt="CEO 1983">
    </div>

    <div style="margin:20px 0;">
      <div style="font-size:12px;font-weight:800;color:#f97316;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
        HỆ SINH THÁI ỨNG DỤNG HỘI VIÊN CHUYÊN BIỆT
      </div>
      <h1 class="cover-main-title">
        ĐỀ XUẤT GIAO DIỆN APP<br>
        <span>CLB DOANH NHÂN CEO 1983</span>
      </h1>
      <p class="cover-lead">
        Tài liệu đặc tả và so sánh trực quan 3 phương án thiết kế giao diện ứng dụng di động hiệp hội, bảo toàn 100% các phân hệ chức năng: <strong>Trang Chủ</strong>, <strong>Sự Kiện Hội Viên</strong> và <strong>Trang Cá Nhân & Quản Trị</strong> theo tiêu chuẩn thực tế của ứng dụng.
      </p>

      <div class="cover-grid">
        <div class="cover-card">
          <h4>PHƯƠNG ÁN 1: CLASSIC NAVY & GOLD</h4>
          <p>Xanh Navy (#003B95) kết hợp Ánh Kim Vàng (#F59E0B). Phong thái doanh nhân chững chạc, quyền uy và trường tồn.</p>
        </div>
        <div class="cover-card">
          <h4>PHƯƠNG ÁN 2: DIGITAL SAPPHIRE TECH</h4>
          <p>Xanh Sapphire (#0284C7) kết hợp Neon Cyan (#38BDF8). Không gian số thời thượng, năng động và đột phá.</p>
        </div>
        <div class="cover-card">
          <h4>PHƯƠNG ÁN 3: B2B COMMERCE FOCUS</h4>
          <p>Cam B2B (#EA580C) kết hợp Than chì Slate (#0F172A). Thực dụng tối đa, tối ưu cho giao thương và xúc tiến thương mại.</p>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.15);padding-top:10px;font-size:9.5px;color:#94a3b8;">
      <div>
        <strong style="color:#ffffff;">ĐƠN VỊ THỰC HIỆN:</strong> BAN CÔNG NGHỆ & ĐỘI NGŨ THIẾT KẾ VIONE
      </div>
      <div>
        <strong style="color:#ffffff;">NGÀY PHÁT HÀNH:</strong> THÁNG 09/2026 • PHIÊN BẢN CHUẨN HÓA 3.2
      </div>
    </div>
  </div>

  <!-- ==================== TRANG 2: BẢN SẮC & 3 MÀN HÌNH CỐT LÕI ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill">BẢN SẮC & HỆ THỐNG 3 MÀN HÌNH</span>
    </div>

    <h2 class="doc-title">Bản Sắc Nhận Diện & Cấu Trúc 3 Màn Hình Cốt Lõi</h2>
    <p class="doc-subtitle">Đồng bộ hoàn hảo giữa triết lý gắn kết doanh nhân CEO 1983 và kiến trúc giao diện thực tế của ứng dụng.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:10px;">
      <div style="background:#f0f4fa;border:1.5px solid #003B95;border-radius:10px;padding:9px;">
        <div style="font-size:10.5px;font-weight:900;color:#003B95;margin-bottom:3px;">MÀN 1: TRANG CHỦ</div>
        <div style="font-size:8px;color:#334155;line-height:1.45;">
          Bao gồm Thẻ VIP thu gọn, Lưới 8 tính năng nhanh, Sự kiện nổi bật 16/9, Ưu đãi quà tặng 3D, Cặp khối B2B Trao cơ hội & Đăng sản phẩm, Doanh nghiệp mới gia nhập, Tiện ích thẻ thông minh.
        </div>
      </div>

      <div style="background:#f0f9ff;border:1.5px solid #0284c7;border-radius:10px;padding:9px;">
        <div style="font-size:10.5px;font-weight:900;color:#0284c7;margin-bottom:3px;">MÀN 2: SỰ KIỆN CLB</div>
        <div style="font-size:8px;color:#334155;line-height:1.45;">
          Trang sự kiện hội tụ chuỗi 12 sự kiện thực tế, banner sự kiện sắc nét, lịch trình thời gian, địa điểm, trạng thái vé điện tử QR và nút đăng ký tham gia liên tục chạm sát footer.
        </div>
      </div>

      <div style="background:#fff7ed;border:1.5px solid #ea580c;border-radius:10px;padding:9px;">
        <div style="font-size:10.5px;font-weight:900;color:#ea580c;margin-bottom:3px;">MÀN 3: CÁ NHÂN & QUẢN TRỊ</div>
        <div style="font-size:8px;color:#334155;line-height:1.45;">
          Chuẩn 100% theo giao diện thực tế: Thẻ hội viên Lê Hoàng Long (M1983-002), 10 phân hệ chức năng chuyên nghiệp, bộ chuyển đổi 3 chế độ màu, đa ngôn ngữ và thông tin bản quyền.
        </div>
      </div>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:9px;margin-bottom:8px;">
      <h3 style="font-size:10.5px;font-weight:900;color:#0f172a;margin-bottom:5px;">BẢNG ĐỐI SOÁT BẢO TOÀN TÍNH NĂNG THEO MÀN HÌNH</h3>
      <table style="width:100%;border-collapse:collapse;font-size:8px;text-align:left;">
        <thead>
          <tr style="background:#e2e8f0;color:#0f172a;font-weight:800;">
            <th style="padding:4px 7px;border:1px solid #cbd5e1;">Màn Hình</th>
            <th style="padding:4px 7px;border:1px solid #cbd5e1;">Thành Phần Nghiệp Vụ Cốt Lõi</th>
            <th style="padding:4px 7px;border:1px solid #cbd5e1;">Tiêu Chuẩn Hiển Thị Thị Giác</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;font-weight:800;color:#003B95;">1. Trang Chủ</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Thẻ VIP, 8 Icon Lưới, Sự kiện nổi bật, Quà tặng ưu đãi, B2B Trao cơ hội & Đăng sản phẩm, Tiện ích thẻ.</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Nội dung tràn đều chạm sát thanh footer điều hướng, <strong>không để khoảng trắng trống</strong>.</td>
          </tr>
          <tr>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;font-weight:800;color:#0284c7;">2. Sự Kiện</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Bộ lọc 4 Tab, Banner đại hội, Thẻ lịch ngày tháng, Chi tiết địa điểm, Nút đăng ký vé QR.</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Hiển thị chuỗi 12 sự kiện thực chiến chạm đáy thanh footer điều hướng, <strong>0 khoảng trắng</strong>.</td>
          </tr>
          <tr>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;font-weight:800;color:#ea580c;">3. Cá Nhân & Quản Trị</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Thẻ tóm tắt hồ sơ hội viên, 10 Phân hệ chức năng, 3 Chế độ màu (Sáng/Tối/Tương phản), Ngôn ngữ, Bản quyền.</td>
            <td style="padding:4px 7px;border:1px solid #e2e8f0;">Chuẩn 100% layout thực tế theo ảnh chụp, các phân hệ xếp gọn gàng chạm sát đáy footer, <strong>0 khoảng trắng</strong>.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Báo Cáo Đề Xuất Giao Diện Ứng Dụng Di Động</div>
      <div>Trang 2 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 3: PHƯƠNG ÁN 1 • MÀN 1 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#f0f4fa;color:#003B95;border-color:#bae6fd;">PHƯƠNG ÁN 1: TRANG CHỦ</span>
    </div>

    <h2 class="doc-title">Phương Án 1: Classic Navy & Gold • Màn 1: Trang Chủ</h2>
    <p class="doc-subtitle">Tông màu Xanh Navy (#003B95) kết hợp Ánh Kim Vàng (#F59E0B) thể hiện bản lĩnh doanh nhân trường tồn.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa1')}

      <div class="points-column">
        <div class="point-card">
          <h4 style="color:#003B95;">1. Khung Nhận Diện Doanh Nhân</h4>
          <p>Thẻ hội viên dập viền vàng hổ phách, chữ trắng nổi bật trên nền Navy hoàng gia, tích xanh định danh lãnh đạo.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#003B95;">2. Lưới 8 Tính Năng Toàn Diện</h4>
          <p>Biểu tượng sắc nét, nhãn text đầy đủ không bị cắt ngắn, badge thông báo đỏ thu hút sự chú ý tức thì.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#003B95;">3. Sự Kiện & Quà Tặng Ưu Đãi</h4>
          <p>Khối lịch ngày tháng 16/9 nổi bật cùng hộp quà 3D kích thích tương tác nhận quyền lợi hội viên.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#003B95;">4. B2B Trao Cơ Hội & Đăng Sản Phẩm</h4>
          <p>Cặp thẻ giao thương thực chiến với badge "+2 Mới" và "+11 Mới", hỗ trợ kết nối đối tác một chạm.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#003B95;">5. Tràn Đáy Liền Mạch Không Khoảng Trắng</h4>
          <p>Nội dung dòng chảy liên tục từ đỉnh xuống chạm sát thanh điều hướng đáy, loại bỏ hoàn toàn khoảng trống.</p>
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
      <span class="header-pill" style="background:#f0f4fa;color:#003B95;border-color:#bae6fd;">PHƯƠNG ÁN 1: SỰ KIỆN & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 1: Màn Sự Kiện Phong Phú & Màn Cá Nhân Quản Trị</h2>
    <p class="doc-subtitle">Màn sự kiện tràn đáy chạm footer và màn cá nhân chuẩn 100% theo giao diện ứng dụng thực tế.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#003B95;">MÀN 2: SỰ KIỆN HỘI VIÊN (CHẠM ĐÁY FOOTER)</div>
        ${renderEventsScreen('pa1')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#003B95;">MÀN 3: CÁ NHÂN & QUẢN TRỊ (CHUẨN 100% THỰC TẾ)</div>
        ${renderProfileScreen('pa1')}
      </div>
    </div>

    <div style="margin-top:5px;display:grid;grid-template-columns:1fr 1fr;gap:9px;font-size:8px;color:#475569;">
      <div style="padding:4.5px 7px;background:#f0f4fa;border:1px solid #bae6fd;border-radius:7px;">
        <strong style="color:#003B95;">Đặc Điểm Màn Sự Kiện:</strong> Chuỗi 12 sự kiện xếp tầng với banner sắc nét, lịch ngày tháng, địa điểm và nút đăng ký vé QR chạm sát đáy thanh menu.
      </div>
      <div style="padding:4.5px 7px;background:#f0f4fa;border:1px solid #bae6fd;border-radius:7px;">
        <strong style="color:#003B95;">Đặc Điểm Màn Cá Nhân:</strong> Thẻ hội viên Lê Hoàng Long, 10 phân hệ chức năng, 3 chế độ màu và chọn ngôn ngữ chuẩn 100% theo ảnh app thực tế.
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 1: Classic Navy & Gold</div>
      <div>Trang 4 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 5: PHƯƠNG ÁN 2 • MÀN 1 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#e0f2fe;color:#0369a1;border-color:#7dd3fc;">PHƯƠNG ÁN 2: TRANG CHỦ</span>
    </div>

    <h2 class="doc-title">Phương Án 2: Digital Sapphire Tech • Màn 1: Trang Chủ</h2>
    <p class="doc-subtitle">Xanh Sapphire (#0284C7) kết hợp Neon Cyan (#38BDF8) thể hiện tinh thần đổi mới sáng tạo trong kỷ nguyên số.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa2')}

      <div class="points-column">
        <div class="point-card">
          <h4 style="color:#0284c7;">1. Thẻ Hội Viên Phát Quang</h4>
          <p>Hiệu ứng ánh sáng viền Cyan công nghệ cao, phản chiếu biểu tượng tinh thể số hiện đại của liên minh doanh nhân 1983.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#0284c7;">2. Biểu Tượng Kỹ Thuật Số Đa Sắc</h4>
          <p>Lưới 8 tính năng sử dụng bảng màu Pastel tươi mới kiểu Apple VisionOS, gia tăng cảm giác công nghệ tương lai.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#0284c7;">3. Sự Kiện & Quà Tặng Số Hóa</h4>
          <p>Khối sự kiện tông Sapphire tươi trẻ, kích thích doanh nhân trẻ kết nối học hỏi và giao thương số.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#0284c7;">4. Trao Cơ Hội & Sản Phẩm Số</h4>
          <p>Nút CTA dạng Gradient phát sáng nhẹ, tạo ấn tượng công nghệ cao cho mỗi giao dịch trao gửi cơ hội kinh doanh.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#0284c7;">5. Dòng Chảy Không Khoảng Trống</h4>
          <p>Thiết kế được tinh chỉnh tỉ mỉ để mọi khối nội dung kết nối liên tục, chạm sát đáy thanh footer điều hướng.</p>
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
      <span class="header-pill" style="background:#e0f2fe;color:#0369a1;border-color:#7dd3fc;">PHƯƠNG ÁN 2: SỰ KIỆN & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 2: Chuỗi Sự Kiện Công Nghệ & Quản Trị Số Hóa</h2>
    <p class="doc-subtitle">Trải nghiệm tương tác số hóa hiện đại với độ sắc nét tuyệt đối và bố cục tràn đều tới thanh footer.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#0284c7;">MÀN 2: SỰ KIỆN HỘI VIÊN (CHẠM ĐÁY FOOTER)</div>
        ${renderEventsScreen('pa2')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#0284c7;">MÀN 3: CÁ NHÂN & QUẢN TRỊ (CHUẨN 100% THỰC TẾ)</div>
        ${renderProfileScreen('pa2')}
      </div>
    </div>

    <div style="margin-top:5px;display:grid;grid-template-columns:1fr 1fr;gap:9px;font-size:8px;color:#475569;">
      <div style="padding:4.5px 7px;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:7px;">
        <strong style="color:#0284c7;">Đặc Điểm Màn Sự Kiện:</strong> Tone màu Sapphire tươi sáng, khối vé QR điện tử thông minh, chuỗi 12 sự kiện kéo dài liên tục tới chân footer.
      </div>
      <div style="padding:4.5px 7px;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:7px;">
        <strong style="color:#0284c7;">Đặc Điểm Màn Cá Nhân:</strong> Thẻ hội viên và 10 phân hệ chức năng định vị rõ ràng, tích hợp bộ chuyển đổi giao diện và đa ngôn ngữ sắc nét.
      </div>
    </div>

    <div class="page-footer">
      <div>CLB Doanh Nhân CEO 1983 • Phương Án 2: Digital Sapphire Tech</div>
      <div>Trang 6 / 8</div>
    </div>
  </div>

  <!-- ==================== TRANG 7: PHƯƠNG ÁN 3 • MÀN 1 ==================== -->
  <div class="page">
    <div class="brand-stripe"></div>
    <div class="header-bar">
      <img class="brand-logo-header" src="data:image/png;base64,${logoBase64}" alt="CEO 1983">
      <span class="header-pill" style="background:#ffedd5;color:#c2410c;border-color:#fdba74;">PHƯƠNG ÁN 3: TRANG CHỦ</span>
    </div>

    <h2 class="doc-title">Phương Án 3: B2B Commerce Focus • Màn 1: Trang Chủ</h2>
    <p class="doc-subtitle">Cam B2B (#EA580C) kết hợp Than chì Slate (#0F172A) tập trung cao độ vào thực chiến kinh doanh.</p>

    <div class="screen-layout-single">
      ${renderHomeScreen('pa3')}

      <div class="points-column">
        <div class="point-card">
          <h4 style="color:#ea580c;">1. Thẻ Doanh Nhân Tối Giản</h4>
          <p>Nền than chì nguyên khối kết hợp đường viền cam năng động, tối ưu diện tích và tập trung vào chức danh pháp nhân.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#ea580c;">2. Biểu Tượng Phẳng (Flat Clean)</h4>
          <p>Icon xám than chì trên nền xám nhạt tối giản, giảm thiểu phân tâm thị giác, tôn vinh thông tin xúc tiến thương mại.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#ea580c;">3. Sự Kiện & Hội Nghị B2B</h4>
          <p>Lịch ngày tháng màu cam nhiệt huyết, ưu tiên các hội nghị xúc tiến đầu tư và ký kết hợp đồng thương mại.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#ea580c;">4. Trao Cơ Hội & Đăng Sản Phẩm</h4>
          <p>Nút hành động lớn màu cam nổi bật, trực tiếp thúc đẩy hành vi chào hàng và trao gửi cơ hội làm ăn thực chất.</p>
        </div>
        <div class="point-card">
          <h4 style="color:#ea580c;">5. Dòng Chảy Tràn Đáy Footer Liền Mạch</h4>
          <p>Bố cục nội dung tiếp nối trực tiếp vào thanh menu đáy, bảo đảm tính toàn vẹn và không để khoảng trắng.</p>
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
      <span class="header-pill" style="background:#ffedd5;color:#c2410c;border-color:#fdba74;">PHƯƠNG ÁN 3: SỰ KIỆN & CÁ NHÂN</span>
    </div>

    <h2 class="doc-title">Phương Án 3: Sự Kiện B2B Thực Chiến & Hồ Sơ Pháp Nhân</h2>
    <p class="doc-subtitle">Định hướng thực dụng tối đa, cung cấp đầy đủ thông tin pháp nhân và giao dịch kết nối kinh doanh.</p>

    <div class="screen-layout-dual">
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#ea580c;">MÀN 2: SỰ KIỆN HỘI VIÊN (CHẠM ĐÁY FOOTER)</div>
        ${renderEventsScreen('pa3')}
      </div>
      <div class="dual-screen-col">
        <div class="screen-tag" style="color:#ea580c;">MÀN 3: CÁ NHÂN & QUẢN TRỊ (CHUẨN 100% THỰC TẾ)</div>
        ${renderProfileScreen('pa3')}
      </div>
    </div>

    <div style="margin-top:5px;display:grid;grid-template-columns:1fr 1fr;gap:9px;font-size:8px;color:#475569;">
      <div style="padding:4.5px 7px;background:#fff7ed;border:1px solid #fdba74;border-radius:7px;">
        <strong style="color:#c2410c;">Đặc Điểm Màn Sự Kiện:</strong> Tone màu cam nhiệt huyết, danh sách 12 sự kiện dày dặn, nút đăng ký vé rõ ràng kéo dài chạm chân menu.
      </div>
      <div style="padding:4.5px 7px;background:#fff7ed;border:1px solid #fdba74;border-radius:7px;">
        <strong style="color:#c2410c;">Đặc Điểm Màn Cá Nhân:</strong> Thẻ hội viên và 10 phân hệ chức năng thực chiến, chuẩn xác 100% theo ứng dụng thực tế.
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

// 3. Write HTML & Compile with Edge Headless
const htmlPath = path.resolve('scratch/de_xuat_giao_dien_ultimate.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfPath = path.resolve('scratch/DE_XUAT_GIAO_DIEN_APP_CEO1983.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  console.log('Rendering 8-Page Standard CEO 1983 Brand PDF...');
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
