const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mems = await prisma.$queryRaw`
    SELECT code, name, email, user_id FROM public.members ORDER BY code ASC
  `;
  console.log('All 17 members:', mems);
}

main().catch(console.error).finally(() => prisma.$disconnect());
