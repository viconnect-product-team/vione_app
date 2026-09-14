const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages'
  `;
  console.log('Columns of public.messages:', cols);

  const testUser = await prisma.$queryRaw`
    SELECT id, email FROM auth.users LIMIT 3
  `;
  console.log('Sample auth users:', testUser);
}

main().catch(console.error).finally(() => prisma.$disconnect());
