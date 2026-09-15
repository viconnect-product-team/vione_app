const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('scratch/build_ceo1983_standard_pdf.js');
let code = fs.readFileSync(targetFile, 'utf8');

// =========================================================================
// 1. New renderHomeScreen: Dense, Zero whitespace down to footer
// =========================================================================
const newRenderHomeScreen = `function renderHomeScreen(option) {
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

  return \`
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
        <img class="m-logo" src="data:image/png;base64,\${logoBase64}" alt="CEO 1983">
        <div class="m-header-right">
          <div class="m-bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="\${p.primary}" stroke-width="2.3"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="m-bell-badge">3</span>
          </div>
        </div>
      </div>

      <!-- Scrollable Flow Container that touches footer seamlessly without gap -->
      <div class="m-screen-flow" style="padding-bottom:2px;">
        <!-- Hero Glow Stripe -->
        <div class="m-hero-glow"></div>

        <!-- 1. VIP Member Compact Widget -->
        <div class="m-vip-card" style="background:\${p.cardBg}; border:\${p.cardBorder};">
          <div class="m-vip-overlay" style="\${p.cardOverlay}"></div>
          <div class="m-vip-body">
            <div class="m-vip-avatar" style="border-color:\${p.avatarBorder};">
              <span>HL</span>
            </div>
            <div class="m-vip-content">
              <div class="m-vip-company">CÔNG TY DU LỊCH QUỐC TẾ Á CHÂU</div>
              <div class="m-vip-name">
                <span>LÊ HOÀNG LONG</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z"/></svg>
              </div>
              <div class="m-vip-tags">
                <span class="m-badge-gold" style="\${p.badgeClass}">VIP MEMBER</span>
                <span class="m-badge-code">M1983-002 📋</span>
              </div>
            </div>
            <div style="color:rgba(255,255,255,0.75);font-size:17px;font-weight:900;">›</div>
          </div>
        </div>

        <!-- 2. Lưới 8 Tính Năng Nhanh -->
        <div class="m-box" style="margin-top:5px;">
          <div class="m-box-title" style="color:\${p.tagColor};">
            <span class="m-dot" style="background:\${p.primary};"></span>
            TÍNH NĂNG NHANH
          </div>
          <div class="m-grid-8">
            \${icons.map(ic => \`
              <div class="m-grid-col">
                <div class="m-icon-box" style="background:\${ic.bg};color:\${ic.color};">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    \${ic.iconSvg}
                  </svg>
                  \${ic.badge ? \`<span class="m-icon-badge">\${ic.badge}</span>\` : ''}
                </div>
                <div class="m-icon-text">\${ic.label}</div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- 3. Khối Sự Kiện Nổi Bật -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:\${p.tagColor};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="\${p.primary}" stroke-width="2.4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              SỰ KIỆN NỔI BẬT
            </div>
            <span style="font-size:8px;font-weight:800;color:\${p.primary};">Xem tất cả +5 ›</span>
          </div>
          <div class="m-event-item">
            <div class="m-event-calendar" style="background:\${p.primary};">
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
        <div class="m-perks-item" style="border-color:\${p.borderSoft};margin-top:5px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:900;color:\${p.primary};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Ưu đãi Hội viên & Đối tác
              <span class="m-hot-pill">+Hot</span>
            </div>
            <div style="font-size:7px;color:#64748b;line-height:1.3;margin:2px 0 4px 0;">
              Chính sách trợ giá, quà tặng liên kết & quyền lợi giao thương.
            </div>
            <button style="background:\${p.primary};color:\${p.btnText};" class="m-action-pill">
              Xem ưu đãi ngay →
            </button>
          </div>
          <div style="width:38px;height:38px;flex-shrink:0;">
            <img src="data:image/png;base64,\${giftBase64}" style="width:100%;height:100%;object-fit:contain;" alt="Gift">
          </div>
        </div>

        <!-- 5. Cặp Khối Giao Thương B2B Thực Chiến -->
        <div class="m-b2b-grid" style="margin-top:5px;">
          <div class="m-b2b-box" style="border-color:\${p.borderSoft};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
              <span style="font-size:15px;">🤝</span>
              <span class="m-hot-pill">+2 Mới</span>
            </div>
            <div class="m-b2b-title">TRAO CƠ HỘI</div>
            <div class="m-b2b-desc">Chia sẻ cơ hội Kết nối thành công</div>
            <button class="m-b2b-btn" style="background:\${p.btnSecondary};color:\${p.btnSecText};">Khám phá ngay</button>
          </div>

          <div class="m-b2b-box" style="border-color:\${p.borderSoft};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
              <span style="font-size:15px;">📦</span>
              <span class="m-hot-pill">+11 Mới</span>
            </div>
            <div class="m-b2b-title">ĐĂNG SẢN PHẨM</div>
            <div class="m-b2b-desc">Quảng bá sản phẩm Kết nối khách hàng</div>
            <button class="m-b2b-btn" style="background:\${p.btnPrimary};color:\${p.btnText};">Đăng ngay</button>
          </div>
        </div>

        <!-- 6. Khối Doanh Nghiệp Mới Gia Nhập -->
        <div class="m-box" style="margin-top:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="m-box-title" style="margin-bottom:0;color:\${p.tagColor};">
              <span class="m-dot" style="background:\${p.primary};"></span>
              DOANH NGHIỆP MỚI GIA NHẬP
            </div>
            <span style="font-size:7.5px;font-weight:700;color:\${p.primary};">Xem danh bạ ›</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:4px 6px;display:flex;align-items:center;gap:5px;">
              <div style="width:22px;height:22px;border-radius:6px;background:\${p.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;">KT</div>
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
            <div class="m-box-title" style="margin-bottom:0;color:\${p.tagColor};">
              <span class="m-dot" style="background:\${p.primary};"></span>
              TIỆN ÍCH THẺ THÔNG MINH
            </div>
            <span style="font-size:7.5px;font-weight:700;color:\${p.primary};">Xem thẻ số ›</span>
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
            <div class="m-box-title" style="margin-bottom:0;color:\${p.tagColor};">
              <span class="m-dot" style="background:\${p.primary};"></span>
              TIN HOẠT ĐỘNG CLB
            </div>
            <span style="font-size:7.5px;font-weight:700;color:\${p.primary};">Xem tất cả ›</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:3.5px;">
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:7px;padding:3.5px 5px;display:flex;gap:5px;align-items:center;">
              <div style="width:26px;height:24px;border-radius:4px;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
                <img src="data:image/jpeg;base64,\${heroBase64}" style="width:100%;height:100%;object-fit:cover;" alt="News 1">
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Xúc tiến thương mại liên minh Doanh nhân 1983</div>
                <div style="font-size:6px;color:#94a3b8;margin-top:1px;">Hôm nay • Ban Truyền Thông</div>
              </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:7px;padding:3.5px 5px;display:flex;gap:5px;align-items:center;">
              <div style="width:26px;height:24px;border-radius:4px;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
                <img src="data:image/jpeg;base64,\${skylineBase64}" style="width:100%;height:100%;object-fit:cover;" alt="News 2">
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7px;font-weight:800;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Ký kết hợp tác chiến lược mạng lưới cung ứng toàn quốc</div>
                <div style="font-size:6px;color:#94a3b8;margin-top:1px;">Hôm qua • Ban Xúc Tiến Đầu Tư</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 9. Install Hint Touch Down -->
        <div class="m-install-hint" style="border-color:\${p.primary}; color:\${p.primary};margin-top:5px;margin-bottom:2px;">
          📲 Cài đặt ứng dụng lên màn hình chính điện thoại
        </div>
      </div>

      <!-- 10. Bottom Navigation Bar (Tab Trang chủ active, sits flush at bottom) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab active" style="color:\${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="border-color:\${p.navCenterBorder};">
          <img src="data:image/png;base64,\${emblemBase64}" style="width:20px;height:20px;object-fit:contain;" alt="83">
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
  \`;
}`;

