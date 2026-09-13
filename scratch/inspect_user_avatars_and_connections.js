const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  try {
    console.log('=== USERS ===');
    const users = await prisma.$queryRaw`
      SELECT id, email, raw_user_meta_data FROM auth.users WHERE id IN (
        '00000000-0000-4000-8000-000000000001'::uuid,
        '00000000-0000-4000-8000-000000000002'::uuid,
        '00000000-0000-4000-8000-000000000003'::uuid
      )
    `.catch(e => e.message);
    console.log('auth.users:', JSON.stringify(users, null, 2));

    console.log('=== BUSINESS IDENTITIES ===');
    const bis = await prisma.$queryRaw`
      SELECT id, owner_user_id, display_name, headline, job_title, avatar_url, company_name FROM public.business_identities LIMIT 10
    `;
    console.log('business_identities:', bis);

    console.log('=== USER PROFILES ===');
    const ups = await prisma.$queryRaw`
      SELECT user_id, display_name, professional_title, avatar_url, company_name FROM public.user_profiles LIMIT 10
    `;
    console.log('user_profiles:', ups);

    console.log('=== VIONE USERS ===');
    const vus = await prisma.$queryRaw`
      SELECT id, name, full_name, avatar, avatar_url, role FROM public.vione_users LIMIT 10
    `.catch(e => e.message);
    console.log('vione_users:', vus);

    console.log('=== USER CONNECTIONS ===');
    const conns = await prisma.$queryRaw`
      SELECT id, requester_user_id, recipient_user_id, status, source_type, created_at FROM public.user_connections ORDER BY created_at DESC LIMIT 10
    `.catch(e => e.message);
    console.log('user_connections:', conns);

    console.log('=== BUSINESS NOTIFICATIONS ===');
    const notifs = await prisma.$queryRaw`
      SELECT id, recipient_user_id, notification_kind, title_key, safe_display_data, status, created_at FROM public.business_notifications ORDER BY created_at DESC LIMIT 10
    `.catch(e => e.message);
    console.log('business_notifications:', notifs);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
