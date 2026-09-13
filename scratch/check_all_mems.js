const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.$queryRaw`
    SELECT id, code, name, user_id, email, phone 
    FROM public.members 
    LIMIT 20
  `;
  console.log('All members in DB:', members);

  // Check all user_profiles or users
  const profiles = await prisma.$queryRaw`
    SELECT user_id, display_name 
    FROM public.user_profiles 
    LIMIT 10
  `;
  console.log('User profiles in DB:', profiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