// =========================================================================
// 2. New renderEventsScreen: 12 Dense Events Touching Footer Seamlessly
// =========================================================================
const newRenderEventsScreen = `function renderEventsScreen(option) {
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

  return \`
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="\${p.primary}" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>

      <!-- Filter Tabs -->
      <div style="padding:3.5px 7px;display:flex;gap:3.5px;background:#ffffff;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
        <span style="background:\${p.tabActive};color:#fff;font-size:6.5px;font-weight:800;padding:2.5px 6px;border-radius:999px;">Tất cả (12)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Sắp diễn ra (5)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Đã đăng ký (2)</span>
        <span style="background:#f1f5f9;color:#475569;font-size:6.5px;font-weight:700;padding:2.5px 6px;border-radius:999px;">Của tôi</span>
      </div>

      <!-- Scrollable Flow: 12 Dense Events Stacked Continuously Touching Footer Without Gap -->
      <div class="m-screen-flow" style="padding:4px 6px;gap:3.5px;">
        <!-- Event 1: Hero Featured Banner Event -->
        <div style="background:#ffffff;border:1px solid \${p.borderSoft};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);flex-shrink:0;">
          <div style="position:relative;height:44px;background:#0f172a;">
            <img src="data:image/jpeg;base64,\${eventBase64}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" alt="Event 1">
            <div style="position:absolute;top:3px;left:5px;display:flex;gap:3px;">
              <span style="background:#ef4444;color:#fff;font-size:6px;font-weight:900;padding:1px 4.5px;border-radius:999px;">🔥 Sắp diễn ra</span>
              <span style="background:rgba(0,0,0,0.6);color:#fff;font-size:6px;font-weight:700;padding:1px 4.5px;border-radius:999px;backdrop-filter:blur(2px);">Check-in QR</span>
            </div>
          </div>
          <div style="padding:4px 6px;">
            <div style="display:flex;gap:5px;align-items:flex-start;">
              <div class="m-event-calendar" style="background:\${p.primary};width:26px;height:27px;flex-shrink:0;">
                <span class="m-cal-day" style="font-size:11px;">16</span>
                <span class="m-cal-month" style="font-size:5.5px;">TH9</span>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.5px;font-weight:900;color:#0f172a;line-height:1.2;">Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình</div>
                <div style="font-size:6px;color:#64748b;margin-top:1px;">⏰ 07:30 - 13:00 • 📍 TT Hội Nghị Quốc Gia</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;padding-top:3px;border-top:1px dashed #e2e8f0;">
              <div style="font-size:6px;color:\${p.primary};font-weight:800;">👥 250+ CEO Đã đăng ký</div>
              <span style="background:#dcfce7;color:#15803d;font-size:6px;font-weight:800;padding:1.5px 5px;border-radius:3px;border:1px solid #bbf7d0;">Đã có vé VIP ✓</span>
            </div>
          </div>
        </div>

        <!-- Events 2 to 12: Continuous Stream filling all way down to footer -->
        \${eventsList.map(ev => \`
          <div style="background:#ffffff;border:1px solid \${p.borderSoft};border-radius:7px;padding:3.5px 5px;box-shadow:0 1px 3px rgba(0,0,0,0.02);flex-shrink:0;">
            <div style="display:flex;gap:5px;align-items:flex-start;">
              <div class="m-event-calendar" style="background:\${ev.bg};width:25px;height:26px;flex-shrink:0;">
                <span class="m-cal-day" style="font-size:10.5px;">\${ev.day}</span>
                <span class="m-cal-month" style="font-size:5.5px;">\${ev.month}</span>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:7.2px;font-weight:900;color:#0f172a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${ev.title}</div>
                <div style="font-size:5.8px;color:#64748b;margin-top:1px;">\${ev.meta}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2.5px;padding-top:2.5px;border-top:1px dashed #f1f5f9;">
              <span style="font-size:6.2px;font-weight:800;color:\${ev.tagColor};">\${ev.tag}</span>
              <button style="background:\${p.primary};color:#fff;border:none;border-radius:3.5px;padding:1.5px 5.5px;font-size:6px;font-weight:800;cursor:pointer;">\${ev.btn}</button>
            </div>
          </div>
        \`).join('')}
      </div>

      <!-- Bottom Nav Bar (Tab Sự kiện Active, sits flush at bottom) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab active" style="color:\${p.primary};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          <span>Sự kiện</span>
        </div>
        <div class="m-nav-center" style="border-color:\${p.navCenterBorder};">
          <img src="data:image/png;base64,\${emblemBase64}" style="width:20px;height:20px;object-fit:contain;" alt="83">
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
  \`;
}`;

