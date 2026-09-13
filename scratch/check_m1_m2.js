const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m1 = await prisma.$queryRaw`
    SELECT id, from_id, to_id, text, created_at, read_at 
    FROM public.messages 
    WHERE to_id ILIKE '%001%' OR to_id ILIKE '%002%' OR from_id ILIKE '%001%' OR from_id ILIKE '%002%'
  `;
  console.log('Messages for 001/002:', m1);

  // Also check all distinct to_id and from_id in public.messages
  const distinctPeers = await prisma.$queryRaw`
    SELECT DISTINCT to_id, from_id FROM public.messages
  `;
  console.log('Distinct peers in messages:', distinctPeers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
