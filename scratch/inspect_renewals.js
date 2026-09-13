const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'association_benefits'
  `);
  console.log('association_benefits columns:', cols.map(c => `${c.column_name} (${c.data_type})`));

  const mems = await prisma.$queryRawUnsafe(`
    SELECT code, name, term_end, renewed_at, status FROM public.members WHERE association_id = 'c1983000-0000-4000-8000-000000001983'
  `);
  console.log('Members count:', mems.length);
  console.table(mems);
}

main().catch(console.error).finally(() => prisma.$disconnect());
