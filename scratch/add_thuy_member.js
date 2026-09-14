const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'a77c1760-db01-491d-ad6a-b07f93a40d80';
  const email = 'thuylt313@gmail.com';
  
  const existing = await prisma.$queryRaw`
    SELECT id, code, name FROM public.members WHERE LOWER(email) = LOWER(${email}) OR user_id = ${userId}::uuid OR id = ${userId}
  `.catch(() => []);
  
  if (existing.length > 0) {
    console.log('Member already exists:', existing);
    return;
  }

  const res = await prisma.$executeRaw`
    INSERT INTO public.members (
      id, code, name, contact, email, phone, type, level, industry, region,
      status, joined_at, fee_year, fee_paid, address, about, payment_status,
      user_id, association_id, created_at, updated_at
    ) VALUES (
      ${userId}, 'M1983-017', 'Lê Thị Thu Thủy', 'Lê Thị Thu Thủy',
      ${email}, '0983313313', 'corporate', 'standard', 'Công nghệ & Đầu tư', 'Hà Nội',
      'active', CURRENT_DATE, 2026, true, 'Hà Nội', 'Hội viên CLB Doanh Nhân CEO 1983', 'paid',
      ${userId}::uuid, 'c1983000-0000-4000-8000-000000001983'::uuid, now(), now()
    )
  `;
  console.log('Inserted member for thuy:', res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
