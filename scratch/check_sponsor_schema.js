const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sponsorsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'sponsors'
    ORDER BY ordinal_position;
  `);
  console.log('SPONSORS COLS:', JSON.stringify(sponsorsCols, null, 2));

  const pkgCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'sponsor_packages'
    ORDER BY ordinal_position;
  `);
  console.log('SPONSOR_PACKAGES COLS:', JSON.stringify(pkgCols, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
