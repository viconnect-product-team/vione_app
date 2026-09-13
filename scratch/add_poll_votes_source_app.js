const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding source_app column to public.poll_votes...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.poll_votes 
    ADD COLUMN IF NOT EXISTS source_app VARCHAR(50) DEFAULT 'vione_app';
  `);
  console.log('✓ source_app column added or already exists.');

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'poll_votes'
  `);
  console.log('Current poll_votes columns:', cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
