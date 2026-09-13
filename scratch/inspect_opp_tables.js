const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oppTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND (table_name LIKE '%opp%' OR table_name LIKE '%b2b%' OR table_name LIKE '%lead%')
  `);
  console.log('Opportunity / B2B tables:', oppTables);

  for (const t of oppTables) {
    const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM public."${t.table_name}"`);
    console.log(`Table ${t.table_name} count:`, count);
    const sample = await prisma.$queryRawUnsafe(`SELECT * FROM public."${t.table_name}" LIMIT 2`);
    console.log(`Sample from ${t.table_name}:`, sample);
  }
}

main().finally(() => prisma.$disconnect());
