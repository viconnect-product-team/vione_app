const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial sponsor packages and sponsors...');

  const assocRows = await prisma.$queryRawUnsafe(`SELECT id FROM public.associations LIMIT 1;`);
  const assocId = assocRows[0]?.id || 'ba000000-0000-4000-8000-000000000001';

  // Clear existing sponsors to ensure fresh clean state
  await prisma.$executeRawUnsafe(`DELETE FROM public.sponsors;`);
  await prisma.$executeRawUnsafe(`DELETE FROM public.sponsor_packages;`);

  // Seed Sponsor Packages
  const packages = [
    {
      id: 'PKG-PLATINUM-CASH',
      tier: 'platinum',
      price: BigInt(200000000), // 200 Triệu VNĐ
      package_type: 'cash',
      in_kind_description: 'Tài trợ ngân sách truyền thông & giải thưởng chính sự kiện',
      benefits: ['Logo độc quyền tại vị trí trung tâm sân khấu', '1 bàn tiệc VIP 10 khách danh dự', 'Bài phát biểu 10 phút tại lễ khai mạc', 'Phát video phóng sự doanh nghiệp trên màn hình LED'],
      available: 2,
      sold: 1,
    },
    {
      id: 'PKG-GOLD-INKIND',
      tier: 'gold',
      price: BigInt(100000000), // Định giá quy đổi 100 Triệu VNĐ
      package_type: 'in_kind',
      in_kind_description: 'Tài trợ 200 bộ quà tặng cao cấp cho toàn bộ CEO & C-Level tham dự',
      benefits: ['Đặt gian hàng trải nghiệm sản phẩm tại sảnh chính', 'Logo trên backdrop & ấn phẩm truyền thông', '5 vé VIP tham dự toàn bộ chương trình', 'Giới thiệu sản phẩm trong tài liệu sự kiện'],
      available: 5,
      sold: 2,
    },
    {
      id: 'PKG-SILVER-CASH',
      tier: 'silver',
      price: BigInt(50000000), // 50 Triệu VNĐ
      package_type: 'cash',
      in_kind_description: 'Tài trợ chi phí hạ tầng âm thanh, ánh sáng & livestream chuyên nghiệp',
      benefits: ['Logo trên website và thư mời đại biểu', '3 vé VIP hàng ghế đầu', 'Trưng bày ấn phẩm brochure tại quầy check-in'],
      available: 10,
      sold: 3,
    },
    {
      id: 'PKG-BRONZE-INKIND',
      tier: 'bronze',
      price: BigInt(20000000), // Định giá 20 Triệu VNĐ
      package_type: 'in_kind',
      in_kind_description: 'Tài trợ toàn bộ teabreak, tiệc trà & cà phê cao cấp giờ giải lao',
      benefits: ['Bảng tên nhà tài trợ tại khu vực Tea-break', '2 vé tham dự sự kiện', 'Logo trong clip tổng kết sự kiện'],
      available: 15,
      sold: 4,
    }
  ];

  for (const pkg of packages) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.sponsor_packages (id, tier, price, benefits, available, sold, association_id, package_type, in_kind_description, created_at, updated_at)
      VALUES ($1, $2, $3, $4::text[], $5, $6, $7::uuid, $8, $9, NOW(), NOW())
    `, pkg.id, pkg.tier, pkg.price, pkg.benefits, pkg.available, pkg.sold, assocId, pkg.package_type, pkg.in_kind_description);
  }
  console.log('Seeded 4 sponsor packages.');

  // Seed Sponsors
  const sampleSponsors = [
    {
      id: 'SP-001',
      name: 'Tập đoàn Công nghệ SunTech Global',
      tier: 'platinum',
      sponsor_type: 'regular', // Thường xuyên ổn định
      package_type: 'cash',    // Bằng tiền
      in_kind_description: null,
      contact: 'Nguyễn Văn Hùng (Chủ tịch HĐQT)',
      email: 'hung.nv@suntech-global.vn',
      phone: '0908 123 456',
      amount: BigInt(200000000),
      events: 8,
      since: '2023-01-15',
      status: 'active'
    },
    {
      id: 'SP-002',
      name: 'Công ty Cổ phần Trầm Hương & Yến Sào Hoàng Gia',
      tier: 'gold',
      sponsor_type: 'regular', // Thường xuyên ổn định
      package_type: 'in_kind', // Hiện vật
      in_kind_description: '200 hộp quà tặng Yến Sào & Trầm Hương Thượng Hạng dành tặng tất cả CEO',
      contact: 'Trần Mai Phương (Tổng Giám Đốc)',
      email: 'phuong.tm@hoanggiagroup.vn',
      phone: '0912 345 678',
      amount: BigInt(100000000),
      events: 5,
      since: '2023-06-20',
      status: 'active'
    },
    {
      id: 'SP-003',
      name: 'Ngân hàng TMCP Tiên Phong (TPBank) - Khối SME',
      tier: 'silver',
      sponsor_type: 'new',     // Nhà tài trợ mới
      package_type: 'cash',    // Bằng tiền
      in_kind_description: null,
      contact: 'Lê Minh Tuấn (Giám Đốc Chi Nhánh)',
      email: 'tuanlm@tpbank.com.vn',
      phone: '0933 888 999',
      amount: BigInt(50000000),
      events: 1,
      since: '2026-08-01',
      status: 'active'
    },
    {
      id: 'SP-004',
      name: 'Chuỗi Cà Phê Đặc Sản Artisan Roastery',
      tier: 'bronze',
      sponsor_type: 'new',     // Nhà tài trợ mới
      package_type: 'in_kind', // Hiện vật
      in_kind_description: 'Toàn bộ quầy Barista pha cà phê tươi hảo hạng & bánh ngọt Teabreak cho 300 khách',
      contact: 'Phạm Hồng Đăng (Founder & Master Roaster)',
      email: 'dang.pham@artisan.vn',
      phone: '0977 654 321',
      amount: BigInt(20000000),
      events: 1,
      since: '2026-09-01',
      status: 'active'
    }
  ];

  for (const s of sampleSponsors) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.sponsors (id, name, tier, sponsor_type, package_type, in_kind_description, contact, email, phone, amount, events, since, status, association_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::date, $13, $14::uuid, NOW(), NOW())
    `, s.id, s.name, s.tier, s.sponsor_type, s.package_type, s.in_kind_description, s.contact, s.email, s.phone, s.amount, s.events, s.since, s.status, assocId);
  }
  console.log('Seeded 4 sample sponsors.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
