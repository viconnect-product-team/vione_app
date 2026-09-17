const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cols = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND table_schema = 'public'");
  console.log('members cols:', cols.map(c => c.column_name));
  const row2 = await prisma.$queryRawUnsafe("SELECT * FROM public.members WHERE user_id = '00000000-0000-4000-8000-000000000002'::uuid");
  console.log('row2:', row2);
}
main().catch(console.error).finally(() => prisma.$disconnect());
