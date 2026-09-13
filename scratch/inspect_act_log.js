const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT category FROM public.activity_log
  `);
  console.log('Existing categories in activity_log:', cats);

  const constr = await prisma.$queryRawUnsafe(`
    SELECT pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conname = 'activity_log_category_check'
  `);
  console.log('activity_log_category_check constraint:', constr);
}

main().catch(console.error).finally(() => prisma.$disconnect());
