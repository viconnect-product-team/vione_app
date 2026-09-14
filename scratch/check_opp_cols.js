const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'opportunities'
    ORDER BY column_name
  `;
  console.log(JSON.stringify(cols, null, 2));

  const sample = await prisma.$queryRaw`SELECT * FROM public.opportunities LIMIT 2`;
  console.log('Sample opp:', JSON.stringify(sample, null, 2));
}
main().finally(() => prisma.$disconnect());