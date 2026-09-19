/**
 * PowerPoint Slide Deck Generator for CEO 1983 Ecosystem
 * Generates:
 * 1. document/SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx
 * 2. document/SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx
 *
 * Strict 3-Color Brand System of CEO 1983:
 * - Royal Navy (Chủ đạo 1): #003B95 / Deep Navy #0A1A3A / Dark Blue #0F172A
 * - Flame Gold / Amber (Chủ đạo 2): #EA580C / Gold #F59E0B / Amber #D97706
 * - Pure White / Platinum Slate (Chủ đạo 3): #FFFFFF / #F8FAFC / #E2E8F0
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'document');

// Colors
const C = {
  NAVY_DARK: '0A1A3A',
  NAVY_PRIMARY: '003B95',
  NAVY_CARD: '132A56',
  GOLD_ACCENT: 'F59E0B',
  ORANGE_FLAME: 'EA580C',
  WHITE: 'FFFFFF',
  SLATE_LIGHT: 'F8FAFC',
  SLATE_MUTED: '94A3B8',
  SLATE_DARK: '1E293B',
  CARD_BORDER: '1E3A8A'
};

// =============================================================================
// PRESENTATION 1: APP HỘI VIÊN HIỆP HỘI (CLB CEO 1983)
// =============================================================================
async function generateAppSlideDeck() {
  console.log('Generating App PowerPoint Slides...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'CLB Doanh Nhân CEO 1983';
  pres.title = 'Hệ Sinh Thái Số Hóa Doanh Nhân CEO 1983 — App Hiệp Hội';

  // Helper for Slide Background
  function setSlideTheme(slide, isDark = true) {
    slide.background = { color: isDark ? C.NAVY_DARK : C.SLATE_LIGHT };
  }

  // SLIDE 1: Cover Slide
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    // Top Badge
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 0.8, w: 3.5, h: 0.4,
      fill: { color: C.GOLD_ACCENT },
      roundRadio: 0.1
    });
    slide.addText('HỆ SINH THÁI SỐ DOANH NHÂN 1983', {
      x: 0.8, y: 0.8, w: 3.5, h: 0.4,
      color: C.NAVY_DARK, bold: true, fontSize: 11, align: 'center', valign: 'middle'
    });

    // Main Title
    slide.addText('ỨNG DỤNG DI ĐỘNG CLB DOANH NHÂN CEO 1983', {
      x: 0.8, y: 1.5, w: 11.5, h: 1.2,
      color: C.WHITE, bold: true, fontSize: 32, fontFace: 'Calibri'
    });

    // Slogan
    slide.addText('"Kết Nối Bền — Phát Triển Vững" · Phiên bản v2.6.0 Pro', {
      x: 0.8, y: 2.8, w: 11.5, h: 0.5,
      color: C.GOLD_ACCENT, bold: true, fontSize: 18, italic: true
    });

    // Subtitle
    slide.addText('Nền tảng số hóa đặc quyền dành riêng cho Lãnh đạo cấp cao sinh năm 1983 (Quý Hợi - Đại Hải Thủy) trực thuộc HanoiBA.', {
      x: 0.8, y: 3.4, w: 10.5, h: 0.8,
      color: C.SLATE_MUTED, fontSize: 14
    });

    // 3 Highlight Metrics Cards
    const metrics = [
      { num: '100%', label: 'Thẻ Visit Card 3D', sub: 'Chạm NFC & vCard thông minh' },
      { num: '05', label: 'Kênh Chuyên Biệt', sub: 'Truyền thông & thông báo CRM' },
      { num: '0đ', label: 'Vé Hội Viên Điện Tử', sub: 'Check-in QR tức thì 1 giây' }
    ];

    metrics.forEach((m, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 4.8, w: 3.7, h: 1.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1.5 },
        roundRadio: 0.15
      });
      slide.addText(m.num, {
        x: xPos + 0.3, y: 5.0, w: 3.1, h: 0.7,
        color: C.GOLD_ACCENT, bold: true, fontSize: 32
      });
      slide.addText(m.label, {
        x: xPos + 0.3, y: 5.7, w: 3.1, h: 0.4,
        color: C.WHITE, bold: true, fontSize: 14
      });
      slide.addText(m.sub, {
        x: xPos + 0.3, y: 6.1, w: 3.1, h: 0.4,
        color: C.SLATE_MUTED, fontSize: 11
      });
    });
  }

  // SLIDE 2: Bức Tranh 3D Khổ Dọc 600vh
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('ĐỘT PHÁ THIẾT KẾ LANDING PAGE', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Bức Tranh 3D Khổ Dọc Liên Tục 600vh (Artwork is the Website)', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    // 6 Landscape Chapters Cards
    const scenes = [
      { step: '01', title: 'SKY (Bầu Trời & Thái Dương)', desc: 'Ánh dương rực rỡ, tầng mây bồng bềnh, thông điệp khát vọng CEO 1983' },
      { step: '02', title: 'BIRDS (Đàn Chim Tung Cánh)', desc: 'Tượng trưng cho sự hội tụ và vươn tầm của các nhà lãnh đạo C-Level' },
      { step: '03', title: 'KITES (Cánh Diều Khát Vọng)', desc: 'Kết nối không gian vũ trụ với thực tiễn kinh doanh, bay cao và vững chãi' },
      { step: '04', title: 'VILLAS (Quần Thể Kiến Trúc)', desc: 'Đẳng cấp sống, vị thế doanh nhân, đường chân trời và sự thịnh vượng' },
      { step: '05', title: 'WATER (Khối Nước & Pool)', desc: 'Gợn sóng đại dương, chiều sâu phản chiếu, bản lĩnh của mệnh Đại Hải Thủy' },
      { step: '06', title: 'UNDERWATER (Lãnh Đạo Đáy Biển)', desc: 'Thế giới biển xanh sâu thẳm, đàn cá uy nghiêm, lãnh đạo chinh phục thử thách' }
    ];

    scenes.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const xPos = 0.8 + col * 4.0;
      const yPos = 1.8 + row * 2.4;

      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: yPos, w: 3.7, h: 2.1,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.1
      });
      slide.addText(s.step, { x: xPos + 0.3, y: yPos + 0.2, w: 1.0, h: 0.4, color: C.GOLD_ACCENT, bold: true, fontSize: 18 });
      slide.addText(s.title, { x: xPos + 0.3, y: yPos + 0.6, w: 3.1, h: 0.5, color: C.WHITE, bold: true, fontSize: 13 });
      slide.addText(s.desc, { x: xPos + 0.3, y: yPos + 1.1, w: 3.1, h: 0.8, color: C.SLATE_MUTED, fontSize: 11 });
    });
  }

  // SLIDE 3: Thẻ Visit Card 3D & Chạm NFC
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('NHẬN DIỆN DOANH NHÂN ĐẲNG CẤP', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Thẻ Hội Viên VIP 3D, Chạm NFC & Danh Thiếp Số 360°', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const cardFeatures = [
      {
        title: 'Lật Thẻ 3D Hai Mặt Tương Tác',
        desc: 'Mặt trước phủ màu Navy Hoàng Gia phối viền Vàng Kim. Mặt sau khắc logo HanoiBA + CEO 1983 cùng slogan "Kết nối bền - Phát triển vững".',
        highlight: 'Khung ảnh tỉ lệ 1.7:1 chuẩn nghệ thuật'
      },
      {
        title: 'Chạm Thẻ Thông Minh NFC 1 Chạm',
        desc: 'Chạm mặt lưng điện thoại trực tiếp vào thiết bị của đối tác để mở danh thiếp tức thì mà không cần đối tác cài đặt bất kỳ ứng dụng nào.',
        highlight: 'Tương thích 100% iOS & Android'
      },
      {
        title: 'Hồ Sơ Năng Lực Doanh Nhân 360°',
        desc: 'Hiển thị đầy đủ MST doanh nghiệp, quy mô vốn, nhân sự, danh mục sản phẩm cốt lõi, đường link showroom và hotline kết nối trực tiếp.',
        highlight: 'Tích hợp Apple & Google Wallet'
      },
      {
        title: 'Bảo Mật Quyền Riêng Tư Cấp Cao',
        desc: 'Hội viên chủ động bật/tắt từng trường thông tin (Số điện thoại, email cá nhân, doanh số) khi chia sẻ danh thiếp công khai ra ngoài.',
        highlight: 'Mã hóa QR chống sao chép giả mạo'
      }
    ];

    cardFeatures.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = 0.8 + col * 6.0;
      const yPos = 1.8 + row * 2.5;

      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: yPos, w: 5.6, h: 2.2,
        fill: { color: C.NAVY_CARD },
        line: { color: C.GOLD_ACCENT, width: 1.2 },
        roundRadio: 0.12
      });
      slide.addText(f.title, { x: xPos + 0.4, y: yPos + 0.3, w: 4.8, h: 0.4, color: C.WHITE, bold: true, fontSize: 16 });
      slide.addText(f.desc, { x: xPos + 0.4, y: yPos + 0.8, w: 4.8, h: 0.8, color: C.SLATE_MUTED, fontSize: 12 });
      slide.addText(`★ ${f.highlight}`, { x: xPos + 0.4, y: yPos + 1.6, w: 4.8, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 11 });
    });
  }

  // SLIDE 4: Sàn Giao Thương Marketplace Shopee-Style
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('THƯƠNG MẠI ĐIỆN TỬ B2B NỘI KHỐI', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Sàn Giao Thương Marketplace — Gian Hàng Doanh Nghiệp Chuẩn Sàn', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const mktPoints = [
      {
        title: 'Gian Hàng Doanh Nghiệp (Company Storefront)',
        content: 'Mỗi hội viên sở hữu một Showroom số với đầy đủ ảnh bìa nhận diện thương hiệu, chứng nhận pháp nhân, hotline và danh mục hàng hóa.'
      },
      {
        title: 'Hiển Thị Giá Trị Giao Dịch Hàng Chục Tỷ Đồng',
        content: 'Khắc phục hoàn toàn lỗi co gọn văn bản. Giá trị niêm yết từ hàng trăm triệu đến hàng chục tỷ VNĐ (15,000,000,000 đ) hiển thị rõ nét.'
      },
      {
        title: 'Bộ Lọc Ngành Nghề Đa Tầng Thông Minh',
        content: 'Phân loại tự động: Công nghệ thông tin, Bất động sản & Xây dựng, Tài chính - Ngân hàng, Xuất nhập khẩu, F&B, Năng lượng tái tạo.'
      },
      {
        title: 'Quy Trình Đăng Sản Phẩm 2 Phân Đoạn',
        content: 'Phân đoạn 1: Thông tin pháp nhân và hồ sơ năng lực. Phân đoạn 2: Thông số kỹ thuật sản phẩm, bảng giá ưu đãi độc quyền cho CEO 1983.'
      }
    ];

    mktPoints.forEach((p, idx) => {
      const yPos = 1.8 + idx * 1.25;
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: yPos, w: 11.6, h: 1.1,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.1
      });
      slide.addText(`0${idx + 1}`, { x: 1.1, y: yPos + 0.3, w: 0.6, h: 0.5, color: C.GOLD_ACCENT, bold: true, fontSize: 20 });
      slide.addText(p.title, { x: 1.8, y: yPos + 0.2, w: 9.5, h: 0.35, color: C.WHITE, bold: true, fontSize: 14 });
      slide.addText(p.content, { x: 1.8, y: yPos + 0.55, w: 10.2, h: 0.45, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 5: Bảng Tin Cơ Hội B2B & Tracking
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('KHỚP LỆNH KINH DOANH THỜI GIAN THỰC', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Bảng Tin Trao Cơ Hội Kinh Doanh B2B & Quản Lý Đối Tác Quan Tâm', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const oppHighlights = [
      {
        icon: '👁️',
        title: 'Bộ Đếm Lượt Xem Realtime',
        desc: 'Icon mắt giám sát chính xác số lượt click vào bài đăng, phản ánh chân thực mức độ quan tâm của cộng đồng với nhu cầu cung - cầu.'
      },
      {
        icon: '👥',
        title: 'Danh Sách Đối Tác Quan Tâm',
        desc: 'Chủ bài đăng xem được danh sách cụ thể các CEO đã bấm "Quan tâm", kèm chức vụ, tên công ty, số hotline và email liên hệ.'
      },
      {
        icon: '⚡',
        title: 'Kết Nối 1 Chạm Siêu Tốc',
        desc: 'Tích hợp nút Gọi điện, Gửi email và Nhắn tin Messenger trực tiếp từ thẻ quan tâm để xúc tiến đàm phán hợp đồng ngay trong ngày.'
      }
    ];

    oppHighlights.forEach((h, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.GOLD_ACCENT, width: 1.2 },
        roundRadio: 0.15
      });
      slide.addText(h.icon, { x: xPos + 0.4, y: 2.2, w: 1.5, h: 0.8, fontSize: 36 });
      slide.addText(h.title, { x: xPos + 0.4, y: 3.2, w: 3.0, h: 0.6, color: C.WHITE, bold: true, fontSize: 16 });
      slide.addText(h.desc, { x: xPos + 0.4, y: 3.9, w: 3.0, h: 2.2, color: C.SLATE_MUTED, fontSize: 13 });
    });
  }

  // SLIDE 6: Sự Kiện — Vé Pass 0đ & MinIO Storage
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('SỰ KIỆN & HỘI NGHỊ ĐỈNH CAO', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Vé Pass 0đ Tức Thời, Pipeline MinIO & Sơ Đồ Khán Phòng Cinema Map', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const eventBoxes = [
      {
        title: 'Luồng Vé 0đ Hoàn Toàn Tự Động',
        points: [
          'Hội viên đăng ký sự kiện miễn phí (Họp mặt, Tọa đàm) nhận ngay Vé Pass Điện Tử.',
          'Loại bỏ triệt để cổng thanh toán giả lập gây khó chịu.',
          'Mã QR Check-in tốc độ cao mã hóa theo từng cá nhân.'
        ]
      },
      {
        title: 'Pipeline Ảnh MinIO Storage Tập Trung',
        points: [
          'Toàn bộ banner sự kiện upload từ CRM được lưu trữ tại MinIO Cloud Object Storage.',
          'Mobile App tự động tải ảnh từ MinIO URL thực tế, loại bỏ 100% ảnh demo hardcode.',
          'Tối ưu hóa nén ảnh tự động cho tốc độ hiển thị dưới 0.3 giây.'
        ]
      },
      {
        title: 'Sơ Đồ Ghế Khán Phòng Cinema Map',
        points: [
          'Trực quan hóa vị trí Bàn VIP, Ghế Chủ tịch, Khán giả trên sơ đồ hội trường 3D.',
          'Hội viên xem trước vị trí ghế ngồi của mình trên Vé Pass trước giờ khai mạc.',
          'Điều phối check-in và đón tiếp khách VIP trang trọng, chuẩn xác.'
        ]
      }
    ];

    eventBoxes.forEach((b, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.15
      });
      slide.addText(b.title, { x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.7, color: C.GOLD_ACCENT, bold: true, fontSize: 15 });
      b.points.forEach((pt, pIdx) => {
        slide.addText(`• ${pt}`, {
          x: xPos + 0.3, y: 2.9 + pIdx * 1.2, w: 3.1, h: 1.1,
          color: C.SLATE_LIGHT, fontSize: 12
        });
      });
    });
  }

  // SLIDE 7: 5 Kênh Tin Nhắn Nghiệp Vụ & CRM Broadcast
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('TRUYỀN THÔNG & PHÁT SÓNG THÔNG BÁO', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Hệ Thống 5 Kênh Tin Tức Nghiệp Vụ & Broadcast Trực Tiếp Từ CRM', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const channels = [
      { name: '📢 Kênh Truyền Thông Hiệp Hội', desc: 'Bản tin tuần, hoạt động thiện nguyện, thông cáo báo chí chính thống.' },
      { name: '🤝 Kênh Xúc Tiến Giao Thương', desc: 'Chương trình B2B Matching, kết nối cung cầu, tìm kiếm đại lý phân phối.' },
      { name: '🏛️ Kênh Ban Thư Ký & Ban Điều Hành', desc: 'Nghị quyết đại hội, quy chế sinh hoạt, biểu quyết số và đóng hội phí.' },
      { name: '🎯 Kênh Cơ Hội & Deal B2B', desc: 'Các đơn hàng độc quyền, cơ hội hợp tác và dự án nội bộ của hội viên.' },
      { name: '🌟 Kênh Sự Kiện & Hội Nghị', desc: 'Đại hội thường niên, Lễ vinh danh Doanh nhân, Giải thể thao và Gala.' }
    ];

    channels.forEach((c, idx) => {
      const yPos = 1.8 + idx * 1.0;
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: yPos, w: 11.6, h: 0.85,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.08
      });
      slide.addText(c.name, { x: 1.1, y: yPos + 0.15, w: 4.5, h: 0.5, color: C.GOLD_ACCENT, bold: true, fontSize: 13 });
      slide.addText(c.desc, { x: 5.6, y: yPos + 0.15, w: 6.5, h: 0.5, color: C.WHITE, fontSize: 12 });
    });
  }

  // SLIDE 8: Lộ Trình & Tầm Nhìn Số 2026
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('TẦM NHÌN CHIẾN LƯỢC 2026', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Khát Vọng Doanh Nhân CEO 1983 — Vươn Tầm Thời Đại Số', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.8, w: 11.6, h: 4.8,
      fill: { color: C.NAVY_CARD },
      line: { color: C.GOLD_ACCENT, width: 2 },
      roundRadio: 0.2
    });

    slide.addText('GIÁ TRỊ CỐT LÕI ĐẠT ĐƯỢC', {
      x: 1.2, y: 2.2, w: 10.8, h: 0.4,
      color: C.GOLD_ACCENT, bold: true, fontSize: 18
    });

    const pillars = [
      '⚡ Minh Bạch — Chuyên Nghiệp — Hiện Đại: Toàn bộ hoạt động hội viên và sự kiện được vận hành trên hạ tầng số chuẩn hóa.',
      '🌐 Sức Mạnh Mạng Lưới Nội Khối: Hơn 500 doanh nhân sinh năm 1983 tạo thành chuỗi liên kết kinh tế uy tín hàng đầu Thủ đô.',
      '🛡️ Bảo Trợ Pháp Lý & Vị Thế: Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA), đảm bảo chuẩn mực pháp lý và uy tín thương hiệu.',
      '🚀 Tự Hào Bản Sắc 1983: Mệnh Đại Hải Thủy — Biển lớn bao la, tương trợ cùng nhau vượt sóng gió thương trường xây dựng đế chế bền vững.'
    ];

    pillars.forEach((p, idx) => {
      slide.addText(p, {
        x: 1.2, y: 2.8 + idx * 0.9, w: 10.8, h: 0.8,
        color: C.WHITE, fontSize: 14
      });
    });
  }

  const outPath = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log(`✓ Generated App PowerPoint: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

// =============================================================================
// PRESENTATION 2: WEB CRM QUẢN TRỊ HIỆP HỘI
// =============================================================================
async function generateCrmSlideDeck() {
  console.log('Generating CRM PowerPoint Slides...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Ban Điều Hành CLB Doanh Nhân CEO 1983';
  pres.title = 'Hệ Thống CRM Quản Trị Hiệp Hội CEO 1983 — Executive Command Center';

  function setSlideTheme(slide, isDark = true) {
    slide.background = { color: isDark ? C.NAVY_DARK : C.SLATE_LIGHT };
  }

  // SLIDE 1: Cover Slide
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 0.8, w: 3.8, h: 0.4,
      fill: { color: C.GOLD_ACCENT },
      roundRadio: 0.1
    });
    slide.addText('EXECUTIVE COMMAND CENTER', {
      x: 0.8, y: 0.8, w: 3.8, h: 0.4,
      color: C.NAVY_DARK, bold: true, fontSize: 11, align: 'center', valign: 'middle'
    });

    slide.addText('HỆ THỐNG CRM QUẢN TRỊ HIỆP HỘI CEO 1983', {
      x: 0.8, y: 1.5, w: 11.5, h: 1.2,
      color: C.WHITE, bold: true, fontSize: 32, fontFace: 'Calibri'
    });

    slide.addText('Trung Tâm Chỉ Huy, Thẩm Định & Tự Động Hóa Vận Hành Toàn Diện', {
      x: 0.8, y: 2.8, w: 11.5, h: 0.5,
      color: C.GOLD_ACCENT, bold: true, fontSize: 18, italic: true
    });

    slide.addText('Công cụ điều hành số hóa chuẩn hóa quy trình tiếp nhận, phê duyệt pháp nhân, quản lý tài chính hội phí và kiểm toán minh bạch.', {
      x: 0.8, y: 3.4, w: 10.5, h: 0.8,
      color: C.SLATE_MUTED, fontSize: 14
    });

    const crmPillars = [
      { num: 'Automated', label: 'Onboarding Tự Động', sub: 'Cấp tài khoản qua Google SMTP' },
      { num: 'Unified', label: 'MinIO Asset Storage', sub: 'Lưu trữ ảnh tập trung chuẩn S3' },
      { num: 'Multi-Channel', label: 'Broadcast 5 Kênh', sub: 'Phân luồng tin tức chuyên biệt' }
    ];

    crmPillars.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 4.8, w: 3.7, h: 1.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1.5 },
        roundRadio: 0.15
      });
      slide.addText(p.num, { x: xPos + 0.3, y: 5.0, w: 3.1, h: 0.5, color: C.GOLD_ACCENT, bold: true, fontSize: 20 });
      slide.addText(p.label, { x: xPos + 0.3, y: 5.6, w: 3.1, h: 0.4, color: C.WHITE, bold: true, fontSize: 14 });
      slide.addText(p.sub, { x: xPos + 0.3, y: 6.0, w: 3.1, h: 0.4, color: C.SLATE_MUTED, fontSize: 11 });
    });
  }

  // SLIDE 2: Luồng Gia Nhập & Gmail SMTP
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('QUY TRÌNH TIẾP NHẬN TỰ ĐỘNG HÓA', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Đăng Ký Từ Landing Page 3D & Cấp Mật Khẩu Qua Google SMTP', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const steps = [
      { step: 'BƯỚC 1', title: 'Hội Viên Nộp Form Landing 3D', desc: 'Khai báo họ tên, SĐT, email công vụ, MST, chức vụ và quy mô công ty.' },
      { step: 'BƯỚC 2', title: 'Tiếp Nhận & Lưu Trữ CRM', desc: 'API Backend POST /public/club-registration tiếp nhận và đưa vào hàng đợi thẩm định.' },
      { step: 'BƯỚC 3', title: 'Tạo Mật Khẩu Ngẫu Nhiên Bảo Mật', desc: 'Hệ thống tự động sinh mật khẩu ngẫu nhiên phức tạp, chống trùng lặp và mã hóa bcrypt.' },
      { step: 'BƯỚC 4', title: 'Gửi Email Tự Động Qua SMTP', desc: 'Thư điện tử HTML thương hiệu CEO 1983 cấp thông tin tài khoản và link cài app.' }
    ];

    steps.forEach((st, idx) => {
      const xPos = 0.8 + idx * 3.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 1.8, w: 2.8, h: 4.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.GOLD_ACCENT, width: 1.2 },
        roundRadio: 0.12
      });
      slide.addText(st.step, { x: xPos + 0.25, y: 2.1, w: 2.3, h: 0.4, color: C.GOLD_ACCENT, bold: true, fontSize: 16 });
      slide.addText(st.title, { x: xPos + 0.25, y: 2.7, w: 2.3, h: 0.8, color: C.WHITE, bold: true, fontSize: 14 });
      slide.addText(st.desc, { x: xPos + 0.25, y: 3.7, w: 2.3, h: 2.5, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 3: Quản Lý Template Landing & Mẫu 3D Vertical
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('QUẢN TRỊ GIAO DIỆN CỔNG THÔNG TIN', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Quản Lý Kho Template Landing Web & Tích Hợp Mẫu 3D Vertical', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const tmplItems = [
      {
        title: 'Tích Hợp Chuẩn Hóa Template Catalog',
        desc: 'Đưa mẫu "CEO 1983 - 3D Vertical Landscape" vào danh mục quản lý tập trung landing-templates-catalog.ts với định danh riêng biệt.'
      },
      {
        title: 'Chuyển Đổi Nhanh Giữa Các Phiên Bản',
        desc: 'Ban Truyền thông có thể linh hoạt chuyển đổi giữa mẫu Blue-White kinh điển, mẫu Cinematic Parallax hoặc mẫu 3D Vertical mới.'
      },
      {
        title: 'Xem Trước Đa Thiết Bị (Device Preview)',
        desc: 'Tích hợp màn hình xem trước trực quan trên Desktop (1440px), Tablet (768px) và Mobile (390px) trước khi bấm áp dụng xuất bản.'
      },
      {
        title: 'Đồng Bộ Dữ Liệu Form Đăng Ký Trực Tiếp',
        desc: 'Mọi đơn đăng ký từ bất kỳ mẫu landing nào đều được kết nối trực tiếp vào cùng một pipeline thẩm định hồ sơ của Web CRM.'
      }
    ];

    tmplItems.forEach((item, idx) => {
      const yPos = 1.8 + idx * 1.25;
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: yPos, w: 11.6, h: 1.1,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.1
      });
      slide.addText(`❖`, { x: 1.1, y: yPos + 0.3, w: 0.5, h: 0.5, color: C.GOLD_ACCENT, fontSize: 20 });
      slide.addText(item.title, { x: 1.7, y: yPos + 0.2, w: 9.5, h: 0.35, color: C.WHITE, bold: true, fontSize: 14 });
      slide.addText(item.desc, { x: 1.7, y: yPos + 0.55, w: 10.2, h: 0.45, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 4: Sự Kiện, Vé 0đ & MinIO Storage
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('ĐIỀU HÀNH SỰ KIỆN TOÀN DIỆN', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Cấu Hình Vé 0đ, Upload Banner MinIO & Sơ Đồ Ghế Khán Phòng', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const crmEventBoxes = [
      {
        title: 'Cấu Hình Vé 0đ Linh Hoạt',
        points: [
          'Thiết lập giá vé 0đ cho họp định kỳ và đại hội nội bộ.',
          'Hệ thống tự động cấp Vé Pass có mã QR check-in.',
          'Loại bỏ cổng thanh toán bắt buộc cho sự kiện miễn phí.'
        ]
      },
      {
        title: 'MinIO Storage Cho Banner Sự Kiện',
        points: [
          'Ảnh banner upload qua CRM lưu an toàn trên MinIO S3.',
          'Mobile App tự động tải ảnh thực tế, không dùng ảnh demo.',
          'Tốc độ truyền tải CDN tối ưu hóa cho hàng nghìn truy cập.'
        ]
      },
      {
        title: 'Sơ Đồ Cinema Seating Map & Check-in',
        points: [
          'Kéo thả phân bổ ghế ngồi Bàn VIP, Khách mời, Ban Chấp Hành.',
          'Quản lý danh sách check-in thời gian thực theo từng giây.',
          'Màn hình Kiosk Check-in QR tốc độ cao đón tiếp đại biểu.'
        ]
      }
    ];

    crmEventBoxes.forEach((b, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.GOLD_ACCENT, width: 1.2 },
        roundRadio: 0.15
      });
      slide.addText(b.title, { x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.7, color: C.GOLD_ACCENT, bold: true, fontSize: 15 });
      b.points.forEach((pt, pIdx) => {
        slide.addText(`✔ ${pt}`, {
          x: xPos + 0.3, y: 2.9 + pIdx * 1.2, w: 3.1, h: 1.1,
          color: C.WHITE, fontSize: 12
        });
      });
    });
  }

  // SLIDE 5: Live Voting & Lucky Draw
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('ĐIỀU HÀNH ĐẠI HỘI & GALA', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Điều Phối Biểu Quyết Live Voting & Vòng Quay May Mắn Lucky Draw', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const votingBoxes = [
      {
        title: 'Phiên Biểu Quyết Đại Hội Live Voting',
        desc: 'Khởi tạo phiên biểu quyết điện tử cho các nghị quyết quan trọng. Đại biểu bỏ phiếu trực tiếp trên Mobile App. CRM hiển thị biểu đồ kết quả thời gian thực với tỷ lệ % chuẩn xác.'
      },
      {
        title: 'Chốt Kết Quả & Phát Sóng Đa Kênh',
        desc: 'Khi kết thúc phiên bỏ phiếu, CRM tự động tổng hợp tỷ lệ tán thành và phát sóng thông báo kết quả chính thức đến toàn bộ hội viên qua cả chuông thông báo và kênh tin nhắn.'
      },
      {
        title: 'Vận Hành Vòng Quay Lucky Draw',
        desc: 'Cấu hình danh sách giải thưởng (Giải Đặc Biệt, Giải Nhất, Nhì, Ba), quay số ngẫu nhiên minh bạch trên màn hình LED sân khấu và tự động trao thưởng cho đại biểu tham dự.'
      }
    ];

    votingBoxes.forEach((v, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.15
      });
      slide.addText(`0${idx + 1}`, { x: xPos + 0.3, y: 2.1, w: 1.5, h: 0.5, color: C.GOLD_ACCENT, bold: true, fontSize: 24 });
      slide.addText(v.title, { x: xPos + 0.3, y: 2.8, w: 3.1, h: 0.8, color: C.WHITE, bold: true, fontSize: 15 });
      slide.addText(v.desc, { x: xPos + 0.3, y: 3.7, w: 3.1, h: 2.5, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 6: Quản Trị Sàn Marketplace & Giám Sát Deal
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('KIỂM DUYỆT & THÚC ĐẨY GIAO THƯƠNG', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Kiểm Duyệt Sản Phẩm Marketplace & Giám Sát Cơ Hội B2B Hai Chiều', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const mktCrmItems = [
      {
        title: 'Thẩm Định Pháp Nhân Doanh Nghiệp Cung Cấp',
        desc: 'Kiểm tra giấy phép đăng ký kinh doanh, tư cách hội viên chính thức trước khi duyệt sản phẩm lên sàn thương mại nội khối.'
      },
      {
        title: 'Cấp Chứng Nhận "Verified CEO 1983"',
        desc: 'Huy hiệu bảo chứng chất lượng dành cho các doanh nghiệp thành viên cam kết chính sách giá ưu đãi đặc quyền cho hội viên.'
      },
      {
        title: 'Theo Dõi Phễu Cơ Hội Kinh Doanh (Deal Pipeline)',
        desc: 'Giám sát tổng giá trị giao dịch, số lượng bài đăng chào mua, chào bán, các cơ hội hợp tác đầu tư và tỷ lệ khớp lệnh thành công.'
      },
      {
        title: 'Đồng Bộ Dữ Liệu Thời Gian Thực 2 Chiều',
        desc: 'Mọi chỉnh sửa về giá ưu đãi, hình ảnh hoặc trạng thái mở/đóng cơ hội trên App được cập nhật lập tức về trung tâm CRM.'
      }
    ];

    mktCrmItems.forEach((m, idx) => {
      const yPos = 1.8 + idx * 1.25;
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: yPos, w: 11.6, h: 1.1,
        fill: { color: C.NAVY_CARD },
        line: { color: C.CARD_BORDER, width: 1 },
        roundRadio: 0.1
      });
      slide.addText(`★`, { x: 1.1, y: yPos + 0.3, w: 0.5, h: 0.5, color: C.GOLD_ACCENT, fontSize: 18 });
      slide.addText(m.title, { x: 1.7, y: yPos + 0.2, w: 9.5, h: 0.35, color: C.WHITE, bold: true, fontSize: 14 });
      slide.addText(m.desc, { x: 1.7, y: yPos + 0.55, w: 10.2, h: 0.45, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 7: Quản Lý Hội Phí Niên Khóa & VietQR
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('TÀI CHÍNH HIỆP HỘI MINH BẠCH', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Quản Lý Thu Hội Phí Thường Niên, Gạch Nợ Linh Hoạt & Cổng VietQR', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    const feeCards = [
      {
        title: 'Theo Dõi Thu Phí Niên Khóa',
        desc: 'Quản lý danh sách chi tiết các doanh nghiệp: Đã nộp, Chưa nộp, Sắp đến hạn gia hạn thẻ hội viên thường niên.'
      },
      {
        title: 'Tính Năng "Nhắc Phí" Tự Động',
        desc: '1-click gửi email thông báo kèm hóa đơn và mã VietQR có sẵn cú pháp chuyển khoản chính xác đến kế toán doanh nghiệp.'
      },
      {
        title: 'Thao Tác "Gạch Nợ" 1 Chạm',
        desc: 'Ban Thư ký đối soát và gạch nợ trực tiếp trên CRM, hệ thống lập tức mở khóa gia hạn thẻ VIP và quyền lợi trên App.'
      },
      {
        title: 'Cấu Hình Tài Khoản Ngân Hàng & VietQR',
        desc: 'Thiết lập số tài khoản ngân hàng chính thức của CLB CEO 1983, mã ngân hàng NAPAS và tạo mã VietQR động theo từng hóa đơn.'
      }
    ];

    feeCards.forEach((fc, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = 0.8 + col * 6.0;
      const yPos = 1.8 + row * 2.5;

      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: yPos, w: 5.6, h: 2.2,
        fill: { color: C.NAVY_CARD },
        line: { color: C.GOLD_ACCENT, width: 1.2 },
        roundRadio: 0.12
      });
      slide.addText(fc.title, { x: xPos + 0.4, y: yPos + 0.3, w: 4.8, h: 0.4, color: C.WHITE, bold: true, fontSize: 16 });
      slide.addText(fc.desc, { x: xPos + 0.4, y: yPos + 0.8, w: 4.8, h: 1.2, color: C.SLATE_MUTED, fontSize: 12 });
    });
  }

  // SLIDE 8: Kiểm Toán Hoạt Động & Quy Chuẩn Vận Hành
  {
    const slide = pres.addSlide();
    setSlideTheme(slide, true);

    slide.addText('BẢO MẬT & QUY CHUẨN ĐIỀU HÀNH', { x: 0.8, y: 0.6, w: 10, h: 0.3, color: C.GOLD_ACCENT, bold: true, fontSize: 12 });
    slide.addText('Nhật Ký Kiểm Toán (Audit Logs) & Hướng Dẫn Vận Hành Ban Thư Ký', { x: 0.8, y: 0.9, w: 11.5, h: 0.6, color: C.WHITE, bold: true, fontSize: 24 });

    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.8, w: 11.6, h: 4.8,
      fill: { color: C.NAVY_CARD },
      line: { color: C.GOLD_ACCENT, width: 2 },
      roundRadio: 0.2
    });

    slide.addText('HỆ THỐNG AN NINH & QUY TRÌNH VẬN HÀNH', {
      x: 1.2, y: 2.2, w: 10.8, h: 0.4,
      color: C.GOLD_ACCENT, bold: true, fontSize: 18
    });

    const auditPoints = [
      '🔒 Nhật Ký Kiểm Toán Toàn Diện (Audit Trail): Ghi nhận chi tiết mọi thao tác phê duyệt, chỉnh sửa hồ sơ, xóa sản phẩm, thời gian và địa chỉ IP của từng cán bộ quản trị.',
      '🛡️ Phân Quyền Vai Trò Theo Ban Ngành: Chủ tịch CLB, Tổng Thư Ký, Trưởng Ban Xúc tiến Thương mại, Trưởng Ban Sự kiện có quyền hạn và giao diện chuyên biệt.',
      '📊 Báo Cáo Xuất Excel Đa Định Dạng: Xuất danh bạ hội viên, báo cáo điểm danh sự kiện, bảng kê thu chi hội phí phục vụ công tác thanh tra tài chính.',
      '📚 Sổ Tay Đào Tạo & Tài Liệu Kỹ Thuật: Đồng bộ 100% giữa tài liệu Hướng dẫn sử dụng (Word/PDF), Slide thuyết trình và hệ thống thực tế.'
    ];

    auditPoints.forEach((ap, idx) => {
      slide.addText(ap, {
        x: 1.2, y: 2.8 + idx * 0.95, w: 10.8, h: 0.85,
        color: C.WHITE, fontSize: 13
      });
    });
  }

  const outPath = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log(`✓ Generated CRM PowerPoint: ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

async function main() {
  await generateAppSlideDeck();
  await generateCrmSlideDeck();
  console.log('\nAll PowerPoint decks successfully generated!');
}

main().catch(console.error);
