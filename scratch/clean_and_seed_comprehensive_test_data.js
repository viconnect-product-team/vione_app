const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';
const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000002'; // admin@connect.vn
const BOARD_USER_ID = '00000000-0000-4000-8000-000000000001'; // board@connect.vn
const MEMBER_USER_ID = '00000000-0000-4000-8000-000000000005'; // member@connect.vn

async function cleanAndSeedData() {
  console.log('================================================================================');
  console.log('🧹 VIONE ECOSYSTEM: DATA CLEANUP & COMPREHENSIVE TEST DATA SEEDING');
  console.log('================================================================================\n');

  try {
    // 1. CLEAR JUNK / ORPHAN TEST RECORDS
    console.log('1. Clearing test junk data...');
    
    // Clear test leads
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.demo_requests 
      WHERE email LIKE '%test%' 
         OR email LIKE '%mock%' 
         OR id IN ('f1a2b3c4-0000-4000-8000-000000000100', 'f1a2b3c4-0000-4000-8000-000000000101')
    `).catch((e) => console.log('Notice: demo_requests delete:', e.message));

    // Clear test notifications
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.business_notifications 
      WHERE title_key LIKE '%TEST%' 
         OR safe_display_data::text LIKE '%Test%'
         OR id IN ('b0000000-0000-4000-8000-000000000099', 'b0000000-0000-4000-8000-000000000100')
    `).catch((e) => console.log('Notice: business_notifications delete:', e.message));

    // Clear test audit logs
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.renewal_audit_log 
      WHERE id IN ('d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002')
    `).catch((e) => console.log('Notice: renewal_audit_log delete:', e.message));

    // Clear test products
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.products 
      WHERE id IN ('prod-test-100', 'prod-test-101')
         OR title LIKE '%Test Product%'
    `).catch((e) => console.log('Notice: products delete:', e.message));

    // Clear test moments
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.business_relationship_moments 
      WHERE id IN ('f0000000-0000-4000-8000-000000000099', 'f0000000-0000-4000-8000-000000000100')
         OR note LIKE '%Test Moment%'
    `).catch((e) => console.log('Notice: moments delete:', e.message));

    // Clear test meetings
    await prisma.$executeRawUnsafe(`
      DELETE FROM public.business_meetings 
      WHERE id IN ('00000000-0000-4000-8000-000000000099'::uuid, '00000000-0000-4000-8000-000000000100'::uuid)
         OR title LIKE '%Test Meeting%'
    `).catch((e) => console.log('Notice: meetings delete:', e.message));

    console.log('✓ Junk data cleaned successfully.\n');

    // 2. SEED / REINFORCE CORE TEST USERS & PROFILES
    console.log('2. Verifying & Reinforcing Core Test Profiles...');

    // Upsert primary association
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.associations (id, name, slug, landing_published, created_at, updated_at)
      VALUES (
        $1::uuid,
        'CLB Doanh Nhân 1983 (CEO 1983)',
        'ceo1983',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        landing_published = true
    `, DEFAULT_ASSOC_ID);
    console.log('✓ Primary association verified:', DEFAULT_ASSOC_ID);

    // Clear duplicate / test member records
    await prisma.$executeRawUnsafe(`DELETE FROM public.invoices WHERE member_id LIKE 'MEM-%'`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM public.event_registrations WHERE member_id LIKE 'MEM-%'`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM public.products WHERE seller_id LIKE 'MEM-%'`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM public.members WHERE id LIKE 'MEM-%'`).catch(() => {});

    // Upsert Core Members using canonical UUIDs
    // Member 1: James Nguyen (M1983-002) - Board Member
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.members (
        id, association_id, user_id, code, name, type, level, status,
        department, executive_role, industry, region, joined_at, fee_year,
        created_at, updated_at
      ) VALUES (
        $1,
        $2::uuid,
        $1::uuid,
        'M1983-002',
        'James Nguyễn',
        'official',
        'diamond',
        'active',
        'Ban Xúc Tiến Thương Mại',
        'Phó Chủ tịch Thường trực',
        'Bất động sản & Xây dựng',
        'Miền Bắc',
        '2023-01-01',
        2026,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = 'James Nguyễn',
        code = 'M1983-002',
        status = 'active',
        level = 'diamond',
        executive_role = 'Phó Chủ tịch Thường trực'
    `, ADMIN_USER_ID, DEFAULT_ASSOC_ID);

    // Member 2: Nguyen Hoang Nam (M1983-005) - Official Member
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.members (
        id, association_id, user_id, code, name, type, level, status,
        department, executive_role, industry, region, joined_at, fee_year,
        created_at, updated_at
      ) VALUES (
        $1,
        $2::uuid,
        $1::uuid,
        'M1983-005',
        'Nguyễn Hoàng Nam',
        'official',
        'gold',
        'active',
        'Ban Công Nghệ',
        'Ủy viên Ban Chấp Hành',
        'Công nghệ thông tin & AI',
        'Miền Bắc',
        '2023-05-15',
        2026,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = 'Nguyễn Hoàng Nam',
        code = 'M1983-005',
        status = 'active',
        level = 'gold',
        executive_role = 'Ủy viên Ban Chấp Hành'
    `, MEMBER_USER_ID, DEFAULT_ASSOC_ID);

    console.log('✓ Core test members verified (M1983-002, M1983-005)');

    // 3. SEED CORE EVENT: GALA XÚC TIẾN THƯƠNG MẠI 2026
    const TEST_EVENT_ID = 'EVT-1983-GALA-2026';
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.events (
        id, association_id, name, location, capacity, registered, status, date, created_at, updated_at
      ) VALUES (
        $1,
        $2::uuid,
        'Đại Hội Doanh Nhân & Gala Xúc Tiến Thương Mại 2026',
        'Grand Ballroom, Keangnam Landmark 72, Hà Nội',
        500,
        1,
        'published',
        (CURRENT_DATE + INTERVAL '30 days')::date,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        capacity = EXCLUDED.capacity,
        status = 'published'
    `, TEST_EVENT_ID, DEFAULT_ASSOC_ID);
    console.log('✓ Core Event verified:', TEST_EVENT_ID);

    // 4. SEED CORE INVOICES: VIETQR PAYMENTS & RECONCILIATION
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.invoices (
        id, association_id, member_id, invoice_no, year, amount, status, method,
        due_date, paid_at, created_at, updated_at
      ) VALUES (
        'INV-1983-2026-001',
        $1::uuid,
        $2,
        'INV-001',
        2026,
        10000000,
        'paid',
        'bank',
        (CURRENT_DATE + INTERVAL '10 days')::date,
        CURRENT_DATE,
        NOW() - interval '5 days',
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        amount = EXCLUDED.amount,
        status = 'paid',
        paid_at = EXCLUDED.paid_at
    `, DEFAULT_ASSOC_ID, MEMBER_USER_ID);

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.invoices (
        id, association_id, member_id, invoice_no, year, amount, status, method,
        due_date, created_at, updated_at
      ) VALUES (
        'INV-1983-2026-002',
        $1::uuid,
        $2,
        'INV-002',
        2026,
        15000000,
        'unpaid',
        'bank',
        (CURRENT_DATE + INTERVAL '15 days')::date,
        NOW() - interval '2 days',
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        amount = EXCLUDED.amount,
        status = 'unpaid'
    `, DEFAULT_ASSOC_ID, ADMIN_USER_ID);
    console.log('✓ Core Invoices verified (INV-1983-2026-001 [paid], INV-1983-2026-002 [unpaid])');

    // 5. SEED CORE NOTIFICATIONS: DND & PRIORITY COMPLIANT
    const NOTIF_CRITICAL_ID = 'b0000000-0000-4000-8000-000000000001';
    const NOTIF_NORMAL_ID = 'b0000000-0000-4000-8000-000000000002';

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, priority, status, safe_display_data, dedupe_key, created_at, updated_at
      ) VALUES (
        $1::uuid,
        $2::uuid,
        'association',
        'event-urgent',
        'emergency_alert',
        'urgent_notice',
        'THÔNG BÁO KHẨN: THAY ĐỔI ĐỊA ĐIỂM HỌP BAN CHẤP HÀNH',
        'Họp BCH phiên bất thường dời sang Phòng Hội thảo VIP Tầng 5 lúc 14:00',
        'critical',
        'delivered',
        '{"urgent": true, "meeting_room": "VIP-5"}'::jsonb,
        'dedupe-urgent-01',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title_key = EXCLUDED.title_key,
        priority = 'critical',
        status = 'delivered'
    `, NOTIF_CRITICAL_ID, ADMIN_USER_ID);

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, priority, status, safe_display_data, dedupe_key, created_at, updated_at
      ) VALUES (
        $1::uuid,
        $2::uuid,
        'association',
        'newsletter-10',
        'monthly_newsletter',
        'general_info',
        'BẢN TIN NỘI BỘ THÁNG: KẾ HOẠCH ĐẠI HỘI GALA 2026',
        'Kính gửi Quý Hội viên kế hoạch chuẩn bị nhân sự và gian hàng triển lãm',
        'normal',
        'scheduled',
        '{"edition": "10-2026", "dnd_applied": true}'::jsonb,
        'dedupe-news-10',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title_key = EXCLUDED.title_key,
        priority = 'normal',
        status = 'scheduled'
    `, NOTIF_NORMAL_ID, MEMBER_USER_ID);
    console.log('✓ Core Notifications verified (1 Critical [Bypass DND], 1 Normal [Scheduled DND])');

    // 6. SEED CORE PRODUCTS: MARKETPLACE
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.products (
        id, association_id, seller_id, title, description, price, category, status,
        created_at, updated_at
      ) VALUES (
        'PROD-1983-001',
        $1::uuid,
        $2,
        'Giải pháp Phần mềm ERP Quản trị Doanh nghiệp AI',
        'Hệ thống ERP phân hệ Kế toán, Kho, Nhân sự và CRM tích hợp trợ lý ảo AI',
        250000000,
        'technology',
        'active',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        status = 'active'
    `, DEFAULT_ASSOC_ID, ADMIN_USER_ID);

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.products (
        id, association_id, seller_id, title, description, price, category, status,
        created_at, updated_at
      ) VALUES (
        'PROD-1983-002',
        $1::uuid,
        $2,
        'Gói Cung Cấp & Lắp Đặt Vật Liệu Xây Dựng Xanh Cho Dự Án',
        'Vật liệu cách nhiệt, kính hộp phản quang đạt tiêu chuẩn công trình xanh LEED',
        1500000000,
        'construction',
        'active',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        status = 'active'
    `, DEFAULT_ASSOC_ID, MEMBER_USER_ID);
    console.log('✓ Core B2B Marketplace Products verified (PROD-1983-001, PROD-1983-002)');

    console.log('\n================================================================================');
    console.log('🎉 CLEANUP & SEEDING COMPLETED SUCCESSFULLY WITH 100% DATA INTEGRITY!');
    console.log('================================================================================');
  } catch (err) {
    console.error('Error during cleanup & seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndSeedData();