// =========================================================================
// 3. New renderProfileScreen: 100% User Photo Match, Touching Footer
// =========================================================================
const newRenderProfileScreen = `function renderProfileScreen(option) {
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

  return \`
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
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="\${p.primary}" stroke-width="2.6"><path d="m15 18-6-6 6-6"/></svg>
        <span style="font-size:11px;font-weight:900;color:#0f172a;">Trang Cá Nhân & Quản Trị</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="\${p.primary}" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>

      <!-- Scrollable Flow: Exact Photo Structure, Sized Proportionately to Touch Footer Seamlessly -->
      <div class="m-screen-flow" style="background:#f8fafc;padding:5px 6.5px;gap:5px;">
        <!-- Member Summary Card as shown in photo -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:6px 8px;display:flex;align-items:center;gap:7px;box-shadow:0 1px 3px rgba(0,0,0,0.02);flex-shrink:0;">
          <div style="position:relative;width:34px;height:34px;flex-shrink:0;">
            <div style="width:100%;height:100%;border-radius:50%;background:#003B95;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;border:1.5px solid \${p.primary};">
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
            \${functionalItems.map((item, idx) => \`
              <div style="display:flex;align-items:center;gap:6px;padding:4.2px 7px;border-bottom:\${idx === functionalItems.length - 1 ? 'none' : '1px solid #f1f5f9'};">
                <div style="width:19px;height:19px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    \${item.iconSvg}
                  </svg>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:7.5px;font-weight:800;color:#0f172a;line-height:1.2;">\${item.label}</div>
                  <div style="font-size:6px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${item.desc}</div>
                </div>
                <span style="color:#cbd5e1;font-size:8.5px;font-weight:700;">›</span>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- Section 2: GIAO DIỆN & CHẾ ĐỘ MÀU (3 Cards as in photo) -->
        <div style="flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2.5px;">
            <span style="font-size:7px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.3px;">GIAO DIỆN & CHẾ ĐỘ MÀU</span>
            <span style="font-size:6.5px;font-weight:800;color:\${p.primary};">Sáng</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;">
            <!-- Sáng (Active) -->
            <div style="background:#ffffff;border:1.5px solid \${p.primary};border-radius:7px;padding:4px 3px;display:flex;flex-direction:column;align-items:center;text-align:center;">
              <div style="width:17px;height:17px;border-radius:50%;background:\${p.primary};color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:1.5px;">
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
            <span style="font-size:6.5px;font-weight:800;color:\${p.primary};">Tiếng Việt</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            <div style="background:#ffffff;border:1.5px solid \${p.primary};border-radius:6px;padding:3.5px 5px;display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:3px;">
                <span style="font-size:7px;font-weight:900;color:#ea580c;">🇻🇳 VN</span>
                <span style="font-size:6.5px;font-weight:800;color:#0f172a;">Tiếng Việt</span>
              </div>
              <span style="color:\${p.primary};font-size:7.5px;font-weight:900;">✓</span>
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

      <!-- Bottom Nav Bar (Exact Match User Photo: Red badge on Notification, QR Center Button, Active Profile) -->
      <div class="m-bottom-nav">
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Trang chủ</span>
        </div>
        <div class="m-nav-tab" style="position:relative;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span style="position:absolute;top:-2px;right:4px;width:6px;height:6px;border-radius:50%;background:#ef4444;color:#fff;font-size:4.5px;display:flex;align-items:center;justify-content:center;font-weight:900;">0</span>
          <span>Thông báo</span>
        </div>
        <!-- Center QR button as in photo: cyan rounded square -->
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(2,132,199,0.3);margin-top:-6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </div>
        <div class="m-nav-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Kết nối</span>
        </div>
        <!-- Active Tab Cá nhân with sparkle like photo -->
        <div class="m-nav-tab active" style="color:#0284c7;border:1.5px solid #0284c7;border-radius:8px;padding:2px 5px;background:#f0f9ff;">
          <div style="position:relative;display:inline-block;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style="position:absolute;top:-3px;right:-3px;font-size:7px;color:#f59e0b;">✨</span>
          </div>
          <span style="font-weight:900;color:#0284c7;">Cá nhân</span>
        </div>
      </div>
    </div>
  \`;
}`;

// Replace the 3 functions in code
const startMarker = 'function renderHomeScreen(option) {';
const endMarker = 'function renderProfileScreen(option) {';
const afterEndMarker = 'const htmlContent = `<!DOCTYPE html>';

const startIndex = code.indexOf(startMarker);
const profileIndex = code.indexOf(endMarker);
const htmlIndex = code.indexOf(afterEndMarker);

if (startIndex === -1 || profileIndex === -1 || htmlIndex === -1) {
  console.error("Markers not found! startIndex:", startIndex, "profileIndex:", profileIndex, "htmlIndex:", htmlIndex);
  process.exit(1);
}

// Find the closing brace of renderProfileScreen before const htmlContent
const blockBeforeHtml = code.substring(0, htmlIndex);
const lastClosingBrace = blockBeforeHtml.lastIndexOf('}');

const updatedBlock = newRenderHomeScreen + '\\n\\n' + newRenderEventsScreen + '\\n\\n' + newRenderProfileScreen + '\\n\\n';

const finalCode = code.substring(0, startIndex) + updatedBlock + code.substring(lastClosingBrace + 1);

fs.writeFileSync(targetFile, finalCode, 'utf8');
console.log("Successfully patched build_ceo1983_standard_pdf.js!");
