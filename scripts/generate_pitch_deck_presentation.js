const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'document');
const EVIDENCE_DIR = path.join(OUT_DIR, 'images', 'evidence');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Executive Palette (Royal Navy, Warm Gold, Platinum White)
const C = {
  NAVY_DARK: '0A1A3A',
  NAVY_PRIMARY: '003B95',
  NAVY_CARD: '132A56',
  NAVY_HOVER: '002B70',
  GOLD_ACCENT: 'F59E0B',
  GOLD_DARK: 'D97706',
  GOLD_LIGHT: 'FEF3C7',
  GOLD_BORDER: 'FDE68A',
  BG_LIGHT: 'F8FAFC',
  WHITE: 'FFFFFF',
  BORDER_SUBTLE: 'E2E8F0',
  BORDER_FOCUS: 'CBD5E1',
  TEXT_DARK: '0F172A',
  TEXT_BODY: '334155',
  TEXT_MUTED: '64748B',
  EMERALD: '059669',
  EMERALD_BG: 'ECFDF5',
  ROSE: 'E11D48',
  ROSE_BG: 'FFF1F2',
  BLUE_BG: 'EFF6FF',
};

function getImageBase64(name) {
  const p = path.join(EVIDENCE_DIR, name);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `image/png;base64,${data.toString('base64')}`;
  }
  return null;
}

function addSlideFooter(slide, pres, isDark = false) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 7.0, w: 11.73, h: 0.02,
    fill: { color: isDark ? '2A3E66' : C.BORDER_SUBTLE }
  });
  slide.addText('Hệ Sinh Thái Chuyển Đổi Số Toàn Diện · CLB Doanh Nhân CEO 1983 · VIONE Ecosystem', {
    x: 0.8, y: 7.05, w: 7.5, h: 0.3,
    color: isDark ? '94A3B8' : C.TEXT_MUTED, fontSize: 9.5, fontFace: 'Calibri'
  });
  slide.addText('Bản Quyền © 2026 CLB Doanh Nhân CEO 1983 · HanoiBA', {
    x: 8.5, y: 7.05, w: 4.03, h: 0.3,
    color: isDark ? '94A3B8' : C.TEXT_MUTED, fontSize: 9.5, align: 'right', fontFace: 'Calibri'
  });
}

function addSlideHeader(slide, pres, eyebrow, title, subtitle, isDark = false) {
  slide.background = { color: isDark ? C.NAVY_DARK : C.BG_LIGHT };

  // Top Accent Strip
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: C.GOLD_ACCENT }
  });

  // Eyebrow badge
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.45, w: 3.2, h: 0.32,
    fill: { color: isDark ? C.GOLD_ACCENT : C.NAVY_PRIMARY },
    roundRadio: 0.08
  });
  slide.addText(eyebrow, {
    x: 0.8, y: 0.45, w: 3.2, h: 0.32,
    color: isDark ? C.NAVY_DARK : C.WHITE, bold: true, fontSize: 10, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  // Title
  slide.addText(title, {
    x: 0.8, y: 0.85, w: 11.73, h: 0.65,
    color: isDark ? C.WHITE : C.NAVY_PRIMARY, bold: true, fontSize: 22, fontFace: 'Calibri'
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.5, w: 11.73, h: 0.4,
      color: isDark ? 'CBD5E1' : C.TEXT_MUTED, fontSize: 12, italic: true, fontFace: 'Calibri'
    });
  }
}

