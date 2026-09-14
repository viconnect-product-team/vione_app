const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'a77c1760-db01-491d-ad6a-b07f93a40d80';
  
  // 1. Resolve member code
  const mems = await prisma.$queryRaw`
    SELECT m.code FROM public.members m
    WHERE m.user_id = ${userId}::uuid
       OR m.id = ${userId}::text
       OR LOWER(m.email) IN (SELECT LOWER(email) FROM auth.users WHERE id = ${userId}::uuid)
    LIMIT 1
  `;
  console.log('Resolved member for thuy:', mems);

  // 2. Test inserting a message from thuy to M1983-003
  const myCode = mems[0].code.toLowerCase();
  const peerCode = 'm1983-003';
  const text = 'Chào đối tác Uranus Tech!';

  const ins = await prisma.$executeRaw`
    INSERT INTO public.messages (id, from_id, to_id, text, created_at)
    VALUES (gen_random_uuid(), ${myCode}, ${peerCode}, ${text}, now())
  `;
  console.log('Insert message test:', ins);

  // 3. Query conversations for thuy
  const msgs = await prisma.$queryRaw`
    SELECT id, from_id, to_id, text, created_at, read_at
    FROM public.messages
    WHERE LOWER(from_id) = ${myCode} OR LOWER(to_id) = ${myCode}
    ORDER BY created_at DESC
  `;
  console.log('Thuy conversations in DB:', msgs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
