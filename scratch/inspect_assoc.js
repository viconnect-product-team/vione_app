const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assocs = await prisma.$queryRaw`SELECT id, name, logo_url, tagline FROM public.associations`;
  console.log('Associations:', JSON.stringify(assocs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
