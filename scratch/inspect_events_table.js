const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events'
  `);
  console.log('events columns:', cols.map(c => c.column_name));

  const sampleEvent = await prisma.$queryRawUnsafe(`SELECT * FROM public.events LIMIT 1`);
  console.log('sample event:', sampleEvent);
}

main().finally(() => prisma.$disconnect());
