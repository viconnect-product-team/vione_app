const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifs = await prisma.$queryRaw`SELECT id, title, status, audience, app_scope, target_app, created_at FROM public.notifications ORDER BY created_at DESC LIMIT 20`.catch(e => ({ error: e.message }));
  console.log('--- public.notifications ---');
  console.log(JSON.stringify(notifs, null, 2));

  const bizNotifs = await prisma.$queryRaw`SELECT id, title_key, notification_kind, recipient_user_id, created_at FROM public.business_notifications ORDER BY created_at DESC LIMIT 10`.catch(e => ({ error: e.message }));
  console.log('--- public.business_notifications ---');
  console.log(JSON.stringify(bizNotifs, null, 2));

  const memNotifs = await prisma.$queryRaw`SELECT id, title, ref_type, recipient_id, created_at FROM public.member_notifications ORDER BY created_at DESC LIMIT 10`.catch(e => ({ error: e.message }));
  console.log('--- public.member_notifications ---');
  console.log(JSON.stringify(memNotifs, null, 2));

  const events = await prisma.$queryRaw`SELECT id, title, created_at FROM public.events ORDER BY created_at DESC LIMIT 5`.catch(e => ({ error: e.message }));
  console.log('--- public.events ---');
  console.log(JSON.stringify(events, null, 2));
}

main().finally(() => prisma.$disconnect());
