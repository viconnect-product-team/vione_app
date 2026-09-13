const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const members = await p.members.findMany({ 
    where: { association_id: 'c1983000-0000-4000-8000-000000001983' },
    select: { id: true, code: true, name: true, user_id: true }
  });
  console.log('All members in c1983000:', members);
  await p.$disconnect();
}
main();
