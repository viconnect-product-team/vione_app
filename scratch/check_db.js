const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c2 = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'members'
  `;
  console.log('members all cols:', c2.map(c => c.column_name));
}

main().finally(() => prisma.$disconnect());
