const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('1. Updating public.associations...');
  await prisma.$executeRaw`
    UPDATE public.associations
    SET logo_url = '/ceo1983-logo.png',
        tagline = 'Nâng tầm giá trị • Tiên phong kết nối'
    WHERE id = 'c1983000-0000-4000-8000-000000001983'::uuid
  `;
  console.log('Updated association logo and tagline.');

  console.log('2. Seeding event registrations for all members...');
  const members = await prisma.$queryRaw`
    SELECT id, code, name, email FROM public.members
    WHERE association_id = 'c1983000-0000-4000-8000-000000001983'::uuid
  `;
  console.log(`Found ${members.length} members in association.`);

  const events = [
    {
      id: 'EVT-1983-GALA-2026',
      name: 'Đại Hội Doanh Nhân CEO 1983 & Gala Vinh Danh 2026',
      date: '2026-03-28'
    },
    {
      id: 'EVT-CEO1983-2026-GALA',
      name: 'Diễn Đàn Giao Thương B2B & Kết Nối Chuỗi Cung Ứng',
      date: '2026-04-15'
    }
  ];

  for (const m of members) {
    if (!m.code) continue;
    for (let eIdx = 0; eIdx < events.length; eIdx++) {
      const ev = events[eIdx];
      const regId = `REG-${m.code.replace(/[^a-zA-Z0-9]/g, '')}-${eIdx + 1}`;
      
      await prisma.$executeRaw`
        INSERT INTO public.event_registrations (
          id, event_id, member_code, member_name, email,
          registered_at, status, ticket_type, association_id,
          payment_status, payment_method, payment_amount,
          seat_assignment, qr_payload, checked_in_at,
          created_at, updated_at
        ) VALUES (
          ${regId}, ${ev.id}, ${m.code}, ${m.name}, ${m.email || ''},
          ${ev.date}::date, 'attended', 'VIP', 'c1983000-0000-4000-8000-000000001983'::uuid,
          'paid', 'bank_transfer', 2000000,
          'Bàn Danh Dự VIP 01', ${`QR-${regId}`}, now(),
          now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = 'attended',
          checked_in_at = now(),
          member_code = EXCLUDED.member_code,
          member_name = EXCLUDED.member_name
      `.catch(err => console.log(`Warning inserting reg ${regId}:`, err.message));
    }
  }
  console.log('Seeded event registrations for all members.');

  console.log('3. Seeding official Zalo-style transaction message from admin to members...');
  const paymentMsg = '[action:payment|amount:20000000|invoice:HD-2026-001|qr:https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=20000000&addInfo=HD-2026-001|due:31/03/2026|desc:H%E1%BB%99i%20ph%C3%AD%20th%C6%B0%E1%BB%9Dng%20ni%C3%AAn%202026%20-%20CLB%20Doanh%20Nh%C3%A2n%20CEO%201983]';
  const meetingMsg = '[action:meeting|title:H%E1%BB%8Dp%20Ban%20Ch%E1%BA%A5p%20H%C3%A0nh%20CEO%201983%20Th%C3%A1ng%203|time:14:00%20-%2028/03/2026|location:Trung%20t%C3%A2m%20H%E1%BB%99i%20Ngh%E1%BB%8B%20Qu%E1%BB%91c%20Gia%20H%C3%A0%20N%E1%BB%99i|link:https://meet.vione.vn/ceo1983-bch|desc:Phi%C3%AAn%20h%E1%BB%8Dp%20chi%E1%BA%BFn%20l%C6%B0%E1%BB%A3c%20tri%E1%BB%83n%20khai%20giao%20th%C6%B0%C6%A1ng%20to%C3%A0n%20di%E1%BB%87n]';

  for (const m of members) {
    if (!m.code) continue;
    const targetCode = String(m.code).toLowerCase();
    
    // Check if message already exists
    const existing = await prisma.$queryRaw`
      SELECT id FROM public.messages 
      WHERE from_id = 'admin' AND LOWER(to_id) = ${targetCode}
      LIMIT 1
    `.catch(() => []);

    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES 
          (gen_random_uuid(), 'admin', ${targetCode}, 'Chào mừng quý Anh/Chị đến với Kênh Thông Báo Chính Thức của Ban Thư Ký CLB Doanh Nhân CEO 1983!', now() - interval '2 days'),
          (gen_random_uuid(), 'admin', ${targetCode}, ${paymentMsg}, now() - interval '1 hour'),
          (gen_random_uuid(), 'admin', ${targetCode}, ${meetingMsg}, now() - interval '10 minutes')
      `.catch(err => console.log('Warning inserting msgs:', err.message));
    }
  }
  console.log('Seeded official transaction & meeting messages.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
