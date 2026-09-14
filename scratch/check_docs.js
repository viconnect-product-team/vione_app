const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const docs = await prisma.$queryRaw`SELECT * FROM public.documents LIMIT 10`;
  console.log('Docs count:', docs.length);
  console.log(JSON.stringify(docs, null, 2));
}
main().finally(() => prisma.$disconnect());