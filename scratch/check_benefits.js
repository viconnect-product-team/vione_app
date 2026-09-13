const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'association_benefits'
  `);
  console.log('Columns of association_benefits:');
  console.table(cols);

  const rows = await prisma.$queryRawUnsafe(`
    SELECT * FROM public.association_benefits LIMIT 10
  `);
  console.log('Sample rows:');
  console.table(rows);
}

main().catch(console.error).finally(() => prisma.$disconnect());
