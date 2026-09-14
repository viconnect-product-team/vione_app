const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.$queryRaw`
    SELECT * FROM public.profiles WHERE id = 'a77c1760-db01-491d-ad6a-b07f93a40d80'::uuid
  `.catch(() => []);
  console.log('Profile:', profile);

  const u = await prisma.$queryRaw`
    SELECT * FROM public.users WHERE id = 'a77c1760-db01-491d-ad6a-b07f93a40d80'::uuid
  `.catch(() => []);
  console.log('Public user:', u);
}

main().catch(console.error).finally(() => prisma.$disconnect());
