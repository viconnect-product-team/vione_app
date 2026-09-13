const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';
const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000002';

function daysBetween(from, toIso) {
  const to = new Date(toIso);
  to.setHours(0, 0, 0, 0);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function calculateRenewalStatus(m) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawTermEnd = m.term_end ? (m.term_end instanceof Date ? m.term_end.toISOString().slice(0, 10) : String(m.term_end).slice(0, 10)) : today.toISOString().slice(0, 10);
  const daysLeft = daysBetween(today, rawTermEnd);
  const isRenewed = Boolean(m.renewed_at);

  if (isRenewed) return 'renewed';
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 30) return 'due';
  return 'upcoming';
}

async function runE2ETests() {
  console.log('=====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Renewal Data Consistency & Categorization ──────────────────────
  console.log('--- TEST 1: Renewal Calculation & Member Term States ---');
  const members = await prisma.$queryRawUnsafe(`
    SELECT id, code, name, term_end, renewed_at, status 
    FROM public.members 
    WHERE association_id = $1::uuid
  `, DEFAULT_ASSOC_ID);

  assert(members.length === 16, `Total members in CEO 1983 is 16 (Actual: ${members.length})`);

  let renewedCount = 0;
  let dueCount = 0;
  let overdueCount = 0;
  let upcomingCount = 0;

  for (const m of members) {
    const st = calculateRenewalStatus(m);
    if (st === 'renewed') renewedCount++;
    else if (st === 'due') dueCount++;
    else if (st === 'overdue') overdueCount++;
    else upcomingCount++;
  }

  console.log(`  📊 Distribution: Renewed=${renewedCount}, Due=${dueCount}, Overdue=${overdueCount}, Upcoming=${upcomingCount}`);
  assert(renewedCount === 4, `Renewed members is exactly 4 (Actual: ${renewedCount})`);
  assert(dueCount === 4, `Due members (within 30d) is exactly 4 (Actual: ${dueCount})`);
  assert(overdueCount === 4, `Overdue members is exactly 4 (Actual: ${overdueCount})`);
  assert(upcomingCount === 4, `Upcoming members is exactly 4 (Actual: ${upcomingCount})`);

  // ── TEST 2: Benefits & Perks Database Binding & CRUD ────────────────────────
  console.log('\n--- TEST 2: Association Benefits & Perks Database Integrity & CRUD ---');
  const existingBenefits = await prisma.$queryRawUnsafe(`
    SELECT id, title_vi, sort_order FROM public.association_benefits 
    WHERE association_id = $1::uuid
    ORDER BY sort_order ASC
  `, DEFAULT_ASSOC_ID);

  assert(existingBenefits.length >= 3, `Association benefits table has canonical rows (Actual: ${existingBenefits.length})`);

  // Test insert new benefit
  const testBenefitId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.association_benefits (id, association_id, title_vi, desc_vi, sort_order)
    VALUES ($1::uuid, $2::uuid, 'Quyền lợi Test E2E', 'Mô tả quyền lợi kiểm thử', 99)
  `, testBenefitId, DEFAULT_ASSOC_ID);

  const insertedBenefit = await prisma.$queryRawUnsafe(`
    SELECT id, title_vi FROM public.association_benefits WHERE id = $1::uuid
  `, testBenefitId);
  assert(insertedBenefit.length === 1 && insertedBenefit[0].title_vi === 'Quyền lợi Test E2E', 'Successfully created benefit via CRUD');

  // Test update benefit
  await prisma.$executeRawUnsafe(`
    UPDATE public.association_benefits SET title_vi = 'Quyền lợi Test E2E Updated' WHERE id = $1::uuid
  `, testBenefitId);
  const updatedBenefit = await prisma.$queryRawUnsafe(`
    SELECT title_vi FROM public.association_benefits WHERE id = $1::uuid
  `, testBenefitId);
  assert(updatedBenefit[0].title_vi === 'Quyền lợi Test E2E Updated', 'Successfully updated benefit via CRUD');

  // Clean up
  await prisma.$executeRawUnsafe(`DELETE FROM public.association_benefits WHERE id = $1::uuid`, testBenefitId);
  console.log('  🧹 Cleaned up test benefit');

  // ── TEST 3: Audit & Activity Logging ───────────────────────────────────────
  console.log('\n--- TEST 3: Activity & Audit Logging Persistence ---');
  const testLogId = 'f1e2d3c4-b5a6-4f5e-8d9c-0b1a2c3d4e5f';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.activity_log (id, code, "user", action, target, category, at, association_id)
    VALUES ($1::uuid, 'ACT-TEST-001', 'admin@connect.vn', 'Chấp nhận cuộc gặp', 'Cuộc gặp B2B', 'event', 'Vừa xong', $2::uuid)
  `, testLogId, DEFAULT_ASSOC_ID);

  const retrievedLog = await prisma.$queryRawUnsafe(`
    SELECT id, action, target, category FROM public.activity_log WHERE id = $1::uuid
  `, testLogId);
  assert(retrievedLog.length === 1 && retrievedLog[0].action === 'Chấp nhận cuộc gặp', 'Activity log correctly records user meeting actions & operations');

  await prisma.$executeRawUnsafe(`DELETE FROM public.activity_log WHERE id = $1::uuid`, testLogId);
  console.log('  🧹 Cleaned up test activity log');

  // ── TEST 4: Member Creation & Association Linkage ─────────────────────────
  console.log('\n--- TEST 4: Member Creation Flow (Individual) ---');
  const testMemberId = 'MEM-E2E-TEST-001';
  const testMemberCode = 'TEST-MEM-99';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.members (id, association_id, code, name, email, phone, status, type, level, industry, region, joined_at, fee_year)
    VALUES ($1, $2::uuid, $3, 'Nguyễn Văn Test E2E', 'test.member@e2e.vn', '0999888777', 'active', 'individual', 'memberLevel.small', 'ind.it', 'region.north', now()::date, 2026)
  `, testMemberId, DEFAULT_ASSOC_ID, testMemberCode);

  const createdMember = await prisma.$queryRawUnsafe(`
    SELECT id, code, name, association_id, type FROM public.members WHERE id = $1
  `, testMemberId);
  assert(createdMember.length === 1 && createdMember[0].code === testMemberCode, 'Successfully created new member linked to association');

  await prisma.$executeRawUnsafe(`DELETE FROM public.members WHERE id = $1`, testMemberId);
  console.log('  🧹 Cleaned up test member');

  // ── TEST 5: Enterprise / Company Creation Flow ─────────────────────────────
  console.log('\n--- TEST 5: Enterprise / Company Creation Flow (type=company) ---');
  const testCompanyMemberId = 'COM-E2E-TEST-002';
  const testCompanyCode = 'TEST-COM-88';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.members (id, association_id, code, name, tax_code, industry, region, joined_at, fee_year, email, type, level, status)
    VALUES ($1, $2::uuid, $3, 'Công Ty TNHH Thử Nghiệm E2E', '0109999999', 'ind.it', 'region.north', now()::date, 2026, 'contact@e2e-company.vn', 'company', 'memberLevel.large', 'active')
  `, testCompanyMemberId, DEFAULT_ASSOC_ID, testCompanyCode);

  const createdCompany = await prisma.$queryRawUnsafe(`
    SELECT id, name, tax_code, type FROM public.members WHERE id = $1
  `, testCompanyMemberId);
  assert(createdCompany.length === 1 && createdCompany[0].tax_code === '0109999999' && createdCompany[0].type === 'company', 'Successfully created enterprise/company profile');

  await prisma.$executeRawUnsafe(`DELETE FROM public.members WHERE id = $1`, testCompanyMemberId);
  console.log('  🧹 Cleaned up test company');

  // ── TEST 6: Event Creation & Attendee Registration Flow ───────────────────
  console.log('\n--- TEST 6: Event Creation & Registration with QR Flow ---');
  const testEventId = 'EVT-E2E-TEST-003';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.events (id, association_id, name, date, location, capacity, status, type)
    VALUES ($1, $2::uuid, 'Đại Hội Doanh Nhân E2E 2026', now() + interval '10 days', 'Trung tâm Hội nghị Quốc gia', 500, 'upcoming', 'forum')
  `, testEventId, DEFAULT_ASSOC_ID);

  const createdEvent = await prisma.$queryRawUnsafe(`
    SELECT id, name, capacity FROM public.events WHERE id = $1
  `, testEventId);
  assert(createdEvent.length === 1 && createdEvent[0].name === 'Đại Hội Doanh Nhân E2E 2026', 'Successfully created event');

  const testRegId = 'REG-E2E-TEST-004';
  const testTicketCode = 'TKT-E2E-888';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.event_registrations (id, event_id, member_code, member_name, email, qr_payload, seat_assignment, status, ticket_type)
    VALUES ($1, $2, 'TEST-MEM-99', 'Đại Biểu E2E VIP', 'daibieu@vip.vn', $3, 'Bàn VIP 01', 'confirmed', 'VIP Pass')
  `, testRegId, testEventId, testTicketCode);

  const createdReg = await prisma.$queryRawUnsafe(`
    SELECT id, qr_payload, seat_assignment, status FROM public.event_registrations WHERE id = $1
  `, testRegId);
  assert(createdReg.length === 1 && createdReg[0].qr_payload === testTicketCode, 'Successfully registered attendee with seat assignment & ticket QR payload');

  await prisma.$executeRawUnsafe(`DELETE FROM public.event_registrations WHERE id = $1`, testRegId);
  await prisma.$executeRawUnsafe(`DELETE FROM public.events WHERE id = $1`, testEventId);
  console.log('  🧹 Cleaned up test event & registration');

  // ── TEST 7: Cross-App Notification Flow (ViOne App & Association App) ───────
  console.log('\n--- TEST 7: Cross-App Notification Flow (ViOne App & Association App) ---');
  const testNotifId = 'f6a7b8c9-d0e1-4f5a-8b2c-3d4e5f6a7b8c';
  await prisma.$executeRawUnsafe(`
    INSERT INTO public.business_notifications (
      id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
      title_key, body_key, safe_display_data, action_kind, action_label_key,
      priority, status, dedupe_key, app_scope, target_app
    ) VALUES (
      $1::uuid, $2::uuid, 'event', 'evt-cross-app', 'event_registered', 'event_ticket_confirmation',
      'Vé mời sự kiện mới', 'Bạn đã đăng ký tham dự Đại Hội Doanh Nhân E2E',
      '{"ticketCode":"TKT-E2E-888","seat":"Bàn VIP 01"}'::jsonb, 'view_ticket', 'Xem vé',
      'high', 'delivered', 'notif:test-e2e-888', 'vione_app', 'vione_app'
    )
  `, testNotifId, ADMIN_USER_ID);

  const notif = await prisma.$queryRawUnsafe(`
    SELECT id, app_scope, target_app, safe_display_data FROM public.business_notifications WHERE id = $1::uuid
  `, testNotifId);
  assert(notif.length === 1 && notif[0].target_app === 'vione_app', 'Cross-app notification successfully recorded with app_scope & target_app');

  await prisma.$executeRawUnsafe(`DELETE FROM public.business_notifications WHERE id = $1::uuid`, testNotifId);
  console.log('  🧹 Cleaned up test notification');

  // ── TEST 8: Admin Member Account Resolution in CEO 1983 ─────────────────────
  console.log('\n--- TEST 8: Admin Member Account Resolution in CEO 1983 ---');
  const adminMember = await prisma.$queryRawUnsafe(`
    SELECT id, code, name, association_id FROM public.members 
    WHERE id = $1 OR email = 'admin@connect.vn'
  `, ADMIN_USER_ID);

  assert(adminMember.length > 0, `admin@connect.vn found in members (Count: ${adminMember.length})`);
  assert(adminMember[0].association_id === DEFAULT_ASSOC_ID, `admin@connect.vn belongs to association CEO 1983 (${DEFAULT_ASSOC_ID})`);

  console.log('\n=====================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E Test Error:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