async function buildMasterPresentation() {
  console.log('>>> Generating Master C-Level Pitch Deck (.pptx, .html, .md)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 in
  pres.title = 'Hệ Sinh Thái Chuyển Đổi Số CLB Doanh Nhân CEO 1983';
  pres.author = 'Ban Thư Ký CLB Doanh Nhân CEO 1983';
  pres.company = 'VIONE Ecosystem · HanoiBA';

  // ---------------------------------------------------------------------------
  // SLIDE 1: COVER (Dark Luxury Navy)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    slide.background = { color: C.NAVY_DARK };

    // Gold Top Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.12,
      fill: { color: C.GOLD_ACCENT }
    });

    // Badge
    slide.addShape(pres.ShapeType.rect, {
      x: 1.0, y: 1.2, w: 5.2, h: 0.4,
      fill: { color: C.NAVY_CARD },
      line: { color: C.GOLD_ACCENT, width: 1.5 },
      roundRadio: 0.1
    });
    slide.addText('HỆ SINH THÁI CHUYỂN ĐỔI SỐ TOÀN DIỆN HIỆP HỘI', {
      x: 1.0, y: 1.2, w: 5.2, h: 0.4,
      color: C.GOLD_ACCENT, bold: true, fontSize: 11, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    // Title
    slide.addText('VIONE ECOSYSTEM · CLB DOANH NHÂN CEO 1983', {
      x: 1.0, y: 1.8, w: 11.33, h: 1.1,
      color: C.WHITE, bold: true, fontSize: 32, fontFace: 'Calibri'
    });

    // Subtitle
    slide.addText('Giải pháp Quản trị Hiệp hội Tối cao & Nền tảng Kết nối Giao thương B2B Đẳng cấp Doanh nhân', {
      x: 1.0, y: 2.9, w: 11.33, h: 0.6,
      color: 'CBD5E1', fontSize: 15, fontFace: 'Calibri'
    });

    // 3 Pillar Highlights Cards
    const cards = [
      { num: '01', title: 'Web CRM Quản Trị', desc: 'Trung tâm kiểm soát dữ liệu hội viên, tài chính, sự kiện & đối soát tự động' },
      { num: '02', title: 'Mobile App Doanh Nhân', desc: 'Thẻ VIP 3D, Radar NFC, gian hàng Marketplace & mạng xã hội cơ hội B2B' },
      { num: '03', title: 'Landing Page 3D & SMTP', desc: 'Cổng thông tin đối ngoại điện ảnh, tiếp nhận & tự động cấp tài khoản qua email' },
    ];
    cards.forEach((c, idx) => {
      const x = 1.0 + idx * 3.9;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 3.8, w: 3.6, h: 2.2,
        fill: { color: C.NAVY_CARD },
        line: { color: '2A3E66', width: 1.2 },
        roundRadio: 0.12
      });
      slide.addText(c.num, {
        x: x + 0.2, y: 3.95, w: 0.8, h: 0.4,
        color: C.GOLD_ACCENT, bold: true, fontSize: 18, fontFace: 'Calibri'
      });
      slide.addText(c.title, {
        x: x + 0.2, y: 4.4, w: 3.2, h: 0.4,
        color: C.WHITE, bold: true, fontSize: 14, fontFace: 'Calibri'
      });
      slide.addText(c.desc, {
        x: x + 0.2, y: 4.85, w: 3.2, h: 0.95,
        color: '94A3B8', fontSize: 11, fontFace: 'Calibri'
      });
    });

    // Footer
    slide.addText('CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA) · ceo1983.com', {
      x: 1.0, y: 6.7, w: 11.33, h: 0.4,
      color: '64748B', fontSize: 11, italic: true, fontFace: 'Calibri'
    });
  }

  // ---------------------------------------------------------------------------
  // SLIDE 2: PAIN POINTS (Light Theme - 4 Cards)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'THỰC TRẠNG & ĐIỂM ĐAU', 'Điểm Đau Của Các Hiệp Hội & CLB Doanh Nghiệp Truyền Thống', 'Các thách thức lớn trong vận hành thủ công dẫn tới suy giảm tương tác và thất thoát nguồn lực');

    const pains = [
      { title: 'Quản Lý Rời Rạc & Thất Thoát Dữ Liệu', desc: 'Dữ liệu hội viên lưu phân tán trên nhiều file Excel, nhóm Zalo trôi bài; thông tin nhạy cảm của các CEO không được mã hóa bảo mật tập trung.' },
      { title: 'Thu Hội Phí & Kế Toán Thủ Công', desc: 'Ban Thư ký mất hàng tuần đối soát biến động số dư ngân hàng; việc nhắc nợ hội phí niên khóa thủ công dễ gây e ngại, thiếu tinh tế giữa các doanh nhân.' },
      { title: 'Sự Kiện & Hội Nghị Ùn Tắc Cổng', desc: 'Quy trình check-in bàn lễ tân dùng danh sách giấy gây xếp hàng dài; không có sơ đồ phân bổ hàng ghế VIP và thiếu công cụ biểu quyết điện tử.' },
      { title: 'Giao Thương B2B Hình Thức, Thiếu Đo Lường', desc: 'Các cuộc gặp gỡ chỉ dừng lại ở giao lưu hình thức; không có sàn niêm yết sản phẩm ưu đãi nội khối và không thể đo lường giá trị hợp đồng kết nối thực chất.' }
    ];

    pains.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.1 + row * 2.35;

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: 5.75, h: 2.15,
        fill: { color: C.WHITE },
        line: { color: C.BORDER_SUBTLE, width: 1.2 },
        roundRadio: 0.1
      });
      // Red alert indicator
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.3, y: y + 0.3, w: 0.32, h: 0.32,
        fill: { color: C.ROSE_BG },
        line: { color: C.ROSE, width: 1 },
        roundRadio: 0.05
      });
      slide.addText('✕', {
        x: x + 0.3, y: y + 0.3, w: 0.32, h: 0.32,
        color: C.ROSE, bold: true, fontSize: 13, align: 'center', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(p.title, {
        x: x + 0.75, y: y + 0.28, w: 4.8, h: 0.4,
        color: C.TEXT_DARK, bold: true, fontSize: 13.5, fontFace: 'Calibri'
      });
      slide.addText(p.desc, {
        x: x + 0.3, y: y + 0.75, w: 5.15, h: 1.25,
        color: C.TEXT_BODY, fontSize: 11.5, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 3: STRATEGIC MISSION & PURPOSE (Light Theme - 4 Strategic Pillars)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'MỤC ĐÍCH & TẦM NHÌN', 'Tôn Chỉ Hoạt Động: Gắn Kết · Chia Sẻ · Đồng Hành · Phát Triển', 'Xây dựng nền móng công nghệ vững chắc chuyển hóa hiệp hội thành tổ chức số hiện đại, thịnh vượng');

    const pillars = [
      { num: '01', title: 'Số Hóa 100% Hồ Sơ Hội Viên', desc: 'Thiết lập kho dữ liệu C-Level chuẩn hóa 360 độ: Hồ sơ pháp nhân, MST, vốn điều lệ, định danh mã hội viên độc bản duy nhất.' },
      { num: '02', title: 'Tự Động Hóa 90% Tác Vụ Thư Ký', desc: 'Tự động gửi email cấp tài khoản, tự động sinh mã VietQR Napas 247 gạch nợ hội phí, xuất báo cáo tài chính chỉ với 1 cú chạm.' },
      { num: '03', title: 'Xúc Tiến Thương Mại B2B Thực Chất', desc: 'Tạo dòng doanh thu và hợp đồng thực tế giữa 500+ doanh nghiệp thành viên qua Sàn Marketplace và Bảng tin cơ hội đầu tư.' },
      { num: '04', title: 'Nâng Tầm Vị Thế Thương Hiệu', desc: 'Đưa CLB CEO 1983 trở thành hình mẫu tiêu biểu của HanoiBA với công nghệ Thẻ thông minh NFC và ứng dụng di động độc quyền.' }
    ];

    pillars.forEach((p, idx) => {
      const x = 0.8 + idx * 2.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 2.85, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.GOLD_BORDER, width: 1.5 },
        roundRadio: 0.12
      });
      // Header badge
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.25, y: 2.35, w: 0.8, h: 0.45,
        fill: { color: C.GOLD_LIGHT },
        roundRadio: 0.08
      });
      slide.addText(p.num, {
        x: x + 0.25, y: 2.35, w: 0.8, h: 0.45,
        color: C.GOLD_DARK, bold: true, fontSize: 16, align: 'center', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(p.title, {
        x: x + 0.25, y: 2.95, w: 2.35, h: 0.75,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 14, fontFace: 'Calibri'
      });
      slide.addText(p.desc, {
        x: x + 0.25, y: 3.75, w: 2.35, h: 2.75,
        color: C.TEXT_BODY, fontSize: 11.5, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 4: ARCHITECTURE (Kiềng 3 Chân - 3 Pillars Realtime Sync)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'KIẾN TRÚC HỆ THỐNG', 'Kiến Trúc "Kiềng Ba Chân" Hoàn Hảo & Đồng Bộ Thời Gian Thực', 'Mô hình kết hợp 3 phân hệ liên thông tuyệt đối qua nền tảng PostgreSQL, Socket.io và HTTPS');

    const cols = [
      {
        title: '1. Web CRM Quản Trị',
        subtitle: 'https://14.225.217.232:5443',
        roles: 'Dành cho Ban Thư Ký & Ban Chấp Hành',
        items: [
          '• Thẩm định và phê duyệt hồ sơ doanh nghiệp 360°',
          '• Quản lý sự kiện, cấu hình vé và sơ đồ rạp chiếu Cinema Map',
          '• Điểm danh đại biểu tốc độ cao bằng mã QR tại cổng',
          '• Bảng theo dõi niên khóa hội phí & công tắc gạch nợ tự động',
          '• Kiểm duyệt Sàn B2B Marketplace & Bảng tin cơ hội',
          '• Vận hành Biểu quyết trực tiếp và Quay thưởng Lucky Draw'
        ]
      },
      {
        title: '2. Mobile App Doanh Nhân',
        subtitle: 'https://14.225.217.232:5444',
        roles: 'Dành cho 500+ Doanh Nhân C-Level',
        items: [
          '• Thẻ Hội viên VIP 3D mạ vàng & Radar NFC quét lân cận',
          '• Danh thiếp số công khai 1-chạm xuất danh bạ .vcf chuẩn',
          '• Đăng ký sự kiện: Vé miễn phí 0đ và Vé có phí VietQR',
          '• Mua bán Sàn giao thương Luxury 3 section phân trang',
          '• Nhắn tin Messenger VIP: Chat 1-1, nhóm, gửi định vị GPS',
          '• Ví lưu trữ vé Check-in và nhận thẻ vinh danh Lucky Draw'
        ]
      },
      {
        title: '3. Landing Page 3D & Email',
        subtitle: 'https://14.225.217.232:5444/landing/ceo/v1',
        roles: 'Cổng Đối Ngoại & Tiếp Nhận Hội Viên Mới',
        items: [
          '• Trải nghiệm điện ảnh 3D cuộn mượt mà giới thiệu 4 trụ cột',
          '• Tiếp nhận form đăng ký thông tin C-Level và pháp nhân MST',
          '• Tự động tạo tài khoản vione_users và sinh mật khẩu bảo mật',
          '• Gửi ngay bức Email HTML chào mừng chứa tài khoản qua SMTP',
          '• Cơ chế tra cứu tiến độ hồ sơ tự động polling mỗi 4 giây',
          '• Hướng dẫn cài đặt ứng dụng PWA trên iOS Safari & Android'
        ]
      }
    ];

    cols.forEach((c, idx) => {
      const x = 0.8 + idx * 3.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 3.8, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.NAVY_PRIMARY, width: 1.5 },
        roundRadio: 0.12
      });
      // Header
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 3.8, h: 0.8,
        fill: { color: C.NAVY_PRIMARY },
        roundRadio: 0.12
      });
      slide.addText(c.title, {
        x: x + 0.2, y: 2.15, w: 3.4, h: 0.35,
        color: C.WHITE, bold: true, fontSize: 13, fontFace: 'Calibri'
      });
      slide.addText(c.subtitle, {
        x: x + 0.2, y: 2.5, w: 3.4, h: 0.3,
        color: C.GOLD_ACCENT, fontSize: 9.5, fontFace: 'Calibri'
      });

      slide.addText(c.roles, {
        x: x + 0.2, y: 2.98, w: 3.4, h: 0.3,
        color: C.TEXT_MUTED, italic: true, fontSize: 10, fontFace: 'Calibri'
      });

      slide.addText(c.items.join('\n\n'), {
        x: x + 0.2, y: 3.35, w: 3.4, h: 3.2,
        color: C.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 5: WEB CRM DEEP DIVE (6 Cards Matrix)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'TRỤ CỘT QUẢN TRỊ 1', 'Web CRM: "Bộ Não Điều Hành" Tối Cao Của Ban Lãnh Đạo Hiệp Hội', 'Tập trung toàn quyền thẩm định, điều phối tài chính, quản lý đại biểu và bảo mật thông tin');

    const crmFeats = [
      { title: 'Quản Lý Hội Viên & Drawer 360°', desc: 'Thẩm định hồ sơ doanh nghiệp, tra cứu MST, vốn điều lệ, xem ảnh chân dung C-Level và bấm phê duyệt (Approve) kích hoạt thẻ VIP tức thì.' },
      { title: 'Quản Trị Sự Kiện & Cinema Map', desc: 'Tạo sự kiện theo template chuyên biệt, cấu hình vé 0đ hoặc có phí, thiết kế sơ đồ rạp chiếu kéo thả vị trí ghế VIP Lãnh đạo.' },
      { title: 'Check-in QR Điểm Danh Tốc Độ Cao', desc: 'Ban tổ chức dùng camera quét mã QR trên vé đại biểu; hệ thống phát âm thanh bíp xác nhận, đổi trạng thái trong 1 giây, ngăn chặn vé trùng.' },
      { title: 'Bảng Hội Phí & Công Tắc Gạch Nợ', desc: 'Theo dõi niên khóa đóng phí của từng doanh nghiệp, công tắc gạch nợ 1 chạm, tự động sinh mã VietQR Napas 247 và lưu lịch sử kế toán.' },
      { title: 'Kiểm Duyệt Marketplace & Cơ Hội B2B', desc: 'Duyệt các mặt hàng niêm yết từ App, gắn nhãn khuyến mãi nội bộ CLB, quản lý bài đăng giao thương và hỗ trợ kết nối đối tác.' },
      { title: 'Biểu Quyết Trực Tiếp & Lucky Draw', desc: 'Kích hoạt phiên bỏ phiếu đại hội đẩy trực tiếp về điện thoại hội viên, quay số may mắn #XXXX và phát lệnh chúc mừng lên màn hình LED.' }
    ];

    crmFeats.forEach((f, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 3.98;
      const y = 2.1 + row * 2.35;

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: 3.8, h: 2.15,
        fill: { color: C.WHITE },
        line: { color: C.BORDER_SUBTLE, width: 1.2 },
        roundRadio: 0.1
      });
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.25, y: y + 0.25, w: 0.12, h: 0.35,
        fill: { color: C.NAVY_PRIMARY }
      });
      slide.addText(f.title, {
        x: x + 0.45, y: y + 0.22, w: 3.15, h: 0.4,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 12.5, fontFace: 'Calibri'
      });
      slide.addText(f.desc, {
        x: x + 0.25, y: y + 0.68, w: 3.3, h: 1.35,
        color: C.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 6: MOBILE APP DEEP DIVE (4 Luxury Feature Blocks)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'TRỤ CỘT DOANH NHÂN 2', 'Mobile App: "Văn Phòng Bỏ Túi" & Thẻ Hội Viên VIP 3D', 'Trải nghiệm thượng lưu, công nghệ kết nối hiện đại và giao thương B2B không biên giới');

    const appFeats = [
      {
        title: '1. Thẻ Hội Viên VIP 3D & Radar NFC',
        desc: 'Thiết kế mạ vàng 3D hiển thị Mã định danh (M1983-007), doanh nghiệp pháp nhân và thời hạn thẻ. Tích hợp Radar quét tìm doanh nhân lân cận trong bán kính sự kiện và chạm thẻ NFC thông minh.'
      },
      {
        title: '2. Danh Thiếp Số Công Khai 1-Chạm (.vcf)',
        desc: 'Khi đối tác quét mã QR từ camera thường hoặc Zalo, mở ngay trang danh thiếp xác thực 100% khớp tài khoản thực tế. Tích hợp nút Lưu danh bạ (.vcf) xuất thẳng vào điện thoại, gọi điện, email và nhắn Zalo tức thì.'
      },
      {
        title: '3. Sàn Thương Mại Điện Tử Luxury 3 Section',
        desc: 'Giao diện E-Commerce cao cấp với 3 phân khu phân trang độc lập: Sản phẩm mới đăng, Sản phẩm xem nhiều nhất, và Gian hàng Doanh nghiệp nổi bật. Hiển thị giá ưu đãi độc quyền dành riêng cho hội viên CEO 1983.'
      },
      {
        title: '4. Tin Nhắn VIP & 5 Kênh Chính Thức',
        desc: 'Hệ thống tin nhắn phong cách Messenger cao cấp: 5 kênh truyền thông CLB, chat riêng 1-1, chat nhóm, thu hồi tin nhắn, chia sẻ định vị GPS trụ sở doanh nghiệp và thanh công cụ đính kèm tài liệu mở rộng.'
      }
    ];

    appFeats.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.1 + row * 2.35;

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: 5.75, h: 2.15,
        fill: { color: C.WHITE },
        line: { color: C.GOLD_BORDER, width: 1.2 },
        roundRadio: 0.1
      });
      slide.addText(f.title, {
        x: x + 0.3, y: y + 0.25, w: 5.15, h: 0.38,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 13.5, fontFace: 'Calibri'
      });
      slide.addText(f.desc, {
        x: x + 0.3, y: y + 0.7, w: 5.15, h: 1.35,
        color: C.TEXT_BODY, fontSize: 11, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 7: EVENT WORKFLOW - 2 CASES (Free 0đ & Paid VietQR)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'ĐỘT PHÁ TỔ CHỨC SỰ KIỆN', 'Tự Động Hóa 2 Luồng Sự Kiện: Miễn Phí (0đ) & Thu Phí VietQR', 'Quy trình khép kín từ CRM khởi tạo, App đặt vé đến Check-in cổng và quay thưởng may mắn');

    // Case 1: Free (0đ)
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 2.1, w: 5.75, h: 4.6,
      fill: { color: C.WHITE },
      line: { color: C.EMERALD, width: 1.5 },
      roundRadio: 0.12
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 2.1, w: 5.75, h: 0.6,
      fill: { color: C.EMERALD_BG },
      roundRadio: 0.12
    });
    slide.addText('CASE 1: SỰ KIỆN MIỄN PHÍ (0 ĐỒNG)', {
      x: 1.1, y: 2.2, w: 5.15, h: 0.4,
      color: C.EMERALD, bold: true, fontSize: 13, fontFace: 'Calibri'
    });
    const c1Steps = [
      '1. Khởi tạo CRM: Ban tổ chức nhập tiêu đề, tải banner 16:9, diễn giả và đặt giá vé = 0 đ.',
      '2. Đồng bộ App: Thẻ sự kiện gắn tag xanh "Miễn phí (0 đ)" hiển thị trên trang chủ và tab Sự kiện.',
      '3. Đăng ký 1-Chạm: Hội viên bấm "Đăng ký tham gia", xác nhận nhận vé không qua bước thanh toán.',
      '4. Cấp Vé Tức Thì: Sinh mã vé REG-XXXX kèm Mã QR Check-in động tại cổng hội trường.',
      '5. Tự Động Sinh Số May Mắn #XXXX: Cấp mã số quay thưởng Lucky Draw 4 chữ số vào CSDL.',
      '6. Đẩy Thông Báo & Tin Nhắn: Gửi vé chi tiết vào mục Thông báo và Hộp thư của hội viên.'
    ];
    slide.addText(c1Steps.join('\n\n'), {
      x: 1.1, y: 2.85, w: 5.15, h: 3.7,
      color: C.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
    });

    // Case 2: Paid (500k VietQR)
    slide.addShape(pres.ShapeType.rect, {
      x: 6.78, y: 2.1, w: 5.75, h: 4.6,
      fill: { color: C.WHITE },
      line: { color: C.GOLD_ACCENT, width: 1.5 },
      roundRadio: 0.12
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 6.78, y: 2.1, w: 5.75, h: 0.6,
      fill: { color: C.GOLD_LIGHT },
      roundRadio: 0.12
    });
    slide.addText('CASE 2: SỰ KIỆN THU PHÍ (VIETQR NAPAS 247)', {
      x: 7.08, y: 2.2, w: 5.15, h: 0.4,
      color: C.GOLD_DARK, bold: true, fontSize: 13, fontFace: 'Calibri'
    });
    const c2Steps = [
      '1. Khởi tạo CRM: Cấu hình giá vé (500.000 đ), số tài khoản thụ hưởng ngân hàng của CLB.',
      '2. Đồng bộ App: Thẻ sự kiện gắn tag vàng "500.000 đ / vé" kèm phân khu chỗ ngồi VIP/Standard.',
      '3. Chọn Số Lượng Vé: Hội viên chọn số vé, hệ thống tự tính tổng tiền và mở tóm tắt chi phí.',
      '4. Cổng Thanh Toán VietQR Động: Tự sinh mã QR ngân hàng chứa sẵn số tiền và cú pháp chuẩn.',
      '5. Quét Thanh Toán 3 Giây: Hội viên mở app ngân hàng quét mã, chuyển khoản nhanh Napas 247.',
      '6. Gạch Nợ & Trả Vé: CRM tự động gạch nợ sau đối soát, cấp vé có mã QR động và số may mắn.'
    ];
    slide.addText(c2Steps.join('\n\n'), {
      x: 7.08, y: 2.85, w: 5.15, h: 3.7,
      color: C.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 8: LANDING PAGE & AUTOMATED EMAIL REGISTRATION FLOW
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'CỔNG TIẾP NHẬN ĐỐI NGOẠI', 'Landing Page 3D & Luồng Đăng Ký Tự Động Gửi Email Mật Khẩu', 'Cơ chế tiếp nhận hồ sơ C-Level liền mạch từ Cổng thông tin tới hộp thư người dùng và CRM');

    const steps = [
      { step: 'Bước 1', title: 'Nộp Hồ Sơ Tại Landing Page', desc: 'Doanh nhân truy cập /landing/ceo/v1, điền form tiếp nhận C-Level (Họ tên, Năm sinh 1983, Doanh nghiệp, MST, SĐT, Email).' },
      { step: 'Bước 2', title: 'Tự Động Sinh Tài Khoản Hệ Thống', desc: 'Backend khởi tạo hồ sơ trong public.members trạng thái pending, sinh tài khoản vione_users với mật khẩu bảo mật ngẫu nhiên.' },
      { step: 'Bước 3', title: 'Gửi Email HTML Chào Mừng Tức Thì', desc: 'Giao thức SMTP tự động bắn thư chào mừng về hòm thư người đăng ký: Chứa tên đăng nhập, mật khẩu, link truy cập App và hướng dẫn PWA.' },
      { step: 'Bước 4', title: 'Ban Thư Ký Phê Duyệt Trên CRM', desc: 'Hồ sơ hiển thị trên CRM /members; Thư ký kiểm tra giấy phép ĐKKD và bấm Approve để kích hoạt đầy đủ quyền hội viên chính thức.' }
    ];

    steps.forEach((s, idx) => {
      const x = 0.8 + idx * 2.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 2.85, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.BORDER_SUBTLE, width: 1.2 },
        roundRadio: 0.1
      });
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.25, y: 2.35, w: 1.1, h: 0.4,
        fill: { color: C.NAVY_PRIMARY },
        roundRadio: 0.08
      });
      slide.addText(s.step, {
        x: x + 0.25, y: 2.35, w: 1.1, h: 0.4,
        color: C.WHITE, bold: true, fontSize: 11, align: 'center', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(s.title, {
        x: x + 0.25, y: 2.9, w: 2.35, h: 0.8,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri'
      });
      slide.addText(s.desc, {
        x: x + 0.25, y: 3.75, w: 2.35, h: 2.7,
        color: C.TEXT_BODY, fontSize: 11, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 9: PERFECT FIT FOR CEO 1983 (Why It Is Tailor-made)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'SỰ PHÙ HỢP ĐỘC BẢN', 'Tại Sao Hệ Thống Này "Đo Ni Đóng Giày" Cho CLB CEO 1983?', 'Tích hợp sâu sắc văn hóa, bản lĩnh thương trường và nhu cầu kết nối của thế hệ Doanh nhân Quý Hợi');

    const fits = [
      {
        title: 'Phong Thủy & Nhận Diện Bản Mệnh 1983',
        desc: 'Doanh nhân sinh năm 1983 mang tuổi Quý Hợi - Mệnh Đại Hải Thủy. Hệ thống áp dụng bảng màu Xanh Royal Navy tượng trưng cho biển lớn bao la kết hợp Vàng Kim Hoàng Gia, thể hiện sự chín muồi, thịnh vượng và vững chãi.'
      },
      {
        title: 'Chuẩn Hóa Mô Hình Trực Thuộc HanoiBA',
        desc: 'Cấu trúc hệ thống tích hợp đầy đủ 7 Ban chuyên trách của Hiệp Hội Doanh Nhân Trẻ Hà Nội: Ban Thư Ký, Ban Xúc Tiến Thương Mại, Ban Sự Kiện, Ban Truyền Thông, Ban Tài Chính... giúp quản trị bài bản và kế thừa lâu dài.'
      },
      {
        title: 'Tối Ưu Trải Nghiệm Lãnh Đạo C-Level',
        desc: 'Các chủ doanh nghiệp bận rộn cần giải pháp "1-Chạm": Chạm lưu danh bạ .vcf, chạm quét điểm danh sự kiện, chạm quét VietQR không cần nhập liệu số tiền hay số tài khoản, thao tác nhanh gọn trên mọi thiết bị.'
      },
      {
        title: 'Giải Quyết Nhu Cầu Giao Thương B2B Thực Chất',
        desc: '500+ doanh nghiệp thành viên đang ở độ tuổi vàng phát triển kinh tế. Sàn Marketplace và Bảng tin cơ hội giúp các thành viên ưu tiên sử dụng sản phẩm dịch vụ của nhau, giữ dòng tiền lưu chuyển nội khối bền vững.'
      }
    ];

    fits.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.1 + row * 2.35;

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: 5.75, h: 2.15,
        fill: { color: C.WHITE },
        line: { color: C.NAVY_PRIMARY, width: 1.2 },
        roundRadio: 0.1
      });
      slide.addText(f.title, {
        x: x + 0.3, y: y + 0.25, w: 5.15, h: 0.38,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 13.5, fontFace: 'Calibri'
      });
      slide.addText(f.desc, {
        x: x + 0.3, y: y + 0.7, w: 5.15, h: 1.35,
        color: C.TEXT_BODY, fontSize: 11, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 10: MEASURABLE ROI & TANGIBLE VALUE (4 Big Stat Cards)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'GIÁ TRỊ & HIỆU QUẢ VẬN HÀNH', 'Các Chỉ Số Đo Lường Thành Công (ROI) Đột Phá Sau Khi Vận Hành', 'Những con số thực tế chứng minh hiệu quả đầu tư và chuyển đổi số cho tổ chức');

    const stats = [
      { stat: '90%', label: 'Giảm Thời Gian Thủ Tục', desc: 'Cắt giảm 90% thời gian xử lý thủ tục hành chính, nộp hồ sơ, thẩm định và cấp thẻ hội viên so với phương thức giấy tờ truyền thống.' },
      { stat: '100%', label: 'Tự Động Hóa Quản Lý Phí', desc: 'Loại bỏ hoàn toàn rủi ro thất thoát tài chính và nhầm lẫn đối soát; tự động hóa nhắc nợ và gạch nợ qua cổng VietQR Napas 247.' },
      { stat: '1 Giây', label: 'Tốc Độ Check-in Cổng', desc: 'Đón tiếp và điểm danh 500 - 1.000 đại biểu tham dự đại hội mượt mà trong 1 giây/khách, xóa bỏ hoàn toàn cảnh ùn tắc bàn lễ tân.' },
      { stat: '> 5 Tỷ', label: 'Giá Trị Giao Thương B2B', desc: 'Dự kiến thúc đẩy trên 5 tỷ đồng giá trị hợp đồng kết nối thương mại nội bộ thành công trong năm đầu tiên vận hành Sàn Marketplace.' }
    ];

    stats.forEach((s, idx) => {
      const x = 0.8 + idx * 2.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 2.85, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.GOLD_BORDER, width: 1.5 },
        roundRadio: 0.12
      });
      // Stat box
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.2, y: 2.35, w: 2.45, h: 1.1,
        fill: { color: C.BLUE_BG },
        roundRadio: 0.08
      });
      slide.addText(s.stat, {
        x: x + 0.2, y: 2.4, w: 2.45, h: 0.65,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 26, align: 'center', fontFace: 'Calibri'
      });
      slide.addText(s.label, {
        x: x + 0.2, y: 3.05, w: 2.45, h: 0.35,
        color: C.GOLD_DARK, bold: true, fontSize: 11, align: 'center', fontFace: 'Calibri'
      });
      slide.addText(s.desc, {
        x: x + 0.25, y: 3.65, w: 2.35, h: 2.85,
        color: C.TEXT_BODY, fontSize: 11.5, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 11: LIVE SHOWCASE (Real Evidence Frames)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'CHỨNG MINH THỰC TẾ', 'Hệ Thống Đã Được Triển Khai Hoàn Chỉnh Trên Môi Trường Live HTTPS', 'Toàn bộ giao diện và luồng nghiệp vụ đã được kiểm thử và xác thực hoạt động ổn định');

    const frames = [
      {
        title: 'Web CRM Quản Trị Trung Tâm',
        desc: 'Dashboard KPI điều hành, quản lý hội viên, duyệt bài Marketplace và cấu hình sự kiện trực quan.',
        img: getImageBase64('crm_02_dashboard_kpi.png')
      },
      {
        title: 'Thẻ Hội Viên VIP & Danh Thiếp 3D',
        desc: 'Thẻ mạ vàng 3D và danh thiếp số công khai hiển thị chính xác tài khoản thực tế (M1983-007 - Lê Hoàng Long).',
        img: getImageBase64('sub_16_app_card_public_verified.png')
      },
      {
        title: 'Sàn B2B & Vé Sự Kiện Check-in',
        desc: 'Sàn giao thương Luxury 3 section phân trang và vé Pass điện tử kèm mã QR check-in & số may mắn #XXXX.',
        img: getImageBase64('sub_31_app_event_ticket_pass.png')
      }
    ];

    frames.forEach((f, idx) => {
      const x = 0.8 + idx * 3.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 3.8, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.BORDER_SUBTLE, width: 1.2 },
        roundRadio: 0.1
      });
      slide.addText(f.title, {
        x: x + 0.2, y: 2.25, w: 3.4, h: 0.35,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri'
      });
      slide.addText(f.desc, {
        x: x + 0.2, y: 2.6, w: 3.4, h: 0.65,
        color: C.TEXT_MUTED, fontSize: 10, fontFace: 'Calibri'
      });

      // Embed image if available
      if (f.img) {
        slide.addImage({
          data: f.img,
          x: x + 0.2, y: 3.3, w: 3.4, h: 3.2,
          sizing: { type: 'contain' }
        });
      } else {
        slide.addShape(pres.ShapeType.rect, {
          x: x + 0.2, y: 3.3, w: 3.4, h: 3.2,
          fill: { color: C.BG_LIGHT },
          line: { color: C.BORDER_SUBTLE }
        });
        slide.addText('[Live HTTPS Screenshot]', {
          x: x + 0.2, y: 4.6, w: 3.4, h: 0.4,
          color: C.TEXT_MUTED, align: 'center', fontSize: 11
        });
      }
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 12: FUTURE ROADMAP 2026 - 2028 (Horizontal Timeline)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, pres, 'LỘ TRÌNH PHÁT TRIỂN', 'Chiến Lược Mở Rộng 2026 - 2028: Hướng Tới Liên Minh Hiệp Hội Số', 'Không chỉ dừng lại ở CLB CEO 1983, hệ thống sẵn sàng mở rộng thành mạng lưới giao thương liên kết');

    const phases = [
      {
        phase: 'GIAI ĐOẠN 1 (2026)',
        title: 'Chuẩn Hóa & Vận Hành Bền Vững',
        items: [
          '• Số hóa toàn bộ 500+ doanh nghiệp CLB CEO 1983',
          '• Vận hành trơn tru CRM quản trị & Mobile App PWA',
          '• Tự động hóa 100% các kỳ sự kiện và thu phí VietQR',
          '• Đồng bộ danh thiếp số công khai hỗ trợ lưu danh bạ'
        ]
      },
      {
        phase: 'GIAI ĐOẠN 2 (2026 - 2027)',
        title: 'Trí Tuệ Nhân Tạo & Thẻ Vật Lý NFC',
        items: [
          '• Tích hợp AI Smart Matching: Gợi ý đối tác kinh doanh tự động dựa trên ngành nghề, doanh thu và nhu cầu đầu tư',
          '• Cổng thanh toán ngân hàng tự động đối soát liên ngân hàng',
          '• Phát hành thẻ vật lý kim loại gắn chip NFC mạ vàng cao cấp'
        ]
      },
      {
        phase: 'GIAI ĐOẠN 3 (2027 - 2028)',
        title: 'Liên Minh Hiệp Hội Số (Federated Network)',
        items: [
          '• Mở rộng mô hình tới các CLB Doanh nhân trực thuộc HanoiBA',
          '• Kết nối mạng lưới giao thương liên hiệp hội YBA, BNI toàn quốc',
          '• Sàn xúc tiến thương mại quốc tế kết nối doanh nghiệp kiều bào'
        ]
      }
    ];

    phases.forEach((p, idx) => {
      const x = 0.8 + idx * 3.98;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 3.8, h: 4.6,
        fill: { color: C.WHITE },
        line: { color: C.NAVY_PRIMARY, width: 1.2 },
        roundRadio: 0.12
      });
      // Phase Pill
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.25, y: 2.35, w: 2.2, h: 0.35,
        fill: { color: idx === 0 ? C.NAVY_PRIMARY : (idx === 1 ? C.GOLD_ACCENT : C.EMERALD) },
        roundRadio: 0.08
      });
      slide.addText(p.phase, {
        x: x + 0.25, y: 2.35, w: 2.2, h: 0.35,
        color: C.WHITE, bold: true, fontSize: 10, align: 'center', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(p.title, {
        x: x + 0.25, y: 2.85, w: 3.3, h: 0.7,
        color: C.NAVY_PRIMARY, bold: true, fontSize: 13.5, fontFace: 'Calibri'
      });
      slide.addText(p.items.join('\n\n'), {
        x: x + 0.25, y: 3.65, w: 3.3, h: 2.85,
        color: C.TEXT_BODY, fontSize: 11, fontFace: 'Calibri'
      });
    });

    addSlideFooter(slide, pres);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 13: CONCLUSION & CALL TO ACTION (Dark Theme CTA)
  // ---------------------------------------------------------------------------
  {
    const slide = pres.addSlide();
    slide.background = { color: C.NAVY_DARK };

    // Gold Top Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.12,
      fill: { color: C.GOLD_ACCENT }
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 1.0, y: 1.0, w: 4.0, h: 0.35,
      fill: { color: C.NAVY_CARD },
      line: { color: C.GOLD_ACCENT, width: 1.2 },
      roundRadio: 0.08
    });
    slide.addText('CAM KẾT ĐỒNG HÀNH CHIẾN LƯỢC', {
      x: 1.0, y: 1.0, w: 4.0, h: 0.35,
      color: C.GOLD_ACCENT, bold: true, fontSize: 10.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('Tiên Phong Kiến Tạo Cộng Đồng Doanh Nhân Số Thịnh Vượng', {
      x: 1.0, y: 1.5, w: 11.33, h: 0.8,
      color: C.WHITE, bold: true, fontSize: 28, fontFace: 'Calibri'
    });

    slide.addText('Hệ thống VIONE Ecosystem sẵn sàng đồng hành cùng Ban Chấp Hành CLB Doanh Nhân CEO 1983 tạo nên bước chuyển mình lịch sử', {
      x: 1.0, y: 2.3, w: 11.33, h: 0.5,
      color: 'CBD5E1', fontSize: 14, italic: true, fontFace: 'Calibri'
    });

    // 3 Commitment Cards
    const comms = [
      { title: 'Sẵn Sàng Triển Khai Ngay 100%', desc: 'Hệ thống đã hoàn thiện mã nguồn và đang chạy ổn định trên hạ tầng HTTPS an toàn bảo mật cao.' },
      { title: 'Đào Tạo & Chuyển Giao Tận Tâm', desc: 'Tài liệu hướng dẫn sử dụng chi tiết (Word/PDF/Video), hỗ trợ trực tiếp Ban Thư ký vận hành trơn tru.' },
      { title: 'Bảo Hành & Nâng Cấp Liên Tục', desc: 'Cam kết hỗ trợ kỹ thuật 24/7, định kỳ nâng cấp tính năng mới và tối ưu hóa hiệu năng theo sự phát triển của CLB.' }
    ];

    comms.forEach((c, idx) => {
      const x = 1.0 + idx * 3.9;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 3.1, w: 3.6, h: 2.2,
        fill: { color: C.NAVY_CARD },
        line: { color: '2A3E66', width: 1.2 },
        roundRadio: 0.12
      });
      slide.addText(c.title, {
        x: x + 0.25, y: 3.35, w: 3.1, h: 0.5,
        color: C.GOLD_ACCENT, bold: true, fontSize: 14, fontFace: 'Calibri'
      });
      slide.addText(c.desc, {
        x: x + 0.25, y: 3.9, w: 3.1, h: 1.25,
        color: '94A3B8', fontSize: 11.5, fontFace: 'Calibri'
      });
    });

    // Live Access Box
    slide.addShape(pres.ShapeType.rect, {
      x: 1.0, y: 5.6, w: 11.33, h: 1.0,
      fill: { color: C.GOLD_ACCENT },
      roundRadio: 0.1
    });
    slide.addText('TRẢI NGHIỆM HỆ THỐNG TRỰC TIẾP TẠI CÁC ĐỊA CHỈ HTTPS:', {
      x: 1.2, y: 5.7, w: 10.93, h: 0.35,
      color: C.NAVY_DARK, bold: true, fontSize: 11, fontFace: 'Calibri'
    });
    slide.addText('• Web CRM: https://14.225.217.232:5443   |   • App Hiệp Hội: https://14.225.217.232:5444   |   • Landing 3D: /landing/ceo/v1', {
      x: 1.2, y: 6.05, w: 10.93, h: 0.45,
      color: C.NAVY_PRIMARY, bold: true, fontSize: 12.5, fontFace: 'Calibri'
    });

    addSlideFooter(slide, pres, true);
  }

  // Save PPTX
  const pptxPath = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.pptx');
  await pres.writeFile({ fileName: pptxPath });
  console.log(`✓ Generated Master PowerPoint Pitch Deck -> ${pptxPath}`);

  // ---------------------------------------------------------------------------
  // GENERATE MARKDOWN VERSION (.md)
  // ---------------------------------------------------------------------------
  const mdContent = `# BỘ SLIDE THUYẾT TRÌNH C-LEVEL: HỆ SINH THÁI CHUYỂN ĐỔI SỐ CLB DOANH NHÂN CEO 1983
**Dự án:** VIONE Ecosystem · **Đơn vị:** CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)  
**Tài liệu Pitching:** 13 Slide chuyên đề giới thiệu sản phẩm, mục đích, tính năng, sự phù hợp và lộ trình phát triển.

---

### SLIDE 1: BÌA GIỚI THIỆU HỆ SINH THÁI CHUYỂN ĐỔI SỐ CLB DOANH NHÂN CEO 1983
- **Tiêu đề lớn:** VIONE ECOSYSTEM · CLB DOANH NHÂN CEO 1983
- **Phụ đề:** Giải pháp Quản trị Hiệp hội Tối cao & Nền tảng Kết nối Giao thương B2B Đẳng cấp Doanh nhân.
- **3 Phân hệ cốt lõi:**
  1. Web CRM Quản trị tập trung (Điều hành dữ liệu, tài chính, sự kiện và kiểm duyệt).
  2. Mobile App Doanh nhân VIP (Thẻ VIP 3D mạ vàng, Radar NFC, sàn Marketplace và chat Messenger).
  3. Cổng Landing Page 3D (Cổng đối ngoại, tiếp nhận hồ sơ C-Level và tự động gửi email tài khoản).
- **Đơn vị chủ quản:** CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA).

---

### SLIDE 2: THỰC TRẠNG & ĐIỂM ĐAU QUẢN TRỊ HIỆP HỘI TRUYỀN THỐNG
- **1. Quản lý rời rạc & Thất thoát dữ liệu:** Dữ liệu hội viên lưu phân tán trên nhiều file Excel, nhóm Zalo trôi tin; không có hệ thống mã hóa bảo mật thông tin C-Level.
- **2. Thu hội phí & Kế toán thủ công:** Mất hàng tuần đối soát biến động số dư ngân hàng; việc nhắc nợ niên khóa thủ công dễ gây e ngại, thiếu tinh tế giữa các doanh nhân.
- **3. Sự kiện & Hội nghị ùn tắc cổng:** Quy trình đón tiếp check-in bằng danh sách giấy gây xếp hàng dài; không có sơ đồ phân bổ ghế VIP và thiếu công cụ biểu quyết điện tử.
- **4. Giao thương B2B hình thức, thiếu đo lường:** Các cuộc gặp gỡ chỉ dừng lại ở giao lưu xã giao; không có sàn niêm yết sản phẩm ưu đãi nội khối và không đo lường được giá trị kết nối thực chất.

---

### SLIDE 3: MỤC ĐÍCH & TẦM NHÌN: GẮN KẾT - CHIA SẺ - ĐỒNG HÀNH - PHÁT TRIỂN
- **1. Số hóa 100% hồ sơ hội viên:** Thiết lập một nguồn dữ liệu duy nhất (Single Source of Truth) quản trị hồ sơ pháp nhân, MST, vốn điều lệ và mã định danh độc bản.
- **2. Tự động hóa 90% tác vụ Thư ký:** Tự động gửi email cấp tài khoản, tự sinh mã VietQR Napas 247 gạch nợ hội phí, xuất báo cáo tài chính chỉ với 1 click.
- **3. Xúc tiến thương mại B2B thực chất:** Tạo doanh số và hợp đồng thực tế giữa 500+ doanh nghiệp thành viên qua Sàn Marketplace và Bảng tin cơ hội đầu tư.
- **4. Nâng tầm vị thế thương hiệu:** Đưa CLB CEO 1983 trở thành hình mẫu chuyển đổi số tiên phong của HanoiBA với công nghệ Thẻ thông minh NFC và ứng dụng di động độc quyền.

---

### SLIDE 4: KIẾN TRÚC HỆ SINH THÁI "KIỀNG BA CHÂN" ĐỒNG BỘ THỜI GIAN THỰC
- **Trụ cột 1: Web CRM Quản trị (https://14.225.217.232:5443):**
  Thẩm định và phê duyệt hội viên 360°, quản lý sự kiện, sơ đồ rạp chiếu Cinema Map, quét QR điểm danh cổng, theo dõi hội phí và kiểm duyệt sàn B2B.
- **Trụ cột 2: Mobile App Doanh nhân (https://14.225.217.232:5444):**
  Thẻ Hội viên VIP 3D, Radar NFC, Danh thiếp số công khai lưu danh bạ 1-chạm (.vcf), đặt vé sự kiện (0đ và VietQR), mua bán Marketplace và chat Messenger VIP.
- **Trụ cột 3: Cổng Landing Page 3D & Email (https://14.225.217.232:5444/landing/ceo/v1):**
  Trải nghiệm điện ảnh 3D cuộn mượt mà, tiếp nhận form đăng ký C-Level, tự động tạo tài khoản vione_users, tự động gửi HTML Welcome Email qua SMTP và tra cứu hồ sơ tự động polling mỗi 4 giây.

---

### SLIDE 5: TRỤ CỘT 1 - WEB CRM: "BỘ NÃO ĐIỀU HÀNH" TỐI CAO
- **1. Quản lý Hội viên & Drawer 360°:** Thẩm định hồ sơ doanh nghiệp, tra cứu MST, xem ảnh chân dung C-Level và bấm Phê duyệt (Approve) kích hoạt thẻ VIP tức thì.
- **2. Quản trị Sự kiện & Cinema Seating Map:** Tạo sự kiện theo mẫu template chuyên biệt, cấu hình vé 0đ hoặc có phí, thiết kế sơ đồ rạp chiếu kéo thả vị trí ghế VIP Lãnh đạo.
- **3. Check-in QR Điểm danh Tốc độ cao:** Ban tổ chức dùng camera quét mã QR trên vé đại biểu; âm thanh bíp xác nhận, đổi trạng thái trong 1 giây, ngăn chặn vé trùng.
- **4. Bảng Hội phí & Công tắc Gạch nợ:** Theo dõi niên khóa đóng phí, công tắc gạch nợ 1 chạm, tự động sinh mã VietQR Napas 247 và lưu lịch sử kế toán.
- **5. Kiểm duyệt Marketplace & Cơ hội B2B:** Duyệt sản phẩm từ App, gắn nhãn khuyến mãi nội bộ CLB, quản lý bài đăng giao thương và hỗ trợ kết nối đối tác.
- **6. Biểu quyết Trực tiếp & Lucky Draw:** Kích hoạt phiên bỏ phiếu đại hội đẩy trực tiếp về điện thoại hội viên, quay số may mắn #XXXX và phát lệnh chúc mừng lên màn hình LED.

---

### SLIDE 6: TRỤ CỘT 2 - MOBILE APP: "VĂN PHÒNG BỎ TÚI" & THẺ VIP 3D
- **1. Thẻ Hội viên VIP 3D & Radar NFC:** Thiết kế mạ vàng 3D hiển thị Mã định danh (M1983-007), doanh nghiệp pháp nhân và hạn thẻ. Tích hợp Radar quét tìm doanh nhân lân cận trong bán kính sự kiện và chạm thẻ NFC thông minh.
- **2. Danh thiếp số công khai 1-chạm (.vcf):** Khi đối tác quét mã QR từ camera thường hoặc Zalo, mở ngay trang danh thiếp xác thực 100% khớp tài khoản thực tế. Tích hợp nút Lưu danh bạ (.vcf) xuất thẳng vào điện thoại, gọi điện, email và nhắn Zalo tức thì.
- **3. Sàn Thương mại điện tử Luxury 3 Section:** Giao diện E-Commerce cao cấp với 3 phân khu phân trang độc lập: Sản phẩm mới đăng, Sản phẩm xem nhiều nhất, và Gian hàng Doanh nghiệp nổi bật. Hiển thị giá ưu đãi độc quyền dành riêng cho hội viên CEO 1983.
- **4. Tin nhắn VIP & 5 Kênh chính thức:** Hệ thống tin nhắn phong cách Messenger cao cấp: 5 kênh truyền thông CLB, chat riêng 1-1, chat nhóm, thu hồi tin nhắn, chia sẻ định vị GPS trụ sở doanh nghiệp và thanh công cụ đính kèm tài liệu mở rộng.

---

### SLIDE 7: CHUYÊN ĐỀ SỰ KIỆN: TỰ ĐỘNG HÓA 2 LUỒNG MIỄN PHÍ (0Đ) & THU PHÍ VIETQR
- **Case 1: Sự kiện Miễn phí (0 đồng) (Đặc quyền hội viên):**
  - Khởi tạo CRM: Đặt giá vé = 0 đ, nhập lịch trình và diễn giả C-Level.
  - Đồng bộ App: Thẻ sự kiện gắn tag xanh "Miễn phí (0 đ)".
  - Đăng ký 1-chạm: Hội viên bấm đăng ký, xác nhận nhận vé không qua thanh toán.
  - Cấp Vé tức thì: Sinh mã vé REG-XXXX kèm Mã QR Check-in động tại cổng hội trường.
  - Tự động sinh số may mắn #XXXX: Cấp mã số quay thưởng Lucky Draw 4 chữ số vào CSDL.
  - Đẩy Thông báo & Tin nhắn: Gửi vé chi tiết vào mục Thông báo và Hộp thư của hội viên.
- **Case 2: Sự kiện Thu phí (500.000đ) (VietQR Napas 247):**
  - Khởi tạo CRM: Cấu hình giá vé (500.000 đ), số tài khoản ngân hàng thụ hưởng của CLB.
  - Đồng bộ App: Thẻ sự kiện gắn tag vàng "500.000 đ / vé" kèm phân khu chỗ ngồi VIP/Standard.
  - Chọn số lượng vé: Hội viên chọn số vé, hệ thống tự tính tổng tiền và mở tóm tắt chi phí.
  - Cổng thanh toán VietQR động: Tự sinh mã QR ngân hàng chứa sẵn số tiền và cú pháp chuẩn.
  - Quét thanh toán 3 giây: Hội viên mở app ngân hàng quét mã, chuyển khoản nhanh Napas 247.
  - Gạch nợ & Trả vé: CRM tự động gạch nợ sau đối soát, cấp vé có mã QR động và số may mắn.

---

### SLIDE 8: CỔNG TIẾP NHẬN LANDING PAGE 3D & LUỒNG ONBOARDING EMAIL TỰ ĐỘNG
- **Bước 1: Nộp hồ sơ tại Landing Page:** Doanh nhân truy cập /landing/ceo/v1, điền form tiếp nhận C-Level (Họ tên, Năm sinh 1983, Doanh nghiệp, MST, SĐT, Email).
- **Bước 2: Tự động sinh tài khoản hệ thống:** Backend khởi tạo hồ sơ trong public.members trạng thái pending, sinh tài khoản vione_users với mật khẩu bảo mật ngẫu nhiên.
- **Bước 3: Gửi email HTML chào mừng tức thì:** Giao thức SMTP tự động bắn thư chào mừng về hòm thư người đăng ký: Chứa tên đăng nhập, mật khẩu, link truy cập App và hướng dẫn PWA.
- **Bước 4: Ban Thư ký phê duyệt trên CRM:** Hồ sơ hiển thị trên CRM /members; Thư ký kiểm tra giấy phép ĐKKD và bấm Approve để kích hoạt đầy đủ quyền hội viên chính thức.

---

### SLIDE 9: TẠI SAO HỆ THỐNG NÀY "ĐO NI ĐÓNG GIÀY" HOÀN HẢO CHO CLB CEO 1983?
- **1. Phong thủy & Nhận diện bản mệnh 1983:** Doanh nhân sinh năm 1983 mang tuổi Quý Hợi - Mệnh Đại Hải Thủy. Hệ thống áp dụng bảng màu Xanh Royal Navy tượng trưng cho biển lớn bao la kết hợp Vàng Kim Hoàng Gia, thể hiện sự chín muồi, thịnh vượng và vững chãi.
- **2. Chuẩn hóa mô hình trực thuộc HanoiBA:** Cấu trúc hệ thống tích hợp đầy đủ 7 Ban chuyên trách của Hiệp Hội Doanh Nhân Trẻ Hà Nội: Ban Thư Ký, Ban Xúc Tiến Thương Mại, Ban Sự Kiện, Ban Truyền Thông, Ban Tài Chính...
- **3. Tối ưu trải nghiệm lãnh đạo C-Level:** Các chủ doanh nghiệp bận rộn cần giải pháp "1-Chạm": Chạm lưu danh bạ .vcf, chạm quét điểm danh sự kiện, chạm quét VietQR không cần nhập liệu số tiền hay số tài khoản, thao tác nhanh gọn trên mọi thiết bị.
- **4. Giải quyết nhu cầu giao thương B2B thực chất:** 500+ doanh nghiệp thành viên đang ở độ tuổi vàng phát triển kinh tế. Sàn Marketplace và Bảng tin cơ hội giúp các thành viên ưu tiên sử dụng sản phẩm dịch vụ của nhau, giữ dòng tiền lưu chuyển nội khối bền vững.

---

### SLIDE 10: HIỆU QUẢ ĐO LƯỜNG ĐƯỢC (MEASURABLE ROI) SAU KHI VẬN HÀNH
- **90% Giảm thời gian thủ tục:** Cắt giảm 90% thời gian xử lý thủ tục hành chính, nộp hồ sơ, thẩm định và cấp thẻ hội viên so với phương thức giấy tờ truyền thống.
- **100% Tự động hóa quản lý phí:** Loại bỏ hoàn toàn rủi ro thất thoát tài chính và nhầm lẫn đối soát; tự động hóa nhắc nợ và gạch nợ qua cổng VietQR Napas 247.
- **1 Giây Tốc độ check-in cổng:** Đón tiếp và điểm danh 500 - 1.000 đại biểu tham dự đại hội mượt mà trong 1 giây/khách, xóa bỏ hoàn toàn cảnh ùn tắc bàn lễ tân.
- **> 5 Tỷ Giá trị giao thương B2B:** Dự kiến thúc đẩy trên 5 tỷ đồng giá trị hợp đồng kết nối thương mại nội bộ thành công trong năm đầu tiên vận hành Sàn Marketplace.

---

### SLIDE 11: TRỰC QUAN HÓA HỆ SINH THÁI THỰC TẾ QUA ẢNH CHỤP LIVE HTTPS
- **Khung 1: Web CRM Quản trị trung tâm:** Dashboard KPI điều hành, quản lý danh bạ hội viên, duyệt bài Marketplace và cấu hình sự kiện trực quan.
- **Khung 2: Thẻ Hội viên VIP & Danh thiếp 3D:** Thẻ mạ vàng 3D và danh thiếp số công khai hiển thị chính xác tài khoản thực tế (M1983-007 - Lê Hoàng Long - Tổng Thư Ký).
- **Khung 3: Sàn B2B & Vé Sự kiện Check-in:** Sàn giao thương Luxury 3 section phân trang và vé Pass điện tử kèm mã QR check-in & số may mắn #XXXX.

---

### SLIDE 12: LỘ TRÌNH NÂNG CẤP & CHIẾN LƯỢC MỞ RỘNG 2026 - 2028
- **Giai đoạn 1 (2026) - Chuẩn hóa & Vận hành bền vững:** Số hóa toàn bộ 500+ doanh nghiệp CLB CEO 1983; vận hành trơn tru CRM quản trị & Mobile App PWA; tự động hóa 100% các kỳ sự kiện và thu phí VietQR.
- **Giai đoạn 2 (2026 - 2027) - Trí tuệ nhân tạo & Thẻ vật lý NFC:** Tích hợp AI Smart Matching (Gợi ý đối tác kinh doanh tự động dựa trên ngành nghề, doanh thu và nhu cầu đầu tư); Cổng thanh toán ngân hàng tự động đối soát liên ngân hàng; Phát hành thẻ vật lý kim loại gắn chip NFC mạ vàng cao cấp.
- **Giai đoạn 3 (2027 - 2028) - Liên minh Hiệp hội Số (Federated Network):** Mở rộng mô hình tới các CLB Doanh nhân trực thuộc HanoiBA; kết nối mạng lưới giao thương liên hiệp hội YBA, BNI toàn quốc; Sàn xúc tiến thương mại quốc tế kết nối doanh nghiệp kiều bào.

---

### SLIDE 13: LỜI KẾT, CAM KẾT TRIỂN KHAI & KÊU GỌI HÀNH ĐỘNG (CTA)
- **Tiên phong kiến tạo cộng đồng doanh nhân số thịnh vượng:** Hệ thống VIONE Ecosystem sẵn sàng đồng hành cùng Ban Chấp Hành CLB Doanh Nhân CEO 1983 tạo nên bước chuyển mình lịch sử.
- **3 Cam kết chất lượng:**
  1. Sẵn sàng triển khai ngay 100% (Mã nguồn đã hoàn thiện, vận hành ổn định trên hạ tầng HTTPS an toàn).
  2. Đào tạo & Chuyển giao tận tâm (Tài liệu hướng dẫn sử dụng chi tiết Word/PDF, hỗ trợ Ban Thư ký).
  3. Bảo hành & Nâng cấp liên tục (Hỗ trợ kỹ thuật 24/7, định kỳ nâng cấp tính năng mới).
- **Trải nghiệm trực tiếp tại các địa chỉ HTTPS:**
  - Web CRM Quản trị: https://14.225.217.232:5443
  - App Hiệp hội Doanh nhân: https://14.225.217.232:5444
  - Cổng Landing Page 3D: https://14.225.217.232:5444/landing/ceo/v1
`;
  const mdPath = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`✓ Generated Master Markdown Pitch Deck -> ${mdPath}`);

  // ---------------------------------------------------------------------------
  // GENERATE INTERACTIVE HTML PRESENTATION (.html)
  // ---------------------------------------------------------------------------
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slide Thuyết Trình C-Level · Hệ Sinh Thái Chuyển Đổi Số CEO 1983</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy-dark: #0A1A3A;
      --navy-primary: #003B95;
      --navy-card: #132A56;
      --gold-accent: #F59E0B;
      --gold-dark: #D97706;
      --gold-light: #FEF3C7;
      --bg-light: #F8FAFC;
      --text-dark: #0F172A;
      --text-body: #334155;
      --text-muted: #64748B;
      --border-color: #E2E8F0;
      --emerald: #059669;
      --rose: #E11D48;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #020714;
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .deck-container {
      width: 100%;
      max-width: 1200px;
      aspect-ratio: 16 / 9;
      background: var(--bg-light);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .slide {
      display: none;
      width: 100%;
      height: 100%;
      padding: 40px 50px 30px;
      flex-direction: column;
      position: relative;
    }
    .slide.active { display: flex; }
    .slide.dark-theme {
      background: var(--navy-dark);
      color: #FFFFFF;
    }
    .top-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: var(--gold-accent);
    }
    .eyebrow {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .eyebrow.blue { background: var(--navy-primary); color: #fff; }
    .eyebrow.gold { background: var(--gold-accent); color: var(--navy-dark); }
    .slide-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--navy-primary);
      line-height: 1.25;
      margin-bottom: 4px;
    }
    .dark-theme .slide-title { color: #FFFFFF; }
    .slide-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      font-style: italic;
      margin-bottom: 24px;
    }
    .dark-theme .slide-subtitle { color: #94A3B8; }
    .content-area {
      flex: 1;
      display: grid;
      gap: 16px;
      align-items: stretch;
    }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .grid-2x2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
    .grid-3x2 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); }

    .card {
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .dark-theme .card {
      background: var(--navy-card);
      border-color: #2A3E66;
      color: #FFFFFF;
    }
    .card-num {
      font-size: 20px;
      font-weight: 800;
      color: var(--gold-accent);
      margin-bottom: 6px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .dark-theme .card-title { color: #FFFFFF; }
    .card-desc {
      font-size: 12px;
      color: var(--text-body);
      line-height: 1.5;
    }
    .dark-theme .card-desc { color: #94A3B8; }

    .stat-box {
      font-size: 32px;
      font-weight: 800;
      color: var(--navy-primary);
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--gold-dark);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .slide-footer {
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
    }
    .dark-theme .slide-footer { border-color: #2A3E66; color: #64748B; }

    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin-top: 15px;
      color: #FFFFFF;
      font-size: 14px;
    }
    .btn-nav {
      background: var(--navy-primary);
      border: 1px solid var(--gold-accent);
      color: #FFFFFF;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-nav:hover {
      background: var(--gold-accent);
      color: var(--navy-dark);
    }
    .dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #334155;
      cursor: pointer;
    }
    .dot.active { background: var(--gold-accent); width: 22px; border-radius: 5px; }
  </style>
</head>
<body>

  <div class="deck-container" id="deckContainer">
    <!-- SLIDE 1 -->
    <div class="slide dark-theme active" data-slide="1">
      <div class="top-accent"></div>
      <div style="margin-top: 30px;">
        <span class="eyebrow gold">HỆ SINH THÁI CHUYỂN ĐỔI SỐ HIỆP HỘI DOANH NGHIỆP</span>
        <h1 class="slide-title" style="font-size: 34px; margin-top: 10px;">VIONE ECOSYSTEM · CLB DOANH NHÂN CEO 1983</h1>
        <p class="slide-subtitle" style="font-size: 16px; margin-top: 6px;">Giải pháp Quản trị Hiệp hội Tối cao & Nền tảng Kết nối Giao thương B2B Đẳng cấp Doanh nhân</p>
      </div>
      <div class="content-area grid-3" style="margin-top: 20px;">
        <div class="card">
          <div class="card-num">01</div>
          <div class="card-title">Web CRM Quản Trị</div>
          <div class="card-desc">Trung tâm kiểm soát dữ liệu hội viên 360°, đối soát tài chính, sơ đồ rạp chiếu sự kiện và gạch nợ tự động qua VietQR.</div>
        </div>
        <div class="card">
          <div class="card-num">02</div>
          <div class="card-title">Mobile App Doanh Nhân</div>
          <div class="card-desc">Thẻ VIP 3D mạ vàng, Radar NFC quét lân cận, sàn Marketplace Luxury và mạng xã hội chia sẻ cơ hội B2B kèm định vị GPS.</div>
        </div>
        <div class="card">
          <div class="card-num">03</div>
          <div class="card-title">Landing Page 3D & SMTP</div>
          <div class="card-desc">Cổng đối ngoại điện ảnh, tiếp nhận form C-Level và tự động kích hoạt tài khoản gửi mật khẩu qua email SMTP tức thì.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 1 / 13</span>
      </div>
    </div>

    <!-- SLIDE 2 -->
    <div class="slide" data-slide="2">
      <div class="top-accent"></div>
      <span class="eyebrow blue">THỰC TRẠNG & ĐIỂM ĐAU</span>
      <h2 class="slide-title">Điểm Đau Của Các Hiệp Hội & CLB Doanh Nghiệp Truyền Thống</h2>
      <p class="slide-subtitle">Các thách thức lớn trong vận hành thủ công dẫn tới suy giảm tương tác và thất thoát nguồn lực</p>
      <div class="content-area grid-2x2">
        <div class="card" style="border-left: 4px solid var(--rose);">
          <div class="card-title" style="color: var(--rose);">✕ Quản Lý Rời Rạc & Thất Thoát Dữ Liệu</div>
          <div class="card-desc">Dữ liệu hội viên lưu phân tán trên nhiều file Excel, nhóm Zalo trôi tin; thông tin nhạy cảm của các CEO không được mã hóa bảo mật tập trung.</div>
        </div>
        <div class="card" style="border-left: 4px solid var(--rose);">
          <div class="card-title" style="color: var(--rose);">✕ Thu Hội Phí & Kế Toán Thủ Công</div>
          <div class="card-desc">Ban Thư ký mất hàng tuần đối soát biến động số dư ngân hàng; việc nhắc nợ niên khóa thủ công dễ gây e ngại, thiếu tinh tế giữa các doanh nhân.</div>
        </div>
        <div class="card" style="border-left: 4px solid var(--rose);">
          <div class="card-title" style="color: var(--rose);">✕ Sự Kiện & Hội Nghị Ùn Tắc Cổng</div>
          <div class="card-desc">Quy trình check-in bàn lễ tân dùng danh sách giấy gây xếp hàng dài; không có sơ đồ phân bổ ghế VIP và thiếu công cụ biểu quyết điện tử.</div>
        </div>
        <div class="card" style="border-left: 4px solid var(--rose);">
          <div class="card-title" style="color: var(--rose);">✕ Giao Thương B2B Hình Thức, Thiếu Đo Lường</div>
          <div class="card-desc">Các cuộc gặp gỡ chỉ dừng lại ở giao lưu xã giao; không có sàn niêm yết sản phẩm ưu đãi nội khối và không đo lường được giá trị kết nối thực chất.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 2 / 13</span>
      </div>
    </div>

    <!-- SLIDE 3 -->
    <div class="slide" data-slide="3">
      <div class="top-accent"></div>
      <span class="eyebrow blue">MỤC ĐÍCH & TẦM NHÌN</span>
      <h2 class="slide-title">Tôn Chỉ Hoạt Động: Gắn Kết · Chia Sẻ · Đồng Hành · Phát Triển</h2>
      <p class="slide-subtitle">Xây dựng nền móng công nghệ vững chắc chuyển hóa hiệp hội thành tổ chức số hiện đại, thịnh vượng</p>
      <div class="content-area grid-4">
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-num">01</div>
          <div class="card-title">Số Hóa 100% Hồ Sơ Hội Viên</div>
          <div class="card-desc">Thiết lập kho dữ liệu C-Level chuẩn hóa 360 độ: Hồ sơ pháp nhân, MST, vốn điều lệ, định danh mã hội viên độc bản duy nhất.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-num">02</div>
          <div class="card-title">Tự Động Hóa 90% Tác Vụ Thư Ký</div>
          <div class="card-desc">Tự động gửi email cấp tài khoản, tự động sinh mã VietQR Napas 247 gạch nợ hội phí, xuất báo cáo tài chính chỉ với 1 cú chạm.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-num">03</div>
          <div class="card-title">Xúc Tiến Thương Mại B2B Thực Chất</div>
          <div class="card-desc">Tạo dòng doanh thu và hợp đồng thực tế giữa 500+ doanh nghiệp thành viên qua Sàn Marketplace và Bảng tin cơ hội đầu tư.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-num">04</div>
          <div class="card-title">Nâng Tầm Vị Thế Thương Hiệu</div>
          <div class="card-desc">Đưa CLB CEO 1983 trở thành hình mẫu tiêu biểu của HanoiBA với công nghệ Thẻ thông minh NFC và ứng dụng di động độc quyền.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 3 / 13</span>
      </div>
    </div>

    <!-- SLIDE 4 -->
    <div class="slide" data-slide="4">
      <div class="top-accent"></div>
      <span class="eyebrow blue">KIẾN TRÚC HỆ THỐNG</span>
      <h2 class="slide-title">Kiến Trúc "Kiềng Ba Chân" Hoàn Hảo & Đồng Bộ Thời Gian Thực</h2>
      <p class="slide-subtitle">Mô hình kết hợp 3 phân hệ liên thông tuyệt đối qua nền tảng PostgreSQL, Socket.io và HTTPS</p>
      <div class="content-area grid-3">
        <div class="card" style="border-top: 4px solid var(--navy-primary);">
          <div class="card-title">1. Web CRM Quản Trị</div>
          <div style="font-size: 11px; color: var(--gold-dark); font-weight: 600; margin-bottom: 8px;">Dành cho Ban Thư Ký & Ban Chấp Hành</div>
          <div class="card-desc" style="font-size: 11px; line-height: 1.6;">
            • Phê duyệt hội viên 360° & cấp thẻ VIP<br>
            • Tạo sự kiện & Sơ đồ rạp chiếu Cinema Map<br>
            • Quét mã QR điểm danh tốc độ 1 giây<br>
            • Bảng hội phí & công tắc gạch nợ tự động<br>
            • Kiểm duyệt sàn Marketplace & cơ hội B2B<br>
            • Vận hành Biểu quyết trực tiếp & Lucky Draw
          </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--navy-primary);">
          <div class="card-title">2. Mobile App Doanh Nhân</div>
          <div style="font-size: 11px; color: var(--gold-dark); font-weight: 600; margin-bottom: 8px;">Dành cho 500+ Doanh Nhân C-Level</div>
          <div class="card-desc" style="font-size: 11px; line-height: 1.6;">
            • Thẻ VIP 3D mạ vàng & Radar NFC quét lân cận<br>
            • Danh thiếp số công khai xuất danh bạ .vcf<br>
            • Đặt vé sự kiện: Vé 0đ và Vé VietQR<br>
            • Sàn Marketplace Luxury 3 section phân trang<br>
            • Chat Messenger VIP: 1-1, nhóm, gửi định vị GPS<br>
            • Ví lưu trữ vé Check-in & nhận thẻ trúng giải
          </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--navy-primary);">
          <div class="card-title">3. Landing Page 3D & Email</div>
          <div style="font-size: 11px; color: var(--gold-dark); font-weight: 600; margin-bottom: 8px;">Cổng Đối Ngoại & Tiếp Nhận Hội Viên</div>
          <div class="card-desc" style="font-size: 11px; line-height: 1.6;">
            • Trải nghiệm điện ảnh 3D cuộn mượt mà<br>
            • Tiếp nhận form C-Level và pháp nhân MST<br>
            • Tự động tạo user và mật khẩu bảo mật<br>
            • Gửi ngay bức Email HTML chào mừng qua SMTP<br>
            • Tra cứu tiến độ hồ sơ polling mỗi 4 giây<br>
            • Hướng dẫn cài đặt PWA trên iOS Safari & Android
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 4 / 13</span>
      </div>
    </div>

    <!-- SLIDE 5 -->
    <div class="slide" data-slide="5">
      <div class="top-accent"></div>
      <span class="eyebrow blue">TRỤ CỘT QUẢN TRỊ 1</span>
      <h2 class="slide-title">Web CRM: "Bộ Não Điều Hành" Tối Cao Của Ban Lãnh Đạo Hiệp Hội</h2>
      <p class="slide-subtitle">Tập trung toàn quyền thẩm định, điều phối tài chính, quản lý đại biểu và bảo mật thông tin</p>
      <div class="content-area grid-3x2">
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Hồ Sơ Hội Viên & Drawer 360°</div>
          <div class="card-desc">Thẩm định hồ sơ doanh nghiệp, tra cứu MST, vốn điều lệ, xem ảnh chân dung C-Level và bấm Phê duyệt cấp thẻ VIP tức thì.</div>
        </div>
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Sự Kiện & Cinema Seating Map</div>
          <div class="card-desc">Tạo sự kiện theo mẫu template chuyên biệt, cấu hình vé 0đ hoặc có phí, thiết kế sơ đồ rạp chiếu kéo thả vị trí ghế VIP Lãnh đạo.</div>
        </div>
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Điểm Danh QR Tốc Độ 1s</div>
          <div class="card-desc">Ban tổ chức dùng camera quét mã QR trên vé đại biểu; hệ thống phát âm thanh bíp xác nhận, đổi trạng thái trong 1 giây, ngăn vé trùng.</div>
        </div>
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Bảng Hội Phí & Gạch Nợ</div>
          <div class="card-desc">Theo dõi niên khóa đóng phí của từng doanh nghiệp, công tắc gạch nợ 1 chạm, tự động sinh mã VietQR Napas 247 và lưu lịch sử kế toán.</div>
        </div>
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Kiểm Duyệt Sàn B2B & Cơ Hội</div>
          <div class="card-desc">Duyệt các mặt hàng niêm yết từ App, gắn nhãn khuyến mãi nội bộ CLB, quản lý bài đăng giao thương và hỗ trợ kết nối đối tác.</div>
        </div>
        <div class="card">
          <div class="card-title" style="font-size: 13px;">Live Voting & Lucky Draw</div>
          <div class="card-desc">Kích hoạt phiên bỏ phiếu đại hội đẩy trực tiếp về điện thoại hội viên, quay số may mắn #XXXX và phát lệnh chúc mừng lên màn hình LED.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 5 / 13</span>
      </div>
    </div>

    <!-- SLIDE 6 -->
    <div class="slide" data-slide="6">
      <div class="top-accent"></div>
      <span class="eyebrow blue">TRỤ CỘT DOANH NHÂN 2</span>
      <h2 class="slide-title">Mobile App: "Văn Phòng Bỏ Túi" & Thẻ Hội Viên VIP 3D</h2>
      <p class="slide-subtitle">Trải nghiệm thượng lưu, công nghệ kết nối hiện đại và giao thương B2B không biên giới</p>
      <div class="content-area grid-2x2">
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-title">1. Thẻ Hội Viên VIP 3D & Radar NFC</div>
          <div class="card-desc">Thiết kế mạ vàng 3D hiển thị Mã định danh (M1983-007), doanh nghiệp pháp nhân và thời hạn thẻ. Tích hợp Radar quét tìm doanh nhân lân cận trong bán kính sự kiện và chạm thẻ NFC thông minh.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-title">2. Danh Thiếp Số Công Khai 1-Chạm (.vcf)</div>
          <div class="card-desc">Khi đối tác quét mã QR từ camera thường hoặc Zalo, mở ngay trang danh thiếp xác thực 100% khớp tài khoản thực tế. Tích hợp nút Lưu danh bạ (.vcf) xuất thẳng vào điện thoại, gọi điện, email và nhắn Zalo tức thì.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-title">3. Sàn TMĐT Luxury 3 Section Phân Trang</div>
          <div class="card-desc">Giao diện E-Commerce cao cấp với 3 phân khu phân trang độc lập: Sản phẩm mới đăng, Sản phẩm xem nhiều nhất, và Gian hàng Doanh nghiệp nổi bật. Hiển thị giá ưu đãi độc quyền dành riêng cho hội viên CEO 1983.</div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-title">4. Tin Nhắn VIP & 5 Kênh Chính Thức</div>
          <div class="card-desc">Hệ thống tin nhắn phong cách Messenger cao cấp: 5 kênh truyền thông CLB, chat riêng 1-1, chat nhóm, thu hồi tin nhắn, chia sẻ định vị GPS trụ sở doanh nghiệp và thanh công cụ đính kèm tài liệu mở rộng.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 6 / 13</span>
      </div>
    </div>

    <!-- SLIDE 7 -->
    <div class="slide" data-slide="7">
      <div class="top-accent"></div>
      <span class="eyebrow blue">ĐỘT PHÁ TỔ CHỨC SỰ KIỆN</span>
      <h2 class="slide-title">Tự Động Hóa 2 Luồng Sự Kiện: Miễn Phí (0đ) & Thu Phí VietQR</h2>
      <p class="slide-subtitle">Quy trình khép kín từ CRM khởi tạo, App đặt vé đến Check-in cổng và quay thưởng may mắn</p>
      <div class="content-area grid-2">
        <div class="card" style="border-top: 4px solid var(--emerald);">
          <div class="card-title" style="color: var(--emerald);">CASE 1: SỰ KIỆN MIỄN PHÍ (0 ĐỒNG)</div>
          <div class="card-desc" style="line-height: 1.6; font-size: 11px;">
            <b>1. Khởi tạo CRM:</b> Đặt đơn giá vé = 0 đ, thiết lập diễn giả C-Level và banner 16:9.<br>
            <b>2. Đồng bộ App:</b> Thẻ sự kiện gắn tag xanh "Miễn phí (0 đ)" nổi bật.<br>
            <b>3. Đăng ký 1-Chạm:</b> Hội viên bấm Đăng ký, hệ thống xác nhận ngay không qua thanh toán.<br>
            <b>4. Cấp Vé Tức Thì:</b> Sinh mã vé REG-XXXX kèm mã QR Check-in điểm danh.<br>
            <b>5. Cấp Số May Mắn #XXXX:</b> Tự động sinh mã số quay thưởng Lucky Draw 4 chữ số.<br>
            <b>6. Đẩy Thông Báo & Tin Nhắn:</b> Gửi vé chi tiết vào mục Thông báo và Hộp thư hội viên.
          </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="card-title" style="color: var(--gold-dark);">CASE 2: SỰ KIỆN THU PHÍ (VIETQR NAPAS 247)</div>
          <div class="card-desc" style="line-height: 1.6; font-size: 11px;">
            <b>1. Khởi tạo CRM:</b> Cấu hình giá vé (500.000 đ), số tài khoản thụ hưởng của CLB.<br>
            <b>2. Đồng bộ App:</b> Thẻ sự kiện gắn tag vàng "500.000 đ / vé" kèm phân khu chỗ ngồi.<br>
            <b>3. Chọn Số Lượng Vé:</b> Hội viên chọn số vé, hệ thống tự động tính tổng tiền thanh toán.<br>
            <b>4. Cổng VietQR Napas 247:</b> Tự động sinh mã QR ngân hàng chứa sẵn số tiền và cú pháp.<br>
            <b>5. Quét Thanh Toán 3s:</b> Hội viên quét mã qua app ngân hàng, chuyển khoản Napas 247.<br>
            <b>6. Gạch Nợ & Trả Vé:</b> CRM tự động gạch nợ sau đối soát, cấp vé có mã QR động và số #XXXX.
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 7 / 13</span>
      </div>
    </div>

    <!-- SLIDE 8 -->
    <div class="slide" data-slide="8">
      <div class="top-accent"></div>
      <span class="eyebrow blue">CỔNG TIẾP NHẬN ĐỐI NGOẠI</span>
      <h2 class="slide-title">Landing Page 3D & Luồng Đăng Ký Tự Động Gửi Email Mật Khẩu</h2>
      <p class="slide-subtitle">Cơ chế tiếp nhận hồ sơ C-Level liền mạch từ Cổng thông tin tới hộp thư người dùng và CRM</p>
      <div class="content-area grid-4">
        <div class="card">
          <div class="eyebrow blue" style="align-self: flex-start;">BƯỚC 1</div>
          <div class="card-title" style="margin-top: 8px;">Nộp Hồ Sơ Tại Landing Page</div>
          <div class="card-desc">Doanh nhân truy cập /landing/ceo/v1, điền form tiếp nhận C-Level (Họ tên, Năm sinh 1983, Doanh nghiệp, MST, SĐT, Email).</div>
        </div>
        <div class="card">
          <div class="eyebrow blue" style="align-self: flex-start;">BƯỚC 2</div>
          <div class="card-title" style="margin-top: 8px;">Tự Động Sinh Tài Khoản</div>
          <div class="card-desc">Backend khởi tạo hồ sơ trong public.members trạng thái pending, sinh tài khoản vione_users với mật khẩu bảo mật ngẫu nhiên.</div>
        </div>
        <div class="card">
          <div class="eyebrow gold" style="align-self: flex-start;">BƯỚC 3</div>
          <div class="card-title" style="margin-top: 8px;">Gửi Email HTML Chào Mừng</div>
          <div class="card-desc">Giao thức SMTP tự động bắn thư chào mừng về hòm thư người đăng ký: Chứa tên đăng nhập, mật khẩu, link truy cập App và hướng dẫn PWA.</div>
        </div>
        <div class="card">
          <div class="eyebrow blue" style="align-self: flex-start;">BƯỚC 4</div>
          <div class="card-title" style="margin-top: 8px;">Ban Thư Ký Phê Duyệt CRM</div>
          <div class="card-desc">Hồ sơ hiển thị trên CRM /members; Thư ký kiểm tra giấy phép ĐKKD và bấm Approve để kích hoạt đầy đủ quyền hội viên chính thức.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 8 / 13</span>
      </div>
    </div>

    <!-- SLIDE 9 -->
    <div class="slide" data-slide="9">
      <div class="top-accent"></div>
      <span class="eyebrow blue">SỰ PHÙ HỢP ĐỘC BẢN</span>
      <h2 class="slide-title">Tại Sao Hệ Thống Này "Đo Ni Đóng Giày" Cho CLB CEO 1983?</h2>
      <p class="slide-subtitle">Tích hợp sâu sắc văn hóa, bản lĩnh thương trường và nhu cầu kết nối của thế hệ Doanh nhân Quý Hợi</p>
      <div class="content-area grid-2x2">
        <div class="card">
          <div class="card-title">1. Phong Thủy & Bản Mệnh 1983</div>
          <div class="card-desc">Doanh nhân sinh năm 1983 mang tuổi Quý Hợi - Mệnh Đại Hải Thủy. Hệ thống áp dụng bảng màu Xanh Royal Navy tượng trưng cho biển lớn bao la kết hợp Vàng Kim Hoàng Gia, thể hiện sự chín muồi, thịnh vượng và vững chãi.</div>
        </div>
        <div class="card">
          <div class="card-title">2. Chuẩn Hóa Mô Hình Trực Thuộc HanoiBA</div>
          <div class="card-desc">Cấu trúc hệ thống tích hợp đầy đủ 7 Ban chuyên trách của Hiệp Hội Doanh Nhân Trẻ Hà Nội: Ban Thư Ký, Ban Xúc Tiến Thương Mại, Ban Sự Kiện, Ban Truyền Thông, Ban Tài Chính... giúp quản trị bài bản và kế thừa lâu dài.</div>
        </div>
        <div class="card">
          <div class="card-title">3. Tối Ưu Trải Nghiệm Lãnh Đạo C-Level</div>
          <div class="card-desc">Các chủ doanh nghiệp bận rộn cần giải pháp "1-Chạm": Chạm lưu danh bạ .vcf, chạm quét điểm danh sự kiện, chạm quét VietQR không cần nhập liệu số tiền hay số tài khoản, thao tác nhanh gọn trên mọi thiết bị.</div>
        </div>
        <div class="card">
          <div class="card-title">4. Giải Quyết Nhu Cầu Giao Thương B2B Thực Chất</div>
          <div class="card-desc">500+ doanh nghiệp thành viên đang ở độ tuổi vàng phát triển kinh tế. Sàn Marketplace và Bảng tin cơ hội giúp các thành viên ưu tiên sử dụng sản phẩm dịch vụ của nhau, giữ dòng tiền lưu chuyển nội khối bền vững.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 9 / 13</span>
      </div>
    </div>

    <!-- SLIDE 10 -->
    <div class="slide" data-slide="10">
      <div class="top-accent"></div>
      <span class="eyebrow blue">GIÁ TRỊ & HIỆU QUẢ VẬN HÀNH</span>
      <h2 class="slide-title">Các Chỉ Số Đo Lường Thành Công (ROI) Đột Phá Sau Khi Vận Hành</h2>
      <p class="slide-subtitle">Những con số thực tế chứng minh hiệu quả đầu tư và chuyển đổi số cho tổ chức</p>
      <div class="content-area grid-4">
        <div class="card" style="text-align: center; border-top: 4px solid var(--navy-primary);">
          <div class="stat-box">90%</div>
          <div class="stat-label">Giảm Thời Gian Thủ Tục</div>
          <div class="card-desc">Cắt giảm 90% thời gian xử lý thủ tục hành chính, nộp hồ sơ, thẩm định và cấp thẻ hội viên so với phương thức giấy tờ truyền thống.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 4px solid var(--navy-primary);">
          <div class="stat-box">100%</div>
          <div class="stat-label">Tự Động Hóa Quản Lý Phí</div>
          <div class="card-desc">Loại bỏ hoàn toàn rủi ro thất thoát tài chính và nhầm lẫn đối soát; tự động hóa nhắc nợ và gạch nợ qua cổng VietQR Napas 247.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 4px solid var(--navy-primary);">
          <div class="stat-box">1 Giây</div>
          <div class="stat-label">Tốc Độ Check-in Cổng</div>
          <div class="card-desc">Đón tiếp và điểm danh 500 - 1.000 đại biểu tham dự đại hội mượt mà trong 1 giây/khách, xóa bỏ hoàn toàn cảnh ùn tắc bàn lễ tân.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 4px solid var(--navy-primary);">
          <div class="stat-box">> 5 Tỷ</div>
          <div class="stat-label">Giá Trị Giao Thương B2B</div>
          <div class="card-desc">Dự kiến thúc đẩy trên 5 tỷ đồng giá trị hợp đồng kết nối thương mại nội bộ thành công trong năm đầu tiên vận hành Sàn Marketplace.</div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 10 / 13</span>
      </div>
    </div>

    <!-- SLIDE 11 -->
    <div class="slide" data-slide="11">
      <div class="top-accent"></div>
      <span class="eyebrow blue">CHỨNG MINH THỰC TẾ</span>
      <h2 class="slide-title">Hệ Thống Đã Được Triển Khai Hoàn Chỉnh Trên Môi Trường Live HTTPS</h2>
      <p class="slide-subtitle">Toàn bộ giao diện và luồng nghiệp vụ đã được kiểm thử và xác thực hoạt động ổn định</p>
      <div class="content-area grid-3">
        <div class="card">
          <div class="card-title">Web CRM Quản Trị Trung Tâm</div>
          <div class="card-desc" style="margin-bottom: 10px;">Dashboard KPI điều hành, quản lý hội viên, duyệt bài Marketplace và cấu hình sự kiện trực quan.</div>
          <div style="flex: 1; background: #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-muted); min-height: 140px;">
            [Hình ảnh CRM Dashboard Live HTTPS]
          </div>
        </div>
        <div class="card">
          <div class="card-title">Thẻ Hội Viên VIP & Danh Thiếp 3D</div>
          <div class="card-desc" style="margin-bottom: 10px;">Thẻ mạ vàng 3D và danh thiếp số công khai hiển thị chính xác tài khoản thực tế (M1983-007 - Lê Hoàng Long).</div>
          <div style="flex: 1; background: #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-muted); min-height: 140px;">
            [Hình ảnh Thẻ VIP 3D & Public Card]
          </div>
        </div>
        <div class="card">
          <div class="card-title">Sàn B2B & Vé Sự Kiện Check-in</div>
          <div class="card-desc" style="margin-bottom: 10px;">Sàn giao thương Luxury 3 section phân trang và vé Pass điện tử kèm mã QR check-in & số may mắn #XXXX.</div>
          <div style="flex: 1; background: #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-muted); min-height: 140px;">
            [Hình ảnh Sàn B2B & Vé Pass QR]
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 11 / 13</span>
      </div>
    </div>

    <!-- SLIDE 12 -->
    <div class="slide" data-slide="12">
      <div class="top-accent"></div>
      <span class="eyebrow blue">LỘ TRÌNH PHÁT TRIỂN</span>
      <h2 class="slide-title">Chiến Lược Mở Rộng 2026 - 2028: Hướng Tới Liên Minh Hiệp Hội Số</h2>
      <p class="slide-subtitle">Không chỉ dừng lại ở CLB CEO 1983, hệ thống sẵn sàng mở rộng thành mạng lưới giao thương liên kết</p>
      <div class="content-area grid-3">
        <div class="card" style="border-top: 4px solid var(--navy-primary);">
          <div class="eyebrow blue" style="align-self: flex-start;">GIAI ĐOẠN 1 (2026)</div>
          <div class="card-title" style="margin-top: 8px;">Chuẩn Hóa & Vận Hành Bền Vững</div>
          <div class="card-desc" style="line-height: 1.6; font-size: 11px;">
            • Số hóa toàn bộ 500+ doanh nghiệp CLB CEO 1983<br>
            • Vận hành trơn tru CRM quản trị & Mobile App PWA<br>
            • Tự động hóa 100% các kỳ sự kiện và thu phí VietQR<br>
            • Đồng bộ danh thiếp số công khai hỗ trợ lưu danh bạ
          </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--gold-accent);">
          <div class="eyebrow gold" style="align-self: flex-start;">GIAI ĐOẠN 2 (2026 - 2027)</div>
          <div class="card-title" style="margin-top: 8px;">Trí Tuệ Nhân Tạo & Thẻ NFC</div>
          <div class="card-desc" style="line-height: 1.6; font-size: 11px;">
            • Tích hợp AI Smart Matching: Gợi ý đối tác kinh doanh tự động dựa trên ngành nghề, doanh thu và nhu cầu đầu tư<br>
            • Cổng thanh toán ngân hàng tự động đối soát liên ngân hàng<br>
            • Phát hành thẻ vật lý kim loại gắn chip NFC mạ vàng cao cấp
          </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--emerald);">
          <div class="eyebrow" style="background: var(--emerald); color: #fff; align-self: flex-start;">GIAI ĐOẠN 3 (2027 - 2028)</div>
          <div class="card-title" style="margin-top: 8px;">Liên Minh Hiệp Hội Số</div>
          <div class="card-desc" style="line-height: 1.6; font-size: 11px;">
            • Mở rộng mô hình tới các CLB Doanh nhân trực thuộc HanoiBA<br>
            • Kết nối mạng lưới giao thương liên hiệp hội YBA, BNI toàn quốc<br>
            • Sàn xúc tiến thương mại quốc tế kết nối doanh nghiệp kiều bào
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 12 / 13</span>
      </div>
    </div>

    <!-- SLIDE 13 -->
    <div class="slide dark-theme" data-slide="13">
      <div class="top-accent"></div>
      <div style="margin-top: 20px;">
        <span class="eyebrow gold">CAM KẾT ĐỒNG HÀNH CHIẾN LƯỢC</span>
        <h2 class="slide-title" style="font-size: 30px; margin-top: 8px;">Tiên Phong Kiến Tạo Cộng Đồng Doanh Nhân Số Thịnh Vượng</h2>
        <p class="slide-subtitle" style="font-size: 15px; margin-top: 4px;">Hệ thống VIONE Ecosystem sẵn sàng đồng hành cùng Ban Chấp Hành CLB Doanh Nhân CEO 1983 tạo nên bước chuyển mình lịch sử</p>
      </div>
      <div class="content-area grid-3" style="margin-top: 15px;">
        <div class="card">
          <div class="card-title" style="color: var(--gold-accent);">Sẵn Sàng Triển Khai Ngay 100%</div>
          <div class="card-desc">Hệ thống đã hoàn thiện mã nguồn và đang chạy ổn định trên hạ tầng HTTPS an toàn bảo mật cao.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color: var(--gold-accent);">Đào Tạo & Chuyển Giao Tận Tâm</div>
          <div class="card-desc">Tài liệu hướng dẫn sử dụng chi tiết (Word/PDF/Video), hỗ trợ trực tiếp Ban Thư ký vận hành trơn tru.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color: var(--gold-accent);">Bảo Hành & Nâng Cấp Liên Tục</div>
          <div class="card-desc">Cam kết hỗ trợ kỹ thuật 24/7, định kỳ nâng cấp tính năng mới và tối ưu hóa hiệu năng theo sự phát triển của CLB.</div>
        </div>
      </div>
      <div style="margin-top: 15px; background: var(--gold-accent); padding: 12px 20px; border-radius: 10px; color: var(--navy-dark); font-weight: 700; font-size: 13px;">
        TRẢI NGHIỆM HỆ THỐNG TRỰC TIẾP:
        <span style="color: var(--navy-primary); font-weight: 800; margin-left: 10px;">
          CRM: https://14.225.217.232:5443 · App: https://14.225.217.232:5444
        </span>
      </div>
      <div class="slide-footer">
        <span>Hiệp Hội Doanh Nhân CEO 1983 · HanoiBA · VIONE Ecosystem</span>
        <span>Slide 13 / 13</span>
      </div>
    </div>
  </div>

  <div class="controls">
    <button class="btn-nav" id="btnPrev">← Trang Trước</button>
    <div class="dots" id="dotsContainer"></div>
    <button class="btn-nav" id="btnNext">Trang Sau →</button>
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = 13;
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('dotsContainer');

    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 1 ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    function goToSlide(n) {
      if (n < 1) n = 1;
      if (n > totalSlides) n = totalSlides;
      currentSlide = n;

      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx + 1 === currentSlide);
      });

      const dots = document.querySelectorAll('.dot');
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx + 1 === currentSlide);
      });
    }

    document.getElementById('btnPrev').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('btnNext').addEventListener('click', () => goToSlide(currentSlide + 1));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') goToSlide(currentSlide + 1);
      if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    });
  </script>
</body>
</html>`;
  const htmlPath = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✓ Generated Interactive HTML Pitch Deck -> ${htmlPath}`);

  // Copy to public/docs for in-app viewing
  const publicDocs = path.join(__dirname, '..', 'apps', 'vione_app_fe', 'public', 'docs');
  if (fs.existsSync(publicDocs)) {
    fs.copyFileSync(htmlPath, path.join(publicDocs, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.html'));
    fs.copyFileSync(mdPath, path.join(publicDocs, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.md'));
    fs.copyFileSync(pptxPath, path.join(publicDocs, 'SLIDE_THUYET_TRINH_HE_SINH_THAI_CEO1983.pptx'));
    console.log('✓ Synced Presentation files to public/docs for in-app viewing!');
  }

  console.log('=== PRESENTATION PITCH DECK GENERATION COMPLETED! ===\n');
}

buildMasterPresentation().catch(console.error);
