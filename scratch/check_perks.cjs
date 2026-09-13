const { PrismaClient } = require('../packages/db');
const prisma = new PrismaClient();

async function main() {
  const perks = await prisma.$queryRawUnsafe('SELECT * FROM public.perks;');
  console.log("Perks count:", perks.length);
  console.log("Perks data:", perks);

  // Check if there are other tables like benefits or member_perks
  const memberPerks = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%perk%' OR table_name LIKE '%benefit%';
  `);
  console.log("Related tables:", memberPerks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
