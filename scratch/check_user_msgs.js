const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userMsgs = await prisma.$queryRaw`
    SELECT id, from_id, to_id, text, created_at 
    FROM public.messages 
    WHERE from_id != 'admin'
    ORDER BY created_at DESC
  `;
  console.log('Messages where from_id != admin:', userMsgs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
