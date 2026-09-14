const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.members.count();
  console.log('Total members count:', count);
  const sample = await prisma.members.findMany({ take: 5 });
  console.log('Sample members:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
