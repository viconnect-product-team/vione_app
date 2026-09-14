const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const userId = '00000000-0000-4000-8000-000000000001';
  try {
    const broadcast = await prisma.$queryRaw`
      SELECT id, title, body, audience, sent_at, created_at, app_scope, target_app
      FROM public.notifications
      WHERE status = 'sent'
      ORDER BY COALESCE(sent_at, created_at) DESC
      LIMIT 50
    `;
    console.log('Broadcast ok:', broadcast.length);
  } catch (e) {
    console.error('Broadcast failed:', e.message);
  }

  try {
    const memNotif = await prisma.$queryRaw`
      SELECT id, title, body, created_at, read, dismissed, ref_type, ref_id
      FROM public.member_notifications
      LIMIT 50
    `;
    console.log('memNotif ok:', memNotif.length);
  } catch (e) {
    console.error('memNotif failed:', e.message);
  }

  try {
    const bizNotif = await prisma.$queryRaw`
      SELECT id, title_key, body_key, safe_display_data, notification_kind, created_at, read_at
      FROM public.business_notifications
      LIMIT 40
    `;
    console.log('bizNotif ok:', bizNotif.length);
  } catch (e) {
    console.error('bizNotif failed:', e.message);
  }

  try {
    const events = await prisma.$queryRaw`
      SELECT id, name, date, location, type, status, created_at
      FROM public.events
      LIMIT 20
    `;
    console.log('events ok:', events.length);
  } catch (e) {
    console.error('events failed:', e.message);
  }

  try {
    const opps = await prisma.$queryRaw`
      SELECT id, title, description, type, budget_min, budget_max, region, industry, deadline, status, created_at, claimed_by_name
      FROM public.opportunities
      LIMIT 20
    `;
    console.log('opps ok:', opps.length);
  } catch (e) {
    console.error('opps failed:', e.message);
  }
}
main().finally(() => prisma.$disconnect());