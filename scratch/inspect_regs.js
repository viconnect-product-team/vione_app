const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString(); };

async function main() {
  const regs = await prisma.$queryRaw`SELECT * FROM public.event_registrations LIMIT 10`;
  console.log('Event Registrations:', JSON.stringify(regs, null, 2));

  const members = await prisma.$queryRaw`SELECT id, code, name, email, user_id FROM public.members LIMIT 10`;
  console.log('Members:', JSON.stringify(members, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
