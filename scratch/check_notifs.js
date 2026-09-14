const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rows = await prisma.$queryRaw`SELECT * FROM public.notifications`;
  console.log('Notifications count:', rows.length);
  console.log(JSON.stringify(rows, null, 2));

  const memNotifs = await prisma.$queryRaw`SELECT * FROM public.member_notifications LIMIT 5`;
  console.log('Member notifs:', JSON.stringify(memNotifs, null, 2));
}
main().finally(() => prisma.$disconnect());