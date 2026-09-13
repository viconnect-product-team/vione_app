const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const members = await p.members.findMany({ where: { code: 'M1983-002' } });
  console.log('Members with M1983-002:', members.map(m => ({ id: m.id, code: m.code, name: m.name, user_id: m.user_id })));
  await p.$disconnect();
}
main();
