const { PrismaClient } = require('./packages/db');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' 
      AND (table_name LIKE '%transaction%' 
        OR table_name LIKE '%income%' 
        OR table_name LIKE '%expense%' 
        OR table_name LIKE '%fee%'
        OR table_name LIKE '%poll%'
        OR table_name LIKE '%notif%'
        OR table_name LIKE '%news%'
        OR table_name LIKE '%perk%')
    ORDER BY table_name;
  `);
  console.log("Matching tables:", tables);
}

main().catch(console.error).finally(() => prisma.$disconnect());
