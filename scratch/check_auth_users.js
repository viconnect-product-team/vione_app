const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`
    SELECT id, email FROM auth.users
  `;
  console.log('All auth.users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
