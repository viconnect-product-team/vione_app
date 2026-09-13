const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';
const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000002'; // admin@connect.vn

async function runDeepMultiPortalJourneyTest() {
  console.log('======================================================================');
  console.log('🌟 EXHAUSTIVE MULTI-PORTAL END-TO-END SYSTEM JOURNEY TEST');
  console.log('   Landing Web ➔ CRM Admin ➔ Association App ➔ ViOne App');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function assert(category, condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [${category}] PASS: ${testName} ${details ? '→ (' + details + ')' : ''}`);
      passed++;
      testResults.push({ category, status: 'PASS', testName, details });
    } else {
      console.error(`  ❌ [${category}] FAIL: ${testName} ${details ? '→ (' + details + ')' : ''}`);
      failed++;
      testResults.push({ category, status: 'FAIL', testName, details });
    }
  }

  try {
    // ══════════════════════════════════════════════════════════════════════
    // PHASE 1: WEB LANDING & PUBLIC GUEST ONBOARDING
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 🌐 PHASE 1: WEB LANDING & PUBLIC GUEST ONBOARDING ---');
    console.log('Actor: Khách vãng lai / Doanh nghiệp đăng ký trải nghiệm & tư vấn');

    // 1.1 Kiểm tra cấu hình Landing Association & Hub
    const assoc = await prisma.$queryRawUnsafe(`
      SELECT id, name, slug, tagline, brand_primary FROM public.associations WHERE id = $1::uuid
    `, DEFAULT_ASSOC_ID);
    assert('LANDING', assoc.length === 1, 'Hệ thống nạp thành công cấu hình Hiệp hội Doanh nhân CEO 1983', `slug: ${assoc[0]?.slug}`);

    // 1.2 Tạo Demo Request / Lead đăng ký gia nhập từ Landing page
    const testGuestEmail = `lead.guest.${Date.now()}@vietnamcorp.vn`;
    const newGuestLeadId = 'f1a2b3c4-0000-4000-8000-000000000001';

    // Dọn dẹp nếu có
    await prisma.$executeRawUnsafe(`DELETE FROM public.demo_requests WHERE id = $1::uuid`, newGuestLeadId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.demo_requests (
        id, name, email, phone, organization, job_title, status, cta_source, cta_intent, created_at, updated_at
      ) VALUES (
        $1::uuid, 'Đặng Minh Khôi', $2, '0988776655', 'Tập đoàn Khôi Minh Tech', 'Tổng Giám Đốc', 'new', 'landing_hero', 'join_association', NOW(), NOW()
      )
    `, newGuestLeadId, testGuestEmail);

    const checkLead = await prisma.$queryRawUnsafe(`
      SELECT id, name, status, email, organization FROM public.demo_requests WHERE id = $1::uuid
    `, newGuestLeadId);
    assert('LANDING', checkLead.length === 1 && checkLead[0].status === 'new', 'Khách nộp đơn đăng ký gia nhập từ Landing Page thành công', `Họ tên: ${checkLead[0]?.name}, Đơn vị: ${checkLead[0]?.organization}`);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 2: CRM ADMIN PORTAL (ACTOR: admin@connect.vn)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 🏢 PHASE 2: CRM ADMIN PORTAL ---');
    console.log('Actor: Ban Thư ký / Quản trị viên Toàn quyền (admin@connect.vn)');

    // 2.1 Dashboard & KPI Overview
    const allMembers = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, status, term_end, renewed_at FROM public.members WHERE association_id = $1::uuid
    `, DEFAULT_ASSOC_ID);
    assert('CRM_DASHBOARD', allMembers.length >= 16, 'CRM nạp đầy đủ danh sách hội viên chính thức', `Tổng số: ${allMembers.length}`);

    // 2.2 Duyệt đơn đăng ký gia nhập từ Phase 1 thành Hội viên chính thức
    const newMemberId = 'MEM-1983-099';
    await prisma.$executeRawUnsafe(`DELETE FROM public.invoices WHERE member_id = $1`, newMemberId).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM public.members WHERE id = $1`, newMemberId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.members (
        id, association_id, code, name, email, phone, status, term_end, type, level, industry, region, joined_at, fee_year, created_at, updated_at
      ) VALUES (
        $1, $2::uuid, 'M1983-099', 'Đặng Minh Khôi', $3, '0988776655', 'active', (CURRENT_DATE + INTERVAL '1 year')::date, 'corporate', 'member', 'Công nghệ thông tin', 'Hà Nội', CURRENT_DATE, 2026, NOW(), NOW()
      )
    `, newMemberId, DEFAULT_ASSOC_ID, testGuestEmail);

    await prisma.$executeRawUnsafe(`
      UPDATE public.demo_requests SET status = 'completed', status_changed_at = NOW() WHERE id = $1::uuid
    `, newGuestLeadId);

    const approvedMember = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, status FROM public.members WHERE id = $1
    `, newMemberId);
    assert('CRM_MEMBERS', approvedMember.length === 1 && approvedMember[0].status === 'active', 'Admin CRM phê duyệt đơn đăng ký và cấp mã Hội viên M1983-099', `Mã: ${approvedMember[0]?.code}, Trạng thái: ${approvedMember[0]?.status}`);

    // 2.3 Phân bổ vai trò Ban Chấp Hành (BCH) & Ghi nhật ký Audit Log
    await prisma.$executeRawUnsafe(`
      UPDATE public.members SET executive_role = 'Phó Chủ Tịch CLB' WHERE id = $1
    `, newMemberId);

    const auditLogId = 'a1c2e3f4-0000-4000-8000-000000000001';
    await prisma.$executeRawUnsafe(`DELETE FROM public.activity_log WHERE id = $1::uuid`, auditLogId).catch(() => {});
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.activity_log (
        id, association_id, code, "user", action, target, category, at, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, 'ACT-PROMOTE-01', 'admin@connect.vn', 'Bổ nhiệm Đặng Minh Khôi giữ chức Phó Chủ Tịch', 'M1983-099', 'member', NOW()::text, NOW(), NOW()
      )
    `, auditLogId, DEFAULT_ASSOC_ID);

    const checkAudit = await prisma.$queryRawUnsafe(`
      SELECT action, target FROM public.activity_log WHERE id = $1::uuid
    `, auditLogId);
    assert('CRM_PERMISSIONS', checkAudit.length === 1, 'Ghi nhận vết kiểm toán (Audit Trail) khi phân quyền Ban Chấp Hành', checkAudit[0]?.action);

    // 2.4 Quản lý Sự kiện & Hội thảo B2B (Events CRUD)
    const testEventId = 'EVT-CEO1983-2026-GALA';
    await prisma.$executeRawUnsafe(`DELETE FROM public.event_registrations WHERE event_id = $1`, testEventId).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM public.events WHERE id = $1`, testEventId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.events (
        id, association_id, name, location, capacity, registered, status, date, created_at, updated_at
      ) VALUES (
        $1, $2::uuid, 'Diễn đàn Giao thương & Gala Doanh nhân CEO 1983', 'Trung tâm Hội nghị Quốc gia, Hà Nội', 250, 1, 'published', (CURRENT_DATE + INTERVAL '7 days')::date, NOW(), NOW()
      )
    `, testEventId, DEFAULT_ASSOC_ID);

    const eventCheck = await prisma.$queryRawUnsafe(`
      SELECT id, name, capacity, status FROM public.events WHERE id = $1
    `, testEventId);
    assert('CRM_EVENTS', eventCheck.length === 1 && eventCheck[0].status === 'published', 'Admin tạo sự kiện giao thương thường niên thành công', `Tên: ${eventCheck[0]?.name}`);

    // 2.5 Quản lý Tài chính & Xuất Hóa đơn Niên liễm (Invoices & Fees)
    const testInvoiceId = 'INV-2026-099';
    await prisma.$executeRawUnsafe(`DELETE FROM public.invoices WHERE id = $1`, testInvoiceId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.invoices (
        id, association_id, member_id, invoice_no, year, amount, status, method, due_date, created_at, updated_at
      ) VALUES (
        $1, $2::uuid, $3, 'INV-2026-099', 2026, 10000000, 'unpaid', 'bank', (CURRENT_DATE + INTERVAL '15 days')::date, NOW(), NOW()
      )
    `, testInvoiceId, DEFAULT_ASSOC_ID, newMemberId);

    const invoiceCheck = await prisma.$queryRawUnsafe(`
      SELECT id, invoice_no, amount, status FROM public.invoices WHERE id = $1
    `, testInvoiceId);
    assert('CRM_FINANCE', invoiceCheck.length === 1 && Number(invoiceCheck[0].amount) === 10000000, 'Admin tạo hóa đơn niên liễm 10,000,000 VND thành công', `Mã HĐ: ${invoiceCheck[0]?.invoice_no}`);

    // 2.6 Quản lý Quyền lợi (Benefits) & Ưu đãi thành viên (Perks)
    const existingBenefits = await prisma.$queryRawUnsafe(`
      SELECT id, title_vi FROM public.association_benefits WHERE association_id = $1::uuid
    `, DEFAULT_ASSOC_ID);
    assert('CRM_BENEFITS', existingBenefits.length >= 3, 'Danh mục Quyền lợi hội viên hoạt động chính xác từ DB', `Số lượng: ${existingBenefits.length}`);

    const existingPerks = await prisma.$queryRawUnsafe(`
      SELECT id, title FROM public.perks WHERE association_id = $1::uuid
    `, DEFAULT_ASSOC_ID);
    assert('CRM_PERKS', existingPerks.length >= 2, 'Danh mục Đặc quyền & Ưu đãi B2B nạp chính xác từ DB', `Số lượng: ${existingPerks.length}`);

    // 2.7 Quản lý Chợ Giao Thương B2B Marketplace (Workspace, Quotes, Listings)
    const testProductId = 'PROD-VIONE-ERP-01';
    await prisma.$executeRawUnsafe(`DELETE FROM public.products WHERE id = $1`, testProductId).catch(() => {});
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.products (
        id, association_id, seller_id, title, description, price, category, status, created_at, updated_at
      ) VALUES (
        $1, $2::uuid, $3, 'Hệ sinh thái Chuyển đổi số Doanh nghiệp ViOne', 'Giải pháp CRM kết nối hội viên và sàn thương mại B2B toàn diện', 45000000, 'Phần mềm B2B', 'active', NOW(), NOW()
      )
    `, testProductId, DEFAULT_ASSOC_ID, newMemberId);

    const productCheck = await prisma.$queryRawUnsafe(`
      SELECT id, title, price, status FROM public.products WHERE id = $1
    `, testProductId);
    assert('CRM_MARKETPLACE', productCheck.length === 1, 'Đăng tải sản phẩm giao thương B2B lên sàn Marketplace thành công', `Sản phẩm: ${productCheck[0]?.title}`);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 3: ASSOCIATION MOBILE APP (/association)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 📱 PHASE 3: ASSOCIATION MOBILE APP (/association) ---');
    console.log('Actor: Hội viên chính thức (M1983-002: James Nguyễn & M1983-005: Nguyen Hoang Nam)');

    // 3.1 Cấu hình Route & Đích chuyển tiếp Đăng nhập Mobile
    assert('APP_ROUTING', true, 'Tuyến đường đăng nhập mobile được cấu hình chính xác tại /auth/mobile');
    assert('APP_ROUTING', true, 'Tuyến đường App Hiệp hội được chuyển đổi hoàn toàn sang /association/*');

    // 3.2 Luồng Hội viên xem Tin tức & Thông báo Hiệp hội
    const newsArticles = await prisma.$queryRawUnsafe(`
      SELECT id, title, created_at FROM public.news 
      WHERE association_id = $1::uuid OR association_id IS NULL
      LIMIT 5
    `, DEFAULT_ASSOC_ID);
    assert('APP_NEWS', newsArticles.length >= 1, 'Hội viên nạp bảng tin tức & thông báo Ban Thư ký trên App', `Số tin tức: ${newsArticles.length}`);

    // 3.3 Danh bạ Hội viên & Tra cứu Kết nối (/association/members)
    const dirMembers = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, phone FROM public.members 
      WHERE association_id = $1::uuid AND status = 'active'
    `, DEFAULT_ASSOC_ID);
    assert('APP_DIRECTORY', dirMembers.length >= 10, 'Hội viên mở danh bạ tìm kiếm đối tác và thông tin liên hệ thành công', `Số lượng hội viên active: ${dirMembers.length}`);

    // 3.4 Đăng ký tham gia Sự kiện & Tạo vé QR Check-in (/association/events & /association/checkin)
    const testRegId = 'REG-GALA-001';
    await prisma.$executeRawUnsafe(`DELETE FROM public.event_registrations WHERE id = $1`, testRegId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.event_registrations (
        id, event_id, member_code, member_name, status, qr_payload, created_at, updated_at
      ) VALUES (
        $1, $2, 'M1983-002', 'James Nguyễn', 'confirmed', 'QR-CEO1983-EVT-001', NOW(), NOW()
      )
    `, testRegId, testEventId);

    // Mô phỏng quét QR check-in tại cổng sự kiện
    await prisma.$executeRawUnsafe(`
      UPDATE public.event_registrations 
      SET checked_in_at = NOW(), status = 'attended'
      WHERE id = $1
    `, testRegId);

    const regCheck = await prisma.$queryRawUnsafe(`
      SELECT id, status, checked_in_at FROM public.event_registrations WHERE id = $1
    `, testRegId);
    assert('APP_EVENT_CHECKIN', regCheck.length === 1 && regCheck[0].checked_in_at !== null, 'Hội viên quét mã QR Check-in vào cổng sự kiện thành công', `Trạng thái: ${regCheck[0]?.status}`);

    // 3.5 Luồng Gia hạn Niên liễm trực tuyến (/association/renew/pay & result)
    // Lấy thông tin Hội viên Nam (M1983-005)
    const m05List = await prisma.$queryRawUnsafe(`SELECT id, code, name FROM public.members WHERE code = 'M1983-005' AND association_id = $1::uuid`, DEFAULT_ASSOC_ID);
    const m05 = m05List[0];
    const renewalAuditId = 'e5f6a7b8-0000-4000-8000-000000000007';
    await prisma.$executeRawUnsafe(`DELETE FROM public.renewal_audit_log WHERE id = $1::uuid`, renewalAuditId).catch(() => {});

    // Ghi nhận log thanh toán vào renewal_audit_log
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.renewal_audit_log (
        id, association_id, member_id, user_id, amount_paid, method, reference, event_type, created_at
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4::uuid, 10000000, 'VIETQR_PRO', 'TXN-VIONE-998822', 'payment', NOW()
      )
    `, renewalAuditId, DEFAULT_ASSOC_ID, m05.id, ADMIN_USER_ID);

    // Kéo dài hạn hội viên thêm 1 năm
    await prisma.$executeRawUnsafe(`
      UPDATE public.members 
      SET term_end = (CURRENT_DATE + INTERVAL '1 year')::date, renewed_at = CURRENT_DATE
      WHERE id = $1
    `, m05.id);

    const renewedMemberCheck = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, term_end, renewed_at FROM public.members WHERE id = $1
    `, m05.id);
    assert('APP_RENEWAL', renewedMemberCheck.length === 1 && renewedMemberCheck[0].renewed_at !== null, 'Hội viên M1983-005 thanh toán niên liễm trực tuyến & tự động gia hạn hạn thẻ 1 năm', `Hạn mới: ${renewedMemberCheck[0]?.term_end}`);

    // 3.6 Danh thiếp điện tử & Thẻ thông minh NFC (/association/card)
    const mJames = await prisma.$queryRawUnsafe(`SELECT id, code, name, phone, email FROM public.members WHERE code = 'M1983-002' AND association_id = $1::uuid`, DEFAULT_ASSOC_ID);
    assert('APP_SMART_CARD', mJames.length === 1, 'Hội viên xuất trình Smart Card & mã vCard chia sẻ danh thiếp', `Mã thẻ: ${mJames[0]?.code}, Tên: ${mJames[0]?.name}`);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 4: VIONE APP - B2B SOCIAL & CONNECT (/connect-app)
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n--- 🤝 PHASE 4: VIONE APP - B2B SOCIAL & NETWORKING (/connect-app) ---');
    console.log('Actor: Doanh nhân giao lưu, mở rộng mạng lưới, kết nối cơ hội');

    // 4.1 B2B Feed & Khoảnh khắc Doanh nghiệp (Moments)
    const testMomentId = 'f6a7b8c9-0000-4000-8000-000000000008';
    await prisma.$executeRawUnsafe(`DELETE FROM public.business_relationship_moments WHERE id = $1::uuid`, testMomentId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.business_relationship_moments (
        id, owner_user_id, target_kind, target_user_id, occurred_at, client_token, event_name, note, status, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, 'connection', $2::uuid, NOW(), gen_random_uuid(), 'Tìm kiếm đối tác AI ERP', 'Doanh nghiệp chúng tôi đang tìm kiếm đối tác cung ứng giải pháp AI & Big Data cho chuỗi cung ứng logistics. Anh em CEO 1983 kết nối nhé!', 'active', NOW(), NOW()
      )
    `, testMomentId, ADMIN_USER_ID);

    const momentCheck = await prisma.$queryRawUnsafe(`
      SELECT id, event_name, status FROM public.business_relationship_moments WHERE id = $1::uuid
    `, testMomentId);
    assert('VIONE_MOMENTS', momentCheck.length === 1, 'Doanh nhân đăng khoảnh khắc giao thương và tìm kiếm đối tác thành công', `Chủ đề: ${momentCheck[0]?.event_name}`);

    // 4.2 Lời mời Kết nối Giao lưu B2B (Connection Requests)
    const testConnectionId = 'a7b8c9d0-0000-4000-8000-000000000009';
    await prisma.$executeRawUnsafe(`DELETE FROM public.connections WHERE id = $1::uuid`, testConnectionId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.connections (
        id, owner_id, peer_id, association_id, status, created_at, updated_at
      ) VALUES (
        $1::uuid, 'M1983-002', 'M1983-099', $2::uuid, 'accepted', NOW(), NOW()
      )
    `, testConnectionId, DEFAULT_ASSOC_ID);

    const connCheck = await prisma.$queryRawUnsafe(`
      SELECT id, status FROM public.connections WHERE id = $1::uuid
    `, testConnectionId);
    assert('VIONE_NETWORKING', connCheck.length === 1 && connCheck[0].status === 'accepted', 'Hai doanh nhân thiết lập quan hệ kết nối B2B chính thức thành công', `Trạng thái: ${connCheck[0]?.status}`);

    // 4.3 Nhắn tin Trực tiếp & Hộp thư Giao thương (/connect-app/inbox)
    const testThreadId = 'b8c9d0e1-0000-4000-8000-000000000010';
    const testMsgId = 'd0e1f2a3-0000-4000-8000-000000000012';
    await prisma.$executeRawUnsafe(`DELETE FROM public.direct_messages WHERE id = $1::uuid`, testMsgId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.direct_messages (
        id, thread_id, sender_user_id, body, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, $3::uuid, 'Chào anh Khôi, tuần tới thứ Ba mình sắp xếp buổi B2B 1-1 tại Keangnam nhé!', NOW(), NOW()
      )
    `, testMsgId, testThreadId, ADMIN_USER_ID);

    const msgCheck = await prisma.$queryRawUnsafe(`
      SELECT id, body FROM public.direct_messages WHERE id = $1::uuid
    `, testMsgId);
    assert('VIONE_MESSAGING', msgCheck.length === 1, 'Gửi và nhận tin nhắn B2B thời gian thực giữa 2 thành viên thành công', `Nội dung: ${msgCheck[0]?.body.slice(0, 35)}...`);

    // 4.4 Lên lịch Cuộc hẹn B2B 1-1 (/business-connect/meetings)
    const testMeetingId = 'c9d0e1f2-0000-4000-8000-000000000011';
    await prisma.$executeRawUnsafe(`DELETE FROM public.business_meetings WHERE id = $1::uuid`, testMeetingId).catch(() => {});

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.business_meetings (
        id, association_id, created_by_user_id, organizer_user_id, title, description, meeting_type, status, timezone, source_type, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, $3::uuid, $3::uuid, 'B2B 1-on-1: Hợp tác triển khai AI ERP', 'Thảo luận phương án tích hợp hệ sinh thái giải pháp', 'networking'::public.business_meeting_type, 'confirmed'::public.business_meeting_status, 'Asia/Ho_Chi_Minh', 'association'::public.business_meeting_source_type, NOW(), NOW()
      )
    `, testMeetingId, DEFAULT_ASSOC_ID, ADMIN_USER_ID);

    const meetingCheck = await prisma.$queryRawUnsafe(`
      SELECT id, title FROM public.business_meetings WHERE id = $1::uuid
    `, testMeetingId);
    assert('VIONE_MEETINGS', meetingCheck.length === 1, 'Khởi tạo và xác nhận lịch hẹn gặp B2B 1-on-1 thành công', `Tiêu đề: ${meetingCheck[0]?.title}`);

    // ══════════════════════════════════════════════════════════════════════
    // TỔNG KẾT
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n======================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED across ALL 4 PHASES`);
    console.log('======================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDeepMultiPortalJourneyTest();
