const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'business_notifications' AND is_nullable = 'NO'
  `);
  console.log('NOT NULL columns in business_notifications:', cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
