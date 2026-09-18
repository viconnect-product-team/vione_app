const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products'
    ORDER BY ordinal_position
  `;
  console.log('Columns of public.products:', JSON.stringify(cols, null, 2));

  const sample = await prisma.$queryRaw`SELECT * FROM public.products LIMIT 2`;
  console.log('Sample products:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
