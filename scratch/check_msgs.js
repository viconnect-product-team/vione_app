const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mems = await prisma.$queryRaw`
    SELECT id, code, name, user_id, email, phone 
    FROM public.members 
    ORDER BY updated_at DESC LIMIT 10
  `;
  console.log('Recent 10 members in DB:', mems);

  const msgs = await prisma.$queryRaw`
    SELECT id, from_id, to_id, text, created_at 
    FROM public.messages 
    ORDER BY created_at DESC LIMIT 10
  `;
  console.log('Recent 10 messages in DB:', msgs);

  const invs = await prisma.$queryRaw`
    SELECT id, member_code, code, total_amount, status 
    FROM public.invoices 
    LIMIT 5
  `;
  console.log('Sample invoices in DB:', invs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
