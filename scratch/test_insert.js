const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const assoc = await prisma.$queryRaw`SELECT public.current_association_id() as id`;
    console.log('current_association_id():', assoc);
  } catch (e) {
    console.error('Error calling current_association_id():', e.message);
  }

  // Let's test insert into public.messages
  try {
    const res = await prisma.$executeRaw`
      INSERT INTO public.messages (id, from_id, to_id, text, created_at)
      VALUES (gen_random_uuid(), 'test_from', 'test_to', 'test text', now())
    `;
    console.log('Test insert result:', res);
  } catch (e) {
    console.error('Error inserting test message:', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
