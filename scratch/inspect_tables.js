const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const res = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'business_meetings' AND is_nullable = 'NO'
  `);
  console.log("Meetings not null:", res);
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
