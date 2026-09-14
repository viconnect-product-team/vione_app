const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'members'
  `;
  console.log('Columns of public.members:', cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
