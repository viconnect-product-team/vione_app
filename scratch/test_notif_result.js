const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const userId = '00000000-0000-4000-8000-000000000001';
  const members = await prisma.$queryRaw`SELECT id FROM public.members WHERE user_id = ${userId}::uuid`.catch(() => []);
  const memberIds = members.map(m => m.id);

  const [broadcast, personal, events, opportunities] = await Promise.all([
    prisma.$queryRaw`
      SELECT id, title, body, audience, sent_at, created_at, app_scope, target_app
      FROM public.notifications
      WHERE status = 'sent' OR status = 'active' OR status IS NULL
      ORDER BY COALESCE(sent_at, created_at) DESC
      LIMIT 50
    `.catch(() => []),
    prisma.$queryRaw`
      SELECT id, title, body, created_at, read, dismissed, ref_type, ref_id
      FROM public.member_notifications
      WHERE recipient_id::text = ANY(${memberIds}::text[]) OR recipient_id::text = ${userId}::text
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []),
    prisma.$queryRaw`
      SELECT id, name, date, location, type, status, created_at
      FROM public.events
      WHERE status IN ('published', 'upcoming', 'ongoing', 'active') OR status IS NULL
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => []),
    prisma.$queryRaw`
      SELECT id, title, description, type, budget_min, budget_max, region, industry, deadline, status, created_at, claimed_by_name
      FROM public.opportunities
      WHERE status IN ('open', 'published', 'active') OR status IS NULL
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => [])
  ]);

  console.log('Broadcast count:', broadcast.length);
  console.log('Personal count:', personal.length);
  console.log('Events count:', events.length);
  console.log('Opps count:', opportunities.length);
  console.log('Total notifications:', broadcast.length + personal.length + events.length + opportunities.length);
}
main().finally(() => prisma.$disconnect());