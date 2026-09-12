const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding columns to public.sponsors and public.sponsor_packages...');

  // Add columns to sponsors if not exists
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.sponsors 
    ADD COLUMN IF NOT EXISTS sponsor_type VARCHAR(50) DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS package_type VARCHAR(50) DEFAULT 'cash',
    ADD COLUMN IF NOT EXISTS in_kind_description TEXT DEFAULT NULL;
  `);
  console.log('Updated public.sponsors columns.');

  // Add columns to sponsor_packages if not exists
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.sponsor_packages 
    ADD COLUMN IF NOT EXISTS package_type VARCHAR(50) DEFAULT 'cash',
    ADD COLUMN IF NOT EXISTS in_kind_description TEXT DEFAULT NULL;
  `);
  console.log('Updated public.sponsor_packages columns.');

  // Verify
  const sponsorsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'sponsors'
    ORDER BY ordinal_position;
  `);
  console.log('Verified sponsors columns:', sponsorsCols.map(c => c.column_name));

  const pkgCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'sponsor_packages'
    ORDER BY ordinal_position;
  `);
  console.log('Verified sponsor_packages columns:', pkgCols.map(c => c.column_name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
