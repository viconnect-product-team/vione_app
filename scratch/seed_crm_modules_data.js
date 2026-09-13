const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function seed() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL...');

  const assocId = 'c1983000-0000-4000-8000-000000001983';

  // 1. Ensure Association CEO 1983 exists
  await client.query(`
    INSERT INTO public.associations (
      id, name, slug, brand_primary, tagline, about, contact_email, landing_published, ssl_status, public_card_enabled
    ) VALUES (
      $1, 'CLB Doanh Nhân CEO 1983', 'ceo1983', '#004b91',
      'Liên Minh Doanh Nhân Quý Hợi 1983',
      'Cộng đồng hơn 200 Chủ tịch & Tổng Giám đốc sinh năm 1983 trực thuộc HanoiBA.',
      'contact@ceo1983.com', true, 'active', true
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      brand_primary = EXCLUDED.brand_primary;
  `, [assocId]);
  console.log('✓ Association verified: CLB Doanh Nhân CEO 1983');

  // 2. Seed Marketplace Products (public.products)
  // Clean old sample products first to ensure fresh, high-quality standard catalog
  await client.query(`DELETE FROM public.products WHERE id LIKE 'prod-ceo1983-%';`);

  const products = [
    {
      id: 'prod-ceo1983-001',
      seller_id: 'c1983000-0000-4000-8000-000000000001',
      title: 'Vật Liệu Xây Dựng & Thép Kết Cấu Tiêu Chuẩn Cao',
      description: 'Cung cấp thép cuộn, thép cây và phụ kiện xây dựng cho các công trình trọng điểm miền Bắc. Đạt tiêu chuẩn ASTM & JIS quốc tế.',
      price: 18500000,
      category: 'mk.cat.realestate',
      status: 'active',
      views: 245,
      emoji: '🏗️',
      pdf_url: '',
      image_urls: ['/landing/business-hero-light.jpg'],
      website_url: 'https://thepkyoto.vn',
      facebook_url: 'https://facebook.com',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-002',
      seller_id: '00000000-0000-4000-8000-000000000003',
      title: 'Phần Mềm Quản Trị Khách Sạn & Nhà Hàng Cloud POS',
      description: 'Hệ thống gọi món, quản lý bàn, đối soát doanh thu tự động và tích hợp hóa đơn điện tử chuẩn Nghị định 123.',
      price: 12000000,
      category: 'mk.cat.tech',
      status: 'active',
      views: 312,
      emoji: '💻',
      pdf_url: '',
      image_urls: ['/landing/ecosystem-cosmic-skyline.jpg'],
      website_url: 'https://vione.vn',
      facebook_url: 'https://facebook.com',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-003',
      seller_id: 'c1983000-0000-4000-8000-000000000003',
      title: 'Hộp Yến Sào Hoàng Gia Thượng Hạng CEO 1983',
      description: 'Yến sào nguyên tổ đảo Phú Quốc, chưng sẵn đông trùng hạ thảo và táo đỏ hữu cơ. Quà tặng đối tác C-Level cao cấp.',
      price: 3200000,
      category: 'mk.cat.product',
      status: 'active',
      views: 186,
      emoji: '🪺',
      pdf_url: '',
      image_urls: ['/landing/ceo1983-hero-bg.jpg'],
      website_url: '',
      facebook_url: '',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-004',
      seller_id: 'c1983000-0000-4000-8000-000000000002',
      title: 'Gói Tư Vấn Tái Cấu Trúc Doanh Nghiệp & M&A',
      description: 'Chuyên gia tài chính trên 15 năm kinh nghiệm đồng hành tái cấu trúc mô hình tài chính, kiểm toán và gọi vốn chiến lược.',
      price: 45000000,
      category: 'mk.cat.consult',
      status: 'active',
      views: 420,
      emoji: '📊',
      pdf_url: '',
      image_urls: ['/landing/ceo1983-contrast.jpg'],
      website_url: 'https://advisor1983.vn',
      facebook_url: '',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-005',
      seller_id: 'c1983000-0000-4000-8000-000000000004',
      title: 'Dịch Vụ Logistics & Vận Tải Đa Phương Thức Quốc Tế',
      description: 'Vận chuyển hàng xuất nhập khẩu đường biển và đường bay trọn gói từ Việt Nam tới Mỹ, EU, Nhật Bản và ASEAN.',
      price: 28000000,
      category: 'mk.cat.service',
      status: 'active',
      views: 198,
      emoji: '🚢',
      pdf_url: '',
      image_urls: ['/landing/business-hero-light.jpg'],
      website_url: 'https://viconnect.vn',
      facebook_url: '',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-006',
      seller_id: 'c1983000-0000-4000-8000-000000000005',
      title: 'Thiết Kế Thi Công Văn Phòng Xanh & Showroom Cao Cấp',
      description: 'Giải pháp thiết kế nội thất công nghệ cao, tối ưu năng lượng và diện tích sử dụng cho các trụ sở doanh nghiệp.',
      price: 65000000,
      category: 'mk.cat.realestate',
      status: 'active',
      views: 275,
      emoji: '🏢',
      pdf_url: '',
      image_urls: ['/landing/ceo1983-hero-bg.jpg'],
      website_url: '',
      facebook_url: '',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-007',
      seller_id: 'c1983000-0000-4000-8000-000000000006',
      title: 'Hệ Thống Điện Năng Lượng Mặt Trời Cho Nhà Xưởng',
      description: 'Lắp đặt điện mặt trời áp mái công nghiệp tiêu chuẩn IEC, bảo hành 25 năm hiệu suất, tiết kiệm tới 40% chi phí điện.',
      price: 120000000,
      category: 'mk.cat.tech',
      status: 'active',
      views: 350,
      emoji: '⚡',
      pdf_url: '',
      image_urls: ['/landing/ecosystem-cosmic-skyline.jpg'],
      website_url: '',
      facebook_url: '',
      association_id: assocId,
    },
    {
      id: 'prod-ceo1983-008',
      seller_id: 'c1983000-0000-4000-8000-000000000007',
      title: 'Bảo Hiểm Sức Khỏe Toàn Diện Cho Ban Lãnh Đạo VIP',
      description: 'Quyền lợi khám chữa bệnh tại các bệnh viện quốc tế hàng đầu (Vinmec, FV, Raffles Singapore) với hạn mức 2 tỷ VNĐ/năm.',
      price: 15000000,
      category: 'mk.cat.service',
      status: 'active',
      views: 160,
      emoji: '🛡️',
      pdf_url: '',
      image_urls: ['/landing/ceo1983-contrast.jpg'],
      website_url: '',
      facebook_url: '',
      association_id: assocId,
    },
  ];

  for (const p of products) {
    await client.query(`
      INSERT INTO public.products (
        id, seller_id, title, description, price, category, status, views, emoji, pdf_url, image_urls, website_url, facebook_url, association_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        association_id = EXCLUDED.association_id,
        updated_at = NOW();
    `, [
      p.id, p.seller_id, p.title, p.description, p.price, p.category, p.status, p.views,
      p.emoji, p.pdf_url, p.image_urls, p.website_url, p.facebook_url, p.association_id
    ]);
  }
  console.log(`✓ Seeded ${products.length} marketplace products in public.products`);

  // 3. Seed Sample Quote Requests (public.quote_requests)
  await client.query(`DELETE FROM public.quote_requests WHERE id LIKE 'quote-ceo1983-%';`);
  const quotes = [
    {
      id: 'quote-ceo1983-001',
      product_id: 'prod-ceo1983-001',
      buyer_id: 'c1983000-0000-4000-8000-000000000002',
      quantity: 50,
      message: 'Chúng tôi đang triển khai dự án khu công nghiệp tại Hải Phòng, cần báo giá chi tiết 50 tấn thép kết cấu kèm tiến độ giao hàng.',
      contact: 'Nguyễn Văn Cường - 0983000002 (cuong@ceo1983.vn)',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      id: 'quote-ceo1983-002',
      product_id: 'prod-ceo1983-002',
      buyer_id: 'c1983000-0000-4000-8000-000000000003',
      quantity: 5,
      message: 'Muốn dùng thử hệ thống Cloud POS cho chuỗi 5 nhà hàng tại Hà Nội trong tháng này.',
      contact: 'Vũ Thu Trang - 0983000003 (trang@ceo1983.vn)',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  ];

  for (const q of quotes) {
    await client.query(`
      INSERT INTO public.quote_requests (
        id, product_id, buyer_id, quantity, message, contact, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING;
    `, [q.id, q.product_id, q.buyer_id, q.quantity, q.message, q.contact, q.created_at]);
  }
  console.log(`✓ Seeded ${quotes.length} quote requests in public.quote_requests`);

  // 4. Seed News (public.news)
  await client.query(`DELETE FROM public.news WHERE id::text LIKE 'c1983000-0000-4000-8000-00000000009%';`);

  const newsList = [
    {
      id: 'c1983000-0000-4000-8000-000000000091',
      code: 'NEWS-1983-01',
      title: 'Hội nghị Xúc tiến Thương mại & Kết nối Đầu tư Quốc tế Quý 3/2026',
      category: 'Sự kiện Hiệp hội',
      author: 'Ban Thư Ký',
      published_at: '2026-09-12',
      views: 385,
      status: 'published',
      excerpt: 'Chương trình kết nối giao thương giữa hơn 100 hội viên CLB CEO 1983 và các hiệp hội doanh nghiệp đối tác quốc tế từ Nhật Bản, Hàn Quốc và Singapore.',
      association_id: assocId,
      content: 'Chương trình Hội nghị Xúc tiến Thương mại & Kết nối Đầu tư Quốc tế Quý 3/2026 diễn ra với sự tham gia của hơn 100 doanh nhân C-Level...',
    },
    {
      id: 'c1983000-0000-4000-8000-000000000092',
      code: 'NEWS-1983-02',
      title: 'Ra mắt Ban Chuyển đổi số & Ứng dụng AI Doanh nghiệp CLB CEO 1983',
      category: 'Công nghệ & Đổi mới',
      author: 'Ban Công nghệ',
      published_at: '2026-09-10',
      views: 520,
      status: 'published',
      excerpt: 'Thành lập Ban chuyên trách hỗ trợ hội viên tiếp cận công nghệ AI Agent, tự động hóa quy trình vận hành và ứng dụng danh thiếp số NFC ViOne.',
      association_id: assocId,
      content: 'CLB CEO 1983 chính thức ra mắt Ban Chuyển đổi số với mục tiêu trang bị công nghệ tương lai cho 100% doanh nghiệp hội viên...',
    },
    {
      id: 'c1983000-0000-4000-8000-000000000093',
      code: 'NEWS-1983-03',
      title: 'Báo cáo Tổng kết Hoạt động Kết nối Kinh doanh 8 Tháng Đầu Năm 2026',
      category: 'Báo cáo Hoạt động',
      author: 'Ban Thường Trực',
      published_at: '2026-09-05',
      views: 290,
      status: 'published',
      excerpt: 'Tổng giá trị hợp đồng giao thương nội bộ đạt hơn 120 tỷ VNĐ với 350 cơ hội kinh doanh được kết nối thành công qua nền tảng ViOne.',
      association_id: assocId,
      content: 'Trong 8 tháng đầu năm 2026, các hoạt động kết nối giao thương giữa các hội viên CEO 1983 đã đạt được những kết quả ấn tượng...',
    },
    {
      id: 'c1983000-0000-4000-8000-000000000094',
      code: 'NEWS-1983-04',
      title: 'Thông báo Kế hoạch Tổ chức Giải Golf Doanh Nhân CEO 1983 Mùa Thu',
      category: 'Văn hóa & Thể thao',
      author: 'Ban Sự Kiện',
      published_at: '2026-09-02',
      views: 410,
      status: 'published',
      excerpt: 'Giải đấu giao lưu thể thao và kết nối đối tác quy tụ 72 golfer là các Chủ tịch và Tổng giám đốc doanh nghiệp hàng đầu.',
      association_id: assocId,
      content: 'Giải Golf Doanh Nhân CEO 1983 Mùa Thu 2026 sẽ chính thức khởi tranh tại sân Golf Long Biên vào ngày 25/09/2026...',
    },
    {
      id: 'c1983000-0000-4000-8000-000000000095',
      code: 'NEWS-1983-05',
      title: 'Chương trình Thiện nguyện “CEO 1983 - Chắp Cánh Ước Mơ Vùng Cao”',
      category: 'Trách nhiệm Xã hội',
      author: 'Ban Thiện Nguyện',
      published_at: '2026-08-28',
      views: 265,
      status: 'published',
      excerpt: 'Khởi công xây dựng 2 điểm trường học và trao tặng 500 suất học bổng cho học sinh nghèo hiếu học tại tỉnh Hà Giang.',
      association_id: assocId,
      content: 'Ban Thiện nguyện CLB Doanh Nhân CEO 1983 phối hợp cùng chính quyền địa phương triển khai chiến dịch xây dựng trường học...',
    },
    {
      id: 'c1983000-0000-4000-8000-000000000096',
      code: 'NEWS-1983-06',
      title: 'Hướng dẫn Sử dụng Tính năng Danh thiếp Điện tử NFC & Bảng tin Khoảnh khắc ViOne',
      category: 'Hướng dẫn Hội viên',
      author: 'Ban Truyền Thông',
      published_at: '2026-08-20',
      views: 640,
      status: 'published',
      excerpt: 'Cẩm nang toàn tập giúp hội viên kích hoạt thẻ cứng NFC, quét danh thiếp thông minh và chia sẻ thành tựu kinh doanh trên khoảnh khắc doanh nhân.',
      association_id: assocId,
      content: 'ViOne App chính thức phát hành phiên bản mới với nhiều cải tiến vượt trội về chạm danh thiếp và tương tác mạng xã hội doanh nhân...',
    },
  ];

  for (const n of newsList) {
    await client.query(`
      INSERT INTO public.news (
        id, code, title, category, author, published_at, views, status, excerpt, content, association_id, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::uuid, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        author = EXCLUDED.author,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        views = EXCLUDED.views,
        status = EXCLUDED.status,
        updated_at = NOW();
    `, [n.id, n.code, n.title, n.category, n.author, n.published_at, n.views, n.status, n.excerpt, n.content, n.association_id]);
  }
  console.log(`✓ Seeded ${newsList.length} news articles in public.news`);

  // 5. Seed Email Campaigns (public.email_campaigns)
  await client.query(`DELETE FROM public.email_campaigns WHERE id::text LIKE 'c1983000-0000-4000-8000-00000000008%';`);

  const campaigns = [
    {
      id: 'c1983000-0000-4000-8000-000000000081',
      code: 'CAM-1983-01',
      name: 'Thư mời Đại hội Thường niên & Gala Dinner Doanh nhân C-Level 2026',
      subject: '[CEO 1983] Thư mời trân trọng tham dự Đại hội Thường niên & Gala Dinner 2026',
      audience: 'Toàn bộ hội viên chính thức',
      sent: 215,
      opened: 198,
      clicked: 142,
      sent_at: '2026-09-10',
      status: 'sent',
      association_id: assocId,
    },
    {
      id: 'c1983000-0000-4000-8000-000000000082',
      code: 'CAM-1983-02',
      name: 'Bản tin Doanh nhân CEO 1983 Định kỳ Tháng 9/2026',
      subject: '[CEO 1983 Newsletter] Tiêu điểm kinh tế, cơ hội giao thương & sự kiện nổi bật',
      audience: 'Hội viên & Đối tác chiến lược',
      sent: 350,
      opened: 285,
      clicked: 196,
      sent_at: '2026-09-08',
      status: 'sent',
      association_id: assocId,
    },
    {
      id: 'c1983000-0000-4000-8000-000000000083',
      code: 'CAM-1983-03',
      name: 'Thông báo Gia hạn Hội phí Thường niên & Quyền lợi Thẻ VIP Số 2026-2027',
      subject: '[Thông báo] Hoàn tất nộp hội phí thường niên và gia hạn quyền lợi thẻ VIP',
      audience: 'Hội viên đến hạn và quá hạn',
      sent: 45,
      opened: 41,
      clicked: 32,
      sent_at: '2026-09-01',
      status: 'sent',
      association_id: assocId,
    },
    {
      id: 'c1983000-0000-4000-8000-000000000084',
      code: 'CAM-1983-04',
      name: 'Khảo sát Nhu cầu Xúc tiến Thương mại Quốc tế Quý 4/2026',
      subject: '[Khảo sát] Ý kiến hội viên về chương trình xúc tiến thương mại tại Nhật Bản & Hàn Quốc',
      audience: 'Ban Xúc tiến & Hội viên quan tâm xuất khẩu',
      sent: 120,
      opened: 0,
      clicked: 0,
      sent_at: '2026-09-20',
      status: 'scheduled',
      association_id: assocId,
    },
  ];

  for (const c of campaigns) {
    await client.query(`
      INSERT INTO public.email_campaigns (
        id, code, name, subject, audience, sent, opened, clicked, sent_at, status, association_id, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11::uuid, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        subject = EXCLUDED.subject,
        audience = EXCLUDED.audience,
        sent = EXCLUDED.sent,
        opened = EXCLUDED.opened,
        clicked = EXCLUDED.clicked,
        status = EXCLUDED.status,
        updated_at = NOW();
    `, [c.id, c.code, c.name, c.subject, c.audience, c.sent, c.opened, c.clicked, c.sent_at, c.status, c.association_id]);
  }
  console.log(`✓ Seeded ${campaigns.length} email campaigns in public.email_campaigns`);

  // 6. Update Member Term Ends (public.members) for Renewal Tabs
  // Distribute the 16 members evenly into:
  // - Renewed (Đã gia hạn): renewed_at set, fee_paid=true, payment_status='paid'
  // - Upcoming (Sắp hết hạn): term_end in ~45-90 days
  // - Due (Đến hạn): term_end in ~10-25 days
  // - Overdue (Quá hạn): term_end in the past, fee_paid=false, payment_status='unpaid'
  const memberRows = await client.query('SELECT id, code, name FROM public.members ORDER BY code ASC');
  console.log(`Found ${memberRows.rows.length} members to update term dates.`);

  const today = new Date();
  const formatYmd = (d) => d.toISOString().slice(0, 10);

  const updates = [
    // 1-4: Renewed
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: '2026-08-15', term_end: '2027-08-15', new_term_end: '2027-08-15' },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: '2026-09-01', term_end: '2027-09-01', new_term_end: '2027-09-01' },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: '2026-09-05', term_end: '2027-09-05', new_term_end: '2027-09-05' },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: '2026-09-10', term_end: '2027-09-10', new_term_end: '2027-09-10' },

    // 5-8: Due (Đến hạn: 5 đến 25 ngày tới)
    { status: 'active', payment_status: 'pending', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 10 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'pending', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 15 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 20 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 28 * 86400000)), new_term_end: null },

    // 9-12: Overdue (Quá hạn: 15 đến 60 ngày trước)
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() - 15 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() - 30 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() - 45 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'unpaid', fee_paid: false, renewed_at: null, term_end: formatYmd(new Date(Date.now() - 60 * 86400000)), new_term_end: null },

    // 13-16: Upcoming (Sắp hết hạn: 45 đến 120 ngày tới)
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 45 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 60 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 90 * 86400000)), new_term_end: null },
    { status: 'active', payment_status: 'paid', fee_paid: true, renewed_at: null, term_end: formatYmd(new Date(Date.now() + 120 * 86400000)), new_term_end: null },
  ];

  for (let i = 0; i < memberRows.rows.length; i++) {
    const m = memberRows.rows[i];
    const u = updates[i % updates.length];
    await client.query(`
      UPDATE public.members
      SET
        term_end = $1::date,
        payment_status = $2,
        fee_paid = $3,
        renewed_at = $4::date,
        new_term_end = $5::date,
        association_id = $6::uuid,
        updated_at = NOW()
      WHERE id = $7
    `, [u.term_end, u.payment_status, u.fee_paid, u.renewed_at, u.new_term_end, assocId, m.id]);
  }
  console.log('✓ Successfully updated term dates for all members.');

  await client.end();
  console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
