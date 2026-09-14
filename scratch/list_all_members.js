const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mems = await prisma.$queryRaw`
    SELECT id, code, name, email, user_id, phone, association_id
    FROM public.members
    ORDER BY code ASC
  `;
  console.log('All members count:', mems.length);
  console.log('Sample members:', mems.slice(0, 10));
  
  // Check if thuylt313@gmail.com exists in members
  const thuy = mems.find(m => (m.email && m.email.toLowerCase().includes('thuy')) || (m.phone && m.phone.includes('313')));
  console.log('Found thuy member:', thuy);
}

main().catch(console.error).finally(() => prisma.$disconnect());
